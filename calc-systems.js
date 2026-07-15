/* ===== AWARA · Системы расчёта (мульти-расчёт + грани Даймона) ===== */
/* Ведическое ядро остаётся. Каждая система добавляет грань. Слой не трогает движок. */
(function(){
'use strict';
if(window.AwaraCalc&&window.AwaraCalc.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:null;}
function rv(x){return ((x%360)+360)%360;}
function sgn(lon){return (window.signOf?window.signOf(rv(lon)):'—');}
function elOf(s){return window.elementOf?window.elementOf(s):'Эфир';}
function bparts(){var st=S();var b=(st&&st.birth)?st.birth:{date:'01.01.2000',time:'12:00',tz:0};var dp=String(b.date||'').split('.').map(Number);var tp=String(b.time||'').split(':').map(Number);return {D:dp[0]||1,M:dp[1]||1,Y:dp[2]||2000,h:tp[0]||0,mi:tp[1]||0,tz:(+b.tz||0)};}
function ay(){var st=S();return (st&&st.natal&&st.natal.ay!=null)?st.natal.ay:24.1;}

/* ---------- 1. Западная (тропическая) ---------- */
function sysTropical(){
  var st=S();if(!st||!st.natal)return null;var a=ay();var b=st.natal.bodies;
  var order=['Лагна','Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
  function dms(L){L=rv(L);var dd=Math.floor(L%30);var mm=Math.round((L%30-dd)*60);if(mm===60){mm=0;dd++;}return dd+'°'+(mm<10?'0':'')+mm+'′';}var rows=order.map(function(p){if(b[p]==null)return '';var L=b[p]+a;return '<div class="trait"><span>'+p+'</span><b>'+sgn(L)+' '+dms(L)+'</b></div>';}).join('');
  var sun=sgn(b['Солнце']+a),moon=sgn(b['Луна']+a),asc=sgn(b['Лагна']+a);var el=elOf(sun);
  var html='<p class="sub" style="font-size:13px">Тропический зодиак (как в западной астрологии): к сидерическим долготам добавлена аянамша ≈'+a.toFixed(2)+'°.</p>'+rows;
  return {icon:'♈',title:'Западная',sub:'☉ '+sun+' · ☾ '+moon+' · AC '+asc,html:html,
    facet:{sys:'Западная',icon:'♈',name:'Солнце в '+sun,el:el,quality:'Тропическая воля '+sun,line:'Западная (тропическая): Солнце '+sun+', Луна '+moon+', Асцендент '+asc+', стихия '+el+'.'}};
}

/* ---------- 2. Китайская (Ба-Цзы) ---------- */
function sysChinese(){
  var p=bparts();var Y=p.Y;
  var animals=['Крыса','Бык','Тигр','Кролик','Дракон','Змея','Лошадь','Коза','Обезьяна','Петух','Собака','Свинья'];
  var qual=['ум и запас','труд и опора','смелость и натиск','такт и мир','мощь и удача','мудрость и интуиция','свобода и страсть','искусство и кротость','смекалка и игра','точность и честь','верность и защита','щедрость и покой'];
  var ai=((Y-4)%12+12)%12;var animal=animals[ai];
  var stems=['Дерево Ян','Дерево Инь','Огонь Ян','Огонь Инь','Земля Ян','Земля Инь','Металл Ян','Металл Инь','Вода Ян','Вода Инь'];
  var el5arr=['Дерево','Дерево','Огонь','Огонь','Земля','Земля','Металл','Металл','Вода','Вода'];
  var si=((Y-4)%10+10)%10;var stem=stems[si];var el5=el5arr[si];
  var map={'Дерево':'Воздух','Огонь':'Огонь','Земля':'Земля','Металл':'Эфир','Вода':'Вода'};var el=map[el5];
  var html='<p class="sub" style="font-size:13px">Ба-Цзы по году '+Y+' (без поправки на китайский Новый год — приближённо).</p>'+
   '<div class="trait"><span>Тотем года</span><b>'+animal+'</b></div>'+
   '<div class="trait"><span>Небесный ствол</span><b>'+stem+'</b></div>'+
   '<div class="trait" style="border:none"><span>Стихия</span><b>'+el5+'</b></div>'+
   '<p class="adv" style="font-size:14px;margin-top:8px">'+animal+' — '+qual[ai]+'. Стихия '+el5+' задаёт способ действия.</p>';
  return {icon:'🐲',title:'Китайская',sub:animal+' · '+el5,html:html,
   facet:{sys:'Китайская',icon:'🐲',name:animal+' ('+el5+')',el:el,quality:stem+' — '+qual[ai],line:'Китайская: год '+animal+', ствол '+stem+', стихия '+el5+'.'}};
}

/* ---------- 3. Майя (Цолькин) ---------- */
function jdn(Y,M,D){var a=Math.floor((14-M)/12);var y=Y+4800-a;var m=M+12*a-3;return D+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;}
function sysMaya(){
  var p=bparts();var J=jdn(p.Y,p.M,p.D);var dc=J-584283;
  var tone=(((dc+3)%13)+13)%13+1;
  var signs=['Имиш','Ик','Акбаль','Кан','Чикчан','Кими','Маник','Ламат','Мулук','Ок','Чуэн','Эб','Бен','Иш','Мен','Киб','Кабан','Эцнаб','Кавак','Ахау'];
  var sq=['исток, доверие','ветер, дух и слово','ночь, интуиция','семя, цель','змей, сила тела','переход, отпускание','рука, свершение','звезда, гармония','луна, поток','пёс, верность','обезьяна, игра','дорога судьбы','тростник, авторитет','ягуар, магия','орёл, видение','воин, разум','земля, синхрония','зеркало, ясность','буря, преображение','солнце, просветление'];
  var si=(((dc+19)%20)+20)%20;var seal=signs[si];
  var kin=((((dc+159)%260)+260)%260)+1;
  var html='<p class="sub" style="font-size:13px">Цолькин (корреляция GMT 584283) по дате рождения.</p>'+
   '<div class="trait"><span>Кин</span><b>'+kin+' / 260</b></div>'+
   '<div class="trait"><span>Тон</span><b>'+tone+' / 13</b></div>'+
   '<div class="trait" style="border:none"><span>Печать</span><b>'+seal+'</b></div>'+
   '<p class="adv" style="font-size:14px;margin-top:8px">'+tone+' '+seal+' — '+sq[si]+'.</p>';
  return {icon:'◉',title:'Майя',sub:'Кин '+kin+' · '+tone+' '+seal,html:html,
   facet:{sys:'Майя',icon:'◉',name:tone+' '+seal,el:'Земля',quality:sq[si],line:'Майя: кин '+kin+', тон '+tone+', печать '+seal+' ('+sq[si]+').'}};
}

/* ---------- 4. Нумерология ---------- */
function reduceNum(n){while([11,22,33].indexOf(n)<0&&n>9){var s=0;String(n).split('').forEach(function(d){s+=(+d);});n=s;}return n;}
function sysNumerology(){
  var p=bparts();function rd1(n){while([11,22,33].indexOf(n)<0&&n>9){var s=0;String(n).split('').forEach(function(d){s+=(+d);});n=s;}return n;}var dN=rd1(p.D),mN=rd1(p.M),yN=rd1(p.Y);var life=reduceNum(dN+mN+yN);var bday=rd1(p.D);
  var desc={1:'Лидер, воля, начало',2:'Дипломат, союз, чувство',3:'Творец, слово, радость',4:'Строитель, порядок, труд',5:'Странник, свобода, перемены',6:'Хранитель, любовь, забота',7:'Мудрец, поиск, тишина',8:'Властелин, сила, изобилие',9:'Гуманист, отдача, завершение',11:'Вестник, интуиция, свет',22:'Мастер-строитель, замысел',33:'Учитель, служение-любовь'};
  var elmap={1:'Огонь',2:'Вода',3:'Огонь',4:'Земля',5:'Воздух',6:'Вода',7:'Эфир',8:'Земля',9:'Огонь',11:'Эфир',22:'Земля',33:'Эфир'};
  var html='<p class="sub" style="font-size:13px">Число Жизненного Пути из даты '+p.D+'.'+p.M+'.'+p.Y+'.</p>'+
   '<div class="trait" style="border:none"><span>Число судьбы</span><b>'+life+'</b></div>'+'<div class="trait"><span>Разбор Д·М·Г</span><b>'+p.D+'→'+dN+' · '+p.M+'→'+mN+' · '+p.Y+'→'+yN+'</b></div>'+'<div class="trait" style="border:none"><span>Число дня</span><b>'+bday+'</b></div>'+
   '<p class="adv" style="font-size:14px;margin-top:8px">'+(desc[life]||'')+'. Путь = '+dN+'+'+mN+'+'+yN+' → '+life+'.</p>';
  return {icon:'🔢',title:'Нумерология',sub:'Путь '+life,html:html,
   facet:{sys:'Нумерология',icon:'🔢',name:'Число '+life,el:elmap[life]||'Эфир',quality:desc[life]||'',line:'Нумерология: число пути '+life+' — '+(desc[life]||'')+'.'}};
}

/* ---------- 5. Хьюман Дизайн (приближённо) ---------- */
function sysHD(){
  var p=bparts();var a=ay();var st=S();
  var types=['Манифестор','Генератор','Манифестирующий Генератор','Проектор','Рефлектор'];
  var tdesc=['инициирует и сообщает','откликается и строит','откликается и действует многозадачно','ведёт и направляет','отражает и сверяется с циклом'];
  var seed=((p.D*31+p.M*17+p.Y)%100+100)%100;var ti=seed<8?4:seed<23?3:seed<43?0:seed<73?1:2;
  var line1=((p.D-1)%6)+1,line2=((p.M+p.Y)%6)+1;
  var sun=(st&&st.natal)?sgn(st.natal.bodies['Солнце']+a):'—';
  var auth=['эмоциональная — ждать ясности','сакральная — отклик тела','селезёночная — интуиция мига','эго/сердце','лунная — цикл 28 дней'][ti===4?4:ti===3?2:ti===0?3:0];
  var html='<p class="sub" style="font-size:13px">Приближённый профиль (полный бодиграф — отдельный модуль). Солнце ≈ '+sun+'.</p>'+
   '<div class="trait"><span>Тип</span><b>'+types[ti]+'</b></div>'+
   '<div class="trait"><span>Профиль</span><b>'+line1+'/'+line2+'</b></div>'+
   '<div class="trait" style="border:none"><span>Стратегия</span><b>'+tdesc[ti]+'</b></div>'+
   '<p class="adv" style="font-size:14px;margin-top:8px">Авторитет (ориентир): '+auth+'.</p>';
  return {icon:'🧬',title:'Хьюман Дизайн',sub:types[ti]+' · '+line1+'/'+line2,html:html,
   facet:{sys:'Хьюман Дизайн',icon:'🧬',name:types[ti]+' '+line1+'/'+line2,el:'Эфир',quality:'Стратегия: '+tdesc[ti],line:'Хьюман Дизайн (приближённо): тип '+types[ti]+', профиль '+line1+'/'+line2+', стратегия — '+tdesc[ti]+'.'}};
}

/* ---------- 6. Круголет Числобога (Коляды Дар) ---------- */
function sysSlavic(){
  var p=bparts();
  var slav=p.Y+5508+((p.M>9||(p.M===9&&p.D>=22))?1:0);
  var totems=['Тёмный Сох (Лось)','Жалящий Шершень','Притаившийся Лют (Волк)','Огнегривый Конь','Жемчужная Щука','Бородатая Жаба','Дикий Вепрь','Белый Филин','Шипящий Уж','Крадущийся Лис','Свернувшийся Ёж','Парящий Орёл','Прядущий Мизгирь (Паук)','Кричащий Петух','Златорогий Тур','Огненная Векша (Белка)'];
  var stihii=['Земля','Звезда','Огонь','Солнце','Дерево','Небеса','Океан-Море','Луна','Бог'];
  var ti=((slav)%16+16)%16;var si=((slav)%9+9)%9;
  var stihEl={'Земля':'Земля','Звезда':'Эфир','Огонь':'Огонь','Солнце':'Огонь','Дерево':'Воздух','Небеса':'Эфир','Океан-Море':'Вода','Луна':'Вода','Бог':'Эфир'};
  var html='<p class="sub" style="font-size:13px">Круголет Числобога (Коляды Дар) — народный календарь, приближённо. Лето ≈'+slav+' от С.М.З.Х.</p>'+
   '<div class="trait"><span>Тотем-год</span><b>'+totems[ti]+'</b></div>'+
   '<div class="trait" style="border:none"><span>Стихия лета</span><b>'+stihii[si]+'</b></div>'+
   '<p class="adv" style="font-size:14px;margin-top:8px">Покровитель года — '+totems[ti]+', стихия '+stihii[si]+'. Знаешь точный анкор-год — уточним соответствие.</p>';
  return {icon:'☸',title:'Круголет',sub:totems[ti]+' · '+stihii[si],html:html,
   facet:{sys:'Круголет',icon:'☸',name:totems[ti],el:stihEl[stihii[si]]||'Земля',quality:'Стихия '+stihii[si],line:'Круголет Числобога: тотем '+totems[ti]+', стихия '+stihii[si]+' (Лето ≈'+slav+').'}};
}

function sysShambhala(){var p=bparts();var Y=p.Y;var anim=['\u041c\u044b\u0448\u044c','\u0411\u044b\u043a','\u0422\u0438\u0433\u0440','\u0417\u0430\u044f\u0446','\u0414\u0440\u0430\u043a\u043e\u043d','\u0417\u043c\u0435\u044f','\u041b\u043e\u0448\u0430\u0434\u044c','\u041e\u0432\u0446\u0430','\u041e\u0431\u0435\u0437\u044c\u044f\u043d\u0430','\u041f\u0442\u0438\u0446\u0430','\u0421\u043e\u0431\u0430\u043a\u0430','\u0421\u0432\u0438\u043d\u044c\u044f'];var elem=['\u0414\u0435\u0440\u0435\u0432\u043e','\u041e\u0433\u043e\u043d\u044c','\u0417\u0435\u043c\u043b\u044f','\u0416\u0435\u043b\u0435\u0437\u043e','\u0412\u043e\u0434\u0430'];var ai=(((Y-4)%12)+12)%12;var ei=Math.floor(((((Y-4)%10)+10)%10)/2);var animal=anim[ai];var el5=elem[ei];var map={'\u0414\u0435\u0440\u0435\u0432\u043e':'\u0412\u043e\u0437\u0434\u0443\u0445','\u041e\u0433\u043e\u043d\u044c':'\u041e\u0433\u043e\u043d\u044c','\u0417\u0435\u043c\u043b\u044f':'\u0417\u0435\u043c\u043b\u044f','\u0416\u0435\u043b\u0435\u0437\u043e':'\u042d\u0444\u0438\u0440','\u0412\u043e\u0434\u0430':'\u0412\u043e\u0434\u0430'};var el=map[el5];var html='<p class="sub" style="font-size:13px">\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0428\u0430\u043c\u0431\u0430\u043b\u044b (\u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430) \u2014 60-\u043b\u0435\u0442\u043d\u0438\u0439 \u0446\u0438\u043a\u043b \u043f\u043e \u0433\u043e\u0434\u0443 '+Y+'; \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a: \u0411\u0430\u043a\u0430\u043d\u043e\u0432 \u00ab\u0412\u0435\u0447\u043d\u043e\u0441\u0442\u044c \u00b7 \u0412\u0440\u0435\u043c\u044f \u0411\u043e\u0433\u043e\u0432\u00bb.</p>'+'<div class="trait"><span>60-\u043b\u0435\u0442\u043d\u0438\u0439 \u0446\u0438\u043a\u043b</span><b>'+el5+'-'+animal+'</b></div>'+'<div class="trait"><span>\u0422\u0440\u0438 \u041a\u043e\u043b\u0435\u0441\u0430</span><b>\u0432\u043d\u0435\u0448\u043d\u0435\u0435 \u00b7 \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0435\u0435 \u00b7 \u0438\u043d\u043e\u0435</b></div>'+'<div class="trait"><span>\u0411\u043e\u0436\u0435\u0441\u0442\u0432\u043e</span><b>\u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430 \u0438 \u0412\u0438\u0448\u0432\u0430\u043c\u0430\u0442\u0430</b></div>'+'<div class="trait" style="border:none"><span>\u0414\u044b\u0445\u0430\u043d\u0438\u0435-\u043a\u043e\u0441\u043c\u043e\u0441</span><b>21600 \u0432\u0434\u043e\u0445\u043e\u0432/\u0441\u0443\u0442\u043a\u0438</b></div>'+'<p class="adv" style="font-size:14px;margin-top:8px">\u041a\u043e\u043b\u0435\u0441\u043e \u0412\u0440\u0435\u043c\u0435\u043d\u0438: '+el5+'-'+animal+' \u0437\u0430\u0434\u0430\u0451\u0442 \u0440\u0438\u0442\u043c \u0433\u043e\u0434\u0430; \u0441\u0442\u0438\u0445\u0438\u044f '+el5+' \u0441\u043e\u0437\u0432\u0443\u0447\u043d\u0430 '+el+'.</p>';return {icon:'\u2638',title:'\u0428\u0430\u043c\u0431\u0430\u043b\u0430',sub:el5+'-'+animal,html:html,facet:{sys:'\u0428\u0430\u043c\u0431\u0430\u043b\u0430 (\u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430)',icon:'\u2638',name:el5+'-'+animal,el:el,quality:'\u041a\u043e\u043b\u0435\u0441\u043e \u0412\u0440\u0435\u043c\u0435\u043d\u0438 \u00b7 '+el5,line:'\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0428\u0430\u043c\u0431\u0430\u043b\u044b (\u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430): 60-\u043b\u0435\u0442\u043d\u0438\u0439 \u0446\u0438\u043a\u043b '+el5+'-'+animal+', \u0441\u0442\u0438\u0445\u0438\u044f '+el5+', \u0422\u0440\u0438 \u041a\u043e\u043b\u0435\u0441\u0430, \u0431\u043e\u0436\u0435\u0441\u0442\u0432\u043e \u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430-\u0412\u0438\u0448\u0432\u0430\u043c\u0430\u0442\u0430.'}};}
var SYS=[{k:'western',f:sysTropical},{k:'chinese',f:sysChinese},{k:'maya',f:sysMaya},{k:'numerology',f:sysNumerology},{k:'hd',f:sysHD},{k:'slavic',f:sysSlavic},{k:'kalachakra',f:sysShambhala}];
function byKey(k){for(var i=0;i<SYS.length;i++)if(SYS[i].k===k)return SYS[i];return null;}

/* ---------- Грани (facets) ---------- */
function facets(){var st=S();if(!st)return [];if(!st.calcFacets)st.calcFacets=[];return st.calcFacets;}
function facetExists(sysName){return facets().some(function(x){return x.sys===sysName;});}
function addOrRemoveFacet(key){var st=S();if(!st)return;var s=byKey(key);if(!s)return;var r=null;try{r=s.f();}catch(e){}if(!r||!r.facet){if(window.showToast)window.showToast('Сначала рассчитай карту');return;}var fs=facets();var idx=fs.map(function(x){return x.sys;}).indexOf(r.facet.sys);var removed=false;if(idx>=0){fs.splice(idx,1);removed=true;}else{fs.push(r.facet);}if(window.save){try{window.save();}catch(e){}}csRenderSystems();if(window.renderDaimon){try{window.renderDaimon();}catch(e){}}if(window.showToast)window.showToast(removed?'Грань убрана':'✦ Грань добавлена Даймону');}

/* ---------- UI ---------- */
var ST='.cs-chip{border:1px solid var(--line);border-radius:20px;padding:7px 12px;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);cursor:pointer;transition:.2s;background:rgba(255,255,255,.02)}.cs-chip.sel{border-color:var(--gold);color:#fff}.cs-chip.on{background:linear-gradient(150deg,rgba(201,168,76,.22),rgba(123,98,201,.12));color:var(--spark)}.cs-chip.core{border-color:var(--violet-soft);color:var(--violet-soft);cursor:default}';
function injectStyle(){if(document.getElementById('cs-style'))return;var s=document.createElement('style');s.id='cs-style';s.textContent=ST;document.head.appendChild(s);}
function ensureUI(){var screen=document.getElementById('s-natal');if(!screen)return null;var box=document.getElementById('cs-box');if(!box){box=document.createElement('div');box.id='cs-box';box.innerHTML='<h2 style="margin-top:24px">🧭 Системы расчёта</h2><p class="sub" style="font-size:14px;margin-bottom:8px">Ведическое ядро остаётся. Каждая система добавляет грань Даймону.</p><div id="cs-chips" style="display:flex;flex-wrap:wrap;gap:8px"></div><div id="cs-detail" style="margin-top:12px"></div><div class="card" style="margin-top:12px"><span class="label">Грани Даймона</span><div id="cs-facets"></div></div>';screen.appendChild(box);}return box;}
var CUR=null;
function csRenderSystems(){var box=ensureUI();if(!box)return;
  var chips=document.getElementById('cs-chips');if(chips){chips.innerHTML='';var core=document.createElement('div');core.className='cs-chip core';core.innerHTML='ॐ Ведическое ядро';chips.appendChild(core);SYS.forEach(function(s){var r=null;try{r=s.f();}catch(e){}var on=r&&r.facet&&facetExists(r.facet.sys);var el=document.createElement('div');el.className='cs-chip'+(on?' on':'')+(CUR===s.k?' sel':'');el.innerHTML=(r?r.icon:'•')+' '+(r?r.title:s.k);el.onclick=function(){CUR=s.k;csRenderSystems();};chips.appendChild(el);});}
  var det=document.getElementById('cs-detail');if(det){if(CUR){var s=byKey(CUR);var r=null;try{r=s.f();}catch(e){}if(r){var on=r.facet&&facetExists(r.facet.sys);det.innerHTML='<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span style="font-family:Cinzel,serif;color:var(--gold);font-size:15px">'+r.icon+' '+r.title+'</span><span class="tag">'+r.sub+'</span></div><div style="margin-top:8px">'+r.html+'</div><button class="btn'+(on?' ghost':'')+'" id="cs-add">'+(on?'Убрать грань':'Добавить грань Даймону')+'</button></div>';var btn=document.getElementById('cs-add');if(btn)btn.onclick=function(){addOrRemoveFacet(CUR);};}else{det.innerHTML='<p class="sub" style="font-size:13px">Сначала рассчитай натальную карту кнопкой выше.</p>';}}else{det.innerHTML='<p class="sub" style="font-size:13px">Выбери систему выше, чтобы увидеть расчёт и добавить грань.</p>';}}
  var fb=document.getElementById('cs-facets');if(fb){var fs=facets();fb.innerHTML=fs.length?fs.map(function(x){return '<div class="trait"><span>'+(x.icon||'•')+' '+x.sys+'</span><b>'+x.name+'</b></div>';}).join(''):'<p class="sub" style="font-size:13px">Пока только ведическое ядро. Добавь грани из систем выше.</p>';}
}

/* ---------- Обёртки движка ---------- */
function csDaimonCard(){var scr=document.getElementById('s-daimon');if(!scr)return;var fs=facets();var card=document.getElementById('cs-dm');if(!card){card=document.createElement('div');card.className='card';card.id='cs-dm';scr.appendChild(card);}var dn=(S()&&S().daimon)?S().daimon.name:'—';card.innerHTML='<span class="label">Грани Даймона · доп. системы</span>'+(fs.length?(fs.map(function(x){return '<div class="trait"><span>'+(x.icon||'•')+' '+x.sys+'</span><b>'+x.name+'</b></div>';}).join('')+'<p class="sub" style="font-size:12px;margin-top:6px">Ядро остаётся ведическим ('+dn+'). Грани расширяют его голос.</p>'):'<p class="sub" style="font-size:13px">Добавь грани на экране Натал → Системы расчёта.</p>');}
function wrapNatal(){if(window.renderNatal&&!window.renderNatal.__cs){var prev=window.renderNatal;var w=function(){var r=prev.apply(this,arguments);try{csRenderSystems();}catch(e){}return r;};w.__cs=true;window.renderNatal=w;}}
function wrapDaimon(){if(window.renderDaimon&&!window.renderDaimon.__cs){var prev=window.renderDaimon;var w=function(){var r=prev.apply(this,arguments);try{csDaimonCard();}catch(e){}return r;};w.__cs=true;window.renderDaimon=w;}}
function wrapCtx(){if(window.aiContext&&!window.aiContext.__cs){var prev=window.aiContext;var w=function(){var base='';try{base=prev.apply(this,arguments)||'';}catch(e){}var fs=facets();if(fs.length){base+=' Дополнительные системы расчёта (грани Даймона; ядро остаётся ведическим): '+fs.map(function(x){return x.line;}).join(' ')+' ';}return base;};w.__cs=true;window.aiContext=w;}}

function boot(){try{injectStyle();}catch(e){}wrapNatal();wrapDaimon();wrapCtx();try{csRenderSystems();}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
boot();setTimeout(boot,300);setTimeout(boot,900);setTimeout(boot,1800);
window.AwaraCalc={__ready:true,render:csRenderSystems,systems:SYS,addFacet:addOrRemoveFacet};
})();
