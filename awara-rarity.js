/* ============================================================
   AWARA · PROMPT RARITY SYSTEM v1
   Раритет промптов для арта и трека дня.
   Промпты углубляются и растут вместе с игроком.
   Загружать ПОСЛЕ: awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraRarity && window.__awaraRarity >= 1) return;
window.__awaraRarity = 1;

/* ═══════════════════════════════════════════
   I. RARITY TIERS
   ═══════════════════════════════════════════ */

var TIERS = [
  {
    id: 'common',
    name_ru: 'Обычный',
    icon: '🟤',
    color: '#8B7355',
    ring_max: -1,
    lens_max: 1,
    light_max: 34,
    layers: ['daimon_name', 'element', 'simple_image'],
    prompt_template: '{daimon}, {element} element, {mood}, simple symbolic art, minimal, mystical'
  },
  {
    id: 'uncommon',
    name_ru: 'Необычный',
    icon: '🟢',
    color: '#2E8B57',
    ring_max: 2,
    lens_max: 2,
    light_max: 66,
    layers: ['daimon_name', 'element', 'lens_symbolism', 'dual_palettes', 'nakshatra'],
    prompt_template: '{daimon}, {element} and {element2} duality, {lens} symbolism, {nakshatra} star energy, {mood}, dual color palette, mystical depth'
  },
  {
    id: 'rare',
    name_ru: 'Редкий',
    icon: '🔵',
    color: '#4169E1',
    ring_max: 4,
    lens_max: 3,
    light_max: 999,
    layers: ['daimon_name', 'element', 'lens_symbolism', 'loka', 'chakra', 'sacred_geometry'],
    prompt_template: '{daimon} in {loka}, {element} essence, {lens} sacred symbols, {chakra} energy center, sacred geometry mandala, {mood}, deep mythological atmosphere'
  },
  {
    id: 'epic',
    name_ru: 'Эпический',
    icon: '🟣',
    color: '#8B008B',
    ring_max: 7,
    lens_max: 4,
    light_max: 9999,
    layers: ['daimon_name', 'element', 'lens_cross', 'mythological_plot', 'deity', 'light_structures'],
    prompt_template: '{daimon} channeling {deity}, {lens_cross} fusion, {myth_plot}, light structures visible ({structures}), {element} transfiguration, {mood}, epic mythological painting'
  },
  {
    id: 'legendary',
    name_ru: 'Легендарный',
    icon: '🟡',
    color: '#FFD700',
    ring_max: 9,
    lens_max: 6,
    light_max: Infinity,
    layers: ['full_myth', 'all_lenses', 'ray', 'ra_force', 'transcendent'],
    prompt_template: '{daimon} as {ra_aspect}, all lenses unified ({all_lenses}), Ray of Perception blazing through {loka}, {deity} blessing, ether fully awakened, {structures}, {myth_plot}, transcendent divine masterpiece, {mood}'
  }
];

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }

function getRing(){
  var s = S();
  if(!s || !s.progress) return -3;
  return s.progress.current_ring || -3;
}

function getActiveLensCount(){
  var s = S();
  if(!s || !s.lenses) return 0;
  var count = 0;
  for(var k in s.lenses){
    if(s.lenses[k].quests_done > 0 || s.lenses[k].state === 'active') count++;
  }
  return count;
}

function getTotalLight(){
  var s = S();
  if(!s || !s.progress) return 0;
  return s.progress.total_light || 0;
}

/* ═══════════════════════════════════════════
   III. DETERMINE RARITY
   ═══════════════════════════════════════════ */

function getCurrentTier(){
  var ring = getRing();
  var lenses = getActiveLensCount();
  var light = getTotalLight();

  /* Find highest matching tier */
  for(var i = TIERS.length - 1; i >= 0; i--){
    var tier = TIERS[i];
    /* Need to meet ALL conditions */
    if(ring >= (i === 0 ? -3 : TIERS[i-1].ring_max + 1) &&
       lenses >= (tier.lens_max >= 6 ? 6 : (i === 0 ? 0 : TIERS[i-1].lens_max + 1))){
      return tier;
    }
  }

  /* Fallback: determine by best matching criterion */
  for(var j = TIERS.length - 1; j >= 0; j--){
    if(ring >= -3 + j * 2.5 || lenses >= j + 1 || light > j * 50) return TIERS[j];
  }

  return TIERS[0];
}

/**
 * More precise tier calculation using weighted score.
 */
function getTierByScore(){
  var ring = getRing();
  var lenses = getActiveLensCount();
  var light = getTotalLight();
  var mera = 0;

  var s = S();
  if(s && s.mera_windows){
    var WINDOWS = ['daimon','locations','emf','newmatrix','soul','daimon_soul','chronicle','hram','cosmos','supergame'];
    for(var i = WINDOWS.length - 1; i >= 0; i--){
      if((s.mera_windows[WINDOWS[i]] || 0) > 0) { mera = i; break; }
    }
  }

  /* Score: ring contributes 40%, lenses 30%, mera 30% */
  var ringScore = Math.min(1, (ring + 3) / 12);      /* -3→0, 9→1 */
  var lensScore = Math.min(1, lenses / 8);             /* 0→0, 8+→1 */
  var meraScore = Math.min(1, mera / 9);               /* 0→0, 9→1 */

  var score = ringScore * 0.4 + lensScore * 0.3 + meraScore * 0.3;

  if(score >= 0.8) return TIERS[4]; /* Legendary */
  if(score >= 0.6) return TIERS[3]; /* Epic */
  if(score >= 0.4) return TIERS[2]; /* Rare */
  if(score >= 0.2) return TIERS[1]; /* Uncommon */
  return TIERS[0];                   /* Common */
}

/* ═══════════════════════════════════════════
   IV. PROMPT ENRICHMENT
   ═══════════════════════════════════════════ */

/* Data lookups */
var ELEMENT_NAMES = {
  earth:'Earth',water:'Water',fire:'Fire',air:'Air',ether:'Ether'
};
var ELEMENT_MOODS = {
  earth:'grounded, ancient, stone and roots',
  water:'flowing, deep ocean, moonlit waves',
  fire:'blazing, transformative, sacred flame',
  air:'ethereal, windswept, crystalline sky',
  ether:'transcendent, void of pure light, beyond form'
};
var LENS_KEYWORDS = {
  vedic:'Vedic mandala, lotus, Sanskrit symbols',
  tarot_arcanic:'Tarot arcana, mystical cards, occult symbols',
  kabbalistic:'Tree of Life, Hebrew letters, Sephirot',
  hermetic_alchemical:'Alchemical symbols, philosopher\'s stone, mercury',
  slavic:'Slavic patterns, Rodimich, birch forest',
  gnostic:'Gnostic light, Sophia, divine spark',
  daoist:'Yin-yang, flowing water, bamboo, mist',
  chinese_iching:'I-Ching hexagrams, dragon, jade',
  egyptian:'Egyptian hieroglyphs, Ankh, Eye of Horus',
  celtic:'Celtic knots, druidic oak, triple spiral',
  norse:'Norse runes, Yggdrasil, viking symbols',
  buddhist_mahayana:'Buddha, lotus throne, dharma wheel',
  shamanic:'Shamanic drum, spirit animals, cave paintings',
  tantric_kashmiri:'Tantric yantra, kundalini serpent, Shiva-Shakti'
};

/**
 * Build enriched prompt for art/music generation.
 * @param {object} opts — { questType, lensSlug, lensDepth, element, mood, daimonName }
 * @returns {object} { tier, artPrompt, sunoPrompt, layers }
 */
function buildEnrichedPrompt(opts){
  opts = opts || {};
  var tier = getTierByScore();
  var s = S();
  var daimon = (opts.daimonName || (s && s.daimon ? s.daimon.name : 'Даймон'));
  var element = opts.element || 'fire';
  var mood = ELEMENT_MOODS[element] || 'mystical';
  var lensSlug = opts.lensSlug || 'vedic';
  var lensKeywords = LENS_KEYWORDS[lensSlug] || lensSlug;

  /* Base art prompt */
  var artPrompt = tier.prompt_template
    .replace(/\{daimon\}/g, daimon)
    .replace(/\{element\}/g, ELEMENT_NAMES[element] || element)
    .replace(/\{element2\}/g, _secondElement(element))
    .replace(/\{mood\}/g, mood)
    .replace(/\{lens\}/g, lensKeywords)
    .replace(/\{nakshatra\}/g, _getNakshatra())
    .replace(/\{loka\}/g, _getLoka())
    .replace(/\{chakra\}/g, _getChakra())
    .replace(/\{deity\}/g, _getDeity(lensSlug))
    .replace(/\{lens_cross\}/g, _getLensCross())
    .replace(/\{myth_plot\}/g, _getMythPlot(tier.id))
    .replace(/\{structures\}/g, _getStructures())
    .replace(/\{ra_aspect\}/g, 'vessel of Ra\'s inner sun')
    .replace(/\{all_lenses\}/g, _getAllLenses());

  /* Suno music prompt */
  var sunoBase = '';
  if(window.AwaraXP && window.AwaraXP.buildSunoPrompt){
    sunoBase = window.AwaraXP.buildSunoPrompt(opts.questType || 'meditate', opts.lensDepth || 1, lensSlug);
  }
  var sunoPrompt = sunoBase || 'ambient, mystical, 2 minutes, no vocals';

  /* Enrich suno based on tier */
  if(tier.id === 'epic' || tier.id === 'legendary'){
    sunoPrompt += ', orchestral depth, sacred chanting undertone';
  } else if(tier.id === 'rare'){
    sunoPrompt += ', layered pads, temple bells';
  }

  return {
    tier: tier,
    artPrompt: artPrompt,
    sunoPrompt: sunoPrompt,
    layers: tier.layers
  };
}

/* Helper lookups */
function _secondElement(el){
  var map = { earth:'water', water:'air', fire:'earth', air:'fire', ether:'fire' };
  return ELEMENT_NAMES[map[el] || 'water'] || 'Water';
}

function _getNakshatra(){
  if(window.STATE && window.STATE.natal && window.STATE.natal.moonNakshatra){
    return window.STATE.natal.moonNakshatra;
  }
  return 'Ashwini';
}

function _getLoka(){
  if(window.AwaraSensitivity){
    var ap = window.AwaraSensitivity.getAssemblyPoint();
    return ap.info ? ap.info.name_ru : 'Бхур-лока';
  }
  return 'Бхур-лока';
}

function _getChakra(){
  var ring = getRing();
  var chakras = ['Муладхара','Свадхистхана','Манипура','Анахата','Вишуддха','Аджна','Сахасрара'];
  var idx = Math.min(6, Math.max(0, Math.floor((ring + 3) / 2)));
  return chakras[idx];
}

function _getDeity(lens){
  var deities = {
    vedic:'Agni', slavic:'Сварог', gnostic:'Sophia', egyptian:'Thoth',
    norse:'Odin', celtic:'Cernunnos', daoist:'Laozi', buddhist_mahayana:'Avalokiteshvara',
    shamanic:'Great Spirit', tantric_kashmiri:'Shiva'
  };
  return deities[lens] || 'the Ancient One';
}

function _getLensCross(){
  var s = S();
  if(!s || !s.lenses) return 'vedic-gnostic';
  var active = Object.keys(s.lenses).filter(function(k){ return s.lenses[k].quests_done > 0; });
  if(active.length >= 2) return active[0] + '-' + active[1];
  return active[0] || 'vedic';
}

function _getMythPlot(tierId){
  var plots = {
    common: 'awakening from slumber',
    uncommon: 'first steps on the path of light',
    rare: 'descent into the labyrinth of self',
    epic: 'battle with the shadow, ascending through worlds',
    legendary: 'liberation from the world-egg, union with the Eternal'
  };
  return plots[tierId] || plots.common;
}

function _getStructures(){
  var s = S();
  if(!s || !s.structures_built || s.structures_built.length === 0) return 'heart awakening';
  return s.structures_built.join(', ');
}

function _getAllLenses(){
  var s = S();
  if(!s || !s.lenses) return 'vedic';
  var active = Object.keys(s.lenses).filter(function(k){ return s.lenses[k].quests_done > 0; });
  return active.slice(0, 5).join(', ') || 'vedic';
}

/* ═══════════════════════════════════════════
   V. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraRarity = {
  __v: 1,
  TIERS: TIERS,
  getCurrentTier: getCurrentTier,
  getTierByScore: getTierByScore,
  buildEnrichedPrompt: buildEnrichedPrompt
};

console.log('[AwaraRarity] Prompt Rarity System v1 ready');
})();
