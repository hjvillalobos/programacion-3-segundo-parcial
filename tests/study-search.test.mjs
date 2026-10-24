import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createStudyIndex, findStudyItems, normalizeSearch } from '../public/assets/js/study-search.js';

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
