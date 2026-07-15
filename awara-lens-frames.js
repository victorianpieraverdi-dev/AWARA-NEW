/* awara-lens-frames.js  v3
   РАМКА ИЗ НАСТОЯЩИХ КАРТ: берём внешнюю кромку арта (border-image)
   и пускаем её золочёным багетом по краю окна. Центр пустой — там UI.
   Дополняет фон (awara-window-bg) — рамка и фон из одного мира.
   Не кликается. ASCII-code.
   API:
     AwaraLensFrame.repaint()
     AwaraLensFrame.setEnabled(true|false)
     AwaraLensFrame.setOpacity(0..1)
     AwaraLensFrame.preview(slug, lv)   // посмотреть любую линзу/уровень
     AwaraLensFrame.clearPreview()
     AwaraLensFrame.demo(slug)          // прогнать 6 уровней
     // тонкая настройка вручную:
     AwaraLensFrame.setSlice(8..24)     // % кромки карты, которая идёт в рамку
     AwaraLensFrame.setRepeat('stretch'|'round'|'space')
     AwaraLensFrame.setCard(slug, urlOrFile) // привязать другую карту к линзе
*/
(function(){
  if(window.AwaraLensFrame) return;
  var ROOT='exports/generated_cards/tarot_cards_webp/';
  var FORM=['','\u0413\u043e\u0440\u043d','\u0420\u0430\u0441\u043f\u043b\u0430\u0432','\u0411\u0430\u0441\u0441\u0435\u0439\u043d','\u041f\u0440\u0438\u0437\u043c\u0430','\u0412\u043e\u0440\u043e\u043d\u043a\u0430','\u041a\u0432\u0430\u043d\u0442'];
  /* МАНИФЕСТ: slug -> файл настоящей карты. Пока 3 культуры — потом расширим на 33. */
  var CARD={
    vedic:    ROOT+'001_svet_ra__vedic.webp',
    egyptian: ROOT+'002_svet_ra__egyptian.webp',
    slavic:   ROOT+'005_svet_ra__slavic.webp'
  };
  var GOLD='#cdab57';
  var enabled=true, opacity=1, preview=null, lastKey='';
  var SLICE=14, REPEAT='stretch';

  function injectCss(){
    if(document.getElementById('awlf-css')) return;
    var s=document.createElement('style'); s.id='awlf-css';
    s.textContent=[
'@keyframes awlfBreath{0%,100%{opacity:.45}50%{opacity:.8}}',
'#lensFrame{position:fixed;inset:0;pointer-events:none;z-index:56;transition:opacity .7s ease}',
'#lensFrame.off{display:none}',
/* АРТ-РАМКА: border-image из кромки карты */
'#lensFrame .awlf-art{position:absolute;inset:0;pointer-events:none;border-style:solid;',
'  border-width:var(--bw,64px);border-image-width:var(--bw,64px);',
'  border-image-slice:var(--slice,14%);border-image-repeat:var(--rep,stretch);',
'  border-image-source:var(--src,none);border-image-outset:0;',
'  filter:drop-shadow(0 0 var(--shadow,0px) rgba(205,171,87,.45));transition:filter .6s ease}',
/* тонкая золотая отбивка между рамкой и контентом */
'#lensFrame .awlf-edge{position:absolute;inset:var(--bw,64px);border:1px solid color-mix(in srgb,var(--fc,'+GOLD+') 36%,transparent);border-radius:6px;pointer-events:none;opacity:0;transition:opacity .5s ease}',
/* мягкий ореол под высокие уровни */
'#lensFrame .awlf-halo{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(130% 50% at 50% 0,color-mix(in srgb,var(--fc,'+GOLD+') 16%,transparent),transparent 58%),radial-gradient(130% 50% at 50% 100%,color-mix(in srgb,var(--fc,'+GOLD+') 14%,transparent),transparent 58%)}',
/* запасная код-рамка (пока нет арта под культуру) */
'#lensFrame.fallback .awlf-art{border-image-source:none!important;border:none}',
'#lensFrame.fallback .awlf-edge{inset:12px;border-radius:14px;border-width:1.5px;opacity:1!important;box-shadow:inset 0 0 0 4px transparent,inset 0 0 0 5px color-mix(in srgb,var(--fc,'+GOLD+') 26%,transparent)}',
'#lensFrame .awlf-badge{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);font-family:"JetBrains Mono",monospace;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;padding:3px 12px;border-radius:999px;color:color-mix(in srgb,var(--fc,'+GOLD+') 90%,#fff);background:rgba(8,7,16,.42);border:1px solid color-mix(in srgb,var(--fc,'+GOLD+') 38%,transparent);backdrop-filter:blur(3px);white-space:nowrap;z-index:2}',
/* уровни: толщина багета + свечение растёт */
'#lensFrame.lv1{--bw:clamp(24px,6.5vmin,52px);--shadow:0px}',
'#lensFrame.lv2{--bw:clamp(28px,7.5vmin,60px);--shadow:0px}',
'#lensFrame.lv2 .awlf-edge{opacity:.5}',
'#lensFrame.lv3{--bw:clamp(32px,8.5vmin,68px);--shadow:4px}',
'#lensFrame.lv3 .awlf-edge{opacity:.8}',
'#lensFrame.lv4{--bw:clamp(36px,9.5vmin,76px);--shadow:7px}',
'#lensFrame.lv4 .awlf-edge{opacity:1}',
'#lensFrame.lv5{--bw:clamp(40px,10.5vmin,84px);--shadow:11px}',
'#lensFrame.lv5 .awlf-edge{opacity:1}',
'#lensFrame.lv5 .awlf-halo{opacity:.7}',
'#lensFrame.lv6{--bw:clamp(44px,11.5vmin,92px);--shadow:15px}',
'#lensFrame.lv6 .awlf-edge{opacity:1}',
'#lensFrame.lv6 .awlf-halo{opacity:1;animation:awlfBreath 6s ease-in-out infinite}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureEl(){
    var f=document.getElementById('lensFrame');
    if(!f){
      f=document.createElement('div'); f.id='lensFrame';
      f.innerHTML='<div class="awlf-halo"></div>'+
                  '<div class="awlf-art"></div>'+
                  '<div class="awlf-edge"></div>'+
                  '<div class="awlf-badge"></div>';
      (document.body||document.documentElement).appendChild(f);
    }
    return f;
  }

  function curLens(){
    if(preview) return preview;
    try{ if(window.LensLevels&&LensLevels.current){var c=LensLevels.current(); if(c&&c.slug) return {slug:c.slug,lv:c.lv||1};} }catch(e){}
    return {slug:null,lv:1};
  }
  function palFor(slug){
    try{ if(window.lensStyleFor){var st=lensStyleFor(slug); if(st&&st.palette&&st.palette.length) return st.palette;} }catch(e){}
    try{ if(window.lensPalette){var p=lensPalette(slug); if(p&&p.length) return p;} }catch(e){}
    return ['#c9a84c','#7b62c9','#f4e3b0'];
  }
  function lensName(slug){
    try{ if(window.AwaraLens&&AwaraLens.titleFor){var t=AwaraLens.titleFor(slug); if(t) return t;} }catch(e){}
    return slug||'';
  }

  function paint(){
    injectCss();
    var f=ensureEl();
    f.style.opacity=String(opacity);
    if(!enabled){ f.classList.add('off'); return; } else f.classList.remove('off');
    var cur=curLens();
    var lv=Math.max(1,Math.min(6,cur.lv||1));
    var pal=palFor(cur.slug);
    var c0=pal[0]||'#c9a84c';
    var fc='color-mix(in srgb,'+GOLD+' 72%, '+c0+' 28%)';
    f.style.setProperty('--fc',fc);
    f.style.setProperty('--slice',SLICE+'%');
    f.style.setProperty('--rep',REPEAT);
    var src=cur.slug&&CARD[cur.slug]?CARD[cur.slug]:null;
    var art=f.querySelector('.awlf-art');
    if(src){ f.classList.remove('fallback'); art.style.setProperty('--src','url("'+src+'")'); }
    else { f.classList.add('fallback'); art.style.setProperty('--src','none'); }
    for(var i=1;i<=6;i++) f.classList.remove('lv'+i);
    f.classList.add('lv'+lv);
    var nm=lensName(cur.slug);
    f.querySelector('.awlf-badge').textContent=(nm?nm+'  \u00b7  ':'')+FORM[lv]+'  \u00b7  '+lv+'/6';
    lastKey=(cur.slug||'')+':'+lv+':'+SLICE+':'+REPEAT;
  }

  function loop(){ try{ var cur=curLens(); var key=(cur.slug||'')+':'+(cur.lv||1)+':'+SLICE+':'+REPEAT; if(key!==lastKey) paint(); }catch(e){} }

  window.AwaraLensFrame={
    repaint:paint,
    setEnabled:function(b){enabled=!!b;paint();},
    setOpacity:function(n){opacity=Math.max(0,Math.min(1,+n));paint();},
    preview:function(slug,lv){preview={slug:slug,lv:lv||1};paint();},
    clearPreview:function(){preview=null;paint();},
    demo:function(slug){var n=1;slug=slug||curLens().slug;var t=setInterval(function(){AwaraLensFrame.preview(slug,n);n++;if(n>6)clearInterval(t);},1200);},
    setSlice:function(p){SLICE=Math.max(2,Math.min(40,+p));paint();},
    setRepeat:function(r){REPEAT=r||'stretch';paint();},
    setCard:function(slug,u){ if(!slug||!u) return; CARD[slug]=(u.indexOf('/')>=0?u:ROOT+u); paint(); },
    cards:CARD
  };

  function boot(){ paint(); setInterval(loop,1000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
