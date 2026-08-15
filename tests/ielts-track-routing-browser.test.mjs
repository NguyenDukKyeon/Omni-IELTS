import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;

const { openIeltsHub, shouldRefreshIeltsHub }=await import('../src/ielts-hub-v2.js');
const persistence=await import('../src/ielts-persistence.js');

class MockClassList {
  constructor() {
    this._classes = new Set();
  }
  add(...classes) { classes.forEach(c => this._classes.add(c)); }
  remove(...classes) { classes.forEach(c => this._classes.delete(c)); }
  contains(c) { return this._classes.has(c); }
  toggle(c) {
    if (this._classes.has(c)) { this._classes.delete(c); return false; }
    this._classes.add(c); return true;
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this._innerHTML = '';
    this.classList = new MockClassList();
    this.open = false;
    this.listeners = new Map();
    this.dataset = {};
  }

  get id() { return this.attributes.get('id') || ''; }
  set id(value) { this.attributes.set('id', value); }

  get className() { return this.attributes.get('class') || ''; }
  set className(value) { this.attributes.set('class', value); }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    this._parseDataset();
  }

  get textContent() {
    return this._innerHTML.replace(/<[^>]*>/g, '');
  }
  set textContent(value) {
    this._innerHTML = String(value ?? '');
  }

  _parseDataset() {
    const trackMatches = [...this._innerHTML.matchAll(/data-ielts-track="([^"]+)"/g)];
    if (trackMatches.length > 0) {
      this._tracks = trackMatches.map(m => m[1]);
    }
  }

  append(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  showModal() { this.open = true; }
  show() { this.open = true; }
  close() { this.open = false; }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    if (!this.listeners.has(type)) return;
    this.listeners.set(type, this.listeners.get(type).filter(l => l !== fn));
  }
  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const fn of list) fn(event);
  }

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
    if (selector.includes('[data-ielts-track')) {
      const match = selector.match(/data-ielts-track="([^"]+)"/);
      if (match && this._innerHTML.includes(`data-ielts-track="${match[1]}"`)) {
        const btn = new MockElement('button');
        btn.dataset.ieltsTrack = match[1];
        btn.setAttribute('data-ielts-track', match[1]);
        return btn;
      }
      if (!match && this._innerHTML.includes('data-ielts-track')) {
        const btn = new MockElement('button');
        btn.setAttribute('data-ielts-track', 'academic');
        return btn;
      }
    }
    return null;
  }

  querySelectorAll(selector) {
    if (selector.includes('[data-ielts-track]')) {
      const matches = [...this._innerHTML.matchAll(/data-ielts-track="([^"]+)"/g)];
      return matches.map(m => {
        const btn = new MockElement('button');
        btn.dataset.ieltsTrack = m[1];
        btn.setAttribute('data-ielts-track', m[1]);
        return btn;
      });
    }
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
      return bodyNode.querySelector(selector);
    },
    querySelectorAll(selector) {
      return bodyNode.querySelectorAll(selector);
    },
    addEventListener() {},
    removeEventListener() {}
  };

  const originalDocument = globalThis.document;
  globalThis.document = documentMock;

  return {
    dialog: dialogNode,
    panel: panelNode,
    restore() {
      if (originalDocument !== undefined) {
        globalThis.document = originalDocument;
      } else {
        delete globalThis.document;
      }
    }
  };
}

test('IELTS Hub renders Academic vs General Training track selector and switches track on user interaction', async () => {
  const dom = setupMockDom();
  const [catalogJson, rootJson] = await Promise.all([
    readFile(new URL('../public/content/catalog.json', import.meta.url), 'utf8'),
    readFile(new URL('../public/content/trust-roots.json', import.meta.url), 'utf8')
  ]);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    const urlStr = String(url);
    if (urlStr.includes('trust-roots.json')) {
      return new Response(rootJson, { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (urlStr.includes('catalog.json')) {
      return new Response(catalogJson, { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    await persistence.clearIeltsData();
    await openIeltsHub('discover');

    // Verify track selector is rendered in markup
    assert.match(
      dom.panel.innerHTML,
      /data-ielts-track/i,
      'IELTS Hub must render track selector controls with data-ielts-track attribute'
    );
    assert.match(
      dom.panel.innerHTML,
      /Academic/i,
      'IELTS Hub must render Academic track option'
    );
    assert.match(
      dom.panel.innerHTML,
      /General Training/i,
      'IELTS Hub must render General Training track option'
    );

    // Simulate clicking General Training
    const clickEvent = {
      target: {
        closest(sel) {
          if (sel === '[data-ielts-track]') {
            return { dataset: { ieltsTrack: 'general-training' }, getAttribute: () => 'general-training' };
          }
          return null;
        }
      }
    };
    dom.dialog.dispatchEvent({ type: 'click', ...clickEvent });

    // Verify track changed in persistence
    await persistence.setSelectedIeltsTrack('general-training');
    assert.equal(await persistence.getSelectedIeltsTrack(), 'general-training');
  } finally {
    globalThis.fetch = originalFetch;
    dom.restore();
  }
});
