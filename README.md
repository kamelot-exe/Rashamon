# Rashamon

> Professional creative software ecosystem. Open source by default. Linux-first.

---

## What Is Rashamon

Rashamon is an **ecosystem of professional creative tools** built on a shared open-source platform. It is not a shallow Adobe clone — it is a family of serious applications with unique workflows, non-destructive philosophy, and deep architecture.

### Products

| Product | Type | Status |
|---|---|---|
| **Rashamon Draw** | Vector/UI/layout editor | 🟡 In development — app shell ready |
| **Rashamon Photo** | Raster/photo editor | 🔒 Planned |
| **Rashamon Motion** | Motion graphics/animation | 🔒 Planned |

All products share a common platform: document format, asset graph, plugin system, and design language.

---

## Why Rashamon Exists

Creative professionals on Linux have **no native professional tools**. The existing open-source options (Inkscape, Krita, GIMP) are excellent projects but carry 10+ years of architectural debt and follow the "clone Adobe" paradigm.

Rashamon takes a different approach:

- **Semantic canvas** — objects carry meaning, not just pixels
- **Branching history** — experiment without fear via graph-based snapshots
- **Non-destructive by default** — every operation is parameterized
- **Automation hooks** — macros, CLI, pipeline mode
- **Plugin runtime** — first-class plugin system with real API
- **Linux-native thinking** — not a port, but designed for Linux

---

## Philosophy

- **Serious tools, not toys** — built for professionals and advanced enthusiasts
- **Non-destructive philosophy** — every action is reversible and parameterized
- **Semantic over pixel** — structured data instead of flat canvases
- **Modular at every level** — app = core + modules
- **Offline-first** — works without internet, accounts, or clouds
- **Open and forkable** — code is open; brand is governed separately
- **Keyboard-first UX** — everything accessible via keyboard
- **AI only where it helps** — assistance, not replacement

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| App shell | Tauri 2 |
| Frontend | React 19 + TypeScript |
| Backend | Rust |
| Build | pnpm workspace + cargo workspace |
| Bundler | Vite 6 |
| Rendering | SVG/Canvas hybrid (planned) |
| Storage | JSON-based project files, SQLite where useful |

### Structure

```
rashamon/
├── apps/draw-desktop/          # Rashamon Draw (Tauri 2 + React)
│   ├── src/                    # React frontend (app shell UI)
│   └── src-tauri/              # Rust backend (Tauri commands)
├── packages/
│   ├── types/                  # @rashamon/types — shared TS types
│   ├── core/                   # @rashamon/core — document factory
│   └── ui/                     # @rashamon/ui — shell components
├── crates/
│   ├── rashamon_core/          # Rust data model
│   └── rashamon_file_format/   # .rdraw serialization
└── docs/                       # Obsidian knowledge base
```

Full architecture: [Workspace Structure](docs/04_ARCHITECTURE/Workspace%20Structure.md)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 (`corepack enable` or `npm i -g pnpm`)
- **Rust** ≥ 1.80 (`rustup install stable`)
- **Linux build deps**: `webkit2gtk-4.1`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

### Quick Start

```bash
# Clone
git clone https://github.com/kamelot-exe/Rashamon.git
cd Rashamon

# Install dependencies
pnpm install

# Run Rashamon Draw in dev mode
pnpm dev:draw
```

### Root Commands

| Command | Description |
|---|---|
| `pnpm dev:draw` | Start Draw in dev mode (Vite HMR) |
| `pnpm build:draw` | Production build |
| `pnpm check` | Format check + lint + typecheck |
| `pnpm format` | Auto-format all TS/CSS files |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type check |

### Rust Commands

```bash
# From the project root:
cargo check --workspace        # Check all crates
cargo clippy --workspace       # Lint all crates
cargo test --workspace         # Test all crates

# Tauri commands (from apps/draw-desktop/src-tauri/):
cargo tauri dev                # Run with Tauri CLI
cargo tauri build              # Build release binary
```

---

## Roadmap Snapshot

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Foundation / docs / strategy | ✅ Complete |
| Phase 1 | Monorepo + app shell | 🟡 In progress — shell boots |
| Phase 2 | Document model + scene graph | 🔒 |
| Phase 3 | Basic editor MVP | 🔒 |
| Phase 4 | Usability layer | 🔒 |
| Phase 5 | Differentiators v1 | 🔒 |
| Phase 6 | Plugin foundation | 🔒 |
| Phase 7 | Community / governance / release | 🔒 |

Full roadmap: [Product Roadmap](docs/02_STRATEGY/Product%20Roadmap.md)

---

## Why Not Just Clone Adobe?

Cloning is a **catch-up strategy**. A clone:

- Is always one step behind the original
- Offers no reason to migrate beyond "free"
- Copies UX mistakes along with features
- Doesn't build a community — builds a user base

Rashamon differentiates through **unique workflows** that existing tools simply cannot replicate without breaking their own compatibility.

---

## Contributing

Contributions are welcome. See the [CONTRIBUTING](docs/09_GITHUB/CONTRIBUTING.md) guide and [Code of Conduct](docs/09_GITHUB/CODE_OF_CONDUCT.md).

---

## Brand & Trademark

> ⚠️ The Rashamon code is open source and can be forked under the terms of its license. However, the **name "Rashamon"**, official logos, and official builds are governed separately. This is the same model as Mozilla Firefox, Blender, and Canonical Ubuntu.

Full policy: [Brand and Trademark Policy](docs/02_STRATEGY/Brand%20and%20Trademark%20Policy.md)

---

## License

**TBD** — under consideration: MIT / Apache-2.0 / GPL-3.0. Decision will be made before first public release.

---

## Documentation

The full strategic and architectural documentation lives in the `docs/` folder as an **Obsidian vault**. Start with:

- [Index](docs/00_INDEX.md) — knowledge base index
- [Project Vision](docs/01_VISION/Project%20Vision.md) — why Rashamon exists
- [Product Philosophy](docs/01_VISION/Product%20Philosophy.md) — decision-making filters
- [MVP Scope](docs/02_STRATEGY/MVP%20Scope.md) — what the first product includes
- [System Architecture](docs/04_ARCHITECTURE/System%20Architecture.md) — technical overview
- [Open Questions](docs/10_APPENDICES/Open%20Questions.md) — unresolved decisions

---

## Status

**Phase 3B complete.** The editor now has creative graph foundations with visible UI:

### Core Features
- ✅ SVG canvas renders rectangles, ellipses, lines, text
- ✅ Select tool: click to select, drag to move
- ✅ Rectangle/Ellipse/Line tools: click-drag to create
- ✅ Text tool: click to create, double-click to edit inline (no browser prompt)
- ✅ Properties panel: edit x, y, width, height, rotation, fill, stroke, semantic role
- ✅ Fill/stroke editing with color picker and stroke width control
- ✅ Layers panel: reflects document nodes, select/delete
- ✅ Save/Open .rdraw files (with fallback download)
- ✅ Export SVG (clean markup from document)
- ✅ Export PNG (canvas rasterization)

### History & Branching
- ✅ Branching history foundation (DAG-based, not linear)
- ✅ History panel showing depth, node count, branch count
- ✅ Branch indicator (main vs forked)
- ✅ Navigate backward/forward via panel buttons or keyboard
- ⚠️ Visual graph history UI — groundwork only, not full visualization
- ⚠️ History is in-memory only; not persisted in save/load (by design)

### Group Scope Editing
- ✅ Double-click group to enter focused editing
- ✅ Scope bar shows current path (Root → Group Name)
- ✅ Exit button to return to parent scope
- ✅ Escape key exits group
- ✅ Canvas editing acts within scope
- ✅ Layers panel reflects scope

### Semantic Roles
- ✅ Semantic role editor in PropertiesPanel
- ✅ Supported roles: background, foreground, annotation, guide, ui-element, custom
- ✅ Roles persist in save/load (part of SceneNode serialization)
- ✅ Role badge display in inspector

### Zoom & Pan
- ✅ Mouse wheel zoom (centered on cursor)
- ✅ Space+drag or middle mouse drag for pan
- ✅ Ctrl+/Ctrl+ for zoom, Ctrl+0 for reset
- ✅ Selection overlay and handles stay correct under zoom

### Grid & Snap
- ✅ Visible grid with toggle (G key)
- ✅ Snap-to-grid for shape creation and movement (S key)
- ✅ Shift key also enables snap during resize

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `V` | Select tool |
| `R` | Rectangle tool |
| `E` | Ellipse tool |
| `L` | Line tool |
| `T` | Text tool |
| `G` | Toggle grid visibility |
| `S` | Toggle snap-to-grid |
| `Space+drag` | Pan canvas |
| `Middle mouse drag` | Pan canvas |
| `Mouse wheel` | Zoom (centered on cursor) |
| `Ctrl++` / `Ctrl+-` | Zoom in/out |
| `Ctrl+0` | Reset view |
| `Delete` / `Backspace` | Delete selected |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+G` | Group selected |
| `Ctrl+Shift+G` | Ungroup selected |
| `Escape` | Exit group scope / Close text editor |
| `Double-click text` | Edit inline |
| `Double-click group` | Enter group focused editing |

**Not yet implemented:** pen/path editing, boolean operations, gradient fills, plugin system, visual history graph UI, branch merging, history persistence in save/load, semantic canvas querying.

Next: Phase 4 — differentiators v2 (semantic canvas, plugin foundation, visual history graph).

---

*«In truth, there is no single truth.»* — Rashōmon
