# Programación 3 · Segundo parcial

Material de estudio para EIF206: 50 tarjetas didácticas y 50 preguntas con solucionario explicado.

## Contenido

- Patrones de diseño: 15 tarjetas y 15 preguntas.
- Bases de datos y persistencia: 18 tarjetas y 18 preguntas.
- Hilos, concurrencia y comunicación cliente-servidor con sockets: 17 tarjetas y 17 preguntas.
- Ejercicios de Java y SQL, referencias y tabla de cobertura.

El cuestionario incluye 20 preguntas de selección única, 10 de verdadero o falso, 10 de respuesta corta y 10 ejercicios de código o casos prácticos.

## Uso

Visita el sitio de GitHub Pages de este repositorio o inicia un servidor local como se indica abajo. La portada ofrece accesos a cada sección:

| Página | Uso |
| --- | --- |
| `index.html` | Portada y explicación del material, plegada por defecto |
| `tarjetas.html` | Tarjetas en grupos de 10 |
| `cuestionario.html` | Preguntas en grupos de 10 |
| `solucionario.html` | Respuestas explicadas en grupos de 10 |
| `simulacro-1.html` | 50 preguntas del examen anterior, 90 minutos y calificación automática |
| `referencias.html` | Cobertura del temario y fuentes |
| `imprimir.html` | Todo el material, con impresión con o sin respuestas |

Las tarjetas y las soluciones se despliegan al pulsarlas. Cambiar de grupo conserva las respuestas escritas mientras sigas en el cuestionario; cerrar, recargar o salir de esa página las borra. El enlace para abrir el solucionario en otra pestaña permite revisar las explicaciones sin abandonar el cuestionario.

Cada página carga únicamente los JSON que necesita. Las direcciones directas, como `cuestionario.html#p41`, muestran automáticamente el grupo correspondiente. Las direcciones antiguas, como `index.html#p41`, redirigen a la nueva página.

El **Simulacro I** es independiente del cuestionario de estudio: mezcla las preguntas y sus opciones en cada intento. Al entregar o vencer los 90 minutos, muestra la nota sobre 100 y la revisión de correctas, incorrectas y sin responder. El intento y su reloj se recuperan al recargar la misma pestaña. Consulta [docs/simulacro-1.md](docs/simulacro-1.md) para los detalles y la procedencia del banco.

`docs/material-estudio.md` contiene una versión de texto editable.

## Estructura y desarrollo

```text
public/                    Archivos que se publican en GitHub Pages
  *.html                   Portada, secciones de estudio y vista de impresión
  assets/css/styles.css    Estilos compartidos
  assets/js/               Carga, renderizado, rutas y paginación
  data/                    Material de estudio en JSON
docs/                      Guía del contenido y versión de texto del material
scripts/                   Verificación de archivos y rutas del sitio
tests/                     Pruebas automatizadas
  fixtures/                Huellas del contenido original
.github/workflows/         Validación y publicación en GitHub Pages
package.json               Comandos de desarrollo, sin dependencias externas
```

El sitio usa HTML, CSS y JavaScript nativos, sin dependencias externas ni compilación. Con Python instalado, ejecuta `python -m http.server 8000 --bind 127.0.0.1 --directory public` desde la raíz y visita `http://127.0.0.1:8000`. No abras el archivo mediante `file://`: la carga de JSON y los módulos JavaScript requieren HTTP. Debes tener JavaScript habilitado.

Mantén los estilos en `public/assets/css/`, el comportamiento en `public/assets/js/` y el material en `public/data/`. El script principal se carga como módulo, después de analizar el documento. No agregues estilos ni manejadores de eventos en línea. Consulta [docs/contenido.md](docs/contenido.md) para editar el material.

Para las verificaciones necesitas Node.js 24 o superior. Desde la raíz ejecuta:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run validate
```

`npm run check` verifica los archivos publicables, el JSON, la sintaxis de JavaScript y las rutas locales, simulando una subcarpeta de Pages. `npm test` comprueba el contenido, la paginación, los enlaces, la carga, la impresión y el simulacro cronometrado. `npm run validate` ejecuta ambos comandos. `npm ci` prepara el proyecto según el lockfile; actualmente no hay paquetes externos que descargar.

La rama `eliseo` contiene esta reorganización. Trabaja con commits pequeños, cada uno dedicado a un cambio concreto. Antes de cada commit, revisa `git diff --check` y ejecuta `npm run validate`. Comprueba también la página, las tarjetas y ambos botones de impresión en el navegador. Node solo se usa para verificar el proyecto; el sitio publicado no necesita un servidor Node.

`.editorconfig` define el formato y `.gitattributes` mantiene finales de línea LF. `.gitignore` excluye configuración local del editor, dependencias, archivos generados y variables de entorno.

## Publicación con GitHub Pages

La carpeta publicable es `public/`: contiene todos los archivos necesarios para el sitio. Los documentos, las pruebas y la configuración de desarrollo quedan fuera de ella.

El workflow [pages.yml](.github/workflows/pages.yml) valida los pushes de cualquier rama y los pull requests dirigidos a `main`. Solo publica desde `main`, después de pasar las verificaciones, y también permite una ejecución manual desde Actions. Para activarlo, selecciona **Settings → Pages → Build and deployment → Source → GitHub Actions** e integra los commits de `eliseo` en `main`.

Consulta [docs/despliegue.md](docs/despliegue.md) para la configuración inicial y la comprobación del despliegue.

## Interfaz y mantenimiento

`DESIGN.md` recoge la dirección visual aprobada: material académico, verde oscuro y fondo claro. `AGENTS.md` registra el uso de AntiSlop para futuras tareas. Las decisiones y las comprobaciones de interfaz, contraste y teclado están en [docs/anti-slop.md](docs/anti-slop.md).

## Fuentes

El material toma como base las clases 7, 8, 9, 10 y 11 del curso aportadas por el estudiante, y amplía patrones de diseño y sockets con documentación técnica. Las referencias completas y la distinción entre materia de las clases y contenido complementario están dentro del material. Los PDF originales no se incluyen en este repositorio.

Preparado para practicar; no es un cuestionario oficial del profesor.
