import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const base = new URL('https://example.test/mi-repositorio/');

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `No se publican enlaces simbólicos: ${path}`);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

function checkReference(reference, source) {
  if (/^(https?:|mailto:|tel:)/i.test(reference)) return;
  const sourcePath = relative(root, source).replaceAll('\\', '/');
  const url = new URL(reference, new URL(sourcePath, base));
  assert.ok(url.origin === base.origin && url.pathname.startsWith(base.pathname),
    `La ruta sale de la subcarpeta de Pages: ${sourcePath} -> ${reference}`);
  const target = join(root, decodeURIComponent(url.pathname.slice(base.pathname.length)));
  assert.ok(existsSync(target) && statSync(target).isFile(),
    `Archivo local ausente: ${sourcePath} -> ${reference}`);
  if (url.hash && extname(target) === '.html') {
    const id = decodeURIComponent(url.hash.slice(1));
    const html = readFileSync(target, 'utf8');
    // Algunos destinos se crean al cargar los JSON de la sección.
    const sources = [
      ['lista-tarjetas', 'tarjetas'], ['lista-preguntas', 'preguntas'],
      ['lista-soluciones', 'soluciones'], ['lista-fuentes', 'fuentes'],
    ];
    const generated = sources.some(([container, data]) => html.includes(`id="${container}"`)
      && JSON.parse(readFileSync(join(root, 'data', `${data}.json`), 'utf8')).some((item) => item.id === id));
    assert.ok(html.includes(`id="${id}"`) || generated,
      `Destino HTML ausente: ${sourcePath} -> ${reference}`);
  }
}

const files = filesIn(root);
assert.ok(existsSync(join(root, 'index.html')), 'Falta public/index.html');
assert.ok(existsSync(join(root, '.nojekyll')), 'Falta public/.nojekyll');
for (const file of files) {
  const extension = extname(file);
  assert.ok(['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.woff', '.woff2'].includes(extension) || file === join(root, '.nojekyll'),
    `Archivo inesperado en el sitio publicable: ${relative(root, file)}`);
  if (!['.html', '.css', '.js', '.json'].includes(extension)) continue;
  const content = readFileSync(file, 'utf8');
  if (extension === '.json') JSON.parse(content);
  if (extension === '.html') {
    for (const [, reference] of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      checkReference(reference, file);
    }
  }
  if (extension === '.js') {
    for (const [, reference] of content.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
      checkReference(reference, file);
    }
  }
}

// Comprobar sintaxis sin ejecutar el código del navegador.
const scripts = [...files.filter((file) => extname(file) === '.js'),
  ...filesIn(dirname(fileURLToPath(import.meta.url))).filter((file) => extname(file) === '.mjs')];
for (const script of scripts) {
  const result = spawnSync(process.execPath, ['--check', script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || `No se pudo verificar ${script}`);
}

console.log(`Sitio válido: ${files.length} archivos, rutas relativas y sintaxis verificadas.`);
