import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();globalThis.IDBKeyRange=IDBKeyRange;globalThis.dispatchEvent=()=>true;globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const { V10_STORES }=await import('../src/v10-contracts.js');
const v10=await import('../src/v10-persistence.js');
const { saveCloudConsent,saveFallbackSettings,PHASE5_CONSENT_KEY,PHASE5_SETTINGS_KEY,PHASE5_CONSENT_HISTORY_PREFIX,cloudConsentIsCurrent }=await import('../src/asr-fallback-policy.js');
const { importTranscriptRescue }=await import('../src/transcript-import.js');
const { createResolverJob }=await import('../src/resolver-contracts.js');
const backup=await import('../src/ielts-backup.js');

test('Phase 5 consent, imported revisions and range checkpoints survive backup/restore without credentials or raw media',async()=>{
  await saveCloudConsent({decision:'declined',updatedAt:1000});
  const consent=await saveCloudConsent({decision:'accepted',acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true,updatedAt:1001});
  await saveFallbackSettings({localAsrEnabled:true,cloudEnabled:true});
  const imported=await importTranscriptRescue({videoId:'phase5-backup-video',text:'00:00:00,000 --> 00:00:02,000\nPortable learner transcript.',format:'srt'});
  const job=createResolverJob({request:{url:'https://youtu.be/dQw4w9WgXcQ',sharing:{visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible'},fallback:{enableLocalAsr:true}}});
  const durableJob={...job,status:'partial',requestKey:job.id,asrCheckpoints:{'range:0-30000':{status:'complete',segments:[{startMs:0,endMs:2000,text:'checkpoint'}]}},provenance:{private:true,verified:false},updatedAt:Date.now()};
  await v10.putV10Record(V10_STORES.resolverJobs,durableJob,'phase5-backup-fixture');

  const envelope=await backup.buildCombinedBackup(),serialized=JSON.stringify(envelope),meta=envelope.domains.v10.stores[V10_STORES.meta];
  assert.equal(meta.some(row=>row.key===PHASE5_CONSENT_KEY&&row.receiptId===consent.receiptId),true);
  assert.equal(meta.some(row=>row.key===PHASE5_SETTINGS_KEY&&row.cloudEnabled===true),true);
  assert.equal(meta.filter(row=>row.key.startsWith(PHASE5_CONSENT_HISTORY_PREFIX)).length>=2,true);
  assert.doesNotMatch(serialized,/GEMINI_API_KEY|VOCAB_COMPANION_TOKEN|fake-server-key|source\.wav|WHISPER_MODEL_PATH/);
  assert.equal(envelope.domains.v10.stores[V10_STORES.transcriptCache].find(row=>row.id===imported.id).segments[0].text,'Portable learner transcript.');
  assert.equal(envelope.domains.v10.stores[V10_STORES.resolverJobs].find(row=>row.id===job.id).asrCheckpoints['range:0-30000'].status,'complete');

  await v10.deleteV10Record(V10_STORES.meta,PHASE5_CONSENT_KEY,'phase5-restore-prep');
  await v10.deleteV10Record(V10_STORES.meta,PHASE5_SETTINGS_KEY,'phase5-restore-prep');
  await v10.deleteV10Record(V10_STORES.resolverJobs,job.id,'phase5-restore-prep');
  await backup.restoreCombinedBackup(envelope);
  const restoredConsent=await v10.getV10Record(V10_STORES.meta,PHASE5_CONSENT_KEY),restoredSettings=await v10.getV10Record(V10_STORES.meta,PHASE5_SETTINGS_KEY),restoredMeta=await v10.listV10Records(V10_STORES.meta,{sortBy:null});
  assert.equal(restoredConsent.receiptId,consent.receiptId);
  assert.equal(restoredConsent.reactivationRequired,true);
  assert.equal(cloudConsentIsCurrent(restoredConsent),false);
  assert.equal(restoredSettings.cloudEnabled,false);
  assert.equal(restoredMeta.filter(row=>row.key.startsWith(PHASE5_CONSENT_HISTORY_PREFIX)).length>=2,true);
  assert.equal((await v10.getV10Record(V10_STORES.resolverJobs,job.id)).asrCheckpoints['range:0-30000'].status,'complete');
});
