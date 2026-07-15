# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Основной скилл — применять перед началом любой работы

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Обязательно прочитать первым

`AWARA_RULES.md` — 10 неизменных правил (канон, стиль, git). Всегда перечитывать перед работой.
`HANDOFF.md` — текущий контекст сессии и ближайшие задачи.
`docs/BACKLOG.md` — приоритизированный список задач.

## База знаний (Obsidian / kb/)

`C:\AWARA\` — корень Obsidian-vault. Внутри два junction'а:
- `kb/` → `C:\Users\pavelradost\ff\awara-kb\` — база знаний проекта
- `memory/` → `C:\Users\pavelradost\.claude\projects\C--AWARA\memory\` — auto-memory Claude

### Как работать с kb/ (постоянно, каждую сессию)

**Читать при старте сессии:**
- `kb/wiki/index.md` — карта всей базы знаний
- `kb/wiki/log.md` — последние 3–5 записей (что изменилось)

**Читать при работе с конкретной темой:**
- `kb/wiki/entities/` — агенты, матрицы, локи, чакры, даймон, милость (по 21/33/14/9/5/7 страниц)
- `kb/wiki/mechanics/` — механики (Тигель, NineSpheres, лока-культивация, карты и др.)
- `kb/wiki/concepts/` — концепты (экономика света, дневник совести, ч/б→цвет и др.)
- `kb/wiki/synthesis/` — синтезы и vision-документы

**Писать после работы:**
1. Новый лорбук/дизайн-документ → сохранить в `kb/raw/sources/`, создать `kb/wiki/sources/имя.md`
2. Новый синтез или решение → `kb/wiki/synthesis/`
3. Обновить затронутые страницы сущностей
4. Добавить запись в `kb/wiki/log.md` сверху (формат: `## [YYYY-MM-DD] тип · тема`)
5. Обновить `kb/wiki/index.md` если добавились разделы

**Правила kb:**
- Язык: русский. Даты: YYYY-MM-DD. Ссылки: `[[wiki/entities/имя|Название]]`.
- `kb/raw/sources/` — только читать, не модифицировать.
- Канон неизменяем: 21 / 33 / 14 / 9 / 63 / 693.

## Команды

```bash
# Новая React/Vite-система (ноды 0–2)
npm install
npm run dev      # http://localhost:5173/app/istok.html
npm run build    # выход в /dist
npm run preview

# Легаси-система (ноды 3–7)
python3 -m http.server 8765    # http://localhost:8765

# AI-прокси (DeepSeek, порт 8787)
node awara-ai-proxy.cjs
```

## Архитектура: две параллельные системы

Проект мигрирует с легаси (Vanilla HTML/JS) на новый стек (React + Three.js), не ломая старые экраны.

### Легаси-система (ноды 3–7, ~70% кодовой базы)
- Отдельные `.html`-файлы на каждый экран (`index.html`, `tigel.html`, `matrices.html`, …)
- Модули ES6 в `js/`: `core-module.js`, `state-module.js`, `ui-module.js`, `canon-module.js`, `lobby-module.js`, `game-module.js`, `universe-module.js`, `tigel-module.js`
- Состояние — `localStorage`, ключ `awara_v258_state`
- Canvas 2D для визуализации вселенной
- Без бандлера; `<script type="module">` разрешён

### Новая система (ноды 0–2, ~30% кодовой базы)
- `app/` — React 19 + TypeScript + React Three Fiber (R3F)
- `core/` — типы, StateManager, VoiceOfTruth, шейдеры
- `components/ui/` — GlassCard, GoldButton (Linear DS + Aceternity UI)
- Точки входа: `app/istok.html` → `app/main.ts` → `app/istok-main.tsx`

### Космологические ноды

| Нода | Название | Реализация | Файл |
|------|----------|------------|------|
| 0 | Исток (Entry/Void) | React + R3F | `app/entry/EntryScreen.tsx` + `app/entry/scene.tsx` |
| 1 | Макрокосм | React + R3F (5800+ строк) | `app/macrocosm/Macrocosm.tsx` |
| 2 | Лобби (Золотое Яйцо) | Легаси → React | `index.html` |
| 3–7 | Информация, Даймон, Тигель, Световая игра, Держава РА | Легаси | `matrices.html`, `daimon.html`, `tigel.html`, … |

Навигация: Васту-крест (8 направлений), zoom in/out по ярусам.

## Ключевые файлы

- `core/types.ts` — `PlayerState`, `Element`, `NodeId`, `RenderTier`, `Chakra`
- `app/PlayerProvider.tsx` — глобальный контекст состояния (React Context)
- `js/state-module.js` — localStorage-адаптер (read/write/merge, `deriveLevel`)
- `js/core-module.js` — константы: `STAGES`, `CANON`, `COLORS`, `TIMINGS`
- `data/` — весь игровой канон (JSON)

## Канон (неизменен — не трогать числа)

| Сущность | Кол-во | Файл |
|----------|--------|------|
| Космические Агенты | **21** | `data/agents.json` |
| Матрицы культур | **33** | `data/matrices.json` |
| Локи (плотности) | **14** | `data/locas.json` |
| Чакры-меры | **9** | `data/chakras.json` + `data/dimensions_9.json` |
| Зоны Васту | **9** | `data/zones.json` |
| Соответствия агент×матрица | **693** | `data/agent_matrix_map.json` |

## Дизайн-система

- **Палитра:** золото на чёрном. `#c9a84c` (основное), `#ffd700` (яркое), `#000` / `#0a0a14` (фон)
- **Шрифты:** Cinzel (заголовки), Cormorant Garamond (корпус), JetBrains Mono (цифры/код)
- **Геометрия:** мандалы, фракталы, золотое сечение — не flat/material-стиль
- CSS-анимации без тяжёлых библиотек (в легаси); GSAP + R3F postprocessing (в новом стеке)

## Экономика света

- Единица: **кристалл света** (`state.crystalsTotal`). 10 000 кристаллов = 1 светмонета.
- `colorLevel 0–4` (серый → полный спектр) и `renderTier 0–5` (плоскость → sandbox законов) — всё управляется накопленными монетами.
- Ранги Державы РА (из `STAGES`): 0 / 3000 / 7000 / 10 000 / 25 000 / 50 000 → ИНИЦИАТ → ВОИН СВЕТА → МУДРЕЦ → ЦАРЬ → БУДДА → ПЛАНЕТАРНЫЙ ЛОГОС.

## Git-правила

- Коммит = одна T-XXX задача. Сообщение на русском: `<тип>(<область>): T-XXX — <что сделано>`.
- Никогда: `git add .`, force push в master, `--no-verify`, `--amend`.
- Push только в этот shared remote. Никуда больше.

## Рабочий протокол

1. Прочитать `HANDOFF.md` → взять первую незакрытую задачу.
2. Сделать (5–10 мин). Одна задача — не параллелить.
3. Коммит + push.
4. Обновить `HANDOFF.md`, сообщить Павлу факт.
5. Заблокироваться (`block_on_user`) — ждать следующего приоритета.
6. При неясности: `ASK:` в `HANDOFF.md`, 3–4 варианта, блок.

## Игровой контекст

**Жанр:** эволюционная RPG / духовная ОС сознания. Игрок растит личный Свет, культивирует свою вселенную, работает с 21 космическим агентом и 33 матрицами культур. Прогресс нелинейный: два независимых измерения (цвет + размерность), оба питаются светмонетами.

### Ключевые системы

**Dynamic Dimensionality** (`core/types.ts`)
Два измерения, выводимых из `crystalsTotal`:
- `colorLevel 0–4` — ч/б → полный спектр (пороги: `COLOR_LEVEL_COINS`)
- `renderTier 0–5` — плоскость → sandbox законов (пороги: `RENDER_TIER_COINS`)
Игрок выбирает `renderTierSelected ≤ разблокированного`. `effectiveTier()` — реально активный.

**CoreSource** (`Macrocosm.tsx:782`)
Центральный источник энергии в ноде 1 (Макрокосм). Геометрический узел (icosahedron = «солнце», jet = «луч»). Пульсирует сильнее по мере роста высоких Мер (M6–M9). На T5 всегда максимален. Реагирует на `lokaFill` через `heartBase`.

**NineSpheres** (`Macrocosm.tsx:1241`)
9 вложенных концентрических Мер вокруг CoreSource. Видимость: T0-T1=0, T2→3, T3→6, T4-T5→9. Каждая сфера заполняется по `lokaFill()` своих лок. Клик — «намагничивает» камеру внутрь этой Меры (GSAP zoom). Свет перетекает между соседними Мерами (коэффициент `SPILL=0.35`).

**SHELL_FRAG** (`Macrocosm.tsx:931`)
GLSL-фрагментный шейдер поверхностей Мер. Описывает заполненность, свечение и волну сердечного импульса. Получает `uFill`, `uLight`, `uHeart`, `uColor` как uniform-переменные.

**VoiceOfTruth** (`core/ai/VoiceOfTruth.ts`)
Основной AI-цикл (Бодхичитта). Дневник игрока (текст) → парсинг стихий (earth/water/fire/air/ether по лексикону) → Сок (experience) → дельты чакр. Опциональный LLM-клиент (DeepSeek, порт 8787) для живой рефлексии. При энтропии (угасание Света) — квесты восстановления.

**Loka Cultivation** (`core/types.ts:211`)
14 лок (плотностей бытия), у каждой 9 уровней. Питаются по 5 каналам: temple · source · daimon · tigel · matrix (разные веса). Светлые локи растут прямо; тёмные (Пата́ла) сначала сопротивляются и высасывают Свет, но с уровня 6 (`DARK_SUBDUE_LEVEL`) подчиняются и становятся сверхгенераторами. `lokaFill()` → заполнение Мер.

**Тигель / Cauldron** (`tigel.html`, `js/cauldronEngine.js`)
Ежедневная практика. Дневник → 7 параметров У-Синь (авто-теги) → тороид-расчёт → награда светом. Бонус Даймона умножается через `calculateDaimonCauldronBonus()`. Ведётся счётчик streak и накопление Милости.

**Milost / Милость** (`milost.html`, `data/milost-sources.json`)
7 источников благодати по 7 Лучам. Копится через практики и служение. Механика Завесы: при пробое → Послание Макрокосма (нарратив).

**Daimon** (`daimon.html`, `js/daimonFusionEngine.js`)
Личный спутник, 7 стадий эволюции (зерно → существо). Синтезируется из стихий + агента + матрицы через DaimonFusionEngine. Даёт стихийный бонус и множитель XP на выходе Тигля.

**PowerSource / SubtleLink — T5-творение** (`core/types.ts:116`, `app/T5Creator.tsx`)
На T5 игрок создаёт источники силы (sun | constellation) и тонкие связи между планами (material ↔ subtle ↔ human). Кристаллы, вложенные в объект, запираются (не тратятся), возвращаются при разрыве. Цена: `SOURCE_FORM_COST_COINS`, `agentLinkCostCoins()`, `lokaLinkCostCoins()`.

---

## Правила работы

### Менять свободно

- GLSL-шейдеры (`SHELL_FRAG`, `CORE_FRAG`, `CORE_VERT` и др.) — визуал, яркость, ритм анимации
- CSS/стили: `css/`, `awara-ds.css`, `*.module.css` — оформление, не затрагивающее логику
- i18n-строки в `js/i18n-module.js`, `data/locales/` — перевод, формулировки
- Пороги экономики (`RENDER_TIER_COINS`, `COLOR_LEVEL_COINS` в `core/types.ts`) — черновые значения, тюнятся
- Поля lore/description в JSON-файлах `data/` — нарратив, тексты агентов и матриц
- Утилиты: `js/ui-module.js`, `js/hints-module.js`, `js/i18n-module.js`
- Компоненты UI (`components/ui/`) без изменения пропсов

### Только с подтверждением Павла

- **Канонические числа** (21 / 33 / 14 / 9 / 693 / 1578) — менять запрещено, даже «временно»
- **localStorage-ключ** `awara_v258_state` — смена ломает все существующие сохранения
- **Структура `PlayerState`** (`core/types.ts`) — добавление/удаление/переименование полей
- **Схема нод 0–7** (`core/state/nodes.ts`) — порядок, названия, связи
- **Ценовые кривые T5** (`SOURCE_FORM_COST_COINS`, `agentLinkCostCoins` и др.)
- **Имена агентов и матриц** — не упрощать, не русифицировать санскрит
- **Архитектурные решения** — смена бандлера, добавление фреймворка, включение бэкенда
- **Протокольные файлы** (`AWARA_RULES.md`, `HANDOFF.md`, `START_PROMPT.md`) — только в рамках протокола хендофа
- **Контракт легаси ↔ новая система** — localStorage-ключи, `legacyHref`, iframe-протокол

## Важные ограничения

- **API-ключи никогда в коде.** Паттерн: `localStorage` → `prompt()` → `localStorage`. Серверные ключи — env vars.
- **Mobile-pass обязателен** для любого UI-изменения: тестировать на 320px, 375px, 768px.
- **GLSL шейдеры:** использовать `highp float` для расчётов плотности звёзд и свечения на мобильных.
- Легаси-ноды (3–7) доступны через `legacyHref` или iframe — не переписывать без явного задания.
