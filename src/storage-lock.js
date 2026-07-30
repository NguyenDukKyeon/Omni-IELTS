const LOCK_NAME='vocab-master-durable-storage-v1';
const activeRestoreTokens=new WeakSet();
let localReaders=0;
let localWriter=false;
const localWaiters=[];
let webSharedLease=null;
let webSharedReady=null;
let releaseWebShared=null;
let webSharedUsers=0;

function browserRequiresWebLocks(){
  return typeof document!=='undefined';
}

function drainLocalWaiters(){
  if(localWriter||localReaders)return;
  const first=localWaiters[0];if(!first)return;
  if(first.mode==='exclusive'){
    localWaiters.shift();localWriter=true;first.resolve(()=>{localWriter=false;drainLocalWaiters();});return;
  }
  while(localWaiters[0]?.mode==='shared'){
    const waiter=localWaiters.shift();localReaders+=1;waiter.resolve(()=>{localReaders-=1;drainLocalWaiters();});
  }
}

function acquireLocal(mode){
  return new Promise(resolve=>{
    if(mode==='shared'&&!localWriter&&(localReaders>0||!localWaiters.some(waiter=>waiter.mode==='exclusive'))){
      localReaders+=1;resolve(()=>{localReaders-=1;drainLocalWaiters();});return;
    }
    if(mode==='exclusive'&&!localWriter&&localReaders===0&&localWaiters.length===0){
      localWriter=true;resolve(()=>{localWriter=false;drainLocalWaiters();});return;
    }
    localWaiters.push({mode,resolve});
  });
}

async function runLocally(mode,task){
  const release=await acquireLocal(mode);
  try{return await task();}
  finally{release();}
}

function webLocks(){
  return globalThis.navigator?.locks?.request?globalThis.navigator.locks:null;
}

function lockUnavailable(){
  return Object.assign(new Error('Trình duyệt không hỗ trợ Web Locks; restore bị chặn để tránh ghi đồng thời từ tab khác.'),{
    code:'STORAGE_LOCK_UNAVAILABLE',
    durable:false
  });
}

async function requestLock(mode,task){
  const locks=webLocks();
  if(locks&&mode==='exclusive')return locks.request(LOCK_NAME,{mode},task);
  if(locks){
    if(!webSharedLease){
      let ready;
      webSharedReady=new Promise(resolve=>{ready=resolve;});
      const held=new Promise(resolve=>{releaseWebShared=resolve;});
      webSharedLease=locks.request(LOCK_NAME,{mode:'shared'},async()=>{ready();await held;});
    }
    const lease=webSharedLease;const ready=webSharedReady;webSharedUsers+=1;await ready;
    try{return await task();}
    finally{
      webSharedUsers-=1;
      if(webSharedUsers===0){
        const release=releaseWebShared;
        webSharedLease=null;webSharedReady=null;releaseWebShared=null;
        release();await lease;
      }
    }
  }
  if(browserRequiresWebLocks())throw lockUnavailable();
  return runLocally(mode,task);
}

export function withDurableWriteLock(task,restoreToken=null){
  if(restoreToken&&activeRestoreTokens.has(restoreToken))return task();
  return requestLock('shared',task);
}

export function withExclusiveStorageLock(task){
  return requestLock('exclusive',async()=>{
    const restoreToken=Object.freeze({lock:LOCK_NAME});
    activeRestoreTokens.add(restoreToken);
    try{return await task(restoreToken);}
    finally{activeRestoreTokens.delete(restoreToken);}
  });
}

export function assertActiveRestoreToken(restoreToken){
  if(!restoreToken||!activeRestoreTokens.has(restoreToken))throw Object.assign(new Error('Low-level restore write bị chặn; phải đi qua restore coordinator.'),{
    code:'RESTORE_COORDINATOR_REQUIRED',
    durable:false
  });
  return restoreToken;
}

export const __testing=Object.freeze({LOCK_NAME,browserRequiresWebLocks});
