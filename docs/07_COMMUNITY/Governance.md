---
title: Governance
section: 07_COMMUNITY
updated: 2026-04-11
status: draft
---

# Governance

Модель управления проектом Rashamon.

---

## Current State: BDFL-lite

На текущей стадии проект управляется по модели **BDFL-lite** (Benevolent Dictator For Life, с элементами сообщества):

| Роль | Кто | Права |
|---|---|---|
| Founder / Lead Maintainer | kamelot-exe | Финальное слово по стратегии, архитектуре, бренду |
| Core Maintainers | TBD | Merge rights, architecture decisions |
| Contributors | Community | PRs, discussions, votes |

---

## Target State: Community Governance

По мере роста проекта — переход к **сообщественному управлению**:

### Governance Bodies

| Орган | Состав | Зона ответственности |
|---|---|---|
| Core Team | Maintainers (3-5 чел.) | Architecture, releases, quality |
| Brand Committee | 2-3 чел. | [[Brand and Trademark Policy]] |
| Community Council | 3-5 elected | Code of Conduct, community health |

### Decision Types

| Тип решения | Кто решает | Процесс |
|---|---|---|
| Стратегические | Lead Maintainer + Core Team | Discussion → Decision → Doc |
| Архитектурные | Core Team | RFC → Review → ADR |
| Community | Community Council | Discussion → Vote |
| Бренд | Brand Committee | Proposal → Review → Decision |
| Routine | Maintainers | Direct action |

---

## Decision Process

### Lightweight RFC Process

Для значимых изменений:

```
1. Draft RFC (issue или doc)
2. Discussion period (≥ 1 week)
3. Revision based on feedback
4. Decision by responsible body
5. Document outcome (ADR or decision log)
```

### When RFC Required

| Требует RFC | Не требует RFC |
|---|---|
| Новая фича P0/P1 | Баг-фиксы |
| Изменение архитектуры | Docs updates |
| Breaking change | Style fixes |
| New dependency (major) | Dependency patch |

---

## Maintainer Responsibilities

| Обязанность | Описание |
|---|---|
| Review PRs | В срок по [[Contribution Model]] SLA |
| Triage issues | Приоритизация, labeling |
| Release management | Версионирование, changelog |
| Documentation | Поддержание актуальности |
| Mentoring | Помощь новым контрибьюторам |

---

## Maintainer Rights

| Право | Описание |
|---|---|
| Merge PRs | В своей зоне ответственности |
| Request changes | На любом PR |
| Veto | С обоснованием (может быть overridden) |
| Nominate | Новых maintainers |

---

## Conflict Resolution

```
Issue arises
  │
  ▼
Direct discussion between parties
  │
  ├── Resolved → Document
  │
  └── Not resolved → Core Team mediation
                       │
                       ├── Resolved → Document
                       │
                       └── Not resolved → Lead Maintainer decision
```

---

## Transparency

| Что | Где видно |
|---|---|
| Roadmap | [[Product Roadmap]] |
| Decisions | ADRs, decision log |
| Issues | GitHub Issues |
| Discussions | GitHub Discussions |
| Meetings | TBD (future) |

---

## Evolution

Governance будет эволюционировать по мере роста проекта:

| Стадия | Модель | Когда |
|---|---|---|
| Pre-MVP | BDFL-lite | Сейчас |
| MVP release | Core Team forming | Phase 3-4 |
| Community growth | Full governance | Phase 7 |
| Mature | Self-sustaining | Post-v1.0 |

---

## Links

- [[Open Source Strategy]]
- [[Contribution Model]]
- [[RFC Process]]
- [[Brand and Trademark Policy]]
- [[Фёдор/Corporate Architect]]

---

## Next Actions

1. Уточнить maintainer responsibilities
2. Создать decision log format
3. Начать Core Team формирование при первых контрибьюторах
