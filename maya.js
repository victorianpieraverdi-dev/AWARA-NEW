/* ===== AWARA · Майя (Цолькин / Дрималспелл) — Галактическая Подпись + Оракул ===== */
/* Kin 1–260 = 20 печатей × 13 тонов (GMT 584283, как в calc-systems).
   Оракул: Судьба · Аналог (поддержка) · Антипод (вызов) · Гид (высшее Я) · Скрытая сила.
   + Волна (Wavespell), цвет-род, значения печати и тона. Переопределяет систему 'maya' в AwaraCalc. */
(function(){
'use strict';
if(window.AwaraMaya&&window.AwaraMaya.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function bparts(){var st=S();var b=(st&&st.birth)?st.birth:{date:'01.01.2000'};var dp=String(b.date||'').split('.').map(Number);return {D:dp[0]||1,M:dp[1]||1,Y:dp[2]||2000};}
function jdn(Y,M,D){var a=Math.floor((14-M)/12);var y=Y+4800-a;var m=M+12*a-3;return D+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;}

/* 20 печатей (индекс 0–19 = печать 1–20) */
var SEALS=[
 {dn:'Дракон',yuc:'Имиш',color:'Красный',key:'Бытие, питание, исток рождения',el:'Огонь'},
 {dn:'Ветер',yuc:'Ик',color:'Белый',key:'Дух, дыхание, слово',el:'Воздух'},
 {dn:'Ночь',yuc:'Акбаль',color:'Синий',key:'Изобилие, интуиция, мечта',el:'Вода'},
 {dn:'Семя',yuc:'Кан',color:'Жёлтый',key:'Цель, рост, раскрытие',el:'Земля'},
 {dn:'Змей',yuc:'Чикчан',color:'Красный',key:'Жизненная сила, инстинкт, страсть',el:'Огонь'},
 {dn:'Соединитель Миров',yuc:'Кими',color:'Белый',key:'Переход, равенство, отпускание',el:'Воздух'},
 {dn:'Рука',yuc:'Маник',color:'Синий',key:'Свершение, исцеление, знание',el:'Вода'},
 {dn:'Звезда',yuc:'Ламат',color:'Жёлтый',key:'Гармония, искусство, красота',el:'Земля'},
 {dn:'Луна',yuc:'Мулук',color:'Красный',key:'Поток, вода, очищение',el:'Огонь'},
 {dn:'Собака',yuc:'Ок',color:'Белый',key:'Любовь, верность, сердце',el:'Воздух'},
 {dn:'Обезьяна',yuc:'Чуэн',color:'Синий',key:'Игра, магия, со-творение',el:'Вода'},
 {dn:'Человек',yuc:'Эб',color:'Жёлтый',key:'Свобода воли, мудрость, влияние',el:'Земля'},
 {dn:'Идущий по Небесам',yuc:'Бен',color:'Красный',key:'Пространство, бдительность, исследование',el:'Огонь'},
 {dn:'Маг',yuc:'Иш',color:'Белый',key:'Вне-временность, восприимчивость, чары',el:'Воздух'},
 {dn:'Орёл',yuc:'Мен',color:'Синий',key:'Видение, ум, замысел',el:'Вода'},
 {dn:'Воин',yuc:'Киб',color:'Жёлтый',key:'Разум, вопрошание, бесстрашие',el:'Земля'},
 {dn:'Земля',yuc:'Кабан',color:'Красный',key:'Синхронность, навигация, эволюция',el:'Огонь'},
 {dn:'Зеркало',yuc:'Эцнаб',color:'Белый',key:'Отражение, порядок, бесконечность',el:'Воздух'},
 {dn:'Буря',yuc:'Кавак',color:'Синий',key:'Самопорождение, катализ, энергия',el:'Вода'},
 {dn:'Солнце',yuc:'Ахау',color:'Жёлтый',key:'Огонь жизни, просветление, единство',el:'Земля'}
];
var TONES=[
 {n:'Магнитный',p:'Притяжение · цель, единство'},
 {n:'Лунный',p:'Стабилизация · вызов, полярность'},
 {n:'Электрический',p:'Активация · служение, связь'},
 {n:'Самосущный',p:'Определение · форма, мера'},
 {n:'Обертональный',p:'Управление · сила, сияние'},
 {n:'Ритмический',p:'Организация · равенство, баланс'},
 {n:'Резонансный',p:'Вдохновение · настройка, канал'},
 {n:'Галактический',p:'Гармонизация · целостность, образец'},
 {n:'Солнечный',p:'Реализация · намерение, пульс'},
 {n:'Планетарный',p:'Совершенствование · проявление'},
 {n:'Спектральный',p:'Растворение · освобождение'},
 {n:'Кристаллический',p:'Посвящение · сотрудничество'},
 {n:'Космический',p:'Превосхождение · присутствие, полёт'}
];
var COL2EL={'Красный':'Огонь','Белый':'Воздух','Синий':'Вода','Жёлтый':'Земля'};
var COLDOT={'Красный':'#c0392b','Белый':'#cfd3dc','Синий':'#2e6fb0','Жёлтый':'#d4a017'};

function sealAt(n){return SEALS[(((n-1)%20)+20)%20];}
function compute(){
 var p=bparts();var J=jdn(p.Y,p.M,p.D);var dc=J-584283;
 var tone=(((dc+3)%13)+13)%13+1;
 var si=(((dc+19)%20)+20)%20;var Sn=si+1;
 var kin=(((dc+159)%260)+260)%260+1;
 var analogN=(Sn<=18)?(19-Sn):(39-Sn);
 var antipodeN=((Sn+10-1)%20)+1;
 var off=[0,12,4,16,8][(tone-1)%5];var guideN=((Sn-1+off)%20)+1;
 var occultN=21-Sn;var occultTone=14-tone;
 var waveN=((((Sn-1-(tone-1))%20)+20)%20)+1;
 return {kin:kin,tone:tone,Sn:Sn,si:si,seal:SEALS[si],
  analog:sealAt(analogN),antipode:sealAt(antipodeN),guide:sealAt(guideN),
  occult:sealAt(occultN),occultTone:occultTone,wave:sealAt(waveN)};
}
function dot(c){return '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+(COLDOT[c]||'#888')+';margin-right:5px;vertical-align:middle"></span>';}
function sname(s){return s.color+' '+s.dn;}

function sysMaya(){
 var R;try{R=compute();}catch(e){return null;}
 var t=TONES[R.tone-1];var s=R.seal;
 var oracle=[
  ['Гид (высшее Я)',R.guide],
  ['Антипод (вызов)',R.antipode],
  ['Судьба (ты)',s],
  ['Аналог (поддержка)',R.analog],
  ['Скрытая сила',R.occult]
 ];
 var orows=oracle.map(function(x){var s2=x[1];return '<div class="trait"><span>'+x[0]+'</span><b>'+dot(s2.color)+sname(s2)+'</b></div>';}).join('');
 var html='<p class="sub" style="font-size:13px">Галактическая Подпись (Цолькин / Дрималспелл, GMT 584283) по дате рождения.</p>'
  +'<div class="trait"><span>Kin</span><b>'+R.kin+' / 260</b></div>'
  +'<div class="trait"><span>Подпись</span><b>'+dot(s.color)+R.tone+' '+sname(s)+'</b></div>'
  +'<div class="trait"><span>Печать</span><b>'+s.dn+' ('+s.yuc+') — '+s.key+'</b></div>'
  +'<div class="trait"><span>Тон '+R.tone+'</span><b>'+t.n+' — '+t.p+'</b></div>'
  +'<div class="trait" style="border:none"><span>Волна (Wavespell)</span><b>'+dot(R.wave.color)+sname(R.wave)+'</b></div>'
  +'<p class="adv" style="font-size:13px;margin:10px 0 4px"><b>Оракул — пять сил дня рождения</b></p>'+orows
  +'<p class="adv" style="font-size:14px;margin-top:8px">Ты — <b>'+R.tone+' '+sname(s)+'</b>: '+s.key+'. Тон «'+t.n+'» задаёт способ действия ('+t.p+'). Гид '+sname(R.guide)+' ведёт выше, антипод '+sname(R.antipode)+' закаляет, аналог '+sname(R.analog)+' поддерживает, скрытая сила '+R.occultTone+' '+sname(R.occult)+' — твоя глубинная магия.</p>';
 var el=COL2EL[s.color]||'Земля';
 var sub='Kin '+R.kin+' · '+R.tone+' '+s.dn;
 return {icon:'◉',title:'Майя',sub:sub,html:html,
  facet:{sys:'Майя',icon:'◉',name:R.tone+' '+sname(s),el:el,
   quality:s.key+' · тон '+TONES[R.tone-1].n,
   line:'Майя (Галактическая Подпись): Kin '+R.kin+'/260 — '+R.tone+' '+sname(s)+' ('+s.key+'); тон '+R.tone+' '+t.n+' ('+t.p+'); волна '+sname(R.wave)+'. Оракул: гид '+sname(R.guide)+', антипод-вызов '+sname(R.antipode)+', аналог-поддержка '+sname(R.analog)+', скрытая сила '+R.occultTone+' '+sname(R.occult)+'.'}};
}

function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='maya'){AC.systems[i].f=sysMaya;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);
window.AwaraMaya={__ready:true,sysMaya:sysMaya,compute:compute,SEALS:SEALS,TONES:TONES};
})();
