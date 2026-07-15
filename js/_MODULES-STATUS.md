# Статус ES6-модулей (js/*-module.js)

**Решение от 2026-06-02:** инлайн-реализация в `index.html` — КАНОН (единственный источник истины).

ES6-модули `core-module.js`, `state-module.js`, `ui-module.js`, `canon-module.js`,
`lobby-module.js`, `menu-module.js`, `game-module.js` (и связанные `test-*-module.html`)
— ОТЛОЖЕННЫЙ ЭКСПЕРИМЕНТ. **НЕ подключать к `index.html` как есть.**

## Почему нельзя просто подключить (мины)
1. **Разный ключ состояния.** Модули читают `awara_v255_state` (`core-module.js` → `STORAGE_KEYS.STATE`),
   а живая игра — `awara_v258_state`. Подключение как есть обнулит лобби (свет 0, ранг ИНИЦИАТ,
   агент «Не выбран») и раздвоит прогресс между двумя сторами.
2. **Никогда не подключались.** В шапке `core-module.js`: «Не подключён к index.html (будет в T-058)».
3. **Зависимость от данных.** `canon-module.js` делает `fetch('data/agents.json' | 'matrices.json' | ...)`.
   Если файлов нет — канон падает с ошибками в консоли.
4. **Расхождение канона.** В модуле `CARDS_COUNT = 1578`, в проекте канон — 63 карты / 693 пары.

## Что нужно для безопасной миграции (отдельный проект, не сейчас)
1. Свести состояние: `STORAGE_KEYS.STATE` → `'awara_v258_state'` + адаптер форматов
   (схемы инлайн-стора и модульного `{totalLight, level, agent, matrix, ...}` разные).
2. Обеспечить `data/*.json` с верными числами ИЛИ переписать `canon-module.js` на инлайн-канон.
3. Добавить `data-*`-хуки в инлайн-разметку лобби:
   `data-section`, `data-central-sun`, `data-light-counter`, `data-level-name`, `data-agent-name`.
4. Подключить `<script type="module">` + вызвать `initLobby()`/`initGame()`; развести дубли
   (`window.openGameSpaces` и пр. vs событие `awara:section`).
5. Прогнать через `js/test-lobby-module.html`.

## Примечание
Тест-харнессы `test-*-module.html` самодостаточны (импортируют модули относительными путями)
и работают изолированно — трогать их не нужно.
