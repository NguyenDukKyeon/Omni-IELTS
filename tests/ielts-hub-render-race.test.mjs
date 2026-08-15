import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import 'fake-indexeddb/auto';
import { openIeltsHub } from '../src/ielts-hub-v2.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this._innerHTML = '';
    this.open = false;
    this.classList = {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => false
    };
  }

  get id() { return this.attributes.get('id') || ''; }
  set id(value) { this.attributes.set('id', value); }

  get className() { return this.attributes.get('class') || ''; }
  set className(value) { this.attributes.set('class', value); }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._innerHTML.replace(/<[^>]*>/g, '');
  }
  set textContent(value) {
    this._innerHTML = String(value ?? '');
    this.children = [];
  }

  append(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  showModal() { this.open = true; }
  show() { this.open = true; }
  close() { this.open = false; }

  addEventListener() {}
  removeEventListener() {}
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  removeAttribute(k) { this.attributes.delete(k); }
  getAttribute(k) { return this.attributes.get(k) ?? null; }

  querySelector(selector) {
    if (selector === '#v10IeltsHubPanel') {
      if (this.id === 'v10IeltsHubPanel') return this;
      return this.children.find(c => c.id === 'v10IeltsHubPanel') || null;
    }
    if (selector === '#v10IeltsHubDialog') {
      if (this.id === 'v10IeltsHubDialog') return this;
      return this.children.find(c => c.id === 'v10IeltsHubDialog') || null;
    }
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

function setupMockDom() {
  const dialogNode = new MockElement('dialog');
  dialogNode.id = 'v10IeltsHubDialog';
  dialogNode.className = 'v10-ielts-dialog';

  const panelNode = new MockElement('div');
  panelNode.id = 'v10IeltsHubPanel';
  dialogNode.append(panelNode);

  const bodyNode = new MockElement('body');
  bodyNode.append(dialogNode);

  const documentMock = {
    body: bodyNode,
    createElement(tag) {
      return new MockElement(tag);
    },
    querySelector(selector) {
      if (selector === '#v10IeltsHubDialog') return dialogNode;
      if (selector === '#v10IeltsHubPanel') return panelNode;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {}
  };

  const originalDocument = globalThis.document;
  globalThis.document = documentMock;

  const originalLocksDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'locks');
  Object.defineProperty(globalThis.navigator, 'locks', {
    value: {
      request: async (name, options, callback) => {
        const task = typeof options === 'function' ? options : callback;
        return task();
      }
    },
    configurable: true,
    writable: true
  });

  return {
    dialog: dialogNode,
    panel: panelNode,
    restore() {
      if (originalDocument !== undefined) {
        globalThis.document = originalDocument;
      } else {
        delete globalThis.document;
      }
      if (originalLocksDescriptor) {
        Object.defineProperty(globalThis.navigator, 'locks', originalLocksDescriptor);
      } else {
        delete globalThis.navigator.locks;
      }
    }
  };
}

test('stale async discover render must not overwrite a newer active videos tab render', async () => {
  const dom = setupMockDom();
  const [catalogJson, rootJson] = await Promise.all([
    readFile(new URL('../public/content/catalog.json', import.meta.url), 'utf8'),
    readFile(new URL('../public/content/trust-roots.json', import.meta.url), 'utf8')
  ]);

  const originalFetch = globalThis.fetch;

  let releaseDiscover;
  let discoverSuspended = false;
  const discoverGate = new Promise(resolve => {
    releaseDiscover = resolve;
  });

  globalThis.fetch = async url => {
    const urlStr = String(url);
    if (urlStr.includes('trust-roots.json')) {
      discoverSuspended = true;
      await discoverGate;
      return new Response(rootJson, {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (urlStr.includes('catalog.json')) {
      return new Response(catalogJson, {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (urlStr.includes('/api/transcript/capabilities')) {
      return new Response(JSON.stringify({
        caption: { available: true },
        local: { available: false, modelInstalled: false },
        cloud: { available: false, configured: false }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    // 1. Initiate initial discover render (which suspends on trust-roots.json fetch)
    const discoverPromise = openIeltsHub('discover');

    // Wait until discover render has commenced and suspended on trust-roots.json
    for (let i = 0; i < 50 && !discoverSuspended; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.equal(discoverSuspended, true, 'Discover render should have suspended on trust-roots fetch');

    // 2. User activates the "videos" tab while discover render is still suspended
    const videosPromise = openIeltsHub('videos');
    await videosPromise;

    // Verify videos tab markup is currently rendered in the panel
    assert.match(
      dom.panel.innerHTML,
      /PASTE URL → LEARN|Dán YouTube URL/i,
      'Videos tab markup should be rendered in panel upon videos tab resolution.'
    );

    // 3. Now release the suspended discover render
    releaseDiscover();
    await discoverPromise;

    // 4. REGRESSION ASSERTION: Stale discover markup MUST NOT overwrite the active videos tab
    assert.match(
      dom.panel.innerHTML,
      /PASTE URL → LEARN|Dán YouTube URL/i,
      'Active tab markup for "videos" was overwritten by stale "discover" render!'
    );
    assert.doesNotMatch(
      dom.panel.innerHTML,
      /SIGNED REMOTE CONTENT/i,
      'Stale "discover" markup was committed to panel after "videos" was activated!'
    );
  } finally {
    globalThis.fetch = originalFetch;
    dom.restore();
  }
});

test('rapid sequential tab switches only commit the latest active tab render', async () => {
  const dom = setupMockDom();
  const originalFetch = globalThis.fetch;

  let releaseFirst;
  let firstSuspended = false;
  const firstGate = new Promise(resolve => {
    releaseFirst = resolve;
  });

  globalThis.fetch = async url => {
    const urlStr = String(url);
    if (urlStr.includes('trust-roots.json')) {
      firstSuspended = true;
      await firstGate;
      return new Response('{}', { status: 500 });
    }
    if (urlStr.includes('/api/transcript/capabilities')) {
      return new Response(JSON.stringify({
        caption: { available: true },
        local: { available: false, modelInstalled: false },
        cloud: { available: false, configured: false }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const p1 = openIeltsHub('discover');
    for (let i = 0; i < 50 && !firstSuspended; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.equal(firstSuspended, true);

    const p2 = openIeltsHub('skills');
    await p2;

    assert.match(
      dom.panel.innerHTML,
      /ERROR-DRIVEN LEARNING|Error Notebook/i,
      'Skills tab markup should be rendered.'
    );

    releaseFirst();
    await p1;

    // Must still show skills tab, not discover error
    assert.match(
      dom.panel.innerHTML,
      /ERROR-DRIVEN LEARNING|Error Notebook/i,
      'Stale discover error should not overwrite active skills tab.'
    );
  } finally {
    globalThis.fetch = originalFetch;
    dom.restore();
  }
});
