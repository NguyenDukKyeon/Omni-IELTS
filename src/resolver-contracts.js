import { learningContractDigest } from './learning-contracts.js';
import { isSharedPublicEligible,sanitizeFallbackRequest } from './asr-fallback-policy.js';

export const RESOLVER_CONTRACT_VERSION=2;
export const RESOLVER_JOB_STATES=Object.freeze(['queued','resolving','partial','complete','failed','cancelled']);
export const RESOLVER_EVENT_TYPES=Object.freeze(['queued','resolving','metadata','artifact','partial','complete','failed','cancelled']);
export const RESOLVER_ERROR_CODES=Object.freeze(['INVALID_SOURCE','PRIVATE_VIDEO','AGE_RESTRICTED','DELETED','NO_CAPTION','RATE_LIMITED','TIMEOUT','YTDLP_UNAVAILABLE','TRACK_INVALID','ARTIFACT_CORRUPT','CANCELLED','RESTART_RECOVERY','CONSENT_REQUIRED','RIGHTS_INELIGIBLE','LOCAL_COMPANION_UNAVAILABLE','MODEL_UNAVAILABLE','CLOUD_UNAVAILABLE','COST_CAP','MEDIA_LIMIT','PROCESS_FAILED','IMPORT_INVALID','UNKNOWN']);

const clean=(value,max=1600)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
export const resolverError=(code,message,detail={})=>Object.assign(new Error(message),{code:RESOLVER_ERROR_CODES.includes(code)?code:'UNKNOWN',retryable:['RATE_LIMITED','TIMEOUT','YTDLP_UNAVAILABLE','RESTART_RECOVERY'].includes(code),...detail});

export function parseYouTubeSource(input=''){
  const value=String(input??'').trim();
  let videoId=null;
  try{
    const url=new URL(value);const host=url.hostname.toLowerCase().replace(/^www\./,'');
    if(host==='youtu.be')videoId=url.pathname.split('/').filter(Boolean)[0]||null;
    else if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host))videoId=url.pathname==='/watch'?url.searchParams.get('v'):url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]||null;
  }catch{videoId=/^[A-Za-z0-9_-]{11}$/.test(value)?value:null;}
  if(!/^[A-Za-z0-9_-]{11}$/.test(String(videoId||'')))throw resolverError('INVALID_SOURCE','YouTube URL hoặc video ID không hợp lệ.');
  return Object.freeze({provider:'youtube',videoId,canonicalUrl:`https://www.youtube.com/watch?v=${videoId}`,sourceId:`youtube:${videoId}`});
}

export function normalizeResolverRequest(input={}){
  const source=parseYouTubeSource(input.url||input.videoId||'');
  const language=clean(input.language||'en',32).replace('_','-')||'en';
  const sharing=input.sharing&&typeof input.sharing==='object'?input.sharing:{};
  const namespace=input.namespace==='shared'&&isSharedPublicEligible({...sharing,explicitShareOptIn:true})?'shared':'private';
  if(input.namespace==='shared'&&namespace!=='shared')throw resolverError('RIGHTS_INELIGIBLE','Shared-public cache requires a public, no-auth, no-cookie, rights-eligible source and explicit opt-in.');
  if(namespace==='shared'&&input.privateArtifact===true)throw resolverError('INVALID_SOURCE','Private artifact không thể vào shared resolver cache.');
  const fallback=sanitizeFallbackRequest(input.fallback);
  const sourcePolicy={visibility:clean(sharing.visibility||'unknown',40),requiresAuth:sharing.requiresAuth===false?false:true,cookiesUsed:sharing.cookiesUsed===false?false:true,rights:clean(sharing.rights||'unknown',40)};
  return Object.freeze({version:RESOLVER_CONTRACT_VERSION,source,sourcePolicy,language,namespace,fallback,requestKey:`resolver:${learningContractDigest({sourceId:source.sourceId,sourcePolicy,language,namespace,fallback,contract:RESOLVER_CONTRACT_VERSION})}`,requestedAt:Number(input.requestedAt||Date.now())});
}

export function createResolverJob(input={}){
  const request=normalizeResolverRequest(input.request||input);
  const id=clean(input.id,180)||`resolver-job:${learningContractDigest({requestKey:request.requestKey,nonce:input.nonce||request.requestedAt})}`;
  const status=RESOLVER_JOB_STATES.includes(input.status)?input.status:'queued';
  const now=Number(input.updatedAt||request.requestedAt||Date.now());
  return {id,kind:'transcript-resolver-job',schemaVersion:RESOLVER_CONTRACT_VERSION,request,status,eventSequence:Math.max(0,Number(input.eventSequence||0)),lease:null,coverage:{coveredMs:0,startMs:null,endMs:null,complete:false,gaps:[]},artifact:null,revisionId:null,error:null,cancelRequested:false,createdAt:Number(input.createdAt||now),updatedAt:now};
}

export function transitionResolverJob(job={},next,{now=Date.now(),detail={}}={}){
  const allowed={queued:['resolving','cancelled','failed'],resolving:['partial','complete','failed','cancelled'],partial:['partial','complete','failed','cancelled'],complete:[],failed:['queued'],cancelled:[]};
  if(!RESOLVER_JOB_STATES.includes(next)||!(allowed[job.status]||[]).includes(next))throw resolverError('UNKNOWN',`Resolver transition không hợp lệ: ${job.status} → ${next}.`);
  const sequence=Number(job.eventSequence||0)+1;
  const updated={...structuredClone(job),status:next,eventSequence:sequence,updatedAt:Number(now),...detail};
  if(['complete','failed','cancelled'].includes(next))updated.lease=null;
  return {job:updated,event:{id:sequence,type:next,jobId:updated.id,at:Number(now),data:{status:next,coverage:updated.coverage,error:updated.error,revisionId:updated.revisionId}}};
}
