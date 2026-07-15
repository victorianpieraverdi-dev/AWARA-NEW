/**
 * playerState.js — минимальный API для чтения/записи состояния игрока.
 * Ключ хранения: awara_v258_state (новый), миграция с awara_v255_state.
 * Никакой игровой логики — только I/O.
 */

import { computeLight } from './tigelBridge.js';

const STORAGE_KEY = 'awara_v258_state';
const LEGACY_KEY  = 'awara_v255_state';

const DEFAULT_STATE = {
  totalLight: 0,
  sphereData: {},
  spirit: {
    'Любовь': 10,
    'Мудрость': 10,
    'Воля': 10,
    'Радость': 10,
    'Истина': 10
  },
  elements: {
    'Огонь': 0,
    'Вода': 0,
    'Земля': 0,
    'Воздух': 0,
    'Эфир': 0
  },
  cauldron: {
    entriesCount: 0,
    lastEntryAt: null,
    lastResult: null
  },
  activeSystem: 'Ведическая',
  journey: [],
  soulPassport: {
    ray: null,
    guna: null,
    path: null,
    archetypeSummary: null
  },
  daimon: null,
  fusionHistory: [],
  createdBeings: [],
  domainSeeds: [],
  light: null,
  temple: null,
  superGame: null,
  lenses: {},
  // Световые структуры (engine_config.json light_structures) — массив id
  // построенных структур; логика в js/lightStructures.js.
  lightStructures: [],
  // Чувствительность (engine_config.json sensitivity.metric) — глобальный
  // стат ≥ 0; логика в js/sensitivity.js.
  sensitivity: 0
};

/**
 * Миграция из legacy-ключа awara_v255_state в awara_v258_state.
 * Если новый ключ уже существует — миграция не нужна.
 * Возвращает мигрированные данные или null.
 */
export function migrate() {
  if (localStorage.getItem(STORAGE_KEY)) return null;

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;

  try {
    const legacy = JSON.parse(raw);
    const migrated = {
      totalLight:   legacy.totalLight   ?? DEFAULT_STATE.totalLight,
      sphereData:   legacy.sphereData   ?? DEFAULT_STATE.sphereData,
      spirit:       legacy.spirit       ?? { ...DEFAULT_STATE.spirit },
      elements:     legacy.elements     ?? { ...DEFAULT_STATE.elements },
      cauldron:     legacy.cauldron     ?? { ...DEFAULT_STATE.cauldron },
      activeSystem: legacy.activeSystem ?? DEFAULT_STATE.activeSystem,
      journey:      legacy.journey      ?? [],
      soulPassport: legacy.soulPassport ?? { ...DEFAULT_STATE.soulPassport },
      daimon: legacy.daimon ?? DEFAULT_STATE.daimon,
      fusionHistory: legacy.fusionHistory ?? [],
      createdBeings: legacy.createdBeings ?? [],
      domainSeeds: legacy.domainSeeds ?? [],
      light: legacy.light ?? DEFAULT_STATE.light,
      temple: legacy.temple ?? DEFAULT_STATE.temple,
      superGame: legacy.superGame ?? DEFAULT_STATE.superGame,
      lenses: legacy.lenses ?? { ...DEFAULT_STATE.lenses }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch (e) {
    console.warn('playerState: ошибка миграции из ' + LEGACY_KEY, e);
    return null;
  }
}

/**
 * Чтение состояния. Пробует новый ключ, затем миграцию,
 * затем возвращает дефолт.
 */
export function getState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      return {
        totalLight:   data.totalLight   ?? DEFAULT_STATE.totalLight,
        sphereData:   data.sphereData   ?? DEFAULT_STATE.sphereData,
        spirit:       data.spirit       ?? { ...DEFAULT_STATE.spirit },
        elements:     data.elements     ?? { ...DEFAULT_STATE.elements },
        cauldron:     data.cauldron     ?? { ...DEFAULT_STATE.cauldron },
        activeSystem: data.activeSystem ?? DEFAULT_STATE.activeSystem,
        journey:      data.journey      ?? [],
        soulPassport: data.soulPassport ?? { ...DEFAULT_STATE.soulPassport },
        daimon: data.daimon ?? DEFAULT_STATE.daimon,
        fusionHistory: data.fusionHistory ?? [],
        createdBeings: data.createdBeings ?? [],
        domainSeeds: data.domainSeeds ?? [],
        light: data.light ?? DEFAULT_STATE.light,
        temple: data.temple ?? DEFAULT_STATE.temple,
        superGame: data.superGame ?? DEFAULT_STATE.superGame,
        lenses: data.lenses ?? { ...DEFAULT_STATE.lenses },
        lightStructures: data.lightStructures ?? [],
        sensitivity: data.sensitivity ?? 0
      };
    } catch (e) {
      console.warn('playerState: ошибка чтения ' + STORAGE_KEY, e);
    }
  }

  const migrated = migrate();
  if (migrated) return migrated;

  return { ...DEFAULT_STATE, spirit: { ...DEFAULT_STATE.spirit }, elements: { ...DEFAULT_STATE.elements }, cauldron: { ...DEFAULT_STATE.cauldron }, journey: [], soulPassport: { ...DEFAULT_STATE.soulPassport }, daimon: DEFAULT_STATE.daimon, fusionHistory: [], createdBeings: [], domainSeeds: [] };
}

/**
 * Сохранение состояния в localStorage.
 * Принимает объект с полями totalLight, sphereData, spirit, elements,
 * activeSystem, journey, soulPassport, daimon, fusionHistory, createdBeings, domainSeeds.
 */
export function saveState(state) {
  const data = {
    totalLight:   state.totalLight   ?? 0,
    sphereData:   state.sphereData   ?? {},
    spirit:       state.spirit       ?? {},
    elements:     state.elements     ?? {},
    cauldron:     state.cauldron     ?? { ...DEFAULT_STATE.cauldron },
    activeSystem: state.activeSystem ?? 'Ведическая',
    journey:      state.journey      ?? [],
    soulPassport: state.soulPassport ?? { ...DEFAULT_STATE.soulPassport },
    daimon: state.daimon ?? DEFAULT_STATE.daimon,
    fusionHistory: state.fusionHistory ?? [],
    createdBeings: state.createdBeings ?? [],
    domainSeeds: state.domainSeeds ?? [],
    light: state.light ?? DEFAULT_STATE.light,
    temple: state.temple ?? DEFAULT_STATE.temple,
    superGame: state.superGame ?? DEFAULT_STATE.superGame,
    lenses: state.lenses ?? { ...DEFAULT_STATE.lenses },
    lightStructures: state.lightStructures ?? [],
    sensitivity: state.sensitivity ?? 0
  };
  // МОСТ ТИГЛЯ: state.light — derived source-of-truth, пересчёт при каждом сохранении.
  try { data.light = computeLight(data); } catch (e) { /* advisory: свет опционален */ }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('playerState: ошибка записи', e);
  }
}
