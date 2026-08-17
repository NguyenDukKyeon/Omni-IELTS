import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mountIeltsFullMockLauncher,
  renderMockSessionProgress,
  renderCompositeScoreReportModal
} from '../src/ielts-mock-orchestrator.js';

describe('Stage 2 Wave W6: IELTS Full Mock Browser & UI Interaction Smoke', () => {
  it('mounts Full Mock launcher and track selector in DOM container', () => {
    // Setup synthetic DOM container
    const container = {
      innerHTML: '',
      listeners: {},
      addEventListener(event, fn) {
        this.listeners[event] = fn;
      },
      querySelector(sel) {
        if (sel === '.mock-track-select') return { value: 'academic' };
        if (sel === '.btn-start-full-mock') return { click: () => {} };
        return null;
      }
    };

    mountIeltsFullMockLauncher(container, {
      onStartMock: (config) => {
        assert.ok(config);
        assert.equal(config.track, 'academic');
      }
    });

    assert.ok(container.innerHTML.includes('ielts-full-mock-launcher'));
    assert.ok(container.innerHTML.includes('Academic Full Mock'));
    assert.ok(container.innerHTML.includes('General Training Full Mock'));
    assert.ok(container.innerHTML.includes('Section Practice'));
  });

  it('renders active mock session progression header and countdown timer indicator', () => {
    const progressHtml = renderMockSessionProgress({
      track: 'academic',
      activeSkill: 'listening',
      currentSectionIndex: 2,
      totalSections: 4,
      remainingSeconds: 1140
    });

    assert.ok(progressHtml.includes('listening'));
    assert.ok(progressHtml.includes('19:00'));
    assert.ok(progressHtml.includes('ielts-mock-stepper'));
  });

  it('renders multi-skill composite score summary modal with honest practice disclaimer', () => {
    const reportHtml = renderCompositeScoreReportModal({
      track: 'academic',
      listening: { band: 7.5, raw: 33 },
      reading: { band: 7.0, raw: 31 },
      writing: { band: 6.5, rubric: { ta: 7, cc: 6.5, lr: 6.5, gra: 6.0 } },
      speaking: { band: 7.5, rubric: { fc: 7.5, lr: 7.5, gra: 7.0, pr: 7.5 } },
      overallBand: 7.0,
      disclaimer: 'Estimated Band Score & Practice Feedback — Practice Reference'
    });

    assert.ok(reportHtml.includes('ielts-composite-score-card'));
    assert.ok(reportHtml.includes('Overall Band: 7.0'));
    assert.ok(reportHtml.includes('Listening: 7.5'));
    assert.ok(reportHtml.includes('Reading: 7.0'));
    assert.ok(reportHtml.includes('Writing: 6.5'));
    assert.ok(reportHtml.includes('Speaking: 7.5'));
    assert.ok(reportHtml.includes('Practice Reference'));
    assert.ok(!reportHtml.includes('Official Certified'));
  });
});
