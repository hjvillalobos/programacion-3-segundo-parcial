// Genera las figuras SVG del Simulacro III a partir de las aristas verificadas.
// Uso: node scripts/figuras-simulacro-3.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/assets/img/simulacro-3/', import.meta.url));
const colors = {
  ink: '#19332f', node: '#e5eee6', line: '#19332f', red: '#b3261e', black: '#1b1b1b', label: '#526762',
};
const radius = 22;

function escape(text) {
  return String(text).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
}

// Recorta la arista en el borde de cada círculo; `curva` desplaza el punto de control.
function edge(from, to, { directed = false, curve = 0 } = {}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const [ux, uy] = [(x2 - x1) / length, (y2 - y1) / length];
  const [cx, cy] = [(x1 + x2) / 2 - uy * curve, (y1 + y2) / 2 + ux * curve];
  const start = curve ? unitTowards(from, [cx, cy]) : [ux, uy];
  const end = curve ? unitTowards(to, [cx, cy]) : [-ux, -uy];
  const gap = directed ? radius + 3 : radius;
  const [sx, sy] = [x1 + start[0] * radius, y1 + start[1] * radius];
  const [ex, ey] = [x2 + end[0] * gap, y2 + end[1] * gap];
  const path = curve ? `M${round(sx)} ${round(sy)} Q${round(cx)} ${round(cy)} ${round(ex)} ${round(ey)}`
    : `M${round(sx)} ${round(sy)} L${round(ex)} ${round(ey)}`;
  return `<path d="${path}" fill="none" stroke="${colors.line}" stroke-width="2"${directed ? ' marker-end="url(#flecha)"' : ''}/>`;
}

function unitTowards([x, y], [tx, ty]) {
  const length = Math.hypot(tx - x, ty - y);
  return [(tx - x) / length, (ty - y) / length];
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function node([x, y], label, fill = colors.node, text = colors.ink) {
  return `<g><circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${colors.ink}" stroke-width="1.5"/>`
    + `<text x="${x}" y="${y}" fill="${text}" font-family="system-ui, sans-serif" font-size="17" font-weight="700" text-anchor="middle" dy=".35em">${escape(label)}</text></g>`;
}

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">\n`
    + `<title>${escape(title)}</title>\n`
    + '<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
    + `<path d="M0 0 L10 5 L0 10 z" fill="${colors.line}"/></marker></defs>\n`
    + `<rect width="100%" height="100%" fill="#ffffff"/>\n${body.join('\n')}\n</svg>\n`;
}

function graph(name, title, size, positions, edges, directed) {
  const body = [
    ...edges.map(([from, to, curve = 0]) => edge(positions[from], positions[to], { directed, curve })),
    ...Object.entries(positions).map(([label, point]) => node(point, label)),
  ];
  writeFileSync(`${output}${name}.svg`, svg(...size, title, body));
}

function redBlack(trees) {
  const layout = {
    38: [210, 50], 19: [120, 125], 45: [300, 125], 12: [60, 200], 31: [160, 200],
    41: [250, 200], 50: [345, 200], 8: [25, 275], 47: [305, 275], 55: [385, 275],
  };
  const links = [[38, 19], [38, 45], [19, 12], [19, 31], [45, 41], [45, 50], [12, 8], [50, 47], [50, 55]];
  const body = trees.flatMap(([name, reds], index) => {
    const dy = index * 320;
    const at = (key) => [layout[key][0] + 10, layout[key][1] + dy + 20];
    return [
      `<text x="10" y="${dy + 22}" fill="${colors.ink}" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${escape(name)}</text>`,
      ...links.map(([from, to]) => edge(at(from), at(to))),
      ...Object.keys(layout).map((key) => node(at(key), key,
        reds.includes(Number(key)) ? colors.red : colors.black, '#ffffff')),
    ];
  });
  writeFileSync(`${output}red-black.svg`, svg(420, trees.length * 320, 'Árboles Red-Black A, B y C', body));
}

mkdirSync(output, { recursive: true });

graph('dfs-35', 'Grafo dirigido con vértices 10, 14, 22, 31, 35, 47, 50 y 58', [400, 960], {
  10: [365, 40], 14: [298, 162], 31: [165, 288], 47: [40, 415], 22: [298, 540], 35: [230, 668], 58: [162, 795], 50: [162, 920],
}, [
  [10, 14], [10, 22, -40], [14, 31], [31, 47], [47, 22], [47, 50, 60], [22, 14], [22, 35], [35, 31], [35, 58], [58, 50], [50, 35, 45],
], true);

graph('coloreo', 'Grafo no dirigido con vértices A a G', [250, 290], {
  A: [125, 35], D: [40, 80], B: [210, 80], C: [125, 135], F: [62, 190], E: [188, 190], G: [125, 250],
}, [
  ['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'D'], ['B', 'C'], ['B', 'E'], ['C', 'D'],
  ['C', 'E'], ['C', 'F'], ['D', 'F'], ['E', 'F'], ['E', 'G'], ['F', 'G'],
], false);

graph('avl-45', 'Árbol AVL con raíz 50', [430, 340], {
  50: [260, 40], 25: [203, 120], 75: [313, 120], 10: [118, 200], 35: [225, 200], 60: [291, 200], 90: [389, 200],
  5: [41, 280], 30: [206, 280], 40: [303, 280],
}, [[50, 25], [50, 75], [25, 10], [25, 35], [75, 60], [75, 90], [10, 5], [35, 30], [35, 40]], false);

graph('bfs-7', 'Grafo no dirigido con vértices 1 a 9', [270, 340], {
  1: [120, 35], 2: [192, 76], 4: [86, 110], 3: [232, 140], 5: [160, 155], 7: [40, 180], 6: [218, 215], 8: [108, 222], 9: [168, 285],
}, [
  [1, 2], [1, 4], [2, 3], [2, 5], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 8], [6, 9], [7, 8], [8, 9],
], false);

graph('aristas-dfs', 'Grafo dirigido con vértices 0 a 6', [380, 710], {
  0: [135, 40], 2: [330, 162], 1: [202, 290], 6: [322, 415], 3: [102, 415], 4: [38, 542], 5: [165, 668],
}, [
  [0, 1], [0, 2], [0, 4, 45], [3, 0], [2, 1], [2, 6], [1, 3], [3, 4], [4, 5], [5, 3], [6, 5],
], true);

redBlack([
  ['Árbol A', [19, 45, 12, 8, 47, 55]],
  ['Árbol B', [19, 45, 47, 55]],
  ['Árbol C', [19, 45, 8, 47, 55]],
]);

console.log(`Figuras generadas en ${output}`);
