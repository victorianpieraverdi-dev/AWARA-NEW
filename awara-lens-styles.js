/* ============================================================
   AWARA - LENS STYLES LOADER
   Loads data/lens_styles.json into window.LENS_STYLE (keyed by slug).
   Exposes helpers to fetch a lens style and to build an image-prompt
   style fragment for the day's lens(es). ASCII-only code; the actual
   style text (Cyrillic) lives in the JSON file.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraLensStyles) return; window.__awaraLensStyles=true;

window.LENS_STYLE = window.LENS_STYLE || null;

function slugOfKey(key){
  try{ if(window.AwaraLens && AwaraLens.slugFor){ var s=AwaraLens.slugFor(key); if(s) return s; } }catch(e){}
  return null;
}

function styleFor(key){
  try{
    var tbl=window.LENS_STYLE; if(!tbl||!key) return null;
    if(tbl[key]) return tbl[key];
    var slug=slugOfKey(key);
    if(slug && tbl[slug]) return tbl[slug];
    return null;
  }catch(e){ return null; }
}

function promptStyle(keys){
  try{
    if(!keys) return '';
    if(typeof keys==='string') keys=[keys];
    var parts=[];
    keys.forEach(function(k){
      var st=styleFor(k); if(!st) return;
      var seg=st.art||''; if(st.motifs){ seg += (seg?'; ':'')+'motifs: '+st.motifs; }
      if(seg) parts.push(seg);
    });
    return parts.join(' | ');
  }catch(e){ return ''; }
}

function toneStyle(keys){
  try{
    if(!keys) return '';
    if(typeof keys==='string') keys=[keys];
    var parts=[];
    keys.forEach(function(k){ var st=styleFor(k); if(st&&st.tone) parts.push(st.tone); });
    return parts.join('; ');
  }catch(e){ return ''; }
}

function paletteOf(key){ var st=styleFor(key); return (st&&st.palette&&st.palette.length)?st.palette:null; }

window.lensStyleFor = styleFor;
window.lensPromptStyle = promptStyle;
window.lensToneStyle = toneStyle;
window.lensPalette = paletteOf;

function load(){
  try{
    fetch('data/lens_styles.json').then(function(r){ return r.ok?r.json():null; }).then(function(obj){
      if(obj && typeof obj==='object'){ window.LENS_STYLE=obj;
        try{ if(window.AwaraLens && AwaraLens.repaintOrb) AwaraLens.repaintOrb(); }catch(e){}
        try{ document.dispatchEvent(new CustomEvent('awara-lens-styles-ready')); }catch(e){}
      }
    }).catch(function(){});
  }catch(e){}
}
load();

})();
