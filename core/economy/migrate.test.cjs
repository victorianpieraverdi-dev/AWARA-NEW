// Тесты миграции экономики света (docs/ECONOMY_MIGRATION.md).
// Запуск: npm run test:economy
//   (сначала tsc компилирует core/economy/migrate.ts + core/types.ts в .test-build/,
//    затем node --test гоняет этот файл; фреймворк — встроенный node:test, без новых зависимостей).

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const migrate = require(path.join(__dirname, "..", "..", ".test-build", "economy", "migrate.js"));
const types = require(path.join(__dirname, "..", "..", ".test-build", "types.js"));

const {
  migrateLegacyState,
  loadPlayerState,
  syncLegacyLight,
  soulLevelIndex,
  raRankIndex,
  LEGACY_STORAGE_KEY,
  PLAYER_STORAGE_KEY,
} = migrate;
const { lightCoins, colorLevel, renderTier } = types;

// Мок localStorage (Storage), чтобы не зависеть от браузера.
class MemStorage {
  constructor(init = {}) {
    this.map = new Map(Object.entries(init));
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}

const legacyJSON = (totalLight, extra = {}) =>
  JSON.stringify({ totalLight, sphereData: {}, spirit: {}, ...extra });

test("migrateLegacyState: totalLight 2500 -> 2500 кристаллов, 1:1", () => {
  const p = migrateLegacyState({ totalLight: 2500 });
  assert.equal(p.crystalsTotal, 2500);
  // light = прогресс к следующей светмонете (2500/10000)
  assert.equal(p.light, 0.25);
  // 0 полных светмонет -> colorLevel 0, renderTier 0
  assert.equal(lightCoins(p.crystalsTotal), 0);
  assert.equal(colorLevel(lightCoins(p.crystalsTotal)), 0);
  assert.equal(renderTier(lightCoins(p.crystalsTotal)), 0);
  assert.equal(p.renderTierSelected, 0);
  // Презентационные оси: 2500 >= 2000 -> Джива (2); < 3000 -> ИНИЦИАТ (0)
  assert.equal(soulLevelIndex(p.crystalsTotal), 2);
  assert.equal(raRankIndex(p.crystalsTotal), 0);
  // Метки миграции и отметка моста
  assert.equal(p._migratedFrom, "v258");
  assert.equal(typeof p._migratedAt, "number");
  assert.equal(p.legacyLightSeen, 2500);
});

test("migrateLegacyState: стихии рус. -> en, битые значения отбрасываются", () => {
  const p = migrateLegacyState({
    totalLight: 10,
    elements: { "Огонь": 5, "Вода": 2, "Мусор": 9, "Земля": "не число" },
  });
  assert.deepEqual(p.elements, { earth: 0, water: 2, fire: 5, air: 0, ether: 0 });
});

test("migrateLegacyState: выбранный renderTier клампится по разблокированному", () => {
  // 250000 кристаллов = 25 светмонет: renderTier max 3 (пороги 0/1/7/21/63/189)
  const p = migrateLegacyState({ totalLight: 250000, renderTier: 9 });
  assert.equal(p.crystalsTotal, 250000);
  assert.equal(p.renderTierSelected, 3);
  assert.equal(colorLevel(lightCoins(p.crystalsTotal)), 4); // 25 >= 25
  assert.equal(soulLevelIndex(p.crystalsTotal), 5); // >= 100000
  assert.equal(raRankIndex(p.crystalsTotal), 5); // >= 50000
});

test("migrateLegacyState: пустой/битый totalLight -> 0, отрицательный -> 0", () => {
  assert.equal(migrateLegacyState({}).crystalsTotal, 0);
  assert.equal(migrateLegacyState({ totalLight: NaN }).crystalsTotal, 0);
  assert.equal(migrateLegacyState({ totalLight: -50 }).crystalsTotal, 0);
});

test("loadPlayerState: первая загрузка мигрирует, старый ключ НЕ трогает", () => {
  const legacyRaw = legacyJSON(2500);
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: legacyRaw });
  const p = loadPlayerState(s);
  assert.equal(p.crystalsTotal, 2500);
  // Новый сейв записан
  const saved = JSON.parse(s.getItem(PLAYER_STORAGE_KEY));
  assert.equal(saved.crystalsTotal, 2500);
  // Старый ключ жив и байт-в-байт не изменился (откат возможен)
  assert.equal(s.getItem(LEGACY_STORAGE_KEY), legacyRaw);
});

test("loadPlayerState: идемпотентность — второй вызов ничего не меняет", () => {
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: legacyJSON(2500) });
  const p1 = loadPlayerState(s);
  const savedAfterFirst = s.getItem(PLAYER_STORAGE_KEY);
  const p2 = loadPlayerState(s);
  assert.equal(p2.crystalsTotal, p1.crystalsTotal);
  assert.equal(s.getItem(PLAYER_STORAGE_KEY), savedAfterFirst);
});

test("мост: свет, заработанный в legacy после миграции, добирается дельтой", () => {
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: legacyJSON(2500) });
  loadPlayerState(s);
  // Игрок заработал +300 в legacy (например, contributeLight из «Голоса совести»)
  s.setItem(LEGACY_STORAGE_KEY, legacyJSON(2800));
  const p = loadPlayerState(s);
  assert.equal(p.crystalsTotal, 2800);
  assert.equal(p.legacyLightSeen, 2800);
});

test("мост: трата света в legacy (Храм/Илдабаоф) кристаллы НЕ уменьшает", () => {
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: legacyJSON(2800) });
  loadPlayerState(s); // crystals 2800
  // Апгрейд Храма: totalLight 2800 -> 2000
  s.setItem(LEGACY_STORAGE_KEY, legacyJSON(2000));
  const p1 = loadPlayerState(s);
  assert.equal(p1.crystalsTotal, 2800); // накопительный счётчик не падает
  assert.equal(p1.legacyLightSeen, 2000); // отметка сдвинулась
  // Затем игрок заработал ещё +300 (2000 -> 2300): в кристаллы идёт только дельта
  s.setItem(LEGACY_STORAGE_KEY, legacyJSON(2300));
  const p2 = loadPlayerState(s);
  assert.equal(p2.crystalsTotal, 3100); // 2800 + 300, без двойного счёта
});

test("мост: кристаллы нового стека НЕ пишутся обратно в legacy totalLight", () => {
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: legacyJSON(2500) });
  const p = loadPlayerState(s);
  // Новый стек начислил кристаллы (дебаг-кнопка «+1 светмонета»)
  const grown = { ...p, crystalsTotal: p.crystalsTotal + 10000 };
  const synced = syncLegacyLight(grown, s);
  assert.equal(synced.crystalsTotal, 12500);
  assert.equal(JSON.parse(s.getItem(LEGACY_STORAGE_KEY)).totalLight, 2500);
});

test("мост: старый сейв нового стека без отметки — однократная сверка по максимуму", () => {
  // Живой прод-случай: awara.player.state существовал ДО моста
  const newSave = JSON.stringify({ crystalsTotal: 100, light: 0.01, renderTierSelected: 0 });
  const s = new MemStorage({
    [PLAYER_STORAGE_KEY]: newSave,
    [LEGACY_STORAGE_KEY]: legacyJSON(2500),
  });
  const p1 = loadPlayerState(s);
  assert.equal(p1.crystalsTotal, 2500); // max(100, 2500), без сложения
  assert.equal(p1.legacyLightSeen, 2500);
  // И идемпотентно
  const p2 = loadPlayerState(s);
  assert.equal(p2.crystalsTotal, 2500);
});

test("loadPlayerState: нет ни одного сейва -> чистый игрок, ничего не пишем", () => {
  const s = new MemStorage();
  const p = loadPlayerState(s);
  assert.equal(p.crystalsTotal, 0);
  assert.equal(s.getItem(PLAYER_STORAGE_KEY), null);
});

test("loadPlayerState: битый legacy JSON -> чистый игрок, без падения", () => {
  const s = new MemStorage({ [LEGACY_STORAGE_KEY]: "{оборванный json" });
  const p = loadPlayerState(s);
  assert.equal(p.crystalsTotal, 0);
});
