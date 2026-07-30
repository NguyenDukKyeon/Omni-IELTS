import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBDatabase,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const core=await import('../src/persistence.js');
const coreContracts=await import('../src/persistence-core.js');
const ielts=await import('../src/ielts-persistence.js');
const { IELTS_STORE_NAMES }=await import('../src/ielts-domain.js');
const v10=await import('../src/v10-persistence.js');
const { V10_STORES }=await import('../src/v10-contracts.js');
const transcripts=await import('../src/transcript-resolver-v2.js');
const registry=await import('../src/backup-registry.js');
const combined=await import('../src/ielts-backup.js');

const clone=value=>structuredClone(value);
const backupArgs=backup=>({core:clone(backup.domains.core.stores),ielts:clone(backup.domains.ielts.stores),v10:clone(backup.domains.v10.stores),exportedAt:backup.exportedAt});
const reverseKeys=value=>Array.isArray(value)?value.map(reverseKeys):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reverseKeys(item)])):value;
let acceptedBackup;

test('registry covers every physical Core, IELTS and V10 object store',async()=>{
  const audit=registry.auditBackupRegistry();assert.deepEqual(audit.errors,[]);assert.equal(audit.valid,true);assert.equal(audit.stores,34);
  const databases=await Promise.all([core.openDatabase(),ielts.openIeltsDatabase(),v10.openV10Database()]);
  for(const database of databases)assert.ok(database instanceof IDBDatabase,'sentinel gate must use IndexedDB, not a RAM adapter');
  const expected={core:new Set(Object.values(core.STORE_NAMES)),ielts:new Set(Object.values(IELTS_STORE_NAMES)),v10:new Set(Object.values(V10_STORES))};
  for(const [owner,database] of [['core',databases[0]],['ielts',databases[1]],['v10',databases[2]]])assert.deepEqual(new Set(database.objectStoreNames),expected[owner]);
});

test('every durable store sentinel reaches canonical vNext payload while caches and capabilities stay out',async()=>{
  const secret='AIza-secret-must-not-leak';
  for(const store of Object.values(core.STORE_NAMES)){
    if(store===core.STORE_NAMES.fileHandles){await core.__testing.putOne(store,{key:'automaticBackup',handle:{apiKey:secret}});continue;}
    if(store===core.STORE_NAMES.meta){await core.__testing.putOne(store,{key:'migration-ledger-sentinel',completedAt:1});await core.__testing.putOne(store,{key:'revision',value:999});continue;}
    const keyPath=store===core.STORE_NAMES.settings?'key':'id';const row={[keyPath]:`core-${store}-sentinel`,text:store===core.STORE_NAMES.cards?'Tiếng Việt e\u0301 😀\nmultiline':'core',note:'token and key are benign vocabulary words'};if(store===core.STORE_NAMES.captureDrafts)row.large='x'.repeat(256_000);await core.__testing.putOne(store,row);
  }
  for(const store of Object.values(IELTS_STORE_NAMES)){const keyPath=store===IELTS_STORE_NAMES.settings?'key':'id';await ielts.__testing.putOne(store,{[keyPath]:`ielts-${store}-sentinel`,text:'IELTS sentinel'});}
  for(const store of Object.values(V10_STORES)){
    if([V10_STORES.transcriptCache,V10_STORES.contentAssets,V10_STORES.coachingStats,V10_STORES.meta].includes(store))continue;
    await v10.putV10Record(store,{id:`v10-${store}-sentinel`,text:'V10 sentinel'},'backup-sentinel');
  }
  await v10.putV10Record(V10_STORES.meta,{key:'lexical-migration-v1',completedAt:1},'backup-sentinel');
  await v10.putV10Record(V10_STORES.meta,{key:'schema',version:1},'backup-sentinel');
  await v10.putV10Record(V10_STORES.meta,{key:'content-catalog',etag:'cache'},'backup-sentinel');
  await v10.putV10Record(V10_STORES.coachingStats,{id:'weak-sound:cache',count:99},'backup-sentinel');
  await v10.putV10Record(V10_STORES.transcriptCache,{id:'provider-transcript',cacheKey:'provider-transcript',provider:'backend-provider',segments:[{id:'raw',text:'RAW_PROVIDER_TEXT_MUST_NOT_LEAK'}]},'backup-sentinel');
  await v10.putV10Record(V10_STORES.transcriptCache,{id:'imported-transcript',cacheKey:'imported-transcript',provider:'imported',segments:[{id:'owned',text:'Learner imported transcript'}]},'backup-sentinel');
  await transcripts.importTranscript({videoId:'dQw4w9WgXcQ',url:'https://youtu.be/dQw4w9WgXcQ',segments:[{id:'owned-cache',startMs:0,endMs:30_000,text:'Imported transcript after cache read'}]});
  const cachedImport=await transcripts.resolveTranscriptFast({url:'https://youtu.be/dQw4w9WgXcQ',firstChunkSeconds:30,providers:['indexeddb'],allowGeminiFallback:false});assert.equal(cachedImport.provider,'imported');assert.equal(cachedImport.cacheHitProvider,'indexeddb');
  await v10.putV10Record(V10_STORES.contentAssets,{id:'remote-asset',lessonId:'public-lesson',assetType:'transcript',url:'/content/raw.json',data:'REMOTE_BINARY_BODY_MUST_NOT_LEAK'},'backup-sentinel');
  await v10.putV10Record(V10_STORES.contentAssets,{id:'personal:asset',lessonId:'personal-next-session',assetType:'personal-error',data:{answer:'durable learner data'}},'backup-sentinel');

  const first=await combined.buildCombinedBackup();const second=await combined.buildCombinedBackup();acceptedBackup=first;
  assert.equal(first.payloadDigest,second.payloadDigest);assert.deepEqual(first.domains,second.domains);assert.deepEqual(first.manifest,second.manifest);
  const scrambled=backupArgs(first);for(const owner of ['core','ielts','v10'])for(const store of Object.keys(scrambled[owner]))scrambled[owner][store]=scrambled[owner][store].toReversed().map(reverseKeys);const third=registry.buildFullBackupEnvelope(scrambled);assert.equal(third.payloadDigest,first.payloadDigest);assert.deepEqual(third.domains,first.domains);
  assert.notEqual(first.exportedAt,undefined);assert.equal(registry.sha256Hex('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const validation=combined.validateCombinedBackup(JSON.parse(JSON.stringify(first)));assert.equal(validation.valid,true,validation.errors.join('\n'));

  const serialized=JSON.stringify(first);assert.doesNotMatch(serialized,/AIza-secret-must-not-leak|RAW_PROVIDER_TEXT_MUST_NOT_LEAK|REMOTE_BINARY_BODY_MUST_NOT_LEAK/);
  assert.equal(first.domains.core.stores.snapshots[0].id,'core-snapshots-sentinel');
  assert.equal(first.domains.core.stores.outbox[0].id,'core-outbox-sentinel');
  assert.equal(first.domains.core.stores.captureDrafts[0].id,'core-captureDrafts-sentinel');
  assert.equal(first.domains.core.stores.meta.some(row=>row.key==='migration-ledger-sentinel'),true);assert.equal(first.domains.core.stores.meta.some(row=>row.key==='revision'),false);
  assert.equal(Object.hasOwn(first.domains.core.stores,core.STORE_NAMES.fileHandles),false);
  for(const store of Object.values(IELTS_STORE_NAMES))assert.ok(first.domains.ielts.stores[store].some(row=>(row.key??row.id)===`ielts-${store}-sentinel`),store);
  assert.equal(Object.hasOwn(first.domains.v10.stores,V10_STORES.coachingStats),false);
  assert.deepEqual(first.domains.v10.stores.meta.map(row=>row.key),['lexical-migration-v1','phase1:migration:p1-00-v10-opener-v1']);
  const provider=first.domains.v10.stores.transcriptCache.find(row=>row.id==='provider-transcript');assert.equal(provider.backupRepresentation,'reconstructable-cache-stub-v1');assert.equal(provider.segmentCount,1);assert.match(provider.segmentsDigest,/^sha256:/);assert.equal(Object.hasOwn(provider,'segments'),false);
  const imported=first.domains.v10.stores.transcriptCache.find(row=>row.id==='imported-transcript');assert.equal(imported.segments[0].text,'Learner imported transcript');
  const cachedImported=first.domains.v10.stores.transcriptCache.find(row=>row.cacheKey===cachedImport.cacheKey);assert.equal(cachedImported.provider,'imported');assert.equal(cachedImported.segments[0].text,'Imported transcript after cache read');
  const remote=first.domains.v10.stores.contentAssets.find(row=>row.id==='remote-asset');assert.equal(remote.backupRepresentation,'remote-cache-stub-v1');assert.equal(Object.hasOwn(remote,'data'),false);assert.match(remote.dataDigest,/^sha256:/);
  assert.equal(first.domains.v10.stores.contentAssets.find(row=>row.id==='personal:asset').data.answer,'durable learner data');
  for(const entry of registry.BACKUP_STORE_REGISTRY.filter(row=>row.backupRule!=='exclude'))assert.ok(first.domains[entry.owner].stores[entry.store].length>0,`${entry.owner}.${entry.store}`);
  for(const row of first.manifest.stores.filter(row=>row.backupRule!=='exclude'))assert.match(row.contentDigest,/^sha256:[0-9a-f]{64}$/);
});

test('vNext validation is fail-closed for shape, versions, digest, manifest and secrets',()=>{
  assert.ok(acceptedBackup);
  const cases=[];
  const missing=clone(acceptedBackup);delete missing.domains.core.stores.cards;cases.push(missing);
  const unknown=clone(acceptedBackup);unknown.domains.v10.stores.futureStore=[];cases.push(unknown);
  const newer=clone(acceptedBackup);newer.schemaVersion=99;cases.push(newer);
  const newerRegistry=clone(acceptedBackup);newerRegistry.registryVersion=99;cases.push(newerRegistry);
  const newerDatabase=clone(acceptedBackup);newerDatabase.domains.ielts.databaseVersion=99;cases.push(newerDatabase);
  const corrupt=clone(acceptedBackup);corrupt.domains.core.stores.cards[0].text='tampered';cases.push(corrupt);
  const duplicate=clone(acceptedBackup);duplicate.domains.core.stores.cards.push(clone(duplicate.domains.core.stores.cards[0]));cases.push(duplicate);
  const manifest=clone(acceptedBackup);manifest.manifest.stores[0].recordCount=999;cases.push(manifest);
  const secret=clone(acceptedBackup);secret.domains.core.stores.cards[0].apiKey='secret';cases.push(secret);
  for(const input of cases){const result=registry.validateFullBackupEnvelope(input);assert.equal(result.valid,false,JSON.stringify(input).slice(0,120));assert.ok(result.errors.length);}
});

test('export refuses missing stores and non-JSON values without silently dropping records',async()=>{
  const args=backupArgs(acceptedBackup);delete args.core.cards;assert.throws(()=>registry.buildFullBackupEnvelope(args),/Source domain core.cards/);
  const spoofedId=backupArgs(acceptedBackup);spoofedId.core.cards[0].key='surrogate';delete spoofedId.core.cards[0].id;assert.throws(()=>registry.buildFullBackupEnvelope(spoofedId),/core\.cards\[0\] thieu keyPath id/);
  const spoofedKey=backupArgs(acceptedBackup);spoofedKey.core.settings[0].id='surrogate';delete spoofedKey.core.settings[0].key;assert.throws(()=>registry.buildFullBackupEnvelope(spoofedKey),/core\.settings\[0\] thieu keyPath key/);
  for(const invalid of [new Blob(['binary']),new Date(),1n,()=>true,Infinity]){
    const next=backupArgs(acceptedBackup);next.core.cards[0].invalid=invalid;assert.throws(()=>registry.buildFullBackupEnvelope(next),error=>error.code==='BACKUP_PAYLOAD_UNSAFE');
  }
  const cyclic={};cyclic.self=cyclic;const next=backupArgs(acceptedBackup);next.core.cards[0].cyclic=cyclic;assert.throws(()=>registry.buildFullBackupEnvelope(next),/tham chieu vong/);
  let deep={};const deepRoot=deep;for(let index=0;index<110;index++){deep.child={};deep=deep.child;}const deepArgs=backupArgs(acceptedBackup);deepArgs.core.cards[0].deep=deepRoot;assert.throws(()=>registry.buildFullBackupEnvelope(deepArgs),/do sau/);
  await v10.putV10Record(V10_STORES.contentAssets,{id:'remote-binary-invalid',lessonId:'public-lesson',url:'/binary',data:new Blob(['binary'])},'backup-invalid-fixture');
  await assert.rejects(()=>combined.buildCombinedBackup(),/JSON-safe/);await v10.deleteV10Record(V10_STORES.contentAssets,'remote-binary-invalid','backup-invalid-fixture-cleanup');
});

test('legacy IELTS and combined-v1 validators remain supported but reject partial or future schemas',async()=>{
  const legacyIelts=await ielts.buildIeltsBackup();assert.equal(ielts.validateIeltsBackup(legacyIelts).valid,true);
  const future=clone(legacyIelts);future.domainSchemaVersion=999;assert.equal(ielts.validateIeltsBackup(future).valid,false);
  const partial=clone(legacyIelts);delete partial.stores.settings;assert.equal(ielts.validateIeltsBackup(partial).valid,false);
  const unknown=clone(legacyIelts);unknown.stores.future=[];assert.equal(ielts.validateIeltsBackup(unknown).valid,false);
  const legacyCombined={app:'Vocab Master',kind:'combined-core-ielts',schemaVersion:1,exportedAt:new Date().toISOString(),core:coreContracts.buildBackupDocument({cards:[],reviewEvents:[]}),ielts:legacyIelts};
  const validation=combined.validateCombinedBackup(legacyCombined);assert.equal(validation.valid,true,validation.errors.join('\n'));assert.equal(validation.format,'legacy-v1');
  const restore=await combined.restoreCombinedBackup(acceptedBackup);assert.equal(restore.durable,true);
});
