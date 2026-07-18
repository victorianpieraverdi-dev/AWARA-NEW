/* ===== AWARA · Онбординг (вход -> Даймон -> первый день) =====
   Отдельный самодостаточный слой. Движок tigel-app.html не трогает.
   Полагается на глобалы основного скрипта: STATE, calcNatal, go, signOf, showToast. */
(function(){
'use strict';
if(window.AwaraOnboard&&window.AwaraOnboard.__ready)return;
var DONE='awara_onboarded';
function $(id){return document.getElementById(id);}
function curState(){try{if(typeof STATE!=='undefined'&&STATE)return STATE;}catch(e){}return (window.STATE||null);}

function styleOnce(){
  if($('ob-style'))return;
  var st=document.createElement('style');st.id='ob-style';
  st.textContent="#ob-overlay{position:absolute;inset:0;z-index:70;background:radial-gradient(circle at 50% 28%,#0e0a20,#02020a 72%);display:none;flex-direction:column;padding:58px 26px 36px;overflow-y:auto}#ob-overlay.open{display:flex}#ob-overlay::-webkit-scrollbar{width:0}.ob-step{display:none}.ob-step.on{display:block;animation:fade .4s ease}.ob-orb{width:120px;height:120px;border-radius:50%;margin:6px auto 16px;display:flex;align-items:center;justify-content:center;font-size:46px;background:radial-gradient(circle at 46% 36%,var(--violet-soft),var(--violet) 54%,#241a48 80%);box-shadow:0 0 50px rgba(123,98,201,.5),inset 0 0 36px rgba(157,134,224,.4)}.ob-dots{display:flex;gap:7px;justify-content:center;margin:22px 0 0}.ob-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.16);transition:.2s}.ob-dots i.on{background:var(--gold);box-shadow:0 0 8px rgba(201,168,76,.6)}.ob-skip{display:block;text-align:center;margin-top:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;background:none;border:none;width:100%;padding:8px}.ob-adv{margin:2px 0 4px}.ob-adv summary{cursor:pointer;color:var(--violet-soft);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}.ob-line{font-size:16px;line-height:1.5;color:#e6e1f2;margin:8px 0}#ob-cityWrap{position:relative}#ob-city-dd{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:90;background:rgba(14,10,32,.98);border:1px solid rgba(201,168,76,.28);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.55);max-height:230px;overflow-y:auto;display:none}#ob-city-dd.on{display:block}.ob-opt{padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);font-size:14.5px;color:#e6e1f2;transition:background .15s}.ob-opt:last-child{border-bottom:none}.ob-opt:hover,.ob-opt.sel{background:rgba(123,98,201,.22)}.ob-opt b{color:var(--gold);font-weight:600}.ob-opt small{display:block;color:var(--muted);font-size:11.5px;margin-top:2px}.ob-opt-empty{padding:10px 14px;color:var(--muted);font-size:13px}";
  document.head.appendChild(st);
}

var CUR=0;
function show(i){
  CUR=i;
  var steps=document.querySelectorAll('#ob-overlay .ob-step');
  for(var k=0;k<steps.length;k++){steps[k].classList.toggle('on',k===i);}
  var dots=document.querySelectorAll('#ob-overlay .ob-dots i');
  for(var j=0;j<dots.length;j++){dots[j].classList.toggle('on',j===i);}
  var ov=$('ob-overlay');if(ov)ov.scrollTop=0;
}

function prefill(){
  try{
    var s=curState();var b=(s&&s.birth)||{};
    if($('ob-date'))$('ob-date').value=b.date||'';
    if($('ob-time'))$('ob-time').value=b.time||'';
    if($('ob-city'))$('ob-city').value=b.city||'';
    if($('ob-lat'))$('ob-lat').value=(b.lat!=null?b.lat:'');
    if($('ob-lon'))$('ob-lon').value=(b.lon!=null?b.lon:'');
    if($('ob-tz'))$('ob-tz').value=(b.tz!=null?b.tz:'');
  }catch(e){}
}

function setIn(id,val){var el=$(id);if(el&&val!=null&&String(val)!=='')el.value=val;}

function parseDateParts(s){var p=String(s||'').replace(/\D/g,'');if(p.length<8)return null;var D=+p.slice(0,2),M=+p.slice(2,4),Y=+p.slice(4,8);if(!D||!M||!Y||D>31||M>12||Y<1900||Y>2100)return null;return {D:D,M:M,Y:Y};}
function submitBirth(){
  var dp=parseDateParts($('ob-date')?$('ob-date').value:'');
  if(!dp){if(typeof showToast==='function')showToast('Впиши дату в формате ДД.ММ.ГГГГ');show(1);var di=$('ob-date');if(di)di.focus();return;}
  var dateStr=('0'+dp.D).slice(-2)+'.'+('0'+dp.M).slice(-2)+'.'+dp.Y;
  var timeRaw=(($('ob-time')&&$('ob-time').value)||'').trim();if(!/^\d{1,2}:\d{2}$/.test(timeRaw))timeRaw='12:00';
  var cityRaw=($('ob-city')&&$('ob-city').value)||'';
  setIn('bDate',dateStr);setIn('bTime',timeRaw);setIn('bCity',cityRaw);
  if($('ob-lat')&&$('ob-lat').value)setIn('bLat',$('ob-lat').value);
  if($('ob-lon')&&$('ob-lon').value)setIn('bLon',$('ob-lon').value);
  if($('ob-tz')&&$('ob-tz').value!=='')setIn('bTz',$('ob-tz').value);
  try{
    var s=curState();
    if(s){
      var pb=s.birth||{};
      var latV=parseFloat($('ob-lat')&&$('ob-lat').value);if(isNaN(latV))latV=(pb.lat!=null?pb.lat:0);
      var lonV=parseFloat($('ob-lon')&&$('ob-lon').value);if(isNaN(lonV))lonV=(pb.lon!=null?pb.lon:0);
      var tzV=parseFloat($('ob-tz')&&$('ob-tz').value);if(isNaN(tzV))tzV=(pb.tz!=null?pb.tz:0);
      s.birth={date:dateStr,time:timeRaw,city:cityRaw,lat:latV,lon:lonV,tz:tzV};
      if(typeof computeNatal==='function'){s.natal=computeNatal(s.birth);if(typeof deriveDaimon==='function')s.daimon=deriveDaimon(s.natal);if(typeof save==='function')save();}
    }
  }catch(e){}
  try{if(typeof calcNatal==='function')calcNatal();}catch(e){}
  try{if(typeof renderNatal==='function')renderNatal();}catch(e){}
  try{if(typeof renderDaimon==='function')renderDaimon();}catch(e){}
  try{if(typeof renderIstok==='function')renderIstok();}catch(e){}
  renderReveal();
  show(2);
}

function renderReveal(){
  var box=$('ob-reveal');if(!box)return;
  var s=curState();
  try{if(s&&!s.daimon&&s.natal&&typeof deriveDaimon==='function')s.daimon=deriveDaimon(s.natal);}catch(e){}
  var d=s&&s.daimon,n=s&&s.natal;
  if(!d){box.innerHTML='<p class=\"ob-line\">Карта пока не рассчитана. Вернись на шаг назад и проверь данные рождения.</p>';return;}
  var GL={'Гроза':'🐉','Огонь':'🔥','Вода':'🌊','Земля':'🪨','Воздух':'🌬','Эфир':'✨','Рассвет':'🌅'};
  var g=GL[d.el]||'🐉';
  var nat='';
  try{if(n&&typeof signOf==='function'){nat='Лагна в '+signOf(n.bodies['Лагна'])+' · Солнце в '+signOf(n.bodies['Солнце'])+' · Луна в накшатре '+d.nak+'.';}}catch(e){}
  box.innerHTML='<div class=\"ob-orb\">'+g+'</div>'
    +'<div style=\"text-align:center\"><div class=\"dm-name\">'+d.name+'</div><div class=\"dm-sig\">'+(d.sig||'')+'</div></div>'
    +'<div class=\"card\" style=\"margin-top:16px\"><p class=\"ob-line\" style=\"margin:0\">Рождён из накшатры <b style=\"color:var(--gold)\">'+d.nak+'</b> (управитель '+d.lord+'). Идёт рядом стихией <b style=\"color:var(--gold)\">'+d.el+'</b>, облик — '+d.form+'.</p></div>'
    +(nat?'<div class=\"card\" style=\"margin-top:10px\"><span class=\"label\">Натальная основа</span><p class=\"ob-line\" style=\"margin:4px 0 0;font-size:15px\">'+nat+'</p></div>':'');
}

function finish(target){
  try{localStorage.setItem(DONE,'1');}catch(e){}
  var ov=$('ob-overlay');if(ov)ov.classList.remove('open');
  try{if(typeof go==='function')go(target||'tigel');}catch(e){}
  if(target!=='istok'){try{if(typeof showToast==='function')showToast('Положи прожитый день в Тигель');}catch(e){}}
}

/* ---- Авто-форматирование даты/времени + геопоиск города (добавлено) ---- */
function fmtDate(v){var d=String(v).replace(/\D/g,'').slice(0,8);var o=d.slice(0,2);if(d.length>2)o+='.'+d.slice(2,4);if(d.length>4)o+='.'+d.slice(4,8);return o;}
function fmtTime(v){var d=String(v).replace(/\D/g,'').slice(0,4);var o=d.slice(0,2);if(d.length>2)o+=':'+d.slice(2,4);return o;}
function bindAutoFmt(el,fn){if(!el)return;el.setAttribute('inputmode','numeric');el.addEventListener('input',function(e){var del=e.inputType&&e.inputType.indexOf('delete')===0;if(del)return;var s=fn(el.value);if(s!==el.value)el.value=s;});}
function tzOffset(tzName){try{var s=new Date().toLocaleString('en-US',{timeZone:tzName,timeZoneName:'shortOffset'});var m=s.match(/GMT([+-]\d+)/);if(!m)return '';var h=parseInt(m[1],10);return isNaN(h)?'':h;}catch(e){return '';}}
function geoSearch(q,cb){try{fetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language=ru&format=json&name='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){cb((j&&j.results)||[]);}).catch(function(){cb([]);});}catch(e){cb([]);}}
function enhanceInputs(){
  bindAutoFmt($('ob-date'),fmtDate);
  bindAutoFmt($('ob-time'),fmtTime);
  var ci=$('ob-city');if(!ci)return;
  var wrap=ci.parentNode;if(wrap){wrap.id='ob-cityWrap';wrap.style.position='relative';}
  var dd=$('ob-city-dd');
  if(!dd){dd=document.createElement('div');dd.id='ob-city-dd';(wrap||ci.parentNode).appendChild(dd);}
  var timer=null,items=[],sel=-1;
  function close(){dd.classList.remove('on');dd.innerHTML='';items=[];sel=-1;}
  function pick(r){
    ci.value=r.name+(r.admin1&&r.admin1!==r.name?(', '+r.admin1):'')+(r.country?(', '+r.country):'');
    if($('ob-lat'))$('ob-lat').value=(r.latitude!=null?Math.round(r.latitude*1e4)/1e4:'');
    if($('ob-lon'))$('ob-lon').value=(r.longitude!=null?Math.round(r.longitude*1e4)/1e4:'');
    if($('ob-tz')){var off=r.timezone?tzOffset(r.timezone):'';if(off!=='')$('ob-tz').value=off;}
    close();
  }
  function render(res){
    items=res;sel=-1;
    if(!res.length){dd.innerHTML='<div class="ob-opt-empty">Ничего не найдено — впиши вручную</div>';dd.classList.add('on');return;}
    dd.innerHTML=res.map(function(r,i){var sub=[r.admin1,r.country].filter(Boolean).join(' · ');return '<div class="ob-opt" data-i="'+i+'"><b>'+(r.name||'')+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>';}).join('');
    dd.classList.add('on');
    var opts=dd.querySelectorAll('.ob-opt');
    for(var k=0;k<opts.length;k++){(function(el){el.onclick=function(){pick(items[+el.getAttribute('data-i')]);};})(opts[k]);}
  }
  ci.setAttribute('autocomplete','off');
  ci.addEventListener('input',function(){var q=ci.value.trim();if(timer)clearTimeout(timer);if(q.length<2){close();return;}timer=setTimeout(function(){geoSearch(q,function(res){render(res);});},280);});
  ci.addEventListener('keydown',function(e){
    if(!dd.classList.contains('on')||!items.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;var os=dd.querySelectorAll('.ob-opt');for(var k=0;k<os.length;k++)os[k].classList.toggle('sel',k===sel);}
    else if(e.key==='Enter'){if(sel>=0){e.preventDefault();pick(items[sel]);}}
    else if(e.key==='Escape'){close();}
  });
  ci.addEventListener('blur',function(){setTimeout(close,180);});
}
function ensureUI(){
  if($('ob-overlay'))return;
  styleOnce();
  var ov=document.createElement('div');ov.id='ob-overlay';
  ov.innerHTML=
    '<div class=\"ob-step on\">'
     +'<div class=\"ob-orb\" style=\"background:radial-gradient(circle at 50% 38%,rgba(255,210,122,.95),rgba(201,168,76,.4) 40%,rgba(123,98,201,.2) 72%,transparent 78%);box-shadow:0 0 60px rgba(201,168,76,.4)\">🌌</div>'
     +'<span class=\"eyebrow\">Первый вход</span>'
     +'<h1>Добро пожаловать<br>в Тигель</h1>'
     +'<p class=\"sub\">Личная алхимия дня. За минуту я рассчитаю твою карту по дате рождения, познакомлю с твоим Даймоном — духом-спутником — и помогу выковать первый день.</p>'
     +'<button class=\"btn\" id=\"ob-go1\">Начать путь</button>'
     +'<button class=\"ob-skip\" id=\"ob-skip0\">Пропустить знакомство</button>'
    +'</div>'
    +'<div class=\"ob-step\">'
     +'<span class=\"eyebrow\">Шаг 1 · Рождение</span>'
     +'<h1>Данные рождения</h1>'
     +'<p class=\"sub\">По ним рассчитается натальная карта (сидерическая, Лахири) и родится твой Даймон.</p>'
     +'<span class=\"label\">Дата (ДД.ММ.ГГГГ)</span><input class=\"input\" id=\"ob-date\" placeholder=\"17.05.1991\">'
     +'<div class=\"row2\"><div><span class=\"label\">Время</span><input class=\"input\" id=\"ob-time\" placeholder=\"18:20\"></div><div><span class=\"label\">Город</span><input class=\"input\" id=\"ob-city\" placeholder=\"Город\"></div></div>'
     +'<details class=\"ob-adv\"><summary>Уточнить координаты</summary><div class=\"row2\"><div><span class=\"label\">Широта</span><input class=\"input\" id=\"ob-lat\" placeholder=\"59.41\"></div><div><span class=\"label\">Долгота</span><input class=\"input\" id=\"ob-lon\" placeholder=\"56.78\"></div></div><span class=\"label\">Часовой пояс (UTC+)</span><input class=\"input\" id=\"ob-tz\" placeholder=\"6\"></details>'
     +'<button class=\"btn\" id=\"ob-calc\">Зажечь карту</button>'
     +'<button class=\"ob-skip\" id=\"ob-back1\">← Назад</button>'
    +'</div>'
    +'<div class=\"ob-step\">'
     +'<span class=\"eyebrow\">Шаг 2 · Встреча</span>'
     +'<h1>Твой Даймон</h1>'
     +'<div id=\"ob-reveal\"></div>'
     +'<button class=\"btn\" id=\"ob-finish\">Выковать первый день →</button>'
     +'<button class=\"ob-skip\" id=\"ob-later\">Позже — осмотреться</button>'
    +'</div>'
    +'<div class=\"ob-dots\"><i class=\"on\"></i><i></i><i></i></div>';
  var phone=document.querySelector('.phone');
  (phone||document.body).appendChild(ov);
  $('ob-go1').onclick=function(){prefill();show(1);};
  $('ob-skip0').onclick=function(){finish('istok');};
  $('ob-back1').onclick=function(){show(0);};
  $('ob-calc').onclick=submitBirth;
  $('ob-finish').onclick=function(){finish('tigel');};
  $('ob-later').onclick=function(){finish('istok');};
  enhanceInputs();
}

function start(step){ensureUI();var ov=$('ob-overlay');if(ov)ov.classList.add('open');prefill();show(step||0);}
function isDone(){try{return localStorage.getItem(DONE)==='1';}catch(e){return false;}}
function reset(){try{localStorage.removeItem(DONE);}catch(e){}}

window.AwaraOnboard={start:start,finish:finish,reset:reset,isDone:isDone,__ready:true};

// Онбординг ждёт вход по имени-ключу (awara-identity.js) — тот вызовет
// AwaraOnboard.start() сам после входа. Без имени-ключа onboard.js молчит.
function hasIdentity(){try{return !!localStorage.getItem('awara_player_id');}catch(e){return false;}}
function boot(){if(!hasIdentity())return;if(!isDone())start(0);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,80);});}else{setTimeout(boot,80);}
})();
