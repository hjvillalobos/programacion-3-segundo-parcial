import { renderCards, renderQuestions, renderSolutions, renderSources, renderCoverage, richContent } from './render.js';
import { pageForId } from './routes.js';
import { paginate } from './pagination.js';

function currentTargetId() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return '';
  }
}

async function loadMaterial() {
  const status = document.querySelector('#estado-carga');
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
      return [selector, render(await response.json())];
    }));
    loaded.forEach(([selector, nodes]) => {
      const container = document.querySelector(selector);
      container.replaceChildren(...nodes);
      const controls = document.querySelectorAll(`[data-pagination-for="${selector.slice(1)}"]`);
      if (controls.length) {
        const pages = paginate(container, nodes, controls, {
          targetId: currentTargetId(),
          onNavigate: (id) => history.replaceState(null, '', `#${id}`),
        });
        window.addEventListener('hashchange', () => {
          pages.reveal(currentTargetId());
          scrollToInitialTarget();
        });
      }
    });
    status.hidden = true;
    document.querySelectorAll('[data-print-answers]').forEach((button) => {
      button.disabled = false;
    });
  } catch (error) {
    status.textContent = 'No se pudo cargar el material. Comprueba tu conexión y recarga la página.';
    status.setAttribute('role', 'alert');
    console.error('Error al cargar el material:', error);
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

// Preparar las tarjetas y soluciones antes de abrir la impresión.
document.querySelectorAll('[data-print-answers]').forEach((button) => {
  button.addEventListener('click', () => {
    const showAnswers = button.dataset.printAnswers === 'true';

    document.querySelectorAll('details').forEach((details) => {
      details.open = showAnswers;
    });

    window.print();
  });
});
