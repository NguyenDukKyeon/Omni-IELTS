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
import { buildIeltsEvidenceEnvelope } from '../src/ielts-domain.js';
import { buildV10CoachingEnvelope } from '../src/v10-contracts.js';
import { buildLearningEventRecords, validateLearningEventRecord } from '../src/event-repository.js';

const DAY=86_400_000;
const noonUtc=date=>Date.parse(`${date}T12:00:00Z`);

function decisionRecord(envelope){
  const record=buildLearningEventRecords(envelope).find(row=>row.eventType==='evidence-decided');
  assert.ok(record,'canonical fixture must contain evidence-decided record');
  assert.equal(record.kind,'canonical-learning-event');
  assert.equal(validateLearningEventRecord(record).valid,true,'canonical decision event must validate');
  return record;
}

function coreDecisionEvent(suffix,{
  rating='good',
  skill='recall',
  kind='typing',
  now=Date.parse('2026-03-07T12:00:00Z'),
  exposure={},
  cardId=`core-card-${suffix}`,
  timezone='UTC'
}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:cardId,senseId:`sense-${cardId}`,front:'durable',back:'bền',type:'word'},
    rating,
    step:{id:`core-activity-${suffix}`,kind,skill,receiptId:`core-receipt-${suffix}`},
    session:{id:`core-session-${suffix}`,mode:'today',timezone},
    exposure,
    now
  });
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  return{record:decisionRecord({...envelope,decision}),decision};
}

function ieltsDecisionEvent(suffix,{result='correct'}={}){
  const envelope=buildIeltsEvidenceEnvelope({
    activityId:`ielts-activity-${suffix}`,
    receiptId:`ielts-receipt-${suffix}`,
    activityType:'dictation',
    cardId:`ielts-card-${suffix}`,
    skill:'listening',
    sourceId:`ielts-source:controlled-${suffix}`,
    sourceRevision:`ielts-revision:${suffix}:1`,
    result,
    sourceVerified:true,
    assistance:{}
  });
  return{record:decisionRecord(envelope),decision:envelope.decision};
}

function v10DecisionEvent(suffix,{result='correct'}={}){
  const envelope=buildV10CoachingEnvelope({
    activityId:`v10-activity-${suffix}`,
    receiptId:`v10-receipt-${suffix}`,
    activityType:'dictation',
    sentence:{id:`sentence-${suffix}`,text:'A controlled sentence.',startMs:0,endMs:1200,verified:true},
    sourceId:`v10-source:controlled-${suffix}`,
    cardId:`v10-card-${suffix}`,
    skill:'listening',
    result,
    assistance:{}
  });
  return{record:decisionRecord(envelope),decision:envelope.decision};
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

test('P7-00 canonical cross-surface metrics reconcile Core IELTS and V10 without promoting coaching evidence',()=>{
  const firstAt=Date.parse('2026-03-07T12:00:00Z');
  const coreGood=coreDecisionEvent('good',{rating:'good',now:firstAt,cardId:'core-shared'});
  const coreAgain=coreDecisionEvent('again',{rating:'again',now:firstAt+DAY,cardId:'core-shared'});
  const coreAssisted=coreDecisionEvent('assisted',{rating:'good',now:firstAt+2*DAY,exposure:{hintUsed:true},cardId:'core-assisted'});
  const ieltsGood=ieltsDecisionEvent('good');
  const v10Coaching=v10DecisionEvent('coaching');

  assert.equal(coreGood.decision.eligible,true,'controlled Core decision must be positively eligible');
  assert.equal(ieltsGood.decision.eligible,true,'controlled IELTS decision must be positively eligible');
  assert.equal(v10Coaching.decision.eligible,false,'V10 coaching must remain outside the positive denominator');
  assert.equal(v10Coaching.decision.reason,'assistance-exposed','V10 exclusion reason must preserve current EvidencePolicy semantics');
  assert.equal(coreAssisted.decision.eligible,false);
  assert.equal(coreAssisted.decision.reason,'assistance-exposed');

  const predecessorQuality=summarizeReviewQuality([coreGood.record]);
  assert.equal(predecessorQuality.reviews,1,'canonical evidence-decided payload must be counted by progress');
  assert.equal(predecessorQuality.denominator,1,'canonical review summary must expose its denominator');

  assert.equal(typeof progress.reduceCanonicalLearningMetrics,'function','production progress seam must expose canonical metrics reducer');
  assert.equal(typeof progress.buildWeaknessProfile,'function','production progress seam must expose WeaknessProfile projection');

  const controlled=[coreGood.record,coreAgain.record,ieltsGood.record,v10Coaching.record,coreAssisted.record,coreGood.record];
  const metrics=progress.reduceCanonicalLearningMetrics(controlled,{timeZone:'UTC'});

  assert.equal(metrics.totalCanonicalDecisions,5,'duplicate replay must not inflate canonical decision total');
  assert.equal(metrics.duplicatesDropped,1);
  assert.equal(metrics.denominator,3,'only eligible Core/Core/IELTS decisions contribute to positive denominator');
  assert.equal(metrics.numerator,2);
  assert.equal(metrics.sampleSize,3);
  assert.equal(metrics.excluded.count,2);
  assert.equal(metrics.surfaceTotals.Core,3);
  assert.equal(metrics.surfaceTotals.IELTS,1);
  assert.equal(metrics.surfaceTotals.V10,1);
  assert.equal(metrics.surfaceTotals.Unknown,0);
  assert.equal(metrics.eligibleSurfaceTotals.Core,2);
  assert.equal(metrics.eligibleSurfaceTotals.IELTS,1);
  assert.equal(metrics.eligibleSurfaceTotals.V10,0);
  assert.equal(metrics.excludedSurfaceTotals.Core,1);
  assert.equal(metrics.excludedSurfaceTotals.V10,1);
  assert.equal(metrics.excluded.byReason['assistance-exposed'],2);
  assert.equal(metrics.denominator+metrics.excluded.count,metrics.totalCanonicalDecisions);
  assert.equal(metrics.provenance.length,metrics.totalCanonicalDecisions,'every included/excluded record must remain source-drillable');
  assert.equal(metrics.provenance.filter(row=>row.included).length,metrics.denominator);
  assert.equal(metrics.reconciliation.percent,100);
  assert.equal(metrics.reconciliation.result,'RECONCILED');

  for(const domain of ['retrieval','delayedSuccess','coverage','stability','recurrence','contentCompletion','activeDays']){
    assert.ok(metrics.metrics[domain],`required metric domain ${domain} must be explicit`);
    assert.ok(['MEASURED','INSUFFICIENT_DATA'].includes(metrics.metrics[domain].status));
  }
  assert.equal(metrics.metrics.retrieval.status,'MEASURED');
  assert.equal(metrics.metrics.retrieval.numerator,2);
  assert.equal(metrics.metrics.retrieval.denominator,3);
  assert.equal(metrics.metrics.coverage.status,'INSUFFICIENT_DATA');
  assert.equal(Object.prototype.hasOwnProperty.call(metrics.metrics.coverage,'value'),false,'missing coverage evidence must not be fabricated as measured zero');

  const reordered=progress.reduceCanonicalLearningMetrics([v10Coaching.record,coreAssisted.record,ieltsGood.record,coreAgain.record,coreGood.record,coreGood.record],{timeZone:'UTC'});
  assert.deepEqual(reordered,metrics,'equivalent canonical event sets must reduce deterministically regardless of input order');

  const empty=progress.reduceCanonicalLearningMetrics([],{timeZone:'UTC'});
  assert.equal(empty.status,'INSUFFICIENT_DATA');
  assert.equal(empty.denominator,0);
  assert.equal(empty.totalCanonicalDecisions,0);

  const dstBefore=coreDecisionEvent('dst-before',{now:Date.parse('2026-03-08T06:30:00Z'),cardId:'core-dst-a'}).record;
  const dstAfter=coreDecisionEvent('dst-after',{now:Date.parse('2026-03-08T07:30:00Z'),cardId:'core-dst-b'}).record;
  const dst=progress.reduceCanonicalLearningMetrics([dstBefore,dstAfter],{timeZone:'America/New_York'});
  assert.equal(dst.metrics.activeDays.status,'MEASURED');
  assert.equal(dst.metrics.activeDays.value,1,'DST transition must preserve deterministic local-day boundaries');

  const sparseProfile=progress.buildWeaknessProfile([coreGood.record],{timeZone:'UTC'});
  assert.equal(sparseProfile.insufficientData,true);
  assert.equal(sparseProfile.uncertainty,'high');
  assert.ok(sparseProfile.reasonCodes.includes('SPARSE_EVIDENCE'));
  assert.equal(sparseProfile.denominator,1);
  assert.equal(sparseProfile.sampleSize,1);
  assert.match(sparseProfile.inputDigest,/^fnv1a64:/);
  assert.match(sparseProfile.outputDigest,/^fnv1a64:/);

  const third=coreDecisionEvent('third',{rating:'good',now:firstAt+2*DAY,cardId:'core-shared'}).record;
  const conflictProfile=progress.buildWeaknessProfile([third,coreAgain.record,coreGood.record],{timeZone:'UTC'});
  assert.equal(conflictProfile.insufficientData,false);
  assert.equal(conflictProfile.uncertainty,'high');
  assert.ok(conflictProfile.reasonCodes.includes('CONFLICTING_EVIDENCE'));
  assert.equal(conflictProfile.conflictHandling.result,'CONFLICT_PRESENT');
  assert.equal(conflictProfile.canonicalInputRefs.length,3);
  assert.equal(Object.prototype.hasOwnProperty.call(conflictProfile,'ready'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(conflictProfile,'bandEstimate'),false);

  const replayProfile=progress.buildWeaknessProfile([coreGood.record,third,coreAgain.record],{timeZone:'UTC'});
  assert.deepEqual(replayProfile,conflictProfile,'WeaknessProfile must be deterministic for the same canonical inputs and versions');
});
