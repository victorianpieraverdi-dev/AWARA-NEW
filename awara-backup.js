/* ===== AWARA · Backup & Restore + Cloud Sync Status =====
   v3 · 2026-07-09
   Панель: экспорт/импорт + облачный синк статус.
   Открывается из «Ещё» меню → 💾 Данные / бэкап.
   ======================================================= */
(function(){
'use strict';
if(window.__awaraBackup>=3)return;
window.__awaraBackup=3;

/* ── Экспорт ── */
function collectAll(){
  var data={_meta:{version:'1.0',date:new Date().toISOString(),app:'AWARA Тигель'}};
  try{for(var j=0;j<localStorage.length;j++){var k=localStorage.key(j);if(k)data[k]=localStorage.getItem(k);}}catch(e){}
  return data;
}

function exportBackup(){
  var json=JSON.stringify(collectAll(),null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var d=new Date();
  a.href=url;
  a.download='awara-backup-'+d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+'.json';
  document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  if(typeof showToast==='function') showToast('💾 Бэкап сохранён');
}

/* ── Импорт ── */
function importBackup(){
  var inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.style.display='none';
  inp.onchange=function(e){
    var file=e.target.files&&e.target.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);var count=0;
        for(var k in data){if(k==='_meta'||!data.hasOwnProperty(k))continue;try{localStorage.setItem(k,data[k]);count++;}catch(e2){}}
        if(typeof showToast==='function')showToast('✅ Восстановлено: '+count+' записей');
        setTimeout(function(){location.reload();},800);
      }catch(ex){if(typeof showToast==='function')showToast('❌ Ошибка: '+ex.message);}
    };
    reader.readAsText(file);document.body.removeChild(inp);
  };
  document.body.appendChild(inp);inp.click();
}

/* ── UI ── */
function injectStyle(){
  if(document.getElementById('bk-style'))return;
  var st=document.createElement('style');st.id='bk-style';
  st.textContent=[
    '#bk-overlay{position:fixed;inset:0;z-index:9500;background:rgba(2,1,10,.92);display:none;align-items:center;justify-content:center;padding:20px}',
    '#bk-overlay.open{display:flex}',
    '#bk-panel{background:rgba(22,19,31,.98);border:1px solid rgba(201,168,76,.2);border-radius:16px;padding:28px 24px;max-width:380px;width:100%;text-align:center}',
    '#bk-panel h2{font-family:Cinzel,serif;color:#e6e1f2;font-size:20px;margin:0 0 6px}',
    '#bk-panel .sub{color:rgba(230,225,242,.55);font-size:13px;margin-bottom:20px}',
    '.bk-btn{display:block;width:100%;padding:13px;margin:6px 0;border:1px solid rgba(201,168,76,.3);border-radius:10px;background:rgba(201,168,76,.08);color:#e6e1f2;font-family:inherit;font-size:14px;cursor:pointer;transition:all .2s}',
    '.bk-btn:hover{background:rgba(201,168,76,.18);border-color:rgba(201,168,76,.5)}',
    '.bk-btn.gold{background:rgba(201,168,76,.2);color:var(--gold,#c9a84c);font-weight:600}',
    '.bk-btn.ghost{background:transparent;border-color:rgba(255,255,255,.1);color:rgba(230,225,242,.5);font-size:13px}',
    '.bk-divider{height:1px;background:rgba(255,255,255,.06);margin:16px 0}',
    '.bk-info{color:rgba(230,225,242,.4);font-size:10.5px;margin-top:4px;font-family:"JetBrains Mono",monospace;letter-spacing:.04em;line-height:1.6}',
    '.bk-cloud{background:rgba(123,98,201,.08);border:1px solid rgba(123,98,201,.2);border-radius:10px;padding:12px;margin:8px 0;text-align:left}',
    '.bk-cloud .bk-cl{font-size:12px;color:rgba(230,225,242,.6);margin:2px 0}',
    '.bk-cloud .bk-cv{color:var(--gold,#c9a84c);font-family:"JetBrains Mono",monospace;font-size:10px;word-break:break-all}'
  ].join('\n');
  document.head.appendChild(st);
}

function buildOverlay(){
  if(document.getElementById('bk-overlay'))return;
  injectStyle();
  var ov=document.createElement('div');ov.id='bk-overlay';
  ov.innerHTML='<div id="bk-panel">'
    +'<h2>💾 Данные игрока</h2>'
    +'<p class="sub">Облачный синк + ручной бэкап</p>'
    +'<div class="bk-cloud" id="bk-cloud-info"><div class="bk-cl">☁️ Облачный синк</div><div class="bk-cl" id="bk-sync-status">проверяю…</div></div>'
    +'<button class="bk-btn" id="bk-sync-now">☁️ Синхронизировать сейчас</button>'
    +'<div class="bk-divider"></div>'
    +'<button class="bk-btn gold" id="bk-export">📥 Скачать бэкап (JSON)</button>'
    +'<button class="bk-btn" id="bk-import">📤 Восстановить из файла</button>'
    +'<button class="bk-btn" id="bk-reset-ob" style="margin-top:16px">🔄 Пройти онбординг заново</button>'
    +'<button class="bk-btn ghost" id="bk-close">Закрыть</button>'
    +'<div class="bk-info" id="bk-pid"></div>'
    +'</div>';
  document.body.appendChild(ov);
  document.getElementById('bk-export').onclick=exportBackup;
  document.getElementById('bk-import').onclick=importBackup;
  document.getElementById('bk-sync-now').onclick=function(){
    if(window.AwaraCloudSync){
      AwaraCloudSync.save(function(){updateCloudInfo();});
      if(typeof showToast==='function')showToast('☁️ Синхронизирую…');
    }else{
      if(typeof showToast==='function')showToast('⚠️ Облачный синк не подключён');
    }
  };
  document.getElementById('bk-reset-ob').onclick=function(){
    if(confirm('Перезапустить онбординг?')){
      try{localStorage.removeItem('awara_onboarded');}catch(e){}
      location.reload();
    }
  };
  document.getElementById('bk-close').onclick=closePanel;
  ov.onclick=function(e){if(e.target===ov)closePanel();};
}

function updateCloudInfo(){
  var st=document.getElementById('bk-sync-status');
  var pid=document.getElementById('bk-pid');
  if(window.AwaraCloudSync){
    var s=AwaraCloudSync.status();
    if(st)st.innerHTML='Последний синк: <b>'+s.lastSync+'</b>';
    if(pid)pid.textContent='ID: '+s.playerId;
  }else{
    if(st)st.textContent='Netlify Function не найдена — только ручной бэкап';
    if(pid)pid.textContent='';
  }
}

function openPanel(){
  buildOverlay();
  updateCloudInfo();
  document.getElementById('bk-overlay').classList.add('open');
}
function closePanel(){
  var ov=document.getElementById('bk-overlay');
  if(ov)ov.classList.remove('open');
}

/* ── Встройка в «Ещё» ── */
function hookIntoMore(){
  var observer=new MutationObserver(function(mutations){
    for(var m=0;m<mutations.length;m++){
      for(var n=0;n<mutations[m].addedNodes.length;n++){
        var node=mutations[m].addedNodes[n];
        if(node.id==='nav-more-pop'&&!node.querySelector('#bk-nav-btn')){
          var sep=document.createElement('div');
          sep.style.cssText='height:1px;background:rgba(255,255,255,.08);margin:4px 8px';
          node.appendChild(sep);
          var btn=document.createElement('button');btn.id='bk-nav-btn';btn.type='button';
          btn.innerHTML='<span class="ic">💾</span>Данные / бэкап';
          btn.onclick=function(e){
            e.stopPropagation();
            var pop=document.getElementById('nav-more-pop');
            if(pop&&pop.parentNode)pop.parentNode.removeChild(pop);
            openPanel();
          };
          node.appendChild(btn);
        }
      }
    }
  });
  var nav=document.querySelector('.nav');
  if(nav)observer.observe(nav,{childList:true});
}

/* ── Boot ── */
function boot(){
  hookIntoMore();
  console.log('[AwaraBackup] v3 ready');
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,2500);});}
else{setTimeout(boot,2500);}

window.AwaraBackup={open:openPanel,close:closePanel,export:exportBackup,import:importBackup};
})();
