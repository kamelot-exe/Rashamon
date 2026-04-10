# Rashamon

> Professional creative software ecosystem. Open source by default. Linux-first.

---

## What Is Rashamon

Rashamon is an **ecosystem of professional creative tools** built on a shared open-source platform. It is not a shallow Adobe clone — it is a family of serious applications with unique workflows, non-destructive philosophy, and deep architecture.

### Products

| Product | Type | Status |
|---|---|---|
| **Rashamon Draw** | Vector/UI/layout editor | 🟡 In development (MVP) |
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

See [[Product Philosophy]] for the full document.

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| App shell | Tauri 2 |
| Frontend | React + TypeScript |
| Backend | Rust |
| Build | pnpm workspace + cargo workspace |
| Rendering | SVG/Canvas hybrid |
| Storage | JSON-based project files, SQLite where useful |

### Structure

```
rashamon/
├── crates/          # Rust libraries (core, plugins, assets)
├── packages/        # TypeScript packages (UI, bindings)
├── apps/
│   ├── draw/        # Rashamon Draw
│   ├── photo/       # Rashamon Photo (later)
│   └── motion/      # Rashamon Motion (later)
└── docs/            # Obsidian knowledge base (strategy, architecture)
```

Full architecture: [[System Architecture]]

---

## Roadmap Snapshot

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Foundation / docs / strategy | 🟡 Current |
| Phase 1 | Monorepo + app shell | 🔒 |
| Phase 2 | Document model + scene graph | 🔒 |
| Phase 3 | Basic editor MVP | 🔒 |
| Phase 4 | Usability layer | 🔒 |
| Phase 5 | Differentiators v1 | 🔒 |
| Phase 6 | Plugin foundation | 🔒 |
| Phase 7 | Community / governance / release | 🔒 |

Full roadmap: [[Product Roadmap]]

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

Contributions are welcome. Read [[CONTRIBUTING]] and the [[Code of Conduct]] before starting.

**Quick start:**

```bash
git clone https://github.com/kamelot-exe/Rashamon.git
cd Rashamon
# Setup instructions in CONTRIBUTING.md
```

Look for [good-first-issue](https://github.com/kamelot-exe/Rashamon/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue) tags to get started.

---

## Brand & Trademark

> ⚠️ **Important**: The Rashamon code is open source and can be forked under the terms of its license. However, the **name "Rashamon"**, official logos, and official builds are governed separately.

This follows the same model as Mozilla Firefox, Blender, and Canonical Ubuntu: **open code, managed brand**.

Full policy: [[Brand and Trademark Policy]]

---

## License

License: **TBD** (under consideration: MIT / Apache-2.0 / GPL-3.0)

The license decision will be made and documented before the first public release. See [[Open Questions]] → SQ-01 for the current discussion.

---

## Documentation

The full strategic and architectural documentation lives in the `docs/` folder as an **Obsidian vault**. Start with:

- [[00_INDEX]] — knowledge base index
- [[Project Vision]] — why Rashamon exists
- [[Product Philosophy]] — our decision-making filters
- [[MVP Scope]] — what the first product includes
- [[System Architecture]] — technical overview
- [[Open Questions]] — unresolved decisions

---

## Status

**Early stage.** This project is in the foundation phase. No working product yet — strategy and architecture first, code second.

Follow this repository for updates.

---

*«In truth, there is no single truth.»* — Rashōmon
