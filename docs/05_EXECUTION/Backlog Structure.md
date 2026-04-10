---
title: Backlog Structure
section: 05_EXECUTION
updated: 2026-04-11
status: draft
---

# Backlog Structure

Структура и организация бэклога Rashamon.

---

## Hierarchy

```
Epic
└── Feature
    └── User Story
        └── Task
```

---

## Epics

| Epic | Описание | Phase |
|---|---|---|
| E1: Platform Foundation | Monorepo, CI/CD, app shell | Phase 1 |
| E2: Document Core | Document model, scene graph, file format | Phase 2 |
| E3: Canvas Rendering | SVG/Canvas hybrid, pan/zoom | Phase 2-3 |
| E4: Basic Tools | Select, shapes, text, pen | Phase 3 |
| E5: UI Panels | Layers, Properties, Toolbar | Phase 3-4 |
| E6: Editing Operations | Undo, delete, group, reorder | Phase 3-4 |
| E7: Export | PNG, SVG export | Phase 4 |
| E8: Usability | Snap, guides, grid, keyboard, cmd palette | Phase 4 |
| E9: Branching History | Graph-based history | Phase 5 |
| E10: Semantic Canvas | Object types, tags, roles, queries | Phase 5 |
| E11: Non-destructive | Parameterized transforms | Phase 5 |
| E12: Plugin System | Runtime, API, manager | Phase 6 |
| E13: Release Ops | CI/CD releases, docs, community | Phase 7 |

---

## User Story Template

```markdown
## [ID] Title

**Epic:** E#: Name
**Priority:** P0/P1/P2
**Phase:** Phase N

### As a
[type of user]

### I want to
[action]

### So that
[benefit]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Notes
- Notes here

### Links
- Related docs
```

---

## Priority Levels

| Priority | Описание | Пример |
|---|---|---|
| P0 | Blocking; must have for phase | Document model, scene graph |
| P1 | Important; should have | Grid, guides, export |
| P2 | Nice to have; if time | Gradient fills, boolean ops |

---

## Story Status

| Status | Описание |
|---|---|
| `Backlog` | В бэклоге, не приоритизировано |
| `Prioritized` | Приоритизировано, не начато |
| `In Progress` | В работе |
| `In Review` | На ревью |
| `Done` | Готово, соответствует [[Definition of Done]] |
| `Blocked` | Заблокировано |
| `Deferred` | Отложено |

---

## Sample Backlog (Phase 1)

| ID | Story | Epic | Priority |
|---|---|---|---|
| US-001 | Создать pnpm workspace | E1 | P0 |
| US-002 | Создать cargo workspace | E1 | P0 |
| US-003 | Настроить Tauri app shell для Draw | E1 | P0 |
| US-004 | Создать React entry point | E1 | P0 |
| US-005 | Настроить GitHub Actions CI | E1 | P0 |
| US-006 | Hello-world window на Linux | E1 | P0 |

---

## Sample Backlog (Phase 2)

| ID | Story | Epic | Priority |
|---|---|---|---|
| US-010 | Реализовать Document struct (Rust) | E2 | P0 |
| US-011 | Реализовать SceneNode enum (Rust) | E2 | P0 |
| US-012 | Serde serialization для документа | E2 | P0 |
| US-013 | .rdraw file format | E2 | P0 |
| US-014 | Tauri commands для document ops | E2 | P0 |
| US-015 | Canvas viewport component (React) | E3 | P0 |
| US-016 | SVG rendering для shapes | E3 | P0 |
| US-017 | Pan & zoom | E3 | P0 |

---

## Links

- [[Definition of Done]]
- [[Delivery Phases]]
- [[Milestones]]

---

## Next Actions

1. Создать GitHub Projects с этой структурой
2. Populate backlog для Phase 1
3. Создать issue templates
