/* ============================================================
   AWARA · QUEST LAYER (v1)
   Шаг 3: Задания от линз.
   На экране «План» появляются дневные задания, рождённые из линз
   игрока. Выполнение задания гранит свою линзу (рост чёткости из Шага 2)
   и даёт немного Света. Аддитивно, движок не тронут; состояние в STATE.quests.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraQuests) return; window.__awaraQuests=true;

/* ---- стили ---- */
try{
  if(!document.querySelector('style[data-awara-quests]')){
    var st=document.createElement('style');
    st.setAttribute('data-awara-quests','1');
    st.textContent=`
#lensQuests .lq-progress{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.06em;margin:2px 0 12px;text-transform:uppercase}
#lensQuests .lq-item{display:flex;align-items:flex-start;gap:11px;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;background:rgba(255,255,255,.025);transition:.25s}
#lensQuests .lq-item:last-child{margin-bottom:0}
#lensQuests .lq-item.done{opacity:.6;border-color:var(--gold)}
#lensQuests .lq-chk{width:26px;height:26px;border-radius:8px;border:1.5px solid var(--gold);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:15px;color:#0a0a14;cursor:pointer;transition:.2s;margin-top:2px}
#lensQuests .lq-item.done .lq-chk{background:linear-gradient(120deg,var(--gold),var(--spark))}
#lensQuests .lq-body{flex:1;min-width:0}
#lensQuests .lq-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
#lensQuests .lq-head .lq-gl{font-size:18px;flex:0 0 auto}
#lensQuests .lq-head b{font-family:'Cinzel',serif;color:#fff;font-size:15px;font-weight:500}
#lensQuests .lq-head .lq-cl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);border-radius:20px;padding:2px 7px}
#lensQuests .lq-task{color:#d7d2e8;font-size:15px;line-height:1.4;margin-top:6px}
#lensQuests .lq-item.done .lq-task{text-decoration:line-through;color:var(--muted)}
#lensQuests .lq-rw{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--gold);flex:0 0 auto;text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
`;
    document.head.appendChild(st);
  }
}catch(e){}

/* ---- доступ к движку ---- */
function S(){ try{ return STATE; }catch(e){ return null; } }
function MX(){ try{ return MATRIX; }catch(e){ return null; } }
function MK(){ try{ return MATKEYS; }catch(e){ return []; } }
function saveState(){ try{ if(typeof save==='function') save(); }catch(e){} }

var CLAR=['Тусклая','Проявленная','Чёткая','Гранёная','Сияющая'];
function clarityTier(uses){ uses=uses||0; return uses>=12?4:uses>=7?3:uses>=4?2:uses>=1?1:0; }

var FRAME={
  'Огонь':'Соверши одно смелое действие в духе этой линзы',
  'Вода':'Побудь в потоке и мягко проживи это',
  'Земля':'Сделай это телом, в материи, по-настоящему',
  'Воздух':'Проясни мыслью и скажи вслух',
  'Эфир':'Удержи это как тихое присутствие в течение дня'
};
function questText(m){ if(!m) return 'Проживи день осознанно.'; return (FRAME[m[1]]||'Проживи это сегодня')+': «'+m[3]+'»'; }

function ensureLenses(){ var s=S(); if(!s) return; if(!s.lenses||typeof s.lenses!=='object') s.lenses={}; }
function grantLens(k){ var s=S(); if(!s) return; ensureLenses(); var L=s.lenses[k]||(s.lenses[k]={uses:0,xp:0,clarity:0}); L.uses+=1; L.xp+=15; L.clarity=clarityTier(L.uses); }

/* ---- выбор линз для заданий ---- */
function pickLenses(){
  var s=S(); var MAT=MX(); var KEYS=MK(); if(!s||!MAT) return [];
  ensureLenses();
  var used=Object.keys(s.lenses||{}).filter(function(k){return s.lenses[k]&&s.lenses[k].uses>0&&MAT[k];});
  used.sort(function(a,b){return s.lenses[b].uses-s.lenses[a].uses;});
  var picks=[]; used.slice(0,2).forEach(function(k){picks.push(k);});
  var day=(s.days?s.days.length:0); var i=0;
  while(picks.length<3 && KEYS.length && i<KEYS.length*2){ var k=KEYS[(day*7+i*13)%KEYS.length]; if(k&&picks.indexOf(k)<0) picks.push(k); i++; }
  return picks.slice(0,3);
}

function ensureQuests(){
  var s=S(); var MAT=MX(); if(!s||!MAT) return;
  var day=(s.days?s.days.length:0);
  if(!s.quests || s.quests.day!==day || !Array.isArray(s.quests.items) || !s.quests.items.length){
    var picks=pickLenses();
    s.quests={day:day, items:picks.map(function(k){var m=MAT[k]; return {lens:k, glyph:m?m[0]:'\ud83d\udd2e', el:m?m[1]:'Эфир', voice:m?m[3]:'', text:questText(m), done:false};})};
    saveState();
  }
}

/* ---- хост на экране План ---- */
function ensureHost(){
  var ex=document.getElementById('lensQuests'); if(ex) return ex;
  var plan=document.getElementById('s-plan'); if(!plan) return null;
  var host=document.createElement('div'); host.id='lensQuests'; host.className='card awara-glass-card'; host.style.marginTop='18px';
  var addrow=plan.querySelector('.addrow');
  if(addrow){ plan.insertBefore(host, addrow.nextSibling); } else { plan.appendChild(host); }
  return host;
}

function render(){
  var s=S(); if(!s) return; ensureQuests();
  var host=ensureHost(); if(!host) return;
  var items=(s.quests&&s.quests.items)||[];
  var done=items.filter(function(x){return x.done;}).length;
  var h='<span class="label">Задания от линз</span>';
  h+='<p class="sub" style="font-size:13px;margin:4px 0 2px">Каждое выполненное задание гранит свою линзу — растит её чёткость в Тигле и Духовный портрет.</p>';
  h+='<div class="lq-progress">Выполнено '+done+' / '+items.length+'</div>';
  items.forEach(function(q,i){
    var L=(s.lenses&&s.lenses[q.lens])||{uses:0};
    var cl=CLAR[clarityTier(L.uses)];
    h+='<div class="lq-item'+(q.done?' done':'')+'" data-i="'+i+'">'
      +'<div class="lq-chk">'+(q.done?'\u2713':'')+'</div>'
      +'<div class="lq-body"><div class="lq-head"><span class="lq-gl">'+q.glyph+'</span><b>'+q.lens+'</b><span class="lq-cl">'+cl+'</span></div>'
      +'<div class="lq-task">'+q.text+'</div></div>'
      +'<div class="lq-rw">+чёткость</div></div>';
  });
  host.innerHTML=h;
  host.querySelectorAll('.lq-chk').forEach(function(el){ el.onclick=function(){ var it=el.closest('.lq-item'); if(it) complete(parseInt(it.getAttribute('data-i'),10)); }; });
}

function complete(i){
  var s=S(); if(!s) return; ensureQuests();
  var q=s.quests.items[i]; if(!q||q.done) return;
  q.done=true; grantLens(q.lens);
  s.lightBonus=(s.lightBonus||0)+1;
  var allDone=s.quests.items.every(function(x){return x.done;});
  if(allDone) s.lightBonus+=2;
  saveState();
  render();
  try{ if(typeof window.renderDeck==='function'){ var ms=document.getElementById('mSearch'); window.renderDeck(ms?ms.value:''); } }catch(e){}
  try{ if(typeof window.renderIstok==='function') window.renderIstok(); }catch(e){}
  try{ if(typeof updateLight==='function') updateLight(); }catch(e){}
  try{ if(typeof showToast==='function') showToast(allDone?'Все задания дня выполнены · +Свет и чёткость':('Линза «'+q.lens+'» гранится · +1 использование')); }catch(e){}
}

/* ---- перерисовка при заходе на План ---- */
try{ document.querySelectorAll('.nav button[data-nav="plan"]').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(function(){ try{render();}catch(e){} }, 40); }); }); }catch(e){}
if(typeof window.go==='function'){
  var _go=window.go;
  window.go=function(name){ var r=_go.apply(this,arguments); if(name==='plan'){ try{render();}catch(e){} } return r; };
}

/* ---- первичный прогон ---- */
try{ ensureQuests(); render(); }catch(e){}

})();
