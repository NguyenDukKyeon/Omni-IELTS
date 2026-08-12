import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir,mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalCompanionRuntime } from '../server/local-asr-companion.mjs';
import { ASR_CHUNK_VERSION,createLocalCompanionClient,LocalAsrProvider,mergeAsrBatches,planAsrChunks,resolveCaptionFirst } from '../server/local-asr-provider.mjs';
import { LocalModelManager } from '../server/local-model-manager.mjs';

const modelDigest=createHash('sha256').update('model').digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const bindingFor=({durationSeconds=35,sourceId='youtube:x',language='en'}={})=>Object.freeze({engine:'faster-whisper',modelDigest:`sha256:${modelDigest}`,modelBytes:5,chunkVersion:ASR_CHUNK_VERSION,chunkSeconds:30,overlapSeconds:1.5,sourceId,language,durationSeconds,planDigest:`sha256:${sha(planAsrChunks(durationSeconds))}`});
const segmentFor=(range,text,{sourceId='youtube:x',binding=bindingFor(),startMs=Math.round(range.logicalStartSeconds*1000),endMs=Math.max(Math.round(range.logicalStartSeconds*1000)+200,Math.round(range.logicalEndSeconds*1000))}={})=>{const bindingDigest=`sha256:${sha(binding)}`,language='en';return{id:`local-asr-segment:sha256:${sha({sourceId,bindingDigest,startMs,endMs,text,language})}`,startMs,endMs,text,language,confidence:null,status:'needs-review',verified:false,sourceId,bindingDigest,asrChunk:{index:range.index,rangeId:range.rangeId,logicalStartMs:Math.round(range.logicalStartSeconds*1000),logicalEndMs:Math.round(range.logicalEndSeconds*1000)}};};
const modelBinding=bindingFor();
const TOKEN='t'.repeat(32);

test('chunk plan is bounded and caption success prevents local ASR',async()=>{
  assert.deepEqual(planAsrChunks(65).map(row=>[row.startSeconds,row.endSeconds]),[[0,31.5],[28.5,61.5],[58.5,65]]);
  let localCalls=0;const result=await resolveCaptionFirst({caption:async()=>({provider:'creator-caption'}),local:async()=>{localCalls++;},allowLocal:true});
  assert.equal(result.provider,'creator-caption');assert.equal(localCalls,0);
});

test('overlap merge is deterministic and retry reuses completed ranges',async()=>{
  const first=[{id:'a',startMs:0,endMs:2000,text:'repeat boundary.',asrChunk:{index:0}}],duplicate=[{id:'b',startMs:1500,endMs:3000,text:'Repeat boundary!',asrChunk:{index:1}}],legitimate=[{id:'c',startMs:2900,endMs:3900,text:'Repeat boundary!',asrChunk:{index:2}}];
  assert.deepEqual(mergeAsrBatches([legitimate,duplicate,first]).map(row=>row.text),['repeat boundary.','Repeat boundary!']);
  const root=await mkdtemp(join(tmpdir(),'phase5-resume-')),model=join(root,'model.bin');await writeFile(model,'model');let inferred=0;
  const runtime={extract:async()=>({id:'task'}),getTask:()=>({id:'task',directory:root,audioPath:join(root,'source.wav'),durationSeconds:35,sourceId:'youtube:x',language:'en'}),cleanup:async()=>true,ffmpegBinary:'ffmpeg',runProcess:async()=>{}};
  const provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});provider.infer=async(_task,chunk)=>{inferred++;return[{id:chunk.rangeId,startMs:chunk.logicalStartSeconds*1000,endMs:chunk.logicalEndSeconds*1000,text:`range ${chunk.index}`,status:'needs-review'}];};
  const cached=planAsrChunks(35)[0],checkpoints={[cached.rangeId]:{status:'complete',binding:modelBinding,segments:[segmentFor(cached,'cached range',{endMs:1000})],range:cached,updatedAt:1}};const saved={};
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
  const runtime=new LocalCompanionRuntime({taskRoot:root,runProcess,maxDurationSeconds:120}),provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});const batches=[];
  try{
    const originalExtract=runtime.extract.bind(runtime);runtime.extract=async input=>{const result=await originalExtract(input);taskDirectory=runtime.getTask(result.id).directory;return result;};
    const result=await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',onBatch:batch=>batches.push(batch)});
    assert.equal(batches.length,3);assert.equal(batches[0].complete,false);assert.equal(batches[0].segments[0].status,'needs-review');
    assert.equal(result.provider,'local-asr');assert.equal(result.namespace,'private');assert.equal(result.needsReview,true);assert.equal(result.rawMediaRetained,false);
    await assert.rejects(()=>import('node:fs/promises').then(fs=>fs.stat(taskDirectory)));
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local ASR holds a runtime use lease across inference and cleanup races',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-asr-lease-')),model=join(root,'model.bin');await writeFile(model,'model');let releaseInfer,startedInfer;const release=new Promise(resolve=>{releaseInfer=resolve;}),started=new Promise(resolve=>{startedInfer=resolve;});
  const runProcess=async(_command,args)=>{if(args[0]==='--dump-single-json')return Buffer.from(JSON.stringify({duration:20}));if(args.includes('--extract-audio')){await writeFile(args[args.indexOf('--output')+1],'wav');return Buffer.alloc(0);}if(args[0]==='-nostdin'){startedInfer();await release;await writeFile(args.at(-1),'chunk');return Buffer.alloc(0);}const output=args[args.indexOf('--output')+1];await writeFile(output,JSON.stringify({segments:[{start:0,end:2,text:'leased fixture'}]}));return Buffer.alloc(0);};
  const runtime=new LocalCompanionRuntime({taskRoot:root,runProcess,maxDurationSeconds:120,taskTtlMs:60_000}),provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});
  try{
    const pending=provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'});await started;const task=[...runtime.tasks.values()][0];task.createdAt=0;await runtime.cleanupExpired();assert.equal((await import('node:fs/promises').then(fs=>fs.stat(task.directory))).isDirectory(),true);await assert.rejects(()=>runtime.cleanup(task.id),error=>error.code==='PROCESS_FAILED');releaseInfer();const result=await pending;assert.equal(result.segments[0].text,'leased fixture');await assert.rejects(()=>import('node:fs/promises').then(fs=>fs.stat(task.directory)));assert.equal(runtime.getTask(task.id),null);
  }finally{releaseInfer?.();await rm(root,{recursive:true,force:true});}
});

test('local ASR releases its retained task when post-extraction task lookup fails',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-asr-missing-task-')),model=join(root,'model.bin');await writeFile(model,'model');let releases=0,cleanups=0;const runtime={extract:async()=>({id:'missing-task'}),getTask:()=>null,releaseTask:()=>{releases++;},cleanup:async()=>{cleanups++;},runProcess:async()=>{}};const provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});
  try{await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='PROCESS_FAILED');assert.equal(releases,1);assert.equal(cleanups,1);}finally{await rm(root,{recursive:true,force:true});}
});

test('current ASR checkpoint binding is exact, reusable and fail-closed for malformed executable rows',async()=>{
  assert.equal(ASR_CHUNK_VERSION,'phase5-asr-chunk-v3');const root=await mkdtemp(join(tmpdir(),'phase5-asr-binding-')),model=join(root,'model.bin');await writeFile(model,'model');let inferred=0,releases=0,cleanups=0;
  const task={id:'task',directory:root,audioPath:join(root,'source.wav'),durationSeconds:35,sourceId:'youtube:x',language:'en'},runtime={extract:async()=>({id:'task'}),getTask:()=>task,releaseTask:()=>{releases++;},cleanup:async()=>{cleanups++;},ffmpegBinary:'ffmpeg',runProcess:async()=>{}};const provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});provider.infer=async(_task,range)=>{inferred++;return[{startMs:Math.round(range.logicalStartSeconds*1000),endMs:Math.max(Math.round(range.logicalStartSeconds*1000)+200,Math.round(range.logicalEndSeconds*1000)),text:`range ${range.index}`,language:'en',confidence:null,status:'needs-review',verified:false,asrChunk:{index:range.index,rangeId:range.rangeId,logicalStartMs:Math.round(range.logicalStartSeconds*1000),logicalEndMs:Math.round(range.logicalEndSeconds*1000)}}];};
  try{
    const saved={};await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',saveCheckpoint:async(id,row)=>{saved[id]=structuredClone(row);}});assert.equal(inferred,2);assert.deepEqual(Object.keys(saved),planAsrChunks(35).map(row=>row.rangeId));assert.deepEqual(saved[planAsrChunks(35)[0].rangeId].binding,bindingFor());
    inferred=0;await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:structuredClone(saved)});assert.equal(inferred,0);
    const range0=planAsrChunks(35)[0],outOfRange=structuredClone(saved);outOfRange[range0.rangeId].segments[0].endMs=Math.round(range0.endSeconds*1000)+1;await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:outOfRange}),error=>error.code==='TRACK_INVALID');assert.equal(inferred,0);
    const forgedRange=structuredClone(saved);forgedRange[range0.rangeId].range={...range0,startSeconds:1};await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:forgedRange}),error=>error.code==='TRACK_INVALID');assert.equal(inferred,0);
    const mismatch=structuredClone(saved);mismatch[range0.rangeId].binding.modelDigest='sha256:'+'0'.repeat(64);await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:mismatch});assert.equal(inferred,1);
    let getterReads=0;const hostile=structuredClone(saved);Object.defineProperty(hostile,range0.rangeId,{enumerable:true,get(){getterReads++;return saved[range0.rangeId];}});await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:hostile}),error=>error.code==='TRACK_INVALID');assert.equal(getterReads,0);
    assert.equal(releases,6);assert.equal(cleanups,6);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('overlap merge removes only demonstrated adjacent fragments and keeps stable IDs under permutation',()=>{
  const binding=bindingFor({durationSeconds:65,sourceId:'youtube:merge'}),ranges=planAsrChunks(65),bindingDigest=`sha256:${sha(binding)}`;
  const row=(range,startMs,endMs,text)=>({id:`raw:${range.index}:${startMs}`,startMs,endMs,text,language:'en',confidence:null,status:'needs-review',verified:false,sourceId:'youtube:merge',bindingDigest,asrChunk:{index:range.index,rangeId:range.rangeId,logicalStartMs:Math.round(range.logicalStartSeconds*1000),logicalEndMs:Math.round(range.logicalEndSeconds*1000)}});
  const a=row(ranges[0],27_000,30_500,'Xin chào, world'),b=row(ranges[1],29_500,32_000,'world — again!'),legitimate=row(ranges[2],61_600,63_000,'again again');const forward=mergeAsrBatches([[a],[b],[legitimate]]),permuted=mergeAsrBatches([[legitimate],[a],[b]]);
  assert.deepEqual(permuted,forward);assert.deepEqual(forward.map(item=>item.text),['Xin chào, world — again!','again again']);assert.equal(new Set(forward.map(item=>item.id)).size,2);assert.deepEqual(mergeAsrBatches([[],[]]),[]);
});

test('overlap merge carries adjacency across chained ranges and exact replay',()=>{
  const binding=bindingFor({durationSeconds:65,sourceId:'youtube:merge-chain'}),ranges=planAsrChunks(65),bindingDigest=`sha256:${sha(binding)}`;
  const row=(range,startMs,endMs,text)=>({id:`raw:${range.index}:${startMs}`,startMs,endMs,text,language:'en',confidence:null,status:'needs-review',verified:false,sourceId:'youtube:merge-chain',bindingDigest,asrChunk:{index:range.index,rangeId:range.rangeId,logicalStartMs:Math.round(range.logicalStartSeconds*1000),logicalEndMs:Math.round(range.logicalEndSeconds*1000)}});
  const a=row(ranges[0],27_000,30_500,'alpha boundary'),b=row(ranges[1],29_500,60_500,'boundary middle'),c=row(ranges[2],59_500,63_000,'middle end'),forward=mergeAsrBatches([[a],[b],[c]]),permuted=mergeAsrBatches([[c],[a],[b]]),replayed=mergeAsrBatches([[a],[b],[c],[structuredClone(a)],[structuredClone(b)],[structuredClone(c)]]);
  assert.deepEqual(forward.map(item=>item.text),['alpha boundary middle end']);assert.deepEqual(permuted,forward);assert.deepEqual(replayed,forward);assert.equal(forward.length,1);assert.match(forward[0].id,/^local-asr-segment:sha256:/);
});

test('range-boundary cancellation durably marks the failed range and releases temporary ownership',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-asr-range-cancel-')),model=join(root,'model.bin');await writeFile(model,'model');const controller=new AbortController(),saved={};let releases=0,cleanups=0,inferred=0;const task={id:'task',directory:root,audioPath:join(root,'source.wav'),durationSeconds:65,sourceId:'youtube:x',language:'en'},runtime={extract:async()=>({id:'task'}),getTask:()=>task,releaseTask:()=>{releases++;},cleanup:async()=>{cleanups++;},ffmpegBinary:'ffmpeg',runProcess:async()=>{}};const provider=new LocalAsrProvider({runtime,modelPath:model,modelDigest,modelBytes:5});provider.infer=async(_task,range)=>{inferred++;return[{startMs:Math.round(range.logicalStartSeconds*1000),endMs:Math.round(range.logicalEndSeconds*1000),text:`range ${range.index}`,status:'needs-review'}];};
  try{await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',signal:controller.signal,onBatch:()=>controller.abort(),saveCheckpoint:async(id,row)=>{saved[id]=structuredClone(row);}}),error=>error.code==='CANCELLED'&&error.asrFailure?.rangeId===planAsrChunks(65)[1].rangeId);const ranges=planAsrChunks(65);assert.equal(saved[ranges[0].rangeId].status,'complete');assert.equal(saved[ranges[1].rangeId].status,'failed');assert.equal(saved[ranges[1].rangeId].error.code,'CANCELLED');assert.equal(inferred,1);assert.equal(releases,1);assert.equal(cleanups,1);}finally{await rm(root,{recursive:true,force:true});}
});

test('model activation verifies staged length and digest, and incompatible checkpoints are recomputed',async()=>{
  const root=await mkdtemp(join(tmpdir(),'phase5-model-')),staging=join(root,'staging');await mkdir(staging,{recursive:true});
  const staged=join(staging,'candidate.bin');await writeFile(staged,'model');
  try{
    const manager=new LocalModelManager({modelRoot:root});
    await assert.rejects(()=>manager.activate({stagedPath:staged,expectedBytes:5,expectedDigest:'0'.repeat(64)}),error=>error.code==='MODEL_INTEGRITY_FAILED');
    await writeFile(staged,'model');
    const active=await manager.activate({stagedPath:staged,expectedBytes:5,expectedDigest:modelDigest});
    assert.equal(active.modelDigest,`sha256:${modelDigest}`);assert.equal((await manager.resolveActive()).modelBytes,5);assert.equal((await readFile(active.path,'utf8')),'model');

    let inferred=0;const runtime={extract:async()=>({id:'task'}),getTask:()=>({id:'task',directory:root,audioPath:join(root,'source.wav'),durationSeconds:20,sourceId:'youtube:x',language:'en'}),cleanup:async()=>true,ffmpegBinary:'ffmpeg',runProcess:async()=>{}};
    const provider=new LocalAsrProvider({runtime,modelPath:active.path,modelDigest,modelBytes:5});provider.infer=async(_task,chunk)=>{inferred++;return[{startMs:0,endMs:1000,text:'fresh',asrChunk:{index:chunk.index}}];};
    const range=planAsrChunks(20)[0],incompatible={...modelBinding,chunkVersion:'old-chunker'};
    const result=await provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ',checkpoints:{[range.rangeId]:{status:'complete',binding:incompatible,segments:[{startMs:0,endMs:1000,text:'stale'}]}}});
    assert.equal(inferred,1);assert.equal(result.segments[0].text,'fresh');assert.deepEqual(result.checkpointBinding,bindingFor({durationSeconds:20}));
  }finally{await rm(root,{recursive:true,force:true});}
});

test('missing model fails without an automatic download or extraction',async()=>{
  let extracts=0;const runtime={extract:async()=>{extracts++;},cleanup:async()=>{},runProcess:async()=>{}},provider=new LocalAsrProvider({runtime,modelPath:'',fileStat:async()=>{throw new Error('missing');}});
  await assert.rejects(()=>provider.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MODEL_UNAVAILABLE');
  assert.equal(extracts,0);assert.equal((await provider.health()).autoDownload,false);
});

test('local companion client rejects remote or accessor configuration before token disclosure or fetch',async()=>{
  let fetches=0;const fetchImpl=async()=>{fetches++;throw new Error('fetch must not run');};
  for(const baseUrl of ['https://127.0.0.1:17321','http://127.0.0.1.evil.test:17321','http://user:pass@127.0.0.1:17321','http://localhost:17321/path','http://[::1]:70000'])assert.throws(()=>createLocalCompanionClient({baseUrl,token:TOKEN,fetchImpl}),error=>error.code==='LOCAL_COMPANION_UNAVAILABLE');
  let reads=0;const hostile={token:TOKEN,fetchImpl};Object.defineProperty(hostile,'baseUrl',{enumerable:true,get(){reads+=1;return'http://127.0.0.1:17321';}});assert.throws(()=>createLocalCompanionClient(hostile),error=>error.code==='LOCAL_COMPANION_UNAVAILABLE');assert.equal(reads,0);assert.equal(fetches,0);
  const unpaired=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:'',fetchImpl});assert.equal((await unpaired.health()).code,'PAIRING_REQUIRED');await assert.rejects(()=>unpaired.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='LOCAL_COMPANION_UNAVAILABLE');assert.equal(fetches,0);
});

test('local companion client validates bounded NDJSON before emitting any partial success',async()=>{
  const partial={type:'partial',provider:'local-asr',rangeId:'range:0-1000',chunkIndex:0,segments:[{id:'s1',startMs:0,endMs:1000,text:'fixture'}],binding:{engine:'fixture'},range:{startSeconds:0,endSeconds:1},complete:false,needsReview:true,reused:false};
  const result={provider:'local-asr',namespace:'private',segments:[{id:'s1',startMs:0,endMs:1000,text:'fixture'}],complete:true,needsReview:true,rawMediaRetained:false};const complete={type:'complete',result};
  const clientFor=text=>createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>new Response(text,{status:200,headers:{'content-type':'application/x-ndjson'}})});
  const batches=[];assert.deepEqual(await clientFor(`${JSON.stringify(partial)}\n${JSON.stringify(complete)}\n`).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:row=>batches.push(row)}),result);assert.deepEqual(batches,[partial]);
  const wrongType=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>new Response(`${JSON.stringify(complete)}\n`,{status:200,headers:{'content-type':'text/plain'}})});await assert.rejects(()=>wrongType.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='TRACK_INVALID');
  for(const text of [
    `${JSON.stringify(complete)}\n${JSON.stringify(partial)}\n`,
    `${JSON.stringify(complete)}\n${JSON.stringify(complete)}\n`,
    `${JSON.stringify({...partial,complete:true})}\n${JSON.stringify(complete)}\n`,
    `${JSON.stringify({...partial,segments:[{...partial.segments[0],credential:'PRIVATE_TOKEN_SENTINEL'}]})}\n${JSON.stringify(complete)}\n`,
    `${JSON.stringify({...partial,segments:[{...partial.segments[0],apiToken:'PRIVATE_TOKEN_SENTINEL'}]})}\n${JSON.stringify(complete)}\n`,
    `${JSON.stringify(partial)}\n{not-json}\n${JSON.stringify(complete)}\n`,
    `${JSON.stringify(partial)}\n`
  ]){let emitted=0;await assert.rejects(()=>clientFor(text).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:()=>{emitted++;}}),error=>['TRACK_INVALID','MEDIA_LIMIT'].includes(error.code));assert.equal(emitted,0);}
  const oversized=`${JSON.stringify({...partial,segments:[{...partial.segments[0],text:'x'.repeat(1_048_576)}]})}\n${JSON.stringify(complete)}\n`;await assert.rejects(()=>clientFor(oversized).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');
  const tooMany=`${Array.from({length:1025},()=>JSON.stringify(partial)).join('\n')}\n${JSON.stringify(complete)}\n`;await assert.rejects(()=>clientFor(tooMany).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');
  const responseTooLarge=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>new Response('x'.repeat(16*1024*1024+1),{status:200,headers:{'content-type':'application/x-ndjson'}})});await assert.rejects(()=>responseTooLarge.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='MEDIA_LIMIT');
  const invalidUtf8=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>new Response(Uint8Array.from([0xff,0xfe,0xfd]),{status:200,headers:{'content-type':'application/x-ndjson'}})});await assert.rejects(()=>invalidUtf8.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='TRACK_INVALID');
  const leaking=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>{throw new Error('C:\\private\\binary.exe');}});await assert.rejects(()=>leaking.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='LOCAL_COMPANION_UNAVAILABLE'&&!error.message.includes('private'));
  const cancelled=createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>{throw new DOMException('aborted','AbortError');}});await assert.rejects(()=>cancelled.transcribe({url:'https://youtu.be/dQw4w9WgXcQ'}),error=>error.code==='CANCELLED');
});

test('NDJSON v2 delivers validated partials progressively and preserves one typed terminal error',async()=>{
  const partial=index=>({type:'partial',provider:'local-asr',rangeId:`range:${index*1000}-${(index+1)*1000}`,chunkIndex:index,segments:[{id:`s${index}`,startMs:index*1000,endMs:(index+1)*1000,text:`fixture ${index}`}],binding:{engine:'fixture'},range:{index,rangeId:`range:${index*1000}-${(index+1)*1000}`,startSeconds:index,endSeconds:index+1,logicalStartSeconds:index,logicalEndSeconds:index+1},complete:false,needsReview:true,reused:false});
  const first=partial(0),failure={type:'error',error:{code:'PROCESS_FAILED'},rangeId:'range:1000-2000',chunkIndex:1,range:partial(1).range,binding:{engine:'fixture'}},response=text=>new Response(text,{status:200,headers:{'content-type':'application/x-ndjson','x-vocab-asr-protocol-version':'2'}}),clientFor=text=>createLocalCompanionClient({baseUrl:'http://127.0.0.1:17321',token:TOKEN,fetchImpl:async()=>response(text)});
  const durable=[];await assert.rejects(()=>clientFor(`${JSON.stringify(first)}\n${JSON.stringify(failure)}\n`).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:async event=>{durable.push(event);}}),error=>error.code==='PROCESS_FAILED'&&error.asrFailure?.rangeId===failure.rangeId);assert.deepEqual(durable,[first]);
  let calls=0;await assert.rejects(()=>clientFor(`${JSON.stringify(partial(1))}\n${JSON.stringify(first)}\n${JSON.stringify(failure)}\n`).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:()=>{calls++;}}),error=>error.code==='TRACK_INVALID');assert.equal(calls,1);
  calls=0;await assert.rejects(()=>clientFor(`${JSON.stringify(first)}\n`).transcribe({url:'https://youtu.be/dQw4w9WgXcQ'},{onBatch:()=>{calls++;}}),error=>error.code==='TRACK_INVALID');assert.equal(calls,1);
});
