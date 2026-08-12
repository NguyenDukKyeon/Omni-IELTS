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
  validateRun,
  validateLearningEnvelope
} from './learning-contracts.js';
import { EVIDENCE_POLICY_VERSION,decideEvidence,normalizeVerificationReceipts } from './evidence-policy.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,transactV10 } from './v10-persistence.js';

export const TODAY_RUNNER_VERSION=2;
const DEFAULT_LEASE_MS=30_000;
const MAX_COLLISION_DIAGNOSTICS=20;
const TERMINAL_STATUSES=new Set(['completed','failed','skipped','cancelled','abstained']);
const executors=new Map();
const clone=value=>value==null?value:structuredClone(value);

function runnerError(code,message,detail={}){
  return Object.assign(new Error(message),{code,productFailure:true,...detail});
}

function isTerminal(status){return TERMINAL_STATUSES.has(status);}
function boundedLease(leaseMs){return Math.max(1_000,Number(leaseMs||DEFAULT_LEASE_MS));}

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

function bindingFor(activity,activitySpec,runId){
  return createFrozenRunBinding({
    runId,
    activitySpecId:activitySpec.id,
    activitySpecDigest:learningContractDigest(activitySpec),
    target:activitySpec.target,
    executor:activitySpec.executor,
    launchBinding:activity.launchBinding,
    promptRevision:activity.launch?.promptRevision,
    configRevision:activity.launch?.configRevision,
    configDigest:activity.launch?.configDigest,
    evaluation:activity.evaluationBinding,
    evidencePolicyVersion:EVIDENCE_POLICY_VERSION,
    evidencePolicyReference:activity.evidencePolicy?.reference,
    assistanceCollectionMode:activity.assistanceCollectionMode,
    startIdempotencyKey:activitySpec.idempotencyKey
  });
}

function assertStoredBinding(row){
  const result=validateFrozenRunBinding(row?.frozenBinding);
  if(!result.valid)throw runnerError(
    row?.frozenBinding?'TODAY_RUN_FROZEN_BINDING_INVALID':'TODAY_RUN_FROZEN_BINDING_MISSING',
    result.errors.join(' ')||'Today run legacy không có Frozen Run binding có thể kiểm chứng.',
    {runId:row?.id||null,reasons:result.errors}
  );
  const binding=result.value;
  if(binding.evidencePolicy.version.state!=='bound'||binding.evidencePolicy.version.value!==EVIDENCE_POLICY_VERSION){
    throw runnerError('TODAY_EVIDENCE_POLICY_VERSION_UNSUPPORTED','Frozen Run binding does not name a supported EvidencePolicy version.',{runId:row?.id||null,policyVersion:binding.evidencePolicy.version.value});
  }
  if(binding.runId!==row.id||binding.activitySpecId!==row.activitySpec?.id||binding.activitySpecDigest!==row.activitySpecDigest||learningContractDigest(binding.target)!==learningContractDigest(row.activitySpec?.target)){
    throw runnerError('TODAY_RUN_FROZEN_BINDING_MISMATCH','Frozen Run binding không khớp Today run đã lưu.',{runId:row.id});
  }
  return binding;
}

function assertStoredCanonicalRun(row,binding){
  const validation=validateRun(row?.canonicalRun);
  if(!validation.valid)throw runnerError('TODAY_RUN_CANONICAL_RUN_MISMATCH',validation.errors.join(' ')||'Persisted canonical Run is invalid.',{runId:row?.id||null,reasons:validation.errors});
  const run=validation.value;
  if(run.id!==row.id||run.activitySpecId!==row.activitySpec?.id||run.activitySpecDigest!==row.activitySpecDigest||learningContractDigest(run.activitySpec)!==learningContractDigest(row.activitySpec)||learningContractDigest(run.frozenBinding)!==learningContractDigest(binding)){
    throw runnerError('TODAY_RUN_CANONICAL_RUN_MISMATCH','Persisted canonical Run does not match the Today row or Frozen Run binding.',{runId:row?.id||null});
  }
  return run;
}

function assertStoredRun(row){
  const binding=assertStoredBinding(row);
  assertStoredCanonicalRun(row,binding);
  return binding;
}

function assertNewFrozenBinding(binding,{runId}={}){
  const result=validateFrozenRunBinding(binding);
  if(!result.valid)throw runnerError('TODAY_RUN_FROZEN_BINDING_INVALID',result.errors.join(' ')||'Frozen Run binding is invalid.',{runId:runId||binding?.runId||null,reasons:result.errors});
  return result.value;
}

async function transactTodayRun(runId,mutate,reason){
  return transactV10([V10_STORES.todayRuns],async({stores,memory,requestResult})=>{
    const store=stores[V10_STORES.todayRuns];
    const current=memory?clone(memory[V10_STORES.todayRuns].get(runId)):clone(await requestResult(store.get(runId)));
    const result=await mutate(current);
    if(result?.row){
      if(memory)memory[V10_STORES.todayRuns].set(runId,clone(result.row));
      else store.put(clone(result.row));
    }
    return clone(result);
  },reason);
}

function terminalDigest(status,envelope){return learningContractDigest({status,envelope});}

function collisionDiagnostic(row,attempted,reason,now){
  const winner=row.terminal||{};
  const diagnostic={
    key:learningContractDigest({reason,winnerIdentity:winner.receiptId||row.receiptId||null,winnerDigest:winner.digest||null,attemptedIdentity:attempted.receiptId,attemptedDigest:attempted.digest}),
    reason,
    runId:row.id,
    winnerIdentity:winner.receiptId||row.receiptId||null,
    winnerDigest:winner.digest||null,
    attemptedIdentity:attempted.receiptId,
    attemptedStatus:attempted.status,
    attemptedDigest:attempted.digest,
    timestamp:Number(now)
  };
  const existing=Array.isArray(row.collisionDiagnostics)?row.collisionDiagnostics:[];
  if(existing.some(item=>item.key===diagnostic.key))return row;
  return {...row,collisionDiagnostics:[...existing,diagnostic].slice(-MAX_COLLISION_DIAGNOSTICS)};
}

function terminalWinner(row,canonicalEnvelope,status,digest,now){
  return {
    ...row,
    status,
    attemptId:canonicalEnvelope.attempt.id,
    receiptId:canonicalEnvelope.receipt.id,
    envelope:clone(canonicalEnvelope),
    evidenceDecision:clone(canonicalEnvelope.decision),
    terminal:{
      status,
      attemptId:canonicalEnvelope.attempt.id,
      receiptId:canonicalEnvelope.receipt.id,
      digest,
      settledAt:Number(now),
      canonicalPersistence:{state:'pending',updatedAt:Number(now)}
    },
    leaseUntil:0,
    completedAt:Number(now),
    updatedAt:Number(now)
  };
}

function terminalMatchesEnvelope(row,canonicalEnvelope,status,digest){
  const terminal=row.terminal||{};
  return row.status===status&&
    row.attemptId===canonicalEnvelope.attempt.id&&
    row.receiptId===canonicalEnvelope.receipt.id&&
    terminal.status===status&&
    terminal.attemptId===canonicalEnvelope.attempt.id&&
    terminal.receiptId===canonicalEnvelope.receipt.id&&
    terminal.digest===digest&&
    learningContractDigest(row.envelope)===learningContractDigest(canonicalEnvelope)&&
    learningContractDigest(row.evidenceDecision)===learningContractDigest(canonicalEnvelope.decision);
}

function assertSettlementEnvelope(row,envelope,status){
  if(!isTerminal(status))throw runnerError('TODAY_RUN_TERMINAL_STATUS_INVALID','Today receipt phải dùng terminal status chuẩn.',{runId:row.id,status});
  const validation=validateLearningEnvelope(envelope);
  if(!validation.valid)throw runnerError('TODAY_RECEIPT_INVALID',validation.errors.join(' '),{runId:row.id});
  const canonical=validation.value;
  if(canonical.run.id!==row.canonicalRun.id||learningContractDigest(canonical.activitySpec)!==row.activitySpecDigest){
    throw runnerError('TODAY_RECEIPT_BINDING_MISMATCH','Receipt không khớp exact Today run.',{runId:row.id,receiptId:canonical.receipt.id});
  }
  const binding=assertStoredRun(row);
  if(canonical.activitySpec.id!==binding.activitySpecId||learningContractDigest(canonical.activitySpec.target)!==learningContractDigest(binding.target)||canonical.attempt.runId!==binding.runId||canonical.receipt.runId!==binding.runId){
    throw runnerError('TODAY_RECEIPT_FROZEN_BINDING_MISMATCH','Receipt không khớp Frozen Run binding.',{runId:row.id,receiptId:canonical.receipt.id});
  }
  if(learningContractDigest(canonical.run.frozenBinding)!==learningContractDigest(binding)){
    throw runnerError('TODAY_RECEIPT_FROZEN_BINDING_MISMATCH','Receipt does not carry the exact persisted Frozen Run binding.',{runId:row.id,receiptId:canonical.receipt.id});
  }
  if(canonical.receipt.status!==status)throw runnerError('TODAY_RECEIPT_STATUS_MISMATCH','Option status và Receipt status phải khớp.',{runId:row.id,status,receiptStatus:canonical.receipt.status});
  if(binding.assistance.collectionMode.state==='bound'&&canonical.attempt.assistance.collector!==binding.assistance.collectionMode.value){
    throw runnerError('TODAY_ASSISTANCE_COLLECTION_MODE_MISMATCH','Collected assistance does not match the Frozen Run binding collection mode.',{runId:row.id,receiptId:canonical.receipt.id});
  }
  const verification=normalizeVerificationReceipts(envelope.verification);
  const decision=decideEvidence({attempt:canonical.attempt,activity:canonical.activitySpec,verification});
  if(envelope.decision&&learningContractDigest(envelope.decision)!==learningContractDigest(decision)){
    throw runnerError('TODAY_EVIDENCE_DECISION_MISMATCH','EvidenceDecision caller không khớp EvidencePolicy tái tính.',{runId:row.id,receiptId:canonical.receipt.id});
  }
  return {...canonical,verification,decision};
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
  const expectedBinding=assertNewFrozenBinding(bindingFor(activity,activitySpec,id),{runId:id});
  const result=await transactTodayRun(id,current=>{
    if(current){
      const binding=assertStoredRun(current);
      if(current.activitySpecDigest!==learningContractDigest(activitySpec)||learningContractDigest(binding)!==learningContractDigest(expectedBinding)){
        throw runnerError('TODAY_RUN_BINDING_COLLISION','Today run đã bind vào ActivitySpec hoặc launch contract khác.',{runId:id,activityId:activity.id});
      }
      if(isTerminal(current.status))return{row:current,run:current,resumed:true,terminal:true};
      if(current.ownerTabId!==tabId&&Number(current.leaseUntil||0)>Number(now)){
        throw runnerError('TODAY_RUN_ACTIVE_OTHER_TAB','Today activity đang chạy ở tab khác.',{runId:id,ownerTabId:current.ownerTabId,leaseUntil:current.leaseUntil});
      }
      const resumed={...current,ownerTabId:tabId,leaseUntil:Number(now)+boundedLease(leaseMs),resumeCount:Number(current.resumeCount||0)+1,updatedAt:Number(now)};
      return{row:resumed,run:resumed,resumed:true,terminal:false};
    }
    const frozenBinding=expectedBinding;
    const canonicalRun=createRun({id,activitySpec,status:'active',startedAt:Number(now),timezone:activitySpec.timezone,frozenBinding});
    const row={
      id,
      kind:'today-run-state',
      schemaVersion:TODAY_RUNNER_VERSION,
      activityId:activity.id,
      planId:activity.planId,
      launchBinding:activity.launchBinding,
      activitySpec,
      activitySpecDigest:learningContractDigest(activitySpec),
      frozenBinding,
      canonicalRun,
      status:'active',
      ownerTabId:tabId,
      leaseUntil:Number(now)+boundedLease(leaseMs),
      resumeCount:0,
      attemptId:null,
      receiptId:null,
      collisionDiagnostics:[],
      createdAt:Number(now),
      updatedAt:Number(now)
    };
    assertStoredCanonicalRun(row,frozenBinding);
    return{row,run:row,resumed:false,terminal:false};
  },'today-run-started-or-resumed');
  return{run:result.run,resumed:result.resumed,terminal:result.terminal};
}

async function mergeLaunchMetadata(runId,started,{error=null,now=Date.now()}={}){
  const result=await transactTodayRun(runId,current=>{
    if(!current)return{row:null};
    const merged={...current,lastLaunchedAt:Number(now),lastLaunchError:error?{code:error.code||'TODAY_EXECUTOR_FAILED',message:String(error.message||error)}:null,updatedAt:Number(now)};
    return{row:merged,run:merged};
  },error?'today-run-launch-failed':'today-run-launched');
  return result.run;
}

export async function launchTodayActivity(activity,options={}){
  const kind=activity?.execution?.kind;
  const handler=executors.get(kind);
  if(!handler)throw runnerError('TODAY_EXECUTOR_UNREGISTERED',`Không có executor cho ${kind||'unknown'}.`,{activityId:activity?.id||null});
  const started=await startTodayRun(activity,options);
  if(started.terminal)return{...started,started:false};
  try{
    const result=await handler({activity:clone(activity),run:clone(started.run),resumed:started.resumed});
    const run=await mergeLaunchMetadata(started.run.id,started.run,{now:options.now||Date.now()});
    return{...started,run,started:result?.started!==false,result};
  }catch(error){
    await mergeLaunchMetadata(started.run.id,started.run,{error,now:options.now||Date.now()});
    throw error;
  }
}

async function resumeStoredTodayRun(runId,{activity=null,tabId='default-tab',now=Date.now()}={}){
  const result=await transactTodayRun(runId,current=>{
    if(!current)throw runnerError('TODAY_RUN_NOT_FOUND','Today run was not found for resume.',{runId});
    const binding=assertStoredRun(current);
    if(activity){
      const activitySpec=assertExactActivity(activity);
      const expected=bindingFor(activity,activitySpec,runId);
      if(current.activitySpecDigest!==learningContractDigest(activitySpec)||learningContractDigest(binding)!==learningContractDigest(expected)){
        throw runnerError('TODAY_RUN_BINDING_COLLISION','Caller activity conflicts with the persisted Frozen Run binding.',{runId,activityId:activity.id});
      }
    }
    if(isTerminal(current.status))return{row:current,run:current,resumed:true,terminal:true};
    if(current.ownerTabId!==tabId&&Number(current.leaseUntil||0)>Number(now)){
      throw runnerError('TODAY_RUN_ACTIVE_OTHER_TAB','Today activity is active in another tab.',{runId,ownerTabId:current.ownerTabId,leaseUntil:current.leaseUntil});
    }
    const resumed={...current,ownerTabId:tabId,leaseUntil:Number(now)+boundedLease(DEFAULT_LEASE_MS),resumeCount:Number(current.resumeCount||0)+1,updatedAt:Number(now)};
    return{row:resumed,run:resumed,resumed:true,terminal:false};
  },'today-run-resumed-from-frozen-binding');
  return{run:result.run,resumed:result.resumed,terminal:result.terminal};
}

export async function resumeTodayRun(runId,{activity=null,tabId='default-tab',now=Date.now()}={}){
  return resumeStoredTodayRun(runId,{activity,tabId,now});
}

export async function recordTodayReceipt(runId,envelope,{status='completed',now=Date.now()}={}){
  const preflight=await getV10Record(V10_STORES.todayRuns,runId);
  if(!preflight)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
  assertSettlementEnvelope(preflight,envelope,status);
  const settled=await transactTodayRun(runId,current=>{
    if(!current)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
    const canonicalEnvelope=assertSettlementEnvelope(current,envelope,status);
    const digest=terminalDigest(status,canonicalEnvelope);
    const attempted={attemptId:canonicalEnvelope.attempt.id,receiptId:canonicalEnvelope.receipt.id,status,digest};
    if(isTerminal(current.status)){
      const winner=current.terminal||{};
      if(terminalMatchesEnvelope(current,canonicalEnvelope,status,digest))return{row:current,run:current,idempotent:true,canonicalEnvelope,digest};
      const reason=winner.receiptId===attempted.receiptId&&winner.attemptId===attempted.attemptId?'TODAY_RUN_TERMINAL_IDENTITY_COLLISION':'TODAY_RUN_TERMINAL_CONFLICT';
      const row=collisionDiagnostic(current,attempted,reason,now);
      return{row,run:row,conflict:reason};
    }
    const row=terminalWinner(current,canonicalEnvelope,status,digest,now);
    return{row,run:row,idempotent:false,canonicalEnvelope,digest};
  },'today-run-terminal-settlement');
  if(settled.conflict)throw runnerError(settled.conflict,'Today run đã có terminal winner; receipt mới bị từ chối.',{runId,receiptId:envelope?.receipt?.id||null});
  if(settled.run.terminal?.canonicalPersistence?.state==='completed')return settled.run;
  try{
    const {persistLearningEnvelope}=await import('./persistence.js');
    await persistLearningEnvelope(settled.canonicalEnvelope);
  }catch(error){
    throw runnerError('TODAY_CANONICAL_PERSISTENCE_PENDING','Terminal winner đã lưu nhưng canonical event chưa hoàn tất; retry cùng receipt để tiếp tục.',{runId,receiptId:settled.canonicalEnvelope.receipt.id,causeCode:error.code||null});
  }
  const completed=await transactTodayRun(runId,current=>{
    if(!current)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
    const canonicalEnvelope=assertSettlementEnvelope(current,envelope,status);
    const digest=terminalDigest(status,canonicalEnvelope);
    if(!terminalMatchesEnvelope(current,canonicalEnvelope,status,digest))throw runnerError('TODAY_RUN_TERMINAL_CONFLICT','Today run terminal winner changed before canonical persistence completion.',{runId,receiptId:canonicalEnvelope.receipt.id});
    const row={...current,terminal:{...current.terminal,canonicalPersistence:{state:'completed',updatedAt:Number(now)}},updatedAt:Number(now)};
    return{row,run:row};
  },'today-run-canonical-persistence-completed');
  return completed.run;
}

async function abstain(runId,status,{now=Date.now()}={}){
  const row=await getV10Record(V10_STORES.todayRuns,runId);
  if(!row)throw runnerError('TODAY_RUN_NOT_FOUND','Không tìm thấy Today run.',{runId});
  assertStoredRun(row);
  if(isTerminal(row.status))return row;
  const trace=completeAssistanceTrace(createAssistanceTrace({id:`trace:${runId}:${status}`,collector:'core-session'}));
  const receiptId=`today-receipt:${runId}:${status}`;
  const attempt=createAttempt({id:`today-attempt:${runId}:${status}`,run:row.canonicalRun,activitySpec:row.activitySpec,receiptId,result:status,target:row.activitySpec.target,assistance:trace,occurredAt:Number(now),timezone:row.activitySpec.timezone});
  const receipt=createReceipt({id:receiptId,run:row.canonicalRun,activitySpec:row.activitySpec,attempt,status,issuedAt:Number(now),timezone:row.activitySpec.timezone});
  const objective=row.activitySpec.target?.schemaVersion===2&&row.activitySpec.target?.targetType==='ielts-objective-item';const verification={source:{id:`source:${row.activitySpec.target.sourceRevision}`,authority:objective?'ielts-source-registry':'core-card-registry',status:objective?'unverified':'verified',sourceId:row.activitySpec.target.sourceId,sourceRevision:row.activitySpec.target.sourceRevision}};
  return recordTodayReceipt(runId,{activitySpec:row.activitySpec,run:row.canonicalRun,attempt,receipt,verification},{status,now});
}

export const skipTodayRun=(runId,options)=>abstain(runId,'skipped',options);
export const cancelTodayRun=(runId,options)=>abstain(runId,'cancelled',options);

export async function listTodayRuns({status=null}={}){
  const rows=await listV10Records(V10_STORES.todayRuns,{sortBy:'updatedAt'});
  return status?rows.filter(row=>row.status===status):rows;
}

export const __testing=Object.freeze({assertExactActivity,assertStoredBinding,bindingFor,runnerError,isTerminal,terminalDigest});
