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
import { learningContractDigest } from '../src/learning-contracts.js';
import { validateWeaknessProfile } from '../src/weakness-profile.js';

const DAY=86_400_000;
const noonUtc=date=>Date.parse(`${date}T12:00:00Z`);
const skillObservation=(profile,skill)=>profile.observations.bySkill.find(row=>row.skill===skill);

function evidenceDecisionRecord(envelope){
  const record=buildLearningEventRecords(envelope).find(item=>item.eventType==='evidence-decided');
  assert.ok(record,'fixture must produce one canonical evidence-decided record');
  assert.equal(validateLearningEventRecord(record).valid,true,'fixture evidence-decided record must validate canonically');
  return record;
}

function coreCanonicalEvent(id,{rating='good',now=Date.parse('2026-08-01T12:00:00Z')}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:`core-card-${id}`,senseId:`sense-${id}`,front:'reliable',back:'đáng tin',type:'word'},
    rating,
    step:{id:`core-activity-${id}`,kind:'typing',skill:'recall',receiptId:`core-receipt-${id}`},
    session:{id:`core-session-${id}`,mode:'today',timezone:'UTC'},
    exposure:{},
    now
  });
  const decision=decideEvidence({
    attempt:envelope.attempt,
    activity:envelope.activitySpec,
    verification:envelope.verification
  });
  return{record:evidenceDecisionRecord({...envelope,decision}),decision};
}

function ieltsCanonicalEvent(id,{result='correct'}={}){
  const envelope=buildIeltsEvidenceEnvelope({
    activityId:`ielts-activity-${id}`,
    receiptId:`ielts-receipt-${id}`,
    activityType:'dictation',
    cardId:`ielts-card-${id}`,
    skill:'listening',
    sourceId:`ielts-source:stage1-${id}`,
    sourceRevision:`ielts-source-revision:${id}:1`,
    result,
    sourceVerified:true,
    assistance:{}
  });
  return{record:evidenceDecisionRecord(envelope),decision:envelope.decision};
}

function v10CanonicalCoachingEvent(id){
  const envelope=buildV10CoachingEnvelope({
    activityId:`v10-activity-${id}`,
    receiptId:`v10-receipt-${id}`,
    activityType:'dictation',
    sentence:{id:`sentence-${id}`,text:'A controlled sentence for diagnostics.',startMs:0,endMs:1600,verified:true},
    sourceId:`v10-source:stage1-${id}`,
    cardId:`v10-card-${id}`,
    skill:'listening',
    result:'correct',
    assistance:{}
  });
  return{record:evidenceDecisionRecord(envelope),decision:envelope.decision};
}

function identityCollision(record){
  const payload={...structuredClone(record.payload),successful:!record.payload.successful};
  const payloadDigest=learningContractDigest(payload);
  const eventDigest=learningContractDigest({
    schemaVersion:record.schemaVersion,
    eventType:record.eventType,
    receiptId:record.receiptId,
    activitySpecId:record.activitySpecId,
    runId:record.runId,
    attemptId:record.attemptId,
    payloadDigest
  });
  const collision=Object.freeze({...record,payload,payloadDigest,eventDigest});
  assert.equal(validateLearningEventRecord(collision).valid,true,'identity collision fixture must remain individually canonical');
  assert.notEqual(collision.eventDigest,record.eventDigest);
  return collision;
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

test('canonical progress projection reconciles authentic Core IELTS and V10 evidence without inflating replay',()=>{
  const coreGood=coreCanonicalEvent('good',{rating:'good',now:Date.parse('2026-08-01T12:00:00Z')});
  const coreAgain=coreCanonicalEvent('again',{rating:'again',now:Date.parse('2026-08-02T12:00:00Z')});
  const ieltsGood=ieltsCanonicalEvent('good');
  const v10Coaching=v10CanonicalCoachingEvent('coaching');

  assert.equal(coreGood.decision.eligible,true);
  assert.equal(coreAgain.decision.eligible,true);
  assert.equal(ieltsGood.decision.eligible,true);
  assert.equal(v10Coaching.decision.eligible,false);
  assert.equal(v10Coaching.decision.reason,'assistance-exposed');

  const predecessorSummary=summarizeReviewQuality([coreGood.record]);
  assert.equal(predecessorSummary.reviews,1,'existing progress seam must interpret canonical nested evidence-decided payloads');
  assert.equal(predecessorSummary.denominator,1,'canonical review summary must expose an explicit denominator');

  assert.equal(typeof progress.buildCanonicalProgressProjection,'function','progress seam must expose canonical {metrics, weaknessProfile} projection');

  const controlled=[coreGood.record,coreAgain.record,ieltsGood.record,v10Coaching.record,coreGood.record];
  const before=structuredClone(controlled);
  const projection=progress.buildCanonicalProgressProjection(controlled,{timeZone:'UTC'});

  assert.deepEqual(controlled,before,'projection must not mutate canonical input events');
  assert.equal(projection.kind,'canonical-progress-projection');
  assert.equal(projection.schemaVersion,1);
  assert.equal(projection.metrics.kind,'canonical-learning-metrics');
  assert.equal(projection.metrics.schemaVersion,1);
  assert.equal(projection.metrics.totalCanonicalDecisions,4);
  assert.equal(projection.metrics.duplicatesDropped,1);
  assert.equal(projection.metrics.denominator,3);
  assert.equal(projection.metrics.numerator,2);
  assert.equal(projection.metrics.sampleSize,3);
  assert.equal(projection.metrics.excluded.count,1);
  assert.equal(projection.metrics.excluded.byReason['assistance-exposed'],1);
  assert.equal(projection.metrics.bySkill.recall.denominator,2);
  assert.equal(projection.metrics.bySkill.recall.numerator,1);
  assert.equal(projection.metrics.bySkill.listening.denominator,1);
  assert.equal(projection.metrics.bySkill.listening.numerator,1);
  assert.equal(projection.metrics.timeframe.timeZone,'UTC');
  assert.ok(Number.isFinite(projection.metrics.timeframe.firstAt));
  assert.ok(Number.isFinite(projection.metrics.timeframe.lastAt));
  assert.ok(projection.metrics.timeframe.firstAt<=projection.metrics.timeframe.lastAt);
  assert.equal(projection.metrics.provenance.length,4);
  assert.equal(projection.metrics.provenance.filter(row=>row.included).length,3);
  assert.ok(projection.metrics.provenance.every(row=>row.eventId&&row.receiptId&&row.sourceId&&row.sourceRevision));

  assert.equal(validateWeaknessProfile(projection.weaknessProfile).valid,true,'Progress must expose the canonical P7/WKN WeaknessProfile without recasting it');
  assert.equal(projection.weaknessProfile.schemaVersion,1);
  assert.equal(projection.weaknessProfile.profileVersion,'weakness-profile-v1');
  assert.equal(projection.weaknessProfile.denominator,3);
  assert.equal(projection.weaknessProfile.sampleSize,3);
  assert.equal(projection.weaknessProfile.insufficientData,false);
  assert.equal(skillObservation(projection.weaknessProfile,'recall').denominator,2);
  assert.equal(skillObservation(projection.weaknessProfile,'listening').denominator,1);
  assert.equal(projection.weaknessProfile.uncertainty,'high');
  assert.deepEqual(projection.weaknessProfile.reasonCodes,[],'mixed outcomes are observations, not a second canonical conflict vocabulary');
  assert.match(projection.weaknessProfile.inputDigest,/^fnv1a64:/);
  assert.match(projection.weaknessProfile.outputDigest,/^fnv1a64:/);
  for(const forbidden of ['kind','conflicts','ready','readiness','bandScore','bandEstimate','mastery']){
    assert.equal(Object.prototype.hasOwnProperty.call(projection.weaknessProfile,forbidden),false);
  }

  const reordered=progress.buildCanonicalProgressProjection([...controlled].reverse(),{timeZone:'UTC'});
  assert.deepEqual(reordered,projection,'caller order must not change canonical projection');
});

test('canonical progress projection preserves canonical sparse/conflict semantics instead of inventing a second WeaknessProfile vocabulary',()=>{
  const core=coreCanonicalEvent('collision',{rating:'good',now:Date.parse('2026-08-03T12:00:00Z')}).record;
  const ielts=ieltsCanonicalEvent('sparse').record;
  const collision=identityCollision(core);

  const sparse=progress.buildCanonicalProgressProjection([ielts],{timeZone:'UTC'});
  assert.equal(sparse.metrics.denominator,1);
  assert.equal(validateWeaknessProfile(sparse.weaknessProfile).valid,true);
  assert.equal(sparse.weaknessProfile.insufficientData,true);
  assert.equal(sparse.weaknessProfile.uncertainty,'high');
  assert.ok(sparse.weaknessProfile.reasonCodes.includes('SINGLE_QUALIFIED_SAMPLE'));

  const conflicted=progress.buildCanonicalProgressProjection([core,collision,ielts],{timeZone:'UTC'});
  assert.equal(conflicted.metrics.conflicts.count,1);
  assert.equal(conflicted.metrics.denominator,1,'both rows sharing a colliding identity must be excluded from denominator');
  assert.equal(validateWeaknessProfile(conflicted.weaknessProfile).valid,true);
  assert.equal(conflicted.weaknessProfile.uncertainty,'high');
  assert.ok(conflicted.weaknessProfile.reasonCodes.includes('CONFLICTING_CANONICAL_EVENTS'));
  assert.equal(Object.prototype.hasOwnProperty.call(conflicted.weaknessProfile,'conflicts'),false,'metrics owns conflict details; WeaknessProfile keeps only its canonical conflict reason');

  const empty=progress.buildCanonicalProgressProjection([],{timeZone:'UTC'});
  assert.equal(empty.metrics.status,'INSUFFICIENT_DATA');
  assert.equal(empty.metrics.denominator,0);
  assert.equal(empty.metrics.sampleSize,0);
  assert.equal(validateWeaknessProfile(empty.weaknessProfile).valid,true);
  assert.equal(empty.weaknessProfile.insufficientData,true);
  assert.ok(empty.weaknessProfile.reasonCodes.includes('NO_QUALIFIED_EVIDENCE'));
});
