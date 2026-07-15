/* ============================================================
   AWARA · UX LAYER (v1)
   Тач-эргономика + подсветка пальцем вместо hover.
   Аддитивный слой, движок не трогает.
   ============================================================ */
(function(){
"use strict";

/* подключаем свой css один раз */
try{
  if(!document.querySelector('link[data-awara-ux]')){
    var l=document.createElement('link');
    l.rel='stylesheet';
    l.href='awara-ux.css?v=1';
    l.setAttribute('data-awara-ux','1');
    document.head.appendChild(l);
  }
}catch(e){}

/* 1) включаем UX-слой всегда (читаемость нужна и в desktop-превью, и на телефоне).
   Чисто тач-поведение (отключение hover) сидит в @media (hover:none) и десктопа не касается. */
function markTouch(){
  try{ if(document.body) document.body.classList.add('aw-touch'); }catch(e){}
}
if(document.body) markTouch();
else document.addEventListener('DOMContentLoaded',markTouch);

var PRESS='.btn, .awara-gold-button, .mcard, .gen, .wd, .nav button';

/* 2) подсветка касанием */
document.addEventListener('pointerdown',function(e){
  var t=e.target;
  if(!t||!t.closest) return;

  /* a) «вожу — золотом подсвечивается»: тот же spotlight, но и по касанию */
  var card=t.closest('.awara-glass-card');
  if(card){
    var rc=card.getBoundingClientRect();
    card.style.setProperty('--mx',(e.clientX-rc.left)+'px');
    card.style.setProperty('--my',(e.clientY-rc.top)+'px');
  }

  /* b) нажатие ключевых поверхностей */
  var el=t.closest(PRESS);
  if(el) el.classList.add('aw-press');
},{passive:true});

function release(){
  var els=document.querySelectorAll('.aw-press');
  for(var i=0;i<els.length;i++) els[i].classList.remove('aw-press');
}
document.addEventListener('pointerup',release,{passive:true});
document.addEventListener('pointercancel',release,{passive:true});

/* если палец «уехал» с элемента — гасим */
document.addEventListener('pointermove',function(e){
  if(!document.querySelector('.aw-press')) return;
  var t=e.target;
  var still=(t&&t.closest)?t.closest('.aw-press'):null;
  if(!still) release();
},{passive:true});

})();
