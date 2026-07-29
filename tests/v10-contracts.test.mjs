import test from 'node:test';
import assert from 'node:assert/strict';
import {
  V10_STORES,SENTENCE_STEPS,lemmaKey,senseKey,normalizeCaptureCandidate,
  normalizeSourceOccurrence,normalizeActivity,normalizeSentenceProgress,buildV10CoachingEnvelope,
  normalizeContentManifest,validateContentManifest,validateSentenceSegments
} from '../src/v10-contracts.js';

test('v10 stores cover all phase persistence domains',()=>{
  for(const name of ['sourceOccurrences','captureCandidates','collections','activities','sentenceProgress','transcriptCache','contentManifests','contentAssets','aiJobs','coachingStats'])assert.ok(Object.values(V10_STORES).includes(name),name);
});

test('lexical identity separates lemma from sense',()=>{
  assert.equal(lemmaKey('  Take—into account '),'take-into account');
  assert.equal(senseKey({term:'bank',meaning:'ngân hàng',type:'word'}),senseKey({term:'Bank',meaning:'ngân hàng',type:'word'}));
  assert.notEqual(senseKey({term:'bank',meaning:'ngân hàng'}),senseKey({term:'bank',meaning:'bờ sông'}));
});

test('capture candidate preserves source occurrence and does not auto-link',()=>{
  const candidate=normalizeCaptureCandidate({term:'mitigate the effect',meaning:'giảm tác động',sourceType:'video',sourceContext:'Trees can mitigate the effect.',matchedCardIds:['card-1']});
  assert.equal(candidate.term,'mitigate the effect');
  assert.equal(candidate.status,'captured');
  assert.equal(candidate.sourceOccurrence.sourceType,'video');
  assert.equal(candidate.sourceOccurrence.context,'Trees can mitigate the effect.');
  assert.deepEqual(candidate.matchedCardIds,['card-1']);
});

test('source occurrence keeps timestamp and provenance context',()=>{
  const row=normalizeSourceOccurrence({lexicalItemId:'card',sourceType:'video',sourceId:'youtube:x',sourceSubId:'s1',context:'A real sentence.',startMs:1200,endMs:4400,verified:true});
  assert.equal(row.lexicalItemId,'card');
  assert.equal(row.startMs,1200);
  assert.equal(row.endMs,4400);
  assert.equal(row.verified,true);
});

test('activity contract distinguishes evidence policy from completion',()=>{
  const shadow=normalizeActivity({type:'shadowing',status:'completed',evidencePolicy:{affectsSchedule:false,reason:'shadowing-is-coaching'}});
  assert.equal(shadow.status,'completed');
  assert.equal(shadow.evidencePolicy.affectsSchedule,false);
  const unknown=normalizeActivity({type:'future-magic',evidencePolicy:{affectsSchedule:true}});
  assert.equal(unknown.type,'unknown');
  assert.equal(unknown.originalType,'future-magic');
  assert.equal(unknown.evidencePolicy.affectsSchedule,false);
});

test('sentence progress accepts only state-machine steps',()=>{
  const row=normalizeSentenceProgress({sentenceId:'s1',step:'not-a-step',repeatCount:99,playbackRate:7});
  assert.equal(row.step,'queued');
  assert.equal(row.repeatCount,20);
  assert.equal(row.playbackRate,2);
  assert.ok(SENTENCE_STEPS.includes(row.step));
});

test('legacy Retell output is unverified while explicit Skip remains distinct',()=>{
  const legacy=normalizeSentenceProgress({sentenceId:'legacy',step:'completed',retellResponse:'Legacy learner output'});
  assert.equal(legacy.retellStatus,'unverified');
  assert.equal(legacy.retellResponse,'Legacy learner output');
  const skipped=normalizeSentenceProgress({sentenceId:'skip',step:'completed',retellStatus:'skipped',retellResponse:''});
  assert.equal(skipped.retellStatus,'skipped');
  assert.equal(skipped.retellResponse,'');
});

test('V10 Dictation and Retell are persisted as coaching-only canonical envelopes',()=>{
  const sentence={id:'s1',text:'The policy remains effective.',startMs:0,endMs:3000,verified:true};
  const dictation=buildV10CoachingEnvelope({activityId:'dictation:s1',receiptId:'dictation-receipt:s1',activityType:'dictation',sentence,sourceId:'sentence:s1',cardId:'card-1',skill:'listening',result:'correct',learnerOutput:sentence.text});
  const retell=buildV10CoachingEnvelope({activityId:'retell:s1',receiptId:'retell-receipt:s1',activityType:'retell',sentence,sourceId:'sentence:s1',cardId:'card-1',skill:'production',result:'coaching',learnerOutput:'The speaker says the policy still works.',assistance:{correctionExposed:true}});
  for(const envelope of [dictation,retell]){
    assert.equal(envelope.decision.affectsSchedule,false);
    assert.equal(envelope.decision.reason,'assistance-exposed');
    assert.equal(envelope.verification.evaluation,undefined);
  }
  const saved=normalizeSentenceProgress({sentenceId:'s1',retellResponse:retell.attempt.learnerOutput,retellStatus:'coaching-completed',evidenceAttempts:[dictation,retell]});
  assert.equal(saved.retellStatus,'coaching-completed');
  assert.equal(saved.evidenceAttempts[1].attempt.result,'coaching');
  assert.equal(saved.evidenceAttempts.every(row=>row.decision.affectsSchedule===false),true);
});

test('content manifest requires explicit license and verified consistency',()=>{
  const invalid=validateContentManifest({id:'x',title:'X',skills:['dictation'],verified:true,qualityStatus:'validated'});
  assert.equal(invalid.valid,false);
  assert.ok(invalid.errors.some(error=>error.includes('license')));
  assert.ok(invalid.errors.some(error=>error.includes('qualityStatus')));
  const valid=validateContentManifest(normalizeContentManifest({id:'x',title:'X',skills:['dictation'],verified:true,qualityStatus:'verified',license:'original-internal'}));
  assert.equal(valid.valid,true);
});

test('sentence validator rejects empty, reversed and overly long segments',()=>{
  const result=validateSentenceSegments([
    {id:'ok',startMs:0,endMs:3000,text:'A valid sentence.'},
    {id:'empty',startMs:3100,endMs:4000,text:''},
    {id:'reverse',startMs:5000,endMs:4500,text:'Wrong timestamps.'},
    {id:'long',startMs:6000,endMs:40000,text:'Too long.'}
  ]);
  assert.equal(result.valid,false);
  assert.ok(result.errors.length>=3);
});
