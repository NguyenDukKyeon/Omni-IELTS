import {
  completeAssistanceTrace,
  createAssistanceTrace,
  createAttempt,
  createFrozenRunBinding,
  createReceipt,
  createRun,
  learningContractDigest,
  validateActivitySpec,
  validateFrozenRunBinding,
  validateLearningEnvelope
} from './learning-contracts.js';
import { decideEvidence } from './evidence-policy.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,transactV10 } from './v10-persistence.js';

export const TODAY_RUNNER_VERSION=1;
const DEFAULT_LEASE_MS=30_000;
const TERMINAL_STATUS_SET=new Set(['completed','failed','skipped','cancelled','abstained']);
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

function requireFrozenBinding(row){
  const result=validateFrozenRunBinding(row?.frozenBinding,{
    activitySpec:row?.activitySpec,
    run:row?.canonicalRun,
    storedDigest:row?.frozenBindingDigest
  });
  if(!result.valid)throw runnerError(result.code,result.errors.join(' '),{runId:row?.id||null});
  return result.value;
}

async function transactToday(callback,reason){
  return transactV10([V10_STORES.todayRuns],async context=>{
    const map=context.memory?.[V10_STORES.todayRuns]||null;
    const store=context.stores?.[V10_STORES.todayRuns]||null;
    const get=async id=>map?clone(map.get(id)):clone(await context.requestResult(store.get(id)));
    const put=row=>{
      const next={...clone(row),updatedAt:Number(row?.updatedAt||Date.now())};
      if(!next.id)throw runnerError('TODAY_RUN_NOT_FOUND','Today run thiếu id trong atomic mutation.');
      if(map)map.set(next.id,clone(next));else store.put(clone(next));
      return next;
    };
    return callback({get,put});
  },reason);
}

async function patchActiveRun(runId,patch,reason){
  return transactToday(async({get,put})=>{
    const row=await get(runId);
    if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
    requireFrozenBinding(row);
    if(TERMINAL_STATUS_SET.has(row.status))return row;
    return put({...row,...clone(patch)});
  },reason);
}

function terminalPayload(validation,envelope,decision){
  return{
    activitySpec:validation.value.activitySpec,
    run:validation.value.run,
    attempt:validation.value.attempt,
    receipt:validation.value.receipt,
    verification:clone(envelope.verification||{}),
    decision:clone(decision)
  };
}

function decisionMatches(envelope,authoritativeDecision){
  return Boolean(envelope?.decision)&&learningContractDigest(envelope.decision)===learningContractDigest(authoritativeDecision);
}

function terminalIdentity(payload){
  return payload.receipt.idempotencyKey||`receipt:${payload.receipt.id}`;
}

function collisionDiagnostic(row,payload,payloadDigest,now){
  return{
    code:'LEARNING_EVENT_COLLISION',
    existingReceiptId:row.receiptId||null,
    existingStatus:row.status||null,
    existingTerminalIdentity:row.terminalSettlement?.terminalIdentity||null,
    existingPayloadDigest:row.terminalSettlement?.payloadDigest||null,
    incomingReceiptId:payload.receipt.id,
    incomingStatus:payload.receipt.status,
    incomingTerminalIdentity:terminalIdentity(payload),
    incomingPayloadDigest:payloadDigest,
    observedAt:Number(now)
  };
}

async function markDownstreamPersisted(runId,settlement,now){
  return transactToday(async({get,put})=>{
    const row=await get(runId);
    if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
    requireFrozenBinding(row);
    if(row.terminalSettlement?.terminalIdentity!==settlement.terminalIdentity||row.terminalSettlement?.payloadDigest!==settlement.payloadDigest)return row;
    if(row.terminalSettlement.downstreamPersisted===true)return row;
    return put({...row,terminalSettlement:{...row.terminalSettlement,downstreamPersisted:true,downstreamPersistedAt:Number(now)}});
  },'today-run-terminal-downstream-persisted');
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
  const activitySpecDigest=learningContractDigest(activitySpec);
  const leaseUntil=Number(now)+Math.max(1_000,Number(leaseMs||DEFAULT_LEASE_MS));
  return transactToday(async({get,put})=>{
    const existing=await get(id);
    if(existing){
      requireFrozenBinding(existing);
      if(existing.activitySpecDigest!==activitySpecDigest||existing.launchBinding!==activity.launchBinding){
        throw runnerError('TODAY_RUN_BINDING_COLLISION','Today run đã bind vào ActivitySpec khác.',{runId:id,activityId:activity.id});
      }
      if(TERMINAL_STATUS_SET.has(existing.status))return{run:existing,resumed:true,terminal:true};
      if(existing.ownerTabId!==tabId&&Number(existing.leaseUntil||0)>Number(now)){
        throw runnerError('TODAY_RUN_ACTIVE_OTHER_TAB','Today activity đang chạy ở tab khác.',{runId:id,ownerTabId:existing.ownerTabId,leaseUntil:existing.leaseUntil});
      }
      const resumed=put({...existing,ownerTabId:tabId,leaseUntil,resumeCount:Number(existing.resumeCount||0)+1,updatedAt:Number(now)});
      return{run:resumed,resumed:true,terminal:false};
    }
    const canonicalRun=createRun({id,activitySpec,status:'active',startedAt:Number(now),timezone:activitySpec.timezone});
    const frozenBinding=createFrozenRunBinding({run:canonicalRun,activitySpec,launchBinding:activity.launchBinding});
    const row=put({
      id,
      kind:'today-run-state',
      schemaVersion:TODAY_RUNNER_VERSION,
      activityId:activity.id,
      planId:activity.planId,
      launchBinding:activity.launchBinding,
      activitySpec,
      activitySpecDigest,
      canonicalRun,
      frozenBinding,
      frozenBindingDigest:learningContractDigest(frozenBinding),
      status:'active',
      ownerTabId:tabId,
      leaseUntil,
      resumeCount:0,
      attemptId:null,
      receiptId:null,
      terminalSettlement:null,
      collisionDiagnostics:[],
      createdAt:Number(now),
      updatedAt:Number(now)
    });
    return{run:row,resumed:false,terminal:false};
  },'today-run-atomic-start');
}

export async function launchTodayActivity(activity,options={}){
  const kind=activity?.execution?.kind;
  const handler=executors.get(kind);
  if(!handler)throw runnerError('TODAY_EXECUTOR_UNREGISTERED',`Không có executor cho ${kind||'unknown'}.`,{activityId:activity?.id||null});
  const started=await startTodayRun(activity,options);
  if(started.terminal)return{...started,started:false};
  try{
    const result=await handler({activity:clone(activity),run:clone(started.run),resumed:started.resumed});
    const at=Number(options.now||Date.now());
    const updated=await patchActiveRun(started.run.id,{lastLaunchedAt:at,lastLaunchError:null,updatedAt:at},'today-run-launched');
    return{...started,run:updated,started:result?.started!==false,result};
  }catch(error){
    const at=Number(options.now||Date.now());
    await patchActiveRun(started.run.id,{lastLaunchError:{code:error.code||'TODAY_EXECUTOR_FAILED',message:String(error.message||error)},updatedAt:at},'today-run-launch-failed');
    throw error;
  }
}

export async function resumeTodayRun(runId,{activity=null,tabId='default-tab',now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run để resume.',{runId});
  requireFrozenBinding(row);
  const persistedSnapshot={
    id:row.activityId,
    planId:row.planId,
    launchBinding:row.launchBinding,
    target:row.activitySpec.target,
    activitySpec:row.activitySpec,
    execution:{kind:row.activitySpec.executor,status:'ready'}
  };
  if(activity){
    const supplied=assertExactActivity(activity);
    if(learningContractDigest(supplied)!==row.activitySpecDigest||activity.launchBinding!==row.launchBinding){
      throw runnerError('TODAY_RUN_BINDING_COLLISION','Resume caller không khớp persisted frozen binding.',{runId});
    }
  }
  return startTodayRun(persistedSnapshot,{tabId,now});
}

export async function recordTodayReceipt(runId,envelope,{status='completed',now=Date.now()}={}){
  const validation=validateLearningEnvelope(envelope);
  if(!validation.valid)throw runnerError('TODAY_RECEIPT_INVALID',validation.errors.join(' '),{runId});
  if(validation.value.run.id!==runId){
    throw runnerError('TODAY_RECEIPT_BINDING_MISMATCH','Receipt không khớp exact Today run.',{runId,receiptId:validation.value.receipt.id});
  }
  if(status!==validation.value.receipt.status){
    throw runnerError('TODAY_RECEIPT_STATUS_MISMATCH','Terminal status không khớp canonical Receipt.',{runId,status,receiptStatus:validation.value.receipt.status});
  }
  const authoritativeDecision=decideEvidence({
    attempt:validation.value.attempt,
    activity:validation.value.activitySpec,
    verification:envelope.verification
  });
  if(!decisionMatches(envelope,authoritativeDecision)){
    throw runnerError('LI_EVIDENCE_DECISION_MISMATCH','EvidencePolicy là authority duy nhất; caller/provider decision không khớp policy.',{runId,receiptId:validation.value.receipt.id});
  }
  const payload=terminalPayload(validation,envelope,authoritativeDecision);
  const payloadDigest=learningContractDigest(payload);
  const incomingIdentity=terminalIdentity(payload);
  const settlementResult=await transactToday(async({get,put})=>{
    const row=await get(runId);
    if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
    requireFrozenBinding(row);
    if(learningContractDigest(validation.value.activitySpec)!==row.activitySpecDigest||validation.value.run.id!==row.canonicalRun.id){
      throw runnerError('TODAY_RECEIPT_BINDING_MISMATCH','Receipt không khớp exact Today run.',{runId,receiptId:validation.value.receipt.id});
    }
    if(TERMINAL_STATUS_SET.has(row.status)){
      const prior=row.terminalSettlement;
      if(prior?.terminalIdentity===incomingIdentity&&prior?.payloadDigest===payloadDigest&&row.receiptId===payload.receipt.id&&row.status===payload.receipt.status){
        return{kind:'idempotent',row,needsDownstream:prior.downstreamPersisted!==true,settlement:prior};
      }
      const diagnostic=collisionDiagnostic(row,payload,payloadDigest,now);
      const diagnostics=[...(Array.isArray(row.collisionDiagnostics)?row.collisionDiagnostics:[]),diagnostic].slice(-50);
      const preserved=put({...row,collisionDiagnostics:diagnostics,updatedAt:Number(now)});
      return{kind:'collision',row:preserved,diagnostic};
    }
    const settlement={
      schemaVersion:1,
      terminalIdentity:incomingIdentity,
      payloadDigest,
      receiptId:payload.receipt.id,
      attemptId:payload.attempt.id,
      status:payload.receipt.status,
      settledAt:Number(now),
      downstreamPersisted:false,
      downstreamPersistedAt:null
    };
    const terminal=put({
      ...row,
      status:payload.receipt.status,
      attemptId:payload.attempt.id,
      receiptId:payload.receipt.id,
      envelope:clone(payload),
      terminalSettlement:settlement,
      leaseUntil:0,
      completedAt:Number(now),
      updatedAt:Number(now)
    });
    return{kind:'won',row:terminal,needsDownstream:true,settlement};
  },'today-run-atomic-terminal-settlement');

  if(settlementResult.kind==='collision'){
    throw runnerError('LEARNING_EVENT_COLLISION','Today Run đã có terminal winner không tương thích.',{runId,...settlementResult.diagnostic});
  }
  if(settlementResult.needsDownstream){
    const { persistLearningEnvelope }=await import('./persistence.js');
    await persistLearningEnvelope(payload);
    const durable=await markDownstreamPersisted(runId,settlementResult.settlement,now);
    return durable;
  }
  return settlementResult.row;
}

async function abstain(runId,status,{now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
  requireFrozenBinding(row);
  if(TERMINAL_STATUS_SET.has(row.status))return row;
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

export const __testing=Object.freeze({assertExactActivity,requireFrozenBinding,runnerError,terminalPayload});
