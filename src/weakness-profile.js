import { learningContractDigest } from './learning-contracts.js';

export const WKN_SCHEMA_VERSION=1;
export const WKN_PROFILE_VERSION='weakness-profile-v1';
export const WKN_TAXONOMY_VERSION='wkn-taxonomy-v1';
export const WKN_PROJECTOR_VERSION='weakness-projector-v1';
const WEAKNESS_PROFILES=new WeakSet();

function deepFreeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const key of Object.keys(value))deepFreeze(value[key]);}
  return value;
}

function invalidMetrics(){throw new TypeError('WeaknessProfile requires canonical P7 metrics.');}
function assertJsonData(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return;
  if(typeof value==='number'){if(Number.isFinite(value))return;invalidMetrics();}
  if(typeof value!=='object'||seen.has(value)||Object.getOwnPropertySymbols(value).length)invalidMetrics();
  seen.add(value);const array=Array.isArray(value);const prototype=Object.getPrototypeOf(value);if((array&&prototype!==Array.prototype)||(!array&&prototype!==Object.prototype&&prototype!==null))invalidMetrics();
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(array){const length=descriptors.length?.value;const keys=Object.keys(descriptors).filter(key=>key!=='length');if(!Number.isSafeInteger(length)||keys.length!==length||keys.some(key=>!/^0$|^[1-9]\d*$/.test(key)||Number(key)>=length))invalidMetrics();}
  for(const descriptor of Object.values(descriptors)){if(!('value' in descriptor)||descriptor.get||descriptor.set)invalidMetrics();assertJsonData(descriptor.value,seen);}seen.delete(value);
}

function profileTimeframe(timeframe={}){
  return{
    kind:timeframe.kind==='inclusive'?'inclusive':'empty',
    startAt:timeframe.kind==='inclusive'?timeframe.startAt:null,
    endAt:timeframe.kind==='inclusive'?timeframe.endAt:null,
    timeZone:typeof timeframe.timeZone==='string'?timeframe.timeZone:'UTC',
    calendarDays:timeframe.kind==='inclusive'?timeframe.calendarDays:0
  };
}

function skillRows(metrics={}){
  if(Array.isArray(metrics.bySkill))return metrics.bySkill;
  return Object.entries(metrics.bySkill||{}).map(([skill,row])=>({
    skill,
    successful:Number(row?.successful??row?.numerator??0),
    unsuccessful:Number(row?.unsuccessful??Math.max(0,Number(row?.denominator||0)-Number(row?.numerator||0))),
    denominator:Number(row?.denominator||0),
    sourceRefs:Array.isArray(row?.sourceRefs)?row.sourceRefs:[]
  }));
}

export function projectWeaknessProfile(metrics){
  assertJsonData(metrics);
  if(!metrics||typeof metrics!=='object'||metrics.schemaVersion!==1||typeof metrics.inputDigest!=='string')invalidMetrics();
  const denominator=Number(metrics.denominator??metrics.eligibility?.eligible??0);
  const reasons=[];
  if(denominator===0)reasons.push('NO_QUALIFIED_EVIDENCE');
  if(denominator===1)reasons.push('SINGLE_QUALIFIED_SAMPLE');
  const conflictCount=Array.isArray(metrics.conflicts)?metrics.conflicts.length:Number(metrics.conflicts?.count||0);
  const hasConflicts=conflictCount>0;
  if(hasConflicts)reasons.push('CONFLICTING_CANONICAL_EVENTS');
  const insufficientData=reasons.length>0;
  const observations=skillRows(metrics).map(row=>{
    const reasonCodes=hasConflicts?['CONFLICTING_CANONICAL_EVENTS']:row.denominator===0?['NO_QUALIFIED_EVIDENCE']:row.denominator===1?['SINGLE_QUALIFIED_SAMPLE']:[];
    const observed=row.denominator>=2&&!hasConflicts;
    return{skill:row.skill,qualifiedSuccesses:row.successful,qualifiedFailures:row.unsuccessful,denominator:row.denominator,failureRate:row.denominator?Math.round(row.unsuccessful/row.denominator*1_000_000)/1_000_000:null,status:observed?'OBSERVED':'INSUFFICIENT_DATA',reasonCodes,sourceRefs:row.sourceRefs};
  }).sort((left,right)=>String(left.skill).localeCompare(String(right.skill)));
  const result={
    schemaVersion:WKN_SCHEMA_VERSION,profileVersion:WKN_PROFILE_VERSION,taxonomyVersion:WKN_TAXONOMY_VERSION,projectorVersion:WKN_PROJECTOR_VERSION,
    canonicalInputRefs:metrics.canonicalInputRefs,denominator,sampleSize:denominator,timeframe:profileTimeframe(metrics.timeframe),
    reasonCodes:reasons.sort(),uncertainty:'high',uncertaintyReasons:deepFreeze(['UNCALIBRATED_MINIMUM_POLICY']),insufficientData,
    conflictHandling:'exclude-colliding-event-identities-and-mark-insufficient',observations:{bySkill:observations},
    provenance:{source:'canonical-p1-02-evidence-decided',metricsReducerVersion:metrics.reducerVersion,metricsInputDigest:metrics.inputDigest,eligibilityAuthority:'EvidencePolicy'},
    inputDigest:learningContractDigest(metrics)
  };
  result.outputDigest=learningContractDigest(result);
  WEAKNESS_PROFILES.add(result);
  return deepFreeze(result);
}

function exact(value,keys){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(value,key));}
function token(value,max=240){return typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;}
function same(left,right){return learningContractDigest(left)===learningContractDigest(right);}
function sorted(values,key=value=>value){return values.every((value,index)=>index===0||String(key(values[index-1])).localeCompare(String(key(value)))<=0);}
function validRef(value){return exact(value,['id','eventType','eventDigest','createdAt'])&&token(value.id,240)&&token(value.eventType,120)&&token(value.eventDigest,240)&&Number.isSafeInteger(value.createdAt)&&value.createdAt>=0;}

export function validateWeaknessProfile(input){
  try{
    assertJsonData(input);
    const fields=['schemaVersion','profileVersion','taxonomyVersion','projectorVersion','canonicalInputRefs','denominator','sampleSize','timeframe','reasonCodes','uncertainty','uncertaintyReasons','insufficientData','conflictHandling','observations','provenance','inputDigest','outputDigest'];
    if(!exact(input,fields)||input.schemaVersion!==WKN_SCHEMA_VERSION||input.profileVersion!==WKN_PROFILE_VERSION||input.taxonomyVersion!==WKN_TAXONOMY_VERSION||input.projectorVersion!==WKN_PROJECTOR_VERSION||!Number.isSafeInteger(input.denominator)||input.denominator<0||input.sampleSize!==input.denominator||input.uncertainty!=='high'||input.conflictHandling!=='exclude-colliding-event-identities-and-mark-insufficient'||!token(input.inputDigest)||!token(input.outputDigest)||!exact(input.provenance,['source','metricsReducerVersion','metricsInputDigest','eligibilityAuthority'])||input.provenance.source!=='canonical-p1-02-evidence-decided'||!token(input.provenance.metricsReducerVersion)||!token(input.provenance.metricsInputDigest)||input.provenance.eligibilityAuthority!=='EvidencePolicy'||!Array.isArray(input.canonicalInputRefs)||!input.canonicalInputRefs.every(validRef)||!sorted(input.canonicalInputRefs,row=>`${row.id}\u0000${row.eventType}\u0000${row.eventDigest}\u0000${row.createdAt}`)||!Array.isArray(input.reasonCodes)||!sorted(input.reasonCodes)||!Array.isArray(input.uncertaintyReasons)||!same(input.uncertaintyReasons,['UNCALIBRATED_MINIMUM_POLICY'])||!exact(input.observations,['bySkill'])||!Array.isArray(input.observations.bySkill)||!sorted(input.observations.bySkill,row=>row.skill)||!exact(input.timeframe,['kind','startAt','endAt','timeZone','calendarDays']))return{valid:false,value:null};
    const conflicts=input.reasonCodes.includes('CONFLICTING_CANONICAL_EVENTS');let denominator=0;
    for(const row of input.observations.bySkill){
      if(!exact(row,['skill','qualifiedSuccesses','qualifiedFailures','denominator','failureRate','status','reasonCodes','sourceRefs'])||!token(row.skill,120)||!Number.isSafeInteger(row.qualifiedSuccesses)||!Number.isSafeInteger(row.qualifiedFailures)||!Number.isSafeInteger(row.denominator)||row.qualifiedSuccesses<0||row.qualifiedFailures<0||row.denominator!==row.qualifiedSuccesses+row.qualifiedFailures||!Array.isArray(row.sourceRefs)||row.sourceRefs.length!==row.denominator||!row.sourceRefs.every(validRef)||!sorted(row.sourceRefs,row=>`${row.id}\u0000${row.eventType}\u0000${row.eventDigest}\u0000${row.createdAt}`)||!Array.isArray(row.reasonCodes)||!sorted(row.reasonCodes))return{valid:false,value:null};
      const observed=row.denominator>=2&&!conflicts,expectedReasons=conflicts?['CONFLICTING_CANONICAL_EVENTS']:row.denominator===0?['NO_QUALIFIED_EVIDENCE']:row.denominator===1?['SINGLE_QUALIFIED_SAMPLE']:[];
      if(row.status!==(observed?'OBSERVED':'INSUFFICIENT_DATA')||!same(row.reasonCodes,expectedReasons)||row.failureRate!==(row.denominator?Math.round(row.qualifiedFailures/row.denominator*1_000_000)/1_000_000:null))return{valid:false,value:null};denominator+=row.denominator;
    }
    const expectedReasons=[...(input.denominator===0?['NO_QUALIFIED_EVIDENCE']:[]),...(input.denominator===1?['SINGLE_QUALIFIED_SAMPLE']:[]),...(conflicts?['CONFLICTING_CANONICAL_EVENTS']:[])].sort();
    const {outputDigest,...withoutOutputDigest}=input;
    if(denominator!==input.denominator||!same(input.reasonCodes,expectedReasons)||input.insufficientData!==(expectedReasons.length>0)||outputDigest!==learningContractDigest(withoutOutputDigest))return{valid:false,value:null};
    return{valid:true,value:deepFreeze(structuredClone(input))};
  }catch{return{valid:false,value:null};}
}
