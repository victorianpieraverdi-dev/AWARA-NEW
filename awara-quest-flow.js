/* ============================================================
   AWARA · QUEST FLOW v2 — квесты + Unified Experience Engine
   Данные: data/all_location_quests.json (3033 квеста).
   При раскрытии карточки локации на карте восхождения показывает
   цепочку q1→q2→q3 с proof-виджетами.
   Даймон (ИИ) мягко проверяет честность игрока.
   
   v2: при завершении квеста вызывает AwaraXP.processExperience()
       → показывает карточку результата (свет, окно, оси, оракул, сенсорика)
   ============================================================ */
(function(){
'use strict';
if(window.__awaraQuestFlow && window.__awaraQuestFlow >= 2) return;
window.__awaraQuestFlow = 2;

var QUESTS=null, LOADING=false;
var STORE_KEY='awara_quest_progress';

/* ── helpers ── */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;'); }
function S(){ try{ return STATE; }catch(e){ return null; } }
function dname(){ try{ var s=S(); if(s&&s.daimon&&s.daimon.name) return s.daimon.name; }catch(e){} return 'Даймон'; }
function dtrust(){ try{ var s=S(); if(typeof s.trust==='number') return s.trust; }catch(e){} return 0; }
function lng(){ try{ if(typeof window.awaraLang==='function') return window.awaraLang(); }catch(e){} return 'ru'; }
function L(ru,en){ return lng()==='en'?en:ru; }

/* current lens info from state */
function currentLens(){
  try{
    var s=S();
    if(s && s.currentLens) return {slug:s.currentLens, depth:s.lensDepth||1};
  }catch(e){}
  return {slug:'vedic', depth:1};
}

/* sum axes from reward object */
function rewardSum(reward){
  if(!reward) return 0;
  var AXES=['discipline','compassion','clarity','will','devotion','transformation','unity'];
  var sum=0;
  for(var i=0;i<AXES.length;i++){
    sum += (reward[AXES[i]]||0);
  }
  return sum || (reward.xp||0) || 2; /* fallback to old xp or minimum */
}

/* ── localStorage progress ── */
function loadProgress(){
  try{ var r=localStorage.getItem(STORE_KEY); return r?JSON.parse(r):{}; }catch(e){ return {}; }
}
function saveProgress(p){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(p)); }catch(e){}
}

/* ── load quests data ── */
function loadQuests(cb){
  if(QUESTS){ cb(); return; }
  if(LOADING) return;
  LOADING=true;
  fetch('data/all_location_quests.json').then(function(r){ return r.json(); }).then(function(j){
    QUESTS=Array.isArray(j)?j:[]; LOADING=false; cb();
  }).catch(function(){ LOADING=false; cb(); });
}

/* ── quests for a location ── */
function questsFor(locId){
  if(!QUESTS) return [];
  var out=[];
  for(var i=0;i<QUESTS.length;i++){
    if(QUESTS[i].location_id===locId) out.push(QUESTS[i]);
  }
  out.sort(function(a,b){ return a.step-b.step; });
  return out;
}

/* ── proof type labels & icons ── */
var PROOF_META={
  check: {icon:'✅', label:'Подтвердить', labelEn:'Confirm'},
  text:  {icon:'✍️', label:'Написать',    labelEn:'Write'},
  timer: {icon:'⏱',  label:'Практика',    labelEn:'Practice'},
  facets:{icon:'🔷', label:'Грани',       labelEn:'Facets'},
  intent:{icon:'🎯', label:'Намерение',   labelEn:'Intent'}
};
var QUEST_TYPE_LABEL={
  observe:'наблюдение', reflect:'рефлексия', create:'творчество',
  meditate:'медитация', ritual:'ритуал', study:'исследование', do:'действие'
};

/* ── axis names for display ── */
var AXIS_NAME_RU={
  discipline:'Дисциплина', compassion:'Сострадание', clarity:'Ясность',
  will:'Воля', devotion:'Преданность', transformation:'Трансформация', unity:'Единство'
};
var AXIS_ICON={
  discipline:'🗡', compassion:'💧', clarity:'👁', will:'🔥',
  devotion:'🙏', transformation:'♻️', unity:'🌀'
};

/* ── element display ── */
var ELEMENT_DISPLAY={
  earth:{icon:'🜃', name:'Земля', color:'#8B7355'},
  water:{icon:'🜄', name:'Вода', color:'#4A90D9'},
  fire: {icon:'🜂', name:'Огонь', color:'#E07020'},
  air:  {icon:'🜁', name:'Воздух', color:'#7ECFC0'},
  ether:{icon:'✦', name:'Эфир', color:'#B090E0'}
};

/* ── window display ── */
var WINDOW_DISPLAY={
  daimon:     {icon:'☽', name:'Даймон',       color:'#7b62c9'},
  locations:  {icon:'🗺', name:'Локации',      color:'#6BAF6B'},
  emf:        {icon:'⚡', name:'ЭМП',          color:'#D4A946'},
  newmatrix:  {icon:'◈', name:'Новая Матрица', color:'#C97B62'},
  soul:       {icon:'◉', name:'Душа',          color:'#9D86E0'},
  daimon_soul:{icon:'☽◉', name:'Даймон+Душа', color:'#8A7AD0'},
  chronicle:  {icon:'📜', name:'Хроника',      color:'#C9A84C'},
  hram:       {icon:'🏛', name:'Храм',         color:'#FFD27A'},
  cosmos:     {icon:'🌌', name:'Космос',       color:'#A0C0FF'},
  supergame:  {icon:'🌟', name:'Супер-Игра',   color:'#FFE0A0'}
};

/* ── guna display ── */
var GUNA_DISPLAY={
  tamas:  {name:'Тамас',  color:'#666', icon:'●'},
  rajas:  {name:'Раджас', color:'#D4A946', icon:'◐'},
  sattva: {name:'Саттва', color:'#A0E0A0', icon:'○'}
};

/* ── timer state ── */
var _timerInterval=null, _timerStart=0;

/* ── CSS ── */
function styleOnce(){
  if($('qf-style')) return;
  var st=document.createElement('style'); st.id='qf-style';
  st.textContent='\
#pyramidMap .qf-wrap{margin-top:12px;padding-top:10px;border-top:1px solid rgba(201,168,76,.15)}\
#pyramidMap .qf-title{font-family:Cinzel,serif;font-size:13px;color:var(--gold,#c9a84c);letter-spacing:.06em;margin-bottom:10px}\
#pyramidMap .qf-quest{position:relative;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px 14px;margin-bottom:8px;background:rgba(255,255,255,.015);transition:all .3s ease}\
#pyramidMap .qf-quest.active{border-color:rgba(201,168,76,.35);background:rgba(201,168,76,.04)}\
#pyramidMap .qf-quest.done{border-color:rgba(100,200,120,.25);background:rgba(100,200,120,.03);opacity:.8}\
#pyramidMap .qf-quest.locked{opacity:.35;pointer-events:none;filter:grayscale(.6)}\
#pyramidMap .qf-step{font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#8e88a4);margin-bottom:4px}\
#pyramidMap .qf-step .qf-type{margin-left:8px;color:var(--gold,#c9a84c);opacity:.7}\
#pyramidMap .qf-qtitle{font-size:15px;color:var(--text,#ece9f5);margin-bottom:4px;line-height:1.3}\
#pyramidMap .qf-qtext{font-size:13px;color:var(--muted,#8e88a4);line-height:1.5;margin-bottom:8px}\
#pyramidMap .qf-grain{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--gold);opacity:.6}\
\
#pyramidMap .qf-proof{margin-top:8px}\
#pyramidMap .qf-proof-btn{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(120deg,rgba(201,168,76,.18),rgba(123,98,201,.12));border:1px solid rgba(201,168,76,.3);border-radius:10px;padding:8px 16px;color:var(--text);font-family:Cinzel,serif;font-size:13px;letter-spacing:.04em;cursor:pointer;transition:all .25s ease}\
#pyramidMap .qf-proof-btn:hover{border-color:var(--gold);box-shadow:0 4px 16px -6px rgba(201,168,76,.3);transform:translateY(-1px)}\
#pyramidMap .qf-proof-btn:active{transform:scale(.97)}\
#pyramidMap .qf-proof-btn.submitted{background:rgba(100,200,120,.12);border-color:rgba(100,200,120,.3);pointer-events:none}\
\
#pyramidMap .qf-textarea{width:100%;min-height:56px;background:rgba(255,255,255,.03);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:10px;padding:10px;color:var(--text);font-family:"Cormorant Garamond",serif;font-size:14px;resize:none;outline:none;margin-bottom:8px}\
#pyramidMap .qf-textarea:focus{border-color:rgba(201,168,76,.5)}\
#pyramidMap .qf-textarea::placeholder{color:#5d586e}\
\
#pyramidMap .qf-timer-box{display:flex;align-items:center;gap:12px;margin-bottom:8px}\
#pyramidMap .qf-timer-display{font-family:"JetBrains Mono",monospace;font-size:22px;color:var(--violet-soft,#9d86e0);letter-spacing:.06em}\
#pyramidMap .qf-timer-btn{background:none;border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:6px 14px;cursor:pointer;font-family:"JetBrains Mono",monospace;font-size:11px;transition:all .2s}\
#pyramidMap .qf-timer-btn:hover{color:var(--gold);border-color:rgba(201,168,76,.5)}\
\
#pyramidMap .qf-facets-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}\
#pyramidMap .qf-facet{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:5px 10px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .2s}\
#pyramidMap .qf-facet.on{background:rgba(201,168,76,.12);border-color:rgba(201,168,76,.35);color:var(--gold)}\
\
#pyramidMap .qf-daimon{margin-top:10px;border:1px solid rgba(123,98,201,.3);border-radius:12px;padding:12px;background:linear-gradient(165deg,rgba(123,98,201,.1),rgba(201,168,76,.03))}\
#pyramidMap .qf-daimon-hdr{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--violet-soft,#9d86e0);margin-bottom:6px}\
#pyramidMap .qf-daimon-msg{font-size:14px;color:var(--text);line-height:1.55;font-style:italic;opacity:.9}\
#pyramidMap .qf-daimon-msg.loading{animation:dlpulse 1.4s ease-in-out infinite;color:var(--violet-soft)}\
#pyramidMap .qf-daimon-reply{display:flex;gap:8px;margin-top:8px}\
#pyramidMap .qf-daimon-input{flex:1;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:8px;color:var(--text);font-family:"Cormorant Garamond",serif;font-size:13px;outline:none}\
#pyramidMap .qf-daimon-input:focus{border-color:rgba(123,98,201,.5)}\
#pyramidMap .qf-daimon-send{background:none;border:1px solid rgba(123,98,201,.3);color:var(--violet-soft);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;transition:all .2s}\
#pyramidMap .qf-daimon-send:hover{border-color:rgba(123,98,201,.6);background:rgba(123,98,201,.1)}\
\
#pyramidMap .qf-done-badge{display:inline-flex;align-items:center;gap:4px;font-family:"JetBrains Mono",monospace;font-size:10px;color:rgba(100,200,120,.8);letter-spacing:.06em}\
#pyramidMap .qf-progress-bar{height:3px;border-radius:3px;background:rgba(255,255,255,.06);margin-top:6px;overflow:hidden}\
#pyramidMap .qf-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),rgba(100,200,120,.7));transition:width .5s ease}\
\
#pyramidMap .qf-result{margin-top:12px;border:1px solid rgba(255,215,0,.25);border-radius:14px;padding:14px 16px;background:linear-gradient(165deg,rgba(255,215,0,.06),rgba(123,98,201,.04));animation:qfResultIn .6s ease}\
@keyframes qfResultIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
#pyramidMap .qf-result-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}\
#pyramidMap .qf-result-light{font-family:"JetBrains Mono",monospace;font-size:24px;color:#ffd27a;font-weight:bold;text-shadow:0 0 12px rgba(255,210,122,.3)}\
#pyramidMap .qf-result-window{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;padding:3px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.12)}\
#pyramidMap .qf-result-eval{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}\
#pyramidMap .qf-result-tag{font-family:"JetBrains Mono",monospace;font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);letter-spacing:.04em}\
#pyramidMap .qf-result-axes{margin:8px 0;display:flex;flex-wrap:wrap;gap:4px 12px}\
#pyramidMap .qf-result-axis{font-size:12px;color:var(--muted)}\
#pyramidMap .qf-result-axis .val{color:#ffd27a;font-family:"JetBrains Mono",monospace;font-size:11px}\
#pyramidMap .qf-result-mult{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--muted);opacity:.7;margin-top:4px}\
#pyramidMap .qf-result-oracle{font-size:13px;color:var(--text);line-height:1.5;font-style:italic;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)}\
#pyramidMap .qf-result-sensory{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}\
#pyramidMap .qf-result-sense{font-size:11px;color:var(--muted);opacity:.8}\
#pyramidMap .qf-result-shadow{font-size:11px;color:#4ade80;margin-top:4px}\
';
  document.head.appendChild(st);
}

/* ── render quest chain inside a location card ── */
function renderQuests(locId){
  styleOnce();
  var host=document.querySelector('.pm-loc[data-loc-id="'+locId+'"] .pm-detail');
  if(!host) return;

  var old=host.querySelector('.qf-wrap');
  if(old) old.remove();

  if(!QUESTS){
    loadQuests(function(){ renderQuests(locId); });
    return;
  }

  var qs=questsFor(locId);
  if(!qs.length) return;

  var prog=loadProgress();
  var wrap=document.createElement('div');
  wrap.className='qf-wrap';

  var doneCount=0;
  for(var i=0;i<qs.length;i++) if(prog[qs[i].id]&&prog[qs[i].id].done) doneCount++;

  var title=L('Квесты локации','Location Quests')+' ('+doneCount+'/'+qs.length+')';
  wrap.innerHTML='<div class="qf-title">'+title+'</div><div class="qf-progress-bar"><div class="qf-progress-fill" style="width:'+Math.round(doneCount/qs.length*100)+'%"></div></div>';

  for(var i=0;i<qs.length;i++){
    var q=qs[i];
    var isDone=prog[q.id]&&prog[q.id].done;
    var prevDone=(i===0)||(prog[qs[i-1].id]&&prog[qs[i-1].id].done);
    var isActive=!isDone && prevDone;
    var isLocked=!isDone && !prevDone;

    var cls='qf-quest'+(isDone?' done':'')+(isActive?' active':'')+(isLocked?' locked':'');
    var stepLabels=['','① ','② ','③ '];
    var typeLabel=QUEST_TYPE_LABEL[q.type]||q.type||'';
    var pm=PROOF_META[q.proof]||PROOF_META.check;

    var card=document.createElement('div');
    card.className=cls;
    card.setAttribute('data-qid', q.id);

    var grainTotal=rewardSum(q.reward);
    var html='';
    html+='<div class="qf-step">'+stepLabels[q.step]+(L('шаг '+q.step,'step '+q.step))+'<span class="qf-type">'+esc(typeLabel)+'</span></div>';
    html+='<div class="qf-qtitle">'+(isDone?'✓ ':'')+esc(q.title)+'</div>';
    html+='<div class="qf-qtext">'+esc(q.text)+'</div>';
    html+='<div class="qf-grain">'+pm.icon+' '+esc(L(pm.label,pm.labelEn))+' · ☀ '+grainTotal+' '+L('зёрен','grain')+'</div>';

    if(isDone){
      html+='<div class="qf-done-badge">✦ '+L('Пройдено','Completed')+'</div>';
      if(prog[q.id].verified===true){
        html+='<div class="qf-done-badge" style="color:rgba(123,98,201,.7)">☽ '+dname()+' '+L('одобрил','approved')+'</div>';
      }
      /* show stored light result if exists */
      if(prog[q.id].light){
        html+='<div class="qf-done-badge" style="color:#ffd27a">☀ +'+prog[q.id].light+' '+L('света','light')+'</div>';
      }
    } else if(isActive){
      html+='<div class="qf-proof" id="qf-proof-'+esc(q.id)+'"></div>';
    }

    card.innerHTML=html;
    wrap.appendChild(card);

    if(isActive){
      setTimeout(_makeProofWidget.bind(null, q, prog), 50);
    }
  }

  host.appendChild(wrap);
}

/* ── proof widgets ── */
function _makeProofWidget(quest, prog){
  var host=$('qf-proof-'+quest.id);
  if(!host) return;

  var proof=quest.proof||'check';

  switch(proof){
    case 'check':
      _proofCheck(host, quest); break;
    case 'text':
    case 'intent':
      _proofText(host, quest, proof==='intent'); break;
    case 'timer':
      _proofTimer(host, quest); break;
    case 'facets':
      _proofFacets(host, quest); break;
    default:
      _proofCheck(host, quest);
  }
}

/* --- check: simple button --- */
function _proofCheck(host, quest){
  host.innerHTML='<button class="qf-proof-btn" data-qid="'+esc(quest.id)+'">'+
    '✅ '+L('Выполнено','Done')+'</button>';
  host.querySelector('.qf-proof-btn').onclick=function(){
    _submitProof(quest, 'confirmed', null);
  };
}

/* --- text / intent: textarea + submit --- */
function _proofText(host, quest, isIntent){
  var placeholder=isIntent
    ? L('Сформулируй своё намерение…','State your intent…')
    : L('Опиши свой опыт…','Describe your experience…');
  host.innerHTML='<textarea class="qf-textarea" placeholder="'+esc(placeholder)+'" id="qf-ta-'+esc(quest.id)+'"></textarea>'+
    '<button class="qf-proof-btn" data-qid="'+esc(quest.id)+'">'+
    (isIntent?'🎯':'✍️')+' '+L('Отправить','Submit')+'</button>';
  host.querySelector('.qf-proof-btn').onclick=function(){
    var ta=$('qf-ta-'+quest.id);
    var txt=ta?ta.value.trim():'';
    if(!txt){ ta.style.borderColor='rgba(255,80,80,.5)'; ta.focus(); return; }
    _submitProof(quest, txt, txt);
  };
}

/* --- timer: start/stop --- */
function _proofTimer(host, quest){
  var minSec=quest.tier>=4?120:60;
  host.innerHTML='<div class="qf-timer-box">'+
    '<span class="qf-timer-display" id="qf-td-'+esc(quest.id)+'">0:00</span>'+
    '<button class="qf-timer-btn" id="qf-tb-'+esc(quest.id)+'">'+L('Начать','Start')+'</button>'+
    '</div>'+
    '<button class="qf-proof-btn" id="qf-ts-'+esc(quest.id)+'" style="display:none">'+
    '⏱ '+L('Завершить','Complete')+'</button>';

  var display=$('qf-td-'+quest.id);
  var btn=$('qf-tb-'+quest.id);
  var submit=$('qf-ts-'+quest.id);
  var elapsed=0;

  btn.onclick=function(){
    if(_timerInterval){
      clearInterval(_timerInterval);
      _timerInterval=null;
      btn.textContent=L('Начать','Start');
      return;
    }
    _timerStart=Date.now();
    elapsed=0;
    btn.textContent=L('Пауза','Pause');
    _timerInterval=setInterval(function(){
      elapsed=Math.floor((Date.now()-_timerStart)/1000);
      var m=Math.floor(elapsed/60), s=elapsed%60;
      display.textContent=m+':'+(s<10?'0':'')+s;
      if(elapsed>=minSec && submit.style.display==='none'){
        submit.style.display='';
      }
    }, 500);
  };

  submit.onclick=function(){
    if(_timerInterval){ clearInterval(_timerInterval); _timerInterval=null; }
    _submitProof(quest, 'timer:'+elapsed+'s', null);
  };
}

/* --- facets: multi-select --- */
function _proofFacets(host, quest){
  var facetWords=_extractFacets(quest);
  var html='<div class="qf-facets-wrap" id="qf-fw-'+esc(quest.id)+'">';
  for(var i=0;i<facetWords.length;i++){
    html+='<span class="qf-facet" data-idx="'+i+'">'+esc(facetWords[i])+'</span>';
  }
  html+='</div>';
  html+='<button class="qf-proof-btn" data-qid="'+esc(quest.id)+'">🔷 '+L('Подтвердить грани','Confirm facets')+'</button>';
  host.innerHTML=html;

  var fw=$('qf-fw-'+quest.id);
  fw.addEventListener('click', function(e){
    var f=e.target.closest('.qf-facet');
    if(f) f.classList.toggle('on');
  });

  host.querySelector('.qf-proof-btn').onclick=function(){
    var sel=fw.querySelectorAll('.qf-facet.on');
    if(sel.length<2) return;
    var names=[];
    for(var j=0;j<sel.length;j++) names.push(sel[j].textContent);
    _submitProof(quest, 'facets:'+names.join(','), null);
  };
}

function _extractFacets(quest){
  var words=(quest.text||'').replace(/[.,!?;:—–\-\(\)]/g,' ').split(/\s+/);
  var stop='в на с у и по от к за из о не а но что для как это при она он всё';
  var stopSet={};
  stop.split(' ').forEach(function(w){ stopSet[w]=1; stopSet[w.toLowerCase()]=1; });
  var good=[];
  for(var i=0;i<words.length;i++){
    var w=words[i].trim();
    if(w.length<3||stopSet[w.toLowerCase()]) continue;
    if(good.indexOf(w)===-1) good.push(w);
    if(good.length>=6) break;
  }
  if(good.length<4){
    var extras=[L('осознание','awareness'),L('присутствие','presence'),L('внимание','attention'),L('глубина','depth')];
    for(var j=0;j<extras.length&&good.length<5;j++){
      if(good.indexOf(extras[j])===-1) good.push(extras[j]);
    }
  }
  return good;
}

/* ══════════════════════════════════════════
   SUBMIT PROOF → Daimon verification → Engine
   ══════════════════════════════════════════ */

function _submitProof(quest, proofData, playerText){
  /* playerText = text the player actually wrote (for AI evaluation)
     proofData = what to store as proof record */
  var btn=document.querySelector('.qf-proof-btn[data-qid="'+quest.id+'"]');
  if(btn){ btn.classList.add('submitted'); btn.textContent='⏳ '+L('Даймон проверяет…','Daimon verifying…'); }

  /* 30% chance Daimon asks (for check proofs) */
  var shouldVerify=(quest.proof!=='check')||(Math.random()<0.3);
  if(quest.tier<=1 && quest.proof==='check' && Math.random()>0.2){
    shouldVerify=false;
  }

  if(!shouldVerify || typeof window.aiCall!=='function'){
    _completeQuest(quest, proofData, true, playerText);
    return;
  }

  _daimonVerify(quest, proofData, playerText);
}

/* ── Daimon verification ── */
function _daimonVerify(quest, proofData, playerText){
  var proofHost=$('qf-proof-'+quest.id);
  if(!proofHost) return;

  var dbox=document.createElement('div');
  dbox.className='qf-daimon';
  dbox.id='qf-dm-'+quest.id;
  dbox.innerHTML='<div class="qf-daimon-hdr">☽ '+esc(dname())+'</div>'+
    '<div class="qf-daimon-msg loading" id="qf-dm-msg-'+esc(quest.id)+'">'+
    esc(dname())+' '+L('вглядывается…','is observing…')+'</div>';
  proofHost.appendChild(dbox);

  var trustLv=dtrust();
  var tone=trustLv<30?L('Говори мягко и бережно, одним коротким вопросом.','Speak gently, one brief question.')
    :trustLv<70?L('Говори тепло и с любопытством, одним вопросом.','Speak warmly and curiously, one question.')
    :L('Говори как близкий друг, одним лёгким вопросом.','Speak as a close friend, one easy question.');

  var proofContext='';
  if(typeof proofData==='string' && proofData.length>15){
    proofContext=L('\n\nИгрок написал: «','The player wrote: «')+proofData.slice(0,300)+'»';
  }

  var sysP='';
  try{ sysP=(typeof window.aiSystem==='function')?window.aiSystem('daimon'):''; }catch(e){}
  if(!sysP) sysP='You are the Daimon, a gentle inner companion in the AWARA game.';

  var userP=L(
    'Игрок выполняет квест «'+quest.title+'» в локации. Описание квеста: «'+quest.text+'». Тип: '+quest.type+', ярус '+quest.tier+'.',
    'Player is doing quest "'+quest.title+'". Description: "'+quest.text+'". Type: '+quest.type+', tier '+quest.tier+'.'
  );
  userP+=proofContext;
  userP+='\n\n'+L(
    'Задай ОДИН короткий ненавязчивый вопрос (1-2 предложения), связанный с сутью квеста, чтобы мягко проверить, действительно ли игрок прошёл его. Не допрашивай — будь как тёплый спутник, который хочет услышать что-то живое. '+tone+' Никаких заголовков, эмодзи или пояснений — только сам вопрос от лица Даймона.',
    'Ask ONE short gentle question (1-2 sentences) related to the quest to softly verify the player really did it. Don\'t interrogate — be a warm companion who wants to hear something real. '+tone+' No headers, emojis, or explanations — just the question from the Daimon.'
  );

  window.aiCall([
    {role:'system', content:sysP},
    {role:'user', content:userP}
  ]).then(function(txt){
    var msg=$('qf-dm-msg-'+quest.id);
    if(msg){
      msg.className='qf-daimon-msg';
      msg.textContent=txt.replace(/\s+$/,'');
    }
    var dm=$('qf-dm-'+quest.id);
    if(dm){
      var replyBox=document.createElement('div');
      replyBox.className='qf-daimon-reply';
      replyBox.innerHTML='<input class="qf-daimon-input" id="qf-dr-'+esc(quest.id)+'" placeholder="'+esc(L('Ответь Даймону…','Reply to Daimon…'))+'">'+
        '<button class="qf-daimon-send" id="qf-ds-'+esc(quest.id)+'">→</button>';
      dm.appendChild(replyBox);

      var skipBtn=document.createElement('button');
      skipBtn.className='qf-daimon-send';
      skipBtn.style.cssText='margin-top:6px;opacity:.5;font-size:10px';
      skipBtn.textContent=L('пропустить','skip');
      skipBtn.onclick=function(){ _completeQuest(quest, proofData, true, playerText); };
      dm.appendChild(skipBtn);

      $('qf-ds-'+quest.id).onclick=function(){
        var inp=$('qf-dr-'+quest.id);
        var reply=inp?inp.value.trim():'';
        if(!reply){ inp.focus(); return; }
        /* Combine playerText + daimon reply for richer AI evaluation */
        var combinedText = (playerText||'') + '\n[Ответ Даймону]: ' + reply;
        _daimonEvaluate(quest, proofData, txt, reply, combinedText);
      };
      $('qf-dr-'+quest.id).addEventListener('keydown', function(e){
        if(e.key==='Enter'){
          e.preventDefault();
          $('qf-ds-'+quest.id).click();
        }
      });
    }
  }).catch(function(e){
    _completeQuest(quest, proofData, true, playerText);
  });
}

/* ── Daimon evaluates reply ── */
function _daimonEvaluate(quest, proofData, daimonQuestion, playerReply, combinedText){
  var dm=$('qf-dm-'+quest.id);
  if(!dm) return;

  var inp=$('qf-dr-'+quest.id);
  var btn=$('qf-ds-'+quest.id);
  if(inp) inp.disabled=true;
  if(btn) btn.disabled=true;

  var replyDiv=document.createElement('div');
  replyDiv.style.cssText='font-size:13px;color:var(--text);margin-top:6px;padding:6px 0;border-top:1px solid rgba(255,255,255,.04)';
  replyDiv.innerHTML='<span style="color:var(--gold);font-size:10px;font-family:JetBrains Mono,monospace;letter-spacing:.08em">'+L('ИГРОК','PLAYER')+'</span><br>'+esc(playerReply);
  dm.appendChild(replyDiv);

  var evalDiv=document.createElement('div');
  evalDiv.className='qf-daimon-msg loading';
  evalDiv.id='qf-eval-'+quest.id;
  evalDiv.textContent=dname()+' '+L('размышляет…','reflects…');
  dm.appendChild(evalDiv);

  var sysP='';
  try{ sysP=(typeof window.aiSystem==='function')?window.aiSystem('daimon'):''; }catch(e){}
  if(!sysP) sysP='You are the Daimon, a gentle inner companion in the AWARA game.';

  var evalPrompt=L(
    'Квест: «'+quest.title+'» — «'+quest.text+'»\nТы спросил: «'+daimonQuestion+'»\nИгрок ответил: «'+playerReply+'»\n\n'+
    'Оцени ответ. Если он хотя бы отчасти связан с квестом — одобри тепло. Если совсем мимо или пустой — мягко скажи, что пока не чувствуешь связь, но без обвинений.\n'+
    'Ответь в формате:\nПервая строка: ОДОБРЕНО или ПОДОЖДИ\nДалее: 1-2 предложения от лица Даймона (тёплые, живые, без пафоса).',
    'Quest: "'+quest.title+'" — "'+quest.text+'"\nYou asked: "'+daimonQuestion+'"\nPlayer replied: "'+playerReply+'"\n\n'+
    'Evaluate. If the reply is at least somewhat related — approve warmly. If completely off or empty — gently say you don\'t feel the connection yet, without blame.\n'+
    'Format:\nFirst line: APPROVED or WAIT\nThen: 1-2 sentences as the Daimon (warm, genuine, no drama).'
  );

  window.aiCall([
    {role:'system', content:sysP},
    {role:'user', content:evalPrompt}
  ]).then(function(txt){
    var evalEl=$('qf-eval-'+quest.id);
    if(!evalEl) return;

    var lines=txt.trim().split('\n');
    var verdict=lines[0].trim().toUpperCase();
    var approved=verdict.indexOf(L('ОДОБРЕНО','APPROVED'))>=0 || verdict.indexOf('APPROVED')>=0 || verdict.indexOf('ОДОБРЕНО')>=0;
    var msg=lines.slice(1).join(' ').trim()||lines[0];
    msg=msg.replace(/^(ОДОБРЕНО|ПОДОЖДИ|APPROVED|WAIT)\s*/i,'').trim();
    if(!msg) msg=approved?L('Хорошо. Я чувствую — ты был здесь.','Good. I feel you were here.'):L('Попробуй ещё раз, глубже.','Try once more, deeper.');

    evalEl.className='qf-daimon-msg';
    evalEl.innerHTML=(approved?'<span style="color:rgba(100,200,120,.8)">✦</span> ':'<span style="color:rgba(200,150,80,.7)">◯</span> ')+esc(msg);

    if(approved){
      setTimeout(function(){ _completeQuest(quest, proofData, true, combinedText); }, 1200);
    } else {
      var retryBtn=document.createElement('button');
      retryBtn.className='qf-proof-btn';
      retryBtn.style.cssText='margin-top:8px;font-size:12px';
      retryBtn.textContent=L('↻ Попробовать снова','↻ Try again');
      retryBtn.onclick=function(){ renderQuests(quest.location_id); };
      dm.appendChild(retryBtn);
    }
  }).catch(function(){
    _completeQuest(quest, proofData, true, combinedText);
  });
}

/* ══════════════════════════════════════════════════
   COMPLETE QUEST → AwaraXP.processExperience()
   ══════════════════════════════════════════════════ */

function _completeQuest(quest, proofData, verified, playerText){
  var lens = currentLens();
  
  /* Detect media attachments */
  var mediaType = _detectMedia(quest);
  /* Detect coop */
  var coopPlayers = _detectCoop();
  
  /* Check daily quest cap */
  if(window.AwaraXP && window.AwaraXP.canDoQuest && !window.AwaraXP.canDoQuest()){
    var qr = window.AwaraXP.getQuestRemaining();
    _showCapMessage(quest, L('Дневной лимит квестов исчерпан ('+qr.cap+'). Вернись завтра.','Daily quest cap reached. Come back tomorrow.'));
    return;
  }
  
  /* Call Unified Experience Engine with opts */
  if(window.AwaraXP && window.AwaraXP.__ready){
    window.AwaraXP.processExperience(
      quest,
      playerText || null,
      lens.slug,
      lens.depth,
      {media_type: mediaType, coop_players: coopPlayers}
    ).then(function(result){
      /* Save progress with light result */
      _saveAndShow(quest, proofData, verified, result);
    }).catch(function(e){
      console.error('[QuestFlow] Engine error:', e);
      _saveAndShow(quest, proofData, verified, null);
    });
  } else {
    /* Engine not loaded — fallback to simple save */
    console.warn('[QuestFlow] AwaraXP not ready, fallback');
    _saveAndShow(quest, proofData, verified, null);
  }
}

function _saveAndShow(quest, proofData, verified, xpResult){
  var prog=loadProgress();
  prog[quest.id]={
    done:true,
    ts:new Date().toISOString(),
    proof:typeof proofData==='string'?proofData.slice(0,500):'check',
    verified:verified,
    light: xpResult ? xpResult.finalLight : null,
    window: xpResult ? xpResult.window.id : null
  };
  saveProgress(prog);

  /* dispatch event for other modules */
  try{
    window.dispatchEvent(new CustomEvent('awara:quest-done', {
      detail:{quest:quest, verified:verified, xpResult:xpResult}
    }));
  }catch(e){}

  /* Show result card, then re-render after delay */
  if(xpResult){
    _showResultCard(quest, xpResult);
  } else {
    setTimeout(function(){ renderQuests(quest.location_id); }, 400);
  }
}

/* ══════════════════════════════════════════════════
   RESULT CARD — показывает итог: свет, окно, оси
   ══════════════════════════════════════════════════ */

function _showResultCard(quest, result){
  var proofHost = $('qf-proof-'+quest.id);
  var card = document.querySelector('.qf-quest[data-qid="'+quest.id+'"]');
  var host = proofHost || card;
  if(!host) { setTimeout(function(){ renderQuests(quest.location_id); }, 400); return; }

  var ev = result.evaluation || {};
  var win = result.window || {};
  var wd = WINDOW_DISPLAY[win.id] || {icon:'☀', name:win.id||'?', color:'#ffd27a'};
  var ed = ELEMENT_DISPLAY[ev.element] || {icon:'?', name:'?', color:'#888'};
  var gd = GUNA_DISPLAY[ev.guna] || {name:'?', color:'#888', icon:'?'};

  var html = '<div class="qf-result">';
  
  /* Header: light + window */
  html += '<div class="qf-result-header">';
  html += '<span class="qf-result-light">☀ +'+result.finalLight+'</span>';
  html += '<span class="qf-result-window" style="color:'+wd.color+';border-color:'+wd.color+'40">'+wd.icon+' '+wd.name+' ('+L('Мера','Mera')+' '+win.mera+')</span>';
  html += '</div>';

  /* Eval tags: element, guna, loka */
  html += '<div class="qf-result-eval">';
  html += '<span class="qf-result-tag" style="color:'+ed.color+'">'+ed.icon+' '+ed.name+'</span>';
  html += '<span class="qf-result-tag" style="color:'+gd.color+'">'+gd.icon+' '+gd.name+'</span>';
  html += '<span class="qf-result-tag">'+L('Лока','Loka')+' '+ev.loka+'</span>';
  html += '<span class="qf-result-tag">'+L('Качество','Quality')+' '+(ev.quality_score*100|0)+'%</span>';
  html += '</div>';

  /* Axes gained */
  var axes = result.axes_gained || {};
  var axisHtml = '';
  for(var ax in axes){
    if(axes[ax] > 0){
      var an = AXIS_NAME_RU[ax]||ax;
      var ai = AXIS_ICON[ax]||'';
      axisHtml += '<span class="qf-result-axis">'+ai+' '+an+' <span class="val">+'+axes[ax]+'</span></span>';
    }
  }
  if(axisHtml){
    html += '<div class="qf-result-axes">'+axisHtml+'</div>';
  }

  /* Multiplier breakdown (compact) */
  var md = result.multiplier_details || {};
  var multParts = [];
  if(md.lens_depth)   multParts.push('L'+md.lens_depth.level+'×'+md.lens_depth.value);
  if(md.daily_energy) multParts.push(L('день','day')+'×'+md.daily_energy.value);
  if(md.agent)        multParts.push(L('агент','agent')+(md.agent.match?'✓':'')+'×'+md.agent.value);
  if(md.loka_density) multParts.push(L('лока','loka')+'×'+md.loka_density.value);
  if(md.guna)         multParts.push(md.guna.type+'×'+md.guna.value);
  if(md.quality)      multParts.push('q×'+md.quality.value);
  if(md.shadow_bonus) multParts.push(L('тень','shadow')+'×1.1');
  html += '<div class="qf-result-mult">'+L('Множитель','Multiplier')+': '+multParts.join(' · ')+' = ×'+result.multiplier+'</div>';

  /* Shadow reduction */
  if(result.shadow_reduced){
    html += '<div class="qf-result-shadow">🌿 '+L('Тень','Shadow')+' «'+result.shadow_reduced+'» -0.02</div>';
  }

  /* Sensory hints */
  var sens = result.sensory;
  if(sens){
    html += '<div class="qf-result-sensory">';
    if(sens.sound)  html += '<span class="qf-result-sense">🔊 '+esc(sens.sound)+'</span>';
    if(sens.visual) html += '<span class="qf-result-sense">👁 '+esc(sens.visual)+'</span>';
    if(sens.breath) html += '<span class="qf-result-sense">🌬 '+esc(sens.breath)+'</span>';
    if(sens.body)   html += '<span class="qf-result-sense">🤸 '+esc(sens.body)+'</span>';
    html += '</div>';
  }

  /* Oracle reflection */
  if(window.AwaraXP && window.AwaraXP.getOracleReflection){
    var domAxis = AXIS_NAME_RU[result.element_axes && result.element_axes.primary || 'clarity'] || '';
    var sensText = sens && sens.visual ? sens.visual : '';
    var agentVoice = '';
    try{
      var s=S();
      if(s && s.daimon && s.daimon.name) agentVoice = s.daimon.name + ' ' + L('кивает','nods');
    }catch(e){}
    var oracle = window.AwaraXP.getOracleReflection(quest.type||'do', quest, domAxis, sensText, agentVoice);
    if(oracle){
      html += '<div class="qf-result-oracle">☽ '+esc(oracle)+'</div>';
    }
  }

  html += '</div>';

  /* Insert result card */
  var resultEl = document.createElement('div');
  resultEl.innerHTML = html;

  if(proofHost){
    proofHost.innerHTML = '';
    proofHost.appendChild(resultEl);
  } else {
    card.appendChild(resultEl);
  }

  /* Re-render full list after player has time to see the result */
  setTimeout(function(){
    renderQuests(quest.location_id);
  }, 5000);
}

/* ── media & coop detection ── */
function _detectMedia(quest){
  if(window._awaraMediaAttached){
    var m=window._awaraMediaAttached;
    if(m.video) return 'video';
    if(m.audio) return 'audio';
    if(m.photos && m.photos>1) return 'photo_2plus';
    if(m.photos && m.photos>=1) return 'photo_1';
    if(m.mixed) return 'mixed';
  }
  var host=$('qf-proof-'+quest.id);
  if(!host) return 'none';
  if(host.querySelectorAll('video,[data-media=video]').length) return 'video';
  if(host.querySelectorAll('audio,[data-media=audio]').length) return 'audio';
  var imgs=host.querySelectorAll('img,[data-media=photo]').length;
  if(imgs>1) return 'photo_2plus';
  if(imgs===1) return 'photo_1';
  return 'none';
}
function _detectCoop(){
  try{ if(window._awaraCoopSession) return window._awaraCoopSession.players||1; }catch(e){}
  return 1;
}
function _showCapMessage(quest, msg){
  var host=$('qf-proof-'+quest.id);
  if(host) host.innerHTML='<div style="color:#e06a6a;font-size:13px;padding:8px 12px;border:1px solid rgba(224,106,106,.3);border-radius:10px;background:rgba(224,106,106,.06)">'+esc(msg)+'</div>';
}

/* ── hook into pyramid map toggle ── */
var _origToggle=window._pmToggle;
window._pmToggle=function(id){
  if(_origToggle) _origToggle(id);
  setTimeout(function(){
    var card=document.querySelector('.pm-loc.open[data-loc-id="'+id+'"]');
    if(card){
      loadQuests(function(){ renderQuests(id); });
    }
  }, 100);
};

/* ── public API ── */
window.AwaraQuestFlow={
  renderQuests:renderQuests,
  questsFor:questsFor,
  loadProgress:loadProgress,
  rewardSum:rewardSum,
  __ready:true,
  __v:2
};

/* preload */
setTimeout(function(){ loadQuests(function(){}); }, 1000);

})();
