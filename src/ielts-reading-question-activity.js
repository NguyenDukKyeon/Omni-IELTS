import {
  READING_MULTIPLE_CHOICE_SINGLE_KIND,
  READING_TRUE_FALSE_NOT_GIVEN_KIND,
  READING_YES_NO_NOT_GIVEN_KIND,
  READING_ASSISTANCE_COLLECTION_MODE,
  adaptIeltsReadingObjectiveItem,
  createIeltsReadingQuestionOwnerAdapter,
  createObjectiveTextResponseOwnerAdapter,
  createObjectiveTextResponseQuestionAsync
} from './question-activity-contracts.js';
import { IELTS_READING_OBJECTIVE_TEXT_KINDS,IELTS_READING_MATCHING_KINDS } from './ielts-domain.js';
import { validateIeltsObjectiveInventoryItem } from './ielts-profile-inventory.js';
import { learningContractDigest } from './learning-contracts.js';
import { getIeltsObjectiveInventoryItem,getIeltsReadingSourceRevision } from './ielts-persistence.js';
import { SOURCE_RESOLUTION_CODES } from './source-revision-ref.js';
import { createObjectiveMatchingResponseOwnerAdapter,createObjectiveMatchingResponseQuestionAsync } from './objective-matching-response.js';

function ownerData(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return true;
  if(typeof value==='number')return Number.isFinite(value);
  if(!value||typeof value!=='object'||seen.has(value))return false;
  const prototype=Array.isArray(value)?Array.prototype:Object.getPrototypeOf(value);
  if(!Array.isArray(value)&&prototype!==Object.prototype&&prototype!==null)return false;
  seen.add(value);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}
  if(Object.getOwnPropertySymbols(value).length||Object.values(descriptors).some(descriptor=>!Object.hasOwn(descriptor,'value')||!ownerData(descriptor.value,seen))){seen.delete(value);return false;}
  seen.delete(value);return true;
}

// The Reading owner owns source and inventory durability.  This module is a
// deliberately thin executor-facing seam: it exposes no source body or key
// projection and never creates a parallel runtime or attempt store.
export {
  READING_MULTIPLE_CHOICE_SINGLE_KIND,
  READING_TRUE_FALSE_NOT_GIVEN_KIND,
  READING_YES_NO_NOT_GIVEN_KIND,
  READING_ASSISTANCE_COLLECTION_MODE,
  adaptIeltsReadingObjectiveItem,
  createIeltsReadingQuestionOwnerAdapter,
  IELTS_READING_OBJECTIVE_TEXT_KINDS,
  IELTS_READING_MATCHING_KINDS
};

function exact(value,keys){return ownerData(value)&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function optionData(value,keys){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  let descriptors,prototype;try{prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null||Object.getOwnPropertySymbols(value).length)return null;descriptors=Object.getOwnPropertyDescriptors(value);}catch{return null;}
  if(Object.keys(descriptors).length!==keys.length||!keys.every(key=>Object.hasOwn(descriptors,key)&&Object.hasOwn(descriptors[key],'value')))return null;
  return Object.fromEntries(keys.map(key=>[key,descriptors[key].value]));
}
function readingObjectiveTextInventory(value){
  const validated=validateIeltsObjectiveInventoryItem(value,{historical:true});if(!validated.valid||learningContractDigest(validated.value)!==learningContractDigest(value))return null;
  const item=validated.value,payload=item.questionPayload,binding=item.questionBinding,reference=item.sourceRevisionRef;
  const spatial=binding.kind==='reading-diagram-label-completion',registry=spatial?'qar-objective-spatial-text-response-registry-v1':'qar-objective-text-response-registry-v1',keys=spatial?['id','kind','prompt','slots','spatialPrompt','target','sourceRevisionRef','createdAt','updatedAt']:['id','kind','prompt','slots','target','sourceRevisionRef','createdAt','updatedAt'];if(item.skill!=='reading'||item.status!=='verified'||item.profiles.length!==1||!IELTS_READING_OBJECTIVE_TEXT_KINDS.includes(binding.kind)||binding.schemaVersion!==1||binding.registryRevision!==registry||!exact(binding,['kind','schemaVersion','registryRevision','questionId','promptRevision','promptDigest','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','reviewPolicyRevision','requiredCapabilities'])||!exact(binding.scorer,['id','version'])||binding.scorer.id!=='objective-text-response-scorer-v1'||binding.scorer.version!==1||binding.reviewPolicyRevision!=='objective-text-response-review-v1'||!Array.isArray(binding.requiredCapabilities)||binding.requiredCapabilities.length!==4||!['text-entry','keyboard','focus','screen-reader'].every(capability=>binding.requiredCapabilities.includes(capability)))return null;
  if(!exact(payload,keys)||payload.id!==item.id||payload.kind!==binding.kind||!exact(payload.target,['schemaVersion','targetType','targetId','cardId','senseId','skill','sourceId','sourceRevision'])||payload.target.schemaVersion!==2||payload.target.targetType!=='ielts-objective-item'||payload.target.targetId!==item.id||payload.target.cardId!==null||payload.target.senseId!==null||payload.target.skill!=='reading'||payload.target.sourceId!==reference.sourceId||payload.target.sourceRevision!==reference.revisionId||learningContractDigest(payload.sourceRevisionRef)!==learningContractDigest(reference))return null;
  return item;
}

function ownerDefinition(inventory,source){
  const item=readingObjectiveTextInventory(inventory);if(!item||!ownerData(source)||source.status!=='verified'||source.profile!==item.profiles[0]||source.id!==item.sourceRevisionRef.locator?.passageId||source.revision!==item.sourceRevisionRef.locator?.revision||learningContractDigest(source.sourceRevisionRef)!==learningContractDigest(item.sourceRevisionRef))return null;
  const seal=source.objectiveItems?.find(entry=>ownerData(entry)&&entry.inventoryId===item.id);if(!seal||!exact(seal,['inventoryId','kind','schemaVersion'])||seal.kind!==item.questionBinding.kind||seal.schemaVersion!==1)return null;
  return item.questionPayload;
}

export function createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory,readVerifiedSource}={}){
  if(typeof readVerifiedInventory!=='function'||typeof readVerifiedSource!=='function')throw Object.assign(new TypeError('Reading OTR owner requires verified inventory and source readers.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  const sourceDigests=new Map();
  return createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:async id=>{
    if(typeof id!=='string')return null;let inventory,source;try{inventory=await readVerifiedInventory(id);if(!ownerData(inventory))return null;source=await readVerifiedSource(inventory.sourceRevisionRef);}catch{throw Object.assign(new Error('Reading OTR owner is unavailable.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});}const definition=ownerDefinition(inventory,source);if(!definition)return null;const digest=learningContractDigest(source),previous=sourceDigests.get(id);if(previous&&previous!==digest)return null;sourceDigests.set(id,digest);return definition;
  }});
}

export async function adaptIeltsReadingObjectiveTextItem(inventory,sourceRevisionRef,{ownerAdapter}={}){
  const item=readingObjectiveTextInventory(inventory);if(!item||learningContractDigest(item.sourceRevisionRef)!==learningContractDigest(sourceRevisionRef))throw Object.assign(new TypeError('Reading OTR inventory or source reference is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  const question=await createObjectiveTextResponseQuestionAsync(item.questionPayload,{ownerAdapter});
  const binding=item.questionBinding,actual={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};
  if(learningContractDigest(binding)!==learningContractDigest(actual))throw Object.assign(new TypeError('Reading OTR inventory binding is not authentic.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  return question;
}

function readingMatchingInventory(value){
  const validated=validateIeltsObjectiveInventoryItem(value,{historical:true});if(!validated.valid||learningContractDigest(validated.value)!==learningContractDigest(value))return null;
  const item=validated.value,payload=item.questionPayload,binding=item.questionBinding,reference=item.sourceRevisionRef;
  if(item.skill!=='reading'||item.status!=='verified'||item.profiles.length!==1||!IELTS_READING_MATCHING_KINDS.includes(binding.kind)||binding.schemaVersion!==1||binding.registryRevision!=='qar-objective-matching-response-registry-v1'||!exact(binding,['kind','schemaVersion','registryRevision','questionId','promptRevision','promptDigest','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','reviewPolicyRevision','requiredCapabilities'])||!exact(binding.scorer,['id','version'])||binding.scorer.id!=='objective-matching-response-scorer-v1'||binding.scorer.version!==1||binding.reviewPolicyRevision!=='objective-matching-response-review-v1'||!Array.isArray(binding.requiredCapabilities)||binding.requiredCapabilities.length!==3||!['keyboard','focus','screen-reader'].every(capability=>binding.requiredCapabilities.includes(capability)))return null;
  if(!exact(payload,['id','kind','prompt','slots','options','reusePolicy','target','sourceRevisionRef','createdAt','updatedAt'])||payload.id!==item.id||payload.kind!==binding.kind||!exact(payload.target,['schemaVersion','targetType','targetId','cardId','senseId','skill','sourceId','sourceRevision'])||payload.target.schemaVersion!==2||payload.target.targetType!=='ielts-objective-item'||payload.target.targetId!==item.id||payload.target.cardId!==null||payload.target.senseId!==null||payload.target.skill!=='reading'||payload.target.sourceId!==reference.sourceId||payload.target.sourceRevision!==reference.revisionId||learningContractDigest(payload.sourceRevisionRef)!==learningContractDigest(reference))return null;
  return item;
}

function matchingOwnerDefinition(inventory,source){
  const item=readingMatchingInventory(inventory);if(!item||!ownerData(source)||source.status!=='verified'||source.profile!==item.profiles[0]||source.id!==item.sourceRevisionRef.locator?.passageId||source.revision!==item.sourceRevisionRef.locator?.revision||learningContractDigest(source.sourceRevisionRef)!==learningContractDigest(item.sourceRevisionRef))return null;
  const seal=source.objectiveItems?.find(entry=>ownerData(entry)&&entry.inventoryId===item.id);if(!seal||!exact(seal,['inventoryId','kind','schemaVersion'])||seal.kind!==item.questionBinding.kind||seal.schemaVersion!==1)return null;
  return item.questionPayload;
}

export function createIeltsReadingMatchingOwnerAdapter(options={}){
  const input=optionData(options,['readVerifiedInventory','readVerifiedSource']),readVerifiedInventory=input?.readVerifiedInventory,readVerifiedSource=input?.readVerifiedSource;
  if(typeof readVerifiedInventory!=='function'||typeof readVerifiedSource!=='function')throw Object.assign(new TypeError('Reading matching owner requires verified inventory and source readers.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});
  const sourceDigests=new Map();
  return createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:async id=>{
    if(typeof id!=='string')return null;let inventory,source;try{inventory=await readVerifiedInventory(id);if(!ownerData(inventory))return null;source=await readVerifiedSource(inventory.sourceRevisionRef);}catch{throw Object.assign(new Error('Reading matching owner is unavailable.'),{code:'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'});}const definition=matchingOwnerDefinition(inventory,source);if(!definition)return null;const digest=learningContractDigest(source),previous=sourceDigests.get(id);if(previous&&previous!==digest)return null;sourceDigests.set(id,digest);return definition;
  }});
}

export async function adaptIeltsReadingMatchingItem(inventory,sourceRevisionRef,options={}){
  const option=optionData(options,['ownerAdapter']);if(!option)throw Object.assign(new TypeError('Reading matching owner adapter is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});const ownerAdapter=option.ownerAdapter;
  const item=readingMatchingInventory(inventory);if(!item||learningContractDigest(item.sourceRevisionRef)!==learningContractDigest(sourceRevisionRef))throw Object.assign(new TypeError('Reading matching inventory or source reference is invalid.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  const question=await createObjectiveMatchingResponseQuestionAsync(item.questionPayload,{ownerAdapter});
  const binding=item.questionBinding,actual={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};
  if(learningContractDigest(binding)!==learningContractDigest(actual))throw Object.assign(new TypeError('Reading matching inventory binding is not authentic.'),{code:'QUESTION_ACTIVITY_ITEM_INVALID'});
  return question;
}

export function createDurableIeltsReadingQuestionOwnerAdapter(){
  return createIeltsReadingQuestionOwnerAdapter({
    readVerifiedInventory:getIeltsObjectiveInventoryItem,
    readVerifiedSource:reference=>getIeltsReadingSourceRevision(reference?.locator?.passageId)
  });
}

export function createDurableIeltsReadingObjectiveTextOwnerAdapter(){
  return createIeltsReadingObjectiveTextOwnerAdapter({
    readVerifiedInventory:getIeltsObjectiveInventoryItem,
    readVerifiedSource:reference=>getIeltsReadingSourceRevision(reference?.locator?.passageId)
  });
}

export function createDurableIeltsReadingMatchingOwnerAdapter(){
  return createIeltsReadingMatchingOwnerAdapter({
    readVerifiedInventory:getIeltsObjectiveInventoryItem,
    readVerifiedSource:reference=>getIeltsReadingSourceRevision(reference?.locator?.passageId)
  });
}

export function createIeltsReadingSourceAdapter({readSource=getIeltsReadingSourceRevision}={}){
  if(typeof readSource!=='function')throw Object.assign(new TypeError('Reading source adapter requires a source reader.'),{code:'IELTS_READING_SOURCE_INVALID'});
  return Object.freeze({
    kind:'ielts-reading-passage',version:1,authority:'ielts-reading-owner',
    async resolve(reference){
      if(!reference||reference.kind!=='ielts-reading-passage'||reference.authority!=='ielts-reading-owner'||reference.locator?.passageId!==reference.sourceId?.replace(/^reading-source:/,'')||!Number.isSafeInteger(reference.locator?.revision))return{code:SOURCE_RESOLUTION_CODES.NOT_FOUND,reason:'reading-reference-mismatch'};
      let source;try{source=await readSource(reference.locator.passageId);}catch{return{code:SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE,reason:'reading-owner-unavailable'};}
      if(!source)return{code:SOURCE_RESOLUTION_CODES.NOT_FOUND,reason:'reading-source-not-found'};
      if(!ownerData(source)||source.id!==reference.locator.passageId||source.revision!==reference.locator.revision||source.status!=='verified'||source.sourceRevisionRef?.kind!==reference.kind||source.sourceRevisionRef?.authority!==reference.authority||source.sourceRevisionRef?.sourceId!==reference.sourceId||source.sourceRevisionRef?.revisionId!==reference.revisionId||source.sourceRevisionRef?.integrity!==reference.integrity)return{code:SOURCE_RESOLUTION_CODES.INTEGRITY_MISMATCH,executable:false,reason:'reading-source-stale'};
      const provenance={origin:'ielts-reading-owner',verification:'verified',rights:'allowed',privacy:'private'};
      return{code:SOURCE_RESOLUTION_CODES.RESOLVED,executable:true,provenance,record:{kind:'ielts-reading-passage',authority:'ielts-reading-owner',sourceId:reference.sourceId,revisionId:reference.revisionId,integrity:reference.integrity,provenance,locator:{passageId:source.id,revision:source.revision}}};
    }
  });
}
