---
title: Non-Goals
section: 02_STRATEGY
updated: 2026-04-11
status: draft
---

# Non-Goals

Чёткое определение того, чем Rashamon **НЕ является** и что **НЕ будет делать**.

---

## Product Non-Goals

### Rashamon Draw — это НЕ:

| Не является | Почему |
|---|---|
| Клон Illustrator | Мы не копируем чужой UI; мы создаём новый workflow |
| Замена Figma | Real-time collaboration — не наш приоритет |
| CAD-система | Точное инженерное черчение — другая ниша |
| 3D-редактор | Это Rashamon Motion (потом) |
| Photo editor | Это Rashamon Photo (потом) |
| Whiteboard / заметки | Слишком просто; наша аудитория — профессионалы |

### Rashamon Photo — это НЕ:

| Не является | Почему |
|---|---|
| Клон Photoshop | Новый workflow, не копия |
| Lightroom | Photo management — отдельный продукт |
| 3D texture tool | Не наша ниша |

### Rashamon Motion — это НЕ:

| Не является | Почему |
|---|---|
| Клон After Effects | Новый подход к моушн-дизайну |
| Video editor | Это не NLE; это motion graphics |
| 3D animation suite | 3D — за scope Rashamon |

---

## Platform Non-Goals

### Rashamon Platform — это НЕ:

| Не является | Почему |
|---|---|
| SaaS | Offline-first; нет облачной зависимости |
| Social network | Не строим social features |
| Asset marketplace | Не монетизируем ассеты пользователей |
| LMS / обучение | Не образовательная платформа |
| Cloud storage | Данные пользователя — на его машине |

---

## Technical Non-Goals

### Мы НЕ будем:

| Не будем | Почему |
|---|---|
| Поддерживать IE11 | Tauri использует современный webview |
| Делать mobile app | Desktop-first; mobile — отдельный продукт (если вообще) |
| Поддерживать Windows XP / macOS 10 | Только актуальные версии ОС |
| Использовать Electron | Tauri 2 — меньший footprint, Rust-бэкенд |
| Делать proprietary core | Open source by default |
| Требовать аккаунт | Offline-first, никаких обязательных регистраций |

---

## Business Non-Goals

| Не будем | Почему |
|---|---|
| Подписочная модель | Подписка создаёт стимул ломать |
| Vendor lock-in | Форматы открыты, данные пользователя — его |
| Paywall features | Ядро бесплатно; возможны коммерческие плагины (обсуждаемо) |
| Ads / telemetry | Уважение к пользователю |
| Selling user data | Никогда |

---

## Design Non-Goals

| Не будем | Почему |
|---|---|
| Material Design клон | Наш собственный язык дизайна |
| «Минимализм любой ценой» | Функциональность важнее пустого пространства |
| «Как Adobe, но бесплатно» | Это описание клона, а не нового продукта |
| Gamification | Профессиональный инструмент, не игра |

---

## Key Decisions

| Non-Goal | Влияние |
|---|---|
| Нет real-time collab | Фокус на individual power user |
| Нет SaaS | Offline-first архитектура |
| Нет подписки | Perpetual или free; монетизация через плагины/поддержку |
| Нет mobile | Desktop Linux — наша ниша |

---

## Links

- [[Product Philosophy]]
- [[MVP Scope]]
- [[Product Roadmap]]

---

## Next Actions

1. Использовать как чеклист при предложении новых фич
2. Добавить в [[Definition of Done]] проверку на non-goals
3. Обновлять при каждом новом product decision
