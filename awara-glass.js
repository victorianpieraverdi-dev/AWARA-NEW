'use strict';
/* ===== AWARA · GLASS THEME LAYER v4 — True Glassmorphism =====
   Логика/state/handlers НЕ ТРОГАЮТСЯ. Только стили.
   v4 правила:
   1) ИСТИННОЕ СТЕКЛО — прозрачные карты, blur(24px) saturate(120%), свет сверху/слева.
   2) ДОРОГОЕ ЗОЛОТО — чистый металлик #FBE18D→#D4AF37→#8B6508, тёмный текст, свечение.
   3) ИКОНКИ — монохромно-золотые (фильтр, убивает радугу эмодзи).
   4) СВЕТ ЗА СТЕКЛОМ — радиальный индиго/пурпур в центре. Грязь (grain) и болото убраны.
   ================================================================ */
(function(){
  var GLASS='linear-gradient(180deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.01) 100%)';
  var GLASSBLUR='blur(24px) saturate(120%)';
  var ICON='grayscale(1) sepia(.96) saturate(3) hue-rotate(5deg) brightness(1.02)';
  var CSS = `
:root{
  --gx-gold:#D4AF37; --gx-gold-lt:#FBE18D; --gx-gold-dk:#8B6508;
  --gx-acc:rgba(212,175,55,.8); --gx-indigo:#9d86e0; --gx-violet:#7b62c9;
  --gx-glass:${GLASS}; --gx-line-t:rgba(255,255,255,.1); --gx-line-l:rgba(255,255,255,.05);
  --gx-sh:0 8px 32px rgba(0,0,0,.35); --gx-inset:inset 0 1px 0 rgba(255,255,255,.08);
}

/* ====== 4 · ИСТОЧНИК СВЕТА (индиго/пурпур за стеклом) ====== */
body{background:radial-gradient(115% 90% at 50% 38%,#1a1638 0%,#0c0a22 45%,#050414 78%,#020109 100%) !important;}
.phone{
  background:
    radial-gradient(85% 60% at 50% 40%,rgba(123,98,201,.28) 0%,rgba(90,70,160,.12) 34%,transparent 64%),
    radial-gradient(70% 50% at 50% 92%,rgba(212,175,55,.10) 0%,transparent 60%),
    linear-gradient(180deg,#0b0a1e 0%,#070518 60%,#040310 100%) !important;
  border:1px solid rgba(255,255,255,.06) !important;
  box-shadow:0 0 0 7px #050410,0 40px 120px rgba(0,0,0,.85),var(--gx-inset) !important;
}
/* мягкая виньетка (без зерна!) */
.phone::before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;
  background:radial-gradient(125% 100% at 50% 30%,transparent 56%,rgba(0,0,0,.5) 100%);}
.phone::after{content:none !important;}
/* чистые туманности: убираем болотно-золотой, только индиго */
.neb{opacity:.32 !important;filter:blur(64px) saturate(.95) !important;mix-blend-mode:screen !important;}
.neb.a{background:radial-gradient(circle,#6a4ec0,transparent 70%) !important;}
.neb.b{background:radial-gradient(circle,#4a3a9c,transparent 70%) !important;}
.neb.c{background:radial-gradient(circle,#3a2f73,transparent 70%) !important;}
.scanline{opacity:.25 !important;}

/* ====== 1 · ИСТИННОЕ СТЕКЛО ====== */
.card:not(.awara-glass-card),.mcard,.gen,.pl,.intent,.streak .s,.wd,.arc .st,#genModal .genbody .card:not(.awara-glass-card){
  background:var(--gx-glass) !important;
  -webkit-backdrop-filter:${GLASSBLUR};backdrop-filter:${GLASSBLUR} !important;
  border:none !important;
  border-top:1px solid var(--gx-line-t) !important;
  border-left:1px solid var(--gx-line-l) !important;
  box-shadow:var(--gx-sh),var(--gx-inset) !important;
}
.card:not(.awara-glass-card){border-radius:20px !important;}
.libcard:not(.awara-glass-card){
  background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.015) 100%) !important;
  -webkit-backdrop-filter:blur(30px) saturate(125%);backdrop-filter:blur(30px) saturate(125%) !important;
  border:none !important;border-top:1px solid rgba(255,255,255,.14) !important;border-left:1px solid rgba(255,255,255,.07) !important;
  box-shadow:0 30px 90px rgba(0,0,0,.7),var(--gx-inset) !important;border-radius:26px !important;}
.libmodal{background:rgba(4,3,14,.55) !important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px) !important;}

/* ====== 2 · ДОРОГОЕ ЗОЛОТО ====== */
.btn:not(.awara-gold-button){
  background:linear-gradient(135deg,#FBE18D 0%,#D4AF37 50%,#8B6508 100%) !important;
  color:#1A1A1A !important;border:none !important;letter-spacing:1px !important;
  box-shadow:0 4px 20px rgba(212,175,55,.4),inset 0 1px 0 rgba(255,255,255,.4) !important;
  text-shadow:none !important;transition:transform .2s,box-shadow .3s,filter .25s !important;}
.btn:not(.awara-gold-button):hover{filter:brightness(1.07);box-shadow:0 6px 28px rgba(212,175,55,.55),inset 0 1px 0 rgba(255,255,255,.45) !important;}
.btn:not(.awara-gold-button):active{transform:translateY(1px) scale(.99);}
.btn.ghost{background:var(--gx-glass) !important;-webkit-backdrop-filter:${GLASSBLUR};backdrop-filter:${GLASSBLUR} !important;
  color:var(--gx-gold-lt) !important;border:none !important;border-top:1px solid var(--gx-line-t) !important;border-left:1px solid var(--gx-line-l) !important;
  box-shadow:var(--gx-inset) !important;text-shadow:none !important;}
.btn.ghost:hover{color:#fff !important;box-shadow:0 0 18px rgba(212,175,55,.25),var(--gx-inset) !important;}

/* ====== 3 · ИКОНКИ монохромно-золотые (убийство радуги) ====== */
.mcard .gl,.gen .ic,.libglyph,.nav button .ic,.orb span,.dm-orb span,#dmGlyph2,.pl .sym{
  filter:${ICON} drop-shadow(0 0 6px rgba(212,175,55,.35)) !important;opacity:.92 !important;}
.nav button .ic{opacity:.6 !important;}
.nav button.active .ic{opacity:1 !important;filter:${ICON} drop-shadow(0 0 8px rgba(212,175,55,.6)) !important;}

/* ====== ФОРМЫ ====== */
.input,textarea,.search,.aifield,select.aifield{
  background:rgba(0,0,0,.35) !important;
  border:1px solid rgba(255,255,255,.07) !important;
  box-shadow:inset 0 2px 10px rgba(0,0,0,.4) !important;border-radius:14px !important;
  color:#ece6f3 !important;transition:border-color .3s,box-shadow .3s !important;}
.input:focus,textarea:focus,.search:focus,.aifield:focus,select.aifield:focus{
  border-color:rgba(212,175,55,.6) !important;
  box-shadow:inset 0 2px 10px rgba(0,0,0,.4),0 0 0 1px rgba(212,175,55,.4),0 0 22px rgba(212,175,55,.28),0 0 36px rgba(123,98,201,.2) !important;
  outline:none !important;}

/* ====== ТИПОГРАФИКА ====== */
h1{font-family:'Cinzel',serif !important;font-weight:600 !important;letter-spacing:.04em !important;
  background:linear-gradient(180deg,#FBE18D 0%,#D4AF37 60%,#9c7a32 100%) !important;
  -webkit-background-clip:text;background-clip:text !important;-webkit-text-fill-color:transparent;color:transparent !important;
  text-shadow:none !important;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5)) drop-shadow(0 0 20px rgba(212,175,55,.16)) !important;}
h2{font-family:'Cinzel',serif !important;color:#ecd9a8 !important;letter-spacing:.06em !important;text-shadow:none !important;}
.eyebrow{color:var(--gx-acc) !important;letter-spacing:.34em !important;text-shadow:none !important;opacity:.9 !important;}
.adv{font-style:italic !important;color:#f0e8d2 !important;line-height:1.6 !important;text-shadow:none !important;}
.dm-name{background:linear-gradient(180deg,#fff,#cfc6e6 70%,#9d86e0) !important;-webkit-background-clip:text;background-clip:text !important;-webkit-text-fill-color:transparent;color:transparent !important;}

/* ====== АКЦЕНТЫ ====== */
.mcard{transition:transform .24s cubic-bezier(.2,.7,.2,1),box-shadow .3s,border-color .3s,background .3s !important;border-radius:16px !important;}
.mcard:hover,.gen:hover{transform:translateY(-3px) !important;box-shadow:0 16px 38px rgba(0,0,0,.5),inset 0 0 24px rgba(212,175,55,.08),var(--gx-inset) !important;}
.mcard.on{border-top-color:rgba(212,175,55,.55) !important;border-left-color:rgba(212,175,55,.3) !important;
  background:linear-gradient(150deg,rgba(212,175,55,.16),rgba(123,98,201,.1)) !important;
  box-shadow:0 0 24px rgba(212,175,55,.25),var(--gx-inset) !important;}
.mcard.on::after{color:var(--gx-gold-lt) !important;}
.intent .chk{background:rgba(0,0,0,.35) !important;border:1.5px solid rgba(157,134,224,.5) !important;border-radius:9px !important;}
.intent.done .chk{background:radial-gradient(circle at 38% 28%,#FBE18D,#D4AF37 58%,#8B6508) !important;border-color:rgba(212,175,55,.7) !important;
  box-shadow:0 0 14px rgba(251,225,141,.5),inset 0 1px 2px rgba(255,255,255,.5) !important;color:#1A1A1A !important;}
.trait{border-bottom:1px dashed rgba(255,255,255,.1) !important;}
.trait:last-child{border-bottom:none !important;}
.trait b{color:var(--gx-gold-lt) !important;text-shadow:none !important;}

/* Хитмап */
.day{background:rgba(255,255,255,.03) !important;border:1px solid rgba(255,255,255,.04) !important;border-radius:4px !important;transition:.25s !important;}
.day.l1{background:linear-gradient(135deg,rgba(150,100,40,.4),rgba(110,88,180,.3)) !important;}
.day.l2{background:linear-gradient(135deg,#9c7327,#d8b257) !important;box-shadow:0 0 8px -1px rgba(216,178,87,.4) !important;}
.day.l3{background:linear-gradient(135deg,#D4AF37,#FBE18D 60%,#fff2cf) !important;box-shadow:0 0 13px -1px rgba(251,225,141,.65),inset 0 0 6px rgba(255,255,255,.35) !important;}
.day.l2:hover,.day.l3:hover{transform:scale(1.12);}

/* Метр/кольцо/орбы */
.meter{background:rgba(0,0,0,.4) !important;}
.meter i{background:linear-gradient(90deg,#7b62c9,#9d86e0) !important;box-shadow:0 0 12px rgba(157,134,224,.5) !important;}
.ring::before{background:#0a0a18 !important;}
.orb{box-shadow:0 0 70px -6px rgba(212,175,55,.4),0 0 130px -20px rgba(123,98,201,.3),inset 0 0 44px rgba(255,210,122,.25) !important;}
.dm-orb{box-shadow:0 0 70px -6px rgba(123,98,201,.5),inset 0 0 42px rgba(157,134,224,.4) !important;}

/* Навигация + FAB */
.nav{background:rgba(255,255,255,.025) !important;-webkit-backdrop-filter:blur(24px) saturate(120%);backdrop-filter:blur(24px) saturate(120%) !important;
  border:none !important;border-top:1px solid var(--gx-line-t) !important;box-shadow:0 -8px 30px rgba(0,0,0,.4) !important;}
.nav button{color:#7a7490 !important;}
.nav button.active{color:#ecd9a8 !important;text-shadow:none !important;}
.aifab{background:var(--gx-glass) !important;-webkit-backdrop-filter:${GLASSBLUR};backdrop-filter:${GLASSBLUR} !important;
  border:1px solid rgba(255,255,255,.12) !important;color:#ecd9a8 !important;
  box-shadow:0 0 22px rgba(123,98,201,.4),var(--gx-inset) !important;}

/* Акценты прочие */
.toast{background:linear-gradient(135deg,#FBE18D,#D4AF37) !important;color:#1A1A1A !important;box-shadow:0 12px 44px -10px rgba(212,175,55,.55) !important;}
.wd.on{border-top-color:rgba(212,175,55,.5) !important;}
.arc .st.now{border-top-color:rgba(157,134,224,.5) !important;color:#fff !important;background:linear-gradient(180deg,rgba(123,98,201,.18),rgba(255,255,255,.02)) !important;}
.bub.user{background:rgba(123,98,201,.2) !important;border:1px solid rgba(255,255,255,.07) !important;}
.bub.daimon{background:rgba(212,175,55,.1) !important;border:1px solid rgba(255,255,255,.06) !important;}
.gen{border-radius:14px !important;}
`;
  function inject(){
    try{
      var prev=document.getElementById('awara-glass-style');
      if(prev)prev.remove();
      var st=document.createElement('style');
      st.id='awara-glass-style';
      st.textContent=CSS;
      (document.head||document.documentElement).appendChild(st);
    }catch(e){}
  }
  inject();
  var n=0,iv=setInterval(function(){inject();if(++n>=8)clearInterval(iv);},250);
  if(document.readyState!=='complete')window.addEventListener('DOMContentLoaded',inject);
  window.AwaraGlass={__ready:true,inject:inject,version:5};
})();
