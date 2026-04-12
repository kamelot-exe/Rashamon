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
import {
  createBranchingHistory,
  pushState,
  undo as graphUndo,
  redo as graphRedo,
  getCurrentDocument,
  canUndo as graphCanUndo,
  canRedo as graphCanRedo,
  getHistoryStats,
  type BranchingHistory,
  type HistoryNode,
} from './branchingHistory.js';

// ─── Helpers ─────────────────────────────────────────────────

function snapshot(doc: RashamonDocument): RashamonDocument {
  return JSON.parse(JSON.stringify(doc));
}

// ─── Store ───────────────────────────────────────────────────

export interface DocumentStore {
  history: BranchingHistory;
  selectedIds: Set<NodeId>;
  listeners: Set<() => void>;
}

function createInitialStore(): DocumentStore {
  const doc = createDocument('Untitled');
  return {
    history: createBranchingHistory(doc),
    selectedIds: new Set(),
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
  return getCurrentDocument(store.history);
}

export function getSelectedId(): NodeId | null {
  // Backward compat: return first selected id
  return store.selectedIds.values().next().value ?? null;
}

export function getSelectedIds(): Set<NodeId> {
  return new Set(store.selectedIds);
}

export function getSelectedNodes(): SceneNode[] {
  const doc = getCurrentDocument(store.history);
  const nodes: SceneNode[] = [];
  for (const id of store.selectedIds) {
    const node = findNode(doc.root, id);
    if (node) nodes.push(node);
  }
  return nodes;
}

export function getSelectedNode(): SceneNode | null {
  return getSelectedId() ? findNode(getCurrentDocument(store.history).root, getSelectedId()!) : null;
}

// ─── Actions (push to undo stack) ────────────────────────────

export function pushHistory(): void {
  const doc = getCurrentDocument(store.history);
  pushState(store.history, snapshot(doc));
}

export function undo(): boolean {
  const result = graphUndo(store.history);
  if (result) {
    store.selectedIds.clear();
    notify();
  }
  return result;
}

export function redo(): boolean {
  const result = graphRedo(store.history);
  if (result) notify();
  return result;
}

export function canUndo(): boolean {
  return graphCanUndo(store.history);
}

export function canRedo(): boolean {
  return graphCanRedo(store.history);
}

/**
 * Get history statistics (for dev/debug UI).
 */
export function getHistoryStatsExport() {
  return getHistoryStats(store.history);
}

/**
 * Get current history node info.
 */
export function getCurrentHistoryNode(): HistoryNode | null {
  const stats = getHistoryStats(store.history);
  const currentDoc = getCurrentDocument(store.history);
  return {
    id: store.history.currentId,
    document: currentDoc,
    parentId: null,
    children: [],
    timestamp: new Date().toISOString(),
    isBranchPoint: !stats.isOnMainBranch,
  };
}

// ─── Document operations ─────────────────────────────────────

export function newDocument(title?: string): void {
  const doc = createDocument(title || 'Untitled');
  store.history = createBranchingHistory(doc);
  store.selectedIds.clear();
  notify();
}

export function setDocument(doc: RashamonDocument): void {
  store.history = createBranchingHistory(doc);
  store.selectedIds.clear();
  notify();
}

// ─── Node operations ────────────────────────────────────────

export function addShapeNode(
  geometry: RectGeometry | EllipseGeometry | LineGeometry,
  name: string,
  fill: Fill | null = null,
  stroke: Stroke | null = null,
  position?: Vec2,
  semanticRole?: import('@rashamon/types').SemanticRole
): NodeId {
  pushHistory();
  const doc = getCurrentDocument(store.history);
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
    semanticRole,
  };

  doc.root.children.push(node);
  store.selectedIds.clear(); store.selectedIds.add(id);
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
  const doc = getCurrentDocument(store.history);
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
  store.selectedIds.clear(); store.selectedIds.add(id);
  notify();
  return id;
}

export function updateTextContent(id: NodeId, content: string): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'text') return;
  node.content = content;
  notify();
}

export function updateTextProperties(id: NodeId, props: Partial<Pick<TextSceneNode, 'fontSize' | 'fontFamily' | 'fill'>>): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'text') return;
  Object.assign(node, props);
  notify();
}

// ─── Selection (multi-selection support) ────────────────────

/**
 * Replace current selection with a single node.
 */
export function selectNode(id: NodeId | null): void {
  store.selectedIds.clear();
  if (id) store.selectedIds.add(id);
  notify();
}

/**
 * Set selection from an array of IDs.
 */
export function selectNodes(ids: NodeId[]): void {
  store.selectedIds.clear();
  for (const id of ids) {
    // Only select nodes that still exist in the document
    if (findNode(getCurrentDocument(store.history).root, id)) {
      store.selectedIds.add(id);
    }
  }
  notify();
}

/**
 * Toggle a node in/out of selection.
 */
export function toggleSelection(id: NodeId): void {
  if (store.selectedIds.has(id)) {
    store.selectedIds.delete(id);
  } else {
    store.selectedIds.add(id);
  }
  notify();
}

/**
 * Add a node to selection (for Ctrl+click add model).
 */
export function addToSelection(id: NodeId): void {
  store.selectedIds.add(id);
  notify();
}

/**
 * Remove a node from selection.
 */
export function removeFromSelection(id: NodeId): void {
  store.selectedIds.delete(id);
  notify();
}

/**
 * Clear all selection.
 */
export function clearSelection(): void {
  store.selectedIds.clear();
  notify();
}

/**
 * Check if a node is selected.
 */
export function isSelected(id: NodeId): boolean {
  return store.selectedIds.has(id);
}

export function updateTransform(id: NodeId, transform: Partial<Transform>): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node) return;
  node.transform = { ...node.transform, ...transform };
  notify();
}

export function resizeNode(id: NodeId, geometry: Partial<RectGeometry | EllipseGeometry | LineGeometry>, pushHistoryFlag: boolean = true): void {
  if (pushHistoryFlag) {
    pushHistory();
  }
  const doc = getCurrentDocument(store.history);
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
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node) return;
  node.transform.rotation = (node.transform.rotation + angle) % 360;
  notify();
}

export function updateNodeName(id: NodeId, name: string): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node) return;
  node.name = name;
  notify();
}

export function updateFill(id: NodeId, fill: Fill | null): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'shape') return;
  node.fill = fill;
  notify();
}

export function updateStroke(id: NodeId, stroke: Stroke | null): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'shape') return;
  node.stroke = stroke;
  notify();
}

export function updateSemanticRole(id: NodeId, role: import('@rashamon/types').SemanticRole | undefined): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node) return;
  node.semanticRole = role;
  notify();
}

export function deleteNode(id: NodeId): void {
  deleteNodes([id]);
}

/**
 * Delete multiple nodes at once with a single history entry.
 */
export function deleteNodes(ids: NodeId[]): void {
  if (ids.length === 0) return;
  pushHistory();
  const doc = getCurrentDocument(store.history);
  for (const id of ids) {
    removeNode(doc.root, id);
    store.selectedIds.delete(id);
  }
  notify();
}

/**
 * Delete all currently selected nodes.
 */
export function deleteSelected(): void {
  const ids = Array.from(store.selectedIds);
  deleteNodes(ids);
}

// ─── Group / Ungroup ────────────────────────────────────────

/**
 * Group selected nodes into a new parent group.
 * Nodes must share the same parent for clean grouping.
 * Creates a single history entry.
 */
export function groupSelected(): NodeId | null {
  if (store.selectedIds.size < 2) return null;

  pushHistory();
  const doc = getCurrentDocument(store.history);
  const selectedIds = Array.from(store.selectedIds);

  // Find nodes and group by common parent
  const nodesToGroup: { node: SceneNode; parent: GroupSceneNode; index: number }[] = [];
  for (const id of selectedIds) {
    const result = findNodeWithParent(doc.root, id);
    if (result) {
      nodesToGroup.push(result);
    }
  }

  if (nodesToGroup.length < 2) {
    return null;
  }

  // Group nodes that share the same parent
  const byParent = new Map<GroupSceneNode, { node: SceneNode; index: number }[]>();
  for (const item of nodesToGroup) {
    const arr = byParent.get(item.parent) || [];
    arr.push(item);
    byParent.set(item.parent, arr);
  }

  // Create one group for the largest parent set
  let bestParent: GroupSceneNode | null = null;
  let bestItems: { node: SceneNode; index: number }[] = [];
  for (const [parent, items] of byParent) {
    if (items.length > bestItems.length) {
      bestParent = parent;
      bestItems = items;
    }
  }

  if (!bestParent || bestItems.length < 2) {
    return null;
  }

  // Sort by index descending to remove from end first
  bestItems.sort((a, b) => b.index - a.index);

  const groupId = generateId();
  const groupNode: GroupSceneNode = {
    id: groupId,
    name: 'Group',
    type: 'group',
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
    children: bestItems.map((item) => item.node).reverse(),
  };

  // Remove children from parent
  for (const item of bestItems) {
    bestParent.children.splice(item.index, 1);
  }

  // Insert group at the position of the first removed child
  const insertIdx = bestItems[bestItems.length - 1].index;
  bestParent.children.splice(insertIdx, 0, groupNode);

  // Select the group
  store.selectedIds.clear();
  store.selectedIds.add(groupId);

  notify();
  return groupId;
}

/**
 * Ungroup selected groups.
 */
export function ungroupSelected(): void {
  const selectedGroups = Array.from(store.selectedIds).filter((id) => {
    const node = findNode(getCurrentDocument(store.history).root, id);
    return node && node.type === 'group';
  });

  if (selectedGroups.length === 0) return;

  pushHistory();
  const doc = getCurrentDocument(store.history);
  const newSelection: NodeId[] = [];

  for (const groupId of selectedGroups) {
    const result = findNodeWithParent(doc.root, groupId);
    if (!result) continue;

    const group = result.node as GroupSceneNode;
    const parent = result.parent;
    const groupIdx = parent.children.findIndex((c) => c.id === groupId);

    // Insert children at group position
    parent.children.splice(groupIdx, 1, ...group.children);

    // Add children to selection
    for (const child of group.children) {
      newSelection.push(child.id);
    }
  }

  store.selectedIds.clear();
  for (const id of newSelection) {
    store.selectedIds.add(id);
  }

  notify();
}

// ─── Group Scope (Enter/Exit) ───────────────────────────────

let editScopeGroupId: NodeId | null = null;

/**
 * Enter a group for focused editing.
 * Selection and layers panel will operate within this group.
 */
export function enterGroup(groupId: NodeId): boolean {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, groupId);
  if (!node || node.type !== 'group') return false;

  editScopeGroupId = groupId;
  notify();
  return true;
}

/**
 * Exit current group scope, returning to parent scope.
 */
export function exitGroup(): void {
  editScopeGroupId = null;
  notify();
}

/**
 * Get current edit scope group ID.
 * null means editing at document root level.
 */
export function getEditScopeGroupId(): NodeId | null {
  return editScopeGroupId;
}

/**
 * Get nodes within current edit scope.
 * If no scope is set, returns root children.
 */
export function getScopedNodes(): SceneNode[] {
  const doc = getCurrentDocument(store.history);
  if (!editScopeGroupId) return doc.root.children;

  const group = findNode(doc.root, editScopeGroupId);
  if (!group || group.type !== 'group') return doc.root.children;
  return (group as GroupSceneNode).children;
}

/**
 * Get the current edit scope group node (or null for root).
 */
export function getEditScopeGroup(): GroupSceneNode | null {
  if (!editScopeGroupId) return null;
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, editScopeGroupId);
  return (node && node.type === 'group') ? node as GroupSceneNode : null;
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
  flatten(getCurrentDocument(store.history).root, 0, result);
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

/**
 * Find a node and return it along with its parent group and index.
 * Used for group/ungroup operations.
 */
export function findNodeWithParent(
  node: SceneNode,
  id: NodeId,
  parent: GroupSceneNode | null = null
): { node: SceneNode; parent: GroupSceneNode; index: number } | null {
  if (node.id === id && parent) {
    const idx = parent.children.findIndex((c) => c.id === id);
    return { node, parent, index: idx };
  }
  if (node.type === 'group') {
    const group = node as GroupSceneNode;
    for (const child of group.children) {
      const found = findNodeWithParent(child, id, group);
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

// ─── Align / Distribute ─────────────────────────────────────

export type AlignOp = 'left' | 'right' | 'centerH' | 'top' | 'bottom' | 'middleV';
export type DistributeOp = 'horizontal' | 'vertical';

interface NodeBounds {
  id: NodeId;
  node: SceneNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

function getNodeBounds(node: SceneNode): { x: number; y: number; w: number; h: number } {
  const { x, y } = node.transform;
  let w = 0, h = 0;

  if (node.type === 'shape') {
    const shape = node as ShapeSceneNode;
    switch (shape.geometry.type) {
      case 'rect':
        w = shape.geometry.width;
        h = shape.geometry.height;
        break;
      case 'ellipse':
        w = shape.geometry.rx * 2;
        h = shape.geometry.ry * 2;
        break;
      case 'line':
        w = Math.abs(shape.geometry.x2 - shape.geometry.x1);
        h = Math.abs(shape.geometry.y2 - shape.geometry.y1);
        break;
      default:
        break;
    }
  } else if (node.type === 'text') {
    const textNode = node as TextSceneNode;
    w = textNode.content.length * textNode.fontSize * 0.6;
    h = textNode.fontSize;
  }

  return { x, y, w, h };
}

/**
 * Align selected nodes. Uses a single history entry.
 */
export function alignSelected(op: AlignOp): void {
  const selected = getSelectedNodes();
  if (selected.length < 2) return;

  const bounds: NodeBounds[] = selected.map((node) => ({
    id: node.id,
    node,
    ...getNodeBounds(node),
  }));

  pushHistory();

  switch (op) {
    case 'left': {
      const minX = Math.min(...bounds.map((b) => b.x));
      for (const b of bounds) {
        b.node.transform.x = minX;
      }
      break;
    }
    case 'right': {
      const maxX = Math.max(...bounds.map((b) => b.x + b.w));
      for (const b of bounds) {
        b.node.transform.x = maxX - b.w;
      }
      break;
    }
    case 'centerH': {
      const minX = Math.min(...bounds.map((b) => b.x));
      const maxX = Math.max(...bounds.map((b) => b.x + b.w));
      const center = (minX + maxX) / 2;
      for (const b of bounds) {
        b.node.transform.x = center - b.w / 2;
      }
      break;
    }
    case 'top': {
      const minY = Math.min(...bounds.map((b) => b.y));
      for (const b of bounds) {
        b.node.transform.y = minY;
      }
      break;
    }
    case 'bottom': {
      const maxY = Math.max(...bounds.map((b) => b.y + b.h));
      for (const b of bounds) {
        b.node.transform.y = maxY - b.h;
      }
      break;
    }
    case 'middleV': {
      const minY = Math.min(...bounds.map((b) => b.y));
      const maxY = Math.max(...bounds.map((b) => b.y + b.h));
      const center = (minY + maxY) / 2;
      for (const b of bounds) {
        b.node.transform.y = center - b.h / 2;
      }
      break;
    }
  }

  notify();
}

/**
 * Distribute selected nodes evenly.
 */
export function distributeSelected(op: DistributeOp): void {
  const selected = getSelectedNodes();
  if (selected.length < 3) return;

  const bounds: NodeBounds[] = selected
    .map((node) => ({ id: node.id, node, ...getNodeBounds(node) }))
    .sort((a, b) => (op === 'horizontal' ? a.x - b.x : a.y - b.y));

  pushHistory();

  const first = bounds[0];
  const last = bounds[bounds.length - 1];
  const totalSpace = op === 'horizontal' ? last.x - first.x : last.y - first.y;
  const step = totalSpace / (bounds.length - 1);

  for (let i = 1; i < bounds.length - 1; i++) {
    const targetPos = (op === 'horizontal' ? first.x : first.y) + step * i;
    if (op === 'horizontal') {
      bounds[i].node.transform.x = targetPos;
    } else {
      bounds[i].node.transform.y = targetPos;
    }
  }

  notify();
}
