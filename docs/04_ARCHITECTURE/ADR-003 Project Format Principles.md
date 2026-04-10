---
title: ADR-003 Project Format Principles
section: 04_ARCHITECTURE
status: accepted
date: 2026-04-11
---

# ADR-003: Project Format Principles

## Status

✅ **Accepted**

## Context

Формат файлов проектов — критическое решение, влияющее на всё: от производительности до пользовательского опыта.

### Требования

- Читаемость (human-readable)
- Diff-ability (git-friendly)
- Portability (cross-platform)
- Extensibility (future features)
- Производительность (parse/serialize quickly)

### Варианты

| Формат | Плюсы | Минусы |
|---|---|---|
| JSON | Читаем, diff-able, легко парсить | Размер, нет binary data |
| XML | Структурирован, industry standard | Verbose, сложен |
| Binary | Компактный, быстрый | Не diff-able, не читаем |
| Custom DSL | Полный контроль | Парсинг, нет tooling |
| SQLite DB | Производительность, querying | Не portable, не diff-able |

## Decision

**JSON-based формат с inline base64 ассетами для MVP.**

### Format Structure

```
.rdraw  → JSON (Rashamon Draw)
.rphoto → JSON manifest + binary data (Rashamon Photo)
.rmotion → JSON manifest + references (Rashamon Motion)
```

### Principles

1. **Human-readable**: Можно открыть в текстовом редакторе и понять
2. **Git-friendly**: JSON diff-able в PR
3. **Self-contained**: Один файл содержит всё (для MVP)
4. **Versioned**: Поле `version` для миграции
5. **Extensible**: Дополнительные поля без breaking changes
6. **Validatable**: Schema validation при загрузке

### Post-MVP Evolution

| Улучшение | Когда | Зачем |
|---|---|---|
| Gzip compression (.rdrawz) | Phase 5+ | Размер файлов |
| External asset references | Phase 5+ | Большие ассеты |
| Incremental save | Phase 5+ | Производительность |
| SQLite backing | Photo/Motion | Binary data efficiency |

## Consequences

### Positive
- Простота реализации
- Легко отлаживать
- Git integration
- Community может редактировать файлы

### Risks
- Размер файлов с base64 (mitigation: compression в будущем)
- JSON parse time для больших документов (mitigation: streaming parser)
- Нет querying (mitigation: SQLite индекс в будущем)

## Links

- [[Project File Format]]
- [[Data Model]]
- [[System Architecture]]
