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

export function planAsrChunks(durationSeconds,{chunkSeconds=30}={}){
  const duration=Math.max(1,finite(durationSeconds)),size=Math.max(10,Math.min(60,finite(chunkSeconds)||30)),chunks=[];
  for(let start=0,index=0;start<duration;start+=size,index+=1)chunks.push({index,startSeconds:start,endSeconds:Math.min(duration,start+size)});
  return chunks;
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
  async transcribe({url,language='en',signal=null,onBatch=()=>{}}={}){
    const capability=await this.health();if(!capability.available)throw resolverError('MODEL_UNAVAILABLE','No local Whisper model is installed. The companion will not download one automatically.');
    const extracted=await this.runtime.extract({url,language,signal}),task=this.runtime.getTask(extracted.id);const chunks=planAsrChunks(task.durationSeconds),sentences=[];
    try{
      for(const chunk of chunks){if(signal?.aborted)throw resolverError('CANCELLED','Local ASR cancelled.');const rows=await this.infer(task,chunk,{signal});sentences.push(...rows);if(rows.length)await onBatch({provider:'local-asr',chunkIndex:chunk.index,segments:rows,complete:false,needsReview:true});}
      if(!sentences.length)throw resolverError('TRACK_INVALID','Local ASR produced no usable speech segments.');
      return{provider:'local-asr',namespace:'private',model:this.engine,segments:sentences,complete:true,needsReview:true,durationSeconds:task.durationSeconds,rawMediaRetained:false};
    }finally{await this.runtime.cleanup(extracted.id);}
  }
}

export async function resolveCaptionFirst({caption,local,allowLocal=false}={}){
  try{return await caption();}catch(error){if(!allowLocal||!['NO_CAPTION','YTDLP_UNAVAILABLE','TRACK_INVALID'].includes(error?.code))throw error;return local();}
}
