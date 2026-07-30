import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { browserLaunchArguments,runBrowserSuite,waitForHttp,withBrowserHarness } from './browser-harness.mjs';

const APP_PORT=3014;
const DEBUG_PORT=9564;
const APP_URL=`http://127.0.0.1:${APP_PORT}/#ielts`;

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
    await new Promise((resolveOpen,reject)=>{
      const timer=setTimeout(()=>reject(new Error('CDP open timeout')),8000);
      this.socket.addEventListener('open',()=>{clearTimeout(timer);resolveOpen();},{once:true});
      this.socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP socket error'));},{once:true});
    });
    this.socket.addEventListener('message',async event=>{
      const message=JSON.parse(await websocketText(event.data));
      if(message.id){
        const pending=this.pending.get(message.id);
        if(!pending)return;
        this.pending.delete(message.id);clearTimeout(pending.timer);
        message.error?pending.reject(new Error(message.error.message)):pending.resolve(message.result||{});
        return;
      }
      for(const listener of this.listeners.get(message.method)||[])listener(message.params||{});
    });
  }
  on(method,listener){this.listeners.set(method,[...(this.listeners.get(method)||[]),listener]);}
  send(method,params={},timeoutMs=15000){
    const id=this.nextId++;
    return new Promise((resolveSend,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},timeoutMs);
      this.pending.set(id,{resolve:resolveSend,reject,timer});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  close(){try{this.socket?.close();}catch{}}
}

async function representativeLessons(){
  const manifest=JSON.parse(await readFile(resolve('content-repo/packs/sampler/manifest.json'),'utf8'));
  const result=[];
  for(const skill of ['listening','reading','lexical-paraphrase']){
    const lesson=manifest.lessons.find(row=>row.skill===skill);
    const descriptor=manifest.assets.find(row=>lesson.assetIds.includes(row.id)&&row.mediaType==='application/json');
    const structured=JSON.parse(await readFile(resolve('content-repo',descriptor.path),'utf8'));
    result.push({lesson,assets:{[descriptor.id]:structured},progress:{completedActivityIds:[]}});
  }
  return result;
}

async function main(){
  const lessons=await representativeLessons();
  await withBrowserHarness({name:'Phase 4 browser smoke',profilePrefix:'vocab-phase4-smoke-',ports:[APP_PORT,DEBUG_PORT]},async({browser:browserInfo,profileDir,spawnTracked})=>{
    let serverOutput='';let browserOutput='';let cdp;
    const serverRecord=spawnTracked('Phase 4 Vite server',process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(APP_PORT),'--strictPort'],{
      stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development'}
    });
    serverRecord.child.stdout.on('data',chunk=>serverOutput+=chunk);
    serverRecord.child.stderr.on('data',chunk=>serverOutput+=chunk);
    try{
      await waitForHttp(APP_URL,{processRecord:serverRecord,label:'Phase 4 Vite server'});
      const browserRecord=spawnTracked('Phase 4 browser',browserInfo.path,browserLaunchArguments({profileDir,debugPort:DEBUG_PORT,appUrl:APP_URL}),{stdio:['ignore','pipe','pipe']});
      browserRecord.child.stdout.on('data',chunk=>browserOutput+=chunk);
      browserRecord.child.stderr.on('data',chunk=>browserOutput+=chunk);
      await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`,{processRecord:browserRecord,label:'Phase 4 browser CDP'});

      let target;
      for(let attempt=0;attempt<100&&!target;attempt+=1){
        const targets=await(await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
        target=targets.find(item=>item.type==='page'&&String(item.url).startsWith(`http://127.0.0.1:${APP_PORT}`));
        if(!target)await delay(100);
      }
      assert.ok(target?.webSocketDebuggerUrl,'VocabMaster Phase 4 target not found.');
      cdp=new CdpClient(target.webSocketDebuggerUrl);
      await cdp.connect();
      const runtimeErrors=[];
      cdp.on('Runtime.exceptionThrown',params=>runtimeErrors.push(params.exceptionDetails?.exception?.description||params.exceptionDetails?.text||'Runtime exception'));
      cdp.on('Runtime.consoleAPICalled',params=>{if(params.type==='error')runtimeErrors.push((params.args||[]).map(arg=>arg.value??arg.description??'').join(' '));});
      await cdp.send('Page.enable');await cdp.send('Runtime.enable');

      const evaluate=async expression=>{
        const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:true,awaitPromise:true});
        if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Runtime evaluation failed');
        return result.result?.value;
      };
      const waitFor=async(expression,label)=>{
        for(let attempt=0;attempt<160;attempt+=1){
          if(await evaluate(`Boolean(${expression})`))return;
          await delay(100);
        }
        throw new Error(`Timed out waiting for ${label}.`);
      };

      await waitFor('window.__VOCAB_V10_READY__&&window.VocabMasterContentExperience','Phase 4 runtime');
      const desktopViewport=await evaluate('document.documentElement.clientWidth');
      assert.ok(desktopViewport>=800,`Expected desktop viewport before responsive pass, received ${desktopViewport}.`);
      await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});

      const launches=[];
      for(const detail of lessons){
        const payload=JSON.stringify(detail).replaceAll('<','\\u003c');
        const snapshot=await evaluate(`(async()=>{const detail=${payload};await window.VocabMasterContentExperience.open(detail);const dialog=document.querySelector('#phase4ContentLessonDialog');return{open:dialog?.open===true,lessonId:dialog?.dataset.lessonId,title:dialog?.querySelector('h2')?.textContent,activities:dialog?.querySelectorAll('[data-phase4-activity]').length,hasSource:dialog?.querySelectorAll('section h3').length>0,focused:document.activeElement===dialog?.querySelector('h2'),viewport:document.documentElement.clientWidth};})()`);
        assert.equal(snapshot.open,true);
        assert.equal(snapshot.lessonId,detail.lesson.id);
        assert.equal(snapshot.title,detail.lesson.title);
        assert.equal(snapshot.activities,detail.lesson.activities.length);
        assert.equal(snapshot.hasSource,true);
        assert.equal(snapshot.focused,true);
        assert.ok(snapshot.viewport<=390);
        launches.push({skill:detail.lesson.skill,id:detail.lesson.id,activities:snapshot.activities});
        await evaluate('window.VocabMasterContentExperience.close()');
      }

      const serious=runtimeErrors.filter(text=>text&&!/favicon|net::ERR_ABORTED|speech|AudioContext/i.test(text));
      assert.deepEqual(serious,[],`Runtime errors: ${serious.join('\n')}`);
      console.log(JSON.stringify({ok:true,fixtureBoundary:'isolated browser acceptance fixture; production catalog remains fail-closed',launches,desktopViewport,reducedMotion:true,mobileViewport:true},null,2));
    }catch(error){
      error.message+=`\n\nVite output:\n${serverOutput.slice(-5000)}\n\nBrowser output:\n${browserOutput.slice(-5000)}`;
      throw error;
    }finally{cdp?.close();}
  });
}

await runBrowserSuite('Phase 4 browser smoke',main);
