import { learningContractDigest } from './learning-contracts.js';
import { normalizeKey,V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,transactV10 } from './v10-persistence.js';

export const TRANSCRIPT_AGGREGATE_VERSION=1;

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=2000)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
let aggregateWriteQueue=Promise.resolve();

function typedError(code,message,detail={}){
  return Object.assign(new Error(message),{code,durable:true,...detail});
}

function canonicalSegments(input=[]){
  const rows=(Array.isArray(input)?input:[]).map(row=>({
    startMs:Math.max(0,Number(row.startMs??row.start??0)),
    endMs:Math.max(0,Number(row.endMs??row.end??0)),
    text:clean(row.text??row.transcript,10_000),
    language:clean(row.language,40)||'en',
    status:clean(row.status,60)||'unverified',
    confidence:Number.isFinite(Number(row.confidence))?Number(row.confidence):null,
    speaker:clean(row.speaker,120)||null
  })).filter(row=>row.text&&row.endMs>row.startMs)
    .sort((left,right)=>left.startMs-right.startMs||left.endMs-right.endMs||left.text.localeCompare(right.text));
  if(!rows.length)throw typedError('TRANSCRIPT_REVISION_EMPTY','Transcript revision phải có ít nhất một segment.');
  for(let index=1;index<rows.length;index+=1){
    const previous=rows[index-1],current=rows[index];
    if(current.startMs<previous.endMs)throw typedError('TRANSCRIPT_TIMELINE_OVERLAP','Canonical transcript không chấp nhận segment chồng thời gian.',{index});
    if(current.startMs===previous.startMs&&normalizeKey(current.text)===normalizeKey(previous.text))throw typedError('TRANSCRIPT_SEGMENT_DUPLICATE','Canonical transcript có segment trùng.',{index});
  }
  return rows;
}

export function createTranscriptAggregate({source={},segments=[],parentRevisionId=null,provenance={},createdAt=Date.now()}={}){
  const namespace=['private','shared'].includes(source.namespace)?source.namespace:'private';
  const externalId=clean(source.externalId??source.videoId??source.id,500);
  const sourceId=clean(source.id,240)||`transcript-source:${learningContractDigest({namespace,externalId,url:clean(source.url,1200)})}`;
  const normalized=canonicalSegments(segments);
  const contentDigest=learningContractDigest(normalized.map(row=>({
    startMs:row.startMs,endMs:row.endMs,text:row.text,language:row.language,status:row.status,speaker:row.speaker
  })));
  const revisionId=`transcript-revision:${sourceId}:${contentDigest}`;
  const segmentRows=normalized.map(row=>{
    const lineageId=`transcript-lineage:${sourceId}:${learningContractDigest({startMs:row.startMs,endMs:row.endMs})}`;
    return{
      ...row,
      id:`transcript-segment:${revisionId}:${learningContractDigest({lineageId,text:row.text,language:row.language})}`,
      kind:'canonical-transcript-segment',
      schemaVersion:TRANSCRIPT_AGGREGATE_VERSION,
      sourceId,
      revisionId,
      lineageId,
      provenance:clone(provenance)
    };
  });
  const startMs=segmentRows[0].startMs;
  const endMs=Math.max(...segmentRows.map(row=>row.endMs));
  const coveredMs=segmentRows.reduce((sum,row)=>sum+(row.endMs-row.startMs),0);
  const revision={
    id:revisionId,
    kind:'transcript-revision',
    schemaVersion:TRANSCRIPT_AGGREGATE_VERSION,
    sourceId,
    parentRevisionId:clean(parentRevisionId,500)||null,
    contentDigest,
    segmentIds:segmentRows.map(row=>row.id),
    coverage:{startMs,endMs,coveredMs,ratio:endMs>startMs?Math.min(1,coveredMs/(endMs-startMs)):1,complete:source.complete===true},
    status:['unverified','verified','edited'].includes(source.status)?source.status:'unverified',
    provenance:clone(provenance),
    createdAt:Number(createdAt)
  };
  const sourceRecord={
    id:sourceId,
    kind:'transcript-source',
    schemaVersion:TRANSCRIPT_AGGREGATE_VERSION,
    namespace,
    externalId:externalId||null,
    sourceType:clean(source.sourceType,80)||'media',
    title:clean(source.title,500)||null,
    url:clean(source.url,1200)||null,
    language:clean(source.language,40)||segmentRows[0].language,
    latestRevisionId:revisionId,
    activeRevisionId:revisionId,
    createdAt:Number(source.createdAt||createdAt),
    updatedAt:Number(createdAt)
  };
  return Object.freeze({source:Object.freeze(sourceRecord),revision:Object.freeze(revision),segments:Object.freeze(segmentRows.map(Object.freeze))});
}

function queueAggregateWrite(task){
  const pending=aggregateWriteQueue.then(task,task);
  aggregateWriteQueue=pending.catch(()=>{});
  return pending;
}

async function persistAggregate(aggregate,{activate=false,reason='canonical-transcript-persisted'}={}){
  const names=[V10_STORES.transcriptSources,V10_STORES.transcriptRevisions,V10_STORES.canonicalTranscriptSegments];
  return queueAggregateWrite(()=>transactV10(names,async({stores,memory,requestResult})=>{
    const get=async(name,key)=>memory?clone(memory[name].get(key)):requestResult(stores[name].get(key));
    const put=(name,row)=>memory?memory[name].set(row.id,clone(row)):stores[name].put(clone(row));
    const existingRevision=await get(V10_STORES.transcriptRevisions,aggregate.revision.id);
    if(existingRevision&&existingRevision.contentDigest!==aggregate.revision.contentDigest)throw typedError('TRANSCRIPT_REVISION_COLLISION','Transcript revision ID collision.',{revisionId:aggregate.revision.id});
    const existingSource=await get(V10_STORES.transcriptSources,aggregate.source.id);
    if(existingSource&&existingSource.namespace!==aggregate.source.namespace)throw typedError('TRANSCRIPT_NAMESPACE_COLLISION','Transcript source không thể đổi private/shared namespace.',{sourceId:aggregate.source.id});
    const activeRevisionId=activate?aggregate.revision.id:(existingSource?.activeRevisionId||existingSource?.latestRevisionId||aggregate.revision.id);
    put(V10_STORES.transcriptSources,{...(existingSource||{}),...clone(aggregate.source),status:existingSource?.status==='edited'&&!activate?'edited':aggregate.source.status,latestRevisionId:activeRevisionId,activeRevisionId,createdAt:existingSource?.createdAt||aggregate.source.createdAt});
    if(!existingRevision)put(V10_STORES.transcriptRevisions,aggregate.revision);
    for(const segment of aggregate.segments){
      const existing=await get(V10_STORES.canonicalTranscriptSegments,segment.id);
      if(existing&&learningContractDigest(existing)!==learningContractDigest(segment))throw typedError('TRANSCRIPT_SEGMENT_COLLISION','Transcript segment ID collision.',{segmentId:segment.id});
      if(!existing)put(V10_STORES.canonicalTranscriptSegments,segment);
    }
    return aggregate;
  },reason));
}

export async function persistTranscriptAggregate(input,{activate=false}={}){
  return persistAggregate(createTranscriptAggregate(input),{activate,reason:'canonical-transcript-persisted'});
}

export async function createProviderTranscriptRevision(input){
  return persistTranscriptAggregate(input,{activate:false});
}

export async function getTranscriptAggregate(revisionId){
  const revision=await getV10Record(V10_STORES.transcriptRevisions,revisionId);
  if(!revision)return null;
  const source=await getV10Record(V10_STORES.transcriptSources,revision.sourceId);
  const segments=await listV10Records(V10_STORES.canonicalTranscriptSegments,{index:'revisionId',query:revisionId,sortBy:null});
  segments.sort((left,right)=>left.startMs-right.startMs||left.id.localeCompare(right.id));
  return{source,revision,segments};
}

async function legacyReviseTranscript(revisionId,segments,{provenance={},createdAt=Date.now()}={}){
  const previous=await getTranscriptAggregate(revisionId);
  if(!previous)throw typedError('TRANSCRIPT_REVISION_NOT_FOUND','Không tìm thấy transcript revision để sửa.',{revisionId});
  return persistTranscriptAggregate({
    source:{...previous.source,status:'edited'},
    segments,
    parentRevisionId:previous.revision.id,
    provenance:{...clone(provenance),kind:'user-edit'},
    createdAt
  });
}

export async function createChildAndActivate(expectedActiveRevisionId,segments,{provenance={},createdAt=Date.now()}={}){
  const previous=await getTranscriptAggregate(expectedActiveRevisionId);
  if(!previous)throw typedError('TRANSCRIPT_REVISION_NOT_FOUND','Transcript revision không tồn tại.',{revisionId:expectedActiveRevisionId});
  const aggregate=createTranscriptAggregate({source:{...previous.source,status:'edited'},segments,parentRevisionId:previous.revision.id,provenance:{...clone(provenance),kind:'user-edit'},createdAt});
  const names=[V10_STORES.transcriptSources,V10_STORES.transcriptRevisions,V10_STORES.canonicalTranscriptSegments];
  return queueAggregateWrite(()=>transactV10(names,async({stores,memory,requestResult})=>{
    const get=async(name,key)=>memory?clone(memory[name].get(key)):requestResult(stores[name].get(key));
    const put=(name,row)=>memory?memory[name].set(row.id,clone(row)):stores[name].put(clone(row));
    const source=await get(V10_STORES.transcriptSources,previous.source.id);
    const activeRevisionId=source?.activeRevisionId||source?.latestRevisionId||null;
    if(!source||activeRevisionId!==expectedActiveRevisionId)throw typedError('TRANSCRIPT_EDIT_CONFLICT','Transcript active revision đã thay đổi.',{expectedActiveRevisionId,actualActiveRevisionId:activeRevisionId});
    if(!(await get(V10_STORES.transcriptRevisions,expectedActiveRevisionId)))throw typedError('TRANSCRIPT_REVISION_NOT_FOUND','Transcript revision không tồn tại.',{revisionId:expectedActiveRevisionId});
    const existingRevision=await get(V10_STORES.transcriptRevisions,aggregate.revision.id);
    if(existingRevision&&existingRevision.contentDigest!==aggregate.revision.contentDigest)throw typedError('TRANSCRIPT_REVISION_COLLISION','Transcript revision ID collision.',{revisionId:aggregate.revision.id});
    if(!existingRevision)put(V10_STORES.transcriptRevisions,aggregate.revision);
    for(const segment of aggregate.segments){const existing=await get(V10_STORES.canonicalTranscriptSegments,segment.id);if(existing&&learningContractDigest(existing)!==learningContractDigest(segment))throw typedError('TRANSCRIPT_SEGMENT_COLLISION','Transcript segment ID collision.',{segmentId:segment.id});if(!existing)put(V10_STORES.canonicalTranscriptSegments,segment);}
    put(V10_STORES.transcriptSources,{...source,...clone(aggregate.source),status:'edited',latestRevisionId:aggregate.revision.id,activeRevisionId:aggregate.revision.id,createdAt:source.createdAt});
    return aggregate;
  },'canonical-transcript-child-activated'));
}

export async function reviseTranscript(revisionId,segments,options={}){return createChildAndActivate(revisionId,segments,options);}

export async function activateTranscriptRevision(revisionId,{expectedActiveRevisionId=null}={}){
  const previous=await getTranscriptAggregate(revisionId);
  if(!previous)throw typedError('TRANSCRIPT_REVISION_NOT_FOUND','Transcript revision không tồn tại.',{revisionId});
  return queueAggregateWrite(()=>transactV10([V10_STORES.transcriptSources],async({stores,memory,requestResult})=>{
    const source=memory?clone(memory[V10_STORES.transcriptSources].get(previous.source.id)):await requestResult(stores[V10_STORES.transcriptSources].get(previous.source.id));
    const activeRevisionId=source?.activeRevisionId||source?.latestRevisionId||null;
    if(!source||(expectedActiveRevisionId&&activeRevisionId!==expectedActiveRevisionId))throw typedError('TRANSCRIPT_ACTIVATION_CONFLICT','Transcript active revision đã thay đổi.',{expectedActiveRevisionId,actualActiveRevisionId:activeRevisionId});
    const value={...source,latestRevisionId:revisionId,activeRevisionId:revisionId,updatedAt:Date.now()};
    if(memory)memory[V10_STORES.transcriptSources].set(value.id,clone(value));else stores[V10_STORES.transcriptSources].put(clone(value));
    return previous;
  },'canonical-transcript-activated'));
}

export function adaptLegacyTranscript(input={}){
  const source=input.source||{};
  return createTranscriptAggregate({
    source:{
      id:source.canonicalSourceId,
      namespace:source.namespace||'private',
      externalId:source.id??input.mediaSourceId??input.videoId??input.cacheKey,
      sourceType:source.sourceType||input.provider||'legacy',
      title:source.title||input.title,
      url:source.url||input.url,
      language:source.language||input.language,
      status:'unverified',
      complete:input.complete===true
    },
    segments:input.segments||[],
    provenance:{kind:'legacy-import',provider:input.provider||null,legacyId:input.id||null},
    createdAt:Number(input.updatedAt||input.createdAt||Date.now())
  });
}

export const __testing=Object.freeze({canonicalSegments,typedError});
