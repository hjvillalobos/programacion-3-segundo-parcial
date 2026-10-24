import { element, renderCards, renderQuestions, renderSolutions, renderSources, renderCoverage, richContent } from './render.js';
import { pageForId } from './routes.js';
import { paginate } from './pagination.js';
import { mountStudyFilters } from './study-filters.js';

const loadingMessage = document.querySelector('#estado-carga')?.textContent || 'Cargando material de estudio...';
const materialViews = new Map();

function currentTargetId() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return '';
  }
}

async function loadMaterial() {
  const status = document.querySelector('#estado-carga');
  const retry = document.querySelector('#retry-material');
  status.hidden = false;
  status.textContent = loadingMessage;
  status.setAttribute('role', 'status');
  if (retry) {
    retry.hidden = true;
    retry.disabled = true;
  }
  try {
    const sections = [
      ['introduccion', '#introduccion', richContent],
      ['tarjetas', '#lista-tarjetas', renderCards],
      ['preguntas', '#lista-preguntas', renderQuestions],
      ['soluciones', '#lista-soluciones', renderSolutions],
      ['cobertura', '#tabla-cobertura', renderCoverage],
      ['fuentes', '#lista-fuentes', renderSources],
    ].filter(([, selector]) => document.querySelector(selector));
    const loaded = await Promise.all(sections.map(async ([file, selector, render]) => {
      const response = await fetch(`data/${file}.json`);
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      const items = await response.json();
      if (!Array.isArray(items)) throw new Error(`${file}: formato no válido`);
      const nodes = items.length ? render(items) : [element('p', { class: 'empty-state', role: 'status' }, [
        'Todavía no hay contenido en esta sección. Puedes repasar con el material de las otras secciones.',
      ])];
      return [selector, nodes, items.length > 0, items];
    }));
    materialViews.clear();
    loaded.forEach(([selector, nodes, hasContent, items]) => {
      const container = document.querySelector(selector);
      container.replaceChildren(...nodes);
      const controls = document.querySelectorAll(`[data-pagination-for="${selector.slice(1)}"]`);
      const form = document.querySelector(`[data-study-for="${selector.slice(1)}"]`);
      if (form) form.hidden = true;
      controls.forEach((control) => { control.hidden = !hasContent; });
      if (controls.length && hasContent) {
        const options = {
          targetId: currentTargetId(),
          onNavigate: (id) => history.replaceState(null, '', `#${id}`),
        };
        materialViews.set(selector, form
          ? mountStudyFilters({ items, nodes, container, controls, form, ...options })
          : paginate(container, nodes, controls, options));
      }
    });
    status.hidden = true;
    document.querySelectorAll('[data-print-answers]').forEach((button) => {
      button.disabled = !loaded.some(([, , hasContent]) => hasContent);
    });
  } catch (error) {
    status.textContent = 'No se pudo cargar el material. Comprueba tu conexión y recarga la página.';
    status.setAttribute('role', 'alert');
    if (retry) retry.hidden = false;
    console.error('Error al cargar el material:', error);
  } finally {
    if (retry) retry.disabled = false;
  }
}

function scrollToInitialTarget() {
  // Esperar la carga inicial evita competir con el desplazamiento del navegador.
  const id = currentTargetId();
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
}

// Compatibilidad con direcciones antiguas de la página única, como index.html#p41.
let legacyPage = '';
if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
  try {
    legacyPage = pageForId(decodeURIComponent(location.hash.slice(1)));
  } catch {
    // Un fragmento mal codificado no impide usar la portada.
  }
}
if (legacyPage) location.replace(`${legacyPage}${location.hash}`);

loadMaterial().then(() => {
  if (document.readyState === 'complete') scrollToInitialTarget();
  else window.addEventListener('load', scrollToInitialTarget, { once: true });
});

window.addEventListener('hashchange', () => {
  materialViews.forEach((view) => view.reveal(currentTargetId()));
  scrollToInitialTarget();
});

document.querySelector('#retry-material')?.addEventListener('click', () => {
  loadMaterial().then(scrollToInitialTarget);
});

document.querySelectorAll('[data-print-answers]').forEach((button) => {
  button.addEventListener('click', () => {
    const showAnswers = button.dataset.printAnswers === 'true';

    document.querySelectorAll('main details').forEach((details) => {
      details.open = showAnswers;
    });

    window.print();
  });
});
