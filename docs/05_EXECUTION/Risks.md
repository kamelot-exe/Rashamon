---
title: Risks
section: 05_EXECUTION
updated: 2026-04-11
status: draft
---

# Risks

Реестр рисков проекта Rashamon.

---

## Technical Risks

| ID | Риск | Вероятность | Влияние | Митигация | Статус |
|---|---|---|---|---|---|
| T1 | Tauri 2 нестабилен на Linux | Средняя | Высокое | Мониторить issues; fallback на Electron | 🟡 |
| T2 | SVG rendering не тянет 500+ объектов | Средняя | Высокое | LOD strategy; Canvas fallback; WebGL | 🟡 |
| T3 | Rust learning curve замедляет | Высокая | Средняя | Документация; pair programming | 🟢 |
| T4 | JSON file format слишком медленный для больших документов | Низкая | Средняя | Streaming parser; compression later | 🟢 |
| T5 | Plugin API слишком open или too restrictive | Средняя | Средняя | Итеративный дизайн API; feedback от devs | 🟡 |

---

## Product Risks

| ID | Риск | Вероятность | Влияние | Митигация | Статус |
|---|---|---|---|---|---|
| P1 | MVP scope creep — слишком много фич | Высокая | Высокое | [[Non-Goals]] как фильтр; строгий [[MVP Scope]] | 🟡 |
| P2 | Недостаточно дифференциации в MVP | Средняя | Средняя | Фокус на semantic canvas + history | 🟡 |
| P3 | UX недостаточно удобен | Средняя | Высокое | Phase 4 — usability layer; user testing | 🟡 |
| P4 | Конкуренты выпустят Linux-версию | Низкая | Высокое | Строим комьюнити и дифференциацию | 🟢 |

---

## Resource Risks

| ID | Риск | Вероятность | Влияние | Митигация | Статус |
|---|---|---|---|---|---|
| R1 | Недостаточно контрибьюторов | Средняя | Высокое | AI-assisted dev; чёткая документация; welcoming community | 🟡 |
| R2 | Burnout maintainer | Средняя | Критическое | Распределение ответственности; automation | 🟡 |
| R3 | Финансирование (если потребуется) | Низкая | Средняя | Open source; гранты; спонсорство | 🟢 |

---

## Community Risks

| ID | Риск | Вероятность | Влияние | Митигация | Статус |
|---|---|---|---|---|---|
| C1 | Токсичное комьюнити | Низкая | Высокое | [[CODE_OF_CONDUCT]]; модерация | 🟢 |
| C2 | Форк фрагментирует комьюнити | Средняя | Высокое | [[Fork Policy]]; прозрачный governance | 🟡 |
| C3 | Brand confusion | Средняя | Средняя | [[Brand and Trademark Policy]] | 🟡 |

---

## Strategic Risks

| ID | Риск | Вероятность | Влияние | Митигация | Статус |
|---|---|---|---|---|---|
| S1 | Экосистемный подход слишком амбициозен | Средняя | Высокое | Фокус на Draw first; остальные — когда готово | 🟡 |
| S2 | Linux-only niche слишком мала | Низкая | Средняя | macOS/Windows позже; Linux — достаточная база | 🟢 |
| S3 | AI generative tools заменят creative software | Средняя | Высокое | AI as assist, not replacement; workflow differentiation | 🟡 |

---

## Risk Matrix

```
Влияние
  High │  P2  P3    T2    R1  R2  S1  S3
       │  C2  C3    T1
───────┼─────────────────────────────────
  Med  │        T3  T4  T5    P4  R3  S2
       │        C1
───────┼─────────────────────────────────
  Low  │
       │
       └─────────────────────────────────
         Low      Med       High     Вероятность
```

---

## Review Cadence

| Частота | Действие |
|---|---|
| Еженедельно | Проверка status рисков |
| Каждый Phase | Re-assess; добавить новые |
| Каждый релиз | Post-mortem risks → actions |

---

## Links

- [[Milestones]]
- [[Delivery Phases]]
- [[Definition of Done]]

---

## Next Actions

1. Review рисков перед началом Phase 1
2. Добавить митигации в backlog как tasks
3. Назначить owner для каждого top-risk
