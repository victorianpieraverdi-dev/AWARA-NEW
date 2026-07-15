/* AWARA - Daimon voice (v1).
   Thin overlay over the static Daimon screen texts. Wraps renderDaimon and,
   after it runs, rewrites the companion's self-quote into simpler, gently
   poetic language and softens the trait labels (the technical term is kept as
   a hover tooltip on the label). Engine untouched; mechanics unchanged.
   Russian copy lives in awara-daimon-voice.json; this file stays ASCII. */
(function(){
'use strict';
if(window.AwaraDaimonVoice && window.AwaraDaimonVoice.__ready) return;

var DATA=null;

function S(){ try{ if(typeof STATE!=='undefined' && STATE) return STATE; }catch(e){} return window.STATE||null; }

function apply(){
  if(!DATA) return;
  var st=S(); if(!st) return;
  var d=st.daimon;
  // 1) self-quote
  var q=document.getElementById('dmQuote');
  if(q && d && DATA.quote && DATA.quote.template){
    q.textContent=DATA.quote.template
      .replace('{name}', d.name||'')
      .replace('{nak}', d.nak||'')
      .replace('{el}', d.el||'');
  }
  // 2) soften trait labels (keep original term as hover tooltip)
  var labels=DATA.traitLabels;
  if(labels){
    ['dmTraits','dmNames'].forEach(function(id){
      var box=document.getElementById(id); if(!box) return;
      var spans=box.querySelectorAll('.trait > span');
      for(var i=0;i<spans.length;i++){
        var cur=(spans[i].textContent||'').trim();
        if(Object.prototype.hasOwnProperty.call(labels,cur)){
          spans[i].title=cur;
          spans[i].textContent=labels[cur];
        }
      }
    });
  }
}

function wrap(){
  if(typeof window.renderDaimon!=='function') return false;
  if(window.renderDaimon.__dvWrapped) return true;
  var orig=window.renderDaimon;
  var w=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){} try{ apply(); }catch(e){} return r; };
  w.__dvWrapped=true;
  window.renderDaimon=w;
  return true;
}

function load(cb){
  try{
    fetch('awara-daimon-voice.json?v=1')
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ if(j) DATA=j; if(cb) cb(); })
      .catch(function(){ if(cb) cb(); });
  }catch(e){ if(cb) cb(); }
}

function boot(){
  var tries=0;
  var iv=setInterval(function(){ if(wrap() || ++tries>60) clearInterval(iv); },120);
  load(function(){ try{ apply(); }catch(e){} });
}

window.AwaraDaimonVoice={ apply:apply, reload:function(){ load(apply); }, __ready:true };

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,160); }); }
else { setTimeout(boot,160); }
})();
