import {
  LISTENING_MULTIPLE_CHOICE_KIND,
  LISTENING_MULTIPLE_CHOICE_INVENTORY_REGISTRY_REVISION,
  LISTENING_ASSISTANCE_COLLECTION_MODE,
  adaptIeltsListeningObjectiveItem,
  createIeltsListeningQuestionOwnerAdapter,
  createObjectiveTextResponseOwnerAdapter,
  createObjectiveTextResponseQuestionAsync,
  createObjectiveMatchingResponseOwnerAdapter,
  createObjectiveMatchingResponseQuestionAsync
} from './question-activity-contracts.js';
import { getIeltsObjectiveInventoryItem } from './ielts-persistence.js';
import { getTranscriptAggregate } from './transcript-aggregate.js';
import { createTranscriptSourceAdapter } from './source-revision-ref.js';
import { IELTS_LISTENING_OBJECTIVE_TEXT_KINDS,IELTS_LISTENING_MATCHING_KINDS,validateIeltsObjectiveInventoryItem } from './ielts-profile-inventory.js';
import { learningContractDigest } from './learning-contracts.js';

const AUTHENTIC_LISTENING_MATCHING_QUESTIONS=new WeakMap();

// This executor-facing seam preserves owner boundaries: IELTS owns durable
// inventory and V10 owns Transcript revisions. It never exposes a key or body.
export {
  LISTENING_MULTIPLE_CHOICE_KIND,
  LISTENING_MULTIPLE_CHOICE_INVENTORY_REGISTRY_REVISION,
  LISTENING_ASSISTANCE_COLLECTION_MODE,
  adaptIeltsListeningObjectiveItem,
  createIeltsListeningQuestionOwnerAdapter,
  IELTS_LISTENING_OBJECTIVE_TEXT_KINDS
};

function data(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return true;
  if(typeof value==='number')return Number.isFinite(value);
  if(!value||typeof value!=='object'||seen.has(value))return false;
  const prototype=Array.isArray(value)?Array.prototype:Object.getPrototypeOf(value);if(!Array.isArray(value)&&prototype!==Object.prototype&&prototype!==null)return false;
  seen.add(value);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}
  if(Object.getOwnPropertySymbols(value).length||Object.values(descriptors).some(descriptor=>!Object.hasOwn(descriptor,'value')||!data(descriptor.value,seen))){seen.delete(value);return false;}seen.delete(value);return true;
}
function exact(value,keys){return data(value)&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function listeningOtrInventory(value){
  const checked=validateIeltsObjectiveInventoryItem(value,{historical:true});if(!checked.valid||learningContractDigest(checked.value)!==learningContractDigest(value))return null;
  const item=checked.value,binding=item.questionBinding,payload=item.questionPayload,reference=item.sourceRevisionRef;
  if(item.skill!=='listening'||item.status!=='verified'||item.profiles.length!==2||item.profiles[0]!=='academic'||item.profiles[1]!=='general-training'||!IELTS_LISTENING_OBJECTIVE_TEXT_KINDS.includes(binding.kind)||binding.schemaVersion!==1||binding.registryRevision!=='qar-objective-text-response-registry-v1'||!exact(binding,['kind','schemaVersion','registryRevision','questionId','promptRevision','promptDigest','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','reviewPolicyRevision','requiredCapabilities'])||!exact(binding.scorer,['id','version'])||binding.scorer.id!=='objective-text-response-scorer-v1'||binding.scorer.version!==1||binding.reviewPolicyRevision!=='objective-text-response-review-v1'||!Array.isArray(binding.requiredCapabilities)||binding.requiredCapabilities.length!==5||!['audio-playback','text-entry','keyboard','focus','screen-reader'].every(capability=>binding.requiredCapabilities.includes(capability)))return null;
  if(!exact(payload,['id','kind','prompt','slots','target','sourceRevisionRef','createdAt','updatedAt'])||payload.id!==item.id||payload.kind!==binding.kind||!exact(payload.target,['schemaVersion','targetType','targetId','cardId','senseId','skill','sourceId','sourceRevision'])||payload.target.schemaVersion!==2||payload.target.targetType!=='ielts-objective-item'||payload.target.targetId!==item.id||payload.target.cardId!==null||payload.target.senseId!==null||payload.target.skill!=='listening'||payload.target.sourceId!==reference.sourceId||payload.target.sourceRevision!==reference.revisionId||learningContractDigest(payload.sourceRevisionRef)!==learningContractDigest(reference))return null;
  return item;
}
function transcriptMatches(reference,aggregate){
  if(!data(reference)||!data(aggregate)||!exact(aggregate,['source','revision','segments'])||!exact(aggregate.source,['id','kind','schemaVersion','namespace','externalId','sourceType','title','url','language','status','latestRevisionId','activeRevisionId','createdAt','updatedAt'])||!exact(aggregate.revision,['id','kind','schemaVersion','sourceId','parentRevisionId','contentDigest','segmentIds','coverage','status','provenance','createdAt'])||!Array.isArray(aggregate.segments))return false;
  const {source,revision,segments}=aggregate,provenance=revision.provenance,coverage=revision.coverage;
  if(source.kind!=='transcript-source'||source.schemaVersion!==1||revision.kind!=='transcript-revision'||revision.schemaVersion!==1||source.id!==reference.sourceId||revision.sourceId!==source.id||revision.id!==reference.revisionId||revision.contentDigest!==reference.integrity||source.status!=='verified'||revision.status!=='verified'||!data(provenance)||provenance.verification!=='verified'||provenance.rights!=='allowed'||provenance.aligned===false||provenance.alignmentStatus==='unaligned'||revision.tombstone||source.tombstone||revision.deleted||source.deleted||!exact(coverage,['startMs','endMs','coveredMs','ratio','complete'])||coverage.complete!==true||!Array.isArray(revision.segmentIds)||revision.segmentIds.length!==segments.length||!segments.length)return false;
  let covered=0;for(let index=0;index<segments.length;index+=1){const segment=segments[index];if(!exact(segment,['startMs','endMs','text','language','status','confidence','speaker','aligned','id','kind','schemaVersion','sourceId','revisionId','lineageId','provenance'])||segment.kind!=='canonical-transcript-segment'||segment.schemaVersion!==1||segment.sourceId!==source.id||segment.revisionId!==revision.id||segment.id!==revision.segmentIds[index]||segment.status!=='verified'||segment.aligned!==true||typeof segment.text!=='string'||!segment.text||!Number.isFinite(segment.startMs)||!Number.isFinite(segment.endMs)||segment.endMs<=segment.startMs||(index>0&&segment.startMs!==segments[index-1].endMs))return false;covered+=segment.endMs-segment.startMs;}
  if(coverage.startMs!==segments[0].startMs||coverage.endMs!==segments.at(-1).endMs||coverage.coveredMs!==covered||coverage.ratio!==Math.min(1,covered/(coverage.endMs-coverage.startMs)))return false;
  const digest=learningContractDigest(segments.map(segment=>({startMs:segment.startMs,endMs:segment.endMs,text:segment.text,language:segment.language,status:segment.status,speaker:segment.speaker})));return digest===revision.contentDigest;
}

export function createIeltsListeningObjectiveTextOwnerAdapter({readVerifiedInventory,getTranscriptAggregate:readAggregate}={}){
  if(typeof readVerifiedInventory!=='function'||typeof readAggregate!=='function')throw Object.assign(new TypeError('Listening OTR owner requires verified inventory and Transcript readers.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  return createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:async id=>{
    let inventory,aggregate;try{inventory=await readVerifiedInventory(id);if(!data(inventory))return null;aggregate=await readAggregate(inventory.sourceRevisionRef?.revisionId);}catch{throw Object.assign(new Error('Listening OTR owner is unavailable.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});}
    const item=listeningOtrInventory(inventory);return item&&transcriptMatches(item.sourceRevisionRef,aggregate)?item.questionPayload:null;
  }});
}

export async function adaptIeltsListeningObjectiveTextItem(inventory,sourceRevisionRef,{ownerAdapter}={}){
  const item=listeningOtrInventory(inventory);if(!item||learningContractDigest(item.sourceRevisionRef)!==learningContractDigest(sourceRevisionRef))throw Object.assign(new TypeError('Listening OTR inventory or source reference is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  const question=await createObjectiveTextResponseQuestionAsync(item.questionPayload,{ownerAdapter}),binding=item.questionBinding,actual={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};
  if(learningContractDigest(binding)!==learningContractDigest(actual))throw Object.assign(new TypeError('Listening OTR inventory binding is not authentic.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});return question;
}

function listeningMatchingInventory(value){
  const checked=validateIeltsObjectiveInventoryItem(value,{historical:true});if(!checked.valid||learningContractDigest(checked.value)!==learningContractDigest(value))return null;
  const item=checked.value,binding=item.questionBinding,payload=item.questionPayload,reference=item.sourceRevisionRef;
  const spatial=binding.kind==='listening-plan-map-diagram-labelling',registry=spatial?'qar-objective-spatial-matching-response-registry-v1':'qar-objective-matching-response-registry-v1',keys=spatial?['id','kind','prompt','slots','options','reusePolicy','spatialPrompt','target','sourceRevisionRef','createdAt','updatedAt']:['id','kind','prompt','slots','options','reusePolicy','target','sourceRevisionRef','createdAt','updatedAt'];if(item.skill!=='listening'||item.status!=='verified'||item.profiles.length!==2||item.profiles[0]!=='academic'||item.profiles[1]!=='general-training'||!IELTS_LISTENING_MATCHING_KINDS.includes(binding.kind)||binding.schemaVersion!==1||binding.registryRevision!==registry||!exact(binding,['kind','schemaVersion','registryRevision','questionId','promptRevision','promptDigest','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','reviewPolicyRevision','requiredCapabilities'])||!exact(binding.scorer,['id','version'])||binding.scorer.id!=='objective-matching-response-scorer-v1'||binding.scorer.version!==1||binding.reviewPolicyRevision!=='objective-matching-response-review-v1'||!Array.isArray(binding.requiredCapabilities)||binding.requiredCapabilities.length!==4||!['audio-playback','keyboard','focus','screen-reader'].every(capability=>binding.requiredCapabilities.includes(capability)))return null;
  if(!exact(payload,keys)||payload.id!==item.id||payload.kind!==binding.kind||!exact(payload.target,['schemaVersion','targetType','targetId','cardId','senseId','skill','sourceId','sourceRevision'])||payload.target.schemaVersion!==2||payload.target.targetType!=='ielts-objective-item'||payload.target.targetId!==item.id||payload.target.cardId!==null||payload.target.senseId!==null||payload.target.skill!=='listening'||payload.target.sourceId!==reference.sourceId||payload.target.sourceRevision!==reference.revisionId||learningContractDigest(payload.sourceRevisionRef)!==learningContractDigest(reference))return null;
  return item;
}

// This branded adapter is the only bridge from the Listening inventory and
// canonical Transcript aggregate to shared matching v1.  It rereads both
// owners on every score and keeps their private answer bindings private.
export function createIeltsListeningMatchingOwnerAdapter(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw Object.assign(new TypeError('Listening matching owner options are invalid.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  let descriptors;try{if(Object.getPrototypeOf(options)!==Object.prototype&&Object.getPrototypeOf(options)!==null||Object.getOwnPropertySymbols(options).length)throw new Error();descriptors=Object.getOwnPropertyDescriptors(options);}catch{throw Object.assign(new TypeError('Listening matching owner options are invalid.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});}
  if(Object.keys(descriptors).length!==2||!['readVerifiedInventory','getTranscriptAggregate'].every(key=>Object.hasOwn(descriptors,key)&&Object.hasOwn(descriptors[key],'value')))throw Object.assign(new TypeError('Listening matching owner options are invalid.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  const readVerifiedInventory=descriptors.readVerifiedInventory.value,getTranscriptAggregate=descriptors.getTranscriptAggregate.value;if(typeof readVerifiedInventory!=='function'||typeof getTranscriptAggregate!=='function')throw Object.assign(new TypeError('Listening matching owner requires verified inventory and Transcript readers.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  const sourceDigests=new Map();
  return createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:async id=>{
    if(typeof id!=='string')return null;let inventory,aggregate;try{inventory=await readVerifiedInventory(id);if(!data(inventory))return null;aggregate=await getTranscriptAggregate(inventory.sourceRevisionRef?.revisionId);}catch{throw Object.assign(new Error('Listening matching owner is unavailable.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});}
    const item=listeningMatchingInventory(inventory);if(!item||!transcriptMatches(item.sourceRevisionRef,aggregate))return null;const digest=learningContractDigest(aggregate),previous=sourceDigests.get(id);if(previous&&previous!==digest)return null;sourceDigests.set(id,digest);return item.questionPayload;
  }});
}

export async function adaptIeltsListeningMatchingItem(inventory,sourceRevisionRef,options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw Object.assign(new TypeError('Listening matching owner adapter is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(options);}catch{throw Object.assign(new TypeError('Listening matching owner adapter is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});}if(Object.keys(descriptors).length!==1||!Object.hasOwn(descriptors,'ownerAdapter')||!Object.hasOwn(descriptors.ownerAdapter,'value'))throw Object.assign(new TypeError('Listening matching owner adapter is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  const item=listeningMatchingInventory(inventory);if(!item||learningContractDigest(item.sourceRevisionRef)!==learningContractDigest(sourceRevisionRef))throw Object.assign(new TypeError('Listening matching inventory or source reference is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  const question=await createObjectiveMatchingResponseQuestionAsync(item.questionPayload,{ownerAdapter:descriptors.ownerAdapter.value}),binding=item.questionBinding,actual={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};
  if(learningContractDigest(binding)!==learningContractDigest(actual))throw Object.assign(new TypeError('Listening matching inventory binding is not authentic.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});AUTHENTIC_LISTENING_MATCHING_QUESTIONS.set(question,Object.freeze({inventoryDigest:learningContractDigest(item),sourceDigest:learningContractDigest(item.sourceRevisionRef)}));return question;
}

// Persistence uses this narrow identity fence rather than accepting any
// shared-kernel question.  It intentionally cannot be recreated by cloning.
export function isAuthenticIeltsListeningMatchingQuestion(question,inventory){const state=AUTHENTIC_LISTENING_MATCHING_QUESTIONS.get(question);return Boolean(state&&listeningMatchingInventory(inventory)&&state.inventoryDigest===learningContractDigest(inventory)&&state.sourceDigest===learningContractDigest(inventory.sourceRevisionRef));}

export function createDurableIeltsListeningQuestionOwnerAdapter(){
  return createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:getIeltsObjectiveInventoryItem,getTranscriptAggregate});
}

export function createDurableIeltsListeningObjectiveTextOwnerAdapter(){
  return createIeltsListeningObjectiveTextOwnerAdapter({readVerifiedInventory:getIeltsObjectiveInventoryItem,getTranscriptAggregate});
}

export function createDurableIeltsListeningMatchingOwnerAdapter(){
  return createIeltsListeningMatchingOwnerAdapter({readVerifiedInventory:getIeltsObjectiveInventoryItem,getTranscriptAggregate});
}

export function createIeltsListeningSourceAdapter(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options)||Object.getPrototypeOf(options)!==Object.prototype&&Object.getPrototypeOf(options)!==null||Object.getOwnPropertySymbols(options).length)throw Object.assign(new TypeError('Listening source adapter options are invalid.'),{code:'IELTS_LISTENING_SOURCE_INVALID'});let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(options);}catch{throw Object.assign(new TypeError('Listening source adapter options are invalid.'),{code:'IELTS_LISTENING_SOURCE_INVALID'});}if(Object.keys(descriptors).some(key=>key!=='getAggregate'||!Object.hasOwn(descriptors[key],'value')))throw Object.assign(new TypeError('Listening source adapter options are invalid.'),{code:'IELTS_LISTENING_SOURCE_INVALID'});const getAggregate=descriptors.getAggregate?.value??getTranscriptAggregate;if(typeof getAggregate!=='function')throw Object.assign(new TypeError('Listening source adapter requires a Transcript reader.'),{code:'IELTS_LISTENING_SOURCE_INVALID'});
  return createTranscriptSourceAdapter({getTranscriptAggregate:getAggregate});
}
