---
title: Visual Direction
section:08_BRAND
updated: 2026-04-11
status: draft
---

# Visual Direction

Визуальное направление дизайна Rashamon.

---

## Design Philosophy

**Functional minimalism** — минимум декоративности, максимум функциональности.

| Принцип | Описание |
|---|---|
| Form follows function | Дизайн服务于 цель, не наоборот |
| Clarity over beauty | Понятный > красивый (но лучше и тот, и другой) |
| Consistency | Единый язык UI across all products |
| Professional | Выглядит как рабочий инструмент, не как toy |

---

## UI Language

### Current Direction

| Аспект | Направление |
|---|---|
| Layout | Traditional: toolbar left, canvas center, panels right |
| Density | High — professionals prefer information density |
| Icons | Clean, geometric, recognizable |
| Colors | Subtle; focus on canvas content |
| Typography | Readible, system fonts优先 |

### Inspiration

| Источник | Что берём |
|---|---|---|
| Blender | Professional density, keyboard shortcuts |
| VS Code | Command palette, panel system |
| Figma | Clean icon set, property panels |
| GTK Adwaita | Native Linux feel |

---

## Color System (Draft)

### Brand Colors

| Цвет | Hex | Применение |
|---|---|---|
| Primary | TBD | Логотип, акценты |
| Secondary | TBD | Вторичные элементы |

### Product Colors

| Продукт | Цвет | Статус |
|---|---|---|
| Draw | TBD | [[Одзаки]] определит |
| Photo | TBD | [[Одзаки]] определит |
| Motion | TBD | [[Одзаки]] определит |

### UI Colors

| Элемент | Подход |
|---|---|
| Background | System theme / neutral |
| Panels | Slightly different from canvas |
| Selection | High contrast |
| Focus | Clear focus indicator |

---

## Icon Design

### Principles

| Принцип | Описание |
|---|---|
| Geometric | Чистые формы |
| Consistent stroke | Единая толщина |
| Recognizable at small sizes | Readible at 16x16 |
| Unique per tool | No confusion between icons |

### Icon Set (MVP)

| Иконка | Tool |
|---|---|
| Cursor | Select |
| Rectangle | Rectangle tool |
| Ellipse | Ellipse tool |
| Line | Line tool |
| T | Text tool |
| Pen | Pen tool |
| Layers | Layers panel |
| Properties | Properties panel |
| Grid | Grid toggle |

---

## Logo Direction

### Concepts

| Concept | Описание | Статус |
|---|---|---|
| Расёмон gate | Отсылка к источнику имени | 🟡 Исследуется |
| Overlapping perspectives | Визуализация branching history | 🟡 Исследуется |
| Abstract R | Lettermark | 🟡 Исследуется |
| Tool mark | Креативный инструмент | 🟡 Исследуется |

> ⚠️ Логотип будет создан [[Одзаки|Одзаки]] в Phase 7 или раньше при возможности.

---

## Typography

### UI Font

| Аспект | Решение |
|---|---|
| Primary | System font (GTK theme) |
| Fallback | Sans-serif stack |
| Monospace | Code editor / console output |

### Brand Font

| Аспект | Решение |
|---|---|
| Status | ❌ Не выбрана |
| Owner | [[Одзаки]] |
| Considerations | Open source license, legibility, versatility |

---

## Dark Mode

| Аспект | Подход |
|---|---|
| Default | System preference |
| Override | Settings → Appearance |
| Canvas | Neutral (не влияет на тему UI) |

---

## Accessibility

| Требование | Описание |
|---|---|
| Keyboard navigation | Всё доступно с клавиатуры |
| Focus indicators | Чёткие видимые |
| Color contrast | WCAG AA минимум |
| Screen reader | Semantic HTML, ARIA labels |

---

## Links

- [[Brand Core]]
- [[Одзаки/Design Director]]
- [[Naming Rules]]

---

## Next Actions

1. [[Одзаки|Одзаки]] создаст visual concepts
2. Определить color system
3. Создать icon set для MVP
4. Выбрать logo direction
