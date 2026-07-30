import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const port='5482';const base=`http://127.0.0.1:${port}`;const server=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:port},stdio:['ignore','pipe','pipe']});let output='';server.stdout.on('data',chunk=>output+=chunk);server.stderr.on('data',chunk=>output+=chunk);
async function wait(){for(let i=0;i<80;i++){try{if((await fetch(`${base}/api/health`)).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}throw new Error(output);}
let browser;
try{
  await wait();browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    const voices=[{name:'Basic English',lang:'en-US',voiceURI:'basic',default:true,localService:true},{name:'Microsoft Aria Natural Online',lang:'en-US',voiceURI:'aria',default:false,localService:false},{name:'Google UK English Female',lang:'en-GB',voiceURI:'uk',default:false,localService:true}];
    window.__audioLog=[];window.__cancelCount=0;let active=null;
    class MockUtterance{constructor(text){this.text=text;}}
    const synthesis={getVoices:()=>voices,addEventListener(name,fn){if(name==='voiceschanged')setTimeout(fn,0);},cancel(){window.__cancelCount++;if(active){const old=active;active=null;old.onerror?.({error:'canceled'});}},speak(utterance){active=utterance;window.__audioLog.push({text:utterance.text,rate:utterance.rate,voiceURI:utterance.voice?.voiceURI,lang:utterance.lang});utterance.onstart?.();setTimeout(()=>{if(active===utterance){active=null;utterance.onend?.();}},30);}};
    window.__VOCAB_AUDIO_UTTERANCE__=MockUtterance;window.__VOCAB_AUDIO_SYNTHESIS__=synthesis;
  });
  const page=await context.newPage();await page.goto(`${base}/#today`,{waitUntil:'domcontentloaded'});await page.waitForSelector('#appShell');
  await page.click('#topProfileButton');await page.waitForSelector('#settingsDialog[open]');await page.waitForFunction(()=>document.querySelector('#settingVoiceURI')?.options.length>=2);
  assert.match(await page.locator('#settingVoiceURI').textContent(),/Aria Natural/i);await page.selectOption('#settingVoiceURI','aria');await page.selectOption('#settingAudioRate','medium');await page.click('#testVoiceButton');await page.waitForFunction(()=>window.__audioLog.length>=1);let log=await page.evaluate(()=>window.__audioLog.at(-1));assert.equal(log.rate,0.9);assert.equal(log.voiceURI,'aria');
  await page.selectOption('#settingAudioRate','slow');await page.click('#testVoiceButton');await page.waitForFunction(()=>window.__audioLog.length>=2);log=await page.evaluate(()=>window.__audioLog.at(-1));assert.equal(log.rate,0.7);
  await page.selectOption('#settingAudioRate','medium');await page.check('#settingShowSlowAudio');await page.click('#settingsForm button[type="submit"]');
  await page.click('.side-nav [data-route="library"]');await page.click('.word-row');await page.waitForSelector('#wordDetailDialog[open]');await page.click('#detailSlowAudio');await page.waitForFunction(()=>window.__audioLog.at(-1)?.rate===0.7);await page.click('#detailExampleAudio');await page.waitForFunction(()=>window.__audioLog.at(-1)?.rate===0.95);assert.ok(await page.evaluate(()=>window.__cancelCount>=3));
  await page.click('#wordDetailDialog [data-close-dialog]');await page.click('.side-nav [data-route="today"]');await page.click('#v10MorePractice');await page.click('[data-practice="listening"]');await page.waitForSelector('#studyOverlay.open');const visible=(await page.locator('#exerciseHost').textContent())||'';assert.doesNotMatch(visible,/efficient/i);await page.click('#inlineSlowAudio');await page.waitForFunction(()=>window.__audioLog.at(-1)?.rate===0.7);
  console.log('Natural audio browser smoke passed.');
}finally{await browser?.close();server.kill('SIGTERM');}
