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
  GroupSceneNode,
} from '@rashamon/types';
import {
  addShapeNode,
  addTextNode,
  addFrameNode,
  selectNode,
  selectNodes,
  toggleSelection,
  isSelected,
  getDocument,
  updateTransform,
  findNode,
} from '../store/documentStore.js';

export type ToolType = 'select' | 'hand' | 'frame' | 'rectangle' | 'ellipse' | 'line' | 'text';

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
  selectedNodeIdsAtStart: string[];
  isMarquee: boolean;
  marqueeRect: { x1: number; y1: number; x2: number; y2: number } | null;
}

let interaction: InteractionState = {
  isDragging: false,
  startPos: { x: 0, y: 0 },
  lastPos: { x: 0, y: 0 },
  createdNodeId: null,
  selectedNodeIdsAtStart: [],
  isMarquee: false,
  marqueeRect: null,
};

/**
 * Handle mouse down on canvas.
 */
export function handleMouseDown(e: React.MouseEvent<SVGSVGElement>): void {
  const pos = getCanvasPosition(e);

  if (activeTool === 'select') {
    handleSelectMouseDown(pos, e);
  } else if (activeTool === 'hand') {
    // Hand tool: pan is handled in CanvasView via space+drag or middle mouse
    interaction.isDragging = true;
    interaction.startPos = pos;
    interaction.lastPos = pos;
  } else if (activeTool === 'frame') {
    handleFrameMouseDown(pos);
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
  } else if (activeTool === 'frame') {
    handleFrameDragMouseMove(pos);
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
  interaction.selectedNodeIdsAtStart = [];
  interaction.isMarquee = false;
  interaction.marqueeRect = null;
}

/**
 * Get current marquee rectangle for overlay rendering.
 */
export function getMarqueeRect(): { x1: number; y1: number; x2: number; y2: number } | null {
  return interaction.marqueeRect;
}

// ─── Select tool ────────────────────────────────────────────

function handleSelectMouseDown(pos: Vec2, e: React.MouseEvent<SVGSVGElement>): void {
  const target = e.target as SVGElement;
  const group = target.closest('[data-node-id]');

  if (group) {
    // Clicked on a node
    const nodeId = group.getAttribute('data-node-id');
    if (!nodeId) return;

    if (e.ctrlKey || e.metaKey) {
      // Ctrl+click: toggle selection
      toggleSelection(nodeId);
      interaction.isDragging = true;
      interaction.startPos = pos;
      interaction.lastPos = pos;
      interaction.selectedNodeIdsAtStart = Array.from(getSelectionSet());
      return;
    }

    if (isSelected(nodeId)) {
      // Click on already selected node: start drag
      interaction.isDragging = true;
      interaction.startPos = pos;
      interaction.lastPos = pos;
      interaction.selectedNodeIdsAtStart = Array.from(getSelectionSet());
      return;
    }

    // Click on unselected node: select it
    selectNode(nodeId);
    interaction.isDragging = true;
    interaction.startPos = pos;
    interaction.lastPos = pos;
    interaction.selectedNodeIdsAtStart = [nodeId];
    return;
  }

  // Clicked on empty canvas
  if (!e.ctrlKey && !e.metaKey) {
    // Start marquee selection
    interaction.isDragging = true;
    interaction.isMarquee = true;
    interaction.startPos = pos;
    interaction.lastPos = pos;
    interaction.marqueeRect = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
  } else {
    // Ctrl+click on empty: clear selection
    selectNode(null);
  }
}

function getSelectionSet(): Set<string> {
  const doc = getDocument();
  const selected = new Set<string>();
  for (const node of getFlattenedNodes(doc.root)) {
    if (isSelected(node.id)) {
      selected.add(node.id);
    }
  }
  return selected;
}

function getFlattenedNodes(root: SceneNode): SceneNode[] {
  const result: SceneNode[] = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    if (node.type === 'group') {
      queue.push(...(node as GroupSceneNode).children);
    }
  }
  return result;
}

function handleSelectMouseMove(pos: Vec2): void {
  // Marquee selection
  if (interaction.isMarquee) {
    interaction.marqueeRect = {
      x1: interaction.startPos.x,
      y1: interaction.startPos.y,
      x2: pos.x,
      y2: pos.y,
    };

    // Select nodes within marquee bounds
    const doc = getDocument();
    const marquee = normalizeRect(interaction.marqueeRect!);
    const selectedIds: string[] = [];

    for (const node of getFlattenedNodes(doc.root)) {
      if (node.type === 'group') continue;
      if (node.type !== 'shape' && node.type !== 'text') continue;

      const bounds = getNodeBounds(node);
      if (rectsIntersect(marquee, bounds)) {
        selectedIds.push(node.id);
      }
    }

    selectNodes(selectedIds);
    return;
  }

  // Multi-node move
  const dx = pos.x - interaction.lastPos.x;
  const dy = pos.y - interaction.lastPos.y;

  if (dx === 0 && dy === 0) return;

  const doc = getDocument();
  for (const nodeId of interaction.selectedNodeIdsAtStart) {
    const node = findNode(doc.root, nodeId);
    if (!node) continue;

    updateTransform(nodeId, {
      x: node.transform.x + dx,
      y: node.transform.y + dy,
    });
  }

  interaction.lastPos = pos;
}

function normalizeRect(r: { x1: number; y1: number; x2: number; y2: number }) {
  return {
    x: Math.min(r.x1, r.x2),
    y: Math.min(r.y1, r.y2),
    w: Math.abs(r.x2 - r.x1),
    h: Math.abs(r.y2 - r.y1),
  };
}

function rectsIntersect(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
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
    }
  } else if (node.type === 'text') {
    const textNode = node as import('@rashamon/types').TextSceneNode;
    w = textNode.content.length * textNode.fontSize * 0.6;
    h = textNode.fontSize;
  }

  return { x, y, w, h };
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
  // Create text node with default content at click position
  addTextNode('Text', pos);
}

// ─── Frame tool ─────────────────────────────────────────────

function handleFrameMouseDown(pos: Vec2): void {
  interaction.isDragging = true;
  interaction.startPos = pos;
  interaction.lastPos = pos;

  // Create frame with zero size at position
  const id = addFrameNode(0, 0, 'Frame', '#FFFFFF', pos);
  interaction.createdNodeId = id;
}

function handleFrameDragMouseMove(pos: Vec2): void {
  const nodeId = interaction.createdNodeId;
  if (!nodeId) return;

  const dx = pos.x - interaction.startPos.x;
  const dy = pos.y - interaction.startPos.y;

  const doc = getDocument();
  const node = findNode(doc.root, nodeId);
  if (!node || node.type !== 'frame') return;

  const frame = node as import('@rashamon/types').FrameSceneNode;
  const newWidth = Math.abs(dx);
  const newHeight = Math.abs(dy);
  const newX = dx >= 0 ? interaction.startPos.x : pos.x;
  const newY = dy >= 0 ? interaction.startPos.y : pos.y;

  frame.width = newWidth;
  frame.height = newHeight;

  updateTransform(nodeId, {
    ...node.transform,
    x: newX,
    y: newY,
  });

  interaction.lastPos = pos;
}

// ─── Shape drag (shared by rectangle, ellipse, line) ────────

function handleShapeDragMouseMove(pos: Vec2): void {
  const nodeId = interaction.createdNodeId;
  if (!nodeId) return;

  const dx = pos.x - interaction.startPos.x;
  const dy = pos.y - interaction.startPos.y;

  const doc = getDocument();
  const node = findNode(doc.root, nodeId);
  if (!node || node.type !== 'shape') return;

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

  // Use SVG's built-in CTM for accurate screen-to-canvas conversion
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;

  const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  return {
    x: svgP.x,
    y: svgP.y,
  };
}

