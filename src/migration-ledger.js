import { databaseBlocked,databaseReadOnly,normalizeDatabaseOpenError } from './storage-safety.js';

export const MIGRATION_LEDGER_SCHEMA_VERSION=1;
export const MIGRATION_LEDGER_PREFIX='phase1:migration:';

const DATABASE_ACCESS=new WeakMap();
const clean=value=>String(value??'').trim();
const requestResult=request=>new Promise((resolve,reject)=>{
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
});
const transactionDone=transaction=>new Promise((resolve,reject)=>{
  transaction.oncomplete=()=>resolve();
  transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));
  transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));
});

function typedError(code,message,detail={}){
  return Object.assign(new Error(message),{code,durable:false,...detail});
}

export function defineMigration(input={}){
  const id=clean(input.id);
  const digest=clean(input.digest);
  const targetVersion=Number(input.targetVersion);
  if(!/^[a-z0-9][a-z0-9._-]{2,119}$/i.test(id))throw new TypeError('Migration ID không hợp lệ.');
  if(!digest||digest.length>240)throw new TypeError(`Migration ${id} thiếu digest ổn định.`);
  if(!Number.isInteger(targetVersion)||targetVersion<1)throw new TypeError(`Migration ${id} có targetVersion không hợp lệ.`);
  return Object.freeze({
    id,
    digest,
    targetVersion,
    description:clean(input.description).slice(0,500),
    mode:input.mode==='upgrade'?'upgrade':'adopt',
    apply:typeof input.apply==='function'?input.apply:null
  });
}

export function migrationLedgerKey(id){
  return`${MIGRATION_LEDGER_PREFIX}${clean(id)}`;
}

export function migrationLedgerRecord(migration,{appliedAt=Date.now(),mode=migration.mode}={}){
  return Object.freeze({
    key:migrationLedgerKey(migration.id),
    kind:'migration-ledger-entry',
    schemaVersion:MIGRATION_LEDGER_SCHEMA_VERSION,
    migrationId:migration.id,
    digest:migration.digest,
    targetVersion:migration.targetVersion,
    mode,
    status:'applied',
    appliedAt:Number(appliedAt)
  });
}

function validateMigrationSet(migrations,supportedVersion){
  const normalized=(Array.isArray(migrations)?migrations:[]).map(defineMigration);
  const ids=new Set();
  for(const migration of normalized){
    if(ids.has(migration.id))throw new TypeError(`Migration ID bị trùng: ${migration.id}`);
    if(migration.targetVersion>supportedVersion)throw new TypeError(`Migration ${migration.id} vượt supported version ${supportedVersion}.`);
    ids.add(migration.id);
  }
  return normalized.sort((left,right)=>left.targetVersion-right.targetVersion||left.id.localeCompare(right.id));
}

function validateStoreLayout(database,{requiredStores,allowUnknown=false}){
  const actual=[...database.objectStoreNames];
  const required=[...new Set(requiredStores.map(String))];
  const missing=required.filter(name=>!actual.includes(name));
  const unknown=actual.filter(name=>!required.includes(name));
  if(missing.length)throw typedError('DATABASE_REQUIRED_STORE_MISSING',`${database.name} thiếu store bắt buộc: ${missing.join(', ')}.`,{
    database:database.name,
    version:database.version,
    missingStores:missing,
    recovery:'restore-or-upgrade-required'
  });
  if(unknown.length&&!allowUnknown)throw typedError('DATABASE_UNKNOWN_STORE',`${database.name} có store chưa được build hiện tại nhận diện: ${unknown.join(', ')}.`,{
    database:database.name,
    version:database.version,
    unknownStores:unknown,
    recovery:'use-compatible-build'
  });
}

async function ensureLedger(database,{ledgerStore,migrations}){
  if(!migrations.length)return[];
  const transaction=database.transaction(ledgerStore,'readwrite');
  const store=transaction.objectStore(ledgerStore);
  const applied=[];
  try{
    for(const migration of migrations){
      const key=migrationLedgerKey(migration.id);
      const existing=await requestResult(store.get(key));
      if(existing){
        if(
          existing.kind!=='migration-ledger-entry'
          ||Number(existing.schemaVersion)!==MIGRATION_LEDGER_SCHEMA_VERSION
          ||existing.migrationId!==migration.id
          ||existing.digest!==migration.digest
          ||Number(existing.targetVersion)!==migration.targetVersion
          ||existing.status!=='applied'
        ){
          throw typedError('MIGRATION_LEDGER_DIGEST_MISMATCH',`Ledger ${database.name}/${migration.id} không khớp migration hiện tại.`,{
            database:database.name,
            migrationId:migration.id,
            expectedDigest:migration.digest,
            actualDigest:existing.digest||null,
            recovery:'use-matching-build'
          });
        }
        applied.push(structuredClone(existing));
        continue;
      }
      if(migration.mode==='upgrade'){
        throw typedError('MIGRATION_LEDGER_ENTRY_MISSING',`Migration ${migration.id} cần được ghi atomically trong upgrade transaction.`,{
          database:database.name,
          migrationId:migration.id,
          recovery:'resume-upgrade'
        });
      }
      const record=migrationLedgerRecord(migration,{mode:'adopt'});
      store.add(structuredClone(record));
      applied.push(structuredClone(record));
    }
  }catch(error){
    try{transaction.abort();}catch{}
    throw error;
  }
  await transactionDone(transaction);
  return applied;
}

function applyUpgradeMigrations({database,transaction,migrations,ledgerStore,oldVersion,newVersion}){
  const store=transaction.objectStore(ledgerStore);
  for(const migration of migrations){
    if(migration.mode!=='upgrade'||migration.targetVersion<=oldVersion||migration.targetVersion>newVersion)continue;
    migration.apply?.({database,transaction,oldVersion,newVersion,migration});
    store.add(structuredClone(migrationLedgerRecord(migration,{mode:'upgrade'})));
  }
}

function createReadSafeHandle(database,{supportedVersion}){
  const handle={
    get name(){return database.name;},
    get version(){return database.version;},
    get objectStoreNames(){return database.objectStoreNames;},
    transaction(storeNames,mode='readonly',options){
      if(mode!=='readonly')throw databaseReadOnly(database.name,{actualVersion:database.version,supportedVersion});
      return database.transaction(storeNames,'readonly',options);
    },
    close(){database.close();},
    addEventListener(...args){return database.addEventListener(...args);},
    removeEventListener(...args){return database.removeEventListener(...args);}
  };
  DATABASE_ACCESS.set(handle,Object.freeze({mode:'read-safe',actualVersion:database.version,supportedVersion}));
  return Object.freeze(handle);
}

export function getDatabaseAccess(database){
  return DATABASE_ACCESS.get(database)||Object.freeze({
    mode:'readwrite',
    actualVersion:Number(database?.version||0),
    supportedVersion:Number(database?.version||0)
  });
}

function openFutureReadSafe({name,supportedVersion,requiredStores,onVersionChange}){
  return new Promise((resolve,reject)=>{
    let blocked=false;
    const request=indexedDB.open(name);
    request.onblocked=()=>{
      blocked=true;
      reject(databaseBlocked(name));
    };
    request.onerror=()=>reject(normalizeDatabaseOpenError(request.error,{database:name,supportedVersion}));
    request.onsuccess=()=>{
      const database=request.result;
      if(blocked){database.close();return;}
      try{
        if(database.version<=supportedVersion)throw normalizeDatabaseOpenError(Object.assign(new Error('Schema open race.'),{name:'VersionError'}),{database:name,supportedVersion});
        validateStoreLayout(database,{requiredStores,allowUnknown:true});
        database.onversionchange=()=>{database.close();onVersionChange?.();};
        resolve(createReadSafeHandle(database,{supportedVersion}));
      }catch(error){
        database.close();
        reject(error);
      }
    };
  });
}

export function openForwardCompatibleDatabase({
  name,
  version,
  requiredStores=[],
  ledgerStore,
  migrations=[],
  upgrade,
  onVersionChange
}={}){
  const databaseName=clean(name);
  const supportedVersion=Number(version);
  const normalizedMigrations=validateMigrationSet(migrations,supportedVersion);
  if(!databaseName||!Number.isInteger(supportedVersion)||supportedVersion<1)throw new TypeError('Database name/version không hợp lệ.');
  if(!clean(ledgerStore))throw new TypeError(`${databaseName} thiếu ledgerStore.`);
  return new Promise((resolve,reject)=>{
    let blocked=false;
    let settled=false;
    let upgradeFailure=null;
    const fail=error=>{if(settled)return;settled=true;reject(error);};
    const succeed=value=>{if(settled){value?.close?.();return;}settled=true;resolve(value);};
    const request=indexedDB.open(databaseName,supportedVersion);
    request.onupgradeneeded=event=>{
      const database=request.result;
      const transaction=request.transaction;
      try{
        upgrade?.({database,transaction,oldVersion:Number(event.oldVersion||0),newVersion:Number(event.newVersion||supportedVersion)});
        if(!database.objectStoreNames.contains(ledgerStore))throw typedError('MIGRATION_LEDGER_STORE_MISSING',`${databaseName} thiếu ledger store ${ledgerStore} trong upgrade.`,{
          database:databaseName,
          ledgerStore,
          recovery:'upgrade-handler-required'
        });
        applyUpgradeMigrations({
          database,
          transaction,
          migrations:normalizedMigrations,
          ledgerStore,
          oldVersion:Number(event.oldVersion||0),
          newVersion:Number(event.newVersion||supportedVersion)
        });
      }catch(error){
        upgradeFailure=error;
        try{transaction.abort();}catch{}
      }
    };
    request.onblocked=()=>{
      blocked=true;
      fail(databaseBlocked(databaseName));
    };
    request.onerror=()=>{
      if(upgradeFailure){fail(upgradeFailure);return;}
      const normalized=normalizeDatabaseOpenError(request.error,{database:databaseName,supportedVersion});
      if(normalized.code!=='DATABASE_SCHEMA_TOO_NEW'){fail(normalized);return;}
      openFutureReadSafe({name:databaseName,supportedVersion,requiredStores,onVersionChange}).then(succeed,fail);
    };
    request.onsuccess=async()=>{
      const database=request.result;
      if(blocked){database.close();return;}
      try{
        validateStoreLayout(database,{requiredStores});
        database.onversionchange=()=>{database.close();onVersionChange?.();};
        await ensureLedger(database,{ledgerStore,migrations:normalizedMigrations});
        DATABASE_ACCESS.set(database,Object.freeze({mode:'readwrite',actualVersion:database.version,supportedVersion}));
        succeed(database);
      }catch(error){
        database.close();
        fail(error);
      }
    };
  });
}

export async function listMigrationLedger(database,ledgerStore){
  const transaction=database.transaction(ledgerStore,'readonly');
  const rows=await requestResult(transaction.objectStore(ledgerStore).getAll());
  await transactionDone(transaction);
  return rows
    .filter(row=>row?.kind==='migration-ledger-entry')
    .sort((left,right)=>Number(left.targetVersion)-Number(right.targetVersion)||String(left.migrationId).localeCompare(String(right.migrationId)));
}

export const __testing=Object.freeze({
  createReadSafeHandle,
  ensureLedger,
  applyUpgradeMigrations,
  validateStoreLayout,
  requestResult,
  transactionDone
});
