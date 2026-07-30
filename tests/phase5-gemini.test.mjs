import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeminiAsrProvider,validateGeminiFallbackRequest } from '../server/gemini-asr-provider.mjs';
import { CLOUD_CONSENT_VERSION,createCloudConsent } from '../src/asr-fallback-policy.js';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const job={metadata:{durationSeconds:60},request:{language:'en',source:{canonicalUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},sourcePolicy:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableGemini:true,consentVersion:CLOUD_CONSENT_VERSION,consentSubjectId:'phase5-consent-subject:gemini-fixture',consentReceiptId:'cloud-consent:fixture',maxDurationSeconds:600,maxBillableRequests:1}}};
const response=(value,status=200)=>new Response(JSON.stringify(status===200?{candidates:[{content:{parts:[{text:JSON.stringify(value)}]}}]}:{error:{message:'redacted provider error'}}),{status,headers:{'content-type':'application/json'}});

test('Gemini fallback makes zero request without current explicit consent',async()=>{
  let calls=0;const provider=createGeminiAsrProvider({apiKey:'fake-server-key',authorizeConsent:async()=>true,fetchImpl:async()=>{calls++;return response({});}});
  await assert.rejects(()=>provider.transcribe({...job,request:{...job.request,fallback:{...job.request.fallback,consentReceiptId:null}}}),error=>error.code==='CONSENT_REQUIRED');
  assert.equal(calls,0);
  assert.throws(()=>validateGeminiFallbackRequest({...job,request:{...job.request,sourcePolicy:{...job.request.sourcePolicy,rights:'unknown'}}}),error=>error.code==='RIGHTS_INELIGIBLE');
});

test('Gemini fake provider retries one 429, stays private and needs review',async()=>{
  let calls=0,observedUrl='',observedHeaders={};const provider=createGeminiAsrProvider({apiKey:'fake-server-key',model:'gemini-fixture',authorizeConsent:async()=>true,fetchImpl:async(url,options)=>{observedUrl=String(url);observedHeaders=options.headers;calls++;return calls===1?response({},429):response({segments:[{startMs:0,endMs:2000,text:'Fake cloud transcript.'}]});}});
  const result=await provider.transcribe(job);assert.equal(calls,2);assert.match(observedUrl,/gemini-fixture/);assert.doesNotMatch(observedUrl,/fake-server-key/);assert.equal(observedHeaders['x-goog-api-key'],'fake-server-key');assert.equal(result.namespace,'private');assert.equal(result.needsReview,true);assert.equal(result.verified,false);assert.equal(result.shared,false);assert.equal(result.billableRequests,1);assert.equal(result.uploadedFileRetained,false);
});

test('Gemini availability honestly reports missing server credential',async()=>{
  const provider=createGeminiAsrProvider({apiKey:'',authorizeConsent:async()=>true,fetchImpl:async()=>{throw new Error('must not call');}});
  assert.equal((await provider.health()).available,false);await assert.rejects(()=>provider.transcribe(job),error=>error.code==='CLOUD_UNAVAILABLE');
});

test('Gemini rejects an over-cap source instead of clamping or calling the provider',async()=>{
  let calls=0;const provider=createGeminiAsrProvider({apiKey:'fake-server-key',authorizeConsent:async()=>true,fetchImpl:async()=>{calls++;return response({});}});
  await assert.rejects(()=>provider.transcribe({...job,metadata:{durationSeconds:601}}),error=>error.code==='COST_CAP');
  assert.equal(calls,0);
});

test('durable consent authority rejects forged, withdrawn and stale receipts before Gemini',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-gemini-consent-')),repository=new ResolverJobRepository({file:join(root,'jobs.json')}),subjectId='phase5-consent-subject:durable-gemini-fixture';
  try{
    const accepted=createCloudConsent({decision:'accepted',subjectId,acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true},2000);await repository.recordCloudConsent(accepted);
    let calls=0;const provider=createGeminiAsrProvider({apiKey:'fake-server-key',authorizeConsent:input=>repository.assertCurrentCloudConsent(input),fetchImpl:async()=>{calls++;return response({segments:[{startMs:0,endMs:1000,text:'authorized'}]});}});
    const authorized={...job,request:{...job.request,fallback:{...job.request.fallback,consentSubjectId:subjectId,consentReceiptId:accepted.receiptId}}};
    await provider.transcribe(authorized);assert.equal(calls,1);
    await assert.rejects(()=>provider.transcribe({...authorized,request:{...authorized.request,fallback:{...authorized.request.fallback,consentReceiptId:'cloud-consent:forged'}}}),error=>error.code==='CONSENT_REQUIRED');assert.equal(calls,1);
    const withdrawn=createCloudConsent({decision:'declined',subjectId},2001);await repository.recordCloudConsent(withdrawn);
    await assert.rejects(()=>provider.transcribe(authorized),error=>error.code==='CONSENT_REQUIRED');assert.equal(calls,1);
    await assert.rejects(()=>repository.recordCloudConsent(accepted),error=>error.code==='CONSENT_REQUIRED');
  }finally{await rm(root,{recursive:true,force:true});}
});
