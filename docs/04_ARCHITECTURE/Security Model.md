---
title: Security Model
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Security Model

Модель безопасности Rashamon.

---

## Principles

| Принцип | Описание |
|---|---|
| Offline-first | Нет сетевых вызовов по умолчанию |
| User data = user control | Все данные локально, под контролем пользователя |
| Least privilege | Плагины и компоненты получают минимальные права |
| No telemetry by default | Никакой телеметрии без явного согласия |
| Transparent | Пользователь видит что происходит |

---

## Attack Vectors

### 1. Malicious Project Files

**Угроза**: .rdraw файл с вредоносным контентом

**Митигация**:
- JSON parsing — не execution
- Scene graph validation при загрузке
- No embedded scripts в MVP
- Asset validation (image format checking)

### 2. Plugin Abuse

**Угроза**: Плагин с вредоносным поведением

**Митигация**:
- Permission model (см. [[Plugin System]])
- Filesystem access — только с prompt пользователя
- Network access — только с prompt
- Resource limits (timeout, memory)
- Open source — community review

### 3. Supply Chain

**Угроза**: Компрометация зависимостей

**Митигация**:
- Lock files (pnpm-lock.yaml, Cargo.lock)
- Minimal dependencies
- Dependency auditing
- Reproducible builds (цель)

### 4. Tauri IPC

**Угроза**: Эксплуатация IPC между frontend и backend

**Митигация**:
- Tauri security defaults
- Command validation на Rust side
- No arbitrary code execution через IPC
- Type-safe bindings

---

## Data Privacy

### Что собирается

| Данные | Хранение | Отправка |
|---|---|---|---|
| Проекты | Локально | ❌ |
| Настройки | Локально | ❌ |
| История | Локально | ❌ |
| Crash reports | Локально | ❌ (opt-in в будущем) |
| Telemetry | ❌ | ❌ |

### Что НЕ собирается

- Usage statistics
- Identifiers
- Analytics
- Crash dumps (по умолчанию)
- Anything without explicit consent

---

## Plugin Security

### Permission Enforcement

```
Plugin requests filesystem access
  → Runtime checks permission manifest
  → If not granted → deny
  → If granted but no user prompt → prompt user
  → User approves → allow
  → User denies → deny + notify plugin
```

### Resource Limits

| Limit | Value |
|---|---|
| Execution timeout | 30 seconds |
| Memory limit | 500 MB per plugin |
| Network requests | Blocked by default |

### Plugin Review (future)

- Official registry — модерация
- Community plugins — sandboxed
- Security audit для популярных плагинов

---

## Tauri Security

### Configuration

```json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'",
      "dangerousRemoteModuleIpcAccess": false,
      "freezePrototype": true
    }
  }
}
```

### Capabilities (Tauri 2)

Tauri 2 capabilities system:

| Capability | Описание |
|---|---|
| `fs:allow-read` | Разрешить чтение ФС (explicit paths) |
| `fs:allow-write` | Разрешить запись ФС (explicit paths) |
| `shell:allow-open` | Открыть файл в system app |

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| No telemetry default | Privacy-first |
| Plugin permissions | Least privilege |
| No embedded scripts | Prevent code injection |
| CSP strict | Minimize XSS surface |

---

## Links

- [[Plugin System]]
- [[System Architecture]]
- [[Brand and Trademark Policy]]

---

## Next Actions

1. Настроить Tauri security config в Phase 1
2. Определить полный список plugin permissions
3. Создать threat model документ
