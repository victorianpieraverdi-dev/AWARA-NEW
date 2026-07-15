/* AWARA · Энергии 33 матриц + советы с покровителем. Переопределяет generateAdvice/updateLight/lightVal через глобальные бинды. */
(function(){
'use strict';
if(window.AwaraEnergy&&window.AwaraEnergy.__ready)return;
function S(){return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE;}

/* Энергия каждой из 33 матриц: e — вклад в Свет, q — качество силы. */
var ENERGY={
'Ведическая':{e:4,q:'Дхармическая ось'},
'Таро':{e:3,q:'Сила архетипа'},
'Каббала':{e:4,q:'Нисхождение света'},
'Герметизм':{e:3,q:'Алхимия соответствий'},
'Славянская':{e:3,q:'Сила Рода'},
'Гностицизм':{e:3,q:'Искра пробуждения'},
'Даосизм':{e:3,q:'Поток у-вэй'},
'И-Цзин':{e:3,q:'Энергия перемен'},
'Египетская':{e:3,q:'Путь Ра'},
'Майя':{e:3,q:'Ритм Цолькин'},
'Ацтеки':{e:3,q:'Жар жертвы'},
'Кельтская':{e:2,q:'Корни дерева'},
'Скандинавская':{e:3,q:'Сила руны'},
'Шаманская':{e:3,q:'Зов духов'},
'Буддийская':{e:3,q:'Освобождение от жажды'},
'Суфийская':{e:3,q:'Пламя любви'},
'Христианская':{e:3,q:'Чаша служения'},
'Атлантическая':{e:2,q:'Кристалл памяти'},
'Шамбала':{e:3,q:'Воин света'},
'Генные Ключи':{e:4,q:'Тень → дар'},
'Астрологическая':{e:3,q:'Игра планет'},
'Космическая':{e:3,q:'Галактический луч'},
'Шинто':{e:2,q:'Чистота ками'},
'Шумерская':{e:2,q:'Закон Ме'},
'Зороастрийская':{e:3,q:'Выбор света'},
'Африканская':{e:2,q:'Ритм предков'},
'Йоруба':{e:3,q:'Аше Ориша'},
'Тантрическая':{e:4,q:'Спанда Шивы'},
'Постчеловеческая':{e:3,q:'Софийный синтез'},
'Техномагия':{e:3,q:'Код-заклинание'},
'Адвайта':{e:4,q:'Недвойственность'},
'Византийская':{e:3,q:'Умное безмолвие'},
'Орфическая':{e:3,q:'Песнь нисхождения'}
};
window.MATRIX_ENERGY=ENERGY;

function MX(){return (typeof MATRIX!=='undefined'&&MATRIX)?MATRIX:window.MATRIX;}
function resonEl(){var st=S();var FIVE=['Огонь','Земля','Воздух','Вода','Эфир'];var d=st&&st.daimon;if(d&&FIVE.indexOf(d.el)>=0)return d.el;try{return elementOf(signOf(st.natal.bodies['Лагна']));}catch(e){return 'Эфир';}}
function lensEnergy(){var st=S();var re=resonEl();var M=MX();var at=(st&&st.lensTag)||'';var total=0;var parts=[];var hasActive=false;((st&&st.mats)||[]).forEach(function(k){var m=M&&M[k];if(!m)return;var base=(ENERGY[k]&&ENERGY[k].e)||2;var res=(m[1]===re)?1:0;var act=(k===at)?2:0;if(act)hasActive=true;total+=base+res+act;parts.push({name:k,glyph:m[0],el:m[1],e:base+res+act,res:res>0,active:act>0,q:(ENERGY[k]&&ENERGY[k].q)||'',voice:m[3]});});if(at&&!hasActive&&M&&M[at]){var ma=M[at];var ba=(ENERGY[at]&&ENERGY[at].e)||2;var ra=(ma[1]===re)?1:0;total+=ba+ra+2;parts.unshift({name:at,glyph:ma[0],el:ma[1],e:ba+ra+2,res:ra>0,active:true,q:(ENERGY[at]&&ENERGY[at].q)||'',voice:ma[3]});hasActive=true;}return {total:total,parts:parts,re:re,active:at,hasActive:hasActive};}
window.lensEnergy=lensEnergy;

function agByGraha(g){var A=(window.AwaraAgents&&window.AwaraAgents.AGENTS)||[];for(var i=0;i<A.length;i++)if(A[i].graha===g)return A[i];return null;}
function patronOfDay(){try{var cd=window.AwaraAgents&&window.AwaraAgents.curDashas&&window.AwaraAgents.curDashas();if(!cd)return null;return {md:agByGraha(cd.md),ad:agByGraha(cd.ad),cd:cd};}catch(e){return null;}}

/* Глубина совета по уровню Тигля (TIGEL-MATRIX-SPEC §3, 1..6). */
var LV_DEPTH=[null,
 'Голый факт: это тебе на пользу или во вред — да или нет, без прикрас.',
 'Опыт становится текучим — назови чувство и первый смысл, что в нём прячется.',
 'Прими это как есть: здесь рождается равновесие, рай на земле рядом.',
 'Разложи опыт на грани — в нём живёт не один смысл, а целый спектр.',
 'Впиши этот день в траекторию своего пути — он не случаен, у него есть место в судьбе.',
 'Наблюдатель и опыт сливаются — это уже не совет, а прямое знание, благодать из Истока.'
];
function tigelDepthLevel(){
 try{if(window.LensLevels&&typeof LensLevels.current==='function'){var c=LensLevels.current();if(c&&typeof c.lv==='number')return c.lv;}}catch(e){}
 try{if(window.AwaraMeltCore&&typeof AwaraMeltCore.meltLevel==='function')return AwaraMeltCore.meltLevel();}catch(e){}
 return 1;
}

/* === ПЕРЕОПРЕДЕЛЕНИЕ: совет дня === */
window.generateAdvice=function(text,mats,natal){
 var a='';var st=S();
 var le=lensEnergy();
 var act=le.parts.filter(function(x){return x.active;})[0];
 if(act){a+='Активная линза — '+act.glyph+' '+act.name+' ('+act.q+'): «'+act.voice+'». ';}
 var p=patronOfDay();
 if(p&&p.md){a+='Покровитель дня — '+p.md.glyph+' '+p.md.name+' ('+p.md.domain+', Маха-даша '+p.cd.md+'): '+p.md.adv+' ';}
 var theme='твоей глубинной природе';
 if(natal){try{var mn=nakOf(natal.bodies['Луна']);theme='Луной в '+mn.n+' ('+mn.lord+')';}catch(e){}}
 a+=(act?'В фокусе линзы «'+act.name+'» твой ':'Твой ')+'день звучит в ладу с '+theme+'. ';
 if(le.parts.length){
 a+='Энергии линз (+'+le.total+' Света): ';
 a+=le.parts.map(function(x){return (x.active?'★ ':'')+x.glyph+' '+x.name+' — '+x.q+' (+'+x.e+(x.res?', созвучна стихии '+le.re:'')+(x.active?', активная':'')+'): «'+x.voice+'»';}).join('; ')+'. ';
 }else{a+='Выбери линзы в Тигле или войди в линзу в Кодексе — и совет станет глубже. ';}
 var t=(text||'').trim();if(t)a+='Ты написал: «'+(t.length>90?t.slice(0,90)+'…':t)+'» — это уже первый шаг алхимии. ';
 var depth=LV_DEPTH[tigelDepthLevel()];if(depth)a+=depth;
 return a;
};

/* === ПЕРЕОПРЕДЕЛЕНИЕ: Свет по энергиям линз === */
window.lightVal=function(){var st=S();var db=st.trust>=50?5:0;var le=lensEnergy().total;return Math.max(0,Math.min(100,(st.baseLight||48)+(st.lightBonus||0)+le+db));};
window.updateLight=function(){var st=S();var db=st.trust>=50?5:0;var le=lensEnergy();var val=Math.max(0,Math.min(100,(st.baseLight||0)+(st.lightBonus||0)+le.total+db));var ring=document.getElementById('lightRing');if(ring)ring.style.background='conic-gradient(var(--gold) 0% '+val+'%,rgba(255,255,255,.06) '+val+'% 100%)';var num=document.getElementById('lightNum');if(num)num.textContent=val;var br=document.getElementById('lightBreak');if(br){var res=le.parts.filter(function(x){return x.res;}).length;br.innerHTML='База '+st.baseLight+' · намерения +'+st.lightBonus+' · энергии линз +'+le.total+(res?' (✦'+res+' созвучных)':'')+(le.hasActive?' · активная линза ★':'')+' · Даймон +'+db+' → <b style="color:var(--spark)">'+val+'</b>';}return val;};

/* Обновить экран Результата, если он уже был отрисован. */
function refresh(){try{if(typeof updateLight==='function')updateLight();}catch(e){}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,250);});}else{setTimeout(refresh,250);}

window.AwaraEnergy={ENERGY:ENERGY,lensEnergy:lensEnergy,patronOfDay:patronOfDay,__ready:true};
})();
