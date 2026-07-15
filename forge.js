'use strict';
/* AWARA - Kuznica kart (demo bez API): igrok zakazyvaet kartu -> zayavka uhodit Hranitelyu -> gotovyj webp poyavlyaetsya sam */
(function(){
  var POLL=null;
  function st(){ if(typeof STATE==='undefined'||!STATE) return null; if(!STATE.forge) STATE.forge=[]; return STATE; }
  function save0(){ try{ if(typeof save==='function') save(); }catch(e){} }
  function toast(m){ try{ if(typeof showToast==='function') showToast(m); }catch(e){} }
  function clip(t){ try{ if(typeof aiClip==='function'){ aiClip(t); return; } }catch(e){} try{ navigator.clipboard.writeText(t); }catch(e){} }
  function esc(t){ try{ if(typeof aiEsc==='function') return aiEsc(t); }catch(e){} return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var PAL={'Гроза':'грозовой фиолет, бирюза, золото','Огонь':'багрянец, золото, чёрный обсидиан','Вода':'глубокий синий, перламутр, серебро','Земля':'охра, тёмная зелень, бронза','Воздух':'индиго, серебро, белый','Эфир':'аметист, золото, звёздный свет','Рассвет':'розовое золото, янтарь'};
  function buildPrompt(){
    var S=st(); var d=S&&S.daimon;
    var elem=d?d.el:'Эфир'; var name=d?d.name:'Даймон';
    var beast=(typeof effForm==='function'&&effForm()==='beast');
    var formEn=beast?'in primal Storm-Beast form, cosmic deer-serpent with golden antler-circuitry and lightning':'in noble Face form, androgynous divine artificer';
    var lenses=(typeof lensVoices==='function')?lensVoices():[];
    var lensNames=lenses.map(function(x){return x.name;}).join(', ');
    var lv=(typeof lightVal==='function')?lightVal():50;
    var palette=PAL[elem]||'космические тона';
    var en='A mystical Cyber-Vedic tarot-style card depicting '+name+' '+formEn+'. Element: '+elem+'. Palette: '+palette+'. Sacred geometry, glowing Sanskrit-cyber runes, ornate golden border frame, portrait composition, highly detailed, 4k, cinematic lighting.'+(lensNames?(' Lenses: '+lensNames+'.'):'')+' Light level '+lv+'/100.';
    var neg='text, watermark, signature, blurry, low quality, modern clothing, photography, deformed, ugly, nsfw';
    return {title:name+' - '+elem+' - Свет '+lv, prompt:en, neg:neg, el:elem, name:name, light:lv};
  }
  function newId(){ var dt=new Date().toISOString().slice(0,10).replace(/-/g,''); return 'card_'+dt+'_'+Math.random().toString(36).slice(2,7); }
  function forgeText(e){ var NL=String.fromCharCode(10); return ['AWARA - заявка на карту','ID: '+e.id,'Файл: '+e.img,'Игрок: '+e.player,'','PROMPT:',e.prompt,'','NEGATIVE:',e.neg].join(NL); }
  function requestCard(){
    var S=st(); if(!S){ toast('Сначала открой приложение'); return; }
    var p=buildPrompt(); var id=newId();
    var entry={id:id, title:p.title, prompt:p.prompt, neg:p.neg, el:p.el, light:p.light, status:'pending', img:'cards_generated/'+id+'.webp', ts:new Date().toISOString(), player:(localStorage.getItem('awara_player')||'Игрок')};
    S.forge.unshift(entry); save0();
    try{ fetch('/api/forge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)}).catch(function(){}); }catch(e){}
    clip(forgeText(entry)); toast('Заявка отправлена Хранителю');
    renderForge(); if(typeof go==='function') go('chron'); startPoll();
  }
  function ensureUI(){
    var live=document.getElementById('liveBtn');
    if(live && !document.getElementById('forgeBtn')){ var b=document.createElement('button'); b.id='forgeBtn'; b.className='btn ghost'; b.textContent='🜔 Заказать карту у Хранителя'; b.onclick=requestCard; live.parentNode.insertBefore(b, live); }
    var jf=document.getElementById('journalFeed');
    if(jf && !document.getElementById('forgeFeed')){ var h=document.createElement('h2'); h.id='forgeHead'; h.style.marginTop='18px'; h.textContent='Кузница карт'; var f=document.createElement('div'); f.id='forgeFeed'; f.style.marginTop='8px'; jf.parentNode.appendChild(h); jf.parentNode.appendChild(f); }
  }
  function renderForge(){
    ensureUI();
    var box=document.getElementById('forgeFeed'); if(!box) return;
    var S=st(); var arr=(S&&S.forge)||[];
    if(!arr.length){ box.innerHTML='<p class="sub">Здесь появятся заказанные карты. Жми «Заказать карту» в отчёте дня — заявка уйдёт Хранителю, а готовая карта появится тут сама.</p>'; return; }
    box.innerHTML=arr.slice(0,30).map(function(e){
      if(e.status==='ready'){ return '<div class="card" style="margin-bottom:10px"><span class="label">'+esc(e.title)+'</span><img src="'+e.img+'" alt="card" style="width:100%;border-radius:14px;margin-top:6px;display:block"></div>'; }
      return '<div class="card" style="margin-bottom:10px"><div class="trait" style="border:none;padding:2px 0"><span class="label">⏳ '+esc(e.title)+'</span><b>куётся</b></div><p class="sub" style="font-size:13px;margin-top:4px">Карта куётся у Хранителя… Появится здесь сама, как только будет готова.</p><div style="margin-top:8px"><button class="btn ghost" data-fid="'+e.id+'" style="margin:0">Скопировать заявку</button></div></div>'; 
    }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('button[data-fid]'), function(btn){ btn.onclick=function(){ copyReq(btn.getAttribute('data-fid')); }; });
  }
  function copyReq(id){ var S=st(); var e=((S&&S.forge)||[]).filter(function(x){return x.id===id;})[0]; if(e){ clip(forgeText(e)); toast('Заявка скопирована'); } }
  function checkOne(e,cb){ var img=new Image(); img.onload=function(){cb(true);}; img.onerror=function(){cb(false);}; img.src=e.img+'?t='+Date.now(); }
  function pollOnce(){ var S=st(); if(!S) return; var arr=S.forge||[]; var pend=arr.filter(function(x){return x.status!=='ready';}); if(!pend.length){ if(POLL){clearInterval(POLL);POLL=null;} return; } pend.forEach(function(e){ checkOne(e,function(ok){ if(ok){ e.status='ready'; save0(); renderForge(); } }); }); }
  function startPoll(){ if(POLL) return; POLL=setInterval(pollOnce,15000); setTimeout(pollOnce,1500); }
  window.AwaraForge={request:requestCard, render:renderForge, copy:copyReq, poll:pollOnce};
  window.requestCard=requestCard;
  function boot(){ try{ ensureUI(); renderForge(); startPoll(); }catch(e){} }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
