import { V10_STORES } from './v10-contracts.js';
import { getV10Record,putV10Record } from './v10-persistence.js';
import { learningContractDigest } from './learning-contracts.js';

export const PHASE5_POLICY_VERSION='phase5-fallback-v1';
export const CLOUD_CONSENT_VERSION='phase5-gemini-consent-v1';
export const PHASE5_SETTINGS_KEY='phase5:fallback-settings';
export const PHASE5_CONSENT_KEY='phase5:cloud-consent';
export const FALLBACK_PROVIDER_ORDER=Object.freeze(['canonical-private','shared-public-caption','creator-caption','auto-caption','local-asr','gemini','import']);

const clean=(value,max=400)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
const bool=value=>value===true;
export const fallbackPolicyError=(code,message,detail={})=>Object.assign(new Error(message),{code,...detail});

export function isSharedPublicEligible(source={}){
  return source.visibility==='public'
    && source.requiresAuth===false
    && source.cookiesUsed===false
    && source.rights==='eligible'
    && source.explicitShareOptIn===true;
}

export function createCloudConsent(input={},now=Date.now()){
  const accepted=input.decision==='accepted'
    && bool(input.acknowledgesDataTransfer)
    && bool(input.acknowledgesRetention)
    && bool(input.acknowledgesProviderCost);
  const record={
    key:PHASE5_CONSENT_KEY,
    kind:'phase5-cloud-consent',
    schemaVersion:1,
    consentVersion:CLOUD_CONSENT_VERSION,
    decision:accepted?'accepted':'declined',
    acknowledgesDataTransfer:accepted,
    acknowledgesRetention:accepted,
    acknowledgesProviderCost:accepted,
    maxDurationSeconds:Math.max(30,Math.min(1200,Number(input.maxDurationSeconds||1200))),
    maxBillableRequests:1,
    acceptedAt:accepted?Number(now):null,
    updatedAt:Number(now)
  };
  record.receiptId=`cloud-consent:${learningContractDigest(record)}`;
  return Object.freeze(record);
}

export function cloudConsentIsCurrent(record={}){
  return record.kind==='phase5-cloud-consent'
    && record.consentVersion===CLOUD_CONSENT_VERSION
    && record.decision==='accepted'
    && record.acknowledgesDataTransfer===true
    && record.acknowledgesRetention===true
    && record.acknowledgesProviderCost===true
    && /^cloud-consent:/.test(String(record.receiptId||''));
}

export function normalizeFallbackSettings(input={}){
  return Object.freeze({
    key:PHASE5_SETTINGS_KEY,
    kind:'phase5-fallback-settings',
    schemaVersion:1,
    policyVersion:PHASE5_POLICY_VERSION,
    localAsrEnabled:bool(input.localAsrEnabled),
    cloudEnabled:bool(input.cloudEnabled),
    sharedPublicCacheEnabled:bool(input.sharedPublicCacheEnabled),
    rawMediaRetention:'task-temporary',
    updatedAt:Number(input.updatedAt||Date.now())
  });
}

export function capabilityMatrix(input={}){
  const device=input.device==='mobile'?'mobile':'desktop';
  const online=input.online!==false;
  const companion=bool(input.companionAvailable);
  const model=bool(input.modelInstalled);
  const cloud=bool(input.cloudConfigured);
  return Object.freeze({
    device,
    caption:{available:online,reason:online?null:'OFFLINE'},
    localAsr:{available:device==='desktop'&&companion&&model,advertise:device==='desktop',reason:device==='mobile'?'DESKTOP_ONLY':!companion?'COMPANION_UNAVAILABLE':!model?'MODEL_UNAVAILABLE':null},
    gemini:{available:online&&cloud,reason:!online?'OFFLINE':!cloud?'CLOUD_UNAVAILABLE':null},
    import:{available:true,reason:null}
  });
}

export function buildFallbackPolicy({settings={},consent=null,capabilities={},source={}}={}){
  const normalized=normalizeFallbackSettings(settings);
  const matrix=capabilityMatrix(capabilities);
  const sharedPublic=normalized.sharedPublicCacheEnabled&&isSharedPublicEligible(source);
  const localAsr=normalized.localAsrEnabled&&matrix.localAsr.available;
  const gemini=normalized.cloudEnabled&&matrix.gemini.available&&cloudConsentIsCurrent(consent||{});
  return Object.freeze({
    version:PHASE5_POLICY_VERSION,
    namespace:sharedPublic?'shared':'private',
    sharedPublic,
    localAsr,
    gemini,
    consentReceiptId:gemini?consent.receiptId:null,
    consentVersion:gemini?consent.consentVersion:null,
    maxDurationSeconds:gemini?consent.maxDurationSeconds:1200,
    maxBillableRequests:gemini?consent.maxBillableRequests:0,
    providerOrder:[...FALLBACK_PROVIDER_ORDER],
    capability:matrix,
    recovery:matrix.device==='mobile'?['gemini','import']:['local-asr','gemini','import']
  });
}

export async function loadPhase5Preferences(){
  const [settings,consent]=await Promise.all([
    getV10Record(V10_STORES.meta,PHASE5_SETTINGS_KEY),
    getV10Record(V10_STORES.meta,PHASE5_CONSENT_KEY)
  ]);
  return{settings:normalizeFallbackSettings(settings||{}),consent:consent||null};
}

export async function saveFallbackSettings(input={}){
  return putV10Record(V10_STORES.meta,normalizeFallbackSettings(input),'phase5-fallback-settings-saved');
}

export async function saveCloudConsent(input={}){
  const record=cloudConsentIsCurrent(input)?input:createCloudConsent(input);
  return putV10Record(V10_STORES.meta,record,'phase5-cloud-consent-saved');
}

export function assertCloudConsent(consent={}){
  if(!cloudConsentIsCurrent(consent))throw fallbackPolicyError('CONSENT_REQUIRED','Gemini requires explicit current consent for data transfer, retention and provider cost.');
  return consent;
}

export function sanitizeFallbackRequest(input={}){
  const fallback=input&&typeof input==='object'?input:{};
  return Object.freeze({
    policyVersion:fallback.policyVersion===PHASE5_POLICY_VERSION?fallback.policyVersion:PHASE5_POLICY_VERSION,
    enableLocalAsr:bool(fallback.enableLocalAsr),
    enableGemini:bool(fallback.enableGemini),
    consentReceiptId:clean(fallback.consentReceiptId,240)||null,
    consentVersion:clean(fallback.consentVersion,120)||null,
    maxDurationSeconds:Math.max(30,Math.min(1200,Number(fallback.maxDurationSeconds||1200))),
    maxBillableRequests:Math.max(0,Math.min(1,Number(fallback.maxBillableRequests||0)))
  });
}
