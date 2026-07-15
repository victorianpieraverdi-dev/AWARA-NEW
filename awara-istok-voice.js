/* AWARA - Istok voice (v1).
   Thin overlay that re-voices the Istok identity line into simpler, gently
   poetic language while keeping the same natal mechanics underneath.
   The engine is NOT modified. All Russian copy lives in awara-istok-voice.json
   (real Cyrillic is safe in JSON). This file stays ASCII except one property
   key needed to read the Lagna body from the natal chart. */
(function(){
'use strict';
if(window.AwaraIstokVoice && window.AwaraIstokVoice.__ready) return;

// "Лагна" - the chart key for the Ascendant (Lagna).
var LAGNA_KEY='\u041b\u0430\u0433\u043d\u0430';
var DATA=null;

function S(){ try{ if(typeof STATE!=='undefined' && STATE) return STATE; }catch(e){} return window.STATE||null; }
function esc(t){ return (''+t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function nakDeepFor(nak){
  try{
    if(typeof NAKDEEP==='undefined' || !NAKDEEP) return null;
    for(var i=0;i<NAKDEEP.length;i++){ if(NAKDEEP[i] && NAKDEEP[i][0]===nak) return NAKDEEP[i]; }
  }catch(e){}
  return null;
}

function compose(){
  if(!DATA) return null;
  var st=S(); if(!st || !st.natal || !st.daimon) return null;
  var n=st.natal, d=st.daimon;
  try{
    var deep=nakDeepFor(d.nak);
    var symbol=deep?deep[2]:'';
    var shakti=deep?deep[3]:'';
    var lagna=(typeof signOf==='function' && n.bodies)?signOf(n.bodies[LAGNA_KEY]):'';
    var way=(DATA.way && DATA.way[lagna]) || DATA.wayFallback || '';
    var name=d.name||'';
    var f=DATA.frame||{};
    var tale=(f.a||'')+symbol+(f.b||'')+shakti+(f.c||'')+way+(f.d||'')+name+(f.e||'');
    var inf=DATA.info||{};
    var info=(inf.nak||'')+(d.nak||'')+(inf.lord||'')+(d.lord||'')+(inf.lagna||'')+lagna+(inf.comp||'')+name;
    return { tale:tale, info:info, title:(DATA.keyTitle||'') };
  }catch(e){ return null; }
}

function apply(){
  var el=document.getElementById('mythText'); if(!el) return;
  var c=compose(); if(!c) return;
  el.innerHTML='<span class=\"iv-tale\">'+esc(c.tale)+'</span>'
    +'<span class=\"iv-key\" title=\"'+esc(c.title)+'\">\u2726</span>'
    +'<span class=\"iv-info\"></span>';
  var info=el.querySelector('.iv-info');
  var key=el.querySelector('.iv-key');
  if(info){ info.textContent=c.info; info.style.display='none'; }
  if(key && info){ key.onclick=function(){ info.style.display=(info.style.display==='none')?'block':'none'; }; }
}

function styleOnce(){
  if(document.getElementById('iv-style')) return;
  var s=document.createElement('style'); s.id='iv-style';
  s.textContent=".iv-key{cursor:pointer;color:var(--gold,#caa75a);margin-left:6px;opacity:.6;font-size:13px;vertical-align:middle;user-select:none}"
    +".iv-key:hover{opacity:1}"
    +".iv-info{margin-top:7px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.04em;opacity:.7;color:var(--muted,#9aa)}";
  document.head.appendChild(s);
}

function wrap(){
  if(typeof window.renderIstok!=='function') return false;
  if(window.renderIstok.__ivWrapped) return true;
  var orig=window.renderIstok;
  var w=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){} try{ styleOnce(); apply(); }catch(e){} return r; };
  w.__ivWrapped=true;
  window.renderIstok=w;
  return true;
}

function load(cb){
  try{
    fetch('awara-istok-voice.json?v=1').then(function(r){ return r.ok?r.json():null; }).then(function(j){ if(j) DATA=j; if(cb) cb(); }).catch(function(){ if(cb) cb(); });
  }catch(e){ if(cb) cb(); }
}

function boot(){
  styleOnce();
  var tries=0;
  var iv=setInterval(function(){ if(wrap() || ++tries>50) clearInterval(iv); },120);
  load(function(){ try{ apply(); }catch(e){} });
}

window.AwaraIstokVoice={ apply:apply, reload:function(){ load(apply); }, __ready:true };

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,150); }); }
else { setTimeout(boot,150); }
})();
