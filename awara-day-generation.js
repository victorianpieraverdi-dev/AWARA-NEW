/* ============================================================
   AWARA · DAY GENERATION v3
   Красивая кнопка на экране Исток → открывает карточку генерации дня
   (инфо + совет на завтра). Арт и трек — отдельно.
   Загружать ПОСЛЕ: awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraDayGen && window.__awaraDayGen >= 3) return;
window.__awaraDayGen = 3;

function S(){ try{return STATE;}catch(e){return null;} }
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

var AXES=['discipline','compassion','clarity','will','devotion','transformation','unity'];
var AXIS_NAME={discipline:'Дисциплина',compassion:'Сострадание',clarity:'Ясность',
  will:'Воля',devotion:'Преданность',transformation:'Трансформация',unity:'Единство'};
var AXIS_ICON={discipline:'🗡',compassion:'💧',clarity:'👁',will:'🔥',
  devotion:'🙏',transformation:'♻️',unity:'🌀'};
var ELEM={earth:{icon:'🜃',name:'Земля',color:'#8B7355'},water:{icon:'🜄',name:'Вода',color:'#4A90D9'},
  fire:{icon:'🜂',name:'Огонь',color:'#E07020'},air:{icon:'🜁',name:'Воздух',color:'#7ECFC0'},
  ether:{icon:'✦',name:'Эфир',color:'#B090E0'}};
var GUNA={tamas:{name:'Тамас',color:'#666',icon:'●',desc:'инерция, покой'},
  rajas:{name:'Раджас',color:'#D4A946',icon:'◐',desc:'действие, движение'},
  sattva:{name:'Саттва',color:'#A0E0A0',icon:'○',desc:'ясность, свет'}};
var RING_NAME={'-3':'Даймон (тень)','-2':'Даймон (пробуждение)','-1':'Даймон (становление)',
  '0':'Порог','1':'Душа I','2':'Душа II','3':'Душа III',
  '4':'Джива I','5':'Джива II','6':'Джива III',
  '7':'Дух I','8':'Дух II','9':'Дух III'};

var RING_ADVICE = {
  '-3':['Записывай каждый опыт. Свет рождается из внимания.','Не торопись. Даймон видит искренность.','Пробуй разные типы заданий.'],
  '-2':['Какая ось растёт быстрее? Замечай паттерны.','Практика — разговор с собой.','Текстовые ответы дают больше света.'],
  '-1':['Порог близко. Качество важнее количества.','L3-L4 квесты дают ощутимо больше.','Сопротивление — тень. Работай с ней.'],
  '0':['Каждый квест формирует направление.','Доминирующая стихия — твой компас.','Экспериментируй с линзами.'],
  '1':['Душа пробуждается. Связи между заданиями и жизнью.','Качество ответов весит больше.','Ритуальные задания открывают каналы.'],
  '2':['Линза кристаллизуется. Углубляй L4-L5.','Работа с тенью даёт бонус.','Творчество умножает свет.'],
  '3':['Три кольца Души. Впереди — трансформация.','Баланс осей: какая отстаёт?','L5-L6 раскрывают скрытые слои.'],
  '4':['Джива: квест = алхимическая реакция.','Паттерны между линзами не случайны.','Один глубокий L6 = десять поверхностных.'],
  '5':['Середина Дживы. Начинай видеть целое.','Творческие квесты = мета-навыки.','Совместный опыт множит свет.'],
  '6':['Грань Духа. Качество сознания важнее всего.','Саттвические квесты — золото.','Перечитай свои старые ответы.'],
  '7':['Дух I. Квест — зеркало.','Линзы скрещиваются.','Медитация — твой инструмент.'],
  '8':['Дух II. Свет течёт сам. Наблюдай.','Каждый квест — схождение осей.','Создай артефакт.'],
  '9':['Дух III. Путь циклический.','Не «что делать», а «кем быть».','Ты уже не играешь — ты играем.']
};

var SHADOW_ADVICE = {
  inertia:'Тень инерции: задания на действие (do) разбивают застой.',
  attachment:'Тень привязанности: задания на наблюдение помогут.',
  manipulation:'Тень манипуляции: честность важнее результата.',
  envy:'Тень зависти: квесты на преданность исцеляют.',
  deception:'Тень обмана: будь честен с собой.',
  illusion:'Тень иллюзии: квесты на дисциплину проясняют.',
  separation:'Тень разделённости: квесты на единство — прямой путь.'
};

/* ── STYLES ── */
function ensureStyles(){
  if(document.getElementById('dg-style')) return;
  var st=document.createElement('style'); st.id='dg-style';
  st.textContent='\
.dg-trigger{display:flex;align-items:center;gap:10px;width:100%;margin-top:10px;\
  padding:14px 18px;border:1px solid rgba(255,210,122,.2);border-radius:14px;\
  background:linear-gradient(120deg,rgba(255,210,122,.06),rgba(201,168,76,.03));\
  cursor:pointer;transition:.25s;font-family:Cinzel,serif;font-size:15px;\
  color:var(--text,#ece9f5);letter-spacing:.04em;box-sizing:border-box}\
.dg-trigger:hover{border-color:rgba(255,210,122,.45);\
  box-shadow:0 4px 20px -6px rgba(255,210,122,.2);transform:translateY(-1px)}\
.dg-trigger:active{transform:scale(.98)}\
.dg-trigger .dg-trig-orb{width:38px;height:38px;border-radius:50%;\
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;\
  animation:dgPulse 4s ease-in-out infinite}\
@keyframes dgPulse{0%,100%{box-shadow:0 0 12px rgba(255,210,122,.1)}50%{box-shadow:0 0 24px rgba(255,210,122,.2)}}\
.dg-trigger .dg-trig-text{flex:1}\
.dg-trigger .dg-trig-sub{font-family:"JetBrains Mono",monospace;font-size:10px;\
  color:var(--muted,#8e88a4);letter-spacing:.03em;margin-top:2px}\
\
.dg-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,4,14,.92);z-index:9000;\
  display:flex;align-items:center;justify-content:center;padding:16px;animation:dgFadeIn .4s ease}\
@keyframes dgFadeIn{from{opacity:0}to{opacity:1}}\
.dg-card{max-width:480px;width:100%;max-height:90vh;overflow-y:auto;background:linear-gradient(160deg,#0c0b16,#111023,#0c0b16);\
  border:1px solid rgba(201,168,76,.25);border-radius:20px;padding:24px 20px;\
  box-shadow:0 20px 60px rgba(0,0,0,.6);animation:dgSlideUp .5s ease;position:relative}\
@keyframes dgSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}\
.dg-close{position:absolute;top:12px;right:14px;background:none;border:none;\
  color:var(--muted,#8e88a4);font-size:20px;cursor:pointer}\
.dg-title{font-family:Cinzel,serif;font-size:20px;color:#ffd27a;text-align:center;margin-bottom:4px}\
.dg-sub{text-align:center;color:var(--muted);font-size:13px;margin-bottom:16px}\
\
.dg-section{margin-bottom:14px;padding:12px 14px;border:1px solid rgba(255,255,255,.04);\
  border-radius:14px;background:rgba(255,255,255,.015)}\
.dg-stitle{font-family:Cinzel,serif;font-size:13px;color:var(--gold,#c9a84c);letter-spacing:.05em;margin-bottom:8px}\
.dg-energy{display:flex;align-items:center;gap:12px;margin-bottom:8px}\
.dg-orb{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;\
  justify-content:center;font-size:26px;flex-shrink:0}\
.dg-portrait{font-size:13px;color:var(--text,#ece9f5);line-height:1.5;font-style:italic}\
\
.dg-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}\
.dg-tag{font-family:"JetBrains Mono",monospace;font-size:10px;padding:3px 8px;\
  border-radius:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}\
\
.dg-ax{display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:11px;color:var(--muted)}\
.dg-ax-name{min-width:90px}\
.dg-ax-bar{flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}\
.dg-ax-fill{height:100%;border-radius:3px;transition:width .6s ease}\
.dg-ax-val{min-width:32px;text-align:right;font-family:"JetBrains Mono",monospace;font-size:10px;color:#ffd27a}\
\
.dg-gbar{display:flex;height:7px;border-radius:4px;overflow:hidden;gap:1px;margin-bottom:4px}\
.dg-glabels{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:8px}\
\
.dg-advice{font-size:13px;color:var(--text,#ece9f5);line-height:1.5;font-style:italic;padding:10px 14px;\
  border-left:2px solid rgba(201,168,76,.3);background:rgba(201,168,76,.02);border-radius:0 8px 8px 0;margin-bottom:8px}\
.dg-shadow{font-size:12px;color:#4ade80;padding:8px 12px;border-radius:10px;background:rgba(74,222,128,.04)}\
\
.dg-tomorrow{border-color:rgba(123,98,201,.2);background:rgba(123,98,201,.03)}\
.dg-qprev{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.04);\
  border-radius:10px;margin-bottom:5px;font-size:13px;color:var(--text)}\
.dg-qlv{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--gold);border:1px solid rgba(201,168,76,.2);border-radius:6px;padding:2px 6px}\
.dg-qtype{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}\
\
.dg-accept{display:block;width:100%;margin-top:14px;padding:13px;border:1px solid rgba(201,168,76,.3);\
  border-radius:12px;background:linear-gradient(120deg,rgba(201,168,76,.12),rgba(123,98,201,.08));\
  color:var(--text);font-family:Cinzel,serif;font-size:15px;cursor:pointer;text-align:center;transition:.25s}\
.dg-accept:hover{border-color:var(--gold);box-shadow:0 4px 20px -6px rgba(201,168,76,.3)}';
  document.head.appendChild(st);
}

/* ── Collect ── */
function collectDayData(){
  var s=S(); if(!s) return null;
  var daily=s.daily||{},progress=s.progress||{},axes=s.axes||{},elements=s.elements||{},shadows=s.shadows||{},mera=s.mera||{};
  var domEl='earth',maxEl=0; for(var e in elements) if(elements[e]>maxEl){maxEl=elements[e];domEl=e;}
  var domAx='clarity',maxAx=0; for(var a in axes) if(axes[a]>maxAx){maxAx=axes[a];domAx=a;}
  var weakAx='unity',minAx=Infinity; for(var a2 in axes) if(axes[a2]<minAx){minAx=axes[a2];weakAx=a2;}
  var activeShadow=null,maxSh=0; for(var sh in shadows) if(shadows[sh]>maxSh){maxSh=shadows[sh];activeShadow=sh;}
  if(maxSh<0.05) activeShadow=null;
  return {quests_today:daily.quest_count||0,quality_avg:daily.quality_avg||0,fullness_avg:daily.fullness_avg||0,
    dominant_guna:daily.dominant_guna||'rajas',gunas:daily._gunas||{tamas:0,rajas:0,sattva:0},
    dominant_element:domEl,dominant_axis:domAx,weakest_axis:weakAx,active_shadow:activeShadow,
    ring:progress.current_ring||-3,total_light:progress.total_light||0,days_played:progress.days_played||0,
    axes:axes,mera_quality:mera.quality||0};
}

function energyPortrait(d){
  if(!d) return '';
  var ed=ELEM[d.dominant_element]||{name:'?',icon:'?'};
  var gd=GUNA[d.dominant_guna]||{name:'?',desc:''};
  if(d.quests_today===0) return 'Тишина. Даймон ждёт. Одно задание зажжёт свет.';
  if(d.quality_avg>0.7) return 'Глубокий день. Качество '+Math.round(d.quality_avg*100)+'%. '+ed.icon+' '+ed.name+' сияет.';
  return d.quests_today+' квестов. '+ed.icon+' '+ed.name+', '+gd.icon+' '+gd.name+'. '+gd.desc+'.';
}

function getRingAdvice(ring){
  var r=String(Math.max(-3,Math.min(9,ring||-3)));
  var pool=RING_ADVICE[r]||RING_ADVICE['-3'];
  return pool[new Date().getDay()%pool.length];
}

/* ── Button on Исток ── */
function addButton(){
  ensureStyles();
  if(document.getElementById('dayGenBtn')) return;
  
  var container=document.querySelector('.topRightBtns');
  if(!container) return;
  
  /* Create ☀ button — same trBtn class as other buttons */
  var btn=document.createElement('button');
  btn.id='dayGenBtn';
  btn.innerHTML='☀';
  btn.title='Генерация Дня';
  btn.className='trBtn';
  btn.style.cssText='font-size:16px;cursor:pointer;text-align:center;'+
    'padding:8px 10px;border-radius:12px;border:1px solid var(--line,rgba(201,168,76,.12));'+
    'background:rgba(8,7,18,.7);backdrop-filter:blur(8px);color:#ffd27a;'+
    'transition:all .3s ease;-webkit-tap-highlight-color:transparent';
  btn.onclick=function(){ showCard(); };
  container.appendChild(btn);
  
  /* After both buttons exist, wrap them in a horizontal row */
  function makeRow(){
    var compass=document.getElementById('profReopenBtn');
    if(!compass) return false;
    if(document.getElementById('trBtnRow')) return true;
    var row=document.createElement('div');
    row.id='trBtnRow';
    row.style.cssText='display:flex;flex-direction:row;gap:6px;align-self:flex-end';
    container.appendChild(row);
    row.appendChild(compass);
    row.appendChild(btn);
    /* 3rd button: Art+Track */
    var art=document.createElement('button');
    art.id='artTrackBtn';
    art.innerHTML='\u266b';
    art.title='Арт и Трек дня';
    art.className='trBtn';
    art.style.cssText='font-size:16px;cursor:pointer;text-align:center;'+
      'padding:8px 10px;border-radius:12px;border:1px solid var(--line,rgba(201,168,76,.12));'+
      'background:rgba(8,7,18,.7);backdrop-filter:blur(8px);color:#ffd27a;'+
      'transition:all .3s ease;-webkit-tap-highlight-color:transparent';
    art.onclick=function(){
      try{if(window.TigelCore)TigelCore.openModal();}catch(e){}
    };
    row.appendChild(art);
    return true;
  }
  if(!makeRow()){
    var tries=0;
    var iv=setInterval(function(){
      if(makeRow()||++tries>40) clearInterval(iv);
    },500);
  }
}

/* ── Overlay card ── */
function showCard(){
  ensureStyles();
  var old=document.getElementById('dg-overlay');
  if(old) old.remove();
  
  var data=collectDayData();
  if(!data) return;
  
  var ed=ELEM[data.dominant_element]||{name:'?',icon:'?',color:'#888'};
  var gd=GUNA[data.dominant_guna]||{name:'?',icon:'?',color:'#888'};
  var rn=RING_NAME[String(data.ring)]||'Кольцо '+data.ring;
  
  var overlay=document.createElement('div');
  overlay.className='dg-overlay';
  overlay.id='dg-overlay';
  
  var h='<div class="dg-card">';
  h+='<button class="dg-close" id="dg-close">✕</button>';
  
  /* Energy orb */
  h+='<div style="text-align:center;margin-bottom:12px"><div class="dg-orb" style="margin:0 auto;background:radial-gradient(circle,'+ed.color+'35,transparent 70%);border:1px solid '+ed.color+'40">'+ed.icon+'</div></div>';
  h+='<div class="dg-title">Генерация Дня</div>';
  h+='<div class="dg-sub">День '+(data.days_played+1)+' · '+rn+' · ☀ '+Math.round(data.total_light)+' света</div>';
  
  /* Portrait */
  h+='<div class="dg-advice">'+esc(energyPortrait(data))+'</div>';
  
  /* Tags */
  h+='<div class="dg-tags">';
  h+='<span class="dg-tag" style="color:'+ed.color+'">'+ed.icon+' '+ed.name+'</span>';
  h+='<span class="dg-tag" style="color:'+gd.color+'">'+gd.icon+' '+gd.name+'</span>';
  if(data.quests_today>0) h+='<span class="dg-tag">'+data.quests_today+' квестов</span>';
  h+='<span class="dg-tag">Качество '+Math.round(data.quality_avg*100)+'%</span>';
  h+='</div>';
  
  /* Guna bar */
  var gt=(data.gunas.tamas||0)+(data.gunas.rajas||0)+(data.gunas.sattva||0);
  if(gt>0){
    h+='<div class="dg-gbar">';
    h+='<div style="flex:'+(data.gunas.tamas/gt)+';background:#666"></div>';
    h+='<div style="flex:'+(data.gunas.rajas/gt)+';background:#D4A946"></div>';
    h+='<div style="flex:'+(data.gunas.sattva/gt)+';background:#A0E0A0"></div>';
    h+='</div>';
    h+='<div class="dg-glabels"><span>●Тамас</span><span>◐Раджас</span><span>○Саттва</span></div>';
  }
  
  /* Axes */
  h+='<div class="dg-section">';
  h+='<div class="dg-stitle">Оси развития</div>';
  var maxAV=0.01; for(var ak in data.axes) if(data.axes[ak]>maxAV) maxAV=data.axes[ak];
  var axO=['discipline','will','clarity','compassion','devotion','transformation','unity'];
  for(var ai=0;ai<axO.length;ai++){
    var ax=axO[ai],val=data.axes[ax]||0,pct=Math.min(100,(val/maxAV)*100);
    var bc=ax===data.dominant_axis?'#ffd27a':ax===data.weakest_axis?'#ff6b6b':'rgba(255,255,255,.2)';
    var mk=ax===data.dominant_axis?' ★':ax===data.weakest_axis?' ↓':'';
    h+='<div class="dg-ax"><span class="dg-ax-name">'+(AXIS_ICON[ax]||'')+' '+(AXIS_NAME[ax]||ax)+mk+'</span>';
    h+='<div class="dg-ax-bar"><div class="dg-ax-fill" style="width:'+pct+'%;background:'+bc+'"></div></div>';
    h+='<span class="dg-ax-val">'+Math.round(val*10)/10+'</span></div>';
  }
  h+='</div>';
  
  /* Shadow */
  if(data.active_shadow && SHADOW_ADVICE[data.active_shadow]){
    h+='<div class="dg-shadow">🌿 '+SHADOW_ADVICE[data.active_shadow]+'</div>';
  }
  
  /* Advice */
  h+='<div class="dg-section">';
  h+='<div class="dg-stitle">☀ Совет</div>';
  h+='<div class="dg-advice">'+esc(getRingAdvice(data.ring))+'</div>';
  h+='</div>';
  
  /* Tomorrow preview */
  h+='<div class="dg-section dg-tomorrow">';
  h+='<div class="dg-stitle">☽ Квесты на завтра</div>';
  var types=['do','observe','meditate','reflect','create','study','ritual'];
  var tLabels={do:'действие',observe:'наблюдение',meditate:'медитация',reflect:'рефлексия',create:'творчество',study:'исследование',ritual:'ритуал'};
  var day=(data.days_played||0)+1;
  var hash=day*2654435761;
  for(var ti=0;ti<3;ti++){
    hash=((hash>>>16)^hash)*0x45d9f3b;
    var tIdx=Math.abs(hash)%types.length;
    var tp=types[tIdx];
    var qlv=Math.max(1,Math.min(6,Math.abs(data.ring)+1-(ti>0?1:0)));
    h+='<div class="dg-qprev"><span class="dg-qlv">L'+qlv+'</span><span style="flex:1">—</span><span class="dg-qtype">'+esc(tLabels[tp]||tp)+'</span></div>';
  }
  h+='</div>';
  
  h+='<button class="dg-accept" id="dg-accept">✦ Принять день</button>';
  h+='</div>';
  
  overlay.innerHTML=h;
  document.body.appendChild(overlay);
  
  document.getElementById('dg-close').onclick=function(){ overlay.remove(); };
  document.getElementById('dg-accept').onclick=function(){
    /* Save day gen */
    try{
      var s=S();
      if(s){
        if(!s.dayGens) s.dayGens=[];
        s.dayGens.push({ts:Date.now(),day:day,quests:data.quests_today,guna:data.dominant_guna,element:data.dominant_element,ring:data.ring,light:data.total_light});
        if(s.dayGens.length>30) s.dayGens=s.dayGens.slice(-30);
        try{if(typeof save==='function') save();}catch(e){}
      }
    }catch(e){}
    overlay.style.animation='dgFadeIn .3s ease reverse';
    setTimeout(function(){overlay.remove();},300);
  };
  overlay.onclick=function(e){if(e.target===overlay) overlay.remove();};
}


/* v3 fix: Хроника пути styled like Духовный портрет / Твой миф */
function fixChronikaStyling(){
  var chron=document.getElementById('istokChron');
  if(!chron || chron.__dgStyled4) return;
  chron.__dgStyled4=true;
  
  /* Find the H2 above #istokChron */
  var h2=chron.previousElementSibling;
  while(h2 && h2.tagName!=='H2') h2=h2.previousElementSibling;
  if(!h2) return;
  
  /*
   * Build structure matching ДУХОВНЫЙ ПОРТРЕТ / ТВОЙ МИФ exactly:
   *   <div class="card awara-glass-card">
   *     <span class="label" style="cursor:pointer;user-select:none">
   *       Хроника пути
   *       <span style="float:right;opacity:.55;font-size:12px">▸</span>
   *     </span>
   *     <div class="aw-foldbody">
   *       <div id="istokChron" ...>  (paint() keeps filling this)
   *     </div>
   *   </div>
   */
  var card=document.createElement('div');
  card.className='card awara-glass-card';
  card.id='chronCardWrap';
  card.setAttribute('data-aw-fold','0');
  
  var label=document.createElement('span');
  label.className='label';
  label.style.cssText='cursor:pointer;user-select:none';
  label.textContent='Хроника пути';
  
  var caret=document.createElement('span');
  caret.style.cssText='float:right;opacity:.55;font-size:12px';
  caret.textContent='\u25b8';
  label.appendChild(caret);
  
  var body=document.createElement('div');
  body.className='aw-foldbody';
  
  /* Insert card where H2 was, hide H2 */
  h2.parentNode.insertBefore(card, h2);
  h2.style.display='none';
  
  /* Strip istokChron's own card styling (it's already .card.awara-glass-card in HTML) */
  chron.style.cssText='border:none!important;background:none!important;border-radius:0!important;margin:0!important;box-shadow:none!important;backdrop-filter:none!important';
  chron.className='';
  chron.style.display=''; /* clear legacy fold from awara-istok-fold.js */
  
  card.appendChild(label);
  body.appendChild(chron);
  card.appendChild(body);
  
  /* Block awara-istok-fold.js from interfering (it looks for H2 via previousElementSibling) */
  chron.__awFoldInit=true;
  
  /* Fold toggle — default COLLAPSED */
  var KEY='awara_chron_v4';
  function isOpen(){try{return localStorage.getItem(KEY)==='open';}catch(e){return false;}}
  function apply(anim,force){
    var open=force?false:(card.__awUserToggled?isOpen():false);
    card.setAttribute('data-aw-fold',open?'1':'0');
    body.setAttribute('data-fold',open?'1':'0');
    body.classList.toggle('is-collapsed',!open);
    if(window.AwaraFx) window.AwaraFx.toggle(body,open,!!anim);
    else body.style.display=open?'':'none';
    caret.textContent=open?'\u25be':'\u25b8';
  }
  label.addEventListener('click',function(e){
    e.stopPropagation();
    card.__awUserToggled=true;
    try{localStorage.setItem(KEY,isOpen()?'collapsed':'open');}catch(e){}
    apply(true,false);
  });
  apply(false,true);
  window.__refreshChronFold=function(anim,force){apply(!!anim,!!force);};
}

/* ── Fix Хроника пути default ── */
function fixChronika(){
  try{
    /* v3: don't force open — handled by fixChronikaStyling */
  }catch(e){}
}

/* ── Auto-trigger on all quests done ── */
window.addEventListener('awara:quest-done',function(e){
  try{
    if(!e.detail||e.detail.source!=='matrix') return;
    var s=S(); if(!s||!s.matQuests||!s.matQuests.items) return;
    if(s.matQuests.items.every(function(x){return x.done;})){
      setTimeout(showCard, 4000);
    }
  }catch(e2){}
});

/* ── Init ── */
fixChronika();
setTimeout(addButton, 600);
setTimeout(fixChronikaStyling, 700);

/* Re-add after navigation */
if(typeof window.go==='function' && !window.go.__dg3){
  var _og=window.go;
  window.go=function(n){
    var r=_og.apply(this,arguments);
    if(n==='istok'){
      setTimeout(addButton,100);
      setTimeout(fixChronikaStyling,150);
      setTimeout(function(){try{if(window.__refreshChronFold)window.__refreshChronFold(false,false);}catch(e){}},200);
    }
    return r;
  };
  window.go.__dg3=true;
}
if(typeof window.renderIstok==='function' && !window.renderIstok.__dg3){
  var _or=window.renderIstok;
  window.renderIstok=function(){
    var r=_or.apply(this,arguments);
    setTimeout(addButton,100);
    setTimeout(fixChronikaStyling,150);
    setTimeout(function(){try{if(window.__refreshChronFold)window.__refreshChronFold(false,false);}catch(e){}},200);
    return r;
  };
  window.renderIstok.__dg3=true;
}

window.AwaraDayGen={show:showCard,collect:collectDayData,portrait:energyPortrait,advice:getRingAdvice};

})();
