import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalCompanionRuntime } from '../server/local-asr-companion.mjs';
import { LocalAsrProvider,mergeAsrBatches,planAsrChunks,resolveCaptionFirst } from '../server/local-asr-provider.mjs';

test('chunk plan is bounded and caption success prevents local ASR',async()=>{
  assert.deepEqual(planAsrChunks(65).map(row=>[row.startSeconds,row.endSeconds]),[[0,31.5],[28.5,61.5],[58.5,65]]);
  let localCalls=0;const result=await resolveCaptionFirst({caption:async()=>({provider:'creator-caption'}),local:async()=>{localCalls++;},allowLocal:true});
  assert.equal(result.provider,'creator-caption');assert.equal(localCalls,0);
});

test('overlap merge is deterministic and retry reuses completed ranges',async()=>{
  const first=[{id:'a',startMs:0,endMs:2000,text:'repeat boundary'}],duplicate=[{id:'b',startMs:1500,endMs:3000,text:'repeat boundary'}],last=[{id:'c',startMs:3000,endMs:5000,text:'legitimate repeat'}];
  assert.deepEqual(mergeAsrBatches([last,duplicate,first]).map(row=>row.text),['repeat boundary','legitimate repeat']);
  const root=await mkdtemp(join(tmpdir(),'phase5-resume-')),model=join(root,'model.bin');await writeFile(model,'model');let inferred=0;
  const runtime={extract:async()=>({id:'task'}),getTask:()=>({id:'task',directory:root,audioPath:join(root,'source.wav'),durationSeconds:35,sourceId:'youtube:x',language:'en'}),cleanup:async()=>true,ffmpegBinary:'ffmpeg',runProcess:async()=>{}};
  const provider=new LocalAsrProvider({runtime,modelPath:model,fileStat:async()=>({isFile:()=>true,size:5})});provider.infer=async(_task,chunk)=>{inferred++;return[{id:chunk.rangeId,startMs:chunk.logicalStartSeconds*1000,endMs:chunk.logicalEndSeconds*1000,text:`range ${chunk.index}`,status:'needs-review'}];};
  const cached=planAsrChunks(35)[0],checkpoints={[cached.rangeId]:{status:'complete',segments:[{id:'cached',startMs:0,endMs:1000,text:'cached range',status:'needs-review'}]}};const saved={};
  try{const result=await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints,saveCheckpoint:async(id,row)=>{saved[id]=row;}});assert.equal(inferred,1);assert.equal(result.segments.some(row=>row.text==='cached range'),true);assert.equal(Object.values(saved).every(row=>row.status==='complete'),true);}finally{await rm(root,{recursive:true,force:true});}
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
