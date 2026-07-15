/* AWARA · Общий культурный скин для Тигеля.
   Следит за верхней панелью через window.LensLevels.current() -> {slug, lv}.
   Правило: пилотные матрицы (slavic/egyptian/daoist) -> культурный скин (ведика гаснет).
   Любая другая (вкл. ведическая) -> ДВИЖОК НЕ ТРОГАЕТ ведику, оставляет как было.
   Добавить матрицу = дописать в PASS и EM. */
(function(){
  if(window.AwaraCultureSkin) return;
  var SVGNS='<svg xmlns="http://www.w3.org/2000/svg" ';
  var TAU=Math.PI*2;
  function pol(cx,cy,n,r,rot){rot=(rot==null?-90:rot)*Math.PI/180;var o=[];for(var i=0;i<n;i++){var a=rot+i*TAU/n;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return o;}
  function star(cx,cy,n,ro,ri,rot){rot=(rot==null?-90:rot)*Math.PI/180;var o=[];for(var i=0;i<2*n;i++){var r=i%2?ri:ro;var a=rot+i*Math.PI/n;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return o;}
  function P(a){return a.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
  function spokes(cx,cy,n,r1,r2,rot){rot=(rot==null?-90:rot)*Math.PI/180;var s='';for(var i=0;i<n;i++){var a=rot+i*TAU/n;s+='<line x1="'+(cx+r1*Math.cos(a)).toFixed(1)+'" y1="'+(cy+r1*Math.sin(a)).toFixed(1)+'" x2="'+(cx+r2*Math.cos(a)).toFixed(1)+'" y2="'+(cy+r2*Math.sin(a)).toFixed(1)+'"/>';}return s;}

  /* Знаки матриц (viewBox 0 0 100 100). k=основной, a=второй, i=деталь */
  var EM={
   slavic:function(k,a,i){var g='';for(var d=0;d<8;d++){var ang=(-90+d*45)*Math.PI/180;var x1=50+6*Math.cos(ang),y1=50+6*Math.sin(ang);var x2=50+26*Math.cos(ang),y2=50+26*Math.sin(ang);var ta=ang+Math.PI/2.4;var x3=x2+10*Math.cos(ta),y3=y2+10*Math.sin(ta);g+='<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+' L'+x2.toFixed(1)+','+y2.toFixed(1)+' L'+x3.toFixed(1)+','+y3.toFixed(1)+'"/>';}return '<g fill="none" stroke="'+k+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+g+'</g><circle cx="50" cy="50" r="5" fill="'+a+'"/>';},
   egyptian:function(k,a,i){return '<g fill="none" stroke="'+a+'" stroke-width="2" stroke-linecap="round"><path d="M24,50 Q40,36 58,46 Q44,60 24,50 Z" stroke="'+k+'"/><path d="M58,46 Q66,44 71,38"/><path d="M44,58 L44,68"/><path d="M44,68 Q52,72 57,64"/></g><circle cx="41" cy="50" r="4.5" fill="'+a+'"/><circle cx="60" cy="26" r="6" fill="'+i+'"/>';},
   daoist:function(k,a,i){return '<circle cx="50" cy="50" r="30" fill="'+a+'"/><path d="M50,20 a30,30 0 0,1 0,60 a15,15 0 0,1 0,-30 a15,15 0 0,0 0,-30" fill="'+i+'"/><circle cx="50" cy="35" r="4.5" fill="'+a+'"/><circle cx="50" cy="65" r="4.5" fill="'+i+'"/><circle cx="50" cy="50" r="30" fill="none" stroke="'+k+'" stroke-width="1.6"/>';},
   vedic:(k,a,i)=>`<g fill="none" stroke="${a}" stroke-width="1.3"><circle cx="50" cy="50" r="33" stroke="${k}"/><polygon points="${P(pol(50,50,12,33))}" stroke="${k}" stroke-width="0.6" opacity=".4"/><polygon points="50,24 72,62 28,62"/><polygon points="50,76 28,38 72,38"/><polygon points="50,33 64,57 36,57"/><polygon points="50,67 36,43 64,43"/></g><circle cx="50" cy="50" r="3.2" fill="${a}"/>`,
   tarot_arcanic:(k,a,i)=>`<g stroke="${k}" stroke-width="1.3" fill="none">${spokes(50,50,12,20,34)}</g><circle cx="50" cy="50" r="16" fill="${a}"/><polygon points="${P(star(50,50,7,9,3.8))}" fill="${i}"/>`,
   kabbalistic:(k,a,i)=>{const N={ke:[50,12],ch:[68,26],bi:[32,26],he:[68,46],ge:[32,46],ti:[50,52],ne:[68,68],ho:[32,68],ye:[50,76],ma:[50,90]};const E=[['ke','ch'],['ke','bi'],['ch','bi'],['ch','he'],['bi','ge'],['he','ge'],['ch','ti'],['bi','ti'],['he','ti'],['ge','ti'],['he','ne'],['ge','ho'],['ti','ne'],['ti','ho'],['ne','ho'],['ne','ye'],['ho','ye'],['ti','ye'],['ye','ma']];const ln=E.map(e=>`<line x1="${N[e[0]][0]}" y1="${N[e[0]][1]}" x2="${N[e[1]][0]}" y2="${N[e[1]][1]}"/>`).join('');const nd=Object.values(N).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${a}" stroke="${i}" stroke-width="0.7"/>`).join('');return `<g stroke="${k}" stroke-width="0.9" opacity=".8">${ln}</g>${nd}`;},
   hermetic_alchemical:(k,a,i)=>`<circle cx="50" cy="50" r="32" fill="none" stroke="${k}" stroke-width="1.4"/><polygon points="50,26 70,62 30,62" fill="none" stroke="${a}" stroke-width="1.4"/><circle cx="50" cy="46" r="9" fill="none" stroke="${i}" stroke-width="1.2"/><line x1="50" y1="55" x2="50" y2="72" stroke="${i}" stroke-width="1.4"/><line x1="43" y1="66" x2="57" y2="66" stroke="${i}" stroke-width="1.4"/><path d="M44,34 a6,6 0 1,0 12,0" fill="none" stroke="${a}" stroke-width="1.2"/><circle cx="50" cy="36" r="2.6" fill="${a}"/>`,
   gnostic:(k,a,i)=>`<circle cx="50" cy="50" r="30" fill="none" stroke="${k}" stroke-width="1" opacity=".5"/><line x1="50" y1="18" x2="50" y2="32" stroke="${i}" stroke-width="2"/><path d="M24,66 Q34,42 50,56 Q66,70 76,46" fill="none" stroke="${a}" stroke-width="2.2" stroke-linecap="round"/><circle cx="76" cy="46" r="3" fill="${a}"/><g stroke="${i}" stroke-width="1.4" fill="none"><circle cx="33" cy="78" r="4"/><circle cx="42" cy="82" r="4"/></g>`,
   chinese_iching:(k,a,i)=>{let g='';const pos=pol(50,50,8,32);const br=[[1,1,1],[0,0,0],[1,0,1],[0,1,0],[1,1,0],[0,1,1],[1,0,0],[0,0,1]];pos.forEach((p,idx)=>{const x=p[0],y=p[1];for(let r=0;r<3;r++){const yy=y-3+r*3;if(br[idx][r]){g+=`<line x1="${(x-5).toFixed(1)}" y1="${yy.toFixed(1)}" x2="${(x+5).toFixed(1)}" y2="${yy.toFixed(1)}"/>`;}else{g+=`<line x1="${(x-5).toFixed(1)}" y1="${yy.toFixed(1)}" x2="${(x-1.5).toFixed(1)}" y2="${yy.toFixed(1)}"/><line x1="${(x+1.5).toFixed(1)}" y1="${yy.toFixed(1)}" x2="${(x+5).toFixed(1)}" y2="${yy.toFixed(1)}"/>`;}}});return `<circle cx="50" cy="50" r="34" fill="none" stroke="${k}" stroke-width="1"/><g stroke="${a}" stroke-width="1.4" stroke-linecap="round">${g}</g><circle cx="50" cy="50" r="6" fill="none" stroke="${k}" stroke-width="1.2"/><circle cx="50" cy="50" r="2.5" fill="${i}"/>`;},
   mayan:(k,a,i)=>`<circle cx="50" cy="50" r="33" fill="none" stroke="${k}" stroke-width="1.4"/><circle cx="50" cy="50" r="25" fill="none" stroke="${a}" stroke-width="1"/><g stroke="${k}" stroke-width="1">${spokes(50,50,20,25,33)}</g><rect x="42" y="42" width="16" height="16" fill="none" stroke="${i}" stroke-width="1.4" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="4" fill="${a}"/>`,
   aztec_mexica:(k,a,i)=>{let g='';for(let d=0;d<8;d++){const ang=(-90+d*45)*Math.PI/180;const tip=[50+30*Math.cos(ang),50+30*Math.sin(ang)];const b1=[50+18*Math.cos(ang+0.18),50+18*Math.sin(ang+0.18)];const b2=[50+18*Math.cos(ang-0.18),50+18*Math.sin(ang-0.18)];g+=`<polygon points="${tip[0].toFixed(1)},${tip[1].toFixed(1)} ${b1[0].toFixed(1)},${b1[1].toFixed(1)} ${b2[0].toFixed(1)},${b2[1].toFixed(1)}"/>`;}return `<g fill="${k}">${g}</g><circle cx="50" cy="50" r="15" fill="none" stroke="${i}" stroke-width="1.4"/><circle cx="50" cy="50" r="11" fill="${a}"/><g fill="${i}"><circle cx="45" cy="48" r="2"/><circle cx="55" cy="48" r="2"/></g><line x1="45" y1="55" x2="55" y2="55" stroke="${i}" stroke-width="1.4"/>`;},
   celtic:(k,a,i)=>`<g fill="none" stroke="${a}" stroke-width="2"><circle cx="50" cy="38" r="16"/><circle cx="38" cy="58" r="16"/><circle cx="62" cy="58" r="16"/></g><circle cx="50" cy="50" r="32" fill="none" stroke="${k}" stroke-width="1"/>`,
   norse:(k,a,i)=>{let g='';for(let d=0;d<8;d++){const ang=(-90+d*45)*Math.PI/180;const x1=50+5*Math.cos(ang),y1=50+5*Math.sin(ang);const x2=50+30*Math.cos(ang),y2=50+30*Math.sin(ang);g+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;const fa1=ang+0.5,fa2=ang-0.5;g+=`<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(x2-8*Math.cos(fa1)).toFixed(1)}" y2="${(y2-8*Math.sin(fa1)).toFixed(1)}"/><line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(x2-8*Math.cos(fa2)).toFixed(1)}" y2="${(y2-8*Math.sin(fa2)).toFixed(1)}"/>`;}return `<g fill="none" stroke="${k}" stroke-width="1.5" stroke-linecap="round">${g}<circle cx="50" cy="50" r="4" stroke="${a}"/></g>`;},
   shamanic:(k,a,i)=>`<circle cx="50" cy="50" r="30" fill="none" stroke="${k}" stroke-width="2.5"/><line x1="50" y1="20" x2="50" y2="80" stroke="${a}" stroke-width="1.4"/><line x1="20" y1="50" x2="80" y2="50" stroke="${a}" stroke-width="1.4"/><circle cx="50" cy="50" r="4" fill="${a}"/><g fill="${i}"><circle cx="50" cy="31" r="2.5"/><circle cx="50" cy="69" r="2.5"/><circle cx="31" cy="50" r="2.5"/><circle cx="69" cy="50" r="2.5"/></g>`,
   buddhist_mahayana:(k,a,i)=>`<g stroke="${k}" stroke-width="1.6" fill="none"><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="24"/><circle cx="50" cy="50" r="7"/>${spokes(50,50,8,7,30)}</g><circle cx="50" cy="50" r="3" fill="${a}"/>`,
   islamic_sufi_nur:(k,a,i)=>`<g fill="none" stroke="${a}" stroke-width="1.6"><rect x="28" y="28" width="44" height="44"/><rect x="28" y="28" width="44" height="44" transform="rotate(45 50 50)"/></g><polygon points="${P(pol(50,50,8,11))}" fill="${k}"/><path d="M70,18 a7,7 0 1,0 3,12 a5,5 0 1,1 -3,-12" fill="${i}"/>`,
   christian_mystical_grail:(k,a,i)=>`<g stroke="${k}" stroke-width="2.5" fill="none" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="30" y1="44" x2="70" y2="44"/></g><circle cx="50" cy="44" r="9" fill="none" stroke="${a}" stroke-width="1.6"/><circle cx="50" cy="44" r="4" fill="${a}"/>`,
   atlantean_lemurian:(k,a,i)=>`<g fill="none" stroke="${k}" stroke-width="1.4"><circle cx="50" cy="50" r="32"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="12"/></g><line x1="50" y1="18" x2="50" y2="82" stroke="${a}"/><line x1="18" y1="50" x2="82" y2="50" stroke="${a}"/><polygon points="50,40 58,56 42,56" fill="${i}"/>`,
   shambhala:(k,a,i)=>`<g stroke="${k}" stroke-width="1.4">${spokes(50,38,12,14,26)}</g><circle cx="50" cy="38" r="10" fill="${a}"/><polygon points="50,40 78,80 22,80" fill="none" stroke="${i}" stroke-width="2"/><line x1="38" y1="62" x2="62" y2="62" stroke="${i}" stroke-width="1.2"/>`,
   gene_keys:(k,a,i)=>{let rungs='',s1='',s2='';for(let y=18;y<=82;y+=2){const t=(y-18)/64;const off=18*Math.sin(t*4*Math.PI);s1+=`${(50-off).toFixed(1)},${y} `;s2+=`${(50+off).toFixed(1)},${y} `;}for(let y=24;y<=76;y+=10){const t=(y-18)/64;const off=18*Math.sin(t*4*Math.PI);rungs+=`<line x1="${(50-off).toFixed(1)}" y1="${y}" x2="${(50+off).toFixed(1)}" y2="${y}"/>`;}return `<g stroke="${i}" stroke-width="1" opacity=".6">${rungs}</g><polyline points="${s1}" fill="none" stroke="${k}" stroke-width="2"/><polyline points="${s2}" fill="none" stroke="${a}" stroke-width="2"/>`;},
   astrological:(k,a,i)=>{const dots=pol(50,50,12,28).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.5" fill="${i}"/>`).join('');return `<circle cx="50" cy="50" r="32" fill="none" stroke="${k}" stroke-width="1.4"/><circle cx="50" cy="50" r="20" fill="none" stroke="${a}" stroke-width="0.8" opacity=".6"/><g stroke="${k}" stroke-width="0.8" opacity=".7">${spokes(50,50,12,20,32)}</g>${dots}<circle cx="50" cy="50" r="6" fill="${a}"/>`;},
   cosmic_galactic:(k,a,i)=>{let pts=[];for(let t=0;t<=1.001;t+=0.04){const r=2+32*t;const ang=t*4*Math.PI;pts.push((50+r*Math.cos(ang)).toFixed(1)+','+(50+r*Math.sin(ang)).toFixed(1));}const stars=[[20,24],[78,30],[26,74],[72,72],[50,16],[16,52]].map(s=>`<circle cx="${s[0]}" cy="${s[1]}" r="1.6" fill="${i}"/>`).join('');return `<polyline points="${pts.join(' ')}" fill="none" stroke="${a}" stroke-width="1.6"/><circle cx="50" cy="50" r="3" fill="${k}"/>${stars}`;},
   shinto:(k,a,i)=>`<circle cx="50" cy="30" r="9" fill="${k}"/><g stroke="${a}" stroke-width="3" stroke-linecap="round" fill="none"><line x1="30" y1="40" x2="30" y2="78"/><line x1="70" y1="40" x2="70" y2="78"/><path d="M22,40 Q50,34 78,40"/><line x1="26" y1="50" x2="74" y2="50"/></g><line x1="46" y1="50" x2="54" y2="50" stroke="${i}" stroke-width="2"/>`,
   sumerian_babylonian:(k,a,i)=>`<g fill="none" stroke="${k}" stroke-width="1.6"><rect x="26" y="66" width="48" height="10"/><rect x="32" y="56" width="36" height="10"/><rect x="38" y="46" width="24" height="10"/><rect x="44" y="38" width="12" height="8"/></g><polygon points="${P(star(50,24,8,12,5))}" fill="${a}"/>`,
   zoroastrian:(k,a,i)=>`<g stroke="${a}" stroke-width="1.6" fill="none"><path d="M50,46 Q30,40 18,50 Q34,48 46,54"/><path d="M50,46 Q70,40 82,50 Q66,48 54,54"/></g><circle cx="50" cy="48" r="7" fill="none" stroke="${k}" stroke-width="1.6"/><path d="M50,28 Q44,40 50,46 Q56,40 50,28 Z" fill="${i}"/><g stroke="${k}" stroke-width="1.4"><line x1="44" y1="58" x2="42" y2="72"/><line x1="56" y1="58" x2="58" y2="72"/></g>`,
   afro_dogon:(k,a,i)=>`<ellipse cx="50" cy="50" rx="34" ry="19" fill="none" stroke="${k}" stroke-width="1" opacity=".6" transform="rotate(-18 50 50)"/><polygon points="${P(star(40,46,6,12,5))}" fill="${a}"/><circle cx="71" cy="58" r="4" fill="${i}"/><circle cx="58" cy="34" r="1.6" fill="${i}" opacity=".7"/>`,
   yoruba_ifa_orisha:(k,a,i)=>{const cw=pol(50,50,8,24).map(p=>`<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="2.4" ry="3.4" fill="${i}"/>`).join('');return `<rect x="20" y="20" width="60" height="60" rx="4" fill="none" stroke="${k}" stroke-width="2"/><polygon points="50,12 56,24 44,24" fill="${a}"/>${cw}<circle cx="50" cy="50" r="6" fill="${a}"/>`;},
   tantric_kashmiri:(k,a,i)=>`<line x1="50" y1="30" x2="50" y2="80" stroke="${k}" stroke-width="2.5"/><g stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round"><line x1="38" y1="40" x2="38" y2="24"/><line x1="50" y1="40" x2="50" y2="18"/><line x1="62" y1="40" x2="62" y2="24"/><line x1="38" y1="40" x2="62" y2="40"/></g><polygon points="50,52 60,68 40,68" fill="none" stroke="${i}" stroke-width="1.4"/><polygon points="50,74 40,58 60,58" fill="none" stroke="${i}" stroke-width="1.4"/>`,
   posthuman_ai_sophianic:(k,a,i)=>{const nodes=[[30,28],[70,26],[22,56],[50,50],[78,60],[44,80],[64,82]];const edges=[[3,0],[3,1],[3,2],[3,4],[3,5],[3,6],[0,1],[2,5],[4,6]];const el=edges.map(e=>`<line x1="${nodes[e[0]][0]}" y1="${nodes[e[0]][1]}" x2="${nodes[e[1]][0]}" y2="${nodes[e[1]][1]}"/>`).join('');const nl=nodes.map((p,idx)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${idx===3?5:3}" fill="${idx===3?a:k}"/>`).join('');return `<g stroke="${a}" stroke-width="0.8" opacity=".6">${el}</g>${nl}<circle cx="50" cy="50" r="9" fill="none" stroke="${i}" stroke-width="0.7" opacity=".6"/>`;},
   technomagical:(k,a,i)=>`<polygon points="${P(pol(50,50,6,30))}" fill="none" stroke="${k}" stroke-width="1.6"/><g stroke="${a}" stroke-width="1.4" fill="${a}"><line x1="50" y1="50" x2="50" y2="22"/><circle cx="50" cy="22" r="3"/><line x1="50" y1="50" x2="74" y2="63"/><circle cx="74" cy="63" r="3"/><line x1="50" y1="50" x2="26" y2="63"/><circle cx="26" cy="63" r="3"/></g><rect x="44" y="44" width="12" height="12" fill="${i}"/>`,
   advaita_siddha:(k,a,i)=>{let rays='';for(let d=0;d<24;d++){const ang=d*15*Math.PI/180;rays+=`<line x1="${(50+8*Math.cos(ang)).toFixed(1)}" y1="${(50+8*Math.sin(ang)).toFixed(1)}" x2="${(50+34*Math.cos(ang)).toFixed(1)}" y2="${(50+34*Math.sin(ang)).toFixed(1)}"/>`;}return `<g stroke="${a}" stroke-width="0.7" opacity=".5">${rays}</g><g fill="none" stroke="${k}" stroke-width="0.8"><circle cx="50" cy="50" r="30" opacity=".3"/><circle cx="50" cy="50" r="20" opacity=".5"/><circle cx="50" cy="50" r="10" opacity=".8"/></g><circle cx="50" cy="50" r="4" fill="${a}"/>`;},
   julian_byzantine:(k,a,i)=>`<circle cx="50" cy="34" r="14" fill="none" stroke="${a}" stroke-width="1.4"/><g stroke="${k}" stroke-width="2.5" stroke-linecap="round"><line x1="50" y1="22" x2="50" y2="82"/><line x1="40" y1="34" x2="60" y2="34"/><line x1="34" y1="46" x2="66" y2="46"/><line x1="40" y1="68" x2="60" y2="60"/></g>`,
   antique_greco_roman:(k,a,i)=>`<g fill="none" stroke="${k}" stroke-width="2.2" stroke-linecap="round"><path d="M34,30 Q26,52 38,70"/><path d="M66,30 Q74,52 62,70"/><line x1="34" y1="30" x2="66" y2="30"/></g><g stroke="${a}" stroke-width="1"><line x1="42" y1="34" x2="42" y2="66"/><line x1="48" y1="34" x2="48" y2="68"/><line x1="52" y1="34" x2="52" y2="68"/><line x1="58" y1="34" x2="58" y2="66"/></g><path d="M30,80 h6 v-6 h6 v6 h6" fill="none" stroke="${i}" stroke-width="1.4"/>`
  };

  /* Паспорта. acc/acc2 = r,g,b (металл/акцент); bg = тёмная основа; tintA/tintB = оттенок; ink = текст */
  var PASS={
   slavic:{ru:'Славянская',acc:'200,130,31',acc2:'240,184,90',bg:'30,18,8',tintA:'150,90,35',tintB:'70,40,18',ink:'#ecd9b0',em:'slavic',emc:['#e0b45a','#a63a26','#ecd9b0']},
   egyptian:{ru:'Египетская',acc:'224,178,58',acc2:'245,212,120',bg:'8,22,40',tintA:'26,75,140',tintB:'8,30,60',ink:'#eadfc0',em:'egyptian',emc:['#e0b23a','#2bb3a3','#eadfc0']},
   daoist:{ru:'Даосская',acc:'47,154,114',acc2:'120,210,170',bg:'8,24,18',tintA:'20,70,52',tintB:'6,22,16',ink:'#eef2ec',em:'daoist',emc:['#6ec8a0','#c23b22','#eef2ec']},
   vedic:{ru:'Ведическая',acc:'212,167,44',acc2:'245,214,140',bg:'26,11,4',tintA:'120,55,15',tintB:'40,18,6',ink:'#f7e6b0',em:'vedic',emc:['#d6a72c','#e0b45a','#f7e6b0']}
  };
  function hx(h){h=h.replace('#','');return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);}
  function lt(h,d){h=h.replace('#','');var f=function(s){return Math.min(255,parseInt(h.slice(s,s+2),16)+d);};return f(0)+','+f(2)+','+f(4);}
  /* Палитры остальных матриц из culture-skins v2: [slug, имя, фон, кольцо(k), акцент(a), текст(i)] */
  var PAL=[
   ['tarot_arcanic','Арканы Таро','#160f33','#e3b23c','#f0d98a','#fdf6e3'],
   ['kabbalistic','Каббала','#0a1f47','#bcd6ec','#7fb8d8','#efe6c8'],
   ['hermetic_alchemical','Герметико-алхимическая','#120b0a','#1f9a6a','#c0392b','#e6c66a'],
   ['gnostic','Гностическая','#0a0a10','#c9b87a','#e8e0b8','#cfcad8'],
   ['chinese_iching','И-Цзин','#14140f','#b08d4c','#c0392b','#ece6d2'],
   ['mayan','Майянская','#06231a','#1f9a6b','#2fbfae','#e7c873'],
   ['aztec_mexica','Ацтекская','#0a2226','#1f9aa8','#d6a72c','#e6d2a0'],
   ['celtic','Кельтская','#0c2418','#c89a3a','#2f8a5a','#e6dcc0'],
   ['norse','Скандинавская','#10202c','#9cc0d8','#c8a23a','#e6eef2'],
   ['shamanic','Шаманская','#221408','#c8782a','#2a9a9a','#ecdcc0'],
   ['buddhist_mahayana','Буддийская Махаяна','#2a0e10','#e0a02a','#e0738c','#f2e2c0'],
   ['islamic_sufi_nur','Суфийский Нур','#063a2a','#2a9ab0','#d4af37','#eadfb8'],
   ['christian_mystical_grail','Розенкрейц и Грааль','#1a0e1f','#c8a23a','#8a1f3a','#ece2d0'],
   ['atlantean_lemurian','Атланто-Лемурийская','#06283a','#2ab0c0','#c8843a','#dff0f2'],
   ['shambhala','Шамбала','#101a3a','#d4a72c','#2a9ab0','#f0f4f8'],
   ['gene_keys','Генные Ключи','#1a1030','#e0a83a','#6b3fa0','#ece2f0'],
   ['astrological','Астрологическая','#0a1238','#d8b23a','#aab4d8','#eef2fa'],
   ['cosmic_galactic','Космо-Галактическая','#0a0a2a','#2ab0d0','#c03a8a','#eaf0fa'],
   ['shinto','Синто','#2a0e0a','#d83a2a','#d8a83a','#f2ece0'],
   ['sumerian_babylonian','Шумеро-Вавилонская','#0a1a3a','#d4a72c','#c8a06a','#e6d8b8'],
   ['zoroastrian','Зороастрийская','#2a1206','#e0681e','#d4a72c','#f0dcc0'],
   ['afro_dogon','Афро-Догонская','#1a1430','#c8782a','#e6e0c0','#dfe0ee'],
   ['yoruba_ifa_orisha','Йоруба Ифа','#0a1a3a','#2a9a6a','#d6a72c','#ece6d2'],
   ['tantric_kashmiri','Тантра Кашмира','#240a12','#d4a72c','#b3261e','#f0d8c0'],
   ['posthuman_ai_sophianic','Постчеловек-София','#06141a','#2ad0e0','#8a3ad0','#e6f6fa'],
   ['technomagical','Техномагическая','#06201c','#2ad06a','#2a9ad0','#e0f6ea'],
   ['advaita_siddha','Адвайта-Сиддха','#0a0a0a','#e8d49a','#f5e8c0','#fff8e8'],
   ['julian_byzantine','Юлианско-Византийская','#1a0c2a','#c8a23a','#7a2a8a','#ece0c0'],
   ['antique_greco_roman','Античная Орфическая','#0c2238','#c8a23a','#2f8ac0','#f0ece0']
  ];
  PAL.forEach(function(m){ if(PASS[m[0]]) return; PASS[m[0]]={ru:m[1],acc:hx(m[3]),acc2:lt(m[3],55),bg:hx(m[2]),tintA:hx(m[4]),tintB:hx(m[2]),ink:m[5],em:m[0],emc:[m[3],m[4],m[5]]}; });

  var FW=[0,11,13,15,18,21,25], GLOW=[0,5,11,19,29,41,55], GA=[0,.55,.7,.84,.94,.99,1], AURA=[0,.12,.24,.42,.66,.85,1];

  function tile(acc,n){
    var ga=GA[n], S='rgba('+acc+','+ga+')', S2='rgba('+acc+','+(ga*0.55).toFixed(2)+')';
    var p=SVGNS+'width="200" height="200" viewBox="0 0 200 200" fill="none" stroke-linejoin="round" stroke-linecap="round">';
    p+='<rect x="6" y="6" width="188" height="188" rx="12" stroke="'+S+'" stroke-width="2"/>';
    if(n>=3) p+='<rect x="13" y="13" width="174" height="174" rx="10" stroke="'+S2+'" stroke-width="1.5"/>';
    if(n>=5) p+='<rect x="19" y="19" width="162" height="162" rx="8" stroke="'+S2+'" stroke-width="1"/>';
    var c='<path d="M6 44 V22 q0 -16 16 -16 h22" stroke="'+S+'" stroke-width="2"/>';
    if(n>=4) c+='<circle cx="14" cy="14" r="3.4" fill="'+S+'"/>';
    if(n>=6) c+='<circle cx="14" cy="14" r="7" stroke="'+S2+'" stroke-width="1.4"/>';
    p+='<g>'+c+'</g><g transform="translate(200,0) scale(-1,1)">'+c+'</g><g transform="translate(200,200) scale(-1,-1)">'+c+'</g><g transform="translate(0,200) scale(1,-1)">'+c+'</g>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function innerPat(emKey,acc,n){
    var a=(n>=6?.20:n===5?.16:n===4?.12:n===3?.09:n===2?.06:.04);
    var col='rgba('+acc+','+a+')';
    var p=SVGNS+'viewBox="0 0 100 100" fill="none">'+EM[emKey](col,col,col)+'</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function ring(acc,n){
    var ga=GA[n], g1='rgba('+acc+','+ga+')', sw=1+n*0.5;
    var p=SVGNS+'viewBox="0 0 200 200" fill="none" stroke-linecap="round">';
    p+='<circle cx="100" cy="100" r="94" stroke="'+g1+'" stroke-width="'+sw.toFixed(2)+'"/>';
    if(n>=2) p+='<circle cx="100" cy="100" r="85" stroke="'+g1+'" stroke-width="'+(sw*0.55).toFixed(2)+'" stroke-opacity="0.7"/>';
    if(n>=3){ var b=12+(n-3)*8,br=(1.2+n*0.3).toFixed(1),d='';for(var k=0;k<b;k++){var aa=k/b*TAU;d+='<circle cx="'+(100+90*Math.cos(aa)).toFixed(1)+'" cy="'+(100+90*Math.sin(aa)).toFixed(1)+'" r="'+br+'" fill="'+g1+'"/>';}p+=d; }
    if(n>=5) p+='<circle cx="100" cy="100" r="99" stroke="'+g1+'" stroke-width="'+(n>=6?'2.4':'1.3')+'"'+(n>=6?'':' stroke-dasharray="2 5"')+'/>';
    p+='</svg>';
    return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(p)+'")';
  }

  function medallion(emKey,emc,acc,n){
    var ga=GA[n], S='rgba('+acc+','+ga+')', S2='rgba('+acc+','+(ga*0.5).toFixed(2)+')';
    var p=SVGNS+'viewBox="0 0 72 72" fill="none" stroke-linejoin="round">';
    if(n>=5){ var ray='';for(var k=0;k<24;k++){ray+='<g transform="rotate('+(k*15)+' 36 36)"><line x1="36" y1="2" x2="36" y2="8" stroke="'+S+'" stroke-width="1"/></g>';}p+=ray; p+='<circle cx="36" cy="36" r="33" stroke="'+S2+'" stroke-width=".8"/>'; }
    p+='<circle cx="36" cy="36" r="27" fill="rgba(10,8,5,.92)" stroke="'+S+'" stroke-width="1.4"/>';
    p+='<g transform="translate(8,8) scale(0.56)">'+EM[emKey](emc[0],emc[1],emc[2])+'</g>';
    p+='</svg>';
    return p;
  }

  var CURM=null, CURL=0, observer=null, pending=false, _t=null, vedikaParked=false;

  function cur(){ try{ if(window.LensLevels&&LensLevels.current){ var c=LensLevels.current(); if(c&&c.slug) return {slug:c.slug, lv:Math.max(1,Math.min(6,c.lv||1))}; } }catch(e){} return null; }
  function curMatrix(){ var c=cur(); return c?c.slug:null; }
  function curLevel(){ var c=cur(); return c?c.lv:1; }

  function cultureOff(){ document.documentElement.classList.remove('aw-cult','aw-cmotion'); }
  /* ГАСИМ ведику ТОЛЬКО на пилотных: setLevel стопит её авто-полл, off() убирает класс */
  function vyantra(hide){ var id='aw-cult-hidev', s=document.getElementById(id); if(hide){ if(!s){ s=document.createElement('style'); s.id=id; s.textContent='#aw-vyantra,.aw-vf,.aw-vc{display:none!important}'; (document.head||document.documentElement).appendChild(s); } } else if(s&&s.parentNode){ s.parentNode.removeChild(s); } }
  function parkVedika(n){ vedikaParked=true; var V=window.AwaraVedikaSkin; if(V){ try{ if(V.setLevel) V.setLevel(n); if(V.off) V.off(); }catch(e){} } vyantra(true); }
  /* вернуть ведику как было — ТОЛЬКО если мы её гасили */
  function restoreVedika(){ vyantra(false); if(!vedikaParked) return; vedikaParked=false; var V=window.AwaraVedikaSkin; if(V&&V.auto){ try{ V.auto(); }catch(e){} } }

  function decorate(slug){
    var Pp=PASS[slug]; if(!Pp) return;
    var cards=document.querySelectorAll('.phone .card');
    for(var i=0;i<cards.length;i++){ var card=cards[i];
      if(!card.querySelector(':scope > .aw-cf')){ var f=document.createElement('div'); f.className='aw-cf'; card.insertBefore(f, card.firstChild); }
      var cr=card.querySelector(':scope > .aw-cc');
      if(!cr){ cr=document.createElement('span'); cr.className='aw-cc'; card.insertBefore(cr, card.firstChild); }
      cr.innerHTML=medallion(Pp.em, Pp.emc, Pp.acc, CURL);
    }
  }
  function reobserve(){ var ph=document.querySelector('.phone'); if(observer&&ph) observer.observe(ph,{childList:true,subtree:true}); }

  function apply(){
    var c=cur(); var slug=c?c.slug:null; var n=c?c.lv:1;
    var h=document.documentElement;
    CURM=slug; CURL=n;
    var Pp=PASS[slug];
    /* не пилотная (вкл. ведическая) -> не трогаем ведику, оставляем как было */
    if(!Pp){ cultureOff(); restoreVedika(); return; }
    /* пилотная матрица -> культурный скин, ведика гаснет */
    parkVedika(n);
    h.classList.add('aw-cult'); h.classList.toggle('aw-cmotion', n>=5);
    h.style.setProperty('--cacc', Pp.acc);
    h.style.setProperty('--cacc2', Pp.acc2);
    h.style.setProperty('--cbg', Pp.bg);
    h.style.setProperty('--cink', Pp.ink);
    h.style.setProperty('--cfw', FW[n]+'px');
    h.style.setProperty('--cglow', GLOW[n]+'px');
    h.style.setProperty('--cline', 'rgba('+Pp.acc+','+(0.16+0.06*n).toFixed(2)+')');
    h.style.setProperty('--ctint', 'linear-gradient(160deg,rgba('+Pp.tintA+','+(0.10+0.03*n).toFixed(3)+') 0%,rgba('+Pp.tintB+','+(0.16+0.04*n).toFixed(3)+') 100%)');
    h.style.setProperty('--cframe', tile(Pp.acc, n));
    h.style.setProperty('--cpat', innerPat(Pp.em, Pp.acc, n));
    h.style.setProperty('--cring', ring(Pp.acc, n));
    h.style.setProperty('--caura', '0 0 '+GLOW[n]+'px rgba('+Pp.acc+','+(0.14+0.05*n).toFixed(2)+'),inset 0 0 '+(16+5*n)+'px rgba('+Pp.acc2+','+(AURA[n]*0.12).toFixed(3)+')');
    if(observer) observer.disconnect();
    decorate(slug); reobserve();
  }

  function sync(){ var c=cur(); var slug=c?c.slug:null; var n=c?c.lv:1; if(slug!==CURM||n!==CURL) apply(); }
  function schedule(){ if(_t) return; _t=setTimeout(function(){ _t=null; sync(); }, 90); }

  var CSS=[
   'html.aw-cult .phone .card,html.aw-cult .phone .mcard,html.aw-cult .phone .libcard,html.aw-cult .phone .awara-glass-card,html.aw-cult .phone #dchat,html.aw-cult .phone .lp-card{position:relative;background-image:var(--cpat,none),var(--ctint,none)!important;background-repeat:no-repeat,no-repeat!important;background-position:center,center!important;background-size:auto 84%,cover!important;background-color:rgba(var(--cbg),.46)!important;backdrop-filter:blur(13px) saturate(112%) brightness(.66)!important;-webkit-backdrop-filter:blur(13px) saturate(112%) brightness(.66)!important;border:1px solid var(--cline)!important;box-shadow:var(--caura,none)!important;transition:box-shadow .8s,background .8s,border-color .8s}',
   'html.aw-cult .phone .intent,html.aw-cult .phone .gen,html.aw-cult .phone .pl,html.aw-cult .phone .streak .s,html.aw-cult .phone .wd,html.aw-cult .phone .arc .st{background-image:var(--ctint,none)!important;background-size:cover!important;background-color:rgba(var(--cbg),.2)!important;border:1px solid var(--cline)!important;box-shadow:0 0 calc(var(--cglow,0) * .4) rgba(var(--cacc),.22)!important;transition:background .8s,border-color .8s}',
   'html.aw-cult .phone .input,html.aw-cult .phone textarea,html.aw-cult .phone .search,html.aw-cult .phone .aifield{background-image:var(--ctint,none)!important;background-size:cover!important;background-color:rgba(var(--cbg),.34)!important;border:1px solid var(--cline)!important;color:var(--cink)!important;transition:background .8s,border-color .8s}',
   'html.aw-cult .phone .btn,html.aw-cult .phone .awara-gold-button{background:linear-gradient(120deg,rgba(var(--cacc),.96),rgba(var(--cacc2),.96))!important;color:#16100a!important;border:1px solid var(--cline)!important;box-shadow:0 6px 22px rgba(var(--cacc),.4),0 0 calc(var(--cglow,0) * .5) rgba(var(--cacc),.4)!important}',
   'html.aw-cult .phone .btn.ghost{background:var(--ctint,none)!important;color:var(--cink)!important;border:1px solid var(--cline)!important}',
   'html.aw-cult #lensPlaces .lp-card{position:relative;background-image:var(--ctint,none)!important;background-size:cover!important;background-color:rgba(var(--cbg),.36)!important;border:1px solid var(--cline)!important;border-left:3px solid var(--cline)!important;box-shadow:0 0 calc(var(--cglow,0)*.5) rgba(var(--cacc),.25)!important;transition:background .8s,border-color .8s}',
   'html.aw-cult #lensPlaces .lp-t,html.aw-cult #lensPlaces .lp-nm{color:var(--cink)!important}',
   'html.aw-cult #tigelWheel .tw-reel{background-image:radial-gradient(circle at 50% 0%,rgba(var(--cacc),.16),rgba(var(--cbg),.6))!important;background-size:cover!important;border:1px solid var(--cline)!important}',
   'html.aw-cult #tigelWheel .tw-cell{background:rgba(var(--cacc),.07)!important;border:1px solid var(--cline)!important}',
   'html.aw-cult #tigelWheel .tw-frame{border-color:rgba(var(--cacc),.95)!important;box-shadow:0 0 calc(var(--cglow,0)*.6) rgba(var(--cacc),.5)!important}',
   'html.aw-cult #tigelWheel .tw-ptr{border-top-color:rgba(var(--cacc),.95)!important}',
   'html.aw-cult #tigelWheel .tw-bar i{background:linear-gradient(90deg,rgba(var(--cacc),.9),rgba(var(--cacc2),.95))!important}',
   'html.aw-cult #s-daimon .dm-orb{position:relative}',
   'html.aw-cult #s-daimon .dm-orb::after{content:"";position:absolute;inset:0;background-image:var(--cring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:6;filter:drop-shadow(0 0 calc(var(--cglow,0)*.55) rgba(var(--cacc),.65));transition:filter .8s}',
   'html.aw-cult #awaraHeartOrb{position:relative}',
   'html.aw-cult #awaraHeartOrb::after{content:"";position:absolute;inset:0;background-image:var(--cring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:8;filter:drop-shadow(0 0 calc(var(--cglow,0)*.6) rgba(var(--cacc),.7));transition:filter .8s}',
   'html.aw-cult #s-tigel #orb{position:relative;overflow:visible}',
   'html.aw-cult #s-tigel #orb::after{content:"";position:absolute;inset:-6px;background-image:var(--cring,none);background-repeat:no-repeat;background-position:center;background-size:100% 100%;pointer-events:none;z-index:8;filter:drop-shadow(0 0 calc(var(--cglow,0)*.6) rgba(var(--cacc),.7));transition:filter .8s}',
   'html.aw-cult #tcModal{background:rgba(var(--cbg),.8)!important}',
   'html.aw-cult #tcModal .tcSheet{background:linear-gradient(180deg,rgba(var(--cbg),.98),rgba(var(--cbg),1))!important;border:1px solid var(--cline)!important;box-shadow:0 -10px 60px rgba(var(--cacc),.28),var(--caura,none)!important}',
   'html.aw-cult #tcModal textarea{background:rgba(var(--cbg),.6)!important;border:1px solid var(--cline)!important;color:var(--cink)!important}',
   'html.aw-cult #tcModal .tcChip{border-color:var(--cline)!important;background:rgba(var(--cacc),.12)!important;color:var(--cink)!important}',
   'html.aw-cult #tcModal .tcCard{box-shadow:0 0 24px rgba(var(--cacc),.4),inset 0 0 40px rgba(var(--cbg),.6)!important}',
   'html.aw-cult #tcFab{background:rgba(var(--cbg),.95)!important;box-shadow:0 0 18px rgba(var(--cacc),.4)!important}',
   'html.aw-cult .aw-cf{position:absolute;inset:0;pointer-events:none;border-style:solid;border-width:var(--cfw,12px);border-image-source:var(--cframe,none);border-image-slice:30%;border-image-width:var(--cfw,12px);border-image-repeat:round;border-radius:18px;filter:drop-shadow(0 0 var(--cglow,0) rgba(var(--cacc),.4));z-index:4}',
   'html.aw-cult .aw-cc{position:absolute;top:-24px;left:50%;width:50px;height:50px;transform:translateX(-50%);z-index:6;pointer-events:none;filter:drop-shadow(0 0 var(--cglow,0) rgba(var(--cacc),.85))}',
   'html.aw-cult .aw-cc svg{width:100%;height:100%;display:block}'
  ].join('\n');

  function injectStyle(){ if(document.getElementById('aw-culture-style')) return; var s=document.createElement('style'); s.id='aw-culture-style'; s.textContent=CSS; document.head.appendChild(s); }

  function boot(){
    injectStyle();
    observer=new MutationObserver(function(){ if(pending) return; pending=true; requestAnimationFrame(function(){ pending=false; if(observer) observer.disconnect(); if(PASS[CURM]) decorate(CURM); reobserve(); }); });
    apply();
    /* на пилотной матрице держим ведику погашенной, если она снова включилась */
    setInterval(function(){ sync(); if(PASS[CURM] && document.documentElement.classList.contains('aw-vedika')) parkVedika(CURL); }, 600);
    document.addEventListener('change', schedule, true);
    document.addEventListener('click', schedule, true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.AwaraCultureSkin={
    refresh:apply,
    setMatrix:function(s){ try{ if(window.LensLevels&&LensLevels.preview) LensLevels.preview(s,curLevel()); }catch(e){} schedule(); },
    setLevel:function(n){ try{ if(window.LensLevels&&LensLevels.preview) LensLevels.preview(curMatrix(),n); }catch(e){} schedule(); },
    live:function(){ try{ if(window.LensLevels&&LensLevels.clearPreview) LensLevels.clearPreview(); }catch(e){} schedule(); },
    off:function(){ cultureOff(); restoreVedika(); },
    PASS:PASS
  };
})();
