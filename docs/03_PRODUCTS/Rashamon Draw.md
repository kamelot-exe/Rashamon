---
title: Rashamon Draw
section: 03_PRODUCTS
updated: 2026-04-11
status: draft
---

# Rashamon Draw

> Профессиональный векторный редактор с семантическим канвасом и графовой историей.

---

## Overview

Rashamon Draw — **первый продукт** экосистемы Rashamon и основной кандидат для MVP.

| | |
|---|---|
| **Тип** | Векторный редактор / UI/UX дизайн / лэйауты |
| **Целевая аудитория** | Дизайнеры, разработчики, фрилансеры на Linux |
| **Модель** | Open source, бесплатно |
| **Платформа** | Linux (Wayland/X11), позже macOS/Windows |
| **Технологии** | Tauri 2 + React + TypeScript + Rust |

---

## Use Cases

### Основные

| Сценарий | Описание |
|---|---|
| UI/UX дизайн | Мокапы, прототипы, дизайн-системы |
| Векторная графика | Иллюстрации, иконки, логотипы |
| Лэйауты | Постеры, визитки, социальные медиа |
| Схемы и диаграммы | Flowcharts, architectural diagrams |
| Технические иллюстрации | Документация, мануалы |

### Продвинутые

| Сценарий | Описание |
|---|---|
| Дизайн-системы | Компоненты, символы, стили |
| Ассеты для разработки | Экспорт для web/mobile app |
| Анимация (базовая) | Простые transitions (Motion позже) |

---

## Key Features

### MVP (Phase 3-4)

- [x] Базовые фигуры: rectangle, ellipse, line, polygon
- [x] Text tool
- [x] Pen tool (bezier curves)
- [x] Select, move, scale, rotate
- [x] Layers panel
- [x] Properties panel
- [x] Fill/stroke/opacity
- [x] Group/ungroup
- [x] Snap/guides/grid
- [x] Undo/redo (linear)
- [x] Save/load .rdraw
- [x] Export PNG/SVG
- [x] Command palette
- [x] Keyboard shortcuts

### Post-MVP (Phase 5+)

- [ ] Branching history
- [ ] Semantic canvas v2 (custom object types)
- [ ] Non-destructive effects
- [ ] Boolean operations
- [ ] Gradient fills
- [ ] Symbols/components
- [ ] Masks/clipping
- [ ] Plugin API

---

## Differentiators в Draw

| Фича | Как работает в Draw |
|---|---|
| Семантический канвас | Объекты несут тип, роль, теги — можно запросить «все кнопки» |
| Графовая история | Ветки для экспериментов; compare/merge альтернатив |
| Non-destructive | Трансформации параметрические; можно изменить постфактум |
| Автоматизация | Macros для batch-операций; CLI для scripting |
| CLI | `rashamon draw --export file.rdraw --format png --scale 2` |

---

## Technical Notes

| Component | Implementation |
|---|---|
| Rendering | SVG для UI-элементов + Canvas для сложных сцен |
| Document model | Rust structs с TS binding |
| State management | Rust backend + React frontend |
| File format | JSON-based .rdraw |
| Undo/redo | Linear (MVP) → Graph (Phase 5) |

---

## Not in Scope

| Не входит | Почему |
|---|---|
| Photo editing | Rashamon Photo |
| 3D | За scope всей экосистемы |
| Animation (complex) | Rashamon Motion |
| Real-time collaboration | Не наш приоритет |
| Print layout | Другая ниша (InDesign) |

---

## Success Metrics

| Метрика | Target (MVP) |
|---|---|
| Startup time | < 3s |
| Objects on canvas | 100+ at 60fps |
| Crash rate | < 1% sessions |
| Time to first export | < 5 min (new user) |

---

## Links

- [[Product Roadmap]]
- [[MVP Scope]]
- [[Differentiators]]
- [[Shared Platform]]

---

## Next Actions

1. Детализировать backlog для Draw MVP
2. Определить точный список tools для MVP
3. Спроектировать document model
