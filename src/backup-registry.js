import { DB_NAME,DB_VERSION,STORE_NAMES } from './persistence.js';
import { IELTS_DB_NAME,IELTS_DB_VERSION } from './ielts-persistence.js';
import { IELTS_STORE_NAMES } from './ielts-domain.js';
import { V10_DB_NAME,V10_DB_VERSION,V10_STORES } from './v10-contracts.js';

export const FULL_BACKUP_KIND='vocab-master-full';
export const FULL_BACKUP_VERSION=2;
export const BACKUP_REGISTRY_VERSION=1;
export const BACKUP_CLASSIFICATIONS=Object.freeze(['durable','reconstructable-cache','ephemeral']);

const MAX_DEPTH=100;
const MAX_RECORDS_PER_STORE=100_000;
const MAX_RECORD_BYTES=10*1024*1024;
const MAX_PAYLOAD_BYTES=100*1024*1024;
const entry=(owner,database,databaseVersion,store,keyPath,classification,backupRule,note)=>Object.freeze({
  owner,database,databaseVersion,store,keyPath,classification,backupRule,
  restoreRule:backupRule==='exclude'?'exclude':backupRule==='include'?'stage-replace-verify':'stage-transform-replace-verify',note
});

const core=(store,classification='durable',backupRule='include',note='Core learner state.')=>entry('core',DB_NAME,DB_VERSION,store,['settings','meta','fileHandles'].includes(store)?'key':'id',classification,backupRule,note);
const ielts=store=>entry('ielts',IELTS_DB_NAME,IELTS_DB_VERSION,store,store===IELTS_STORE_NAMES.settings?'key':'id','durable','include','IELTS learner record, draft, job, transcript or settings data.');
const v10=(store,classification='durable',backupRule='include',note='V10 learner data or durable workflow state.')=>entry('v10',V10_DB_NAME,V10_DB_VERSION,store,store===V10_STORES.meta?'key':'id',classification,backupRule,note);

export const BACKUP_STORE_REGISTRY=Object.freeze([
  core(STORE_NAMES.cards,'durable','include','Learner-authored lexical records and schedules.'),
  core(STORE_NAMES.settings,'durable','include','Application, FSRS, metrics and future settings documents.'),
  core(STORE_NAMES.reviewEvents,'durable','include','Canonical learning evidence history.'),
  core(STORE_NAMES.snapshots,'durable','include','Bounded user-visible recovery history.'),
  core(STORE_NAMES.meta,'durable','filter','Mixed metadata: retain unknown/migration ledgers; omit known operational timestamps.'),
  core(STORE_NAMES.fileHandles,'ephemeral','exclude','Device-bound permission handles are not portable or JSON-safe.'),
  core(STORE_NAMES.outbox,'durable','include','Pending and quarantined writes must survive backup.'),
  core(STORE_NAMES.captureDrafts,'durable','include','Quick Capture drafts must survive reload and migration.'),
  ...Object.values(IELTS_STORE_NAMES).map(ielts),
  ...Object.values(V10_STORES).map(store=>{
    if(store===V10_STORES.coachingStats)return v10(store,'reconstructable-cache','exclude','Derived from durable IELTS attempts and Error Records.');
    if(store===V10_STORES.meta)return v10(store,'durable','filter','Mixed metadata: retain unknown/migration ledgers; omit schema and catalog refresh markers.');
    if(store===V10_STORES.transcriptCache)return v10(store,'durable','filter-and-stub','Imported transcripts are durable; provider artifacts export only reconstruction stubs and digests.');
    if(store===V10_STORES.contentAssets)return v10(store,'durable','filter-and-stub','Private generated data is durable; remote CacheStorage bytes remain reconstructable.');
    return v10(store);
  })
]);

export const BACKUP_EXTERNAL_REGISTRY=Object.freeze([
  Object.freeze({owner:'core',storage:'localStorage',store:'tracked-core-fallback',classification:'durable',backupRule:'through-core-adapter',note:'Core logical state is exported through the Core adapter when IndexedDB is unavailable.'}),
  Object.freeze({owner:'core',storage:'localStorage',store:'vocab-master-capture-drafts',classification:'durable',backupRule:'through-core-adapter',note:'Degraded-storage Quick Capture drafts are exported through the Core adapter.'}),
  Object.freeze({owner:'pwa',storage:'CacheStorage',store:'vocab-master-pwa-v10-static',classification:'reconstructable-cache',backupRule:'exclude',note:'Static application assets are installed again by the service worker.'}),
  Object.freeze({owner:'pwa',storage:'CacheStorage',store:'vocab-master-pwa-v10-runtime',classification:'reconstructable-cache',backupRule:'exclude',note:'Runtime responses are fetched again.'}),
  Object.freeze({owner:'v10',storage:'CacheStorage',store:'vocab-master-content-v1',classification:'reconstructable-cache',backupRule:'exclude',note:'Published content bytes are fetched again from retained manifest URLs.'}),
  Object.freeze({owner:'pwa',storage:'CacheStorage',store:'vocab-master-pwa-v10-config',classification:'reconstructable-cache',backupRule:'exclude',note:'Reminder config is reconstructed from durable settings.'}),
  Object.freeze({owner:'core',storage:'sessionStorage',store:'vocab-local-sw-reset-v1',classification:'ephemeral',backupRule:'exclude',note:'One-session service-worker reset marker.'}),
  Object.freeze({owner:'core',storage:'sessionStorage',store:'vocab-master-gemini-key',classification:'ephemeral',backupRule:'exclude-secret',note:'Session-only API credentials must never enter a backup.'}),
  Object.freeze({owner:'pwa',storage:'PushManager',store:'browser-push-subscription',classification:'ephemeral',backupRule:'exclude',note:'Device-bound notification capability is re-authorized per browser.'}),
  Object.freeze({owner:'ielts-v10',storage:'memory',store:'fallback-maps',classification:'ephemeral',backupRule:'exclude-nondurable',note:'RAM adapters are never acceptance evidence for durable persistence.'})
]);

const includedEntries=()=>BACKUP_STORE_REGISTRY.filter(row=>row.backupRule!=='exclude');
const ownerEntries=owner=>includedEntries().filter(row=>row.owner===owner);
const recordKey=row=>String(row?.key??row?.id??'');
const codeUnitCompare=(left,right)=>left<right?-1:left>right?1:0;

function canonicalValue(value){
  if(Array.isArray(value))return value.map(canonicalValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort(codeUnitCompare).map(key=>[key,canonicalValue(value[key])]));
  return value;
}

function normalizedStores(owner,stores={}){
  return Object.fromEntries(ownerEntries(owner).map(({store})=>{
    const rows=Array.isArray(stores?.[store])?structuredClone(stores[store]):[];
    rows.sort((left,right)=>codeUnitCompare(recordKey(left),recordKey(right)));
    return[store,rows.map(canonicalValue)];
  }));
}

export function canonicalBackupPayload(domains={}){
  return canonicalValue(Object.fromEntries(['core','ielts','v10'].map(owner=>[owner,{
    database:ownerEntries(owner)[0]?.database||'',databaseVersion:ownerEntries(owner)[0]?.databaseVersion||0,
    stores:normalizedStores(owner,domains?.[owner]?.stores||domains?.[owner]||{})
  }])));
}

export function canonicalBackupBytes(domains={}){return JSON.stringify(canonicalBackupPayload(domains));}

// Synchronous SHA-256 keeps browser export/validation APIs deterministic without Node-only dependencies.
export function sha256Hex(value=''){
  const bytes=new TextEncoder().encode(String(value));const words=[];const bitLength=bytes.length*8;
  for(let index=0;index<bytes.length;index++)words[index>>2]=(words[index>>2]||0)|(bytes[index]<<(24-(index%4)*8));
  words[bitLength>>5]=(words[bitLength>>5]||0)|(0x80<<(24-bitLength%32));words[(((bitLength+64)>>9)<<4)+15]=bitLength;
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const rotate=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let offset=0;offset<words.length;offset+=16){const w=new Array(64);for(let i=0;i<16;i++)w[i]=words[offset+i]|0;for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];const s0=rotate(a,7)^rotate(a,18)^(a>>>3),s1=rotate(b,17)^rotate(b,19)^(b>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}let[a,b,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const s1=rotate(e,6)^rotate(e,11)^rotate(e,25),ch=(e&f)^(~e&g),t1=(hh+s1+ch+k[i]+w[i])|0,s0=rotate(a,2)^rotate(a,13)^rotate(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;}
  return h.map(word=>(word>>>0).toString(16).padStart(8,'0')).join('');
}

export function canonicalBackupDigest(domains={}){return`sha256:${sha256Hex(canonicalBackupBytes(domains))}`;}

function jsonSafetyErrors(value,path='backup',seen=new Set(),errors=[],depth=0){
  if(depth>MAX_DEPTH){errors.push(`${path} vuot gioi han do sau ${MAX_DEPTH}.`);return errors;}
  if(value===null||typeof value==='string'||typeof value==='boolean')return errors;
  if(typeof value==='number'){if(!Number.isFinite(value))errors.push(`${path} chua so khong huu han.`);return errors;}
  if(typeof value!=='object'){errors.push(`${path} chua kieu khong the backup: ${typeof value}.`);return errors;}
  if(seen.has(value)){errors.push(`${path} chua tham chieu vong.`);return errors;}seen.add(value);
  if(Array.isArray(value)){value.forEach((item,index)=>jsonSafetyErrors(item,`${path}[${index}]`,seen,errors,depth+1));seen.delete(value);return errors;}
  const prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null){errors.push(`${path} chua object khong JSON-safe.`);seen.delete(value);return errors;}
  for(const[key,item]of Object.entries(value))jsonSafetyErrors(item,`${path}.${key}`,seen,errors,depth+1);seen.delete(value);return errors;
}

const SECRET_KEYS=new Set(['apikey','api-key','geminikey','access-token','accesstoken','authorization','authtoken','clientsecret','password','refreshtoken','refresh-token','sessiontoken']);
function secretPaths(value,path='backup'){
  const result=[];const stack=[{value,path,depth:0}];
  while(stack.length){const current=stack.pop();if(!current.value||typeof current.value!=='object'||current.depth>MAX_DEPTH)continue;
    const entries=Array.isArray(current.value)?current.value.map((item,index)=>[String(index),item]):Object.entries(current.value);
    for(const[key,item]of entries){const nextPath=Array.isArray(current.value)?`${current.path}[${key}]`:`${current.path}.${key}`;const normalized=key.toLowerCase().replace(/[_\s]/g,'');if(SECRET_KEYS.has(key.toLowerCase())||SECRET_KEYS.has(normalized)){if(item!=null&&String(item)!=='')result.push(nextPath);}stack.push({value:item,path:nextPath,depth:current.depth+1});}
  }
  return result;
}

function safetyErrorsForDomains(domains){
  const errors=jsonSafetyErrors(domains,'domains');if(errors.length)return errors;
  for(const path of secretPaths(domains,'domains'))errors.push(`${path} co ve chua secret; backup bi tu choi.`);
  const bytes=new TextEncoder().encode(JSON.stringify(domains)).length;if(bytes>MAX_PAYLOAD_BYTES)errors.push(`Backup payload vuot gioi han ${MAX_PAYLOAD_BYTES} bytes.`);
  return errors;
}

function sourceShapeErrors(rawDomains){
  const errors=[];
  for(const owner of ['core','ielts','v10']){
    const stores=rawDomains?.[owner]?.stores;if(!stores||typeof stores!=='object'||Array.isArray(stores)){errors.push(`Source domain ${owner} stores bi thieu.`);continue;}
    const required=new Set(ownerEntries(owner).map(row=>row.store));
    for(const store of required)if(!Object.hasOwn(stores,store)||!Array.isArray(stores[store]))errors.push(`Source domain ${owner}.${store} bi thieu hoac khong phai array.`);
    for(const store of Object.keys(stores))if(!required.has(store))errors.push(`Source domain ${owner}.${store} khong thuoc export allowlist.`);
  }
  return errors;
}

export function buildFullBackupEnvelope({core={},ielts={},v10={},exportedAt=new Date().toISOString()}={}){
  const rawDomains={core:{stores:core},ielts:{stores:ielts},v10:{stores:v10}};const errors=[...sourceShapeErrors(rawDomains),...safetyErrorsForDomains(rawDomains)];if(errors.length)throw Object.assign(new Error(errors.join('\n')),{code:'BACKUP_PAYLOAD_UNSAFE'});
  const domains=canonicalBackupPayload(rawDomains);
  const stores=BACKUP_STORE_REGISTRY.map(row=>{const rows=row.backupRule==='exclude'?[]:domains[row.owner].stores[row.store];return{...row,recordCount:rows.length,contentDigest:row.backupRule==='exclude'?null:`sha256:${sha256Hex(JSON.stringify(rows))}`};});
  return{app:'Vocab Master',kind:FULL_BACKUP_KIND,schemaVersion:FULL_BACKUP_VERSION,registryVersion:BACKUP_REGISTRY_VERSION,exportedAt:String(exportedAt),manifest:{stores,external:structuredClone(BACKUP_EXTERNAL_REGISTRY)},domains,payloadDigest:canonicalBackupDigest(domains)};
}

function validateManifest(input,domains,errors){
  if(!input?.manifest||!Array.isArray(input.manifest.stores)){errors.push('Backup manifest stores bi thieu.');return;}
  if(input.manifest.stores.length!==BACKUP_STORE_REGISTRY.length)errors.push('Backup manifest store count khong khop registry.');
  for(let index=0;index<BACKUP_STORE_REGISTRY.length;index++){
    const expected=BACKUP_STORE_REGISTRY[index],actual=input.manifest.stores[index];if(!actual){continue;}
    for(const key of ['owner','database','databaseVersion','store','keyPath','classification','backupRule','restoreRule','note'])if(actual[key]!==expected[key])errors.push(`Backup manifest ${index}.${key} khong khop registry.`);
    const count=expected.backupRule==='exclude'?0:(domains?.[expected.owner]?.stores?.[expected.store]?.length||0);if(Number(actual.recordCount)!==count)errors.push(`Backup manifest ${expected.owner}.${expected.store} recordCount khong khop.`);
    const rows=expected.backupRule==='exclude'?[]:(domains?.[expected.owner]?.stores?.[expected.store]||[]);const digest=expected.backupRule==='exclude'?null:`sha256:${sha256Hex(JSON.stringify(rows))}`;if(actual.contentDigest!==digest)errors.push(`Backup manifest ${expected.owner}.${expected.store} digest khong khop.`);
  }
  if(JSON.stringify(canonicalValue(input.manifest.external||[]))!==JSON.stringify(canonicalValue(BACKUP_EXTERNAL_REGISTRY)))errors.push('Backup external storage manifest khong khop registry.');
}

export function validateFullBackupEnvelope(input){
  const errors=[];const warnings=[];
  if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup vNext phai la object.'],warnings,value:null};
  const envelopeSafety=jsonSafetyErrors(input,'backup');if(envelopeSafety.length)return{valid:false,errors:envelopeSafety,warnings,value:null};
  if(input.kind!==FULL_BACKUP_KIND)errors.push('Khong phai full backup Vocab Master vNext.');
  if(Number(input.schemaVersion||0)!==FULL_BACKUP_VERSION)errors.push(Number(input.schemaVersion||0)>FULL_BACKUP_VERSION?'Backup dung schema moi hon ung dung.':'Backup vNext thieu hoac sai schema version.');
  if(Number(input.registryVersion||0)!==BACKUP_REGISTRY_VERSION)errors.push(Number(input.registryVersion||0)>BACKUP_REGISTRY_VERSION?'Backup dung store registry moi hon ung dung.':'Backup thieu hoac sai store registry version.');
  const domains=input.domains&&typeof input.domains==='object'&&!Array.isArray(input.domains)?input.domains:{};
  const safetyErrors=safetyErrorsForDomains(domains);errors.push(...safetyErrors);if(safetyErrors.length)return{valid:false,errors,warnings,value:null};
  for(const owner of ['core','ielts','v10']){
    const domain=domains[owner];if(!domain||typeof domain!=='object'||Array.isArray(domain)){errors.push(`Thieu domain ${owner}.`);continue;}
    const expectedOwner=ownerEntries(owner)[0];if(domain.database!==expectedOwner.database)errors.push(`${owner}.database khong khop registry.`);if(Number(domain.databaseVersion)!==expectedOwner.databaseVersion)errors.push(Number(domain.databaseVersion)>expectedOwner.databaseVersion?`${owner} database version moi hon ung dung.`:`${owner} database version khong khop registry.`);
    const stores=domain.stores&&typeof domain.stores==='object'&&!Array.isArray(domain.stores)?domain.stores:{};const required=new Set(ownerEntries(owner).map(row=>row.store));
    for(const store of required){
      if(!Object.hasOwn(stores,store)){errors.push(`${owner}.${store} bi thieu.`);continue;}
      const rows=stores[store];if(!Array.isArray(rows)){errors.push(`${owner}.${store} phai la array.`);continue;}if(rows.length>MAX_RECORDS_PER_STORE)errors.push(`${owner}.${store} vuot gioi han ${MAX_RECORDS_PER_STORE} records.`);
      const keys=new Set();for(let index=0;index<rows.length;index++){const row=rows[index],key=recordKey(row);if(!row||typeof row!=='object'||Array.isArray(row))errors.push(`${owner}.${store}[${index}] phai la object.`);if(!key)errors.push(`${owner}.${store}[${index}] thieu id/key.`);else if(keys.has(key))errors.push(`${owner}.${store} trung key ${key}.`);else keys.add(key);const size=new TextEncoder().encode(JSON.stringify(row)).length;if(size>MAX_RECORD_BYTES)errors.push(`${owner}.${store}[${index}] vuot gioi han ${MAX_RECORD_BYTES} bytes.`);}
    }
    for(const store of Object.keys(stores))if(!required.has(store))errors.push(`${owner}.${store} khong thuoc payload allowlist.`);
  }
  const v10Stores=domains.v10?.stores||{};
  for(const row of v10Stores[V10_STORES.transcriptCache]||[])if(row.backupRepresentation==='reconstructable-cache-stub-v1'&&Object.hasOwn(row,'segments'))errors.push(`v10.${V10_STORES.transcriptCache}/${recordKey(row)} stub con chua raw segments.`);
  for(const row of v10Stores[V10_STORES.contentAssets]||[])if(row.backupRepresentation==='remote-cache-stub-v1'&&Object.hasOwn(row,'data'))errors.push(`v10.${V10_STORES.contentAssets}/${recordKey(row)} stub con chua raw data.`);
  if((v10Stores[V10_STORES.meta]||[]).some(row=>['schema','content-catalog'].includes(String(row?.key||''))))errors.push('v10.meta con chua reconstructable metadata.');
  validateManifest(input,domains,errors);
  const digest=canonicalBackupDigest(domains);if(String(input.payloadDigest||'')!==digest)errors.push('Backup payload SHA-256 digest khong khop noi dung canonical.');
  let value=null;if(!errors.length)try{value=buildFullBackupEnvelope({core:domains.core.stores,ielts:domains.ielts.stores,v10:domains.v10.stores,exportedAt:input.exportedAt});}catch(error){errors.push(error.message);}
  return{valid:errors.length===0,errors,warnings,value};
}

export function auditBackupRegistry(){
  const errors=[];const seen=new Set();const validRules=new Set(['include','filter','filter-and-stub','exclude']);for(const row of BACKUP_STORE_REGISTRY){const key=`${row.owner}:${row.store}`;if(seen.has(key))errors.push(`Registry trung ${key}.`);seen.add(key);if(!BACKUP_CLASSIFICATIONS.includes(row.classification))errors.push(`Registry ${key} co classification sai.`);if(!validRules.has(row.backupRule))errors.push(`Registry ${key} co backup rule sai.`);if(row.classification==='durable'&&row.backupRule==='exclude')errors.push(`Durable store ${key} khong duoc export.`);if(row.classification!=='durable'&&row.backupRule!=='exclude')errors.push(`Non-durable store ${key} khong duoc include.`);}
  const expected={core:new Set(Object.values(STORE_NAMES)),ielts:new Set(Object.values(IELTS_STORE_NAMES)),v10:new Set(Object.values(V10_STORES))};for(const[owner,stores]of Object.entries(expected)){const actual=new Set(BACKUP_STORE_REGISTRY.filter(row=>row.owner===owner).map(row=>row.store));for(const store of stores)if(!actual.has(store))errors.push(`Registry thieu ${owner}:${store}.`);for(const store of actual)if(!stores.has(store))errors.push(`Registry thua ${owner}:${store}.`);}
  return{valid:errors.length===0,errors,stores:BACKUP_STORE_REGISTRY.length,durable:includedEntries().length,excluded:BACKUP_STORE_REGISTRY.length-includedEntries().length};
}
