/**
 * Document Store — reactive document state management.
 *
 * This is the single source of truth for the canvas content.
 * All components (canvas, inspector, layers) read from and write to this store.
 *
 * Architecture:
 * - Store holds the current document and selection
 * - Actions mutate the document and push to undo stack
 * - Undo/redo is snapshot-based (temporary; will become graph-based in Phase 5)
 */

import {
  RashamonDocument,
  SceneNode,
  ShapeSceneNode,
  GroupSceneNode,
  TextSceneNode,
  NodeId,
  Transform,
  RectGeometry,
  EllipseGeometry,
  LineGeometry,
  Fill,
  Stroke,
  Vec2,
} from '@rashamon/types';
import { createDocument } from '@rashamon/core';

// ─── History (temporary: snapshot-based linear undo/redo) ──
// NOTE: This is a temporary approach. The final system will use
// graph-based history (Phase 5). The snapshot strategy is explicit
// here so it can be cleanly replaced later.

interface HistoryState {
  past: RashamonDocument[];
  present: RashamonDocument;
  future: RashamonDocument[];
}

const MAX_HISTORY = 100;

function snapshot(doc: RashamonDocument): RashamonDocument {
  return JSON.parse(JSON.stringify(doc));
}

// ─── Store ───────────────────────────────────────────────────

export interface DocumentStore {
  history: HistoryState;
  selectedId: NodeId | null;
  listeners: Set<() => void>;
}

function createInitialStore(): DocumentStore {
  const doc = createDocument('Untitled');
  return {
    history: {
      past: [],
      present: doc,
      future: [],
    },
    selectedId: null,
    listeners: new Set(),
  };
}

let store: DocumentStore = createInitialStore();

// ─── Subscribe / notify ──────────────────────────────────────

export function subscribe(listener: () => void): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of store.listeners) {
    listener();
  }
}

// ─── Getters ─────────────────────────────────────────────────

export function getDocument(): RashamonDocument {
  return store.history.present;
}

export function getSelectedId(): NodeId | null {
  return store.selectedId;
}

export function getSelectedNode(): SceneNode | null {
  if (!store.selectedId) return null;
  return findNode(store.history.present.root, store.selectedId);
}

// ─── Actions (push to undo stack) ────────────────────────────

function pushHistory(): void {
  const { past, present } = store.history;
  const newPast = [...past, snapshot(present)];
  if (newPast.length > MAX_HISTORY) {
    newPast.shift();
  }
  store.history = {
    past: newPast,
    present: snapshot(present),
    future: [],
  };
}

export function undo(): boolean {
  const { past, present, future } = store.history;
  if (past.length === 0) return false;
  const prev = past[past.length - 1];
  store.history = {
    past: past.slice(0, -1),
    present: snapshot(prev),
    future: [snapshot(present), ...future],
  };
  store.selectedId = null;
  notify();
  return true;
}

export function redo(): boolean {
  const { past, present, future } = store.history;
  if (future.length === 0) return false;
  const next = future[0];
  store.history = {
    past: [...past, snapshot(present)],
    present: snapshot(next),
    future: future.slice(1),
  };
  notify();
  return true;
}

export function canUndo(): boolean {
  return store.history.past.length > 0;
}

export function canRedo(): boolean {
  return store.history.future.length > 0;
}

// ─── Document operations ─────────────────────────────────────

export function newDocument(title?: string): void {
  pushHistory();
  store.history.present = createDocument(title || 'Untitled');
  store.selectedId = null;
  notify();
}

export function setDocument(doc: RashamonDocument): void {
  store.history = {
    past: [],
    present: doc,
    future: [],
  };
  store.selectedId = null;
  notify();
}

// ─── Node operations ────────────────────────────────────────

export function addShapeNode(
  geometry: RectGeometry | EllipseGeometry | LineGeometry,
  name: string,
  fill: Fill | null = null,
  stroke: Stroke | null = null,
  position?: Vec2
): NodeId {
  pushHistory();
  const doc = store.history.present;
  const id = generateId();

  const node: ShapeSceneNode = {
    id,
    name,
    type: 'shape',
    geometry,
    fill,
    stroke,
    transform: { x: position?.x ?? 0, y: position?.y ?? 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  doc.root.children.push(node);
  store.selectedId = id;
  notify();
  return id;
}

export function addTextNode(
  content: string,
  position: Vec2,
  fontSize: number = 16,
  fontFamily: string = 'Inter, system-ui, sans-serif',
  fill: string = '#FFFFFF'
): NodeId {
  pushHistory();
  const doc = store.history.present;
  const id = generateId();

  const node: TextSceneNode = {
    id,
    name: 'Text',
    type: 'text',
    content,
    fontFamily,
    fontSize,
    fill,
    transform: { x: position.x, y: position.y, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  doc.root.children.push(node);
  store.selectedId = id;
  notify();
  return id;
}

export function updateTextContent(id: NodeId, content: string): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'text') return;
  node.content = content;
  notify();
}

export function updateTextProperties(id: NodeId, props: Partial<Pick<TextSceneNode, 'fontSize' | 'fontFamily' | 'fill'>>): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'text') return;
  Object.assign(node, props);
  notify();
}

export function selectNode(id: NodeId | null): void {
  store.selectedId = id;
  notify();
}

export function updateTransform(id: NodeId, transform: Partial<Transform>): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node) return;
  node.transform = { ...node.transform, ...transform };
  notify();
}

export function resizeNode(id: NodeId, geometry: Partial<RectGeometry | EllipseGeometry | LineGeometry>, pushHistoryFlag: boolean = true): void {
  if (pushHistoryFlag) {
    pushHistory();
  }
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'shape') return;

  const geo = node.geometry;
  if (geo.type === 'rect' && geometry.type === 'rect') {
    geo.width = geometry.width ?? geo.width;
    geo.height = geometry.height ?? geo.height;
    if (geometry.cornerRadius) geo.cornerRadius = geometry.cornerRadius;
  } else if (geo.type === 'ellipse' && geometry.type === 'ellipse') {
    geo.rx = geometry.rx ?? geo.rx;
    geo.ry = geometry.ry ?? geo.ry;
  } else if (geo.type === 'line' && geometry.type === 'line') {
    geo.x1 = geometry.x1 ?? geo.x1;
    geo.y1 = geometry.y1 ?? geo.y1;
    geo.x2 = geometry.x2 ?? geo.x2;
    geo.y2 = geometry.y2 ?? geo.y2;
  }
  notify();
}

export function rotateNode(id: NodeId, angle: number, pushHistoryFlag: boolean = true): void {
  if (pushHistoryFlag) {
    pushHistory();
  }
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node) return;
  node.transform.rotation = (node.transform.rotation + angle) % 360;
  notify();
}

export function updateNodeName(id: NodeId, name: string): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node) return;
  node.name = name;
  notify();
}

export function updateFill(id: NodeId, fill: Fill | null): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'shape') return;
  node.fill = fill;
  notify();
}

export function updateStroke(id: NodeId, stroke: Stroke | null): void {
  pushHistory();
  const doc = store.history.present;
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'shape') return;
  node.stroke = stroke;
  notify();
}

export function deleteNode(id: NodeId): void {
  pushHistory();
  const doc = store.history.present;
  removeNode(doc.root, id);
  if (store.selectedId === id) {
    store.selectedId = null;
  }
  notify();
}

// ─── Flat node list for layers panel ────────────────────────

export interface FlatNode {
  id: NodeId;
  name: string;
  type: string;
  depth: number;
  visible: boolean;
}

export function getFlatNodeList(): FlatNode[] {
  const result: FlatNode[] = [];
  flatten(store.history.present.root, 0, result);
  return result;
}

function flatten(node: SceneNode, depth: number, result: FlatNode[]): void {
  result.push({
    id: node.id,
    name: node.name,
    type: node.type,
    depth,
    visible: node.visible,
  });
  if (node.type === 'group') {
    const group = node as GroupSceneNode;
    for (const child of group.children) {
      flatten(child, depth + 1, result);
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────

export function findNode(node: SceneNode, id: NodeId): SceneNode | null {
  if (node.id === id) return node;
  if (node.type === 'group') {
    const group = node as GroupSceneNode;
    for (const child of group.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNode(parent: SceneNode, id: NodeId): boolean {
  if (parent.type === 'group') {
    const group = parent as GroupSceneNode;
    const idx = group.children.findIndex((c) => c.id === id);
    if (idx >= 0) {
      group.children.splice(idx, 1);
      return true;
    }
    for (const child of group.children) {
      if (removeNode(child, id)) return true;
    }
  }
  return false;
}

let _idCounter = 0;
function generateId(): string {
  _idCounter++;
  return `node-${Date.now()}-${_idCounter}`;
}

// ─── Reset (for testing) ─────────────────────────────────────

export function resetStore(): void {
  store = createInitialStore();
  _idCounter = 0;
  notify();
}
