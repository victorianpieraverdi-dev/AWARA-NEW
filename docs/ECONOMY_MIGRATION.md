# AWARA — Миграция экономики (P2)

**Дата:** 13.06.2026
**Цель:** свести ДВЕ экономики света в одну каноничную, без потери прогресса игроков.

---

## 1. Две текущие модели

### LEGACY (`awara_v258_state`, `js/core.js`, `js/universe/universeProgression.js`)

- Валюта: `totalLight` (целое, накопительное).
- Пороги Души v2: foundation **50** / heart **150** / mind **300**; подсферы ×3 на **500/2000**.
- Уровни вселенной: ahamkara **0** / soul **500** / jiva **2000** / spirit **7000** / sobor **25000** / board **100000**.
- Державы РА (STAGES): **0 / 3000 / 7000 / 10000 / 25000 / 50000** → ИНИЦИАТ → ВОИН СВЕТА → МУДРЕЦ → ЦАРЬ → БУДДА → ПЛАНЕТАРНЫЙ ЛОГОС.
- Ауры: 25/100/250. Tigel gate: `totalLight ≥ 200`.

### NEW (`core/types.ts`, `core/ai/VoiceOfTruth.ts`)

- Кристалл = 1 доброе дело; **10 000 кристаллов = 1 светмонета**.
- `light` ∈ `0..1` (среднее по чакрам/мерам).
- `colorLevel` 0–4 (gray → spectrum), `renderTier` 0–5 (flat → laws sandbox).
- `PlayerState`: `crystalsTotal`, `light`, `renderTierSelected`, `powerSources[]`, `subtleLinks[]`.
- Функции: `lightCoins`, `crystalsInCoin`, `lightProgress`, `colorLevel`, `renderTier`, `effectiveTier`, `freeCrystals`, `sourceCostCrystals`, `linkCostCrystals`.

---

## 2. Решение (предложение)

**Канонична NEW-модель** (кристаллы/светмонеты + `light 0..1`), потому что:
- явно разделяет «сырой вклад» (кристаллы) и «состояние» (`light`);
- ложится на рендер (`colorLevel`/`renderTier`/шейдер `DimensionalMaterial`);
- живёт в чистом TS-ядре без DOM.

**LEGACY `totalLight` становится источником кристаллов** (1 ед. light → 1 кристалл), а уровни/ранги пересчитываются.

---

## 3. Таблица соответствия уровней

| Свет (legacy) | Уровень Души | colorLevel | renderTier |
|---|---|---|---|
| 0 | Ахамкара | 0 | 0 |
| 500 | Душа | 1 | 1 |
| 2000 | Джива | 2 | 2 |
| 7000 | Дух | 3 | 3 |
| 25000 | Собор | 4 | 4 |
| 100000 | Игра Мироздания | 4 | 5 |

> Державы РА (0/3000/7000/10000/25000/50000) — это ОТДЕЛЬНАЯ ось «ранг служения» (endgame, узел 7), а не уровень Души. Сохранить как `raPowerRank`, считать от того же `crystalsTotal`.

---

## 4. Алгоритм миграции (псевдокод)

```ts
// core/economy/migrate.ts
export function migrateLegacyState(legacy: LegacyV258): PlayerState {
  const totalLight = legacy.totalLight ?? 0
  return {
    crystalsTotal: totalLight,                 // 1:1 перенос
    light: clamp01(deriveLightFromChakras(legacy) ?? totalLight / 100000),
    soulLevel: soulLevelFromCrystals(totalLight),    // таблица ⑹ 3
    colorLevel: colorLevelFromCrystals(totalLight),
    renderTierSelected: legacy.renderTier ?? renderTierFromCrystals(totalLight),
    raPowerRank: raRankFromCrystals(totalLight),     // 0/3000/7000/10000/25000/50000
    powerSources: legacy.powerSources ?? [],
    subtleLinks: legacy.subtleLinks ?? [],
    _migratedFrom: 'v258',
    _migratedAt: Date.now(),
  }
}

// Идемпотентный входной хук
export function loadPlayerState(): PlayerState {
  const v = localStorage.getItem('awara_player_v1')
  if (v) return JSON.parse(v)
  const legacyRaw = localStorage.getItem('awara_v258_state')
  if (legacyRaw) {
    const migrated = migrateLegacyState(JSON.parse(legacyRaw))
    localStorage.setItem('awara_player_v1', JSON.stringify(migrated))
    return migrated      // старый ключ НЕ удаляем (откат)
  }
  return defaultPlayerState()
}
```

---

## 5. Порядок внедрения

1. `core/economy/`: константы порогов + функции из §3.
2. `migrate.ts` + `loadPlayerState` (идемпотентно, старый ключ сохраняем).
3. Перевести чтение/запись света во всех legacy-модулях на единый API.
4. Смок-тест: старый сейв → открывается, уровень/цвет/tier совпадают с ожиданием.
5. Через 1–2 релиза — убрать чтение старого ключа.

**Готово, когда:** в коде одна экономика, старые сейвы мигрируют без потерь, ранг РА разведён с уровнем Души.
