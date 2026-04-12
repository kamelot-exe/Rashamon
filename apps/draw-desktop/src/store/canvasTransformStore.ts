/**
 * Canvas Transform — zoom and pan state management.
 *
 * Provides:
 * - Zoom level (scale)
 * - Pan offset (translateX, translateY)
 * - Coordinate conversion between screen and canvas space
 * - Mouse wheel zoom
 * - Space+drag pan support
 *
 * Architecture:
 * - Simple module-level state (no React dependency)
 * - Consumers subscribe to changes
 * - CanvasView reads transform for SVG viewBox
 * - toolSystem reads transform for coordinate conversion
 */

export interface CanvasTransform {
  zoom: number;
  panX: number;
  panY: number;
}

let transform: CanvasTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

let listeners = new Set<() => void>();

export function getCanvasTransform(): CanvasTransform {
  return { ...transform };
}

export function setZoom(zoom: number): void {
  transform.zoom = Math.max(0.1, Math.min(10, zoom));
  notify();
}

export function setPan(panX: number, panY: number): void {
  transform.panX = panX;
  transform.panY = panY;
  notify();
}

export function updateZoomAroundPoint(newZoom: number, centerX: number, centerY: number): void {
  const oldZoom = transform.zoom;
  transform.zoom = Math.max(0.1, Math.min(10, newZoom));

  // Adjust pan to keep point under cursor
  const scale = transform.zoom / oldZoom;
  transform.panX = centerX - (centerX - transform.panX) * scale;
  transform.panY = centerY - (centerY - transform.panY) * scale;

  notify();
}

/**
 * Convert screen coordinates (clientX, clientY relative to SVG) to canvas coordinates.
 * Takes zoom and pan into account.
 */
export function screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
  return {
    x: (screenX - transform.panX) / transform.zoom,
    y: (screenY - transform.panY) / transform.zoom,
  };
}

/**
 * Convert canvas coordinates to screen coordinates.
 */
export function canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
  return {
    x: canvasX * transform.zoom + transform.panX,
    y: canvasY * transform.zoom + transform.panY,
  };
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  for (const fn of listeners) fn();
}

export function resetTransform(): void {
  transform = { zoom: 1, panX: 0, panY: 0 };
  notify();
}
