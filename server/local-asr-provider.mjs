import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFile,stat,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESOLVER_ERROR_CODES,resolverError } from '../src/resolver-contracts.js';
import { verifyModelArtifact } from './local-model-manager.mjs';

const clean=(value,max=500)=>String(value??'').trim().replace(/[\r\n\0]/g,'').slice(0,max);
const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const speechKey=value=>clean(value,2500).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const digest=value=>`sha256:${createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')}`;
const providerHasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const providerPlain=value=>{try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}};
function providerDataOnly(value,seen=new Set(),depth=0){if(value===null||typeof value==='string'||typeof value==='boolean')return true;if(typeof value==='number')return Number.isFinite(value);if(typeof value!=='object'||depth>20||seen.has(value)||(!Array.isArray(value)&&!providerPlain(value)))return false;seen.add(value);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}for(const descriptor of Object.values(descriptors))if(!providerHasOwn(descriptor,'value')||!providerDataOnly(descriptor.value,seen,depth+1))return false;seen.delete(value);return true;}
function providerHasSensitiveKey(value,seen=new Set()){if(!value||typeof value!=='object'||seen.has(value))return false;seen.add(value);for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))){const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();if(/(?:command|argv|binary|executable|path|secret|credential|token|authorization)$/.test(normalized)||normalized==='taskroot'||!providerHasOwn(descriptor,'value')||providerHasSensitiveKey(descriptor.value,seen))return true;}return false;}
const exactProviderKeys=(value,keys)=>providerPlain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>providerHasOwn(value,key));
const sameCanonical=(left,right)=>JSON.stringify(stable(left))===JSON.stringify(stable(right));
const MAX_CHECKPOINT_BYTES=16*1024*1024;
const MAX_CHECKPOINT_ROW_BYTES=1024*1024;
const MAX_CHECKPOINTS=1024;
const BINDING_KEYS=['engine','modelDigest','modelBytes','chunkVersion','chunkSeconds','overlapSeconds','sourceId','language','durationSeconds','planDigest'];
const RANGE_KEYS=['index','rangeId','startSeconds','endSeconds','logicalStartSeconds','logicalEndSeconds'];
const SEGMENT_KEYS=['id','startMs','endMs','text','language','confidence','status','verified','sourceId','bindingDigest','asrChunk'];
const CHUNK_KEYS=['index','rangeId','logicalStartMs','logicalEndMs'];
const RAW_SEGMENT_KEYS=['id','start','end','startMs','endMs','text','language','confidence','status','verified','sourceId','bindingDigest','asrChunk'];
const wordSpans=text=>[...String(text).matchAll(/[\p{L}\p{N}]+/gu)].map(match=>({key:match[0].toLowerCase(),start:match.index,end:match.index+match[0].length}));
const stableSegmentId=row=>`local-asr-segment:${digest({sourceId:row.sourceId||'local',bindingDigest:row.bindingDigest||null,startMs:row.startMs,endMs:row.endMs,text:row.text,language:row.language||'en'})}`;
function canonicalRows(rows,task,chunk,binding){
  if(!Array.isArray(rows)||rows.length>10_000)throw resolverError('TRACK_INVALID','Local ASR range rows are invalid.');const bindingDigest=digest(binding),offsetMs=Math.round(chunk.startSeconds*1000);
  return rows.map(row=>{
    if(!providerPlain(row)||!providerDataOnly(row)||providerHasSensitiveKey(row)||Object.keys(row).some(key=>!RAW_SEGMENT_KEYS.includes(key)))throw resolverError('TRACK_INVALID','Local ASR row is invalid.');const startMs=Number.isFinite(Number(row.startMs))?Number(row.startMs):offsetMs+Math.max(0,finite(row.start)*1000),endMs=Number.isFinite(Number(row.endMs))?Number(row.endMs):offsetMs+Math.max(200,finite(row.end)*1000),text=clean(row.text,2500),language=clean(row.language,32)||binding.language;
    const normalized={startMs,endMs,text,language,confidence:Number.isFinite(Number(row.confidence))?Math.max(0,Math.min(1,Number(row.confidence))):null,status:'needs-review',verified:false,sourceId:binding.sourceId,bindingDigest,asrChunk:{index:chunk.index,rangeId:chunk.rangeId,logicalStartMs:Math.round(chunk.logicalStartSeconds*1000),logicalEndMs:Math.round(chunk.logicalEndSeconds*1000)}};normalized.id=stableSegmentId(normalized);return normalized;
  }).filter(row=>row.text&&row.endMs>row.startMs);
}

export const ASR_CHUNK_VERSION='phase5-asr-chunk-v3';

export function planAsrChunks(durationSeconds,{chunkSeconds=30,overlapSeconds=1.5}={}){
  const duration=Math.max(1,finite(durationSeconds)),size=Math.max(10,Math.min(60,finite(chunkSeconds)||30)),overlap=Math.max(0,Math.min(3,finite(overlapSeconds))),chunks=[];
  for(let origin=0,index=0;origin<duration;origin+=size,index+=1){const start=Math.max(0,origin-(index?overlap:0)),end=Math.min(duration,origin+size+(origin+size<duration?overlap:0));chunks.push({index,rangeId:`range:${Math.round(origin*1000)}-${Math.round(Math.min(duration,origin+size)*1000)}`,startSeconds:start,endSeconds:end,logicalStartSeconds:origin,logicalEndSeconds:Math.min(duration,origin+size)});}
  return chunks;
}

export function mergeAsrBatches(batches=[]){
  const compareText=(a,b)=>String(a)<String(b)?-1:String(a)>String(b)?1:0,seenRows=new Set(),rows=(Array.isArray(batches)?batches:[]).flatMap((batch,batchIndex)=>(Array.isArray(batch)?batch:batch?.segments||[]).map(row=>({...row,__batch:Number(row.asrChunk?.index??batchIndex)}))).filter(row=>Number.isFinite(row.startMs)&&Number.isFinite(row.endMs)&&row.endMs>row.startMs&&clean(row.text,2500)).sort((a,b)=>a.startMs-b.startMs||a.endMs-b.endMs||a.__batch-b.__batch||compareText(a.text,b.text)||compareText(a.id,b.id)).filter(row=>{const identity=JSON.stringify(stable(row));if(seenRows.has(identity))return false;seenRows.add(identity);return true;}),merged=[];
  for(const source of rows){
    const row={...source,text:clean(source.text,2500)},previous=merged.at(-1),adjacent=previous&&row.__batch===previous.__batch+1,temporalOverlap=previous?Math.max(0,Math.min(previous.endMs,row.endMs)-Math.max(previous.startMs,row.startMs)):0;
    if(previous&&adjacent&&temporalOverlap>=200){
      const leftWords=wordSpans(previous.text),rightWords=wordSpans(row.text),limit=Math.min(leftWords.length,rightWords.length);let overlapWords=0;for(let count=1;count<=limit;count++)if(leftWords.slice(-count).every((word,index)=>word.key===rightWords[index].key))overlapWords=count;
      if(overlapWords){
        previous.startMs=Math.min(previous.startMs,row.startMs);previous.endMs=Math.max(previous.endMs,row.endMs);
        if(overlapWords<leftWords.length||overlapWords<rightWords.length){const remainder=row.text.slice(rightWords[overlapWords-1].end).trimStart(),connector=/^[,.;:!?]/u.test(remainder)?'':' ';previous.text=`${previous.text.trimEnd()}${connector}${remainder}`.trim();}
        previous.__batch=row.__batch;
        continue;
      }
    }
    if(previous&&previous.startMs===row.startMs&&previous.endMs===row.endMs&&speechKey(previous.text)===speechKey(row.text))continue;merged.push(row);
  }
  return merged.map(({__batch,...row})=>({...row,id:stableSegmentId(row),status:'needs-review',verified:false}));
}

function createChunkBinding({engine,modelDigest,modelBytes,chunkSeconds,overlapSeconds,task,chunks}){return Object.freeze({engine,modelDigest,modelBytes,chunkVersion:ASR_CHUNK_VERSION,chunkSeconds,overlapSeconds,sourceId:task.sourceId,language:task.language,durationSeconds:task.durationSeconds,planDigest:digest(chunks)});}
function validRange(range,expected){return exactProviderKeys(range,RANGE_KEYS)&&RANGE_KEYS.every(key=>range[key]===expected[key]);}
function validBindingShape(binding){return exactProviderKeys(binding,BINDING_KEYS)&&typeof binding.engine==='string'&&typeof binding.modelDigest==='string'&&Number.isSafeInteger(binding.modelBytes)&&binding.modelBytes>0&&binding.chunkVersion===ASR_CHUNK_VERSION&&Number.isFinite(binding.chunkSeconds)&&Number.isFinite(binding.overlapSeconds)&&typeof binding.sourceId==='string'&&typeof binding.language==='string'&&Number.isFinite(binding.durationSeconds)&&typeof binding.planDigest==='string';}
function validCheckpointSegment(row,range,binding){
  if(!exactProviderKeys(row,SEGMENT_KEYS)||!providerDataOnly(row)||typeof row.text!=='string'||!row.text.trim()||row.text.length>2500||row.language!==binding.language||row.status!=='needs-review'||row.verified!==false||row.sourceId!==binding.sourceId||row.bindingDigest!==digest(binding)||!Number.isFinite(row.startMs)||!Number.isFinite(row.endMs)||row.endMs<=row.startMs||row.startMs<Math.round(range.startSeconds*1000)||row.endMs>Math.round(range.endSeconds*1000)||(row.confidence!==null&&(!Number.isFinite(row.confidence)||row.confidence<0||row.confidence>1))||!exactProviderKeys(row.asrChunk,CHUNK_KEYS)||row.asrChunk.index!==range.index||row.asrChunk.rangeId!==range.rangeId||row.asrChunk.logicalStartMs!==Math.round(range.logicalStartSeconds*1000)||row.asrChunk.logicalEndMs!==Math.round(range.logicalEndSeconds*1000))return false;
  return row.id===stableSegmentId(row);
}
function inspectCheckpoints(checkpoints,chunks,binding){
  if(!providerPlain(checkpoints)||!providerDataOnly(checkpoints))throw resolverError('TRACK_INVALID','Local ASR checkpoints are invalid.');const entries=Object.entries(checkpoints);if(entries.length>MAX_CHECKPOINTS)throw resolverError('MEDIA_LIMIT','Local ASR checkpoint count exceeded its limit.');let serialized;try{serialized=JSON.stringify(checkpoints);}catch{throw resolverError('TRACK_INVALID','Local ASR checkpoints are invalid.');}if(Buffer.byteLength(serialized,'utf8')>MAX_CHECKPOINT_BYTES)throw resolverError('MEDIA_LIMIT','Local ASR checkpoints exceeded their limit.');const reusable=new Map(),planned=new Map(chunks.map(chunk=>[chunk.rangeId,chunk]));
  for(const [rangeId,row] of entries){let rowText;try{rowText=JSON.stringify(row);}catch{throw resolverError('TRACK_INVALID','Local ASR checkpoint is invalid.');}if(Buffer.byteLength(rowText??'','utf8')>MAX_CHECKPOINT_ROW_BYTES)throw resolverError('MEDIA_LIMIT','Local ASR checkpoint row exceeded its limit.');if(!providerPlain(row)){continue;}const revision=providerPlain(row.binding)?row.binding.chunkVersion:null;if(revision!==ASR_CHUNK_VERSION)continue;if(!validBindingShape(row.binding))throw resolverError('TRACK_INVALID','Current local ASR checkpoint binding is malformed.');if(!sameCanonical(row.binding,binding))continue;const range=planned.get(rangeId);if(!range||!validRange(row.range,range)||!Number.isFinite(row.updatedAt)||row.updatedAt<0)throw resolverError('TRACK_INVALID','Current local ASR checkpoint range is invalid.');
    if(row.status==='complete'){
      if(!exactProviderKeys(row,['status','segments','binding','range','updatedAt'])||!Array.isArray(row.segments)||row.segments.length>10_000||row.segments.some(segment=>!validCheckpointSegment(segment,range,binding)))throw resolverError('TRACK_INVALID','Current local ASR checkpoint segments are invalid.');reusable.set(rangeId,row.segments.map(segment=>structuredClone(segment)));continue;
    }
    if(row.status==='failed'){if(!exactProviderKeys(row,['status','error','binding','range','updatedAt'])||!exactProviderKeys(row.error,['code'])||!RESOLVER_ERROR_CODES.includes(row.error.code))throw resolverError('TRACK_INVALID','Current local ASR failed checkpoint is invalid.');continue;}
    throw resolverError('TRACK_INVALID','Current local ASR checkpoint status is invalid.');
  }
  return reusable;
}
function withRangeFailure(error,chunk,binding){const code=RESOLVER_ERROR_CODES.includes(error?.code)?error.code:'PROCESS_FAILED',failure={rangeId:chunk.rangeId,chunkIndex:chunk.index,range:structuredClone(chunk),binding:structuredClone(binding)};return Object.assign(resolverError(code,code==='CANCELLED'?'Local ASR cancelled.':'Local ASR range failed.'),{asrFailure:failure});}

export class LocalAsrProvider{
  constructor({
    runtime,
    engine=process.env.VOCAB_ASR_ENGINE||'faster-whisper',
    modelPath=process.env.WHISPER_MODEL_PATH||'',
    modelDigest=process.env.WHISPER_MODEL_SHA256||'',
    modelBytes=process.env.WHISPER_MODEL_BYTES||'',
    whisperBinary=process.env.WHISPER_BINARY||'whisper-cli',
    pythonBinary=process.env.PYTHON_BINARY||'python',
    adapterScript=fileURLToPath(new URL('../scripts/faster-whisper-adapter.py',import.meta.url)),
    read=readFile,
    write=writeFile,
    fileStat=stat,
    openReadStream=createReadStream,
    chunkSeconds=30,
    overlapSeconds=1.5
  }={}){
    if(!runtime)throw resolverError('LOCAL_COMPANION_UNAVAILABLE','Local ASR requires the secure companion runtime.');
    this.runtime=runtime;this.engine=engine;this.modelPath=clean(modelPath,1000);this.modelDigest=clean(modelDigest,100);this.modelBytes=Number(modelBytes);this.whisperBinary=clean(whisperBinary,500);this.pythonBinary=clean(pythonBinary,500);this.adapterScript=adapterScript;this.read=read;this.write=write;this.fileStat=fileStat;this.openReadStream=openReadStream;this.chunkSeconds=chunkSeconds;this.overlapSeconds=overlapSeconds;
  }
  async health(){
    try{const verified=await verifyModelArtifact({path:this.modelPath,expectedBytes:this.modelBytes,expectedDigest:this.modelDigest,fileStat:this.fileStat,openReadStream:this.openReadStream});return{available:true,engine:this.engine,modelPathConfigured:true,...verified,modelStorageDisclosure:true,autoDownload:false};}
    catch(error){return{available:false,code:error.code||'MODEL_UNAVAILABLE',autoDownload:false};}
  }
  async infer(task,chunk,{signal=null}={}){
    const chunkPath=join(task.directory,`chunk-${chunk.index}.wav`),outputPath=join(task.directory,`chunk-${chunk.index}.json`);
    await this.runtime.runProcess(this.runtime.ffmpegBinary,['-nostdin','-hide_banner','-loglevel','error','-ss',String(chunk.startSeconds),'-to',String(chunk.endSeconds),'-i',task.audioPath,'-ac','1','-ar','16000','-y',chunkPath],{signal,timeoutMs:60_000,maxOutputBytes:100_000});
    if(this.engine==='whisper.cpp')await this.runtime.runProcess(this.whisperBinary,['-m',this.modelPath,'-f',chunkPath,'-oj','-of',outputPath.replace(/\.json$/,'')],{signal,timeoutMs:180_000,maxOutputBytes:1_000_000});
    else await this.runtime.runProcess(this.pythonBinary,[this.adapterScript,'--model',this.modelPath,'--input',chunkPath,'--output',outputPath,'--language',task.language],{signal,timeoutMs:180_000,maxOutputBytes:1_000_000});
    const parsed=JSON.parse(await this.read(outputPath,'utf8'));return parsed.segments||parsed.transcription||[];
  }
  async transcribe({url,language='en',signal=null,onBatch=()=>{},checkpoints={},saveCheckpoint=async()=>{}}={}){
    const capability=await this.health();if(!capability.available)throw resolverError(capability.code||'MODEL_UNAVAILABLE','No valid local Whisper model is installed. The companion will not download one automatically.');
    const extracted=await this.runtime.extract({url,language,signal,retainForUse:true});
    try{
      const task=this.runtime.getTask(extracted.id);if(!task)throw resolverError('PROCESS_FAILED','Local ASR task is unavailable.');const chunks=planAsrChunks(task.durationSeconds,{chunkSeconds:this.chunkSeconds,overlapSeconds:this.overlapSeconds}),binding=createChunkBinding({engine:this.engine,modelDigest:capability.modelDigest,modelBytes:capability.modelBytes,chunkSeconds:this.chunkSeconds,overlapSeconds:this.overlapSeconds,task,chunks}),reusable=inspectCheckpoints(checkpoints,chunks,binding),batches=[];
      for(const chunk of chunks){
        const reused=reusable.has(chunk.rangeId);let rows=reused?reusable.get(chunk.rangeId):null;
        if(!reused)try{if(signal?.aborted)throw resolverError('CANCELLED','Local ASR cancelled.');rows=canonicalRows(await this.infer(task,chunk,{signal,binding}),task,chunk,binding);if(rows.some(row=>!validCheckpointSegment(row,chunk,binding)))throw resolverError('TRACK_INVALID','Local ASR range produced invalid rows.');const checkpoint={status:'complete',segments:rows,range:chunk,binding,updatedAt:Date.now()};await saveCheckpoint(chunk.rangeId,checkpoint);await onBatch({provider:'local-asr',rangeId:chunk.rangeId,chunkIndex:chunk.index,segments:rows,binding,range:chunk,complete:false,needsReview:true,reused:false});}
        catch(error){const failure=withRangeFailure(error,chunk,binding);await saveCheckpoint(chunk.rangeId,{status:'failed',error:{code:failure.code},range:chunk,binding,updatedAt:Date.now()});throw failure;}
        batches.push(rows);
      }
      const sentences=mergeAsrBatches(batches);
      if(!sentences.length)throw resolverError('TRACK_INVALID','Local ASR produced no usable speech segments.');
      return{provider:'local-asr',namespace:'private',model:this.engine,segments:sentences,complete:true,needsReview:true,durationSeconds:task.durationSeconds,rawMediaRetained:false,checkpointBinding:binding};
    }finally{this.runtime.releaseTask?.(extracted.id);await this.runtime.cleanup(extracted.id);}
  }
}

export async function resolveCaptionFirst({caption,local,allowLocal=false}={}){
  try{return await caption();}catch(error){if(!allowLocal||!['NO_CAPTION','YTDLP_UNAVAILABLE','TRACK_INVALID'].includes(error?.code))throw error;return local();}
}

const CLIENT_RESPONSE_MAX_BYTES=16*1024*1024;
const CLIENT_LINE_MAX_BYTES=1024*1024;
const CLIENT_EVENT_MAX=1024;
const clientHasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const clientPlain=value=>{try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}};
function clientFailure(code,message,detail={}){return resolverError(code,message,detail);}
function clientDataOnly(value,seen=new Set(),depth=0){if(value===null||typeof value==='string'||typeof value==='boolean')return true;if(typeof value==='number')return Number.isFinite(value);if(typeof value!=='object'||depth>20||seen.has(value)||(!Array.isArray(value)&&!clientPlain(value)))return false;seen.add(value);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}for(const descriptor of Object.values(descriptors))if(!clientHasOwn(descriptor,'value')||!clientDataOnly(descriptor.value,seen,depth+1))return false;seen.delete(value);return true;}
function hasSensitiveResponseKey(value,seen=new Set()){
  if(!value||typeof value!=='object'||seen.has(value))return false;seen.add(value);for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))){const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();if(/(?:command|argv|binary|executable|path|secret|credential|token|authorization)$/.test(normalized)||normalized==='taskroot'||!clientHasOwn(descriptor,'value')||hasSensitiveResponseKey(descriptor.value,seen))return true;}return false;
}
function readClientOptions(options){
  if(!clientPlain(options))throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion configuration is invalid.');let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(options);}catch{throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion configuration is invalid.');}const allowed=['baseUrl','token','fetchImpl'];if(Object.keys(descriptors).some(key=>!allowed.includes(key))||Object.values(descriptors).some(descriptor=>!clientHasOwn(descriptor,'value')))throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion configuration is invalid.');return Object.fromEntries(Object.entries(descriptors).map(([key,descriptor])=>[key,descriptor.value]));
}
function normalizeCompanionBaseUrl(value){
  if(typeof value!=='string')throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion URL is invalid.');let parsed;try{parsed=new URL(value);}catch{throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion URL is invalid.');}if(parsed.protocol!=='http:'||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash||!['127.0.0.1','localhost','[::1]'].includes(parsed.hostname.toLowerCase())||value.replace(/\/$/,'')!==parsed.origin)throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion URL is invalid.');return parsed.origin;
}
function validClientToken(value){return typeof value==='string'&&!/[\s\u0000-\u001f\u007f]/u.test(value)&&Buffer.byteLength(value,'utf8')>=32&&Buffer.byteLength(value,'utf8')<=256;}
function validateClientCheckpoints(checkpoints){
  if(!clientPlain(checkpoints)||!clientDataOnly(checkpoints))throw clientFailure('TRACK_INVALID','Local companion checkpoints are invalid.');const descriptors=Object.getOwnPropertyDescriptors(checkpoints),keys=Object.keys(descriptors);if(keys.length>MAX_CHECKPOINTS)throw clientFailure('MEDIA_LIMIT','Local companion checkpoint count exceeded its limit.');for(const key of keys){const text=JSON.stringify(descriptors[key].value);if(Buffer.byteLength(text??'','utf8')>MAX_CHECKPOINT_ROW_BYTES)throw clientFailure('MEDIA_LIMIT','Local companion checkpoint row exceeded its limit.');}
}
async function readBoundedResponse(response,{maxBytes=CLIENT_RESPONSE_MAX_BYTES}={}){
  let total=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});
  if(response.body&&typeof response.body[Symbol.asyncIterator]==='function')for await(const chunk of response.body){const bytes=chunk instanceof Uint8Array?chunk:new Uint8Array(chunk);total+=bytes.byteLength;if(total>maxBytes)throw clientFailure('MEDIA_LIMIT','Local companion response exceeded its limit.');text+=decoder.decode(bytes,{stream:true});}else{const bytes=new Uint8Array(await response.arrayBuffer());total=bytes.byteLength;if(total>maxBytes)throw clientFailure('MEDIA_LIMIT','Local companion response exceeded its limit.');text=decoder.decode(bytes);return text;}
  return text+decoder.decode();
}
function validatePartialEvent(event){
  const keys=['type','provider','rangeId','chunkIndex','segments','binding','range','complete','needsReview','reused'];return clientPlain(event)&&Object.keys(event).length===keys.length&&keys.every(key=>clientHasOwn(event,key))&&event.type==='partial'&&event.provider==='local-asr'&&typeof event.rangeId==='string'&&event.rangeId.length>0&&Number.isInteger(event.chunkIndex)&&event.chunkIndex>=0&&Array.isArray(event.segments)&&event.segments.length<=10_000&&clientPlain(event.binding)&&clientPlain(event.range)&&event.complete===false&&event.needsReview===true&&typeof event.reused==='boolean'&&clientDataOnly(event)&&!hasSensitiveResponseKey(event);
}
function validateCompleteEvent(event){return clientPlain(event)&&Object.keys(event).length===2&&event.type==='complete'&&clientPlain(event.result)&&event.result.provider==='local-asr'&&event.result.namespace==='private'&&event.result.complete===true&&Array.isArray(event.result.segments)&&clientDataOnly(event.result)&&!hasSensitiveResponseKey(event.result);}
function validateErrorEvent(event){
  if(!clientPlain(event)||!exactClientKeys(event,['type','error','rangeId','chunkIndex','range','binding'])||event.type!=='error'||!clientPlain(event.error)||!exactClientKeys(event.error,['code'])||!RESOLVER_ERROR_CODES.includes(event.error.code)||!clientDataOnly(event)||hasSensitiveResponseKey(event))return false;const absent=event.rangeId===null&&event.chunkIndex===null&&event.range===null&&event.binding===null;if(absent)return true;return typeof event.rangeId==='string'&&event.rangeId.length>0&&Number.isInteger(event.chunkIndex)&&event.chunkIndex>=0&&clientPlain(event.range)&&clientPlain(event.binding);
}
function exactClientKeys(value,keys){return clientPlain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>clientHasOwn(value,key));}
function parseCompanionEvents(text){
  const rawLines=text.split(/\r?\n/);if(rawLines.at(-1)==='')rawLines.pop();if(!rawLines.length||rawLines.some(line=>line.length===0))throw clientFailure('TRACK_INVALID','Local companion response framing is invalid.');if(rawLines.length>CLIENT_EVENT_MAX)throw clientFailure('MEDIA_LIMIT','Local companion response contains too many events.');
  const events=[];for(const line of rawLines){if(Buffer.byteLength(line,'utf8')>CLIENT_LINE_MAX_BYTES)throw clientFailure('MEDIA_LIMIT','Local companion response line exceeded its limit.');let event;try{event=JSON.parse(line);}catch{throw clientFailure('TRACK_INVALID','Local companion response JSON is invalid.');}events.push(event);}
  let complete=null,completed=false;const partials=[];for(const event of events){if(event?.type==='partial'){if(completed||!validatePartialEvent(event))throw clientFailure('TRACK_INVALID','Local companion partial event is invalid.');partials.push(event);continue;}if(event?.type==='complete'){if(completed||!validateCompleteEvent(event))throw clientFailure('TRACK_INVALID','Local companion completion is invalid.');completed=true;complete=event;continue;}throw clientFailure('TRACK_INVALID','Local companion event type is invalid.');}if(!complete)throw clientFailure('TRACK_INVALID','Local companion returned no completion.');return{partials,result:complete.result};
}

async function readProgressiveEvents(response,onBatch){
  let total=0,pending='',events=0,lastChunk=-1,terminal=null;const decoder=new TextDecoder('utf-8',{fatal:true});
  const processLine=async line=>{if(!line||Buffer.byteLength(line,'utf8')>CLIENT_LINE_MAX_BYTES)throw clientFailure(line?'MEDIA_LIMIT':'TRACK_INVALID','Local companion response framing is invalid.');if(++events>CLIENT_EVENT_MAX)throw clientFailure('MEDIA_LIMIT','Local companion response contains too many events.');let event;try{event=JSON.parse(line);}catch{throw clientFailure('TRACK_INVALID','Local companion response JSON is invalid.');}if(terminal)throw clientFailure('TRACK_INVALID','Local companion emitted data after its terminal event.');if(event?.type==='partial'){if(!validatePartialEvent(event)||event.chunkIndex<=lastChunk)throw clientFailure('TRACK_INVALID','Local companion partial event is invalid or out of order.');lastChunk=event.chunkIndex;await onBatch(event);return;}if(event?.type==='complete'){if(!validateCompleteEvent(event))throw clientFailure('TRACK_INVALID','Local companion completion is invalid.');terminal=event;return;}if(event?.type==='error'){if(!validateErrorEvent(event))throw clientFailure('TRACK_INVALID','Local companion terminal error is invalid.');terminal=event;return;}throw clientFailure('TRACK_INVALID','Local companion event type is invalid.');};
  const consume=async bytes=>{total+=bytes.byteLength;if(total>CLIENT_RESPONSE_MAX_BYTES)throw clientFailure('MEDIA_LIMIT','Local companion response exceeded its limit.');pending+=decoder.decode(bytes,{stream:true});let newline;while((newline=pending.indexOf('\n'))>=0){let line=pending.slice(0,newline);pending=pending.slice(newline+1);if(line.endsWith('\r'))line=line.slice(0,-1);await processLine(line);}if(Buffer.byteLength(pending,'utf8')>CLIENT_LINE_MAX_BYTES)throw clientFailure('MEDIA_LIMIT','Local companion response line exceeded its limit.');};
  if(response.body&&typeof response.body[Symbol.asyncIterator]==='function')for await(const chunk of response.body)await consume(chunk instanceof Uint8Array?chunk:new Uint8Array(chunk));else await consume(new Uint8Array(await response.arrayBuffer()));pending+=decoder.decode();if(pending)throw clientFailure('TRACK_INVALID','Local companion response was truncated.');if(!terminal)throw clientFailure('TRACK_INVALID','Local companion returned no terminal event.');if(terminal.type==='error')throw clientFailure(terminal.error.code,'Local companion ASR range failed.',{asrFailure:{rangeId:terminal.rangeId,chunkIndex:terminal.chunkIndex,range:terminal.range,binding:terminal.binding}});return terminal.result;
}

export function createLocalCompanionClient(options={}){
  const values=readClientOptions(options),baseUrl=normalizeCompanionBaseUrl(values.baseUrl??process.env.LOCAL_COMPANION_URL??'http://127.0.0.1:17321'),token=values.token??process.env.VOCAB_COMPANION_TOKEN??'',fetchImpl=values.fetchImpl??fetch,paired=validClientToken(token);if(typeof fetchImpl!=='function')throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion fetch implementation is invalid.');
  const headers=()=>({'content-type':'application/json','authorization':`Bearer ${token}`,'origin':'http://localhost:3000'});
  return{
    async health(){if(!paired)return{available:false,code:'PAIRING_REQUIRED'};try{const response=await fetchImpl(`${baseUrl}/health`,{headers:headers()}),text=await readBoundedResponse(response);if(!response.ok)return{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'};const body=JSON.parse(text);return clientPlain(body)&&clientDataOnly(body)?{...body,available:body.available===true}:{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'};}catch{return{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'};}},
    async transcribe(input,callOptions={}){
      if(!paired)throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion pairing is not configured.');if(!clientPlain(input)||!clientDataOnly(input)||!clientHasOwn(input,'url')||Object.keys(input).some(key=>!['url','language','checkpoints'].includes(key))||typeof input.url!=='string'||!input.url.trim())throw clientFailure('INVALID_SOURCE','Local companion request is invalid.');if(clientHasOwn(input,'checkpoints'))validateClientCheckpoints(input.checkpoints);
      const call=clientPlain(callOptions)?Object.getOwnPropertyDescriptors(callOptions):null;if(!call||Object.keys(call).some(key=>!['signal','onBatch'].includes(key))||Object.values(call).some(descriptor=>!clientHasOwn(descriptor,'value')))throw clientFailure('INVALID_SOURCE','Local companion call options are invalid.');const signal=call.signal?.value??null,onBatch=call.onBatch?.value??(()=>{});if(typeof onBatch!=='function')throw clientFailure('INVALID_SOURCE','Local companion batch callback is invalid.');let requestBody;try{requestBody=JSON.stringify(input);}catch{throw clientFailure('INVALID_SOURCE','Local companion request is invalid.');}if(Buffer.byteLength(requestBody,'utf8')>MAX_CHECKPOINT_BYTES)throw clientFailure('MEDIA_LIMIT','Local companion request exceeded its limit.');
      let response;try{response=await fetchImpl(`${baseUrl}/asr`,{method:'POST',headers:headers(),body:requestBody,signal});}catch(error){if(error?.name==='AbortError'||signal?.aborted)throw clientFailure('CANCELLED','Local companion request was cancelled.');throw clientFailure('LOCAL_COMPANION_UNAVAILABLE','Local companion unavailable.');}
      if(!response.ok){let body={};try{body=JSON.parse(await readBoundedResponse(response,{maxBytes:1024*1024}));}catch(error){if(error?.code==='MEDIA_LIMIT')throw error;}const code=RESOLVER_ERROR_CODES.includes(body.error?.code)?body.error.code:'LOCAL_COMPANION_UNAVAILABLE',candidate={type:'error',error:{code},rangeId:body.error?.rangeId??null,chunkIndex:body.error?.chunkIndex??null,range:body.error?.range??null,binding:body.error?.binding??null},detail=validateErrorEvent(candidate)?{asrFailure:{rangeId:candidate.rangeId,chunkIndex:candidate.chunkIndex,range:candidate.range,binding:candidate.binding}}:{};throw clientFailure(code,'Local companion unavailable.',detail);}
      if(!/^application\/x-ndjson(?:\s*;\s*charset=utf-8)?$/i.test(response.headers?.get?.('content-type')||''))throw clientFailure('TRACK_INVALID','Local companion response content type is invalid.');const protocol=response.headers?.get?.('x-vocab-asr-protocol-version')||'';if(protocol&&protocol!=='1'&&protocol!=='2')throw clientFailure('TRACK_INVALID','Local companion response protocol is unsupported.');
      try{if(protocol==='2')return await readProgressiveEvents(response,onBatch);const parsed=parseCompanionEvents(await readBoundedResponse(response));for(const event of parsed.partials)await onBatch(event);return parsed.result;}catch(error){if(RESOLVER_ERROR_CODES.includes(error?.code))throw error;throw clientFailure('TRACK_INVALID','Local companion response encoding is invalid.');}
    }
  };
}
