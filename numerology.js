/* ===== AWARA · Нумерология (по дате рождения) — углублённый расчёт ===== */
/* Число пути (мастер 11/22/33) · число дня · Личный Год/Месяц · 4 Пика · 4 Вызова · кармические долги.
   Переопределяет систему 'numerology' в AwaraCalc (движок и calc-systems.js не трогает). */
(function(){
'use strict';
if(window.AwaraNum&&window.AwaraNum.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function bparts(){var st=S();var b=(st&&st.birth)?st.birth:{date:'01.01.2000'};var dp=String(b.date||'').split('.').map(Number);return {D:dp[0]||1,M:dp[1]||1,Y:dp[2]||2000};}
function reduce(n){n=Math.abs(n);while(n>9){var s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}n=s;}return n;}
function reduceM(n){n=Math.abs(n);while(n>9&&n!==11&&n!==22&&n!==33){var s=0;var t=n;while(t>0){s+=t%10;t=Math.floor(t/10);}n=s;}return n;}

var NUM={
 1:'лидер, воля, инициатива, независимость',
 2:'дипломат, чувствование, союз, баланс',
 3:'творец, слово, радость, самовыражение',
 4:'строитель, порядок, труд, устойчивость',
 5:'свобода, перемены, опыт, движение',
 6:'забота, гармония, дом, ответственность',
 7:'мудрец, анализ, тайна, вера-знание',
 8:'власть, изобилие, управление, карма дела',
 9:'служение, сострадание, завершение, широта',
 11:'провидец, вдохновение, духовный канал (мастер)',
 22:'мастер-строитель, большие дела на земле (мастер)',
 33:'учитель-целитель, любовь-служение (мастер)'
};
var PY={
 1:'старт нового 9-летнего цикла: семена, инициатива',
 2:'терпение, союзы, постепенный рост',
 3:'творчество, общение, радость, расширение',
 4:'труд, фундамент, дисциплина, порядок',
 5:'перемены, свобода, движение, неожиданности',
 6:'дом, семья, ответственность, любовь',
 7:'пауза, анализ, внутренняя работа, вера',
 8:'сила, деньги, власть, результаты',
 9:'завершение, отпускание, итоги перед новым циклом'
};
var NUM2EL={1:'Огонь',2:'Вода',3:'Воздух',4:'Земля',5:'Воздух',6:'Земля',7:'Вода',8:'Земля',9:'Огонь',11:'Эфир',22:'Земля',33:'Эфир'};

function compute(){
 var p=bparts();var D=p.D,M=p.M,Y=p.Y;
 var mm=reduce(M),dd=reduce(D),yy=reduce(Y);
 var rawLP=mm+dd+yy;var lifePath=reduceM(rawLP);
 var birthdayR=reduce(D);
 var now=new Date();var CY=now.getFullYear();var CM=now.getMonth()+1;
 var py=reduceM(mm+dd+reduce(CY));
 var pm=reduceM(reduce(py)+reduce(CM));
 /* Пики */
 var P1=reduceM(mm+dd),P2=reduceM(dd+yy),P3=reduceM(reduce(P1)+reduce(P2)),P4=reduceM(mm+yy);
 var lpAge=reduce(lifePath);var end1=36-lpAge;
 var age=CY-Y;
 var activeP=(age<=end1)?1:(age<=end1+9?2:(age<=end1+18?3:4));
 var pAges=['0–'+end1,(end1+1)+'–'+(end1+9),(end1+10)+'–'+(end1+18),(end1+19)+'+'];
 /* Вызовы */
 var C1=Math.abs(mm-dd),C2=Math.abs(dd-yy),C3=Math.abs(C1-C2),C4=Math.abs(mm-yy);
 /* Кармические долги */
 var kd=[];[13,14,16,19].forEach(function(n){if(D===n)kd.push(n+' (день рождения)');if(rawLP===n)kd.push(n+' (число пути)');});
 return {D:D,M:M,Y:Y,lifePath:lifePath,rawLP:rawLP,birthday:D,birthdayR:birthdayR,
  py:py,pm:pm,CY:CY,P:[P1,P2,P3,P4],pAges:pAges,activeP:activeP,C:[C1,C2,C3,C4],kd:kd};
}

function sysNum(){
 var R;try{R=compute();}catch(e){return null;}
 var lp=R.lifePath;
 var pinNames=['I пик','II пик','III пик','IV пик'];
 var pinRows=R.P.map(function(v,i){var act=(i+1===R.activeP)?' style="color:#d4a017;font-weight:700"':'';return '<span'+act+'>'+pinNames[i]+': <b>'+v+'</b> ('+R.pAges[i]+' лет)'+((i+1===R.activeP)?' ← сейчас':'')+'</span>';}).join('<br>');
 var chNames=['I','II (главный)','III','IV'];
 var chRows=R.C.map(function(v,i){return chNames[i]+': <b>'+v+'</b>';}).join(' · ');
 var html='<p class="sub" style="font-size:13px">Нумерология по дате рождения '+R.D+'.'+R.M+'.'+R.Y+'. Мастер-числа 11/22/33 сохраняются.</p>'
  +'<div class="trait"><span>Число пути</span><b>'+lp+'</b></div>'
  +'<div class="trait"><span>Число дня</span><b>'+R.birthday+' → '+R.birthdayR+'</b></div>'
  +'<div class="trait"><span>Личный год '+R.CY+'</span><b>'+R.py+' — '+(PY[reduce(R.py)]||'')+'</b></div>'
  +'<div class="trait" style="border:none"><span>Личный месяц</span><b>'+R.pm+'</b></div>'
  +'<p class="adv" style="font-size:13px;margin:10px 0 2px"><b>Пики жизни (Pinnacles)</b></p><p style="font-size:13px;line-height:1.7">'+pinRows+'</p>'
  +'<p class="adv" style="font-size:13px;margin:8px 0 2px"><b>Вызовы (Challenges)</b></p><p style="font-size:13px">'+chRows+'</p>'
  +(R.kd.length?'<p class="adv" style="font-size:13px;margin-top:6px"><b>Кармический долг:</b> '+R.kd.join(', ')+'</p>':'')
  +'<p class="adv" style="font-size:14px;margin-top:8px">Число пути <b>'+lp+'</b>: '+(NUM[lp]||'')+'. Сейчас идёт '+R.activeP+'-й пик ('+R.P[R.activeP-1]+': '+(NUM[reduce(R.P[R.activeP-1])]||'')+') и личный год '+R.py+' ('+(PY[reduce(R.py)]||'')+').</p>'
  +'<p class="sub" style="font-size:12px;opacity:.7;margin-top:6px">Числа имени (Выражение / Душа / Личность) требуют полного имени — добавятся, когда появится поле имени.</p>';
 var el=NUM2EL[lp]||'Воздух';
 var sub='путь '+lp+' · год '+R.py;
 return {icon:'🔢',title:'Нумерология',sub:sub,html:html,
  facet:{sys:'Нумерология',icon:'🔢',name:'Число пути '+lp,el:el,quality:NUM[lp]||'',
   line:'Нумерология: число пути '+lp+' ('+(NUM[lp]||'')+'); число дня '+R.birthdayR+'; личный год '+R.CY+' = '+R.py+' ('+(PY[reduce(R.py)]||'')+'); активный пик '+R.activeP+' = '+R.P[R.activeP-1]+'; вызовы '+R.C.join('/')+(R.kd.length?'; кармический долг '+R.kd.join(', '):'')+'.'}};
}

function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='numerology'){AC.systems[i].f=sysNum;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);
window.AwaraNum={__ready:true,sysNum:sysNum,compute:compute,reduce:reduce,reduceM:reduceM};
})();
