import { V10_DB_NAME,V10_DB_VERSION,V10_STORES } from './v10-contracts.js';
import { sha256Hex } from './backup-registry.js';
import { databaseBlocked,durableStorageUnavailable,normalizeDatabaseOpenError } from './storage-safety.js';
import { assertActiveRestoreToken,withDurableWriteLock } from './storage-lock.js';

const STORE_LIST=Object.freeze(Object.values(V10_STORES));
let databasePromise=null;
let writeQueue=Promise.resolve();
let channel=null;
const memory=new Map(STORE_LIST.map(name=>[name,new Map()]));

const clone=value=>value==null?value:structuredClone(value);
const indexedDbUnavailable=()=>typeof indexedDB==='undefined';
const requestResult=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));});
const transactionDone=transaction=>new Promise((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));});
const enqueue=(task,{restoreToken=null}={})=>{if(restoreToken)return withDurableWriteLock(task,restoreToken);const locked=()=>withDurableWriteLock(task);const run=writeQueue.then(locked,locked);writeQueue=run.catch(()=>{});return run;};
const assertStore=name=>{if(!STORE_LIST.includes(name))throw new Error(`V10 store không hợp lệ: ${name}`);return name;};

function createIndexes(name,store){
  if(name===V10_STORES.sourceOccurrences){store.createIndex('lexicalItemId','lexicalItemId',{unique:false});store.createIndex('sourceId','sourceId',{unique:false});store.createIndex('encounteredAt','encounteredAt',{unique:false});}
  if(name===V10_STORES.captureCandidates){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});store.createIndex('duplicateOfCardId','duplicateOfCardId',{unique:false});}
  if(name===V10_STORES.collections){store.createIndex('kind','kind',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(name===V10_STORES.collectionMemberships){store.createIndex('collectionId','collectionId',{unique:false});store.createIndex('lexicalItemId','lexicalItemId',{unique:false});store.createIndex('uniqueKey','uniqueKey',{unique:true});}
  if(name===V10_STORES.lexicalTombstones){store.createIndex('lexicalItemId','lexicalItemId',{unique:true});store.createIndex('deletedAt','deletedAt',{unique:false});}
  if(name===V10_STORES.activities){store.createIndex('status','status',{unique:false});store.createIndex('dueAt','dueAt',{unique:false});store.createIndex('type','type',{unique:false});}
  if(name===V10_STORES.sentenceProgress){store.createIndex('sourceId','sourceId',{unique:false});store.createIndex('step','step',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(name===V10_STORES.transcriptCache){store.createIndex('videoId','videoId',{unique:false});store.createIndex('cacheKey','cacheKey',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(name===V10_STORES.contentManifests){store.createIndex('qualityStatus','qualityStatus',{unique:false});store.createIndex('topic','topic',{unique:false});store.createIndex('level','level',{unique:false});}
  if(name===V10_STORES.contentAssets){store.createIndex('lessonId','lessonId',{unique:false});store.createIndex('assetType','assetType',{unique:false});store.createIndex('lastAccessedAt','lastAccessedAt',{unique:false});}
  if(name===V10_STORES.contentProgress){store.createIndex('lessonId','lessonId',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(name===V10_STORES.aiJobs){store.createIndex('status','status',{unique:false});store.createIndex('jobType','jobType',{unique:false});store.createIndex('dueBefore','dueBefore',{unique:false});}
  if(name===V10_STORES.coachingStats){store.createIndex('category','category',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(name===V10_STORES.meta){store.createIndex('updatedAt','updatedAt',{unique:false});}
}

export function openV10Database(){
  if(databasePromise)return databasePromise;
  if(indexedDbUnavailable())return Promise.reject(durableStorageUnavailable(V10_DB_NAME));
  databasePromise=new Promise((resolve,reject)=>{
    let blocked=false;
    const request=indexedDB.open(V10_DB_NAME,V10_DB_VERSION);
    request.onupgradeneeded=()=>{
      const database=request.result;
      for(const name of STORE_LIST){
        if(database.objectStoreNames.contains(name))continue;
        const store=database.createObjectStore(name,{keyPath:name===V10_STORES.meta?'key':'id'});
        createIndexes(name,store);
      }
    };
    request.onsuccess=()=>{const database=request.result;if(blocked){database.close();return;}database.onversionchange=()=>{database.close();databasePromise=null;};resolve(database);};
    request.onerror=()=>{const error=normalizeDatabaseOpenError(request.error,{database:V10_DB_NAME,supportedVersion:V10_DB_VERSION});databasePromise=null;reject(error);};
    request.onblocked=()=>{blocked=true;databasePromise=null;reject(databaseBlocked(V10_DB_NAME));};
  });
  return databasePromise;
}

async function withStore(storeName,mode,callback){
  assertStore(storeName);const database=await openV10Database();
  if(!database)return callback(null,memory.get(storeName),null);
  const transaction=database.transaction(storeName,mode);const store=transaction.objectStore(storeName);const result=await callback(store,null,transaction);await transactionDone(transaction);return result;
}

function initializeChannel(){
  if(channel||typeof BroadcastChannel==='undefined')return;
  channel=new BroadcastChannel('vocab-master-v10-data-v1');channel.unref?.();
  channel.addEventListener('message',event=>{if(event.data?.type==='changed')globalThis.dispatchEvent?.(new CustomEvent('vocab:v10-external-change',{detail:event.data}));});
}
function broadcast(reason,stores=[]){const detail={type:'changed',reason,stores,revision:Date.now()*1000+Math.floor(Math.random()*1000)};channel?.postMessage(detail);globalThis.dispatchEvent?.(new CustomEvent('vocab:v10-data-saved',{detail}));return detail.revision;}

export async function initializeV10Persistence(){
  initializeChannel();await openV10Database();
  const counts={};for(const name of STORE_LIST)counts[name]=(await listV10Records(name)).length;
  await putV10Record(V10_STORES.meta,{key:'schema',version:V10_DB_VERSION,updatedAt:Date.now()},'v10-schema-ready');
  return{database:V10_DB_NAME,version:V10_DB_VERSION,counts};
}

export async function listV10Records(storeName,{index=null,query=null,sortBy='updatedAt',descending=true,limit=0}={}){
  const name=assertStore(storeName);const rows=await withStore(name,'readonly',async(store,map)=>{
    if(map)return[...map.values()].map(clone);
    if(index){const source=store.index(index);return requestResult(query==null?source.getAll():source.getAll(query));}
    return requestResult(store.getAll());
  });
  if(sortBy)rows.sort((a,b)=>{const av=Number(a?.[sortBy]||0),bv=Number(b?.[sortBy]||0);return descending?bv-av:av-bv;});
  return limit>0?rows.slice(0,limit):rows;
}

export async function getV10Record(storeName,key){return withStore(assertStore(storeName),'readonly',async(store,map)=>map?clone(map.get(key)):requestResult(store.get(key)));}

export async function putV10Record(storeName,value,reason='v10-record-saved'){
  const name=assertStore(storeName);const row={...clone(value),updatedAt:Number(value?.updatedAt||Date.now())};const key=name===V10_STORES.meta?row.key:row.id;if(!key)throw new Error(`${name} thiếu khóa.`);
  return enqueue(async()=>{await withStore(name,'readwrite',async(store,map)=>{if(map)map.set(key,clone(row));else store.put(clone(row));});broadcast(reason,[name]);return clone(row);});
}

export async function putV10Records(storeName,values,reason='v10-records-saved'){
  const name=assertStore(storeName);const rows=(Array.isArray(values)?values:[]).map(value=>({...clone(value),updatedAt:Number(value?.updatedAt||Date.now())}));
  return enqueue(async()=>{await withStore(name,'readwrite',async(store,map)=>{for(const row of rows){const key=name===V10_STORES.meta?row.key:row.id;if(!key)throw new Error(`${name} thiếu khóa.`);if(map)map.set(key,clone(row));else store.put(clone(row));}});broadcast(reason,[name]);return clone(rows);});
}

export async function deleteV10Record(storeName,key,reason='v10-record-deleted'){
  const name=assertStore(storeName);return enqueue(async()=>{await withStore(name,'readwrite',async(store,map)=>{if(map)map.delete(key);else store.delete(key);});broadcast(reason,[name]);return true;});
}

export async function clearV10Store(storeName,reason='v10-store-cleared'){
  const name=assertStore(storeName);return enqueue(async()=>{await withStore(name,'readwrite',async(store,map)=>{if(map)map.clear();else store.clear();});broadcast(reason,[name]);return true;});
}

export async function transactV10(storeNames,callback,reason='v10-transaction'){
  const names=[...new Set(storeNames.map(assertStore))];const database=await openV10Database();
  if(!database){const adapters=Object.fromEntries(names.map(name=>[name,memory.get(name)]));const result=await callback({memory:adapters,stores:{}});broadcast(reason,names);return result;}
  return enqueue(async()=>{const transaction=database.transaction(names,'readwrite');const stores=Object.fromEntries(names.map(name=>[name,transaction.objectStore(name)]));const result=await callback({transaction,stores,memory:null,requestResult});await transactionDone(transaction);broadcast(reason,names);return result;});
}

export async function estimateV10Storage(){
  const estimate=await globalThis.navigator?.storage?.estimate?.().catch(()=>null);return estimate?{usage:Number(estimate.usage||0),quota:Number(estimate.quota||0),ratio:estimate.quota?Number(estimate.usage||0)/Number(estimate.quota):0}:{usage:0,quota:0,ratio:0};
}

export async function requestV10PersistentStorage(){
  if(!globalThis.navigator?.storage?.persist)return{supported:false,persisted:false};const already=await globalThis.navigator.storage.persisted?.().catch(()=>false);const persisted=already||await globalThis.navigator.storage.persist().catch(()=>false);return{supported:true,persisted};
}

export async function reopenV10Database({restoreToken=null}={}){if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);if(databasePromise){const database=await databasePromise.catch(()=>null);database?.close();databasePromise=null;}return openV10Database();}

export async function buildV10BackupStores({restoreToken=null}={}){
  if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);
  let stores;
  const database=await openV10Database();
  const names=STORE_LIST.filter(name=>name!==V10_STORES.coachingStats);
  if(!database)stores=Object.fromEntries(names.map(name=>[name,[...memory.get(name).values()].map(clone)]));
  else{
    const physicalStores=[...database.objectStoreNames];
    const unknown=physicalStores.filter(name=>!STORE_LIST.includes(name));
    const missing=STORE_LIST.filter(name=>!physicalStores.includes(name));
    if(unknown.length||missing.length)throw Object.assign(new Error(`V10 store registry mismatch (missing: ${missing.join(',')||'none'}; unknown: ${unknown.join(',')||'none'}).`),{code:'BACKUP_STORE_REGISTRY_MISMATCH'});
    const transaction=database.transaction(names,'readonly');
    stores=Object.fromEntries(await Promise.all(names.map(async name=>[name,await requestResult(transaction.objectStore(name).getAll())])));
    await transactionDone(transaction);
  }
  stores[V10_STORES.meta]=(stores[V10_STORES.meta]||[]).filter(row=>!['schema','content-catalog'].includes(String(row?.key||'')));
  stores[V10_STORES.transcriptCache]=(stores[V10_STORES.transcriptCache]||[]).map(backupTranscriptRecord);
  stores[V10_STORES.contentAssets]=(stores[V10_STORES.contentAssets]||[]).map(backupContentAssetRecord);
  return stores;
}

const RECONSTRUCTABLE_TRANSCRIPT_PROVIDERS=new Set(['indexeddb','shared-cache','local-companion','backend-provider','gemini-progressive']);
function canonicalJson(value,seen=new Set(),depth=0){
  if(depth>100)throw new Error('V10 backup record vuot gioi han do sau JSON-safe.');
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'){if(!Number.isFinite(value))throw new Error('V10 backup record chua so khong huu han.');return JSON.stringify(value);}
  if(typeof value!=='object')throw new Error(`V10 backup record chua kieu khong JSON-safe: ${typeof value}.`);
  if(seen.has(value))throw new Error('V10 backup record chua tham chieu vong.');seen.add(value);
  if(Array.isArray(value)){const result=`[${value.map(item=>canonicalJson(item,seen,depth+1)).join(',')}]`;seen.delete(value);return result;}
  const prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null)throw new Error('V10 backup record chua object khong JSON-safe.');
  const result=`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(value[key],seen,depth+1)}`).join(',')}}`;seen.delete(value);return result;
}
function backupTranscriptRecord(row={}){
  if(row.backupRepresentation==='reconstructable-cache-stub-v1'&&!Object.hasOwn(row,'segments'))return clone(row);
  if(row.provider==='imported'||!RECONSTRUCTABLE_TRANSCRIPT_PROVIDERS.has(row.provider))return clone(row);
  const segments=Array.isArray(row.segments)?row.segments:[];
  const {segments:ignored,...stub}=clone(row);
  return{...stub,backupRepresentation:'reconstructable-cache-stub-v1',segmentCount:segments.length,segmentsDigest:`sha256:${sha256Hex(canonicalJson(segments))}`};
}
function backupContentAssetRecord(row={}){
  const personal=String(row.license||'').startsWith('private')||row.provenance?.scope==='private'||String(row.id||'').startsWith('personal:')||String(row.lessonId||'').startsWith('personal-');
  if(personal||!row.url)return clone(row);
  const {data,...stub}=clone(row);
  return{...stub,backupRepresentation:'remote-cache-stub-v1',...(data===undefined?{}:{dataDigest:`sha256:${sha256Hex(canonicalJson(data))}`})};
}
