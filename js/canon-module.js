// =============================================
// AWARA — Canon Loader Module
// Загружает 21 агент / 33 матрицы / 14 лок / 9 чакр / 63 карты
// =============================================

import { CANON, validateCanon } from './core-module.js';

// === Базовый путь к корню проекта (относительно модуля в js/) ===
const BASE = new URL('..', import.meta.url).href;

// === Кэш загруженных данных ===
const cache = {
  agents: null,
  matrices: null,
  agentMatrixMap: null,
  locas: null,
  chakras: null,
  cards: null
};

// === Универсальный загрузчик JSON ===
async function loadJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) {
      console.error(`[Canon] Не удалось загрузить ${path}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[Canon] Ошибка загрузки ${path}:`, e);
    return null;
  }
}

// === Загрузка агентов (21) ===
export async function loadAgents() {
  if (cache.agents) return cache.agents;

  const data = await loadJson(BASE + 'data/agents.json');
  if (!data) return null;

  const agents = Array.isArray(data) ? data : Object.values(data);

  if (agents.length !== CANON.AGENTS_COUNT) {
    console.error(
      `[Canon] КАНОН НАРУШЕН: загружено ${agents.length} агентов, ` +
      `ожидалось ${CANON.AGENTS_COUNT}`
    );
  } else {
    console.log(`[Canon] Загружено ${agents.length} агентов`);
  }

  cache.agents = agents;
  return agents;
}

// === Загрузка матриц (33) ===
export async function loadMatrices() {
  if (cache.matrices) return cache.matrices;

  const data = await loadJson(BASE + 'data/matrices.json');
  if (!data) return null;

  const matrices = Array.isArray(data) ? data : Object.values(data);

  if (matrices.length !== CANON.MATRICES_COUNT) {
    console.error(
      `[Canon] КАНОН НАРУШЕН: загружено ${matrices.length} матриц, ` +
      `ожидалось ${CANON.MATRICES_COUNT}`
    );
  } else {
    console.log(`[Canon] Загружено ${matrices.length} матриц`);
  }

  cache.matrices = matrices;
  return matrices;
}

// === Загрузка соответствий агент*матрица (693) ===
export async function loadAgentMatrixMap() {
  if (cache.agentMatrixMap) return cache.agentMatrixMap;

  const data = await loadJson(BASE + 'data/agent_matrix_map.json');
  if (!data) return null;

  // Подсчёт пар (может быть разная структура)
  let pairCount = 0;
  if (Array.isArray(data)) {
    pairCount = data.length;
  } else if (typeof data === 'object') {
    for (const agentKey in data) {
      if (typeof data[agentKey] === 'object') {
        pairCount += Object.keys(data[agentKey]).length;
      }
    }
  }

  if (pairCount === CANON.AGENT_MATRIX_PAIRS) {
    console.log(`[Canon] Загружено ${pairCount} соответствий (21x33)`);
  } else {
    console.warn(
      `[Canon] Подсчёт соответствий: ${pairCount}, ожидалось ${CANON.AGENT_MATRIX_PAIRS}`
    );
  }

  cache.agentMatrixMap = data;
  return data;
}

// === Загрузка лок (14) — может отсутствовать ===
export async function loadLocas() {
  if (cache.locas) return cache.locas;

  const data = await loadJson(BASE + 'data/locas.json');
  if (!data) {
    console.warn('[Canon] data/locas.json не найден');
    return null;
  }

  const locas = Array.isArray(data) ? data : Object.values(data);

  if (locas.length !== CANON.LOCAS_COUNT) {
    console.error(
      `[Canon] КАНОН НАРУШЕН: ${locas.length} лок, ожидалось ${CANON.LOCAS_COUNT}`
    );
  } else {
    console.log(`[Canon] Загружено ${locas.length} лок`);
  }

  cache.locas = locas;
  return locas;
}

// === Загрузка чакр (9) — может отсутствовать ===
export async function loadChakras() {
  if (cache.chakras) return cache.chakras;

  const data = await loadJson(BASE + 'data/chakras.json');
  if (!data) {
    console.warn('[Canon] data/chakras.json не найден');
    return null;
  }

  const chakras = Array.isArray(data) ? data : Object.values(data);

  if (chakras.length !== CANON.CHAKRAS_COUNT) {
    console.error(
      `[Canon] КАНОН НАРУШЕН: ${chakras.length} чакр, ожидалось ${CANON.CHAKRAS_COUNT}`
    );
  } else {
    console.log(`[Canon] Загружено ${chakras.length} чакр`);
  }

  cache.chakras = chakras;
  return chakras;
}

// === Загрузка карт — ВРЕМЕННО ОТКЛЮЧЕНО ===
// Нет единого data/cards.json. Канонический источник карт будет подключён позже
// (кандидаты: domain_cards.json / vedic_loka_cards.json / monad_path_cards.json).
export async function loadCards() {
  if (cache.cards) return cache.cards;
  console.info('[Canon] loadCards отключён: карты пока не загружаются');
  cache.cards = [];
  return cache.cards;
}

// === Получить агента по ID ===
export async function getAgentById(agentId) {
  const agents = await loadAgents();
  if (!agents) return null;
  return agents.find(a => a.id === agentId || a.name === agentId) || null;
}

// === Получить матрицу по ID ===
export async function getMatrixById(matrixId) {
  const matrices = await loadMatrices();
  if (!matrices) return null;
  return matrices.find(m => m.id === matrixId || m.key === matrixId) || null;
}

// === Получить соответствие агент*матрица ===
export async function getAgentMatrixEntry(agentId, matrixId) {
  const map = await loadAgentMatrixMap();
  if (!map) return null;
  if (Array.isArray(map)) {
    return map.find(e => e.agent === agentId && e.matrix === matrixId) || null;
  }
  return map[agentId]?.[matrixId] || null;
}

// === Предзагрузка всего канона ===
export async function preloadCanon() {
  console.log('[Canon] Начинаю предзагрузку...');
  const start = Date.now();

  const results = await Promise.all([
    loadAgents(),
    loadMatrices(),
    loadAgentMatrixMap(),
    loadLocas(),
    loadChakras(),
    loadCards()
  ]);

  const elapsed = Date.now() - start;
  console.log(`[Canon] Предзагрузка завершена за ${elapsed}мс`);

  // Финальная валидация
  validateCanon();

  return {
    agents: results[0],
    matrices: results[1],
    agentMatrixMap: results[2],
    locas: results[3],
    chakras: results[4],
    cards: results[5],
    elapsed
  };
}

// === Очистить кэш ===
export function clearCanonCache() {
  for (const key in cache) cache[key] = null;
  console.log('[Canon] Кэш очищен');
}
