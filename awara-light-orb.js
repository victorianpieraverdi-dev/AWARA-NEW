/* ============================================================
   AWARA . Consciousness symbol + LIGHT / AWARENESS indicator (v4)
   1) Istok header: alchemical symbol of the Crucible
      (squared circle: circle/square/triangle + the heart).
   2) Below: a clean golden LIGHT ring (0..100, dark -> golden)
      + AWARENESS: the five elements with their cardinal
      directions (working with elements / sides of light).
   'Happiness' removed; Light + Awareness(elements) kept.
   Additive: engine untouched, reads STATE/MATRIX.
   ============================================================ */
(function(){
'use strict';
if(window.AwaraLightOrb&&window.AwaraLightOrb.__ready)return;

function S(){ try{ return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE; }catch(e){ return null; } }
function MX(){ try{ return (typeof MATRIX!=='undefined'&&MATRIX)?MATRIX:window.MATRIX; }catch(e){ return null; } }
function EN(){ try{ return (localStorage.getItem('awara_lang')||'ru')==='en'; }catch(e){ return false; } }
function num(x){ x=+x; return isFinite(x)?x:0; }
function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }

/* ---- elements + cardinal directions (sides of light) ---- */
var ELS=['\u0417\u0435\u043c\u043b\u044f','\u0412\u043e\u0434\u0430','\u041e\u0433\u043e\u043d\u044c','\u0412\u043e\u0437\u0434\u0443\u0445','\u042d\u0444\u0438\u0440'];
var EL_RGB={'\u041e\u0433\u043e\u043d\u044c':[255,92,44],'\u0412\u043e\u0434\u0430':[44,140,255],'\u0417\u0435\u043c\u043b\u044f':[150,120,60],'\u0412\u043e\u0437\u0434\u0443\u0445':[150,200,235],'\u042d\u0444\u0438\u0440':[157,134,224]};
var EL_ALIAS={'\u0413\u0440\u043e\u0437\u0430':'\u0412\u043e\u0437\u0434\u0443\u0445','\u0420\u0430\u0441\u0441\u0432\u0435\u0442':'\u041e\u0433\u043e\u043d\u044c','\u0421\u0432\u0435\u0442':'\u042d\u0444\u0438\u0440'};
var EL_EN={'\u041e\u0433\u043e\u043d\u044c':'Fire','\u0412\u043e\u0434\u0430':'Water','\u0417\u0435\u043c\u043b\u044f':'Earth','\u0412\u043e\u0437\u0434\u0443\u0445':'Air','\u042d\u0444\u0438\u0440':'Aether'};
var EL_DIR={'\u041e\u0433\u043e\u043d\u044c':'\u042e\u0433','\u0412\u043e\u0434\u0430':'\u0417\u0430\u043f\u0430\u0434','\u0417\u0435\u043c\u043b\u044f':'\u0421\u0435\u0432\u0435\u0440','\u0412\u043e\u0437\u0434\u0443\u0445':'\u0412\u043e\u0441\u0442\u043e\u043a','\u042d\u0444\u0438\u0440':'\u0426\u0435\u043d\u0442\u0440'};
var EL_DIR_EN={'\u041e\u0433\u043e\u043d\u044c':'South','\u0412\u043e\u0434\u0430':'West','\u0417\u0435\u043c\u043b\u044f':'North','\u0412\u043e\u0437\u0434\u0443\u0445':'East','\u042d\u0444\u0438\u0440':'Center'};
function elNorm(e){ if(EL_RGB[e])return e; return EL_ALIAS[e]||null; }
function elHex(e){ var c=EL_RGB[e]||[200,200,200]; return 'rgb('+c[0]+','+c[1]+','+c[2]+')'; }

function elementVector(){
  var s=S(), M=MX(); var v={'\u041e\u0433\u043e\u043d\u044c':0,'\u0412\u043e\u0434\u0430':0,'\u0417\u0435\u043c\u043b\u044f':0,'\u0412\u043e\u0437\u0434\u0443\u0445':0,'\u042d\u0444\u0438\u0440':0};
  try{
    if(s&&s.natal&&s.natal.bodies&&typeof elementOf==='function'&&typeof signOf==='function'){
      ['\u0421\u043e\u043b\u043d\u0446\u0435','\u041b\u0443\u043d\u0430','\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439','\u0412\u0435\u043d\u0435\u0440\u0430','\u041c\u0430\u0440\u0441','\u042e\u043f\u0438\u0442\u0435\u0440','\u0421\u0430\u0442\u0443\u0440\u043d','\u041b\u0430\u0433\u043d\u0430'].forEach(function(p){
        var l=s.natal.bodies[p]; if(l==null)return; var e=elementOf(signOf(l)); if(v[e]!=null)v[e]+=1;
      });
    }
  }catch(e){}
  try{ if(s&&s.daimon){ var de=elNorm(s.daimon.el); if(de)v[de]+=1.5; } }catch(e){}
  try{ ((s&&s.mats)||[]).forEach(function(k){ var m=M&&M[k]; if(!m)return; var e=elNorm(m[1]); if(e)v[e]+=1.4; }); }catch(e){}
  return v;
}

function harmonyOf(v){
  var arr=ELS.map(function(e){return v[e];}); var sum=arr.reduce(function(a,b){return a+b;},0);
  if(sum<=0) return {h:0, f:[0.2,0.2,0.2,0.2,0.2], present:0, raw:arr, sum:0};
  var f=arr.map(function(x){return x/sum;});
  var mean=1/5; var varc=f.reduce(function(a,x){return a+(x-mean)*(x-mean);},0)/5;
  var sd=Math.sqrt(varc); var maxSd=0.4;
  var h=clamp(1-sd/maxSd,0,1);
  var present=arr.filter(function(x){return x>0;}).length;
  h=clamp(h*0.7 + (present/5)*0.3, 0, 1);
  return {h:h, f:f, present:present, raw:arr, sum:sum};
}

function lightNow(){
  try{ if(typeof window.lightVal==='function')return clamp(num(window.lightVal()),0,100); }catch(e){}
  try{ if(typeof lightVal==='function')return clamp(num(lightVal()),0,100); }catch(e){}
  var s=S(); return s?clamp(num(s.baseLight)+num(s.lightBonus),0,100):48;
}

function radianceOf(){
  var s=S(); var L=lightNow()/100;
  var hv=harmonyOf(elementVector());
  var trust=s?clamp(num(s.trust)/100,0,1):0;
  var r=clamp(0.5*L + 0.35*hv.h + 0.15*trust, 0, 1);
  return {r:r, h:hv.h, f:hv.f, present:hv.present, L:L*100, trust:trust*100};
}

/* ---- light stages (driven by Light 0..1) ---- */
function stageOf(r){
  if(r<0.25)return {i:0, ru:'\u0422\u044c\u043c\u0430', en:'Dark'};
  if(r<0.45)return {i:1, ru:'\u041f\u0435\u0440\u0432\u044b\u0439 \u043f\u0440\u043e\u0431\u043b\u0435\u0441\u043a', en:'First glimmer'};
  if(r<0.65)return {i:2, ru:'\u0420\u043e\u0432\u043d\u044b\u0439 \u0441\u0432\u0435\u0442', en:'Steady light'};
  if(r<0.82)return {i:3, ru:'\u0421\u0438\u044f\u043d\u0438\u0435', en:'Radiance'};
  return {i:4, ru:'\u0417\u043e\u043b\u043e\u0442\u043e\u0435 \u0441\u0438\u044f\u043d\u0438\u0435', en:'Golden radiance'};
}

/* ---- golden ring gauge driven by Light ---- */
function orbStyles(frac){
  frac=clamp(frac,0,1);
  var deg=(frac*360).toFixed(1);
  var ring='conic-gradient(from -90deg, #ffe9a8 0deg, #ffd27a '+deg+'deg, rgba(255,255,255,0.06) '+deg+'deg 360deg)';
  var blur=(14+52*frac).toFixed(0);
  var glow='0 0 '+blur+'px rgba(255,210,122,'+(0.16+0.5*frac).toFixed(2)+')';
  return {bg:ring, glow:glow};
}

/* ---- alchemical consciousness symbol (SVG) ---- */
var SYMBOL_SVG = "<svg class='lo-sym' viewBox='0 0 200 200' width='162' height='162' xmlns='http://www.w3.org/2000/svg'>"
 + "<defs>"
 + "<radialGradient id='loSphere' cx='50%' cy='42%' r='62%'><stop offset='0%' stop-color='#9d86e0' stop-opacity='0.5'/><stop offset='55%' stop-color='#7b62c9' stop-opacity='0.16'/><stop offset='100%' stop-color='#05050d' stop-opacity='0'/></radialGradient>"
 + "<radialGradient id='loHeart' cx='50%' cy='36%' r='66%'><stop offset='0%' stop-color='#fff6df'/><stop offset='38%' stop-color='#ffd27a'/><stop offset='78%' stop-color='#c9a84c'/><stop offset='100%' stop-color='#7b62c9'/></radialGradient>"
 + "<linearGradient id='loGeo' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#c9a84c'/><stop offset='100%' stop-color='#9d86e0'/></linearGradient>"
 + "<filter id='loGlow' x='-60%' y='-60%' width='220%' height='220%'><feGaussianBlur stdDeviation='3' result='b'/><feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge></filter>"
 + "</defs>"
 + "<circle cx='100' cy='100' r='94' fill='url(#loSphere)'/>"
 + "<g class='lo-rot1' opacity='0.7'><circle cx='100' cy='100' r='90' fill='none' stroke='#c9a84c' stroke-opacity='0.55' stroke-width='1' stroke-dasharray='2 9' stroke-linecap='round'/></g>"
 + "<g class='lo-rot2' opacity='0.55'><circle cx='100' cy='100' r='78' fill='none' stroke='#9d86e0' stroke-opacity='0.6' stroke-width='1' stroke-dasharray='1 7'/></g>"
 + "<circle cx='100' cy='100' r='80' fill='none' stroke='url(#loGeo)' stroke-width='1.4' stroke-opacity='0.85'/>"
 + "<rect x='43.4' y='43.4' width='113.2' height='113.2' fill='none' stroke='url(#loGeo)' stroke-width='1.05' stroke-opacity='0.55'/>"
 + "<polygon points='100,38 156,150 44,150' fill='none' stroke='url(#loGeo)' stroke-width='1.05' stroke-opacity='0.7'/>"
 + "<circle cx='100' cy='108' r='42' fill='none' stroke='#c9a84c' stroke-width='1' stroke-opacity='0.45'/>"
 + "<g class='lo-heart' filter='url(#loGlow)'>"
 + "<path d='M100,150 C70,128 56,112 56,94 C56,80 66,71 78,71 C88,71 96,78 100,86 C104,78 112,71 122,71 C134,71 144,80 144,94 C144,112 130,128 100,150 Z' fill='url(#loHeart)' stroke='#ffe9bf' stroke-width='0.8' stroke-opacity='0.7'/>"
 + "<path d='M100,132 C96,121 92,117 92,109 C92,104 96,101 100,104 C104,101 108,104 108,109 C108,117 104,121 100,132 Z' fill='#fff7e6' opacity='0.85'/>"
 + "<circle cx='100' cy='104' r='4.4' fill='#ffffff'/>"
 + "</g>"
 + "<g class='lo-spark' fill='#ffd27a'><circle cx='100' cy='18' r='1.8'/><circle cx='172' cy='62' r='1.4'/><circle cx='172' cy='138' r='1.4'/><circle cx='100' cy='184' r='1.8'/><circle cx='28' cy='138' r='1.4'/><circle cx='28' cy='62' r='1.4'/></g>"
 + "</svg>";

function styleOnce(){
  if(document.getElementById('lo-style'))return;
  var st=document.createElement('style'); st.id='lo-style';
  st.textContent=[
   /* consciousness symbol */
   "#s-istok .orb-wrap{margin:10px 0 14px}",
   "#s-istok .lo-sym{display:block;filter:drop-shadow(0 0 18px rgba(157,134,224,.4));animation:loBreath 6s ease-in-out infinite}",
   "#s-istok .lo-sym .lo-rot1,#s-istok .lo-sym .lo-rot2,#s-istok .lo-sym .lo-heart,#s-istok .lo-sym .lo-spark{transform-box:fill-box;transform-origin:center}",
   "#s-istok .lo-sym .lo-rot1{animation:loSpin 34s linear infinite}",
   "#s-istok .lo-sym .lo-rot2{animation:loSpin 24s linear infinite reverse}",
   "#s-istok .lo-sym .lo-heart{animation:loHeartBeat 3.6s ease-in-out infinite}",
   "@keyframes loHeartBeat{0%,100%{transform:scale(1);opacity:.96}50%{transform:scale(1.07);opacity:1}}",
   "#s-istok .lo-sym .lo-spark{animation:loTwinkle 4.2s ease-in-out infinite}",
   "@keyframes loTwinkle{0%,100%{opacity:.35}50%{opacity:1}}",
   /* light + awareness indicator */
   "#awaraLightOrb{margin:8px 0 4px}",
   "#awaraLightOrb .lo-head{display:flex;align-items:center;gap:18px}",
   "#awaraLightOrb .lo-orb{width:120px;height:120px;flex:0 0 auto;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;transition:background .8s ease,box-shadow .8s ease;cursor:pointer;animation:loBreath 5s ease-in-out infinite}",
   "#awaraLightOrb .lo-orb::before{content:'';position:absolute;inset:-9px;border-radius:50%;border:1px dashed rgba(255,255,255,.12);animation:loSpin 30s linear infinite}",
   "#awaraLightOrb .lo-core{width:88px;height:88px;border-radius:50%;background:radial-gradient(circle at 50% 38%,rgba(40,34,58,.96),rgba(14,12,22,.98));display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 0 18px rgba(0,0,0,.6);z-index:2}",
   "#awaraLightOrb .lo-num{font-family:'Cinzel',serif;font-size:33px;line-height:1;color:var(--spark);text-shadow:0 0 14px rgba(255,210,122,.5)}",
   "#awaraLightOrb .lo-unit{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.22em;color:var(--muted);text-transform:uppercase;margin-top:3px}",
   "@keyframes loSpin{to{transform:rotate(360deg)}}",
   "@keyframes loBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}",
   "#awaraLightOrb .lo-meta{flex:1;min-width:0}",
   "#awaraLightOrb .lo-stage{font-family:'Cinzel',serif;color:#fff;font-size:19px;line-height:1.18}",
   "#awaraLightOrb .lo-sub{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;margin-top:7px;line-height:1.5}",
   "#awaraLightOrb.gold .lo-orb{animation:loBreath 2.6s ease-in-out infinite,loGold 3s ease-in-out infinite}",
   "@keyframes loGold{0%,100%{filter:drop-shadow(0 0 6px rgba(255,210,122,.6))}50%{filter:drop-shadow(0 0 22px rgba(255,235,170,.95))}}",
   /* elements / sides of light */
   "#awaraLightOrb .lo-elwrap{margin-top:15px;border-top:1px solid rgba(255,255,255,.07);padding-top:13px}",
   "#awaraLightOrb .lo-elhead{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;margin-bottom:10px}",
   "#awaraLightOrb .lo-els{display:flex;flex-direction:column-reverse;gap:8px}",
   "#awaraLightOrb .lo-el{display:grid;grid-template-columns:82px 1fr;align-items:center;gap:12px}",
   "#awaraLightOrb .lo-el-n{font-family:'Cinzel',serif;font-size:12.5px}",
   "#awaraLightOrb .lo-el-d{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.1em;color:var(--muted);text-transform:uppercase}",
   "#awaraLightOrb .lo-el-bar{height:6px;border-radius:5px;background:rgba(255,255,255,.06);overflow:hidden}",
   "#awaraLightOrb .lo-el-bar>i{display:block;height:100%;border-radius:5px;transition:width .8s ease;box-shadow:0 0 8px currentColor}"
  ].join('\n');
  document.head.appendChild(st);
}

/* place the consciousness symbol into the Istok header */
function ensureSymbol(){
  /* orb-wrap принадлежит awara-heart.js (картинка-шар). НЕ рисуем здесь
     SVG-символ — именно он давал видимую подмену шара при старте. */
  return;
}

function ensureHost(){
  var ex=document.getElementById('awaraLightOrb'); if(ex)return ex;
  var istok=document.getElementById('s-istok'); if(!istok)return null;
  styleOnce(); ensureSymbol();
  var host=document.createElement('div'); host.id='awaraLightOrb'; host.className='card awara-glass-card glow'; host.setAttribute('data-aw-fold','0');
  var anchor=null; var btns=istok.querySelectorAll('button');
  for(var bi=0;bi<btns.length;bi++){ var oc=btns[bi].getAttribute('onclick')||''; if(oc.indexOf("go('tigel')")>=0){ anchor=btns[bi]; break; } }
  if(anchor&&anchor.parentNode){ anchor.parentNode.insertBefore(host, anchor); }
  else { var chron=document.getElementById('istokChron'); if(chron&&chron.parentNode){ chron.parentNode.insertBefore(host, chron.nextSibling); } else { istok.appendChild(host); } }
  host.innerHTML="<span class='label' id='loLabel'></span>"
   +"<div class='lo-head'>"
   +"<div class='lo-orb' id='loOrb'><div class='lo-core'><div class='lo-num' id='loPct'>0</div><div class='lo-unit' id='loUnit'></div></div></div>"
   +"<div class='lo-meta'><div class='lo-stage' id='loStage'>\u2014</div><div class='lo-sub' id='loSub'>\u2014</div></div>"
   +"</div>"
   +"<div class='lo-elwrap'><div class='lo-elhead' id='loElHead'></div><div class='lo-els' id='loEls'></div></div>";
  return host;
}

function setText(id,t){ var el=document.getElementById(id); if(el)el.textContent=t; }

function renderEls(hv){
  var box=document.getElementById('loEls'); if(!box)return;
  var en=EN();
  var maxF=Math.max.apply(null, hv.f); if(!(maxF>0))maxF=1;
  var html='';
  for(var i=0;i<ELS.length;i++){
    var e=ELS[i]; var f=hv.f[i]||0; var w=Math.round(clamp(f/maxF,0,1)*100);
    var col=elHex(e);
    html+="<div class='lo-el'>"
      +"<span class='lo-el-n' style='color:"+col+"'>"+(en?EL_EN[e]:e)+"</span>"
      +"<span class='lo-el-bar'><i style='width:"+w+"%;color:"+col+";background:linear-gradient(90deg,"+col+"44,"+col+")'></i></span>"
      +"</div>";
  }
  box.innerHTML=html;
}

function render(){
  ensureSymbol();
  var host=ensureHost(); if(!host)return;
  var L=lightNow();                 // 0..100
  var frac=clamp(L/100,0,1);
  var st=stageOf(frac); var os=orbStyles(frac);
  var orb=document.getElementById('loOrb');
  if(orb){ orb.style.background=os.bg; orb.style.boxShadow=os.glow; }
  host.classList.toggle('gold', st.i>=4);
  var en=EN();
  setText('loLabel', en?'Light . Awareness':'\u0418\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440 \u0421\u0432\u0435\u0442\u0430 \u00b7 \u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u0438');
  setText('loStage', en?st.en:st.ru);
  setText('loPct', Math.round(L));
  setText('loUnit', en?'light':'\u0441\u0432\u0435\u0442');
  var v=elementVector(); var hv=harmonyOf(v);
  setText('loSub', (en?'Awareness':'\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c')+' '+Math.round(hv.h*100)+'% \u00b7 '+(en?'elements':'\u0441\u0442\u0438\u0445\u0438\u0439')+' '+hv.present+'/5');
  setText('loElHead', en?'Elements . earth to aether':'\u0421\u0442\u0438\u0445\u0438\u0438 \u00b7 \u043e\u0442 \u0437\u0435\u043c\u043b\u0438 \u043a \u044d\u0444\u0438\u0440\u0443');
  renderEls(hv);
}

function wrap(name){ var f=window[name]; if(typeof f==='function'&&!f.__lo){ var w=function(){ var r=f.apply(this,arguments); try{render();}catch(e){} return r; }; w.__lo=true; window[name]=w; } }
['renderIstok','renderResult','renderDaimon','updateLight','doLive','calcNatal','toggleMat','completeIntent','go'].forEach(wrap);

window.addEventListener('awara:lang',function(){ try{render();}catch(e){} });

function boot(){ try{render();}catch(e){} setTimeout(render,500); setTimeout(render,1500); }
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',boot); } else { boot(); }
setInterval(function(){ try{ var h=document.getElementById('awaraLightOrb'); if(h&&h.offsetParent!==null) render(); }catch(e){} },2000);

window.AwaraLightOrb={render:render, radianceOf:radianceOf, elementVector:elementVector, __ready:true};
})();