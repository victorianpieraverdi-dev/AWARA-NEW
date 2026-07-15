/* AWARA · Награда — заметная анимация за выполненные действия (намерение / ковка карты / прожитый день). Доп. слой, движок не трогает. */
(function(){
'use strict';
if(window.AwaraReward&&window.AwaraReward.__ready)return;

function styleOnce(){
 if(document.getElementById('rw-style'))return;
 var st=document.createElement('style');st.id='rw-style';
 st.textContent=[
  '#rw-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(201,168,76,.20),rgba(10,8,18,0) 62%);opacity:0;animation:rwBg 1.7s ease forwards}',
  '@keyframes rwBg{0%{opacity:0}12%{opacity:1}70%{opacity:1}100%{opacity:0}}',
  '#rw-core{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;transform:scale(.4);opacity:0;animation:rwPop 1.7s cubic-bezier(.18,.9,.3,1.2) forwards}',
  '@keyframes rwPop{0%{transform:scale(.4);opacity:0}18%{transform:scale(1.1);opacity:1}30%{transform:scale(1)}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.05) translateY(-12px)}}',
  '#rw-glyph{font-size:84px;filter:drop-shadow(0 0 26px rgba(201,168,76,.7));line-height:1}',
  '#rw-label{font-family:Cinzel,serif;font-size:21px;color:#f3e6c0;letter-spacing:.04em;text-shadow:0 0 18px rgba(201,168,76,.55)}',
  '#rw-sub{font-family:"JetBrains Mono",monospace;font-size:11px;color:#c9a84c;letter-spacing:.16em;text-transform:uppercase}',
  '.rw-ray{position:absolute;left:50%;top:50%;width:3px;height:64px;margin-left:-1px;background:linear-gradient(to bottom,rgba(201,168,76,.95),rgba(201,168,76,0));transform-origin:50% 0;opacity:0;animation:rwRay 1.05s ease-out forwards}',
  '@keyframes rwRay{0%{opacity:0;transform:rotate(var(--a)) translateY(6px) scaleY(.2)}25%{opacity:.9}100%{opacity:0;transform:rotate(var(--a)) translateY(120px) scaleY(1)}}',
  '.rw-spark{position:absolute;left:50%;top:50%;font-size:18px;color:#e9d18a;opacity:0;animation:rwSpark 1.3s ease-out forwards}',
  '@keyframes rwSpark{0%{opacity:0;transform:translate(0,0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.15)}}'
 ].join('');
 document.head.appendChild(st);
}

function celebrate(glyph,label,sub){
 try{
  styleOnce();
  var old=document.getElementById('rw-ov');if(old&&old.parentNode)old.parentNode.removeChild(old);
  var ov=document.createElement('div');ov.id='rw-ov';
  var rays='';for(var i=0;i<12;i++){rays+='<span class="rw-ray" style="--a:'+(i*30)+'deg;animation-delay:'+(i*16)+'ms"></span>';}
  var se=['✦','✧','⭑','✺'];var sparks='';
  for(var j=0;j<10;j++){var ang=j*36*Math.PI/180,dist=90+Math.random()*70;sparks+='<span class="rw-spark" style="--dx:'+(Math.cos(ang)*dist).toFixed(0)+'px;--dy:'+(Math.sin(ang)*dist).toFixed(0)+'px;animation-delay:'+(70+j*28)+'ms">'+se[j%se.length]+'</span>';}
  ov.innerHTML=rays+sparks+'<div id="rw-core"><div id="rw-glyph">'+(glyph||'✦')+'</div><div id="rw-label">'+(label||'')+'</div>'+(sub?'<div id="rw-sub">'+sub+'</div>':'')+'</div>';
  document.body.appendChild(ov);
  setTimeout(function(){if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);},1750);
 }catch(e){}
}
window.awaraCelebrate=celebrate;

function wire(){
 try{
  var melt=document.getElementById('meltBtn');
  if(melt&&!melt.__rw){melt.__rw=1;melt.addEventListener('click',function(){setTimeout(function(){celebrate('🔥','Карта выкована','день силы добавлен');},140);});}
  var live=document.getElementById('liveBtn');
  if(live&&!live.__rw){live.__rw=1;live.addEventListener('click',function(){setTimeout(function(){celebrate('🌅','День прожит','свет занесён в Хронику');},140);});}
 }catch(e){}
}

var _toast=window.showToast;
window.showToast=function(msg){
 try{if(typeof _toast==='function')_toast.apply(this,arguments);}catch(e){}
 try{var m=String(msg||'');
  if(/(свет|намерен|выполн|\+\s*\d)/i.test(m)&&!/(форм|кэш|ошиб|удал)/i.test(m)){celebrate('✦','Свет прибыл','намерение исполнено');}
 }catch(e){}
};

function boot(){wire();}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,140);});}else{setTimeout(boot,140);}
window.AwaraReward={celebrate:celebrate,__ready:true};
})();
