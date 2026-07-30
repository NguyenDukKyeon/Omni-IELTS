import {
  completeAssistanceTrace,
  createAssistanceTrace,
  createAttempt,
  createReceipt,
  createRun,
  learningContractDigest,
  validateActivitySpec,
  validateLearningEnvelope
} from './learning-contracts.js';
import { decideEvidence } from './evidence-policy.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Record } from './v10-persistence.js';

export const TODAY_RUNNER_VERSION=1;
const DEFAULT_LEASE_MS=30_000;
const executors=new Map();
const clone=value=>value==null?value:structuredClone(value);

function runnerError(code,message,detail={}){
  return Object.assign(new Error(message),{code,productFailure:true,...detail});
}

function assertExactActivity(activity={}){
  const validation=validateActivitySpec(activity.activitySpec||{});
  if(!validation.valid)throw runnerError('TODAY_ACTIVITY_SPEC_INVALID',validation.errors.join(' '),{activityId:activity.id||null});
  const spec=validation.value;
  if(spec.id!==activity.id||learningContractDigest(spec.target)!==learningContractDigest(activity.target)){
    throw runnerError('TODAY_ACTIVITY_TARGET_MISMATCH','Today activity không khớp ActivitySpec đã snapshot.',{activityId:activity.id||null});
  }
  if(spec.executor!==activity.execution?.kind)throw runnerError('TODAY_ACTIVITY_EXECUTOR_MISMATCH','Today executor không khớp ActivitySpec.',{activityId:activity.id});
  return spec;
}

export function registerTodayExecutor(kind,handler){
  const key=String(kind||'').trim();
  if(!key||typeof handler!=='function')throw new TypeError('Today executor cần kind và handler.');
  executors.set(key,handler);
  return()=>executors.delete(key);
}

export function listTodayExecutors(){return[...executors.keys()].sort();}

export async function startTodayRun(activity,{tabId='default-tab',now=Date.now(),leaseMs=DEFAULT_LEASE_MS}={}){
  const activitySpec=assertExactActivity(activity);
  const id=`today-run:${activity.id}`;
  const existing=await getV10Record(V10_STORES.todayRuns,id);
  if(existing){
    if(existing.activitySpecDigest!==learningContractDigest(activitySpec)||existing.launchBinding!==activity.launchBinding){
      throw runnerError('TODAY_RUN_BINDING_COLLISION','Today run đã bind vào ActivitySpec khác.',{runId:id,activityId:activity.id});
    }
    if(['completed','skipped','cancelled'].includes(existing.status))return{run:existing,resumed:true,terminal:true};
    if(existing.ownerTabId!==tabId&&Number(existing.leaseUntil||0)>Number(now)){
      throw runnerError('TODAY_RUN_ACTIVE_OTHER_TAB','Today activity đang chạy ở tab khác.',{runId:id,ownerTabId:existing.ownerTabId,leaseUntil:existing.leaseUntil});
    }
    const resumed={...existing,ownerTabId:tabId,leaseUntil:Number(now)+Math.max(1_000,Number(leaseMs||DEFAULT_LEASE_MS)),resumeCount:Number(existing.resumeCount||0)+1,updatedAt:Number(now)};
    await putV10Record(V10_STORES.todayRuns,resumed,'today-run-resumed');
    return{run:resumed,resumed:true,terminal:false};
  }
  const canonicalRun=createRun({id,activitySpec,status:'active',startedAt:Number(now),timezone:activitySpec.timezone});
  const row={
    id,
    kind:'today-run-state',
    schemaVersion:TODAY_RUNNER_VERSION,
    activityId:activity.id,
    planId:activity.planId,
    launchBinding:activity.launchBinding,
    activitySpec,
    activitySpecDigest:learningContractDigest(activitySpec),
    canonicalRun,
    status:'active',
    ownerTabId:tabId,
    leaseUntil:Number(now)+Math.max(1_000,Number(leaseMs||DEFAULT_LEASE_MS)),
    resumeCount:0,
    attemptId:null,
    receiptId:null,
    createdAt:Number(now),
    updatedAt:Number(now)
  };
  await putV10Record(V10_STORES.todayRuns,row,'today-run-started');
  return{run:row,resumed:false,terminal:false};
}

export async function launchTodayActivity(activity,options={}){
  const kind=activity?.execution?.kind;
  const handler=executors.get(kind);
  if(!handler)throw runnerError('TODAY_EXECUTOR_UNREGISTERED',`Không có executor cho ${kind||'unknown'}.`,{activityId:activity?.id||null});
  const started=await startTodayRun(activity,options);
  if(started.terminal)return{...started,started:false};
  try{
    const result=await handler({activity:clone(activity),run:clone(started.run),resumed:started.resumed});
    const updated={...started.run,lastLaunchedAt:Number(options.now||Date.now()),lastLaunchError:null,updatedAt:Number(options.now||Date.now())};
    await putV10Record(V10_STORES.todayRuns,updated,'today-run-launched');
    return{...started,run:updated,started:result?.started!==false,result};
  }catch(error){
    await putV10Record(V10_STORES.todayRuns,{...started.run,lastLaunchError:{code:error.code||'TODAY_EXECUTOR_FAILED',message:String(error.message||error)},updatedAt:Number(options.now||Date.now())},'today-run-launch-failed');
    throw error;
  }
}

export async function resumeTodayRun(runId,{activity=null,tabId='default-tab',now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run để resume.',{runId});
  const snapshot=activity||{
    id:row.activityId,
    planId:row.planId,
    launchBinding:row.launchBinding,
    target:row.activitySpec.target,
    activitySpec:row.activitySpec,
    execution:{kind:row.activitySpec.executor,status:'ready'}
  };
  return startTodayRun(snapshot,{tabId,now});
}

export async function recordTodayReceipt(runId,envelope,{status='completed',now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
  const validation=validateLearningEnvelope(envelope);
  if(!validation.valid)throw runnerError('TODAY_RECEIPT_INVALID',validation.errors.join(' '),{runId});
  if(validation.value.run.id!==row.canonicalRun.id||learningContractDigest(validation.value.activitySpec)!==row.activitySpecDigest){
    throw runnerError('TODAY_RECEIPT_BINDING_MISMATCH','Receipt không khớp exact Today run.',{runId,receiptId:validation.value.receipt.id});
  }
  const terminal={...row,status,attemptId:validation.value.attempt.id,receiptId:validation.value.receipt.id,envelope:clone(envelope),leaseUntil:0,completedAt:Number(now),updatedAt:Number(now)};
  await putV10Record(V10_STORES.todayRuns,terminal,'today-run-receipt-recorded');
  if(envelope.decision){
    const { persistLearningEnvelope }=await import('./persistence.js');
    await persistLearningEnvelope(envelope);
  }
  return terminal;
}

async function abstain(runId,status,{now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
  if(['completed','skipped','cancelled'].includes(row.status))return row;
  const trace=completeAssistanceTrace(createAssistanceTrace({id:`trace:${runId}:${status}`,collector:'core-session'}),now);
  const receiptId=`today-receipt:${runId}:${status}`;
  const attempt=createAttempt({id:`today-attempt:${runId}:${status}`,run:row.canonicalRun,activitySpec:row.activitySpec,receiptId,result:status,target:row.activitySpec.target,assistance:trace,occurredAt:Number(now),timezone:row.activitySpec.timezone});
  const receipt=createReceipt({id:receiptId,run:row.canonicalRun,activitySpec:row.activitySpec,attempt,status,issuedAt:Number(now),timezone:row.activitySpec.timezone});
  const verification={source:{id:`source:${row.activitySpec.target.sourceRevision}`,authority:'core-card-registry',status:'verified',sourceId:row.activitySpec.target.sourceId,sourceRevision:row.activitySpec.target.sourceRevision}};
  const decision=decideEvidence({attempt,activity:row.activitySpec,verification});
  return recordTodayReceipt(runId,{activitySpec:row.activitySpec,run:row.canonicalRun,attempt,receipt,verification,decision},{status,now});
}

export const skipTodayRun=(runId,options)=>abstain(runId,'skipped',options);
export const cancelTodayRun=(runId,options)=>abstain(runId,'cancelled',options);

export async function listTodayRuns({status=null}={}){
  const rows=await listV10Records(V10_STORES.todayRuns,{sortBy:'updatedAt'});
  return status?rows.filter(row=>row.status===status):rows;
}

export const __testing=Object.freeze({assertExactActivity,runnerError});
