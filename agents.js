/* AWARA · 21 Космический Агент (мандала Васту / Держава РА). Толкования RU+EN + Покровитель дня по текущей даше. Слой, движок не трогает. */
(function(){
'use strict';
if(window.AwaraAgents&&window.AwaraAgents.__ready)return;
function S(){return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE;}
function rev(x){return ((x%360)+360)%360;}
function EN(){return (window.AwaraI18n&&window.AwaraI18n.lang)==='en';}
function L(r,e){return (EN()&&e)?e:r;}
function E(a,k){return L(a[k],a['en_'+k]);}

var DIR_EN={'Восток':'East','Северо-запад':'Northwest','Юг':'South','Север':'North','Северо-восток':'Northeast','Юго-восток':'Southeast','Запад':'West','Юго-запад':'Southwest','Центр':'Center'};
var GRAHA_EN={'Солнце':'Sun','Луна':'Moon','Марс':'Mars','Меркурий':'Mercury','Юпитер':'Jupiter','Венера':'Venus','Сатурн':'Saturn','Раху':'Rahu','Кету':'Ketu'};
var GRAHATXT={'Солнце':'воля и душа','Луна':'ум и чувства','Марс':'действие и отвага','Меркурий':'разум и слово','Юпитер':'мудрость и рост','Венера':'любовь и изобилие','Сатурн':'дисциплина и время','Раху':'прорыв и желание','Кету':'освобождение и интуиция'};
var GRAHATXT_EN={'Солнце':'will and soul','Луна':'mind and feeling','Марс':'action and courage','Меркурий':'intellect and speech','Юпитер':'wisdom and growth','Венера':'love and abundance','Сатурн':'discipline and time','Раху':'breakthrough and desire','Кету':'liberation and intuition'};
function dirL(d){return L(d,DIR_EN[d]);}
function grahaL(g){return L(g,GRAHA_EN[g]);}
function grahaTxtL(g){return L(GRAHATXT[g]||'',GRAHATXT_EN[g]||'');}

var AGENTS=[
{k:'surya',name:'Сурья',en_name:'Surya',glyph:'☀',dir:'Восток',graha:'Солнце',domain:'Воля, душа, достоинство',en_domain:'Will, soul, dignity',teach:'Свет Ра в сердце — твоя суть не нуждается в одобрении, она сияет сама.',en_teach:'The light of Ra in the heart — your essence needs no approval, it shines on its own.',adv:'Сделай сегодня одно дело от лица своей подлинной воли, не спрашивая разрешения.',en_adv:'Today do one thing from your true will, without asking permission.'},
{k:'soma',name:'Сома (Чандра)',en_name:'Soma (Chandra)',glyph:'🌙',dir:'Северо-запад',graha:'Луна',domain:'Ум, чувства, забота',en_domain:'Mind, feeling, care',teach:'Луна хранит воды ума — каков сосуд, такова и тишина внутри.',en_teach:'The Moon holds the waters of the mind — as is the vessel, so is the stillness within.',adv:'Позаботься о ком-то и о себе одинаково нежно; напои ум покоем.',en_adv:'Care for someone and for yourself with equal tenderness; give the mind rest.'},
{k:'skanda',name:'Сканда (Мангала)',en_name:'Skanda (Mangala)',glyph:'🔥',dir:'Юг',graha:'Марс',domain:'Отвага, действие, защита',en_domain:'Courage, action, protection',teach:'Копьё Сканды бьёт раз — но точно. Сила не в ярости, а в направлении.',en_teach:'Skanda\u2019s spear strikes once — but true. Power is not in rage but in direction.',adv:'Выбери один страх и сделай к нему один смелый шаг.',en_adv:'Choose one fear and take one brave step toward it.'},
{k:'budha',name:'Будха',en_name:'Budha',glyph:'☿',dir:'Север',graha:'Меркурий',domain:'Разум, речь, обмен',en_domain:'Intellect, speech, exchange',teach:'Слово — мост. Будха учит говорить так, чтобы соединять, а не делить.',en_teach:'A word is a bridge. Budha teaches you to speak so as to unite, not divide.',adv:'Скажи или напиши одну ясную, честную мысль тому, кому она нужна.',en_adv:'Say or write one clear, honest thought to someone who needs it.'},
{k:'guru',name:'Брихаспати (Гуру)',en_name:'Brihaspati (Guru)',glyph:'♃',dir:'Северо-восток',graha:'Юпитер',domain:'Мудрость, вера, рост',en_domain:'Wisdom, faith, growth',teach:'Гуру расширяет: где есть смысл, там и путь.',en_teach:'Guru expands: where there is meaning, there is the path.',adv:'Удели час тому, что растит тебя — учению, наставнику или ученику.',en_adv:'Give an hour to what grows you — study, a mentor, or a student.'},
{k:'shukra',name:'Шукра',en_name:'Shukra',glyph:'♀',dir:'Юго-восток',graha:'Венера',domain:'Любовь, красота, вкус',en_domain:'Love, beauty, taste',teach:'Шукра знает: наслаждение свято, когда оно осознанно.',en_teach:'Shukra knows: pleasure is sacred when it is conscious.',adv:'Создай или раздели сегодня что-то красивое — без вины, с благодарностью.',en_adv:'Create or share something beautiful today — without guilt, with gratitude.'},
{k:'shani',name:'Шани',en_name:'Shani',glyph:'♄',dir:'Запад',graha:'Сатурн',domain:'Дисциплина, труд, время',en_domain:'Discipline, labor, time',teach:'Шани не наказывает — он выпрямляет. Терпение есть форма любви ко времени.',en_teach:'Shani does not punish — he straightens. Patience is a form of love for time.',adv:'Доведи до конца одно скучное, но важное дело. В этом твоя свобода.',en_adv:'Finish one boring but important task. In that lies your freedom.'},
{k:'rahu',name:'Раху',en_name:'Rahu',glyph:'☊',dir:'Юго-запад',graha:'Раху',domain:'Желание, прорыв, новизна',en_domain:'Desire, breakthrough, novelty',teach:'Раху голоден до небывалого — он ведёт за грань привычного.',en_teach:'Rahu hungers for the unprecedented — he leads beyond the familiar.',adv:'Сделай шаг в незнакомое; отличи истинное желание от наваждения.',en_adv:'Take a step into the unknown; tell true desire from obsession.'},
{k:'ketu',name:'Кету',en_name:'Ketu',glyph:'☋',dir:'Центр',graha:'Кету',domain:'Освобождение, интуиция, мокша',en_domain:'Liberation, intuition, moksha',teach:'Кету отрезает лишнее — то, что отпало, и было оковами.',en_teach:'Ketu cuts away the excess — what fell away was a chain.',adv:'Откажись сегодня от одной привязанности и побудь в тишине.',en_adv:'Today release one attachment and rest in silence.'},
{k:'shakti',name:'Шакти',en_name:'Shakti',glyph:'🔱',dir:'Юг',graha:'Марс',domain:'Сила, движение, воля',en_domain:'Power, movement, will',teach:'Шакти — энергия, что течёт сквозь намерение и дело.',en_teach:'Shakti is the energy that flows through intention into deed.',adv:'Преврати одно намерение в конкретное действие прямо сейчас.',en_adv:'Turn one intention into a concrete action right now.'},
{k:'saraswati',name:'Сарасвати',en_name:'Saraswati',glyph:'📜',dir:'Север',graha:'Меркурий',domain:'Знание, искусство, речь',en_domain:'Knowledge, art, speech',teach:'Сарасвати течёт рекой — знание живо, лишь когда движется.',en_teach:'Saraswati flows as a river — knowledge lives only when it moves.',adv:'Запиши, нарисуй или сыграй то, что узнал. Дай знанию форму.',en_adv:'Write, draw, or play what you have learned. Give knowledge form.'},
{k:'lakshmi',name:'Лакшми',en_name:'Lakshmi',glyph:'🌸',dir:'Юго-восток',graha:'Венера',domain:'Изобилие, удача, поток',en_domain:'Abundance, fortune, flow',teach:'Лакшми приходит к чистому и открытому — изобилие любит порядок.',en_teach:'Lakshmi comes to the pure and open — abundance loves order.',adv:'Наведи порядок в одном месте и поблагодари за то, что уже есть.',en_adv:'Tidy one place and give thanks for what you already have.'},
{k:'vishnu',name:'Вишну',en_name:'Vishnu',glyph:'🕉',dir:'Северо-восток',graha:'Юпитер',domain:'Хранение, гармония, дхарма',en_domain:'Preservation, harmony, dharma',teach:'Вишну держит мир — поддерживая, а не сжимая.',en_teach:'Vishnu holds the world — by supporting, not by squeezing.',adv:'Поддержи то, что хрупко и ценно, но не вмешивайся сверх меры.',en_adv:'Support what is fragile and precious, but do not interfere beyond measure.'},
{k:'shiva',name:'Шива',en_name:'Shiva',glyph:'🔱',dir:'Центр',graha:'Кету',domain:'Преображение, аскеза, покой',en_domain:'Transformation, asceticism, peace',teach:'Шива танцует разрушение, чтобы родилось новое; в центре танца — тишина.',en_teach:'Shiva dances destruction so the new may be born; at the center of the dance is silence.',adv:'Отпусти одну старую форму себя и посиди в безмолвии 10 минут.',en_adv:'Let go of one old form of yourself and sit in silence for 10 minutes.'},
{k:'agni',name:'Агни (Искра)',en_name:'Agni (Spark)',glyph:'⚡',dir:'Юго-восток',graha:'Солнце',domain:'Огонь, ритм, преображение',en_domain:'Fire, rhythm, transformation',teach:'Агни принимает любое подношение и обращает в свет.',en_teach:'Agni accepts any offering and turns it into light.',adv:'Зажги ритм дня: одно действие в одно и то же время — и держи искру.',en_adv:'Light the rhythm of the day: one action at the same time — and keep the spark.'},
{k:'vayu',name:'Ваю',en_name:'Vayu',glyph:'🌬',dir:'Северо-запад',graha:'Сатурн',domain:'Дыхание, свобода, движение',en_domain:'Breath, freedom, movement',teach:'Ваю незрим, но движет всем — дыхание есть нить жизни.',en_teach:'Vayu is unseen yet moves all — breath is the thread of life.',adv:'Сделай 20 осознанных дыханий и впусти свежесть в застывшее.',en_adv:'Take 20 conscious breaths and let freshness into what has frozen.'},
{k:'varuna',name:'Варуна',en_name:'Varuna',glyph:'🌊',dir:'Запад',graha:'Луна',domain:'Воды, чувства, очищение',en_domain:'Waters, feeling, purification',teach:'Варуна хранит закон вод — чувства чисты, когда текут, а не застаиваются.',en_teach:'Varuna keeps the law of the waters — feelings are pure when they flow, not stagnate.',adv:'Назови честно одно чувство и дай ему пройти, как воде.',en_adv:'Name one feeling honestly and let it pass, like water.'},
{k:'indra',name:'Индра',en_name:'Indra',glyph:'⚔',dir:'Восток',graha:'Солнце',domain:'Победа, лидерство, воля',en_domain:'Victory, leadership, will',teach:'Индра побеждает засуху Вритры — преграда падает перед собранной волей.',en_teach:'Indra defeats the drought of Vritra — the obstacle falls before gathered will.',adv:'Возьми ответственность за одно дело как лидер и доведи его до победы.',en_adv:'Take responsibility for one task as a leader and carry it to victory.'},
{k:'prithvi',name:'Притхви',en_name:'Prithvi',glyph:'🪨',dir:'Юго-запад',graha:'Сатурн',domain:'Земля, опора, тело',en_domain:'Earth, support, body',teach:'Притхви держит всё — щедро и молча. Опора рождается из устойчивости.',en_teach:'Prithvi holds everything — generously and in silence. Support is born of steadiness.',adv:'Сделай одно дело для тела и дома: еда, порядок, прогулка по земле.',en_adv:'Do one thing for body and home: food, order, a walk on the earth.'},
{k:'yama',name:'Яма',en_name:'Yama',glyph:'⚖',dir:'Юг',graha:'Сатурн',domain:'Границы, честность, долг',en_domain:'Boundaries, honesty, duty',teach:'Яма — владыка меры; честность с собой избавляет от страха конца.',en_teach:'Yama is the lord of measure; honesty with yourself frees you from the fear of the end.',adv:'Скажи честное «нет» одному лишнему и сдержи одно данное слово.',en_adv:'Say an honest \u201cno\u201d to one excess and keep one given word.'},
{k:'shanti',name:'Шанти',en_name:'Shanti',glyph:'🕊',dir:'Северо-запад',graha:'Луна',domain:'Покой, тишина, исцеление',en_domain:'Peace, silence, healing',teach:'Шанти — не отсутствие бури, а центр, что не качается в буре.',en_teach:'Shanti is not the absence of the storm, but the center that does not sway in it.',adv:'Подари себе 15 минут полной тишины без экранов и задач.',en_adv:'Give yourself 15 minutes of full silence, without screens or tasks.'}
];
function byK(k){for(var i=0;i<AGENTS.length;i++)if(AGENTS[i].k===k)return AGENTS[i];return null;}
function byGraha(g){for(var i=0;i<AGENTS.length;i++)if(AGENTS[i].graha===g)return AGENTS[i];return null;}

/* ---- текущая Вимшоттари-даша (для привязки покровителя) ---- */
var ORDER=['Кету','Венера','Солнце','Луна','Марс','Раху','Юпитер','Сатурн','Меркурий'];
var YEARS={'Кету':7,'Венера':20,'Солнце':6,'Луна':10,'Марс':7,'Раху':18,'Юпитер':16,'Сатурн':19,'Меркурий':17};
function nakIdx(l){return Math.floor(rev(l)/(360/27));}
function birthDate(){var st=S();try{var b=st.birth;var dp=String(b.date).split('.').map(Number);var tp=String(b.time||'0:0').split(':').map(Number);return new Date(dp[2],(dp[1]||1)-1,dp[0]||1,tp[0]||0,tp[1]||0);}catch(e){return new Date(1990,0,1);}}
function mahadashas(moonLon,bd){var idx=nakIdx(moonLon);var span=360/27;var pos=(rev(moonLon)%span)/span;var lord=ORDER[idx%9];var oi=ORDER.indexOf(lord);var arr=[];var start=new Date(bd);for(var k=0;k<10;k++){var ln=ORDER[(oi+k)%9];var yrs=(k===0)?YEARS[ln]*(1-pos):YEARS[ln];var end=new Date(start.getTime()+yrs*365.25*86400000);arr.push({lord:ln,start:new Date(start),end:end});start=end;}return arr;}
function antar(md){var oi=ORDER.indexOf(md.lord);var len=md.end-md.start;var arr=[];var start=new Date(md.start);for(var k=0;k<9;k++){var ln=ORDER[(oi+k)%9];var e=new Date(start.getTime()+len*(YEARS[ln]/120));arr.push({lord:ln,start:new Date(start),end:e});start=e;}return arr;}
function findNow(arr,now){for(var i=0;i<arr.length;i++){if(now>=arr[i].start&&now<arr[i].end)return arr[i];}return arr[arr.length-1];}
function curDashas(){var st=S();if(!st||!st.natal||!st.natal.bodies||st.natal.bodies['Луна']==null)return null;var bd=birthDate();var now=new Date();var mds=mahadashas(st.natal.bodies['Луна'],bd);var md=findNow(mds,now);var ad=findNow(antar(md),now);return {md:md.lord,ad:ad.lord};}

/* ---- рендер на экране Игры ---- */
function patronHtml(){
 var cd=curDashas();
 if(!cd)return '<span class="label">'+L('Покровитель дня','Patron of the day')+'</span><p class="sub">'+L('Рассчитай натальную карту на экране «Натал» — и проявится покровитель текущего периода.','Calculate your natal chart on the "Natal" screen — and the patron of the current period will appear.')+'</p>';
 var m=byGraha(cd.md),a=byGraha(cd.ad);
 var h='<span class="label">'+L('Покровитель дня · по текущей даше','Patron of the day · by current dasha')+'</span>';
 if(m){h+='<p class="adv"><b>'+m.glyph+' '+E(m,'name')+'</b> — '+E(m,'domain')+'<br><span class="sub">'+L('ведёт Маха-дашу ','leads the Maha-dasha ')+grahaL(cd.md)+' ('+grahaTxtL(cd.md)+')</span></p><p class="adv" style="font-size:15px">'+E(m,'adv')+'</p>';}
 if(a&&a!==m){h+='<div class="trait" style="border:none"><span>'+L('Со-покровитель · Антар-даша ','Co-patron · Antar-dasha ')+grahaL(cd.ad)+'</span><b>'+a.glyph+' '+E(a,'name')+'</b></div>';}
 return h;
}
function openAgent(k){
 var a=byK(k);if(!a)return;var cd=curDashas();
 var isPatron=cd&&byGraha(cd.md)===a;var isCo=cd&&byGraha(cd.ad)===a;
 var gg=document.getElementById('genGlyph'),gt=document.getElementById('genTitle'),gs=document.getElementById('genSub'),gb=document.getElementById('genBody');
 if(!gg||!gb)return;
 gg.textContent=a.glyph;gt.textContent=E(a,'name');gs.textContent=E(a,'domain')+' · '+dirL(a.dir);
 var h='<p class="adv">'+E(a,'teach')+'</p>';
 h+='<div class="card"><span class="label">'+L('Сфера и направление','Sphere and direction')+'</span><p class="adv" style="font-size:15px">'+E(a,'domain')+L(' · мандала Васту: ',' · Vastu mandala: ')+dirL(a.dir)+'</p></div>';
 h+='<div class="card"><span class="label">'+L('Граха-резонанс','Graha resonance')+'</span><p class="adv" style="font-size:15px">'+grahaL(a.graha)+' — '+grahaTxtL(a.graha)+'</p></div>';
 h+='<div class="card"><span class="label">'+L('Совет покровителя','Patron\u2019s advice')+'</span><p class="adv" style="font-size:15px">'+E(a,'adv')+'</p></div>';
 if(isPatron)h+='<div class="card" style="border-color:var(--gold)"><span class="label">'+L('✦ Сейчас твой покровитель','✦ Now your patron')+'</span><p class="adv" style="font-size:14px">'+L('Идёт Маха-даша '+grahaL(cd.md)+' — этот агент ведёт твой период. Его сфера сейчас особенно живая.','The Maha-dasha '+grahaL(cd.md)+' is running — this agent leads your period. Its sphere is especially alive now.')+'</p></div>';
 else if(isCo)h+='<div class="card" style="border-color:var(--violet-soft)"><span class="label">'+L('◆ Со-покровитель периода','◆ Co-patron of the period')+'</span><p class="adv" style="font-size:14px">'+L('Идёт Антар-даша '+grahaL(cd.ad)+' — этот агент оттеняет нынешний путь.','The Antar-dasha '+grahaL(cd.ad)+' is running — this agent shades the current path.')+'</p></div>';
 gb.innerHTML=h;
 document.getElementById('genModal').classList.add('open');
}
window.openAgent=openAgent;
function buildGrid(){
 var grid=document.getElementById('ag-grid');if(!grid)return;var cd=curDashas();var pat=cd?byGraha(cd.md):null;var co=cd?byGraha(cd.ad):null;
 grid.innerHTML='';
 AGENTS.forEach(function(a){
 var on=(a===pat);var cocls=(a===co&&a!==pat);
 var el=document.createElement('div');el.className='mcard'+(on?' on':'');if(cocls)el.style.borderColor='var(--violet-soft)';
 el.innerHTML='<span class="gl">'+a.glyph+'</span><span class="nm">'+E(a,'name')+'</span><span class="el">'+grahaL(a.graha)+'</span>';
 el.onclick=function(){openAgent(a.k);};
 grid.appendChild(el);
 });
}
function updateAgents(){var p=document.getElementById('ag-patron');if(p)p.innerHTML=patronHtml();buildGrid();}
window.updateAgents=updateAgents;
function mount(){
 var g=document.getElementById('s-game');if(!g)return;
 if(document.getElementById('ag-wrap')){updateAgents();return;}
 var wrap=document.createElement('div');wrap.id='ag-wrap';
 wrap.innerHTML='<div class="card" id="ag-patron"></div><h2>'+L('21 агент · мандала Васту','21 agents · Vastu mandala')+'</h2><p class="sub" style="font-size:14px;margin-bottom:8px">'+L('Каждый агент — сила одной сферы жизни. Нажми, чтобы услышать его наставление.','Each agent is the force of one sphere of life. Tap to hear its teaching.')+'</p><div class="deck" id="ag-grid" style="max-height:none"></div>';
 var btn=g.querySelector('.btn');
 if(btn)g.insertBefore(wrap,btn);else g.appendChild(wrap);
 updateAgents();
}

/* ---- подмешать покровителя в контекст Даймона ---- */
function ctxLine(){var cd=curDashas();if(!cd)return '';var m=byGraha(cd.md);if(!m)return '';var a=byGraha(cd.ad);var s='ПОКРОВИТЕЛЬ-АГЕНТ ТЕКУЩЕГО ПЕРИОДА: '+m.name+' ('+m.domain+') — покровитель Маха-даши '+cd.md+'. Его наставление дня: '+m.adv;if(a&&a!==m)s+=' Со-покровитель Антар-даши '+cd.ad+': '+a.name+' ('+a.domain+').';s+=' При совете можешь говорить в созвучии с этим покровителем.';return s;}
function wrapCtx(){if(typeof window.aiContext==='function'&&!window.aiContext.__agCtx){var prev=window.aiContext;var w=function(){var base='';try{base=prev.apply(this,arguments)||'';}catch(e){}try{var s=ctxLine();if(s)base+=' '+s+' ';}catch(e){}return base;};w.__agCtx=true;window.aiContext=w;}}

wrapCtx();
function boot(){wrapCtx();mount();setTimeout(mount,600);setTimeout(mount,1500);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,200);});}else{setTimeout(boot,200);}
try{document.querySelectorAll('.nav button[data-nav="game"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(updateAgents,80);});});}catch(e){}
try{window.addEventListener('awara:lang',function(){setTimeout(updateAgents,60);});}catch(e){}
window.AwaraAgents={AGENTS:AGENTS,openAgent:openAgent,updateAgents:updateAgents,curDashas:curDashas,ctxLine:ctxLine,__ready:true};
})();