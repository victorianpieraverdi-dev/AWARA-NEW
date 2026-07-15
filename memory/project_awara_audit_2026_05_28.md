---
name: project-awara-audit-2026-05-28
description: "AWARA live-site audit (2026-05-28, GitHub Pages prod) — drift items with current status: state keys + Temple 404 + lobby monolith still open; passport Milost partially fixed."
metadata: 
  node_type: memory
  type: project
  originSessionId: 00f9b4ed-fd7d-4be6-b6d3-a9381e9b3c8f
---

Snapshot audit of `victorianpieraverdi-dev/awara-game` — verified against **live GitHub Pages prod** (https://victorianpieraverdi-dev.github.io/awara-game/) on 2026-05-28. Original audit on 2026-05-28 was against repo HEAD `083ccd6`; this updates per-item status from live HTML/JS.

**Why this matters:** Pavel: "в прошлый раз мы нашли кучу нестыковок и потихоньку правили". Drift between TASKS.md and code is recurring. See [[feedback-awara-verify-not-trust]].

**How to apply:** Before claiming a task is done, grep for the actual exports / DOM ids / localStorage keys in the DoD. List below = open inconsistency list as of 2026-05-28; re-check before re-asserting. Live URLs and line numbers refer to deployed prod HTML.

## Drift items (priority order, with live status)

1. **Passport Milost — частично починен.** ✅ `awara_milost_today` больше нигде нет. ✅ `passport.html:413` импортирует v2 API (`getCurrentSource`, `getSourceMultiplier`, `checkVeilBreach`, `getMacrocosmMessage`). ⚠️ `MILOST_SOURCE_META` ещё на строке 447, рендер на 533 — нужно проверить, переведён ли список на 7 v2-источников по лучам или остался v1-четвёрка (jupiter / dayNakshatra / birthNakshatra / intentionPurity). Если v1 — рендер показывает мёртвый список.

2. **Три ключа state живут одновременно на проде.** ❌ ОТКРЫТО.
   - Канон `awara_v258_state` через `js/playerState.js` (есть миграция из `awara_v255_state`, строки 7-8, 47-68).
   - Прямые `setItem('awara_v255_state', …)` в `index.html:10041, 12132, 12206`; `STATE_KEY='awara_v255_state'` в `mind-space.html:215` — обход playerState.
   - Прямые `getItem('awara_player_state')` в `tigel.html:1069`, `milost.html:270,277`, `passport.html` (несколько мест), `index.html:1655` — третья переменная.
   - Итог: миграция v255→v258 спасает только модули через playerState.js. Тигель/Милость/Паспорт/лобби читают/пишут `awara_player_state`. Состояние де-факто рассинхронизировано.

3. **`docs/screen-status.md` устарел.** Не проверял в этом проходе — статус по предыдущему аудиту.

4. **Temple v2 limbo — подтверждено.** ❌ `temple.html` → **404**. Данные `data/temple-upgrades.json` (2.9 KB) и `data/temple-ecosystems.json` (19.9 KB) залиты. В лобби `index.html:10791` есть buildings с `id:'temple'` как embed внутри лобби, но отдельной страницы нет. E-012..E-017 не закрыты.

5. **TASKS.md DoD T-073/T-074/T-075** — отсылка к мёртвому v1 Milost API. Не пере-верифицировано в этом проходе.

6. **mind-space.html на старом ключе.** ❌ `STATE_KEY='awara_v255_state'` на строке 215. Часть пункта 2.

7. **Локальная ветка `task/T-004-agent-hero-dashboard` повторяет уже-в-проде.** ❌ `dashboard.html:432-434` — div `#hero-agent`; `dashboard.html:779-780` — fetch `data/agents.json` + `data/agent_matrix_map.json`. Оба файла существуют (4.4 KB / 151 KB). Ветку либо мерджить (если содержит улучшения), либо удалять. Перед действием: `git diff main..task/T-004-agent-hero-dashboard`.

8. **T-034 over-delivered.** ✅ Подтверждено: `js/oracle.js:24-50` — 5 контекстов: `day` / `matrix` / `mirror` / `archivist` / `daimon`. TASKS.md говорит 4. Не баг, но недоучёт.

## Новые находки (2026-05-28 live audit)

9. **Лобби `index.html` — монолит 16 381 строка / 994 KB.** 38 inline `<script>`/`<style>` блоков + 7 внешних скриптов (`core.js`, `ui.js`, `spheres.js`, `init.js`, `shambhala-calendar.js`, `mechanics.js`, `awara-ai.js`). Внутри inline: маркетплейс с формой ввода, SVG-ворота, чат с мудрецом, дневник, банк света, sphere unlock UI. Memory `[[project-awara-roadmap]]` про "78× shrink" — не про лобби; лобби осталось толстым. Самая хрупкая поверхность для регрессий — любая правка тут рискует ломать соседнее.

10. **Дубль страниц инициации.** `initiation-space.html` (412 KB) и `initiation-corridor.html` (794 KB) — обе живы и отдают 200. Какая канон, какая legacy — по именам не разобрать. Одна из них вероятно подлежит архивации.

11. **«Coming soon» / «в разработке» видны в production lobby:**
    - `index.html:4075` — «⚡ Разблокировать сферу — 1-3 ключа (в разработке)»
    - `index.html:11068` — «Скоро · В разработке»
    - `index.html:16096` — «Coming soon»
    Не баг, но игроку сразу видно недоделанное.

## Fix order recommended (по live-аудиту)

1. **Унификация state-ключа** (item 2 + 6) — инфраструктура, блокирует остальное. Заменить прямые `awara_v255_state` / `awara_player_state` в `index.html`, `tigel.html`, `milost.html`, `passport.html`, `mind-space.html` на вызовы `playerState.js`. Прогнать миграцию.
2. **T-004 ветка** (item 7) — diff vs main → решение мердж/удалить. Бесплатное действие.
3. **MILOST_SOURCE_META** в `passport.html:447` (item 1) — проверить v1 vs v2.
4. **Temple v2** (item 4) — либо `temple.html` поверх уже залитого JSON, либо формальный defer E-012..E-017.
5. **Лобби decompose** (item 9) — крупный рефакторинг, не разовая правка. Нужен план.
6. **Initiation дубль** (item 10) — архивировать legacy после уточнения у Павла.
7. **Coming-soon тексты** (item 11) — либо реализовать, либо скрыть.
8. **TASKS.md cleanup** (items 5, 8).

## Caveat

Это статический разбор HTML/JS, не реальный браузер. JS-стейт и поведение после кликов (что игрок видит) не проверены — для этого нужен Playwright локально. Но структурные пункты (3 ключа, 404 Храма, T-004 на проде, 5 контекстов, дубль инициации, объём лобби) видны без запуска.

Related: [[user-pavel-awara]], [[project-awara-roadmap]], [[reference-awara-repo]], [[feedback-awara-verify-not-trust]], [[reference-awara-kb-obsidian]].
