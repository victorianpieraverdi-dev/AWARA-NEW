/* AWARA · Ведический скин для Тигеля (перенос эталона vedika-skin.html).
   Самодостаточный модуль. Накладывает на .card золотую рамку, медальон,
   мандалу-Ом и ауру с нарастанием 1->6. Уровень берётся из LensLevels.current().lv,
   либо переключателем 1-6 внизу (для предпросмотра). */
(function(){
  if(window.AwaraVedikaSkin) return;
  var SVGNS='<svg xmlns="http://www.w3.org/2000/svg" ';
  var PAL=[[217,154,43],[224,122,140],[42,120,170],[177,58,46],[80,165,115],[150,110,205]];

  function tile(d, ga){
    var S='rgba(240,205,110,'+ga+')', S2='rgba(240,205,110,'+(ga*0.62).toFixed(2)+')', S3='rgba(240,205,110,'+(ga*0.4).toFixed(2)+')';
    var clv=d>=6?3:d===5?2:d===4?1:0, clA=clv===3?0.95:clv===2?0.85:clv===1?0.72:0, clN=clv===3?6:clv===2?3:1;
    function CC(i){ var c=PAL[i%clN]; return 'rgba('+c[0]+','+c[1]+','+c[2]+','+clA+')'; }
    var p=SVGNS+'width="200" height="200" viewBox="0 0 200 200" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    p+='<rect x="6" y="6" width="188" height="188" rx="10" stroke="'+S+'" stroke-width="2"/>';
    if(d>=4) p+='<rect x="13" y="13" width="174" height="174" rx="8" stroke="'+CC(0)+'" stroke-width="2.6"/>';
    if(d>=5) p+='<rect x="18" y="18" width="164" height="164" rx="7" stroke="'+CC(2)+'" stroke-width="2"/>';
    if(d>=6) p+='<rect x="23" y="23" width="154" height="154" rx="6" stroke="'+CC(3)+'" stroke-width="2"/>';
    var c='';
    if(d>=2){ c+='<path d="M12 46 C12 25 25 12 46 12" stroke="'+S+'" stroke-width="1.6"/><circle cx="16" cy="16" r="2.6" fill="'+S+'"/>'; }
    if(d>=3){ c+='<path d="M16 16 q11 3 15 13 M16 16 q3 11 13 15" stroke="'+S2+'" stroke-width="1"/><circle cx="42" cy="14" r="1.6" fill="'+S2+'"/><circle cx="14" cy="42" r="1.6" fill="'+S2+'"/>'; }
    if(d>=4){ c+='<path d="M12 46 c10 -2 16 4 15 16" stroke="'+S2+'" stroke-width="1.3"/><path d="M24 24 q15 -2 18 13" stroke="'+S+'" stroke-width="1.1"/><circle cx="15" cy="15" r="6.5" fill="'+CC(0)+'"/><circle cx="15" cy="15" r="6.5" stroke="'+S+'" stroke-width="1.2"/>'; }
    if(d>=5){ c+='<path d="M12 52 q11 -13 25 -11 M52 12 q-13 11 -11 25" stroke="'+S3+'" stroke-width="1"/><circle cx="15" cy="15" r="10" stroke="'+CC(2)+'" stroke-width="2.2"/>'; }
    if(d>=6){ c+='<path d="M40 40 q4 -9 12 -9 M40 40 q-9 4 -9 12" stroke="'+S3+'" stroke-width="1"/><circle cx="15" cy="15" r="13.5" stroke="'+CC(3)+'" stroke-width="2"/>'; }
    p+='<g>'+c+'</g><g transform="translate(200,0) scale(-1,1)">'+c+'</g><g transform="translate(200,200) scale(-1,-1)">'+c+'</g><g transform="translate(0,200) scale(1,-1)">'+c+'</g>';
    var e='';
    if(d>=3){ e+='<circle cx="100" cy="6" r="2.4" fill="'+S+'"/><circle cx="82" cy="6" r="1.4" fill="'+S2+'"/><circle cx="118" cy="6" r="1.4" fill="'+S2+'"/><path d="M100 8 v7" stroke="'+S+'" stroke-width="1.1"/><path d="M100 15 c-4 -3 -5 -8 0 -11 c5 3 4 8 0 11 Z" stroke="'+S+'" stroke-width="1"/>'; }
    if(d>=4){ e+='<path d="M60 6 q10 11 20 0 q10 -11 20 0 q10 11 20 0 q10 -11 20 0" stroke="'+S2+'" stroke-width="1.2"/>'; }
    if(d>=5){ e+='<circle cx="100" cy="7" r="3.8" fill="'+CC(1)+'"/>'; }
    if(d>=6){ e+='<circle cx="100" cy="7" r="5.5" stroke="'+CC(5)+'" stroke-width="2"/><circle cx="100" cy="7" r="2" fill="'+CC(5)+'"/>'; }
    p+='<g>'+e+'</g><g transform="rotate(90 100 100)">'+e+'</g><g transform="rotate(180 100 100)">'+e+'</g><g transform="rotate(270 100 100)">'+e+'</g>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function medallion(n, ga, torana){
    var S='rgba(240,205,110,'+ga+')', S2='rgba(240,205,110,'+(ga*0.55).toFixed(2)+')';
    var pet = n<=2?0 : n===3?8 : n===4?12 : 16;
    var colorLv = n>=6?3 : n===5?2 : n===4?1 : 0;
    var calpha = colorLv===3?0.95 : colorLv===2?0.8 : colorLv===1?0.55 : 0;
    var cn = colorLv===3?6 : colorLv===2?3 : 1;
    var p=SVGNS+'viewBox="0 0 72 72" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    if(n>=5){ var ray=''; for(var k=0;k<24;k++){ ray+='<g transform="rotate('+(k*15)+' 36 36)"><line x1="36" y1="2" x2="36" y2="9" stroke="'+S+'" stroke-width="1"/></g>'; } p+=ray; p+='<circle cx="36" cy="36" r="33" stroke="'+S2+'" stroke-width=".8"/>'; }
    p+='<circle cx="36" cy="36" r="27" fill="rgba(18,9,4,.92)" stroke="'+S+'" stroke-width="1.4"/>';
    if(pet){ var r=''; for(var i=0;i<pet;i++){ r+='<g transform="rotate('+(i*360/pet).toFixed(1)+' 36 36)"><path d="M36 12 C40 20 40 26 36 32 C32 26 32 20 36 12 Z" stroke="'+S+'" stroke-width="1"/>'; if(colorLv){ var col=PAL[i%cn]; r+='<path d="M32.6 15.5 Q36 9.5 39.4 15.5" stroke="rgba('+col[0]+','+col[1]+','+col[2]+','+calpha+')" stroke-width="1.8"/>'; } r+='</g>'; } p+=r; }
    if(n===1){ p+='<circle cx="36" cy="36" r="13" stroke="'+S2+'" stroke-width="1"/>'; }
    if(n===2){ p+='<path d="M36 16 L54 52 L18 52 Z" stroke="'+S+'" stroke-width="1.2"/><path d="M36 56 L18 20 L54 20 Z" stroke="'+S+'" stroke-width="1.2"/><circle cx="36" cy="36" r="9" stroke="'+S2+'" stroke-width=".9"/>'; }
    if(n>=5){ p+='<path d="M36 18 L52 48 L20 48 Z" stroke="'+S2+'" stroke-width=".9"/><path d="M36 54 L20 24 L52 24 Z" stroke="'+S2+'" stroke-width=".9"/>'; }
    if(n===3||n===4){ p+='<path d="M36 28 L44 41 L28 41 Z" stroke="'+S+'" stroke-width="1"/>'; }
    if(pet>=16){ p+='<circle cx="36" cy="36" r="15" stroke="'+S+'" stroke-width=".8" opacity=".7"/>'; }
    p+='<circle cx="36" cy="36" r="2.8" fill="'+S+'"/>';
    if(torana){ p+='<path d="M14 38 C14 20 28 11 36 11 C44 11 58 20 58 38" stroke="'+S+'" stroke-width="1.3"/><path d="M36 6 l3 5 -3 3 -3 -3 Z" fill="'+S+'"/>'; }
    p+='</svg>'; return p;
  }

  function yantra(lv, ga){
    var S='rgba(240,205,110,'+ga+')', S2='rgba(240,205,110,'+(ga*0.6).toFixed(2)+')';
    var p=SVGNS+'viewBox="0 0 200 200" fill="none" stroke="'+S+'" stroke-width=".8" stroke-linejoin="round">';
    if(lv>=1){ p+='<circle cx="100" cy="100" r="86" stroke="'+S2+'"/><circle cx="100" cy="100" r="62" stroke="'+S2+'"/><circle cx="100" cy="100" r="3" fill="'+S+'"/>'; }
    if(lv>=2){ p+='<path d="M100 40 L152 130 L48 130 Z" stroke="'+S+'"/><path d="M100 160 L48 70 L152 70 Z" stroke="'+S+'"/><circle cx="100" cy="100" r="74" stroke="'+S2+'"/>'; }
    if(lv>=3){ var o=''; for(var i=0;i<16;i++){ o+='<g transform="rotate('+(i*22.5)+' 100 100)"><path d="M100 18 C106 30 106 40 100 50 C94 40 94 30 100 18 Z" stroke="'+S2+'"/></g>'; } p+=o;
      var q=''; for(var j=0;j<8;j++){ q+='<g transform="rotate('+(j*45)+' 100 100)"><path d="M100 52 C105 62 105 70 100 78 C95 70 95 62 100 52 Z" stroke="'+S+'"/></g>'; } p+=q;
      p+='<circle cx="100" cy="100" r="50" stroke="'+S2+'"/>'; }
    if(lv>=5){ p+='<path d="M100 60 L138 126 L62 126 Z" stroke="'+S+'"/><path d="M100 140 L62 74 L138 74 Z" stroke="'+S+'"/><path d="M100 72 L126 118 L74 118 Z" stroke="'+S2+'"/><path d="M100 128 L74 82 L126 82 Z" stroke="'+S2+'"/><circle cx="100" cy="100" r="3" fill="'+S+'"/>'; }
    if(lv>=6){ p+='<rect x="22" y="22" width="156" height="156" stroke="'+S+'"/><rect x="30" y="30" width="140" height="140" stroke="'+S2+'"/><path d="M92 22 v-8 h16 v8 M92 178 v8 h16 v-8 M22 92 h-8 v16 h8 M178 92 h8 v16 h-8" stroke="'+S+'"/>'; }
    p+='</svg>'; return p;
  }

  function innerPat(n){
    var a = n>=6?.27 : n===5?.22 : n===4?.17 : n===3?.13 : n===2?.09 : .06;
    var G='rgba(240,205,110,'+a+')', G2='rgba(240,205,110,'+(a*0.68).toFixed(3)+')';
    var p=SVGNS+'viewBox="0 0 200 200" fill="none" stroke="'+G+'" stroke-width="1" stroke-linejoin="round">';
    p+='<circle cx="100" cy="100" r="90" stroke="'+G2+'"/>';
    if(n>=3) p+='<circle cx="100" cy="100" r="74" stroke="'+G2+'"/>';
    var pet = n<=2?0 : n===3?8 : n===4?12 : 16;
    if(pet){ var r=''; for(var i=0;i<pet;i++){ r+='<g transform="rotate('+(i*360/pet).toFixed(1)+' 100 100)"><path d="M100 14 C108 32 108 48 100 62 C92 48 92 32 100 14 Z" stroke="'+G+'"/></g>'; } p+=r; }
    if(n>=5){ var q=''; for(var j=0;j<8;j++){ q+='<g transform="rotate('+(j*45)+' 100 100)"><path d="M100 66 C104 74 104 82 100 90 C96 82 96 74 100 66 Z" stroke="'+G2+'"/></g>'; } p+=q; }
    if(n>=2) p+='<text x="100" y="132" text-anchor="middle" font-family="serif" font-size="88" fill="'+G+'" stroke="none">ॐ</text>';
    p+='<circle cx="100" cy="100" r="2.6" fill="'+G+'"/>';
    if(n>=6) p+='<rect x="22" y="22" width="156" height="156" stroke="'+G2+'"/>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function arch(n, ga){
    var S='rgba(240,205,110,'+ga+')', S2='rgba(240,205,110,'+(ga*0.6).toFixed(2)+')';
    var clv=n>=6?3:n===5?2:n===4?1:0, clA=clv===3?0.95:clv===2?0.82:clv===1?0.6:0, cn=clv===3?6:clv===2?3:1;
    function CC(i){ var c=PAL[i%cn]; return 'rgba('+c[0]+','+c[1]+','+c[2]+','+clA+')'; }
    var p=SVGNS+'viewBox="0 0 240 96" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    p+='<path d="M16 94 V46 C16 22 46 10 120 10 C194 10 224 22 224 46 V94" stroke="'+S+'" stroke-width="2"/>';
    if(n>=2) p+='<path d="M28 94 V48 C28 28 54 18 120 18 C186 18 212 28 212 48 V94" stroke="'+S2+'" stroke-width="1.4"/>';
    if(n>=3) p+='<circle cx="120" cy="10" r="3" fill="'+S+'"/><path d="M120 13 v7 M120 20 c-4 -3 -5 -8 0 -11 c5 3 4 8 0 11 Z" stroke="'+S+'" stroke-width="1"/>';
    if(n>=4) p+='<path d="M40 94 V50 C40 34 62 26 120 26 C178 26 200 34 200 50 V94" stroke="'+CC(0)+'" stroke-width="1.6"/>';
    if(n>=5) p+='<circle cx="16" cy="46" r="4" fill="'+CC(2)+'"/><circle cx="224" cy="46" r="4" fill="'+CC(2)+'"/><path d="M120 4 l3 6 -3 4 -3 -4 Z" fill="'+CC(1)+'"/>';
    if(n>=6) p+='<path d="M52 94 V52 C52 40 72 34 120 34 C168 34 188 40 188 52 V94" stroke="'+CC(3)+'" stroke-width="1.3"/><circle cx="120" cy="10" r="6" stroke="'+CC(5)+'" stroke-width="1.6"/>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function ring(n, ga){
    n=Math.max(1,Math.min(6,n|0)); if(ga==null) ga=GA[n];
    var g1='rgba(240,205,110,'+ga+')', g2='rgba(255,228,150,'+Math.min(1,ga+0.12).toFixed(2)+')';
    var sw=1+n*0.5;
    var clv=n>=6?3:n===5?2:n===4?1:0, clA=clv===3?0.95:clv===2?0.82:clv===1?0.6:0, cn=clv===3?6:clv===2?3:1;
    function CC(i){ var c=PAL[i%cn]; return 'rgba('+c[0]+','+c[1]+','+c[2]+','+clA+')'; }
    var p=SVGNS+'viewBox="0 0 200 200" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    p+='<circle cx="100" cy="100" r="94" stroke="'+g1+'" stroke-width="'+sw.toFixed(2)+'"/>';
    if(n>=2) p+='<circle cx="100" cy="100" r="85" stroke="'+g1+'" stroke-width="'+(sw*0.55).toFixed(2)+'" stroke-opacity="0.75"/>';
    if(n>=3){ var b=12+(n-3)*8,br=(1.2+n*0.3).toFixed(1),i,a,x,y,d=''; for(i=0;i<b;i++){ a=i/b*6.2832; x=(100+90*Math.cos(a)).toFixed(1); y=(100+90*Math.sin(a)).toFixed(1); d+='<circle cx="'+x+'" cy="'+y+'" r="'+br+'" fill="'+g2+'"/>'; } p+=d; }
    if(n>=4){ var pt=8+(n-4)*8,j,aa,x1,y1,x2,y2,lw=(1+n*0.3).toFixed(1),q=''; for(j=0;j<pt;j++){ aa=j/pt*6.2832; x1=(100+80*Math.cos(aa)).toFixed(1); y1=(100+80*Math.sin(aa)).toFixed(1); x2=(100+98*Math.cos(aa)).toFixed(1); y2=(100+98*Math.sin(aa)).toFixed(1); q+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+CC(j)+'" stroke-width="'+lw+'"/>'; } p+=q; }
    if(n>=5) p+='<circle cx="100" cy="100" r="99" stroke="'+g2+'" stroke-width="'+(n>=6?'2.4':'1.3')+'"'+(n>=6?'':' stroke-dasharray="2 5"')+'/>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  var FW=[0,11,13,15,18,21,25], GLOW=[0,5,11,19,29,41,55], GA=[0,.55,.7,.84,.94,.99,1], YANA=[0,.06,.09,.13,.17,.22,.27], AURA=[0,.12,.24,.42,.66,.85,1];
  function cfg(n){ return {fw:FW[n],glow:GLOW[n],ga:GA[n],yanA:YANA[n],aura:AURA[n]}; }

  var CUR=1, FORCED=0, observer=null, pending=false;

  function curLevel(){
    if(FORCED) return FORCED;
    try{ if(window.LensLevels && LensLevels.current){ var c=LensLevels.current(); if(c && c.lv) return Math.max(1,Math.min(6,c.lv|0)); } }catch(e){}
    return CUR||1;
  }

  function decorate(){
    var cards=document.querySelectorAll('.phone .card');
    var L=cfg(CUR);
    for(var i=0;i<cards.length;i++){ var card=cards[i];
      if(!card.querySelector(':scope > .aw-vf')){ var f=document.createElement('div'); f.className='aw-vf'; card.insertBefore(f, card.firstChild); }
      var cr=card.querySelector(':scope > .aw-vc');
      if(!cr){ cr=document.createElement('span'); cr.className='aw-vc'; card.insertBefore(cr, card.firstChild); }
      cr.innerHTML=medallion(CUR, L.ga, CUR===6);
    }
  }

  function reobserve(){ var ph=document.querySelector('.phone'); if(observer && ph) observer.observe(ph,{childList:true,subtree:true}); }

  function apply(n){
    n=Math.max(1,Math.min(6, n|| curLevel()));
    CUR=n; var L=cfg(n); var h=document.documentElement;
    h.classList.add('aw-vedika'); h.classList.toggle('aw-motion', n>=5);
    h.style.setProperty('--vfw', L.fw+'px');
    h.style.setProperty('--vglow', L.glow+'px');
    h.style.setProperty('--vframe', tile(n, L.ga));
    h.style.setProperty('--vpat', innerPat(n));
    h.style.setProperty('--warch', arch(n, L.ga));
    h.style.setProperty('--vring', ring(n, L.ga));
    h.style.setProperty('--vtint', 'linear-gradient(160deg,rgba(255,214,140,'+(0.022+0.016*n).toFixed(3)+') 0%,rgba(120,55,15,'+(0.028+0.016*n).toFixed(3)+') 52%,rgba(150,70,20,'+(0.03+0.026*n).toFixed(3)+') 100%)');
    h.style.setProperty('--vline', 'rgba(240,205,110,'+(0.16+0.06*n).toFixed(2)+')');
    h.style.setProperty('--vaura', '0 0 '+(L.glow*1.0)+'px rgba(240,205,110,'+(0.14+0.05*n).toFixed(2)+'),0 0 '+(L.glow*0.4)+'px rgba(255,150,60,'+(0.05+0.03*n).toFixed(2)+'),inset 0 0 '+(16+5*n)+'px rgba(255,205,120,'+(L.aura*0.12).toFixed(3)+')');
    var y=document.getElementById('aw-vyantra'); if(y){ y.innerHTML=yantra(n, L.ga); y.style.opacity=String(L.yanA); }
    if(observer) observer.disconnect();
    decorate();
    reobserve();
    var bar=document.getElementById('aw-vbar'); if(bar){ var bs=bar.querySelectorAll('button'); for(var k=0;k<bs.length;k++){ bs[k].classList.toggle('on', +bs[k].getAttribute('data-lv')===n); } }
  }

  var CSS=[
    'html.aw-vedika .phone .card,html.aw-vedika .phone .mcard,html.aw-vedika .phone .libcard,html.aw-vedika .phone .awara-glass-card,html.aw-vedika .phone #dchat,html.aw-vedika .phone .lp-card{position:relative;background-image:var(--vpat,none),var(--vtint,none)!important;background-repeat:no-repeat,no-repeat!important;background-position:center,center!important;background-size:auto 86%,cover!important;background-color:rgba(26,11,4,.42)!important;backdrop-filter:blur(13px) saturate(110%) brightness(.64)!important;-webkit-backdrop-filter:blur(13px) saturate(110%) brightness(.64)!important;border:1px solid var(--vline,var(--line))!important;box-shadow:var(--vaura,none)!important;transition:box-shadow .8s,background .8s,border-color .8s}',
    'html.aw-vedika .phone .intent,html.aw-vedika .phone .gen,html.aw-vedika .phone .pl,html.aw-vedika .phone .streak .s,html.aw-vedika .phone .wd,html.aw-vedika .phone .arc .st{background-image:var(--vtint,none)!important;background-size:cover!important;background-color:rgba(34,14,5,.18)!important;border:1px solid var(--vline,var(--line))!important;box-shadow:0 0 calc(var(--vglow,0) * .4) rgba(240,205,110,.22)!important;transition:background .8s,border-color .8s}',
    'html.aw-vedika .phone .input,html.aw-vedika .phone textarea,html.aw-vedika .phone .search,html.aw-vedika .phone .aifield{background-image:var(--vtint,none)!important;background-size:cover!important;background-color:rgba(20,9,3,.30)!important;border:1px solid var(--vline,var(--line))!important;transition:background .8s,border-color .8s}',
    'html.aw-vedika .phone .btn,html.aw-vedika .phone .awara-gold-button{background:linear-gradient(120deg,rgba(214,150,40,.96),rgba(255,210,120,.96))!important;color:#2a1402!important;border:1px solid var(--vline,rgba(240,205,110,.5))!important;box-shadow:0 6px 22px rgba(170,105,28,.42),0 0 calc(var(--vglow,0) * .5) rgba(240,205,110,.4)!important}',
    'html.aw-vedika .phone .btn.ghost{background:var(--vtint,rgba(120,55,15,.2))!important;color:#f0cd6e!important;border:1px solid var(--vline,rgba(240,205,110,.4))!important}',
    'html.aw-vedika #lensPlaces .lp-card{position:relative;background-image:var(--vtint,none)!important;background-size:cover!important;background-color:rgba(40,18,6,.32)!important;border:1px solid var(--vline,var(--line))!important;border-left:3px solid var(--vline,var(--line))!important;box-shadow:0 0 calc(var(--vglow,0)*.5) rgba(240,205,110,.25)!important;transition:background .8s,border-color .8s}',
    'html.aw-vedika #lensPlaces .lp-t,html.aw-vedika #lensPlaces .lp-nm{color:#f7e6b0!important}',
    'html.aw-vedika #tigelWheel .tw-reel{background-image:var(--warch,none),radial-gradient(circle at 50% 0%,rgba(255,200,110,.18),rgba(60,28,8,.5))!important;background-repeat:no-repeat,no-repeat!important;background-position:top center,center!important;background-size:100% 100%,cover!important;border:1px solid var(--vline,var(--line))!important}',
    'html.aw-vedika #tigelWheel .tw-reel::before{background:linear-gradient(90deg,#1c0d04,transparent)!important}',
    'html.aw-vedika #tigelWheel .tw-reel::after{background:linear-gradient(270deg,#1c0d04,transparent)!important}',
    'html.aw-vedika #tigelWheel .tw-cell{background:rgba(255,210,120,.07)!important;border:1px solid var(--vline,var(--line))!important}',
    'html.aw-vedika #tigelWheel .tw-frame{border-color:rgba(240,205,110,.95)!important;box-shadow:0 0 calc(var(--vglow,0)*.6) rgba(240,205,110,.5)!important}',
    'html.aw-vedika #tigelWheel .tw-pick,html.aw-vedika #tigelWheel .tw-chal{background-image:var(--vtint,none)!important;background-size:cover!important;background-color:rgba(40,18,6,.30)!important;border:1px solid var(--vline,var(--line))!important;transition:background .8s,border-color .8s}',
    'html.aw-vedika #tigelWheel .tw-ptr{border-top-color:rgba(240,205,110,.95)!important}',
    'html.aw-vedika #tigelWheel .tw-bar i{background:linear-gradient(90deg,rgba(214,150,40,.9),rgba(255,210,120,.95))!important}',
    'html.aw-vedika #s-daimon .dm-orb{position:relative}',
    'html.aw-vedika #s-daimon .dm-orb::after{content:"";position:absolute;inset:0;background-image:var(--vring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:6;filter:drop-shadow(0 0 calc(var(--vglow,0)*.55) rgba(240,205,110,.65));transition:filter .8s}',
    'html.aw-vedika #s-daimon .dm-orb{box-shadow:0 0 60px rgba(123,98,201,.45),inset 0 0 40px rgba(157,134,224,.4)!important;transition:box-shadow .8s}',
    'html.aw-vedika #awaraHeartOrb{position:relative}',
    'html.aw-vedika #awaraHeartOrb::after{content:"";position:absolute;inset:0;background-image:var(--vring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:8;filter:drop-shadow(0 0 calc(var(--vglow,0)*.6) rgba(240,205,110,.7));transition:filter .8s}',
    'html.aw-vedika #s-tigel #orb{position:relative;overflow:visible}',
    'html.aw-vedika #s-tigel #orb::after{content:"";position:absolute;inset:-6px;background-image:var(--vring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:8;filter:drop-shadow(0 0 calc(var(--vglow,0)*.6) rgba(240,205,110,.7));transition:filter .8s}',
    'html.aw-vedika #genModal #genGlyph,html.aw-vedika #genModal #genTitle{color:#f7e6b0!important}',
    'html.aw-vedika #genModal #genSub{color:var(--spark,#ffd27a)!important}',
    'html.aw-vedika #genModal #genBody{color:#ece1c4!important}',
    'html.aw-vedika #genGrid .gen{background-image:var(--vtint,none)!important;background-size:cover!important;background-color:rgba(40,18,6,.30)!important;border:1px solid var(--vline,var(--line))!important;box-shadow:0 0 calc(var(--vglow,0)*.45) rgba(240,205,110,.3)!important;transition:background .8s,border-color .8s}',
    'html.aw-vedika #tcModal{background:rgba(18,8,3,.74)!important}',
    'html.aw-vedika #tcModal .tcSheet{background:linear-gradient(180deg,#1c0d05,#0a0502)!important;border:1px solid var(--vline,rgba(240,205,110,.55))!important;box-shadow:0 -10px 60px rgba(170,105,28,.32),var(--vaura,none)!important}',
    'html.aw-vedika #tcModal textarea{background:rgba(20,9,3,.5)!important;border:1px solid var(--vline,rgba(240,205,110,.4))!important;color:#ece1c4!important}',
    'html.aw-vedika #tcModal .tcChip{border-color:var(--vline,rgba(240,205,110,.4))!important;background:rgba(40,18,6,.4)!important}',
    'html.aw-vedika #tcModal .tcCard{box-shadow:0 0 24px rgba(240,205,110,.4),inset 0 0 40px rgba(30,12,4,.6)!important}',
    'html.aw-vedika #tcFab{background:rgba(26,11,4,.95)!important;box-shadow:0 0 18px rgba(240,205,110,.4)!important}',
    'html.aw-vedika .aw-vf{position:absolute;inset:0;pointer-events:none;border-style:solid;border-width:var(--vfw,12px);border-image-source:var(--vframe,none);border-image-slice:30%;border-image-width:var(--vfw,12px);border-image-repeat:round;border-radius:18px;filter:drop-shadow(0 0 var(--vglow,0) rgba(240,205,110,.4));z-index:4}',
    'html.aw-vedika .aw-vc{position:absolute;top:-24px;left:50%;width:50px;height:50px;transform:translateX(-50%);z-index:6;pointer-events:none;filter:drop-shadow(0 0 var(--vglow,0) rgba(240,205,110,.85))}',
    'html.aw-vedika .aw-vc svg{width:100%;height:100%;display:block}',
    'html.aw-vedika #aw-vyantra{position:absolute;left:50%;top:46%;width:150vw;max-width:680px;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;z-index:1;opacity:0;transition:opacity 1s}',
    'html.aw-vedika #aw-vyantra svg{width:100%;height:100%;display:block}',
    'html.aw-vedika.aw-motion #aw-vyantra{animation:awvSpin 200s linear infinite}',
    '@keyframes awvSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}',
    '#aw-vbar{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);display:none!important;gap:5px;padding:6px 8px;border-radius:999px;background:rgba(8,4,2,.6);backdrop-filter:blur(8px);border:1px solid rgba(240,205,110,.3);z-index:99999}',
    '#aw-vbar button{width:28px;height:28px;border-radius:50%;border:1px solid rgba(240,205,110,.35);background:transparent;color:#f0cd6e;font-family:serif;font-size:13px;cursor:pointer;transition:.2s}',
    '#aw-vbar button.on{background:rgba(240,205,110,.92);color:#221202;font-weight:700}'
  ].join('\n');

  function injectStyle(){ if(document.getElementById('aw-vedika-style')) return; var s=document.createElement('style'); s.id='aw-vedika-style'; s.textContent=CSS; document.head.appendChild(s); }
  function injectYantra(){ var ph=document.querySelector('.phone'); if(ph && !document.getElementById('aw-vyantra')){ var y=document.createElement('div'); y.id='aw-vyantra'; ph.insertBefore(y, ph.firstChild); } }
  function injectBar(){ if(document.getElementById('aw-vbar')) return; var b=document.createElement('div'); b.id='aw-vbar'; var html=''; for(var i=1;i<=6;i++){ html+='<button data-lv="'+i+'">'+i+'</button>'; } b.innerHTML=html; document.body.appendChild(b); b.addEventListener('click', function(e){ var t=e.target; while(t && t.tagName!=='BUTTON') t=t.parentNode; if(!t) return; FORCED=+t.getAttribute('data-lv'); apply(FORCED); }); }

  function boot(){
    injectStyle(); injectYantra(); injectBar();
    observer=new MutationObserver(function(){ if(pending) return; pending=true; requestAnimationFrame(function(){ pending=false; if(observer) observer.disconnect(); decorate(); reobserve(); }); });
    apply(curLevel());
    setInterval(function(){ if(!FORCED){ var n=curLevel(); if(n!==CUR) apply(n); } }, 3000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.AwaraVedikaSkin={ apply:apply, setLevel:function(n){FORCED=n;apply(n);}, auto:function(){FORCED=0;apply(curLevel());}, off:function(){document.documentElement.classList.remove('aw-vedika','aw-motion');} };
})();

/* AWARA - авто-загрузка культурного скина (закреплено вместо ручной вставки в консоль).
   Если что-то не понравится - удали этот блок. */
(function(){
  if(window.__awaraCultureAuto) return; window.__awaraCultureAuto=true;
  function loadCulture(){ try{ if(window.AwaraCultureSkin) return; var s=document.createElement('script'); s.src='awara-culture-skin.js?v='+Date.now(); s.async=true; document.body.appendChild(s); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadCulture); else loadCulture();
})();
