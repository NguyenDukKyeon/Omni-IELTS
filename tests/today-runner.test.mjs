import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { composeTodayPlan } from '../src/today-composer.js';

globalThis.indexedDB=new IDBFactory();
const runner=await import('../src/today-runner.js');
const persistence=await import('../src/persistence.js');

const target=(revision='revision-1')=>({cardId:'card-runner',senseId:'sense-runner',skill:'recall',sourceId:'core-card:card-runner',sourceRevision:revision});
function activity(id='runner-activity',revision='revision-1'){
  const plan=composeTodayPlan({
    dueReviews:[{id,type:'typing',target:target(revision),executor:'fixture',estimatedSeconds:60}],
    now:1_000,
    minutes:5
  });
  return{...plan.activities[0],execution:{kind:'fixture',status:'ready'},launchBinding:`binding:${id}:${revision}`};
}

test('executor registry launches and reload resumes one durable run without a new attempt',async()=>{
  let launches=0;
  runner.registerTodayExecutor('fixture',async({run,resumed})=>{launches+=1;return{started:true,runId:run.id,resumed};});
  const planned=activity('runner-resume');
  const first=await runner.launchTodayActivity(planned,{tabId:'tab-a',now:1_000,leaseMs:10_000});
  const resumed=await runner.launchTodayActivity(planned,{tabId:'tab-a',now:1_100,leaseMs:10_000});
  const afterReload=await runner.resumeTodayRun(first.run.id,{tabId:'tab-a',now:1_200});
  assert.equal(first.run.id,resumed.run.id);
  assert.equal(afterReload.run.id,first.run.id);
  assert.equal(first.resumed,false);
  assert.equal(resumed.resumed,true);
  assert.equal(afterReload.run.attemptId,null);
  assert.equal(launches,2);
  assert.ok(runner.listTodayExecutors().includes('fixture'));
});

test('an unexpired run is fenced from another tab',async()=>{
  const planned=activity('runner-multitab');
  await runner.startTodayRun(planned,{tabId:'tab-owner',now:2_000,leaseMs:10_000});
  await assert.rejects(
    runner.startTodayRun(planned,{tabId:'tab-other',now:2_100,leaseMs:10_000}),
    error=>error.code==='TODAY_RUN_ACTIVE_OTHER_TAB'
  );
  const takenOver=await runner.startTodayRun(planned,{tabId:'tab-other',now:12_001,leaseMs:10_000});
  assert.equal(takenOver.resumed,true);
  assert.equal(takenOver.run.ownerTabId,'tab-other');
});

test('skip emits one canonical receipt with an exact target and remains idempotent',async()=>{
  const planned=activity('runner-skip');
  const started=await runner.startTodayRun(planned,{tabId:'tab-skip',now:3_000});
  const skipped=await runner.skipTodayRun(started.run.id,{now:3_100});
  const duplicate=await runner.skipTodayRun(started.run.id,{now:3_200});
  assert.equal(skipped.status,'skipped');
  assert.equal(duplicate.receiptId,skipped.receiptId);
  assert.deepEqual(skipped.envelope.receipt.target,planned.activitySpec.target);
  assert.equal(skipped.envelope.attempt.id,skipped.attemptId);
  const canonical=(await persistence.listLearningProjections()).find(row=>row.receiptId===skipped.receiptId);
  assert.ok(canonical);
  assert.equal(canonical.attemptId,skipped.attemptId);
});

test('stale target, changed binding and missing executor fail closed',async()=>{
  const planned=activity('runner-stale');
  await runner.startTodayRun(planned,{tabId:'tab-stale',now:4_000});
  await assert.rejects(
    runner.startTodayRun(activity('runner-stale','revision-2'),{tabId:'tab-stale',now:4_100}),
    error=>error.code==='TODAY_RUN_BINDING_COLLISION'
  );
  const unregistered={...activity('runner-unregistered'),execution:{kind:'missing-executor',status:'ready'},activitySpec:{...activity('runner-unregistered').activitySpec,executor:'missing-executor'}};
  await assert.rejects(runner.launchTodayActivity(unregistered,{tabId:'tab-missing',now:5_000}),error=>error.code==='TODAY_EXECUTOR_UNREGISTERED');
});
