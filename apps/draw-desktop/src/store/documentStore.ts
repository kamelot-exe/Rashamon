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
  FrameSceneNode,
  GroupSceneNode,
  TextSceneNode,
  ImageSceneNode,
  ComponentInstanceNode,
  NodeId,
  Transform,
  RectGeometry,
  EllipseGeometry,
  LineGeometry,
  Fill,
  Stroke,
  Vec2,
  ColorString,
  Rect,
  AutoLayoutConfig,
  defaultAutoLayoutConfig,
  Constraints,
  defaultConstraints,
  LayoutOverride,
  defaultLayoutOverride,
  DocumentStyle,
  StyleId,
  ColorStyle,
  TextStyle,
  ComponentDefinition,
  ComponentId,
  Effect,
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
  // Ensure backward compatibility: initialize missing fields
  if (!doc.styles) doc.styles = [];
  if (!doc.components) doc.components = [];
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
    effects: [],
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

/**
 * Add a node as a child of a specific parent (frame or group).
 * If parentId is null, adds to root.
 */
export function addNodeToParent(node: SceneNode, parentId: NodeId | null): void {
  const doc = getCurrentDocument(store.history);
  if (!parentId) {
    doc.root.children.push(node);
    return;
  }
  const parent = findNode(doc.root, parentId);
  if (parent && (parent.type === 'frame' || parent.type === 'group')) {
    (parent as ContainerNode).children.push(node);
  } else {
    doc.root.children.push(node);
  }
}

/**
 * Create a new frame node and add it to the document.
 * If parentId is provided, the frame becomes a child of that parent.
 */
export function addFrameNode(
  width: number,
  height: number,
  name: string = 'Frame',
  background: ColorString | null = '#FFFFFF',
  position?: Vec2,
  parentId?: NodeId | null
): NodeId {
  pushHistory();
  const id = generateId();

  const node: FrameSceneNode = {
    id,
    name,
    type: 'frame',
    width,
    height,
    background,
    clipContent: false,
    autoLayout: defaultAutoLayoutConfig(),
    children: [],
    transform: { x: position?.x ?? 0, y: position?.y ?? 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  addNodeToParent(node, parentId ?? null);
  store.selectedIds.clear(); store.selectedIds.add(id);
  notify();
  return id;
}

/**
 * Update frame width directly (for inspector input).
 */
export function mutateFrameWidth(id: NodeId, width: number): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'frame') return;
  (node as FrameSceneNode).width = Math.max(1, width);
  notify();
}

/**
 * Update frame height directly (for inspector input).
 */
export function mutateFrameHeight(id: NodeId, height: number): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'frame') return;
  (node as FrameSceneNode).height = Math.max(1, height);
  notify();
}

/**
 * Update frame background color.
 */
export function updateFrameBackground(id: NodeId, background: ColorString | null): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'frame') return;
  (node as FrameSceneNode).background = background;
  notify();
}

/**
 * Update frame clip content toggle.
 */
export function updateFrameClip(id: NodeId, clip: boolean): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, id);
  if (!node || node.type !== 'frame') return;
  (node as FrameSceneNode).clipContent = clip;
  notify();
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
  const nodesToGroup: { node: SceneNode; parent: ContainerNode; index: number }[] = [];
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
  const byParent = new Map<ContainerNode, { node: SceneNode; index: number }[]>();
  for (const item of nodesToGroup) {
    const arr = byParent.get(item.parent) || [];
    arr.push(item);
    byParent.set(item.parent, arr);
  }

  // Create one group for the largest parent set
  let bestParent: ContainerNode | null = null;
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

// ─── Group/Frame Scope (Enter/Exit) ───────────────────────────────

/** A container node that can be entered for scoped editing.
 * Currently: GroupSceneNode and FrameSceneNode. */
type ContainerNode = GroupSceneNode | FrameSceneNode;

let editScopeContainerId: NodeId | null = null;

/**
 * Enter a container (group or frame) for focused editing.
 * Selection and layers panel will operate within this container.
 * Clears selection to avoid referencing nodes outside scope.
 */
export function enterContainer(containerId: NodeId): boolean {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, containerId);
  if (!node || (node.type !== 'group' && node.type !== 'frame')) return false;

  editScopeContainerId = containerId;
  store.selectedIds.clear();
  notify();
  return true;
}

/**
 * Exit current container scope, returning to parent scope.
 * If inside a nested container, goes to the parent container.
 * If at top-level container, returns to document root.
 */
export function exitContainer(): void {
  if (!editScopeContainerId) return;

  const doc = getCurrentDocument(store.history);
  const result = findNodeWithParent(doc.root, editScopeContainerId);

  if (result && result.parent.id !== doc.root.id) {
    // Go to parent container
    editScopeContainerId = result.parent.id;
  } else {
    // Go to root
    editScopeContainerId = null;
  }

  notify();
}

// Backward-compatible aliases
/** @deprecated Use enterContainer */
export function enterGroup(groupId: NodeId): boolean { return enterContainer(groupId); }
/** @deprecated Use exitContainer */
export function exitGroup(): void { exitContainer(); }

/**
 * Get the full scope path from root to current scope.
 * Returns array of { id, name, type } for breadcrumb navigation.
 */
export function getScopePath(): { id: NodeId; name: string; type: string }[] {
  if (!editScopeContainerId) return [];

  const path: { id: NodeId; name: string; type: string }[] = [];
  let currentId: NodeId | null = editScopeContainerId;
  const doc = getCurrentDocument(store.history);

  const ancestors: { id: NodeId; name: string; type: string }[] = [];
  while (currentId) {
    const node = findNode(doc.root, currentId);
    if (!node) break;
    ancestors.unshift({ id: node.id, name: node.name, type: node.type });

    const result = findNodeWithParent(doc.root, currentId);
    if (!result || result.parent.id === doc.root.id) break;
    currentId = result.parent.id;
  }

  path.push(...ancestors);
  return path;
}

/**
 * Navigate to a specific scope level by container ID.
 */
export function navigateToScope(containerId: NodeId): boolean {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, containerId);
  if (!node || (node.type !== 'group' && node.type !== 'frame')) return false;

  editScopeContainerId = containerId;
  notify();
  return true;
}

/**
 * Get current edit scope container ID.
 * null means editing at document root level.
 */
export function getEditScopeGroupId(): NodeId | null {
  return editScopeContainerId;
}

/**
 * Get current edit scope container node (group or frame, or null for root).
 */
export function getEditScopeGroup(): ContainerNode | null {
  if (!editScopeContainerId) return null;
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, editScopeContainerId);
  return (node && (node.type === 'group' || node.type === 'frame')) ? node as ContainerNode : null;
}

/**
 * Get nodes within current edit scope.
 * If no scope is set, returns root children.
 * Works for both groups and frames.
 */
export function getScopedNodes(): SceneNode[] {
  const doc = getCurrentDocument(store.history);
  if (!editScopeContainerId) return doc.root.children;

  const container = findNode(doc.root, editScopeContainerId);
  if (!container || (container.type !== 'group' && container.type !== 'frame')) return doc.root.children;
  return (container as ContainerNode).children;
}

/**
 * Get a flat node list scoped to the current edit scope.
 * Only includes nodes within the current scope hierarchy.
 */
export function getScopedFlatNodeList(): FlatNode[] {
  const doc = getCurrentDocument(store.history);
  const result: FlatNode[] = [];

  if (!editScopeContainerId) {
    flatten(doc.root, 0, result);
  } else {
    const container = findNode(doc.root, editScopeContainerId);
    if (container && (container.type === 'group' || container.type === 'frame')) {
      flattenContainerChildren(container, 0, result);
    } else {
      flatten(doc.root, 0, result);
    }
  }

  return result;
}

function flattenContainerChildren(container: ContainerNode, baseDepth: number, result: FlatNode[]): void {
  for (const child of container.children) {
    result.push({
      id: child.id,
      name: child.name,
      type: child.type,
      depth: baseDepth,
      visible: child.visible,
      locked: child.locked,
      semanticRole: child.semanticRole,
    });
    if (child.type === 'group' || child.type === 'frame') {
      flattenContainerChildren(child as ContainerNode, baseDepth + 1, result);
    }
  }
}

// ─── Flat node list for layers panel ────────────────────────

export interface FlatNode {
  id: NodeId;
  name: string;
  type: string;
  depth: number;
  visible: boolean;
  locked: boolean;
  semanticRole?: import('@rashamon/types').SemanticRole;
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
    locked: node.locked,
    semanticRole: node.semanticRole,
  });
  if (node.type === 'group' || node.type === 'frame') {
    const container = node as ContainerNode;
    for (const child of container.children) {
      flatten(child, depth + 1, result);
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────

export function findNode(node: SceneNode, id: NodeId): SceneNode | null {
  if (node.id === id) return node;
  if (node.type === 'group' || node.type === 'frame') {
    const container = node as ContainerNode;
    for (const child of container.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find a node and return it along with its parent container and index.
 * Used for group/ungroup and frame operations.
 */
export function findNodeWithParent(
  node: SceneNode,
  id: NodeId,
  parent: ContainerNode | null = null
): { node: SceneNode; parent: ContainerNode; index: number } | null {
  if (node.id === id && parent) {
    const idx = parent.children.findIndex((c) => c.id === id);
    return { node, parent, index: idx };
  }
  if (node.type === 'group' || node.type === 'frame') {
    const container = node as ContainerNode;
    for (const child of container.children) {
      const found = findNodeWithParent(child, id, container);
      if (found) return found;
    }
  }
  return null;
}

function removeNode(parent: SceneNode, id: NodeId): boolean {
  if (parent.type === 'group' || parent.type === 'frame') {
    const container = parent as ContainerNode;
    const idx = container.children.findIndex((c) => c.id === id);
    if (idx >= 0) {
      container.children.splice(idx, 1);
      return true;
    }
    for (const child of container.children) {
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

/**
 * Toggle node visibility.
 */
export function toggleVisibility(nodeId: NodeId): void {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return;
  pushHistory();
  node.visible = !node.visible;
  notify();
}

/**
 * Toggle node lock.
 */
export function toggleLock(nodeId: NodeId): void {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return;
  pushHistory();
  node.locked = !node.locked;
  notify();
}

// ═══════════════════════════════════════════════════════════
// AUTO LAYOUT ENGINE
// ═══════════════════════════════════════════════════════════

/**
 * Enable auto layout on a frame.
 */
export function enableAutoLayout(frameId: NodeId, mode: 'horizontal' | 'vertical'): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, frameId);
  if (!node || node.type !== 'frame') return;

  const frame = node as FrameSceneNode;
  frame.autoLayout = { ...defaultAutoLayoutConfig(), mode };

  // Layout children according to config
  layoutChildren(frame);
  notify();
}

/**
 * Disable auto layout on a frame (switch to free-form).
 */
export function disableAutoLayout(frameId: NodeId): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, frameId);
  if (!node || node.type !== 'frame') return;

  (node as FrameSceneNode).autoLayout.mode = 'none';
  notify();
}

/**
 * Update auto layout config on a frame.
 */
export function updateAutoLayout(frameId: NodeId, updates: Partial<AutoLayoutConfig>): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, frameId);
  if (!node || node.type !== 'frame') return;

  const frame = node as FrameSceneNode;
  frame.autoLayout = { ...frame.autoLayout, ...updates };
  layoutChildren(frame);
  notify();
}

/**
 * Layout children of a frame based on auto layout config.
 * This is the core auto layout engine.
 */
function layoutChildren(frame: FrameSceneNode): void {
  const config = frame.autoLayout;
  if (config.mode === 'none' || frame.children.length === 0) return;

  const isHorizontal = config.mode === 'horizontal';

  // First pass: measure children (use their natural size)
  const children = frame.children;
  let cursor = isHorizontal ? config.paddingLeft : config.paddingTop;

  for (const child of children) {
    child.transform.x = isHorizontal ? config.paddingLeft : cursor;
    child.transform.y = isHorizontal ? cursor : config.paddingTop;

    if (isHorizontal) {
      cursor += getNodeWidth(child) + config.spacing;
    } else {
      cursor += getNodeHeight(child) + config.spacing;
    }
  }

  // Set frame size if auto sizing
  if (config.primaryAxisSizing === 'auto') {
    const totalSize = cursor - config.spacing + (isHorizontal ? config.paddingRight : config.paddingBottom);
    if (isHorizontal) {
      frame.width = totalSize;
    } else {
      frame.height = totalSize;
    }
  }
}

/**
 * Re-layout all frames (call after frame resize or config change).
 */
export function relayoutAll(): void {
  const doc = getCurrentDocument(store.history);
  relayoutNode(doc.root);
  notify();
}

function relayoutNode(node: SceneNode): void {
  if (node.type === 'frame') {
    const frame = node as FrameSceneNode;
    if (frame.autoLayout.mode !== 'none') {
      layoutChildren(frame);
    }
    for (const child of frame.children) {
      relayoutNode(child);
    }
  } else if (node.type === 'group') {
    for (const child of (node as GroupSceneNode).children) {
      relayoutNode(child);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// CONSTRAINTS
// ═══════════════════════════════════════════════════════════

/**
 * Set constraints on a child node within a frame.
 */
export function setConstraints(nodeId: NodeId, constraints: Constraints): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return;

  // Store constraints as a custom property on the node
  (node as any).constraints = constraints;
  notify();
}

/**
 * Get constraints from a node.
 */
export function getConstraints(nodeId: NodeId): Constraints | null {
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return null;
  return (node as any).constraints || null;
}

/**
 * Resolve constraints: reposition child when parent frame resizes.
 */
export function resolveConstraints(childId: NodeId, frameId: NodeId): void {
  const doc = getCurrentDocument(store.history);
  const child = findNode(doc.root, childId);
  const frame = findNode(doc.root, frameId);
  if (!child || !frame || frame.type !== 'frame') return;

  const constraints: Constraints = (child as any).constraints || defaultConstraints();
  const f = frame as FrameSceneNode;

  // Get baseline bounds if stored, otherwise use current
  const baseline: Rect = (child as any).baselineBounds || {
    x: child.transform.x,
    y: child.transform.y,
    width: getNodeWidth(child),
    height: getNodeHeight(child),
  };

  // Apply horizontal constraint
  switch (constraints.horizontal) {
    case 'left':
      child.transform.x = baseline.x;
      break;
    case 'right':
      child.transform.x = f.width - (baseline.x + baseline.width) + baseline.x;
      break;
    case 'center':
      child.transform.x = (f.width - baseline.width) / 2;
      break;
    case 'leftRight':
      // Stretch: keep left, extend width
      break;
    case 'scale':
      child.transform.x = (f.width / (baseline.width || 1)) * baseline.x;
      break;
  }

  // Apply vertical constraint
  switch (constraints.vertical) {
    case 'top':
      child.transform.y = baseline.y;
      break;
    case 'bottom':
      child.transform.y = f.height - (baseline.y + baseline.height) + baseline.y;
      break;
    case 'center':
      child.transform.y = (f.height - baseline.height) / 2;
      break;
    case 'topBottom':
      break;
    case 'scale':
      child.transform.y = (f.height / (baseline.height || 1)) * baseline.y;
      break;
  }

  notify();
}

// ═══════════════════════════════════════════════════════════
// STYLES SYSTEM
// ═══════════════════════════════════════════════════════════

/**
 * Add a style to the document.
 */
export function addStyle(style: DocumentStyle): StyleId {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  doc.styles.push(style);
  notify();
  return style.id;
}

/**
 * Remove a style from the document.
 */
export function removeStyle(styleId: StyleId): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  doc.styles = doc.styles.filter((s) => s.id !== styleId);
  // Clear references
  clearStyleReferences(styleId);
  notify();
}

/**
 * Update a style.
 */
export function updateStyle(styleId: StyleId, updates: Partial<DocumentStyle>): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const idx = doc.styles.findIndex((s) => s.id === styleId);
  if (idx < 0) return;
  doc.styles[idx] = { ...doc.styles[idx], ...updates } as DocumentStyle;
  notify();
}

/**
 * Get all styles of a specific type.
 */
export function getStylesByType(type: 'color' | 'text' | 'effect'): DocumentStyle[] {
  return getCurrentDocument(store.history).styles.filter((s) => s.type === type);
}

/**
 * Get a style by ID.
 */
export function getStyle(styleId: StyleId): DocumentStyle | undefined {
  return getCurrentDocument(store.history).styles.find((s) => s.id === styleId);
}

/**
 * Create a color style.
 */
export function createColorStyle(name: string, color: ColorString, opacity = 1): StyleId {
  const style: ColorStyle = {
    id: `style-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    type: 'color',
    color,
    opacity,
  };
  return addStyle(style);
}

/**
 * Create a text style.
 */
export function createTextStyle(
  name: string,
  fontFamily: string,
  fontSize: number,
  fontWeight = 400,
  lineHeight = 1.2,
  letterSpacing = 0,
  textAlign: 'left' | 'center' | 'right' = 'left'
): StyleId {
  const style: TextStyle = {
    id: `style-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    type: 'text',
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textAlign,
    textDecoration: 'none',
  };
  return addStyle(style);
}

/**
 * Apply a style reference to a node.
 */
export function applyStyleToNode(nodeId: NodeId, styleId: StyleId | null, styleType: 'fill' | 'text' | 'stroke' | 'effect'): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return;

  switch (styleType) {
    case 'fill':
      (node as ShapeSceneNode).fillStyleId = styleId ?? undefined;
      break;
    case 'text':
      (node as TextSceneNode).textStyleId = styleId ?? undefined;
      break;
    case 'stroke':
      (node as ShapeSceneNode).strokeStyleId = styleId ?? undefined;
      break;
    case 'effect':
      (node as ShapeSceneNode).effectStyleId = styleId ?? undefined;
      break;
  }

  notify();
}

function clearStyleReferences(styleId: StyleId): void {
  const doc = getCurrentDocument(store.history);
  function walk(node: SceneNode): void {
    if (node.type === 'shape') {
      const s = node as ShapeSceneNode;
      if (s.fillStyleId === styleId) delete s.fillStyleId;
      if (s.strokeStyleId === styleId) delete s.strokeStyleId;
      if (s.textStyleId === styleId) delete s.textStyleId;
      if (s.effectStyleId === styleId) delete s.effectStyleId;
    } else if (node.type === 'text') {
      const t = node as TextSceneNode;
      if (t.textStyleId === styleId) delete t.textStyleId;
    }
    if (node.type === 'frame' || node.type === 'group') {
      const c = node as FrameSceneNode | GroupSceneNode;
      c.children.forEach(walk);
    }
  }
  doc.root.children.forEach(walk);
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS SYSTEM
// ═══════════════════════════════════════════════════════════

/**
 * Create a component from a selected frame or group.
 * The selected node becomes the master; a component definition is stored.
 */
export function createComponentFromSelection(name: string): ComponentId | null {
  const selectedId = getSelectedId();
  if (!selectedId) return null;

  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, selectedId);
  if (!node || (node.type !== 'frame' && node.type !== 'group')) return null;

  pushHistory();

  const componentId = `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  // Deep clone the node as master snapshot
  const snapshot = JSON.parse(JSON.stringify(node));

  const def: ComponentDefinition = {
    id: componentId,
    name,
    masterNodeId: selectedId,
    masterSnapshot: snapshot,
    createdAt: now,
    updatedAt: now,
  };

  doc.components.push(def);
  notify();
  return componentId;
}

/**
 * Create an instance of a component at the given position.
 */
export function createInstance(
  componentId: ComponentId,
  position: Vec2
): NodeId | null {
  const doc = getCurrentDocument(store.history);
  const comp = doc.components.find((c) => c.id === componentId);
  if (!comp) return null;

  pushHistory();

  const instanceId = generateId();
  const master = comp.masterSnapshot as FrameSceneNode | GroupSceneNode;

  // Create instance node
  const instanceNode: ComponentInstanceNode = {
    id: instanceId,
    name: comp.name,
    type: 'componentInstance',
    width: master.type === 'frame' ? master.width : 0,
    height: master.type === 'frame' ? master.height : 0,
    componentId,
    overrides: [],
    transform: { ...position, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  addNodeToParent(instanceNode, getEditScopeGroupId());
  store.selectedIds.clear();
  store.selectedIds.add(instanceId);
  notify();
  return instanceId;
}

/**
 * Get all component definitions.
 */
export function getComponents(): ComponentDefinition[] {
  return getCurrentDocument(store.history).components;
}

/**
 * Get a component definition by ID.
 */
export function getComponent(componentId: ComponentId): ComponentDefinition | undefined {
  return getCurrentDocument(store.history).components.find((c) => c.id === componentId);
}

/**
 * Delete a component definition.
 */
export function deleteComponent(componentId: ComponentId): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  doc.components = doc.components.filter((c) => c.id !== componentId);
  notify();
}

/**
 * Update a component master from the current master node state.
 * This syncs all instances.
 */
export function updateComponentMaster(componentId: ComponentId): void {
  const doc = getCurrentDocument(store.history);
  const comp = doc.components.find((c) => c.id === componentId);
  if (!comp) return;

  pushHistory();
  const masterNode = findNode(doc.root, comp.masterNodeId);
  if (!masterNode) return;

  comp.masterSnapshot = JSON.parse(JSON.stringify(masterNode));
  comp.updatedAt = new Date().toISOString();
  notify();
}

/**
 * Detach a component instance — replace it with its current rendered structure.
 */
export function detachInstance(instanceId: NodeId): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const instance = findNode(doc.root, instanceId);
  if (!instance || instance.type !== 'componentInstance') return;

  const instNode = instance as ComponentInstanceNode;
  const comp = doc.components.find((c) => c.id === instNode.componentId);
  if (!comp) return;

  // Deep clone the master snapshot as the replacement
  const replacement: SceneNode = JSON.parse(JSON.stringify(comp.masterSnapshot));
  // Update the replacement ID to match the instance ID
  replacement.id = instanceId;
  (replacement as any).name = instNode.name;

  // Find parent and replace
  const result = findNodeWithParent(doc.root, instanceId);
  if (!result) return;

  result.parent.children[result.index] = replacement;
  notify();
}

// ═══════════════════════════════════════════════════════════
// IMAGE NODE
// ═══════════════════════════════════════════════════════════

/**
 * Add an image node.
 */
export function addImageNode(
  imageRef: string,
  width: number,
  height: number,
  name: string = 'Image',
  position?: Vec2,
  parentId?: NodeId | null
): NodeId {
  pushHistory();
  const id = generateId();

  const node: ImageSceneNode = {
    id,
    name,
    type: 'image',
    imageRef,
    width,
    height,
    transform: { x: position?.x ?? 0, y: position?.y ?? 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  addNodeToParent(node, parentId ?? null);
  store.selectedIds.clear(); store.selectedIds.add(id);
  notify();
  return id;
}

// ═══════════════════════════════════════════════════════════
// EFFECTS
// ═══════════════════════════════════════════════════════════

/**
 * Add an effect to a shape node.
 */
export function addEffect(nodeId: NodeId, effect: Effect): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node || node.type !== 'shape') return;

  if (!(node as ShapeSceneNode).effects) (node as ShapeSceneNode).effects = [];
  (node as ShapeSceneNode).effects.push(effect);
  notify();
}

/**
 * Remove an effect from a shape node.
 */
export function removeEffect(nodeId: NodeId, index: number): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node || node.type !== 'shape') return;

  const effects = (node as ShapeSceneNode).effects || [];
  effects.splice(index, 1);
  notify();
}

// ═══════════════════════════════════════════════════════════
// LAYOUT OVERRIDES
// ═══════════════════════════════════════════════════════════

/**
 * Set layout override on a child node within an auto-layout parent.
 */
export function setLayoutOverride(nodeId: NodeId, overrides: Partial<LayoutOverride>): void {
  pushHistory();
  const doc = getCurrentDocument(store.history);
  const node = findNode(doc.root, nodeId);
  if (!node) return;

  if (!(node as any).layoutOverride) {
    (node as any).layoutOverride = defaultLayoutOverride();
  }
  (node as any).layoutOverride = { ...(node as any).layoutOverride, ...overrides };
  notify();
}

// ═══════════════════════════════════════════════════════════
// HELPERS — node dimensions
// ═══════════════════════════════════════════════════════════

function getNodeWidth(node: SceneNode): number {
  if (node.type === 'shape') {
    const s = node as ShapeSceneNode;
    if (s.geometry.type === 'rect') return s.geometry.width;
    if (s.geometry.type === 'ellipse') return s.geometry.rx * 2;
    if (s.geometry.type === 'line') return Math.abs(s.geometry.x2 - s.geometry.x1);
  }
  if (node.type === 'frame') return (node as FrameSceneNode).width;
  if (node.type === 'text') {
    const t = node as TextSceneNode;
    return Math.max(t.content.length * t.fontSize * 0.5, 20);
  }
  if (node.type === 'image') return (node as ImageSceneNode).width;
  if (node.type === 'componentInstance') return (node as ComponentInstanceNode).width;
  return 0;
}

function getNodeHeight(node: SceneNode): number {
  if (node.type === 'shape') {
    const s = node as ShapeSceneNode;
    if (s.geometry.type === 'rect') return s.geometry.height;
    if (s.geometry.type === 'ellipse') return s.geometry.ry * 2;
    if (s.geometry.type === 'line') return Math.abs(s.geometry.y2 - s.geometry.y1);
  }
  if (node.type === 'frame') return (node as FrameSceneNode).height;
  if (node.type === 'text') return (node as TextSceneNode).fontSize;
  if (node.type === 'image') return (node as ImageSceneNode).height;
  if (node.type === 'componentInstance') return (node as ComponentInstanceNode).height;
  return 0;
}

