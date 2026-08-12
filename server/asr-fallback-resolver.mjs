import { createHash,randomBytes } from 'node:crypto';
import { ASR_CHUNK_VERSION,mergeAsrBatches,planAsrChunks } from './local-asr-provider.mjs';
import { RESOLVER_ERROR_CODES,resolverError } from '../src/resolver-contracts.js';

const json=(res,status,data,headers)=>{res.writeHead(status,{...headers('application/json; charset=utf-8'),'cache-control':'no-store'});res.end(JSON.stringify(data));};
const safeError=error=>({code:RESOLVER_ERROR_CODES.includes(error?.code)?error.code:'PROCESS_FAILED',retryable:error?.retryable===true});
const active=job=>['resolving','partial'].includes(job?.status);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const plain=value=>{try{const prototype=value&&typeof value==='object'?Object.getPrototypeOf(value):null;return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&(prototype===Object.prototype||prototype===null);}catch{return false;}};
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const digest=value=>`sha256:${createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')}`;
const same=(left,right)=>JSON.stringify(stable(left))===JSON.stringify(stable(right));
const exact=(value,keys)=>{if(!plain(value))return false;let descriptors;try{descriptors=Object.getOwnPropertyDescriptors(value);}catch{return false;}return Object.keys(descriptors).length===keys.length&&keys.every(key=>own(descriptors,key)&&own(descriptors[key],'value'));};
const bindingKeys=['engine','modelDigest','modelBytes','chunkVersion','chunkSeconds','overlapSeconds','sourceId','language','durationSeconds','planDigest'];
const rangeKeys=['index','rangeId','startSeconds','endSeconds','logicalStartSeconds','logicalEndSeconds'];
const segmentKeys=['id','startMs','endMs','text','language','confidence','status','verified','sourceId','bindingDigest','asrChunk'];
const chunkKeys=['index','rangeId','logicalStartMs','logicalEndMs'];
const partialKeys=['provider','rangeId','chunkIndex','segments','binding','range','complete','needsReview','reused'];
function planForBinding(binding){
  if(!exact(binding,bindingKeys)||binding.chunkVersion!==ASR_CHUNK_VERSION||typeof binding.engine!=='string'||typeof binding.modelDigest!=='string'||!Number.isSafeInteger(binding.modelBytes)||binding.modelBytes<=0||!Number.isFinite(binding.chunkSeconds)||!Number.isFinite(binding.overlapSeconds)||typeof binding.sourceId!=='string'||typeof binding.language!=='string'||!Number.isFinite(binding.durationSeconds))throw resolverError('TRACK_INVALID','Local ASR checkpoint binding is invalid.');
  const plan=planAsrChunks(binding.durationSeconds,{chunkSeconds:binding.chunkSeconds,overlapSeconds:binding.overlapSeconds});if(binding.planDigest!==digest(plan))throw resolverError('TRACK_INVALID','Local ASR checkpoint plan binding is invalid.');return plan;
}
function exactRange(range,expected){return exact(range,rangeKeys)&&rangeKeys.every(key=>range[key]===expected[key]);}
function validSegment(row,range,binding){
  if(!exact(row,segmentKeys)||typeof row.id!=='string'||typeof row.text!=='string'||!row.text.trim()||row.text.length>2500||row.language!==binding.language||row.status!=='needs-review'||row.verified!==false||row.sourceId!==binding.sourceId||row.bindingDigest!==digest(binding)||!Number.isFinite(row.startMs)||!Number.isFinite(row.endMs)||row.endMs<=row.startMs||row.startMs<Math.round(range.startSeconds*1000)||row.endMs>Math.round(range.endSeconds*1000)||(row.confidence!==null&&(!Number.isFinite(row.confidence)||row.confidence<0||row.confidence>1))||!exact(row.asrChunk,chunkKeys)||row.asrChunk.index!==range.index||row.asrChunk.rangeId!==range.rangeId||row.asrChunk.logicalStartMs!==Math.round(range.logicalStartSeconds*1000)||row.asrChunk.logicalEndMs!==Math.round(range.logicalEndSeconds*1000))return false;
  const expected=`local-asr-segment:${digest({sourceId:row.sourceId,bindingDigest:row.bindingDigest,startMs:row.startMs,endMs:row.endMs,text:row.text,language:row.language})}`;return row.id===expected;
}
function checkpointState(row,range,binding){
  if(!plain(row)||!plain(row.binding)||row.binding.chunkVersion!==ASR_CHUNK_VERSION)return'incompatible';if(!same(row.binding,binding))return'incompatible';if(!exactRange(row.range,range)||!Number.isFinite(row.updatedAt)||row.updatedAt<0)throw resolverError('TRACK_INVALID','Current local ASR checkpoint range is invalid.');
  if(row.status==='complete'){if(!exact(row,['status','segments','binding','range','updatedAt'])||!Array.isArray(row.segments)||row.segments.length>10_000||row.segments.some(segment=>!validSegment(segment,range,binding)))throw resolverError('TRACK_INVALID','Current local ASR checkpoint segments are invalid.');return'complete';}
  if(row.status==='failed'){if(!exact(row,['status','error','binding','range','updatedAt'])||!exact(row.error,['code'])||!RESOLVER_ERROR_CODES.includes(row.error.code))throw resolverError('TRACK_INVALID','Current local ASR failed checkpoint is invalid.');return'failed';}
  throw resolverError('TRACK_INVALID','Current local ASR checkpoint status is invalid.');
}
function checkpointFromBatch(batch){
  const hasType=exact(batch,['type',...partialKeys]);if(!(hasType||exact(batch,partialKeys))||(hasType&&batch.type!=='partial')||batch.provider!=='local-asr'||batch.complete!==false||batch.needsReview!==true||typeof batch.reused!=='boolean'||typeof batch.rangeId!=='string'||!Number.isInteger(batch.chunkIndex)||!Array.isArray(batch.segments)||!plain(batch.binding)||!plain(batch.range))throw resolverError('TRACK_INVALID','Local ASR checkpoint batch is invalid.');
  const plan=planForBinding(batch.binding),range=plan.find(item=>item.rangeId===batch.rangeId);if(!range||range.index!==batch.chunkIndex||!exactRange(batch.range,range)||batch.segments.length>10_000||batch.segments.some(segment=>!validSegment(segment,range,batch.binding)))throw resolverError('TRACK_INVALID','Local ASR checkpoint range is invalid.');
  return{status:'complete',segments:structuredClone(batch.segments),binding:structuredClone(batch.binding),range:structuredClone(batch.range),updatedAt:Date.now()};
}
function failureCheckpoint(error){
  const failure=error?.asrFailure;if(!plain(failure)||!exact(failure,['rangeId','chunkIndex','range','binding'])||typeof failure.rangeId!=='string'||!Number.isInteger(failure.chunkIndex)||!plain(failure.binding)||!plain(failure.range))return null;
  const plan=planForBinding(failure.binding),range=plan.find(item=>item.rangeId===failure.rangeId);if(!range||range.index!==failure.chunkIndex||!exactRange(failure.range,range))throw resolverError('TRACK_INVALID','Local ASR failed range is invalid.');
  return{rangeId:failure.rangeId,checkpoint:{status:'failed',error:{code:typeof error.code==='string'?error.code:'PROCESS_FAILED'},binding:structuredClone(failure.binding),range:structuredClone(failure.range),updatedAt:Date.now()}};
}
const semanticCheckpoint=row=>row?{status:row.status,segments:row.segments??null,error:row.error??null,binding:row.binding,range:row.range}:null;
function completeSentences(checkpoints,binding){const plan=planForBinding(binding);return mergeAsrBatches(plan.flatMap(range=>checkpointState(checkpoints?.[range.rangeId],range,binding)==='complete'?[checkpoints[range.rangeId].segments]:[]));}
function coverageFor(checkpoints,binding){
  const plan=planForBinding(binding),states=new Map(plan.map(range=>[range.rangeId,checkpointState(checkpoints?.[range.rangeId],range,binding)])),completeRanges=plan.filter(range=>states.get(range.rangeId)==='complete'),gaps=plan.filter(range=>states.get(range.rangeId)!=='complete').map(range=>{const row=checkpoints?.[range.rangeId],status=states.get(range.rangeId)==='failed'?'failed':'missing';return{rangeId:range.rangeId,startMs:Math.round(range.logicalStartSeconds*1000),endMs:Math.round(range.logicalEndSeconds*1000),status,...(status==='failed'?{code:row.error.code}:{})};}),coveredMs=completeRanges.reduce((total,range)=>total+Math.round((range.logicalEndSeconds-range.logicalStartSeconds)*1000),0);
  return{coveredMs,startMs:completeRanges.length?Math.min(...completeRanges.map(range=>Math.round(range.logicalStartSeconds*1000))):null,endMs:completeRanges.length?Math.max(...completeRanges.map(range=>Math.round(range.logicalEndSeconds*1000))):null,complete:gaps.length===0,gaps};
}

export function createAsrFallbackResolver({repository,localClient,cloudClient,securityHeaders,leaseTtlMs=60_000,heartbeatMs=Math.max(1_000,Math.floor(leaseTtlMs/3))}={}){
  if(!repository)throw new Error('Canonical resolver repository is required.');
  const workers=new Map(),owner=`asr-fallback:${process.pid}`,ttl=Math.max(1_000,Number(leaseTtlMs)||60_000),heartbeatDelay=Math.max(10,Number(heartbeatMs)||Math.floor(ttl/3));let workerSequence=0;

  const stopWorker=slot=>{const worker=workers.get(slot);if(worker?.heartbeat)clearInterval(worker.heartbeat);workers.delete(slot);};
  const armHeartbeat=(slot,jobId,worker)=>{
    worker.heartbeat=setInterval(()=>void repository.renewLease(jobId,worker.owner,worker.fencingToken,ttl).then(lease=>{if(!lease)worker.controller.abort();}).catch(()=>worker.controller.abort()),heartbeatDelay);
    worker.heartbeat.unref?.();workers.set(slot,worker);
  };
  const failOwned=async(jobId,error,fence)=>{
    const latest=await repository.get(jobId).catch(()=>null);
    if(active(latest)&&latest.lease?.owner===fence.owner&&Number(latest.lease?.fencingToken)===Number(fence.fencingToken))await repository.transitionForWorker(jobId,'failed',{error:safeError(error)},fence);
  };

  const run=async jobId=>{
    const slot=`local:${jobId}`;if(workers.has(slot))return workers.get(slot).promise;
    let job=await repository.get(jobId);if(!job)throw resolverError('UNKNOWN','Resolver job not found.');
    if(job.status==='failed')await repository.transition(jobId,'queued',{error:null});
    const workerOwner=`${owner}:local:${++workerSequence}`,claim=await repository.claimForWorker(jobId,workerOwner,ttl);if(!claim.claimed)return claim.job;
    const controller=new AbortController(),fence={owner:workerOwner,fencingToken:claim.fencingToken},worker={controller,owner:workerOwner,fencingToken:claim.fencingToken,promise:null,heartbeat:null};
    const work=(async()=>{
      try{
        job=await repository.get(jobId);
        if(!job.request?.fallback?.enableLocalAsr)throw resolverError('CONSENT_REQUIRED','Local ASR was not explicitly enabled for this resolver request.');
        const sourcePolicy=job.request?.sourcePolicy||{};
        if(sourcePolicy.visibility!=='public'||sourcePolicy.requiresAuth!==false||sourcePolicy.cookiesUsed!==false||sourcePolicy.rights!=='eligible')throw resolverError('RIGHTS_INELIGIBLE','Local ASR is limited to public, no-auth, no-cookie, rights-eligible sources.');
        const health=await localClient.health();if(!health.available)throw resolverError(health.code||'LOCAL_COMPANION_UNAVAILABLE','Local companion or model is unavailable.');
        const result=await localClient.transcribe({url:job.request.source.canonicalUrl,language:job.request.language,checkpoints:job.asrCheckpoints||{}},{signal:controller.signal,onBatch:async batch=>{
          const checkpoint=checkpointFromBatch(batch),latest=await repository.get(jobId);if(batch.binding.sourceId!==latest.request?.source?.sourceId||batch.binding.language!==latest.request?.language)throw resolverError('TRACK_INVALID','Local ASR checkpoint source binding is invalid.');const existing=latest.asrCheckpoints?.[batch.rangeId];if(same(semanticCheckpoint(existing),semanticCheckpoint(checkpoint)))return;
          const checkpoints={...(latest.asrCheckpoints||{}),[batch.rangeId]:checkpoint},sentences=completeSentences(checkpoints,batch.binding),coverage=coverageFor(checkpoints,batch.binding);
          await repository.transitionForWorker(jobId,'partial',{provider:'local-asr',asrCheckpoints:checkpoints,sentences,coverage},fence);
        }});
        const latest=await repository.get(jobId);if(!plain(result?.checkpointBinding)||result.checkpointBinding.sourceId!==latest.request?.source?.sourceId||result.checkpointBinding.language!==latest.request?.language)throw resolverError('TRACK_INVALID','Local ASR completion binding is invalid.');const coverage=coverageFor(latest.asrCheckpoints||{},result.checkpointBinding);if(!coverage.complete)throw resolverError('TRACK_INVALID','Local ASR completion has unresolved ranges.');const sentences=completeSentences(latest.asrCheckpoints||{},result.checkpointBinding);if(!sentences.length)throw resolverError('TRACK_INVALID','Local ASR completion has no durable segments.');
        return(await repository.transitionForWorker(jobId,'complete',{provider:'local-asr',asrCheckpoints:latest.asrCheckpoints||{},sentences,metadata:{title:'Local ASR transcript',durationSeconds:result.durationSeconds,track:{kind:'local-asr',language:job.request.language}},coverage,provenance:{private:true,verified:false,needsReview:true,rawMediaRetained:false,checkpointBinding:result.checkpointBinding}},fence)).job;
      }catch(error){
        try{const failed=failureCheckpoint(error);if(failed){const latest=await repository.get(jobId);if(failed.checkpoint.binding.sourceId!==latest.request?.source?.sourceId||failed.checkpoint.binding.language!==latest.request?.language)throw resolverError('TRACK_INVALID','Local ASR failed checkpoint source binding is invalid.');if(active(latest)&&latest.lease?.owner===fence.owner&&Number(latest.lease?.fencingToken)===Number(fence.fencingToken)){const existing=latest.asrCheckpoints?.[failed.rangeId];if(!same(semanticCheckpoint(existing),semanticCheckpoint(failed.checkpoint))){const checkpoints={...(latest.asrCheckpoints||{}),[failed.rangeId]:failed.checkpoint},sentences=completeSentences(checkpoints,failed.checkpoint.binding),coverage=coverageFor(checkpoints,failed.checkpoint.binding);await repository.transitionForWorker(jobId,'partial',{provider:'local-asr',asrCheckpoints:checkpoints,sentences,coverage},fence);}}}}catch(checkpointError){error=checkpointError;}
        await failOwned(jobId,error,fence);throw error;
      }
      finally{stopWorker(slot);}
    })();
    worker.promise=work;armHeartbeat(slot,jobId,worker);return work;
  };

  const runCloud=async jobId=>{
    const slot=`cloud:${jobId}`;if(workers.has(slot))return workers.get(slot).promise;
    let job=await repository.get(jobId);if(!job)throw resolverError('UNKNOWN','Resolver job not found.');
    if(job.status==='failed')await repository.transition(jobId,'queued',{error:null});
    const workerOwner=`${owner}:cloud:${++workerSequence}`,claim=await repository.claimForWorker(jobId,workerOwner,ttl);if(!claim.claimed)return claim.job;
    const controller=new AbortController(),fence={owner:workerOwner,fencingToken:claim.fencingToken},worker={controller,owner:workerOwner,fencingToken:claim.fencingToken,promise:null,heartbeat:null};
    const work=(async()=>{
      try{
        job=await repository.get(jobId);const health=await cloudClient.health();if(!health.available)throw resolverError('CLOUD_UNAVAILABLE','Gemini is not configured on the server.');
        const attemptId=`cloud-attempt:${randomBytes(16).toString('hex')}`;
        await repository.transitionForWorker(jobId,'partial',{cloudAttempt:{id:attemptId,status:'started',startedAt:Date.now(),billableRequestCap:1}},fence);
        job=await repository.get(jobId);const result=await cloudClient.transcribe(job,{signal:controller.signal}),sentences=mergeAsrBatches([result.segments||[]]);
        return(await repository.transitionForWorker(jobId,'complete',{provider:'gemini-progressive',sentences,cloudAttempt:{id:attemptId,status:'complete',startedAt:job.cloudAttempt?.startedAt,completedAt:Date.now(),billableRequests:result.billableRequests},metadata:{title:'Gemini transcript',durationSeconds:result.durationSeconds,track:{kind:'gemini',language:job.request.language}},coverage:{coveredMs:Math.max(0,...sentences.map(row=>row.endMs)),startMs:sentences[0]?.startMs??null,endMs:sentences.at(-1)?.endMs??null,complete:true,gaps:[]},provenance:{private:true,verified:false,needsReview:true,shared:false,uploadedFileRetained:false,billableRequests:result.billableRequests}},fence)).job;
      }catch(error){await failOwned(jobId,error,fence);throw error;}
      finally{stopWorker(slot);}
    })();
    worker.promise=work;armHeartbeat(slot,jobId,worker);return work;
  };

  return{
    async start(jobId){void run(jobId).catch(()=>{});return repository.get(jobId);},
    async startCloud(jobId){void runCloud(jobId).catch(()=>{});return repository.get(jobId);},
    async cancel(jobId){workers.get(`local:${jobId}`)?.controller.abort();workers.get(`cloud:${jobId}`)?.controller.abort();return repository.cancel(jobId);},
    isActive(jobId){return workers.has(`local:${jobId}`)||workers.has(`cloud:${jobId}`);},
    async handle(req,res,path){
      if(path==='/api/transcript/cloud-consent'){
        if(req.method!=='POST'){json(res,405,{error:{code:'METHOD_NOT_ALLOWED'}},securityHeaders);return true;}
        try{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>50_000)throw resolverError('MEDIA_LIMIT','Consent request is too large.');chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'),record=await repository.recordCloudConsent(body.consent||{});json(res,200,{ok:true,subjectId:record.subjectId,receiptId:record.receiptId,decision:record.decision},securityHeaders);}
        catch(error){json(res,400,{error:safeError(error)},securityHeaders);}return true;
      }
      if(path==='/api/transcript/capabilities'){
        if(req.method!=='GET'){json(res,405,{error:{code:'METHOD_NOT_ALLOWED'}},securityHeaders);return true;}
        const [local,cloud]=await Promise.all([
          localClient?.health?.().catch(error=>({available:false,code:error?.code||'LOCAL_COMPANION_UNAVAILABLE'}))||{available:false,code:'LOCAL_COMPANION_UNAVAILABLE'},
          cloudClient?.health?.().catch(error=>({available:false,code:error?.code||'CLOUD_UNAVAILABLE'}))||{available:false,code:'CLOUD_UNAVAILABLE'}
        ]);
        json(res,200,{caption:{available:true},local:{available:local.available===true,modelInstalled:local.modelInstalled===true,code:local.code||null},cloud:{available:cloud.available===true,configured:cloud.configured===true,code:cloud.code||null}},securityHeaders);return true;
      }
      const match=path.match(/^\/api\/transcript\/jobs\/([^/]+)\/(local|cloud)-fallback$/);if(!match)return false;
      if(req.method!=='POST'){json(res,405,{error:{code:'METHOD_NOT_ALLOWED'}},securityHeaders);return true;}
      try{const jobId=decodeURIComponent(match[1]),job=match[2]==='cloud'?await this.startCloud(jobId):await this.start(jobId);json(res,202,{job},securityHeaders);}
      catch(error){json(res,400,{error:safeError(error)},securityHeaders);}return true;
    }
  };
}
