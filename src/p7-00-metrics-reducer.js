import { learningContractDigest, normalizeTimezone } from './learning-contracts.js';

export const P7_METRICS_SCHEMA_VERSION='P7_METRICS_V1';
export const P7_METRICS_PROJECTOR_VERSION='p7-00-v1';

const metricDomains=['retrieval','delayedSuccess','coverage','stability','recurrence','contentCompletion'];
const codeUnitCompare=(left,right)=>String(left)<String(right)?-1:String(left)>String(right)?1:0;

function canonicalDecisionRecord(event={}){
  return event?.kind==='canonical-learning-event'&&Number(event.schemaVersion)===1&&event.eventType==='evidence-decided'&&event.payload&&typeof event.payload==='object';
}

function eventIdentity(event={}){
  return String(event.id||event.eventDigest||learningContractDigest({receiptId:event.receiptId||null,activitySpecId:event.activitySpecId||null,runId:event.runId||null,attemptId:event.attemptId||null,payload:event.payload||null}));
}

function canonicalRef(event={}){
  return Object.freeze({id:eventIdentity(event),eventDigest:event.eventDigest||null,receiptId:event.receiptId||null,activitySpecId:event.activitySpecId||null,runId:event.runId||null,attemptId:event.attemptId||null,createdAt:Number(event.createdAt||0)});
}

function localDayKey(timestamp,timeZone){
  const date=new Date(Number(timestamp||0));
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return`${values.year}-${values.month}-${values.day}`;
}

function surfaceForTarget(target={}){
  const type=String(target?.targetType||'');
  const sourceId=String(target?.sourceId||'').toLowerCase();
  if(type==='core-card'||target?.cardId||sourceId.startsWith('core-card:'))return'Core';
  if(type==='ielts-objective-item'||sourceId.includes('ielts'))return'IELTS';
  if(type==='productive-text-revision'||sourceId.includes('v10'))return'V10';
  return'Unknown';
}

function unavailableMetric(reason,denominator,provenance,timeframe){
  return Object.freeze({status:'INSUFFICIENT_DATA',reason,denominator,sampleSize:denominator,timeframe,provenance});
}

function conflictSummary(eligible=[]){
  const groups=new Map();
  for(const event of eligible){
    const key=learningContractDigest(event.payload?.target||{});
    const row=groups.get(key)||{success:false,failure:false};
    if(event.payload?.successful===true)row.success=true;
    else row.failure=true;
    groups.set(key,row);
  }
  const targets=[...groups.entries()].filter(([,row])=>row.success&&row.failure).map(([key])=>key).sort(codeUnitCompare);
  return Object.freeze({count:targets.length,targets});
}

function emptyProjection({timeZone,timeframe}={}){
  const zone=normalizeTimezone(timeZone||'UTC');
  const range=timeframe||'all_time';
  const provenance=[];
  const metrics=Object.fromEntries(metricDomains.map(name=>[name,unavailableMetric(`NO_CANONICAL_${name.toUpperCase()}_EVIDENCE`,0,provenance,range)]));
  metrics.activeDays=unavailableMetric('NO_CANONICAL_ACTIVITY_EVIDENCE',0,provenance,range);
  const base={schemaVersion:P7_METRICS_SCHEMA_VERSION,projectorVersion:P7_METRICS_PROJECTOR_VERSION,status:'INSUFFICIENT_DATA',reason:'NO_ELIGIBLE_CANONICAL_EVIDENCE',numerator:0,denominator:0,sampleSize:0,timeframe:range,timeZone:zone,eligibility:'canonical-evidence-decision',provenance,canonicalInputRefs:[],excluded:{count:0,reasonCounts:{}},duplicatesDropped:0,surfaceTotals:{Core:0,IELTS:0,V10:0,Unknown:0},conflicts:{count:0,targets:[]},metrics};
  return Object.freeze({...base,inputDigest:learningContractDigest([])});
}

export function reduceCanonicalLearningMetrics(events=[],{timeZone='UTC',timeframe='all_time'}={}){
  const zone=normalizeTimezone(timeZone);
  const unique=new Map();
  let duplicatesDropped=0;
  for(const event of events){
    if(!canonicalDecisionRecord(event))continue;
    const id=eventIdentity(event);
    if(unique.has(id)){duplicatesDropped+=1;continue;}
    unique.set(id,event);
  }
  const canonical=[...unique.values()].sort((left,right)=>Number(left.createdAt||0)-Number(right.createdAt||0)||codeUnitCompare(eventIdentity(left),eventIdentity(right)));
  if(!canonical.length)return emptyProjection({timeZone:zone,timeframe});

  const eligible=canonical.filter(event=>event.payload?.eligible===true);
  const excludedRows=canonical.filter(event=>event.payload?.eligible!==true);
  const reasonCounts={};
  for(const event of excludedRows){const reason=String(event.payload?.reason||'UNKNOWN');reasonCounts[reason]=(reasonCounts[reason]||0)+1;}
  const provenance=eligible.map(canonicalRef);
  const canonicalInputRefs=provenance.map(row=>row.id);
  const denominator=eligible.length;
  const numerator=eligible.filter(event=>event.payload?.successful===true).length;
  const surfaceTotals={Core:0,IELTS:0,V10:0,Unknown:0};
  for(const event of eligible)surfaceTotals[surfaceForTarget(event.payload?.target)]+=1;
  const conflicts=conflictSummary(eligible);

  const retrieval=denominator?Object.freeze({status:'MEASURED',numerator,denominator,sampleSize:denominator,value:numerator/denominator,timeframe,provenance}):unavailableMetric('NO_ELIGIBLE_RETRIEVAL_EVIDENCE',0,provenance,timeframe);
  const activeDays=denominator?Object.freeze({status:'MEASURED',value:new Set(eligible.map(event=>localDayKey(event.createdAt,zone))).size,denominator,sampleSize:denominator,timeframe,timeZone:zone,provenance}):unavailableMetric('NO_ELIGIBLE_ACTIVITY_EVIDENCE',0,provenance,timeframe);
  const metrics={retrieval,delayedSuccess:unavailableMetric('DELAY_THRESHOLD_NOT_CANONICALLY_BOUND',denominator,provenance,timeframe),coverage:unavailableMetric('CONTENT_INVENTORY_DENOMINATOR_UNAVAILABLE',denominator,provenance,timeframe),stability:unavailableMetric('STABILITY_INPUTS_UNAVAILABLE',denominator,provenance,timeframe),recurrence:unavailableMetric('RECURRENCE_POLICY_NOT_CANONICALLY_BOUND',denominator,provenance,timeframe),contentCompletion:unavailableMetric('CONTENT_INVENTORY_DENOMINATOR_UNAVAILABLE',denominator,provenance,timeframe),activeDays};
  const digestInput=canonical.map(event=>({id:eventIdentity(event),eventDigest:event.eventDigest||null,createdAt:Number(event.createdAt||0),payloadDigest:event.payloadDigest||learningContractDigest(event.payload)}));
  const base={schemaVersion:P7_METRICS_SCHEMA_VERSION,projectorVersion:P7_METRICS_PROJECTOR_VERSION,status:denominator?'MEASURED':'INSUFFICIENT_DATA',reason:denominator?null:'NO_ELIGIBLE_CANONICAL_EVIDENCE',numerator,denominator,sampleSize:denominator,timeframe,timeZone:zone,eligibility:'canonical-evidence-decision',provenance,canonicalInputRefs,excluded:{count:excludedRows.length,reasonCounts},duplicatesDropped,surfaceTotals,conflicts,metrics};
  return Object.freeze({...base,inputDigest:learningContractDigest(digestInput)});
}
