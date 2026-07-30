import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateRepository } from '../content-repo/scripts/validate-content.mjs';

const root=resolve(import.meta.dirname,'..');
const readJson=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));

test('draft corpus is structurally valid with exact sampler and Starter Pack inventory',async()=>{
  const report=await validateRepository({root:resolve(root,'content-repo'),mode:'draft'});
  assert.equal(report.valid,true,report.errors.join('\n'));
  assert.equal(report.packs,5);
  assert.equal(report.samplerLessons,3);
  assert.equal(report.starterLessons,24);
  assert.deepEqual(report.starterDistribution,{listening:8,reading:8,'lexical-paraphrase':8});

  const weeks=await Promise.all([1,2,3,4].map(week=>readJson(`content-repo/packs/foundations-week-${week}/manifest.json`)));
  for(const [index,manifest] of weeks.entries()){
    assert.equal(manifest.lessons.length,6,`week ${index+1}`);
    assert.deepEqual(
      manifest.lessons.reduce((counts,lesson)=>({...counts,[lesson.skill]:(counts[lesson.skill]||0)+1}),{}),
      {listening:2,reading:2,'lexical-paraphrase':2}
    );
    assert.equal(new Set(manifest.lessons.map(lesson=>lesson.humanReviewRecordId)).size,6);
  }
});

test('AI-assisted content remains a draft and production publication fails closed',async()=>{
  const [rights,provenance,reviews]=await Promise.all([
    readJson('content-repo/registries/rights.json'),
    readJson('content-repo/registries/provenance.json'),
    readJson('content-repo/registries/human-reviews.json')
  ]);
  assert.ok(rights.records.length>=68);
  assert.ok(rights.records.every(record=>record.status==='pending'&&record.rightsHolder===null&&record.aiAsserted===false));
  assert.ok(provenance.records.every(record=>record.aiDraft===true));
  assert.ok(reviews.records.every(record=>record.status==='pending'&&record.reviewerType==='human'&&record.reviewerId===null&&record.selfApprovedByAi===false));
  assert.equal(new Set(reviews.records.map(record=>record.id)).size,reviews.records.length);

  const publish=await validateRepository({root:resolve(root,'content-repo'),mode:'publish'});
  assert.equal(publish.valid,false);
  assert.match(publish.errors.join('\n'),/rights are not approved/i);
  assert.match(publish.errors.join('\n'),/named human approval is missing/i);
});

test('production learner path has no unsigned fixture or active generation factory',async()=>{
  const [platform,runtime,catalog,fixtureReadme]=await Promise.all([
    readFile(resolve(root,'src/content-platform.js'),'utf8'),
    readFile(resolve(root,'src/v10-runtime.js'),'utf8'),
    readJson('public/content/catalog.json'),
    readFile(resolve(root,'public/content/dev-fixtures/README.md'),'utf8')
  ]);
  assert.doesNotMatch(platform,/legacy-content-manifest\.json|from ['"].*unsigned/i);
  assert.doesNotMatch(runtime,/from ['"].*ai-content-factory/i);
  assert.deepEqual(catalog.payload.entries,[]);
  assert.match(fixtureReadme,/not\s+referenced by the production signed catalog/i);
});
