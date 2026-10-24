import { element } from './render.js';
import { paginate } from './pagination.js';
import { createStudyIndex, findStudyItems } from './study-search.js';

export function mountStudyFilters({ items, nodes, container, controls, form, targetId = '', onNavigate }) {
  const index = createStudyIndex(items);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const query = form.querySelector('[name="q"]');
  const topic = form.querySelector('[name="topic"]');
  const clear = form.querySelector('[data-clear-filters]');
  const count = form.querySelector('[data-filter-count]');
  const empty = form.querySelector('[data-filter-empty]');
  const topics = [...new Set(index.map((item) => item.topic))].sort((left, right) => left.localeCompare(right, 'es'));
  topic.replaceChildren(element('option', { value: '' }, ['Todos los temas']),
    ...topics.map((name) => element('option', { value: name }, [name])));
  query.value = '';
  topic.value = '';
  let matches = [];
  let pages;

  function apply(target = '', notice = '') {
    matches = findStudyItems(index, query.value, topic.value);
    nodes.forEach((node) => { node.hidden = true; });
    const matchingNodes = matches.map((item) => nodesById.get(item.id));
    controls.forEach((control) => { control.hidden = matchingNodes.length <= 10; });
    pages = matchingNodes.length ? paginate(container, matchingNodes, controls, {
      targetId: target, onNavigate,
    }) : null;
    empty.hidden = matches.length > 0;
    clear.disabled = query.value === '' && topic.value === '';
    count.textContent = `${matches.length} de ${items.length} ${form.dataset.itemLabel}. ${notice}`.trim();
  }

  function clearFilters(target = '', notice = '') {
    query.value = '';
    topic.value = '';
    apply(target, notice);
  }

  query.oninput = () => apply();
  topic.onchange = () => apply();
  clear.onclick = () => {
    clearFilters();
    query.focus();
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    apply();
  };
  apply(targetId);
  form.hidden = false;

  return {
    reveal(id) {
      if (!nodesById.has(id)) return;
      if (!matches.some((item) => item.id === id)) {
        clearFilters(id, 'Se restablecieron los filtros para mostrar la pregunta enlazada.');
      } else {
        pages.reveal(id);
      }
    },
  };
}
