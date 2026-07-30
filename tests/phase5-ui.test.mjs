import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { phase5FallbackMarkup,phase5RecoveryMessage } from '../src/phase5-fallback-ui.js';

async function withCapabilityEnvironment({mobile=false,local=false,cloud=false},task){
  const originalFetch=globalThis.fetch,originalMatch=globalThis.matchMedia,originalWidth=globalThis.innerWidth;
  globalThis.fetch=async url=>{
    assert.equal(String(url),'/api/transcript/capabilities');
    return new Response(JSON.stringify({caption:{available:true},local:{available:local,modelInstalled:local},cloud:{available:cloud,configured:cloud}}),{status:200,headers:{'content-type':'application/json'}});
  };
  globalThis.matchMedia=()=>({matches:mobile});Object.defineProperty(globalThis,'innerWidth',{value:mobile?390:1280,writable:true,configurable:true});
  try{return await task();}finally{globalThis.fetch=originalFetch;globalThis.matchMedia=originalMatch;Object.defineProperty(globalThis,'innerWidth',{value:originalWidth,writable:true,configurable:true});}
}

test('mobile rescue UX never advertises a local binary and keeps cloud off by default',async()=>{
  const html=await withCapabilityEnvironment({mobile:true,cloud:true},()=>phase5FallbackMarkup());
  assert.match(html,/data-phase5-device="mobile"/);assert.doesNotMatch(html,/data-phase5-local/);assert.match(html,/không chạy yt-dlp\/Whisper cục bộ/);assert.match(html,/data-phase5-cloud[^>]*disabled/);assert.match(html,/dữ liệu, lưu giữ và chi phí/);assert.match(html,/data-phase5-import-submit/);
});

test('desktop exposes an available local companion but does not silently enable it',async()=>{
  const html=await withCapabilityEnvironment({local:true},()=>phase5FallbackMarkup());
  assert.match(html,/data-phase5-device="desktop"/);assert.match(html,/data-phase5-local/);assert.doesNotMatch(html,/data-phase5-local[^>]*checked/);
});

test('typed unsupported cases always provide an import-safe recovery',()=>{
  for(const code of ['PRIVATE_VIDEO','AGE_RESTRICTED','DELETED','NO_CAPTION','CLOUD_UNAVAILABLE','RIGHTS_INELIGIBLE'])assert.match(phase5RecoveryMessage({code}),/import|Import/);
});
