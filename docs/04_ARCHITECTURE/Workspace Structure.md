---
title: Workspace Structure
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Workspace Structure

Описание структуры монорепозитория Rashamon.

---

## Overview

```
rashamon/
├── package.json              # Root pnpm scripts & dev deps
├── pnpm-workspace.yaml       # Workspace package locations
├── Cargo.toml                # Root cargo workspace
├── eslint.config.js          # ESLint config (root)
├── .prettierrc               # Prettier config (root)
│
├── apps/
│   └── draw-desktop/         # Rashamon Draw desktop app
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       ├── src/              # React frontend
│       │   ├── main.tsx      # Entry point
│       │   ├── App.tsx       # Shell layout component
│       │   └── styles/       # Global styles
│       └── src-tauri/        # Tauri 2 backend
│           ├── Cargo.toml
│           ├── tauri.conf.json
│           ├── build.rs
│           ├── capabilities/
│           ├── icons/
│           └── src/
│               ├── main.rs   # Binary entry point
│               └── lib.rs    # Tauri setup + commands
│
├── packages/
│   ├── types/                # @rashamon/types — shared TS types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   │
│   ├── core/                 # @rashamon/core — shared TS logic
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── document.ts   # Document factory + validation
│   │       └── utils.ts      # ID generation
│   │
│   └── ui/                   # @rashamon/ui — shared React components
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── TopBar.tsx
│           ├── Sidebar.tsx
│           ├── Canvas.tsx
│           ├── Inspector.tsx
│           ├── StatusBar.tsx
│           └── styles.css
│
├── crates/
│   ├── rashamon_core/        # Rust core data model
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── document.rs   # Document model
│   │       ├── scene_graph.rs # Scene graph
│   │       ├── transform.rs  # Transform
│   │       ├── geometry.rs   # Geometry types
│   │       └── error.rs      # Error types
│   │
│   └── rashamon_file_format/ # .rdraw serialization
│       ├── Cargo.toml
│       └── src/lib.rs
│
└── docs/                     # Obsidian knowledge base
```

---

## Package Boundaries

### TypeScript Layer

```
@rashamon/types    ← no dependencies (pure types)
      ↑
@rashamon/core     ← depends on types
      ↑
@rashamon/ui       ← depends on types, react
      ↑
@rashamon/draw-desktop ← depends on all above + tauri
```

### Rust Layer

```
rashamon_core          ← serde, uuid, thiserror
      ↑
rashamon_file_format   ← depends on rashamon_core
      ↑
rashamon-draw-desktop  ← depends on both + tauri
```

### Cross-Layer Communication

```
TypeScript types  ←→  Rust types  (manual sync, keep in sync)
       ↑                      ↑
   Tauri IPC commands (JSON serialization)
```

---

## Workspace Commands

| Command | Описание |
|---|---|
| `pnpm dev:draw` | Запуск Draw в dev mode (Vite + Tauri) |
| `pnpm build:draw` | Production build Draw |
| `pnpm lint` | ESLint всех пакетов |
| `pnpm typecheck` | TypeScript проверка всех пакетов |
| `pnpm format` | Prettier форматирование |
| `pnpm check` | format + lint + typecheck |
| `cargo tauri build` | Собрать Tauri бинарник (в src-tauri/) |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Монорепозиторий | Один источник для всей экосистемы |
| pnpm workspace | Быстрее npm, workspace protocol |
| cargo workspace | Rust crates в одном репо |
| Разделение packages/ и crates/ | Чёткое разделение TS/Rust |
| apps/ содержат src-tauri/ | Каждое приложение автономно |
| Vite для frontend | Быстрый HMR, отличная интеграция с React |

---

## Future Structure

| Пакет | Когда добавить |
|---|---|
| `@rashamon/plugin-api` | Phase 6 — плагины |
| `@rashamon/asset-graph` | Phase 2-3 — общие ассеты |
| `crates/rashamon_history` | Phase 5 — графовая история |
| `apps/photo-desktop/` | Rashamon Photo |
| `apps/motion-desktop/` | Rashamon Motion |

---

## Links

- [[Monorepo Structure]]
- [[System Architecture]]
- [[Shared Platform]]
