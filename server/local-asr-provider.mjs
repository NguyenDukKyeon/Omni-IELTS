import { createReadStream } from 'node:fs';
import { readFile,stat,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolverError } from '../src/resolver-contracts.js';
import { verifyModelArtifact } from './local-model-manager.mjs';

const clean=(value,max=500)=>String(value??'').trim().replace(/[\r\n\0]/g,'').slice(0,max);
const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const speechKey=value=>clean(value,2500).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const normalizeRows=(rows=[],offsetMs=0,sourceId='local',chunk=null)=>(Array.isArray(rows)?rows:[]).map((row,index)=>{
  const startMs=offsetMs+Math.max(0,finite(row.startMs??finite(row.start)*1000));
  const endMs=offsetMs+Math.max(startMs-offsetMs+200,finite(row.endMs??finite(row.end)*1000));
  return{id:`${sourceId}:${offsetMs}:${index+1}`,startMs,endMs,text:clean(row.text,2500),language:clean(row.language,32)||'en',confidence:Number.isFinite(Number(row.confidence))?Math.max(0,Math.min(1,Number(row.confidence))):null,status:'needs-review',verified:false,asrChunk:chunk?{index:chunk.index,rangeId:chunk.rangeId,logicalStartMs:Math.round(chunk.logicalStartSeconds*1000),logicalEndMs:Math.round(chunk.logicalEndSeconds*1000)}:null};
}).filter(row=>row.text&&row.endMs>row.startMs);

export const ASR_CHUNK_VERSION='phase5-asr-chunk-v2';

export function planAsrChunks(durationSeconds,{chunkSeconds=30,overlapSeconds=1.5}={}){
  const duration=Math.max(1,finite(durationSeconds)),size=Math.max(10,Math.min(60,finite(chunkSeconds)||30)),overlap=Math.max(0,Math.min(3,finite(overlapSeconds))),chunks=[];
  for(let origin=0,index=0;origin<duration;origin+=size,index+=1){const start=Math.max(0,origin-(index?overlap:0)),end=Math.min(duration,origin+size+(origin+size<duration?overlap:0));chunks.push({index,rangeId:`range:${Math.round(origin*1000)}-${Math.round(Math.min(duration,origin+size)*1000)}`,startSeconds:start,endSeconds:end,logicalStartSeconds:origin,logicalEndSeconds:Math.min(duration,origin+size)});}
  return chunks;
}

export function mergeAsrBatches(batches=[]){
  const rows=(Array.isArray(batches)?batches:[]).flatMap((batch,batchIndex)=>(Array.isArray(batch)?batch:batch?.segments||[]).map(row=>({...row,__batch:row.asrChunk?.index??batchIndex}))).sort((a,b)=>a.startMs-b.startMs||a.endMs-b.endMs||a.__batch-b.__batch),merged=[];
  for(const row of rows){
    const duplicate=merged.findLast(previous=>{
      if(previous.__batch===row.__batch||speechKey(previous.text)!==speechKey(row.text))return false;
      const overlap=Math.max(0,Math.min(previous.endMs,row.endMs)-Math.max(previous.startMs,row.startMs));
      const shorter=Math.max(1,Math.min(previous.endMs-previous.startMs,row.endMs-row.startMs));
      return overlap/shorter>=0.3;
    });
    if(duplicate){duplicate.startMs=Math.min(duplicate.startMs,row.startMs);duplicate.endMs=Math.max(duplicate.endMs,row.endMs);continue;}
    merged.push(row);
  }
  return merged.map(({__batch,...row},index)=>({...row,id:`local-asr-sentence:${row.startMs}:${row.endMs}:${index+1}`,status:'needs-review',verified:false}));
}

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
    const parsed=JSON.parse(await this.read(outputPath,'utf8'));return normalizeRows(parsed.segments||parsed.transcription||[],Math.round(chunk.startSeconds*1000),task.sourceId,chunk);
  }
  async transcribe({url,language='en',signal=null,onBatch=()=>{},checkpoints={},saveCheckpoint=async()=>{}}={}){
    const capability=await this.health();if(!capability.available)throw resolverError(capability.code||'MODEL_UNAVAILABLE','No valid local Whisper model is installed. The companion will not download one automatically.');
    const binding=Object.freeze({engine:this.engine,modelDigest:capability.modelDigest,modelBytes:capability.modelBytes,chunkVersion:ASR_CHUNK_VERSION,chunkSeconds:this.chunkSeconds,overlapSeconds:this.overlapSeconds});
    const compatible=row=>row?.binding&&Object.keys(binding).every(key=>row.binding[key]===binding[key]);
    const extracted=await this.runtime.extract({url,language,signal}),task=this.runtime.getTask(extracted.id),chunks=planAsrChunks(task.durationSeconds,{chunkSeconds:this.chunkSeconds,overlapSeconds:this.overlapSeconds}),batches=[];
    try{
      for(const chunk of chunks){
        if(signal?.aborted)throw resolverError('CANCELLED','Local ASR cancelled.');
        const checkpoint=checkpoints?.[chunk.rangeId],reused=checkpoint?.status==='complete'&&compatible(checkpoint);let rows=reused?checkpoint.segments:null;
        try{if(!rows)rows=await this.infer(task,chunk,{signal});await saveCheckpoint(chunk.rangeId,{status:'complete',segments:rows,range:chunk,binding,updatedAt:Date.now()});}
        catch(error){await saveCheckpoint(chunk.rangeId,{status:'failed',error:{code:error.code||'PROCESS_FAILED'},range:chunk,binding,updatedAt:Date.now()});throw error;}
        batches.push(rows);if(rows.length)await onBatch({provider:'local-asr',rangeId:chunk.rangeId,chunkIndex:chunk.index,segments:rows,binding,range:chunk,complete:false,needsReview:true,reused});
      }
      const sentences=mergeAsrBatches(batches);
      if(!sentences.length)throw resolverError('TRACK_INVALID','Local ASR produced no usable speech segments.');
      return{provider:'local-asr',namespace:'private',model:this.engine,segments:sentences,complete:true,needsReview:true,durationSeconds:task.durationSeconds,rawMediaRetained:false,checkpointBinding:binding};
    }finally{await this.runtime.cleanup(extracted.id);}
  }
}

export async function resolveCaptionFirst({caption,local,allowLocal=false}={}){
  try{return await caption();}catch(error){if(!allowLocal||!['NO_CAPTION','YTDLP_UNAVAILABLE','TRACK_INVALID'].includes(error?.code))throw error;return local();}
}

export function createLocalCompanionClient({baseUrl=process.env.LOCAL_COMPANION_URL||'http://127.0.0.1:17321',token=process.env.VOCAB_COMPANION_TOKEN||'',fetchImpl=fetch}={}){
  const headers=()=>({'content-type':'application/json','authorization':`Bearer ${token}`,'origin':'http://localhost:3000'});
  return{
    async health(){if(!token)return{available:false,code:'PAIRING_REQUIRED'};try{const response=await fetchImpl(`${baseUrl}/health`,{headers:headers()});return response.ok?{available:true,...await response.json()}:{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'};}catch{return{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'};}},
    async transcribe(input,{signal=null,onBatch=()=>{}}={}){if(!token)throw resolverError('LOCAL_COMPANION_UNAVAILABLE','Local companion pairing is not configured.');const response=await fetchImpl(`${baseUrl}/asr`,{method:'POST',headers:headers(),body:JSON.stringify(input),signal});if(!response.ok){const body=await response.json().catch(()=>({}));throw resolverError(body.error?.code||'LOCAL_COMPANION_UNAVAILABLE',body.error?.message||'Local companion unavailable.');}const text=await response.text(),events=text.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));for(const event of events)if(event.type==='partial')await onBatch(event);const complete=events.findLast(event=>event.type==='complete');if(!complete)throw resolverError('TRACK_INVALID','Local companion returned no completion.');return complete.result;}
  };
}
