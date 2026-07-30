import { readFile,stat,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolverError } from '../src/resolver-contracts.js';

const clean=(value,max=500)=>String(value??'').trim().replace(/[\r\n\0]/g,'').slice(0,max);
const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const normalizeRows=(rows=[],offsetMs=0,sourceId='local')=>(Array.isArray(rows)?rows:[]).map((row,index)=>{
  const startMs=offsetMs+Math.max(0,finite(row.startMs??finite(row.start)*1000));
  const endMs=offsetMs+Math.max(startMs-offsetMs+200,finite(row.endMs??finite(row.end)*1000));
  return{id:`${sourceId}:${offsetMs}:${index+1}`,startMs,endMs,text:clean(row.text,2500),language:clean(row.language,32)||'en',confidence:Number.isFinite(Number(row.confidence))?Math.max(0,Math.min(1,Number(row.confidence))):null,status:'needs-review',verified:false};
}).filter(row=>row.text&&row.endMs>row.startMs);

export function planAsrChunks(durationSeconds,{chunkSeconds=30,overlapSeconds=1.5}={}){
  const duration=Math.max(1,finite(durationSeconds)),size=Math.max(10,Math.min(60,finite(chunkSeconds)||30)),overlap=Math.max(0,Math.min(3,finite(overlapSeconds))),chunks=[];
  for(let origin=0,index=0;origin<duration;origin+=size,index+=1){const start=Math.max(0,origin-(index?overlap:0)),end=Math.min(duration,origin+size+(origin+size<duration?overlap:0));chunks.push({index,rangeId:`range:${Math.round(origin*1000)}-${Math.round(Math.min(duration,origin+size)*1000)}`,startSeconds:start,endSeconds:end,logicalStartSeconds:origin,logicalEndSeconds:Math.min(duration,origin+size)});}
  return chunks;
}

export function mergeAsrBatches(batches=[]){
  const rows=(Array.isArray(batches)?batches:[]).flatMap(batch=>Array.isArray(batch)?batch:batch?.segments||[]).map(row=>({...row})).sort((a,b)=>a.startMs-b.startMs||a.endMs-b.endMs||String(a.id).localeCompare(String(b.id))),merged=[];
  for(const row of rows){const previous=merged.at(-1);if(previous&&row.startMs<previous.endMs&&clean(row.text,2500).toLowerCase()===clean(previous.text,2500).toLowerCase()){previous.endMs=Math.max(previous.endMs,row.endMs);continue;}merged.push(row);}
  return merged.map((row,index)=>({...row,id:`local-asr-sentence:${row.startMs}:${row.endMs}:${index+1}`,status:'needs-review',verified:false}));
}

export class LocalAsrProvider{
  constructor({
    runtime,
    engine=process.env.VOCAB_ASR_ENGINE||'faster-whisper',
    modelPath=process.env.WHISPER_MODEL_PATH||'',
    whisperBinary=process.env.WHISPER_BINARY||'whisper-cli',
    pythonBinary=process.env.PYTHON_BINARY||'python',
    adapterScript=fileURLToPath(new URL('../scripts/faster-whisper-adapter.py',import.meta.url)),
    read=readFile,
    write=writeFile,
    fileStat=stat
  }={}){
    if(!runtime)throw resolverError('LOCAL_COMPANION_UNAVAILABLE','Local ASR requires the secure companion runtime.');
    this.runtime=runtime;this.engine=engine;this.modelPath=clean(modelPath,1000);this.whisperBinary=clean(whisperBinary,500);this.pythonBinary=clean(pythonBinary,500);this.adapterScript=adapterScript;this.read=read;this.write=write;this.fileStat=fileStat;
  }
  async health(){
    if(!this.modelPath)return{available:false,code:'MODEL_UNAVAILABLE',autoDownload:false};
    try{const info=await this.fileStat(this.modelPath);return{available:true,engine:this.engine,modelPathConfigured:true,modelBytes:info.isFile()?info.size:null,modelStorageDisclosure:true,autoDownload:false};}
    catch{return{available:false,code:'MODEL_UNAVAILABLE',autoDownload:false};}
  }
  async infer(task,chunk,{signal=null}={}){
    const chunkPath=join(task.directory,`chunk-${chunk.index}.wav`),outputPath=join(task.directory,`chunk-${chunk.index}.json`);
    await this.runtime.runProcess(this.runtime.ffmpegBinary,['-nostdin','-hide_banner','-loglevel','error','-ss',String(chunk.startSeconds),'-to',String(chunk.endSeconds),'-i',task.audioPath,'-ac','1','-ar','16000','-y',chunkPath],{signal,timeoutMs:60_000,maxOutputBytes:100_000});
    if(this.engine==='whisper.cpp')await this.runtime.runProcess(this.whisperBinary,['-m',this.modelPath,'-f',chunkPath,'-oj','-of',outputPath.replace(/\.json$/,'')],{signal,timeoutMs:180_000,maxOutputBytes:1_000_000});
    else await this.runtime.runProcess(this.pythonBinary,[this.adapterScript,'--model',this.modelPath,'--input',chunkPath,'--output',outputPath,'--language',task.language],{signal,timeoutMs:180_000,maxOutputBytes:1_000_000});
    const parsed=JSON.parse(await this.read(outputPath,'utf8'));return normalizeRows(parsed.segments||parsed.transcription||[],Math.round(chunk.startSeconds*1000),task.sourceId);
  }
  async transcribe({url,language='en',signal=null,onBatch=()=>{},checkpoints={},saveCheckpoint=async()=>{}}={}){
    const capability=await this.health();if(!capability.available)throw resolverError('MODEL_UNAVAILABLE','No local Whisper model is installed. The companion will not download one automatically.');
    const extracted=await this.runtime.extract({url,language,signal}),task=this.runtime.getTask(extracted.id);const chunks=planAsrChunks(task.durationSeconds),batches=[];
    try{
      for(const chunk of chunks){if(signal?.aborted)throw resolverError('CANCELLED','Local ASR cancelled.');let rows=checkpoints?.[chunk.rangeId]?.status==='complete'?checkpoints[chunk.rangeId].segments:null;try{if(!rows)rows=await this.infer(task,chunk,{signal});await saveCheckpoint(chunk.rangeId,{status:'complete',segments:rows,range:chunk,updatedAt:Date.now()});}catch(error){await saveCheckpoint(chunk.rangeId,{status:'failed',error:{code:error.code||'PROCESS_FAILED'},range:chunk,updatedAt:Date.now()});throw error;}batches.push(rows);if(rows.length)await onBatch({provider:'local-asr',rangeId:chunk.rangeId,chunkIndex:chunk.index,segments:rows,complete:false,needsReview:true,reused:checkpoints?.[chunk.rangeId]?.status==='complete'});}
      const sentences=mergeAsrBatches(batches);
      if(!sentences.length)throw resolverError('TRACK_INVALID','Local ASR produced no usable speech segments.');
      return{provider:'local-asr',namespace:'private',model:this.engine,segments:sentences,complete:true,needsReview:true,durationSeconds:task.durationSeconds,rawMediaRetained:false};
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
