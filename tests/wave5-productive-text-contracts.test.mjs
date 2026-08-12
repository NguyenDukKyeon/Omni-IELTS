import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTIVE_WRITING_PROMPT,PRODUCTIVE_PROMPT_REF,artifactRevisionId,createAdvisoryFeedback,createArtifactRevision,createLearnerArtifact,normalizeProductiveText,validateArtifactLineage,validateProductivePrompt } from '../src/productive-text-contracts.js';

test('controlled productive prompt is available', () => {
  assert.equal(PRODUCTIVE_WRITING_PROMPT.id, 'controlled-writing-self-review');
});

test('controlled prompt is immutable and rejects a recomputed changed prompt',()=>{
  assert.equal(Object.isFrozen(PRODUCTIVE_WRITING_PROMPT),true);
  const changed=structuredClone(PRODUCTIVE_WRITING_PROMPT);changed.title='Changed';
  assert.equal(validateProductivePrompt(changed).valid,false);
  const accessor={...PRODUCTIVE_WRITING_PROMPT};Object.defineProperty(accessor,'title',{enumerable:true,get(){throw new Error('must not invoke');}});
  assert.equal(validateProductivePrompt(accessor).valid,false);
});

test('text revisions preserve exact LF text and a strict immutable lineage',()=>{
  const first=createArtifactRevision({artifactId:'productive-artifact:test',revisionNumber:1,parentRevisionId:null,text:'one\r\ntwo',at:10});
  const artifact=createLearnerArtifact({id:'productive-artifact:test',promptRef:PRODUCTIVE_PROMPT_REF,revision:first,at:10});
  const second=createArtifactRevision({artifactId:artifact.id,revisionNumber:2,parentRevisionId:first.id,text:'',at:11});
  assert.equal(first.text,'one\ntwo');assert.equal(first.wordCount,2);assert.notEqual(first.id,second.id);
  assert.equal(validateArtifactLineage({artifact:{...artifact,currentRevisionId:second.id,revisionCount:2,updatedAt:11},revisions:[first,second]}).valid,true);
  assert.throws(()=>normalizeProductiveText('x'.repeat(50_001)));
});

test('advisory feedback binds exact ordered responses and never has a score',()=>{
  const feedback=createAdvisoryFeedback({artifactId:'productive-artifact:test',artifactRevisionId:'artifact-revision:test',runId:'today-run:test',attemptId:'attempt:test',receiptId:'receipt:test',responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'revisit'},{criterionId:'organization',status:'not-applicable'},{criterionId:'clarity',status:'satisfied'}],note:'Private note',at:20});
  assert.equal(feedback.reviewKind,'learner-self-review');assert.equal('score' in feedback,false);assert.equal(Object.isFrozen(feedback.responses[0]),true);
});
