# Material de estudio

Los archivos de `public/data/` son la fuente del contenido del sitio. `docs/material-estudio.md` es una versión de texto independiente y no se sincroniza automáticamente.

| Archivo | Contenido |
| --- | --- |
| `introduccion.json` | Párrafos introductorios y convenciones |
| `tarjetas.json` | `id`, `titulo`, `meta` y bloques de `respuesta` |
| `preguntas.json` | `id`, `titulo`, `meta`, bloques de `enunciado` y `opciones` cuando corresponda |
| `soluciones.json` | `id`, ID de `pregunta`, `titulo` y bloques de `respuesta` |
| `cobertura.json` | `subtema` y listas de IDs de `tarjetas` y `preguntas` |
| `fuentes.json` | `id` y bloques de `contenido` de cada fuente |
| `simulacros/simulacro-1.json` | Banco independiente del Simulacro I, duración y clave de respuestas |

## Texto con formato

El texto se representa como cadenas. Para párrafos, negrita, enlaces o ejemplos de código se usan bloques con `tipo`, `contenido` y, cuando haga falta, `atributos`. No escribas etiquetas HTML dentro de las cadenas: se muestran como texto literal.

```json
{
  "id": "t51",
  "titulo": "T51. ¿Qué problema resuelve este patrón?",
  "meta": "Patrones de diseño · Base: R1",
  "respuesta": [
    {
      "tipo": "p",
      "contenido": ["Una explicación breve del problema y su solución."]
    },
    {
      "tipo": "p",
      "contenido": [
        { "tipo": "strong", "contenido": ["Ejemplo:"] },
        " Un caso concreto para practicar."
      ]
    }
  ]
}
```

El renderizador admite `p`, `strong`, `em`, `code`, `pre`, `a`, `ul`, `ol`, `li`, `br` y `small`. Los atributos admitidos son `href`, `target`, `rel` y `class`. Los enlaces deben usar HTTP, HTTPS o un destino interno como `#t1`. El renderizador convierte estos destinos en enlaces a su página correspondiente, como `tarjetas.html#t1`. Para enlaces externos en una pestaña nueva usa `target: "_blank"` y `rel: "noopener noreferrer"`.

Para código, coloca un bloque `code` dentro de un bloque `pre`; representa los saltos de línea como `\n`. El texto se inserta con nodos de texto y conserva caracteres como `<`, `>` y `&`.

## Preguntas y enlaces

Una pregunta con `opciones` genera controles de selección única. Cada opción contiene `valor` (por ejemplo, `"0"`) y bloques de `contenido`. Una pregunta sin `opciones` genera un campo de respuesta escrita. Las soluciones se guardan por separado para mantener la sección de autoevaluación.

Los IDs deben ser únicos y estables: `t1` para tarjetas, `p1` para preguntas, `r1` para soluciones y `fuente-R1` para fuentes. Al añadir una pregunta, agrega también su solución y actualiza la cobertura. Si cambia el número de elementos, revisa los totales de la introducción. Los controles de paginación calculan automáticamente los grupos de 10 a partir del número de elementos; la vista de impresión muestra todos.

Los simulacros usan un esquema independiente con opciones identificadas y una clave de corrección. Consulta [simulacro-1.md](simulacro-1.md) antes de editar ese banco; no modifica las 50 preguntas originales del cuestionario de estudio.

## Verificación

Ejecuta `npm run validate` desde la raíz. Las verificaciones cubren archivos y rutas del sitio, enlaces, controles, carga e impresión. `tests/fixtures/contenido-original.json` contiene las huellas del texto y del código anteriores a la migración: sirven para detectar pérdidas accidentales. Si editas el material intencionalmente, revisa los cambios y actualiza estas expectativas junto con los conteos afectados; no regeneres las huellas para ocultar una diferencia inesperada.

Comprueba el resultado mediante el servidor local, incluyendo una dirección con destino directo como `http://127.0.0.1:8000/cuestionario.html#p41`. Debe aparecer el grupo de preguntas 41–50. Revisa también la navegación entre grupos, el regreso desde el solucionario y `imprimir.html`.
