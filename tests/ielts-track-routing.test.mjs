import test from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent??=()=>true;
globalThis.addEventListener??=()=>true;
globalThis.removeEventListener??=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const persistence=await import('../src/ielts-persistence.js');
const {
  IELTS_TRACKS,
  validateIeltsTrack,
  normalizeIeltsTrack
}=await import('../src/ielts-domain.js');

async function reset(){
  await persistence.clearIeltsData();
}

test('IELTS track routing resolves launch override over saved preference with no silent default',async()=>{
  await reset();
  // 1. Initial state: no track set in settings -> fails closed / returns null (no silent default)
  const initialTrack=await persistence.getSelectedIeltsTrack();
  assert.equal(initialTrack,null,'Initial state must not silently default to Academic or GT');

  // Resolution with no override and no saved preference fails closed
  const resolvedUnset=persistence.resolveEffectiveIeltsTrack({launchOverride:null,savedPreference:null});
  assert.equal(resolvedUnset,null,'Unset state must not resolve to a silent default');

  // 2. Saved preference in settings
  await persistence.setSelectedIeltsTrack('general-training');
  const savedTrack=await persistence.getSelectedIeltsTrack();
  assert.equal(savedTrack,'general-training');

  const resolvedSaved=persistence.resolveEffectiveIeltsTrack({launchOverride:null,savedPreference:savedTrack});
  assert.equal(resolvedSaved,'general-training');

  // 3. Launch-scoped override takes precedence over saved preference
  const resolvedOverride=persistence.resolveEffectiveIeltsTrack({launchOverride:'academic',savedPreference:savedTrack});
  assert.equal(resolvedOverride,'academic','Launch-scoped override must take precedence over saved preference');

  // 4. Invalid launch override or invalid saved preference fails closed
  assert.equal(persistence.resolveEffectiveIeltsTrack({launchOverride:'invalid-track',savedPreference:'general-training'}),null);
  assert.equal(persistence.resolveEffectiveIeltsTrack({launchOverride:null,savedPreference:'invalid-preference'}),null);
});

test('IELTS track selection persistence rejects invalid track identifiers',async()=>{
  await reset();
  await assert.rejects(
    ()=>persistence.setSelectedIeltsTrack('invalid-track'),
    /track|academic|general-training/i
  );
  await assert.rejects(
    ()=>persistence.setSelectedIeltsTrack(''),
    /track/i
  );
  await assert.rejects(
    ()=>persistence.setSelectedIeltsTrack(null),
    /track/i
  );
});

test('IELTS track switching dispatches track change notification and updates settings',async()=>{
  await reset();
  let dispatchedDetail=null;
  const handlers=[];
  const originalAdd=globalThis.addEventListener;
  const originalRemove=globalThis.removeEventListener;
  const originalDispatch=globalThis.dispatchEvent;

  globalThis.addEventListener=(type,fn)=>{handlers.push({type,fn});};
  globalThis.removeEventListener=(type,fn)=>{const idx=handlers.findIndex(h=>h.type===type&&h.fn===fn);if(idx>=0)handlers.splice(idx,1);};
  globalThis.dispatchEvent=event=>{handlers.filter(h=>h.type===event.type).forEach(h=>h.fn(event));return true;};

  const listener=event=>{dispatchedDetail=event.detail;};
  globalThis.addEventListener('vocab:ielts-track-changed',listener);

  try{
    await persistence.setSelectedIeltsTrack('academic');
    assert.equal(await persistence.getSelectedIeltsTrack(),'academic');

    await persistence.setSelectedIeltsTrack('general-training');
    assert.equal(await persistence.getSelectedIeltsTrack(),'general-training');
  }finally{
    globalThis.removeEventListener('vocab:ielts-track-changed',listener);
    globalThis.addEventListener=originalAdd;
    globalThis.removeEventListener=originalRemove;
    globalThis.dispatchEvent=originalDispatch;
  }
});
