import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderListeningRunnerDOM,
  mountListeningRunnerUI,
  createSyntheticListeningBlueprint,
  IELTS_LISTENING_EXAM_MODE,
  IELTS_LISTENING_PRACTICE_MODE
} from '../src/ielts-listening-runner.js';

describe('Stage 2 Wave W2: IELTS Listening Platform Browser / DOM Tests', () => {
  it('renders authentic 4-part 40-item layout with interactive question inputs, section tabs and timer', () => {
    const blueprint = createSyntheticListeningBlueprint({
      id: 'lis-dom-test-01',
      title: 'IELTS Listening Browser Test'
    });

    const html = renderListeningRunnerDOM({
      blueprint,
      mode: IELTS_LISTENING_EXAM_MODE,
      currentPart: 1
    });

    // Structure verification
    assert.ok(html.includes('v10-ielts-listening-runner'), 'Must include root container class');
    assert.ok(html.includes('Part 1'), 'Must include Part 1 tab');
    assert.ok(html.includes('Part 2'), 'Must include Part 2 tab');
    assert.ok(html.includes('Part 3'), 'Must include Part 3 tab');
    assert.ok(html.includes('Part 4'), 'Must include Part 4 tab');
    assert.ok(html.includes('30:00') || html.includes('data-test-timer'), 'Must include test timer display');
    assert.ok(html.includes('ielts-listening-media-container'), 'Must include real media container');

    // 40 item navigator buttons
    for (let i = 1; i <= 40; i++) {
      assert.ok(
        html.includes(`data-question-num="${i}"`),
        `Must render navigator button for Question ${i}`
      );
    }

    // Interactive question inputs must be rendered (not static placeholder text)
    assert.ok(
      html.includes('ielts-question-card') || html.includes('ielts-q-item') || html.includes('name="q-'),
      'Must render interactive question cards/inputs'
    );
  });

  it('mounts UI lifecycle into container, manages navigation, and handles submission', async () => {
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

    const blueprint = createSyntheticListeningBlueprint();
    let completedPayload = null;

    const controller = mountListeningRunnerUI(container, {
      blueprint,
      mode: IELTS_LISTENING_PRACTICE_MODE,
      onComplete: (res) => { completedPayload = res; }
    });

    assert.ok(controller.runner, 'Controller must provide access to runner');
    assert.ok(container.innerHTML.length > 100, 'UI markup must be mounted');

    // Test part navigation
    controller.navigateToPart(3);
    assert.equal(controller.runner.currentPart, 3);

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
