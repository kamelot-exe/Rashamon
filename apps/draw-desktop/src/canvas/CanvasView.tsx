/**
 * CanvasView — main SVG canvas with tool interaction.
 *
 * Renders the document scene graph into SVG and handles
 * mouse events for the active tool.
 */

import { FC, useEffect, useRef, useState, useCallback } from 'react';
import { getDocument, subscribe, getSelectedId, getFlatNodeList, updateTransform, resizeNode, rotateNode, findNode as findNodeById } from '../store/documentStore.js';
import { handleMouseDown, handleMouseMove, handleMouseUp, getActiveTool } from '../tools/toolSystem.js';
import { renderSceneNodes, SelectionOverlay } from './SvgCanvas.js';
import './CanvasView.css';

export const CanvasView: FC = () => {
  const doc = getDocument();
  const selectedId = getSelectedId();
  const nodes = doc.root.children;

  const svgRef = useRef<SVGSVGElement>(null);
  const [, forceUpdate] = useState(0);
  const isResizing = useRef(false);
  const isRotating = useRef(false);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  // Resize handler
  const handleResize = useCallback((nodeId: string, handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => {
    const node = findNodeById(doc.root, nodeId);
    if (!node || node.type !== 'shape') return;

    const pushHistory = isStart;

    const stepX = shiftKey ? Math.round(dx / 10) * 10 : dx;
    const stepY = shiftKey ? Math.round(dy / 10) * 10 : dy;

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

      // Prevent negative size
      if (newW < 1) { newW = 1; if (isLeft) newX = node.transform.x + geo.width - 1; }
      if (newH < 1) { newH = 1; if (isTop) newY = node.transform.y + geo.height - 1; }

      resizeNode(nodeId, { type: 'rect', width: newW, height: newH }, pushHistory);
      updateTransform(nodeId, { x: newX, y: newY });
    } else if (geo.type === 'ellipse') {
      const newRx = Math.max(1, geo.rx + stepX / 2);
      const newRy = Math.max(1, geo.ry + stepY / 2);
      resizeNode(nodeId, { type: 'ellipse', rx: newRx, ry: newRy }, pushHistory);
    } else if (geo.type === 'line') {
      const lineGeo = geo as import('@rashamon/types').LineGeometry;
      resizeNode(nodeId, { type: 'line', x1: lineGeo.x1, y1: lineGeo.y1, x2: lineGeo.x2 + stepX, y2: lineGeo.y2 + stepY }, pushHistory);
    }

    if (isEnd) {
      isResizing.current = false;
    } else {
      isResizing.current = true;
    }
  }, [doc.root]);

  // Rotate handler
  const handleRotate = useCallback((nodeId: string, angle: number, isStart: boolean, isEnd: boolean) => {
    rotateNode(nodeId, angle, isStart);
    if (isEnd) {
      isRotating.current = false;
    } else {
      isRotating.current = true;
    }
  }, []);

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
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
        case 'delete':
        case 'backspace':
          if (selectedId) {
            import('../store/documentStore.js').then((m) => m.deleteNode(selectedId));
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
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId]);

  return (
    <div className="canvas-view">
      <div className="canvas-scroll">
        <svg
          ref={svgRef}
          className="canvas-svg"
          width={doc.canvas.width}
          height={doc.canvas.height}
          viewBox={`0 0 ${doc.canvas.width} ${doc.canvas.height}`}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: getCursorForTool(getActiveTool()),
          }}
        >
          {/* Background */}
          <rect
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill={doc.canvas.background ?? '#1a1a2e'}
          />

          {/* Grid (decorative) */}
          <GridPattern canvasWidth={doc.canvas.width} canvasHeight={doc.canvas.height} />

          {/* Scene nodes */}
          {nodes.map((node) => renderSceneNodes(node))}

          {/* Selection overlay */}
          {selectedId && (
            <SelectionOverlay
              nodeId={selectedId}
              nodes={nodes}
              onResize={handleResize}
              onRotate={handleRotate}
            />
          )}
        </svg>
      </div>

      {/* Canvas info overlay */}
      <div className="canvas-info">
        <span>{doc.canvas.width} × {doc.canvas.height}px</span>
        <span>{getFlatNodeList().length - 1} objects</span>
        <span>{getActiveTool()}</span>
      </div>
    </div>
  );
};

// ─── Grid pattern ───────────────────────────────────────────

const GridPattern: FC<{ canvasWidth: number; canvasHeight: number }> = ({ canvasWidth: _cw, canvasHeight: _ch }) => {
  const gridSize = 20;

  return (
    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#2a2a40" strokeWidth="0.5" />
    </pattern>
  );
};

// ─── Cursor mapping ─────────────────────────────────────────

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
