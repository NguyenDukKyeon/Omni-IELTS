import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderSpeakingRunnerDOM,
  mountSpeakingRunnerUI,
  createSyntheticSpeakingBlueprint,
  IELTS_SPEAKING_EXAM_MODE,
  IELTS_SPEAKING_PRACTICE_MODE
} from '../src/ielts-speaking-runner.js';

describe('Stage 2 Wave W5: IELTS Interactive Speaking Platform Browser / DOM Tests', () => {
  it('renders authentic Speaking Platform layout with Part navigation, cue card container, prep timer, scratch notes, and audio controls', () => {
    const blueprint = createSyntheticSpeakingBlueprint({
      id: 'spk-dom-test-01',
      title: 'IELTS Academic Speaking DOM Test'
    });

    const html = renderSpeakingRunnerDOM({
      blueprint,
      mode: IELTS_SPEAKING_EXAM_MODE,
      activePart: 2,
      state: 'part2-prep'
    });

    // Root container & layout
    assert.ok(html.includes('v10-ielts-speaking-runner'), 'Must include root runner container class');
    assert.ok(html.includes('ielts-speaking-stage-pane'), 'Must include speaking stage pane');
    assert.ok(html.includes('ielts-speaking-control-pane'), 'Must include control pane');

    // Part switcher & Stage indicators
    assert.ok(html.includes('Part 1') && html.includes('Part 2') && html.includes('Part 3'), 'Must render Part 1, 2, and 3 indicators');

    // Part 2 cue card & timers
    assert.ok(html.includes('ielts-speaking-cue-card') || html.includes('cue-card'), 'Must render cue card container');
    assert.ok(html.includes('data-prep-timer') || html.includes('01:00') || html.includes('60'), 'Must render 1-minute prep countdown');
    assert.ok(html.includes('textarea') && html.includes('name="scratch-notes"'), 'Must render scratch notes textarea');

    // Audio recording controls
    assert.ok(html.includes('data-action="record"') || html.includes('data-record-btn') || html.includes('Record'), 'Must render audio record button');
    assert.ok(html.includes('data-action="play"') || html.includes('data-play-btn') || html.includes('Play'), 'Must render audio playback button');
  });

  it('mounts UI lifecycle into container, handles state advancement, scratch notes input, recording simulation, and rubric feedback review', async () => {
    const container = {
      innerHTML: '',
      events: {},
      addEventListener(evt, handler) { this.events[evt] = handler; },
      querySelector(selector) {
        if (selector.includes('finish') || selector.includes('submit')) {
          return { click: () => this.events['click']?.({ target: { dataset: { action: 'submit' } } }) };
        }
        return null;
      },
      querySelectorAll() { return []; }
    };

    const blueprint = createSyntheticSpeakingBlueprint();
    let completedPayload = null;

    const controller = mountSpeakingRunnerUI(container, {
      blueprint,
      mode: IELTS_SPEAKING_PRACTICE_MODE,
      onComplete: (res) => { completedPayload = res; }
    });

    assert.ok(controller.runner, 'Controller must provide access to runner instance');
    assert.ok(container.innerHTML.length > 50, 'UI markup must be rendered');

    // Advance to Part 2 prep
    controller.advancePart();
    assert.equal(controller.runner.activePart, 2);
    assert.equal(controller.runner.state, 'part2-prep');

    // Update scratch notes
    controller.updateScratchNotes('My memorable trip notes: beautiful mountain trails');
    assert.equal(controller.runner.scratchNotes, 'My memorable trip notes: beautiful mountain trails');

    // Start Part 2 speaking & record audio
    controller.startPart2Speaking();
    assert.equal(controller.runner.state, 'part2-speak');
    controller.recordAudioSegment(2, null, { duration: 95.0, blobUrl: 'blob:test-part2' });
    assert.ok(controller.runner.getAudioSegmentForPart2());

    // Advance to Part 3
    controller.finishPart2Speaking();
    controller.advancePart();
    assert.equal(controller.runner.activePart, 3);

    // Complete speaking simulation
    await controller.submit();
    assert.ok(completedPayload, 'Submission must invoke onComplete callback');
    assert.ok(completedPayload.rubricFeedback, 'Must include 4-dimension rubric feedback');
    assert.equal(completedPayload.rubricFeedback.disclaimerPresent, true);
  });
});
