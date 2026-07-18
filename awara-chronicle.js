/* ===== AWARA · Хроника (энергия дня) =====
   Лента AI-записей по дням. Открывается кнопкой в Летописи (#s-chron).
   Сервер (awara-daily.js, action getChronicleEntry) сам генерирует запись
   за сегодня при первом обращении и кеширует её — повторные открытия в
   тот же день не тратят вызов DeepSeek заново.
   ================================================ */
(function(){
'use strict';
if(window.__awaraChronicle)return;
window.__awaraChronicle=1;

var ENDPOINT='/.netlify/functions/awara-daily';

function getPid(){
  try{return localStorage.getItem('awara_player_id')||null;}catch(e){return null;}
}

function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function buildModal(){
  var wrap=document.createElement('div');
  wrap.id='chronicleModal';
  wrap.className='libmodal open';
  // см. awara-identity.js — .libmodal сам по себе absolute и не выше игровых
  // оверлеев, здесь нужен настоящий полноэкранный fixed поверх всего.
  wrap.style.position='fixed';
  wrap.style.zIndex='200000';
  wrap.innerHTML=
    '<div class="libcard awara-glass-card" style="max-width:420px">'+
      '<div class="libglyph">📜</div>'+
      '<h2 style="margin-top:6px;font-family:Cinzel,serif;color:var(--gold);font-size:20px;text-align:center">Хроника</h2>'+
      '<div id="chronBody" style="margin-top:14px;text-align:left;max-height:52vh;overflow:auto">Читаю день…</div>'+
      '<button class="btn ghost" id="chronCloseBtn" style="margin-top:14px">Закрыть</button>'+
    '</div>';
  document.body.appendChild(wrap);
  wrap.querySelector('#chronCloseBtn').onclick=function(){wrap.remove();};
  return wrap;
}

function entryCard(entry,isToday){
  return '<div class="card awara-glass-card" style="margin-bottom:10px'+(isToday?';border-color:rgba(201,168,76,.4)':'')+'">'+
    '<span class="label">'+esc(entry.day)+(isToday?' · сегодня':'')+'</span>'+
    '<p class="adv" style="font-size:14px;margin-top:6px">'+esc(entry.text)+'</p>'+
  '</div>';
}

function open(){
  var existing=document.getElementById('chronicleModal');
  if(existing)existing.remove();
  var modal=buildModal();
  var body=modal.querySelector('#chronBody');
  var pid=getPid();
  if(!pid){body.innerHTML='<p class="sub">Сначала войди по имени-ключу.</p>';return;}

  fetch(ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'getChronicleEntry',player:pid})
  }).then(function(r){return r.json();}).then(function(j){
    if(!j||!j.today){body.innerHTML='<p class="sub">Не удалось прочитать Хронику.</p>';return;}
    var today=j.today;
    var feed=(j.feed||[]).filter(function(e){return e.day!==today.day;});
    var html=entryCard(today,true);
    feed.forEach(function(e){html+=entryCard(e,false);});
    body.innerHTML=html;
  }).catch(function(){
    body.innerHTML='<p class="sub">Не достучался до сервера — попробуй ещё раз.</p>';
  });
}

window.AwaraChronicle={open:open};
})();
