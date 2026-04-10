---
title: Naming Rules
section: 08_BRAND
updated: 2026-04-11
status: draft
---

# Naming Rules

Правила нейминга в экосистеме Rashamon.

---

## Product Naming

### Convention

```
Rashamon [Function]
```

| Продукт | Имя | Обоснование |
|---|---|---|
| Векторный редактор | Rashamon Draw | «Draw» — универсально, понятно |
| Растровый редактор | Rashamon Photo | «Photo» — охват фото/растр |
| Motion-дизайн | Rashamon Motion | «Motion» — моушн-графика |

### Rules

1. **Всегда** «Rashamon» + функциональный suffix
2. **Не** использовать аббревиатуры (не «RD», «RP»)
3. **Не** добавлять version в product name (не «Rashamon Draw 2026»)
4. **Не** создавать sub-sub brands (не «Rashamon Draw Pro»)

---

## Feature Naming

### Internal (code/docs)

| Convention | Пример |
|---|---|
| snake_case (Rust) | `scene_graph`, `undo_stack` |
| camelCase (TS) | `sceneGraph`, `undoStack` |
| kebab-case (files) | `scene-graph.rs`, `undo-stack.ts` |

### User-facing

| Convention | Пример |
|---|---|
| Title Case (UI) | «Branching History» |
| Descriptive, not clever | «Semantic Tags» не «Magic Labels» |
| Consistent terminology | Всегда «layer», не mix «layer»/«level» |

---

## File Naming

### Documents

| Convention | Пример |
|---|---|
| Title Case with spaces | `Product Vision.md` |
| Numbered directories | `01_VISION/`, `02_STRATEGY/` |

### Project Files

| Расширение | Описание |
|---|---|
| `.rdraw` | Rashamon Draw project |
| `.rphoto` | Rashamon Photo project |
| `.rmotion` | Rashamon Motion project |

---

## Version Naming

| Convention | Пример |
|---|---|
| SemVer | `0.1.0`, `1.0.0` |
| Pre-release | `0.1.0-alpha.1`, `0.1.0-beta.2` |
| Code names (optional) | `0.1.0 «Расёмон»` |

---

## Branch Naming (Git)

| Convention | Пример |
|---|---|
| Feature | `feat/ellipse-tool` |
| Fix | `fix/crash-on-undo` |
| Docs | `docs/mvp-scope-update` |
| Chore | `chore/ci-config-update` |
| Release | `release/0.1.0` |

---

## Naming Anti-Patterns

| Anti-pattern | Почему плохо | Лучше |
|---|---|---|
| «RashamonDraw» (no space) | Lose brand recognition | «Rashamon Draw» |
| «RD» (abbreviation) | Неоднозначно | «Draw» |
| «Magic Canvas» | Too cutesy | «Semantic Canvas» |
| «SuperRectTool» | Too long, cutesy | «Rectangle Tool» |
| Japanese names for features | Inconsistent, unclear | English descriptive |

---

## Glossary Alignment

Все термины должны соответствовать [[Glossary]].

| Термин | Определение |
|---|---|
| Scene Graph | Иерархическая модель объектов |
| Semantic Canvas | Холст с семантическими метаданными |
| Branching History | Графовая история проектов |
| Document Model | Структура данных документа |

---

## Links

- [[Brand Core]]
- [[Glossary]]
- [[Voice and Tone]]

---

## Next Actions

1. Согласовать naming conventions с командой
2. Добавить в CONTRIBUTING guide
3. Проверить существующие имена на соответствие
