/* ============================================================
   AWARA · PYRAMID MAP — пирамидальная карта локаций восхождения
   Данные: data/all_pyramid_locations.json (1077 лок = 891 pyramid + 186 mythic).
   6 ярусов = 6 уровней линзы. Чем выше ярус — тем меньше локаций
   (пирамида). Залоченные ярусы по уровню линзы.
   Мифические локации (из mythic_locations) показывают бейдж редкости.
   Встраивается в #s-tigel после колоды.
   Additive. Не трогает движок.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraPyramidMap) return; window.__awaraPyramidMap=true;

var DATA=null, LOADING=false, FAILED=false;
var _openId=null; /* развёрнутая карточка */

function S(){ try{ return STATE; }catch(e){ return null; } }

/* --- helpers: текущая линза, slug, уровень --- */
function lensSlug(){
  try{ if(window.LensLevels&&LensLevels.current){
    var c=LensLevels.current(); return c&&c.slug?c.slug:'';
  }}catch(e){}
  return '';
}
function lensLevel(){
  try{
    var slug=lensSlug(); if(!slug) return 1;
    if(window.AwaraAscension&&AwaraAscension.level){
      var s=S(); var mats=(s&&s.mats)?s.mats:[];
      for(var i=0;i<mats.length;i++){
        var k=mats[i];
        try{ if(window.AwaraLens&&AwaraLens.slugFor&&AwaraLens.slugFor(k)===slug) return AwaraAscension.level(k); }catch(e){}
      }
      return AwaraAscension.level(null);
    }
  }catch(e){}
  return 1;
}
function lensAccent(){
  try{
    var slug=lensSlug(); if(!slug) return '';
    if(window.lensPalette){
      var pal=lensPalette(slug);
      if(pal&&pal.length) return _vivid(pal);
    }
    if(window.lensStyleFor){
      var st=lensStyleFor(slug);
      if(st&&st.palette) return _vivid(st.palette);
    }
  }catch(e){}
  return '';
}
function _hex2hsl(h){ if(!(h&&h.charAt(0)==='#'&&h.length===7)) return null; var r=parseInt(h.substr(1,2),16)/255,g=parseInt(h.substr(3,2),16)/255,b=parseInt(h.substr(5,2),16)/255; var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0; if(mx!==mn){ var d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); } return {s:s,l:l}; }
function _vivid(arr){ if(!arr||!arr.length) return ''; var best='',bestSc=-1; for(var i=0;i<arr.length;i++){ var c=arr[i]; var hsl=_hex2hsl(c); if(!hsl){ if(bestSc<0){ best=c; bestSc=0; } continue; } var sc=hsl.s*(1-Math.abs(hsl.l-0.5)*1.1); if(sc>bestSc){ bestSc=sc; best=c; } } return best||arr[0]; }

/* --- тир-мета --- */
var TIER_META=[
  null,
  {name:'\u041f\u043e\u0434\u043d\u043e\u0436\u0438\u0435',icon:'\u26fa',sub:'\u0413\u043e\u0440\u043d \u00b7 \u0437\u0435\u043c\u043d\u043e\u0439 \u044f\u0440\u0443\u0441'},
  {name:'\u0421\u043a\u043b\u043e\u043d',icon:'\u2694\ufe0f',sub:'\u0420\u0430\u0441\u043f\u043b\u0430\u0432 \u00b7 \u0438\u0441\u043f\u044b\u0442\u0430\u043d\u0438\u044f'},
  {name:'\u041f\u043b\u0430\u0442\u043e',icon:'\ud83d\udd2e',sub:'\u041c\u0430\u043d\u0434\u0430\u043b\u0430 \u00b7 \u043c\u0443\u0434\u0440\u043e\u0441\u0442\u044c'},
  {name:'\u0425\u0440\u0435\u0431\u0435\u0442',icon:'\ud83d\udc8e',sub:'\u041f\u0440\u0438\u0437\u043c\u0430 \u00b7 \u0442\u0440\u0430\u043d\u0441\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f'},
  {name:'\u0412\u0435\u0440\u0448\u0438\u043d\u0430',icon:'\u2728',sub:'\u0412\u043e\u0440\u043e\u043d\u043a\u0430 \u00b7 \u043e\u0447\u0438\u0449\u0435\u043d\u0438\u0435'},
  {name:'\u041f\u0438\u043a',icon:'\ud83d\udd25',sub:'\u041a\u0432\u0430\u043d\u0442\u043e\u0432\u044b\u0439 \u00b7 \u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435'}
];

var RARITY_LABEL={legendary:'\u041b\u0415\u0413\u0415\u041d\u0414\u0410\u0420\u041d\u041e\u0415',epic:'\u042d\u041f\u0418\u0427\u0415\u0421\u041a\u041e\u0415',rare:'\u0420\u0415\u0414\u041a\u041e\u0415'};
var RARITY_CLR={legendary:'#ffd700',epic:'#c266ff',rare:'#3ea8ff'};

var TYPE_LABELS={village:'\u0434\u0435\u0440\u0435\u0432\u043d\u044f',temple:'\u0445\u0440\u0430\u043c',cave:'\u043f\u0435\u0449\u0435\u0440\u0430',mountain:'\u0433\u043e\u0440\u0430',portal:'\u043f\u043e\u0440\u0442\u0430\u043b',throne:'\u0442\u0440\u043e\u043d',garden:'\u0441\u0430\u0434',forest:'\u043b\u0435\u0441',library:'\u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430',observatory:'\u043e\u0431\u0441\u0435\u0440\u0432\u0430\u0442\u043e\u0440\u0438\u044f',forge:'\u043a\u0443\u0437\u043d\u044f',labyrinth:'\u043b\u0430\u0431\u0438\u0440\u0438\u043d\u0442',bridge:'\u043c\u043e\u0441\u0442',river:'\u0440\u0435\u043a\u0430',market:'\u0440\u044b\u043d\u043e\u043a',arena:'\u0430\u0440\u0435\u043d\u0430',sanctuary:'\u0441\u0432\u044f\u0442\u0438\u043b\u0438\u0449\u0435',ruins:'\u0440\u0443\u0438\u043d\u044b',nexus:'\u043d\u0435\u043a\u0441\u0443\u0441',wellspring:'\u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a',summit:'\u0432\u0435\u0440\u0448\u0438\u043d\u0430',void:'\u043f\u0443\u0441\u0442\u043e\u0442\u0430',node:'\u0443\u0437\u0435\u043b',chamber:'\u043f\u0430\u043b\u0430\u0442\u0430',oasis:'\u043e\u0430\u0437\u0438\u0441',monastery:'\u043c\u043e\u043d\u0430\u0441\u0442\u044b\u0440\u044c',citadel:'\u0446\u0438\u0442\u0430\u0434\u0435\u043b\u044c',grove:'\u0440\u043e\u0449\u0430',workshop:'\u043c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0430\u044f',axis_mundi:'\u043e\u0441\u044c \u043c\u0438\u0440\u0430',divine_mountain:'\u0441\u0432\u044f\u0449\u0435\u043d\u043d\u0430\u044f \u0433\u043e\u0440\u0430',sacred_center:'\u0441\u0432\u044f\u0449\u0435\u043d\u043d\u044b\u0439 \u0446\u0435\u043d\u0442\u0440',cosmic_ocean:'\u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043e\u043a\u0435\u0430\u043d',divine_realm:'\u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u043c\u0438\u0440',sacred_grove:'\u0441\u0432\u044f\u0449\u0435\u043d\u043d\u0430\u044f \u0440\u043e\u0449\u0430',mythic_city:'\u043c\u0438\u0444\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0433\u043e\u0440\u043e\u0434',celestial_realm:'\u043d\u0435\u0431\u0435\u0441\u043d\u044b\u0439 \u043c\u0438\u0440',underworld:'\u043f\u043e\u0434\u0437\u0435\u043c\u043d\u044b\u0439 \u043c\u0438\u0440',sacred_river:'\u0441\u0432\u044f\u0449\u0435\u043d\u043d\u0430\u044f \u0440\u0435\u043a\u0430',primordial_sea:'\u043f\u0435\u0440\u0432\u043e\u0431\u044b\u0442\u043d\u043e\u0435 \u043c\u043e\u0440\u0435',mythic_location:'\u043c\u0438\u0444\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u043c\u0435\u0441\u0442\u043e',cosmic_tree:'\u0434\u0440\u0435\u0432\u043e \u043c\u0438\u0440\u0430',sacred_mountain:'\u0441\u0432\u044f\u0449\u0435\u043d\u043d\u0430\u044f \u0433\u043e\u0440\u0430',world_tree:'\u0434\u0440\u0435\u0432\u043e \u043c\u0438\u0440\u043e\u0432',sky_realm:'\u043d\u0435\u0431\u0435\u0441\u043d\u044b\u0439 \u043f\u0440\u0435\u0434\u0435\u043b',creation_place:'\u043c\u0435\u0441\u0442\u043e \u0442\u0432\u043e\u0440\u0435\u043d\u0438\u044f',paradise:'\u0440\u0430\u0439',cosmic_axis:'\u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043e\u0441\u044c'};

/* --- load --- */
function load(cb){
  if(DATA){ cb(); return; }
  if(LOADING) return;
  LOADING=true;
  fetch('data/all_pyramid_locations.json').then(function(r){ return r.json(); }).then(function(j){
    DATA=Array.isArray(j)?j:[]; LOADING=false; cb();
  }).catch(function(){ FAILED=true; LOADING=false; cb(); });
}

/* --- styles --- */
function styleOnce(){
  if(document.querySelector('style[data-pyramid-map]')) return;
  var st=document.createElement('style'); st.setAttribute('data-pyramid-map','1');
  st.textContent='\
#pyramidMap{margin-top:24px;padding-bottom:12px}\
#pyramidMap .pm-hdr{display:flex;align-items:baseline;justify-content:space-between;margin:0 2px 14px}\
#pyramidMap .pm-title{font-family:Cinzel,serif;font-size:18px;letter-spacing:.04em;color:var(--pm-accent,var(--gold,#c9a84c))}\
#pyramidMap .pm-sub{font-size:12px;color:var(--muted,#8e88a4)}\
\
#pyramidMap .pm-tier{margin-bottom:16px;position:relative}\
#pyramidMap .pm-tier-hdr{display:flex;align-items:center;gap:10px;margin-bottom:8px;cursor:default}\
#pyramidMap .pm-tier-icon{font-size:20px;width:28px;text-align:center}\
#pyramidMap .pm-tier-label{font-family:Cinzel,serif;font-size:15px;color:var(--text,#ece9f5)}\
#pyramidMap .pm-tier-sub{font-size:11px;color:var(--muted,#8e88a4);margin-left:4px}\
#pyramidMap .pm-tier-count{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--pm-accent,var(--gold));margin-left:auto;opacity:.7}\
\
#pyramidMap .pm-tier.locked .pm-tier-hdr{opacity:.4;filter:grayscale(1)}\
#pyramidMap .pm-tier.locked .pm-grid{display:none}\
#pyramidMap .pm-tier.locked .pm-lock-msg{display:block}\
#pyramidMap .pm-lock-msg{display:none;font-size:12px;color:var(--muted);padding:4px 0 0 38px;font-style:italic}\
\
#pyramidMap .pm-grid{display:flex;flex-wrap:wrap;gap:8px;padding-left:38px}\
#pyramidMap .pm-loc{flex:1 1 calc(50% - 4px);min-width:130px;border:1px solid var(--line,rgba(255,255,255,.08));border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.02);cursor:pointer;transition:all .3s ease;position:relative;overflow:hidden}\
#pyramidMap .pm-loc:hover{background:rgba(255,255,255,.05);border-color:var(--pm-accent,var(--gold));box-shadow:0 4px 20px -8px var(--pm-accent,rgba(201,168,76,.3))}\
#pyramidMap .pm-loc.open{flex:1 1 100%;background:rgba(255,255,255,.04);border-color:var(--pm-accent,var(--gold));box-shadow:0 6px 28px -10px var(--pm-accent,rgba(201,168,76,.3))}\
\
#pyramidMap .pm-loc.mythic{border-style:solid;border-width:1px}\
#pyramidMap .pm-loc.mythic.r-legendary{border-color:rgba(255,215,0,.35);background:linear-gradient(135deg,rgba(255,215,0,.06),rgba(255,255,255,.02))}\
#pyramidMap .pm-loc.mythic.r-legendary:hover{border-color:rgba(255,215,0,.6);box-shadow:0 4px 24px -6px rgba(255,215,0,.3)}\
#pyramidMap .pm-loc.mythic.r-epic{border-color:rgba(194,102,255,.3);background:linear-gradient(135deg,rgba(194,102,255,.06),rgba(255,255,255,.02))}\
#pyramidMap .pm-loc.mythic.r-epic:hover{border-color:rgba(194,102,255,.55);box-shadow:0 4px 24px -6px rgba(194,102,255,.3)}\
#pyramidMap .pm-loc.mythic.r-rare{border-color:rgba(62,168,255,.25);background:linear-gradient(135deg,rgba(62,168,255,.05),rgba(255,255,255,.02))}\
#pyramidMap .pm-loc.mythic.r-rare:hover{border-color:rgba(62,168,255,.5);box-shadow:0 4px 24px -6px rgba(62,168,255,.25)}\
\
#pyramidMap .pm-badge{display:inline-block;font-size:9px;font-family:"JetBrains Mono",monospace;letter-spacing:.1em;padding:2px 6px;border-radius:6px;margin-left:8px;vertical-align:middle;font-weight:600}\
#pyramidMap .pm-badge.b-legendary{color:#ffd700;background:rgba(255,215,0,.12);border:1px solid rgba(255,215,0,.3)}\
#pyramidMap .pm-badge.b-epic{color:#c266ff;background:rgba(194,102,255,.12);border:1px solid rgba(194,102,255,.3)}\
#pyramidMap .pm-badge.b-rare{color:#3ea8ff;background:rgba(62,168,255,.12);border:1px solid rgba(62,168,255,.25)}\
\
#pyramidMap .pm-loc-nm{font-size:14px;color:var(--text);line-height:1.3}\
#pyramidMap .pm-loc-type{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}\
\
#pyramidMap .pm-detail{display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--line,rgba(255,255,255,.08))}\
#pyramidMap .pm-loc.open .pm-detail{display:block}\
#pyramidMap .pm-detail .pm-row{margin-bottom:8px}\
#pyramidMap .pm-detail .pm-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--pm-accent,var(--gold));margin-bottom:3px;font-family:"JetBrains Mono",monospace}\
#pyramidMap .pm-detail .pm-val{font-size:13.5px;line-height:1.55;color:var(--text);opacity:.88}\
\
#pyramidMap .pm-empty{font-size:13px;color:var(--muted);padding:8px 2px;line-height:1.5}\
\
#pyramidMap .pm-tier-bar{position:absolute;left:13px;top:32px;bottom:0;width:3px;border-radius:3px;background:rgba(255,255,255,.06)}\
#pyramidMap .pm-tier-bar-fill{position:absolute;left:0;right:0;top:0;height:100%;border-radius:3px;background:var(--pm-accent,var(--gold));opacity:.5;transition:height .6s ease}\
#pyramidMap .pm-tier.locked .pm-tier-bar-fill{height:0!important;opacity:0}\
\
#pyramidMap .pm-peak{text-align:center;margin:8px 0 4px}\
#pyramidMap .pm-peak .pm-loc{display:inline-block;flex:none;min-width:200px;max-width:320px;border-width:2px;text-align:left}\
\
#pyramidMap .pm-total{font-size:11px;color:var(--muted);text-align:right;margin-top:-6px;margin-bottom:10px;padding-right:4px}\
';
  document.head.appendChild(st);
}

/* --- host --- */
function ensureHost(){
  var scr=document.getElementById('s-tigel'); if(!scr) return null;
  var h=document.getElementById('pyramidMap');
  if(!h){ h=document.createElement('div'); h.id='pyramidMap'; scr.appendChild(h); }
  return h;
}

/* --- card html --- */
function locCard(loc, isOpen){
  var isMythic=loc.source==='mythic';
  var rar=loc.rarity||'';
  var cls='pm-loc'+(isOpen?' open':'')+(isMythic?' mythic r-'+rar:'');
  var tp=TYPE_LABELS[loc.type]||loc.type||'';

  /* name + optional rarity badge */
  var nameHtml=esc(loc.name);
  if(isMythic&&rar){
    nameHtml+='\u0020<span class="pm-badge b-'+rar+'">'+(RARITY_LABEL[rar]||rar)+'</span>';
  }

  var detail='';
  if(isOpen){
    detail='<div class="pm-detail">';
    if(loc.description) detail+='<div class="pm-row"><div class="pm-lbl">\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435</div><div class="pm-val">'+esc(loc.description)+'</div></div>';
    if(loc.atmosphere) detail+='<div class="pm-row"><div class="pm-lbl">\u0410\u0442\u043c\u043e\u0441\u0444\u0435\u0440\u0430</div><div class="pm-val">'+esc(loc.atmosphere)+'</div></div>';
    if(loc.challenge) detail+='<div class="pm-row"><div class="pm-lbl">\u0418\u0441\u043f\u044b\u0442\u0430\u043d\u0438\u0435</div><div class="pm-val">'+esc(loc.challenge)+'</div></div>';
    if(loc.reward) detail+='<div class="pm-row"><div class="pm-lbl">\u041d\u0430\u0433\u0440\u0430\u0434\u0430</div><div class="pm-val">'+esc(loc.reward)+'</div></div>';
    detail+='</div>';
  }
  return '<div class="'+cls+'" data-loc-id="'+esc(loc.id)+'" onclick="window._pmToggle(\''+esc(loc.id)+'\')">'+
    '<div class="pm-loc-nm">'+nameHtml+'</div>'+
    '<div class="pm-loc-type">'+esc(tp)+'</div>'+
    detail+
  '</div>';
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* --- render --- */
function render(){
  styleOnce();
  var h=ensureHost(); if(!h) return;
  var slug=lensSlug();
  var playerLv=lensLevel();
  var acc=lensAccent()||'';

  try{ h.style.setProperty('--pm-accent', acc||''); }catch(e){}

  var title='\u041a\u0430\u0440\u0442\u0430 \u0412\u043e\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f';
  var sub=slug?('\u043b\u0438\u043d\u0437\u0430 \u00b7 Lv.'+playerLv):'\u0432\u044b\u0431\u0435\u0440\u0438 \u043b\u0438\u043d\u0437\u0443';

  var head='<div class="pm-hdr"><span class="pm-title"'+(acc?' style="color:'+acc+'"':'')+'>'+title+'</span><span class="pm-sub">'+sub+'</span></div>';

  if(FAILED){ h.innerHTML=head+'<div class="pm-empty">\u0414\u0430\u043d\u043d\u044b\u0435 \u043b\u043e\u043a\u0430\u0446\u0438\u0439 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b.</div>'; return; }
  if(!DATA){ h.innerHTML=head+'<div class="pm-empty">\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u043a\u0430\u0440\u0442\u0443\u2026</div>'; load(render); return; }

  if(!slug){
    h.innerHTML=head+'<div class="pm-empty">\u0412\u044b\u0431\u0435\u0440\u0438 \u043b\u0438\u043d\u0437\u0443 \u0432 \u043a\u043e\u043b\u043e\u0434\u0435 \u2014 \u0438 \u043e\u0442\u043a\u0440\u043e\u0435\u0442\u0441\u044f \u043c\u0438\u0440 \u0432\u043e\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f.</div>';
    return;
  }

  /* фильтруем локации по матрице */
  var locs=DATA.filter(function(l){ return l.matrix_slug===slug; });
  if(!locs.length){
    h.innerHTML=head+'<div class="pm-empty">\u041b\u043e\u043a\u0430\u0446\u0438\u0438 \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u043c\u0430\u0442\u0440\u0438\u0446\u044b \u0435\u0449\u0451 \u043d\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u044b.</div>';
    return;
  }

  /* группируем по ярусам */
  var tiers={};
  for(var i=0;i<locs.length;i++){
    var t=locs[i].tier||1;
    if(!tiers[t]) tiers[t]=[];
    tiers[t].push(locs[i]);
  }

  var html=head;
  html+='<div class="pm-total">'+locs.length+' \u043b\u043e\u043a\u0430\u0446\u0438\u0439</div>';

  /* рисуем сверху вниз: tier 6 (пик) → tier 1 (подножие) */
  for(var tier=6;tier>=1;tier--){
    var items=tiers[tier]||[];
    if(!items.length) continue;

    /* сортируем: mythic первыми, потом по имени */
    items.sort(function(a,b){
      var am=a.source==='mythic'?0:1, bm=b.source==='mythic'?0:1;
      if(am!==bm) return am-bm;
      return (a.name||'').localeCompare(b.name||'');
    });

    var meta=TIER_META[tier]||{name:'\u042f\u0440\u0443\u0441 '+tier,icon:'\ud83c\udfd4',sub:''};
    var locked=tier>playerLv;
    var tierCls='pm-tier'+(locked?' locked':'');

    html+='<div class="'+tierCls+'">';
    html+='<div class="pm-tier-bar"><div class="pm-tier-bar-fill"></div></div>';
    html+='<div class="pm-tier-hdr">';
    html+='<span class="pm-tier-icon">'+meta.icon+'</span>';
    html+='<span class="pm-tier-label">'+meta.name+'</span>';
    html+='<span class="pm-tier-sub">'+meta.sub+'</span>';
    html+='<span class="pm-tier-count">'+items.length+' \u043b\u043e\u043a.</span>';
    html+='</div>';

    if(locked){
      html+='<div class="pm-lock-msg">\ud83d\udd12 \u041e\u0442\u043a\u0440\u043e\u0435\u0442\u0441\u044f \u043d\u0430 \u0443\u0440\u043e\u0432\u043d\u0435 '+tier+'</div>';
    }

    if(tier===6){
      html+='<div class="pm-peak">';
      for(var j=0;j<items.length;j++) html+=locCard(items[j], _openId===items[j].id);
      html+='</div>';
    } else {
      html+='<div class="pm-grid">';
      for(var j=0;j<items.length;j++) html+=locCard(items[j], _openId===items[j].id);
      html+='</div>';
    }

    html+='</div>';
  }

  h.innerHTML=html;
}

/* --- toggle --- */
window._pmToggle=function(id){
  _openId=(_openId===id)?null:id;
  render();
};

/* --- hooks --- */
function wrap(name){ if(typeof window[name]==='function'){ var _f=window[name]; window[name]=function(){ var r=_f.apply(this,arguments); try{ render(); }catch(e){} return r; }; } }
wrap('renderDeck'); wrap('toggleMat'); wrap('go');
window.addEventListener('awara:lang', function(){ try{ render(); }catch(e){} });

var _lastSig='';
function _sig(){ var s=S(); var m=(s&&s.mats)?s.mats.join(','):''; return m+'|'+lensSlug()+'|'+lensLevel(); }
setInterval(function(){ var g=_sig(); if(g!==_lastSig){ _lastSig=g; try{ render(); }catch(e){} } }, 1500);

setTimeout(render, 600);

window.AwaraPyramidMap={render:render, __ready:true};
})();
