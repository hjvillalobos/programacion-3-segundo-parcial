import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateExam, createAttempt, answerQuestion, finishAttempt, gradeAttempt, isValidAttempt } from '../public/assets/js/exam.js';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const exam = read('../public/data/simulacros/simulacro-2.json');
const previous = read('../public/data/simulacros/simulacro-1.json');
const sources = new Set(read('../public/data/fuentes.json').map((item) => item.id.replace('fuente-', '')));

test('Simulacro II: 50 preguntas nuevas, explicadas y con referencias válidas', () => {
  validateExam(exam);
  assert.equal(exam.duracionSegundos, 5400);
  assert.equal(exam.preguntas.length, 50);
  const topics = {};
  const statements = new Set(previous.preguntas.map((item) => item.enunciado));
  const ids = new Set(previous.preguntas.map((item) => item.id));
  for (const question of exam.preguntas) {
    topics[question.tema] = (topics[question.tema] ?? 0) + 1;
    assert.ok(!ids.has(question.id));
    assert.ok(!statements.has(question.enunciado));
    statements.add(question.enunciado);
    assert.equal(question.opciones.length, 4);
    assert.equal(new Set(question.opciones.map((item) => item.texto)).size, 4);
    assert.ok(question.explicacion.length > 40);
    assert.ok(question.referencias.length > 0);
    for (const source of question.referencias) assert.ok(sources.has(source), source);
  }
  assert.deepEqual(Object.values(topics), [15, 18, 17]);
});

test('la mezcla conserva las claves y los intentos no se intercambian entre simulacros', () => {
  let attempt = createAttempt(exam, 1000, () => 0.25);
  assert.ok(isValidAttempt(exam, attempt));
  assert.equal(isValidAttempt(previous, attempt), false);
  assert.equal(isValidAttempt(exam, createAttempt(previous, 1000)), false);
  for (const question of exam.preguntas) attempt = answerQuestion(exam, attempt, question.id, question.correcta, 2000);
  const result = gradeAttempt(exam, finishAttempt(attempt, 3000));
  assert.equal(result.score, 100);
  assert.equal(result.correct, 50);
  assert.equal(result.incorrect, 0);
  assert.equal(result.unanswered, 0);
});
