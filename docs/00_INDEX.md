---
title: Rashamon Knowledge Base — Index
updated: 2026-04-11
status: draft
---

# Rashamon — Index базы знаний

Эта папка — **Obsidian vault** проекта Rashamon. Она содержит всю стратегическую, архитектурную и операционную документацию проекта.

---

## Навигация

| Раздел | Описание |
|---|---|
| [[01_VISION/Project Vision|01 — Vision]] | Зачем существует Rashamon, миссия, философия |
| [[02_STRATEGY/Product Roadmap|02 — Strategy]] | Дорожная карта, MVP, релиз-стратегия, бренд |
| [[03_PRODUCTS/Rashamon Draw|03 — Products]] | Описание каждого продукта экосистемы |
| [[04_ARCHITECTURE/System Architecture|04 — Architecture]] | Технические решения, ADR, рендеринг, данные |
| [[05_EXECUTION/Milestones|05 — Execution]] | Вехи, бэклог, риски, Definition of Done |
| [[06_AGENTS/Agent Index|06 — Agents]] | Роли AI-агентов, протоколы взаимодействия |
| [[07_COMMUNITY/Open Source Strategy|07 — Community]] | Open Source стратегия, контрибуция, RFC, форки |
| [[08_BRAND/Brand Core|08 — Brand]] | Ядро бренда, нейминг, визуальное направление |
| [[09_GITHUB/CONTRIBUTING|09 — GitHub]] | Шаблоны для GitHub: CONTRIBUTING, CoC, issue/PR |
| [[10_APPENDICES/Glossary|10 — Appendices]] | Глоссарий, открытые вопросы, research queue |

---

## Purpose

Этот vault — **единый источник правды** для стратегических и архитектурных решений Rashamon. Он:

- Определяет направление продукта до написания кода
- Фиксирует принятые решения и открытые вопросы
- Служит контекстом для AI-агентов и контрибьюторов
- Разделяет **стратегию** (почему) и **исполнение** (как)

---

## Key Decisions

| Решение | Документ | Статус |
|---|---|---|
| Tauri 2 + React + TypeScript + Rust | [[ADR-001 Core Stack]] | ✅ Принято |
| Rashamon Draw — первый продукт | [[ADR-002 MVP Product Order]] | ✅ Принято |
| SVG/Canvas hybrid для MVP | [[System Architecture]] | ✅ Принято |
| SQLite + structured project manifests | [[Data Model]] | ✅ Принято |
| pnpm workspace + cargo workspace | [[Monorepo Structure]] | ✅ Принято |

---

## Assumptions

- Целевая платформа: Linux desktop (Wayland/X11) как приоритет
- macOS/Windows — желательны, но не блокируют MVP
- Проект на ранней стадии; многие решения — направления, а не финальные спецификации

---

## Next Actions

1. Утвердить [[Product Vision]] и [[Product Philosophy]] как базовые документы
2. Детализировать [[MVP Scope]] для Rashamon Draw
3. Начать Phase 0 → Phase 1 переход по [[Delivery Phases]]
4. Открыть [[Open Questions]] для приоритизации

---

## Links

- [[Project Vision]]
- [[Product Roadmap]]
- [[System Architecture]]
- [[Open Questions]]
