# Trabajo en este repositorio

- Publica únicamente `public/`. Mantén documentación, herramientas y pruebas fuera de esa carpeta.
- Conserva los IDs y el contenido de los bancos de estudio. Una mejora visual no autoriza cambiar preguntas ni claves.
- Mantén las rutas relativas y la compatibilidad con GitHub Pages en una subcarpeta.
- Trabaja en commits pequeños y ejecuta `npm run validate` antes de entregar.
- No añadas rutas absolutas, nombres de usuario ni referencias a una computadora específica.

<!-- antislop:start -->
## AntiSlop

Para interfaz, textos, accesibilidad, diseño móvil o comentarios de código, lee primero `DESIGN.md` y después la habilidad `antislop` del catálogo de habilidades disponible.

Las habilidades están instaladas a nivel de usuario en `$CODEX_HOME/skills/` (o `~/.codex/skills/` si esa variable no está definida):

- Núcleo: `antislop/SKILL.md`.
- Interfaz: `antislop-ui/SKILL.md`.
- Textos: `antislop-copywriting/SKILL.md`.
- Accesibilidad: `antislop-human/SKILL.md`.
- Diseño móvil: `antislop-layoutmobile/SKILL.md`.
- Comentarios: `antislop-code/SKILL.md`, limitado a cambios de comentarios.

Resuelve el modo en el orden indicado por el núcleo: elección explícita para la sesión, preferencia global y, si ninguna existe, pregunta. No guardes una preferencia global sin una petición explícita. En modo `after`, espera la aprobación de los hallazgos que se van a corregir.

Comprueba contraste, teclado, estados y tamaños de pantalla. Registra las decisiones y las verificaciones en `docs/anti-slop.md` y ejecuta los cuatro bloques de Delivery Gate antes de entregar. No generes imágenes, logotipos ni otros recursos visuales sin autorización.
<!-- antislop:end -->
