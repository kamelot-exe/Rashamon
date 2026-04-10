---
title: RFC Process
section: 07_COMMUNITY
updated: 2026-04-11
status: draft
---

# RFC Process

Процесс Request for Comments для значимых изменений в Rashamon.

---

## When RFC Required

| Сценарий | RFC? |
|---|---|
| Новая P0/P1 фича | ✅ |
| Изменение архитектуры | ✅ |
| Breaking change в API | ✅ |
| Новый major dependency | ✅ |
| Изменение file format | ✅ |
| Баг-фикс | ❌ |
| Docs update | ❌ |
| Style/format fix | ❌ |

---

## RFC Template

```markdown
# RFC-NNN: Short Title

**Author:** @username
**Status:** Draft | In Review | Accepted | Rejected | Superseded
**Created:** YYYY-MM-DD
**Decision By:** YYYY-MM-DD (2 weeks from creation)

## Summary

One paragraph summary.

## Motivation

Why is this change needed? What problem does it solve?

## Detailed Design

How does it work? Include diagrams if helpful.

## Alternatives Considered

What other approaches were considered? Why this one?

## Impact

- What breaks?
- Migration path?
- Performance impact?
- Documentation impact?

## Unresolved Questions

What's still TBD?

## Links
- Related issues
- Related docs
```

---

## Process

### 1. Draft

- Создать issue с label `RFC` или PR с RFC документом
- Написать по template
- Уведомить relevant maintainers

### 2. Discussion Period

- Минимум 1 неделя
- Комментарии от community
- Author revises based on feedback

### 3. Decision

- Responsible body принимает решение:
  - Architecture → Core Team
  - Strategy → Lead Maintainer
  - Community → Community Council
  - Brand → Brand Committee

### 4. Outcome

| Outcome | Что происходит |
|---|---|
| Accepted | Создаётся ADR (если technical); implementation начинается |
| Accepted with changes | Author вносит changes; maintainer approves |
| Rejected | Documented rationale; closed |
| Deferred | Revisit later; reasons documented |

---

## RFC Lifecycle

```
Draft → In Review → Accepted/Rejected
  │         │
  │         └──→ Revisions → In Review
  │
  └──→ Withdrawn (author)
```

---

## RFC Index

| ID | Title | Status | Decision Date |
|---|---|---|---|
| — | — | — | Пока нет RFC |

---

## Relationship to ADRs

| | RFC | ADR |
|---|---|---|
| Purpose | Propose change | Record decision |
| Timing | Before implementation | After decision |
| Format | Proposal | Decision record |
| Lifecycle | Draft → Accepted/Rejected | Accepted (immutable) |

RFC → Accepted → ADR created → Implementation

---

## Links

- [[Governance]]
- [[Contribution Model]]
- [[Open Source Strategy]]

---

## Next Actions

1. Создать GitHub issue template для RFC
2. Создать RFC index документ
3. Использовать process для первого significant change
