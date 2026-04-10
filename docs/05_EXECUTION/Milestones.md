---
title: Milestones
section: 05_EXECUTION
updated: 2026-04-11
status: draft
---

# Milestones

Ключевые вехи проекта Rashamon.

---

## Milestone Map

```
M0: Foundation      ← ТЕКУЩАЯ
M1: Skeleton
M2: Data
M3: Editor
M4: Polish
M5: Unique
M6: Extend
M7: Launch
```

---

## M0: Foundation (текущая)

| | |
|---|---|
| **Цель** | Стратегическая и архитектурная основа |
| **Deliverables** | [[Project Vision]], [[Product Philosophy]], [[MVP Scope]], [[System Architecture]], Obsidian vault |
| **Критерий** | Все ключевые документы согласованы |
| **Статус** | 🟡 В процессе |

---

## M1: Skeleton (Phase 1)

| | |
|---|---|
| **Цель** | Рабочий monorepo + пустое приложение |
| **Deliverables** | pnpm workspace, cargo workspace, Tauri app shell, CI pipeline, hello-world window |
| **Критерий** | `pnpm dev` запускает окно Rashamon Draw |
| **Статус** | 🔒 Не начата |

---

## M2: Data (Phase 2)

| | |
|---|---|
| **Цель** | Модель данных + scene graph |
| **Deliverables** | Document model (Rust), Scene graph, .rdraw format, Save/load, Basic object creation |
| **Критерий** | Можно создать документ, добавить объекты, сохранить, загрузить |
| **Статус** | 🔒 Не начата |

---

## M3: Editor (Phase 3)

| | |
|---|---|
| **Цель** | Базовый рабочий редактор |
| **Deliverables** | Canvas rendering, Basic tools (select, rect, ellipse, line, text), Transform, Layers panel, Properties panel, Undo/redo |
| **Критерий** | Можно создать простой дизайн, сохранить, открыть, редактировать |
| **Статус** | 🔒 Не начата |

---

## M4: Polish (Phase 4)

| | |
|---|---|
| **Цель** | Удобство для реальной работы |
| **Deliverables** | Full toolbar, Snap/guides/grid, Group/ungroup, Command palette, Keyboard shortcuts, Export (PNG, SVG) |
| **Критерий** | Пользователь может создать реальный дизайн без фрустрации |
| **Статус** | 🔒 Не начата |

---

## M5: Unique (Phase 5)

| | |
|---|---|
| **Цель** | Уникальные фичи Rashamon |
| **Deliverables** | Branching history, Semantic canvas v2, Non-destructive transforms, Compare branches |
| **Критерий** | Пользователь может создавать ветки и использовать семантику |
| **Статус** | 🔒 Не начата |

---

## M6: Extend (Phase 6)

| | |
|---|---|
| **Цель** | Система плагинов |
| **Deliverables** | Plugin runtime, Plugin API, Plugin manager UI, 2-3 example plugins |
| **Критерий** | Можно установить и запустить сторонний плагин |
| **Статус** | 🔒 Не начата |

---

## M7: Launch (Phase 7)

| | |
|---|---|
| **Цель** | Публичный релиз v0.1 |
| **Deliverables** | v0.1 release, CONTRIBUTING guide, RFC process, Brand policy, CI/CD releases, Website |
| **Критерий** | Публичный релиз доступна; документация для контрибьюторов |
| **Статус** | 🔒 Не начата |

---

## Progress Tracking

| Milestone | Phase | Target | Actual | Status |
|---|---|---|---|---|
| M0: Foundation | Phase 0 | Q2 2026 | — | 🟡 |
| M1: Skeleton | Phase 1 | Q2 2026 | — | 🔒 |
| M2: Data | Phase 2 | Q3 2026 | — | 🔒 |
| M3: Editor | Phase 3 | Q3-Q4 2026 | — | 🔒 |
| M4: Polish | Phase 4 | Q4 2026 | — | 🔒 |
| M5: Unique | Phase 5 | Q1 2027 | — | 🔒 |
| M6: Extend | Phase 6 | Q1-Q2 2027 | — | 🔒 |
| M7: Launch | Phase 7 | Q2 2027 | — | 🔒 |

---

## Links

- [[Delivery Phases]]
- [[Product Roadmap]]
- [[Backlog Structure]]
- [[Risks]]

---

## Next Actions

1. Завершить M0 (этот документ)
2. Начать M1: monorepo scaffold
3. Создать детализированный backlog для M1
