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

**Early stage — Phase 2A complete.** The monorepo is bootstrapped, the app shell boots, and the first interactive editor foundation works:

- ✅ SVG canvas renders rectangles, ellipses, lines
- ✅ Select tool: click to select, drag to move
- ✅ Rectangle/Ellipse/Line tools: click-drag to create
- ✅ Properties panel: edit x, y, width, height, rotation
- ✅ Layers panel: reflects document nodes, select/delete
- ✅ Save/Open .rdraw files (with fallback download)
- ✅ Linear undo/redo (Ctrl+Z / Ctrl+Shift+Z)
- ✅ Keyboard shortcuts: V (select), R (rect), E (ellipse), L (line), Delete

**Not yet implemented:** text rendering, pen tool, grid snap, boolean operations, gradient fills, plugin system, branching history.

Next: Phase 2B — more tools, grid/snap, better selection handles.

---

*«In truth, there is no single truth.»* — Rashōmon
