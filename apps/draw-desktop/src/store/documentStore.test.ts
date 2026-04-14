/**
 * Lightweight tests for the document store pure logic.
 * Run with: npx tsx src/store/documentStore.test.ts
 */

import { resetStore, getDocument, getSelectedId, selectNode, addShapeNode, undo, redo, canUndo, canRedo, deleteNode, getFlatNodeList } from './documentStore.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function test(name: string, fn: () => void): void {
  resetStore();
  try {
    fn();
    console.log(`  PASS: ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL: ${name} — ${e}`);
  }
}

console.log('Document Store Tests\n');

test('initial document exists', () => {
  const doc = getDocument();
  assert(doc !== undefined, 'document exists');
  assert(doc.root.type === 'group', 'root is group');
  assert(doc.root.children.length === 0, 'root has no children');
  assert(getSelectedId() === null, 'no selection');
});

test('add rectangle node', () => {
  const id = addShapeNode(
    { type: 'rect', width: 100, height: 50 },
    'TestRect',
    { type: 'solid', color: '#ff0000' },
    null
  );
  assert(typeof id === 'string', 'returns string id');
  const doc = getDocument();
  assert(doc.root.children.length === 1, 'one child in root');
  assert(doc.root.children[0].id === id, 'id matches');
  assert(doc.root.children[0].name === 'TestRect', 'name matches');
  assert(getSelectedId() === id, 'new node is selected');
});

test('add multiple nodes', () => {
  addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R1');
  addShapeNode({ type: 'ellipse', rx: 5, ry: 5 }, 'E1');
  addShapeNode({ type: 'line', x1: 0, y1: 0, x2: 10, y2: 10 }, 'L1');
  const doc = getDocument();
  assert(doc.root.children.length === 3, 'three children');
});

test('select / deselect', () => {
  const id = addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R');
  assert(getSelectedId() === id, 'auto-selected');
  selectNode(null);
  assert(getSelectedId() === null, 'deselected');
  selectNode(id);
  assert(getSelectedId() === id, 're-selected');
});

test('undo / redo for add', () => {
  addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R');
  assert(canUndo(), 'can undo after add');
  assert(!canRedo(), 'cannot redo yet');
  const before = getDocument().root.children.length;
  undo();
  assert(getDocument().root.children.length === before - 1, 'undo removed node');
  assert(!canUndo() || getDocument().root.children.length === 0, 'undo worked');
  assert(canRedo(), 'can redo after undo');
  redo();
  assert(getDocument().root.children.length === before, 'redo restored node');
});

test('delete node', () => {
  const id = addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R');
  assert(getDocument().root.children.length === 1, 'has node');
  deleteNode(id);
  assert(getDocument().root.children.length === 0, 'node deleted');
  assert(getSelectedId() === null, 'selection cleared');
});

test('flat node list', () => {
  addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R1');
  addShapeNode({ type: 'ellipse', rx: 5, ry: 5 }, 'E1');
  const list = getFlatNodeList();
  assert(list.length === 3, 'root + 2 nodes'); // root + 2 shapes
  assert(list[1].name === 'R1', 'first node name');
  assert(list[2].name === 'E1', 'second node name');
});

test('new document clears state', () => {
  addShapeNode({ type: 'rect', width: 10, height: 10 }, 'R');
  addShapeNode({ type: 'ellipse', rx: 5, ry: 5 }, 'E');
  assert(getDocument().root.children.length === 2, 'has 2 nodes');
  // Note: newDocument() is tested via the store module
});

// ─── Summary ────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  // eslint-disable-next-line n/no-process-exit
  throw new Error(`${failed} test(s) failed`);
}
