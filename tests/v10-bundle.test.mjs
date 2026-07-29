import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('v10 runtime and all browser modules form a valid esbuild graph',async()=>{
  const result=await build({
    entryPoints:[resolve(root,'src/main.js')],
    bundle:true,
    write:false,
    format:'esm',
    platform:'browser',
    target:['es2022'],
    legalComments:'none',
    logLevel:'silent'
  });
  assert.ok(result.outputFiles?.[0]?.contents?.length>0);
});
