import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  validateExam, createAttempt, answerQuestion, finishAttempt, gradeAttempt, isValidAttempt, normalizeAnswer, scoreAnswer,
} from '../public/assets/js/exam.js';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const exam = read('../public/data/simulacros/simulacro-3.json');
const others = [read('../public/data/simulacros/simulacro-1.json'), read('../public/data/simulacros/simulacro-2.json')];
const byNumber = (number) => exam.preguntas[number - 1];
const key = (number, field) => byNumber(number).campos.find((item) => item.id === field).respuestas[0];
const dashed = (items) => items.join('-');

// Respuesta correcta completa de una pregunta, según su tipo.
function fullAnswer(question) {
  if ((question.tipo ?? 'unica') === 'unica') return question.correcta;
  if (question.tipo === 'multiple') return [...question.correctas];
  return Object.fromEntries(question.campos.map((field) => [field.id, field.respuestas[0]]));
}

// --- Algoritmos de referencia para recalcular las claves -------------------
function adjacency(edges, directed) {
  const graph = new Map();
  for (const [from, to] of edges) {
    for (const [a, b] of directed ? [[from, to]] : [[from, to], [to, from]]) {
      if (!graph.has(a)) graph.set(a, []);
      if (!graph.has(b)) graph.set(b, []);
      graph.get(a).push(b);
    }
  }
  for (const list of graph.values()) list.sort((a, b) => (typeof a === 'number' ? a - b : a.localeCompare(b)));
  return graph;
}

function dfs(graph, start) {
  const order = [];
  const visit = (node) => {
    order.push(node);
    for (const next of graph.get(node)) if (!order.includes(next)) visit(next);
  };
  visit(start);
  return order;
}

function bfs(graph, start) {
  const seen = new Set([start]);
  const queue = [start];
  const order = [];
  const parent = { [start]: null };
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph.get(node)) {
      if (!seen.has(next)) { seen.add(next); parent[next] = node; queue.push(next); }
    }
  }
  return { order, parent };
}

function classifyEdges(graph, start) {
  const state = {};
  const descendants = {};
  const counts = { arbol: 0, retroceso: 0, avance: 0, cruzadas: 0 };
  const visit = (node) => {
    state[node] = 'open';
    descendants[node] = new Set();
    for (const next of graph.get(node)) {
      if (!state[next]) {
        counts.arbol++;
        visit(next);
        descendants[node].add(next);
        descendants[next].forEach((item) => descendants[node].add(item));
      } else if (state[next] === 'open') counts.retroceso++;
      else if (descendants[node].has(next)) counts.avance++;
      else counts.cruzadas++;
    }
    state[node] = 'closed';
  };
  visit(start);
  return counts;
}

class AVL {
  constructor() { this.root = null; this.simple = 0; this.double = 0; this.log = []; }
  static height(node) { return node ? node.height : -1; }
  static update(node) { node.height = 1 + Math.max(AVL.height(node.left), AVL.height(node.right)); }
  static balance(node) { return AVL.height(node.left) - AVL.height(node.right); }
  static right(y) { const x = y.left; y.left = x.right; x.right = y; AVL.update(y); AVL.update(x); return x; }
  static left(x) { const y = x.right; x.right = y.left; y.left = x; AVL.update(x); AVL.update(y); return y; }
  insert(key) { this.root = this.#insert(this.root, key); }
  #insert(node, key) {
    if (!node) return { key, left: null, right: null, height: 0 };
    if (key < node.key) node.left = this.#insert(node.left, key); else node.right = this.#insert(node.right, key);
    AVL.update(node);
    const balance = AVL.balance(node);
    if (balance > 1 && key < node.left.key) { this.simple++; this.log.push(`LL ${node.key}`); return AVL.right(node); }
    if (balance < -1 && key > node.right.key) { this.simple++; this.log.push(`RR ${node.key}`); return AVL.left(node); }
    if (balance > 1) { this.double++; this.log.push(`LR ${node.left.key} ${node.key}`); node.left = AVL.left(node.left); return AVL.right(node); }
    if (balance < -1) { this.double++; this.log.push(`RL ${node.right.key} ${node.key}`); node.right = AVL.right(node.right); return AVL.left(node); }
    return node;
  }
}

function preorder(node) { return node ? [node.key, ...preorder(node.left), ...preorder(node.right)] : []; }
function postorder(node) { return node ? [...postorder(node.left), ...postorder(node.right), node.key] : []; }

function bstFromKeys(keys) {
  let root = null;
  const insert = (node, key) => {
    if (!node) return { key, left: null, right: null };
    if (key < node.key) node.left = insert(node.left, key); else node.right = insert(node.right, key);
    return node;
  };
  for (const key of keys) root = insert(root, key);
  return root;
}

function rebuild(pre, ino) {
  if (!pre.length) return null;
  const index = ino.indexOf(pre[0]);
  return { key: pre[0], left: rebuild(pre.slice(1, index + 1), ino.slice(0, index)), right: rebuild(pre.slice(index + 1), ino.slice(index + 1)) };
}

function hashTable(size, keys, probe) {
  const table = Array(size).fill('-');
  let collided = 0;
  for (const key of keys) {
    for (let i = 0; i < size * 3; i++) {
      const position = probe(key, i) % size;
      if (table[position] === '-') { table[position] = String(key); if (i) collided++; break; }
    }
  }
  return { table, collided };
}

function cells(number) {
  return byNumber(number).campos.filter((field) => field.id.startsWith('pos')).map((field) => field.respuestas[0]);
}

function edgesFromMatrix(rows) {
  return rows.flatMap((row, from) => [...row].map(Number).flatMap((value, to) => (value ? [[from, to]] : [])));
}

const matrix = ['00010100', '10000010', '01000000', '00001001', '00100000', '00000001', '00001000', '00100010'];

// --- Pruebas -------------------------------------------------------------
test('Simulacro III: identifica el curso EIF205 y valida el banco', () => {
  assert.equal(validateExam(exam), exam);
  assert.equal(exam.id, 'simulacro-3');
  assert.match(exam.curso, /^EIF205 Estructuras de Datos$/);
  assert.match(exam.titulo, /Estructuras de Datos/);
  assert.match(exam.descripcion, /EIF205/);
  assert.equal(exam.preguntas.length, 31);
  const statements = new Set(others.flatMap((other) => other.preguntas.map((item) => item.enunciado)));
  for (const question of exam.preguntas) {
    assert.match(question.id, /^s3-p\d{2}$/);
    assert.ok(!statements.has(question.enunciado), question.id);
    assert.ok(question.explicacion.length > 60, question.id);
    if (question.figura) assert.ok(existsSync(new URL(`../public/${question.figura.src}`, import.meta.url)), question.figura.src);
  }
});

test('las claves de grafos coinciden con DFS, BFS y clasificación de aristas', () => {
  const g35 = adjacency([[10, 14], [10, 22], [14, 31], [31, 47], [47, 22], [47, 50], [22, 14], [22, 35], [35, 31], [35, 58], [58, 50], [50, 35]], true);
  assert.equal(key(1, 'recorrido'), dashed(dfs(g35, 35)));

  const g7 = adjacency([[1, 2], [1, 4], [2, 3], [2, 5], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 8], [6, 9], [7, 8], [8, 9]], false);
  assert.equal(key(12, 'recorrido'), dashed(bfs(g7, 7).order));

  const letters = adjacency([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['C', 'D'], ['D', 'F'], ['E', 'F']], true);
  const { parent } = bfs(letters, 'A');
  const path = [];
  for (let node = 'F'; node; node = parent[node]) path.unshift(node);
  assert.equal(byNumber(13).opciones.find((item) => item.id === byNumber(13).correcta).texto, path.join(' → '));

  const dag = new Map([['A', ['C']], ['B', ['C', 'E']], ['C', ['D']], ['D', []], ['E', ['D']]]);
  const finished = [];
  const seen = new Set();
  const visit = (node) => { seen.add(node); dag.get(node).forEach((next) => seen.has(next) || visit(next)); finished.push(node); };
  [...dag.keys()].forEach((node) => seen.has(node) || visit(node));
  assert.equal(byNumber(14).opciones.find((item) => item.id === byNumber(14).correcta).texto, finished.reverse().join(', '));

  const fromMatrix = adjacency(edgesFromMatrix(matrix), true);
  assert.equal(key(19, 'bfs'), dashed(bfs(fromMatrix, 0).order));
  assert.equal(key(19, 'entrada'), String(matrix.filter((row) => row[4] === '1').length));
  assert.equal(key(19, 'aristas'), String(edgesFromMatrix(matrix).length));
  assert.equal(key(19, 'celdas'), String(matrix.length ** 2));
  assert.ok(byNumber(19).codigo.includes(matrix.map((row) => [...row].join(' ')).at(-1)));

  const g0 = adjacency([[0, 1], [0, 2], [0, 4], [1, 3], [2, 1], [2, 6], [3, 0], [3, 4], [4, 5], [5, 3], [6, 5]], true);
  const counts = classifyEdges(g0, 0);
  for (const [field, value] of Object.entries(counts)) assert.equal(key(29, field), String(value), field);
  assert.ok(counts.retroceso > 0 && key(29, 'topologico').includes('retroceso'));
});

test('las claves de árboles coinciden con AVL, BST y reconstrucción', () => {
  const tree = bstFromKeys([50, 30, 70, 20, 40, 60, 80, 10, 45, 65, 90, 85]);
  const oneChild = (node) => (node ? ((node.left === null) !== (node.right === null) ? 1 : 0) + oneChild(node.left) + oneChild(node.right) : 0);
  assert.equal(key(2, 'valor'), String(oneChild(tree)));

  const avl45 = new AVL();
  for (const value of [50, 25, 75, 10, 35, 60, 90, 5, 30, 40]) avl45.insert(value);
  assert.equal(avl45.simple + avl45.double, 0, 'el árbol del enunciado ya es AVL');
  avl45.insert(45);
  assert.deepEqual(avl45.log, ['LR 25 50']);
  assert.equal(key(6, 'raiz'), String(avl45.root.key));
  assert.equal(key(6, 'pre'), dashed(preorder(avl45.root)));

  const avl20 = new AVL();
  [14, 17, 11, 7, 53, 4, 13, 12, 8, 60, 19, 16, 20].forEach((value) => avl20.insert(value));
  assert.deepEqual([key(20, 'raiz'), key(20, 'simples'), key(20, 'dobles'), key(20, 'altura'), key(20, 'pre')],
    [avl20.root.key, avl20.simple, avl20.double, avl20.root.height, dashed(preorder(avl20.root))].map(String));

  const avl24 = new AVL();
  [40, 20, 60, 10, 30, 25].forEach((value) => avl24.insert(value));
  assert.deepEqual(avl24.log, ['LR 20 40']);

  const avl25 = new AVL();
  [40, 20, 10, 25, 30, 22, 50, 60, 55, 45].forEach((value) => avl25.insert(value));
  assert.equal(key(25, 'pre'), dashed(preorder(avl25.root)));

  const letters = rebuild(['M', 'F', 'C', 'H', 'T', 'R'], ['C', 'F', 'H', 'M', 'R', 'T']);
  assert.equal(byNumber(27).opciones.find((item) => item.id === byNumber(27).correcta).texto, postorder(letters).join(', '));
  const numbers = rebuild([7, 3, 12, 1, 11, 6, 9, 8, 2, 4, 5], [12, 3, 11, 1, 6, 7, 8, 2, 9, 5, 4]);
  assert.equal(key(28, 'post'), dashed(postorder(numbers)));
});

test('solo el árbol C cumple las reglas Red-Black', () => {
  const shape = { 38: [19, 45], 19: [12, 31], 45: [41, 50], 12: [8, null], 31: [null, null], 41: [null, null], 50: [47, 55], 8: [null, null], 47: [null, null], 55: [null, null] };
  const valid = (reds) => {
    const blackHeight = (node, parentRed) => {
      if (node === null) return 1;
      const red = reds.includes(node);
      if (red && parentRed) return -1;
      const [left, right] = shape[node].map((child) => blackHeight(child, red));
      return left < 0 || left !== right ? -1 : left + (red ? 0 : 1);
    };
    return !reds.includes(38) && blackHeight(38, false) > 0;
  };
  const trees = { 'Árbol A': [19, 45, 12, 8, 47, 55], 'Árbol B': [19, 45, 47, 55], 'Árbol C': [19, 45, 8, 47, 55] };
  const validTrees = Object.entries(trees).filter(([, reds]) => valid(reds)).map(([name]) => name);
  assert.deepEqual(validTrees, ['Árbol C']);
  assert.equal(byNumber(16).opciones.find((item) => item.id === byNumber(16).correcta).texto, 'Árbol C');
});

test('las claves de hashing y backtracking coinciden con la simulación', () => {
  const double = hashTable(13, [18, 41, 22, 44, 59, 32, 31, 73], (k, i) => k % 13 + i * (7 - k % 7));
  assert.deepEqual(cells(15), double.table);
  const quadratic = hashTable(11, [3, 14, 25, 36, 8, 19, 47, 5, 16], (k, i) => k % 11 + i * i);
  assert.deepEqual(cells(17), quadratic.table);
  assert.equal(key(17, 'colisiones'), String(quadratic.collided));
  const positions = new Set(Array.from({ length: 200 }, (_, index) => ((index + 1) * 8) % 64));
  assert.equal(byNumber(10).opciones.find((item) => item.id === byNumber(10).correcta).texto, String(positions.size));

  const graph = adjacency([['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'D'], ['C', 'E'], ['C', 'F'], ['D', 'F'], ['E', 'F'], ['E', 'G'], ['F', 'G']], false);
  const nodes = [...graph.keys()].sort();
  const color = (m) => {
    const colors = {};
    const place = (index) => {
      if (index === nodes.length) return true;
      for (let candidate = 1; candidate <= m; candidate++) {
        if (graph.get(nodes[index]).every((next) => colors[next] !== candidate)) {
          colors[nodes[index]] = candidate;
          if (place(index + 1)) return true;
          delete colors[nodes[index]];
        }
      }
      return false;
    };
    return place(0) ? colors : null;
  };
  let m = 1;
  while (!color(m)) m++;
  assert.deepEqual([key(4, 'm'), key(4, 'e'), key(4, 'g')], [m, color(m).E, color(m).G].map(String));

  const leaves = [];
  const permute = (items, current, used) => {
    if (current.length === items.length) { leaves.push([...current]); return; }
    items.forEach((item, index) => {
      if (used[index]) return;
      used[index] = true; current.push(item);
      permute(items, current, used);
      current.pop(); used[index] = false;
    });
  };
  permute([1, 2, 3, 4], [], [false, false, false, false]);
  assert.equal(leaves.length, 24);
  assert.equal(key(23, 'hojas'), 'n!');
});

test('acertar todo da 100 tras mezclar, y los intentos no se cruzan con otros simulacros', () => {
  let attempt = createAttempt(exam, 1000, () => 0.3);
  assert.ok(isValidAttempt(exam, attempt));
  for (const other of others) {
    assert.equal(isValidAttempt(other, attempt), false);
    assert.equal(isValidAttempt(exam, createAttempt(other, 1000)), false);
  }
  for (const question of exam.preguntas) {
    if (question.mezclarOpciones === false) assert.deepEqual(attempt.optionOrder[question.id], question.opciones.map((item) => item.id));
    attempt = answerQuestion(exam, attempt, question.id, fullAnswer(question), 2000);
  }
  assert.ok(isValidAttempt(exam, JSON.parse(JSON.stringify(attempt))));
  const result = gradeAttempt(exam, finishAttempt(attempt, 3000));
  assert.deepEqual([result.score, result.correct, result.partial, result.incorrect, result.unanswered], [100, 31, 0, 0, 0]);
});

test('selección múltiple: todo o nada, y desmarcar todo deja la pregunta sin responder', () => {
  const question = exam.preguntas.find((item) => item.tipo === 'multiple');
  let attempt = createAttempt(exam, 1000);
  attempt = answerQuestion(exam, attempt, question.id, question.correctas.slice(0, 2), 1100);
  assert.equal(scoreAnswer(question, attempt.answers[question.id]), 0);
  attempt = answerQuestion(exam, attempt, question.id, [...question.correctas].reverse(), 1200);
  assert.equal(scoreAnswer(question, attempt.answers[question.id]), 1);
  const wrong = question.opciones.find((item) => !question.correctas.includes(item.id)).id;
  assert.equal(scoreAnswer(question, [...question.correctas, wrong]), 0);
  attempt = answerQuestion(exam, attempt, question.id, [], 1300);
  assert.equal(Object.hasOwn(attempt.answers, question.id), false);
  assert.throws(() => answerQuestion(exam, attempt, question.id, ['z'], 1400));
  assert.throws(() => answerQuestion(exam, attempt, question.id, ['a', 'a'], 1400));
});

test('campos: crédito parcial, normalización, listas cerradas y soluciones alternativas', () => {
  const table = byNumber(17);
  let attempt = createAttempt(exam, 1000);
  const half = Object.fromEntries(table.campos.slice(0, 6).map((field) => [field.id, field.respuestas[0]]));
  attempt = answerQuestion(exam, attempt, table.id, half, 1100);
  assert.equal(scoreAnswer(table, attempt.answers[table.id]), 6 / 12);
  const result = gradeAttempt(exam, finishAttempt(attempt, 1200));
  assert.equal(result.partial, 1);
  assert.equal(result.score, Math.round(0.5 / 31 * 10000) / 100);
  assert.equal(result.items.find((item) => item.question.id === table.id).outcome, 'partial');

  assert.equal(normalizeAnswer(' 35 - 31 – 47 '), '35-31-47');
  assert.equal(normalizeAnswer('Árbol'), 'arbol');
  assert.equal(scoreAnswer(byNumber(1), { recorrido: '35 - 31 - 47 - 22 - 14 - 50 - 58' }), 1);

  const permutation = byNumber(23);
  const base = fullAnswer(permutation);
  const swapped = { ...base, deshacer1: base.deshacer2, deshacer2: base.deshacer1 };
  assert.equal(scoreAnswer(permutation, swapped), 1);
  assert.equal(scoreAnswer(permutation, { ...base, deshacer1: base.deshacer2 }), 0.8);
  assert.throws(() => answerQuestion(exam, createAttempt(exam, 1000), permutation.id, { base: 'texto libre' }, 1100));
  assert.throws(() => answerQuestion(exam, createAttempt(exam, 1000), permutation.id, { inexistente: 'x' }, 1100));

  let blank = answerQuestion(exam, createAttempt(exam, 1000), table.id, { pos0: '-' }, 1100);
  blank = answerQuestion(exam, blank, table.id, { pos0: '   ' }, 1200);
  assert.equal(Object.hasOwn(blank.answers, table.id), false);
  const invalid = { ...createAttempt(exam, 1000), answers: { [table.id]: { pos0: '' } } };
  assert.equal(isValidAttempt(exam, invalid), false);
});
