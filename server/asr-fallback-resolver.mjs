import { randomBytes } from 'node:crypto';
import { mergeAsrBatches } from './local-asr-provider.mjs';
import { resolverError } from '../src/resolver-contracts.js';

const json=(res,status,data,headers)=>{res.writeHead(status,{...headers('application/json; charset=utf-8'),'cache-control':'no-store'});res.end(JSON.stringify(data));};
const safeError=error=>({code:error?.code||'UNKNOWN',message:String(error?.message||'ASR fallback failed.').slice(0,500),retryable:error?.retryable===true});
const active=job=>['resolving','partial'].includes(job?.status);

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
          const latest=await repository.get(jobId),checkpoints={...(latest.asrCheckpoints||{}),[batch.rangeId]:{status:'complete',segments:batch.segments,binding:batch.binding,range:batch.range,updatedAt:Date.now()}},sentences=mergeAsrBatches([latest.sentences||[],batch.segments||[]]);
          await repository.transitionForWorker(jobId,'partial',{provider:'local-asr',asrCheckpoints:checkpoints,sentences,coverage:{coveredMs:Math.max(0,...sentences.map(row=>row.endMs)),startMs:sentences[0]?.startMs??null,endMs:sentences.at(-1)?.endMs??null,complete:false,gaps:[]}},fence);
        }});
        const latest=await repository.get(jobId),sentences=mergeAsrBatches([latest.sentences||[],result.segments||[]]);
        return(await repository.transitionForWorker(jobId,'complete',{provider:'local-asr',sentences,metadata:{title:'Local ASR transcript',durationSeconds:result.durationSeconds,track:{kind:'local-asr',language:job.request.language}},coverage:{coveredMs:Math.max(0,...sentences.map(row=>row.endMs)),startMs:sentences[0]?.startMs??null,endMs:sentences.at(-1)?.endMs??null,complete:true,gaps:[]},provenance:{private:true,verified:false,needsReview:true,rawMediaRetained:false,checkpointBinding:result.checkpointBinding}},fence)).job;
      }catch(error){await failOwned(jobId,error,fence);throw error;}
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
