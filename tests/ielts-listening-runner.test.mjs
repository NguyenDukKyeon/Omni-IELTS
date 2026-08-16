import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';

globalThis.indexedDB = new IDBFactory();

// Import under test (will fail RED until Commit B satisfies)
import {
  IeltsListeningRunner,
  createSyntheticListeningBlueprint,
  IELTS_LISTENING_EXAM_MODE,
  IELTS_LISTENING_PRACTICE_MODE
} from '../src/ielts-listening-runner.js';
import {
  convertIeltsListeningRawToBand,
  validateIeltsTestBlueprint,
  validateIeltsTestRun
} from '../src/ielts-domain.js';
import {
  saveIeltsTestRun,
  getIeltsTestRun,
  reopenIeltsDatabase
} from '../src/ielts-persistence.js';
import { listErrorCandidates } from '../src/error-candidate.js';

test('W2-LIS-01: convertIeltsListeningRawToBand deterministically converts all 0-40 raw scores', () => {
  const expectedScale = [
    { min: 39, max: 40, band: 9.0 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8.0 },
    { min: 32, max: 34, band: 7.5 },
    { min: 30, max: 31, band: 7.0 },
    { min: 26, max: 29, band: 6.5 },
    { min: 23, max: 25, band: 6.0 },
    { min: 18, max: 22, band: 5.5 },
    { min: 16, max: 17, band: 5.0 },
    { min: 13, max: 15, band: 4.5 },
    { min: 10, max: 12, band: 4.0 },
    { min: 6, max: 9, band: 3.5 },
    { min: 4, max: 5, band: 3.0 },
    { min: 2, max: 3, band: 2.5 },
    { min: 1, max: 1, band: 2.0 },
    { min: 0, max: 0, band: 0.0 }
  ];

  for (const tier of expectedScale) {
    for (let raw = tier.min; raw <= tier.max; raw++) {
      const band = convertIeltsListeningRawToBand(raw);
      assert.equal(band, tier.band, `Raw score ${raw} should convert to band ${tier.band}, got ${band}`);
    }
  }

  // Reject out of bounds or invalid inputs
  assert.throws(() => convertIeltsListeningRawToBand(-1), /Invalid IELTS raw score/);
  assert.throws(() => convertIeltsListeningRawToBand(41), /Invalid IELTS raw score/);
  assert.throws(() => convertIeltsListeningRawToBand(NaN), /Invalid IELTS raw score/);
  assert.throws(() => convertIeltsListeningRawToBand('30'), /Invalid IELTS raw score/);
});

test('W2-LIS-02: 4-part Listening blueprint requires exactly 4 sections and 40 items total', () => {
  const validBlueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-01',
    title: 'Authentic IELTS Listening Test 1',
    track: 'academic'
  });

  const validation = validateIeltsTestBlueprint(validBlueprint);
  assert.equal(validation.valid, true, `Blueprint must be valid: ${validation.errors?.join(' ')}`);
  assert.equal(validBlueprint.sections.length, 4, 'Must have exactly 4 sections');

  const totalQuestions = validBlueprint.sections.reduce((sum, s) => sum + s.questions.length, 0);
  assert.equal(totalQuestions, 40, 'Must have exactly 40 questions across all 4 parts');

  // Reject blueprint with missing section
  const invalidBlueprint = {
    ...validBlueprint,
    sections: validBlueprint.sections.slice(0, 3)
  };
  assert.throws(() => new IeltsListeningRunner({ blueprint: invalidBlueprint }), /4 sections/);
});

test('W2-LIS-03: Exam Mode enforces 1-play audio policy and disables pause/seek during section audio', async () => {
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-02',
    title: 'Exam Mode Playback Verification',
    track: 'academic'
  });

  const runner = new IeltsListeningRunner({
    blueprint,
    mode: IELTS_LISTENING_EXAM_MODE
  });

  assert.equal(runner.mode, IELTS_LISTENING_EXAM_MODE);
  assert.equal(runner.is1PlayOnly(), true);

  // Audio start Part 1
  await runner.startSection(1);
  assert.equal(runner.currentPart, 1);

  // Seeking backward or replaying during section audio is blocked in Exam Mode
  assert.throws(() => runner.seekAudio(0), /Exam mode prevents audio seek/);
  assert.throws(() => runner.replaySection(1), /Exam mode permits 1-play only/);

  // Pre-submission transcript is strictly hidden
  assert.equal(runner.canRevealTranscript(), false);
});

test('W2-LIS-04: Practice Mode allows pause, seek, replay, per-question check, and transcript reveal', async () => {
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-03',
    title: 'Practice Mode Playback Verification',
    track: 'general-training'
  });

  const runner = new IeltsListeningRunner({
    blueprint,
    mode: IELTS_LISTENING_PRACTICE_MODE
  });

  assert.equal(runner.mode, IELTS_LISTENING_PRACTICE_MODE);
  assert.equal(runner.is1PlayOnly(), false);

  await runner.startSection(1);
  assert.doesNotThrow(() => runner.pauseAudio());
  assert.doesNotThrow(() => runner.seekAudio(10));
  assert.equal(runner.canRevealTranscript(), true);
});

test('W2-LIS-05: Pre-submission public question projection enforces zero key leak (KEY_LEAK_BEFORE_SUBMIT = 0)', () => {
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-04',
    title: 'Key Privacy Verification',
    track: 'academic'
  });

  const runner = new IeltsListeningRunner({
    blueprint,
    mode: IELTS_LISTENING_EXAM_MODE
  });

  const publicProjection = runner.getPublicProjection();
  const rawJson = JSON.stringify(publicProjection);

  // Must not expose secret fields in public projection
  assert.equal(rawJson.includes('"correct":true'), false, 'Must not leak correct: true');
  assert.equal(rawJson.includes('"acceptedAnswers"'), false, 'Must not leak acceptedAnswers');
  assert.equal(rawJson.includes('"acceptedOptionId"'), false, 'Must not leak acceptedOptionId');
  assert.equal(rawJson.includes('"sealedKey"'), false, 'Must not leak sealedKey');
});

test('W2-LIS-06: 40-item test runner evaluates deterministic scores and emits ErrorCandidate records for wrong answers', async () => {
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-05',
    title: 'Scoring & Error Emission Test',
    track: 'academic'
  });

  const runner = new IeltsListeningRunner({
    blueprint,
    mode: IELTS_LISTENING_EXAM_MODE
  });

  // Submit 35 correct answers and 5 wrong answers
  const answers = {};
  for (let part = 1; part <= 4; part++) {
    const section = blueprint.sections[part - 1];
    for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
      const q = section.questions[qIdx];
      const qNum = (part - 1) * 10 + qIdx + 1;
      if (qNum <= 35) {
        answers[q.id] = runner.getCorrectAnswerForTesting(q.id);
      } else {
        answers[q.id] = runner.getWrongAnswerForTesting(q.id);
      }
    }
  }

  const result = await runner.submitTest({ answers });

  assert.equal(result.rawScore, 35, 'Raw score must be 35/40');
  assert.equal(result.bandScore, 8.0, 'Band score for 35/40 must be 8.0');
  assert.equal(result.totalQuestions, 40);
  assert.equal(result.correctCount, 35);
  assert.equal(result.wrongCount, 5);

  // Verify ErrorCandidate emission
  assert.equal(result.emittedErrorCandidateCount, 5, 'Must emit 5 error candidates for wrong answers');

  // Verify EvidencePolicy compliance
  assert.equal(result.receipt.affectsSchedule, false, 'affectsSchedule must be false');
  assert.equal(result.receipt.evidenceEligible, false, 'evidenceEligible must be false');
});

test('W2-LIS-07: Test run persists to ieltsTestRuns store with validation and can be restored', async () => {
  await reopenIeltsDatabase();

  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-bp-06',
    title: 'Durable Persistence Verification',
    track: 'general-training'
  });

  const runner = new IeltsListeningRunner({
    blueprint,
    mode: IELTS_LISTENING_EXAM_MODE
  });

  const testRun = await runner.createRunRecord();
  assert.equal(testRun.status, 'active');
  assert.equal(testRun.skill, 'listening');
  assert.equal(testRun.affectsSchedule, false);

  const saved = await saveIeltsTestRun(testRun);
  assert.ok(saved.id);

  const loaded = await getIeltsTestRun(saved.id);
  assert.equal(loaded.id, saved.id);
  assert.equal(loaded.blueprintId, blueprint.id);
  assert.equal(loaded.track, 'general-training');
});
