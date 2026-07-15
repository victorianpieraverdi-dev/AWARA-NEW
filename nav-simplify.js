/* AWARA · Навигация — 4 главные вкладки + «Ещё». Доп. слой, движок не трогает. */
(function(){
'use strict';
if(window.AwaraNav&&window.AwaraNav.__ready)return;
var PRIMARY=['egg-back','istok','tigel','daimon','macro','plan'];

function styleOnce(){
 if(document.getElementById('nav-more-style'))return;
 var st=document.createElement('style');st.id='nav-more-style';
 st.textContent=[
  '#nav-more-pop{position:absolute;left:8px;right:8px;bottom:calc(100% + 8px);z-index:9000;background:rgba(18,15,28,.97);border:1px solid var(--line);border-radius:16px;padding:8px;display:flex;flex-direction:column;gap:4px;box-shadow:0 -10px 40px rgba(0,0,0,.55);backdrop-filter:blur(10px);animation:nmIn .18s ease}',
  '@keyframes nmIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}',
  '#nav-more-pop button{display:flex;align-items:center;gap:11px;width:100%;background:transparent;border:none;color:var(--text);padding:12px 14px;border-radius:12px;font-size:15px;cursor:pointer;text-align:left;font-family:inherit}',
  '#nav-more-pop button:hover{background:rgba(255,255,255,.07)}',
  '#nav-more-pop .ic{font-size:19px;width:24px;text-align:center;flex:0 0 auto}',
  '#nav-more.on{color:var(--gold)}'
 ].join('');
 document.head.appendChild(st);
}

function navEl(){return document.querySelector('.nav');}
function closePop(){var p=document.getElementById('nav-more-pop');if(p&&p.parentNode)p.parentNode.removeChild(p);}

function openPop(hidden){
 var nav=navEl();if(!nav)return;closePop();
 var pop=document.createElement('div');pop.id='nav-more-pop';
 hidden.forEach(function(b){
  var it=document.createElement('button');it.type='button';it.innerHTML=b.innerHTML;
  it.onclick=function(e){e.stopPropagation();closePop();try{b.click();}catch(err){}var more=document.getElementById('nav-more');if(more)more.classList.add('on');};
  pop.appendChild(it);
 });
 nav.appendChild(pop);
}

function apply(){
 var nav=navEl();if(!nav)return;
 var btns=nav.querySelectorAll('button[data-nav]');if(!btns.length)return;
 styleOnce();
 try{if(getComputedStyle(nav).position==='static')nav.style.position='relative';}catch(e){}
 var hidden=[];
 for(var i=0;i<btns.length;i++){(function(btn){
  var k=btn.getAttribute('data-nav');
  if(k==='more')return;
  if(PRIMARY.indexOf(k)<0){btn.style.display='none';hidden.push(btn);}
  else{btn.style.display='';if(!btn.__navmore){btn.__navmore=1;btn.addEventListener('click',function(){var m=document.getElementById('nav-more');if(m)m.classList.remove('on');closePop();});}}
 })(btns[i]);}
 if(hidden.length&&!document.getElementById('nav-more')){
  var more=document.createElement('button');more.id='nav-more';more.type='button';more.setAttribute('data-nav','more');
  more.innerHTML='<span class="ic">⋯</span>Ещё';
  more.onclick=function(e){e.stopPropagation();if(document.getElementById('nav-more-pop')){closePop();}else{openPop(hidden);}};
  nav.appendChild(more);
 }
 // Порядок плашек строго по PRIMARY (Карта и Даймон поменяны местами)
 PRIMARY.forEach(function(k){var b=nav.querySelector('button[data-nav="'+k+'"]');if(b)nav.appendChild(b);});
 var _more=document.getElementById('nav-more');if(_more)nav.appendChild(_more);
 var _pop=document.getElementById('nav-more-pop');if(_pop)nav.appendChild(_pop);
}

document.addEventListener('click',function(){closePop();});
function boot(){apply();setTimeout(apply,500);setTimeout(apply,1400);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,160);});}else{setTimeout(boot,160);}
window.AwaraNav={apply:apply,__ready:true};
})();
