import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LISTENING_TASK_FAMILIES,
  READING_TASK_FAMILIES,
  WRITING_TASK_FAMILIES,
  SPEAKING_TASK_FAMILIES,
  STAGE2_COMPLETENESS_CRITERIA,
  verifyStage2CompletenessGate
} from '../scripts/stage2-gate.mjs';

describe('Stage 2 Cumulative Completeness Gate: IELTS_COMPLETENESS_V1 Verification', () => {
  describe('Task Family Completeness Matrix (100% Official Coverage)', () => {
    it('verifies 100% of all 11 official Listening task families are registered and covered', () => {
      const expectedFamilies = [
        'multiple-choice-single',
        'multiple-choice-multiple',
        'matching',
        'plan-map-diagram-labelling',
        'form-completion',
        'note-completion',
        'table-completion',
        'flow-chart-completion',
        'summary-completion',
        'sentence-completion',
        'short-answer'
      ];

      assert.equal(LISTENING_TASK_FAMILIES.length, 11);
      for (const family of expectedFamilies) {
        assert.ok(LISTENING_TASK_FAMILIES.includes(family), `Missing Listening task family: ${family}`);
      }
    });

    it('verifies 100% of all 15 official Academic & GT Reading task families are registered and covered', () => {
      const expectedFamilies = [
        'multiple-choice-single',
        'multiple-choice-multiple',
        'identifying-information-true-false-not-given',
        'identifying-writer-views-yes-no-not-given',
        'matching-information',
        'matching-headings',
        'matching-features',
        'matching-sentence-endings',
        'sentence-completion',
        'summary-completion-text',
        'summary-completion-box',
        'note-completion',
        'table-completion',
        'flow-chart-completion',
        'diagram-label-completion',
        'short-answer'
      ];

      assert.ok(READING_TASK_FAMILIES.length >= 15);
      for (const family of expectedFamilies) {
        assert.ok(READING_TASK_FAMILIES.includes(family), `Missing Reading task family: ${family}`);
      }
    });

    it('verifies Academic Task 1 (7 visuals), GT Task 1 (3 letters), and Task 2 (5 essay types) coverage', () => {
      assert.ok(WRITING_TASK_FAMILIES.academicTask1.length >= 7);
      assert.ok(WRITING_TASK_FAMILIES.gtTask1.length >= 3);
      assert.ok(WRITING_TASK_FAMILIES.task2.length >= 5);
    });

    it('verifies Speaking Parts 1, 2, and 3 coverage', () => {
      assert.ok(SPEAKING_TASK_FAMILIES.includes('part1-interview'));
      assert.ok(SPEAKING_TASK_FAMILIES.includes('part2-cue-card'));
      assert.ok(SPEAKING_TASK_FAMILIES.includes('part3-discussion'));
    });
  });

  describe('18 Dimensions of IELTS_COMPLETENESS_V1 Gate Runner', () => {
    it('defines the 18 machine-checkable criteria for Stage 2 exit', () => {
      assert.equal(STAGE2_COMPLETENESS_CRITERIA.length, 18);
      const ids = STAGE2_COMPLETENESS_CRITERIA.map(c => c.id);

      assert.ok(ids.includes('TRACK_ROUTING'));
      assert.ok(ids.includes('LISTENING_11_FAMILIES'));
      assert.ok(ids.includes('READING_AC_15_FAMILIES'));
      assert.ok(ids.includes('READING_GT_15_FAMILIES'));
      assert.ok(ids.includes('WRITING_AC_TASK1_VISUALS'));
      assert.ok(ids.includes('WRITING_GT_TASK1_LETTERS'));
      assert.ok(ids.includes('WRITING_TASK2_ESSAYS'));
      assert.ok(ids.includes('SPEAKING_3_PARTS'));
      assert.ok(ids.includes('PRACTICE_HIERARCHY'));
      assert.ok(ids.includes('OBJECTIVE_DETERMINISTIC_SCORING'));
      assert.ok(ids.includes('PRODUCTIVE_RUBRIC_EVALUATION'));
      assert.ok(ids.includes('SESSION_INTERRUPTION_RECOVERY'));
      assert.ok(ids.includes('ERROR_NOTEBOOK_INTEGRATION'));
      assert.ok(ids.includes('SCHEDULE_ISOLATION'));
      assert.ok(ids.includes('PRIVACY_ZERO_KEY_LEAK'));
      assert.ok(ids.includes('DURABLE_BACKUP_COVERAGE'));
      assert.ok(ids.includes('PROVENANCE_AND_RIGHTS'));
      assert.ok(ids.includes('HUB_UI_LAUNCHERS'));
    });

    it('runs verifyStage2CompletenessGate and asserts complete Stage 2 exit readiness', async () => {
      const result = await verifyStage2CompletenessGate();
      assert.equal(result.passed, true, `Stage 2 Completeness Gate failed: ${JSON.stringify(result.failedChecks)}`);
      assert.equal(result.totalChecks, 18);
      assert.equal(result.passedChecks, 18);
      assert.equal(result.failedChecks.length, 0);
    });
  });
});
