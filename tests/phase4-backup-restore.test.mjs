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
const {
  BACKUP_EXTERNAL_REGISTRY,
  BACKUP_STORE_REGISTRY,
  buildFullBackupEnvelope,
  validateFullBackupEnvelope
}=await import('../src/backup-registry.js');
const { createContentLifecycle }=await import('../src/content-lifecycle.js');

const address=character=>`sha256:${character.repeat(64)}`;
const activatedAt='2026-07-30T12:00:00.000Z';

function phase4Fixture(){
  const lesson={
    id:'lesson:test',
    schemaVersion:2,
    contentRevision:1,
    packId:'pack:test',
    packRevision:1,
    contentAddress:address('b'),
    title:'Restored lesson',
    learningObjective:'Verify restore containment.',
    estimatedMinutes:5,
    difficulty:'B1',
    skill:'listening',
    compatibility:{minimumAppVersion:'10.0.0'},
    activities:[{id:'activity:test',type:'dictation',prompt:'Write it.',answer:'answer'}],
    assetDescriptors:[]
  };
  const manifest={
    id:'pack:test',
    schemaVersion:2,
    contentRevision:1,
    contentAddress:address('c'),
    compatibility:{minimumAppVersion:'10.0.0'},
    assets:[{
      id:'asset:test',
      schemaVersion:2,
      contentRevision:1,
      contentAddress:address('a'),
      sha256:'a'.repeat(64),
      byteLength:4,
      mediaType:'audio/wav',
      retrievalUrl:`/content/immutable/sha256/${'a'.repeat(64)}.wav`
    }],
    lessons:[lesson]
  };
  return{
    lesson,
    installed:{
      id:'installed:pack:test',
      schemaVersion:2,
      packId:'pack:test',
      activeRevision:1,
      manifestAddress:address('d'),
      state:'installed',
      lessonIds:[lesson.id],
      assetAddresses:[address('a')],
      manifestSnapshot:manifest,
      revisionHistory:[],
      installedAt:activatedAt,
      activatedAt
    },
    receipt:{
      id:'activation:pack:test:1',
      schemaVersion:2,
      packId:'pack:test',
      activatedRevision:1,
      manifestAddress:address('d'),
      activatedAt
    },
    progress:{
      id:lesson.id,
      schemaVersion:2,
      lessonId:lesson.id,
      lessonRevision:1,
      activityProgress:{'activity:test':{status:'completed',updatedAt:activatedAt}},
      completedActivityIds:['activity:test'],
      status:'completed',
      updatedAt:Date.parse(activatedAt)
    }
  };
}

async function baseEnvelope(){
  return backup.buildCombinedBackup();
}

function rebuild(envelope,mutate){
  const stores=structuredClone(envelope.domains.v10.stores);
  mutate(stores);
  return buildFullBackupEnvelope({
    core:envelope.domains.core.stores,
    ielts:envelope.domains.ielts.stores,
    v10:stores,
    exportedAt:envelope.exportedAt
  });
}

test('Phase 4 durable metadata and progress round-trip while assets remain unverified reinstall stubs',async()=>{
  const fixture=phase4Fixture();
  await v10.putV10Record(V10_STORES.packInstallJournals,{
    id:'journal:pack:test:1',schemaVersion:2,packId:'pack:test',packRevision:1,stage:'activated'
  },'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.installedPacks,fixture.installed,'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.packActivationReceipts,fixture.receipt,'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.contentManifests,{
    ...fixture.lesson,installState:'installed',verified:true,qualityStatus:'verified'
  },'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.contentProgress,fixture.progress,'phase4-backup-fixture');
  await v10.putV10Record(V10_STORES.contentAssets,{
    id:`remote:${address('a')}`,
    schemaVersion:2,
    contentAddress:address('a'),
    mediaType:'audio/wav',
    url:`/content/immutable/sha256/${'a'.repeat(64)}.wav`,
    data:'REMOTE_MEDIA_BYTES_MUST_NOT_BE_PORTABLE'
  },'phase4-backup-fixture');

  const envelope=await backup.buildCombinedBackup();
  const remote=envelope.domains.v10.stores[V10_STORES.contentAssets][0];
  assert.equal(remote.backupRepresentation,'remote-cache-stub-v1');
  assert.equal(Object.hasOwn(remote,'data'),false);
  assert.doesNotMatch(JSON.stringify(envelope),/REMOTE_MEDIA_BYTES_MUST_NOT_BE_PORTABLE/);

  const restored=await backup.restoreCombinedBackup(envelope);
  assert.equal(restored.durable,true);
  const installed=await v10.getV10Record(V10_STORES.installedPacks,fixture.installed.id);
  assert.equal(installed.state,'reinstall-required');
  assert.equal(installed.restoredRequiresAssetVerification,true);
  const progress=await v10.getV10Record(V10_STORES.contentProgress,fixture.progress.id);
  assert.deepEqual(progress.completedActivityIds,['activity:test']);
  assert.equal(progress.referenceState,'retained');

  const repositoryLifecycle=createContentLifecycle({
    catalogTrust:{current:async()=>null},
    installer:{install:async()=>({}),cancel:async()=>({})},
    assetStore:{readFinal:async()=>null,deleteFinal:async()=>false}
  });
  const reconciliation=await repositoryLifecycle.reconcileMissingAssets();
  assert.deepEqual(reconciliation.missing,[{packId:'pack:test',addresses:[address('a')]}]);
  assert.equal((await v10.getV10Record(V10_STORES.installedPacks,fixture.installed.id)).state,'reinstall-required');
});

test('digest-correct backups quarantine future schemas and inconsistent pointers, and preserve revocation',async()=>{
  const envelope=await baseEnvelope();
  const fixture=phase4Fixture();

  const unsupported=rebuild(envelope,stores=>{
    stores[V10_STORES.installedPacks]=[{...fixture.installed,schemaVersion:99}];
    stores[V10_STORES.packActivationReceipts]=[fixture.receipt];
    stores[V10_STORES.contentManifests]=[{...fixture.lesson,installState:'installed',verified:true,qualityStatus:'verified'}];
  });
  const unsupportedResult=validateFullBackupEnvelope(unsupported);
  assert.equal(unsupportedResult.valid,true,unsupportedResult.errors.join('\n'));
  const unsupportedPack=unsupportedResult.value.domains.v10.stores[V10_STORES.installedPacks][0];
  assert.equal(unsupportedPack.state,'error');
  assert.equal(unsupportedPack.restoreState,'quarantined');
  assert.equal(unsupportedPack.quarantine.reason,'unsupported-installed-pack-schema');

  const inconsistent=rebuild(envelope,stores=>{
    stores[V10_STORES.installedPacks]=[{...fixture.installed,activeRevision:2}];
    stores[V10_STORES.packActivationReceipts]=[fixture.receipt];
    stores[V10_STORES.contentManifests]=[{...fixture.lesson,installState:'installed',verified:true,qualityStatus:'verified'}];
  });
  const inconsistentResult=validateFullBackupEnvelope(inconsistent);
  assert.equal(inconsistentResult.valid,true);
  assert.equal(inconsistentResult.value.domains.v10.stores[V10_STORES.installedPacks][0].state,'error');

  const revoked=rebuild(envelope,stores=>{
    stores[V10_STORES.installedPacks]=[fixture.installed];
    stores[V10_STORES.packActivationReceipts]=[fixture.receipt];
    stores[V10_STORES.contentManifests]=[{...fixture.lesson,installState:'installed',verified:true,qualityStatus:'verified'}];
    stores[V10_STORES.packRevocations]=[{
      id:'revocation:pack:test:1',
      schemaVersion:2,
      packId:'pack:test',
      packRevision:1,
      reasonCode:'rights-withdrawn',
      reason:'Rights withdrawn.',
      revokedAt:activatedAt
    }];
  });
  const revokedResult=validateFullBackupEnvelope(revoked);
  assert.equal(revokedResult.valid,true);
  assert.equal(revokedResult.value.domains.v10.stores[V10_STORES.installedPacks][0].state,'revoked');
  assert.equal(revokedResult.value.domains.v10.stores[V10_STORES.contentManifests][0].installState,'revoked');
});

test('progress with unsupported or missing lesson references is retained but never active',async()=>{
  const envelope=await baseEnvelope();
  const futureLesson={
    id:'lesson:future',
    schemaVersion:99,
    packId:'pack:future',
    packRevision:1,
    installState:'installed',
    verified:true,
    qualityStatus:'verified'
  };
  const candidate=rebuild(envelope,stores=>{
    stores[V10_STORES.contentManifests]=[futureLesson];
    stores[V10_STORES.contentProgress]=[
      {
        id:'lesson:future',
        schemaVersion:2,
        lessonId:'lesson:future',
        lessonRevision:1,
        activityProgress:{},
        completedActivityIds:[],
        status:'completed',
        updatedAt:Date.parse(activatedAt)
      },
      {
        id:'lesson:missing',
        schemaVersion:2,
        lessonId:'lesson:missing',
        lessonRevision:1,
        activityProgress:{},
        completedActivityIds:[],
        status:'completed',
        updatedAt:Date.parse(activatedAt)
      }
    ];
  });
  const validation=validateFullBackupEnvelope(candidate);
  assert.equal(validation.valid,true);
  const lessons=validation.value.domains.v10.stores[V10_STORES.contentManifests];
  assert.equal(lessons[0].installState,'quarantined');
  const progress=validation.value.domains.v10.stores[V10_STORES.contentProgress];
  assert.equal(progress.find(row=>row.lessonId==='lesson:future').referenceState,'quarantined');
  assert.equal(progress.find(row=>row.lessonId==='lesson:missing').referenceState,'orphaned');
});

test('CacheStorage is reconstructable and every Phase 4 durable store remains included',()=>{
  const contentCaches=BACKUP_EXTERNAL_REGISTRY.filter(row=>row.storage==='CacheStorage'&&/content/i.test(row.store));
  assert.ok(contentCaches.some(row=>row.store==='vocab-master-content-v2'&&row.backupRule==='exclude'));
  for(const store of [
    V10_STORES.packInstallJournals,
    V10_STORES.installedPacks,
    V10_STORES.packActivationReceipts,
    V10_STORES.contentProgress,
    V10_STORES.packRevocations,
    V10_STORES.packTombstones
  ]){
    const entry=BACKUP_STORE_REGISTRY.find(row=>row.owner==='v10'&&row.store===store);
    assert.equal(entry?.classification,'durable',store);
    assert.notEqual(entry?.backupRule,'exclude',store);
  }
});
