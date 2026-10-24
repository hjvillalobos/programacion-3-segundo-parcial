# Segundo parcial · Programación 3

Material de estudio para el segundo parcial de EIF206 Programación 3, preparado el 21 de octubre de 2026.

Incluye **50 tarjetas didácticas y 50 preguntas adicionales**, con solucionario separado. Distribución en ambas partes: **15 de patrones, 18 de bases de datos y 17 de hilos/comunicación**. El cuestionario contiene 20 de selección única, 10 de verdadero/falso, 10 de respuesta corta y 10 ejercicios de código o casos.

**Prioridad de estudio.** Los tres PDF del profesor son la base. Los patrones de diseño y el desarrollo de sockets remotos se completan con investigación. Observer, Composite y Strategy figuran en el programa previamente revisado; los otros patrones concretos son ejemplos complementarios para estudiar las tres familias, no una afirmación de que el profesor preguntará cada uno. PreparedStatement, DAO, detalles de la API de Thread, protocolos y manejo de errores son ampliaciones prácticas señaladas mediante referencias R.

**Cómo usarlo.** Responde las tarjetas antes de abrir su reverso. Después resuelve las 50 preguntas sin consultar el solucionario, situado tras la última pregunta. En selección única marca una alternativa; en verdadero/falso justifica siempre. En código explica también la razón de tu solución. La tabla final permite ubicar qué debes repasar.

**Convenciones.** Java con construcciones compatibles en general con Java 8 o superior; MySQL 8 o superior. Las referencias de API Java 25 se usan para verificar los contratos, sin exigir novedades de esa versión. Los fragmentos que se presentan como métodos van dentro de una clase y necesitan los imports indicados; los esquemas relacionales son notación de diseño, no scripts SQL ejecutables. El código de red es de demostración para el examen.

**Precisiones para evitar confusiones.** JDBC es una API; el driver la implementa. Ser específico de un motor no equivale a depender del sistema operativo. Una FK simple puede admitir NULL si no se declara NOT NULL. Concurrencia no implica paralelismo; RUNNING no es un estado separado de Thread.State. Un Thread termina al concluir run(): no se cierra con un método close() de Thread. La seguridad de una operación compuesta exige coordinación adecuada; ni sleep() ni Singleton la garantizan. En el curso SELECT se agrupa en DML, aunque otras clasificaciones usan DQL.

## Parte 1. Tarjetas didácticas

### T01. ¿Qué aporta un patrón de diseño?

**Tema:** Patrones de diseño · **Base:** R1

**Reverso:** Describe una solución reutilizable a un problema de diseño recurrente, con responsabilidades y consecuencias. Se adapta al contexto; no es código listo para copiar.

**Ejemplo:** Elegir un patrón exige identificar qué cambia y qué debe permanecer estable.

### T02. ¿Cómo se distinguen las tres familias principales de patrones?

**Tema:** Patrones de diseño · **Base:** R1

**Reverso:** Creacionales: creación de objetos. Estructurales: composición de clases y objetos. De comportamiento: colaboración, responsabilidades y algoritmos.

**Ejemplo:** Factory Method / Composite / Strategy, respectivamente.

### T03. ¿Cuáles son las responsabilidades de Strategy?

**Tema:** Patrones de diseño · **Base:** R4

**Reverso:** Una interfaz define el algoritmo; las estrategias concretas lo implementan; el contexto recibe una estrategia y le delega la operación.

**Ejemplo:** Un servicio de exportación utiliza un Exportador intercambiable: CSV o XML.

### T04. ¿Qué roles participan en Observer?

**Tema:** Patrones de diseño · **Base:** R4, R5

**Reverso:** Un sujeto mantiene suscripciones y notifica cambios; los observadores reciben avisos mediante un contrato común.

**Ejemplo:** Al agregar un mensaje, el modelo avisa a la vista del historial y al contador.

### T05. ¿Qué riesgos introduce Observer?

**Tema:** Patrones de diseño · **Base:** R4, R5

**Reverso:** Suscripciones olvidadas, actualizaciones encadenadas y dependencia del orden de notificación. Las llamadas síncronas pueden bloquear al emisor; el patrón no crea hilos automáticamente.

**Ejemplo:** Dar de baja una vista cerrada evita conservarla innecesariamente.

### T06. ¿Qué distingue a Composite de una simple lista?

**Tema:** Patrones de diseño · **Base:** R3

**Reverso:** Modela una jerarquía parte-todo. Hojas y compuestos comparten un contrato; el compuesto delega recursivamente en sus hijos.

**Ejemplo:** Un menú puede contener opciones y otros menús; ambos implementan mostrar().

### T07. ¿En qué difieren Factory Method y Abstract Factory?

**Tema:** Patrones de diseño · **Base:** R2

**Reverso:** Factory Method permite que una subclase decida qué producto crear al redefinir un método de creación. Abstract Factory ofrece operaciones para crear una familia compatible de productos.

**Ejemplo:** Una fábrica de tema crea conjuntamente botones y menús del mismo estilo.

### T08. ¿Qué asegura Singleton y qué no asegura?

**Tema:** Patrones de diseño · **Base:** R2

**Reverso:** Busca una única instancia y un punto de acceso dentro del ámbito de su implementación. No vuelve seguros sus campos mutables ni crea una instancia global entre procesos.

**Ejemplo:** Un Singleton compartido no hace segura una Connection usada simultáneamente por varios hilos.

### T09. ¿Cuándo ayuda Builder?

**Tema:** Patrones de diseño · **Base:** R22

**Reverso:** Cuando construir un objeto requiere varios pasos u opciones. Separa el proceso de construcción y facilita validar el resultado.

**Ejemplo:** Configurar una solicitud con destinatario, contenido y opciones antes de build().

### T10. ¿Qué problema resuelve Adapter?

**Tema:** Patrones de diseño · **Base:** R6

**Reverso:** Traduce una interfaz existente al contrato que espera el cliente. Permite reutilizar un componente incompatible sin modificarlo.

**Ejemplo:** Adaptar enviarTexto(String) a la interfaz Notificador.notificar(String).

### T11. ¿Cómo añade comportamiento Decorator?

**Tema:** Patrones de diseño · **Base:** R6

**Reverso:** Envuelve un componente que implementa el mismo contrato y agrega trabajo antes o después de delegar.

**Ejemplo:** Un exportador envuelto añade registro de actividad sin cambiar el exportador base.

### T12. ¿Cuál es la responsabilidad de Facade?

**Tema:** Patrones de diseño · **Base:** R6

**Reverso:** Ofrecer una entrada sencilla a un subsistema con varias operaciones internas.

**Ejemplo:** ServicioHistorial coordina consulta de conversaciones y mensajes para la interfaz.

### T13. ¿Qué hace Proxy?

**Tema:** Patrones de diseño · **Base:** R7

**Reverso:** Representa a otro objeto para controlar o mediar su acceso. Puede incorporar carga diferida o comunicación remota.

**Ejemplo:** Un proxy remoto traduce una llamada local en una solicitud por red; la red puede fallar.

### T14. ¿En qué se diferencian DAO y DTO?

**Tema:** Patrones de diseño · **Base:** R8, A

**Reverso:** DAO encapsula operaciones de persistencia. DTO transporta datos entre partes de la aplicación. El servicio coordina reglas de negocio.

**Ejemplo:** UsuarioDAO.consultar(id) devuelve un UsuarioDTO; la vista no ejecuta SQL.

### T15. ¿Cómo justifico elegir un patrón?

**Tema:** Patrones de diseño · **Base:** R1, R6

**Reverso:** Explico el problema, el aspecto variable, los roles, la ventaja y el costo. Si la abstracción no aporta una mejora concreta, no la agrego.

**Ejemplo:** Strategy facilita cambiar algoritmos, pero obliga a administrar estrategias y su selección.

### T16. ¿Qué significan relación, tupla, atributo y dominio?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 2-4

**Reverso:** Relación: tabla en la representación usual. Tupla: fila. Atributo: columna. Dominio: valores admitidos para un atributo. El orden físico no define el significado.

**Ejemplo:** activo puede admitir únicamente los valores definidos por sus restricciones.

### T17. ¿Qué diferencian PK y FK?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 4-5

**Reverso:** La PK identifica filas de forma única y no admite NULL. Una FK no nula debe corresponder a una clave referenciada válida.

**Ejemplo:** Una conversación debe apuntar a un usuario existente si id_usuario es NOT NULL.

### T18. ¿Qué aportan UNIQUE, NOT NULL y las restricciones de dominio?

**Tema:** Bases de datos y persistencia · **Base:** A p. 5; R24

**Reverso:** UNIQUE impide duplicados de valores sujetos a la restricción; NOT NULL exige un valor; tipos y restricciones limitan el dominio.

**Ejemplo:** En MySQL un índice UNIQUE puede admitir varios NULL; combinarlo con NOT NULL si el dato es obligatorio.

### T19. ¿Cómo se implementan 1:1, 1:N y N:M?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 6-7

**Reverso:** 1:1 suele usar una FK con unicidad; 1:N coloca la FK en el lado N; N:M necesita una tabla intermedia.

**Ejemplo:** Usuario 1:N Conversación; Conversación 1:N Mensaje; Matrícula enlaza Estudiante y Curso.

### T20. ¿Qué anomalías busca reducir la normalización?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 9-10

**Reverso:** Inserción: no poder guardar un hecho sin otro. Actualización: modificar el mismo dato en muchas filas. Eliminación: perder un hecho al borrar otro.

**Ejemplo:** Borrar el último mensaje no debería borrar la identidad de su conversación.

### T21. ¿Qué exige 1FN en los ejemplos del curso?

**Tema:** Bases de datos y persistencia · **Base:** A p. 11

**Reverso:** Atributos con valores atómicos para el dominio elegido y ausencia de grupos repetitivos.

**Ejemplo:** Separar los teléfonos de un usuario en filas relacionadas; no guardarlos como lista separada por comas.

### T22. ¿Qué dependencia elimina 2FN?

**Tema:** Bases de datos y persistencia · **Base:** A p. 12

**Reverso:** Las dependencias parciales de atributos no primos respecto de una parte propia de una clave candidata compuesta; además exige 1FN.

**Ejemplo:** En Matrícula(estudiante, curso, nombre_estudiante, nota), nombre_estudiante depende solo de estudiante.

### T23. ¿Cómo se reconoce el problema típico de 3FN?

**Tema:** Bases de datos y persistencia · **Base:** A p. 13

**Reverso:** En los casos del curso, un atributo no clave depende de otro atributo no clave y no directamente de la clave. Requiere 2FN.

**Ejemplo:** id_usuario → id_tipo → nombre_tipo. Separar TIPOS_USUARIO. Formalmente, para toda dependencia no trivial X→A, X debe ser superclave o A atributo primo.

### T24. ¿Por qué no conviene dividir cada dato en una tabla?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 14-15

**Reverso:** La separación debe responder a entidades y dependencias. Normalizar reduce redundancia, pero añade uniones; desnormalizar requiere una razón técnica medible.

**Ejemplo:** En AVI se separan usuarios, conversaciones y mensajes; no una tabla por atributo.

### T25. ¿Qué es el desajuste objeto-relacional?

**Tema:** Bases de datos y persistencia · **Base:** A pp. 16-17

**Reverso:** Objetos usan identidad, referencias y comportamiento; tablas representan valores y claves. Persistir exige transformar esas representaciones.

**Ejemplo:** Una referencia a Usuario se representa con id_usuario; una colección de mensajes corresponde a filas relacionadas.

### T26. ¿Cómo se relacionan DDL, DML y CRUD?

**Tema:** Bases de datos y persistencia · **Base:** A p. 8; B p. 6

**Reverso:** DDL define estructuras, como CREATE TABLE. CRUD: crear, leer, actualizar y eliminar datos mediante INSERT, SELECT, UPDATE y DELETE. IMEC expresa las mismas operaciones como insertar, modificar, eliminar y consultar.

**Ejemplo:** En estas clases SELECT se estudia dentro de DML; otras clasificaciones lo llaman DQL. CRUD Create no significa CREATE TABLE.

### T27. ¿Son lo mismo JDBC, un driver y un DSN?

**Tema:** Bases de datos y persistencia · **Base:** B pp. 3-4; R9

**Reverso:** JDBC es la API de Java; un driver como Connector/J implementa el acceso al motor. Un DSN es una configuración nombrada, típica de ODBC.

**Ejemplo:** El driver JDBC tipo 4 de MySQL está escrito en Java: depender de un motor no implica depender del sistema operativo.

### T28. ¿Para qué sirve un pool de conexiones?

**Tema:** Bases de datos y persistencia · **Base:** B p. 5

**Reverso:** Reutiliza conexiones físicas para reducir el costo de abrirlas. El código pide una conexión y la devuelve al terminar.

**Ejemplo:** En una conexión lógica obtenida de un pool, close() normalmente la devuelve al pool.

### T29. ¿Cuáles son los pasos de una operación JDBC?

**Tema:** Bases de datos y persistencia · **Base:** B pp. 2, 5; R10

**Reverso:** Obtener conexión, preparar sentencia, asignar parámetros, ejecutar, procesar resultados y liberar recursos, también ante excepciones.

**Ejemplo:** try-with-resources cierra ResultSet, sentencia y conexión en orden inverso al de adquisición.

### T30. ¿Por qué usar parámetros en PreparedStatement?

**Tema:** Bases de datos y persistencia · **Base:** R11

**Reverso:** Separa valores de la estructura SQL y evita interpretar esos valores como instrucciones. Los índices de parámetros empiezan en 1.

**Ejemplo:** UPDATE usuarios SET activo=? WHERE id_usuario=?; setBoolean(1, false); setInt(2, id).

### T31. ¿Qué retornan executeQuery() y executeUpdate()?

**Tema:** Bases de datos y persistencia · **Base:** R10

**Reverso:** executeQuery() produce un ResultSet para una consulta. executeUpdate() devuelve un conteo de filas afectadas para INSERT, UPDATE o DELETE en los casos habituales.

**Ejemplo:** DELETE con WHERE id_usuario=? puede afectar cero filas si el usuario no existe.

### T32. ¿Qué diferencia el mapeo manual de un ORM?

**Tema:** Bases de datos y persistencia · **Base:** B p. 7; R10

**Reverso:** En JDBC manual, el código avanza con ResultSet.next() y lee columnas para crear objetos. Un ORM automatiza parte del mapeo y la persistencia.

**Ejemplo:** Hibernate es un ORM; JDBC es una API de acceso, no un ORM.

### T33. ¿Cómo se reparten responsabilidades en la aplicación del curso?

**Tema:** Bases de datos y persistencia · **Base:** A p. 18; R8

**Reverso:** Vista captura y presenta; controlador recibe eventos; servicios coordinan; lógica aplica reglas; datos/DAO ejecuta SQL y mapea; MySQL persiste.

**Ejemplo:** Sustituir JSON/XML por MySQL debe concentrar cambios de persistencia en la capa de datos.

### T34. ¿Qué distingue proceso, hilo y clase activa?

**Tema:** Hilos y comunicación · **Base:** C pp. 2-4

**Reverso:** Un proceso tiene su propio espacio de memoria. Sus hilos comparten memoria. Una clase activa organiza una ejecución propia mediante uno o más hilos.

**Ejemplo:** Un objeto servidor puede coordinar tareas mientras la interfaz sigue respondiendo.

### T35. ¿Concurrencia equivale a paralelismo?

**Tema:** Hilos y comunicación · **Base:** C pp. 4, 11-12; R12

**Reverso:** No. Concurrencia permite progreso intercalado de tareas; paralelismo implica ejecución simultánea. Más hilos también añaden costos de memoria y planificación.

**Ejemplo:** En un núcleo dos hilos pueden alternarse sin ejecutarse simultáneamente.

### T36. ¿Qué diferencia Thread, Runnable, start() y run()?

**Tema:** Hilos y comunicación · **Base:** C pp. 5-6; R12, R13

**Reverso:** Runnable define una tarea; Thread representa un hilo. start() inicia una ejecución concurrente que invoca run(); llamar run() directamente es una llamada ordinaria.

**Ejemplo:** Estados oficiales: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED; no existe RUNNING separado.

### T37. ¿Qué hacen sleep(), join() e isAlive()?

**Tema:** Hilos y comunicación · **Base:** C p. 6; R12

**Reverso:** sleep pausa al hilo actual sin liberar monitores que posea; join espera la terminación de otro hilo; isAlive informa si inició y aún no terminó.

**Ejemplo:** join coordina la espera por una tarea; sleep no garantiza que esa tarea ya terminó.

### T38. ¿Cómo se solicita terminar una tarea cooperativamente?

**Tema:** Hilos y comunicación · **Base:** C pp. 6, 10; R12

**Reverso:** interrupt() solicita interrupción; la tarea debe responder según su diseño. Puede consultar el indicador o atender InterruptedException.

**Ejemplo:** Al terminar por interrupción, liberar recursos; si no se propaga InterruptedException, suele restaurarse el indicador con Thread.currentThread().interrupt().

### T39. ¿Por qué contador++ puede fallar con varios hilos?

**Tema:** Hilos y comunicación · **Base:** C p. 7

**Reverso:** Combina lectura, incremento y escritura; intercalarlas pierde actualizaciones. Proteger el acceso con el mismo monitor o usar una operación atómica apropiada.

**Ejemplo:** synchronized en objetos distintos no protege un contador compartido de manera conjunta.

### T40. ¿Qué reglas exigen wait(), notify() y notifyAll()?

**Tema:** Hilos y comunicación · **Base:** C p. 8; R14

**Reverso:** Se debe poseer el monitor del objeto. wait libera ese monitor mientras espera y debe estar dentro de un while que compruebe la condición.

**Ejemplo:** notify despierta un candidato; notifyAll despierta a todos los que esperan ese monitor. Deben volver a competir por el bloqueo.

### T41. ¿Qué resuelve BlockingQueue en productor-consumidor?

**Tema:** Hilos y comunicación · **Base:** C pp. 8-9; R15

**Reverso:** Coordina intercambio seguro de elementos. take espera si está vacía; put espera si una cola de capacidad limitada está llena.

**Ejemplo:** Eventos, colas y sockets en localhost son mecanismos distintos; una llamada por evento puede seguir siendo síncrona.

### T42. ¿Qué riesgos hay al crear muchos hilos o bloquear mal?

**Tema:** Hilos y comunicación · **Base:** C pp. 10-12; R16

**Reverso:** Consumo excesivo de recursos, competencia y posibles interbloqueos. Usar límites y un orden consistente al adquirir bloqueos.

**Ejemplo:** Un pool de hilos limita trabajadores; una cola sin límite todavía puede crecer sin control.

### T43. ¿Qué representa un socket TCP?

**Tema:** Hilos y comunicación · **Base:** R17, R23

**Reverso:** Un extremo de una conexión de flujo de bytes. TCP conserva orden y entrega fiable mientras la conexión funciona; no conserva fronteras de mensajes ni garantiza éxito ante toda falla.

**Ejemplo:** UDP intercambia datagramas y no ofrece por sí mismo las garantías de entrega y orden de TCP.

### T44. ¿Para qué sirven ServerSocket y Socket?

**Tema:** Hilos y comunicación · **Base:** R18

**Reverso:** ServerSocket escucha y accept() obtiene un Socket para cada conexión. Socket permite enviar y recibir; existe en ambos extremos.

**Ejemplo:** El servidor conserva el socket de escucha para aceptar nuevas conexiones y usa otro para cada cliente.

### T45. ¿Qué se configura para una conexión remota?

**Tema:** Hilos y comunicación · **Base:** R19, R20

**Reverso:** El cliente necesita host y puerto del servidor; este debe escuchar en una dirección accesible. Debe existir conectividad y permiso de red.

**Ejemplo:** localhost siempre apunta a la computadora donde corre ese proceso, no a la computadora del compañero.

### T46. ¿Cómo se delimitan mensajes sobre TCP?

**Tema:** Hilos y comunicación · **Base:** R21

**Reverso:** Mediante un protocolo acordado: por ejemplo, líneas terminadas en salto de línea, codificadas en UTF-8. Hay que enviar los datos almacenados en buffers.

**Ejemplo:** Con BufferedWriter, usar write(texto), newLine() y flush(); readLine() consume una línea completa.

### T47. ¿Qué significan accept(), EOF y un timeout?

**Tema:** Hilos y comunicación · **Base:** R19, R20

**Reverso:** accept espera una conexión; readLine retorna null al finalizar el flujo sin más caracteres. Un timeout limita una espera concreta y produce una excepción.

**Ejemplo:** setSoTimeout limita lecturas del Socket; el timeout de connect se configura aparte con connect(direccion, milisegundos).

### T48. ¿Cómo atiende un servidor a varios clientes?

**Tema:** Hilos y comunicación · **Base:** R18, R16

**Reverso:** El bucle de aceptación entrega cada Socket a una tarea distinta. Cada manejador procesa su conexión; el estado compartido requiere coordinación.

**Ejemplo:** Un ThreadPoolExecutor con trabajadores y cola limitados permite controlar recursos y rechazar exceso de carga.

### T49. ¿Qué diferencia aplicación distribuida de asíncrona?

**Tema:** Hilos y comunicación · **Base:** C p. 13; R18

**Reverso:** Distribuida: componentes en procesos o equipos comunicados. Asíncrona: una operación permite continuar sin esperar allí su resultado. Son propiedades diferentes.

**Ejemplo:** Una consulta remota puede bloquear al cliente; una tarea local puede ejecutarse asíncronamente.

### T50. ¿Cómo se integran red, negocio y persistencia?

**Tema:** Hilos y comunicación · **Base:** R19, R20; A p. 18

**Reverso:** El manejador interpreta mensajes, delega en servicios y estos en DAO. Cada tarea libera sus recursos de red y datos; cerrar escucha y cerrar una conexión son acciones distintas.

**Ejemplo:** Los clientes comparten el servicio, pero no una Connection mutable global sin coordinación.

## Parte 2. Cuestionario sin respuestas

### P01. Selección única · Básica

**Tema:** Patrones de diseño · **Base:** R1

Se necesita organizar objetos en una jerarquía parte-todo. ¿A qué familia corresponde la solución Composite?

- **A.** Creacional.
- **B.** Estructural.
- **C.** De comportamiento.
- **D.** De normalización.

**Mi respuesta:** ______________________________________________

### P02. Selección única · Intermedia

**Tema:** Patrones de diseño · **Base:** R4

Un servicio debe cambiar entre cálculo de tarifa normal y promocional durante la ejecución, manteniendo estable su cliente. ¿Qué patrón encaja mejor?

- **A.** Observer.
- **B.** Composite.
- **C.** Strategy.
- **D.** Adapter.

**Mi respuesta:** ______________________________________________

### P03. Selección única · Intermedia

**Tema:** Patrones de diseño · **Base:** R3, R4

Un historial cambia y varias vistas suscritas deben enterarse sin que el historial conozca sus clases concretas. ¿Qué estructura es la adecuada?

- **A.** Un sujeto con registro de observadores mediante una interfaz.
- **B.** Un sujeto con referencias obligatorias a cada clase de vista concreta.
- **C.** Un árbol Composite sin mecanismo de notificación.
- **D.** Un contexto Strategy sin suscriptores.

**Mi respuesta:** ______________________________________________

### P04. Selección única · Básica

**Tema:** Patrones de diseño · **Base:** R2

Una interfaz ofrece crearBoton() y crearMenu(), con implementaciones para temas visuales compatibles. ¿Qué patrón representa?

- **A.** Builder.
- **B.** Singleton.
- **C.** Observer.
- **D.** Abstract Factory.

**Mi respuesta:** ______________________________________________

### P05. Selección única · Intermedia

**Tema:** Patrones de diseño · **Base:** R6

Una biblioteca tiene enviarTexto(String), pero el sistema espera Notificador.notificar(String). Se quiere reutilizarla sin modificarla. ¿Qué patrón usar?

- **A.** Decorator.
- **B.** Adapter.
- **C.** Facade.
- **D.** Strategy.

**Mi respuesta:** ______________________________________________

### P06. Selección única · Básica

**Tema:** Patrones de diseño · **Base:** R8, A

¿Dónde debe residir el SQL que consulta usuarios y convierte sus filas a objetos?

- **A.** En la vista.
- **B.** En un DTO dedicado solo a transportar datos.
- **C.** En la implementación del DAO.
- **D.** En el manejador de clic del controlador.

**Mi respuesta:** ______________________________________________

### P07. Selección única · Básica

**Tema:** Bases de datos y persistencia · **Base:** A pp. 2-4

En USUARIOS, ¿qué identifica correctamente una tupla y un dominio?

- **A.** Tupla: una fila; dominio: conjunto de valores válidos para un atributo.
- **B.** Tupla: una columna; dominio: una fila.
- **C.** Tupla: una clave foránea; dominio: toda la base de datos.
- **D.** Tupla: el nombre de la tabla; dominio: el orden de las filas.

**Mi respuesta:** ______________________________________________

### P08. Selección única · Básica

**Tema:** Bases de datos y persistencia · **Base:** A pp. 5-7

CONVERSACIONES.id_usuario es NOT NULL y FK a USUARIOS.id_usuario. ¿Qué exige la integridad referencial al insertar una conversación?

- **A.** Que cada usuario tenga como máximo una conversación.
- **B.** Que id_usuario pueda apuntar a cualquier entero inexistente.
- **C.** Que los IDs de conversaciones sean consecutivos sin huecos.
- **D.** Que exista el usuario cuyo ID se utiliza.

**Mi respuesta:** ______________________________________________

### P09. Selección única · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** A p. 12

MATRICULA tiene PK(estudiante, curso), y estudiante → nombre_estudiante. No existen otras claves candidatas. ¿Cuál es el problema?

- **A.** Violación de 1FN por tener necesariamente listas en las celdas.
- **B.** Violación de 2FN por dependencia parcial.
- **C.** Violación de 3FN únicamente por dependencia transitiva.
- **D.** Ninguno: una clave compuesta garantiza normalización.

**Mi respuesta:** ______________________________________________

### P10. Selección única · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** A p. 13

USUARIOS(id_usuario, id_tipo, nombre_tipo) tiene solo id_usuario como clave candidata e id_tipo → nombre_tipo. ¿Cuál es la corrección adecuada?

- **A.** Quitar la PK de USUARIOS.
- **B.** Añadir otra copia de nombre_tipo.
- **C.** Crear TIPOS_USUARIO(id_tipo PK, nombre_tipo) y conservar id_tipo como FK en USUARIOS.
- **D.** Guardar los usuarios como una lista en TIPOS_USUARIO.

**Mi respuesta:** ______________________________________________

### P11. Selección única · Básica

**Tema:** Bases de datos y persistencia · **Base:** A p. 8; B p. 6

En CRUD, la operación Create de un nuevo mensaje corresponde a:

- **A.** INSERT INTO mensajes (...).
- **B.** CREATE TABLE mensajes (...).
- **C.** SELECT ... FROM mensajes.
- **D.** UPDATE mensajes SET ... WHERE ... .

**Mi respuesta:** ______________________________________________

### P12. Selección única · Básica

**Tema:** Bases de datos y persistencia · **Base:** B pp. 3-4; R9

¿Cuál afirmación distingue correctamente API, driver y configuración?

- **A.** JDBC es el motor que almacena las tablas.
- **B.** Un DSN es una instrucción DELETE.
- **C.** JDBC y Hibernate son el mismo tipo de herramienta.
- **D.** JDBC es una API y Connector/J es un driver para MySQL.

**Mi respuesta:** ______________________________________________

### P13. Selección única · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** B p. 5

Una aplicación obtiene una conexión lógica de un pool. ¿Qué debe hacer al terminar la operación?

- **A.** Conservarla indefinidamente en cada controlador.
- **B.** Cerrar la conexión lógica según el contrato del pool.
- **C.** Ejecutar DROP TABLE para liberarla.
- **D.** Cerrar todo el pool después de cada SELECT.

**Mi respuesta:** ______________________________________________

### P14. Selección única · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** B p. 7; R10

Un SELECT devuelve varias filas. ¿Cómo se mapean con JDBC manual?

- **A.** Leer getters antes de llamar next() y asumir que existe una fila.
- **B.** Usar executeUpdate() para obtener una lista de DTO automáticamente.
- **C.** Recorrer while(rs.next()) y crear objetos a partir de las columnas.
- **D.** Convertir el nombre de la tabla a una clase con un cast.

**Mi respuesta:** ______________________________________________

### P15. Selección única · Básica

**Tema:** Hilos y comunicación · **Base:** C pp. 2-4

Dos tareas pertenecen a hilos de un mismo proceso. ¿Qué propiedad es correcta?

- **A.** Pueden compartir objetos del proceso y necesitar sincronización.
- **B.** Cada una tiene necesariamente un espacio de memoria aislado.
- **C.** Nunca pueden ejecutarse de forma concurrente.
- **D.** Todo objeto del proceso posee automáticamente un hilo propio.

**Mi respuesta:** ______________________________________________

### P16. Selección única · Básica

**Tema:** Hilos y comunicación · **Base:** C pp. 5-6; R12

Dado Runnable tarea, ¿qué instrucción inicia un hilo nuevo que ejecuta esa tarea?

- **A.** tarea.run();
- **B.** new Thread(tarea).run();
- **C.** Thread.sleep(100);
- **D.** new Thread(tarea).start();

**Mi respuesta:** ______________________________________________

### P17. Selección única · Intermedia

**Tema:** Hilos y comunicación · **Base:** C p. 8; R14

Un consumidor espera que una lista tenga elementos. ¿Qué estructura respeta el uso de wait()?

- **A.** while(lista.isEmpty()) monitor.wait(); sin sincronización.
- **B.** synchronized(monitor) { while(lista.isEmpty()) monitor.wait(); } con todos los accesos protegidos por ese monitor.
- **C.** synchronized(monitor) { if(lista.isEmpty()) monitor.wait(); } sin volver a comprobar.
- **D.** while(lista.isEmpty()) {} sin ninguna coordinación.

**Mi respuesta:** ______________________________________________

### P18. Selección única · Básica

**Tema:** Hilos y comunicación · **Base:** R18, R20

¿Qué devuelve ServerSocket.accept() cuando acepta una conexión TCP?

- **A.** Un ResultSet.
- **B.** Otro ServerSocket para reemplazar obligatoriamente al anterior.
- **C.** Un Socket conectado con ese cliente.
- **D.** El texto completo del primer mensaje.

**Mi respuesta:** ______________________________________________

### P19. Selección única · Intermedia

**Tema:** Hilos y comunicación · **Base:** R19

El servidor está en la computadora A y el cliente corre en B. Si el cliente usa localhost, ¿a dónde intenta conectarse?

- **A.** A la propia computadora B.
- **B.** Automáticamente a A porque allí está el servidor.
- **C.** A cualquier computadora que tenga el mismo puerto.
- **D.** A una dirección pública elegida por Java.

**Mi respuesta:** ______________________________________________

### P20. Selección única · Intermedia

**Tema:** Hilos y comunicación · **Base:** R21

El servidor usa readLine(). El cliente usa BufferedWriter.write("HOLA") sin salto de línea y sin flush(), y mantiene la conexión abierta. ¿Cuál es la corrección más directa para el protocolo por líneas?

- **A.** Cambiar el puerto del cliente después de conectarse.
- **B.** Llamar únicamente flush(), sin enviar terminador ni cerrar salida.
- **C.** Agregar Thread.sleep(1000).
- **D.** Llamar newLine() y flush() después de escribir.

**Mi respuesta:** ______________________________________________

### P21. Verdadero o falso · Avanzada

**Tema:** Patrones de diseño · **Base:** R2

Un Singleton con una instancia construida correctamente hace que todos sus campos mutables sean seguros para acceso concurrente. Justifica.

**Mi respuesta:** ______________________________________________

### P22. Verdadero o falso · Básica

**Tema:** Patrones de diseño · **Base:** R3

En Composite, hojas y compuestos pueden implementar el mismo contrato y el compuesto puede delegar recursivamente. Justifica.

**Mi respuesta:** ______________________________________________

### P23. Verdadero o falso · Intermedia

**Tema:** Patrones de diseño · **Base:** R6

Si una clase envuelve otra, necesariamente implementa Decorator. Justifica.

**Mi respuesta:** ______________________________________________

### P24. Verdadero o falso · Básica

**Tema:** Bases de datos y persistencia · **Base:** A p. 5

Una FK declarada sin NOT NULL puede admitir NULL si las demás restricciones lo permiten. Justifica.

**Mi respuesta:** ______________________________________________

### P25. Verdadero o falso · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** A pp. 12-13

Toda tabla cuya única clave candidata tiene un solo atributo está automáticamente en 3FN. Justifica.

**Mi respuesta:** ______________________________________________

### P26. Verdadero o falso · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** B pp. 3-4; R9

Un driver específico de MySQL debe, por esa sola razón, ser distinto en Windows y Linux. Justifica.

**Mi respuesta:** ______________________________________________

### P27. Verdadero o falso · Básica

**Tema:** Hilos y comunicación · **Base:** C pp. 4, 11-12

Si dos hilos progresan concurrentemente, necesariamente se ejecutan al mismo instante en núcleos distintos. Justifica.

**Mi respuesta:** ______________________________________________

### P28. Verdadero o falso · Avanzada

**Tema:** Hilos y comunicación · **Base:** C p. 7

Dos hilos protegen el mismo contador con synchronized, cada uno usando un objeto de bloqueo distinto. Eso garantiza exclusión mutua sobre el contador. Justifica.

**Mi respuesta:** ______________________________________________

### P29. Verdadero o falso · Intermedia

**Tema:** Hilos y comunicación · **Base:** R17, R19

Si un emisor hace dos escrituras sobre TCP, el receptor obtendrá exactamente dos lecturas con las mismas fronteras. Justifica.

**Mi respuesta:** ______________________________________________

### P30. Verdadero o falso · Avanzada

**Tema:** Hilos y comunicación · **Base:** R20

Cerrar el ServerSocket de escucha cierra automáticamente todos los Socket que accept() había devuelto antes. Justifica.

**Mi respuesta:** ______________________________________________

### P31. Respuesta corta · Intermedia

**Tema:** Patrones de diseño · **Base:** R1, R2, R4

Un servicio exporta historiales en varios formatos y también debe construir el exportador adecuado. Explica qué responsabilidades corresponden a Strategy y cuáles a una fábrica.

**Mi respuesta:** ______________________________________________

### P32. Respuesta corta · Avanzada

**Tema:** Patrones de diseño · **Base:** R2, R6, R22

Propón una elección justificada para: a) construir una solicitud con muchas opciones; b) crear botón y menú compatibles por tema; c) definir una única configuración compartida. Señala un riesgo de c).

**Mi respuesta:** ______________________________________________

### P33. Respuesta corta · Avanzada

**Tema:** Patrones de diseño · **Base:** R6, R7

Distingue tres necesidades: una entrada sencilla al subsistema de historial, una representación local de un servicio remoto y añadir auditoría conservando el contrato. ¿Qué patrón propones para cada una y qué limitación tiene?

**Mi respuesta:** ______________________________________________

### P34. Respuesta corta · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** A pp. 6-7, 10, 14

Modela USUARIOS, CONVERSACIONES y MENSAJES con PK, FK y cardinalidades. Explica qué pérdida evitas al no guardarlo todo en una tabla de mensajes.

**Mi respuesta:** ______________________________________________

### P35. Respuesta corta · Avanzada

**Tema:** Bases de datos y persistencia · **Base:** A pp. 9-15

Resume cómo evaluarías 1FN, 2FN y 3FN de una tabla. ¿Basta con observar unas cuantas filas? ¿Cuándo considerarías desnormalizar?

**Mi respuesta:** ______________________________________________

### P36. Respuesta corta · Básica

**Tema:** Bases de datos y persistencia · **Base:** A pp. 16-17; B p. 7

Compara identidad, relaciones, herencia y comportamiento en el modelo de objetos y en el relacional. Explica el papel de JDBC y de un ORM.

**Mi respuesta:** ______________________________________________

### P37. Respuesta corta · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** B pp. 3-5; R9

Compara una conexión JDBC a MySQL configurada por URL con una conexión que usa un DSN ODBC. Explica además qué problema resuelve un pool y cómo se libera una conexión prestada.

**Mi respuesta:** ______________________________________________

### P38. Respuesta corta · Básica

**Tema:** Hilos y comunicación · **Base:** C pp. 2-6; R12, R13

Una clase activa implementa Runnable. ¿Eso basta para iniciar su ejecución? Indica cómo lanzarla, cómo esperar su finalización, qué informa isAlive() y cuáles son los seis estados oficiales de Thread.

**Mi respuesta:** ______________________________________________

### P39. Respuesta corta · Intermedia

**Tema:** Hilos y comunicación · **Base:** C pp. 8-9, 13; R15

Diseña el intercambio entre un productor de mensajes y un consumidor local mediante una cola limitada. Compáralo con un evento síncrono y con un socket remoto.

**Mi respuesta:** ______________________________________________

### P40. Respuesta corta · Avanzada

**Tema:** Hilos y comunicación · **Base:** R17, R19, R20, R23

Un cliente remoto no logra conversar con el servidor. Propón un diagnóstico ordenado que distinga conexión, protocolo y cierre. Incluye TCP frente a UDP, localhost, dos tipos de timeout y EOF.

**Mi respuesta:** ______________________________________________

### P41. Código o caso · Intermedia

**Tema:** Patrones de diseño · **Base:** R4

El siguiente método acumula condicionales al añadir formatos. Propón una refactorización mínima con Strategy. Debe permitir inyectar el algoritmo; no es necesario implementar serialización real de CSV/XML.

```java
String exportar(String formato, String texto) {
    if (formato.equals("CSV")) return "CSV:" + texto;
    if (formato.equals("XML")) return "XML:" + texto;
    throw new IllegalArgumentException("Formato desconocido");
}
```

**Mi respuesta:** ______________________________________________

### P42. Código o caso · Avanzada

**Tema:** Patrones de diseño · **Base:** R4, R5

En este caso el historial depende de vistas concretas. Refactoriza con Observer para admitir suscripciones y bajas. Supón que todo corre en un solo hilo y que los observadores no lanzan excepciones. Explica por qué el cambio no vuelve asíncronas las notificaciones.

```java
void agregar(String texto) {
    mensajes.add(texto);
    vistaHistorialConcreta.actualizar(texto);
    contadorConcreto.actualizar(texto);
}
```

**Mi respuesta:** ______________________________________________

### P43. Código o caso · Avanzada

**Tema:** Patrones de diseño · **Base:** R3

Diseña un menú con opciones individuales y submenús anidados. Todos deben responder a mostrar(). Escribe una interfaz, una hoja y un compuesto. Explica cómo impedirías ciclos en el árbol.

**Mi respuesta:** ______________________________________________

### P44. Código o caso · Avanzada

**Tema:** Bases de datos y persistencia · **Base:** A pp. 9-15

Normaliza la relación MATRICULA(estudiante, curso, nombre_estudiante, telefonos, nombre_curso, docente, nombre_docente, nota). Reglas: PK(estudiante,curso); estudiante determina nombre_estudiante; curso determina nombre_curso y docente; docente determina nombre_docente; cada estudiante puede tener varios teléfonos; no hay otras claves candidatas. Explica 1FN, 2FN y 3FN y escribe el esquema final con claves.

**Mi respuesta:** ______________________________________________

### P45. Código o caso · Intermedia

**Tema:** Bases de datos y persistencia · **Base:** R10, R11

El código concatena un nombre y un ID en un UPDATE. Sustitúyelo por un método int actualizarNombre(DataSource ds, int id, String nombre) que cierre los recursos que obtiene y retorne filas afectadas. Supón que DataSource ya está configurado y usuarios(id_usuario PK, nombre) existe.

```java
String sql = "UPDATE usuarios SET nombre='" + nombre
           + "' WHERE id_usuario=" + id;
Connection c = ds.getConnection();
Statement st = c.createStatement();
st.executeUpdate(sql);
```

**Mi respuesta:** ______________________________________________

### P46. Código o caso · Avanzada

**Tema:** Bases de datos y persistencia · **Base:** A pp. 16-18; R8, R10, R11

Escribe List<UsuarioDTO> listarActivos(DataSource ds) para USUARIOS(id_usuario INT PK, nombre VARCHAR(100) NOT NULL, activo BOOLEAN NOT NULL). Devuelve lista vacía si no hay filas y cierra recursos. Puedes definir un DTO con constructor. Explica por qué el resultado no debe ser un ResultSet abierto entregado a la vista.

**Mi respuesta:** ______________________________________________

### P47. Código o caso · Avanzada

**Tema:** Hilos y comunicación · **Base:** C pp. 6-7

Dos hilos comparten el siguiente Contador e incrementan 1000 veces cada uno. Tras join() de ambos, ¿está garantizado 2000? Corrige la clase y explica qué función cumple join(). No uses sleep como solución.

```java
class Contador {
    int n = 0;
    void incrementar() { n++; }
    int valor() { return n; }
}
```

**Mi respuesta:** ______________________________________________

### P48. Código o caso · Avanzada

**Tema:** Hilos y comunicación · **Base:** C pp. 6, 10; R12

La siguiente tarea ignora la interrupción. Reescríbela para terminar cooperativamente, restaurar el indicador cuando capture InterruptedException y ejecutar una limpieza. Supón que limpiar() y trabajar() terminan pronto y no lanzan excepciones.

```java
public void run() {
    while (true) {
        try { Thread.sleep(1000); }
        catch (InterruptedException e) { /* ignorada */ }
        trabajar();
    }
}
```

**Mi respuesta:** ______________________________________________

### P49. Código o caso · Avanzada

**Tema:** Hilos y comunicación · **Base:** R19, R21

Un servidor existente escucha en host y puerto. El protocolo es UTF-8 por líneas: el cliente envía PING y el servidor responde PONG. El cliente siguiente parece quedarse esperando. Explica las dos fallas de envío y escribe un método de cliente que limite conexión y lectura a 3 segundos y cierre los recursos.

```java
Socket s = new Socket(host, puerto);
BufferedWriter out = new BufferedWriter(new OutputStreamWriter(s.getOutputStream()));
BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()));
out.write("PING");
String respuesta = in.readLine();
```

**Mi respuesta:** ______________________________________________

### P50. Código o caso · Avanzada

**Tema:** Hilos y comunicación · **Base:** R18, R16, R20

El bucle while(true) { Socket s = servidor.accept(); atender(s); } procesa directamente cada cliente y uno lento retrasa a los demás. Propón un servidor de demostración con 4 trabajadores y cola máxima de 20 conexiones pendientes. Cada cliente envía una línea PING y recibe PONG; otro comando recibe ERROR. Incluye timeout de lectura, cierre por cliente y manejo de rechazo por saturación. Explica cómo añadirías servicio y DAO y cómo sería un apagado completo.

**Mi respuesta:** ______________________________________________

## Parte 3. Solucionario

Consulta esta sección después de intentar el cuestionario. En preguntas abiertas, las explicaciones enumeran los elementos mínimos de una respuesta completa.

### Respuesta P01

B. Es estructural porque organiza una composición de objetos. A se enfoca en construir instancias; C se centra en colaboración o algoritmos; D describe un ámbito distinto y no una familia GoF.

### Respuesta P02

C. Strategy encapsula alternativas del mismo algoritmo. A difunde avisos; B compone jerarquías; D cambia interfaces incompatibles.

### Respuesta P03

A. El sujeto notifica mediante un contrato de observador. B fija dependencias concretas; C ofrece estructura de árbol sin suscripciones; D cambia algoritmos y no modela notificaciones.

### Respuesta P04

D. Abstract Factory produce familias relacionadas. A crea por pasos; B limita instancias; C agrupa notificaciones.

### Respuesta P05

B. Adapter traduce el contrato. A añade comportamiento conservando el contrato; C simplifica un subsistema; D intercambia algoritmos.

### Respuesta P06

C. El DAO concentra acceso y mapeo de persistencia. A presenta datos; B transporta datos; D atiende eventos de interfaz y debe delegar.

### Respuesta P07

A. La tupla es un registro completo y el dominio limita valores de un atributo. B invierte conceptos; C confunde dominio con relación; D convierte una regla de valores en un orden físico.

### Respuesta P08

D. El usuario referenciado debe existir. A niega la relación 1:N; B acepta una referencia inválida; C confunde integridad referencial con consecutividad.

### Respuesta P09

B. Un atributo no primo depende de parte de la clave compuesta. A requeriría valores no atómicos; C correspondería a una dependencia transitiva entre no claves; D ignora la dependencia parcial.

### Respuesta P10

C. Mantener la FK id_tipo en USUARIOS y almacenar la descripción en TIPOS_USUARIO elimina la dependencia transitiva del ejemplo. A solo elimina una restricción; B no corrige la dependencia; D mezcla más hechos.

### Respuesta P11

A. INSERT crea una fila. B define estructura y es DDL; C lee; D cambia una fila existente.

### Respuesta P12

D. JDBC define contratos y Connector/J los implementa para MySQL. A confunde API con motor; B trata DSN como sentencia; C identifica incorrectamente JDBC con mapeo automatizado.

### Respuesta P13

B. Cerrar la conexión lógica permite normalmente devolverla al pool. A agota recursos; C mezcla pool con sentencia; D invalida sin necesidad el conjunto completo.

### Respuesta P14

C. next() posiciona el cursor en cada fila y los getters permiten construir objetos. A no avanza el cursor; B modifica la base; D no transforma resultados.

### Respuesta P15

A. Comparten memoria del proceso, por lo que hay que coordinar accesos a datos compartidos. B describe aislamiento de procesos; C excluye una posibilidad válida; D confunde objeto con hilo.

### Respuesta P16

D. start() inicia la ejecución del nuevo Thread. A y B son llamadas ordinarias en el hilo actual; C pausa al hilo actual.

### Respuesta P17

B. Hay que poseer el monitor y volver a evaluar la condición después del despertar. A carece del monitor; C puede seguir con una condición ya falsa; D no coordina correctamente y consume CPU.

### Respuesta P18

C. Devuelve el Socket de esa conexión, que sirve para enviar y recibir. A confunde API de red y JDBC; B confunde escucha con conexión; D no representa la conexión.

### Respuesta P19

A. localhost apunta a B, donde corre el cliente. B presupone descubrimiento automático; C atribuye significado de host al puerto; D confunde resolución local con acceso público.

### Respuesta P20

D. Hay que completar la línea y enviar el buffer. A solo cambia el puerto; B no completa la línea; C no garantiza enviar el mensaje ni delimitarlo.

### Respuesta P21

Falso. La unicidad y la construcción segura no vuelven atómicas las operaciones sobre el estado. Un contador o conexión compartida todavía exige un diseño concurrente apropiado. Debe distinguirse publicación de la instancia y sincronización de su uso.

### Respuesta P22

Verdadero. Ese contrato común permite tratar uniformemente elementos individuales y grupos. El compuesto conserva hijos y combina sus resultados; una hoja realiza la operación básica.

### Respuesta P23

Falso. La intención y el contrato determinan el patrón: Decorator añade responsabilidades conservando el contrato; Adapter traduce una interfaz; Facade simplifica el acceso a un subsistema. Envolver, por sí solo, no identifica el patrón.

### Respuesta P24

Verdadero. En el ejemplo de una FK simple, un valor no nulo debe referenciar una clave válida; la nulabilidad es una restricción distinta. Si la relación es obligatoria, hay que agregar NOT NULL.

### Respuesta P25

Falso. Si ya está en 1FN, esa clave simple evita dependencias parciales respecto de ella, pero puede haber una dependencia transitiva, como id_usuario → id_tipo → nombre_tipo. Es necesario analizar también 3FN.

### Respuesta P26

Falso. Especificidad del motor y dependencia del sistema operativo son asuntos distintos. Connector/J es un driver JDBC tipo 4 escrito en Java; eso no elimina la necesidad de verificar compatibilidad entre versiones del driver, Java y MySQL.

### Respuesta P27

Falso. Pueden alternarse en un solo núcleo. Paralelismo exige ejecución simultánea; concurrencia no. Más hilos tampoco garantizan acelerar una tarea.

### Respuesta P28

Falso. Los hilos pueden poseer simultáneamente monitores diferentes. Todos los accesos que participan en esa protección deben coordinarse mediante el mismo monitor, o sustituirse por una estrategia concurrente correcta.

### Respuesta P29

Falso. TCP ofrece un flujo de bytes ordenado, no mensajes de aplicación. Las lecturas pueden dividir o agrupar lo escrito; el protocolo debe delimitar mensajes, por ejemplo con líneas o longitudes.

### Respuesta P30

Falso. Son recursos diferentes. El cierre de escucha impide nuevas aceptaciones y desbloquea accept() con una excepción; las conexiones ya aceptadas deben gestionarse y cerrarse por separado.

### Respuesta P31

Debe distinguir: Strategy encapsula el algoritmo de exportación e introduce un contrato estable; una fábrica concentra selección y creación del producto. Pueden colaborar. Un método estático con un switch puede ser una fábrica simple: no basta para afirmar que implementa Factory Method GoF, que delega la creación mediante redefinición en subclases. Justificar el costo de añadir abstracciones.

### Respuesta P32

a) Builder organiza construcción por pasos y validación. b) Abstract Factory crea una familia compatible; Factory Method decide un producto mediante un método redefinible. c) Singleton podría imponer una instancia en su ámbito, pero introduce acceso global y puede dificultar pruebas; su estado mutable necesita coordinación. También es válida una configuración inmutable inyectada, justificando por qué evita necesitar Singleton.

### Respuesta P33

Facade simplifica el subsistema, pero puede crecer en exceso si concentra demasiadas responsabilidades. Proxy representa el servicio remoto, pero no elimina latencia ni fallas. Decorator añade auditoría delegando mediante el mismo contrato, pero muchas envolturas dificultan el seguimiento. Deben identificarse intención, rol y consecuencia, no solo nombres.

### Respuesta P34

USUARIOS(id_usuario PK); CONVERSACIONES(id_conversacion PK, id_usuario FK); MENSAJES(id_mensaje PK, id_conversacion FK). Usuario 1:N Conversación y Conversación 1:N Mensaje; usar NOT NULL si cada conversación y mensaje debe tener dueño. Una conversación puede existir sin mensajes y no se pierde su identidad al borrar el último. Las políticas ON DELETE deben decidirse explícitamente. N:M se implementaría mediante una tabla intermedia si varios usuarios participaran en varias conversaciones.

### Respuesta P35

Definir dominios, reglas de negocio, claves candidatas y dependencias. Revisar atomicidad y grupos repetidos (1FN), dependencias parciales de no primos respecto de claves compuestas (2FN) y las condiciones de 3FN, incluyendo las transitivas típicas entre no claves. Unas filas sugieren problemas, pero no prueban todas las dependencias: estas se basan en las reglas. Diseñar hasta 3FN según el curso y desnormalizar solo con evidencia de una necesidad medible y un plan de consistencia.

### Respuesta P36

En objetos hay identidad y referencias, métodos, herencia y colecciones. En el modelo relacional hay tuplas, claves y relaciones por valores; herencia y métodos no se trasladan directamente. JDBC permite ejecutar SQL y leer resultados; el programador realiza el mapeo manual. Un ORM como Hibernate automatiza parte de esa transformación, sin eliminar las decisiones de diseño relacional.

### Respuesta P37

La URL JDBC identifica protocolo, host, puerto y base, junto con el driver y las credenciales/configuración apropiados. Un DSN ODBC guarda una configuración nombrada del sistema que hay que provisionar en el entorno. Ninguna opción garantiza por sí misma más seguridad. Un pool reutiliza conexiones físicas y limita su disponibilidad; cerrar la conexión lógica suele devolverla. No se debe dejar prestada indefinidamente ni compartir indiscriminadamente una sola conexión mutable entre tareas.

### Respuesta P38

Implementar Runnable solo define la tarea. Se puede crear Thread t = new Thread(tarea); t.start();. t.join() espera su terminación; t.isAlive() indica si inició y aún no terminó, no garantiza que esté ejecutando CPU en ese instante. Estados: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED. Llamar run() directamente no crea un hilo nuevo. El hilo termina cuando run() concluye.

### Respuesta P39

Usar, por ejemplo, LinkedBlockingQueue<Mensaje>(100): productor usa put y consumidor take; bloquean ante cola llena o vacía y requieren manejar interrupciones. La cola incorpora coordinación que de otro modo requeriría wait/notify y una condición protegida. Un evento síncrono llama al receptor en el hilo emisor. Un socket remoto requiere protocolo y tratamiento de fallas de red. Distribución describe ubicación; asincronía describe la forma de esperar. Definir una política de terminación para el consumidor.

### Respuesta P40

Verificar servidor iniciado, dirección de escucha, host real y puerto, conectividad y reglas de red; localhost en el cliente apunta al cliente. Distinguir rechazo de conexión de timeout, sin asumir que cada error tiene una sola causa. Configurar timeout de conexión mediante connect y de lectura mediante setSoTimeout. Con conexión establecida, revisar UTF-8, formato, orden de intercambio, delimitadores y flush. readLine()==null indica EOF sin más datos; no es un mensaje vacío. TCP usa flujo fiable y ordenado mientras funciona; UDP usa datagramas sin esas garantías. Cerrar recursos por conexión y la escucha cuando corresponda, de forma separada.

### Respuesta P41

Definir un contrato Exportador, dos implementaciones y un servicio que delega en el objeto recibido. La selección o creación queda fuera del servicio. La ventaja es añadir algoritmos sin cambiar su delegación; el costo es administrar las estrategias.

```java
interface Exportador { String exportar(String texto); }
class Csv implements Exportador {
    public String exportar(String t) { return "CSV:" + t; }
}
class Xml implements Exportador {
    public String exportar(String t) { return "XML:" + t; }
}
class ServicioExportacion {
    private final Exportador exportador;
    ServicioExportacion(Exportador e) { this.exportador = e; }
    String exportar(String t) { return exportador.exportar(t); }
}
// El cliente elige la estrategia; el servicio solo delega.
// Ejemplo dentro de un método:
// String resultado = new ServicioExportacion(new Csv()).exportar("hola");
```

### Respuesta P42

El historial registra observadores de una interfaz y los notifica al agregar un mensaje. Las vistas se suscriben desde fuera. Debe existir baja para evitar retener observadores. La notificación sigue siendo síncrona porque se invocan métodos en el mismo hilo.

```java
import java.util.*;
interface Observador { void nuevoMensaje(String texto); }
class Historial {
    private final List<String> mensajes = new ArrayList<>();
    private final List<Observador> observadores = new ArrayList<>();
    void suscribir(Observador o) {
        if (!observadores.contains(o)) observadores.add(o);
    }
    void retirar(Observador o) { observadores.remove(o); }
    void agregar(String texto) {
        mensajes.add(texto);
        // Copia para permitir cambios en suscripciones durante el aviso.
        for (Observador o : new ArrayList<>(observadores)) {
            o.nuevoMensaje(texto);
        }
    }
}
```

### Respuesta P43

Hoja y compuesto implementan el mismo contrato. El compuesto recorre sus hijos y delega. Una lista aislada sin contrato compartido y composición recursiva no basta. Para conservar un árbol, controlar la inserción: rechazar que un nodo se añada a sí mismo o a un descendiente como antecesor; controlar también la propiedad de padres si se exige un único padre.

```java
import java.util.*;
interface ElementoMenu { void mostrar(); }
class Opcion implements ElementoMenu {
    private final String texto;
    Opcion(String t) { texto = t; }
    public void mostrar() { System.out.println(texto); }
}
class Submenu implements ElementoMenu {
    private final List<ElementoMenu> hijos = new ArrayList<>();
    void agregar(ElementoMenu e) {
        if (e == this) throw new IllegalArgumentException("Ciclo directo");
        // Para árboles arbitrarios también se deben detectar ciclos indirectos.
        hijos.add(e);
    }
    public void mostrar() {
        for (ElementoMenu e : hijos) e.mostrar();
    }
}
// El ejemplo presupone que quien construye el menú evita ciclos indirectos.
```

### Respuesta P44

1FN: extraer la colección de teléfonos a filas de TELEFONOS_ESTUDIANTE. 2FN: separar datos que dependen solo de estudiante o de curso; nota depende de la pareja. 3FN: separar DOCENTES porque curso → docente → nombre_docente. Con las dependencias indicadas, las relaciones finales están en 3FN. No inventar dependencias a partir de los nombres ni usar una clave artificial para ocultar las existentes.

```text
ESTUDIANTES(
  estudiante PK,
  nombre_estudiante
)
TELEFONOS_ESTUDIANTE(
  estudiante FK -> ESTUDIANTES.estudiante,
  telefono,
  PK(estudiante, telefono)
)
DOCENTES(docente PK, nombre_docente)
CURSOS(
  curso PK,
  nombre_curso,
  docente FK -> DOCENTES.docente
)
MATRICULA(
  estudiante FK -> ESTUDIANTES.estudiante,
  curso FK -> CURSOS.curso,
  nota,
  PK(estudiante, curso)
)
```

### Respuesta P45

La sentencia debe usar dos parámetros, asignados en orden 1 y 2. executeUpdate() devuelve las filas afectadas. try-with-resources libera sentencia y conexión aun ante SQLException. Un resultado cero indica que no se actualizó ninguna fila según las condiciones y la semántica del driver; no debe informarse éxito ciego.

```java
import java.sql.*;
import javax.sql.DataSource;

// Método dentro de una clase de acceso a datos:
static int actualizarNombre(DataSource ds, int id, String nombre)
        throws SQLException {
    String sql = "UPDATE usuarios SET nombre=? WHERE id_usuario=?";
    try (Connection c = ds.getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setString(1, nombre); // Valor, no fragmento de SQL.
        ps.setInt(2, id);
        return ps.executeUpdate();
    }
}
```

### Respuesta P46

El DAO avanza el cursor, convierte cada fila y devuelve datos independientes de los recursos JDBC. Una lista vacía representa ausencia de filas. Entregar ResultSet a la vista acopla presentación y persistencia y dificulta determinar quién cierra conexión y sentencia. El mapeo manual no convierte JDBC en ORM.

```java
import java.sql.*;
import java.util.*;
import javax.sql.DataSource;

class UsuarioDTO {
    final int id;
    final String nombre;
    UsuarioDTO(int id, String nombre) { this.id = id; this.nombre = nombre; }
}
class UsuarioDAO {
    static List<UsuarioDTO> listarActivos(DataSource ds) throws SQLException {
        List<UsuarioDTO> usuarios = new ArrayList<>();
        String sql = "SELECT id_usuario, nombre FROM usuarios WHERE activo=?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setBoolean(1, true);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    usuarios.add(new UsuarioDTO(
                        rs.getInt("id_usuario"), rs.getString("nombre")));
                }
            }
        }
        return usuarios;
    }
}
```

### Respuesta P47

No está garantizado: n++ no es atómico y se pueden perder actualizaciones. Un mismo objeto Contador debe proteger incrementos y lecturas con su monitor; también sería válido AtomicInteger. join espera que cada hilo termine, pero no vuelve atómicas operaciones que ya se ejecutaron con carrera.

```java
class Contador {
    private int n;
    synchronized void incrementar() { n++; }
    synchronized int valor() { return n; }
}
// Dentro de un método que declara throws InterruptedException:
Contador c = new Contador();
Runnable tarea = () -> {
    for (int i = 0; i < 1000; i++) c.incrementar();
};
Thread a = new Thread(tarea);
Thread b = new Thread(tarea);
a.start();
b.start();
a.join(); // Esperar terminación; no sustituye al monitor.
b.join();
System.out.println(c.valor()); // 2000, bajo los supuestos indicados.
```

### Respuesta P48

La tarea revisa la interrupción y termina cuando se interrumpe la espera. Debe restaurar el indicador antes de salir si no propaga la excepción. finally asegura la limpieza. No se emplean Thread.stop() ni un cierre ficticio del objeto Thread.

```java
public void run() {
    try {
        while (!Thread.currentThread().isInterrupted()) {
            Thread.sleep(1000);
            trabajar();
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt(); // Restaurar y terminar.
    } finally {
        limpiar();
    }
}
```

### Respuesta P49

write no agrega terminador y BufferedWriter puede retener el texto. Enviar newLine y flush. El timeout de conexión y el de lectura son independientes. readLine retorna null ante EOF sin más datos; distinguirlo de una respuesta vacía. Ambos extremos deben usar la misma codificación y secuencia del protocolo.

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

static String ping(String host, int puerto) throws IOException {
    try (Socket s = new Socket()) {
        s.connect(new InetSocketAddress(host, puerto), 3000);
        s.setSoTimeout(3000); // Timeout de lectura, no de conexión.
        try (BufferedWriter out = new BufferedWriter(new OutputStreamWriter(
                     s.getOutputStream(), StandardCharsets.UTF_8));
             BufferedReader in = new BufferedReader(new InputStreamReader(
                     s.getInputStream(), StandardCharsets.UTF_8))) {
            out.write("PING");
            out.newLine(); // Delimitar mensaje.
            out.flush();   // Enviar el buffer.
            String respuesta = in.readLine();
            if (respuesta == null) throw new EOFException("Sin respuesta");
            if (!"PONG".equals(respuesta))
                throw new IOException("Respuesta inesperada: " + respuesta);
            return respuesta;
        }
    }
}
```

### Respuesta P50

Separar aceptación de atención. Un pool fijo con cola limitada evita crecimiento ilimitado de hilos y cola; ante saturación cerrar el socket rechazado. Cada manejador posee y cierra su conexión. Para negocio real, interpretar y validar petición, invocar servicio y delegar persistencia al DAO con conexiones de duración acotada. Un apagado completo cierra escucha, deja de aceptar, coordina tareas y cierra sockets pendientes/activos según la política. El ejemplo es un servidor de demostración; su método atender atiende una sola línea y su finally no constituye por sí solo un protocolo completo de apagado.

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;

class ServidorDemo {
    static void atender(Socket s) {
        // Se adquiere la propiedad del socket y se libera al terminar.
        try (Socket cliente = s) {
            cliente.setSoTimeout(3000);
            try (BufferedReader in = new BufferedReader(new InputStreamReader(
                         cliente.getInputStream(), StandardCharsets.UTF_8));
                 BufferedWriter out = new BufferedWriter(new OutputStreamWriter(
                         cliente.getOutputStream(), StandardCharsets.UTF_8))) {
                String peticion = in.readLine();
                if (peticion == null) return;
                out.write("PING".equals(peticion) ? "PONG" : "ERROR");
                out.newLine();
                out.flush();
            }
        } catch (IOException e) {
            System.err.println("Cliente: " + e.getMessage());
        }
    }
    public static void main(String[] args) throws IOException {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
            4, 4, 0L, TimeUnit.MILLISECONDS,
            new ArrayBlockingQueue<Runnable>(20),
            new ThreadPoolExecutor.AbortPolicy());
        try (ServerSocket servidor = new ServerSocket(5000)) {
            while (true) {
                Socket s = servidor.accept();
                try {
                    pool.execute(() -> atender(s));
                } catch (RejectedExecutionException e) {
                    // Sin trabajador ni lugar en cola: no filtrar recursos.
                    try { s.close(); }
                    catch (IOException cierre) {
                        System.err.println(cierre.getMessage());
                    }
                }
            }
        } finally {
            pool.shutdown(); // Solicitud de cierre ordenado del pool.
        }
    }
}
// Para apagar externamente: mantener una referencia controlada al
// ServerSocket, cerrarlo para desbloquear accept(), y coordinar la
// finalización/cierre de tareas pendientes y sockets activos.
// El timeout limita esperas de lectura sin datos; no fija una duración
// total de sesión frente a un cliente que envía bytes muy lentamente.
```

## Parte 4. Cobertura del temario

| Subtema | Tarjetas | Preguntas |
|---|---|---|
| Propósito y selección | T01, T05, T15 | P21, P31 |
| Clasificación | T02, T15 | P01 |
| Strategy | T03 | P02, P31, P41 |
| Observer | T04, T05 | P02, P03, P42 |
| Composite | T06 | P03, P22, P43 |
| Factory Method | T07 | P04, P31, P32 |
| Abstract Factory | T07 | P04, P32 |
| Singleton | T08 | P21, P32 |
| Builder | T09 | P32 |
| Adapter | T10 | P05, P23 |
| Decorator | T11 | P05, P23, P33 |
| Facade | T12 | P05, P23, P33 |
| Proxy | T13 | P33 |
| DAO y DTO | T14, T33 | P06, P46 |
| Arquitectura por capas | T14, T33 | P06, P46 |
| Modelo relacional | T16 | P07 |
| Claves e integridad | T17, T18 | P08, P24, P44 |
| Cardinalidades y AVI | T19, T24 | P08, P34 |
| Anomalías y normalización | T20, T24 | P34, P35, P44 |
| 1FN | T21 | P35, P44 |
| 2FN | T22 | P09, P25, P35, P44 |
| 3FN | T23 | P10, P25, P35, P44 |
| Objetos y mapeo | T25, T32 | P14, P36, P46 |
| SQL y CRUD | T26, T31 | P11, P45 |
| Drivers JDBC ODBC | T27 | P12, P26, P37 |
| DSN y plataforma | T27 | P12, P26, P37 |
| Pool de conexiones | T28 | P13, P37 |
| Flujo JDBC | T29, T31 | P14, P45 |
| Cierre de recursos | T29 | P13, P37, P45, P46 |
| PreparedStatement | T30 | P45, P46 |
| Procesos e hilos | T34 | P15, P38 |
| Clases activas | T34 | P15, P38 |
| Concurrencia y paralelismo | T35 | P27 |
| Thread Runnable y estados | T36 | P16, P38 |
| sleep join isAlive | T37 | P38, P47, P48 |
| Interrupción y terminación | T38 | P48 |
| Carreras y sincronización | T39 | P28, P47 |
| wait notify notifyAll | T40 | P17, P39 |
| Mensajes locales y colas | T41 | P39 |
| Bloqueos y recursos | T42 | P50 |
| Sockets TCP y UDP | T43 | P29, P40 |
| Roles Socket ServerSocket | T44 | P18, P49 |
| Host puerto localhost | T45 | P19, P40 |
| Flujos y protocolo | T46 | P20, P29, P49 |
| Bloqueo y errores de red | T47 | P20, P40, P49 |
| Servidor concurrente | T48 | P30, P50 |
| Distribución y asincronía | T49 | P39, P50 |
| Cierre de red e integración | T50 | P30, P40, P50 |

## Fuentes y procedencia

A, B y C son los PDF proporcionados. Las referencias R corresponden a investigación complementaria consultada el 21 de octubre de 2026. Los casos, preguntas y soluciones son elaboración original para practicar; las fuentes respaldan los conceptos, no predicen las preguntas del profesor.

- **A.** Material del curso: CLASE_7_8_9_PROGRA_III.pdf. 19 páginas. Modelo relacional, integridad, cardinalidades, 1FN-3FN, objetos, AVI y capas.
- **B.** Material del curso: CLASE_10 (1).pdf. 9 páginas. Drivers, DSN, conexiones, pool, DML y mapeo/ORM.
- **C.** Material del curso: CLASE_11 (2).pdf. 14 páginas. Clases activas, procesos, hilos, sincronización y comunicación local.
- **R1.** [NASA/HEASARC: clasificación de patrones](https://heasarc.gsfc.nasa.gov/docs/software/xspec/xspec12/design/designPatterns/designpatterns.html). Clasificación y uso de patrones en software real.
- **R2.** [NASA/HEASARC: patrones creacionales](https://heasarc.gsfc.nasa.gov/docs/software/xspec/xspec12/design/designPatterns/creational/creational.html). Singleton, Factory y Abstract Factory.
- **R3.** [NASA/HEASARC: patrones estructurales](https://heasarc.gsfc.nasa.gov/docs/software/xspec/xspec12/design/designPatterns/structural/structural.html). Composite y jerarquías parte-todo.
- **R4.** [NASA/HEASARC: patrones de comportamiento](https://heasarc.gsfc.nasa.gov/docs/software/xspec/xspec12/design/designPatterns/behavioral/behavioral.html). Observer y Strategy.
- **R5.** [Oracle Java API: PropertyChangeSupport](https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/java/beans/PropertyChangeSupport.html). Ejemplo oficial de suscripción, baja y aviso a listeners.
- **R6.** [Microsoft Press / autor Steve McConnell: Code Complete, muestra editorial](https://www.informit.com/content/images/9780735619678/samplepages/9780735619678.pdf). Capítulo 5: uso de patrones y tabla 5-1. Apoyo de Adapter, Decorator, Facade y criterios de selección.
- **R7.** [Oracle: eBusiness Smart Components, patrones](https://docs.oracle.com/cd/E13210_01/wlcs/docs20/pdf/comp.pdf). Proxy y familias de patrones; documentación histórica para conceptos.
- **R8.** [Oracle: Data Access Object](https://www.oracle.com/java/technologies/dataaccessobject.html). Responsabilidades de acceso a datos y transferencia de objetos.
- **R9.** [MySQL: descripción de Connector/J](https://dev.mysql.com/doc/connector-j/en/connector-j-overview.html). Driver JDBC tipo 4, implementación Java.
- **R10.** [Oracle: procesamiento SQL con JDBC](https://docs.oracle.com/javase/tutorial/jdbc/basics/processingsqlstatements.html). Flujo JDBC, resultados y cierre de recursos.
- **R11.** [Oracle: PreparedStatement](https://docs.oracle.com/javase/tutorial/jdbc/basics/prepared.html). Parámetros y separación entre datos y SQL.
- **R12.** [Oracle Java API: Thread](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html). start, run, join, sleep, interrupciones y finalización.
- **R13.** [Oracle Java API: Thread.State](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.State.html). Los seis estados oficiales.
- **R14.** [Oracle: Guarded Blocks](https://docs.oracle.com/javase/tutorial/essential/concurrency/guardmeth.html). Monitor, wait y condición dentro de while.
- **R15.** [Oracle Java API: BlockingQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/BlockingQueue.html). Productor-consumidor y bloqueo por disponibilidad/capacidad.
- **R16.** [Oracle Java API: ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html). Trabajadores, cola y políticas de rechazo.
- **R17.** [Oracle: All About Sockets](https://docs.oracle.com/javase/tutorial/networking/sockets/index.html). Canal TCP y extremos de la conexión.
- **R18.** [Oracle: servidor con sockets y múltiples clientes](https://docs.oracle.com/javase/tutorial/networking/sockets/clientServer.html). Aceptación, protocolo y atención por tareas.
- **R19.** [Oracle Java API: Socket](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/Socket.html). Conexión, flujos, timeout de lectura y cierre.
- **R20.** [Oracle Java API: ServerSocket](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/ServerSocket.html). Escucha, accept y cierre de escucha.
- **R21.** [Oracle: lectura y escritura con sockets](https://docs.oracle.com/javase/tutorial/networking/sockets/readingWriting.html). Intercambio por líneas y recursos de una conexión.
- **R22.** [Oracle Java API: HttpRequest.Builder](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html). Ejemplo oficial de construcción con opciones y build(); API disponible desde Java 11, citada solo como ejemplo conceptual.
- **R23.** [Oracle: datagramas UDP](https://docs.oracle.com/javase/tutorial/networking/datagrams/index.html). Comparación conceptual de datagramas UDP con el flujo TCP.
- **R24.** [MySQL: CREATE INDEX e índices UNIQUE](https://dev.mysql.com/doc/refman/8.4/en/create-index.html). Unicidad y valores NULL en índices UNIQUE.