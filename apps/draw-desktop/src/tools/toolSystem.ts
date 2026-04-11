/**
 * Tool System — minimal foundation for canvas interaction tools.
 *
 * Current tools:
 * - select: click to select, drag to move
 * - rectangle: click-drag to create a rectangle
 * - ellipse: click-drag to create an ellipse
 * - line: click-drag to create a line
 *
 * Architecture note: This is a simple tool system. Future extensions include:
 * - tool-specific UI overlays
 * - tool options panel
 * - snap-to-grid, constraints
 */

import type {
  RectGeometry,
  EllipseGeometry,
  LineGeometry,
  Vec2,
  ShapeSceneNode,
  SceneNode,
} from '@rashamon/types';
import {
  addShapeNode,
  addTextNode,
  selectNode,
  getDocument,
  updateTransform,
} from '../store/documentStore.js';

export type ToolType = 'select' | 'rectangle' | 'ellipse' | 'line' | 'text';

export interface ToolContext {
  type: ToolType;
}

// ─── Active tool state ──────────────────────────────────────

let activeTool: ToolType = 'select';
let listeners = new Set<() => void>();

export function getActiveTool(): ToolType {
  return activeTool;
}

export function setActiveTool(tool: ToolType): void {
  activeTool = tool;
  for (const l of listeners) l();
}

export function subscribeTool(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ─── Canvas interaction handlers ────────────────────────────

interface InteractionState {
  isDragging: boolean;
  startPos: Vec2;
  lastPos: Vec2;
  createdNodeId: string | null;
  selectedNodeIdAtStart: string | null;
}

let interaction: InteractionState = {
  isDragging: false,
  startPos: { x: 0, y: 0 },
  lastPos: { x: 0, y: 0 },
  createdNodeId: null,
  selectedNodeIdAtStart: null,
};

/**
 * Handle mouse down on canvas.
 */
export function handleMouseDown(e: React.MouseEvent<SVGSVGElement>): void {
  const pos = getCanvasPosition(e);

  if (activeTool === 'select') {
    handleSelectMouseDown(pos, e);
  } else if (activeTool === 'rectangle') {
    handleRectangleMouseDown(pos);
  } else if (activeTool === 'ellipse') {
    handleEllipseMouseDown(pos);
  } else if (activeTool === 'line') {
    handleLineMouseDown(pos);
  } else if (activeTool === 'text') {
    handleTextMouseDown(pos);
  }
}

/**
 * Handle mouse move on canvas.
 */
export function handleMouseMove(e: React.MouseEvent<SVGSVGElement>): void {
  if (!interaction.isDragging) return;
  const pos = getCanvasPosition(e);

  if (activeTool === 'select') {
    handleSelectMouseMove(pos);
  } else {
    handleShapeDragMouseMove(pos);
  }
}

/**
 * Handle mouse up on canvas.
 */
export function handleMouseUp(): void {
  if (!interaction.isDragging) return;
  interaction.isDragging = false;
  interaction.createdNodeId = null;
  interaction.selectedNodeIdAtStart = null;
}

// ─── Select tool ────────────────────────────────────────────

function handleSelectMouseDown(_pos: Vec2, e: React.MouseEvent<SVGSVGElement>): void {
  const target = e.target as SVGElement;
  const group = target.closest('[data-node-id]');

  if (group) {
    const nodeId = group.getAttribute('data-node-id');
    if (nodeId) {
      selectNode(nodeId);
      interaction.isDragging = true;
      interaction.startPos = getCanvasPosition(e);
      interaction.lastPos = getCanvasPosition(e);
      interaction.selectedNodeIdAtStart = nodeId;
      return;
    }
  }

  selectNode(null);
}

function handleSelectMouseMove(pos: Vec2): void {
  const nodeId = interaction.selectedNodeIdAtStart;
  if (!nodeId) return;

  const dx = pos.x - interaction.lastPos.x;
  const dy = pos.y - interaction.lastPos.y;

  const doc = getDocument();
  const node = findShapeNode(doc.root, nodeId);
  if (!node) return;

  updateTransform(nodeId, {
    x: node.transform.x + dx,
    y: node.transform.y + dy,
    scaleX: node.transform.scaleX,
    scaleY: node.transform.scaleY,
    rotation: node.transform.rotation,
    skewX: node.transform.skewX,
    skewY: node.transform.skewY,
  });

  interaction.lastPos = pos;
}

// ─── Rectangle tool ─────────────────────────────────────────

function handleRectangleMouseDown(pos: Vec2): void {
  interaction.isDragging = true;
  interaction.startPos = pos;
  interaction.lastPos = pos;

  const geo: RectGeometry = { type: 'rect', width: 0, height: 0 };

  const id = addShapeNode(
    geo,
    'Rectangle',
    { type: 'solid', color: '#3B82F6' },
    { color: '#1D4ED8', width: 1, lineCap: 'butt', lineJoin: 'miter' },
    pos
  );

  interaction.createdNodeId = id;
}

// ─── Ellipse tool ───────────────────────────────────────────

function handleEllipseMouseDown(pos: Vec2): void {
  interaction.isDragging = true;
  interaction.startPos = pos;
  interaction.lastPos = pos;

  const geo: EllipseGeometry = { type: 'ellipse', rx: 0, ry: 0 };

  const id = addShapeNode(
    geo,
    'Ellipse',
    { type: 'solid', color: '#10B981' },
    { color: '#047857', width: 1, lineCap: 'butt', lineJoin: 'miter' },
    pos
  );

  interaction.createdNodeId = id;
}

// ─── Line tool ──────────────────────────────────────────────

function handleLineMouseDown(pos: Vec2): void {
  interaction.isDragging = true;
  interaction.startPos = pos;
  interaction.lastPos = pos;

  const geo: LineGeometry = { type: 'line', x1: 0, y1: 0, x2: 0, y2: 0 };

  const id = addShapeNode(
    geo,
    'Line',
    null,
    { color: '#F59E0B', width: 2, lineCap: 'round', lineJoin: 'miter' },
    pos
  );

  interaction.createdNodeId = id;
}

// ─── Text tool ──────────────────────────────────────────────

function handleTextMouseDown(pos: Vec2): void {
  const content = prompt('Enter text:', 'Text');
  if (!content) return;

  addTextNode(content, pos);
}

// ─── Shape drag (shared by rectangle, ellipse, line) ────────

function handleShapeDragMouseMove(pos: Vec2): void {
  const nodeId = interaction.createdNodeId;
  if (!nodeId) return;

  const dx = pos.x - interaction.startPos.x;
  const dy = pos.y - interaction.startPos.y;

  const doc = getDocument();
  const node = findShapeNode(doc.root, nodeId);
  if (!node) return;

  const geo = node.geometry;

  if (geo.type === 'rect') {
    const rectGeo = geo as RectGeometry;
    const newWidth = Math.abs(dx);
    const newHeight = Math.abs(dy);
    const newX = dx >= 0 ? interaction.startPos.x : pos.x;
    const newY = dy >= 0 ? interaction.startPos.y : pos.y;

    rectGeo.width = newWidth;
    rectGeo.height = newHeight;

    updateTransform(nodeId, {
      ...node.transform,
      x: newX,
      y: newY,
    });
  } else if (geo.type === 'ellipse') {
    const ellipseGeo = geo as EllipseGeometry;
    ellipseGeo.rx = Math.abs(dx) / 2;
    ellipseGeo.ry = Math.abs(dy) / 2;

    const centerX = interaction.startPos.x + dx / 2;
    const centerY = interaction.startPos.y + dy / 2;

    updateTransform(nodeId, {
      ...node.transform,
      x: centerX,
      y: centerY,
    });
  } else if (geo.type === 'line') {
    const lineGeo = geo as LineGeometry;
    lineGeo.x2 = dx;
    lineGeo.y2 = dy;

    updateTransform(nodeId, { ...node.transform });
  }

  interaction.lastPos = pos;
}

// ─── Helpers ────────────────────────────────────────────────

function getCanvasPosition(e: React.MouseEvent<SVGSVGElement>): Vec2 {
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function findShapeNode(node: SceneNode, id: string): ShapeSceneNode | null {
  if (node.id === id && node.type === 'shape') return node as ShapeSceneNode;
  if (node.type === 'group') {
    for (const child of node.children) {
      const found = findShapeNode(child, id);
      if (found) return found;
    }
  }
  return null;
}
