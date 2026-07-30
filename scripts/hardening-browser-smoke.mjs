import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { browserLaunchArguments, runBrowserSuite, waitForHttp, withBrowserHarness } from './browser-harness.mjs';

const PORT=3001;
const DEBUG_PORT=9334;
const APP_URL=`http://127.0.0.1:${PORT}/#today`;

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
  await withBrowserHarness({name:'Hardening browser smoke',profilePrefix:'vocab-hardening-',ports:[PORT,DEBUG_PORT]},async({browser:browserInfo,profileDir,spawnTracked})=>{
    let serverOutput='';let browserOutput='';let browser;let cdp;
    const serverRecord=spawnTracked('Hardening Vite server',process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(PORT),'--strictPort'],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development'}});
    const server=serverRecord.child;
    try{
    server.stdout.on('data',chunk=>serverOutput+=chunk);server.stderr.on('data',chunk=>serverOutput+=chunk);
    await waitForHttp(`http://127.0.0.1:${PORT}/`,{processRecord:serverRecord,label:'Hardening Vite server'});
    const browserRecord=spawnTracked('Hardening browser',browserInfo.path,browserLaunchArguments({profileDir,debugPort:DEBUG_PORT,appUrl:APP_URL}),{stdio:['ignore','pipe','pipe']});
    browser=browserRecord.child;
    browser.stdout.on('data',chunk=>browserOutput+=chunk);browser.stderr.on('data',chunk=>browserOutput+=chunk);
    await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`,{processRecord:browserRecord,label:'Hardening browser CDP'});
    let target;
    for(let index=0;index<100&&!target;index+=1){const targets=await(await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();target=targets.find(item=>item.type==='page'&&String(item.url).startsWith(`http://127.0.0.1:${PORT}`)&&item.title==='Vocab Master');if(!target)await delay(100);}
    assert.ok(target?.webSocketDebuggerUrl,'Vocab Master target not found.');
    cdp=new Cdp(target.webSocketDebuggerUrl);await cdp.connect();
    const runtimeErrors=[];
    cdp.on('Runtime.exceptionThrown',params=>runtimeErrors.push(params.exceptionDetails?.exception?.description||params.exceptionDetails?.text||'Runtime exception'));
    cdp.on('Runtime.consoleAPICalled',params=>{if(params.type==='error')runtimeErrors.push((params.args||[]).map(arg=>arg.value??arg.description??'').join(' ')||'console.error');});
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');
    const evaluate=async expression=>{const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;};
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

    const interruptedTerm=`restore-interrupted-${Date.now()}`;
    const restoreTargetDigest=await evaluate(`(async()=>{const module=await import('/src/ielts-backup.js');window.__P0_RESTORE_TARGET__=await module.buildCombinedBackup();return window.__P0_RESTORE_TARGET__.payloadDigest;})()`);
    assert.match(restoreTargetDigest,/^sha256:/,'Restore browser fixture did not capture a canonical target.');
    await evaluate(`(()=>{document.querySelector('[data-route="capture"]').click();document.getElementById('wordInput').value=${JSON.stringify(interruptedTerm)};document.getElementById('meaningInput').value='must roll forward to target';document.getElementById('addWordForm').requestSubmit();})()`);
    await waitFor(`window.VocabMasterPersistence.getCurrentState().cards.some(card=>card.front===${JSON.stringify(interruptedTerm)})`,'post-backup mutation');
    const crash=await evaluate(`(async()=>{const module=await import('/src/ielts-backup.js');try{await module.restoreCombinedBackup(window.__P0_RESTORE_TARGET__,{hooks:module.__testing.createCrashHook('ielts')});return{code:'unexpected-success'};}catch(error){return{code:error.code,recoveryPending:error.recoveryPending===true};}})()`);
    assert.deepEqual(crash,{code:'SIMULATED_PROCESS_CRASH',recoveryPending:true},'Browser restore fixture did not leave a recoverable journal.');
    await evaluate("window.__P0_RELOAD_MARKER__='old-context'");
    await cdp.send('Page.reload',{ignoreCache:true});
    await waitFor("window.__P0_RELOAD_MARKER__!=='old-context'&&window.__VOCAB_BOOTED__&&window.VocabMasterApp&&window.VocabMasterPersistence",'startup restore recovery');
    assert.equal(await evaluate(`window.VocabMasterApp.getState().cards.some(card=>card.front===${JSON.stringify(term)})`),true,'Startup recovery lost the target card.');
    assert.equal(await evaluate(`window.VocabMasterApp.getState().cards.some(card=>card.front===${JSON.stringify(interruptedTerm)})`),false,'Startup recovery did not restore the exact pre-mutation target.');
    assert.equal(await evaluate("(async()=>{const core=await import('/src/persistence.js');return (await core.readCoreRestoreJournal())===undefined;})()"),true,'Startup recovery left an active restore journal.');

    const staleProbe=await evaluate(`(async()=>{document.querySelector('[data-route="today"]').click();const rows=await (await import('/src/v10-persistence.js')).listV10Records('activities',{sortBy:null});const activity=rows.find(row=>row.planDate&&['core-card','core-intro'].includes(row.execution?.kind)&&row.target?.cardId&&window.VocabMasterApp.getState().cards.some(card=>card.id===row.target.cardId));if(!activity)return{available:false};const before=(await (await import('/src/persistence.js')).listReviewEvents()).length;const next=window.VocabMasterApp.getState();window.__P0_STALE_ORIGINAL_STATE__=structuredClone(next);next.cards=next.cards.filter(card=>card.id!==activity.target.cardId);window.dispatchEvent(new CustomEvent('vocab:external-change',{detail:{state:next,reason:'stale-today-browser-fixture'}}));await window.VocabMasterTodayV2.refresh();return{available:true,activityId:activity.id,cardId:activity.target.cardId,before};})()`);
    assert.equal(staleProbe.available,true,'Hardening fixture did not find a planned Core activity.');
    await waitFor(`document.querySelector('[data-v10-activity=${JSON.stringify(staleProbe.activityId)}]')`,'stale Today activity remains bound after external change');
    await waitFor(`(()=>{const button=document.querySelector('[data-v10-activity=${JSON.stringify(staleProbe.activityId)}]');return button&&!button.disabled&&document.getElementById('v10TodayPlan')?.getAttribute('aria-busy')!=='true';})()`,'stale Today launcher readiness');
    await evaluate(`document.querySelector('[data-v10-activity=${JSON.stringify(staleProbe.activityId)}]').click()`);
    await waitFor("document.getElementById('v10TodayStatus')?.dataset.kind==='error'",'stale Today target failure');
    assert.match(await evaluate("document.getElementById('v10TodayStatus').textContent"),/TODAY_TARGET_STALE/,'Stale Today target did not fail closed.');
    assert.equal(await evaluate("document.getElementById('studyOverlay').classList.contains('open')"),false,'Stale Today target opened a generic study session.');
    assert.equal(await evaluate("(async()=>{const core=await import('/src/persistence.js');return (await core.listReviewEvents()).length;})()"),staleProbe.before,'Stale Today target created a review event.');
    await evaluate("window.dispatchEvent(new CustomEvent('vocab:external-change',{detail:{state:window.__P0_STALE_ORIGINAL_STATE__,reason:'restore-after-stale-today-browser-fixture'}}))");
    await waitFor(`window.VocabMasterApp.getState().cards.some(card=>card.id===${JSON.stringify(staleProbe.cardId)})`,'restore state after stale Today fixture');
    await evaluate("window.VocabMasterApp.startStudy('quick')");
    await waitFor("document.getElementById('studyOverlay').classList.contains('open')",'direct quick study fixture');
    await waitFor("document.getElementById('introContinue')",'new-card introduction');
    await evaluate("document.getElementById('introContinue').click()");
    await waitFor(`window.VocabMasterApp.getState().cards.some(card=>card.front===${JSON.stringify(term)}&&card.status!=='new')`,'card acquisition state');
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
      skip:Boolean(document.getElementById('skipPronunciation')),
      sample:Boolean(document.getElementById('pronunciationSample')),
      help:document.querySelector('#pronunciationResult .microphone-help')?.textContent||''
    }))()`);
    assert.equal(micState.studyOpen,true,'Microphone denial closed the study session.');
    assert.equal(micState.skip&&micState.sample,true,'Coaching-only pronunciation fallback is missing.');
    assert.match(micState.help,/microphone/i);
    await evaluate("document.getElementById('skipPronunciation').click()");
    await evaluate("document.getElementById('closeStudy').click()");

    const degradedScript=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:"(()=>{Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:undefined});const nativeSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(globalThis.__P0_CAPTURE_WRITE_FAILURE__===true&&key==='vocab-master-capture-drafts')throw new DOMException('simulated quota','QuotaExceededError');return nativeSetItem.call(this,key,value);};})()"});
    await evaluate("localStorage.removeItem('vocab-master-capture-drafts');window.__P0_RELOAD_MARKER__='before-degraded'");
    await cdp.send('Page.reload',{ignoreCache:true});
    await waitFor("window.__P0_RELOAD_MARKER__!=='before-degraded'&&window.__VOCAB_BOOTED__&&window.__VOCAB_CORE_ONLY_DEGRADED__===true",'Core-only degraded startup');
    const degradedStatus=await evaluate("(async()=>window.VocabMasterPersistence.getPersistenceStatus())()");
    assert.equal(degradedStatus.storage,'localStorage-degraded','Production boot did not enter the verified localStorage adapter.');
    assert.equal(degradedStatus.durable,true,'Verified localStorage degraded mode was not labeled durable.');
    assert.equal(degradedStatus.degraded,true,'Core-only boot was not labeled degraded.');
    assert.equal(await evaluate("Boolean(window.__VOCAB_V10_READY__||document.getElementById('ieltsLabLauncher'))"),false,'IELTS/V10 mounted without IndexedDB.');
    assert.match(await evaluate("document.getElementById('coreOnlyDegradedNotice')?.textContent||''"),/Core-only degraded.*IELTS.*V10/i,'Degraded limitation notice is missing.');
    const corruptRaw='{corrupt-json';const corruptDraft=`corrupt-source-${Date.now()}`;
    await evaluate(`(()=>{document.querySelector('[data-route="capture"]').click();localStorage.setItem('vocab-master-capture-drafts',${JSON.stringify(corruptRaw)});const term=document.getElementById('quickTerm');term.value=${JSON.stringify(corruptDraft)};term.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('quickCaptureForm').requestSubmit();})()`);
    await waitFor("document.getElementById('quickCaptureStatus')?.dataset.kind==='error'",'corrupt degraded source failure');
    const corruptCapture=await evaluate(`(()=>({term:document.getElementById('quickTerm').value,stored:localStorage.getItem('vocab-master-capture-drafts'),status:document.getElementById('quickCaptureStatus').textContent}))()`);
    assert.equal(corruptCapture.term,corruptDraft,'Corrupt degraded source reset the Quick Capture form.');
    assert.equal(corruptCapture.stored,corruptRaw,'Quick Capture overwrote corrupt durable source data.');
    assert.match(corruptCapture.status,/raw value/i,'Corrupt degraded source did not report that the raw value was preserved.');
    await evaluate("localStorage.removeItem('vocab-master-capture-drafts')");
    const degradedDraft=`degraded-draft-${Date.now()}`;
    await evaluate(`(()=>{const term=document.getElementById('quickTerm');const context=document.getElementById('quickContext');term.value=${JSON.stringify(degradedDraft)};context.value='must survive failure';term.dispatchEvent(new Event('input',{bubbles:true}));context.dispatchEvent(new Event('input',{bubbles:true}));window.__P0_CAPTURE_WRITE_FAILURE__=true;document.getElementById('quickCaptureForm').requestSubmit();})()`);
    await waitFor("document.getElementById('quickCaptureStatus')?.dataset.kind==='error'",'degraded durable write failure');
    const failedCapture=await evaluate(`(()=>({term:document.getElementById('quickTerm').value,context:document.getElementById('quickContext').value,stored:localStorage.getItem('vocab-master-capture-drafts')||'',status:document.getElementById('quickCaptureStatus').textContent}))()`);
    assert.equal(failedCapture.term,degradedDraft,'Failed Quick Capture reset the term.');
    assert.equal(failedCapture.context,'must survive failure','Failed Quick Capture reset the context.');
    assert.doesNotMatch(failedCapture.stored,new RegExp(degradedDraft),'Failed Quick Capture was reported despite an unverified write.');
    assert.match(failedCapture.status,/Chưa lưu.*vẫn được giữ/i,'Failed Quick Capture did not explain that input was retained.');
    await evaluate("(()=>{window.__P0_CAPTURE_WRITE_FAILURE__=false;const form=document.getElementById('quickCaptureForm');form.requestSubmit();form.requestSubmit();})()");
    await waitFor(`localStorage.getItem('vocab-master-capture-drafts')?.includes(${JSON.stringify(degradedDraft)})`,'degraded draft durable write');
    const degradedCapture=await evaluate(`(()=>({count:JSON.parse(localStorage.getItem('vocab-master-capture-drafts')||'[]').filter(row=>row.term===${JSON.stringify(degradedDraft)}).length,term:document.getElementById('quickTerm').value,status:document.getElementById('quickCaptureStatus').dataset.kind}))()`);
    assert.deepEqual(degradedCapture,{count:1,term:'',status:'success'},'Quick Capture retry/double-submit was not idempotent or reset before durable success.');
    await evaluate("window.__P0_RELOAD_MARKER__='degraded-reload'");
    await cdp.send('Page.reload',{ignoreCache:true});
    await waitFor("window.__P0_RELOAD_MARKER__!=='degraded-reload'&&window.__VOCAB_BOOTED__&&window.__VOCAB_CORE_ONLY_DEGRADED__===true",'Core-only degraded reload');
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('vocab-master-capture-drafts')||'[]').filter(row=>row.term===${JSON.stringify(degradedDraft)}).length===1`),true,'Degraded Quick Capture draft did not survive production reload exactly once.');
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:degradedScript.identifier});

    assert.deepEqual(runtimeErrors,[],`Runtime errors:\n${runtimeErrors.join('\n')}`);
    console.log('Hardening browser smoke passed: Settings tabs, IndexedDB reload, crash-journal startup recovery, Core-only degraded reload, weak fallback and microphone-denied coaching recovery are operational.');
    }catch(error){error.message+=`\n\nVite output:\n${serverOutput.slice(-4000)}\n\nBrowser output:\n${browserOutput.slice(-4000)}`;throw error;}
    finally{cdp?.close();}
  });
}

await runBrowserSuite('Hardening browser smoke',main);
