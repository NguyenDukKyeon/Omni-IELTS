import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const PORT=3001;
const DEBUG_PORT=9334;
const APP_URL=`http://127.0.0.1:${PORT}/#today`;

function commandPath(command){
  const result=spawnSync(process.platform==='win32'?'where':'which',[command],{encoding:'utf8'});
  if(result.status!==0)return null;
  return String(result.stdout||'').split(/\r?\n/).map(value=>value.trim()).find(Boolean)||null;
}
function findBrowser(){
  if(process.env.CHROME_BIN&&existsSync(process.env.CHROME_BIN))return process.env.CHROME_BIN;
  for(const command of ['google-chrome-stable','google-chrome','chromium','chromium-browser','msedge']){const value=commandPath(command);if(value)return value;}
  const candidates=process.platform==='win32'
    ? [
        join(process.env.PROGRAMFILES||'','Google','Chrome','Application','chrome.exe'),
        join(process.env.LOCALAPPDATA||'','Google','Chrome','Application','chrome.exe'),
        join(process.env.PROGRAMFILES||'','Microsoft','Edge','Application','msedge.exe')
      ]
    : ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
  return candidates.find(path=>path&&existsSync(path))||null;
}
async function waitForHttp(url,attempts=80){
  let last;
  for(let index=0;index<attempts;index+=1){try{const response=await fetch(url);if(response.ok)return;}catch(error){last=error;}await delay(150);}
  throw last||new Error(`Timed out waiting for ${url}`);
}
async function websocketText(data){if(typeof data==='string')return data;if(data&&typeof data.text==='function')return data.text();if(data instanceof ArrayBuffer)return new TextDecoder().decode(data);if(ArrayBuffer.isView(data))return new TextDecoder().decode(data);return String(data);}

class Cdp{
  constructor(url){this.url=url;this.id=0;this.pending=new Map();this.listeners=new Map();}
  async connect(){
    this.socket=new WebSocket(this.url);
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('CDP connect timeout')),8000);this.socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});this.socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP connection failed'));},{once:true});});
    this.socket.addEventListener('message',async event=>{
      const message=JSON.parse(await websocketText(event.data));
      if(message.id){const pending=this.pending.get(message.id);if(!pending)return;this.pending.delete(message.id);clearTimeout(pending.timer);if(message.error)pending.reject(new Error(message.error.message));else pending.resolve(message.result||{});return;}
      for(const listener of this.listeners.get(message.method)||[])listener(message.params||{});
    });
  }
  on(method,listener){const list=this.listeners.get(method)||[];list.push(listener);this.listeners.set(method,list);}
  send(method,params={},timeout=10_000){const id=++this.id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},timeout);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
  close(){try{this.socket?.close();}catch{}}
}

async function main(){
  const browserPath=findBrowser();
  if(!browserPath){if(process.env.ALLOW_BROWSER_SMOKE_SKIP==='1'){console.log('Hardening browser smoke skipped: Chrome/Edge not found.');return;}throw new Error('Chrome, Chromium or Edge is required.');}
  const profile=await mkdtemp(join(tmpdir(),'vocab-hardening-'));
  let serverOutput='';let browserOutput='';let server;let browser;let cdp;
  try{
    server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(PORT),'--strictPort'],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development'}});
    server.stdout.on('data',chunk=>serverOutput+=chunk);server.stderr.on('data',chunk=>serverOutput+=chunk);
    await waitForHttp(`http://127.0.0.1:${PORT}/`);
    browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--disable-extensions','--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${DEBUG_PORT}`,`--user-data-dir=${profile}`,APP_URL],{stdio:['ignore','pipe','pipe']});
    browser.stdout.on('data',chunk=>browserOutput+=chunk);browser.stderr.on('data',chunk=>browserOutput+=chunk);
    await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    let target;
    for(let index=0;index<100&&!target;index+=1){const targets=await(await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();target=targets.find(item=>item.type==='page'&&String(item.url).startsWith(`http://127.0.0.1:${PORT}`)&&item.title==='Vocab Master');if(!target)await delay(100);}
    assert.ok(target?.webSocketDebuggerUrl,'Vocab Master target not found.');
    cdp=new Cdp(target.webSocketDebuggerUrl);await cdp.connect();
    const runtimeErrors=[];
    cdp.on('Runtime.exceptionThrown',params=>runtimeErrors.push(params.exceptionDetails?.exception?.description||params.exceptionDetails?.text||'Runtime exception'));
    cdp.on('Runtime.consoleAPICalled',params=>{if(params.type==='error')runtimeErrors.push((params.args||[]).map(arg=>arg.value??arg.description??'').join(' ')||'console.error');});
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');
    const evaluate=async expression=>{const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;};
    const waitFor=async(expression,label,attempts=100)=>{for(let index=0;index<attempts;index+=1){if(await evaluate(`Boolean(${expression})`))return;await delay(100);}throw new Error(`Timed out waiting for ${label}`);};

    await waitFor('window.VocabMasterApp&&window.VocabMasterPersistence','app and persistence');

    await evaluate("document.getElementById('topProfileButton').click()");
    await waitFor("document.getElementById('settingsDialog').open",'settings open');
    const tabState=await evaluate(`(()=>({
      tabs:document.querySelectorAll('[data-settings-tab]').length,
      active:document.querySelector('[data-settings-tab].active')?.dataset.settingsTab
    }))()`);
    assert.equal(tabState.tabs,4,'Settings does not expose four tabs.');
    assert.equal(tabState.active,'learning','Settings did not open on learning tab.');
    await evaluate("document.querySelector('[data-settings-tab=\"data\"]').click()");
    await waitFor("!document.querySelector('[data-settings-panel=\"data\"]').hidden",'data settings panel');
    assert.equal(await evaluate("Boolean(document.getElementById('pwaStatus')&&document.getElementById('persistenceStatus'))"),true,'Data/PWA controls are missing.');
    await evaluate("document.querySelector('#settingsDialog [data-close-dialog]').click()");

    const term=`idb-hardening-${Date.now()}`;
    await evaluate(`(()=>{document.querySelector('[data-route="capture"]').click();document.getElementById('wordInput').value=${JSON.stringify(term)};document.getElementById('meaningInput').value='kiểm tra IndexedDB';document.getElementById('addWordForm').requestSubmit();})()`);
    await waitFor(`window.VocabMasterPersistence&&window.VocabMasterPersistence.getCurrentState().cards.some(card=>card.front===${JSON.stringify(term)})`,'card persisted to repository state');
    await cdp.send('Page.reload',{ignoreCache:true});
    await waitFor('window.VocabMasterApp&&window.VocabMasterPersistence','app after reload');
    await waitFor(`window.VocabMasterApp&&window.VocabMasterApp.getState().cards.some(card=>card.front===${JSON.stringify(term)})`,'card restored from IndexedDB');

    await evaluate("document.querySelector('[data-route=\"today\"]').click();document.getElementById('weakPractice').click()");
    await waitFor("document.getElementById('studyOverlay').classList.contains('open')",'weak fallback study');
    assert.equal(await evaluate("document.getElementById('studyLabel').textContent"),'Ôn nhanh','Weak mode did not fall back to quick review.');
    assert.match(await evaluate("document.getElementById('toast').textContent"),/Chưa có từ yếu/);
    await evaluate("document.getElementById('closeStudy').click()");

    await evaluate(`(()=>{
      Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>Promise.reject(Object.assign(new Error('Quyền microphone bị từ chối.'),{name:'NotAllowedError'}))}});
      window.VocabMasterApp.startStudy('pronunciation');
    })()`);
    await waitFor("document.getElementById('recordPronunciation')",'pronunciation exercise');
    await evaluate("document.getElementById('recordPronunciation').click()");
    await waitFor("document.querySelector('#pronunciationResult .microphone-help')",'microphone denied help');
    const micState=await evaluate(`(()=>({
      studyOpen:document.getElementById('studyOverlay').classList.contains('open'),
      good:Boolean(document.getElementById('pronunciationManualGood')),
      hard:Boolean(document.getElementById('pronunciationManualHard')),
      help:document.querySelector('#pronunciationResult .microphone-help')?.textContent||''
    }))()`);
    assert.equal(micState.studyOpen,true,'Microphone denial closed the study session.');
    assert.equal(micState.good&&micState.hard,true,'Manual pronunciation fallback is missing.');
    assert.match(micState.help,/microphone/i);
    await evaluate("document.getElementById('closeStudy').click()");

    assert.deepEqual(runtimeErrors,[],`Runtime errors:\n${runtimeErrors.join('\n')}`);
    console.log('Hardening browser smoke passed: Settings tabs, explicit IndexedDB restore, weak fallback and microphone-denied recovery are operational.');
  }catch(error){error.message+=`\n\nVite output:\n${serverOutput.slice(-4000)}\n\nBrowser output:\n${browserOutput.slice(-4000)}`;throw error;}
  finally{cdp?.close();try{browser?.kill('SIGTERM');}catch{}try{server?.kill('SIGTERM');}catch{}await delay(250);try{browser?.kill('SIGKILL');}catch{}try{server?.kill('SIGKILL');}catch{}await rm(profile,{recursive:true,force:true});}
}

await main();
