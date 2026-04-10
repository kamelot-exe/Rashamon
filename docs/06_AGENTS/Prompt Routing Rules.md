---
title: Prompt Routing Rules
section: 06_AGENTS
updated: 2026-04-11
status: draft
---

# Prompt Routing Rules

Правила маршрутизации запросов к AI-агентам Rashamon.

---

## Routing Table

| Тип запроса | Агент | Пример |
|---|---|---|
| Стратегическое решение | [[Мори Огай]] | «Какой продукт делать следующим?» |
| Архитектурный выбор | [[Катай]] | «Tauri или Electron для ядра?» |
| Системный дизайн | [[По]] | «Как разграничить модули?» |
| Анализ данных, research | [[Ранпо]] | «Проанализируй конкурентов» |
| Стратегия рынка | [[Луиза]] | «Как позиционировать Draw?» |
| Growth, adoption | [[Акутагава]] | «Как привлечь контрибьюторов?» |
| Процессы, CI/CD | [[Дазай]] | «Как настроить release pipeline?» |
| Governance, legal | [[Фёдор]] | «Какую лицензию выбрать?» |
| Feature review, UX critique | [[Чуя]] | «Нужна ли нам эта фича?» |
| Visual design, brand | [[Одзаки]] | «Какой should UI language быть?» |

---

## Multi-Agent Queries

Когда запрос требует нескольких агентов:

### Pattern 1: Sequential

```
Мори Огай → Луиза (analysis) → Мори Огай (decision)
```

### Pattern 2: Parallel

```
Катай (tech feasibility) + По (system design) → joint review
```

### Pattern 3: Escalation

```
Ранпо (research) → Луиза (strategy) → Мори Огай (decision)
```

---

## Routing Logic

```
Query received
  │
  ▼
Is it a single-domain question?
  │
  ├── Yes → Route to specialist agent
  │
  └── No → Is it strategic?
             │
             ├── Yes → Мори Огай coordinates
             │          └── Sub-queries to specialists
             │
             └── No → Route to most relevant agent
                       └── Agent delegates if needed
```

---

## Priority Rules

| Priority | Когда | Пример |
|---|---|---|
| P0 — Blocker | Architecture blocking progress | «Нельзя начать Phase 1 без X» |
| P1 — Urgant | Decision needed this session | «Какой format выбрать?» |
| P2 — Normal | Regular query | «Проанализируй конкурентов» |
| P3 — Low | Background research | «Изучи trend» |

---

## Anti-Routing (Не направлять)

| Запрос | Почему | Куда вместо |
|---|---|---|
| «Напиши код для X» | Агенты — стратеги, не кодеры | general-purpose agent |
| «Исправь баг» | Оперативная задача | general-purpose agent |
| «Запушь коммит» | Git operation | Дазай (process) → execution |
| «Ответь на issue» | Communication | Дазай (operations) |

---

## Escalation Path

```
Agent unable to resolve
  → Requests input from relevant peer
  → If still unresolved → Мори Огай
  → If strategic impasse → Human maintainer
```

---

## Links

- [[Agent Index]]
- [[Agent Roles and Responsibilities]]
- [[Collaboration Protocol]]

---

## Next Actions

1. Использовать routing table при работе с агентами
2. Добавить примеры успешных маршрутов
3. Обновлять при добавлении новых агентов
