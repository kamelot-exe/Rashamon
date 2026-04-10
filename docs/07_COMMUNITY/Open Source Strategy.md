---
title: Open Source Strategy
section: 07_COMMUNITY
updated: 2026-04-11
status: draft
---

# Open Source Strategy

Стратегия open source развития Rashamon.

---

## Philosophy

Rashamon — **open source by default**, не open source as marketing.

Это означает:

- Код открыт с первого дня
- Разработка прозрачна (public issues, public roadmap)
- Форки разрешены и ожидаемы
- Бренд управляется отдельно от кода

---

## License

### Status: TBD

Лицензия ещё не выбрана. Варианты:

| Лицензия | Плюсы | Минусы |
|---|---|---|
| MIT | Максимальная свобода, простая | Нет защиты от патентов |
| Apache-2.0 | Patent grant, совместима с GPL | Сложнее |
| GPL-3.0 | Копилефт — форки тоже open source | Может отпугнуть commercial users |
| MPL-2.0 | File-level copyleft | Менее известна |

### Recommendation

**Apache-2.0** — баланс между свободой, защитой патентов и совместимостью.

> ⚠️ Финальное решение требует обсуждения с [[Фёдор|Фёдором]] и legal consultation.

---

## Contribution Model

### Types of Contributions

| Type | Описание | Как |
|---|---|---|
| Code | Features, bug fixes | PRs к relevant package |
| Docs | Documentation, tutorials | PRs к docs/ |
| Design | UI, icons, visual assets | PRs к assets/ |
| Translation | Локализация интерфейса | PRs к i18n/ |
| Testing | Bug reports, test cases | Issues, test PRs |
| Community | Helping others, moderation | Community channels |

### Contribution Flow

```
User finds issue or has idea
  │
  ▼
Check existing issues / discussions
  │
  ▼
Create issue (if new)
  │
  ▼
Discuss approach (if needed)
  │
  ▼
Fork → Branch → Code → Test
  │
  ▼
Create PR
  │
  ▼
CI checks
  │
  ▼
Review by maintainer
  │
  ▼
Merge → Release notes
```

---

## Contributor Tiers

| Tier | Описание | Права |
|---|---|---|
| User | Использует Rashamon | Issues, discussions |
| Contributor | Контрибьютит код/доки | PRs |
| Trusted Contributor | Регулярные качественные контрибуции | Direct commit к non-critical |
| Maintainer | Ключевой участник | Review, merge, decisions |
| Core Maintainer | Стратегические решения | Architecture, releases, governance |

---

## Governance Integration

Open source стратегия интегрирована с [[Governance]]:

- Maintainers управляются через governance model
- Решения документируются публично
- RFC process для крупных изменений
- Community input через discussions

---

## Community Building

### Principles

| Принцип | Описание |
|---|---|
| Welcoming | Friendly to newcomers |
| Transparent | Decisions visible |
| Meritocratic | Influence через contributions |
| Respectful | Follow [[CODE_OF_CONDUCT]] |

### Channels (future)

| Channel | Purpose |
|---|---|
| GitHub Discussions | Q&A, ideas |
| Discord/Matrix | Real-time chat |
| Blog | Announcements, deep dives |
| Newsletter | Periodic updates |

---

## Links

- [[Contribution Model]]
- [[Governance]]
- [[Fork Policy]]
- [[RFC Process]]
- [[Brand and Trademark Policy]]

---

## Next Actions

1. Выбрать лицензию
2. Создать CONTRIBUTING guide
3. Настроить GitHub templates
4. Открыть discussions
