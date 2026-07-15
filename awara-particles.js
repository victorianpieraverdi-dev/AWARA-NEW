/* ============================================================
   AWARA · PARTICLES & ETHER CYCLE v1
   Двухступенчатая система: квесты дают ✧ частицы,
   ночью частицы конвертируются в ☀ свет.
   Эфир = состояние сознания, не таймер.
   Загружать ПОСЛЕ: awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraParticles && window.__awaraParticles >= 1) return;
window.__awaraParticles = 1;

/* ═══════════════════════════════════════════
   I. CONSTANTS
   ═══════════════════════════════════════════ */

var ETHER_STATES = {
  sleeping:   { name_ru:'Спящий эфир',          color:'#555',    mult: 1.0 },
  awakening:  { name_ru:'Пробуждающийся эфир',   color:'#A0A0A0', mult: 1.1 },
  awakened:   { name_ru:'Пробуждённый эфир',      color:'#E0C060', mult: 1.2 }
};

/* Thresholds: how many particles in a session to shift ether state */
var ETHER_THRESHOLDS = {
  'ring_neg3_to_0': 3,
  'ring_1_to_3':    5,
  'ring_4_to_6':    8,
  'ring_7_to_9':    12
};

/* Overnight conversion ratio by ring */
var CONVERSION_RATIO = {
  '-3': 0.70, '-2': 0.72, '-1': 0.75,
  '0': 0.78, '1': 0.80, '2': 0.82,
  '3': 0.84, '4': 0.86, '5': 0.88,
  '6': 0.90, '7': 0.90, '8': 0.90, '9': 0.90
};

/* Sustain: how many quests ether stays awakened before starting to decay */
var ETHER_SUSTAIN = {
  'ring_neg3_to_0': 2,   /* 1-3 quests */
  'ring_1_to_3':    4,
  'ring_4_to_6':    7,
  'ring_7_to_9':    99   /* nearly permanent */
};

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }

function getRing(){
  var s = S();
  if(!s || !s.progress) return -3;
  return s.progress.current_ring || -3;
}

function ringBucket(ring){
  if(ring <= 0) return 'ring_neg3_to_0';
  if(ring <= 3) return 'ring_1_to_3';
  if(ring <= 6) return 'ring_4_to_6';
  return 'ring_7_to_9';
}

function r(n){ return Math.round(n * 100) / 100; }

/* ═══════════════════════════════════════════
   III. INIT STATE FIELDS
   ═══════════════════════════════════════════ */

function ensureParticleState(){
  var s = S();
  if(!s) return;
  if(typeof s.particles_today !== 'number')       s.particles_today = 0;
  if(typeof s.particles_total !== 'number')        s.particles_total = 0;
  if(typeof s.particles_session !== 'number')      s.particles_session = 0;
  if(!s.ether_state)                               s.ether_state = 'sleeping';
  if(typeof s.ether_awakened_carry !== 'number')   s.ether_awakened_carry = 0;
  if(typeof s.ether_quests_since_awaken !== 'number') s.ether_quests_since_awaken = 0;
}

/* ═══════════════════════════════════════════
   IV. ETHER CYCLE MANAGEMENT
   ═══════════════════════════════════════════ */

function getEtherState(){
  var s = S();
  if(!s) return 'sleeping';
  ensureParticleState();
  return s.ether_state || 'sleeping';
}

function getEtherMultiplier(){
  var state = getEtherState();
  return ETHER_STATES[state] ? ETHER_STATES[state].mult : 1.0;
}

function getEtherInfo(){
  var s = S();
  if(!s) return ETHER_STATES.sleeping;
  ensureParticleState();
  var st = s.ether_state || 'sleeping';
  var info = Object.assign({}, ETHER_STATES[st] || ETHER_STATES.sleeping);
  info.state = st;
  info.particles_session = s.particles_session || 0;
  var bucket = ringBucket(getRing());
  info.threshold = ETHER_THRESHOLDS[bucket] || 5;
  info.progress = Math.min(1, info.particles_session / info.threshold);
  return info;
}

/**
 * Called after each quest to update ether state.
 * @param {number} particlesEarned — particles from this quest
 * @param {number} qualityScore — AI quality score (0-1)
 */
function updateEther(particlesEarned, qualityScore){
  var s = S();
  if(!s) return;
  ensureParticleState();

  s.particles_session += particlesEarned;
  var ring = getRing();
  var bucket = ringBucket(ring);
  var threshold = ETHER_THRESHOLDS[bucket] || 5;

  if(s.ether_state === 'sleeping'){
    if(s.particles_session >= threshold){
      s.ether_state = 'awakening';
      s.ether_quests_since_awaken = 0;
      _fireEvent('ether-awakening');
    }
  }
  else if(s.ether_state === 'awakening'){
    /* Needs quality confirmation to fully awaken */
    if(qualityScore >= 0.5){
      s.ether_state = 'awakened';
      s.ether_quests_since_awaken = 0;
      _fireEvent('ether-awakened');
    }
  }
  else if(s.ether_state === 'awakened'){
    /* Track sustain — can decay */
    s.ether_quests_since_awaken = (s.ether_quests_since_awaken || 0) + 1;
    var sustain = ETHER_SUSTAIN[bucket] || 4;
    if(s.ether_quests_since_awaken > sustain && qualityScore < 0.4){
      s.ether_state = 'awakening';
      _fireEvent('ether-fading');
    }
  }
}

/**
 * Reset ether at end of day (overnight). Eternity anchor preserves some.
 */
function resetEtherOvernight(){
  var s = S();
  if(!s) return;
  ensureParticleState();
  var carry = s.ether_awakened_carry || 0; /* from Eternity Anchor structure */
  if(carry > 0 && s.ether_state === 'awakened'){
    s.ether_state = 'awakening'; /* preserved partial awakening */
    s.particles_session = Math.floor((ETHER_THRESHOLDS[ringBucket(getRing())] || 5) * carry);
  } else {
    s.ether_state = 'sleeping';
    s.particles_session = 0;
  }
  s.ether_quests_since_awaken = 0;
}

/* ═══════════════════════════════════════════
   V. PARTICLE COLLECTION (quest → particles)
   ═══════════════════════════════════════════ */

/**
 * Convert what would have been "light" from processExperience into particles.
 * Called by the patched processExperience.
 * @param {number} rawLight — the finalLight from engine computation
 * @returns {number} particles earned (same number, just renamed + ether mult)
 */
function collectParticles(rawLight){
  var s = S();
  if(!s) return rawLight;
  ensureParticleState();

  var etherMult = getEtherMultiplier();
  var particles = r(rawLight * etherMult);

  s.particles_today += particles;
  s.particles_total = (s.particles_total || 0) + particles;

  return particles;
}

/* ═══════════════════════════════════════════
   VI. OVERNIGHT CONVERSION (particles → light)
   ═══════════════════════════════════════════ */

/**
 * Convert today's particles into actual light.
 * Called during overnight flow, BEFORE cascade_down.
 * @returns {object} { particles_converted, light_gained, ratio }
 */
function overnightConvert(){
  var s = S();
  if(!s) return { particles_converted:0, light_gained:0, ratio:0 };
  ensureParticleState();

  var ring = getRing();
  var ratio = CONVERSION_RATIO[String(ring)] || 0.78;

  /* Sensitivity bonus: +0.02 per sensitivity level */
  if(s.sensitivity && typeof s.sensitivity === 'number'){
    var sensLvl = sensitivityLevel(s.sensitivity);
    ratio = Math.min(0.95, ratio + sensLvl * 0.02);
  }

  /* Radiance body structure → max conversion */
  if(s.structures_built && s.structures_built.indexOf('radiance_body') >= 0){
    ratio = 0.95;
  }
  /* Heart core adds +0.05 */
  else if(s.structures_built && s.structures_built.indexOf('heart_core') >= 0){
    ratio = Math.min(0.95, ratio + 0.05);
  }

  var particles = s.particles_today || 0;
  var light = r(particles * ratio);

  /* Add light to total (state update) */
  if(!s.progress) s.progress = { total_light:0, current_ring:-3, days_played:0, quests_completed:0 };
  s.progress.total_light = r((s.progress.total_light || 0) + light);

  /* Distribute to mera windows proportionally */
  if(window.AwaraXP){
    var win = window.AwaraXP.selectWindow ? window.AwaraXP.selectWindow(light) : null;
    if(win && s.mera_windows && s.mera_windows[win.id] !== undefined){
      s.mera_windows[win.id] += light;
    }
  }

  /* Recalc ring */
  if(window.AwaraXP && window.AwaraXP.computeRing){
    s.progress.current_ring = window.AwaraXP.computeRing(s.progress.total_light);
  }

  /* Reset daily particles */
  var result = {
    particles_converted: particles,
    light_gained: light,
    ratio: ratio
  };

  s.particles_today = 0;

  console.log('[Particles] Overnight conversion:', result);
  _fireEvent('particles-converted', result);

  return result;
}

/* ═══════════════════════════════════════════
   VII. SENSITIVITY HELPER
   ═══════════════════════════════════════════ */

function sensitivityLevel(val){
  if(val >= 100) return 4;
  if(val >= 50)  return 3;
  if(val >= 20)  return 2;
  if(val >= 5)   return 1;
  return 0;
}

/* ═══════════════════════════════════════════
   VIII. EVENT HELPER
   ═══════════════════════════════════════════ */

function _fireEvent(name, detail){
  try { window.dispatchEvent(new CustomEvent('awara-' + name, { detail: detail || {} })); } catch(e){}
}

/* ═══════════════════════════════════════════
   IX. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraParticles = {
  __v: 1,
  collectParticles: collectParticles,
  updateEther: updateEther,
  getEtherState: getEtherState,
  getEtherMultiplier: getEtherMultiplier,
  getEtherInfo: getEtherInfo,
  overnightConvert: overnightConvert,
  resetEtherOvernight: resetEtherOvernight,
  ensureState: ensureParticleState,
  ETHER_STATES: ETHER_STATES,
  CONVERSION_RATIO: CONVERSION_RATIO
};

console.log('[AwaraParticles] Particles & Ether Cycle v1 ready');
})();
