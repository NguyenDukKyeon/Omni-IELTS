import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { decideEvidence } from '../src/evidence-policy.js';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { buildLearningEventRecords } from '../src/event-repository.js';

const originalIndexedDb=globalThis.indexedDB;
globalThis.indexedDB=new IDBFactory();
const persistence=await import(`../src/persistence.js?p1-events=${Date.now()}`);

const transactionDone=transaction=>new Promise((resolve,reject)=>{
  transaction.oncomplete=()=>resolve();
  transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));
  transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));
});

async function resetLearningStores(){
  const database=await persistence.openDatabase();
  const stores=[
    persistence.STORE_NAMES.learningEvents,
    persistence.STORE_NAMES.learningProjections,
    persistence.STORE_NAMES.learningDeadLetters
  ];
  const transaction=database.transaction(stores,'readwrite');
  for(const store of stores)transaction.objectStore(store).clear();
  await transactionDone(transaction);
}

function canonicalEnvelope(suffix,{rating='good'}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:`card-${suffix}`,senseId:`sense-${suffix}`,front:'durable',back:'bền',type:'word'},
    rating,
    step:{id:`activity-${suffix}`,kind:'typing',skill:'recall',receiptId:`receipt-${suffix}`},
    session:{id:`session-${suffix}`,mode:'today',timezone:'UTC'},
    now:1_000
  });
  const decision=decideEvidence({
    attempt:envelope.attempt,
    activity:envelope.activitySpec,
    verification:envelope.verification
  });
  return{...envelope,decision};
}

test.after(async()=>{
  (await persistence.openDatabase()).close();
  globalThis.indexedDB=originalIndexedDb;
});

test('duplicate delivery stores one canonical envelope and one projection',{concurrency:false},async()=>{
  await resetLearningStores();
  const envelope=canonicalEnvelope('duplicate');
  const first=await persistence.persistLearningEnvelope(envelope);
  const second=await persistence.persistLearningEnvelope(envelope);
  assert.equal(first.inserted,true);
  assert.equal(first.insertedEvents,4);
  assert.equal(second.inserted,false);
  assert.equal(second.insertedEvents,0);
  assert.equal((await persistence.listLearningEvents()).length,4);
  assert.equal((await persistence.listLearningProjections()).length,1);
});

test('same event ID with changed attempt payload is rejected as a collision',{concurrency:false},async()=>{
  await resetLearningStores();
  await persistence.persistLearningEnvelope(canonicalEnvelope('collision'));
  await assert.rejects(
    persistence.persistLearningEnvelope(canonicalEnvelope('collision',{rating:'hard'})),
    error=>error.code==='LEARNING_EVENT_COLLISION'
  );
  assert.equal((await persistence.listLearningEvents()).length,4);
});

test('crash between event append and projection aborts the whole transaction',{concurrency:false},async()=>{
  await resetLearningStores();
  await assert.rejects(
    persistence.persistLearningEnvelope(canonicalEnvelope('crash'),{
      hooks:{afterEvents:()=>{throw Object.assign(new Error('simulated crash'),{code:'SIMULATED_CRASH'});}}
    }),
    error=>error.code==='SIMULATED_CRASH'
  );
  assert.equal((await persistence.listLearningEvents()).length,0);
  assert.equal((await persistence.listLearningProjections()).length,0);
});

test('invalid envelopes and out-of-order receipts are quarantined durably',{concurrency:false},async()=>{
  await resetLearningStores();
  const invalid=canonicalEnvelope('invalid');
  const quarantined=await persistence.persistLearningEnvelope({...invalid,activitySpec:{...invalid.activitySpec,target:null}});
  assert.equal(quarantined.quarantined,true);
  assert.equal((await persistence.listLearningDeadLetters()).length,1);

  const receiptOnly=buildLearningEventRecords(canonicalEnvelope('receipt-only'))[2];
  await persistence.__testing.putOne(persistence.STORE_NAMES.learningEvents,receiptOnly);
  const rebuilt=await persistence.rebuildLearningProjections();
  assert.equal(rebuilt.projections,0);
  assert.equal(rebuilt.deadLetters,1);
  assert.equal((await persistence.listLearningDeadLetters()).length,2);
});

test('projection replay is deterministic and retains stable bindings',{concurrency:false},async()=>{
  await resetLearningStores();
  await persistence.persistLearningEnvelope(canonicalEnvelope('replay-a'));
  await persistence.persistLearningEnvelope(canonicalEnvelope('replay-b'));
  const first=await persistence.rebuildLearningProjections();
  const rows=await persistence.listLearningProjections();
  const second=await persistence.rebuildLearningProjections();
  assert.equal(first.events,8);
  assert.equal(first.projections,2);
  assert.equal(second.digest,first.digest);
  assert.deepEqual(await persistence.listLearningProjections(),rows);
});
