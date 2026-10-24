# Simulacro I

El banco `public/data/simulacros/simulacro-1.json` contiene 50 preguntas de selección única, con cuatro opciones, una respuesta correcta y una explicación por pregunta.

`numeroOriginal` conserva la numeración interna del banco. `id` identifica la pregunta y cada opción tiene su propio `id`; `correcta` referencia uno de estos identificadores, nunca la posición visual de una opción.

La duración acordada es de **90 minutos**. Cada pregunta vale un punto. La nota sobre 100 es `aciertos / 50 × 100`; los errores y las preguntas sin responder no suman puntos ni generan penalizaciones adicionales.

Las explicaciones aclaran las formulaciones simplificadas y las condiciones de cada respuesta.

Las 50 preguntas incluyen ahora una explicación y referencias del catálogo de estudio, visibles después de entregar. Estos campos complementan las preguntas: no cambian IDs, enunciados, opciones ni claves. La versión permanece en 1 porque los intentos existentes siguen siendo compatibles.

Las explicaciones aclaran los límites de formulaciones simplificadas: las sobrecargas de getConnection (22), el modelo de hilo por cliente (25), la coordinación de lista y salidas durante broadcast (26), las distintas señales de fin de flujo (40) y el papel de main y EDT durante el arranque de Swing (49).

Se contrastaron esos casos con [DriverManager](https://docs.oracle.com/javase/8/docs/api/java/sql/DriverManager.html), [ObjectInputStream](https://docs.oracle.com/javase/8/docs/api/java/io/ObjectInputStream.html), [InputStream](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html) y [los hilos iniciales de Swing](https://docs.oracle.com/javase/tutorial/uiswing/concurrency/initial.html). Las aclaraciones describen el contrato técnico sin sustituir la respuesta del simulacro.

## Funcionamiento

- La página `simulacro-1.html` carga solamente su banco JSON. El cronómetro empieza al pulsar **Comenzar simulacro**.
- Cada intento mezcla las 50 preguntas y, por separado, las cuatro opciones de cada pregunta mediante Fisher–Yates. El orden permanece estable durante el intento. La calificación usa los IDs de las opciones y no sus letras o posiciones en pantalla.
- Se muestra una pregunta a la vez, con controles Anterior/Siguiente y un mapa para saltar a cualquier pregunta. Es posible revisar y cambiar selecciones antes de entregar.
- **Terminar intento** muestra la cantidad de preguntas pendientes y permite confirmar la entrega o seguir respondiendo. El tiempo continúa mientras se confirma.
- El plazo es una fecha límite absoluta, no un contador de intervalos. Una recarga o una pestaña en segundo plano no reinician ni pausan los 90 minutos. Al detectar que el plazo venció, la aplicación entrega antes de admitir más respuestas.
- Al finalizar, las selecciones quedan cerradas. Se muestra la nota sobre 100, los totales de correctas, incorrectas y sin responder y el tiempo empleado. La revisión, paginada de 10 en 10, muestra la selección y la respuesta correcta de cada pregunta.
- **Preparar otro intento** vuelve a la pantalla inicial. El siguiente intento comienza sin respuestas y con un nuevo orden y un nuevo plazo.

## Recuperación del intento

El orden, las selecciones, la pregunta actual y las fechas se guardan en `sessionStorage` bajo la clave `progra3:simulacro-1:intento:v1`. El intento se recupera en la misma pestaña, incluidos los resultados entregados. Si el almacenamiento no está disponible, se muestra un aviso y se puede seguir trabajando mientras permanezca abierta la página.

Los datos guardados se validan contra los IDs y la versión del banco. Si se modifica el banco de manera incompatible, incrementa `version` para descartar intentos anteriores. Un intento vencido se entrega al recuperar la página. No hay cuentas ni sincronización entre dispositivos.

La evaluación se realiza en el navegador, con la clave incluida en el banco del sitio estático. Esta sección es una herramienta de práctica y no una evaluación supervisada.

## Verificación

Ejecuta `npm run validate`. Las pruebas comprueban las 50 preguntas, la mezcla sin pérdida de IDs, la nota máxima y parcial, las preguntas pendientes, el vencimiento exacto, el bloqueo posterior a la entrega y la recuperación del intento. También se prueba la entrega automática de la pantalla sin esperar 90 minutos reales.

Para revisar manualmente, inicia el servidor local con la carpeta `public/` y abre `simulacro-1.html`. Responde algunas preguntas, cambia de posición, recarga y entrega. Confirma que las respuestas mantienen sus selecciones y que la nota coincide con los aciertos.
