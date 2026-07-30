import { learningContractDigest } from './learning-contracts.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Record } from './v10-persistence.js';

export const CROSS_DB_INTENT_VERSION=1;
export const CROSS_DB_INTENT_STATUSES=Object.freeze(['pending','running','completed','quarantined']);

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=240)=>String(value??'').trim().slice(0,max);

function typedError(code,message,detail={}){
  return Object.assign(new Error(message),{code,durable:true,...detail});
}

export function normalizeCrossDbIntent(input={}){
  const id=clean(input.id,240);
  const kind=clean(input.kind,120);
  const stepSource=Array.isArray(input.stepIds)?input.stepIds:Array.isArray(input.steps)?input.steps.map(step=>step.id):[];
  const stepIds=[...new Set(stepSource.map(value=>clean(value,120)).filter(Boolean))];
  if(!id||!kind||!stepIds.length)throw typedError('CROSS_DB_INTENT_INVALID','Cross-DB intent cần id, kind và các step ổn định.');
  const now=Number(input.createdAt||Date.now());
  const payload=clone(input.payload||{});
  const payloadDigest=learningContractDigest(payload);
  const previousById=new Map((Array.isArray(input.steps)?input.steps:[]).map(step=>[step.id,step]));
  return{
    id,
    kind,
    schemaVersion:CROSS_DB_INTENT_VERSION,
    payload,
    payloadDigest,
    context:clone(input.context||{}),
    steps:stepIds.map(stepId=>{
      const previous=previousById.get(stepId)||{};
      return{
        id:stepId,
        status:previous.status==='completed'?'completed':'pending',
        attempts:Math.max(0,Number(previous.attempts||0)),
        result:clone(previous.result??null),
        lastError:previous.lastError?clone(previous.lastError):null,
        completedAt:Number(previous.completedAt||0)||null
      };
    }),
    status:input.status==='completed'?'completed':input.status==='quarantined'?'quarantined':'pending',
    createdAt:now,
    updatedAt:Number(input.updatedAt||now),
    completedAt:Number(input.completedAt||0)||null
  };
}

export async function createCrossDbIntent(input){
  const next=normalizeCrossDbIntent(input);
  const existing=await getV10Record(V10_STORES.workflowIntents,next.id);
  if(existing){
    if(existing.kind!==next.kind||existing.payloadDigest!==next.payloadDigest||learningContractDigest(existing.steps.map(step=>step.id))!==learningContractDigest(next.steps.map(step=>step.id))){
      throw typedError('CROSS_DB_INTENT_COLLISION',`Intent ${next.id} đã tồn tại với payload hoặc workflow khác.`,{intentId:next.id});
    }
    return existing;
  }
  return putV10Record(V10_STORES.workflowIntents,next,'cross-db-intent-created');
}

export async function executeCrossDbIntent(input,{handlers={},hooks={},maxAttempts=5}={}){
  let intent=await createCrossDbIntent(input);
  if(intent.status==='completed')return intent;
  if(intent.status==='quarantined')throw typedError('CROSS_DB_INTENT_QUARANTINED',`Intent ${intent.id} đang bị cách ly.`,{intentId:intent.id});
  for(let index=0;index<intent.steps.length;index+=1){
    const step=intent.steps[index];
    if(step.status==='completed')continue;
    const handler=handlers[step.id];
    if(typeof handler!=='function')throw typedError('CROSS_DB_HANDLER_MISSING',`Không có reconciler cho step ${step.id}.`,{intentId:intent.id,stepId:step.id});
    const attempt=Number(step.attempts||0)+1;
    intent={...intent,status:'running',steps:intent.steps.map((row,rowIndex)=>rowIndex===index?{...row,status:'pending',attempts:attempt}:row),updatedAt:Date.now()};
    await putV10Record(V10_STORES.workflowIntents,intent,'cross-db-step-started');
    try{
      const result=await handler({intent:clone(intent),payload:clone(intent.payload),context:clone(intent.context),step:clone(intent.steps[index])});
      await hooks.afterAction?.({intent:clone(intent),stepId:step.id,index,result:clone(result)});
      const context=result?.context&&typeof result.context==='object'?{...intent.context,...clone(result.context)}:intent.context;
      intent={
        ...intent,
        context,
        status:'pending',
        steps:intent.steps.map((row,rowIndex)=>rowIndex===index?{...row,status:'completed',result:clone(result??null),lastError:null,completedAt:Date.now()}:row),
        updatedAt:Date.now()
      };
      await putV10Record(V10_STORES.workflowIntents,intent,'cross-db-step-completed');
      await hooks.afterCheckpoint?.({intent:clone(intent),stepId:step.id,index});
    }catch(error){
      const quarantined=error?.poison===true||attempt>=Math.max(1,Number(maxAttempts||5));
      intent={
        ...intent,
        status:quarantined?'quarantined':'pending',
        steps:intent.steps.map((row,rowIndex)=>rowIndex===index?{...row,status:'pending',lastError:{code:clean(error?.code,120)||'CROSS_DB_STEP_FAILED',message:clean(error?.message??error,1000),at:Date.now()}}:row),
        updatedAt:Date.now()
      };
      await putV10Record(V10_STORES.workflowIntents,intent,quarantined?'cross-db-intent-quarantined':'cross-db-step-failed');
      error.intentId=intent.id;
      error.stepId=step.id;
      throw error;
    }
  }
  intent={...intent,status:'completed',completedAt:Date.now(),updatedAt:Date.now()};
  return putV10Record(V10_STORES.workflowIntents,intent,'cross-db-intent-completed');
}

export async function listCrossDbIntents({status=null,kind=null}={}){
  const rows=await listV10Records(V10_STORES.workflowIntents,{sortBy:'updatedAt',descending:false});
  return rows.filter(row=>(!status||row.status===status)&&(!kind||row.kind===kind));
}

export async function reconcileCrossDbIntents({handlersByKind={},hooks={},maxAttempts=5}={}){
  const rows=(await listCrossDbIntents()).filter(row=>!['completed','quarantined'].includes(row.status));
  const result={found:rows.length,completed:0,pending:0,quarantined:0,errors:[]};
  for(const row of rows){
    const handlers=handlersByKind[row.kind];
    if(!handlers){
      result.pending+=1;
      result.errors.push({intentId:row.id,code:'CROSS_DB_HANDLER_MISSING'});
      continue;
    }
    try{
      const completed=await executeCrossDbIntent(row,{handlers,hooks,maxAttempts});
      if(completed.status==='completed')result.completed+=1;
    }catch(error){
      const latest=await getV10Record(V10_STORES.workflowIntents,row.id);
      if(latest?.status==='quarantined')result.quarantined+=1;else result.pending+=1;
      result.errors.push({intentId:row.id,code:error.code||'CROSS_DB_STEP_FAILED',stepId:error.stepId||null});
    }
  }
  return result;
}

export const __testing=Object.freeze({typedError});
