/**
 * temple-module.js — логика Храма v2.
 * Читает data/temple-upgrades.json и data/temple-ecosystems.json.
 * State через playerState.js (getState/saveState).
 */

import { getState, saveState } from './playerState.js';

let _upgrades = null;
let _ecosystems = null;

async function loadUpgrades() {
  if (_upgrades) return _upgrades;
  const res = await fetch('/data/temple-upgrades.json'); // абсолютный путь: работает и с корня, и из /app/istok.html (Vite)
  _upgrades = await res.json();
  return _upgrades;
}

async function loadEcosystems() {
  if (_ecosystems) return _ecosystems;
  const res = await fetch('/data/temple-ecosystems.json'); // абсолютный путь (см. loadUpgrades)
  _ecosystems = await res.json();
  return _ecosystems;
}

export function getTempleState() {
  const state = getState();
  return state.temple || { level: 1, matrixId: null, lastCollect: null };
}

function saveTemple(temple) {
  const state = getState();
  state.temple = temple;
  saveState(state);
}

/**
 * Применить улучшение (купить следующий уровень).
 * Возвращает { ok, error?, temple?, upgrade? }.
 */
export async function applyUpgrade(upgradeId) {
  const upgrades = await loadUpgrades();
  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return { ok: false, error: 'upgrade_not_found' };

  const state = getState();
  const temple = state.temple || { level: 1, matrixId: null, lastCollect: null };

  if (upgrade.id <= temple.level) {
    return { ok: false, error: 'already_unlocked' };
  }
  if (upgrade.id !== temple.level + 1) {
    return { ok: false, error: 'wrong_order' };
  }

  const light = state.totalLight || 0;
  if (light < upgrade.cost_light) {
    return { ok: false, error: 'not_enough_light', need: upgrade.cost_light, have: light };
  }

  state.totalLight = light - upgrade.cost_light;
  temple.level = upgrade.id;
  state.temple = temple;
  saveState(state);

  return { ok: true, temple, upgrade };
}

/**
 * Получить эффект экосистемы для матрицы игрока.
 * Возвращает объект экосистемы или null.
 */
export async function getEcosystemEffect(matrixId) {
  const ecosystems = await loadEcosystems();
  return ecosystems.find(e => e.matrixId === matrixId) || null;
}

/**
 * Получить текущий уровень улучшения (объект).
 */
export async function getCurrentUpgrade() {
  const temple = getTempleState();
  const upgrades = await loadUpgrades();
  return upgrades.find(u => u.id === temple.level) || upgrades[0];
}

/**
 * Получить следующее улучшение (объект) или null если максимум.
 */
export async function getNextUpgrade() {
  const temple = getTempleState();
  const upgrades = await loadUpgrades();
  return upgrades.find(u => u.id === temple.level + 1) || null;
}

/**
 * Все улучшения.
 */
export async function getAllUpgrades() {
  return await loadUpgrades();
}

/**
 * Все экосистемы.
 */
export async function getAllEcosystems() {
  return await loadEcosystems();
}

/**
 * Собрать пассивный свет от храма.
 * basePassiveSvet * passive_multiplier текущего уровня.
 */
export async function collectPassiveSvet() {
  const temple = getTempleState();
  const upgrades = await loadUpgrades();
  const current = upgrades.find(u => u.id === temple.level) || upgrades[0];

  const ecosystems = await loadEcosystems();
  const eco = temple.matrixId ? ecosystems.find(e => e.matrixId === temple.matrixId) : null;
  const baseSvet = eco ? eco.basePassiveSvet : 100;

  const now = Date.now();
  const last = temple.lastCollect || 0;
  const hoursPassed = Math.min((now - last) / 3600000, 24);
  if (hoursPassed < 1) return { ok: false, error: 'too_soon', hoursLeft: 1 - hoursPassed };

  const collected = Math.floor(baseSvet * current.passive_multiplier * hoursPassed);

  const state = getState();
  state.totalLight = (state.totalLight || 0) + collected;
  temple.lastCollect = now;
  state.temple = temple;
  saveState(state);

  return { ok: true, collected, multiplier: current.passive_multiplier, hours: hoursPassed };
}

/**
 * Начислить свет Храму напрямую (вклад извне — например, из
 * распределения дневного опыта «Голоса совести», awara-voice-conscience.js).
 * Не апгрейд, не пассивный сбор — просто добавляет totalLight, тем же
 * способом, каким applyUpgrade/collectPassiveSvet его тратят/копят.
 * Возвращает { ok, added, totalLight }.
 */
export function contributeLight(amount) {
  const add = Math.max(0, Math.round(Number(amount) || 0));
  if (add <= 0) return { ok: false, error: 'zero_amount' };
  const state = getState();
  state.totalLight = (state.totalLight || 0) + add;
  saveState(state);
  return { ok: true, added: add, totalLight: state.totalLight };
}

/**
 * Привязать храм к матрице (выбор экосистемы).
 */
export async function bindMatrix(matrixId) {
  const ecosystems = await loadEcosystems();
  const eco = ecosystems.find(e => e.matrixId === matrixId);
  if (!eco) return { ok: false, error: 'matrix_not_found' };

  const temple = getTempleState();
  temple.matrixId = matrixId;
  saveTemple(temple);
  return { ok: true, ecosystem: eco };
}
