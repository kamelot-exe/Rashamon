/**
 * CanvasView — main SVG canvas with tool interaction.
 *
 * Renders the document scene graph into SVG and handles
 * mouse events for the active tool.
 */

import { FC, useEffect, useRef, useState } from 'react';
import { getDocument, subscribe, getSelectedId, getFlatNodeList } from '../store/documentStore.js';
import { handleMouseDown, handleMouseMove, handleMouseUp, getActiveTool } from '../tools/toolSystem.js';
import { renderSceneNodes, renderSelectionOverlay } from './SvgCanvas.js';
import './CanvasView.css';

export const CanvasView: FC = () => {
  const doc = getDocument();
  const selectedId = getSelectedId();
  const nodes = doc.root.children;

  const svgRef = useRef<SVGSVGElement>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
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
          {renderSelectionOverlay(selectedId, nodes)}
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
      return 'crosshair';
    case 'line':
      return 'crosshair';
    default:
      return 'default';
  }
}
