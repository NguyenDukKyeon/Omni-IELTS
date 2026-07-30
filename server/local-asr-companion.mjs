import { spawn } from 'node:child_process';
import { randomBytes,timingSafeEqual } from 'node:crypto';
import { mkdtemp,readFile,rm,stat,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { parseYouTubeSource,resolverError } from '../src/resolver-contracts.js';

const clean=(value,max=500)=>String(value??'').trim().replace(/[\r\n\0]/g,'').slice(0,max);
const redact=message=>clean(message,500).replace(/(?:token|key|authorization)=[^\s&]+/gi,'$1=[redacted]').replace(/Bearer\s+\S+/gi,'Bearer [redacted]');
const processError=(code,message,detail={})=>resolverError(code,redact(message),detail);

export function createPairingToken(){return randomBytes(32).toString('base64url');}
export function tokenMatches(actual='',expected=''){
  const left=Buffer.from(String(actual)),right=Buffer.from(String(expected));
  return left.length===right.length&&left.length>0&&timingSafeEqual(left,right);
}
export function isLoopbackAddress(value=''){return['127.0.0.1','::1','localhost'].includes(String(value).replace(/^\[|\]$/g,''));}

export function runOwnedProcess(command,args,{signal=null,timeoutMs=60_000,maxOutputBytes=4_000_000,spawnImpl=spawn}={}){
  if(!clean(command)||!Array.isArray(args)||args.some(value=>/[\r\n\0]/.test(String(value))))return Promise.reject(processError('PROCESS_FAILED','Invalid local process command.'));
  return new Promise((resolveResult,rejectResult)=>{
    const child=spawnImpl(command,args.map(String),{shell:false,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
    let settled=false,total=0;const stdout=[];const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener?.('abort',abort);error?rejectResult(error):resolveResult(value);};
    const terminate=()=>{try{if(process.platform==='win32')spawn('taskkill',['/pid',String(child.pid),'/T','/F'],{shell:false,windowsHide:true,stdio:'ignore'});else process.kill(-child.pid,'SIGKILL');}catch{try{child.kill?.('SIGKILL');}catch{}}};
    const abort=()=>{terminate();finish(processError('CANCELLED','Local media process cancelled.'));};
    const timer=setTimeout(()=>{terminate();finish(processError('TIMEOUT','Local media process exceeded its time limit.'));},Math.max(1000,Number(timeoutMs)||60_000));
    child.stdout?.on('data',chunk=>{total+=chunk.length;if(total>maxOutputBytes){terminate();finish(processError('MEDIA_LIMIT','Local process output exceeded its limit.'));}else stdout.push(chunk);});
    child.stderr?.on('data',()=>{});
    child.on('error',error=>finish(processError('PROCESS_FAILED',error.message)));
    child.on('close',code=>code===0?finish(null,Buffer.concat(stdout)):finish(processError('PROCESS_FAILED',`Local process exited with code ${code}.`)));
    if(signal?.aborted)abort();else signal?.addEventListener?.('abort',abort,{once:true});
  });
}

export class LocalCompanionRuntime{
  constructor({
    ytDlpBinary=process.env.YT_DLP_BINARY||'yt-dlp',
    ffmpegBinary=process.env.FFMPEG_BINARY||'ffmpeg',
    taskRoot=process.env.VOCAB_ASR_TEMP_ROOT||tmpdir(),
    maxDurationSeconds=Number(process.env.VOCAB_ASR_MAX_DURATION_SECONDS||7200),
    maxMediaBytes=Number(process.env.VOCAB_ASR_MAX_MEDIA_BYTES||1_500_000_000),
    runProcess=runOwnedProcess
  }={}){
    this.ytDlpBinary=clean(ytDlpBinary,500);this.ffmpegBinary=clean(ffmpegBinary,500);this.taskRoot=resolve(taskRoot);
    this.maxDurationSeconds=Math.max(30,Math.min(14_400,maxDurationSeconds));this.maxMediaBytes=Math.max(10_000_000,maxMediaBytes);this.runProcess=runProcess;this.tasks=new Map();
  }
  async health(){
    const check=async(command,args)=>{try{return{available:true,version:(await this.runProcess(command,args,{timeoutMs:5000,maxOutputBytes:20_000})).toString('utf8').trim().slice(0,120)}}catch(error){return{available:false,code:error.code||'PROCESS_FAILED'}}};
    const [ytDlp,ffmpeg]=await Promise.all([check(this.ytDlpBinary,['--version']),check(this.ffmpegBinary,['-version'])]);
    return{ok:ytDlp.available&&ffmpeg.available,loopbackOnly:true,authenticated:true,ytDlp,ffmpeg,rawMediaRetention:'task-temporary'};
  }
  async extract({url,language='en',signal=null}={}){
    const source=parseYouTubeSource(url);const metadata=JSON.parse((await this.runProcess(this.ytDlpBinary,['--dump-single-json','--skip-download','--no-playlist','--no-warnings',source.canonicalUrl],{signal,timeoutMs:20_000,maxOutputBytes:2_000_000})).toString('utf8'));
    const durationSeconds=Math.max(0,Number(metadata.duration||0));
    if(!durationSeconds||durationSeconds>this.maxDurationSeconds)throw processError('MEDIA_LIMIT','Media duration is absent or exceeds the configured local cap.');
    const directory=await mkdtemp(join(this.taskRoot,'vocab-asr-')),audioPath=join(directory,'source.wav'),taskId=`local-media:${randomBytes(12).toString('hex')}`;
    const task={id:taskId,directory,audioPath,sourceId:source.sourceId,language:clean(language,32)||'en',durationSeconds,createdAt:Date.now(),state:'extracting'};this.tasks.set(taskId,task);
    try{
      await writeFile(join(directory,'journal.json'),JSON.stringify({id:taskId,state:'extracting',sourceId:source.sourceId,createdAt:task.createdAt}),{mode:0o600});
      await this.runProcess(this.ytDlpBinary,['--no-playlist','--no-warnings','--no-part','--extract-audio','--audio-format','wav','--output',audioPath,source.canonicalUrl],{signal,timeoutMs:Math.max(60_000,durationSeconds*1500),maxOutputBytes:2_000_000});
      const info=await stat(audioPath);if(!info.isFile()||info.size<=0||info.size>this.maxMediaBytes)throw processError('MEDIA_LIMIT','Extracted media is empty or exceeds the configured disk cap.');
      task.state='ready';task.mediaBytes=info.size;await writeFile(join(directory,'journal.json'),JSON.stringify({id:taskId,state:'ready',sourceId:source.sourceId,mediaBytes:info.size,createdAt:task.createdAt}),{mode:0o600});
      return{id:taskId,sourceId:source.sourceId,durationSeconds,mediaBytes:info.size,language:task.language,state:'ready'};
    }catch(error){await this.cleanup(taskId);throw error;}
  }
  getTask(taskId){const task=this.tasks.get(taskId);return task?{...task}:null;}
  async cleanup(taskId){const task=this.tasks.get(taskId);if(!task)return false;this.tasks.delete(taskId);await rm(task.directory,{recursive:true,force:true,maxRetries:4,retryDelay:50});return true;}
  async readJournal(taskId){const task=this.tasks.get(taskId);return task?JSON.parse(await readFile(join(task.directory,'journal.json'),'utf8')):null;}
}

export function createCompanionHttpHandler({runtime=new LocalCompanionRuntime(),asrProvider=null,token,allowedOrigins=[]}={}){
  if(!token)throw processError('CONSENT_REQUIRED','Local companion pairing token is required.');
  const origins=new Set(allowedOrigins.map(value=>String(value).trim()).filter(Boolean));if(origins.has('*'))throw processError('INVALID_SOURCE','Wildcard companion origin is not allowed.');
  const headers=origin=>({'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':origins.has(origin)?origin:'null','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'authorization,content-type','vary':'Origin'});
  const send=(req,res,status,data)=>{res.writeHead(status,headers(String(req.headers.origin||'')));res.end(JSON.stringify(data));};
  return async(req,res)=>{
    const origin=String(req.headers.origin||'');if(req.method==='OPTIONS'){if(!origins.has(origin))return send(req,res,403,{error:{code:'ORIGIN_DENIED'}});res.writeHead(204,headers(origin));return res.end();}
    if(origin&&!origins.has(origin))return send(req,res,403,{error:{code:'ORIGIN_DENIED'}});
    const bearer=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!tokenMatches(bearer,token))return send(req,res,401,{error:{code:'PAIRING_REQUIRED'}});
    const url=new URL(req.url||'/','http://127.0.0.1');try{
      if(url.pathname==='/health'&&req.method==='GET'){const processHealth=await runtime.health(),model=asrProvider?await asrProvider.health():{available:false,code:'MODEL_UNAVAILABLE'};return send(req,res,200,{...processHealth,available:processHealth.ok===true&&model.available===true,modelInstalled:model.available===true,model:{available:model.available===true,code:model.code||null,engine:model.engine||null,modelBytes:model.modelBytes||null,autoDownload:false}});}
      if(url.pathname==='/extract'&&req.method==='POST'){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>20_000)throw processError('MEDIA_LIMIT','Companion request is too large.');chunks.push(chunk);}return send(req,res,200,await runtime.extract(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}')));}
      if(url.pathname==='/asr'&&req.method==='POST'){if(!asrProvider)throw processError('MODEL_UNAVAILABLE','Local ASR provider is disabled.');let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>30_000)throw processError('MEDIA_LIMIT','Companion request is too large.');chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');res.writeHead(200,{...headers(origin),'content-type':'application/x-ndjson; charset=utf-8'});const result=await asrProvider.transcribe({...body,onBatch:batch=>res.write(`${JSON.stringify({type:'partial',...batch})}\n`)});res.write(`${JSON.stringify({type:'complete',result})}\n`);return res.end();}
      const match=url.pathname.match(/^\/tasks\/([^/]+)\/cleanup$/);if(match&&req.method==='POST')return send(req,res,200,{cleaned:await runtime.cleanup(decodeURIComponent(match[1]))});
      return send(req,res,404,{error:{code:'NOT_FOUND'}});
    }catch(error){return send(req,res,['INVALID_SOURCE','MEDIA_LIMIT'].includes(error.code)?400:503,{error:{code:error.code||'PROCESS_FAILED',message:redact(error.message)}});}
  };
}
