import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { composeTodayPlan } from '../src/today-composer.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { createSourceRevisionRegistry,createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import * as qar from '../src/question-activity-contracts.js';
import { executeListeningValueSlice,confirmListeningErrorCandidate } from '../src/listening-value-slice.js';
import { createErrorCandidate,getErrorCandidate,listErrorCandidates,promoteErrorCandidate } from '../src/error-candidate.js';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { deleteV10Record,getV10Record,listV10Records,putV10Records,reopenV10Database } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { listReviewEvents,reopenCoreDatabase } from '../src/persistence.js';

globalThis.indexedDB=new IDBFactory();

const exactKeys=(value,keys)=>assert.deepEqual(Object.keys(value).sort(),[...keys].sort());
const runRowId=activity=>`today-run:${activity.id}`;
const SLICE_PRODUCER='wave2-listening-value-slice';
const SLICE_CATEGORY='listening-multiple-choice';

function sliceConfigDigest(feedback){return learningContractDigest({questionId:feedback.questionId,sourceRevisionRef:feedback.sourceRevisionRef,feedbackBindingDigest:feedback.bindingDigest});}
function forgedSliceId(envelope,configDigest){return`wave2-listening:${learningContractDigest({producer:SLICE_PRODUCER,producerVersion:'1',category:SLICE_CATEGORY,configDigest,activitySpecId:envelope.activitySpec.id,runId:envelope.run.id,attemptId:envelope.attempt.id,receiptId:envelope.receipt.id,target:envelope.activitySpec.target})}`;}
function forgedSliceCandidate(envelope,{configDigest,claim='wrong-listening-multiple-choice-response'}={}){return createErrorCandidate({id:forgedSliceId(envelope,configDigest),category:SLICE_CATEGORY,target:envelope.activitySpec.target,claim,learnerOutput:envelope.attempt.learnerOutput,envelope,advisory:{producer:SLICE_PRODUCER,producerVersion:'1',configDigest,observedAt:envelope.receipt.issuedAt},createdAt:envelope.receipt.issuedAt});}
function feedbackDigest(feedback){const binding=structuredClone(feedback);delete binding.bindingDigest;delete binding.stale;delete binding.staleReason;return learningContractDigest(binding);}

function fixture(label){
  const provenance={origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'};
  const sourceId=`wave2-source-${label}`;
  const aggregate=createTranscriptAggregate({
    source:{id:sourceId,status:'verified',complete:true,url:`https://private.invalid/${label}?token=PRIVATE_TOKEN_${label}`},
    segments:[
      {startMs:0,endMs:1000,text:`TRANSCRIPT_BODY_${label} noon.`,status:'verified',aligned:true},
      {startMs:1000,endMs:2000,text:'Bring your ticket.',status:'verified',aligned:true}
    ],
    provenance,
    createdAt:1
  });
  const item={
    id:`wave2-item-${label}`,
    kind:qar.LISTENING_MULTIPLE_CHOICE_KIND,
    prompt:'When does the train leave?',
    options:[
      {id:`correct-${label}`,text:'At noon',correct:true,rationale:`SEALED_CORRECT_RATIONALE_${label}`},
      {id:`wrong-${label}`,text:'At night',correct:false,rationale:`SELECTED_WRONG_RATIONALE_${label}`}
    ],
    target:{cardId:`wave2-card-${label}`,senseId:null,skill:'listening'},
    sourceAnchor:{sourceId,revisionId:aggregate.revision.id,integrity:aggregate.revision.contentDigest,segmentIds:aggregate.revision.segmentIds,startMs:0,endMs:2000},
    status:'verified',
    provenance:{status:'verified',verifiedBy:'reviewer',rights:'allowed'},
    createdAt:1,
    updatedAt:2
  };
  return{aggregate,item};
}

async function harness(label){
  const data=fixture(label);
  let ownerAggregate=data.aggregate;
  let sourceAggregate=data.aggregate;
  const owner=qar.createListeningQuestionOwnerAdapter({
    readVerifiedItem:async id=>id===data.item.id?data.item:null,
    getTranscriptAggregate:async id=>id===data.aggregate.revision.id?ownerAggregate:null
  });
  const sourceAdapter=createTranscriptSourceAdapter({getTranscriptAggregate:async id=>id===data.aggregate.revision.id?sourceAggregate:null});
  const reference=sourceAdapter.createRef(data.aggregate);
  const question=await qar.adaptListeningMultipleChoiceItem(data.item,reference,{ownerAdapter:owner});
  const questionRegistry=qar.createQuestionRegistry();
  questionRegistry.registerExecutor(question.kind,question.version,['audio-playback','focus','keyboard','screen-reader']);
  const score=qar.scoreQuestionActivity(question,{optionId:data.item.options[0].id});
  const target={...question.item.target,sourceId:reference.sourceId,sourceRevision:reference.revisionId};
  const plan=composeTodayPlan({dueReviews:[{id:`wave2-activity-${label}`,type:'listening-multiple-choice',target,executor:'qar-listening-multiple-choice',estimatedSeconds:60}],now:100_000,minutes:5});
  const activity={
    ...plan.activities[0],
    execution:{kind:'qar-listening-multiple-choice',status:'ready'},
    assistanceCollectionMode:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,
    launchBinding:`wave2:${label}`,
    launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},
    evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.LISTENING_MULTIPLE_CHOICE_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}
  };
  const base={activity,question,sourceRegistry:createSourceRevisionRegistry({adapters:[sourceAdapter]}),questionRegistry};
  return{...data,reference,question,activity,base,correctResponse:{optionId:data.item.options[0].id},wrongResponse:{optionId:data.item.options[1].id},setOwner:value=>{ownerAggregate=value;},setSource:value=>{sourceAggregate=value;}};
}

function assertAdvisoryShape(result){
  exactKeys(result,['kind','version','coverage','run','score','feedback','errorCandidate','weaknessSignal','recommendationPreview']);
  assert.equal(result.kind,'listening-value-slice-result');
  assert.equal(result.version,1);
  assert.equal(result.coverage,'ONE_LISTENING_MULTIPLE_CHOICE_PROOF');
  exactKeys(result.weaknessSignal,['kind','version','qualification','profileAuthority','dimension','candidateId','activitySpecId','attemptId','receiptId','sourceRevisionRef','bindingDigest']);
  assert.equal(result.weaknessSignal.kind,'advisory-weakness-signal');
  assert.equal(result.weaknessSignal.qualification,'ADVISORY_ONLY');
  assert.equal(result.weaknessSignal.profileAuthority,null);
  assert.equal(result.weaknessSignal.dimension,'listening.multiple-choice');
  exactKeys(result.recommendationPreview,['kind','version','status','activityKind','reason','candidateId','dueReviewPrecedence','schedulingEffect','providerCall','persistent','bindingDigest']);
  assert.equal(result.recommendationPreview.kind,'recommendation-preview');
  assert.equal(result.recommendationPreview.status,'NONPERSISTENT_ADVISORY');
  assert.equal(result.recommendationPreview.activityKind,'listening-multiple-choice');
  assert.equal(result.recommendationPreview.reason,'review-listening-multiple-choice');
  assert.equal(result.recommendationPreview.dueReviewPrecedence,'PRESERVED');
  assert.equal(result.recommendationPreview.schedulingEffect,'NONE');
  assert.equal(result.recommendationPreview.providerCall,'NONE');
  assert.equal(result.recommendationPreview.persistent,false);
  assert.equal(Object.isFrozen(result),true);
  assert.equal(Object.isFrozen(result.run),true);
  assert.equal(Object.isFrozen(result.feedback),true);
  assert.equal(Object.isFrozen(result.errorCandidate),true);
  assert.equal(Object.isFrozen(result.weaknessSignal),true);
  assert.equal(Object.isFrozen(result.weaknessSignal.sourceRevisionRef),true);
  assert.equal(Object.isFrozen(result.recommendationPreview),true);
}

test('wrong Listening execution creates one exact OPEN candidate and frozen nonpersistent advisories',async()=>{
  const h=await harness('wrong');
  const beforeCandidates=(await listErrorCandidates()).length;
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:101_000});
  assert.equal(result.score.disposition,'wrong');
  assert.equal(result.run.status,'completed');
  assert.equal(result.errorCandidate.state,'open');
  assert.equal(result.errorCandidate.category,'listening-multiple-choice');
  assert.equal(result.errorCandidate.advisory.producer,'wave2-listening-value-slice');
  assert.equal((await listErrorCandidates()).length,beforeCandidates+1);
  assertAdvisoryShape(result);
  const envelope=result.run.envelope;
  assert.equal(result.errorCandidate.binding.activitySpecId,envelope.activitySpec.id);
  assert.equal(result.errorCandidate.binding.attemptId,envelope.attempt.id);
  assert.equal(result.errorCandidate.binding.receiptId,envelope.receipt.id);
  assert.deepEqual(result.errorCandidate.target,envelope.activitySpec.target);
  assert.equal(result.weaknessSignal.candidateId,result.errorCandidate.id);
  assert.equal(result.weaknessSignal.activitySpecId,envelope.activitySpec.id);
  assert.equal(result.weaknessSignal.attemptId,envelope.attempt.id);
  assert.equal(result.weaknessSignal.receiptId,envelope.receipt.id);
  assert.deepEqual(result.weaknessSignal.sourceRevisionRef,result.feedback.sourceRevisionRef);
  assert.match(result.weaknessSignal.bindingDigest,/^fnv1a64:/);
  assert.match(result.recommendationPreview.bindingDigest,/^fnv1a64:/);
  assert.throws(()=>{result.weaknessSignal.sourceRevisionRef.sourceId='other';},TypeError);
});

test('correct Listening response returns only canonical QAR result and creates no advisory candidate',async()=>{
  const h=await harness('correct');
  const before=(await listErrorCandidates()).length;
  const result=await executeListeningValueSlice({...h.base,response:h.correctResponse,now:102_000});
  assert.equal(result.score.disposition,'correct');
  assert.equal(result.errorCandidate,null);
  assert.equal(result.weaknessSignal,null);
  assert.equal(result.recommendationPreview,null);
  assert.equal((await listErrorCandidates()).length,before);
  assert.equal(result.run.envelope.decision.eligible,false);
});

test('exact replay and concurrent duplicates are idempotent while alternate terminal input creates no second candidate',async()=>{
  const h=await harness('replay');
  const input={...h.base,response:h.wrongResponse,now:103_000};
  const [first,concurrent]=await Promise.all([executeListeningValueSlice(input),executeListeningValueSlice(input)]);
  assert.equal(first.errorCandidate.id,concurrent.errorCandidate.id);
  assert.equal(JSON.stringify(first.weaknessSignal),JSON.stringify(concurrent.weaknessSignal));
  assert.equal(JSON.stringify(first.recommendationPreview),JSON.stringify(concurrent.recommendationPreview));
  assert.equal((await listErrorCandidates()).filter(row=>row.id===first.errorCandidate.id).length,1);
  const winner=JSON.stringify(first.run.envelope);
  const trace={kind:'AssistanceTrace',schemaVersion:1,id:'wave2-replay-trace',collector:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,complete:true,revealed:true,hintUsed:false,transcriptViewed:false,correctionExposed:false,retryAfterExposure:false,coaching:false,answerExposed:false,events:[{sequence:1,type:'reveal',at:103_100,metadata:{}}]};
  await assert.rejects(executeListeningValueSlice({...h.base,response:h.wrongResponse,assistance:trace,now:103_100}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  await assert.rejects(executeListeningValueSlice({...h.base,response:h.correctResponse,now:103_200}),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','TODAY_RUN_TERMINAL_CONFLICT'].includes(error.code));
  assert.equal((await listErrorCandidates()).filter(row=>row.id===first.errorCandidate.id).length,1);
  assert.equal(JSON.stringify((await getV10Record(V10_STORES.todayRuns,runRowId(h.activity))).envelope),winner);
});

test('retry composes an already durable wrong QAR Receipt without duplicating the terminal result',async()=>{
  const h=await harness('resume');
  const qarResult=await qar.executeQuestionActivity({...h.base,response:h.wrongResponse,now:104_000});
  const before=(await listErrorCandidates()).length;
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:104_100});
  assert.equal(result.run.receiptId,qarResult.run.receiptId);
  assert.equal(JSON.stringify(result.feedback),JSON.stringify(qarResult.feedback));
  assert.equal((await listErrorCandidates()).length,before+1);
  assert.equal(result.errorCandidate.binding.receiptId,qarResult.run.envelope.receipt.id);
});

test('wrapper validation and slice ownership reject hostile confirmation without mutation',async()=>{
  const h=await harness('validation');
  let reads=0;
  const hostile={...h.base,response:h.wrongResponse};
  Object.defineProperty(hostile,'now',{enumerable:true,get(){reads+=1;throw new Error('getter invoked');}});
  await assert.rejects(executeListeningValueSlice(hostile),error=>error.code==='LISTENING_VALUE_SLICE_INPUT_INVALID');
  assert.equal(reads,0);
  assert.equal((await getV10Record(V10_STORES.todayRuns,runRowId(h.activity)))==null,true);
  const symbolInput={...h.base,response:h.wrongResponse};symbolInput[Symbol('provider')]=()=>{providerCalls+=1;};
  await assert.rejects(executeListeningValueSlice(symbolInput),error=>error.code==='LISTENING_VALUE_SLICE_INPUT_INVALID');
  let providerCalls=0;
  await assert.rejects(executeListeningValueSlice({...h.base,response:h.wrongResponse,provider:()=>{providerCalls+=1;}}),error=>error.code==='LISTENING_VALUE_SLICE_INPUT_INVALID');
  assert.equal(providerCalls,0);
  const foreign=await createErrorCandidate({id:'wave2-foreign-candidate',category:'listening-multiple-choice',target:{cardId:'foreign',senseId:null,skill:'listening',sourceId:'foreign-source',sourceRevision:'foreign-revision'},claim:'foreign',advisory:{producer:'other-producer',producerVersion:'1',configDigest:'foreign'}});
  await assert.rejects(confirmListeningErrorCandidate(foreign.id,{userId:'u',decisionId:'d'}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(foreign.id)).state,'open');
  let optionReads=0;const options={userId:'u',decisionId:'d'};Object.defineProperty(options,'model',{enumerable:true,get(){optionReads+=1;return true;}});
  await assert.rejects(confirmListeningErrorCandidate(foreign.id,options),error=>error.code==='LISTENING_VALUE_SLICE_CONFIRMATION_INVALID');
  assert.equal(optionReads,0);
  for(const invalid of [{decisionId:'d'},{userId:'u'},{userId:'u',decisionId:'d',eligibility:true},{userId:'u',decisionId:'d',at:Infinity}])await assert.rejects(confirmListeningErrorCandidate(foreign.id,invalid),error=>error.code==='LISTENING_VALUE_SLICE_CONFIRMATION_INVALID');
});

test('direct-user confirmation is non-promoting and existing ERR promotion is exactly once',async()=>{
  const h=await harness('confirm');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:105_000});
  const beforeOccurrences=(await listV10Records(V10_STORES.globalErrorOccurrences,{sortBy:null})).length;
  const confirmed=await confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'wave2-confirm',reason:'I confirm this error',at:105_100});
  assert.equal(confirmed.state,'confirmed');
  assert.equal(confirmed.decision.authority.kind,'direct-user');
  assert.equal(confirmed.decision.authority.userId,'learner');
  assert.equal((await listV10Records(V10_STORES.globalErrorOccurrences,{sortBy:null})).length,beforeOccurrences);
  const promoted=await promoteErrorCandidate(confirmed.id);
  const replay=await promoteErrorCandidate(confirmed.id);
  assert.equal(promoted.state,'promoted');
  assert.equal(replay.promotion.occurrenceId,promoted.promotion.occurrenceId);
  assert.equal((await listV10Records(V10_STORES.globalErrorOccurrences,{sortBy:null})).filter(row=>row.id===promoted.promotion.occurrenceId).length,1);
});

test('preview performs no scheduling/provider write and persisted state contains no advisory or sealed data',async()=>{
  const h=await harness('privacy');
  const beforeReviews=await listReviewEvents();
  const beforeActivities=await listV10Records(V10_STORES.activities,{sortBy:null});
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:106_000});
  assert.equal(result.run.envelope.decision.eligible,false);
  assert.equal(result.score.affectsSchedule,false);
  assert.equal((await listReviewEvents()).length,beforeReviews.length);
  assert.equal(JSON.stringify(await listV10Records(V10_STORES.activities,{sortBy:null})),JSON.stringify(beforeActivities));
  const row=await getV10Record(V10_STORES.workflowIntents,result.errorCandidate.id);
  const persisted=JSON.stringify({run:await getV10Record(V10_STORES.todayRuns,result.run.id),candidate:row});
  for(const sentinel of [`correct-${'privacy'}`,`SEALED_CORRECT_RATIONALE_privacy`,'TRANSCRIPT_BODY_privacy','PRIVATE_TOKEN_privacy','recommendation-preview','advisory-weakness-signal','https://private.invalid'])assert.equal(persisted.includes(sentinel),false,sentinel);
  for(const key of ['correctOptionId','expectedResponse','correct'])assert.equal(persisted.includes(`"${key}"`),false,key);
});

test('combined backup restore reopen retains canonical state while reconstructing byte-equal preview only on replay',async()=>{
  const h=await harness('backup');
  const first=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:107_000});
  await confirmListeningErrorCandidate(first.errorCandidate.id,{userId:'learner',decisionId:'wave2-backup-confirm',at:107_100});
  const promoted=await promoteErrorCandidate(first.errorCandidate.id);
  const backup=await buildCombinedBackup();
  const serialized=JSON.stringify(backup);
  for(const sentinel of ['recommendation-preview','advisory-weakness-signal',`correct-backup`,'SEALED_CORRECT_RATIONALE_backup','TRANSCRIPT_BODY_backup','PRIVATE_TOKEN_backup','https://private.invalid'])assert.equal(serialized.includes(sentinel),false,sentinel);
  const restored=await restoreCombinedBackup(backup);
  assert.equal(restored.durable,true);
  await reopenCoreDatabase();
  await reopenV10Database();
  const run=await getV10Record(V10_STORES.todayRuns,first.run.id);
  const candidate=await getErrorCandidate(first.errorCandidate.id);
  const occurrence=await getV10Record(V10_STORES.globalErrorOccurrences,promoted.promotion.occurrenceId);
  assert.deepEqual(run.envelope.receipt.metadata.feedback,first.feedback);
  assert.equal(candidate.state,'promoted');
  assert.ok(occurrence);
  const replay=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:107_900});
  assert.equal(replay.errorCandidate.state,'promoted');
  assert.equal(JSON.stringify(replay.weaknessSignal),JSON.stringify(first.weaknessSignal));
  assert.equal(JSON.stringify(replay.recommendationPreview),JSON.stringify(first.recommendationPreview));
});

test('post-adaptation source mismatch fails through QAR before any advisory candidate',async()=>{
  const h=await harness('source-mismatch');
  const before=(await listErrorCandidates()).length;
  h.setOwner({...h.aggregate,revision:{...h.aggregate.revision,contentDigest:'tampered-integrity'}});
  await assert.rejects(executeListeningValueSlice({...h.base,response:h.wrongResponse,now:108_000}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');
  assert.equal((await listErrorCandidates()).length,before);
  assert.equal((await getV10Record(V10_STORES.todayRuns,runRowId(h.activity)))==null,true);
});

test('tampered canonical feedback and candidate state fail closed without a second advisory effect',async()=>{
  const h=await harness('tamper');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:109_000});
  const count=(await listErrorCandidates()).length;
  const today=await getV10Record(V10_STORES.todayRuns,result.run.id);
  today.envelope.attempt.metadata.feedback.questionId='forged-question';
  await putV10Records(V10_STORES.todayRuns,[today],'wave2-test-feedback-tamper');
  await assert.rejects(executeListeningValueSlice({...h.base,response:h.wrongResponse,now:109_100}),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','TODAY_RUN_STORED_INVALID','TODAY_RUN_INTEGRITY_INVALID'].includes(error.code));
  assert.equal((await listErrorCandidates()).length,count);
  const raw=await getV10Record(V10_STORES.workflowIntents,result.errorCandidate.id);
  raw.category='forged-category';
  await putV10Records(V10_STORES.workflowIntents,[raw],'wave2-test-candidate-tamper');
  await assert.rejects(confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'tamper-confirm'}),error=>error.code==='ERROR_CANDIDATE_STORED_INVALID');
  assert.equal((await listV10Records(V10_STORES.globalErrorOccurrences,{sortBy:null})).some(row=>row.id===result.errorCandidate.occurrenceId),false);
});

test('R1 rejects a forged slice-labelled candidate bound to a canonical non-QAR envelope',async()=>{
  const card={id:'r1-non-qar-card',senseId:'r1-non-qar-sense',front:'durable',back:'stable',type:'word'};
  const envelope=buildCoreEvidenceEnvelope({card,rating:'good',learnerOutput:'forged-selection',step:{id:'r1-non-qar-activity',kind:'typing',skill:'recall',receiptId:'r1-non-qar-receipt'},session:{id:'r1-non-qar-session',timezone:'UTC'},evaluation:{authority:'human-review',status:'verified',targetUsed:true},now:120_000});
  const candidate=await forgedSliceCandidate(envelope,{configDigest:'attacker-controlled-config'});
  await assert.rejects(confirmListeningErrorCandidate(candidate.id,{userId:'learner',decisionId:'r1-non-qar-confirm',at:120_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(candidate.id)).state,'open');
});

test('R1 rejects a forged config and matching formula ID over a real persisted wrong QAR terminal',async()=>{
  const h=await harness('r1-forged-config');
  const result=await qar.executeQuestionActivity({...h.base,response:h.wrongResponse,now:121_000});
  const candidate=await forgedSliceCandidate(result.run.envelope,{configDigest:'attacker-config',claim:'attacker-claim'});
  await assert.rejects(confirmListeningErrorCandidate(candidate.id,{userId:'learner',decisionId:'r1-config-confirm',at:121_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(candidate.id)).state,'open');
});

test('R1 rejects deterministic-ID preoccupation with a forged claim over an exact persisted QAR terminal',async()=>{
  const h=await harness('r1-forged-claim');
  const result=await qar.executeQuestionActivity({...h.base,response:h.wrongResponse,now:122_000});
  const candidate=await forgedSliceCandidate(result.run.envelope,{configDigest:sliceConfigDigest(result.feedback),claim:'attacker-controlled-claim'});
  await assert.rejects(confirmListeningErrorCandidate(candidate.id,{userId:'learner',decisionId:'r1-claim-confirm',at:122_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(candidate.id)).state,'open');
});

test('R1 authentic slice candidate confirms after durable reopen and process-style module reload',async()=>{
  const h=await harness('r1-reload');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:123_000});
  await reopenV10Database();
  const reloaded=await import(`../src/listening-value-slice.js?r1-reload=${Date.now()}`);
  const confirmed=await reloaded.confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'r1-reload-confirm',at:123_100});
  assert.equal(confirmed.state,'confirmed');
  assert.equal(confirmed.decision.authority.kind,'direct-user');
});

test('R1 rejects a genuine candidate when its durable Today row is missing',async()=>{
  const h=await harness('r1-missing-today');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:124_000});
  await deleteV10Record(V10_STORES.todayRuns,result.run.id,'wave2-r1-test-missing-today');
  await assert.rejects(confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'r1-missing-confirm',at:124_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(result.errorCandidate.id)).state,'open');
});

test('R1 rejects a genuine candidate when durable QAR feedback is tampered',async()=>{
  const h=await harness('r1-tampered-feedback');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:125_000});
  const today=await getV10Record(V10_STORES.todayRuns,result.run.id);
  today.envelope.receipt.metadata.feedback.selectedOptionId='forged-option';
  await putV10Records(V10_STORES.todayRuns,[today],'wave2-r1-test-feedback-tamper');
  await assert.rejects(confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'r1-feedback-confirm',at:125_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(result.errorCandidate.id)).state,'open');
});

test('R1 rejects a genuine candidate when the durable Today envelope has a future contract version',async()=>{
  const h=await harness('r1-future-envelope');
  const result=await executeListeningValueSlice({...h.base,response:h.wrongResponse,now:126_000});
  const today=await getV10Record(V10_STORES.todayRuns,result.run.id);
  today.envelope.receipt.version=999;
  await putV10Records(V10_STORES.todayRuns,[today],'wave2-r1-test-future-envelope');
  await assert.rejects(confirmListeningErrorCandidate(result.errorCandidate.id,{userId:'learner',decisionId:'r1-future-confirm',at:126_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(result.errorCandidate.id)).state,'open');
});

test('R1 rejects an internally re-digested Listening envelope whose Transcript provenance is no longer verified',async()=>{
  const h=await harness('r1-provenance');
  const result=await qar.executeQuestionActivity({...h.base,response:h.wrongResponse,now:127_000});
  const today=await getV10Record(V10_STORES.todayRuns,result.run.id);
  for(const metadata of [today.envelope.attempt.metadata,today.envelope.receipt.metadata]){
    metadata.feedback.sourceRevisionRef.provenance.verification='unknown';
    metadata.feedback.bindingDigest=feedbackDigest(metadata.feedback);
  }
  today.envelope.receipt.attemptDigest=learningContractDigest(today.envelope.attempt);
  today.terminal.digest=learningContractDigest({status:'completed',envelope:today.envelope});
  await putV10Records(V10_STORES.todayRuns,[today],'wave2-r1-test-provenance-redigest');
  const feedback=today.envelope.attempt.metadata.feedback;
  const candidate=await forgedSliceCandidate(today.envelope,{configDigest:sliceConfigDigest(feedback)});
  await assert.rejects(confirmListeningErrorCandidate(candidate.id,{userId:'learner',decisionId:'r1-provenance-confirm',at:127_100}),error=>error.code==='LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED');
  assert.equal((await getErrorCandidate(candidate.id)).state,'open');
});
