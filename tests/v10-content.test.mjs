import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSentenceSegments,normalizeKey } from '../src/v10-contracts.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const readJson=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));

const catalog=await readJson('public/content/catalog.json');
const lessons=[
  ['starter-b1-travel-plans',7],
  ['starter-b2-course-enquiry',8],
  ['starter-b2-urban-trees',8]
].map(([id,sentenceCount])=>({
  id,
  sentenceCount,
  assets:{
    transcript:`/content/lessons/${id}/transcript.json`,
    exercises:`/content/lessons/${id}/exercises.json`,
    lexical:`/content/lessons/${id}/lexical.json`
  }
}));

test('production catalog is a signed versioned envelope with no unreviewed lesson payloads',()=>{
  assert.equal(catalog.kind,'vocab-master-signed-catalog');
  assert.equal(catalog.algorithm,'Ed25519');
  assert.equal(catalog.signatureVersion,1);
  assert.match(catalog.signature,/^[A-Za-z0-9+/]+=*$/);
  assert.equal(catalog.payload.schemaVersion,2);
  assert.equal(catalog.payload.catalogRevision,1);
  assert.equal(catalog.payload.sequence,1);
  assert.deepEqual(catalog.payload.entries,[]);
  assert.equal('packs'in catalog,false);
});

test('isolated unsigned development fixtures exist and transcripts pass timestamp validation',async()=>{
  for(const lesson of lessons){
    for(const url of Object.values(lesson.assets))await stat(resolve(root,'public',String(url).replace(/^\//,'')));
    const transcript=await readJson(`public${lesson.assets.transcript}`);
    const result=validateSentenceSegments(transcript);
    assert.equal(result.valid,true,`${lesson.id}: ${result.errors.join(' ')}`);
    assert.equal(result.segments.length,lesson.sentenceCount,lesson.id);
    assert.ok(result.segments.every(row=>row.status==='verified'));
  }
});

test('evidence questions have one correct option and verbatim transcript evidence',async()=>{
  for(const lesson of lessons){
    const transcript=await readJson(`public${lesson.assets.transcript}`);const source=transcript.map(row=>row.text).join(' ');
    const exercises=await readJson(`public${lesson.assets.exercises}`);
    for(const item of exercises.items||[]){
      assert.ok(item.evidenceText,`${item.id}: missing evidence`);
      assert.ok(source.includes(item.evidenceText),`${item.id}: evidence not verbatim`);
      assert.equal(item.options.filter(option=>option.correct).length,1,`${item.id}: correct count`);
      assert.ok(item.options.every(option=>String(option.rationale||'').length>=12),`${item.id}: rationale`);
      assert.equal(new Set(item.options.map(option=>normalizeKey(option.text))).size,item.options.length,`${item.id}: duplicate options`);
    }
  }
});

test('lexical targets are source-linked and are not auto-created cards',async()=>{
  for(const lesson of lessons){
    const transcript=await readJson(`public${lesson.assets.transcript}`);const ids=new Set(transcript.map(row=>row.id));
    const lexical=await readJson(`public${lesson.assets.lexical}`);
    for(const row of lexical.targets||[]){assert.ok(ids.has(row.sentenceId),`${lesson.id}: unknown sentence ${row.sentenceId}`);assert.ok(row.targets.length);for(const target of row.targets){assert.ok(target.term);assert.ok(target.meaning);}}
    assert.equal('cards'in lexical,false,`${lesson.id}: content must not contain personal cards`);
  }
});
