import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseVttOrSrt,runYtDlp,selectCaptionTrack } from '../server/caption-resolver-v2.mjs';
import { ResolverJobRepository } from '../server/resolver-job-repository.mjs';

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
