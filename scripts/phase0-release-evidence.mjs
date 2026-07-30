import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile,readdir,stat } from 'node:fs/promises';
import { arch,platform,release } from 'node:os';
import { relative,resolve } from 'node:path';
import { resolveBrowserExecutable } from './browser-harness.mjs';

const TEST_CONTROL_PATTERN=/\b(?:test|it|describe)\.(?:skip|todo|only)\s*\(|\b(?:test|it|describe)\s*\([^,\n]+,\s*\{\s*(?:skip|todo|only)\s*:/g;
const ARTIFACT_PATH_PATTERN=/(^|\/)(?:debug(?:[-_.\/]|$)|tmp(?:\/|$)|temp(?:\/|$)|coverage(?:\/|$)|test-results?(?:\/|$)|playwright-report(?:\/|$))|\.(?:log|tmp|bak|orig|rej)$/i;

function sha256(value){
  return createHash('sha256').update(value).digest('hex');
}

function git(root,args){
  const result=spawnSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,timeout:20_000});
  if(result.error||result.status!==0)throw new Error(`Git ${args.join(' ')} failed: ${result.error?.message||result.stderr||result.stdout||`exit ${result.status}`}`);
  return String(result.stdout||'').trim();
}

export function findForbiddenTestControls(entries=[]){
  const violations=[];
  for(const entry of entries){
    TEST_CONTROL_PATTERN.lastIndex=0;
    if(TEST_CONTROL_PATTERN.test(String(entry.source||'')))violations.push(entry.path);
  }
  return violations.sort();
}

export function findForbiddenArtifactPaths(paths=[]){
  return paths.map(value=>String(value).replaceAll('\\','/')).filter(value=>ARTIFACT_PATH_PATTERN.test(value)).sort();
}

export async function assertRepositoryHygiene(root){
  const tracked=git(root,['ls-files']).split(/\r?\n/).filter(Boolean);
  const artifactViolations=findForbiddenArtifactPaths(tracked);
  if(artifactViolations.length)throw new Error(`Tracked debug/temporary artifacts are forbidden: ${artifactViolations.join(', ')}`);
  const testSources=[];
  for(const path of tracked.filter(path=>path.startsWith('tests/')||/^scripts\/.*(?:browser|phase0).*\.mjs$/i.test(path))){
    testSources.push({path,source:await readFile(resolve(root,path),'utf8')});
  }
  const controlViolations=findForbiddenTestControls(testSources);
  if(controlViolations.length)throw new Error(`Skipped/todo/only test controls are forbidden in Phase 0 gates: ${controlViolations.join(', ')}`);
  return{trackedFiles:tracked.length,scannedTestFiles:testSources.length};
}

export function assertReleaseWorkspaceClean(root,{expectedCommit=null}={}){
  const commit=git(root,['rev-parse','HEAD']);
  const status=git(root,['status','--porcelain=v1','--untracked-files=all']);
  if(status)throw new Error(`Phase 0 release gate requires a clean worktree:\n${status}`);
  if(expectedCommit&&commit!==expectedCommit)throw new Error(`Commit changed during Phase 0 gate: expected ${expectedCommit}, received ${commit}`);
  return commit;
}

async function walkFiles(root,current=root,files=[]){
  const entries=await readdir(current,{withFileTypes:true});
  entries.sort((left,right)=>left.name<right.name?-1:left.name>right.name?1:0);
  for(const entry of entries){
    const path=resolve(current,entry.name);
    if(entry.isDirectory())await walkFiles(root,path,files);
    else if(entry.isFile())files.push(path);
  }
  return files;
}

export async function buildArtifactEvidence(root,distPath=resolve(root,'dist')){
  const info=await stat(distPath);
  if(!info.isDirectory())throw new Error('Production artifact directory does not exist.');
  const paths=await walkFiles(distPath);
  if(!paths.length)throw new Error('Production artifact directory is empty.');
  const files=[];
  for(const path of paths){
    const bytes=await readFile(path);
    files.push({
      path:relative(distPath,path).replaceAll('\\','/'),
      bytes:bytes.byteLength,
      sha256:sha256(bytes)
    });
  }
  const canonical=JSON.stringify(files);
  return Object.freeze({algorithm:'sha256',digest:sha256(canonical),fileCount:files.length,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),files});
}

export function collectReleaseEnvironment(root){
  const commit=assertReleaseWorkspaceClean(root);
  const browser=resolveBrowserExecutable();
  return Object.freeze({
    commit,
    node:process.version,
    os:`${platform()} ${release()} ${arch()}`,
    browser:{path:browser.path,version:browser.version,source:browser.source}
  });
}
