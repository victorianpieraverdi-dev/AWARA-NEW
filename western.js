/* ===== AWARA · Западная (тропическая) карта — углублённый расчёт ===== */
/* Дома Whole Sign от Асцендента · мажорные аспекты с орбисами · баланс стихий/крестов · управитель карты.
   Тропическая долгота = сидерическая (STATE.natal.bodies) + аянамша. Переопределяет систему 'western'. */
(function(){
'use strict';
if(window.AwaraWest&&window.AwaraWest.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function rv(x){return ((x%360)+360)%360;}
function ay(){var st=S();return (st&&st.natal&&st.natal.ay!=null)?st.natal.ay:24.1;}

var SIGNS=[
 {n:'Овен',el:'Огонь',q:'Кардинальный',r:'Марс'},
 {n:'Телец',el:'Земля',q:'Фиксированный',r:'Венера'},
 {n:'Близнецы',el:'Воздух',q:'Мутабельный',r:'Меркурий'},
 {n:'Рак',el:'Вода',q:'Кардинальный',r:'Луна'},
 {n:'Лев',el:'Огонь',q:'Фиксированный',r:'Солнце'},
 {n:'Дева',el:'Земля',q:'Мутабельный',r:'Меркурий'},
 {n:'Весы',el:'Воздух',q:'Кардинальный',r:'Венера'},
 {n:'Скорпион',el:'Вода',q:'Фиксированный',r:'Марс'},
 {n:'Стрелец',el:'Огонь',q:'Мутабельный',r:'Юпитер'},
 {n:'Козерог',el:'Земля',q:'Кардинальный',r:'Сатурн'},
 {n:'Водолей',el:'Воздух',q:'Фиксированный',r:'Сатурн'},
 {n:'Рыбы',el:'Вода',q:'Мутабельный',r:'Юпитер'}
];
var GL={'Солнце':'☉','Луна':'☾','Меркурий':'☿','Венера':'♀','Марс':'♂','Юпитер':'♃','Сатурн':'♄','Лагна':'AC','Раху':'☊','Кету':'☋'};
var ASPECTS=[{n:'Соединение',a:0,o:8,g:'☌'},{n:'Секстиль',a:60,o:4,g:'⚹'},{n:'Квадрат',a:90,o:6,g:'□'},{n:'Тригон',a:120,o:6,g:'△'},{n:'Оппозиция',a:180,o:8,g:'☍'}];
var EL2EL={'Огонь':'Огонь','Земля':'Земля','Воздух':'Воздух','Вода':'Вода'};

function signIdx(L){return Math.floor(rv(L)/30);}
function dms(L){L=rv(L);var d=Math.floor(L%30);var m=Math.round((L%30-d)*60);if(m===60){m=0;d++;}return d+'°'+(m<10?'0':'')+m+'′';}

function compute(){
 var st=S();if(!st||!st.natal||!st.natal.bodies)return null;
 var a=ay();var b=st.natal.bodies;
 function trop(name){return (b[name]!=null)?rv(b[name]+a):null;}
 var ascL=trop('Лагна');if(ascL==null)ascL=0;
 var ascSign=signIdx(ascL);
 var order=['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
 var pts={};pts['Лагна']={L:ascL,si:ascSign,house:1};
 order.forEach(function(nm){var L=trop(nm);if(L==null)return;var si=signIdx(L);var house=((si-ascSign+12)%12)+1;pts[nm]={L:L,si:si,house:house};});
 /* баланс стихий/крестов (7 планет + Асц) */
 var balPts=['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Лагна'];
 var elc={'Огонь':0,'Земля':0,'Воздух':0,'Вода':0};var qc={'Кардинальный':0,'Фиксированный':0,'Мутабельный':0};
 balPts.forEach(function(nm){if(!pts[nm])return;var s=SIGNS[pts[nm].si];elc[s.el]++;qc[s.q]++;});
 var domEl=Object.keys(elc).sort(function(x,y){return elc[y]-elc[x];})[0];
 var domQ=Object.keys(qc).sort(function(x,y){return qc[y]-qc[x];})[0];
 /* аспекты (7 планет + Асц) */
 var aspPts=balPts.slice();var asp=[];
 for(var i=0;i<aspPts.length;i++)for(var j=i+1;j<aspPts.length;j++){
  var p1=aspPts[i],p2=aspPts[j];if(!pts[p1]||!pts[p2])continue;
  var d=Math.abs(pts[p1].L-pts[p2].L);if(d>180)d=360-d;
  for(var k=0;k<ASPECTS.length;k++){var df=Math.abs(d-ASPECTS[k].a);if(df<=ASPECTS[k].o){asp.push({p1:p1,p2:p2,asp:ASPECTS[k],orb:df});break;}}
 }
 asp.sort(function(x,y){return x.orb-y.orb;});
 /* управитель карты */
 var rulerName=SIGNS[ascSign].r;var ruler=pts[rulerName]||null;
 return {a:a,pts:pts,ascSign:ascSign,order:order,elc:elc,qc:qc,domEl:domEl,domQ:domQ,asp:asp,rulerName:rulerName,ruler:ruler};
}

function sysWest(){
 var R;try{R=compute();}catch(e){return null;}
 if(!R)return null;
 var pts=R.pts;
 function row(nm){var P=pts[nm];if(!P)return '';var s=SIGNS[P.si];return '<div class="trait"><span>'+(GL[nm]||'')+' '+nm+'</span><b>'+s.n+' '+dms(P.L)+' · '+P.house+' дом</b></div>';}
 var rows=row('Лагна')+['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'].map(row).join('');
 var elBal=['Огонь','Земля','Воздух','Вода'].map(function(e){return e+' '+R.elc[e];}).join(' · ');
 var qBal=['Кардинальный','Фиксированный','Мутабельный'].map(function(e){return e+' '+R.qc[e];}).join(' · ');
 var aspList=R.asp.slice(0,12).map(function(x){return '<span>'+(GL[x.p1]||x.p1)+' '+x.asp.g+' '+(GL[x.p2]||x.p2)+' <span style="opacity:.6">('+x.asp.n+', орб '+x.orb.toFixed(1)+'°)</span></span>';}).join('<br>');
 var rul=R.ruler?(SIGNS[R.ruler.si].n+', '+R.ruler.house+' дом'):'—';
 var html='<p class="sub" style="font-size:13px">Тропический зодиак (сидерические долготы + аянамша ≈'+R.a.toFixed(2)+'°). Дома — Whole Sign от Асцендента.</p>'
  +rows
  +'<div class="trait" style="margin-top:6px"><span>Баланс стихий</span><b>'+elBal+'</b></div>'
  +'<div class="trait"><span>Баланс крестов</span><b>'+qBal+'</b></div>'
  +'<div class="trait" style="border:none"><span>Управитель карты</span><b>'+R.rulerName+' — '+rul+'</b></div>'
  +(aspList?'<p class="adv" style="font-size:13px;margin:10px 0 2px"><b>Мажорные аспекты</b></p><p style="font-size:13px;line-height:1.7">'+aspList+'</p>':'')
  +'<p class="adv" style="font-size:14px;margin-top:8px">Акцент на стихии <b>'+R.domEl+'</b> и '+R.domQ.toLowerCase()+' кресте: это ведущий способ проявления. Управитель карты '+R.rulerName+' ('+rul+') показывает главную сферу судьбы.</p>';
 var ss=SIGNS[pts['Солнце']?pts['Солнце'].si:0];
 var el=EL2EL[ss.el]||'Эфир';
 var sunH=pts['Солнце']?pts['Солнце'].house:1;
 var moonS=pts['Луна']?SIGNS[pts['Луна'].si].n:'—';
 var sub='☉ '+ss.n+' · домин. '+R.domEl;
 var topAsp=R.asp.slice(0,4).map(function(x){return x.p1+' '+x.asp.g+' '+x.p2;}).join(', ');
 return {icon:'♈',title:'Западная',sub:sub,html:html,
  facet:{sys:'Западная',icon:'♈',name:'Солнце в '+ss.n+' ('+sunH+' дом)',el:el,quality:'Доминанта '+R.domEl+' · '+R.domQ.toLowerCase()+' крест',
   line:'Западная (тропическая): Солнце в '+ss.n+' ('+sunH+' дом), Луна в '+moonS+', Асцендент '+SIGNS[R.ascSign].n+'; доминанта стихии '+R.domEl+', '+R.domQ.toLowerCase()+' крест; управитель карты '+R.rulerName+' ('+rul+'); ключевые аспекты: '+(topAsp||'—')+'.'}};
}

function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='western'){AC.systems[i].f=sysWest;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);
window.AwaraWest={__ready:true,sysWest:sysWest,compute:compute,SIGNS:SIGNS};
})();
