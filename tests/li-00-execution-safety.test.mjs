import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { composeTodayPlan } from '../src/today-composer.js';
import {
  completeAssistanceTrace,
  createAssistanceTrace,
  createAttempt,
  createFrozenRunBinding,
  createReceipt,
  createRun,
  learningContractDigest,
  validateFrozenRunBinding,
  validateRun
} from '../src/learning-contracts.js';
import { EVIDENCE_POLICY_VERSION,decideEvidence } from '../src/evidence-policy.js';
import { withExclusiveStorageLock } from '../src/storage-lock.js';

globalThis.indexedDB=new IDBFactory();

const runner=await import('../src/today-runner.js');
const v10=await import('../src/v10-persistence.js');
const {V10_STORES}=await import('../src/v10-contracts.js');

const target={cardId:'li-00-card',senseId:'li-00-sense',skill:'recall',sourceId:'core-card:li-00-card',sourceRevision:'li-00-r1'};

function activity(id){
  const plan=composeTodayPlan({dueReviews:[{id,type:'typing',target,executor:'li-00-fixture',estimatedSeconds:60}],now:1_000,minutes:5});
  return {...plan.activities[0],id,execution:{kind:'li-00-fixture',status:'ready'},launchBinding:`launch:${id}`};
}

function envelope(row,{attemptId,receiptId,status,at}){
  const trace=completeAssistanceTrace(createAssistanceTrace({id:`trace:${attemptId}`,collector:'core-session',complete:false}));
  const attempt=createAttempt({id:attemptId,run:row.canonicalRun,activitySpec:row.activitySpec,receiptId,result:status,target,assistance:trace,occurredAt:at,timezone:row.activitySpec.timezone});
  const receipt=createReceipt({id:receiptId,run:row.canonicalRun,activitySpec:row.activitySpec,attempt,status,issuedAt:at,timezone:row.activitySpec.timezone});
  return {activitySpec:row.activitySpec,run:row.canonicalRun,attempt,receipt,verification:{source:{id:'li-00-source',authority:'core-card-registry',status:'verified',sourceId:target.sourceId,sourceRevision:target.sourceRevision}}};
}

function richEvaluation(){
  return {
    applicable:true,
    revision:'evaluation-r7',
    keyRevision:'key-r4',
    keyDigest:'sha256:key-r4',
    rubricRevision:'rubric-r3',
    rubricDigest:'sha256:rubric-r3',
    scoringPolicyRevision:'scoring-r2',
    reviewPolicyRevision:'review-r5'
  };
}

function richActivity(id){
  const planned=activity(id);
  return {
    ...planned,
    launch:{promptRevision:'prompt-r7',configRevision:'config-r6',configDigest:'sha256:config-r6'},
    evaluationBinding:richEvaluation(),
    evidencePolicy:{reference:'policy-reference-r3'},
    assistanceCollectionMode:'core-session',
    activitySpec:{...planned.activitySpec,policyVersion:'stale-caller-policy-label'}
  };
}

test('a distinct second terminal receipt cannot replace the durable first winner',async()=>{
  const started=await runner.startTodayRun(activity('li-00-natural-red'),{tabId:'tab-a',now:1_000});
  const first=envelope(started.run,{attemptId:'attempt-first',receiptId:'receipt-first',status:'completed',at:1_100});
  await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:1_100});
  const second=envelope(started.run,{attemptId:'attempt-second',receiptId:'receipt-second',status:'failed',at:1_200});
  await assert.rejects(
    runner.recordTodayReceipt(started.run.id,second,{status:'failed',now:1_200}),
    error=>error.code==='TODAY_RUN_TERMINAL_CONFLICT'
  );
  const stored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(stored.receiptId,'receipt-first');
  assert.equal(stored.status,'completed');
});

test('Frozen Run binding is exact, durable, and rejects tampering or unsupported schemas',async()=>{
  const planned={...activity('li-00-frozen'),launch:{promptRevision:'prompt-r2',configRevision:'config-r4',configDigest:'config:abc'},evaluationBinding:{applicable:false},evidencePolicy:{reference:'policy:phase1'},assistanceCollectionMode:'core-session'};
  const started=await runner.startTodayRun(planned,{tabId:'freeze-tab',now:2_000});
  const binding=started.run.frozenBinding;
  assert.equal(binding.runId,started.run.id);
  assert.equal(binding.activitySpecId,planned.activitySpec.id);
  assert.deepEqual(binding.target,target);
  assert.equal(binding.executor.value,'li-00-fixture');
  assert.equal(binding.launch.promptRevision.value,'prompt-r2');
  assert.equal(binding.launch.configDigest.value,'config:abc');
  assert.equal(binding.evaluation.marker,'inapplicable');
  assert.equal(binding.assistance.collectionMode.value,'core-session');
  assert.equal(validateFrozenRunBinding(binding).valid,true);
  assert.equal(validateFrozenRunBinding({...binding,digest:'fnv1a64:0:0000000000000000'}).valid,false);
  assert.equal(validateFrozenRunBinding({...binding,schemaVersion:99}).valid,false);
  await v10.reopenV10Database();
  const reloaded=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.deepEqual(reloaded.frozenBinding,binding);
  await assert.rejects(runner.resumeTodayRun(started.run.id,{activity:{...planned,launchBinding:'different'},now:2_100}),error=>error.code==='TODAY_RUN_BINDING_COLLISION');
});

test('Frozen Run binding has a strict persisted schema and preserves all applicable evaluation inputs',()=>{
  const binding=createFrozenRunBinding({
    runId:'run-rich',activitySpecId:'activity-rich',activitySpecDigest:'spec-rich',target,
    executor:'li-00-fixture',launchBinding:'launch-rich',promptRevision:'prompt-r7',configRevision:'config-r6',configDigest:'sha256:config-r6',
    evaluation:richEvaluation(),evidencePolicyVersion:EVIDENCE_POLICY_VERSION,evidencePolicyReference:'policy-reference-r3',
    assistanceCollectionMode:'core-session',startIdempotencyKey:'activity-rich'
  });
  assert.equal(binding.evaluation.marker,'applicable');
  assert.equal(binding.evaluation.keyDigest.value,'sha256:key-r4');
  assert.equal(binding.evaluation.rubricDigest.value,'sha256:rubric-r3');
  assert.equal(binding.evaluation.scoringPolicyRevision.value,'scoring-r2');
  assert.equal(binding.evaluation.reviewPolicyRevision.value,'review-r5');
  assert.equal(validateFrozenRunBinding(structuredClone(binding)).valid,true);
  const malformed=[
    (()=>{const value=structuredClone(binding);delete value.launch.configDigest;return value;})(),
    {...binding,unexpected:true},
    {...binding,target:{...binding.target,unexpected:true}},
    {...binding,launch:{...binding.launch,unexpected:true}},
    {...binding,evaluation:{...binding.evaluation,unexpected:true}},
    {...binding,evidencePolicy:{...binding.evidencePolicy,unexpected:true}},
    {...binding,assistance:{...binding.assistance,unexpected:true}},
    {...binding,evaluation:{...binding.evaluation,marker:'inapplicable'}},
    {...binding,launch:{...binding.launch,binding:{state:'inapplicable',value:'must-not-normalize'}}}
  ];
  for(const value of malformed)assert.equal(validateFrozenRunBinding(value).valid,false);
});

test('Run validation binds the persisted Frozen Run identity to its Run, ActivitySpec and exact target',()=>{
  const planned=richActivity('li-00-run-linkage');
  const binding=createFrozenRunBinding({
    runId:'today-run:li-00-run-linkage',activitySpecId:planned.activitySpec.id,activitySpecDigest:learningContractDigest(planned.activitySpec),target,
    executor:'li-00-fixture',launchBinding:planned.launchBinding,...planned.launch,evaluation:richEvaluation(),
    evidencePolicyVersion:EVIDENCE_POLICY_VERSION,evidencePolicyReference:'policy-reference-r3',assistanceCollectionMode:'core-session',startIdempotencyKey:planned.activitySpec.idempotencyKey
  });
  const run=createRun({id:binding.runId,activitySpec:planned.activitySpec,status:'active',startedAt:2_500,frozenBinding:binding});
  assert.equal(validateRun(run).valid,true);
  assert.equal(validateRun({...run,frozenBinding:{...binding,runId:'other-run'}}).valid,false);
  assert.equal(validateRun({...run,frozenBinding:{...binding,target:{...target,cardId:'other-card'}}}).valid,false);
  const otherExecutorSpec={...planned.activitySpec,executor:'other-executor'};
  assert.equal(validateRun({...run,activitySpec:otherExecutorSpec,activitySpecDigest:learningContractDigest(otherExecutorSpec)}).valid,false);
  const otherStartKeySpec={...planned.activitySpec,idempotencyKey:'other-start-key'};
  assert.equal(validateRun({...run,activitySpec:otherStartKeySpec,activitySpecDigest:learningContractDigest(otherStartKeySpec)}).valid,false);
});

test('resume rejects a persisted Today row whose canonical Run no longer matches its Frozen binding',async()=>{
  const started=await runner.startTodayRun(richActivity('li-00-canonical-run-mismatch'),{now:2_700});
  const invalidCanonicalRun=createRun({...started.run.canonicalRun,activitySpec:{...started.run.activitySpec,executor:'other-executor'}});
  await v10.putV10Record(V10_STORES.todayRuns,{...started.run,canonicalRun:invalidCanonicalRun},'li-00-canonical-run-mismatch-fixture');
  await assert.rejects(
    runner.resumeTodayRun(started.run.id,{now:2_710}),
    error=>error.code==='TODAY_RUN_CANONICAL_RUN_MISMATCH'
  );
});

test('a malformed applicable evaluation binding is rejected before Today state is persisted or an executor can run',async()=>{
  const planned={...activity('li-00-malformed-evaluation'),evaluationBinding:{applicable:true}};
  let calls=0;
  const unregister=runner.registerTodayExecutor('li-00-fixture',async()=>{calls+=1;return {started:true};});
  try{
    await assert.rejects(runner.launchTodayActivity(planned,{now:2_800}),error=>error.code==='TODAY_RUN_FROZEN_BINDING_INVALID');
    assert.equal(calls,0);
    assert.equal(await v10.getV10Record(V10_STORES.todayRuns,'today-run:li-00-malformed-evaluation'),undefined);
  }finally{unregister();}
});

test('terminal settlement rejects assistance collected under a mode other than the Frozen binding',async()=>{
  const started=await runner.startTodayRun(richActivity('li-00-assistance-mode'),{now:2_900});
  const value=envelope(started.run,{attemptId:'attempt-assistance-mode',receiptId:'receipt-assistance-mode',status:'completed',at:2_950});
  const wrongTrace=completeAssistanceTrace(createAssistanceTrace({id:'trace:wrong-mode',collector:'other-session'}));
  const wrongAttempt=createAttempt({...value.attempt,assistance:wrongTrace});
  const wrong={...value,attempt:wrongAttempt,receipt:createReceipt({...value.receipt,attempt:wrongAttempt,attemptDigest:null})};
  await assert.rejects(runner.recordTodayReceipt(started.run.id,wrong,{status:'completed',now:2_960}),error=>error.code==='TODAY_ASSISTANCE_COLLECTION_MODE_MISMATCH');
  assert.equal((await v10.getV10Record(V10_STORES.todayRuns,started.run.id)).status,'active');
});

test('simultaneous starts elect one owner and an expired lease is atomically taken over',async()=>{
  const planned=activity('li-00-two-tabs');
  const settled=await Promise.allSettled([
    runner.startTodayRun(planned,{tabId:'tab-one',now:3_000,leaseMs:5_000}),
    runner.startTodayRun(planned,{tabId:'tab-two',now:3_000,leaseMs:5_000})
  ]);
  assert.equal(settled.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(settled.filter(result=>result.status==='rejected')[0].reason.code,'TODAY_RUN_ACTIVE_OTHER_TAB');
  const takeover=await runner.startTodayRun(planned,{tabId:'tab-three',now:8_001,leaseMs:5_000});
  assert.equal(takeover.resumed,true);
  assert.equal(takeover.run.ownerTabId,'tab-three');
});

test('the executor observes a durably frozen binding before it can run and resume uses it',async()=>{
  const planned=activity('li-00-launch-binding');
  let observed=null;
  const unregister=runner.registerTodayExecutor('li-00-fixture',async({run})=>{
    observed=await v10.getV10Record(V10_STORES.todayRuns,run.id);
    return {started:true};
  });
  try{
    const launched=await runner.launchTodayActivity(planned,{tabId:'launch-tab',now:4_000});
    assert.equal(observed.id,launched.run.id);
    assert.equal(observed.frozenBinding.digest,launched.run.frozenBinding.digest);
    const resumed=await runner.resumeTodayRun(launched.run.id,{tabId:'launch-tab',now:4_100});
    assert.equal(resumed.run.frozenBinding.digest,launched.run.frozenBinding.digest);
  }finally{unregister();}
});

test('resume without an activity uses the exact persisted rich Frozen binding and caller activity is collision-only',async()=>{
  const planned=richActivity('li-00-rich-resume');
  const started=await runner.startTodayRun(planned,{tabId:'rich-tab',now:4_500});
  assert.equal(started.run.frozenBinding.evidencePolicy.version.value,EVIDENCE_POLICY_VERSION);
  assert.equal(started.run.frozenBinding.evaluation.marker,'applicable');
  await v10.reopenV10Database();
  const resumed=await runner.resumeTodayRun(started.run.id,{tabId:'rich-tab',now:4_600});
  assert.deepEqual(resumed.run.frozenBinding,started.run.frozenBinding);
  await assert.rejects(
    runner.resumeTodayRun(started.run.id,{activity:{...planned,launch:{...planned.launch,promptRevision:'prompt-stale'}},tabId:'rich-tab',now:4_700}),
    error=>error.code==='TODAY_RUN_BINDING_COLLISION'
  );
});

test('all terminal statuses are non-resumable and retain a normalized recomputed decision',async()=>{
  for(const [index,status] of ['completed','failed','skipped','cancelled','abstained'].entries()){
    const started=await runner.startTodayRun(activity(`li-00-terminal-${status}`),{now:5_000+index*100});
    const value=envelope(started.run,{attemptId:`attempt-${status}`,receiptId:`receipt-${status}`,status,at:5_050+index*100});
    const terminal=await runner.recordTodayReceipt(started.run.id,{...value,decision:{eligible:true,forged:true}},{status,now:5_060+index*100}).catch(error=>error);
    assert.equal(terminal.code,'TODAY_EVIDENCE_DECISION_MISMATCH');
    const stored=await runner.recordTodayReceipt(started.run.id,value,{status,now:5_070+index*100});
    assert.equal(stored.status,status);
    assert.equal(stored.evidenceDecision.receiptId,`receipt-${status}`);
    const resumed=await runner.resumeTodayRun(started.run.id,{now:5_080+index*100});
    assert.equal(resumed.terminal,true);
  }
});

test('same terminal payload replays idempotently while identity and outcome conflicts are durable diagnostics',async()=>{
  const started=await runner.startTodayRun(activity('li-00-collisions'),{now:6_000});
  const first=envelope(started.run,{attemptId:'attempt-collision',receiptId:'receipt-collision',status:'completed',at:6_050});
  const winner=await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:6_060});
  const replay=await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:6_070});
  assert.equal(replay.terminal.digest,winner.terminal.digest);
  const alteredAttempt=createAttempt({...first.attempt,result:'again'});
  const altered={...first,attempt:alteredAttempt,receipt:createReceipt({...first.receipt,attempt:alteredAttempt,attemptDigest:null})};
  await assert.rejects(runner.recordTodayReceipt(started.run.id,altered,{status:'completed',now:6_080}),error=>error.code==='TODAY_RUN_TERMINAL_IDENTITY_COLLISION');
  const different=envelope(started.run,{attemptId:'attempt-conflict',receiptId:'receipt-conflict',status:'failed',at:6_090});
  await assert.rejects(runner.recordTodayReceipt(started.run.id,different,{status:'failed',now:6_100}),error=>error.code==='TODAY_RUN_TERMINAL_CONFLICT');
  const stored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(stored.receiptId,'receipt-collision');
  assert.equal(stored.collisionDiagnostics.length,2);
  assert.deepEqual(stored.collisionDiagnostics.map(item=>item.reason).sort(),['TODAY_RUN_TERMINAL_CONFLICT','TODAY_RUN_TERMINAL_IDENTITY_COLLISION']);
});

test('concurrent incompatible terminal writers preserve exactly one winner',async()=>{
  const started=await runner.startTodayRun(activity('li-00-terminal-race'),{now:7_000});
  const completed=envelope(started.run,{attemptId:'attempt-race-a',receiptId:'receipt-race-a',status:'completed',at:7_050});
  const failed=envelope(started.run,{attemptId:'attempt-race-b',receiptId:'receipt-race-b',status:'failed',at:7_050});
  const settled=await Promise.allSettled([
    runner.recordTodayReceipt(started.run.id,completed,{status:'completed',now:7_060}),
    runner.recordTodayReceipt(started.run.id,failed,{status:'failed',now:7_060})
  ]);
  assert.equal(settled.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(settled.filter(result=>result.status==='rejected')[0].reason.code,'TODAY_RUN_TERMINAL_CONFLICT');
  const stored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.ok(['receipt-race-a','receipt-race-b'].includes(stored.receiptId));
  assert.equal(stored.collisionDiagnostics.length,1);
  assert.equal(settled.filter(result=>result.status==='fulfilled').length,1,'exactly one terminal callback fulfills');
  assert.equal(settled.filter(result=>result.status==='rejected').length,1,'exactly one terminal callback rejects');
  assert.equal([stored.terminal].filter(Boolean).length,1,'exactly one durable terminal winner exists');
  const projections=(await (await import('../src/persistence.js')).listLearningProjections()).filter(row=>['receipt-race-a','receipt-race-b'].includes(row.receiptId));
  assert.equal(projections.length,1,'exactly one canonical durable effect exists');
});

test('an alternate valid Frozen binding is rejected before terminal or canonical mutation',async()=>{
  const started=await runner.startTodayRun(richActivity('li-00-alternate-binding'),{now:7_500});
  const value=envelope(started.run,{attemptId:'attempt-alternate',receiptId:'receipt-alternate',status:'completed',at:7_550});
  const alternate=createFrozenRunBinding({...started.run.frozenBinding,launch:{...started.run.frozenBinding.launch,promptRevision:{state:'bound',value:'different-prompt'}}});
  const alternateRun=createRun({...started.run.canonicalRun,frozenBinding:alternate});
  await assert.rejects(
    runner.recordTodayReceipt(started.run.id,{...value,run:alternateRun},{status:'completed',now:7_560}),
    error=>error.code==='TODAY_RECEIPT_FROZEN_BINDING_MISMATCH'
  );
  const stored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(stored.status,'active');
  const projections=(await (await import('../src/persistence.js')).listLearningProjections()).filter(row=>row.receiptId==='receipt-alternate');
  assert.equal(projections.length,0);
});

test('a preflight envelope cannot settle after an internally valid replacement Frozen binding wins the write queue',async()=>{
  const started=await runner.startTodayRun(richActivity('li-00-settlement-toctou'),{now:7_600});
  const value=envelope(started.run,{attemptId:'attempt-settlement-toctou-a',receiptId:'receipt-settlement-toctou-a',status:'completed',at:7_650});
  const alternate=createFrozenRunBinding({...started.run.frozenBinding,launch:{...started.run.frozenBinding.launch,promptRevision:{state:'bound',value:'replacement-prompt'}}});
  const replacement={...started.run,frozenBinding:alternate,canonicalRun:createRun({...started.run.canonicalRun,frozenBinding:alternate})};
  const {settling}=await withExclusiveStorageLock(async restoreToken=>{
    const settling=runner.recordTodayReceipt(started.run.id,value,{status:'completed',now:7_660});
    await v10.putV10Record(V10_STORES.todayRuns,replacement,'li-00-settlement-toctou-replacement',{restoreToken});
    return {settling};
  });
  await assert.rejects(settling,error=>error.code==='TODAY_RECEIPT_FROZEN_BINDING_MISMATCH');
  const stored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(stored.status,'active');
  assert.equal(stored.frozenBinding.digest,alternate.digest);
  assert.equal(stored.terminal,undefined);
  const projections=(await (await import('../src/persistence.js')).listLearningProjections()).filter(row=>row.receiptId==='receipt-settlement-toctou-a');
  assert.equal(projections.length,0);
});

test('unsupported stored EvidencePolicy binding fails closed before it can settle',async()=>{
  const started=await runner.startTodayRun(richActivity('li-00-unsupported-policy'),{now:7_700});
  const unsupported=createFrozenRunBinding({...started.run.frozenBinding,evidencePolicy:{...started.run.frozenBinding.evidencePolicy,version:{state:'bound',value:'unsupported-policy'}}});
  const row={...started.run,frozenBinding:unsupported,canonicalRun:createRun({...started.run.canonicalRun,frozenBinding:unsupported})};
  await v10.putV10Record(V10_STORES.todayRuns,row,'li-00-unsupported-policy-fixture');
  const value=envelope(row,{attemptId:'attempt-unsupported-policy',receiptId:'receipt-unsupported-policy',status:'completed',at:7_750});
  await assert.rejects(runner.recordTodayReceipt(row.id,value,{status:'completed',now:7_760}),error=>error.code==='TODAY_EVIDENCE_POLICY_VERSION_UNSUPPORTED');
  const stored=await v10.getV10Record(V10_STORES.todayRuns,row.id);
  assert.equal(stored.status,'active');
  assert.equal((await (await import('../src/persistence.js')).listLearningProjections()).filter(item=>item.receiptId==='receipt-unsupported-policy').length,0);
});

test('late handler resolve or rejection only merges metadata and cannot resurrect an active run',async()=>{
  let resolveHandler;
  const delayed=new Promise(resolve=>{resolveHandler=resolve;});
  const unregister=runner.registerTodayExecutor('li-00-fixture',async()=>delayed);
  try{
    const planned=activity('li-00-late-handler');
    const launching=runner.launchTodayActivity(planned,{now:8_000});
    const started=await new Promise(resolve=>setTimeout(async()=>resolve(await v10.getV10Record(V10_STORES.todayRuns,'today-run:li-00-late-handler')),0));
    await runner.skipTodayRun(started.id,{now:8_050});
    resolveHandler({started:true});
    await launching;
    const resolved=await v10.getV10Record(V10_STORES.todayRuns,started.id);
    assert.equal(resolved.status,'skipped');
    assert.equal(resolved.receiptId,`today-receipt:${started.id}:skipped`);
  }finally{unregister();}
});

test('a late executor rejection preserves the terminal winner and only records launch metadata',async()=>{
  let rejectHandler;
  const delayed=new Promise((resolve,reject)=>{rejectHandler=reject;});
  const unregister=runner.registerTodayExecutor('li-00-fixture',async()=>delayed);
  try{
    const launching=runner.launchTodayActivity(activity('li-00-late-reject'),{now:8_300});
    const started=await new Promise(resolve=>setTimeout(async()=>resolve(await v10.getV10Record(V10_STORES.todayRuns,'today-run:li-00-late-reject')),0));
    await runner.cancelTodayRun(started.id,{now:8_350});
    rejectHandler(Object.assign(new Error('late executor failure'),{code:'LATE_EXECUTOR_FAILURE'}));
    await assert.rejects(launching,error=>error.code==='LATE_EXECUTOR_FAILURE');
    const stored=await v10.getV10Record(V10_STORES.todayRuns,started.id);
    assert.equal(stored.status,'cancelled');
    assert.equal(stored.receiptId,`today-receipt:${started.id}:cancelled`);
    assert.equal(stored.lastLaunchError.code,'LATE_EXECUTOR_FAILURE');
  }finally{unregister();}
});

test('winner remains pending after canonical persistence failure and an identical retry completes it',async()=>{
  const started=await runner.startTodayRun(activity('li-00-pending-retry'),{now:9_000});
  const value=envelope(started.run,{attemptId:'attempt-pending',receiptId:'receipt-pending',status:'completed',at:9_050});
  const originalIndexedDb=globalThis.indexedDB;
  globalThis.indexedDB=undefined;
  try{
    await assert.rejects(runner.recordTodayReceipt(started.run.id,value,{status:'completed',now:9_060}),error=>error.code==='TODAY_CANONICAL_PERSISTENCE_PENDING');
  }finally{globalThis.indexedDB=originalIndexedDb;}
  const pending=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(pending.terminal.canonicalPersistence.state,'pending');
  const recovered=await runner.recordTodayReceipt(started.run.id,value,{status:'completed',now:9_070});
  assert.equal(recovered.terminal.canonicalPersistence.state,'completed');
  const projection=(await (await import('../src/persistence.js')).listLearningProjections()).filter(row=>row.receiptId==='receipt-pending');
  assert.equal(projection.length,1);
});

test('changed target, source, prompt, evaluation, and policy bindings fail closed',async()=>{
  const variants=[
    ['target',planned=>({...planned,target:{...target,cardId:'other-card'},activitySpec:{...planned.activitySpec,target:{...target,cardId:'other-card'}}})],
    ['sourceRevision',planned=>({...planned,target:{...target,sourceRevision:'li-00-r2'},activitySpec:{...planned.activitySpec,target:{...target,sourceRevision:'li-00-r2'}}})],
    ['prompt',planned=>({...planned,launch:{promptRevision:'prompt-changed'}})],
    ['evaluation',planned=>({...planned,evaluationBinding:{applicable:true,revision:'eval-r2'}})],
    ['policy',planned=>({...planned,activitySpec:{...planned.activitySpec,policyVersion:'policy-r2'}})]
  ];
  for(const [label,change] of variants){
    const planned=activity(`li-00-change-${label}`);
    await runner.startTodayRun(planned,{now:10_000});
    const replacement=change(planned);
    await assert.rejects(runner.startTodayRun(replacement,{now:10_100}),error=>error.code==='TODAY_RUN_BINDING_COLLISION');
  }
});

test('legacy active rows without a provable binding and unknown binding fields are unexecutable',async()=>{
  const id='today-run:li-00-legacy';
  const planned=activity('li-00-legacy');
  await v10.putV10Record(V10_STORES.todayRuns,{id,activityId:planned.id,activitySpec:planned.activitySpec,activitySpecDigest:'legacy',canonicalRun:{id,status:'active'},status:'active',ownerTabId:'old',leaseUntil:99_999,updatedAt:11_000},'li-00-legacy-fixture');
  await assert.rejects(runner.resumeTodayRun(id,{now:11_001}),error=>error.code==='TODAY_RUN_FROZEN_BINDING_MISSING');
  const started=await runner.startTodayRun(activity('li-00-future-field'),{now:11_100});
  assert.equal(validateFrozenRunBinding({...started.run.frozenBinding,futureField:true}).valid,false);
});

test('Core and a non-Core executor adapter remain runnable without introducing a second runtime',async()=>{
  const nonCore=activity('li-00-non-core');
  nonCore.execution={kind:'ielts-fixture',status:'ready'};
  nonCore.activitySpec={...nonCore.activitySpec,executor:'ielts-fixture'};
  let calls=0;
  const unregister=runner.registerTodayExecutor('ielts-fixture',async()=>{calls+=1;return{started:true};});
  try{
    const launched=await runner.launchTodayActivity(nonCore,{now:12_000});
    assert.equal(launched.started,true);
    assert.equal(calls,1);
    const core=await runner.startTodayRun(activity('li-00-core-compatible'),{now:12_100});
    const skipped=await runner.skipTodayRun(core.run.id,{now:12_110});
    assert.equal(skipped.status,'skipped');
  }finally{unregister();}
});

test('backup restore reopen reproduces the frozen winner and collision diagnostics',async()=>{
  const backupApi=await import('../src/ielts-backup.js');
  const started=await runner.startTodayRun(activity('li-00-backup'),{now:13_000});
  const first=envelope(started.run,{attemptId:'attempt-backup',receiptId:'receipt-backup',status:'completed',at:13_050});
  await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:13_060});
  const conflict=envelope(started.run,{attemptId:'attempt-backup-conflict',receiptId:'receipt-backup-conflict',status:'failed',at:13_070});
  await assert.rejects(runner.recordTodayReceipt(started.run.id,conflict,{status:'failed',now:13_080}),error=>error.code==='TODAY_RUN_TERMINAL_CONFLICT');
  const backup=await backupApi.buildCombinedBackup();
  await backupApi.restoreCombinedBackup(backup);
  await v10.reopenV10Database();
  const restored=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(restored.frozenBinding.digest,started.run.frozenBinding.digest);
  assert.equal(restored.terminal.receiptId,'receipt-backup');
  assert.equal(restored.terminal.canonicalPersistence.state,'completed');
  assert.equal(restored.collisionDiagnostics.length,1);
  assert.deepEqual(restored.evidenceDecision,decideEvidence({attempt:restored.envelope.attempt,activity:restored.envelope.activitySpec,verification:restored.envelope.verification}));
});
