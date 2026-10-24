import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createAttempt } from '../public/assets/js/exam.js';

const exam = JSON.parse(readFileSync(new URL('../public/data/simulacros/simulacro-1.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../public/simulacro-1.html', import.meta.url), 'utf8');
const storageKey = 'progra3:simulacro-1:intento:v1';
class Node {
  constructor(tag = '', text = '') {
    this.tag = tag; this.text = text; this.children = []; this.attributes = {}; this.listeners = {};
    this.hidden = true;
  }
  get id() { return this.attributes.id; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...nodes) { this.children.push(...nodes.map((node) => typeof node === 'string' ? new Node('', node) : node)); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  get textContent() { return this.text + this.children.map((node) => node.textContent).join(''); }
  set textContent(value) { this.text = value; this.children = []; }
  focus() { this.focused = true; }
  scrollIntoView() {}
}
function descendants(nodes) { return nodes.flatMap((node) => [node, ...descendants(node.children)]); }

test('la pantalla entrega al vencer, conserva resultados y permite reiniciar sin tiempo heredado', async () => {
  const originalNow = Date.now;
  const originalInterval = globalThis.setInterval;
  const originalClear = globalThis.clearInterval;
  let now = 1_000_000;
  let interval;
  const documentEvents = {};
  const windowEvents = {};
  const memory = new Map();
  const nodes = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => [id, new Node()]));
  globalThis.document = {
    createElement: (tag) => new Node(tag),
    createTextNode: (text) => new Node('', text),
    querySelector: (selector) => nodes[selector.slice(1)] ?? descendants(Object.values(nodes)).find((node) => node.id === selector.slice(1)),
    addEventListener: (name, callback) => { documentEvents[name] = callback; },
  };
  globalThis.window = { addEventListener: (name, callback) => { windowEvents[name] = callback; } };
  globalThis.sessionStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  };
  globalThis.fetch = async () => ({ ok: true, json: async () => structuredClone(exam) });
  Date.now = () => now;
  globalThis.setInterval = (callback) => { interval = callback; return 1; };
  globalThis.clearInterval = () => { interval = null; };
  try {
    await import('../public/assets/js/exam-page.js?expiry');
    await new Promise(setImmediate);
    assert.equal(nodes['exam-setup'].hidden, false);
    nodes['start-exam'].listeners.click();
    assert.equal(nodes['exam-timer'].textContent, '90:00');
    const active = JSON.parse(memory.get(storageKey));
    const options = descendants(nodes['exam-question'].children).filter((node) => node.tag === 'input');
    options[0].listeners.change();
    assert.equal(Object.keys(JSON.parse(memory.get(storageKey)).answers).length, 1);
    assert.equal(nodes['exam-results'].hidden, true);
    assert.equal(nodes['exam-review'].children.length, 0);
    nodes['exam-form'].listeners.submit({ preventDefault() {} });
    assert.equal(nodes['submit-confirmation'].hidden, false);
    documentEvents.keydown({ key: 'Escape', preventDefault() {} });
    assert.equal(nodes['submit-confirmation'].hidden, true);
    assert.equal(JSON.parse(memory.get(storageKey)).deadline, active.deadline);

    now = active.deadline + 1000;
    documentEvents.visibilitychange();
    const finished = JSON.parse(memory.get(storageKey));
    assert.equal(finished.status, 'finished');
    assert.equal(finished.reason, 'expired');
    assert.equal(nodes['exam-running'].hidden, true);
    assert.equal(nodes['exam-results'].hidden, false);
    assert.match(nodes['exam-result-time'].textContent, /entrega automática/);
    assert.match(nodes['exam-result-time'].textContent, /90:00/);
    assert.equal(interval, null);
    const finalScore = nodes['exam-score'].textContent;
    nodes['confirm-submit'].listeners.click();
    assert.equal(nodes['exam-score'].textContent, finalScore);

    await import('../public/assets/js/exam-page.js?finished-reload');
    await new Promise(setImmediate);
    assert.equal(nodes['exam-score'].textContent, finalScore);
    assert.equal(nodes['exam-running'].hidden, true);
    nodes['retry-exam'].listeners.click();
    assert.equal(memory.has(storageKey), false);
    nodes['start-exam'].listeners.click();
    const retry = JSON.parse(memory.get(storageKey));
    assert.equal(retry.deadline - now, 5400000);
    assert.deepEqual(retry.answers, {});

    // Una pestaña que se recarga después de vencer entrega antes de mostrar preguntas.
    memory.set(storageKey, JSON.stringify(createAttempt(exam, 1_000_000)));
    await import('../public/assets/js/exam-page.js?expired-reload');
    await new Promise(setImmediate);
    assert.equal(JSON.parse(memory.get(storageKey)).status, 'finished');
    assert.equal(nodes['exam-running'].hidden, true);

    // El intento funciona sin almacenamiento, avisando que no podrá recuperarse.
    globalThis.sessionStorage.getItem = () => { throw new Error('Storage unavailable'); };
    globalThis.sessionStorage.setItem = () => { throw new Error('Storage unavailable'); };
    await import('../public/assets/js/exam-page.js?no-storage');
    await new Promise(setImmediate);
    assert.equal(nodes['storage-notice'].hidden, false);
    nodes['start-exam'].listeners.click();
    assert.equal(nodes['exam-running'].hidden, false);

    nodes['exam-running'].hidden = true;
    nodes['exam-setup'].hidden = true;
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    const originalError = console.error;
    console.error = () => {};
    try {
      await import('../public/assets/js/exam-page.js?load-error');
      await new Promise(setImmediate);
    } finally {
      console.error = originalError;
    }
    assert.equal(nodes['exam-load-status'].attributes.role, 'alert');
    assert.equal(nodes['retry-exam-load'].hidden, false);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ ...exam, preguntas: [] }) });
    await nodes['retry-exam-load'].listeners.click();
    assert.equal(nodes['exam-load-status'].attributes.role, 'status');
    assert.match(nodes['exam-load-status'].textContent, /todavía no tiene preguntas/);
    assert.equal(nodes['exam-setup'].hidden, true);
    assert.equal(nodes['exam-running'].hidden, true);
  } finally {
    Date.now = originalNow;
    globalThis.setInterval = originalInterval;
    globalThis.clearInterval = originalClear;
  }
});
