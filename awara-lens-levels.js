/* ============================================================
   AWARA - LENS LEVELS (v2)
   Connects two data packs to the game (33 lenses x 6 steps):
     data/lens_level_prompts.json  -> image prompt + img/audio file paths
     data/lens_audio_prompts.json  -> full Suno-style audio prompts
   Behavior:
     1) Augments window.lensAscensionPrompt with the canonical image
        prompt of the dominant lens/level (feeds the day-card prompt).
     2) Injects an "etalon stupeni" block into the Mandala hero slot
        (#mnd-gen-hero): a lens picker + level 1-6 buttons, the
        reference image, audio player, and copyable image/audio prompts.
        The picker is an ISOLATED preview (does NOT mutate game state);
        when nothing is picked it follows the active lens/level.
   Additive. Does NOT edit mandala/ascension. Must load AFTER ascension.
   Comments/anchors ASCII only; Cyrillic via \u escapes.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraLensLevels) return; window.__awaraLensLevels=true;

var IMG_ROOT='exports/generated_cards/';
var AUD_ROOT='exports/audio/';
var DATA=null, ADATA=null;
var _sel=null; /* isolated preview selection {slug,lv} or null = follow active */

var LV_NAME=['','\u0444\u0438\u0437\u0438\u043a\u0430','\u043f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u0435','\u0433\u0430\u0440\u043c\u043e\u043d\u0438\u044f','\u0441\u0438\u044f\u043d\u0438\u0435','\u0432\u043e\u0441\u0445\u043e\u0434','\u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435'];
var ETALON='\u042d\u0442\u0430\u043b\u043e\u043d \u0441\u0442\u0443\u043f\u0435\u043d\u0438';
var PROMPTS='\u041f\u0440\u043e\u043c\u0442\u044b \u0441\u0442\u0443\u043f\u0435\u043d\u0438';
var L_IMG='\u041a\u0430\u0440\u0442\u0438\u043d\u0430';
var L_AUD='\u041c\u0443\u0437\u044b\u043a\u0430';

function S(){ try{ if(typeof STATE!=='undefined'&&STATE) return STATE; }catch(e){} return null; }
function matKeys(){ try{ if(typeof MATKEYS!=='undefined'&&MATKEYS&&MATKEYS.length) return MATKEYS; }catch(e){} return []; }

function slugList(){ if(!DATA) return []; var out=[],k; for(k in DATA){ if(DATA.hasOwnProperty(k)&&k!=='_meta') out.push(k); } return out; }
function getLevel(slug,lv){ if(!DATA||!slug) return null; var m=DATA[slug]; if(!m) return null; return m[String(lv)]||null; }
function getAudioPrompt(slug,lv){ if(!ADATA||!slug) return null; var m=ADATA[slug]; if(!m) return null; return m[String(lv)]||null; }
function imgUrl(slug,lv){ var rec=getLevel(slug,lv); var rel=(rec&&rec.img)?rec.img:('lens_levels/'+slug+'_l'+lv+'.webp'); return IMG_ROOT+rel; }
function audUrl(slug,lv){ var rec=getLevel(slug,lv); var rel=(rec&&rec.audio)?rec.audio:('lens_levels/'+slug+'_l'+lv+'.mp3'); return AUD_ROOT+rel; }

function levelOf(key){ try{ if(window.AwaraAscension&&AwaraAscension.level) return AwaraAscension.level(key); }catch(e){} return 1; }
function slugOf(key){ try{ if(window.AwaraLens&&AwaraLens.slugFor) return AwaraLens.slugFor(key); }catch(e){} return null; }
function deepestOf(keys){
  if(!keys||!keys.length) return null;
  var best=null,bl=0,i;
  for(i=0;i<keys.length;i++){ var lv=levelOf(keys[i]); if(lv>=bl){ bl=lv; best=keys[i]; } }
  if(best==null) return null;
  var slug=slugOf(best); if(!slug) return null;
  return {key:best,slug:slug,lv:bl||1};
}
function active(){ var s=S(); var keys=(s&&s.mats)?s.mats:[]; return deepestOf(keys); }
function current(){
  if(_sel&&_sel.slug) return {slug:_sel.slug, lv:_sel.lv||1};
  var a=active(); if(a) return {slug:a.slug, lv:a.lv};
  var ks=slugList(); if(ks.length) return {slug:ks[0], lv:1};
  return null;
}

/* ---- augment the ascension prompt feed (keep original) ---- */
(function(){
  var orig=window.lensAscensionPrompt;
  function wrapped(keys){
    var base='';
    try{ base=orig?orig(keys):''; }catch(e){ base=''; }
    try{
      var src=keys||((S()&&S().mats)||[]);
      var a=deepestOf(src);
      if(a){ var rec=getLevel(a.slug,a.lv); if(rec&&rec.prompt){ base+=' || Canonical ascension portrait for the dominant lens "'+a.slug+'" at level '+a.lv+'/6 (use as strong visual reference): '+rec.prompt; } }
    }catch(e){}
    return base;
  }
  wrapped._origPrompt=orig||null; wrapped.__llWrapped=true;
  try{ window.lensAscensionPrompt=wrapped; }catch(e){}
})();

/* ---- styles ---- */
function ensureStyle(){
  if(document.querySelector('style[data-awara-ll]')) return;
  try{
    var st=document.createElement('style'); st.setAttribute('data-awara-ll','1');
    st.textContent='.ll-ref{margin:12px auto 0;max-width:220px;text-align:center}.ll-cap{font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.06em;color:var(--lens-c1,#ffd27a);margin-bottom:6px}.ll-ctl{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}.ll-sel{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--lens-edge,rgba(201,168,76,.22));border-radius:9px;color:#ece9f5;font-family:JetBrains Mono,monospace;font-size:11px;padding:6px;outline:none}.ll-lvrow{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}.ll-lvrow button{border:1px solid var(--lens-edge,rgba(201,168,76,.22));background:rgba(255,255,255,.04);color:#ece9f5;border-radius:7px;padding:5px 0;font-family:JetBrains Mono,monospace;font-size:11px;cursor:pointer}.ll-lvrow button.on{background:linear-gradient(120deg,#ffd27a,#ffb347);color:#0a0a14;border-color:#ffd27a}.ll-reset{border:1px solid var(--lens-edge,rgba(201,168,76,.22));background:transparent;color:var(--muted,#8e88a4);border-radius:8px;padding:4px;font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.08em;cursor:pointer}.ll-img{display:block;width:120px;aspect-ratio:3/4;object-fit:cover;margin:0 auto 8px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer}.ll-aud{display:block;width:200px;height:32px;margin:0 auto 8px}.ll-pr>summary{cursor:pointer;font-size:11px;color:var(--muted,#8e88a4);list-style:none}.ll-pr>summary::-webkit-details-marker{display:none}.ll-lbl{font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#8e88a4);margin-top:6px;text-align:left}.ll-ta{width:100%;min-height:58px;background:rgba(255,255,255,.04);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:8px;color:var(--spark,#ffd27a);padding:7px;font-family:JetBrains Mono,monospace;font-size:10px;margin-top:3px;box-sizing:border-box}';
    document.head.appendChild(st);
  }catch(e){}
}

/* ---- the etalon block inside the mandala hero slot ---- */
function decorate(){
  ensureStyle();
  var gh=document.getElementById('mnd-gen-hero'); if(!gh) return;
  var old=gh.querySelector('#ll-ref'); if(old&&old.parentNode) old.parentNode.removeChild(old);
  if(!DATA) return;
  var a=current(); if(!a||!a.slug) return;
  var rec=getLevel(a.slug,a.lv);

  var box=document.createElement('div'); box.id='ll-ref'; box.className='ll-ref';

  var cap=document.createElement('div'); cap.className='ll-cap';
  cap.textContent='\u27e1 '+ETALON+' \u00b7 '+a.slug+' \u00b7 '+a.lv+'/6 \u00b7 '+(LV_NAME[a.lv]||'');
  box.appendChild(cap);

  /* lens + level picker (isolated preview) */
  var ctl=document.createElement('div'); ctl.className='ll-ctl';
  var sel=document.createElement('select'); sel.className='ll-sel';
  slugList().forEach(function(sg){ var o=document.createElement('option'); o.value=sg; o.textContent=sg; if(sg===a.slug) o.selected=true; sel.appendChild(o); });
  sel.onchange=function(){ _sel={slug:sel.value, lv:a.lv||1}; decorate(); };
  ctl.appendChild(sel);
  var lvrow=document.createElement('div'); lvrow.className='ll-lvrow';
  for(var n=1;n<=6;n++){ (function(k){ var b=document.createElement('button'); b.type='button'; b.textContent=String(k); if(k===a.lv) b.className='on'; b.onclick=function(){ _sel={slug:a.slug, lv:k}; decorate(); }; lvrow.appendChild(b); })(n); }
  ctl.appendChild(lvrow);
  if(_sel){ var rs=document.createElement('button'); rs.type='button'; rs.className='ll-reset'; rs.textContent='\u21ba live'; rs.onclick=function(){ _sel=null; decorate(); }; ctl.appendChild(rs); }
  box.appendChild(ctl);

  var im=document.createElement('img'); im.className='ll-img'; im.alt='ref'; im.src=imgUrl(a.slug,a.lv);
  im.onerror=function(){ this.style.display='none'; };
  im.onclick=function(){ try{ window.open(this.src,'_blank'); }catch(e){} };
  box.appendChild(im);

  var au=document.createElement('audio'); au.className='ll-aud'; au.controls=true; au.preload='none'; au.src=audUrl(a.slug,a.lv);
  au.onerror=function(){ this.style.display='none'; };
  box.appendChild(au);

  var det=document.createElement('details'); det.className='ll-pr';
  var sm=document.createElement('summary'); sm.textContent=PROMPTS; det.appendChild(sm);
  var l1=document.createElement('div'); l1.className='ll-lbl'; l1.textContent=L_IMG; det.appendChild(l1);
  var t1=document.createElement('textarea'); t1.readOnly=true; t1.className='ll-ta'; t1.value=(rec&&rec.prompt)||''; det.appendChild(t1);
  var l2=document.createElement('div'); l2.className='ll-lbl'; l2.textContent=L_AUD; det.appendChild(l2);
  var t2=document.createElement('textarea'); t2.readOnly=true; t2.className='ll-ta'; t2.value=getAudioPrompt(a.slug,a.lv)||''; det.appendChild(t2);
  box.appendChild(det);

  gh.appendChild(box);
}

/* ---- hook the mandala render so the block survives re-renders ---- */
function hookRender(){
  try{
    if(window.AwaraMandala&&AwaraMandala.render&&!AwaraMandala.render.__llWrapped){
      var _r=AwaraMandala.render;
      var w=function(){ var x=_r.apply(this,arguments); try{ decorate(); }catch(e){} return x; };
      w.__llWrapped=true; w._orig=_r;
      AwaraMandala.render=w;
      return true;
    }
  }catch(e){}
  return false;
}

function afterLoad(){
  try{ window.dispatchEvent(new Event('awara-lens-levels-ready')); }catch(e){}
  try{ decorate(); }catch(e){}
}
function loadData(){
  try{ fetch('data/lens_level_prompts.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){ DATA=j; afterLoad(); }).catch(function(){}); }catch(e){}
  try{ fetch('data/lens_audio_prompts.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){ ADATA=j; afterLoad(); }).catch(function(){}); }catch(e){}
}

ensureStyle();
loadData();
hookRender();
setTimeout(hookRender,1200);
setTimeout(hookRender,3000);
setTimeout(function(){ try{ decorate(); }catch(e){} },1500);

window.LensLevels={ get:getLevel, audioPrompt:getAudioPrompt, img:imgUrl, audio:audUrl, active:active, current:current,
  preview:function(slug,lv){ _sel={slug:slug,lv:lv||1}; decorate(); }, clearPreview:function(){ _sel=null; decorate(); },
  data:function(){return DATA;}, adata:function(){return ADATA;}, refresh:decorate, __v:2 };
})();
