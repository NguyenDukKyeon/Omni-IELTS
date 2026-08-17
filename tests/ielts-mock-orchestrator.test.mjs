import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IeltsMockOrchestrator,
  createSyntheticFullMockBlueprint,
  IELTS_MOCK_CHECKPOINT_SCHEMA,
  IELTS_PRACTICE_TIER,
  IELTS_MOCK_STATE,
  calculateCompositeIeltsBand,
  IELTS_MOCK_DISCLAIMER
} from '../src/ielts-mock-orchestrator.js';
import {
  calculateOverallSpeakingBand,
  calculateOverallWritingBand,
  rawScoreToIeltsBand
} from '../src/ielts-domain.js';

describe('Stage 2 Wave W6: Section Practice, Full Mock Orchestration & Stage 2 Exit Verification (W6-IELTS-MOCK-001)', () => {
  describe('Full Mock Blueprint & Practice Hierarchy Contracts', () => {
    it('creates a complete Academic Full Mock Blueprint containing Listening, Reading, Writing, and Speaking configurations', () => {
      const blueprint = createSyntheticFullMockBlueprint({
        track: 'academic',
        id: 'mock-ac-test-01',
        title: 'IELTS Academic Full Mock Exam 01'
      });

      assert.equal(blueprint.kind, 'ielts-mock-blueprint');
      assert.equal(blueprint.schemaVersion, 1);
      assert.equal(blueprint.track, 'academic');
      assert.ok(blueprint.listening, 'Must contain Listening section');
      assert.ok(blueprint.reading, 'Must contain Reading section');
      assert.ok(blueprint.writing, 'Must contain Writing section');
      assert.ok(blueprint.speaking, 'Must contain Speaking section');

      // Listening
      assert.equal(blueprint.listening.parts.length, 4);
      assert.equal(blueprint.listening.totalQuestions, 40);

      // Academic Reading
      assert.equal(blueprint.reading.passages.length, 3);
      assert.equal(blueprint.reading.totalQuestions, 40);

      // Academic Writing
      assert.ok(blueprint.writing.task1, 'Academic writing must have Task 1');
      assert.ok(blueprint.writing.task2, 'Academic writing must have Task 2');
      assert.equal(blueprint.writing.task1.visualType, 'bar-chart');

      // Speaking
      assert.ok(blueprint.speaking.part1, 'Speaking must have Part 1');
      assert.ok(blueprint.speaking.part2, 'Speaking must have Part 2');
      assert.ok(blueprint.speaking.part3, 'Speaking must have Part 3');
    });

    it('creates a complete General Training Full Mock Blueprint with GT Reading and GT Letter Writing', () => {
      const blueprint = createSyntheticFullMockBlueprint({
        track: 'general-training',
        id: 'mock-gt-test-01',
        title: 'IELTS General Training Full Mock Exam 01'
      });

      assert.equal(blueprint.kind, 'ielts-mock-blueprint');
      assert.equal(blueprint.schemaVersion, 1);
      assert.equal(blueprint.track, 'general-training');

      // GT Reading (3 sections)
      assert.equal(blueprint.reading.passages.length, 3);
      assert.equal(blueprint.reading.totalQuestions, 40);

      // GT Writing (Letter Task 1 + Essay Task 2)
      assert.equal(blueprint.writing.task1.register, 'formal');
      assert.ok(Array.isArray(blueprint.writing.task1.bulletPrompts) && blueprint.writing.task1.bulletPrompts.length === 3);
    });

    it('defines the 4-tier IELTS practice hierarchy', () => {
      assert.equal(IELTS_PRACTICE_TIER.TASK_FAMILY, 'task-family');
      assert.equal(IELTS_PRACTICE_TIER.SECTION, 'section');
      assert.equal(IELTS_PRACTICE_TIER.SKILL_TEST, 'skill-test');
      assert.equal(IELTS_PRACTICE_TIER.FULL_MOCK, 'full-mock');
    });
  });

  describe('Full Mock Orchestrator State Machine', () => {
    it('initializes in INITIALIZED state and transitions sequentially through Listening -> Reading -> Writing -> Speaking -> COMPLETED', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const orchestrator = new IeltsMockOrchestrator({ blueprint });

      assert.equal(orchestrator.state, IELTS_MOCK_STATE.INITIALIZED);
      assert.equal(orchestrator.activeSkill, null);

      // Start test
      orchestrator.start();
      assert.equal(orchestrator.state, IELTS_MOCK_STATE.IN_PROGRESS);
      assert.equal(orchestrator.activeSkill, 'listening');

      // Complete Listening -> Reading
      orchestrator.completeActiveSkillSection({
        rawScore: 36,
        totalQuestions: 40,
        responses: { 1: 'A', 2: 'B' }
      });
      assert.equal(orchestrator.activeSkill, 'reading');

      // Complete Reading -> Writing
      orchestrator.completeActiveSkillSection({
        rawScore: 34,
        totalQuestions: 40,
        responses: { 1: 'TRUE', 2: 'FALSE' }
      });
      assert.equal(orchestrator.activeSkill, 'writing');

      // Complete Writing -> Speaking
      orchestrator.completeActiveSkillSection({
        task1WordCount: 165,
        task2WordCount: 280,
        rubricScores: { ta: 7.0, cc: 7.0, lr: 7.0, gra: 7.0 }
      });
      assert.equal(orchestrator.activeSkill, 'speaking');

      // Complete Speaking -> COMPLETED
      orchestrator.completeActiveSkillSection({
        rubricScores: { fc: 7.5, lr: 7.0, gra: 7.5, pr: 7.0 }
      });
      assert.equal(orchestrator.state, IELTS_MOCK_STATE.COMPLETED);
      assert.equal(orchestrator.activeSkill, null);
    });

    it('orchestrates Section Practice mode for an individual skill or section', () => {
      const orchestrator = new IeltsMockOrchestrator({
        tier: IELTS_PRACTICE_TIER.SECTION,
        track: 'academic',
        targetSkill: 'reading',
        targetSectionIndex: 1
      });

      orchestrator.start();
      assert.equal(orchestrator.activeSkill, 'reading');
      assert.equal(orchestrator.isSectionPractice, true);

      orchestrator.completeActiveSkillSection({ rawScore: 12, totalQuestions: 13 });
      assert.equal(orchestrator.state, IELTS_MOCK_STATE.COMPLETED);
    });
  });

  describe('Composite Score Calculation & Honest Reporting', () => {
    it('calculates the overall composite IELTS band score with exact official half-band rounding', () => {
      // 7.0, 7.0, 7.0, 7.0 -> 7.0
      assert.equal(calculateCompositeIeltsBand({ listening: 7.0, reading: 7.0, writing: 7.0, speaking: 7.0 }), 7.0);

      // Average 6.625 -> fractional .625 >= .25 and < .75 -> 6.5
      assert.equal(calculateCompositeIeltsBand({ listening: 6.5, reading: 6.5, writing: 6.5, speaking: 7.0 }), 6.5);

      // Average 6.75 -> fractional .75 >= .75 -> 7.0
      assert.equal(calculateCompositeIeltsBand({ listening: 6.5, reading: 7.0, writing: 6.5, speaking: 7.0 }), 7.0);

      // Average 6.125 -> fractional .125 < .25 -> 6.0
      assert.equal(calculateCompositeIeltsBand({ listening: 6.0, reading: 6.0, writing: 6.0, speaking: 6.5 }), 6.0);

      // Average 6.25 -> fractional .25 >= .25 -> 6.5
      assert.equal(calculateCompositeIeltsBand({ listening: 6.0, reading: 6.0, writing: 6.5, speaking: 6.5 }), 6.5);

      // Average 6.875 -> fractional .875 >= .75 -> 7.0
      assert.equal(calculateCompositeIeltsBand({ listening: 7.0, reading: 7.0, writing: 7.0, speaking: 6.5 }), 7.0);
    });

    it('generates a full multi-skill score report with honest practice disclaimer and zero certified claims', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const orchestrator = new IeltsMockOrchestrator({ blueprint });
      orchestrator.start();

      orchestrator.completeActiveSkillSection({ rawScore: 35, totalQuestions: 40 }); // Listening 35/40 -> Band 8.0
      orchestrator.completeActiveSkillSection({ rawScore: 30, totalQuestions: 40 }); // Reading 30/40 -> Band 7.0
      orchestrator.completeActiveSkillSection({
        task1Score: 6.5,
        task2Score: 7.0,
        rubricScores: { ta: 7.0, cc: 6.5, lr: 7.0, gra: 6.5 }
      }); // Writing ~7.0
      orchestrator.completeActiveSkillSection({
        rubricScores: { fc: 7.5, lr: 7.0, gra: 7.0, pr: 7.5 }
      }); // Speaking ~7.5

      const report = orchestrator.getScoreReport();
      assert.ok(report, 'Report must be generated');
      assert.equal(report.track, 'academic');
      assert.ok(report.listening.band >= 7.5);
      assert.ok(report.reading.band >= 6.5);
      assert.ok(report.writing.band >= 6.5);
      assert.ok(report.speaking.band >= 7.0);
      assert.ok(report.overallBand >= 7.0);

      // Scoring honesty
      assert.equal(report.disclaimer, IELTS_MOCK_DISCLAIMER);
      assert.ok(report.disclaimer.includes('Practice Reference'));
      assert.ok(!report.disclaimer.includes('Certified Official'));
    });
  });

  describe('Session Checkpoint & Interruption Recovery (S15-F005)', () => {
    it('creates and serializes valid mock checkpoint schema v1', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const orchestrator = new IeltsMockOrchestrator({ blueprint });
      orchestrator.start();
      orchestrator.recordSectionProgress('listening', { 1: 'A', 2: 'C' }, 1200);

      const checkpoint = orchestrator.exportCheckpoint();
      assert.equal(checkpoint.schema, IELTS_MOCK_CHECKPOINT_SCHEMA);
      assert.equal(checkpoint.track, 'academic');
      assert.equal(checkpoint.activeSkill, 'listening');
      assert.equal(checkpoint.remainingSeconds, 1200);
      assert.deepEqual(checkpoint.skillProgress.listening.responses, { 1: 'A', 2: 'C' });
    });

    it('restores mock test state from checkpoint upon browser refresh without losing answered questions', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const original = new IeltsMockOrchestrator({ blueprint });
      original.start();
      original.completeActiveSkillSection({ rawScore: 32, totalQuestions: 40 }); // Completed listening
      original.recordSectionProgress('reading', { 1: 'TRUE', 2: 'FALSE' }, 2400);

      const checkpoint = original.exportCheckpoint();

      // Hydrate into new orchestrator instance
      const restored = IeltsMockOrchestrator.restoreFromCheckpoint(blueprint, checkpoint);
      assert.equal(restored.state, IELTS_MOCK_STATE.IN_PROGRESS);
      assert.equal(restored.activeSkill, 'reading');
      assert.equal(restored.remainingSeconds, 2400);
      assert.ok(restored.completedSkills.listening, 'Listening must remain completed');
      assert.deepEqual(restored.currentSectionResponses, { 1: 'TRUE', 2: 'FALSE' });
    });
  });

  describe('Schedule Isolation & Privacy Invariants', () => {
    it('maintains affectsSchedule: false and evidenceEligible: false across all mock activities', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const orchestrator = new IeltsMockOrchestrator({ blueprint });
      orchestrator.start();
      orchestrator.completeActiveSkillSection({ rawScore: 40, totalQuestions: 40 });
      orchestrator.completeActiveSkillSection({ rawScore: 40, totalQuestions: 40 });
      orchestrator.completeActiveSkillSection({ rubricScores: { ta: 9, cc: 9, lr: 9, gra: 9 } });
      orchestrator.completeActiveSkillSection({ rubricScores: { fc: 9, lr: 9, gra: 9, pr: 9 } });

      const attemptRecords = orchestrator.getAttemptRecords();
      for (const attempt of attemptRecords) {
        assert.equal(attempt.affectsSchedule, false);
        assert.equal(attempt.evidenceEligible, false);
      }
    });

    it('preserves KEY_LEAK_BEFORE_SUBMIT === 0 invariant across public projections', () => {
      const blueprint = createSyntheticFullMockBlueprint({ track: 'academic' });
      const orchestrator = new IeltsMockOrchestrator({ blueprint });
      orchestrator.start();

      const publicProjection = orchestrator.getPublicItemProjection();
      const stringified = JSON.stringify(publicProjection);

      assert.ok(!stringified.includes('correctAnswer'), 'Must not leak correct answers');
      assert.ok(!stringified.includes('modelAnswer'), 'Must not leak model essay');
      assert.ok(!stringified.includes('sampleAudioUrl'), 'Must not leak sample speaking recording');
    });
  });
});
