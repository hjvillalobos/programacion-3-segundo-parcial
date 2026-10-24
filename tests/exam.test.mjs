import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { validateExam, shuffle, createAttempt, remainingSeconds, answerQuestion, finishAttempt, isValidAttempt, gradeAttempt, formatTime } from '../public/assets/js/exam.js';

const exam = JSON.parse(readFileSync(new URL('../public/data/simulacros/simulacro-1.json', import.meta.url), 'utf8'));
const start = 1_000_000;
test('las explicaciones completan el Simulacro I sin alterar su banco original', () => {
  const sources = new Set(JSON.parse(readFileSync(new URL('../public/data/fuentes.json', import.meta.url), 'utf8')).map((source) => source.id));
  const original = structuredClone(exam);
  for (const question of original.preguntas) {
    assert.ok(question.explicacion.length > 60, question.id);
    assert.ok(question.referencias.length > 0, question.id);
    for (const source of question.referencias) assert.ok(sources.has(`fuente-${source}`), source);
    delete question.explicacion;
    delete question.referencias;
  }
  assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), 'b5a75ac967018aa7358697689b706df4643be4ef3281baa6292bfdf8844938f7');
});
function seededRandom() {
  let state = 12345;
  return () => ((state = state * 16807 % 2147483647) - 1) / 2147483646;
}

test('el examen contiene las 50 preguntas originales y dura 90 minutos', () => {
  assert.equal(validateExam(exam), exam);
  assert.equal(exam.duracionSegundos, 5400);
  assert.deepEqual(exam.preguntas.map((question) => question.numeroOriginal), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.ok(exam.preguntas.every((question) => question.opciones.length === 4));
  assert.throws(() => validateExam({ ...exam, duracionSegundos: 0 }));
  const duplicate = structuredClone(exam);
  duplicate.preguntas[1].id = duplicate.preguntas[0].id;
  assert.throws(() => validateExam(duplicate));
});

test('la mezcla permuta preguntas y opciones sin modificar el banco', () => {
  const original = structuredClone(exam);
  const attempt = createAttempt(exam, start, seededRandom());
  assert.equal(isValidAttempt(exam, attempt), true);
  assert.notDeepEqual(attempt.questionOrder, exam.preguntas.map((question) => question.id));
  assert.ok(exam.preguntas.some((question) => attempt.optionOrder[question.id].join() !== question.opciones.map((option) => option.id).join()));
  assert.deepEqual(exam, original);
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle(['a']), ['a']);
});

test('acertar todas las preguntas después de mezclarlas da 100 puntos', () => {
  let attempt = createAttempt(exam, start, seededRandom());
  for (const id of attempt.questionOrder) {
    const question = exam.preguntas.find((item) => item.id === id);
    attempt = answerQuestion(exam, attempt, id, question.correcta, start + 1000);
  }
  const result = gradeAttempt(exam, finishAttempt(attempt, start + 60000));
  assert.deepEqual([result.correct, result.incorrect, result.unanswered, result.score], [50, 0, 0, 100]);
  assert.equal(result.elapsedSeconds, 60);
});

test('una correcta, una incorrecta y 48 sin responder dan 2 sobre 100', () => {
  let attempt = createAttempt(exam, start);
  const [first, second] = exam.preguntas;
  attempt = answerQuestion(exam, attempt, first.id, first.correcta, start + 100);
  const wrong = second.opciones.find((option) => option.id !== second.correcta).id;
  attempt = answerQuestion(exam, attempt, second.id, wrong, start + 200);
  const result = gradeAttempt(exam, finishAttempt(attempt, start + 500));
  assert.deepEqual([result.correct, result.incorrect, result.unanswered, result.score], [1, 1, 48, 2]);
  assert.equal(result.items.find((item) => item.question.id === first.id).outcome, 'correct');
  assert.equal(result.items.find((item) => item.question.id === second.id).selected, wrong);
});

test('permite cambiar una respuesta y entrega en blanco con nota cero', () => {
  let attempt = createAttempt(exam, start);
  const question = exam.preguntas[0];
  attempt = answerQuestion(exam, attempt, question.id, 'a', start + 100);
  attempt = answerQuestion(exam, attempt, question.id, 'b', start + 200);
  assert.equal(Object.keys(attempt.answers).length, 1);
  assert.equal(attempt.answers[question.id], 'b');
  const result = gradeAttempt(exam, finishAttempt(createAttempt(exam, start), start + 300));
  assert.equal(result.score, 0);
  assert.equal(result.unanswered, 50);
  assert.throws(() => gradeAttempt(exam, attempt));
  assert.throws(() => answerQuestion(exam, attempt, question.id, 'opcion-inexistente', start + 300));
});

test('el reloj usa una fecha límite y rechaza respuestas recibidas al vencer', () => {
  const attempt = createAttempt(exam, start);
  assert.equal(remainingSeconds(attempt, start), 5400);
  assert.equal(remainingSeconds(attempt, attempt.deadline - 1), 1);
  assert.equal(remainingSeconds(attempt, attempt.deadline), 0);
  assert.equal(remainingSeconds(attempt, attempt.deadline + 60000), 0);
  const late = answerQuestion(exam, attempt, exam.preguntas[0].id, 'b', attempt.deadline);
  assert.equal(late.status, 'finished');
  assert.equal(late.reason, 'expired');
  assert.deepEqual(late.answers, {});
  assert.equal(late.finishedAt, attempt.deadline);
  assert.equal(gradeAttempt(exam, late).elapsedSeconds, 5400);
  assert.equal(finishAttempt(late, attempt.deadline + 1), late);
  assert.equal(answerQuestion(exam, late, exam.preguntas[0].id, 'b', attempt.deadline + 1), late);
  assert.equal(formatTime(5400), '90:00');
  assert.equal(formatTime(65), '01:05');
});

test('recuperar un intento conserva el orden y el reloj, y descarta datos incompatibles', () => {
  let attempt = createAttempt(exam, start, seededRandom());
  attempt = answerQuestion(exam, attempt, exam.preguntas[0].id, 'b', start + 1);
  const saved = JSON.parse(JSON.stringify(attempt));
  assert.equal(isValidAttempt(exam, saved), true);
  assert.equal(remainingSeconds(saved, start + 120000), 5280);
  assert.equal(isValidAttempt(exam, finishAttempt(saved, start + 120000)), true);
  for (const change of [
    { bankVersion: 999 }, { deadline: saved.deadline + 1 }, { currentIndex: -1 },
    { questionOrder: [...saved.questionOrder.slice(1), saved.questionOrder[1]] },
    { answers: { 'pregunta-inexistente': 'a' } }, { answers: { [exam.preguntas[0].id]: 'z' } },
    { optionOrder: {} }, { status: 'finished', finishedAt: saved.deadline + 1, reason: 'submitted' },
  ]) assert.equal(isValidAttempt(exam, { ...saved, ...change }), false);
});
