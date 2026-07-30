import assert from 'node:assert/strict';
import { mkdtemp,rm,writeFile,mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  buildArtifactEvidence,
  findForbiddenArtifactPaths,
  findForbiddenTestControls
} from '../scripts/phase0-release-evidence.mjs';

test('Phase 0 hygiene rejects test bypass controls and tracked debug artifacts',()=>{
  assert.deepEqual(findForbiddenTestControls([
    {path:'tests/ok.test.mjs',source:"test('real assertion',()=>assert.equal(1,1));"},
    {path:'tests/skipped.test.mjs',source:"test"+".skip('critical',()=>{});"},
    {path:'tests/only.test.mjs',source:"describe"+".only('focused by mistake',()=>{});"}
  ]),['tests/only.test.mjs','tests/skipped.test.mjs']);
  assert.deepEqual(findForbiddenArtifactPaths([
    'src/app.js','debug-session.log','test-results/browser.json','docs/DECISIONS.md','tmp/probe.txt'
  ]),['debug-session.log','test-results/browser.json','tmp/probe.txt']);
});

test('production artifact evidence is canonical and detects byte changes',async()=>{
  const root=await mkdtemp(join(tmpdir(),'vocab-phase0-artifact-'));
  try{
    const dist=join(root,'dist');
    await mkdir(join(dist,'assets'),{recursive:true});
    await writeFile(join(dist,'index.html'),'<main>release</main>');
    await writeFile(join(dist,'assets','app.js'),'export const release=true;');
    const first=await buildArtifactEvidence(root);
    const second=await buildArtifactEvidence(root);
    assert.equal(first.algorithm,'sha256');
    assert.match(first.digest,/^[a-f0-9]{64}$/);
    assert.equal(first.fileCount,2);
    assert.deepEqual(first,second);
    assert.deepEqual(first.files.map(file=>file.path),['assets/app.js','index.html']);
    await writeFile(join(dist,'assets','app.js'),'export const release=false;');
    const changed=await buildArtifactEvidence(root);
    assert.notEqual(changed.digest,first.digest);
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});
