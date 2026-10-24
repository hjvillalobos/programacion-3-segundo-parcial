# Aplicación de AntiSlop

Fecha: 23 de octubre de 2026. Rama: `prograEliseo`.

Modo `during`, elegido por el usuario para esta sesión. Dirección confirmada: material académico, verde oscuro y fondo claro. La configuración para futuras tareas queda en `AGENTS.md`; no se cambió ninguna preferencia global. La lectura de diseño y los motivos de las decisiones están en `DESIGN.md`.

ENERGY 1 / RHYTHM 2 / MOTION 1: presentación tranquila, jerarquía entre práctica y consulta, e interacción sin animaciones decorativas.

## Cambios aplicados

- La portada destaca el simulacro y presenta el material de consulta como índice. Los cinco destinos anteriores siguen disponibles.
- La navegación se pliega con el control Secciones en pantallas estrechas. Existe un enlace para saltar al contenido y Escape cierra el menú.
- Se normalizaron tipografía, márgenes, bordes y radios. Los controles tienen una superficie de al menos 44 píxeles y un indicador de foco visible.
- Las opciones de respuesta se pueden pulsar mediante toda su etiqueta. La paginación conserva las respuestas y devuelve el foco a un control de página existente.
- El material y el simulacro muestran estados de carga, vacío y error. Los errores de carga tienen un botón de reintento.
- El mapa del simulacro añade R a las preguntas respondidas, además del color y su nombre accesible. Escape cierra la confirmación sin terminar el intento.
- El reloj deja de ser fijo en móvil para que no cubra las preguntas cuando se amplía el texto.

Los JSON de `public/data/` y la versión de texto del material no cambiaron respecto del commit inicial `8b56836`. Se comprobó con `git diff`; las pruebas conservan también las huellas de los 150 artículos de estudio y sus ejemplos de código.

## Decisiones y propósito

| Decisión | Propósito |
| --- | --- |
| Un acceso principal al simulacro | Distinguir un intento cronometrado de la lectura libre. |
| Índice textual para las otras secciones | Elegir una tarea sin recorrer tarjetas promocionales idénticas. |
| Marco uniforme para cada pregunta de estudio | Separar ejercicios y mantener una estructura previsible dentro de una misma actividad. |
| Contexto del curso sin mayúsculas espaciadas | Identificar la asignatura sin competir con el título. |
| Verde en la acción principal y en selecciones reales | Señalar qué se puede hacer y qué opción está elegida. |
| Bordes de controles distintos de los divisores | Reconocer elementos interactivos sin oscurecer todas las separaciones. |
| Franjas de resultado con etiqueta textual | Diferenciar correcta, incorrecta y sin responder; el color nunca es la única señal. |
| Tipografía del sistema y monoespaciada en código | Priorizar lectura y conservar el formato de los ejemplos. |
| Un único tema claro | Respetar la dirección expresamente aprobada. |
| Ausencia de imágenes e iconos nuevos | El contenido de estudio y sus estados ya comunican la información necesaria. |

## Evidencia de verificación

`npm run validate`: 24 archivos del sitio comprobados y 14 pruebas aprobadas. Incluye contenido, código, opciones, enlaces, conservación de respuestas, calificación, fecha límite, recuperación y entrega automática.

| Control o estado | Comprobación y resultado |
| --- | --- |
| Secciones | En móvil, Enter abre y Escape cierra; el foco vuelve al resumen del menú. |
| Saltar al contenido | Enter salta la navegación; el siguiente Tab alcanza Preparar simulacro. El foco tiene un contorno de 3 píxeles. |
| Navegación principal | Se recorrieron Tarjetas, Cuestionario, Solucionario, Referencias e Imprimir. Inicio y Simulacro I apuntan a sus páginas reales; Preparar simulacro también se activó. |
| Introducción plegable | El control nativo de detalles permite leer u ocultar la introducción; la carga y los errores quedan fuera del área plegada. |
| Reversos de tarjetas | Se abrió y cerró el reverso con ratón y Enter. |
| Páginas 1 a 5 | Se activaron los cinco números, Anterior y Siguiente. El grupo final mostró 41 a 50 y conservó el foco. |
| Cuestionario | Se seleccionó una opción y se escribió en P31. Ambas respuestas se conservaron al cambiar de grupo y regresar. |
| Solucionario | Se abrió una explicación y Volver a la pregunta llevó a `cuestionario.html#p1`. |
| Cobertura | Se cargaron 48 filas y 27 fuentes. Un enlace a P41 abrió el grupo 41 a 50; el código desplazable no desbordó la página. |
| Impresión | Las dos variantes tienen pruebas que verifican el cambio de detalles y la llamada de impresión. La navegación queda fuera de ese cambio. Ver la limitación de la prueba nativa más abajo. |
| Comenzar simulacro | Enter abrió la primera pregunta y un reloj de 90 minutos. |
| Selección y mapa del intento | Se seleccionó una respuesta, apareció 1 R y el estado accesible respondió a la selección. El mapa llevó a la pregunta 50. |
| Anterior y Siguiente del intento | Cambiaron de pregunta sin perder la selección anterior. |
| Terminar intento | Mostró el número de pendientes antes de confirmar. Seguir respondiendo y Escape volvieron a la pregunta sin terminar el intento. |
| Confirmar entrega | Una correcta, una incorrecta y 48 sin responder dieron 2/100. |
| Revisión de resultados | La explicación mostró la selección incorrecta Bridge y la clave Abstract Factory. La revisión se limita a 10 elementos por grupo. |
| Recargar y repetir | La recarga conservó la nota. Preparar otro intento volvió a la pantalla inicial. Las pruebas verifican un nuevo plazo y respuestas vacías. |
| Error y reintento del simulacro | Un servidor de prueba devolvió 503 una vez. Reintentar carga del simulacro recuperó la pantalla inicial. |
| Error y reintento de tarjetas | El mismo procedimiento recuperó las 50 tarjetas con el botón Reintentar carga. |
| Banco vacío | Con respuestas vacías del servidor de prueba aparecieron mensajes explícitos; no se pudo comenzar un simulacro vacío ni usar una paginación vacía. |
| Tiempo agotado | Las pruebas adelantan el reloj, entregan el intento y rechazan selecciones posteriores al plazo, sin esperar 90 minutos reales. |
| Consola | No hubo errores de JavaScript en el recorrido normal del simulacro. Los errores HTTP inducidos se limitaron al servidor de prueba. |

Los recorridos cubren las familias de controles que se repiten en el material. No implican que se haya revisado manualmente cada opción de cada una de las 150 preguntas y respuestas de estudio; su conservación se verifica automáticamente.

### Reflujo y contraste

El cuestionario con código se verificó a 320, 390, 640, 768, 896 y 1024 píxeles de ancho, sin desbordamiento horizontal. A 320 píxeles no se detectaron botones visibles por debajo de 44 por 44 píxeles. En un área de 320 por 400 píxeles, el campo P41 quedó visible al recibir el foco.

Se verificó texto al 200% con una hoja de preferencia aplicada únicamente por un servidor temporal de pruebas, sin modificar los archivos publicados. El texto del cuerpo midió 32 píxeles. La portada y el simulacro no presentaron desbordamiento horizontal; en 320 píxeles el reloj quedó estático y la opción enfocada permaneció dentro del área visible.

Contraste medido con `contrast-check.py` de la habilidad `antislop-human`:

| Uso | Colores | Razón |
| --- | --- | --- |
| Texto principal | `#19332f` sobre `#fffdf8` | 13.28:1 |
| Texto secundario | `#526762` sobre `#fffdf8` | 5.94:1 |
| Enlace | `#0c695b` sobre `#fffdf8` | 6.48:1 |
| Acción principal | Blanco sobre `#0c695b` | 6.59:1 |
| Acción al pasar el cursor | Blanco sobre `#084e44` | 9.62:1 |
| Texto del panel | `#19332f` sobre `#e5eee6` | 11.38:1 |
| Texto secundario del panel | `#526762` sobre `#e5eee6` | 5.09:1 |
| Enlace sobre panel | `#0c695b` sobre `#e5eee6` | 5.55:1 |
| Error | `#8c2924` sobre `#fffdf8` | 8.41:1 |
| Estado sin responder | `#71500c` sobre blanco | 7.36:1 |
| Código | `#edf7ef` sobre `#152c28` | 13.46:1 |
| Texto deshabilitado | `#526762` sobre `#f0f2ee` | 5.36:1 |
| Borde de control | `#657b73` sobre `#fffdf8` | 4.46:1 |
| Borde sobre panel | `#657b73` sobre `#e5eee6` | 3.82:1 |

El texto supera 4.5:1 y los bordes de controles superan 3:1. Los divisores de contenido no actúan como límites de controles.

La ampliación tipográfica no equivale a una prueba del zoom nativo en todos los navegadores. La altura reducida simula espacio disponible con teclado, pero no sustituye un dispositivo físico. El botón Imprimir con respuestas abrió un diálogo nativo que bloqueó la automatización; se cerró la pestaña temporal. No se verificó una impresión en papel ni un PDF exportado. Estas comprobaciones no constituyen una certificación universal de accesibilidad.

## Delivery Gate

Los estados siguientes corresponden al código y las comprobaciones descritas en este informe.

### Bloque 1: Hard Gate

| Regla o condición | Estado | Evidencia |
| --- | --- | --- |
| R-02, texto sin guiones largos decorativos | PASS | Búsqueda sobre `public/`, documentación y dirección visual sin coincidencias. |
| R-03, reflujo móvil | PASS | Seis anchos, cero desbordamientos de página; controles de al menos 44 píxeles. |
| R-17, cifras reales | PASS | 50 preguntas y 90 minutos proceden del banco existente; la nota se calcula con respuestas reales. |
| R-18, testimonios | PASS | No se añadieron ni existen testimonios ficticios. |
| R-23, recursos y dirección autorizados | PASS | Dirección confirmada; no se añadieron imágenes, identidades ni destinos nuevos. |
| R-24, destinos de navegación | PASS | Páginas existentes y comprobador de rutas relativas. |
| R-25, contraste | PASS | Tabla de mediciones de texto y límites interactivos. |
| R-26, acciones funcionales | PASS | Recorrido por controles y pruebas de impresión, fecha límite y recuperación. |
| R-27, carga, vacío y error | PASS | Pruebas y servidor temporal con 503, recuperación y bancos vacíos. |
| R-28, FAQ | PASS | No se añadió una FAQ. |
| R-32, teclado y foco | PASS | Enter, Tab y Escape; foco visible y restaurado en menú, paginación y confirmación. |
| R-33, implementación directa | PASS | Cambios escritos en HTML, CSS y módulos; ningún script reescribe los archivos del sitio. |
| R-34, temas publicados | PASS | Se conserva únicamente el tema claro aprobado. |
| R-35, aplicación ejecutada | PASS | Sitio servido, recorrido registrado y 14 pruebas; límites de impresión y dispositivos indicados. |
| R-36, afirmaciones comprobables | PASS | Los textos describen funciones existentes, sin inventar rendimiento, clientes ni certificaciones. |
| R-37, dirección previa | PASS | Elección explícita del usuario y `DESIGN.md` anterior a los cambios de interfaz. |
| R-38, contenido real | PASS | Bancos sin cambios y ausencia de relleno presentado como real. |

### Bloque 2: Purpose-Gate

| Técnica | Estado | Motivo o ausencia |
| --- | --- | --- |
| R-01, color | PASS | Verde existente para jerarquía y estados; sin gradientes ni brillos. |
| R-04, iconos | PASS | No se añadió un repertorio de iconos. |
| R-06, tipografía | PASS | Sistema para lectura, monoespaciada en código; motivos en `DESIGN.md`. |
| R-07, fondos | PASS | Papel claro aprobado, sin retículas decorativas. |
| R-08, flechas | PASS | No se añadieron flechas decorativas a las acciones. |
| R-09, etiquetas | PASS | Contexto real del curso y estados reales, sin cápsulas promocionales. |
| R-10, vidrio | PASS | No se usa desenfoque de fondo. |
| R-12, sombras | PASS | No se añaden sombras a los componentes. |
| R-13, resplandores | PASS | El foco usa un contorno definido, no resplandor. |
| R-14, tarjetas | PASS | Portada con jerarquía; marcos de preguntas uniformes por su función de ejercicio. |
| R-19, movimiento | PASS | No se añaden animaciones; los cambios responden a acciones del usuario. |
| R-22, ilustraciones | PASS | No se generaron ilustraciones de relleno. |

### Bloque 3: Liveliness

| Condición | Estado | Evidencia |
| --- | --- | --- |
| Diales explícitos y respetados | PASS | ENERGY 1 / RHYTHM 2 / MOTION 1 en `DESIGN.md`. |
| Punto principal por pantalla | PASS | Simulacro en portada, pregunta en el intento y nota en resultados. |
| Espacio estructural | PASS | Márgenes por sección y escala más ajustada en pantallas estrechas. |
| Acento con función | PASS | Acción principal y selecciones, sin repartir fondos intensos por todos los enlaces. |
| Identidad reconocible | PASS | Contexto académico, índice de repaso, encabezados y papel claro con verde oscuro. |
| Lectura de diseño previa | PASS | Registrada antes de implementar la interfaz. |

### Bloque 4: Craftsmanship y Quality Locks

| Condición | Estado | Evidencia |
| --- | --- | --- |
| C-1 y R-31, intención | PASS | Tabla de decisiones y motivos en `DESIGN.md`. |
| C-2, funcionalidad | PASS | Recorrido registrado y pruebas de acciones y estados. |
| C-3 y R-05, estructura por contenido | PASS | Intento destacado e índice de consulta, sin secciones promocionales añadidas. |
| C-4, resistencia | PASS | Reflujo, ampliación tipográfica, carga fallida y recuperación comprobados. |
| C-5, evidencia | PASS | Banco real, cifras existentes y ninguna afirmación inventada. |
| R-11, radios | PASS | 4 píxeles en controles y 6 en marcos; sin tratamiento de cápsula generalizado. |
| R-15 y R-16, acciones y textos | PASS | Preparar simulacro, Comenzar simulacro y Terminar intento nombran acciones concretas. |
| R-20, identidad | PASS | Se conserva la dirección académica solicitada, con jerarquía de estudio. |
| R-21, tema | PASS | Fondo claro elegido por el usuario, sin un segundo tema incompleto. |
| R-29, paleta | PASS | Verde oscuro, neutros y colores semánticos limitados a resultados. |
| R-30, originalidad | PASS | No se tomó como plantilla otro producto. |

Los cambios de comentarios se limitaron a quitar una narración redundante antes del control de impresión. Se conservaron las notas que explican plazos, orden estable, seguridad del renderizado y conservación de nodos.

## Ampliación: búsqueda y filtros, 24 de octubre de 2026

Se mantiene el modo `during` elegido para esta sesión y la dirección de `DESIGN.md`: material académico, verde oscuro, fondo claro y diales ENERGY 1 / RHYTHM 2 / MOTION 1.

La búsqueda y el selector de tema comparten un formulario con etiquetas visibles. Los controles se apilan en móvil, pasan a dos columnas en el ancho intermedio y a una fila en escritorio. Se reutilizan los colores, los bordes y los indicadores de foco del sitio. No se añadieron recursos visuales ni se cambiaron los bancos.

| Control o condición | Comprobación |
| --- | --- |
| Búsqueda combinada | JDBC más Bases de datos y persistencia mostró 3 de 50 tarjetas y 4 de 50 preguntas. |
| Tildes y mayúsculas | NORMALIZACIÓN y normalizacion encontraron la misma tarjeta T20 con ese tema. |
| Enter | Aplicó el formulario sin navegar ni recargar la página. |
| Sin coincidencias | Se mostraron cero resultados y un mensaje; la paginación quedó oculta. |
| Limpiar filtros | Restauró los 50 elementos y el foco volvió al buscador. |
| Paginación filtrada | El tema de bases de datos mostró 18 preguntas; Siguiente presentó de la 11 a la 18, con 8 elementos visibles. |
| Respuestas conservadas | Una opción de P1 y el texto de P31 se conservaron al buscar, cambiar de tema, limpiar y volver al grupo. |
| Enlace directo | Con Observer y Patrones seleccionados, el enlace a P49 limpió los filtros, mostró el grupo correspondiente y conservó lo escrito. |
| Teclado | Tab pasó del buscador al selector de tema; se observó un contorno de foco de 3 píxeles. |
| Reflujo | A 320, 390, 640, 768, 896 y 1024 píxeles no hubo desbordamiento horizontal ni controles de filtro menores de 44 por 44 píxeles. |
| Consola | Sin errores en el recorrido de búsqueda y filtros. |
| Verificación automatizada | `npm run validate`: 26 archivos del sitio y 20 pruebas aprobadas. |

Se midieron también los colores de los campos sobre blanco: texto principal 13.50:1, texto de ayuda y placeholder 6.04:1 y borde de control 4.53:1. El texto supera 4.5:1 y el borde supera el mínimo de 3:1 para controles.

Delivery Gate para esta ampliación:

- Hard Gate: PASS. Estados vacío y cargado, teclado, foco, contraste y reflujo comprobados; los errores de carga conservan su reintento.
- Purpose-Gate: PASS. Los campos reutilizan el sistema existente y resuelven la búsqueda del material, sin decoración nueva.
- Liveliness: PASS. Se conservan los diales y la jerarquía entre filtros y preguntas.
- Craftsmanship y Quality Locks: PASS. Datos sin cambios, enlaces directos accesibles, respuestas conservadas y 20 pruebas aprobadas.

## Ampliación: Simulacro II, 24 de octubre de 2026

Modo during, por elección de esta sesión. Se conserva la dirección académica de DESIGN.md y ENERGY 1 / RHYTHM 2 / MOTION 1. La portada reúne los dos intentos en una sección: el acceso al II es la acción principal y el I conserva su enlace. No se añadieron imágenes, iconos ni fuentes.

Se agregó un banco original de 50 preguntas autorizado por el usuario, con explicaciones al entregar. Los bancos anteriores permanecen sin cambios. Cada simulacro identifica su banco y su almacenamiento; el motor comprueba que la página y el banco coincidan.

Verificaciones realizadas:

- Navegador: una correcta, una incorrecta y 48 omitidas dieron 2/100. La revisión mostró explicación y enlace R7; recargar conservó la nota.
- Reiniciar permitió comenzar con 90:00. Comenzar mediante Enter funcionó. Al visitar el I y volver al II se recuperó su intento con el tiempo transcurrido.
- Portada y revisión sin desbordamiento horizontal a 320, 390, 768 y 1024 píxeles. Los dos accesos de portada midieron 44 píxeles de alto.
- Se conservaron los colores y reglas de foco existentes. El botón principal usa blanco sobre #0c695b; no se introdujeron combinaciones nuevas. Se inspeccionaron la portada y el estado anterior al comienzo mediante capturas.
- Sin advertencias ni errores de consola durante el recorrido. Los fallos de carga y almacenamiento se cubren mediante las pruebas de pantalla de ambos bancos.
- npm run validate: 28 archivos publicables y 23 pruebas aprobadas, incluida la conservación de la clave del otro simulacro al reiniciar.

Delivery Gate:

- Hard Gate: PASS. Contenido identificado como práctica original, navegación funcional, etiquetas existentes, contraste conservado, teclado y reflujo revisados.
- Purpose-Gate: PASS. Dos acciones explícitas permiten elegir el banco. El verde conserva la jerarquía; no hay decoración nueva.
- Liveliness: PASS. Diales conservados, foco principal en la práctica, separación entre instrucciones, pregunta y resultados; voz académica compartida.
- Craftsmanship y Quality Locks: PASS. Corrección por IDs, explicaciones posteriores a la entrega, recuperación independiente y pruebas de ambos simulacros. Sin cambios en preguntas o claves anteriores.
