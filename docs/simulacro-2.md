# Simulacro II

Banco de práctica basado en el temario existente, independiente del Simulacro I.

Contiene 50 preguntas de selección única, con cuatro opciones por pregunta: 15 de patrones, 18 de bases de datos y persistencia, y 17 de hilos y comunicación. Dura 90 minutos. Cada acierto aporta 2 puntos a la nota sobre 100; las incorrectas y las omitidas aportan cero.

Las preguntas y las opciones se mezclan al comenzar. La corrección usa los IDs estables, no la posición de las opciones. Las explicaciones y los enlaces a las fuentes aparecen en la revisión después de entregar o vencer el tiempo.

## Archivos y recuperación

- Página: `public/simulacro-2.html`.
- Banco: `public/data/simulacros/simulacro-2.json`.
- Motor compartido: `exam.js` y `exam-page.js`.
- Identificador de página: `data-exam-id="simulacro-2"`.
- Clave de sesión: `progra3:simulacro-2:intento:v1`.

El Simulacro I utiliza otra clave. Navegar entre ambos en la misma pestaña conserva cada intento y su plazo; el reloj sigue corriendo. Reiniciar uno no elimina el otro. El almacenamiento es por sesión del navegador, sin cuentas ni servidor. Las claves de respuestas se distribuyen con el sitio estático: es una herramienta de práctica.

## Revisión técnica

Las referencias de cada pregunta corresponden a los IDs del catálogo existente. Para los contratos específicos se consultó la documentación primaria de Java:

- [Thread: start, join, sleep e interrupción](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html).
- [Espera protegida y comprobación de condiciones](https://docs.oracle.com/javase/tutorial/essential/concurrency/guardmeth.html).
- [Socket: tiempos de conexión y lectura](https://docs.oracle.com/javase/8/docs/api/java/net/Socket.html).
- [BufferedReader: fin de flujo y readLine](https://docs.oracle.com/javase/8/docs/api/java/io/BufferedReader.html).
- [ServerSocket: cierre durante accept](https://docs.oracle.com/javase/8/docs/api/java/net/ServerSocket.html).
- [Swing: trabajo en el hilo de eventos](https://docs.oracle.com/javase/tutorial/uiswing/concurrency/dispatch.html).
- [PreparedStatement: índices y parámetros](https://docs.oracle.com/javase/8/docs/api/java/sql/PreparedStatement.html).

Las preguntas no dependen de letras de opción, porque estas cambian al mezclar. El caso de fin de flujo distingue null de línea vacía y de errores de lectura; el caso de Singleton distingue publicación segura de sincronización del estado mutable.

## Verificación

`npm run validate` comprueba ambos simulacros: esquema, referencias, distribución, corrección tras mezclar, rechazo de intentos del otro banco, vencimiento, recuperación, reinicio y errores de carga.
