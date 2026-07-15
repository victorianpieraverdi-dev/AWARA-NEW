// =============================================
// AWARA — State Management (localStorage)
// ES6 Module — используется через import
//
// АДАПТЕР СОВМЕСТИМОСТИ (подготовка к подмене index.html):
// Живой ключ — STORAGE_KEYS.STATE (= 'awara_v258_state', см. core-module.js)
// — делится между этим модулем и боевым index.html. Боевой код
// хранит totalLight + sphereData (+ другие поля: streak, sphere_entries
// и т.п. лежат в отдельных ключах). Поэтому:
//   • saveState НЕ перезаписывает ключ целиком, а МЕРДЖИТ — чужие поля
//     (sphereData и пр.) никогда не теряются.
//   • resetState сбрасывает только поля этого модуля, сохраняя чужие.
//   • level выводится из totalLight по STAGES (единый источник правды),
//     а не хранится как самостоятельная величина.
//   • loadState больше не пишет в хранилище (чтение не мутирует данные).
// =============================================

import { STORAGE_KEYS, STAGES } from './core-module.js';
import { computeLight } from './tigelBridge.js';

// === Дефолтное состояние (поля, которыми владеет этот модуль) ===
const DEFAULT_STATE = {
  totalLight: 0,
  level: 0,
  agent: null,
  matrix: 'vedic',
  initiationProgress: 0,
  tigelEntries: [],
  unlockedKeys: [],
  lastVisit: null,
  createdAt: null
};

// Поля, принадлежащие модулю. ТОЛЬКО они сбрасываются resetState;
// всё остальное в STORAGE_KEYS.STATE = 'awara_v258_state' (например
// sphereData боевой игры) сохраняется нетронутым.
const MODULE_OWNED_KEYS = Object.keys(DEFAULT_STATE);

// === Низкоуровневое чтение сырого объекта ===
function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('[AWARA State] Parse error:', e);
    return null;
  }
}

// === Вывод ранга/уровня из света (единый источник правды) ===
export function deriveLevel(totalLight) {
  const light = totalLight || 0;
  let id = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (light >= STAGES[i].threshold) { id = STAGES[i].id; break; }
  }
  return id;
}

// === Загрузка состояния (без записи) ===
export function loadState() {
  const parsed = readRaw();
  if (!parsed) {
    return { ...DEFAULT_STATE, createdAt: Date.now() };
  }
  const merged = { ...DEFAULT_STATE, ...parsed };
  merged.level = deriveLevel(merged.totalLight);
  return merged;
}

// === Сохранение состояния (MERGE — чужие поля сохраняются) ===
export function saveState(state) {
  try {
    const existing = readRaw() || {};
    const merged = { ...existing, ...state };
    // МОСТ ТИГЛЯ: state.light — derived source-of-truth (как level, не хранится сам по себе).
    try { merged.light = computeLight(merged); } catch (e) { /* advisory: свет опционален */ }
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(merged));
    return true;
  } catch (e) {
    console.error('[AWARA State] Save error:', e);
    return false;
  }
}

// === Обновление частичное ===
export function updateState(updates) {
  const current = loadState();
  const next = {
    ...current,
    ...updates,
    lastVisit: Date.now()
  };
  saveState(next);
  return next;
}

// === Сброс состояния (только поля модуля; sphereData и пр. сохраняются) ===
export function resetState() {
  const existing = readRaw() || {};
  const preserved = { ...existing };
  for (const k of MODULE_OWNED_KEYS) delete preserved[k];
  const fresh = { ...preserved, ...DEFAULT_STATE, createdAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(fresh));
  } catch (e) {
    console.error('[AWARA State] Reset error:', e);
  }
  console.log('[AWARA State] Сброшены поля модуля (чужие ключи сохранены)');
  return { ...DEFAULT_STATE, createdAt: Date.now() };
}

// === Получение света ===
export function getLight() {
  return loadState().totalLight || 0;
}

// === Добавление света ===
export function addLight(amount) {
  if (typeof amount !== 'number' || amount < 0) {
    console.warn('[AWARA State] Invalid light amount:', amount);
    return null;
  }
  const state = loadState();
  state.totalLight = (state.totalLight || 0) + amount;
  state.level = deriveLevel(state.totalLight);
  saveState(state);
  return state.totalLight;
}

// === Получение уровня (выводится из света) ===
export function getLevel() {
  return deriveLevel(loadState().totalLight);
}

// === Установка уровня (совместимость; уровень всё равно выводится из света) ===
export function setLevel(level) {
  return updateState({ level });
}

// === Тигель: добавление записи ===
export function addTigelEntry(entry) {
  const state = loadState();
  state.tigelEntries = state.tigelEntries || [];
  state.tigelEntries.push({
    ...entry,
    timestamp: Date.now()
  });
  saveState(state);
  return state.tigelEntries.length;
}

// === Тигель: получение последних N записей ===
export function getTigelEntries(limit = 10) {
  const state = loadState();
  const entries = state.tigelEntries || [];
  return entries.slice(-limit);
}
