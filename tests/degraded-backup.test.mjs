import test from 'node:test';
import assert from 'node:assert/strict';

const values=new Map();
globalThis.localStorage={
  getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value)),
  removeItem:key=>values.delete(key)
};
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};
delete globalThis.indexedDB;

const core=await import('../src/persistence.js');
const backup=await import('../src/ielts-backup.js');

test('startup recovery recognizes that absent IndexedDB cannot contain a pending restore journal',async()=>{
  assert.deepEqual(await backup.recoverInterruptedRestore(),{recovered:false,reason:'indexeddb-unavailable-no-journal'});
});

test('verified degraded Core data has a scoped portable backup instead of an IndexedDB journal failure',async()=>{
  await core.initializePersistence();
  await core.persistSettings({minutes:19});
  await core.persistCaptureDraft({id:'degraded-backup-draft',term:'portable draft'});
  const envelope=await backup.buildCombinedBackup();
  assert.equal(envelope.kind,backup.DEGRADED_CORE_BACKUP_KIND);
  assert.equal(envelope.restoreScope,'core-only');
  assert.equal(backup.validateCombinedBackup(envelope).valid,true);
  assert.equal(envelope.domains.core.stores.settings.find(row=>row.key==='app').value.minutes,19);
  assert.equal(envelope.domains.core.stores.captureDrafts[0].term,'portable draft');
  for(const owner of ['ielts','v10'])for(const rows of Object.values(envelope.domains[owner].stores))assert.deepEqual(rows,[]);
});

test('degraded Core backup never pretends restore succeeded without IndexedDB',async()=>{
  const envelope=await backup.buildCombinedBackup();
  await assert.rejects(()=>backup.restoreCombinedBackup(envelope),error=>error.code==='DURABLE_STORAGE_UNAVAILABLE'&&error.durable===false);
});
