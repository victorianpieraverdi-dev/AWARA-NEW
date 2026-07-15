/* ============================================================
   AWARA · SENSITIVITY & ASSEMBLY POINT v1
   Чувствительность — главное качество, развиваемое в игре.
   НЕ ощущаемость, а Чувствительность к Свету, Духу.
   Точка сборки — движение по Лучу Восприятия.
   Загружать ПОСЛЕ: awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraSensitivity && window.__awaraSensitivity >= 1) return;
window.__awaraSensitivity = 1;

/* ═══════════════════════════════════════════
   I. SENSITIVITY LEVELS
   ═══════════════════════════════════════════ */

var LEVELS = [
  { level: 0, name_ru: 'Спящая',           min: 0,   max: 5,   color: '#555',    desc: 'Обычное состояние' },
  { level: 1, name_ru: 'Пробуждающаяся',   min: 5,   max: 20,  color: '#7A7A7A', desc: 'Начинает различать' },
  { level: 2, name_ru: 'Тонкая',           min: 20,  max: 50,  color: '#A090C0', desc: 'Чувствует свет, тени, связи' },
  { level: 3, name_ru: 'Глубокая',         min: 50,  max: 100, color: '#C0A060', desc: 'Сострадание как состояние' },
  { level: 4, name_ru: 'Чистая',           min: 100, max: 9999, color: '#E0D080', desc: 'Прямое восприятие Ра' }
];

/* Assembly point positions by loka */
var ASSEMBLY_POINTS = {
  1:  { name_ru: 'Бхур-лока',        desc: 'Физический мир', plane: 'Душа' },
  2:  { name_ru: 'Бхувар-лока',      desc: 'Промежуточный мир', plane: 'Душа' },
  3:  { name_ru: 'Свар-лока',        desc: 'Небо дэвов', plane: 'Душа' },
  4:  { name_ru: 'Махар-лока',       desc: 'Великие мудрецы', plane: 'Джива' },
  5:  { name_ru: 'Джана-лока',       desc: 'Сыны Брахмы', plane: 'Джива' },
  6:  { name_ru: 'Тапо-лока',       desc: 'Подвижники', plane: 'Джива' },
  7:  { name_ru: 'Сатья-лока',      desc: 'Мир истины', plane: 'Дух' },
  8:  { name_ru: 'Атала',           desc: 'Тень Муладхары', plane: 'Тень' },
  9:  { name_ru: 'Витала',          desc: 'Тень Свадхистханы', plane: 'Тень' },
  10: { name_ru: 'Сутала',          desc: 'Тень Манипуры', plane: 'Тень' },
  11: { name_ru: 'Расатала',        desc: 'Тень Анахаты', plane: 'Тень' },
  12: { name_ru: 'Талатала',        desc: 'Тень Вишуддхи', plane: 'Тень' },
  13: { name_ru: 'Махатала',        desc: 'Тень Аджны', plane: 'Тень' },
  14: { name_ru: 'Патала',          desc: 'Тень Сахасрары', plane: 'Тень' }
};

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }
function r(n){ return Math.round(n * 1000) / 1000; }

function ensureState(){
  var s = S();
  if(!s) return;
  if(typeof s.sensitivity !== 'number') s.sensitivity = 0;
  if(typeof s.assembly_point !== 'number') s.assembly_point = 1;
}

function _save(){
  try { localStorage.setItem('STATE', JSON.stringify(S())); } catch(e){}
}

function _fireEvent(name, detail){
  try { window.dispatchEvent(new CustomEvent('awara-' + name, { detail: detail || {} })); } catch(e){}
}

/* ═══════════════════════════════════════════
   III. SENSITIVITY GROWTH
   ═══════════════════════════════════════════ */

function getLevel(val){
  if(typeof val !== 'number') val = 0;
  for(var i = LEVELS.length - 1; i >= 0; i--){
    if(val >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getSensitivity(){
  var s = S();
  if(!s) return { value: 0, level: LEVELS[0] };
  ensureState();
  return {
    value: s.sensitivity,
    level: getLevel(s.sensitivity)
  };
}

/**
 * Update sensitivity after a quest.
 * Sources:
 * - quality > 0.7 → +0.1-0.3
 * - compassion axis quests → +0.1
 * - awakened ether → ×1.5 growth
 * - serving/creative quests → +0.05
 *
 * @param {object} evaluation — AI evaluation result
 * @param {number} multiplier — total quest multiplier
 */
function updateSensitivity(evaluation, multiplier){
  var s = S();
  if(!s) return;
  ensureState();

  var growth = 0;

  /* Quality contribution */
  var q = evaluation.quality_score || 0;
  if(q > 0.7){
    growth += 0.1 + (q - 0.7) * 0.67; /* 0.1 at 0.7, 0.3 at 1.0 */
  }

  /* Compassion axis */
  if(evaluation.primary_axis === 'compassion' || evaluation.secondary_axis === 'compassion'){
    growth += 0.1;
  }

  /* Creativity bonus */
  if(evaluation.creativity_score && evaluation.creativity_score > 0.5){
    growth += 0.05;
  }

  /* Ether awakened bonus */
  if(window.AwaraParticles){
    var etherState = window.AwaraParticles.getEtherState();
    if(etherState === 'awakened') growth *= 1.5;
    else if(etherState === 'awakening') growth *= 1.2;
  }

  /* Diminishing returns at high levels */
  if(s.sensitivity > 50) growth *= 0.7;
  if(s.sensitivity > 100) growth *= 0.5;

  if(growth > 0){
    var oldLevel = getLevel(s.sensitivity).level;
    s.sensitivity = r(s.sensitivity + growth);
    var newLevel = getLevel(s.sensitivity).level;

    if(newLevel > oldLevel){
      _fireEvent('sensitivity-level-up', { level: newLevel, name: getLevel(s.sensitivity).name_ru });
    }
  }

  _save();
}

/**
 * Get sensitivity particle bonus.
 * +0.05 per level when ether is awakened.
 * @returns {number} bonus multiplier (added to ether multiplier)
 */
function getParticleBonus(){
  var s = S();
  if(!s) return 0;
  ensureState();
  var lvl = getLevel(s.sensitivity).level;
  return lvl * 0.05;
}

/* ═══════════════════════════════════════════
   IV. ASSEMBLY POINT
   ═══════════════════════════════════════════ */

function getAssemblyPoint(){
  var s = S();
  if(!s) return { loka: 1, info: ASSEMBLY_POINTS[1] };
  ensureState();
  var loka = s.assembly_point || 1;
  return { loka: loka, info: ASSEMBLY_POINTS[loka] || ASSEMBLY_POINTS[1] };
}

/**
 * Update assembly point based on quest evaluation.
 * Loka from AI evaluation moves assembly point.
 * @param {number} evaluatedLoka — loka from AI (1-14)
 */
function updateAssemblyPoint(evaluatedLoka){
  var s = S();
  if(!s) return;
  ensureState();

  if(typeof evaluatedLoka !== 'number' || evaluatedLoka < 1 || evaluatedLoka > 14) return;

  var current = s.assembly_point || 1;

  /* Smooth movement: blend current with evaluated (EMA) */
  var alpha = 0.2; /* slow movement */
  var newPoint = Math.round(current * (1 - alpha) + evaluatedLoka * alpha);
  newPoint = Math.max(1, Math.min(14, newPoint));

  if(newPoint !== current){
    s.assembly_point = newPoint;
    _fireEvent('assembly-point-moved', {
      from: current, to: newPoint,
      info: ASSEMBLY_POINTS[newPoint]
    });
    _save();
  }
}

/* ═══════════════════════════════════════════
   V. RAY OF PERCEPTION (descriptive)
   ═══════════════════════════════════════════ */

/**
 * Get Ray of Perception description based on current state.
 * The Ray is not a mechanic but a narrative layer.
 */
function getRayDescription(){
  var s = S();
  if(!s) return { clarity: 'dim', message: '' };
  ensureState();

  var sens = getSensitivity();
  var ether = window.AwaraParticles ? window.AwaraParticles.getEtherState() : 'sleeping';

  if(ether === 'awakened' && sens.level.level >= 3){
    return {
      clarity: 'bright',
      message: 'Луч Восприятия ярок. Ты читаешь его свободно, как текст.',
      color: '#FFD700'
    };
  }
  if(ether === 'awakened' && sens.level.level >= 1){
    return {
      clarity: 'clear',
      message: 'Луч Восприятия проходит. Осознанность присутствует.',
      color: '#C0C060'
    };
  }
  if(ether === 'awakening'){
    return {
      clarity: 'flickering',
      message: 'Луч мерцает. Сознание пробуждается.',
      color: '#808060'
    };
  }
  return {
    clarity: 'dim',
    message: 'Луч тусклый. Каналы восприятия загрязнены.',
    color: '#555'
  };
}

/* ═══════════════════════════════════════════
   VI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraSensitivity = {
  __v: 1,
  getSensitivity: getSensitivity,
  updateSensitivity: updateSensitivity,
  getParticleBonus: getParticleBonus,
  getLevel: getLevel,
  getAssemblyPoint: getAssemblyPoint,
  updateAssemblyPoint: updateAssemblyPoint,
  getRayDescription: getRayDescription,
  LEVELS: LEVELS,
  ASSEMBLY_POINTS: ASSEMBLY_POINTS,
  ensureState: ensureState
};

console.log('[AwaraSensitivity] Sensitivity & Assembly Point v1 ready');
})();
