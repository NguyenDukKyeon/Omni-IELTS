import { learningContractDigest, normalizeTimezone } from './learning-contracts.js';

export const P7_METRICS_SCHEMA_VERSION='P7_METRICS_V1';
export const P7_METRICS_PROJECTOR_VERSION='p7-00-v1';

const SURFACES=Object.freeze(['Core','IELTS','V10','Unknown']);
const METRIC_DOMAINS=Object.freeze(['retrieval','delayedSuccess','coverage','stability','recurrence','contentCompletion']);
const codeUnitCompare=(left,right)=>String(left)<String(right)?-1:String(left)>String(right)?1:0;
const emptySurfaceTotals=()=>({Core:0,IELTS:0,V10:0,Unknown:0});

function isCanonicalDecision(event={}){
  return event?.kind==='canonical-learning-event'
    && Number(event.schemaVersion)===1
    && event.eventType==='evidence-decided'
    && event.payload
    && typeof event.payload==='object';
}

function eventIdentity(event={}){
  return String(event.id||event.eventDigest||learningContractDigest({
    receiptId:event.receiptId||null,
    activitySpecId:event.activitySpecId||null,
    runId:event.runId||null,
    attemptId:event.attemptId||null,
    payloadDigest:event.payloadDigest||learningContractDigest(event.payload||{})
  }));
}

function canonicalEventDigest(event={}){
  return String(event.eventDigest||learningContractDigest({
    id:eventIdentity(event),
    payloadDigest:event.payloadDigest||learningContractDigest(event.payload||{})
  }));
}

function dedupeCanonicalEvents(events=[]){
  const byId=new Map();
  let duplicatesDropped=0;
  for(const event of events){
    if(!isCanonicalDecision(event))continue;
    const id=eventIdentity(event);
    const digest=canonicalEventDigest(event);
    const existing=byId.get(id);
    if(existing){
      if(existing.digest!==digest){
        const error=new Error(`Canonical learning event ${id} has conflicting digests.`);
        error.code='CANONICAL_EVENT_ID_COLLISION';
        error.eventId=id;
        error.digests=[existing.digest,digest].sort(codeUnitCompare);
        throw error;
      }
      duplicatesDropped+=1;
      continue;
    }
    byId.set(id,{event,digest});
  }
  const canonical=[...byId.values()].map(row=>row.event).sort((left,right)=>
    Number(left.createdAt||0)-Number(right.createdAt||0)
    ||codeUnitCompare(eventIdentity(left),eventIdentity(right))
    ||codeUnitCompare(canonicalEventDigest(left),canonicalEventDigest(right))
  );
  return{canonical,duplicatesDropped};
}

function surfaceForTarget(target={}){
  const targetType=String(target?.targetType||'').toLowerCase();
  const sourceId=String(target?.sourceId||'').toLowerCase();
  if(targetType==='ielts-objective-item'||sourceId.startsWith('ielts-source:')||sourceId.startsWith('ielts-'))return'IELTS';
  if(targetType==='productive-text-revision'||sourceId.startsWith('v10-source:')||sourceId.startsWith('v10-'))return'V10';
  if(targetType==='core-card'||sourceId.startsWith('core-card:')||target?.cardId)return'Core';
  return'Unknown';
}

function localDayKey(timestamp,timeZone){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Number(timestamp||0)));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return`${values.year}-${values.month}-${values.day}`;
}

function canonicalRef(event={},included=false){
  const target=event.payload?.target||{};
  return Object.freeze({
    id:eventIdentity(event),
    eventDigest:event.eventDigest||null,
    payloadDigest:event.payloadDigest||null,
    receiptId:event.receiptId||null,
    activitySpecId:event.activitySpecId||null,
    runId:event.runId||null,
    attemptId:event.attemptId||null,
    createdAt:Number(event.createdAt||0),
    surface:surfaceForTarget(target),
    included,
    reason:event.payload?.reason||null,
    rating:event.payload?.rating||null,
    skill:event.payload?.skill||null,
    successful:event.payload?.successful===true,
    sourceId:target?.sourceId||null,
    sourceRevision:target?.sourceRevision||null,
    targetType:target?.targetType||null,
    targetId:target?.targetId||target?.cardId||null
  });
}

function unavailableMetric(reason,{denominator=0,sampleSize=0,timeframe='all_time',provenance=[]}={}){
  return Object.freeze({status:'INSUFFICIENT_DATA',reason,denominator,sampleSize,timeframe,provenance});
}

function conflictSummary(eligible=[]){
  const groups=new Map();
  for(const event of eligible){
    const target=event.payload?.target||{};
    const key=learningContractDigest({target,skill:event.payload?.skill||null});
    const row=groups.get(key)||{success:false,failure:false};
    if(event.payload?.successful===true)row.success=true;
    else row.failure=true;
    groups.set(key,row);
  }
  const targets=[...groups.entries()]
    .filter(([,row])=>row.success&&row.failure)
    .map(([key])=>key)
    .sort(codeUnitCompare);
  return Object.freeze({count:targets.length,targets});
}

function emptyProjection({timeZone='UTC',timeframe='all_time',duplicatesDropped=0}={}){
  const zone=normalizeTimezone(timeZone);
  const provenance=[];
  const metrics=Object.fromEntries(METRIC_DOMAINS.map(name=>[
    name,
    unavailableMetric(`NO_CANONICAL_${name.toUpperCase()}_EVIDENCE`,{timeframe,provenance})
  ]));
  metrics.activeDays=unavailableMetric('NO_CANONICAL_ACTIVITY_EVIDENCE',{timeframe,provenance});
  const surfaceTotals=emptySurfaceTotals();
  const base={
    schemaVersion:P7_METRICS_SCHEMA_VERSION,
    projectorVersion:P7_METRICS_PROJECTOR_VERSION,
    status:'INSUFFICIENT_DATA',
    reason:'NO_ELIGIBLE_CANONICAL_EVIDENCE',
    numerator:0,
    denominator:0,
    sampleSize:0,
    totalCanonicalDecisions:0,
    timeframe,
    timeZone:zone,
    eligibility:'canonical-evidence-decision.eligible',
    provenance,
    canonicalInputRefs:[],
    excluded:{count:0,byReason:{}},
    duplicatesDropped,
    surfaceTotals,
    eligibleSurfaceTotals:emptySurfaceTotals(),
    excludedSurfaceTotals:emptySurfaceTotals(),
    reconciliation:{percent:100,result:'RECONCILED'},
    conflicts:{count:0,targets:[]},
    metrics
  };
  return Object.freeze({...base,inputDigest:learningContractDigest([])});
}

export function reduceCanonicalLearningMetrics(events=[],{timeZone='UTC',timeframe='all_time'}={}){
  const zone=normalizeTimezone(timeZone);
  const {canonical,duplicatesDropped}=dedupeCanonicalEvents(events);
  if(!canonical.length)return emptyProjection({timeZone:zone,timeframe,duplicatesDropped});

  const included=canonical.filter(event=>event.payload?.eligible===true);
  const excludedRows=canonical.filter(event=>event.payload?.eligible!==true);
  const denominator=included.length;
  const numerator=included.filter(event=>event.payload?.successful===true).length;

  const surfaceTotals=emptySurfaceTotals();
  const eligibleSurfaceTotals=emptySurfaceTotals();
  const excludedSurfaceTotals=emptySurfaceTotals();
  for(const event of canonical)surfaceTotals[surfaceForTarget(event.payload?.target)]+=1;
  for(const event of included)eligibleSurfaceTotals[surfaceForTarget(event.payload?.target)]+=1;
  for(const event of excludedRows)excludedSurfaceTotals[surfaceForTarget(event.payload?.target)]+=1;

  const byReason={};
  for(const event of excludedRows){
    const reason=String(event.payload?.reason||'UNKNOWN');
    byReason[reason]=(byReason[reason]||0)+1;
  }

  const includedIds=new Set(included.map(eventIdentity));
  const provenance=canonical.map(event=>canonicalRef(event,includedIds.has(eventIdentity(event))));
  const includedProvenance=provenance.filter(row=>row.included);
  const canonicalInputRefs=provenance.map(row=>Object.freeze({id:row.id,eventDigest:row.eventDigest}));
  const conflicts=conflictSummary(included);

  const retrieval=denominator
    ?Object.freeze({
      status:'MEASURED',
      numerator,
      denominator,
      sampleSize:denominator,
      value:numerator/denominator,
      timeframe,
      provenance:includedProvenance
    })
    :unavailableMetric('NO_ELIGIBLE_RETRIEVAL_EVIDENCE',{timeframe,provenance:includedProvenance});

  const activeDays=denominator
    ?Object.freeze({
      status:'MEASURED',
      value:new Set(included.map(event=>localDayKey(event.createdAt,zone))).size,
      denominator,
      sampleSize:denominator,
      timeframe,
      timeZone:zone,
      provenance:includedProvenance
    })
    :unavailableMetric('NO_ELIGIBLE_ACTIVITY_EVIDENCE',{timeframe,provenance:includedProvenance});

  const unavailableOptions={denominator,sampleSize:denominator,timeframe,provenance:includedProvenance};
  const metrics={
    retrieval,
    delayedSuccess:unavailableMetric('DELAY_THRESHOLD_NOT_CANONICALLY_BOUND',unavailableOptions),
    coverage:unavailableMetric('CONTENT_INVENTORY_DENOMINATOR_UNAVAILABLE',unavailableOptions),
    stability:unavailableMetric('STABILITY_INPUTS_UNAVAILABLE',unavailableOptions),
    recurrence:unavailableMetric('RECURRENCE_POLICY_NOT_CANONICALLY_BOUND',unavailableOptions),
    contentCompletion:unavailableMetric('CONTENT_INVENTORY_DENOMINATOR_UNAVAILABLE',unavailableOptions),
    activeDays
  };

  const totalCanonicalDecisions=canonical.length;
  const reconciled=denominator+excludedRows.length;
  const reconciliation={
    percent:totalCanonicalDecisions?Math.round(reconciled/totalCanonicalDecisions*100):100,
    result:reconciled===totalCanonicalDecisions?'RECONCILED':'MISMATCH'
  };
  const digestInput=canonical.map(event=>({
    id:eventIdentity(event),
    eventDigest:canonicalEventDigest(event),
    createdAt:Number(event.createdAt||0),
    payloadDigest:event.payloadDigest||learningContractDigest(event.payload||{})
  }));
  const base={
    schemaVersion:P7_METRICS_SCHEMA_VERSION,
    projectorVersion:P7_METRICS_PROJECTOR_VERSION,
    status:denominator?'MEASURED':'INSUFFICIENT_DATA',
    reason:denominator?null:'NO_ELIGIBLE_CANONICAL_EVIDENCE',
    numerator,
    denominator,
    sampleSize:denominator,
    totalCanonicalDecisions,
    timeframe,
    timeZone:zone,
    eligibility:'canonical-evidence-decision.eligible',
    provenance,
    canonicalInputRefs,
    excluded:{count:excludedRows.length,byReason},
    duplicatesDropped,
    surfaceTotals,
    eligibleSurfaceTotals,
    excludedSurfaceTotals,
    reconciliation,
    conflicts,
    metrics
  };
  return Object.freeze({...base,inputDigest:learningContractDigest(digestInput)});
}
