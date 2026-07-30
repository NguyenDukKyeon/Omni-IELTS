import {
  CORE_OPERATIONAL_META_KEYS,
  CORE_RESTORE_JOURNAL_KEY,
  CORE_RESTORE_RECEIPT_KEY,
  DB_NAME,
  STORE_NAMES,
  buildCoreBackupStores,
  invalidateCoreScheduledMaintenance,
  openDatabase,
  readCoreRestoreJournal,
  reopenCoreDatabase,
  requestResult,
  transactionDone
} from './persistence.js';
import { validateBackupDocument } from './persistence-core.js';
import {
  IELTS_DB_NAME,
  buildIeltsBackup,
  openIeltsDatabase,
  reopenIeltsDatabase,
  validateIeltsBackup
} from './ielts-persistence.js';
import { IELTS_STORE_NAMES } from './ielts-domain.js';
import {
  buildV10BackupStores,
  openV10Database,
  reopenV10Database,
} from './v10-persistence.js';
import { V10_DB_NAME,V10_STORES } from './v10-contracts.js';
import {
  BACKUP_STORE_REGISTRY,
  FULL_BACKUP_KIND,
  FULL_BACKUP_VERSION,
  buildFullBackupEnvelope,
  validateFullBackupEnvelope
} from './backup-registry.js';
import { MIGRATION_LEDGER_PREFIX } from './migration-ledger.js';
import { withExclusiveStorageLock } from './storage-lock.js';
import { PHASE5_CONSENT_KEY,PHASE5_SETTINGS_KEY } from './asr-fallback-policy.js';

export const COMBINED_BACKUP_VERSION=FULL_BACKUP_VERSION;
export const DEGRADED_CORE_BACKUP_KIND='vocab-master-core-degraded';
const RESTORE_JOURNAL_VERSION=1;
const MAX_RESTORE_STAGING_BYTES=256*1024*1024;
const RESTORE_STAGING_MARGIN_BYTES=5*1024*1024;
const OWNER_ORDER=Object.freeze(['core','ielts','v10']);
const CORE_RESTORE_STORES=Object.freeze([STORE_NAMES.cards,STORE_NAMES.settings,STORE_NAMES.reviewEvents,STORE_NAMES.snapshots,STORE_NAMES.meta,STORE_NAMES.outbox,STORE_NAMES.captureDrafts,STORE_NAMES.learningEvents,STORE_NAMES.learningProjections,STORE_NAMES.learningDeadLetters]);
const IELTS_RESTORE_STORES=Object.freeze(Object.values(IELTS_STORE_NAMES));
const V10_RESTORE_STORES=Object.freeze(Object.values(V10_STORES).filter(name=>name!==V10_STORES.coachingStats));
const createAttemptId=()=>globalThis.crypto?.randomUUID?.()||`restore-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
const invalidBackupError=errors=>Object.assign(new Error(errors.join('\n')),{code:'BACKUP_INVALID'});
function testingHooks(options={}){
  if(!options.hooks)return{};
  if(typeof document==='undefined'||import.meta.env?.DEV)return options.hooks;
  throw Object.assign(new Error('Restore failure-injection hooks bị vô hiệu hóa trong production.'),{code:'RESTORE_TEST_HOOKS_DISABLED'});
}

async function buildCombinedBackupLocked({allowRestoreJournal=false,restoreToken,hooks={}}={}){
  if(typeof indexedDB==='undefined')return buildDegradedCoreBackupLocked({restoreToken});
  const activeJournal=await readCoreRestoreJournal();
  if(activeJournal&&!allowRestoreJournal)throw Object.assign(new Error('Restore đang diễn ra; không thể xuất một backup trạng thái trung gian.'),{code:'RESTORE_IN_PROGRESS'});
  await hooks.beforeRead?.();
  const[core,ielts,v10]=await Promise.all([buildCoreBackupStores({restoreToken}),buildIeltsBackup({restoreToken}),buildV10BackupStores({restoreToken})]);
  if(allowRestoreJournal)core.meta=core.meta.filter(row=>row.key!==CORE_RESTORE_JOURNAL_KEY);
  return buildFullBackupEnvelope({core,ielts:ielts.stores,v10});
}

export async function buildCombinedBackup(options={}){
  if(options.restoreToken)return buildCombinedBackupLocked(options);
  return withExclusiveStorageLock(restoreToken=>buildCombinedBackupLocked({...options,restoreToken}));
}

async function buildDegradedCoreBackupLocked({restoreToken}={}){
  const core=await buildCoreBackupStores({restoreToken});
  const emptyOwner=owner=>Object.fromEntries(BACKUP_STORE_REGISTRY.filter(row=>row.owner===owner&&row.backupRule!=='exclude').map(row=>[row.store,[]]));
  const envelope=buildFullBackupEnvelope({core,ielts:emptyOwner('ielts'),v10:emptyOwner('v10')});
  return{...envelope,kind:DEGRADED_CORE_BACKUP_KIND,restoreScope:'core-only'};
}

export async function buildDegradedCoreBackup(options={}){
  if(options.restoreToken)return buildDegradedCoreBackupLocked(options);
  return withExclusiveStorageLock(restoreToken=>buildDegradedCoreBackupLocked({...options,restoreToken}));
}

function validateDegradedCoreBackup(input){
  if(input?.kind!==DEGRADED_CORE_BACKUP_KIND)return{valid:false,errors:['Không phải degraded Core backup.'],warnings:[],value:null,format:'degraded-core-v1'};
  if(input.restoreScope!=='core-only')return{valid:false,errors:['Degraded Core backup thiếu restoreScope core-only.'],warnings:[],value:null,format:'degraded-core-v1'};
  const fullInput=structuredClone(input);fullInput.kind=FULL_BACKUP_KIND;delete fullInput.restoreScope;
  const validation=validateFullBackupEnvelope(fullInput);const errors=[...validation.errors];
  if(validation.valid)for(const owner of ['ielts','v10'])for(const[store,rows]of Object.entries(validation.value.domains[owner].stores))if(rows.length)errors.push(`Degraded Core backup không được chứa ${owner}.${store}.`);
  return{valid:errors.length===0,errors,warnings:['Backup được tạo trong degraded storage; restore chỉ thay Core và giữ nguyên IELTS/V10.'],value:errors.length?null:validation.value,format:'degraded-core-v1'};
}

export function validateCombinedBackup(input){
  if(input?.kind===FULL_BACKUP_KIND)return{...validateFullBackupEnvelope(input),format:'vnext'};
  if(input?.kind===DEGRADED_CORE_BACKUP_KIND)return validateDegradedCoreBackup(input);
  const errors=[];const warnings=[];
  if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup kết hợp phải là object.'],warnings,value:null};
  if(input.kind!=='combined-core-ielts')errors.push('Không phải backup kết hợp Vocab Master.');
  if(Number(input.schemaVersion||0)!==1)errors.push(Number(input.schemaVersion||0)>1?'Backup kết hợp legacy dùng schema mới hơn ứng dụng cũ.':'Backup kết hợp legacy thiếu hoặc sai schema version.');
  if(!input.core||typeof input.core!=='object')errors.push('Thiếu core backup.');
  const coreValidation=validateBackupDocument(input.core);if(!coreValidation.valid)errors.push(...coreValidation.errors.map(error=>`Core: ${error}`));warnings.push(...coreValidation.warnings.map(warning=>`Core: ${warning}`));
  const ieltsValidation=validateIeltsBackup(input.ielts);if(!ieltsValidation.valid)errors.push(...ieltsValidation.errors.map(error=>`IELTS: ${error}`));warnings.push(...ieltsValidation.warnings.map(warning=>`IELTS: ${warning}`));
  return{valid:errors.length===0,errors,warnings,value:errors.length?null:{...input,core:coreValidation.value,ielts:ieltsValidation.value},format:'legacy-v1'};
}

function preparePhase5SafeRestoreTarget(envelope){
  const domains=structuredClone(envelope.domains),meta=domains.v10.stores[V10_STORES.meta]||[];let changed=false;
  domains.v10.stores[V10_STORES.meta]=meta.map(row=>{
    if(row.key===PHASE5_SETTINGS_KEY&&row.cloudEnabled===true){changed=true;return{...row,cloudEnabled:false,restoreReactivationRequired:true,updatedAt:Date.now()};}
    if(row.key===PHASE5_CONSENT_KEY&&row.decision==='accepted'){changed=true;return{...row,reactivationRequired:true,updatedAt:Date.now()};}
    return row;
  });
  if(!changed)return envelope;
  return buildFullBackupEnvelope({core:domains.core.stores,ielts:domains.ielts.stores,v10:domains.v10.stores});
}

function coreStoresFromLegacy(currentStores,legacy){
  const otherSettings=currentStores.settings.filter(row=>!['app','fsrs','metrics'].includes(row.key));
  return{...structuredClone(currentStores),cards:structuredClone(legacy.cards),settings:[
    ...otherSettings,{key:'app',value:structuredClone(legacy.settings)},{key:'fsrs',value:structuredClone(legacy.fsrsConfig)},{key:'metrics',value:structuredClone(legacy.metrics)}
  ],reviewEvents:structuredClone(legacy.reviewEvents||[])};
}

function preserveLedgerRows(currentRows=[],targetRows=[]){
  const output=structuredClone(targetRows);
  const keys=new Set(output.map(row=>String(row?.key||'')));
  for(const row of currentRows){
    const key=String(row?.key||'');
    if(!key.startsWith(MIGRATION_LEDGER_PREFIX)||keys.has(key))continue;
    output.push(structuredClone(row));
    keys.add(key);
  }
  return output;
}

function targetFromCurrent(current,{core=null,ielts=null}={}){
  const ieltsStores=ielts?.stores?structuredClone(ielts.stores):structuredClone(current.domains.ielts.stores);
  ieltsStores[IELTS_STORE_NAMES.settings]=preserveLedgerRows(
    current.domains.ielts.stores[IELTS_STORE_NAMES.settings],
    ieltsStores[IELTS_STORE_NAMES.settings]
  );
  return buildFullBackupEnvelope({
    core:core?coreStoresFromLegacy(current.domains.core.stores,core):current.domains.core.stores,
    ielts:ieltsStores,
    v10:current.domains.v10.stores
  });
}

function withoutCompletedReceipt(envelope){
  const stores=structuredClone(envelope.domains.core.stores);
  stores.meta=stores.meta.filter(row=>String(row?.key||'')!==CORE_RESTORE_RECEIPT_KEY);
  return buildFullBackupEnvelope({
    core:stores,
    ielts:envelope.domains.ielts.stores,
    v10:envelope.domains.v10.stores,
    exportedAt:envelope.exportedAt
  });
}

function logicalRestoreDigest(envelope){
  return withoutCompletedReceipt(envelope).payloadDigest;
}

async function preflightRestoreJournal(journal,hooks={}){
  const encoder=new TextEncoder();
  const journalBytes=encoder.encode(JSON.stringify(journal)).length;
  const targetBytes=encoder.encode(JSON.stringify(journal.target.domains)).length;
  const requiredBytes=journalBytes+targetBytes+RESTORE_STAGING_MARGIN_BYTES;
  if(journalBytes>MAX_RESTORE_STAGING_BYTES)throw Object.assign(new Error(`Restore journal ${journalBytes} bytes vượt giới hạn staging ${MAX_RESTORE_STAGING_BYTES} bytes.`),{
    code:'RESTORE_STAGING_TOO_LARGE',
    durable:false,
    journalBytes,
    limitBytes:MAX_RESTORE_STAGING_BYTES
  });
  const estimate=await globalThis.navigator?.storage?.estimate?.().catch(()=>null);
  const availableBytes=estimate?.quota?Math.max(0,Number(estimate.quota)-Number(estimate.usage||0)):null;
  if(availableBytes!==null&&availableBytes<requiredBytes)throw Object.assign(new Error(`Không đủ dung lượng staging restore: cần ${requiredBytes} bytes, còn ${availableBytes} bytes.`),{
    code:'RESTORE_STAGING_QUOTA_INSUFFICIENT',
    durable:false,
    requiredBytes,
    availableBytes
  });
  const result={journalBytes,targetBytes,requiredBytes,availableBytes};
  await hooks.beforeStage?.(journal,result);
  return result;
}

async function reopenAndVerify(expectedDigest,restoreToken){
  await Promise.all([reopenCoreDatabase({restoreToken}),reopenIeltsDatabase({restoreToken}),reopenV10Database({restoreToken})]);
  const actual=await buildCombinedBackup({allowRestoreJournal:true,restoreToken});
  if(actual.payloadDigest!==expectedDigest)throw Object.assign(new Error(`Restore canonical verify thất bại: expected ${expectedDigest}, actual ${actual.payloadDigest}.`),{code:'RESTORE_CANONICAL_MISMATCH',expectedDigest,actualDigest:actual.payloadDigest});
  return actual;
}

function notifyRestore(owner,stores,reason,revision=Date.now()*1000+Math.floor(Math.random()*1000)){
  const channelNames={core:'vocab-master-data-v1',ielts:'vocab-master-ielts-data-v1',v10:'vocab-master-v10-data-v1'};
  const payload=owner==='core'?{type:'revision',revision,reason}:{type:'changed',reason,stores,revision};
  if(typeof BroadcastChannel!=='undefined'){
    const channel=new BroadcastChannel(channelNames[owner]);channel.unref?.();channel.postMessage(payload);channel.close();
  }
  const eventNames={core:'vocab:data-saved',ielts:'vocab:ielts-data-saved',v10:'vocab:v10-data-saved'};
  globalThis.dispatchEvent?.(new CustomEvent(eventNames[owner],{detail:payload}));
  return revision;
}

async function writeCoreRestoreJournal(input){
  const journal={...structuredClone(input),key:CORE_RESTORE_JOURNAL_KEY,updatedAt:Date.now()};
  const database=await openDatabase();const transaction=database.transaction(STORE_NAMES.meta,'readwrite');transaction.objectStore(STORE_NAMES.meta).put(journal);await transactionDone(transaction);
  const verified=await readCoreRestoreJournal();
  if(!verified||verified.targetDigest!==journal.targetDigest||verified.beforeDigest!==journal.beforeDigest||verified.phase!==journal.phase)throw Object.assign(new Error('Restore journal không vượt qua durable read-back.'),{code:'RESTORE_JOURNAL_VERIFY_FAILED'});
  return structuredClone(verified);
}

async function deleteCoreRestoreJournal(){
  const database=await openDatabase();const transaction=database.transaction(STORE_NAMES.meta,'readwrite');transaction.objectStore(STORE_NAMES.meta).delete(CORE_RESTORE_JOURNAL_KEY);await transactionDone(transaction);
  if(await readCoreRestoreJournal())throw Object.assign(new Error('Restore journal chưa được dọn sau commit.'),{code:'RESTORE_JOURNAL_DELETE_FAILED'});
  return true;
}

async function writeCoreRestoreReceipt({targetDigest,attemptId}={}){
  const row={key:CORE_RESTORE_RECEIPT_KEY,targetDigest:String(targetDigest||''),attemptId:String(attemptId||''),completedAt:Date.now()};
  const database=await openDatabase();const transaction=database.transaction(STORE_NAMES.meta,'readwrite');transaction.objectStore(STORE_NAMES.meta).put(row);await transactionDone(transaction);
  const verifyTransaction=database.transaction(STORE_NAMES.meta,'readonly');const verified=await requestResult(verifyTransaction.objectStore(STORE_NAMES.meta).get(CORE_RESTORE_RECEIPT_KEY));await transactionDone(verifyTransaction);
  if(!verified||verified.targetDigest!==row.targetDigest||verified.attemptId!==row.attemptId)throw Object.assign(new Error('Restore receipt không vượt qua durable read-back.'),{code:'RESTORE_RECEIPT_VERIFY_FAILED'});
  return structuredClone(verified);
}

async function replaceCoreStores(stores,journal,reason){
  for(const name of CORE_RESTORE_STORES)if(!Array.isArray(stores?.[name]))throw Object.assign(new Error(`Restore Core thiếu store ${name}.`),{code:'RESTORE_STORE_MISSING'});
  const database=await openDatabase();const transaction=database.transaction(CORE_RESTORE_STORES,'readwrite');const metaStore=transaction.objectStore(STORE_NAMES.meta);const currentMeta=await requestResult(metaStore.getAll());
  const revision=Date.now()*1000+Math.floor(Math.random()*1000);
  for(const name of CORE_RESTORE_STORES){
    const store=transaction.objectStore(name);store.clear();let rows=stores[name];
    if(name===STORE_NAMES.meta){
      const merged=new Map(rows.map(row=>[row.key,structuredClone(row)]));
      for(const row of currentMeta)if(CORE_OPERATIONAL_META_KEYS.includes(String(row?.key||'')))merged.set(row.key,structuredClone(row));
      merged.set('revision',{key:'revision',value:revision,reason,updatedAt:Date.now()});
      merged.set(CORE_RESTORE_JOURNAL_KEY,{...structuredClone(journal),key:CORE_RESTORE_JOURNAL_KEY});
      rows=[...merged.values()];
    }
    for(const row of rows)store.put(structuredClone(row));
  }
  await transactionDone(transaction);notifyRestore('core',CORE_RESTORE_STORES,reason,revision);return{database:DB_NAME,durable:true,revision};
}

async function replaceIeltsStores(stores,reason){
  for(const name of IELTS_RESTORE_STORES)if(!Array.isArray(stores?.[name]))throw Object.assign(new Error(`Restore IELTS thiếu store ${name}.`),{code:'RESTORE_STORE_MISSING'});
  const database=await openIeltsDatabase();const transaction=database.transaction(IELTS_RESTORE_STORES,'readwrite');
  for(const name of IELTS_RESTORE_STORES){const store=transaction.objectStore(name);store.clear();for(const row of stores[name])store.put(structuredClone(row));}
  await transactionDone(transaction);notifyRestore('ielts',IELTS_RESTORE_STORES,reason);return{database:IELTS_DB_NAME,durable:true};
}

async function replaceV10Stores(stores,reason){
  for(const name of V10_RESTORE_STORES)if(!Array.isArray(stores?.[name]))throw Object.assign(new Error(`Restore V10 thiếu store ${name}.`),{code:'RESTORE_STORE_MISSING'});
  const database=await openV10Database();const transaction=database.transaction(V10_RESTORE_STORES,'readwrite');const metaStore=transaction.objectStore(V10_STORES.meta);const currentMeta=await requestResult(metaStore.getAll());
  for(const name of V10_RESTORE_STORES){
    const store=transaction.objectStore(name);store.clear();let rows=stores[name];
    if(name===V10_STORES.meta){const merged=new Map(rows.map(row=>[row.key,structuredClone(row)]));for(const row of currentMeta)if(['schema','content-catalog'].includes(String(row?.key||'')))merged.set(row.key,structuredClone(row));rows=[...merged.values()];}
    for(const row of rows)store.put(structuredClone(row));
  }
  await transactionDone(transaction);notifyRestore('v10',V10_RESTORE_STORES,reason);return{database:V10_DB_NAME,durable:true};
}

async function applyOwner(owner,envelope,journal,restoreToken){
  void restoreToken;
  const reason=`restore-${journal.phase}`;
  if(owner==='core')return replaceCoreStores(envelope.domains.core.stores,journal,reason);
  if(owner==='ielts')return replaceIeltsStores(envelope.domains.ielts.stores,reason);
  if(owner==='v10')return replaceV10Stores(envelope.domains.v10.stores,reason);
  throw new Error(`Restore owner không hợp lệ: ${owner}.`);
}

async function applyEnvelope(envelope,journal,restoreToken,hooks={}){
  journal.completedOwners=[];
  for(const owner of OWNER_ORDER){
    await hooks.beforeOwner?.(owner,journal);
    await applyOwner(owner,envelope,journal,restoreToken);
    await hooks.afterOwner?.(owner,journal);
    journal.completedOwners.push(owner);
    journal=await writeCoreRestoreJournal(journal);
  }
  return journal;
}

function validateJournal(journal){
  const errors=[];if(!journal||journal.key!==CORE_RESTORE_JOURNAL_KEY)errors.push('Restore journal thiếu key.');
  if(Number(journal?.schemaVersion)!==RESTORE_JOURNAL_VERSION)errors.push('Restore journal schema không được hỗ trợ.');
  if(!['staged','committing','rolling-back'].includes(journal?.phase))errors.push('Restore journal phase không hợp lệ.');
  const target=validateFullBackupEnvelope(journal?.target),before=validateFullBackupEnvelope(journal?.before);
  if(!target.valid)errors.push(...target.errors.map(error=>`Target: ${error}`));if(!before.valid)errors.push(...before.errors.map(error=>`Before: ${error}`));
  if(target.valid&&target.value.payloadDigest!==journal.targetDigest)errors.push('Restore journal target digest không khớp.');
  if(before.valid&&before.value.payloadDigest!==journal.beforeDigest)errors.push('Restore journal before digest không khớp.');
  if(errors.length)throw Object.assign(new Error(errors.join('\n')),{code:'RESTORE_JOURNAL_CORRUPT'});
  return{...journal,target:target.value,before:before.value};
}

async function finishJournal(journal,envelope,restoreToken,{recovered=false,hooks={}}={}){
  await reopenAndVerify(envelope.payloadDigest,restoreToken);
  await hooks.beforeReceipt?.(journal,envelope);
  const receipt=await writeCoreRestoreReceipt({targetDigest:envelope.payloadDigest,attemptId:journal.attemptId});
  await deleteCoreRestoreJournal();
  return{
    valid:true,
    durable:true,
    verified:true,
    status:'restored',
    recovered,
    attemptId:journal.attemptId,
    payloadDigest:envelope.payloadDigest,
    receipt,
    warnings:journal.warnings||[]
  };
}

async function recoverInterruptedRestoreLocked(restoreToken,{hooks={}}={}){
  const stored=await readCoreRestoreJournal();if(!stored)return{recovered:false};
  let journal=validateJournal(stored);const rollingBack=journal.phase==='rolling-back';const envelope=rollingBack?journal.before:journal.target;
  try{
    journal.phase=rollingBack?'rolling-back':'committing';
    journal=await writeCoreRestoreJournal(journal);
    journal=await applyEnvelope(envelope,journal,restoreToken,hooks);
    return finishJournal(journal,envelope,restoreToken,{recovered:true,hooks});
  }catch(error){
    if(!rollingBack){
      try{
        journal.phase='rolling-back';
        journal.completedOwners=[];
        journal.lastError=String(error?.message||error);
        journal=await writeCoreRestoreJournal(journal);
        journal=await applyEnvelope(journal.before,journal,restoreToken);
        await reopenAndVerify(journal.beforeDigest,restoreToken);
        await deleteCoreRestoreJournal();
        return{recovered:true,rolledBack:true,durable:true,verified:true,status:'rolled-back',attemptId:journal.attemptId,payloadDigest:journal.beforeDigest,recoveryErrorCode:error?.code||'RESTORE_RECOVERY_FORWARD_FAILED'};
      }catch(rollbackError){
        throw Object.assign(new Error(`Không thể phục hồi hoặc rollback restore journal: ${error.message}; ${rollbackError.message}`),{code:'RESTORE_RECOVERY_FAILED',cause:error,rollbackError,recoveryPending:true});
      }
    }
    throw Object.assign(new Error(`Không thể hoàn tất rollback restore journal: ${error.message}`),{code:'RESTORE_RECOVERY_FAILED',cause:error,recoveryPending:true});
  }
}

export async function recoverInterruptedRestore(options={}){
  if(typeof indexedDB==='undefined')return{recovered:false,reason:'indexeddb-unavailable-no-journal'};
  const hooks=testingHooks(options);
  return withExclusiveStorageLock(restoreToken=>{
    invalidateCoreScheduledMaintenance({restoreToken});
    return recoverInterruptedRestoreLocked(restoreToken,{hooks});
  });
}

async function restorePreparedTargetLocked(target,restoreToken,{warnings=[],hooks={}}={}){
  const before=await buildCombinedBackup({restoreToken});
  if(logicalRestoreDigest(before)===logicalRestoreDigest(target))return{valid:true,durable:true,verified:true,status:'already-current',alreadyApplied:true,payloadDigest:target.payloadDigest,warnings};
  let journal={key:CORE_RESTORE_JOURNAL_KEY,schemaVersion:RESTORE_JOURNAL_VERSION,attemptId:createAttemptId(),phase:'staged',completedOwners:[],targetDigest:target.payloadDigest,beforeDigest:before.payloadDigest,target,before,warnings};
  await preflightRestoreJournal(journal,hooks);
  try{journal=await writeCoreRestoreJournal(journal);}
  catch(error){
    const stored=await readCoreRestoreJournal().catch(()=>null);
    if(stored)Object.assign(error,{recoveryPending:true,attemptId:journal.attemptId});
    throw error;
  }
  try{
    journal.phase='committing';journal=await writeCoreRestoreJournal(journal);journal=await applyEnvelope(target,journal,restoreToken,hooks);return await finishJournal(journal,target,restoreToken,{hooks});
  }catch(error){
    if(error?.code==='SIMULATED_PROCESS_CRASH')throw Object.assign(error,{recoveryPending:true,attemptId:journal.attemptId});
    let rollbackError=null;
    try{journal.phase='rolling-back';journal.completedOwners=[];journal.lastError=String(error?.message||error);journal=await writeCoreRestoreJournal(journal);journal=await applyEnvelope(journal.before,journal,restoreToken);await reopenAndVerify(journal.beforeDigest,restoreToken);await deleteCoreRestoreJournal();}
    catch(cause){rollbackError=cause;}
    if(rollbackError)throw Object.assign(new Error(`Restore thất bại và rollback đang chờ recovery: ${error.message}; ${rollbackError.message}`),{code:'RESTORE_ROLLBACK_PENDING',cause:error,rollbackError,recoveryPending:true});
    throw Object.assign(error,{rollbackVerified:true,attemptId:journal.attemptId});
  }
}

export async function restoreCombinedBackup(input,options={}){
  const validation=validateCombinedBackup(input);if(!validation.valid)throw invalidBackupError(validation.errors);
  const hooks=testingHooks(options);
  return withExclusiveStorageLock(async restoreToken=>{
    invalidateCoreScheduledMaintenance({restoreToken});
    await recoverInterruptedRestoreLocked(restoreToken);
    if(validation.format==='vnext'){
      const target=preparePhase5SafeRestoreTarget(validation.value);
      const warnings=target===validation.value?validation.warnings:[...validation.warnings,'Phase 5 cloud access was disabled after restore and requires fresh explicit consent activation.'];
      return restorePreparedTargetLocked(target,restoreToken,{warnings,hooks});
    }
    if(validation.format==='degraded-core-v1'){
      const current=await buildCombinedBackup({restoreToken});
      const target=buildFullBackupEnvelope({core:validation.value.domains.core.stores,ielts:current.domains.ielts.stores,v10:current.domains.v10.stores});
      return restorePreparedTargetLocked(target,restoreToken,{warnings:validation.warnings,hooks});
    }
    const current=await buildCombinedBackup({restoreToken});return restorePreparedTargetLocked(targetFromCurrent(current,{core:validation.value.core,ielts:validation.value.ielts}),restoreToken,{warnings:validation.warnings,hooks});
  });
}

export async function restoreCoreBackupSafely(input,options={}){
  const validation=validateBackupDocument(input);if(!validation.valid)throw invalidBackupError(validation.errors);
  const hooks=testingHooks(options);
  return withExclusiveStorageLock(async restoreToken=>{invalidateCoreScheduledMaintenance({restoreToken});await recoverInterruptedRestoreLocked(restoreToken);const current=await buildCombinedBackup({restoreToken});
    return restorePreparedTargetLocked(targetFromCurrent(current,{core:validation.value}),restoreToken,{warnings:validation.warnings,hooks});
  });
}

export async function restoreIeltsBackupSafely(input,options={}){
  const validation=validateIeltsBackup(input);if(!validation.valid)throw invalidBackupError(validation.errors);
  const hooks=testingHooks(options);
  return withExclusiveStorageLock(async restoreToken=>{invalidateCoreScheduledMaintenance({restoreToken});await recoverInterruptedRestoreLocked(restoreToken);const current=await buildCombinedBackup({restoreToken});
    return restorePreparedTargetLocked(targetFromCurrent(current,{ielts:validation.value}),restoreToken,{warnings:validation.warnings,hooks});
  });
}

export async function downloadCombinedBackup(){
  const backup=await buildCombinedBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`vocab-master-full-v${COMBINED_BACKUP_VERSION}-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return backup;
}

export const __testing=Object.freeze({
  logicalRestoreDigest,
  createCrashHook(owner){return{afterOwner:async actual=>{if(actual===owner)throw Object.assign(new Error(`Simulated crash after ${owner}.`),{code:'SIMULATED_PROCESS_CRASH'});}};},
  createFailureHook(owner){return{afterOwner:async actual=>{if(actual===owner)throw Object.assign(new Error(`Injected failure after ${owner}.`),{code:'RESTORE_INJECTED_FAILURE'});}};}
});
