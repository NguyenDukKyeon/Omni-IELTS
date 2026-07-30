import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';
import { createAsrFallbackResolver } from '../server/asr-fallback-resolver.mjs';

test('local fallback resumes the same canonical resolver job and persists range checkpoints',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-job-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',namespace:'private',fallback:{enableLocalAsr:true}},created=await repository.getOrCreate(request);
    await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});
    let receivedCheckpoints;const localClient={health:async()=>({available:true}),transcribe:async(input,{onBatch})=>{receivedCheckpoints=input.checkpoints;await onBatch({rangeId:'range:0-30000',segments:[{id:'p',startMs:0,endMs:2000,text:'first batch',status:'needs-review'}]});return{segments:[{id:'p',startMs:0,endMs:2000,text:'first batch',status:'needs-review'},{id:'q',startMs:2000,endMs:4000,text:'second batch',status:'needs-review'}],durationSeconds:4};}};
    const service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);
    for(let attempt=0;attempt<50&&(await repository.get(created.job.id)).status!=='complete';attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    const complete=await repository.get(created.job.id);assert.equal(complete.id,created.job.id);assert.equal(complete.status,'complete');assert.equal(complete.provider,'local-asr');assert.equal(complete.asrCheckpoints['range:0-30000'].status,'complete');assert.equal(complete.provenance.verified,false);assert.deepEqual(receivedCheckpoints,{});
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local fallback cannot run when the request did not explicitly enable it',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-deny-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{const created=await repository.getOrCreate({url:'https://youtu.be/dQw4w9WgXcQ'});await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});const service=createAsrFallbackResolver({repository,localClient:{health:async()=>({available:true})},securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);for(let attempt=0;attempt<30&&(await repository.get(created.job.id)).status!=='failed';attempt++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal((await repository.get(created.job.id)).error.code,'CONSENT_REQUIRED');}finally{await rm(root,{recursive:true,force:true});}
});
