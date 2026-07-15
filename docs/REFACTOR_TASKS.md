# AWARA Рефакторинг — План задач T-049 → T-072

> **Цель:** Разбить монолитный `index.html` (1 МБ) на модульную архитектуру
> **Срок:** 5-10 дней при работе 3-4 Devin-аккаунтов
> **Подход:** Каждая задача — 10-20 минут, один коммит, не ломает старое
> **Автор:** Pavel Burdinov / Victorian Piera-Verdi
> **Создано:** 2026-05-16

---

## ВАЖНО ПЕРЕД НАЧАЛОМ

1. **Создать ветку `refactor/modular-architecture`** для всей работы (или делать в master с осторожностью)
2. **Каждая задача = один коммит** в формате: `refactor(area): T-XXX — описание`
3. **Перед каждой задачей** проверить, что предыдущие задачи смерджены
4. **После каждой задачи** — проверить сайт в браузере (mobile 375px)
5. **Не нарушать канон:** 21/33/14/9 — фиксированы, имена агентов не меняем

---

## ФАЗА 1: ПОДГОТОВКА (T-049 — T-050)

---

### T-049: Аудит index.html и карта модулей

**Приоритет:** CRITICAL  
**Время:** 15-20 мин  
**Область:** docs/architecture  
**Зависимости:** нет

**Описание:**  
Проанализировать текущий `index.html` и создать документ `docs/refactor-map.md` с разбивкой по логическим блокам.

**Шаги:**
1. Открыть `index.html`
2. Пройти по всем `<script>` тегам — записать, что делает каждый
3. Пройти по всем `<style>` тегам — записать, что стилизует каждый
4. Выделить логические экраны (лобби, тигель, космос и т.д.)
5. Создать файл `docs/refactor-map.md` со структурой:

```markdown
# Карта рефакторинга AWARA

## CSS блоки в index.html
- Блок 1 (строки 100-250): переменные, базовые стили
- Блок 2 (строки 500-800): типографика
- Блок 3 (строки 1200-1500): карточки разделов
...

## JS блоки в index.html
- Скрипт 1 (строки 2000-2300): константы STAGES, цвета
- Скрипт 2 (строки 2400-2800): state management
- Скрипт 3 (строки 3000-3500): логика лобби
...

## Логические экраны
- Лобби: строки 50-1000 HTML
- ИГРА: строки 1100-1800 HTML
- Тигель: строки 1900-2500 HTML
...
```

**Definition of Done:**
- [ ] Создан файл `docs/refactor-map.md`
- [ ] Описаны все блоки CSS с указанием диапазона строк
- [ ] Описаны все блоки JS с указанием диапазона строк
- [ ] Описаны все логические экраны
- [ ] Файл закоммичен

**Коммит:**
```
docs(architecture): T-049 — карта рефакторинга index.html
```

---

### T-050: Создать структуру папок

**Приоритет:** CRITICAL  
**Время:** 5 мин  
**Область:** infra  
**Зависимости:** T-049

**Описание:**  
Создать пустые папки `css/`, `js/`, `assets/` с placeholder-файлами.

**Шаги:**
1. Создать `css/` с файлом `.gitkeep`
2. Создать `js/` с файлом `.gitkeep` (если ещё нет)
3. Создать `assets/icons/` с файлом `.gitkeep`
4. Создать `assets/images/` с файлом `.gitkeep`
5. Создать `docs/` (если ещё нет)

**Definition of Done:**
- [ ] Папки `css/`, `js/`, `assets/icons/`, `assets/images/` существуют
- [ ] Каждая имеет `.gitkeep` (или хотя бы один файл)
- [ ] Структура видна в GitHub

**Коммит:**
```
chore(infra): T-050 — создана структура папок для модулей
```

---

## ФАЗА 2: ИЗВЛЕЧЕНИЕ CSS (T-051 — T-054)

---

### T-051: Извлечь CSS-переменные

**Приоритет:** HIGH  
**Время:** 15 мин  
**Область:** css  
**Зависимости:** T-050

**Описание:**  
Создать `css/variables.css` со всеми CSS-переменными AWARA.

**Содержимое `css/variables.css`:**
```css
/* AWARA Design Tokens */
:root {
  /* Палитра золото-чёрный */
  --awara-gold-primary: #c9a84c;
  --awara-gold-bright: #ffd700;
  --awara-gold-light: #fff8d6;
  --awara-gold-soft: #ffe080;
  
  /* Фоны */
  --awara-bg-black: #000;
  --awara-bg-dark: #0a0a14;
  --awara-bg-cosmic: #1a1430;
  
  /* Типографика */
  --font-heading: 'Cinzel', serif;
  --font-body: 'Cormorant Garamond', serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Размеры */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Радиусы */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Тени */
  --glow-gold-soft: 0 0 10px rgba(201, 168, 76, 0.3);
  --glow-gold-bright: 0 0 25px rgba(255, 215, 0, 0.6);
  
  /* Анимации */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.6s ease;
}
```

**Шаги:**
1. Найти все CSS-переменные в `index.html`
2. Скопировать в новый файл `css/variables.css`
3. Удалить дубликаты, оставить чистые
4. **НЕ удалять** их из `index.html` пока (ломаются стили)
5. Закоммитить новый файл

**Definition of Done:**
- [ ] Файл `css/variables.css` создан
- [ ] Все цвета AWARA внутри
- [ ] Все шрифты внутри
- [ ] Файл валидный CSS (открыть в браузере)
- [ ] Закоммичено

**Коммит:**
```
refactor(css): T-051 — извлечены CSS-переменные в variables.css
```

---

### T-052: Извлечь типографику

**Приоритет:** HIGH  
**Время:** 15 мин  
**Область:** css  
**Зависимости:** T-051

**Описание:**  
Создать `css/typography.css` со всеми стилями текста.

**Содержимое `css/typography.css`:**
```css
/* AWARA Typography */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--awara-gold-primary);
  background: var(--awara-bg-black);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--awara-gold-bright);
}

h1 {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

h2 {
  font-size: 1.8rem;
}

code, .mono, [class*="number"] {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

/* Mobile-first breakpoints */
@media (min-width: 768px) {
  h1 { font-size: 3rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 3.5rem; }
}
```

**Шаги:**
1. Найти все стили шрифтов в `index.html`
2. Извлечь в `css/typography.css`
3. Использовать переменные из `variables.css`

**Definition of Done:**
- [ ] Файл `css/typography.css` создан
- [ ] Используются переменные из variables.css
- [ ] Mobile-first медиа-запросы есть
- [ ] Закоммичено

**Коммит:**
```
refactor(css): T-052 — извлечена типографика в typography.css
```

---

### T-053: Извлечь компоненты

**Приоритет:** HIGH  
**Время:** 20 мин  
**Область:** css  
**Зависимости:** T-052

**Описание:**  
Создать `css/components.css` со стилями кнопок, карточек, модалок.

**Структура `css/components.css`:**
```css
/* AWARA Components */

/* === Buttons === */
.btn {
  font-family: var(--font-heading);
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: 1px solid var(--awara-gold-primary);
  color: var(--awara-gold-bright);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn:hover {
  box-shadow: var(--glow-gold-bright);
  background: rgba(201, 168, 76, 0.1);
}

/* === Cards === */
.section-card {
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  transition: all var(--transition-normal);
}

.section-card:hover {
  border-color: var(--awara-gold-bright);
  box-shadow: var(--glow-gold-soft);
}

/* === Modals === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* === Progress Bars === */
.progress {
  height: 4px;
  background: rgba(201, 168, 76, 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--awara-gold-primary), var(--awara-gold-bright));
  transition: width var(--transition-slow);
}
```

**Шаги:**
1. Извлечь стили кнопок (`.btn`, `button`)
2. Извлечь стили карточек (`.card`, `.section-card`)
3. Извлечь стили модалок и оверлеев
4. Извлечь стили прогресс-баров
5. Использовать переменные

**Definition of Done:**
- [ ] Файл `css/components.css` создан
- [ ] Содержит кнопки, карточки, модалки, прогресс-бары
- [ ] Использует переменные из variables.css
- [ ] Закоммичено

**Коммит:**
```
refactor(css): T-053 — извлечены компоненты в components.css
```

---

### T-054: Создать главный CSS-файл и подключить

**Приоритет:** CRITICAL  
**Время:** 10 мин  
**Область:** css  
**Зависимости:** T-051, T-052, T-053

**Описание:**  
Создать `css/main.css` с импортами всех модулей и подключить к `index.html`.

**Содержимое `css/main.css`:**
```css
/* AWARA Main Stylesheet */
@import url('variables.css');
@import url('typography.css');
@import url('components.css');

/* Глобальные стили */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Звёздное небо фон */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, var(--awara-bg-cosmic) 0%, var(--awara-bg-black) 100%);
  z-index: -1;
}
```

**Шаги:**
1. Создать `css/main.css` с импортами
2. В `index.html` в `<head>` добавить:
   ```html
   <link rel="stylesheet" href="css/main.css">
   ```
3. Открыть в браузере — проверить, что стили грузятся
4. **НЕ удалять** старые inline-стили пока (постепенно)

**Definition of Done:**
- [ ] Файл `css/main.css` создан
- [ ] Импорты работают
- [ ] Подключен в `index.html`
- [ ] Сайт открывается, стили на месте
- [ ] Mobile-версия (375px) работает
- [ ] Закоммичено

**Коммит:**
```
refactor(css): T-054 — создан main.css и подключен к index.html
```

---

## ФАЗА 3: ИЗВЛЕЧЕНИЕ JS (T-055 — T-061)

---

### T-055: Извлечь константы и STAGES

**Приоритет:** HIGH  
**Время:** 15 мин  
**Область:** js/core  
**Зависимости:** T-054

**Описание:**  
Создать `js/core.js` с константами AWARA.

**Содержимое `js/core.js`:**
```javascript
// AWARA Core Constants
export const AWARA_VERSION = '0.1.0';

// Ранги Державы РА
export const STAGES = [
  { id: 0, name: 'ИНИЦИАТ', threshold: 0 },
  { id: 1, name: 'ВОИН СВЕТА', threshold: 3000 },
  { id: 2, name: 'МУДРЕЦ', threshold: 7000 },
  { id: 3, name: 'ЦАРЬ', threshold: 10000 },
  { id: 4, name: 'БУДДА', threshold: 25000 },
  { id: 5, name: 'ПЛАНЕТАРНЫЙ ЛОГОС', threshold: 50000 }
];

// Канон AWARA
export const CANON = {
  AGENTS_COUNT: 21,
  MATRICES_COUNT: 33,
  LOCAS_COUNT: 14,
  CHAKRAS_COUNT: 9,
  CARDS_COUNT: 63 // 21 × 3
};

// Палитра
export const COLORS = {
  GOLD_PRIMARY: '#c9a84c',
  GOLD_BRIGHT: '#ffd700',
  GOLD_LIGHT: '#fff8d6',
  BG_BLACK: '#000',
  BG_DARK: '#0a0a14'
};

// Storage keys
export const STORAGE_KEY = 'awara_v255_state';
```

**Definition of Done:**
- [ ] Файл `js/core.js` создан
- [ ] STAGES, CANON, COLORS экспортируются
- [ ] Использует ES6 modules (export)
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-055 — извлечены константы в core.js
```

---

### T-056: Извлечь state-management

**Приоритет:** HIGH  
**Время:** 20 мин  
**Область:** js/state  
**Зависимости:** T-055

**Описание:**  
Создать `js/state.js` для работы с localStorage.

**Содержимое `js/state.js`:**
```javascript
// AWARA State Management
import { STORAGE_KEY } from './core.js';

const DEFAULT_STATE = {
  totalLight: 0,
  level: 0,
  agent: null,
  matrix: 'vedic',
  initiationProgress: 0,
  tigelEntries: [],
  unlockedKeys: [],
  lastVisit: null
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('[AWARA] State load error:', e);
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('[AWARA] State save error:', e);
    return false;
  }
}

export function updateState(updates) {
  const current = loadState();
  const next = { ...current, ...updates, lastVisit: Date.now() };
  saveState(next);
  return next;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_STATE };
}

export function getLight() {
  return loadState().totalLight;
}

export function addLight(amount) {
  const state = loadState();
  state.totalLight += amount;
  saveState(state);
  return state.totalLight;
}
```

**Definition of Done:**
- [ ] Файл `js/state.js` создан
- [ ] Функции load/save/update/reset работают
- [ ] Тестово в консоли: `loadState()` возвращает объект
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-056 — извлечён state-management в state.js
```

---

### T-057: Извлечь общие UI-функции

**Приоритет:** MEDIUM  
**Время:** 20 мин  
**Область:** js/ui  
**Зависимости:** T-056

**Описание:**  
Создать `js/ui.js` с переиспользуемыми UI-функциями.

**Содержимое `js/ui.js`:**
```javascript
// AWARA UI Helpers

export function formatLight(raw) {
  return (raw / 1e10).toFixed(10);
}

export function showModal(content, title = '') {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
      <div class="modal-content">${content}</div>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.display = '';
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    element.style.opacity = Math.min(progress, 1);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function fadeOut(element, duration = 300) {
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    element.style.opacity = 1 - Math.min(progress, 1);
    if (progress < 1) requestAnimationFrame(step);
    else element.style.display = 'none';
  }
  requestAnimationFrame(step);
}

export function vibrate(pattern = [50]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

export function getCurrentBreakpoint() {
  const w = window.innerWidth;
  if (w < 375) return 'xs';
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}
```

**Definition of Done:**
- [ ] Файл `js/ui.js` создан
- [ ] Все функции экспортируются
- [ ] formatLight работает: `formatLight(1500)` → `"0.0000001500"`
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-057 — извлечены UI-помощники в ui.js
```

---

### T-058: Извлечь канон-loader

**Приоритет:** HIGH  
**Время:** 15 мин  
**Область:** js/canon  
**Зависимости:** T-057

**Описание:**  
Создать `js/canon.js` для загрузки данных канона из JSON.

**Содержимое `js/canon.js`:**
```javascript
// AWARA Canon Loader
import { CANON } from './core.js';

let _agents = null;
let _matrices = null;
let _agentMatrixMap = null;

export async function loadAgents() {
  if (_agents) return _agents;
  const res = await fetch('data/agents.json');
  _agents = await res.json();
  if (_agents.length !== CANON.AGENTS_COUNT) {
    console.error(`[AWARA] Канон нарушен: agents.length = ${_agents.length}, ожидалось ${CANON.AGENTS_COUNT}`);
  }
  return _agents;
}

export async function loadMatrices() {
  if (_matrices) return _matrices;
  const res = await fetch('data/matrices.json');
  _matrices = await res.json();
  if (_matrices.length !== CANON.MATRICES_COUNT) {
    console.error(`[AWARA] Канон нарушен: matrices.length = ${_matrices.length}, ожидалось ${CANON.MATRICES_COUNT}`);
  }
  return _matrices;
}

export async function loadAgentMatrixMap() {
  if (_agentMatrixMap) return _agentMatrixMap;
  const res = await fetch('data/agent_matrix_map.json');
  _agentMatrixMap = await res.json();
  return _agentMatrixMap;
}

export async function getAgentByMatrix(agentId, matrixId) {
  const map = await loadAgentMatrixMap();
  return map[agentId]?.[matrixId] || null;
}

// Предзагрузка всего канона
export async function preloadCanon() {
  await Promise.all([
    loadAgents(),
    loadMatrices(),
    loadAgentMatrixMap()
  ]);
  console.log('[AWARA] Канон загружен:', {
    agents: _agents.length,
    matrices: _matrices.length
  });
}
```

**Definition of Done:**
- [ ] Файл `js/canon.js` создан
- [ ] Все loaders работают
- [ ] Проверка канона (21/33) логируется в консоль
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-058 — извлечён canon-loader в canon.js
```

---

### T-059: Извлечь логику лобби

**Приоритет:** HIGH  
**Время:** 25 мин  
**Область:** js/lobby  
**Зависимости:** T-058

**Описание:**  
Создать `js/lobby.js` с логикой главной страницы.

**Что должно быть:**
- Инициализация лобби (после DOMContentLoaded)
- Анимация центрального солнца
- Обновление счётчика светкоина
- Таймер
- Обработка кликов по разделам (ИГРА, СМЫСЛ ДНЯ и т.д.)
- Переход к экранам

**Definition of Done:**
- [ ] Файл `js/lobby.js` создан
- [ ] Импортирует из core/state/ui/canon
- [ ] Экспортирует функцию `initLobby()`
- [ ] В index.html: `<script type="module">import { initLobby } from './js/lobby.js'; initLobby();</script>`
- [ ] Главная страница работает
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-059 — извлечена логика лобби в lobby.js
```

---

### T-060: Извлечь логику игры

**Приоритет:** HIGH  
**Время:** 25 мин  
**Область:** js/game  
**Зависимости:** T-059

**Описание:**  
Создать `js/game.js` с логикой раздела ИГРА (Пространства, Земля, Вселенная, Мироздание).

**Definition of Done:**
- [ ] Файл `js/game.js` создан
- [ ] Логика переключения между Пространствами/Землёй/Вселенной/Мирозданием
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-060 — извлечена логика игры в game.js
```

---

### T-061: Извлечь логику Космоса (Вселенная)

**Приоритет:** MEDIUM  
**Время:** 30 мин  
**Область:** js/universe  
**Зависимости:** T-060

**Описание:**  
Создать `js/universe.js` с космической визуализацией (орбиты, планеты, солнце РА).

**Definition of Done:**
- [ ] Файл `js/universe.js` создан
- [ ] Анимация орбит работает
- [ ] Планеты-агенты отображаются
- [ ] Закоммичено

**Коммит:**
```
refactor(js): T-061 — извлечена логика Вселенной в universe.js
```

---

## ФАЗА 4: РАЗБИВКА ЭКРАНОВ (T-062 — T-069)

---

### T-062: Создать tigel.html

**Приоритет:** HIGH  
**Время:** 30 мин  
**Область:** screens/tigel  
**Зависимости:** T-061

**Описание:**  
Извлечь экран Вечернего Тигеля из index.html в отдельный файл `tigel.html`.

**Структура:**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Тигель — AWARA</title>
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <!-- HTML тигеля -->
  
  <script type="module">
    import { initTigel } from './js/tigel.js';
    initTigel();
  </script>
</body>
</html>
```

**Шаги:**
1. Создать `tigel.html`
2. Перенести HTML тигеля из index.html
3. Создать `js/tigel.js` с логикой
4. В index.html заменить кнопку "Открыть Тигель" на ссылку: `<a href="tigel.html">`
5. Проверить, что работает

**Definition of Done:**
- [ ] Файл `tigel.html` создан
- [ ] Файл `js/tigel.js` создан
- [ ] Из лобби можно перейти в Тигель
- [ ] Mobile (375px) работает
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-062 — Тигель вынесен в tigel.html
```

---

### T-063: Создать dashboard.html

**Приоритет:** HIGH  
**Время:** 25 мин  
**Область:** screens/dashboard  
**Зависимости:** T-062

**Описание:**  
Извлечь Дашборд в отдельный файл `dashboard.html`.

**Definition of Done:**
- [ ] Файл `dashboard.html` создан
- [ ] Файл `js/dashboard.js` создан
- [ ] Светкоин, вклад, топ работают
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-063 — Дашборд вынесен в dashboard.html
```

---

### T-064: Создать universe.html

**Приоритет:** MEDIUM  
**Время:** 30 мин  
**Область:** screens/universe  
**Зависимости:** T-063

**Описание:**  
Извлечь Космос (Вселенная Игрока) в отдельный файл `universe.html`.

**Definition of Done:**
- [ ] Файл `universe.html` создан
- [ ] Космическая визуализация работает
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-064 — Вселенная вынесена в universe.html
```

---

### T-065: Создать matrix.html

**Приоритет:** MEDIUM  
**Время:** 25 мин  
**Область:** screens/matrix  
**Зависимости:** T-064

**Описание:**  
Извлечь Матрицу Восприятия в `matrix.html`.

**Definition of Done:**
- [ ] Файл `matrix.html` создан
- [ ] Переключение между 33 матрицами работает
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-065 — Матрица вынесена в matrix.html
```

---

### T-066: Создать cards.html

**Приоритет:** MEDIUM  
**Время:** 25 мин  
**Область:** screens/cards  
**Зависимости:** T-065

**Описание:**  
Извлечь Колоду Карт в `cards.html`.

**Definition of Done:**
- [ ] Файл `cards.html` создан
- [ ] 63 карты (21 агент × 3 матрицы) отображаются
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-066 — Колода вынесена в cards.html
```

---

### T-067: Создать oracle.html

**Приоритет:** LOW  
**Время:** 20 мин  
**Область:** screens/oracle  
**Зависимости:** T-066

**Описание:**  
Извлечь Оракул в `oracle.html`.

**Definition of Done:**
- [ ] Файл `oracle.html` создан
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-067 — Оракул вынесен в oracle.html
```

---

### T-068: Создать passport.html

**Приоритет:** LOW  
**Время:** 20 мин  
**Область:** screens/passport  
**Зависимости:** T-067

**Описание:**  
Извлечь Паспорт Души в `passport.html`.

**Definition of Done:**
- [ ] Файл `passport.html` создан
- [ ] Закоммичено

**Коммит:**
```
refactor(screens): T-068 — Паспорт вынесен в passport.html
```

---

### T-069: Очистить index.html

**Приоритет:** CRITICAL  
**Время:** 30 мин  
**Область:** cleanup  
**Зависимости:** T-068

**Описание:**  
Удалить из `index.html` всё, что вынесено в другие файлы. Оставить только лобби.

**Шаги:**
1. Удалить inline `<style>` (всё уже в css/)
2. Удалить inline `<script>` (всё уже в js/)
3. Удалить HTML других экранов (всё в *.html)
4. Подключить только: `css/main.css` и `js/lobby.js`

**Целевой размер index.html:** 50-100 KB (вместо 1 MB)

**Definition of Done:**
- [ ] index.html весит меньше 150 KB
- [ ] Лобби работает
- [ ] Переходы к другим экранам работают
- [ ] Mobile (375px) работает
- [ ] Закоммичено

**Коммит:**
```
refactor(cleanup): T-069 — index.html очищен, оставлено только лобби
```

---

## ФАЗА 5: ФИНАЛИЗАЦИЯ (T-070 — T-072)

---

### T-070: Mobile-pass всех экранов

**Приоритет:** CRITICAL  
**Время:** 20 мин  
**Область:** qa  
**Зависимости:** T-069

**Описание:**  
Проверить все экраны на 375 / 768 / 1024 px.

**Шаги:**
1. Открыть DevTools → Toggle device toolbar
2. Проверить каждый экран на iPhone SE (375px):
   - index.html (лобби)
   - tigel.html
   - dashboard.html
   - universe.html
   - matrix.html
   - cards.html
   - oracle.html
   - passport.html
3. Сделать скриншоты
4. Зафиксировать баги в `docs/mobile-pass-report.md`

**Definition of Done:**
- [ ] Все экраны проверены на 375 / 768 / 1024
- [ ] Скриншоты в `docs/screenshots/`
- [ ] Отчёт в `docs/mobile-pass-report.md`
- [ ] Критичные баги — созданы задачи T-073+
- [ ] Закоммичено

**Коммит:**
```
test(qa): T-070 — mobile-pass всех экранов после рефакторинга
```

---

### T-071: Создать недостающие data-файлы

**Приоритет:** HIGH  
**Время:** 30 мин  
**Область:** data  
**Зависимости:** T-070

**Описание:**  
Создать `data/locas.json`, `data/chakras.json`, `data/cards.json` согласно канону.

**Содержимое:**
- `locas.json` — 14 лок (плотностей)
- `chakras.json` — 9 чакр-мер
- `cards.json` — 63 карты (21 × 3)

**Definition of Done:**
- [ ] data/locas.json (14 элементов)
- [ ] data/chakras.json (9 элементов)
- [ ] data/cards.json (63 элемента)
- [ ] Канон проверен (canon.js)
- [ ] Закоммичено

**Коммит:**
```
feat(data): T-071 — добавлены locas.json, chakras.json, cards.json
```

---

### T-072: Финальный smoke test и документация

**Приоритет:** CRITICAL  
**Время:** 20 мин  
**Область:** docs/qa  
**Зависимости:** T-071

**Описание:**  
Финальная проверка и обновление документации.

**Шаги:**
1. Smoke test: открыть сайт, пройти по всем экранам
2. Проверить, что нет ошибок в консоли
3. Обновить `README.md` с новой структурой
4. Обновить `AWARA_RULES.md` — отметить рефакторинг как завершённый
5. Создать `docs/architecture.md` с финальной структурой

**Definition of Done:**
- [ ] Сайт работает без ошибок
- [ ] README обновлён
- [ ] Архитектура задокументирована
- [ ] Финальный размер index.html: ≤150 KB
- [ ] Закоммичено

**Коммит:**
```
docs(architecture): T-072 — финализация рефакторинга, обновлена документация
```

---

## ИТОГИ

**Всего задач:** 24 (T-049 → T-072)  
**Суммарное время:** ~8-10 часов работы  
**Распределение:**
- ФАЗА 1 (подготовка): 2 задачи / 25 мин
- ФАЗА 2 (CSS): 4 задачи / 60 мин
- ФАЗА 3 (JS): 7 задач / 150 мин
- ФАЗА 4 (экраны): 8 задач / 200 мин
- ФАЗА 5 (финализация): 3 задачи / 70 мин

**Ожидаемый результат:**
- ✅ index.html: 1 MB → 100 KB (в 10 раз меньше!)
- ✅ Чистая модульная структура
- ✅ Devin-конфликты исчезают (разные файлы)
- ✅ Быстрая загрузка
- ✅ Удобный поиск и навигация

---

## ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ

**День 1:** T-049, T-050, T-051, T-052, T-053, T-054 (Фаза 1+2)  
**День 2-3:** T-055 — T-061 (Фаза 3 — JS)  
**День 4-6:** T-062 — T-068 (экраны по одному)  
**День 7:** T-069 (очистка index.html)  
**День 8:** T-070, T-071, T-072 (финал)

---

## ПРОТОКОЛ ВЫДАЧИ ЗАДАЧ DEVIN

Когда даёшь задачу Devin, пиши так:

```
Devin, выполни задачу T-XXX из docs/refactor-tasks.md.

Перед началом:
1. Прочитай AWARA_RULES.md
2. Убедись, что задача T-(XXX-1) смерджена в master
3. Создай feature-ветку: refactor/T-XXX

После завершения:
1. Сделай скриншот mobile (375px)
2. Запушь и создай PR
3. Жди ревью от Pavel'а

Канон: 21/33/14/9 — не нарушать.
Эмодзи — нет.
Русский язык.
```

---

## ПРАВИЛА БЕЗОПАСНОСТИ

1. **Бэкап перед началом:** `git tag v0.1.0-before-refactor`
2. **Каждая задача в отдельной ветке:** `refactor/T-XXX`
3. **PR-ревью обязателен** перед мерджем в master
4. **Откат при проблемах:** `git revert <commit>`
5. **Не удаляй старый код**, пока новый не работает (комментируй)

---

**Удачи! Через 8 дней у тебя будет идеальная архитектура AWARA.**

— *Pavel Burdinov / Victorian Piera-Verdi*  
— *Создано Claude, 2026-05-16*
