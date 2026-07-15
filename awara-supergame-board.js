/* ============================================================
   AWARA · SUPER-GAME BOARD v1
   Борд Супер-Игры: 13 колец (-3..9) + мета-стадии.
   Визуализация пути игрока от Даймона до Творца.
   Загружать после awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraSuperGame && window.__awaraSuperGame >= 1) return;
window.__awaraSuperGame = 1;

/* ═══════════════════════════════════════════
   I. RING DATA
   ═══════════════════════════════════════════ */

var RINGS = [
  {ring:-3, name:'Даймон',        nameRu:'Даймон',         color:'#555555', glow:'#333', threshold:0,    icon:'👤', stage:'Пробуждение'},
  {ring:-2, name:'Тень',          nameRu:'Тень',           color:'#6B4C8A', glow:'#4a3366', threshold:5,    icon:'🌑', stage:'Пробуждение'},
  {ring:-1, name:'Искра',         nameRu:'Искра',          color:'#8B6DAF', glow:'#6b4d8f', threshold:15,   icon:'✨', stage:'Пробуждение'},
  {ring:0,  name:'Пробуждение',   nameRu:'Пробуждение',    color:'#A08FC0', glow:'#7a6fa0', threshold:30,   icon:'🌅', stage:'Становление'},
  {ring:1,  name:'Душа',          nameRu:'Душа',           color:'#7EC8E3', glow:'#5ea8c3', threshold:50,   icon:'💠', stage:'Становление'},
  {ring:2,  name:'Гармония',      nameRu:'Гармония',       color:'#5DADE2', glow:'#3d8dc2', threshold:100,  icon:'☯️', stage:'Становление'},
  {ring:3,  name:'Сияние',        nameRu:'Сияние',         color:'#48C9B0', glow:'#28a990', threshold:200,  icon:'🌟', stage:'Восхождение'},
  {ring:4,  name:'Восход',        nameRu:'Восход',         color:'#F4D03F', glow:'#d4b01f', threshold:400,  icon:'☀️', stage:'Восхождение'},
  {ring:5,  name:'Храм',          nameRu:'Храм',           color:'#E8A838', glow:'#c88818', threshold:700,  icon:'🏛', stage:'Восхождение'},
  {ring:6,  name:'Хроника',       nameRu:'Хроника',        color:'#E07020', glow:'#c05000', threshold:1200, icon:'📖', stage:'Служение'},
  {ring:7,  name:'Космос',        nameRu:'Космос',         color:'#C850C0', glow:'#a830a0', threshold:2000, icon:'🌌', stage:'Служение'},
  {ring:8,  name:'Дух',           nameRu:'Дух',            color:'#E0E0FF', glow:'#c0c0ff', threshold:3500, icon:'🕊', stage:'Единство'},
  {ring:9,  name:'Творец',        nameRu:'Творец',         color:'#FFFFFF', glow:'#fffae6', threshold:6000, icon:'🔆', stage:'Единство'}
];

var STAGES = [
  {name:'Пробуждение', color:'#8B6DAF', rings:[-3,-2,-1]},
  {name:'Становление', color:'#5DADE2', rings:[0,1,2]},
  {name:'Восхождение', color:'#F4D03F', rings:[3,4,5]},
  {name:'Служение',    color:'#E07020', rings:[6,7]},
  {name:'Единство',    color:'#E0E0FF', rings:[8,9]}
];

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e){ return null; } }
function getRing(){ var s=S(); return (s&&s.progress)?s.progress.current_ring||(-3):(-3); }
function getLight(){ var s=S(); return (s&&s.progress)?s.progress.total_light||0:0; }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function getRingData(ring){
  for(var i=0;i<RINGS.length;i++) if(RINGS[i].ring===ring) return RINGS[i];
  return RINGS[0];
}

function getNextRing(ring){
  for(var i=0;i<RINGS.length;i++){
    if(RINGS[i].ring===ring && i<RINGS.length-1) return RINGS[i+1];
  }
  return null;
}

function getProgress(ring, totalLight){
  var curr = getRingData(ring);
  var next = getNextRing(ring);
  if(!next) return 1.0; // max ring
  var range = next.threshold - curr.threshold;
  if(range<=0) return 1.0;
  return Math.min(1, Math.max(0, (totalLight - curr.threshold) / range));
}

/* ═══════════════════════════════════════════
   III. RENDER BOARD
   ═══════════════════════════════════════════ */

function renderBoard(container){
  if(!container) return;
  var ring = getRing();
  var light = getLight();
  var progress = getProgress(ring, light);
  var ringData = getRingData(ring);
  var nextRing = getNextRing(ring);
  var s = S();
  var axes = (s&&s.axes)?s.axes:{};
  var daysPlayed = (s&&s.progress)?s.progress.days_played||0:0;
  var questsDone = (s&&s.progress)?s.progress.quests_completed||0:0;

  var html = [];
  html.push('<div class="sg-board" style="font-family:\'Cormorant Garamond\',Georgia,serif;color:#e0e0e0;padding:0">');

  /* ── Current Ring Hero ── */
  html.push('<div class="sg-hero" style="text-align:center;padding:24px 0 16px">');
  html.push('<div style="font-size:48px;line-height:1;filter:drop-shadow(0 0 12px '+ringData.glow+')">'+ringData.icon+'</div>');
  html.push('<div style="font-size:22px;font-weight:700;color:'+ringData.color+';margin-top:8px;text-shadow:0 0 20px '+ringData.glow+'">'+esc(ringData.nameRu)+'</div>');
  html.push('<div style="font-size:12px;color:#999;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Кольцо '+(ring>=0?'+':'')+ring+' · '+esc(ringData.stage)+'</div>');
  html.push('</div>');

  /* ── Progress to next ring ── */
  if(nextRing){
    var pct = Math.round(progress*100);
    var remaining = Math.max(0, nextRing.threshold - light);
    html.push('<div style="padding:0 20px;margin-bottom:16px">');
    html.push('<div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:4px">');
    html.push('<span>☀ '+Math.round(light)+' света</span>');
    html.push('<span>→ '+esc(nextRing.nameRu)+' ('+nextRing.threshold+')</span>');
    html.push('</div>');
    html.push('<div style="height:6px;background:#1a1a2e;border-radius:3px;overflow:hidden;position:relative">');
    html.push('<div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,'+ringData.color+','+nextRing.color+');border-radius:3px;transition:width .5s ease;box-shadow:0 0 8px '+ringData.glow+'"></div>');
    html.push('</div>');
    html.push('<div style="font-size:10px;color:#666;margin-top:3px;text-align:center">Осталось '+Math.round(remaining)+' света до кольца '+(nextRing.ring>=0?'+':'')+nextRing.ring+'</div>');
    html.push('</div>');
  } else {
    html.push('<div style="text-align:center;color:#ffd27a;font-size:13px;padding:8px 20px;margin-bottom:16px">✦ Достигнуто высшее кольцо ✦</div>');
  }

  /* ── Ring Map (vertical) ── */
  html.push('<div style="padding:0 16px">');
  for(var i=RINGS.length-1; i>=0; i--){
    var r = RINGS[i];
    var isCurrent = (r.ring === ring);
    var isPast = (r.ring < ring);
    var isFuture = (r.ring > ring);
    var opacity = isCurrent ? 1 : (isPast ? 0.7 : 0.35);
    var bg = isCurrent ? 'rgba(255,255,255,0.06)' : 'transparent';
    var border = isCurrent ? '1px solid '+r.color : '1px solid transparent';
    var leftColor = isPast ? r.color : (isCurrent ? r.color : '#333');
    var connector = i>0 ? '<div style="width:2px;height:8px;background:'+((isPast||isCurrent)?r.color:'#333')+';margin:0 auto"></div>' : '';

    html.push('<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:8px;opacity:'+opacity+';background:'+bg+';border:'+border+';margin-bottom:0;transition:all .3s">');
    html.push('<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;background:rgba(0,0,0,.3);border:1.5px solid '+leftColor+'">'+r.icon+'</div>');
    html.push('<div style="flex:1">');
    html.push('<div style="font-size:13px;color:'+r.color+';font-weight:'+(isCurrent?'700':'400')+'">'+esc(r.nameRu)+'</div>');
    html.push('<div style="font-size:10px;color:#666">'+(r.ring>=0?'+':'')+r.ring+' · '+r.threshold+' ☀</div>');
    html.push('</div>');
    if(isCurrent) html.push('<div style="font-size:10px;color:'+r.color+';font-weight:700">← ТЫ</div>');
    if(isPast) html.push('<div style="font-size:10px;color:#4ade80">✓</div>');
    html.push('</div>');
    html.push(connector);
  }
  html.push('</div>');

  /* ── Stats ── */
  html.push('<div style="margin-top:16px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.06)">');
  html.push('<div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Статистика пути</div>');
  html.push('<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">');
  html.push('<div style="background:rgba(255,255,255,.03);padding:8px;border-radius:6px"><div style="font-size:18px;color:#ffd27a;font-weight:700">'+Math.round(light)+'</div><div style="font-size:9px;color:#666">Света ☀</div></div>');
  html.push('<div style="background:rgba(255,255,255,.03);padding:8px;border-radius:6px"><div style="font-size:18px;color:#7EC8E3;font-weight:700">'+questsDone+'</div><div style="font-size:9px;color:#666">Квестов</div></div>');
  html.push('<div style="background:rgba(255,255,255,.03);padding:8px;border-radius:6px"><div style="font-size:18px;color:#48C9B0;font-weight:700">'+daysPlayed+'</div><div style="font-size:9px;color:#666">Дней</div></div>');
  html.push('</div>');

  /* ── Top Axes ── */
  var sortedAxes = [];
  for(var ax in axes) sortedAxes.push({name:ax, val:axes[ax]||0});
  sortedAxes.sort(function(a,b){return b.val-a.val});
  var axNames = {discipline:'Дисциплина',compassion:'Сострадание',clarity:'Ясность',will:'Воля',devotion:'Преданность',transformation:'Трансформация',unity:'Единство'};
  var axIcons = {discipline:'⚔',compassion:'💚',clarity:'👁',will:'🔥',devotion:'🙏',transformation:'⚡',unity:'∞'};
  if(sortedAxes.length>0){
    html.push('<div style="margin-top:12px;font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Оси развития</div>');
    var maxAx = sortedAxes[0].val || 1;
    for(var ai=0;ai<Math.min(7,sortedAxes.length);ai++){
      var ax2 = sortedAxes[ai];
      var w = Math.max(2, Math.round(ax2.val/maxAx*100));
      html.push('<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">');
      html.push('<div style="width:16px;text-align:center;font-size:11px">'+(axIcons[ax2.name]||'·')+'</div>');
      html.push('<div style="width:80px;font-size:10px;color:#aaa">'+esc(axNames[ax2.name]||ax2.name)+'</div>');
      html.push('<div style="flex:1;height:4px;background:#1a1a2e;border-radius:2px;overflow:hidden"><div style="width:'+w+'%;height:100%;background:'+ringData.color+';border-radius:2px"></div></div>');
      html.push('<div style="font-size:10px;color:#888;width:30px;text-align:right">'+Math.round(ax2.val*10)/10+'</div>');
      html.push('</div>');
    }
  }

  html.push('</div>');
  html.push('</div>');

  container.innerHTML = html.join('');
}

/* ═══════════════════════════════════════════
   IV. SHOW AS MODAL
   ═══════════════════════════════════════════ */

function showBoard(){
  var existing = document.getElementById('sg-overlay');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'sg-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);overflow-y:auto;-webkit-overflow-scrolling:touch;animation:sg-fadein .3s ease';
  overlay.onclick = function(e){ if(e.target===overlay) overlay.remove(); };

  var card = document.createElement('div');
  card.style.cssText = 'max-width:420px;margin:40px auto;background:linear-gradient(145deg,#0d0d1a,#1a1a2e);border-radius:16px;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 60px rgba(0,0,0,.5);overflow:hidden';

  /* Header */
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.06)';
  hdr.innerHTML = '<div style="font-size:16px;font-weight:700;color:#ffd27a;font-family:Cinzel,serif">🎮 Борд Супер-Игры</div><button onclick="this.closest(\'#sg-overlay\').remove()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">✕</button>';
  card.appendChild(hdr);

  /* Board container */
  var bc = document.createElement('div');
  bc.id = 'sg-board-container';
  bc.style.cssText = 'padding:0 0 16px';
  card.appendChild(bc);
  overlay.appendChild(card);

  /* Inject animation */
  if(!document.getElementById('sg-styles')){
    var st = document.createElement('style');
    st.id = 'sg-styles';
    st.textContent = '@keyframes sg-fadein{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(st);
  }

  document.body.appendChild(overlay);
  renderBoard(bc);
}

/* ═══════════════════════════════════════════
   V. ADD BUTTON TO NAV
   ═══════════════════════════════════════════ */

function _addButton(){
  /* Add to topRightBtns row if exists, else to nav */
  var row = document.getElementById('trBtnRow');
  if(!row){
    var topRight = document.querySelector('.topRightBtns');
    if(topRight){
      row = document.createElement('div');
      row.id = 'trBtnRow';
      row.style.cssText = 'display:flex;flex-direction:row;gap:6px;align-self:flex-end';
      topRight.appendChild(row);
    }
  }
  if(row){
    var btn = document.createElement('button');
    btn.className = 'trBtn';
    btn.title = 'Борд Супер-Игры';
    btn.textContent = '🎮';
    btn.style.cssText = 'font-size:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#e0e0e0;cursor:pointer;padding:6px 8px;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center';
    btn.onclick = showBoard;
    row.appendChild(btn);
  }
}

/* ═══════════════════════════════════════════
   VI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraSuperGame = {
  show: showBoard,
  render: renderBoard,
  getRings: function(){ return RINGS; },
  getStages: function(){ return STAGES; },
  getCurrentRing: function(){ return getRingData(getRing()); },
  getProgress: function(){ return getProgress(getRing(), getLight()); }
};

/* Init */
if(document.readyState !== 'loading') setTimeout(_addButton, 1500);
else document.addEventListener('DOMContentLoaded', function(){ setTimeout(_addButton, 1500); });

console.log('[AwaraSuperGame] Super-Game Board v1 ready');
})();
