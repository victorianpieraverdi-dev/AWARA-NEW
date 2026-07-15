# Refactor log — распил index.html

Пошаговый журнал выноса инлайн-блоков из монолитного `index.html` (1.16 MB) в отдельные модули.
Карта блоков: [[index-script-map-2026-06-01]]. Статус рефакторинга: [[refactor-status-2026-05-31]].

Метод (каждый блок): вырезать инлайн → создать модуль в `js/` → подключить через `<script src>` → проверить локально → коммит. dryRun перед применением.

---

## 2026-06-01 · Блок 7 — камера вселенной ✅

**Статус:** вынесено, применено в `index.html`.

- **Откуда:** инлайн `<script>` IIFE (~160 строк), сразу после блока lobby-scroll-reset и перед `<script type="module">` universeProgression.
- **Куда:** `js/universe/camera.js` (классический скрипт, не module — код работает через глобалы `window.*`, без import/export).
- **Подключение:** `<script src="js/universe/camera.js"></script>` в той же позиции → порядок и тайминги сохранены.
- **Экспорты (глобалы):** `resetUniverseCamera`, `universeMobileReset`, `universeMobileZoom`, `setUniverseMobileMode`, `getUniverseSceneMetrics`.
- **Содержимое:** камера `{zoom,x,y,min:0.72,max:1.65}`, touch drag / pinch-zoom / double-tap reset, режимы focus/overview, подсказка «ДВИГАЙ ОДНИМ ПАЛЬЦЕМ».
- **Проверка:** открыть `python -m http.server 8765` в `C:\AWARA`, проверить мобильную вселенную (drag/pinch/double-tap) — **идёт ручная проверка**.

## 2026-06-01 · Блок 6 — сброс скролла лобби ✅

**Статус:** вынесено, применено.

- **Куда:** `js/lobby-scroll.js` (классический скрипт).
- **Подключение:** `<script src="js/lobby-scroll.js"></script>` (перед camera.js).
- **Содержимое:** `resetLobbyPhoneScroll` — сброс `.lobby-phone-shell` и окна в верх на DOMContentLoaded/load/pageshow + 80/300мс; `history.scrollRestoration='manual'`.
- **Проверка:** открыть лобби, прокрутить, обновить — должно вернуться в верх.

## 2026-06-01 · Блок 2 — языковая панель ✅

**Статус:** вынесено, применено.

- **Куда:** `js/lang-panel.js` (классический скрипт).
- **Подключение:** `<script src="js/lang-panel.js"></script>` (после разметки `#lang-modal`).
- **Содержимое:** `window.openLangPanel`, `window.selectLang` (RU активен, EN заглушка), init-IIFE для метки текущего языка.
- **Проверка:** открыть панель языка, переключение RU — метка обновляется, панель закрывается.

## 2026-06-01 · Блок T-048 — скрытие календарных элементов ✅

**Статус:** вынесено, применено.

- **Куда:** `js/hide-calendar-ui.js` (классический скрипт, IIFE).
- **Подключение:** `<script src="js/hide-calendar-ui.js"></script>` (перед module-скриптом квестов).
- **Содержимое:** `hideCalendarUI` — прячет элементы с календарными ключевыми словами (юлианский/григорианский/дни/месяцы) + regex дат; MutationObserver + setInterval 2с.
- **Заметка:** «битые» символы в транскрипте оказались артефактом отображения — файл хранит корректный UTF-8 (проверено no-op dryRun). → Блок 4 тоже можно резать байт-в-байт.
- **Проверка:** убедиться, что блок «юлианский/григорианский» под Ра скрыт.

## 2026-06-01 · Блок 4 — Гримуар + движки (Key/Toroid) ✅

**Статус:** вынесено, применено.

- **Откуда:** инлайн `<script>` (~320 строк) между `<!-- ══ AWARA ENGINES: KEY + TOROID ══ -->` и `<!-- ══ ГРИМУАР (Матрицы) ══ -->`.
- **Куда:** `js/grimoire-engine.js` (классический скрипт — глобалы, без import/export).
- **Подключение:** `<script src="js/grimoire-engine.js"></script>` в той же позиции → порядок/тайминги сохранены (IIFE `updateTigelBadge` отрабатывает на парсинге).
- **Содержимое:** `window.AwaraKeyEngine` (Wu-Xing теги, каналы, сферы, generate), `window.ToroidEngine` (compute), бейдж тигля, `matricesData` (vedic/techno/dao/alchemy), `mentalGatesDB` (3 врат), функции Гримуара/Врат/Синтеза/Накоплений (`toggleGrimoire`, `forgeKey`, `renderInventory`, `selectMatrix`, `openRandomMentalGate`, `handleGateAnswer`, `showSynthesisReport`, `toggleNakopPanel`).
- **⚠️ Сохранён баг (намеренно):** `selectMatrix` определён дважды — здесь и в Блоке 1 (Matrix theme). Развести при выносе Блока 1.
- **Проверка:** открыть Гримуар, выбрать матрицу, пройти Врата, ковать ключ — данные и localStorage работают.
## 2026-06-01 · Блок 1 — Matrix theme (тема восприятия) ✅

**Статус:** вынесено, применено.

- **Откуда:** инлайн `<script>` `// ══ MATRIX THEME SYSTEM ══` (~17 тем), сразу после разметки `#matrix-modal`/`#matrix-grid` и перед `<!-- ══ LANGUAGE PANEL ══ -->`. CSS-блок `<style>` (data-matrix темы) оставлен инлайн — выносили только JS.
- **Куда:** `js/matrix-theme.js` (классический скрипт — глобалы, без import/export; `_t()` на парсинге, поэтому грузится в той же позиции после движков локализации).
- **Подключение:** `<script src="js/matrix-theme.js"></script>` в той же позиции (после `#matrix-modal`) → порядок/тайминги сохранены, PerceptionMatrix-IIFE отрабатывает `applyMatrixTheme(saved)` на парсинге.
- **Содержимое:** `AWARA_MATRICES` (17 линз: neutral/vedic/egyptian/mayan/kabbalistic/gnostic/shambhala/dao/slavic/julian/gene/norse/japanese/celtic/shamanic/techno/cosmic), `MATRIX_NAMES`, `getMatrix`, `applyMatrixTheme` (fade + color-sweep, `data-matrix` на doc+body, пишет `awara_matrix`/`awara_matrix_theme`, обновляет `#active-matrix-label`, дёргает `AWARA_SYS.DayData`), `openMatrixModal`/`closeMatrixModal`/`selectMatrix`, `hexToRgb`.
- **⚠️ Баг с иконкой (исправлен):** египетская иконка `𓇳` (U+13133) изначально была мис-кодирована суррогатной парой `\ud80c\uddf3` (=U+131F3, другой иероглиф) → исправлено на `\ud80c\udd33`. Из-за этого ранний апдейт index.html не находил точное совпадение; после фикса модуля вынос прошёл.
- **⚠️ Коллизия `selectMatrix` (сохранена намеренно):** определён здесь (`window.selectMatrix`, темы) и в Блоке 4 (`function selectMatrix`, Гримуар). Опционально позже развести → `selectThemeMatrix` / `selectGrimoireMatrix`.
- **Проверка:** открыть «Матрица восприятия», переключить тему, обновить страницу → тема сохраняется; проверить порядок загрузки `_t` (нет «_t is not defined»).

### Очередь дальше (лёгко→сложно)
1. ~~Блок 7 — камера~~ ✅
2. ~~Блок 6 — lobby scroll reset~~ ✅
3. ~~Блок 2 — языковая панель~~ ✅
4. ~~Блок T-048 — скрытие календаря~~ ✅
5. ~~Блок 4 — Grimoire/Gates/Synthesis/Nakop + engines → `js/grimoire-engine.js`~~ ✅
6. ~~Блок 1 — Matrix theme → `js/matrix-theme.js`~~ ✅
7. ПОСЛЕДНИМ — замена инлайн-лобби на `menu-module.js`/`lobby-module.js` (самое рисковое)

### ↑ Не забыть
- При выносе Блока 1/4 развести два `selectMatrix` (темы vs Гримуар) → `selectThemeMatrix` / `selectGrimoireMatrix`.
- Не трогать Блоки 8–9 (уже ES-модули: universeProgression, quest-engine).

## 2026-06-01 · Браузер-проверка всех вынесенных блоков ✅

**Статус:** проверено локально (`python -m http.server 8765` → `http://localhost:8765/index.html`), консоль чистая.

- **Проверены:** Блоки 7 (камера), 6 (lobby scroll), 2 (язык), T-048 (календарь), 4 (Гримуар/движки), 1 (Matrix theme) — нет 404 на `js/*`, модули грузятся, темы переключаются и сохраняются.
- **Шум, который игнорируем:** ошибки от крипто-расширений браузера (`evmAsk.js`, `contentscript.js`, `ObjectMultiplex`, `image.js` — MetaMask). К AWARA не относятся.

### ⚠️ Найден и исправлен ПРЕД-СУЩЕСТВУЮЩИЙ баг (не из-за рефакторинга)

- **Симптом:** `Uncaught SyntaxError: Unexpected identifier 's'` в `index.html:3456`, каскадом — `_t is not defined` / `_lang is not defined` по всей странице (включая `matrix-theme.js:10`, т.к. он зовёт `_t()` на парсинге).
- **Причина:** в массиве `LOWER_LOKAS`, запись **Сутала**, поле `desc_en` — незаэкранированный апостроф в `Vishnu's favorite` обрывал строку (строка в одинарных кавычках).
- **Фикс:** `Vishnu's` → `Vishnu\'s` (экранирование). После этого блок локализации выполняется целиком, `_t`/`_lang` определены, `matrix-theme.js` работает.
- **Вывод:** ошибка была на строке 3456 — ВЫШЕ любого вынесенного блока → рефакторинг ни при чём, баг лежал давно.

### Остаточная мелочь (не блокер)
- `dailyKey: Cannot set properties of null (textContent)` (`index.html:5584`) — код пишет в отсутствующий DOM-элемент. Не критично; добить при случае.

### Осталось по распилу
- ПОСЛЕДНИМ (самое рисковое): замена инлайн-лобби на `menu-module.js`/`lobby-module.js`.

## 2026-06-01 · Блок 3 — UI Canon (CSS-патч → внешний файл) ✅

**Статус:** вынесено, применено. Первый вынос **CSS** (предыдущие 6 — JS).

- **Откуда:** инлайн `<style id="awara-ui-canon">` (~244 строки) под `<!-- ══ AWARA UI CANON PATCH ══ -->`, после `<script src="js/lang-panel.js">` и перед `<script src="js/grimoire-engine.js">`.
- **Куда:** `css/ui-canon.css` — полный блок стилей (разделы 1 ЛОББИ #s0, 2 КНОПКИ, 3 GAME SPACES MODAL, 4 GLOBAL ENHANCEMENTS) + `@import` шрифтов (Cinzel/Cinzel Decorative/Cormorant Garamond/JetBrains Mono).
- **Подключение:** `<link rel="stylesheet" href="css/ui-canon.css">` в той же позиции → порядок каскада сохранён (link идёт раньше остальных inline-`<style>`, значения идентичны).
- **Остаток:** крошечный `<style id="awara-ui-canon-rest">` только с комментариями (все CSS-правила удалены) — невидим, безвреден.
- **⚠️ Нюанс матчинга:** `edit_file` дважды падал на точном совпадении: (1) разная длина руна `═` в разделителе `4. GLOBAL ENHANCEMENTS` (в файле 24, не 23); (2) один комментарий при сыром чтении отдавал `���` (мохибейк). Решение: резать двумя кусками, не задевая ни разделитель с `═`, ни битый комментарий.
- **Проверка:** hard-reload (Ctrl+Shift+R) → лобби, кнопки, модалка «Game Spaces» (врата/иконки/кнопка «НАЗАД В ЛОББИ»), scrollbar, alpha-input, RA-hover-glow — стили должны быть идентичны.

## 2026-06-01 · Разведка осиротевших модулей лобби → СТОП (не выносить сейчас)

**Вывод:** это НЕ безопасный «вынос инлайна в файл», как предыдущие 6 блоков, а **миграция на другую архитектуру**. Откладывается в отдельный трек.

**Почему (факты из кода):**
- `lobby-module.js` / `game-module.js` / `menu-module.js` — ES6 с `import/export`, тянут целое дерево: `core-module.js` (STAGES/CANON/COLORS/TIMINGS), `state-module.js` (loadState/getLight/addLight/setLevel...), `ui-module.js` (showModal/showToast/isMobile/vibrate...), `canon-module.js` (preloadCanon/getAgentById/getMatrixById).
- Модули ждут ДРУГИЕ DOM-хуки: `[data-section]`, `[data-central-sun]`, `[data-light-counter]`, `[data-level-name]`, `[data-agent-name]`. А инлайн-лобби в index.html сейчас на `onclick="window.openGameSpaces()"` + разметка `egg-quadrant`/`egg-item` — никаких data-атрибутов.
- **Конфликт состояния:** модули читают/пишут через `state-module.js` (своя схема: `totalLight`, `level`, `agent`, `tigelEntries`...), а живая игра — через `awara_v258_state` и др. Прямое подключение может рассинхронить/побить прогресс и свет игрока.
- **Разная навигация:** `menu-module.js` ведёт на множество отдельных страниц (`matrix.html`, `egg-3d.html`, `passport.html`...) — это multi-page модель, а сейчас лобби — single-page с модалками.

**Рекомендация:** остановить распил на 6 вынесенных блоках (все безопасные готовы и проверены). Миграцию лобби на модули вести ОТДЕЛЬНО и осознанно: (1) сначала свести `state-module` ↔ `awara_v258_state`; (2) решить single-page vs multi-page; (3) отладить на уже готовых `test-lobby-module.html` / `test-menu-module.html` / `test-game-module.html`; (4) потом врезать в index.html.
