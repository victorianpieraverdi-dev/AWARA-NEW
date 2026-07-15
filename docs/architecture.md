# AWARA Architecture

## Финальное состояние после рефакторинга (T-049 -- T-072)

## Структура проекта

```
awara-game/
├── index.html              (лобби, монолит ~1 МБ, очистка в T-069)
├── tigel.html              (Вечерний Тигель)
├── dashboard.html          (Дашборд)
├── universe.html           (Вселенная, Canvas 2D)
├── matrix.html             (33 Матрицы Восприятия)
├── cards.html              (Колода 63 карты)
├── oracle.html             (Оракул)
├── passport.html           (Паспорт Души)
│
├── css/
│   ├── main.css            (точка входа с @import)
│   ├── variables.css       (дизайн-токены)
│   ├── typography.css      (Cinzel, Cormorant Garamond, JetBrains Mono)
│   ├── components.css      (buttons, cards, modals, badges)
│   └── legacy.css          (сохранен до полной миграции)
│
├── js/
│   ├── core-module.js      (константы, STAGES, CANON, validateCanon)
│   ├── state-module.js     (localStorage)
│   ├── ui-module.js        (UI helpers)
│   ├── canon-module.js     (загрузка данных)
│   ├── lobby-module.js     (главная)
│   ├── game-module.js      (4 пространства)
│   ├── universe-module.js  (космос Canvas 2D)
│   ├── tigel-module.js     (логика Тигеля)
│   └── matrixSwitcher.js   (переключатель восприятий)
│
├── data/
│   ├── agents.json         (21 агент)
│   ├── matrices.json       (33 матрицы)
│   ├── agent_matrix_map.json (693 соответствия)
│   ├── locas.json          (14 лок)
│   ├── chakras.json        (9 чакр)
│   └── cards.json          (отсутствует, генерируется на лету: 21 x 3 = 63)
│
├── docs/
│   ├── architecture.md     (этот файл)
│   ├── refactor-map.md
│   ├── REFACTOR_TASKS.md
│   └── ...
│
├── HANDOFF.md              (журнал смен)
├── AWARA_RULES.md          (инварианты проекта)
└── README.md
```

## Канон AWARA (инвариант)

| Сущность | Кол-во |
|---|---|
| Космические Агенты | 21 |
| Матрицы культур | 33 |
| Локи (плотности) | 14 |
| Чакры-меры | 9 |
| Карты колоды | 63 (21 x 3) |
| Соответствия агент x матрица | 693 (21 x 33) |

## Метрики рефакторинга

| Метрика | До | После |
|---|---|---|
| Структура | 1 монолит | 8 HTML + 7 JS + 4 CSS |
| Legacy код | встроен в index.html | вынесен в отдельные экраны |
| Канон проверки | нет | автоматическая validateCanon() |
| Модули | IIFE (core.js 309 КБ) | ES6 modules |

## JS Модули

### core-module.js
Константы: AWARA_VERSION, STAGES, CANON, COLORS, STORAGE_KEYS, BREAKPOINTS, TIMINGS
Функция: validateCanon()

### state-module.js
localStorage: loadState, saveState, updateState, resetState,
getLight, addLight, getLevel, setLevel, addTigelEntry, getTigelEntries

### ui-module.js
UI helpers: formatLight, formatPercent, formatBigNumber,
showModal, showToast, fadeIn, fadeOut, vibrate,
getCurrentBreakpoint, isMobile, debounce, throttle

### canon-module.js
Загрузка данных: loadAgents, loadMatrices, loadAgentMatrixMap,
loadLocas, loadChakras, loadCards,
getAgentById, getMatrixById, getAgentMatrixEntry,
preloadCanon, clearCanonCache

### lobby-module.js
Логика главной: initLobby, updateLightCounter, updateLevelDisplay,
updateAgentDisplay, addLightAnimated, showPassport, stopSunBreathing

### game-module.js
4 пространства: SPACES константа, initGame, showGameMenu, openSpace,
getCurrentSpace, getAllSpaces, resetGameState

### universe-module.js
Космос Canvas 2D: initUniverse, stopUniverseAnimation,
selectAgent, getUniverseState, resetUniverse

### tigel-module.js
Вечерний Тигель: initTigel, autoTagWuXing, adjustWuXing,
computeToroid, getRecommendations, generateKey,
synthesizeDay, gatherExperienceFromSpheres,
startBgAnimation, stopBgAnimation, switchTab

### matrixSwitcher.js
Переключатель: PERCEPTIONS, getActivePerception, setActivePerception, renderSwitcher

## Экраны

| Файл | Назначение | Модули |
|---|---|---|
| index.html | Лобби (центральное солнце РА) | lobby-module, game-module |
| tigel.html | Вечерний Тигель (алхимия дня) | state-module, ui-module |
| dashboard.html | Дашборд (свет, ранги) | state-module, ui-module |
| universe.html | Вселенная (Canvas 2D, 21 агент) | universe-module, canon-module |
| matrix.html | 33 Матрицы Восприятия | canon-module, matrixSwitcher |
| cards.html | Колода (63 карты) | canon-module, ui-module |
| oracle.html | Оракул | state-module, ui-module |
| passport.html | Паспорт Души | state-module |

## Запуск локально

```bash
python3 -m http.server 8765
```

Откройте http://localhost:8765

## Технологии

- Pure HTML / CSS / ES6 JavaScript
- Mobile-first (375px breakpoint)
- localStorage для состояния
- Canvas 2D для космической визуализации
- Без бандлеров, без фреймворков

## Дизайн-система

- Палитра: золото #c9a84c / #ffd700 на черном #000 / #0a0a14
- Шрифты: Cinzel (заголовки), Cormorant Garamond (текст), JetBrains Mono (данные)
- Breakpoints: 320px / 375px / 768px / 1024px

## История рефакторинга

| Фаза | Задачи | Описание |
|---|---|---|
| Подготовка | T-049, T-050 | Карта рефакторинга, структура папок |
| CSS | T-051, T-052, T-053, T-054b | 4 модуля + main.css |
| JS | T-055 -- T-061 | 7 ES6 модулей |
| Экраны | T-062 -- T-069 | 8 HTML файлов, очистка index.html |
| Финализация | T-072 | Документация, smoke test |

См. HANDOFF.md -- журнал всех задач с датами и Devin-сессиями.
