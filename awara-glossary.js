/* AWARA - Glossary softener (v3, tap-to-reveal + lens cards).
   Keeps the magical vocabulary fully intact: nothing is removed or reworded.
   Each sharp term becomes self-explaining - a soft dotted underline; tapping
   (or hovering) opens a short warm card explaining it. Mobile-first.
   Reusable 'smooth the sharp edges' tool for the whole language rollout.

   Applied to: generator modal (openGen), result screen (renderResult),
   and the lens detail card #libModal (matrix descriptions + lens voice).
   Mechanics untouched - only the outward-facing text is annotated.
   Terms + explanations live in awara-glossary.json (real Cyrillic).
   This file stays ASCII.

   Public API: window.AwaraGlossary.soften(rootEl). */
(function(){
'use strict';
if(window.AwaraGlossary && window.AwaraGlossary.__ready) return;

var TERMS=[];
var LETTER=/[A-Za-z\u0410-\u044f\u0401\u0451]/;
var POP=null;

function injectStyle(){
  if(document.getElementById('aw-gloss-style')) return;
  var s=document.createElement('style');
  s.id='aw-gloss-style';
  s.textContent='.aw-gloss{border-bottom:1px dotted var(--gold,#caa75a);cursor:help;outline:none}'+
    '.aw-gloss:focus{background:rgba(202,167,90,.14);border-radius:3px}'+
    '#aw-gloss-pop{position:fixed;z-index:99999;display:none;background:#1a1712;color:#f0e6d2;'+
    'border:1px solid var(--gold,#caa75a);border-radius:10px;padding:9px 12px;'+
    'font-size:13px;line-height:1.45;max-width:280px;box-shadow:0 8px 24px rgba(0,0,0,.5)}';
  (document.head||document.documentElement).appendChild(s);
}

function ensurePop(){
  if(POP && document.body.contains(POP)) return POP;
  POP=document.createElement('div');
  POP.id='aw-gloss-pop';
  document.body.appendChild(POP);
  return POP;
}
function showPop(span){
  var g=span.getAttribute('data-gloss')||span.title||'';
  if(!g) return;
  var p=ensurePop();
  p.textContent=g;
  p.style.display='block';
  var pw=Math.min(280, window.innerWidth-24);
  p.style.maxWidth=pw+'px';
  var r=span.getBoundingClientRect();
  var left=Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth-pw-8));
  var top=r.bottom+6;
  if(top+90>window.innerHeight && r.top-6>120) top=r.top-6-90;
  p.style.left=left+'px';
  p.style.top=top+'px';
  p.__for=span;
}
function hidePop(){ if(POP){ POP.style.display='none'; POP.__for=null; } }

function onTap(e){
  var t=e.target;
  var g=(t && t.closest)? t.closest('.aw-gloss') : null;
  if(g){
    e.stopPropagation(); e.preventDefault();
    if(POP && POP.style.display==='block' && POP.__for===g) hidePop();
    else showPop(g);
    return;
  }
  if(POP && POP.contains(t)) return;
  hidePop();
}
function bindTap(){
  if(window.__awGlossTap) return;
  document.addEventListener('click', onTap, true);
  window.addEventListener('scroll', hidePop, true);
  window.addEventListener('resize', hidePop);
  window.__awGlossTap=true;
}

function findMatch(text, used){
  var lower=text.toLowerCase();
  var best=-1, bestTerm=null;
  for(var i=0;i<TERMS.length;i++){
    var t=TERMS[i];
    if(used[t.k]) continue;
    var idx=lower.indexOf(t.k);
    if(idx>=0 && (best<0 || idx<best)){ best=idx; bestTerm=t; }
  }
  if(best<0) return null;
  var end=best+bestTerm.k.length;
  while(end<text.length && LETTER.test(text.charAt(end))) end++;
  return { start:best, end:end, term:bestTerm };
}
function processNode(node, used){
  if(!node || node.nodeType!==3) return;
  var text=node.nodeValue||'';
  var m=findMatch(text, used);
  if(!m) return;
  var frag=document.createDocumentFragment();
  var before=text.slice(0, m.start);
  var word=text.slice(m.start, m.end);
  var after=text.slice(m.end);
  if(before) frag.appendChild(document.createTextNode(before));
  var span=document.createElement('span');
  span.className='aw-gloss';
  span.title=m.term.g;
  span.setAttribute('data-gloss', m.term.g);
  span.setAttribute('tabindex','0');
  span.textContent=word;
  frag.appendChild(span);
  used[m.term.k]=true;
  var afterNode=document.createTextNode(after);
  frag.appendChild(afterNode);
  if(node.parentNode){ node.parentNode.replaceChild(frag, node); processNode(afterNode, used); }
}
function soften(root){
  if(!root || !TERMS.length) return;
  injectStyle(); bindTap();
  var used={};
  var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode:function(n){
      if(!n.nodeValue || !n.nodeValue.replace(/\s/g,'')) return NodeFilter.FILTER_REJECT;
      var p=n.parentNode; if(!p) return NodeFilter.FILTER_REJECT;
      var tn=p.nodeName;
      if(tn==='SCRIPT'||tn==='STYLE'||tn==='TEXTAREA'||tn==='INPUT') return NodeFilter.FILTER_REJECT;
      if(p.classList && p.classList.contains('aw-gloss')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes=[], nn;
  while((nn=walker.nextNode())) nodes.push(nn);
  for(var i=0;i<nodes.length;i++) processNode(nodes[i], used);
}
function softenId(id){ var el=document.getElementById(id); if(el) try{ soften(el); }catch(e){} }

function wrapOpenGen(){
  if(typeof window.openGen!=='function') return false;
  if(window.openGen.__glWrapped) return true;
  var orig=window.openGen;
  var w=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){}
    try{ softenId('genBody'); softenId('genSub'); }catch(e){} return r; };
  w.__glWrapped=true; window.openGen=w; return true;
}
function wrapRenderResult(){
  if(typeof window.renderResult!=='function') return false;
  if(window.renderResult.__glWrapped) return true;
  var orig=window.renderResult;
  var w=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){}
    try{ softenId('s-result'); }catch(e){} return r; };
  w.__glWrapped=true; window.renderResult=w; return true;
}
// Lens detail card: soften whenever #libModal becomes visible (.open).
// Robust to whatever function opens it; mechanics are not touched.
function watchLib(){
  var lib=document.getElementById('libModal');
  if(!lib) return false;
  if(lib.__glWatched) return true;
  try{
    var mo=new MutationObserver(function(){
      if(lib.classList && lib.classList.contains('open')){
        try{ softenId('libDesc'); softenId('libVoice'); }catch(e){}
      }
    });
    mo.observe(lib, { attributes:true, attributeFilter:['class'] });
    lib.__glWatched=true;
  }catch(e){}
  return true;
}

function load(cb){
  try{
    fetch('awara-glossary.json?v=2')
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ if(j && j.terms) TERMS=j.terms; if(cb) cb(); })
      .catch(function(){ if(cb) cb(); });
  }catch(e){ if(cb) cb(); }
}
function boot(){
  var tries=0;
  var iv=setInterval(function(){
    var a=wrapOpenGen(), b=wrapRenderResult(), c=watchLib();
    if((a && b && c) || ++tries>60) clearInterval(iv);
  },120);
  load(function(){ try{ softenId('s-result'); softenId('genBody'); }catch(e){} });
}

window.AwaraGlossary={ soften:soften, reload:function(){ load(function(){ softenId('s-result'); }); }, __ready:true };

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,180); }); }
else { setTimeout(boot,180); }
})();
