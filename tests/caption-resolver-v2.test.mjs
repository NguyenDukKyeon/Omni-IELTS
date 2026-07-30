import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCaptionResolverV2,parseVttOrSrt,runYtDlp,selectCaptionTrack } from '../server/caption-resolver-v2.mjs';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';

const transcriptHeaders=type=>({'content-type':type,'x-content-type-options':'nosniff'});
const fixtureMetadata={title:'Caption fixture',duration:12,subtitles:{en:[{ext:'vtt',url:'https://captions.test/creator'}]},automatic_captions:{en:[{ext:'vtt',url:'https://captions.test/automatic'}]}};
const fixtureVtt='WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nCreator caption wins.\n\n00:00:02.000 --> 00:00:04.000\nThis is deterministic.';
const resolverYtDlp=async(_binary,args)=>Buffer.from(args[0]==='--version'?'2026.01.01':JSON.stringify(fixtureMetadata));
const requestJson=async(base,path,options={})=>{const response=await fetch(`${base}${path}`,options);return{status:response.status,body:await response.json()};};
const waitForJob=async(base,id,expected,attempts=100)=>{let last=null;for(let attempt=0;attempt<attempts;attempt+=1){const result=await requestJson(base,`/api/transcript/jobs/${encodeURIComponent(id)}`);last=result.body.job||result.body;if(last?.status===expected)return last;await new Promise(resolve=>setTimeout(resolve,20));}throw new Error(`Timed out waiting for ${expected}: ${JSON.stringify(last)}.`);};
async function withResolver({repository,fetchImpl=async()=>new Response(fixtureVtt,{status:200})},run){const resolver=createCaptionResolverV2({securityHeaders:transcriptHeaders,repository,fetchImpl,ytDlp:resolverYtDlp});const server=createServer((req,res)=>{const url=new URL(req.url,`http://${req.headers.host}`);void resolver.handle(req,res,url.pathname,url);});server.listen(0,'127.0.0.1');await once(server,'listening');const address=server.address();const base=`http://127.0.0.1:${address.port}`;try{return await run(base);}finally{await new Promise(resolve=>server.close(resolve));}}

test('creator captions deterministically win auto captions and VTT/SRT parser preserves cues',()=>{
  const track=selectCaptionTrack({subtitles:{en:[{ext:'vtt',url:'https://caption/manual'}]},automatic_captions:{en:[{ext:'vtt',url:'https://caption/auto'}]}},'en');
  assert.deepEqual(track,{kind:'creator-caption',language:'en',format:{ext:'vtt',url:'https://caption/manual'}});
  const cues=parseVttOrSrt('WEBVTT\n\n00:00:00.000 --> 00:00:01.200\nHello <b>world</b>\n\n2\n00:00:01,300 --> 00:00:02,000\nAgain');
  assert.deepEqual(cues.map(row=>row.text),['Hello world','Again']);
});

test('durable job restart turns an expired lease into typed retryable failure without duplicate job',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'resolver-job-'));const file=join(dir,'jobs.json');
  try{const first=new ResolverJobRepository({file,now:()=>100});const created=await first.getOrCreate({url:'abcDEF_1234'});await first.transition(created.job.id,'resolving',{lease:{owner:'dead-worker',until:99}});
    const restarted=new ResolverJobRepository({file,now:()=>200});const job=await restarted.get(created.job.id);const same=await restarted.getOrCreate({url:'abcDEF_1234'});
    assert.equal(job.status,'failed');assert.equal(job.error.code,'RESTART_RECOVERY');assert.equal(same.created,true,'retry may create a new job only after the predecessor becomes terminal');
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('yt-dlp adapter does not interpolate hostile input or disclose stderr credentials',async()=>{
  let observed;const fake=(_command,args,options)=>{observed={args,options};const child={pid:1,stdout:{on(){}},stderr:{on(){}},on(event,listener){if(event==='close')queueMicrotask(()=>listener(0));}};return child;};
  await runYtDlp('yt-dlp',['--dump-single-json','https://www.youtube.com/watch?v=abcDEF_1234;$(whoami)'],{spawnImpl:fake});
  assert.deepEqual(observed.args,['--dump-single-json','https://www.youtube.com/watch?v=abcDEF_1234;$(whoami)']);assert.equal(observed.options.shell,false);
});

test('HTTP lifecycle is idempotent and SSE resumes after Last-Event-ID',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'resolver-http-')),repository=new ResolverJobRepository({file:join(dir,'jobs.json')});let captionFetches=0;
  try{await withResolver({repository,fetchImpl:async()=>{captionFetches+=1;return new Response(fixtureVtt,{status:200});}},async base=>{const request={url:'https://www.youtube.com/watch?v=abcDEF_1234',language:'en',namespace:'shared'};const [left,right]=await Promise.all([requestJson(base,'/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)}),requestJson(base,'/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)})]);assert.equal(left.body.job.id,right.body.job.id);assert.equal(Number(left.body.created)+Number(right.body.created),1);const complete=await waitForJob(base,left.body.job.id,'complete');assert.equal(complete.metadata.track.kind,'creator-caption');assert.equal(captionFetches,1);const stream=await fetch(`${base}/api/transcript/jobs/${encodeURIComponent(complete.id)}/events`,{headers:{'last-event-id':'1'}}),replay=await stream.text();assert.match(replay,/id: 2/);assert.doesNotMatch(replay,/id: 1\n/);});}finally{await rm(dir,{recursive:true,force:true});}
});

test('cancellation aborts an in-flight provider and remains terminal',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'resolver-cancel-')),repository=new ResolverJobRepository({file:join(dir,'jobs.json')});let aborted=false;
  try{await withResolver({repository,fetchImpl:(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(Object.assign(new Error('aborted'),{name:'AbortError'}));},{once:true}))},async base=>{const created=await requestJson(base,'/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'https://www.youtube.com/watch?v=abcDEF_1234',language:'en'})});await waitForJob(base,created.body.job.id,'partial');const cancelled=await requestJson(base,`/api/transcript/jobs/${encodeURIComponent(created.body.job.id)}/cancel`,{method:'POST'});assert.equal(cancelled.body.job.status,'cancelled');assert.equal((await waitForJob(base,created.body.job.id,'cancelled')).status,'cancelled');assert.equal(aborted,true);});}finally{await rm(dir,{recursive:true,force:true});}
});

test('server restart retry and corrupt artifact recovery create a fresh durable job',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'resolver-recovery-')),file=join(dir,'jobs.json'),source={url:'https://www.youtube.com/watch?v=abcDEF_1234',language:'en',namespace:'shared'};let artifactPath='';
  try{const before=new ResolverJobRepository({file,now:()=>100}),stale=await before.getOrCreate(source);await before.transition(stale.job.id,'resolving',{lease:{owner:'old',until:99}});const repository=new ResolverJobRepository({file,now:()=>200});assert.equal((await repository.get(stale.job.id)).error.code,'RESTART_RECOVERY');await withResolver({repository},async base=>{const resumed=await requestJson(base,'/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(source)});assert.notEqual(resumed.body.job.id,stale.job.id);const complete=await waitForJob(base,resumed.body.job.id,'complete');artifactPath=complete.artifact.path;await writeFile(artifactPath,'{"corrupt":true}');const retry=await requestJson(base,'/api/transcript/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(source)});assert.equal(retry.body.retry,true);assert.notEqual(retry.body.job.id,complete.id);await waitForJob(base,retry.body.job.id,'complete');});}finally{if(artifactPath)await rm(artifactPath,{force:true});await rm(dir,{recursive:true,force:true});}
});
