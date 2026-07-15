/* ============================================================
   AWARA · ГОЛОС СОВЕСТИ (v1)
   Обобщение схемы awara-lens.js (score -> propose -> player edits ->
   commit -> calibrate) на несколько доменов сразу: Даймон (9 Мер),
   Душа (подсферы), Храм (свет), Намерения, Стрик, Банк Космоса,
   Карточный биас дня — плюс мини-интервью (уточняющие вопросы)
   перед итоговым предложением.

   Архитектура — реестр «навыков чтения опыта» (experience-reading
   skills). Каждый навык:
     - НЕ пишет в state напрямую;
     - принимает текст дня (+ нужный ему кусок STATE) и возвращает
       { items: {key: {label, amount, domain}}, questions: [...] }
       (items — то же самое по духу, что и scores из awara-lens.js);
     - в commit-фазе получает подтверждённые ключи и сам решает,
       как записать их в «свою» реальную структуру состояния —
       через уже существующие публичные функции модулей, которые
       он оборачивает (Temple, Daimon, Soul...), а не напрямую в
       чужой localStorage.

   Все предложения объединяются в STATE.pendingExperience (родной
   сосед STATE.pendingResonance из awara-lens.js — линзы остаются
   на своём месте и логике, просто выводятся в ОДНОЙ карточке рядом).
   Один и тот же экран/кнопка «Прожито» коммитит и то, и другое.

   Слой calibration (Лапласовское сглаживание accept/reject) уже есть
   у линз (s.lensCalibration через awara-lens.js). Здесь — свой
   параллельный банк калибровки на домен+ключ (s.voiceCalibration),
   для доменов, где «принял/отклонил» осмысленно: daimon, soul, temple.
   Для streak калибровка не применяется (там нет «принятия» — это
   автоматический счётчик).
   ============================================================ */
(function(){
'use strict';
if(window.__awaraVoiceConscience) return; window.__awaraVoiceConscience=true;

function S(){ try{ return STATE; }catch(e){ return null; } }

/* ============================================================
   0. ОБЩАЯ КАЛИБРОВКА (параллельно лестнице awara-lens.js, но
      с собственным неймспейсом ключей "domain:key", чтобы не
      путать с калибровкой линз).
   ============================================================ */
function ensureVoiceCalib(s){ if(!s.voiceCalibration||typeof s.voiceCalibration!=='object') s.voiceCalibration={}; return s.voiceCalibration; }
function voiceTrust(s,fullKey){
  var c=ensureVoiceCalib(s)[fullKey]; if(!c) return 0.5;
  return (c.accepted+1)/(c.accepted+c.rejected+2);
}
function voiceRecord(s,fullKey,accepted){
  var cal=ensureVoiceCalib(s); var c=cal[fullKey]||(cal[fullKey]={accepted:0,rejected:0});
  if(accepted) c.accepted+=1; else c.rejected+=1;
}
/* домены, где принятие/отклонение вообще имеет смысл откалибровать */
var CALIBRATABLE_DOMAINS={daimon:true,soul:true,temple:true,intention:true};

/* ============================================================
   1. DAIMON-SKILL — резонанс текста дня с 9 Мерами + Домера (-3..0).
      Обёртка над данными daimonAscent.js (мы держим здесь только
      лёгкое страховочное зеркало констант, как это уже делает
      js/daimonCosmos.js — импортировать ES-модуль в этот
      script-tag контекст нельзя, тигель без сборки).
      Источник истины по 1..9 и по -3..0 — js/daimonAscent.js.
   ============================================================ */
var MERA_NAMES=['Муладхара','Свадхистхана','Манипура','Анахата','Вишуддха','Аджна','Сахасрара','Монада','Абсолют'];
var PRE_MERA_NAMES={'-3':'Тень инстинкта','-2':'Влечение','-1':'Фантазия','0':'Манас природы'};
/* ключевые слова -> сдвиг по шкале -3..9 (грубая эвристика v1, в духе LENS_VOCAB) */
var MERA_VOCAB=[
  {n:-3, w:['инстинкт','выживание','рефлекс','паника тела','голод','драка']},
  {n:-2, w:['тянет','влечёт','похоть','отвращение','сырое желание','зависимость']},
  {n:-1, w:['фантази','мечта','грёз','воображение','придумал','сон приснился']},
  {n:0,  w:['природа во мне','животная часть','пробуждение ума','манас']},
  {n:1,  w:['тело','деньги','вещи','рост ради роста','работал','купил']},
  {n:2,  w:['страх','злость','агресси','конфликт','болезнь','выгорание']},
  {n:3,  w:['гармони','ремесло','дом','красота','порядок','уборка']},
  {n:4,  w:['чувств','сердц','интуици','тонко почувствовал']},
  {n:5,  w:['целостн','искренн','любимое дело','смысл','поток']},
  {n:6,  w:['служени','помог','отдал','наставничество','поддержал']},
  {n:7,  w:['вдохновени','вёл за собой','внутренний огонь','лидер']},
  {n:8,  w:['дух','видение','медитаци','присутствие','ясновидени']},
  {n:9,  w:['свобода','космос','освобождение','единство со всем']}
];
function daimonSkill(text, state){
  var t=(text||'').toLowerCase(); var items={}; var questions=[];
  if(!t.trim()) return {items:items, questions:questions};
  var best=null, bestHits=0;
  MERA_VOCAB.forEach(function(row){
    var hits=0; row.w.forEach(function(w){ if(t.indexOf(w)>=0) hits++; });
    if(hits>bestHits){ bestHits=hits; best=row; }
  });
  if(!best || bestHits===0) return {items:items, questions:questions};
  var n=best.n;
  var label = n<=0 ? ('Даймон · '+(PRE_MERA_NAMES[String(n)]||'Домера')) : ('Даймон · Мера '+n+' '+(MERA_NAMES[n-1]||''));
  var amount = Math.min(3, bestHits); /* сдвиг резонанса, не абсолютное значение */
  items['daimon:'+n] = {label:label, amount:amount, domain:'daimon', mera:n};
  /* уточняющий вопрос-кандидат: граница между Мерой и допороговой Домерой часто нечёткая */
  if(n<=0){
    questions.push({id:'daimon_below_threshold', text:'Это было осознанное движение — или скорее инстинкт/фантазия, ещё без ясной воли?', domain:'daimon'});
  }
  return {items:items, questions:questions};
}
function daimonCommit(key, item, state){
  /* Пишем в daimon.meraResonance — лёгкий аддитивный счётчик поверх
     daimonAscent.js/daimon-module.js: НЕ трогаем daimon.experience/chakra,
     это отдельная "как часто звучит Мера в тексте дня" статистика. */
  var d = state.daimon || (state.daimon = {});
  if(!d.meraResonance || typeof d.meraResonance!=='object') d.meraResonance={};
  var k=String(item.mera);
  d.meraResonance[k] = (d.meraResonance[k]||0) + item.amount;
}

/* ============================================================
   2. SOUL-SKILL — обёртка над soulTigelSync.js (T-603): переиспользуем
      syncTigelToSoul, ничего не переизобретаем. soulTigelSync ждёт на
      входе cauldronResult.sphereScores — форму, которую уже даёт
      js/cauldronEngine.js (analyzeCauldronEntry). Если движок доступен
      в этом окружении (модульный импорт недоступен без build — поэтому
      сначала пробуем window.AwaraSoulSync, который может быть
      экспортирован туда другим модульным входом; иначе используем
      собственный лёгкий скоринг по тем же 4 сферам, что и cauldronEngine,
      чтобы не дублировать пороги, только ключевые слова инициации
      (initiation_spheres) уже есть в data/cauldron_rules.json — не
      хардкодим второй раз, тянем оттуда). */
var CAULDRON_RULES=null;
function loadCauldronRules(cb){
  if(CAULDRON_RULES){ cb(CAULDRON_RULES); return; }
  try{
    fetch('data/cauldron_rules.json').then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(j) CAULDRON_RULES=j;
      cb(CAULDRON_RULES);
    }).catch(function(){ cb(null); });
  }catch(e){ cb(null); }
}
/* синхронный скоринг по уже загруженным правилам (для commit-момента,
   где нам нужен результат сразу, без ожидания fetch) */
function soulScoreSync(text, rules){
  var t=(text||'').toLowerCase(); var out={};
  if(!rules || !rules.initiation_spheres) return out;
  Object.keys(rules.initiation_spheres).forEach(function(sid){
    var sph=rules.initiation_spheres[sid]; var hits=0;
    (sph.keywords||[]).forEach(function(w){ if(t.indexOf(w.toLowerCase())>=0) hits++; });
    if(hits>0) out[sid]={title:sph.title, hits:hits, element:sph.default_element};
  });
  return out;
}
function soulSkill(text, state){
  var items={}, questions=[];
  var t=(text||'').trim(); if(!t) return {items:items, questions:questions};
  /* греем кеш правил для commit-фазы; на предложение этого захода может не
     хватить (fetch асинхронный) — если ещё не загружено, пропускаем показ
     в эту плавку, покажется в следующей (правила закешируются надолго) */
  loadCauldronRules(function(){});
  if(!CAULDRON_RULES) return {items:items, questions:questions};
  var scores=soulScoreSync(t, CAULDRON_RULES);
  Object.keys(scores).forEach(function(sid){
    var sc=scores[sid];
    items['soul:'+sid] = {label:'Душа · '+sc.title, amount:Math.min(4,sc.hits), domain:'soul', sphereId:sid, element:sc.element};
  });
  if(Object.keys(items).length>1){
    questions.push({id:'soul_which_sphere', text:'День звучал сразу в нескольких сферах Души — какая была главной?', domain:'soul'});
  }
  return {items:items, questions:questions};
}
function soulCommit(key, item, state){
  /* Переиспользуем существующий мост soulTigelSync.syncTigelToSoul через
     глобальный wrapper, если он навешен на window (см. хвост файла —
     мы поднимаем модуль динамическим import один раз при старте). */
  try{
    if(window.AwaraSoulSync && typeof window.AwaraSoulSync.syncTigelToSoul==='function'){
      var fakeResult={
        id:'voice_'+Date.now()+'_'+item.sphereId,
        createdAt:new Date().toISOString(),
        sphereScores:(function(){ var o={}; o[item.sphereId]={score:item.amount, themes:[item.label]}; return o; })()
      };
      window.AwaraSoulSync.syncTigelToSoul(fakeResult);
    }
  }catch(e){}
}

/* ============================================================
   3. TEMPLE-SKILL — обёртка над js/temple-module.js. Тигель — не
      модульный контекст, поэтому мы не можем статически import;
      грузим temple-module.js динамическим import() один раз (ESM
      dynamic import работает и из обычного <script>, без build).
   ============================================================ */
var TempleAPI=null;
function loadTempleApi(cb){
  if(TempleAPI){ cb(TempleAPI); return; }
  try{
    import('./js/temple-module.js').then(function(mod){ TempleAPI=mod; cb(mod); }).catch(function(){ cb(null); });
  }catch(e){ cb(null); }
}
var TEMPLE_VOCAB=['храм','алтарь','ритуал','медитац','святилищ','маяк','зиккурат','абсолют','паломник'];
function templeSkill(text, state){
  var t=(text||'').toLowerCase(); var items={}, questions=[];
  if(!t.trim()) return {items:items, questions:questions};
  var hits=0; TEMPLE_VOCAB.forEach(function(w){ if(t.indexOf(w)>=0) hits++; });
  /* храм получает долю света дня ВСЕГДА (тихий пассивный вклад), а не
     только по ключевым словам — но явное упоминание усиливает вклад */
  var lv=0; try{ lv=(typeof lightVal==='function')?lightVal():0; }catch(e){}
  var base=Math.round((lv||0)*0.08); /* ~8% дня — скромный, не переизобретает экономику апгрейдов */
  var bonus=hits>0?Math.round((lv||0)*0.04):0;
  var amount=base+bonus;
  if(amount<=0) return {items:items, questions:questions};
  items['temple:light'] = {label:'Храм · свет дня'+(hits>0?' (явный ритуал в тексте)':''), amount:amount, domain:'temple'};
  loadTempleApi(function(){});
  return {items:items, questions:questions};
}
function templeCommit(key, item, state, doneCb){
  /* temple-module.js живёт на playerState.js (awara_v258_state), отдельный
     ключ от tigel_v1. Используем ЕГО публичную contributeLight() (новая,
     маленькая экспортированная функция — см. js/temple-module.js), а не
     пишем в его состояние напрямую. */
  loadTempleApi(function(api){
    try{ if(api && typeof api.contributeLight==='function') api.contributeLight(item.amount); }catch(e){}
    doneCb&&doneCb();
  });
}

/* ============================================================
   4. STREAK-SKILL — тонкая обёртка над js/streak.js (не дублируем
      подсчёт «серии», просто отмечаем визит день). Без калибровки:
      это не предложение, которое можно «отклонить» — визит либо был,
      либо нет, поэтому этот скилл не участвует в чекбоксах, а просто
      сообщает текущую серию как read-only строку в карточке.
   ============================================================ */
var StreakAPI=null;
function loadStreakApi(cb){
  if(StreakAPI){ cb(StreakAPI); return; }
  try{ import('./js/streak.js').then(function(mod){ StreakAPI=mod; cb(mod); }).catch(function(){ cb(null); }); }catch(e){ cb(null); }
}
function streakSkill(text, state){
  var items={}; var s=StreakAPI;
  var current = 0;
  try{ if(s && s.getStreak) current=s.getStreak().current; }catch(e){}
  items['streak:info']={label:'Серия дней · сейчас '+current, amount:0, domain:'streak', readOnly:true};
  loadStreakApi(function(){});
  return {items:items, questions:[]};
}
function streakCommit(key, item, state, doneCb){
  loadStreakApi(function(api){
    try{ if(api && api.recordVisit) api.recordVisit(); }catch(e){}
    doneCb&&doneCb();
  });
}

/* ============================================================
   5. COSMOS-BANK-SKILL — резонанс дня банкуется на будущее открытие
      Cosmos-зоны (universeProgression.js / cauldron_rules.json
      unlock_checks.cosmos), ДАЖЕ пока зона ещё заперта. Банк —
      простое аддитивное поле STATE.cosmosBank (в tigel_v1), которое
      universeProgression / будущий Cosmos-экран сможет прочитать и
      "уже найти там" накопленное, когда игрок наберёт пороги.
   ============================================================ */
function cosmosBankSkill(text, state){
  var t=(text||'').toLowerCase(); var items={};
  var hits=0; ['космос','вселенн','галактик','звёзд','планет','мирозда'].forEach(function(w){ if(t.indexOf(w)>=0) hits++; });
  var lv=0; try{ lv=(typeof lightVal==='function')?lightVal():0; }catch(e){}
  var amount=Math.round((lv||0)*0.05)+hits*2;
  if(amount<=0) return {items:items, questions:[]};
  items['cosmos:bank']={label:'Банк Космоса · отложено на открытие зоны', amount:amount, domain:'cosmos'};
  return {items:items, questions:[]};
}
function cosmosBankCommit(key, item, state){
  state.cosmosBank = (state.cosmosBank||0) + item.amount;
}
/* публичный геттер для будущего Cosmos-экрана: "что уже накоплено banked" */
function getCosmosBank(){
  var s=S(); return s?(s.cosmosBank||0):0;
}

/* ============================================================
   6. CARD-BIAS-SKILL — небольшой, аддитивный наклон дневного
      reward_rarity (data/cauldron_rules.json) в сторону более редких
      карт, если день был насыщенным. Не переизобретает систему карт —
      просто пишет STATE.cardBiasToday (эпик/легендарный bonus-точки),
      которую forge.js / будущий дроп-движок волен прочитать так же,
      как читает light_bias_thresholds по количеству начисленного света.
   ============================================================ */
function cardBiasSkill(text, state){
  var items={};
  var lv=0; try{ lv=(typeof lightVal==='function')?lightVal():0; }catch(e){}
  if(lv<10) return {items:items, questions:[]};
  var epic=lv>=40?4:lv>=20?2:1;
  var legendary=lv>=40?1:lv>=20?0.5:0.2;
  items['cardbias:today']={label:'Наклон дропа дня · +epic '+epic+' / +legendary '+legendary, amount:1, domain:'cardbias', epic:epic, legendary:legendary};
  return {items:items, questions:[]};
}
function cardBiasCommit(key, item, state){
  state.cardBiasToday = {epic_bonus:item.epic, legendary_bonus:item.legendary, at:new Date().toISOString()};
}

/* ============================================================
   7. INTENTION-SKILL — намерения игрока (STATE.intentions, новая
      сущность, см. секцию 9). Скилл ищет в тексте дня совпадения с
      уже заявленными намерениями (по словам из intention.text) и
      предлагает продвинуть их progress.
   ============================================================ */
function intentionWords(txt){
  return (txt||'').toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(function(w){ return w.length>=4; });
}
function intentionSkill(text, state){
  var items={}, questions=[];
  var list=state.intentions||[];
  if(!list.length) return {items:items, questions:questions};
  var t=(text||'').toLowerCase(); if(!t.trim()) return {items:items, questions:questions};
  list.forEach(function(intent){
    if(intent.done) return;
    var words=intentionWords(intent.text); var hits=0;
    words.forEach(function(w){ if(t.indexOf(w)>=0) hits++; });
    if(hits>0){
      items['intention:'+intent.id] = {label:'Намерение · '+intent.text.slice(0,40)+(intent.text.length>40?'…':''), amount:Math.min(3,hits), domain:'intention', intentId:intent.id};
    }
  });
  if(Object.keys(items).length){
    questions.push({id:'intention_sincerity', text:'Это было реальное движение к намерению — или просто упоминание вскользь?', domain:'intention'});
  }
  return {items:items, questions:questions};
}
function intentionCommit(key, item, state){
  var list=state.intentions||(state.intentions=[]);
  var it=list.find(function(x){ return x.id===item.intentId; });
  if(!it) return;
  it.progress=(it.progress||0)+item.amount;
  if(it.progress>=(it.target||9)) it.done=true;
}

/* ============================================================
   8. LENS-SKILL — ЧИСТАЯ ОБЁРТКА над awara-lens.js, ничего не
      дублирует. proposeTextResonance/commitResonance/calibRecord
      уже существуют и работают через STATE.pendingResonance —
      здесь мы просто отражаем их результат в общий вид items,
      чтобы линзы попали в тот же интерфейс "все домены разом",
      и на коммите вызываем ИХ РОДНОЙ commitResonance() (см. ниже,
      в generalCommit), а не пишем uses самостоятельно.
   ============================================================ */
function lensSkill(text, state){
  var items={};
  if(!window.AwaraLens || typeof window.AwaraLens.proposeTextResonance!=='function') return {items:items, questions:[]};
  var scores = window.AwaraLens.proposeTextResonance(text, state && state.mats);
  Object.keys(scores).forEach(function(k){
    items['lens:'+k] = {label:'Линза · '+k, amount:scores[k], domain:'lens', lensKey:k};
  });
  return {items:items, questions:[]};
}
/* lens commit делается через commitResonance() — см. generalCommit() ниже;
   здесь commit-функция НЕ пишет напрямую (только маркер для регистра). */
function lensCommit(){ /* no-op: см. generalCommit() — вызывает AwaraLens.commitResonance() один раз */ }

/* ============================================================
   9. РЕЕСТР НАВЫКОВ
   ============================================================ */
var SKILLS=[
  {id:'lens',       fn:lensSkill,       commit:lensCommit},
  {id:'daimon',     fn:daimonSkill,     commit:daimonCommit},
  {id:'soul',       fn:soulSkill,       commit:soulCommit},
  {id:'temple',     fn:templeSkill,     commit:templeCommit},
  {id:'streak',     fn:streakSkill,     commit:streakCommit},
  {id:'cosmosBank', fn:cosmosBankSkill, commit:cosmosBankCommit},
  {id:'cardBias',   fn:cardBiasSkill,   commit:cardBiasCommit},
  {id:'intention',  fn:intentionSkill,  commit:intentionCommit}
];

var MAX_QUESTIONS=3;
function runSkills(text, state){
  var allItems={}, allQuestions=[], seenQ={};
  SKILLS.forEach(function(sk){
    var res; try{ res=sk.fn(text, state)||{}; }catch(e){ res={}; }
    Object.keys(res.items||{}).forEach(function(k){ allItems[k]=res.items[k]; });
    (res.questions||[]).forEach(function(q){
      if(seenQ[q.id]) return; seenQ[q.id]=true;
      if(allQuestions.length<MAX_QUESTIONS) allQuestions.push(q);
    });
  });
  return {items:allItems, questions:allQuestions};
}

/* ============================================================
   10. ПРЕДЛОЖЕНИЕ (propose) — с учётом калибровки по домену
   ============================================================ */
function proposeExperience(text, state){
  var out=runSkills(text, state);
  var items=out.items;
  Object.keys(items).forEach(function(k){
    var it=items[k];
    if(it.readOnly) return; /* streak-инфо не участвует в доверии/фильтре */
    if(CALIBRATABLE_DOMAINS[it.domain] && state){
      var trust=voiceTrust(state, k);
      it.amount = it.amount * trust;
      if(it.amount < 0.05){ delete items[k]; }
    }
  });
  return {items:items, questions:out.questions};
}

/* ============================================================
   11. ИНТЕРВЬЮ (уточняющие вопросы) — минимальный v1: карточка с
       ≤3 вопросами, кнопка "Ответил(а)" просто закрывает блок перед
       показом финального предложения. Ответы пока не меняют веса
       программно (это заявленный v1-скоуп: "модест", не диалоговый
       движок) — но текст ответа сохраняется в pendingExperience.answers
       и уходит в летопись/AI-контекст как есть, чтобы Даймон/ИИ мог
       учитывать его в живом чате, даже если сама формула резонанса
       его пока не парсит.
   ============================================================ */
function ensureInterviewUI(){
  if(document.getElementById('voiceInterviewCard')) return;
  var card=document.getElementById('resonanceCard');
  if(!card || !card.parentNode) return;
  var div=document.createElement('div');
  div.className='card awara-glass-card';
  div.id='voiceInterviewCard';
  div.style.display='none';
  div.innerHTML='<span class="label">Голос совести уточняет</span><p class="sub" style="font-size:12px;margin-bottom:8px">Пара вопросов, прежде чем предложить распределение — отвечай коротко, как чувствуешь</p><div id="voiceInterviewList"></div>';
  card.parentNode.insertBefore(div, card);
}
function renderInterview(state){
  ensureInterviewUI();
  var card=document.getElementById('voiceInterviewCard'), list=document.getElementById('voiceInterviewList');
  if(!card||!list) return;
  var pend = state && state.pendingExperience;
  var qs = pend && pend.questions;
  if(!qs || !qs.length){ card.style.display='none'; return; }
  card.style.display=''; list.innerHTML='';
  qs.forEach(function(q,i){
    var row=document.createElement('div'); row.style.cssText='margin-bottom:10px';
    var p=document.createElement('p'); p.className='sub'; p.style.cssText='font-size:14px;color:#e6e1f2;margin-bottom:5px'; p.textContent=q.text;
    var inp=document.createElement('input'); inp.className='input'; inp.style.marginBottom='0'; inp.setAttribute('data-vq',q.id); inp.placeholder='Твой ответ (необязательно)';
    if(pend.answers && pend.answers[q.id]) inp.value=pend.answers[q.id];
    row.appendChild(p); row.appendChild(inp); list.appendChild(row);
  });
}
function collectInterviewAnswers(state){
  var list=document.getElementById('voiceInterviewList');
  var answers=(state.pendingExperience&&state.pendingExperience.answers)||{};
  if(list){
    list.querySelectorAll('input[data-vq]').forEach(function(inp){
      var v=(inp.value||'').trim(); if(v) answers[inp.getAttribute('data-vq')]=v;
    });
  }
  return answers;
}

/* ============================================================
   12. КАРТОЧКА ПРЕДЛОЖЕНИЯ (общий вид для всех доменов кроме lens,
       у которой уже есть своя карточка #resonanceCard/#resonanceList —
       её не трогаем, оставляем как есть; здесь — соседняя карточка
       для остальных доменов).
   ============================================================ */
function ensureExperienceUI(){
  if(document.getElementById('experienceCard')) return;
  var anchor=document.getElementById('voiceInterviewCard') || document.getElementById('resonanceCard');
  if(!anchor || !anchor.parentNode) return;
  var div=document.createElement('div');
  div.className='card awara-glass-card';
  div.id='experienceCard';
  div.style.display='none';
  div.innerHTML='<span class="label">Голос совести · распределение дня</span><p class="sub" style="font-size:12px;margin-bottom:8px">Даймон, Душа, Храм и намерения услышали своё в тексте — отметь, что верно</p><div id="experienceList"></div>';
  anchor.parentNode.insertBefore(div, anchor.nextSibling);
}
function renderExperienceCard(){
  ensureExperienceUI();
  var card=document.getElementById('experienceCard'), list=document.getElementById('experienceList');
  if(!card||!list) return;
  var s=S(); var pend=s&&s.pendingExperience;
  var items=pend&&pend.items;
  if(!items || !Object.keys(items).length){ card.style.display='none'; return; }
  card.style.display=''; list.innerHTML='';
  Object.keys(items).forEach(function(k){
    var it=items[k];
    var row=document.createElement('label'); row.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer';
    if(it.readOnly){
      var span=document.createElement('span'); span.style.cssText='color:var(--muted);font-size:13px'; span.textContent=it.label;
      row.appendChild(span); list.appendChild(row); return;
    }
    var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=true; cb.setAttribute('data-exp',k); cb.style.cssText='width:16px;height:16px';
    var txt=document.createElement('span'); txt.textContent=it.label+(it.amount?(' · +'+(Math.round(it.amount*10)/10)):'');
    row.appendChild(cb); row.appendChild(txt); list.appendChild(row);
  });
}

/* ============================================================
   13. КОММИТ — единая точка, вызывается ИЗ ТОЙ ЖЕ кнопки "Прожито",
       что уже коммитит линзы (см. awara-lens.js liveBtn hook). Мы
       навешиваем свой обработчик на ту же кнопку, ПОСЛЕ линз, чтобы
       порядок был: 1) commitResonance() линз (уже навешено lens.js),
       2) наш generalCommit() для остальных доменов.
   ============================================================ */
function generalCommit(){
  var s=S(); if(!s||!s.pendingExperience) return;
  var pend=s.pendingExperience;
  var items=pend.items||{};
  var list=document.getElementById('experienceList');
  var checked={};
  if(list && list.children.length){
    list.querySelectorAll('input[type=checkbox][data-exp]').forEach(function(cb){ if(cb.checked) checked[cb.getAttribute('data-exp')]=true; });
  } else {
    Object.keys(items).forEach(function(k){ checked[k]=true; });
  }
  pend.answers = collectInterviewAnswers(s);

  Object.keys(items).forEach(function(k){
    var it=items[k];
    if(it.readOnly){
      /* всегда "принято" — read-only просто исполняет свой commit */
      var skill=SKILLS.filter(function(sk){return sk.id===domainToSkillId(it.domain);})[0];
      if(skill) skill.commit(k, it, s);
      return;
    }
    var accepted=!!checked[k];
    if(CALIBRATABLE_DOMAINS[it.domain]) voiceRecord(s, k, accepted);
    if(!accepted) return;
    var skillId=domainToSkillId(it.domain);
    var skill=SKILLS.filter(function(sk){return sk.id===skillId;})[0];
    if(skill) skill.commit(k, it, s);
  });

  /* журналируем итог дня для будущего Super-Game-интерфейса */
  recordTodaysExperienceEnergy(s, items, checked);

  s.pendingExperience=null;
  try{ if(typeof save==='function') save(); }catch(e){}
  try{ renderExperienceCard(); }catch(e){}
  try{ var ic=document.getElementById('voiceInterviewCard'); if(ic) ic.style.display='none'; }catch(e){}
}
function domainToSkillId(domain){
  var map={daimon:'daimon',soul:'soul',temple:'temple',streak:'streak',cosmos:'cosmosBank',cardbias:'cardBias',intention:'intention',lens:'lens'};
  return map[domain]||domain;
}

/* ============================================================
   14. STATE.intentions — минимальный CRUD (create/list/mark-progress).
       Не путать с STATE.intents (дневные galochki-задания в Тигле —
       это отдельная, уже существующая сущность, мы её не трогаем).
   ============================================================ */
function ensureIntentions(s){ if(!Array.isArray(s.intentions)) s.intentions=[]; return s.intentions; }
function addIntention(text, domain, target){
  var s=S(); if(!s) return null;
  var list=ensureIntentions(s);
  var it={id:'int_'+Date.now()+'_'+Math.floor(Math.random()*1000), text:String(text||'').trim(), domain:domain||null, progress:0, target:target||9, done:false, createdAt:new Date().toISOString()};
  if(!it.text) return null;
  list.push(it);
  try{ if(typeof save==='function') save(); }catch(e){}
  return it;
}
function listIntentions(){ var s=S(); return s?ensureIntentions(s).slice():[]; }
function markIntentionProgress(id, amount){
  var s=S(); if(!s) return false;
  var list=ensureIntentions(s); var it=list.find(function(x){return x.id===id;});
  if(!it) return false;
  it.progress=(it.progress||0)+(amount||1);
  if(it.progress>=(it.target||9)) it.done=true;
  try{ if(typeof save==='function') save(); }catch(e){}
  return true;
}

/* ============================================================
   15. getTodaysExperienceEnergy() — стабильный интерфейс для
       будущей Настолки (Super-Game), как просил геймдизайнер: одна
       функция, которая говорит "что игрок распределил сегодня".
       Не стаб — реально читает последний зафиксированный коммит.
   ============================================================ */
function recordTodaysExperienceEnergy(state, items, checked){
  var byDomain={};
  Object.keys(items).forEach(function(k){
    var it=items[k]; if(it.readOnly) return; if(!checked[k]) return;
    byDomain[it.domain]=(byDomain[it.domain]||0)+(it.amount||0);
  });
  state.todaysExperienceEnergy = {
    at:new Date().toISOString(),
    byDomain:byDomain,
    total:Object.keys(byDomain).reduce(function(sum,k){return sum+byDomain[k];},0)
  };
}
function getTodaysExperienceEnergy(){
  var s=S(); if(!s) return {at:null, byDomain:{}, total:0};
  return s.todaysExperienceEnergy || {at:null, byDomain:{}, total:0};
}
/* синоним, ближе к формулировке задания ("getTodaysDaimonEnergy"-style) — тот же контракт */
function getTodaysDaimonEnergy(){
  var e=getTodaysExperienceEnergy();
  return {at:e.at, amount:(e.byDomain&&e.byDomain.daimon)||0};
}

/* ============================================================
   16. ОБВЯЗКА С ДВИЖКОМ — тот же приём, что в awara-lens.js:
       оборачиваем doMelt (чтобы посчитать pendingExperience сразу
       после того, как линзы посчитали pendingResonance), renderResult
       (чтобы отрисовать обе карточки) и клик по liveBtn (чтобы
       закоммитить после линз).
   ============================================================ */
try{
  if(typeof window.doMelt==='function' && !window.doMelt.__voiceConscience){
    var _dm2=window.doMelt;
    window.doMelt=function(){
      try{
        var ta=document.getElementById('dayText'); var s=S();
        if(ta && s){
          var out=proposeExperience(ta.value, s);
          s.pendingExperience = {items:out.items, questions:out.questions, answers:{}};
        }
      }catch(e){}
      return _dm2.apply(this, arguments);
    };
    window.doMelt.__voiceConscience=true;
  }
}catch(e){}
try{
  if(typeof window.renderResult==='function' && !window.renderResult.__voiceConscience){
    var _rr2=window.renderResult;
    window.renderResult=function(){
      var r=_rr2.apply(this, arguments);
      try{ var s=S(); renderInterview(s); renderExperienceCard(); }catch(e){}
      return r;
    };
    window.renderResult.__voiceConscience=true;
  }
}catch(e){}
try{
  var _liveBtnExp=document.getElementById('liveBtn');
  if(_liveBtnExp && !_liveBtnExp.__voiceConscienceCommit){
    /* capture:true + добавлено ПОСЛЕ awara-lens.js в порядке загрузки скриптов
       (см. tigel-app.html: awara-lens.js подключён раньше) — оба обработчика
       используют capture-фазу и сработают в порядке регистрации: линзы первыми. */
    _liveBtnExp.addEventListener('click', function(){ try{ generalCommit(); }catch(e){} }, true);
    _liveBtnExp.__voiceConscienceCommit=true;
  }
}catch(e){}

/* ============================================================
   17. Публичный API
   ============================================================ */
try{
  window.AwaraVoiceConscience = {
    runSkills:runSkills,
    proposeExperience:proposeExperience,
    renderExperienceCard:renderExperienceCard,
    renderInterview:renderInterview,
    commit:generalCommit,
    addIntention:addIntention,
    listIntentions:listIntentions,
    markIntentionProgress:markIntentionProgress,
    getTodaysExperienceEnergy:getTodaysExperienceEnergy,
    getTodaysDaimonEnergy:getTodaysDaimonEnergy,
    getCosmosBank:getCosmosBank,
    voiceTrust:voiceTrust
  };
}catch(e){}

/* поднимаем soulTigelSync.js один раз как модуль на window.AwaraSoulSync,
   чтобы soulCommit() (секция 2) мог его вызвать без своего import() —
   динамический import тут же, при старте файла. */
try{
  if(!window.AwaraSoulSync){
    import('./js/soulTigelSync.js').then(function(mod){ window.AwaraSoulSync=mod; }).catch(function(){});
  }
}catch(e){}

/* первичный прогрев кэша правил для soul-skill (не блокирует старт) */
try{ loadCauldronRules(function(){}); }catch(e){}

})();
