import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderCards, renderQuestions, renderSolutions, renderSources, renderCoverage, richContent } from '../public/assets/js/render.js';
import { paginate } from '../public/assets/js/pagination.js';
import { materialLink } from '../public/assets/js/routes.js';

// DOM mínimo para verificar los nodos generados sin instalar dependencias.
class Node {
  constructor(tag = '', text = '') {
    this.tag = tag;
    this.text = text;
    this.attributes = {};
    this.children = [];
    this.listeners = {};
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...nodes) {
    this.children.push(...nodes.map((node) => typeof node === 'string' ? new Node('', node) : node));
  }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  get id() { return this.attributes.id; }
  scrollIntoView() { this.scrolled = true; }
  get textContent() { return this.text + this.children.map((node) => node.textContent).join(''); }
  set textContent(value) { this.text = value; this.children = []; }
}

globalThis.document = {
  createElement: (tag) => new Node(tag),
  createTextNode: (text) => new Node('', text),
};

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const data = Object.fromEntries(['tarjetas', 'preguntas', 'soluciones', 'cobertura', 'fuentes', 'introduccion']
  .map((name) => [name, readJson(`../public/data/${name}.json`)]));
const fingerprint = readJson('./fixtures/contenido-original.json');
const hash = (text) => createHash('sha256').update(text).digest('hex');
function descendants(nodes) {
  return nodes.flatMap((node) => [node, ...descendants(node.children)]);
}

test('conserva el contenido de los 150 artículos y todos los ejemplos de código', () => {
  const cards = renderCards(data.tarjetas);
  const questions = renderQuestions(data.preguntas);
  const solutions = renderSolutions(data.soluciones);
  assert.deepEqual([cards.length, questions.length, solutions.length], [50, 50, 50]);
  const articles = [...cards, ...questions, ...solutions];
  assert.equal(hash(articles.map((node) => node.textContent.replace(/\s+/g, '')).join('\n')), fingerprint.articulos);
  const code = descendants(articles).filter((node) => node.tag === 'code');
  assert.equal(hash(code.map((node) => node.textContent).join('\n')), fingerprint.codigo);
});

test('conserva opciones, campos de respuesta y destinos de los enlaces', () => {
  const nodes = descendants([
    ...renderCards(data.tarjetas), ...renderQuestions(data.preguntas),
    ...renderSolutions(data.soluciones), ...renderSources(data.fuentes),
    ...renderCoverage(data.cobertura), ...richContent(data.introduccion),
  ]);
  assert.equal(nodes.filter((node) => node.tag === 'input').length, 80);
  assert.equal(nodes.filter((node) => node.tag === 'textarea').length, 30);
  assert.equal(nodes.filter((node) => node.tag === 'details').length, 100);
  const ids = nodes.map((node) => node.attributes.id).filter(Boolean);
  assert.equal(ids.length, new Set(ids).size);
  nodes.filter((node) => node.attributes.href?.includes('#')).forEach((node) => {
    const [page, id] = node.attributes.href.split('#');
    assert.ok(ids.includes(id), `Destino ausente: ${node.attributes.href}`);
    assert.ok(readFileSync(new URL(`../public/${page}`, import.meta.url), 'utf8').includes('assets/js/main.js'));
  });
  data.preguntas.filter((item) => item.opciones).forEach((item) => {
    assert.deepEqual(item.opciones.map((option) => option.valor), ['0', '1', '2', '3']);
  });
});

test('el contenido enriquecido conserva texto literal y rechaza elementos ejecutables', () => {
  assert.equal(richContent(['<script>alert(1)</script>'])[0].textContent, '<script>alert(1)</script>');
  assert.throws(() => richContent([{ tipo: 'script', contenido: [] }]));
  assert.throws(() => richContent([{ tipo: 'p', atributos: { onclick: 'alert(1)' }, contenido: [] }]));
  assert.throws(() => richContent([{ tipo: 'a', atributos: { href: 'javascript:alert(1)' }, contenido: [] }]));
});

test('paginación de diez elementos conserva respuestas y revela enlaces directos', () => {
  const questions = renderQuestions(data.preguntas);
  const container = new Node('div');
  const controls = [new Node('nav'), new Node('nav')];
  const navigations = [];
  const pages = paginate(container, questions, controls, {
    targetId: 'p41', onNavigate: (id) => navigations.push(id),
  });
  assert.deepEqual(questions.filter((node) => !node.hidden).map((node) => node.id),
    data.preguntas.slice(40, 50).map((item) => item.id));
  const answer = descendants([questions[40]]).find((node) => node.tag === 'textarea');
  answer.value = 'Mi respuesta escrita';
  controls[1].children.find((node) => node.textContent === 'Anterior').listeners.click();
  assert.deepEqual(navigations, ['p31']);
  assert.equal(container.scrolled, true);
  assert.equal(questions.filter((node) => !node.hidden).length, 10);
  pages.reveal('p41');
  assert.equal(answer.value, 'Mi respuesta escrita');
  assert.equal(questions[40].hidden, false);
  assert.equal(controls[0].children.find((node) => node.textContent === 'Siguiente').disabled, true);
  pages.reveal('p1');
  assert.equal(controls[0].children.find((node) => node.textContent === 'Anterior').disabled, true);
});

test('cada enlace de cobertura apunta a la página que contiene su destino', () => {
  const destinations = {
    'tarjetas.html': renderCards(data.tarjetas),
    'cuestionario.html': renderQuestions(data.preguntas),
    'solucionario.html': renderSolutions(data.soluciones),
    'referencias.html': renderSources(data.fuentes),
  };
  Object.values(destinations).flat().forEach((node) => {
    const [page, id] = materialLink(node.id).split('#');
    assert.ok(destinations[page].some((destination) => destination.id === id));
  });
  assert.equal(materialLink('fuentes'), 'referencias.html#fuentes');
  assert.equal(materialLink('cobertura'), 'referencias.html#cobertura');
});

test('carga relativa para GitHub Pages, impresión y fallo de carga', async () => {
  const selectors = ['#estado-carga', '#introduccion', '#lista-tarjetas', '#lista-preguntas', '#lista-soluciones', '#tabla-cobertura', '#lista-fuentes'];
  const containers = Object.fromEntries(selectors.map((selector) => [selector, new Node()]));
  const buttons = ['true', 'false'].map((value) => Object.assign(new Node('button'), {
    dataset: { printAnswers: value }, disabled: true,
  }));
  Object.assign(document, {
    readyState: 'complete',
    querySelector: (selector) => containers[selector],
    querySelectorAll: (selector) => selector === '[data-print-answers]' ? buttons
      : selector === 'details' ? descendants(Object.values(containers)).filter((node) => node.tag === 'details') : [],
    getElementById: () => null,
  });
  globalThis.location = { hash: '#p41', pathname: '/repo/imprimir.html' };
  globalThis.requestAnimationFrame = (callback) => callback();
  let prints = 0;
  globalThis.window = { print: () => prints++ };
  const requested = [];
  globalThis.fetch = async (url) => {
    requested.push(url);
    assert.match(url, /^data\/[a-z]+\.json$/);
    return { ok: true, json: async () => data[url.slice(5, -5)] };
  };
  await import('../public/assets/js/main.js?success');
  await new Promise(setImmediate);
  assert.equal(requested.length, 6);
  assert.equal(containers['#estado-carga'].hidden, true);
  assert.ok(buttons.every((button) => !button.disabled));
  buttons[0].listeners.click();
  assert.ok(document.querySelectorAll('details').every((node) => node.open));
  buttons[1].listeners.click();
  assert.ok(document.querySelectorAll('details').every((node) => !node.open));
  assert.equal(prints, 2);

  Object.values(containers).forEach((container) => { container.replaceChildren(); container.hidden = false; });
  buttons.forEach((button) => { button.disabled = true; });
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  const originalError = console.error;
  console.error = () => {};
  try {
    await import('../public/assets/js/main.js?failure');
    await new Promise(setImmediate);
  } finally {
    console.error = originalError;
  }
  assert.equal(containers['#estado-carga'].attributes.role, 'alert');
  assert.match(containers['#estado-carga'].textContent, /No se pudo cargar/);
  assert.ok(buttons.every((button) => button.disabled));
  assert.equal(containers['#lista-tarjetas'].children.length, 0);

  // Una página de práctica carga únicamente su archivo, bajo una subruta de Pages.
  requested.length = 0;
  document.querySelector = (selector) => ['#estado-carga', '#lista-preguntas'].includes(selector) ? containers[selector] : null;
  globalThis.location = { hash: '#p41', pathname: '/mi-repositorio/cuestionario.html' };
  globalThis.fetch = async (url) => {
    requested.push(url);
    return { ok: true, json: async () => data[url.slice(5, -5)] };
  };
  await import('../public/assets/js/main.js?questions-only');
  await new Promise(setImmediate);
  assert.deepEqual(requested, ['data/preguntas.json']);
  assert.equal(containers['#lista-preguntas'].children.length, 50);

  let redirect;
  globalThis.location = {
    hash: '#p41', pathname: '/mi-repositorio/index.html',
    replace: (destination) => { redirect = destination; },
  };
  await import('../public/assets/js/main.js?legacy');
  await new Promise(setImmediate);
  assert.equal(redirect, 'cuestionario.html#p41');
});
