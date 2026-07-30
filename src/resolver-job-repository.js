import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Record,transactV10 } from './v10-persistence.js';
import { createResolverJob,transitionResolverJob } from './resolver-contracts.js';

const clone=value=>value==null?value:structuredClone(value);

export async function getOrCreateResolverJob(request,{now=Date.now()}={}){
  const draft=createResolverJob({request,updatedAt:now});
  const rows=await listV10Records(V10_STORES.resolverJobs,{index:'requestKey',query:draft.request.requestKey,sortBy:null});
  const existing=rows.find(row=>!['failed','cancelled'].includes(row.status));
  if(existing)return {job:existing,created:false};
  await putV10Record(V10_STORES.resolverJobs,draft,'resolver-job-created');
  return {job:draft,created:true};
}

export async function appendResolverEvent(jobId,type,{detail={},now=Date.now()}={}){
  return transactV10([V10_STORES.resolverJobs,V10_STORES.resolverEvents],async({stores,memory,requestResult})=>{
    const get=async(name,key)=>memory?clone(memory[name].get(key)):requestResult(stores[name].get(key));
    const put=(name,row)=>memory?memory[name].set(row.id,clone(row)):stores[name].put(clone(row));
    const job=await get(V10_STORES.resolverJobs,jobId);if(!job)throw new Error('Không tìm thấy resolver job.');
    const next=transitionResolverJob(job,type,{now,detail});
    const event={id:`resolver-event:${jobId}:${next.event.id}`,kind:'resolver-event',jobId,sequence:next.event.id,type:next.event.type,at:next.event.at,data:clone(next.event.data)};
    put(V10_STORES.resolverJobs,next.job);put(V10_STORES.resolverEvents,event);return {job:next.job,event};
  },'resolver-job-event');
}

export async function listResolverEvents(jobId,after=0){const rows=await listV10Records(V10_STORES.resolverEvents,{index:'jobId',query:jobId,sortBy:null});return rows.filter(row=>Number(row.sequence)>Number(after||0)).sort((a,b)=>a.sequence-b.sequence);}
export async function cancelResolverJob(jobId,{now=Date.now()}={}){const job=await getV10Record(V10_STORES.resolverJobs,jobId);if(!job)throw new Error('Không tìm thấy resolver job.');if(['complete','failed','cancelled'].includes(job.status))return job;return appendResolverEvent(jobId,'cancelled',{now,detail:{cancelRequested:true}}).then(result=>result.job);}
