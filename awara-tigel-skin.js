/* AWARA — тематизация Тигеля под матрицы-линзы. v1
   Центральный орб #orb и окно #s-tigel перекрашиваются под выбранные матрицы (STATE.mats):
   1 матрица — её цвет/глиф; 2 — смешение двух; 3 — триада. Дёшево — через HSL + CSS-переменные.
   Цвет каждой матрицы = полоса стихии (HSL) + сдвиг по индексу, чтобы 33 матрицы были различимы. */
(function(){
  'use strict';
  if(window.AwaraTigelSkin&&window.AwaraTigelSkin.__ready) return;
  var EFIR='\u042d\u0444\u0438\u0440', OGON='\u041e\u0433\u043e\u043d\u044c', VODA='\u0412\u043e\u0434\u0430', ZEML='\u0417\u0435\u043c\u043b\u044f';
  var ELBAND={}; ELBAND[OGON]=[5,45]; ELBAND[ZEML]=[40,95]; ELBAND[VODA]=[188,232]; ELBAND[EFIR]=[258,300];

  function $(id){ return document.getElementById(id); }
  function S(){ return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE; }
  function MX(){ return (typeof MATRIX!=='undefined'&&MATRIX)?MATRIX:(window.MATRIX||{}); }
  function MK(){ return (typeof MATKEYS!=='undefined'&&MATKEYS)?MATKEYS:Object.keys(MX()); }
  function mats(){ var s=S(); var m=MX(); if(!s||!Array.isArray(s.mats)) return []; return s.mats.filter(function(k){ return m[k]; }); }
  function hueOf(key){ var m=MX()[key]; var band=ELBAND[m?m[1]:EFIR]||[258,300]; var idx=MK().indexOf(key); if(idx<0) idx=0; var span=band[1]-band[0]; return band[0]+((idx*37)%(span+1)); }
  function col(key,l){ return 'hsl('+hueOf(key)+',64%,'+(l==null?60:l)+'%)'; }
  function glow(key,a){ return 'hsla('+hueOf(key)+',64%,55%,'+(a==null?'.18':a)+')'; }
  function glyphs(arr){ var m=MX(); return arr.map(function(k){ return m[k]?m[k][0]:''; }).join(''); }

  function styleOnce(){ if($('mx-skin-style')) return; var st=document.createElement('style'); st.id='mx-skin-style';
    st.textContent=
    "#s-tigel.mx-themed{background-image:radial-gradient(120% 60% at 50% 4%, var(--mx-glow,transparent), transparent 60%)}"+
    "#s-tigel.mx-themed #orb{transition:background .5s ease,box-shadow .5s ease}"+
    "#s-tigel #orb span{transition:font-size .3s ease,filter .3s ease}"+
    "#mx-skin-label{text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;color:var(--mx-accent,#c9a84c);margin:-4px 0 14px;min-height:13px;opacity:.9}";
    document.head.appendChild(st); }

  function label(scr){ var l=$('mx-skin-label'); if(l&&l.parentNode) l.parentNode.removeChild(l); return null; }

  function reset(scr){ scr.classList.remove('mx-themed'); ['--mx-accent','--mx-accent2','--mx-glow','--gold','--spark'].forEach(function(p){ scr.style.removeProperty(p); }); var orb=$('orb'); if(orb){ orb.style.removeProperty('background'); orb.style.removeProperty('box-shadow'); var sp=orb.querySelector('span'); if(sp){ sp.textContent='\uD83D\uDD25'; sp.style.removeProperty('font-size'); } } var l=$('mx-skin-label'); if(l) l.textContent=''; }

  function apply(){ var scr=$('s-tigel'); if(!scr) return; styleOnce(); var mm=mats(); if(!mm.length){ reset(scr); return; }
    var c1=col(mm[0],60), c2=col(mm[1]||mm[0],60), c3=col(mm[2]||mm[1]||mm[0],60);
    scr.classList.add('mx-themed');
    scr.style.setProperty('--mx-accent', c1);
    scr.style.setProperty('--mx-accent2', mm[1]?c2:col(mm[0],74));
    scr.style.setProperty('--mx-glow', glow(mm[0]));
    scr.style.setProperty('--gold', c1);
    scr.style.setProperty('--spark', mm[1]?c2:col(mm[0],74));
    var orb=$('orb'); if(orb){ var grad;
      if(mm.length===1){ grad='radial-gradient(circle at 46% 36%,'+col(mm[0],80)+','+col(mm[0],55)+' 52%,'+col(mm[0],32)+' 100%)'; }
      else if(mm.length===2){ grad='conic-gradient(from 210deg,'+c1+','+c2+','+c1+')'; }
      else { grad='conic-gradient(from 200deg,'+c1+','+c2+','+c3+','+c1+')'; }
      orb.style.background=grad;
      orb.style.boxShadow='0 0 70px '+glow(mm[0],'.5')+',inset 0 0 46px rgba(255,255,255,.16)';
      var sp=orb.querySelector('span'); if(sp){ sp.textContent=glyphs(mm); sp.style.fontSize=(mm.length>=3?24:mm.length===2?34:46)+'px'; } }
    var l=label(scr); if(l){ l.textContent=glyphs(mm)+'  '+mm.join('  \u00d7  '); }
  }

  function wrap(name){ var f=window[name]; if(typeof f==='function'&&!f.__mxWrapped){ var w=function(){ var r=f.apply(this,arguments); try{ setTimeout(apply,0); }catch(e){} return r; }; w.__mxWrapped=true; window[name]=w; } }

  function boot(){ try{ styleOnce(); }catch(e){}
    wrap('toggleMat'); wrap('renderDeck'); wrap('doMelt'); wrap('doLive');
    var _go=window.go; if(typeof _go==='function'&&!window.go.__mxWrapped){ var g=function(name){ var r=_go.apply(this,arguments); if(name==='tigel'){ setTimeout(apply,0); } return r; }; g.__mxWrapped=true; window.go=g; }
    function purge(){ try{ var ns=document.querySelectorAll('.mx-skin-label'); for(var i=0;i<ns.length;i++){ if(ns[i]&&ns[i].parentNode) ns[i].parentNode.removeChild(ns[i]); } var all=document.querySelectorAll('body *'); for(var j=0;j<all.length;j++){ var el=all[j]; var tc=(el.textContent||''); if(tc.length<40 && tc.indexOf('✦')>=0 && tc.indexOf('Тигель')>=0){ if(el.parentNode) el.parentNode.removeChild(el); } } }catch(e){} }
    function run(){ try{ purge(); apply(); purge(); }catch(e){} } run(); setTimeout(run,400); setTimeout(run,1200); setInterval(purge,800);
  }

  window.AwaraTigelSkin={ apply:apply, __ready:true };
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,140); }); }
  else { setTimeout(boot,140); }
})();
