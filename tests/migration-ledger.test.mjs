import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import {
  MIGRATION_LEDGER_PREFIX,
  defineMigration,
  getDatabaseAccess,
  listMigrationLedger,
  migrationLedgerKey,
  openForwardCompatibleDatabase
} from '../src/migration-ledger.js';

const openNative=(factory,name,version,upgrade)=>new Promise((resolve,reject)=>{
  const request=factory.open(name,version);
  request.onupgradeneeded=event=>upgrade?.(request.result,request.transaction,event);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
});

function createMetaStore(database){
  if(!database.objectStoreNames.contains('meta'))database.createObjectStore('meta',{keyPath:'key'});
}

test('Core, IELTS and V10 adopt one durable migration ledger entry and double-open is idempotent',async()=>{
  const originalIndexedDb=globalThis.indexedDB;
  const factory=new IDBFactory();
  globalThis.indexedDB=factory;
  try{
    const stamp=Date.now();
    const core=await import(`../src/persistence.js?p1-ledger-core=${stamp}`);
    const ielts=await import(`../src/ielts-persistence.js?p1-ledger-ielts=${stamp}`);
    const v10=await import(`../src/v10-persistence.js?p1-ledger-v10=${stamp}`);
    const databases=await Promise.all([core.openDatabase(),ielts.openIeltsDatabase(),v10.openV10Database()]);
    const ledgers=await Promise.all([
      listMigrationLedger(databases[0],core.STORE_NAMES.meta),
      listMigrationLedger(databases[1],(await import('../src/ielts-domain.js')).IELTS_STORE_NAMES.settings),
      listMigrationLedger(databases[2],(await import('../src/v10-contracts.js')).V10_STORES.meta)
    ]);
    assert.deepEqual(ledgers.map(rows=>rows.map(row=>row.migrationId)),[
      ['p1-00-core-opener-v1','p1-02-core-learning-events-v5'],
      ['p1-00-ielts-opener-v1'],
      ['p1-00-v10-opener-v1','p1-03-v10-workflow-intents-v2','p1-05-v10-transcript-aggregate-v3','p1-06-v10-global-errors-v4','p1-08-v10-today-runs-v5']
    ]);
    const appliedAt=ledgers.map(rows=>rows[0].appliedAt);
    databases.forEach(database=>database.close());
    const reopened=await Promise.all([core.reopenCoreDatabase(),ielts.reopenIeltsDatabase(),v10.reopenV10Database()]);
    const second=await Promise.all([
      listMigrationLedger(reopened[0],core.STORE_NAMES.meta),
      listMigrationLedger(reopened[1],(await import('../src/ielts-domain.js')).IELTS_STORE_NAMES.settings),
      listMigrationLedger(reopened[2],(await import('../src/v10-contracts.js')).V10_STORES.meta)
    ]);
    assert.deepEqual(second.map(rows=>rows.length),[2,1,5]);
    assert.deepEqual(second.map(rows=>rows[0].appliedAt),appliedAt);
    reopened.forEach(database=>database.close());
  }finally{
    globalThis.indexedDB=originalIndexedDb;
  }
});

test('upgrade migration and ledger commit atomically, then retry safely after interruption',async()=>{
  const originalIndexedDb=globalThis.indexedDB;
  const factory=new IDBFactory();
  globalThis.indexedDB=factory;
  const name=`p1-upgrade-${Date.now()}`;
  try{
    (await openNative(factory,name,1,database=>createMetaStore(database))).close();
    const interrupted=defineMigration({
      id:'fixture-add-records-v2',
      digest:'fixture-records-v2',
      targetVersion:2,
      mode:'upgrade',
      apply:({database})=>{
        database.createObjectStore('records',{keyPath:'id'});
        throw Object.assign(new Error('simulated interrupted upgrade'),{code:'SIMULATED_UPGRADE_INTERRUPTION'});
      }
    });
    await assert.rejects(()=>openForwardCompatibleDatabase({
      name,
      version:2,
      requiredStores:['meta','records'],
      ledgerStore:'meta',
      migrations:[interrupted],
      upgrade:({database})=>createMetaStore(database)
    }),error=>error.code==='SIMULATED_UPGRADE_INTERRUPTION');
    const afterAbort=await openNative(factory,name,1);
    assert.equal(afterAbort.objectStoreNames.contains('records'),false);
    assert.equal(await new Promise((resolve,reject)=>{
      const request=afterAbort.transaction('meta','readonly').objectStore('meta').get(migrationLedgerKey(interrupted.id));
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    }),undefined);
    afterAbort.close();

    const retry=defineMigration({
      id:interrupted.id,
      digest:interrupted.digest,
      targetVersion:2,
      mode:'upgrade',
      apply:({database})=>database.createObjectStore('records',{keyPath:'id'})
    });
    const upgraded=await openForwardCompatibleDatabase({
      name,
      version:2,
      requiredStores:['meta','records'],
      ledgerStore:'meta',
      migrations:[retry],
      upgrade:({database})=>createMetaStore(database)
    });
    const ledger=await listMigrationLedger(upgraded,'meta');
    assert.equal(upgraded.version,2);
    assert.equal(ledger.length,1);
    assert.equal(ledger[0].mode,'upgrade');
    assert.equal(ledger[0].digest,retry.digest);
    upgraded.close();

    const second=await openForwardCompatibleDatabase({
      name,
      version:2,
      requiredStores:['meta','records'],
      ledgerStore:'meta',
      migrations:[retry],
      upgrade:({database})=>createMetaStore(database)
    });
    assert.equal((await listMigrationLedger(second,'meta')).length,1);
    second.close();
  }finally{
    globalThis.indexedDB=originalIndexedDb;
  }
});

test('future database opens through a read-safe compatibility handle and rejects writes',async()=>{
  const originalIndexedDb=globalThis.indexedDB;
  const factory=new IDBFactory();
  globalThis.indexedDB=factory;
  const name=`p1-future-${Date.now()}`;
  try{
    const current=await openNative(factory,name,1,database=>{
      createMetaStore(database);
      database.createObjectStore('records',{keyPath:'id'});
    });
    const seedTransaction=current.transaction('records','readwrite');
    seedTransaction.objectStore('records').put({id:'safe-read',value:1});
    await new Promise((resolve,reject)=>{
      seedTransaction.oncomplete=resolve;
      seedTransaction.onerror=()=>reject(seedTransaction.error);
      seedTransaction.onabort=()=>reject(seedTransaction.error);
    });
    current.close();
    const future=await openNative(factory,name,2,database=>database.createObjectStore('futureRecords',{keyPath:'id'}));
    future.close();

    const compatible=await openForwardCompatibleDatabase({
      name,
      version:1,
      requiredStores:['meta','records'],
      ledgerStore:'meta',
      migrations:[],
      upgrade:()=>{}
    });
    assert.deepEqual(getDatabaseAccess(compatible),{mode:'read-safe',actualVersion:2,supportedVersion:1});
    const row=await new Promise((resolve,reject)=>{
      const request=compatible.transaction('records','readonly').objectStore('records').get('safe-read');
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    assert.equal(row.value,1);
    assert.throws(()=>compatible.transaction('records','readwrite'),error=>error.code==='DATABASE_READ_ONLY_FUTURE_SCHEMA'&&error.readOnly===true);
    compatible.close();
  }finally{
    globalThis.indexedDB=originalIndexedDb;
  }
});

test('unknown current stores and changed migration digests fail closed with recovery metadata',async()=>{
  const originalIndexedDb=globalThis.indexedDB;
  const factory=new IDBFactory();
  globalThis.indexedDB=factory;
  try{
    const unknownName=`p1-unknown-${Date.now()}`;
    (await openNative(factory,unknownName,1,database=>{
      createMetaStore(database);
      database.createObjectStore('unexpected',{keyPath:'id'});
    })).close();
    await assert.rejects(()=>openForwardCompatibleDatabase({
      name:unknownName,
      version:1,
      requiredStores:['meta'],
      ledgerStore:'meta',
      migrations:[],
      upgrade:()=>{}
    }),error=>error.code==='DATABASE_UNKNOWN_STORE'&&error.recovery==='use-compatible-build');

    const digestName=`p1-digest-${Date.now()}`;
    const migration=defineMigration({id:'fixture-adopt-v1',digest:'fixture-digest-a',targetVersion:1});
    const adopted=await openForwardCompatibleDatabase({
      name:digestName,
      version:1,
      requiredStores:['meta'],
      ledgerStore:'meta',
      migrations:[migration],
      upgrade:({database})=>createMetaStore(database)
    });
    const transaction=adopted.transaction('meta','readwrite');
    const row=await new Promise((resolve,reject)=>{
      const request=transaction.objectStore('meta').get(migrationLedgerKey(migration.id));
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    transaction.objectStore('meta').put({...row,digest:'tampered'});
    await new Promise((resolve,reject)=>{
      transaction.oncomplete=resolve;
      transaction.onerror=()=>reject(transaction.error);
      transaction.onabort=()=>reject(transaction.error);
    });
    adopted.close();
    await assert.rejects(()=>openForwardCompatibleDatabase({
      name:digestName,
      version:1,
      requiredStores:['meta'],
      ledgerStore:'meta',
      migrations:[migration],
      upgrade:({database})=>createMetaStore(database)
    }),error=>error.code==='MIGRATION_LEDGER_DIGEST_MISMATCH'&&error.expectedDigest===migration.digest);
  }finally{
    globalThis.indexedDB=originalIndexedDb;
  }
});

test('ledger keys stay in the durable metadata namespace',()=>{
  assert.equal(migrationLedgerKey('p1-00-core-opener-v1'),`${MIGRATION_LEDGER_PREFIX}p1-00-core-opener-v1`);
});
