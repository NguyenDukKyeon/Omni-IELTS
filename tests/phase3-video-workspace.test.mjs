import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { indexedDB,IDBKeyRange } from 'fake-indexeddb';
import { applyTranscriptEdit,findActiveSentenceIndex,virtualWindow } from '../src/video-workspace-v2.js';
import { waitForResolverJob } from '../src/transcript-resolver-v2.js';

const segments=[
  {id:'s1',startMs:0,endMs:1000,text:'First sentence.'},
  {id:'s2',startMs:1000,endMs:2500,text:'Second sentence has words.'},
  {id:'s3',startMs:2500,endMs:4000,text:'Third sentence.'}
];

test('player time maps deterministically to the exact transcript sentence',()=>{
  assert.equal(findActiveSentenceIndex(segments,0),0);
  assert.equal(findActiveSentenceIndex(segments,.999),0);
  assert.equal(findActiveSentenceIndex(segments,1),1);
  assert.equal(findActiveSentenceIndex(segments,2.7),2);
});

test('rail virtualization bounds the DOM window for a 1,000 sentence transcript',()=>{
  assert.deepEqual(virtualWindow(1000,0),{start:0,end:29,active:0});
  const middle=virtualWindow(1000,500);
  assert.equal(middle.end-middle.start,57);
  assert.deepEqual(virtualWindow(1000,999),{start:971,end:1000,active:999});
});

test('inline transcript editing validates timing and supports update, split and merge',()=>{
  const updated=applyTranscriptEdit(segments,1,{text:'A corrected second sentence.',startMs:1000,endMs:2400});
  assert.equal(updated[1].text,'A corrected second sentence.');
  assert.equal(segments[1].text,'Second sentence has words.','input revision was mutated');
  const split=applyTranscriptEdit(segments,1,{action:'split',text:'Second sentence has words.'});
  assert.equal(split.length,4);
  assert.equal(split[1].endMs,split[2].startMs);
  const merged=applyTranscriptEdit(segments,1,{action:'merge'});
  assert.equal(merged.length,2);
  assert.match(merged[1].text,/Second sentence.+Third sentence/);
  assert.throws(()=>applyTranscriptEdit(segments,1,{startMs:500,endMs:2000}),/chồng timestamp/);
});

test('strict dictation uses semantic omission and Phase 3 exposes required modes',async()=>{
  const loop=await readFile(new URL('../src/sentence-learning-loop.js',import.meta.url),'utf8');
  const workspace=await readFile(new URL('../src/video-workspace-v2.js',import.meta.url),'utf8');
  assert.match(loop,/Strict: đáp án chưa xuất hiện trong DOM, ARIA hoặc vùng sao chép/);
  assert.match(loop,/practiceHintExposed/);
  for(const mode of ['normal','noticing','shadowing','dictation-strict','dictation-practice','retell'])assert.equal(workspace.includes(mode),true,`missing mode ${mode}`);
  assert.match(workspace,/reviseTranscript/);
  assert.match(workspace,/TRANSCRIPT_EDIT_CONFLICT/);
});

test('resolver progress reconnect resumes after the last durable event without duplicating completion',async()=>{
  const originalFetch=globalThis.fetch,originalEventSource=globalThis.EventSource,originalIndexedDB=globalThis.indexedDB,originalKeyRange=globalThis.IDBKeyRange,progress=[];let reads=0,streams=0;
  globalThis.indexedDB=indexedDB;globalThis.IDBKeyRange=IDBKeyRange;
  globalThis.fetch=async()=>({ok:true,json:async()=>({job:{id:'phase3-reconnect-job',requestKey:'phase3-reconnect-key',request:{requestKey:'phase3-reconnect-key'},status:++reads>=3?'complete':'resolving',sentences:[{id:'s1',startMs:0,endMs:1000,text:'Ready.'}],updatedAt:Date.now()}})});
  globalThis.EventSource=class{
    constructor(url){this.url=url;this.listeners=new Map();this.instance=++streams;setTimeout(()=>{if(this.instance===1)this.onerror?.(new Event('error'));else this.listeners.get('complete')?.({data:JSON.stringify({type:'complete',sequence:2,data:{status:'complete'}}),lastEventId:'2'});},5);}
    addEventListener(type,listener){this.listeners.set(type,listener);}
    close(){}
  };
  try{const job=await waitForResolverJob('phase3-reconnect-job',{onProgress:event=>progress.push(event)});assert.equal(job.status,'complete');assert.equal(streams,2);assert.equal(progress.filter(row=>row.status==='complete').length,1,'completion progress was duplicated');assert.ok(progress.some(row=>row.status==='reconnecting'));}finally{globalThis.fetch=originalFetch;globalThis.EventSource=originalEventSource;globalThis.indexedDB=originalIndexedDB;globalThis.IDBKeyRange=originalKeyRange;}
});
