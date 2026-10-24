# Publicación en GitHub Pages

El sitio se sirve directamente desde los archivos de `public/`. No necesita compilación, backend ni secretos adicionales configurados en el repositorio.

## Configuración inicial

1. Sube los commits de tu rama de trabajo al repositorio y revisa las verificaciones de Actions.
2. En GitHub, abre **Settings → Pages → Build and deployment** y selecciona **GitHub Actions** como **Source**. La opción anterior de publicar directamente desde una rama ya no sirve para esta distribución, porque el sitio vive en `public/`.
3. Integra los cambios en `main`. El workflow se ejecutará y publicará cuando pase la validación.
4. Revisa la ejecución **Validar y publicar en GitHub Pages** en la pestaña **Actions**. El trabajo **Publicar sitio** muestra la dirección del sitio en el entorno `github-pages`.

Si el entorno `github-pages` tiene reglas de protección, debe permitir desplegar desde `main`; cualquier aprobación configurada en GitHub sigue siendo necesaria.

## Cuándo se ejecuta

| Evento | Validación | Publicación |
| --- | --- | --- |
| Push a una rama distinta de `main` | Sí | No |
| Pull request dirigido a `main` | Sí | No |
| Push a `main` | Sí | Sí, si pasa la validación |
| Ejecución manual desde Actions sobre `main` | Sí | Sí, si pasa la validación |
| Ejecución manual sobre otra rama | Sí | No |

La ejecución manual estará disponible en la pestaña Actions cuando el workflow exista en la rama predeterminada. No hay despliegues de vista previa para los pull requests.

## Qué hace el workflow

- Prepara Node.js 24 y ejecuta `npm ci` usando el lockfile.
- Ejecuta `npm run validate`: comprueba archivos, JSON, sintaxis, rutas y las pruebas del material.
- Si corresponde publicar y la validación terminó correctamente, configura Pages, sube únicamente `public/` como artefacto y lo despliega.

El permiso general es de lectura del repositorio. Solo el trabajo de publicación tiene `pages: write` e `id-token: write`. Las acciones están fijadas a commits concretos, con comentarios que indican su versión principal. Los despliegues comparten un grupo de concurrencia para evitar publicaciones simultáneas sin cancelar una que ya esté en curso.

## Comprobar antes de publicar

Desde la raíz del repositorio:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run validate
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

Abre `http://127.0.0.1:8000`. Comprueba la navegación, el destino `cuestionario.html#p41`, la paginación y la vista de impresión. En Pages, las rutas relativas permiten servir el sitio dentro de la subcarpeta del repositorio.

Si falla **Validar sitio**, corrige el error antes de intentar publicar. Si solo falla **Publicar sitio**, revisa que la fuente de Pages sea GitHub Actions, que la rama sea `main` y que las reglas del entorno permitan ese despliegue.

Referencia: [workflows personalizados para GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
