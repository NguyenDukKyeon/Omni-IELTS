import { V10_STORES,TRANSCRIPT_PROVIDERS,validateSentenceSegments,normalizeKey,createV10Id } from './v10-contracts.js';
import { listV10Records,putV10Record,getV10Record } from './v10-persistence.js';

const LOCAL_COMPANION_URL='http://127.0.0.1:17321/transcript';
const SESSION_KEY='vocab-master-gemini-key';
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

async function fetchJson(url,options={},timeoutMs=6500){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const response=await fetch(url,{...options,signal:controller.signal});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`HTTP ${response.status}`);return data;}finally{clearTimeout(timer);}}
async function localCacheProvider(context){const row=await getV10Record(V10_STORES.transcriptCache,context.cacheKey);if(!row?.segments?.length)throw new Error('cache-miss');return{...row,cacheHitProvider:'indexeddb',cached:true};}
async function sharedCacheProvider(context){const query=new URLSearchParams({videoId:context.videoId,language:context.language,startSeconds:String(context.startSeconds),endSeconds:String(context.endSeconds)});const data=await fetchJson(`/api/transcript/cache?${query}`,{},2500);if(!data.segments?.length)throw new Error('shared-cache-miss');return{...data,provider:'shared-cache',cached:true};}
async function localCompanionProvider(context){const data=await fetchJson(LOCAL_COMPANION_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:context.url,videoId:context.videoId,languages:[context.language,'en-US','en-GB','en'],startSeconds:context.startSeconds,endSeconds:context.endSeconds,subtitleOnly:true})},25_000);if(!data.segments?.length)throw new Error('local-companion-empty');return{...data,provider:'local-companion'};}
async function backendProvider(context){const data=await fetchJson('/api/transcript/resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:context.url,videoId:context.videoId,language:context.language,startSeconds:context.startSeconds,endSeconds:context.endSeconds,prefer:['caption','auto-caption'],subtitleOnly:true})},25_000);if(!data.segments?.length)throw new Error('backend-provider-empty');return{...data,provider:'backend-provider'};}
async function geminiProvider(context){const headers={'content-type':'application/json'};const state=globalThis.VocabMasterApp?.getState?.();if(state?.settings?.model)headers['x-gemini-model']=state.settings.model;const key=globalThis.sessionStorage?.getItem(SESSION_KEY)||'';if(key)headers['x-gemini-key']=key;const minutes=Math.max(1,Math.ceil((context.endSeconds-context.startSeconds)/60));const data=await fetchJson('/api/ielts/transcript',{method:'POST',headers,body:JSON.stringify({url:context.url,mediaSourceId:`youtube:${context.videoId}`,language:context.language,startSeconds:context.startSeconds,endSeconds:context.endSeconds,minutes})},125_000);if(!data.segments?.length)throw new Error('gemini-transcript-empty');return{...data,provider:'gemini-progressive'};}

const PROVIDERS={indexeddb:localCacheProvider,'shared-cache':sharedCacheProvider,'local-companion':localCompanionProvider,'backend-provider':backendProvider,'gemini-progressive':geminiProvider};

async function saveTranscript(context,result){const segments=normalizeSegmentRows(result.segments,`youtube:${context.videoId}`);if(!segments.length)throw new Error('Transcript không có câu hợp lệ.');const durationSeconds=Math.max(0,finiteNumber(result.durationSeconds,0)),lastEnd=Math.max(0,...segments.map(row=>Number(row.endMs||0)/1000));const row={id:context.cacheKey,cacheKey:context.cacheKey,videoId:context.videoId,url:context.url,language:result.language||context.language,provider:result.provider,title:result.title||'YouTube video',segments,clip:{startSeconds:context.startSeconds,endSeconds:context.endSeconds},durationSeconds,complete:Boolean(result.complete||(durationSeconds&&lastEnd>=durationSeconds-2)),qualityStatus:result.provider==='gemini-progressive'?'needs-review':'available',cachedAt:Date.now(),lastAccessedAt:Date.now(),updatedAt:Date.now(),metadata:{model:result.model||null,previewFeature:Boolean(result.previewFeature),warnings:result.warnings||[],durationSeconds}};await putV10Record(V10_STORES.transcriptCache,row,'transcript-cache-saved');globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-ready',{detail:{...row,partial:!row.complete}}));return row;}

async function firstSuccessful(tasks=[]){return new Promise((resolve,reject)=>{let pending=tasks.length,settled=false;const errors=[];if(!pending)return reject(new Error('Không có transcript provider.'));for(const task of tasks)task().then(value=>{if(settled)return;settled=true;resolve(value);}).catch(error=>{errors.push(error);pending-=1;if(!pending&&!settled)reject(new AggregateError(errors,'Không provider nào trả transcript.'));});});}

export async function resolveTranscriptFast({url,language='en',startSeconds=0,firstChunkSeconds=60,providers=['indexeddb','shared-cache','local-companion','backend-provider'],allowGeminiFallback=true}={}){
  const videoId=parseYouTubeVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');const start=Math.max(0,finiteNumber(startSeconds,0)),endSeconds=Math.max(start+30,start+Math.min(180,finiteNumber(firstChunkSeconds,60)));const context={url,videoId,language,startSeconds:start,endSeconds,cacheKey:transcriptCacheKey({videoId,language,startSeconds:start,endSeconds})};
  const selected=providers.filter(name=>TRANSCRIPT_PROVIDERS.includes(name)&&PROVIDERS[name]);let result;
  try{result=await firstSuccessful(selected.map(name=>()=>PROVIDERS[name](context)));}
  catch(error){if(!allowGeminiFallback)throw error;globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-status',{detail:{status:'ai-fallback',videoId,message:'Không tìm thấy caption nhanh; đang chuẩn bị chunk đầu bằng AI.'}}));result=await geminiProvider(context);}
  const saved=result.cached&&result.id?result:await saveTranscript(context,result);saved.lastAccessedAt=Date.now();await putV10Record(V10_STORES.transcriptCache,saved,'transcript-cache-accessed');return saved;
}

export async function continueTranscriptProgressively({url,language='en',startSeconds=0,totalSeconds=1200,chunkSeconds=60,onChunk=null}={}){
  const videoId=parseYouTubeVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');const chunks=[],origin=Math.max(0,finiteNumber(startSeconds,0)),duration=Math.max(30,finiteNumber(totalSeconds,1200)),size=Math.max(30,Math.min(180,finiteNumber(chunkSeconds,60)));for(let start=origin;start<origin+duration;start+=size){const end=Math.min(origin+duration,start+size);const cacheKey=transcriptCacheKey({videoId,language,startSeconds:start,endSeconds:end});let row=await getV10Record(V10_STORES.transcriptCache,cacheKey);if(!row)row=await resolveTranscriptFast({url,language,startSeconds:start,firstChunkSeconds:end-start});chunks.push(row);onChunk?.(row,chunks);globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-chunk',{detail:{videoId,row,chunksCompleted:chunks.length}}));}return chunks;
}

export async function importTranscript({videoId=createV10Id('imported'),url='',title='Imported transcript',language='en',segments=[]}={}){if(!Array.isArray(segments)||!segments.length)throw new Error('Transcript import đang trống.');const starts=segments.map(row=>segmentTimes(row).startMs/1000),ends=segments.map(row=>segmentTimes(row).endMs/1000),startSeconds=Math.min(...starts),endSeconds=Math.max(...ends);const context={url,videoId,language,startSeconds,endSeconds,cacheKey:transcriptCacheKey({videoId,language,startSeconds,endSeconds})};return saveTranscript(context,{provider:'imported',title,language,segments,durationSeconds:endSeconds,complete:true});}

export async function listCachedTranscripts(videoId=null){const rows=await listV10Records(V10_STORES.transcriptCache,{sortBy:'lastAccessedAt'});return videoId?rows.filter(row=>row.videoId===videoId):rows;}

export function mountTranscriptResolverV2(){globalThis.VocabMasterTranscriptResolver={resolve:resolveTranscriptFast,continue:continueTranscriptProgressively,import:importTranscript,list:listCachedTranscripts,parseVideoId:parseYouTubeVideoId};globalThis.addEventListener('vocab:v10-resolve-video',event=>{const detail=event.detail||{};void resolveTranscriptFast(detail).then(row=>{if(detail.openLoop!==false)globalThis.dispatchEvent(new CustomEvent('vocab:v10-open-sentence-loop',{detail:{sourceId:`youtube:${row.videoId}`,sourceType:'video',title:row.title,sentences:row.segments}}));}).catch(error=>globalThis.dispatchEvent(new CustomEvent('vocab:v10-transcript-status',{detail:{status:'failed',message:error.message}})));});}
