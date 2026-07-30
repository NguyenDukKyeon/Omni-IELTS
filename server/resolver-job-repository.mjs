import { mkdir,readFile,rename,writeFile } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { createResolverJob,resolverError,transitionResolverJob } from '../src/resolver-contracts.js';

const clone=value=>value==null?value:structuredClone(value);
const active=job=>['resolving','partial'].includes(job?.status);
const terminal=job=>['complete','failed','cancelled'].includes(job?.status);

export class ResolverJobRepository {
  constructor({file=resolve(process.env.RESOLVER_DATA_DIR||'.data','resolver-jobs-v2.json'),now=()=>Date.now()}={}){this.file=file;this.now=now;this.loaded=false;this.rows=new Map();this.events=new Map();this.queue=Promise.resolve();}
  async load(){if(this.loaded)return;this.loaded=true;try{const parsed=JSON.parse(await readFile(this.file,'utf8'));for(const job of parsed.jobs||[])this.rows.set(job.id,job);for(const event of parsed.events||[])this.events.set(event.id,event);}catch(error){if(error.code!=='ENOENT')throw resolverError('RESTART_RECOVERY','Không thể đọc durable resolver jobs.',{cause:error});}if(this.reconcile({restart:true}).length)await this.persist();}
  async persist(){const payload={version:2,jobs:[...this.rows.values()],events:[...this.events.values()]};const temp=`${this.file}.${process.pid}.tmp`;await mkdir(dirname(this.file),{recursive:true});await writeFile(temp,JSON.stringify(payload),{mode:0o600});await rename(temp,this.file);}
  async serial(task){const run=this.queue.then(async()=>{await this.load();const result=await task();await this.persist();return result;});this.queue=run.catch(()=>{});return run;}
  failForRecovery(job,now=this.now()){
    const next=transitionResolverJob(job,'failed',{now,detail:{error:{code:'RESTART_RECOVERY',message:'Resolver worker không còn hoạt động; job sẽ được thử lại an toàn.',retryable:true}}});
    this.rows.set(job.id,next.job);this.events.set(`resolver-event:${job.id}:${next.event.id}`,next.event);return next.job;
  }
  reconcile({restart=false}={}){const now=this.now(),changed=[];for(const job of this.rows.values())if(active(job)&&(restart||Number(job.lease?.until||0)<=now))changed.push(this.failForRecovery(job,now));return changed;}
  async reconcileExpired(){return this.serial(async()=>this.reconcile({restart:false}).map(clone));}
  async recoverUnowned(jobId){return this.serial(async()=>{const job=this.rows.get(jobId);if(!active(job))return clone(job)||null;return clone(this.failForRecovery(job));});}
  async getOrCreate(request){return this.serial(async()=>{this.reconcile({restart:false});const draft=createResolverJob({request,updatedAt:this.now()});const existing=[...this.rows.values()].find(job=>job.request.requestKey===draft.request.requestKey&&!['failed','cancelled'].includes(job.status));if(existing)return{job:clone(existing),created:false};this.rows.set(draft.id,draft);const event={id:`resolver-event:${draft.id}:0`,jobId:draft.id,sequence:0,type:'queued',at:this.now(),data:{status:'queued'}};this.events.set(event.id,event);return{job:clone(draft),created:true};});}
  async findComplete(request){return this.serial(async()=>{this.reconcile({restart:false});const draft=createResolverJob({request,updatedAt:this.now()});return clone([...this.rows.values()].find(job=>job.request.requestKey===draft.request.requestKey&&job.status==='complete')||null);});}
  async retry(request){return this.serial(async()=>{const draft=createResolverJob({request,nonce:`retry:${this.now()}:${Math.random()}`,updatedAt:this.now()});this.rows.set(draft.id,draft);const event={id:`resolver-event:${draft.id}:0`,jobId:draft.id,sequence:0,type:'queued',at:this.now(),data:{status:'queued',retryOf:request.requestKey}};this.events.set(event.id,event);return{job:clone(draft),created:true,retry:true};});}
  async transition(jobId,next,detail={}){return this.serial(async()=>{const current=this.rows.get(jobId);if(!current)throw resolverError('UNKNOWN','Không tìm thấy resolver job.');if(terminal(current)&&current.status===next)return{job:clone(current),event:null};const result=transitionResolverJob(current,next,{now:this.now(),detail});this.rows.set(jobId,result.job);this.events.set(`resolver-event:${jobId}:${result.event.id}`,result.event);return clone(result);});}
  async renewLease(jobId,owner,ttlMs=60_000){return this.serial(async()=>{const current=this.rows.get(jobId);if(!active(current)||current.lease?.owner!==owner)return null;const lease={owner,until:this.now()+Math.max(1_000,Number(ttlMs)||60_000)};this.rows.set(jobId,{...current,lease,updatedAt:this.now()});return clone(this.rows.get(jobId));});}
  async get(jobId){return this.serial(async()=>{this.reconcile({restart:false});return clone(this.rows.get(jobId)||null);});}
  async eventsAfter(jobId,after=0){return this.serial(async()=>{this.reconcile({restart:false});return[...this.events.values()].filter(event=>event.jobId===jobId&&Number(event.sequence??event.id)>Number(after||0)).sort((a,b)=>Number(a.sequence??a.id)-Number(b.sequence??b.id)).map(event=>clone({...event,sequence:Number(event.sequence??event.id)}));});}
  async cancel(jobId){return this.serial(async()=>{this.reconcile({restart:false});const job=this.rows.get(jobId);if(!job)throw resolverError('UNKNOWN','Không tìm thấy resolver job.');if(terminal(job))return clone(job);const result=transitionResolverJob(job,'cancelled',{now:this.now(),detail:{cancelRequested:true}});this.rows.set(jobId,result.job);this.events.set(`resolver-event:${jobId}:${result.event.id}`,result.event);return clone(result.job);});}
}
