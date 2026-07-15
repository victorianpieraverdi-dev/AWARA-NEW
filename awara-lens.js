/* ============================================================
   AWARA · LENS LAYER (v1)
   Шаг 2: Чёткость линз + Духовный портрет.
   Аддитивно оборачивает функции инлайн-движка, ничего не ломая.
   Состояние хранится в STATE.lenses и сериализуется штатным save().
   ============================================================ */
(function(){
'use strict';
if(window.__awaraLens) return; window.__awaraLens=true;

/* ---- стили ---- */
try{
  if(!document.querySelector('style[data-awara-lens]')){
    var st=document.createElement('style');
    st.setAttribute('data-awara-lens','1');
    st.textContent=`
#deck .mcard .gl{transition:opacity .3s ease,filter .3s ease,transform .3s ease,border-color .3s ease,background .3s ease,box-shadow .3s ease}
#deck .mcard[data-alv="1"]{border:1px solid rgba(255,255,255,.04);background:rgba(10,10,20,.6)}
#deck .mcard[data-alv="1"] .gl{opacity:.3;filter:grayscale(.9) brightness(.4) hue-rotate(var(--hue,0deg))}
#deck .mcard[data-alv="1"] .nm{opacity:.35;color:#555}
#deck .mcard[data-alv="2"]{border:1px solid var(--c1a30,rgba(201,168,76,.3));background:linear-gradient(160deg,var(--c1a06,rgba(201,168,76,.06)),rgba(10,10,20,.4))}
#deck .mcard[data-alv="2"] .gl{opacity:.6;filter:grayscale(.45) brightness(.75) hue-rotate(var(--hue,0deg))}
#deck .mcard[data-alv="3"]{border:1.5px solid var(--c1a55,rgba(201,168,76,.55));box-shadow:0 0 12px var(--c1a20,rgba(201,168,76,.2))}
#deck .mcard[data-alv="3"] .gl{opacity:.85;filter:brightness(.95) hue-rotate(var(--hue,0deg));border:2px solid var(--c1a50,rgba(201,168,76,.5))}
#deck .mcard[data-alv="4"]{border:2px solid var(--c1a70,rgba(201,168,76,.7));background:linear-gradient(150deg,var(--c1a18,rgba(201,168,76,.18)),var(--c2a08,rgba(123,98,201,.08)));box-shadow:0 0 20px var(--c1a30,rgba(201,168,76,.3)),0 0 6px var(--c2a15,rgba(123,98,201,.15))}
#deck .mcard[data-alv="4"] .gl{filter:brightness(1.1) saturate(1.3) hue-rotate(var(--hue,0deg));border:2px solid var(--c1a70,rgba(201,168,76,.7));box-shadow:0 0 14px var(--c1a40,rgba(201,168,76,.4));transform:scale(1.05)}
#deck .mcard[data-alv="5"]{border:2px solid var(--c1,#c9a84c);background:linear-gradient(145deg,var(--c1a25,rgba(201,168,76,.25)),var(--c2a12,rgba(123,98,201,.12)));box-shadow:0 0 32px var(--c1a45,rgba(201,168,76,.45)),0 0 12px var(--c2a25,rgba(123,98,201,.25));transform:scale(1.03)}
#deck .mcard[data-alv="5"] .gl{filter:brightness(1.2) saturate(1.5) hue-rotate(var(--hue,0deg));border:2.5px solid var(--c1,#c9a84c);box-shadow:0 0 22px var(--c1a55,rgba(201,168,76,.55)),0 0 8px var(--c2a30,rgba(123,98,201,.3));transform:scale(1.1)}
#deck .mcard[data-alv="5"] .nm{color:var(--c3,#f4e3b0);text-shadow:0 0 10px var(--c1a45,rgba(201,168,76,.45))}
#deck .mcard[data-alv="6"]{border:3px solid var(--c1,#c9a84c);background:linear-gradient(135deg,var(--c1a30,rgba(201,168,76,.3)),var(--c2a18,rgba(123,98,201,.18)),var(--c3a10,rgba(244,227,176,.1)));box-shadow:0 0 48px var(--c1a55,rgba(201,168,76,.55)),0 0 20px var(--c2a35,rgba(123,98,201,.35)),inset 0 0 20px var(--c1a10,rgba(201,168,76,.1));transform:scale(1.06)}
#deck .mcard[data-alv="6"] .gl{filter:brightness(1.3) saturate(1.7) contrast(1.1) hue-rotate(var(--hue,0deg));border:3px solid var(--c1,#c9a84c);box-shadow:0 0 30px var(--c1a65,rgba(201,168,76,.65)),0 0 12px var(--c2a40,rgba(123,98,201,.4)),0 0 5px rgba(255,215,0,.4);transform:scale(1.15)}
#deck .mcard[data-alv="6"] .nm{color:var(--c3,#f4e3b0);text-shadow:0 0 14px var(--c1a55,rgba(201,168,76,.55))}
#deck .mcard .gl.lens-orb{position:relative;width:56px;height:56px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;border:1px solid var(--line);background:radial-gradient(circle at 50% 38%,rgba(123,98,201,.2),rgba(5,5,13,.45))}
#deck .mcard .gl.lens-orb .lens-orb-gl{font-size:24px;line-height:1}
#deck .mcard .gl.lens-orb .lens-orb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
/* lens-cl border/shadow now handled by renderDeck inline styles */
.lens-badge{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-top:7px;display:flex;align-items:center;gap:5px}
.mcard.lens-cl-2 .lens-badge,.mcard.lens-cl-3 .lens-badge,.mcard.lens-cl-4 .lens-badge{color:var(--gold)}
.lens-dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 5px currentColor;flex:0 0 auto}
#soulPortrait .sp-dom{font-family:'Cinzel',serif;font-size:17px;color:#fff;margin:6px 0 2px}
#soulPortrait .sp-desc{color:var(--muted);font-size:14px;line-height:1.45;margin-bottom:10px}
#soulPortrait .sp-el{display:flex;align-items:center;gap:8px;margin:5px 0;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
#soulPortrait .sp-el .sp-name{width:64px;flex:0 0 auto}
#soulPortrait .sp-bar{flex:1;height:7px;border-radius:7px;background:rgba(255,255,255,.07);overflow:hidden}
#soulPortrait .sp-bar i{display:block;height:100%;border-radius:7px;background:linear-gradient(90deg,var(--violet),var(--gold))}
#soulPortrait .sp-el .sp-n{width:30px;text-align:right;flex:0 0 auto;color:var(--gold)}
#soulPortrait .sp-top{margin-top:12px;display:flex;flex-direction:column;gap:7px}
#soulPortrait .sp-lens{display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:12px;padding:8px 11px}
#soulPortrait .sp-lens .sp-gl{font-size:20px;flex:0 0 auto}
#soulPortrait .sp-lens .sp-info b{font-family:'Cinzel',serif;color:#fff;font-size:14px;font-weight:500}
#soulPortrait .sp-lens .sp-info span{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--gold);text-transform:uppercase;letter-spacing:.05em;margin-top:2px}

/* ---- Ascension level visuals (L1-L6) — applied via JS inline styles ---- */
#deck .mcard{transition:all .35s ease}
#deck .mcard .gl{transition:opacity .3s,filter .3s,transform .3s}
#deck .mcard .nm{transition:color .3s,text-shadow .3s}
#deck .mcard .el{font-size:9px;line-height:1.35;margin-top:4px;max-height:2.7em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#deck .mcard .lens-lad,.libcard .lens-lad{display:flex;gap:4px;margin-top:8px}
#deck .mcard .lens-lad i,.libcard .lens-lad i{flex:1;height:4px;border-radius:3px;background:var(--gold,#c9a84c);transition:opacity .35s ease}
`;
    document.head.appendChild(st);
  }
}catch(e){}

/* ---- доступ к STATE движка ---- */
function S(){ try{ return STATE; }catch(e){ return null; } }

var CLAR=[
  {tier:0,name:'Тусклая'},
  {tier:1,name:'Проявленная'},
  {tier:2,name:'Чёткая'},
  {tier:3,name:'Гранёная'},
  {tier:4,name:'Сияющая'}
];
function clarityOf(uses){ uses=uses||0; var t=uses>=12?4:uses>=7?3:uses>=4?2:uses>=1?1:0; return CLAR[t]; }

function ensureLenses(){ var s=S(); if(!s) return; if(!s.lenses||typeof s.lenses!=='object') s.lenses={}; }

/* ---- card-in-lens: round window showing a deck card image, changing by clarity ---- */
var CARD_DIR='exports/generated_cards/tarot_cards_webp/';
var SLUG_ARR=['vedic','tarot_arcanic','kabbalistic','hermetic_alchemical','slavic','gnostic','daoist','chinese_iching','egyptian','mayan','aztec_mexica','celtic','norse','shamanic','buddhist_mahayana','islamic_sufi_nur','christian_mystical_grail','atlantean_lemurian','shambhala','gene_keys','astrological','cosmic_galactic','shinto','sumerian_babylonian','zoroastrian','afro_dogon','yoruba_ifa_orisha','tantric_kashmiri','posthuman_ai_sophianic','technomagical','advaita_siddha','julian_byzantine','antique_greco_roman'];
var MAT_ID={vedic:1,egyptian:2,kabbalistic:3,mayan:4,slavic:5,norse:6,daoist:7,gnostic:8,shinto:9,celtic:10,shambhala:11,julian_byzantine:12,shamanic:13,gene_keys:14,technomagical:15,cosmic_galactic:16,antique_greco_roman:17,zoroastrian:18,islamic_sufi_nur:19,aztec_mexica:20,christian_mystical_grail:21,yoruba_ifa_orisha:22,sumerian_babylonian:23,hermetic_alchemical:24,tarot_arcanic:25,astrological:26,chinese_iching:27,tantric_kashmiri:28,buddhist_mahayana:29,afro_dogon:30,atlantean_lemurian:31,posthuman_ai_sophianic:32,advaita_siddha:33};
var AGENT_ORDER=['svet_ra','iskra','brahma','sarasvati','vishnu','lakshmi','shiva','parvati','jnana','prema','shakti','ananda','shanti','agni','vayu','varuna','prithvi','akasha','tejas','dharma','karma'];
var CARDS_BY_MATRIX=null;
var _readyCbs=null;
function slugOf(key){ try{ var i=MATKEYS.indexOf(key); return i>=0?SLUG_ARR[i]:null; }catch(e){ return null; } }
function padNum(n){ return n<100?('00'+n).slice(-3):('000'+n).slice(-4); }
function fileNum(agent,slug){ var ai=AGENT_ORDER.indexOf(agent); var mi=MAT_ID[slug]; if(ai<0||!mi) return 0; return ai*33+mi; }
function pickAgent(slug,tier){ var list=CARDS_BY_MATRIX&&CARDS_BY_MATRIX[slug]; if(list&&list.length){ var idx=Math.round(tier/4*(list.length-1)); if(idx<0)idx=0; if(idx>=list.length)idx=list.length-1; return list[idx]; } return null; }
function orbFilterForLevel(alv){
  alv=alv||1;
  if(alv<=1) return 'grayscale(1) brightness(.42) contrast(.92)';
  if(alv===2) return 'grayscale(.55) brightness(.72) saturate(.65)';
  if(alv===3) return 'grayscale(.12) brightness(.92) saturate(1.12)';
  if(alv===4) return 'grayscale(0) brightness(1.05) saturate(1.35) drop-shadow(0 0 8px rgba(201,168,76,.35))';
  if(alv===5) return 'grayscale(0) brightness(1.12) saturate(1.55) drop-shadow(0 0 14px rgba(201,168,76,.5)) drop-shadow(0 0 6px rgba(123,98,201,.28))';
  return 'grayscale(0) brightness(1.18) saturate(1.78) contrast(1.04) drop-shadow(0 0 20px rgba(255,215,0,.45)) drop-shadow(0 0 10px rgba(201,168,76,.55))';
}
function orbOpacityForLevel(alv){ return alv<=1?'.42':alv===2?'.58':alv===3?'.78':alv===4?'.9':alv===5?'.96':'1'; }
function setOrbImg(gl,src,alv){
  try{ fetch(src).then(function(r){ return r.ok?r.arrayBuffer():null; }).then(function(buf){
    if(!buf) return; var blob=new Blob([buf],{type:'image/webp'}); var url=URL.createObjectURL(blob);
    var img=gl.querySelector('.lens-orb-img'); if(!img){ img=document.createElement('img'); img.className='lens-orb-img'; img.alt=''; gl.appendChild(img); } img.src=url;
    img.style.filter=orbFilterForLevel(alv);
    img.style.opacity=orbOpacityForLevel(alv);
  }).catch(function(){}); }catch(e){}
}
function paintOrb(card,key,tier){
  var gl=card.querySelector('.gl'); if(!gl) return;
  var slug=slugOf(key); if(!slug) return;
  var alv=1; try{if(window.__deckLvPreview>0){alv=window.__deckLvPreview;}else if(window.AwaraAscension&&AwaraAscension.level){alv=AwaraAscension.level(key);}}catch(e){}
  var src='hero_orbs/'+slug+'.webp';
  var stamp=src+'|'+alv;
  if(gl.getAttribute('data-src')===stamp){
    var im=gl.querySelector('.lens-orb-img'); if(im){ im.style.filter=orbFilterForLevel(alv); im.style.opacity=orbOpacityForLevel(alv); }
    return;
  }
  var glyph=gl.getAttribute('data-glyph')||gl.textContent||'';
  gl.setAttribute('data-glyph',glyph); gl.setAttribute('data-src',stamp); gl.classList.add('lens-orb');
  gl.innerHTML='<span class="lens-orb-gl">'+glyph+'</span>';
  setOrbImg(gl,src,alv);
}
function codexMx(key){
  var slug=slugOf(key); if(!slug||!window.AwaraCodex||!AwaraCodex.matrices) return null;
  var list=AwaraCodex.matrices();
  for(var i=0;i<list.length;i++) if(list[i].slug===slug) return list[i];
  return null;
}
function codexIdFor(key){ var mx=codexMx(key); return mx?mx.id:null; }
var IMM_DESC=['','Плоский ч/б — мир ещё не окрашен, только силуэт традиции.','Первый оттенок — линза пробуждается, цвет проступает сквозь туман.','Гармония — палитра кодекса сходится, формы становятся узнаваемыми.','Сияние — священная геометрия и световые контуры традиции.','Восход — объём, аура и глубина; линза звучит как живая вселенная.','Божественное — тонкий объёмный мир: рай-на-земле, полный визуальный код матрицы.'];
function loadCards(){
  if(CARDS_BY_MATRIX) return;
  try{ fetch('data/card_prompts.json').then(function(r){return r.ok?r.json():null;}).then(function(arr){
    if(!arr||!arr.length) return; var RANK={common:0,uncommon:1,rare:2,epic:3,legendary:4}; var by={};
    arr.forEach(function(c,i){ var s=c.matrix_slug,a=c.agent_slug; if(!s||!a) return; (by[s]||(by[s]=[])).push({agent:a,rank:(RANK[c.rarity]!=null?RANK[c.rarity]:0),idx:i}); });
    Object.keys(by).forEach(function(s){ by[s].sort(function(x,y){return (x.rank-y.rank)||(AGENT_ORDER.indexOf(x.agent)-AGENT_ORDER.indexOf(y.agent));}); });
    CARDS_BY_MATRIX=by; try{decorateDeck();}catch(e){}
    try{ if(_readyCbs){ var _cbs=_readyCbs; _readyCbs=null; _cbs.forEach(function(cb){try{cb();}catch(e){}}); } }catch(e){}
  }).catch(function(){}); }catch(e){}
}

function recordUses(mats,light){
  var s=S(); if(!s) return; ensureLenses();
  (mats||[]).forEach(function(k){
    var L=s.lenses[k]||(s.lenses[k]={uses:0,xp:0,clarity:0});
    L.uses+=1; L.xp+=10+Math.round((light||0)/10); L.clarity=clarityOf(L.uses).tier;
  });
  try{ if(typeof save==='function') save(); }catch(e){}
}

/* ---- дробное начисление линз по резонансу текста дня (V1: ключевые слова) ----
   Игрок мог явно не выбрать линзу, но упомянуть её в описании дня
   ("была чайная церемония", "читал про Тибет") — такие линзы тоже
   получают небольшой прирост uses, не дожидаясь явного выбора. */
var LENS_VOCAB={
  'Ведическая':['мантр','йог','чакр','дхарм','карм','веды','аюрведа','гуру','пудж','накшатр','благовони','агни хотр'],
  'Таро':['таро','аркан','расклад карт','колода карт'],
  'Каббала':['каббала','сефирот','древо жизни','тиккун','зоар'],
  'Герметизм':['гермес','алхимия','кибалион','философский камень'],
  'Славянская':['сварог','коло','числобог','круголет','род славянский'],
  'Гностицизм':['гнозис','плерома','софия','архонт'],
  'Даосизм':['дао','у-вэй','инь','ян','ци','чайная церемони','чайной церемони'],
  'И-Цзин':['и цзин','гексаграмма','перемены'],
  'Египетская':['египет','пирамид','фараон','анубис','изида','дуат'],
  'Майя':['цолькин','майя календарь','чичен ица'],
  'Ацтеки':['ацтек','кетцалькоатль','науатль'],
  'Кельтская':['огам','друид','кельт'],
  'Скандинавская':['руна','футарк','иггдрасиль','викинг'],
  'Шаманская':['шаман','животное силы','бубен','тотем'],
  'Буддийская':['будда','нирвана','бодхисаттва','восьмеричный путь','тибет'],
  'Суфийская':['суфий','зикр','руми','дервиш'],
  'Христианская':['грааль','икона','литургия','храм христианск'],
  'Атлантическая':['атлантида','лемурия','кристалл памяти'],
  'Шамбала':['шамбала','воин света'],
  'Генные Ключи':['генные ключи','тень дар сиддх'],
  'Астрологическая':['гороскоп','зодиак','натальная карта','ретроградн'],
  'Космическая':['космос','галактика','вселенн'],
  'Шинто':['синто','ками','тории'],
  'Шумерская':['шумер','ануннаки','гильгамеш'],
  'Зороастрийская':['зороастр','ахура мазда','заратустра'],
  'Африканская':['догон','сириус','предков ритм'],
  'Йоруба':['йоруба','ориша','ифа','аше'],
  'Тантрическая':['тантра','кундалини','спанда'],
  'Постчеловеческая':['нейросет','искусственный интеллект','трансгуманизм'],
  'Техномагия':['код как заклинан','ритуал программирован'],
  'Адвайта':['адвайта','недвойственност','атман'],
  'Византийская':['исихазм','умная молитва','афон'],
  'Орфическая':['орфей','орфическ','мистери']
};
function scoreTextLenses(text){
  var t=(text||'').toLowerCase(); if(!t.trim()) return {};
  var out={};
  Object.keys(LENS_VOCAB).forEach(function(k){
    var hits=0;
    LENS_VOCAB[k].forEach(function(w){ if(t.indexOf(w)>=0) hits++; });
    if(hits>0) out[k]=Math.min(0.5,hits*0.2);
  });
  return out;
}
function applyTextResonance(text,explicitMats){
  /* оставлено для совместимости/ручных вызовов: применяет сразу, без предложения-подтверждения */
  var s=S(); if(!s) return; ensureLenses();
  var scores=scoreTextLenses(text);
  Object.keys(scores).forEach(function(k){
    if(explicitMats&&explicitMats.indexOf(k)>=0) return;
    var L=s.lenses[k]||(s.lenses[k]={uses:0,xp:0,clarity:0});
    L.uses+=scores[k]; L.xp+=Math.round(scores[k]*10); L.clarity=clarityOf(L.uses).tier;
  });
  try{ if(typeof save==='function') save(); }catch(e){}
}

/* ---- банк + предложение ИИ + правка игроком (2026-07-05) ----
   Плавка больше НЕ зачисляет резонанс линз сразу — она предлагает
   черновик (STATE.pendingResonance), игрок видит его на экране
   Результата, может снять галочку с лишнего, и только по кнопке
   "Прожито" предложенное (с учётом правок) зачисляется в банк. */

/* ---- персональная калибровка (2026-07-05) ----
   Каждое принятие/отклонение предложенной линзы запоминается на
   ИГРОКА (не меняет саму модель/ИИ вообще, только его личный профиль).
   Со временем предложения по линзам, которые он стабильно отклоняет,
   ослабляются или перестают появляться; те, что стабильно принимает — нет. */
function ensureCalibration(s){ if(!s.lensCalibration||typeof s.lensCalibration!=='object') s.lensCalibration={}; return s.lensCalibration; }
function calibTrust(s,key){
  var c=ensureCalibration(s)[key]; if(!c) return 0.5; /* нет истории — нейтрально */
  return (c.accepted+1)/(c.accepted+c.rejected+2); /* сглаживание Лапласа: старт 0.5, дальше по опыту */
}
function calibRecord(s,key,accepted){
  var cal=ensureCalibration(s); var c=cal[key]||(cal[key]={accepted:0,rejected:0});
  if(accepted) c.accepted+=1; else c.rejected+=1;
}
function proposeTextResonance(text,explicitMats){
  var s=S(); var scores=scoreTextLenses(text);
  Object.keys(scores).forEach(function(k){
    if(explicitMats&&explicitMats.indexOf(k)>=0){ delete scores[k]; return; }
    if(s){
      var trust=calibTrust(s,k);
      scores[k]=scores[k]*trust;
      if(scores[k]<0.05) delete scores[k]; /* игрок стабильно отклоняет — больше не предлагаем */
    }
  });
  return scores;
}
function renderResonanceCard(){
  var card=document.getElementById('resonanceCard'), list=document.getElementById('resonanceList');
  if(!card||!list) return;
  var s=S(); var pend=s&&s.pendingResonance;
  if(!pend||!Object.keys(pend).length){ card.style.display='none'; return; }
  card.style.display=''; list.innerHTML='';
  Object.keys(pend).forEach(function(k){
    var row=document.createElement('label'); row.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer';
    var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=true; cb.setAttribute('data-lens',k); cb.style.cssText='width:16px;height:16px';
    var m=(typeof MATRIX!=='undefined'&&MATRIX[k])?MATRIX[k]:null;
    var txt=document.createElement('span'); txt.textContent=(m?m[0]+' ':'')+k+' · +'+pend[k].toFixed(1);
    row.appendChild(cb); row.appendChild(txt); list.appendChild(row);
  });
}
function commitResonance(){
  var s=S(); if(!s||!s.pendingResonance) return; ensureLenses();
  var pend=s.pendingResonance, list=document.getElementById('resonanceList'), checked={};
  if(list&&list.children.length){ list.querySelectorAll('input[type=checkbox]').forEach(function(cb){ if(cb.checked) checked[cb.getAttribute('data-lens')]=true; }); }
  else { Object.keys(pend).forEach(function(k){ checked[k]=true; }); }
  Object.keys(pend).forEach(function(k){
    calibRecord(s,k,!!checked[k]); /* запоминаем принято/отклонено — на будущее для этого игрока */
    if(!checked[k]) return;
    var L=s.lenses[k]||(s.lenses[k]={uses:0,xp:0,clarity:0});
    L.uses+=pend[k]; L.xp+=Math.round(pend[k]*10); L.clarity=clarityOf(L.uses).tier;
  });
  s.pendingResonance=null;
  try{ if(typeof save==='function') save(); }catch(e){}
  try{ renderResonanceCard(); }catch(e){}
}
/* плавка — предлагаем черновик, тот же текст, что уходит в generateAdvice */
try{
  if(typeof window.doMelt==='function' && !window.doMelt.__lensResonance){
    var _dm=window.doMelt;
    window.doMelt=function(){
      try{
        var ta=document.getElementById('dayText'); var s=S();
        if(ta&&s) s.pendingResonance=proposeTextResonance(ta.value,s.mats);
      }catch(e){}
      return _dm.apply(this,arguments);
    };
    window.doMelt.__lensResonance=true;
  }
}catch(e){}
/* экран Результата — рисуем карточку с предложением */
try{
  if(typeof window.renderResult==='function' && !window.renderResult.__lensResonance){
    var _rr=window.renderResult;
    window.renderResult=function(){ var r=_rr.apply(this,arguments); try{ renderResonanceCard(); }catch(e){} return r; };
    window.renderResult.__lensResonance=true;
  }
}catch(e){}
/* кнопка "Прожито" — фиксируем банк по отмеченным пунктам, до перехода в летопись */
try{
  var _liveBtnRes=document.getElementById('liveBtn');
  if(_liveBtnRes && !_liveBtnRes.__lensResonanceCommit){
    _liveBtnRes.addEventListener('click', function(){ try{ commitResonance(); }catch(e){} }, true);
    _liveBtnRes.__lensResonanceCommit=true;
  }
}catch(e){}

/* ---- подсветка колоды по чёткости ---- */
function _hexRgb(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function _ra(h,a){var c=_hexRgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}

var _alvAnimSheet=null;
function _alvAnim(id,c1,c2){
  if(!_alvAnimSheet){_alvAnimSheet=document.createElement('style');_alvAnimSheet.id='alv-anims';document.head.appendChild(_alvAnimSheet);}
  var n='alvp'+id;if(_alvAnimSheet.textContent.indexOf(n)>=0)return n;
  _alvAnimSheet.textContent+='@keyframes '+n+'{0%,100%{box-shadow:0 0 30px '+_ra(c1,.35)+',0 0 10px '+_ra(c2,.2)+'}50%{box-shadow:0 0 48px '+_ra(c1,.55)+',0 0 20px '+_ra(c2,.35)+',inset 0 0 16px '+_ra(c1,.1)+'}} ';
  return n;
}

function _paintCard(card,lv,pal){
  var c1=(pal&&pal[0])||'#c9a84c',c2=(pal&&pal[1])||'#7b62c9',c3=(pal&&pal[2])||'#f4e3b0';
  var gl=card.querySelector('.gl'),nm=card.querySelector('.nm'),lb=card.querySelector('.lv-badge');
  var cs=card.style,gs=gl?gl.style:null,ns=nm?nm.style:null,ls=lb?lb.style:null;
  /* wipe previous inline */
  cs.cssText=cs.cssText.replace(/border-color:[^;]+;?/g,'').replace(/background:[^;]+;?/g,'').replace(/box-shadow:[^;]+;?/g,'').replace(/animation:[^;]+;?/g,'');
  if(gs){gs.filter='';gs.transform='';gs.opacity='';}
  if(ns){ns.color='';ns.textShadow='';}
  if(ls){ls.color='';ls.borderColor='';ls.background='';}
  if(lv<2) return;
  /* L2 */
  cs.borderColor=_ra(c1,.35);
  cs.background='linear-gradient(160deg,'+_ra(c1,.08)+',transparent)';
  if(gs){gs.opacity='.78';gs.filter='grayscale(.08)';}
  if(lv<3) return;
  /* L3 */
  cs.borderColor=_ra(c1,.5);
  cs.background='linear-gradient(155deg,'+_ra(c1,.15)+','+_ra(c3,.07)+')';
  cs.boxShadow='0 0 16px '+_ra(c1,.18);
  if(gs){gs.opacity='.92';gs.filter='drop-shadow(0 0 6px '+_ra(c1,.65)+')';}
  if(lv<4) return;
  /* L4 */
  cs.borderColor=_ra(c1,.65);
  cs.background='linear-gradient(150deg,'+_ra(c1,.22)+','+_ra(c2,.12)+')';
  cs.boxShadow='0 0 24px '+_ra(c1,.25)+',inset 0 0 18px '+_ra(c1,.07);
  if(gs){gs.opacity='1';gs.filter='drop-shadow(0 0 8px '+c1+')';gs.transform='scale(1.06)';}
  if(ns)ns.color=_ra(c3,.9);
  if(lv<5) return;
  /* L5 */
  var aid=card.getAttribute('data-alv-id')||'0';
  var an=_alvAnim(aid,c1,c2);
  cs.borderColor=_ra(c1,.8);
  cs.background='linear-gradient(145deg,'+_ra(c1,.28)+','+_ra(c2,.16)+','+_ra(c3,.1)+')';
  cs.boxShadow='0 0 32px '+_ra(c1,.38)+',0 0 12px '+_ra(c2,.22);
  cs.animation=an+' 3s ease-in-out infinite';
  if(gs){gs.filter='drop-shadow(0 0 10px '+c1+') drop-shadow(0 0 5px '+c2+')';gs.transform='scale(1.1)';}
  if(ns){ns.color=c3;ns.textShadow='0 0 12px '+_ra(c1,.4);}
  if(ls){ls.color=c1;ls.borderColor=_ra(c1,.45);ls.background=_ra(c1,.18);}
  if(lv<6) return;
  /* L6 */
  cs.borderColor=c1;
  cs.background='linear-gradient(135deg,'+_ra(c1,.35)+','+_ra(c2,.22)+','+_ra(c3,.16)+')';
  cs.boxShadow='0 0 44px '+_ra(c1,.50)+',0 0 18px '+_ra(c2,.32)+',inset 0 0 22px '+_ra(c1,.12);
  if(gs){gs.filter='drop-shadow(0 0 16px '+c1+') drop-shadow(0 0 7px '+c2+') drop-shadow(0 0 5px #ffd700)';gs.transform='scale(1.15)';}
}

function decorateDeck(){
  var s=S(); if(!s) return; ensureLenses();
  document.querySelectorAll('#deck .mcard').forEach(function(card,idx){
    var nm=card.querySelector('.nm'); if(!nm) return;
    var key=nm.textContent; var L=s.lenses[key]||{uses:0,xp:0};
    var cl=clarityOf(L.uses);
    for(var i=0;i<5;i++) card.classList.remove('lens-cl-'+i);
    card.classList.add('lens-cl-'+cl.tier);
    try{ paintOrb(card,key,cl.tier); }catch(e){}
    var alv=1; try{if(window.__deckLvPreview>0){alv=window.__deckLvPreview;}else if(window.AwaraAscension&&AwaraAscension.level){alv=AwaraAscension.level(key);}}catch(e){}
    card.setAttribute('data-alv',String(alv));
    var pal=null; try{pal=typeof window.lensPalette==='function'?window.lensPalette(key):null;}catch(e){}
    var c1h=(pal&&pal[0])||'#c9a84c',c2h=(pal&&pal[1])||'#7b62c9',c3h=(pal&&pal[2])||'#f4e3b0';
    var hr=0; try{var mi=(typeof MATKEYS!=='undefined')?MATKEYS.indexOf(key):-1;if(mi>=0&&window._HUE)hr=window._HUE[mi]||0;}catch(e){}
    /* card visuals handled by awara-card-visuals.js */
    if(false){
      /* L1: dark, desaturated */
      if(alv<=1){
        ov.style.background='rgba(10,10,20,.7)';ov.style.mixBlendMode='normal';
        gl.style.opacity='.35';gl.style.transform='';
        card.style.border='1px solid rgba(255,255,255,.04)';card.style.background='rgba(10,10,20,.6)';
        nm.style.opacity='.4';nm.style.color='#555';
      }
      /* L2: faint color tint */
      else if(alv===2){
        ov.style.background=_ra(c1h,.35);ov.style.mixBlendMode='color';
        gl.style.opacity='.6';gl.style.transform='';
        card.style.border='1px solid '+_ra(c1h,.3);card.style.background='linear-gradient(160deg,'+_ra(c1h,.08)+',rgba(10,10,20,.5))';
        nm.style.opacity='';nm.style.color=_ra(c3h,.6);
      }
      /* L3: clear color */
      else if(alv===3){
        ov.style.background=_ra(c1h,.5);ov.style.mixBlendMode='color';
        gl.style.opacity='.85';gl.style.transform='';
        gl.style.border='2px solid '+_ra(c1h,.5);
        card.style.border='1.5px solid '+_ra(c1h,.55);card.style.boxShadow='0 0 12px '+_ra(c1h,.2);
        card.style.background='linear-gradient(155deg,'+_ra(c1h,.12)+','+_ra(c2h,.05)+')';
        nm.style.opacity='';nm.style.color=_ra(c3h,.8);
      }
      /* L4: vivid color, glow */
      else if(alv===4){
        ov.style.background=_ra(c1h,.55);ov.style.mixBlendMode='color';
        gl.style.opacity='1';gl.style.transform='scale(1.05)';
        gl.style.border='2px solid '+_ra(c1h,.7);gl.style.boxShadow='0 0 16px '+_ra(c1h,.45);
        card.style.border='2px solid '+_ra(c1h,.7);card.style.boxShadow='0 0 20px '+_ra(c1h,.3)+',0 0 6px '+_ra(c2h,.15);
        card.style.background='linear-gradient(150deg,'+_ra(c1h,.18)+','+_ra(c2h,.08)+')';
        nm.style.opacity='';nm.style.color=c3h;
      }
      /* L5: blazing */
      else if(alv===5){
        ov.style.background=c1h;ov.style.mixBlendMode='color';
        gl.style.opacity='1';gl.style.transform='scale(1.1)';
        gl.style.border='2.5px solid '+c1h;gl.style.boxShadow='0 0 24px '+_ra(c1h,.6)+',0 0 8px '+_ra(c2h,.3);
        card.style.border='2px solid '+c1h;card.style.boxShadow='0 0 32px '+_ra(c1h,.45)+',0 0 12px '+_ra(c2h,.25);
        card.style.transform='scale(1.03)';card.style.background='linear-gradient(145deg,'+_ra(c1h,.25)+','+_ra(c2h,.12)+')';
        nm.style.opacity='';nm.style.color=c3h;nm.style.textShadow='0 0 10px '+_ra(c1h,.45);
      }
      /* L6: divine */
      else{
        ov.style.background='linear-gradient(135deg,'+c1h+','+c2h+')';ov.style.mixBlendMode='color';ov.style.opacity='.85';
        gl.style.opacity='1';gl.style.transform='scale(1.15)';
        gl.style.border='3px solid '+c1h;gl.style.boxShadow='0 0 32px '+_ra(c1h,.7)+',0 0 12px '+_ra(c2h,.4)+',0 0 5px rgba(255,215,0,.5)';
        card.style.border='3px solid '+c1h;card.style.boxShadow='0 0 48px '+_ra(c1h,.55)+',0 0 20px '+_ra(c2h,.35)+',inset 0 0 20px '+_ra(c1h,.1);
        card.style.transform='scale(1.06)';card.style.background='linear-gradient(135deg,'+_ra(c1h,.3)+','+_ra(c2h,.18)+','+_ra(c3h,.1)+')';
        nm.style.opacity='';nm.style.color=c3h;nm.style.textShadow='0 0 14px '+_ra(c1h,.55);
      }
    }
    /* 6-step level ladder (always L1–L6) */
    var lad=card.querySelector('.lens-lad');
    if(!lad){ lad=document.createElement('div'); lad.className='lens-lad'; var lb0=card.querySelector('.lv-badge'); if(lb0) card.insertBefore(lad,lb0); else card.appendChild(lad); }
    var ladH=''; for(var bi=1;bi<=6;bi++){ var bop=bi<=alv?(0.34+bi*0.11).toFixed(2):'0.10'; ladH+='<i style="opacity:'+bop+'"></i>'; }
    lad.innerHTML=ladH;
    /* update badges */
    var lb=card.querySelector('.lv-badge');
    if(lb){var lvn=(window._LV_NAMES&&window._LV_NAMES[alv])||'';lb.textContent=(lvn?lvn+' ':'')+'L'+alv+'/6';}
    var b=card.querySelector('.lens-badge');
    if(!b){ b=document.createElement('span'); b.className='lens-badge'; card.appendChild(b); }
    b.innerHTML='<span class="lens-dot"></span>'+cl.name+(L.uses?(' \u00b7 '+L.uses):'');
  });
}

/* ---- Духовный портрет ---- */
var ELEMENT_DESC={
  'Огонь':'волю, страсть и преображение',
  'Вода':'чувство, поток и глубину',
  'Земля':'опору, тело и воплощение',
  'Воздух':'мысль, слово и свободу',
  'Эфир':'дух, связь и целое'
};
var ELEMENT_ORDER=['Огонь','Вода','Земля','Воздух','Эфир'];

function ensurePortrait(){
  if(document.getElementById('soulPortrait')) return;
  var istok=document.getElementById('s-istok'); if(!istok) return;
  var card=document.createElement('div');
  card.id='soulPortrait'; card.className='card awara-glass-card'; card.style.marginTop='4px';
  var btn=istok.querySelector('button.btn');
  if(btn) istok.insertBefore(card,btn); else istok.appendChild(card);
}

function matrixOf(k){ try{ return MATRIX[k]; }catch(e){ return null; } }

function renderPortrait(){
  var host=document.getElementById('soulPortrait'); if(!host) return;
  var s=S(); if(!s) return; ensureLenses();
  var L=s.lenses; var keys=Object.keys(L).filter(function(k){return L[k]&&L[k].uses>0;});
  var nbodies=(s.natal&&s.natal.bodies)?s.natal.bodies:null;
  var th2='<span class="label">\u0414\u0443\u0445\u043e\u0432\u043d\u044b\u0439 \u043f\u043e\u0440\u0442\u0440\u0435\u0442</span>';
  if(nbodies && typeof elementOf==='function' && typeof signOf==='function'){
    var nel={}; var ord4=['\u041e\u0433\u043e\u043d\u044c','\u0412\u043e\u0434\u0430','\u0417\u0435\u043c\u043b\u044f','\u0412\u043e\u0437\u0434\u0443\u0445']; ord4.forEach(function(e){nel[e]=0;});
    var tot=0;
    Object.keys(nbodies).forEach(function(p){ var e=elementOf(signOf(nbodies[p])); if(nel[e]!=null){nel[e]++; tot++;} });
    if(!tot) tot=1;
    var dom=ord4.slice().sort(function(a,b){return nel[b]-nel[a];})[0];
    th2+='<div class="sp-dom">\u0421\u0442\u0438\u0445\u0438\u044f \u043f\u0443\u0442\u0438 \u00b7 '+dom+'</div>';
    th2+='<div class="sp-desc">\u0421\u0442\u0438\u0445\u0438\u044f \u043f\u0443\u0442\u0438 \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u0438\u0437 \u0442\u0432\u043e\u0435\u0439 \u043d\u0430\u0442\u0430\u043b\u044c\u043d\u043e\u0439 \u043a\u0430\u0440\u0442\u044b, \u0430 \u043d\u0435 \u0438\u0437 \u043b\u0438\u043d\u0437: \u043a\u0430\u0436\u0434\u0430\u044f \u043c\u0430\u0442\u0440\u0438\u0446\u0430 \u0432\u043c\u0435\u0449\u0430\u0435\u0442 \u0432\u0441\u0435 \u0441\u0442\u0438\u0445\u0438\u0438 \u0438 \u0443\u0440\u043e\u0432\u043d\u0438.</div>';
    ord4.forEach(function(e){ if(nel[e]>0){ var pct=Math.round(nel[e]/tot*100); th2+='<div class="sp-el"><span class="sp-name">'+e+'</span><span class="sp-bar"><i style="width:'+pct+'%"></i></span><span class="sp-n">'+pct+'%</span></div>'; } });
  } else {
    th2+='<div class="sp-dom">\u0421\u0442\u0438\u0445\u0438\u044f \u043f\u0443\u0442\u0438 \u00b7 \u043f\u043e\u043a\u0430 \u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430</div>';
    th2+='<div class="sp-desc">\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439 \u043d\u0430\u0442\u0430\u043b\u044c\u043d\u0443\u044e \u043a\u0430\u0440\u0442\u0443 \u2014 \u0438 \u0441\u0442\u0438\u0445\u0438\u044f \u043f\u0443\u0442\u0438 \u043f\u0440\u043e\u044f\u0432\u0438\u0442\u0441\u044f.</div>';
  }
  if(keys.length){
    var top2=keys.slice().sort(function(a,b){return (L[b].uses-L[a].uses)||(L[b].xp-L[a].xp);}).slice(0,3);
    th2+='<div class="sp-top">';
    top2.forEach(function(k){ var m=matrixOf(k)||['\ud83d\udd2e','']; var cl=clarityOf(L[k].uses); var _alv=(window.AwaraAscension&&AwaraAscension.level)?AwaraAscension.level(k):1; th2+='<div class="sp-lens"><span class="sp-gl">'+m[0]+'</span><span class="sp-info"><b>'+k+'</b><span>'+cl.name+' \u00b7 L'+_alv+'/6</span></span></div>'; });
    th2+='</div>';
  }
  host.innerHTML=th2;
  try{
    host.__folded=false;
    if(window.AwaraIstokNow&&window.AwaraIstokNow.refresh) window.AwaraIstokNow.refresh();
  }catch(e){}
  return;
  if(!keys.length){
    host.innerHTML='<span class="label">Духовный портрет</span><p class="sub" style="margin-top:4px">Выбирай линзы в Тигле и проживай дни — портрет проявится из тех оптик, через которые ты смотришь чаще всего.</p>';
    return;
  }
  var els={}; ELEMENT_ORDER.forEach(function(e){els[e]=0;});
  var totalUses=0;
  keys.forEach(function(k){ var m=matrixOf(k); var e=m&&m[1]; if(els[e]!=null){els[e]+=L[k].uses; totalUses+=L[k].uses;} });
  if(!totalUses) totalUses=1;
  var dom=ELEMENT_ORDER.slice().sort(function(a,b){return els[b]-els[a];})[0];
  var top=keys.slice().sort(function(a,b){return (L[b].uses-L[a].uses)||(L[b].xp-L[a].xp);}).slice(0,3);
  if(totalUses<3){
    var th='<span class="label">\u0414\u0443\u0445\u043e\u0432\u043d\u044b\u0439 \u043f\u043e\u0440\u0442\u0440\u0435\u0442</span>';
    th+='<div class="sp-dom">\u0421\u0442\u0438\u0445\u0438\u044f \u043f\u0443\u0442\u0438 \u00b7 \u0435\u0449\u0451 \u043d\u0435 \u043f\u0440\u043e\u044f\u0432\u0438\u043b\u0430\u0441\u044c</div>';
    th+='<div class="sp-desc">\u041f\u043e\u043a\u0430 \u043b\u0438\u043d\u0437 \u043c\u0430\u043b\u043e, \u0447\u0442\u043e\u0431\u044b \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c \u0441\u0442\u0438\u0445\u0438\u044e \u043f\u0443\u0442\u0438. \u0412\u043e\u0437\u044c\u043c\u0438 \u0431\u043e\u043b\u044c\u0448\u0435 \u0440\u0430\u0437\u043d\u044b\u0445 \u043b\u0438\u043d\u0437 \u0432 \u0422\u0438\u0433\u043b\u0435 \u2014 \u0438 \u043e\u043d\u0430 \u043f\u0440\u043e\u044f\u0432\u0438\u0442\u0441\u044f.</div>';
    th+='<div class="sp-top">';
    top.forEach(function(k){ var m=matrixOf(k)||['\ud83d\udd2e','']; var cl=clarityOf(L[k].uses); var _alv=(window.AwaraAscension&&AwaraAscension.level)?AwaraAscension.level(k):1; th+='<div class="sp-lens"><span class="sp-gl">'+m[0]+'</span><span class="sp-info"><b>'+k+'</b><span>'+cl.name+' \u00b7 L'+_alv+'/6</span></span></div>'; });
    th+='</div>';
    host.innerHTML=th; return;
  }
  var h='<span class="label">Духовный портрет</span>';
  h+='<div class="sp-dom">Стихия пути \u00b7 '+dom+'</div>';
  h+='<div class="sp-desc">Ты смотришь на мир прежде всего через '+(ELEMENT_DESC[dom]||dom)+'. Чем чаще линза в деле — тем ярче и чётче она звучит.</div>';
  ELEMENT_ORDER.forEach(function(e){ if(els[e]>0){ var pct=Math.round(els[e]/totalUses*100); h+='<div class="sp-el"><span class="sp-name">'+e+'</span><span class="sp-bar"><i style="width:'+pct+'%"></i></span><span class="sp-n">'+pct+'%</span></div>'; } });
  h+='<div class="sp-top">';
  top.forEach(function(k){ var m=matrixOf(k)||['🔮','']; var cl=clarityOf(L[k].uses); var _alv=(window.AwaraAscension&&AwaraAscension.level)?AwaraAscension.level(k):1; h+='<div class="sp-lens"><span class="sp-gl">'+m[0]+'</span><span class="sp-info"><b>'+k+'</b><span>'+cl.name+' \u00b7 L'+_alv+'/6</span></span></div>'; });
  h+='</div>';
  host.innerHTML=h;
}

/* ---- оборачивание функций движка ---- */
if(typeof window.renderDeck==='function'){
  var _rd=window.renderDeck;
  window.renderDeck=function(){ var r=_rd.apply(this,arguments); try{decorateDeck();}catch(e){} return r; };
}
if(typeof window.openLib==='function'){
  var _ol=window.openLib;
  window.openLib=function(k){ var r=_ol.apply(this,arguments); try{
    var s=S(); var L=s&&s.lenses&&s.lenses[k]; var cl=clarityOf(L?L.uses:0);
    var el=document.getElementById('libEl');
    if(el) el.textContent=el.textContent+' \u00b7 линза: '+cl.name+(L&&L.uses?(' ('+L.uses+' исп.)'):' (не раскрыта)');
    var alv=1; try{if(window.AwaraAscension&&AwaraAscension.level) alv=AwaraAscension.level(k);}catch(e){}
    var lvn=(window._LV_NAMES&&window._LV_NAMES[alv])||'';
    var imm=document.getElementById('libImmersion');
    if(imm){
      imm.style.display='block';
      var it=document.getElementById('libImmText');
      if(it) it.textContent=(lvn?lvn.charAt(0).toUpperCase()+lvn.slice(1)+' · ':'')+'L'+alv+'/6 — '+(IMM_DESC[alv]||'');
      var lad=document.getElementById('libImmLad');
      if(lad){ var h=''; for(var b=1;b<=6;b++){ var op=b<=alv?(0.32+b*0.108).toFixed(2):'0.12'; h+='<i style="opacity:'+op+'"></i>'; } lad.innerHTML=h; }
    }
    var cx=codexMx(k);
    var cbtn=document.getElementById('libCodex');
    if(cbtn){
      if(cx&&cx.id){
        cbtn.style.display='';
        cbtn.textContent='\u041a\u043e\u0434\u0435\u043a\u0441 \u00b7 '+cx.name;
        cbtn.onclick=function(){ try{ closeLib(); if(window.openCodex) openCodex(cx.id); }catch(e){} };
      } else { cbtn.style.display='none'; }
    }
    if(cx&&cx.visual_code){
      var desc=document.getElementById('libDesc');
      if(desc) desc.textContent=(MATRIX[k]&&MATRIX[k][2]?MATRIX[k][2]+' ':'')+'\u0412\u0438\u0437\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u043e\u0434 \u043a\u043e\u0434\u0435\u043a\u0441\u0430: '+cx.visual_code+'.';
    }
  }catch(e){} return r; };
}
if(typeof window.renderIstok==='function'){
  var _ri=window.renderIstok;
  window.renderIstok=function(){ var r=_ri.apply(this,arguments); try{ensurePortrait();renderPortrait();}catch(e){} return r; };
}

/* ---- перехват кнопки «Прожито»: считаем линзы ДО очистки mats ---- */
try{
  var lb=document.getElementById('liveBtn');
  if(lb){
    var prev=lb.onclick;
    lb.onclick=function(ev){
      try{ var s=S(); recordUses(s?(s.mats||[]).slice():[], (typeof lightVal==='function'?lightVal():0)); }catch(e){}
      if(typeof prev==='function') return prev.call(this,ev);
    };
  }
}catch(e){}

/* ---- первичный прогон (init движка уже отработал) ---- */
try{
  window.AwaraLens={
    orbSrc:function(key,tier){ var slug=slugOf(key); if(!slug) return null; return 'hero_orbs/'+slug+'.webp'; },
    setOrbImg:function(el,src){ try{ setOrbImg(el,src); }catch(e){} },
    clarityTier:function(key){ try{ var s=S(); var L=s&&s.lenses&&s.lenses[key]; return clarityOf(L?L.uses:0).tier; }catch(e){ return 0; } },
    ready:function(){ return !!CARDS_BY_MATRIX; },
    whenReady:function(cb){ if(typeof cb!=='function') return; if(CARDS_BY_MATRIX){ try{cb();}catch(e){} } else { (_readyCbs||(_readyCbs=[])).push(cb); } },
    repaintOrb:function(){ try{ paintHeroOrb(); }catch(e){} },
    slugFor:function(key){ try{ return slugOf(key); }catch(e){ return null; } },
    scoreTextLenses:scoreTextLenses,
    applyTextResonance:applyTextResonance,
    proposeTextResonance:proposeTextResonance,
    renderResonanceCard:renderResonanceCard,
    commitResonance:commitResonance,
    calibTrust:calibTrust
  };
}catch(e){}
try{ loadCards(); }catch(e){}
try{ ensureLenses(); decorateDeck(); ensurePortrait(); renderPortrait(); }catch(e){}
try{ if(!document.getElementById('awara-hero-orb-style')){ var _hs=document.createElement('style'); _hs.id='awara-hero-orb-style'; _hs.textContent='#orb{overflow:visible}#orb>span{position:relative;z-index:2}#orb .lens-orb-img{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover;z-index:1;box-shadow:inset 0 0 30px rgba(0,0,0,.45)}#orb.has-card>span{opacity:0}'; document.head.appendChild(_hs); } }catch(e){}
function paintHeroOrb(){
  try{
    var orb=document.getElementById('orb'); if(!orb) return;
    var s=(typeof S==='function'?S():null); var mats=(s&&s.mats)||[];
    var key=mats.length?mats[mats.length-1]:null;
    if(!key){ if(orb.getAttribute('data-orb')){ orb.removeAttribute('data-orb'); orb.classList.remove('has-card'); var sp0=orb.querySelector('span'); if(sp0){ sp0.style.display=''; } var im0=orb.querySelector('.lens-orb-img'); if(im0) im0.remove(); } return; }
    var alv=1; try{if(window.AwaraAscension&&AwaraAscension.level) alv=AwaraAscension.level(key);}catch(e){}
    var stamp=key+'|'+alv;
    if(orb.getAttribute('data-orb')===stamp){
      var im0=orb.querySelector('.lens-orb-img'); if(im0){ im0.style.filter=orbFilterForLevel(alv); im0.style.opacity=orbOpacityForLevel(alv); }
      return;
    }
    orb.setAttribute('data-orb',stamp);
    var slug=''; try{ slug=slugOf(key)||''; }catch(e){}
    var fallback=''; try{ fallback=(window.AwaraLens?AwaraLens.orbSrc(key,0):'')||''; }catch(e){}
    var heroSrc=slug?('hero_orbs/'+slug+'.webp'):'';
    function apply(src,alt){ if(!src) return; orb.classList.add('has-card'); var sp=orb.querySelector('span'); if(sp){ sp.style.display='none'; } var old=orb.querySelector('.lens-orb-img'); if(old) old.remove(); var im=document.createElement('img'); im.className='lens-orb-img'; im.alt=''; im.decoding='async'; im.style.filter=orbFilterForLevel(alv); im.style.opacity=orbOpacityForLevel(alv); if(alt){ im.onerror=function(){ if(im.getAttribute('data-fb'))return; im.setAttribute('data-fb','1'); im.src=alt; }; } im.src=src; orb.appendChild(im); }
    if(heroSrc){ apply(heroSrc,fallback); }
    else { apply(fallback); }
    try{ var _stl=(window.LENS_STYLE&&slug)?window.LENS_STYLE[slug]:null; if(_stl&&_stl.palette&&_stl.palette[0]){ orb.style.boxShadow='0 0 40px '+_stl.palette[0]+',0 0 16px '+(_stl.palette[1]||_stl.palette[0]); } }catch(e){}
  }catch(e){}
}
try{ paintHeroOrb(); }catch(e){}
setTimeout(function(){try{paintHeroOrb();}catch(e){}},800);
setTimeout(function(){try{paintHeroOrb();}catch(e){}},2200);
setInterval(function(){try{paintHeroOrb();}catch(e){}},3000);
try{
  var _deckEl=document.getElementById('deck')||document.querySelector('.deck');
  if(_deckEl&&typeof MutationObserver!=='undefined'){
    var _mo=new MutationObserver(function(){ try{decorateDeck();}catch(e){} });
    _mo.observe(_deckEl,{childList:true});
  }
}catch(e){}

})();
