import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer,request as httpRequest } from 'node:http';
import { EventEmitter,once } from 'node:events';
import { link,lstat,mkdir,mkdtemp,readFile,rm,stat,symlink,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bindHttpDisconnect,createCompanionHttpHandler,isLoopbackAddress,LocalCompanionRuntime,runOwnedProcess,tokenMatches,validateCompanionStartupConfig } from '../server/local-asr-companion.mjs';
import { createLocalCompanionClient } from '../server/local-asr-provider.mjs';

const TOKEN='t'.repeat(32);
const AUTH={authorization:`Bearer ${TOKEN}`,origin:'http://localhost:3000'};
const within=(promise,label,timeoutMs=1000)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${label}`)),timeoutMs);Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
async function rawRequest(base,path,{method='GET',headers={},body=null}={}){
  const target=new URL(path,base);return new Promise((resolve,reject)=>{const req=httpRequest({hostname:target.hostname,port:target.port,path:`${target.pathname}${target.search}`,method,headers},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>{const text=Buffer.concat(chunks).toString('utf8');let json=null;try{json=text?JSON.parse(text):null;}catch{}resolve({status:res.statusCode,headers:res.headers,text,json});});});req.on('error',reject);if(body!==null)req.write(body);req.end();});
}

test('loopback and constant-time pairing boundaries fail closed',()=>{
  assert.equal(isLoopbackAddress('127.0.0.1'),true);assert.equal(isLoopbackAddress('0.0.0.0'),false);
  assert.equal(tokenMatches(TOKEN,TOKEN),true);assert.equal(tokenMatches(TOKEN,'o'.repeat(32)),false);assert.equal(tokenMatches({toString(){throw new Error('must not stringify');}},TOKEN),false);
  assert.deepEqual(validateCompanionStartupConfig({host:'127.0.0.1',port:17321,token:TOKEN,allowedOrigins:['http://localhost:3000']}),{host:'127.0.0.1',port:17321,token:TOKEN,allowedOrigins:['http://localhost:3000']});
  for(const port of [0,65536,1.5,NaN])assert.throws(()=>validateCompanionStartupConfig({host:'127.0.0.1',port,token:TOKEN,allowedOrigins:[]}),error=>error.code==='INVALID_SOURCE');
  assert.throws(()=>createCompanionHttpHandler({token:'weak',allowedOrigins:[]}),error=>error.code==='CONSENT_REQUIRED');
  for(const origin of ['*','null','http://localhost:3000/path','http://user:pass@localhost:3000','javascript:alert(1)'])assert.throws(()=>createCompanionHttpHandler({token:TOKEN,allowedOrigins:[origin]}),error=>error.code==='INVALID_SOURCE');
  let reads=0;const hostile={runtime:{},asrProvider:null,allowedOrigins:[]};Object.defineProperty(hostile,'token',{enumerable:true,get(){reads+=1;return TOKEN;}});assert.throws(()=>createCompanionHttpHandler(hostile),error=>error.code==='CONSENT_REQUIRED');assert.equal(reads,0);
  const hostileOrigins=[];Object.defineProperty(hostileOrigins,'0',{enumerable:true,get(){reads+=1;return'http://localhost:3000';}});hostileOrigins.length=1;assert.throws(()=>createCompanionHttpHandler({token:TOKEN,allowedOrigins:hostileOrigins}),error=>error.code==='INVALID_SOURCE');assert.equal(reads,0);
});

test('owned process uses argv without shell interpolation and supports cancellation',async()=>{
  let observed;const fake=(_command,args,options)=>{observed={args,options};const listeners={};const stream={on(){}};const child={pid:123,stdout:stream,stderr:stream,on(type,fn){listeners[type]=fn;},kill(){listeners.close?.(1);}};queueMicrotask(()=>listeners.close?.(0));return child;};
  await runOwnedProcess('fake',['https://example.test/;$(whoami)'],{spawnImpl:fake});
  assert.equal(observed.options.shell,false);assert.deepEqual(observed.args,['https://example.test/;$(whoami)']);
});

test('HTTP disconnect aborts ASR and reaches the owned process-tree terminator',async()=>{
  const req=new EventEmitter(),res=Object.assign(new EventEmitter(),{writableEnded:false}),httpController=new AbortController();const unbind=bindHttpDisconnect(req,res,httpController);
  res.emit('close');assert.equal(httpController.signal.aborted,true);unbind();

  const controller=new AbortController();let terminated=false,closed;const closedPromise=new Promise(resolve=>{closed=resolve;});
  const fake=()=>{const listeners={},stream={on(){}};return{pid:456,stdout:stream,stderr:stream,on(type,fn){listeners[type]=fn;},kill(){listeners.close?.(1);},emitClose(){listeners.close?.(1);}};};
  let child;const pending=runOwnedProcess('fake',['arg'],{signal:controller.signal,spawnImpl:(...args)=>(child=fake(...args)),terminateImpl:async()=>{terminated=true;child.emitClose();closed();}});
  controller.abort();await within(closedPromise,'process-close');await assert.rejects(within(pending,'process-reject'),error=>error.code==='CANCELLED');assert.equal(terminated,true);
});

test('owned process cancellation settles even when the process-tree terminator never settles',async()=>{
  const controller=new AbortController(),stream={on(){}},listeners={};let killed=false;
  const pending=runOwnedProcess('fake',['arg'],{signal:controller.signal,spawnImpl:()=>({pid:777,stdout:stream,stderr:stream,on(type,listener){listeners[type]=listener;},kill(){killed=true;}}),terminateImpl:()=>new Promise(()=>{}),terminationGraceMs:25});
  controller.abort();await assert.rejects(within(pending,'hung-terminator',400),error=>error.code==='CANCELLED');assert.equal(killed,true);
});

test('owned process output-limit and timeout settle through bounded fallback termination',async()=>{
  const child=()=>{const processListeners={},streamListeners={};let killed=false;return{pid:778,stdout:{on(type,listener){streamListeners[type]=listener;}},stderr:{on(){}},on(type,listener){processListeners[type]=listener;},kill(){killed=true;},emitOutput(value){streamListeners.data?.(Buffer.from(value));},get killed(){return killed;}};};
  const outputChild=child(),output=runOwnedProcess('fake',['arg'],{spawnImpl:()=>outputChild,terminateImpl:async()=>{throw new Error('terminator failed');},maxOutputBytes:4,terminationGraceMs:20});outputChild.emitOutput('12345');await assert.rejects(within(output,'output-limit',400),error=>error.code==='MEDIA_LIMIT');assert.equal(outputChild.killed,true);
  const timeoutChild=child(),timed=runOwnedProcess('fake',['arg'],{spawnImpl:()=>timeoutChild,terminateImpl:()=>new Promise(()=>{}),timeoutMs:20,terminationGraceMs:20});await assert.rejects(within(timed,'process-timeout',400),error=>error.code==='TIMEOUT');assert.equal(timeoutChild.killed,true);
});

test('media extraction owns paths, enforces metadata caps and removes temp data',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-'));const calls=[];
  const runProcess=async(_command,args)=>{calls.push(args);if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:60,title:'fixture'}));const output=args[args.indexOf('--output')+1];await writeFile(output,'fake wav');return Buffer.alloc(0);};
  const runtime=new LocalCompanionRuntime({taskRoot:root,runProcess,maxDurationSeconds:120});
  try{
    const result=await runtime.extract({url:'https://youtu.be/dQw4w9WgXcQ'});const task=runtime.getTask(result.id);
    assert.equal(task.directory.startsWith(root),true);assert.equal(calls[1].includes(task.audioPath),true);assert.equal(calls[1].includes('--no-playlist'),true);
    assert.equal(JSON.parse(await readFile(join(task.directory,'journal.json'),'utf8')).state,'ready');
    await runtime.cleanup(result.id);await assert.rejects(()=>readFile(task.audioPath));
  }finally{await rm(root,{recursive:true,force:true});}
});

test('portable health never exposes binary output paths, tokens or owner namespaces',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-health-')),runtime=new LocalCompanionRuntime({taskRoot:root,runProcess:async()=>Buffer.from('C:\\private\\ffmpeg.exe token=PRIVATE_TOKEN_SENTINEL Bearer secret')});
  try{const health=await runtime.health(),serialized=JSON.stringify(health);for(const secret of ['C:\\private','PRIVATE_TOKEN_SENTINEL','Bearer secret','vocab-master-local-companion-v1'])assert.equal(serialized.includes(secret),false);assert.equal(health.loopbackOnly,true);assert.equal(health.authenticated,true);}
  finally{await rm(root,{recursive:true,force:true});}
});

test('HTTP companion orders Host, Origin and pairing rejection before runtime',async()=>{
  let calls=0;const runtime={health:async()=>{calls++;return{ok:true};},extract:async()=>{calls++;return{};},cleanup:async()=>{calls++;return true;}};const handler=createCompanionHttpHandler({token:TOKEN,allowedOrigins:['http://localhost:3000'],runtime});
  const server=createServer((req,res)=>void handler(req,res));server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  try{
    let response=await rawRequest(base,'/health',{headers:{...AUTH,host:'evil.test'}});assert.equal(response.status,403);assert.equal(response.json.error.code,'HOST_DENIED');
    response=await rawRequest(base,'/health',{headers:{...AUTH,origin:'http://evil.test'}});assert.equal(response.status,403);assert.equal(response.json.error.code,'ORIGIN_DENIED');
    response=await rawRequest(base,'/health',{headers:{origin:'http://localhost:3000'}});assert.equal(response.status,401);assert.equal(response.json.error.code,'PAIRING_REQUIRED');assert.equal(calls,0);
    response=await rawRequest(base,'/health',{headers:{...AUTH,'content-type':'application/json','content-length':'2'},body:'{}'});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');assert.equal(calls,0);
    response=await rawRequest(base,'/health',{headers:{...AUTH,'transfer-encoding':'chunked'},body:'{}'});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');assert.equal(calls,0);
    response=await rawRequest(base,'/health',{headers:{authorization:`Bearer ${TOKEN}`}});assert.equal(response.status,200);assert.equal(calls,1);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('HTTP ASR v2 streams validated progress before completion and terminates failures without losing progress',async()=>{
  const partial={provider:'local-asr',rangeId:'range:0-1000',chunkIndex:0,segments:[{id:'s1',startMs:0,endMs:1000,text:'fixture'}],binding:{engine:'fixture'},range:{startSeconds:0,endSeconds:1},complete:false,needsReview:true,reused:false};
  const result={provider:'local-asr',namespace:'private',segments:[{id:'s1',startMs:0,endMs:1000,text:'fixture'}],complete:true,needsReview:true,rawMediaRetained:false};
  const failureRange={rangeId:partial.rangeId,chunkIndex:partial.chunkIndex,range:partial.range,binding:partial.binding};const runtime={health:async()=>({ok:true})};let mode='before',releaseProvider=()=>{},providerCalls=0;
  const asrProvider={health:async()=>({available:true}),transcribe:async({onBatch})=>{providerCalls++;if(mode==='before')throw Object.assign(new Error('model missing'),{code:'MODEL_UNAVAILABLE'});if(mode==='after'){await onBatch(partial);throw Object.assign(new Error('private process failed'),{code:'PROCESS_FAILED',asrFailure:failureRange});}await onBatch(partial);if(mode==='held')await new Promise(resolve=>{releaseProvider=resolve;});return result;}};
  const handler=createCompanionHttpHandler({token:TOKEN,allowedOrigins:['http://localhost:3000'],runtime,asrProvider}),server=createServer((req,res)=>void handler(req,res));server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  try{
    let response=await rawRequest(base,'/asr',{method:'POST',headers:{...AUTH,'content-type':'application/json'},body:JSON.stringify({url:'https://youtu.be/dQw4w9WgXcQ'})});assert.equal(response.status,503);assert.equal(response.json.error.code,'MODEL_UNAVAILABLE');assert.equal(response.text.includes('partial'),false);
    const client=createLocalCompanionClient({baseUrl:base,token:TOKEN});mode='held';let observedEarly=false,earlyResolve;const early=new Promise(resolve=>{earlyResolve=resolve;}),pending=client.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:()=>{observedEarly=true;earlyResolve();}});const wasProgressive=await Promise.race([early.then(()=>true),new Promise(resolve=>setTimeout(()=>resolve(false),100))]);releaseProvider();const heldResult=await pending;assert.equal(wasProgressive,true);assert.equal(observedEarly,true);assert.deepEqual(heldResult,result);
    mode='after';const durable=[];await assert.rejects(()=>client.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:async row=>{durable.push(row);}}),error=>error.code==='PROCESS_FAILED'&&error.asrFailure?.rangeId===partial.rangeId);assert.deepEqual(durable,[{type:'partial',...partial}]);
    mode='success';const largeCheckpoint={legacy:{chunkVersion:'phase5-asr-chunk-v1',padding:'x'.repeat(40_000)}};assert.deepEqual(await client.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:largeCheckpoint}),result);
    const callsBefore=providerCalls;await assert.rejects(()=>client.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:{legacy:{chunkVersion:'old',padding:'x'.repeat(16*1024*1024)}}}),error=>error.code==='MEDIA_LIMIT');assert.equal(providerCalls,callsBefore);
  }finally{releaseProvider();await new Promise(resolve=>server.close(resolve));}
});

test('HTTP endpoint schemas reject parser, command, path and cleanup-ID injection before owners',async()=>{
  const calls={extract:0,asr:0,cleanup:0};const runtime={health:async()=>({ok:true}),extract:async body=>{calls.extract++;return{id:'local-media:'+'a'.repeat(24),...body};},cleanup:async()=>{calls.cleanup++;return true;}};const asrProvider={health:async()=>({available:true}),transcribe:async()=>{calls.asr++;return{provider:'local-asr',segments:[{text:'ok'}],complete:true};}};const handler=createCompanionHttpHandler({token:TOKEN,allowedOrigins:['http://localhost:3000'],runtime,asrProvider});const server=createServer((req,res)=>void handler(req,res));server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`,jsonHeaders={...AUTH,'content-type':'application/json'};
  try{
    let response=await rawRequest(base,'/extract',{method:'POST',headers:jsonHeaders,body:'{"url":'});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');assert.equal(response.text.includes('JSON'),false);
    response=await rawRequest(base,'/extract',{method:'POST',headers:jsonHeaders,body:JSON.stringify({url:'https://youtu.be/dQw4w9WgXcQ',command:'rm',taskRoot:'C:\\private'})});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');assert.equal(response.text.includes('C:\\private'),false);
    response=await rawRequest(base,'/asr',{method:'POST',headers:jsonHeaders,body:JSON.stringify({url:'https://youtu.be/dQw4w9WgXcQ',owner:'evidence-authority'})});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');
    response=await rawRequest(base,'/asr',{method:'POST',headers:jsonHeaders,body:JSON.stringify({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:{'range:0-1000':{status:'complete',command:'rm',privatePath:'C:\\private'}}})});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');
    response=await rawRequest(base,'/asr',{method:'POST',headers:jsonHeaders,body:JSON.stringify({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:{'range:0-1000':{status:'complete',outputPath:'C:\\private',authToken:'PRIVATE_TOKEN_SENTINEL'}}})});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');
    response=await rawRequest(base,'/tasks/..%2Fforeign/cleanup',{method:'POST',headers:AUTH});assert.equal(response.status,400);assert.equal(response.json.error.code,'INVALID_SOURCE');
    response=await rawRequest(base,`/tasks/local-media:${'a'.repeat(24)}/cleanup`,{method:'POST',headers:AUTH});assert.equal(response.status,200);assert.equal(response.json.cleaned,true);assert.deepEqual(calls,{extract:0,asr:0,cleanup:1});
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('restart recovery cleans only journal-owned media and bounds concurrency and disk before extraction',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-recovery-')),outside=await mkdtemp(join(tmpdir(),'phase5-companion-outside-')),valid=join(root,'vocab-asr-valid'),foreign=join(root,'vocab-asr-foreign'),forgedOwner=join(root,'vocab-asr-forged-owner'),forgedId=join(root,'vocab-asr-forged-id'),future=join(root,'vocab-asr-future'),malformed=join(root,'vocab-asr-malformed');for(const path of [valid,foreign,forgedOwner,forgedId,future,malformed])await mkdir(path);
  const validId=`local-media:${'a'.repeat(24)}`,journal={version:1,owner:'vocab-master-local-companion-v1',id:validId,state:'ready',sourceId:'youtube:dQw4w9WgXcQ',mediaBytes:8,reservedBytes:1_920_044,createdAt:1};
  await writeFile(join(valid,'journal.json'),JSON.stringify(journal));await writeFile(join(foreign,'keep.txt'),'user-owned');await writeFile(join(forgedOwner,'journal.json'),JSON.stringify({...journal,owner:'foreign-owner',id:`local-media:${'b'.repeat(24)}`}));await writeFile(join(forgedId,'journal.json'),JSON.stringify({...journal,id:'local-media:not-valid'}));await writeFile(join(future,'journal.json'),JSON.stringify({...journal,version:2,id:`local-media:${'c'.repeat(24)}`}));await writeFile(join(malformed,'journal.json'),'{not json');await writeFile(join(outside,'journal.json'),JSON.stringify({...journal,id:`local-media:${'d'.repeat(24)}`}));await symlink(outside,join(root,'vocab-asr-outside-link'),'junction');
  try{
    const recovery=new LocalCompanionRuntime({taskRoot:root,runProcess:async()=>Buffer.from('v1'),diskStat:async()=>({bavail:1_000_000,bsize:4096})});
    assert.equal(recovery.isOwnedJournal({...journal,sourceId:'youtube:'}),false);assert.equal(recovery.isOwnedJournal({...journal,reservedBytes:Number.MAX_SAFE_INTEGER}),false);assert.equal(recovery.isOwnedJournal({...journal,mediaBytes:Number.MAX_SAFE_INTEGER}),false);assert.equal(recovery.isOwnedJournal({...journal,createdAt:Date.now()+86_400_000}),false);
    const recovered=await recovery.initialize();assert.equal(recovered.cleaned,1);assert.equal(recovered.skipped,5);await assert.rejects(()=>readFile(join(valid,'journal.json')));assert.equal(await readFile(join(foreign,'keep.txt'),'utf8'),'user-owned');assert.equal((await stat(outside)).isDirectory(),true);for(const path of [forgedOwner,forgedId,future,malformed])assert.equal((await stat(path)).isDirectory(),true);

    let metadataRelease,metadataStarted;const release=new Promise(resolve=>{metadataRelease=resolve;}),began=new Promise(resolve=>{metadataStarted=resolve;}),calls=[];
    const bounded=new LocalCompanionRuntime({taskRoot:root,maxConcurrentTasks:1,diskReserveBytes:0,diskStat:async()=>({bavail:1_000_000,bsize:4096}),runProcess:async(_command,args)=>{calls.push(args);if(args[0]==='--dump-single-json'){metadataStarted();await release;return Buffer.from(JSON.stringify({duration:60}));}await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);}});
    const first=bounded.extract({url:'https://youtu.be/dQw4w9WgXcQ'});await began;
    await assert.rejects(()=>bounded.extract({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');metadataRelease();const task=await first;await bounded.cleanup(task.id);

    let lowDiskCalls=0;const lowDisk=new LocalCompanionRuntime({taskRoot:root,diskReserveBytes:0,diskStat:async()=>({bavail:0,bsize:4096}),runProcess:async(_command,args)=>{lowDiskCalls++;if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:60}));throw new Error('extraction must not start');}});
    await assert.rejects(()=>lowDisk.extract({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');assert.equal(lowDiskCalls,1);
  }finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});

test('restart recovery dual-reads exact legacy journals while future journals stay untouched',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-legacy-')),legacyExtracting=join(root,'vocab-asr-legacy-extracting'),legacyReady=join(root,'vocab-asr-legacy-ready'),future=join(root,'vocab-asr-future-v2');
  for(const directory of [legacyExtracting,legacyReady,future])await mkdir(directory);
  const base={owner:'vocab-master-local-companion-v1',state:'extracting',sourceId:'youtube:dQw4w9WgXcQ',reservedBytes:1,createdAt:1};
  const extracting={...base,id:`local-media:${'1'.repeat(24)}`},ready={...base,id:`local-media:${'2'.repeat(24)}`,state:'ready',mediaBytes:8};
  await writeFile(join(legacyExtracting,'journal.json'),JSON.stringify(extracting));await writeFile(join(legacyReady,'journal.json'),JSON.stringify(ready));await writeFile(join(future,'journal.json'),JSON.stringify({...ready,version:2,id:`local-media:${'3'.repeat(24)}`}));
  try{
    const runtime=new LocalCompanionRuntime({taskRoot:root}),recovery=await runtime.initialize();assert.equal(recovery.cleaned,2);assert.equal((await stat(future)).isDirectory(),true);
    await assert.rejects(()=>stat(legacyExtracting));await assert.rejects(()=>stat(legacyReady));
  }finally{await rm(root,{recursive:true,force:true});}
});

test('restart recovery never follows hardlinked or symlinked journal files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-journal-link-')),outside=await mkdtemp(join(tmpdir(),'phase5-companion-linked-journal-')),hardlinked=join(root,'vocab-asr-hardlinked'),symlinked=join(root,'vocab-asr-symlinked');for(const directory of [hardlinked,symlinked])await mkdir(directory);
  const ready={version:1,owner:'vocab-master-local-companion-v1',id:`local-media:${'4'.repeat(24)}`,state:'ready',sourceId:'youtube:dQw4w9WgXcQ',mediaBytes:8,reservedBytes:1,createdAt:1},serialized=JSON.stringify(ready),externalJournal=join(outside,'journal.json');await writeFile(externalJournal,serialized);await link(externalJournal,join(hardlinked,'journal.json'));
  let symlinkCreated=false;try{await symlink(externalJournal,join(symlinked,'journal.json'),'file');symlinkCreated=true;}catch(error){if(!['EPERM','EACCES'].includes(error.code))throw error;}
  try{
    assert.equal((await lstat(join(hardlinked,'journal.json'))).nlink>1,true);const runtime=new LocalCompanionRuntime({taskRoot:root}),recovery=await runtime.initialize();assert.equal(recovery.cleaned,0);assert.equal((await stat(hardlinked)).isDirectory(),true);assert.equal(await readFile(externalJournal,'utf8'),serialized);if(symlinkCreated)assert.equal((await stat(symlinked)).isDirectory(),true);
  }finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});

test('authenticated orphan cleanup I/O failure remains visible and preserves the owned directory',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-cleanup-failure-')),owned=join(root,'vocab-asr-owned'),id=`local-media:${'e'.repeat(24)}`;await mkdir(owned);await writeFile(join(owned,'journal.json'),JSON.stringify({version:1,owner:'vocab-master-local-companion-v1',id,state:'extracting',sourceId:'youtube:dQw4w9WgXcQ',reservedBytes:1,createdAt:1}));
  try{const runtime=new LocalCompanionRuntime({taskRoot:root,remove:async()=>{throw Object.assign(new Error('private path must not leak'),{code:'EACCES'});}});await assert.rejects(()=>runtime.initialize(),error=>error.code==='PROCESS_FAILED'&&!error.message.includes(root));assert.equal((await stat(owned)).isDirectory(),true);}
  finally{await rm(root,{recursive:true,force:true});}
});

test('concurrent disk reservation cannot oversubscribe the same available bytes',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-disk-race-'));let diskCalls=0;const runProcess=async(_command,args)=>{if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:60}));await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);};const runtime=new LocalCompanionRuntime({taskRoot:root,maxConcurrentTasks:2,diskReserveBytes:0,diskStat:async()=>{diskCalls++;await new Promise(resolve=>setImmediate(resolve));return{bavail:625,bsize:4096};},runProcess});
  try{const results=await Promise.allSettled([runtime.extract({url:'https://youtu.be/dQw4w9WgXcQ'}),runtime.extract({url:'https://youtu.be/dQw4w9WgXcQ'})]);assert.equal(results.filter(row=>row.status==='fulfilled').length,1);assert.equal(results.filter(row=>row.status==='rejected'&&row.reason.code==='MEDIA_LIMIT').length,1);assert.equal(diskCalls,2);for(const row of results)if(row.status==='fulfilled')await runtime.cleanup(row.value.id);assert.equal((await import('node:fs/promises').then(fs=>fs.readdir(root))).length,0);}
  finally{await rm(root,{recursive:true,force:true});}
});

test('TTL cleanup preserves extracting tasks and later removes expired ready tasks',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-ttl-'));let releaseExtraction,extractionStarted;const release=new Promise(resolve=>{releaseExtraction=resolve;}),started=new Promise(resolve=>{extractionStarted=resolve;});const runtime=new LocalCompanionRuntime({taskRoot:root,taskTtlMs:60_000,diskReserveBytes:0,diskStat:async()=>({bavail:1_000_000,bsize:4096}),runProcess:async(_command,args)=>{if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:60}));extractionStarted();await release;await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);}});
  try{const pending=runtime.extract({url:'https://youtu.be/dQw4w9WgXcQ'});await started;const task=[...runtime.tasks.values()][0];task.createdAt=0;await runtime.cleanupExpired();assert.equal((await stat(task.directory)).isDirectory(),true);assert.equal(runtime.getTask(task.id).state,'extracting');releaseExtraction();const ready=await pending;runtime.tasks.get(ready.id).createdAt=0;await runtime.cleanupExpired();assert.equal(runtime.getTask(ready.id),null);await assert.rejects(()=>stat(task.directory));}
  finally{releaseExtraction?.();await rm(root,{recursive:true,force:true});}
});
