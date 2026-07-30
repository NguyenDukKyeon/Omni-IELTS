import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFile(resolve(root,path),'utf8');

test('v10 primary IA promotes IELTS to main navigation and removes the legacy launcher surface',async()=>{
  const [runtime,ia,css]=await Promise.all([
    read('src/v10-runtime.js'),
    read('src/primary-ia-v10.js'),
    read('public/v10-ia.css')
  ]);
  assert.match(runtime,/mountPrimaryIAV10/);
  assert.match(runtime,/primary-information-architecture/);
  assert.match(ia,/textContent='Thu thập'/);
  assert.match(ia,/textContent='Kho từ'/);
  assert.match(ia,/dataset\.route='ielts'/);
  assert.match(ia,/dataset\.view='ielts'/);
  assert.match(ia,/suppressLegacyLaunchers/);
  assert.match(ia,/v10-ielts-route-embedded/);
  assert.match(css,/\.v10-ielts-route-embedded/);
  assert.match(css,/\[data-v10-ielts-close\]/);
});

test('IELTS remains one shared hub while legacy tools stay available as advanced tools',async()=>{
  const [ia,hub,legacyOverride]=await Promise.all([
    read('src/primary-ia-v10.js'),
    read('src/ielts-hub-v2.js'),
    read('src/ielts-launcher-override.js')
  ]);
  assert.match(ia,/VocabMasterIeltsHub/);
  assert.doesNotMatch(hub,/Học hôm nay|buildTodayActivityPlan|data-v10-hub-activity/);
  assert.match(hub,/Khám phá bài học/);
  assert.match(hub,/Video của tôi/);
  assert.match(hub,/Lỗi & kỹ năng/);
  assert.match(legacyOverride,/openLegacyDialog/);
});
