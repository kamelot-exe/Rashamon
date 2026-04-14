/**
 * Core domain types for Rashamon Canvas.
 *
 * These types define the shared vocabulary across all layers:
 * TypeScript frontend, Rust backend, and file format.
 *
 * Keep in sync with crates/rashamon_core Rust types.
 */

// ─── Identifiers ─────────────────────────────────────────────

export type NodeId = string;
export type DocumentId = string;
export type StyleId = string;
export type ComponentId = string;

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

export type FillType = 'solid' | 'gradient' | 'pattern' | 'image';

export interface Fill {
  type: FillType;
  color?: ColorString;
  gradientType?: 'linear' | 'radial';
  gradientStops?: GradientStop[];
  gradientAngle?: number;
  opacity?: number;
  imageRef?: string;
}

export interface GradientStop {
  color: ColorString;
  position: number; // 0-1
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

// ─── Effects ─────────────────────────────────────────────────

export type EffectType = 'dropShadow' | 'innerShadow' | 'layerBlur' | 'backgroundBlur';

export interface Effect {
  type: EffectType;
  visible: boolean;
  radius: number;
  offset?: Vec2;
  spread?: number;
  color: ColorString;
  opacity: number;
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
  type: string;
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

// ─── Constraints ─────────────────────────────────────────────

/** How a child node resizes/repositions when its parent frame resizes. */
export type HorizontalConstraint = 'left' | 'right' | 'center' | 'leftRight' | 'scale';
export type VerticalConstraint = 'top' | 'bottom' | 'center' | 'topBottom' | 'scale';

export interface Constraints {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
}

export const defaultConstraints = (): Constraints => ({
  horizontal: 'left',
  vertical: 'top',
});

// ─── Auto Layout ─────────────────────────────────────────────

export type LayoutMode = 'none' | 'horizontal' | 'vertical';
export type PrimaryAxisSizing = 'fixed' | 'auto' | 'fill';
export type CounterAxisSizing = 'fixed' | 'auto' | 'fill';
export type CounterAxisAlign = 'min' | 'center' | 'max' | 'spaceBetween';
export type PrimaryAxisAlign = 'min' | 'center' | 'max' | 'spaceBetween';

/** Auto Layout configuration on frame/group nodes. */
export interface AutoLayoutConfig {
  mode: LayoutMode;
  /** Space between children (px) */
  spacing: number;
  /** Padding around children (px) */
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  /** How the primary axis (width for horizontal, height for vertical) sizes */
  primaryAxisSizing: PrimaryAxisSizing;
  /** How the counter axis sizes */
  counterAxisSizing: CounterAxisSizing;
  /** Alignment on the primary axis */
  primaryAxisAlign: PrimaryAxisAlign;
  /** Alignment on the counter axis */
  counterAxisAlign: CounterAxisAlign;
}

export const defaultAutoLayoutConfig = (): AutoLayoutConfig => ({
  mode: 'none',
  spacing: 8,
  paddingTop: 8,
  paddingRight: 8,
  paddingBottom: 8,
  paddingLeft: 8,
  primaryAxisSizing: 'fixed',
  counterAxisSizing: 'auto',
  primaryAxisAlign: 'min',
  counterAxisAlign: 'min',
});

/** Per-child layout overrides inside an auto-layout parent. */
export interface LayoutOverride {
  /** Growth factor (0 = no grow) */
  grow: number;
  /** Shrink factor (0 = no shrink) */
  shrink: number;
  /** Fixed size override on the primary axis */
  primaryAxisSize: number | null;
  /** Fixed size override on the counter axis */
  counterAxisSize: number | null;
  /** Self-alignment on the counter axis */
  alignSelf: CounterAxisAlign | 'auto';
}

export const defaultLayoutOverride = (): LayoutOverride => ({
  grow: 0,
  shrink: 1,
  primaryAxisSize: null,
  counterAxisSize: null,
  alignSelf: 'auto',
});

// ─── Styles System ───────────────────────────────────────────

export type StyleType = 'color' | 'text' | 'effect' | 'grid';

export interface BaseStyle {
  id: StyleId;
  name: string;
  type: StyleType;
  description?: string;
}

export interface ColorStyle extends BaseStyle {
  type: 'color';
  color: ColorString;
  opacity: number;
}

export interface TextStyle extends BaseStyle {
  type: 'text';
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'lineThrough';
}

export interface EffectStyle extends BaseStyle {
  type: 'effect';
  effects: Effect[];
}

export type DocumentStyle = ColorStyle | TextStyle | EffectStyle;

// ─── Components System ───────────────────────────────────────

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  /** The master node (frame or group) that defines this component. */
  masterNodeId: NodeId;
  /** Snapshot of the master node's structure at creation time. */
  masterSnapshot: SceneNode;
  createdAt: string;
  updatedAt: string;
}

/** Properties that can be overridden on a component instance. */
export interface ComponentOverride {
  nodeId: NodeId;
  /** Which property is overridden (e.g. "fill", "content", "transform.x"). */
  property: string;
  value: unknown;
}

export interface ComponentInstance {
  /** The component this instance is based on. */
  componentId: ComponentId;
  /** Overrides applied to this instance. */
  overrides: ComponentOverride[];
}

// ─── Scene Node ──────────────────────────────────────────────

export type SceneNodeType = 'group' | 'frame' | 'shape' | 'text' | 'image' | 'componentInstance';

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
  effects: Effect[];
  /** Style references */
  fillStyleId?: StyleId;
  strokeStyleId?: StyleId;
  textStyleId?: StyleId;
  effectStyleId?: StyleId;
}

/**
 * Frame — a sized container that acts as an artboard/design surface.
 * Supports auto layout, clipping, background, and nested children.
 */
export interface FrameSceneNode extends BaseSceneNode {
  type: 'frame';
  width: number;
  height: number;
  background: ColorString | null;
  backgroundStyleId?: StyleId;
  clipContent: boolean;
  /** Auto layout configuration. 'none' means free-form positioning. */
  autoLayout: AutoLayoutConfig;
  children: SceneNode[];
  /** Layout constraints for children are stored on each child's `constraints` field. */
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
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  autoWidth?: boolean;
  autoHeight?: boolean;
  textStyleId?: StyleId;
}

export interface ImageSceneNode extends BaseSceneNode {
  type: 'image';
  width: number;
  height: number;
  /** Base64 encoded image data or asset reference. */
  imageRef: string;
  fillStyleId?: StyleId;
}

/** A component instance — a reference to a master component with overrides. */
export interface ComponentInstanceNode extends BaseSceneNode {
  type: 'componentInstance';
  width: number;
  height: number;
  componentId: ComponentId;
  overrides: ComponentOverride[];
  /** A cached/preview rendering of the instance (for performance). */
  snapshot?: SceneNode;
}

export type SceneNode =
  | ShapeSceneNode
  | FrameSceneNode
  | GroupSceneNode
  | TextSceneNode
  | ImageSceneNode
  | ComponentInstanceNode;

// ─── Constraints on child nodes ─────────────────────────────

/** Stored on each child node to control behavior when parent frame resizes. */
export interface ChildLayoutData {
  constraints: Constraints;
  layoutOverride?: LayoutOverride;
  /** The node's bounding box at the time constraints were last computed. */
  baselineBounds?: Rect;
}

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
  | 'icon'
  | 'image'
  | 'link'
  | 'label'
  | 'heading';

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
  /** Reusable styles defined in this document. */
  styles: DocumentStyle[];
  /** Component definitions for this document. */
  components: ComponentDefinition[];
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
  | 'zoom'
  | 'frame';

// ─── Application State ──────────────────────────────────────

export interface AppState {
  activeTool: ToolName;
  selectedNodeIds: NodeId[];
  zoom: number;
  panOffset: Vec2;
}

// ─── Bounding Box ────────────────────────────────────────────

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
