/* AWARA · Глубина натальной карты — дома, дигнитет, пада, D9, аспекты, йоги, Вимшоттари-даша, панчанга. Слой, движок не трогает. */
/* + ctxSummary(): текстовая выжимка глубины карты для ИИ-контекста Даймона (текущий даша-период, йоги, акценты). */
/* + Двуязычный слой (RU/EN): подписи и названия переключаются по awara_lang; расчёты не меняются. */
(function(){
'use strict';
if(window.AwaraNatalDeep&&window.AwaraNatalDeep.__ready)return;

function S(){return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE;}
function rev(x){return ((x%360)+360)%360;}

/* ---------- язык ---------- */
function LANG(){try{return (window.AwaraI18n&&window.AwaraI18n.lang)||localStorage.getItem('awara_lang')||'ru';}catch(e){return 'ru';}}
function EN(){return LANG()==='en';}
function L(r,e){return EN()?(e||r):r;}

var SIGN=['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'];
var SIGN_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
var NAKN=['Ашвини','Бхарани','Криттика','Рохини','Мригашира','Ардра','Пунарвасу','Пушья','Ашлеша','Магха','Пурва-Пхальгуни','Уттара-Пхальгуни','Хаста','Читра','Свати','Вишакха','Анурадха','Джьештха','Мула','Пурва-Ашадха','Уттара-Ашадха','Шравана','Дхаништха','Шатабхиша','Пурва-Бхадрапада','Уттара-Бхадрапада','Ревати'];
var NAKN_EN=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
var ORDER=['Кету','Венера','Солнце','Луна','Марс','Раху','Юпитер','Сатурн','Меркурий'];
var YEARS={'Кету':7,'Венера':20,'Солнце':6,'Луна':10,'Марс':7,'Раху':18,'Юпитер':16,'Сатурн':19,'Меркурий':17};
var PSYM={'Лагна':'↑','Солнце':'☉','Луна':'☽','Меркурий':'☿','Венера':'♀','Марс':'♂','Юпитер':'♃','Сатурн':'♄','Раху':'☊','Кету':'☋'};
var DIG={'Солнце':{ex:'Овен',db:'Весы',own:['Лев']},'Луна':{ex:'Телец',db:'Скорпион',own:['Рак']},'Марс':{ex:'Козерог',db:'Рак',own:['Овен','Скорпион']},'Меркурий':{ex:'Дева',db:'Рыбы',own:['Близнецы','Дева']},'Юпитер':{ex:'Рак',db:'Козерог',own:['Стрелец','Рыбы']},'Венера':{ex:'Рыбы',db:'Дева',own:['Телец','Весы']},'Сатурн':{ex:'Весы',db:'Овен',own:['Козерог','Водолей']}};
var RULER=['Марс','Венера','Меркурий','Луна','Солнце','Меркурий','Венера','Марс','Юпитер','Сатурн','Сатурн','Юпитер'];
var ASP={'Марс':[4,7,8],'Юпитер':[5,7,9],'Сатурн':[3,7,10],'Раху':[5,7,9],'Кету':[5,7,9]};
var BHAVA=['Личность, тело, витальность','Богатство, речь, семья','Смелость, усилия, близкие','Дом, мать, сердце, корни','Творчество, дети, разум','Здоровье, долги, служение','Партнёр, союзы, договоры','Тайны, трансформация, наследие','Дхарма, учитель, удача, путь','Карьера, призвание, статус','Доходы, друзья, желания','Освобождение, затраты, чужбина'];
var BHAVA_EN=['Self, body, vitality','Wealth, speech, family','Courage, effort, siblings','Home, mother, heart, roots','Creativity, children, mind','Health, debts, service','Partner, unions, contracts','Secrets, transformation, legacy','Dharma, teacher, fortune, path','Career, calling, status','Income, friends, desires','Liberation, expenses, foreign lands'];
var PLAN_EN={'Лагна':'Ascendant','Солнце':'Sun','Луна':'Moon','Меркурий':'Mercury','Венера':'Venus','Марс':'Mars','Юпитер':'Jupiter','Сатурн':'Saturn','Раху':'Rahu','Кету':'Ketu'};
function PL(p){return L(p,PLAN_EN[p]||p);}
function SG(i){return L(SIGN[i],SIGN_EN[i]);}
function NK(i){return L(NAKN[i],NAKN_EN[i]);}
function BH(i){return L(BHAVA[i],BHAVA_EN[i]);}
function sgName(nm){var i=SIGN.indexOf(nm);return i>=0?SG(i):nm;}

function sidx(l){return Math.floor(rev(l)/30);}
function degIn(l){return rev(l)%30;}
function dm(l){var d=degIn(l);var g=Math.floor(d);var m=Math.floor((d-g)*60);return g+'°'+(m<10?'0':'')+m+"'";}
function nakIdx(l){return Math.floor(rev(l)/(360/27));}
function pada(l){var span=360/27;return Math.floor((rev(l)%span)/(span/4))+1;}
function navSign(l){return SIGN[Math.floor(rev(l)/(10/3))%12];}
function dignity(p,sg){var d=DIG[p];if(!d)return '';if(sg===d.ex)return L('Экзальтация ↑','Exaltation ↑');if(sg===d.db)return L('Падение ↓','Debilitation ↓');if(d.own.indexOf(sg)>=0)return L('Своя обитель','Own sign');return '';}

function birthDate(st){try{var b=st.birth;var dp=String(b.date).split('.').map(Number);var tp=String(b.time||'0:0').split(':').map(Number);return new Date(dp[2],(dp[1]||1)-1,dp[0]||1,tp[0]||0,tp[1]||0);}catch(e){return new Date(1990,0,1);}}
function fmtD(d){var dd=('0'+d.getDate()).slice(-2);var mm=('0'+(d.getMonth()+1)).slice(-2);return dd+'.'+mm+'.'+d.getFullYear();}
function yrsLeft(ms){var y=ms/(365.25*86400000);if(y<0)y=0;var yy=Math.floor(y);var mo=Math.round((y-yy)*12);if(mo===12){yy++;mo=0;}return yy+' '+L('г','y')+' '+mo+' '+L('мес','mo');}

function mahadashas(moonLon,bd){var idx=nakIdx(moonLon);var span=360/27;var pos=(rev(moonLon)%span)/span;var lord=ORDER[idx%9];var oi=ORDER.indexOf(lord);var arr=[];var start=new Date(bd);for(var k=0;k<10;k++){var ln=ORDER[(oi+k)%9];var yrs=(k===0)?YEARS[ln]*(1-pos):YEARS[ln];var end=new Date(start.getTime()+yrs*365.25*86400000);arr.push({lord:ln,start:new Date(start),end:end});start=end;}return arr;}
function antar(md){var oi=ORDER.indexOf(md.lord);var len=md.end-md.start;var arr=[];var start=new Date(md.start);for(var k=0;k<9;k++){var ln=ORDER[(oi+k)%9];var e=new Date(start.getTime()+len*(YEARS[ln]/120));arr.push({lord:ln,start:new Date(start),end:e});start=e;}return arr;}
function findNow(arr,now){for(var i=0;i<arr.length;i++){if(now>=arr[i].start&&now<arr[i].end)return arr[i];}return arr[arr.length-1];}

function panchanga(sunL,moonL,bd){var diff=rev(moonL-sunL);var t=Math.floor(diff/12);var paksha=t<15?L('Шукла (растущая)','Shukla (waxing)'):L('Кришна (убывающая)','Krishna (waning)');var tnum=(t%15)+1;var ys=rev(sunL+moonL);var ynum=Math.floor(ys/(360/27))+1;var YOGA=['Вишкамбха','Прити','Аюшман','Саубхагья','Шобхана','Атиганда','Сукарма','Дхрити','Шула','Ганда','Вриддхи','Дхрува','Вьягхата','Харшана','Ваджра','Сиддхи','Вьятипата','Вариян','Паригха','Шива','Сиддха','Садхья','Шубха','Шукла','Брахма','Индра','Вайдхрити'];var YOGA_EN=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];var VARA=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];var VARA_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];var gi=(ynum-1)%27;return {vara:L(VARA[bd.getDay()],VARA_EN[bd.getDay()]),paksha:paksha,tithi:tnum,yoga:L(YOGA[gi],YOGA_EN[gi])};}

function aspectsHtml(bo){
 var pts=['Лагна','Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
 var occ={};pts.forEach(function(p){var l=bo[p];if(l==null)return;var s=sidx(l);(occ[s]=occ[s]||[]).push(p);});
 var planets=['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
 var lines='';
 planets.forEach(function(p){var l=bo[p];if(l==null)return;var s=sidx(l);var offs=ASP[p]||[7];var tg=[];offs.forEach(function(N){var as=(s+(N-1))%12;(occ[as]||[]).forEach(function(q){if(q!==p)tg.push(q);});});tg=tg.filter(function(v,i,a){return a.indexOf(v)===i;});if(tg.length)lines+='<div class="nd-row"><div class="nd-top"><b>'+(PSYM[p]||'')+' '+PL(p)+'</b></div><div class="sub">'+L('смотрит на: ','aspects: ')+tg.map(function(q){return (PSYM[q]||'')+' '+PL(q);}).join(', ')+'</div></div>';});
 var conj=[];Object.keys(occ).forEach(function(s){if(occ[s].length>=2)conj.push(occ[s].map(function(q){return (PSYM[q]||'')+' '+PL(q);}).join(' + ')+' ('+SG(s)+')');});
 var h='<div class="card" style="margin-top:10px"><span class="label">'+L('🧬 Аспекты (дришти)','🧬 Aspects (drishti)')+'</span>';
 if(conj.length)h+='<p class="adv"><b>'+L('Соединения:','Conjunctions:')+'</b> '+conj.join(' · ')+'</p>';
 h+=(lines||'<p class="sub">'+L('Нет взаимных аспектов между занятыми знаками.','No mutual aspects between occupied signs.')+'</p>')+'</div>';
 return h;
}

function yogasList(bo,lagIdx){
 function s(p){return sidx(bo[p]);}
 function hh(p){return ((s(p)-lagIdx+12)%12)+1;}
 function ruler(h){return RULER[(lagIdx+h-1)%12];}
 var Y=[];
 var gd=((s('Юпитер')-s('Луна')+12)%12)+1;if([1,4,7,10].indexOf(gd)>=0)Y.push([L('Гаджакесари','Gaja-Kesari'),L('Юпитер в кендре от Луны — мудрость, уважение, благополучие.','Jupiter in a kendra from the Moon — wisdom, respect, well-being.')]);
 if(s('Солнце')===s('Меркурий'))Y.push([L('Будха-Адитья','Budha-Aditya'),L('Солнце и Меркурий вместе — острый ум, интеллект, речь.','Sun and Mercury together — a sharp mind, intellect, speech.')]);
 if(s('Луна')===s('Марс'))Y.push([L('Чандра-Мангала','Chandra-Mangala'),L('Луна и Марс вместе — энергия, предприимчивость, добыча средств.','Moon and Mars together — energy, enterprise, earning power.')]);
 var MP={'Марс':['Ручака','Ruchaka'],'Меркурий':['Бхадра','Bhadra'],'Юпитер':['Хамса','Hamsa'],'Венера':['Малавья','Malavya'],'Сатурн':['Шаша','Shasha']};
 Object.keys(MP).forEach(function(p){var sg=SIGN[s(p)];var d=DIG[p];if(!d)return;var strong=(sg===d.ex)||(d.own.indexOf(sg)>=0);if(strong&&[1,4,7,10].indexOf(hh(p))>=0)Y.push([L(MP[p][0],MP[p][1])+L(' (Маха-пуруша)',' (Maha-purusha)'),L(p+' силён в кендре — выдающееся качество личности.',PL(p)+' strong in a kendra — an outstanding quality of personality.')]);});
 (function(){var r=rev(bo['Раху']);var pl=['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн'];var ds=pl.map(function(p){return rev(bo[p]-r);});var allA=ds.every(function(d){return d>0&&d<180;});var allB=ds.every(function(d){return d>180&&d<360;});if(allA||allB)Y.push([L('Кала-Сарпа','Kala-Sarpa'),L('Все планеты по одну сторону оси Раху-Кету — интенсивная судьба, рывками.','All planets on one side of the Rahu-Ketu axis — an intense destiny, in surges.')]);})();
 (function(){var m=s('Луна');var adj=[m,(m+1)%12,(m+11)%12];var near=['Меркурий','Венера','Марс','Юпитер','Сатурн'].some(function(p){return adj.indexOf(s(p))>=0;});if(!near)Y.push([L('Кемадрума','Kemadruma'),L('Луна без поддержки соседних планет — урок опоры на себя.','Moon without support from neighbouring planets — a lesson in self-reliance.')]);})();
 (function(){var kn=[1,4,7,10],tr=[5,9];var seen={};kn.forEach(function(k){tr.forEach(function(t){var lk=ruler(k),lt=ruler(t);if(lk!==lt&&s(lk)===s(lt)){var key=[lk,lt].sort().join();if(!seen[key]){seen[key]=1;Y.push([L('Раджа-йога','Raja Yoga'),L('Соединение управителей кендры и тригоны ('+lk+'+'+lt+') — рост статуса и власти.','Lords of a kendra and a trikona joined ('+PL(lk)+'+'+PL(lt)+') — rise in status and power.')]);}}});});})();
 (function(){var l2=ruler(2),l11=ruler(11);if(l2!==l11&&s(l2)===s(l11))Y.push([L('Дхана-йога','Dhana Yoga'),L('Управители 2 и 11 домов вместе ('+l2+'+'+l11+') — потенциал накопления богатства.','Lords of the 2nd and 11th houses together ('+PL(l2)+'+'+PL(l11)+') — potential for accumulating wealth.')]);})();
 return Y;
}
function yogasHtml(bo,lagIdx){
 var Y=yogasList(bo,lagIdx);
 var h='<div class="card" style="margin-top:10px"><span class="label">'+L('⛜ Йоги (сочетания)','⛜ Yogas (combinations)')+'</span>';
 if(Y.length){Y.forEach(function(y){h+='<p class="adv"><b>'+y[0]+'</b><br><span class="sub">'+y[1]+'</span></p>';});}else{h+='<p class="sub">'+L('Особых классических йог не выявлено.','No notable classical yogas detected.')+'</p>';}
 h+='</div>';return h;
}

function kalaCard(bd){var yr=bd.getFullYear();var ANIM=['\u041c\u044b\u0448\u044c','\u0411\u044b\u043a','\u0422\u0438\u0433\u0440','\u0417\u0430\u044f\u0446','\u0414\u0440\u0430\u043a\u043e\u043d','\u0417\u043c\u0435\u044f','\u041b\u043e\u0448\u0430\u0434\u044c','\u041e\u0432\u0446\u0430','\u041e\u0431\u0435\u0437\u044c\u044f\u043d\u0430','\u041f\u0442\u0438\u0446\u0430','\u0421\u043e\u0431\u0430\u043a\u0430','\u0421\u0432\u0438\u043d\u044c\u044f'];var ANIM_EN=['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Sheep','Monkey','Bird','Dog','Pig'];var ELEM=['\u0414\u0435\u0440\u0435\u0432\u043e','\u041e\u0433\u043e\u043d\u044c','\u0417\u0435\u043c\u043b\u044f','\u0416\u0435\u043b\u0435\u0437\u043e','\u0412\u043e\u0434\u0430'];var ELEM_EN=['Wood','Fire','Earth','Iron','Water'];var ai=(((yr-4)%12)+12)%12;var ei=Math.floor(((((yr-4)%10)+10)%10)/2);var cyc=L(ELEM[ei]+'-'+ANIM[ai],ELEM_EN[ei]+'-'+ANIM_EN[ai]);var h='<div class="card" style="margin-top:10px"><span class="label">'+L('\u2726 \u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0428\u0430\u043c\u0431\u0430\u043b\u044b \u00b7 \u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430','\u2726 Shambhala Calendar \u00b7 Kalachakra')+'</span>';h+='<div class="trait"><span>'+L('60-\u043b\u0435\u0442\u043d\u0438\u0439 \u0446\u0438\u043a\u043b','60-year cycle')+'</span><b>'+cyc+'</b></div>';h+='<div class="trait"><span>'+L('\u0422\u0440\u0438 \u041a\u043e\u043b\u0435\u0441\u0430','Three Wheels')+'</span><b>'+L('\u0432\u043d\u0435\u0448\u043d\u0435\u0435 \u00b7 \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0435\u0435 \u00b7 \u0438\u043d\u043e\u0435','outer \u00b7 inner \u00b7 other')+'</b></div>';h+='<div class="trait"><span>'+L('\u0411\u043e\u0436\u0435\u0441\u0442\u0432\u043e','Deity')+'</span><b>'+L('\u041a\u0430\u043b\u0430\u0447\u0430\u043a\u0440\u0430 \u0438 \u0412\u0438\u0448\u0432\u0430\u043c\u0430\u0442\u0430','Kalachakra & Vishvamata')+'</b></div>';h+='<div class="trait" style="border:none"><span>'+L('\u0414\u044b\u0445\u0430\u043d\u0438\u0435-\u043a\u043e\u0441\u043c\u043e\u0441','Breath-cosmos')+'</span><b>'+L('21600 \u0432\u0434\u043e\u0445\u043e\u0432/\u0441\u0443\u0442\u043a\u0438','21600 breaths/day')+'</b></div>';h+='<p class="sub">'+L('\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a: \u0411\u0430\u043a\u0430\u043d\u043e\u0432 \u2014 \u00ab\u0412\u0435\u0447\u043d\u043e\u0441\u0442\u044c \u00b7 \u0412\u0440\u0435\u043c\u044f \u0411\u043e\u0433\u043e\u0432\u00bb','Source: Bakanov \u2014 \u00abEternity \u00b7 Time of the Gods\u00bb')+'</p>';h+='</div>';return h;}
function build(){
 var st=S();if(!st||!st.natal)return null;
 var bo=st.natal.bodies;var lagIdx=sidx(bo['Лагна']);
 var order=['Лагна','Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
 var rows='';
 order.forEach(function(p){var l=bo[p];if(l==null)return;var si=sidx(l);var sgRu=SIGN[si];var house=((si-lagIdx+12)%12)+1;var dig=dignity(p,sgRu);var retro=(st.natal.retro&&st.natal.retro[p])?' <span class="nd-r">R</span>':'';
  rows+='<div class="nd-row"><div class="nd-top"><b>'+(PSYM[p]||'')+' '+PL(p)+'</b>'+retro+' <span class="nd-tag">'+L('Дом','House')+' '+house+'</span>'+(dig?' <span class="nd-tag dig">'+dig+'</span>':'')+'</div><div class="sub">'+SG(si)+' '+dm(l)+' · '+NK(nakIdx(l))+' ('+L('пада','pada')+' '+pada(l)+') · D9 '+sgName(navSign(l))+'</div></div>';
 });
 var byHouse={};order.slice(1).forEach(function(p){var l=bo[p];if(l==null)return;var hx=((sidx(l)-lagIdx+12)%12)+1;(byHouse[hx]=byHouse[hx]||[]).push(p);});
 var bd=birthDate(st);var now=new Date();
 var mds=mahadashas(bo['Луна'],bd);var curMD=findNow(mds,now);var ads=antar(curMD);var curAD=findNow(ads,now);
 var mdProg=Math.max(0,Math.min(100,Math.round((now-curMD.start)/(curMD.end-curMD.start)*100)));
 var pan=panchanga(bo['Солнце'],bo['Луна'],bd);
 var exalted=[],debil=[];order.slice(1,8).forEach(function(p){var sg=SIGN[sidx(bo[p])];var d=DIG[p];if(!d)return;if(sg===d.ex)exalted.push(p);if(sg===d.db)debil.push(p);});

 var h='';
 h+='<div class="card"><span class="label">'+L('🔭 Положения · дома · дигнитет','🔭 Positions · houses · dignity')+'</span>'+rows+'</div>';
 h+=aspectsHtml(bo);
 h+=yogasHtml(bo,lagIdx);
 h+='<div class="card" style="margin-top:10px"><span class="label">'+L('🌀 Вимшоттари Даша · сейчас','🌀 Vimshottari Dasha · now')+'</span>';
 h+='<p class="adv"><b>'+L('Маха-даша','Maha-dasha')+' '+PL(curMD.lord)+'</b> · '+fmtD(curMD.start)+' → '+fmtD(curMD.end)+'<br><span class="sub">'+L('пройдено','elapsed')+' '+mdProg+'% · '+L('осталось','remaining')+' '+yrsLeft(curMD.end-now)+'</span></p>';
 h+='<p class="adv"><b>'+L('Антар-даша','Antar-dasha')+' '+PL(curAD.lord)+'</b> · '+fmtD(curAD.start)+' → '+fmtD(curAD.end)+'<br><span class="sub">'+L('осталось','remaining')+' '+yrsLeft(curAD.end-now)+'</span></p>';
 var ni=mds.indexOf(curMD);var nxt=mds.slice(ni+1,ni+4).map(function(m){return PL(m.lord)+' ('+m.start.getFullYear()+')';}).join(' → ');
 if(nxt)h+='<p class="sub">'+L('Дальше: ','Next: ')+nxt+'</p>';
 h+='</div>';
 h+='<div class="card" style="margin-top:10px"><span class="label">'+L('📜 Панчанга рождения','📜 Panchanga of birth')+'</span><div class="trait"><span>'+L('Вара (день)','Vara (day)')+'</span><b>'+pan.vara+'</b></div><div class="trait"><span>'+L('Титхи','Tithi')+'</span><b>'+pan.tithi+' · '+pan.paksha+'</b></div><div class="trait" style="border:none"><span>'+L('Нитья-йога','Nitya-yoga')+'</span><b>'+pan.yoga+'</b></div></div>';
 h+=kalaCard(bd);var acc='';if(exalted.length)acc+=L('Экзальтация: ','Exaltation: ')+exalted.map(PL).join(', ')+'. ';if(debil.length)acc+=L('Падение: ','Debilitation: ')+debil.map(PL).join(', ')+'. ';
 var hk=Object.keys(byHouse).sort(function(a,b){return byHouse[b].length-byHouse[a].length;})[0];
 if(hk&&byHouse[hk].length>=2)acc+=L('Акцент — Дом ','Accent — House ')+hk+' ('+byHouse[hk].map(PL).join(', ')+'): '+BH(hk-1)+'.';
 if(acc)h+='<div class="card" style="margin-top:10px"><span class="label">'+L('✦ Акценты карты','✦ Chart accents')+'</span><p class="adv">'+acc+'</p></div>';
 return h;
}

/* ---------- ctxSummary: текстовая выжимка для ИИ-контекста Даймона (RU — внутренний промпт) ---------- */
function ctxSummary(){
 var st=S();if(!st||!st.natal||!st.natal.bodies)return '';
 var bo=st.natal.bodies;if(bo['Луна']==null||bo['Лагна']==null)return '';
 var lagIdx=sidx(bo['Лагна']);
 var order=['Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн','Раху','Кету'];
 var bd=birthDate(st);var now=new Date();
 var mds=mahadashas(bo['Луна'],bd);var curMD=findNow(mds,now);var ads=antar(curMD);var curAD=findNow(ads,now);
 var mdProg=Math.max(0,Math.min(100,Math.round((now-curMD.start)/(curMD.end-curMD.start)*100)));
 var ni=mds.indexOf(curMD);var nxt=mds.slice(ni+1,ni+3).map(function(m){return m.lord+' с '+m.start.getFullYear();}).join(', ');
 var pan=panchanga(bo['Солнце'],bo['Луна'],bd);
 var ex=[],deb=[];order.slice(0,7).forEach(function(p){if(bo[p]==null)return;var sg=SIGN[sidx(bo[p])];var d=DIG[p];if(!d)return;if(sg===d.ex)ex.push(p);if(sg===d.db)deb.push(p);});
 var byHouse={};order.forEach(function(p){if(bo[p]==null)return;var hx=((sidx(bo[p])-lagIdx+12)%12)+1;(byHouse[hx]=byHouse[hx]||[]).push(p);});
 var hk=Object.keys(byHouse).sort(function(a,b){return byHouse[b].length-byHouse[a].length;})[0];
 var accent=(hk&&byHouse[hk].length>=2)?('Дом '+hk+' ('+byHouse[hk].join(', ')+') — '+BHAVA[hk-1]):'';
 var yg=yogasList(bo,lagIdx).map(function(y){return y[0];});
 var moonNak=NAKN[nakIdx(bo['Луна'])]+' (пада '+pada(bo['Луна'])+')';
 var lagSign=SIGN[lagIdx];
 var dn=(st.daimon&&st.daimon.name)?st.daimon.name:'';
 var parts=[];
 parts.push('ВЕДИЧЕСКАЯ ГЛУБИНА КАРТЫ (реальные расчёты — опирайся на это при советах и тоне Даймона'+(dn?' '+dn:'')+').');
 parts.push('Лагна '+lagSign+', Луна в накшатре '+moonNak+'.');
 parts.push('ТЕКУЩИЙ ПЕРИОД (на '+fmtD(now)+'): Маха-даша '+curMD.lord+' ('+fmtD(curMD.start)+'→'+fmtD(curMD.end)+', пройдено '+mdProg+'%, осталось '+yrsLeft(curMD.end-now)+'); Антар-даша '+curAD.lord+' (до '+fmtD(curAD.end)+', осталось '+yrsLeft(curAD.end-now)+').');
 if(nxt)parts.push('Следующие маха-даши: '+nxt+'.');
 parts.push('Сильные планеты (экзальтация): '+(ex.length?ex.join(', '):'нет')+'; ослабленные (падение): '+(deb.length?deb.join(', '):'нет')+'.');
 parts.push('Активные йоги: '+(yg.length?yg.join(', '):'особых классических нет')+'.');
 if(accent)parts.push('Акцент карты: '+accent+'.');
 parts.push('Панчанга рождения: '+pan.vara+', титхи '+pan.tithi+' '+pan.paksha+', нитья-йога '+pan.yoga+'.');
 parts.push('Как использовать: связывай совет дня с лордом текущей маха/антар-даши и его качеством, учитывай сильные/слабые планеты и акцент дома; говори в духе ядра-Даймона.');
 return parts.join(' ');
}
function wrapCtx(){if(typeof window.aiContext==='function'&&!window.aiContext.__ndCtx){var prev=window.aiContext;var w=function(){var base='';try{base=prev.apply(this,arguments)||'';}catch(e){}try{var s=ctxSummary();if(s)base+=' '+s+' ';}catch(e){}return base;};w.__ndCtx=true;window.aiContext=w;}}

function styleOnce(){if(document.getElementById('nd-style'))return;var st=document.createElement('style');st.id='nd-style';st.textContent=['.nd-row{padding:8px 0;border-bottom:1px solid var(--line)}','.nd-row:last-child{border-bottom:none}','.nd-top{display:flex;flex-wrap:wrap;gap:6px;align-items:center}','.nd-tag{font-size:11px;padding:1px 7px;border:1px solid var(--line);border-radius:20px;color:var(--muted)}','.nd-tag.dig{color:var(--spark);border-color:var(--spark)}','.nd-r{color:#e0508a;font-size:11px;font-weight:700}'].join('');document.head.appendChild(st);}

function enhance(){var screen=document.getElementById('s-natal');if(!screen)return;var sig=document.getElementById('natalSig');if(!sig)return;styleOnce();var box=document.getElementById('nd-deep');if(!box){box=document.createElement('div');box.id='nd-deep';box.style.marginTop='12px';sig.insertAdjacentElement('afterend',box);}var html=build();box.innerHTML=html||'';}

if(typeof window.renderNatal==='function'&&!window.renderNatal.__ndWrapped){var orig=window.renderNatal;window.renderNatal=function(){var r=orig.apply(this,arguments);try{enhance();}catch(e){}return r;};window.renderNatal.__ndWrapped=true;}
wrapCtx();
try{window.addEventListener('awara:lang',function(){try{enhance();}catch(e){}});}catch(e){}

function boot(){wrapCtx();enhance();setTimeout(enhance,500);setTimeout(enhance,1400);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,180);});}else{setTimeout(boot,180);}
window.AwaraNatalDeep={enhance:enhance,build:build,ctxSummary:ctxSummary,__ready:true};
})();
