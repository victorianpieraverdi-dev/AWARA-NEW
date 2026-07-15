/* AWARA · Essence line v1
   Visible dual-reading of the name under the orb on #s-tigel:
   Tigel (alchemical crucible: experience melted into light) + thigle (Tibetan drop-sphere of essence).
   Non-destructive: injects a small clickable line + expandable text. Re-injects on go('tigel'). */
(function(){
'use strict';
if(window.AwaraEssence&&window.AwaraEssence.__ready)return;
function $(id){return document.getElementById(id);}
function styleOnce(){
 if($('ess-style'))return;
 var st=document.createElement('style');st.id='ess-style';
 st.textContent="#ess-line{text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;color:#c9a84c;opacity:.82;cursor:pointer;margin:2px 0 10px;user-select:none}#ess-line:hover{opacity:1}#ess-more{max-width:460px;margin:0 auto 16px;padding:0 14px;text-align:center;font-size:12px;line-height:1.6;color:#d8c7a0;opacity:.92}#ess-more b{color:#e9d9a6;font-weight:600}";
 document.head.appendChild(st);
}
function inject(){
 var scr=$('s-tigel');if(!scr)return false;
 styleOnce();
 if($('ess-line'))return true;
 var ow=scr.querySelector('.orb-wrap');
 var anchor=$('mx-skin-label')||ow||null;
 var line=document.createElement('div');
 line.id='ess-line';
 line.title='\u043d\u0430\u0436\u043c\u0438';
 line.textContent='\u2726 \u0422\u0438\u0433\u0435\u043b\u044c \u00b7 \u0442\u0438\u0433\u043b\u0435';
 var more=document.createElement('div');
 more.id='ess-more';
 more.style.display='none';
 more.innerHTML='<b>\u0422\u0438\u0433\u0435\u043b\u044c</b> \u2014 \u0430\u043b\u0445\u0438\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0441\u043e\u0441\u0443\u0434, \u0433\u0434\u0435 \u043e\u043f\u044b\u0442 \u043f\u0435\u0440\u0435\u043f\u043b\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0441\u0432\u0435\u0442. \u0418 \u0442\u0438\u0431\u0435\u0442\u0441\u043a\u043e\u0435 <b>\u0442\u0438\u0433\u043b\u0435</b> (thigle) \u2014 \u043a\u0430\u043f\u043b\u044f-\u0441\u0444\u0435\u0440\u0430 \u0441\u0443\u0449\u043d\u043e\u0441\u0442\u0438, \u0441\u0435\u043c\u044f \u0441\u0432\u0435\u0442\u0430 \u0438 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u0438. \u041e\u0434\u0438\u043d \u0441\u043e\u0441\u0443\u0434 \u2014 \u0434\u0432\u0435 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438: \u0430\u043b\u0445\u0438\u043c\u0438\u044f \u0417\u0430\u043f\u0430\u0434\u0430 \u0438 \u0434\u0437\u043e\u0433\u0447\u0435\u043d \u0412\u043e\u0441\u0442\u043e\u043a\u0430.';
 line.addEventListener('click',function(){more.style.display=(more.style.display==='none')?'block':'none';});
 if(anchor&&anchor.parentNode){
  if(anchor.nextSibling)anchor.parentNode.insertBefore(line,anchor.nextSibling);else anchor.parentNode.appendChild(line);
  if(line.nextSibling)line.parentNode.insertBefore(more,line.nextSibling);else line.parentNode.appendChild(more);
 }else{
  scr.insertBefore(line,scr.firstChild);
  if(line.nextSibling)scr.insertBefore(more,line.nextSibling);else scr.appendChild(more);
 }
 return true;
}
function boot(){
 try{inject();}catch(e){}
 setTimeout(function(){try{inject();}catch(e){}},500);
 setTimeout(function(){try{inject();}catch(e){}},1400);
 var _go=window.go;
 if(typeof _go==='function'&&!window.go.__essWrapped){var g=function(name){var r=_go.apply(this,arguments);if(name==='tigel'){setTimeout(function(){try{inject();}catch(e){}},0);}return r;};g.__essWrapped=true;window.go=g;}
}
window.AwaraEssence={inject:inject,__ready:true,__v:1};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,160);});else setTimeout(boot,160);
})();
