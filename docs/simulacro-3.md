# Simulacro III · EIF205 Estructuras de Datos

Este simulacro corresponde al curso **EIF205 Estructuras de Datos**, no a Programación 3 (EIF206). Comparte el motor de los simulacros I y II, pero su contenido es independiente del resto del sitio. Por eso no tiene tarjetas, cuestionario ni referencias al catálogo de EIF206.

Contiene 31 preguntas de grafos y recorridos, representación de grafos, árboles binarios, árboles AVL y Red-Black, hashing y backtracking. Dura 90 minutos.

## Tipos de pregunta

El banco usa el campo `tipo` de cada pregunta. Las preguntas sin `tipo` son de selección única, por lo que los simulacros I y II no cambian.

| `tipo` | Respuesta | Puntaje |
| --- | --- | --- |
| `unica` (por defecto) | Una opción; `correcta` es su `id`. El verdadero o falso usa las opciones `v` y `f` con `mezclarOpciones: false` | 1 o 0 |
| `multiple` | Casillas; `correctas` lista los `id` de las opciones correctas y `seleccionar` indica cuántas marcar | 1 si coincide exactamente; 0 en otro caso |
| `campos` | Uno o varios campos de `texto` o de `lista` desplegable; cada campo tiene `etiqueta` y `respuestas` aceptadas | Proporción de campos correctos (crédito parcial) |

Los campos de texto se comparan sin distinguir mayúsculas, tildes ni espacios, y los guiones tipográficos cuentan como `-`. Así, `35 - 31 - 47` equivale a `35-31-47`. En las tablas hash, las posiciones vacías se responden con `-`.

`alternativas` admite otras soluciones completas. Por ejemplo, en la pregunta de permutaciones, `actual.pop()` y `usados[i] = False` pueden escribirse en cualquier orden. El puntaje es el mejor entre la clave y sus alternativas.

La nota sobre 100 es la suma de los puntajes dividida entre 31. La revisión marca cada pregunta como correcta, parcialmente correcta (con su porcentaje), incorrecta o sin responder, y compara campo por campo en las preguntas por campos.

## Figuras

Los grafos y los árboles son SVG generados por `scripts/figuras-simulacro-3.mjs` a partir de las aristas de cada enunciado. Para cambiarlos, edita ese script y ejecuta:

```sh
node scripts/figuras-simulacro-3.mjs
```

Cada `figura` del banco tiene `src` y un texto `alt` que describe todas las aristas, o los colores en los árboles Red-Black. Así la pregunta puede responderse sin ver la imagen.

## Verificación de las claves

`tests/exam-3.test.mjs` recalcula de forma independiente cada clave verificable con algoritmos de referencia y falla si alguna no coincide:

- DFS y BFS con vecinos en orden ascendente, predecesores de BFS, orden topológico y clasificación de aristas.
- Inserciones AVL con conteo de rotaciones simples y dobles, preorden y altura.
- Reglas Red-Black, función `misterio` sobre el BST y reconstrucción desde preorden e inorden.
- Double hashing, quadratic probing, colisiones y posiciones alcanzables con `k % 64`.
- Coloreo con backtracking y cantidad de hojas del árbol de permutaciones.

También comprueba el crédito parcial, las alternativas, la normalización y el rechazo de respuestas inválidas.

## Archivos y recuperación

- Página: `public/simulacro-3.html`.
- Banco: `public/data/simulacros/simulacro-3.json`.
- Figuras: `public/assets/img/simulacro-3/`.
- Identificador de página: `data-exam-id="simulacro-3"`.
- Clave de sesión: `progra3:simulacro-3:intento:v1`.

El intento se guarda y se recupera igual que en los otros simulacros, con una clave propia que no interfiere con ellos.
