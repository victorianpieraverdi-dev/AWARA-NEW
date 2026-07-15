# tigel-core

Типизированное (TypeScript) ядро движка **AWARA / ТИГЕЛЬ**. Читает реальные данные канона из `C:\AWARA\data\*.json` и строит «Ключ дня», из которого рождаются **Арт дня** и **Трек дня**.

## Что делает

- **`dayKey(state?)`** — детерминированный ключ дня: агент (из 21) + матрица-линза + стихия + уровень Света. Сид берётся от натальной накшатры игрока.
- **`artOfDay(state?)`** — реальная карта из `card_prompts.json` (картинка `cards/<id>.webp` + готовый image-промт + negative). Если карты нет — собирает промт из агента.
- **`trackOfDay(state?)`** — BPM / тональность / рага / инструменты / мантра по стихии Даймона + Suno/Udio-промт.
- **`boot()`** — грузит данные и встраивает FAB 🎴 (слева внизу) + модалку «Генератор дня».

## Источники данных (`/data/`)

`agents.json` (21 агент), `card_prompts.json` (карты + промты), `locas.json` (14 лок), `chakras.json` (9 чакр), `daimon-stages.json` (стадии Даймона).

## Сборка

```bash
npm i
npm run build      # → dist/index.js
# скопировать dist/index.js в tigel-core.global.js (браузерный глобал)
```

Без import/export — `tsc` выдаёт плоский скрипт, который кладёт `window.TigelCore`.

## Подключение (уже сделано в `tigel-app.html`)

```html
<script src="tigel-core/tigel-core.global.js"></script>
<script>try{window.TigelCore&&TigelCore.boot();}catch(e){}</script>
```

Ядро аддитивное: читает STATE из `localStorage['tigel_v1']`, ничего не ломает в основном движке.
