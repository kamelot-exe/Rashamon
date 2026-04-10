---
title: ADR-001 Core Stack
section: 04_ARCHITECTURE
status: accepted
date: 2026-04-11
---

# ADR-001: Core Stack Choice

## Status

✅ **Accepted**

## Context

Необходимо выбрать технологический стек для ядра Rashamon.

### Варианты

| Стек | Плюсы | Минусы |
|---|---|---|
| Electron + React + Node.js | Зрелый, большое комьюнити | Большой footprint, JS backend |
| Tauri 2 + React + Rust | Малый footprint, Rust-бэкенд, native | Моложе, меньше комьюнити |
| Native GTK/Qt + C++ | Максимальная производительность | Сложность, кроссплатформенность |
| Flutter Desktop | Единый UI, хорошая производительность | Dart, меньше библиотек для creative software |

### Требования

- Linux-first (Wayland/X11)
- Малый footprint
- Производительность для creative tasks
- Кроссплатформенность (future)
- Open source
- Доступность контрибьюторов

## Decision

Выбран стек: **Tauri 2 + React + TypeScript + Rust**

### Components

| Layer | Технология |
|---|---|
| App shell | Tauri 2 |
| Frontend | React + TypeScript |
| Backend | Rust |
| Build | pnpm + cargo |
| Package manager | pnpm workspace |

### Rationale

1. **Tauri 2**: Зрелый фреймворк с Rust-бэкендом, малый footprint (< 10MB vs 100MB+ для Electron)
2. **React**: Де-факто стандарт для сложных UI, большой пул разработчиков
3. **TypeScript**: Типобезопасность frontend, те же типы что и Rust через bindings
4. **Rust**: Производительность core operations, безопасность памяти, экосистема creative tools

## Consequences

### Positive
- Малый footprint приложения
- Производительность Rust для core operations
- Привлекательность для контрибьюторов (популярный стек)
- Безопасность памяти (Rust)

### Risks
- Tauri 2 относительно молод (mitigation: активное развитие, хороший дизайн)
- Webview limitations (mitigation: target современные webview)
- Rust learning curve (mitigation: хорошая документация, зрелая экосистема)

## Links

- [[System Architecture]]
- [[Monorepo Structure]]
- [[ADR-002 MVP Product Order]]
