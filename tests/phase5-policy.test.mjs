import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {
  CLOUD_CONSENT_VERSION,
  buildFallbackPolicy,
  capabilityMatrix,
  cloudConsentIsCurrent,
  createCloudConsent,
  isSharedPublicEligible,
  saveCloudConsent,
  loadPhase5Preferences,
  PHASE5_CONSENT_HISTORY_PREFIX
} from '../src/asr-fallback-policy.js';
import { normalizeResolverRequest } from '../src/resolver-contracts.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { listV10Records } from '../src/v10-persistence.js';

test('Phase 5 defaults private with cloud and sharing disabled',()=>{
  const policy=buildFallbackPolicy({capabilities:{device:'desktop',online:true,companionAvailable:true,modelInstalled:true,cloudConfigured:true}});
  assert.equal(policy.namespace,'private');
  assert.equal(policy.localAsr,false);
  assert.equal(policy.gemini,false);
  assert.equal(policy.sharedPublic,false);
  assert.deepEqual(policy.providerOrder.slice(0,5),['canonical-private','shared-public-caption','creator-caption','auto-caption','local-asr']);
});

test('shared-public requires every rights, auth, cookie and opt-in condition',()=>{
  const eligible={visibility:'public',requiresAuth:false,cookiesUsed:false,rights:'eligible',explicitShareOptIn:true};
  assert.equal(isSharedPublicEligible(eligible),true);
  for(const patch of [{visibility:'private'},{requiresAuth:true},{cookiesUsed:true},{rights:'unknown'},{explicitShareOptIn:false}])assert.equal(isSharedPublicEligible({...eligible,...patch}),false);
  assert.equal(normalizeResolverRequest({url:'dQw4w9WgXcQ'}).namespace,'private');
  assert.throws(()=>normalizeResolverRequest({url:'dQw4w9WgXcQ',namespace:'shared',sharing:{visibility:'private',requiresAuth:false,cookiesUsed:false,rights:'eligible'}}),error=>error.code==='RIGHTS_INELIGIBLE');
});

test('cloud consent is explicit, versioned and durable without a credential',async()=>{
  const subjectId='phase5-consent-subject:test-policy-subject';
  const declined=createCloudConsent({decision:'accepted',subjectId});
  assert.equal(declined.decision,'declined');
  const accepted=createCloudConsent({decision:'accepted',subjectId,acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true},1234);
  assert.equal(accepted.consentVersion,CLOUD_CONSENT_VERSION);
  assert.equal(cloudConsentIsCurrent(accepted),true);
  assert.equal(cloudConsentIsCurrent({...accepted,receiptId:'cloud-consent:forged'}),false);
  assert.equal(Object.keys(accepted).some(key=>/secret|token|apiKey/i.test(key)),false);
  const durableAccepted=await saveCloudConsent({decision:'accepted',acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true,updatedAt:2000});
  const withdrawn=await saveCloudConsent({decision:'declined',updatedAt:2001});
  const preferences=await loadPhase5Preferences();
  assert.equal(preferences.consent.receiptId,withdrawn.receiptId);
  assert.equal(cloudConsentIsCurrent(preferences.consent),false);
  await assert.rejects(()=>saveCloudConsent(durableAccepted),error=>error.code==='CONSENT_REQUIRED');
  const history=(await listV10Records(V10_STORES.meta,{sortBy:null})).filter(row=>row.key.startsWith(PHASE5_CONSENT_HISTORY_PREFIX));
  assert.equal(history.some(row=>row.receiptId===durableAccepted.receiptId),true);
  assert.equal(history.some(row=>row.receiptId===withdrawn.receiptId),true);
});

test('cloud consent replay is rejected even when accepted and withdrawn share the exact same timestamp',async()=>{
  const originalNow=Date.now;
  try{
    const frozenTime=Date.now() + 100000;
    Date.now=()=>frozenTime;
    const accepted=await saveCloudConsent({decision:'accepted',acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true});
    const withdrawn=await saveCloudConsent({decision:'declined'});
    assert.equal(accepted.updatedAt,frozenTime);
    assert.equal(withdrawn.updatedAt,frozenTime);
    assert.notEqual(accepted.receiptId,withdrawn.receiptId);
    await assert.rejects(()=>saveCloudConsent(accepted),error=>error.code==='CONSENT_REQUIRED');
  }finally{
    Date.now=originalNow;
  }
});

test('mobile never advertises a desktop companion capability',()=>{
  const mobile=capabilityMatrix({device:'mobile',online:true,companionAvailable:true,modelInstalled:true,cloudConfigured:true});
  assert.equal(mobile.localAsr.available,false);
  assert.equal(mobile.localAsr.advertise,false);
  assert.equal(mobile.localAsr.reason,'DESKTOP_ONLY');
});
