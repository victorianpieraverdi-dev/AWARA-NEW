---
title: Рефакторинг index.html — статус и план завершения
date: 2026-05-31
tags: [refactor, architecture, index-html, modules, status]
---

# Рефакторинг index.html — статус и план завершения

## Главный вывод

Рефакторинг **не доведён до конца**. `index.html` в гибридном состоянии (~1.16 МБ). Часть модулей подключена и работает, часть лежит «в столе», остальное — старый инлайн-монолит.

## Архитектурные факты

- **Сборки нет.** `package.json` содержит только `@modelcontextprotocol/server-filesystem` и `firebase-admin`. Никакого бандлера. Модули грузятся браузером напрямую через `<script type="module">`. Если модуль не подключён тегом — он не участвует в игре.
- **`<head>`** — только CSS (main, legacy, variables, typography, components). Скриптов нет.
- **Лобби = захардкоженный инлайн-HTML** («Золотое Яйцо», `egg-quadrant`, `egg-item`, Alpha Gate). CSS помечен M-002/M-003/M-008. Это не рендер модуля.
- Навигация идёт через легаси-глобалы (`window.openGameSpaces`, `window.openMarketplace`, `window.gsUniverseClick`, прямые ссылки на .html).

## Статус модулей

| Модуль / блок | Статус |
|---|---|
| `js/quest-engine.js` (квесты, культ. ключи, кейсы) | ✅ подключён (inline import внизу) |
| `js/universe/universeProgression.js` | ✅ подключён |
| `js/lobby-module.js` | ⚠️ не подключён (орфан) |
| `js/menu-module.js` | ⚠️ не подключён (орфан) |
| `js/game-module.js` | ⚠️ не подключён (орфан) |
| Гримуар / матрицы (`selectMatrix`, `forgeKey`) | ❌ инлайн |
| Ментальные Врата (`openRandomMentalGate`) | ❌ инлайн |
| Свиток Синтеза / Накопления (`toggleNakopPanel`) | ❌ инлайн |
| Камера вселенной (touch/zoom) | ❌ инлайн |
| Скрытие календаря (T-048) | ❌ инлайн |
| Daily reward popup | ❌ инлайн |
| Quest UI glue (renderQuestCard и др.) | ❌ инлайн (хотя данные из модуля) |

## План завершения (инкрементально, безопасный порядок)

0. **Решение по орфан-модулям** (самый важный выбор): lobby-module/menu-module/game-module — либо сделать их источником правды (заменить ими инлайн-лобби), либо удалить как мёртвый код, чтобы не путать.
1. **Карта скриптов**: пройти index.html и выписать все `<script>`-блоки с диапазонами строк и классификацией (легаси / импорт / glue).
2. **Извлекать инлайн-системы по одной**, тестируя после каждой:
   - Гримуар/матрицы → js/grimoire-module.js (или переиспользовать matrixSwitcher.js)
   - Ментальные Врата → js/mental-gates.js
   - Свиток Синтеза → js/synthesis-module.js
   - Накопления → js/nakop-module.js
   - Камера вселенной → js/universe/camera.js
   - Скрытие календаря → js/calendar-hide.js
   - Daily reward → переиспользовать dailyReward.js
3. Каждая извлечённая система: вырезать инлайн → создать модуль → подключить `<script type="module">` → тест в браузере (python http.server) → коммит.
4. **Цель**: index.html усыхает до разметки + тонких точек входа модулей.

## Правило безопасности

Один блок за раз. После каждого извлечения — проверка в браузере, потом следующий. Не трогать canon и рабочие модули (quest-engine, universeProgression).
