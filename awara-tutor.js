/* ===== AWARA · Обучение + Свиток Души =====
   Аддитивный слой. Подсказки на каждом экране с кнопкой вкл/выкл +
   мастер-профиль Души (прошлое/настоящее/будущее).
   Движок не трогает — оборачивает go()/renderIstok()/aiContext().
*/
(function(){
'use strict';
if(window.AwaraTutor&&window.AwaraTutor.__ready)return;

var HKEY='awara_hints';
var SEENKEY='awara_hints_seen';
var SOULKEY='awara_soul';
var SOULPROMPT='awara_soul_prompt';
var OFFERED='awara_soul_offered';

function $(id){return document.getElementById(id);}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v==null?d:v;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(m){try{if(typeof showToast==='function')showToast(m);}catch(e){}}

function hintsOn(){return lsGet(HKEY,'1')!=='0';}
function seen(){try{return JSON.parse(lsGet(SEENKEY,'[]'))||[];}catch(e){return [];}}
function markSeen(id){var s=seen();if(s.indexOf(id)<0){s.push(id);lsSet(SEENKEY,JSON.stringify(s));}}
function clearSeen(){lsSet(SEENKEY,'[]');}
function getSoul(){try{return JSON.parse(lsGet(SOULKEY,'{}'))||{};}catch(e){return {};}}
function setSoul(o){lsSet(SOULKEY,JSON.stringify(o||{}));try{if(typeof STATE!=='undefined'&&STATE){STATE.soul=o;if(typeof save==='function')save();}}catch(e){}}

var HINTS={
  istok:{t:'Исток · твой дом',h:'Отсюда начинается путь. Вверху — символ сознания и Индикатор Света, ниже — Хроника пути. Жми «Открыть Тигель», чтобы прожить и переплавить день.'},
  natal:{t:'Натальная карта',h:'Карта считается из даты, времени и места рождения. Из неё рождается твой Даймон-спутник и глубина советов. Заполни данные и нажми «Рассчитать карту».'},
  tigel:{t:'Как плавить день',h:'1) В поле «Как прошёл день» опиши прожитое — чем честнее и осознаннее, тем больше Света. 2) Возьми линзу дня (на первых уровнях — случайную 🎲). 3) Жми «Плавить» — день станет Светом, советом и дарами.',soul:true},
  result:{t:'Свет дня',h:'Свет = твой текст + выполненные намерения + линзы + доверие Даймона. Ниже — дары дня (миф, артефакт, трек, аюрведа…). Жми «Прожито», чтобы вписать день в Летопись.'},
  plan:{t:'Намерения',h:'Заяви намерение, выполни — и получи бонус Света от агента-покровителя. Это ежедневный ритм твоего пути.'},
  chron:{t:'Летопись',h:'365 дней — твоя книга. Каждый прожитый день = клетка. Чем больше Света, тем ярче клетка.'},
  daimon:{t:'Твой Даймон',h:'Дух-спутник, рождённый из накшатры твоей Луны. Он говорит твоей стихией; доверие растёт за честные записи и со временем меняет его облик.'}
};

function styleOnce(){
  if($('tutor-style'))return;
  var st=document.createElement('style');st.id='tutor-style';
  st.textContent=".tutor-hint{position:relative;border:1px solid rgba(201,168,76,.32);border-radius:14px;padding:12px 36px 12px 14px;margin:10px 0 6px;background:linear-gradient(160deg,rgba(123,98,201,.16),rgba(201,168,76,.06));animation:fade .4s ease}.tutor-hint .th-t{font-family:'Cinzel',serif;color:var(--spark);font-size:14px;margin-bottom:5px}.tutor-hint .th-h{font-size:14px;line-height:1.5;color:#e6e1f2}.tutor-hint .th-x{position:absolute;top:7px;right:7px;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;padding:4px;line-height:1}.tutor-hint .th-soul{margin-top:10px;background:rgba(201,168,76,.14);border:1px solid rgba(201,168,76,.42);color:var(--gold);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.05em;padding:8px 14px;border-radius:10px;cursor:pointer}#tutorToggle{position:absolute;right:14px;bottom:78px;z-index:9500;width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:rgba(5,5,13,.92);color:var(--gold);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.45);transition:.2s}#tutorToggle.off{color:var(--muted);opacity:.55}.ti-area{width:100%;box-sizing:border-box;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:10px;font-family:'Cormorant Garamond',serif;font-size:15px;min-height:60px;margin:4px 0 12px;resize:vertical}.soul-tg{display:flex;align-items:center;gap:8px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:11px;margin:2px 0 12px;cursor:pointer}";
  document.head.appendChild(st);
}

function injectHint(name){
  if(!hintsOn())return;
  var scr=$('s-'+name);if(!scr)return;
  var info=HINTS[name];if(!info)return;
  if(seen().indexOf(name)>=0)return;
  if(scr.querySelector('.tutor-hint'))return;
  var card=document.createElement('div');card.className='tutor-hint';
  card.innerHTML='<button class="th-x" title="Скрыть">✕</button>'
    +'<div class="th-t">💡 '+info.t+'</div>'
    +'<div class="th-h">'+info.h+'</div>'
    +(info.soul?'<button class="th-soul">✍️ Свиток Души</button>':'');

  /* ВАЖНО: подсказка должна быть под центральной сферой, чтобы сфера не "прыгала" */
  var anchor=null;
  if(name==='istok' || name==='tigel') anchor=scr.querySelector('.orb-wrap');
  else if(name==='daimon') anchor=scr.querySelector('.dm-hero');

  if(anchor && anchor.parentNode){
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  } else {
    var h1=scr.querySelector('h1');
    if(h1) scr.insertBefore(card,h1.nextSibling);
    else scr.insertBefore(card,scr.firstChild);
  }

  card.querySelector('.th-x').onclick=function(){markSeen(name);card.remove();};
  var sb=card.querySelector('.th-soul');if(sb)sb.onclick=openSoul;
}

function ensureToggle(){
  if($('tutorToggle'))return;
  var b=document.createElement('button');b.id='tutorToggle';b.title='Подсказки вкл/выкл';b.textContent='💡';
  (document.querySelector('.phone')||document.body).appendChild(b);
  b.style.cssText='position:absolute!important;right:14px!important;bottom:78px!important;z-index:9500!important;display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;width:42px;height:42px;border-radius:50%;align-items:center;justify-content:center;';
  b.onclick=toggleHints;updateToggleUI();
}
function updateToggleUI(){var b=$('tutorToggle');if(b)b.classList.toggle('off',!hintsOn());}
function toggleHints(){
  var on=!hintsOn();lsSet(HKEY,on?'1':'0');
  if(on){clearSeen();var a=document.querySelector('.screen.active');if(a)injectHint(a.id.replace('s-',''));toast('Подсказки включены');}
  else{var hs=document.querySelectorAll('.tutor-hint');for(var i=0;i<hs.length;i++)hs[i].remove();toast('Подсказки выключены');}
  updateToggleUI();
}

function ensureSoulModal(){
  if($('soulModal'))return;
  var m=document.createElement('div');m.id='soulModal';m.className='libmodal';
  m.innerHTML='<div class="libcard awara-glass-card" style="text-align:left;max-height:86vh;overflow:auto">'
    +'<div class="libglyph" style="text-align:center">🜂</div>'
    +'<h2 style="margin-top:6px;text-align:center">Свиток Души</h2>'
    +'<p class="sub" style="text-align:center;margin-bottom:12px">Кто ты, откуда и куда идёшь. Это сохранится и пойдёт с тобой по всей игре.</p>'
    +'<span class="label">Прошлое · откуда я, кем я был</span><textarea id="soulPast" class="ti-area" placeholder="Я родом из… за моей спиной…"></textarea>'
    +'<span class="label">Настоящее · кто я сейчас, что важно</span><textarea id="soulPresent" class="ti-area" placeholder="Сейчас я… для меня важно…"></textarea>'
    +'<span class="label">Будущее · куда и зачем я иду</span><textarea id="soulFuture" class="ti-area" placeholder="Я иду к… чтобы…"></textarea>'
    +'<button class="btn awara-gold-button" id="soulSave">Запечатать свиток</button>'
    +'<label class="soul-tg"><input type="checkbox" id="soulPromptChk"> Предлагать заполнять при первом входе в Тигель</label>'
    +'<button class="btn ghost" id="soulClose">Закрыть</button>'
    +'</div>';
  (document.querySelector('.phone')||document.body).appendChild(m);
  $('soulClose').onclick=closeSoul;
  $('soulSave').onclick=saveSoulFromUI;
  m.onclick=function(e){if(e.target===m)closeSoul();};
}
function openSoul(){ensureSoulModal();var s=getSoul();$('soulPast').value=s.past||'';$('soulPresent').value=s.present||'';$('soulFuture').value=s.future||'';$('soulPromptChk').checked=lsGet(SOULPROMPT,'1')!=='0';$('soulModal').classList.add('open');}
function closeSoul(){var m=$('soulModal');if(m)m.classList.remove('open');}
function saveSoulFromUI(){
  var o={past:($('soulPast').value||'').trim(),present:($('soulPresent').value||'').trim(),future:($('soulFuture').value||'').trim(),savedAt:new Date().toISOString()};
  setSoul(o);lsSet(SOULPROMPT,$('soulPromptChk').checked?'1':'0');lsSet(OFFERED,'1');
  closeSoul();toast('Свиток Души запечатан');try{renderSoulCard();}catch(e){}
}

function renderSoulCard(){
  var istok=$('s-istok');if(!istok)return;
  var card=$('soulCard');
  if(!card){card=document.createElement('div');card.id='soulCard';card.className='card awara-glass-card';card.style.marginTop='4px';
    var btn=istok.querySelector('button.btn');if(btn)istok.insertBefore(card,btn);else istok.appendChild(card);}
  var s=getSoul();var filled=s.past||s.present||s.future;
  card.innerHTML='<span class="label">Свиток Души</span>'+(filled
    ?'<p class="sub" style="font-size:14px;margin-top:4px">'+esc((s.present||s.past||s.future)).slice(0,130)+'…</p><button class="btn ghost soul-open" style="margin-top:8px">Открыть свиток</button>'
    :'<p class="sub" style="font-size:14px;margin-top:4px">Запиши, кто ты: прошлое, настоящее, будущее. Это твой якорь на пути.</p><button class="btn awara-gold-button soul-open" style="margin-top:8px">Заполнить свиток</button>');
  var ob=card.querySelector('.soul-open');if(ob)ob.onclick=openSoul;
}

function maybeOfferSoul(){
  if(lsGet(SOULPROMPT,'1')==='0')return;
  if(lsGet(OFFERED,'0')==='1')return;
  var s=getSoul();if(s.past||s.present||s.future){lsSet(OFFERED,'1');return;}
  lsSet(OFFERED,'1');setTimeout(openSoul,600);
}

function onScreen(name){try{injectHint(name);}catch(e){}if(name==='istok'){try{renderSoulCard();}catch(e){}}if(name==='tigel'){maybeOfferSoul();}}

if(typeof window.go==='function'){var _go=window.go;window.go=function(name){var r=_go.apply(this,arguments);onScreen(name);return r;};}
if(typeof window.renderIstok==='function'){var _ri=window.renderIstok;window.renderIstok=function(){var r=_ri.apply(this,arguments);try{renderSoulCard();}catch(e){}return r;};}
if(typeof window.aiContext==='function'){var _ac=window.aiContext;window.aiContext=function(){var base=_ac.apply(this,arguments);try{var s=getSoul();var p=[];if(s.past)p.push('прошлое — '+s.past);if(s.present)p.push('настоящее — '+s.present);if(s.future)p.push('будущее — '+s.future);if(p.length)base+='Свиток Души игрока: '+p.join('; ')+'. ';}catch(e){}return base;};}

function boot(){
  styleOnce();ensureToggle();setInterval(ensureToggle,2000);
  try{renderSoulCard();}catch(e){}
  try{var nav=document.querySelectorAll('.nav button');for(var i=0;i<nav.length;i++){(function(btn){btn.addEventListener('click',function(){var nm=btn.getAttribute('data-nav');setTimeout(function(){onScreen(nm);},0);});})(nav[i]);}}catch(e){}
  var a=document.querySelector('.screen.active');if(a)onScreen(a.id.replace('s-',''));
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}

window.AwaraTutor={openSoul:openSoul,toggleHints:toggleHints,getSoul:getSoul,__ready:true};
})();
