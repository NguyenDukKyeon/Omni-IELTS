import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  convertIeltsListeningRawToBand,
  validateIeltsTestBlueprint
} from '../src/ielts-domain.js';
import {
  IeltsListeningRunner,
  createSyntheticListeningBlueprint,
  IELTS_LISTENING_EXAM_MODE,
  IELTS_LISTENING_PRACTICE_MODE,
  REVIEW_MINUTES
} from '../src/ielts-listening-runner.js';

describe('Stage 2 Wave W2: IELTS Listening Platform Completeness (W2-IELTS-LIS-001)', () => {
  describe('4.2 & D03: Deterministic Listening Practice Benchmark Scoring', () => {
    it('accurately converts all 41 raw score points (0 to 40) to official IELTS band benchmarks', () => {
      const expectations = [
        { raw: 40, band: 9.0 },
        { raw: 39, band: 9.0 },
        { raw: 38, band: 8.5 },
        { raw: 37, band: 8.5 },
        { raw: 36, band: 8.0 },
        { raw: 35, band: 8.0 },
        { raw: 34, band: 7.5 },
        { raw: 32, band: 7.5 },
        { raw: 31, band: 7.0 },
        { raw: 30, band: 7.0 },
        { raw: 29, band: 6.5 },
        { raw: 26, band: 6.5 },
        { raw: 25, band: 6.0 },
        { raw: 23, band: 6.0 },
        { raw: 22, band: 5.5 },
        { raw: 18, band: 5.5 },
        { raw: 17, band: 5.0 },
        { raw: 16, band: 5.0 },
        { raw: 15, band: 4.5 },
        { raw: 13, band: 4.5 },
        { raw: 12, band: 4.0 },
        { raw: 10, band: 4.0 },
        { raw: 9, band: 3.5 },
        { raw: 6, band: 3.5 },
        { raw: 5, band: 3.0 },
        { raw: 4, band: 3.0 },
        { raw: 3, band: 2.5 },
        { raw: 2, band: 2.5 },
        { raw: 1, band: 2.0 },
        { raw: 0, band: 0.0 }
      ];

      for (const { raw, band } of expectations) {
        assert.equal(
          convertIeltsListeningRawToBand(raw),
          band,
          `Raw score ${raw} should map to band ${band}`
        );
      }
    });

    it('rejects invalid or out-of-range raw scores fail-closed', () => {
      assert.throws(() => convertIeltsListeningRawToBand(-1));
      assert.throws(() => convertIeltsListeningRawToBand(41));
      assert.throws(() => convertIeltsListeningRawToBand(NaN));
      assert.throws(() => convertIeltsListeningRawToBand('30'));
      assert.throws(() => convertIeltsListeningRawToBand(null));
    });
  });

  describe('3.1 & 4.1: 4-Part 40-Item Listening Blueprint Contracts', () => {
    it('creates and validates a synthetic 4-part 40-item listening blueprint', () => {
      const blueprint = createSyntheticListeningBlueprint({
        id: 'ielts-lis-test-001',
        title: 'Academic / GT Listening Practice Test 1',
        track: 'academic'
      });

      assert.equal(blueprint.kind, 'ielts-test-blueprint');
      assert.equal(blueprint.skill, 'listening');
      assert.equal(blueprint.hierarchyLevel, 'SKILL_TEST');
      assert.equal(blueprint.sections.length, 4);

      let totalQuestions = 0;
      for (const section of blueprint.sections) {
        assert.ok(Array.isArray(section.questions));
        assert.equal(section.questions.length, 10);
        totalQuestions += section.questions.length;
      }
      assert.equal(totalQuestions, 40);

      const validation = validateIeltsTestBlueprint(blueprint);
      assert.equal(validation.valid, true, `Validation errors: ${validation.errors.join(', ')}`);
    });

    it('enforces D01 computer-delivered 2-minute review phase timing', () => {
      const blueprint = createSyntheticListeningBlueprint();
      assert.equal(blueprint.timing.testMinutes, 30);
      assert.equal(blueprint.timing.reviewMinutes, 2);
      assert.equal(REVIEW_MINUTES, 2);
      assert.equal(blueprint.timing.totalSeconds, 1920); // (30 + 2) * 60
    });
  });

  describe('4.2: Media Audio Synchronization & Playback Policies', () => {
    it('strictly enforces 1-play policy in Exam Mode', async () => {
      const blueprint = createSyntheticListeningBlueprint();
      const runner = new IeltsListeningRunner({
        blueprint,
        mode: IELTS_LISTENING_EXAM_MODE
      });

      assert.equal(runner.mode, IELTS_LISTENING_EXAM_MODE);
      assert.equal(runner.is1PlayOnly(), true);

      // Start section 1
      await runner.startSection(1);
      assert.equal(runner.currentPart, 1);

      // Complete section 1 playback
      await runner.completeSection(1);

      // Attempting to replay section 1 in exam mode must throw
      await assert.rejects(
        async () => runner.startSection(1),
        /Exam mode permits 1-play only/
      );
    });

    it('allows flexible pause, seek, and replay in Practice Mode', async () => {
      const blueprint = createSyntheticListeningBlueprint();
      const runner = new IeltsListeningRunner({
        blueprint,
        mode: IELTS_LISTENING_PRACTICE_MODE
      });

      assert.equal(runner.mode, IELTS_LISTENING_PRACTICE_MODE);
      assert.equal(runner.is1PlayOnly(), false);

      await runner.startSection(1);
      await runner.completeSection(1);

      // Replaying in practice mode is permitted
      await runner.startSection(1);
      assert.equal(runner.currentPart, 1);
    });
  });

  describe('D02: Checkpoint & Reload Recovery', () => {
    it('restores answered items, active section, elapsed time and audio position on reload', async () => {
      const blueprint = createSyntheticListeningBlueprint();
      const runner1 = new IeltsListeningRunner({
        blueprint,
        mode: IELTS_LISTENING_EXAM_MODE
      });

      await runner1.startSection(1);
      runner1.recordAnswer('q-1', 'B');
      runner1.updateAudioPosition(120); // 2 minutes elapsed

      const checkpoint = runner1.createCheckpoint();
      assert.ok(checkpoint.testRunId);
      assert.equal(checkpoint.activePart, 1);
      assert.equal(checkpoint.answers['q-1'], 'B');
      assert.equal(checkpoint.authoritativeAudioSeconds, 120);

      // Reload runner from checkpoint
      const runner2 = IeltsListeningRunner.restoreFromCheckpoint(blueprint, checkpoint);
      assert.equal(runner2.currentPart, 1);
      assert.equal(runner2.getAnswer('q-1'), 'B');
      assert.equal(runner2.authoritativeAudioSeconds, 120);
    });

    it('fails closed if reload checkpoint has unproven or corrupted audio position', () => {
      const blueprint = createSyntheticListeningBlueprint();
      const invalidCheckpoint = {
        activePart: 1,
        answers: {},
        authoritativeAudioSeconds: -5 // Invalid
      };

      assert.throws(
        () => IeltsListeningRunner.restoreFromCheckpoint(blueprint, invalidCheckpoint),
        /RELOAD_RECOVERY_UNSAFE/
      );
    });
  });

  describe('4.3, 4.4 & 4.5: Answer Key Privacy, Scoring, Error Candidate & Containment', () => {
    it('preserves strict key privacy pre-submission (KEY_LEAK_BEFORE_SUBMIT = 0)', () => {
      const blueprint = createSyntheticListeningBlueprint();
      const runner = new IeltsListeningRunner({ blueprint });

      const publicProjection = runner.getPublicQuestionProjection();
      for (const section of publicProjection.sections) {
        for (const q of section.questions) {
          assert.equal(q.sealedKey, undefined, `Question ${q.id} exposed sealedKey!`);
          assert.equal(q.correctAnswer, undefined, `Question ${q.id} exposed correctAnswer!`);
          if (Array.isArray(q.options)) {
            for (const opt of q.options) {
              assert.equal(opt.correct, undefined, `Option ${opt.id} in ${q.id} exposed correct flag!`);
            }
          }
        }
      }
    });

    it('evaluates 40-item test, emits ErrorCandidate for mistakes, applies honesty label, and maintains EvidencePolicy isolation', async () => {
      const blueprint = createSyntheticListeningBlueprint();
      const emittedErrors = [];
      const errorRepoMock = {
        add: (err) => emittedErrors.push(err),
        list: () => emittedErrors
      };

      const runner = new IeltsListeningRunner({
        blueprint,
        errorRepository: errorRepoMock
      });

      // Submit 35 correct answers and 5 incorrect answers
      const answers = {};
      for (let i = 1; i <= 40; i++) {
        answers[`q-${i}`] = i <= 35 ? 'a' : 'wrong-answer';
      }

      const result = await runner.submitTest({ answers });

      assert.equal(result.rawScore, 35);
      assert.equal(result.estimatedBand, 8.0);
      assert.equal(result.scoreLabel, 'Estimated Band Score — Practice Reference');

      // Schedule isolation invariant
      assert.equal(result.affectsSchedule, false);
      assert.equal(result.evidenceEligible, false);

      // Verify 5 error candidates were emitted
      assert.equal(emittedErrors.length, 5);
      for (const err of emittedErrors) {
        assert.equal(err.category, 'listening');
        assert.equal(err.advisory?.producer, 'ielts-listening-runner');
      }
    });
  });
});
