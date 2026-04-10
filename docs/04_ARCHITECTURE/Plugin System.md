---
title: Plugin System
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Plugin System

Архитектура системы плагинов Rashamon.

---

## Vision

Плагины Rashamon — **первоклассные граждане** с доступом к структурированному API ядра.

---

## Plugin Types

### 1. Action Plugins

Выполняют действия над документом:

```typescript
// Пример: плагин «Выровнять по центру»
plugin.onAction('center-selection', async (ctx) => {
  const selection = await ctx.document.getSelection();
  const canvas = await ctx.document.getCanvas();
  for (const obj of selection) {
    obj.transform.x = (canvas.width - obj.width) / 2;
    obj.transform.y = (canvas.height - obj.height) / 2;
  }
  await ctx.document.save();
});
```

### 2. Tool Plugins

Добавляют инструменты в toolbar:

```typescript
plugin.onTool('custom-shape', {
  icon: 'shape.svg',
  cursor: 'crosshair',
  onCanvasClick: async (ctx, x, y) => {
    await ctx.document.createShape({
      type: 'rect',
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
    });
  },
});
```

### 3. Export Plugins

Добавляют форматы экспорта:

```typescript
plugin.onExport('pdf', async (ctx, options) => {
  const doc = await ctx.document.serialize();
  return generatePdf(doc, options);
});
```

### 4. Effect Plugins (post-MVP)

Добавляют параметрические эффекты:

```typescript
plugin.onEffect('my-blur', {
  parameters: { radius: { type: 'number', min: 0, max: 100, default: 5 } },
  apply: async (ctx, nodeId, params) => {
    return { type: 'effect', name: 'my-blur', params };
  },
});
```

---

## Plugin Manifest

```json
{
  "name": "align-tools",
  "displayName": "Align Tools",
  "version": "1.0.0",
  "description": "Additional alignment tools",
  "author": "community",
  "license": "MIT",
  "minRashamonVersion": "0.1.0",
  "permissions": ["document:read", "document:write", "selection:read"],
  "entry": "dist/index.js",
  "ui": "dist/ui.js"
}
```

---

## Permissions

| Permission | Описание |
|---|---|
| `document:read` | Чтение документа |
| `document:write` | Изменение документа |
| `selection:read` | Чтение выделенияя |
| `selection:write` | Изменение выделения |
| `assets:read` | Чтение ассетов |
| `assets:write` | Добавление ассетов |
| `filesystem:read` | Чтение файловой системы (с prompt) |
| `filesystem:write` | Запись в файловую систему (с prompt) |
| `network` | Сетевые запросы (с prompt) |

---

## Plugin Runtime Architecture

```
┌─────────────────────────────┐
│        Plugin Manager        │
│  - Load/unload plugins       │
│  - Permission enforcement    │
│  - Event routing             │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│       Plugin Sandbox         │
│  - Isolated execution        │
│  - Resource limits           │
│  - Timeout handling          │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│       Plugin API             │
│  - document.*                │
│  - selection.*               │
│  - ui.*                      │
│  - export.*                  │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│       Rust Core              │
│  - Actual operations         │
│  - Validation                │
└─────────────────────────────┘
```

---

## Plugin Distribution

### Built-in

- Поставляются с Rashamon
- Полный доступ
- Не могут быть удалены

### Community (Phase 6+)

- GitHub Releases / npm packages
- Plugin manager UI для установки
- Sandboxed execution

### Official Registry (post-Phase 7)

- Модерируемый репозиторий
- «Official Rashamon plugin» badge
- Верификация безопасности

---

## Plugin API Surface (MVP)

```typescript
interface PluginContext {
  document: {
    getSelection(): Promise<SceneNode[]>;
    createShape(shape: ShapeSpec): Promise<SceneNode>;
    deleteNode(id: NodeId): Promise<void>;
    updateNode(id: NodeId, changes: Partial<SceneNode>): Promise<void>;
    getCanvas(): Promise<Canvas>;
    save(): Promise<void>;
  };
  ui: {
    showToast(message: string): void;
    showDialog(component: ReactComponent): Promise<any>;
  };
  app: {
    version: string;
    platform: string;
  };
}
```

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| TS для плагинов | Same language as frontend; accessible |
| Permission model | Безопасность без полного sandboxing |
| Manifest-based | Декларативное описание возможностей |
| Rust core validation | Плагины не могут сломать документ |

---

## Links

- [[System Architecture]]
- [[Shared Platform]]
- [[Security Model]]

---

## Next Actions

1. Определить полный список permissions
2. Спроектировать plugin manager UI
3. Создать 2-3 example plugins для MVP
