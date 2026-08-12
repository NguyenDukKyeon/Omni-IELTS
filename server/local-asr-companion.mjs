import { spawn } from 'node:child_process';
import { randomBytes,timingSafeEqual } from 'node:crypto';
import { once } from 'node:events';
import { lstat,mkdir,mkdtemp,readFile,readdir,realpath,rm,stat,statfs,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname,join,resolve,sep } from 'node:path';
import { RESOLVER_ERROR_CODES,parseYouTubeSource,resolverError } from '../src/resolver-contracts.js';

const TASK_OWNER='vocab-master-local-companion-v1';
const TASK_JOURNAL_VERSION=1;
const TASK_ID_PATTERN=/^local-media:[a-f0-9]{24}$/;
const TOKEN_MIN_BYTES=32;
const TOKEN_MAX_BYTES=256;
const REQUEST_MAX_BYTES=16*1024*1024;
const ASR_RESPONSE_MAX_BYTES=16*1024*1024;
const ASR_RESPONSE_LINE_MAX_BYTES=1024*1024;
const ASR_RESPONSE_EVENT_MAX=1024;
const clean=(value,max=500)=>String(value??'').trim().replace(/[\r\n\0]/g,'').slice(0,max);
const redact=message=>clean(message,500).replace(/(?:token|key|authorization)=[^\s&]+/gi,'credential=[redacted]').replace(/Bearer\s+\S+/gi,'Bearer [redacted]');
const processError=(code,message,detail={})=>resolverError(code,redact(message),detail);
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const plain=value=>{try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}};
function ownDataOptions(value,allowed,{code='INVALID_SOURCE',message='Local companion configuration is invalid.',accessorCode=code}={}){
  if(!plain(value))throw processError(code,message);let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{throw processError(code,message);}
  if(Object.keys(descriptors).some(key=>!allowed.includes(key)))throw processError(code,message);
  if(Object.values(descriptors).some(descriptor=>!hasOwn(descriptor,'value')))throw processError(accessorCode,message);
  return Object.fromEntries(Object.entries(descriptors).map(([key,descriptor])=>[key,descriptor.value]));
}
function validPairingToken(value){return typeof value==='string'&&!/[\s\u0000-\u001f\u007f]/u.test(value)&&Buffer.byteLength(value,'utf8')>=TOKEN_MIN_BYTES&&Buffer.byteLength(value,'utf8')<=TOKEN_MAX_BYTES;}
function normalizeAllowedOrigins(values){
  if(!Array.isArray(values)||values.length>32)throw processError('INVALID_SOURCE','Local companion origins are invalid.');let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(values);}catch{throw processError('INVALID_SOURCE','Local companion origins are invalid.');}if(Object.keys(descriptors).some(key=>key!=='length'&&!/^(?:0|[1-9]\d*)$/.test(key)))throw processError('INVALID_SOURCE','Local companion origins are invalid.');const origins=[];
  for(let index=0;index<values.length;index+=1){const descriptor=descriptors[index];if(!descriptor||!hasOwn(descriptor,'value'))throw processError('INVALID_SOURCE','Local companion origin is invalid.');const value=descriptor.value;if(typeof value!=='string'||value==='*'||value==='null')throw processError('INVALID_SOURCE','Local companion origin is invalid.');let parsed;try{parsed=new URL(value);}catch{throw processError('INVALID_SOURCE','Local companion origin is invalid.');}if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash||value!==parsed.origin)throw processError('INVALID_SOURCE','Local companion origin is invalid.');if(!origins.includes(value))origins.push(value);}
  return Object.freeze(origins);
}
function validPort(value){return Number.isInteger(value)&&value>=1&&value<=65_535;}
export function validateCompanionStartupConfig(input){
  const values=ownDataOptions(input,['host','port','token','allowedOrigins'],{code:'INVALID_SOURCE',message:'Local companion startup configuration is invalid.',accessorCode:'CONSENT_REQUIRED'});
  if(!isLoopbackAddress(values.host)||!validPort(values.port))throw processError('INVALID_SOURCE','Local companion startup address is invalid.');
  if(!validPairingToken(values.token))throw processError('CONSENT_REQUIRED','Local companion pairing token is required.');
  return Object.freeze({host:values.host,port:values.port,token:values.token,allowedOrigins:normalizeAllowedOrigins(values.allowedOrigins)});
}
function validHostHeader(value){
  if(typeof value!=='string'||/[\s\u0000-\u001f\u007f]/u.test(value))return false;let match;
  if((match=value.match(/^\[::1\](?::([0-9]{1,5}))?$/i)))return !match[1]||validPort(Number(match[1]));
  if((match=value.match(/^(?:127\.0\.0\.1|localhost)(?::([0-9]{1,5}))?$/i)))return !match[1]||validPort(Number(match[1]));
  return false;
}
function dataOnly(value,seen=new Set(),depth=0){
  if(value===null||typeof value==='string'||typeof value==='boolean')return true;if(typeof value==='number')return Number.isFinite(value);if(typeof value!=='object'||depth>20||seen.has(value)||(!Array.isArray(value)&&!plain(value)))return false;seen.add(value);for(const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))){if(!hasOwn(descriptor,'value')||!dataOnly(descriptor.value,seen,depth+1))return false;}seen.delete(value);return true;
}
function hasForbiddenRequestKey(value,seen=new Set()){
  if(!value||typeof value!=='object'||seen.has(value))return false;seen.add(value);for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))){const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();if(/(?:command|argv|binary|executable|path|secret|credential|token|authorization)$/.test(normalized)||/^(?:taskroot|owner|namespace|evidenceauthority)$/.test(normalized)||!hasOwn(descriptor,'value')||hasForbiddenRequestKey(descriptor.value,seen))return true;}return false;
}
function portableVersion(value){const version=clean(value,120);return !version||/[\\/]|(?:token|key|authorization|credential|secret)|Bearer/i.test(version)?'[redacted]':version;}
function exactKeys(value,required,optional=[]){return plain(value)&&required.every(key=>hasOwn(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key));}

export function createPairingToken(){return randomBytes(32).toString('base64url');}
export function tokenMatches(actual='',expected=''){
  if(!validPairingToken(actual)||!validPairingToken(expected))return false;const left=Buffer.from(actual),right=Buffer.from(expected);
  return left.length===right.length&&timingSafeEqual(left,right);
}
export function isLoopbackAddress(value=''){return typeof value==='string'&&['127.0.0.1','::1','localhost'].includes(value.replace(/^\[|\]$/g,'').toLowerCase());}
export function bindHttpDisconnect(req,res,controller){
  const disconnect=()=>{if(!res.writableEnded)controller.abort();};
  req.once('aborted',disconnect);res.once('close',disconnect);
  return()=>{req.removeListener('aborted',disconnect);res.removeListener('close',disconnect);};
}

async function terminateProcessTree(child){
  if(process.platform==='win32'){
    await new Promise(resolveDone=>{
      let settled=false;const done=()=>{if(settled)return;settled=true;resolveDone();};
      try{const killer=spawn('taskkill',['/pid',String(child.pid),'/T','/F'],{shell:false,windowsHide:true,stdio:'ignore'});killer.once('error',done);killer.once('close',done);}catch{done();}
    });
  }else{
    try{process.kill(-child.pid,'SIGKILL');}catch{}
  }
  try{child.kill?.('SIGKILL');}catch{}
}

export function runOwnedProcess(command,args,{signal=null,timeoutMs=60_000,maxOutputBytes=4_000_000,spawnImpl=spawn,terminateImpl=terminateProcessTree,terminationGraceMs=2_000}={}){
  if(typeof command!=='string'||!command.trim()||!Array.isArray(args)||args.some(value=>typeof value!=='string'||/[\r\n\0]/.test(value)))return Promise.reject(processError('PROCESS_FAILED','Invalid local process command.'));
  return new Promise((resolveResult,rejectResult)=>{
    let child;try{child=spawnImpl(command,[...args],{shell:false,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});}catch{return rejectResult(processError('PROCESS_FAILED','Local process could not be started.'));}
    let settled=false,total=0,terminationError=null,terminationTimer=null;const stdout=[];
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);clearTimeout(terminationTimer);signal?.removeEventListener?.('abort',abort);error?rejectResult(error):resolveResult(value);};
    const terminate=error=>{
      if(terminationError)return;terminationError=error;
      terminationTimer=setTimeout(()=>{try{child.kill?.('SIGKILL');}catch{}finish(terminationError);},Math.max(10,Math.min(10_000,Number(terminationGraceMs)||2_000)));terminationTimer.unref?.();
      void Promise.resolve().then(()=>terminateImpl(child)).catch(()=>{});
    };
    const abort=()=>terminate(processError('CANCELLED','Local media process cancelled.'));
    const timer=setTimeout(()=>terminate(processError('TIMEOUT','Local media process exceeded its time limit.')),Math.max(10,Math.min(24*60*60*1000,Number(timeoutMs)||60_000)));
    child.stdout?.on('data',chunk=>{total+=chunk.length;if(total>maxOutputBytes)terminate(processError('MEDIA_LIMIT','Local process output exceeded its limit.'));else stdout.push(chunk);});
    child.stderr?.on('data',()=>{});
    child.on('error',error=>finish(terminationError||processError('PROCESS_FAILED',error.message)));
    child.on('close',code=>terminationError?finish(terminationError):code===0?finish(null,Buffer.concat(stdout)):finish(processError('PROCESS_FAILED',`Local process exited with code ${code}.`)));
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
    maxConcurrentTasks=Number(process.env.VOCAB_ASR_MAX_CONCURRENT_TASKS||2),
    diskReserveBytes=Number(process.env.VOCAB_ASR_DISK_RESERVE_BYTES||64*1024*1024),
    taskTtlMs=Number(process.env.VOCAB_ASR_TASK_TTL_MS||4*60*60*1000),
    runProcess=runOwnedProcess,
    diskStat=statfs,
    remove=rm
  }={}){
    this.ytDlpBinary=clean(ytDlpBinary,500);this.ffmpegBinary=clean(ffmpegBinary,500);this.taskRoot=resolve(taskRoot);
    this.maxDurationSeconds=Math.max(30,Math.min(14_400,maxDurationSeconds));this.maxMediaBytes=Math.max(10_000_000,maxMediaBytes);this.maxConcurrentTasks=Math.max(1,Math.min(8,Number(maxConcurrentTasks)||2));this.maxAggregateMediaBytes=this.maxMediaBytes*this.maxConcurrentTasks;
    this.diskReserveBytes=Math.max(0,Number(diskReserveBytes)||0);this.taskTtlMs=Math.max(60_000,Number(taskTtlMs)||4*60*60*1000);this.runProcess=runProcess;this.diskStat=diskStat;this.remove=remove;this.tasks=new Map();this.reservations=0;this.reservedMediaBytes=0;this.recoveredTaskIds=new Set();this.initialization=null;this.diskReservationTail=Promise.resolve();
  }
  async initialize(){if(!this.initialization)this.initialization=this.recoverOrphans();return this.initialization;}
  async recoverOrphans(){
    await mkdir(this.taskRoot,{recursive:true});const rootPath=await realpath(this.taskRoot),entries=await readdir(this.taskRoot,{withFileTypes:true}),failures=[];let skipped=0;
    for(const entry of entries){
      if(!entry.isDirectory()||entry.isSymbolicLink()||!entry.name.startsWith('vocab-asr-'))continue;
      const directory=resolve(this.taskRoot,entry.name);if(!directory.startsWith(`${this.taskRoot}${sep}`)){skipped+=1;continue;}
      let record;
      try{record=await this.readRecoveryJournal(directory,rootPath);}catch{skipped+=1;continue;}
      if(!this.isOwnedJournal(record.journal)){skipped+=1;continue;}
      try{
        const rechecked=await this.readRecoveryJournal(directory,rootPath);if(rechecked.text!==record.text||!this.isOwnedJournal(rechecked.journal)){skipped+=1;continue;}
        await this.remove(directory,{recursive:true,force:true,maxRetries:4,retryDelay:50});this.recoveredTaskIds.add(record.journal.id);
      }catch(error){failures.push(error);}
    }
    if(failures.length)throw processError('PROCESS_FAILED',`Failed to clean ${failures.length} owned companion task(s) during restart recovery.`);
    return{cleaned:this.recoveredTaskIds.size,skipped};
  }
  async readRecoveryJournal(directory,rootPath){
    const directoryInfo=await lstat(directory),directoryPath=await realpath(directory);if(!directoryInfo.isDirectory()||directoryInfo.isSymbolicLink()||dirname(directoryPath)!==rootPath)throw processError('INVALID_SOURCE','Companion recovery directory is invalid.');
    const journalPath=join(directory,'journal.json'),journalInfo=await lstat(journalPath);if(!journalInfo.isFile()||journalInfo.isSymbolicLink()||journalInfo.nlink!==1||journalInfo.size<=1||journalInfo.size>16_384)throw processError('INVALID_SOURCE','Companion recovery journal is invalid.');
    const journalPathReal=await realpath(journalPath);if(journalPathReal!==join(directoryPath,'journal.json'))throw processError('INVALID_SOURCE','Companion recovery journal is invalid.');
    const text=await readFile(journalPath,'utf8');return{journal:JSON.parse(text),text};
  }
  isOwnedJournal(journal){
    const legacy=dataOnly(journal)&&!hasOwn(journal,'version');
    if(!dataOnly(journal)||(!legacy&&journal?.version!==TASK_JOURNAL_VERSION)||journal?.owner!==TASK_OWNER||!TASK_ID_PATTERN.test(journal?.id)||!['extracting','ready'].includes(journal?.state)||typeof journal.sourceId!=='string'||!/^youtube:[A-Za-z0-9_-]{6,64}$/.test(journal.sourceId)||!Number.isSafeInteger(journal.reservedBytes)||journal.reservedBytes<0||journal.reservedBytes>this.maxMediaBytes||!Number.isSafeInteger(journal.createdAt)||journal.createdAt<0||journal.createdAt>Date.now()+60_000)return false;
    const expected=journal.state==='ready'?['owner','id','state','sourceId','mediaBytes','reservedBytes','createdAt']:['owner','id','state','sourceId','reservedBytes','createdAt'];if(!legacy)expected.unshift('version');
    return Object.keys(journal).length===expected.length&&expected.every(key=>hasOwn(journal,key))&&(journal.state!=='ready'||(Number.isSafeInteger(journal.mediaBytes)&&journal.mediaBytes>0&&journal.mediaBytes<=this.maxMediaBytes));
  }
  async cleanupExpired(){
    const cutoff=Date.now()-this.taskTtlMs,failures=[];
    for(const task of [...this.tasks.values()])if(task.state==='ready'&&!task.useCount&&task.createdAt<cutoff)try{await this.cleanup(task.id);}catch(error){failures.push(error);}
    if(failures.length)throw processError('PROCESS_FAILED',`Failed to clean ${failures.length} expired companion task(s).`);
  }
  async health(){
    const recovery=await this.initialize();
    const check=async(command,args)=>{try{return{available:true,version:portableVersion((await this.runProcess(command,args,{timeoutMs:5000,maxOutputBytes:20_000})).toString('utf8'))}}catch(error){return{available:false,code:error.code||'PROCESS_FAILED'}}};
    const [ytDlp,ffmpeg]=await Promise.all([check(this.ytDlpBinary,['--version']),check(this.ffmpegBinary,['-version'])]);
    return{ok:ytDlp.available&&ffmpeg.available,loopbackOnly:true,authenticated:true,ytDlp,ffmpeg,rawMediaRetention:'task-temporary',recovery,maxConcurrentTasks:this.maxConcurrentTasks,maxMediaBytes:this.maxMediaBytes};
  }
  async assertDiskCapacity(durationSeconds){
    const estimatedBytes=Math.ceil(durationSeconds*16_000*2+44);
    let release;const previous=this.diskReservationTail;this.diskReservationTail=new Promise(resolveDone=>{release=resolveDone;});await previous;
    try{
      if(estimatedBytes>this.maxMediaBytes||this.reservedMediaBytes+estimatedBytes>this.maxAggregateMediaBytes)throw processError('MEDIA_LIMIT','Estimated extracted media exceeds the configured disk cap.');
      const disk=await this.diskStat(this.taskRoot),availableBytes=Number(disk.bavail??disk.bfree??0)*Number(disk.bsize??disk.frsize??0);
      if(!Number.isFinite(availableBytes)||availableBytes-this.diskReserveBytes-this.reservedMediaBytes<estimatedBytes)throw processError('MEDIA_LIMIT','Insufficient disk space for bounded local media extraction.');
      this.reservedMediaBytes+=estimatedBytes;return estimatedBytes;
    }finally{release();}
  }
  async extract({url,language='en',signal=null,retainForUse=false}={}){
    await this.initialize();await this.cleanupExpired();
    if(this.tasks.size+this.reservations>=this.maxConcurrentTasks)throw processError('MEDIA_LIMIT','Local companion concurrency limit reached.');
    this.reservations+=1;let task=null,reservedBytes=0,reservedHeld=false;
    try{
      const source=parseYouTubeSource(url);const metadata=JSON.parse((await this.runProcess(this.ytDlpBinary,['--dump-single-json','--skip-download','--no-playlist','--no-warnings',source.canonicalUrl],{signal,timeoutMs:20_000,maxOutputBytes:2_000_000})).toString('utf8'));
      const durationSeconds=Math.max(0,Number(metadata.duration||0));
      if(!durationSeconds||durationSeconds>this.maxDurationSeconds)throw processError('MEDIA_LIMIT','Media duration is absent or exceeds the configured local cap.');
      reservedBytes=await this.assertDiskCapacity(durationSeconds);reservedHeld=true;const directory=await mkdtemp(join(this.taskRoot,'vocab-asr-')),audioPath=join(directory,'source.wav'),taskId=`local-media:${randomBytes(12).toString('hex')}`;
      task={id:taskId,directory,audioPath,sourceId:source.sourceId,language:clean(language,32)||'en',durationSeconds,reservedBytes,createdAt:Date.now(),state:'extracting',useCount:retainForUse===true?1:0};this.tasks.set(taskId,task);this.reservations-=1;
      try{
        await writeFile(join(directory,'journal.json'),JSON.stringify({version:TASK_JOURNAL_VERSION,owner:TASK_OWNER,id:taskId,state:'extracting',sourceId:source.sourceId,reservedBytes,createdAt:task.createdAt}),{mode:0o600});
        await this.runProcess(this.ytDlpBinary,['--no-playlist','--no-warnings','--no-part','--max-filesize',String(this.maxMediaBytes),'--extract-audio','--audio-format','wav','--output',audioPath,source.canonicalUrl],{signal,timeoutMs:Math.max(60_000,durationSeconds*1500),maxOutputBytes:2_000_000});
        const info=await stat(audioPath);if(!info.isFile()||info.size<=0||info.size>this.maxMediaBytes)throw processError('MEDIA_LIMIT','Extracted media is empty or exceeds the configured disk cap.');
        task.state='ready';task.mediaBytes=info.size;await writeFile(join(directory,'journal.json'),JSON.stringify({version:TASK_JOURNAL_VERSION,owner:TASK_OWNER,id:taskId,state:'ready',sourceId:source.sourceId,mediaBytes:info.size,reservedBytes,createdAt:task.createdAt}),{mode:0o600});
        return{id:taskId,sourceId:source.sourceId,durationSeconds,mediaBytes:info.size,language:task.language,state:'ready'};
      }catch(error){await this.cleanup(taskId,{force:true});throw error;}
    }finally{if(!task){this.reservations=Math.max(0,this.reservations-1);if(reservedHeld)this.reservedMediaBytes=Math.max(0,this.reservedMediaBytes-reservedBytes);}}
  }
  getTask(taskId){const task=this.tasks.get(taskId);return task?{...task}:null;}
  releaseTask(taskId){const task=this.tasks.get(taskId);if(!task||!task.useCount)return false;task.useCount-=1;return true;}
  async cleanup(taskId,{force=false}={}){
    await this.initialize();const task=this.tasks.get(taskId);
    if(!task)return this.recoveredTaskIds.delete(taskId);
    if((task.state==='extracting'||task.useCount>0)&&!force)throw processError('PROCESS_FAILED','Active local companion task cannot be cleaned.');
    await this.remove(task.directory,{recursive:true,force:true,maxRetries:4,retryDelay:50});
    this.tasks.delete(taskId);this.reservedMediaBytes=Math.max(0,this.reservedMediaBytes-Number(task.reservedBytes||0));return true;
  }
  async readJournal(taskId){const task=this.tasks.get(taskId);return task?JSON.parse(await readFile(join(task.directory,'journal.json'),'utf8')):null;}
}

async function readRequestBody(req,maxBytes,{allowEmpty=false}={}){
  const declared=req.headers['content-length'];if(declared!==undefined&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw processError('MEDIA_LIMIT','Companion request exceeds its limit.');let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>maxBytes)throw processError('MEDIA_LIMIT','Companion request exceeds its limit.');chunks.push(chunk);}
  if(size===0){if(allowEmpty)return'';throw processError('INVALID_SOURCE','Companion request body is required.');}
  return Buffer.concat(chunks).toString('utf8');
}
async function requireEmptyRequestBody(req){
  const declared=req.headers['content-length'];if(declared!==undefined&&declared!=='0')throw processError('INVALID_SOURCE','Health request body is not allowed.');for await(const chunk of req)if(chunk.length)throw processError('INVALID_SOURCE','Health request body is not allowed.');
}
function encodeAsrResponseEvent(state,event){
  if(state.events>=ASR_RESPONSE_EVENT_MAX)throw processError('MEDIA_LIMIT','Local ASR response contains too many events.');let line;try{line=`${JSON.stringify(event)}\n`;}catch{throw processError('PROCESS_FAILED','Local ASR response is invalid.');}const bytes=Buffer.byteLength(line,'utf8');if(bytes>ASR_RESPONSE_LINE_MAX_BYTES||state.bytes+bytes>ASR_RESPONSE_MAX_BYTES)throw processError('MEDIA_LIMIT','Local ASR response exceeded its limit.');state.events+=1;state.bytes+=bytes;return line;
}
async function writeAsrResponseEvent(req,res,state,event){
  const line=encodeAsrResponseEvent(state,event);
  if(!state.committed){res.writeHead(200,{...state.headers,'content-type':'application/x-ndjson; charset=utf-8','x-vocab-asr-protocol-version':'2'});state.committed=true;}
  if(res.destroyed||res.writableEnded)throw processError('CANCELLED','Local ASR client disconnected.');
  if(!res.write(line))await Promise.race([once(res,'drain'),once(res,'close').then(()=>{throw processError('CANCELLED','Local ASR client disconnected.');})]);
}
function validateCheckpointRequest(checkpoints){
  if(!plain(checkpoints)||!dataOnly(checkpoints)||hasForbiddenRequestKey(checkpoints))throw processError('INVALID_SOURCE','Companion checkpoints are invalid.');
  const entries=Object.entries(checkpoints);if(entries.length>ASR_RESPONSE_EVENT_MAX)throw processError('MEDIA_LIMIT','Companion checkpoints exceed their range limit.');
  for(const [rangeId,row] of entries){if(typeof rangeId!=='string'||!rangeId||rangeId.length>160||/[\r\n\0]/.test(rangeId))throw processError('INVALID_SOURCE','Companion checkpoint range is invalid.');let encoded;try{encoded=JSON.stringify(row);}catch{throw processError('INVALID_SOURCE','Companion checkpoint is invalid.');}if(Buffer.byteLength(encoded??'','utf8')>ASR_RESPONSE_LINE_MAX_BYTES)throw processError('MEDIA_LIMIT','Companion checkpoint row exceeds its limit.');}
}
function terminalAsrError(error){
  const failure=error?.asrFailure;if(!plain(failure)||!exactKeys(failure,['rangeId','chunkIndex','range','binding'])||typeof failure.rangeId!=='string'||!Number.isSafeInteger(failure.chunkIndex)||!plain(failure.range)||!plain(failure.binding)||!dataOnly(failure)||hasForbiddenRequestKey(failure))return{type:'error',error:{code:RESOLVER_ERROR_CODES.includes(error?.code)?error.code:'PROCESS_FAILED'},rangeId:null,chunkIndex:null,range:null,binding:null};
  return{type:'error',error:{code:RESOLVER_ERROR_CODES.includes(error?.code)?error.code:'PROCESS_FAILED'},rangeId:failure.rangeId,chunkIndex:failure.chunkIndex,range:failure.range,binding:failure.binding};
}
function parseRequestJson(text,kind){
  let body;try{body=JSON.parse(text);}catch{throw processError('INVALID_SOURCE','Companion request JSON is invalid.');}
  const optional=kind==='asr'?['language','checkpoints']:['language'];if(!exactKeys(body,['url'],optional)||typeof body.url!=='string'||!body.url.trim()||body.url.length>2_500||/[\r\n\0]/.test(body.url))throw processError('INVALID_SOURCE','Companion source request is invalid.');
  if(hasOwn(body,'language')&&(typeof body.language!=='string'||!body.language.trim()||body.language.length>32||/[\r\n\0]/.test(body.language)))throw processError('INVALID_SOURCE','Companion language is invalid.');
  if(hasOwn(body,'checkpoints'))validateCheckpointRequest(body.checkpoints);
  return body;
}

export function createCompanionHttpHandler(options={}){
  const values=ownDataOptions(options,['runtime','asrProvider','token','allowedOrigins'],{code:'INVALID_SOURCE',message:'Local companion handler configuration is invalid.',accessorCode:'CONSENT_REQUIRED'}),runtime=values.runtime??new LocalCompanionRuntime(),asrProvider=values.asrProvider??null,token=values.token,originList=normalizeAllowedOrigins(values.allowedOrigins??[]);
  if(!validPairingToken(token))throw processError('CONSENT_REQUIRED','Local companion pairing token is required.');
  const origins=new Set(originList);
  const headers=origin=>({'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...(origins.has(origin)?{'access-control-allow-origin':origin}:{}),'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'authorization,content-type','vary':'Origin'});
  const send=(req,res,status,data)=>{if(res.destroyed||res.writableEnded)return;if(res.headersSent)return res.end();res.writeHead(status,headers(typeof req.headers.origin==='string'?req.headers.origin:''));res.end(JSON.stringify(data));};
  return async(req,res)=>{
    if(!validHostHeader(req.headers.host))return send(req,res,403,{error:{code:'HOST_DENIED'}});
    const origin=typeof req.headers.origin==='string'?req.headers.origin:'';
    if(req.method==='OPTIONS'){if(!origin||!origins.has(origin))return send(req,res,403,{error:{code:'ORIGIN_DENIED'}});res.writeHead(204,headers(origin));return res.end();}
    if(origin&&!origins.has(origin))return send(req,res,403,{error:{code:'ORIGIN_DENIED'}});
    const authorization=req.headers.authorization,match=typeof authorization==='string'?authorization.match(/^Bearer ([^\s]+)$/):null;if(!match||!tokenMatches(match[1],token))return send(req,res,401,{error:{code:'PAIRING_REQUIRED'}});
    const requestController=new AbortController(),unbindDisconnect=bindHttpDisconnect(req,res,requestController);
    let asrStream=null;
    try{
      let url;try{url=new URL(req.url||'/','http://127.0.0.1');}catch{throw processError('INVALID_SOURCE','Companion route is invalid.');}if(url.search||url.hash)throw processError('INVALID_SOURCE','Companion route is invalid.');
      if(url.pathname==='/health'&&req.method==='GET'){await requireEmptyRequestBody(req);const processHealth=await runtime.health(),model=asrProvider?await asrProvider.health():{available:false,code:'MODEL_UNAVAILABLE'};return send(req,res,200,{...processHealth,available:processHealth.ok===true&&model.available===true,modelInstalled:model.available===true,model:{available:model.available===true,code:model.code||null,engine:model.engine||null,modelBytes:model.modelBytes||null,modelDigest:model.modelDigest||null,autoDownload:false}});}
      if(url.pathname==='/extract'&&req.method==='POST'){
        if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']||''))throw processError('INVALID_SOURCE','Companion request content type is invalid.');const body=parseRequestJson(await readRequestBody(req,20_000),'extract');return send(req,res,200,await runtime.extract({...body,signal:requestController.signal}));
      }
      if(url.pathname==='/asr'&&req.method==='POST'){
        if(!asrProvider)throw processError('MODEL_UNAVAILABLE','Local ASR provider is disabled.');if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']||''))throw processError('INVALID_SOURCE','Companion request content type is invalid.');const body=parseRequestJson(await readRequestBody(req,REQUEST_MAX_BYTES),'asr');if(res.destroyed)return;
        asrStream={bytes:0,events:0,committed:false,terminal:false,headers:headers(origin)};
        const result=await asrProvider.transcribe({...body,signal:requestController.signal,onBatch:batch=>writeAsrResponseEvent(req,res,asrStream,{...batch,type:'partial'})});
        await writeAsrResponseEvent(req,res,asrStream,{type:'complete',result});asrStream.terminal=true;if(!res.destroyed&&!res.writableEnded)res.end();return;
      }
      const routeMatch=url.pathname.match(/^\/tasks\/([^/]+)\/cleanup$/);
      if(routeMatch&&req.method==='POST'){
        let taskId;try{taskId=decodeURIComponent(routeMatch[1]);}catch{throw processError('INVALID_SOURCE','Companion cleanup task is invalid.');}if(!TASK_ID_PATTERN.test(taskId))throw processError('INVALID_SOURCE','Companion cleanup task is invalid.');await readRequestBody(req,1_024,{allowEmpty:true}).then(text=>{if(text)throw processError('INVALID_SOURCE','Companion cleanup body is not allowed.');});return send(req,res,200,{cleaned:await runtime.cleanup(taskId)});
      }
      return send(req,res,404,{error:{code:'NOT_FOUND'}});
    }catch(error){const code=typeof error?.code==='string'?error.code:'PROCESS_FAILED';if(asrStream?.committed&&!asrStream.terminal&&!res.destroyed&&!res.writableEnded){try{await writeAsrResponseEvent(req,res,asrStream,terminalAsrError(error));asrStream.terminal=true;res.end();}catch{if(!res.destroyed)res.destroy();}return;}const status=['INVALID_SOURCE','MEDIA_LIMIT'].includes(code)?400:code==='CANCELLED'?499:503,terminal=terminalAsrError(error);return send(req,res,status,{error:{code,...(terminal.rangeId?{rangeId:terminal.rangeId,chunkIndex:terminal.chunkIndex,range:terminal.range,binding:terminal.binding}:{})}});}
    finally{unbindDisconnect();}
  };
}
