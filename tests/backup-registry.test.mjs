import test from 'node:test';
import { FULL_BACKUP_VERSION,BACKUP_REGISTRY_VERSION } from '../src/backup-registry.js';
import { createPrivateSourceRef } from '../src/private-source-contracts.js';
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
const inventory=await import('../src/ielts-profile-inventory.js');
const { createSourceRevisionRef }=await import('../src/source-revision-ref.js');
const v10=await import('../src/v10-persistence.js');
const { V10_STORES }=await import('../src/v10-contracts.js');
const transcripts=await import('../src/transcript-resolver-v2.js');
const registry=await import('../src/backup-registry.js');
const combined=await import('../src/ielts-backup.js');
const { ProductivePractice }=await import('../src/productive-practice.js');

const clone=value=>structuredClone(value);
const backupArgs=backup=>({core:clone(backup.domains.core.stores),ielts:clone(backup.domains.ielts.stores),v10:clone(backup.domains.v10.stores),exportedAt:backup.exportedAt});
const refreshLegacy=legacy=>{for(const row of legacy.manifest.stores){const rows=row.backupRule==='exclude'?[]:legacy.domains[row.owner].stores[row.store];row.recordCount=rows.length;row.contentDigest=row.backupRule==='exclude'?null:`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;}legacy.payloadDigest=registry.canonicalBackupDigest(legacy.domains);return legacy;};
const legacyV10V7=legacy=>{legacy.domains.v10.databaseVersion=7;delete legacy.domains.v10.stores[V10_STORES.privateSources];legacy.manifest.stores=legacy.manifest.stores.filter(row=>!(row.owner==='v10'&&row.store===V10_STORES.privateSources)).map(row=>row.owner==='v10'?{...row,databaseVersion:7}:row);return legacy;};
const registryV2=()=>{const legacy=legacyV10V7(clone(acceptedBackup));legacy.schemaVersion=3;legacy.registryVersion=2;legacy.domains.ielts.databaseVersion=1;delete legacy.domains.ielts.stores.objectiveInventory;delete legacy.domains.ielts.stores.learnerArtifacts;legacy.domains.v10.stores[V10_STORES.todayRuns]=legacy.domains.v10.stores[V10_STORES.todayRuns].filter(row=>row.activitySpec?.target?.targetType!=='productive-text-revision');legacy.manifest.stores=legacy.manifest.stores.filter(row=>!(row.owner==='ielts'&&[IELTS_STORE_NAMES.objectiveInventory,IELTS_STORE_NAMES.learnerArtifacts].includes(row.store))).map(row=>row.owner==='ielts'?{...row,databaseVersion:1}:row);return refreshLegacy(legacy);};
const registryV3=()=>{const legacy=legacyV10V7(clone(acceptedBackup));legacy.schemaVersion=3;legacy.registryVersion=3;legacy.domains.ielts.databaseVersion=2;delete legacy.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts];legacy.domains.v10.stores[V10_STORES.todayRuns]=legacy.domains.v10.stores[V10_STORES.todayRuns].filter(row=>row.activitySpec?.target?.targetType!=='productive-text-revision');legacy.manifest.stores=legacy.manifest.stores.filter(row=>!(row.owner==='ielts'&&row.store===IELTS_STORE_NAMES.learnerArtifacts)).map(row=>row.owner==='ielts'?{...row,databaseVersion:2}:row);return refreshLegacy(legacy);};
const reverseKeys=value=>Array.isArray(value)?value.map(reverseKeys):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reverseKeys(item)])):value;
let acceptedBackup;
const inventoryRow=label=>inventory.createIeltsObjectiveInventoryItem({kind:'ielts-objective-inventory-item',schemaVersion:1,itemId:`inventory-${label}`,itemRevision:1,skill:'reading',profiles:['academic'],form:{id:'academic-form',revision:1},section:{id:'reading-section',revision:1,number:1},order:1,sourceRevisionRef:createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'private-pack',authority:'test-owner',sourceId:'source-test',revisionId:'revision-test',integrity:'a'.repeat(64),locator:{assetId:'asset-test'},provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'}}),questionBinding:{kind:'single-choice',schemaVersion:1,registryRevision:'qar-v1',questionId:'question-test',promptRevision:'prompt-v1',promptDigest:'fnv1a64:a',keyRevision:'key-v1',keyDigest:'fnv1a64:b',rubricRevision:'rubric-v1',rubricDigest:'fnv1a64:c',scorer:{id:'scorer-test',version:1},reviewPolicyRevision:'review-v1',requiredCapabilities:['keyboard']},questionPayload:{prompt:'Pick one',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},status:'draft',rights:null,provenance:null,humanReview:null,createdAt:'2026-08-10T05:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,extensions:{}});

test('registry covers every physical Core, IELTS and V10 object store',async()=>{
  const audit=registry.auditBackupRegistry();assert.deepEqual(audit.errors,[]);assert.equal(audit.valid,true);
  assert.equal(audit.stores,Object.values(core.STORE_NAMES).length+Object.values(IELTS_STORE_NAMES).length+Object.values(V10_STORES).length);
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
  for(const store of Object.values(IELTS_STORE_NAMES)){if(store===IELTS_STORE_NAMES.objectiveInventory){await ielts.saveIeltsObjectiveInventoryItem(inventoryRow('sentinel'));continue;}if(store===IELTS_STORE_NAMES.learnerArtifacts){await ielts.autosaveLearnerTextArtifact({text:'IELTS productive sentinel',at:10});continue;}const keyPath=store===IELTS_STORE_NAMES.settings?'key':'id';await ielts.__testing.putOne(store,{[keyPath]:`ielts-${store}-sentinel`,text:'IELTS sentinel'});}
  const productiveArtifact=(await ielts.getLearnerTextArtifact((await ielts.__testing.getAll(IELTS_STORE_NAMES.learnerArtifacts)).find(row=>row.kind==='learner-text-artifact').id));
  await new ProductivePractice({now:()=>11}).submitSelfReview({artifactId:productiveArtifact.artifact.id,artifactRevisionId:productiveArtifact.artifact.currentRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'revisit'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'not-applicable'}],note:'Private self-review note.',now:11});
  for(const store of Object.values(V10_STORES)){
    if([V10_STORES.transcriptCache,V10_STORES.contentAssets,V10_STORES.coachingStats,V10_STORES.meta].includes(store))continue;
    if(store===V10_STORES.privateSources){const sourceId='private-source:00000000-0000-4000-8000-000000000020',revisionId=`${sourceId}:revision:1`;await v10.putV10Record(store,{kind:'private-source-head',id:sourceId,sourceId,currentRevisionId:revisionId,revisionCount:1,state:'draft',currentApprovalId:null,createdAt:1,updatedAt:1},'backup-sentinel');const revision={kind:'private-source-revision',id:revisionId,sourceId,revisionNumber:1,parentRevisionId:null,title:'Private sentinel',text:'V10 sentinel',textDigest:'sha256:699be5339e0d8850d1a059b8e7d287afd3405d5a63e56145a3e107264cdca76b',utf8Bytes:12,sourceRevisionRef:null,createdAt:1};revision.sourceRevisionRef=createPrivateSourceRef(revision);await v10.putV10Record(store,revision,'backup-sentinel');continue;}
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
  for(const store of Object.values(IELTS_STORE_NAMES))assert.ok(first.domains.ielts.stores[store].some(row=>store===IELTS_STORE_NAMES.objectiveInventory?row.itemId==='inventory-sentinel':store===IELTS_STORE_NAMES.learnerArtifacts?row.kind==='learner-text-artifact':(row.key??row.id)===`ielts-${store}-sentinel`),store);
  assert.equal(Object.hasOwn(first.domains.v10.stores,V10_STORES.coachingStats),false);
  assert.deepEqual(first.domains.v10.stores.meta.map(row=>row.key),['lexical-migration-v1','phase1:migration:p1-00-v10-opener-v1','phase1:migration:p1-03-v10-workflow-intents-v2','phase1:migration:p1-05-v10-transcript-aggregate-v3','phase1:migration:p1-06-v10-global-errors-v4','phase1:migration:p1-08-v10-today-runs-v5','phase1:migration:p2-01-v10-resolver-jobs-v6','phase1:migration:p4-00-v10-content-platform-v7','phase1:migration:wave5-private-source-library-v8']);
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
  const productiveTerminal=clone(acceptedBackup);const productiveRun=productiveTerminal.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision');productiveRun.envelope.attempt.metadata.feedbackId='forged-feedback';productiveTerminal.payloadDigest=registry.canonicalBackupDigest(productiveTerminal.domains);const productiveManifest=productiveTerminal.manifest.stores.find(row=>row.owner==='v10'&&row.store===V10_STORES.todayRuns);productiveManifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(productiveTerminal.domains.v10.stores[V10_STORES.todayRuns]))}`;cases.push(productiveTerminal);
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
  const standaloneV1=clone(legacyIelts);standaloneV1.schemaVersion=1;delete standaloneV1.stores.objectiveInventory;delete standaloneV1.stores.learnerArtifacts;
  const upgradedStandalone=ielts.validateIeltsBackup(standaloneV1);assert.equal(upgradedStandalone.valid,true,upgradedStandalone.errors.join('\n'));assert.deepEqual(upgradedStandalone.value.stores.objectiveInventory,[]);
  const fullRegistryV2=registryV2();
  const upgradedFull=registry.validateFullBackupEnvelope(fullRegistryV2);assert.equal(upgradedFull.valid,true,upgradedFull.errors.join('\n'));assert.deepEqual(upgradedFull.value.domains.ielts.stores.objectiveInventory,[]);
  const future=clone(legacyIelts);future.domainSchemaVersion=999;assert.equal(ielts.validateIeltsBackup(future).valid,false);
  const partial=clone(legacyIelts);delete partial.stores.settings;assert.equal(ielts.validateIeltsBackup(partial).valid,false);
  const unknown=clone(legacyIelts);unknown.stores.future=[];assert.equal(ielts.validateIeltsBackup(unknown).valid,false);
  const legacyCombined={app:'Vocab Master',kind:'combined-core-ielts',schemaVersion:1,exportedAt:new Date().toISOString(),core:coreContracts.buildBackupDocument({cards:[],reviewEvents:[]}),ielts:legacyIelts};
  const validation=combined.validateCombinedBackup(legacyCombined);assert.equal(validation.valid,true,validation.errors.join('\n'));assert.equal(validation.format,'legacy-v1');
  const restore=await combined.restoreCombinedBackup(acceptedBackup);assert.equal(restore.durable,true);
});

test('full inventory and registry-v2 adapters fail closed after attacker recomputes outer digests',()=>{
  const future=clone(acceptedBackup);future.domains.ielts.stores[IELTS_STORE_NAMES.objectiveInventory][0].schemaVersion=99;future.payloadDigest=registry.canonicalBackupDigest(future.domains);const futureManifest=future.manifest.stores.find(row=>row.owner==='ielts'&&row.store===IELTS_STORE_NAMES.objectiveInventory);futureManifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(future.domains.ielts.stores[IELTS_STORE_NAMES.objectiveInventory]))}`;assert.equal(registry.validateFullBackupEnvelope(future).valid,false);
  const legacy=registryV2();
  assert.equal(registry.validateFullBackupEnvelope(legacy).valid,true);
  const cases=[];const duplicate=clone(legacy);duplicate.manifest.stores.push(clone(duplicate.manifest.stores[0]));cases.push(['duplicate',duplicate]);const forgedExternal=clone(legacy);forgedExternal.manifest.external={forged:true};cases.push(['external',forgedExternal]);const wrongIdentity=clone(legacy);wrongIdentity.domains.ielts.database='forged';wrongIdentity.payloadDigest=registry.canonicalBackupDigest(wrongIdentity.domains);cases.push(['identity',wrongIdentity]);const swapped=clone(legacy);[swapped.manifest.stores[0],swapped.manifest.stores[1]]=[swapped.manifest.stores[1],swapped.manifest.stores[0]];cases.push(['swapped',swapped]);for(const [name,input] of cases)assert.equal(registry.validateFullBackupEnvelope(input).valid,false,name);
  for(const owner of ['core','ielts','v10']){const missing=clone(legacy);missing.manifest.stores.splice(missing.manifest.stores.findIndex(row=>row.owner===owner),1);cases.push([`${owner}-missing`,missing]);const count=clone(legacy);count.manifest.stores.find(row=>row.owner===owner).recordCount+=1;cases.push([`${owner}-count`,count]);const digest=clone(legacy);digest.manifest.stores.find(row=>row.owner===owner).contentDigest='sha256:'+'0'.repeat(64);cases.push([`${owner}-digest`,digest]);const database=clone(legacy);database.domains[owner].database='forged';database.payloadDigest=registry.canonicalBackupDigest(database.domains);cases.push([`${owner}-database`,database]);const version=clone(legacy);version.domains[owner].databaseVersion+=1;version.payloadDigest=registry.canonicalBackupDigest(version.domains);cases.push([`${owner}-version`,version]);}for(const [name,input] of cases)assert.equal(registry.validateFullBackupEnvelope(input).valid,false,name);
});

test('productive terminal evidence remains default-deny after outer digest recomputation',()=>{
  const forged=clone(acceptedBackup),row=forged.domains.v10.stores[V10_STORES.todayRuns].find(value=>value.activitySpec?.target?.targetType==='productive-text-revision');row.evidenceDecision.eligible=true;forged.payloadDigest=registry.canonicalBackupDigest(forged.domains);const manifest=forged.manifest.stores.find(value=>value.owner==='v10'&&value.store===V10_STORES.todayRuns);manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(forged.domains.v10.stores[V10_STORES.todayRuns]))}`;assert.equal(registry.validateFullBackupEnvelope(forged).valid,false);
});

test('registry-v3 accepts the authentic included-store-only predecessor and upgrades an empty artifact owner',()=>{
  const legacy=registryV3(),upgraded=registry.validateFullBackupEnvelope(legacy);assert.equal(upgraded.valid,true,upgraded.errors.join('\n'));assert.deepEqual(upgraded.value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts],[]);assert.deepEqual(upgraded.value.domains.v10.stores[V10_STORES.privateSources],[]);
});

test('registry-v3 rejects excluded payload rows even after outer digests are recomputed',()=>{
  const legacy=registryV3();legacy.domains.core.stores.fileHandles=[];refreshLegacy(legacy);assert.equal(registry.validateFullBackupEnvelope(legacy).valid,false);
});

test('productive terminal matrix rejects twenty independently recomputed semantic forgeries',()=>{
  const refresh=value=>{value.payloadDigest=registry.canonicalBackupDigest(value.domains);for(const [owner,store] of [['v10',V10_STORES.todayRuns],['ielts',IELTS_STORE_NAMES.learnerArtifacts]]){const manifest=value.manifest.stores.find(item=>item.owner===owner&&item.store===store);manifest.recordCount=value.domains[owner].stores[store].length;manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(value.domains[owner].stores[store]))}`;}return value;};
  const cases=[
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').envelope.decision.eligible=true,
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').evidenceDecision.successful=true,
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').envelope.attempt.learnerOutput='{"artifactId":"x","text":"private"}',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').activitySpec.target.targetId='forged-target',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').canonicalRun.id='forged-run',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').activitySpecDigest='sha256:'+'0'.repeat(64),
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').frozenBinding.target.targetId='forged-target',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').envelope.attempt.id='forged-attempt',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').envelope.receipt.id='forged-receipt',
    value=>value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].find(row=>row.kind==='productive-advisory-feedback').responses[0].status='revisit',
    value=>value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].find(row=>row.kind==='productive-advisory-feedback').note='forged private note',
    value=>value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].find(row=>row.kind==='productive-advisory-feedback').responseDigest='sha256:'+'1'.repeat(64),
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').terminal.receiptId='forged-receipt',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').terminal.status='active',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').terminal.digest='sha256:'+'2'.repeat(64),
    value=>value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].splice(value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].findIndex(row=>row.kind==='productive-advisory-feedback'),1),
    value=>value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].push(clone(value.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts].find(row=>row.kind==='productive-advisory-feedback'))),
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').status='active',
    value=>value.domains.v10.stores[V10_STORES.todayRuns].push(clone(value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision'))),
    value=>value.domains.v10.stores[V10_STORES.todayRuns].find(row=>row.activitySpec?.target?.targetType==='productive-text-revision').envelope.attempt.metadata.feedbackId='forged-feedback'
  ];
  for(const mutate of cases){const forged=clone(acceptedBackup);mutate(forged);assert.equal(registry.validateFullBackupEnvelope(refresh(forged)).valid,false);}
});

test('productive terminal row redundancy matrix rejects recomputed Today aliases',()=>{
  const refresh=value=>{value.payloadDigest=registry.canonicalBackupDigest(value.domains);const manifest=value.manifest.stores.find(row=>row.owner==='v10'&&row.store===V10_STORES.todayRuns);manifest.recordCount=value.domains.v10.stores[V10_STORES.todayRuns].length;manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(value.domains.v10.stores[V10_STORES.todayRuns]))}`;return value;};
  for(const [key,value] of [['activityId','forged-activity'],['planId','forged-plan'],['attemptId','forged-attempt'],['receiptId','forged-receipt'],['createdAt',99],['completedAt',99],['updatedAt',99],['launchBinding','forged-launch'],['kind','forged-kind'],['schemaVersion',99]]){const forged=clone(acceptedBackup),row=forged.domains.v10.stores[V10_STORES.todayRuns].find(item=>item.activitySpec?.target?.targetType==='productive-text-revision');row[key]=value;assert.equal(registry.validateFullBackupEnvelope(refresh(forged)).valid,false,key);}
});

test('productive terminal rejects nested getters without invocation',async()=>{
  const row=clone(acceptedBackup).domains.v10.stores[V10_STORES.todayRuns].find(item=>item.activitySpec?.target?.targetType==='productive-text-revision');let invoked=false;Object.defineProperty(row.activitySpec,'target',{enumerable:true,get(){invoked=true;throw new Error('must not invoke');}});const result=registry.validateFullBackupEnvelope(clone(acceptedBackup));assert.equal(result.valid,true);const { validatePersistedProductiveTerminal }=await import('../src/productive-text-contracts.js');assert.equal(validatePersistedProductiveTerminal(row,{artifact:null,revisions:[],feedback:null}).valid,false);assert.equal(invoked,false);
});

test('productive terminal JSON fence rejects undefined diagnostics and sparse data',async()=>{
  const { validatePersistedProductiveTerminal }=await import('../src/productive-text-contracts.js');const base=clone(acceptedBackup),row=base.domains.v10.stores[V10_STORES.todayRuns].find(item=>item.activitySpec?.target?.targetType==='productive-text-revision'),rows=base.domains.ielts.stores[IELTS_STORE_NAMES.learnerArtifacts],artifact=rows.find(item=>item.kind==='learner-text-artifact'),feedback=rows.find(item=>item.kind==='productive-advisory-feedback'),revisions=rows.filter(item=>item.kind==='learner-text-artifact-revision'&&item.artifactId===artifact.id);row.collisionDiagnostics=[undefined];assert.equal(validatePersistedProductiveTerminal(row,{artifact,revisions,feedback}).valid,false);row.collisionDiagnostics=[];row.collisionDiagnostics.extra='forged';assert.equal(validatePersistedProductiveTerminal(row,{artifact,revisions,feedback}).valid,false);
});

test('semantic ProductivePromptRef equality ignores key insertion order but rejects accessors',async()=>{
  const { PRODUCTIVE_PROMPT_REF,sameProductivePromptRef }=await import('../src/productive-text-contracts.js');const reordered=Object.fromEntries(Object.entries(PRODUCTIVE_PROMPT_REF).reverse());assert.equal(sameProductivePromptRef(PRODUCTIVE_PROMPT_REF,reordered),true);let invoked=false;const forged={};Object.defineProperty(forged,'schema',{enumerable:true,get(){invoked=true;throw new Error('no');}});assert.equal(sameProductivePromptRef(PRODUCTIVE_PROMPT_REF,forged),false);assert.equal(invoked,false);
});
test('backup registry v5 includes the private source durable store',()=>{assert.equal(FULL_BACKUP_VERSION,5);assert.equal(BACKUP_REGISTRY_VERSION,5);});
test('registry-v4 accepts only the complete v7 historical registry and upgrades an empty private owner',()=>{const legacy=clone(acceptedBackup);legacy.schemaVersion=4;legacy.registryVersion=4;legacy.domains.v10.databaseVersion=7;delete legacy.domains.v10.stores[V10_STORES.privateSources];legacy.manifest.stores=legacy.manifest.stores.filter(row=>!(row.owner==='v10'&&row.store===V10_STORES.privateSources)).map(row=>row.owner==='v10'?{...row,databaseVersion:7}:row);for(const row of legacy.manifest.stores){const rows=row.backupRule==='exclude'?[]:legacy.domains[row.owner].stores[row.store];row.recordCount=rows.length;row.contentDigest=row.backupRule==='exclude'?null:`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;}legacy.payloadDigest=registry.canonicalBackupDigest(legacy.domains);const valid=registry.validateFullBackupEnvelope(legacy);assert.equal(valid.valid,true);assert.deepEqual(valid.value.domains.v10.stores[V10_STORES.privateSources],[]);const injected=clone(legacy);injected.domains.v10.stores[V10_STORES.privateSources]=[];injected.payloadDigest=registry.canonicalBackupDigest(injected.domains);assert.equal(registry.validateFullBackupEnvelope(injected).valid,false);});
test('historical schema-v2 and registry v2/v3 use exact V10 v7 store sets and reject private-source injection',()=>{
  const v2=legacyV10V7(clone(acceptedBackup));v2.schemaVersion=2;v2.registryVersion=1;delete v2.manifest;v2.payloadDigest=registry.canonicalBackupDigest(v2.domains);assert.equal(registry.validateFullBackupEnvelope(v2).valid,true);
  const cases=[['schema-v2',v2],['registry-v2',registryV2()],['registry-v3',registryV3()]];
  for(const [name,legacy] of cases){
    const injected=clone(legacy);injected.domains.v10.stores[V10_STORES.privateSources]=[];injected.domains.v10.databaseVersion=8;if(injected.manifest){injected.manifest.stores.push({owner:'v10',database:'vocab-master-v10',databaseVersion:8,store:V10_STORES.privateSources,keyPath:'id',classification:'durable',backupRule:'include',restoreRule:'stage-replace-verify',note:'forged',recordCount:0,contentDigest:`sha256:${registry.sha256Hex('[]')}`});}injected.payloadDigest=registry.canonicalBackupDigest(injected.domains);assert.equal(registry.validateFullBackupEnvelope(injected).valid,false,`${name}: injected private owner`);
    const future=clone(legacy);future.domains.v10.databaseVersion=8;future.payloadDigest=registry.canonicalBackupDigest(future.domains);assert.equal(registry.validateFullBackupEnvelope(future).valid,false,`${name}: v8 identity`);
    const missing=clone(legacy);delete missing.domains.v10.stores[V10_STORES.activities];missing.payloadDigest=registry.canonicalBackupDigest(missing.domains);assert.equal(registry.validateFullBackupEnvelope(missing).valid,false,`${name}: missing historical store`);
  }
});
