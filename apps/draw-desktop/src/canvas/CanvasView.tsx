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
  updateTransform,
  resizeNode,
  rotateNode,
  findNode as findNodeById,
  deleteSelected,
  groupSelected,
  ungroupSelected,
  pushHistory,
  enterGroup,
  exitGroup,
  getEditScopeGroupId,
  getScopedNodes,
  redo,
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
import { ScopeBar } from './ScopeBar.js';
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
  const nodes = getScopedNodes();

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
  // Uses proportional scaling from the shared selection center.
  // Shift key locks aspect ratio.
  const handleMultiResize = useCallback(
    (_nodeIds: string[], handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => {
      if (isStart) pushHistory();
      const selectedNodes = getSelectedNodes();
      if (selectedNodes.length === 0) return;

      // Compute union bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of selectedNodes) {
        const b = getNodeBoundsSimple(node);
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w);
        maxY = Math.max(maxY, b.y + b.h);
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const origW = maxX - minX;
      const origH = maxY - minY;

      // Calculate scale factors based on handle position
      let scaleX = 1, scaleY = 1;

      if (origW > 0 && origH > 0) {
        const isLeft = handle.includes('l');
        const isRight = handle.includes('r') && !handle.includes('m');
        const isTop = handle.includes('t');
        const isBottom = handle.includes('b') && !handle.includes('l');

        // Determine new dimensions
        let newW = origW, newH = origH;

        if (isLeft || isRight) newW = origW + (isRight ? dx : -dx);
        if (isTop || isBottom) newH = origH + (isBottom ? dy : -dy);

        // Handle corner scales (both dimensions)
        const isCorner = (isLeft || isRight) && (isTop || isBottom);
        const isMiddle = !isCorner && (isLeft || isRight || isTop || isBottom);

        if (isCorner) {
          // Corner: scale both dimensions
          const avgScale = (newW / origW + newH / origH) / 2;
          if (shiftKey) {
            // Shift: lock aspect ratio
            scaleX = scaleY = avgScale;
          } else {
            scaleX = newW / origW;
            scaleY = newH / origH;
          }
        } else if (isMiddle) {
          // Middle handle: scale one axis
          if (isLeft || isRight) {
            scaleX = newW / origW;
            scaleY = shiftKey ? scaleX : 1;
          } else {
            scaleY = newH / origH;
            scaleX = shiftKey ? scaleY : 1;
          }
        }

        // Apply transforms
        for (const node of selectedNodes) {
          const b = getNodeBoundsSimple(node);
          const nodeCenterX = b.x + b.w / 2;
          const nodeCenterY = b.y + b.h / 2;

          // Scale from selection center
          const newW = Math.max(1, b.w * scaleX);
          const newH = Math.max(1, b.h * scaleY);
          const newX = centerX + (nodeCenterX - centerX) * scaleX - newW / 2;
          const newY = centerY + (nodeCenterY - centerY) * scaleY - newH / 2;

          if (node.type === 'shape') {
            const geo = node.geometry;
            if (geo.type === 'rect') {
              resizeNode(node.id, { type: 'rect', width: newW, height: newH }, false);
              updateTransform(node.id, { x: newX, y: newY });
            } else if (geo.type === 'ellipse') {
              resizeNode(node.id, { type: 'ellipse', rx: newW / 2, ry: newH / 2 }, false);
              updateTransform(node.id, { x: newX + newW / 2, y: newY + newH / 2 });
            } else if (geo.type === 'line') {
              const lineGeo = geo as import('@rashamon/types').LineGeometry;
              const newX2 = centerX + (lineGeo.x2 - centerX) * scaleX;
              const newY2 = centerY + (lineGeo.y2 - centerY) * scaleY;
              resizeNode(node.id, { type: 'line', x1: lineGeo.x1, y1: lineGeo.y1, x2: newX2, y2: newY2 }, false);
            }
          }
        }
      }

      if (isEnd) isResizing.current = false;
      else isResizing.current = true;
    },
    []
  );

  // Helper: get simple node bounds
  function getNodeBoundsSimple(node: import('@rashamon/types').SceneNode): { x: number; y: number; w: number; h: number } {
    const { x, y } = node.transform;
    let w = 0, h = 0;
    if (node.type === 'shape') {
      const shape = node as import('@rashamon/types').ShapeSceneNode;
      if (shape.geometry.type === 'rect') {
        w = shape.geometry.width; h = shape.geometry.height;
      } else if (shape.geometry.type === 'ellipse') {
        w = shape.geometry.rx * 2; h = shape.geometry.ry * 2;
      } else if (shape.geometry.type === 'line') {
        w = Math.abs(shape.geometry.x2 - shape.geometry.x1);
        h = Math.abs(shape.geometry.y2 - shape.geometry.y1);
      }
    } else if (node.type === 'text') {
      const textNode = node as import('@rashamon/types').TextSceneNode;
      w = textNode.content.length * textNode.fontSize * 0.6;
      h = textNode.fontSize;
    }
    return { x, y, w, h };
  }

  // Multi-selection rotate handler
  // Rotates all selected nodes around the shared centroid.
  const handleMultiRotate = useCallback((_nodeIds: string[], angle: number, isStart: boolean, isEnd: boolean) => {
    if (isStart) pushHistory();
    const selectedNodes = getSelectedNodes();
    if (selectedNodes.length === 0) return;

    // Compute centroid
    let cx = 0, cy = 0;
    for (const node of selectedNodes) {
      const b = getNodeBoundsSimple(node);
      cx += b.x + b.w / 2;
      cy += b.y + b.h / 2;
    }
    cx /= selectedNodes.length;
    cy /= selectedNodes.length;

    for (const node of selectedNodes) {
      const b = getNodeBoundsSimple(node);
      const nodeCx = b.x + b.w / 2;
      const nodeCy = b.y + b.h / 2;

      // Vector from centroid to node center
      const dx = nodeCx - cx;
      const dy = nodeCy - cy;

      // Rotate vector
      const rad = angle * Math.PI / 180;
      const newDx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const newDy = dx * Math.sin(rad) + dy * Math.cos(rad);

      updateTransform(node.id, {
        x: node.transform.x + (newDx - dx),
        y: node.transform.y + (newDy - dy),
        rotation: node.transform.rotation + angle,
      });
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
        case 'h':
          import('../tools/toolSystem.js').then((m) => m.setActiveTool('hand'));
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
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        case 'escape':
          if (getEditScopeGroupId()) {
            exitGroup();
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
      } else if (node && node.type === 'group') {
        // Double-click group to enter focused editing
        enterGroup(nodeId!);
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
      {/* Scope bar: shows current edit scope and exit button */}
      <ScopeBar />

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

      {/* Canvas info: minimal, bottom-right */}
      <div className="canvas-info">
        <span className="canvas-info__zoom">{Math.round(ct.zoom * 100)}%</span>
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
    case 'hand':
      return 'grab';
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
