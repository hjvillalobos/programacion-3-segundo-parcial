const types = new Set(['unica', 'multiple', 'campos']);

export function questionType(question) {
  return question.tipo ?? 'unica';
}

// Compara respuestas escritas sin distinguir mayúsculas, tildes ni espacios.
export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, '').toLowerCase();
}

function validOptions(question) {
  if (!Array.isArray(question.opciones) || question.opciones.length < 2) return false;
  const options = question.opciones.map((option) => option.id);
  return new Set(options).size === options.length && question.opciones.every((option) => option.id && option.texto);
}

function validFields(question) {
  if (!Array.isArray(question.campos) || !question.campos.length) return false;
  const ids = question.campos.map((field) => field.id);
  if (new Set(ids).size !== ids.length) return false;
  const fieldsValid = question.campos.every((field) => field.id && field.etiqueta
    && ['texto', 'lista'].includes(field.tipo ?? 'texto')
    && Array.isArray(field.respuestas) && field.respuestas.length
    && field.respuestas.every((answer) => normalizeAnswer(answer))
    && ((field.tipo ?? 'texto') === 'texto' || (Array.isArray(field.opciones)
      && new Set(field.opciones).size === field.opciones.length
      && field.respuestas.every((answer) => field.opciones.includes(answer)))));
  const alternatives = question.alternativas ?? [];
  return fieldsValid && Array.isArray(alternatives) && alternatives.every((alternative) => Object.entries(alternative)
    .every(([id, answers]) => ids.includes(id) && Array.isArray(answers) && answers.length));
}

export function validateExam(exam) {
  if (!exam?.id || !Number.isInteger(exam.version) || !Number.isInteger(exam.duracionSegundos)
    || exam.duracionSegundos <= 0 || !Array.isArray(exam.preguntas) || !exam.preguntas.length) {
    throw new Error('Configuración de simulacro inválida');
  }
  const ids = new Set();
  for (const question of exam.preguntas) {
    if (!question.id || ids.has(question.id) || !question.enunciado || !types.has(questionType(question))) {
      throw new Error('Pregunta de simulacro inválida');
    }
    ids.add(question.id);
    if (question.figura && (!question.figura.src || !question.figura.alt)) throw new Error('Figura sin texto alternativo');
    const type = questionType(question);
    const options = question.opciones?.map((option) => option.id) ?? [];
    const valid = type === 'campos' ? validFields(question)
      : validOptions(question) && (type === 'unica' ? options.includes(question.correcta)
        : Array.isArray(question.correctas) && question.correctas.length > 0
          && new Set(question.correctas).size === question.correctas.length
          && question.correctas.every((id) => options.includes(id)));
    if (!valid) throw new Error('Opciones o clave inválidas');
  }
  return exam;
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function optionIds(question, random) {
  const ids = (question.opciones ?? []).map((option) => option.id);
  return question.mezclarOpciones === false ? ids : shuffle(ids, random);
}

export function createAttempt(exam, now = Date.now(), random = Math.random) {
  return {
    examId: exam.id,
    bankVersion: exam.version,
    status: 'running',
    startedAt: now,
    deadline: now + exam.duracionSegundos * 1000,
    questionOrder: shuffle(exam.preguntas.map((question) => question.id), random),
    optionOrder: Object.fromEntries(exam.preguntas.map((question) => [
      question.id, optionIds(question, random),
    ])),
    answers: {},
    currentIndex: 0,
    finishedAt: null,
    reason: null,
  };
}

export function remainingSeconds(attempt, now = Date.now()) {
  return Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
}

export function finishAttempt(attempt, now = Date.now()) {
  if (attempt.status === 'finished') return attempt;
  const expired = now >= attempt.deadline;
  return {
    ...attempt,
    status: 'finished',
    finishedAt: Math.max(attempt.startedAt, Math.min(now, attempt.deadline)),
    reason: expired ? 'expired' : 'submitted',
  };
}

// Comprueba la forma de una respuesta según el tipo de pregunta.
export function isValidAnswer(question, value) {
  const type = questionType(question);
  if (type === 'unica') return question.opciones.some((option) => option.id === value);
  if (type === 'multiple') {
    return Array.isArray(value) && value.length > 0 && new Set(value).size === value.length
      && value.every((id) => question.opciones.some((option) => option.id === id));
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([id, text]) => {
    const field = question.campos.find((item) => item.id === id);
    return field && typeof text === 'string' && text.trim() && text.length <= 200
      && ((field.tipo ?? 'texto') === 'texto' || field.opciones.includes(text));
  });
}

function emptyAnswer(question, value) {
  const type = questionType(question);
  if (type === 'multiple') return Array.isArray(value) && value.length === 0;
  if (type === 'campos') return value && typeof value === 'object' && !Array.isArray(value)
    && Object.values(value).every((text) => typeof text === 'string' && !text.trim());
  return false;
}

export function answerQuestion(exam, attempt, questionId, value, now = Date.now()) {
  if (attempt.status !== 'running') return attempt;
  if (now >= attempt.deadline) return finishAttempt(attempt, now);
  const question = exam.preguntas.find((item) => item.id === questionId);
  if (!question) throw new Error('Respuesta inválida');
  const answers = { ...attempt.answers };
  if (emptyAnswer(question, value)) {
    delete answers[questionId];
    return { ...attempt, answers };
  }
  const cleaned = questionType(question) === 'campos'
    ? Object.fromEntries(Object.entries(value ?? {}).filter(([, text]) => typeof text !== 'string' || text.trim()))
    : value;
  if (!isValidAnswer(question, cleaned)) throw new Error('Respuesta inválida');
  answers[questionId] = cleaned;
  return { ...attempt, answers };
}

// Puntaje de 0 a 1: las preguntas por campos reciben crédito parcial.
export function scoreAnswer(question, value) {
  const type = questionType(question);
  if (value === undefined || value === null) return 0;
  if (type === 'unica') return value === question.correcta ? 1 : 0;
  if (type === 'multiple') {
    return value.length === question.correctas.length && value.every((id) => question.correctas.includes(id)) ? 1 : 0;
  }
  const keys = [Object.fromEntries(question.campos.map((field) => [field.id, field.respuestas])),
    ...(question.alternativas ?? []).map((alternative) => ({
      ...Object.fromEntries(question.campos.map((field) => [field.id, field.respuestas])), ...alternative,
    }))];
  return Math.max(...keys.map((key) => question.campos.filter((field) => key[field.id]
    .some((answer) => normalizeAnswer(answer) === normalizeAnswer(value[field.id]))).length / question.campos.length));
}

function sameIds(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length
    && new Set(actual).size === expected.length && actual.every((id) => expected.includes(id));
}

export function isValidAttempt(exam, attempt) {
  if (!attempt || attempt.examId !== exam.id || attempt.bankVersion !== exam.version
    || !['running', 'finished'].includes(attempt.status)
    || !Number.isFinite(attempt.startedAt) || attempt.startedAt < 0
    || attempt.deadline !== attempt.startedAt + exam.duracionSegundos * 1000
    || !Number.isInteger(attempt.currentIndex) || attempt.currentIndex < 0
    || attempt.currentIndex >= exam.preguntas.length
    || !sameIds(attempt.questionOrder, exam.preguntas.map((question) => question.id))
    || !attempt.optionOrder || !attempt.answers || Array.isArray(attempt.answers)) return false;
  if (Object.keys(attempt.optionOrder).length !== exam.preguntas.length) return false;
  if (!exam.preguntas.every((question) => sameIds(attempt.optionOrder[question.id], (question.opciones ?? []).map((option) => option.id)))) return false;
  if (!Object.entries(attempt.answers).every(([id, value]) => {
    const question = exam.preguntas.find((item) => item.id === id);
    return question && isValidAnswer(question, value);
  })) return false;
  if (attempt.status === 'running') return attempt.finishedAt === null && attempt.reason === null;
  return ['submitted', 'expired'].includes(attempt.reason)
    && Number.isFinite(attempt.finishedAt) && attempt.finishedAt >= attempt.startedAt
    && attempt.finishedAt <= attempt.deadline
    && (attempt.reason !== 'expired' || attempt.finishedAt === attempt.deadline);
}

export function gradeAttempt(exam, attempt) {
  if (attempt.status !== 'finished') throw new Error('El intento aún no ha sido entregado');
  const questions = new Map(exam.preguntas.map((question) => [question.id, question]));
  const items = attempt.questionOrder.map((id) => {
    const question = questions.get(id);
    const selected = attempt.answers[id] ?? null;
    const points = scoreAnswer(question, selected);
    const outcome = selected === null ? 'unanswered' : points === 1 ? 'correct' : points > 0 ? 'partial' : 'incorrect';
    return { question, selected, points, outcome };
  });
  const correct = items.filter((item) => item.outcome === 'correct').length;
  const partial = items.filter((item) => item.outcome === 'partial').length;
  const incorrect = items.filter((item) => item.outcome === 'incorrect').length;
  const unanswered = items.length - correct - partial - incorrect;
  const points = items.reduce((sum, item) => sum + item.points, 0);
  return {
    items, correct, partial, incorrect, unanswered,
    total: items.length,
    score: Math.round(points / items.length * 10000) / 100,
    elapsedSeconds: Math.floor((attempt.finishedAt - attempt.startedAt) / 1000),
  };
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
