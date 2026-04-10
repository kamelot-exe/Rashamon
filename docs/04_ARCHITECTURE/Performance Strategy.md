---
title: Performance Strategy
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Performance Strategy

Стратегия обеспечения производительности Rashamon.

---

## Performance Targets

### Startup

| Метрика | Target |
|---|---|
| Cold start (no doc) | < 3 seconds |
| Open existing doc | < 2 seconds |
| Reopen last doc | < 1.5 seconds |

### Rendering

| Метрика | Target |
|---|---|
| Normal operation | 60 fps |
| 100 objects | 60 fps |
| 500 objects | 30+ fps |
| 1000 objects | 20+ fps |
| Pan/zoom | 60 fps |
| Drag operation | 60 fps |

### File Operations

| Метрика | Target |
|---|---|
| Save 1MB doc | < 500ms |
| Load 1MB doc | < 1 second |
| Export PNG (1920x1080) | < 2 seconds |
| Export SVG | < 1 second |

---

## Optimization Layers

### 1. Architecture Level

| Стратегия | Описание |
|---|---|
| Rust backend | Производительность core operations |
| Unidirectional data flow | Предсказуемые обновления |
| Single source of truth | Избегание sync overhead |

### 2. Rendering Level

| Стратегия | Описание |
|---|---|
| Hybrid SVG+Canvas | Оптимальный renderer для каждого типа |
| Dirty rect rendering | Перерисовка только изменённых областей |
| LOD (Level of Detail) | Упрощение при отдалении |
| Render cache | Кэширование expensive операций |
| Batch DOM updates | requestAnimationFrame batching |

### 3. Data Level

| Стратегия | Описание |
|---|---|
| Incremental save | Только изменения |
| Lazy asset loading | Ассеты по необходимости |
| Thumbnail cache | Предпросмотр без полной загрузки |

### 4. Memory Level

| Стратегия | Описание |
|---|---|
| History snapshot intervals | Не каждый state — полный snapshot |
| Asset deduplication | Одинаковые ассеты — одна копия |
| GC-friendly structures | Избегание fragmentation |

---

## Bottleneck Analysis

### Expected Bottlenecks

| Область | Риск | Митигация |
|---|---|---|
| SVG rendering (500+ объектов) | Высокий | LOD + Canvas fallback |
| History snapshots (большой документ) | Средний | Delta-based snapshots |
| JSON parse/stringify (большие файлы) | Средний | serde_json оптимизации |
| Tauri IPC overhead | Низкий | Batch commands |

---

## Profiling Strategy

### Tools

| Tool | Для чего |
|---|---|
| Chrome DevTools | Frontend performance |
| Rust `criterion` | Backend benchmarks |
| Tauri devtools | Full app profiling |
| Custom telemetry | Runtime metrics |

### Key Scenarios для Profiling

1. Create 1000 objects
2. Pan/zoom на большом документе
3. Undo/redo 100 steps
4. Save/load 5MB document
5. Export PNG

---

## Future Optimizations (Post-MVP)

| Оптимизация | Описание | Приоритет |
|---|---|---|
| WebGL renderer | GPU-accelerated rendering | P1 |
| WebGPU | Next-gen GPU rendering | P2 |
| Virtual scene graph | Только видимые объекты | P1 |
| Worker threads | Background processing | P2 |
| WASM modules | Plugin performance | P3 |

---

## Performance Budget

| Resource | Budget |
|---|---|
| Bundle size (app) | < 50 MB |
| Bundle size (installer) | < 100 MB |
| RAM (empty doc) | < 200 MB |
| RAM (100 objects) | < 300 MB |
| RAM (1000 objects) | < 500 MB |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Rust для core | Нативная производительность |
| LOD strategy | Graceful degradation |
| Dirty rect rendering | Minimise repaints |
| Profile before optimize | Data-driven optimization |

---

## Links

- [[Rendering Architecture]]
- [[System Architecture]]
- [[MVP Scope]]

---

## Next Actions

1. Создать benchmark suite в Phase 2
2. Профилировать prototype renderer
3. Определить реальные bottleneck'и
