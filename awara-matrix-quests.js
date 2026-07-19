/* ============================================================
   AWARA · MATRIX QUESTS v2 — AwaraXP integrated
   Замена awara-quests.js. Задания от матрицы: data-driven из
   data/matrix_quests/{slug}.json, 6 уровней сложности, 6 типов
   интерактива, динамические бонусы агентов из кодекса матрицы.
   Аддитивно: канон и STATE-схему не трогаем.
   Грузить ПОСЛЕ: awara-lens.js, awara-lens-levels.js, awara-ascension.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraMatrixQuests && window.__awaraMatrixQuests >= 2) return;
window.__awaraMatrixQuests=2;

/* ---- globals from the engine ---- */
function S(){ try{ return STATE; }catch(e){ return null; } }
function MX(){ try{ return MATRIX; }catch(e){ return null; } }
function MK(){ try{ return MATKEYS; }catch(e){ return []; } }
function saveState(){ try{ if(typeof save==='function') save(); }catch(e){} }
function slugOf(key){ try{ if(window.AwaraLens&&AwaraLens.slugFor) return AwaraLens.slugFor(key); }catch(e){} return null; }
function lensLevel(key){ try{ if(window.AwaraAscension&&AwaraAscension.level) return AwaraAscension.level(key); }catch(e){} return 1; }

/* ---- clarity tiers (from old quests, kept compatible) ---- */
var CLAR=['\u0422\u0443\u0441\u043a\u043b\u0430\u044f','\u041f\u0440\u043e\u044f\u0432\u043b\u0435\u043d\u043d\u0430\u044f','\u0427\u0451\u0442\u043a\u0430\u044f','\u0413\u0440\u0430\u043d\u0451\u043d\u0430\u044f','\u0421\u0438\u044f\u044e\u0449\u0430\u044f'];
function clarityTier(uses){ uses=uses||0; return uses>=12?4:uses>=7?3:uses>=4?2:uses>=1?1:0; }
function ensureLenses(){ var s=S(); if(!s) return; if(!s.lenses||typeof s.lenses!=='object') s.lenses={}; }
function grantLens(k){ var s=S(); if(!s) return; ensureLenses(); var L=s.lenses[k]||(s.lenses[k]={uses:0,xp:0,clarity:0}); L.uses+=1; L.xp+=15; L.clarity=clarityTier(L.uses); }


/* ---- axis/element/window display (v2: for result cards) ---- */
var AXES=['discipline','compassion','clarity','will','devotion','transformation','unity'];
var AXIS_NAME={discipline:'Дисциплина',compassion:'Сострадание',clarity:'Ясность',will:'Воля',devotion:'Преданность',transformation:'Трансформация',unity:'Единство'};
var AXIS_ICON_V2={discipline:'🗡',compassion:'💧',clarity:'👁',will:'🔥',devotion:'🙏',transformation:'♻️',unity:'🌀'};
var ELEM_DISPLAY={earth:{icon:'🜃',name:'Земля',color:'#8B7355'},water:{icon:'🜄',name:'Вода',color:'#4A90D9'},fire:{icon:'🜂',name:'Огонь',color:'#E07020'},air:{icon:'🜁',name:'Воздух',color:'#7ECFC0'},ether:{icon:'✦',name:'Эфир',color:'#B090E0'}};
var GUNA_DISPLAY={tamas:{name:'Тамас',color:'#666',icon:'●'},rajas:{name:'Раджас',color:'#D4A946',icon:'◐'},sattva:{name:'Саттва',color:'#A0E0A0',icon:'○'}};
var WIN_DISPLAY={daimon:{icon:'☽',name:'Даймон',color:'#7b62c9'},locations:{icon:'🗺',name:'Локации',color:'#6BAF6B'},emf:{icon:'⚡',name:'ЭМП',color:'#D4A946'},newmatrix:{icon:'◈',name:'Новая Матрица',color:'#C97B62'},soul:{icon:'◉',name:'Душа',color:'#9D86E0'},daimon_soul:{icon:'☽◉',name:'Даймон+Душа',color:'#8A7AD0'},chronicle:{icon:'📜',name:'Хроника',color:'#C9A84C'},hram:{icon:'🏛',name:'Храм',color:'#FFD27A'},cosmos:{icon:'🌌',name:'Космос',color:'#A0C0FF'},supergame:{icon:'🌟',name:'Супер-Игра',color:'#FFE0A0'}};
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ---- v2 selector: тексты спирали/эха из engine_config.json (spiral_echo) ---- */
function engineCfg(){ try{ return (window.AwaraXP&&AwaraXP.getConfig)?AwaraXP.getConfig():null; }catch(e){ return null; } }
function spiralMsg(sp){
  var c=engineCfg();
  var t=(c&&c.spiral_echo&&c.spiral_echo.spiral&&c.spiral_echo.spiral.message_ru)||'Ты смотрел на это на уровне {prev}. Посмотри теперь.';
  return t.replace('{prev}', sp.level);
}
function echoMsg(e){
  var c=engineCfg();
  var t=(c&&c.spiral_echo&&c.spiral_echo.echo&&c.spiral_echo.echo.message_ru)||'Эхо: ты уже проживал это как «{title}» в линзе {lens}.';
  return t.replace('{title}', e.title||e.archetype||'').replace('{lens}', e.lens||'');
}

/* ---- v2 причины: стихия дня — та же формула, что в awara-quest-selector.js::dailyElement() ---- */
var TYPE_ELEMENT_MQ={do:'Земля',meditate:'Эфир',observe:'Воздух',reflect:'Вода',create:'Огонь',study:'Воздух',ritual:'Огонь'};
function dailyElementMq(){
  var now=new Date();
  var dayOfYear=Math.floor((now-new Date(now.getFullYear(),0,0))/86400000);
  return ['Огонь','Вода','Земля','Воздух','Эфир'][dayOfYear%5];
}

/* ---- quest data cache ---- */
var _cache={}; /* slug -> parsed json */
var _facesCache={}; /* slug -> faces from codex */
var _loading={};

function loadQuestData(slug, cb){
  if(_cache[slug]){ cb(_cache[slug]); return; }
  if(_loading[slug]){ _loading[slug].push(cb); return; }
  _loading[slug]=[cb];
  fetch('data/matrix_quests/'+slug+'.json').then(function(r){
    if(!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function(d){
    _cache[slug]=d;
    (_loading[slug]||[]).forEach(function(fn){ try{fn(d);}catch(e){} });
    delete _loading[slug];
  }).catch(function(e){
    _cache[slug]=null; /* mark as unavailable */
    (_loading[slug]||[]).forEach(function(fn){ try{fn(null);}catch(e2){} });
    delete _loading[slug];
  });
}

function loadFaces(slug, cb){
  if(_facesCache[slug]){ cb(_facesCache[slug]); return; }
  fetch('data/matrices/'+slug+'.json').then(function(r){
    if(!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function(d){
    _facesCache[slug]=d.faces||{};
    cb(_facesCache[slug]);
  }).catch(function(){
    cb({});
  });
}

/* ---- deterministic daily pick ---- */
function dayIndex(){
  var s=S();
  return (s&&s.days)?s.days.length:0;
}

function hashSeed(day, extra){
  var h=day*2654435761+(extra||0);
  h=((h>>>16)^h)*0x45d9f3b;
  h=((h>>>16)^h)*0x45d9f3b;
  h=(h>>>16)^h;
  return Math.abs(h);
}

function pickDayQuests(data, maxLevel){
  if(!data||!data.levels) return [];
  var day=dayIndex();
  var lv=Math.min(maxLevel||1, 6);
  var picks=[];

  /* 1 quest from current level */
  var pool=data.levels[String(lv)];
  if(pool&&pool.length){
    var idx=hashSeed(day, lv*100)%pool.length;
    picks.push({q:pool[idx], lv:lv});
  }

  /* 1-2 from lower levels (reinforcement) */
  var lower=[];
  for(var l=1;l<lv;l++){
    var lpool=data.levels[String(l)];
    if(lpool&&lpool.length){
      for(var j=0;j<lpool.length;j++) lower.push({q:lpool[j],lv:l});
    }
  }
  if(lower.length){
    /* shuffle deterministically */
    lower.sort(function(a,b){ return hashSeed(day,a.q.id?a.q.id.length:0)-hashSeed(day,b.q.id?b.q.id.length:0); });
    /* avoid repeats within week (use id) */
    var usedIds=picks.map(function(p){return p.q.id;});
    var count=lv>=4?2:1;
    for(var k=0;k<lower.length&&picks.length<1+count;k++){
      if(usedIds.indexOf(lower[k].q.id)<0){
        picks.push(lower[k]);
        usedIds.push(lower[k].q.id);
      }
    }
  }

  /* fallback: if only 1 and level 1, fill from same pool */
  if(picks.length<2 && pool && pool.length>1){
    for(var m=0;m<pool.length&&picks.length<3;m++){
      if(picks[0]&&pool[m].id===picks[0].q.id) continue;
      picks.push({q:pool[m], lv:lv});
    }
  }

  return picks;
}

/* ---- reward table ---- */
var LV_REWARD=[0,1,1,2,2,3,4];

/* ---- styles ---- */
function ensureStyles(){
  if(document.querySelector('style[data-mq]')) return;
  var st=document.createElement('style'); st.setAttribute('data-mq','1');
  st.textContent=[
'#matrixQuests .mq-head{font-family:"Cinzel",serif;font-size:17px;color:#fff;margin-bottom:2px}',
'#matrixQuests .mq-sub{font-size:13px;color:var(--muted);margin:4px 0 2px;line-height:1.4}',
'#matrixQuests .mq-progress{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--muted);letter-spacing:.06em;margin:2px 0 12px;text-transform:uppercase}',
'#matrixQuests .mq-item{border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;background:rgba(255,255,255,.025);transition:.25s}',
'#matrixQuests .mq-item:last-child{margin-bottom:0}',

/* v2: result card styles */
'#matrixQuests .mq-result{margin-top:12px;border:1px solid rgba(255,215,0,.25);border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(123,98,201,.04));animation:mqResultIn .5s ease}',
'@keyframes mqResultIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
'#matrixQuests .mq-result-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}',
'#matrixQuests .mq-result-light{font-family:"JetBrains Mono",monospace;font-size:24px;color:#ffd27a;font-weight:bold;text-shadow:0 0 12px rgba(255,210,122,.3)}',
'#matrixQuests .mq-result-window{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;padding:3px 10px;border-radius:6px;border:1px solid}',
'#matrixQuests .mq-result-eval{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}',
'#matrixQuests .mq-result-tag{font-family:"JetBrains Mono",monospace;font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.05)}',
'#matrixQuests .mq-result-axes{margin:8px 0;display:flex;flex-wrap:wrap;gap:4px 12px}',
'#matrixQuests .mq-result-axis{font-size:12px;color:var(--muted)}',
'#matrixQuests .mq-result-axis .val{color:#ffd27a;font-family:"JetBrains Mono",monospace;font-size:11px}',
'#matrixQuests .mq-result-mult{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--muted);opacity:.7;margin-top:4px}',
'#matrixQuests .mq-result-oracle{font-size:13px;color:var(--text,#ece9f5);line-height:1.5;font-style:italic;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)}',
'#matrixQuests .mq-result-sensory{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}',
'#matrixQuests .mq-result-sense{font-size:11px;color:var(--muted);opacity:.8}',
'#matrixQuests .mq-result-shadow{font-size:11px;color:#4ade80;margin-top:4px}',
'#matrixQuests .mq-result-suno{margin-top:8px;font-size:11px;color:var(--muted);border-top:1px solid rgba(255,255,255,.05);padding-top:6px}',
'#matrixQuests .mq-result-suno-btn{background:linear-gradient(120deg,rgba(201,168,76,.18),rgba(160,100,220,.12));border:1px solid rgba(201,168,76,.3);border-radius:8px;padding:5px 12px;color:var(--text,#ece9f5);font-family:"JetBrains Mono",monospace;font-size:10px;cursor:pointer;margin-top:4px;transition:.2s}',
'#matrixQuests .mq-result-suno-btn:hover{border-color:var(--gold);box-shadow:0 2px 8px rgba(201,168,76,.2)}',
'#matrixQuests .mq-item.done{opacity:.55;border-color:var(--gold)}',
'#matrixQuests .mq-top{display:flex;align-items:flex-start;gap:11px}',
'#matrixQuests .mq-chk{width:26px;height:26px;border-radius:8px;border:1.5px solid var(--gold);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:15px;color:#0a0a14;cursor:pointer;transition:.2s;margin-top:2px}',
'#matrixQuests .mq-item.done .mq-chk{background:linear-gradient(120deg,var(--gold),var(--spark))}',
'#matrixQuests .mq-body{flex:1;min-width:0}',
'#matrixQuests .mq-hdr{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
'#matrixQuests .mq-hdr b{font-family:"Cinzel",serif;color:#fff;font-size:15px;font-weight:500}',
'#matrixQuests .mq-lv{font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold);border:1px solid var(--line);border-radius:20px;padding:2px 7px}',
'#matrixQuests .mq-agent{font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.04em;color:var(--muted)}',
'#matrixQuests .mq-text{color:#d7d2e8;font-size:15px;line-height:1.45;margin-top:6px}',
'#matrixQuests .mq-item.done .mq-text{text-decoration:line-through;color:var(--muted)}',
'#matrixQuests .mq-rw{font-family:"JetBrains Mono",monospace;font-size:9.5px;color:var(--gold);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}',
/* interactive: text input */
'#matrixQuests .mq-input{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;color:#ece9f5;padding:8px 10px;font-size:14px;font-family:inherit;margin-top:8px;box-sizing:border-box;outline:none;resize:vertical;min-height:40px}',
'#matrixQuests .mq-input:focus{border-color:var(--gold)}',
/* interactive: timer */
'#matrixQuests .mq-timer{display:flex;align-items:center;gap:10px;margin-top:8px}',
'#matrixQuests .mq-timer-display{font-family:"JetBrains Mono",monospace;font-size:20px;color:var(--spark);min-width:70px;text-align:center}',
'#matrixQuests .mq-timer-btn{background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:10px;color:#ece9f5;padding:6px 14px;font-size:12px;cursor:pointer;font-family:"JetBrains Mono",monospace}',
'#matrixQuests .mq-timer-btn.running{border-color:var(--gold);color:var(--gold)}',
/* interactive: facets */
'#matrixQuests .mq-facets{margin-top:8px;display:flex;flex-direction:column;gap:5px}',
'#matrixQuests .mq-facet{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:10px;cursor:pointer;font-size:13px;color:#d7d2e8;transition:.2s}',
'#matrixQuests .mq-facet.sel{border-color:var(--gold);background:rgba(201,168,76,.08);color:#fff}',
'#matrixQuests .mq-facet-dot{width:14px;height:14px;border-radius:4px;border:1.5px solid var(--gold);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:10px;color:#0a0a14}',
'#matrixQuests .mq-facet.sel .mq-facet-dot{background:linear-gradient(120deg,var(--gold),var(--spark))}',
/* interactive: intent link */
'#matrixQuests .mq-intent-sel{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;color:#ece9f5;padding:8px;font-size:13px;font-family:inherit;margin-top:8px;outline:none}',
/* difficulty buttons */
'#matrixQuests .mq-depth{display:flex;gap:6px;margin-top:8px}',
'#matrixQuests .mq-depth-btn{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:8px;color:var(--muted);padding:4px 10px;font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;transition:.2s}',
'#matrixQuests .mq-depth-btn:hover{border-color:var(--gold);color:var(--gold)}',
/* AI verify area */
'#matrixQuests .mq-verify{margin-top:8px}',
'#matrixQuests .mq-verify-input{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;color:#ece9f5;padding:8px 10px;font-size:14px;font-family:inherit;box-sizing:border-box;outline:none;resize:vertical;min-height:50px}',
'#matrixQuests .mq-verify-input:focus{border-color:var(--gold)}',
'#matrixQuests .mq-verify-btn{background:linear-gradient(120deg,var(--gold),var(--spark));border:none;border-radius:10px;color:#0a0a14;padding:6px 16px;font-size:12px;font-family:"JetBrains Mono",monospace;cursor:pointer;margin-top:6px;text-transform:uppercase;letter-spacing:.04em;font-weight:600}',
'#matrixQuests .mq-verify-btn:disabled{opacity:.5;cursor:wait}',
'#matrixQuests .mq-verdict{margin-top:6px;padding:8px 10px;border-radius:10px;font-size:13px;line-height:1.4}',
'#matrixQuests .mq-verdict.ok{background:rgba(76,201,100,.1);border:1px solid rgba(76,201,100,.3);color:#7de89a}',
'#matrixQuests .mq-verdict.deepen{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);color:var(--gold)}',
'#matrixQuests .mq-verdict.fail{background:rgba(201,76,76,.1);border:1px solid rgba(201,76,76,.3);color:#e89a7d}',
/* bonuses */
'#matrixBonuses .mb-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(201,168,76,.08)}',
'#matrixBonuses .mb-row:last-child{border-bottom:none}',
'#matrixBonuses .mb-name{font-size:14px;color:#d7d2e8}',
'#matrixBonuses .mb-val{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--gold)}',
/* v2 selector: спираль и эхо */
'#matrixQuests .mq-spiral{font-size:12px;color:var(--spark,#ffd27a);font-style:italic;margin-top:6px;opacity:.9}',
'#matrixQuests .mq-echo{font-size:12px;color:var(--violet-soft,#9d86e0);font-style:italic;margin-top:4px;opacity:.85}',
'#matrixQuests .mq-why{font-size:12px;color:var(--muted,#8e88a4);font-style:italic;margin-top:6px;opacity:.85}',
/* v2 arcs: многодневный путь */
'#arcQuests .arc-item,#arcQuests .arc-offer{border:1px solid rgba(201,168,76,.28);border-radius:14px;padding:12px;margin-bottom:10px;background:linear-gradient(160deg,rgba(201,168,76,.06),rgba(255,255,255,.015))}',
'#arcQuests .arc-item:last-child,#arcQuests .arc-offer:last-child{margin-bottom:0}',
'#arcQuests .arc-hdr{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
'#arcQuests .arc-hdr b{font-family:"Cinzel",serif;color:#fff;font-size:15px;font-weight:500}',
'#arcQuests .arc-type{font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold,#c9a84c);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:20px;padding:2px 7px}',
'#arcQuests .arc-meta{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--muted,#8e88a4);letter-spacing:.05em;margin-top:5px;text-transform:uppercase}',
'#arcQuests .arc-prompt{color:#d7d2e8;font-size:14px;line-height:1.45;margin-top:7px}',
'#arcQuests .arc-note{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:10px;color:#ece9f5;padding:8px 10px;font-size:14px;font-family:inherit;margin-top:8px;box-sizing:border-box;outline:none;resize:vertical;min-height:44px}',
'#arcQuests .arc-note:focus{border-color:var(--gold,#c9a84c)}',
'#arcQuests .arc-checkin,#arcQuests .arc-accept{background:linear-gradient(120deg,var(--gold,#c9a84c),var(--spark,#ffd27a));border:none;border-radius:10px;color:#0a0a14;padding:7px 16px;font-size:12px;font-family:"JetBrains Mono",monospace;cursor:pointer;margin-top:8px;text-transform:uppercase;letter-spacing:.04em;font-weight:600}',
'#arcQuests .arc-checkin:disabled{background:rgba(255,255,255,.08);color:var(--muted,#8e88a4);cursor:default}',
/* v2 pilgrimage: задание текущего дня */
'#arcQuests .arc-day{margin-top:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.02)}',
'#arcQuests .arc-day b{font-family:"Cinzel",serif;color:#fff;font-size:13.5px;font-weight:500}',
'#arcQuests .arc-day-text{color:#d7d2e8;font-size:13.5px;line-height:1.45;margin-top:4px}',
'#arcQuests .arc-day-tier{display:block;font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted,#8e88a4);margin-top:5px}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ---- active matrix slug ---- */
function activeSlug(){
  var s=S(); if(!s||!s.mats||!s.mats.length) return null;
  var mk=MK();
  for(var i=0;i<s.mats.length;i++){
    var idx=mk.indexOf(s.mats[i]);
    if(idx>=0){
      var slug=null;
      try{ slug=slugOf(s.mats[i]); }catch(e){}
      if(slug) return {key:s.mats[i], slug:slug, lv:lensLevel(s.mats[i])};
    }
  }
  return null;
}

/* ---- quest state ---- */
function ensureQuestState(){
  var s=S(); if(!s) return;
  if(!s.matQuests) s.matQuests={day:-1, slug:null, items:[], proof:{}};
}

/* ---- render host ---- */
function ensureHost(){
  var ex=document.getElementById('matrixQuests'); if(ex) return ex;
  var plan=document.getElementById('s-plan'); if(!plan) return null;
  /* insert after the addrow for short intents */
  var host=document.createElement('div'); host.id='matrixQuests'; host.className='card awara-glass-card'; host.style.marginTop='18px';
  var addrow=plan.querySelector('.addrow');
  if(addrow){ plan.insertBefore(host, addrow.nextSibling); } else { plan.appendChild(host); }
  return host;
}

/* hide old lens quests if present */
function hideOldQuests(){
  var old=document.getElementById('lensQuests');
  if(old) old.style.display='none';
  /* also prevent old awara-quests.js from re-rendering if it somehow loaded */
  try{ window.__awaraQuests=true; }catch(e){}
}

/* ---- timer state (in-memory, not persisted) ---- */
var _timers={}; /* questId -> {interval, elapsed, target, running} */

function fmtTime(sec){
  var m=Math.floor(sec/60), s=sec%60;
  return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}

/* ---- render ---- */
function render(){
  ensureStyles();
  hideOldQuests();
  var s=S(); if(!s) return;
  ensureQuestState();

  var info=activeSlug();
  if(!info){
    var host=ensureHost();
    if(host) host.innerHTML='<span class="label">\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u043e\u0442 \u043c\u0430\u0442\u0440\u0438\u0446\u044b</span><p class="mq-sub">\u0412\u044b\u0431\u0435\u0440\u0438 \u043b\u0438\u043d\u0437\u0443 \u0432 \u0422\u0438\u0433\u043b\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u043e\u0442 \u043c\u0430\u0442\u0440\u0438\u0446\u044b.</p>';
    return;
  }

  var slug=info.slug;
  var lv=info.lv||1;
  var day=dayIndex();

  /* load quest data, then render */
  loadQuestData(slug, function(data){
    if(!data){
      /* no quest data for this matrix yet — show fallback */
      var host=ensureHost(); if(!host) return;
      var MAT=MX(); var matName=(MAT&&info.key&&MAT[info.key])?info.key:'эта матрица';
      host.innerHTML='<span class="label">\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u043e\u0442 \u043c\u0430\u0442\u0440\u0438\u0446\u044b</span>'
        +'<p class="mq-sub">\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u0434\u043b\u044f \u043c\u0430\u0442\u0440\u0438\u0446\u044b \u00ab'+matName+'\u00bb \u0433\u043e\u0442\u043e\u0432\u044f\u0442\u0441\u044f. \u041f\u043e\u043a\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b: \u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f, \u0422\u0430\u0440\u043e, \u0414\u0430\u043e\u0441\u0441\u043a\u0430\u044f.</p>';
      /* still load faces for bonuses */
      loadFaces(slug, function(faces){ renderBonuses(faces); });
      /* v2 arcs: многодневный путь доступен и без данных линзы */
      try{ renderArcsBlock(slug, lv); }catch(e){}
      return;
    }
    loadFaces(slug, function(faces){
      renderWithData(data, faces, slug, lv, day);
    });
  });
}

/* ---- v2 selector: взвешенная выдача с фолбэком на старую логику ---- */
function regenDayQuests(data, faces, slug, lv, day){
  var s=S(); if(!s) return;
  /* селектор подключён НИЖЕ по файлу (после experience-engine):
     при самом первом рендере его может ещё не быть — дождаться DOMContentLoaded */
  if(!window.AwaraQuestSelector && document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ regenDayQuests(data, faces, slug, lv, day); });
    return;
  }
  function applyItems(items){
    s.matQuests={day:day, slug:slug, items:items, proof:(s.matQuests&&s.matQuests.proof)||{}};
    saveState();
    renderWithData(data, faces, slug, lv, day);
  }
  function fallback(){
    var picks=pickDayQuests(data, lv);
    applyItems(picks.map(function(p){ return {id:p.q.id, lv:p.lv, done:false}; }));
  }
  if(window.AwaraQuestSelector){
    AwaraQuestSelector.init().then(function(){
      return AwaraQuestSelector.pick({slug:slug, maxLevel:lv, count:3});
    }).then(function(res){
      if(!res||!res.length){ fallback(); return; }
      res.forEach(function(r){ try{ AwaraQuestSelector.markServed(r); }catch(e){} });
      applyItems(res.map(function(r){
        return {id:r.quest.id, lv:r.level, done:false,
          spiral_of:r.spiral_of||null,
          echoes:(r.echoes&&r.echoes.length)?r.echoes.slice(0,1):[]};
      }));
    }).catch(function(e){
      console.warn('[MatrixQuests] selector failed, fallback:', e);
      fallback();
    });
  } else fallback();
}

function renderWithData(data, faces, slug, lv, day){
  var s=S(); if(!s) return;
  ensureQuestState();

  /* regenerate quests if day or slug changed */
  if(s.matQuests.day!==day || s.matQuests.slug!==slug){
    regenDayQuests(data, faces, slug, lv, day);
    return;
  }

  var host=ensureHost(); if(!host) return;

  var ui=data.ui||{};
  var title=ui.quests_title||'\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u043e\u0442 \u043c\u0430\u0442\u0440\u0438\u0446\u044b';
  var sub=ui.quests_sub||'';

  var items=s.matQuests.items||[];
  var doneCount=items.filter(function(x){return x.done;}).length;

  var h='<div class="mq-head">'+title+'</div>';
  if(sub) h+='<p class="mq-sub">'+sub+'</p>';
  h+='<div class="mq-progress">\u0412\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e '+doneCount+' / '+items.length+'</div>';

  /* find quest definitions by id */
  var allQ={};
  for(var l=1;l<=6;l++){
    var arr=data.levels[String(l)];
    if(arr) arr.forEach(function(q){ allQ[q.id]=q; });
  }

  items.forEach(function(item, i){
    var q=allQ[item.id];
    if(!q) return;

    var agentName=q.agent;
    if(faces&&faces[q.agent]) agentName=faces[q.agent].split(' \u2014 ')[0]||faces[q.agent];

    var lensKey=null;
    try{
      var mk=MK(); var si=S();
      if(si&&si.mats&&si.mats.length) lensKey=si.mats[0];
    }catch(e){}

    var lvLabel='L'+item.lv;
    /* v2: show axes from quest reward if available */
    var reward='';
    if(q.reward){
      var parts=[];
      for(var ra in q.reward){
        if(AXES.indexOf(ra)>=0 && q.reward[ra]>0){
          parts.push((AXIS_ICON_V2[ra]||'')+' '+(AXIS_NAME[ra]||ra));
        }
      }
      reward=parts.slice(0,3).join(' · ');
    }
    if(!reward) reward='+'+(LV_REWARD[item.lv]||1)+' Света · +чёткость';

    h+='<div class="mq-item'+(item.done?' done':'')+'" data-i="'+i+'" data-qid="'+q.id+'">';
    h+='<div class="mq-top">';
    h+='<div class="mq-chk">'+(item.done?'\u2713':'')+'</div>';
    h+='<div class="mq-body">';
    h+='<div class="mq-hdr"><b>'+q.title+'</b><span class="mq-lv">'+lvLabel+'</span></div>';
    h+='<div class="mq-agent">\u043f\u043e\u043a\u0440\u043e\u0432\u0438\u0442\u0435\u043b\u044c: '+agentName+'</div>';
    h+='<div class="mq-text">'+q.text+'</div>';

    /* v2 selector: \u0441\u043f\u0438\u0440\u0430\u043b\u044c \u0430\u0440\u0445\u0435\u0442\u0438\u043f\u0430 \u0438 \u044d\u0445\u043e-\u043f\u0430\u0440\u0430\u043b\u043b\u0435\u043b\u044c */
    /* \u043e\u0434\u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0430-\u043f\u0440\u0438\u0447\u0438\u043d\u0430 \u0437\u0430 \u0440\u0430\u0437: \u0441\u043f\u0438\u0440\u0430\u043b\u044c > \u0441\u0442\u0438\u0445\u0438\u044f \u0434\u043d\u044f > \u044d\u0445\u043e
       (\u043e\u0442\u0441\u0442\u0430\u044e\u0449\u0430\u044f \u043e\u0441\u044c \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u044c\u043d\u044b\u0435 \u043b\u0438\u043d\u0437\u044b: \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0430 \u0432 \u0438\u0433\u0440\u0435 \u043d\u0435\u0442 \u2014
       setProfile \u043d\u0438\u0433\u0434\u0435 \u043d\u0435 \u0432\u044b\u0437\u044b\u0432\u0430\u0435\u0442\u0441\u044f, awara_onboarding_v1 \u043d\u0438\u043a\u0435\u043c \u043d\u0435 \u043f\u0438\u0448\u0435\u0442\u0441\u044f) */
    if(item.spiral_of){
      h+='<div class="mq-spiral">\ud83c\udf00 '+esc(spiralMsg(item.spiral_of))+'</div>';
    } else if(TYPE_ELEMENT_MQ[q.type]===dailyElementMq()){
      h+='<div class="mq-why">\u2726 \u0421\u0442\u0438\u0445\u0438\u044f \u0434\u043d\u044f \u2014 '+dailyElementMq()+'. \u042d\u0442\u043e\u0442 \u0448\u0430\u0433 \u0437\u0432\u0443\u0447\u0438\u0442 \u0441 \u043d\u0435\u0439 \u0432 \u043b\u0430\u0434.</div>';
    } else if(item.echoes&&item.echoes.length){
      h+='<div class="mq-echo">\u3030 '+esc(echoMsg(item.echoes[0]))+'</div>';
    }

    /* interactive proof area */
    if(!item.done){
      if(q.proof==='text'){
        var saved=(s.matQuests.proof&&s.matQuests.proof[q.id])||'';
        h+='<textarea class="mq-input" data-qid="'+q.id+'" placeholder="\u041d\u0430\u043f\u0438\u0448\u0438 \u0437\u0434\u0435\u0441\u044c\u2026">'+saved+'</textarea>';
      } else if(q.proof==='timer'){
        var mins=q.minutes||5;
        var t=_timers[q.id]||{elapsed:0,target:mins*60,running:false};
        _timers[q.id]=t;
        h+='<div class="mq-timer">';
        h+='<div class="mq-timer-display" id="tmr-'+q.id+'">'+fmtTime(t.target-t.elapsed)+'</div>';
        h+='<button class="mq-timer-btn'+(t.running?' running':'')+'" data-timer="'+q.id+'" data-mins="'+mins+'">'+(t.running?'\u25a0 \u0421\u0442\u043e\u043f':'\u25b6 '+mins+' \u043c\u0438\u043d')+'</button>';
        h+='</div>';
      } else if(q.proof==='facets'&&q.facets){
        var selFacets=(s.matQuests.proof&&s.matQuests.proof[q.id])||[];
        h+='<div class="mq-facets">';
        q.facets.forEach(function(f,fi){
          var isSel=selFacets.indexOf(fi)>=0;
          h+='<div class="mq-facet'+(isSel?' sel':'')+'" data-qid="'+q.id+'" data-fi="'+fi+'">';
          h+='<div class="mq-facet-dot">'+(isSel?'\u2713':'')+'</div>';
          h+='<span>'+f+'</span></div>';
        });
        h+='</div>';
      } else if(q.proof==='intent'){
        var intents=(s.intentions||[]);
        h+='<select class="mq-intent-sel" data-qid="'+q.id+'">';
        h+='<option value="">\u0412\u044b\u0431\u0435\u0440\u0438 \u0434\u043e\u043b\u0433\u043e\u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435\u2026</option>';
        intents.forEach(function(it,ii){
          var txt=(it.text||it.name||it||'').toString();
          if(txt.length>60) txt=txt.slice(0,57)+'\u2026';
          h+='<option value="'+ii+'">'+txt+'</option>';
        });
        h+='</select>';
      }
      /* photo_optional and check: just checkbox */
    }

    /* AI verify area for all undone quests */
    if(!item.done){
      var verifyText=(s.matQuests.proof&&s.matQuests.proof['v_'+q.id])||'';
      h+='<div class="mq-verify" id="verify-'+q.id+'">';
      h+='<textarea class="mq-verify-input" data-qid="'+q.id+'" placeholder="\u041e\u043f\u0438\u0448\u0438 \u0447\u0442\u043e \u0442\u044b \u0441\u0434\u0435\u043b\u0430\u043b\u2026">'+verifyText+'</textarea>';
      h+='<button class="mq-verify-btn" data-i="'+i+'" data-qid="'+q.id+'">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443</button>';
      h+='</div>';
    }

    h+='<div class="mq-rw">'+reward+'</div>';
    /* v2: result card container (filled after quest completion) */
    h+='<div class="mq-result-host" id="mq-result-'+q.id+'" style="display:none"></div>';

    /* depth-switch buttons (only if not done) */
    if(!item.done){
      h+='<div class="mq-depth">';
      if(item.lv>1) h+='<button class="mq-depth-btn" data-i="'+i+'" data-dir="down">\u25bc \u0443\u043f\u0440\u043e\u0441\u0442\u0438\u0442\u044c</button>';
      if(item.lv<6) h+='<button class="mq-depth-btn" data-i="'+i+'" data-dir="up">\u25b2 \u0443\u0433\u043b\u0443\u0431\u0438\u0442\u044c</button>';
      h+='</div>';
    }

    h+='</div></div></div>';
  });

  host.innerHTML=h;

  /* ---- bind events ---- */

  /* checkboxes */
  host.querySelectorAll('.mq-chk').forEach(function(el){
    el.onclick=function(){
      var it=el.closest('.mq-item');
      if(it) completeQuest(parseInt(it.getAttribute('data-i'),10));
    };
  });

  /* text inputs auto-save */
  host.querySelectorAll('.mq-input').forEach(function(el){
    el.oninput=function(){
      var qid=el.getAttribute('data-qid');
      if(!s.matQuests.proof) s.matQuests.proof={};
      s.matQuests.proof[qid]=el.value;
      saveState();
    };
  });

  /* timer buttons */
  host.querySelectorAll('.mq-timer-btn').forEach(function(el){
    el.onclick=function(){ toggleTimer(el.getAttribute('data-timer'), parseInt(el.getAttribute('data-mins'),10)); };
  });

  /* facet toggles */
  host.querySelectorAll('.mq-facet').forEach(function(el){
    el.onclick=function(){
      var qid=el.getAttribute('data-qid');
      var fi=parseInt(el.getAttribute('data-fi'),10);
      if(!s.matQuests.proof) s.matQuests.proof={};
      var arr=s.matQuests.proof[qid]||[];
      var idx=arr.indexOf(fi);
      if(idx>=0) arr.splice(idx,1); else arr.push(fi);
      s.matQuests.proof[qid]=arr;
      saveState();
      render();
    };
  });

  /* intent select */
  host.querySelectorAll('.mq-intent-sel').forEach(function(el){
    el.onchange=function(){
      var qid=el.getAttribute('data-qid');
      if(!s.matQuests.proof) s.matQuests.proof={};
      s.matQuests.proof[qid]=el.value;
      saveState();
    };
  });

  /* depth-switch buttons */
  host.querySelectorAll('.mq-depth-btn').forEach(function(el){
    el.onclick=function(){
      var idx=parseInt(el.getAttribute('data-i'),10);
      var dir=el.getAttribute('data-dir');
      switchDepth(idx, dir, data, slug);
    };
  });

  /* AI verify: save input text */
  host.querySelectorAll('.mq-verify-input').forEach(function(el){
    el.oninput=function(){
      var qid=el.getAttribute('data-qid');
      var s=S(); if(!s||!s.matQuests) return;
      if(!s.matQuests.proof) s.matQuests.proof={};
      s.matQuests.proof['v_'+qid]=el.value;
      saveState();
    };
  });

  /* AI verify: submit button */
  host.querySelectorAll('.mq-verify-btn').forEach(function(el){
    el.onclick=function(){
      var idx=parseInt(el.getAttribute('data-i'),10);
      var qid=el.getAttribute('data-qid');
      verifyQuestAI(idx, qid, data, faces, slug);
    };
  });

  /* dynamic bonuses */
  renderBonuses(faces);

  /* v2 arcs: многодневный путь */
  try{ renderArcsBlock(slug, lv); }catch(e){}
}

/* ---- switch quest difficulty ---- */
function switchDepth(idx, dir, data, slug){
  var s=S(); if(!s||!s.matQuests) return;
  var item=s.matQuests.items[idx];
  if(!item||item.done) return;

  var newLv=dir==='up'?item.lv+1:item.lv-1;
  if(newLv<1||newLv>6) return;

  var pool=data.levels[String(newLv)];
  if(!pool||!pool.length) return;

  /* pick a quest from the new level, avoiding ones already in today's set */
  var usedIds=s.matQuests.items.map(function(x){return x.id;});
  var pick=null;
  var day=dayIndex();
  for(var k=0;k<pool.length;k++){
    var ci=(hashSeed(day, newLv*100+k))%pool.length;
    if(usedIds.indexOf(pool[ci].id)<0){ pick=pool[ci]; break; }
  }
  if(!pick) pick=pool[0]; /* fallback */

  item.id=pick.id;
  item.lv=newLv;
  saveState();

  /* re-render */
  loadFaces(slug, function(faces){
    renderWithData(data, faces, slug, newLv, day);
  });

  try{ if(typeof showToast==='function') showToast(dir==='up'?'\u0423\u0433\u043b\u0443\u0431\u043b\u0435\u043d\u043e \u2192 L'+newLv:'\u0423\u043f\u0440\u043e\u0449\u0435\u043d\u043e \u2192 L'+newLv); }catch(e){}
}

/* ---- timer logic ---- */
function toggleTimer(qid, mins){
  var t=_timers[qid];
  if(!t) t=_timers[qid]={elapsed:0,target:mins*60,running:false};

  if(t.running){
    clearInterval(t.interval);
    t.running=false;
    render();
    return;
  }

  t.running=true;
  t.interval=setInterval(function(){
    t.elapsed++;
    var left=t.target-t.elapsed;
    var disp=document.getElementById('tmr-'+qid);
    if(disp) disp.textContent=fmtTime(Math.max(0,left));
    if(left<=0){
      clearInterval(t.interval);
      t.running=false;
      /* auto-complete quest */
      var s=S(); if(!s||!s.matQuests) return;
      var items=s.matQuests.items||[];
      for(var i=0;i<items.length;i++){
        if(items[i].id===qid&&!items[i].done){
          completeQuest(i);
          return;
        }
      }
    }
  },1000);
  render();
}

/* ---- complete a quest ---- */
/* ---- AI verification ---- */
var AI_PROXY='http://127.0.0.1:8787/v1/chat/completions';

function verifyQuestAI(idx, qid, data, faces, slug){
  var s=S(); if(!s||!s.matQuests) return;
  var item=s.matQuests.items[idx];
  if(!item||item.done) return;

  /* get player's answer text */
  var verifyArea=document.getElementById('verify-'+qid);
  if(!verifyArea) return;
  var textarea=verifyArea.querySelector('.mq-verify-input');
  var btn=verifyArea.querySelector('.mq-verify-btn');
  var answer=(textarea?textarea.value:'').trim();

  if(!answer||answer.length<3){
    showVerdictUI(verifyArea,'fail','\u041d\u0430\u043f\u0438\u0448\u0438 \u0447\u0442\u043e \u0442\u044b \u0441\u0434\u0435\u043b\u0430\u043b, \u0445\u043e\u0442\u044f \u0431\u044b \u043f\u0430\u0440\u0443 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0439.');
    return;
  }

  /* find quest definition */
  var allQ={};
  for(var l=1;l<=6;l++){
    var arr=data.levels[String(l)];
    if(arr) arr.forEach(function(q){ allQ[q.id]=q; });
  }
  var quest=allQ[qid];
  if(!quest) return;

  /* disable button while waiting */
  if(btn){ btn.disabled=true; btn.textContent='\u041f\u0440\u043e\u0432\u0435\u0440\u044f\u044e\u2026'; }

  var sysPrompt='\u0422\u044b \u2014 \u0414\u0430\u0439\u043c\u043e\u043d, \u0434\u0443\u0445\u043e\u0432\u043d\u044b\u0439 \u0441\u043f\u0443\u0442\u043d\u0438\u043a \u0438\u0433\u0440\u043e\u043a\u0430 \u0432 \u0422\u0438\u0433\u0435\u043b\u0435. '
    +'\u041e\u0446\u0435\u043d\u0438 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0447\u0430\u0439 \u0441\u0442\u0440\u043e\u0433\u043e JSON: {"verdict":"done"|"deepen"|"fail","message":"\u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 1-2 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f"}. '
    +'done=\u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e. deepen=\u043f\u043e\u0432\u0435\u0440\u0445\u043d\u043e\u0441\u0442\u043d\u043e, \u043d\u0443\u0436\u043d\u043e \u0443\u0433\u043b\u0443\u0431\u0438\u0442\u044c. fail=\u043d\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0437\u0430\u0434\u0430\u043d\u0438\u044e. '
    +'\u0411\u0443\u0434\u044c \u043c\u044f\u0433\u043a\u0438\u043c \u0438 \u043c\u0443\u0434\u0440\u044b\u043c. \u0415\u0441\u043b\u0438 \u0438\u0433\u0440\u043e\u043a \u0438\u0441\u043a\u0440\u0435\u043d\u043d\u0435 \u0441\u0442\u0430\u0440\u0430\u043b\u0441\u044f \u2014 \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0439. \u041e\u0442\u043a\u043b\u043e\u043d\u044f\u0439 \u0442\u043e\u043b\u044c\u043a\u043e \u044f\u0432\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u043b\u0438\u0437\u043c \u0438\u043b\u0438 \u043d\u0435\u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435.';

  var userMsg='\u0417\u0430\u0434\u0430\u043d\u0438\u0435 (\u043c\u0430\u0442\u0440\u0438\u0446\u0430 \u00ab'+data.matrix_name+'\u00bb, \u0443\u0440\u043e\u0432\u0435\u043d\u044c L'+item.lv+'):\n'
    +'\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a: '+quest.title+'\n'
    +'\u0422\u0435\u043a\u0441\u0442: '+quest.text+'\n\n'
    +'\u041e\u0442\u0432\u0435\u0442 \u0438\u0433\u0440\u043e\u043a\u0430:\n'+answer;

  fetch(AI_PROXY,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'deepseek-chat',
      messages:[
        {role:'system',content:sysPrompt},
        {role:'user',content:userMsg}
      ],
      temperature:0.3,
      max_tokens:200
    })
  }).then(function(r){ return r.json(); })
  .then(function(resp){
    var text='';
    try{ text=resp.choices[0].message.content; }catch(e){ text=''; }
    var verdict='done', message='';
    try{
      /* parse JSON from response */
      var m=text.match(/\{[\s\S]*\}/);
      if(m){
        var parsed=JSON.parse(m[0]);
        verdict=parsed.verdict||'done';
        message=parsed.message||'';
      }
    }catch(e){
      /* fallback: if AI returned plain text, accept it */
      verdict='done';
      message=text.slice(0,150);
    }

    if(btn){ btn.disabled=false; btn.textContent='\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443'; }

    if(verdict==='done'){
      showVerdictUI(verifyArea,'ok',message||'\u0414\u0430\u0439\u043c\u043e\u043d \u043f\u0440\u0438\u043d\u044f\u043b \u0437\u0430\u0434\u0430\u043d\u0438\u0435.');
      setTimeout(function(){ completeQuest(idx); },1200);
    } else if(verdict==='deepen'){
      showVerdictUI(verifyArea,'deepen',message||'\u0414\u0430\u0439\u043c\u043e\u043d \u043f\u0440\u043e\u0441\u0438\u0442 \u0443\u0433\u043b\u0443\u0431\u0438\u0442\u044c\u0441\u044f.');
    } else {
      showVerdictUI(verifyArea,'fail',message||'\u041d\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0437\u0430\u0434\u0430\u043d\u0438\u044e.');
    }
  })
  .catch(function(e){
    if(btn){ btn.disabled=false; btn.textContent='\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443'; }
    /* fallback to manual checkbox if proxy unavailable */
    showVerdictUI(verifyArea,'deepen','\u0418\u0418 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d. \u041d\u0430\u0436\u043c\u0438 \u0433\u0430\u043b\u043e\u0447\u043a\u0443 \u0434\u043b\u044f \u0440\u0443\u0447\u043d\u043e\u0433\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f.');
  });
}

function showVerdictUI(container, type, message){
  var old=container.querySelector('.mq-verdict');
  if(old) old.remove();
  var el=document.createElement('div');
  el.className='mq-verdict '+type;
  el.textContent=message;
  container.appendChild(el);
}

function completeQuest(i, playerText){
  var s=S(); if(!s) return;
  ensureQuestState();
  var item=s.matQuests.items[i];
  if(!item||item.done) return;
  item.done=true;

  /* grant lens clarity — higher quest level = more XP */
  var info=activeSlug();
  if(info){
    var grantCount=item.lv||1;
    for(var gi=0;gi<grantCount;gi++) grantLens(info.key);
  }

  /* v2: get player text from proof areas */
  if(!playerText){
    var pf=s.matQuests.proof||{};
    playerText = pf['v_'+item.id] || pf[item.id] || '';
  }

  /* v2: find quest definition from cache */
  var quest=null;
  var slug=s.matQuests.slug;
  if(_cache[slug] && _cache[slug].levels){
    for(var l=1;l<=6&&!quest;l++){
      var arr=_cache[slug].levels[String(l)];
      if(arr) for(var j=0;j<arr.length;j++){
        if(arr[j].id===item.id){ quest=arr[j]; break; }
      }
    }
  }

  /* v2: check daily cap */
  if(window.AwaraXP && window.AwaraXP.canDoQuest && !window.AwaraXP.canDoQuest()){
    item.done=false;
    try{if(typeof showToast==='function') showToast('Дневной лимит квестов исчерпан. Вернись завтра.');}catch(e){}
    render();
    return;
  }

  /* v2 selector: зачёт архетипа — питает спираль и эхо */
  try{
    if(window.AwaraQuestSelector && quest){
      AwaraQuestSelector.markCompleted({slug:slug, level:item.lv||1, quest:quest});
    }
  }catch(e){}

  /* v2: call AwaraXP.processExperience() */
  if(window.AwaraXP && window.AwaraXP.__ready && quest){
    var lensSlug=slug;
    var lensDepth=item.lv||1;
    window.AwaraXP.processExperience(
      quest,
      playerText||'',
      lensSlug,
      lensDepth,
      {}
    ).then(function(result){
      _saveAndShowResult(item, quest, slug, result);
    }).catch(function(e){
      console.warn('[MatrixQuests] AwaraXP error, fallback:', e);
      _fallbackComplete(item, slug);
    });
  } else {
    /* Engine not loaded — old fallback */
    _fallbackComplete(item, slug);
  }
}

function _fallbackComplete(item, slug){
  var s=S(); if(!s) return;
  var reward=LV_REWARD[item.lv]||1;
  s.lightBonus=(s.lightBonus||0)+reward;
  
  var allDone=(s.matQuests.items||[]).every(function(x){return x.done;});
  if(allDone) s.lightBonus+=2;
  
  saveState();
  render();
  _refreshRelatedUI();
  
  var data=_cache[slug];
  var toast=(data&&data.ui&&data.ui.done_toast)||'Задание выполнено';
  if(allDone) toast='Все задания дня выполнены · +Свет и чёткость';
  try{if(typeof showToast==='function') showToast(toast);}catch(e){}
}

function _saveAndShowResult(item, quest, slug, result){
  var s=S(); if(!s) return;
  
  /* all done bonus → extra light via lightBonus (on top of AwaraXP) */
  var allDone=(s.matQuests.items||[]).every(function(x){return x.done;});
  if(allDone) s.lightBonus=(s.lightBonus||0)+2;
  
  /* persist quest result */
  if(!s.matQuests.proof) s.matQuests.proof={};
  s.matQuests.proof['result_'+item.id]={
    light:result?result.finalLight:null,
    window:result?(result.window||{}).id:null,
    ts:Date.now()
  };
  
  saveState();
  
  /* dispatch event */
  try{window.dispatchEvent(new CustomEvent('awara:quest-done',{
    detail:{quest:quest,verified:true,xpResult:result,source:'matrix'}
  }));}catch(e){}
  
  /* show result card */
  if(result){
    _showMatrixResult(quest, item, result, slug);
  }
  
  /* refresh UI after delay */
  setTimeout(function(){
    render();
    _refreshRelatedUI();
  }, 3000);
  
  var data=_cache[slug];
  var toast=(data&&data.ui&&data.ui.done_toast)||'Задание выполнено';
  if(allDone) toast='Все задания дня выполнены ✦ Свет начислен';
  try{if(typeof showToast==='function') showToast(toast);}catch(e){}
}

function _refreshRelatedUI(){
  try{if(typeof window.renderDeck==='function'){var ms=document.getElementById('mSearch');window.renderDeck(ms?ms.value:'');}}catch(e){}
  try{if(typeof window.renderIstok==='function') window.renderIstok();}catch(e){}
  try{if(typeof updateLight==='function') updateLight();}catch(e){}
  try{if(window.AwaraAscension&&AwaraAscension.paint) AwaraAscension.paint();}catch(e){}
}

/* ═══════════════════════════════════════════
   v2: RESULT CARD for matrix quests
   ═══════════════════════════════════════════ */

function _showMatrixResult(quest, item, result, slug){
  /* Find the result host in the DOM */
  var host=document.getElementById('mq-result-'+quest.id);
  if(!host){
    /* fallback: find the quest item and append */
    var qItem=document.querySelector('.mq-item[data-qid="'+quest.id+'"]');
    if(qItem){
      host=document.createElement('div');
      host.id='mq-result-'+quest.id;
      qItem.appendChild(host);
    } else return;
  }

  var ev=result.evaluation||{};
  var win=result.window||{};
  var wd=WIN_DISPLAY[win.id]||{icon:'☀',name:win.id||'?',color:'#ffd27a'};
  var ed=ELEM_DISPLAY[ev.element]||{icon:'?',name:ev.element||'?',color:'#aaa'};
  var gd=GUNA_DISPLAY[ev.guna]||{icon:'?',name:ev.guna||'?',color:'#aaa'};

  var h='<div class="mq-result">';
  
  /* Header: light + window */
  h+='<div class="mq-result-header">';
  h+='<span class="mq-result-light">☀ +'+result.finalLight+'</span>';
  h+='<span class="mq-result-window" style="color:'+wd.color+';border-color:'+wd.color+'40">'+wd.icon+' '+wd.name+' (Мера '+win.mera+')</span>';
  h+='</div>';
  
  /* Eval tags */
  h+='<div class="mq-result-eval">';
  h+='<span class="mq-result-tag" style="color:'+ed.color+'">'+ed.icon+' '+ed.name+'</span>';
  h+='<span class="mq-result-tag" style="color:'+gd.color+'">'+gd.icon+' '+gd.name+'</span>';
  h+='<span class="mq-result-tag">Лока '+ev.loka+'</span>';
  h+='<span class="mq-result-tag">Качество '+(ev.quality_score*100|0)+'%</span>';
  h+='</div>';
  
  /* Axes gained */
  var axes=result.axes_gained||{};
  var axisHtml='';
  for(var ax in axes){
    if(AXES.indexOf(ax)>=0 && axes[ax]>0){
      var an=AXIS_NAME[ax]||ax;
      var ai=AXIS_ICON_V2[ax]||'';
      axisHtml+='<span class="mq-result-axis">'+ai+' '+an+' <span class="val">+'+axes[ax]+'</span></span>';
    }
  }
  if(axisHtml) h+='<div class="mq-result-axes">'+axisHtml+'</div>';
  
  /* Multiplier breakdown */
  var md=result.multiplier_details||{};
  var mp=[];
  if(md.lens_depth) mp.push('глубина×'+md.lens_depth.value);
  if(md.daily_energy) mp.push('энергия×'+md.daily_energy.value);
  if(md.guna) mp.push(gd.name+'×'+md.guna.value);
  if(md.quality) mp.push('качество×'+md.quality.value);
  if(md.shadow_bonus) mp.push('тень×1.1');
  if(md.creativity) mp.push('творч.×'+md.creativity.value);
  h+='<div class="mq-result-mult">Множитель: '+mp.join(' · ')+' = ×'+result.multiplier+'</div>';
  
  /* Shadow */
  if(result.shadow_reduced){
    h+='<div class="mq-result-shadow">🌿 Тень «'+result.shadow_reduced+'» -0.02</div>';
  }
  
  /* Sensory */
  var sens=result.sensory;
  if(sens){
    h+='<div class="mq-result-sensory">';
    if(sens.sound)  h+='<span class="mq-result-sense">🔊 '+esc(sens.sound)+'</span>';
    if(sens.visual) h+='<span class="mq-result-sense">👁 '+esc(sens.visual)+'</span>';
    if(sens.breath) h+='<span class="mq-result-sense">🌬 '+esc(sens.breath)+'</span>';
    if(sens.body)   h+='<span class="mq-result-sense">🤸 '+esc(sens.body)+'</span>';
    h+='</div>';
  }
  
  /* Oracle reflection */
  if(window.AwaraXP && window.AwaraXP.getOracleReflection){
    var domAxis=AXIS_NAME[result.element_axes&&result.element_axes.primary||'clarity']||'';
    var sensText=sens&&sens.visual?sens.visual:'';
    var agentVoice='';
    try{
      var s=S();if(s&&s.daimon&&s.daimon.name) agentVoice=s.daimon.name;
    }catch(e){}
    var oracle=window.AwaraXP.getOracleReflection(quest.type||'do',quest,domAxis,sensText,agentVoice);
    if(oracle) h+='<div class="mq-result-oracle">☽ '+esc(oracle)+'</div>';
  }
  
  /* Suno prompt */
  if(window.AwaraXP && window.AwaraXP.buildSunoPrompt){
    var tradCulture=slug||'vedic';
    var sunoPrompt=window.AwaraXP.buildSunoPrompt(quest.type||'do', item.lv||1, tradCulture);
    if(sunoPrompt){
      h+='<div class="mq-result-suno">';
      h+='<span>🎵 Сгенерировать музыку к заданию:</span>';
      h+='<button class="mq-result-suno-btn" data-prompt="'+esc(sunoPrompt)+'">🎧 Suno Prompt</button>';
      h+='</div>';
    }
  }
  
  h+='</div>';
  
  host.innerHTML=h;
  host.style.display='';
  
  /* Suno button click — copy to clipboard */
  var sunoBtn=host.querySelector('.mq-result-suno-btn');
  if(sunoBtn){
    sunoBtn.onclick=function(){
      var prompt=sunoBtn.getAttribute('data-prompt');
      if(prompt && navigator.clipboard){
        navigator.clipboard.writeText(prompt).then(function(){
          sunoBtn.textContent='✅ Скопировано';
          setTimeout(function(){ sunoBtn.textContent='🎧 Suno Prompt'; }, 2000);
        });
      }
    };
  }
}

/* ═══════════════════════════════════════════
   v2 arcs: МНОГОДНЕВНЫЙ ПУТЬ (L5+)
   Карточка активной арки + предложение новой из pickArc().
   ═══════════════════════════════════════════ */

function arcTypeName(t){
  var c=engineCfg();
  var at=c&&c.quest_arcs&&c.quest_arcs.arc_types;
  if(at&&at[t]&&at[t].name_ru) return at[t].name_ru;
  return t||'';
}

function ensureArcHost(){
  var ex=document.getElementById('arcQuests'); if(ex) return ex;
  var mq=document.getElementById('matrixQuests');
  if(!mq||!mq.parentNode) return null;
  var box=document.createElement('div');
  box.id='arcQuests'; box.className='card awara-glass-card';
  box.style.marginTop='18px'; box.style.display='none';
  mq.parentNode.insertBefore(box, mq);
  return box;
}

/* v2 pilgrimage: days[] исходной арки по questId.
   AwaraArcs.start() не переносит days из сида — на активной арке
   поле days занято картой чекинов (dateISO -> note). */
var _arcDaysMap=null,_arcDaysLoading=false;
function arcDaysFor(questId){
  if(_arcDaysMap) return _arcDaysMap[questId]||null;
  if(!_arcDaysLoading){
    _arcDaysLoading=true;
    fetch('data/arc_quests_seed.json').then(function(r){ return r.ok?r.json():[]; }).then(function(list){
      _arcDaysMap={};
      (list||[]).forEach(function(a){ if(a.id&&a.days&&a.days.length) _arcDaysMap[a.id]=a.days; });
      try{ var inf=activeSlug(); if(inf) renderArcsBlock(inf.slug, inf.lv||1); }catch(e){}
    }).catch(function(){ _arcDaysMap={}; });
  }
  return null;
}

function arcCardHtml(arc){
  var st=null;
  try{ st=AwaraArcs.statusOf(arc.id); }catch(e){}
  var can=!!(st&&st.canCheckinToday);
  var skipsLeft=Math.max(0,(AwaraArcs.config.allowedSkips||0)-(arc.missed||0));
  var h='<div class="arc-item" data-arc="'+esc(arc.id)+'">';
  h+='<div class="arc-hdr"><b>'+esc(arc.title)+'</b><span class="arc-type">'+esc(arcTypeName(arc.arcType))+'</span></div>';
  h+='<div class="arc-meta">день '+arc.doneCount+' из '+arc.duration+' · пропусков осталось: '+skipsLeft+'</div>';
  h+='<div class="arc-prompt">'+esc(arc.checkpointPrompt)+'</div>';
  var pdays=arcDaysFor(arc.questId);
  if(pdays && arc.doneCount<pdays.length){
    var pd=pdays[arc.doneCount];
    h+='<div class="arc-day"><b>'+esc(pd.title)+'</b>';
    h+='<div class="arc-day-text">'+esc(pd.text)+'</div>';
    h+='<span class="arc-day-tier">ярус '+esc(pd.tier)+'</span></div>';
  }
  h+='<textarea class="arc-note" placeholder="Пара строк о прожитом дне…"></textarea>';
  h+='<button class="arc-checkin"'+(can?'':' disabled')+' data-arc="'+esc(arc.id)+'">'+(can?'Отметить день':'Сегодня уже отмечено')+'</button>';
  h+='</div>';
  return h;
}

function arcOfferHtml(a){
  var h='<div class="arc-offer">';
  h+='<div class="arc-hdr"><b>'+esc(a.title)+'</b><span class="arc-type">'+esc(arcTypeName(a.arc_type))+'</span></div>';
  h+='<div class="arc-meta">'+a.duration_days+' дн. · L'+a.level+'</div>';
  h+='<div class="arc-prompt">'+esc(a.text||'')+'</div>';
  h+='<button class="arc-accept">Принять путь</button>';
  h+='</div>';
  return h;
}

function renderArcsBlock(slug, lv){
  if(!window.AwaraArcs) return;
  /* lv из renderWithData может быть глубиной квеста (switchDepth) —
     для гейта арок берём фактический уровень линзы */
  try{ var inf=activeSlug(); if(inf&&inf.slug===slug) lv=inf.lv||lv; }catch(e){}
  var host=ensureArcHost(); if(!host) return;
  var active=[];
  try{ active=AwaraArcs.active(); }catch(e){}
  var h='<span class="label">Многодневный путь</span>';
  active.forEach(function(a){ h+=arcCardHtml(a); });
  h+='<div id="arcOffer"></div>';
  host.innerHTML=h;
  host.style.display=active.length?'':'none';

  /* чекин активной арки */
  host.querySelectorAll('.arc-checkin').forEach(function(btn){
    btn.onclick=function(){
      var id=btn.getAttribute('data-arc');
      var it=btn.closest('.arc-item');
      var ta=it?it.querySelector('.arc-note'):null;
      var r=AwaraArcs.checkin(id, ta?ta.value.trim():'');
      if(r&&!r.ok&&r.reason==='already_today'){
        try{ if(typeof showToast==='function') showToast('Сегодня уже отмечено'); }catch(e){}
      }
      renderArcsBlock(slug, lv);
    };
  });

  /* предложение новой арки: уровень линзы 5+ и меньше 2 активных */
  var maxAct=(AwaraArcs.config&&AwaraArcs.config.maxActive)||2;
  if(lv>=5 && active.length<maxAct && window.AwaraQuestSelector){
    AwaraQuestSelector.init().then(function(){
      var offer=AwaraQuestSelector.pickArc({slug:slug, maxLevel:lv});
      var od=document.getElementById('arcOffer');
      if(!offer||!od) return;
      /* защита от дубля id (questId@дата): если арка уже стартовала сегодня
         (в т.ч. сорвана сегодня) — AwaraArcs.checkin по этому id попадёт в старую
         запись, поэтому сегодня её повторно не предлагаем */
      var d=new Date();
      var dupId=offer.id+'@'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      var all=[]; try{ all=AwaraArcs.all(); }catch(e){}
      for(var di=0;di<all.length;di++) if(all[di].id===dupId) return;
      od.innerHTML=arcOfferHtml(offer);
      host.style.display='';
      var btn=od.querySelector('.arc-accept');
      if(btn) btn.onclick=function(){
        var r=AwaraArcs.start(offer);
        if(r&&r.ok){
          try{ if(typeof showToast==='function') showToast('Путь принят: '+offer.title); }catch(e){}
        }
        renderArcsBlock(slug, lv);
      };
    }).catch(function(e){});
  }
}

/* события арок → тост со светом (общий showToast Тигеля) */
(function(){
  function t(msg){ try{ if(typeof showToast==='function') showToast(msg); }catch(e){} }
  window.addEventListener('awara:arc-checkin', function(e){
    var d=(e&&e.detail)||{};
    if(d.arc&&d.arc.status==='completed') return; /* completed покажет свой тост */
    t('Путь: день отмечен · ☀ +'+(d.light||0));
  });
  window.addEventListener('awara:arc-completed', function(e){
    var d=(e&&e.detail)||{};
    t('Путь «'+((d.arc&&d.arc.title)||'')+'» завершён ✦ ☀ +'+(d.light||0));
  });
  window.addEventListener('awara:arc-broken', function(e){
    var d=(e&&e.detail)||{};
    t('Путь «'+((d.arc&&d.arc.title)||'')+'» прерван · частичный зачёт ☀ +'+(d.light||0));
  });
})();

/* ---- dynamic agent bonuses ---- */
var BONUS_MAP={
  shakti:{label:'\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435', val:'+3 \u0421\u0432\u0435\u0442\u0430'},
  sarasvati:{label:'\u0437\u043d\u0430\u043d\u0438\u0435', val:'+2 \u0421\u0432\u0435\u0442\u0430'},
  lakshmi:{label:'\u0438\u0437\u043e\u0431\u0438\u043b\u0438\u0435', val:'+2 \u0421\u0432\u0435\u0442\u0430'},
  shanti:{label:'\u043f\u043e\u043a\u043e\u0439', val:'+2 \u0421\u0432\u0435\u0442\u0430'},
  iskra:{label:'\u0440\u0438\u0442\u043c', val:'+1 \u0441\u0435\u0440\u0438\u044f'}
};

function renderBonuses(faces){
  /* find or create bonuses block */
  var plan=document.getElementById('s-plan'); if(!plan) return;

  /* hide original static bonuses */
  var allCards=plan.querySelectorAll('.card.awara-glass-card');
  allCards.forEach(function(card){
    if(card.id==='matrixQuests'||card.id==='matrixBonuses') return;
    var lbl=card.querySelector('.label');
    if(lbl&&lbl.textContent.indexOf('\u0411\u043e\u043d\u0443\u0441\u044b \u0430\u0433\u0435\u043d\u0442\u043e\u0432')>=0){
      card.style.display='none';
    }
  });

  var box=document.getElementById('matrixBonuses');
  if(!box){
    box=document.createElement('div');
    box.id='matrixBonuses';
    box.className='card awara-glass-card';
    box.style.marginTop='12px';
    var host=document.getElementById('matrixQuests');
    if(host&&host.nextSibling) plan.insertBefore(box, host.nextSibling);
    else if(host) plan.appendChild(box);
    else return;
  }

  var h='<span class="label">\u0411\u043e\u043d\u0443\u0441\u044b \u043f\u043e\u043a\u0440\u043e\u0432\u0438\u0442\u0435\u043b\u0435\u0439</span>';
  var keys=Object.keys(BONUS_MAP);
  keys.forEach(function(k){
    var b=BONUS_MAP[k];
    var name=k;
    if(faces&&faces[k]){
      name=faces[k].split(' \u2014 ')[0]||faces[k];
    }
    h+='<div class="mb-row"><span class="mb-name">'+name+' \u00b7 '+b.label+'</span><b class="mb-val">'+b.val+'</b></div>';
  });

  box.innerHTML=h;
}

/* ---- hook into Plan screen navigation ---- */
try{
  document.querySelectorAll('.nav button[data-nav="plan"]').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(function(){ try{render();}catch(e){} }, 60); });
  });
}catch(e){}

if(typeof window.go==='function'){
  var _origGo=window.go;
  window.go=function(name){
    var r=_origGo.apply(this,arguments);
    if(name==='plan'){ try{render();}catch(e){} }
    return r;
  };
}

/* ---- export for aiContext augmentation ---- */
window.AwaraMatrixQuests={
  current:function(){
    var s=S(); if(!s||!s.matQuests) return null;
    return s.matQuests;
  },
  activeSlug:activeSlug,
  render:render
};


/* ═══════════════════════════════════════════
   v2: OVERNIGHT FLOW TRIGGER
   Auto-trigger on load if new day detected
   ═══════════════════════════════════════════ */

(function checkOvernight(){
  try{
    var KEY='awara_last_session_date';
    var today=new Date().toISOString().split('T')[0]; /* YYYY-MM-DD */
    var last=localStorage.getItem(KEY);
    localStorage.setItem(KEY, today);
    
    if(last && last !== today && window.AwaraXP && window.AwaraXP.overnightFlow){
      console.log('[MatrixQuests v2] New day detected ('+last+' → '+today+'), running overnight flow...');
      window.AwaraXP.overnightFlow();
    }
  }catch(e){
    console.warn('[MatrixQuests v2] Overnight check failed:', e);
  }
})();

/* ---- initial render ---- */
try{ render(); }catch(e){}

})();
