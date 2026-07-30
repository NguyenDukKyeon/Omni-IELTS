import {
  BACKUP_SCHEMA_VERSION,
  TRACKED_STORAGE_KEYS,
  buildBackupDocument,
  compactSnapshot,
  createReviewEvent,
  assertEvidenceReviewWrite,
  dedupeReviewEvents,
  resetLearningProgress,
  shouldCreateDailySnapshot,
  stripEmbeddedReviewHistory,
  validateBackupDocument
} from './persistence-core.js';
import { databaseBlocked,durableStorageUnavailable,normalizeDatabaseOpenError } from './storage-safety.js';
import { assertActiveRestoreToken,withDurableWriteLock } from './storage-lock.js';

export const DB_NAME='vocab-master-personal';
export const DB_VERSION=4;
const REVISION_META_KEY='revision';
export const STORE_NAMES=Object.freeze({
  cards:'cards',
  settings:'settings',
  reviewEvents:'reviewEvents',
  snapshots:'snapshots',
  meta:'meta',
  fileHandles:'fileHandles',
  outbox:'outbox',
  captureDrafts:'captureDrafts'
});
export const CORE_RESTORE_JOURNAL_KEY='phase0RestoreJournal';
export const CORE_RESTORE_RECEIPT_KEY='lastRestoreReceipt';
export const CORE_OPERATIONAL_META_KEYS=Object.freeze([REVISION_META_KEY,'lastSnapshotAt','lastAutomaticFileBackupAt','lastManualBackupAt','lastReviewAt','cardsUpdatedAt']);

const DAILY_DATE_KEY='vocab-master-daily-date';
const INITIALIZED_META_KEY='databaseInitialized';
const CAPTURE_DRAFTS_FALLBACK_KEY='vocab-master-capture-drafts';
const OPERATIONAL_META_KEYS=new Set(CORE_OPERATIONAL_META_KEYS);
let databasePromise=null;
let snapshotTimer=null;
let fileBackupTimer=null;
let initialized=false;
let currentState=null;
let writeQueue=Promise.resolve();
let channel=null;

function getNativeStorage(){
  try{
    const storage=globalThis.localStorage;
    if(!storage)return null;
    return{
      getItem:storage.getItem.bind(storage),
      setItem:storage.setItem.bind(storage),
      removeItem:storage.removeItem.bind(storage)
    };
  }catch{return null;}
}

const NATIVE_STORAGE=getNativeStorage();

function clone(value){return value==null?value:structuredClone(value);}
function safeParse(value,fallback){try{return value==null?fallback:JSON.parse(value);}catch{return fallback;}}
function indexedDbUnavailable(){return typeof indexedDB==='undefined';}
function readFallbackCaptureDrafts(){
  let raw;
  try{raw=NATIVE_STORAGE?.getItem(CAPTURE_DRAFTS_FALLBACK_KEY);}
  catch(cause){
    throw Object.assign(new Error('Không thể đọc nguồn Quick Capture degraded; không ghi đè dữ liệu chưa kiểm chứng.'),{
      code:'DURABLE_CAPTURE_SOURCE_UNREADABLE',database:DB_NAME,storage:'localStorage',durable:false,sourcePreserved:true,cause
    });
  }
  if(raw==null)return[];
  let rows;
  try{rows=JSON.parse(raw);}
  catch(cause){
    throw Object.assign(new Error('Nguồn Quick Capture degraded chứa JSON không hợp lệ; raw value được giữ nguyên.'),{
      code:'DURABLE_CAPTURE_SOURCE_CORRUPT',database:DB_NAME,storage:'localStorage',durable:false,sourcePreserved:true,cause
    });
  }
  if(!Array.isArray(rows))throw Object.assign(new Error('Nguồn Quick Capture degraded không phải danh sách; raw value được giữ nguyên.'),{
    code:'DURABLE_CAPTURE_SOURCE_CORRUPT',database:DB_NAME,storage:'localStorage',durable:false,sourcePreserved:true
  });
  return rows;
}
function nowRevision(){return Date.now()*1000+Math.floor(Math.random()*1000);}
function emitStatus(status,detail={}){globalThis.dispatchEvent?.(new CustomEvent('vocab:persistence-status',{detail:{status,...detail}}));}
function enqueueWrite(task,{restoreToken=null}={}){
  if(restoreToken)return withDurableWriteLock(task,restoreToken);
  const locked=()=>withDurableWriteLock(task,restoreToken);
  const run=writeQueue.then(locked,locked);
  writeQueue=run.catch(()=>{});
  return run;
}

function normalizeMetrics(metrics={}){
  return{
    dailyDate:String(metrics.dailyDate||''),
    dailyDone:Math.max(0,Number(metrics.dailyDone||0)),
    dailyTarget:Math.max(0,Number(metrics.dailyTarget||0)),
    studyMinutes:Math.max(0,Number(metrics.studyMinutes||0)),
    completedReviews:Math.max(0,Number(metrics.completedReviews||0)),
    activitiesDone:Math.max(0,Number(metrics.activitiesDone ?? metrics.dailyDone ?? 0)),
    independentReviewsDone:Math.max(0,Number(metrics.independentReviewsDone ?? metrics.completedReviews ?? 0)),
    newSkillsIntroduced:Math.max(0,Number(metrics.newSkillsIntroduced||0))
  };
}

function normalizeState(value={}){
  return{
    cards:Array.isArray(value.cards)?clone(value.cards):[],
    settings:value.settings&&typeof value.settings==='object'?clone(value.settings):{},
    fsrsConfig:value.fsrsConfig&&typeof value.fsrsConfig==='object'?clone(value.fsrsConfig):{},
    metrics:normalizeMetrics(value.metrics),
    revision:Number(value.revision||0),
    initialized:value.initialized!==false
  };
}

export function readFallbackState(){
  const cards=safeParse(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.cards),[]);
  const reviewEvents=safeParse(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.reviewEvents),[]);
  return normalizeState({
    cards:Array.isArray(cards)?cards:[],
    settings:safeParse(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.settings),{}),
    fsrsConfig:safeParse(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.fsrsConfig),{}),
    metrics:{
      dailyDate:NATIVE_STORAGE?.getItem(DAILY_DATE_KEY)||'',
      dailyDone:Number(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.dailyDone)||0),
      dailyTarget:Number(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.dailyTarget)||0),
      studyMinutes:Number(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.studyMinutes)||0),
      completedReviews:Number(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.completedReviews)||0)
    },
    reviewEvents:Array.isArray(reviewEvents)?reviewEvents:[],
    initialized:NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.initialized)==='true'
  });
}

function readFallbackReviewEvents(){
  const events=safeParse(NATIVE_STORAGE?.getItem(TRACKED_STORAGE_KEYS.reviewEvents),[]);
  return dedupeReviewEvents(Array.isArray(events)?events:[]);
}

function writeVerifiedFallbackEntries(writes){
  if(!NATIVE_STORAGE)throw durableStorageUnavailable(`${DB_NAME}/localStorage`);
  const before=new Map(writes.map(([key])=>[key,NATIVE_STORAGE.getItem(key)]));
  try{
    for(const[key,value]of writes)NATIVE_STORAGE.setItem(key,value);
    for(const[key,value]of writes)if(NATIVE_STORAGE.getItem(key)!==value)throw new Error(`localStorage read-back mismatch: ${key}`);
  }catch(cause){
    let rollbackVerified=true;
    for(const[key,value]of before){
      try{if(value===null)NATIVE_STORAGE.removeItem(key);else NATIVE_STORAGE.setItem(key,value);}catch{}
      try{if(NATIVE_STORAGE.getItem(key)!==value)rollbackVerified=false;}catch{rollbackVerified=false;}
    }
    throw Object.assign(new Error(`Không thể xác nhận ghi bền localStorage: ${cause?.message||cause}`),{
      code:rollbackVerified?'DURABLE_FALLBACK_WRITE_FAILED':'DURABLE_FALLBACK_ROLLBACK_FAILED',
      database:DB_NAME,
      storage:'localStorage',
      durable:false,
      rollbackVerified,
      cause
    });
  }
  return{durable:true,storage:'localStorage-degraded'};
}

function writeFallbackState(partial={}){
  const writes=[];
  if('cards'in partial)writes.push([TRACKED_STORAGE_KEYS.cards,JSON.stringify(partial.cards||[])]);
  if('settings'in partial)writes.push([TRACKED_STORAGE_KEYS.settings,JSON.stringify(partial.settings||{})]);
  if('fsrsConfig'in partial)writes.push([TRACKED_STORAGE_KEYS.fsrsConfig,JSON.stringify(partial.fsrsConfig||{})]);
  if('reviewEvents'in partial)writes.push([TRACKED_STORAGE_KEYS.reviewEvents,JSON.stringify(partial.reviewEvents||[])]);
  if('initialized'in partial)writes.push([TRACKED_STORAGE_KEYS.initialized,String(Boolean(partial.initialized))]);
  if(partial.metrics){
    const metrics=normalizeMetrics(partial.metrics);
    writes.push(
      [DAILY_DATE_KEY,metrics.dailyDate],
      [TRACKED_STORAGE_KEYS.dailyDone,String(metrics.dailyDone)],
      [TRACKED_STORAGE_KEYS.dailyTarget,String(metrics.dailyTarget)],
      [TRACKED_STORAGE_KEYS.studyMinutes,String(metrics.studyMinutes)],
      [TRACKED_STORAGE_KEYS.completedReviews,String(metrics.completedReviews)]
    );
  }
  return writeVerifiedFallbackEntries(writes);
}

export function requestResult(request){
  return new Promise((resolve,reject)=>{
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
  });
}

export function transactionDone(transaction){
  return new Promise((resolve,reject)=>{
    transaction.oncomplete=()=>resolve();
    transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));
    transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));
  });
}

export function openDatabase(){
  if(databasePromise)return databasePromise;
  if(indexedDbUnavailable())return Promise.reject(durableStorageUnavailable(DB_NAME));
  databasePromise=new Promise((resolve,reject)=>{
    let blocked=false;
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const database=request.result;
      if(!database.objectStoreNames.contains(STORE_NAMES.cards)){
        const store=database.createObjectStore(STORE_NAMES.cards,{keyPath:'id'});
        store.createIndex('deck','deck',{unique:false});
        store.createIndex('dueAt','dueAt',{unique:false});
        store.createIndex('updatedAt','updatedAt',{unique:false});
      }
      if(!database.objectStoreNames.contains(STORE_NAMES.settings))database.createObjectStore(STORE_NAMES.settings,{keyPath:'key'});
      if(!database.objectStoreNames.contains(STORE_NAMES.reviewEvents)){
        const store=database.createObjectStore(STORE_NAMES.reviewEvents,{keyPath:'id'});
        store.createIndex('cardId','cardId',{unique:false});
        store.createIndex('reviewedAt','reviewedAt',{unique:false});
        store.createIndex('skill','skill',{unique:false});
      }
      if(!database.objectStoreNames.contains(STORE_NAMES.snapshots)){
        const store=database.createObjectStore(STORE_NAMES.snapshots,{keyPath:'id'});
        store.createIndex('createdAt','createdAt',{unique:false});
      }
      if(!database.objectStoreNames.contains(STORE_NAMES.meta))database.createObjectStore(STORE_NAMES.meta,{keyPath:'key'});
      if(!database.objectStoreNames.contains(STORE_NAMES.fileHandles))database.createObjectStore(STORE_NAMES.fileHandles,{keyPath:'key'});
      if(!database.objectStoreNames.contains(STORE_NAMES.outbox)){
        const store=database.createObjectStore(STORE_NAMES.outbox,{keyPath:'id'});
        store.createIndex('createdAt','createdAt',{unique:false});
      }
      if(!database.objectStoreNames.contains(STORE_NAMES.captureDrafts)){
        const store=database.createObjectStore(STORE_NAMES.captureDrafts,{keyPath:'id'});
        store.createIndex('updatedAt','updatedAt',{unique:false});
        store.createIndex('status','status',{unique:false});
      }
    };
    request.onsuccess=()=>{
      const database=request.result;
      if(blocked){database.close();return;}
      database.onversionchange=()=>{database.close();databasePromise=null;};
      resolve(database);
    };
    request.onerror=()=>{const error=normalizeDatabaseOpenError(request.error,{database:DB_NAME,supportedVersion:DB_VERSION});databasePromise=null;reject(error);};
    request.onblocked=()=>{blocked=true;databasePromise=null;reject(databaseBlocked(DB_NAME));};
  });
  return databasePromise;
}

async function getAll(storeName){
  const database=await openDatabase();
  const transaction=database.transaction(storeName,'readonly');
  const values=await requestResult(transaction.objectStore(storeName).getAll());
  await transactionDone(transaction);
  return values;
}

async function getOne(storeName,key){
  const database=await openDatabase();
  const transaction=database.transaction(storeName,'readonly');
  const value=await requestResult(transaction.objectStore(storeName).get(key));
  await transactionDone(transaction);
  return value;
}

async function putOne(storeName,value,{restoreToken=null}={}){
  return withDurableWriteLock(async()=>{
    const database=await openDatabase();
    const transaction=database.transaction(storeName,'readwrite');
    transaction.objectStore(storeName).put(value);
    await transactionDone(transaction);
    return value;
  },restoreToken);
}

async function deleteOne(storeName,key,{restoreToken=null}={}){
  return withDurableWriteLock(async()=>{
    const database=await openDatabase();
    const transaction=database.transaction(storeName,'readwrite');
    transaction.objectStore(storeName).delete(key);
    await transactionDone(transaction);
  },restoreToken);
}

async function replaceCards(cards,transaction=null){
  const database=transaction?null:await openDatabase();
  const tx=transaction||database.transaction(STORE_NAMES.cards,'readwrite');
  const store=tx.objectStore(STORE_NAMES.cards);
  store.clear();
  for(const card of cards)store.put(clone(card));
  if(!transaction)await transactionDone(tx);
}

async function putSettingsDocument(key,value,transaction=null){
  const database=transaction?null:await openDatabase();
  const tx=transaction||database.transaction(STORE_NAMES.settings,'readwrite');
  tx.objectStore(STORE_NAMES.settings).put({key,value:clone(value),updatedAt:Date.now()});
  if(!transaction)await transactionDone(tx);
}

async function updateRevision(transaction,reason){
  const revision=nowRevision();
  transaction.objectStore(STORE_NAMES.meta).put({key:REVISION_META_KEY,value:revision,reason,updatedAt:Date.now()});
  return revision;
}

function broadcastRevision(revision,reason){
  channel?.postMessage({type:'revision',revision,reason});
  globalThis.dispatchEvent?.(new CustomEvent('vocab:data-saved',{detail:{revision,reason}}));
}

function initializeBroadcastChannel(){
  if(channel||typeof BroadcastChannel==='undefined')return;
  channel=new BroadcastChannel('vocab-master-data-v1');
  channel.unref?.();
  channel.addEventListener('message',event=>{
    if(event.data?.type!=='revision')return;
    const revision=Number(event.data.revision||0);
    if(revision<=Number(currentState?.revision||0))return;
    void readStateFromDatabase().then(nextState=>{
      currentState=nextState;
      globalThis.dispatchEvent?.(new CustomEvent('vocab:external-change',{detail:{revision,reason:event.data.reason||'external',state:clone(nextState)}}));
    }).catch(error=>{
      console.error('Không thể đồng bộ dữ liệu từ tab khác:',error);
      globalThis.dispatchEvent?.(new CustomEvent('vocab:external-change-error',{detail:{revision,error}}));
    });
  });
}

async function readStateFromDatabase(){
  const[cards,settingRows,revisionRow]=await Promise.all([getAll(STORE_NAMES.cards),getAll(STORE_NAMES.settings),getOne(STORE_NAMES.meta,REVISION_META_KEY)]);
  const map=new Map(settingRows.map(row=>[row.key,row.value]));
  return normalizeState({
    cards,
    settings:map.get('app')||{},
    fsrsConfig:map.get('fsrs')||{},
    metrics:map.get('metrics')||{},
    revision:Number(revisionRow?.value||0),
    initialized:true
  });
}

function hasLegacyState(legacy){
  return Boolean(legacy.cards.length||Object.keys(legacy.settings||{}).length||Object.keys(legacy.fsrsConfig||{}).length||legacy.initialized);
}

async function markInitialized(transaction,source){
  transaction.objectStore(STORE_NAMES.meta).put({key:INITIALIZED_META_KEY,value:true,source,completedAt:Date.now(),schemaVersion:BACKUP_SCHEMA_VERSION});
}

async function migrateLegacyState(){
  const legacy=readFallbackState();
  const migrated=stripEmbeddedReviewHistory(legacy.cards);
  const fallbackEvents=readFallbackReviewEvents();
  const database=await openDatabase();
  const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.settings,STORE_NAMES.reviewEvents,STORE_NAMES.meta],'readwrite');
  await replaceCards(migrated.cards,transaction);
  await putSettingsDocument('app',legacy.settings,transaction);
  await putSettingsDocument('fsrs',legacy.fsrsConfig,transaction);
  await putSettingsDocument('metrics',legacy.metrics,transaction);
  const eventsStore=transaction.objectStore(STORE_NAMES.reviewEvents);
  for(const event of dedupeReviewEvents([...migrated.reviewEvents,...fallbackEvents]))eventsStore.put(event);
  await markInitialized(transaction,'localStorage');
  const revision=await updateRevision(transaction,'legacy-migration');
  await transactionDone(transaction);
  return normalizeState({...legacy,cards:migrated.cards,revision,initialized:true});
}

async function adoptExistingDatabase(){
  const [cards,existingEvents]=await Promise.all([getAll(STORE_NAMES.cards),getAll(STORE_NAMES.reviewEvents)]);
  const migrated=stripEmbeddedReviewHistory(cards);
  const database=await openDatabase();
  const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.reviewEvents,STORE_NAMES.meta],'readwrite');
  if(migrated.reviewEvents.length){
    await replaceCards(migrated.cards,transaction);
    const eventsStore=transaction.objectStore(STORE_NAMES.reviewEvents);
    for(const event of dedupeReviewEvents([...existingEvents,...migrated.reviewEvents]))eventsStore.put(event);
  }
  await markInitialized(transaction,'existing-indexeddb');
  const revision=await updateRevision(transaction,migrated.reviewEvents.length?'existing-indexeddb-migrated':'existing-indexeddb-adopted');
  await transactionDone(transaction);
  return normalizeState({...await readStateFromDatabase(),revision,initialized:true});
}

async function initializeEmptyDatabase(){
  const database=await openDatabase();
  const transaction=database.transaction([STORE_NAMES.settings,STORE_NAMES.meta],'readwrite');
  await putSettingsDocument('app',{},transaction);
  await putSettingsDocument('fsrs',{},transaction);
  await putSettingsDocument('metrics',normalizeMetrics({}),transaction);
  await markInitialized(transaction,'new-install');
  const revision=await updateRevision(transaction,'database-created');
  await transactionDone(transaction);
  return normalizeState({cards:[],settings:{},fsrsConfig:{},metrics:{},revision,initialized:true});
}

async function databaseHasContent(){
  const[cards,settings,events]=await Promise.all([getAll(STORE_NAMES.cards),getAll(STORE_NAMES.settings),getAll(STORE_NAMES.reviewEvents)]);
  return cards.length>0||settings.length>0||events.length>0;
}

async function reconcileLegacyCardShapes(){
  const database=await openDatabase();
  const transaction=database.transaction(STORE_NAMES.cards,'readwrite');
  const store=transaction.objectStore(STORE_NAMES.cards);
  const cards=await requestResult(store.getAll());
  let reconciled=0;
  for(const source of cards){
    if(!Object.hasOwn(source,'reviewHistory')||source.reviewHistory!==undefined)continue;
    const card=clone(source);delete card.reviewHistory;store.put(card);reconciled+=1;
  }
  await transactionDone(transaction);
  return reconciled;
}

function scheduleSnapshot(reason='automatic'){
  clearTimeout(snapshotTimer);
  snapshotTimer=setTimeout(()=>{void createAutomaticSnapshot(reason).catch(error=>console.warn('[snapshot]',error));},1500);snapshotTimer.unref?.();
  clearTimeout(fileBackupTimer);
  fileBackupTimer=setTimeout(()=>{void writeAutomaticBackupFile();},5000);fileBackupTimer.unref?.();
}

async function queueOutbox(operation){
  if(indexedDbUnavailable())return null;
  const row={id:operation.id||`outbox-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:Date.now(),attempts:0,...clone(operation)};
  await putOne(STORE_NAMES.outbox,row);
  emitStatus('pending',{pendingId:row.id});
  return row;
}

async function applyReviewOperation(operation){
  assertEvidenceReviewWrite({card:operation?.card,event:operation?.event});
  const database=await openDatabase();
  const stores=[STORE_NAMES.cards,STORE_NAMES.reviewEvents,STORE_NAMES.meta];
  if(operation.metrics)stores.push(STORE_NAMES.settings);
  const transaction=database.transaction(stores,'readwrite');
  const eventsStore=transaction.objectStore(STORE_NAMES.reviewEvents);
  const existing=await requestResult(eventsStore.get(operation.event.id));
  if(existing){
    if(existing.evidenceDecision?.receiptBinding!==operation.event.evidenceDecision?.receiptBinding){transaction.abort();const error=new Error('Receipt đã được dùng cho một EvidenceDecision khác.');error.code='EVIDENCE_RECEIPT_COLLISION';throw error;}
    const revisionRow=await requestResult(transaction.objectStore(STORE_NAMES.meta).get(REVISION_META_KEY));
    await transactionDone(transaction);
    return{revision:Number(revisionRow?.value||currentState?.revision||0),inserted:false,event:existing};
  }
  const cardStore=transaction.objectStore(STORE_NAMES.cards);
  const existingCard=await requestResult(cardStore.get(operation.card.id));
  const expectedStamp=Number(operation.card.storageBaseUpdatedAt||0);
  const actualStamp=Number(existingCard?.storageUpdatedAt||0);
  if(existingCard&&expectedStamp&&actualStamp!==expectedStamp){transaction.abort();const error=new Error('Review dựa trên phiên bản thẻ cũ.');error.code='STALE_REVIEW_WRITE';throw error;}
  cardStore.put(clone(operation.card));
  eventsStore.add(clone(operation.event));
  if(operation.metrics)await putSettingsDocument('metrics',normalizeMetrics(operation.metrics),transaction);
  transaction.objectStore(STORE_NAMES.meta).put({key:'lastReviewAt',value:Number(operation.event.reviewedAt||operation.event.review||Date.now())});
  transaction.objectStore(STORE_NAMES.meta).put({key:'cardsUpdatedAt',value:Date.now()});
  const revision=await updateRevision(transaction,operation.reason||'review-completed');
  await transactionDone(transaction);
  return{revision,inserted:true,event:operation.event};
}

async function replayOutbox(){
  if(indexedDbUnavailable())return{replayed:0,pending:0};
  const rows=(await getAll(STORE_NAMES.outbox)).sort((a,b)=>a.createdAt-b.createdAt);
  let replayed=0;let quarantined=0;
  for(const row of rows){
    if(row.status==='quarantined'){quarantined+=1;continue;}
    try{
      if(row.type==='review')await applyReviewOperation(row);
      else if(row.type==='import-batch')await applyImportBatchOperation(row);
      else if(row.type==='card-put'){
        const database=await openDatabase();
        const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.meta],'readwrite');
        const store=transaction.objectStore(STORE_NAMES.cards);
        const existing=await requestResult(store.get(row.card.id));
        const incomingStamp=Number(row.card.storageUpdatedAt||row.createdAt||0);
        const existingStamp=Number(existing?.storageUpdatedAt||0);
        if(!existing||existingStamp<incomingStamp){
          store.put(clone(row.card));
          await updateRevision(transaction,row.reason||'replayed-card');
        }
        await transactionDone(transaction);
      }else throw Object.assign(new Error(`Loại outbox không được hỗ trợ: ${row.type||'missing'}`),{code:'OUTBOX_OPERATION_UNKNOWN'});
      await deleteOne(STORE_NAMES.outbox,row.id);
      replayed+=1;
    }catch(error){
      const terminal=String(error?.code||'').startsWith('EVIDENCE_')||['STALE_REVIEW_WRITE','OUTBOX_OPERATION_UNKNOWN'].includes(error?.code);
      console.warn('[persistence] Không thể phát lại outbox',row.id,error);
      if(!terminal)break;
      await putOne(STORE_NAMES.outbox,{...clone(row),status:'quarantined',quarantinedAt:Date.now(),quarantineCode:error.code||'OUTBOX_TERMINAL_FAILURE',quarantineMessage:String(error.message||error),attempts:Number(row.attempts||0)+1});
      quarantined+=1;
    }
  }
  const remaining=await getAll(STORE_NAMES.outbox);
  return{replayed,pending:remaining.filter(row=>row.status!=='quarantined').length,quarantined:remaining.filter(row=>row.status==='quarantined').length};
}

export async function requestPersistentStorage(){
  if(!globalThis.navigator?.storage?.persist)return{supported:false,persisted:false};
  const already=await globalThis.navigator.storage.persisted?.().catch(()=>false);
  const persisted=already||await globalThis.navigator.storage.persist().catch(()=>false);
  return{supported:true,persisted};
}

export async function initializePersistence(){
  if(initialized&&currentState)return clone(currentState);
  if(indexedDbUnavailable()){
    const fallback=readFallbackState();
    if(!fallback.initialized)writeFallbackState({initialized:true});
    currentState=normalizeState({...fallback,initialized:true});
    initialized=true;
    emitStatus('fallback',{reason:'indexeddb-unavailable'});
    return clone(currentState);
  }

  emitStatus('loading');
  const{replay,lastSnapshot}=await enqueueWrite(async()=>{
    if(initialized&&currentState)return{replay:{replayed:0,pending:0,quarantined:0},lastSnapshot:await getOne(STORE_NAMES.meta,'lastSnapshotAt')};
    await openDatabase();
    await reconcileLegacyCardShapes();
    const marker=await getOne(STORE_NAMES.meta,INITIALIZED_META_KEY);
    let state;
    if(marker?.value)state=await readStateFromDatabase();
    else if(await databaseHasContent())state=await adoptExistingDatabase();
    else{
      const legacy=readFallbackState();
      state=hasLegacyState(legacy)?await migrateLegacyState():await initializeEmptyDatabase();
    }
    currentState=normalizeState(state);
    initialized=true;
    initializeBroadcastChannel();
    const replay=await replayOutbox();
    if(replay.replayed)currentState=await readStateFromDatabase();
    return{replay,lastSnapshot:await getOne(STORE_NAMES.meta,'lastSnapshotAt')};
  });
  if(shouldCreateDailySnapshot(lastSnapshot?.value))await createAutomaticSnapshot('daily-startup');
  void requestPersistentStorage();
  emitStatus(replay.quarantined?'error':replay.pending?'pending':'saved',{pending:replay.pending,quarantined:replay.quarantined});
  return clone(currentState);
}

export function getCurrentState(){return clone(currentState||readFallbackState());}

async function persistCardDirect(card,reason='card-changed'){
  const database=await openDatabase();
  const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.meta],'readwrite');
  const store=transaction.objectStore(STORE_NAMES.cards);
  const existing=await requestResult(store.get(card.id));
  const expected=Number(card.storageBaseUpdatedAt||0);
  const actual=Number(existing?.storageUpdatedAt||0);
  if(existing&&expected&&actual!==expected){transaction.abort();const error=new Error('Thẻ đã thay đổi ở tab khác. Tải lại trước khi ghi tiếp.');error.code='STALE_CARD_WRITE';throw error;}
  store.put(clone(card));
  transaction.objectStore(STORE_NAMES.meta).put({key:'cardsUpdatedAt',value:Date.now()});
  const revision=await updateRevision(transaction,reason);
  await transactionDone(transaction);
  return revision;
}

export async function persistCard(card,reason='card-changed'){
  const storageBaseUpdatedAt=Number(card?.storageUpdatedAt||0);
  const value={...clone(card),storageBaseUpdatedAt,storageUpdatedAt:Date.now()};
  return enqueueWrite(async()=>{
    emitStatus('saving');
    let outbox=null;
    try{
      if(indexedDbUnavailable())writeFallbackState({cards:[...getCurrentState().cards.filter(item=>item.id!==value.id),value]});
      else{
        outbox=await queueOutbox({id:`card-put:${value.id}:${value.storageUpdatedAt}`,type:'card-put',card:value,reason,createdAt:value.storageUpdatedAt});
        const revision=await persistCardDirect(value,reason);
        try{await deleteOne(STORE_NAMES.outbox,outbox.id);}catch(error){console.warn('[persistence] Đã lưu thẻ nhưng chưa dọn được outbox',outbox.id,error);}
        currentState=normalizeState({...getCurrentState(),cards:[...getCurrentState().cards.filter(item=>item.id!==value.id),value],revision});
        broadcastRevision(revision,reason);scheduleSnapshot(reason);
      }
      if(indexedDbUnavailable())currentState=normalizeState({...getCurrentState(),cards:[...getCurrentState().cards.filter(item=>item.id!==value.id),value]});
      if(card&&typeof card==='object')card.storageUpdatedAt=value.storageUpdatedAt;
      emitStatus('saved');return clone(value);
    }catch(error){
      error.outboxQueued=Boolean(outbox);
      emitStatus(outbox?'pending':'error',{pendingId:outbox?.id,message:error.message});
      if(error.code==='STALE_CARD_WRITE')globalThis.dispatchEvent?.(new CustomEvent('vocab:write-conflict',{detail:{code:error.code,message:error.message}}));
      throw error;
    }
  });
}

export async function persistCards(cards,reason='cards-replaced'){
  const migrated=stripEmbeddedReviewHistory(Array.isArray(cards)?cards:[]);
  return enqueueWrite(async()=>{
    emitStatus('saving');
    try{
      if(indexedDbUnavailable())writeFallbackState({cards:migrated.cards,reviewEvents:dedupeReviewEvents([...readFallbackReviewEvents(),...migrated.reviewEvents])});
      else{
        const database=await openDatabase();
        const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.reviewEvents,STORE_NAMES.meta],'readwrite');
        await replaceCards(migrated.cards,transaction);
        const eventsStore=transaction.objectStore(STORE_NAMES.reviewEvents);
        for(const event of migrated.reviewEvents)eventsStore.put(event);
        transaction.objectStore(STORE_NAMES.meta).put({key:'cardsUpdatedAt',value:Date.now()});
        const revision=await updateRevision(transaction,reason);
        await transactionDone(transaction);
        currentState=normalizeState({...getCurrentState(),cards:migrated.cards,revision});
        broadcastRevision(revision,reason);scheduleSnapshot(reason);
      }
      if(indexedDbUnavailable())currentState=normalizeState({...getCurrentState(),cards:migrated.cards});
      emitStatus('saved');return clone(migrated.cards);
    }catch(error){emitStatus('error',{message:error.message});throw error;}
  });
}

export async function persistCardsBatch(cards,reason='cards-batch-added'){
  const values=stripEmbeddedReviewHistory(Array.isArray(cards)?cards:[]).cards;
  return enqueueWrite(async()=>{
    emitStatus('saving');
    if(indexedDbUnavailable()){
      const merged=new Map(getCurrentState().cards.map(card=>[card.id,card]));for(const card of values)merged.set(card.id,card);
      const next=normalizeState({...getCurrentState(),cards:[...merged.values()]});writeFallbackState({cards:next.cards});currentState=next;emitStatus('saved',{durable:true,storage:'localStorage-degraded'});return clone(values);
    }
    try{
      const database=await openDatabase();
      const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.meta],'readwrite');
      const store=transaction.objectStore(STORE_NAMES.cards);for(const card of values)store.put(clone(card));
      const revision=await updateRevision(transaction,reason);await transactionDone(transaction);
      const merged=new Map(getCurrentState().cards.map(card=>[card.id,card]));for(const card of values)merged.set(card.id,card);
      currentState=normalizeState({...getCurrentState(),cards:[...merged.values()],revision});broadcastRevision(revision,reason);scheduleSnapshot(reason);emitStatus('saved');return clone(values);
    }catch(error){emitStatus('error',{message:error.message});throw error;}
  });
}

export async function deleteCard(cardId,reason='card-deleted'){
  const id=String(cardId||'');
  return enqueueWrite(async()=>{
    emitStatus('saving');
    try{
      if(indexedDbUnavailable()){
        const next=normalizeState({...getCurrentState(),cards:getCurrentState().cards.filter(card=>card.id!==id)});writeFallbackState({cards:next.cards});currentState=next;
      }else{
        const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.meta],'readwrite');
        transaction.objectStore(STORE_NAMES.cards).delete(id);const revision=await updateRevision(transaction,reason);await transactionDone(transaction);
        currentState=normalizeState({...getCurrentState(),cards:getCurrentState().cards.filter(card=>card.id!==id),revision});broadcastRevision(revision,reason);scheduleSnapshot(reason);
      }
      emitStatus('saved');return true;
    }catch(error){emitStatus('error',{message:error.message});throw error;}
  });
}

export async function persistSettings(settings){
  const value=settings&&typeof settings==='object'?clone(settings):{};
  return enqueueWrite(async()=>{
    emitStatus('saving');
    if(indexedDbUnavailable()){writeFallbackState({settings:value});currentState=normalizeState({...getCurrentState(),settings:value});emitStatus('saved');return clone(value);}
    try{
      const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.settings,STORE_NAMES.meta],'readwrite');
      await putSettingsDocument('app',value,transaction);const revision=await updateRevision(transaction,'settings-changed');await transactionDone(transaction);
      currentState=normalizeState({...getCurrentState(),settings:value,revision});broadcastRevision(revision,'settings-changed');scheduleSnapshot('settings-changed');emitStatus('saved');return clone(value);
    }catch(error){emitStatus('error',{message:error.message});throw error;}
  });
}

export async function persistFsrsConfig(config){
  const value=config&&typeof config==='object'?clone(config):{};
  return enqueueWrite(async()=>{
    emitStatus('saving');
    if(indexedDbUnavailable()){writeFallbackState({fsrsConfig:value});currentState=normalizeState({...getCurrentState(),fsrsConfig:value});emitStatus('saved');return clone(value);}
    try{
      const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.settings,STORE_NAMES.meta],'readwrite');
      await putSettingsDocument('fsrs',value,transaction);const revision=await updateRevision(transaction,'fsrs-config-changed');await transactionDone(transaction);
      currentState=normalizeState({...getCurrentState(),fsrsConfig:value,revision});broadcastRevision(revision,'fsrs-config-changed');scheduleSnapshot('fsrs-config-changed');emitStatus('saved');return clone(value);
    }catch(error){emitStatus('error',{message:error.message});throw error;}
  });
}

export async function persistMetrics(metrics){
  const value=normalizeMetrics(metrics||getCurrentState().metrics);
  return enqueueWrite(async()=>{
    if(indexedDbUnavailable()){writeFallbackState({metrics:value});currentState=normalizeState({...getCurrentState(),metrics:value});return clone(value);}
    const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.settings,STORE_NAMES.meta],'readwrite');
    await putSettingsDocument('metrics',value,transaction);const revision=await updateRevision(transaction,'metrics-changed');await transactionDone(transaction);
    currentState=normalizeState({...getCurrentState(),metrics:value,revision});broadcastRevision(revision,'metrics-changed');return clone(value);
  });
}

export async function persistReviewResult({card,event,metrics=null,reason='review-completed'}){
  if(!card?.id)throw new TypeError('persistReviewResult cần một card đã cập nhật.');
  const review=event?.cardId&&event?.id?clone(event):createReviewEvent(event||{});
  assertEvidenceReviewWrite({card,event:review});
  const createdAt=Date.now();
  const operation={id:`review:${review.id}`,type:'review',card:{...clone(card),storageBaseUpdatedAt:Number(card.storageUpdatedAt||0),storageUpdatedAt:createdAt},event:review,metrics:metrics?normalizeMetrics(metrics):null,reason,createdAt};
  return enqueueWrite(async()=>{
    emitStatus('saving');
    if(indexedDbUnavailable()){
      const existing=readFallbackReviewEvents().find(item=>item.id===review.id);
      if(existing){
        if(existing.evidenceDecision?.receiptBinding!==review.evidenceDecision?.receiptBinding)throw Object.assign(new Error('Receipt đã được dùng cho một EvidenceDecision khác.'),{code:'EVIDENCE_RECEIPT_COLLISION'});
        return{inserted:false,event:existing,reason:'localStorage-fallback'};
      }
      const cards=[...getCurrentState().cards.filter(item=>item.id!==card.id),clone(operation.card)];
      const events=dedupeReviewEvents([...readFallbackReviewEvents(),review]);
      const next={...getCurrentState(),cards,metrics:operation.metrics||getCurrentState().metrics};
      writeFallbackState({cards,reviewEvents:events,metrics:next.metrics});currentState=normalizeState(next);
      card.storageBaseUpdatedAt=operation.card.storageUpdatedAt;card.storageUpdatedAt=operation.card.storageUpdatedAt;
      emitStatus('saved',{durable:true,storage:'localStorage-degraded'});return{inserted:true,event:review,reason:'localStorage-fallback',durable:true,storage:'localStorage-degraded'};
    }
    let outbox=null;
    try{
      outbox=await queueOutbox(operation);
      const result=await applyReviewOperation(operation);
      try{await deleteOne(STORE_NAMES.outbox,outbox.id);}catch(error){console.warn('[persistence] Đã lưu lượt ôn nhưng chưa dọn được outbox',outbox.id,error);}
      if(result.inserted){
        const cards=[...getCurrentState().cards.filter(item=>item.id!==card.id),clone(operation.card)];
        currentState=normalizeState({...getCurrentState(),cards,metrics:operation.metrics||getCurrentState().metrics,revision:result.revision});
        broadcastRevision(result.revision,reason);scheduleSnapshot(reason);
      }else currentState=await readStateFromDatabase();
      const persistedCard=getCurrentState().cards.find(item=>item.id===card.id)||operation.card;
      if(card&&typeof card==='object'){card.storageBaseUpdatedAt=Number(persistedCard.storageUpdatedAt||0);card.storageUpdatedAt=Number(persistedCard.storageUpdatedAt||0);}
      emitStatus('saved');return result;
    }catch(error){
      if(['STALE_REVIEW_WRITE','EVIDENCE_RECEIPT_COLLISION'].includes(error.code)&&outbox)await deleteOne(STORE_NAMES.outbox,outbox.id).catch(()=>{});
      error.outboxQueued=Boolean(outbox&&!['STALE_REVIEW_WRITE','EVIDENCE_RECEIPT_COLLISION'].includes(error.code));
      emitStatus(error.outboxQueued?'pending':'error',{pendingId:error.outboxQueued?outbox.id:null,message:error.message});
      if(error.code==='STALE_REVIEW_WRITE')globalThis.dispatchEvent?.(new CustomEvent('vocab:write-conflict',{detail:{code:error.code,message:error.message}}));
      throw error;
    }
  });
}

export async function appendReviewEvent(input){
  void input;
  throw Object.assign(new Error('appendReviewEvent bị vô hiệu hóa; mọi schedule write phải đi qua EvidencePolicy gateway.'),{code:'EVIDENCE_GATEWAY_REQUIRED'});
}

export async function listReviewEvents({cardId=null,limit=0}={}){
  if(indexedDbUnavailable()){
    const events=readFallbackReviewEvents().filter(event=>!cardId||event.cardId===cardId);return limit>0?events.slice(-limit):events;
  }
  let events;
  if(cardId){
    const database=await openDatabase();const transaction=database.transaction(STORE_NAMES.reviewEvents,'readonly');
    events=await requestResult(transaction.objectStore(STORE_NAMES.reviewEvents).index('cardId').getAll(cardId));await transactionDone(transaction);
  }else events=await getAll(STORE_NAMES.reviewEvents);
  events.sort((a,b)=>Number(a.reviewedAt||0)-Number(b.reviewedAt||0));return limit>0?events.slice(-limit):events;
}

export async function createAutomaticSnapshot(reason='automatic'){
  if(indexedDbUnavailable())return null;
  return enqueueWrite(async()=>{
    const[state,reviewEvents]=await Promise.all([readStateFromDatabase(),listReviewEvents()]);
    const snapshot=compactSnapshot({...state,reviewEvents,reason,createdAt:Date.now(),revision:state.revision});
    const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.snapshots,STORE_NAMES.meta],'readwrite');
    const store=transaction.objectStore(STORE_NAMES.snapshots);store.put(snapshot);
    const all=await requestResult(store.index('createdAt').getAll());for(const old of all.sort((a,b)=>b.createdAt-a.createdAt).slice(30))store.delete(old.id);
    transaction.objectStore(STORE_NAMES.meta).put({key:'lastSnapshotAt',value:snapshot.createdAt});await transactionDone(transaction);return snapshot;
  });
}

export async function listSnapshots(){
  if(indexedDbUnavailable())return[];
  const snapshots=await getAll(STORE_NAMES.snapshots);return snapshots.sort((a,b)=>b.createdAt-a.createdAt);
}

export async function restoreSnapshot(snapshotId){
  if(indexedDbUnavailable())throw new Error('Snapshot chỉ khả dụng với IndexedDB.');
  const snapshot=await getOne(STORE_NAMES.snapshots,snapshotId);if(!snapshot)throw new Error('Không tìm thấy snapshot.');
  const input=buildBackupDocument({cards:snapshot.cards,settings:snapshot.settings,fsrsConfig:snapshot.fsrsConfig,metrics:snapshot.metrics,reviewEvents:snapshot.reviewEvents||[]});
  const {restoreCoreBackupSafely}=await import('./ielts-backup.js');
  return restoreCoreBackupSafely(input);
}

export async function exportBackupPackage(){
  if(indexedDbUnavailable())return buildBackupDocument({...readFallbackState(),reviewEvents:readFallbackReviewEvents()});
  const[state,reviewEvents,metaRows]=await Promise.all([readStateFromDatabase(),listReviewEvents(),getAll(STORE_NAMES.meta)]);
  return buildBackupDocument({...state,reviewEvents,meta:Object.fromEntries(metaRows.map(row=>[row.key,row.value??row]))});
}

export async function buildCoreBackupStores({restoreToken=null}={}){
  if(indexedDbUnavailable()){
    const state=readFallbackState();
    return{
      [STORE_NAMES.cards]:clone(state.cards),
      [STORE_NAMES.settings]:[
        {key:'app',value:clone(state.settings)},
        {key:'fsrs',value:clone(state.fsrsConfig)},
        {key:'metrics',value:clone(state.metrics)}
      ],
      [STORE_NAMES.reviewEvents]:clone(readFallbackReviewEvents()),
      [STORE_NAMES.snapshots]:[],
      [STORE_NAMES.meta]:[],
      [STORE_NAMES.outbox]:[],
      [STORE_NAMES.captureDrafts]:clone(await listCaptureDrafts())
    };
  }
  if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);
  const database=await openDatabase();
  const physicalStores=[...database.objectStoreNames];
  const expectedStores=Object.values(STORE_NAMES);
  const unknown=physicalStores.filter(name=>!expectedStores.includes(name));
  const missing=expectedStores.filter(name=>!physicalStores.includes(name));
  if(unknown.length||missing.length)throw Object.assign(new Error(`Core store registry mismatch (missing: ${missing.join(',')||'none'}; unknown: ${unknown.join(',')||'none'}).`),{code:'BACKUP_STORE_REGISTRY_MISMATCH'});
  const names=[STORE_NAMES.cards,STORE_NAMES.settings,STORE_NAMES.reviewEvents,STORE_NAMES.snapshots,STORE_NAMES.meta,STORE_NAMES.outbox,STORE_NAMES.captureDrafts];
  const transaction=database.transaction(names,'readonly');
  const entries=await Promise.all(names.map(async name=>[name,clone(await requestResult(transaction.objectStore(name).getAll()))]));
  await transactionDone(transaction);
  const stores=Object.fromEntries(entries);
  stores[STORE_NAMES.meta]=stores[STORE_NAMES.meta].filter(row=>!OPERATIONAL_META_KEYS.has(String(row?.key||'')));
  return stores;
}

export async function readCoreRestoreJournal(){if(indexedDbUnavailable())throw durableStorageUnavailable(DB_NAME);return clone(await getOne(STORE_NAMES.meta,CORE_RESTORE_JOURNAL_KEY));}

export async function reopenCoreDatabase({restoreToken=null}={}){if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);if(databasePromise){const database=await databasePromise.catch(()=>null);database?.close();databasePromise=null;}const database=await openDatabase();if(initialized)currentState=await readStateFromDatabase();return database;}

export async function downloadBackupFile(){
  const {buildCombinedBackup}=await import('./ielts-backup.js');const backup=await buildCombinedBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const link=document.createElement('a');
  const scope=backup.restoreScope==='core-only'?'core-degraded':'full';link.href=URL.createObjectURL(blob);link.download=`vocab-master-${scope}-v${backup.schemaVersion}-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  if(!indexedDbUnavailable())await putOne(STORE_NAMES.meta,{key:'lastManualBackupAt',value:Date.now()});return backup;
}

async function writeBackupToHandle(handle){
  if(!handle)return{written:false,reason:'missing-handle'};const permission=await handle.queryPermission?.({mode:'readwrite'});if(permission!=='granted')return{written:false,reason:'permission-required'};
  const {buildCombinedBackup}=await import('./ielts-backup.js');const writable=await handle.createWritable();await writable.write(JSON.stringify(await buildCombinedBackup(),null,2));await writable.close();await putOne(STORE_NAMES.meta,{key:'lastAutomaticFileBackupAt',value:Date.now()});return{written:true};
}

export async function chooseAutomaticBackupFile(){
  if(typeof showSaveFilePicker!=='function')return{configured:false,reason:'unsupported'};
  const handle=await showSaveFilePicker({suggestedName:'vocab-master-auto-backup.json',types:[{description:'Vocab Master JSON backup',accept:{'application/json':['.json']}}]});
  const permission=await handle.requestPermission({mode:'readwrite'});if(permission!=='granted')return{configured:false,reason:'permission-denied'};
  await putOne(STORE_NAMES.fileHandles,{key:'automaticBackup',handle,configuredAt:Date.now()});await writeBackupToHandle(handle);return{configured:true,name:handle.name};
}

export async function writeAutomaticBackupFile(){
  if(indexedDbUnavailable())return{written:false,reason:'indexeddb-unavailable'};const row=await getOne(STORE_NAMES.fileHandles,'automaticBackup');if(!row?.handle)return{written:false,reason:'not-configured'};
  try{return await writeBackupToHandle(row.handle);}catch(error){return{written:false,reason:error?.message||'write-failed'};}
}

async function replaceAllData(data,reason){
  const state=normalizeState(data);const events=dedupeReviewEvents(data.reviewEvents||[]);
  if(indexedDbUnavailable()){writeFallbackState({...state,reviewEvents:events,initialized:true});currentState=state;return clone(state);}
  const database=await openDatabase();const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.settings,STORE_NAMES.reviewEvents,STORE_NAMES.meta,STORE_NAMES.outbox],'readwrite');
  await replaceCards(state.cards,transaction);await putSettingsDocument('app',state.settings,transaction);await putSettingsDocument('fsrs',state.fsrsConfig,transaction);await putSettingsDocument('metrics',state.metrics,transaction);
  const eventsStore=transaction.objectStore(STORE_NAMES.reviewEvents);eventsStore.clear();for(const event of events)eventsStore.put(event);transaction.objectStore(STORE_NAMES.outbox).clear();await markInitialized(transaction,reason);
  const revision=await updateRevision(transaction,reason);await transactionDone(transaction);currentState=normalizeState({...state,revision});broadcastRevision(revision,reason);return clone(currentState);
}

export async function restoreBackupDocument(input){
  const {restoreCoreBackupSafely}=await import('./ielts-backup.js');
  return restoreCoreBackupSafely(input);
}

export async function restoreBackupFile(file){
  if(!file||Number(file.size||0)>100*1024*1024)throw new Error('File backup vượt quá giới hạn 100 MB.');
  const text=await file.text();let parsed;try{parsed=JSON.parse(text);}catch{throw new Error('File backup không phải JSON hợp lệ.');}
  const safety=await import('./ielts-backup.js');if(['vocab-master-full','combined-core-ielts',safety.DEGRADED_CORE_BACKUP_KIND].includes(parsed?.kind))return safety.restoreCombinedBackup(parsed);
  return safety.restoreCoreBackupSafely(parsed);
}

export async function resetLearningProgressNow(){
  const state=currentState||await initializePersistence();if(!indexedDbUnavailable())await createAutomaticSnapshot('before-learning-reset');
  return enqueueWrite(async()=>replaceAllData({...state,cards:resetLearningProgress(state.cards),metrics:{...normalizeMetrics(state.metrics),dailyDate:'',dailyDone:0,dailyTarget:0,studyMinutes:0,completedReviews:0},reviewEvents:[]},'learning-progress-reset'));
}

export async function getPersistenceStatus(){
  if(indexedDbUnavailable()){
    if(!NATIVE_STORAGE)return{available:false,storage:'unavailable',durable:false,degraded:true,cards:getCurrentState().cards.length,persistent:false,pendingWrites:0};
    return{available:true,storage:'localStorage-degraded',durable:true,degraded:true,cards:getCurrentState().cards.length,persistent:false,pendingWrites:0};
  }
  const[cards,events,snapshots,lastSnapshot,lastFileBackup,handle,outbox,persisted,estimate]=await Promise.all([
    getAll(STORE_NAMES.cards),getAll(STORE_NAMES.reviewEvents),getAll(STORE_NAMES.snapshots),getOne(STORE_NAMES.meta,'lastSnapshotAt'),getOne(STORE_NAMES.meta,'lastAutomaticFileBackupAt'),getOne(STORE_NAMES.fileHandles,'automaticBackup'),getAll(STORE_NAMES.outbox),globalThis.navigator?.storage?.persisted?.().catch(()=>false)??false,globalThis.navigator?.storage?.estimate?.().catch(()=>({}))??{}
  ]);
  return{
    available:true,storage:'IndexedDB',durable:true,degraded:false,cards:cards.length,reviewEvents:events.length,snapshots:snapshots.length,pendingWrites:outbox.filter(row=>row.status!=='quarantined').length,quarantinedWrites:outbox.filter(row=>row.status==='quarantined').length,persistent:Boolean(persisted),usage:Number(estimate?.usage||0),quota:Number(estimate?.quota||0),
    lastSnapshotAt:Number(lastSnapshot?.value||0),lastAutomaticFileBackupAt:Number(lastFileBackup?.value||0),automaticFileConfigured:Boolean(handle?.handle),automaticFileName:handle?.handle?.name||null
  };
}

function formatTimestamp(value){return value?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'chưa có';}
function formatBytes(value){const bytes=Number(value||0);if(bytes<1024)return`${bytes} B`;if(bytes<1024**2)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1024**2).toFixed(1)} MB`;}

export async function mountPersistenceUI(){
  const section=document.querySelector('#dataProtectionSettings');if(!section||section.dataset.mounted==='true')return;section.dataset.mounted='true';
  const statusNode=section.querySelector('#persistenceStatus');const setStatus=(message,tone='neutral')=>{if(statusNode){statusNode.textContent=message;statusNode.dataset.tone=tone;}};
  let snapshotHost=section.querySelector('#snapshotList');if(!snapshotHost){snapshotHost=document.createElement('div');snapshotHost.id='snapshotList';snapshotHost.className='snapshot-list';section.append(snapshotHost);}
  const refresh=async()=>{
    try{
      const[status,snapshots]=await Promise.all([getPersistenceStatus(),listSnapshots()]);
      setStatus(status.storage==='localStorage-degraded'
        ?`${status.cards} mục · localStorage degraded đã được ghi và read-back; không có RAM-only success · trình duyệt vẫn có thể dọn dữ liệu`
        :status.available
        ?`${status.cards} mục · ${status.reviewEvents} lượt ôn · ${status.snapshots} snapshot · ${status.pendingWrites} ghi chờ · ${status.quarantinedWrites||0} ghi cách ly cần kiểm tra · ${status.persistent?'bộ nhớ bền vững':'trình duyệt có thể dọn dữ liệu'} · ${formatBytes(status.usage)}/${formatBytes(status.quota)} · snapshot gần nhất: ${formatTimestamp(status.lastSnapshotAt)}${status.automaticFileConfigured?` · auto backup: ${status.automaticFileName}`:''}`
        :'Không có durable storage khả dụng; thay đổi chưa được lưu và sẽ báo lỗi.',status.pendingWrites||status.quarantinedWrites||!status.durable?'error':status.degraded?'neutral':'success');
      snapshotHost.innerHTML=snapshots.slice(0,5).map(item=>`<button type="button" class="snapshot-row" data-snapshot-id="${item.id}"><span>${formatTimestamp(item.createdAt)} · ${item.reason}</span><small>${item.cards?.length||0} thẻ · ${item.reviewEvents?.length||0} lượt ôn</small></button>`).join('')||'<p class="muted">Chưa có snapshot.</p>';
      snapshotHost.querySelectorAll('[data-snapshot-id]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('Khôi phục snapshot này qua journal an toàn và kiểm chứng read-back?'))return;try{await restoreSnapshot(button.dataset.snapshotId);location.reload();}catch(error){setStatus(error.message,'error');}}));
    }catch(error){setStatus(error.message,'error');}
  };
  section.querySelector('#requestPersistentStorage')?.addEventListener('click',async()=>{try{const result=await requestPersistentStorage();const granted=Boolean(result?.persisted);setStatus(granted?'Trình duyệt đã cấp bộ nhớ bền vững.':result?.supported===false?'Trình duyệt này không hỗ trợ yêu cầu bộ nhớ bền vững.':'Trình duyệt chưa cấp bộ nhớ bền vững; hãy duy trì backup định kỳ.',granted?'success':'neutral');await refresh();}catch(error){setStatus(error.message,'error');}});
  section.querySelector('#downloadFullBackup')?.addEventListener('click',async()=>{try{await downloadBackupFile();await refresh();}catch(error){setStatus(error.message,'error');}});
  section.querySelector('#chooseAutoBackup')?.addEventListener('click',async()=>{try{const result=await chooseAutomaticBackupFile();if(!result.configured&&result.reason==='unsupported')throw new Error('Trình duyệt này chưa hỗ trợ tự ghi vào file. Bạn vẫn có thể tải backup thủ công.');await refresh();}catch(error){setStatus(error.message,'error');}});
  section.querySelector('#resetLearningProgress')?.addEventListener('click',async()=>{if(!confirm('Đặt lại toàn bộ lịch FSRS, streak, số phút và lịch sử ôn? Một snapshot sẽ được tạo trước; từ vựng và cài đặt vẫn được giữ.'))return;await resetLearningProgressNow();location.reload();});
  const restoreInput=section.querySelector('#restoreBackupInput');section.querySelector('#restoreFullBackup')?.addEventListener('click',()=>restoreInput?.click());
  restoreInput?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;if(!confirm('Khôi phục sẽ thay thế dữ liệu trong backup. Hệ thống sẽ stage, journal, rollback khi lỗi và kiểm chứng read-back trước khi báo thành công. Tiếp tục?'))return;try{const result=await restoreBackupFile(file);if(result.warnings?.length)alert(`Khôi phục thành công với cảnh báo:\n${result.warnings.slice(0,10).join('\n')}`);location.reload();}catch(error){setStatus(error.message,'error');}});
  await refresh();
}

export const __testing=Object.freeze({requestResult,transactionDone,getAll,getOne,putOne,readStateFromDatabase,migrateLegacyState,adoptExistingDatabase,normalizeMetrics,normalizeState,replayOutbox,databaseHasContent});

if(typeof window!=='undefined')window.VocabMasterPersistence={
  initializePersistence,getCurrentState,downloadBackupFile,listReviewEvents,listSnapshots,restoreSnapshot,getPersistenceStatus,persistCard,persistCards,persistCardsBatch,deleteCard,persistSettings,persistFsrsConfig,persistMetrics,persistReviewResult,resetLearningProgressNow
};

async function applyImportBatchOperation(operation){
  const database=await openDatabase();
  const transaction=database.transaction([STORE_NAMES.cards,STORE_NAMES.meta],'readwrite');
  const store=transaction.objectStore(STORE_NAMES.cards);
  for(const card of operation.cards){
    const existing=await requestResult(store.get(card.id));
    const expected=Number(card.storageBaseUpdatedAt||0);const actual=Number(existing?.storageUpdatedAt||0);
    if(existing&&expected&&actual!==expected){transaction.abort();const error=new Error('Import dựa trên phiên bản thẻ cũ. Tải lại trước khi merge.');error.code='STALE_IMPORT_WRITE';throw error;}
    store.put(clone(card));
  }
  const revision=await updateRevision(transaction,operation.reason||'import-atomic');await transactionDone(transaction);return revision;
}

export async function persistImportBatch({cards=[],updates=[]}={},reason='import-atomic'){
  const stamp=Date.now();
  const values=[...cards,...updates].map((card,index)=>({...clone(card),storageBaseUpdatedAt:Number(card?.storageUpdatedAt||0),storageUpdatedAt:stamp+index}));
  return enqueueWrite(async()=>{
    if(indexedDbUnavailable()){const merged=new Map(getCurrentState().cards.map(card=>[card.id,card]));for(const card of values)merged.set(card.id,card);const next=normalizeState({...getCurrentState(),cards:[...merged.values()]});writeFallbackState({cards:next.cards});currentState=next;return clone(values);}
    const operation={id:'import:'+stamp,type:'import-batch',cards:values,reason,createdAt:stamp};let outbox=null;
    try{
      outbox=await queueOutbox(operation);const revision=await applyImportBatchOperation(operation);await deleteOne(STORE_NAMES.outbox,outbox.id);
      const merged=new Map(getCurrentState().cards.map(card=>[card.id,card]));for(const card of values)merged.set(card.id,card);
      currentState=normalizeState({...getCurrentState(),cards:[...merged.values()],revision});broadcastRevision(revision,reason);scheduleSnapshot(reason);emitStatus('saved');return clone(values);
    }catch(error){
      if(error.code==='STALE_IMPORT_WRITE'&&outbox)await deleteOne(STORE_NAMES.outbox,outbox.id).catch(()=>{});
      error.outboxQueued=Boolean(outbox&&error.code!=='STALE_IMPORT_WRITE');emitStatus(error.outboxQueued?'pending':'error',{pendingId:error.outboxQueued?outbox.id:null,message:error.message});
      if(error.code==='STALE_IMPORT_WRITE')globalThis.dispatchEvent?.(new CustomEvent('vocab:write-conflict',{detail:{code:error.code,message:error.message}}));throw error;
    }
  });
}

export async function listCaptureDrafts(){
  if(indexedDbUnavailable())return readFallbackCaptureDrafts();
  return(await getAll(STORE_NAMES.captureDrafts)).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
}
export async function persistCaptureDraft(draft,{restoreToken=null}={}){
  const value={id:String(draft?.id||('draft-'+Date.now()+'-'+Math.random().toString(36).slice(2,8))),term:String(draft?.term||'').trim(),sourceContext:String(draft?.sourceContext||'').trim(),sourceLabel:String(draft?.sourceLabel||'').trim(),meaning:String(draft?.meaning||'').trim(),status:String(draft?.status||'captured'),createdAt:Number(draft?.createdAt||Date.now()),updatedAt:Date.now()};
  return withDurableWriteLock(async()=>{
    if(indexedDbUnavailable()){const rows=await listCaptureDrafts();writeVerifiedFallbackEntries([[CAPTURE_DRAFTS_FALLBACK_KEY,JSON.stringify([value,...rows.filter(row=>row.id!==value.id)])]]);return value;}
    await putOne(STORE_NAMES.captureDrafts,value,{restoreToken});
    const stored=await getOne(STORE_NAMES.captureDrafts,value.id);
    if(JSON.stringify(stored)!==JSON.stringify(value))throw Object.assign(new Error('Capture draft commit xong nhưng read-back không khớp.'),{code:'DURABLE_CAPTURE_VERIFY_FAILED',durable:false,draftId:value.id});
    return value;
  },restoreToken);
}
export async function deleteCaptureDraft(id,{restoreToken=null}={}){
  return withDurableWriteLock(async()=>{
    if(indexedDbUnavailable()){const rows=await listCaptureDrafts();writeVerifiedFallbackEntries([[CAPTURE_DRAFTS_FALLBACK_KEY,JSON.stringify(rows.filter(row=>row.id!==id))]]);return true;}
    await deleteOne(STORE_NAMES.captureDrafts,String(id),{restoreToken});
    if(await getOne(STORE_NAMES.captureDrafts,String(id)))throw Object.assign(new Error('Capture draft vẫn tồn tại sau delete commit.'),{code:'DURABLE_CAPTURE_DELETE_VERIFY_FAILED',durable:false,draftId:String(id)});
    return true;
  },restoreToken);
}
