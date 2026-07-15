---
title: Карта <script>-блоков index.html
date: 2026-06-01
tags: [refactor, index-html, script-map, architecture]
---

# Карта `<script>`-блоков index.html

> Ограничение инструментов: MCP-сервер читает только head/tail, без grep и без чтения по диапазону. Номера строк недоступны — порядок блоков дан по последовательности.

## Структура файла (сверху вниз)

### `<head>`
- Только CSS: fonts, main.css, legacy.css, + большой инлайн `<style>` (Лобби/Золотое Яйцо), variables.css, typography.css, components.css. **Скриптов нет.**

### Начало `<body>` — разметка (инлайн HTML)
- `#bg` canvas, `#universe-flash`, `#alpha-gate`, лобби «Золотое Яйцо» (`egg-quadrant`, `egg-item`). Навигация — через `onclick="window.openGameSpaces()"` и пр.

### Блоки скриптов (середина→низ), по порядку

| # | Блок | Тип | Содержимое | Куда вынести |
|---|---|---|---|---|
| 1 | Matrix Theme | `<style>`+`<div#matrix-modal>`+`<script>` | `AWARA_MATRICES` (17 матриц), `applyMatrixTheme`, `openMatrixModal`, `hexToRgb`, **`window.selectMatrix`**, `closeMatrixModal`, инит темы | js/matrix-theme.js (или matrixSwitcher.js) |
| 2 | Language | `<div#lang-modal>`+`<script>` | `openLangPanel`, `selectLang`, инит lang | js/i18n-module.js (уже есть) |
| 3 | UI Canon | `<style#awara-ui-canon>` | Косметика лобби/кнопок/game-spaces-modal/creator-badge | css/ui-canon.css |
| 4 | Engines + Гримуар | `<script>` | `AwaraKeyEngine`, `ToroidEngine`, `updateTigelBadge`, `matricesData`, `mentalGatesDB`, `toggleGrimoire`, `forgeKey`, `renderInventory`, **`selectMatrix`(Гримуар)**, `openRandomMentalGate`, `handleGateAnswer`, `closeMentalGate`, `showSynthesisReport`, `closeSynthesisReport`, `toggleNakopPanel` | js/grimoire-module.js + js/mental-gates.js + js/synthesis-module.js + js/nakop-module.js + js/engines/(key,toroid).js |
| 5 | Оверлеи | `<div#grimoire-overlay>`,`#mental-gate-overlay`,`#synthesis-report-overlay`,`#daily-reward-popup` + `<style>` | Разметка окон | оставить как markup, логику — в модули |
| 6 | Lobby scroll reset | `<script>` (IIFE) | `resetLobbyPhoneScroll`, scrollRestoration | js/lobby-module.js |
| 7 | Universe camera | `<script>` (IIFE) | touch/pinch/zoom, `resetUniverseCamera`, `universeMobileZoom`, `setUniverseMobileMode`, `getUniverseSceneMetrics` | js/universe/camera.js |
| 8 | Universe progression | `<script type="module">` ✅ | import `createUniverseSnapshot` — mobile universe focus UI | **уже модуль** |
| 9 | Quest engine UI | `<script type="module">` ✅ (в самом низу) | import из quest-engine.js — квесты/ключи/кейсы + `initQuestSystem()` | **уже модуль** |

## Критические находки

- ⚠️ **Конфликт `selectMatrix`**: блок 1 определяет `window.selectMatrix` (тема), блок 4 — `function selectMatrix(matrixId)` (Гримуар). Оба глобальные, один перебивает другой. При модуляризации развести (`selectThemeMatrix` вс. `selectGrimoireMatrix`).
- ⚠️ Два набора «матриц»: `AWARA_MATRICES` (17, темы) и `matricesData` (4, Гримуар: vedic/techno/dao/alchemy). Разные системы, не путать.
- Навигация лобби жёстко завязана на инлайн `onclick=window.*` — menu-module.js придётся либо подключить к этим же глобалам, либо заменить разметку на `data-section` (как в lobby-module.js).

## Порядок извлечения (от простого к сложному)

1. Блок 7 (Universe camera) — изолированный IIFE, лёгко вынести.
2. Блок 6 (lobby scroll) → lobby-module.js.
3. Блок 1 (Matrix theme) — большой, но самодостаточный.
4. Блок 4 (Гримуар/Врата/Синтез/Накоп) — самый крупный, резать по подсистемам.
5. Последним — замена инлайн-лобби на menu-module.js/lobby-module.js (самое рискованное).

## Правило
После каждого выноса: `<script type="module" src>` + тест в браузере (python http.server) + коммит. Не трогать рабочие модули (блоки 8–9).
