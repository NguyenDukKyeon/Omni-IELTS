import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const core=await import('../src/persistence.js');
const v10=await import('../src/v10-persistence.js');
const { V10_STORES }=await import('../src/v10-contracts.js');
const capture=await import('../src/unified-capture-v2.js');

await core.initializePersistence();
await v10.initializeV10Persistence();

async function seedDraft(id,term=id){
  return core.persistCaptureDraft({id,term,meaning:`meaning-${term}`,sourceContext:`context-${term}`,sourceLabel:'capture-test',createdAt:100,updatedAt:100});
}

async function candidateFor(draftId){
  return v10.getV10Record(V10_STORES.captureCandidates,await capture.__testing.legacyCandidateId(draftId));
}

test('legacy draft migration copies, reopens, verifies and only then deletes the Core source',async()=>{
  await seedDraft('migration-success-a');
  await seedDraft('migration-success-b');
  const result=await capture.migrateLegacyCaptureDrafts();
  assert.deepEqual(result,{found:2,copied:2,deleted:2});
  assert.deepEqual(await core.listCaptureDrafts(),[]);
  for(const id of ['migration-success-a','migration-success-b']){
    const candidate=await candidateFor(id);
    assert.equal(candidate.sourceOccurrence.sourceId,id);
    assert.equal(candidate.term,id);
  }
});

test('interruption after destination verification keeps every source and retry creates no duplicate',async()=>{
  await seedDraft('migration-verified-a');
  await seedDraft('migration-verified-b');
  const crash=Object.assign(new Error('simulated migration interruption'),{code:'SIMULATED_PROCESS_CRASH'});
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts({hooks:{afterTargetVerify:async({index})=>{if(index===1)throw crash;}}}),error=>error===crash);
  assert.deepEqual(new Set((await core.listCaptureDrafts()).map(row=>row.id)),new Set(['migration-verified-a','migration-verified-b']));
  assert.ok(await candidateFor('migration-verified-a'));assert.ok(await candidateFor('migration-verified-b'));
  const retried=await capture.migrateLegacyCaptureDrafts();assert.equal(retried.deleted,2);
  const ids=(await v10.listV10Records(V10_STORES.captureCandidates,{sortBy:null})).map(row=>row.id);
  for(const id of ['migration-verified-a','migration-verified-b']){
    const targetId=await capture.__testing.legacyCandidateId(id);
    assert.equal(ids.filter(value=>value===targetId).length,1);
  }
});

test('interruption during source cleanup is idempotent because every target was already verified',async()=>{
  await seedDraft('migration-cleanup-a');
  await seedDraft('migration-cleanup-b');
  const crash=Object.assign(new Error('crash after first source delete'),{code:'SIMULATED_PROCESS_CRASH'});
  let deletedId;
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts({hooks:{afterSourceDelete:async({index,draft})=>{if(index===0){deletedId=draft.id;throw crash;}}}}),error=>error===crash);
  const remaining=(await core.listCaptureDrafts()).map(row=>row.id);
  assert.equal(remaining.length,1);assert.equal(remaining.includes(deletedId),false);
  assert.ok(await candidateFor('migration-cleanup-a'));assert.ok(await candidateFor('migration-cleanup-b'));
  const retried=await capture.migrateLegacyCaptureDrafts();assert.deepEqual(retried,{found:1,copied:1,deleted:1});
  assert.deepEqual(await core.listCaptureDrafts(),[]);
});

test('post-reopen target mismatch fails closed and preserves the source draft',async()=>{
  await seedDraft('migration-corrupt-target');
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts({hooks:{afterTargetReopen:async({restoreToken})=>{
    const candidate=await candidateFor('migration-corrupt-target');
    await v10.putV10Record(V10_STORES.captureCandidates,{...candidate,term:'tampered-after-reopen'},'capture-test-tamper',{restoreToken});
  }}}),error=>error.code==='CAPTURE_MIGRATION_VERIFY_FAILED');
  assert.equal((await core.listCaptureDrafts()).some(row=>row.id==='migration-corrupt-target'),true);
  const targetId=await capture.__testing.legacyCandidateId('migration-corrupt-target');
  await v10.deleteV10Record(V10_STORES.captureCandidates,targetId,'capture-corrupt-cleanup');
  const retried=await capture.migrateLegacyCaptureDrafts();assert.equal(retried.deleted,1);
});

test('deterministic migration ID collision never overwrites an unrelated durable candidate',async()=>{
  await seedDraft('migration-target-collision');
  const targetId=await capture.__testing.legacyCandidateId('migration-target-collision');
  await v10.putV10Record(V10_STORES.captureCandidates,{id:targetId,term:'unrelated',sourceOccurrence:{sourceType:'manual',sourceId:'other-source'},status:'captured'},'capture-collision-fixture');
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts(),error=>error.code==='CAPTURE_MIGRATION_TARGET_COLLISION');
  assert.equal((await core.listCaptureDrafts()).some(row=>row.id==='migration-target-collision'),true);
  assert.equal((await v10.getV10Record(V10_STORES.captureCandidates,targetId)).term,'unrelated');
  await v10.deleteV10Record(V10_STORES.captureCandidates,targetId,'capture-collision-cleanup');
  assert.equal((await capture.migrateLegacyCaptureDrafts()).deleted,1);
});

test('retry never overwrites a destination candidate changed after verified copy',async()=>{
  await seedDraft('migration-diverged-target','source-term');
  const crash=Object.assign(new Error('stop before source cleanup'),{code:'SIMULATED_PROCESS_CRASH'});
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts({hooks:{afterTargetVerify:async()=>{throw crash;}}}),error=>error===crash);
  const targetId=await capture.__testing.legacyCandidateId('migration-diverged-target');
  const copied=await v10.getV10Record(V10_STORES.captureCandidates,targetId);
  await v10.putV10Record(V10_STORES.captureCandidates,{...copied,term:'user-edited-target',status:'rejected'},'capture-diverged-fixture');
  await assert.rejects(()=>capture.migrateLegacyCaptureDrafts(),error=>error.code==='CAPTURE_MIGRATION_TARGET_DIVERGED');
  const preserved=await v10.getV10Record(V10_STORES.captureCandidates,targetId);
  assert.equal(preserved.term,'user-edited-target');assert.equal(preserved.status,'rejected');
  assert.equal((await core.listCaptureDrafts()).some(row=>row.id==='migration-diverged-target'),true);
  await v10.deleteV10Record(V10_STORES.captureCandidates,targetId,'capture-diverged-cleanup');
  assert.equal((await capture.migrateLegacyCaptureDrafts()).deleted,1);
});
