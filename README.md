# Rashamon

Rashamon is a Linux-first open-source creative software project building a new generation of desktop tools for visual work.

It does not exist to become a shallow clone of Adobe products.

It exists to create a serious, extensible, high-performance creative suite for Linux with workflows that are not common even in proprietary competitors: semantic canvas models, non-destructive pipelines, graph-based history, automation hooks, plugin-first extensibility, and keyboard-driven professional UX.

---

## Why Rashamon exists

Creative software on Linux is often forced into one of two weak positions:

1. Limited community tools without a strong product system
2. Clone attempts that imitate proprietary software without creating a better workflow model

Rashamon takes a different path.

The goal is to build open-source creative applications that are useful on their own merits:
- fast
- modular
- professional
- scriptable
- community-extensible
- designed for long-term ecosystem growth

---

## Product strategy

Rashamon is an ecosystem, not a single oversized application.

### Initial product direction

| Product | Description | Status |
|---------|-------------|--------|
| **Rashamon Draw** | Vector / UI / layout editor | 🚧 In development (MVP) |
| **Rashamon Photo** | Non-destructive photo workflow | 📋 Planned |
| **Rashamon Motion** | Motion and timeline composition | 📋 Future |

The project starts with **Rashamon Draw** because it provides the best foundation for:
- scene graph architecture
- layer systems
- reusable assets
- layout tools
- export pipelines
- future cross-app platform primitives

---

## Core principles

- **Linux-first** — built for Linux from the ground up
- **Open-source by default** — code is open
- **Native-feeling desktop performance** — fast and responsive
- **Non-destructive workflows** — maximum reversibility
- **Extensible plugin runtime** — community can extend
- **Keyboard-first UX** — designed for professionals
- **Serious information architecture** — no clutter
- **Modular internal systems** — clean boundaries
- **Long-term ecosystem thinking** — not a one-off product

---

## Differentiators

Rashamon is designed around features that go beyond classic editor patterns:

| Differentiator | Description |
|----------------|-------------|
| **Semantic Canvas** | Canvas with semantic grouping, not just a flat infinite board |
| **Graph-based History** | Branching snapshots, not linear undo |
| **Universal Node Actions** | Automation hooks for any object |
| **Shared Asset Graph** | Common libraries across future apps |
| **Plugin-first Architecture** | Extensibility from early stages |
| **AI Assistance** | Only where it creates real leverage |

---

## Architecture direction

Current baseline stack:

| Layer | Technology |
|-------|------------|
| Desktop | **Tauri 2** |
| Frontend | **React** + **TypeScript** + Vite |
| Core | **Rust** |
| Rendering | **SVG/Canvas hybrid** (early phases) |
| Storage | **SQLite** + structured project manifests |
| Monorepo | pnpm + cargo workspaces |

---

## Project status

Rashamon is currently in **early architecture / pre-MVP** stage.

**Current focus:**
- ✅ Project structure
- ✅ Architectural decisions
- ✅ Product boundaries
- ✅ Documentation
- ✅ Contribution model
- 🚧 MVP foundation for Rashamon Draw

---

## Roadmap snapshot

### Phase 0 — Foundation
Documentation, governance, architecture, repository structure

### Phase 1 — Rashamon Draw MVP
- Artboards
- Vector primitives
- Text
- Layers
- Selection / transforms
- Save/load
- SVG/PNG export

### Phase 2 — Usability Layer
- Snapping
- Guides
- Undo/redo
- Keyboard system
- Command palette
- Style inspector

### Phase 3 — Differentiators v1
- Semantic canvas
- Graph history
- Reusable symbols
- Non-destructive style stacks

### Phase 4+ — Ecosystem
- Plugin system
- Shared asset graph
- Rashamon Photo architecture
- Community scale

---

## Open-source and forks

Rashamon is intended to be forkable and open to contributors.

At the same time, the project maintains a distinction between:
- **The open-source codebase** — forkable under MIT/Apache license
- **The official Rashamon identity** — release line, branding, governance

A separate [brand/trademark policy](./docs/vault/02_STRATEGY/Brand%20and%20Trademark%20Policy.md) defines how the Rashamon name, logos, and official distributions may be used.

---

## Contributing

We want contributors who care about:
- Architecture clarity
- Performance
- Maintainability
- UX rigor
- Serious open-source collaboration

### Getting started

1. Read the [Project Vision](./docs/vault/01_VISION/Project%20Vision.md)
2. Check the [Roadmap](./docs/vault/02_STRATEGY/Product%20Roadmap.md)
3. Look at [good first issues](https://github.com/kamelot-exe/Rashamon/issues)
4. Read the [Contribution Guide](./docs/vault/07_COMMUNITY/Contribution%20Model.md)

---

## Documentation

Full documentation is in [`docs/vault/`](./docs/vault/):

| Section | Description |
|---------|-------------|
| [Vision](./docs/vault/01_VISION/) | Project vision and philosophy |
| [Strategy](./docs/vault/02_STRATEGY/) | Roadmap, MVP, policies |
| [Products](./docs/vault/03_PRODUCTS/) | Product specifications |
| [Architecture](./docs/vault/04_ARCHITECTURE/) | Technical decisions |
| [Execution](./docs/vault/05_EXECUTION/) | Planning and delivery |
| [Community](./docs/vault/07_COMMUNITY/) | Contribution and governance |
| [Brand](./docs/vault/08_BRAND/) | Brand guidelines |

---

## Philosophy

> Rashamon is not "Adobe for free".
>
> Rashamon is a serious attempt to build a better open creative workflow for Linux.

---

**Rashamon** — built for Linux, by the community

© 2026 Rashamon Project
