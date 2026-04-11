/**
 * SVG Canvas Renderer.
 *
 * Renders scene nodes from the document store into SVG elements.
 * Currently supported: rect, ellipse, line.
 *
 * Architecture note: This is a simple SVG renderer. Future versions
 * may add Canvas/WebGL rendering for performance with large scenes.
 */

import { SceneNode, ShapeSceneNode, GroupSceneNode, RectGeometry, EllipseGeometry, LineGeometry, NodeId } from '@rashamon/types';

// ─── Main renderer ──────────────────────────────────────────

export function renderSceneNodes(node: SceneNode): React.ReactElement {
  const style: React.CSSProperties = {
    transform: buildTransform(node.transform),
    opacity: node.opacity,
    display: node.visible ? undefined : 'none',
    pointerEvents: node.locked ? 'none' : 'auto',
  };

  switch (node.type) {
    case 'group': {
      const group = node as GroupSceneNode;
      return (
        <g key={node.id} data-node-id={node.id} style={style}>
          {group.children.map((child) => renderSceneNodes(child))}
        </g>
      );
    }

    case 'shape': {
      const shape = node as ShapeSceneNode;
      return (
        <g key={node.id} data-node-id={node.id} style={style}>
          {renderGeometry(shape)}
        </g>
      );
    }

    case 'text':
      // TODO: implement text rendering
      return (
        <text key={node.id} data-node-id={node.id} style={style}>
          {node.content}
        </text>
      );

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

export function renderSelectionOverlay(
  nodeId: NodeId | null,
  nodes: SceneNode[]
): React.ReactElement | null {
  if (!nodeId) return null;

  const node = findNodeById(nodes.length > 0 ? { id: 'root', name: '', type: 'group', transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 }, visible: true, locked: false, opacity: 1, semanticTags: [], children: nodes } as GroupSceneNode : null, nodeId);
  if (!node || node.type !== 'shape') return null;

  const shape = node as ShapeSceneNode;
  const { x, y } = shape.transform;
  let w = 0, h = 0;

  switch (shape.geometry.type) {
    case 'rect': {
      const g = shape.geometry as RectGeometry;
      w = g.width;
      h = g.height;
      break;
    }
    case 'ellipse': {
      const g = shape.geometry as EllipseGeometry;
      w = g.rx * 2;
      h = g.ry * 2;
      break;
    }
    case 'line': {
      const g = shape.geometry as LineGeometry;
      w = Math.abs(g.x2 - g.x1);
      h = Math.abs(g.y2 - g.y1);
      break;
    }
  }

  return (
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
      className="selection-outline"
    />
  );
}

function findNodeById(group: GroupSceneNode | null, id: string): SceneNode | null {
  if (!group) return null;
  for (const child of group.children) {
    if (child.id === id) return child;
    if (child.type === 'group') {
      const found = findNodeById(child as GroupSceneNode, id);
      if (found) return found;
    }
  }
  return null;
}
