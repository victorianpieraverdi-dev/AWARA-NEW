/* AWARA · Экран Результата — главное сразу, детали по тапу. Доп. слой, движок не трогает. */
(function(){
'use strict';
if(window.AwaraResultClean&&window.AwaraResultClean.__ready)return;

function styleOnce(){
 if(document.getElementById('rc-style'))return;
 var st=document.createElement('style');st.id='rc-style';
 st.textContent=[
  '.rc-gen-h{display:flex;justify-content:space-between;align-items:center;cursor:pointer;padding:11px 14px;margin-top:10px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.02);font-family:Cinzel,serif;color:var(--spark);font-size:14px;user-select:none}',
  '.rc-gen-h:hover{background:rgba(255,255,255,.05)}',
  '.rc-gen-h .rc-arr{transition:transform .2s;opacity:.7}',
  '.rc-gen-h.open .rc-arr{transform:rotate(180deg)}',
  '.rc-hint{opacity:.55}'
 ].join('');
 document.head.appendChild(st);
}

function enhance(){
 var screen=document.getElementById('s-result');if(!screen)return;
 styleOnce();
 /* 1) Разбор Света — скрыт, раскрывается тапом по кольцу/числу */
 var br=document.getElementById('lightBreak');
 if(br&&!br.__rc){br.__rc=1;br.style.display='none';
  var tog=function(e){if(e)e.stopPropagation();br.style.display=(br.style.display==='none')?'':'none';};
  ['lightNum','lightRing'].forEach(function(id){var el=document.getElementById(id);if(el){el.style.cursor='pointer';el.title='Показать разбор Света';el.addEventListener('click',tog);}});
 }
 /* 2) Совет — приглушаем заглушку */
 var adv=document.getElementById('adviceText');
 if(adv){if((adv.textContent||'').indexOf('Переплавь день')>=0)adv.classList.add('rc-hint');else adv.classList.remove('rc-hint');}
 /* 3) Линза — приглушаем, если не выбрана */
 var lt=document.getElementById('lensTag');
 if(lt){if((lt.textContent||'').indexOf('не выбран')>=0)lt.classList.add('rc-hint');else lt.classList.remove('rc-hint');}
 /* 4) Дары дня (генерации) — сворачиваемый блок */
 var grid=document.getElementById('genGrid');
 if(grid){
  var n=grid.children.length;
  var hdr=document.getElementById('rc-gen-h');
  if(!hdr){hdr=document.createElement('div');hdr.id='rc-gen-h';hdr.className='rc-gen-h';
   hdr.onclick=function(){var open=grid.style.display!=='none';grid.style.display=open?'none':'';hdr.classList.toggle('open',!open);};
   grid.parentNode.insertBefore(hdr,grid);
  }
  hdr.innerHTML='<span>✦ Дары дня'+(n?' · '+n:'')+'</span><span class="rc-arr">▾</span>';
  if(grid.__rcInit!==1){grid.__rcInit=1;grid.style.display='none';}
 }
}

if(typeof window.renderResult==='function'&&!window.renderResult.__rcWrapped){
 var orig=window.renderResult;
 window.renderResult=function(){var r=orig.apply(this,arguments);try{enhance();}catch(e){}return r;};
 window.renderResult.__rcWrapped=true;
}

function boot(){enhance();setTimeout(enhance,500);setTimeout(enhance,1400);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,160);});}else{setTimeout(boot,160);}
window.AwaraResultClean={enhance:enhance,__ready:true};
})();
