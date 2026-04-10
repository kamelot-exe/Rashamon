---
title: Open Questions
section: 10_APPENDICES
updated: 2026-04-11
status: draft
---

# Open Questions

Открытые вопросы, требующие решения.

---

## Strategic

| ID | Вопрос | Owner | Priority | Notes |
|---|---|---|---|---|
| SQ-01 | Какую лицензию выбрать? | [[Фёдор]] | P0 | MIT vs Apache-2.0 vs GPL |
| SQ-02 | Когда начинать trademark регистрацию? | [[Фёдор]] | P2 | Юридическая консультация нужна |
| SQ-03 | Нужен ли unified launcher? | [[Мори Огай]] | P3 | После 2+ продуктов |
| SQ-04 | Коммерческие плагины — допустимы? | [[Мори Огай]] | P3 | After community established |
| SQ-05 | Как монетизировать (если вообще)? | [[Акутагава]] | P3 | Donations, sponsors, grants? |

---

## Product

| ID | Вопрос | Owner | Priority | Notes |
|---|---|---|---|---|
| PQ-01 | Pen tool — full bezier или упрощённый? | [[Чуя]] | P1 | MVP scope |
| PQ-02 | Boolean operations в MVP? | [[Чуя]] | P2 | Сложность vs ценность |
| PQ-03 | Gradient fills — когда? | [[Чуя]] | P2 | Phase 5 candidate |
| PQ-04 | Migration tools из Inkscape? | [[Ранпо]] | P3 | Import SVG/AI? |
| PQ-05 | Multi-canvas documents? | [[По]] | P3 | After MVP |

---

## Technical

| ID | Вопрос | Owner | Priority | Notes |
|---|---|---|---|---|
| TQ-01 | SVG или Canvas как primary renderer? | [[Катай]] | P0 | Benchmark needed |
| TQ-02 | JSON vs binary для больших файлов? | [[Катай]] | P2 | Compression в future |
| TQ-03 | SQLite — когда интегрировать? | [[Катай]] | P2 | Project indexing |
| TQ-04 | WebGL renderer — когда? | [[Катай]] | P2 | Performance fallback |
| TQ-05 | Plugin sandboxing — насколько strict? | [[По]] | P1 | Power vs safety |
| TQ-06 | Asset storage: inline vs external? | [[По]] | P2 | MVP — inline |

---

## Community

| ID | Вопрос | Owner | Priority | Notes |
|---|---|---|---|---|
| CQ-01 | Какой community channel? | [[Акутагава]] | P2 | Discord vs Matrix |
| CQ-02 | Когда открывать для контрибьюторов? | [[Дазай]] | P1 | Phase 1 or 2? |
| CQ-03 | Нужен ли website до MVP? | [[Акутагава]] | P2 | Landing page minimal |
| CQ-04 | Как привлекать первых контрибьюторов? | [[Акутагава]] | P2 | good-first-issues |

---

## Brand

| ID | Вопрос | Owner | Priority | Notes |
|---|---|---|---|---|
| BQ-01 | Какой tagline? | [[Одзаки]] | P2 | Несколько кандидатов |
| BQ-02 | Логотип — когда? | [[Одзаки]] | P2 | Phase 7 или раньше |
| BQ-03 | Brand colors для продуктов? | [[Одзаки]] | P2 | Draw/Photo/Motion |
| BQ-04 | Domain для сайта? | [[Дазай]] | P1 | rashamon.app? |

---

## Resolved Questions

| ID | Вопрос | Решение | Дата |
|---|---|---|---|
| RQ-01 | Какой стек? | Tauri 2 + React + TS + Rust | 2026-04-11 |
| RQ-02 | Первый продукт? | Rashamon Draw | 2026-04-11 |
| RQ-03 | Монорепозиторий? | Да, pnpm + cargo workspace | 2026-04-11 |
| RQ-04 | Формат проектов? | JSON-based | 2026-04-11 |

---

## How to Resolve

1. Assign owner для каждого вопроса
2. Owner исследует и предлагает решение
3. Discussion в relevant channel
4. Decision documented
5. Status changed to «Resolved»

---

## Links

- [[Research Queue]]
- [[Risks]]
- [[Agent Roles and Responsibilities]]
