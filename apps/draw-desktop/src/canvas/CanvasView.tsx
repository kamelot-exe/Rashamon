/**
 * CanvasView — main SVG canvas with tool interaction, zoom, and pan.
 *
 * Features:
 * - Mouse wheel zoom (centered on cursor)
 * - Space+drag or middle mouse drag for pan
 * - Grid that scales with zoom
 * - Snap-to-grid support
 * - Selection overlay stays correct under zoom
 */

import { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
  getDocument,
  subscribe,
  getSelectedId,
  getSelectedIds,
  getSelectedNodes,
  getFlatNodeList,
  updateTransform,
  resizeNode,
  rotateNode,
  findNode as findNodeById,
  deleteSelected,
  groupSelected,
  ungroupSelected,
} from '../store/documentStore.js';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  getActiveTool,
  getMarqueeRect,
} from '../tools/toolSystem.js';
import { renderSceneNodes, SelectionOverlay, MultiSelectionOverlay } from './SvgCanvas.js';
import { InlineTextEditor } from './InlineTextEditor.js';
import {
  getCanvasTransform,
  setPan,
  updateZoomAroundPoint,
  screenToCanvas,
  subscribe as subscribeTransform,
  resetTransform,
} from '../store/canvasTransformStore.js';
import './CanvasView.css';

export const CanvasView: FC = () => {
  const doc = getDocument();
  const selectedId = getSelectedId();
  const nodes = doc.root.children;

  const svgRef = useRef<SVGSVGElement>(null);
  const [, forceUpdate] = useState(0);
  const [, forceTransformUpdate] = useState(0);
  const isResizing = useRef(false);
  const isRotating = useRef(false);

  // Pan state
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const isSpacePressed = useRef(false);

  // Inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Grid/snap state
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const gridSize = 20;

  useEffect(() => {
    const unsubDoc = subscribe(() => forceUpdate((n) => n + 1));
    const unsubTransform = subscribeTransform(() => forceTransformUpdate((n) => n + 1));
    return () => {
      unsubDoc();
      unsubTransform();
    };
  }, []);

  // Resize handler
  const handleResize = useCallback(
    (nodeId: string, handle: string, dx: number, dy: number, _shiftKey: boolean, isStart: boolean, isEnd: boolean) => {
      const node = findNodeById(doc.root, nodeId);
      if (!node || node.type !== 'shape') return;

      const pushHistory = isStart;

      // Apply snap to delta if enabled
      const stepX = (_shiftKey || snapToGrid) ? Math.round(dx / gridSize) * gridSize : dx;
      const stepY = (_shiftKey || snapToGrid) ? Math.round(dy / gridSize) * gridSize : dy;

      const geo = node.geometry;
      if (geo.type === 'rect') {
        const isLeft = handle.includes('l');
        const isTop = handle.includes('t');
        const isRight = handle.includes('r') && !handle.includes('m');
        const isBottom = handle.includes('b') && !handle.includes('l');

        let newX = node.transform.x;
        let newY = node.transform.y;
        let newW = geo.width;
        let newH = geo.height;

        if (isLeft) {
          newX += stepX;
          newW -= stepX;
        }
        if (isRight) {
          newW += stepX;
        }
        if (isTop) {
          newY += stepY;
          newH -= stepY;
        }
        if (isBottom) {
          newH += stepY;
        }

        // Prevent negative size
        if (newW < 1) {
          newW = 1;
          if (isLeft) newX = node.transform.x + geo.width - 1;
        }
        if (newH < 1) {
          newH = 1;
          if (isTop) newY = node.transform.y + geo.height - 1;
        }

        resizeNode(nodeId, { type: 'rect', width: newW, height: newH }, pushHistory);
        updateTransform(nodeId, { x: newX, y: newY });
      } else if (geo.type === 'ellipse') {
        const newRx = Math.max(1, geo.rx + stepX / 2);
        const newRy = Math.max(1, geo.ry + stepY / 2);
        resizeNode(nodeId, { type: 'ellipse', rx: newRx, ry: newRy }, pushHistory);
      } else if (geo.type === 'line') {
        const lineGeo = geo as import('@rashamon/types').LineGeometry;
        resizeNode(
          nodeId,
          { type: 'line', x1: lineGeo.x1, y1: lineGeo.y1, x2: lineGeo.x2 + stepX, y2: lineGeo.y2 + stepY },
          pushHistory
        );
      }

      if (isEnd) {
        isResizing.current = false;
      } else {
        isResizing.current = true;
      }
    },
    [doc.root, snapToGrid]
  );

  // Rotate handler
  const handleRotate = useCallback((nodeId: string, angle: number, isStart: boolean, isEnd: boolean) => {
    rotateNode(nodeId, angle, isStart);
    if (isEnd) {
      isRotating.current = false;
    } else {
      isRotating.current = true;
    }
  }, []);

  // Multi-selection resize handler
  const handleMultiResize = useCallback(
    (_nodeIds: string[], handle: string, dx: number, dy: number, _shiftKey: boolean, isStart: boolean, isEnd: boolean) => {
      const pushHistory = isStart;
      const selectedNodes = getSelectedNodes();

      const stepX = (_shiftKey || snapToGrid) ? Math.round(dx / gridSize) * gridSize : dx;
      const stepY = (_shiftKey || snapToGrid) ? Math.round(dy / gridSize) * gridSize : dy;

      for (const node of selectedNodes) {
        if (node.type !== 'shape') continue;
        const geo = node.geometry;

        if (geo.type === 'rect') {
          const isLeft = handle.includes('l');
          const isTop = handle.includes('t');
          const isRight = handle.includes('r') && !handle.includes('m');
          const isBottom = handle.includes('b') && !handle.includes('l');

          let newX = node.transform.x;
          let newY = node.transform.y;
          let newW = geo.width;
          let newH = geo.height;

          if (isLeft) { newX += stepX; newW -= stepX; }
          if (isRight) { newW += stepX; }
          if (isTop) { newY += stepY; newH -= stepY; }
          if (isBottom) { newH += stepY; }

          if (newW < 1) { newW = 1; if (isLeft) newX = node.transform.x + geo.width - 1; }
          if (newH < 1) { newH = 1; if (isTop) newY = node.transform.y + geo.height - 1; }

          resizeNode(node.id, { type: 'rect', width: newW, height: newH }, pushHistory);
          updateTransform(node.id, { x: newX, y: newY });
        } else if (geo.type === 'ellipse') {
          const newRx = Math.max(1, geo.rx + stepX / 2);
          const newRy = Math.max(1, geo.ry + stepY / 2);
          resizeNode(node.id, { type: 'ellipse', rx: newRx, ry: newRy }, pushHistory);
        } else if (geo.type === 'line') {
          const lineGeo = geo as import('@rashamon/types').LineGeometry;
          resizeNode(node.id, { type: 'line', x1: lineGeo.x1, y1: lineGeo.y1, x2: lineGeo.x2 + stepX, y2: lineGeo.y2 + stepY }, pushHistory);
        }
      }

      if (isEnd) isResizing.current = false;
      else isResizing.current = true;
    },
    [snapToGrid]
  );

  // Multi-selection rotate handler
  const handleMultiRotate = useCallback((nodeIds: string[], angle: number, isStart: boolean, isEnd: boolean) => {
    for (const id of nodeIds) {
      rotateNode(id, angle, isStart);
    }
    if (isEnd) isRotating.current = false;
    else isRotating.current = true;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'v':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('select'));
          break;
        case 'r':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('rectangle'));
          break;
        case 'e':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('ellipse'));
          break;
        case 'l':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('line'));
          break;
        case 't':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('text'));
          break;
        case ' ':
          isSpacePressed.current = true;
          e.preventDefault();
          break;
        case 'g':
          setShowGrid((prev) => !prev);
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            setSnapToGrid((prev) => !prev);
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetTransform();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const ct = getCanvasTransform();
            updateZoomAroundPoint(ct.zoom * 1.2, doc.canvas.width / 2, doc.canvas.height / 2);
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const ct = getCanvasTransform();
            updateZoomAroundPoint(ct.zoom / 1.2, doc.canvas.width / 2, doc.canvas.height / 2);
          }
          break;
        case 'delete':
        case 'backspace':
          if (getSelectedIds().size > 0) {
            deleteSelected();
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              ungroupSelected();
            } else {
              groupSelected();
            }
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              import('../store/documentStore.js').then((m) => m.redo());
            } else {
              import('../store/documentStore.js').then((m) => m.undo());
            }
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        isSpacePressed.current = false;
      }
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, doc.canvas.width, doc.canvas.height]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const ct = getCanvasTransform();
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = e.clientX - rect.left - ct.panX;
      const centerY = e.clientY - rect.top - ct.panY;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      updateZoomAroundPoint(ct.zoom * delta, centerX, centerY);
    },
    []
  );

  // Pan handling
  const handlePanStart = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const ct = getCanvasTransform();
    isPanning.current = true;
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: ct.panX,
      panY: ct.panY,
    };
  }, []);

  const handlePanMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan(panStart.current.panX + dx, panStart.current.panY + dy);
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Double-click to edit text
  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const group = target.closest('[data-node-id]');
    if (group) {
      const nodeId = group.getAttribute('data-node-id');
      const node = findNodeById(doc.root, nodeId!);
      if (node && node.type === 'text') {
        setEditingTextId(nodeId);
      }
    }
  }, [doc.root]);

  // Determine cursor
  const ct = getCanvasTransform();
  const isPanningActive = isPanning.current || isSpacePressed.current;
  const cursor = isPanningActive ? (isPanning.current ? 'grabbing' : 'grab') : getCursorForTool(getActiveTool());

  // Compute viewBox based on zoom and pan
  const viewBox = computeViewBox(doc.canvas.width, doc.canvas.height, ct);

  // Get selected nodes for multi-selection overlay
  const selectedNodeList = getSelectedNodes();

  return (
    <div className="canvas-view">
      <div className="canvas-scroll">
        <svg
          ref={svgRef}
          className="canvas-svg"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={(e) => {
            // Middle mouse or Space = pan
            if (e.button === 1 || isSpacePressed.current) {
              e.preventDefault();
              handlePanStart(e);
            } else if (!isPanning.current) {
              handleMouseDown(e);
            }
          }}
          onMouseMove={(e) => {
            if (isPanning.current) {
              handlePanMove(e);
            } else {
              handleMouseMove(e);
            }
          }}
          onMouseUp={(_e) => {
            if (isPanning.current) {
              handlePanEnd();
            } else {
              handleMouseUp();
            }
          }}
          onMouseLeave={() => {
            if (isPanning.current) {
              handlePanEnd();
            } else {
              handleMouseUp();
            }
          }}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          style={{ cursor }}
        >
          {/* Background */}
          <rect
            x={0}
            y={0}
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill={doc.canvas.background ?? '#1a1a2e'}
          />

          {/* Grid */}
          {showGrid && <GridPattern gridSize={gridSize} snapToGrid={snapToGrid} />}

          {/* Scene nodes */}
          {nodes.map((node) => renderSceneNodes(node))}

          {/* Selection overlay(s) */}
          {selectedNodeList.length === 1 && (
            <SelectionOverlay
              nodeId={selectedNodeList[0].id}
              nodes={nodes}
              onResize={handleResize}
              onRotate={handleRotate}
            />
          )}
          {selectedNodeList.length > 1 && (
            <MultiSelectionOverlay
              nodes={selectedNodeList}
              onResize={handleMultiResize}
              onRotate={handleMultiRotate}
            />
          )}

          {/* Marquee selection overlay */}
          <MarqueeOverlay />
        </svg>
      </div>

      {/* Canvas info overlay */}
      <div className="canvas-info">
        <span>{doc.canvas.width} × {doc.canvas.height}px</span>
        <span>{getFlatNodeList().length - 1} objects</span>
        <span>{getActiveTool()}</span>
        <span className="canvas-info__zoom">{Math.round(ct.zoom * 100)}%</span>
        <span className={`canvas-info__toggle ${snapToGrid ? 'canvas-info__toggle--active' : ''}`} title="Toggle snap (S)">
          Snap
        </span>
        <span className={`canvas-info__toggle ${showGrid ? 'canvas-info__toggle--active' : ''}`} title="Toggle grid (G)">
          Grid
        </span>
      </div>

      {/* Inline text editor overlay */}
      {editingTextId && (
        <InlineTextEditor
          node={nodes.find((n) => n.id === editingTextId && n.type === 'text') as import('@rashamon/types').TextSceneNode | undefined as import('@rashamon/types').TextSceneNode | null}
          svgRef={svgRef}
          onDone={() => setEditingTextId(null)}
        />
      )}
    </div>
  );
};

// ─── ViewBox computation ──────────────────────────────────────────

function computeViewBox(
  canvasWidth: number,
  canvasHeight: number,
  transform: { zoom: number; panX: number; panY: number }
): string {
  const { zoom, panX, panY } = transform;
  // Calculate visible area in canvas coordinates
  const w = canvasWidth / zoom;
  const h = canvasHeight / zoom;
  const x = -panX / zoom;
  const y = -panY / zoom;
  return `${x} ${y} ${w} ${h}`;
}

// ─── Grid pattern ──────────────────────────────────────────────────

const GridPattern: FC<{ gridSize: number; snapToGrid: boolean }> = ({ gridSize, snapToGrid: _snap }) => {
  return (
    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
      <path
        d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
        fill="none"
        stroke="#2a2a40"
        strokeWidth={0.5}
      />
    </pattern>
  );
};

// ─── Marquee overlay ─────────────────────────────────────────────

const MarqueeOverlay: FC = () => {
  const rect = getMarqueeRect();
  if (!rect) return null;

  const x = Math.min(rect.x1, rect.x2);
  const y = Math.min(rect.y1, rect.y2);
  const w = Math.abs(rect.x2 - rect.x1);
  const h = Math.abs(rect.y2 - rect.y1);

  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="rgba(108, 123, 255, 0.1)"
      stroke="#6c7bff"
      strokeWidth={1}
      strokeDasharray="4 2"
      pointerEvents="none"
    />
  );
};

// ─── Cursor mapping ─────────────────────────────────────────────

function getCursorForTool(tool: string): string {
  switch (tool) {
    case 'select':
      return 'default';
    case 'rectangle':
    case 'ellipse':
    case 'line':
      return 'crosshair';
    case 'text':
      return 'text';
    default:
      return 'default';
  }
}

// ─── Exports for toolSystem ─────────────────────────────────────

export { screenToCanvas, getCanvasTransform };
