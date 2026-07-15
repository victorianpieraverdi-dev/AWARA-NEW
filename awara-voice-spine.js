/* AWARA - Voice Spine (v1).
   The single backbone for the game's living language. Every AI reply (daimon
   chat, the day-generators, the copy-prompt button) is built through the
   global aiSystem() function, which already carries the AWARA canon (21 agents,
   33 matrices, Light economy, etc.). This module appends ONE voice directive
   to aiSystem()'s output, so the whole game starts speaking in the new, simpler
   and gently poetic register at once. Mechanics are untouched - only HOW the
   game talks changes. The directive text (Russian) lives in
   awara-voice-spine.json; this file stays ASCII. */
(function(){
'use strict';
if(window.AwaraVoiceSpine && window.AwaraVoiceSpine.__ready) return;

var DIRECTIVE='';

function wrap(){
  if(typeof window.aiSystem!=='function') return false;
  if(window.aiSystem.__voiceWrapped) return true;
  var orig=window.aiSystem;
  var w=function(){
    var base;
    try{ base=orig.apply(this,arguments); }catch(e){ return orig.apply(this,arguments); }
    if(typeof base==='string' && DIRECTIVE){ return base+'\n\n'+DIRECTIVE; }
    return base;
  };
  w.__voiceWrapped=true;
  try{ window.aiSystem=w; }catch(e){ return false; }
  return true;
}

function load(cb){
  try{
    fetch('awara-voice-spine.json?v=1')
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ if(j && typeof j.directive==='string') DIRECTIVE=j.directive; if(cb) cb(); })
      .catch(function(){ if(cb) cb(); });
  }catch(e){ if(cb) cb(); }
}

function boot(){
  var tries=0;
  var iv=setInterval(function(){ if(wrap() || ++tries>80) clearInterval(iv); },120);
  load(function(){ wrap(); });
}

window.AwaraVoiceSpine={
  __ready:true,
  reload:function(cb){ load(cb); },
  isActive:function(){ return !!(window.aiSystem && window.aiSystem.__voiceWrapped && DIRECTIVE); },
  directiveText:function(){ return DIRECTIVE; }
};

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,180); }); }
else { setTimeout(boot,180); }
})();
