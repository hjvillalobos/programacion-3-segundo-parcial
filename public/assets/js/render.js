import { materialLink } from './routes.js';

// El formato enriquecido admite texto y elementos limitados, nunca HTML ejecutable.
const allowedTags = new Set(['p', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'br', 'small']);
const allowedAttributes = new Set(['href', 'target', 'rel', 'class']);

export function element(tag, attributes = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  node.append(...children);
  return node;
}

export function richContent(blocks) {
  return blocks.map((block) => {
    if (typeof block === 'string') return document.createTextNode(block);
    if (!allowedTags.has(block.tipo)) throw new Error('Tipo de contenido no permitido');

    const attributes = { ...block.atributos };
    Object.entries(attributes).forEach(([name, value]) => {
      if (!allowedAttributes.has(name)) throw new Error('Atributo no permitido');
      if (name === 'href' && !/^(https?:\/\/|#[\w-]+$)/i.test(value)) {
        throw new Error('Enlace no permitido');
      }
    });
    if (attributes.href?.startsWith('#')) attributes.href = materialLink(attributes.href.slice(1));
    return element(block.tipo, attributes, richContent(block.contenido));
  });
}

function article(item, children) {
  return element('article', { class: 'item', id: item.id }, [
    element('h3', {}, [item.titulo]),
    ...children,
  ]);
}

function details(summary, blocks) {
  return element('details', {}, [element('summary', {}, [summary]), ...richContent(blocks)]);
}

export function renderCards(items) {
  return items.map((item) => article(item, [
    element('p', { class: 'meta' }, [item.meta]),
    details('Ver reverso', item.respuesta),
  ]));
}

export function renderQuestions(items) {
  return items.map((item) => {
    const answer = item.opciones
      ? item.opciones.map((option) => element('p', {}, [element('label', {}, [
        element('input', { type: 'radio', name: item.id, value: option.valor }),
        ...richContent(option.contenido),
      ])]))
      : [element('label', { class: 'answerbox' }, [
        'Mi respuesta',
        element('textarea', { 'aria-label': `Respuesta P${item.id.slice(1).padStart(2, '0')}` }),
      ])];

    return article(item, [
      element('p', { class: 'meta' }, [item.meta]),
      ...richContent(item.enunciado),
      ...answer,
    ]);
  });
}

export function renderSolutions(items) {
  return items.map((item) => article(item, [
    details('Ver respuesta y explicación', item.respuesta),
    element('p', { class: 'meta' }, [
      element('a', { href: materialLink(item.pregunta) }, ['Volver a la pregunta']),
    ]),
  ]));
}

export function renderSources(items) {
  return items.map((item) => element('p', { id: item.id }, richContent(item.contenido)));
}

function referenceLinks(ids) {
  return ids.flatMap((id, index) => [
    ...(index ? [', '] : []),
    element('a', { href: materialLink(id) }, [
      `${id[0].toUpperCase()}${id.slice(1).padStart(2, '0')}`,
    ]),
  ]);
}

export function renderCoverage(items) {
  return [element('table', {}, [
    element('thead', {}, [element('tr', {}, [
      ...['Subtema', 'Tarjetas', 'Preguntas'].map((title) => element('th', { scope: 'col' }, [title])),
    ])]),
    element('tbody', {}, items.map((item) => element('tr', {}, [
      element('td', {}, [item.subtema]),
      element('td', {}, referenceLinks(item.tarjetas)),
      element('td', {}, referenceLinks(item.preguntas)),
    ]))),
  ])];
}
