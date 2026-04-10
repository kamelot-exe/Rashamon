---
title: ADR-002 MVP Product Order
section: 04_ARCHITECTURE
status: accepted
date: 2026-04-11
---

# ADR-002: MVP Product Order

## Status

✅ **Accepted**

## Context

Rashamon — экосистема продуктов. Нужно определить порядок разработки.

### Варианты

| Порядок | Аргументы за | Аргументы против |
|---|---|---|
| Draw → Photo → Motion | Наименьший MVP; архитектура для всех | Векторный редактор конкурентен |
| Photo → Draw → Motion | Больше аудитория фотографов | Сложнее MVP (GPU, image processing) |
| Motion → Draw → Photo | Уникальная ниша | Зависит от Draw assets; сложный MVP |
| Все параллельно | Быстрее экосистема | Распыление ресурсов |

## Decision

**Порядок: Draw → Photo → Motion**

### Rationale

1. **Draw первый**:
   - Наименьший scope для MVP (базовые фигуры + свойства)
   - Максимальная архитектурная ценность (document model, scene graph, history)
   - Core для всей платформы (shared platform)
   - Векторный UI — основа для Motion

2. **Photo второй**:
   - Может re-use shared platform
   - Другая аудитория → расширение базы пользователей
   - GPU rendering — новый вызов, но после стабильной платформы

3. **Motion третьим**:
   - Зависит от Draw (импорт .rdraw)
   - Зависит от Photo (импорт .rphoto)
   - Наиболее сложный продукт из трёх

## Consequences

### Positive
- Чёткий фокус на одном продукте
- Архитектура Draw = foundation для остальных
- Ранний feedback от Draw MVP

### Risks
- Задержка Photo/Motion если Draw затянется (mitigation: фадированная доставка)
- Потеря интереса аудитории Photo (mitigation: community engagement)

## Links

- [[Product Roadmap]]
- [[MVP Scope]]
- [[Rashamon Draw]]
