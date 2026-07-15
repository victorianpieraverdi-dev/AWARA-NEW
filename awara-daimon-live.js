/* AWARA · Живой Даймон. v2 — Даймон говорит живым голосом (DeepSeek) на экране Даймона.
   v2: человеческий язык (awaraHumanVoice) + двуязычные подписи (RU/EN), реакция на awara:lang.
   Кэш по sig() — не дёргает ИИ без нужды. */
(function(){
'use strict';
if(window.AwaraDaimonLive && window.AwaraDaimonLive.__ready) return;
function $(id){ return document.getElementById(id); }
var CUR=''; var MODE=''; var LASTTXT='';

function lng(){ try{ if(typeof window.awaraLang==='function') return window.awaraLang(); if(window.AwaraI18n && AwaraI18n.lang) return AwaraI18n.lang; }catch(e){} return 'ru'; }
function L(ru,en){ return lng()==='en'?en:ru; }
function hv(s){ try{ if(typeof window.awaraHumanVoice==='function') return s+'\n\n'+window.awaraHumanVoice(); }catch(e){} return s; }

function nm(){ try{ if(typeof STATE!=='undefined' && STATE && STATE.daimon && STATE.daimon.name) return STATE.daimon.name; }catch(e){} return L('Ардвен','Ardven'); }
function trust(){ try{ if(typeof STATE!=='undefined' && STATE && typeof STATE.trust==='number') return STATE.trust; }catch(e){} return 0; }
function advice(){ try{ if(typeof STATE!=='undefined' && STATE && STATE.advice) return STATE.advice; }catch(e){} return ''; }
function jlen(){ try{ if(typeof STATE!=='undefined' && STATE && STATE.journal) return STATE.journal.length; }catch(e){} return 0; }
function effForm(){ try{ if(typeof window.effForm==='function') return window.effForm(); }catch(e){} return ''; }
function sig(){ return jlen()+'|'+trust()+'|'+(advice()||'').slice(0,80)+'|'+effForm()+'|'+lng(); }

function styleOnce(){
  if($('dl-style')) return;
  var st=document.createElement('style'); st.id='dl-style';
  st.textContent="#dl-live{border:1px solid rgba(123,98,201,.4);background:linear-gradient(165deg,rgba(123,98,201,.18),rgba(201,168,76,.05));margin-top:16px}#dl-live .dl-h{display:flex;align-items:center;justify-content:space-between;gap:8px}#dl-live .dl-rg{background:none;border:1px solid var(--line);color:var(--muted);border-radius:8px;font-size:11px;padding:3px 9px;cursor:pointer;font-family:'JetBrains Mono',monospace}#dl-live .dl-rg:hover{color:var(--violet-soft);border-color:rgba(123,98,201,.6)}#dl-live .dl-load{color:var(--violet-soft);font-style:italic;animation:dlpulse 1.4s ease-in-out infinite}@keyframes dlpulse{0%,100%{opacity:.45}50%{opacity:.95}}#dl-live .dl-body p:first-child{margin-top:6px}";
  document.head.appendChild(st);
}

function ensureCard(){
  var sd=$('s-daimon'); if(!sd) return null;
  var card=$('dl-live');
  if(!card){ card=document.createElement('div'); card.id='dl-live'; card.className='card awara-glass-card'; var hero=sd.querySelector('.dm-hero'); if(hero && hero.parentNode){ if(hero.nextSibling) hero.parentNode.insertBefore(card, hero.nextSibling); else hero.parentNode.appendChild(card); } else { sd.appendChild(card); } }
  return card;
}

function hdrText(){ if(MODE==='load') return nm()+L(' вслушивается…',' is listening…'); return nm()+L(' говорит',' speaks'); }
function regenBtn(){ return '<button class="dl-rg" title="'+L('Сказать иначе','Say it differently')+'">'+L('↻ ещё','↻ again')+'</button>'; }
function bindRg(card){ var rg=card.querySelector('.dl-rg'); if(rg) rg.onclick=function(){ run(true); }; }

function prompt(){
  var p='Ты — Даймон по имени '+nm()+', живой внутренний спутник игрока в игре AWARA.\n';
  p+='Уровень доверия между вами: '+trust()+' из 100. ';
  var f=effForm(); if(f) p+='Сейчас ты явлен в форме: '+f+'. ';
  var a=advice(); if(a) p+='\n\nПоследнее живое слово Тигля игроку:\n«'+a.slice(0,600)+'»\n';
  var j=jlen(); p+='\nВ летописи игрока '+j+' вписанных дней.\n\n';
  p+='Обратись к игроку напрямую, одним-двумя короткими абзацами. ';
  p+='Говори живо и лично, как спутник, который видит этого человека. Тёпло, без пафоса и без заголовков. ';
  if(trust()<30) p+='Доверие пока хрупкое — будь бережным и немного сдержанным.';
  else if(trust()>=80) p+='Доверие глубокое — можешь говорить откровенно и близко.';
  return p;
}

function paint(card){
  if(MODE==='load'){ card.innerHTML='<div class="dl-h"><span class="label">'+hdrText()+'</span></div><p class="adv dl-load">'+nm()+L(' вслушивается в твой день…',' is listening to your day…')+'</p>'; return; }
  if(MODE==='err'){ card.innerHTML='<div class="dl-h"><span class="label">'+hdrText()+'</span>'+regenBtn()+'</div><p class="adv" style="font-size:13px;opacity:.8">'+nm()+L(' молчит — нет связи с ИИ. Проверь, что запущен «Запустить-ИИ.bat».',' is silent — no connection to the AI. Make sure the local AI server is running.')+'</p>'; bindRg(card); return; }
  var body; try{ body=(typeof window.aiMd==='function')?window.aiMd(LASTTXT):('<p class="adv">'+LASTTXT+'</p>'); }catch(e){ body='<p class="adv">'+LASTTXT+'</p>'; }
  card.innerHTML='<div class="dl-h"><span class="label">'+hdrText()+'</span>'+regenBtn()+'</div><div class="dl-body">'+body+'</div>';
  bindRg(card);
}

function run(force){
  var card=ensureCard(); if(!card) return;
  if(typeof window.aiCall!=='function' || typeof window.aiSystem!=='function'){ if(card.parentNode) card.parentNode.removeChild(card); return; }
  var s=sig();
  if(!force){
    if(LASTTXT && CUR===s){ MODE='done'; paint(card); return; }
    try{ var raw=localStorage.getItem('awara_daimon_live'); if(raw){ var o=JSON.parse(raw); if(o && o.sig===s && o.txt){ LASTTXT=o.txt; CUR=s; MODE='done'; paint(card); return; } } }catch(e){}
  }
  MODE='load'; paint(card);
  var sys; try{ sys=window.aiSystem('daimon'); }catch(e){ try{ sys=window.aiSystem(); }catch(e2){ sys='You are the living Daimon companion in the AWARA game.'; } }
  sys=hv(sys);
  window.aiCall([{role:'system',content:sys},{role:'user',content:prompt()}]).then(function(txt){
    LASTTXT=(''+txt).replace(/\s+$/,''); CUR=s; MODE='done'; paint(card);
    try{ localStorage.setItem('awara_daimon_live', JSON.stringify({sig:s, txt:LASTTXT})); }catch(e){}
  }).catch(function(e){ MODE='err'; paint(card); });
}

function relabel(){ var c=$('dl-live'); if(!c) return; if(MODE==='done'){ run(false); return; } paint(c); }

function wireNav(){ var btns=document.querySelectorAll('.nav button[data-nav="daimon"]'); for(var i=0;i<btns.length;i++){ var b=btns[i]; if(b.getAttribute('data-dl')==='1') continue; b.setAttribute('data-dl','1'); b.addEventListener('click', function(){ setTimeout(function(){ run(false); }, 300); }, false); } }

function boot(){ try{ styleOnce(); }catch(e){} wireNav(); try{ window.addEventListener('awara:lang', relabel, false); }catch(e){} var sd=$('s-daimon'); if(sd && (''+sd.className).indexOf('active')>=0){ setTimeout(function(){ run(false); }, 300); } }
window.AwaraDaimonLive={ run:run, __ready:true };
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,200); }); }
else { setTimeout(boot,200); }
setTimeout(wireNav,800); setTimeout(wireNav,1700);
})();
