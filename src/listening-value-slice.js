import { executeQuestionActivity,validateQuestionActivity,LISTENING_MULTIPLE_CHOICE_KIND,LISTENING_MULTIPLE_CHOICE_REGISTRY_REVISION,LISTENING_MULTIPLE_CHOICE_SCORER_VERSION,LISTENING_ASSISTANCE_COLLECTION_MODE } from './question-activity-contracts.js';
import { createErrorCandidate,getErrorCandidate,confirmErrorCandidate } from './error-candidate.js';
import { learningContractDigest,validateFrozenRunBinding,validateLearningEnvelope,validateRun } from './learning-contracts.js';
import { createSourceRevisionRef } from './source-revision-ref.js';
import { getV10Record } from './v10-persistence.js';
import { V10_STORES } from './v10-contracts.js';
import { EVIDENCE_POLICY_VERSION } from './evidence-policy.js';

const RESULT_KIND='listening-value-slice-result';
const RESULT_VERSION=1;
const COVERAGE='ONE_LISTENING_MULTIPLE_CHOICE_PROOF';
const CANDIDATE_CATEGORY='listening-multiple-choice';
const CANDIDATE_PRODUCER='wave2-listening-value-slice';
const CANDIDATE_PRODUCER_VERSION='1';
const EXECUTE_REQUIRED=Object.freeze(['activity','question','response','sourceRegistry','questionRegistry']);
const EXECUTE_OPTIONAL=Object.freeze(['assistance','now']);
const CONFIRM_REQUIRED=Object.freeze(['userId','decisionId']);
const CONFIRM_OPTIONAL=Object.freeze(['reason','at']);
const FEEDBACK_BINDING_FIELDS=Object.freeze(['kind','version','questionId','activitySpecId','runId','attemptId','receiptId','sourceRevisionRef','sourceAnchor','promptRevision','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','selectedOptionId','disposition','rationale']);
const FEEDBACK_FIELDS=Object.freeze([...FEEDBACK_BINDING_FIELDS,'bindingDigest','stale','staleReason']);
const QUESTION_RESULT_FIELDS=Object.freeze(['normalizedResponse','disposition','numerator','denominator','reviewRequired','scorer','keyDigest','affectsSchedule']);

const failure=(code,message)=>Object.assign(new Error(message),{code});
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const nonblank=(value,max=240)=>typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;
const clone=value=>value==null?value:structuredClone(value);
const exact=(value,fields)=>plain(value)&&Object.keys(value).length===fields.length&&fields.every(key=>hasOwn(value,key));
const same=(left,right)=>learningContractDigest(left)===learningContractDigest(right);
const clean=(value,max=10_000)=>typeof value==='string'?value.trim().replace(/\s+/g,' ').slice(0,max):'';

function plain(value){
  try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}
}

function ownValues(input,required,optional,code,message){
  if(!plain(input))throw failure(code,message);
  let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(input);}catch{throw failure(code,message);}
  const allowed=new Set([...required,...optional]);
  const keys=Reflect.ownKeys(descriptors);
  if(keys.length<required.length||keys.some(key=>!allowed.has(key))||required.some(key=>!hasOwn(descriptors,key)))throw failure(code,message);
  const values={};
  for(const key of keys){const descriptor=descriptors[key];if(typeof key!=='string'||!hasOwn(descriptor,'value'))throw failure(code,message);values[key]=descriptor.value;}
  return values;
}

function deepFreeze(value,seen=new Set()){
  if(value===null||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}

function canonicalEnvelope(result){
  const envelope=result?.run?.envelope;
  if(!plain(envelope)||!plain(envelope.activitySpec)||!plain(envelope.run)||!plain(envelope.attempt)||!plain(envelope.receipt))throw failure('LISTENING_VALUE_SLICE_QAR_RESULT_INVALID','QAR did not return a canonical Listening envelope.');
  return envelope;
}

function assertListeningResult(result,question){
  const envelope=canonicalEnvelope(result);
  const feedback=result?.feedback;
  if(!plain(result)||!plain(result.run)||result.run.status!=='completed'||!plain(result.score)||!['correct','wrong'].includes(result.score.disposition)||!plain(feedback)||feedback.kind!=='question-feedback'||feedback.version!==1||feedback.disposition!==result.score.disposition||feedback.questionId!==question.id||feedback.activitySpecId!==envelope.activitySpec.id||feedback.runId!==envelope.run.id||feedback.attemptId!==envelope.attempt.id||feedback.receiptId!==envelope.receipt.id||learningContractDigest(feedback.sourceRevisionRef)!==learningContractDigest(question.sourceRevisionRef)||learningContractDigest(envelope.attempt.metadata?.feedback)!==learningContractDigest(feedback)||learningContractDigest(envelope.receipt.metadata?.feedback)!==learningContractDigest(feedback))throw failure('LISTENING_VALUE_SLICE_QAR_RESULT_INVALID','QAR did not return an exact canonical Listening result.');
  return envelope;
}

function candidateConfigDigest(result){
  return learningContractDigest({questionId:result.feedback.questionId,sourceRevisionRef:result.feedback.sourceRevisionRef,feedbackBindingDigest:result.feedback.bindingDigest});
}

function candidateIdentity(input){
  return `wave2-listening:${learningContractDigest({producer:CANDIDATE_PRODUCER,producerVersion:CANDIDATE_PRODUCER_VERSION,category:CANDIDATE_CATEGORY,configDigest:input.configDigest,activitySpecId:input.activitySpecId,runId:input.runId,attemptId:input.attemptId,receiptId:input.receiptId,target:input.target})}`;
}

function candidateIdForResult(result,envelope,configDigest){
  return candidateIdentity({configDigest,activitySpecId:envelope.activitySpec.id,runId:envelope.run.id,attemptId:envelope.attempt.id,receiptId:envelope.receipt.id,target:envelope.activitySpec.target});
}

function expectedCandidateId(candidate){
  const binding=candidate?.binding;
  return candidateIdentity({configDigest:candidate?.advisory?.configDigest,activitySpecId:binding?.activitySpecId,runId:binding?.runId,attemptId:binding?.attemptId,receiptId:binding?.receiptId,target:candidate?.target});
}

function ownedCandidate(candidate,candidateId){
  return candidate&&candidate.id===candidateId&&candidate.category===CANDIDATE_CATEGORY&&candidate.advisory?.producer===CANDIDATE_PRODUCER&&candidate.advisory?.producerVersion===CANDIDATE_PRODUCER_VERSION&&nonblank(candidate.advisory?.configDigest)&&candidateId===expectedCandidateId(candidate);
}

function exactFrozenValue(value,expected){return exact(value,['state','value'])&&value.state==='bound'&&value.value===expected;}
function boundFrozenValue(value){return exact(value,['state','value'])&&value.state==='bound'&&nonblank(value.value);}

function strictTranscriptReference(input,target){
  try{
    const normalized=createSourceRevisionRef(input);
    return input.version===1&&input.kind==='transcript'&&input.authority==='canonical-transcript-registry'&&input.tombstone===null&&input.provenance?.verification==='verified'&&input.provenance?.rights==='allowed'&&same(input,normalized)&&input.sourceId===target.sourceId&&input.revisionId===target.sourceRevision;
  }catch{return false;}
}

function exactQuestionResult(value,envelope,feedback){
  return exact(value,QUESTION_RESULT_FIELDS)&&exact(value.normalizedResponse,['optionId'])&&value.normalizedResponse.optionId===envelope.attempt.learnerOutput&&value.normalizedResponse.optionId===feedback.selectedOptionId&&value.disposition==='wrong'&&value.numerator===0&&value.denominator===1&&value.reviewRequired===false&&value.affectsSchedule===false&&exact(value.scorer,['id','version'])&&value.scorer.id===LISTENING_MULTIPLE_CHOICE_SCORER_VERSION&&value.scorer.version===1&&value.keyDigest===feedback.keyDigest;
}

function exactListeningFeedback(feedback,envelope,frozenBinding){
  if(!exact(feedback,FEEDBACK_FIELDS)||feedback.kind!=='question-feedback'||feedback.version!==1||!nonblank(feedback.questionId)||feedback.activitySpecId!==envelope.activitySpec.id||feedback.runId!==envelope.run.id||feedback.attemptId!==envelope.attempt.id||feedback.receiptId!==envelope.receipt.id||feedback.disposition!=='wrong'||feedback.selectedOptionId!==envelope.attempt.learnerOutput||!nonblank(feedback.rationale,2000)||feedback.stale!==false||feedback.staleReason!==null)return false;
  if(!exact(feedback.scorer,['id','version'])||feedback.scorer.id!==LISTENING_MULTIPLE_CHOICE_SCORER_VERSION||feedback.scorer.version!==1)return false;
  const target=envelope.activitySpec.target,anchor=feedback.sourceAnchor;
  if(!strictTranscriptReference(feedback.sourceRevisionRef,target)||!exact(anchor,['sourceId','revisionId','integrity','segmentIds','startMs','endMs'])||anchor.sourceId!==feedback.sourceRevisionRef.sourceId||anchor.revisionId!==feedback.sourceRevisionRef.revisionId||anchor.integrity!==feedback.sourceRevisionRef.integrity||!Array.isArray(anchor.segmentIds)||anchor.segmentIds.length===0||anchor.segmentIds.some(id=>!nonblank(id,500))||new Set(anchor.segmentIds).size!==anchor.segmentIds.length||!Number.isFinite(anchor.startMs)||!Number.isFinite(anchor.endMs)||anchor.startMs<0||anchor.endMs<=anchor.startMs)return false;
  const binding=Object.fromEntries(FEEDBACK_BINDING_FIELDS.map(key=>[key,clone(feedback[key])]));
  if(feedback.bindingDigest!==learningContractDigest(binding))return false;
  return exactFrozenValue(frozenBinding.launch.promptRevision,feedback.promptRevision)&&exactFrozenValue(frozenBinding.launch.configRevision,LISTENING_MULTIPLE_CHOICE_REGISTRY_REVISION)&&exactFrozenValue(frozenBinding.evaluation.keyRevision,feedback.keyRevision)&&exactFrozenValue(frozenBinding.evaluation.keyDigest,feedback.keyDigest)&&exactFrozenValue(frozenBinding.evaluation.rubricRevision,feedback.rubricRevision)&&exactFrozenValue(frozenBinding.evaluation.rubricDigest,feedback.rubricDigest)&&exactFrozenValue(frozenBinding.evaluation.scoringPolicyRevision,LISTENING_MULTIPLE_CHOICE_SCORER_VERSION)&&boundFrozenValue(frozenBinding.evaluation.reviewPolicyRevision);
}

function expectedCandidateBinding(envelope){
  return{
    activitySpecId:envelope.activitySpec.id,
    activitySpecDigest:learningContractDigest(envelope.activitySpec),
    runId:envelope.run.id,
    attemptId:envelope.attempt.id,
    attemptDigest:learningContractDigest(envelope.attempt),
    receiptId:envelope.receipt.id,
    receiptDigest:learningContractDigest(envelope.receipt),
    target:clone(envelope.activitySpec.target),
    digest:learningContractDigest({activitySpec:envelope.activitySpec,run:envelope.run,attempt:envelope.attempt,receipt:envelope.receipt})
  };
}

function canonicalTodayEnvelope(row){
  try{
    if(!plain(row)||row.kind!=='today-run-state'||row.schemaVersion!==2||row.status!=='completed'||!plain(row.envelope))return null;
    const validation=validateLearningEnvelope(row.envelope);if(!validation.valid)return null;const envelope=validation.value;
    if(['activitySpec','run','attempt','receipt'].some(key=>!same(row.envelope[key],envelope[key])))return null;
    const frozenValidation=validateFrozenRunBinding(row.frozenBinding),runValidation=validateRun(row.canonicalRun);
    if(!frozenValidation.valid||!runValidation.valid)return null;const frozen=frozenValidation.value;
    if(row.id!==envelope.run.id||row.activitySpecDigest!==learningContractDigest(envelope.activitySpec)||!same(row.activitySpec,envelope.activitySpec)||!same(row.canonicalRun,envelope.run)||!same(envelope.run.frozenBinding,frozen)||frozen.runId!==row.id||frozen.activitySpecId!==envelope.activitySpec.id||frozen.activitySpecDigest!==learningContractDigest(envelope.activitySpec)||!same(frozen.target,envelope.activitySpec.target))return null;
    if(envelope.activitySpec.type!==LISTENING_MULTIPLE_CHOICE_KIND||envelope.activitySpec.executor!=='qar-listening-multiple-choice'||envelope.activitySpec.target.skill!=='listening'||!exactFrozenValue(frozen.executor,'qar-listening-multiple-choice')||!exactFrozenValue(frozen.launch.configRevision,LISTENING_MULTIPLE_CHOICE_REGISTRY_REVISION)||!boundFrozenValue(frozen.launch.configDigest)||frozen.evaluation.marker!=='applicable'||!exactFrozenValue(frozen.evaluation.revision,LISTENING_MULTIPLE_CHOICE_REGISTRY_REVISION)||!exactFrozenValue(frozen.evidencePolicy.version,EVIDENCE_POLICY_VERSION)||!exactFrozenValue(frozen.assistance.collectionMode,LISTENING_ASSISTANCE_COLLECTION_MODE))return null;
    if(envelope.attempt.result!=='wrong'||envelope.attempt.assistance?.collector!==LISTENING_ASSISTANCE_COLLECTION_MODE||envelope.receipt.status!=='completed'||row.attemptId!==envelope.attempt.id||row.receiptId!==envelope.receipt.id||row.terminal?.status!=='completed'||row.terminal?.attemptId!==envelope.attempt.id||row.terminal?.receiptId!==envelope.receipt.id||row.terminal?.digest!==learningContractDigest({status:'completed',envelope:row.envelope})||row.terminal?.canonicalPersistence?.state!=='completed')return null;
    if(!plain(row.evidenceDecision)||row.evidenceDecision.eligible!==false||row.evidenceDecision.affectsSchedule!==false||!same(row.evidenceDecision,row.envelope.decision))return null;
    return{envelope,frozen};
  }catch{return null;}
}

async function authenticateCandidate(candidate,candidateId){
  if(!ownedCandidate(candidate,candidateId)||!candidate.binding||candidate.target?.skill!=='listening'||!candidate.target.sourceId||!candidate.target.sourceRevision)return false;
  const row=await getV10Record(V10_STORES.todayRuns,candidate.binding.runId);const canonical=canonicalTodayEnvelope(row);if(!canonical)return false;
  const {envelope,frozen}=canonical,attemptMetadata=envelope.attempt.metadata,receiptMetadata=envelope.receipt.metadata;
  if(!exact(attemptMetadata,['questionResult','feedback'])||!exact(receiptMetadata,['questionResult','feedback'])||!same(attemptMetadata.feedback,receiptMetadata.feedback)||!same(attemptMetadata.questionResult,receiptMetadata.questionResult))return false;
  const feedback=attemptMetadata.feedback;
  if(!exactListeningFeedback(feedback,envelope,frozen)||!exactQuestionResult(attemptMetadata.questionResult,envelope,feedback))return false;
  const expectedBinding=expectedCandidateBinding(envelope);if(!same(candidate.binding,expectedBinding)||!same(candidate.target,envelope.activitySpec.target))return false;
  const configDigest=candidateConfigDigest({feedback});if(candidate.advisory.configDigest!==configDigest)return false;
  const expectedId=candidateIdForResult({feedback},envelope,configDigest);if(candidate.id!==expectedId||candidateId!==expectedId)return false;
  const claimDigest=learningContractDigest({category:CANDIDATE_CATEGORY,claim:clean('wrong-listening-multiple-choice-response'),learnerOutput:clean(envelope.attempt.learnerOutput),expectedResponse:''});
  return candidate.claimDigest===claimDigest&&candidate.advisory.observedAt===envelope.receipt.issuedAt&&candidate.createdAt===envelope.receipt.issuedAt;
}

function weaknessSignal(candidate,envelope,feedback){
  const binding={
    kind:'advisory-weakness-signal',
    version:1,
    qualification:'ADVISORY_ONLY',
    profileAuthority:null,
    dimension:'listening.multiple-choice',
    candidateId:candidate.id,
    activitySpecId:envelope.activitySpec.id,
    attemptId:envelope.attempt.id,
    receiptId:envelope.receipt.id,
    sourceRevisionRef:clone(feedback.sourceRevisionRef)
  };
  return {...binding,bindingDigest:learningContractDigest(binding)};
}

function recommendationPreview(candidate,weakness){
  const preview={
    kind:'recommendation-preview',
    version:1,
    status:'NONPERSISTENT_ADVISORY',
    activityKind:'listening-multiple-choice',
    reason:'review-listening-multiple-choice',
    candidateId:candidate.id,
    dueReviewPrecedence:'PRESERVED',
    schedulingEffect:'NONE',
    providerCall:'NONE',
    persistent:false
  };
  return {...preview,bindingDigest:learningContractDigest({...preview,weaknessBindingDigest:weakness.bindingDigest,receiptId:weakness.receiptId})};
}

function publicResult(result,candidate=null,weakness=null,preview=null){
  return deepFreeze({kind:RESULT_KIND,version:RESULT_VERSION,coverage:COVERAGE,run:clone(result.run),score:clone(result.score),feedback:clone(result.feedback),errorCandidate:clone(candidate),weaknessSignal:clone(weakness),recommendationPreview:clone(preview)});
}

export async function executeListeningValueSlice(input={}){
  const values=ownValues(input,EXECUTE_REQUIRED,EXECUTE_OPTIONAL,'LISTENING_VALUE_SLICE_INPUT_INVALID','Listening value-slice input must contain exact data properties.');
  for(const key of EXECUTE_REQUIRED)if(!values[key]||typeof values[key]!=='object')throw failure('LISTENING_VALUE_SLICE_INPUT_INVALID','Listening value-slice required inputs must be objects.');
  if(hasOwn(values,'now')&&(!Number.isFinite(values.now)||values.now<0))throw failure('LISTENING_VALUE_SLICE_INPUT_INVALID','Listening value-slice time must be finite.');
  const validation=validateQuestionActivity(values.question);
  if(!validation.valid||validation.value.kind!==LISTENING_MULTIPLE_CHOICE_KIND)throw failure('LISTENING_VALUE_SLICE_QAR_RESULT_INVALID','Only the canonical Listening multiple-choice QAR kind is supported.');
  const result=await executeQuestionActivity({activity:values.activity,question:values.question,response:values.response,sourceRegistry:values.sourceRegistry,questionRegistry:values.questionRegistry,assistance:hasOwn(values,'assistance')?values.assistance:null,now:hasOwn(values,'now')?values.now:Date.now()});
  const envelope=assertListeningResult(result,validation.value);
  if(result.score.disposition==='correct')return publicResult(result);
  const configDigest=candidateConfigDigest(result);
  const candidateId=candidateIdForResult(result,envelope,configDigest);
  const occurredAt=envelope.receipt.issuedAt;
  const candidate=await createErrorCandidate({
    id:candidateId,
    category:CANDIDATE_CATEGORY,
    target:envelope.activitySpec.target,
    claim:'wrong-listening-multiple-choice-response',
    learnerOutput:envelope.attempt.learnerOutput,
    envelope,
    advisory:{producer:CANDIDATE_PRODUCER,producerVersion:CANDIDATE_PRODUCER_VERSION,configDigest,observedAt:occurredAt},
    createdAt:occurredAt
  });
  if(!ownedCandidate(candidate,candidateId))throw failure('LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED','Created candidate does not match the Listening value-slice owner binding.');
  const weakness=weaknessSignal(candidate,envelope,result.feedback);
  const preview=recommendationPreview(candidate,weakness);
  return publicResult(result,candidate,weakness,preview);
}

export async function confirmListeningErrorCandidate(candidateId,options={}){
  if(!nonblank(candidateId,240))throw failure('LISTENING_VALUE_SLICE_CONFIRMATION_INVALID','Listening candidate id is required.');
  const values=ownValues(options,CONFIRM_REQUIRED,CONFIRM_OPTIONAL,'LISTENING_VALUE_SLICE_CONFIRMATION_INVALID','Listening confirmation must contain exact data properties.');
  if(!nonblank(values.userId,180)||!nonblank(values.decisionId,240)||(hasOwn(values,'reason')&&typeof values.reason!=='string')||(hasOwn(values,'at')&&!Number.isFinite(values.at)))throw failure('LISTENING_VALUE_SLICE_CONFIRMATION_INVALID','Listening confirmation identity and time are invalid.');
  const id=candidateId.trim();
  const candidate=await getErrorCandidate(id);
  if(!await authenticateCandidate(candidate,id))throw failure('LISTENING_VALUE_SLICE_CANDIDATE_NOT_OWNED','Candidate is not owned by an exact durable Listening value-slice result.');
  const confirmed=await confirmErrorCandidate(id,{decisionId:values.decisionId.trim(),authority:{kind:'direct-user',version:1,userId:values.userId.trim()},reason:hasOwn(values,'reason')?values.reason:'confirmed-listening-error',at:hasOwn(values,'at')?values.at:null});
  return deepFreeze(clone(confirmed));
}
