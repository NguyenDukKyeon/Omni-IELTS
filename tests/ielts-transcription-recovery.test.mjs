import test from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;

const persistence=await import(`../src/ielts-persistence.js?transcription-recovery=${Date.now()}`);
const { IELTS_STORE_NAMES }=await import('../src/ielts-domain.js');

async function reset(){await persistence.clearIeltsData();}

test('retrying the same transcript cache key updates one durable job',async()=>{
  await reset();
  const first=await persistence.saveTranscriptionJob({mediaSourceId:'media-1',cacheKey:'video:en:0:20:v1',model:'gemini-test',status:'processing'});
  const failed=await persistence.saveTranscriptionJob({mediaSourceId:'media-1',cacheKey:'video:en:0:20:v1',model:'gemini-test',status:'failed',retryCount:1,error:'temporary failure'});
  assert.equal(failed.id,first.id);
  assert.equal(failed.createdAt,first.createdAt);
  assert.equal(failed.status,'failed');
  assert.equal(failed.retryCount,1);
  const retry=await persistence.saveTranscriptionJob({mediaSourceId:'media-1',cacheKey:'video:en:0:20:v1',model:'gemini-test',status:'processing',retryCount:failed.retryCount,error:''});
  assert.equal(retry.id,first.id);
  assert.equal(retry.status,'processing');
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.transcriptionJobs)).length,1);
});

test('serialized concurrent saves cannot create duplicate cache-key jobs',async()=>{
  await reset();
  const [a,b]=await Promise.all([
    persistence.saveTranscriptionJob({mediaSourceId:'media-2',cacheKey:'shared-cache-key',status:'queued'}),
    persistence.saveTranscriptionJob({mediaSourceId:'media-2',cacheKey:'shared-cache-key',status:'processing'})
  ]);
  assert.equal(a.id,b.id);
  const jobs=await persistence.listIeltsRecords(IELTS_STORE_NAMES.transcriptionJobs);
  assert.equal(jobs.length,1);
  assert.equal(jobs[0].cacheKey,'shared-cache-key');
  assert.equal(jobs[0].status,'processing');
});

test('reload recovery converts abandoned processing jobs into retryable failures',async()=>{
  await reset();
  const job=await persistence.saveTranscriptionJob({mediaSourceId:'media-3',cacheKey:'abandoned',status:'processing',retryCount:2});
  const recovered=await persistence.recoverInterruptedTranscriptionJobs({now:123456});
  assert.equal(recovered,1);
  const saved=await persistence.getIeltsRecord(IELTS_STORE_NAMES.transcriptionJobs,job.id);
  assert.equal(saved.status,'failed');
  assert.equal(saved.retryCount,3);
  assert.equal(saved.updatedAt,123456);
  assert.match(saved.error,/reload|đóng ứng dụng/);
  assert.equal(await persistence.recoverInterruptedTranscriptionJobs({now:123999}),0);
});
