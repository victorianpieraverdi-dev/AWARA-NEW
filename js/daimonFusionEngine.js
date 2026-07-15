// =============================================
// AWARA — Daimon Fusion Engine
// Синтез стихий + Daimon + Агентов + Матриц
// =============================================

const BASE = new URL('..', import.meta.url).href;
const STATE_KEY = 'awara_v258_state';
const LEGACY_STATE_KEY = 'awara_v255_state';

const ELEMENT_RU = {
  fire: 'Огонь',
  water: 'Вода',
  earth: 'Земля',
  air: 'Воздух',
  ether: 'Эфир'
};

const ELEMENT_FROM_RU = {
  'Огонь': 'fire',
  'Вода': 'water',
  'Земля': 'earth',
  'Камень': 'earth',
  'Кристалл': 'earth',
  'Воздух': 'air',
  'Эфир': 'ether'
};

const MATRIX_DEPTH = {
  vedic: 1,
  egyptian: 1,
  slavic: 1,
  norse: 1,
  daoist: 1,
  shinto: 1,
  celtic: 1,
  antique_greco_roman: 1,
  kabbalistic: 2,
  mayan: 2,
  gnostic: 2,
  julian_byzantine: 2,
  shamanic: 2,
  zoroastrian: 2,
  islamic_sufi_nur: 2,
  aztec_mexica: 2,
  christian_mystical_grail: 2,
  yoruba_ifa_orisha: 2,
  sumerian_babylonian: 2,
  buddhist_mahayana: 2,
  shambhala: 3,
  gene_keys: 3,
  hermetic_alchemical: 3,
  tarot_arcanic: 3,
  astrological: 3,
  chinese_iching: 3,
  tantric_kashmiri: 3,
  technomagical: 4,
  cosmic_galactic: 4,
  afro_dogon: 4,
  atlantean_lemurian: 4,
  posthuman_ai_sophianic: 4,
  advaita_siddha: 4
};

const INTENT_EFFECTS = {
  healing: { healing: 0.08, emotional_clearing: 0.05 },
  protection: { protection: 0.08, domain_stability: 0.05 },
  transformation: { transformation: 0.08, shadow_burning: 0.05 },
  creation: { manifestation: 0.08, domain_growth: 0.05 },
  oracle: { oracle: 0.08, clarity: 0.05 },
  community: { collective_xp: 0.08, domain_stability: 0.05 }
};

async function loadJson(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error('Cannot load ' + path + ': ' + res.status);
  return res.json();
}

function readState() {
  try {
    const raw = localStorage.getItem(STATE_KEY) || localStorage.getItem(LEGACY_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[DaimonFusion] Cannot read state', e);
    return {};
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state || {}));
    return true;
  } catch (e) {
    console.warn('[DaimonFusion] Cannot write state', e);
    return false;
  }
}

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function normalizeElement(element, aliases) {
  if (!element) return null;
  if (aliases && aliases[element]) return aliases[element];
  if (ELEMENT_FROM_RU[element]) return ELEMENT_FROM_RU[element];
  const normalized = String(element).toLowerCase();
  if (aliases && aliases[normalized]) return aliases[normalized];
  if (normalized === 'stone' || normalized === 'crystal') return 'earth';
  if (['fire', 'water', 'earth', 'air', 'ether'].includes(normalized)) return normalized;
  return null;
}

function addWeight(weights, element, amount) {
  if (!element) return;
  weights[element] = Number(weights[element] || 0) + Number(amount || 0);
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce(function(sum, value) {
    return sum + Number(value || 0);
  }, 0) || 1;
  const result = {};
  Object.keys(weights).forEach(function(key) {
    result[key] = Math.round((weights[key] / total) * 1000) / 1000;
  });
  return result;
}

function sortedElements(elementMix) {
  return Object.entries(elementMix)
    .sort(function(a, b) { return b[1] - a[1]; })
    .map(function(entry) { return entry[0]; });
}

function recipeKey(elements) {
  return elements.slice().sort().join('+');
}

function mergeEffects() {
  const result = {};
  Array.from(arguments).forEach(function(source) {
    if (!source) return;
    Object.entries(source).forEach(function(entry) {
      result[entry[0]] = Math.round((Number(result[entry[0]] || 0) + Number(entry[1] || 0)) * 1000) / 1000;
    });
  });
  return result;
}

function chooseRarity(powerScore) {
  if (powerScore >= 10) return 'mythic';
  if (powerScore >= 8) return 'legendary';
  if (powerScore >= 6) return 'epic';
  if (powerScore >= 4) return 'rare';
  if (powerScore >= 2) return 'uncommon';
  return 'common';
}

function chooseResultType(recipe, participants, offeredLight, depth) {
  if (participants.length >= 3 && offeredLight >= 500 && depth >= 3) return 'shared_domain';
  if (participants.length >= 2 && offeredLight >= 250) return 'domain_seed';
  if (recipe && recipe.preferred_types && recipe.preferred_types.length) return recipe.preferred_types[0];
  if (participants.length >= 2) return 'elemental_minion';
  return 'resonance_form';
}

function findBySlugOrId(items, value) {
  if (!value || !Array.isArray(items)) return null;
  return items.find(function(item) {
    return item.slug === value || item.id === value || String(item.id) === String(value) || item.name === value;
  }) || null;
}

function findAgentMatrixEntry(map, agent, matrix) {
  if (!agent || !matrix || !Array.isArray(map)) return null;
  return map.find(function(entry) {
    return entry.agent_slug === agent.slug && entry.matrix_slug === matrix.slug;
  }) || null;
}

function getActiveMatrixSlug(input) {
  if (input) return input;
  return localStorage.getItem('awara_matrix') || localStorage.getItem('awara_active_matrix') || 'vedic';
}

function collectElements(input, recipes, agent) {
  const weights = {};
  const participants = Array.isArray(input.participants) ? input.participants : [];

  (input.elements || []).forEach(function(element) {
    addWeight(weights, normalizeElement(element, recipes.aliases), 1);
  });

  participants.forEach(function(participant) {
    const daimon = participant.daimon || participant;
    addWeight(weights, normalizeElement(daimon.element, recipes.aliases), 1.4);
    addWeight(weights, normalizeElement(daimon.secondaryElement, recipes.aliases), 0.7);
    if (daimon.gameEffects && daimon.gameEffects.element) {
      addWeight(weights, normalizeElement(daimon.gameEffects.element, recipes.aliases), 0.8);
    }
  });

  if (agent) {
    addWeight(weights, normalizeElement(agent.element, recipes.aliases), 0.9);
  }

  if (Object.keys(weights).length === 0) addWeight(weights, 'ether', 1);
  return normalizeWeights(weights);
}

function buildName(recipe, agent, matrix, dominantElement) {
  const baseNames = recipe && recipe.result_names ? recipe.result_names : [];
  const base = baseNames.length ? baseNames[Math.floor(Math.random() * baseNames.length)] : ((ELEMENT_RU[dominantElement] || 'Эфирный') + ' Даймонит');
  if (agent && matrix) return base + ' ' + agent.name + ' / ' + matrix.name;
  if (agent) return base + ' ' + agent.name;
  if (matrix) return base + ' ' + matrix.name;
  return base;
}

function buildLore(result, recipe, agent, matrix, culturalEntry) {
  const parts = [];
  parts.push(result.name + ' рождается из смеси: ' + result.elements.map(function(e) { return ELEMENT_RU[e] || e; }).join(' + ') + '.');
  if (recipe) parts.push('Алхимический состав: ' + recipe.name_ru + ' — ' + recipe.archetype + '.');
  if (agent) parts.push('Агент-покровитель: ' + agent.name + ', домен: ' + agent.domain + ', луч: ' + agent.ray + ', гуна: ' + agent.guna + '.');
  if (matrix) parts.push('Матрица восприятия: ' + matrix.name + '. Конфликт: ' + matrix.conflict + '. Визуальный код: ' + matrix.visual_code + '.');
  if (culturalEntry) parts.push('Культурное имя связки агент×матрица: ' + culturalEntry.cultural_name + '.');
  parts.push('Сущность может быть резонансной формой, малым спутником, зерном карты или домена — сила результата зависит от света, участников, агента и глубины матрицы.');
  return parts.join('\n');
}

/**
 * Создать результат синтеза Daimon/стихий/агента/матрицы без сохранения.
 *
 * input:
 * - participants: игроки или Daimon-объекты
 * - elements: ручные стихии, например ['Вода', 'Огонь', 'Камень']
 * - agentSlug / agentId: агент-покровитель, например 'svet_ra'
 * - matrixSlug / matrixId: матрица, например 'vedic'
 * - intent: healing/protection/transformation/creation/oracle/community
 * - offeredLight: вложенный свет
 */
export async function previewDaimonFusion(input = {}) {
  const recipes = await loadJson('data/element_fusions.json');
  const agents = await loadJson('data/agents.json');
  const matrices = await loadJson('data/matrices.json');
  const agentMatrixMap = await loadJson('data/agent_matrix_map.json');

  const agent = findBySlugOrId(agents, input.agentSlug || input.agentId);
  const matrix = findBySlugOrId(matrices, getActiveMatrixSlug(input.matrixSlug || input.matrixId));
  const culturalEntry = findAgentMatrixEntry(agentMatrixMap, agent, matrix);
  const offeredLight = Math.max(0, Number(input.offeredLight || 0));
  const participants = Array.isArray(input.participants) ? input.participants : [];
  const elementMix = collectElements(input, recipes, agent);
  const elements = sortedElements(elementMix).slice(0, 3);
  const topTwoKey = recipeKey(elements.slice(0, 2));
  const topThreeKey = recipeKey(elements.slice(0, 3));
  const recipe = recipes.triple[topThreeKey] || recipes.binary[topTwoKey] || null;
  const depth = matrix ? (MATRIX_DEPTH[matrix.slug] || 1) : 1;
  const agentPower = agent ? Math.max(1, Math.min(5, Number(agent.ray || 1))) : 1;
  const lightPower = Math.min(3, Math.floor(offeredLight / 200));
  const participantPower = Math.min(3, participants.length);
  const powerScore = depth + agentPower + lightPower + participantPower;
  const rarity = chooseRarity(powerScore);
  const type = chooseResultType(recipe, participants, offeredLight, depth);
  const effects = mergeEffects(
    recipe && recipe.effects,
    INTENT_EFFECTS[input.intent] || null,
    agent ? { agent_resonance: 0.03 * agentPower } : null,
    matrix ? { matrix_depth: 0.02 * depth } : null
  );

  const result = {
    id: generateId('fusion'),
    type,
    rarity,
    name: buildName(recipe, agent, matrix, elements[0]),
    createdAt: new Date().toISOString(),
    intent: input.intent || 'creation',
    elements,
    elementMix,
    compound: recipe ? recipe.compound : 'raw_resonance',
    compoundName: recipe ? recipe.name_ru : 'Сырой резонанс',
    archetype: recipe ? recipe.archetype : 'Новая форма резонанса',
    offeredLight,
    participants: participants.map(function(participant) {
      const daimon = participant.daimon || participant;
      return {
        playerId: participant.playerId || participant.id || null,
        daimonId: daimon.id || null,
        daimonName: daimon.name || daimon.formName || null,
        element: daimon.element || null,
        archetype: daimon.archetype || null,
        kingdom: daimon.kingdom || null
      };
    }),
    agent: agent ? {
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      domain: agent.domain,
      guna: agent.guna,
      element: agent.element,
      ray: agent.ray
    } : null,
    matrix: matrix ? {
      id: matrix.id,
      slug: matrix.slug,
      name: matrix.name,
      depth,
      conflict: matrix.conflict,
      visual_code: matrix.visual_code
    } : null,
    culturalName: culturalEntry ? culturalEntry.cultural_name : null,
    powerScore,
    effects
  };

  result.lore = buildLore(result, recipe, agent, matrix, culturalEntry);
  return result;
}

/**
 * Создать и сохранить результат синтеза в awara_v258_state.
 */
export async function createDaimonFusion(input = {}) {
  const result = await previewDaimonFusion(input);
  const state = readState();
  const fusions = Array.isArray(state.fusionHistory) ? state.fusionHistory : [];
  const beings = Array.isArray(state.createdBeings) ? state.createdBeings : [];
  const domains = Array.isArray(state.domainSeeds) ? state.domainSeeds : [];
  const journey = Array.isArray(state.journey) ? state.journey : [];

  fusions.unshift(result);
  if (['elemental_minion', 'oracle_being', 'guardian', 'resonance_form'].includes(result.type)) beings.unshift(result);
  if (['domain_seed', 'shared_domain', 'healing_domain'].includes(result.type)) domains.unshift(result);

  journey.unshift({
    id: result.id,
    at: result.createdAt,
    type: 'daimon_fusion',
    name: result.name,
    resultType: result.type,
    rarity: result.rarity,
    elements: result.elements,
    agent: result.agent ? result.agent.slug : null,
    matrix: result.matrix ? result.matrix.slug : null,
    offeredLight: result.offeredLight
  });

  const next = {
    ...state,
    totalLight: Math.max(0, Number(state.totalLight || 0) - Number(result.offeredLight || 0)),
    fusionHistory: fusions.slice(0, 120),
    createdBeings: beings.slice(0, 80),
    domainSeeds: domains.slice(0, 40),
    journey: journey.slice(0, 120),
    lastVisit: Date.now()
  };

  writeState(next);
  return result;
}

/**
 * Быстрый пример: Вода + Огонь + Камень с активным Daimon игрока.
 */
export async function createExampleGeyserFusion(agentSlug = 'svet_ra', matrixSlug = 'vedic') {
  const state = readState();
  return createDaimonFusion({
    participants: state.daimon ? [state.daimon] : [],
    elements: ['Вода', 'Огонь', 'Камень'],
    agentSlug,
    matrixSlug,
    intent: 'healing',
    offeredLight: 108
  });
}
