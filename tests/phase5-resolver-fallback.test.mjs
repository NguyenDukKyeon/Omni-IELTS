import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';
import { createAsrFallbackResolver } from '../server/asr-fallback-resolver.mjs';
import { ASR_CHUNK_VERSION,planAsrChunks } from '../server/local-asr-provider.mjs';
import { CLOUD_CONSENT_VERSION } from '../src/asr-fallback-policy.js';

const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const fallbackBinding=durationSeconds=>({engine:'faster-whisper',modelDigest:`sha256:${'1'.repeat(64)}`,modelBytes:5,chunkVersion:ASR_CHUNK_VERSION,chunkSeconds:30,overlapSeconds:1.5,sourceId:'youtube:dQw4w9WgXcQ',language:'en',durationSeconds,planDigest:`sha256:${sha(planAsrChunks(durationSeconds))}`});
const fallbackBatch=(range,binding,text=`range ${range.index}`)=>{const sourceId=binding.sourceId,bindingDigest=`sha256:${sha(binding)}`,startMs=Math.round(range.logicalStartSeconds*1000),endMs=Math.max(startMs+200,Math.round(range.logicalEndSeconds*1000));return{provider:'local-asr',rangeId:range.rangeId,chunkIndex:range.index,segments:[{id:`local-asr-segment:sha256:${sha({sourceId,bindingDigest,startMs,endMs,text,language:'en'})}`,startMs,endMs,text,language:'en',confidence:null,status:'needs-review',verified:false,sourceId,bindingDigest,asrChunk:{index:range.index,rangeId:range.rangeId,logicalStartMs:startMs,logicalEndMs:Math.round(range.logicalEndSeconds*1000)}}],binding,range,complete:false,needsReview:true,reused:false};};
const waitFor=async(read,predicate)=>{for(let attempt=0;attempt<100;attempt++){const value=await read();if(predicate(value))return value;await new Promise(resolve=>setTimeout(resolve,10));}throw new Error('timed out waiting for resolver state');};

test('local fallback resumes the same canonical resolver job and persists range checkpoints',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-job-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',namespace:'private',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableLocalAsr:true}},created=await repository.getOrCreate(request);
    await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});
    const binding=fallbackBinding(4),range=planAsrChunks(4)[0],batch=fallbackBatch(range,binding,'first batch');let receivedCheckpoints;const localClient={health:async()=>({available:true}),transcribe:async(input,{onBatch})=>{receivedCheckpoints=input.checkpoints;await onBatch(batch);await onBatch(structuredClone(batch));return{segments:batch.segments,durationSeconds:4,checkpointBinding:binding};}};
    const service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);
    for(let attempt=0;attempt<50&&(await repository.get(created.job.id)).status!=='complete';attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    const complete=await repository.get(created.job.id),events=await repository.eventsAfter(created.job.id);assert.equal(complete.id,created.job.id);assert.equal(complete.status,'complete');assert.equal(complete.provider,'local-asr');assert.equal(complete.asrCheckpoints[range.rangeId].status,'complete');assert.equal(complete.provenance.verified,false);assert.deepEqual(receivedCheckpoints,{});assert.equal(events.filter(event=>event.type==='partial').length,1);assert.equal(complete.coverage.complete,true);assert.deepEqual(complete.coverage.gaps,[]);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('cross-process retries reuse complete ranges, persist failed gaps and complete only after the full plan',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-progressive-')),file=join(root,'jobs.json'),duration=65,binding=fallbackBinding(duration),ranges=planAsrChunks(duration),batches=ranges.map(range=>fallbackBatch(range,binding));let repository=new ResolverJobRepository({file}),attempt=0;const seen=[];
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',namespace:'private',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableLocalAsr:true}},created=await repository.getOrCreate(request);await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});const jobId=created.job.id;
    const localClient={health:async()=>({available:true}),transcribe:async(input,{onBatch})=>{attempt++;seen.push(structuredClone(input.checkpoints));if(attempt===1){await onBatch(batches[0]);throw Object.assign(new Error('middle range failed'),{code:'PROCESS_FAILED',asrFailure:{rangeId:ranges[1].rangeId,chunkIndex:1,range:ranges[1],binding}});}if(attempt===2){await onBatch(structuredClone(batches[0]));await onBatch(batches[1]);throw Object.assign(new Error('final range failed'),{code:'TIMEOUT',asrFailure:{rangeId:ranges[2].rangeId,chunkIndex:2,range:ranges[2],binding}});}await onBatch(batches[2]);return{provider:'local-asr',namespace:'private',segments:batches.flatMap(batch=>batch.segments),complete:true,needsReview:true,durationSeconds:duration,rawMediaRetained:false,checkpointBinding:binding};}};
    let service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(jobId);let failed=await waitFor(()=>repository.get(jobId),job=>job.status==='failed'&&job.error?.code==='PROCESS_FAILED');assert.equal(failed.asrCheckpoints[ranges[0].rangeId].status,'complete');assert.equal(failed.asrCheckpoints[ranges[1].rangeId].status,'failed');assert.deepEqual(failed.coverage.gaps.map(gap=>[gap.rangeId,gap.status]),[[ranges[1].rangeId,'failed'],[ranges[2].rangeId,'missing']]);
    repository=new ResolverJobRepository({file});service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(jobId);failed=await waitFor(()=>repository.get(jobId),job=>job.status==='failed'&&job.error?.code==='TIMEOUT');assert.equal(failed.asrCheckpoints[ranges[0].rangeId].status,'complete');assert.equal(failed.asrCheckpoints[ranges[1].rangeId].status,'complete');assert.equal(failed.asrCheckpoints[ranges[2].rangeId].status,'failed');assert.deepEqual(failed.coverage.gaps.map(gap=>[gap.rangeId,gap.status]),[[ranges[2].rangeId,'failed']]);
    repository=new ResolverJobRepository({file});service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(jobId);const complete=await waitFor(()=>repository.get(jobId),job=>job.status==='complete');assert.equal(complete.coverage.complete,true);assert.equal(complete.coverage.coveredMs,65_000);assert.deepEqual(complete.coverage.gaps,[]);assert.deepEqual(seen[1][ranges[0].rangeId].status,'complete');assert.deepEqual(seen[2][ranges[2].rangeId].status,'failed');assert.equal(new Set(complete.sentences.map(row=>row.id)).size,3);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local fallback rejects unknown rights before media extraction',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-rights-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{const created=await repository.getOrCreate({url:'https://youtu.be/dQw4w9WgXcQ',fallback:{enableLocalAsr:true}});await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});let healthCalls=0;const service=createAsrFallbackResolver({repository,localClient:{health:async()=>{healthCalls++;return{available:true};}},securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);for(let attempt=0;attempt<30&&(await repository.get(created.job.id)).error?.code!=='RIGHTS_INELIGIBLE';attempt++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal((await repository.get(created.job.id)).error.code,'RIGHTS_INELIGIBLE');assert.equal(healthCalls,0);}finally{await rm(root,{recursive:true,force:true});}
});

test('local fallback cannot run when the request did not explicitly enable it',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-deny-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{const created=await repository.getOrCreate({url:'https://youtu.be/dQw4w9WgXcQ'});await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});const service=createAsrFallbackResolver({repository,localClient:{health:async()=>({available:true})},securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);for(let attempt=0;attempt<30&&(await repository.get(created.job.id)).status!=='failed';attempt++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal((await repository.get(created.job.id)).error.code,'CONSENT_REQUIRED');}finally{await rm(root,{recursive:true,force:true});}
});

test('Gemini fallback reuses the failed caption job and never runs after caption success',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-cloud-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableGemini:true,consentVersion:CLOUD_CONSENT_VERSION,consentReceiptId:'cloud-consent:fixture',maxDurationSeconds:1200,maxBillableRequests:1}},created=await repository.getOrCreate(request);
    await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});
    let cloudCalls=0;const cloudClient={health:async()=>({available:true}),transcribe:async()=>{cloudCalls++;return{segments:[{startMs:0,endMs:2500,text:'Private fake Gemini result.'}],durationSeconds:2.5,billableRequests:1};}},service=createAsrFallbackResolver({repository,localClient:{health:async()=>({available:false})},cloudClient,securityHeaders:type=>({'content-type':type})});
    await service.startCloud(created.job.id);for(let attempt=0;attempt<50&&(await repository.get(created.job.id)).status!=='complete';attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    const complete=await repository.get(created.job.id);assert.equal(complete.id,created.job.id);assert.equal(complete.provider,'gemini-progressive');assert.equal(complete.provenance.private,true);assert.equal(complete.provenance.verified,false);assert.equal(cloudCalls,1);

    await service.startCloud(created.job.id);await new Promise(resolve=>setTimeout(resolve,20));assert.equal(cloudCalls,1);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('lease heartbeat and fencing prevent duplicate provider work and stale activation',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-fence-'));let now=10_000;const repository=new ResolverJobRepository({file:join(root,'jobs.json'),now:()=>now});
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableGemini:true,consentVersion:CLOUD_CONSENT_VERSION,consentSubjectId:'phase5-consent-subject:lease-fixture',consentReceiptId:'cloud-consent:fixture',maxDurationSeconds:1200,maxBillableRequests:1}},created=await repository.getOrCreate(request);
    await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});
    let releaseProvider,cloudCalls=0;const held=new Promise(resolve=>{releaseProvider=resolve;}),cloudClient={health:async()=>({available:true}),transcribe:async()=>{cloudCalls++;await held;return{segments:[{startMs:0,endMs:1000,text:'one paid result'}],durationSeconds:1,billableRequests:1};}};
    const serviceA=createAsrFallbackResolver({repository,cloudClient,localClient:{health:async()=>({available:false})},securityHeaders:type=>({'content-type':type}),leaseTtlMs:1000,heartbeatMs:10});
    await serviceA.startCloud(created.job.id);for(let attempt=0;attempt<30&&cloudCalls===0;attempt++)await new Promise(resolve=>setTimeout(resolve,5));
    now=10_900;await new Promise(resolve=>setTimeout(resolve,25));now=11_001;
    const serviceB=createAsrFallbackResolver({repository,cloudClient,localClient:{health:async()=>({available:false})},securityHeaders:type=>({'content-type':type}),leaseTtlMs:1000,heartbeatMs:10});
    await serviceB.startCloud(created.job.id);assert.equal(cloudCalls,1);assert.equal((await repository.get(created.job.id)).status,'partial');
    const current=await repository.get(created.job.id);
    await assert.rejects(()=>repository.transitionForWorker(created.job.id,'complete',{}, {owner:'stale-worker',fencingToken:Number(current.lease.fencingToken)-1}),error=>error.code==='RESTART_RECOVERY');
    releaseProvider();for(let attempt=0;attempt<50&&(await repository.get(created.job.id)).status!=='complete';attempt++)await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal((await repository.get(created.job.id)).status,'complete');assert.equal(cloudCalls,1);
  }finally{await rm(root,{recursive:true,force:true});}
});
