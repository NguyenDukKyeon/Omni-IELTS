import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderWritingRunnerDOM,
  mountWritingRunnerUI,
  createSyntheticWritingBlueprint,
  IELTS_WRITING_EXAM_MODE,
  IELTS_WRITING_PRACTICE_MODE
} from '../src/ielts-writing-runner.js';

describe('Stage 2 Wave W4: IELTS Productive Writing Platform Browser / DOM Tests', () => {
  it('renders authentic Writing Platform layout with prompt instructions, visual viewer, word counter, and timer', () => {
    const blueprint = createSyntheticWritingBlueprint({
      id: 'wrt-dom-test-01',
      title: 'IELTS Academic Writing DOM Test',
      track: 'academic'
    });

    const html = renderWritingRunnerDOM({
      blueprint,
      mode: IELTS_WRITING_EXAM_MODE,
      activeTaskNumber: 1
    });

    // Root container & layout
    assert.ok(html.includes('v10-ielts-writing-runner'), 'Must include root runner container class');
    assert.ok(html.includes('ielts-writing-split-pane'), 'Must include split pane layout');
    assert.ok(html.includes('ielts-writing-prompt-pane'), 'Must include prompt pane');
    assert.ok(html.includes('ielts-writing-editor-pane'), 'Must include editor pane');

    // Navigation & Tabs
    assert.ok(html.includes('Task 1') && html.includes('Task 2'), 'Must include Task 1 and Task 2 switcher tabs');
    assert.ok(html.includes('data-test-timer') || html.includes('60:00'), 'Must include 60-minute countdown timer');

    // Word counter and Text Editor
    assert.ok(html.includes('data-word-count') || html.includes('words'), 'Must render live word count indicator');
    assert.ok(html.includes('textarea') && html.includes('name="writing-draft"'), 'Must render draft textarea');
    assert.ok(html.includes('data-min-words="150"'), 'Must indicate 150-word minimum for Task 1');
  });

  it('mounts UI lifecycle into container, handles typing, task switching, and rubric evaluation view', async () => {
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

    const blueprint = createSyntheticWritingBlueprint({ track: 'academic' });
    let completedPayload = null;

    const controller = mountWritingRunnerUI(container, {
      blueprint,
      mode: IELTS_WRITING_PRACTICE_MODE,
      onComplete: (res) => { completedPayload = res; }
    });

    assert.ok(controller.runner, 'Controller must provide access to runner instance');
    assert.ok(container.innerHTML.length > 50, 'UI markup must be rendered');

    // Test task navigation
    controller.switchTask(2);
    assert.equal(controller.runner.activeTaskNumber, 2);

    // Test typing draft update
    controller.updateDraft(2, 'In recent years, the debate over renewable energy has gained significant momentum...');
    assert.ok(controller.runner.getDraft(2).length > 20);

    // Test submission
    await controller.submit();
    assert.ok(completedPayload, 'Submission must invoke onComplete callback');
    assert.ok(completedPayload.rubricFeedback, 'Must include 4-dimension rubric feedback');
    assert.equal(completedPayload.rubricFeedback.disclaimerPresent, true);
  });
});
