/* AWARA — Гейт колоды линз (v2).
   На первых уровнях Восхождения РУЧНОЙ выбор колоды затемнён и заблокирован.
   Линзу дня выдаёт Колесо Тигеля (случайный выбор). Ручной выбор
   открывается на уровне «Сплав» (или по накопленному свету).
   Уровень считаем ТАК ЖЕ, как awara-wheel.js — по числу освоенных матриц
   (STATE.lenses[k].uses>0), чтобы гейт и Колесо были согласованы.
   Аддитивный модуль: движок не тронут, только обёртки. */
(function(){
  'use strict';
  if(window.__awaraLensGate) return; window.__awaraLensGate=true;

  var UNLOCK_LEVEL = 3;   // ручной выбор открывается на этом уровне Колеса («Сплав»)
  var UNLOCK_LIGHT = 75;  // ...или когда лучший свет за прожитые дни достигнет этого

  function S(){ return (typeof STATE!=='undefined') ? STATE : (window.STATE||null); }

  // --- уровень: точно как в awara-wheel.js ---
  function exploredCount(){
    var s=S(); if(!s||!s.lenses) return 0;
    return Object.keys(s.lenses).filter(function(k){ return s.lenses[k] && s.lenses[k].uses>0; }).length;
  }
  function level(){ var ex=exploredCount(); return ex<2?1 : ex<6?2 : ex<12?3 : 4; }
  function maxLenses(){ return Math.min(level(),3); }
  function levelName(){ return ({1:'Искра',2:'Поток',3:'Сплав',4:'Мастерство'})[level()]; }

  // лучший свет ТОЛЬКО по завершённым дням журнала (текущий свет не учитываем,
  // иначе колода открывалась бы сразу при первой записи)
  function bestLight(){
    var s=S(); var best=0;
    if(s && Array.isArray(s.journal)) s.journal.forEach(function(e){ if(e && typeof e.light==='number' && e.light>best) best=e.light; });
    return Math.round(best);
  }

  function testOpen(){ try{ return localStorage.getItem('tigel_gate_test')==='1'; }catch(e){ return false; } }
  function setTestOpen(on){ try{ if(on) localStorage.setItem('tigel_gate_test','1'); else localStorage.removeItem('tigel_gate_test'); }catch(e){} try{ applyGate(); }catch(e){} try{ if(typeof renderDeck==='function') renderDeck(''); }catch(e){} }
  function unlocked(){ return testOpen() || level() >= UNLOCK_LEVEL || bestLight() >= UNLOCK_LIGHT; }

  function toast(msg){ try{ if(typeof showToast==='function'){ showToast(msg); return; } }catch(e){} }

  function styleOnce(){
    if(document.querySelector('style[data-lens-gate]')) return;
    var st=document.createElement('style'); st.setAttribute('data-lens-gate','1');
    st.textContent =
      '#deck.lens-locked-deck{position:relative}'+
      '#deck .mcard.lens-locked{opacity:.28;filter:grayscale(.8);pointer-events:none;transition:.3s}'+
      '#lensGate{margin:10px 0 14px;padding:14px 16px;border:1px solid var(--line,rgba(201,168,76,.16));'+
      'border-radius:14px;background:linear-gradient(180deg,rgba(123,98,201,.12),rgba(123,98,201,.03))}'+
      '#lensGate .lg-h{font-family:Cinzel,serif;color:var(--gold,#c9a84c);font-size:14px;letter-spacing:.04em;margin-bottom:4px}'+
      '#lensGate .lg-s{color:var(--muted,#8e88a4);font-size:12.5px;line-height:1.5;margin-bottom:10px}'+
      '#lensRandBtn{cursor:pointer;border:1px solid var(--violet-soft,#9d86e0);background:rgba(123,98,201,.18);'+
      'color:var(--text,#ece9f5);font-family:Cinzel,serif;letter-spacing:.04em;padding:9px 16px;border-radius:10px;font-size:13px}'+
      '#lensRandBtn:hover{background:rgba(123,98,201,.32)}'+
      '#lensGateProg{margin-top:9px;color:var(--muted,#8e88a4);font-size:11.5px}';
    document.head.appendChild(st);
  }

  function deckEl(){ return document.getElementById('deck'); }
  function deckCards(){ return Array.prototype.slice.call(document.querySelectorAll('#deck .mcard')); }

  function applyGate(){
    styleOnce();
    var locked = !unlocked();
    var dk=deckEl(); if(dk){ if(locked) dk.classList.add('lens-locked-deck'); else dk.classList.remove('lens-locked-deck'); }
    deckCards().forEach(function(c){ if(locked) c.classList.add('lens-locked'); else c.classList.remove('lens-locked'); });
    var cnt=document.getElementById('counter');
    if(cnt){ var s=S(); var n=(s && Array.isArray(s.mats)) ? s.mats.length : 0; cnt.textContent = n + ' / ' + maxLenses(); }
    ensureBanner();
    ensureTestToggle();
  }

  function progText(){
    if(unlocked()) return 'Колода открыта — выбирай линзы вручную.';
    return 'Сейчас уровень ' + level() + ' · ' + levelName() + '. Ручной выбор колоды откроется на уровне ' + UNLOCK_LEVEL + ' · Сплав (освой больше матриц) или когда свет дня достигнет ' + UNLOCK_LIGHT + '.';
  }

  // запустить случайный выбор: предпочитаем Колесо Тигеля (его спин = случайная линза)
  function spinWheel(){
    var sp=document.getElementById('twSpin');
    if(sp && !sp.disabled){ sp.click(); return true; }
    if(sp && sp.disabled){ toast('Линзы дня уже собраны'); return true; }
    return false;
  }
  function pickRandom(){
    if(spinWheel()) return;
    // запасной путь, если Колеса нет
    var s=S(); var keys=[];
    try{ if(typeof MATKEYS!=='undefined' && Array.isArray(MATKEYS)) keys=MATKEYS.slice(); }catch(e){}
    if(!keys.length){ toast('Колода ещё не готова'); return; }
    var k=keys[Math.floor(Math.random()*keys.length)];
    try{ if(s){ s.mats=[k]; if(typeof save==='function') save(); } if(typeof renderDeck==='function') renderDeck(''); }catch(e){}
    applyGate();
    var nm=''; try{ if(typeof MATRIX!=='undefined' && MATRIX[k]) nm=MATRIX[k][0]+' '+k; }catch(e){}
    toast('Выпала линза дня: '+(nm||k));
  }

  function ensureBanner(){
    var screen=document.getElementById('s-tigel'); if(!screen) return;
    var head=screen.querySelector('.deck-head'); if(!head) return;
    var card=document.getElementById('lensGate');
    if(unlocked()){ if(card) card.remove(); return; }
    if(!card){
      card=document.createElement('div'); card.id='lensGate';
      card.innerHTML =
        '<div class="lg-h">🎲 Линза дня</div>'+
        '<div class="lg-s">На первых шагах Восхождения колода скрыта — линзу выбирает Колесо Тигеля. Доверься тому, что выпадет. Полный ручной выбор откроется выше по уровню.</div>'+
        '<button id="lensRandBtn" type="button">🎲 Крутить Колесо линз</button>'+
        '<div id="lensGateProg"></div>';
      head.parentNode.insertBefore(card, head);
      var btn=card.querySelector('#lensRandBtn');
      if(btn) btn.addEventListener('click', function(){ pickRandom(); });
    }
    var prog=document.getElementById('lensGateProg'); if(prog) prog.textContent=progText();
  }

  // dev/test toggle: force-open the deck regardless of level
  function ensureTestToggle(){
    var screen=document.getElementById('s-tigel'); if(!screen) return;
    var head=screen.querySelector('.deck-head'); if(!head) return;
    var b=document.getElementById('lensGateTest');
    if(!b){
      b=document.createElement('button'); b.id='lensGateTest'; b.type='button';
      b.style.cssText='margin-left:auto;cursor:pointer;font-size:10.5px;letter-spacing:.03em;padding:4px 9px;border-radius:8px;border:1px dashed var(--line,rgba(201,168,76,.3));background:rgba(255,255,255,.04);color:var(--muted,#8e88a4)';
      b.addEventListener('click', function(){ setTestOpen(!testOpen()); });
      head.appendChild(b);
    }
    var on=testOpen();
    b.textContent = on ? '\u0442\u0435\u0441\u0442: \u043e\u0442\u043a\u0440\u044b\u0442\u0430 \ud83d\udd13' : '\u0442\u0435\u0441\u0442: \u043e\u0442\u043a\u0440\u044b\u0442\u044c \ud83d\udd12';
  }

  // --- обёртки движка ---
  function install(){
    // renderDeck -> применять гейт после каждой перерисовки колоды
    var oRD=window.renderDeck;
    if(typeof oRD==='function' && !oRD.__lensGate){
      window.renderDeck=function(){ var r=oRD.apply(this,arguments); try{ applyGate(); }catch(e){} return r; };
      window.renderDeck.__lensGate=true;
    }
    // openLib -> блокировать открытие карточки материала, когда колода закрыта
    var oOpen=window.openLib;
    if(typeof oOpen==='function' && !oOpen.__lensGate){
      window.openLib=function(){
        if(!unlocked()){ toast('Колода откроется позже. Сейчас линзу даёт Колесо Тигеля 🎲'); return; }
        return oOpen.apply(this,arguments);
      };
      window.openLib.__lensGate=true;
    }
    // toggleMat -> не давать вручную добавлять линзы сверх лимита уровня, когда закрыто
    var oTog=window.toggleMat;
    if(typeof oTog==='function' && !oTog.__lensGate){
      window.toggleMat=function(k){
        var s=S();
        var has = s && Array.isArray(s.mats) && s.mats.indexOf(k)>=0;
        if(!unlocked() && !has){ toast('Ручной выбор закрыт. Крути Колесо Тигеля 🎲'); return; }
        var lim=maxLenses();
        if(!has && s && Array.isArray(s.mats) && s.mats.length>=lim){ toast('На этом уровне доступно линз: '+lim); return; }
        var r=oTog.apply(this,arguments); try{ applyGate(); }catch(e){} return r;
      };
      window.toggleMat.__lensGate=true;
    }
    applyGate();
  }

  function boot(){
    var tries=0;
    (function wait(){
      if(typeof window.renderDeck==='function' || document.getElementById('deck')){ install(); return; }
      if(tries++>80){ install(); return; }
      setTimeout(wait,150);
    })();
    // перерисовка/перепроверка при заходе на Тигель (nav и любые onclick на tigel)
    document.addEventListener('click', function(e){
      var t=e.target && e.target.closest && e.target.closest('.nav button, [onclick*="tigel"]');
      if(t) setTimeout(function(){ try{ applyGate(); }catch(e){} }, 80);
    }, true);
    if(typeof window.go==='function' && !window.go.__lensGateGo){
      var _go=window.go;
      window.go=function(name){ var r=_go.apply(this,arguments); if(name==='tigel'){ setTimeout(function(){ try{ applyGate(); }catch(e){} },50); } return r; };
      window.go.__lensGateGo=true;
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.AwaraLensGate={ pickRandom:pickRandom, unlocked:unlocked, level:level, maxLenses:maxLenses, applyGate:applyGate, testOpen:testOpen, setTestOpen:setTestOpen, __ready:true };
})();
