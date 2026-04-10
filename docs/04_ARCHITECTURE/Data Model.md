---
title: Data Model
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Data Model

Модель данных Rashamon — структурированное представление документа, объектов и истории.

---

## Core Concepts

### Document

Верхнеуровневый контейнер всего содержимого.

```rust
pub struct Document {
    pub id: DocumentId,
    pub metadata: Metadata,
    pub canvas: Canvas,
    pub root: SceneNode,        // Root of scene graph
    pub history: HistoryGraph,   // DAG of states
    pub assets: AssetRegistry,   // Images, fonts, etc.
    pub config: DocumentConfig,
}
```

### Metadata

```rust
pub struct Metadata {
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub created_at: Timestamp,
    pub modified_at: Timestamp,
    pub version: SemVer,
    pub app_version: String,    // "rashamon-draw/0.1.0"
}
```

### Canvas

```rust
pub struct Canvas {
    pub width: f64,              // Logical units
    pub height: f64,
    pub background: Option<Color>,
    pub color_profile: ColorProfile,
    pub units: Unit,             // px, mm, in, etc.
}
```

---

## Scene Graph

Иерархическая структура объектов на канвасе.

```rust
pub enum SceneNode {
    Group {
        id: NodeId,
        name: String,
        children: Vec<SceneNode>,
        transform: Transform,
        visible: bool,
        locked: bool,
        semantic_tags: Vec<String>,
    },
    Shape {
        id: NodeId,
        name: String,
        geometry: Geometry,       // Rect, Ellipse, Path, etc.
        fill: Option<Fill>,
        stroke: Option<Stroke>,
        transform: Transform,
        visible: bool,
        locked: bool,
        opacity: f64,
        semantic_tags: Vec<String>,
        semantic_role: Option<SemanticRole>,
    },
    Text {
        id: NodeId,
        name: String,
        content: String,
        font: FontRef,
        font_size: f64,
        fill: Color,
        transform: Transform,
        visible: bool,
        locked: bool,
        opacity: f64,
    },
    Image {
        id: NodeId,
        name: String,
        asset_ref: AssetId,
        transform: Transform,
        visible: bool,
        locked: bool,
        opacity: f64,
        clipping: Option<ClipPath>,
    },
}
```

### Transform

```rust
pub struct Transform {
    pub x: f64,
    pub y: f64,
    pub scale_x: f64,
    pub scale_y: f64,
    pub rotation: f64,          // degrees
    pub skew_x: f64,
    pub skew_y: f64,
}
```

### Geometry

```rust
pub enum Geometry {
    Rect { width: f64, height: f64, corner_radius: CornerRadius },
    Ellipse { rx: f64, ry: f64 },
    Line { x1: f64, y1: f64, x2: f64, y2: f64 },
    Path { commands: Vec<PathCommand> },
    Polygon { points: Vec<(f64, f64)> },
}
```

### Semantic Role

```rust
pub enum SemanticRole {
    Background,
    Foreground,
    UiElement { subtype: UiElementType },
    Annotation,
    Guide,
    Custom { name: String },
}

pub enum UiElementType {
    Button,
    Input,
    Card,
    Header,
    Footer,
    Nav,
    Icon,
}
```

---

## Fill & Stroke

```rust
pub enum Fill {
    Solid(Color),
    // Gradient — post-MVP
    // Pattern — post-MVP
}

pub struct Stroke {
    pub color: Color,
    pub width: f64,
    pub dash_pattern: Option<Vec<f64>>,
    pub line_cap: LineCap,
    pub line_join: LineJoin,
}

pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}
```

---

## History Model

### Linear (MVP)

```rust
pub struct HistoryStack {
    pub states: Vec<HistoryState>,
    pub current_index: usize,
}

pub struct HistoryState {
    pub id: StateId,
    pub timestamp: Timestamp,
    pub snapshot: SceneSnapshot,
    pub description: String,
}
```

### Graph (Phase 5+)

```rust
pub struct HistoryGraph {
    pub nodes: HashMap<StateId, HistoryNode>,
    pub root: StateId,
    pub head: StateId,
}

pub struct HistoryNode {
    pub id: StateId,
    pub parent_ids: Vec<StateId>,    // Multiple for merges
    pub child_ids: Vec<StateId>,
    pub snapshot: SceneSnapshot,
    pub operation: HistoryOperation,
    pub timestamp: Timestamp,
    pub branch_name: Option<String>,
}
```

---

## Asset Registry

```rust
pub struct AssetRegistry {
    pub assets: HashMap<AssetId, Asset>,
}

pub enum Asset {
    Image {
        id: AssetId,
        format: ImageFormat,
        data: Vec<u8>,
        width: u32,
        height: u32,
    },
    Font {
        id: AssetId,
        family: String,
        style: String,
        data: Vec<u8>,
    },
}
```

---

## Document Config

```rust
pub struct DocumentConfig {
    pub grid: GridConfig,
    pub guides: Vec<Guide>,
    pub snaps: SnapConfig,
    pub plugins: Vec<PluginConfig>,
}
```

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Rust structs для модели | Типобезопасность, производительность |
| SceneNode enum | Расширяемость новыми типами узлов |
| Semantic tags + role | Два уровня семантики: свободные теги + структурированные роли |
| Linear → Graph history | MVP простота, future power |
| Asset references | Ассеты — отдельная система, не встроенные в ноды |

---

## Links

- [[Project File Format]]
- [[System Architecture]]
- [[ADR-003 Project Format Principles]]

---

## Next Actions

1. Реализовать Rust structs в Phase 2
2. Создать serde сериализацию для файлового формата
3. Определить migration strategy для future версий
