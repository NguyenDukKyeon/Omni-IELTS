import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
const { V10_STORES }=await import('../src/v10-contracts.js');
const v10=await import('../src/v10-persistence.js');
const reconciler=await import('../src/cross-db-reconciler.js');

test('crash after every cross-DB action retries idempotently and completes once',async()=>{
  await v10.clearV10Store(V10_STORES.workflowIntents,'test-reset');
  for(const crashStep of ['core-card','v10-occurrence','ielts-error']){
    const effects=new Set();
    const calls=new Map();
    const stepIds=['core-card','v10-occurrence','ielts-error'];
    const handlers=Object.fromEntries(stepIds.map(stepId=>[stepId,async()=>{
      calls.set(stepId,Number(calls.get(stepId)||0)+1);
      effects.add(stepId);
      return{context:{[stepId]:true}};
    }]));
    const input={id:`intent-crash-${crashStep}`,kind:'fixture',stepIds,payload:{entityId:'entity-1',crashStep}};
    let crashed=false;
    await assert.rejects(
      reconciler.executeCrossDbIntent(input,{
        handlers,
        hooks:{afterAction:({stepId})=>{if(!crashed&&stepId===crashStep){crashed=true;throw Object.assign(new Error('simulated process crash'),{code:'SIMULATED_PROCESS_CRASH'});}}}
      }),
      error=>error.code==='SIMULATED_PROCESS_CRASH'
    );
    const completed=await reconciler.executeCrossDbIntent(input,{handlers});
    assert.equal(completed.status,'completed');
    assert.deepEqual(effects,new Set(stepIds));
    assert.equal(calls.get(crashStep),2);
    for(const stepId of stepIds)assert.equal(completed.steps.find(step=>step.id===stepId).status,'completed');
  }
});

test('duplicate execution and reload reconciliation never duplicate a completed workflow',async()=>{
  await v10.clearV10Store(V10_STORES.workflowIntents,'test-reset');
  let mutations=0;
  const input={id:'intent-idempotent',kind:'fixture',stepIds:['merge'],payload:{keep:'a',remove:'b'}};
  const handlers={merge:async()=>{mutations+=1;return{context:{merged:true}};}};
  const first=await reconciler.executeCrossDbIntent(input,{handlers});
  const duplicate=await reconciler.executeCrossDbIntent(input,{handlers});
  const replay=await reconciler.reconcileCrossDbIntents({handlersByKind:{fixture:handlers}});
  assert.equal(first.status,'completed');
  assert.equal(duplicate.status,'completed');
  assert.equal(mutations,1);
  assert.deepEqual(replay,{found:0,completed:0,pending:0,quarantined:0,errors:[]});
});

test('intent collisions fail closed and poison records become actionable quarantine',async()=>{
  await v10.clearV10Store(V10_STORES.workflowIntents,'test-reset');
  const base={id:'intent-collision',kind:'fixture',stepIds:['write'],payload:{value:1}};
  await reconciler.createCrossDbIntent(base);
  await assert.rejects(
    reconciler.createCrossDbIntent({...base,payload:{value:2}}),
    error=>error.code==='CROSS_DB_INTENT_COLLISION'
  );

  const poison=Object.assign(new Error('malformed target'),{code:'CROSS_DB_POISON_TARGET',poison:true});
  await assert.rejects(
    reconciler.executeCrossDbIntent({id:'intent-poison',kind:'fixture',stepIds:['write'],payload:{value:3}},{handlers:{write:async()=>{throw poison;}}}),
    error=>error.code==='CROSS_DB_POISON_TARGET'
  );
  const quarantined=(await reconciler.listCrossDbIntents({status:'quarantined'}))[0];
  assert.equal(quarantined.id,'intent-poison');
  assert.equal(quarantined.steps[0].lastError.code,'CROSS_DB_POISON_TARGET');
});

test('reconciler reports an unavailable workflow handler without hiding the pending intent',async()=>{
  await v10.clearV10Store(V10_STORES.workflowIntents,'test-reset');
  await reconciler.createCrossDbIntent({id:'intent-orphan-handler',kind:'unknown-workflow',stepIds:['write'],payload:{value:1}});
  const result=await reconciler.reconcileCrossDbIntents({handlersByKind:{}});
  assert.equal(result.pending,1);
  assert.deepEqual(result.errors,[{intentId:'intent-orphan-handler',code:'CROSS_DB_HANDLER_MISSING'}]);
  assert.equal((await reconciler.listCrossDbIntents({status:'pending'})).length,1);
});
