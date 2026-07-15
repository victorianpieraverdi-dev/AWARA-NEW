/* AWARA · Живой ответ Тигля. v3 — после плавки Тигель отвечает живым словом (DeepSeek)
   + живая оценка Света. v3: человеческий язык (awaraHumanVoice) + двуязычные подписи (RU/EN).
   Аддитивно: движок не трогает, переиспользует aiCall/aiSystem/aiMd/updateLight. */
(function(){
'use strict';
if(window.AwaraTigelLive && window.AwaraTigelLive.__ready) return;
function $(id){ return document.getElementById(id); }
var LASTDAY=''; var MODE='';

function lng(){ try{ if(typeof window.awaraLang==='function') return window.awaraLang(); if(window.AwaraI18n && AwaraI18n.lang) return AwaraI18n.lang; }catch(e){} return 'ru'; }
function L(ru,en){ return lng()==='en'?en:ru; }
function hv(s){ try{ if(typeof window.awaraHumanVoice==='function') return s+'\n\n'+window.awaraHumanVoice(); }catch(e){} return s; }

function styleOnce(){
  if($('tl-style')) return;
  var st=document.createElement('style'); st.id='tl-style';
  st.textContent="#tl-live{border:1px solid rgba(201,168,76,.4);background:linear-gradient(165deg,rgba(123,98,201,.16),rgba(201,168,76,.07))}#tl-live .tl-h{display:flex;align-items:center;justify-content:space-between;gap:8px}#tl-live .tl-rg{background:none;border:1px solid var(--line);color:var(--muted);border-radius:8px;font-size:11px;padding:3px 9px;cursor:pointer;font-family:'JetBrains Mono',monospace}#tl-live .tl-rg:hover{color:var(--gold);border-color:rgba(201,168,76,.5)}#tl-live .tl-load{color:var(--spark);font-style:italic;animation:tlpulse 1.4s ease-in-out infinite}@keyframes tlpulse{0%,100%{opacity:.45}50%{opacity:.95}}#tl-live .tl-body p:first-child{margin-top:6px}";
  document.head.appendChild(st);
}

function adviceCard(){ var a=$('adviceText'); if(!a) return null; var c=a; while(c && c!==document.body){ if(c.className && (''+c.className).indexOf('card')>=0) return c; c=c.parentNode; } return null; }

function ensureCard(){
  var res=$('s-result'); if(!res) return null;
  var card=$('tl-live');
  if(!card){ card=document.createElement('div'); card.id='tl-live'; card.className='card awara-glass-card'; var ac=adviceCard(); if(ac && ac.parentNode){ ac.parentNode.insertBefore(card, ac); } else { res.appendChild(card); } }
  return card;
}

function hdrText(){ if(MODE==='load') return L('🔥 Тигель оживает…','🔥 The Crucible awakens…'); if(MODE==='err') return L('🔥 Живое слово Тигля','🔥 Living word of the Crucible'); return L('🔥 Живое слово Тигля · из твоих линз','🔥 Living word of the Crucible · from your lenses'); }
function regenBtn(){ return '<button class="tl-rg" title="'+L('Сказать иначе','Say it differently')+'">'+L('↻ ещё','↻ again')+'</button>'; }
function bindRg(card){ var rg=card.querySelector('.tl-rg'); if(rg) rg.onclick=function(){ render(LASTDAY); }; }

function dayPrompt(t){
  t=(t||'').trim();
  var lenses=[]; try{ if(typeof lensVoices==='function') lenses=lensVoices()||[]; }catch(e){}
  var ln=lenses.map(function(x){ return x.name; }).join(', ');
  var p='Игрок только что переплавил свой день в Тигле — алхимическом очаге осознанности.\n\n';
  if(t) p+='Его запись о прожитом дне:\n«'+t+'»\n\n';
  else p+='Игрок пришёл к Тиглю молча, не записав ни слова о дне. Мягко прими это молчание.\n\n';
  p+='Ответь как ЖИВОЙ ТИГЕЛЬ — алхимический голос-зеркало, обращайся к игроку напрямую. Это не общий совет, а живой отклик именно на этот день:\n';
  p+='1) Прими прожитое и назови, что здесь Свет (зерно осознанности), а что — Тень для переплавки.\n';
  p+=(ln ? ('2) Посмотри на день сквозь выбранные линзы ('+ln+') — пусть зазвучит их живое слово.\n') : '2) Загляни глубже самих слов, в суть дня.\n');
  p+='3) Заверши одним тёплым зерном — вопросом или маленьким действием на завтра.\n\n';
  p+='2-3 коротких абзаца, без заголовков.';
  p+='\n\nВ САМОМ КОНЦЕ, отдельной строкой, добавь скрытую оценку Света этого дня числом от 0 до 100 строго в формате «СВЕТ: NN» (NN отражает глубину осознанности, присутствия и роста в дне). Эту строку игрок не увидит — она для движка.';
  return p;
}

function render(dayText){
  LASTDAY=dayText;
  var card=ensureCard(); if(!card) return;
  if(typeof window.aiCall!=='function' || typeof window.aiSystem!=='function'){ if(card.parentNode) card.parentNode.removeChild(card); return; }
  var ac=adviceCard(); if(ac) ac.style.display='';
  MODE='load';
  card.innerHTML='<div class="tl-h"><span class="label">'+hdrText()+'</span></div><p class="adv tl-load">'+L('Тигель принимает твой день и плавит его в живое слово…','The Crucible takes your day and smelts it into a living word…')+'</p>';
  var sys; try{ sys=window.aiSystem(); }catch(e){ sys='You are the living Crucible of the AWARA game. Answer warmly and poetically.'; }
  sys=hv(sys);
  var userMsg=dayPrompt(dayText);
  try{ if(window.AwaraLivingLibrary && typeof AwaraLivingLibrary.augmentPrompt==='function'){ userMsg=AwaraLivingLibrary.augmentPrompt(userMsg); } }catch(e){}
  window.aiCall([{role:'system',content:sys},{role:'user',content:userMsg}]).then(function(txt){
    var lv=null; var lines=(''+txt).split(/\n/); var keep=[];
    for(var i=0;i<lines.length;i++){ if(/^\s*\u0421\u0412\u0415\u0422[\s:\u2014\-]*[0-9]/i.test(lines[i]) || /^\s*LIGHT[\s:\u2014\-]*[0-9]/i.test(lines[i])){ var g=lines[i].match(/([0-9]{1,3})/); if(g){ lv=parseInt(g[1],10); } } else { keep.push(lines[i]); } }
    var src=(keep.join('\n').replace(/\s+$/,''))||(''+txt);
    var body; try{ body=(typeof window.aiMd==='function')?window.aiMd(src):('<p class="adv">'+src+'</p>'); }catch(e){ body='<p class="adv">'+src+'</p>'; }
    MODE='done';
    card.innerHTML='<div class="tl-h"><span class="label">'+hdrText()+'</span>'+regenBtn()+'</div><div class="tl-body">'+body+'</div>';
    bindRg(card);
    if(ac) ac.style.display='none';
    try{ if(typeof STATE!=='undefined' && STATE){ STATE.advice=src; if(lv!=null && lv>=0 && lv<=100){ STATE.baseLight=lv; if(typeof updateLight==='function'){ updateLight(); } } if(typeof save==='function'){ save(); } } }catch(e){}
  }).catch(function(e){
    MODE='err';
    card.innerHTML='<div class="tl-h"><span class="label">'+hdrText()+'</span>'+regenBtn()+'</div><p class="adv" style="font-size:13px;opacity:.8">'+L('Тигель не смог раскрыть живое слово — нет связи с ИИ. Ниже остаётся совет из твоих линз. Проверь, что запущен «Запустить-ИИ.bat».','The Crucible could not reveal a living word — no connection to the AI. Your lens advice remains below. Make sure the local AI server is running.')+'</p>';
    bindRg(card);
    if(ac) ac.style.display='';
  });
}

function relabel(){ var c=$('tl-live'); if(!c) return; var lab=c.querySelector('.tl-h .label'); if(lab) lab.textContent=hdrText(); var rg=c.querySelector('.tl-rg'); if(rg){ rg.textContent=L('↻ ещё','↻ again'); rg.title=L('Сказать иначе','Say it differently'); } }

function onMelt(){ var dt=''; try{ var ta=$('dayText'); dt=ta?ta.value:''; }catch(e){} setTimeout(function(){ render(dt); }, 1250); }

function wireBtn(){ var btn=$('meltBtn'); if(!btn) return; if(btn.getAttribute('data-tl')==='1') return; btn.setAttribute('data-tl','1'); btn.addEventListener('click', onMelt, false); }

function boot(){ try{ styleOnce(); }catch(e){} wireBtn(); try{ window.addEventListener('awara:lang', relabel, false); }catch(e){} }
window.AwaraTigelLive={ render:render, __ready:true };
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,180); }); }
else { setTimeout(boot,180); }
setTimeout(wireBtn,700); setTimeout(wireBtn,1600);
})();
