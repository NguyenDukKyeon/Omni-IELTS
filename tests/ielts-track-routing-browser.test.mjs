import test from 'node:test';
import assert from 'node:assert/strict';
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
    this.listeners = new Map();
    this.classList = {
      _classes: new Set(),
      add: cls => this.classList._classes.add(cls),
      remove: cls => this.classList._classes.delete(cls),
      contains: cls => this.classList._classes.has(cls),
      toggle: cls => {
        if (this.classList._classes.has(cls)) {
          this.classList._classes.delete(cls);
          return false;
        }
        this.classList._classes.add(cls);
        return true;
      }
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

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.set(event, this.listeners.get(event).filter(cb => cb !== callback));
    }
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const cb of list) cb.call(this, event);
    return true;
  }

  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  removeAttribute(k) { this.attributes.delete(k); }
  getAttribute(k) { return this.attributes.get(k) ?? null; }
  hasAttribute(k) { return this.attributes.has(k); }

  querySelector(selector) {
    if (selector === '#v10IeltsHubPanel') {
      if (this.id === 'v10IeltsHubPanel') return this;
      return this.children.find(c => c.id === 'v10IeltsHubPanel') || null;
    }
    if (selector === '#v10IeltsHubDialog') {
      if (this.id === 'v10IeltsHubDialog') return this;
      return this.children.find(c => c.id === 'v10IeltsHubDialog') || null;
    }
    if (selector.startsWith('[data-ielts-track=')) {
      const match = selector.match(/\[data-ielts-track="?([^"\]]+)"?\]/);
      if (match) {
        const val = match[1];
        if (this.getAttribute('data-ielts-track') === val) return this;
        for (const child of this.children) {
          const found = child.querySelector(selector);
          if (found) return found;
        }
      }
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    if (selector.startsWith('[data-ielts-track]')) {
      if (this.hasAttribute('data-ielts-track')) results.push(this);
      for (const child of this.children) {
        results.push(...child.querySelectorAll(selector));
      }
    }
    return results;
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
      return panelNode.querySelector(selector);
    },
    querySelectorAll(selector) {
      return panelNode.querySelectorAll(selector);
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

test('IELTS Hub renders Academic and General Training track switcher in UI', async () => {
  const dom = setupMockDom();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });

  try {
    await openIeltsHub('discover');

    // UI must render track switcher controls
    assert.match(
      dom.panel.innerHTML,
      /data-ielts-track="academic"/i,
      'IELTS Hub must render Academic track switcher option.'
    );
    assert.match(
      dom.panel.innerHTML,
      /data-ielts-track="general-training"/i,
      'IELTS Hub must render General Training track switcher option.'
    );
  } finally {
    globalThis.fetch = originalFetch;
    dom.restore();
  }
});
