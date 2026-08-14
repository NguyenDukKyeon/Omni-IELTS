import test from 'node:test';
import assert from 'node:assert/strict';
import * as progress from '../src/progress.js';
import {
  buildActivityMap,
  buildHeatmapDays,
  calculateKnowledgeStrength,
  calculateSkillCoverage,
  calculateStreak,
  summarizeActivity,
  summarizeReviewQuality
} from '../src/progress.js';
import { sanitizeCardInput, updateCardAfterRating } from '../src/learning.js';
import { decideEvidence } from '../src/evidence-policy.js';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { buildLearningEventRecords } from '../src/event-repository.js';

const DAY=86_400_000;
const noonUtc=date=>Date.parse(`${date}T12:00:00Z`);

function canonicalDecisionEvent(suffix,{
  rating='good',
  skill='recall',
  kind='typing',
  now=1_700_000_000_000,
  exposure={},
  cardId=`card-${suffix}`,
  timezone='UTC'
}={}){
  const card={id:cardId,senseId:`sense-${cardId}`,front:'durable',back:'bền',type:'word'};
  const envelope=buildCoreEvidenceEnvelope({
    card,
    rating,
    step:{id:`activity-${suffix}`,kind,skill,receiptId:`receipt-${suffix}`},
    session:{id:`session-${suffix}`,mode:'today',timezone},
    exposure,
    now
  });
  const decision=decideEvidence({
    attempt:envelope.attempt,
    activity:envelope.activitySpec,
    verification:envelope.verification
  });
  const record=buildLearningEventRecords({...envelope,decision}).find(row=>row.eventType==='evidence-decided');
  assert.ok(record,'canonical fixture must contain evidence-decided record');
  assert.equal(record.kind,'canonical-learning-event');
  return record;
}

test('activity ignores assisted corrective steps and streak counts consecutive days',()=>{
  const now=noonUtc('2026-07-27');
  const events=[
    {reviewedAt:now-2*DAY,rating:'good'},
    {reviewedAt:now-DAY,rating:'hard'},
    {reviewedAt:now-DAY+1000,rating:'again',assisted:true},
    {reviewedAt:now,rating:'good'}
  ];
  const map=buildActivityMap(events,'UTC');
  assert.equal(map.get('2026-07-26'),1);
  assert.equal(calculateStreak(map,now,'UTC'),3);
});

test('streak tolerates today not studied but stops after a true gap',()=>{
  const now=noonUtc('2026-07-27');
  const consecutive=buildActivityMap([{reviewedAt:now-DAY},{reviewedAt:now-2*DAY}],'UTC');
  const gap=buildActivityMap([{reviewedAt:now-2*DAY}],'UTC');
  assert.equal(calculateStreak(consecutive,now,'UTC'),2);
  assert.equal(calculateStreak(gap,now,'UTC'),0);
});

test('skill coverage exposes unreviewed required skills separately from strength',()=>{
  const start=1_700_000_000_000;
  let card=sanitizeCardInput({front:'reliable',back:'đáng tin',createdAt:start,learningGoal:'active',status:'learning'});
  card=updateCardAfterRating(card,'good',start,'recognition').card;
  const coverage=calculateSkillCoverage([card]);
  assert.equal(coverage.required,4);
  assert.equal(coverage.reviewed,1);
  assert.equal(coverage.percent,25);
  const strength=calculateKnowledgeStrength([card],start+1_000);
  assert.equal(strength.sampleSize,1);
  assert.ok(strength.percent>=0&&strength.percent<=100);
});

test('knowledge strength reports an explicit no-evidence state',()=>{
  const knowledge=calculateKnowledgeStrength([sanitizeCardInput({front:'new',back:'mới'})]);
  assert.deepEqual(knowledge,{percent:0,sampleSize:0,label:'Chưa đủ dữ liệu'});
});

test('review quality treats Hard as successful and Again as failure',()=>{
  const quality=summarizeReviewQuality([
    {rating:'hard',skill:'recall'},
    {rating:'good',skill:'recall'},
    {rating:'again',skill:'listening'},
    {rating:'again',skill:'recall',assisted:true}
  ]);
  assert.equal(quality.reviews,3);
  assert.equal(quality.successful,2);
  assert.equal(quality.again,1);
  assert.equal(quality.successRate,67);
  assert.equal(quality.bySkill.recall.successRate,100);
});

test('heatmap and activity summary remain bounded and deterministic',()=>{
  const now=noonUtc('2026-07-27');
  const events=Array.from({length:5},(_,index)=>({reviewedAt:now-index*1000}));
  const heatmap=buildHeatmapDays(events,12,now,'UTC');
  assert.equal(heatmap.length,84);
  assert.equal(heatmap.at(-1).count,5);
  assert.equal(heatmap.at(-1).level,2);
  assert.ok(heatmap.every(day=>day.level>=0&&day.level<=4));
  const summary=summarizeActivity([{reviewedAt:now},{reviewedAt:now-DAY},{reviewedAt:now-DAY}],now,'UTC');
  assert.equal(summary.reviewsLast7,3);
  assert.equal(summary.activeDaysLast7,2);
  assert.equal(summary.streak,2);
});

test('P7-00 canonical metrics and WeaknessProfile honor nested evidence, determinism and uncertainty',()=>{
  const firstAt=Date.parse('2026-03-07T12:00:00Z');
  const good=canonicalDecisionEvent('good',{rating:'good',now:firstAt,cardId:'card-shared'});
  const again=canonicalDecisionEvent('again',{rating:'again',now:firstAt+DAY,cardId:'card-shared'});
  const assisted=canonicalDecisionEvent('assisted',{rating:'good',now:firstAt+2*DAY,cardId:'card-assisted',exposure:{hintUsed:true}});

  const predecessorQuality=summarizeReviewQuality([good]);
  assert.equal(predecessorQuality.reviews,1,'canonical evidence-decided payload must be counted by progress');
  assert.equal(predecessorQuality.denominator,1,'canonical review summary must expose its denominator');

  assert.equal(typeof progress.reduceCanonicalLearningMetrics,'function','production progress seam must expose metrics reducer');
  assert.equal(typeof progress.buildWeaknessProfile,'function','production progress seam must expose WeaknessProfile projection');

  const metrics=progress.reduceCanonicalLearningMetrics([good,again,assisted,good],{timeZone:'UTC'});
  assert.equal(metrics.denominator,2,'duplicate replay and ineligible evidence must not inflate denominator');
  assert.equal(metrics.numerator,1);
  assert.equal(metrics.sampleSize,2);
  assert.equal(metrics.provenance.length,2);
  assert.equal(metrics.excluded.count,1);
  assert.equal(metrics.duplicatesDropped,1);
  assert.equal(metrics.surfaceTotals.Core,2);
  assert.equal(metrics.metrics.retrieval.status,'MEASURED');
  assert.equal(metrics.metrics.retrieval.numerator,1);
  assert.equal(metrics.metrics.retrieval.denominator,2);
  assert.equal(metrics.metrics.coverage.status,'INSUFFICIENT_DATA');
  assert.equal(Object.prototype.hasOwnProperty.call(metrics.metrics.coverage,'value'),false,'unavailable metrics must not fabricate measured zero');
  assert.equal(metrics.metrics.activeDays.status,'MEASURED');
  assert.equal(metrics.metrics.activeDays.value,2);

  const reordered=progress.reduceCanonicalLearningMetrics([assisted,good,again,good],{timeZone:'UTC'});
  assert.deepEqual(reordered,metrics,'equivalent event sets must reduce deterministically regardless of input order');

  const empty=progress.reduceCanonicalLearningMetrics([],{timeZone:'UTC'});
  assert.equal(empty.status,'INSUFFICIENT_DATA');
  assert.equal(empty.denominator,0);

  const dstBefore=canonicalDecisionEvent('dst-before',{now:Date.parse('2026-03-08T06:30:00Z'),cardId:'card-dst-a'});
  const dstAfter=canonicalDecisionEvent('dst-after',{now:Date.parse('2026-03-08T07:30:00Z'),cardId:'card-dst-b'});
  const dst=progress.reduceCanonicalLearningMetrics([dstBefore,dstAfter],{timeZone:'America/New_York'});
  assert.equal(dst.metrics.activeDays.value,1,'DST transition must preserve deterministic local-day boundaries');

  const sparseProfile=progress.buildWeaknessProfile([good],{timeZone:'UTC'});
  assert.equal(sparseProfile.insufficientData,true);
  assert.equal(sparseProfile.uncertainty,'high');
  assert.ok(sparseProfile.reasonCodes.includes('SPARSE_EVIDENCE'));
  assert.equal(sparseProfile.denominator,1);
  assert.equal(sparseProfile.sampleSize,1);

  const third=canonicalDecisionEvent('third',{rating:'good',now:firstAt+2*DAY,cardId:'card-shared'});
  const conflictProfile=progress.buildWeaknessProfile([third,again,good],{timeZone:'UTC'});
  assert.equal(conflictProfile.insufficientData,false);
  assert.equal(conflictProfile.uncertainty,'high');
  assert.ok(conflictProfile.reasonCodes.includes('CONFLICTING_EVIDENCE'));
  assert.equal(conflictProfile.conflictHandling.result,'CONFLICT_PRESENT');
  assert.equal(Array.isArray(conflictProfile.canonicalInputRefs),true);
  assert.equal(conflictProfile.canonicalInputRefs.length,3);
  assert.match(conflictProfile.inputDigest,/^fnv1a64:/);
  assert.match(conflictProfile.outputDigest,/^fnv1a64:/);
  assert.equal(Object.prototype.hasOwnProperty.call(conflictProfile,'ready'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(conflictProfile,'bandEstimate'),false);

  const replayProfile=progress.buildWeaknessProfile([good,third,again],{timeZone:'UTC'});
  assert.deepEqual(replayProfile,conflictProfile,'WeaknessProfile must be deterministic for the same canonical inputs and versions');
});
