/* AWARA · Карта Восхождения — миникарта большой игры внутри Тигля.
   Свет растекается по пути согласно уровню игрока. Доп. слой, движок не трогает. */
(function(){
'use strict';
if(window.AwaraMacroMap&&window.AwaraMacroMap.__ready)return;

/* Канон большой игры (первый вариант ступеней). Чакры/локи/пространства зашиты
   "под капот" — для будущего раскрытия и для карточек-лора. */
var NODES=[
 {key:'soul',icon:'🔮',title:'Пространство Души',sub:'Инициация · Тигель',need:0,space:'Пространство Души',chakras:'Муладхара · Свадхистхана',lokas:'Бхур — земной план',lore:'Здесь начинается путь. Тигель живёт в этом пространстве: каждый прожитый день ты плавишь в Свет. Это корень восхождения и Инициация Души.'},
 {key:'temple',icon:'🏛',title:'Звёздный Храм',sub:'Строительство',need:30,space:'Строительство Храма',chakras:'Манипура · Анахата',lokas:'Бхувар · Свар',lore:'Накопив Свет, ты возводишь свой Звёздный Храм — внутреннюю структуру воли и сердца. Свет тратится на постройку и укрепление опор.'},
 {key:'cosmos',icon:'🌌',title:'Создание Космоса',sub:'Творение миров',need:55,space:'Создание Космоса',chakras:'Вишуддха · Аджна',lokas:'Махар · Джана',lore:'Из Храма рождается твой Космос. Ты творишь миры и расширяешь восприятие через 33 матрицы. Раскрывается интуиция.'},
 {key:'cards',icon:'🃏',title:'Карточная игра',sub:'63 карты · 21 агент',need:75,space:'Настольная игра Душ',chakras:'Сахасрара',lokas:'Тапа · Сатья',lore:'Сиддхи проявляются в Игре: 21 агент × 3 = 63 карты. Ты играешь силами, обретёнными на пути восхождения.'},
 {key:'logos',icon:'☀',title:'Планетарный Логос',sub:'Возврат к Источнику',need:90,space:'Планетарный Логос',chakras:'Монада · Абсолют',lokas:'Возврат к Источнику',lore:'Вершина — слияние с Планетарным Логосом. Путь ум → чувства → интуиция → сиддхи завершён. Отсюда ты возвращаешься, чтобы вести других.'}
];

function light(){
 try{if(typeof window.lightVal==='function'){var v=window.lightVal();if(typeof v==='number'&&!isNaN(v))return Math.max(0,Math.min(100,Math.round(v)));}}catch(e){}
 try{var s=JSON.parse(localStorage.getItem('tigel_v1')||'{}');var db=(s.trust>=50)?5:0;var ml=(s.mats?s.mats.length:0)*2;return Math.max(0,Math.min(100,Math.round((s.baseLight||48)+(s.lightBonus||0)+ml+db)));}catch(e){}
 return 48;
}

function styleOnce(){
 if(document.getElementById('mm-style'))return;
 var st=document.createElement('style');st.id='mm-style';
 st.textContent=[
  '#s-macro .eyebrow{color:var(--spark)}',
  '.mm-head{display:flex;align-items:center;gap:14px;margin:14px 0 6px;padding:14px;border:1px solid var(--line);border-radius:16px;background:rgba(123,98,201,.07)}',
  '.mm-ring{flex:0 0 auto;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--gold) 0%,rgba(255,255,255,.06) 0%)}',
  '.mm-ring b{background:var(--bg);width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-family:Cinzel,serif;font-size:18px;color:var(--spark)}',
  '.mm-hmeta{flex:1;min-width:0}',
  '.mm-hmeta .t{font-family:Cinzel,serif;color:var(--text);font-size:15px}',
  '.mm-hmeta .s{font-size:12px;color:var(--muted);margin-top:4px}',
  '.mm-col{position:relative;max-width:360px;margin:8px auto 0;padding:6px 0}',
  '.mm-rail{position:absolute;left:34px;top:20px;bottom:20px;width:4px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden}',
  '.mm-railfill{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(to top,var(--gold),var(--spark));box-shadow:0 0 16px var(--spark);transition:height 1.1s cubic-bezier(.4,0,.2,1)}',
  '.mm-node{position:relative;z-index:1;display:flex;gap:14px;align-items:center;padding:11px 8px 11px 0;cursor:pointer;border-radius:14px;transition:.25s}',
  '.mm-node:hover{background:rgba(255,255,255,.05)}',
  '.mm-orb{flex:0 0 auto;width:52px;height:52px;margin-left:10px;border-radius:50%;display:grid;place-items:center;font-size:23px;background:rgba(20,16,34,.96);border:2px solid var(--line);position:relative;z-index:2;transition:.45s}',
  '.mm-node.on .mm-orb{border-color:var(--spark);background:radial-gradient(circle at 50% 38%,rgba(255,210,122,.4),rgba(20,16,34,.96));box-shadow:0 0 22px rgba(255,210,122,.5)}',
  '.mm-node.off{filter:grayscale(1) brightness(.7);opacity:.5}',
  '.mm-body{min-width:0}',
  '.mm-tt{font-family:Cinzel,serif;font-size:16px;color:var(--text);display:flex;align-items:center;gap:7px}',
  '.mm-sb{font-size:12px;color:var(--muted);margin-top:2px}',
  '.mm-need{font-size:11px;color:var(--gold);margin-top:3px;font-family:JetBrains Mono,monospace}',
  '.mm-lock{font-size:12px}',
  '#mm-go{margin:18px auto 0;display:block;width:100%;max-width:360px}',
  '#mm-go.locked{opacity:.55;cursor:not-allowed}',
  '#mm-card .libel{color:var(--spark)}',
  '#mm-card .mm-map{margin-top:12px}',
  '#mm-card .mm-map .trait{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}',
  '#mm-card .mm-map .trait:last-child{border:none}',
  '#mm-card .mm-map .trait b{color:var(--text);text-align:right}',
  '#mm-card .mm-map .trait span{color:var(--muted)}'
 ].join('');
 document.head.appendChild(st);
}

function ensureScreen(){
 if(document.getElementById('s-macro'))return;
 var ref=document.getElementById('s-game');
 if(!ref||!ref.parentNode)return;
 var sec=document.createElement('div');sec.className='screen';sec.id='s-macro';
 sec.innerHTML='<span class="eyebrow">Карта Восхождения · большая игра</span>'+
  '<h1>Путь Света</h1>'+
  '<p class="sub">Свет растекается по миру AWARA по мере твоего роста. Коснись ступени, чтобы узнать её — и войди в большую игру, пройдя путь.</p>'+
  '<div class="mm-head" id="mm-head"></div>'+
  '<div class="mm-col" id="mm-col"></div>'+
  '<button class="btn ghost locked" id="mm-go">🔒 Войти в большую игру</button>';
 ref.parentNode.insertBefore(sec,ref.nextSibling);
}

function ensureCard(){
 if(document.getElementById('mm-card'))return;
 var d=document.createElement('div');d.className='libmodal';d.id='mm-card';
 d.innerHTML='<div class="libcard awara-glass-card" style="text-align:left">'+
  '<div class="libglyph" id="mm-cglyph" style="text-align:center">🔮</div>'+
  '<h2 id="mm-cname" style="margin-top:6px;text-align:center">—</h2>'+
  '<div class="libel" id="mm-cstate" style="text-align:center">—</div>'+
  '<p class="sub" id="mm-clore" style="margin-top:12px">—</p>'+
  '<div class="card awara-glass-card mm-map"><span class="label">Под капотом</span>'+
   '<div class="trait"><span>Пространство</span><b id="mm-cspace">—</b></div>'+
   '<div class="trait"><span>Чакры</span><b id="mm-cchakras">—</b></div>'+
   '<div class="trait"><span>Локи</span><b id="mm-clokas">—</b></div>'+
   '<div class="trait"><span>Порог Света</span><b id="mm-cneed">—</b></div></div>'+
  '<button class="btn ghost" style="margin-top:14px" onclick="window.AwaraMacroMap.closeCard()">Закрыть</button></div>';
 document.body.appendChild(d);
}

function openCard(key){
 ensureCard();
 var n=null,i;for(i=0;i<NODES.length;i++){if(NODES[i].key===key)n=NODES[i];}
 if(!n)return;
 var lv=light();var on=lv>=n.need;
 document.getElementById('mm-cglyph').textContent=n.icon;
 document.getElementById('mm-cname').textContent=n.title;
 document.getElementById('mm-cstate').textContent=on?('✦ Открыто · Свет '+lv):('🔒 Закрыто · нужно '+n.need+' Света (сейчас '+lv+')');
 document.getElementById('mm-clore').textContent=n.lore;
 document.getElementById('mm-cspace').textContent=n.space;
 document.getElementById('mm-cchakras').textContent=n.chakras;
 document.getElementById('mm-clokas').textContent=n.lokas;
 document.getElementById('mm-cneed').textContent=n.need===0?'0 · стартовая ступень':(n.need+' / 100');
 document.getElementById('mm-card').classList.add('open');
}
function closeCard(){var c=document.getElementById('mm-card');if(c)c.classList.remove('open');}

function render(){
 var col=document.getElementById('mm-col');if(!col)return;
 var lv=light(),i,j,k,m;
 var cur=NODES[0];for(i=0;i<NODES.length;i++){if(lv>=NODES[i].need)cur=NODES[i];}
 var nextN=null;for(j=0;j<NODES.length;j++){if(lv<NODES[j].need){nextN=NODES[j];break;}}
 var head=document.getElementById('mm-head');
 if(head){
  head.innerHTML='<div class="mm-ring" id="mm-ring"><b>'+lv+'</b></div>'+
   '<div class="mm-hmeta"><div class="t">Ступень: '+cur.icon+' '+cur.title+'</div>'+
   '<div class="s">'+(nextN?('До «'+nextN.title+'» — ещё '+(nextN.need-lv)+' Света'):'Все ступени пройдены — мир расцвёл')+'</div></div>';
  var ring=document.getElementById('mm-ring');if(ring)ring.style.background='conic-gradient(var(--gold) 0% '+lv+'%,rgba(255,255,255,.06) '+lv+'% 100%)';
 }
 var rows='<div class="mm-rail"><div class="mm-railfill" id="mm-railfill"></div></div>';
 for(k=NODES.length-1;k>=0;k--){
  var n=NODES[k];var on=lv>=n.need;
  rows+='<div class="mm-node '+(on?'on':'off')+'" data-mm="'+n.key+'">'+
   '<div class="mm-orb">'+n.icon+'</div>'+
   '<div class="mm-body"><div class="mm-tt">'+n.title+(on?'':' <span class="mm-lock">🔒</span>')+'</div>'+
   '<div class="mm-sb">'+n.sub+'</div>'+
   '<div class="mm-need">'+(n.need===0?'старт · открыто':(on?('открыто · ✦ '+n.need):('нужно '+n.need+' Света')))+'</div></div></div>';
 }
 col.innerHTML=rows;
 var nodes=col.querySelectorAll('.mm-node');
 for(m=0;m<nodes.length;m++){(function(el){el.onclick=function(){openCard(el.getAttribute('data-mm'));};})(nodes[m]);}
 var fill=document.getElementById('mm-railfill');
 if(fill){fill.style.height='0%';setTimeout(function(){fill.style.height=lv+'%';},60);}
 var goBtn=document.getElementById('mm-go');
 if(goBtn){
  var ready=lv>=90;
  goBtn.className=ready?'btn awara-gold-button':'btn ghost locked';
  goBtn.textContent=ready?'✦ Войти в большую игру AWARA':'🔒 Войти в большую игру (нужно 90 Света)';
  goBtn.onclick=function(){
   var cl=light();
   if(cl>=90){if(typeof window.go==='function')window.go('game');}
   else{if(typeof window.showToast==='function')window.showToast('Накопи Свет до 90, чтобы открыть переход');}
  };
 }
}

function showMacro(){
 ensureScreen();render();
 var screens=document.querySelectorAll('.screen'),i;
 for(i=0;i<screens.length;i++)screens[i].classList.remove('active');
 var s=document.getElementById('s-macro');if(s){s.classList.add('active');s.scrollTop=0;}
 var nb=document.querySelectorAll('.nav button'),j;
 for(j=0;j<nb.length;j++)nb[j].classList.toggle('active',nb[j].getAttribute('data-nav')==='macro');
}

function wrapGo(){
 if(window.go&&window.go.__mmWrapped)return;
 var orig=window.go;
 if(typeof orig!=='function'){setTimeout(wrapGo,200);return;}
 var w=function(name){if(name==='macro'){showMacro();return;}return orig.apply(this,arguments);};
 w.__mmWrapped=true;window.go=w;
}

function wireBtn(){
 var b=document.querySelector('.nav button[data-nav="macro"]');
 if(b&&!b.__mm){b.__mm=1;b.addEventListener('click',function(){showMacro();});}
}

function boot(){styleOnce();ensureScreen();ensureCard();wrapGo();wireBtn();setTimeout(wireBtn,800);setTimeout(wireBtn,1600);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,120);});}else{setTimeout(boot,120);}
window.AwaraMacroMap={show:showMacro,render:render,openCard:openCard,closeCard:closeCard,__ready:true};
})();
