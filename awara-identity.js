/* ===== AWARA · Identity (вход по имени-ключу) =====
   Кросс-девайсный ID вместо случайного UUID на каждом браузере. Пока в
   localStorage нет awara_player_id — показывает окно входа. Если у
   введённого имени уже есть сохранение на сервере — предлагает продолжить
   путь (сервер главнее локального: cloudLoad() восстанавливает поверх).
   Команда "выход" в чате Даймона (см. tigel-app.html aiSend) вызывает
   AwaraIdentity.logout() и возвращает к этому окну.
   ================================================ */
(function(){
'use strict';
if(window.__awaraIdentity)return;
window.__awaraIdentity=1;

var PID_KEY='awara_player_id';
var SYNC_ENDPOINT='/.netlify/functions/awara-sync';

function normalizeKey(raw){
  return (raw||'').trim().toLowerCase().replace(/\s+/g,'-').slice(0,40);
}

function checkExisting(key,cb){
  fetch(SYNC_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'load',playerId:key})
  }).then(function(r){return r.json();}).then(function(j){
    cb(null, !!(j&&j.ok&&j.found));
  }).catch(function(e){cb(e,false);});
}

// После входа — подтянуть сохранение (если есть) и запустить авто-синк.
// awara-cloud-sync.js сам не стартует без имени-ключа (см. его boot()).
function afterLogin(){
  try{
    if(window.AwaraCloudSync&&window.AwaraCloudSync.load){
      window.AwaraCloudSync.load(function(){
        window.AwaraCloudSync.start();
      });
    }
  }catch(e){}
}

function buildModal(){
  var wrap=document.createElement('div');
  wrap.id='identityModal';
  wrap.className='libmodal open';
  // .libmodal по умолчанию position:absolute (в рамках .phone) — здесь нужен
  // настоящий полноэкранный фикс поверх ВСЕГО. z-index сильно выше игровых
  // оверлеев (макс. найденный в игре — 100011, у #profCfmWrap).
  wrap.style.position='fixed';
  wrap.style.zIndex='200000';
  wrap.innerHTML=
    '<div class="libcard awara-glass-card" style="max-width:340px;text-align:center">'+
      '<div class="libglyph">🔑</div>'+
      '<h2 style="margin-top:6px;font-family:Cinzel,serif;color:var(--gold);font-size:20px">Назови своё имя-ключ</h2>'+
      '<p class="sub" style="font-size:13px;margin:10px 0 16px">Свяжет тебя на любом устройстве — телефоне, компьютере, где угодно.</p>'+
      '<input class="input" id="idKeyInput" placeholder="например, orion" autocomplete="off" style="text-align:center">'+
      '<div id="idMsg" class="sub" style="font-size:12px;margin-top:10px;min-height:16px;color:var(--gold)"></div>'+
      '<div id="idActions" style="margin-top:14px;display:flex;gap:8px">'+
        '<button class="btn awara-gold-button" id="idSubmitBtn" style="flex:1">Войти</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(wrap);
  return wrap;
}

function showLoginModal(){
  var existing=document.getElementById('identityModal');
  if(existing)existing.remove();
  var modal=buildModal();
  var input=modal.querySelector('#idKeyInput');
  var msg=modal.querySelector('#idMsg');
  var actions=modal.querySelector('#idActions');

  setTimeout(function(){try{input.focus();}catch(e){}},50);

  function submit(){
    var key=normalizeKey(input.value);
    if(!key){msg.textContent='Введи хотя бы одно слово.';return;}
    var btn=modal.querySelector('#idSubmitBtn');
    if(btn)btn.disabled=true;
    msg.textContent='Ищу тебя во вселенной…';
    checkExisting(key,function(err,found){
      if(btn)btn.disabled=false;
      if(err){msg.textContent='Не достучался до сервера — попробуй ещё раз.';return;}
      if(found){
        msg.textContent='';
        actions.innerHTML=
          '<button class="btn ghost" id="idNoBtn" style="flex:1">Другое имя</button>'+
          '<button class="btn awara-gold-button" id="idYesBtn" style="flex:1">Продолжить путь '+key+'?</button>';
        modal.querySelector('#idYesBtn').onclick=function(){
          try{localStorage.setItem(PID_KEY,key);}catch(e){}
          modal.remove();
          afterLogin();
          if(typeof showToast==='function')showToast('С возвращением, '+key);
        };
        modal.querySelector('#idNoBtn').onclick=function(){
          actions.innerHTML='<button class="btn awara-gold-button" id="idSubmitBtn" style="flex:1">Войти</button>';
          modal.querySelector('#idSubmitBtn').onclick=submit;
          input.value='';
          try{input.focus();}catch(e){}
        };
      }else{
        try{localStorage.setItem(PID_KEY,key);}catch(e){}
        modal.remove();
        afterLogin();
        if(typeof showToast==='function')showToast('Добро пожаловать, '+key);
      }
    });
  }

  modal.querySelector('#idSubmitBtn').onclick=submit;
  input.addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
}

function logout(){
  try{localStorage.removeItem(PID_KEY);}catch(e){}
  try{if(window.AwaraCloudSync&&window.AwaraCloudSync.stop)window.AwaraCloudSync.stop();}catch(e){}
  showLoginModal();
}

function getKey(){
  try{return localStorage.getItem(PID_KEY)||null;}catch(e){return null;}
}

function boot(){
  if(!getKey())showLoginModal();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot);
}else{
  boot();
}

window.AwaraIdentity={showLoginModal:showLoginModal,logout:logout,getKey:getKey};
})();
