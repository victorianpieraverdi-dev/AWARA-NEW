/* ===== AWARA · Хьюман Дизайн (Раве-Мандала) — настоящий бодиграф ===== */
/* Личность (сознательное) — на момент рождения; Дизайн (бессозн.) — когда троп.
   долгота Солнца была на 88° дуги меньше (~89 дней). 13 тел × 2 стороны → 64 ворот/6 линий
   (старт ворот 41 = 2°00' Водолея = 302°) → 36 каналов → центры → Тип, Стратегия, Авторитет, Профиль.
   Уран/Нептун — элементы Schlyter; Плутон — ряд Schlyter (~аркмин). */
/* Переопределяет систему 'hd' в window.AwaraCalc.systems. Движок не трогает. */
(function(){
'use strict';
if(window.AwaraHD&&window.AwaraHD.__ready)return;
function S(){return (typeof STATE!=='undefined')?STATE:(window.STATE||null);}
function birth(){var st=S();return (st&&st.birth)?st.birth:{date:'01.01.2000',time:'12:00',tz:0,lon:0,lat:0};}
var D2R=Math.PI/180,R2D=180/Math.PI;
function rev(x){return ((x%360)+360)%360;}
function sind(x){return Math.sin(x*D2R);}function cosd(x){return Math.cos(x*D2R);}
function atan2d(y,x){return R2D*Math.atan2(y,x);}
function eccAnom(M,e){M=rev(M);var E=M+R2D*e*sind(M)*(1+e*cosd(M));for(var i=0;i<14;i++){var dE=(E-R2D*e*sind(E)-M)/(1-e*cosd(E));E-=dE;if(Math.abs(dE)<1e-9)break;}return E;}
function helio(N,inc,w,a,e,M){var E=eccAnom(M,e);var xv=a*(cosd(E)-e),yv=a*Math.sqrt(1-e*e)*sind(E);var v=atan2d(yv,xv),r=Math.sqrt(xv*xv+yv*yv);var vw=v+w;var x=r*(cosd(N)*cosd(vw)-sind(N)*sind(vw)*cosd(inc));var y=r*(sind(N)*cosd(vw)+cosd(N)*sind(vw)*cosd(inc));return {x:x,y:y};}
var OUT={
 'Уран':function(d){return {N:74.0005+1.3978e-5*d,i:0.7733+1.9e-8*d,w:96.6612+3.0565e-5*d,a:19.18171-1.55e-8*d,e:0.047318+7.45e-9*d,M:rev(142.5905+0.011725806*d)};},
 'Нептун':function(d){return {N:131.7806+3.0173e-5*d,i:1.7700-2.55e-7*d,w:272.8461-6.027e-6*d,a:30.05826+3.313e-8*d,e:0.008606+2.15e-9*d,M:rev(260.2471+0.005995147*d)};}
};
function outerGeoLon(name,d,sun){var el=OUT[name](d);var h=helio(el.N,el.i,el.w,el.a,el.e,el.M);return rev(atan2d(h.y+sun.y,h.x+sun.x));}
function plutoGeoLon(d,sun){
 var P=rev(238.95+0.003968789*d),Sv=rev(50.03+0.033459652*d);
 var lon=238.9508+0.00400703*d-19.799*sind(P)+19.848*cosd(P)+0.897*sind(2*P)-4.956*cosd(2*P)+0.610*sind(3*P)+1.211*cosd(3*P)-0.341*sind(4*P)-0.190*cosd(4*P)+0.128*sind(5*P)-0.034*cosd(5*P)-0.038*sind(6*P)+0.031*cosd(6*P)+0.020*sind(Sv-P)-0.010*cosd(Sv-P);
 var lat=-3.9082-5.453*sind(P)-14.975*cosd(P)+3.527*sind(2*P)+6.160*cosd(2*P)-1.044*sind(3*P)-2.396*cosd(3*P)+0.341*sind(4*P)+0.587*cosd(4*P)-0.077*sind(5*P)-0.116*cosd(5*P)+0.024*sind(6*P)+0.014*cosd(6*P);
 var r=40.72+6.68*sind(P)+6.90*cosd(P)-1.18*sind(2*P)-0.03*cosd(2*P)+0.15*sind(3*P)-0.14*cosd(3*P);
 var xh=r*cosd(lon)*cosd(lat),yh=r*sind(lon)*cosd(lat);
 return rev(atan2d(yh+sun.y,xh+sun.x));
}
function bodies(d){
 var EPH=window.AwaraEph;var sun=EPH.sunData(d);var b={};
 b['Солнце']=sun.lon;b['Земля']=rev(sun.lon+180);b['Луна']=EPH.moonLon(d);
 var nn=rev(125.1228-0.0529538083*d);b['Сев.Узел']=nn;b['Юж.Узел']=rev(nn+180);
 ['Меркурий','Венера','Марс','Юпитер','Сатурн'].forEach(function(p){b[p]=EPH.planetGeoLon(p,d);});
 b['Уран']=outerGeoLon('Уран',d,sun);b['Нептун']=outerGeoLon('Нептун',d,sun);b['Плутон']=plutoGeoLon(d,sun);
 return b;
}
var WHEEL=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
var START=302.0,GW=5.625,LW=0.9375;
function gateLine(lon){var o=rev(lon-START);var idx=Math.floor(o/GW);if(idx>63)idx=63;var g=WHEEL[idx];var off=o-idx*GW;var line=Math.floor(off/LW)+1;if(line>6)line=6;if(line<1)line=1;return {gate:g,line:line};}
var GATE2CENTER={};(function(){var m={'Head':[64,61,63],'Ajna':[47,24,4,17,43,11],'Throat':[62,23,56,35,12,45,33,8,31,20,16],'G':[7,1,13,10,25,15,46,2],'Heart':[21,40,26,51],'Spleen':[48,57,44,50,32,28,18],'Sacral':[5,14,29,59,9,3,42,27,34],'SolarPlexus':[6,37,22,36,30,55,49],'Root':[53,60,52,19,39,41,58,38,54]};for(var c in m)m[c].forEach(function(g){GATE2CENTER[g]=c;});})();
var CEN9=[['Head','Голова (Корона)'],['Ajna','Аджна'],['Throat','Горло'],['G','G-центр (Самость)'],['Heart','Сердце (Эго)'],['Spleen','Селезёнка'],['Sacral','Сакрал'],['SolarPlexus','Солнечное сплетение'],['Root','Корень']];
var CHANNELS=[[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
var CHNAME={'1-8':'Вдохновение','2-14':'Биение','3-60':'Мутация','4-63':'Логика','5-15':'Ритм','6-59':'Близость','7-31':'Альфа','9-52':'Концентрация','10-20':'Пробуждение','10-34':'Следование себе','10-57':'Совершенная форма','11-56':'Любопытство','12-22':'Открытость','13-33':'Прозелит','16-48':'Талант','17-62':'Принятие','18-58':'Суждение','19-49':'Синтез','20-34':'Харизма','20-57':'Мозговая волна','21-45':'Деньги','23-43':'Структурирование','24-61':'Осознание','25-51':'Инициация','26-44':'Капитуляция','27-50':'Опека','28-38':'Упрямство','29-46':'Преуспевание','30-41':'Признание','32-54':'Преображение','34-57':'Власть','35-36':'Непостоянство','37-40':'Сообщество','39-55':'Настроение','42-53':'Зрелость','47-64':'Абстракция'};
var ICON={'Солнце':'☉','Земля':'⊕','Сев.Узел':'☊','Юж.Узел':'☋','Луна':'☽','Меркурий':'☿','Венера':'♀','Марс':'♂','Юпитер':'♃','Сатурн':'♄','Уран':'♅','Нептун':'♆','Плутон':'♇'};
var ORDER=['Солнце','Земля','Сев.Узел','Юж.Узел','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Уран','Нептун','Плутон'];
var STRAT={'Генератор':'Откликаться — ждать сакрального отклика','Манифестирующий Генератор':'Откликаться, затем информировать','Манифестор':'Информировать перед действием','Проектор':'Ждать приглашения и признания','Рефлектор':'Ждать полный лунный цикл (~28 дней)'};
var AUTH={'Эмоциональный':'Эмоциональный (Солнечное сплетение) — ясность приходит со временем, через волну; не решать на пике','Сакральный':'Сакральный — мгновенный отклик тела (звук «угу/не-а») здесь и сейчас','Селезёночный':'Селезёночный — тихая мгновенная интуиция, говорит один раз','Эго':'Эго (Сердце) — что по-настоящему хочешь и что выгодно воле','Само-проецируемый':'Само-проецируемый (G) — слышать собственный голос в разговоре с доверенными','Лунный':'Лунный — решение вызревает полный цикл ~28 дней','Ментальный':'Ментальный/средовой — проговаривать в верном окружении, без внутреннего авторитета'};
var PROF={'1/3':'Исследователь / Мученик','1/4':'Исследователь / Оппортунист','2/4':'Отшельник / Оппортунист','2/5':'Отшельник / Еретик','3/5':'Мученик / Еретик','3/6':'Мученик / Ролевая модель','4/6':'Оппортунист / Ролевая модель','4/1':'Оппортунист / Исследователь','5/1':'Еретик / Исследователь','5/2':'Еретик / Отшельник','6/2':'Ролевая модель / Отшельник','6/3':'Ролевая модель / Мученик'};
var T2EL={'Генератор':'Земля','Манифестирующий Генератор':'Огонь','Манифестор':'Огонь','Проектор':'Эфир','Рефлектор':'Вода'};
function designD(dB,sunB){var target=rev(sunB-88);var d=dB-89.28;for(var i=0;i<40;i++){var l=window.AwaraEph.sunData(d).lon;var diff=((l-target+540)%360)-180;d-=diff/0.9856;if(Math.abs(diff)<1e-8)break;}return d;}
function compute(){
 var b=birth();var dp=String(b.date||'01.01.2000').split('.').map(Number);var tp=String(b.time||'12:00').split(':').map(Number);
 var D=dp[0]||1,M=dp[1]||1,Y=dp[2]||2000,hh=tp[0]||0,mm=tp[1]||0,tz=(+b.tz||0);
 var EPH=window.AwaraEph;if(!EPH||!EPH.sunData||!EPH.jd)return null;
 var ut=hh+mm/60-tz;var dB=EPH.jd(Y,M,D,ut)-2451543.5;
 var pers=bodies(dB);var dDes=designD(dB,pers['Солнце']);var des=bodies(dDes);
 var P=[],Dz=[],active={};
 ORDER.forEach(function(nm){var g=gateLine(pers[nm]);P.push({nm:nm,gate:g.gate,line:g.line});active[g.gate]=true;});
 ORDER.forEach(function(nm){var g=gateLine(des[nm]);Dz.push({nm:nm,gate:g.gate,line:g.line});active[g.gate]=true;});
 var defC={},defCh=[],adj={};
 CHANNELS.forEach(function(ch){if(active[ch[0]]&&active[ch[1]]){defCh.push(ch);var a=GATE2CENTER[ch[0]],b2=GATE2CENTER[ch[1]];defC[a]=true;defC[b2]=true;if(a!==b2){(adj[a]=adj[a]||[]).push(b2);(adj[b2]=adj[b2]||[]).push(a);}}});
 function reaches(s,goal){if(!defC[s]||!defC[goal])return false;var seen={},st=[s];while(st.length){var c=st.pop();if(c===goal)return true;if(seen[c])continue;seen[c]=1;(adj[c]||[]).forEach(function(n){st.push(n);});}return false;}
 var anyDef=Object.keys(defC).length>0;var sacral=!!defC['Sacral'];
 var m2t=['Sacral','SolarPlexus','Heart','Root'].some(function(mo){return reaches(mo,'Throat');});
 var type;if(!anyDef)type='Рефлектор';else if(sacral)type=m2t?'Манифестирующий Генератор':'Генератор';else if(m2t)type='Манифестор';else type='Проектор';
 var auth;if(defC['SolarPlexus'])auth='Эмоциональный';else if(defC['Sacral'])auth='Сакральный';else if(defC['Spleen'])auth='Селезёночный';else if(defC['Heart'])auth='Эго';else if(defC['G'])auth='Само-проецируемый';else if(type==='Рефлектор')auth='Лунный';else auth='Ментальный';
 function comps(){var seen={},c=0;Object.keys(defC).forEach(function(x){if(seen[x])return;c++;var st=[x];while(st.length){var y=st.pop();if(seen[y])continue;seen[y]=1;(adj[y]||[]).forEach(function(n){if(!seen[n])st.push(n);});}});return c;}
 var nc=anyDef?comps():0;var defText=!anyDef?'Нет (открытая)':nc<=1?'Единая (Single)':nc===2?'Раздельная (Split)':nc===3?'Тройная раздельная':'Четверная раздельная';
 var profile=P[0].line+'/'+Dz[0].line;
 return {P:P,Dz:Dz,defC:defC,defCh:defCh,type:type,auth:auth,profile:profile,defText:defText,ncomp:nc,dB:dB,dDes:dDes,backDays:Math.round((dB-dDes)*100)/100};
}
function sysHD(){
 var R;try{R=compute();}catch(e){return null;}if(!R)return null;
 var rows='';for(var i=0;i<ORDER.length;i++){var p=R.P[i],dz=R.Dz[i];rows+='<div class="trait"><span>'+(ICON[p.nm]||'')+' '+p.nm+'</span><b style="color:#c0392b">'+dz.gate+'.'+dz.line+'</b><b style="margin-left:10px">'+p.gate+'.'+p.line+'</b></div>';}
 var cen=CEN9.map(function(c){var on=!!R.defC[c[0]];return '<div class="trait"><span>'+(on?'●':'○')+' '+c[1]+'</span><b style="color:'+(on?'#27ae60':'#9aa')+'">'+(on?'определён':'открыт')+'</b></div>';}).join('');
 var chl=R.defCh.map(function(ch){var k=ch[0]+'-'+ch[1];return k+(CHNAME[k]?' ('+CHNAME[k]+')':'');}).join(', ')||'—';
 var profName=PROF[R.profile]||'';
 var ic=R.P[0].gate+'/'+R.P[1].gate+' | '+R.Dz[0].gate+'/'+R.Dz[1].gate;
 var html='<p class="sub" style="font-size:13px">Бодиграф по Раве-Мандале. Личность (чёрное) — на момент рождения; Дизайн (<span style="color:#c0392b">красное</span>) — Солнце на 88° дуги раньше (~'+R.backDays+' дн). Старт ворот 41 = 2°00′ Водолея (302°). Внешние планеты: Уран/Нептун (Schlyter), Плутон (ряд Schlyter).</p>'
  +'<div class="trait"><span>Тип</span><b>'+R.type+'</b></div>'
  +'<div class="trait"><span>Стратегия</span><b>'+(STRAT[R.type]||'')+'</b></div>'
  +'<div class="trait"><span>Авторитет</span><b>'+R.auth+'</b></div>'
  +'<div class="trait"><span>Профиль</span><b>'+R.profile+(profName?' · '+profName:'')+'</b></div>'
  +'<div class="trait"><span>Определение</span><b>'+R.defText+'</b></div>'
  +'<p class="adv" style="font-size:13px;margin:10px 0 4px"><b>Активации</b> <span style="color:#c0392b">Дизайн</span> · Личность (Ворота.Линия)</p>'+rows
  +'<p class="adv" style="font-size:13px;margin:10px 0 4px"><b>9 центров</b></p>'+cen
  +'<div class="trait" style="border:none"><span>Каналы</span><b>'+chl+'</b></div>'
  +'<div class="trait" style="border:none"><span>Крест воплощения</span><b>'+ic+'</b></div>'
  +'<p class="adv" style="font-size:14px;margin-top:8px">Стратегия и Авторитет — твой компас принятия решений: '+(AUTH[R.auth]||'')+'.</p>';
 var sub=R.type+' · '+R.profile+(profName?' '+profName:'')+' · '+R.auth;
 var el=T2EL[R.type]||'Эфир';
 return {icon:'🧬',title:'Хьюман Дизайн',sub:sub,html:html,
  facet:{sys:'Хьюман Дизайн',icon:'🧬',name:R.type+' '+R.profile,el:el,
   quality:R.type+' · '+R.auth+' авторитет · профиль '+R.profile+(profName?' ('+profName+')':''),
   line:'Хьюман Дизайн: Тип — '+R.type+' (стратегия: '+(STRAT[R.type]||'')+'); Авторитет — '+R.auth+'; Профиль — '+R.profile+(profName?' '+profName:'')+'; Определение — '+R.defText+'; определённые центры — '+CEN9.filter(function(c){return R.defC[c[0]];}).map(function(c){return c[1];}).join(', ')+'; каналы — '+chl+'; крест воплощения (Личн.Солнце/Земля | Диз.Солнце/Земля) '+ic+'.'}};
}
function patch(){var AC=window.AwaraCalc;if(!AC||!AC.systems)return false;var ok=false;for(var i=0;i<AC.systems.length;i++){if(AC.systems[i].k==='hd'){AC.systems[i].f=sysHD;AC.systems[i].__authentic=true;ok=true;}}if(ok){try{if(AC.render)AC.render();}catch(e){}}return ok;}
if(!patch()){var tries=0;var iv=setInterval(function(){tries++;if(patch()||tries>40)clearInterval(iv);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);
window.AwaraHD={__ready:true,sysHD:sysHD,compute:compute,WHEEL:WHEEL,gateLine:gateLine};
})();
