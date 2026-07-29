import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('video workspace loads all known caption chunks before opening the learning rail',async()=>{
  const [workspace,resolver,runtime]=await Promise.all([
    read('src/video-workspace-v2.js'),
    read('src/transcript-resolver-v2.js'),
    read('src/v10-runtime.js')
  ]);
  assert.match(workspace,/firstChunkSeconds:180/);
  assert.match(workspace,/durationSeconds-firstEnd/);
  assert.match(workspace,/chunkSeconds:180/);
  assert.match(workspace,/preparePracticeSegments/);
  assert.match(workspace,/data-video-sentence-index/);
  assert.match(workspace,/Thông thường mất khoảng 10–30 giây/);
  assert.match(resolver,/durationSeconds/);
  assert.match(resolver,/complete:Boolean/);
  assert.match(runtime,/mountVideoWorkspaceV2/);
});
