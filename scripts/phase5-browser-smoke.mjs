import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { browserLaunchArguments,runBrowserSuite,waitForHttp,withBrowserHarness } from './browser-harness.mjs';

const APP_PORT=3015,DEBUG_PORT=9565,APP_URL=`http://127.0.0.1:${APP_PORT}/#ielts`;

async function websocketText(data){
  if(typeof data==='string')return data;if(data&&typeof data.text==='function')return data.text();if(data instanceof ArrayBuffer)return new TextDecoder().decode(data);if(ArrayBuffer.isView(data))return new TextDecoder().decode(data);return String(data);
}

class CdpClient{
  constructor(url){this.url=url;this.nextId=1;this.pending=new Map();this.listeners=new Map();}
  async connect(){this.socket=new WebSocket(this.url);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('CDP open timeout')),8000);this.socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});this.socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP socket error'));},{once:true});});this.socket.addEventListener('message',async event=>{const message=JSON.parse(await websocketText(event.data));if(message.id){const pending=this.pending.get(message.id);if(!pending)return;this.pending.delete(message.id);clearTimeout(pending.timer);message.error?pending.reject(new Error(message.error.message)):pending.resolve(message.result||{});return;}for(const listener of this.listeners.get(message.method)||[])listener(message.params||{});});}
  on(method,listener){this.listeners.set(method,[...(this.listeners.get(method)||[]),listener]);}
  send(method,params={},timeoutMs=15000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
  close(){try{this.socket?.close();}catch{}}
}

async function main(){
  await withBrowserHarness({name:'Phase 5 browser smoke',profilePrefix:'vocab-phase5-smoke-',ports:[APP_PORT,DEBUG_PORT]},async({browser,profileDir,spawnTracked})=>{
    let serverOutput='',browserOutput='',cdp;
    const server=spawnTracked('Phase 5 Vite server',process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(APP_PORT),'--strictPort'],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development'}});
    server.child.stdout.on('data',chunk=>serverOutput+=chunk);server.child.stderr.on('data',chunk=>serverOutput+=chunk);
    try{
      await waitForHttp(APP_URL,{processRecord:server,label:'Phase 5 Vite server'});
      const chrome=spawnTracked('Phase 5 browser',browser.path,browserLaunchArguments({profileDir,debugPort:DEBUG_PORT,appUrl:APP_URL}),{stdio:['ignore','pipe','pipe']});
      chrome.child.stdout.on('data',chunk=>browserOutput+=chunk);chrome.child.stderr.on('data',chunk=>browserOutput+=chunk);
      await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`,{processRecord:chrome,label:'Phase 5 browser CDP'});
      let target;for(let attempt=0;attempt<100&&!target;attempt+=1){const targets=await(await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();target=targets.find(item=>item.type==='page'&&String(item.url).startsWith(`http://127.0.0.1:${APP_PORT}`));if(!target)await delay(100);}
      assert.ok(target?.webSocketDebuggerUrl,'VocabMaster Phase 5 target not found.');cdp=new CdpClient(target.webSocketDebuggerUrl);await cdp.connect();
      const runtimeErrors=[];cdp.on('Runtime.exceptionThrown',params=>runtimeErrors.push(params.exceptionDetails?.exception?.description||params.exceptionDetails?.text||'Runtime exception'));cdp.on('Runtime.consoleAPICalled',params=>{if(params.type==='error')runtimeErrors.push((params.args||[]).map(arg=>arg.value??arg.description??'').join(' '));});
      await cdp.send('Page.enable');await cdp.send('Runtime.enable');
      const evaluate=async expression=>{const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Runtime evaluation failed');return result.result?.value;};
      const waitFor=async(expression,label)=>{for(let attempt=0;attempt<180;attempt+=1){if(await evaluate(`Boolean(${expression})`))return;await delay(100);}throw new Error(`Timed out waiting for ${label}.`);};

      await cdp.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
      await waitFor('window.__VOCAB_V10_READY__&&window.VocabMasterIeltsHub&&window.VocabMasterTranscriptResolver','Phase 5 runtime');
      await evaluate('window.VocabMasterIeltsHub.open("videos")');await waitFor('document.querySelector("[data-phase5-fallback]")','desktop fallback UI');
      const desktop=await evaluate(`(()=>{const root=document.querySelector('[data-phase5-fallback]');return{device:root?.querySelector('[data-phase5-device]')?.dataset.phase5Device,local:Boolean(root?.querySelector('[data-phase5-local]')),localChecked:root?.querySelector('[data-phase5-local]')?.checked===true,cloudDisabled:root?.querySelector('[data-phase5-cloud]')?.disabled===true,cloudChecked:root?.querySelector('[data-phase5-cloud]')?.checked===true,hasDisclosure:/Dữ liệu:/.test(root?.textContent||''),hasImport:Boolean(root?.querySelector('[data-phase5-import-submit]'))};})()`);
      assert.deepEqual(desktop,{device:'desktop',local:true,localChecked:false,cloudDisabled:true,cloudChecked:false,hasDisclosure:true,hasImport:true});

      await evaluate(`(()=>{const root=document.querySelector('[data-phase5-fallback]');root.open=true;root.querySelector('[data-phase5-import-text]').value='00:00:00,000 --> 00:00:02,000\\nBrowser imported sentence.\\n\\n00:00:02,000 --> 00:00:04,000\\nDurable after reload.';root.querySelector('[data-phase5-import-submit]').click();})()`);
      await waitFor('/Đã import/.test(document.querySelector("[data-phase5-status]")?.textContent||"")','validated import');
      const beforeReload=await evaluate(`(async()=>{const rows=await window.VocabMasterTranscriptResolver.list();const row=rows.find(item=>item.provider==='imported'&&item.segments?.some(segment=>segment.text==='Browser imported sentence.'));return row&&{provider:row.provider,count:row.segments.length,revisionId:row.transcriptRevisionId,privateSource:row.transcriptSourceId.includes(':private:')};})()`);
      assert.equal(beforeReload.provider,'imported');assert.equal(beforeReload.count,2);assert.equal(beforeReload.privateSource,true);assert.match(beforeReload.revisionId,/^transcript-revision:/);

      await cdp.send('Page.reload',{ignoreCache:true});await delay(500);await waitFor('window.__VOCAB_V10_READY__&&window.VocabMasterIeltsHub&&window.VocabMasterTranscriptResolver','reload runtime');
      const afterReload=await evaluate(`(async()=>{const rows=await window.VocabMasterTranscriptResolver.list();const row=rows.find(item=>item.transcriptRevisionId===${JSON.stringify(beforeReload.revisionId)});return row&&{provider:row.provider,count:row.segments.length,revisionId:row.transcriptRevisionId};})()`);
      assert.deepEqual(afterReload,{provider:'imported',count:2,revisionId:beforeReload.revisionId});

      await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('window.VocabMasterIeltsHub.open("videos")');await waitFor('document.querySelector("[data-phase5-device=\\"mobile\\"]")','mobile fallback UI');
      const mobile=await evaluate(`(()=>{const root=document.querySelector('[data-phase5-fallback]');return{width:document.documentElement.clientWidth,device:root?.querySelector('[data-phase5-device]')?.dataset.phase5Device,local:Boolean(root?.querySelector('[data-phase5-local]')),hasImport:Boolean(root?.querySelector('[data-phase5-import-submit]')),copy:root?.textContent?.includes('không chạy yt-dlp/Whisper cục bộ')===true};})()`);
      assert.ok(mobile.width<=390);assert.deepEqual({...mobile,width:undefined},{width:undefined,device:'mobile',local:false,hasImport:true,copy:true});
      const serious=runtimeErrors.filter(text=>text&&!/favicon|net::ERR_ABORTED|speech|AudioContext|Failed to load resource/i.test(text));assert.deepEqual(serious,[],`Runtime errors: ${serious.join('\n')}`);
      console.log(JSON.stringify({ok:true,captionFirst:true,desktopDefaults:desktop,importRevisionId:beforeReload.revisionId,reloadDurable:true,mobileCapability:mobile,liveProviders:false},null,2));
    }catch(error){error.message+=`\n\nVite output:\n${serverOutput.slice(-5000)}\n\nBrowser output:\n${browserOutput.slice(-5000)}`;throw error;}finally{cdp?.close();}
  });
}

await runBrowserSuite('Phase 5 browser smoke',main);
