/* ============================================================
   AWARA - WINDOW BG (v1)
   Paints the generated lens/level image as a full-bleed, dimmed
   background behind every screen of the .phone, so the whole
   atmosphere of the window shifts with the active lens and its
   ascension level.
     image: exports/generated_cards/lens_levels/{slug}_l{N}.webp
   Driven by window.LensLevels.current() (follows the active lens,
   or the Mandala "etalon" preview selection when one is picked).
   Additive; does NOT edit other modules. ASCII-only code.
   Console controls:
     AwaraWindowBg.setOpacity(0..1)  - image visibility
     AwaraWindowBg.setEnabled(true|false)
   ============================================================ */
(function(){
'use strict';
if(window.__awaraWindowBg) return; window.__awaraWindowBg=true;

var IMG_ROOT='exports/generated_cards/';
var _cur='';      /* currently shown bg url */
var _on=true;     /* feature enabled */
var _bgSize='cover'; var _bgPos='center'; /* background zoom+pan for focusing the art (bgFocus) */
var _bgX=50, _bgY=50, _bgZoom=100; /* live numeric state for the on-screen control pad */
var OPACITY=0.5; /* image visibility behind the dimming overlay */

/* readability over the bright background: ALL panels (including glass-cards) become COSMIC frosted glass - transparent so the image shows through, brightened so nothing reads as flat black, text lifted by a soft shadow. Panel fill alpha is tunable live via AwaraWindowBg.setPanel(0..1). */
var PANEL=0.34; /* panel glass fill alpha */
function readCss(){
  var f1='rgba(26,14,48,'+PANEL+')', f2='rgba(8,5,20,'+Math.min(1,PANEL+0.14)+')';
  return [
    '.phone .screen,.phone .screen *{color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 1px 1px rgba(0,0,0,.68)!important}',
    '.phone .screen h1{color:#f5d885!important;-webkit-text-fill-color:#f5d885!important;text-shadow:-1px 0 0 rgba(28,14,4,.82),1px 0 0 rgba(28,14,4,.82),0 -1px 0 rgba(28,14,4,.82),0 1px 0 rgba(28,14,4,.82),0 0 13px rgba(122,62,20,.4)!important}',
    'html .phone .card,html .phone .mcard,html .phone .libcard,html .phone .awara-glass-card,html .phone #dchat,html .phone #lensPlaces .lp-card{background:radial-gradient(1.3px 1.3px at 16% 22%,rgba(255,255,255,.8) 0%,transparent 62%),radial-gradient(1px 1px at 77% 30%,rgba(216,198,255,.72) 0%,transparent 62%),radial-gradient(1.5px 1.5px at 43% 67%,rgba(255,255,255,.62) 0%,transparent 62%),radial-gradient(1px 1px at 88% 75%,rgba(202,172,255,.6) 0%,transparent 62%),radial-gradient(1px 1px at 27% 87%,rgba(255,255,255,.5) 0%,transparent 62%),radial-gradient(1.1px 1.1px at 62% 13%,rgba(232,212,255,.55) 0%,transparent 62%),radial-gradient(1px 1px at 8% 56%,rgba(255,255,255,.45) 0%,transparent 62%),radial-gradient(135% 82% at 84% -8%,rgba(150,84,224,.26) 0%,transparent 55%),radial-gradient(120% 90% at -6% 108%,rgba(96,40,150,.2) 0%,transparent 58%),linear-gradient(158deg,'+f1+','+f2+')!important;backdrop-filter:blur(22px) saturate(128%) brightness(.55) contrast(1.05)!important;-webkit-backdrop-filter:blur(22px) saturate(128%) brightness(.55) contrast(1.05)!important;border:1px solid rgba(150,118,224,.24)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 34px rgba(110,48,190,.18),0 12px 36px rgba(0,0,0,.5),0 0 22px -6px rgba(140,68,210,.32)!important}',
    'html .phone .mcard.on{background:linear-gradient(150deg,rgba(201,168,76,.36),rgba(123,98,201,.32))!important;border-color:rgba(201,168,76,.55)!important}',
    'body .phone::before{background:radial-gradient(125% 100% at 50% 30%,transparent 62%,rgba(0,0,0,.26) 100%)!important}'
  ].join('');
}
function applyReadStyle(){ try{ var el=document.getElementById('lensWinReadStyle'); if(!el){ el=document.createElement('style'); el.id='lensWinReadStyle'; } el.textContent=readCss(); (document.head||document.documentElement).appendChild(el); }catch(e){} }
function setPanel(v){ v=parseFloat(v); if(isNaN(v)) return; PANEL=Math.max(0,Math.min(1,v)); applyReadStyle(); }
applyReadStyle();
setTimeout(applyReadStyle,600); setTimeout(applyReadStyle,1800); setTimeout(applyReadStyle,3200);

/* Gentle FIXED lower+shrink of the central sphere (Tigel #orb, Istok .orb-wrap), so it sits a touch lower and smaller and does not clash with the sacred geometry. This is NOT per-level. Tune live: AwaraWindowBg.orbRefine(dyPx, scale); reset with AwaraWindowBg.orbRefine(0,1). */
function injectOrbRefine(){ try{ if(document.getElementById('lensOrbRefine')) return; var el=document.createElement('style'); el.id='lensOrbRefine'; el.textContent='#s-istok .orb-wrap{transform:translateY(var(--aw-orb-dy,0px)) scale(var(--aw-orb-sc,.729))!important;transform-origin:50% 50%!important;transition:transform .5s ease}'; (document.head||document.documentElement).appendChild(el); }catch(e){} }
function orbRefine(dy,sc){ try{ injectOrbRefine(); var ph=document.querySelector('.phone'); if(ph){ if(dy!=null&&!isNaN(parseFloat(dy))) ph.style.setProperty('--aw-orb-dy', parseFloat(dy)+'px'); if(sc!=null&&!isNaN(parseFloat(sc))) ph.style.setProperty('--aw-orb-sc', String(parseFloat(sc))); } }catch(e){} return {dy:dy,sc:sc}; }
/* Force BOTH central spheres to the exact same diameter (px), centered symmetrically. Opt-in: AwaraWindowBg.orbSize(150). Remove with orbSize(0). */
function orbSize(px){ try{ px=parseFloat(px); var id='lensOrbSize'; var el=document.getElementById(id); if(!px||isNaN(px)){ if(el&&el.parentNode) el.parentNode.removeChild(el); return {size:null}; } if(!el){ el=document.createElement('style'); el.id=id; (document.head||document.documentElement).appendChild(el); } el.textContent='#s-tigel #orb,#s-istok .orb-wrap{width:'+px+'px!important;height:'+px+'px!important}'; }catch(e){} return {size:px}; }
/* Make the Tigel sphere exactly match the Istok sphere size (1:1), WITHOUT changing Istok. Run: AwaraWindowBg.matchTigelToIstok(). Reset via orbSize(0). */
function matchTigelToIstok(targetPx, dyPx){ try{ var t=parseFloat(targetPx); if(!t||isNaN(t)) t=202; var dy=parseFloat(dyPx); if(isNaN(dy)) dy=0; var orb=document.querySelector('#s-tigel #orb'); var base=(orb&&orb.offsetWidth)?orb.offsetWidth:160; if(!base) base=160; var sc=t/base; var id='lensOrbMatch'; var el=document.getElementById(id); if(!el){ el=document.createElement('style'); el.id=id; (document.head||document.documentElement).appendChild(el); } var scS=sc.toFixed(4); var scB=(sc*0.965).toFixed(4); el.textContent='@keyframes awTigelBreath{0%,100%{transform:translateY('+dy+'px) scale('+scS+') rotate(0deg)}50%{transform:translateY('+dy+'px) scale('+scB+') rotate(2deg)}}'+'#s-tigel #orb{animation:awTigelBreath 8s ease-in-out infinite!important;transform:translateY('+dy+'px) scale('+scS+');transform-origin:50% 50%!important;transition:transform .5s ease}'; return {ok:true,target:t,dy:dy,base:base,scale:sc}; }catch(e){ return {ok:false}; } }
injectOrbRefine();
setTimeout(injectOrbRefine,700); setTimeout(injectOrbRefine,2000);
/* Auto-match Tigel sphere to Istok on every load: user-approved size 215px + move Tigel orb DOWN 44px. Reset/tune via AwaraWindowBg.matchTigelToIstok(size,dy). */
setTimeout(function(){ try{ matchTigelToIstok(155, 44); }catch(e){} }, 500);
setTimeout(function(){ try{ matchTigelToIstok(155, 44); }catch(e){} }, 1600);
setTimeout(function(){ try{ matchTigelToIstok(155, 44); }catch(e){} }, 3200);

/* Tigel header polish: keep subtitle on ONE line (auto-shrink font, words unchanged), clear orb/text overlap, add bottom padding for symmetry. Tunable via AwaraWindowBg.tuneTigelHeader(). */
function tuneTigelHeader(){ try{ var id='tigelHeaderTune'; var el=document.getElementById(id); if(!el){ el=document.createElement('style'); el.id=id; (document.head||document.documentElement).appendChild(el); } el.textContent='#s-tigel .sub{white-space:nowrap!important;max-width:100%;overflow:hidden;margin-bottom:12px!important}'+'#s-tigel .orb-wrap{margin-bottom:84px!important}'+'#s-tigel{padding-bottom:36px!important}'; var sub=document.querySelector('#s-tigel .sub'); if(sub && sub.clientWidth>0){ var fs=parseFloat(getComputedStyle(sub).fontSize)||14; var g=0; while(sub.scrollWidth>sub.clientWidth && fs>9 && g<60){ fs-=0.5; sub.style.fontSize=fs+'px'; g++; } } return {ok:true}; }catch(e){ return {ok:false}; } }
setTimeout(tuneTigelHeader,600); setTimeout(tuneTigelHeader,1700); setTimeout(tuneTigelHeader,3300);
try{ document.addEventListener('click', function(){ setTimeout(tuneTigelHeader,120); }, true); }catch(e){}

/* Align Daimon avatar orb (#s-daimon .dm-orb, base 150px) to the same super-position as Istok/Tigel. Tune: AwaraWindowBg.matchDaimonToIstok(size,dy). */
function matchDaimonToIstok(targetPx, dyPx){ try{ var t=parseFloat(targetPx); if(!t||isNaN(t)) t=202; var dy=parseFloat(dyPx); if(isNaN(dy)) dy=0; var orb=document.querySelector('#s-daimon .dm-orb'); var base=(orb&&orb.offsetWidth)?orb.offsetWidth:150; if(!base) base=150; var sc=t/base; var id='daimonOrbMatch'; var el=document.getElementById(id); if(!el){ el=document.createElement('style'); el.id=id; (document.head||document.documentElement).appendChild(el); } var scS=sc.toFixed(4); var scB=(sc*0.965).toFixed(4); el.textContent='@keyframes awDaimonBreath{0%,100%{transform:translateY('+dy+'px) scale('+scS+') rotate(0deg)}50%{transform:translateY('+dy+'px) scale('+scB+') rotate(2deg)}}'+'#s-daimon .dm-orb{animation:awDaimonBreath 8s ease-in-out infinite!important;transform:translateY('+dy+'px) scale('+scS+');transform-origin:50% 50%!important;transition:transform .5s ease}'; return {ok:true,target:t,dy:dy,base:base,scale:sc}; }catch(e){ return {ok:false}; } }
setTimeout(function(){ try{ matchDaimonToIstok(158, 135); }catch(e){} }, 500);
setTimeout(function(){ try{ matchDaimonToIstok(158, 135); }catch(e){} }, 1600);
setTimeout(function(){ try{ matchDaimonToIstok(158, 135); }catch(e){} }, 3200);

/* Daimon header: golden intro caption + symmetric spacing so nothing overlaps the lowered orb. Tune: AwaraWindowBg.tuneDaimonHeader(capTop, nameGap). */
function tuneDaimonHeader(capTop, nameGap){ try{ var s=document.querySelector('#s-daimon'); if(!s) return {ok:false,why:'no-daimon'}; var ct=parseFloat(capTop); if(isNaN(ct)) ct=70; var ng=parseFloat(nameGap); if(isNaN(ng)) ng=190; s.style.position='relative'; var cap=document.getElementById('dmIntroCap'); if(!cap){ cap=document.createElement('div'); cap.id='dmIntroCap'; cap.innerHTML='<div class="dm-introTitle">Даймон · Твой Спутник</div><div class="dm-introText">Проводник, рождённый из твоей натальной карты. Он отражает твою суть, говорит с тобой и растёт вместе с тобой на пути.</div>'; s.appendChild(cap); } var id='daimonHeaderTune'; var el=document.getElementById(id); if(!el){ el=document.createElement('style'); el.id=id; (document.head||document.documentElement).appendChild(el); } el.textContent='#dmIntroCap{position:absolute;top:'+ct+'px;left:0;right:0;text-align:center;padding:0 22px;z-index:2;pointer-events:none}'+'#dmIntroCap .dm-introTitle{font-family:"Cormorant Garamond",Georgia,serif;font-size:23px;letter-spacing:.4px;font-weight:600;background:linear-gradient(180deg,#f6e6ad,#c9a84c);-webkit-background-clip:text;background-clip:text;color:transparent}'+'#dmIntroCap .dm-introText{margin:7px auto 0;max-width:300px;font-size:12.5px;line-height:1.5;color:rgba(236,233,245,.72)}'+'#s-daimon .dm-name{margin-top:'+ng+'px!important}'+'#s-daimon{padding-bottom:34px!important}'; return {ok:true,capTop:ct,nameGap:ng}; }catch(e){ return {ok:false}; } }
setTimeout(function(){ try{ tuneDaimonHeader(70,190); }catch(e){} }, 700);
setTimeout(function(){ try{ tuneDaimonHeader(70,190); }catch(e){} }, 1800);
setTimeout(function(){ try{ tuneDaimonHeader(70,190); }catch(e){} }, 3400);
try{ document.addEventListener('click', function(){ setTimeout(tuneDaimonHeader,140); }, true); }catch(e){}

function cur(){
  try{ if(window.LensLevels&&LensLevels.current){ var c=LensLevels.current(); if(c&&c.slug) return {slug:c.slug, lv:c.lv||1}; } }catch(e){}
  return null;
}
function urlOf(a){
  try{ if(window.LensLevels&&LensLevels.img) return LensLevels.img(a.slug,a.lv); }catch(e){}
  return IMG_ROOT+'lens_levels/'+a.slug+'_l'+a.lv+'.webp';
}

function ensureLayers(){
  var ph=document.querySelector('.phone'); if(!ph) return null;
  var bg=document.getElementById('lensWinBg');
  if(!bg){
    var blur=document.createElement('div'); blur.id='lensWinBgBlur';
    blur.style.cssText='position:absolute;inset:0;z-index:1;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0;transition:none;filter:blur(34px) saturate(120%) brightness(.6);transform:scale(1.14);will-change:opacity;';
    bg=document.createElement('div'); bg.id='lensWinBg';
    bg.style.cssText='position:absolute;inset:0;z-index:1;pointer-events:none;background-size:contain;background-position:center;background-repeat:no-repeat;opacity:0;transition:none;will-change:opacity;';
    var ov=document.createElement('div'); ov.id='lensWinBgOv';
    ov.style.cssText='position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 88% at 50% 16%,transparent 0%,rgba(18,14,48,.16) 44%,rgba(9,7,32,.5) 74%,rgba(4,3,20,.76) 100%),radial-gradient(85% 65% at 80% 90%,rgba(123,98,201,.22) 0%,transparent 56%),radial-gradient(80% 60% at 16% 72%,rgba(58,120,190,.14) 0%,transparent 56%),linear-gradient(180deg,rgba(8,7,26,.2) 0%,rgba(10,8,30,.3) 52%,rgba(6,5,22,.5) 100%);';
    ph.insertBefore(blur, ph.firstChild);
    ph.insertBefore(bg, blur.nextSibling);
    ph.insertBefore(ov, bg.nextSibling);
  }
  return bg;
}

function paint(){
  if(!_on) return;
  var bg=ensureLayers(); if(!bg) return;
  applyBgMotion();
  var a=cur();
  if(!a){ bg.style.opacity='0'; _cur=''; return; }
  var u=urlOf(a);
  if(u===_cur) return;
  var img=new Image();
  img.onload=function(){ var blur=document.getElementById('lensWinBgBlur'); if(blur){ blur.style.backgroundImage='url("'+u+'")'; blur.style.opacity=String(Math.min(1,OPACITY+0.15)); } bg.style.backgroundImage='url("'+u+'")'; bg.style.opacity=String(OPACITY); _cur=u; _curKey=(a&&a.slug)?(a.slug+'_l'+a.lv):''; bgApplyFor(_curKey); if(!paint.__faded){ paint.__faded=1; setTimeout(function(){ try{ bg.style.transition='opacity .9s ease'; if(blur) blur.style.transition='opacity .9s ease'; }catch(e){} }, 60); } };
  img.onerror=function(){ if(!_cur){ bg.style.opacity='0'; } };
  img.src=u;
}

function setOpacity(v){ v=parseFloat(v); if(isNaN(v)) return; OPACITY=Math.max(0,Math.min(1,v)); var bg=document.getElementById('lensWinBg'); if(bg&&_cur) bg.style.opacity=String(OPACITY); var blur=document.getElementById('lensWinBgBlur'); if(blur&&_cur) blur.style.opacity=String(Math.min(1,OPACITY+0.15)); }
function setEnabled(on){ _on=!!on; var bg=document.getElementById('lensWinBg'),ov=document.getElementById('lensWinBgOv'),blur=document.getElementById('lensWinBgBlur'); if(bg) bg.style.display=_on?'':'none'; if(ov) ov.style.display=_on?'':'none'; if(blur) blur.style.display=_on?'':'none'; if(_on){ _cur=''; paint(); } }

try{ document.addEventListener('awara-lens-levels-ready', paint); }catch(e){}
try{ window.addEventListener('load', paint); }catch(e){}
try{ document.addEventListener('click', function(){ setTimeout(paint,60); }, true); }catch(e){}
setInterval(paint, 1500);
setTimeout(paint, 400);
setTimeout(paint, 1600);

/* Focus the background art by APPROXIMATE coordinates: pan X/Y (0..100%) + zoom (>=100 to allow vertical pan). Lets us line the art meaningful center up under the fixed sphere WITHOUT regenerating. Ex: AwaraWindowBg.bgFocus(50, 40, 118). Reset: AwaraWindowBg.bgReset(). */
function bgFocus(xPct, yPct, zoomPct){ try{ var x=parseFloat(xPct); if(isNaN(x)) x=50; var y=parseFloat(yPct); if(isNaN(y)) y=50; var z=parseFloat(zoomPct); if(isNaN(z)||z<100) z=100; _bgX=x; _bgY=y; _bgZoom=z; _bgSize=(z<=100?'contain':('auto '+z+'%')); _bgPos=x+'% '+y+'%'; var bg=document.getElementById('lensWinBg'); if(bg){ bg.style.backgroundSize=_bgSize; bg.style.backgroundPosition=_bgPos; } return {x:x,y:y,zoom:z,size:_bgSize,pos:_bgPos}; }catch(e){ return {ok:false}; } }
function bgReset(){ return bgFocus(50,50,100); }

/* Living background motion: gentle Ken Burns breath on the art + soft light shimmer on the overlay, so the scene feels alive and premium without regenerating any image. Respects prefers-reduced-motion. Toggle: AwaraWindowBg.setMotion(true|false). */
var _motion=true;
function prefersReduced(){ try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } }
function injectBgMotion(){ try{ if(document.getElementById('lensWinBgMotion')) return; var el=document.createElement('style'); el.id='lensWinBgMotion'; el.textContent='@keyframes awBgBreathBlur{0%{transform:scale(1.16)}50%{transform:scale(1.30)}100%{transform:scale(1.16)}}@keyframes awBgShimmer{0%{opacity:1}50%{opacity:.72}100%{opacity:1}}@keyframes awBgBreathSharp{0%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.05);filter:brightness(1.08)}100%{transform:scale(1);filter:brightness(1)}}.phone #lensWinBg.aw-motion{animation:awBgBreathSharp 16s ease-in-out infinite!important;transform-origin:50% 50%!important}.phone #lensWinBgBlur.aw-motion{animation:awBgBreathBlur 18s ease-in-out infinite!important;transform-origin:50% 42%!important}.phone #lensWinBgOv.aw-motion{animation:awBgShimmer 11s ease-in-out infinite!important}'; (document.head||document.documentElement).appendChild(el); }catch(e){} }
function applyBgMotion(){ try{ injectBgMotion(); var want=_motion && !prefersReduced(); ['lensWinBg','lensWinBgBlur','lensWinBgOv'].forEach(function(id){ var e=document.getElementById(id); if(e){ if(want) e.classList.add('aw-motion'); else e.classList.remove('aw-motion'); } }); }catch(e){} }
function setMotion(on){ _motion=!!on; applyBgMotion(); return {motion:_motion}; }

/* ============================================================
   BAKED-IN FOCUS - ships to EVERYONE, forever (source of truth).
   Keyed by stable art id "slug_lN". These defaults are compiled into
   the game file, so ANY visitor on ANY device/browser sees each
   background at exactly the position set here - not just this browser.
   HOW TO BAKE: set positions with the on-screen pad, press "Export",
   send the JSON, and the "map" entries get pasted below.
   ============================================================ */
var BAKED_FOCUS={
  /* example: "egyptian_l1": {x:50,y:42,z:118}, */
  "vedic_l1": {x:50,y:0,z:130},
  "vedic_l2": {x:50,y:0,z:114},
  "vedic_l3": {x:50,y:7,z:126},
  "vedic_l4": {x:50,y:39,z:126},
  "vedic_l5": {x:50,y:0,z:126},
  "vedic_l6": {x:50,y:80,z:126},
  "hermetic_alchemical_l1": {x:50,y:2,z:128},
  "hermetic_alchemical_l2": {x:50,y:20,z:128},
  "hermetic_alchemical_l3": {x:50,y:0,z:128},
  "hermetic_alchemical_l4": {x:50,y:33,z:114},
  "hermetic_alchemical_l5": {x:50,y:0,z:126},
  "gnostic_l1": {x:50,y:100,z:130},
  "hermetic_alchemical_l6": {x:54,y:22,z:104},
  "tarot_arcanic_l1": {x:50,y:0,z:142},
  "tarot_arcanic_l2": {x:50,y:2,z:118},
  "tarot_arcanic_l3": {x:49,y:0,z:130},
  "tarot_arcanic_l4": {x:50,y:0,z:144},
  "tarot_arcanic_l5": {x:49,y:0,z:116},
  "tarot_arcanic_l6": {x:51.5,y:34,z:124},
  "kabbalistic_l1": {x:49.5,y:0,z:162},
  "kabbalistic_l2": {x:50,y:1,z:130},
  "kabbalistic_l3": {x:50,y:0,z:140},
  "kabbalistic_l4": {x:50,y:0,z:128},
  "kabbalistic_l5": {x:50,y:5,z:118},
  "kabbalistic_l6": {x:50,y:61,z:114},
  "slavic_l5": {x:51,y:3,z:122},
  "slavic_l6": {x:50,y:60,z:124},
  "gnostic_l2": {x:49.5,y:59,z:196},
  "gnostic_l3": {x:50,y:4,z:120},
  "gnostic_l4": {x:50,y:0,z:126},
  "gnostic_l5": {x:52,y:1,z:140},
  "gnostic_l6": {x:51,y:5,z:114},
  "daoist_l1": {x:50,y:19,z:122},
  "daoist_l2": {x:52.5,y:0,z:134},
  "daoist_l3": {x:50,y:6,z:130},
  "daoist_l4": {x:50,y:0,z:128},
  "daoist_l5": {x:49.5,y:0,z:118},
  "daoist_l6": {x:49.5,y:77,z:120},
  "egyptian_l1": {x:49.5,y:0,z:138},
  "egyptian_l2": {x:49,y:17,z:134},
  "egyptian_l3": {x:50,y:1,z:174},
  "egyptian_l4": {x:49.5,y:0,z:114},
  "egyptian_l5": {x:49.5,y:12,z:150},
  "egyptian_l6": {x:50.5,y:53,z:112},
  "mayan_l1": {x:49.5,y:0,z:142},
  "mayan_l2": {x:49,y:1,z:132},
  "mayan_l3": {x:50.5,y:0,z:124},
  "mayan_l4": {x:49.5,y:26,z:132},
  "mayan_l5": {x:50,y:1,z:126},
  "mayan_l6": {x:52.5,y:92,z:130},
  "aztec_mexica_l1": {x:49.5,y:0,z:120},
  "aztec_mexica_l2": {x:49.5,y:0,z:118},
  "aztec_mexica_l3": {x:50,y:0,z:118},
  "aztec_mexica_l4": {x:49.5,y:54,z:112},
  "aztec_mexica_l5": {x:50,y:0,z:142},
  "aztec_mexica_l6": {x:48,y:100,z:122},
  "chinese_iching_l1": {x:52.5,y:2,z:152},
  "chinese_iching_l2": {x:49,y:0,z:140},
  "chinese_iching_l3": {x:49.5,y:0,z:144},
  "chinese_iching_l4": {x:50,y:0,z:132},
  "chinese_iching_l5": {x:51.5,y:8,z:124},
  "chinese_iching_l6": {x:50.5,y:97,z:118},
  "norse_l1": {x:50,y:7,z:120},
  "norse_l2": {x:50,y:0,z:124},
  "norse_l3": {x:50,y:0,z:128},
  "norse_l4": {x:50,y:0,z:120},
  "norse_l5": {x:50,y:0,z:124},
  "norse_l6": {x:50,y:100,z:118},
  "shamanic_l1": {x:49.5,y:0,z:124},
  "shamanic_l2": {x:49.5,y:1,z:142},
  "shamanic_l3": {x:50,y:0,z:122},
  "shamanic_l4": {x:50,y:13,z:104},
  "shamanic_l5": {x:50,y:2,z:142},
  "shamanic_l6": {x:50,y:100,z:120},
  "buddhist_mahayana_l1": {x:50,y:0,z:124},
  "buddhist_mahayana_l2": {x:49.5,y:1,z:132},
  "buddhist_mahayana_l3": {x:50,y:0,z:116},
  "buddhist_mahayana_l4": {x:50,y:40,z:108},
  "buddhist_mahayana_l5": {x:50,y:0,z:134},
  "buddhist_mahayana_l6": {x:50,y:100,z:126},
  "celtic_l1": {x:51,y:1,z:158},
  "celtic_l2": {x:50,y:0,z:148},
  "celtic_l3": {x:50,y:0,z:146},
  "celtic_l4": {x:50,y:0,z:128},
  "celtic_l5": {x:50,y:0,z:140},
  "celtic_l6": {x:50,y:100,z:118},
  "islamic_sufi_nur_l1": {x:50,y:0,z:124},
  "islamic_sufi_nur_l2": {x:50,y:9,z:132},
  "islamic_sufi_nur_l3": {x:50,y:0,z:138},
  "islamic_sufi_nur_l4": {x:55.5,y:13,z:114},
  "islamic_sufi_nur_l5": {x:50,y:0,z:128},
  "islamic_sufi_nur_l6": {x:50,y:55,z:118},
  "christian_mystical_grail_l1": {x:50,y:0,z:166},
  "christian_mystical_grail_l2": {x:49.5,y:1,z:132},
  "christian_mystical_grail_l3": {x:46.5,y:2,z:120},
  "christian_mystical_grail_l4": {x:48.5,y:6,z:126},
  "christian_mystical_grail_l5": {x:49.5,y:7,z:126},
  "christian_mystical_grail_l6": {x:49,y:86,z:122},
  "atlantean_lemurian_l1": {x:50,y:17,z:116},
  "atlantean_lemurian_l2": {x:50,y:0,z:152},
  "atlantean_lemurian_l3": {x:50,y:0,z:126},
  "atlantean_lemurian_l4": {x:50,y:0,z:130},
  "atlantean_lemurian_l5": {x:50,y:0,z:118},
  "atlantean_lemurian_l6": {x:50,y:50,z:102},
  "shambhala_l1": {x:50,y:0,z:124},
  "shambhala_l2": {x:50,y:0,z:152},
  "shambhala_l3": {x:50,y:0,z:120},
  "shambhala_l4": {x:50,y:50,z:102},
  "shambhala_l5": {x:50,y:1,z:126},
  "shambhala_l6": {x:50,y:77,z:108},
  "gene_keys_l1": {x:50,y:0,z:114},
  "gene_keys_l2": {x:49.5,y:2,z:126},
  "gene_keys_l3": {x:50,y:0,z:118},
  "gene_keys_l4": {x:50,y:0,z:120},
  "gene_keys_l5": {x:50,y:12,z:158},
  "gene_keys_l6": {x:50,y:100,z:124},
  "astrological_l1": {x:50,y:0,z:126},
  "astrological_l2": {x:50,y:15,z:114},
  "astrological_l3": {x:50,y:0,z:128},
  "astrological_l4": {x:50,y:0,z:112},
  "astrological_l5": {x:50,y:0,z:132},
  "astrological_l6": {x:50,y:59,z:110},
  "cosmic_galactic_l1": {x:50,y:1,z:118},
  "cosmic_galactic_l2": {x:50,y:0,z:120},
  "cosmic_galactic_l3": {x:50,y:12,z:114},
  "cosmic_galactic_l4": {x:51,y:0,z:128},
  "cosmic_galactic_l5": {x:50,y:0,z:134},
  "cosmic_galactic_l6": {x:52.5,y:65,z:110},
  "shinto_l1": {x:50,y:0,z:122},
  "shinto_l2": {x:50,y:0,z:120},
  "shinto_l3": {x:50,y:0,z:128},
  "shinto_l4": {x:50,y:4,z:114},
  "shinto_l5": {x:50,y:0,z:142},
  "shinto_l6": {x:50,y:90,z:114},
  "technomagical_l1": {x:50,y:0,z:116},
  "technomagical_l2": {x:50,y:12,z:114},
  "technomagical_l3": {x:50,y:0,z:112},
  "technomagical_l4": {x:50,y:0,z:126},
  "technomagical_l5": {x:50,y:3,z:128},
  "technomagical_l6": {x:53.5,y:60,z:108},
  "advaita_siddha_l1": {x:50,y:7,z:132},
  "advaita_siddha_l2": {x:50,y:0,z:128},
  "advaita_siddha_l3": {x:50,y:4,z:120},
  "advaita_siddha_l4": {x:53.5,y:11,z:120},
  "advaita_siddha_l5": {x:51,y:11,z:130},
  "advaita_siddha_l6": {x:50,y:100,z:108},
  "julian_byzantine_l1": {x:50,y:46,z:108},
  "julian_byzantine_l2": {x:50,y:14,z:114},
  "julian_byzantine_l3": {x:50,y:0,z:118},
  "julian_byzantine_l4": {x:52.5,y:0,z:136},
  "julian_byzantine_l5": {x:51,y:0,z:124},
  "julian_byzantine_l6": {x:50,y:100,z:126}
};
/* Persist per-art focus. PERSONAL per-browser overrides live in localStorage
   and are used for LIVE PREVIEW while tuning; they are NOT shared with other
   users. BAKED_FOCUS above is what actually ships to everyone. */
var _bgMap={}; try{ _bgMap=JSON.parse(localStorage.getItem('awara_bgfocus_v1')||'{}')||{}; }catch(e){ _bgMap={}; }
var _bgGlobal=null; try{ _bgGlobal=JSON.parse(localStorage.getItem('awara_bgfocus_global_v1')||'null'); }catch(e){ _bgGlobal=null; }
var _curKey='';   /* stable per-art key: slug_lN (robust to url cache-busters) */
/* One-time migration to the stable-key scheme (v35): old data was keyed by the
   full image URL and every save leaked into the shared global, which made
   unconfigured matrices drift. Wipe personal cache once for a clean start. */
try{ if(localStorage.getItem('awara_bgfocus_scheme')!=='2'){ localStorage.removeItem('awara_bgfocus_v1'); localStorage.removeItem('awara_bgfocus_global_v1'); localStorage.setItem('awara_bgfocus_scheme','2'); _bgMap={}; _bgGlobal=null; } }catch(e){}
/* Priority: personal live edit > baked-in shared default > center. */
function bgApplyFor(k){ try{ var s=(k&&_bgMap[k])?_bgMap[k]:((k&&BAKED_FOCUS[k])?BAKED_FOCUS[k]:_bgGlobal); if(s){ bgFocus(s.x,s.y,s.z); } else { bgFocus(50,50,100); } var r=document.getElementById('awBgPadRead'); if(r) r.textContent='X:'+_bgX+' Y:'+_bgY+' Zoom:'+_bgZoom; }catch(e){} }
function bgSaveCurrent(){ try{ var k=_curKey; if(!k){ var a=cur(); if(a) k=a.slug+'_l'+a.lv; } if(k){ _curKey=k; _bgMap[k]={x:_bgX,y:_bgY,z:_bgZoom}; localStorage.setItem('awara_bgfocus_v1', JSON.stringify(_bgMap)); } var r=document.getElementById('awBgPadRead'); if(r) r.textContent=(k?'Сохранено (у тебя) \u2713 ':'Нет арта ')+'X:'+_bgX+' Y:'+_bgY+' Zoom:'+_bgZoom; return {key:k, saved:(k?_bgMap[k]:null)}; }catch(e){} }
function bgSaveGlobal(){ try{ _bgGlobal={x:_bgX,y:_bgY,z:_bgZoom}; localStorage.setItem('awara_bgfocus_global_v1', JSON.stringify(_bgGlobal)); _bgMap={}; localStorage.setItem('awara_bgfocus_v1','{}'); var r=document.getElementById('awBgPadRead'); if(r) r.textContent='Для всех \u2713 X:'+_bgX+' Y:'+_bgY+' Zoom:'+_bgZoom; return _bgGlobal; }catch(e){} }
function bgClearAll(){ try{ _bgMap={}; _bgGlobal=null; localStorage.removeItem('awara_bgfocus_v1'); localStorage.removeItem('awara_bgfocus_global_v1'); bgReset(); var r=document.getElementById('awBgPadRead'); if(r) r.textContent='Сброшено \u2713 X:50 Y:50 Zoom:100'; return true; }catch(e){} }
function bgExport(){ try{ var data={map:_bgMap, global:_bgGlobal, cur:_cur, curKey:_curKey, live:{x:_bgX,y:_bgY,z:_bgZoom}, ls1:localStorage.getItem('awara_bgfocus_v1'), lsg:localStorage.getItem('awara_bgfocus_global_v1')}; var j=JSON.stringify(data); try{ console.log('[AWARA bgfocus] '+j); }catch(e){} try{ window.prompt('Скопируй весь текст и пришли мне:', j); }catch(e){} return j; }catch(e){ return '{}'; } }
/* On-screen control pad: pan the background up/down/left/right + zoom via a floating button. Shows live X/Y/Zoom numbers so we can bake them later. */
function mountBgPad(){ try{ var ph=document.querySelector('.phone'); if(!ph) return; if(document.getElementById('awBgPad-btn')) return; if(!document.getElementById('awBgPadCss')){ var st=document.createElement('style'); st.id='awBgPadCss'; st.textContent='#awBgPad-btn{position:absolute;right:12px;bottom:86px;width:44px;height:44px;border-radius:50%;z-index:99999;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;background:linear-gradient(160deg,rgba(201,168,76,.95),rgba(123,98,201,.95));color:#0b0a1e;border:1px solid rgba(255,255,255,.35);box-shadow:0 6px 18px rgba(0,0,0,.45)}#awBgPad{position:absolute;right:12px;bottom:138px;z-index:99999;display:none;flex-direction:column;gap:7px;padding:12px;border-radius:16px;min-width:170px;background:linear-gradient(158deg,rgba(26,14,48,.96),rgba(8,5,20,.97));border:1px solid rgba(150,118,224,.4);box-shadow:0 12px 34px rgba(0,0,0,.6)}#awBgPad.on{display:flex}#awBgPad .awbp-title{color:#f5d885;font-size:12px;text-align:center;letter-spacing:.5px}#awBgPad .awbp-row{display:flex;justify-content:center;gap:6px}#awBgPad button{cursor:pointer;background:rgba(255,255,255,.08);color:#ece9f5;border:1px solid rgba(150,118,224,.35);border-radius:10px;padding:8px 0;width:46px;font-size:16px}#awBgPad button.wide{width:80px;font-size:12px}#awBgPad button:active{background:rgba(201,168,76,.4)}#awBgPad .awbp-read{color:#c9a84c;font-size:11px;text-align:center;margin-top:2px}'; (document.head||document.documentElement).appendChild(st); } var btn=document.createElement('div'); btn.id='awBgPad-btn'; btn.textContent='\u2699'; btn.title='Пульт управления фоном'; var pad=document.createElement('div'); pad.id='awBgPad'; pad.innerHTML='<div class="awbp-title">Пульт · Фон</div><div class="awbp-row"><button data-a="up">\u2191</button></div><div class="awbp-row"><button data-a="left">\u2190</button><button data-a="reset">\u27F3</button><button data-a="right">\u2192</button></div><div class="awbp-row"><button data-a="down">\u2193</button></div><div class="awbp-row"><button class="wide" data-a="zin">+ прибл.</button><button class="wide" data-a="zout">- отдал.</button></div><div class="awbp-row"><button class="wide" data-a="save" style="background:rgba(201,168,76,.32);border-color:rgba(201,168,76,.6)">Сохранить</button><button class="wide" data-a="export">Экспорт</button></div><div class="awbp-row"><button class="wide" data-a="saveall" style="background:rgba(123,98,201,.42);border-color:rgba(150,118,224,.7)">Для всех</button><button class="wide" data-a="clear">Сброс</button></div><div class="awbp-read" id="awBgPadRead">X:50 Y:50 Zoom:100</div>'; ph.appendChild(btn); ph.appendChild(pad); btn.addEventListener('click', function(e){ e.stopPropagation(); pad.classList.toggle('on'); }); var _holdT=null,_holdI=null; function _stopHold(){ if(_holdT){clearTimeout(_holdT);_holdT=null;} if(_holdI){clearInterval(_holdI);_holdI=null;} } function _startHold(a){ _stopHold(); bgPadAct(a); if(a==='save'||a==='saveall'||a==='clear'||a==='export'||a==='reset') return; _holdT=setTimeout(function(){ var n=0; _holdI=setInterval(function(){ n++; var reps=(n>45?6:(n>20?3:1)); for(var i=0;i<reps;i++) bgPadAct(a); }, 55); }, 300); } pad.addEventListener('pointerdown', function(e){ var b=(e.target&&e.target.closest)?e.target.closest('button'):null; if(!b) return; e.preventDefault(); e.stopPropagation(); _startHold(b.getAttribute('data-a')); }); pad.addEventListener('pointerup', _stopHold); pad.addEventListener('pointercancel', _stopHold); pad.addEventListener('pointerleave', _stopHold); try{ window.addEventListener('pointerup', _stopHold); window.addEventListener('pointercancel', _stopHold); }catch(e){} }catch(e){} }
function bgPadAct(a){ try{ var STEP=1, SX=0.5, ZS=2; if(a==='save'){ bgSaveCurrent(); return; } if(a==='saveall'){ bgSaveGlobal(); return; } if(a==='clear'){ bgClearAll(); return; } if(a==='export'){ bgExport(); return; } if(a==='up'){ if(_bgZoom<=100) _bgZoom=112; _bgY=Math.min(100,_bgY+STEP); } else if(a==='down'){ if(_bgZoom<=100) _bgZoom=112; _bgY=Math.max(0,_bgY-STEP); } else if(a==='left'){ if(_bgZoom<=100) _bgZoom=112; _bgX=Math.min(100,_bgX+SX); } else if(a==='right'){ if(_bgZoom<=100) _bgZoom=112; _bgX=Math.max(0,_bgX-SX); } else if(a==='zin'){ _bgZoom=Math.min(300,_bgZoom+ZS); } else if(a==='zout'){ _bgZoom=Math.max(100,_bgZoom-ZS); } else if(a==='reset'){ _bgX=50; _bgY=50; _bgZoom=100; } bgFocus(_bgX,_bgY,_bgZoom); var r=document.getElementById('awBgPadRead'); if(r) r.textContent='X:'+_bgX+' Y:'+_bgY+' Zoom:'+_bgZoom; }catch(e){} }
setTimeout(mountBgPad,800); setTimeout(mountBgPad,2000); setTimeout(mountBgPad,3600);

window.AwaraWindowBg={ paint:paint, setOpacity:setOpacity, setEnabled:setEnabled, setPanel:setPanel, current:cur, orbRefine:orbRefine, orbSize:orbSize, matchTigelToIstok:matchTigelToIstok, matchDaimonToIstok:matchDaimonToIstok, tuneTigelHeader:tuneTigelHeader, tuneDaimonHeader:tuneDaimonHeader, bgFocus:bgFocus, bgReset:bgReset, bgPad:mountBgPad, bgSave:bgSaveCurrent, bgSaveAll:bgSaveGlobal, bgClearAll:bgClearAll, bgExport:bgExport, setMotion:setMotion, __v:35 };
})();
