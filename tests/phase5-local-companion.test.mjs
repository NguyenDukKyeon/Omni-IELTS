import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCompanionHttpHandler,isLoopbackAddress,LocalCompanionRuntime,runOwnedProcess,tokenMatches } from '../server/local-asr-companion.mjs';

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
