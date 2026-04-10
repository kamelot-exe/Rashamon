---
title: Fork Policy
section: 07_COMMUNITY
updated: 2026-04-11
status: draft
---

# Fork Policy

Политика форков Rashamon — что разрешено, что ожидается, что запрещено.

---

## Forking Rights

### Код

Rashamon — open source проект. Лицензия (TBD) разрешает:

| Право | Описание |
|---|---|
| Форкнуть код | ✅ Да |
| Модифицировать | ✅ Да |
| Распространять | ✅ Да (по условиям лицензии) |
| Коммерческое использование | ✅ Да (по условиям лицензии) |

### Бренд

Бренд Rashamon **не включён** в права форка:

| Право | Описание |
|---|---|
| Использовать имя «Rashamon» | ❌ Нет |
| Использовать официальные логотипы | ❌ Нет |
| Сказать «based on Rashamon» | ✅ Да |
| Использовать собственное имя | ✅ Обязательно |

См. [[Brand and Trademark Policy]].

---

## Types of Forks

### 1. Code Fork (Development)

**Цель**: Разработка альтернативной версии

| Аспект | Политика |
|---|---|
| Разрешено | ✅ |
| Именование | Сwoё имя; «based on Rashamon» OK |
| Логотипы | Сwoи |
| Обратная совместимость | На усмотрение форка |

### 2. Community Fork

**Цель**: Разделение комьюнити по direction

| Аспект | Политика |
|---|---|
| Разрешено | ✅ |
| Отношение основного проекта | Neutral/respectful |
| Кросс-контрибуция | Возможна по договорённости |
| Цитирование | Указывать origin |

### 3. Hostile Fork

**Цель**: Конкуренция с оригиналом

| Аспект | Политика |
|---|---|
| Разрешено | ✅ (по лицензии) |
| Именование | Сwoё имя обязательно |
| Официальный бренд | ❌ Запрещено |
| Отношение | На усмотрение форка |

---

## Expectations от Форков

### Мы ожидаем

| Expectation | Описание |
|---|---|
| Честное атрибутирование | «Based on Rashamon» |
| Собственный брендинг | Сwoё имя, логотип |
| Следование лицензии | Все условия выполнены |

### Мы НЕ ожидаем

| Non-expectation | Описание |
|---|---|
| Обратная контрибуция | Форк не обязан возвращать changes |
| Совместимость | Форк может diverge |
| Одобрение | Форк не нуждается в нашем одобрении |

---

## Re-integration

Форк может быть re-integrated в основной проект:

```
Fork development
  │
  ▼
Fork author proposes integration
  │
  ▼
Core Team reviews
  │
  ├── Accepted → Changes merged → Credit given
  │
  └── Rejected → Reasons documented; fork continues
```

---

## Notable Forks

| Fork | Status | Notes |
|---|---|---|
| — | — | Пока нет форков |

---

## Enforcement

Нарушение brand policy (использование имени Rashamon без разрешения):

1. **Notice** — уведомление форк-автору
2. **Discussion** — диалог о решении
3. **Formal request** — официальное требование
4. **Legal action** — если trademark зарегистрирован и нарушение продолжается

См. [[Brand and Trademark Policy]].

---

## Links

- [[Brand and Trademark Policy]]
- [[Governance]]
- [[Open Source Strategy]]

---

## Next Actions

1. Согласовать policy с legal consultant
2. Добавить Fork Policy в документацию репо
3. Обновлять при регистрации trademark
