---
title: Collaboration Protocol
section: 06_AGENTS
updated: 2026-04-11
status: draft
---

# Collaboration Protocol

Протокол взаимодействия AI-агентов Rashamon.

---

## Principles

| Принцип | Описание |
|---|---|
| Respect expertise | Каждый агент уважает зону ответственности других |
| Data-driven | Решения на основе данных, не мнений |
| Transparent | Все решения и rationale документируются |
| Iterative | Решения могут быть пересмотрены с новыми данными |
| Escalate when stuck | Не блокировать progress; эскалировать |

---

## Communication Model

### Agent → Agent

```
[Agent A] → запрос → [Agent B]
              │
              ▼
         [Agent B] → ответ → [Agent A]
```

### Agent → Coordinator

```
[Agent A] → finding/recommendation → [Мори Огай]
                                          │
                                          ▼
                                   Decision / routing
```

### Coordinator → Agents

```
[Мори Огай] → task → [Agent A]
                  → task → [Agent B]
                  → task → [Agent C]
```

---

## Output Format

Каждый agent output должен содержать:

```markdown
## Agent: [Имя]
## Task: [Описание]

### Analysis
[Содержательный анализ]

### Recommendation
[Конкретная рекомендация]

### Confidence
[High/Medium/Low] + обоснование

### Dependencies
[Что нужно для implementation]

### Links
[[Related docs]]
```

---

## Decision Recording

Все решения агентов фиксируются:

1. Решение документируется в relevant doc
2. ADR создан для architectural decisions
3. Links обновлены в [[00_INDEX]]

---

## Conflict Resolution

```
Conflict detected
  │
  ▼
Agents discuss directly
  │
  ├── Resolution → Document decision
  │
  └── No resolution → Escalate to Мори Огай
                        │
                        ├── Mediate → Decision
                        │
                        └── Still stuck → Human maintainer
```

---

## Quality Standards

| Стандарт | Требование |
|---|---|
| Specificity | Рекомендации конкретны и actionable |
| Context | Учитывает контекст Rashamon, не generic |
| Alignment | Согласуется с [[Product Philosophy]] |
| Links | Ссылается на relevant docs |
| Honesty | Отмечает uncertainties |

---

## Anti-Patterns

| Паттерн | Проблема |
|---|---|
| Generic advice без контекста | Не полезно для проекта |
| Overlapping zones | Конфликт ответственности |
| Analysis без recommendation | Бесполезный анализ |
| Recommendation без обоснования | Непонятно почему |
| Ignoring constraints | Нереалистичные предложения |

---

## Session Management

### Начало сессии

1. Определить задачу
2. Выбрать агента ([[Prompt Routing Rules]])
3. Provide context и relevant docs

### Во время сессии

1. Agent выполняет анализ
2. Output в стандартном формате
3. При необходимости — delegate/escalate

### Завершение сессии

1. Document decision
2. Update relevant docs
3. Note next actions

---

## Links

- [[Agent Index]]
- [[Agent Roles and Responsibilities]]
- [[Prompt Routing Rules]]

---

## Next Actions

1. Использовать этот протокол при multi-agent tasks
2. Обновлять format по мере необходимости
3. Добавить примеры успешных сессий
