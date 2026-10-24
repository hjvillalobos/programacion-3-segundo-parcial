import { element } from './render.js';

export function paginate(container, nodes, controls, { pageSize = 10, targetId = '', onNavigate = () => {} } = {}) {
  const totalPages = Math.max(1, Math.ceil(nodes.length / pageSize));
  let currentPage = 1;

  function show(page) {
    const currentButtons = [];
    currentPage = Math.max(1, Math.min(totalPages, page));
    const start = (currentPage - 1) * pageSize;
    // Conservar los nodos mantiene lo escrito al cambiar de grupo.
    nodes.forEach((node, index) => { node.hidden = index < start || index >= start + pageSize; });
    controls.forEach((control, controlIndex) => {
      const previous = pageButton('Anterior', currentPage - 1, controlIndex);
      previous.disabled = currentPage === 1;
      const next = pageButton('Siguiente', currentPage + 1, controlIndex);
      next.disabled = currentPage === totalPages;
      const pages = Array.from({ length: totalPages }, (_, index) => {
        const button = pageButton(String(index + 1), index + 1, controlIndex);
        button.setAttribute('aria-label', `Página ${index + 1}`);
        if (index + 1 === currentPage) {
          button.setAttribute('aria-current', 'page');
          currentButtons[controlIndex] = button;
        }
        return button;
      });
      control.replaceChildren(
        element('span', { class: 'page-count', ...(controlIndex === 0 ? { role: 'status' } : {}) }, [
          `${nodes.length ? start + 1 : 0} a ${Math.min(start + pageSize, nodes.length)} de ${nodes.length}`,
        ]),
        previous, ...pages, next,
      );
    });
    return currentButtons;
  }

  function pageButton(label, page, controlIndex) {
    const button = element('button', { type: 'button' }, [label]);
    button.addEventListener('click', () => {
      const currentButtons = show(page);
      onNavigate(nodes[(currentPage - 1) * pageSize]?.id);
      container.scrollIntoView();
      currentButtons[controlIndex].focus();
    });
    return button;
  }

  function reveal(id) {
    const index = nodes.findIndex((node) => node.id === id);
    if (index !== -1) show(Math.floor(index / pageSize) + 1);
  }

  show(1);
  reveal(targetId);
  return { reveal };
}
