/* ============================================================
   AWARA · PASSIVE FLOW v1
   Пассивное наполнение линз от практик и самодисциплин.
   Daily Checkin при первом входе за день.
   Классификация намерений через ИИ.
   Загружать ПОСЛЕ: awara-experience-engine.js, awara-particles.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraPassiveFlow && window.__awaraPassiveFlow >= 1) return;
window.__awaraPassiveFlow = 1;

/* ═══════════════════════════════════════════
   I. CONSTANTS
   ═══════════════════════════════════════════ */

var PRACTICE_LIGHT_PER_DAY = 0.1;     /* per lens per practice */
var DISCIPLINE_LIGHT_PER_DAY = 0.3;   /* per lens per discipline (base) */

var STREAK_MULT = [
  { min: 1,  max: 7,   mult: 1.0, label: 'Начало' },
  { min: 8,  max: 21,  mult: 1.3, label: 'Привычка формируется' },
  { min: 22, max: 60,  mult: 1.6, label: 'Привычка' },
  { min: 61, max: 9999, mult: 2.0, label: 'Практика стала частью тебя' }
];

var LENS_ACTIVATION_THRESHOLD = 5.0;  /* passive light to awaken a sleeping lens */
var PASSIVE_CAP_RATIO = 0.5;          /* passive ≤ 0.5× quest light */
var CHECKIN_KEY = 'awara_daily_checkin';
var STORE_KEY = 'awara_intentions';

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }
function r(n){ return Math.round(n * 100) / 100; }
function today(){ return new Date().toISOString().slice(0,10); }

function streakMultiplier(streak){
  for(var i = STREAK_MULT.length - 1; i >= 0; i--){
    if(streak >= STREAK_MULT[i].min) return STREAK_MULT[i];
  }
  return STREAK_MULT[0];
}

/* ═══════════════════════════════════════════
   III. INTENTIONS STATE
   ═══════════════════════════════════════════ */

function ensureIntentionState(){
  var s = S();
  if(!s) return;
  if(!s.intentions) s.intentions = { practices: [], disciplines: [] };
  if(!s.intentions.practices) s.intentions.practices = [];
  if(!s.intentions.disciplines) s.intentions.disciplines = [];
}

function getIntentions(){
  var s = S();
  if(!s) return { practices: [], disciplines: [] };
  ensureIntentionState();
  return s.intentions;
}

/* ═══════════════════════════════════════════
   IV. ADD / REMOVE PRACTICES & DISCIPLINES
   ═══════════════════════════════════════════ */

function addPractice(text, activityId, lenses, axes){
  var s = S();
  if(!s) return;
  ensureIntentionState();
  s.intentions.practices.push({
    text: text,
    activity_id: activityId || 'custom',
    lenses: lenses || [],
    axes: axes || [],
    created: today()
  });
  _save();
  _fireEvent('practice-added', { text: text, lenses: lenses });
}

function addDiscipline(text, activityId, lenses, axes, schedule){
  var s = S();
  if(!s) return;
  ensureIntentionState();
  s.intentions.disciplines.push({
    text: text,
    activity_id: activityId || 'custom',
    schedule: schedule || 'daily',
    lenses: lenses || [],
    axes: axes || [],
    streak: 0,
    best_streak: 0,
    misses: 0,
    active: true,
    created: today(),
    last_checkin: null
  });
  _save();
  _fireEvent('discipline-added', { text: text, lenses: lenses });
}

function removePractice(index){
  var s = S();
  if(!s || !s.intentions) return;
  s.intentions.practices.splice(index, 1);
  _save();
}

function removeDiscipline(index){
  var s = S();
  if(!s || !s.intentions) return;
  s.intentions.disciplines.splice(index, 1);
  _save();
}

/* ═══════════════════════════════════════════
   V. DAILY CHECKIN
   ═══════════════════════════════════════════ */

function needsCheckin(){
  var s = S();
  if(!s) return false;
  ensureIntentionState();
  var disciplines = s.intentions.disciplines.filter(function(d){ return d.active; });
  if(disciplines.length === 0) return false;

  var lastCheck;
  try { lastCheck = localStorage.getItem(CHECKIN_KEY); } catch(e){}
  return lastCheck !== today();
}

/**
 * Process checkin results.
 * @param {Array} results — [{index, confirmed: boolean}]
 */
function processCheckin(results){
  var s = S();
  if(!s) return;
  ensureIntentionState();

  var lightTotal = 0;

  results.forEach(function(res){
    var disc = s.intentions.disciplines[res.index];
    if(!disc || !disc.active) return;

    if(res.confirmed){
      disc.streak = (disc.streak || 0) + 1;
      if(disc.streak > (disc.best_streak || 0)) disc.best_streak = disc.streak;
      disc.misses = 0;
      disc.last_checkin = today();

      /* Distribute passive light to lenses */
      var sm = streakMultiplier(disc.streak);
      var lightPerLens = r(DISCIPLINE_LIGHT_PER_DAY * sm.mult);
      (disc.lenses || []).forEach(function(lens){
        lightTotal += _addPassiveLightToLens(lens, lightPerLens);
      });

      /* Distribute to axes */
      (disc.axes || []).forEach(function(axis){
        if(s.axes && s.axes[axis] !== undefined){
          s.axes[axis] = r(s.axes[axis] + lightPerLens * 0.1);
        }
      });
    } else {
      disc.streak = 0;
      disc.misses = (disc.misses || 0) + 1;
      if(disc.misses >= 3){
        disc.active = false;
        _fireEvent('discipline-deactivated', { text: disc.text });
      }
    }
  });

  try { localStorage.setItem(CHECKIN_KEY, today()); } catch(e){}
  _save();
  _fireEvent('checkin-done', { light_total: lightTotal });
  return lightTotal;
}

/* ═══════════════════════════════════════════
   VI. OVERNIGHT PASSIVE FLOW
   ═══════════════════════════════════════════ */

/**
 * Called during overnight flow (after cascade_down, before ring_recalc).
 * Applies passive light from practices (no confirmation needed).
 * @returns {number} total passive light added
 */
function overnightPassive(){
  var s = S();
  if(!s) return 0;
  ensureIntentionState();

  var lightTotal = 0;

  /* Practices: unconditional passive flow */
  (s.intentions.practices || []).forEach(function(practice){
    (practice.lenses || []).forEach(function(lens){
      lightTotal += _addPassiveLightToLens(lens, PRACTICE_LIGHT_PER_DAY);
    });
  });

  /* Cap: passive ≤ 0.5× quest light */
  var questLight = 0;
  if(s.progress) questLight = s.progress.total_light || 0;
  /* Only apply cap if there were quests today */
  if(s.daily && s.daily.quest_count > 0){
    var maxPassive = (s.daily.quest_count || 1) * PASSIVE_CAP_RATIO;
    if(lightTotal > maxPassive && maxPassive > 0){
      lightTotal = maxPassive;
    }
  }
  /* Even with 0 quests, minimum passive still applies (already added above) */

  _save();
  console.log('[PassiveFlow] Overnight passive light: +' + r(lightTotal));
  return lightTotal;
}

/* ═══════════════════════════════════════════
   VII. LENS PASSIVE LIGHT HELPER
   ═══════════════════════════════════════════ */

function _addPassiveLightToLens(lensSlug, amount){
  var s = S();
  if(!s) return 0;
  if(!s.lenses) s.lenses = {};
  if(!s.lenses[lensSlug]){
    s.lenses[lensSlug] = {
      quests_done: 0, quality_sum: 0, quality_avg: 0,
      level: 0, passive_light: 0, state: 'sleeping', sources: []
    };
  }
  var lens = s.lenses[lensSlug];
  lens.passive_light = r((lens.passive_light || 0) + amount);

  /* Check activation threshold */
  if(lens.state === 'sleeping' && lens.passive_light >= LENS_ACTIVATION_THRESHOLD){
    lens.state = 'filling';
    _fireEvent('lens-awakening', { lens: lensSlug, passive_light: lens.passive_light });
  }
  if((lens.state === 'filling' || lens.state === 'sleeping') && lens.quests_done > 0){
    lens.state = 'active';
  }

  return amount;
}

/* ═══════════════════════════════════════════
   VIII. INTENTION CLASSIFICATION (via AI)
   ═══════════════════════════════════════════ */

/**
 * Classify free text into lenses + axes using AI.
 * @param {string} text — user's intention (e.g., "Я чайный мастер")
 * @returns {Promise<object>} { activity_id, lenses, axes, type, confidence }
 */
async function classifyIntention(text){
  if(!window.aiCall){
    return _fallbackClassify(text);
  }

  try {
    var prompt = 'Классифицируй намерение игрока. Ответь ТОЛЬКО валидным JSON.\n\n' +
      'Доступные линзы: vedic, tarot_arcanic, kabbalistic, hermetic_alchemical, slavic, gnostic, daoist, chinese_iching, egyptian, mayan, aztec_mexica, celtic, norse, shamanic, buddhist_mahayana, islamic_sufi_nur, christian_mystical_grail, atlantean_lemurian, shambhala, gene_keys, astrological, cosmic_galactic, shinto, sumerian_babylonian, zoroastrian, afro_dogon, yoruba_ifa_orisha, tantric_kashmiri, posthuman_ai_sophianic, technomagical, advaita_siddha, julian_byzantine, antique_greco_roman\n\n' +
      'Доступные оси: discipline, compassion, clarity, will, devotion, transformation, unity\n\n' +
      'Формат ответа:\n{"activity_id":"string","lenses":["lens1","lens2"],"axes":["axis1"],"type":"practice|discipline","confidence":0.8}\n\n' +
      'Текст игрока: "' + text + '"';

    var response = await window.aiCall([
      { role: 'system', content: 'Ты — классификатор намерений для игры Тигель. Отвечай только JSON.' },
      { role: 'user', content: prompt }
    ]);

    /* Parse JSON from response */
    var match = response.match(/\{[\s\S]*\}/);
    if(match){
      var result = JSON.parse(match[0]);
      return {
        activity_id: result.activity_id || 'custom',
        lenses: Array.isArray(result.lenses) ? result.lenses.slice(0, 3) : [],
        axes: Array.isArray(result.axes) ? result.axes.slice(0, 2) : [],
        type: result.type === 'discipline' ? 'discipline' : 'practice',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.5
      };
    }
  } catch(e){
    console.warn('[PassiveFlow] AI classification failed:', e);
  }

  return _fallbackClassify(text);
}

function _fallbackClassify(text){
  /* Simple keyword-based fallback */
  var t = (text || '').toLowerCase();
  var lenses = ['vedic'];
  var axes = ['discipline'];
  var type = 'practice';

  if(t.indexOf('йог') >= 0 || t.indexOf('yoga') >= 0) { lenses = ['vedic','tantric_kashmiri']; axes = ['discipline','will']; }
  else if(t.indexOf('медитац') >= 0 || t.indexOf('meditat') >= 0) { lenses = ['buddhist_mahayana','vedic']; axes = ['clarity']; }
  else if(t.indexOf('бег') >= 0 || t.indexOf('run') >= 0) { lenses = ['norse','slavic']; axes = ['will','discipline']; }
  else if(t.indexOf('чай') >= 0 || t.indexOf('tea') >= 0) { lenses = ['chinese_iching','daoist','shinto']; axes = ['clarity']; }
  else if(t.indexOf('рисо') >= 0 || t.indexOf('art') >= 0 || t.indexOf('творч') >= 0) { lenses = ['hermetic_alchemical']; axes = ['will','transformation']; }
  else if(t.indexOf('молитв') >= 0 || t.indexOf('pray') >= 0) { lenses = ['christian_mystical_grail','slavic']; axes = ['devotion']; }
  else if(t.indexOf('мантр') >= 0) { lenses = ['vedic','tantric_kashmiri']; axes = ['devotion','clarity']; }
  else if(t.indexOf('дыхан') >= 0 || t.indexOf('пранаям') >= 0) { lenses = ['vedic','daoist']; axes = ['discipline','will']; }
  else if(t.indexOf('холод') >= 0 || t.indexOf('закалив') >= 0) { lenses = ['norse','slavic']; axes = ['will','discipline']; }
  else if(t.indexOf('пост') >= 0 || t.indexOf('голод') >= 0) { lenses = ['christian_mystical_grail','slavic']; axes = ['discipline','transformation']; }
  else if(t.indexOf('чтен') >= 0 || t.indexOf('книг') >= 0 || t.indexOf('read') >= 0) { lenses = ['hermetic_alchemical','kabbalistic']; axes = ['clarity']; }
  else if(t.indexOf('служен') >= 0 || t.indexOf('волонт') >= 0) { lenses = ['christian_mystical_grail','buddhist_mahayana']; axes = ['compassion','devotion']; }

  /* Is it a discipline? (mentions schedule/daily/regular) */
  if(t.indexOf('каждый день') >= 0 || t.indexOf('ежедн') >= 0 || t.indexOf('утр') >= 0 || t.indexOf('вечер') >= 0 || t.indexOf('daily') >= 0){
    type = 'discipline';
  }

  return { activity_id: 'custom', lenses: lenses, axes: axes, type: type, confidence: 0.3 };
}

/* ═══════════════════════════════════════════
   IX. CHECKIN UI
   ═══════════════════════════════════════════ */

/**
 * Render daily checkin modal.
 * @param {HTMLElement} container — where to render
 * @returns {boolean} true if checkin was shown
 */
function renderCheckin(container){
  if(!needsCheckin()) return false;
  var s = S();
  if(!s) return false;
  ensureIntentionState();

  var disciplines = s.intentions.disciplines.filter(function(d){ return d.active; });
  if(disciplines.length === 0) return false;

  var html = '<div class="passive-checkin-overlay" id="passiveCheckinOverlay">';
  html += '<div class="passive-checkin-card">';
  html += '<h3 style="color:#E0C060;margin:0 0 12px 0">☉ Проверка дня</h3>';
  html += '<p style="color:#aaa;font-size:13px;margin:0 0 16px 0">Подтверди свои дисциплины за вчера</p>';

  disciplines.forEach(function(d, realIdx){
    /* Find real index in the original array */
    var origIdx = s.intentions.disciplines.indexOf(d);
    var sm = streakMultiplier(d.streak || 0);
    html += '<div class="passive-checkin-item" data-idx="' + origIdx + '">';
    html += '<div style="flex:1">';
    html += '<div style="color:#fff;font-size:14px">' + _esc(d.text) + '</div>';
    html += '<div style="color:#888;font-size:11px">🔥 ' + (d.streak||0) + ' дн. • ' + sm.label + ' (×' + sm.mult + ')</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px">';
    html += '<button class="passive-btn passive-btn-yes" data-idx="' + origIdx + '">✅ Да</button>';
    html += '<button class="passive-btn passive-btn-no" data-idx="' + origIdx + '">❌ Нет</button>';
    html += '</div>';
    html += '</div>';
  });

  html += '<div style="margin-top:16px;text-align:center">';
  html += '<button class="passive-btn passive-btn-skip" id="passiveCheckinSkip">Позже</button>';
  html += '<button class="passive-btn passive-btn-submit" id="passiveCheckinSubmit" style="margin-left:8px">Подтвердить</button>';
  html += '</div>';
  html += '</div></div>';

  /* Styles */
  html += '<style>';
  html += '.passive-checkin-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center}';
  html += '.passive-checkin-card{background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:24px;max-width:400px;width:90%}';
  html += '.passive-checkin-item{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #222}';
  html += '.passive-btn{padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;transition:all .2s}';
  html += '.passive-btn-yes{background:#2a4a2a;color:#6f6}';
  html += '.passive-btn-yes.active{background:#3a7a3a;box-shadow:0 0 8px #6f6}';
  html += '.passive-btn-no{background:#4a2a2a;color:#f66}';
  html += '.passive-btn-no.active{background:#7a3a3a;box-shadow:0 0 8px #f66}';
  html += '.passive-btn-skip{background:#333;color:#aaa}';
  html += '.passive-btn-submit{background:#3a3a6a;color:#aaf}';
  html += '</style>';

  container.innerHTML = html;

  /* Event handling */
  var choices = {};
  container.querySelectorAll('.passive-btn-yes,.passive-btn-no').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(this.dataset.idx);
      var isYes = this.classList.contains('passive-btn-yes');
      choices[idx] = isYes;

      /* Visual feedback */
      var row = this.closest('.passive-checkin-item');
      row.querySelectorAll('.passive-btn').forEach(function(b){ b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  var submitBtn = container.querySelector('#passiveCheckinSubmit');
  if(submitBtn){
    submitBtn.addEventListener('click', function(){
      var results = [];
      for(var idx in choices){
        results.push({ index: parseInt(idx), confirmed: choices[idx] });
      }
      processCheckin(results);
      container.innerHTML = '';
    });
  }

  var skipBtn = container.querySelector('#passiveCheckinSkip');
  if(skipBtn){
    skipBtn.addEventListener('click', function(){
      container.innerHTML = '';
    });
  }

  return true;
}

/* ═══════════════════════════════════════════
   X. HELPERS
   ═══════════════════════════════════════════ */

function _save(){
  try { localStorage.setItem('STATE', JSON.stringify(S())); } catch(e){}
}

function _esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _fireEvent(name, detail){
  try { window.dispatchEvent(new CustomEvent('awara-' + name, { detail: detail || {} })); } catch(e){}
}

/* ═══════════════════════════════════════════
   XI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraPassiveFlow = {
  __v: 1,
  getIntentions: getIntentions,
  addPractice: addPractice,
  addDiscipline: addDiscipline,
  removePractice: removePractice,
  removeDiscipline: removeDiscipline,
  classifyIntention: classifyIntention,
  needsCheckin: needsCheckin,
  processCheckin: processCheckin,
  renderCheckin: renderCheckin,
  overnightPassive: overnightPassive,
  streakMultiplier: streakMultiplier,
  STREAK_MULT: STREAK_MULT
};

console.log('[AwaraPassiveFlow] Passive Flow & Checkin v1 ready');
})();
