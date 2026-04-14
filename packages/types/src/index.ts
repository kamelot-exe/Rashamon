/**
 * Core domain types for Rashamon Draw.
 *
 * These types define the shared vocabulary across all layers:
 * TypeScript frontend, Rust backend, and file format.
 *
 * Keep in sync with crates/rashamon_core Rust types.
 */

// ─── Identifiers ─────────────────────────────────────────────

export type NodeId = string;
export type DocumentId = string;

// ─── Geometry ────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CornerRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

// ─── Transform ───────────────────────────────────────────────

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;   // degrees
  skewX: number;
  skewY: number;
}

export const defaultTransform = (): Transform => ({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0,
});

// ─── Color ───────────────────────────────────────────────────

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type ColorString = string; // "#RRGGBB" or "rgba(r,g,b,a)"

// ─── Fill & Stroke ───────────────────────────────────────────

export type FillType = 'solid' | 'gradient' | 'pattern';

export interface Fill {
  type: FillType;
  color?: ColorString;
  // gradient and pattern fields added later
}

export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';

export interface Stroke {
  color: ColorString;
  width: number;
  dashPattern?: number[];
  lineCap: LineCap;
  lineJoin: LineJoin;
}

// ─── Geometry Types ─────────────────────────────────────────

export type GeometryType =
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'path'
  | 'polygon'
  | 'text';

export interface RectGeometry {
  type: 'rect';
  width: number;
  height: number;
  cornerRadius?: CornerRadius;
}

export interface EllipseGeometry {
  type: 'ellipse';
  rx: number;
  ry: number;
}

export interface LineGeometry {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PathCommand {
  type: string; // M, L, C, Z, etc.
  params: number[];
}

export interface PathGeometry {
  type: 'path';
  commands: PathCommand[];
}

export interface PolygonGeometry {
  type: 'polygon';
  points: Vec2[];
}

export interface TextGeometry {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
}

export type Geometry =
  | RectGeometry
  | EllipseGeometry
  | LineGeometry
  | PathGeometry
  | PolygonGeometry
  | TextGeometry;

// ─── Scene Node ──────────────────────────────────────────────

export type SceneNodeType = 'group' | 'frame' | 'shape' | 'text' | 'image';

export interface BaseSceneNode {
  id: NodeId;
  name: string;
  type: SceneNodeType;
  transform: Transform;
  visible: boolean;
  locked: boolean;
  opacity: number;
  semanticTags: string[];
  semanticRole?: SemanticRole;
}

export interface ShapeSceneNode extends BaseSceneNode {
  type: 'shape';
  geometry: Geometry;
  fill: Fill | null;
  stroke: Stroke | null;
}

/**
 * Frame — a sized container that acts as an artboard/design surface.
 * Distinct from Group: frames have explicit width/height, optional
 * background fill, and clip their contents to bounds.
 */
export interface FrameSceneNode extends BaseSceneNode {
  type: 'frame';
  width: number;
  height: number;
  background: ColorString | null;
  clipContent: boolean;
  children: SceneNode[];
}

export interface GroupSceneNode extends BaseSceneNode {
  type: 'group';
  children: SceneNode[];
}

export interface TextSceneNode extends BaseSceneNode {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fill: ColorString;
}

export type SceneNode = ShapeSceneNode | FrameSceneNode | GroupSceneNode | TextSceneNode;

// ─── Semantic Roles ─────────────────────────────────────────

export type SemanticRole =
  | 'background'
  | 'foreground'
  | { uiElement: UiElementType }
  | 'annotation'
  | 'guide'
  | { custom: string };

export type UiElementType =
  | 'button'
  | 'input'
  | 'card'
  | 'header'
  | 'footer'
  | 'nav'
  | 'icon';

// ─── Canvas ──────────────────────────────────────────────────

export interface CanvasConfig {
  width: number;
  height: number;
  background: ColorString | null;
  units: Unit;
  colorProfile: string;
}

export type Unit = 'px' | 'mm' | 'in' | 'pt';

export const defaultCanvasConfig = (): CanvasConfig => ({
  width: 1920,
  height: 1080,
  background: '#FFFFFF',
  units: 'px',
  colorProfile: 'sRGB',
});

// ─── Document ────────────────────────────────────────────────

export interface RashamonDocument {
  id: DocumentId;
  version: string;
  metadata: DocumentMetadata;
  canvas: CanvasConfig;
  root: GroupSceneNode;
  // history and assets will be added later
}

export interface DocumentMetadata {
  title: string;
  author: string;
  description: string;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
}

// ─── Tool ────────────────────────────────────────────────────

export type ToolName =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'pen'
  | 'hand'
  | 'zoom';

// ─── Application State ──────────────────────────────────────

export interface AppState {
  activeTool: ToolName;
  selectedNodeIds: NodeId[];
  zoom: number;
  panOffset: Vec2;
}
