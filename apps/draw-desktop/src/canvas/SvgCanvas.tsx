/**
 * SVG Canvas Renderer.
 *
 * Renders scene nodes from the document store into SVG elements.
 * Currently supported: rect, ellipse, line.
 *
 * Architecture note: This is a simple SVG renderer. Future versions
 * may add Canvas/WebGL rendering for performance with large scenes.
 */

import { SceneNode, ShapeSceneNode, FrameSceneNode, GroupSceneNode, TextSceneNode, RectGeometry, EllipseGeometry, LineGeometry, TextGeometry, NodeId } from '@rashamon/types';

// ─── Main renderer ──────────────────────────────────────────

export function renderSceneNodes(node: SceneNode): React.ReactElement {
  const transformAttr = buildTransform(node.transform);

  switch (node.type) {
    case 'group': {
      const group = node as GroupSceneNode;
      return (
        <g
          key={node.id}
          data-node-id={node.id}
          transform={transformAttr || undefined}
          opacity={node.opacity}
          style={{ display: node.visible ? undefined : 'none' }}
        >
          {group.children.map((child) => renderSceneNodes(child))}
        </g>
      );
    }

    case 'frame': {
      const frame = node as FrameSceneNode;
      return (
        <g
          key={frame.id}
          data-node-id={frame.id}
          transform={transformAttr || undefined}
          opacity={frame.opacity}
          style={{ display: frame.visible ? undefined : 'none' }}
        >
          {/* Frame background */}
          <rect
            x={0}
            y={0}
            width={frame.width}
            height={frame.height}
            fill={frame.background ?? '#FFFFFF'}
            rx={2}
            ry={2}
          />
          {/* Frame border */}
          <rect
            x={0}
            y={0}
            width={frame.width}
            height={frame.height}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            rx={2}
            ry={2}
            pointerEvents="none"
          />
          {/* Frame name label */}
          {frame.height > 30 && (
            <text
              x={8}
              y={16}
              fill="rgba(255,255,255,0.35)"
              fontSize={10}
              fontFamily="var(--font-sans)"
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {frame.name}
            </text>
          )}
          {/* Clip group if enabled */}
          {frame.clipContent ? (
            <>
              <clipPath id={`clip-${frame.id}`}>
                <rect x={0} y={0} width={frame.width} height={frame.height} rx={2} ry={2} />
              </clipPath>
              <g clipPath={`url(#clip-${frame.id})`}>
                {frame.children.map((child) => renderSceneNodes(child))}
              </g>
            </>
          ) : (
            frame.children.map((child) => renderSceneNodes(child))
          )}
        </g>
      );
    }

    case 'shape': {
      const shape = node as ShapeSceneNode;
      return (
        <g
          key={node.id}
          data-node-id={node.id}
          transform={transformAttr || undefined}
          opacity={node.opacity}
          style={{ display: node.visible ? undefined : 'none', pointerEvents: node.locked ? 'none' : 'auto' }}
        >
          {renderGeometry(shape)}
        </g>
      );
    }

    case 'text': {
      const textNode = node as TextSceneNode;
      return (
        <text
          key={node.id}
          data-node-id={node.id}
          x={textNode.transform.x}
          y={textNode.transform.y + textNode.fontSize}
          fill={textNode.fill}
          fontFamily={textNode.fontFamily}
          fontSize={textNode.fontSize}
          opacity={textNode.opacity}
          transform={buildTransform({
            x: 0,
            y: 0,
            rotation: textNode.transform.rotation,
            scaleX: textNode.transform.scaleX,
            scaleY: textNode.transform.scaleY,
            skewX: textNode.transform.skewX,
            skewY: textNode.transform.skewY,
          }) || undefined}
          style={{ display: textNode.visible ? undefined : 'none', pointerEvents: textNode.locked ? 'none' : 'auto' }}
        >
          {textNode.content}
        </text>
      );
    }

    case 'image': {
      const img = node as import('@rashamon/types').ImageSceneNode;
      return (
        <g
          key={img.id}
          data-node-id={img.id}
          transform={transformAttr || undefined}
          opacity={img.opacity}
          style={{ display: img.visible ? undefined : 'none' }}
        >
          <rect x={0} y={0} width={img.width} height={img.height} fill="#374151" rx={2} />
          {/* Image placeholder — actual image rendering requires asset loading */}
          <text x={img.width / 2} y={img.height / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={12} fontFamily="var(--font-sans)">
            🖼 {img.name}
          </text>
        </g>
      );
    }

    case 'componentInstance': {
      const inst = node as import('@rashamon/types').ComponentInstanceNode;
      return (
        <g
          key={inst.id}
          data-node-id={inst.id}
          transform={transformAttr || undefined}
          opacity={inst.opacity}
          style={{ display: inst.visible ? undefined : 'none' }}
        >
          <rect x={0} y={0} width={inst.width} height={inst.height} fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth={1.5} strokeDasharray="4 2" rx={2} />
          <text x={4} y={14} fill="rgba(139,92,246,0.5)" fontSize={10} fontFamily="var(--font-sans)" pointerEvents="none">
            ◆ {inst.name}
          </text>
        </g>
      );
    }

    default: {
      const _exhaustive: never = node;
      return <g key={`unknown-${String(_exhaustive)}`} />;
    }
  }
}

// ─── Geometry rendering ─────────────────────────────────────

function renderGeometry(shape: ShapeSceneNode): React.ReactElement {
  const attrs = getShapeAttrs(shape);

  switch (shape.geometry.type) {
    case 'rect': {
      const geo = shape.geometry as RectGeometry;
      return (
        <rect
          width={geo.width}
          height={geo.height}
          rx={geo.cornerRadius?.topLeft ?? 0}
          ry={geo.cornerRadius?.topLeft ?? 0}
          {...attrs}
        />
      );
    }
    case 'ellipse': {
      const geo = shape.geometry as EllipseGeometry;
      return <ellipse cx={geo.rx} cy={geo.ry} rx={geo.rx} ry={geo.ry} {...attrs} />;
    }
    case 'line': {
      const geo = shape.geometry as LineGeometry;
      return (
        <line
          x1={geo.x1}
          y1={geo.y1}
          x2={geo.x2}
          y2={geo.y2}
          {...attrs}
        />
      );
    }
    case 'path':
      // TODO: implement path rendering
      return <path d="" {...attrs} />;
    case 'polygon': {
      const points = shape.geometry.points.map((p) => `${p.x},${p.y}`).join(' ');
      return <polygon points={points} {...attrs} />;
    }
    case 'text': {
      const geo = shape.geometry as TextGeometry;
      return (
        <text
          x={0}
          y={geo.fontSize}
          fill={shape.fill?.color ?? '#FFFFFF'}
          fontFamily={geo.fontFamily}
          fontSize={geo.fontSize}
          {...attrs}
        >
          {geo.content}
        </text>
      );
    }
    default:
      return <rect width={0} height={0} {...attrs} />;
  }
}

function getShapeAttrs(shape: ShapeSceneNode): Record<string, string | number | undefined> {
  const attrs: Record<string, string | number | undefined> = {
    'data-node-id': shape.id,
  };

  if (shape.fill) {
    attrs.fill = shape.fill.color ?? 'none';
  } else {
    attrs.fill = 'none';
  }

  if (shape.stroke) {
    attrs.stroke = shape.stroke.color;
    attrs.strokeWidth = shape.stroke.width;
    if (shape.stroke.dashPattern) {
      attrs.strokeDasharray = shape.stroke.dashPattern.join(' ');
    }
  }

  return attrs;
}

// ─── Transform ──────────────────────────────────────────────

function buildTransform(t: { x: number; y: number; rotation: number; scaleX: number; scaleY: number; skewX: number; skewY: number }): string {
  const parts: string[] = [];
  if (t.x !== 0 || t.y !== 0) {
    parts.push(`translate(${t.x}, ${t.y})`);
  }
  if (t.rotation !== 0) {
    parts.push(`rotate(${t.rotation})`);
  }
  if (t.scaleX !== 1 || t.scaleY !== 1) {
    parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
  }
  if (t.skewX !== 0 || t.skewY !== 0) {
    parts.push(`skew(${t.skewX}, ${t.skewY})`);
  }
  return parts.join(' ');
}

// ─── Selection overlay ──────────────────────────────────────

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 25;

interface SelectionOverlayProps {
  nodeId: NodeId | null;
  nodes: SceneNode[];
  onResize: (nodeId: NodeId, handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => void;
  onRotate: (nodeId: NodeId, angle: number, isStart: boolean, isEnd: boolean) => void;
}

export function SelectionOverlay({ nodeId, nodes, onResize, onRotate }: SelectionOverlayProps): React.ReactElement | null {
  if (!nodeId) return null;

  const node = findNodeById(
    nodes.length > 0
      ? { id: 'root', name: '', type: 'group', transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 }, visible: true, locked: false, opacity: 1, semanticTags: [], children: nodes } as GroupSceneNode
      : null,
    nodeId
  );

  if (!node || (node.type !== 'shape' && node.type !== 'text' && node.type !== 'frame')) return null;

  const { x, y, rotation } = node.transform;
  let w = 0, h = 0, centerX = x, centerY = y;

  if (node.type === 'shape') {
    const shape = node as ShapeSceneNode;
    switch (shape.geometry.type) {
      case 'rect': {
        const g = shape.geometry as RectGeometry;
        w = g.width;
        h = g.height;
        centerX = x + w / 2;
        centerY = y + h / 2;
        break;
      }
      case 'ellipse': {
        const g = shape.geometry as EllipseGeometry;
        w = g.rx * 2;
        h = g.ry * 2;
        centerX = x;
        centerY = y;
        break;
      }
      case 'line': {
        const g = shape.geometry as LineGeometry;
        w = Math.abs(g.x2 - g.x1);
        h = Math.abs(g.y2 - g.y1);
        centerX = x + (g.x1 + g.x2) / 2;
        centerY = y + (g.y1 + g.y2) / 2;
        break;
      }
      default: {
        centerX = x + w / 2;
        centerY = y + h / 2;
      }
    }
  } else if (node.type === 'frame') {
    const frame = node as FrameSceneNode;
    w = frame.width;
    h = frame.height;
    centerX = x + w / 2;
    centerY = y + h / 2;
  } else if (node.type === 'text') {
    const textNode = node as TextSceneNode;
    const approxWidth = textNode.content.length * textNode.fontSize * 0.6;
    w = approxWidth;
    h = textNode.fontSize;
    centerX = x + w / 2;
    centerY = y;
  }

  const hs = HANDLE_SIZE / 2;

  // Handle positions: tl, tr, bl, br, top, bottom, left, right
  const handles = [
    { id: 'tl', cx: x - hs, cy: y - hs, cursor: 'nwse-resize' },
    { id: 'tr', cx: x + w - hs, cy: y - hs, cursor: 'nesw-resize' },
    { id: 'bl', cx: x - hs, cy: y + h - hs, cursor: 'nesw-resize' },
    { id: 'br', cx: x + w - hs, cy: y + h - hs, cursor: 'nwse-resize' },
    { id: 'tm', cx: x + w / 2 - hs, cy: y - hs, cursor: 'ns-resize' },
    { id: 'bm', cx: x + w / 2 - hs, cy: y + h - hs, cursor: 'ns-resize' },
    { id: 'ml', cx: x - hs, cy: y + h / 2 - hs, cursor: 'ew-resize' },
    { id: 'mr', cx: x + w - hs, cy: y + h / 2 - hs, cursor: 'ew-resize' },
  ];

  // Rotate handle position (above center)
  const rotateY = y - ROTATE_HANDLE_OFFSET;
  const rotateX = x + w / 2;

  return (
    <g className="selection-overlay" pointerEvents="auto">
      {/* Bounding box */}
      <rect
        x={x - 2}
        y={y - 2}
        width={w + 4}
        height={h + 4}
        fill="none"
        stroke="#6c7bff"
        strokeWidth={2}
        strokeDasharray="4 2"
        pointerEvents="none"
        {...(rotation !== 0 ? { transform: `rotate(${rotation} ${centerX} ${centerY})` } : {})}
      />

      {/* Rotate handle line */}
      <line
        x1={x + w / 2}
        y1={y - 2}
        x2={rotateX}
        y2={rotateY + hs}
        stroke="#6c7bff"
        strokeWidth={2}
        pointerEvents="none"
        {...(rotation !== 0 ? { transform: `rotate(${rotation} ${centerX} ${centerY})` } : {})}
      />

      {/* Rotate handle circle */}
      <circle
        cx={rotateX}
        cy={rotateY}
        r={6}
        fill="#fff"
        stroke="#6c7bff"
        strokeWidth={2}
        className="rotate-handle"
        cursor="grab"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleRotateStart(e, nodeId, centerX, centerY, onRotate, undefined);
        }}
      />

      {/* Resize handles */}
      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.cx}
          y={handle.cy}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#fff"
          stroke="#6c7bff"
          strokeWidth={2}
          rx={2}
          className="resize-handle"
          cursor={handle.cursor}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, nodeId, handle.id, onResize);
          }}
          {...(rotation !== 0 ? { transform: `rotate(${rotation} ${centerX} ${centerY})` } : {})}
        />
      ))}
    </g>
  );
}

// ─── Resize interaction ─────────────────────────────────────

function handleResizeStart(
  e: React.MouseEvent<SVGElement>,
  nodeId: NodeId,
  handle: string,
  onResize: (nodeId: NodeId, handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => void
): void {
  const svg = e.currentTarget.closest('svg');
  if (!svg) return;

  const startPos = { x: e.clientX, y: e.clientY };
  let lastDx = 0, lastDy = 0;

  // Push history on start
  onResize(nodeId, handle, 0, 0, false, true, false);

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - startPos.x;
    const dy = moveEvent.clientY - startPos.y;
    const deltaDx = dx - lastDx;
    const deltaDy = dy - lastDy;
    lastDx = dx;
    lastDy = dy;

    onResize(nodeId, handle, deltaDx, deltaDy, moveEvent.shiftKey, false, false);
  };

  const onMouseUp = () => {
    onResize(nodeId, handle, 0, 0, false, false, true);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp, { once: true });
}

// ─── Rotate interaction ─────────────────────────────────────

function handleRotateStart(
  e: React.MouseEvent<SVGElement>,
  nodeIdOrIds: NodeId | NodeId[],
  centerX: number,
  centerY: number,
  onRotateSingle?: (nodeId: NodeId, angle: number, isStart: boolean, isEnd: boolean) => void,
  onRotateMulti?: (nodeIds: NodeId[], angle: number, isStart: boolean, isEnd: boolean) => void
): void {
  const svg = e.currentTarget.closest('svg');
  if (!svg) return;

  const svgRect = svg.getBoundingClientRect();
  const startAngle = Math.atan2(e.clientY - svgRect.top - centerY, e.clientX - svgRect.left - centerX) * (180 / Math.PI);
  let lastAngle = startAngle;

  const isMulti = Array.isArray(nodeIdOrIds);

  // Push history on start
  if (isMulti && onRotateMulti) {
    onRotateMulti(nodeIdOrIds as NodeId[], 0, true, false);
  } else if (!isMulti && onRotateSingle) {
    onRotateSingle(nodeIdOrIds as NodeId, 0, true, false);
  }

  const onMouseMove = (moveEvent: MouseEvent) => {
    const currentAngle = Math.atan2(moveEvent.clientY - svgRect.top - centerY, moveEvent.clientX - svgRect.left - centerX) * (180 / Math.PI);
    let delta = currentAngle - lastAngle;

    if (moveEvent.shiftKey) {
      delta = Math.round(delta / 15) * 15;
    }

    lastAngle = currentAngle;

    if (isMulti && onRotateMulti) {
      onRotateMulti(nodeIdOrIds as NodeId[], delta, false, false);
    } else if (!isMulti && onRotateSingle) {
      onRotateSingle(nodeIdOrIds as NodeId, delta, false, false);
    }
  };

  const onMouseUp = () => {
    if (isMulti && onRotateMulti) {
      onRotateMulti(nodeIdOrIds as NodeId[], 0, false, true);
    } else if (!isMulti && onRotateSingle) {
      onRotateSingle(nodeIdOrIds as NodeId, 0, false, true);
    }
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp, { once: true });
}

function findNodeById(group: GroupSceneNode | FrameSceneNode | null, id: string): SceneNode | null {
  if (!group) return null;
  for (const child of group.children) {
    if (child.id === id) return child;
    if (child.type === 'group' || child.type === 'frame') {
      const found = findNodeById(child as GroupSceneNode | FrameSceneNode, id);
      if (found) return found;
    }
  }
  return null;
}

// ─── Multi-selection overlay ──────────────────────────────────────

interface MultiSelectionOverlayProps {
  nodes: SceneNode[];
  onResize: (nodeIds: NodeId[], handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => void;
  onRotate: (nodeIds: NodeId[], angle: number, isStart: boolean, isEnd: boolean) => void;
}

export function MultiSelectionOverlay({ nodes, onResize, onRotate }: MultiSelectionOverlayProps): React.ReactElement | null {
  if (nodes.length < 2) return null;

  // Compute union bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const node of nodes) {
    const bounds = getNodeBoundsForMulti(node);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.w);
    maxY = Math.max(maxY, bounds.y + bounds.h);
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const centerX = minX + w / 2;
  const centerY = minY + h / 2;
  const hs = HANDLE_SIZE / 2;
  const nodeIds = nodes.map((n) => n.id);

  const handles = [
    { id: 'tl', cx: minX - hs, cy: minY - hs, cursor: 'nwse-resize' },
    { id: 'tr', cx: maxX - hs, cy: minY - hs, cursor: 'nesw-resize' },
    { id: 'bl', cx: minX - hs, cy: maxY - hs, cursor: 'nesw-resize' },
    { id: 'br', cx: maxX - hs, cy: maxY - hs, cursor: 'nwse-resize' },
    { id: 'tm', cx: minX + w / 2 - hs, cy: minY - hs, cursor: 'ns-resize' },
    { id: 'bm', cx: minX + w / 2 - hs, cy: maxY - hs, cursor: 'ns-resize' },
    { id: 'ml', cx: minX - hs, cy: minY + h / 2 - hs, cursor: 'ew-resize' },
    { id: 'mr', cx: maxX - hs, cy: minY + h / 2 - hs, cursor: 'ew-resize' },
  ];

  const rotateY = minY - ROTATE_HANDLE_OFFSET;
  const rotateX = minX + w / 2;

  return (
    <g className="selection-overlay" pointerEvents="auto">
      {/* Union bounding box */}
      <rect
        x={minX - 2}
        y={minY - 2}
        width={w + 4}
        height={h + 4}
        fill="none"
        stroke="#6c7bff"
        strokeWidth={2}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Rotate handle */}
      <line
        x1={minX + w / 2}
        y1={minY - 2}
        x2={rotateX}
        y2={rotateY + hs}
        stroke="#6c7bff"
        strokeWidth={2}
        pointerEvents="none"
      />
      <circle
        cx={rotateX}
        cy={rotateY}
        r={6}
        fill="#fff"
        stroke="#6c7bff"
        strokeWidth={2}
        className="rotate-handle"
        cursor="grab"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleRotateStart(e, nodeIds, centerX, centerY, undefined, onRotate);
        }}
      />

      {/* Resize handles */}
      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.cx}
          y={handle.cy}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#fff"
          stroke="#6c7bff"
          strokeWidth={2}
          rx={2}
          className="resize-handle"
          cursor={handle.cursor}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStartMulti(e, nodeIds, handle.id, onResize);
          }}
        />
      ))}
    </g>
  );
}

function getNodeBoundsForMulti(node: SceneNode): { x: number; y: number; w: number; h: number } {
  const { x, y } = node.transform;
  let w = 0, h = 0;

  if (node.type === 'shape') {
    const shape = node as ShapeSceneNode;
    switch (shape.geometry.type) {
      case 'rect':
        w = (shape.geometry as RectGeometry).width;
        h = (shape.geometry as RectGeometry).height;
        break;
      case 'ellipse':
        w = (shape.geometry as EllipseGeometry).rx * 2;
        h = (shape.geometry as EllipseGeometry).ry * 2;
        break;
      case 'line':
        const lg = shape.geometry as LineGeometry;
        w = Math.abs(lg.x2 - lg.x1);
        h = Math.abs(lg.y2 - lg.y1);
        break;
    }
  } else if (node.type === 'text') {
    const textNode = node as TextSceneNode;
    w = textNode.content.length * textNode.fontSize * 0.6;
    h = textNode.fontSize;
  }

  return { x, y, w, h };
}

function handleResizeStartMulti(
  e: React.MouseEvent<SVGElement>,
  nodeIds: NodeId[],
  handle: string,
  onResize: (nodeIds: NodeId[], handle: string, dx: number, dy: number, shiftKey: boolean, isStart: boolean, isEnd: boolean) => void
): void {
  const svg = e.currentTarget.closest('svg');
  if (!svg) return;

  const startPos = { x: e.clientX, y: e.clientY };
  let lastDx = 0, lastDy = 0;

  onResize(nodeIds, handle, 0, 0, false, true, false);

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - startPos.x;
    const dy = moveEvent.clientY - startPos.y;
    const deltaDx = dx - lastDx;
    const deltaDy = dy - lastDy;
    lastDx = dx;
    lastDy = dy;

    onResize(nodeIds, handle, deltaDx, deltaDy, moveEvent.shiftKey, false, false);
  };

  const onMouseUp = () => {
    onResize(nodeIds, handle, 0, 0, false, false, true);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp, { once: true });
}
