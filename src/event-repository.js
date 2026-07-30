import { learningContractDigest,validateLearningEnvelope } from './learning-contracts.js';

export const LEARNING_EVENT_SCHEMA_VERSION=1;
export const LEARNING_PROJECTION_VERSION=1;
export const LEARNING_EVENT_TYPES=Object.freeze(['run-recorded','attempt-recorded','receipt-recorded','evidence-decided']);

const EVENT_TYPE_SET=new Set(LEARNING_EVENT_TYPES);
const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=240)=>String(value??'').trim().slice(0,max);
const requestResult=request=>new Promise((resolve,reject)=>{
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
});

function typedError(code,message,detail={}){
  return Object.assign(new Error(message),{code,durable:false,...detail});
}

function decisionPayload(decision={}){
  return Object.freeze({
    policyVersion:clean(decision.policyVersion,120)||null,
    decisionId:clean(decision.decisionId,240)||null,
    receiptBinding:clean(decision.receiptBinding,240)||null,
    receiptId:clean(decision.receiptId,180)||null,
    attemptId:clean(decision.attemptId,180)||null,
    activityId:clean(decision.activityId,180)||null,
    eligible:decision.eligible===true,
    affectsSchedule:decision.affectsSchedule===true,
    successful:decision.successful===true,
    reason:clean(decision.reason,180)||null,
    rating:clean(decision.rating,40)||null,
    skill:clean(decision.skill,80)||null,
    target:decision.target?clone(decision.target):null
  });
}

function learningEvent({id,eventType,receiptId,activitySpecId,runId,attemptId,payload,createdAt}){
  const record={
    id,
    kind:'canonical-learning-event',
    schemaVersion:LEARNING_EVENT_SCHEMA_VERSION,
    eventType,
    receiptId,
    activitySpecId,
    runId,
    attemptId,
    payload:clone(payload),
    createdAt:Number(createdAt||Date.now())
  };
  record.payloadDigest=learningContractDigest(record.payload);
  record.eventDigest=learningContractDigest({
    schemaVersion:record.schemaVersion,
    eventType:record.eventType,
    receiptId:record.receiptId,
    activitySpecId:record.activitySpecId,
    runId:record.runId,
    attemptId:record.attemptId,
    payloadDigest:record.payloadDigest
  });
  return Object.freeze(record);
}

export function buildLearningEventRecords(input={}){
  const validation=validateLearningEnvelope(input);
  if(!validation.valid)throw typedError('LEARNING_ENVELOPE_INVALID',validation.errors.join(' '),{errors:validation.errors});
  const {activitySpec,run,attempt,receipt}=validation.value;
  const decision=decisionPayload(input.decision);
  if(!decision.decisionId||!decision.receiptId||decision.receiptId!==receipt.id||decision.attemptId!==attempt.id||decision.activityId!==activitySpec.id){
    throw typedError('LEARNING_DECISION_BINDING_INVALID','EvidenceDecision không bind đúng canonical receipt/attempt/activity.',{
      receiptId:receipt.id,
      attemptId:attempt.id,
      activitySpecId:activitySpec.id
    });
  }
  const common={
    receiptId:receipt.id,
    activitySpecId:activitySpec.id,
    runId:run.id,
    attemptId:attempt.id,
    createdAt:receipt.issuedAt||attempt.occurredAt||Date.now()
  };
  return Object.freeze([
    learningEvent({...common,id:`learning:run:${run.id}`,eventType:'run-recorded',payload:run}),
    learningEvent({...common,id:`learning:attempt:${attempt.id}`,eventType:'attempt-recorded',payload:attempt}),
    learningEvent({...common,id:`learning:receipt:${receipt.id}`,eventType:'receipt-recorded',payload:receipt}),
    learningEvent({...common,id:`learning:decision:${decision.decisionId}`,eventType:'evidence-decided',payload:decision})
  ]);
}

export function validateLearningEventRecord(input={}){
  const errors=[];
  if(input.kind!=='canonical-learning-event')errors.push('kind không phải canonical-learning-event.');
  if(Number(input.schemaVersion)!==LEARNING_EVENT_SCHEMA_VERSION)errors.push('event schemaVersion không được hỗ trợ.');
  if(!input.id||!EVENT_TYPE_SET.has(input.eventType))errors.push('event thiếu id/type hợp lệ.');
  for(const key of ['receiptId','activitySpecId','runId','attemptId'])if(!input[key])errors.push(`event thiếu ${key}.`);
  if(!input.payload||typeof input.payload!=='object')errors.push('event thiếu payload.');
  const payloadDigest=input.payload&&typeof input.payload==='object'?learningContractDigest(input.payload):null;
  if(payloadDigest!==input.payloadDigest)errors.push('event payloadDigest mismatch.');
  const eventDigest=learningContractDigest({
    schemaVersion:Number(input.schemaVersion),
    eventType:input.eventType,
    receiptId:input.receiptId,
    activitySpecId:input.activitySpecId,
    runId:input.runId,
    attemptId:input.attemptId,
    payloadDigest:input.payloadDigest
  });
  if(eventDigest!==input.eventDigest)errors.push('event digest mismatch.');
  return{valid:errors.length===0,errors,value:errors.length?null:clone(input)};
}

export function projectionBindingDigest(records=[]){
  return learningContractDigest(
    [...records]
      .sort((left,right)=>String(left.eventType).localeCompare(String(right.eventType)))
      .map(record=>({id:record.id,eventType:record.eventType,eventDigest:record.eventDigest}))
  );
}

function projectionRecord(records,{reviewEventId=null,projectedAt=Date.now()}={}){
  const first=records[0];
  return Object.freeze({
    id:`learning:projection:${first.receiptId}`,
    kind:'canonical-learning-projection',
    schemaVersion:LEARNING_PROJECTION_VERSION,
    receiptId:first.receiptId,
    activitySpecId:first.activitySpecId,
    runId:first.runId,
    attemptId:first.attemptId,
    eventIds:records.map(record=>record.id).sort(),
    bindingDigest:projectionBindingDigest(records),
    status:reviewEventId?'review-projected':'recorded',
    reviewEventId:reviewEventId||null,
    projectedAt:Number(projectedAt)
  });
}

export async function stageLearningEnvelope({
  transaction,
  eventStore,
  projectionStore,
  envelope,
  reviewEventId=null,
  hooks={}
}={}){
  if(!transaction||!eventStore||!projectionStore)throw new TypeError('stageLearningEnvelope cần transaction và stores.');
  const records=buildLearningEventRecords(envelope);
  let insertedEvents=0;
  for(const record of records){
    const existing=await requestResult(eventStore.get(record.id));
    if(existing){
      if(existing.eventDigest!==record.eventDigest)throw typedError('LEARNING_EVENT_COLLISION',`Learning event ${record.id} đã tồn tại với binding khác.`,{
        eventId:record.id,
        receiptId:record.receiptId,
        expectedDigest:record.eventDigest,
        actualDigest:existing.eventDigest||null
      });
      continue;
    }
    eventStore.add(clone(record));
    insertedEvents+=1;
  }
  await hooks.afterEvents?.(records);
  const next=projectionRecord(records,{reviewEventId});
  const existingProjection=await requestResult(projectionStore.get(next.id));
  if(existingProjection){
    if(existingProjection.bindingDigest!==next.bindingDigest)throw typedError('LEARNING_PROJECTION_COLLISION',`Projection ${next.id} bind vào event khác.`,{
      projectionId:next.id,
      receiptId:next.receiptId
    });
    if(existingProjection.reviewEventId&&reviewEventId&&existingProjection.reviewEventId!==reviewEventId)throw typedError('LEARNING_REVIEW_MUTATION_COLLISION',`Receipt ${next.receiptId} đã project sang review khác.`,{
      receiptId:next.receiptId,
      existingReviewEventId:existingProjection.reviewEventId,
      reviewEventId
    });
    if(reviewEventId&&!existingProjection.reviewEventId)projectionStore.put({...existingProjection,status:'review-projected',reviewEventId,projectedAt:next.projectedAt});
    return{inserted:insertedEvents>0,insertedEvents,projection:clone(existingProjection),records};
  }
  projectionStore.add(clone(next));
  return{inserted:true,insertedEvents,projection:clone(next),records};
}

export function deadLetterRecord(input,error,{createdAt=Date.now()}={}){
  const payload=input&&typeof input==='object'?clone(input):{raw:String(input)};
  const digest=learningContractDigest(payload);
  return Object.freeze({
    id:`learning:dead-letter:${digest}`,
    kind:'canonical-learning-dead-letter',
    schemaVersion:1,
    payloadDigest:digest,
    receiptId:clean(input?.receipt?.id??input?.attempt?.receiptId,180)||null,
    errorCode:clean(error?.code,120)||'LEARNING_EVENT_INVALID',
    errorMessage:clean(error?.message??error,1000),
    payload,
    status:'quarantined',
    createdAt:Number(createdAt)
  });
}

export function groupLearningEvents(records=[]){
  const groups=new Map();
  for(const record of records){
    const receiptId=clean(record?.receiptId,180)||'unbound';
    if(!groups.has(receiptId))groups.set(receiptId,[]);
    groups.get(receiptId).push(record);
  }
  return groups;
}

export function rebuildProjectionRows(records=[],existingProjections=[]){
  const projections=[];
  const deadLetters=[];
  const existingByReceipt=new Map(existingProjections.map(row=>[row.receiptId,row]));
  for(const[receiptId,group]of groupLearningEvents(records)){
    const errors=[];
    const types=new Set();
    for(const row of group){
      const validation=validateLearningEventRecord(row);
      if(!validation.valid)errors.push(...validation.errors.map(error=>`${row?.id||'unknown'}: ${error}`));
      types.add(row?.eventType);
    }
    for(const type of LEARNING_EVENT_TYPES)if(!types.has(type))errors.push(`${receiptId}: thiếu ${type}.`);
    if(group.some(row=>row.receiptId!==receiptId))errors.push(`${receiptId}: receipt binding mismatch.`);
    if(new Set(group.map(row=>row.activitySpecId)).size!==1||new Set(group.map(row=>row.runId)).size!==1||new Set(group.map(row=>row.attemptId)).size!==1)errors.push(`${receiptId}: cross-event binding mismatch.`);
    if(errors.length){
      deadLetters.push(deadLetterRecord({receipt:{id:receiptId},events:group},typedError('LEARNING_REPLAY_POISON_EVENT',errors.join(' '))));
      continue;
    }
    const existing=existingByReceipt.get(receiptId);
    const bindingDigest=projectionBindingDigest(group);
    projections.push(projectionRecord(group,{
      reviewEventId:existing?.bindingDigest===bindingDigest?existing.reviewEventId:null,
      projectedAt:existing?.bindingDigest===bindingDigest?existing.projectedAt:Date.now()
    }));
  }
  return{projections,deadLetters};
}

export const __testing=Object.freeze({decisionPayload,learningEvent,projectionRecord,requestResult});
