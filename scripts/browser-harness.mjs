import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, win32 } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export const FAILURE_KIND=Object.freeze({
  infrastructure:'INFRASTRUCTURE_FAILURE',
  product:'PRODUCT_FAILURE'
});

export class InfrastructureFailure extends Error{
  constructor(message,{cause,code='HARNESS_INFRASTRUCTURE'}={}){
    super(message,{cause});this.name='InfrastructureFailure';this.failureKind=FAILURE_KIND.infrastructure;this.code=code;
  }
}

const INFRASTRUCTURE_ERROR_PATTERNS=[
  /\bCDP\b/i,/WebSocket/i,/socket (?:closed|error|hang up)/i,/target (?:closed|not found|detached)/i,
  /browser target/i,/fetch failed/i,/ECONN(?:REFUSED|RESET|ABORTED)/i,/EPIPE/i,/network connection/i
];

const DETERMINISTIC_YOUTUBE_HOST_RULE='--host-resolver-rules=MAP *.youtube.com ~NOTFOUND, MAP youtube.com ~NOTFOUND, MAP *.youtube-nocookie.com ~NOTFOUND, MAP youtube-nocookie.com ~NOTFOUND';

export function classifyHarnessError(error){
  if(error?.failureKind)return error;
  const message=String(error?.message||error||'');
  const code=String(error?.code||'');
  if(INFRASTRUCTURE_ERROR_PATTERNS.some(pattern=>pattern.test(message))||/^(?:ECONN|EPIPE|UND_ERR_)/.test(code)){
    return new InfrastructureFailure(message,{cause:error,code:code||'BROWSER_TRANSPORT_FAILED'});
  }
  return error;
}

export function browserCandidatePaths({platform=process.platform,env=process.env}={}){
  if(platform==='win32')return [
    win32.join(env.PROGRAMFILES||'','Google','Chrome','Application','chrome.exe'),
    win32.join(env['PROGRAMFILES(X86)']||'','Google','Chrome','Application','chrome.exe'),
    win32.join(env.LOCALAPPDATA||'','Google','Chrome','Application','chrome.exe'),
    win32.join(env.PROGRAMFILES||'','Microsoft','Edge','Application','msedge.exe'),
    win32.join(env['PROGRAMFILES(X86)']||'','Microsoft','Edge','Application','msedge.exe'),
    win32.join(env.LOCALAPPDATA||'','Microsoft','Edge','Application','msedge.exe')
  ].filter(Boolean);
  if(platform==='darwin')return [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];
  return ['/usr/bin/google-chrome-stable','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/microsoft-edge','/usr/bin/msedge'];
}

function commandPath(command,{platform=process.platform,spawnSyncImpl=spawnSync}={}){
  const result=spawnSyncImpl(platform==='win32'?'where':'which',[command],{encoding:'utf8',windowsHide:true,timeout:5000});
  if(result.status!==0)return null;
  return String(result.stdout||'').split(/\r?\n/).map(value=>value.trim()).find(Boolean)||null;
}

function browserVersion(path,{platform=process.platform,spawnSyncImpl=spawnSync}={}){
  const result=platform==='win32'
    ? spawnSyncImpl('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-Command','(Get-Item -LiteralPath $env:VOCAB_BROWSER_VERSION_PATH).VersionInfo.ProductVersion'],{encoding:'utf8',windowsHide:true,timeout:8000,env:{...process.env,VOCAB_BROWSER_VERSION_PATH:path}})
    : spawnSyncImpl(path,['--version'],{encoding:'utf8',windowsHide:true,timeout:8000});
  if(result.error||result.status!==0)return 'version unavailable';
  return String(result.stdout||result.stderr||'version unavailable').trim().split(/\r?\n/)[0]||'version unavailable';
}

export function resolveBrowserExecutable({
  platform=process.platform,
  env=process.env,
  exists=existsSync,
  spawnSyncImpl=spawnSync,
  commands=['google-chrome-stable','google-chrome','chromium','chromium-browser','microsoft-edge','msedge']
}={}){
  const override=env.VOCAB_BROWSER_BIN||env.CHROME_BIN;
  if(override){
    if(!exists(override))throw new InfrastructureFailure(`Browser override does not exist: ${override}`,{code:'BROWSER_OVERRIDE_INVALID'});
    return{path:override,source:env.VOCAB_BROWSER_BIN?'VOCAB_BROWSER_BIN':'CHROME_BIN',version:browserVersion(override,{platform,spawnSyncImpl})};
  }
  for(const command of commands){
    const path=commandPath(command,{platform,spawnSyncImpl});
    if(path&&exists(path))return{path,source:`PATH:${command}`,version:browserVersion(path,{platform,spawnSyncImpl})};
  }
  const path=browserCandidatePaths({platform,env}).find(candidate=>candidate&&exists(candidate));
  if(path)return{path,source:'known-install-location',version:browserVersion(path,{platform,spawnSyncImpl})};
  throw new InfrastructureFailure('Chrome, Chromium or Edge is required; deterministic browser discovery found no executable.',{code:'BROWSER_NOT_FOUND'});
}

export function browserLaunchArguments({profileDir,debugPort,appUrl,extra=[]}){
  if(!profileDir||!Number.isInteger(Number(debugPort))||!appUrl)throw new InfrastructureFailure('Browser launch requires an isolated profile, integer CDP port and application URL.',{code:'BROWSER_LAUNCH_INVALID'});
  return [
    '--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
    '--disable-extensions','--disable-component-extensions-with-background-pages','--disable-default-apps','--disable-component-update',
    '--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-sync',
    '--disable-breakpad','--disable-crash-reporter','--metrics-recording-only','--no-first-run','--no-default-browser-check',
    DETERMINISTIC_YOUTUBE_HOST_RULE,
    `--remote-debugging-port=${Number(debugPort)}`,`--user-data-dir=${profileDir}`,...extra,appUrl
  ];
}

export async function waitForHttp(url,{attempts=100,interval=200,processRecord,label='HTTP endpoint'}={}){
  let lastError;
  for(let attempt=0;attempt<attempts;attempt+=1){
    if(processRecord?.spawnError)throw new InfrastructureFailure(`${processRecord.label} failed to spawn: ${processRecord.spawnError.message}`,{cause:processRecord.spawnError,code:'PROCESS_SPAWN_FAILED'});
    if(processRecord?.child?.exitCode!==null&&processRecord?.child?.exitCode!==undefined)throw new InfrastructureFailure(`${processRecord.label} exited before ${label} was ready (exit ${processRecord.child.exitCode}).`,{code:'PROCESS_EARLY_EXIT'});
    try{const response=await fetch(url);if(response.ok)return response;lastError=new Error(`${url} returned ${response.status}`);}
    catch(error){lastError=error;}
    await delay(interval);
  }
  throw new InfrastructureFailure(`Timed out waiting for ${label} at ${url}: ${lastError?.message||'no response'}`,{cause:lastError,code:'READINESS_TIMEOUT'});
}

async function portIsFree(port,host='127.0.0.1'){
  return new Promise((resolve,reject)=>{
    const server=createServer();
    server.unref();
    server.once('error',error=>{if(error.code==='EADDRINUSE'||error.code==='EACCES')resolve(false);else reject(error);});
    server.listen({host,port,exclusive:true},()=>server.close(error=>error?reject(error):resolve(true)));
  });
}

export async function assertPortsFree(ports,{label='browser harness'}={}){
  for(const port of [...new Set(ports.map(Number).filter(Number.isInteger))]){
    if(!(await portIsFree(port)))throw new InfrastructureFailure(`${label} requires port ${port}, but it is already in use.`,{code:'PORT_OCCUPIED'});
  }
}

async function waitForPortsFree(ports,{attempts=20,interval=100}={}){
  let occupied=[];
  for(let attempt=0;attempt<attempts;attempt+=1){
    occupied=[];
    for(const port of [...new Set(ports)])if(!(await portIsFree(port)))occupied.push(port);
    if(!occupied.length)return;
    await delay(interval*Math.min(attempt+1,5));
  }
  throw new InfrastructureFailure(`Ports remained occupied after cleanup: ${occupied.join(', ')}`,{code:'PORT_CLEANUP_FAILED'});
}

function childHasExited(child){return !child||child.exitCode!==null||child.signalCode!==null;}

async function waitForChildExit(child,timeoutMs){
  if(childHasExited(child))return true;
  return new Promise(resolve=>{
    let settled=false;
    const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);child.off('exit',onExit);resolve(value);};
    const onExit=()=>finish(true);
    const timer=setTimeout(()=>finish(false),timeoutMs);
    child.once('exit',onExit);
  });
}

function posixProcessGroupExists(pid){
  try{process.kill(-pid,0);return true;}catch(error){if(error?.code==='EPERM')return true;if(error?.code==='ESRCH')return false;throw error;}
}

async function waitForPosixProcessGroupExit(pid,timeoutMs){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){if(!posixProcessGroupExists(pid))return true;await delay(50);}
  return !posixProcessGroupExists(pid);
}

export async function terminateProcessTree(record,{graceMs=1200,platform=process.platform}={}){
  const child=record?.child;if(!child)return;
  if(platform==='win32'){
    if(childHasExited(child))return;
    spawnSync('taskkill',['/PID',String(child.pid),'/T'],{encoding:'utf8',windowsHide:true,timeout:5000});
    if(!(await waitForChildExit(child,graceMs)))spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{encoding:'utf8',windowsHide:true,timeout:5000});
  }else{
    if(!Number.isInteger(child.pid))return;
    if(posixProcessGroupExists(child.pid))try{process.kill(-child.pid,'SIGTERM');}catch(error){if(error?.code!=='ESRCH')throw error;}
    if(!(await waitForPosixProcessGroupExit(child.pid,graceMs))){
      try{process.kill(-child.pid,'SIGKILL');}catch(error){if(error?.code!=='ESRCH')throw error;}
      if(!(await waitForPosixProcessGroupExit(child.pid,graceMs)))throw new InfrastructureFailure(`${record.label} process group ${child.pid} retained descendants after bounded termination.`,{code:'PROCESS_TREE_CLEANUP_FAILED'});
    }
  }
  if(!(await waitForChildExit(child,graceMs)))throw new InfrastructureFailure(`${record.label} process ${child.pid} did not exit after bounded termination.`,{code:'PROCESS_CLEANUP_FAILED'});
}

export async function removeDirectoryWithRetry(path,{attempts=8,baseDelayMs=80,remove=rm,exists=existsSync}={}){
  let lastError;
  for(let attempt=0;attempt<attempts;attempt+=1){
    try{await remove(path,{recursive:true,force:true});if(!exists(path))return;lastError=new Error('directory still exists after rm');}
    catch(error){lastError=error;}
    await delay(baseDelayMs*Math.min(2**attempt,8));
  }
  throw new InfrastructureFailure(`Temporary profile cleanup failed after ${attempts} attempts: ${path} (${lastError?.code||lastError?.message||'unknown'})`,{cause:lastError,code:'PROFILE_CLEANUP_FAILED'});
}

export function combineHarnessFailures(primary,failures){
  if(!failures.length)return primary;
  const details=failures.map(error=>error.stack||error.message||String(error)).join('\n--- cleanup failure ---\n');
  if(primary){primary.cleanupFailures=failures;primary.message+=`\n\n[INFRASTRUCTURE_FAILURE during cleanup]\n${details}`;return primary;}
  return new InfrastructureFailure(`Browser harness cleanup failed:\n${details}`,{cause:failures[0],code:'HARNESS_CLEANUP_FAILED'});
}

export async function withBrowserHarness({name,profilePrefix,ports=[]},operation){
  const records=[];
  const profileDirs=[];
  let primaryError;let result;
  try{
    await assertPortsFree(ports,{label:name});
    const browser=resolveBrowserExecutable();
    const profileDir=await mkdtemp(join(tmpdir(),profilePrefix));profileDirs.push(profileDir);
    console.log(`[HARNESS] ${name} browser: ${browser.path} · ${browser.version} · ${browser.source}`);
    const spawnTracked=(label,command,args,options={})=>{
      const child=spawn(command,args,{...options,windowsHide:true,detached:options.detached??process.platform!=='win32'});
      const record={label,child,spawnError:null};records.push(record);
      child.once('error',error=>{record.spawnError=error;});
      return record;
    };
    result=await operation({browser,profileDir,spawnTracked});
  }catch(error){primaryError=classifyHarnessError(error);}

  const cleanupFailures=[];
  for(const record of [...records].reverse())try{await terminateProcessTree(record);}catch(error){cleanupFailures.push(error);}
  try{await waitForPortsFree(ports);}catch(error){cleanupFailures.push(error);}
  for(const profileDir of profileDirs)try{await removeDirectoryWithRetry(profileDir);}catch(error){cleanupFailures.push(error);}

  const finalError=combineHarnessFailures(primaryError,cleanupFailures);
  if(finalError){if(!finalError.failureKind)finalError.failureKind=FAILURE_KIND.product;throw finalError;}
  return result;
}

export async function runBrowserSuite(name,operation){
  try{return await operation();}
  catch(error){
    error=classifyHarnessError(error);
    const kind=error.failureKind||FAILURE_KIND.product;
    if(!String(error.message||'').startsWith(`[${kind}]`))error.message=`[${kind}] ${name}: ${error.message||error}`;
    throw error;
  }
}
