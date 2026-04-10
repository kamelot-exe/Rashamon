---
title: Product Roadmap
section: 02_STRATEGY
updated: 2026-04-11
status: draft
---

# Product Roadmap

Дорожная карта Rashamon разбита на фазы. Каждая фаза имеет конкретные deliverables, risks и exit criteria.

---

## Roadmap Overview

```
Phase 0: Foundation / docs / strategy     ← ТЕКУЩАЯ ФАЗА
Phase 1: Monorepo + app shell
Phase 2: Document model + scene graph
Phase 3: Basic editor MVP
Phase 4: Usability layer
Phase 5: Differentiators v1
Phase 6: Plugin foundation
Phase 7: Community / governance / release ops
```

---

## Phase 0: Foundation / docs / strategy

| | |
|---|---|
| **Goal** | Создать стратегическую и архитектурную основу проекта |
| **Deliverables** | [[Project Vision]], [[Product Philosophy]], [[MVP Scope]], [[System Architecture]], этот документ, Obsidian vault |
| **Risks** | Over-documentation без валидации; анализ без действия |
| **Dependencies** | Нет |
| **Exit Criteria** | Все ключевые документы согласованы; Architecture Decision Records приняты; можно начинать Phase 1 |

**Статус**: ✅ В процессе

---

## Phase 1: Monorepo + app shell

| | |
|---|---|
| **Goal** | Создать рабочую структуру монорепозитория и пустое приложение |
| **Deliverables** | pnpm workspace, cargo workspace, Tauri 2 app shell, базовый CI, hello-world окно Rashamon Draw |
| **Risks** | Tauri 2 стабильность на Linux; настройка toolchain |
| **Dependencies** | Phase 0 complete |
| **Exit Criteria** | `pnpm dev` запускает пустое окно Rashamon Draw; CI проходит |

**Статус**: 🔒 Не начата

---

## Phase 2: Document model + scene graph

| | |
|---|---|
| **Goal** | Реализовать модель данных проекта и граф сцены |
| **Deliverables** | Document model (Rust), Scene graph (Rust + TS binding), Project file format (.rdraw), Save/load, Semantic object model |
| **Risks** | Неправильный выбор модели данных; сложно менять позже |
| **Dependencies** | Phase 1 complete |
| **Exit Criteria** | Можно создать документ, добавить объекты, сохранить, загрузить |

**Статус**: 🔒 Не начата

---

## Phase 3: Basic editor MVP

| | |
|---|---|
| **Goal** | Минимальный рабочий редактор |
| **Deliverables** | Canvas rendering (SVG/Canvas hybrid), Basic tools: select, rectangle, ellipse, line, text, Transform: move, scale, rotate, Layers panel, Properties panel, Undo/redo (linear) |
| **Risks** | Rendering performance; сложность hybrid approach |
| **Dependencies** | Phase 2 complete |
| **Exit Criteria** | Можно создать простой дизайн, сохранить, открыть, редактировать |

**Статус**: 🔒 Не начата

---

## Phase 4: Usability layer

| | |
|---|---|
| **Goal** | Сделать редактор удобным для реальной работы |
| **Deliverables** | Полноценная панель инструментов, Snap/guide/grid система, Group/ungroup, Layer ordering, Zoom/pan, Command palette (Ctrl+Shift+P), Keyboard shortcuts на всё, Export (PNG, SVG) |
| **Risks** | Scope creep; usability — бесконечная задача |
| **Dependencies** | Phase 3 complete |
| **Exit Criteria** | Пользователь может создать реальный дизайн без фрустрации |

**Статус**: 🔒 Не начата

---

## Phase 5: Differentiators v1

| | |
|---|---|
| **Goal** | Внедрить уникальные фичи Rashamon |
| **Deliverables** | Branching history (graph-based snapshots), Semantic canvas v1 (object types + tags), Non-destructive transforms, Compare branches view |
| **Risks** | Сложность графовой истории; производительность |
| **Dependencies** | Phase 4 complete |
| **Exit Criteria** | Пользователь может создавать ветки, сравнивать, использовать семантические теги |

**Статус**: 🔒 Не начата

---

## Phase 6: Plugin foundation

| | |
|---|---|
| **Goal** | Создать основу для системы плагинов |
| **Deliverables** | Plugin runtime (TS API), Plugin manifest format, Built-in plugin manager, 2-3 example plugins, Plugin documentation |
| **Risks** | API design — сложно балансировать power/safety |
| **Dependencies** | Phase 5 complete |
| **Exit Criteria** | Можно установить и запустить плагин; плагин имеет доступ к document model |

**Статус**: 🔒 Не начата

---

## Phase 7: Community / governance / release ops

| | |
|---|---|
| **Goal** | Подготовить проект к публичному релизу и сообществу |
| **Deliverables** | v0.1 release, [[CONTRIBUTING]] guide, [[RFC Process]] operational, [[Brand and Trademark Policy]] finalised, CI/CD for releases (AppImage, flatpak), Website/landing page, Community channels |
| **Risks** | Преждевременный релиз; недостаточная готовность контрибуции |
| **Dependencies** | Phase 5-6 complete |
| **Exit Criteria** | Публичный релиз v0.1; документация для контрибьюторов; рабочие каналы связи |

**Статус**: 🔒 Не начата

---

## Timeline (ориентировочная)

```
Phase 0: Q2 2026  (текущая)
Phase 1: Q2 2026
Phase 2: Q3 2026
Phase 3: Q3-Q4 2026
Phase 4: Q4 2026
Phase 5: Q1 2027
Phase 6: Q1-Q2 2027
Phase 7: Q2 2027
```

> ⚠️ Это ориентировочные сроки. Rashamon — open source проект; реальная скорость зависит от контрибьюторов.

---

## Beyond v0.1

| Продукт | Начало | Зависит от |
|---|---|---|
| Rashamon Photo alpha | После Draw v0.1 | Shared Platform成熟 |
| Rashamon Motion alpha | После Photo alpha | Shared Platform成熟 |
| Unified launcher | После 2+ продуктов | Каждый продукт стабилен |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| 8 фаз, а не big-bang релиз | Постепенная доставка снижает риск и даёт ранний feedback |
| Draw первый | Наименьший scope, максимальная архитектурная ценность |
| Plugin foundation после MVP | Плагины требуют стабильного API; сначала ядро |

---

## Links

- [[MVP Scope]]
- [[Delivery Phases]]
- [[Risks]]
- [[Non-Goals]]
- [[Release Strategy]]

---

## Next Actions

1. Завершить Phase 0 (этот документ)
2. Начать Phase 1: scaffold монорепозитория
3. Настроить CI/CD pipeline
