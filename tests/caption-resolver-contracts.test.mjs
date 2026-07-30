import assert from 'node:assert/strict';
import test from 'node:test';
import { createResolverJob,normalizeResolverRequest,resolverError,transitionResolverJob } from '../src/resolver-contracts.js';
import { normalizeRawCues } from '../src/caption-normalizer.js';

test('resolver canonicalizes YouTube identity without a chunk-range cache key',()=>{
  const a=normalizeResolverRequest({url:'https://youtu.be/abcDEF_1234?t=5',language:'en-US'});
  const b=normalizeResolverRequest({url:'https://www.youtube.com/watch?v=abcDEF_1234',language:'en-US'});
  assert.equal(a.source.canonicalUrl,'https://www.youtube.com/watch?v=abcDEF_1234');
  assert.equal(a.requestKey,b.requestKey);
  assert.throws(()=>normalizeResolverRequest({url:'https://example.com/watch?v=abcDEF_1234'}),error=>error.code==='INVALID_SOURCE');
});

test('resolver state machine is terminal, ordered and default-deny for invalid transitions',()=>{
  const job=createResolverJob({url:'abcDEF_1234'});
  const resolving=transitionResolverJob(job,'resolving');
  const partial=transitionResolverJob(resolving.job,'partial');
  const complete=transitionResolverJob(partial.job,'complete');
  assert.equal(complete.job.eventSequence,3);
  assert.equal(complete.event.id,3);
  assert.throws(()=>transitionResolverJob(complete.job,'partial'));
  assert.equal(resolverError('TIMEOUT','slow').retryable,true);
});

test('rolling captions preserve raw coverage while producing deterministic stable sentence IDs',()=>{
  const cues=[
    {id:'a',startMs:0,endMs:900,text:'We are going'},
    {id:'b',startMs:700,endMs:1700,text:'are going to learn'},
    {id:'c',startMs:1900,endMs:2600,text:'to learn together'},
    {id:'d',startMs:2900,endMs:3600,text:'together'}
  ];
  const first=normalizeRawCues(cues,{sourceId:'youtube:abcDEF_1234'});
  const second=normalizeRawCues([...cues].reverse(),{sourceId:'youtube:abcDEF_1234'});
  assert.deepEqual(first.sentences.map(row=>row.id),second.sentences.map(row=>row.id));
  assert.equal(first.sentences[0].text,'We are going to learn together');
  assert.deepEqual(first.sentences[0].rawCueIds,['a','b','c']);
  assert.equal(first.sentences[1].text,'together','A non-overlapping repeated phrase must not be dropped.');
});
