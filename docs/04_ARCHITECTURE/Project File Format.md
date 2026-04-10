---
title: Project File Format
section: 04_ARCHITECTURE
updated: 2026-04-11
status: draft
---

# Project File Format

Формат файлов проектов Rashamon.

---

## Principles

См. [[ADR-003 Project Format Principles]]

---

## Format: .rdraw (Rashamon Draw)

### Structure

`.rdraw` файл — это **JSON с встроенными ассетами** (base64):

```json
{
  "format": "rashamon-draw",
  "version": "0.1.0",
  "metadata": {
    "title": "Untitled",
    "author": "",
    "description": "",
    "tags": [],
    "createdAt": "2026-04-11T00:00:00Z",
    "modifiedAt": "2026-04-11T00:00:00Z"
  },
  "canvas": {
    "width": 1920,
    "height": 1080,
    "background": "#FFFFFF",
    "units": "px",
    "colorProfile": "sRGB"
  },
  "scene": {
    "id": "root-001",
    "type": "group",
    "name": "Root",
    "children": [
      {
        "id": "rect-001",
        "type": "shape",
        "geometry": {
          "type": "rect",
          "width": 200,
          "height": 100,
          "cornerRadius": 0
        },
        "fill": { "type": "solid", "color": "#3B82F6" },
        "stroke": null,
        "transform": { "x": 100, "y": 100, "scaleX": 1, "scaleY": 1, "rotation": 0 },
        "opacity": 1.0,
        "visible": true,
        "locked": false,
        "semanticTags": ["ui-element"],
        "semanticRole": "button"
      }
    ]
  },
  "history": {
    "states": [
      {
        "id": "state-001",
        "timestamp": "2026-04-11T00:00:00Z",
        "description": "Initial state",
        "snapshot": "..."
      }
    ],
    "currentIndex": 0
  },
  "assets": {
    "images": [],
    "fonts": []
  },
  "config": {
    "grid": { "enabled": false, "spacing": 10 },
    "guides": [],
    "snaps": { "enabled": true, "tolerance": 5 }
  }
}
```

---

## Format: .rphoto (Rashamon Photo) — Draft

```json
{
  "format": "rashamon-photo",
  "version": "0.1.0",
  "metadata": { },
  "canvas": { },
  "layers": [
    {
      "id": "layer-001",
      "type": "image",
      "assetRef": "img-001",
      "adjustments": [],
      "mask": null,
      "opacity": 1.0,
      "visible": true,
      "blendMode": "normal"
    }
  ],
  "history": { },
  "assets": {
    "images": [
      {
        "id": "img-001",
        "format": "png",
        "data": "base64..."
      }
    ]
  }
}
```

---

## Format: .rmotion (Rashamon Motion) — Draft

```json
{
  "format": "rashamon-motion",
  "version": "0.1.0",
  "metadata": { },
  "timeline": {
    "duration": 5000,
    "fps": 30,
    "layers": [
      {
        "id": "layer-001",
        "source": { "type": "file", "path": "design.rdraw" },
        "keyframes": [
          {
            "time": 0,
            "properties": { "x": 0, "y": 0, "opacity": 1 }
          },
          {
            "time": 1000,
            "properties": { "x": 100, "y": 50, "opacity": 0.5 },
            "easing": "ease-in-out"
          }
        ]
      }
    ]
  },
  "assets": { }
}
```

---

## File Size Optimization

### Для MVP

- JSON без сжатия — читаемо, diff-able
- Ассеты — base64 inline (просто, но увеличивает размер)

### Post-MVP

- Опция: `.rdrawz` — gzip-compressed JSON
- Ассеты — external references (не inline)
- Incremental save (только изменения)

---

## Migration Strategy

| Сценарий | Подход |
|---|---|
| Minor version update | Forward-compatible; старые открываются |
| Major version update | Migration script; backup original |
| Unknown future format | Error message with suggestion to update |

---

## Validation

При загрузке файла:

1. Проверка `format` field
2. Проверка `version` совместимости
3. Schema validation
4. Asset integrity check
5. Scene graph consistency check

---

## Key Decisions

| Решение | Обоснование |
|---|---|
| JSON format | Читаемо, diff-able, легко парсить |
| Base64 ассеты inline | Простота для MVP; один файл |
| Структурированная история | Поддержка graph history в будущем |
| Semantic roles | Машиночитаемые роли объектов |

---

## Assumptions

- Base64 overhead acceptable для MVP-размеров файлов
- JSON parsing достаточно быстр для типичных документов
- В будущем потребуется сжатие и external assets

---

## Links

- [[ADR-003 Project Format Principles]]
- [[Data Model]]
- [[System Architecture]]

---

## Next Actions

1. Реализовать serde schema для .rdraw
2. Создать test fixtures с валидными файлами
3. Написать validation logic
