import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';
import { createAsrFallbackResolver } from '../server/asr-fallback-resolver.mjs';
import { CLOUD_CONSENT_VERSION } from '../src/asr-fallback-policy.js';

test('local fallback resumes the same canonical resolver job and persists range checkpoints',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-fallback-job-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')});
  try{
    const request={url:'https://youtu.be/dQw4w9WgXcQ',namespace:'private',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableLocalAsr:true}},created=await repository.getOrCreate(request);
    await repository.transition(created.job.id,'resolving');await repository.transition(created.job.id,'failed',{error:{code:'NO_CAPTION'}});
    let receivedCheckpoints;const localClient={health:async()=>({available:true}),transcribe:async(input,{onBatch})=>{receivedCheckpoints=input.checkpoints;await onBatch({rangeId:'range:0-30000',segments:[{id:'p',startMs:0,endMs:2000,text:'first batch',status:'needs-review'}]});return{segments:[{id:'p',startMs:0,endMs:2000,text:'first batch',status:'needs-review'},{id:'q',startMs:2000,endMs:4000,text:'second batch',status:'needs-review'}],durationSeconds:4};}};
    const service=createAsrFallbackResolver({repository,localClient,securityHeaders:type=>({'content-type':type})});await service.start(created.job.id);
    for(let attempt=0;attempt<50&&(await repository.get(created.job.id)).status!=='complete';attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    const complete=await repository.get(created.job.id);assert.equal(complete.id,created.job.id);assert.equal(complete.status,'complete');assert.equal(complete.provider,'local-asr');assert.equal(complete.asrCheckpoints['range:0-30000'].status,'complete');assert.equal(complete.provenance.verified,false);assert.deepEqual(receivedCheckpoints,{});
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
