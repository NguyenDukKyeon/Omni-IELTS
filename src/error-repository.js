import { learningContractDigest } from './learning-contracts.js';
import { normalizeKey,V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Records,transactV10 } from './v10-persistence.js';

export const ERROR_REPOSITORY_VERSION=1;

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=2000)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);

function errorTarget(input={}){
  const target=input.target||{};
  const proposedSkill=clean(target.skill??input.skill,80);
  const skill=['recognition','recall','listening','collocation','production'].includes(proposedSkill)?proposedSkill:'production';
  return{
    cardId:clean(target.cardId??input.cardId??input.linkedCardIds?.[0],180)||null,
    senseId:clean(target.senseId??input.senseId,180)||null,
    skill,
    sourceId:clean(target.sourceId??input.sourceId??input.sourceRef?.sourceId??input.sourceRef?.id??input.sourceRef?.type,240)||null,
    sourceRevision:clean(target.sourceRevision??input.sourceRevision,500)||`legacy-error:${learningContractDigest(input.sourceRef||{})}`
  };
}

export function normalizeErrorOccurrence(input={}){
  const target=errorTarget(input);
  const occurredAt=Number(input.occurredAt??input.lastSeenAt??input.createdAt??Date.now());
  const attemptId=clean(input.attemptId??input.evidenceAttempt?.attempt?.id,240)||null;
  const occurrenceSeed=clean(input.occurrenceId??input.id,240)||learningContractDigest({
    target,
    learnerResponse:clean(input.learnerResponse,5000),
    expectedResponse:clean(input.expectedResponse??input.correction,5000),
    occurredAt
  });
  const normalizedKey=clean(input.normalizedKey,500)||[
    target.cardId||'unbound',
    target.senseId||'no-sense',
    target.skill,
    target.sourceRevision,
    normalizeKey(input.category||input.errorType||'error'),
    normalizeKey(input.expectedResponse??input.correction)
  ].join('::');
  return{
    id:`error-occurrence:${occurrenceSeed}`,
    kind:'global-error-occurrence',
    schemaVersion:ERROR_REPOSITORY_VERSION,
    errorRecordId:`global-error:${learningContractDigest(normalizedKey)}`,
    normalizedKey,
    target,
    category:clean(input.category??input.errorType,120)||'unclassified',
    learnerResponse:clean(input.learnerResponse,5000)||null,
    expectedResponse:clean(input.expectedResponse??input.correction,5000)||null,
    expectedResponseSealed:true,
    explanation:clean(input.explanation,5000)||null,
    attemptId,
    receiptId:clean(input.receiptId??input.evidenceAttempt?.receipt?.id,240)||null,
    transcriptRevisionId:clean(input.transcriptRevisionId??target.sourceRevision,500)||null,
    assistance:clone(input.assistance??input.evidenceAttempt?.attempt?.assistance??null),
    weight:Math.max(1,Number(input.weight??input.occurrenceCount??1)),
    provenance:clone(input.provenance??input.sourceRef??{}),
    occurredAt
  };
}

function reduceErrorRecord(existing,occurrence){
  const firstSeenAt=Math.min(Number(existing?.firstSeenAt||occurrence.occurredAt),occurrence.occurredAt);
  const totalOccurrences=Number(existing?.totalOccurrences||0)+occurrence.weight;
  return{
    id:occurrence.errorRecordId,
    kind:'global-error-record',
    schemaVersion:ERROR_REPOSITORY_VERSION,
    normalizedKey:occurrence.normalizedKey,
    target:occurrence.target,
    category:occurrence.category,
    status:existing?.status==='resolved'?'monitoring':existing?.status||'active',
    totalOccurrences,
    correctionAttempts:Number(existing?.correctionAttempts||0),
    successfulCorrections:Number(existing?.successfulCorrections||0),
    firstSeenAt,
    lastSeenAt:Math.max(Number(existing?.lastSeenAt||0),occurrence.occurredAt),
    latestOccurrenceId:occurrence.id,
    legacyAliases:[...new Set([...(existing?.legacyAliases||[]),...(occurrence.provenance?.legacyId?[occurrence.provenance.legacyId]:[])])],
    updatedAt:Date.now()
  };
}

export async function recordErrorOccurrence(input){
  const occurrence=normalizeErrorOccurrence(input);
  let record;
  let inserted=false;
  await transactV10([V10_STORES.globalErrorRecords,V10_STORES.globalErrorOccurrences],async({stores,memory,requestResult})=>{
    const get=async(name,key)=>memory?clone(memory[name].get(key)):requestResult(stores[name].get(key));
    const put=(name,row)=>memory?memory[name].set(row.id,clone(row)):stores[name].put(clone(row));
    const existingOccurrence=await get(V10_STORES.globalErrorOccurrences,occurrence.id);
    const existingRecord=await get(V10_STORES.globalErrorRecords,occurrence.errorRecordId);
    if(existingOccurrence){
      if(learningContractDigest(existingOccurrence)!==learningContractDigest(occurrence))throw Object.assign(new Error('Error occurrence ID collision.'),{code:'ERROR_OCCURRENCE_COLLISION'});
      record=existingRecord;
      return;
    }
    record=reduceErrorRecord(existingRecord,occurrence);
    put(V10_STORES.globalErrorOccurrences,occurrence);
    put(V10_STORES.globalErrorRecords,record);
    inserted=true;
  },'global-error-recorded');
  return{inserted,record,occurrence};
}

export async function listErrorRecords({status=null,sourceType=null}={}){
  const rows=await listV10Records(V10_STORES.globalErrorRecords,{sortBy:'lastSeenAt'});
  return rows.filter(row=>(!status||row.status===status)&&(!sourceType||row.target?.sourceId===sourceType||row.category===sourceType));
}

export async function listErrorOccurrences(errorRecordId){
  return listV10Records(V10_STORES.globalErrorOccurrences,{index:'errorRecordId',query:errorRecordId,sortBy:'occurredAt',descending:false});
}

export async function recordCorrectionEvidence(errorRecordId,envelope){
  const record=await getV10Record(V10_STORES.globalErrorRecords,errorRecordId);
  if(!record)throw Object.assign(new Error('Không tìm thấy ErrorRecord.'),{code:'ERROR_RECORD_NOT_FOUND'});
  const decision=envelope?.decision||{};
  const targetBound=decision.target?.cardId===record.target?.cardId
    &&(decision.target?.senseId||null)===(record.target?.senseId||null)
    &&decision.target?.skill===record.target?.skill;
  const successful=targetBound&&decision.eligible===true&&decision.affectsSchedule===true&&decision.successful===true;
  const next={
    ...record,
    status:successful?'resolved':'monitoring',
    correctionAttempts:Number(record.correctionAttempts||0)+1,
    successfulCorrections:Number(record.successfulCorrections||0)+(successful?1:0),
    lastCorrectionAttemptId:clean(envelope?.attempt?.id,240)||null,
    lastResolvedAt:successful?Date.now():record.lastResolvedAt||null,
    updatedAt:Date.now()
  };
  await transactV10([V10_STORES.globalErrorRecords],async({stores,memory})=>{
    if(memory)memory[V10_STORES.globalErrorRecords].set(next.id,clone(next));
    else stores[V10_STORES.globalErrorRecords].put(clone(next));
  },'global-error-correction-recorded');
  if(envelope?.activitySpec&&envelope?.run&&envelope?.attempt&&envelope?.receipt&&envelope?.decision){
    const { persistLearningEnvelope }=await import('./persistence.js');
    await persistLearningEnvelope(envelope);
  }
  return{record:next,successful,affectsSchedule:targetBound&&decision.affectsSchedule===true,targetBound};
}

export async function composeRepairQueue({now=Date.now(),limit=20,perTargetCap=2}={}){
  const records=(await listErrorRecords()).filter(row=>['active','monitoring'].includes(row.status));
  const byTarget=new Map();
  const selected=[];
  for(const record of records.sort((left,right)=>Number(right.totalOccurrences)-Number(left.totalOccurrences)||Number(left.lastSeenAt)-Number(right.lastSeenAt)||left.id.localeCompare(right.id))){
    const targetKey=record.target?.cardId||record.target?.sourceRevision||record.id;
    const used=Number(byTarget.get(targetKey)||0);
    if(used>=perTargetCap||selected.length>=limit)continue;
    byTarget.set(targetKey,used+1);
    selected.push({
      id:`repair:${record.id}:${record.latestOccurrenceId}`,
      kind:'repair-queue-item',
      schemaVersion:ERROR_REPOSITORY_VERSION,
      errorRecordId:record.id,
      occurrenceId:record.latestOccurrenceId,
      target:clone(record.target),
      reasonCode:record.status==='monitoring'?'recurring-error':'unresolved-error',
      priority:Number(record.totalOccurrences||1),
      dueAt:Number(now),
      status:'queued',
      createdAt:Number(now),
      updatedAt:Number(now)
    });
  }
  await putV10Records(V10_STORES.repairQueue,selected,'global-repair-queue-composed');
  return selected;
}

export async function importLegacyErrorRecord(input){
  return recordErrorOccurrence({...input,occurrenceId:`legacy:${input.id||learningContractDigest(input)}`,weight:Math.max(1,Number(input.occurrenceCount||1)),provenance:{...(input.provenance||{}),legacyId:input.id||null,kind:'legacy-error-import'}});
}

export const __testing=Object.freeze({errorTarget,reduceErrorRecord});
