import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { listErrorOccurrences,recordErrorOccurrence } from '../src/error-repository.js';
import { getV10Record,putV10Records } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { learningContractDigest } from '../src/learning-contracts.js';

globalThis.indexedDB=new IDBFactory();
const candidates=await import('../src/error-candidate.js');

function qualifiedEnvelope(id,{cardId=`card-${id}`,senseId=`sense-${id}`}={}){
  const card={id:cardId,senseId,front:'durable',back:'bền vững',type:'word'};
  return buildCoreEvidenceEnvelope({card,rating:'good',learnerOutput:'durable',step:{id:`activity-${id}`,kind:'typing',skill:'recall',receiptId:`receipt-${id}`},session:{id:`session-${id}`,timezone:'UTC'},evaluation:{authority:'human-review',status:'verified',targetUsed:true},now:10_000});
}

test('ERR-00 rejects a forged caller decision and keeps an advisory candidate non-promoting',async()=>{
  const candidate=await candidates.createErrorCandidate({id:'err-forged',category:'distractor',target:{cardId:'card',senseId:'sense',skill:'recall',sourceId:'core-card:card',sourceRevision:'rev'}});
  await assert.rejects(candidates.promoteErrorCandidate(candidate.id,{decision:{eligible:true,successful:true,affectsSchedule:true}}),error=>error.code==='ERROR_CANDIDATE_EVIDENCE_REQUIRED');
  assert.equal((await candidates.getErrorCandidate(candidate.id)).state,'open');
});

test('ERR-00 rejects a same-id candidate with a distinct immutable canonical envelope binding',async()=>{
  const target={cardId:'card-identity',senseId:'sense-identity',skill:'recall',sourceId:'core-card:card-identity',sourceRevision:null};
  const firstEnvelope=qualifiedEnvelope('identity-a',{cardId:target.cardId,senseId:target.senseId});
  const exactTarget=firstEnvelope.activitySpec.target;
  const first=await candidates.createErrorCandidate({id:'err-identity',category:'distractor',target:exactTarget,claim:'same claim',envelope:firstEnvelope,advisory:{producer:'fixture',producerVersion:'1',configDigest:'cfg-a'}});
  const secondEnvelope=qualifiedEnvelope('identity-b',{cardId:target.cardId,senseId:target.senseId});
  await assert.rejects(
    candidates.createErrorCandidate({id:'err-identity',category:'distractor',target:exactTarget,claim:'same claim',envelope:secondEnvelope,advisory:{producer:'fixture',producerVersion:'1',configDigest:'cfg-a'}}),
    error=>error.code==='ERROR_CANDIDATE_COLLISION'
  );
  assert.equal((await candidates.getErrorCandidate(first.id)).binding.attemptId,firstEnvelope.attempt.id);
});

test('ERR-00 promotes one policy-qualified candidate exactly once and crash reconciliation is retry-safe',async()=>{
  const envelope=qualifiedEnvelope('reconcile');
  const candidate=await candidates.createErrorCandidate({id:'err-reconcile',category:'distractor',target:envelope.activitySpec.target,envelope,learnerOutput:'private learner text',expectedResponse:'private key'});
  await assert.rejects(candidates.promoteErrorCandidate(candidate.id,{envelope,hooks:{afterOccurrence:()=>{throw Object.assign(new Error('injected interruption'),{code:'INJECTED_INTERRUPT'});}}}),error=>error.code==='INJECTED_INTERRUPT');
  assert.equal((await candidates.getErrorCandidate(candidate.id)).state,'promotion_pending');
  const before=await candidates.reconcileErrorCandidates();
  assert.equal(before.promoted,1);
  const promoted=await candidates.promoteErrorCandidate(candidate.id,{envelope});
  assert.equal(promoted.state,'promoted');
  const occurrences=await listErrorOccurrences(promoted.promotion.errorRecordId);
  assert.equal(occurrences.filter(row=>row.id===promoted.promotion.occurrenceId).length,1);
  const journal=await getV10Record(V10_STORES.workflowIntents,candidate.id);
  assert.equal(JSON.stringify(journal).includes('private learner text'),false);
  assert.equal(JSON.stringify(journal).includes('private key'),false);
});

test('ERR-00 keeps rejected, expired, and source-error candidates diagnosable without schedule effects',async()=>{
  const rejected=await candidates.createErrorCandidate({id:'err-rejected',category:'distractor',target:{cardId:'card-r',senseId:'sense-r',skill:'recall',sourceId:'core-card:card-r',sourceRevision:'rev-r'}});
  await candidates.rejectErrorCandidate(rejected.id,{reason:'learner-rejected'});
  const expired=await candidates.createErrorCandidate({id:'err-expired',category:'distractor',target:{cardId:'card-e',senseId:'sense-e',skill:'recall',sourceId:'core-card:card-e',sourceRevision:'rev-e'}});
  await candidates.expireErrorCandidate(expired.id);
  const source=await candidates.createErrorCandidate({id:'err-source',category:'transcript-source',target:{cardId:'card-s',senseId:'sense-s',skill:'listening',sourceId:'core-card:card-s',sourceRevision:'rev-s'}});
  await assert.rejects(candidates.promoteErrorCandidate(source.id,{envelope:qualifiedEnvelope('source')}),error=>error.code==='ERROR_CANDIDATE_SOURCE_ERROR');
  assert.equal((await candidates.getErrorCandidate(rejected.id)).state,'rejected');
  assert.equal((await candidates.getErrorCandidate(expired.id)).state,'expired');
  assert.equal((await candidates.getErrorCandidate(source.id)).state,'open');
});

test('ERR-00 candidate journal is included in canonical backup and restore without private claim payload',async()=>{
  const candidate=await candidates.createErrorCandidate({id:'err-backup',category:'distractor',target:{cardId:'card-b',senseId:'sense-b',skill:'recall',sourceId:'core-card:card-b',sourceRevision:'rev-b'},learnerOutput:'ERR_PRIVATE_SENTINEL'});
  const backup=await buildCombinedBackup();
  assert.ok(backup.domains.v10.stores.workflowIntents.some(row=>row.id===candidate.id));
  assert.equal(JSON.stringify(backup).includes('ERR_PRIVATE_SENTINEL'),false);
  await candidates.rejectErrorCandidate(candidate.id);
  const restored=await restoreCombinedBackup(backup);
  assert.equal(restored.durable,true);
  assert.equal((await candidates.getErrorCandidate(candidate.id)).state,'open');
});

test('ERR-00 direct confirmation has immutable ordered revisions and stale expiry cannot overwrite it',async()=>{
  const candidate=await candidates.createErrorCandidate({id:'err-direct-confirm',category:'distractor',target:{cardId:'card-c',senseId:'sense-c',skill:'recall',sourceId:'core-card:card-c',sourceRevision:'rev-c'}});
  const confirmed=await candidates.confirmErrorCandidate(candidate.id,{decisionId:'confirm-1',authority:{kind:'direct-user',version:1,userId:'learner'},reason:'yes',at:200});
  assert.equal(confirmed.state,'confirmed');
  assert.equal(confirmed.decisionHistory.length,1);
  assert.equal(confirmed.decisionHistory[0].id,'confirm-1');
  await assert.rejects(candidates.expireErrorCandidate(candidate.id,{decisionId:'expire-stale',at:100}),error=>error.code==='ERROR_CANDIDATE_STALE_DECISION');
  assert.equal((await candidates.getErrorCandidate(candidate.id)).state,'confirmed');
  const replay=await candidates.confirmErrorCandidate(candidate.id,{decisionId:'confirm-1',authority:{kind:'direct-user',version:1,userId:'learner'},reason:'yes',at:200});
  assert.equal(replay.decisionHistory.length,1);
  await assert.rejects(candidates.confirmErrorCandidate(candidate.id,{decisionId:'confirm-1',authority:{kind:'direct-user',version:1,userId:'different'},reason:'no',at:200}),error=>error.code==='ERROR_CANDIDATE_DECISION_COLLISION');
});

test('ERR-00 rejects provider-labelled confirmation and replays exact reject/expiry revisions idempotently',async()=>{
  const provider=await candidates.createErrorCandidate({id:'err-provider-authority',category:'distractor',target:{cardId:'card-p',senseId:'sense-p',skill:'recall',sourceId:'core-card:card-p',sourceRevision:'rev-p'}});
  await assert.rejects(candidates.confirmErrorCandidate(provider.id,{decisionId:'provider',authority:{kind:'provider',version:1,userId:'model'},at:1}),error=>error.code==='ERROR_CANDIDATE_AUTHORITY_INVALID');
  const rejected=await candidates.createErrorCandidate({id:'err-replay-reject',category:'distractor',target:{cardId:'card-rr',senseId:'sense-rr',skill:'recall',sourceId:'core-card:card-rr',sourceRevision:'rev-rr'}});
  await candidates.rejectErrorCandidate(rejected.id,{decisionId:'reject-1',reason:'no',at:2});
  assert.equal((await candidates.rejectErrorCandidate(rejected.id,{decisionId:'reject-1',reason:'no',at:2})).decisionHistory.length,1);
  const expired=await candidates.createErrorCandidate({id:'err-replay-expire',category:'distractor',target:{cardId:'card-re',senseId:'sense-re',skill:'recall',sourceId:'core-card:card-re',sourceRevision:'rev-re'}});
  await candidates.expireErrorCandidate(expired.id,{decisionId:'expire-1',reason:'old',at:3});
  assert.equal((await candidates.expireErrorCandidate(expired.id,{decisionId:'expire-1',reason:'old',at:3})).decisionHistory.length,1);
});

test('ERR-00 reconciliation rejects a canonical occurrence collision instead of promoting',async()=>{
  const envelope=qualifiedEnvelope('collision');
  const candidate=await candidates.createErrorCandidate({id:'err-occurrence-collision',category:'distractor',target:envelope.activitySpec.target,envelope});
  await candidates.confirmErrorCandidate(candidate.id,{decisionId:'direct-confirm',authority:{kind:'direct-user',version:1,userId:'learner'},at:20});
  const pending=await candidates.promoteErrorCandidate(candidate.id,{hooks:{beforeOccurrence:()=>{throw Object.assign(new Error('crash'),{code:'CRASH_BEFORE_OCCURRENCE'});}}}).catch(async error=>{assert.equal(error.code,'CRASH_BEFORE_OCCURRENCE');return candidates.getErrorCandidate(candidate.id);});
  assert.equal(pending.state,'promotion_pending');
  await recordErrorOccurrence({occurrenceId:pending.occurrenceId,target:pending.target,category:'conflicting-category',attemptId:pending.binding.attemptId,receiptId:pending.binding.receiptId,occurredAt:pending.createdAt,provenance:{kind:'conflicting-fixture'}});
  const result=await candidates.reconcileErrorCandidates();
  assert.ok(result.errors.some(row=>row.candidateId===candidate.id&&row.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION'));
  assert.equal((await candidates.getErrorCandidate(candidate.id)).state,'promotion_pending');
});

test('ERR-00 correction and post-promotion retraction retain audit provenance',async()=>{
  const envelope=qualifiedEnvelope('retract');
  const candidate=await candidates.createErrorCandidate({id:'err-retract',category:'distractor',target:envelope.activitySpec.target,envelope});
  await candidates.confirmErrorCandidate(candidate.id,{decisionId:'confirm',authority:{kind:'direct-user',version:1,userId:'learner'},at:1});
  const promoted=await candidates.promoteErrorCandidate(candidate.id);
  const corrected=await candidates.correctErrorCandidate(candidate.id,{decisionId:'correction',reason:'wrong classification',at:2});
  assert.equal(corrected.decisionHistory.at(-1).supersedes,'confirm');
  const retracted=await candidates.retractErrorCandidate(candidate.id,{decisionId:'retraction',reason:'learner correction',at:3});
  assert.equal(retracted.promotion.occurrenceId,promoted.promotion.occurrenceId);
  assert.equal(retracted.retraction.occurrenceId,promoted.promotion.occurrenceId);
  assert.equal((await candidates.correctErrorCandidate(candidate.id,{decisionId:'correction',reason:'wrong classification',at:2})).decisionHistory.length,3);
  assert.equal((await candidates.retractErrorCandidate(candidate.id,{decisionId:'retraction',reason:'learner correction',at:3})).decisionHistory.length,3);
});

test('ERR-00 rejects future or tampered stored candidate rows and never trusts caller correction decisions',async()=>{
  await putV10Records(V10_STORES.workflowIntents,[{id:'err-future-row',kind:'err-00-error-candidate',schemaVersion:999,state:'confirmed'}],'fixture-future-candidate');
  await assert.rejects(candidates.getErrorCandidate('err-future-row'),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID');
  const envelope=qualifiedEnvelope('r2-correction');const candidate=await candidates.createErrorCandidate({id:'err-r2-correction',category:'distractor',target:envelope.activitySpec.target,envelope});
  await candidates.confirmErrorCandidate(candidate.id,{decisionId:'r2-confirm',authority:{kind:'direct-user',version:1,userId:'learner'},at:1});
  const promoted=await candidates.promoteErrorCandidate(candidate.id);
  const before=await getV10Record(V10_STORES.globalErrorRecords,promoted.promotion.errorRecordId);
  await assert.rejects(candidates.correctErrorCandidate(candidate.id,{decisionId:'r2-forged-correction',at:2,qualifiedCorrectionEnvelope:{decision:{eligible:true,affectsSchedule:true,successful:true,target:envelope.activitySpec.target},attempt:{id:'forged'}}}),error=>error.code==='ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED');
  assert.equal((await getV10Record(V10_STORES.globalErrorRecords,promoted.promotion.errorRecordId)).status,before.status);
});

test('ERR-00 stores the canonical EvidencePolicy version and makes omitted-at replays stable',async()=>{
  const envelope=qualifiedEnvelope('r2-authority');const candidate=await candidates.createErrorCandidate({id:'err-r2-authority',category:'distractor',target:envelope.activitySpec.target,envelope});
  const once=await candidates.confirmErrorCandidate(candidate.id,{decisionId:'evidence-r2',envelope});
  const twice=await candidates.confirmErrorCandidate(candidate.id,{decisionId:'evidence-r2',envelope});
  assert.equal(once.decision.authority.version,'phase0-evidence-v1');
  assert.equal(twice.decisionHistory.length,1);
});

test('ERR-00 requires v2 row digests, validates correction before journaling, and records direct occurrence collisions',async()=>{
  const envelope=qualifiedEnvelope('r3');const candidate=await candidates.createErrorCandidate({id:'err-r3-digest',category:'distractor',target:envelope.activitySpec.target,envelope});const raw=await getV10Record(V10_STORES.workflowIntents,candidate.id);delete raw.rowDigest;raw.category='tampered';
  await putV10Records(V10_STORES.workflowIntents,[raw],'r3-tamper');await assert.rejects(candidates.promoteErrorCandidate(candidate.id,{envelope}),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID');
  const cleanCandidate=await candidates.createErrorCandidate({id:'err-r3-atomic',category:'distractor',target:envelope.activitySpec.target,envelope});await candidates.confirmErrorCandidate(cleanCandidate.id,{decisionId:'confirm',authority:{kind:'direct-user',version:1,userId:'u'},at:1});const promoted=await candidates.promoteErrorCandidate(cleanCandidate.id);const before=JSON.stringify(await candidates.getErrorCandidate(cleanCandidate.id));await assert.rejects(candidates.correctErrorCandidate(cleanCandidate.id,{decisionId:'bad',qualifiedCorrectionEnvelope:{attempt:{id:'x'}}}),error=>error.code==='ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED');assert.equal(JSON.stringify(await candidates.getErrorCandidate(cleanCandidate.id)),before);
  const collision=await candidates.createErrorCandidate({id:'err-r3-collision',category:'distractor',target:envelope.activitySpec.target,envelope});await candidates.confirmErrorCandidate(collision.id,{decisionId:'confirm',authority:{kind:'direct-user',version:1,userId:'u'},at:1});await recordErrorOccurrence({occurrenceId:collision.occurrenceId,target:collision.target,category:'other',attemptId:collision.binding.attemptId,receiptId:collision.binding.receiptId,occurredAt:1});await assert.rejects(candidates.promoteErrorCandidate(collision.id),error=>error.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION');assert.equal((await candidates.getErrorCandidate(collision.id)).collision.code,'ERROR_CANDIDATE_OCCURRENCE_COLLISION');
});

test('ERR-00 rejects a semantically forged v2 row even when its attacker recomputes rowDigest',async()=>{
  const envelope=qualifiedEnvelope('r4-semantic');const candidate=await candidates.createErrorCandidate({id:'err-r4-semantic',category:'distractor',target:envelope.activitySpec.target,envelope});const row=await getV10Record(V10_STORES.workflowIntents,candidate.id);row.state='confirmed';row.decisionHistory=[{id:'forged',kind:'correction',disposition:'confirmed',authority:{kind:'direct-user',version:1,userId:'u',decisionId:null,reason:null,decisionDigest:null},reason:'forged',at:1,supersedes:null,bindingDigest:null}];row.decision=row.decisionHistory[0];delete row.rowDigest;row.rowDigest=learningContractDigest(row);await putV10Records(V10_STORES.workflowIntents,[row],'r4-semantic');await assert.rejects(candidates.promoteErrorCandidate(candidate.id),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID');
});

function resealCandidateRow(row){delete row.rowDigest;row.rowDigest=learningContractDigest(row);return row;}

async function storedEvidenceCandidate(id){
  const envelope=qualifiedEnvelope(id);
  const candidate=await candidates.createErrorCandidate({id:`err-r5-${id}`,category:'distractor',target:envelope.activitySpec.target,envelope});
  await candidates.confirmErrorCandidate(candidate.id,{decisionId:`evidence-r5-${id}`,envelope,at:11});
  return {candidate,envelope,row:await getV10Record(V10_STORES.workflowIntents,candidate.id)};
}

test('ERR-00 rejects creation target substitution before a candidate can bind an envelope',async()=>{
  const envelope=qualifiedEnvelope('r5-create-target');
  await assert.rejects(
    candidates.createErrorCandidate({id:'err-r5-create-target',category:'distractor',target:{...envelope.activitySpec.target,cardId:'substituted-card'},envelope}),
    error=>error.code==='ERROR_CANDIDATE_TARGET_MISMATCH'
  );
  assert.equal(await getV10Record(V10_STORES.workflowIntents,'err-r5-create-target'),undefined);
});

test('ERR-00 stored v2 mutation matrix fails closed even with attacker-recomputed digests',async()=>{
  const mutations={
    targetBindingMismatch:row=>{row.target.cardId='other-card';},
    occurrenceIdentity:row=>{row.occurrenceId='err-00:attacker-chosen';},
    missingRequired:row=>{delete row.claimDigest;},
    targetExtra:row=>{row.target.extra='forged';},
    advisoryType:row=>{row.advisory.observedAt='not-finite';},
    bindingExtra:row=>{row.binding.extra='forged';},
    evidenceBindingDigest:row=>{row.decision.bindingDigest=null;row.decisionHistory[0].bindingDigest=null;},
    evidenceForRejection:row=>{row.state='rejected';row.decision.kind='rejection';row.decision.disposition='rejected';row.decisionHistory[0].kind='rejection';row.decisionHistory[0].disposition='rejected';},
    directCarriesEvidence:row=>{const authority={kind:'direct-user',version:1,userId:'u',decisionId:'forged',reason:'forged',decisionDigest:'forged'};row.decision.authority=authority;row.decisionHistory[0].authority=structuredClone(authority);},
    pendingMismatch:row=>{row.state='promotion_pending';row.promotion={status:'pending',decisionId:'wrong',expectedOccurrenceDigest:'wrong',occurrenceId:'wrong',at:11};},
    promotedMismatch:row=>{row.state='promoted';row.promotion={status:'promoted',decisionId:row.decision.id,occurrenceId:'error-occurrence:wrong',errorRecordId:'wrong',occurrenceDigest:'wrong',at:11};},
    retractionMismatch:row=>{row.state='promoted';row.promotion={status:'promoted',decisionId:row.decision.id,occurrenceId:'error-occurrence:wrong',errorRecordId:'wrong',occurrenceDigest:'wrong',at:11};row.retraction={decisionId:'missing',occurrenceId:'wrong',errorRecordId:'wrong',reason:'x',at:12};},
    collisionMismatch:row=>{row.state='promotion_pending';row.promotion={status:'pending',decisionId:row.decision.id,expectedOccurrenceDigest:'wrong',occurrenceId:'wrong',at:11};row.collision={code:'ERROR_CANDIDATE_OCCURRENCE_COLLISION',expectedDigest:'wrong',observedDigest:'wrong',at:12};},
    sourceErrorMismatch:row=>{row.sourceError=true;}
  };
  for(const [name,mutate] of Object.entries(mutations)){
    const {candidate,row}=await storedEvidenceCandidate(`matrix-${name}`);
    mutate(row);resealCandidateRow(row);
    await putV10Records(V10_STORES.workflowIntents,[row],`r5-matrix-${name}`);
    await assert.rejects(candidates.promoteErrorCandidate(candidate.id),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID',name);
    assert.equal(await getV10Record(V10_STORES.globalErrorOccurrences,`error-occurrence:err-00:${candidate.id}`),undefined,name);
  }
});

test('ERR-00 safely upgrades an exact legacy v1 promoting row only through a v2 journal',async()=>{
  const {candidate,row}=await storedEvidenceCandidate('legacy');
  row.schemaVersion=1;row.state='promoting';delete row.rowDigest;
  await putV10Records(V10_STORES.workflowIntents,[row],'r5-legacy-v1');
  const reopened=await candidates.getErrorCandidate(candidate.id);
  assert.equal(reopened.state,'promotion_pending');
  await candidates.correctErrorCandidate(candidate.id,{decisionId:'legacy-annotation',reason:'legacy read mutation',at:12});
  const durable=await getV10Record(V10_STORES.workflowIntents,candidate.id);
  assert.equal(durable.schemaVersion,2);
  assert.equal(typeof durable.rowDigest,'string');
  const promoted=await candidates.promoteErrorCandidate(candidate.id);
  assert.equal(promoted.state,'promoted');
});

test('ERR-00 rejects a recomputed-digest promoted row whose occurrence or record identity is forged',async()=>{
  const {candidate}=await storedEvidenceCandidate('r6-promoted-digest');
  await candidates.promoteErrorCandidate(candidate.id);
  const row=await getV10Record(V10_STORES.workflowIntents,candidate.id);
  row.promotion.occurrenceDigest='forged-but-nonempty';
  resealCandidateRow(row);
  await putV10Records(V10_STORES.workflowIntents,[row],'r6-forged-promoted-digest');
  await assert.rejects(candidates.getErrorCandidate(candidate.id),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID');
});

test('ERR-00 rejects correction of OPEN candidate with byte-zero mutation',async()=>{
  const candidate=await candidates.createErrorCandidate({id:'err-r6-open-correction',category:'distractor',target:{cardId:'card-r6',senseId:'sense-r6',skill:'recall',sourceId:'core-card:card-r6',sourceRevision:'rev-r6'}});
  const before=JSON.stringify(await getV10Record(V10_STORES.workflowIntents,candidate.id));
  await assert.rejects(candidates.correctErrorCandidate(candidate.id,{decisionId:'r6-open-correction',at:1}),error=>error.code==='ERROR_CANDIDATE_CORRECTION_REQUIRES_DECISION');
  assert.equal(JSON.stringify(await getV10Record(V10_STORES.workflowIntents,candidate.id)),before);
});

test('ERR-00 preserves a retraction revision when a later correction annotation is appended',async()=>{
  const {candidate}=await storedEvidenceCandidate('r6-retract-correct');
  await candidates.promoteErrorCandidate(candidate.id);
  await candidates.retractErrorCandidate(candidate.id,{decisionId:'r6-retract',reason:'retracted',at:20});
  const corrected=await candidates.correctErrorCandidate(candidate.id,{decisionId:'r6-correct-after-retract',reason:'later annotation',at:21});
  assert.equal(corrected.decisionHistory.at(-2).kind,'retraction');
  assert.equal((await candidates.getErrorCandidate(candidate.id)).decisionHistory.at(-1).kind,'correction');
});

test('ERR-00 retries a durable pending collision without rewriting the candidate or calling P1 again',async()=>{
  const {candidate}=await storedEvidenceCandidate('r6-collision-retry');
  await recordErrorOccurrence({occurrenceId:candidate.occurrenceId,target:candidate.target,category:'other',attemptId:candidate.binding.attemptId,receiptId:candidate.binding.receiptId,occurredAt:1});
  await assert.rejects(candidates.promoteErrorCandidate(candidate.id),error=>error.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION');
  const before=JSON.stringify(await getV10Record(V10_STORES.workflowIntents,candidate.id));
  await new Promise(resolve=>setTimeout(resolve,5));
  await assert.rejects(candidates.promoteErrorCandidate(candidate.id),error=>error.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION');
  assert.equal(JSON.stringify(await getV10Record(V10_STORES.workflowIntents,candidate.id)),before);
});
