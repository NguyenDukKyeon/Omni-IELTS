import { V10_STORES,TRANSCRIPT_PROVIDERS,validateSentenceSegments,normalizeKey,createV10Id } from './v10-contracts.js';
import { listV10Records,putV10Record,getV10Record } from './v10-persistence.js';
import { persistTranscriptAggregate } from './transcript-aggregate.js';

const SEGMENTER_VERSION='v10-sentence-segmenter-2';

export function parseYouTubeVideoId(input=''){
  try{const url=new URL(String(input).trim());const host=url.hostname.replace(/^www\./,'');if(host==='youtu.be')return url.pathname.split('/').filter(Boolean)[0]||null;if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)){if(url.pathname==='/watch')return url.searchParams.get('v');const match=url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);return match?.[1]||null;}}catch{}const value=String(input||'').trim();return /^[A-Za-z0-9_-]{11}$/.test(value)?value:null;
}
export function transcriptCacheKey({videoId,language='en',startSeconds=0,endSeconds=0}={}){return`youtube:${videoId}:${language}:${Math.floor(startSeconds)}:${Math.floor(endSeconds)}:${SEGMENTER_VERSION}`;}

function finiteNumber(value,fallback=0){const number=Number(value);return Number.isFinite(number)?number:fallback;}
function segmentTimes(row={}){const startMs=Number.isFinite(Number(row.startMs))?Number(row.startMs):Number.isFinite(Number(row.start))?Number(row.start)*1000:Number.isFinite(Number(row.offset))?Number(row.offset)*1000:0;const endMs=Number.isFinite(Number(row.endMs))?Number(row.endMs):Number.isFinite(Number(row.end))?Number(row.end)*1000:startMs+Math.max(300,finiteNumber(row.duration,0)*1000);return{startMs,endMs};}

export function repairCaptionTimeline(rows=[]){
  const sorted=(Array.isArray(rows)?rows:[]).map(row=>({...row})).sort((a,b)=>Number(a.startMs||0)-Number(b.startMs||0)||Number(a.endMs||0)-Number(b.endMs||0));
  const output=[];
  for(const row of sorted){
    const current={...row,startMs:Math.max(0,Number(row.startMs||0)),endMs:Math.max(0,Number(row.endMs||0))};
    const previous=output.at(-1);
    if(previous&&current.startMs<previous.endMs-500){
      if(current.startMs>previous.startMs+300)previous.endMs=Math.max(previous.startMs+300,current.startMs);
      else if(current.endMs>previous.endMs+300)current.startMs=previous.endMs;
      else continue;
    }
    if(current.endMs-current.startMs<300)continue;
    output.push(current);
  }
  return output;
}

function normalizeSegmentRows(rows=[],sourceId='source'){
  const raw=(Array.isArray(rows)?rows:[]).map((row,index)=>{const times=segmentTimes(row);return{id:String(row.id||`${sourceId}:segment:${index+1}`),...times,text:String(row.text??row.transcript??'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),status:row.status||'needs-review',confidence:row.confidence??null,language:row.language||'en'};}).filter(row=>row.text&&row.endMs>row.startMs);
  const deRolled=[];for(const row of raw){const previous=deRolled.at(-1);if(previous){const prev=normalizeKey(previous.text),current=normalizeKey(row.text);if(current===prev)continue;if(current.startsWith(prev)&&row.startMs<=previous.endMs+1500){previous.text=row.text;previous.endMs=Math.max(previous.endMs,row.endMs);continue;}if(prev.startsWith(current)&&row.startMs<=previous.endMs+1500)continue;}deRolled.push({...row});}
  const merged=[];for(const row of deRolled){const previous=merged.at(-1);const duration=row.endMs-row.startMs;if(previous&&previous.text.length<50&&!/[.!?]$/.test(previous.text)&&row.startMs-previous.endMs<900&&previous.text.split(' ').length+row.text.split(' ').length<=24){previous.text=`${previous.text} ${row.text}`.replace(/\s+/g,' ');previous.endMs=Math.max(previous.endMs,row.endMs);continue;}if(duration>30_000){const words=row.text.split(' '),parts=Math.ceil(duration/15_000),per=Math.ceil(words.length/parts);for(let part=0;part<parts;part++){const text=words.slice(part*per,(part+1)*per).join(' ');if(!text)continue;const start=row.startMs+Math.round(duration*part/parts),end=row.startMs+Math.round(duration*(part+1)/parts);merged.push({...row,id:`${row.id}:${part+1}`,startMs:start,endMs:end,text});}}else merged.push({...row});}
  const repaired=repairCaptionTimeline(merged);const validation=validateSentenceSegments(repaired);if(!validation.valid)throw new Error(`Transcript normalization lỗi: ${validation.errors.join(' ')}`);return validation.segments;
}

async function fetchJson(url,options={},timeoutMs=6500){const controller=new AbortController(),external=options.signal;const abort=()=>controller.abort(external?.reason);external?.addEventListener?.('abort',abort,{once:true});const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const response=await fetch(url,{...options,signal:controller.signal});const data=await response.json().catch(()=>({}));if(!response.ok){const detail=data.error;throw Object.assign(new Error(typeof detail==='string'?detail:detail?.message||`HTTP ${response.status}`),{code:detail?.code||`HTTP_${response.status}`});}return data;}finally{clearTimeout(timer);external?.removeEventListener?.('abort',abort);}}
async function localCacheProvider(context){const row=await getV10Record(V10_STORES.transcriptCache,context.cacheKey);if(!row?.segments?.length)throw new Error('cache-miss');return{...row,cacheHitProvider:'indexeddb',cached:true};}
async function sharedCacheProvider(context){const query=new URLSearchParams({url:context.url,videoId:context.videoId,language:context.language,startSeconds:String(context.startSeconds),endSeconds:String(context.endSeconds)});const data=await fetchJson(`/api/transcript/cache?${query}`,{},2500);if(!data.segments?.length)throw new Error('shared-cache-miss');return{...data,provider:'shared-cache',cached:true};}

async function persistResolverJob(job,reason='resolver-job-updated'){if(!job?.id)return job;await putV10Record(V10_STORES.resolverJobs,{...job,requestKey:job.id,sourceRequestKey:job.request?.requestKey||job.sourceRequestKey||null,updatedAt:Date.now()},reason);return job;}
async function persistResolverEvent(jobId,event){const sequence=Number(event?.sequence??event?.id??0);if(!jobId||!Number.isFinite(sequence))return;await putV10Record(V10_STORES.resolverEvents,{id:`resolver-client-event:${jobId}:${sequence}`,jobId,sequence,type:event.type||event.data?.status||'progress',data:event.data||{},at:Number(event.at||Date.now()),updatedAt:Date.now()},'resolver-event-received');}
async function readResolverJob(jobId,signal){const data=await fetchJson(`/api/transcript/jobs/${encodeURIComponent(jobId)}`,{signal},25_000);return persistResolverJob(data.job);}
function terminalJob(job){return['complete','failed','cancelled'].includes(job?.status);}
function jobFailure(job){return Object.assign(new Error(job?.error?.message||`Caption resolver ${job?.status||'failed'}.`),{code:job?.error?.code||job?.status||'UNKNOWN',jobId:job?.id,retryable:job?.error?.retryable===true});}

export async function waitForResolverJob(jobId,{signal,onProgress=()=>{},after=0}={}){
  if(!jobId)throw new Error('Resolver job ID bị thiếu.');
  const savedEvents=await listV10Records(V10_STORES.resolverEvents,{index:'jobId',query:jobId,sortBy:null}).catch(()=>[]);
  let cursor=Math.max(Number(after||0),...savedEvents.map(row=>Number(row.sequence||0)),0);
  const inspect=async(emit=true)=>{const job=await readResolverJob(jobId,signal);if(emit)onProgress({status:job.status,jobId,job});if(job?.status==='complete')return job;if(terminalJob(job))throw jobFailure(job);return null;};
  const initial=await inspect();if(initial)return initial;
  if(typeof EventSource==='undefined'){
    for(let attempt=0;attempt<300;attempt+=1){if(signal?.aborted)throw Object.assign(new DOMException('Resolver đã bị hủy.','AbortError'),{jobId});await new Promise(resolve=>setTimeout(resolve,150));const job=await inspect();if(job)return job;}
    throw Object.assign(new Error('Caption resolver quá thời gian.'),{code:'TIMEOUT',jobId});
  }
  return new Promise((resolve,reject)=>{
    let settled=false,reconnects=0,stream=null;
    const finish=(error,job)=>{if(settled)return;settled=true;stream?.close();signal?.removeEventListener?.('abort',abort);error?reject(error):resolve(job);};
    const abort=()=>finish(Object.assign(new DOMException('Resolver đã bị hủy.','AbortError'),{jobId}));
    const connect=()=>{if(settled)return;const query=cursor?`?after=${cursor}`:'';stream=new EventSource(`/api/transcript/jobs/${encodeURIComponent(jobId)}/events${query}`);const receive=async event=>{try{const payload=JSON.parse(event.data);cursor=Math.max(cursor,Number(event.lastEventId||payload.sequence||0));await persistResolverEvent(jobId,{...payload,sequence:cursor});onProgress({status:payload.type||payload.data?.status||'progress',jobId,event:payload,reconnected:reconnects>0});const job=await inspect(false);if(job)finish(null,job);}catch(error){finish(error);}};for(const type of ['queued','resolving','partial','complete','failed','cancelled'])stream.addEventListener(type,receive);stream.onmessage=receive;stream.onerror=async()=>{stream.close();try{const job=await inspect();if(job)return finish(null,job);reconnects+=1;onProgress({status:'reconnecting',jobId,reconnects});setTimeout(connect,Math.min(1000,100*reconnects));}catch(error){finish(error);}};};
    signal?.addEventListener?.('abort',abort,{once:true});connect();
  });
}
async function backendProvider(context){
  let resumedJob=context.resumeJobId?await readResolverJob(context.resumeJobId,context.signal).catch(()=>null):null;
  if(terminalJob(resumedJob)&&resumedJob.status!=='complete')resumedJob=null;
  const created=resumedJob?{job:resumedJob,created:false}:await fetchJson('/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:context.url,videoId:context.videoId,language:context.language,namespace:'shared'}),signal:context.signal},25_000);
  const jobId=created?.job?.id;if(!jobId)throw new Error('resolver-job-create-failed');
  await persistResolverJob(created.job,'resolver-job-created');context.onProgress?.({status:created.job.status||'queued',jobId,job:created.job,resumed:Boolean(context.resumeJobId),deduplicated:created.created===false});
  const job=await waitForResolverJob(jobId,{signal:context.signal,onProgress:context.onProgress});
  if(!Array.isArray(job.sentences)||!job.sentences.length)throw Object.assign(new Error('Caption resolver hoàn tất nhưng không có câu.'),{code:'TRACK_INVALID',jobId});
  return{videoId:context.videoId,title:job.metadata?.title||'YouTube video',language:job.metadata?.track?.language||context.language,durationSeconds:job.metadata?.durationSeconds||0,segments:job.sentences,complete:true,provider:'caption-resolver-v2',jobId,coverage:job.coverage,artifact:job.artifact,captionSource:job.metadata?.track?.kind};
}
const PROVIDERS={indexeddb:localCacheProvider,'shared-cache':sharedCacheProvider,'backend-provider':backendProvider};

async function saveTranscript(context,result){
  const segments=normalizeSegmentRows(result.segments,`youtube:${context.videoId}`);if(!segments.length)throw new Error('Transcript không có câu hợp lệ.');
  const durationSeconds=Math.max(0,finiteNumber(result.durationSeconds,0)),lastEnd=Math.max(0,...segments.map(row=>Number(row.endMs||0)/1000));
  const complete=Boolean(result.complete||(durationSeconds&&lastEnd>=durationSeconds-2));
  const canonical=await persistTranscriptAggregate({
    source:{id:`transcript-source:youtube:${context.videoId}`,namespace:result.provider==='imported'?'private':'shared',externalId:context.videoId,sourceType:'youtube',title:result.title||'YouTube video',url:context.url,language:result.language||context.language,status:result.provider==='imported'?'verified':'unverified',complete},
    segments,
    provenance:{kind:'resolver',provider:result.provider,model:result.model||null,cacheKey:context.cacheKey}
  });
  const segmentBindings=new Map(canonical.segments.map(segment=>[`${segment.startMs}:${segment.endMs}:${normalizeKey(segment.text)}`,segment.id]));
  const boundSegments=segments.map(segment=>({...segment,transcriptRevisionId:canonical.revision.id,canonicalSegmentId:segmentBindings.get(`${segment.startMs}:${segment.endMs}:${normalizeKey(segment.text)}`)||null}));
  const row={id:context.cacheKey,cacheKey:context.cacheKey,videoId:context.videoId,url:context.url,language:result.language||context.language,provider:result.provider,title:result.title||'YouTube video',segments:boundSegments,transcriptSourceId:canonical.source.id,transcriptRevisionId:canonical.revision.id,clip:{startSeconds:context.startSeconds,endSeconds:context.endSeconds},durationSeconds,complete:Boolean(complete),qualityStatus:result.provider==='gemini-progressive'?'needs-review':'available',cachedAt:Date.now(),lastAccessedAt:Date.now(),updatedAt:Date.now(),metadata:{model:result.model||null,previewFeature:Boolean(result.previewFeature),warnings:result.warnings||[],durationSeconds}};
  await putV10Record(V10_STORES.transcriptCache,row,'transcript-cache-saved');globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-ready',{detail:{...row,partial:!row.complete}}));return row;
}

async function firstSuccessful(tasks=[]){return new Promise((resolve,reject)=>{let pending=tasks.length,settled=false;const errors=[];if(!pending)return reject(new Error('Không có transcript provider.'));for(const task of tasks)task().then(value=>{if(settled)return;settled=true;resolve(value);}).catch(error=>{errors.push(error);pending-=1;if(!pending&&!settled)reject(new AggregateError(errors,'Không provider nào trả transcript.'));});});}

export async function resolveTranscriptFast({url,language='en',startSeconds=0,firstChunkSeconds=60,providers=['indexeddb','shared-cache','backend-provider'],signal=null,onProgress=null,resumeJobId=null}={}){
  const videoId=parseYouTubeVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');const start=Math.max(0,finiteNumber(startSeconds,0)),endSeconds=Math.max(start+30,start+Math.min(180,finiteNumber(firstChunkSeconds,60)));const context={url,videoId,language,startSeconds:start,endSeconds,cacheKey:transcriptCacheKey({videoId,language,startSeconds:start,endSeconds})};
  Object.assign(context,{signal,onProgress,resumeJobId});
  const selected=providers.filter(name=>TRANSCRIPT_PROVIDERS.includes(name)&&PROVIDERS[name]);let result,lastError;
  for(const name of selected){try{result=await PROVIDERS[name](context);break;}catch(error){lastError=error;if(name==='backend-provider')throw error;}}
  if(!result)throw lastError||new Error('Không tìm thấy caption phù hợp.');
  const saved=result.cached&&result.id?result:await saveTranscript(context,result);saved.lastAccessedAt=Date.now();await putV10Record(V10_STORES.transcriptCache,saved,'transcript-cache-accessed');return saved;
}

export async function continueTranscriptProgressively({url,language='en',startSeconds=0,totalSeconds=1200,chunkSeconds=60,onChunk=null}={}){
  const videoId=parseYouTubeVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');const chunks=[],origin=Math.max(0,finiteNumber(startSeconds,0)),duration=Math.max(30,finiteNumber(totalSeconds,1200)),size=Math.max(30,Math.min(180,finiteNumber(chunkSeconds,60)));for(let start=origin;start<origin+duration;start+=size){const end=Math.min(origin+duration,start+size);const cacheKey=transcriptCacheKey({videoId,language,startSeconds:start,endSeconds:end});let row=await getV10Record(V10_STORES.transcriptCache,cacheKey);if(!row)row=await resolveTranscriptFast({url,language,startSeconds:start,firstChunkSeconds:end-start});chunks.push(row);onChunk?.(row,chunks);globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-chunk',{detail:{videoId,row,chunksCompleted:chunks.length}}));}return chunks;
}

export async function importTranscript({videoId=createV10Id('imported'),url='',title='Imported transcript',language='en',segments=[]}={}){if(!Array.isArray(segments)||!segments.length)throw new Error('Transcript import đang trống.');const starts=segments.map(row=>segmentTimes(row).startMs/1000),ends=segments.map(row=>segmentTimes(row).endMs/1000),startSeconds=Math.min(...starts),endSeconds=Math.max(...ends);const context={url,videoId,language,startSeconds,endSeconds,cacheKey:transcriptCacheKey({videoId,language,startSeconds,endSeconds})};return saveTranscript(context,{provider:'imported',title,language,segments,durationSeconds:endSeconds,complete:true});}

export async function listCachedTranscripts(videoId=null){const rows=await listV10Records(V10_STORES.transcriptCache,{sortBy:'lastAccessedAt'});return videoId?rows.filter(row=>row.videoId===videoId):rows;}

export async function cancelResolverJob(jobId){const result=await fetchJson(`/api/transcript/jobs/${encodeURIComponent(jobId)}/cancel`,{method:'POST',headers:{'content-type':'application/json'}},10_000);await persistResolverJob(result.job,'resolver-job-cancelled');return result.job;}
export async function listRecoverableResolverJobs(){const jobs=await listV10Records(V10_STORES.resolverJobs,{sortBy:'updatedAt'});return jobs.filter(job=>!terminalJob(job)||(job.status==='failed'&&job.error?.retryable===true)).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));}
export async function resumeResolverJob(jobId,options={}){const saved=await getV10Record(V10_STORES.resolverJobs,jobId);const url=saved?.request?.source?.canonicalUrl||saved?.request?.source?.url;if(!url)throw Object.assign(new Error('Không thể khôi phục URL của resolver job.'),{code:'RESUME_CONTEXT_MISSING',jobId});return resolveTranscriptFast({...options,url,language:saved.request?.language||'en',providers:['backend-provider'],resumeJobId:jobId});}

export function mountTranscriptResolverV2(){globalThis.VocabMasterTranscriptResolver={resolve:resolveTranscriptFast,continue:continueTranscriptProgressively,import:importTranscript,list:listCachedTranscripts,cancel:cancelResolverJob,resume:resumeResolverJob,listRecoverableJobs:listRecoverableResolverJobs,parseVideoId:parseYouTubeVideoId};globalThis.addEventListener('vocab:v10-resolve-video',event=>{const detail=event.detail||{};void resolveTranscriptFast(detail).then(row=>{if(detail.openLoop!==false)globalThis.dispatchEvent(new CustomEvent('vocab:v10-open-sentence-loop',{detail:{sourceId:`youtube:${row.videoId}`,sourceType:'video',title:row.title,sentences:row.segments}}));}).catch(error=>globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-status',{detail:{status:'failed',code:error.code||'UNKNOWN',message:error.message}})));});}
