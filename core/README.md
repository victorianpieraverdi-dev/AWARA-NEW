# AWARA `core/` — трансформированный движок (WebGL / Three.js / GSAP)

> Дата: 2026-06-07 · Статус: архитектурный каркас (skeleton)

Это **новый слой** поверх существующего проекта. Старые `.html`-экраны НЕ трогаются — перенос идёт постепенно, узел за узлом.

## Структура

```
core/
  types.ts                      Состояние игрока, стихии, чакры, NodeId
  state/
    nodes.ts                    Граф узлов 0–7 + legacyHref на старые экраны
    StateManager.ts             Навигация + GSAP-переходы (zoom-in/out, не слайды)
  ai/
    VoiceOfTruth.ts             Голос Истины: дневник → стихии → Сок по чакрам
  render/
    DimensionalMaterial.ts      Three.js ShaderMaterial (uLight 0..1)
    shaders/dimensional.glsl.ts Шейдер плоское↔объёмное
  index.ts                      Публичный barrel + пример bootstrap
```

## Узлы (STATES) ↔ старые экраны

| Узел | Название | Направление | legacy `.html` |
|------|----------|-------------|----------------|
| 0 | Исток и Пустота | — (старт) | `dzyan.html` |
| 1 | Макрокосм (Тор) | zoom in из 0 | `multiverse-map.html` |
| 2 | Лобби (Золотое Яйцо) | центр / крест | `index.html` |
| 3 | Информация и Матрицы | ЗАПАД | `matrices.html` |
| 4 | Даймон | ЮГ | `daimon.html` |
| 5 | Тигель / Звёздные Храмы | ВОСТОК | `tigel.html` |
| 6 | Световая Игра | СЕВЕР | `nine-measures.html` |
| 7 | Держава RA (Endgame) | zoom in из 6 | `dashboard.html` |

Навигация крестом из лобби (Васту): ЮГ→Даймон, СЕВЕР→Игра, ЗАПАД→Матрицы, ВОСТОК→Тигель.

## Ключевые блоки (из задания)

1. **State Manager 0→1→2** — `StateManager.runIntro()`; переходы делегируются `CameraRig` (GSAP zoom).
2. **`VoiceOfTruth`** — маршрутизация энергии: `ingestDiary()` извлекает стихии, распределяет Сок по 7 чакрам, при энтропии предлагает квесты. Работает offline; LLM опционален.
3. **Шейдер `uLight`** — `DimensionalMaterial.setLight(0..1)`: при 0 плоско/монохром, при 1 объём/цвет/bloom-rim.

## Запуск (нужен бандлер — это и есть "новый процесс")

Текущий проект — чистый HTML без сборки. Для этого слоя нужен Vite + TypeScript:

```bash
npm i -D vite typescript
npm i three gsap
npm i -D @types/three
```

Добавь в `package.json`: `"dev": "vite"`, `"build": "vite build"`. Точка входа нового движка — `core/index.ts`.

## План постепенного переноса

1. Поднять Vite-стенд (`/app`), рендерить узлы 0→1→2 нативно на Three.js.
2. Остальные узлы (3–7) пока открывать через `legacyHref` (iframe/redirect), постепенно заменяя на нативные сцены.
3. Перенести `playerState.js` → `core/types.ts` (PlayerState) как единый источник.
4. Подключить `VoiceOfTruth` к реальному LLM и аудиодневнику.
5. Включить Bloom/post-processing (EffectComposer) для rim-свечения шейдера.
