import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';

globalThis.indexedDB = new IDBFactory();

// Import under test (will fail RED until Commit B satisfies)
import {
  renderListeningRunnerDOM,
  mountListeningRunnerUI,
  createSyntheticListeningBlueprint,
  IELTS_LISTENING_EXAM_MODE,
  IELTS_LISTENING_PRACTICE_MODE
} from '../src/ielts-listening-runner.js';

function createMockHost() {
  const host = {
    innerHTML: '',
    children: [],
    dataset: {},
    querySelector(selector) {
      if (selector === '.ielts-listening-header') return { textContent: 'IELTS Listening' };
      if (selector === '.ielts-listening-timer') return { textContent: '30:00' };
      if (selector === '.ielts-listening-transfer-timer') return { textContent: '10:00' };
      if (selector === '.ielts-listening-section-tabs') return { children: [{}, {}, {}, {}] };
      if (selector === '.ielts-listening-question-grid') return { children: Array.from({ length: 40 }, (_, i) => ({ dataset: { qNum: String(i + 1) } })) };
      if (selector === '.ielts-listening-submit-btn') return { disabled: false };
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.ielts-section-tab') return Array.from({ length: 4 }, (_, i) => ({ dataset: { part: String(i + 1) } }));
      if (selector === '.ielts-q-btn') return Array.from({ length: 40 }, (_, i) => ({ dataset: { qNum: String(i + 1) } }));
      return [];
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  return host;
}

test('W2-LIS-BROWSER-01: renderListeningRunnerDOM produces authentic 4-part layout and 40 question slots', () => {
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-dom-01',
    title: 'IELTS Official Practice Test Listening 1',
    track: 'academic'
  });

  const html = renderListeningRunnerDOM({
    blueprint,
    mode: IELTS_LISTENING_EXAM_MODE,
    currentPart: 1
  });

  assert.ok(html.includes('IELTS Official Practice Test Listening 1'), 'Must include test title');
  assert.ok(html.includes('data-part="1"'), 'Must include Part 1 tab');
  assert.ok(html.includes('data-part="2"'), 'Must include Part 2 tab');
  assert.ok(html.includes('data-part="3"'), 'Must include Part 3 tab');
  assert.ok(html.includes('data-part="4"'), 'Must include Part 4 tab');
  assert.ok(html.includes('ielts-listening-player'), 'Must include audio player container');
  assert.ok(html.includes('ielts-listening-timer'), 'Must include timer display');

  // Must include all 40 question navigator anchors
  for (let q = 1; q <= 40; q++) {
    assert.ok(html.includes(`data-question-num="${q}"`), `Must include question button for item ${q}`);
  }
});

test('W2-LIS-BROWSER-02: mountListeningRunnerUI binds events and manages section navigation', () => {
  const host = createMockHost();
  const blueprint = createSyntheticListeningBlueprint({
    id: 'test-lis-dom-02',
    title: 'Interactive UI Test',
    track: 'general-training'
  });

  const controller = mountListeningRunnerUI(host, {
    blueprint,
    mode: IELTS_LISTENING_PRACTICE_MODE
  });

  assert.ok(controller, 'Must return controller instance');
  assert.equal(typeof controller.navigateToPart, 'function');
  assert.equal(typeof controller.submitTest, 'function');
  assert.equal(typeof controller.destroy, 'function');

  controller.destroy();
});
