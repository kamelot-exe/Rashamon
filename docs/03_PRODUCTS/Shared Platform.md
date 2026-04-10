---
title: Shared Platform
section: 03_PRODUCTS
updated: 2026-04-11
status: draft
---

# Shared Platform

Общая техническая основа всех продуктов Rashamon.

---

## Purpose

Все продукты Rashamon работают на **единой платформе**, которая обеспечивает:

- Общие форматы данных
- Общие компоненты рендеринга
- Общую систему плагинов
- Общий UI framework
- Общий asset graph

Это **не продукт**, а техническая основа.

---

## Components

### 1. Core Library (`@rashamon/core`)

Rust-библиотека с общей логикой:

| Модуль | Описание |
|---|---|
| `document` | Document model, serialization |
| `scene_graph` | Граф сцены, объекты, иерархия |
| `history` | Undo/redo (linear → graph) |
| `assets` | Asset management, references |
| `export` | Экспорт в различные форматы |
| `config` | Настройки, preferences |

### 2. UI Framework (`@rashamon/ui`)

React-компоненты для общего UI:

| Модуль | Описание |
|---|---|
| `panels` | Layers, Properties, Assets panels |
| `toolbar` | Toolbar component |
| `canvas` | Canvas wrapper с pan/zoom |
| `commands` | Command palette |
| `dialogs` | Модальные диалоги |

### 3. Plugin Runtime (`@rashamon/plugin-runtime`)

Система плагинов:

| Модуль | Описание |
|---|---|
| `loader` | Загрузка плагинов |
| `api` | Plugin API surface |
| `sandbox` | Безопасность (ограниченная) |
| `registry` | Реестр установленных плагинов |

### 4. Asset Graph (`@rashamon/asset-graph`)

Общий граф ассетов:

| Модуль | Описание |
|---|---|
| `graph` | Граф зависимостей ассетов |
| `resolver` | Разрешение ссылок |
| `sync` | Синхронизация при изменениях |
| `cache` | Кэширование |

### 5. CLI Framework (`@rashamon/cli`)

Командная строка:

| Команда | Описание |
|---|---|
| `rashamon draw ...` | Draw CLI |
| `rashamon photo ...` | Photo CLI |
| `rashamon motion ...` | Motion CLI |
| `rashamon plugin ...` | Plugin management |

---

## Monorepo Structure

```
rashamon/
├── packages/
│   ├── core/              # Rust core library
│   ├── ui/                # React UI components
│   ├── plugin-runtime/    # Plugin system
│   ├── asset-graph/       # Shared asset graph
│   └── cli/               # CLI framework
├── apps/
│   ├── draw/              # Rashamon Draw
│   ├── photo/             # Rashamon Photo (later)
│   └── motion/            # Rashamon Motion (later)
└── docs/                  # Documentation vault
```

Подробности: [[Monorepo Structure]]

---

## Shared Data Model

### Document

Все продукты используют единую концепцию документа:

```
Document
├── metadata (title, author, version, tags)
├── canvas (dimensions, background, color profile)
├── scene_graph (root → layers → objects)
├── history (DAG of states)
├── assets (images, fonts, symbols)
└── config (preferences, plugins)
```

### File Format

Каждый продукт имеет свой формат, но с общей структурой:

| Продукт | Расширение | Формат |
|---|---|---|
| Draw | `.rdraw` | JSON + embedded assets |
| Photo | `.rphoto` | JSON manifest + binary data |
| Motion | `.rmotion` | JSON manifest + references |

---

## Cross-Product Integration

### Draw → Photo

- Импортировать .rdraw как слой в Photo
- Векторные элементы остаются редактируемыми

### Draw → Motion

- Использовать .rdraw как source анимации
- Изменение .rdraw обновляет анимацию

### Photo → Motion

- Использовать .rphoto как source анимации
- Параметрические эффекты сохраняются

---

## Benefits

| Преимущество | Описание |
|---|---|
| DRY | Один код — все продукты |
| Consistency | Единый UX паттерн |
| Asset sharing | Ассеты переиспользуются |
| Plugin ecosystem | Один плагин — все продукты (если применимо) |
| Maintainer efficiency | Один fix — все продукты |

---

## Risks

| Риск | Митигация |
|---|---|
| Over-engineering shared layer | Начать с минимума; расширять по мере нужды |
| Product-specific requirements break abstraction | Гибкие API; fallback для product-specific code |
| Slower iteration on shared code | Чёткая версионность; backward compatibility |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Общая платформа с начала | Избегаем дублирования; consistency |
| Rust core + React UI | Performance + flexibility |
| JSON-based formats | Diff-able, readable, portable |
| Asset graph как отдельный модуль | Переиспользуется всеми продуктами |

---

## Links

- [[Monorepo Structure]]
- [[System Architecture]]
- [[Data Model]]
- [[Plugin System]]

---

## Next Actions

1. Определить минимальный shared core для Phase 1
2. Спроектировать document model interface
3. Создать shared UI component library scaffold
