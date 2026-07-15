'use strict';
/* AWARA media-input: фото/видео/аудио + голосовой ввод (надиктовка) для Тигля (#dayText) и Даймон-чата (#aiInput).
   Текстовая модель не "видит" пиксели, поэтому ИИ кормим ТЕКСТОМ: распознанная речь (Web Speech),
   OCR-текст с фото (Tesseract.js, лениво с CDN) и текстовые описания вложений -> попадают в поле/aiContext. */
(function(){
  if(window.__AwaraMediaInput) return; window.__AwaraMediaInput=true;

  function curLang(){ try{ return (window.AwaraI18n&&AwaraI18n.lang)||localStorage.getItem('awara_lang')||'ru'; }catch(e){ return 'ru'; } }
  function L(ru,en){ return curLang()==='en'?en:ru; }
  function speechLang(){ return curLang()==='en'?'en-US':'ru-RU'; }
  function toast(m){ try{ if(typeof showToast==='function'){ showToast(m); } }catch(e){} }
  function esc(t){ return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var css=''+
  '.mi-bar{display:flex;gap:8px;margin:6px 0 2px;align-items:center;flex-wrap:wrap}'+
  '.mi-btn{min-width:38px;height:34px;padding:0 10px;border:1px solid var(--line,rgba(201,168,76,.16));border-radius:10px;background:rgba(255,255,255,.04);color:var(--spark,#ffd27a);font-size:15px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s;font-family:\'JetBrains Mono\',monospace}'+
  '.mi-btn .mi-lbl{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#8e88a4)}'+
  '.mi-btn:hover{border-color:var(--gold,#c9a84c)}'+
  '.mi-btn.mi-rec{background:linear-gradient(120deg,#c0392b,#e74c3c);color:#fff;animation:miPulse 1s infinite}'+
  '.mi-btn.mi-rec .mi-lbl{color:#fff}'+
  '@keyframes miPulse{0%,100%{opacity:1}50%{opacity:.55}}'+
  '.mi-chips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 8px}'+
  '.mi-chip{display:flex;align-items:center;gap:6px;border:1px solid var(--line,rgba(201,168,76,.16));border-radius:10px;padding:4px 8px;background:rgba(255,255,255,.03);max-width:170px}'+
  '.mi-chip img{width:26px;height:26px;border-radius:6px;object-fit:cover;display:block}'+
  '.mi-chip .mi-ic{font-size:18px}'+
  '.mi-chip .mi-nm{font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--muted,#8e88a4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px}'+
  '.mi-chip .mi-x{cursor:pointer;color:var(--muted,#8e88a4);font-size:11px;margin-left:2px}'+
  '.mi-chip .mi-x:hover{color:#e74c3c}';
  try{ var stEl=document.createElement('style'); stEl.textContent=css; document.head.appendChild(stEl); }catch(e){}

  var STORE={};       // id -> [items]
  var CHIPSEL={};     // id -> chips element
  function items(id){ if(!STORE[id])STORE[id]=[]; return STORE[id]; }

  /* ===== OCR (ленивый Tesseract.js) ===== */
  var TESS=null,TESSp=null;
  function loadTess(){ if(TESS)return Promise.resolve(TESS); if(TESSp)return TESSp; TESSp=new Promise(function(res,rej){ try{ var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload=function(){ TESS=window.Tesseract||null; TESS?res(TESS):rej(new Error('no-tess')); }; s.onerror=function(){ rej(new Error('no-cdn')); }; document.head.appendChild(s); }catch(e){ rej(e); } }); return TESSp; }
  function ocrImage(file,cb){ loadTess().then(function(T){ if(!T){ cb(''); return; } toast(L('Распознаю текст с фото…','Reading text from photo…')); T.recognize(file, curLang()==='en'?'eng':'rus+eng').then(function(r){ cb(((r&&r.data&&r.data.text)||'').trim()); }).catch(function(){ cb(''); }); }).catch(function(){ cb(''); }); }

  /* ===== Распознавание речи =====
     Фикс сброса на "Разрешить": сначала getUserMedia (ждём разрешения), потом start();
     авто-перезапуск после пауз; защита от цикла при ошибках. */
  function makeRec(field,btn){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ btn.style.display='none'; return; }
    var rec=null, on=false, manualStop=false, baseText='', startedAt=0, fails=0;
    function uiOn(){ btn.classList.add('mi-rec'); btn.innerHTML='⏹<span class="mi-lbl">'+L('стоп','stop')+'</span>'; }
    function uiOff(){ btn.classList.remove('mi-rec'); btn.innerHTML='🎤<span class="mi-lbl">'+L('голос','voice')+'</span>'; }
    function setField(extra){ field.value=(baseText?baseText.replace(/\s+$/,'')+' ':'')+(extra||''); try{ field.dispatchEvent(new Event('input')); }catch(e){} field.scrollTop=field.scrollHeight; }
    function startRec(){
      try{ rec=new SR(); }catch(e){ on=false; uiOff(); return; }
      rec.lang=speechLang(); rec.interimResults=true; rec.continuous=true;
      startedAt=Date.now();
      rec.onresult=function(ev){ var interim=''; for(var i=ev.resultIndex;i<ev.results.length;i++){ var tr=ev.results[i]; if(tr.isFinal){ baseText=(baseText?baseText.replace(/\s+$/,'')+' ':'')+tr[0].transcript.trim(); } else { interim+=tr[0].transcript; } } setField(interim.trim()); fails=0; };
      rec.onerror=function(ev){ var err=ev&&ev.error; if(err==='not-allowed'||err==='service-not-allowed'){ on=false; manualStop=true; uiOff(); toast(L('Нет доступа к микрофону','Microphone access denied')); } else if(err==='aborted'){ /* мануальная остановка */ } };
      rec.onend=function(){ baseText=field.value||''; if(on && !manualStop){ var dt=Date.now()-startedAt; if(dt<400){ fails++; } else { fails=0; } if(fails>5){ on=false; uiOff(); toast(L('Голос остановлен','Voice stopped')); return; } setTimeout(function(){ if(on&&!manualStop){ try{ startRec(); }catch(e){} } }, dt<400?350:0); } else { uiOff(); } };
      try{ rec.start(); }catch(e){ setTimeout(function(){ if(on&&!manualStop){ try{ rec.start(); }catch(_){ } } },300); }
    }
    btn.onclick=function(){
      if(on){ manualStop=true; on=false; try{ rec.stop(); }catch(e){} uiOff(); return; }
      baseText=field.value||''; manualStop=false; fails=0; on=true; uiOn();
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){ try{ stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} if(on){ startRec(); toast(L('Говорите…','Listening…')); } }).catch(function(){ on=false; uiOff(); toast(L('Нет доступа к микрофону','Microphone access denied')); });
      } else { startRec(); toast(L('Говорите…','Listening…')); }
    };
  }

  /* ===== Вложения ===== */
  function kindOf(f){ var t=(f.type||''); if(t.indexOf('image')===0)return 'image'; if(t.indexOf('video')===0)return 'video'; if(t.indexOf('audio')===0)return 'audio'; return 'file'; }
  function icon(k){ return k==='image'?'🖼':k==='video'?'🎬':k==='audio'?'🎧':'📄'; }
  function kindWord(k){ return k==='image'?L('фото','photo'):k==='video'?L('видео','video'):k==='audio'?L('аудио','audio'):L('файл','file'); }

  function renderChips(id){ var chips=CHIPSEL[id]; if(!chips)return; var arr=items(id); chips.innerHTML=''; arr.forEach(function(it){ var c=document.createElement('div'); c.className='mi-chip'; var thumb=it.kind==='image'?('<img src="'+it.objUrl+'">'):('<span class="mi-ic">'+icon(it.kind)+'</span>'); c.innerHTML=thumb+'<span class="mi-nm" title="'+esc(it.name)+'">'+esc(it.name)+'</span><span class="mi-x" data-x="'+it.id+'">✕</span>'; chips.appendChild(c); }); Array.prototype.forEach.call(chips.querySelectorAll('.mi-x'),function(x){ x.onclick=function(){ var xid=x.getAttribute('data-x'); STORE[id]=items(id).filter(function(i){ return i.id!==xid; }); renderChips(id); }; }); }

  function addFiles(id,files){ var arr=items(id); Array.prototype.forEach.call(files,function(f){ var it={ id:'m'+Math.random().toString(36).slice(2,8), kind:kindOf(f), name:f.name||L('файл','file'), objUrl:URL.createObjectURL(f), ocr:'' }; arr.push(it); if(it.kind==='image'){ ocrImage(f,function(t){ it.ocr=t; if(t) toast(L('Текст с фото распознан','Photo text recognized')); }); } }); renderChips(id); toast(L('Вложение добавлено','Attachment added')); }

  function blockFor(id){ var arr=items(id); if(!arr.length) return ''; var lines=arr.map(function(it){ var s='• '+kindWord(it.kind)+' «'+it.name+'»'; if(it.kind==='image'){ s+= it.ocr ? (': '+L('текст на изображении','text in image')+': "'+it.ocr.replace(/\s+/g,' ').slice(0,1200)+'"') : (' ('+L('текст не распознан — опиши, что на фото','no text recognized — describe the image')+')'); } return s; }); return '\n\n['+L('Вложения пользователя','User attachments')+']\n'+lines.join('\n'); }

  /* ===== Панель под полем ===== */
  function buildBar(field,id){
    if(!field||field.__miDone) return; field.__miDone=true;
    var bar=document.createElement('div'); bar.className='mi-bar';
    var fileBtn=document.createElement('button'); fileBtn.type='button'; fileBtn.className='mi-btn'; fileBtn.innerHTML='📎<span class="mi-lbl">'+L('файл','file')+'</span>'; fileBtn.title=L('Прикрепить фото / видео / аудио','Attach photo / video / audio');
    var micBtn=document.createElement('button'); micBtn.type='button'; micBtn.className='mi-btn'; micBtn.innerHTML='🎤<span class="mi-lbl">'+L('голос','voice')+'</span>'; micBtn.title=L('Надиктовать голосом','Dictate by voice');
    var input=document.createElement('input'); input.type='file'; input.accept='image/*,video/*,audio/*'; input.multiple=true; input.style.display='none';
    var chips=document.createElement('div'); chips.className='mi-chips'; CHIPSEL[id]=chips;
    fileBtn.onclick=function(){ input.click(); };
    input.onchange=function(){ addFiles(id,input.files); input.value=''; };
    makeRec(field,micBtn);
    bar.appendChild(fileBtn); bar.appendChild(micBtn); bar.appendChild(input);
    field.parentNode.insertBefore(bar, field.nextSibling);
    field.parentNode.insertBefore(chips, bar.nextSibling);
  }

  /* ===== Загрузка вложений в ИИ ===== */
  function injectInto(field,id){ if(!field) return; var b=blockFor(id); if(b){ field.value=(field.value||'')+b; } STORE[id]=[]; renderChips(id); }

  function boot(){
    try{ buildBar(document.getElementById('dayText'),'dayText'); }catch(e){}
    try{ buildBar(document.getElementById('aiInput'),'aiInput'); }catch(e){}

    // Чат: дописываем вложения в сообщение перед отправкой
    if(typeof window.aiSend==='function'){ var origSend=window.aiSend; window.aiSend=function(){ try{ injectInto(document.getElementById('aiInput'),'aiInput'); }catch(e){} return origSend.apply(this,arguments); }; }

    // Тигель: дописываем вложения в запись дня перед плавкой
    var mb=document.getElementById('meltBtn'); if(mb){ var prev=mb.onclick; mb.onclick=function(){ try{ injectInto(document.getElementById('dayText'),'dayText'); }catch(e){} if(typeof prev==='function') return prev.apply(this,arguments); }; }

    // Даймон-чат должен "видеть" запись дня и вложения и без плавки
    if(typeof window.aiContext==='function'){ var origCtx=window.aiContext; window.aiContext=function(){ var s=''; try{ s=origCtx.apply(this,arguments)||''; }catch(e){ s=''; } try{ var dt=document.getElementById('dayText'); var v=dt&&dt.value?dt.value.trim():''; if(v) s+=' '+L('Запись дня (Тигель)','Day entry (Crucible)')+': "'+v.slice(0,800)+'". '; var b=blockFor('dayText'); if(b) s+=b.replace(/\n+/g,' '); }catch(e){} return s; }; }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
  window.AwaraMedia={ items:items, blockFor:blockFor, store:STORE };
})();
