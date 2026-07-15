/* ============================================================
   AWARA · INTEGRATION v2
   Встраивает новые системы в экран «Хроника» (бывш. Год)
   Загружать ПОСЛЕДНИМ после awara-engine-patch.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraIntegration && window.__awaraIntegration >= 2) return;
window.__awaraIntegration = 2;

function onReady(fn){
  if(document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

onReady(function(){

  /* ═══════════════════════════════════════════
     I. RENAME «Год» → «Хроника» in nav
     ═══════════════════════════════════════════ */

  var nav = document.querySelector('.nav');
  if(nav){
    var chronBtn = nav.querySelector('[data-nav="chron"]');
    if(chronBtn){
      chronBtn.innerHTML = '<span class="ic">📖</span>Хроника';
    }
  }

  /* ═══════════════════════════════════════════
     II. INJECT 3 SECTIONS INTO s-chron
     ═══════════════════════════════════════════ */

  var chronScreen = document.getElementById('s-chron');
  if(!chronScreen) return;

  /* Update header */
  var eyebrow = chronScreen.querySelector('.eyebrow');
  if(eyebrow) eyebrow.textContent = 'Хроника · всё в одном';
  var h1 = chronScreen.querySelector('h1');
  if(h1) h1.textContent = 'Хроника';

  /* --- Section: Свиток --- */
  var scrollSec = document.createElement('div');
  scrollSec.id = 'chronicle-scroll';
  scrollSec.style.cssText = 'margin-top:28px;border-top:1px solid rgba(255,255,255,.08);padding-top:18px';
  scrollSec.innerHTML = '<h2 style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="this.parentNode.querySelector(\'.ch-body\').style.display=this.parentNode.querySelector(\'.ch-body\').style.display===\'none\'?\'block\':\'none\'">📜 Свиток <span style="font-size:12px;color:var(--muted)">▼</span></h2>' +
    '<p class="sub">Прошлое, настоящее, будущее — хроника пути</p>' +
    '<div class="ch-body" id="scrollContainer" style="margin-top:8px"></div>';

  /* --- Section: Световые структуры --- */
  var structSec = document.createElement('div');
  structSec.id = 'chronicle-struct';
  structSec.style.cssText = 'margin-top:28px;border-top:1px solid rgba(255,255,255,.08);padding-top:18px';
  structSec.innerHTML = '<h2 style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="this.parentNode.querySelector(\'.ch-body\').style.display=this.parentNode.querySelector(\'.ch-body\').style.display===\'none\'?\'block\':\'none\'">🏛 Световые структуры <span style="font-size:12px;color:var(--muted)">▼</span></h2>' +
    '<p class="sub">Строй из света — противостой тьме</p>' +
    '<div class="ch-body" id="structContainer" style="margin-top:8px"></div>';

  /* --- Section: Энергокарта --- */
  var emapSec = document.createElement('div');
  emapSec.id = 'chronicle-emap';
  emapSec.style.cssText = 'margin-top:28px;border-top:1px solid rgba(255,255,255,.08);padding-top:18px';
  emapSec.innerHTML = '<h2 style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="this.parentNode.querySelector(\'.ch-body\').style.display=this.parentNode.querySelector(\'.ch-body\').style.display===\'none\'?\'block\':\'none\'">🗺️ Энергокарта на завтра <span style="font-size:12px;color:var(--muted)">▼</span></h2>' +
    '<p class="sub">Элемент, гуна, агент, накшатра — прогноз дня</p>' +
    '<div class="ch-body" id="emapContainer" style="margin-top:8px"></div>';

  /* --- Section: 33 линзы --- */
  var ltSec = document.createElement('div');
  ltSec.id = 'chronicle-longterm';
  ltSec.style.cssText = 'margin-top:28px;border-top:1px solid rgba(255,255,255,.08);padding-top:18px';
  ltSec.innerHTML = '<h2 style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="this.parentNode.querySelector(\'.ch-body\').style.display=this.parentNode.querySelector(\'.ch-body\').style.display===\'none\'?\'block\':\'none\'">🌐 Панорама 33 линзы <span style="font-size:12px;color:var(--muted)">▼</span></h2>' +
    '<p class="sub">Все традиции мира — твой путь через них</p>' +
    '<div class="ch-body" id="longtermContainer" style="margin-top:8px"></div>';

  /* Append all 4 sections to s-chron */
  chronScreen.appendChild(scrollSec);
  chronScreen.appendChild(structSec);
  chronScreen.appendChild(emapSec);
  chronScreen.appendChild(ltSec);



  /* ═══════════════════════════════════════════
     IV. PATCH go() for longterm screen
     ═══════════════════════════════════════════ */

  var _origGo = window.go;
  window.go = function(name){
    if(_origGo) _origGo(name);
    /* Render sections when entering chron */
    if(name === 'chron'){
      setTimeout(function(){ _renderChronSections(); }, 100);
    }
  };



  /* ═══════════════════════════════════════════
     VI. RENDER CHRON SECTIONS
     ═══════════════════════════════════════════ */

  function _renderChronSections(){
    if(window.AwaraScroll){
      var sc = document.getElementById('scrollContainer');
      if(sc && !sc.dataset.rendered){
        window.AwaraScroll.renderScroll(sc, 'present');
        sc.dataset.rendered = '1';
      }
    }
    if(window.AwaraStructures){
      var st = document.getElementById('structContainer');
      if(st && !st.dataset.rendered){
        window.AwaraStructures.renderPanel(st);
        st.dataset.rendered = '1';
      }
    }
    if(window.AwaraEnergyMap){
      var em = document.getElementById('emapContainer');
      if(em && !em.dataset.rendered){
        window.AwaraEnergyMap.renderEnergyMap(em);
        em.dataset.rendered = '1';
      }
    }
    if(window.AwaraLongterm){
      var lt = document.getElementById('longtermContainer');
      if(lt && !lt.dataset.rendered){
        window.AwaraLongterm.renderPanorama(lt);
        lt.dataset.rendered = '1';
      }
    }
  }

  /* ═══════════════════════════════════════════
     VII. ENRICH ISTOK WITH ETHER & PARTICLES
     ═══════════════════════════════════════════ */

  var _origRenderIstok = window.renderIstok;
  if(_origRenderIstok){
    window.renderIstok = function(){
      _origRenderIstok();
      var chron = document.getElementById('istokChron');
      if(chron && window.AwaraParticles){
        var ei = window.AwaraParticles.getEtherInfo();
        var etherIcons = { sleeping:'🌑', awakening:'🌗', awakened:'☀' };
        var etherNames = { sleeping:'Спящий', awakening:'Пробуждается', awakened:'Пробуждён' };
        var etherHtml = '<div class="trait"><span><span class="icon-placeholder"></span> Эфир</span><b style="color:' + ei.color + '">' + (etherIcons[ei.state]||'') + ' ' + (etherNames[ei.state]||'') + '</b></div>';
        var s; try { s = window.STATE; } catch(e){}
        if(s){
          var pt = Math.round((s.particles_today || 0) * 100) / 100;
          etherHtml += '<div class="trait"><span><span class="icon-placeholder"></span> Частицы ✧</span><b>' + pt + '</b></div>';
        }
        if(window.AwaraSensitivity){
          var sens = window.AwaraSensitivity.getSensitivity();
          etherHtml += '<div class="trait"><span><span class="icon-placeholder"></span> Чувствительность</span><b>' + sens.level.name_ru + '</b></div>';
        }
        if(window.AwaraRarity){
          var tier = window.AwaraRarity.getTierByScore();
          etherHtml += '<div class="trait" style="border:none"><span><span class="icon-placeholder"></span> Раритет</span><b style="color:' + tier.color + '">' + tier.icon + ' ' + tier.name_ru + '</b></div>';
        }
        chron.innerHTML += etherHtml;
      }
    };
  }

  /* ═══════════════════════════════════════════
     VIII. RESULT CARD ENRICHMENT
     ═══════════════════════════════════════════ */

  window.addEventListener('awara-xp', function(e){
    var detail = e.detail;
    if(!detail) return;
    setTimeout(function(){
      var resultEl = document.querySelector('#s-result .card, .result-card');
      if(!resultEl) return;
      var extra = '';
      if(detail.particles !== undefined) extra += '<div class="trait"><span>✧ Частицы</span><b>+' + Math.round(detail.particles * 100) / 100 + '</b></div>';
      if(detail.ether){
        var etherIcons = { sleeping:'🌑', awakening:'🌗', awakened:'☀' };
        extra += '<div class="trait"><span>' + (etherIcons[detail.ether.state]||'') + ' Эфир</span><b style="color:' + detail.ether.color + '">' + detail.ether.name_ru + '</b></div>';
      }
      if(detail.sensitivity) extra += '<div class="trait"><span>💎 Чувствительность</span><b>' + detail.sensitivity.level.name_ru + ' (' + Math.round(detail.sensitivity.value * 10) / 10 + ')</b></div>';
      if(detail.ray) extra += '<div class="trait"><span style="color:' + detail.ray.color + '">☀ Луч Восприятия</span><b style="color:' + detail.ray.color + '">' + detail.ray.message + '</b></div>';
      if(detail.rarity) extra += '<div class="trait" style="border:none"><span>' + detail.rarity.icon + ' Раритет</span><b style="color:' + detail.rarity.color + '">' + detail.rarity.name_ru + '</b></div>';
      if(extra){
        var div = document.createElement('div');
        div.className = 'card awara-glass-card';
        div.style.marginTop = '12px';
        div.innerHTML = '<span class="label">Духовные системы</span>' + extra;
        resultEl.parentNode.insertBefore(div, resultEl.nextSibling);
      }
    }, 500);
  });

  /* ═══════════════════════════════════════════
     IX. TOAST NOTIFICATIONS
     ═══════════════════════════════════════════ */

  function _toast(text, color){
    if(window.showToast){ window.showToast(text); return; }
    var t = document.createElement('div');
    t.textContent = text;
    t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:10000;background:#1a1a2e;color:' + (color||'#fff') + ';padding:10px 20px;border-radius:12px;border:1px solid ' + (color||'#555') + ';font-size:13px;pointer-events:none';
    document.body.appendChild(t);
    setTimeout(function(){ t.style.opacity = '0'; t.style.transition = 'opacity .5s'; }, 2500);
    setTimeout(function(){ t.remove(); }, 3000);
  }

  window.addEventListener('awara-ether-awakening', function(){ _toast('🌗 Эфир пробуждается...', '#A0A0A0'); });
  window.addEventListener('awara-ether-awakened', function(){ _toast('☀ Эфир пробуждён! Частицы ×1.2', '#E0C060'); });
  window.addEventListener('awara-ether-fading', function(){ _toast('🌗 Эфир затухает...', '#888'); });
  window.addEventListener('awara-sensitivity-level-up', function(e){ var d = e.detail || {}; _toast('💎 Чувствительность: ' + (d.name || ''), '#B090E0'); });
  window.addEventListener('awara-structure-built', function(e){ var d = e.detail || {}; var s = d.structure || {}; _toast('🏛 ' + (s.name_ru || 'Структура') + ' построена!', '#FFD700'); });
  window.addEventListener('awara-lens-awakening', function(e){ var d = e.detail || {}; _toast('🌿 Линза ' + (d.lens || '') + ' пробуждается!', '#6f6'); });

  console.log('[AwaraIntegration] v2 ready — Хроника (4 секции)');
});
})();
