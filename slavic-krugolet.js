/* ===== AWARA · Аутентичный Даарийский Круголет Числобога ===== */
/* 9 месяцев-Дайлетов · 16 Чертогов Сварожьего Круга · 144-летний Круг Жизни (16 Лѣт × 9 Стихий). */
/* Переопределяет систему 'slavic' в window.AwaraCalc.systems (НЕ трогает движок и calc-systems.js). */
(function(){
'use strict';
if(window.AwaraKrugolet&&window.AwaraKrugolet.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function bparts(){var st=S();var b=(st&&st.birth)?st.birth:{date:'01.01.2000'};var dp=String(b.date||'').split('.').map(Number);return {D:dp[0]||1,M:dp[1]||1,Y:dp[2]||2000};}

/* ---------- 9 месяцев (Дайлеты). Новолетие = осеннее равноденствие (~22 сент). ---------- */
var MONTHS=[
 {n:'Рамхатъ',len:41,d:'Месяц Божественного Начала'},
 {n:'Айлѣтъ',len:40,d:'Месяц Новых Даров'},
 {n:'Бейлѣтъ',len:41,d:'Месяц Белого Сияния и Покоя Мира'},
 {n:'Гэйлѣтъ',len:40,d:'Месяц Вьюг и Стужи'},
 {n:'Дайлѣтъ',len:41,d:'Месяц Пробуждения Природы'},
 {n:'Элѣтъ',len:40,d:'Месяц Посева и Наречения'},
 {n:'Вэйлѣтъ',len:41,d:'Месяц Ветров'},
 {n:'Хейлѣтъ',len:40,d:'Месяц Получения Даров Природы'},
 {n:'Тайлѣтъ',len:41,d:'Месяц Завершения'}
];
function slavicMonth(D,M,Y){
 var cur=Date.UTC(Y,M-1,D);var nov=Date.UTC(Y,8,22);if(cur<nov)nov=Date.UTC(Y-1,8,22);
 var idx=Math.floor((cur-nov)/86400000);var dom=idx,mi=0;
 for(var i=0;i<9;i++){if(dom<MONTHS[i].len){mi=i;break;}dom-=MONTHS[i].len;}
 return {month:MONTHS[mi].n,desc:MONTHS[mi].d,dayOfMonth:dom+1,dayOfLeto:idx+1,monthIdx:mi};
}

/* ---------- 16 Чертогов Сварожьего Круга (по дате рождения). ---------- */
/* s:[месяц,день] — начало периода; период длится до начала следующего Чертога. Источник: 16-chertogov.ru. */
var CHERTOGS=[
 {s:[7,16],n:'Орёл',god:'Перунъ',el:'Воздух',q:'воля, высота духа, прорыв сквозь преграды'},
 {s:[8,7],n:'Раса',god:'Даждьбогъ (Тарх)',el:'Огонь',q:'благородство, чистота рода, светлая сила'},
 {s:[8,30],n:'Дева',god:'Жива',el:'Земля',q:'свет, чистота, целомудренная мощь, исцеление'},
 {s:[9,22],n:'Вепрь',god:'Рамхатъ',el:'Земля',q:'натиск, бесстрашие, разрушение преград'},
 {s:[10,14],n:'Щука',god:'Рожана',el:'Вода',q:'плавность, изобилие, поток жизни и достатка'},
 {s:[11,6],n:'Лебедь',god:'Макошь',el:'Вода',q:'судьба, верность, нить рода, женская мудрость'},
 {s:[11,27],n:'Змей',god:'Семарглъ',el:'Огонь',q:'преображение, тайное знание, очищающая страсть'},
 {s:[12,16],n:'Воронъ',god:'Коляда',el:'Эфир',q:'мудрость старца, прозрение, дар перемен'},
 {s:[1,10],n:'Медведь',god:'Сварогъ',el:'Земля',q:'сила, опора, хозяин, защита рода'},
 {s:[2,3],n:'Бусел (Аистъ)',god:'Родъ',el:'Воздух',q:'дом, дети, продолжение рода, добрая весть'},
 {s:[2,28],n:'Волкъ',god:'Велесъ',el:'Земля',q:'одиночество вожака, верность стае, воля'},
 {s:[3,25],n:'Лиса',god:'Марена',el:'Вода',q:'хитрость, чутьё, тайна, поиск своего пути'},
 {s:[4,17],n:'Туръ',god:'Крышень',el:'Земля',q:'упорство, труд, мощь, верность земле'},
 {s:[5,9],n:'Лось',god:'Лада',el:'Воздух',q:'лад, семья, мир, доброта-кормилица'},
 {s:[6,1],n:'Финистъ',god:'Вышень',el:'Эфир',q:'взлёт, идеал, преображение героя'},
 {s:[6,23],n:'Конь',god:'Купала',el:'Огонь',q:'устремление, свобода, путь, очищение'}
];
function chertogOf(D,M,Y){
 function ord(m,d){return m*31+d;}var t=ord(M,D);
 for(var i=0;i<16;i++){var a=ord(CHERTOGS[i].s[0],CHERTOGS[i].s[1]);var nx=CHERTOGS[(i+1)%16];var b=ord(nx.s[0],nx.s[1]);
  if(a<b){if(t>=a&&t<b)return CHERTOGS[i];}else{if(t>=a||t<b)return CHERTOGS[i];}}
 return CHERTOGS[0];
}

/* ---------- 144-летний Круг Жизни (16 Лѣт × 9 Стихий). Источник: Держава Русь, таб.1. ---------- */
var YEARS=['Странникъ (Путь)','Жрецъ','Жрица','Мiръ (Явь)','Свитокъ','Фениксъ','Лисъ (Навь)','Драконъ','Змей','Орёлъ','Дельфинъ','Конь','Пёсъ','Туръ (Корова)','Хоромы (Домъ)','Капище (Храмъ)'];
var YDESC=[
 'вечный путник, первопроходец, лёгкий на подъём искатель.',
 'хранитель знания, наставник, слово-закон, связь с Богами.',
 'интуиция и тайна, целительство, хранительница духа очага.',
 'миротворец и дипломат, равновесие, опора общины.',
 'собиратель мудрости, память рода, учёный судьбы.',
 'возрождение через огонь, преображение, несгибаемость.',
 'хитрость и чутьё, скрытые тропы, мастер невидимого.',
 'сила и власть, страж сокровищ, гордая мощь.',
 'мудрость-обновление, тайное знание, дар врачевания.',
 'высокий взгляд, воля вождя, духовный взлёт.',
 'дружелюбие и спасение, поток радости, проводник меж миров.',
 'устремление и свобода, верность, неутомимый труженик пути.',
 'верность, защита, служение, чуткий страж.',
 'изобилие и упорство, плодородие, кормилец рода.',
 'дом и уют, гостеприимство, хранитель устоев.',
 'святость и служение, завершение круга, мудрость предков.'
];
var STIHII=[
 {n:'Земля',color:'Чёрный',el:'Земля'},
 {n:'Звезда',color:'Красный',el:'Эфир'},
 {n:'Огонь',color:'Алый',el:'Огонь'},
 {n:'Солнце',color:'Златый',el:'Огонь'},
 {n:'Древо',color:'Зелёный',el:'Воздух'},
 {n:'Свага',color:'Небесный',el:'Эфир'},
 {n:'Океанъ',color:'Синий',el:'Вода'},
 {n:'Луна',color:'Фиолетовый',el:'Вода'},
 {n:'Богъ',color:'Белый',el:'Эфир'}
];
function letoOf(D,M,Y){var cur=Date.UTC(Y,M-1,D);var nov=Date.UTC(Y,8,22);return (cur<nov)?(Y+5508):(Y+5509);}
function krug(L){var idx=((L-7377)%144+144)%144;var N=idx+1;var yi=(N-1)%16;var si=Math.floor((N-1)/2)%9;return {N:N,year:YEARS[yi],yi:yi,desc:YDESC[yi],st:STIHII[si],si:si};}

/* ---------- Система для слоя расчётов ---------- */
function sysKrugolet(){
 var p=bparts();var L=letoOf(p.D,p.M,p.Y);var ch=chertogOf(p.D,p.M,p.Y);var mo=slavicMonth(p.D,p.M,p.Y);var k=krug(L);
 var nd=new Date();var nowL=letoOf(nd.getDate(),nd.getMonth()+1,nd.getFullYear());
 var html='<p class="sub" style="font-size:13px">Аутентичный Даарийский Круголет Числобога: 9 месяцев-Дайлетов · 16 Чертогов Сварожьего Круга · 144-летний Круг Жизни (16 Лѣт × 9 Стихий). Лѣто рождения — '+L+' от С.М.З.Х. (ныне '+nowL+').</p>'
  +'<div class="trait"><span>Круг Жизни</span><b>'+k.year+' · стихия '+k.st.n+'</b></div>'
  +'<div class="trait"><span>№ в Круге</span><b>'+k.N+' / 144 · цвет '+k.st.color+'</b></div>'
  +'<div class="trait"><span>Чертог рождения</span><b>'+ch.n+' (бог '+ch.god+')</b></div>'
  +'<div class="trait"><span>Месяц-Дайлетъ</span><b>'+mo.dayOfMonth+' '+mo.month+'</b></div>'
  +'<div class="trait" style="border:none"><span>День Лѣта</span><b>'+mo.dayOfLeto+' (из 365/369)</b></div>'
  +'<p class="adv" style="font-size:14px;margin-top:8px">'+k.year+' в стихии '+k.st.n+' ('+k.st.color+'): '+k.desc+' Чертог '+ch.n+' — покровитель '+ch.god+': '+ch.q+'. Рождён в месяц '+mo.month+' — '+mo.desc.toLowerCase()+'.</p>';
 return {icon:'☸',title:'Круголет',sub:k.year+' · '+k.st.n+' · '+ch.n,html:html,
  facet:{sys:'Круголет',icon:'☸',name:k.year+' · '+ch.n,el:(ch.el||k.st.el||'Земля'),quality:'Стихия '+k.st.n+' · бог '+ch.god,
   line:'Круголет Числобога (Даарийский): Круг Жизни — '+k.year+' в стихии '+k.st.n+' (№'+k.N+'/144, цвет '+k.st.color+'; '+k.desc+'); Чертог рождения — '+ch.n+', покровитель '+ch.god+' ('+ch.q+'); месяц рождения — '+mo.dayOfMonth+' '+mo.month+' ('+mo.desc+'); Лѣто '+L+' от С.М.З.Х.'}};
}

/* ---------- Подключение к слою AwaraCalc ---------- */
function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='slavic'){AC.systems[i].f=sysKrugolet;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);

window.AwaraKrugolet={__ready:true,sysKrugolet:sysKrugolet,chertogOf:chertogOf,slavicMonth:slavicMonth,letoOf:letoOf,krug:krug,MONTHS:MONTHS,CHERTOGS:CHERTOGS,YEARS:YEARS,STIHII:STIHII};
})();
