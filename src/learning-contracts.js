export const LEARNING_CONTRACT_VERSION=1;
export const LEARNING_CONTRACT_KIND=Object.freeze({
  activitySpec:'ActivitySpec',
  run:'Run',
  attempt:'Attempt',
  receipt:'Receipt',
  assistanceTrace:'AssistanceTrace'
});

export const RUN_STATUSES=Object.freeze(['planned','active','completed','cancelled','failed']);
export const RECEIPT_STATUSES=Object.freeze(['completed','failed','skipped','cancelled','abstained']);
export const LEARNING_SKILLS=Object.freeze(['recognition','recall','listening','collocation','production']);

const RUN_STATUS_SET=new Set(RUN_STATUSES);
const RECEIPT_STATUS_SET=new Set(RECEIPT_STATUSES);
const SKILL_SET=new Set(LEARNING_SKILLS);
const clean=(value,max=240)=>String(value??'').trim().slice(0,max);
const nullable=(value,max=240)=>clean(value,max)||null;
const finiteTime=value=>Number.isFinite(Number(value))&&Number(value)>=0?Number(value):0;
const codeUnitCompare=(left,right)=>left<right?-1:left>right?1:0;

function clone(value){
  return value==null?value:structuredClone(value);
}

function deepFreeze(value,seen=new Set()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}

function canonicalValue(value){
  if(Array.isArray(value))return value.map(canonicalValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort(codeUnitCompare).map(key=>[key,canonicalValue(value[key])]));
  return value;
}

export function learningContractDigest(value){
  const text=JSON.stringify(canonicalValue(value));
  const bytes=new TextEncoder().encode(text);
  let hash=14695981039346656037n;
  for(const byte of bytes){
    hash^=BigInt(byte);
    hash=BigInt.asUintN(64,hash*1099511628211n);
  }
  return`fnv1a64:${bytes.length}:${hash.toString(16).padStart(16,'0')}`;
}

export function normalizeTimezone(value='UTC'){
  const timezone=clean(value,120)||'UTC';
  try{
    new Intl.DateTimeFormat('en-US',{timeZone:timezone}).format(0);
    return timezone;
  }catch{
    return'UTC';
  }
}

export function normalizeLearningTarget(input=null){
  if(!input||typeof input!=='object')return null;
  return deepFreeze({
    cardId:nullable(input.cardId,180),
    senseId:nullable(input.senseId,180),
    skill:SKILL_SET.has(input.skill)?input.skill:null,
    sourceId:nullable(input.sourceId,240),
    sourceRevision:nullable(input.sourceRevision,240)
  });
}

export function isCompleteLearningTarget(input){
  const target=normalizeLearningTarget(input);
  return Boolean(target?.cardId&&target.skill&&target.sourceId&&target.sourceRevision);
}

function normalizedMetadata(input){
  return input&&typeof input==='object'&&!Array.isArray(input)?clone(input):{};
}

export function createActivitySpec(input={}){
  const id=nullable(input.id,180);
  const type=clean(input.type,80)||'unknown';
  const target=normalizeLearningTarget(input.target);
  const plannedAt=finiteTime(input.plannedAt);
  const idempotencyKey=clean(input.idempotencyKey,240)||`activity:${id||'unbound'}`;
  return deepFreeze({
    kind:LEARNING_CONTRACT_KIND.activitySpec,
    schemaVersion:Number(input.schemaVersion||LEARNING_CONTRACT_VERSION),
    id,
    type,
    target,
    planId:nullable(input.planId,180),
    plannedAt,
    timezone:normalizeTimezone(input.timezone),
    policyVersion:nullable(input.policyVersion,120),
    executor:nullable(input.executor,120),
    idempotencyKey,
    metadata:normalizedMetadata(input.metadata)
  });
}

export function createRun(input={}){
  const activitySpec=input.activitySpec?createActivitySpec(input.activitySpec):null;
  const id=nullable(input.id,180);
  const activitySpecId=nullable(input.activitySpecId,180)||activitySpec?.id||null;
  const activitySpecDigest=nullable(input.activitySpecDigest,240)||(activitySpec?learningContractDigest(activitySpec):null);
  const startedAt=finiteTime(input.startedAt);
  const status=RUN_STATUS_SET.has(input.status)?input.status:'planned';
  return deepFreeze({
    kind:LEARNING_CONTRACT_KIND.run,
    schemaVersion:Number(input.schemaVersion||LEARNING_CONTRACT_VERSION),
    id,
    activitySpecId,
    activitySpecDigest,
    activitySpec,
    status,
    startedAt,
    completedAt:finiteTime(input.completedAt)||null,
    timezone:normalizeTimezone(input.timezone||activitySpec?.timezone),
    idempotencyKey:clean(input.idempotencyKey,240)||`run:${id||'unbound'}`,
    resumedFromRunId:nullable(input.resumedFromRunId,180),
    metadata:normalizedMetadata(input.metadata)
  });
}

function normalizeAssistanceEvents(events=[]){
  return (Array.isArray(events)?events:[]).map((event,index)=>deepFreeze({
    sequence:Number.isInteger(Number(event?.sequence))&&Number(event.sequence)>0?Number(event.sequence):index+1,
    type:clean(event?.type,80),
    at:finiteTime(event?.at),
    metadata:normalizedMetadata(event?.metadata)
  })).filter(event=>event.type).slice(0,200);
}

export function createAssistanceTrace(input={}){
  return deepFreeze({
    kind:LEARNING_CONTRACT_KIND.assistanceTrace,
    schemaVersion:Number(input.schemaVersion||LEARNING_CONTRACT_VERSION),
    id:nullable(input.id,180),
    collector:nullable(input.collector,80),
    complete:input.complete===true,
    revealed:input.revealed===true,
    hintUsed:input.hintUsed===true,
    transcriptViewed:input.transcriptViewed===true,
    correctionExposed:input.correctionExposed===true,
    retryAfterExposure:input.retryAfterExposure===true,
    coaching:input.coaching===true,
    answerExposed:input.answerExposed===true,
    events:normalizeAssistanceEvents(input.events)
  });
}

export function appendAssistanceEvent(trace,event){
  const current=createAssistanceTrace(trace);
  if(current.complete)throw Object.assign(new Error('AssistanceTrace đã complete; không được sửa lịch sử assistance.'),{code:'ASSISTANCE_TRACE_ALREADY_COMPLETE'});
  const nextSequence=current.events.length+1;
  const candidate=normalizeAssistanceEvents([{...event,sequence:event?.sequence??nextSequence}])[0];
  if(!candidate)throw new TypeError('Assistance event thiếu type.');
  if(candidate.sequence!==nextSequence)throw Object.assign(new Error('Assistance event phải append theo sequence liên tục.'),{code:'ASSISTANCE_TRACE_SEQUENCE_MISMATCH'});
  const previous=current.events.at(-1);
  if(previous&&candidate.at&&previous.at&&candidate.at<previous.at)throw Object.assign(new Error('Assistance event không được lùi thời gian.'),{code:'ASSISTANCE_TRACE_TIME_REGRESSION'});
  return createAssistanceTrace({...current,events:[...current.events,candidate]});
}

export function completeAssistanceTrace(trace){
  const current=createAssistanceTrace(trace);
  return current.complete?current:createAssistanceTrace({...current,complete:true});
}

export function createAttempt(input={}){
  const activitySpec=input.activitySpec?createActivitySpec(input.activitySpec):null;
  const run=input.run?createRun(input.run):null;
  const id=nullable(input.id,180);
  const activitySpecId=nullable(input.activitySpecId??input.activityId,180)||activitySpec?.id||run?.activitySpecId||null;
  const target=normalizeLearningTarget(input.target??activitySpec?.target);
  const assistance=createAssistanceTrace(input.assistance);
  const receiptId=nullable(input.receiptId,180);
  return deepFreeze({
    kind:LEARNING_CONTRACT_KIND.attempt,
    schemaVersion:Number(input.schemaVersion||LEARNING_CONTRACT_VERSION),
    id,
    runId:nullable(input.runId,180)||run?.id||null,
    activitySpecId,
    activityId:activitySpecId,
    activityType:clean(input.activityType??activitySpec?.type,80)||'unknown',
    receiptId,
    result:clean(input.result,40),
    target,
    assistance,
    learnerOutput:clean(input.learnerOutput,10_000),
    errorType:nullable(input.errorType,80),
    sequence:Math.max(1,Number(input.sequence||1)),
    occurredAt:finiteTime(input.occurredAt),
    timezone:normalizeTimezone(input.timezone||run?.timezone||activitySpec?.timezone),
    idempotencyKey:clean(input.idempotencyKey,240)||`attempt:${id||receiptId||'unbound'}`,
    metadata:normalizedMetadata(input.metadata)
  });
}

export function createReceipt(input={}){
  const activitySpec=input.activitySpec?createActivitySpec(input.activitySpec):null;
  const run=input.run?createRun(input.run):null;
  const attempt=input.attempt?createAttempt(input.attempt):null;
  const id=nullable(input.id??attempt?.receiptId,180);
  const target=normalizeLearningTarget(input.target??attempt?.target??activitySpec?.target);
  return deepFreeze({
    kind:LEARNING_CONTRACT_KIND.receipt,
    schemaVersion:Number(input.schemaVersion||LEARNING_CONTRACT_VERSION),
    id,
    runId:nullable(input.runId,180)||run?.id||attempt?.runId||null,
    attemptId:nullable(input.attemptId,180)||attempt?.id||null,
    activitySpecId:nullable(input.activitySpecId,180)||activitySpec?.id||attempt?.activitySpecId||run?.activitySpecId||null,
    activitySpecDigest:nullable(input.activitySpecDigest,240)||(activitySpec?learningContractDigest(activitySpec):run?.activitySpecDigest||null),
    attemptDigest:nullable(input.attemptDigest,240)||(attempt?learningContractDigest(attempt):null),
    target,
    status:RECEIPT_STATUS_SET.has(input.status)?input.status:'failed',
    result:clean(input.result??attempt?.result,40),
    issuedAt:finiteTime(input.issuedAt),
    timezone:normalizeTimezone(input.timezone||attempt?.timezone||run?.timezone||activitySpec?.timezone),
    idempotencyKey:clean(input.idempotencyKey,240)||`receipt:${id||'unbound'}`,
    metadata:normalizedMetadata(input.metadata)
  });
}

function sameTarget(left,right){
  return JSON.stringify(normalizeLearningTarget(left))===JSON.stringify(normalizeLearningTarget(right));
}

function baseValidation(value,kind){
  const errors=[];
  if(value?.kind!==kind)errors.push(`kind phải là ${kind}.`);
  if(Number(value?.schemaVersion)!==LEARNING_CONTRACT_VERSION)errors.push(`schemaVersion ${value?.schemaVersion??'missing'} không được hỗ trợ.`);
  if(!value?.id)errors.push(`${kind} thiếu id.`);
  if(!value?.idempotencyKey)errors.push(`${kind} thiếu idempotencyKey.`);
  return errors;
}

export function validateActivitySpec(input,{allowIncompleteTarget=false}={}){
  const value=createActivitySpec(input);
  const errors=baseValidation(value,LEARNING_CONTRACT_KIND.activitySpec);
  if(!value.type||value.type==='unknown')errors.push('ActivitySpec thiếu type đã biết.');
  if(!allowIncompleteTarget&&!isCompleteLearningTarget(value.target))errors.push('ActivitySpec thiếu exact target card/skill/source revision.');
  if(value.plannedAt<0)errors.push('ActivitySpec plannedAt không hợp lệ.');
  return{valid:errors.length===0,errors,value};
}

export function validateRun(input){
  const value=createRun(input);
  const errors=baseValidation(value,LEARNING_CONTRACT_KIND.run);
  if(!value.activitySpecId||!value.activitySpecDigest)errors.push('Run thiếu ActivitySpec binding.');
  if(value.completedAt&&value.completedAt<value.startedAt)errors.push('Run completedAt trước startedAt.');
  if(value.activitySpec&&learningContractDigest(value.activitySpec)!==value.activitySpecDigest)errors.push('Run ActivitySpec digest mismatch.');
  return{valid:errors.length===0,errors,value};
}

export function validateAttempt(input,{allowIncompleteTarget=false}={}){
  const value=createAttempt(input);
  const errors=baseValidation(value,LEARNING_CONTRACT_KIND.attempt);
  if(!value.runId)errors.push('Attempt thiếu runId.');
  if(!value.activitySpecId||!value.activityType||value.activityType==='unknown')errors.push('Attempt thiếu ActivitySpec binding.');
  if(!value.receiptId)errors.push('Attempt thiếu receiptId.');
  if(!value.result)errors.push('Attempt thiếu result.');
  if(!allowIncompleteTarget&&!isCompleteLearningTarget(value.target))errors.push('Attempt thiếu exact target.');
  if(!value.assistance.id||!value.assistance.collector||!value.assistance.complete)errors.push('Attempt thiếu AssistanceTrace hoàn chỉnh.');
  for(let index=0;index<value.assistance.events.length;index+=1){
    if(value.assistance.events[index].sequence!==index+1)errors.push('AssistanceTrace sequence không liên tục.');
    if(index>0&&value.assistance.events[index].at&&value.assistance.events[index-1].at&&value.assistance.events[index].at<value.assistance.events[index-1].at)errors.push('AssistanceTrace event time bị lùi.');
  }
  return{valid:errors.length===0,errors,value};
}

export function validateReceipt(input,{allowIncompleteTarget=false}={}){
  const value=createReceipt(input);
  const errors=baseValidation(value,LEARNING_CONTRACT_KIND.receipt);
  if(!value.runId||!value.attemptId||!value.activitySpecId)errors.push('Receipt thiếu run/attempt/activity binding.');
  if(!value.activitySpecDigest||!value.attemptDigest)errors.push('Receipt thiếu immutable digest binding.');
  if(!allowIncompleteTarget&&!isCompleteLearningTarget(value.target))errors.push('Receipt thiếu exact target.');
  return{valid:errors.length===0,errors,value};
}

export function validateLearningEnvelope(input,{allowIncompleteTarget=false}={}){
  const activitySpec=createActivitySpec(input.activitySpec);
  const run=createRun({...input.run,activitySpec});
  const attempt=createAttempt({...input.attempt,activitySpec,run});
  const receipt=createReceipt({...input.receipt,activitySpec,run,attempt});
  const errors=[
    ...validateActivitySpec(activitySpec,{allowIncompleteTarget}).errors,
    ...validateRun(run).errors,
    ...validateAttempt(attempt,{allowIncompleteTarget}).errors,
    ...validateReceipt(receipt,{allowIncompleteTarget}).errors
  ];
  if(run.activitySpecId!==activitySpec.id||attempt.activitySpecId!==activitySpec.id||receipt.activitySpecId!==activitySpec.id)errors.push('ActivitySpec ID thay đổi giữa plan, run, attempt hoặc receipt.');
  if(attempt.runId!==run.id||receipt.runId!==run.id)errors.push('Run ID thay đổi giữa attempt hoặc receipt.');
  if(receipt.attemptId!==attempt.id||receipt.id!==attempt.receiptId)errors.push('Receipt không bind đúng attempt/receiptId.');
  if(run.activitySpecDigest!==learningContractDigest(activitySpec)||receipt.activitySpecDigest!==learningContractDigest(activitySpec))errors.push('ActivitySpec digest thay đổi sau planning.');
  if(receipt.attemptDigest!==learningContractDigest(attempt))errors.push('Attempt digest không khớp receipt.');
  if(!sameTarget(activitySpec.target,attempt.target)||!sameTarget(activitySpec.target,receipt.target))errors.push('Exact target thay đổi từ plan đến receipt.');
  if(new Set([activitySpec.timezone,run.timezone,attempt.timezone,receipt.timezone]).size!==1)errors.push('Timezone không nhất quán trong learning envelope.');
  if(activitySpec.plannedAt&&run.startedAt&&run.startedAt<activitySpec.plannedAt)errors.push('Run bắt đầu trước plannedAt.');
  if(run.startedAt&&attempt.occurredAt&&attempt.occurredAt<run.startedAt)errors.push('Attempt xảy ra trước run.');
  if(attempt.occurredAt&&receipt.issuedAt&&receipt.issuedAt<attempt.occurredAt)errors.push('Receipt được phát trước attempt.');
  return{valid:errors.length===0,errors:[...new Set(errors)],value:deepFreeze({activitySpec,run,attempt,receipt})};
}

export function createLearningEnvelope(input={}){
  const result=validateLearningEnvelope(input,{allowIncompleteTarget:input.allowIncompleteTarget===true});
  if(!result.valid)throw Object.assign(new TypeError(result.errors.join(' ')),{code:'LEARNING_CONTRACT_INVALID',errors:result.errors});
  return result.value;
}

export function adaptLegacyLearningEnvelope({activitySpec={},attempt={},run={},receipt={}}={}){
  const plannedAt=finiteTime(activitySpec.plannedAt||attempt.occurredAt||Date.now());
  const canonicalActivity=createActivitySpec({...activitySpec,schemaVersion:LEARNING_CONTRACT_VERSION,plannedAt,timezone:activitySpec.timezone||'UTC',metadata:{...normalizedMetadata(activitySpec.metadata),legacyAdapter:true}});
  const canonicalRun=createRun({
    ...run,
    id:run.id||`run:${attempt.activityId||canonicalActivity.id||'legacy'}`,
    activitySpec:canonicalActivity,
    status:run.status||'completed',
    startedAt:run.startedAt||plannedAt,
    timezone:run.timezone||canonicalActivity.timezone,
    metadata:{...normalizedMetadata(run.metadata),legacyAdapter:true}
  });
  const canonicalAttempt=createAttempt({
    ...attempt,
    schemaVersion:LEARNING_CONTRACT_VERSION,
    run:canonicalRun,
    activitySpec:canonicalActivity,
    occurredAt:attempt.occurredAt||canonicalRun.startedAt,
    timezone:attempt.timezone||canonicalRun.timezone,
    metadata:{...normalizedMetadata(attempt.metadata),legacyAdapter:true}
  });
  const canonicalReceipt=createReceipt({
    ...receipt,
    id:receipt.id||canonicalAttempt.receiptId,
    run:canonicalRun,
    activitySpec:canonicalActivity,
    attempt:canonicalAttempt,
    status:receipt.status||'completed',
    issuedAt:receipt.issuedAt||canonicalAttempt.occurredAt,
    timezone:receipt.timezone||canonicalAttempt.timezone,
    metadata:{...normalizedMetadata(receipt.metadata),legacyAdapter:true}
  });
  return deepFreeze({activitySpec:canonicalActivity,run:canonicalRun,attempt:canonicalAttempt,receipt:canonicalReceipt});
}

export const __testing=Object.freeze({canonicalValue,deepFreeze,sameTarget,normalizeAssistanceEvents});
