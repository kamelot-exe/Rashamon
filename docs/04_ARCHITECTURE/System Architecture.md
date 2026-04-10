---
title: System Architecture
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# System Architecture

Обзор архитектуры Rashamon на уровне системы.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────┐
│                  User                         │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│              Tauri 2 App Shell                │
│  ┌────────────────────────────────────────┐  │
│  │         Frontend (Webview)              │  │
│  │  ┌──────────┐  ┌───────────┐           │  │
│  │  │  React   │  │  Canvas   │           │  │
│  │  │  UI      │  │  (SVG +   │           │  │
│  │  │  Layers  │  │  2D)      │           │  │
│  │  └────┬─────┘  └─────┬─────┘           │  │
│  │       │              │                  │  │
│  │  ┌────▼──────────────▼─────┐            │  │
│  │  │   TS Binding Layer     │            │  │
│  │  └──────────┬─────────────┘            │  │
│  └─────────────┼─────────────────────────┘  │
│                │ IPC (Tauri)                │
│  ┌─────────────▼─────────────────────────┐  │
│  │         Backend (Rust)                 │  │
│  │  ┌──────────┐  ┌───────────┐          │  │
│  │  │ Document │  │  Scene    │          │  │
│  │  │  Model   │  │  Graph    │          │  │
│  │  └────┬─────┘  └─────┬─────┘          │  │
│  │       │              │                 │  │
│  │  ┌────▼──────────────▼─────┐           │  │
│  │  │   Core Engine          │           │  │
│  │  │  (history, assets,     │           │  │
│  │  │   export, plugins)     │           │  │
│  │  └──────────┬─────────────┘           │  │
│  └─────────────┼─────────────────────────┘  │
└────────────────┼────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│              File System                     │
│  ┌─────────────┐  ┌───────────────────┐     │
│  │ .rdraw file │  │ ~/.config/rashamon│     │
│  │ (JSON)      │  │ (config, plugins) │     │
│  └─────────────┘  └───────────────────┘     │
└──────────────────────────────────────────────┘
```

---

## Layers

### 1. Frontend (Webview)

| Компонент | Технология | Описание |
|---|---|---|
| UI Framework | React 19 | Основной UI |
| State | React hooks + context | Локальный state |
| Canvas rendering | SVG + Canvas 2D | Hybrid rendering |
| Command palette | React component | Ctrl+Shift+P |
| Panels | React components | Layers, Properties, etc. |

### 2. IPC Layer (Tauri)

| Компонент | Описание |
|---|---|
| Tauri Commands | Вызовы Rust из TS |
| Tauri Events | События из Rust в TS |
| Tauri State | Shared state в Rust |

### 3. Backend (Rust)

| Компонент | Описание |
|---|---|
| Document Model | Структура документа, сериализация |
| Scene Graph | Иерархия объектов |
| History Engine | Undo/redo (linear → graph) |
| Asset Manager | Управление ассетами |
| Export Engine | PNG, SVG, etc. |
| Plugin Runtime | Загрузка и выполнение плагинов |

### 4. Storage

| Компонент | Описание |
|---|---|
| Project files | JSON-based .rdraw |
| Config | `~/.config/rashamon/` |
| SQLite (future) | Индекс проектов, метаданные |

---

## Data Flow

### User Action → Render

```
User clicks & drags object
  → Frontend captures mouse event
  → Tauri command: update_transform(object_id, new_transform)
  → Rust: update scene graph
  → Rust: emit event "scene_changed"
  → Frontend: re-render affected area
```

### Save Document

```
User presses Ctrl+S
  → Frontend: Tauri command save_document(path)
  → Rust: serialize document model → JSON
  → Rust: write to file system
  → Rust: return success
  → Frontend: show "Saved" notification
```

### Plugin Execution

```
User runs plugin
  → Plugin runtime validates permissions
  → Plugin calls document API
  → Rust applies changes to scene graph
  → Frontend re-renders
```

---

## Key Design Principles

| Принцип | Описание |
|---|---|
| Single source of truth | Scene graph в Rust — единственный источник |
| Unidirectional data flow | Frontend → Rust → Frontend |
| Immutability where possible | История неизменна; новые snapshots |
| Separation of concerns | Rendering ≠ data model ≠ business logic |

---

## Platform Support

| Platform | Priority | Status |
|---|---|---|
| Linux (Wayland) | P0 | Target |
| Linux (X11) | P0 | Target |
| macOS | P1 | Later |
| Windows | P1 | Later |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Tauri 2 | Меньший footprint, Rust-бэкенд, native feel |
| SVG + Canvas hybrid | SVG для UI-чёткости, Canvas для производительности |
| Rust backend | Производительность, безопасность, типизация |
| JSON file format | Diff-able, readable, portable |

---

## Assumptions

- Tauri 2 webview достаточно производителен для 100+ объектов
- SVG rendering не bottleneck на typical canvas sizes
- Rust FFI overhead через Tauri acceptable

---

## Links

- [[ADR-001 Core Stack]]
- [[Rendering Architecture]]
- [[Monorepo Structure]]
- [[Performance Strategy]]

---

## Next Actions

1. Детализировать [[Rendering Architecture]]
2. Спроектировать document model в [[Data Model]]
3. Определить plugin API surface в [[Plugin System]]
