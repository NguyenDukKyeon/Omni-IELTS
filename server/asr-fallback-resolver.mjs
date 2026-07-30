import { mergeAsrBatches } from './local-asr-provider.mjs';
import { resolverError } from '../src/resolver-contracts.js';

const json=(res,status,data,headers)=>{res.writeHead(status,{...headers('application/json; charset=utf-8'),'cache-control':'no-store'});res.end(JSON.stringify(data));};
const safeError=error=>({code:error?.code||'UNKNOWN',message:String(error?.message||'ASR fallback failed.').slice(0,500),retryable:error?.retryable===true});

export function createAsrFallbackResolver({repository,localClient,securityHeaders}={}){
  if(!repository)throw new Error('Canonical resolver repository is required.');
  const workers=new Map(),owner=`asr-fallback:${process.pid}`;
  const run=async jobId=>{
    if(workers.has(jobId))return workers.get(jobId).promise;
    let job=await repository.get(jobId);if(!job)throw resolverError('UNKNOWN','Resolver job not found.');
    if(job.status==='failed')await repository.transition(jobId,'queued',{error:null});
    const claim=await repository.claimForWorker(jobId,`${owner}:${Date.now()}`);if(!claim.claimed)return claim.job;
    const controller=new AbortController(),work=(async()=>{
      try{
        job=await repository.get(jobId);
        if(!job.request?.fallback?.enableLocalAsr)throw resolverError('CONSENT_REQUIRED','Local ASR was not explicitly enabled for this resolver request.');
        const health=await localClient.health();if(!health.available)throw resolverError(health.code||'LOCAL_COMPANION_UNAVAILABLE','Local companion or model is unavailable.');
        const result=await localClient.transcribe({url:job.request.source.canonicalUrl,language:job.request.language,checkpoints:job.asrCheckpoints||{}},{signal:controller.signal,onBatch:async batch=>{
          const latest=await repository.get(jobId),checkpoints={...(latest.asrCheckpoints||{}),[batch.rangeId]:{status:'complete',segments:batch.segments,updatedAt:Date.now()}},sentences=mergeAsrBatches([latest.sentences||[],batch.segments||[]]);
          await repository.transition(jobId,'partial',{provider:'local-asr',asrCheckpoints:checkpoints,sentences,coverage:{coveredMs:Math.max(0,...sentences.map(row=>row.endMs)),startMs:sentences[0]?.startMs??null,endMs:sentences.at(-1)?.endMs??null,complete:false,gaps:[]}});
        }});
        const latest=await repository.get(jobId),sentences=mergeAsrBatches([latest.sentences||[],result.segments||[]]);
        return (await repository.transition(jobId,'complete',{provider:'local-asr',sentences,metadata:{title:'Local ASR transcript',durationSeconds:result.durationSeconds,track:{kind:'local-asr',language:job.request.language}},coverage:{coveredMs:Math.max(0,...sentences.map(row=>row.endMs)),startMs:sentences[0]?.startMs??null,endMs:sentences.at(-1)?.endMs??null,complete:true,gaps:[]},provenance:{private:true,verified:false,needsReview:true,rawMediaRetained:false}})).job;
      }catch(error){const latest=await repository.get(jobId);if(latest&&!['cancelled','complete','failed'].includes(latest.status))await repository.transition(jobId,'failed',{error:safeError(error)});throw error;}
      finally{workers.delete(jobId);}
    })();workers.set(jobId,{controller,promise:work});return work;
  };
  return{
    async start(jobId){void run(jobId).catch(()=>{});return repository.get(jobId);},
    async cancel(jobId){workers.get(jobId)?.controller.abort();return repository.cancel(jobId);},
    isActive(jobId){return workers.has(jobId);},
    async handle(req,res,path){
      const match=path.match(/^\/api\/transcript\/jobs\/([^/]+)\/local-fallback$/);if(!match)return false;
      if(req.method!=='POST'){json(res,405,{error:{code:'METHOD_NOT_ALLOWED'}},securityHeaders);return true;}
      try{const jobId=decodeURIComponent(match[1]),job=await this.start(jobId);json(res,202,{job},securityHeaders);}
      catch(error){json(res,400,{error:safeError(error)},securityHeaders);}return true;
    }
  };
}
