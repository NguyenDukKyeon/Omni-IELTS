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
const CAPTURE_KEY='vocab-master-capture-drafts';

for(const fixture of [
  {name:'invalid JSON',raw:'{corrupt-json'},
  {name:'non-array JSON',raw:'{"draft":"not-a-list"}'}
]){
  test(`degraded Quick Capture preserves ${fixture.name} instead of overwriting it`,async()=>{
    values.set(CAPTURE_KEY,fixture.raw);
    await assert.rejects(
      ()=>core.persistCaptureDraft({id:`new-${fixture.name}`,term:'new term'}),
      error=>error.code==='DURABLE_CAPTURE_SOURCE_CORRUPT'&&error.durable===false&&error.sourcePreserved===true
    );
    assert.equal(values.get(CAPTURE_KEY),fixture.raw);
    await assert.rejects(
      ()=>core.deleteCaptureDraft('unknown'),
      error=>error.code==='DURABLE_CAPTURE_SOURCE_CORRUPT'&&error.sourcePreserved===true
    );
    assert.equal(values.get(CAPTURE_KEY),fixture.raw);
  });
}
