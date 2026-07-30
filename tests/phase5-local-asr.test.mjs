import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalCompanionRuntime } from '../server/local-asr-companion.mjs';
import { LocalAsrProvider,planAsrChunks,resolveCaptionFirst } from '../server/local-asr-provider.mjs';

test('chunk plan is bounded and caption success prevents local ASR',async()=>{
  assert.deepEqual(planAsrChunks(65).map(row=>[row.startSeconds,row.endSeconds]),[[0,30],[30,60],[60,65]]);
  let localCalls=0;const result=await resolveCaptionFirst({caption:async()=>({provider:'creator-caption'}),local:async()=>{localCalls++;},allowLocal:true});
  assert.equal(result.provider,'creator-caption');assert.equal(localCalls,0);
});

test('local ASR emits first usable private unverified batch and cleans raw media',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-asr-')),model=join(root,'model.bin');await writeFile(model,'model');
  let inference=0,taskDirectory='';const runProcess=async(_command,args)=>{
    if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:65}));
    if(args.includes('--extract-audio')){await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);}
    if(args[0]==='-nostdin'){await writeFile(args.at(-1),'chunk');return Buffer.alloc(0);}
    const output=args[args.indexOf('--output')+1];await writeFile(output,JSON.stringify({segments:[{start:0,end:2,text:`batch ${++inference}`}] }));return Buffer.alloc(0);
  };
  const runtime=new LocalCompanionRuntime({taskRoot:root,runProcess,maxDurationSeconds:120}),provider=new LocalAsrProvider({runtime,modelPath:model,fileStat:async path=>({isFile:()=>true,size:path===model?5:0})});const batches=[];
  try{
    const originalExtract=runtime.extract.bind(runtime);runtime.extract=async input=>{const result=await originalExtract(input);taskDirectory=runtime.getTask(result.id).directory;return result;};
    const result=await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',onBatch:batch=>batches.push(batch)});
    assert.equal(batches.length,3);assert.equal(batches[0].complete,false);assert.equal(batches[0].segments[0].status,'needs-review');
    assert.equal(result.provider,'local-asr');assert.equal(result.namespace,'private');assert.equal(result.needsReview,true);assert.equal(result.rawMediaRetained,false);
    await assert.rejects(()=>import('node:fs/promises').then(fs=>fs.stat(taskDirectory)));
  }finally{await rm(root,{recursive:true,force:true});}
});

test('missing model fails without an automatic download or extraction',async()=>{
  let extracts=0;const runtime={extract:async()=>{extracts++;},cleanup:async()=>{},runProcess:async()=>{}},provider=new LocalAsrProvider({runtime,modelPath:'',fileStat:async()=>{throw new Error('missing');}});
  await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MODEL_UNAVAILABLE');
  assert.equal(extracts,0);assert.equal((await provider.health()).autoDownload,false);
});
