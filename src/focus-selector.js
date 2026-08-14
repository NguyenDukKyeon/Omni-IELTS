import { isCompleteLearningTarget,learningContractDigest } from './learning-contracts.js';

export const FOCUS_SCHEMA_VERSION=1;
export const FOCUS_SELECTOR_VERSION='canonical-focus-selector-v1';
export const FOCUS_REASON_CODE='observed-weakness-focus';
export const FOCUS_SLOT_CAP=1;

const PROFILE_FIELDS=['schemaVersion','profileVersion','taxonomyVersion','projectorVersion','canonicalInputRefs','denominator','sampleSize','timeframe','reasonCodes','uncertainty','uncertaintyReasons','insufficientData','conflictHandling','observations','provenance','inputDigest','kind','conflicts','outputDigest'];
const OBSERVATION_FIELDS=['skill','qualifiedSuccesses','qualifiedFailures','denominator','failureRate','status','reasonCodes','sourceRefs'];
const CANDIDATE_FIELDS=['id','type','target','executor','estimatedSeconds','category','originReasonCode'];
const SELECTION_FIELDS=['candidate','weakness','candidateSet','candidateSetDigest','tieDigest','coreSelectionDigest'];
const BINDING_FIELDS=['schemaVersion','selectorVersion','reasonCode','dayKey','slotCap','selection','budget','selectionDigest'];
const LEARNING_EVENT_TYPES=new Set(['run-recorded','attempt-recorded','receipt-recorded','evidence-decided']);
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const plain=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
const sameKeys=(value,keys)=>plain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>hasOwn(value,key));
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const key of Object.keys(value))deepFreeze(value[key]);Object.freeze(value);}return value;};
const digest=value=>learningContractDigest(value);

export class FocusPolicyError extends Error{
  constructor(message='Focus input is invalid.'){
    super(message);this.name='FocusPolicyError';this.code='FOCUS_INVALID_INPUT';
  }
}

function invalid(message){throw new FocusPolicyError(message);}
function assertJsonData(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return;
  if(typeof value==='number'){if(!Number.isFinite(value)||(Number.isInteger(value)&&!Number.isSafeInteger(value)))invalid();return;}
  if(typeof value!=='object'||seen.has(value)||Object.getOwnPropertySymbols(value).length)invalid();
  const array=Array.isArray(value),prototype=Object.getPrototypeOf(value);
  if((array&&prototype!==Array.prototype)||(!array&&prototype!==Object.prototype&&prototype!==null))invalid();
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(array){const length=descriptors.length?.value;const keys=Object.keys(descriptors).filter(key=>key!=='length');if(!Number.isSafeInteger(length)||keys.length!==length||keys.some(key=>!/^0$|^[1-9]\d*$/.test(key)||Number(key)>=length))invalid();}
  seen.add(value);
  for(const descriptor of Object.values(descriptors)){if(!('value'in descriptor)||descriptor.get||descriptor.set)invalid();assertJsonData(descriptor.value,seen);}seen.delete(value);
}
function exactString(value,max=240){return typeof value==='string'&&value.length>0&&value.length<=max&&value===value.trim();}
function exactDay(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value);}
function clone(value){return structuredClone(value);}
function exactTarget(value){
  if(!plain(value)||!isCompleteLearningTarget(value))return false;
  const v2=hasOwn(value,'targetType')||hasOwn(value,'targetId');
  const fields=v2?['schemaVersion','targetType','targetId','cardId','senseId','skill','sourceId','sourceRevision']:['cardId','senseId','skill','sourceId','sourceRevision'];
  return sameKeys(value,fields);
}
function candidateProjection(value){return {id:value.id,type:value.type,target:clone(value.target),executor:value.executor,estimatedSeconds:value.estimatedSeconds,category:value.category,originReasonCode:value.originReasonCode};}
function validateCandidate(value){
  if(!sameKeys(value,CANDIDATE_FIELDS)||!exactString(value.id,180)||!exactString(value.type,80)||!exactTarget(value.target)||!exactString(value.executor,120)||!Number.isSafeInteger(value.estimatedSeconds)||value.estimatedSeconds<10||value.estimatedSeconds>900||!['repair','content'].includes(value.category)||!exactString(value.originReasonCode,120))invalid();
  return candidateProjection(value);
}
function validateObservation(value){
  if(!sameKeys(value,OBSERVATION_FIELDS)||!exactString(value.skill,80)||!Number.isSafeInteger(value.qualifiedSuccesses)||value.qualifiedSuccesses<0||!Number.isSafeInteger(value.qualifiedFailures)||value.qualifiedFailures<0||!Number.isSafeInteger(value.denominator)||value.denominator<0||typeof value.failureRate!=='number'||!Number.isFinite(value.failureRate)||value.failureRate<0||value.failureRate>1||!['OBSERVED','INSUFFICIENT_DATA'].includes(value.status)||!Array.isArray(value.reasonCodes)||!Array.isArray(value.sourceRefs))invalid();
  if(value.denominator!==value.qualifiedSuccesses+value.qualifiedFailures)invalid();
  if(value.sourceRefs.length>10_000)invalid();
  return clone(value);
}
function canonicalRef(value,{evidenceOnly=false}={}){
  if(!sameKeys(value,['id','eventType','eventDigest','createdAt'])||!exactString(value.id,240)||!LEARNING_EVENT_TYPES.has(value.eventType)||(evidenceOnly&&value.eventType!=='evidence-decided')||!exactString(value.eventDigest,180)||!Number.isSafeInteger(value.createdAt)||value.createdAt<0)invalid();
  return clone(value);
}
function compareRefs(left,right){return left.id.localeCompare(right.id)||left.eventType.localeCompare(right.eventType)||left.eventDigest.localeCompare(right.eventDigest)||left.createdAt-right.createdAt;}
function sortedUnique(rows,compare){return rows.every((row,index)=>index===0||compare(rows[index-1],row)<0);}
function profileProjection(profile){const {outputDigest,...projection}=profile;return projection;}
function validateProfile(profile){
  const validTimeframe=plain(profile.timeframe)&&sameKeys(profile.timeframe,['kind','startAt','endAt','timeZone','calendarDays'])&&exactString(profile.timeframe.timeZone,120)&&((profile.timeframe.kind==='inclusive'&&Number.isSafeInteger(profile.timeframe.startAt)&&Number.isSafeInteger(profile.timeframe.endAt)&&profile.timeframe.startAt>=0&&profile.timeframe.endAt>=profile.timeframe.startAt&&Number.isSafeInteger(profile.timeframe.calendarDays)&&profile.timeframe.calendarDays>=1)||(profile.timeframe.kind==='empty'&&profile.timeframe.startAt===null&&profile.timeframe.endAt===null&&profile.timeframe.calendarDays===0));
  if(!sameKeys(profile,PROFILE_FIELDS)||profile.schemaVersion!==1||profile.profileVersion!=='weakness-profile-v1'||profile.taxonomyVersion!=='wkn-taxonomy-v1'||profile.projectorVersion!=='weakness-projector-v1'||profile.kind!=='canonical-weakness-profile'||!plain(profile.conflicts)||!sameKeys(profile.conflicts,['count','identities','excludedEvents'])||!Number.isSafeInteger(profile.conflicts.count)||profile.conflicts.count<0||!Array.isArray(profile.conflicts.identities)||!Number.isSafeInteger(profile.conflicts.excludedEvents)||profile.conflicts.excludedEvents<0||!exactString(profile.outputDigest,180)||!Array.isArray(profile.canonicalInputRefs)||!Number.isSafeInteger(profile.denominator)||profile.denominator<0||!Number.isSafeInteger(profile.sampleSize)||profile.sampleSize!==profile.denominator||!validTimeframe||!Array.isArray(profile.reasonCodes)||!Array.isArray(profile.uncertaintyReasons)||profile.uncertainty!=='high'||typeof profile.insufficientData!=='boolean'||profile.conflictHandling!=='exclude-colliding-event-identities-and-mark-insufficient'||!plain(profile.observations)||!sameKeys(profile.observations,['bySkill'])||!plain(profile.observations.bySkill)||!plain(profile.provenance)||!sameKeys(profile.provenance,['source','metricsReducerVersion','metricsInputDigest','eligibilityAuthority'])||profile.provenance.source!=='canonical-p1-02-evidence-decided'||profile.provenance.metricsReducerVersion!=='p7-00-metrics-reducer-v1'||!exactString(profile.provenance.metricsInputDigest,180)||profile.provenance.eligibilityAuthority!=='EvidencePolicy'||!exactString(profile.inputDigest,180))invalid();
  if(digest(profileProjection(profile))!==profile.outputDigest)invalid();
  if(profile.canonicalInputRefs.length>10_000||!sortedUnique(profile.canonicalInputRefs,compareRefs))invalid();
  const canonicalRefs=profile.canonicalInputRefs.map(canonicalRef);
  const observations=Object.values(profile.observations.bySkill).map(validateObservation);
  if(!sortedUnique(observations,(left,right)=>left.skill.localeCompare(right.skill))||observations.some(row=>row.sourceRefs.length>10_000||!sortedUnique(row.sourceRefs,compareRefs)))invalid();
  let refCount=canonicalRefs.length;
  for(const observation of observations){const refs=observation.sourceRefs.map(ref=>canonicalRef(ref,{evidenceOnly:true}));refCount+=refs.length;if(refCount>10_000)invalid();}
  return {profile:clone(profile),observations};
}
function validateInput(input){
  assertJsonData(input);
  if(!sameKeys(input,['weaknessProfile','candidates','acceptedExecutors','dayKey'])||!Array.isArray(input.candidates)||input.candidates.length>1000||!Array.isArray(input.acceptedExecutors)||input.acceptedExecutors.length>64||!exactDay(input.dayKey))invalid();
  const accepted=[...input.acceptedExecutors];
  if(accepted.some(value=>!exactString(value,120))||new Set(accepted).size!==accepted.length)invalid();
  const candidates=input.candidates.map(validateCandidate);const ids=new Set();if(candidates.some(row=>ids.has(row.id)||(ids.add(row.id),false)))invalid();
  const profile=validateProfile(input.weaknessProfile);
  return {profile,candidates,acceptedExecutors:accepted.sort(),dayKey:input.dayKey};
}
function canonicalInputDigest({profile,candidates,acceptedExecutors,dayKey}){
  return digest({schemaVersion:FOCUS_SCHEMA_VERSION,selectorVersion:FOCUS_SELECTOR_VERSION,dayKey,profileOutputDigest:profile.profile.outputDigest,candidates:[...candidates].sort((a,b)=>a.id.localeCompare(b.id)).map(candidateProjection),acceptedExecutors});
}
function decisionBase({dayKey,inputDigest,status,reasonCode,selection=null}){return deepFreeze({schemaVersion:FOCUS_SCHEMA_VERSION,selectorVersion:FOCUS_SELECTOR_VERSION,status,reasonCode,dayKey,slotCap:FOCUS_SLOT_CAP,selection,inputDigest});}

export function selectCanonicalFocus(input){
  const normalized=validateInput(input);
  const inputDigest=canonicalInputDigest(normalized);
  const profileHasIdentityConflict=Number(normalized.profile.profile.conflicts?.count||0)>0||normalized.profile.profile.reasonCodes.includes('IDENTITY_CONFLICT');
  const eligibleObservations=normalized.profile.observations.filter(row=>row.status==='OBSERVED'&&row.denominator>=2&&!profileHasIdentityConflict&&!row.reasonCodes.includes('CONFLICTING_CANONICAL_EVENTS')&&row.sourceRefs.length>0);
  if(!eligibleObservations.length)return decisionBase({dayKey:normalized.dayKey,inputDigest,status:'NOT_SELECTED',reasonCode:'FOCUS_INSUFFICIENT_DATA'});
  const bySkill=new Map(eligibleObservations.map(row=>[row.skill,row]));
  const candidates=normalized.candidates.filter(row=>bySkill.has(row.target.skill)&&normalized.acceptedExecutors.includes(row.executor));
  if(!candidates.length)return decisionBase({dayKey:normalized.dayKey,inputDigest,status:'NOT_SELECTED',reasonCode:'FOCUS_NO_ELIGIBLE_CANDIDATE'});
  const candidateSet=candidates.map(candidateProjection).sort((a,b)=>a.id.localeCompare(b.id));
  const candidateSetDigest=digest(candidateSet);
  const ranked=candidates.map(candidate=>{
    const observation=bySkill.get(candidate.target.skill);
    const weakness={skill:observation.skill,failureRate:observation.failureRate,sampleSize:observation.denominator,qualifiedFailures:observation.qualifiedFailures,profileVersion:normalized.profile.profile.profileVersion,taxonomyVersion:normalized.profile.profile.taxonomyVersion,projectorVersion:normalized.profile.profile.projectorVersion,profileOutputDigest:normalized.profile.profile.outputDigest,metricsInputDigest:normalized.profile.profile.provenance.metricsInputDigest,sourceRefsDigest:digest(observation.sourceRefs)};
    const tieDigest=digest({selectorVersion:FOCUS_SELECTOR_VERSION,dayKey:normalized.dayKey,profileOutputDigest:normalized.profile.profile.outputDigest,candidate:candidateProjection(candidate)});
    return {candidate,weakness,tieDigest};
  }).sort((left,right)=>right.weakness.failureRate-left.weakness.failureRate||right.weakness.sampleSize-left.weakness.sampleSize||left.candidate.id.localeCompare(right.candidate.id)||left.tieDigest.localeCompare(right.tieDigest));
  const winner=ranked[0];
  const selection={candidate:candidateProjection(winner.candidate),weakness:winner.weakness,candidateSet,candidateSetDigest,tieDigest:winner.tieDigest};
  selection.coreSelectionDigest=digest(selection);
  return decisionBase({dayKey:normalized.dayKey,inputDigest,status:'SELECTED',reasonCode:FOCUS_REASON_CODE,selection});
}
function validateSelection(selection,{dayKey}={}){
  assertJsonData(selection);
  if(!exactDay(dayKey)||!sameKeys(selection,SELECTION_FIELDS)||!sameKeys(selection.candidate,CANDIDATE_FIELDS)||!Array.isArray(selection.candidateSet)||!plain(selection.weakness)||!sameKeys(selection.weakness,['skill','failureRate','sampleSize','qualifiedFailures','profileVersion','taxonomyVersion','projectorVersion','profileOutputDigest','metricsInputDigest','sourceRefsDigest'])||!exactString(selection.weakness.skill,80)||selection.candidate.target.skill!==selection.weakness.skill||typeof selection.weakness.failureRate!=='number'||!Number.isFinite(selection.weakness.failureRate)||selection.weakness.failureRate<0||selection.weakness.failureRate>1||!Number.isSafeInteger(selection.weakness.sampleSize)||selection.weakness.sampleSize<2||!Number.isSafeInteger(selection.weakness.qualifiedFailures)||selection.weakness.qualifiedFailures<0||['profileVersion','taxonomyVersion','projectorVersion','profileOutputDigest','metricsInputDigest','sourceRefsDigest'].some(key=>!exactString(selection.weakness[key],180))||!exactString(selection.candidateSetDigest,180)||!exactString(selection.tieDigest,180)||!exactString(selection.coreSelectionDigest,180))return null;
  let candidate;let candidateSet;
  try{candidate=validateCandidate(selection.candidate);candidateSet=selection.candidateSet.map(validateCandidate);}catch{return null;}
  if(!candidateSet.length||candidateSet.length>1000||!sortedUnique(candidateSet,(left,right)=>left.id.localeCompare(right.id))||digest(candidateSet)!==selection.candidateSetDigest||candidateSet.filter(row=>digest(row)===digest(candidate)).length!==1)return null;
  if(selection.tieDigest!==digest({selectorVersion:FOCUS_SELECTOR_VERSION,dayKey,profileOutputDigest:selection.weakness.profileOutputDigest,candidate}))return null;
  const {coreSelectionDigest,...core}=selection;if(digest(core)!==selection.coreSelectionDigest)return null;
  return clone({...selection,candidate,candidateSet});
}

export function bindFocusSelectionBudget(selection,{totalBudgetSeconds,remainingBudgetSeconds}={}){
  assertJsonData(selection);assertJsonData({totalBudgetSeconds,remainingBudgetSeconds});
  if(!sameKeys(selection,['schemaVersion','selectorVersion','status','reasonCode','dayKey','slotCap','selection','inputDigest'])||selection.schemaVersion!==FOCUS_SCHEMA_VERSION||selection.selectorVersion!==FOCUS_SELECTOR_VERSION||selection.status!=='SELECTED'||selection.reasonCode!==FOCUS_REASON_CODE||selection.slotCap!==FOCUS_SLOT_CAP||!exactDay(selection.dayKey)||!exactString(selection.inputDigest,180)||!Number.isSafeInteger(totalBudgetSeconds)||!Number.isSafeInteger(remainingBudgetSeconds)||totalBudgetSeconds<0||remainingBudgetSeconds<0||remainingBudgetSeconds>totalBudgetSeconds)invalid();
  const exactSelection=validateSelection(selection.selection,{dayKey:selection.dayKey});if(!exactSelection||remainingBudgetSeconds<exactSelection.candidate.estimatedSeconds)invalid();
  const binding={schemaVersion:FOCUS_SCHEMA_VERSION,selectorVersion:FOCUS_SELECTOR_VERSION,reasonCode:FOCUS_REASON_CODE,dayKey:selection.dayKey,slotCap:FOCUS_SLOT_CAP,selection:exactSelection,budget:{totalSeconds:totalBudgetSeconds,remainingSecondsBeforeFocus:remainingBudgetSeconds,estimatedSeconds:exactSelection.candidate.estimatedSeconds}};
  binding.selectionDigest=digest(binding);
  return deepFreeze(binding);
}

function exactBindingCopy(value,binding){
  return validateFocusSelectionBinding(value).valid&&digest(value)===digest(binding);
}

export function validateFocusSelectionBinding(binding,{activity}={}){
  try{
    assertJsonData(binding);if(activity!==undefined)assertJsonData(activity);
    if(!sameKeys(binding,BINDING_FIELDS)||binding.schemaVersion!==FOCUS_SCHEMA_VERSION||binding.selectorVersion!==FOCUS_SELECTOR_VERSION||binding.reasonCode!==FOCUS_REASON_CODE||binding.slotCap!==FOCUS_SLOT_CAP||!exactDay(binding.dayKey)||!plain(binding.budget)||!sameKeys(binding.budget,['totalSeconds','remainingSecondsBeforeFocus','estimatedSeconds'])||!Number.isSafeInteger(binding.budget.totalSeconds)||!Number.isSafeInteger(binding.budget.remainingSecondsBeforeFocus)||!Number.isSafeInteger(binding.budget.estimatedSeconds)||binding.budget.totalSeconds<0||binding.budget.remainingSecondsBeforeFocus<0||binding.budget.remainingSecondsBeforeFocus>binding.budget.totalSeconds||!exactString(binding.selectionDigest,180))return {valid:false,value:null,reason:'FOCUS_BINDING_INVALID'};
    const selection=validateSelection(binding.selection,{dayKey:binding.dayKey});if(!selection||binding.budget.estimatedSeconds!==selection.candidate.estimatedSeconds||binding.budget.remainingSecondsBeforeFocus<binding.budget.estimatedSeconds)return {valid:false,value:null,reason:'FOCUS_BINDING_INVALID'};
    const {selectionDigest,...payload}=binding;if(digest(payload)!==binding.selectionDigest)return {valid:false,value:null,reason:'FOCUS_BINDING_DIGEST_MISMATCH'};
    if(activity!==undefined){
      const spec=activity.activitySpec,metadata=spec?.metadata;
      if(!plain(activity)||!plain(activity.execution)||!plain(activity.payload)||!plain(spec)||!plain(metadata)||!plain(metadata.payload)||activity.id!==selection.candidate.id||activity.type!==selection.candidate.type||digest(activity.target)!==digest(selection.candidate.target)||activity.execution.kind!==selection.candidate.executor||Number(activity.estimatedSeconds)!==selection.candidate.estimatedSeconds||activity.reasonCode!==FOCUS_REASON_CODE||activity.payload.reasonCode!==FOCUS_REASON_CODE||!exactBindingCopy(activity.payload.focusSelection,binding)||spec.id!==activity.id||spec.type!==activity.type||digest(spec.target)!==digest(activity.target)||spec.executor!==activity.execution.kind||metadata.reasonCode!==activity.reasonCode||Number(metadata.estimatedSeconds)!==Number(activity.estimatedSeconds)||metadata.sourceId!==(activity.sourceId||selection.candidate.target.sourceId)||!exactBindingCopy(metadata.payload.focusSelection,binding))return {valid:false,value:null,reason:'FOCUS_ACTIVITY_MISMATCH'};
    }
    return {valid:true,value:deepFreeze(clone(binding)),reason:null};
  }catch{return {valid:false,value:null,reason:'FOCUS_BINDING_INVALID'};}
}
