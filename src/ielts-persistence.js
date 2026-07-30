import {
  IELTS_SCHEMA_VERSION,
  IELTS_STORE_NAMES,
  createErrorRecord,
  mergeErrorRecords,
  sanitizeLexicalSet,
  sanitizeLexicalRelation,
  sanitizeLabItem,
  sanitizeReadingPassage,
  sanitizeMediaSource,
  sanitizeTranscriptSegment,
  sanitizeMediaAttempt,
  validateLexicalSet,
  validateLabItem,
  validateReadingPassage,
  validateTranscriptSegments
} from './ielts-domain.js';
import { durableStorageUnavailable } from './storage-safety.js';
import { assertActiveRestoreToken,withDurableWriteLock } from './storage-lock.js';
import { MIGRATION_LEDGER_PREFIX,defineMigration,openForwardCompatibleDatabase } from './migration-ledger.js';

export const IELTS_DB_NAME='vocab-master-ielts';
export const IELTS_DB_VERSION=1;
export const IELTS_BACKUP_VERSION=1;

const STORE_LIST=Object.freeze(Object.values(IELTS_STORE_NAMES));
const MAX_RECORDS_PER_STORE=100_000;
let databasePromise=null;
let writeQueue=Promise.resolve();
let channel=null;
const memory=new Map(STORE_LIST.map(name=>[name,new Map()]));
const IELTS_MIGRATIONS=Object.freeze([
  defineMigration({
    id:'p1-00-ielts-opener-v1',
    digest:'ielts-v1-stores-and-indexes:2026-07-30',
    targetVersion:IELTS_DB_VERSION,
    description:'Adopt the Phase 0 IELTS v1 layout under the forward-compatible opener and durable migration ledger.'
  })
]);

function clone(value){return value==null?value:structuredClone(value);}
function nowRevision(){return Date.now()*1000+Math.floor(Math.random()*1000);}
function indexedDbUnavailable(){return typeof indexedDB==='undefined';}
function requestResult(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));});}
function transactionDone(transaction){return new Promise((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));});}
function enqueueWrite(task,{restoreToken=null}={}){if(restoreToken)return withDurableWriteLock(task,restoreToken);const locked=()=>withDurableWriteLock(task);const run=writeQueue.then(locked,locked);writeQueue=run.catch(()=>{});return run;}
function emit(status,detail={}){globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-persistence',{detail:{status,...detail}}));}
function assertStore(name){if(!STORE_LIST.includes(name))throw new Error(`IELTS store không hợp lệ: ${name}`);return name;}

function createIndexes(storeName,store){
  if(storeName===IELTS_STORE_NAMES.errors){store.createIndex('normalizedKey','normalizedKey',{unique:true});store.createIndex('status','status',{unique:false});store.createIndex('lastSeenAt','lastSeenAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.lexicalSets){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.lexicalRelations||storeName===IELTS_STORE_NAMES.labItems){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.readingPassages){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.readingAttempts){store.createIndex('passageId','passageId',{unique:false});store.createIndex('completedAt','completedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaSources){store.createIndex('videoId','videoId',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.transcriptionJobs){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('status','status',{unique:false});store.createIndex('cacheKey','cacheKey',{unique:true});}
  if(storeName===IELTS_STORE_NAMES.transcriptSegments){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('order','order',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaAttempts){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('segmentId','segmentId',{unique:false});store.createIndex('completedAt','completedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaProgress){store.createIndex('mediaSourceId','mediaSourceId',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.settings){store.createIndex('updatedAt','updatedAt',{unique:false});}
}

export function openIeltsDatabase(){
  if(databasePromise)return databasePromise;
  if(indexedDbUnavailable())return Promise.reject(durableStorageUnavailable(IELTS_DB_NAME));
  databasePromise=openForwardCompatibleDatabase({
    name:IELTS_DB_NAME,
    version:IELTS_DB_VERSION,
    requiredStores:STORE_LIST,
    ledgerStore:IELTS_STORE_NAMES.settings,
    migrations:IELTS_MIGRATIONS,
    onVersionChange:()=>{databasePromise=null;},
    upgrade:({database})=>{
      for(const storeName of STORE_LIST){
        if(database.objectStoreNames.contains(storeName))continue;
        const store=database.createObjectStore(storeName,{keyPath:storeName===IELTS_STORE_NAMES.settings?'key':'id'});
        createIndexes(storeName,store);
      }
    }
  }).catch(error=>{databasePromise=null;throw error;});
  return databasePromise;
}

async function withStore(storeName,mode,callback){
  assertStore(storeName);
  const database=await openIeltsDatabase();
  if(!database){const map=memory.get(storeName);return callback(null,map);}
  const transaction=database.transaction(storeName,mode);const store=transaction.objectStore(storeName);const result=await callback(store,null,transaction);await transactionDone(transaction);return result;
}

async function getAll(storeName){return withStore(storeName,'readonly',async(store,map)=>map?[...map.values()].map(clone):requestResult(store.getAll()));}
async function getOne(storeName,key){return withStore(storeName,'readonly',async(store,map)=>map?clone(map.get(key)):requestResult(store.get(key)));}
async function putOne(storeName,value){return enqueueWrite(()=>withStore(storeName,'readwrite',async(store,map)=>{const copy=clone(value);if(map)map.set(copy.key??copy.id,copy);else store.put(copy);return copy;}));}
async function deleteOne(storeName,key){return enqueueWrite(()=>withStore(storeName,'readwrite',async(store,map)=>{if(map)map.delete(key);else store.delete(key);}));}

function initializeChannel(){
  if(channel||typeof BroadcastChannel==='undefined')return;
  channel=new BroadcastChannel('vocab-master-ielts-data-v1');channel.unref?.();
  channel.addEventListener('message',event=>{if(event.data?.type==='changed')globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-external-change',{detail:event.data}));});
}
function broadcast(reason,stores=[]){const revision=nowRevision();channel?.postMessage({type:'changed',reason,stores,revision});globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-data-saved',{detail:{reason,stores,revision}}));return revision;}

export async function initializeIeltsPersistence(){
  initializeChannel();await openIeltsDatabase();const recoveredJobs=await recoverInterruptedTranscriptionJobs();const counts={};for(const store of STORE_LIST)counts[store]=(await getAll(store)).length;return{database:IELTS_DB_NAME,version:IELTS_DB_VERSION,counts,recoveredJobs};
}

export async function listIeltsRecords(storeName,{limit=0,sortBy='updatedAt',descending=true}={}){
  const rows=await getAll(assertStore(storeName));rows.sort((a,b)=>{const av=Number(a?.[sortBy]||0),bv=Number(b?.[sortBy]||0);return descending?bv-av:av-bv;});return limit>0?rows.slice(0,limit):rows;
}

export async function getIeltsRecord(storeName,id){return getOne(assertStore(storeName),id);}

export async function saveIeltsRecord(storeName,value,reason='ielts-record-saved'){
  assertStore(storeName);const row={...clone(value),updatedAt:Number(value?.updatedAt||Date.now())};if(storeName===IELTS_STORE_NAMES.settings){if(!row.key)throw new Error('IELTS setting cần key.');}else if(!row.id)throw new Error(`${storeName} cần id.`);
  emit('saving',{storeName});const saved=await putOne(storeName,row);broadcast(reason,[storeName]);emit('saved',{storeName});return saved;
}

export async function deleteIeltsRecord(storeName,id,reason='ielts-record-deleted'){
  await deleteOne(assertStore(storeName),id);broadcast(reason,[storeName]);return true;
}

export async function upsertErrorRecord(input,reason='ielts-error-upserted'){
  const incoming=createErrorRecord(input);emit('saving',{storeName:IELTS_STORE_NAMES.errors});
  const saved=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.errors);const existing=[...map.values()].find(row=>row.normalizedKey===incoming.normalizedKey);const value=existing?mergeErrorRecords(existing,incoming):incoming;if(existing)map.delete(existing.id);map.set(value.id,value);return value;}
    const transaction=database.transaction(IELTS_STORE_NAMES.errors,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.errors);const existing=await requestResult(store.index('normalizedKey').get(incoming.normalizedKey));const value=existing?mergeErrorRecords(existing,incoming):incoming;store.put(value);await transactionDone(transaction);return value;
  });
  const { recordErrorOccurrence }=await import('./error-repository.js');
  await recordErrorOccurrence({...saved,occurrenceId:`ielts:${incoming.id}`,weight:incoming.occurrenceCount,provenance:{...saved.provenance,legacyId:saved.id,source:'ielts'}});
  broadcast(reason,[IELTS_STORE_NAMES.errors]);emit('saved',{storeName:IELTS_STORE_NAMES.errors});return saved;
}

export async function setErrorStatus(id,status,evidenceAttempt=null){
  const current=await getOne(IELTS_STORE_NAMES.errors,id);if(!current)throw new Error('Không tìm thấy lỗi.');
  const evidenceAttempts=evidenceAttempt?[...(current.evidenceAttempts||[]),structuredClone(evidenceAttempt)].slice(-30):(current.evidenceAttempts||[]);
  const value=createErrorRecord({...current,status,evidenceAttempts,lastResolvedAt:status==='resolved'?Date.now():current.lastResolvedAt,resolutionAttempts:Number(current.resolutionAttempts||0)+(status==='practicing'?1:0),now:current.firstSeenAt});
  await putOne(IELTS_STORE_NAMES.errors,value);
  if(evidenceAttempt){
    const { normalizeErrorOccurrence,recordCorrectionEvidence }=await import('./error-repository.js');
    const normalized=normalizeErrorOccurrence({...value,provenance:{...value.provenance,legacyId:value.id,source:'ielts'}});
    await recordCorrectionEvidence(normalized.errorRecordId,evidenceAttempt);
  }
  broadcast('ielts-error-status',[IELTS_STORE_NAMES.errors]);return value;
}

export async function saveLexicalSet(input){const result=validateLexicalSet(input);if(!result.valid&&result.value.status==='active')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.lexicalSets,result.value,'ielts-lexical-set-saved');}
export async function saveLexicalRelation(input){return saveIeltsRecord(IELTS_STORE_NAMES.lexicalRelations,sanitizeLexicalRelation(input),'ielts-relation-saved');}
export async function saveLabItem(input){const result=validateLabItem(input);if(!result.valid&&result.value.status==='verified')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.labItems,result.value,'ielts-lab-item-saved');}
export async function saveReadingPassage(input){const result=validateReadingPassage(input);if(!result.valid&&result.value.status==='verified')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.readingPassages,result.value,'ielts-reading-saved');}

export async function saveReadingAttempt(input){
  const value={id:String(input.id||globalThis.crypto?.randomUUID?.()||`reading-attempt-${Date.now()}`),passageId:String(input.passageId||''),answers:Array.isArray(input.answers)?clone(input.answers):[],score:Math.max(0,Number(input.score||0)),completedAt:Number(input.completedAt||Date.now()),evidence:Array.isArray(input.evidence)?clone(input.evidence):[],updatedAt:Date.now()};
  if(!value.passageId)throw new Error('Reading attempt thiếu passageId.');return saveIeltsRecord(IELTS_STORE_NAMES.readingAttempts,value,'ielts-reading-attempt');
}

export async function saveMediaSource(input){const value=sanitizeMediaSource(input);if(!value.videoId)throw new Error('Media source thiếu YouTube video ID.');return saveIeltsRecord(IELTS_STORE_NAMES.mediaSources,value,'ielts-media-source');}

export async function findMediaByVideoId(videoId){
  const value=String(videoId||'');const database=await openIeltsDatabase();if(!database)return[...memory.get(IELTS_STORE_NAMES.mediaSources).values()].find(row=>row.videoId===value)||null;
  const transaction=database.transaction(IELTS_STORE_NAMES.mediaSources,'readonly');const result=await requestResult(transaction.objectStore(IELTS_STORE_NAMES.mediaSources).index('videoId').get(value));await transactionDone(transaction);return result||null;
}

function normalizeTranscriptionJob(input={},existing=null){
  const now=Date.now();return{
    ...(existing?clone(existing):{}),
    id:String(existing?.id||input.id||globalThis.crypto?.randomUUID?.()||`transcription-${now}`),
    mediaSourceId:String(input.mediaSourceId??existing?.mediaSourceId??''),
    cacheKey:String(input.cacheKey??existing?.cacheKey??''),
    model:String(input.model??existing?.model??''),
    language:String(input.language??existing?.language??'en'),
    status:['queued','processing','needs-review','ready','failed','cancelled'].includes(input.status)?input.status:(existing?.status||'queued'),
    retryCount:Math.max(0,Number(input.retryCount??existing?.retryCount??0)),
    error:String(input.error??existing?.error??''),
    createdAt:Number(existing?.createdAt||input.createdAt||now),
    updatedAt:now
  };
}

export async function saveTranscriptionJob(input){
  const candidate=normalizeTranscriptionJob(input);if(!candidate.mediaSourceId||!candidate.cacheKey)throw new Error('Transcription job thiếu mediaSourceId hoặc cacheKey.');
  emit('saving',{storeName:IELTS_STORE_NAMES.transcriptionJobs});
  const saved=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptionJobs);const existing=[...map.values()].find(row=>row.cacheKey===candidate.cacheKey)||null;const value=normalizeTranscriptionJob(input,existing);if(existing&&existing.id!==value.id)map.delete(existing.id);map.set(value.id,value);return value;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptionJobs,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptionJobs);const existing=await requestResult(store.index('cacheKey').get(candidate.cacheKey));const value=normalizeTranscriptionJob(input,existing||null);store.put(value);await transactionDone(transaction);return value;
  });
  broadcast('ielts-transcription-job',[IELTS_STORE_NAMES.transcriptionJobs]);emit('saved',{storeName:IELTS_STORE_NAMES.transcriptionJobs});return saved;
}

export async function recoverInterruptedTranscriptionJobs({now=Date.now()}={}){
  const recovered=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptionJobs);const changed=[];for(const[rowId,row]of map){if(row.status!=='processing')continue;const value={...row,status:'failed',retryCount:Number(row.retryCount||0)+1,error:'Phiên tạo transcript bị gián đoạn do reload hoặc đóng ứng dụng. Bạn có thể thử lại.',updatedAt:now};map.set(rowId,value);changed.push(value);}return changed;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptionJobs,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptionJobs);const processing=await requestResult(store.index('status').getAll('processing'));const changed=processing.map(row=>({...row,status:'failed',retryCount:Number(row.retryCount||0)+1,error:'Phiên tạo transcript bị gián đoạn do reload hoặc đóng ứng dụng. Bạn có thể thử lại.',updatedAt:now}));for(const row of changed)store.put(row);await transactionDone(transaction);return changed;
  });
  if(recovered.length)broadcast('ielts-transcription-recovered',[IELTS_STORE_NAMES.transcriptionJobs]);return recovered.length;
}

export async function replaceTranscriptSegments(mediaSourceId,input,{durationMs=0}={}){
  const result=validateTranscriptSegments((Array.isArray(input)?input:[]).map((row,index)=>sanitizeTranscriptSegment({...row,mediaSourceId},index)),{durationMs});if(!result.valid)throw new Error(result.errors.join(' '));
  const segments=result.segments.map((row,index)=>({...row,order:index,mediaSourceId}));
  await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptSegments);for(const[key,value]of map)if(value.mediaSourceId===mediaSourceId)map.delete(key);for(const row of segments)map.set(row.id,clone(row));return;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptSegments,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptSegments);const existing=await requestResult(store.index('mediaSourceId').getAll(mediaSourceId));for(const row of existing)store.delete(row.id);for(const row of segments)store.put(clone(row));await transactionDone(transaction);
  });
  const { persistTranscriptAggregate }=await import('./transcript-aggregate.js');
  const canonical=await persistTranscriptAggregate({
    source:{id:`transcript-source:ielts:${mediaSourceId}`,namespace:'private',externalId:mediaSourceId,sourceType:'ielts-media',language:segments[0]?.language||'en',status:'unverified',complete:result.complete===true},
    segments,
    provenance:{kind:'ielts-transcript-import',mediaSourceId}
  },{activate:true});
  broadcast('ielts-transcript-replaced',[IELTS_STORE_NAMES.transcriptSegments]);
  return{...result,segments,transcriptSourceId:canonical.source.id,transcriptRevisionId:canonical.revision.id};
}

export async function listTranscriptSegments(mediaSourceId){
  const database=await openIeltsDatabase();let rows;if(!database)rows=[...memory.get(IELTS_STORE_NAMES.transcriptSegments).values()].filter(row=>row.mediaSourceId===mediaSourceId).map(clone);else{const transaction=database.transaction(IELTS_STORE_NAMES.transcriptSegments,'readonly');rows=await requestResult(transaction.objectStore(IELTS_STORE_NAMES.transcriptSegments).index('mediaSourceId').getAll(mediaSourceId));await transactionDone(transaction);}return rows.sort((a,b)=>Number(a.order||0)-Number(b.order||0)||Number(a.startMs||0)-Number(b.startMs||0));
}

export async function saveMediaAttempt(input){
  const saved=await saveIeltsRecord(IELTS_STORE_NAMES.mediaAttempts,sanitizeMediaAttempt(input),'ielts-media-attempt');
  const attempts=Array.isArray(input?.evidenceAttempts)?input.evidenceAttempts:[];
  if(attempts.length){
    const { persistLearningEnvelope }=await import('./persistence.js');
    for(const envelope of attempts)await persistLearningEnvelope(envelope);
  }
  return saved;
}

export async function saveMediaProgress(input){
  const value={id:String(input.id||input.mediaSourceId||''),mediaSourceId:String(input.mediaSourceId||input.id||''),lastSegmentId:String(input.lastSegmentId||''),lastPositionMs:Math.max(0,Number(input.lastPositionMs||0)),completedSegmentIds:[...new Set((Array.isArray(input.completedSegmentIds)?input.completedSegmentIds:[]).map(String))],weakSegmentIds:[...new Set((Array.isArray(input.weakSegmentIds)?input.weakSegmentIds:[]).map(String))],playbackRate:Math.max(.25,Math.min(2,Number(input.playbackRate||1))),sessionMinutes:[10,20,30].includes(Number(input.sessionMinutes))?Number(input.sessionMinutes):20,updatedAt:Date.now()};
  if(!value.mediaSourceId)throw new Error('Media progress thiếu mediaSourceId.');return saveIeltsRecord(IELTS_STORE_NAMES.mediaProgress,value,'ielts-media-progress');
}

export async function getMediaProgress(mediaSourceId){const rows=await getAll(IELTS_STORE_NAMES.mediaProgress);return rows.find(row=>row.mediaSourceId===mediaSourceId)||null;}

export async function buildIeltsBackup({restoreToken=null}={}){
  if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);
  let stores={};const database=await openIeltsDatabase();
  if(!database)for(const store of STORE_LIST)stores[store]=[...memory.get(store).values()].map(clone);
  else{
    const physicalStores=[...database.objectStoreNames];const unknown=physicalStores.filter(name=>!STORE_LIST.includes(name));const missing=STORE_LIST.filter(name=>!physicalStores.includes(name));
    if(unknown.length||missing.length)throw Object.assign(new Error(`IELTS store registry mismatch (missing: ${missing.join(',')||'none'}; unknown: ${unknown.join(',')||'none'}).`),{code:'BACKUP_STORE_REGISTRY_MISMATCH'});
    const transaction=database.transaction(STORE_LIST,'readonly');stores=Object.fromEntries(await Promise.all(STORE_LIST.map(async store=>[store,await requestResult(transaction.objectStore(store).getAll())])));await transactionDone(transaction);
  }
  return{app:'Vocab Master IELTS Labs',schemaVersion:IELTS_BACKUP_VERSION,domainSchemaVersion:IELTS_SCHEMA_VERSION,exportedAt:new Date().toISOString(),stores};
}

export function validateIeltsBackup(input){
  const errors=[];const warnings=[];if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup IELTS phải là object.'],warnings,value:null};
  if(Number(input.schemaVersion||0)!==IELTS_BACKUP_VERSION)errors.push(Number(input.schemaVersion||0)>IELTS_BACKUP_VERSION?'Backup IELTS dùng schema mới hơn ứng dụng.':'Backup IELTS thiếu hoặc sai schema version.');
  if(Number(input.domainSchemaVersion||0)!==IELTS_SCHEMA_VERSION)errors.push(Number(input.domainSchemaVersion||0)>IELTS_SCHEMA_VERSION?'Backup IELTS dùng domain schema mới hơn ứng dụng.':'Backup IELTS thiếu hoặc sai domain schema version.');
  const stores=input.stores&&typeof input.stores==='object'?input.stores:{};const value={app:'Vocab Master IELTS Labs',schemaVersion:IELTS_BACKUP_VERSION,domainSchemaVersion:IELTS_SCHEMA_VERSION,exportedAt:String(input.exportedAt||new Date().toISOString()),stores:{}};
  for(const store of STORE_LIST){if(!Object.hasOwn(stores,store))errors.push(`Backup IELTS thiếu store ${store}.`);const rows=Array.isArray(stores[store])?stores[store]:[];if(!Array.isArray(stores[store])&&Object.hasOwn(stores,store))errors.push(`${store} phải là array.`);if(rows.length>MAX_RECORDS_PER_STORE)errors.push(`${store} vượt giới hạn ${MAX_RECORDS_PER_STORE}.`);value.stores[store]=clone(rows);}
  for(const store of Object.keys(stores))if(!STORE_LIST.includes(store))errors.push(`Backup IELTS có store không được hỗ trợ: ${store}.`);
  const ids=new Set();for(const store of STORE_LIST){for(const row of value.stores[store]){const id=String(row?.key??row?.id??'');if(!id){errors.push(`${store} có record thiếu id/key.`);continue;}const composite=`${store}:${id}`;if(ids.has(composite))errors.push(`${store} trùng id ${id}.`);ids.add(composite);}}
  for(const row of value.stores[IELTS_STORE_NAMES.lexicalSets]){const result=validateLexicalSet(row);if(row.status==='active'&&!result.valid)errors.push(...result.errors.map(error=>`lexicalSets/${row.id}: ${error}`));}
  for(const row of value.stores[IELTS_STORE_NAMES.labItems]){const result=validateLabItem(row);if(row.status==='verified'&&!result.valid)errors.push(...result.errors.map(error=>`labItems/${row.id}: ${error}`));}
  for(const row of value.stores[IELTS_STORE_NAMES.readingPassages]){const result=validateReadingPassage(row);if(row.status==='verified'&&!result.valid)errors.push(...result.errors.map(error=>`readingPassages/${row.id}: ${error}`));}
  const sourceIds=new Set(value.stores[IELTS_STORE_NAMES.mediaSources].map(row=>row.id));for(const segment of value.stores[IELTS_STORE_NAMES.transcriptSegments])if(!sourceIds.has(segment.mediaSourceId))warnings.push(`Segment ${segment.id} tham chiếu media source không tồn tại.`);
  return{valid:errors.length===0,errors,warnings,value};
}

export async function restoreIeltsBackup(input){
  const {restoreIeltsBackupSafely}=await import('./ielts-backup.js');
  return restoreIeltsBackupSafely(input);
}

export async function reopenIeltsDatabase({restoreToken=null}={}){if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);if(databasePromise){const database=await databasePromise.catch(()=>null);database?.close();databasePromise=null;}return openIeltsDatabase();}

export async function downloadIeltsBackup(){
  const backup=await buildIeltsBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`vocab-master-ielts-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return backup;
}

export async function clearIeltsData(){
  await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){
      for(const[name,map]of memory){
        if(name!==IELTS_STORE_NAMES.settings){map.clear();continue;}
        for(const key of [...map.keys()])if(!String(key).startsWith(MIGRATION_LEDGER_PREFIX))map.delete(key);
      }
      return;
    }
    const transaction=database.transaction(STORE_LIST,'readwrite');
    const settings=transaction.objectStore(IELTS_STORE_NAMES.settings);
    const migrationRows=(await requestResult(settings.getAll())).filter(row=>String(row?.key||'').startsWith(MIGRATION_LEDGER_PREFIX));
    for(const store of STORE_LIST)transaction.objectStore(store).clear();
    for(const row of migrationRows)settings.put(row);
    await transactionDone(transaction);
  });
  broadcast('ielts-data-cleared',STORE_LIST);
}

export const __testing=Object.freeze({requestResult,transactionDone,getAll,getOne,putOne,deleteOne,memory,normalizeTranscriptionJob});
