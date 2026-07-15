/* AWARA · Living Library bridge (v2)
   Additive: weaves authentic per-lens canon (data/matrices/*_living_library.json)
   into the Tigel prompt, scaled by player Light + lens clarity.
   v2: schema-agnostic renderer (handles both spine{principle/role} and
   spine{ids,note}+items{deity_en} layouts). Engine untouched; fully fail-safe. */
(function(){
'use strict';
if(window.AwaraLivingLibrary && window.AwaraLivingLibrary.__v2) return;

var BASE='data/matrices/';
var MX=null;   /* { byName:{name->id}, bySlug:{slug->id} } */
var IDX=null;  /* { tradition_matrix -> filename } */
var LL={};     /* tradition_matrix -> parsed living-library json */

function fetchJSON(url){
  try{ return fetch(url,{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  catch(e){ return Promise.resolve(null); }
}
function buildMX(arr){
  var m={byName:{},bySlug:{}};
  (arr||[]).forEach(function(x){ if(!x) return; if(x.name!=null) m.byName[x.name]=x.id; if(x.slug!=null) m.bySlug[x.slug]=x.id; });
  return m;
}
function buildIDX(idx){
  var o={}; var ents=(idx&&idx.entries)||[];
  ents.forEach(function(e){ if(e&&e.tradition_matrix!=null&&e.file) o[e.tradition_matrix]=e.file; });
  return o;
}
function prefetchAll(){
  if(!IDX) return;
  Object.keys(IDX).forEach(function(id){ if(LL[id]!==undefined) return; fetchJSON(BASE+IDX[id]).then(function(j){ if(j) LL[id]=j; }); });
}

function lightTier(v){ v=v||0; return v>=85?4:v>=65?3:v>=40?2:v>=15?1:0; }
function clarityTier(u){ u=u||0; return u>=12?4:u>=7?3:u>=4?2:u>=1?1:0; }

function activeLenses(){
  var s=null; try{ s=STATE; }catch(e){}
  var names=[];
  try{ if(s&&s.mats&&s.mats.length) names=s.mats.slice(); }catch(e){}
  if(!names.length){ try{ if(typeof lensVoices==='function') names=(lensVoices()||[]).map(function(x){ return x&&x.name; }).filter(Boolean); }catch(e){} }
  return names;
}
function curLight(){ try{ if(typeof lightVal==='function') return lightVal(); }catch(e){} try{ if(STATE&&STATE.baseLight!=null) return STATE.baseLight; }catch(e){} return 0; }
function lensUses(name){ try{ if(STATE&&STATE.lenses&&STATE.lenses[name]) return STATE.lenses[name].uses||0; }catch(e){} return 0; }

var SKIP={spine:1,items:1,sources:1,mera_map:1};
var SPINE_BY_TIER=[2,4,8,14,21];
var LAT_BY_TIER=[0,0,3,6,99];
var ITEM_FIELDS=['deity_en','deity','domain','principle','role','graha_en','yoni_en','gana_en','element','sign','rune','star'];

function dedupe(a){ var seen={},out=[]; a.forEach(function(x){ if(x!=null&&x!==''&&!seen[x]){ seen[x]=1; out.push(x); } }); return out; }
function spineBase(v){
  if(v==null) return ''; if(typeof v!=='object') return ''+v;
  var nm=v.deity||v.name||v.title||'';
  var desc=v.principle?(v.principle+(v.role?(' \u2014 '+v.role):'')):(v.role||v.note||'');
  if(nm&&desc) return nm+' \u2014 '+desc;
  return nm||desc;
}
function itemLabel(it){
  if(it==null) return ''; if(typeof it!=='object') return ''+it;
  var nm=it.name_en||it.name||it.title||it.key||'';
  var det=[]; ITEM_FIELDS.forEach(function(f){ var x=it[f]; if(x!=null&&x!==''&&(''+x)!==(''+nm)) det.push(''+x); });
  det=dedupe(det);
  return (''+nm)+(det.length?(' ('+det.slice(0,4).join(', ')+')'):'');
}
function agentItems(d){ var m={}; (d.items||[]).forEach(function(it){ if(it&&it.agent){ (m[it.agent]=m[it.agent]||[]).push(it); } }); return m; }

function renderLL(name,d,tier){
  var lines=[]; var sysn=d.system_name?(' / '+d.system_name):'';
  lines.push('### '+name+sysn+'  [depth '+tier+'/4]');
  var amap=agentItems(d);
  var sk=Object.keys(d.spine||{}); var sc=SPINE_BY_TIER[tier]||2;
  sk.slice(0,sc).forEach(function(k){
    var v=d.spine[k]||{};
    var base=spineBase(v);
    var dts=dedupe((amap[k]||[]).map(function(it){ return it.deity_en||it.deity||it.name_en||it.name; }));
    var deity=dts.slice(0,3).join(', ');
    var seg=base; if(deity) seg=seg?(seg+' \u2014 '+deity):deity;
    var mera=(v&&v.mera!=null)?(' [mera '+v.mera+']'):'';
    lines.push('- '+k+(seg?(': '+seg):'')+mera);
  });
  if(tier>=2){
    var cap=LAT_BY_TIER[tier]||3;
    Object.keys(d).forEach(function(key){
      if(SKIP[key]) return; var v=d[key];
      if(Array.isArray(v)&&v.length&&typeof v[0]==='object'){
        var parts=v.slice(0,cap).map(itemLabel).filter(Boolean);
        if(parts.length) lines.push('- '+key+': '+parts.join('; '));
      }
    });
  }
  if(tier>=3 && Array.isArray(d.items) && d.items.length){
    var icap=(tier>=4)?99:6;
    var ip=d.items.slice(0,icap).map(itemLabel).filter(Boolean);
    if(ip.length) lines.push('- key motifs: '+ip.join('; '));
  }
  if(tier>=4 && Array.isArray(d.sources) && d.sources.length){ lines.push('- sources: '+d.sources.join('; ')); }
  return lines.join('\n');
}

var HEADER='ЖИВАЯ БИБЛИОТЕКА ЛИНЗ — подлинный канон выбранных оптик. Вплетай в живое слово КОНКРЕТНЫЕ имена, образы и принципы отсюда и НИЧЕГО не выдумывай сверх канона. «depth N/4» растёт со Светом игрока и чёткостью линзы: чем он выше, тем глубже и подробнее раскрывай эти образы. Это компас, а не рельсы — вплетай естественно и к месту, не давай списком.';

function augmentPrompt(base){
  try{
    if(!MX||!IDX) return base;
    var names=activeLenses(); if(!names.length) return base;
    var lt=lightTier(curLight());
    var blocks=[];
    names.forEach(function(nm){
      var id=(MX.byName[nm]!=null)?MX.byName[nm]:MX.bySlug[nm];
      if(id==null) return;
      var d=LL[id];
      if(!d){ if(IDX[id]) fetchJSON(BASE+IDX[id]).then(function(j){ if(j) LL[id]=j; }); return; }
      var ct=clarityTier(lensUses(nm));
      var tier=Math.round(lt*0.65+ct*0.35); if(tier<0)tier=0; if(tier>4)tier=4;
      blocks.push(renderLL(nm,d,tier));
    });
    if(!blocks.length) return base;
    return base+'\n\n'+HEADER+'\n\n'+blocks.join('\n\n');
  }catch(e){ return base; }
}

function boot(){
  fetchJSON('data/matrices.json').then(function(arr){ if(arr) MX=buildMX(arr); return fetchJSON(BASE+'_living_library_index.json'); }).then(function(idx){ if(idx) IDX=buildIDX(idx); prefetchAll(); }).catch(function(){});
}
boot();
window.AwaraLivingLibrary={ augmentPrompt:augmentPrompt, __ready:true, __v2:true, _diag:function(){ return { mx:!!MX, idx:IDX?Object.keys(IDX).length:0, loaded:Object.keys(LL).length }; }, _preview:function(nm,depth){ try{ if(!MX) return 'library not ready (MX null) — reload (Ctrl+F5)'; var raw=(nm==null?'':(''+nm)).trim(); var id=null; if(MX.byName[raw]!=null) id=MX.byName[raw]; else if(MX.bySlug[raw]!=null) id=MX.bySlug[raw]; if(id==null && /^[0-9]+$/.test(raw)) id=parseInt(raw,10); if(id==null){ var norm=function(s){ return (''+s).toLowerCase().replace(/[\s/_\-]+/g,''); }; var key=norm(raw), hit=null; ['byName','bySlug'].forEach(function(tbl){ var t=MX[tbl]||{}; Object.keys(t).forEach(function(k){ if(hit==null && norm(k)===key) hit=t[k]; }); }); if(hit!=null) id=hit; } if(id==null){ var slugs=Object.keys(MX.bySlug||{}).sort(); return 'lens not found: "'+raw+'"\navailable slugs: '+slugs.join(', '); } var d=LL[id]; if(!d){ if(IDX&&IDX[id]) fetchJSON(BASE+IDX[id]).then(function(j){ if(j) LL[id]=j; }); return 'lens #'+id+' not loaded yet — try again in a moment'; } var t=(depth==null?4:depth|0); if(t<0)t=0; if(t>4)t=4; return renderLL(raw,d,t); }catch(e){ return 'preview error: '+e; } } };
})();
