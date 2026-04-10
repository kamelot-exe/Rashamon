---
title: Definition of Done
section: 05_EXECUTION
updated: 2026-04-11
status: draft
---

# Definition of Done

Критерии готовности для задач, фич и релизов Rashamon.

---

## Task Level (User Story)

Задача считается **Done**, когда:

- [ ] Код написан и соответствует acceptance criteria
- [ ] Код протестирован (unit tests для Rust, component tests для TS)
- [ ] CI проходит (lint, type-check, test, build)
- [ ] Code review пройден (≥ 1 approval)
- [ ] Документация обновлена (если применимо)
- [ ] Не нарушает [[Product Philosophy]] принципы
- [ ] Не добавляет [[Non-Goals]] функциональность
- [ ] Запушено в main (или feature branch merged)

---

## Feature Level

Фича считается **Done**, когда:

- [ ] Все связанные задачи — Done
- [ ] Integration tests проходят
- [ ] Ручное тестирование на Linux (Wayland + X11)
- [ ] Нет известных critical/regression багов
- [ ] Performance target достигнут (если определён)
- [ ] Accessibility базовый (keyboard navigation)
- [ ] Error handling для edge cases

---

## Phase Level

Фаза считается **Done**, когда:

- [ ] Все [[Delivery Phases]] exit criteria выполнены
- [ ] [[Milestones]] критерии достигнуты
- [ ] smoke tests на всех target платформа
- [ ] CHANGELOG.md обновлён
- [ ] Документация обновлена
- [[Риски]] re-assessed

---

## Release Level

Релиз считается **Ready**, когда:

- [ ] Beta-период ≥ 2 недели без critical bugs
- [ ] Все blocking issues закрыты
- [ ] [[Release Strategy]] checklist пройден
- [ ] Build на всех target платформах
- [ ] Release notes написаны
- [ ] Website/landing page обновлены
- [ ] Announcement готов

---

## Quality Gates

### Code Quality

| Check | Tool |
|---|---|
| Rust lint | `cargo clippy` |
| Rust format | `cargo fmt --check` |
| TS lint | ESLint |
| TS type-check | `tsc --noEmit` |
| Code format | Prettier |

### Tests

| Type | Target |
|---|---|
| Unit tests (Rust) | ≥ 70% coverage core modules |
| Unit tests (TS) | ≥ 60% coverage UI modules |
| Integration tests | Core user flows |
| Manual tests | Linux Wayland + X11 |

### Philosophy Check

Каждая фича должна пройти проверку:

| Вопрос | Источник |
|---|---|
| Соответствует [[Product Philosophy]]? | Философия |
| Не является [[Non-Goals]]? | Non-Goals |
| Добавляет ли ценность для пользователя? | [[Project Vision]] |
| Не нарушает архитектуру? | [[System Architecture]] |

---

## Anti-Patterns (Not Done)

| Паттерн | Почему не Done |
|---|---|
| «Код работает, но нет тестов» | Нет гарантии от регрессий |
| «Тесты есть, но CI падает» | Broken build = broken product |
| «CI проходит, но не ручное тестирование» | CI не ловит всё |
| «Работает, но нарушает философию» | Технически done, стратегически wrong |
| «Done на моей машине» | Должно работать на target platforms |

---

## Links

- [[Backlog Structure]]
- [[Delivery Phases]]
- [[Product Philosophy]]
- [[Risks]]

---

## Next Actions

1. Добавить этот документ в PR template
2. Использовать как checklist при ревью
3. Обновлять при изменении процесса
