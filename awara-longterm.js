/* ============================================================
   AWARA · LONGTERM PLANNING v1 — Панорама 33 линз
   Экран долгосрочного планирования: все линзы + практики + цели
   Загружать ПОСЛЕ: awara-passive-flow.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraLongterm && window.__awaraLongterm >= 1) return;
window.__awaraLongterm = 1;

/* ═══════════════════════════════════════════
   I. ALL 33 LENSES
   ═══════════════════════════════════════════ */

var ALL_LENSES = [
  { slug:'vedic',                   name:'Ведическая',          icon:'🕉' },
  { slug:'tarot_arcanic',           name:'Таро / Арканы',       icon:'🃏' },
  { slug:'kabbalistic',             name:'Каббалистическая',    icon:'✡' },
  { slug:'hermetic_alchemical',     name:'Герметическая',       icon:'⚗' },
  { slug:'slavic',                  name:'Славянская',          icon:'☀' },
  { slug:'gnostic',                 name:'Гностическая',        icon:'🔥' },
  { slug:'daoist',                  name:'Даосская',            icon:'☯' },
  { slug:'chinese_iching',          name:'И-Цзин',             icon:'☰' },
  { slug:'egyptian',                name:'Египетская',          icon:'𓂀' },
  { slug:'mayan',                   name:'Майянская',           icon:'🌀' },
  { slug:'aztec_mexica',            name:'Ацтекская',           icon:'🦅' },
  { slug:'celtic',                  name:'Кельтская',           icon:'🍀' },
  { slug:'norse',                   name:'Скандинавская',       icon:'⚡' },
  { slug:'shamanic',                name:'Шаманская',           icon:'🥁' },
  { slug:'buddhist_mahayana',       name:'Буддийская',          icon:'🪷' },
  { slug:'islamic_sufi_nur',        name:'Суфийская',           icon:'☪' },
  { slug:'christian_mystical_grail',name:'Христианская',        icon:'⛪' },
  { slug:'atlantean_lemurian',      name:'Атлантическая',       icon:'🌊' },
  { slug:'shambhala',               name:'Шамбала',             icon:'🏔' },
  { slug:'gene_keys',               name:'Генные ключи',       icon:'🧬' },
  { slug:'astrological',            name:'Астрологическая',     icon:'♈' },
  { slug:'cosmic_galactic',         name:'Космическая',         icon:'🌌' },
  { slug:'shinto',                  name:'Синтоистская',        icon:'⛩' },
  { slug:'sumerian_babylonian',     name:'Шумерская',           icon:'𒀭' },
  { slug:'zoroastrian',             name:'Зороастрийская',      icon:'🔥' },
  { slug:'afro_dogon',              name:'Догонская',           icon:'🌍' },
  { slug:'yoruba_ifa_orisha',       name:'Йоруба / Ифа',       icon:'🎭' },
  { slug:'tantric_kashmiri',        name:'Тантрическая',        icon:'🐍' },
  { slug:'posthuman_ai_sophianic',  name:'Постгуманистическая', icon:'🤖' },
  { slug:'technomagical',           name:'Техномагическая',     icon:'⚙' },
  { slug:'advaita_siddha',          name:'Адвайта / Сиддха',   icon:'🧘' },
  { slug:'julian_byzantine',        name:'Юлианская',           icon:'🏛' },
  { slug:'antique_greco_roman',     name:'Античная',            icon:'🏺' }
];

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }
function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function r(n){ return Math.round(n * 100) / 100; }

function getLensState(slug){
  var s = S();
  if(!s || !s.lenses || !s.lenses[slug]){
    return { state: 'sleeping', level: 0, quests_done: 0, passive_light: 0 };
  }
  var l = s.lenses[slug];
  return {
    state: l.state || (l.quests_done > 0 ? 'active' : 'sleeping'),
    level: l.level || (l.quests_done > 0 ? 1 : 0),
    quests_done: l.quests_done || 0,
    passive_light: l.passive_light || 0,
    quality_avg: l.quality_avg || 0,
    sources: l.sources || []
  };
}

/* ═══════════════════════════════════════════
   III. RENDER PANORAMA
   ═══════════════════════════════════════════ */

function renderPanorama(container){
  var s = S();
  var html = '<div class="longterm-container">';
  html += '<h3 style="color:#E0C060;margin:0 0 8px 0">🌐 Долгосрочное планирование</h3>';
  html += '<p style="color:#888;font-size:12px;margin:0 0 16px 0">Твой путь через 33 линзы</p>';

  /* Stats */
  var active = 0, filling = 0, sleeping = 0;
  ALL_LENSES.forEach(function(lens){
    var st = getLensState(lens.slug);
    if(st.state === 'active') active++;
    else if(st.state === 'filling') filling++;
    else sleeping++;
  });

  html += '<div class="longterm-stats">';
  html += '<span class="longterm-stat">🟢 ' + active + ' активных</span>';
  html += '<span class="longterm-stat">🟡 ' + filling + ' наливаются</span>';
  html += '<span class="longterm-stat">⚫ ' + sleeping + ' спят</span>';
  html += '</div>';

  /* Grid of 33 lenses */
  html += '<div class="longterm-grid">';
  ALL_LENSES.forEach(function(lens){
    var st = getLensState(lens.slug);
    var cssClass = 'longterm-lens ' + st.state;
    var fillPct = st.state === 'filling' ? Math.min(100, Math.round((st.passive_light / 5) * 100)) : (st.state === 'active' ? 100 : 0);

    html += '<div class="' + cssClass + '" data-slug="' + lens.slug + '" title="' + _esc(lens.name) + '">';
    html += '<div class="longterm-lens-bg" style="height:' + fillPct + '%"></div>';
    html += '<span class="longterm-lens-icon">' + lens.icon + '</span>';
    if(st.level > 0){
      html += '<span class="longterm-lens-level">L' + st.level + '</span>';
    }
    html += '</div>';
  });
  html += '</div>';

  /* Practices & Disciplines section */
  html += '<div class="longterm-section">';
  html += '<h4 style="color:#aaa;margin:16px 0 8px 0">🌿 Практики и дисциплины</h4>';

  if(window.AwaraPassiveFlow){
    var intentions = window.AwaraPassiveFlow.getIntentions();

    if(intentions.practices.length > 0){
      html += '<div style="margin-bottom:8px;color:#888;font-size:12px">Практики:</div>';
      intentions.practices.forEach(function(p, i){
        html += '<div class="longterm-intention">';
        html += '<span class="longterm-intention-text">🌿 ' + _esc(p.text) + '</span>';
        html += '<span class="longterm-intention-lenses">' + (p.lenses||[]).join(', ') + '</span>';
        html += '<button class="longterm-remove-btn" data-type="practice" data-idx="' + i + '">✕</button>';
        html += '</div>';
      });
    }

    if(intentions.disciplines.length > 0){
      html += '<div style="margin-bottom:8px;color:#888;font-size:12px;margin-top:12px">Дисциплины:</div>';
      intentions.disciplines.forEach(function(d, i){
        var sm = window.AwaraPassiveFlow.streakMultiplier(d.streak || 0);
        html += '<div class="longterm-intention' + (!d.active ? ' inactive' : '') + '">';
        html += '<span class="longterm-intention-text">⚡ ' + _esc(d.text) + '</span>';
        html += '<span class="longterm-intention-streak">🔥' + (d.streak||0) + ' (' + sm.label + ')</span>';
        html += '<button class="longterm-remove-btn" data-type="discipline" data-idx="' + i + '">✕</button>';
        html += '</div>';
      });
    }
  }

  html += '<button class="longterm-add-btn" id="longtermAddIntention">+ Добавить практику или дисциплину</button>';
  html += '</div>';

  html += '</div>';

  /* Styles */
  html += '<style>';
  html += '.longterm-container{padding:16px}';
  html += '.longterm-stats{display:flex;gap:12px;margin-bottom:16px}';
  html += '.longterm-stat{color:#888;font-size:12px}';
  html += '.longterm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px;margin-bottom:16px}';
  html += '.longterm-lens{position:relative;width:54px;height:54px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:all .3s;border:1px solid transparent}';
  html += '.longterm-lens.sleeping{background:#1a1a1a;opacity:0.4;border-color:#222}';
  html += '.longterm-lens.filling{background:#1a1a2e;opacity:0.7;border-color:#444}';
  html += '.longterm-lens.active{background:#2a2a3e;opacity:1;border-color:#E0C060}';
  html += '.longterm-lens-bg{position:absolute;bottom:0;left:0;right:0;background:rgba(224,192,96,0.1);transition:height .5s}';
  html += '.longterm-lens-icon{font-size:20px;position:relative;z-index:1}';
  html += '.longterm-lens-level{font-size:9px;color:#E0C060;position:relative;z-index:1}';
  html += '.longterm-lens:hover{transform:scale(1.1);border-color:#E0C060}';
  html += '.longterm-intention{display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px}';
  html += '.longterm-intention.inactive{opacity:0.4}';
  html += '.longterm-intention-text{color:#ccc;font-size:13px;flex:1}';
  html += '.longterm-intention-lenses{color:#888;font-size:11px}';
  html += '.longterm-intention-streak{color:#E07020;font-size:11px;white-space:nowrap}';
  html += '.longterm-remove-btn{background:none;border:none;color:#666;cursor:pointer;font-size:14px;padding:2px 6px}';
  html += '.longterm-remove-btn:hover{color:#f66}';
  html += '.longterm-add-btn{width:100%;padding:10px;background:#1a1a2e;border:1px dashed #444;border-radius:10px;color:#888;cursor:pointer;font-size:13px;margin-top:8px}';
  html += '.longterm-add-btn:hover{border-color:#E0C060;color:#E0C060}';
  html += '</style>';

  container.innerHTML = html;

  /* Event handlers */

  /* Lens click → detail */
  container.querySelectorAll('.longterm-lens').forEach(function(el){
    el.addEventListener('click', function(){
      var slug = this.dataset.slug;
      _showLensDetail(container, slug);
    });
  });

  /* Remove buttons */
  container.querySelectorAll('.longterm-remove-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var type = this.dataset.type;
      var idx = parseInt(this.dataset.idx);
      if(window.AwaraPassiveFlow){
        if(type === 'practice') window.AwaraPassiveFlow.removePractice(idx);
        else window.AwaraPassiveFlow.removeDiscipline(idx);
      }
      renderPanorama(container);
    });
  });

  /* Add button */
  var addBtn = container.querySelector('#longtermAddIntention');
  if(addBtn){
    addBtn.addEventListener('click', function(){
      _showAddIntention(container);
    });
  }
}

/* ═══════════════════════════════════════════
   IV. LENS DETAIL POPUP
   ═══════════════════════════════════════════ */

function _showLensDetail(container, slug){
  var lens = ALL_LENSES.find(function(l){ return l.slug === slug; });
  if(!lens) return;
  var st = getLensState(slug);

  var overlay = document.createElement('div');
  overlay.className = 'longterm-detail-overlay';
  overlay.innerHTML = '<div class="longterm-detail-card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<span style="font-size:24px">' + lens.icon + '</span>' +
    '<button class="longterm-detail-close">✕</button>' +
    '</div>' +
    '<h3 style="color:#fff;margin:8px 0 4px 0">' + _esc(lens.name) + '</h3>' +
    '<div style="color:#888;font-size:12px;margin-bottom:12px">' + slug + '</div>' +
    '<div class="scroll-stat"><span class="scroll-stat-label">Состояние</span><span class="scroll-stat-value">' +
      (st.state === 'active' ? '🟢 Активна' : st.state === 'filling' ? '🟡 Наливается' : '⚫ Спит') + '</span></div>' +
    '<div class="scroll-stat"><span class="scroll-stat-label">Уровень</span><span class="scroll-stat-value">L' + st.level + '</span></div>' +
    '<div class="scroll-stat"><span class="scroll-stat-label">Квесты</span><span class="scroll-stat-value">' + st.quests_done + '</span></div>' +
    '<div class="scroll-stat"><span class="scroll-stat-label">Пассивный свет</span><span class="scroll-stat-value">' + r(st.passive_light) + ' ☀</span></div>' +
    (st.state === 'sleeping' ?
      '<button class="longterm-goal-btn" data-slug="' + slug + '">🎯 Хочу открыть эту линзу</button>' : '') +
    '</div>';

  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center';
  overlay.querySelector('.longterm-detail-card').style.cssText = 'background:#1a1a2e;border:1px solid #444;border-radius:16px;padding:20px;max-width:320px;width:90%';

  var closeBtn = overlay.querySelector('.longterm-detail-close');
  closeBtn.style.cssText = 'background:none;border:none;color:#888;font-size:18px;cursor:pointer';
  closeBtn.addEventListener('click', function(){ overlay.remove(); });
  overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.remove(); });

  var goalBtn = overlay.querySelector('.longterm-goal-btn');
  if(goalBtn){
    goalBtn.style.cssText = 'width:100%;padding:10px;background:#2a2a4a;border:1px solid #555;border-radius:10px;color:#E0C060;cursor:pointer;font-size:13px;margin-top:12px';
    goalBtn.addEventListener('click', function(){
      alert('Совет: добавь практику, связанную с ' + lens.name + ', чтобы линза начала наполняться пассивным светом.');
      overlay.remove();
    });
  }

  document.body.appendChild(overlay);
}

/* ═══════════════════════════════════════════
   V. ADD INTENTION DIALOG
   ═══════════════════════════════════════════ */

function _showAddIntention(container){
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = '<div style="background:#1a1a2e;border:1px solid #444;border-radius:16px;padding:20px;max-width:360px;width:90%">' +
    '<h3 style="color:#E0C060;margin:0 0 12px 0">Добавить намерение</h3>' +
    '<input type="text" id="ltIntentionText" placeholder="Опиши практику или дисциплину..." style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;margin-bottom:12px">' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
    '<button class="lt-type-btn active" data-type="practice" style="flex:1;padding:8px;background:#2a4a2a;border:1px solid #4a6a4a;border-radius:8px;color:#6f6;cursor:pointer">🌿 Практика</button>' +
    '<button class="lt-type-btn" data-type="discipline" style="flex:1;padding:8px;background:#2a2a4a;border:1px solid #444;border-radius:8px;color:#aaf;cursor:pointer">⚡ Дисциплина</button>' +
    '</div>' +
    '<div id="ltClassifyResult" style="color:#888;font-size:12px;margin-bottom:12px;min-height:20px"></div>' +
    '<div style="display:flex;gap:8px">' +
    '<button id="ltCancel" style="flex:1;padding:10px;background:#333;border:none;border-radius:8px;color:#aaa;cursor:pointer">Отмена</button>' +
    '<button id="ltSubmit" style="flex:1;padding:10px;background:#3a3a6a;border:none;border-radius:8px;color:#aaf;cursor:pointer">Добавить</button>' +
    '</div>' +
    '</div>';

  var selectedType = 'practice';
  var classified = null;

  overlay.querySelectorAll('.lt-type-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      overlay.querySelectorAll('.lt-type-btn').forEach(function(b){ b.classList.remove('active'); b.style.borderColor = '#444'; });
      this.classList.add('active');
      this.style.borderColor = selectedType === 'practice' ? '#4a6a4a' : '#6a6aaa';
      selectedType = this.dataset.type;
    });
  });

  var input = overlay.querySelector('#ltIntentionText');
  var resultDiv = overlay.querySelector('#ltClassifyResult');
  var classifyTimer = null;

  input.addEventListener('input', function(){
    clearTimeout(classifyTimer);
    classifyTimer = setTimeout(async function(){
      var text = input.value.trim();
      if(text.length < 3) return;
      resultDiv.textContent = 'Классифицирую...';
      if(window.AwaraPassiveFlow){
        classified = await window.AwaraPassiveFlow.classifyIntention(text);
        resultDiv.textContent = '→ Линзы: ' + (classified.lenses||[]).join(', ') + ' | Оси: ' + (classified.axes||[]).join(', ');
      }
    }, 500);
  });

  overlay.querySelector('#ltCancel').addEventListener('click', function(){ overlay.remove(); });

  overlay.querySelector('#ltSubmit').addEventListener('click', function(){
    var text = input.value.trim();
    if(!text) return;
    var lenses = classified ? classified.lenses : ['vedic'];
    var axes = classified ? classified.axes : ['discipline'];
    if(window.AwaraPassiveFlow){
      if(selectedType === 'practice'){
        window.AwaraPassiveFlow.addPractice(text, classified ? classified.activity_id : 'custom', lenses, axes);
      } else {
        window.AwaraPassiveFlow.addDiscipline(text, classified ? classified.activity_id : 'custom', lenses, axes, 'daily');
      }
    }
    overlay.remove();
    renderPanorama(container);
  });

  overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  input.focus();
}

/* ═══════════════════════════════════════════
   VI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraLongterm = {
  __v: 1,
  ALL_LENSES: ALL_LENSES,
  getLensState: getLensState,
  renderPanorama: renderPanorama
};

console.log('[AwaraLongterm] Longterm Planning v1 ready');
})();
