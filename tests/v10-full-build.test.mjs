import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('complete build script copies remote content and bundles v10',()=>{
  const result=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:root,encoding:'utf8',env:{...process.env,NODE_ENV:'test'},timeout:60_000});
  assert.equal(result.status,0,`Full build failed.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
});
