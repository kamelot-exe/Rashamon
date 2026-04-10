---
title: Competitive Strategy
section: 01_VISION
updated: 2026-04-11
status: draft
---

# Competitive Strategy

Анализ конкурентного ландшафта и стратегия позиционирования Rashamon.

---

## Competitive Landscape

### Прямые конкуренты (векторные редакторы)

| Продукт | Модель | Linux | Цена | Открытый |
|---|---|---|---|---|
| Adobe Illustrator | Подписка | Нет (web beta) | $22.99/мес | ❌ |
| Affinity Designer | Perpetual | Нет | $69.99 | ❌ |
| Inkscape | Open Source | ✅ | Бесплатно | ✅ |
| Figma | SaaS | Web | Freemium | ❌ |
| Penpot | Open Source | Web | Freemium | ✅ |
| **Rashamon Draw** | Open Source | ✅ Native | Бесплатно | ✅ |

### Косвенные конкуренты

| Продукт | Ниша | Что у них есть | Чего нет у них |
|---|---|---|---|
| Figma | UI/UX дизайн | Real-time collaboration, components | Desktop, offline, ownership |
| Inkscape | Векторная графика | Зрелость, комьюнити | Современная архитектура, UX |
| Penpot | UI/UX + вектор | Open source, web | Native, performance, offline |
| Blender (Grease Pencil) | 2D в 3D | 3D-интеграция | 2D-first workflow |

---

## Позиционирование Rashamon

### Мы НЕ конкурируем с Illustrator напрямую

Это гонка фич, которую мы не выиграем на старте. Вместо этого:

**Rashamon Draw = профессиональный векторный редактор + уникальный workflow**

|维度 | Illustrator | Inkscape | Rashamon Draw |
|---|---|---|---|
| Модель | Подписка | Бесплатно | Бесплатно |
| Linux | Нет | ✅ | ✅ Native-first |
| Семантический канвас | ❌ | ❌ | ✅ |
| Графовая история | ❌ | ❌ | ✅ |
| Non-destructive | Частично | ❌ | ✅ By default |
| Плагин API | Ограниченный | Script-fu | Полноценный runtime |
| Автоматизация | Actions | ❌ | Hooks + macros |
| Архитектура | Монолит | Монолит | Модульная |

### Мы НЕ конкурируем с Figma в real-time collab

Figma выиграла в collaborative design. Это не наша битва.

**Наша ниша: individual professional power user**

- Фрилансеры, которым нужен быстрый локальный инструмент
- Разработчики, делающие UI/UX для своих продуктов
- Linux-профессионалы без альтернатив
- Те, кто хочет владеть своими данными

---

## Стратегические столпы

### 1. Дифференциация через workflow

Не «можем то же самое, но дешевле», а «можем то, чего они не могут»:

- Ветвящаяся история — экспериментируй без страха
- Семантические объекты — машиночитаемый холст
- Параметрические эффекты — меняй что угодно постфактум

### 2. Linux как дом, а не порт

- Нативная пакетизация (AppImage, flatpak, nix)
- Wayland-first
- CLI-интеграция, pipes, config files
- Системные темы и шрифты

### 3. Экосистемный эффект

Каждый новый продукт Rashamon усиливает остальные:

- Общий формат ассетов
- Общие плагины
- Общие пользователи

### 4. Community-driven development

- Прозрачный roadmap
- RFC-процесс для крупных изменений
- Governed open source — баланс открытости и бренда

---

## Go-to-Market (draft)

| Фаза | Действие | Целевая аудитория |
|---|---|---|
| Pre-MVP | Documentation, community building | Early adopters, контрибьюторы |
| MVP | Rashamon Draw alpha | Linux-дизайнеры, разработчики |
| Post-MVP | Usability improvements | Профессионалы |
| Ecosystem | Photo + Motion | Расширенная аудитория |

---

## Risks

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| Inkscape улучшит UX | Средняя | Средняя | Мы предлагаем другой workflow, не UX-копию |
| Adobe выпустит Linux-версию | Низкая | Высокая | К тому времени у нас будет комьюнити и дифференциация |
| Недостаточно контрибьюторов | Средняя | Высокая | AI-assisted разработка, чёткая документация |
| Tauri 2 не потянет нагрузку | Низкая | Высокая | [[Performance Strategy]] с fallback на native rendering |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| Не конкурировать в feature parity | Проигрышная стратегия для нового проекта |
| Фокус на individual power user | Избегание прямой конкуренции с Figma/Adobe |
| Экосистемный подход | Долгосрочное преимущество через синергию |

---

## Open Questions

- Стоит ли создавать совместимость с форматами SVG/AI/AFDESIGN для миграции?
- Нужен ли migration tool из Inkscape/Illustrator?

---

## Links

- [[Project Vision]]
- [[Differentiators]]
- [[Why Rashamon Exists]]
- [[Product Roadmap]]

---

## Next Actions

1. Провести глубокое сравнение workflow Inkscape vs Illustrator vs Figma
2. Определить top-10 фич для MVP на основе competitive analysis
3. Обновить [[MVP Scope]] с учётом конкурентных преимуществ
