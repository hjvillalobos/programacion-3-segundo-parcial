export function validateExam(exam) {
  if (!exam?.id || !Number.isInteger(exam.version) || !Number.isInteger(exam.duracionSegundos)
    || exam.duracionSegundos <= 0 || !Array.isArray(exam.preguntas) || !exam.preguntas.length) {
    throw new Error('Configuración de simulacro inválida');
  }
  const ids = new Set();
  for (const question of exam.preguntas) {
    if (!question.id || ids.has(question.id) || !question.enunciado
      || !Array.isArray(question.opciones) || question.opciones.length < 2) {
      throw new Error('Pregunta de simulacro inválida');
    }
    ids.add(question.id);
    const options = question.opciones.map((option) => option.id);
    if (new Set(options).size !== options.length || question.opciones.some((option) => !option.id || !option.texto)
      || !options.includes(question.correcta)) throw new Error('Opciones o clave inválidas');
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

export function createAttempt(exam, now = Date.now(), random = Math.random) {
  return {
    examId: exam.id,
    bankVersion: exam.version,
    status: 'running',
    startedAt: now,
    deadline: now + exam.duracionSegundos * 1000,
    questionOrder: shuffle(exam.preguntas.map((question) => question.id), random),
    optionOrder: Object.fromEntries(exam.preguntas.map((question) => [
      question.id, shuffle(question.opciones.map((option) => option.id), random),
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

export function answerQuestion(exam, attempt, questionId, optionId, now = Date.now()) {
  if (attempt.status !== 'running') return attempt;
  if (now >= attempt.deadline) return finishAttempt(attempt, now);
  const question = exam.preguntas.find((item) => item.id === questionId);
  if (!question?.opciones.some((option) => option.id === optionId)) throw new Error('Respuesta inválida');
  return { ...attempt, answers: { ...attempt.answers, [questionId]: optionId } };
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
  if (!exam.preguntas.every((question) => sameIds(attempt.optionOrder[question.id], question.opciones.map((option) => option.id)))) return false;
  if (!Object.entries(attempt.answers).every(([id, option]) => exam.preguntas
    .find((question) => question.id === id)?.opciones.some((item) => item.id === option))) return false;
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
    return { question, selected, outcome: selected === null ? 'unanswered' : selected === question.correcta ? 'correct' : 'incorrect' };
  });
  const correct = items.filter((item) => item.outcome === 'correct').length;
  const incorrect = items.filter((item) => item.outcome === 'incorrect').length;
  const unanswered = items.length - correct - incorrect;
  return {
    items, correct, incorrect, unanswered,
    total: items.length,
    score: Math.round(correct / items.length * 10000) / 100,
    elapsedSeconds: Math.floor((attempt.finishedAt - attempt.startedAt) / 1000),
  };
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
