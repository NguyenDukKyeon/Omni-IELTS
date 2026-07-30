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
  loadPhase5Preferences
} from '../src/asr-fallback-policy.js';
import { normalizeResolverRequest } from '../src/resolver-contracts.js';

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
  const declined=createCloudConsent({decision:'accepted'});
  assert.equal(declined.decision,'declined');
  const accepted=createCloudConsent({decision:'accepted',acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true},1234);
  assert.equal(accepted.consentVersion,CLOUD_CONSENT_VERSION);
  assert.equal(cloudConsentIsCurrent(accepted),true);
  assert.equal(Object.keys(accepted).some(key=>/secret|token|apiKey/i.test(key)),false);
  await saveCloudConsent(accepted);
  assert.equal((await loadPhase5Preferences()).consent.receiptId,accepted.receiptId);
});

test('mobile never advertises a desktop companion capability',()=>{
  const mobile=capabilityMatrix({device:'mobile',online:true,companionAvailable:true,modelInstalled:true,cloudConfigured:true});
  assert.equal(mobile.localAsr.available,false);
  assert.equal(mobile.localAsr.advertise,false);
  assert.equal(mobile.localAsr.reason,'DESKTOP_ONLY');
});
