// Daimon manager: unified creation, saving, and game-state bridge
// Connects the new Daimon creation flow to the main AWARA player state.

const DAIMON_KEY = 'awara_player_daimon';
const DAIMON_HISTORY_KEY = 'awara_daimon_history';
const STATE_KEY = 'awara_v258_state';
const LEGACY_STATE_KEY = 'awara_v255_state';

const CHAKRA_NAMES = {
  1: 'Муладхара',
  2: 'Свадхистхана',
  3: 'Манипура',
  4: 'Анахата',
  5: 'Вишуддха',
  6: 'Аджна',
  7: 'Сахасрара',
  8: 'Монада',
  9: 'Абсолют'
};

const ELEMENT_NORMALIZE = {
  Fire: 'fire',
  Water: 'water',
  Earth: 'earth',
  Air: 'air',
  Ether: 'ether',
  fire: 'fire',
  water: 'water',
  earth: 'earth',
  air: 'air',
  ether: 'ether'
};

const ELEMENT_PREFIX_RU = {
  fire: 'Огненный',
  water: 'Водный',
  earth: 'Земной',
  air: 'Воздушный',
  ether: 'Эфирный'
};

function generateUniqueId() {
  return 'daimon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function readJsonKey(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('[Daimon Manager] Cannot read ' + key, e);
    return fallback;
  }
}

function writeJsonKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[Daimon Manager] Cannot write ' + key, e);
    return false;
  }
}

function normalizeElement(element) {
  return ELEMENT_NORMALIZE[element] || String(element || 'ether').toLowerCase();
}

function getSpeciesName(form, lang) {
  if (!form || !form.species) return '';
  return form.species[lang] || form.species.ru || form.species.en || '';
}

function inferFormSlug(form) {
  if (!form) return 'unknown';
  if (form.form) return form.form;
  if (form.species && form.species.en) return String(form.species.en).toLowerCase().replace(/\s+/g, '_');
  if (form.id) return String(form.id).split('_').slice(2).join('_') || String(form.id);
  return 'unknown';
}

function getPrimaryChakra(form) {
  var chakra = form && Array.isArray(form.chakra_affinity) ? form.chakra_affinity[0] : 1;
  chakra = Number(chakra) || 1;
  return Math.max(1, Math.min(9, chakra));
}

function buildGameEffects(form, creationMethod, natalChart) {
  var element = normalizeElement(form && form.element);
  var chakra = getPrimaryChakra(form);
  var natalBoost = creationMethod === 'natal' || natalChart ? 0.02 : 0;
  var baseBonus = 0.05 + natalBoost;

  return {
    lightMultiplier: 1 + baseBonus,
    daimonXpMultiplier: 1 + baseBonus,
    elementBonus: Math.round(baseBonus * 1000) / 1000,
    element: element,
    cardAffinity: {
      element: element,
      kingdom: form ? form.kingdom : null,
      archetype: form ? form.archetype : null
    },
    unlocks: {
      chakraAffinity: form && form.chakra_affinity ? form.chakra_affinity : [chakra],
      dialogue: true,
      evolution: true,
      resonance: true
    }
  };
}

function buildCanonicalDaimon(form, creationMethod, natalChart, existing) {
  existing = existing || {};
  var element = normalizeElement(form && form.element);
  var formNameRu = getSpeciesName(form, 'ru') || existing.formName || 'Даймон';
  var formNameEn = getSpeciesName(form, 'en') || formNameRu;
  var chakra = existing.chakra || getPrimaryChakra(form);
  var description = form && form.description
    ? (form.description.ru || form.description.en || '')
    : (existing.description || 'Даймон-хранитель пробуждён и связан с путём игрока.');
  var name = existing.name || ((ELEMENT_PREFIX_RU[element] || 'Космический') + ' ' + formNameRu);
  var effects = buildGameEffects(form, creationMethod, natalChart);

  return {
    id: existing.id || generateUniqueId(),
    source: 'daimon-create',
    formId: form ? form.id : existing.formId,
    creationMethod: creationMethod || existing.creationMethod || 'unknown',
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    name: name,
    form: inferFormSlug(form),
    formName: formNameRu,
    formNameEn: formNameEn,
    kingdom: form ? form.kingdom : existing.kingdom,
    archetype: form ? form.archetype : existing.archetype,
    element: element,
    secondaryElement: existing.secondaryElement || null,
    guna: form ? form.guna : existing.guna,
    description: description,

    // Compatibility with the older nakshatra-based Daimon page.
    nakshatra: existing.nakshatra || null,
    nakshatraName: existing.nakshatraName || '—',
    sanskrit: existing.sanskrit || '—',
    ruler: existing.ruler || '—',
    dosha: existing.dosha || null,
    strongestPlanet: existing.strongestPlanet || null,

    level: existing.level || 1,
    tier: existing.tier || 'Common',
    xp: existing.xp || 0,
    totalXP: existing.totalXP || 0,
    experience: existing.experience || existing.totalXP || 0,
    activeChakra: existing.activeChakra || chakra,
    chakra: chakra,
    chakraName: CHAKRA_NAMES[chakra] || 'Муладхара',
    resonanceBonus: effects.elementBonus,
    natalResonance: natalChart ? 1.0 : (creationMethod === 'natal' ? 0.9 : 0.5),

    evolutionStage: existing.evolutionStage || 1,
    dnaStrands: existing.dnaStrands || 2,
    evolutionMultiplier: existing.evolutionMultiplier || 1.0,
    granthiPierced: existing.granthiPierced || { brahma: false, vishnu: false, rudra: false },

    images: existing.images || [],
    experienceMarks: existing.experienceMarks || [],
    stats: existing.stats || { bond: 0, evolution_count: 0 },
    natalChart: natalChart || existing.natalChart || null,
    natal_indicators: form ? form.natal_indicators : existing.natal_indicators,
    chakra_affinity: form ? form.chakra_affinity : existing.chakra_affinity,
    gameEffects: effects
  };
}

function saveDaimonToGameState(daimon, eventType) {
  var state = readJsonKey(STATE_KEY, null);
  if (!state) {
    state = readJsonKey(LEGACY_STATE_KEY, {}) || {};
  }

  state.daimon = daimon;
  state.lastVisit = Date.now();
  state.journey = Array.isArray(state.journey) ? state.journey : [];

  if (eventType) {
    state.journey.push({
      type: eventType,
      daimonId: daimon.id,
      formId: daimon.formId,
      method: daimon.creationMethod,
      timestamp: Date.now()
    });
  }

  return writeJsonKey(STATE_KEY, state);
}

/**
 * Create and save a player daimon.
 * @param {string} formId - ID of the daimon form (e.g. "beast_001_bear")
 * @param {string} creationMethod - "quick" | "natal" | "random"
 * @param {Object} [natalChart] - natal chart data (optional)
 * @param {Object} [form] - already loaded daimon form data from daimon_forms.json
 * @returns {Object} the created canonical daimon
 */
export function createPlayerDaimon(formId, creationMethod, natalChart, form) {
  var selectedForm = form || { id: formId };
  var daimon = buildCanonicalDaimon(selectedForm, creationMethod, natalChart, {});

  writeJsonKey(DAIMON_KEY, daimon);
  saveDaimonToGameState(daimon, 'daimon_created');

  var history = readJsonKey(DAIMON_HISTORY_KEY, []);
  history.push({
    daimonId: daimon.id,
    formId: formId,
    method: creationMethod,
    timestamp: daimon.createdAt,
    linkedToGameState: true
  });
  writeJsonKey(DAIMON_HISTORY_KEY, history);

  return daimon;
}

/**
 * Load the current player daimon from the unified game state.
 * Falls back to the older standalone Daimon key.
 */
export function loadPlayerDaimon() {
  var state = readJsonKey(STATE_KEY, null) || readJsonKey(LEGACY_STATE_KEY, null);
  if (state && state.daimon) return state.daimon;
  return readJsonKey(DAIMON_KEY, null);
}

/**
 * Save updated daimon state in both the standalone key and the game state.
 */
export function savePlayerDaimon(daimon) {
  if (!daimon) return false;
  daimon.updatedAt = new Date().toISOString();
  writeJsonKey(DAIMON_KEY, daimon);
  return saveDaimonToGameState(daimon);
}

/**
 * Check if player already has a daimon.
 */
export function hasDaimon() {
  return !!loadPlayerDaimon();
}

/**
 * Get daimon form data by ID.
 */
export async function getDaimonForm(formId) {
  var paths = ['../data/daimons/daimon_forms.json', 'data/daimons/daimon_forms.json'];
  for (var i = 0; i < paths.length; i++) {
    try {
      var resp = await fetch(paths[i]);
      if (!resp.ok) continue;
      var data = await resp.json();
      return data.forms.find(function(f) { return f.id === formId; }) || null;
    } catch (e) {
      // Try next relative path.
    }
  }
  return null;
}
