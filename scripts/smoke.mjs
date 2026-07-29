import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const port=String(5200+Math.floor(Math.random()*500));
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server/server.mjs'],{stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:port,PUSH_DATA_DIR:`/tmp/vocab-master-push-${process.pid}-${port}`}});
let output='';
let exited=null;
child.stdout.on('data',chunk=>{output+=chunk;});
child.stderr.on('data',chunk=>{output+=chunk;});
child.once('exit',(code,signal)=>{exited={code,signal};});

async function waitForServer(timeoutMs=12_000){
  const deadline=Date.now()+timeoutMs;
  let lastError='';
  while(Date.now()<deadline){
    if(exited)throw new Error(`Server exited before readiness (code=${exited.code}, signal=${exited.signal}): ${output}`);
    try{
      const response=await fetch(`${base}/api/health`,{signal:AbortSignal.timeout(1_000)});
      if(response.ok)return;
      lastError=`HTTP ${response.status}`;
    }catch(error){lastError=error.message;}
    await new Promise(resolve=>setTimeout(resolve,80));
  }
  throw new Error(`Server did not become reachable at ${base}: ${lastError}\n${output}`);
}

try{
  await waitForServer();
  const post=(path,body)=>fetch(`${base}${path}`,{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify(body)});
  const [home,app,css,experience,manifest,serviceWorker,offline,health,publicKey,invalidSubscription,mnemonicNoKey,invalidPronunciation,invalidOutput]=await Promise.all([
    fetch(`${base}/`),
    fetch(`${base}/assets/app.js`),
    fetch(`${base}/styles.css`),
    fetch(`${base}/experience.css`),
    fetch(`${base}/manifest.webmanifest`),
    fetch(`${base}/sw.js`),
    fetch(`${base}/offline.html`),
    fetch(`${base}/api/health`),
    fetch(`${base}/api/push/public-key`),
    post('/api/push/subscribe',{}),
    post('/api/ai/mnemonic',{term:'reliable',meaning:'đáng tin cậy'}),
    post('/api/ai/pronunciation',{term:'reliable'}),
    post('/api/ai/output-practice',{terms:[],paragraph:''})
  ]);
  for(const response of [home,app,css,experience,manifest,serviceWorker,offline,health,publicKey])assert.equal(response.status,200);
  assert.equal(invalidSubscription.status,400);
  assert.equal(mnemonicNoKey.status,502);
  assert.equal(invalidPronunciation.status,400);
  assert.equal(invalidOutput.status,400);
  const html=await home.text();const appText=await app.text();const experienceText=await experience.text();const manifestData=await manifest.json();const healthData=await health.json();const keyData=await publicKey.json();const mnemonicError=await mnemonicNoKey.json();
  assert.match(html,/id="appShell"/);assert.match(html,/rel="manifest"/);assert.match(html,/experience\.css/);assert.match(html,/assets\/app\.js/);
  assert.match(appText,/ts-fsrs|FSRS|request_retention/);
  assert.match(appText,/indexedDB/);
  assert.match(appText,/MediaRecorder/);
  assert.match(appText,/output-practice/);
  assert.match(appText,/activityHeatmap/);
  assert.match(experienceText,/matching-board/);
  assert.match(experienceText,/pronunciation-card/);
  assert.equal(manifestData.display,'standalone');assert.ok(manifestData.icons.length>=3);
  assert.equal(healthData.fsrs,6);assert.equal(healthData.pwa,true);assert.equal(healthData.push,true);assert.equal(healthData.multimodal,true);
  assert.ok(healthData.ai.includes('pronunciation')&&healthData.ai.includes('mnemonic'));
  assert.ok(typeof keyData.publicKey==='string'&&keyData.publicKey.length>40);
  assert.match(mnemonicError.error,/API key/);
  assert.match(serviceWorker.headers.get('content-type')||'',/javascript/);
  assert.match(manifest.headers.get('content-type')||'',/manifest\+json/);
  assert.match(home.headers.get('permissions-policy')||'',/microphone=\(self\)/);
  console.log(`Multimodal FSRS/PWA/IndexedDB/AI route smoke test passed on port ${port}.`);
}finally{
  if(!exited)child.kill('SIGTERM');
  await new Promise(resolve=>setTimeout(resolve,180));
}
