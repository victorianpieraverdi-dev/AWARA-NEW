/* ============================================================
   AWARA · СКИН ЛИНЗЫ (v1)
   Шаг 5: атмосфера экрана подстраивается под выбранные матрицы-линзы.
   Одна линза — её цвет; две-три — плавное смешивание оттенков.
   Аддитивно: движок не тронут, состояние не пишется.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraSkin) return; window.__awaraSkin=true;

function S(){ try{ return STATE; }catch(e){ return null; } }

var SKIN={
  'Ведическая':'#e8a33d','Таро':'#c0392b','Каббала':'#6b5bb0','Герметизм':'#2e9e8f',
  'Славянская':'#c75b39','Гностицизм':'#7b62c9','Даосизм':'#2f9e8f','И-Цзин':'#4a6fa5',
  'Египетская':'#d4af37','Майя':'#2fa36b','Ацтеки':'#e2742a','Кельтская':'#3f8f5a',
  'Скандинавская':'#7b8c9c','Шаманская':'#9a7d4b','Буддийская':'#e0a93d','Суфийская':'#c45b8a',
  'Христианская':'#5a8fd4','Атлантическая':'#2bb3c0','Шамбала':'#d8c87a','Генные Ключи':'#6abf4b',
  'Астрологическая':'#5566cc','Космическая':'#6a4bb0','Шинто':'#d44a3a','Шумерская':'#b08344',
  'Зороастрийская':'#e2552a','Африканская':'#c68a2e','Йоруба':'#2aa9a0','Тантрическая':'#c0398f',
  'Постчеловеческая':'#38c6d6','Техномагия':'#3a8ee2','Адвайта':'#9d86e0','Византийская':'#8a5ba0',
  'Орфическая':'#c9a84c'
};
var BASE='#7b62c9';

function hex2rgb(h){ h=(h||'').replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return [parseInt(h.slice(0,2),16)||0,parseInt(h.slice(2,4),16)||0,parseInt(h.slice(4,6),16)||0]; }
function rgb2hex(r){ return '#'+r.map(function(x){ var s=Math.max(0,Math.min(255,Math.round(x))).toString(16); return s.length<2?'0'+s:s; }).join(''); }
/* Real per-matrix color from its element (HSL band), matching the orb tint.
   Replaces the old SKIN name-map whose keys did not match MATRIX keys. */
function hueOfKey(k){
  try{
    var M=window.MATRIX||{}; var m=M[k]; if(!m) return null;
    var el=m[1];
    var band={'\u041e\u0433\u043e\u043d\u044c':[5,45],'\u0417\u0435\u043c\u043b\u044f':[40,95],'\u0412\u043e\u0434\u0430':[188,232],'\u042d\u0444\u0438\u0440':[258,300]}[el]||[258,300];
    var keys=window.MATKEYS||Object.keys(M);
    var idx=keys.indexOf(k); if(idx<0) idx=0;
    var span=band[1]-band[0];
    return band[0]+((idx*37)%(span+1));
  }catch(e){ return null; }
}
function hslToHex(h,s,l){
  s/=100; l/=100;
  var c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h/60)%2-1)), m=l-c/2, r=0,g=0,b=0;
  if(h<60){r=c;g=x;} else if(h<120){r=x;g=c;} else if(h<180){g=c;b=x;} else if(h<240){g=x;b=c;} else if(h<300){r=x;b=c;} else {r=c;b=x;}
  return rgb2hex([(r+m)*255,(g+m)*255,(b+m)*255]);
}
function colorOfKey(k){ var h=hueOfKey(k); return h==null?null:hslToHex(h,64,60); }
function blend(keys){
  var cols=(keys||[]).map(colorOfKey).filter(Boolean);
  if(!cols.length) return BASE;
  var a=[0,0,0];
  cols.forEach(function(c){ var r=hex2rgb(c); a[0]+=r[0];a[1]+=r[1];a[2]+=r[2]; });
  return rgb2hex([a[0]/cols.length,a[1]/cols.length,a[2]/cols.length]);
}

/* ---- стили ---- */
try{
  if(!document.querySelector('style[data-awara-skin]')){
    var st=document.createElement('style'); st.setAttribute('data-awara-skin','1');
    st.textContent=`
.phone{position:relative;isolation:isolate}
#lensSkin{position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;opacity:0;transition:none}
.mcard.on{border-color:var(--lens,#7b62c9)!important;box-shadow:0 0 0 1px var(--lens,#7b62c9),0 8px 24px -10px var(--lens,#7b62c9)}
`;
    document.head.appendChild(st);
  }
}catch(e){}

/* ---- слой атмосферы ---- */
function ensureLayer(){
  var ph=document.querySelector('.phone'); if(!ph) return null;
  var l=document.getElementById('lensSkin');
  if(!l){ l=document.createElement('div'); l.id='lensSkin'; ph.insertBefore(l, ph.firstChild); }
  return l;
}
function apply(){
  var s=S(); var keys=(s&&s.mats)?s.mats:[];
  var col=blend(keys);
  try{ document.documentElement.style.setProperty('--lens', col); }catch(e){}
  var l=ensureLayer(); if(!l) return;
  if(keys.length){
    var rgb=hex2rgb(col);
    var rgba=function(a){ return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+a+')'; };
    l.style.background='radial-gradient(130% 80% at 50% 0%,'+rgba(.26)+',transparent 62%),radial-gradient(130% 90% at 50% 100%,'+rgba(.14)+',transparent 66%)';
    l.style.opacity='1';
  } else { l.style.opacity='0'; }
}

/* ---- хуки ---- */
function wrap(name){ if(typeof window[name]==='function'){ var _f=window[name]; window[name]=function(){ var r=_f.apply(this,arguments); try{ apply(); }catch(e){} return r; }; } }
wrap('renderDeck'); wrap('toggleMat'); wrap('go');
try{ document.querySelectorAll('.nav button[data-nav]').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(function(){ try{apply();}catch(e){} },50); }); }); }catch(e){}

/* ---- первичный прогон ---- */
try{ apply(); }catch(e){}
setTimeout(function(){ try{ apply(); }catch(e){} }, 300);

})();
