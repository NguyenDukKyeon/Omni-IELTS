import { validateLearningEventRecord } from './event-repository.js';
import { learningContractDigest, normalizeLearningTarget } from './learning-contracts.js';

export const P7_METRICS_SCHEMA_VERSION=1;
export const P7_METRICS_REDUCER_VERSION='p7-00-metrics-reducer-v1';
export const P7_METRICS_MAX_EVENTS=100000;

export class P7MetricsError extends Error{
  constructor(code,message){super(message);this.name='P7MetricsError';this.code=code;}
}

function deepFreeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.freeze(value);
    for(const key of Object.keys(value))deepFreeze(value[key]);
  }
  return value;
}

function invalidInput(){throw new P7MetricsError('P7_METRICS_INVALID_INPUT','Canonical learning metrics input is invalid.');}

function assertJsonData(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return;
  if(typeof value==='number'){if(Number.isFinite(value))return;invalidInput();}
  if(typeof value!=='object'||seen.has(value)||Object.getOwnPropertySymbols(value).length)invalidInput();
  seen.add(value);
  const isArray=Array.isArray(value);
  const prototype=Object.getPrototypeOf(value);
  if((isArray&&prototype!==Array.prototype)||(!isArray&&prototype!==Object.prototype&&prototype!==null))invalidInput();
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(isArray){
    const length=descriptors.length?.value;
    const keys=Object.keys(descriptors).filter(key=>key!=='length');
    if(!Number.isSafeInteger(length)||length<0||keys.length!==length||keys.some(key=>!/^0$|^[1-9]\d*$/.test(key)||Number(key)>=length))invalidInput();
    for(let index=0;index<length;index+=1){const descriptor=descriptors[String(index)];if(!descriptor||!('value' in descriptor)||descriptor.get||descriptor.set)invalidInput();}
  }
  for(const descriptor of Object.values(descriptors)){
    if(!('value' in descriptor)||descriptor.get||descriptor.set)invalidInput();
    assertJsonData(descriptor.value,seen);
  }
  seen.delete(value);
}

function canonicalTimeZone(timeZone){
  if(typeof timeZone!=='string'||!timeZone.trim())throw new P7MetricsError('P7_METRICS_INVALID_TIMEZONE','Metrics timezone is invalid.');
  try{return new Intl.DateTimeFormat('en-CA',{timeZone}).resolvedOptions().timeZone;}
  catch{throw new P7MetricsError('P7_METRICS_INVALID_TIMEZONE','Metrics timezone is invalid.');}
}

function compareText(left,right){return String(left).localeCompare(String(right));}
function compareRefs(left,right){return compareText(left.id,right.id)||compareText(left.eventType,right.eventType)||compareText(left.eventDigest,right.eventDigest)||left.createdAt-right.createdAt;}
function canonicalRef(record){return{id:record.id,eventType:record.eventType,eventDigest:record.eventDigest,createdAt:record.createdAt};}
function localDay(timestamp,timeZone){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(timestamp));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function dayNumber(day){const[year,month,date]=day.split('-').map(Number);return Date.UTC(year,month-1,date)/86400000;}
function round(value){return Math.round(value*1_000_000)/1_000_000;}
function metric({numerator=null,denominator=0,timeframe,reason,sourceRefs=[]}){
  return deepFreeze(denominator>0&&numerator!==null?{
    status:'MEASURED',numerator,denominator,value:round(numerator/denominator),sampleSize:denominator,timeframe,reason:null,sourceRefs
  }:{status:'INSUFFICIENT_DATA',numerator:null,denominator,value:null,sampleSize:denominator,timeframe,reason,sourceRefs});
}
function unavailable(reason,timeframe){return deepFreeze({status:'INSUFFICIENT_DATA',numerator:null,denominator:0,value:null,sampleSize:0,timeframe,reason,sourceRefs:[]});}

function validateRecords(records){
  if(!Array.isArray(records)||records.length>P7_METRICS_MAX_EVENTS)invalidInput();
  assertJsonData(records);
  return records.map(record=>{
    const validation=validateLearningEventRecord(record);
    if(!validation.valid||!Number.isSafeInteger(record.createdAt)||record.createdAt<0||record.createdAt>8_640_000_000_000_000)invalidInput();
    return record;
  });
}

function richProvenance(record,included,reasonOverride=null){
  const target=normalizeLearningTarget(record.payload?.target)||record.payload?.target||{};
  return{
    eventId:record.id,
    eventDigest:record.eventDigest,
    receiptId:record.receiptId||null,
    activitySpecId:record.activitySpecId||null,
    runId:record.runId||null,
    attemptId:record.attemptId||null,
    createdAt:record.createdAt,
    included,
    reason:reasonOverride||record.payload?.reason||null,
    rating:record.payload?.rating||null,
    skill:record.payload?.skill||null,
    successful:record.payload?.successful===true,
    sourceId:target?.sourceId||null,
    sourceRevision:target?.sourceRevision||null,
    targetType:target?.targetType||null,
    targetId:target?.targetId||target?.cardId||null
  };
}

export function reduceCanonicalLearningMetrics(records,{timeZone='UTC'}={}){
  const zone=canonicalTimeZone(timeZone);
  const valid=validateRecords(records);
  const byId=new Map();
  let duplicatesDropped=0;

  for(const record of valid){
    if(!byId.has(record.id))byId.set(record.id,new Map());
    const versions=byId.get(record.id);
    const existing=versions.get(record.eventDigest);
    if(existing){
      if(learningContractDigest(existing)!==learningContractDigest(record))invalidInput();
      duplicatesDropped+=1;
      continue;
    }
    versions.set(record.eventDigest,record);
  }

  const conflicts=[];
  const canonical=[];
  const allUnique=[];
  for(const[id,versions]of byId){
    const rows=[...versions.values()];
    allUnique.push(...rows);
    if(versions.size>1){conflicts.push({id,digests:[...versions.keys()].sort(compareText)});continue;}
    canonical.push(rows[0]);
  }
  conflicts.sort((left,right)=>compareText(left.id,right.id));
  canonical.sort((left,right)=>left.createdAt-right.createdAt||compareText(left.id,right.id)||compareText(left.eventDigest,right.eventDigest));
  allUnique.sort((left,right)=>left.createdAt-right.createdAt||compareText(left.id,right.id)||compareText(left.eventDigest,right.eventDigest));

  const canonicalInputRefs=allUnique.map(canonicalRef).sort(compareRefs);
  const evidence=canonical.filter(record=>record.eventType==='evidence-decided');
  const conflictIds=new Set(conflicts.map(conflict=>conflict.id));
  const conflictEvidence=allUnique.filter(record=>record.eventType==='evidence-decided'&&conflictIds.has(record.id));
  const eligible=evidence.filter(record=>record.payload.eligible===true);
  const excluded=evidence.filter(record=>record.payload.eligible!==true);
  const numerator=eligible.filter(record=>record.payload.successful===true).length;
  const denominator=eligible.length;

  const reasonCounts={};
  for(const record of excluded){const reason=String(record.payload.reason||'UNSPECIFIED');reasonCounts[reason]=(reasonCounts[reason]||0)+1;}
  if(conflictEvidence.length)reasonCounts['identity-conflict']=conflictEvidence.length;
  const sortedReasonCounts=Object.fromEntries(Object.entries(reasonCounts).sort(([left],[right])=>compareText(left,right)));

  const sourceRefs=eligible.map(canonicalRef).sort(compareRefs);
  const days=eligible.map(record=>localDay(record.createdAt,zone)).sort(compareText);
  const firstAt=eligible.length?Math.min(...eligible.map(record=>record.createdAt)):null;
  const lastAt=eligible.length?Math.max(...eligible.map(record=>record.createdAt)):null;
  const firstDay=days[0]||null;
  const lastDay=days.at(-1)||null;
  const timeframe=firstDay
    ?deepFreeze({kind:'inclusive',startAt:firstAt,endAt:lastAt,firstAt,lastAt,timeZone:zone,calendarDays:dayNumber(lastDay)-dayNumber(firstDay)+1})
    :deepFreeze({kind:'empty',startAt:null,endAt:null,firstAt:null,lastAt:null,timeZone:zone,calendarDays:0});

  const skillGroups=new Map();
  for(const record of eligible){
    const skill=String(record.payload.skill||'unknown');
    if(!skillGroups.has(skill))skillGroups.set(skill,[]);
    skillGroups.get(skill).push(record);
  }
  const bySkill=Object.fromEntries([...skillGroups.entries()].sort(([left],[right])=>compareText(left,right)).map(([skill,rows])=>{
    const successful=rows.filter(record=>record.payload.successful===true).length;
    return[skill,deepFreeze({numerator:successful,denominator:rows.length,sampleSize:rows.length,successful,unsuccessful:rows.length-successful,sourceRefs:rows.map(canonicalRef).sort(compareRefs)})];
  }));

  const targetGroups=new Map();
  for(const record of eligible){
    const target=normalizeLearningTarget(record.payload.target);
    const key=target?learningContractDigest(target):null;
    if(key&&!targetGroups.has(key))targetGroups.set(key,[]);
    if(key)targetGroups.get(key).push(record);
  }
  const recurrent=[...targetGroups.values()].filter(rows=>rows.filter(row=>row.payload.successful!==true).length>=2).length;

  const provenance=[
    ...evidence.map(record=>richProvenance(record,record.payload.eligible===true)),
    ...conflictEvidence.map(record=>richProvenance(record,false,'identity-conflict'))
  ].sort((left,right)=>left.createdAt-right.createdAt||compareText(left.eventId,right.eventId)||compareText(left.eventDigest,right.eventDigest));

  const ignoredEventTypes=Object.entries(canonical.filter(record=>record.eventType!=='evidence-decided').reduce((counts,record)=>{
    counts[record.eventType]=(counts[record.eventType]||0)+1;return counts;
  },{})).sort(([left],[right])=>compareText(left,right)).map(([eventType,count])=>({eventType,count}));

  const status=denominator>0?'MEASURED':'INSUFFICIENT_DATA';
  const inputDigest=learningContractDigest({reducerVersion:P7_METRICS_REDUCER_VERSION,timeZone:zone,canonicalInputRefs});
  const conflictSummary=deepFreeze({count:conflicts.length,identities:conflicts,excludedEvents:conflictEvidence.length});
  const totalCanonicalDecisions=evidence.length+conflictEvidence.length;
  const output={
    kind:'canonical-learning-metrics',
    schemaVersion:P7_METRICS_SCHEMA_VERSION,
    reducerVersion:P7_METRICS_REDUCER_VERSION,
    status,
    reason:status==='MEASURED'?null:'NO_EVIDENCE',
    numerator,
    denominator,
    sampleSize:denominator,
    totalCanonicalDecisions,
    duplicatesDropped,
    inputDigest,
    canonicalInputRefs,
    timeframe,
    provenance,
    excluded:deepFreeze({count:excluded.length+conflictEvidence.length,byReason:sortedReasonCounts}),
    conflicts:conflictSummary,
    bySkill:deepFreeze(bySkill),
    eligibility:deepFreeze({total:totalCanonicalDecisions,eligible:denominator,ineligible:excluded.length+conflictEvidence.length,successful:numerator,unsuccessful:denominator-numerator,reasonCounts:sortedReasonCounts,sourceRefs:evidence.map(canonicalRef).sort(compareRefs)}),
    retrieval:metric({numerator,denominator,timeframe,reason:'NO_QUALIFIED_EVIDENCE',sourceRefs}),
    delayedSuccess:unavailable('DELAY_SIGNAL_UNAVAILABLE',timeframe),
    coverage:unavailable('TARGET_UNIVERSE_UNAVAILABLE',timeframe),
    stability:unavailable('STABILITY_INTERVAL_UNAVAILABLE',timeframe),
    recurrence:metric({numerator:recurrent,denominator:targetGroups.size,timeframe,reason:'NO_QUALIFIED_TARGET_EVIDENCE',sourceRefs}),
    contentCompletion:unavailable('CONTENT_COMPLETION_SIGNAL_UNAVAILABLE',timeframe),
    activeDays:metric({numerator:new Set(days).size,denominator:timeframe.calendarDays,timeframe,reason:'NO_QUALIFIED_EVIDENCE',sourceRefs}),
    surfaceReconciliation:deepFreeze({status:'INSUFFICIENT_DATA',reason:'SURFACE_OWNER_NOT_IN_CANONICAL_EVENT',sourceRefs:[]}),
    ignoredEventTypes:deepFreeze(ignoredEventTypes)
  };
  return deepFreeze(output);
}
