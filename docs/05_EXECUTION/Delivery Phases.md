---
title: Delivery Phases
section: 05_EXECUTION
updated: 2026-04-11
status: draft
---

# Delivery Phases

Детализация фаз доставки Rashamon.

---

## Phase 0: Foundation (текущая)

**Duration**: Апрель 2026

| Workstream | Tasks |
|---|---|
| Documentation | Vision, Philosophy, Strategy, Architecture docs |
| Knowledge Base | Obsidian vault structure |
| ADRs | Core Stack, MVP Order, Format Principles |
| Agent Setup | Multi-agent roles and protocols |

**Exit Criteria**: Все документы Phase 0 согласованы

---

## Phase 1: Monorepo + App Shell

**Duration**: Май 2026

| Workstream | Tasks |
|---|---|
| Repo Setup | pnpm workspace, cargo workspace |
| Tauri | App shell, tauri.conf.json, build setup |
| React | React entry point, basic routing |
| CI/CD | GitHub Actions: lint, test, build |
| DevEx | `pnpm dev`, hot reload, debug setup |

**Exit Criteria**:
- `pnpm dev` запускает окно Rashamon Draw на Linux
- CI проходит на каждый push

---

## Phase 2: Document Model + Scene Graph

**Duration**: Июнь 2026

| Workstream | Tasks |
|---|---|
| Rust Core | Document, SceneNode, Transform structs |
| Serialization | serde JSON for .rdraw |
| Tauri Commands | createDoc, addObject, save, load |
| Frontend | Canvas viewport, basic shape rendering |
| File Ops | Save dialog, Open dialog |

**Exit Criteria**:
- Можно создать документ
- Добавить прямоугольник/эллипс
- Сохранить в .rdraw
- Открыть обратно

---

## Phase 3: Basic Editor MVP

**Duration**: Июль-Август 2026

| Workstream | Tasks |
|---|---|
| Tools | Select, Move, Rect, Ellipse, Line, Text, Pen |
| Properties | Fill, Stroke, Opacity, Transform |
| Panels | Layers, Properties, Toolbar |
| Editing | Undo/redo, Delete, Group, Reorder |
| Canvas | Pan, Zoom, SVG/Canvas hybrid rendering |

**Exit Criteria**:
- Можно создать простой дизайн
- Сохранить, открыть, продолжить
- Все базовые инструменты работают

---

## Phase 4: Usability Layer

**Duration**: Сентябрь-Октябрь 2026

| Workstream | Tasks |
|---|---|
| UX | Command palette, Full keyboard shortcuts |
| Precision | Snap to grid, Guides, Grid toggle |
| Organization | Group/ungroup, Layer naming, Search |
| Export | PNG, SVG export with options |
| Polish | Error handling, Notifications, Status bar |

**Exit Criteria**:
- Пользователь может работать без фрустрации
- Export работает
- Командная палитра на всё

---

## Phase 5: Differentiators v1

**Duration**: Ноябрь 2026 - Январь 2027

| Workstream | Tasks |
|---|---|
| History | Branching snapshots, Compare view |
| Semantic | Object types, tags, semantic queries |
| Non-destructive | Parameterized transforms |
| UX | Branch management UI |

**Exit Criteria**:
- Можно создать ветку истории
- Можно добавить семантический тег
- Можно изменить трансформацию постфактум

---

## Phase 6: Plugin Foundation

**Duration**: Февраль-Март 2027

| Workstream | Tasks |
|---|---|
| Runtime | Plugin loader, Permission system |
| API | Document API, Selection API, UI API |
| Manager | Plugin manager UI, Install/uninstall |
| Examples | 2-3 built-in example plugins |
| Docs | Plugin developer guide |

**Exit Criteria**:
- Можно установить плагин
- Плагин может работать с документом
- Документация для разработчиков плагинов

---

## Phase 7: Community / Release Ops

**Duration**: Апрель-Май 2027

| Workstream | Tasks |
|---|---|
| Release | v0.1 stable release |
| Packages | AppImage, Flatpak, .deb, .rpm |
| Docs | CONTRIBUTING, Code of Conduct, RFC process |
| Community | Website, announcement, channels |
| Governance | Brand policy, Fork policy |

**Exit Criteria**:
- Публичный релиз v0.1
- Контрибьюторы могут участвовать
- Официальные каналы работают

---

## Dependencies Between Phases

```
Phase 0 ──→ Phase 1 ──→ Phase 2 ──→ Phase 3
                                        │
                                        ▼
Phase 7 ←── Phase 6 ←── Phase 5 ←── Phase 4
```

- Phase 4 зависит от Phase 3 (нечего улучшать без MVP)
- Phase 5 зависит от Phase 4 (differentiators на стабильном продукте)
- Phase 6 зависит от Phase 5 (plugins на стабильном API)
- Phase 7 зависит от всех предыдущих

---

## Links

- [[Product Roadmap]]
- [[Milestones]]
- [[Risks]]

---

## Next Actions

1. Завершить Phase 0
2. Начать Phase 1 scaffold
3. Настроить CI/CD
