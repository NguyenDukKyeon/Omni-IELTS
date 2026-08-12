import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_CONTRACT_VERSION,
  adaptLegacyLearningEnvelope,
  appendAssistanceEvent,
  completeAssistanceTrace,
  createActivitySpec,
  createAssistanceTrace,
  createAttempt,
  createLearningEnvelope,
  createReceipt,
  createRun,
  learningContractDigest,
  validateActivitySpec,
  validateFrozenRunBinding,
  isCompleteLearningTarget,
  normalizeLearningTarget,
  validateLearningEnvelope
} from '../src/learning-contracts.js';

test('normalizes a productive text revision target',()=>{
  const target=normalizeLearningTarget({schemaVersion:2,targetType:'productive-text-revision',targetId:'artifact-revision:demo',cardId:null,senseId:null,skill:'production',sourceId:'controlled-writing-self-review',sourceRevision:'controlled-writing-self-review-v1'});
  assert.equal(target?.targetType,'productive-text-revision');
  assert.equal(isCompleteLearningTarget(target),true);
});
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { buildIeltsEvidenceEnvelope } from '../src/ielts-domain.js';
import { buildV10CoachingEnvelope } from '../src/v10-contracts.js';

const target=Object.freeze({cardId:'card-1',senseId:'sense-1',skill:'recall',sourceId:'core-card:card-1',sourceRevision:'revision-1'});

function validEnvelope(overrides={}){
  const activitySpec=createActivitySpec({id:'activity-1',type:'typing',target,planId:'plan-1',plannedAt:100,timezone:'Asia/Saigon'});
  const run=createRun({id:'run-1',activitySpec,status:'active',startedAt:110,timezone:'Asia/Saigon'});
  const assistance=completeAssistanceTrace(appendAssistanceEvent(createAssistanceTrace({id:'trace-1',collector:'core-session'}),{type:'submit',at:120}));
  const attempt=createAttempt({id:'attempt-1',run,activitySpec,receiptId:'receipt-1',result:'correct',target,assistance,occurredAt:120,timezone:'Asia/Saigon'});
  const receipt=createReceipt({id:'receipt-1',run,activitySpec,attempt,status:'completed',issuedAt:130,timezone:'Asia/Saigon'});
  return{activitySpec,run,attempt,receipt,...overrides};
}

test('canonical ActivitySpec, Run, Attempt and Receipt bind one immutable exact target',()=>{
  const envelope=createLearningEnvelope(validEnvelope());
  assert.equal(envelope.activitySpec.schemaVersion,LEARNING_CONTRACT_VERSION);
  assert.equal(envelope.run.activitySpecDigest,learningContractDigest(envelope.activitySpec));
  assert.equal(envelope.receipt.attemptDigest,learningContractDigest(envelope.attempt));
  assert.deepEqual(envelope.activitySpec.target,target);
  assert.deepEqual(envelope.attempt.target,target);
  assert.deepEqual(envelope.receipt.target,target);
  assert.equal(Object.isFrozen(envelope.receipt.target),true);
  assert.throws(()=>{envelope.receipt.target.cardId='other';},TypeError);
});

test('receipt cannot change target, ActivitySpec digest, attempt digest or idempotency binding',()=>{
  const base=validEnvelope();
  const changedTarget=createReceipt({...base.receipt,activitySpec:base.activitySpec,run:base.run,attempt:base.attempt,target:{...target,cardId:'card-other'}});
  const targetResult=validateLearningEnvelope({...base,receipt:changedTarget});
  assert.equal(targetResult.valid,false);
  assert.ok(targetResult.errors.some(error=>error.includes('Exact target')));

  const changedSpec=createReceipt({...base.receipt,activitySpec:base.activitySpec,run:base.run,attempt:base.attempt,activitySpecDigest:'tampered'});
  assert.equal(validateLearningEnvelope({...base,receipt:changedSpec}).valid,false);
  const changedAttempt=createReceipt({...base.receipt,activitySpec:base.activitySpec,run:base.run,attempt:base.attempt,attemptDigest:'tampered'});
  assert.equal(validateLearningEnvelope({...base,receipt:changedAttempt}).valid,false);
  assert.notEqual(base.activitySpec.idempotencyKey,base.run.idempotencyKey);
  assert.notEqual(base.attempt.idempotencyKey,base.receipt.idempotencyKey);
});

test('AssistanceTrace is append-only, ordered and immutable after completion',()=>{
  const first=createAssistanceTrace({id:'trace-1',collector:'core-session'});
  const second=appendAssistanceEvent(first,{type:'hint',at:10});
  const third=appendAssistanceEvent(second,{type:'submit',at:20});
  assert.equal(first.events.length,0);
  assert.deepEqual(third.events.map(event=>event.sequence),[1,2]);
  assert.throws(()=>appendAssistanceEvent(third,{type:'late',at:15}),error=>error.code==='ASSISTANCE_TRACE_TIME_REGRESSION');
  assert.throws(()=>appendAssistanceEvent(completeAssistanceTrace(third),{type:'rewrite',at:30}),error=>error.code==='ASSISTANCE_TRACE_ALREADY_COMPLETE');
});

test('clock and timezone validation rejects temporal regressions while normalizing unknown timezone',()=>{
  const base=validEnvelope();
  const earlyAttempt=createAttempt({...base.attempt,activitySpec:base.activitySpec,run:base.run,occurredAt:105});
  const result=validateLearningEnvelope({...base,attempt:earlyAttempt,receipt:createReceipt({...base.receipt,activitySpec:base.activitySpec,run:base.run,attempt:earlyAttempt})});
  assert.equal(result.valid,false);
  assert.ok(result.errors.some(error=>error.includes('Attempt xảy ra trước run')));
  assert.equal(createActivitySpec({...base.activitySpec,timezone:'Not/A_Timezone'}).timezone,'UTC');
});

test('legacy adapters dual-read Phase 0 shapes but incomplete targets remain invalid for evidence',()=>{
  const legacy=adaptLegacyLearningEnvelope({
    activitySpec:{id:'legacy-activity',type:'typing',target},
    attempt:{id:'legacy-attempt',activityId:'legacy-activity',receiptId:'legacy-receipt',activityType:'typing',result:'correct',target,assistance:{id:'legacy-trace',schemaVersion:1,collector:'core-session',complete:true}}
  });
  assert.equal(legacy.activitySpec.metadata.legacyAdapter,true);
  assert.equal(validateLearningEnvelope(legacy).valid,true);
  const targetless=validateActivitySpec({id:'legacy-targetless',type:'typing',target:null});
  assert.equal(targetless.valid,false);
  assert.ok(targetless.errors.some(error=>error.includes('exact target')));
});

test('malformed, unknown-version and cross-reference records fail semantic validation',()=>{
  const base=validEnvelope();
  const wrongVersion=createActivitySpec({...base.activitySpec,schemaVersion:99});
  const result=validateLearningEnvelope({...base,activitySpec:wrongVersion});
  assert.equal(result.valid,false);
  assert.ok(result.errors.some(error=>error.includes('schemaVersion')));
  assert.throws(()=>createLearningEnvelope({...base,attempt:{...base.attempt,runId:'other-run'}}),error=>error.code==='LEARNING_CONTRACT_INVALID');
});

test('Core, IELTS and V10 envelope builders emit the same canonical four-contract schema',()=>{
  const core=buildCoreEvidenceEnvelope({
    card:{id:'card-1',senseId:'sense-1',front:'durable',back:'bền',type:'word'},
    rating:'good',
    step:{id:'core-activity',kind:'typing',skill:'recall'},
    session:{id:'core-session',mode:'today',timezone:'UTC'},
    now:1000
  });
  const ielts=buildIeltsEvidenceEnvelope({
    activityId:'ielts-activity',receiptId:'ielts-receipt',activityType:'dictation',cardId:'card-1',skill:'listening',
    sourceId:'ielts-source',sourceRevision:'ielts-revision',result:'correct',sourceVerified:true
  });
  const v10=buildV10CoachingEnvelope({
    activityId:'v10-activity',receiptId:'v10-receipt',activityType:'dictation',
    sentence:{id:'s1',text:'A sentence.',startMs:0,endMs:1000,verified:true},
    sourceId:'v10-source',cardId:'card-1',skill:'listening',result:'correct'
  });
  for(const envelope of [core,ielts,v10]){
    for(const key of ['activitySpec','run','attempt','receipt'])assert.equal(envelope[key].schemaVersion,LEARNING_CONTRACT_VERSION,`${key} must be canonical`);
    assert.equal(validateLearningEnvelope(envelope).valid,true);
    assert.equal(envelope.receipt.id,envelope.attempt.receiptId);
  }
});

test('LearningTarget v2 admits only exact objective-item and core-card target identities',()=>{
  const objective={schemaVersion:2,targetType:'ielts-objective-item',targetId:'ielts-objective:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',cardId:null,senseId:null,skill:'reading',sourceId:'reading-source:fixture',sourceRevision:'reading-source:fixture:1'};
  const spec=createActivitySpec({id:'v2-objective',type:'reading',target:objective,plannedAt:10,executor:'qar-reading'});
  assert.deepEqual(spec.target,objective);
  assert.equal(spec.schemaVersion,2);
  assert.equal(validateActivitySpec(spec).valid,true);
  assert.equal(validateActivitySpec({...spec,target:{...objective,cardId:'card-injection'}}).valid,false);
  assert.equal(validateActivitySpec({...spec,target:{...objective,targetType:'future-item'}}).valid,false);
});

test('LearningTarget v2 rejects forged scalar identity and accessors without invoking them',()=>{
  const core={schemaVersion:2,targetType:'core-card',targetId:'card-1',cardId:'card-1',senseId:'sense-1',skill:'recall',sourceId:'core-card:card-1',sourceRevision:'revision-1'};
  assert.deepEqual(normalizeLearningTarget(core),core);
  for(const altered of [{...core,targetId:'card-other'},{...core,targetId:' card-1',cardId:' card-1'},{...core,cardId:' card-1'},{...core,sourceId:' core-card:card-1'},{...core,sourceRevision:'revision-1 '},{...core,senseId:''},{...core,senseId:' sense-1'},{...core,extra:true}])assert.equal(normalizeLearningTarget(altered),null);
  let reads=0;const hostile={...core};Object.defineProperty(hostile,'targetId',{enumerable:true,get(){reads+=1;throw new Error('must not read');}});
  assert.equal(normalizeLearningTarget(hostile),null);assert.equal(reads,0);
  const frozen={schemaVersion:2,runId:'run-v2',activitySpecId:'activity-v2',activitySpecDigest:'digest',target:hostile,executor:{state:'bound',value:'core-card'},launch:{binding:{state:'inapplicable',value:null},promptRevision:{state:'inapplicable',value:null},configRevision:{state:'inapplicable',value:null},configDigest:{state:'inapplicable',value:null}},evaluation:{marker:'inapplicable',revision:{state:'inapplicable',value:null},keyRevision:{state:'inapplicable',value:null},keyDigest:{state:'inapplicable',value:null},rubricRevision:{state:'inapplicable',value:null},rubricDigest:{state:'inapplicable',value:null},scoringPolicyRevision:{state:'inapplicable',value:null},reviewPolicyRevision:{state:'inapplicable',value:null}},evidencePolicy:{version:{state:'bound',value:'phase0-evidence-v1'},reference:{state:'inapplicable',value:null}},assistance:{collectionMode:{state:'bound',value:'core-session'}},startIdempotencyKey:'activity:activity-v2',digest:'bad'};
  assert.equal(validateFrozenRunBinding(frozen).valid,false);assert.equal(reads,0);
});

test('legacy target digest remains byte-compatible while objective ids stay exact',()=>{
  assert.equal(learningContractDigest({cardId:'card-1',senseId:null,skill:'listening',sourceId:'media-1',sourceRevision:'sha256:abc'}),'fnv1a64:105:d3b0e049e7dc83fb');
  const objective={schemaVersion:2,targetType:'ielts-objective-item',targetId:'ielts-objective:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',cardId:null,senseId:null,skill:'reading',sourceId:'reading-source:fixture',sourceRevision:'reading-source:fixture:1'};
  assert.equal(normalizeLearningTarget({...objective,targetId:'ielts-objective:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'}),null);
  assert.equal(normalizeLearningTarget({...objective,targetId:'ielts-objective:aaaaaaaa'}),null);
});

test('v2 core target keeps v1 identity and source bounds without truncation',()=>{
  const core={schemaVersion:2,targetType:'core-card',targetId:'c'.repeat(180),cardId:'c'.repeat(180),senseId:'s'.repeat(180),skill:'recall',sourceId:'i'.repeat(240),sourceRevision:'r'.repeat(240)};
  assert.deepEqual(normalizeLearningTarget(core),core);
  for(const altered of [
    {...core,targetId:'c'.repeat(181),cardId:'c'.repeat(181)},
    {...core,senseId:'s'.repeat(181)},
    {...core,sourceId:'i'.repeat(241)},
    {...core,sourceRevision:'r'.repeat(241)}
  ])assert.equal(normalizeLearningTarget(altered),null);
});
