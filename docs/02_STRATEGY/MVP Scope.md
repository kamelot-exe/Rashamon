---
title: MVP Scope
section: 02_STRATEGY
updated: 2026-04-11
status: draft
---

# MVP Scope

Определение минимального жизнеспособного продукта для Rashamon Draw.

---

## Product

**Rashamon Draw v0.1** — минимальный векторный редактор с уникальной архитектурой.

---

## In Scope (MVP)

### Core
- [x] Tauri 2 app shell с окном
- [ ] Document model: один документ, один канвас
- [ ] Scene graph: иерархическая модель объектов
- [ ] Project file format: `.rdraw` (JSON-based)
- [ ] Save / Load

### Canvas & Rendering
- [ ] SVG/Canvas hybrid rendering
- [ ] Pan & zoom
- [ ] Anti-aliased rendering

### Tools
- [ ] Select / Move
- [ ] Rectangle
- [ ] Ellipse
- [ ] Line
- [ ] Text (basic)
- [ ] Pen tool (basic bezier)

### Properties
- [ ] Fill (solid color)
- [ ] Stroke (solid color, width)
- [ ] Opacity
- [ ] Transform: position, scale, rotation

### UI Panels
- [ ] Canvas area
- [ ] Layers panel (hierarchical)
- [ ] Properties panel (context-sensitive)
- [ ] Toolbar

### Editing
- [ ] Linear undo/redo
- [ ] Delete objects
- [ ] Group / Ungroup
- [ ] Layer ordering (reorder)
- [ ] Snap to grid (basic)
- [ ] Guides (manual)

### Export
- [ ] Export to PNG
- [ ] Export to SVG

### Keyboard
- [ ] Command palette (Ctrl+Shift+P)
- [ ] Core shortcuts: Ctrl+S, Ctrl+Z, Ctrl+Shift+Z, Del, Ctrl+G, Ctrl+Shift+G

---

## Out of Scope (MVP)

| Фича | Причина откладывания |
|---|---|
| Branching history | P5 differentiator; MVP — linear undo |
| Semantic canvas v2 | MVP — basic types only |
| Non-destructive effects | Сложность; после базового редактора |
| Plugin system | Требует стабильного API; Phase 6 |
| Real-time collaboration | Не наш приоритет |
| Cloud sync | Offline-first |
| AI features | После стабильного ядра |
| Symbols / Components | Phase 5+ |
| Boolean operations | Сложность; после basic tools |
| Gradient fills | После solid colors |
| Masks / Clipping | Сложность; Phase 5 |
| Multi-canvas documents | MVP — один канвас |

---

## MVP Success Criteria

1. **Functional**: Пользователь может создать простой дизайн, сохранить, открыть, отредактировать, экспортировать
2. **Performance**: 60fps на документе с 100 объектами
3. **Stability**: No crashes при типичных операциях
4. **UX**: Командная палитра работает; хоткеи на основные действия

---

## MVP Technical Constraints

| Constraint | Value |
|---|---|
| Target platform | Linux (Ubuntu 22.04+, Fedora 37+, Arch) |
| Minimum RAM | 4 GB |
| GPU | Integrated graphics OK |
| Storage | < 200 MB install |
| Startup time | < 3 seconds |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| SVG/Canvas hybrid | SVG для UI-элементов, Canvas для сложных сцен |
| JSON-based .rdraw | Читаемо, diff-able, легко парсить |
| Linear undo в MVP | Graph history — сложная фича; MVP — stability first |
| Без boolean ops в MVP | Сложная геометрия; можно позже |
| Без градиентов в MVP | Solid colors покрывают 80% случаев |

---

## Assumptions

- Tauri 2 будет достаточно стабилен для Linux
- SVG/Canvas hybrid не создаст критических багов рендеринга
- JSON-based формат будет достаточно производителен для MVP-размеров документов

---

## Links

- [[Product Roadmap]]
- [[Delivery Phases]]
- [[Project File Format]]
- [[Non-Goals]]

---

## Next Actions

1. Утвердить MVP scope с командой
2. Создать детализированный backlog в [[Backlog Structure]]
3. Начать Phase 1: monorepo scaffold
