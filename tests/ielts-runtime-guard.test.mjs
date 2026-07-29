import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCardInput } from '../src/learning.js';

const passive=sanitizeCardInput({id:'passive',front:'reliable',back:'đáng tin cậy',learningGoal:'passive'});
const active=sanitizeCardInput({id:'active',front:'reach a peak',back:'đạt đỉnh',type:'collocation',learningGoal:'active'});
globalThis.VocabMasterApp={getState:()=>({cards:[passive,active]})};
const { __testing }=await import('../src/ielts-runtime-guard.js');

test('runtime guard blocks IELTS skills outside the card learning goal',()=>{
  assert.equal(__testing.supportsSkill('passive','recognition'),true);
  assert.equal(__testing.supportsSkill('passive','recall'),true);
  assert.equal(__testing.supportsSkill('passive','listening'),false);
  assert.equal(__testing.supportsSkill('passive','production'),false);
  assert.equal(__testing.supportsSkill('active','listening'),true);
  assert.equal(__testing.supportsSkill('active','production'),true);
});

test('unknown or deleted cards cannot create IELTS FSRS evidence',()=>{
  assert.equal(__testing.supportsSkill('missing','listening'),false);
  assert.equal(__testing.supportsSkill('', 'production'),false);
});
