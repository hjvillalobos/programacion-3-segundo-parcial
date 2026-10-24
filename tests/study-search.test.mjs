import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createStudyIndex, findStudyItems, normalizeSearch } from '../public/assets/js/study-search.js';
import { mountStudyFilters } from '../public/assets/js/study-filters.js';
import { renderQuestions } from '../public/assets/js/render.js';

const readBank = (name) => JSON.parse(readFileSync(new URL(`../public/data/${name}.json`, import.meta.url), 'utf8'));
const cards = readBank('tarjetas');
const questions = readBank('preguntas');

test('los temas se obtienen del banco y conservan la distribución 15, 18 y 17', () => {
  for (const bank of [cards, questions]) {
    const original = structuredClone(bank);
    const index = createStudyIndex(bank);
    assert.equal(findStudyItems(index).length, 50);
    for (const [topic, count] of [
      ['Patrones de diseño', 15], ['Bases de datos y persistencia', 18], ['Hilos y comunicación', 17],
    ]) assert.equal(findStudyItems(index, '', topic).length, count);
    assert.deepEqual(bank, original);
  }
});

test('buscar ignora mayúsculas, tildes y espacios alrededor de las palabras', () => {
  const index = createStudyIndex(cards);
  assert.equal(normalizeSearch('  COMUNICACIÓN  '), 'comunicacion');
  assert.deepEqual(findStudyItems(index, ' NORMALIZACIÓN '), findStudyItems(index, 'normalizacion'));
  assert.deepEqual(findStudyItems(index, 'JDBC'), findStudyItems(index, 'jdbc'));
  assert.ok(findStudyItems(index, 'JDBC').length > 0);
});

test('combina todas las palabras con el tema sin cambiar el orden de las preguntas', () => {
  const index = createStudyIndex(questions);
  const matches = findStudyItems(index, 'jdbc sql', 'Bases de datos y persistencia');
  assert.ok(matches.length > 0);
  assert.ok(matches.every((item) => item.topic === 'Bases de datos y persistencia'
    && item.text.includes('jdbc') && item.text.includes('sql')));
  assert.deepEqual(matches.map((item) => item.id), index.filter((item) => matches.includes(item)).map((item) => item.id));
  assert.deepEqual(findStudyItems(index, 'jdbc', 'Patrones de diseño').filter((item) => !item.text.includes('jdbc')), []);
  assert.deepEqual(findStudyItems(index, 'termino-sin-coincidencias'), []);
  assert.deepEqual(findStudyItems(index, '', 'Tema inexistente'), []);
});

test('el índice incluye texto y código, pero no nombres de etiquetas ni claves de respuesta', () => {
  const index = createStudyIndex([{
    id: 'p1', titulo: 'Ejercicio', meta: 'Bases de datos y persistencia · Básica',
    enunciado: [{ tipo: 'pre', contenido: [{ tipo: 'code', contenido: ['ps.executeUpdate();'] }] }],
    opciones: [{ valor: '0', contenido: ['Usar PreparedStatement'] }],
  }]);
  assert.equal(findStudyItems(index, 'executeupdate').length, 1);
  assert.equal(findStudyItems(index, 'preparedstatement').length, 1);
  assert.equal(findStudyItems(index, 'pre code').length, 0);
  assert.equal(findStudyItems(index, '<script>').length, 0);
});

class Element {
  constructor(tag = '', text = '') {
    this.tag = tag; this.text = text; this.children = []; this.attributes = {}; this.listeners = {};
  }
  get id() { return this.attributes.id; }
  get textContent() { return this.text + this.children.map((node) => node.textContent).join(''); }
  set textContent(value) { this.text = value; this.children = []; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...nodes) { this.children.push(...nodes.map((node) => typeof node === 'string' ? new Element('', node) : node)); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  focus() { this.focused = true; }
  scrollIntoView() {}
}

function descendants(nodes) {
  return nodes.flatMap((node) => [node, ...descendants(node.children)]);
}

function mount() {
  globalThis.document = { createElement: (tag) => new Element(tag), createTextNode: (text) => new Element('', text) };
  const fields = Object.fromEntries(['[name="q"]', '[name="topic"]', '[data-clear-filters]', '[data-filter-count]', '[data-filter-empty]']
    .map((selector) => [selector, new Element()]));
  const form = { dataset: { itemLabel: 'preguntas' }, querySelector: (selector) => fields[selector] };
  const nodes = renderQuestions(questions);
  const container = new Element('div');
  container.append(...nodes);
  const controls = [new Element('nav'), new Element('nav')];
  const view = mountStudyFilters({ items: questions, nodes, container, controls, form });
  return { fields, form, nodes, container, controls, view };
}

test('filtrar y limpiar mantiene los mismos nodos y las respuestas del cuestionario', () => {
  const { fields, form, nodes, container, controls } = mount();
  const query = fields['[name="q"]'];
  const topic = fields['[name="topic"]'];
  const clear = fields['[data-clear-filters]'];
  const answer = descendants([nodes.find((node) => node.id === 'p31')]).find((node) => node.tag === 'textarea');
  answer.value = 'Respuesta que debe conservarse';
  assert.equal(nodes.filter((node) => !node.hidden).length, 10);
  topic.value = 'Bases de datos y persistencia';
  topic.onchange();
  assert.match(fields['[data-filter-count]'].textContent, /^18 de 50 preguntas/);
  assert.equal(controls[0].hidden, false);
  query.value = 'consulta-sin-coincidencias';
  query.oninput();
  assert.equal(nodes.filter((node) => !node.hidden).length, 0);
  assert.equal(fields['[data-filter-empty]'].hidden, false);
  assert.ok(controls.every((control) => control.hidden));
  let prevented = false;
  form.onsubmit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  clear.onclick();
  assert.equal(query.value, '');
  assert.equal(topic.value, '');
  assert.equal(query.focused, true);
  assert.equal(clear.disabled, true);
  assert.equal(answer.value, 'Respuesta que debe conservarse');
  assert.equal(container.children.length, 50);
  nodes.forEach((node, index) => assert.equal(container.children[index], node));
});

test('un enlace a una pregunta excluida limpia los filtros y revela su grupo', () => {
  const { fields, nodes, view } = mount();
  fields['[name="topic"]'].value = 'Patrones de diseño';
  fields['[name="q"]'].value = 'observer';
  fields['[name="q"]'].oninput();
  assert.equal(nodes.find((node) => node.id === 'p49').hidden, true);
  view.reveal('p49');
  assert.equal(fields['[name="q"]'].value, '');
  assert.equal(fields['[name="topic"]'].value, '');
  assert.match(fields['[data-filter-count]'].textContent, /Se restablecieron los filtros/);
  assert.equal(nodes.find((node) => node.id === 'p49').hidden, false);
  assert.deepEqual(nodes.filter((node) => !node.hidden).map((node) => node.id),
    questions.slice(40, 50).map((question) => question.id));
  assert.doesNotThrow(() => view.reveal('pregunta-que-no-existe'));
});
