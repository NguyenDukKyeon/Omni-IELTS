import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { browserLaunchArguments, runBrowserSuite, waitForHttp, withBrowserHarness } from './browser-harness.mjs';

const APP_URL='http://127.0.0.1:3000/#today';
const DEBUG_PORT=9333;

async function websocketText(data){
  if(typeof data==='string')return data;
  if(data&&typeof data.text==='function')return data.text();
  if(data instanceof ArrayBuffer)return new TextDecoder().decode(data);
  if(ArrayBuffer.isView(data))return new TextDecoder().decode(data);
  return String(data);
}

class CdpClient{
  constructor(url){this.url=url;this.nextId=1;this.pending=new Map();this.listeners=new Map();}
  async connect(){
    this.socket=new WebSocket(this.url);
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('CDP WebSocket open timed out')),8000);
      this.socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
      this.socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP WebSocket error'));},{once:true});
    });
    this.socket.addEventListener('message',async event=>{
      try{
        const message=JSON.parse(await websocketText(event.data));
        if(message.id){
          const pending=this.pending.get(message.id);if(!pending)return;
          this.pending.delete(message.id);clearTimeout(pending.timer);
          if(message.error)pending.reject(new Error(`${message.error.message} (${message.error.code})`));
          else pending.resolve(message.result||{});
          return;
        }
        for(const listener of this.listeners.get(message.method)||[])listener(message.params||{});
      }catch(error){
        for(const [id,pending] of this.pending){
          clearTimeout(pending.timer);
          pending.reject(new Error(`Cannot decode CDP response for ${pending.method}: ${error.message}`));
          this.pending.delete(id);
        }
      }
    });
    this.socket.addEventListener('close',()=>{
      for(const [id,pending] of this.pending){
        clearTimeout(pending.timer);pending.reject(new Error(`CDP socket closed before command ${id} completed`));
      }
      this.pending.clear();
    });
  }
  on(method,listener){const listeners=this.listeners.get(method)||[];listeners.push(listener);this.listeners.set(method,listeners);}
  send(method,params={},timeoutMs=10000){
    const id=this.nextId++;return new Promise((resolve,reject)=>{
      const detail=method==='Runtime.evaluate'?` · ${String(params.expression||'').replace(/\s+/g,' ').slice(0,180)}`:'';
      const timer=setTimeout(()=>{
        this.pending.delete(id);reject(new Error(`CDP command timed out: ${method}${detail}`));
      },timeoutMs);
      this.pending.set(id,{resolve,reject,timer,method});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  close(){try{this.socket?.close();}catch{}}
}

async function main(){
  await withBrowserHarness({name:'Core browser smoke',profilePrefix:'vocab-browser-smoke-',ports:[3000,DEBUG_PORT]},async({browser:browserInfo,profileDir,spawnTracked})=>{
    let serverOutput='';let browserOutput='';
    const serverRecord=spawnTracked('Core Vite server',process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','3000','--strictPort'],{
      stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development'}
    });
    const server=serverRecord.child;server.stdout.on('data',chunk=>serverOutput+=chunk);server.stderr.on('data',chunk=>serverOutput+=chunk);
    let browser;let cdp;let target;let currentHref='unknown';
    try{
      await waitForHttp('http://127.0.0.1:3000/',{processRecord:serverRecord,label:'Core Vite server'});
      const browserRecord=spawnTracked('Core browser',browserInfo.path,browserLaunchArguments({profileDir,debugPort:DEBUG_PORT,appUrl:APP_URL}),{stdio:['ignore','pipe','pipe']});
    browser=browserRecord.child;
    browser.stdout.on('data',chunk=>browserOutput+=chunk);browser.stderr.on('data',chunk=>browserOutput+=chunk);

    await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`,{processRecord:browserRecord,label:'Core browser CDP'});
    for(let attempt=0;attempt<100&&!target;attempt+=1){
      const targets=await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page=targets.find(item=>item.type==='page'&&String(item.url).startsWith('http://127.0.0.1:3000'));
      if(page&&page.title==='Vocab Master')target=page;
      else await delay(150);
    }
    assert.ok(target?.webSocketDebuggerUrl,'The Vocab Master document did not commit its title in Chrome.');
    console.log(`Browser target committed: ${target.url} · ${target.title}`);

    cdp=new CdpClient(target.webSocketDebuggerUrl);await cdp.connect();
    const runtimeErrors=[];
    cdp.on('Runtime.exceptionThrown',params=>runtimeErrors.push(params.exceptionDetails?.exception?.description||params.exceptionDetails?.text||'Runtime exception'));
    cdp.on('Runtime.consoleAPICalled',params=>{
      if(params.type!=='error')return;
      const text=(params.args||[]).map(arg=>arg.value??arg.description??'').join(' ');
      runtimeErrors.push(text||'console.error');
    });
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('Log.enable');

    async function evaluate(expression){
      const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:true});
      if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Runtime.evaluate failed');
      return result.result?.value;
    }
    async function waitFor(expression,label,attempts=80){
      for(let attempt=0;attempt<attempts;attempt+=1){
        if(await evaluate(`Boolean(${expression})`))return;
        await delay(125);
      }
      throw new Error(`Timed out waiting for ${label}`);
    }

    assert.equal(await evaluate('1+1'),2,'CDP Runtime.evaluate is not responsive.');
    currentHref=await evaluate('location.href');
    assert.ok(String(currentHref).startsWith('http://127.0.0.1:3000/'),`CDP attached to the wrong page: ${currentHref}`);

    await waitFor('window.VocabMasterApp','VocabMasterApp');
    await waitFor("document.querySelector('[data-view=\"today\"]')?.classList.contains('active')",'today route');
    await waitFor("document.getElementById('v10StartPlan')",'canonical Today launcher');

    await evaluate(`new Promise(resolve=>{
      document.documentElement.style.scrollBehavior='auto';
      const start=document.getElementById('v10StartPlan');
      start.scrollIntoView({block:'center',behavior:'instant'});
      requestAnimationFrame(()=>requestAnimationFrame(resolve));
    })`);
    const startup=await evaluate(`(()=>{
      const shell=document.getElementById('appShell');
      const start=document.getElementById('v10StartPlan');
      const rect=start.getBoundingClientRect();
      const top=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
      return {
        bootExists:Boolean(document.getElementById('bootStatus')),
        shellVisibility:getComputedStyle(shell).visibility,
        shellPointerEvents:getComputedStyle(shell).pointerEvents,
        bodyOverflow:getComputedStyle(document.body).overflow,
        htmlOverflow:getComputedStyle(document.documentElement).overflow,
        startClickable:top===start||start.contains(top),
        coveringTag:top?.tagName||'',
        coveringId:top?.id||'',
        coveringClass:String(top?.className||''),
        coveringText:String(top?.textContent||'').trim().slice(0,120),
        experienceStyles:Boolean(document.querySelector('link[href="/experience.css"]')),
        x:rect.left+rect.width/2,
        y:rect.top+rect.height/2
      };
    })()`);
    assert.equal(startup.bootExists,false,'Boot overlay still exists on localhost.');
    assert.notEqual(startup.shellVisibility,'hidden','App shell is hidden.');
    assert.notEqual(startup.shellPointerEvents,'none','App shell blocks pointer events.');
    assert.equal(
      startup.startClickable,
      true,
      `Another element is covering the primary start button: ${startup.coveringTag}#${startup.coveringId}.${startup.coveringClass} · ${startup.coveringText}`
    );
    assert.equal(startup.experienceStyles,true,'Local Vite did not load experience.css.');

    await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:startup.x,y:startup.y,button:'left',clickCount:1});
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:startup.x,y:startup.y,button:'left',clickCount:1});
    await waitFor("document.getElementById('studyOverlay')?.classList.contains('open')",'study overlay after real pointer click');
    await evaluate("document.getElementById('closeStudy').click()");
    await waitFor("!document.getElementById('studyOverlay')?.classList.contains('open')",'study overlay close');
    assert.notEqual(await evaluate("document.body.style.overflow"),'hidden','Body remained scroll-locked after closing study.');

    await evaluate("document.querySelector('[data-route=\"capture\"]').click()");
    await waitFor("document.querySelector('[data-view=\"capture\"]')?.classList.contains('active')",'capture route');
    const term=`logic-audit-${Date.now()}`;
    await evaluate(`(()=>{
      document.getElementById('wordInput').value=${JSON.stringify(term)};
      document.getElementById('meaningInput').value='kiểm tra tương tác';
      document.getElementById('addWordForm').requestSubmit();
    })()`);
    await waitFor(`window.VocabMasterApp.getState().cards.some(card=>card.front===${JSON.stringify(term)})`,'newly added card');

    await evaluate("document.querySelector('[data-route=\"library\"]').click()");
    await waitFor("document.querySelector('[data-view=\"library\"]')?.classList.contains('active')",'library route');
    await evaluate(`(()=>{const input=document.getElementById('librarySearch');input.value=${JSON.stringify(term)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.getElementById('wordList').textContent.includes(${JSON.stringify(term)})`,'library search result');
    await waitFor("document.querySelector('#wordList [data-open-card]')",'library detail control');
    await evaluate("document.querySelector('#wordList [data-open-card]').click()");
    await waitFor("document.getElementById('wordDetailDialog').open",'word detail dialog');
    await evaluate("document.querySelector('#wordDetailDialog [data-close-dialog]').click()");
    await waitFor("!document.getElementById('wordDetailDialog').open",'word detail close');

    await evaluate("document.getElementById('topProfileButton').click()");
    await waitFor("document.getElementById('settingsDialog').open",'settings dialog');
    await evaluate(`(()=>{document.getElementById('settingMinutes').value='15';document.getElementById('settingsForm').requestSubmit();})()`);
    await waitFor("!document.getElementById('settingsDialog').open",'settings save and close');
    assert.equal(await evaluate("window.VocabMasterApp.getState().settings.minutes"),15,'Settings were not persisted to app state.');

    await evaluate("document.querySelector('[data-route=\"today\"]').click()");
    await waitFor("document.querySelector('[data-view=\"today\"]')?.classList.contains('active')",'return to today');
    await evaluate("document.getElementById('v10MorePractice').click()");
    await waitFor("document.getElementById('practiceSheet').open",'practice dialog');
    await evaluate("document.querySelector('#practiceSheet [data-close-dialog]').click()");
    await waitFor("!document.getElementById('practiceSheet').open",'practice dialog close');

    await evaluate("document.querySelector('[data-route=\"capture\"]').click()");
    await evaluate("document.getElementById('showImport').click()");
    await waitFor("document.getElementById('importDialog').open",'import dialog');
    await evaluate(`(()=>{document.getElementById('importText').value='word,meaning\\nlogic import,kiểm tra import';document.getElementById('previewImport').click();})()`);
    await waitFor("!document.getElementById('confirmImport').disabled",'valid import preview');
    await evaluate("document.querySelector('#importDialog [data-close-dialog]').click()");

    await evaluate("document.querySelector('[data-route=\"progress\"]').click()");
    await waitFor("document.querySelector('[data-view=\"progress\"]')?.classList.contains('active')",'progress route');
    await waitFor("document.querySelectorAll('#activityHeatmap .heatmap-cell').length>0",'progress heatmap');

    const finalState=await evaluate(`(()=>({
      openDialogs:document.querySelectorAll('dialog[open]').length,
      studyOpen:document.getElementById('studyOverlay').classList.contains('open'),
      bodyOverflow:document.body.style.overflow,
      bootExists:Boolean(document.getElementById('bootStatus')),
      blocker:document.elementFromPoint(innerWidth/2,innerHeight/2)?.id||''
    }))()`);
    assert.equal(finalState.openDialogs,0,'A dialog remained open after close actions.');
    assert.equal(finalState.studyOpen,false,'Study overlay remained open.');
    assert.notEqual(finalState.bodyOverflow,'hidden','Page remained scroll-locked.');
    assert.equal(finalState.bootExists,false,'Boot overlay returned after interactions.');

    await delay(500);
    assert.deepEqual(runtimeErrors,[],`Browser runtime errors:\n${runtimeErrors.join('\n')}`);
    console.log('Browser interaction smoke passed: pointer clicks, routes, dialogs, study, add/search, settings, import and progress are operational.');
    }catch(error){
      error.message+=`\n\nTarget: ${currentHref} · ${target?.title||'untitled'}\n\nVite output:\n${serverOutput.slice(-5000)}\n\nBrowser output:\n${browserOutput.slice(-5000)}`;
      throw error;
    }finally{cdp?.close();}
  });
}

await runBrowserSuite('Core browser smoke',main);
