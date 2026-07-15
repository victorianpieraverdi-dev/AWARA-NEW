/* AWARA i18n (v1): RU<->EN switcher for the Tigel prototype. Self-contained. Translates static UI via a reversible RU<->EN dictionary, auto-translates dynamically added nodes via MutationObserver, and makes the live Daimon (DeepSeek) answer in English by appending a language directive to aiSystem(). */
(function(){
'use strict';
if(window.AwaraI18n)return;
var LS='awara_lang';
var lang=(function(){try{return localStorage.getItem(LS)||'ru';}catch(e){return 'ru';}})();

var DICT={
'Исток · начало пути':'Source · beginning of the path',
'Тигель':'Tigel',
'Личная алхимия дня. Твой путь рождается из Истока и течёт через 365 дней.':'Personal daily alchemy. Your path is born from the Source and flows through 365 days.',
'Твой миф':'Your myth',
'Хроника пути':'Path chronicle',
'Открыть Тигель':'Open the Crucible',
'Войти в Игру Восхождения':'Enter the Game of Ascension',
'Основа · расчёт из даты':'Foundation · calculated from the date',
'Натальная карта':'Natal chart',
'Введи данные рождения — карта пересчитается сразу. Сидерический (Лахири), приближённый.':'Enter your birth data — the chart recalculates instantly. Sidereal (Lahiri), approximate.',
'Дата (ДД.ММ.ГГГГ)':'Date (DD.MM.YYYY)',
'Время':'Time',
'Город':'City',
'Широта':'Latitude',
'Долгота':'Longitude',
'Часовой пояс (UTC+)':'Time zone (UTC+)',
'Рассчитать карту':'Calculate chart',
'Карта (сидерическая)':'Chart (sidereal)',
'Подпись карты':'Chart signature',
'День · Тигель':'Day · Crucible',
'Положи прожитый день внутрь — и он переплавит его в смысл.':'Put the day you lived inside — and it will smelt it into meaning.',
'Как прошёл день':'How was your day',
'Сегодня я…':'Today I…',
'Колода линз':'Deck of lenses',
'поиск среди 33 матриц…':'search among the 33 matrices…',
'Плавить':'Smelt',
'Отчёт дня · 🌕 Свет':'Day report · 🌕 Light',
'Результат':'Result',
'Уровень Света':'Light level',
'Совет дня · из твоих линз':'Advice of the day · from your lenses',
'Дроп Притхви':'Prithvi drop',
'Прожито — в летопись':'Lived — into the chronicle',
'Твой Даймон · из наталки':'Your Daimon · from the natal chart',
'Арка речи':'Arc of speech',
'Шёпот':'Whisper',
'Голос':'Voice',
'Молчание':'Silence',
'Натальная основа':'Natal foundation',
'Имена по матрицам':'Names by matrix',
'Планировщик · намерения':'Planner · intentions',
'Намерения':'Intentions',
'Заяви намерение — выполни — получи дар агента-покровителя.':'Declare an intention — fulfill it — receive a gift from your patron agent.',
'На сегодня':'For today',
'Новое намерение…':'New intention…',
'Бонусы агентов':'Agent bonuses',
'🔥 Шакти · действие':'🔥 Shakti · action',
'+3 Света':'+3 Light',
'📜 Сарасвати · знание':'📜 Saraswati · knowledge',
'+2 Света':'+2 Light',
'🌸 Лакшми · изобилие':'🌸 Lakshmi · abundance',
'🕊 Шанти · покой':'🕊 Shanti · peace',
'⏳ Искра · ритм':'⏳ Spark · rhythm',
'+1 серия':'+1 streak',
'365 дней · личная книга':'365 days · personal book',
'Летопись':'Chronicle',
'Каждый день — глава. Ярче клетка — больше Света.':'Each day is a chapter. The brighter the cell, the more Light.',
'дней':'days',
'серия':'streak',
'генераций':'generations',
'Год':'Year',
'пусто':'empty',
'Переход · AWARA':'Transition · AWARA',
'Игра Восхождения':'Game of Ascension',
'Тигель — твой ежедневный ритуал. Большая игра — целый мир: 7 уровней, 21 агент, путь Души.':'The Crucible is your daily ritual. The big game is a whole world: 7 levels, 21 agents, the path of the Soul.',
'Карта мира':'World map',
'0 · Вход / Искра':'0 · Entrance / Spark',
'1 · Тороид':'1 · Toroid',
'2 · Яйцо / Лобби':'2 · Egg / Lobby',
'3 · Информер · Запад':'3 · Informer · West',
'4 · Даймон · Юг':'4 · Daimon · South',
'5 · Душа · Восток':'5 · Soul · East',
'6 · Настолка · Север':'6 · Board game · North',
'21 агент · мандала Васту':'21 agents · Vastu mandala',
'Свет Ра, Вишну, Шакти, Сарасвати, Лакшми, Притхви, Ардвен… — каждый дарует бонусы за дела.':'Svet Ra, Vishnu, Shakti, Saraswati, Lakshmi, Prithvi, Ardven… — each grants bonuses for your deeds.',
'Войти в мир AWARA':'Enter the world of AWARA',
'В рабочей версии откроется приложение AWARA':'In the production version the AWARA app will open',
'Голос линзы':'Lens voice',
'Выбрать как линзу':'Choose as lens',
'Закрыть':'Close',
'⚙ Настройки ИИ':'⚙ AI settings',
'OpenRouter — дёшево, много моделей':'OpenRouter — cheap, many models',
'Модель (необязательно)':'Model (optional)',
'Сохранить':'Save',
'Спроси Даймона…':'Ask the Daimon…',
'Отправить':'Send',
'🤖 Даймон Ардвен':'🤖 Daimon Ardven',
'Исток':'Source',
'Натал':'Natal',
'План':'Plan',
'Ардвен':'Ardven',
'Игра':'Game',
'Миф дня':'Myth of the day',
'7 ступеней':'7 steps',
'Артефакт':'Artifact',
'Трек':'Track',
'Аюрведа':'Ayurveda',
'Обложка':'Cover art',
'Совет':'Advice',
'Класс':'Class',
'Свойства':'Properties',
'Параметры':'Parameters',
'Название':'Title',
'Композиция':'Composition',
'Палитра':'Palette',
'Символы':'Symbols',
'Голоса линз':'Voices of the lenses',
'Совет дня':'Advice of the day',
'🤖 Оживить ИИ':'🤖 Bring AI to life',
'📋 Копировать промт':'📋 Copy prompt',
'🤖 Даймон думает…':'🤖 The Daimon is thinking…',
'Ошибка':'Error',
'Кодекс · 33 вселенные':'Codex · 33 universes',
'→ Войти в эту вселенную':'→ Enter this universe',
'☀ Солнце-Источник':'☀ Sun-Source',
'⚔ Конфликт-ось':'⚔ Conflict axis',
'🎨 Визуальный код':'🎨 Visual code',
'📖 Космогония · мировоззрение':'📖 Cosmogony · worldview',
'🌿 Мифология вселенной':'🌿 Mythology of the universe',
'✓ Линза активна':'✓ Lens active',
'вселенная':'universe'
};
var REV={};for(var k in DICT){if(DICT.hasOwnProperty(k))REV[DICT[k]]=k;}
function curMap(){return lang==='en'?DICT:REV;}

function translate(root){
 if(!root)return;var map=curMap();
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
 var nodes=[],n;while(n=w.nextNode())nodes.push(n);
 for(var i=0;i<nodes.length;i++){var node=nodes[i];var p=node.parentNode;if(!p)continue;var tag=p.nodeName;if(tag==='SCRIPT'||tag==='STYLE')continue;if(p.id==='awlang')continue;var raw=node.nodeValue;var key=raw.trim();if(!key)continue;var t=map[key];if(t!==undefined&&t!==key){node.nodeValue=raw.replace(key,t);}}
 var ph=document.querySelectorAll('[placeholder]');
 for(var j=0;j<ph.length;j++){var el=ph[j];var pk=(el.getAttribute('placeholder')||'').trim();var pt=map[pk];if(pt!==undefined&&pt!==pk)el.setAttribute('placeholder',pt);}
}

var btn;
function updateBtn(){if(btn)btn.textContent='🌐 '+(lang==='en'?'EN':'RU');}
function setLang(l){lang=l;try{localStorage.setItem(LS,l);}catch(e){}try{document.documentElement.lang=l;}catch(e){}try{document.title=(l==='en'?'Tigel':'Тигель');}catch(e){}translate(document.body);updateBtn();try{window.dispatchEvent(new CustomEvent('awara:lang',{detail:l}));}catch(e){}}

function wrapAi(){if(typeof window.aiSystem==='function'&&!window.aiSystem.__i18n){var _s=window.aiSystem;var f=function(r){var base=_s(r);if(lang==='en')base+='\n\n=== LANGUAGE ===\nRespond ENTIRELY in English. Keep AWARA canon terms (Daimon, nakshatra, guna, Light, lens, AWARA) but write everything else in natural, warm, poetic English.';return base;};f.__i18n=true;window.aiSystem=f;}}
function wrapGo(){if(typeof window.go==='function'&&!window.go.__i18n){var _g=window.go;var f=function(name){_g(name);try{setTimeout(function(){translate(document.body);},0);}catch(e){}};f.__i18n=true;window.go=f;}}

function observe(){try{var pend=false;var mo=new MutationObserver(function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;translate(document.body);});});mo.observe(document.body,{childList:true,subtree:true});}catch(e){}}

function boot(){
 var ph=document.querySelector('.phone')||document.body;
 btn=document.createElement('button');btn.id='awlang';btn.type='button';
 btn.style.cssText='position:absolute;top:13px;left:13px;z-index:50;background:rgba(5,5,13,.72);border:1px solid rgba(201,168,76,.34);color:#c9a84c;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.12em;padding:5px 9px;border-radius:10px;cursor:pointer;backdrop-filter:blur(6px)';
 btn.onclick=function(){setLang(lang==='en'?'ru':'en');};
 ph.appendChild(btn);updateBtn();
 try{document.documentElement.lang=lang;}catch(e){}
 if(lang==='en'){try{document.title='Tigel';}catch(e){}translate(document.body);}
 wrapAi();wrapGo();observe();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,60);});}else{setTimeout(boot,60);}
function extend(obj){if(!obj)return;for(var kk in obj){if(obj.hasOwnProperty(kk)){DICT[kk]=obj[kk];REV[obj[kk]]=kk;}}try{translate(document.body);}catch(e){}}
window.AwaraI18n={get lang(){return lang;},setLang:setLang,t:function(s){var m=curMap();return m[s]||s;},translate:function(){translate(document.body);},extend:extend,DICT:DICT,__v:1};
})();
