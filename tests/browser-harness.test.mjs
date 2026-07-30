import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  FAILURE_KIND,
  InfrastructureFailure,
  assertPortsFree,
  browserCandidatePaths,
  browserLaunchArguments,
  classifyHarnessError,
  combineHarnessFailures,
  removeDirectoryWithRetry,
  runBrowserSuite,
  resolveBrowserExecutable
} from '../scripts/browser-harness.mjs';

test('Windows browser candidates include Chrome and Edge machine, x86 and local installs',()=>{
  const rows=browserCandidatePaths({platform:'win32',env:{PROGRAMFILES:'C:\\Program Files','PROGRAMFILES(X86)':'C:\\Program Files (x86)',LOCALAPPDATA:'C:\\Users\\tester\\AppData\\Local'}});
  assert.deepEqual(rows,[
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\tester\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Users\\tester\\AppData\\Local\\Microsoft\\Edge\\Application\\msedge.exe'
  ]);
});

test('invalid browser override fails closed instead of falling through or skipping',()=>{
  assert.throws(()=>resolveBrowserExecutable({platform:'win32',env:{VOCAB_BROWSER_BIN:'Z:\\missing\\chrome.exe'},exists:()=>false,commands:[],spawnSyncImpl:()=>({status:1,stdout:''})}),error=>error instanceof InfrastructureFailure&&error.failureKind===FAILURE_KIND.infrastructure&&error.code==='BROWSER_OVERRIDE_INVALID');
});

test('known browser candidate is selected deterministically',()=>{
  const expected='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const result=resolveBrowserExecutable({platform:'win32',env:{PROGRAMFILES:'C:\\Program Files'},exists:path=>path===expected,commands:[],spawnSyncImpl:()=>({status:0,stdout:'Google Chrome 150\n'})});
  assert.deepEqual(result,{path:expected,source:'known-install-location',version:'Google Chrome 150'});
});

test('browser launch always uses an isolated profile and disables crash/background services',()=>{
  const args=browserLaunchArguments({profileDir:'C:\\Temp\\isolated-profile',debugPort:9333,appUrl:'http://127.0.0.1:3000/'});
  assert.ok(args.includes('--disable-breakpad'));
  assert.ok(args.includes('--disable-crash-reporter'));
  assert.ok(args.includes('--disable-component-update'));
  assert.ok(args.includes('--user-data-dir=C:\\Temp\\isolated-profile'));
  assert.equal(args.at(-1),'http://127.0.0.1:3000/');
});

test('occupied port is an infrastructure failure',async()=>{
  const server=await new Promise((resolve,reject)=>{const value=createServer();value.once('error',reject);value.listen(0,'127.0.0.1',()=>resolve(value));});
  try{const port=server.address().port;await assert.rejects(assertPortsFree([port],{label:'test harness'}),error=>error.failureKind===FAILURE_KIND.infrastructure&&error.code==='PORT_OCCUPIED');}
  finally{await new Promise(resolve=>server.close(resolve));}
});

test('bounded temp cleanup removes the complete directory',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'vocab-harness-unit-'));
  await removeDirectoryWithRetry(directory,{attempts:2,baseDelayMs:1});
  const {existsSync}=await import('node:fs');assert.equal(existsSync(directory),false);
});

test('EBUSY cleanup retries are bounded and verify the result',async()=>{
  let calls=0;let present=true;
  await removeDirectoryWithRetry('fixture-profile',{attempts:3,baseDelayMs:1,exists:()=>present,remove:async()=>{calls+=1;if(calls<3){const error=new Error('busy');error.code='EBUSY';throw error;}present=false;}});
  assert.equal(calls,3);
  await assert.rejects(removeDirectoryWithRetry('stuck-profile',{attempts:2,baseDelayMs:1,exists:()=>true,remove:async()=>{const error=new Error('busy');error.code='EBUSY';throw error;}}),error=>error.failureKind===FAILURE_KIND.infrastructure&&error.code==='PROFILE_CLEANUP_FAILED');
});

test('product failure remains primary when cleanup also fails',()=>{
  const product=new Error('Retell persistence mismatch');
  const cleanup=new InfrastructureFailure('profile still busy');
  const combined=combineHarnessFailures(product,[cleanup]);
  assert.equal(combined,product);
  assert.match(combined.message,/Retell persistence mismatch/);
  assert.match(combined.message,/INFRASTRUCTURE_FAILURE during cleanup/);
  assert.deepEqual(combined.cleanupFailures,[cleanup]);
});

test('suite reporting distinguishes infrastructure from product failure',async()=>{
  await assert.rejects(runBrowserSuite('fixture',async()=>{throw new Error('wrong behavior');}),error=>error.failureKind===undefined&&error.message.startsWith('[PRODUCT_FAILURE]'));
  await assert.rejects(runBrowserSuite('fixture',async()=>{throw new InfrastructureFailure('browser missing');}),error=>error.failureKind===FAILURE_KIND.infrastructure&&error.message.startsWith('[INFRASTRUCTURE_FAILURE]'));
});

test('browser transport failures are infrastructure while assertions remain product failures',()=>{
  const transport=classifyHarnessError(new Error('CDP timeout: Runtime.evaluate'));
  assert.equal(transport.failureKind,FAILURE_KIND.infrastructure);
  assert.equal(transport.code,'BROWSER_TRANSPORT_FAILED');
  const product=new TypeError("Cannot set properties of null (setting 'step')");
  assert.equal(classifyHarnessError(product),product);
});

test('POSIX process cleanup uses an isolated process group',async()=>{
  const source=await readFile(new URL('../scripts/browser-harness.mjs',import.meta.url),'utf8');
  assert.match(source,/detached:options\.detached\?\?process\.platform!==['"]win32['"]/);
  assert.match(source,/process\.kill\(-child\.pid,'SIGTERM'\)/);
  assert.match(source,/waitForPosixProcessGroupExit/);
});

test('all critical browser suites share the harness and cannot opt into a skip',async()=>{
  for(const file of ['browser-smoke.mjs','ielts-browser-smoke.mjs','v10-browser-smoke.mjs','hardening-browser-smoke.mjs']){
    const source=await readFile(new URL(`../scripts/${file}`,import.meta.url),'utf8');
    assert.match(source,/from '\.\/browser-harness\.mjs'/,`${file} bypasses the shared harness`);
    assert.doesNotMatch(source,/ALLOW_BROWSER_SMOKE_SKIP|smoke skipped/i,`${file} can still skip a critical suite`);
  }
});
