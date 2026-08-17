import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWritingWordCount,
  validateIeltsWritingPrompt,
  evaluateWritingRubricCriteria,
  calculateOverallWritingBand
} from '../src/ielts-domain.js';
import {
  IeltsWritingRunner,
  createSyntheticWritingBlueprint,
  IELTS_WRITING_TASK1_ACADEMIC_PROMPT,
  IELTS_WRITING_TASK1_GT_PROMPT,
  IELTS_WRITING_TASK2_PROMPT,
  IELTS_WRITING_EXAM_MODE,
  IELTS_WRITING_PRACTICE_MODE,
  WRITING_FULL_TEST_MINUTES,
  WRITING_TASK1_MINUTES,
  WRITING_TASK2_MINUTES
} from '../src/ielts-writing-runner.js';

describe('Stage 2 Wave W4: IELTS Productive Writing Platform (W4-IELTS-WRT-001)', () => {
  describe('Word Count Engine & Target Thresholds', () => {
    it('accurately counts words handling whitespace, punctuation, contractions, and hyphens', () => {
      assert.equal(calculateWritingWordCount(''), 0);
      assert.equal(calculateWritingWordCount('   '), 0);
      assert.equal(calculateWritingWordCount('Hello world'), 2);
      assert.equal(calculateWritingWordCount('This is a test paragraph with multiple sentences. How many words?'), 11);
      assert.equal(calculateWritingWordCount("It's well-known that state-of-the-art models perform well."), 7);
      assert.equal(calculateWritingWordCount('Word1\n\nWord2\tWord3  Word4'), 4);
    });

    it('identifies word count compliance and under-length warnings for Task 1 (>= 150w) and Task 2 (>= 250w)', () => {
      const shortT1Text = new Array(140).fill('word').join(' ');
      const validT1Text = new Array(155).fill('word').join(' ');
      const shortT2Text = new Array(240).fill('word').join(' ');
      const validT2Text = new Array(260).fill('word').join(' ');

      const t1ShortResult = evaluateWritingRubricCriteria({
        taskKind: 'task1-academic',
        text: shortT1Text,
        criteria: { ta: 6, cc: 6, lr: 6, gra: 6 }
      });
      assert.equal(t1ShortResult.wordCount, 140);
      assert.equal(t1ShortResult.underLength, true);
      assert.ok(t1ShortResult.warnings.some(w => w.includes('150')), 'Must warn about 150-word minimum for Task 1');

      const t1ValidResult = evaluateWritingRubricCriteria({
        taskKind: 'task1-academic',
        text: validT1Text,
        criteria: { ta: 7, cc: 7, lr: 7, gra: 7 }
      });
      assert.equal(t1ValidResult.wordCount, 155);
      assert.equal(t1ValidResult.underLength, false);

      const t2ShortResult = evaluateWritingRubricCriteria({
        taskKind: 'task2-essay',
        text: shortT2Text,
        criteria: { tr: 6, cc: 6, lr: 6, gra: 6 }
      });
      assert.equal(t2ShortResult.wordCount, 240);
      assert.equal(t2ShortResult.underLength, true);
      assert.ok(t2ShortResult.warnings.some(w => w.includes('250')), 'Must warn about 250-word minimum for Task 2');

      const t2ValidResult = evaluateWritingRubricCriteria({
        taskKind: 'task2-essay',
        text: validT2Text,
        criteria: { tr: 8, cc: 8, lr: 8, gra: 8 }
      });
      assert.equal(t2ValidResult.wordCount, 260);
      assert.equal(t2ValidResult.underLength, false);
    });
  });

  describe('Academic Task 1 Visual Platform (7 Task Families)', () => {
    const visualFamilies = [
      'line-graph',
      'bar-chart',
      'pie-chart',
      'table',
      'process-diagram',
      'map-plan',
      'mixed-graphics'
    ];

    for (const family of visualFamilies) {
      it(`validates and initializes Academic Task 1 visual prompt for family: ${family}`, () => {
        const prompt = {
          id: `academic-t1-${family}-01`,
          kind: 'ielts-writing-prompt',
          track: 'academic',
          taskNumber: 1,
          visualFamily: family,
          title: `Academic Writing Task 1: ${family}`,
          instructions: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
          minWords: 150,
          recommendedMinutes: 20,
          visualData: {
            type: family,
            labels: ['2000', '2010', '2020'],
            datasets: [{ label: 'Metric A', data: [10, 25, 40] }]
          }
        };

        const validated = validateIeltsWritingPrompt(prompt);
        assert.equal(validated.valid, true);
        assert.equal(validated.value.visualFamily, family);
        assert.equal(validated.value.minWords, 150);
      });
    }
  });

  describe('General Training Task 1 Letter Platform (3 Registers & 3 Bullets)', () => {
    const registers = ['formal', 'semi-formal', 'informal'];

    for (const reg of registers) {
      it(`validates and initializes GT Task 1 letter prompt for register: ${reg}`, () => {
        const prompt = {
          id: `gt-t1-${reg}-01`,
          kind: 'ielts-writing-prompt',
          track: 'general-training',
          taskNumber: 1,
          letterRegister: reg,
          title: `GT Writing Task 1: Letter (${reg})`,
          situation: 'You recently moved into a new apartment and found several problems with the furniture provided.',
          instructions: 'Write a letter to your landlord. In your letter:\n- explain the situation\n- describe the problems\n- state what action you expect.',
          bulletPrompts: [
            'explain the situation',
            'describe the problems with the furniture',
            'state what action you want the landlord to take'
          ],
          minWords: 150,
          recommendedMinutes: 20
        };

        const validated = validateIeltsWritingPrompt(prompt);
        assert.equal(validated.valid, true);
        assert.equal(validated.value.letterRegister, reg);
        assert.equal(validated.value.bulletPrompts.length, 3);
        assert.equal(validated.value.minWords, 150);
      });
    }
  });

  describe('Task 2 Essay Platform (5 Essay Types)', () => {
    const essayTypes = [
      'agree-disagree',
      'discuss-both-views',
      'advantages-disadvantages',
      'problem-solution',
      'two-part-questions'
    ];

    for (const essayType of essayTypes) {
      it(`validates and initializes Task 2 essay prompt for type: ${essayType}`, () => {
        const prompt = {
          id: `t2-essay-${essayType}-01`,
          kind: 'ielts-writing-prompt',
          track: 'academic',
          taskNumber: 2,
          essayType,
          title: `Writing Task 2 Essay: ${essayType}`,
          statement: 'Some people believe that university education should be free for all students.',
          instructions: 'To what extent do you agree or disagree? Give reasons for your answer and include relevant examples. Write at least 250 words.',
          minWords: 250,
          recommendedMinutes: 40
        };

        const validated = validateIeltsWritingPrompt(prompt);
        assert.equal(validated.valid, true);
        assert.equal(validated.value.essayType, essayType);
        assert.equal(validated.value.minWords, 250);
      });
    }
  });

  describe('4-Dimension Rubric Scoring & Honest Practice Estimates (ADR-050)', () => {
    it('computes 4-dimension band score averages and weighted composite band (1/3 Task 1 + 2/3 Task 2)', () => {
      // Single task evaluation: average of 4 criteria rounded to nearest half-band
      const t1Rubric = { ta: 7.0, cc: 6.5, lr: 7.0, gra: 6.5 };
      const t1Result = evaluateWritingRubricCriteria({
        taskKind: 'task1-academic',
        text: new Array(160).fill('word').join(' '),
        criteria: t1Rubric
      });
      // Average = (7 + 6.5 + 7 + 6.5) / 4 = 27 / 4 = 6.75 -> rounded to 7.0
      assert.equal(t1Result.estimatedBand, 7.0);
      assert.equal(t1Result.rubricLabel, 'Estimated Band Score & Practice Feedback — Practice Reference');

      const t2Rubric = { tr: 7.5, cc: 7.0, lr: 8.0, gra: 7.5 };
      const t2Result = evaluateWritingRubricCriteria({
        taskKind: 'task2-essay',
        text: new Array(270).fill('word').join(' '),
        criteria: t2Rubric
      });
      // Average = (7.5 + 7.0 + 8.0 + 7.5) / 4 = 30 / 4 = 7.5
      assert.equal(t2Result.estimatedBand, 7.5);

      // Composite calculation: 1/3 * 7.0 + 2/3 * 7.5 = 2.333 + 5.0 = 7.333 -> rounded to 7.5
      const composite = calculateOverallWritingBand({
        task1Band: t1Result.estimatedBand,
        task2Band: t2Result.estimatedBand
      });
      assert.equal(composite.overallBand, 7.5);
      assert.equal(composite.label, 'Estimated Band Score & Practice Feedback — Practice Reference');
      assert.equal(composite.disclaimerPresent, true);
    });
  });

  describe('Writing Test Runner Orchestration & Recovery', () => {
    it('manages 60-minute test countdown, task switching, and autosave checkpoint recovery', async () => {
      const blueprint = createSyntheticWritingBlueprint({
        id: 'wrt-run-test-01',
        title: 'Full IELTS Academic Writing Test',
        track: 'academic'
      });

      const runner = new IeltsWritingRunner({
        blueprint,
        mode: IELTS_WRITING_EXAM_MODE,
        totalSeconds: 3600
      });

      assert.equal(runner.activeTaskNumber, 1);
      assert.equal(runner.remainingSeconds, 3600);

      // Update Task 1 draft
      runner.updateDraft(1, 'The line graph shows significant changes over the period...');
      assert.ok(runner.getDraft(1).length > 0);

      // Switch to Task 2
      runner.switchTask(2);
      assert.equal(runner.activeTaskNumber, 2);
      runner.updateDraft(2, 'It is often argued that technological advancements have transformed education...');
      assert.ok(runner.getDraft(2).length > 0);

      // Export checkpoint
      const checkpoint = runner.exportCheckpoint();
      assert.equal(checkpoint.schemaVersion, 'IELTS_WRITING_CHECKPOINT_V1');
      assert.equal(checkpoint.task1Draft.includes('line graph'), true);
      assert.equal(checkpoint.task2Draft.includes('technological'), true);
      assert.equal(checkpoint.activeTaskNumber, 2);

      // Simulate recovery on another runner instance
      const restoredRunner = new IeltsWritingRunner({
        blueprint,
        mode: IELTS_WRITING_EXAM_MODE
      });
      restoredRunner.restoreFromCheckpoint(checkpoint);

      assert.equal(restoredRunner.activeTaskNumber, 2);
      assert.equal(restoredRunner.getDraft(1), runner.getDraft(1));
      assert.equal(restoredRunner.getDraft(2), runner.getDraft(2));
    });

    it('enforces answer key & model essay privacy before submission (KEY_LEAK_BEFORE_SUBMIT === 0)', () => {
      const blueprint = createSyntheticWritingBlueprint({
        track: 'academic',
        task1ModelAnswer: 'CONFIDENTIAL_MODEL_ANSWER_T1',
        task2ModelAnswer: 'CONFIDENTIAL_MODEL_ANSWER_T2'
      });

      const runner = new IeltsWritingRunner({ blueprint, mode: IELTS_WRITING_EXAM_MODE });
      const publicProjection = runner.getPublicProjection();

      const serialized = JSON.stringify(publicProjection);
      assert.equal(serialized.includes('CONFIDENTIAL_MODEL_ANSWER_T1'), false);
      assert.equal(serialized.includes('CONFIDENTIAL_MODEL_ANSWER_T2'), false);
    });
  });
});
