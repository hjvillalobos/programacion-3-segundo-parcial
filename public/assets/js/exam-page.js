import { element } from './render.js';
import { paginate } from './pagination.js';
import { validateExam, createAttempt, answerQuestion, finishAttempt, gradeAttempt, isValidAttempt, remainingSeconds, formatTime, questionType } from './exam.js';

const $ = (selector) => document.querySelector(selector);
const examId = $('#contenido')?.dataset?.examId;
let exam;
let attempt = null;
let clock;
let warned = false;
const storageKey = `progra3:${examId}:intento:v1`;

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
  let stored;
  try {
    stored = sessionStorage.getItem(storageKey);
  } catch {
    persistenceError();
    return null;
  }
  try {
    const saved = JSON.parse(stored);
    return isValidAttempt(exam, saved) ? saved : null;
  } catch {
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
  const type = questionType(question);
  const record = (value) => {
    attempt = answerQuestion(exam, attempt, id, value);
    save();
    if (attempt.status === 'finished') showResults();
    else updateProgress();
  };
  const options = attempt.optionOrder[id].map((optionId, position) => {
    const option = question.opciones.find((item) => item.id === optionId);
    const multiple = type === 'multiple';
    const input = element('input', { type: multiple ? 'checkbox' : 'radio', name: 'exam-answer', value: option.id });
    input.checked = multiple ? (attempt.answers[id] ?? []).includes(option.id) : attempt.answers[id] === option.id;
    input.addEventListener('change', () => {
      if (!multiple) return record(option.id);
      const current = attempt.answers[id] ?? [];
      return record(input.checked ? [...current, option.id] : current.filter((item) => item !== option.id));
    });
    return element('label', { class: 'exam-option' }, [input,
      element('span', {}, [`${String.fromCharCode(65 + position)}. ${option.texto}`]),
    ]);
  });
  const fields = (question.campos ?? []).map((field) => {
    const saved = attempt.answers[id]?.[field.id] ?? '';
    const control = (field.tipo ?? 'texto') === 'lista'
      ? element('select', { name: field.id }, [
        element('option', { value: '' }, ['Selecciona una opción']),
        ...field.opciones.map((text) => element('option', { value: text }, [text])),
      ])
      : element('input', { type: 'text', name: field.id, autocomplete: 'off', spellcheck: 'false', maxlength: '200' });
    control.value = saved;
    control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', () => {
      record({ ...(attempt.answers[id] ?? {}), [field.id]: control.value });
    });
    return element('label', { class: 'exam-field' }, [element('span', {}, [field.etiqueta]), control]);
  });
  const hint = type === 'multiple' ? [element('p', { class: 'meta' }, [
    `Selecciona ${question.seleccionar ? `${question.seleccionar} opciones` : 'todas las opciones correctas'}.`,
  ])] : [];
  $('#exam-question').replaceChildren(
    element('h2', { id: 'exam-question-title', tabindex: '-1' }, [`Pregunta ${index + 1} de ${exam.preguntas.length}`]),
    element('fieldset', { class: 'exam-fieldset' }, [
      element('legend', {}, [question.enunciado]),
      ...questionMedia(question),
      ...hint,
      ...options,
      ...(fields.length ? [element('div', { class: question.campos.length > 6 ? 'exam-fields compact' : 'exam-fields' }, fields)] : []),
    ]),
  );
  $('#previous-question').disabled = index === 0;
  $('#next-question').disabled = index === exam.preguntas.length - 1;
  updateProgress();
  if (focus) focusQuestion();
}

function questionMedia(question) {
  return [
    ...(question.figura ? [element('figure', { class: 'exam-figure' }, [
      element('img', { src: question.figura.src, alt: question.figura.alt }),
    ])] : []),
    ...(question.codigo ? [element('pre', {}, [element('code', {}, [question.codigo])])] : []),
    ...(question.indicacion ? [element('p', { class: 'meta' }, [question.indicacion])] : []),
  ];
}

function optionText(question, ids) {
  return ids.map((id) => question.opciones.find((option) => option.id === id).texto).join(' · ');
}

function answerReview(question, selected) {
  const type = questionType(question);
  if (type !== 'campos') {
    const yours = selected === null ? 'Sin responder' : optionText(question, [selected].flat());
    const correct = optionText(question, type === 'multiple' ? question.correctas : [question.correcta]);
    return [
      element('p', {}, [element('strong', {}, ['Tu respuesta: ']), yours]),
      element('p', {}, [element('strong', {}, [type === 'multiple' ? 'Respuestas correctas: ' : 'Respuesta correcta: ']), correct]),
    ];
  }
  return [element('table', { class: 'exam-field-review' }, [
    element('thead', {}, [element('tr', {}, ['Campo', 'Tu respuesta', 'Respuesta correcta']
      .map((title) => element('th', { scope: 'col' }, [title])))]),
    element('tbody', {}, question.campos.map((field) => element('tr', {}, [
      element('th', { scope: 'row' }, [field.etiqueta]),
      element('td', {}, [selected?.[field.id] ?? 'Sin responder']),
      element('td', {}, [field.respuestas[0]]),
    ]))),
  ])];
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
    }, [`${index + 1}${selected ? ' R' : ''}`]);
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
    $('#exam-timer').setAttribute('data-urgent', 'true');
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
  $('#exam-announcement').textContent = '';
  $('#exam-timer').setAttribute('data-urgent', 'false');
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
  $('#exam-results-title').textContent = `Resultado del ${exam.titulo}`;
  $('#exam-score').textContent = `${result.score.toLocaleString('es', { maximumFractionDigits: 2 })} / 100`;
  const partial = result.partial ? ` · ${result.partial} ${result.partial === 1 ? 'parcial' : 'parciales'}` : '';
  $('#exam-result-summary').textContent = `${result.correct} ${result.correct === 1 ? 'correcta' : 'correctas'}${partial} · ${result.incorrect} ${result.incorrect === 1 ? 'incorrecta' : 'incorrectas'} · ${result.unanswered} sin responder`;
  $('#exam-result-time').textContent = `${attempt.reason === 'expired' ? 'Tiempo agotado: entrega automática.' : 'Intento entregado.'} Tiempo empleado: ${formatTime(result.elapsedSeconds)}.`;
  const labels = { correct: 'Correcta', partial: 'Parcialmente correcta', incorrect: 'Incorrecta', unanswered: 'Sin responder' };
  const nodes = result.items.map(({ question, selected, points, outcome }, index) => {
    const reference = question.tema ? ` · ${question.tema}` : '';
    const partial = outcome === 'partial' ? ` (${Math.round(points * 100)} %)` : '';
    return element('article', { class: `item exam-review ${outcome}`, id: `revision-${question.id}` }, [
      element('p', { class: 'meta' }, [`Pregunta ${index + 1} · ${labels[outcome]}${partial}${reference}`]),
      element('details', {}, [
        element('summary', {}, [question.enunciado]),
        ...questionMedia(question),
        ...answerReview(question, selected),
        ...(question.explicacion ? [element('p', {}, [question.explicacion])] : []),
        ...(question.referencias?.length ? [element('p', { class: 'meta' }, [
          'Fuentes: ', ...question.referencias.flatMap((id, position) => [
            ...(position ? [', '] : []),
            element('a', { href: `referencias.html#fuente-${id}` }, [id]),
          ]),
        ])] : []),
      ]),
    ]);
  });
  $('#exam-review').replaceChildren(...nodes);
  paginate($('#exam-review'), nodes, [$('#review-top'), $('#review-bottom')]);
  $('#exam-results-title').focus();
}

async function initialize() {
  const status = $('#exam-load-status');
  const retry = $('#retry-exam-load');
  status.hidden = false;
  status.textContent = 'Cargando simulacro...';
  status.setAttribute('role', 'status');
  retry.hidden = true;
  retry.disabled = true;
  try {
    if (!/^simulacro-[1-9]\d*$/.test(examId ?? '')) throw new Error('Identificador de simulacro no válido');
    const response = await fetch(`data/simulacros/${examId}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.preguntas) && data.preguntas.length === 0) {
      status.textContent = 'Este simulacro todavía no tiene preguntas. Puedes repasar con las tarjetas o el cuestionario mientras tanto.';
      return;
    }
    exam = validateExam(data);
    if (exam.id !== examId) throw new Error('El banco no corresponde a esta página');
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
    retry.hidden = false;
    console.error('Error al cargar el simulacro:', error);
  } finally {
    retry.disabled = false;
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
function cancelSubmission() {
  $('#submit-confirmation').hidden = true;
  if (!checkExpiration()) focusQuestion();
}
$('#cancel-submit').addEventListener('click', cancelSubmission);
$('#retry-exam-load').addEventListener('click', initialize);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('#submit-confirmation').hidden) {
    event.preventDefault();
    cancelSubmission();
  }
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
