/**
 * Branching History — graph-based undo/redo foundation.
 *
 * Architecture:
 * - History is a directed acyclic graph (DAG) of document snapshots
 * - Each node has a document state, parent reference, and children
 * - A "current" pointer tracks the active state
 * - When editing from a past state, a new branch is created (fork)
 * - Linear undo/redo still works as before for compatibility
 *
 * This is the FOUNDATION for branching history. The full visual
 * graph UI is NOT implemented yet. What IS implemented:
 * - Graph data structure with parent/child relationships
 * - Branch creation when editing from past state
 * - Current pointer management
 * - API for traversing: parent, children, siblings, isOnMainBranch
 * - Linear undo/redo compatibility layer
 *
 * What is NOT yet implemented:
 * - Visual history graph UI
 * - Named branches
 * - Branch merging
 * - Branch comparison
 *
 * Design notes:
 * - Nodes are identified by UUID strings
 * - Documents are deep-cloned snapshots
 * - The "main" branch is the initial linear sequence from root
 * - Forking creates a new child of a past node, making it a branch point
 * - This is compatible with future graph-based history UI
 */

import type { RashamonDocument } from '@rashamon/types';
import { generateId } from '@rashamon/core';

export interface HistoryNode {
  id: string;
  document: RashamonDocument;
  parentId: string | null;
  children: string[];
  timestamp: string;
  isBranchPoint: boolean;
}

export interface BranchingHistory {
  nodes: Map<string, HistoryNode>;
  currentId: string;
  rootId: string;
}

// ─── Creation ──────────────────────────────────────────────────

export function createBranchingHistory(initialDoc: RashamonDocument): BranchingHistory {
  const rootId = generateId();
  const rootNode: HistoryNode = {
    id: rootId,
    document: snapshot(initialDoc),
    parentId: null,
    children: [],
    timestamp: new Date().toISOString(),
    isBranchPoint: false,
  };

  return {
    nodes: new Map([[rootId, rootNode]]),
    currentId: rootId,
    rootId,
  };
}

// ─── Core operations ─────────────────────────────────────────

/**
 * Push a new state as a child of current.
 * Creates a linear sequence normally.
 */
export function pushState(history: BranchingHistory, doc: RashamonDocument): string {
  const newId = generateId();
  const parentNode = history.nodes.get(history.currentId)!;

  const newNode: HistoryNode = {
    id: newId,
    document: snapshot(doc),
    parentId: history.currentId,
    children: [],
    timestamp: new Date().toISOString(),
    isBranchPoint: false,
  };

  parentNode.children.push(newId);
  history.nodes.set(newId, newNode);
  history.currentId = newId;

  return newId;
}

/**
 * Fork: create a new state as a child of a past node.
 * This is what happens when user edits from a past state.
 * The forked node becomes a branch point.
 */
export function forkState(history: BranchingHistory, fromId: string, doc: RashamonDocument): string {
  const fromNode = history.nodes.get(fromId);
  if (!fromNode) return pushState(history, doc);

  const newId = generateId();
  const newNode: HistoryNode = {
    id: newId,
    document: snapshot(doc),
    parentId: fromId,
    children: [],
    timestamp: new Date().toISOString(),
    isBranchPoint: false,
  };

  fromNode.children.push(newId);
  fromNode.isBranchPoint = true;
  history.nodes.set(newId, newNode);
  history.currentId = newId;

  return newId;
}

/**
 * Undo: move to parent of current.
 */
export function undo(history: BranchingHistory): boolean {
  const current = history.nodes.get(history.currentId);
  if (!current || !current.parentId) return false;

  history.currentId = current.parentId;
  return true;
}

/**
 * Redo: move to last child of current.
 * If multiple children (branch), take the most recent.
 */
export function redo(history: BranchingHistory): boolean {
  const current = history.nodes.get(history.currentId);
  if (!current || current.children.length === 0) return false;

  // Take the last child (most recent)
  const childId = current.children[current.children.length - 1];
  history.currentId = childId;
  return true;
}

/**
 * Navigate to a specific history node.
 * Used for browsing the history graph.
 */
export function navigateTo(history: BranchingHistory, nodeId: string): boolean {
  if (!history.nodes.has(nodeId)) return false;
  history.currentId = nodeId;
  return true;
}

// ─── Queries ─────────────────────────────────────────────────

export function getCurrentDocument(history: BranchingHistory): RashamonDocument {
  const node = history.nodes.get(history.currentId);
  if (!node) throw new Error('Current history node not found');
  return node.document;
}

export function getCurrentNode(history: BranchingHistory): HistoryNode | null {
  return history.nodes.get(history.currentId) ?? null;
}

export function canUndo(history: BranchingHistory): boolean {
  const current = history.nodes.get(history.currentId);
  return !!current && !!current.parentId;
}

export function canRedo(history: BranchingHistory): boolean {
  const current = history.nodes.get(history.currentId);
  return !!current && current.children.length > 0;
}

export function getAncestors(history: BranchingHistory, fromId?: string): HistoryNode[] {
  const result: HistoryNode[] = [];
  let current = history.nodes.get(fromId ?? history.currentId);
  while (current) {
    result.unshift(current);
    if (!current.parentId) break;
    current = history.nodes.get(current.parentId);
  }
  return result;
}

export function getDescendants(history: BranchingHistory, fromId: string): HistoryNode[] {
  const result: HistoryNode[] = [];
  const node = history.nodes.get(fromId);
  if (!node) return result;

  for (const childId of node.children) {
    const child = history.nodes.get(childId)!;
    result.push(child);
    result.push(...getDescendants(history, childId));
  }
  return result;
}

export function isOnMainBranch(history: BranchingHistory): boolean {
  const ancestors = getAncestors(history);
  // Main branch = no branch points in ancestry
  return !ancestors.some((n) => n.isBranchPoint && n.children.length > 1);
}

export function getHistoryStats(history: BranchingHistory) {
  const ancestors = getAncestors(history);
  const branchPoints = ancestors.filter((n) => n.isBranchPoint).length;
  return {
    depth: ancestors.length,
    branchPoints,
    isOnMainBranch: isOnMainBranch(history),
    totalNodes: history.nodes.size,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function snapshot(doc: RashamonDocument): RashamonDocument {
  return JSON.parse(JSON.stringify(doc));
}
