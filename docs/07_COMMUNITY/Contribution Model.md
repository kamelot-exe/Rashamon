---
title: Contribution Model
section: 07_COMMUNITY
updated: 2026-04-11
status: draft
---

# Contribution Model

Модель контрибуции в Rashamon: как участвовать, что ожидать, как расти.

---

## Getting Started

### For Developers

1. **Read** [[Project Vision]] и [[Product Philosophy]] — понимай зачем
2. **Check** [[Backlog Structure]] — найди задачу
3. **Fork** репозиторий
4. **Setup** локальное окружение (инструкция будет в CONTRIBUTING)
5. **Pick** a good-first-issue
6. **Code** → Test → PR

### For Non-Developers

| Способ | Описание |
|---|---|
| Documentation | Улучшай доки, пиши tutorials |
| Testing | Тестируй, создавай bug reports |
| Translation | Переводи интерфейс и доки |
| Design | Предлагай UI improvements |
| Community | Помогай другим, модерируй |

---

## PR Guidelines

### Before PR

- [ ] Issue существует и обсуждён (для non-trivial changes)
- [ ] Branch создан от main
- [ ] Локально всё работает

### PR Requirements

- [ ] Clear title: `type: short description`
- [ ] Description: что, почему, как
- [ ] Tests added/updated
- [ ] CI passes
- [ ] Docs updated (if applicable)

### PR Types

| Type | Описание | Пример |
|---|---|---|
| `feat` | Новая фича | `feat: add ellipse tool` |
| `fix` | Баг-фикс | `fix: crash on undo` |
| `docs` | Документация | `docs: clarify MVP scope` |
| `refactor` | Рефакторинг | `refactor: simplify scene graph` |
| `test` | Тесты | `test: add document model tests` |
| `chore` | Инфраструктура | `chore: update CI config` |
| `style` | Форматирование | `style: run prettier` |

---

## Code Review

### Reviewer Checklist

- [ ] Код понятен и соответствует стилю проекта
- [ ] Тесты покрывают изменения
- [ ] CI проходит
- [ ] Не нарушает [[Product Philosophy]]
- [ ] Не добавляет [[Non-Goals]]
- [ ] Документация обновлена

### Review SLA

| Тип | Время ревью |
|---|---|
| Bug fix | 48 часов |
| Feature | 1 неделя |
| Docs | 1 неделя |
| Minor | 24 часа |

---

## Contributor Growth

### Path to Trusted Contributor

1. ≥ 5 merged PRs с хорошим качеством
2. Понимание архитектуры проекта
3. Активность в discussions
4. Рекомендация от maintainer

### Path to Maintainer

1. ≥ 20 merged PRs
2. Глубокое понимание至少 одного модуля
3. Активный review чужих PRs
4. Номинирование current maintainer
5. Approval от core maintainers

---

## Recognition

| Формат | Описание |
|---|---|
| CONTRIBUTORS.md | Список всех контрибьюторов |
| Release notes | Упоминание значимых вкладов |
| GitHub badges | Recognized Contributor badge |

---

## Links

- [[Open Source Strategy]]
- [[Definition of Done]]
- [[Governance]]

---

## Next Actions

1. Создать CONTRIBUTING.md в корне репо
2. Добавить good-first-issue标签
3. Создать PR template
