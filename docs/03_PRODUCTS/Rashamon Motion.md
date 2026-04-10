---
title: Rashamon Motion
section: 03_PRODUCTS
updated: 2026-04-11
status: draft
---

# Rashamon Motion

> Моушн-дизайн и анимация с параметрическим подходом и интеграцией с Draw/Photo.

---

## Overview

Rashamon Motion — третий продукт экосистемы, планируется после стабилизации Draw и Photo.

| | |
|---|---|
| **Тип** | Motion graphics / анимация |
| **Целевая аудитория** | Motion designers, аниматоры, видео-продакшн |
| **Модель** | Open source, бесплатно |
| **Платформа** | Linux (после Draw + Photo) |
| **Статус** | Planned — после Photo |

---

## Use Cases

### Основные

| Сценарий | Описание |
|---|---|
| Motion graphics | Анимированная графика, заставки |
| UI анимация | Прототипирование анимаций интерфейсов |
| Explainer videos | Анимационные объясняющие видео |
| Social media контент | Анимации для соцсетей |

### Продвинутые

| Сценарий | Описание |
|---|---|
| Character animation | Скелетная анимация |
| Particle systems | Системы частиц |
| Data visualization | Анимированные данные |

---

## Vision

### Отличия от After Effects

| Аспект | After Effects | Rashamon Motion |
|---|---|---|
| Модель | Подписка | Бесплатно |
| Архитектура | Монолит | Модульная |
| Non-destructive | Да | Parameterized by default |
| Интеграция | Adobe ecosystem | Draw + Photo native |
| Linux | Нет | ✅ Native |
| Автоматизация | Expressions, Scripts | Hooks + macros + CLI |

---

## Key Features (planned)

### Core

- [ ] Timeline с keyframes
- [ ] Layer-based compositing
- [ ] Transform animation (position, scale, rotation, opacity)
- [ ] Easing curves
- [ ] Precompositions
- [ ] Shape layers

### Differentiators

- [ ] Asset integration: Draw/Photo файлы как sources
- [ ] Parameterized animations (change source → update animation)
- [ ] Branching history для вариантов анимации
- [ ] CLI rendering: `rashamon motion --render project.rmotion --output video.mp4`
- [ ] Scriptable transitions

### Export

- [ ] MP4/H.264
- [ ] WebM/VP9
- [ ] GIF
- [ ] PNG sequence
- [ ] Lottie (JSON)

---

## Technical Direction

| Component | Planned Approach |
|---|---|
| Rendering | GPU-accelerated |
| Timeline | Custom TS component |
| Video encoding | FFmpeg integration |
| File format | .rmotion (JSON manifest + references) |
| Shared platform | Reuse core from Draw |

---

## Dependencies

| Зависимость | От чего |
|---|---|
| Shared Platform | Стабильная |
| Draw integration | Draw должен поддерживать shared assets |
| FFmpeg | Bundled или system dependency |

---

## Not in Scope

| Не входит | Почему |
|---|---|
| Video editing (NLE) | Другой класс продуктов |
| 3D animation | Не наша ниша |
| Audio editing | System tools / external |

---

## Links

- [[Product Roadmap]]
- [[Rashamon Draw]]
- [[Rashamon Photo]]
- [[Shared Platform]]

---

## Next Actions

1. Не начинать до Draw + Photo
2. Исследовать FFmpeg интеграцию
3. Определить relationship с Draw/Photo assets
