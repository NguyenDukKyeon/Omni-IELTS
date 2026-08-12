import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { IDBFactory } from 'fake-indexeddb';
import { generateWave2Fixture,generateWave2ToneWav } from './fixtures/generate-wave2-listening-tone-fixture.mjs';
import {
  CONTROLLED_LISTENING_COVERAGE,
  createControlledListeningProof,
  validateControlledListeningFixture
} from '../src/listening-value-slice-ui.js';
import { getV10Record,listV10Records,putV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { listErrorCandidates } from '../src/error-candidate.js';
import { listReviewEvents,reopenCoreDatabase } from '../src/persistence.js';
import { reopenIeltsDatabase } from '../src/ielts-persistence.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';

globalThis.indexedDB=new IDBFactory();
test.beforeEach(async()=>{globalThis.indexedDB=new IDBFactory();await Promise.all([reopenV10Database(),reopenCoreDatabase(),reopenIeltsDatabase()]);});

const fixtureUrl=new URL('./fixtures/wave2-listening-tone-fixture.json',import.meta.url);
const wavUrl=new URL('./fixtures/wave2-listening-tone-fixture.wav',import.meta.url);
const clone=value=>structuredClone(value);

test('deterministic generator materializes the exact canonical PCM fixture and manifest',async()=>{
  const generated=generateWave2Fixture();
  const [json,wav]=await Promise.all([readFile(fixtureUrl),readFile(wavUrl)]);
  assert.deepEqual(json,generated.json);
  assert.deepEqual(wav,generated.wav);
  assert.deepEqual(wav,generateWave2ToneWav());
  assert.equal(wav.length,28_844);
  assert.equal(wav.subarray(0,4).toString('ascii'),'RIFF');
  assert.equal(wav.readUInt16LE(20),1);
  assert.equal(wav.readUInt16LE(22),1);
  assert.equal(wav.readUInt32LE(24),8000);
  assert.equal(wav.readUInt16LE(34),16);
  assert.equal(generated.fixture.audio.durationMs,1800);
  assert.deepEqual(generated.fixture.audio.frequencies,[440,660,440]);
});

test('fixture validator is exact, descriptor-safe, rights-bounded and rejects hostile data before persistence',async()=>{
  const {fixture,wav}=generateWave2Fixture();
  const value=await validateControlledListeningFixture(fixture,wav);
  assert.equal(value.coverage,CONTROLLED_LISTENING_COVERAGE);
  assert.equal(value.approval.state,'APPROVED_FOR_CONTROLLED_TEST_ONLY');
  assert.equal(value.approval.publication,false);
  assert.equal(value.approval.learnerEvidence,false);
  assert.equal(value.rights.externalCopyrightedMedia,false);
  assert.equal(Object.isFrozen(value),true);
  assert.equal(Object.isFrozen(value.question.options),true);
  for(const mutation of [
    value=>{value.version=2;},
    value=>{value.audio.sha256='0'.repeat(64);},
    value=>{value.approval.productionCatalog=true;},
    value=>{value.source.url='https://example.invalid/audio.wav';},
    value=>{value.transcript.provenance.tts=true;},
    value=>{value.privatePath='C:\\private\\fixture.wav';}
  ]){const hostile=clone(fixture);mutation(hostile);await assert.rejects(validateControlledListeningFixture(hostile,wav),error=>error.code==='LISTENING_FIXTURE_INVALID');}
  let reads=0;const hostile=clone(fixture);Object.defineProperty(hostile,'audio',{enumerable:true,get(){reads+=1;return fixture.audio;}});
  await assert.rejects(validateControlledListeningFixture(hostile,wav),error=>error.code==='LISTENING_FIXTURE_INVALID');assert.equal(reads,0);
  const renamed=clone(fixture);renamed.question.id='another-question';await assert.rejects(validateControlledListeningFixture(renamed,wav),error=>error.code==='LISTENING_FIXTURE_INVALID');
  const retargeted=clone(fixture);retargeted.question.target.cardId='another-target';await assert.rejects(validateControlledListeningFixture(retargeted,wav),error=>error.code==='LISTENING_FIXTURE_INVALID');
  const changedTime=clone(fixture);changedTime.question.updatedAt+=1;await assert.rejects(validateControlledListeningFixture(changedTime,wav),error=>error.code==='LISTENING_FIXTURE_INVALID');
});

test('controlled proof starts before response, resumes, executes one canonical wrong terminal and remains schedule/provider neutral',async()=>{
  const {fixture,wav}=generateWave2Fixture();
  await assert.rejects(createControlledListeningProof({fixture,audioBytes:wav,audioUrl:fixture.audio.path,provider:()=>{}}),error=>error.code==='LISTENING_FIXTURE_INVALID');
  const proof=await createControlledListeningProof({fixture,audioBytes:wav,audioUrl:fixture.audio.path});
  const initial=await proof.open();
  assert.equal(initial.coverage,CONTROLLED_LISTENING_COVERAGE);
  assert.equal(initial.phase,'active');
  assert.equal(initial.result,null);
  const preterminal=JSON.stringify(initial);for(const sealed of ['correct','rationale','low tone','high tone','keyDigest'])assert.equal(preterminal.includes(sealed),false);
  const runBefore=await getV10Record(V10_STORES.todayRuns,initial.runId);
  assert.equal(runBefore.status,'active');
  const resumed=await proof.open();assert.equal(resumed.runId,initial.runId);
  const result=await proof.submit('high-low-high');
  assert.equal(result.phase,'terminal');assert.equal(result.result.score.disposition,'wrong');
  assert.equal(result.result.feedback.rationale,'The selected order reverses all three fixture tones.');
  assert.equal(result.result.run.evidenceDecision.eligible,false);assert.equal(result.result.run.evidenceDecision.affectsSchedule,false);
  assert.equal(result.result.errorCandidate.state,'open');
  assert.equal(result.result.weaknessSignal.qualification,'ADVISORY_ONLY');
  assert.equal(result.result.recommendationPreview.status,'NONPERSISTENT_ADVISORY');
  assert.equal(result.result.recommendationPreview.schedulingEffect,'NONE');
  assert.equal(result.result.recommendationPreview.providerCall,'NONE');
  assert.equal(result.result.feedback.sourceAnchor.startMs,0);
  assert.equal(result.result.feedback.sourceAnchor.endMs,1800);
  assert.equal(result.result.feedback.sourceAnchor.segmentIds.length,3);
  assert.equal(result.result.feedback.sourceRevisionRef.sourceId,'wave2-controlled-tone-source-v1');
  const duplicate=await proof.submit('high-low-high');assert.deepEqual(duplicate.result,result.result);
  await assert.rejects(proof.submit('low-high-low'),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','TODAY_RUN_TERMINAL_CONFLICT'].includes(error.code));
  assert.equal((await listErrorCandidates()).length,1);
  assert.deepEqual(await listReviewEvents(),[]);
  assert.equal((await listV10Records(V10_STORES.activities,{sortBy:null})).length,0);
});

test('correct response creates no candidate or advisory',async()=>{
  const generated=generateWave2Fixture();
  const correct=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});
  await correct.open();const terminal=await correct.submit('low-high-low');
  assert.equal(terminal.result.score.disposition,'correct');assert.equal(terminal.result.errorCandidate,null);assert.equal(terminal.result.weaknessSignal,null);assert.equal(terminal.result.recommendationPreview,null);
  assert.equal(terminal.result.run.evidenceDecision.eligible,false);
  assert.equal(terminal.result.run.evidenceDecision.affectsSchedule,false);
  assert.deepEqual(await listReviewEvents(),[]);
  assert.deepEqual(await listErrorCandidates(),[]);
});

test('direct-user confirmation is separate, idempotent and does not promote or schedule',async()=>{
  const generated=generateWave2Fixture();
  const wrong=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});
  await wrong.open();const opened=await wrong.submit('high-low-high');assert.equal(opened.result.errorCandidate.state,'open');
  const confirmed=await wrong.confirm({userId:'controlled-fixture-user',decisionId:'wave2-controlled-confirmation-v1',reason:'direct-user-confirmation',at:1786320005000});
  assert.equal(confirmed.result.errorCandidate.state,'confirmed');
  const replay=await wrong.confirm({userId:'controlled-fixture-user',decisionId:'wave2-controlled-confirmation-v1',reason:'direct-user-confirmation',at:1786320005000});
  assert.deepEqual(replay,confirmed);
  assert.deepEqual(await listReviewEvents(),[]);
  assert.deepEqual(await listV10Records(V10_STORES.globalErrorOccurrences,{sortBy:null}),[]);
});

test('combined backup restores canonical terminal/candidate while recommendation is reconstructed only',async()=>{
  const generated=generateWave2Fixture();const proof=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});
  await proof.open();const before=await proof.submit('high-low-high');await proof.confirm({userId:'controlled-fixture-user',decisionId:'wave2-controlled-backup-confirmation',reason:'direct-user-confirmation',at:1786320006000});
  const backup=await buildCombinedBackup();const serialized=JSON.stringify(backup);
  assert.equal(serialized.includes('recommendation-preview'),false);
  assert.equal(serialized.includes('PRIVATE_CREDENTIAL_SENTINEL'),false);
  const terminal=backup.domains.v10.stores.todayRuns.find(row=>row.id===before.runId);
  assert.equal(JSON.stringify(terminal).includes('The first and third tones are 440 Hz'),false);
  assert.equal(JSON.stringify(terminal).includes('low tone'),false);
  await restoreCombinedBackup(backup);await reopenV10Database();
  const reopened=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});
  const after=await reopened.open();assert.deepEqual(after.result.recommendationPreview,before.result.recommendationPreview);
  const row=await getV10Record(V10_STORES.todayRuns,after.runId);assert.equal(row.status,'completed');
});

test('active child source and terminal feedback tamper fail closed without a second candidate',async()=>{
  const generated=generateWave2Fixture();const proof=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});await proof.open();const terminal=await proof.submit('high-low-high');const before=(await listErrorCandidates()).length;
  const revisionId=terminal.result.feedback.sourceRevisionRef.revisionId,sourceId=terminal.result.feedback.sourceRevisionRef.sourceId;const source=await getV10Record(V10_STORES.transcriptSources,sourceId);await putV10Record(V10_STORES.transcriptSources,{...source,activeRevisionId:'future-controlled-revision',latestRevisionId:'future-controlled-revision'},'test-controlled-source-stale');
  const stale=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});await assert.rejects(stale.open(),error=>error.code==='LISTENING_FIXTURE_SOURCE_STALE');assert.equal((await listErrorCandidates()).length,before);
  await putV10Record(V10_STORES.transcriptSources,{...source,activeRevisionId:revisionId,latestRevisionId:revisionId},'test-controlled-source-restored');
  const row=await getV10Record(V10_STORES.todayRuns,terminal.runId);const tampered=clone(row);tampered.envelope.attempt.metadata.feedback.rationale='tampered rationale';await putV10Record(V10_STORES.todayRuns,tampered,'test-controlled-terminal-tampered');const replay=await createControlledListeningProof({fixture:generated.fixture,audioBytes:generated.wav,audioUrl:generated.fixture.audio.path});await assert.rejects(replay.open(),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');assert.equal((await listErrorCandidates()).length,before);
});

test('production wiring keeps controlled fixture behind all three development smoke gates',async()=>{
  const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
  const lab=await readFile(new URL('../src/ielts-lab.js',import.meta.url),'utf8');
  assert.match(main,/import\.meta\.env\?\.DEV/);
  assert.match(main,/VITE_BROWSER_SMOKE_SEED/);
  assert.match(main,/navigator\.webdriver/);
  assert.match(main,/wave2-listening-tone-fixture\.json/);
  assert.match(lab,/controlledListening/);
});
