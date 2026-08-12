import { decideEvidence,EVIDENCE_POLICY_VERSION } from './evidence-policy.js';
import { learningContractDigest,validateLearningEnvelope } from './learning-contracts.js';
import { normalizeErrorOccurrence,recordCorrectionEvidence,recordErrorOccurrence } from './error-repository.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,transactV10 } from './v10-persistence.js';

export const ERROR_CANDIDATE_VERSION=2;
export const ERROR_CANDIDATE_STATES=Object.freeze(['open','confirmed','rejected','expired','promotion_pending','promoted']);
const CANDIDATE_KIND='err-00-error-candidate';
const clone=value=>value==null?value:structuredClone(value);
const error=(code,message,detail={})=>Object.assign(new Error(message),{code,...detail});
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const clean=(value,max=240)=>typeof value==='string'?value.trim().replace(/\s+/g,' ').slice(0,max):'';
const stringValue=(value,max=240)=>typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;
const finite=(value,fallback=null)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;

function plain(value){try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}}
function dataOnly(value,seen=new Set(),depth=0){
  if(value===null||typeof value==='string'||typeof value==='boolean')return true;
  if(typeof value==='number')return Number.isFinite(value);
  if(typeof value!=='object'||depth>50||seen.has(value)||(!Array.isArray(value)&&!plain(value)))return false;
  seen.add(value);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}
  for(const [key,descriptor] of Object.entries(descriptors)){
    const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();if(/(secret(value)?|clientsecret|authorizationheader|credentialvalue|passwordhash|bearertoken|private(key|path)|filepath|path)$/.test(normalized)||!hasOwn(descriptor,'value')||!dataOnly(descriptor.value,seen,depth+1))return false;
  }
  seen.delete(value);return true;
}
function assertData(value,code='ERROR_CANDIDATE_INPUT_INVALID'){
  if(!dataOnly(value))throw error(code,'ErrorCandidate input must be bounded plain JSON data.');
  let bytes;try{bytes=new TextEncoder().encode(JSON.stringify(value)).length;}catch{throw error(code,'ErrorCandidate input is not serializable.');}
  if(bytes>80_000)throw error(code,'ErrorCandidate input is oversized.');
}
function normalizedTarget(input={}){
  const target=plain(input.target)?input.target:input;
  return Object.freeze({
    cardId:clean(target.cardId,180)||null,senseId:clean(target.senseId,180)||null,
    skill:['recognition','recall','listening','collocation','production'].includes(target.skill)?target.skill:null,
    sourceId:clean(target.sourceId,180)||null,sourceRevision:clean(target.sourceRevision,180)||null
  });
}
function envelopeBinding(envelope){
  if(!envelope)return null;
  assertData(envelope,'ERROR_CANDIDATE_ENVELOPE_INVALID');
  const validation=validateLearningEnvelope(envelope);
  if(!validation.valid)throw error('ERROR_CANDIDATE_ENVELOPE_INVALID','Candidate requires a valid canonical Learning envelope.',{reasons:validation.errors});
  const value=validation.value;
  return Object.freeze({
    activitySpecId:value.activitySpec.id,activitySpecDigest:learningContractDigest(value.activitySpec),runId:value.run.id,
    attemptId:value.attempt.id,attemptDigest:learningContractDigest(value.attempt),receiptId:value.receipt.id,
    receiptDigest:learningContractDigest(value.receipt),target:normalizedTarget(value.activitySpec),
    digest:learningContractDigest({activitySpec:value.activitySpec,run:value.run,attempt:value.attempt,receipt:value.receipt})
  });
}
function advisory(input={}){
  const value=plain(input.advisory)?input.advisory:{};
  return Object.freeze({producer:clean(value.producer,120)||null,producerVersion:clean(value.producerVersion,120)||null,configDigest:clean(value.configDigest,240)||null,observedAt:finite(value.observedAt??input.observedAt,null)});
}
function candidateFrom(input={}){
  assertData(input);const id=clean(input.id??input.idempotencyKey,240);
  if(!id)throw error('ERROR_CANDIDATE_ID_REQUIRED','ErrorCandidate requires a stable idempotency key.');
  const binding=envelopeBinding(input.envelope);const target=normalizedTarget(input.target||binding?.target);
  if(binding&&learningContractDigest(target)!==learningContractDigest(binding.target))throw error('ERROR_CANDIDATE_TARGET_MISMATCH','Candidate target cannot override its immutable learning binding.');
  const category=clean(input.category,120)||'unclassified';const sourceError=category==='source-error'||category==='transcript-source';
  if(input.sourceError===true&&!sourceError)throw error('ERROR_CANDIDATE_CATEGORY_INVALID','Source errors require a source/transcript category.');
  const claimDigest=learningContractDigest({category,claim:clean(input.claim,10_000),learnerOutput:clean(input.learnerOutput,10_000),expectedResponse:clean(input.expectedResponse,10_000)});
  const createdAt=finite(input.createdAt,Date.now());
  return Object.freeze({id,kind:CANDIDATE_KIND,schemaVersion:ERROR_CANDIDATE_VERSION,state:'open',idempotencyKey:id,target,category,sourceError,binding,claimDigest,advisory:advisory(input),occurrenceId:`err-00:${id}`,decision:null,decisionHistory:[],promotion:null,retraction:null,createdAt,updatedAt:createdAt});
}
function canonicalState(value){return value==='promoting'?'promotion_pending':value;}
const CANDIDATE_FIELDS=Object.freeze(['id','kind','schemaVersion','state','idempotencyKey','target','category','sourceError','binding','claimDigest','advisory','occurrenceId','decision','decisionHistory','promotion','retraction','createdAt','updatedAt','collision','rowDigest']);
function rowDigest(candidate){const value=clone(candidate);if(value)delete value.rowDigest;return learningContractDigest(value);}
const TARGET_FIELDS=Object.freeze(['cardId','senseId','skill','sourceId','sourceRevision']);
const ADVISORY_FIELDS=Object.freeze(['producer','producerVersion','configDigest','observedAt']);
const BINDING_FIELDS=Object.freeze(['activitySpecId','activitySpecDigest','runId','attemptId','attemptDigest','receiptId','receiptDigest','target','digest']);
const REVISION_FIELDS=Object.freeze(['id','kind','disposition','authority','reason','at','supersedes','bindingDigest']);
const AUTHORITY_FIELDS=Object.freeze(['kind','version','userId','decisionId','reason','decisionDigest']);
const PENDING_FIELDS=Object.freeze(['status','decisionId','expectedOccurrenceDigest','occurrenceId','at']);
const PROMOTED_FIELDS=Object.freeze(['status','occurrenceId','errorRecordId','occurrenceDigest','decisionId','at']);
const RETRACTION_FIELDS=Object.freeze(['decisionId','occurrenceId','errorRecordId','reason','at']);
const COLLISION_FIELDS=Object.freeze(['code','expectedDigest','observedDigest','at']);
const keysExactly=(value,fields)=>plain(value)&&Object.keys(value).length===fields.length&&fields.every(key=>hasOwn(value,key));
const nullableString=(value,max=240)=>value===null||stringValue(value,max);
const equalDigest=(left,right)=>learningContractDigest(left)===learningContractDigest(right);
function validTarget(value){return keysExactly(value,TARGET_FIELDS)&&nullableString(value.cardId,180)&&nullableString(value.senseId,180)&&nullableString(value.sourceId,180)&&nullableString(value.sourceRevision,180)&&(value.skill===null||['recognition','recall','listening','collocation','production'].includes(value.skill));}
function validAdvisory(value){return keysExactly(value,ADVISORY_FIELDS)&&nullableString(value.producer,120)&&nullableString(value.producerVersion,120)&&nullableString(value.configDigest,240)&&(value.observedAt===null||finite(value.observedAt,null)!==null);}
function validBinding(value,target){return value===null||(keysExactly(value,BINDING_FIELDS)&&stringValue(value.activitySpecId,240)&&stringValue(value.activitySpecDigest,240)&&stringValue(value.runId,240)&&stringValue(value.attemptId,240)&&stringValue(value.attemptDigest,240)&&stringValue(value.receiptId,240)&&stringValue(value.receiptDigest,240)&&stringValue(value.digest,240)&&validTarget(value.target)&&equalDigest(value.target,target));}
function validAuthority(value,revision,binding){
  if(!keysExactly(value,AUTHORITY_FIELDS))return false;
  if(value.kind==='direct-user')return value.version===1&&stringValue(value.userId,180)&&value.decisionId===null&&value.reason===null&&value.decisionDigest===null&&revision.bindingDigest===null;
  return revision.kind==='confirmation'&&value.kind==='evidence-policy'&&value.version===EVIDENCE_POLICY_VERSION&&value.userId===null&&stringValue(value.decisionId,240)&&stringValue(value.reason,240)&&stringValue(value.decisionDigest,240)&&stringValue(revision.bindingDigest,240)&&binding!==null&&revision.bindingDigest===binding.digest;
}
function validRevision(row,index,previous,binding){
  const dispositions={confirmation:'confirmed',rejection:'rejected',expiry:'expired',correction:null,retraction:null};
  return keysExactly(row,REVISION_FIELDS)&&hasOwn(dispositions,row.kind)&&row.disposition===dispositions[row.kind]&&stringValue(row.id,240)&&stringValue(row.reason,240)&&finite(row.at,null)!==null&&(index===0?row.supersedes===null:row.supersedes===previous?.id)&&validAuthority(row.authority,row,binding);
}
function validPending(value,candidate,decision){const expected=expectedOccurrence(candidate,decision);return keysExactly(value,PENDING_FIELDS)&&value.status==='pending'&&value.decisionId===decision.id&&value.occurrenceId===expected.id&&value.expectedOccurrenceDigest===learningContractDigest(expected)&&finite(value.at,null)!==null;}
function validPromoted(value,candidate,decision){const expected=expectedOccurrence(candidate,decision);return keysExactly(value,PROMOTED_FIELDS)&&value.status==='promoted'&&value.decisionId===decision.id&&value.occurrenceId===expected.id&&value.errorRecordId===expected.errorRecordId&&value.occurrenceDigest===learningContractDigest(expected)&&finite(value.at,null)!==null;}
function validRetraction(value,candidate,history){if(value===null)return true;const decision=history.find(row=>row.id===value.decisionId);return keysExactly(value,RETRACTION_FIELDS)&&decision?.kind==='retraction'&&value.occurrenceId===candidate.promotion?.occurrenceId&&value.errorRecordId===candidate.promotion?.errorRecordId&&value.reason===decision.reason&&value.at===decision.at;}
function validCollision(value,candidate,decision){if(value===undefined||value===null)return true;const expected=expectedOccurrence(candidate,decision);return keysExactly(value,COLLISION_FIELDS)&&value.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION'&&value.expectedDigest===learningContractDigest(expected)&&(value.observedDigest===null||stringValue(value.observedDigest,240))&&finite(value.at,null)!==null;}
function validateStoredV2(candidate){
  const base=CANDIDATE_FIELDS.filter(key=>key!=='collision');const keys=Object.keys(candidate);const collisionPresent=hasOwn(candidate,'collision');
  if(!dataOnly(candidate))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate is not bounded plain data.');
  if(!keysExactly(candidate,collisionPresent?CANDIDATE_FIELDS:base))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate fields are not exact.');
  if(candidate.kind!==CANDIDATE_KIND||candidate.schemaVersion!==2||!ERROR_CANDIDATE_STATES.includes(candidate.state))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate identity is unsupported.');
  if(!stringValue(candidate.id,240)||candidate.id!==candidate.idempotencyKey||candidate.occurrenceId!==`err-00:${candidate.id}`)throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate identity is inconsistent.');
  if(!validTarget(candidate.target)||!stringValue(candidate.category,120)||typeof candidate.sourceError!=='boolean'||candidate.sourceError!==(['source-error','transcript-source'].includes(candidate.category)))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate target/category is inconsistent.');
  if(!validBinding(candidate.binding,candidate.target)||!stringValue(candidate.claimDigest,240)||!validAdvisory(candidate.advisory)||!Array.isArray(candidate.decisionHistory)||finite(candidate.createdAt,null)===null||finite(candidate.updatedAt,null)===null||!stringValue(candidate.rowDigest,240))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate binding or metadata is invalid.');
  const history=candidate.decisionHistory;const ids=new Set();for(let index=0;index<history.length;index+=1){if(ids.has(history[index]?.id)||!validRevision(history[index],index,history[index-1],candidate.binding)||(index>0&&history[index].at<history[index-1].at))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate decision history is invalid.');ids.add(history[index].id);}
  if(!equalDigest(candidate.decision||null,history.at(-1)||null))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate current decision is not immutable history.');
  const effective=[...history].reverse().find(row=>row.disposition!==null)?.disposition||null;const confirmed=history.findLast(row=>row.disposition==='confirmed');
  if((candidate.state==='open'&&(history.length||candidate.decision!==null))||(candidate.state==='confirmed'&&effective!=='confirmed')||(['rejected','expired'].includes(candidate.state)&&effective!==candidate.state)||(['promotion_pending','promoted'].includes(candidate.state)&&effective!=='confirmed'))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate state is inconsistent with immutable decisions.');
  if(['open','confirmed','rejected','expired'].includes(candidate.state)&&(candidate.promotion!==null||candidate.retraction!==null))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate has an impossible promotion payload.');
  if(candidate.state==='promotion_pending'&&(!confirmed||!validPending(candidate.promotion,candidate,confirmed)))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate pending promotion is invalid.');
  if(candidate.state==='promoted'&&(!confirmed||!validPromoted(candidate.promotion,candidate,confirmed)))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate promoted binding is invalid.');
  if(candidate.state!=='promoted'&&candidate.retraction!==null)throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate retraction is invalid.');
  if(candidate.state==='promoted'&&!validRetraction(candidate.retraction,candidate,history))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate retraction is invalid.');
  if(candidate.state!=='promotion_pending'&&collisionPresent&&candidate.collision!==null)throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate collision is invalid.');
  if(candidate.state==='promotion_pending'&&!validCollision(candidate.collision,candidate,confirmed))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate collision is invalid.');
  if(candidate.rowDigest!==rowDigest(candidate))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate digest mismatch.');return candidate;
}
function normalizeLegacyV1(candidate){
  const legacyFields=CANDIDATE_FIELDS.filter(key=>key!=='rowDigest'&&key!=='collision');
  if(!dataOnly(candidate)||!keysExactly(candidate,legacyFields)||candidate.schemaVersion!==1||!['open','confirmed','rejected','expired','promoting'].includes(candidate.state))throw error('ERROR_CANDIDATE_STORED_INVALID','Stored legacy ErrorCandidate is unsupported.');
  const state=candidate.state==='promoting'?'promotion_pending':candidate.state;const converted={...clone(candidate),schemaVersion:2,state};
  if(state==='promotion_pending'){const decision=converted.decisionHistory?.findLast(row=>row.disposition==='confirmed');if(!decision)throw error('ERROR_CANDIDATE_STORED_INVALID','Stored legacy ErrorCandidate cannot infer confirmation.');converted.promotion={status:'pending',decisionId:decision.id,expectedOccurrenceDigest:learningContractDigest(expectedOccurrence(converted,decision)),occurrenceId:expectedOccurrence(converted,decision).id,at:finite(converted.updatedAt,null)};}
  return validateStoredV2(journalRow(converted));
}
function validateStored(candidate){if(!plain(candidate)||candidate.kind!==CANDIDATE_KIND)throw error('ERROR_CANDIDATE_STORED_INVALID','Stored ErrorCandidate is unsupported, future, or tampered.');return candidate.schemaVersion===1?normalizeLegacyV1(candidate):validateStoredV2(candidate);}
function normalizeStored(candidate){if(!candidate||candidate.kind!==CANDIDATE_KIND)return candidate;return validateStored(candidate);}
function journalRow(candidate){const row={...clone(candidate),schemaVersion:ERROR_CANDIDATE_VERSION,updatedAt:finite(candidate.updatedAt,Date.now())};row.rowDigest=rowDigest(row);return row;}
function immutableCandidateDigest(candidate={}){return learningContractDigest({id:candidate.id,kind:candidate.kind,idempotencyKey:candidate.idempotencyKey,target:candidate.target,category:candidate.category,sourceError:candidate.sourceError,binding:candidate.binding,claimDigest:candidate.claimDigest,advisory:candidate.advisory,occurrenceId:candidate.occurrenceId});}
async function mutateCandidate(id,mutate,reason){
  return transactV10([V10_STORES.workflowIntents],async({stores,memory,requestResult})=>{
    const raw=memory?clone(memory[V10_STORES.workflowIntents].get(id)):clone(await requestResult(stores[V10_STORES.workflowIntents].get(id)));
    const next=await mutate(normalizeStored(raw));
    if(next){const stored=journalRow(next);validateStoredV2(stored);if(memory)memory[V10_STORES.workflowIntents].set(id,clone(stored));else stores[V10_STORES.workflowIntents].put(clone(stored));return clone(stored);}
    return clone(next);
  },reason);
}
function decisionRevision({id,kind,disposition=null,authority,reason='',at=Date.now(),supersedes=null,bindingDigest=null}){
  const decisionId=clean(id,240);if(!decisionId)throw error('ERROR_CANDIDATE_DECISION_ID_REQUIRED','Decision revision requires an immutable id.');
  const timestamp=finite(at,null);if(timestamp===null)throw error('ERROR_CANDIDATE_DECISION_INVALID','Decision timestamp must be finite.');
  if(!plain(authority)||!clean(authority.kind,80))throw error('ERROR_CANDIDATE_AUTHORITY_INVALID','Decision authority must be explicit and versioned.');
  const evidence=authority.kind==='evidence-policy';if(evidence?(authority.version!==EVIDENCE_POLICY_VERSION||!clean(authority.decisionId,240)||!clean(authority.reason,240)||!clean(authority.decisionDigest,240)):(!Number.isInteger(authority.version)||authority.version<1))throw error('ERROR_CANDIDATE_AUTHORITY_INVALID','Decision authority must be explicit and versioned.');
  return Object.freeze({id:decisionId,kind,disposition,authority:Object.freeze({kind:clean(authority.kind,80),version:authority.version,userId:clean(authority.userId,180)||null,decisionId:clean(authority.decisionId,240)||null,reason:clean(authority.reason,240)||null,decisionDigest:clean(authority.decisionDigest,240)||null}),reason:clean(reason,240)||kind,at:timestamp,supersedes:clean(supersedes,240)||null,bindingDigest:clean(bindingDigest,240)||null});
}
function appendDecision(current,revision,{allowAnnotation=false}={}){
  const history=Array.isArray(current.decisionHistory)?current.decisionHistory:[];const existing=history.find(row=>row.id===revision.id);
  if(existing){if(learningContractDigest(existing)!==learningContractDigest(revision))throw error('ERROR_CANDIDATE_DECISION_COLLISION','Decision id conflicts with immutable history.');return current;}
  const latest=history.at(-1)||current.decision||null;
  if(latest&&revision.at<latest.at)throw error('ERROR_CANDIDATE_STALE_DECISION','Out-of-order decision cannot overwrite a later disposition.');
  if(!allowAnnotation&&latest&&revision.at===latest.at)throw error('ERROR_CANDIDATE_CONFLICTING_DECISION','Concurrent decision conflicts with the current disposition.');
  if(revision.supersedes!==(latest?.id||null))throw error('ERROR_CANDIDATE_SUPERSEDES_MISMATCH','Decision revision must link to the current immutable decision.');
  return {...current,decision:revision,decisionHistory:[...history,revision],updatedAt:revision.at};
}
function replayStableAt(current,id,at){return finite(at,current?.decisionHistory?.find(row=>row.id===id)?.at??Date.now());}
function assertCandidate(current){if(!current||current.kind!==CANDIDATE_KIND)throw error('ERROR_CANDIDATE_NOT_FOUND','ErrorCandidate was not found.');return current;}
function authorityForUser(input={}){const supplied=input.authority;if(supplied!=null&&(!plain(supplied)||clean(supplied.kind,80)!=='direct-user'))throw error('ERROR_CANDIDATE_AUTHORITY_INVALID','AI, provider, model, and caller eligibility labels cannot confirm a candidate.');return {kind:'direct-user',version:Number(supplied?.version||1),userId:clean(supplied?.userId,180)||'local-user'};}
function authorityForEvidence(decision){return {kind:'evidence-policy',version:EVIDENCE_POLICY_VERSION,decisionId:decision.decisionId,reason:decision.reason,decisionDigest:learningContractDigest(decision)};}
function authoritativeEnvelope(candidate,envelope){
  if(!envelope)throw error('ERROR_CANDIDATE_EVIDENCE_REQUIRED','Promotion requires a confirmed decision or an immutable canonical envelope.');
  const binding=envelopeBinding(envelope);
  if(!candidate.binding||learningContractDigest(candidate.binding)!==learningContractDigest(binding))throw error('ERROR_CANDIDATE_BINDING_MISMATCH','Promotion envelope does not exactly match the candidate binding.');
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  if(!(decision.eligible===true&&decision.successful===true&&decision.affectsSchedule===true))throw error('ERROR_CANDIDATE_EVIDENCE_REQUIRED','Promotion requires qualified successful EvidencePolicy evidence.',{reason:decision.reason});
  if(learningContractDigest(decision.target)!==learningContractDigest(candidate.target))throw error('ERROR_CANDIDATE_TARGET_MISMATCH','EvidencePolicy target does not match the candidate.');
  return {binding,decision};
}
function occurrenceInput(candidate,decision){return {occurrenceId:candidate.occurrenceId,target:candidate.target,category:candidate.category,attemptId:candidate.binding.attemptId,receiptId:candidate.binding.receiptId,occurredAt:candidate.advisory.observedAt??candidate.createdAt,provenance:{kind:'err-00-candidate',candidateId:candidate.id,bindingDigest:candidate.binding.digest,decisionId:decision.id,claimDigest:candidate.claimDigest}};}
function expectedOccurrence(candidate,decision){return normalizeErrorOccurrence(occurrenceInput(candidate,decision));}

export async function createErrorCandidate(input={}){const candidate=candidateFrom(input);return mutateCandidate(candidate.id,current=>{if(current){if(immutableCandidateDigest(current)!==immutableCandidateDigest(candidate))throw error('ERROR_CANDIDATE_COLLISION','ErrorCandidate id conflicts with a different immutable claim.',{candidateId:candidate.id});return current;}return candidate;},'err-00-candidate-created');}
export async function getErrorCandidate(id){const row=await getV10Record(V10_STORES.workflowIntents,clean(id,240));return row?.kind===CANDIDATE_KIND?normalizeStored(row):null;}
export async function listErrorCandidates({state=null}={}){const rows=await listV10Records(V10_STORES.workflowIntents,{sortBy:'updatedAt',descending:false});return rows.map(normalizeStored).filter(row=>row?.kind===CANDIDATE_KIND&&(!state||row.state===canonicalState(state)));}

export async function confirmErrorCandidate(id,{decisionId=`confirm:${clean(id,180)}`,authority=null,reason='confirmed',at=null,envelope=null}={}){
  return mutateCandidate(clean(id,240),current=>{current=assertCandidate(current);
    let resolvedAuthority=authorityForUser({authority});let bindingDigest=null;
    if(envelope){const proof=authoritativeEnvelope(current,envelope);resolvedAuthority=authorityForEvidence(proof.decision);bindingDigest=proof.binding.digest;}
    if(resolvedAuthority.kind==='direct-user'&&(!resolvedAuthority.userId||resolvedAuthority.version!==1))throw error('ERROR_CANDIDATE_AUTHORITY_INVALID','Only versioned direct-user authority can manually confirm.');
    const revision=decisionRevision({id:decisionId,kind:'confirmation',disposition:'confirmed',authority:resolvedAuthority,reason,at:replayStableAt(current,decisionId,at),supersedes:null,bindingDigest});
    const replay=current.decisionHistory?.find(row=>row.id===revision.id);if(replay)return appendDecision(current,revision);
    if(current.state!=='open')throw error('ERROR_CANDIDATE_NOT_OPEN','Only OPEN candidates can be confirmed.');
    const next=appendDecision(current,revision);return {...next,state:'confirmed'};
  },'err-00-candidate-confirmed');
}
function terminalTransition(id,kind,state,{decisionId=`${kind}:${clean(id,180)}`,reason=kind,at=null}={}){return mutateCandidate(clean(id,240),current=>{current=assertCandidate(current);const timestamp=replayStableAt(current,decisionId,at);const revision=decisionRevision({id:decisionId,kind,disposition:state,authority:authorityForUser({}),reason,at:timestamp,supersedes:null});const replay=current.decisionHistory?.find(row=>row.id===revision.id);if(replay)return appendDecision(current,revision);const latest=current.decisionHistory?.at(-1)||current.decision;if(latest&&timestamp<latest.at)throw error('ERROR_CANDIDATE_STALE_DECISION','Out-of-order decision cannot overwrite a later disposition.');if(current.state!=='open')throw error('ERROR_CANDIDATE_NOT_OPEN','Only OPEN candidates can receive this disposition.');const next=appendDecision(current,revision);return {...next,state};},`err-00-candidate-${state}`);}
export async function rejectErrorCandidate(id,options={}){return terminalTransition(id,'rejection','rejected',options);}
export async function expireErrorCandidate(id,options={}){return terminalTransition(id,'expiry','expired',options);}

async function ensureEvidenceConfirmation(id,envelope){
  const candidate=await getErrorCandidate(id);if(candidate?.state!=='open'||!envelope)return candidate;
  return confirmErrorCandidate(id,{decisionId:`evidence:${candidate.id}:${learningContractDigest(envelopeBinding(envelope))}`,reason:'qualified-evidence',at:Date.now(),envelope});
}
function confirmedDecision(candidate){const decision=candidate.decisionHistory?.findLast(row=>row.disposition==='confirmed');if(!decision||candidate.state!=='confirmed'&&candidate.state!=='promotion_pending'&&candidate.state!=='promoted')throw error('ERROR_CANDIDATE_CONFIRMATION_REQUIRED','Promotion requires an immutable confirmed decision.');return decision;}
export async function promoteErrorCandidate(id,{envelope=null,hooks={}}={}){
  let candidate=await getErrorCandidate(clean(id,240));if(!candidate)throw error('ERROR_CANDIDATE_NOT_FOUND','ErrorCandidate was not found.');
  if(candidate.collision?.code==='ERROR_CANDIDATE_OCCURRENCE_COLLISION')throw error('ERROR_CANDIDATE_OCCURRENCE_COLLISION','Canonical occurrence collision is durable.');
  if(candidate.sourceError)throw error('ERROR_CANDIDATE_SOURCE_ERROR','Source/transcript defects cannot become learner error occurrences.');
  if(candidate.state==='open'&&!envelope)throw error('ERROR_CANDIDATE_EVIDENCE_REQUIRED','Promotion requires a confirmed decision or qualified evidence.');
  candidate=await ensureEvidenceConfirmation(candidate.id,envelope);
  if(['rejected','expired'].includes(candidate.state))throw error('ERROR_CANDIDATE_NOT_PROMOTABLE','Rejected or expired candidates remain diagnosable and cannot promote.');
  confirmedDecision(candidate);if(!candidate.binding)throw error('ERROR_CANDIDATE_BINDING_MISMATCH','Promotion requires an exact immutable learning binding.');
  const pending=await mutateCandidate(candidate.id,current=>{current=assertCandidate(current);if(current.state==='promoted')return current;if(current.state!=='confirmed'&&current.state!=='promotion_pending')throw error('ERROR_CANDIDATE_NOT_PROMOTABLE','Candidate is no longer promotable.');const confirmed=confirmedDecision(current);return {...current,state:'promotion_pending',promotion:{...(current.promotion||{}),status:'pending',decisionId:confirmed.id,expectedOccurrenceDigest:learningContractDigest(expectedOccurrence(current,confirmed)),occurrenceId:expectedOccurrence(current,confirmed).id,at:Date.now()},updatedAt:Date.now()};},'err-00-candidate-pending');
  if(pending.state==='promoted')return pending;
  const pendingDecision=confirmedDecision(pending);if(!pending.binding||!equalDigest(pending.target,pending.binding.target)||pending.occurrenceId!==`err-00:${pending.id}`)throw error('ERROR_CANDIDATE_STORED_INVALID','Promotion re-read found an invalid immutable candidate binding.');
  await hooks.beforeOccurrence?.({candidate:clone(pending)});
  let recorded;try{recorded=await recordErrorOccurrence(occurrenceInput(pending,pendingDecision));}catch(cause){if(cause?.code==='ERROR_OCCURRENCE_COLLISION'){const expected=expectedOccurrence(pending,pendingDecision);const observed=await getV10Record(V10_STORES.globalErrorOccurrences,expected.id);await mutateCandidate(candidate.id,current=>({...current,collision:{code:'ERROR_CANDIDATE_OCCURRENCE_COLLISION',expectedDigest:learningContractDigest(expected),observedDigest:observed?learningContractDigest(observed):null,at:Date.now()},updatedAt:Date.now()}),'err-00-candidate-collision');throw error('ERROR_CANDIDATE_OCCURRENCE_COLLISION','Canonical occurrence collision is durable.');}throw cause;}
  await hooks.afterOccurrence?.({candidate:clone(pending),recorded:clone(recorded)});
  return mutateCandidate(candidate.id,current=>{current=assertCandidate(current);if(current.state==='promoted')return current;const expected=expectedOccurrence(current,confirmedDecision(current));if(learningContractDigest(recorded.occurrence)!==learningContractDigest(expected))throw error('ERROR_CANDIDATE_OCCURRENCE_COLLISION','Canonical occurrence does not match the expected candidate effect.');return {...current,state:'promoted',promotion:{status:'promoted',occurrenceId:recorded.occurrence.id,errorRecordId:recorded.record.id,occurrenceDigest:learningContractDigest(recorded.occurrence),decisionId:confirmedDecision(current).id,at:Date.now()},updatedAt:Date.now()};},'err-00-candidate-promoted');
}
export async function reconcileErrorCandidates({envelopesByCandidate={},hooks={}}={}){
  const pending=await listErrorCandidates({state:'promotion_pending'});const result={found:pending.length,promoted:0,pending:0,errors:[]};
  for(const candidate of pending){if(candidate.collision?.code){result.pending+=1;result.errors.push({candidateId:candidate.id,code:candidate.collision.code});continue;}const decision=confirmedDecision(candidate);const expected=expectedOccurrence(candidate,decision);const existing=await getV10Record(V10_STORES.globalErrorOccurrences,expected.id);
    if(existing){if(learningContractDigest(existing)!==learningContractDigest(expected)){await mutateCandidate(candidate.id,current=>({...current,collision:{code:'ERROR_CANDIDATE_OCCURRENCE_COLLISION',expectedDigest:learningContractDigest(expected),observedDigest:learningContractDigest(existing),at:Date.now()},updatedAt:Date.now()}),'err-00-candidate-collision');result.pending+=1;result.errors.push({candidateId:candidate.id,code:'ERROR_CANDIDATE_OCCURRENCE_COLLISION'});continue;}
      await mutateCandidate(candidate.id,current=>({...current,state:'promoted',promotion:{status:'promoted',occurrenceId:existing.id,errorRecordId:existing.errorRecordId,occurrenceDigest:learningContractDigest(existing),decisionId:confirmedDecision(current).id,at:Date.now()},updatedAt:Date.now()}),'err-00-candidate-reconciled');result.promoted+=1;continue;}
    try{await promoteErrorCandidate(candidate.id,{envelope:envelopesByCandidate[candidate.id],hooks});result.promoted+=1;}catch(cause){result.pending+=1;result.errors.push({candidateId:candidate.id,code:cause.code||'ERROR_CANDIDATE_RECONCILE_FAILED'});}
  }return result;
}
async function qualifiedCorrection(candidate,envelope){
  if(!envelope)throw error('ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED','Correction requires a complete canonical qualified envelope.');
  assertData(envelope,'ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED');const validation=validateLearningEnvelope(envelope);if(!validation.valid)throw error('ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED','Correction envelope is not canonical.');
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  if(!(decision.eligible&&decision.successful&&decision.affectsSchedule)||learningContractDigest(decision.target)!==learningContractDigest(candidate.target))throw error('ERROR_CANDIDATE_CORRECTION_EVIDENCE_REQUIRED','Correction requires exact qualified EvidencePolicy evidence.');
  const record=await getV10Record(V10_STORES.globalErrorRecords,candidate.promotion?.errorRecordId);if(!record||learningContractDigest(normalizedTarget(record.target))!==learningContractDigest(candidate.target))throw error('ERROR_CANDIDATE_CORRECTION_TARGET_MISMATCH','Correction cannot target another canonical ErrorRecord.');
  return {...clone(envelope),decision};
}
export async function correctErrorCandidate(id,{decisionId=`correction:${clean(id,180)}`,reason='correction',at=null,qualifiedCorrectionEnvelope=null}={}){
  const before=await getErrorCandidate(clean(id,240));if(before?.state==='open')throw error('ERROR_CANDIDATE_CORRECTION_REQUIRES_DECISION','Correction requires an already-decided candidate.');const prior=before?.decisionHistory?.find(row=>row.id===decisionId);const verified=qualifiedCorrectionEnvelope&&!prior?await qualifiedCorrection(before,qualifiedCorrectionEnvelope):null;
  const changed=await mutateCandidate(clean(id,240),current=>{current=assertCandidate(current);const existing=current.decisionHistory?.find(row=>row.id===decisionId);if(existing){if(existing.kind!=='correction'||existing.reason!==clean(reason,240)||finite(at,existing.at)!==existing.at)throw error('ERROR_CANDIDATE_DECISION_COLLISION','Decision id conflicts with immutable history.');return current;}const latest=current.decisionHistory?.at(-1)||null;const revision=decisionRevision({id:decisionId,kind:'correction',disposition:null,authority:authorityForUser({}),reason,at:replayStableAt(current,decisionId,at),supersedes:latest?.id||null});return appendDecision(current,revision,{allowAnnotation:true});},'err-00-candidate-corrected');
  if(qualifiedCorrectionEnvelope&&!prior){if(changed.state!=='promoted'||!changed.promotion?.errorRecordId)throw error('ERROR_CANDIDATE_CORRECTION_UNBOUND','Qualified correction requires a promoted canonical occurrence.');await recordCorrectionEvidence(changed.promotion.errorRecordId,verified);}
  return changed;
}
export async function retractErrorCandidate(id,{decisionId=`retraction:${clean(id,180)}`,reason='retracted',at=null,qualifiedCorrectionEnvelope=null}={}){
  const before=qualifiedCorrectionEnvelope?await getErrorCandidate(clean(id,240)):null;const prior=before?.decisionHistory?.find(row=>row.id===decisionId);const verified=qualifiedCorrectionEnvelope&&!prior?await qualifiedCorrection(before,qualifiedCorrectionEnvelope):null;
  const changed=await mutateCandidate(clean(id,240),current=>{current=assertCandidate(current);if(current.state!=='promoted'||!current.promotion?.occurrenceId)throw error('ERROR_CANDIDATE_RETRACTION_REQUIRES_PROMOTION','Retraction preserves a promoted canonical occurrence.');const existing=current.decisionHistory?.find(row=>row.id===decisionId);if(existing){if(existing.kind!=='retraction'||existing.reason!==clean(reason,240)||finite(at,existing.at)!==existing.at)throw error('ERROR_CANDIDATE_DECISION_COLLISION','Decision id conflicts with immutable history.');return current;}const latest=current.decisionHistory?.at(-1)||null;const revision=decisionRevision({id:decisionId,kind:'retraction',disposition:null,authority:authorityForUser({}),reason,at:replayStableAt(current,decisionId,at),supersedes:latest?.id||null});const next=appendDecision(current,revision,{allowAnnotation:true});return {...next,retraction:{decisionId:revision.id,occurrenceId:current.promotion.occurrenceId,errorRecordId:current.promotion.errorRecordId,reason:revision.reason,at:revision.at}};},'err-00-candidate-retracted');
  if(qualifiedCorrectionEnvelope&&!prior)await recordCorrectionEvidence(changed.promotion.errorRecordId,verified);
  return changed;
}
export const __testing=Object.freeze({candidateFrom,envelopeBinding,occurrenceInput,expectedOccurrence,immutableCandidateDigest,dataOnly});
