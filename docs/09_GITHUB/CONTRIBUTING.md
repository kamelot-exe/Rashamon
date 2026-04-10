---
title: CONTRIBUTING
section: 09_GITHUB
updated: 2026-04-11
status: draft
---

# Contributing to Rashamon

Спасибо за интерес к Rashamon! Этот документ описывает, как внести вклад.

---

## Quick Start

1. **Fork** репозиторий
2. **Clone** локально: `git clone https://github.com/YOUR_USERNAME/Rashamon.git`
3. **Setup** окружение:
   ```bash
   cd Rashamon
   # Install Rust (if not installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   # Install pnpm
   corepack enable
   pnpm install
   ```
4. **Run** dev mode:
   ```bash
   pnpm dev
   ```
5. **Find** a [good-first-issue](https://github.com/kamelot-exe/Rashamon/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue)
6. **Code** → **Test** → **PR**

---

## Before You Contribute

### Read These First

- [[Project Vision]] — зачем мы это делаем
- [[Product Philosophy]] — наши принципы
- [[Non-Goals]] — что мы НЕ делаем

### Check Existing Issues

Перед созданием нового issue:
1. Проверьте [существующие issues](https://github.com/kamelot-exe/Rashamon/issues)
2. Если ваш issue уже есть — прокомментируйте его, не создавайте дубликат

---

## How to Contribute

### Bug Reports

1. Создайте issue с label `bug`
2. Включите:
   - OS и версию (Ubuntu 22.04, Fedora 37, etc.)
   - Шаги воспроизведения
   - Ожидаемое vs фактическое поведение
   - Screenshots если применимо
   - Logs если есть

### Feature Requests

1. Создайте issue с label `enhancement`
2. Опишите:
   - Какую проблему решает фича
   - Как она должна работать
   - Примеры использования
3. Для крупных изменений — используйте [[RFC Process]]

### Code Changes

1. **Branch** от `main`
2. **Code** following project conventions
3. **Test** locally
4. **PR** с описанием

### Documentation

1. Документация в `docs/` (Obsidian vault)
2. PRs к documentation приветствуются
3. Следуйте [[Voice and Tone]] guidelines

---

## Code Standards

### Rust

```bash
cargo fmt --all        # Format
cargo clippy --all     # Lint
cargo test --all       # Test
```

### TypeScript

```bash
pnpm lint              # ESLint
pnpm type-check        # tsc --noEmit
pnpm test              # Tests
```

### General

- Следуйте существующему стилю
- Пишите комментарии к сложной логике
- Обновляйте документацию при изменении API

---

## Pull Request Process

1. Убедитесь что CI проходит
2. Заполните PR template
3. Свяжите с issue (если есть): «Fixes #123»
4. Ждите review (SLA: 48h для bug fixes, 1 week для features)
5. Ответьте на comments
6. После approval — merge

---

## Commit Messages

Мы используем [Conventional Commits](https://www.conventionalcommits.org/):

```
type: short description

Longer description if needed.

Fixes #123
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

---

## Communication

| Канал | Для чего |
|---|---|
| [GitHub Issues](https://github.com/kamelot-exe/Rashamon/issues) | Bug reports, feature requests |
| [GitHub Discussions](https://github.com/kamelot-exe/Rashamon/discussions) | Questions, ideas |
| [Discord/Matrix] (TBD) | Real-time chat |

---

## Code of Conduct

Мы следуем [[CODE_OF_CONDUCT]]. Будьте уважительны.

---

## Recognition

Все контрибьюторы перечислены в `CONTRIBUTORS.md`. Значимые вклады упоминаются в release notes.

---

## Questions?

Если что-то непонятно:
1. Проверьте [[Contribution Model]]
2. Спросите в GitHub Discussions
3. Спросите в issue

---

## Links

- [[Open Source Strategy]]
- [[Governance]]
- [[Definition of Done]]
- [[RFC Process]]
