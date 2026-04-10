---
title: Release Strategy
section: 02_STRATEGY
updated: 2026-04-11
status: draft
---

# Release Strategy

Стратегия версионирования, релизов и дистрибуции Rashamon.

---

## Версионирование

### Semantic Versioning (SemVer)

Rashamon использует [SemVer 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Компонент | Когда увеличивается |
|---|---|
| MAJOR | Breaking changes в API или формате проектов |
| MINOR | Новые фичи с обратной совместимостью |
| PATCH | Баг-фиксы |

### Pre-release tags

| Тег | Значение |
|---|---|
| `-alpha` | Внутреннее тестирование; нестабильно |
| `-beta` | Публичное тестирование; известно о багах |
| `-rc` | Кандидат в релизы; freeze |

### Примеры

```
0.1.0-alpha.1    — первый alpha
0.1.0-beta.1     — первый beta
0.1.0-rc.1       — кандидат
0.1.0            — стабильный релиз
1.0.0            — первый major release
```

---

## Release Channels

| Канал | Частота | Аудитория | Стабильность |
|---|---|---|---|
| Nightly | Ежедневно (auto) | Разработчики | Низкая |
| Alpha | Еженедельно | Early adopters | Средняя |
| Beta | Перед каждым релизом | Тестировщики | Высокая |
| Stable | По готовности | Все пользователи | Максимальная |

---

## Форматы дистрибуции

### Linux (приоритет)

| Формат | Priority | Notes |
|---|---|---|
| AppImage | P0 | Portable; работает везде |
| Flatpak (Flathub) | P0 | Sandboxed; wide distribution |
| .deb (APT) | P1 | Debian/Ubuntu native |
| .rpm (DNF) | P1 | Fedora/RHEL native |
| Nix/NixOS | P2 | Для Nix-комьюнити |
| Arch AUR | P2 | Community-maintained |

### macOS (позже)

| Формат | Notes |
|---|---|
| .dmg | Standard disk image |
| Homebrew | `brew install --cask rashamon-draw` |

### Windows (позже)

| Формат | Notes |
|---|---|
| .exe (NSIS) | Standard installer |
| winget | Windows Package Manager |

---

## Release Process

### Pre-release checklist

- [ ] Все тесты проходят
- [ ] Build на всех target-платформах
- [ ] CHANGELOG.md обновлён
- [ ] Версия bumped
- [ ] Release notes написаны
- [ ] Smoke tests на каждой платформе
- [ ] Tag создан и запушен

### Stable release checklist

- [ ] Beta-период ≥ 2 недели без critical bugs
- [ ] Все blocking issues закрыты
- [ ] Документация обновлена
- [ ] Migration guide (если MAJOR)
- [ ] Website/landing page обновлены
- [ ] Announcement post

---

## Update Mechanism

### Auto-update

- Tauri updater для Stable канала
- Пользователь контролирует когда обновлять
- No forced updates

### Manual update

- Скачивание с GitHub Releases
- Установка через пакетный менеджер

---

## Backward Compatibility

### Project files

| Изменение | Политика |
|---|---|
| PATCH | Полная совместимость |
| MINOR | Forward-compatible; старые файлы открываются |
| MAJOR | Migration guide; возможна конвертация |

### Plugin API

| Изменение | Политика |
|---|---|
| MINOR | Добавление, не удаление |
| MAJOR | Deprecation warning ≥ 1 minor release |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| SemVer | Стандарт де-факто; понятный |
| AppImage + Flatpak priority | Maximum coverage на Linux |
| No forced updates | Уважение к пользователю |
| Nightly channel | Ранний feedback от разработчиков |

---

## Links

- [[Product Roadmap]]
- [[Delivery Phases]]
- [[MVP Scope]]

---

## Next Actions

1. Настроить CI/CD для nightly builds в Phase 1
2. Создать CHANGELOG.md
3. Настроить Tauri updater
