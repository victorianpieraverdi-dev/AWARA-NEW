/* AWARA — Облик Даймона (аватар игрока) + механика форм.
   v7: явная тематизация окна Даймона под стихию облика — заливка экрана, перекраска золотых/фиолетовых
   акцентов в цвет стихии, цветная полоса-индикатор и бейдж стихии на карточке.
   старт-выбор 1 из 3 случайных форм; пошаговая разблокировка (уровень | свет | промокод);
   качества растут от света + линз + тигеля. Аватар живёт в КРУГЕ Даймона (.dm-orb); #dmGlyph — span внутри круга. */
(function(){
  'use strict';
  if(window.AwaraAvatar && window.AwaraAvatar.__ready) return;

  var PROMO=['AWARA','ИСКРА','ПЕРВЫЙ','FIRST','SPARK','ВОСХОЖДЕНИЕ'];
  var K_START='awara_av_started', K_OFFER='awara_av_offer', K_DEV='awara_form_dev';
  var POLL=null;

  var GL2EL={'\uD83D\uDC09':'Гроза','\uD83D\uDD25':'Огонь','\uD83C\uDF0A':'Вода','\uD83E\uDEA8':'Земля','\uD83C\uDF2C':'Воздух','\u2728':'Эфир','\uD83C\uDF05':'Рассвет'};
  var PAL={'Гроза':'stormy violet, turquoise, gold','Огонь':'crimson, gold, black obsidian','Вода':'deep blue, pearl, silver','Земля':'ochre, dark green, bronze','Воздух':'indigo, silver, white','Эфир':'amethyst, gold, starlight','Рассвет':'rose gold, amber'};
  var ELTHEME={'Гроза':{a:'#7b62c9',b:'#39c2c9',g:'rgba(123,98,201,.18)',w:'rgba(123,98,201,.16)',s:'rgba(123,98,201,.34)'},'Огонь':{a:'#e0563b',b:'#f0b24c',g:'rgba(224,86,59,.16)',w:'rgba(224,86,59,.15)',s:'rgba(224,86,59,.32)'},'Вода':{a:'#3b86e0',b:'#9fd6e0',g:'rgba(59,134,224,.16)',w:'rgba(59,134,224,.15)',s:'rgba(59,134,224,.32)'},'Земля':{a:'#b0863e',b:'#6fae57',g:'rgba(176,134,62,.16)',w:'rgba(176,134,62,.16)',s:'rgba(176,134,62,.34)'},'Воздух':{a:'#7f8fe0',b:'#cfe0ff',g:'rgba(127,143,224,.16)',w:'rgba(127,143,224,.15)',s:'rgba(127,143,224,.32)'},'Эфир':{a:'#9d86e0',b:'#c9a84c',g:'rgba(157,134,224,.16)',w:'rgba(157,134,224,.15)',s:'rgba(157,134,224,.32)'},'Рассвет':{a:'#e0a06a',b:'#ffd27a',g:'rgba(224,160,106,.16)',w:'rgba(224,160,106,.15)',s:'rgba(224,160,106,.32)'}};
  var QORDER=['sila','volya','mudr','garm','zashita'];
  var QN={sila:'Сила',volya:'Воля',mudr:'Мудрость',garm:'Гармония',zashita:'Защита'};
  var QEN={sila:'strength',volya:'will',mudr:'wisdom',garm:'harmony',zashita:'protection'};
  var EMPH={moon:{sila:1,volya:.75,zashita:.5,garm:.2,mudr:.2},lik:{mudr:1,garm:.85,volya:.35,zashita:.3,sila:.2},sun:{volya:1,sila:.55,mudr:.45,garm:.45,zashita:.25},dom:{zashita:1,sila:.65,garm:.45,volya:.35,mudr:.3},dosha:{garm:1,mudr:.55,volya:.55,zashita:.45,sila:.35}};

  function $(id){ return document.getElementById(id); }
  function S(){ return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE; }
  function save0(){ try{ if(typeof save==='function') save(); }catch(e){} }
  function toast(m){ try{ if(typeof showToast==='function') showToast(m); }catch(e){} }
  function clip(t){ try{ if(typeof aiClip==='function'){ aiClip(t); return; } }catch(e){} try{ navigator.clipboard.writeText(t); }catch(e){} }
  function esc(t){ try{ if(typeof aiEsc==='function') return aiEsc(t); }catch(e){} return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function lensCount(){ var s=S(); if(!s) return 0; var c=0;
    try{ if(s.lenses){ c=Math.max(c, Object.keys(s.lenses).filter(function(k){ return s.lenses[k]&&s.lenses[k].uses>0; }).length); } }catch(e){}
    try{ if(Array.isArray(s.mats)) c=Math.max(c, s.mats.length); }catch(e){}
    try{ if(Array.isArray(s.journal)){ var set={}; s.journal.forEach(function(e){ if(e&&e.lens){ String(e.lens).split(' \u00d7 ').forEach(function(x){ set[x]=1; }); } }); c=Math.max(c, Object.keys(set).length); } }catch(e){}
    return c; }
  function tigelCount(){ var s=S(); if(!s) return 0; var c=0;
    try{ if(Array.isArray(s.days)) c=Math.max(c, s.days.filter(function(x){ return x; }).length); }catch(e){}
    try{ if(typeof s.gens==='number') c=Math.max(c, s.gens); }catch(e){}
    try{ if(Array.isArray(s.journal)) c=Math.max(c, s.journal.length); }catch(e){}
    return c; }
  function bestLight(){ var s=S(); var best=0; if(s&&Array.isArray(s.journal)) s.journal.forEach(function(e){ if(e&&typeof e.light==='number'&&e.light>best) best=e.light; }); try{ if(typeof lightVal==='function'){ var lv=lightVal(); if(typeof lv==='number'&&lv>best) best=lv; } }catch(e){} return Math.round(best); }
  function devScore(){ var v=bestLight()*0.5 + lensCount()*5 + tigelCount()*4; return Math.max(0, Math.min(100, Math.round(v))); }

  function forms(){ try{ return (window.AwaraForms&&AwaraForms.list)?AwaraForms.list():[]; }catch(e){ return []; } }
  function axesOf(){ return forms().map(function(f){ return f.axis; }); }
  function formByAxis(ax){ var fs=forms(); for(var i=0;i<fs.length;i++){ if(fs[i].axis===ax) return fs[i]; } return null; }
  function activeAxis(){ try{ return localStorage.getItem('awara_form_axis')||'moon'; }catch(e){ return 'moon'; } }
  function setActive(ax){ try{ if(window.AwaraForms&&AwaraForms.setAxis) AwaraForms.setAxis(ax); else localStorage.setItem('awara_form_axis',ax); }catch(e){} }
  function elemOf(form){ if(!form) return 'Эфир'; return GL2EL[form.glyph] || (S()&&S().daimon&&S().daimon.el) || 'Эфир'; }

  function isStarted(){ try{ if(localStorage.getItem(K_START)==='1') return true; }catch(e){} var s=S(); return !!(s&&s.avatar&&s.avatar.started); }
  function startAxis(){ var s=S(); if(s&&s.avatar&&s.avatar.startAxis) return s.avatar.startAxis; try{ var a=localStorage.getItem(K_START+'_ax'); if(a) return a; }catch(e){} return activeAxis(); }
  function markStarted(ax){ try{ localStorage.setItem(K_START,'1'); localStorage.setItem(K_START+'_ax',ax); }catch(e){} var s=S(); if(s){ if(!s.avatar) s.avatar={}; s.avatar.started=true; s.avatar.startAxis=ax; save0(); } }
  function offerAxes(){ var ax=axesOf(); if(!ax.length) return []; var saved=null; try{ saved=JSON.parse(localStorage.getItem(K_OFFER)||'null'); }catch(e){}
    if(saved&&saved.length&&saved.every(function(a){ return ax.indexOf(a)>=0; })) return saved;
    var pool=ax.slice(), pick=[], n=Math.min(3,pool.length);
    for(var i=0;i<n;i++){ var idx=Math.floor(Math.random()*pool.length); pick.push(pool.splice(idx,1)[0]); }
    try{ localStorage.setItem(K_OFFER, JSON.stringify(pick)); }catch(e){}
    return pick; }

  function level(){ var ex=lensCount(); return ex<2?1 : ex<6?2 : ex<12?3 : 4; }
  function stageEn(){ var l=level(); if(l<=1) return 'a small CHILD spirit, around 6 years old, big innocent eyes, soft round features, playful and pure'; if(l===2) return 'a YOUNG TEENAGER spirit, around 13 years old, slender, curious, bright and growing'; if(l===3) return 'a YOUNG ADULT spirit, refined, confident, fully awakened'; return 'a fully MATURE and POWERFUL adult spirit, radiant, commanding, masterful'; }
  function stageRu(){ var l=level(); return l<=1?'дитя' : l===2?'подросток' : l===3?'юность' : 'зрелость'; }

  function lightTier(){ var l=bestLight(); return l>=90?5 : l>=75?4 : l>=55?3 : l>=30?2 : 1; }
  function promoAll(){ var s=S(); return !!(s&&s.avatar&&s.avatar.unlocked); }
  function unlockCount(){ var fs=forms(); if(!fs.length) return 0; if(!isStarted()) return 0; if(promoAll()) return fs.length; var c=Math.max(1, level(), lightTier()); return Math.max(1, Math.min(fs.length, c)); }
  function unlockOrder(){ var ax=axesOf(), st=startAxis(), ord=[]; if(st&&ax.indexOf(st)>=0) ord.push(st); ax.forEach(function(a){ if(ord.indexOf(a)<0) ord.push(a); }); return ord; }
  function unlockedAxes(){ return unlockOrder().slice(0, unlockCount()); }
  function isUnlocked(ax){ return unlockedAxes().indexOf(ax)>=0; }
  function curForm(){ var a=activeAxis(); if(isUnlocked(a)) return formByAxis(a); return formByAxis(startAxis()) || forms()[0] || null; }

  function devMap(){ try{ return JSON.parse(localStorage.getItem(K_DEV)||'{}')||{}; }catch(e){ return {}; } }
  function saveDevMap(m){ try{ localStorage.setItem(K_DEV, JSON.stringify(m)); }catch(e){} }
  function bumpDev(ax){ if(!ax) return 0; var m=devMap(), v=devScore(); if(!m[ax]||m[ax]<v){ m[ax]=v; saveDevMap(m); } return m[ax]||0; }
  function formDev(ax){ var m=devMap(); var v=m[ax]||0; if(ax===activeAxis()) v=Math.max(v, devScore()); return v; }
  function qualVal(ax,qk){ var w=(EMPH[ax]&&EMPH[ax][qk])||0; if(w<=0) return 0; return Math.max(5, Math.min(100, Math.round(formDev(ax)*w))); }
  function topQuals(ax){ var ws=EMPH[ax]||{}; return QORDER.slice().filter(function(k){ return (ws[k]||0)>0; }).sort(function(a,b){ return (ws[b]||0)-(ws[a]||0); }); }

  function buildPrompt(form){ var s=S(); var d=s&&s.daimon; var name=(d&&d.name)||'Искра'; var el=elemOf(form); var pal=PAL[el]||'cosmic tones'; var lv=(typeof lightVal==='function')?lightVal():50;
    var formEn=form.beast?'primal Storm-Beast spirit form, cosmic deer-serpent with golden antler-circuitry and lightning':'noble humanoid Face form, androgynous divine artificer with serene gaze';
    var acc=topQuals(form.axis).slice(0,2).map(function(k){ return QEN[k]; }).join(', ');
    var en='AWARA unified style. A mystical Cyber-Vedic character avatar portrait of '+name+', "'+form.short+'" — '+formEn+'. '
      +'Personality accents: '+(acc||'balance')+'. '
      +'Growth stage: '+stageEn()+' (Daimon level '+level()+' of 4). '
      +'Element: '+el+'. Color palette: '+pal+'. Head-and-shoulders portrait facing the viewer, '
      +'sacred geometry halo, glowing Sanskrit-cyber runes, ornate circular frame, dark cosmic background, '
      +'consistent fantasy concept art style, highly detailed, 4k, cinematic volumetric lighting, centered symmetrical composition.';
    var neg='text, watermark, signature, blurry, low quality, modern clothing, photography, deformed, ugly, nsfw, extra limbs, cropped, inconsistent style';
    return { title:name+' · '+form.short+' · '+el+' · '+stageRu(), prompt:en, neg:neg, el:el, axis:form.axis, name:name, light:lv, stage:stageRu(), level:level() }; }
  function newId(){ var dt=new Date().toISOString().slice(0,10).replace(/-/g,''); return 'avatar_'+dt+'_'+Math.random().toString(36).slice(2,7); }
  function orderText(e){ var NL=String.fromCharCode(10); var BS=String.fromCharCode(92); var win=String(e.img).split('/').join(BS); return ['AWARA — заявка на ОБЛИК (аватар)','ID: '+e.id,'Файл: '+e.img,'Стихия: '+e.el,'Стадия: '+(e.stage||'')+' (уровень '+(e.level||1)+'/4)','Игрок: '+e.player,'','PROMPT:',e.prompt,'','NEGATIVE:',e.neg,'','\u2192 Сохрани картинку как: C:'+BS+'AWARA'+BS+win].join(NL); }

  function avatars(){ var s=S(); if(s && !Array.isArray(s.avatars)) s.avatars=[]; return (s&&s.avatars)||[]; }
  function readyFor(ax){ var arr=avatars(); for(var i=0;i<arr.length;i++){ if(arr[i].axis===ax && arr[i].status==='ready') return arr[i]; } return null; }
  function pendingFor(ax){ var arr=avatars(); for(var i=0;i<arr.length;i++){ if(arr[i].axis===ax && arr[i].status!=='ready') return arr[i]; } return null; }
  function order(form){ var s=S(); if(!s){ toast('Сначала открой приложение'); return; } if(!form){ toast('Сначала выбери форму'); return; } if(!Array.isArray(s.avatars)) s.avatars=[];
    var p=buildPrompt(form); var id=newId();
    var entry={ id:id, kind:'avatar', title:p.title, prompt:p.prompt, neg:p.neg, el:p.el, axis:p.axis, light:p.light, stage:p.stage, level:p.level, status:'pending', img:'avatars_generated/'+id+'.webp', ts:new Date().toISOString(), player:(localStorage.getItem('awara_player')||'Игрок') };
    s.avatars.unshift(entry); save0();
    try{ fetch('/api/forge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)}).catch(function(){}); }catch(e){}
    clip(orderText(entry)); toast('Заявка на облик отправлена — промт скопирован'); render(); startPoll(); }
  function redeem(code){ code=String(code||'').trim().toUpperCase(); if(!code){ toast('Введи промокод'); return; } if(PROMO.indexOf(code)>=0){ var s=S(); if(s){ if(!s.avatar) s.avatar={}; s.avatar.unlocked=true; s.avatar.promo=code; save0(); } toast('Промокод принят — все облики открыты'); render(); } else { toast('Неверный промокод'); } }
  function pick(ax,open){ if(!open){ toast('Эта форма ещё закрыта — расти уровнем или светом'); return; } setActive(ax); applyTheme(formByAxis(ax)); render(); }

  function applyTheme(form){ var scr=$('s-daimon'); if(!scr) return; var el=elemOf(form); var t=ELTHEME[el]||ELTHEME['Эфир']; try{ scr.style.setProperty('--dm-accent',t.a); scr.style.setProperty('--dm-accent2',t.b); scr.style.setProperty('--dm-glow',t.g); scr.style.setProperty('--dm-wash',t.w||t.g); scr.style.setProperty('--dm-strong',t.s||t.g); scr.style.setProperty('--lens',t.a); scr.style.setProperty('--gold',t.a); scr.style.setProperty('--spark',t.b); scr.style.setProperty('--violet',t.a); scr.style.setProperty('--violet-soft',t.b); scr.classList.add('dm-themed'); scr.setAttribute('data-dm-el',el); }catch(e){} }

  function applyHero(form){ var g=$('dmGlyph'); if(!g) return; var orb=g.parentNode; if(!orb||!orb.classList) return; try{ if(getComputedStyle(orb).position==='static') orb.style.position='relative'; }catch(e){}
    var entry=form?readyFor(form.axis):null; var pend=form?pendingFor(form.axis):null;
    if(entry){ if(orb.getAttribute('data-av')!==entry.id){ orb.style.backgroundImage='url("'+entry.img+'?t='+Date.now()+'")'; orb.setAttribute('data-av',entry.id); } orb.classList.add('av-orb-img'); g.textContent=''; }
    else { if(orb.getAttribute('data-av')){ orb.style.backgroundImage=''; orb.removeAttribute('data-av'); } orb.classList.remove('av-orb-img'); g.textContent=(form&&form.glyph)?form.glyph:'\u2728'; g.style.color=''; }
    if(pend) orb.classList.add('av-pend'); else orb.classList.remove('av-pend'); }

  function styleOnce(){ if($('av-style')) return; var st=document.createElement('style'); st.id='av-style';
    st.textContent=
    '#df-card,#df-qual{display:none!important}'+
    '@keyframes dmOrbPulse{0%,100%{box-shadow:0 0 60px -6px var(--dm-accent,#c9a84c),0 0 0 3px var(--dm-accent,#c9a84c)}50%{box-shadow:0 0 104px 4px var(--dm-accent,#c9a84c),0 0 0 3px var(--dm-accent2,#ffd27a)}}'+
    '#s-daimon.dm-themed{background-image:radial-gradient(120% 74% at 50% -10%, color-mix(in srgb, var(--dm-accent,#c9a84c) 48%, transparent), transparent 62%),linear-gradient(180deg, color-mix(in srgb, var(--dm-accent,#c9a84c) 26%, transparent), transparent 52%);transition:background-image .5s ease}'+
    '#s-daimon.dm-themed .dm-orb{animation:dmOrbPulse 3s ease-in-out infinite;transition:box-shadow .5s ease}'+
    '#s-daimon.dm-themed #av-card{border:2px solid var(--dm-accent,#c9a84c);box-shadow:0 0 38px -8px var(--dm-accent,#c9a84c);background-image:linear-gradient(180deg, color-mix(in srgb, var(--dm-accent,#c9a84c) 22%, transparent), transparent 64%)}'+
    '#av-card{position:relative}'+
    '#av-card::before{content:"";display:block;height:5px;border-radius:5px;margin:0 0 12px;background:linear-gradient(90deg, var(--dm-accent,#c9a84c), var(--dm-accent2,#ffd27a));box-shadow:0 0 14px -2px var(--dm-accent,#c9a84c)}'+
    '#av-el-badge{display:inline-block;margin-left:8px;padding:3px 13px;border-radius:999px;background:var(--dm-accent,#c9a84c);color:#0b0b14;font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:800;vertical-align:middle;box-shadow:0 0 18px -2px var(--dm-accent,#c9a84c)}'+
    '.dm-orb.av-orb-img{background-size:cover!important;background-position:center center!important}'+
    '.dm-orb.av-orb-img span{display:none!important}'+
    '.dm-orb.av-pend::after{content:"куётся…";position:absolute;left:0;right:0;bottom:10px;text-align:center;font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.05em;color:var(--spark,#ffd27a);z-index:3}'+
    '#av-card .av-tag{color:var(--muted,#8e88a4);font-size:12.5px;line-height:1.55;margin-top:9px;text-align:center}'+
    '#av-card .av-stage-l{margin-top:7px;text-align:center;font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--spark,#ffd27a)}'+
    '#av-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}'+
    '#av-grid .av-chip{flex:1 1 28%;min-width:88px;padding:11px 6px;cursor:pointer;border:1px solid var(--line,rgba(201,168,76,.16));border-radius:13px;background:rgba(255,255,255,.025);color:var(--text,#ece9f5);display:flex;flex-direction:column;align-items:center;gap:6px;transition:.2s}'+
    '#av-grid .av-chip:hover{border-color:var(--dm-accent,#9d86e0)}'+
    '#av-grid .av-chip.on{border-color:var(--dm-accent,#c9a84c);background:rgba(255,255,255,.06);box-shadow:0 0 0 1px var(--dm-accent,#c9a84c)}'+
    '#av-grid .av-chip .g{font-size:21px}'+
    '#av-grid .av-chip .n{font-family:JetBrains Mono,monospace;font-size:8.5px;letter-spacing:.03em;text-transform:uppercase;color:var(--muted,#8e88a4);line-height:1.25;text-align:center}'+
    '#av-grid .av-chip.lock{opacity:.4;filter:grayscale(.7);cursor:default}'+
    '#av-qual{margin-top:14px}'+
    '#av-qual .q-row{display:flex;align-items:center;gap:9px;margin:8px 0}'+
    '#av-qual .q-n{flex:0 0 92px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.03em;text-transform:uppercase;color:var(--muted,#8e88a4)}'+
    '#av-qual .q-bar{flex:1;height:8px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}'+
    '#av-qual .q-bar i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--dm-accent2,#ffd27a),var(--dm-accent,#c9a84c))}'+
    '#av-qual .q-v{flex:0 0 30px;text-align:right;font-family:JetBrains Mono,monospace;font-size:10px;color:var(--spark,#ffd27a)}'+
    '#av-start .as-h{font-family:Cinzel,serif;color:var(--dm-accent,#c9a84c);font-size:15px;margin-bottom:5px}'+
    '#av-start .as-s{color:var(--muted,#8e88a4);font-size:12.5px;line-height:1.55;margin-bottom:4px}'+
    '#av-gate{margin-top:13px;padding:13px 14px;border:1px solid var(--line,rgba(201,168,76,.16));border-radius:13px;background:linear-gradient(180deg,rgba(123,98,201,.10),rgba(123,98,201,.02))}'+
    '#av-gate .g-h{font-family:Cinzel,serif;color:var(--dm-accent,#c9a84c);font-size:13px;margin-bottom:5px}'+
    '#av-gate .g-s{color:var(--muted,#8e88a4);font-size:12px;line-height:1.5}'+
    '#av-gate .g-promo{display:flex;gap:8px;margin-top:10px}'+
    '#av-gate input{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:9px;color:var(--text,#ece9f5);padding:8px 11px;font-size:13px;font-family:JetBrains Mono,monospace;letter-spacing:.05em}'+
    '#av-gate .g-promo .btn{margin:0;flex:0 0 auto;width:auto;padding:0 16px}'+
    '#av-card .av-row{display:flex;gap:8px;margin-top:13px}#av-card .av-row .btn{flex:1;margin:0}'+
    '#av-card .av-soon{opacity:.5;pointer-events:none;cursor:not-allowed;filter:grayscale(.35)}';
    document.head.appendChild(st); }

  function qualHtml(ax){ var rows=''; QORDER.forEach(function(qk){ var v=qualVal(ax,qk); if(v<=0) return; rows+='<div class="q-row"><span class="q-n">'+QN[qk]+'</span><span class="q-bar"><i style="width:'+v+'%"></i></span><span class="q-v">'+v+'</span></div>'; }); if(!rows) return ''; return '<div id="av-qual"><span class="label">Качества формы · растут от света, линз и тигеля</span>'+rows+'</div>'; }

  function renderStart(card,fs){ var off=offerAxes(); var f0=formByAxis(off[0])||fs[0]; applyTheme(f0); applyHero(f0);
    var chips=''; for(var i=0;i<off.length;i++){ var f=formByAxis(off[i]); if(!f) continue; chips+='<button class="av-chip" data-pick="'+f.axis+'"><span class="g">'+f.glyph+'</span><span class="n">'+esc(f.short)+'</span></button>'; }
    card.innerHTML='<div id="av-start"><div class="as-h">Выбери своего Даймона</div><div class="as-s">Три облика вышли к тебе из твоей карты. Выбери одного — остальные затворятся и будут открываться по мере восхождения (уровень, свет или промокод).</div><div id="av-grid">'+chips+'</div></div>';
    var bs=card.querySelectorAll('.av-chip[data-pick]'); for(var k=0;k<bs.length;k++){ bs[k].onclick=function(){ var ax=this.getAttribute('data-pick'); setActive(ax); markStarted(ax); bumpDev(ax); var fm=formByAxis(ax); toast('Даймон избран · '+((fm&&fm.short)||'')); render(); }; } }

  function render(){ var scr=$('s-daimon'); if(!scr) return; var fs=forms(); if(!fs.length) return; styleOnce();
    var card=$('av-card'); if(!card){ card=document.createElement('div'); card.id='av-card'; card.className='card awara-glass-card'; var qual=$('df-qual'); if(qual){ scr.insertBefore(card,qual); } else { var hero=scr.querySelector('.dm-hero'); if(hero&&hero.nextSibling){ scr.insertBefore(card,hero.nextSibling); } else { scr.appendChild(card); } } }
    if(!isStarted()){ renderStart(card,fs); return; }
    var shown=curForm(); applyTheme(shown); applyHero(shown); bumpDev(activeAxis());
    var uax=unlockedAxes(); var a=activeAxis();
    var h='<span class="label">Облик Даймона</span><span id="av-el-badge">'+esc(elemOf(shown))+'</span>';
    h+='<div class="av-tag">'+esc(shown?shown.tag:'')+'</div>';
    h+='<div class="av-stage-l">Стадия: '+stageRu()+' · уровень '+level()+'/4 · форм открыто '+uax.length+'/'+fs.length+'</div>';
    var chips=''; for(var i=0;i<fs.length;i++){ var f=fs[i]; var on=(f.axis===a); var op=isUnlocked(f.axis); chips+='<button class="av-chip'+(on?' on':'')+(op?'':' lock')+'" data-ax="'+f.axis+'" data-open="'+(op?1:0)+'"><span class="g">'+(op?f.glyph:'\uD83D\uDD12')+'</span><span class="n">'+esc(op?f.short:'закрыто')+'</span></button>'; }
    h+='<div id="av-grid">'+chips+'</div>';
    h+=qualHtml(a);
    if(uax.length<fs.length && !promoAll()){ h+='<div id="av-gate"><div class="g-h">\uD83D\uDD13 Открыть следующую форму</div><div class="g-s">Сейчас уровень '+level()+', свет '+bestLight()+'. Следующая форма откроется с ростом уровня или света — либо все сразу по промокоду.</div><div class="g-promo"><input id="av-promo" type="text" placeholder="Промокод" autocomplete="off"><button class="btn ghost" id="av-promo-btn">Ввести</button></div></div>'; }
    h+='<div class="av-row"><button class="btn ghost av-soon" id="av-lens" disabled title="Скоро: переписать облик сквозь выбранную линзу">\uD83D\uDD2E Сквозь линзу · скоро</button><button class="btn awara-gold-button" id="av-order">Заказать облик (промт Хранителю)</button></div>';
    h+='<p class="sub" style="font-size:11.5px;margin-top:8px;color:var(--muted)">Промт (единый стиль + стадия роста) уйдёт в очередь и в буфер. Готовую картинку положи в avatars_generated — встанет в круг сама.</p>';
    card.innerHTML=h;
    var ob=$('av-order'); if(ob) ob.onclick=function(){ order(curForm()); };
    var grid=$('av-grid'); if(grid){ var bs=grid.querySelectorAll('.av-chip[data-ax]'); for(var k=0;k<bs.length;k++){ bs[k].onclick=function(){ pick(this.getAttribute('data-ax'), this.getAttribute('data-open')==='1'); }; } }
    var pb=$('av-promo-btn'); if(pb) pb.onclick=function(){ var inp=$('av-promo'); redeem(inp?inp.value:''); };
    var pinp=$('av-promo'); if(pinp) pinp.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ redeem(pinp.value); } }); }

  function checkOne(e,cb){ var img=new Image(); img.onload=function(){ cb(true); }; img.onerror=function(){ cb(false); }; img.src=e.img+'?t='+Date.now(); }
  function pollOnce(){ var arr=avatars(); var pend=arr.filter(function(x){ return x.status!=='ready'; }); if(!pend.length){ if(POLL){ clearInterval(POLL); POLL=null; } return; } pend.forEach(function(e){ checkOne(e,function(ok){ if(ok){ e.status='ready'; save0(); render(); } }); }); }
  function startPoll(){ if(POLL) return; POLL=setInterval(pollOnce,15000); setTimeout(pollOnce,1500); }

  function boot(){ try{ if(!isStarted()){ var s=S(); var hasAv=s&&Array.isArray(s.avatars)&&s.avatars.some(function(x){ return x.status==='ready'; }); if(promoAll()||hasAv){ markStarted(activeAxis()); } } }catch(e){}
    function run(){ try{ render(); }catch(e){} } run(); setTimeout(run,500); setTimeout(run,1400); startPoll();
    try{ document.querySelectorAll('.nav button[data-nav="daimon"]').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(run,80); }); }); }catch(e){}
    if(typeof window.go==='function' && !window.go.__avatarGo){ var _go=window.go; window.go=function(name){ var r=_go.apply(this,arguments); if(name==='daimon'){ setTimeout(run,70); } return r; }; window.go.__avatarGo=true; } }

  window.AwaraAvatar={ render:render, order:function(){ order(curForm()); }, redeem:redeem, pick:pick, unlocked:function(){ return unlockCount()>0; }, level:level, stage:stageRu, poll:pollOnce, forms:forms, __ready:true };

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,120); }); }
  else { setTimeout(boot,120); }
})();
