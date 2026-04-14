/**
 * MiniMap — overview of the entire canvas with viewport indicator.
 *
 * Shows:
 * - All frames as rectangles
 * - Current viewport as a highlighted rectangle
 * - Click to navigate to a position
 */

import { FC, useEffect, useState, useRef } from 'react';
import { getDocument, subscribe } from '../store/documentStore.js';
import { getCanvasTransform, panTo, subscribe as subscribeTransform } from '../store/canvasTransformStore.js';
import './MiniMap.css';

export const MiniMap: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const unsubDoc = subscribe(() => {
      updateViewport();
      forceUpdate((n) => n + 1);
    });
    const unsubTransform = subscribeTransform(() => {
      updateViewport();
      forceUpdate((n) => n + 1);
    });
    updateViewport();
    return () => { unsubDoc(); unsubTransform(); };
  }, []);

  function updateViewport() {
    const ct = getCanvasTransform();

    // Calculate visible area in canvas coordinates
    const visibleW = window.innerWidth / ct.zoom;
    const visibleH = (window.innerHeight - 72 - 28) / ct.zoom; // topbar + statusbar

    // Convert pan to viewport position in canvas coords
    const vx = -ct.panX / ct.zoom;
    const vy = -ct.panY / ct.zoom;

    setViewport({ x: vx, y: vy, w: visibleW, h: visibleH });
  }

  // Mini-map scale
  const mapW = 160;
  const mapH = 100;
  const scaleX = mapW / doc.canvas.width;
  const scaleY = mapH / doc.canvas.height;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (mapW - doc.canvas.width * scale) / 2;
  const offsetY = (mapH - doc.canvas.height * scale) / 2;

  // Collect all frames
  function collectFrames(): Array<{ x: number; y: number; w: number; h: number; name: string }> {
    const frames: Array<{ x: number; y: number; w: number; h: number; name: string }> = [];
    function walk(node: any) {
      if (node.type === 'frame') {
        frames.push({
          x: node.transform.x,
          y: node.transform.y,
          w: node.width,
          h: node.height,
          name: node.name,
        });
        for (const child of node.children || []) walk(child);
      }
      if (node.type === 'group') {
        for (const child of node.children || []) walk(child);
      }
    }
    for (const child of doc.root.children || []) walk(child);
    return frames;
  }

  const frames = collectFrames();

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert map coords to canvas coords
    const canvasX = (mx - offsetX) / scale;
    const canvasY = (my - offsetY) / scale;

    const ct = getCanvasTransform();
    const newPanX = -canvasX * ct.zoom + window.innerWidth / 2;
    const newPanY = -canvasY * ct.zoom + (window.innerHeight - 72 - 28) / 2;

    panTo(newPanX, newPanY);
  };

  return (
    <div className="mini-map" title="Click to navigate">
      <svg
        ref={svgRef}
        className="mini-map__svg"
        width={mapW}
        height={mapH}
        viewBox={`0 0 ${mapW} ${mapH}`}
        onClick={handleMapClick}
      >
        {/* Canvas background */}
        <rect
          x={offsetX}
          y={offsetY}
          width={doc.canvas.width * scale}
          height={doc.canvas.height * scale}
          fill="var(--color-bg-surface)"
          stroke="var(--color-border)"
          strokeWidth={0.5}
          rx={2}
        />

        {/* Frames */}
        {frames.map((f, i) => (
          <rect
            key={i}
            x={offsetX + f.x * scale}
            y={offsetY + f.y * scale}
            width={f.w * scale}
            height={f.h * scale}
            fill="var(--color-accent-dim)"
            stroke="var(--color-accent)"
            strokeWidth={0.8}
            rx={1}
          />
        ))}

        {/* Viewport indicator */}
        <rect
          x={offsetX + viewport.x * scale}
          y={offsetY + viewport.y * scale}
          width={viewport.w * scale}
          height={viewport.h * scale}
          fill="rgba(255,255,255,0.06)"
          stroke="var(--color-text-primary)"
          strokeWidth={1}
          rx={1}
        />
      </svg>
    </div>
  );
};
