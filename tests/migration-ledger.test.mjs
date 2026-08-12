import test from 'node:test';
import { V10_DB_NAME,V10_DB_VERSION,V10_STORES } from '../src/v10-contracts.js';
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
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';

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
      ['p1-00-ielts-opener-v1','wave4-ielts-profile-inventory-v2','wave5-productive-text-artifacts-v3'],
      ['p1-00-v10-opener-v1','p1-03-v10-workflow-intents-v2','p1-05-v10-transcript-aggregate-v3','p1-06-v10-global-errors-v4','p1-08-v10-today-runs-v5','p2-01-v10-resolver-jobs-v6','p4-00-v10-content-platform-v7','wave5-private-source-library-v8']
    ]);
    assert.deepEqual(ledgers[1].map(row=>({migrationId:row.migrationId,targetVersion:row.targetVersion,digest:row.digest,mode:row.mode})),[
      {migrationId:'p1-00-ielts-opener-v1',targetVersion:1,digest:'ielts-v1-stores-and-indexes:2026-07-30',mode:'adopt'},
      {migrationId:'wave4-ielts-profile-inventory-v2',targetVersion:2,digest:'wave4-ielts-profile-inventory-store-v2:2026-08-10',mode:'adopt'},
      {migrationId:'wave5-productive-text-artifacts-v3',targetVersion:3,digest:'wave5-productive-text-artifacts-store-v3:2026-08-12',mode:'adopt'}
    ]);
    const appliedAt=ledgers.map(rows=>rows[0].appliedAt);
    databases.forEach(database=>database.close());
    const reopened=await Promise.all([core.reopenCoreDatabase(),ielts.reopenIeltsDatabase(),v10.reopenV10Database()]);
    const second=await Promise.all([
      listMigrationLedger(reopened[0],core.STORE_NAMES.meta),
      listMigrationLedger(reopened[1],(await import('../src/ielts-domain.js')).IELTS_STORE_NAMES.settings),
      listMigrationLedger(reopened[2],(await import('../src/v10-contracts.js')).V10_STORES.meta)
    ]);
    assert.deepEqual(second.map(rows=>rows.length),[2,3,8]);
    assert.deepEqual(second.map(rows=>rows[0].appliedAt),appliedAt);
    assert.deepEqual(second[1].map(row=>({migrationId:row.migrationId,targetVersion:row.targetVersion,digest:row.digest})),ledgers[1].map(row=>({migrationId:row.migrationId,targetVersion:row.targetVersion,digest:row.digest})));
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

test('physical IELTS v1 upgrade preserves every legacy sentinel and additively creates objective inventory and learner artifacts',async()=>{
  const originalIndexedDb=globalThis.indexedDB, factory=new IDBFactory(), name='vocab-master-ielts';
  globalThis.indexedDB=factory;
  const legacy=Object.values(IELTS_STORE_NAMES).filter(store=>![IELTS_STORE_NAMES.objectiveInventory,IELTS_STORE_NAMES.learnerArtifacts].includes(store));
  const indexed={errorRecords:[['normalizedKey',true],['status',false],['lastSeenAt',false]],lexicalSets:[['status',false],['updatedAt',false]],lexicalRelations:[['status',false],['updatedAt',false]],labItems:[['status',false],['updatedAt',false]],readingPassages:[['status',false],['updatedAt',false]],readingAttempts:[['passageId',false],['completedAt',false]],mediaSources:[['videoId',true],['updatedAt',false]],transcriptionJobs:[['mediaSourceId',false],['status',false],['cacheKey',true]],transcriptSegments:[['mediaSourceId',false],['order',false]],mediaAttempts:[['mediaSourceId',false],['segmentId',false],['completedAt',false]],mediaProgress:[['mediaSourceId',true],['updatedAt',false]],settings:[['updatedAt',false]]};
  try{
    const v1=await openNative(factory,name,1,database=>{for(const storeName of legacy){const store=database.createObjectStore(storeName,{keyPath:storeName==='settings'?'key':'id'});for(const [field,unique] of indexed[storeName])store.createIndex(field,field,{unique});}});
    const expectedSentinels=new Map(),tx=v1.transaction(legacy,'readwrite');for(const storeName of legacy){const key=storeName==='settings'?'key':'id',row={[key]:`sentinel:${storeName}`,status:'active',updatedAt:1,normalizedKey:`normalized:${storeName}`,lastSeenAt:1,passageId:'passage',completedAt:1,videoId:`video:${storeName}`,mediaSourceId:'media',cacheKey:`cache:${storeName}`,order:1,segmentId:'segment'};expectedSentinels.set(storeName,row);tx.objectStore(storeName).put(row);}tx.objectStore('settings').put({key:migrationLedgerKey('p1-00-ielts-opener-v1'),kind:'migration-ledger-entry',schemaVersion:1,migrationId:'p1-00-ielts-opener-v1',digest:'ielts-v1-stores-and-indexes:2026-07-30',targetVersion:1,mode:'adopt',status:'applied',appliedAt:1});await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});v1.close();
    const ielts=await import(`../src/ielts-persistence.js?physical-v1-v3=${Date.now()}`);const upgraded=await ielts.openIeltsDatabase();assert.equal(upgraded.version,3);assert.deepEqual([...upgraded.objectStoreNames].sort(),Object.values(IELTS_STORE_NAMES).sort());const read=upgraded.transaction(Object.values(IELTS_STORE_NAMES),'readonly');for(const storeName of legacy){const value=await new Promise((resolve,reject)=>{const request=read.objectStore(storeName).get(`sentinel:${storeName}`);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});assert.deepEqual(value,expectedSentinels.get(storeName));}const inventory=read.objectStore(IELTS_STORE_NAMES.objectiveInventory);assert.equal(inventory.keyPath,'id');assert.equal(await new Promise((resolve,reject)=>{const request=inventory.count();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}),0);for(const name of ['itemId','skill','status']){const index=inventory.index(name);assert.equal(index.keyPath,name);assert.equal(index.unique,false);}const artifacts=read.objectStore(IELTS_STORE_NAMES.learnerArtifacts);assert.equal(artifacts.keyPath,'id');for(const name of ['kind','artifactId','updatedAt']){const index=artifacts.index(name);assert.equal(index.keyPath,name);assert.equal(index.unique,false);}await new Promise((resolve,reject)=>{read.oncomplete=resolve;read.onerror=()=>reject(read.error);});const ledger=await listMigrationLedger(upgraded,IELTS_STORE_NAMES.settings);assert.deepEqual(ledger.map(row=>row.migrationId),['p1-00-ielts-opener-v1','wave4-ielts-profile-inventory-v2','wave5-productive-text-artifacts-v3']);upgraded.close();
    const reopened=await ielts.reopenIeltsDatabase();const reopenRead=reopened.transaction(legacy,'readonly');for(const storeName of legacy){const request=reopenRead.objectStore(storeName).get(`sentinel:${storeName}`);const row=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});assert.deepEqual(row,expectedSentinels.get(storeName));}assert.deepEqual(await listMigrationLedger(reopened,IELTS_STORE_NAMES.settings),ledger);reopened.close();
  }finally{globalThis.indexedDB=originalIndexedDb;}
});
test('wave5 private source migration advances V10 additively',async()=>{const originalIndexedDb=globalThis.indexedDB,factory=new IDBFactory();globalThis.indexedDB=factory;try{const legacyStores=Object.values(V10_STORES).filter(store=>store!==V10_STORES.privateSources),v7=await openNative(factory,V10_DB_NAME,7,database=>{for(const store of legacyStores)database.createObjectStore(store,{keyPath:store===V10_STORES.meta?'key':'id'});}),migrations=[['p1-00-v10-opener-v1','v10-v1-stores-and-indexes:2026-07-30',1,'adopt'],['p1-03-v10-workflow-intents-v2','v10-v2-cross-db-intents:2026-07-30',2,'upgrade'],['p1-05-v10-transcript-aggregate-v3','v10-v3-transcript-source-revision-segments:2026-07-30',3,'upgrade'],['p1-06-v10-global-errors-v4','v10-v4-global-errors-occurrences-repairs:2026-07-30',4,'upgrade'],['p1-08-v10-today-runs-v5','v10-v5-exact-today-run-resume:2026-07-30',5,'upgrade'],['p2-01-v10-resolver-jobs-v6','v10-v6-durable-resolver-jobs-events:2026-07-30',6,'upgrade'],['p4-00-v10-content-platform-v7','v10-v7-signed-catalog-pack-journal-activation-revocation:2026-07-30',7,'upgrade']],tx=v7.transaction(legacyStores,'readwrite');for(const store of legacyStores)tx.objectStore(store).put(store===V10_STORES.meta?{key:'v7-sentinel',value:true}:{id:`v7:${store}`,value:true});for(const [migrationId,digest,targetVersion,mode] of migrations)tx.objectStore(V10_STORES.meta).put({key:migrationLedgerKey(migrationId),kind:'migration-ledger-entry',schemaVersion:1,migrationId,digest,targetVersion,mode,status:'applied',appliedAt:1});await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});v7.close();const v10=await import(`../src/v10-persistence.js?physical-v7-v8=${Date.now()}`),upgraded=await v10.openV10Database();assert.equal(upgraded.version,8);assert.equal(upgraded.transaction(V10_STORES.privateSources,'readonly').objectStore(V10_STORES.privateSources).keyPath,'id');for(const store of legacyStores){const key=store===V10_STORES.meta?'v7-sentinel':`v7:${store}`,request=upgraded.transaction(store,'readonly').objectStore(store).get(key),row=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});assert.equal(row.value,true,store);}upgraded.close();}finally{globalThis.indexedDB=originalIndexedDb;}});
test('private source V7 to V8 migration creates only the exact indexes, ledger row and reopen-stable empty store',async()=>{const originalIndexedDb=globalThis.indexedDB,factory=new IDBFactory();globalThis.indexedDB=factory;try{const legacyStores=Object.values(V10_STORES).filter(store=>store!==V10_STORES.privateSources),migrations=[['p1-00-v10-opener-v1','v10-v1-stores-and-indexes:2026-07-30',1,'adopt'],['p1-03-v10-workflow-intents-v2','v10-v2-cross-db-intents:2026-07-30',2,'upgrade'],['p1-05-v10-transcript-aggregate-v3','v10-v3-transcript-source-revision-segments:2026-07-30',3,'upgrade'],['p1-06-v10-global-errors-v4','v10-v4-global-errors-occurrences-repairs:2026-07-30',4,'upgrade'],['p1-08-v10-today-runs-v5','v10-v5-exact-today-run-resume:2026-07-30',5,'upgrade'],['p2-01-v10-resolver-jobs-v6','v10-v6-durable-resolver-jobs-events:2026-07-30',6,'upgrade'],['p4-00-v10-content-platform-v7','v10-v7-signed-catalog-pack-journal-activation-revocation:2026-07-30',7,'upgrade']],v7=await openNative(factory,V10_DB_NAME,7,database=>{for(const store of legacyStores)database.createObjectStore(store,{keyPath:store===V10_STORES.meta?'key':'id'});}),tx=v7.transaction(legacyStores,'readwrite');for(const store of legacyStores)tx.objectStore(store).put(store===V10_STORES.meta?{key:'v7-retained',value:true}:{id:`retained:${store}`,value:true});for(const [migrationId,digest,targetVersion,mode] of migrations)tx.objectStore(V10_STORES.meta).put({key:migrationLedgerKey(migrationId),kind:'migration-ledger-entry',schemaVersion:1,migrationId,digest,targetVersion,mode,status:'applied',appliedAt:1});await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});v7.close();const v10=await import(`../src/v10-persistence.js?private-v8-indexes=${Date.now()}`),first=await v10.openV10Database(),privateStore=first.transaction(V10_STORES.privateSources,'readonly').objectStore(V10_STORES.privateSources);assert.equal(first.version,8);assert.equal(privateStore.keyPath,'id');assert.equal(await new Promise((resolve,reject)=>{const request=privateStore.count();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}),0);assert.deepEqual([...privateStore.indexNames].sort(),['kind','sourceId','state','updatedAt']);for(const index of ['kind','sourceId','state','updatedAt']){const value=privateStore.index(index);assert.equal(value.keyPath,index);assert.equal(value.unique,false);}const firstLedger=await listMigrationLedger(first,V10_STORES.meta);assert.deepEqual(firstLedger.filter(row=>row.migrationId==='wave5-private-source-library-v8').map(row=>[row.digest,row.targetVersion,row.mode,row.status]),[['v10-v8-private-source-library:2026-08-12',8,'upgrade','applied']]);first.close();const reopened=await v10.reopenV10Database(),secondLedger=await listMigrationLedger(reopened,V10_STORES.meta),reopenedStore=reopened.transaction(V10_STORES.privateSources,'readonly').objectStore(V10_STORES.privateSources);assert.equal(await new Promise((resolve,reject)=>{const request=reopenedStore.count();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}),0);assert.deepEqual(secondLedger,firstLedger);assert.deepEqual([...reopenedStore.indexNames].sort(),['kind','sourceId','state','updatedAt']);reopened.close();}finally{globalThis.indexedDB=originalIndexedDb;}});
