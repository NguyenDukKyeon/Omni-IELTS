import { V10_STORES,createV10Id } from './v10-contracts.js';
import { getV10Record,putV10Record,transactV10 } from './v10-persistence.js';
import { learningContractDigest } from './learning-contracts.js';

export const PHASE5_POLICY_VERSION='phase5-fallback-v1';
export const CLOUD_CONSENT_VERSION='phase5-gemini-consent-v1';
export const PHASE5_SETTINGS_KEY='phase5:fallback-settings';
export const PHASE5_CONSENT_KEY='phase5:cloud-consent';
export const PHASE5_CONSENT_SUBJECT_KEY='phase5:cloud-consent-subject';
export const PHASE5_CONSENT_HISTORY_PREFIX='phase5:cloud-consent-history:';
export const FALLBACK_PROVIDER_ORDER=Object.freeze(['canonical-private','shared-public-caption','creator-caption','auto-caption','local-asr','gemini','import']);

const clean=(value,max=400)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
const bool=value=>value===true;
export const fallbackPolicyError=(code,message,detail={})=>Object.assign(new Error(message),{code,...detail});
const validSubjectId=value=>/^phase5-consent-subject:[A-Za-z0-9_-]{8,160}$/.test(String(value||''));

function consentReceiptPayload(record={}){
  return{
    key:PHASE5_CONSENT_KEY,
    kind:'phase5-cloud-consent',
    schemaVersion:1,
    consentVersion:CLOUD_CONSENT_VERSION,
    subjectId:clean(record.subjectId,200),
    decision:record.decision==='accepted'?'accepted':'declined',
    acknowledgesDataTransfer:record.acknowledgesDataTransfer===true,
    acknowledgesRetention:record.acknowledgesRetention===true,
    acknowledgesProviderCost:record.acknowledgesProviderCost===true,
    maxDurationSeconds:Math.max(30,Math.min(1200,Number(record.maxDurationSeconds||1200))),
    maxBillableRequests:1,
    acceptedAt:Number(record.acceptedAt||0)||null,
    updatedAt:Number(record.updatedAt||0)
  };
}

export function expectedCloudConsentReceiptId(record={}){
  return`cloud-consent:${learningContractDigest(consentReceiptPayload(record))}`;
}

export function cloudConsentIsAuthentic(record={}){
  return validSubjectId(record.subjectId)
    && Number(record.updatedAt)>0
    && String(record.receiptId||'')===expectedCloudConsentReceiptId(record);
}

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
    && bool(input.acknowledgesProviderCost)
    && validSubjectId(input.subjectId);
  const record=consentReceiptPayload({
    subjectId:input.subjectId,
    decision:accepted?'accepted':'declined',
    acknowledgesDataTransfer:accepted,
    acknowledgesRetention:accepted,
    acknowledgesProviderCost:accepted,
    maxDurationSeconds:Math.max(30,Math.min(1200,Number(input.maxDurationSeconds||1200))),
    maxBillableRequests:1,
    acceptedAt:accepted?Number(now):null,
    updatedAt:Number(now)
  });
  record.reactivationRequired=false;
  record.receiptId=expectedCloudConsentReceiptId(record);
  return Object.freeze(record);
}

export function cloudConsentIsCurrent(record={}){
  return cloudConsentIsAuthentic(record)
    && record.kind==='phase5-cloud-consent'
    && record.consentVersion===CLOUD_CONSENT_VERSION
    && record.decision==='accepted'
    && record.acknowledgesDataTransfer===true
    && record.acknowledgesRetention===true
    && record.acknowledgesProviderCost===true
    && record.reactivationRequired!==true;
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
    consentSubjectId:gemini?consent.subjectId:null,
    consentReceiptId:gemini?consent.receiptId:null,
    consentVersion:gemini?consent.consentVersion:null,
    maxDurationSeconds:gemini?consent.maxDurationSeconds:1200,
    maxBillableRequests:gemini?consent.maxBillableRequests:0,
    providerOrder:[...FALLBACK_PROVIDER_ORDER],
    capability:matrix,
    recovery:matrix.device==='mobile'?['gemini','import']:['local-asr','gemini','import']
  });
}

export async function ensurePhase5ConsentSubject(){
  const current=await getV10Record(V10_STORES.meta,PHASE5_CONSENT_SUBJECT_KEY);
  if(validSubjectId(current?.subjectId))return current;
  const created={key:PHASE5_CONSENT_SUBJECT_KEY,kind:'phase5-cloud-consent-subject',schemaVersion:1,subjectId:`phase5-consent-subject:${createV10Id('subject').replace(/[^A-Za-z0-9_-]/g,'_')}`,createdAt:Date.now(),updatedAt:Date.now()};
  return putV10Record(V10_STORES.meta,created,'phase5-cloud-consent-subject-created');
}

export async function loadPhase5Preferences(){
  const [settings,consent,subject]=await Promise.all([
    getV10Record(V10_STORES.meta,PHASE5_SETTINGS_KEY),
    getV10Record(V10_STORES.meta,PHASE5_CONSENT_KEY),
    ensurePhase5ConsentSubject()
  ]);
  return{settings:normalizeFallbackSettings(settings||{}),consent:consent||null,subject};
}

export async function saveFallbackSettings(input={}){
  return putV10Record(V10_STORES.meta,normalizeFallbackSettings(input),'phase5-fallback-settings-saved');
}

export async function saveCloudConsent(input={}){
  const subject=await ensurePhase5ConsentSubject();
  const record=cloudConsentIsAuthentic(input)&&input.subjectId===subject.subjectId
    ?Object.freeze({...input,reactivationRequired:false})
    :createCloudConsent({...input,subjectId:subject.subjectId});
  const history={
    key:`${PHASE5_CONSENT_HISTORY_PREFIX}${record.updatedAt}:${record.receiptId.slice('cloud-consent:'.length)}`,
    kind:'phase5-cloud-consent-history',
    schemaVersion:1,
    subjectId:record.subjectId,
    decision:record.decision,
    consentVersion:record.consentVersion,
    receiptId:record.receiptId,
    acceptedAt:record.acceptedAt,
    consent:structuredClone(record),
    updatedAt:record.updatedAt
  };
  await transactV10([V10_STORES.meta],async({stores,memory,requestResult})=>{
    const put=row=>memory?memory[V10_STORES.meta].set(row.key,structuredClone(row)):stores[V10_STORES.meta].put(structuredClone(row));
    const existing=memory?memory[V10_STORES.meta].get(PHASE5_CONSENT_KEY):await requestResult(stores[V10_STORES.meta].get(PHASE5_CONSENT_KEY));
    if(existing&&Number(existing.updatedAt)>Number(record.updatedAt))throw fallbackPolicyError('CONSENT_REQUIRED','A stale consent decision cannot replace the current durable state.');
    put(record);put(history);
  },'phase5-cloud-consent-saved');
  return record;
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
    consentSubjectId:clean(fallback.consentSubjectId,200)||null,
    consentReceiptId:clean(fallback.consentReceiptId,240)||null,
    consentVersion:clean(fallback.consentVersion,120)||null,
    maxDurationSeconds:Math.max(30,Math.min(1200,Number(fallback.maxDurationSeconds||1200))),
    maxBillableRequests:Math.max(0,Math.min(1,Number(fallback.maxBillableRequests||0)))
  });
}
