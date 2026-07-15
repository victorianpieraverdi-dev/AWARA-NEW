// core/economy — единый «дом» экономики света и миграции старых сейвов.
//
// Где что лежит (важно, чтобы НЕ плодить дубли):
//   • Базовые константы и формулы (CRYSTALS_PER_COIN, lightCoins,
//     colorLevel, renderTier, effectiveTier, freeCrystals, цены связей T5 …)
//     живут в core/types.ts. Импортируйте их оттуда (или из "../").
//   • Здесь — только то, чего там нет: миграция старого сейва
//     и презентационные оси прогресса (Уровни Души, Державы РА).
//
// Пример:
//   import { loadPlayerState, savePlayerState, soulLevelIndex } from "./core/economy"
//   let player = loadPlayerState()         // сам мигрирует старый сейв при нужде
//   const lvl = soulLevelIndex(player.crystalsTotal)

export * from "./migrate"
