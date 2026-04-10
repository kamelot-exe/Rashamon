---
title: Rendering Architecture
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Rendering Architecture

Стратегия рендеринга канваса в Rashamon Draw.

---

## Hybrid Rendering: SVG + Canvas 2D

Rashamon использует **гибридный подход** к рендерингу, сочетая преимущества SVG и Canvas 2D.

---

## Strategy

### Когда SVG

| Сценарий | Почему SVG |
|---|---|
| UI-элементы канваса | Чёткость на любом зуме |
| Векторные фигуры | Нативная векторная природа |
| Text | Нативный text rendering |
| Интерактивные объекты | DOM events, hover, selection |

### Когда Canvas 2D

| Сценарий | Почему Canvas |
|---|---|
| Сложные path (1000+ точек) | Производительность |
| Background / backdrop | Быстрый fill |
| Effects (blur, shadows) | GPU-accelerated filters |
| Large selections | Rectangular overlay |

### Разделение ответственности

```
┌─────────────────────────────────────┐
│           Viewport                   │
│  ┌───────────────────────────────┐  │
│  │  Canvas 2D Layer (background) │  │
│  │  - Grid                       │  │
│  │  - Guides                     │  │
│  │  - Background color           │  │
│  │  - Effects (blur, shadows)    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  SVG Layer (objects)          │  │
│  │  - Shapes (rect, ellipse...)  │  │
│  │  - Text                       │  │
│  │  - Paths                      │  │
│  │  - Selection handles          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Canvas 2D Layer (overlay)    │  │
│  │  - Temporary UI indicators    │  │
│  │  - Drag previews              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Rendering Pipeline

```
Scene Graph (Rust)
    │
    ▼
Tauri Event: scene_update
    │
    ▼
TS State Manager
    │
    ▼
┌───────────────────────┐
│  Diffing Engine       │  Определяет изменившиеся объекты
└───────────┬───────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
 SVG Renderer   Canvas Renderer
     │             │
     ▼             ▼
┌─────────────────────┐
│   Compositing       │  SVG layer + Canvas layers
└─────────────────────┘
     │
     ▼
   Display
```

---

## Performance Targets

| Метрика | Target |
|---|---|
| FPS (обычная работа) | 60 fps |
| FPS (перетаскивание) | 60 fps |
| FPS (100 объектов) | 60 fps |
| FPS (1000 объектов) | 30+ fps |
| Zoom in/out | Без деградации качества |
| Pan | 60 fps |

---

## Zoom & Pan

### Реализация

- **CSS transform** на контейнере для zoom/pan
- SVG и Canvas масштабируются вместе
- При зуме > 4x — LOD (level of detail) упрощение

### LOD Strategy

| Zoom level | Детализация |
|---|---|
| < 25% | Bounding boxes only |
| 25-50% | Simplified shapes |
| 50-200% | Full detail |
| 200-400% | Full detail + pixel grid |
| > 400% | Pixel-level preview |

---

## Selection & Interaction

### Selection Rendering

- SVG overlay с handles (corner, edge, rotation)
- Canvas для rectangular selection (drag)

### Hit Testing

- **Rust backend** для точного hit test по scene graph
- TS cache для быстрой проверки
- Fallback: DOM events для SVG elements

---

## Non-destructive Rendering

### Как работает

Каждый эффект — **узел в графе рендеринга**, а не baked-in изменение:

```
Object → Transform → Fill → Stroke → Effects → Composite
```

При изменении любого узла — пересчёт цепочки, не перерисовка с нуля.

### Cache

- Render cache: запоминание результат expensive операций
- Invalidation: при изменении input — invalidate downstream
- TTL: очистка неиспользуемых кэшей

---

## Export Rendering

### PNG Export

- Отдельный offscreen Canvas
- Без UI overlays
- Full resolution
- Антиалиасинг

### SVG Export

- Сериализация scene graph → SVG DOM
- Только векторные данные, без UI
- Чистый SVG файл

---

## Future: GPU Rendering

После MVP:

| Технология | Для чего |
|---|---|
| WebGL2 | Альтернативный renderer для сложных сцен |
| WebGPU | Future: нативный GPU rendering |
| Skia via wasm | potential fallback renderer |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Hybrid SVG+Canvas | Лучшее из обоих миров |
| CSS transform для zoom | Нативная производительность браузера |
| Rust hit test | Точность, единая логика |
| LOD strategy | Производительность на больших/малых зумах |
| Render cache | Избегание повторных вычислений |

---

## Assumptions

- SVG performance acceptable для ≤ 500 объектов
- Canvas 2D достаточно для эффектов MVP
- GPU rendering — post-MVP оптимизация

---

## Links

- [[System Architecture]]
- [[Performance Strategy]]
- [[Differentiators]]

---

## Next Actions

1. Прототип hybrid renderer в Phase 2
2. Benchmark SVG vs Canvas performance
3. Определить LOD thresholds
