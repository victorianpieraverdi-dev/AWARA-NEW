/* ============================================================
   AWARA · КОЛЕСО ТИГЕЛЯ (v1)
   Шаг 4: рулетка матриц-линз с прогрессией.
   На экране «Тигель» — барабан из 33 матриц. Игрок крутит и получает
   линзу дня. Уровень растёт по числу освоенных матриц: сначала выпадает
   1 линза, далее 2, далее 3; на мастерстве — усложнение (колесо тянет
   редкие/новые матрицы + вызов сплести три линзы в одно действие).
   Выпавшие линзы — это дневные STATE.mats (та же колода, что и «Плавить»).
   Аддитивно: движок не тронут; прогресс в STATE.wheel.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraWheel) return; window.__awaraWheel=true;

function S(){ try{ return STATE; }catch(e){ return null; } }
function MX(){ try{ return MATRIX; }catch(e){ return null; } }
function MK(){ try{ return MATKEYS; }catch(e){ return []; } }
function saveState(){ try{ if(typeof save==='function') save(); }catch(e){} }
function POL(k){ try{ return (window.POLAR&&window.POLAR[k])||''; }catch(e){ return ''; } }
function POLS(k){ var p=POL(k); return p?p.split('⇄')[0].trim():''; }

/* ---- стили ---- */
try{
  if(!document.querySelector('style[data-awara-wheel]')){
    var st=document.createElement('style');
    st.setAttribute('data-awara-wheel','1');
    st.textContent=`
#tigelWheel .tw-lvl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin:2px 0 8px}
#tigelWheel .tw-bar{height:5px;border-radius:5px;background:rgba(255,255,255,.07);overflow:hidden;margin:6px 0 12px}
#tigelWheel .tw-bar i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--violet),var(--gold))}
#tigelWheel .tw-reel{position:relative;height:96px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:radial-gradient(circle at 50% 0%,rgba(123,98,201,.14),rgba(5,5,13,.6))}
#tigelWheel .tw-reel::before,#tigelWheel .tw-reel::after{content:"";position:absolute;top:0;bottom:0;width:54px;z-index:3;pointer-events:none}
#tigelWheel .tw-reel::before{left:0;background:linear-gradient(90deg,#070611,transparent)}
#tigelWheel .tw-reel::after{right:0;background:linear-gradient(270deg,#070611,transparent)}
#tigelWheel .tw-ptr{position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:13px solid var(--gold);z-index:6}
#tigelWheel .tw-frame{position:absolute;top:6px;bottom:6px;left:50%;transform:translateX(-50%);width:84px;border:1.5px solid var(--gold);border-radius:12px;z-index:5;pointer-events:none;box-shadow:0 0 18px rgba(201,168,76,.4)}
#tigelWheel .tw-strip{position:absolute;top:0;bottom:0;left:0;display:flex;align-items:center;gap:8px;will-change:transform}
#tigelWheel .tw-cell{flex:0 0 80px;width:80px;height:84px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px}
#tigelWheel .tw-cell .g{font-size:24px;line-height:1}
#tigelWheel .tw-cell .n{font-family:'Cinzel',serif;font-size:9.5px;color:#fff;margin-top:5px;line-height:1.1}
#tigelWheel .tw-cell .e{font-family:'JetBrains Mono',monospace;font-size:7.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:2px}
#tigelWheel .tw-picks{display:flex;flex-direction:column;gap:8px;margin-top:12px}
#tigelWheel .tw-pick{border:1px solid var(--line);border-radius:13px;padding:11px 12px;background:rgba(255,255,255,.025)}
#tigelWheel .tw-pick .h{display:flex;align-items:center;gap:8px}
#tigelWheel .tw-pick .h .g{font-size:20px}
#tigelWheel .tw-pick .h b{font-family:'Cinzel',serif;color:#fff;font-size:15px;font-weight:500}
#tigelWheel .tw-pick .h .e{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);border-radius:20px;padding:2px 7px;margin-left:auto}
#tigelWheel .tw-pick .pol{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.04em;text-transform:uppercase;color:var(--violet-soft);margin-top:6px}
#tigelWheel .tw-pick .v{font-style:italic;color:#d7d2e8;font-size:14.5px;line-height:1.4;margin-top:7px}
#tigelWheel .tw-chal{border:1px solid rgba(201,168,76,.4);border-radius:13px;padding:12px;margin-top:10px;background:linear-gradient(150deg,rgba(201,168,76,.12),rgba(123,98,201,.08))}
#tigelWheel .tw-chal .label{color:var(--spark)}
#tigelWheel .tw-row{display:flex;gap:8px}
#tigelWheel .tw-cell .g.tw-orb{position:relative;font-size:0;width:46px;height:46px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;margin:0 auto 2px;border:1px solid var(--line);background:radial-gradient(circle at 50% 38%,rgba(123,98,201,.2),rgba(5,5,13,.45))}
#tigelWheel .tw-pick .h .g.tw-orb{position:relative;font-size:0;width:34px;height:34px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:1px solid var(--line)}
#tigelWheel .g.tw-orb .lens-orb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
`;
    document.head.appendChild(st);
  }
}catch(e){}

/* ---- прогрессия ---- */
function exploredCount(){ var s=S(); if(!s||!s.lenses) return 0; return Object.keys(s.lenses).filter(function(k){return s.lenses[k]&&s.lenses[k].uses>0;}).length; }
function levelInfo(){
  var ex=exploredCount();
  var lvl = ex<2?1 : ex<6?2 : ex<12?3 : 4;
  var maxPicks = Math.min(lvl,3);
  var names={1:'Искра · 1 линза',2:'Поток · 2 линзы',3:'Сплав · 3 линзы',4:'Мастерство · усложнение'};
  var nextAt={1:2,2:6,3:12,4:null};
  var prevAt={1:0,2:2,3:6,4:12};
  return {ex:ex, lvl:lvl, maxPicks:maxPicks, name:names[lvl], nextAt:nextAt[lvl], prevAt:prevAt[lvl]};
}
function dayKey(s){ return (s&&s.days)?s.days.length:0; }
function ensureWheel(){ var s=S(); if(!s) return; var d=dayKey(s); if(!s.wheel || s.wheel.day!==d){ s.wheel={day:d, spins:0}; } }

/* ---- выбор матрицы ---- */
function chooseTarget(){
  var s=S(), KEYS=MK(); if(!s||!KEYS.length) return null;
  var taken=s.mats||[];
  var pool=KEYS.filter(function(k){return taken.indexOf(k)<0;});
  if(!pool.length) return null;
  var info=levelInfo();
  if(info.lvl>=4){
    pool.sort(function(a,b){ var ua=(s.lenses&&s.lenses[a]&&s.lenses[a].uses)||0; var ub=(s.lenses&&s.lenses[b]&&s.lenses[b].uses)||0; return ua-ub; });
    var slice=pool.slice(0, Math.max(3, Math.ceil(pool.length/3)));
    return slice[Math.floor(Math.random()*slice.length)];
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

/* ---- хост на экране Тигель ---- */
function ensureHost(){
  var ex=document.getElementById('tigelWheel'); if(ex) return ex;
  var tig=document.getElementById('s-tigel'); if(!tig) return null;
  var host=document.createElement('div'); host.id='tigelWheel'; host.className='card awara-glass-card'; host.style.marginTop='4px';
  var anchor=document.getElementById('lensGate') || tig.querySelector('.deck-head');
  if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(host, anchor); }
  else { var melt=document.getElementById('meltBtn'); if(melt && melt.parentNode){ melt.parentNode.insertBefore(host, melt); } else { tig.appendChild(host); } }
  return host;
}
function cellHtml(k){ var m=MX()[k]; return '<div class="tw-cell"><span class="g">'+(m?m[0]:'🔮')+'</span><span class="n">'+k+'</span><span class="e">'+(POLS(k)||(m?m[1]:''))+'</span></div>'; }

function paintCellOrb(gEl,key,tier){
  try{
    if(!gEl||!window.AwaraLens) return;
    var src=window.AwaraLens.orbSrc(key,tier); if(!src) return;
    if(gEl.getAttribute('data-orb')===src) return;
    gEl.setAttribute('data-orb',src); gEl.classList.add('tw-orb');
    window.AwaraLens.setOrbImg(gEl,src);
  }catch(e){}
}
function paintAllOrbs(){
  try{
    if(!window.AwaraLens) return;
    var host=document.getElementById('tigelWheel'); if(!host) return;
    host.querySelectorAll('.tw-cell').forEach(function(cell){
      var nm=cell.querySelector('.n'); var g=cell.querySelector('.g'); if(!nm||!g) return;
      var key=nm.textContent; paintCellOrb(g,key,window.AwaraLens.clarityTier(key));
    });
    host.querySelectorAll('.tw-pick .h').forEach(function(hh){
      var b=hh.querySelector('b'); var g=hh.querySelector('.g'); if(!b||!g) return;
      var key=b.textContent; paintCellOrb(g,key,window.AwaraLens.clarityTier(key));
    });
  }catch(e){}
}
var spinning=false;
function render(){
  var s=S(); if(!s) return; ensureWheel();
  var host=ensureHost(); if(!host) return;
  /* «Плавить» — сразу под Колесом, над колодой */
  try{ var _melt=document.getElementById('meltBtn'); if(_melt && host.parentNode && _melt!==host.nextSibling){ host.parentNode.insertBefore(_melt, host.nextSibling); } }catch(e){}
  var info=levelInfo();
  var picks=(s.mats||[]);
  var remaining=Math.max(0, info.maxPicks - picks.length);
  var KEYS=MK(); var MAT=MX();
  var barPct=100, hint='';
  if(info.nextAt){ barPct=Math.min(100, Math.round((info.ex-info.prevAt)/(info.nextAt-info.prevAt)*100)); hint='Освой ещё '+(info.nextAt-info.ex)+' матриц до следующего уровня'; }
  else { hint='Высший уровень — колесо тянет редкие матрицы'; }

  var h='<span class="label">Колесо Тигеля · рулетка линз</span>';
  h+='<div class="tw-lvl">Уровень '+info.lvl+' · '+info.name+'</div>';
  h+='<div class="tw-bar"><i style="width:'+barPct+'%"></i></div>';
  h+='<div class="tw-reel"><div class="tw-ptr"></div><div class="tw-frame"></div><div class="tw-strip" id="twStrip">'+KEYS.map(cellHtml).join('')+'</div></div>';
  h+='<p class="sub" style="font-size:12.5px;margin:10px 0 0;color:var(--muted)">'+hint+'. Сегодня выпадает до '+info.maxPicks+' линз. Можно также выбрать вручную в колоде ниже.</p>';

  if(picks.length){
    h+='<div class="tw-picks">';
    picks.forEach(function(k){ var m=MAT[k]; if(!m) return; h+='<div class="tw-pick"><div class="h"><span class="g">'+m[0]+'</span><b>'+k+'</b><span class="e">'+(POLS(k)||m[1])+'</span></div><div class="pol">'+(POL(k)||m[1])+'</div><div class="v">«'+m[3]+'»</div></div>'; });
    h+='</div>';
    if(info.lvl>=4 && picks.length>=3){
      var combo=picks.map(function(k){return (MAT[k]?MAT[k][0]+' ':'')+k;}).join(' + ');
      h+='<div class="tw-chal"><span class="label">Вызов мастерства</span><p class="sub" style="font-size:14px;margin-top:5px;color:#e6e1f2">Сплети три линзы — '+combo+' — в одно действие дня и проживи его как единый ритуал.</p></div>';
    }
  }

  h+='<div class="tw-row">';
  if(remaining>0){ h+='<button class="btn ghost" id="twSpin" style="flex:1">'+(picks.length?('Ещё линза · осталось '+remaining):'Крутить колесо')+'</button>'; }
  else { h+='<button class="btn ghost" id="twSpin" style="flex:1" disabled>Линзы дня собраны</button>'; }
  if(picks.length){ h+='<button class="btn ghost" id="twReset" style="flex:0 0 auto;width:auto;padding:0 18px">Сброс</button>'; }
  h+='</div>';

  host.innerHTML=h;
  var strip=document.getElementById('twStrip'); if(strip){ strip.style.transition='none'; strip.style.transform='translateX(0)'; }
  var sp=document.getElementById('twSpin'); if(sp&&remaining>0) sp.onclick=spin;
  var rs=document.getElementById('twReset'); if(rs) rs.onclick=resetPicks;
  try{paintAllOrbs();}catch(e){}
}

function spin(){
  if(spinning) return; var s=S(); if(!s) return;
  var target=chooseTarget(); if(!target){ try{showToast('Все матрицы уже выбраны');}catch(e){} return; }
  var KEYS=MK(); var idx=KEYS.indexOf(target); if(idx<0) idx=0;
  var strip=document.getElementById('twStrip'); var reel=strip?strip.parentNode:null; if(!strip||!reel) return;
  spinning=true;
  var sp=document.getElementById('twSpin'); if(sp) sp.disabled=true;
  var cellW=88;
  var N=KEYS.length, passes=5, targetPos=passes*N+idx;
  var html=''; for(var p=0;p<passes+2;p++){ html+=KEYS.map(cellHtml).join(''); }
  strip.innerHTML=html;
  try{paintAllOrbs();}catch(e){}
  var center=reel.clientWidth/2 - 40;
  var finalX=-(targetPos*cellW)+center;
  strip.style.transition='none'; strip.style.transform='translateX(0)';
  void strip.offsetWidth;
  strip.style.transition='transform 3.4s cubic-bezier(.12,.66,.18,1)';
  strip.style.transform='translateX('+finalX+'px)';
  setTimeout(function(){
    spinning=false;
    if(!s.mats) s.mats=[];
    var info=levelInfo();
    if(s.mats.indexOf(target)<0 && s.mats.length<info.maxPicks){ s.mats.push(target); }
    if(s.wheel) s.wheel.spins=(s.wheel.spins||0)+1;
    try{ if(window.AwaraLens&&AwaraLens.repaintOrb) AwaraLens.repaintOrb(); }catch(e){}
    saveState();
    try{ if(typeof renderDeck==='function'){ var ms=document.getElementById('mSearch'); renderDeck(ms?ms.value:''); } }catch(e){}
    try{ var m=MX()[target]; if(typeof showToast==='function') showToast('Линза дня · '+(m?m[0]+' ':'')+target); }catch(e){}
    render();
  }, 3550);
}

function resetPicks(){
  var s=S(); if(!s) return; s.mats=[]; saveState();
  try{ if(typeof renderDeck==='function'){ var ms=document.getElementById('mSearch'); renderDeck(ms?ms.value:''); } }catch(e){}
  render();
  try{ if(typeof showToast==='function') showToast('Линзы дня сброшены'); }catch(e){}
}

/* ---- перерисовка при заходе на Тигель ---- */
try{ document.querySelectorAll('.nav button[data-nav="tigel"]').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(function(){ try{render();}catch(e){} },40); }); }); }catch(e){}
if(typeof window.go==='function'){ var _go=window.go; window.go=function(name){ var r=_go.apply(this,arguments); if(name==='tigel'){ try{render();}catch(e){} } return r; }; }

/* ---- первичный прогон ---- */
try{ render(); }catch(e){}
try{ if(window.AwaraLens&&window.AwaraLens.whenReady){ window.AwaraLens.whenReady(function(){ try{paintAllOrbs();}catch(e){} }); } }catch(e){}

})();
