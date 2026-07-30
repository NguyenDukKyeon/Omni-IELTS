import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { EventEmitter,once } from 'node:events';
import { mkdir,mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bindHttpDisconnect,createCompanionHttpHandler,isLoopbackAddress,LocalCompanionRuntime,runOwnedProcess,tokenMatches } from '../server/local-asr-companion.mjs';

test('loopback and constant-time pairing boundaries fail closed',()=>{
  assert.equal(isLoopbackAddress('127.0.0.1'),true);assert.equal(isLoopbackAddress('0.0.0.0'),false);
  assert.equal(tokenMatches('fixed-token','fixed-token'),true);assert.equal(tokenMatches('fixed-token','other-token'),false);
  assert.throws(()=>createCompanionHttpHandler({token:'x',allowedOrigins:['*']}),error=>error.code==='INVALID_SOURCE');
});

test('owned process uses argv without shell interpolation and supports cancellation',async()=>{
  let observed;const fake=(_command,args,options)=>{observed={args,options};const listeners={};const stream={on(){}};const child={pid:123,stdout:stream,stderr:stream,on(type,fn){listeners[type]=fn;},kill(){listeners.close?.(1);}};queueMicrotask(()=>listeners.close?.(0));return child;};
  await runOwnedProcess('fake',['https://example.test/;$(whoami)'],{spawnImpl:fake});
  assert.equal(observed.options.shell,false);assert.deepEqual(observed.args,['https://example.test/;$(whoami)']);
});

test('HTTP disconnect aborts ASR and reaches the owned process-tree terminator',async()=>{
  const within=(promise,label)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${label}`)),1000);Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
  const req=new EventEmitter(),res=Object.assign(new EventEmitter(),{writableEnded:false}),httpController=new AbortController();const unbind=bindHttpDisconnect(req,res,httpController);
  res.emit('close');assert.equal(httpController.signal.aborted,true);unbind();

  const controller=new AbortController();let terminated=false,closed;const closedPromise=new Promise(resolve=>{closed=resolve;});
  const fake=()=>{const listeners={},stream={on(){}};return{pid:456,stdout:stream,stderr:stream,on(type,fn){listeners[type]=fn;},kill(){listeners.close?.(1);},emitClose(){listeners.close?.(1);}};};
  let child;const pending=runOwnedProcess('fake',['arg'],{signal:controller.signal,spawnImpl:(...args)=>(child=fake(...args)),terminateImpl:async()=>{terminated=true;child.emitClose();closed();}});
  controller.abort();await within(closedPromise,'process-close');await assert.rejects(within(pending,'process-reject'),error=>error.code==='CANCELLED');assert.equal(terminated,true);
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

test('HTTP companion rejects origin and missing auth before extraction',async()=>{
  let extracts=0;const handler=createCompanionHttpHandler({token:'pair-me',allowedOrigins:['http://localhost:3000'],runtime:{health:async()=>({ok:true}),extract:async()=>{extracts++;return{}}}});
  const server=createServer((req,res)=>void handler(req,res));server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  try{
    assert.equal((await fetch(`${base}/health`,{headers:{origin:'http://evil.test',authorization:'Bearer pair-me'}})).status,403);
    assert.equal((await fetch(`${base}/health`,{headers:{origin:'http://localhost:3000'}})).status,401);
    assert.equal(extracts,0);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('restart recovery cleans only journal-owned media and bounds concurrency and disk before extraction',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-companion-recovery-')),owned=join(root,'vocab-asr-owned'),foreign=join(root,'vocab-asr-foreign');await mkdir(owned);await mkdir(foreign);
  await writeFile(join(owned,'journal.json'),JSON.stringify({owner:'vocab-master-local-companion-v1',id:'local-media:orphan'}));await writeFile(join(foreign,'keep.txt'),'user-owned');
  try{
    const recovery=new LocalCompanionRuntime({taskRoot:root,runProcess:async()=>Buffer.from('v1'),diskStat:async()=>({bavail:1_000_000,bsize:4096})});
    assert.equal((await recovery.initialize()).cleaned,1);await assert.rejects(()=>readFile(join(owned,'journal.json')));assert.equal(await readFile(join(foreign,'keep.txt'),'utf8'),'user-owned');

    let metadataRelease,metadataStarted;const release=new Promise(resolve=>{metadataRelease=resolve;}),began=new Promise(resolve=>{metadataStarted=resolve;}),calls=[];
    const bounded=new LocalCompanionRuntime({taskRoot:root,maxConcurrentTasks:1,diskReserveBytes:0,diskStat:async()=>({bavail:1_000_000,bsize:4096}),runProcess:async(_command,args)=>{calls.push(args);if(args[0]==='--dump-single-json'){metadataStarted();await release;return Buffer.from(JSON.stringify({duration:60}));}await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);}});
    const first=bounded.extract({url:'https://youtu.be/dQw4w9WgXcQ'});await began;
    await assert.rejects(()=>bounded.extract({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');metadataRelease();const task=await first;await bounded.cleanup(task.id);

    let lowDiskCalls=0;const lowDisk=new LocalCompanionRuntime({taskRoot:root,diskReserveBytes:0,diskStat:async()=>({bavail:0,bsize:4096}),runProcess:async(_command,args)=>{lowDiskCalls++;if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:60}));throw new Error('extraction must not start');}});
    await assert.rejects(()=>lowDisk.extract({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');assert.equal(lowDiskCalls,1);
  }finally{await rm(root,{recursive:true,force:true});}
});
