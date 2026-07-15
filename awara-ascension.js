/* ============================================================
   AWARA · ASCENSION ENV (v2)
   6-step "dimension of style" per matrix lens, driven by how deep
   the player explored that matrix (STATE.lenses[key].uses).
   Level 1 = raw physics / dim; level 6 = divine, heaven-on-earth.
   Transforms: (1) background "universe" behind the app, (2) section
   cards + UI accents, (3) a small level indicator. Plus a TEST panel
   to force any lens + level for previewing generated visuals.
   Palette from data/lens_styles.json via window.lensPalette.
   Additive, never breaks the engine. Comments/anchors ASCII only.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraAscension) return; window.__awaraAscension=true;

function S(){ try{ return STATE; }catch(e){ return null; } }
var FALLBACK=['#9d86e0','#ffd27a','#7b62c9'];

/* ---- styles ---- */
try{
  if(!document.querySelector('style[data-awara-asc]')){
    var st=document.createElement('style'); st.setAttribute('data-awara-asc','1');
    st.textContent=`
.phone{--lens-c0:#9d86e0;--lens-c1:#ffd27a;--lens-c2:#7b62c9;--lens-edge:rgba(201,168,76,.22);--lens-glow:rgba(157,134,224,.06);--lens-fill:rgba(157,134,224,.04)}
#awara-env{transition:background 1.4s ease, box-shadow 1.4s ease, opacity 1.4s ease}
.phone.asc-on .card{transition:border-color 1s ease, box-shadow 1s ease, background 1s ease}
.phone.asc-on .card:not(.awara-glass-card){border-color:var(--lens-edge);box-shadow:0 0 18px var(--lens-glow);background:linear-gradient(160deg,var(--lens-fill),rgba(255,255,255,.022))}
.phone.asc-on h2{color:var(--lens-c1);transition:color 1s ease}
.phone.asc-on .btn.ghost{border-color:var(--lens-edge);color:var(--lens-c1)}
.phone.asc-on .eyebrow{color:var(--lens-c1)}
.phone.asc-lv-5 .card:not(.awara-glass-card),.phone.asc-lv-6 .card:not(.awara-glass-card){box-shadow:0 0 26px var(--lens-glow),inset 0 0 22px var(--lens-fill)}
#asc-ind{position:absolute;top:14px;left:14px;z-index:41;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;color:var(--lens-c1);background:rgba(5,5,13,.5);border:1px solid var(--lens-edge);border-radius:20px;padding:4px 10px;display:none;gap:6px;align-items:center;pointer-events:none;backdrop-filter:blur(4px);max-width:62%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#asc-ind.on{display:flex}
#asc-ind .ag{font-size:11px;filter:drop-shadow(0 0 4px var(--lens-c1))}
#asc-ind b{color:#fff;font-weight:500}
#asc-test-btn{position:absolute;top:12px;right:14px;z-index:42;width:27px;height:27px;border-radius:50%;border:1px solid var(--lens-edge);background:rgba(5,5,13,.62);color:var(--lens-c1);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
#asc-test{position:absolute;top:46px;right:14px;z-index:42;width:214px;max-height:64%;overflow:auto;background:rgba(8,8,18,.95);border:1px solid var(--lens-edge);border-radius:14px;padding:11px;display:none;flex-direction:column;gap:8px;backdrop-filter:blur(6px);box-shadow:0 16px 40px rgba(0,0,0,.6)}
#asc-test.on{display:flex}
#asc-test .tt{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--lens-c1)}
#asc-test select{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--lens-edge);border-radius:9px;color:#ece9f5;font-family:'JetBrains Mono',monospace;font-size:11px;padding:7px;outline:none}
#asc-test .lvrow{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}
#asc-test .lvrow button{border:1px solid var(--lens-edge);background:rgba(255,255,255,.04);color:#ece9f5;border-radius:8px;padding:7px 0;font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer}
#asc-test .lvrow button.on{background:linear-gradient(120deg,var(--lens-c1),#ffd27a);color:#0a0a14;border-color:var(--lens-c1)}
#asc-test .lvl{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#8e88a4;letter-spacing:.04em;text-transform:uppercase;text-align:center}
#asc-test .clr{border:1px solid var(--lens-edge);background:transparent;color:var(--lens-c1);border-radius:9px;padding:7px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;cursor:pointer;text-transform:uppercase}
`;
    document.head.appendChild(st);
  }
}catch(e){}

function matKeys(){ try{ if(typeof MATKEYS!=='undefined'&&MATKEYS&&MATKEYS.length) return MATKEYS; }catch(e){} return []; }

var _force={on:false,key:null,lv:1};
function activeKey(){
  if(_force.on&&_force.key) return _force.key;
  var s=S(); if(!s) return null; var m=s.mats||[]; return m.length?m[m.length-1]:null;
}
function usesOf(key){ var s=S(); if(!s||!s.lenses||!key) return 0; var L=s.lenses[key]; return (L&&L.uses)?L.uses:0; }
function levelOf(uses){ uses=uses||0; return uses>=20?6:uses>=14?5:uses>=9?4:uses>=5?3:uses>=2?2:1; }
function ascLightFrac(){
  try{ if(typeof lightVal==='function'){ var v=lightVal(); if(typeof v==='number'&&!isNaN(v)) return Math.max(0,Math.min(1,v/100)); } }catch(e){}
  return 0;
}
function lightLevel(){ var f=ascLightFrac(); return f>=0.85?6:f>=0.65?5:f>=0.5?4:f>=0.3?3:f>=0.15?2:1; }
function effLevel(key){ if(_force.on&&_force.key===key) return _force.lv; return Math.max(levelOf(usesOf(key)),lightLevel()); }
function lightFactor(){
  try{ if(typeof lightVal==='function'){ var v=lightVal(); if(typeof v==='number'&&!isNaN(v)) return Math.max(0,Math.min(1,v/100)); } }catch(e){}
  var s=S(); if(s&&typeof s.baseLight==='number') return Math.max(0,Math.min(1,s.baseLight/100));
  return 0.5;
}
function palOf(key){ try{ if(typeof window.lensPalette==='function'){ var p=window.lensPalette(key); if(p&&p.length) return p; } }catch(e){} return FALLBACK; }
function hexA(hex,a){
  try{ var h=(''+hex).replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);
    if(isNaN(r)||isNaN(g)||isNaN(b)) return 'rgba(157,134,224,'+a+')';
    return 'rgba('+r+','+g+','+b+','+a+')';
  }catch(e){ return 'rgba(157,134,224,'+a+')'; }
}

function ensureLayer(){
  var el=document.getElementById('awara-env'); if(el) return el;
  var ph=document.querySelector('.phone')||document.body;
  el=document.createElement('div'); el.id='awara-env';
  el.style.cssText='position:absolute;inset:0;z-index:1;pointer-events:none;mix-blend-mode:screen;opacity:.9';
  if(ph===document.body){ el.style.position='fixed'; }
  if(ph.firstChild) ph.insertBefore(el,ph.firstChild); else ph.appendChild(el);
  return el;
}

var LV_NAME=['','\u0444\u0438\u0437\u0438\u043a\u0430','\u043f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u0435','\u0433\u0430\u0440\u043c\u043e\u043d\u0438\u044f','\u0441\u0438\u044f\u043d\u0438\u0435','\u0432\u043e\u0441\u0445\u043e\u0434','\u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435'];

function ensureChrome(){
  var ph=document.querySelector('.phone'); if(!ph) return;
  if(!document.getElementById('asc-ind')){
    var ind=document.createElement('div'); ind.id='asc-ind';
    ind.innerHTML='<span class="ag">\u25c8</span><b class="nm"></b><span class="lv"></span>';
    ph.appendChild(ind);
  }
  if(!document.getElementById('asc-test-btn')){
    var btn=document.createElement('button'); btn.id='asc-test-btn'; btn.type='button'; btn.title='Test lens / level'; btn.textContent='\u2699';
    btn.addEventListener('click',function(){ var p=document.getElementById('asc-test'); if(p) p.classList.toggle('on'); });
    ph.appendChild(btn);
    var panel=document.createElement('div'); panel.id='asc-test';
    var t1=document.createElement('div'); t1.className='tt'; t1.textContent='TEST \u2014 LENS'; panel.appendChild(t1);
    var sel=document.createElement('select'); sel.id='asc-test-sel';
    var keys=matKeys();
    keys.forEach(function(k){ var o=document.createElement('option'); o.value=k; o.textContent=k; sel.appendChild(o); });
    panel.appendChild(sel);
    var t2=document.createElement('div'); t2.className='tt'; t2.textContent='LEVEL 1\u20136'; panel.appendChild(t2);
    var row=document.createElement('div'); row.className='lvrow';
    for(var i=1;i<=6;i++){ (function(n){ var b=document.createElement('button'); b.type='button'; b.textContent=String(n); b.setAttribute('data-lv',String(n));
      b.addEventListener('click',function(){ var s=document.getElementById('asc-test-sel'); setForce(s?s.value:activeKey(),n); markLv(n); }); row.appendChild(b); })(i); }
    panel.appendChild(row);
    var lbl=document.createElement('div'); lbl.className='lvl'; lbl.id='asc-test-lvl'; lbl.textContent=''; panel.appendChild(lbl);
    var clr=document.createElement('button'); clr.className='clr'; clr.type='button'; clr.textContent='\u2715 LIVE (off test)';
    clr.addEventListener('click',function(){ clearForce(); markLv(0); }); panel.appendChild(clr);
    ph.appendChild(panel);
  }
}
function markLv(n){
  try{ var row=document.querySelectorAll('#asc-test .lvrow button'); row.forEach(function(b){ b.classList.toggle('on', String(n)===b.getAttribute('data-lv')); });
    var lbl=document.getElementById('asc-test-lvl'); if(lbl) lbl.textContent=n?('\u2192 '+LV_NAME[n]):''; }catch(e){}
}
function setForce(key,lv){
  if(!key) return; _force={on:true,key:key,lv:lv};
  try{ var s=S(); if(s){ s.mats=[key]; } }catch(e){}
  try{ if(window.AwaraLens&&AwaraLens.repaintOrb) AwaraLens.repaintOrb(); }catch(e){}
  _lastSig=''; tick();
}
function clearForce(){ _force={on:false,key:null,lv:1}; _lastSig=''; tick(); }

var _lastSig='';
function paint(){
  ensureChrome();
  var key=activeKey(); if(!key) return;
  var lv=effLevel(key);
  var lf=lightFactor();
  var sig=key+'|'+lv+'|'+Math.round(lf*10)+'|'+(_force.on?'F':'L');
  if(sig===_lastSig) return; _lastSig=sig;
  var pal=palOf(key);
  var c0=pal[0]||FALLBACK[0], c1=pal[1]||c0, c2=pal[2]||c1;
  /* (1) background universe */
  var a=0.10+0.055*lv+0.05*lf;
  var top='radial-gradient(125% 95% at 50% 16%, '+hexA(c1,a*1.05)+' 0%, '+hexA(c0,a)+' 40%, transparent 74%)';
  var bottom='radial-gradient(95% 75% at 50% 102%, '+hexA(c2,a*0.8)+' 0%, transparent 62%)';
  var layers=[top,bottom];
  if(lv>=4){ var gold=0.04*(lv-3); layers.unshift('radial-gradient(60% 50% at 50% 46%, rgba(255,210,122,'+gold+') 0%, transparent 60%)'); }
  var el=ensureLayer();
  el.style.background=layers.join(',');
  el.style.boxShadow='inset 0 0 '+(40+lv*26)+'px '+hexA(c0,0.05+0.04*lv);
  el.style.opacity=String(0.55+0.07*lv);
  /* (2) cards + UI accents via CSS vars on .phone */
  var ph=document.querySelector('.phone');
  if(ph){ ph.classList.add('asc-on'); for(var i=1;i<=6;i++) ph.classList.remove('asc-lv-'+i); ph.classList.add('asc-lv-'+lv);
    ph.style.setProperty('--lens-c0',c0); ph.style.setProperty('--lens-c1',c1); ph.style.setProperty('--lens-c2',c2);
    ph.style.setProperty('--lens-edge',hexA(c1,0.20+0.05*lv));
    ph.style.setProperty('--lens-glow',hexA(c0,0.04+0.035*lv));
    ph.style.setProperty('--lens-fill',hexA(c0,0.03+0.02*lv));
  }
  /* (3) indicator */
  try{ var ind=document.getElementById('asc-ind'); if(ind){ ind.classList.add('on');
    var nm=ind.querySelector('.nm'); if(nm) nm.textContent=' '+key+' '; var lvs=ind.querySelector('.lv'); if(lvs) lvs.textContent='\u00b7 '+lv+'/6 '+LV_NAME[lv]; } }catch(e){}
}

/* prompt feed: deepest ascension level across the day lens(es) */
var WORD=['',
 'raw physical, mundane, earthly, dim and unpolished',
 'awakening, slightly distorted, searching, restless',
 'harmonized, clear, blessed, a paradise-on-earth glow',
 'radiant, sacred, luminous with subtle sacred geometry',
 'transcendent, celestial, golden divine light',
 'utterly divine, godlike, a heavenly realm of infinite radiance'];
function lensAscensionPrompt(keys){
  var s=S(); keys=keys||(s&&s.mats)||[];
  var mx=1,i; for(i=0;i<keys.length;i++){ var l=effLevel(keys[i]); if(l>mx) mx=l; }
  return 'ascension level '+mx+'/6 (style depth): '+WORD[mx];
}
window.lensAscensionPrompt=lensAscensionPrompt;

function tick(){ try{ paint(); }catch(e){} }
try{ window._LV_NAMES=LV_NAME; }catch(e){}
window.AwaraAscension={ paint:function(){ _lastSig=''; tick(); }, levelOf:levelOf, level:function(k){ return effLevel(k||activeKey()); }, setForce:setForce, clearForce:clearForce, __ready:true, __v:2 };

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(tick,300); }); else setTimeout(tick,300);
setTimeout(tick,1400); setTimeout(tick,3000);
setInterval(tick,2000);
try{ window.addEventListener('awara-lens-styles-ready',tick); }catch(e){}
})();
