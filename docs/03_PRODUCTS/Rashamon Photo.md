---
title: Rashamon Photo
section: 03_PRODUCTS
updated: 2026-04-11
status: draft
---

# Rashamon Photo

> Профессиональный растровый редактор с неразрушающим workflow и семантическим пониманием изображений.

---

## Overview

Rashamon Photo — второй продукт экосистемы, планируется после стабилизации Rashamon Draw.

| | |
|---|---|
| **Тип** | Растровый редактор / фото / композитинг |
| **Целевая аудитория** | Фотографы, digital artists, дизайнеры |
| **Модель** | Open source, бесплатно |
| **Платформа** | Linux (после Draw), позже macOS/Windows |
| **Статус** | Planned — после Draw v0.1 |

---

## Use Cases

### Основные

| Сценарий | Описание |
|---|---|
| Фото-ретушь | Non-destructive retouching |
| Композитинг | Составные изображения из источников |
| Digital painting | Рисование (конкуренция с Krita) |
| Batch обработка | Множественная обработка через CLI |

### Продвинутые

| Сценарий | Описание |
|---|---|
| HDR merge | Слияние экспозиций |
| Focus stacking | Стекирование фокуса |
| Панорамы | Сшивка изображений |

---

## Vision

### Отличия от Krita/GIMP

| Аспект | Krita/GIMP | Rashamon Photo |
|---|---|---|
| Архитектура | Legacy codebase | Современная модульная |
| Non-destructive | Частично (Krita) / Нет (GIMP) | By default |
| Семантика | Пиксели | Пиксели + метаданные + AI-assist |
| Интеграция | Standalone | Shared assets с Draw/Motion |
| CLI | Ограниченный | Полноценный |
| Автоматизация | Script-fu (GIMP) | Hooks + macros |

---

## Key Features (planned)

### Core

- [ ] Non-destructive layers
- [ ] Adjustment layers
- [ ] Smart objects (parameterized)
- [ ] Masking (non-destructive)
- [ ] Selection tools (semantic assist)
- [ ] Color management (ICC profiles)

### Differentiators

- [ ] Semantic image understanding (AI-assisted tagging)
- [ ] Branching history для экспериментов
- [ ] Parameterized filters (change any setting post-apply)
- [ ] Batch processing pipeline
- [ ] Shared assets с Draw

### Effects (parameterized)

- [ ] Blur (gaussian, motion, lens)
- [ ] Sharpen
- [ ] Color correction (curves, levels)
- [ ] Transform (distort, perspective)
- [ ] Generative fill (AI-assisted, optional)

---

## Technical Direction

| Component | Planned Approach |
|---|---|
| Rendering | GPU-accelerated (OpenGL/Vulkan) |
| Image processing | Rust (performance) |
| Color management | LittleCMS integration |
| File format | .rphoto (JSON manifest + binary data) |
| Shared platform | Reuse core from Draw |

---

## Dependencies

| Зависимость | От чего |
|---|---|
| Shared Platform | Должна быть стабильной после Draw |
| Rendering engine | Может потребовать GPU-specific оптимизации |
| Color pipeline | LittleCMS интеграция |

---

## Not in Scope

| Не входит | Почему |
|---|---|
| Photo management (Lightroom-style) | Другой продукт |
| 3D texturing | Не наша ниша |
| Vector editing | Rashamon Draw |

---

## Links

- [[Product Roadmap]]
- [[Rashamon Draw]]
- [[Rashamon Motion]]
- [[Shared Platform]]

---

## Next Actions

1. Не начинать до стабилизации Draw
2. Исследовать LittleCMS интеграцию
3. Определить minimal feature set для Photo MVP
