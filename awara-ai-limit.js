(function(){
'use strict';
/* AWARA — лимит ИИ-общения v2. Использует AwaraXP.getAIRemaining() для ring-based лимитов */
var COST=10, LK='awara_ai_limit';
function today(){return new Date().toISOString().slice(0,10);}
function load(){var o={};try{o=JSON.parse(localStorage.getItem(LK)||'{}');}catch(e){o={};}
if(o.date!==today()){o={date:today(),used:0,bonus:0,spent:0};}
if(typeof o.used!=='number')o.used=0;
if(typeof o.bonus!=='number')o.bonus=0;
if(typeof o.spent!=='number')o.spent=0;
return o;}
function persist(o){try{localStorage.setItem(LK,JSON.stringify(o));}catch(e){}}
function remaining(){
  /* Prefer AwaraXP ring-based limits if available */
  if(window.AwaraXP && window.AwaraXP.getAIRemaining){
    return window.AwaraXP.getAIRemaining().remaining;
  }
  var o=load(); return Math.max(0, 10 + o.bonus - o.used);
}
function lightRaw(){try{return (typeof window.lightVal==='function')?Math.round(window.lightVal()):0;}catch(e){return 0;}}
function lightAvail(){var o=load();return Math.max(0,lightRaw()-(o.spent||0));}
function toast(m){if(typeof window.showToast==='function')window.showToast(m);}
function ensureBar(){var inp=document.getElementById('aiInput');if(!inp)return null;var host=inp.parentNode;if(!host)return null;var b=document.getElementById('aiLimitBar');if(!b){b=document.createElement('div');b.id='aiLimitBar';b.style.cssText='font:11px/1.5 JetBrains Mono,monospace;color:var(--muted);padding:6px 8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap';try{host.parentNode.insertBefore(b,host);}catch(e){host.insertBefore(b,host.firstChild);}}return b;}
function renderBar(){
  var b=ensureBar();if(!b)return;
  var ai={remaining:10,limit:10};
  var qs={remaining:6,cap:6};
  var ring=-3;
  if(window.AwaraXP && window.AwaraXP.getAIRemaining){
    ai=window.AwaraXP.getAIRemaining();
    qs=window.AwaraXP.getQuestRemaining();
    ring=window.AwaraXP.getRing();
  } else {
    var o=load();
    ai.remaining=Math.max(0,10+o.bonus-o.used);
    ai.limit=10+o.bonus;
  }
  var aiCol=ai.remaining>0?'var(--spark)':'#e06a6a';
  var qsCol=qs.remaining>0?'var(--gold)':'#e06a6a';
  b.innerHTML='<span>ИИ <b style="color:'+aiCol+'">'+ai.remaining+'</b>/'+ai.limit+'</span>'+
    '<span>Квесты <b style="color:'+qsCol+'">'+qs.remaining+'</b>/'+qs.cap+'</span>'+
    '<span>Свет <b style="color:var(--gold)">'+lightAvail()+'</b></span>'+
    '<span style="font-size:9px;opacity:.6">Ring '+ring+'</span>'+
    '<button type="button" onclick="awaraAiExchange()" style="margin-left:auto;font:inherit;cursor:pointer;background:rgba(201,168,76,.16);color:var(--spark);border:1px solid var(--line);border-radius:8px;padding:4px 10px">Обмен 10→+1</button>';
}
window.awaraAiLimitRender=renderBar;
window.awaraAiExchange=function(){if(lightAvail()<COST){toast('Мало Света для обмена');return;}var o=load();o.spent=(o.spent||0)+COST;o.bonus=(o.bonus||0)+1;persist(o);toast('+1 сообщение за 10 Света');renderBar();};
var BLOCK='🔒 Лимит общения на сегодня исчерпан. Обменяй Свет на сообщения или вернись завтра.';
function wrap(){var _send=window.aiSend;if(typeof _send==='function'&&!_send.__lim){var f=function(){var inp=document.getElementById('aiInput');var q=inp&&(inp.value||'').trim();if(!q){return _send.apply(this,arguments);}if(remaining()<=0){if(typeof window.aiPush==='function'){inp.value='';window.aiPush('user',q);window.aiPush('daimon',BLOCK);}renderBar();return;}var o=load();o.used++;persist(o);var r=_send.apply(this,arguments);renderBar();return r;};f.__lim=true;window.aiSend=f;}
var _open=window.openAi;if(typeof _open==='function'&&!_open.__lim){var g=function(){var r=_open.apply(this,arguments);setTimeout(renderBar,30);return r;};g.__lim=true;window.openAi=g;}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(wrap,80);});}else{setTimeout(wrap,80);}
})();
