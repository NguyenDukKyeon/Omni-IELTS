import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
const transcripts=await import('../src/transcript-aggregate.js');

const source={id:'transcript-source:test',namespace:'private',externalId:'video-1',sourceType:'video',title:'Test',language:'en',complete:false};
const segments=[
  {startMs:0,endMs:1000,text:'First sentence.',language:'en',status:'verified'},
  {startMs:1200,endMs:2400,text:'Second sentence.',language:'en',status:'verified'}
];

test('same source/content produces stable revision and segment IDs independent of input order',()=>{
  const first=transcripts.createTranscriptAggregate({source,segments,createdAt:100});
  const retry=transcripts.createTranscriptAggregate({source,segments:[...segments].reverse(),createdAt:200});
  assert.equal(first.revision.id,retry.revision.id);
  assert.deepEqual(first.segments.map(row=>row.id),retry.segments.map(row=>row.id));
  assert.deepEqual(first.segments.map(row=>row.lineageId),retry.segments.map(row=>row.lineageId));
  assert.equal(first.revision.coverage.complete,false);
  assert.ok(first.revision.coverage.ratio<1);
});

test('persist is idempotent and an edit creates an immutable child revision',async()=>{
  const first=await transcripts.persistTranscriptAggregate({source,segments,createdAt:100});
  const duplicate=await transcripts.persistTranscriptAggregate({source,segments,createdAt:200});
  assert.equal(first.revision.id,duplicate.revision.id);
  const edited=await transcripts.reviseTranscript(first.revision.id,[segments[0],{...segments[1],text:'Edited second sentence.'}],{createdAt:300,provenance:{editor:'learner'}});
  assert.notEqual(edited.revision.id,first.revision.id);
  assert.equal(edited.revision.parentRevisionId,first.revision.id);
  assert.equal((await transcripts.getTranscriptAggregate(first.revision.id)).segments[1].text,'Second sentence.');
  assert.equal((await transcripts.getTranscriptAggregate(edited.revision.id)).segments[1].text,'Edited second sentence.');
});

test('overlap, duplicate timeline and empty revisions fail closed',()=>{
  assert.throws(()=>transcripts.createTranscriptAggregate({source,segments:[]}),error=>error.code==='TRANSCRIPT_REVISION_EMPTY');
  assert.throws(()=>transcripts.createTranscriptAggregate({source,segments:[segments[0],{startMs:900,endMs:1500,text:'Overlap'}]}),error=>error.code==='TRANSCRIPT_TIMELINE_OVERLAP');
  assert.throws(()=>transcripts.createTranscriptAggregate({source,segments:[segments[0],{...segments[0]}]}),error=>['TRANSCRIPT_TIMELINE_OVERLAP','TRANSCRIPT_SEGMENT_DUPLICATE'].includes(error.code));
});

test('legacy adapters are explicit, unverified and namespace-scoped',()=>{
  const legacy=transcripts.adaptLegacyTranscript({id:'legacy-1',provider:'imported',segments,source:{id:'legacy-source',namespace:'shared',title:'Legacy'}});
  assert.equal(legacy.source.namespace,'shared');
  assert.equal(legacy.revision.status,'unverified');
  assert.equal(legacy.revision.provenance.kind,'legacy-import');
  assert.equal(legacy.segments.every(row=>row.revisionId===legacy.revision.id),true);
});
