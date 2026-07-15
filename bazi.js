/* ===== AWARA · Ба-Цзы (Четыре Столпа Судьбы, 八字) — точный расчёт ===== */
/* Год — от Ли-Чунь (☉=315° троп.); месяц — по солнечным термам (12 главных цзе);
   день — 60-дневный цикл (якорь 07.01.2000 = 甲子, JDN 2451551, (JDN-11)mod60);
   час — по ИСТИННОМУ солнечному времени (долгота + уравнение времени), 五虎遁/五鼠遁. */
/* Переопределяет систему 'chinese' в window.AwaraCalc.systems. Движок и calc-systems.js не трогает. */
(function(){
'use strict';
if(window.AwaraBazi&&window.AwaraBazi.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function birth(){var st=S();return (st&&st.birth)?st.birth:{date:'01.01.2000',time:'12:00',tz:0,lon:0,lat:0};}

var STEMS=[
 {c:'甲',r:'Цзя',el:'Дерево',pol:'Ян'},{c:'乙',r:'И',el:'Дерево',pol:'Инь'},
 {c:'丙',r:'Бин',el:'Огонь',pol:'Ян'},{c:'丁',r:'Дин',el:'Огонь',pol:'Инь'},
 {c:'戊',r:'У',el:'Земля',pol:'Ян'},{c:'己',r:'Цзи',el:'Земля',pol:'Инь'},
 {c:'庚',r:'Гэн',el:'Металл',pol:'Ян'},{c:'辛',r:'Синь',el:'Металл',pol:'Инь'},
 {c:'壬',r:'Жэнь',el:'Вода',pol:'Ян'},{c:'癸',r:'Гуй',el:'Вода',pol:'Инь'}
];
var BRANCH=[
 {c:'子',r:'Цзы',an:'Крыса',el:'Вода'},{c:'丑',r:'Чоу',an:'Бык',el:'Земля'},
 {c:'寅',r:'Инь',an:'Тигр',el:'Дерево'},{c:'卯',r:'Мао',an:'Кролик',el:'Дерево'},
 {c:'辰',r:'Чэнь',an:'Дракон',el:'Земля'},{c:'巳',r:'Сы',an:'Змея',el:'Огонь'},
 {c:'午',r:'У',an:'Лошадь',el:'Огонь'},{c:'未',r:'Вэй',an:'Коза',el:'Земля'},
 {c:'申',r:'Шэнь',an:'Обезьяна',el:'Металл'},{c:'酉',r:'Ю',an:'Петух',el:'Металл'},
 {c:'戌',r:'Сюй',an:'Собака',el:'Земля'},{c:'亥',r:'Хай',an:'Свинья',el:'Вода'}
];
var EL2DAIMON={'Дерево':'Воздух','Огонь':'Огонь','Земля':'Земля','Металл':'Эфир','Вода':'Вода'};
var DM={
 '甲':'большое дерево: рост, прямота, дальновидный лидер-первопроходец',
 '乙':'гибкая лоза: адаптивность, дипломатия, мягкая настойчивость',
 '丙':'солнце: яркость, щедрость, вдохновляющая открытость',
 '丁':'свеча-звезда: тонкий свет, проницательность, тёплая преданность',
 '戊':'гора: надёжность, устойчивость, защита и широта',
 '己':'пашня: питание, забота, практичная плодородная мудрость',
 '庚':'клинок-руда: решимость, справедливость, сила воли',
 '辛':'драгоценность: утончённость, вкус, ценность и точность',
 '壬':'океан-река: масштаб, движение, изобретательный ум',
 '癸':'роса-дождь: чувствительность, интуиция, тихая глубина'
};
function pmod(a,n){return ((a%n)+n)%n;}
function jdnNoon(Y,M,D){var a=Math.floor((14-M)/12);var y=Y+4800-a;var m=M+12*a-3;return D+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;}
function pillar(si,bi){var s=STEMS[si],b=BRANCH[bi];return {si:si,bi:bi,s:s,b:b,gz:s.c+b.c,r:s.r+'-'+b.r,name:s.el+' '+s.pol+' / '+b.an,el:s.el};}

/* истинное солнечное время → {h, dayShift} */
function solarTime(Y,M,D,h,mi,tz,lon){
 var meridian=tz*15;var lonCorr=(lon-meridian)*4; /* минуты */
 var doy=Math.round((Date.UTC(Y,M-1,D)-Date.UTC(Y,0,0))/86400000);
 var B=2*Math.PI*(doy-81)/364;var eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B); /* минуты */
 var mins=h*60+mi+lonCorr+eot;var shift=0;
 while(mins<0){mins+=1440;shift--;}while(mins>=1440){mins-=1440;shift++;}
 return {h:mins/60,shift:shift,corr:Math.round(lonCorr+eot)};
}

function compute(){
 var b=birth();var dp=String(b.date||'01.01.2000').split('.').map(Number);var tp=String(b.time||'12:00').split(':').map(Number);
 var D=dp[0]||1,M=dp[1]||1,Y=dp[2]||2000,hh=tp[0]||0,mm=tp[1]||0;
 var tz=(+b.tz||0),lon=(b.lon!=null?+b.lon:0);
 var EPH=window.AwaraEph;
 /* тропическая долгота Солнца на момент рождения (UT) */
 var lam=null;
 if(EPH&&EPH.jd&&EPH.sunData){var ut=hh+mm/60-tz;var d=EPH.jd(Y,M,D,ut)-2451543.5;lam=EPH.sunData(d).lon;}
 /* --- если эфемерид нет: грубая аппроксимация долготы по дате --- */
 if(lam==null){var doy=Math.round((Date.UTC(Y,M-1,D)-Date.UTC(Y,0,0))/86400000);lam=pmod((doy-79)*0.9856+0,360);}
 /* ГОД: рубеж Ли-Чунь (☉=315°) */
 var beforeLiChun=(M===1)||(M===2&&lam<315);
 var yY=beforeLiChun?(Y-1):Y;
 var ys=pmod(yY-4,10),yb=pmod(yY-4,12);
 /* МЕСЯЦ: солнечный терм. k=0 → 寅 начинается при ☉=315° */
 var k=Math.floor(pmod(lam-315,360)/30);var mb=pmod(k+2,12);
 var tiger=[2,4,6,8,0][ys%5];var ms=pmod(tiger+k,10);
 /* ЧАС: истинное солнечное время */
 var stt=solarTime(Y,M,D,hh,mm,tz,lon);
 var sh=stt.h;var dayShift=stt.shift;
 if(sh>=23)dayShift+=1; /* поздний 子 (23:00+) относится к следующему дню */
 /* ДЕНЬ: 60-дневный цикл от якоря, с учётом сдвига дня */
 var dt=new Date(Date.UTC(Y,M-1,D));dt.setUTCDate(dt.getUTCDate()+dayShift);
 var dJ=jdnNoon(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate());
 var di=pmod(dJ-11,60);var ds=di%10,db=di%12;
 /* ЧАС столп */
 var hb=Math.floor((sh+1)/2)%12;var rat=[0,2,4,6,8][ds%5];var hs=pmod(rat+hb,10);
 var P={year:pillar(ys,yb),month:pillar(ms,mb),day:pillar(ds,db),hour:pillar(hs,hb)};
 /* баланс пяти стихий (8 знаков) */
 var cnt={'Дерево':0,'Огонь':0,'Земля':0,'Металл':0,'Вода':0};
 [P.year,P.month,P.day,P.hour].forEach(function(p){cnt[p.s.el]++;cnt[p.b.el]++;});
 return {P:P,cnt:cnt,solarHour:sh,corr:stt.corr,dm:P.day.s,lam:lam,yY:yY};
}

function sysBazi(){
 var R;try{R=compute();}catch(e){return null;}
 var P=R.P,dm=R.dm;
 var hStr=(Math.floor(R.solarHour)<10?'0':'')+Math.floor(R.solarHour)+':'+(Math.round((R.solarHour%1)*60)<10?'0':'')+Math.round((R.solarHour%1)*60);
 var order=[['Час',P.hour],['День ☀',P.day],['Месяц',P.month],['Год',P.year]];
 var rows=order.map(function(x){var p=x[1];return '<div class="trait"><span>'+x[0]+'</span><b>'+p.gz+' · '+p.name+'</b></div>';}).join('');
 var bal=['Дерево','Огонь','Земля','Металл','Вода'].map(function(e){return e+' '+R.cnt[e];}).join(' · ');
 var html='<p class="sub" style="font-size:13px">Четыре Столпа (八字). Год — от Ли-Чунь (☉ 315°), месяц — по солнечным термам, день — 60-дневный цикл (якорь 07.01.2000=甲子), час — по истинному солнечному времени (поправка '+(R.corr>=0?'+':'')+R.corr+' мин → '+hStr+').</p>'
  +rows
  +'<div class="trait" style="border:none"><span>Баланс стихий</span><b>'+bal+'</b></div>'
  +'<p class="adv" style="font-size:14px;margin-top:8px">Господин Дня (Day Master) — <b>'+dm.c+' '+dm.el+' '+dm.pol+'</b>: '+DM[dm.c]+'. Это стихия Личности; окружающие столпы показывают ресурсы и сценарии судьбы.</p>';
 var dmEl=EL2DAIMON[dm.el]||'Эфир';
 var sub=P.day.gz+' · '+dm.el+' '+dm.pol;
 return {icon:'🐉',title:'Ба-Цзы',sub:sub,html:html,
  facet:{sys:'Китайская',icon:'🐉',name:'Господин Дня '+dm.c+' ('+dm.el+' '+dm.pol+')',el:dmEl,
   quality:'Day Master '+dm.el+' '+dm.pol+' · год '+P.year.b.an,
   line:'Ба-Цзы (Четыре Столпа): Господин Дня — '+dm.c+' '+dm.el+' '+dm.pol+' ('+DM[dm.c]+'); столпы — год '+P.year.gz+' ('+P.year.name+'), месяц '+P.month.gz+' ('+P.month.name+'), день '+P.day.gz+', час '+P.hour.gz+' ('+P.hour.name+'); баланс стихий — '+['Дерево','Огонь','Земля','Металл','Вода'].map(function(e){return e+':'+R.cnt[e];}).join(', ')+'.'}};
}

function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='chinese'){AC.systems[i].f=sysBazi;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);

window.AwaraBazi={__ready:true,sysBazi:sysBazi,compute:compute,STEMS:STEMS,BRANCH:BRANCH};
})();
