import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderReadingRunnerDOM,
  mountReadingRunnerUI,
  createSyntheticReadingBlueprint,
  IELTS_READING_EXAM_MODE,
  IELTS_READING_PRACTICE_MODE
} from '../src/ielts-reading-runner.js';

describe('Stage 2 Wave W3: IELTS Reading Platform Browser / DOM Tests', () => {
  it('renders authentic split-pane layout with passage text, question inputs, navigation matrix, and 60-min timer', () => {
    const blueprint = createSyntheticReadingBlueprint({
      id: 'rdg-dom-test-01',
      title: 'IELTS Academic Reading Browser Test',
      track: 'academic'
    });

    const html = renderReadingRunnerDOM({
      blueprint,
      mode: IELTS_READING_EXAM_MODE,
      currentPassage: 1
    });

    // Structure verification
    assert.ok(html.includes('v10-ielts-reading-runner'), 'Must include root container class');
    assert.ok(html.includes('ielts-reading-split-pane'), 'Must include split-pane layout container');
    assert.ok(html.includes('ielts-reading-passage-pane'), 'Must include passage pane');
    assert.ok(html.includes('ielts-reading-questions-pane'), 'Must include questions pane');
    assert.ok(html.includes('Passage 1') || html.includes('Section 1'), 'Must include Passage 1 tab');
    assert.ok(html.includes('Passage 2') || html.includes('Section 2'), 'Must include Passage 2 tab');
    assert.ok(html.includes('Passage 3') || html.includes('Section 3'), 'Must include Passage 3 tab');
    assert.ok(html.includes('60:00') || html.includes('data-test-timer'), 'Must include 60-minute test timer display');

    // 40 item navigator buttons
    for (let i = 1; i <= 40; i++) {
      assert.ok(
        html.includes(`data-question-num="${i}"`),
        `Must render navigator button for Question ${i}`
      );
    }

    // Interactive question inputs must be rendered
    assert.ok(
      html.includes('ielts-question-card') || html.includes('ielts-q-item') || html.includes('name="q-'),
      'Must render interactive question cards/inputs'
    );
  });

  it('mounts UI lifecycle into container, handles passage switching and submission', async () => {
    const container = {
      innerHTML: '',
      events: {},
      addEventListener(evt, handler) { this.events[evt] = handler; },
      querySelector(selector) {
        if (selector.includes('submit')) {
          return { click: () => this.events['submit']?.({ preventDefault: () => {} }) };
        }
        return null;
      },
      querySelectorAll() { return []; }
    };

    const blueprint = createSyntheticReadingBlueprint({ track: 'academic' });
    let completedPayload = null;

    const controller = mountReadingRunnerUI(container, {
      blueprint,
      mode: IELTS_READING_PRACTICE_MODE,
      onComplete: (res) => { completedPayload = res; }
    });

    assert.ok(controller.runner, 'Controller must provide access to runner');
    assert.ok(container.innerHTML.length > 100, 'UI markup must be mounted');

    // Test passage navigation
    controller.navigateToPassage(2);
    assert.equal(controller.runner.currentPassage, 2);

    // Test submission
    const result = await controller.submitTest({});
    assert.ok(result.id || result.testRunId, 'Submission must return run record');
    assert.equal(typeof result.rawScore, 'number');
    assert.equal(completedPayload, result);

    // Cleanup
    controller.destroy();
    assert.equal(container.innerHTML, '');
  });
});
