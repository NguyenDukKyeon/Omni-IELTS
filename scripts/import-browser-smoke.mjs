import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const port='5417';
const base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:port},stdio:['ignore','pipe','pipe']});
let output='';server.stdout.on('data',chunk=>output+=chunk);server.stderr.on('data',chunk=>output+=chunk);
async function waitForServer(){for(let i=0;i<80;i+=1){try{const response=await fetch(`${base}/api/health`);if(response.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}throw new Error(`Server did not start: ${output}`);}
let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await page.goto(`${base}/#today`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#appShell');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#streakValue').textContent(),'0');
  assert.equal(await page.locator('#dailyPercent').textContent(),'0%');

  await page.click('#openMorePractice');
  await page.click('[data-practice="collocation"]');
  await page.waitForSelector('#studyOverlay.open .exercise-card');
  const prompt=(await page.locator('#exerciseHost h2').textContent())||'';
  const contextText=(await page.locator('#exerciseHost .example').textContent())||'';
  assert.match(prompt,/_____/);
  assert.doesNotMatch(`${prompt} ${contextText}`,/\baccount\b/i);
  assert.match(contextText,/Take the cost into _____ before deciding\./i);
  await page.click('#closeStudy');

  await page.click('.side-nav [data-route="progress"]');
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#daysMetric').textContent(),'0 ngày');
  assert.equal(await page.locator('#minutesMetric').textContent(),'0 phút');
  assert.equal(await page.locator('#accuracyMetric').textContent(),'0%');
  assert.equal(await page.locator('#knowledgeStrength').textContent(),'0%');

  const csv='Từ,Nghĩa,Ví dụ,Bộ từ,Cấp độ\n"data-driven","dựa trên dữ liệu","A data-driven team makes better decisions.","E2E Import","B2"\n"break down","chia nhỏ","Break the task down into steps.","E2E Import","B1"';
  await page.click('.side-nav [data-route="capture"]');
  await page.click('#showImport');
  await page.fill('#importText',csv);
  await page.click('#previewImport');
  await page.waitForFunction(()=>document.querySelector('#importSummary')?.textContent?.includes('2 mục hợp lệ'));
  assert.equal(await page.locator('#confirmImport').isDisabled(),false);
  await page.click('#confirmImport');
  await page.waitForTimeout(300);

  const dbState=await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('vocab-master-personal');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    const read=(store,key=null)=>new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const request=key==null?tx.objectStore(store).getAll():tx.objectStore(store).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    const cards=await read('cards');const events=await read('reviewEvents');const metrics=await read('settings','metrics');
    return{cards,events,metrics:metrics?.value};
  });
  assert.ok(dbState.cards.some(card=>card.front==='data-driven'));
  assert.ok(dbState.cards.some(card=>card.front==='break down'));
  assert.ok(dbState.cards.every(card=>card.status==='new'&&Number(card.correct||0)===0&&Number(card.incorrect||0)===0));
  assert.equal(dbState.events.length,0);
  assert.deepEqual(dbState.metrics,{dailyDone:0,studyMinutes:0});

  await page.reload({waitUntil:'domcontentloaded'});
  await page.click('.side-nav [data-route="library"]');
  await page.fill('#librarySearch','data-driven');
  await page.waitForFunction(()=>document.querySelector('#wordList')?.textContent?.includes('data-driven'));
  assert.match(await page.locator('#wordList').textContent(),/data-driven/);

  await page.click('.side-nav [data-route="capture"]');
  await page.click('#showImport');
  await page.fill('#importText',csv);
  await page.click('#previewImport');
  await page.waitForFunction(()=>document.querySelector('#importSummary')?.textContent?.includes('2 mục trùng'));
  assert.match(await page.locator('#importSummary').textContent(),/0 mục hợp lệ/);
  assert.equal(await page.locator('#confirmImport').isDisabled(),true);
  console.log('Browser import/reset/collocation smoke test passed.');
} finally {
  await browser?.close();server.kill('SIGTERM');
}
