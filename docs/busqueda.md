# Búsqueda y filtros de estudio

Las páginas de tarjetas y cuestionario permiten combinar una búsqueda con un tema. Los filtros se aplican en el navegador al material que ya está cargado.

## Uso

- Escribe una o varias palabras. No se distinguen mayúsculas ni tildes; `normalizacion` encuentra `normalización`.
- Si escribes varias palabras, cada resultado debe contenerlas todas, aunque aparezcan en partes distintas de su contenido.
- Selecciona un tema o deja Todos los temas. La búsqueda y el tema se combinan.
- El contador indica las coincidencias frente al total del banco. Los grupos siguen siendo de 10 elementos; si hay 10 coincidencias o menos, se oculta la paginación.
- Limpiar filtros restaura todo el material y devuelve el foco al buscador. Si no hay coincidencias, aparece un mensaje con esa acción disponible.

En tarjetas, la búsqueda incluye el título, los datos del tema y el texto del reverso. En el cuestionario incluye el título, el tema, el enunciado, el código y las opciones visibles; no consulta el solucionario.

## Respuestas y enlaces

Filtrar solo cambia qué elementos están visibles. No se reconstruyen los campos de respuesta ni se borran selecciones o textos. Las respuestas se conservan al cambiar de filtro y de grupo mientras la página permanezca abierta. Salir o recargar sigue teniendo el comportamiento indicado en el cuestionario.

Los filtros se restablecen al cargar de nuevo la página. Si un enlace directo apunta a una pregunta que los filtros actuales ocultan, estos se limpian y aparece su grupo, con un aviso en el contador.

El simulacro y la vista de impresión completa no usan estos filtros.

## Mantenimiento

Los temas se obtienen del primer segmento de `meta`, antes de ` · `. Se muestran los nombres que ya existen en el banco, sin mantener otra lista de temas. Actualmente son Patrones de diseño, Bases de datos y persistencia, e Hilos y comunicación.

`study-search.js` construye un índice de texto sin modificar los datos. `study-filters.js` combina las coincidencias con la paginación y conserva los nodos originales. `main.js` lo activa únicamente en las páginas que declaran un formulario de filtros.

Ejecuta `npm run validate`. Las pruebas cubren normalización, temas, varias palabras, ausencia de resultados, conservación de campos y enlaces a preguntas excluidas por un filtro.
