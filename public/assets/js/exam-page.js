import { element } from './render.js';
import { paginate } from './pagination.js';
import { validateExam, createAttempt, answerQuestion, finishAttempt, gradeAttempt, isValidAttempt, remainingSeconds, formatTime } from './exam.js';

const $ = (selector) => document.querySelector(selector);
let exam;
let attempt = null;
let clock;
let warned = false;
const storageKey = 'progra3:simulacro-1:intento:v1';

function persistenceError() {
  $('#storage-notice').hidden = false;
}

function save() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(attempt));
  } catch {
    persistenceError();
  }
}

function readSavedAttempt() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    return isValidAttempt(exam, saved) ? saved : null;
  } catch {
    persistenceError();
    return null;
  }
}

function focusQuestion() {
  $('#exam-question-title').focus();
}

function showQuestion(index, focus = false) {
  if (checkExpiration()) return;
  attempt = { ...attempt, currentIndex: index };
  save();
  const id = attempt.questionOrder[index];
  const question = exam.preguntas.find((item) => item.id === id);
  const options = attempt.optionOrder[id].map((optionId, position) => {
    const option = question.opciones.find((item) => item.id === optionId);
    const input = element('input', { type: 'radio', name: 'exam-answer', value: option.id });
    input.checked = attempt.answers[id] === option.id;
    input.addEventListener('change', () => {
      attempt = answerQuestion(exam, attempt, id, option.id);
      save();
      if (attempt.status === 'finished') showResults();
      else updateProgress();
    });
    return element('label', { class: 'exam-option' }, [input,
      element('span', {}, [`${String.fromCharCode(65 + position)}. ${option.texto}`]),
    ]);
  });
  $('#exam-question').replaceChildren(
    element('h2', { id: 'exam-question-title', tabindex: '-1' }, [`Pregunta ${index + 1} de ${exam.preguntas.length}`]),
    element('fieldset', { class: 'exam-fieldset' }, [
      element('legend', {}, [question.enunciado]), ...options,
    ]),
  );
  $('#previous-question').disabled = index === 0;
  $('#next-question').disabled = index === exam.preguntas.length - 1;
  updateProgress();
  if (focus) focusQuestion();
}

function updateProgress() {
  const answered = Object.keys(attempt.answers).length;
  $('#exam-progress').textContent = `${answered} de ${exam.preguntas.length} respondidas`;
  $('#exam-map').replaceChildren(...attempt.questionOrder.map((id, index) => {
    const selected = Object.hasOwn(attempt.answers, id);
    const button = element('button', {
      type: 'button',
      class: selected ? 'question-number answered' : 'question-number',
      'aria-label': `Pregunta ${index + 1}, ${selected ? 'respondida' : 'sin responder'}`,
      ...(index === attempt.currentIndex ? { 'aria-current': 'step' } : {}),
    }, [String(index + 1)]);
    button.addEventListener('click', () => showQuestion(index, true));
    return button;
  }));
}

function tick() {
  if (!attempt || attempt.status !== 'running') return;
  $('#exam-timer').textContent = formatTime(remainingSeconds(attempt));
  if (checkExpiration()) return;
  if (!warned && remainingSeconds(attempt) <= 300) {
    warned = true;
    $('#exam-announcement').textContent = 'Quedan cinco minutos o menos para entregar.';
  }
}

function checkExpiration() {
  if (attempt?.status !== 'running') return attempt?.status === 'finished';
  if (Date.now() < attempt.deadline) return false;
  attempt = finishAttempt(attempt);
  save();
  showResults();
  return true;
}

function startRunning() {
  $('#exam-setup').hidden = true;
  $('#exam-results').hidden = true;
  $('#exam-running').hidden = false;
  $('#submit-confirmation').hidden = true;
  warned = false;
  if (checkExpiration()) return;
  showQuestion(attempt.currentIndex);
  tick();
  clearInterval(clock);
  clock = setInterval(tick, 1000);
}

function submit() {
  if (!attempt || attempt.status !== 'running') return;
  attempt = finishAttempt(attempt);
  save();
  showResults();
}

function showResults() {
  clearInterval(clock);
  $('#exam-setup').hidden = true;
  $('#exam-running').hidden = true;
  $('#submit-confirmation').hidden = true;
  $('#exam-results').hidden = false;
  const result = gradeAttempt(exam, attempt);
  $('#exam-score').textContent = `${result.score.toLocaleString('es', { maximumFractionDigits: 2 })} / 100`;
  $('#exam-result-summary').textContent = `${result.correct} ${result.correct === 1 ? 'correcta' : 'correctas'} · ${result.incorrect} ${result.incorrect === 1 ? 'incorrecta' : 'incorrectas'} · ${result.unanswered} sin responder`;
  $('#exam-result-time').textContent = `${attempt.reason === 'expired' ? 'Tiempo agotado: entrega automática.' : 'Intento entregado.'} Tiempo empleado: ${formatTime(result.elapsedSeconds)}.`;
  const labels = { correct: 'Correcta', incorrect: 'Incorrecta', unanswered: 'Sin responder' };
  const nodes = result.items.map(({ question, selected, outcome }, index) => {
    const selectedText = question.opciones.find((option) => option.id === selected)?.texto ?? 'Sin responder';
    const correctText = question.opciones.find((option) => option.id === question.correcta).texto;
    return element('article', { class: `item exam-review ${outcome}`, id: `revision-${question.id}` }, [
      element('p', { class: 'meta' }, [`Pregunta ${index + 1} · ${labels[outcome]} · Original ${question.numeroOriginal}`]),
      element('details', {}, [
        element('summary', {}, [question.enunciado]),
        element('p', {}, [element('strong', {}, ['Tu respuesta: ']), selectedText]),
        element('p', {}, [element('strong', {}, ['Respuesta correcta: ']), correctText]),
      ]),
    ]);
  });
  $('#exam-review').replaceChildren(...nodes);
  paginate($('#exam-review'), nodes, [$('#review-top'), $('#review-bottom')]);
  $('#exam-results-title').focus();
}

async function initialize() {
  try {
    const response = await fetch('data/simulacros/simulacro-1.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    exam = validateExam(await response.json());
    $('#exam-description').textContent = exam.descripcion;
    $('#exam-duration').textContent = `${exam.duracionSegundos / 60} minutos`;
    $('#exam-load-status').hidden = true;
    attempt = readSavedAttempt();
    if (attempt?.status === 'finished') showResults();
    else if (attempt) startRunning();
    else $('#exam-setup').hidden = false;
  } catch (error) {
    $('#exam-load-status').textContent = 'No se pudo cargar el simulacro. Comprueba tu conexión y recarga la página.';
    $('#exam-load-status').setAttribute('role', 'alert');
    console.error('Error al cargar el simulacro:', error);
  }
}

$('#start-exam').addEventListener('click', () => {
  attempt = createAttempt(exam);
  save();
  startRunning();
  focusQuestion();
});
$('#previous-question').addEventListener('click', () => showQuestion(Math.max(0, attempt.currentIndex - 1), true));
$('#next-question').addEventListener('click', () => showQuestion(Math.min(exam.preguntas.length - 1, attempt.currentIndex + 1), true));
$('#exam-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (checkExpiration()) return;
  const pending = exam.preguntas.length - Object.keys(attempt.answers).length;
  $('#submit-summary').textContent = pending
    ? `Quedan ${pending} preguntas sin responder; contarán como cero puntos. ¿Quieres entregar el intento?`
    : 'Has respondido todas las preguntas. ¿Quieres entregar el intento?';
  $('#submit-confirmation').hidden = false;
  $('#confirm-submit').focus();
});
$('#confirm-submit').addEventListener('click', submit);
$('#cancel-submit').addEventListener('click', () => {
  $('#submit-confirmation').hidden = true;
  if (!checkExpiration()) focusQuestion();
});
$('#retry-exam').addEventListener('click', () => {
  attempt = null;
  try { sessionStorage.removeItem(storageKey); } catch { persistenceError(); }
  $('#exam-results').hidden = true;
  $('#exam-setup').hidden = false;
  $('#start-exam').focus();
});
document.addEventListener('visibilitychange', tick);
window.addEventListener('focus', tick);
initialize();
