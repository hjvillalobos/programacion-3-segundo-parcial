export function normalizeSearch(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').trim();
}

function plainText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(plainText).join(' ');
  if (content && typeof content === 'object') return plainText(content.contenido);
  return '';
}

export function createStudyIndex(items) {
  return items.map((item) => ({
    id: item.id,
    topic: item.meta.split(' · ')[0].trim(),
    text: normalizeSearch([
      item.id, item.titulo, item.meta,
      plainText(item.enunciado), plainText(item.respuesta),
      ...(item.opciones ?? []).map((option) => plainText(option.contenido)),
    ].join(' ')),
  }));
}

export function findStudyItems(index, query = '', topic = '') {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return index.filter((item) => (!topic || item.topic === topic)
    && terms.every((term) => item.text.includes(term)));
}
