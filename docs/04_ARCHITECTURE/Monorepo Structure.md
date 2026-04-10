---
title: Monorepo Structure
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Monorepo Structure

Структура монорепозитория Rashamon с использованием pnpm workspace + cargo workspace.

---

## Structure

```
rashamon/
├── .gitignore
├── README.md
├── LICENSE
├── Cargo.toml                    # Cargo workspace root
├── package.json                  # pnpm workspace root
├── pnpm-workspace.yaml
├── rust-toolchain.toml
│
├── docs/                         # Documentation vault (Obsidian)
│   └── ...
│
├── crates/                       # Rust crates (cargo workspace)
│   ├── core/                     # @rashamon/core — общая модель данных
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── document/         # Document model
│   │       ├── scene_graph/      # Scene graph
│   │       ├── history/          # Undo/redo
│   │       ├── assets/           # Asset management
│   │       └── export/           # Export engines
│   │
│   ├── draw-core/                # Draw-specific Rust logic
│   │   ├── Cargo.toml
│   │   └── src/
│   │
│   ├── plugin-runtime/           # Plugin system
│   │   ├── Cargo.toml
│   │   └── src/
│   │
│   └── asset-graph/              # Shared asset graph
│       ├── Cargo.toml
│       └── src/
│
├── packages/                     # TypeScript packages (pnpm workspace)
│   ├── ui/                       # Shared React UI components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   │
│   ├── tauri-bindings/           # TS bindings for Rust core
│   │   ├── package.json
│   │   └── src/
│   │
│   ├── plugin-api/               # Plugin API types
│   │   ├── package.json
│   │   └── src/
│   │
│   └── shared/                   # Shared utilities
│       ├── package.json
│       └── src/
│
├── apps/                         # Applications
│   ├── draw/                     # Rashamon Draw
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src-tauri/           # Tauri config + Rust entry
│   │   │   ├── Cargo.toml
│   │   │   ├── tauri.conf.json
│   │   │   ├── build.rs
│   │   │   └── src/
│   │   │       ├── main.rs
│   │   │       └── lib.rs
│   │   └── src/                  # React frontend
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       ├── components/       # Draw-specific components
│   │       ├── canvas/           # Canvas rendering
│   │       └── tools/            # Tool implementations
│   │
│   ├── photo/                    # Rashamon Photo (later)
│   │   └── ...
│   │
│   └── motion/                   # Rashamon Motion (later)
│       └── ...
│
├── plugins/                      # Built-in plugins
│   └── ...
│
├── scripts/                      # Build/dev scripts
│   └── ...
│
└── .github/                      # GitHub config
    ├── workflows/                # CI/CD
    ├── ISSUE_TEMPLATE/
    └── CODEOWNERS
```

---

## Workspace Definitions

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Cargo.toml (root)

```toml
[workspace]
members = [
    "crates/core",
    "crates/draw-core",
    "crates/plugin-runtime",
    "crates/asset-graph",
    "apps/draw/src-tauri",
]
resolver = "2"
```

---

## Package Naming

| Package | npm name | crate name |
|---|---|---|
| Core library | `@rashamon/core` | `rashamon-core` |
| UI components | `@rashamon/ui` | — |
| Tauri bindings | `@rashamon/tauri-bindings` | — |
| Plugin API | `@rashamon/plugin-api` | `rashamon-plugin-runtime` |
| Asset graph | `@rashamon/asset-graph` | `rashamon-asset-graph` |
| Draw app | `@rashamon/draw` | — |

---

## Dependency Flow

```
crates/core          ← независимая библиотека
crates/draw-core     → crates/core
crates/plugin-runtime → crates/core
crates/asset-graph    → crates/core

packages/shared       ← независимая
packages/ui           → packages/shared
packages/tauri-bindings → crates/* (через tauri-spectator)
packages/plugin-api   → packages/shared

apps/draw             → packages/* + crates/*
```

---

## Build Commands

| Command | Описание |
|---|---|
| `pnpm dev` | Запуск Draw в dev mode |
| `pnpm build` | Production build всех приложений |
| `pnpm test` | Запуск тестов |
| `cargo test` | Rust тесты |
| `cargo clippy` | Rust lint |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Монорепозиторий | Один источник; легче координировать |
| pnpm | Быстрее, symlink-free, workspace protocols |
| Cargo workspace | Rust crates в одном репо |
| Разделение crates/ и packages/ | Чёткое разделение Rust/TS |
| apps/ содержат src-tauri/ | Каждое приложение — автономное |

---

## Links

- [[System Architecture]]
- [[Shared Platform]]
- [[ADR-001 Core Stack]]

---

## Next Actions

1. Создать scaffold монорепозитория (Phase 1)
2. Настроить pnpm workspace
3. Настроить cargo workspace
4. Добавить базовый CI
