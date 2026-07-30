import assert from 'node:assert/strict';
import test from 'node:test';
import { EVIDENCE_POLICY_VERSION,EVIDENCE_REASONS,decideEvidence,evidenceDigest,normalizeAssistanceTrace } from '../src/evidence-policy.js';

function fixture(overrides={}){
  const activity={id:'activity-1',type:'dictation',target:{cardId:'card-1',skill:'listening',sourceId:'media-1',sourceRevision:'sha256:abc'},...overrides.activity};
  const attempt={id:'attempt-1',activityId:'activity-1',receiptId:'receipt-1',activityType:'dictation',result:'correct',target:{...activity.target},assistance:{id:'trace-1',schemaVersion:1,collector:'ielts-lab',complete:true},learnerOutput:'',...overrides.attempt};
  const verification={
    source:{id:'source-receipt-1',authority:'ielts-source-registry',status:'verified',sourceId:activity.target.sourceId,sourceRevision:activity.target.sourceRevision},
    evaluation:{id:'evaluation-receipt-1',authority:'deterministic-rubric',status:'verified',attemptId:attempt.id,activityId:activity.id,cardId:activity.target.cardId,skill:activity.target.skill,outputDigest:evidenceDigest(attempt.learnerOutput),targetUsed:true},
    ...overrides.verification
  };
  return{activity,attempt,verification};
}

test('policy is deterministic, versioned and binds decision to receipt',()=>{
  const input=fixture();const first=decideEvidence(input);const second=decideEvidence(structuredClone(input));
  assert.deepEqual(first,second);assert.equal(first.policyVersion,EVIDENCE_POLICY_VERSION);assert.ok(first.decisionId.startsWith(`${EVIDENCE_POLICY_VERSION}:receipt-1:fnv1a64:`));
  assert.equal(first.eligible,true);assert.equal(first.rating,'good');assert.equal(first.successful,true);
});

test('missing legacy provenance and unknown activities fail closed',()=>{
  assert.equal(decideEvidence({}).reason,EVIDENCE_REASONS.missingAttempt);
  const missing=fixture();delete missing.attempt.receiptId;assert.equal(decideEvidence(missing).reason,EVIDENCE_REASONS.missingReceiptId);
  const unknown=fixture({activity:{type:'future-magic'},attempt:{activityType:'future-magic'}});assert.equal(decideEvidence(unknown).reason,EVIDENCE_REASONS.unknownActivity);
  assert.equal(decideEvidence(fixture({attempt:{assistance:{}}})).reason,EVIDENCE_REASONS.invalidAssistanceTrace);
  assert.equal(decideEvidence({...fixture(),verification:{}}).reason,EVIDENCE_REASONS.unverifiedSource);
  const selfClaimed=fixture({attempt:{source:{status:'verified'},evaluation:{status:'verified',evaluator:'caller'}}});selfClaimed.verification={};
  assert.equal(decideEvidence(selfClaimed).reason,EVIDENCE_REASONS.unverifiedSource,'verified fields on Attempt are not authority');
});

test('exact activity, card, skill, source and revision are immutable bindings',()=>{
  const cases=[
    [fixture({attempt:{activityId:'other'}}),EVIDENCE_REASONS.activityMismatch],
    [fixture({attempt:{target:{cardId:'other',skill:'listening',sourceId:'media-1',sourceRevision:'sha256:abc'}}}),EVIDENCE_REASONS.targetMismatch],
    [fixture({attempt:{target:{cardId:'card-1',senseId:'other-sense',skill:'listening',sourceId:'media-1',sourceRevision:'sha256:abc'}}}),EVIDENCE_REASONS.targetMismatch],
    [fixture({attempt:{target:{cardId:'card-1',skill:'recall',sourceId:'media-1',sourceRevision:'sha256:abc'}}}),EVIDENCE_REASONS.skillMismatch],
    [fixture({attempt:{target:{cardId:'card-1',skill:'listening',sourceId:'other',sourceRevision:'sha256:abc'}}}),EVIDENCE_REASONS.sourceMismatch],
    [fixture({attempt:{target:{cardId:'card-1',skill:'listening',sourceId:'media-1',sourceRevision:'sha256:old'}}}),EVIDENCE_REASONS.revisionMismatch]
  ];
  for(const [input,reason] of cases)assert.equal(decideEvidence(input).reason,reason);
});

test('reveal, hint, transcript, correction and exposed retry are semantic assistance',()=>{
  for(const key of ['revealed','hintUsed','transcriptViewed','correctionExposed','retryAfterExposure','coaching','answerExposed']){
    const input=fixture({attempt:{assistance:{id:'trace-1',schemaVersion:1,collector:'ielts-lab',complete:true,[key]:true}}});const decision=decideEvidence(input);
    assert.equal(decision.eligible,false,key);assert.equal(decision.reason,EVIDENCE_REASONS.assisted,key);
  }
  const trace=normalizeAssistanceTrace({id:'trace',schemaVersion:1,collector:'core-session',complete:true,events:[{type:'retry-after-exposure',at:1}]});
  assert.equal(trace.exposed,true);assert.equal(Object.isFrozen(trace.events),true);assert.equal(Object.isFrozen(trace.events[0]),true);
});

test('qualified wrong evidence persists symmetrically but is not successful',()=>{
  const decision=decideEvidence(fixture({attempt:{result:'wrong',errorType:'listening'}}));
  assert.equal(decision.eligible,true);assert.equal(decision.rating,'again');assert.equal(decision.successful,false);
});

test('dictation rejects unverified sources, spelling-only and source errors',()=>{
  const unverified=fixture();unverified.verification.source={...unverified.verification.source,status:'draft'};
  assert.equal(decideEvidence(unverified).reason,EVIDENCE_REASONS.unverifiedSource);
  assert.equal(decideEvidence(fixture({attempt:{errorType:'spelling-only'}})).reason,EVIDENCE_REASONS.spellingOnly);
  assert.equal(decideEvidence(fixture({attempt:{errorType:'transcript-source'}})).reason,EVIDENCE_REASONS.sourceError);
  assert.equal(decideEvidence(fixture({attempt:{result:'wrong',errorType:null}})).reason,EVIDENCE_REASONS.unclassifiedListeningError);
  assert.equal(decideEvidence(fixture({attempt:{result:'mystery'}})).reason,EVIDENCE_REASONS.invalidResult);
});

test('activity semantics cannot be relabeled as another skill',()=>{
  const typing=fixture({activity:{type:'typing',target:{cardId:'card-1',skill:'listening',sourceId:'media-1',sourceRevision:'sha256:abc'}},attempt:{activityType:'typing'}});
  assert.equal(decideEvidence(typing).reason,EVIDENCE_REASONS.skillMismatch);
  const matching=fixture({activity:{type:'matching',target:{cardId:'card-1',skill:'recall',sourceId:'media-1',sourceRevision:'sha256:abc'}},attempt:{activityType:'matching'}});
  assert.equal(decideEvidence(matching).reason,EVIDENCE_REASONS.skillMismatch);
});

test('same receipt with a different bound payload cannot collide',()=>{
  const first=decideEvidence(fixture());const second=decideEvidence(fixture({attempt:{result:'wrong'}}));
  assert.notEqual(first.receiptBinding,second.receiptBinding);assert.notEqual(first.decisionId,second.decisionId);
  const spelling=decideEvidence(fixture({attempt:{errorType:'spelling-only'}}));
  assert.notEqual(first.decisionId,spelling.decisionId);assert.notEqual(first.eligible,spelling.eligible);
  const retell=fixture({activity:{type:'retell',target:{cardId:'card-1',skill:'production',sourceId:'media-1',sourceRevision:'sha256:abc'}},attempt:{activityType:'retell',learnerOutput:'Retell'}});
  const retellAllowed=decideEvidence(retell);const retellDenied=decideEvidence({...retell,verification:{...retell.verification,evaluation:{...retell.verification.evaluation,targetUsed:false}}});
  assert.notEqual(retellAllowed.decisionId,retellDenied.decisionId);assert.notEqual(retellAllowed.eligible,retellDenied.eligible);
});

test('Retell requires durable learner output, verified evaluator and demonstrated preselected target',()=>{
  const activity={type:'retell',target:{cardId:'card-1',skill:'production',sourceId:'media-1',sourceRevision:'sha256:abc'}};
  const base={activityType:'retell',target:{cardId:'card-1',skill:'production',sourceId:'media-1',sourceRevision:'sha256:abc'}};
  assert.equal(decideEvidence(fixture({activity,attempt:base})).reason,EVIDENCE_REASONS.missingLearnerOutput);
  const valid=fixture({activity,attempt:{...base,learnerOutput:'My retell'}});
  assert.equal(decideEvidence({...valid,verification:{...valid.verification,evaluation:{...valid.verification.evaluation,authority:'caller-claimed'}}}).reason,EVIDENCE_REASONS.unverifiedEvaluation);
  assert.equal(decideEvidence({...valid,verification:{...valid.verification,evaluation:{...valid.verification.evaluation,targetUsed:false}}}).reason,EVIDENCE_REASONS.targetNotUsed);
  assert.equal(decideEvidence({...valid,verification:{...valid.verification,evaluation:{...valid.verification.evaluation,outputDigest:evidenceDigest('different output')}}}).reason,EVIDENCE_REASONS.unverifiedEvaluation);
  assert.equal(decideEvidence(valid).eligible,true);
});

test('coaching activities never become evidence even with success-shaped input',()=>{
  for(const type of ['shadowing','pronunciation','reading','transcript-edit']){
    const activity={type};const attempt={activityType:type};
    assert.equal(decideEvidence(fixture({activity,attempt})).reason,EVIDENCE_REASONS.coaching,type);
  }
});
