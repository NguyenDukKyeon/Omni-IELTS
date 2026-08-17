import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  convertIeltsAcademicReadingRawToBand,
  convertIeltsGeneralReadingRawToBand,
  validateIeltsTestBlueprint
} from '../src/ielts-domain.js';
import {
  IeltsReadingRunner,
  createSyntheticReadingBlueprint,
  IELTS_READING_EXAM_MODE,
  IELTS_READING_PRACTICE_MODE,
  READING_TEST_MINUTES
} from '../src/ielts-reading-runner.js';

describe('Stage 2 Wave W3: IELTS Reading Platform Completeness (W3-IELTS-RDG-001)', () => {
  describe('4.2 & D03: Deterministic Reading Practice Benchmark Scoring', () => {
    it('accurately converts all 41 raw score points (0 to 40) for Academic Reading', () => {
      const expectations = [
        { raw: 40, band: 9.0 },
        { raw: 39, band: 9.0 },
        { raw: 38, band: 8.5 },
        { raw: 37, band: 8.5 },
        { raw: 36, band: 8.0 },
        { raw: 35, band: 8.0 },
        { raw: 34, band: 7.5 },
        { raw: 33, band: 7.5 },
        { raw: 32, band: 7.0 },
        { raw: 30, band: 7.0 },
        { raw: 29, band: 6.5 },
        { raw: 27, band: 6.5 },
        { raw: 26, band: 6.0 },
        { raw: 23, band: 6.0 },
        { raw: 22, band: 5.5 },
        { raw: 19, band: 5.5 },
        { raw: 18, band: 5.0 },
        { raw: 15, band: 5.0 },
        { raw: 14, band: 4.5 },
        { raw: 13, band: 4.5 },
        { raw: 12, band: 4.0 },
        { raw: 10, band: 4.0 },
        { raw: 9, band: 3.5 },
        { raw: 8, band: 3.5 },
        { raw: 7, band: 3.0 },
        { raw: 6, band: 3.0 },
        { raw: 5, band: 2.5 },
        { raw: 4, band: 2.5 },
        { raw: 3, band: 2.0 },
        { raw: 2, band: 2.0 },
        { raw: 1, band: 1.0 },
        { raw: 0, band: 0.0 }
      ];

      for (const { raw, band } of expectations) {
        assert.equal(
          convertIeltsAcademicReadingRawToBand(raw),
          band,
          `Academic raw score ${raw} should map to band ${band}`
        );
      }
    });

    it('accurately converts all 41 raw score points (0 to 40) for General Training Reading', () => {
      const expectations = [
        { raw: 40, band: 9.0 },
        { raw: 39, band: 8.5 },
        { raw: 38, band: 8.0 },
        { raw: 37, band: 8.0 },
        { raw: 36, band: 7.5 },
        { raw: 35, band: 7.0 },
        { raw: 34, band: 7.0 },
        { raw: 33, band: 6.5 },
        { raw: 32, band: 6.5 },
        { raw: 31, band: 6.0 },
        { raw: 30, band: 6.0 },
        { raw: 29, band: 5.5 },
        { raw: 27, band: 5.5 },
        { raw: 26, band: 5.0 },
        { raw: 23, band: 5.0 },
        { raw: 22, band: 4.5 },
        { raw: 19, band: 4.5 },
        { raw: 18, band: 4.0 },
        { raw: 15, band: 4.0 },
        { raw: 14, band: 3.5 },
        { raw: 12, band: 3.5 },
        { raw: 11, band: 3.0 },
        { raw: 9, band: 3.0 },
        { raw: 8, band: 2.5 },
        { raw: 6, band: 2.5 },
        { raw: 5, band: 2.0 },
        { raw: 3, band: 2.0 },
        { raw: 2, band: 1.0 },
        { raw: 1, band: 1.0 },
        { raw: 0, band: 0.0 }
      ];

      for (const { raw, band } of expectations) {
        assert.equal(
          convertIeltsGeneralReadingRawToBand(raw),
          band,
          `General Training raw score ${raw} should map to band ${band}`
        );
      }
    });

    it('rejects invalid or out-of-range raw scores fail-closed', () => {
      assert.throws(() => convertIeltsAcademicReadingRawToBand(-1));
      assert.throws(() => convertIeltsAcademicReadingRawToBand(41));
      assert.throws(() => convertIeltsAcademicReadingRawToBand(NaN));
      assert.throws(() => convertIeltsAcademicReadingRawToBand('30'));
      assert.throws(() => convertIeltsAcademicReadingRawToBand(null));

      assert.throws(() => convertIeltsGeneralReadingRawToBand(-1));
      assert.throws(() => convertIeltsGeneralReadingRawToBand(41));
      assert.throws(() => convertIeltsGeneralReadingRawToBand(NaN));
      assert.throws(() => convertIeltsGeneralReadingRawToBand('30'));
      assert.throws(() => convertIeltsGeneralReadingRawToBand(null));
    });
  });

  describe('3.1 & 4.1: 3-Passage / 3-Section 40-Item Reading Blueprint Contracts', () => {
    it('creates and validates a synthetic 3-passage Academic Reading blueprint', () => {
      const blueprint = createSyntheticReadingBlueprint({
        id: 'ielts-rdg-acad-001',
        title: 'Academic Reading Practice Test 1',
        track: 'academic'
      });

      assert.equal(blueprint.kind, 'ielts-test-blueprint');
      assert.equal(blueprint.skill, 'reading');
      assert.equal(blueprint.track, 'academic');
      assert.equal(blueprint.hierarchyLevel, 'SKILL_TEST');
      assert.equal(blueprint.sections.length, 3);

      let totalQuestions = 0;
      for (const section of blueprint.sections) {
        assert.ok(Array.isArray(section.questions));
        assert.ok(section.passageText && typeof section.passageText === 'string');
        totalQuestions += section.questions.length;
      }
      assert.equal(totalQuestions, 40);

      const validation = validateIeltsTestBlueprint(blueprint);
      assert.equal(validation.valid, true, `Validation errors: ${validation.errors.join(', ')}`);
    });

    it('creates and validates a synthetic 3-section General Training Reading blueprint', () => {
      const blueprint = createSyntheticReadingBlueprint({
        id: 'ielts-rdg-gt-001',
        title: 'General Training Reading Practice Test 1',
        track: 'general-training'
      });

      assert.equal(blueprint.kind, 'ielts-test-blueprint');
      assert.equal(blueprint.skill, 'reading');
      assert.equal(blueprint.track, 'general-training');
      assert.equal(blueprint.hierarchyLevel, 'SKILL_TEST');
      assert.equal(blueprint.sections.length, 3);

      let totalQuestions = 0;
      for (const section of blueprint.sections) {
        assert.ok(Array.isArray(section.questions));
        assert.ok(section.passageText && typeof section.passageText === 'string');
        totalQuestions += section.questions.length;
      }
      assert.equal(totalQuestions, 40);

      const validation = validateIeltsTestBlueprint(blueprint);
      assert.equal(validation.valid, true, `Validation errors: ${validation.errors.join(', ')}`);
    });

    it('enforces official 60-minute reading test timing', () => {
      const blueprint = createSyntheticReadingBlueprint({ track: 'academic' });
      assert.equal(blueprint.timing.testMinutes, 60);
      assert.equal(READING_TEST_MINUTES, 60);
      assert.equal(blueprint.timing.totalSeconds, 3600);
    });
  });

  describe('3.2: Reading Runner Lifecycle, Autosave & Reload Recovery', () => {
    it('initializes in exam mode, tracks answers, and computes raw/band scores', async () => {
      const blueprint = createSyntheticReadingBlueprint({ track: 'academic' });
      const runner = new IeltsReadingRunner({
        blueprint,
        mode: IELTS_READING_EXAM_MODE
      });

      assert.equal(runner.currentPassage, 1);
      assert.equal(runner.getAnswer('q-1'), null);

      runner.recordAnswer('q-1', 'TRUE');
      assert.equal(runner.getAnswer('q-1'), 'TRUE');

      runner.navigateToPassage(2);
      assert.equal(runner.currentPassage, 2);

      const publicProj = runner.getPublicProjection();
      assert.equal(publicProj.currentPassage, 2);
      assert.equal(publicProj.answeredCount, 1);
      assert.equal(publicProj.totalQuestions, 40);

      // Verify answer key privacy: sealed answers must never leak in public projection
      for (const section of publicProj.sections) {
        for (const q of section.questions) {
          assert.equal(q.correctAnswer, undefined, 'Correct answers must not leak in public projection');
          assert.equal(q.answerKey, undefined, 'Answer keys must not leak in public projection');
        }
      }

      // Complete test
      const answers = {};
      for (let i = 1; i <= 40; i++) {
        answers[`q-${i}`] = blueprint.sections
          .flatMap(s => s.questions)
          .find(q => q.id === `q-${i}`)?.correctAnswer || 'A';
      }

      const result = await runner.submitTest(answers);
      assert.equal(result.rawScore, 40);
      assert.equal(result.bandScore, 9.0);
      assert.equal(result.scoreLabel, 'Estimated Band Score — Practice Reference');
      assert.equal(result.affectsSchedule, false);
      assert.equal(result.evidenceEligible, false);
    });

    it('creates and restores autosave checkpoints safely', () => {
      const blueprint = createSyntheticReadingBlueprint({ track: 'general-training' });
      const runner1 = new IeltsReadingRunner({
        blueprint,
        mode: IELTS_READING_EXAM_MODE
      });

      runner1.recordAnswer('q-1', 'A');
      runner1.recordAnswer('q-2', 'FALSE');
      runner1.navigateToPassage(3);
      runner1.setElapsedSeconds(1250);

      const checkpoint = runner1.createAutosaveCheckpoint();
      assert.equal(checkpoint.schemaVersion, 'IELTS_READING_CHECKPOINT_V1');
      assert.equal(checkpoint.testId, blueprint.id);
      assert.equal(checkpoint.currentPassage, 3);
      assert.equal(checkpoint.elapsedSeconds, 1250);
      assert.equal(checkpoint.answers['q-1'], 'A');
      assert.equal(checkpoint.answers['q-2'], 'FALSE');

      // Restore into fresh runner instance
      const runner2 = new IeltsReadingRunner({
        blueprint,
        mode: IELTS_READING_EXAM_MODE
      });
      runner2.restoreFromCheckpoint(checkpoint);

      assert.equal(runner2.currentPassage, 3);
      assert.equal(runner2.elapsedSeconds, 1250);
      assert.equal(runner2.getAnswer('q-1'), 'A');
      assert.equal(runner2.getAnswer('q-2'), 'FALSE');
    });

    it('emits error candidates to ErrorRepository on incorrect answers without schedule impact', async () => {
      const errorRepository = {
        candidates: [],
        recordErrorCandidate(c) { this.candidates.push(c); }
      };

      const blueprint = createSyntheticReadingBlueprint({ track: 'academic' });
      const runner = new IeltsReadingRunner({
        blueprint,
        mode: IELTS_READING_EXAM_MODE,
        errorRepository
      });

      // Submit with all incorrect answers
      const answers = {};
      for (let i = 1; i <= 40; i++) {
        answers[`q-${i}`] = 'WRONG_ANSWER';
      }

      const result = await runner.submitTest(answers);
      assert.equal(result.rawScore, 0);
      assert.equal(result.bandScore, 0.0);
      assert.equal(result.affectsSchedule, false);
      assert.equal(result.evidenceEligible, false);

      // Verify error candidates were emitted
      assert.ok(errorRepository.candidates.length > 0);
      const sample = errorRepository.candidates[0];
      assert.equal(sample.category, 'reading');
      assert.ok(sample.questionId);
      assert.ok(sample.attemptedAnswer);
    });
  });
});
