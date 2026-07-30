import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.addEventListener=()=>{};
globalThis.removeEventListener=()=>{};
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const { V10_STORES }=await import('../src/v10-contracts.js');
const v10=await import('../src/v10-persistence.js');
const backup=await import('../src/ielts-backup.js');
const { BACKUP_EXTERNAL_REGISTRY,BACKUP_STORE_REGISTRY }=await import('../src/backup-registry.js');

const durableFixtures=Object.freeze({
  [V10_STORES.packInstallJournals]:{id:'journal:pack:test:1',packId:'pack:test',stage:'activated'},
  [V10_STORES.installedPacks]:{id:'installed:pack:test',packId:'pack:test',activeRevision:1,state:'installed'},
  [V10_STORES.packActivationReceipts]:{id:'activation:pack:test:1',packId:'pack:test',activatedRevision:1},
  [V10_STORES.contentProgress]:{id:'lesson:test',lessonId:'lesson:test',completedActivityIds:['activity:test']},
  [V10_STORES.packRevocations]:{id:'revocation:pack:old:1',packId:'pack:old',packRevision:1},
  [V10_STORES.packTombstones]:{id:'tombstone:pack:deleted:1',packId:'pack:deleted',deletedRevision:1}
});

test('Phase 4 durable metadata and learner progress round-trip while remote bytes are stubs',async()=>{
  for(const [store,row] of Object.entries(durableFixtures))await v10.putV10Record(store,row,'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.contentAssets,{
    id:'remote:sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    contentAddress:'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    mediaType:'audio/wav',
    url:'/content/immutable/sha256/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.wav',
    data:'REMOTE_MEDIA_BYTES_MUST_NOT_BE_PORTABLE'
  },'phase4-backup-fixture');

  const envelope=await backup.buildCombinedBackup();
  for(const [store,row] of Object.entries(durableFixtures)){
    const exported=envelope.domains.v10.stores[store].find(candidate=>candidate.id===row.id);
    assert.deepEqual(Object.fromEntries(Object.keys(row).map(key=>[key,exported[key]])),row);
  }
  const remote=envelope.domains.v10.stores[V10_STORES.contentAssets][0];
  assert.equal(remote.backupRepresentation,'remote-cache-stub-v1');
  assert.equal(Object.hasOwn(remote,'data'),false);
  assert.match(remote.dataDigest,/^sha256:[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(envelope),/REMOTE_MEDIA_BYTES_MUST_NOT_BE_PORTABLE/);

  await v10.deleteV10Record(V10_STORES.contentAssets,remote.id,'phase4-simulate-missing-cache');
  const restored=await backup.restoreCombinedBackup(envelope);
  assert.equal(restored.durable,true);
  for(const [store,row] of Object.entries(durableFixtures)){
    const restoredRow=await v10.getV10Record(store,row.id);
    assert.deepEqual(Object.fromEntries(Object.keys(row).map(key=>[key,restoredRow[key]])),row);
  }
  const restoredRemote=await v10.getV10Record(V10_STORES.contentAssets,remote.id);
  assert.equal(restoredRemote.backupRepresentation,'remote-cache-stub-v1');
  assert.equal(Object.hasOwn(restoredRemote,'data'),false);
});

test('CacheStorage is explicitly reconstructable and every Phase 4 durable store is included',()=>{
  const contentCaches=BACKUP_EXTERNAL_REGISTRY.filter(row=>row.storage==='CacheStorage'&&/content/i.test(row.store));
  assert.ok(contentCaches.some(row=>row.store==='vocab-master-content-v2'&&row.backupRule==='exclude'));
  for(const store of Object.keys(durableFixtures)){
    const entry=BACKUP_STORE_REGISTRY.find(row=>row.owner==='v10'&&row.store===store);
    assert.equal(entry?.classification,'durable',store);
    assert.notEqual(entry?.backupRule,'exclude',store);
  }
});
