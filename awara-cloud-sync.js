/* ===== AWARA · Cloud Sync (client-side) =====
   v1 · 2026-07-09
   Авто-синк localStorage ↔ Firestore через Netlify Function.
   Каждому игроку — свой playerId (UUID, хранится в localStorage).
   Синк: при загрузке, каждые 5 мин, при уходе со страницы.
   ================================================ */
(function(){
'use strict';
if(window.__awaraCloudSync>=1)return;
window.__awaraCloudSync=1;

var PID_KEY='awara_player_id';
var SYNC_TS_KEY='awara_sync_ts';
var ENDPOINT='/.netlify/functions/awara-sync';
var INTERVAL=5*60*1000; // 5 мин
var timer=null;
var syncing=false;

/* ── Player ID ──
   Имя-ключ задаёт игрок сам (окно входа, awara-identity.js) — здесь только
   читаем localStorage. Без него синк не запускается (см. boot ниже). */
function getPlayerId(){
  try{return localStorage.getItem(PID_KEY)||null;}catch(e){return null;}
}

/* ── Собрать все данные ── */
function collectAll(){
  var data={};
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      // пропустить служебные ключи sync
      if(k===SYNC_TS_KEY)continue;
      if(k) data[k]=localStorage.getItem(k);
    }
  }catch(e){}
  return data;
}

/* ── Восстановить данные ── */
function restoreAll(data){
  if(!data||typeof data!=='object')return 0;
  var count=0;
  // Сохранить текущий playerId
  var pid=getPlayerId();
  for(var k in data){
    if(!data.hasOwnProperty(k))continue;
    if(k===SYNC_TS_KEY)continue;
    try{localStorage.setItem(k,data[k]);count++;}catch(e){}
  }
  // убедиться что playerId сохранён
  try{localStorage.setItem(PID_KEY,pid);}catch(e){}
  return count;
}

/* ── API вызов ──
   15с потолок: на мобильной сети fetch может зависнуть без ошибки, тогда
   callback никогда не вызовется — AbortController гарантирует, что он
   всё равно придёт (с ошибкой таймаута). */
function api(body,cb){
  try{
    var ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
    var timer=ctrl?setTimeout(function(){ctrl.abort();},15000):null;
    fetch(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body),
      signal:ctrl?ctrl.signal:undefined
    }).then(function(r){if(timer)clearTimeout(timer);return r.json();}).then(function(j){
      cb(null,j);
    }).catch(function(e){
      if(timer)clearTimeout(timer);
      cb((e&&e.name==='AbortError')?new Error('таймаут 15с'):e);
    });
  }catch(e){cb(e);}
}

/* ── Сохранить в облако ── */
function cloudSave(cb){
  if(syncing)return;
  var pid=getPlayerId();
  if(!pid){if(cb)cb(new Error('no playerId yet'));return;}
  syncing=true;
  var ts=Date.now();
  var data=collectAll();
  api({action:'save',playerId:pid,data:data,ts:ts},function(err,res){
    syncing=false;
    if(err){
      console.warn('[CloudSync] save error:',err);
      if(cb)cb(err);
      return;
    }
    if(res&&res.ok){
      try{localStorage.setItem(SYNC_TS_KEY,String(ts));}catch(e){}
      console.log('[CloudSync] saved to cloud');
    }else if(res&&res.reason==='cloud_newer'){
      console.log('[CloudSync] cloud has newer data, loading...');
      cloudLoad();
    }
    if(cb)cb(null,res);
  });
}

/* ── Загрузить из облака ── */
function cloudLoad(cb){
  var pid=getPlayerId();
  if(!pid){if(cb)cb(new Error('no playerId yet'));return;}
  api({action:'load',playerId:pid},function(err,res){
    if(err){
      console.warn('[CloudSync] load error:',err);
      if(cb)cb(err);
      return;
    }
    if(res&&res.ok&&res.found){
      var localTs=0;
      try{localTs=parseInt(localStorage.getItem(SYNC_TS_KEY))||0;}catch(e){}
      // Облачные данные новее → восстановить
      if(res.ts>localTs){
        var count=restoreAll(res.data);
        try{localStorage.setItem(SYNC_TS_KEY,String(res.ts));}catch(e){}
        console.log('[CloudSync] restored',count,'keys from cloud');
        if(typeof showToast==='function')showToast('☁️ Данные синхронизированы');
        // Перезагрузить STATE если есть
        try{if(typeof load==='function')load();}catch(e){}
        if(cb)cb(null,{restored:count});
        return;
      }else{
        console.log('[CloudSync] local data is up to date');
      }
    }else{
      console.log('[CloudSync] no cloud data found — first sync');
      // Первый раз — сохранить текущее состояние
      cloudSave();
    }
    if(cb)cb(null,res);
  });
}

/* ── Авто-синк ── */
function startAutoSync(){
  if(timer)return;
  timer=setInterval(function(){
    cloudSave();
  },INTERVAL);
}

function stopAutoSync(){
  if(timer){clearInterval(timer);timer=null;}
}

/* ── Статус для UI ── */
function syncStatus(){
  var ts=0;
  try{ts=parseInt(localStorage.getItem(SYNC_TS_KEY))||0;}catch(e){}
  return{
    playerId:getPlayerId(),
    lastSync:ts?new Date(ts).toLocaleString():'никогда',
    lastSyncTs:ts
  };
}

/* ── Boot ── */
function boot(){
  // При уходе со страницы — сохранить (если уже есть имя-ключ)
  window.addEventListener('beforeunload',function(){
    var pid=getPlayerId();
    if(!pid)return;
    try{
      var data=collectAll();
      var body=JSON.stringify({action:'save',playerId:pid,data:data,ts:Date.now()});
      navigator.sendBeacon(ENDPOINT,new Blob([body],{type:'application/json'}));
    }catch(e){}
  });

  // При возвращении на страницу — загрузить (cloudLoad сама молча пропустит без имени)
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){
      cloudLoad();
    }
  });

  if(!getPlayerId()){
    console.log('[CloudSync] нет имени-ключа — жду входа игрока (awara-identity.js запустит синк сам)');
    return;
  }

  // Проверить доступность эндпоинта
  try{
    fetch(ENDPOINT,{method:'OPTIONS'}).then(function(r){
      if(r.status===204||r.status===200){
        console.log('[CloudSync] endpoint available');
        // При загрузке — сначала загрузить из облака
        cloudLoad(function(){
          // Затем запустить авто-синк
          startAutoSync();
        });
      }else{
        console.log('[CloudSync] endpoint returned',r.status,'— disabled');
      }
    }).catch(function(){
      console.log('[CloudSync] endpoint not available — offline mode');
    });
  }catch(e){
    console.log('[CloudSync] not available');
  }

  console.log('[CloudSync] v1 ready — playerId:',getPlayerId());
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,3000);});
}else{
  setTimeout(boot,3000);
}

window.AwaraCloudSync={
  save:cloudSave,
  load:cloudLoad,
  status:syncStatus,
  start:startAutoSync,
  stop:stopAutoSync,
  getPlayerId:getPlayerId
};
})();
