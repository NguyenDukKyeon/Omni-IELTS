import { createActivitySpec,isCompleteLearningTarget,learningContractDigest,normalizeTimezone } from './learning-contracts.js';

export const TODAY_COMPOSER_VERSION=1;
export const TODAY_REASON_CODES=Object.freeze({
  due:'overdue-maintenance',
  repair:'error-repair',
  content:'available-content',
  newCard:'new-card-introduction'
});

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=240)=>String(value??'').trim().slice(0,max);

export function dateKeyInTimezone(now=Date.now(),timezone='UTC'){
  const normalized=normalizeTimezone(timezone);
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:normalized,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return`${values.year}-${values.month}-${values.day}`;
}

function candidateRows({dueReviews=[],repairs=[],content=[],newCards=[]}={}){
  return[
    ...dueReviews.map(row=>({...clone(row),bucket:0,reasonCode:TODAY_REASON_CODES.due})),
    ...repairs.map(row=>({...clone(row),bucket:1,reasonCode:TODAY_REASON_CODES.repair})),
    ...content.map(row=>({...clone(row),bucket:2,reasonCode:TODAY_REASON_CODES.content})),
    ...newCards.map(row=>({...clone(row),bucket:3,reasonCode:TODAY_REASON_CODES.newCard}))
  ];
}

function normalizeCandidate(row,index){
  const id=clean(row.id,180)||`today-candidate-${index+1}`;
  const target=clone(row.target||null);
  const parsedEstimatedSeconds=Number(row.estimatedSeconds||60);
  const estimatedSeconds=Number.isFinite(parsedEstimatedSeconds)
    ?Math.max(10,Math.min(900,parsedEstimatedSeconds))
    :60;
  return{
    id,
    type:clean(row.type,80)||'card-review',
    target,
    executor:clean(row.executor,120)||'core-card',
    estimatedSeconds,
    priority:Number(row.priority||0),
    dueAt:Number(row.dueAt||0)||null,
    bucket:Number(row.bucket),
    reasonCode:row.reasonCode,
    sourceId:clean(row.sourceId??target?.sourceId,240)||null,
    payload:clone(row.payload||{})
  };
}

export function composeTodayPlan({
  dueReviews=[],
  repairs=[],
  content=[],
  newCards=[],
  minutes=10,
  maxActivities=18,
  repairCap=3,
  timezone='UTC',
  now=Date.now()
}={}){
  const normalizedTimezone=normalizeTimezone(timezone);
  const date=dateKeyInTimezone(now,normalizedTimezone);
  const budgetSeconds=Math.max(60,Math.round(Number(minutes||10)*60));
  const excluded=[];
  const seen=new Set();
  let repairsUsed=0;
  const candidates=candidateRows({dueReviews,repairs,content,newCards})
    .map(normalizeCandidate)
    .filter(row=>{
      if(seen.has(row.id)){excluded.push({id:row.id,reason:'duplicate-id'});return false;}
      seen.add(row.id);
      if(!isCompleteLearningTarget(row.target)){excluded.push({id:row.id,reason:'missing-exact-target'});return false;}
      if(row.bucket===1&&repairsUsed>=Math.max(0,Number(repairCap||0))){excluded.push({id:row.id,reason:'repair-cap'});return false;}
      if(row.bucket===1)repairsUsed+=1;
      return true;
    })
    .sort((left,right)=>left.bucket-right.bucket||Number(left.dueAt||Infinity)-Number(right.dueAt||Infinity)||right.priority-left.priority||left.id.localeCompare(right.id));
  const seed=candidates.map(row=>({id:row.id,type:row.type,target:row.target,executor:row.executor,estimatedSeconds:row.estimatedSeconds,reasonCode:row.reasonCode}));
  const planId=`today-plan:${date}:${learningContractDigest({version:TODAY_COMPOSER_VERSION,date,timezone:normalizedTimezone,budgetSeconds,seed})}`;
  const selected=[];
  let used=0;
  for(const row of candidates){
    if(selected.length>=Math.max(1,Number(maxActivities||18)))break;
    if(used+row.estimatedSeconds>budgetSeconds&&selected.length>0){excluded.push({id:row.id,reason:'time-budget'});continue;}
    const activitySpec=createActivitySpec({
      id:row.id,
      type:row.type,
      target:row.target,
      planId,
      plannedAt:Number(now),
      timezone:normalizedTimezone,
      policyVersion:'phase1-evidence-v1',
      executor:row.executor,
      metadata:{reasonCode:row.reasonCode,estimatedSeconds:row.estimatedSeconds,sourceId:row.sourceId,payload:row.payload}
    });
    selected.push({...row,planId,planDate:date,plannedAt:Number(now),timezone:normalizedTimezone,activitySpec});
    used+=row.estimatedSeconds;
  }
  return Object.freeze({
    schemaVersion:TODAY_COMPOSER_VERSION,
    planId,
    planDate:date,
    timezone:normalizedTimezone,
    budgetSeconds,
    estimatedSeconds:used,
    activities:Object.freeze(selected.map(Object.freeze)),
    excluded:Object.freeze(excluded.map(Object.freeze)),
    inputDigest:learningContractDigest({seed,budgetSeconds,maxActivities,repairCap,date,timezone:normalizedTimezone})
  });
}
