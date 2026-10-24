// Archivos reales y rutas relativas: funcionan dentro de un repositorio en Pages.
export function pageForId(id) {
  if (/^t\d+$/.test(id) || id === 'tarjetas') return 'tarjetas.html';
  if (/^p\d+$/.test(id) || id === 'cuestionario') return 'cuestionario.html';
  if (/^r\d+$/.test(id) || id === 'solucionario') return 'solucionario.html';
  if (/^fuente-[\w-]+$/.test(id) || ['cobertura', 'fuentes'].includes(id)) return 'referencias.html';
  return '';
}

export function materialLink(id) {
  return `${pageForId(id)}#${id}`;
}
