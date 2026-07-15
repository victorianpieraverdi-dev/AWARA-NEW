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

/* ── Player ID ── */
function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}
function getPlayerId(){
  var id;
  try{id=localStorage.getItem(PID_KEY);}catch(e){}
  if(!id){
    id=uuid();
    try{localStorage.setItem(PID_KEY,id);}catch(e){}
    console.log('[CloudSync] new playerId:',id);
  }
  return id;
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

/* ── API вызов ── */
function api(body,cb){
  try{
    fetch(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    }).then(function(r){return r.json();}).then(function(j){
      cb(null,j);
    }).catch(function(e){cb(e);});
  }catch(e){cb(e);}
}

/* ── Сохранить в облако ── */
function cloudSave(cb){
  if(syncing)return;
  syncing=true;
  var ts=Date.now();
  var data=collectAll();
  api({action:'save',playerId:getPlayerId(),data:data,ts:ts},function(err,res){
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
  api({action:'load',playerId:getPlayerId()},function(err,res){
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

  // При уходе со страницы — сохранить
  window.addEventListener('beforeunload',function(){
    // Sync save (beacon)
    try{
      var data=collectAll();
      var body=JSON.stringify({action:'save',playerId:getPlayerId(),data:data,ts:Date.now()});
      navigator.sendBeacon(ENDPOINT,new Blob([body],{type:'application/json'}));
    }catch(e){}
  });

  // При возвращении на страницу — загрузить
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){
      cloudLoad();
    }
  });

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
