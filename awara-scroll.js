/* ============================================================
   AWARA · SCROLL v1 — Свиток (Прошлое / Настоящее / Будущее)
   Хроника пути: журнал квестов, текущее состояние, проекции.
   Загружать ПОСЛЕ: awara-experience-engine.js, awara-sensitivity.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraScroll && window.__awaraScroll >= 1) return;
window.__awaraScroll = 1;

/* ═══════════════════════════════════════════
   I. JOURNAL — PAST
   ═══════════════════════════════════════════ */

var JOURNAL_KEY = 'awara_scroll_journal';

function getJournal(){
  try {
    var raw = localStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}

function saveJournal(entries){
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries)); } catch(e){}
}

/**
 * Record a quest completion in the journal.
 * @param {object} data — { quest, response_text, evaluation, particles, light, tier, timestamp }
 */
function recordEntry(data){
  var entries = getJournal();
  entries.push({
    ts: data.timestamp || Date.now(),
    date: new Date().toISOString().slice(0, 10),
    quest_title: data.quest ? (data.quest.title || data.quest.id || '?') : '?',
    quest_type: data.quest ? data.quest.type : 'do',
    lens: data.lens || 'vedic',
    depth: data.depth || 1,
    response_preview: (data.response_text || '').slice(0, 200),
    particles: data.particles || 0,
    light: data.light || 0,
    element: data.evaluation ? data.evaluation.element : 'earth',
    guna: data.evaluation ? data.evaluation.guna : 'rajas',
    quality: data.evaluation ? data.evaluation.quality_score : 0,
    ether_state: data.ether_state || 'sleeping',
    tier: data.tier || 'common',
    ring: data.ring || -3
  });

  /* Keep last 500 entries */
  if(entries.length > 500) entries = entries.slice(entries.length - 500);
  saveJournal(entries);
}

/* ═══════════════════════════════════════════
   II. PRESENT — Current State Summary
   ═══════════════════════════════════════════ */

function getCurrentState(){
  var s;
  try { s = window.STATE; } catch(e){ return null; }
  if(!s) return null;

  var ring = (s.progress ? s.progress.current_ring : -3) || -3;
  var RING_NAMES = {
    '-3':'Даймон (тень)','-2':'Даймон (пробуждение)','-1':'Даймон (становление)',
    '0':'Порог','1':'Душа I','2':'Душа II','3':'Душа III',
    '4':'Джива I','5':'Джива II','6':'Джива III',
    '7':'Дух I','8':'Дух II','9':'Дух III'
  };

  var activeLenses = [];
  if(s.lenses){
    for(var k in s.lenses){
      if(s.lenses[k].quests_done > 0 || s.lenses[k].state === 'active'){
        activeLenses.push({ slug: k, level: s.lenses[k].level || 1, quests: s.lenses[k].quests_done || 0 });
      }
    }
  }

  var dominantAxis = 'discipline';
  var maxAxis = 0;
  if(s.axes){
    for(var ax in s.axes){
      if(s.axes[ax] > maxAxis){ maxAxis = s.axes[ax]; dominantAxis = ax; }
    }
  }

  var dominantElement = 'earth';
  var maxEl = 0;
  if(s.elements){
    for(var el in s.elements){
      if(s.elements[el] > maxEl){ maxEl = s.elements[el]; dominantElement = el; }
    }
  }

  return {
    ring: ring,
    ring_name: RING_NAMES[String(ring)] || 'Ring ' + ring,
    total_light: s.progress ? (s.progress.total_light || 0) : 0,
    days_played: s.progress ? (s.progress.days_played || 0) : 0,
    quests_completed: s.progress ? (s.progress.quests_completed || 0) : 0,
    active_lenses: activeLenses,
    lens_count: activeLenses.length,
    dominant_axis: dominantAxis,
    dominant_element: dominantElement,
    sensitivity: s.sensitivity || 0,
    ether_state: s.ether_state || 'sleeping',
    particles_today: s.particles_today || 0,
    structures_built: s.structures_built || [],
    daimon_name: s.daimon ? s.daimon.name : 'Даймон',
    streak: s.streak || 0
  };
}

/* ═══════════════════════════════════════════
   III. FUTURE — Projections & Goals
   ═══════════════════════════════════════════ */

function getProjections(){
  var state = getCurrentState();
  if(!state) return {};

  var journal = getJournal();
  var last7 = journal.filter(function(e){ return e.ts > Date.now() - 7 * 86400000; });
  var last30 = journal.filter(function(e){ return e.ts > Date.now() - 30 * 86400000; });

  /* Average daily stats */
  var daysActive = new Set(last30.map(function(e){ return e.date; })).size || 1;
  var avgQuestsPerDay = last30.length / daysActive;
  var avgLightPerDay = last30.reduce(function(s,e){ return s + (e.light || 0); }, 0) / daysActive;
  var avgQuality = last30.length > 0
    ? last30.reduce(function(s,e){ return s + (e.quality || 0); }, 0) / last30.length
    : 0;

  /* Ring thresholds from engine */
  var RING_THRESHOLDS = {
    '-3':0,'-2':5,'-1':15,'0':30,'1':50,'2':100,'3':200,
    '4':400,'5':700,'6':1200,'7':2000,'8':3500,'9':6000
  };

  var nextRing = state.ring + 1;
  var nextThreshold = RING_THRESHOLDS[String(nextRing)] || 99999;
  var lightNeeded = Math.max(0, nextThreshold - state.total_light);
  var daysToNextRing = avgLightPerDay > 0 ? Math.ceil(lightNeeded / avgLightPerDay) : '∞';

  return {
    avg_quests_per_day: Math.round(avgQuestsPerDay * 10) / 10,
    avg_light_per_day: Math.round(avgLightPerDay * 100) / 100,
    avg_quality: Math.round(avgQuality * 100) / 100,
    days_active_last30: daysActive,
    next_ring: nextRing > 9 ? null : nextRing,
    light_to_next_ring: Math.round(lightNeeded * 100) / 100,
    est_days_to_next_ring: daysToNextRing,
    trend: last7.length >= last30.length / 4 ? 'growing' : (last7.length > 0 ? 'stable' : 'declining'),
    quality_trend: avgQuality > 0.6 ? 'high' : avgQuality > 0.3 ? 'medium' : 'developing'
  };
}

/* ═══════════════════════════════════════════
   IV. RENDER SCROLL UI
   ═══════════════════════════════════════════ */

var AXIS_ICON = { discipline:'🗡', compassion:'💧', clarity:'👁', will:'🔥', devotion:'🙏', transformation:'♻️', unity:'🌀' };
var ELEM_ICON = { earth:'🜃', water:'🜄', fire:'🜂', air:'🜁', ether:'✦' };
var ETHER_ICON = { sleeping:'🌑', awakening:'🌗', awakened:'☀' };
var GUNA_ICON = { tamas:'●', rajas:'◐', sattva:'○' };

function renderScroll(container, tab){
  tab = tab || 'present';

  var html = '<div class="scroll-container">';

  /* Tab switcher */
  html += '<div class="scroll-tabs">';
  html += '<button class="scroll-tab' + (tab==='past'?' active':'') + '" data-tab="past">📜 Прошлое</button>';
  html += '<button class="scroll-tab' + (tab==='present'?' active':'') + '" data-tab="present">⚡ Настоящее</button>';
  html += '<button class="scroll-tab' + (tab==='future'?' active':'') + '" data-tab="future">🔮 Будущее</button>';
  html += '</div>';

  html += '<div class="scroll-content">';

  if(tab === 'past'){
    html += _renderPast();
  } else if(tab === 'present'){
    html += _renderPresent();
  } else {
    html += _renderFuture();
  }

  html += '</div></div>';

  /* Styles */
  html += '<style>';
  html += '.scroll-container{padding:0}';
  html += '.scroll-tabs{display:flex;gap:4px;margin-bottom:16px}';
  html += '.scroll-tab{flex:1;background:#1a1a2e;color:#888;border:1px solid #333;border-radius:10px;padding:10px;cursor:pointer;font-size:13px;transition:all .2s}';
  html += '.scroll-tab.active{color:#E0C060;border-color:#E0C060;background:#2a2a3e}';
  html += '.scroll-content{min-height:200px}';
  html += '.scroll-entry{background:rgba(255,255,255,0.02);border:1px solid #222;border-radius:10px;padding:12px;margin-bottom:8px}';
  html += '.scroll-entry-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}';
  html += '.scroll-entry-title{color:#fff;font-size:13px}';
  html += '.scroll-entry-meta{color:#666;font-size:11px}';
  html += '.scroll-entry-preview{color:#888;font-size:12px;margin-top:4px;font-style:italic}';
  html += '.scroll-stat{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a2e}';
  html += '.scroll-stat-label{color:#888;font-size:13px}';
  html += '.scroll-stat-value{color:#fff;font-size:13px;font-weight:600}';
  html += '.scroll-projection{background:rgba(224,192,96,0.05);border:1px solid #333;border-radius:10px;padding:14px;margin-bottom:10px}';
  html += '.scroll-projection-title{color:#E0C060;font-size:14px;margin-bottom:6px}';
  html += '.scroll-projection-text{color:#aaa;font-size:13px}';
  html += '</style>';

  container.innerHTML = html;

  /* Tab switching */
  container.querySelectorAll('.scroll-tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      renderScroll(container, this.dataset.tab);
    });
  });
}

function _renderPast(){
  var entries = getJournal().reverse().slice(0, 50);
  if(entries.length === 0) return '<div style="color:#666;text-align:center;padding:40px">Пока нет записей. Заверши свой первый квест.</div>';

  var html = '';
  entries.forEach(function(e){
    html += '<div class="scroll-entry">';
    html += '<div class="scroll-entry-header">';
    html += '<span class="scroll-entry-title">' + _esc(e.quest_title) + '</span>';
    html += '<span class="scroll-entry-meta">' + e.date + '</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:#888">';
    html += '<span>' + (ELEM_ICON[e.element]||'') + ' ' + (e.element||'') + '</span>';
    html += '<span>' + (GUNA_ICON[e.guna]||'') + ' ' + (e.guna||'') + '</span>';
    html += '<span>✧' + (e.particles||0) + '</span>';
    html += '<span>☀' + (e.light||0) + '</span>';
    html += '<span>' + (ETHER_ICON[e.ether_state]||'') + '</span>';
    html += '</div>';
    if(e.response_preview){
      html += '<div class="scroll-entry-preview">"' + _esc(e.response_preview.slice(0,120)) + (e.response_preview.length > 120 ? '...' : '') + '"</div>';
    }
    html += '</div>';
  });
  return html;
}

function _renderPresent(){
  var state = getCurrentState();
  if(!state) return '<div style="color:#666;text-align:center;padding:40px">Загрузка...</div>';

  var html = '';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">🌀 Кольцо</span><span class="scroll-stat-value">' + state.ring_name + ' (' + state.ring + ')</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">☀ Свет</span><span class="scroll-stat-value">' + Math.round(state.total_light * 100) / 100 + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">✧ Частицы сегодня</span><span class="scroll-stat-value">' + Math.round(state.particles_today * 100) / 100 + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">' + (ETHER_ICON[state.ether_state]||'') + ' Эфир</span><span class="scroll-stat-value">' + (state.ether_state === 'sleeping' ? 'Спящий' : state.ether_state === 'awakening' ? 'Пробуждающийся' : 'Пробуждённый') + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">📅 Дней</span><span class="scroll-stat-value">' + state.days_played + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">⚔ Квестов</span><span class="scroll-stat-value">' + state.quests_completed + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">' + (AXIS_ICON[state.dominant_axis]||'') + ' Ось</span><span class="scroll-stat-value">' + state.dominant_axis + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">' + (ELEM_ICON[state.dominant_element]||'') + ' Стихия</span><span class="scroll-stat-value">' + state.dominant_element + '</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">🔮 Линзы</span><span class="scroll-stat-value">' + state.lens_count + ' активных</span></div>';
  html += '<div class="scroll-stat"><span class="scroll-stat-label">💎 Чувствительность</span><span class="scroll-stat-value">' + Math.round(state.sensitivity * 10) / 10 + '</span></div>';

  if(state.structures_built.length > 0){
    html += '<div class="scroll-stat"><span class="scroll-stat-label">🏛 Структуры</span><span class="scroll-stat-value">' + state.structures_built.length + ' построено</span></div>';
  }

  return html;
}

function _renderFuture(){
  var proj = getProjections();
  var html = '';

  html += '<div class="scroll-projection">';
  html += '<div class="scroll-projection-title">📊 Статистика за 30 дней</div>';
  html += '<div class="scroll-projection-text">';
  html += 'Квестов/день: ' + proj.avg_quests_per_day + '<br>';
  html += 'Света/день: ' + proj.avg_light_per_day + ' ☀<br>';
  html += 'Качество: ' + Math.round(proj.avg_quality * 100) + '%<br>';
  html += 'Активных дней: ' + proj.days_active_last30;
  html += '</div></div>';

  if(proj.next_ring !== null){
    html += '<div class="scroll-projection">';
    html += '<div class="scroll-projection-title">🎯 До следующего кольца</div>';
    html += '<div class="scroll-projection-text">';
    html += 'Нужно: ' + proj.light_to_next_ring + ' ☀<br>';
    html += 'Ориентировочно: ~' + proj.est_days_to_next_ring + ' дней';
    html += '</div></div>';
  }

  html += '<div class="scroll-projection">';
  html += '<div class="scroll-projection-title">📈 Тренд</div>';
  html += '<div class="scroll-projection-text">';
  var trendIcon = proj.trend === 'growing' ? '↗️' : proj.trend === 'stable' ? '➡️' : '↘️';
  var trendText = proj.trend === 'growing' ? 'Активность растёт' : proj.trend === 'stable' ? 'Стабильная практика' : 'Активность снижается';
  html += trendIcon + ' ' + trendText + '<br>';
  var qualText = proj.quality_trend === 'high' ? '🌟 Высокое качество ответов' : proj.quality_trend === 'medium' ? '⭐ Среднее качество' : '📝 Качество развивается';
  html += qualText;
  html += '</div></div>';

  return html;
}

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ═══════════════════════════════════════════
   V. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraScroll = {
  __v: 1,
  recordEntry: recordEntry,
  getJournal: getJournal,
  getCurrentState: getCurrentState,
  getProjections: getProjections,
  renderScroll: renderScroll
};

console.log('[AwaraScroll] Scroll (Past/Present/Future) v1 ready');
})();
