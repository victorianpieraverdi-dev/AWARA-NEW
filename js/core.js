// ══ AWARA SYSTEMS v257 ══
window.AWARA_SYS = (function(){
'use strict';

var ORBIT_COLORS=['#ff2244','#ff6622','#ffcc00','#44cc44','#22aaff','#4455ff','#aa44ff','#ccddff','#ffd700'];

// ── МАТРИЦА ВОСПРИЯТИЯ ──
var PM_SYSTEMS=[
{id:'vedic',name:'ВЕДИЧЕСКАЯ',icon:'🪷',color:'#ff8844',symbols:['ॐ','🪷','🔱','🌺','☸'],mantra:'OM TAT SAT',concepts:['Мокша','Карма','Дхарма'],orbitColors:['#ff4400','#ff6600','#ffaa00','#ffdd00','#ff8844','#cc4400','#884400','#ff6644','#ffcc88'],bg:'radial-gradient(ellipse at center,#1a0a00 0%,#050200 100%)'},
{id:'dao',name:'ДАОСИЗМ',icon:'☯',color:'#44aacc',symbols:['☯','☵','☳','☰','道'],mantra:'道可道，非常道',concepts:['У-Вэй','Тао','Ци'],orbitColors:['#44aacc','#2288aa','#116688','#44ccaa','#22aa88','#006644','#44cccc','#88ddee','#aaeeff'],bg:'radial-gradient(ellipse at center,#00080f 0%,#000408 100%)'},
{id:'maya',name:'МАЙЯНСКАЯ',icon:'🌀',color:'#cc44ff',symbols:['🌀','⊕','🐍','🦅','☀'],mantra:'IN LAK ECH',concepts:['Цолькин','Кин','Ахав'],orbitColors:['#cc44ff','#aa22dd','#8800cc','#ff44cc','#dd22aa','#cc44aa','#aa44cc','#dd88ff','#eeccff'],bg:'radial-gradient(ellipse at center,#0a0015 0%,#020008 100%)'},
{id:'gene',name:'ГЕННЫЕ КЛЮЧИ',icon:'🧬',color:'#00cc88',symbols:['🧬','⬡','◈','✦','64'],mantra:'SHADOW GIFT SIDDHI',concepts:['64 Ключа','Тень','Сиддхи'],orbitColors:['#00cc44','#00aa66','#008844','#00cc88','#44ddaa','#00ff88','#22cc66','#00ffaa','#aaffcc'],bg:'radial-gradient(ellipse at center,#001408 0%,#000802 100%)'},
{id:'slavic',name:'КРУГОЛЕТ',icon:'⚡',color:'#ff4444',symbols:['⚡','☀','🌲','🐺','⚒'],mantra:'СВАРОГ · РОД',concepts:['Явь','Навь','Правь'],orbitColors:['#ff2200','#cc1100','#ff4422','#ff6644','#ff8844','#dd4422','#ff2244','#ff6688','#ffaacc'],bg:'radial-gradient(ellipse at center,#150000 0%,#050000 100%)'},
{id:'shambhala',name:'ШАМБАЛА',icon:'🏔',color:'#aaccff',symbols:['☸','❄','◇','✦','7'],mantra:'ОМ АХ ХУМ',concepts:['7 Лучей','Иерархия','Монада'],orbitColors:['#ff4444','#ff8844','#ffcc00','#44ff88','#4488ff','#8844ff','#ffffff','#ccddff','#aaccff'],bg:'radial-gradient(ellipse at center,#050510 0%,#010108 100%)'},
{id:'egypt',name:'ЕГИПЕТСКАЯ',icon:'𓂀',color:'#d4af37',symbols:['𓂀','☥','𓁹','𓆣','𓋹'],mantra:'ANKH UDJA SENEB',concepts:['Маат','Ка','Ба'],orbitColors:['#d4af37','#b8860b','#daa520','#ffd700','#ffdf00','#c9a84c','#8b7355','#cd853f','#f4e4c1'],bg:'radial-gradient(ellipse at center,#1a1000 0%,#0a0500 100%)'},
{id:'kabbalah',name:'КАББАЛА',icon:'✡',color:'#6666ff',symbols:['✡','א','ת','י','ה'],mantra:'EHYEH ASHER EHYEH',concepts:['Сефирот','Древо','Путь'],orbitColors:['#6666ff','#4444dd','#8888ff','#aaaaff','#5555cc','#7777ee','#9999ff','#bbbbff','#ddddff'],bg:'radial-gradient(ellipse at center,#000a1a 0%,#000510 100%)'},
{id:'neutral',name:'ЮЛИАНСКИЙ',icon:'◎',color:'#c9a84c',symbols:['✦','◎','☀','🌙','◈'],mantra:'TEMPUS FUGIT',concepts:['День','Месяц','Год'],orbitColors:['#ff2244','#ff6622','#ffcc00','#44cc44','#22aaff','#4455ff','#aa44ff','#ccddff','#ffd700'],bg:'radial-gradient(ellipse at center,#0a0015 0%,#000000 100%)'},
];

var PerceptionMatrix={
open:function(){
    var saved=localStorage.getItem('awara_matrix')||'neutral';
    var m=document.createElement('div');m.id='pm-modal';
    m.style.cssText='position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,0.94);backdrop-filter:blur(14px);display:flex;flex-direction:column;align-items:center;padding:20px 14px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    var cards=PM_SYSTEMS.map(function(s){
        var active=s.id===saved;
        var syms=s.symbols.map(function(x){return '<span>'+x+'</span>';}).join('');
        var cons=s.concepts.map(function(c){return '<span style="font-family:JetBrains Mono,monospace;font-size:6px;color:'+s.color+';padding:2px 6px;border-radius:10px;background:'+s.color+'14;border:1px solid '+s.color+'33;">'+c+'</span>';}).join('');
        var syms2=s.symbols.slice(0,4).map(function(x){return '<span>'+x+'</span>';}).join('');
        var bg = active ? s.color+'18' : 'rgba(255,255,255,0.03)';
        var bo = active ? s.color+'66' : 'rgba(255,255,255,0.07)';
        return '<div data-pmid="'+s.id+'" class="pm-card" style="border-radius:14px;cursor:pointer;overflow:hidden;padding:16px 14px;background:'+bg+';border:1px solid '+bo+';transition:all 0.25s;touch-action:manipulation;position:relative;">'
        +'<div style="position:absolute;inset:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;padding:8px;opacity:0.07;font-size:14px;overflow:hidden;">'+syms+'</div>'
        +'<div style="position:relative;z-index:1;text-align:center;">'
        +'<div style="font-size:32px;margin-bottom:8px;filter:drop-shadow(0 0 10px '+s.color+');">'+s.icon+'</div>'
        +'<div style="font-family:Cinzel,serif;font-size:10px;color:'+s.color+';letter-spacing:0.18em;margin-bottom:4px;">'+s.name+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center;margin-bottom:8px;">'+cons+'</div>'
        +'<div style="display:flex;justify-content:center;gap:4px;font-size:11px;">'+syms2+'</div>'
        +'<div style="font-family:Cormorant Garamond,serif;font-style:italic;font-size:8px;color:'+s.color+';opacity:0.5;margin-top:6px;">'+s.mantra+'</div>'
        +(active?'<div style="margin-top:8px;font-family:JetBrains Mono,monospace;font-size:7px;color:'+s.color+';">✦ АКТИВНА</div>':'')
        +'</div></div>';
    }).join('');
    m.innerHTML='<div style="width:100%;max-width:640px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
    +'<div><div style="font-family:Cinzel Decorative,serif;font-size:13px;color:#c9a84c;letter-spacing:0.2em;">🔭 МАТРИЦА ВОСПРИЯТИЯ</div>'
    +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin-top:3px;">ВЫБЕРИ ЛИНЗУ · ИГРА ПЕРЕСТРОИТСЯ</div></div>'
    +'<button id="pm-close-btn" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:22px;touch-action:manipulation;">✕</button></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;">'+cards+'</div></div>';
    document.body.appendChild(m);
    // Навешиваем обработчики через JS — без inline кавычек
    var closeBtn=m.querySelector('#pm-close-btn');
    if(closeBtn) closeBtn.onclick=function(){var el=document.getElementById('pm-modal');if(el)el.remove();};
    var pmCards=m.querySelectorAll('.pm-card');
    pmCards.forEach(function(card){
        card.onclick=function(){window.AWARA_SYS.PerceptionMatrix.select(this.dataset.pmid);};
    });
},

select:function(id){
    var s=null;for(var i=0;i<PM_SYSTEMS.length;i++){if(PM_SYSTEMS[i].id===id){s=PM_SYSTEMS[i];break;}}
    if(!s)return;
    localStorage.setItem('awara_matrix',id);
    var el=document.getElementById('pm-modal');if(el)el.remove();
    this.applyTheme(s);
    window.AWARA_SYS.DayData.update(id);
    if(typeof log==='function')log('МАТРИЦА','🔭 Линза: '+s.name);
    var btnInfo=document.getElementById('calendar-btn-info');
    if(btnInfo){btnInfo.textContent=s.icon+' '+s.name;btnInfo.style.color=s.color;}
},
applyTheme:function(s){
    document.documentElement.style.setProperty('--gold',s.color);
    var view=document.getElementById('view');if(view)view.style.background=s.bg;
    if(typeof state!=='undefined')state._orbitColors=s.orbitColors;
    if(typeof render==='function')render();
    var lbl=document.getElementById('active-matrix-label');
    if(lbl){lbl.textContent=s.name;lbl.style.color=s.color;}
},
restore:function(){
    var id=localStorage.getItem('awara_matrix')||'shambhala';
    var s=null;for(var i=0;i<PM_SYSTEMS.length;i++){if(PM_SYSTEMS[i].id===id){s=PM_SYSTEMS[i];break;}}
    if(s){this.applyTheme(s);window.AWARA_SYS.DayData.update(id);
        var btnInfo=document.getElementById('calendar-btn-info');
        if(btnInfo){btnInfo.textContent=s.icon+' '+s.name;btnInfo.style.color=s.color;}}
}};

// ── ДАННЫЕ ДНЯ ПО МАТРИЦЕ ──
var DayData={
_now: function(){ return new Date(); },
// Базовый день года (1-365)
_doy: function(d){ var n=d||this._now();var s=new Date(n.getFullYear(),0,0);return Math.floor((n-s)/86400000); },
// Юлианский день
_jd: function(d){ var n=d||this._now();return Math.floor(n.getTime()/86400000)+2440588; },

calc: function(matrixId, customDate){
    var d = customDate || this._now();
    var doy = this._doy(d);
    var jd = this._jd(d);
    var wd = d.getDay(); // 0=вс
    var dm = d.getDate();
    var mo = d.getMonth()+1;
    var WDAYS_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    var MONTHS_RU = ['','Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

    if(matrixId==='gene'||matrixId==='neutral_gene'){
        var gk = ((doy-1)%64)+1;
        var SHADOWS=['Бесчестность','Половинчатость','Хаос','Нетерпимость','Самообман','Конфликт','Вырождение','Уныние','Безрассудность','Самопожертвование','Мрак','Тщеславие','Непостоянство','Компромисс','Скованность','Безразличие','Мнение','Посредственность','Пустота','Гнев','Отчаяние','Зависть','Вина','Болезнь','Сжатие','Гордость','Тревога','Нерешительность','Наполовину','Измена','Самовлюблённость','Заблуждение','Вырождение','Боль','Отчуждение','Суматоха','Слабость','Нечестность','Привилегия','Разочарование','Уныние','Близорукость','Отчаяние','Помутнение','Нетребовательность','Тревога','Стресс','Ненависть','Фанатизм','Обусловленность','Поверхностность','Незрелость','Нарциссизм','Жалость','Мрак','Самоуничижение','Заурядность','Беспечность','Ожидание','Самомнение','Незнание','Незащищённость','Пустота','Нечувствительность'];
        var GIFTS=['Честность','Дальновидность','Очарование','Прощение','Свобода воли','Дипломатия','Добродетель','Стиль','Гибкость','Натуральность','Идеализм','Различение','Обновление','Чувствительность','Цветение','Разносторонность','Дальновидность','Экономность','Реальность','Самодисциплина','Знание','Альтруизм','Простота','Изобретательность','Приятие','Гордость','Ловкость','Реализм','Универсальность','Глубина','Лидерство','Проницательность','Объективность','Сострадание','Партнёрство','Проворство','Нежность','Серьёзность','Деликатность','Решительность','Обоснованность','Предвидение','Рождение','Синтез','Мудрость','Веселье','Трансформация','Мудрость','Вечность','Ясность','Воображение','Стойкость','Гений','Добродетель','Благодать','Уязвимость','Преображение','Интеграция','Живость','Самодостаточность','Истина','Ясность','Сострадание','Мастерство'];
        var SIDDHIS=['Честность','Вечность','Восхищение','Прощение','Свобода','Мир','Добродетель','Безвременье','Безгрешность','Бытие','Свет','Чистота','Обновление','Чистота','Цветение','Щедрость','Всеведение','Совершенство','Присутствие','Самосознание','Космическое знание','Самопожертвование','Простота','Безмолвие','Присутствие','Бессмертие','Совершенство','Реальность','Универсальность','Единство','Смирение','Восхождение','Откровение','Сострадание','Партнёрство','Всеведение','Нежность','Честность','Невинность','Ясность','Эмпатия','Совершенство','Рождение','Истина','Единство','Восторг','Вечное бытие','Просветление','Вечность','Ясность','Воображение','Стойкость','Гений','Добродетель','Милость','Уязвимость','Трансцендентность','Слияние','Живость','Самопожертвование','Истина','Ясность','Сострадание','Неотделимость'];
        var ANIMALS_SIDDHI=['Петушок','Курица','Тупик','Гагара','Гусь','Голубь','Киви','Колибри','Большой баклан','Кукабара','Фазан','Соловей','Трясогузка','Тукан','Зяблик','Стриж','Сокол','Удод','Пеликан','Журавль','Зимородок','Лебедь','Сорока','Козодой','Фламинго','Кречет','Дикая индейка','Ворона','Какаду','Райская птица','Синяя птица','Гриф','Канюк','Эму','Кетсаль','Поползень','Воробей','Сойка','Чайка','Малиновка','Ласточка','Попугай','Ястреб-перепелятник','Перепел','Ибис','Калифорнийская земляная кукушка','Ворон','Сова','Пингвин','Куропатка','Кондор','Зуек','Аист','Жаворонок','Альбатрос','Пчелоед','Черный дрозд','Утка','Цапля','Кукушка','Крапивник','Дятел','Орел','Павлин'];
        var ANIMALS_GIFT=['Бык','Корова','Койот','Обезьяна','Слон','Еж','Баран','Крот','Бобер','Шимпанзе','Белый медведь','Волк','Мышь','Барсук','Антилопа гну','Крыса','Жираф','Тигр','Верблюд','Скунс','Вол','Олень','Овца','Заяц','Лев','Лиса','Дельфин','Гепард','Свинья','Сурикат','Ягненок','Северный олень','Ленивец','Медведь','Як','Белка','Собака','Носорог','Козел','Кошка','Кенгуру','Лама','Американский лось','Дикая собака','Буйвол','Выдра','Осел','Кит','Лошадь','Енот','Ласка','Броненосец','Кролик','Кабан','Тюлень','Мангуст','Летучая мышь','Антилопа','Горилла','Бегемот','Черная пантера','Рысь','Ламантин','Ягуар'];
        var ANIMALS_SHADOW=['Жук-светляк','Осьминог','Гадюка','Личинка','Планктон','Кальмар','Гусеница','Слизняк','Клещ','Лягушка','Карп','Богомол','Морская звезда','Черепаха','Жук','Скат','Тутовый шелкопряд','Блоха','Тарантул','Муха','Морской конек','Пиранья','Скарабей','Летучая рыба','Лосось','Хамелеон','Акула','Цикада','Питон','Моль','Таракан','Земляной червь','Тритон','Ящерица','Кузнечик','Саламандра','Медуза','Краб','Комар','Оса','Угорь','Моллюск','Электрический угорь','Пчела','Муравей','Божья коровка','Рыба-меч','Устрица','Бабочка','Паук','Скорпион','Актиния','Змея','Кобра','Стрекоза','Морской еж','Жаба','Пиявка','Улитка','Крокодил','Саранча','Гремучая змея','Сороконожка','Лобстер'];
        var MINERALS=['Графит','Дымчатый кварц','Медь','Ставролит','Биксбит','Селенит','Галенит','Серебро','Магнетит','Опал','Аметист','Хризоколла','Цитрин','Золото','Чёрный турмалин','Коралл','Ларимар','Оливин','Слоновая кость','Янтарь','Родонит','Сапфир','Изумруд','Обсидиан','Бриллиант','Кунцит','Хризоберилл','Шпинель','Бирюза','Аметрин','Лунный камень','Идокраз','Флюорит','Гагат','Родохрозит','Сера','Гелиотроп','Пирит','Гематит','Кианит','Целестин','Содалит','Киноварь','Кальцит','Лазурит','Рубин','Танзанит','Жемчуг','Малахит','Данбурит','Молдавит','Говлит','Аммонит','Серпантин','Галит','Мандарин гранат','Топаз','Апатит','Нефрит','Железо','Сугилит','Биотит','Циркон','Иолит'];
        var AMINOACIDS=['Лизин','Глутамин','Метионин','Аргинин','Глутаминовая кислота','Лейцин','Изолейцин','Глутаминовая кислота','Лизин','Треонин','Треонин','Фенилаланин','Аланин','Серин','Глицин','Гистидин','Аспарагиновая кислота','Аспарагин','Серин','Аргинин','Аспарагин','Лейцин','Изолейцин','Аргинин','Серин','Треонин','Аланин','Аспарагиновая кислота','Пролин','Лейцин','Аспарагин','Аспарагиновая кислота','Пролин','Треонин','Валин','Глицин','Пролин','Глутамин','Глутаминовая кислота','Аргинин','Метионин','Аланин','Лизин','Глицин','Треонин','Цистеин','Валин','Аргинин','Серин','Валин','Пролин','Аспарагиновая кислота','Аланин','Гистидин','Лейцин','Аспарагин','Треонин','Изолейцин','Аспарагин','Лейцин','Лизин','Валин','Цистеин','Фенилаланин'];
        var HEXAGRAMS=['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64'];
        return {
            icon:'🧬', col:'#00cc88',
            label1:'КЛЮЧ ГЕНА', val1: '#'+gk+' · '+(GIFTS[gk-1]||'Дар'),
            label2:'ТЕНЬ',      val2: (SHADOWS[gk-1]||'—'),
            label3:'СИДДХИ',    val3: (SIDDHIS[gk-1]||'—'),
            label4:'ТОТЕМ СИДДХИ', val4: (ANIMALS_SIDDHI[gk-1]||'—'),
            label5:'ТОТЕМ ДАРА', val5: (ANIMALS_GIFT[gk-1]||'—'),
            label6:'ТОТЕМ ТЕНИ', val6: (ANIMALS_SHADOW[gk-1]||'—'),
            label7:'МИНЕРАЛ', val7: (MINERALS[gk-1]||'—'),
            label8:'АМИНОКИСЛОТА', val8: (AMINOACIDS[gk-1]||'—'),
            label9:'ГЕКСАГРАММА', val9: 'И-Цзин #'+(HEXAGRAMS[gk-1]||gk)
        };
    }
    if(matrixId==='vedic'){
        var NAKSHATRA=['Ашвини','Бхарани','Критика','Рохини','Мригашира','Ардра','Пунарвасу','Пушья','Ашлеша','Магха','Пурва Пхалгуни','Уттара Пхалгуни','Хаста','Читра','Свати','Вишакха','Анурадха','Джьештха','Мула','Пурва Ашадха','Уттара Ашадха','Шравана','Дхаништха','Шатабхиша','Пурва Бхадрапада','Уттара Бхадрапада','Ревати'];
        var TITHI=['Пратипада','Двитийя','Тритийя','Чатурти','Панчами','Шашти','Саптами','Аштами','Навами','Дашами','Экадаши','Двадаши','Трайодаши','Чатурдаши','Пурнима/Амавасья'];
        var VARAS=['Равивара ☀','Сомавара 🌙','Мангалавара ♂','Будхавара ☿','Гурувара ♃','Шукравара ♀','Шанивара ♄'];
        var DEVATAS=['Ашвини Кумары','Яма','Агни','Праджапати','Сома','Рудра','Адити','Брихаспати','Сарпа','Питары','Арьяман','Бхага','Савитар','Твастар','Ваю','Индрагни','Митра','Индра','Нирритти','Апас','Вишведевы','Вишну','Васу','Варуна','Аджайкапада','Ахирбудхнья','Пушан'];
        var VIKRAM_YEAR = d.getFullYear() + 56; // Vikram Samvat
        var nIdx = (jd+11)%27;
        var tIdx = (jd+14)%15;
        return {
            icon:'🪷', col:'#ff8844',
            label1:'НАКШАТРА', val1: NAKSHATRA[nIdx],
            label2:'ТИТХИ',    val2: TITHI[tIdx],
            label3:'ДЕВАТА',   val3: DEVATAS[nIdx],
            label4:'ВАР',      val4: VARAS[wd],
            label5:'ГОД',      val5: 'Викрам '+VIKRAM_YEAR+' · '+NAKSHATRA[nIdx]
        };
    }
    if(matrixId==='maya'){
        var TZOLKIN_TONES=['','Единство','Лунный','Электрический','Самосущий','Обертональный','Ритмический','Резонантный','Галактический','Солнечный','Планетарный','Спектральный','Кристальный','Космический'];
        var TZOLKIN_SIGNS=['','Красный Дракон','Белый Ветер','Синяя Ночь','Желтое Зерно','Красный Змей','Белый Мост Миров','Синяя Рука','Желтая Звезда','Красная Луна','Белая Собака','Синяя Обезьяна','Желтый Человек','Красное Небо','Белый Волшебник','Синий Орел','Желтый Воин','Красная Земля','Белое Зеркало','Синяя Буря','Желтое Солнце'];
        var MAYA_BASE = 584283;
        var pos = (jd - MAYA_BASE) % 260; if(pos<0) pos+=260;
        var tone = (pos%13)+1; var sign = (pos%20)+1; var KIN = pos+1;
        // Год Майя — Хааб (365 дней) + текущая Катун
        var haab = Math.floor((jd - MAYA_BASE) / 365); 
        var KATUN = Math.floor(haab / 20);
        return {
            icon:'🌀', col:'#cc44ff',
            label1:'КИН',        val1: '#'+KIN,
            label2:'ТОНАЛЬ',     val2: tone+' · '+TZOLKIN_TONES[tone],
            label3:'ЗНАК ДНЯ',   val3: TZOLKIN_SIGNS[sign]||'—',
            label4:'ДАТА',       val4: dm+'.'+mo,
            label5:'ГОД',        val5: 'Катун '+KATUN+' · КИН '+KIN+'/260'
        };
    }
    if(matrixId==='dao'){
        var HEXAGRAMS=['乾 Цянь·Творчество','坤 Кунь·Исполнение','屯 Чжунь·Начало','蒙 Мэн·Незрелость','需 Сюй·Ожидание','訟 Сун·Тяжба','師 Ши·Войско','比 Би·Единение','小畜 Сяо Чу·Стяжание','履 Люй·Поступь','泰 Тай·Расцвет','否 Пи·Упадок','同人 Тун Жэнь·Единство','大有 Да Ю·Богатство','謙 Цянь·Смирение','豫 Юй·Радость','隨 Суй·Следование','蠱 Гу·Порча','臨 Линь·Приближение','觀 Гуань·Созерцание','噬嗑 Ши Кэ','賁 Би','剝 Бо·Распад','復 Фу·Возврат','無妄 У Ван·Без Лжи','大畜 Да Чу','頤 И·Питание','大過 Да Го','習坎 Кань·Вода','離 Ли·Огонь','咸 Сянь·Влияние','恆 Хэн·Постоянство','遯 Дунь·Отступление','大壯 Да Чжуан','晉 Цзинь·Прогресс','明夷 Мин И','家人 Цзя Жэнь','睽 Куй','蹇 Цзянь','解 Се','損 Сунь','益 И','夬 Гуай','姤 Гоу','萃 Цуй','升 Шэн','困 Кунь','井 Цзин','革 Гэ·Перемена','鼎 Дин·Котёл','震 Чжэнь·Гром','艮 Гэнь·Гора','漸 Цзянь','歸妹 Гуй Мэй','豐 Фэн·Обилие','旅 Люй·Странник','巽 Сунь·Ветер','兌 Дуй·Радость','渙 Хуань','節 Цзе','中孚 Чжун Фу','小過 Сяо Го','既濟 Цзи Цзи','未濟 Вэй Цзи'];
        var WU_XING=['🌿 Дерево','🔥 Огонь','🌍 Земля','⚔ Металл','💧 Вода'];
        var STEMS=['Цзя','И','Бин','Дин','У','Цзи','Гэн','Синь','Жэнь','Гуй'];
        var BRANCHES=['Цзы·Крыса','Чоу·Бык','Инь·Тигр','Мао·Кролик','Чэнь·Дракон','Сы·Змея','У·Лошадь','Вэй·Коза','Шэнь·Обезьяна','Ю·Петух','Сюй·Собака','Хай·Свинья'];
        var hIdx = (jd+3)%64;
        var wxIdx = jd%5;
        // Китайский год — небесный ствол + земная ветвь
        var CHYEAR = d.getFullYear() - 1984;
        var stem = STEMS[((CHYEAR%10)+10)%10];
        var branch = BRANCHES[((CHYEAR%12)+12)%12];
        return {
            icon:'☯', col:'#44aacc',
            label1:'ГЕКСАГРАММА', val1: HEXAGRAMS[hIdx],
            label2:'У-СИН',       val2: WU_XING[wxIdx],
            label3:'ТАО',         val3: (jd%2===0)?'Ян ☰':'Инь ☷',
            label4:'ДЕНЬ',        val4: WDAYS_RU[wd],
            label5:'ГОД',         val5: stem+'-'+branch+' · '+WU_XING[wxIdx]
        };
    }
    if(matrixId==='slavic'){
        // Круголет Числобога
        // Лето 7533 от СМЗХ (2026 н.э.) — Небесный Конь (каждые 16 лет)
        var SLAVIC_GODS=['Перун','Велес','Макошь','Сварог','Лада','Стрибог','Морена','Даждьбог','Хорс','Ярило','Купала','Семаргл','Тригла','Чернобог','Белобог','Род'];
        var SLAVIC_ELEM=['Огонь','Земля','Вода','Воздух','Эфир','Металл','Дерево','Свет','Тьма'];
        var SLAVIC_DAYS_ARR=['День Богов','День Предков','День Природы','День Человека','День Земли','День Неба','День Огня','День Воды','День Воздуха'];
        var SLAVIC_YEARS_ARR=['Тёмный Сох','Золотой Тур','Прекрасный Лось','Жемчужная Щука','Великий Медведь','Священная Лягушка','Небесный Конь','Мудрая Сова','Белый Волк','Чёрный Соболь','Золотой Петух','Огненная Мышь','Сияющий Орёл','Добрая Лисица','Кружащий Дракон','Грозный Вепрь'];
        var sletNe = d.getFullYear() + 5508; // Лето от СМЗХ
        var sYear = (Math.floor((d.getFullYear()-2012)/16)+100)%16; // Небесный Конь с 2012
        var sGod = (jd+2)%16;
        var sElem = (jd+1)%9;
        var sDay = jd%9;
        return {
            icon:'⚡', col:'#ff4444',
            label1:'БОГ ДНЯ',  val1: SLAVIC_GODS[sGod],
            label2:'СТИХИЯ',   val2: SLAVIC_ELEM[sElem],
            label3:'ЛЕТО',     val3: 'Л'+sletNe+' · '+SLAVIC_YEARS_ARR[sYear],
            label4:'ТИП ДНЯ',  val4: SLAVIC_DAYS_ARR[sDay],
            label5:'НЫНЕШНИЙ ГОД', val5: SLAVIC_YEARS_ARR[sYear]+' ('+sletNe+')'
        };
    }
    if(matrixId==='shambhala'){
        var RAY_NAMES=['I · Воля-Власть','II · Любовь-Мудрость','III · Активный Интеллект','IV · Гармония-Конфликт','V · Конкретное Знание','VI · Преданность','VII · Церемония'];
        var RAY_PLANETS=['Вулкан','Юпитер','Сатурн','Меркурий','Венера','Марс','Уран'];
        var RAY_ICONS=['⚡','🪷','🌿','🎵','🔬','🔥','✦'];
        var RAY_COLORS=['#ff4444','#4488ff','#ffaa00','#44ff88','#ff88ff','#ff6644','#aa88ff'];
        var AGNI=['Огонь Бытия','Огонь Знания','Огонь Воли','Огонь Любви','Огонь Мысли','Огонь Действия','Огонь Синтеза'];
        var COSMIC=['🌑 Новолуние','🌒 Растущая','🌓 Первая четверть','🌔 Растущая','🌕 Полнолуние','🌖 Убывающая','🌗 Последняя четверть','🌘 Убывающая'];
        var rIdx = (jd+5)%7;
        var moonPhase = Math.max(0,Math.min(7,Math.floor(((jd-2451550.1)%29.53)/29.53*8)));

        // Калачакра: 60-летний цикл (с 1984 года - год Крысы/Дерева)
        var year60 = ((d.getFullYear() - 1984) % 60 + 60) % 60 + 1;

        // 5 элементов Калачакры
        var ELEMENTS = ['🌳 Дерево','🔥 Огонь','🌍 Земля','⚔ Металл','💧 Вода'];
        var ELEM_COLORS = ['#44aa44','#ff4444','#cc8844','#aaaaaa','#4488ff'];
        var elemIdx = Math.floor((year60-1)/12) % 5;

        // День/Ночь года (Брахма/Вишну) - по месяцам
        var isDayOfYear = (mo >= 3 && mo <= 8); // март-август = День Брахмы
        var dayNight = isDayOfYear ? '☀ День Брахмы' : '🌙 Ночь Вишну';
        var dayNightCol = isDayOfYear ? '#ffd700' : '#6688ff';

        // Чёрная/Белая половина 60-летнего цикла
        var isWhite = (year60 >= 31 && year60 <= 50);
        var halfCycle = isWhite ? '⚪ Белая' : '⚫ Чёрная';
        var halfCycleCol = isWhite ? '#dddddd' : '#444444';

        return {
            icon:'🏔', col:'#aaccff',
            label1:'ЛУЧ ДНЯ',  val1: RAY_ICONS[rIdx]+' '+RAY_NAMES[rIdx], col1: RAY_COLORS[rIdx],
            label2:'ЭЛЕМЕНТ',   val2: ELEMENTS[elemIdx], col2: ELEM_COLORS[elemIdx],
            label3:'ФАЗА ГОДА', val3: dayNight, col3: dayNightCol,
            label4:'ЦИКЛ 60',   val4: halfCycle + ' · ' + year60 + '/60', col4: halfCycleCol,
            label5:'ГОД',       val5: 'Год ' + ELEMENTS[elemIdx]
        };
    }
    if(matrixId==='egypt'){
        // Египетская система
        var DECANS=['Хнум','Хатхор','Птах','Ра','Анубис','Сет','Гор','Бастет','Сехмет','Осирис','Исида','Тот','Маат','Нефтида','Собек','Амон','Мут','Хонсу','Нейт','Селкет','Апис','Хапи','Нун','Атум','Шу','Тефнут','Геб','Нут','Уаджет','Нехбет','Монту','Хепри','Сокар','Имхотеп','Серкет','Хех'];
        var HOURS_RA=['Рассвет Ра','Восход Солнца','Утренний Свет','Полдень Ра','Зенит Силы','День Маат','Закат Ра','Сумерки','Ночь Нут','Тьма Дуата','Полночь','Возрождение'];
        var GODS_WEEK=['Ра ☀','Тот 𓁟','Птах 𓁹','Хатхор 𓁐','Анубис 𓃥','Исида 𓊨','Осирис 𓀭'];
        var SEASONS_EG=['Ахет (Разлив)','Перет (Всходы)','Шему (Жатва)'];

        var decanIdx = (jd % 36);
        var hourIdx = Math.floor((d.getHours() / 24) * 12);
        var seasonIdx = Math.floor((mo-1) / 4) % 3;

        // Египетский год (от основания Мемфиса ~3100 до н.э.)
        var egyptYear = d.getFullYear() + 3100;

        return {
            icon:'𓂀', col:'#d4af37',
            label1:'ДЕКАН',     val1: '𓇳 '+DECANS[decanIdx], col1: '#d4af37',
            label2:'ЧАС РА',    val2: HOURS_RA[hourIdx], col2: '#ffd700',
            label3:'СЕЗОН',     val3: SEASONS_EG[seasonIdx], col3: '#b8860b',
            label4:'БОГ ДНЯ',   val4: GODS_WEEK[wd], col4: '#daa520',
            label5:'ГОД',       val5: 'Год '+egyptYear+' от Мемфиса'
        };
    }
    if(matrixId==='kabbalah'){
        // Каббалистическая система
        var SEPHIROT=['Кетер (Корона)','Хокма (Мудрость)','Бина (Понимание)','Хесед (Милость)','Гебура (Строгость)','Тиферет (Красота)','Нецах (Вечность)','Ход (Слава)','Йесод (Основание)','Малхут (Царство)'];
        var PATHS=['Алеф א','Бет ב','Гимель ג','Далет ד','Хе ה','Вав ו','Заин ז','Хет ח','Тет ט','Йод י','Каф כ','Ламед ל','Мем מ','Нун נ','Самех ס','Айн ע','Пе פ','Цади צ','Коф ק','Реш ר','Шин ש','Тав ת'];
        var WORLDS=['Ацилут (Эманация)','Брия (Творение)','Йецира (Формирование)','Асия (Действие)'];
        var PARTZUFIM=['Арих Анпин','Аба','Има','Зеир Анпин','Нуква'];

        var sephIdx = (jd % 10);
        var pathIdx = (jd % 22);
        var worldIdx = (jd % 4);
        var partzufIdx = (jd % 5);

        // Еврейский год (от сотворения мира)
        var hebrewYear = d.getFullYear() + 3760;

        return {
            icon:'✡', col:'#6666ff',
            label1:'СЕФИРА',   val1: '✦ '+SEPHIROT[sephIdx], col1: '#6666ff',
            label2:'ПУТЬ',     val2: PATHS[pathIdx], col2: '#8888ff',
            label3:'МИР',      val3: WORLDS[worldIdx], col3: '#aaaaff',
            label4:'ПАРЦУФ',   val4: PARTZUFIM[partzufIdx], col4: '#7777ee',
            label5:'ГОД',      val5: hebrewYear+' от Сотворения'
        };
    }
    // Нейтраль (Юлианский)
    return {
        icon:'◎', col:'#c9a84c',
        label1:'ДЕНЬ',      val1: WDAYS_RU[wd], col1: '#c9a84c',
        label2:'МЕСЯЦ',     val2: MONTHS_RU[mo], col2: '#b8960b',
        label3:'ЧИСЛО',     val3: dm+' число', col3: '#daa520',
        label4:'ДЕНЬ ГОДА', val4: doy+'/365', col4: '#c9a84c',
        label5:'ГОД',       val5: d.getFullYear()+' н.э.'
    };
},

update: function(matrixId){
    var mid = matrixId || localStorage.getItem('awara_matrix') || 'shambhala';
    var data = this.calc(mid);
    var icon = data.icon || '◎';
    var col  = data.col  || '#c9a84c';

    var MATRIX_NAMES = {
        vedic:'ДЖЙОТИШ', dao:'ДАОСИЗМ', maya:'МАЙЯНСКАЯ', gene:'ГЕННЫЕ КЛЮЧИ',
        slavic:'КРУГОЛЕТ', shambhala:'ШАМБАЛА', egypt:'ЕГИПЕТСКАЯ', kabbalah:'КАББАЛА', neutral:'ЮЛИАНСКИЙ'
    };
    var mName = MATRIX_NAMES[mid] || mid.toUpperCase();

    // Сохраняем данные для модального окна
    window._calendarData = data;
    window._calendarMatrix = mName;
    window._calendarMatrixId = mid; // ID матрицы (slavic, vedic и т.д.)
    window._calendarIcon = icon;
    window._calendarCol = col;

    // Обновляем кнопку календаря
    var btnInfo = document.getElementById('calendar-btn-info');
    if(btnInfo) btnInfo.textContent = mName;

    // Обновляем поля времени/года/луча
    if(typeof updateShambhalaFields === 'function') updateShambhalaFields();

    // Цвет лобби под матрицу
    var dayEl = document.getElementById('daydata');
    if(dayEl) dayEl.style.color = col;

    // ── Под РА во вселенной — 5 полей с иконкой и цветом ──
    var raA = document.getElementById('ra-anchor');
    if(!raA) return;

    var raSub = document.getElementById('ra-day-sub');
    if(!raSub){
        raSub = document.createElement('div');
        raSub.id = 'ra-day-sub';
        raSub.style.cssText = 'position:absolute;top:100%;left:50%;transform:translateX(-50%);text-align:center;margin-top:8px;pointer-events:none;z-index:4900;';
        raA.appendChild(raSub);
    }

    var fields = [
        {l:data.label1, v:data.val1},
        {l:data.label2, v:data.val2},
        {l:data.label3, v:data.val3},
        {l:data.label4, v:data.val4},
        {l:data.label5, v:data.val5}
    ].filter(function(f){ return f.v; });

    raSub.innerHTML =
        '<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:'+col+';letter-spacing:0.18em;margin-bottom:6px;opacity:0.8;">'
        +icon+' '+mName+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;">'
        +fields.map(function(f){
            return '<div style="text-align:center;min-width:50px;max-width:80px;">'
                +'<div style="font-family:Cinzel,serif;font-size:8px;color:'+col+';letter-spacing:0.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">'+f.v+'</div>'
                +'<div style="font-family:JetBrains Mono,monospace;font-size:5px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;margin-top:1px;">'+f.l+'</div>'
                +'</div>';
        }).join('')
        +'</div>';

    if(typeof log==='function') log('ДЕНЬ','📅 '+icon+' '+mName+' · '+data.label1+': '+data.val1);
}};


// ── ПРОГРЕССИВНАЯ ВСЕЛЕННАЯ ──
var STAGES=[
{min:0,max:0,name:'ПУСТОТА',stars:0},{min:1,max:99,name:'ПЕРВАЯ ИСКРА',stars:0.15},
{min:100,max:299,name:'РАССВЕТ',stars:0.35},{min:300,max:699,name:'ПРОБУЖДЕНИЕ',stars:0.55},
{min:700,max:1499,name:'РАСЦВЕТ',stars:0.75},{min:1500,max:2999,name:'ГАРМОНИЯ',stars:0.9},
{min:3000,max:9999,name:'ПОЛНЫЙ КОСМОС',stars:1.0},
{min:10000,max:99999999,name:'ДЕРЖАВА РА ✦',stars:1.0,derzhava:true}];

var UniverseStage={
_derzhavaShown:false,
getScore:function(){return (typeof state!=='undefined'?(state.totalLight||0):0);},
getStage:function(){var sc=this.getScore();for(var i=0;i<STAGES.length;i++){if(sc>=STAGES[i].min&&sc<=STAGES[i].max)return STAGES[i];}return STAGES[STAGES.length-1];},
apply:function(){
    var st=this.getStage();
    var sf=document.getElementById('starfield');if(sf)sf.style.opacity=st.stars;
    var lbl=document.getElementById('universe-stage-label');if(lbl){lbl.textContent=st.name;lbl.style.color=st.derzhava?'#ffd700':'rgba(201,168,76,0.4)';}
    if(!this._shown&&this.getScore()===0&&!localStorage.getItem('awara_onboarding_done')){this._shown=true;setTimeout(function(){Onboarding.start();},2000);}
    // Открываем Державу РА при достижении
    if(st.derzhava&&!this._derzhavaShown&&!localStorage.getItem('awara_derzhava_seen')){
        this._derzhavaShown=true;
        setTimeout(function(){window.openDerzhava();},1500);
    }
}};

// ══ ДЕРЖАВА РА ══
var DERZHAVA_RANKS = [
    {id:'initiate', name:'ИНИЦИАТ',     min:0,     icon:'🌱', col:'#88cc88', desc:'Пробуждённая Искра · Начало Пути'},
    {id:'warrior',  name:'ВОИН СВЕТА',  min:3000,  icon:'⚔',  col:'#4488ff', desc:'Воля укреплена · Сферы раскрыты'},
    {id:'sage',     name:'МУД РЕЦ',     min:7000,  icon:'📿', col:'#cc88ff', desc:'Знание как Служение · Тапас'},
    {id:'king',     name:'ЦАРЬ',        min:10000, icon:'👑', col:'#ffd700', desc:'Держава РА · Правитель Вселенной'},
    {id:'buddha',   name:'БУДДА',       min:25000, icon:'☸',  col:'#ffffff', desc:'Освобождение · Нирвана · Свет'},
    {id:'logos',    name:'ПЛАНЕТАРНЫЙ ЛОГОС', min:50000, icon:'🌍', col:'#00faff', desc:'Единение с Планетой · Служение Всему'},
];

window.getDerzhaваRank = function(light){
    var r = DERZHAVA_RANKS[0];
    for(var i=0;i<DERZHAVA_RANKS.length;i++){if(light>=DERZHAVA_RANKS[i].min)r=DERZHAVA_RANKS[i];}
    return r;
};

// Демо-правители Державы РА
var DERZHAVA_RULERS = [
    {name:'Арджуна',   icon:'⚔️', rank:'king',   light:12400, desc:'Воин Дхармы · Ученик Кришны'},
    {name:'Кришна',    icon:'🪷', rank:'buddha',  light:88888, desc:'Аватар Вишну · Держатель Гиты'},
    {name:'Акбар',     icon:'☀️', rank:'sage',    light:9200,  desc:'Владыка Справедливости · Дин-и-Илахи'},
    {name:'Соломон',   icon:'✡',  rank:'king',    light:15000, desc:'Царь Мира · Строитель Храма'},
    {name:'Ашока',     icon:'☸',  rank:'buddha',  light:31000, desc:'Царь Дхармы · Объединитель'},
];

window.openDerzhava = function(){
    var light = typeof state!=='undefined'?(state.totalLight||0):0;
    var rank = window.getDerzhaваRank(light);
    var nextRank = null;
    for(var i=0;i<DERZHAVA_RANKS.length;i++){if(DERZHAVA_RANKS[i].min>light){nextRank=DERZHAVA_RANKS[i];break;}}

    var m = document.getElementById('derzhava-modal');
    if(m) m.remove();
    m = document.createElement('div');
    m.id = 'derzhava-modal';
    m.style.cssText = 'position:fixed;inset:0;z-index:99993;background:rgba(0,0,0,0.92);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow-y:auto;';

    // Карточки правителей
    var rulers = DERZHAVA_RULERS.map(function(r){
        var rk = null;for(var i=0;i<DERZHAVA_RANKS.length;i++){if(DERZHAVA_RANKS[i].id===r.rank)rk=DERZHAVA_RANKS[i];}
        rk = rk||DERZHAVA_RANKS[0];
        return '<div style="padding:10px 12px;border-radius:10px;background:'+rk.col+'08;border:1px solid '+rk.col+'22;display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
            +'<div style="font-size:20px;">'+r.icon+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:10px;color:'+rk.col+';letter-spacing:0.15em;">'+r.name+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.35);margin-top:2px;">'+r.desc+'</div></div>'
            +'<div style="text-align:right;"><div style="font-size:14px;">'+rk.icon+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+rk.col+';margin-top:2px;">'+rk.name+'</div></div>'
            +'</div>';
    }).join('');

    // Лестница рангов
    var ladder = DERZHAVA_RANKS.map(function(rk){
        var done = light >= rk.min;
        var active = rank.id === rk.id;
        return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:'+(active?rk.col+'18':'rgba(255,255,255,0.02)')+';border:1px solid '+(active?rk.col+'44':'rgba(255,255,255,0.06)')+';margin-bottom:5px;">'
            +'<div style="font-size:18px;'+(done?'':'opacity:0.3')+'">'+rk.icon+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:9px;color:'+(done?rk.col:'rgba(255,255,255,0.25)')+';letter-spacing:0.15em;">'+rk.name+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin-top:2px;">'+rk.desc+'</div></div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+(done?rk.col:'rgba(255,255,255,0.2)')+';">'+(done?'✦':rk.min+' света')+'</div>'
            +'</div>';
    }).join('');

    m.innerHTML = '<div style="width:100%;max-width:520px;background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,0.08),rgba(4,2,18,0.99) 60%);border:1px solid rgba(255,215,0,0.3);border-radius:20px;overflow:hidden;max-height:90vh;display:flex;flex-direction:column;">'
        // Шапка
        +'<div style="padding:28px 24px 20px;text-align:center;border-bottom:1px solid rgba(255,215,0,0.12);flex-shrink:0;">'
        +'<div style="font-size:36px;margin-bottom:8px;filter:drop-shadow(0 0 20px #ffd700);">'+rank.icon+'</div>'
        +'<div style="font-family:Cinzel Decorative,serif;font-size:14px;color:#ffd700;letter-spacing:0.25em;margin-bottom:4px;">ДЕРЖАВА РА</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,215,0,0.4);letter-spacing:0.2em;margin-bottom:16px;">СОЮЗ БУДД · ЦАРЕЙ · ПРАВИТЕЛЕЙ · ИГРОКОВ</div>'
        +'<div style="display:inline-block;padding:10px 24px;background:'+rank.col+'18;border:1px solid '+rank.col+'44;border-radius:10px;">'
        +'<div style="font-family:Cinzel,serif;font-size:11px;color:'+rank.col+';letter-spacing:0.2em;">'+rank.name+'</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.3);margin-top:4px;">'+light+' света · '+rank.desc+'</div>'
        +(nextRank?'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.2);margin-top:3px;">До '+nextRank.name+': '+(nextRank.min-light)+' света</div>':'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;margin-top:3px;">✦ ВЫСШИЙ РАНГ ДОСТИГНУТ</div>')
        +'</div></div>'
        // Контент
        +'<div style="flex:1;overflow-y:auto;padding:16px 20px;">'
        // Лестница
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.25);letter-spacing:0.2em;margin-bottom:10px;">ПУТЬ ВОСХОЖДЕНИЯ</div>'
        +ladder
        // Правители
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.25);letter-spacing:0.2em;margin:14px 0 10px;">ПРАВИТЕЛИ ДЕРЖАВЫ</div>'
        +rulers
        // Описание
        +'<div style="margin-top:16px;padding:14px;background:rgba(255,215,0,0.04);border-radius:10px;border:1px solid rgba(255,215,0,0.1);">'
        +'<div style="font-family:Cormorant Garamond,serif;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.85;">'
        +'Держава РА — это пространство где пробуждённые существа объединяются для строительства Золотого Века. Здесь цари не правят — они служат. Будды не уходят — они возвращаются. Правители не владеют — они хранят.'
        +'</div></div></div>'
        // Кнопки
        +'<div style="padding:14px 20px;border-top:1px solid rgba(255,215,0,0.1);display:flex;gap:8px;flex-shrink:0;">'
        +'<button id="drzh-close" style="flex:1;padding:10px;border-radius:10px;cursor:pointer;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);font-family:Cinzel,serif;font-size:9px;color:rgba(255,215,0,0.6);letter-spacing:0.15em;touch-action:manipulation;">✦ В МОЮ ВСЕЛЕННУЮ</button>'
        +'</div></div>';

    document.body.appendChild(m);
    document.getElementById('drzh-close').onclick = function(){m.remove();localStorage.setItem('awara_derzhava_seen','1');};
    m.onclick = function(e){if(e.target===m){m.remove();localStorage.setItem('awara_derzhava_seen','1');}};
    if(typeof Audio!=='undefined') Audio.chord();
};

// Кнопка Державы РА в топбаре
setTimeout(function(){
    var tb = document.getElementById('awara-topbar');
    if(tb && !document.getElementById('derzhava-btn')){
        var btn = document.createElement('button');
        btn.id = 'derzhava-btn';
        btn.style.cssText = 'padding:4px 10px;border-radius:7px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);font-family:Cinzel,serif;font-size:8px;color:rgba(255,215,0,0.6);cursor:pointer;margin-left:6px;touch-action:manipulation;flex-shrink:0;letter-spacing:0.1em;';
        btn.textContent = '✦ ДЕРЖАВА';
        btn.onclick = function(){ window.openDerzhava(); };
        tb.appendChild(btn);
    }
}, 1400);

// ── ОНБОРДИНГ ──
var Onboarding={
_step:0,_active:false,
STEPS:[
{icon:'📿',color:'#ffaa00',title:'Брахма говорит...',text:'Приветствую, Искра. Ты вошёл в пустую вселенную. Нажми на центр Хаоса — зажги первый свет.'},
{icon:'🪷',color:'#4488ff',title:'Вишну говорит...',text:'Четыре стартовые сферы — четыре стихии. Нажми на одну чтобы открыть её.'},
{icon:'🔱',color:'#ff4444',title:'Шива говорит...',text:'Каждая Инициация даёт Ключ. Ключи открывают путь к Духу. Начни.'}],
start:function(){if(this._active||localStorage.getItem('awara_onboarding_done'))return;this._active=true;this._step=0;this._show();},
_show:function(){
    var s=this.STEPS[this._step];if(!s){this._finish();return;}
    var old=document.getElementById('onboarding-popup');if(old)old.remove();
    var p=document.createElement('div');p.id='onboarding-popup';
    p.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99992;width:min(360px,88vw);background:rgba(2,1,16,0.97);border:1px solid '+s.color+'44;border-radius:16px;padding:20px;box-shadow:0 0 40px '+s.color+'22;';
    var step=this._step;var total=this.STEPS.length;
    p.innerHTML='<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;"><div style="font-size:24px;">'+s.icon+'</div><div style="font-family:Cinzel,serif;font-size:10px;color:'+s.color+';letter-spacing:0.2em;">'+s.title+'</div><button onclick="window.AWARA_SYS.Onboarding._finish()" style="margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:18px;">✕</button></div>'
    +'<div style="font-family:Cormorant Garamond,serif;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.75;margin-bottom:16px;">'+s.text+'</div>'
    +'<div style="display:flex;justify-content:flex-end;"><button onclick="window.AWARA_SYS.Onboarding._next()" style="padding:8px 20px;border-radius:8px;background:'+s.color+'18;border:1px solid '+s.color+'44;font-family:Cinzel,serif;font-size:9px;letter-spacing:0.15em;color:'+s.color+';cursor:pointer;">'+(step<total-1?'ДАЛЕЕ →':'НАЧАТЬ ✦')+'</button></div>';
    document.body.appendChild(p);
},
_next:function(){this._step++;this._show();},
_finish:function(){this._active=false;var el=document.getElementById('onboarding-popup');if(el)el.remove();localStorage.setItem('awara_onboarding_done','1');}};

// ── ИЛЬДАБАОФ ──
var Ildabaof={
_timer:null,_active:false,
LIGHT:['✦','☀','🪷','◉','☯','⊕','∞'],DARK:['⊗','✗','▼','◆','✘','⬤','▪'],
start:function(){this._timer=setTimeout(function(){Ildabaof._attack();},180000+Math.random()*120000);},
stop:function(){clearTimeout(this._timer);},
_attack:function(){
    if(this._active||(typeof state!=='undefined'&&(state.totalLight||0)<100)){this._schedule();return;}
    this._active=true;
    var correct=this.LIGHT[Math.floor(Math.random()*this.LIGHT.length)];
    var pos=Math.floor(Math.random()*9);
    var items=[];for(var i=0;i<9;i++)items.push(i===pos?{s:correct,ok:true}:{s:this.DARK[Math.floor(Math.random()*this.DARK.length)],ok:false});
    var ov=document.createElement('div');ov.id='ildabaof-ov';
    ov.style.cssText='position:fixed;inset:0;z-index:99985;background:rgba(0,0,0,0.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    var cells=items.map(function(it){return '<div onclick="window.AWARA_SYS.Ildabaof._pick('+it.ok+')" style="padding:14px;border-radius:8px;cursor:pointer;background:rgba(136,0,0,0.15);border:1px solid rgba(136,0,0,0.3);font-size:24px;text-align:center;touch-action:manipulation;">'+it.s+'</div>';}).join('');
    ov.innerHTML='<div style="text-align:center;max-width:300px;padding:20px;"><div style="font-family:Cinzel Decorative,serif;font-size:13px;color:#ff4444;letter-spacing:0.3em;margin-bottom:8px;">⚠ ИЛЬДАБАОФ</div><div style="font-family:JetBrains Mono,monospace;font-size:9px;color:rgba(255,100,100,0.7);margin-bottom:16px;">НАЙДИ СИМВОЛ СВЕТА</div><div id="il-timer" style="font-family:Cinzel,serif;font-size:32px;color:#ff4444;margin-bottom:16px;">4</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'+cells+'</div></div>';
    document.body.appendChild(ov);
    var t=4;var cd=setInterval(function(){t--;var e=document.getElementById('il-timer');if(e)e.textContent=t;if(t<=0){clearInterval(cd);Ildabaof._fail(ov);}},1000);
    ov._cd=cd;
},
_pick:function(ok){
    var ov=document.getElementById('ildabaof-ov');if(!ov)return;
    clearInterval(ov._cd);
    if(ok){var b=25+Math.floor(Math.random()*20);if(typeof state!=='undefined')state.totalLight=(state.totalLight||0)+b;if(typeof log==='function')log('МАТРИЦА','✦ Атака отражена! +'+b);var m=document.createElement('div');m.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-size:15px;color:#00faff;z-index:3;';m.textContent='✦ ЛУЧА ВОСПРИЯТИЯ ДОСТАТОЧНО';ov.appendChild(m);setTimeout(function(){ov.remove();Ildabaof._active=false;Ildabaof._schedule();},1500);}
    else{this._fail(ov);}
},
_fail:function(ov){
    var loss=Math.min(60,Math.floor((typeof state!=='undefined'?(state.totalLight||0):0)*0.08));
    if(typeof state!=='undefined')state.totalLight=Math.max(0,(state.totalLight||0)-loss);
    if(typeof log==='function')log('МАТРИЦА','⚠ -'+loss+' света');
    var m=document.createElement('div');m.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;gap:8px;';
    m.innerHTML='<div style="font-family:Cinzel,serif;font-size:15px;color:#ff4444;">🌑 МАТРИЦА СКАЧАЛА СВЕТ</div><div style="font-family:JetBrains Mono,monospace;font-size:10px;color:rgba(255,100,100,0.6);">-'+loss+' света</div>';
    ov.appendChild(m);setTimeout(function(){ov.remove();Ildabaof._active=false;Ildabaof._schedule();},2000);
},
_schedule:function(){this._timer=setTimeout(function(){Ildabaof._attack();},150000+Math.random()*100000);}};

// ── САНКАЛЬПА (намерение дня) ──
var Sankalpa={
INTENTIONS:[
{id:'wisdom',name:'МУДРОСТЬ',icon:'🧠',col:'#aabbff',bonus:'Осознанность +20%',desc:'Буддхи открывается'},
{id:'power',name:'СИЛА',icon:'⚡',col:'#ff8844',bonus:'Тапас ×1.5',desc:'Воля как лазер'},
{id:'love',name:'ЛЮБОВЬ',icon:'🌸',col:'#ff88aa',bonus:'Резонанс +25%',desc:'Анахата открыта'},
{id:'liberation',name:'МОКША',icon:'◎',col:'#ffd700',bonus:'Ключи ×2',desc:'Выход из симуляции'}],
open:function(){
    var m=document.createElement('div');m.id='sankalpa-modal';
    m.style.cssText='position:fixed;inset:0;z-index:99988;background:rgba(0,0,0,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;';
    var cards=this.INTENTIONS.map(function(s){
        return '<div data-sid="'+s.id+'" class="snk-card" style="padding:14px 16px;border-radius:10px;cursor:pointer;background:rgba(255,255,255,0.03);border:1px solid '+s.col+'33;margin-bottom:8px;display:flex;align-items:center;gap:12px;touch-action:manipulation;">'
        +'<div style="font-size:24px;">'+s.icon+'</div>'
        +'<div><div style="font-family:Cinzel,serif;font-size:11px;color:'+s.col+';letter-spacing:0.2em;">'+s.name+'</div>'
        +'<div style="font-family:Cormorant Garamond,serif;font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">'+s.desc+'</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+s.col+';opacity:0.6;margin-top:3px;">'+s.bonus+'</div></div></div>';
    }).join('');
    m.innerHTML='<div style="width:100%;max-width:400px;">'
    +'<div style="font-family:Cinzel Decorative,serif;font-size:14px;color:#c9a84c;letter-spacing:0.2em;text-align:center;margin-bottom:6px;">🕯 САНКАЛЬПА</div>'
    +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:20px;">НАМЕРЕНИЕ ЭТОГО СЕАНСА</div>'
    +cards+'<button id="snk-skip" style="width:100%;padding:10px;margin-top:8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.3);cursor:pointer;">ПРОПУСТИТЬ</button></div>';
    document.body.appendChild(m);
    var skip=m.querySelector('#snk-skip');
    if(skip)skip.onclick=function(){var el=document.getElementById('sankalpa-modal');if(el)el.remove();};
    m.querySelectorAll('.snk-card').forEach(function(card){
        card.onclick=function(){window.AWARA_SYS.Sankalpa.choose(this.dataset.sid);};
    });
},
choose:function(id){
    var s=null;for(var i=0;i<this.INTENTIONS.length;i++){if(this.INTENTIONS[i].id===id){s=this.INTENTIONS[i];break;}}
    if(!s)return;
    localStorage.setItem('awara_sankalpa',id);
    var el=document.getElementById('sankalpa-modal');if(el)el.remove();
    if(typeof log==='function')log('САНКАЛЬПА','🕯 '+s.name+' · '+s.bonus);
    var f=document.createElement('div');f.style.cssText='position:fixed;inset:0;background:'+s.col+'18;z-index:99987;pointer-events:none;transition:opacity 1s;';document.body.appendChild(f);
    setTimeout(function(){f.style.opacity='0';setTimeout(function(){f.remove();},1000);},300);
}};

// ── КЛАССЫ ИГРОКА (Свами Вишнудевананда) ──
var PlayerClass={
CLASSES:{
divya:{name:'ДИВЬЯ',icon:'🌟',col:'#ffd700',desc:'Божественный · Огромный запас заслуг из прошлых жизней',bonus:'Ключи ×1.5 · Просветление за 12 лет'},
vira:{name:'ВИРА',icon:'⚔',col:'#4488ff',desc:'Героический · Воля и интеллект',bonus:'Прокачка сфер ×1.3 · 24 года'},
pashu:{name:'ПАШУ',icon:'🌱',col:'#88cc88',desc:'Обусловленный · Рассеянное внимание',bonus:'Начало очищения · Путь через практику'}},
detect:function(){
    if(localStorage.getItem('awara_player_class'))return;
    var m=document.createElement('div');m.id='class-modal';
    m.style.cssText='position:fixed;inset:0;z-index:99986;background:rgba(0,0,0,0.95);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;';
    var cards=Object.keys(this.CLASSES).map(function(id){
        var c=PlayerClass.CLASSES[id];
        return '<div data-clid="'+id+'" class="cls-card" style="padding:14px 16px;border-radius:10px;cursor:pointer;background:rgba(255,255,255,0.03);border:1px solid '+c.col+'33;margin-bottom:8px;display:flex;align-items:center;gap:12px;touch-action:manipulation;">'
        +'<div style="font-size:28px;">'+c.icon+'</div>'
        +'<div><div style="font-family:Cinzel,serif;font-size:11px;color:'+c.col+';letter-spacing:0.2em;">'+c.name+'</div>'
        +'<div style="font-family:Cormorant Garamond,serif;font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px;">'+c.desc+'</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+c.col+';opacity:0.5;margin-top:3px;">'+c.bonus+'</div></div></div>';
    }).join('');
    m.innerHTML='<div style="width:100%;max-width:380px;">'
    +'<div style="font-family:Cinzel Decorative,serif;font-size:13px;color:#c9a84c;letter-spacing:0.2em;text-align:center;margin-bottom:6px;">⚡ КТО ТЫ В ЭТОЙ СИМУЛЯЦИИ?</div>'
    +'<div style="font-family:Cormorant Garamond,serif;font-size:12px;color:rgba(255,255,255,0.4);text-align:center;margin-bottom:20px;font-style:italic;">Свами Вишнудевананда Гири · Квантовый Маг</div>'
    +cards+'</div>';
    document.body.appendChild(m);
    m.querySelectorAll('.cls-card').forEach(function(card){
        card.onclick=function(){window.AWARA_SYS.PlayerClass.set(this.dataset.clid);};
    });
},
set:function(id){
    localStorage.setItem('awara_player_class',id);
    var el=document.getElementById('class-modal');if(el)el.remove();
    var c=this.CLASSES[id];
    if(typeof log==='function')log('КЛАСС','⚡ '+c.name);
    setTimeout(function(){Sankalpa.open();},600);
}};

// ── ТАПАС ──
var Tapas={
_count:0,_max:100,
add:function(n){
    this._count=Math.min(this._max,this._count+(n||10));this.updateHUD();
    if(this._count>=this._max){this._overflow();this._count=0;}
},
updateHUD:function(){
    var b=document.getElementById('tapas-bar');if(b)b.style.width=(this._count/this._max*100)+'%';
    var l=document.getElementById('tapas-label');if(l)l.textContent='ТАПАС '+Math.round(this._count)+'/'+this._max;
},
_overflow:function(){
    if(typeof state!=='undefined'){var bn=200+Math.floor(Math.random()*200);state.totalLight=(state.totalLight||0)+bn;if(typeof updateProgressPanel==='function')updateProgressPanel();if(typeof log==='function')log('ТАПАС','🔥 Взрыв аскезы! +'+bn+' света');}
    var f=document.createElement('div');f.style.cssText='position:fixed;inset:0;background:rgba(255,100,0,0.2);z-index:99989;pointer-events:none;transition:opacity 1s;';document.body.appendChild(f);
    setTimeout(function(){f.style.opacity='0';setTimeout(function(){f.remove();},1000);},400);
}};

// ── ПАНЕЛЬ СОЗДАТЕЛЯ ──
var CreatorPanel={
toggle:function(){
    // Делегируем в window.creatorMode (рабочая DOM-версия)
    if(typeof window.creatorMode==='function'){ window.creatorMode(); return; }
    var existing=document.getElementById('creator-panel');if(existing){existing.remove();return;}
    var p=document.createElement('div');p.id='creator-panel';
    p.style.cssText='position:fixed;bottom:60px;right:8px;z-index:999999;width:210px;background:rgba(4,2,18,0.97);border:1px solid rgba(201,168,76,0.5);border-radius:14px;padding:16px 14px;box-shadow:0 0 40px rgba(201,168,76,0.25);';
    var lightBtns=[['✧ +50 ИСКРА','#ffaa00',50],['☀ +200 РАССВЕТ','#ffcc44',200],['🌿 +500 ПРОБУЖДЕНИЕ','#44ddaa',500],['💫 +1000 РАСЦВЕТ','#4488ff',1000],['🌌 +2000 ГАРМОНИЯ','#aa44ff',2000],['✦ +5000 КОСМОС','#ffd700',5000]].map(function(x){return '<button onclick="window.AWARA_SYS.CreatorPanel.infuse('+x[2]+')" style="width:100%;padding:7px;border-radius:7px;cursor:pointer;margin-bottom:4px;background:'+x[1]+'08;border:1px solid '+x[1]+'22;font-family:JetBrains Mono,monospace;font-size:7px;color:'+x[1]+';letter-spacing:0.1em;touch-action:manipulation;">'+x[0]+'</button>';}).join('');
    var sphereBtns=[['🌱 УР.1 СЕМЯ','#88cc88',1],['💎 УР.4 КРИСТАЛЛ','#44aacc',4],['⭐ УР.9 КОСМОС','#ffd700',9]].map(function(x){return '<button onclick="window.AWARA_SYS.CreatorPanel.evolve('+x[2]+')" style="width:100%;padding:6px;border-radius:6px;cursor:pointer;margin-bottom:4px;background:'+x[1]+'08;border:1px solid '+x[1]+'22;font-family:JetBrains Mono,monospace;font-size:7px;color:'+x[1]+';touch-action:manipulation;">'+x[0]+'</button>';}).join('');
    p.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;"><div style="font-family:Cinzel Decorative,serif;font-size:10px;color:#ffd700;letter-spacing:0.2em;">\u2726 СОЗДАТЕЛЬ</div><button id="cp-close" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:16px;">\u2715</button></div><div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin-bottom:6px;">ЗАЛИВКА СВЕТОМ РА</div>'+lightBtns+'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin:6px 0;">ЭВОЛЮЦИЯ СФЕР</div>'+sphereBtns+'<div style="display:flex;gap:5px;margin-top:4px;"><button id="cp-reset" style="flex:1;padding:6px;border-radius:6px;cursor:pointer;background:rgba(255,60,60,0.06);border:1px solid rgba(255,60,60,0.2);font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,100,100,0.5);touch-action:manipulation;">\uD83C\uDF11 СБРОС</button><button id="cp-key" style="flex:1;padding:6px;border-radius:6px;cursor:pointer;background:rgba(0,250,255,0.06);border:1px solid rgba(0,250,255,0.2);font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(0,250,255,0.5);touch-action:manipulation;">\uD83D\uDD11 +КЛЮЧ</button></div>';
    var cpClose=p.querySelector('#cp-close');if(cpClose)cpClose.onclick=function(){var el=document.getElementById('creator-panel');if(el)el.remove();};
    var cpReset=p.querySelector('#cp-reset');if(cpReset)cpReset.onclick=function(){window.AWARA_SYS.CreatorPanel.reset();};
    var cpKey=p.querySelector('#cp-key');if(cpKey)cpKey.onclick=function(){if(typeof Keys!=='undefined')Keys.add(1);window.AWARA_SYS.CreatorPanel.toggle();};
    document.body.appendChild(p);
},
infuse:function(amt){
    if(typeof state==='undefined')return;
    var step=Math.max(1,Math.floor(amt/20));var added=0;
    var iv=setInterval(function(){
        var a=Math.min(step,amt-added);state.totalLight=(state.totalLight||0)+a;added+=a;
        if(typeof updateProgressPanel==='function')updateProgressPanel();
        if(added>=amt){clearInterval(iv);UniverseStage.apply();if(typeof log==='function')log('СОЗДАТЕЛЬ','✦ +'+amt+' света');}
    },50);
},
evolve:function(lvl){
    if(typeof configs==='undefined'||typeof state==='undefined')return;
    for(var i=0;i<configs.length;i++){var s=configs[i];if(s.type==='ring'){if(!state.sphereData[s.id])state.sphereData[s.id]={};state.sphereData[s.id].lvl=lvl;state.sphereData[s.id].locked=false;state.sphereData[s.id].circle=lvl<=3?1:lvl<=6?2:lvl<=8?3:4;}}
    if(typeof render==='function')render();if(typeof updateProgressPanel==='function')updateProgressPanel();UniverseStage.apply();if(typeof log==='function')log('СОЗДАТЕЛЬ','✦ Все сферы → ур.'+lvl);
},
reset:function(){
    var el=document.getElementById('creator-panel');if(el)el.remove();
    if(typeof state!=='undefined'){
        state.totalLight=0;
        state.sphereData={};
        if(typeof STARTER_IDS!=='undefined'){
            STARTER_IDS.forEach(function(id){
                state.sphereData[id]={lvl:1,circle:1,isOpen:false,isOwn:true,owner:'ВЫ',lastActivity:Date.now()};
            });
        }
        if(typeof configs!=='undefined'){
            configs.forEach(function(s){
                if(s.type==='ring'&&!state.sphereData[s.id])
                    state.sphereData[s.id]={lvl:0,circle:0,locked:true};
            });
        }
        try{
            var clean={totalLight:0,sphereData:state.sphereData,spirit:state.spirit,elements:state.elements,journey:[]};
            localStorage.setItem('awara_v255_state',JSON.stringify(clean));
        }catch(e){}
    }
    if(typeof render==='function')render();
    if(typeof updateProgressPanel==='function')updateProgressPanel();
    if(typeof UniverseStage!=='undefined')UniverseStage.apply();
    if(typeof log==='function')log('СОЗДАТЕЛЬ','🌑 Вселенная сброшена в Пустоту');
}};

// ── ИНИЦИАЛИЗАЦИЯ ──
function init(){
    if(typeof state!=='undefined'&&!state._orbitColors)state._orbitColors=ORBIT_COLORS;
    UniverseStage.apply();PerceptionMatrix.restore();
    setTimeout(function(){Ildabaof.start();},30000);
    setTimeout(function(){
        if(!localStorage.getItem('awara_player_class'))PlayerClass.detect();
        else{var today=new Date().toDateString();if(localStorage.getItem('awara_sankalpa_day')!==today){localStorage.setItem('awara_sankalpa_day',today);Sankalpa.open();}}
    },3000);
    // Кнопка Создателя в топбаре
    setTimeout(function(){
        var tb=document.getElementById('awara-topbar');
        // кнопка СОЗДАТЕЛЬ уже есть в топбаре HTML
        // Тапас HUD
        var progBody=document.querySelector('#progress-panel .panel-body');
        if(progBody&&!document.getElementById('tapas-hud')){
            var h=document.createElement('div');h.id='tapas-hud';
            h.style.cssText='padding:6px 0 2px;border-top:1px solid rgba(255,255,255,0.06);margin-top:6px;';
            h.innerHTML='<div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span id="tapas-label" style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,100,0,0.5);">ТАПАС 0/100</span><span style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.2);">🔥</span></div><div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;"><div id="tapas-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#ff4400,#ffaa00);border-radius:2px;transition:width 0.5s;"></div></div>';
            progBody.appendChild(h);
        }
        // Universe stage label
        if(progBody&&!document.getElementById('universe-stage-label')){
            var l=document.createElement('div');l.id='universe-stage-label';
            l.style.cssText='font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(201,168,76,0.4);letter-spacing:0.2em;text-align:center;padding:3px 0;';l.textContent='ПУСТОТА';
            progBody.insertBefore(l,progBody.firstChild);
        }
        // 3D preview в sphere-modal
        var sph=document.getElementById('sphere-modal');
        if(sph&&!document.getElementById('sphere-3d-preview')){
            var prev=document.createElement('div');prev.id='sphere-3d-preview';
            prev.style.cssText='width:100%;height:130px;position:relative;flex-shrink:0;background:radial-gradient(ellipse at 50% 60%,rgba(10,5,30,0.9),rgba(2,1,8,1));overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.06);';
            prev.innerHTML='<canvas id="sphere-3d-canvas" style="position:absolute;inset:0;width:100%;height:100%;"></canvas><div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;pointer-events:none;"><div id="sphere-3d-name" style="font-family:Cinzel Decorative,serif;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.25em;"></div><div id="sphere-3d-form" style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.2);margin-top:2px;"></div></div>';
            sph.insertBefore(prev,sph.firstChild);
        }
    },1500);
    // Тапас за ключи
    if(typeof Keys!=='undefined'){var origAdd=Keys.add.bind(Keys);Keys.add=function(n){origAdd(n||1);Tapas.add(20);};}
    // Обновление каждые 10 сек
    setInterval(function(){UniverseStage.apply();Tapas.updateHUD();},10000);
}

return {init:init,PerceptionMatrix:PerceptionMatrix,UniverseStage:UniverseStage,Onboarding:Onboarding,Ildabaof:Ildabaof,CreatorPanel:CreatorPanel,Sankalpa:Sankalpa,Tapas:Tapas,PlayerClass:PlayerClass,DayData:DayData};
})();

// ── ФУНКЦИИ КАЛЕНДАРЯ ──
window.openCalendarModal = function() {
    var modal = document.getElementById('calendar-modal');
    if(!modal) return;

    var content = document.getElementById('calendar-modal-content');
    if(!content) return;

    // Принудительно обновляем данные для текущей матрицы
    var matrixId = window._calendarMatrixId || localStorage.getItem('awara_matrix') || 'shambhala';
    console.log('openCalendarModal: matrixId =', matrixId);
    if(window.AWARA_SYS && window.AWARA_SYS.DayData) {
        window.AWARA_SYS.DayData.update(matrixId);
    }

    if(!window._calendarData) return;

    var data = window._calendarData;
    console.log('openCalendarModal: data =', data);
    var mName = window._calendarMatrix || 'КАЛЕНДАРЬ';
    var icon = window._calendarIcon || '◎';
    var col = window._calendarCol || '#aaccff';

    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');

    // Год восточного календаря
    var animals = [
        {name:'Крысы',icon:'🐀',desc:'<b>Год Крысы</b> — первый в 12-летнем цикле, символ нового начала и накопления.<br><br><b>Энергия:</b> Хитрость, предусмотрительность, умение находить возможности там, где другие их не видят. Крыса — мастер выживания и адаптации.<br><br><b>Стихия:</b> Вода (мудрость, гибкость)<br><b>Время суток:</b> 23:00-01:00<br><b>Сезон:</b> Начало зимы<br><br><b>Благоприятно:</b> Начинать новые проекты, копить ресурсы, строить долгосрочные планы, налаживать связи, учиться новому.<br><br><b>Избегать:</b> Расточительства, импульсивных решений, открытых конфликтов.<br><br><b>Практика:</b> Медитация на изобилие, работа с намерениями, планирование на 12 лет вперёд.'},
        {name:'Быка',icon:'🐂',desc:'<b>Год Быка</b> — символ труда, терпения и материального благополучия.<br><br><b>Энергия:</b> Упорство, надёжность, методичность. Бык пашет землю — превращает усилия в результат. Год укрепления фундамента.<br><br><b>Стихия:</b> Земля (стабильность, плодородие)<br><b>Время суток:</b> 01:00-03:00<br><b>Сезон:</b> Глубокая зима<br><br><b>Благоприятно:</b> Тяжёлая работа, строительство, земледелие, укрепление здоровья, накопление капитала, семейные дела.<br><br><b>Избегать:</b> Спешки, риска, перемен ради перемен, легкомыслия.<br><br><b>Практика:</b> Работа с телом (йога, цигун), заземление, ритуалы изобилия, благодарность земле.'},
        {name:'Тигра',icon:'🐅',desc:'<b>Год Тигра</b> — символ смелости, страсти и непредсказуемых перемен.<br><br><b>Энергия:</b> Сила, храбрость, независимость. Тигр — царь джунглей, не знающий страха. Год прорывов и революций.<br><br><b>Стихия:</b> Дерево (рост, экспансия)<br><b>Время суток:</b> 03:00-05:00<br><b>Сезон:</b> Конец зимы, пробуждение<br><br><b>Благоприятно:</b> Смелые действия, борьба за справедливость, защита слабых, путешествия в неизведанное, духовные прорывы.<br><br><b>Избегать:</b> Безрассудства, агрессии без причины, игнорирования опасности.<br><br><b>Практика:</b> Работа со страхами, практики силы (боевые искусства), огненные медитации, призыв духа воина.'},
        {name:'Кролика',icon:'🐇',desc:'<b>Год Кролика (Кота)</b> — символ дипломатии, изящества и гармонии.<br><br><b>Энергия:</b> Мягкость, чувствительность, интуиция. Кролик избегает конфликтов, но всегда находит выход. Год восстановления после бурь.<br><br><b>Стихия:</b> Дерево (гибкость, рост)<br><b>Время суток:</b> 05:00-07:00<br><b>Сезон:</b> Весна, пробуждение природы<br><br><b>Благоприятно:</b> Дипломатия, искусство, красота, отношения, исцеление, мягкие практики, работа с эмоциями.<br><br><b>Избегать:</b> Прямых столкновений, грубости, спешки, насилия.<br><br><b>Практика:</b> Медитации любящей доброты, работа с сердечной чакрой, искусство, общение с природой.'},
        {name:'Дракона',icon:'🐉',desc:'<b>Год Дракона</b> — самый мощный и благоприятный год цикла, символ магии и трансформации.<br><br><b>Энергия:</b> Сила, величие, магия, удача. Дракон соединяет небо и землю, дух и материю. Год великих свершений и чудес.<br><br><b>Стихия:</b> Земля (проявление силы)<br><b>Время суток:</b> 07:00-09:00<br><b>Сезон:</b> Середина весны<br><br><b>Благоприятно:</b> Амбициозные проекты, духовные практики, магия, лидерство, творчество, трансформация жизни, рождение детей.<br><br><b>Избегать:</b> Гордыни, высокомерия, игнорирования деталей.<br><br><b>Практика:</b> Работа с Кундалини, призыв драконов, алхимия, высшая магия, активация всех чакр.'},
        {name:'Змеи',icon:'🐍',desc:'<b>Год Змеи</b> — символ мудрости, трансформации и тайного знания.<br><br><b>Энергия:</b> Интуиция, проницательность, обновление. Змея сбрасывает кожу — символ перерождения. Год глубоких изменений и познания тайн.<br><br><b>Стихия:</b> Огонь (трансформация)<br><b>Время суток:</b> 09:00-11:00<br><b>Сезон:</b> Конец весны<br><br><b>Благоприятно:</b> Обучение эзотерике, медитация, работа с подсознанием, исцеление, избавление от старого, познание тайн.<br><br><b>Избегать:</b> Обмана, манипуляций, излишней скрытности, ядовитых отношений.<br><br><b>Практика:</b> Кундалини-йога, работа с энергией позвоночника, шаманизм, гадания, сновидения.'},
        {name:'Лошади',icon:'🐎',desc:'<b>Год Лошади</b> — символ свободы, движения и страсти к жизни.<br><br><b>Энергия:</b> Скорость, независимость, энтузиазм. Лошадь несётся вперёд, не оглядываясь. Год путешествий и приключений.<br><br><b>Стихия:</b> Огонь (страсть, движение)<br><b>Время суток:</b> 11:00-13:00<br><b>Сезон:</b> Начало лета<br><br><b>Благоприятно:</b> Путешествия, спорт, активность, романтика, следование зову сердца, перемены места жительства.<br><br><b>Избегать:</b> Застоя, рутины, ограничений свободы, подавления эмоций.<br><br><b>Практика:</b> Динамические медитации, танец, бег, работа с сексуальной энергией, практики свободы.'},
        {name:'Козы',icon:'🐐',desc:'<b>Год Козы (Овцы)</b> — символ творчества, гармонии и заботы.<br><br><b>Энергия:</b> Мягкость, артистизм, миролюбие. Коза создаёт красоту и уют. Год искусства и семейного счастья.<br><br><b>Стихия:</b> Земля (плодородие, забота)<br><b>Время суток:</b> 13:00-15:00<br><b>Сезон:</b> Середина лета<br><br><b>Благоприятно:</b> Творчество, искусство, семья, дети, благотворительность, создание красоты, садоводство, рукоделие.<br><br><b>Избегать:</b> Конфликтов, жёсткости, эгоизма, разрушения.<br><br><b>Практика:</b> Творческие практики, мантры красоты, работа с Венерой, создание мандал, пение.'},
        {name:'Обезьяны',icon:'🐒',desc:'<b>Год Обезьяны</b> — символ ума, хитрости и игривости.<br><br><b>Энергия:</b> Интеллект, изобретательность, юмор. Обезьяна решает задачи нестандартно. Год инноваций и неожиданных решений.<br><br><b>Стихия:</b> Металл (ясность ума)<br><b>Время суток:</b> 15:00-17:00<br><b>Сезон:</b> Конец лета<br><br><b>Благоприятно:</b> Обучение, наука, технологии, игры, эксперименты, нестандартные решения, торговля, коммуникации.<br><br><b>Избегать:</b> Обмана, легкомыслия, разбрасывания энергии, хаоса.<br><br><b>Практика:</b> Медитации на ясность ума, работа с Меркурием, мантры мудрости, интеллектуальные игры.'},
        {name:'Петуха',icon:'🐓',desc:'<b>Год Петуха</b> — символ точности, порядка и честности.<br><br><b>Энергия:</b> Дисциплина, пунктуальность, прямота. Петух возвещает рассвет — символ пробуждения сознания. Год наведения порядка.<br><br><b>Стихия:</b> Металл (структура, чёткость)<br><b>Время суток:</b> 17:00-19:00<br><b>Сезон:</b> Начало осени<br><br><b>Благоприятно:</b> Организация, планирование, честность, справедливость, очищение, ритуалы, точные науки.<br><br><b>Избегать:</b> Хаоса, лжи, беспорядка, опозданий, неопределённости.<br><br><b>Практика:</b> Утренние практики, мантры истины, очищающие ритуалы, работа с дисциплиной.'},
        {name:'Собаки',icon:'🐕',desc:'<b>Год Собаки</b> — символ верности, защиты и служения.<br><br><b>Энергия:</b> Преданность, честность, защита. Собака — друг человека, хранитель дома. Год укрепления связей и взаимопомощи.<br><br><b>Стихия:</b> Земля (надёжность, верность)<br><b>Время суток:</b> 19:00-21:00<br><b>Сезон:</b> Середина осени<br><br><b>Благоприятно:</b> Дружба, семья, защита близких, служение обществу, благотворительность, работа с животными.<br><br><b>Избегать:</b> Предательства, эгоизма, жестокости, одиночества.<br><br><b>Практика:</b> Практики преданности (бхакти), работа с сердцем, защитные ритуалы, служение.'},
        {name:'Свиньи',icon:'🐖',desc:'<b>Год Свиньи (Кабана)</b> — последний в цикле, символ изобилия и завершения.<br><br><b>Энергия:</b> Щедрость, наслаждение, завершение циклов. Свинья — символ достатка и удовлетворения. Год пожинания плодов.<br><br><b>Стихия:</b> Вода (изобилие, течение)<br><b>Время суток:</b> 21:00-23:00<br><b>Сезон:</b> Конец осени, подготовка к зиме<br><br><b>Благоприятно:</b> Завершение проектов, празднования, наслаждение жизнью, щедрость, прощение, подготовка к новому циклу.<br><br><b>Избегать:</b> Жадности, излишеств, лени, застревания в прошлом.<br><br><b>Практика:</b> Практики благодарности, ритуалы изобилия, прощение, завершение кармических циклов.'}
    ];
    var yearIndex = (now.getFullYear() - 4) % 12;
    var animal = animals[yearIndex];

    // 7 Лучей Шамбалы
    var rays = [
        {name:'Любовь',desc:'<b>II Луч Любви-Мудрости</b> — центральный луч нашей Солнечной системы.<br><br><b>Качество:</b> Объединяющая любовь, мудрость через опыт, понимание единства всего сущего.<br><br><b>Планета:</b> Юпитер (расширение, благословение)<br><b>Цвет:</b> Индиго-синий<br><b>Чакра:</b> Сердечная (Анахата)<br><br><b>Проявление:</b> Учителя, целители, философы, те кто объединяет людей. Способность видеть божественное в каждом.<br><br><b>Тень:</b> Холодная отстранённость, эмоциональная закрытость под маской мудрости.<br><br><b>Практика дня:</b> Медитация любящей доброты (метта), созерцание единства, служение через понимание. Работа с сердечной чакрой.<br><br><b>Мантра:</b> "Я есть Любовь и Мудрость, проявленные"'},
        {name:'Воля',desc:'<b>I Луч Воли и Могущества</b> — луч божественной цели и силы духа.<br><br><b>Качество:</b> Несгибаемая воля, власть духа над материей, способность проявлять замысел в реальность.<br><br><b>Планета:</b> Вулкан (скрытая сила), Плутон (трансформация)<br><b>Цвет:</b> Красный<br><b>Чакра:</b> Сахасрара (коронная)<br><br><b>Проявление:</b> Лидеры, правители, те кто меняют ход истории. Способность держать фокус и не отступать.<br><br><b>Тень:</b> Тирания, жестокость, подавление других своей волей.<br><br><b>Практика дня:</b> Работа с намерением, визуализация целей, практики силы воли. Медитация на божественную волю.<br><br><b>Мантра:</b> "Да будет Воля Твоя"'},
        {name:'Интеллект',desc:'<b>III Луч Активного Интеллекта</b> — луч творческого созидания и практического применения знаний.<br><br><b>Качество:</b> Ясность мышления, способность создавать формы, манипулировать материей через понимание её законов.<br><br><b>Планета:</b> Сатурн (структура, форма)<br><b>Цвет:</b> Жёлтый<br><b>Чакра:</b> Манипура (солнечное сплетение)<br><br><b>Проявление:</b> Учёные, инженеры, маги, бизнесмены. Те кто воплощают идеи в материю.<br><br><b>Тень:</b> Хитрость, манипуляции, использование знаний для контроля.<br><br><b>Практика дня:</b> Изучение, эксперименты, создание чего-то материального. Работа с ментальным телом.<br><br><b>Мантра:</b> "Я творю с мудростью и любовью"'},
        {name:'Гармония',desc:'<b>IV Луч Гармонии через Конфликт</b> — луч человечества, красоты рождённой через борьбу.<br><br><b>Качество:</b> Способность находить баланс противоположностей, создавать красоту из хаоса, быть мостом между мирами.<br><br><b>Планета:</b> Меркурий (посредник)<br><b>Цвет:</b> Изумрудно-зелёный<br><b>Чакра:</b> Анахата (сердце) и Аджна (третий глаз)<br><br><b>Проявление:</b> Художники, дипломаты, те кто разрешают конфликты. Способность видеть красоту в несовершенстве.<br><br><b>Тень:</b> Вечная борьба, неспособность выбрать сторону, драматизация.<br><br><b>Практика дня:</b> Творчество, работа с противоположностями, поиск баланса. Искусство как медитация.<br><br><b>Мантра:</b> "Через конфликт рождается гармония"'},
        {name:'Знание',desc:'<b>V Луч Конкретного Знания и Науки</b> — луч точного познания и систематизации.<br><br><b>Качество:</b> Научный подход, точность, способность видеть детали и закономерности. Знание через исследование.<br><br><b>Планета:</b> Венера (различение прекрасного)<br><b>Цвет:</b> Оранжевый<br><b>Чакра:</b> Аджна (третий глаз)<br><br><b>Проявление:</b> Исследователи, врачи, аналитики. Те кто систематизируют знания и делают их доступными.<br><br><b>Тень:</b> Холодный рационализм, отрицание того что нельзя измерить, догматизм.<br><br><b>Практика дня:</b> Научные исследования, изучение деталей, систематизация знаний. Развитие наблюдательности.<br><br><b>Мантра:</b> "Знание есть свет"'},
        {name:'Преданность',desc:'<b>VI Луч Преданности и Идеализма</b> — луч веры, устремления к высшему.<br><br><b>Качество:</b> Однонаправленная преданность идеалу, способность вдохновлять других, жертвенность ради высшей цели.<br><br><b>Планета:</b> Марс (страсть) и Нептун (мистицизм)<br><b>Цвет:</b> Розово-красный<br><b>Чакра:</b> Анахата (сердце) и Манипура (воля)<br><br><b>Проявление:</b> Мистики, религиозные лидеры, идеалисты. Те кто живут ради высшей цели.<br><br><b>Тень:</b> Фанатизм, слепая вера, нетерпимость к другим путям.<br><br><b>Практика дня:</b> Бхакти-йога, молитва, служение идеалу. Работа с верой и преданностью.<br><br><b>Мантра:</b> "Я служу Свету"'},
        {name:'Порядок',desc:'<b>VII Луч Церемониального Порядка и Магии</b> — луч проявления духовного в физическом через ритуал.<br><br><b>Качество:</b> Организация, ритуал, способность создавать священное пространство. Магия как наука о соответствиях.<br><br><b>Планета:</b> Уран (новый порядок)<br><b>Цвет:</b> Фиолетовый<br><b>Чакра:</b> Муладхара (корневая) и Сахасрара (коронная)<br><br><b>Проявление:</b> Маги, священники, организаторы. Те кто создают структуры для проявления духовного.<br><br><b>Тень:</b> Пустой ритуализм, жёсткость форм, магия для эго.<br><br><b>Практика дня:</b> Ритуалы, создание священного пространства, работа с символами. Церемониальная магия.<br><br><b>Мантра:</strong> "Дух проявляется через форму"'}
    ];
    var dayOfWeek = now.getDay();

    // Элементы Калачакры
    var elements = [
        {name:'🌳 Дерево',desc:'<b>Элемент Дерево (Му)</b> — первоэлемент роста, расширения и весны.<br><br><b>Качество:</b> Восхождение, развитие, гибкость, жизненная сила. Энергия пробуждения и новых начинаний.<br><br><b>Направление:</b> Восток<br><b>Сезон:</b> Весна<br><b>Время суток:</b> Утро (3:00-9:00)<br><b>Цвет:</b> Зелёный, изумрудный<br><b>Планета:</b> Юпитер<br><br><b>Органы:</b> Печень, желчный пузырь, глаза<br><b>Эмоция:</b> Гнев (в дисбалансе), доброта (в балансе)<br><br><b>Характеристики года:</b> Годы Дерева благоприятны для роста, обучения, начала новых проектов. Время экспансии и развития.<br><br><b>Практика:</b> Цигун, тай-чи, работа с печенью, весенние очищения, посадка растений, планирование будущего.<br><br><b>Питание:</b> Зелёные овощи, кислые вкусы, ростки.'},
        {name:'🔥 Огонь',desc:'<b>Элемент Огонь (Хо)</b> — элемент трансформации, страсти и лета.<br><br><b>Качество:</b> Преобразование, активность, яркость, тепло. Энергия максимального проявления и расцвета.<br><br><b>Направление:</b> Юг<br><b>Сезон:</b> Лето<br><b>Время суток:</b> Полдень (9:00-15:00)<br><b>Цвет:</b> Красный, алый<br><b>Планета:</b> Марс<br><br><b>Органы:</b> Сердце, тонкий кишечник, язык<br><b>Эмоция:</b> Радость, восторг<br><br><b>Характеристики года:</b> Годы Огня — время страсти, активности, публичности. Период максимальной видимости и влияния.<br><br><b>Практика:</b> Огненные медитации, работа с сердцем, кардио-практики, солнечные ритуалы, работа со страстью.<br><br><b>Питание:</b> Горькие вкусы, красные продукты, специи.'},
        {name:'🌍 Земля',desc:'<b>Элемент Земля (Ту)</b> — элемент стабильности, плодородия и центра.<br><br><b>Качество:</b> Укоренение, питание, стабильность, материализация. Энергия центра, которая удерживает всё остальное.<br><br><b>Направление:</b> Центр<br><b>Сезон:</b> Межсезонье (переходы)<br><b>Время суток:</b> Переходные часы<br><b>Цвет:</b> Жёлтый, охра<br><b>Планета:</b> Сатурн<br><br><b>Органы:</b> Селезёнка, желудок, рот<br><b>Эмоция:</b> Беспокойство (в дисбалансе), сострадание (в балансе)<br><br><b>Характеристики года:</b> Годы Земли — время укрепления, строительства, работы с материей. Период стабилизации и накопления.<br><br><b>Практика:</b> Заземление, работа с телом, садоводство, строительство, ритуалы изобилия.<br><br><b>Питание:</b> Сладкие вкусы, корнеплоды, злаки.'},
        {name:'⚔ Металл',desc:'<b>Элемент Металл (Цзинь)</b> — элемент структуры, ясности и осени.<br><br><b>Качество:</b> Концентрация, очищение, кристаллизация, ценность. Энергия сжатия и уплотнения сути.<br><br><b>Направление:</b> Запад<br><b>Сезон:</b> Осень<br><b>Время суток:</b> Вечер (15:00-21:00)<br><b>Цвет:</b> Белый, серебряный<br><b>Планета:</b> Венера<br><br><b>Органы:</b> Лёгкие, толстый кишечник, нос<br><b>Эмоция:</b> Печаль (в дисбалансе), мужество (в балансе)<br><br><b>Характеристики года:</b> Годы Металла — время структурирования, очищения, отсечения лишнего. Период кристаллизации опыта.<br><br><b>Практика:</b> Дыхательные практики, очищения, работа с ценностями, медитации на пустоту.<br><br><b>Питание:</b> Острые вкусы, белые продукты, лук, чеснок.'},
        {name:'💧 Вода',desc:'<b>Элемент Вода (Шуй)</b> — элемент глубины, мудрости и зимы.<br><br><b>Качество:</b> Погружение, текучесть, адаптация, накопление. Энергия глубины и внутреннего знания.<br><br><b>Направление:</b> Север<br><b>Сезон:</b> Зима<br><b>Время суток:</b> Ночь (21:00-3:00)<br><b>Цвет:</b> Чёрный, тёмно-синий<br><b>Планета:</b> Меркурий<br><br><b>Органы:</b> Почки, мочевой пузырь, уши<br><b>Эмоция:</b> Страх (в дисбалансе), мудрость (в балансе)<br><br><b>Характеристики года:</b> Годы Воды — время внутренней работы, накопления сил, познания глубин. Период мудрости и адаптации.<br><br><b>Практика:</b> Медитация, работа с подсознанием, водные практики, работа со страхами, изучение тайных знаний.<br><br><b>Питание:</b> Солёные вкусы, морепродукты, тёмные продукты.'}
    ];

    var html = '';

    // Время (всегда показываем)
    html += '<div onclick="showCalendarDetail(\'time\')" style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);border-radius:8px;padding:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.background=\'rgba(255,215,0,0.15)\'" onmouseout="this.style.background=\'rgba(255,215,0,0.08)\'">';
    html += '<div style="font-size:9px;color:rgba(255,215,0,0.5);margin-bottom:6px;">ВРЕМЯ</div>';
    html += '<div style="font-size:20px;color:#ffd700;">' + hours + ':' + minutes + '</div>';
    html += '</div>';

    // Характеристики из матрицы
    var fields = [
        {label: data.label1, value: data.val1, color: data.col1 || col, type: 'field1'},
        {label: data.label2, value: data.val2, color: data.col2 || col, type: 'field2'},
        {label: data.label3, value: data.val3, color: data.col3 || col, type: 'field3'},
        {label: data.label4, value: data.val4, color: data.col4 || col, type: 'field4'}
    ];

    fields.forEach(function(f, idx) {
        if(!f.value) return;
        html += '<div onclick="showCalendarDetail(\'' + f.type + '\')" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.03)\'">';
        html += '<div style="font-size:9px;color:rgba(255,255,255,0.4);margin-bottom:6px;">' + f.label + '</div>';
        html += '<div style="font-size:12px;color:' + f.color + ';">' + f.value + '</div>';
        html += '</div>';
    });

    content.innerHTML = html;
    modal.style.display = 'flex';

    // Сохраняем данные для детальных описаний
    if(matrixId === 'slavic') {
        // Для славянского календаря - свои массивы
        var SLAVIC_GODS=['Перун','Велес','Макошь','Сварог','Лада','Стрибог','Морена','Даждьбог','Хорс','Ярило','Купала','Семаргл','Тригла','Чернобог','Белобог','Род'];
        var SLAVIC_ELEM=['Огонь','Земля','Вода','Воздух','Эфир','Металл','Дерево','Свет','Тьма'];
        var SLAVIC_DAYS_ARR=['День Богов','День Предков','День Природы','День Человека','День Земли','День Неба','День Огня','День Воды','День Воздуха'];
        window._calendarDetails = {
            slavicGods: SLAVIC_GODS,
            slavicElements: SLAVIC_ELEM,
            slavicDays: SLAVIC_DAYS_ARR,
            data: data
        };
    } else if(matrixId === 'maya') {
        // Для майянского календаря
        window._calendarDetails = {
            mayaData: data,
            data: data
        };
    } else if(matrixId === 'gene') {
        // Для Генных Ключей
        window._calendarDetails = {
            geneData: data,
            data: data
        };
    } else if(matrixId === 'shambhala') {
        // Для Шамбалы
        window._calendarDetails = {
            shambhalaData: data,
            data: data
        };
    } else {
        // Для остальных матриц - старые массивы
        window._calendarDetails = {
            animals: animals,
            rays: rays,
            elements: elements,
            data: data
        };
    }
};

window.closeCalendarModal = function() {
    var modal = document.getElementById('calendar-modal');
    if(modal) modal.style.display = 'none';
};

window.showCalendarDetail = function(type, index) {
    if(!window._calendarDetails) return;

    var details = window._calendarDetails;
    var matrixId = window._calendarMatrixId || localStorage.getItem('awara_matrix') || 'shambhala'; // ID текущей матрицы
    var title = '';
    var desc = '';
    var color = '#aaccff';

    if(type === 'time') {
        var now = new Date();
        var hour = now.getHours();
        title = '⏰ Время дня';
        if(hour >= 5 && hour < 12) {
            desc = '<b>Утро (5:00-12:00)</b> — время пробуждения, новых начинаний и максимальной ясности сознания.<br><br><b>Энергия:</b> Восходящая, янская, активирующая. Прана поднимается вверх, ум свеж и восприимчив.<br><br><b>Стихия:</b> Дерево (рост) и Огонь (активация)<br><b>Чакры:</b> Активны верхние чакры (Аджна, Сахасрара)<br><br><b>Благоприятно:</b><br>• Важные решения и планирование<br>• Духовные практики (медитация, пранаяма)<br>• Физические упражнения<br>• Обучение и усвоение информации<br>• Творческая работа<br><br><b>Избегать:</b> Тяжёлой пищи, конфликтов, траты энергии на мелочи.<br><br><b>Практика:</b> Сурья Намаскар (приветствие солнцу), утренняя медитация, холодный душ, пранаяма.';
            color = '#ffd700';
        } else if(hour >= 12 && hour < 17) {
            desc = '<b>День (12:00-17:00)</b> — время максимальной активности, проявления и взаимодействия с миром.<br><br><b>Энергия:</b> Пиковая, янская, экспансивная. Огонь пищеварения и действия на максимуме.<br><br><b>Стихия:</b> Огонь (пик активности)<br><b>Чакры:</b> Манипура (солнечное сплетение), Анахата (сердце)<br><br><b>Благоприятно:</b><br>• Активная деятельность и реализация планов<br>• Социальные взаимодействия<br>• Физическая работа<br>• Основной приём пищи<br>• Публичные выступления<br><br><b>Избегать:</b> Медитации (ум слишком активен), сна, пассивности.<br><br><b>Практика:</b> Динамические практики, карма-йога (действие), мантры силы.';
            color = '#ffaa00';
        } else if(hour >= 17 && hour < 21) {
            desc = '<b>Вечер (17:00-21:00)</b> — время завершения дел, подведения итогов и перехода к покою.<br><br><b>Энергия:</b> Нисходящая, переход от ян к инь. Прана начинает опускаться вниз.<br><br><b>Стихия:</b> Металл (концентрация) и Земля (заземление)<br><b>Чакры:</b> Средние и нижние чакры активируются<br><br><b>Благоприятно:</b><br>• Завершение начатого<br>• Лёгкая пища<br>• Общение с близкими<br>• Рефлексия и анализ дня<br>• Подготовка ко сну<br><br><b>Избегать:</b> Начала новых дел, тяжёлой пищи, конфликтов, перевозбуждения.<br><br><b>Практика:</b> Инь-йога, благодарность, дневник, лёгкая прогулка.';
            color = '#ff8844';
        } else {
            desc = '<b>Ночь (21:00-5:00)</b> — время покоя, восстановления, внутренней работы и доступа к тонким планам.<br><br><b>Энергия:</b> Иньская, нисходящая, восстанавливающая. Прана уходит вглубь, открывается подсознание.<br><br><b>Стихия:</b> Вода (глубина) и Металл (тишина)<br><b>Чакры:</b> Муладхара (корень), Свадхистана (сакральная)<br><br><b>Благоприятно:</b><br>• Сон (особенно 22:00-2:00)<br>• Медитация и созерцание<br>• Работа со снами<br>• Магические практики<br>• Внутренняя алхимия<br><br><b>Особые часы:</b><br>• 00:00-3:00 — "час волка", время духов и магии<br>• 3:00-5:00 — Брахма-мухурта, лучшее время для духовных практик<br><br><b>Избегать:</b> Активности, яркого света, тяжёлой пищи, стимуляторов.<br><br><b>Практика:</b> Йога-нидра, осознанные сновидения, ночные медитации.';
            color = '#6688ff';
        }
    } else if(type === 'year') {
        var animal = details.animals[index];
        title = animal.icon + ' Год ' + animal.name;
        desc = animal.desc;
        color = '#ff8844';
    } else if(type === 'ray') {
        var ray = details.rays[index];
        title = '✦ ' + ray.name;
        desc = ray.desc;
        color = '#aaccff';
    } else if(type === 'field2' && details.data.label2 === 'ЭЛЕМЕНТ' && matrixId !== 'shambhala') {
        // Определяем индекс элемента по значению
        var elemIdx = -1;
        details.elements.forEach(function(el, i) {
            if(details.data.val2.includes(el.name.split(' ')[1])) elemIdx = i;
        });
        if(elemIdx >= 0) {
            var elem = details.elements[elemIdx];
            title = elem.name;
            desc = elem.desc;
            color = details.data.col2 || '#aaccff';
        }
    } else if(type === 'field3' && details.data.label3 === 'ФАЗА ГОДА') {
        title = details.data.val3;
        if(details.data.val3.includes('Брахмы')) {
            desc = '<b>☀ День Брахмы</b> — светлая половина года (март-август), период расширения и внешней активности.<br><br><b>Символизм:</b> Брахма — творец, созидатель форм. Его день — время проявления потенциала в материю.<br><br><b>Энергия:</b> Янская, экспансивная, восходящая. Солнце поднимается высоко, дни длинные, природа расцветает.<br><br><b>Стихии:</b> Дерево (весна) → Огонь (лето)<br><b>Направление:</b> Восток → Юг<br><br><b>Благоприятно:</b><br>• Начало новых проектов<br>• Путешествия и исследования<br>• Публичная деятельность<br>• Расширение бизнеса<br>• Социальная активность<br>• Физическая активность<br>• Свадьбы и празднования<br><br><b>Практика:</b> Янские практики, активные медитации, работа в мире, карма-йога, солнечные ритуалы.<br><br><b>Совет:</b> Используй энергию роста для проявления своих целей во внешнем мире.';
            color = '#ffd700';
        } else {
            desc = '<b>🌙 Ночь Вишну</b> — тёмная половина года (сентябрь-февраль), период сжатия и внутренней работы.<br><br><b>Символизм:</b> Вишну — хранитель, тот кто поддерживает космический порядок. Его ночь — время сохранения и углубления.<br><br><b>Энергия:</b> Иньская, интровертная, нисходящая. Солнце низко, дни короткие, природа уходит в себя.<br><br><b>Стихии:</b> Металл (осень) → Вода (зима)<br><b>Направление:</b> Запад → Север<br><br><b>Благоприятно:</b><br>• Медитация и духовные практики<br>• Обучение и изучение<br>• Внутренняя работа<br>• Планирование будущего<br>• Работа с подсознанием<br>• Очищение и детоксикация<br>• Завершение старых дел<br><br><b>Практика:</b> Иньские практики, созерцательные медитации, работа со снами, изучение эзотерики, лунные ритуалы.<br><br><b>Совет:</b> Используй время тишины для накопления сил и познания внутренних миров.';
            color = '#6688ff';
        }
    } else if(type === 'field4' && details.data.label4 === 'ЦИКЛ 60') {
        title = details.data.val4;
        if(details.data.val4.includes('Белая')) {
            desc = '<b>⚪ Белая половина 60-летнего цикла</b> (годы 31-50) — период зрелости и максимального проявления.<br><br><b>Символизм:</b> Белый цвет — свет, ясность, полнота проявления. Это пик жизненного цикла.<br><br><b>Характеристики:</b><br>• Годы 31-40: Зрелость, мастерство, авторитет<br>• Годы 41-50: Пик силы, максимальное влияние<br><br><b>Энергия:</b> Стабильная, мощная, уверенная. Опыт накоплен, сила на пике.<br><br><b>Для личности (возраст 31-50):</b><br>• Время наибольших достижений<br>• Реализация накопленного опыта<br>• Период максимального влияния<br>• Передача знаний ученикам<br>• Создание наследия<br><br><b>Для года в цикле:</b><br>• Стабильность и предсказуемость<br>• Благоприятно для серьёзных дел<br>• Время пожинать плоды прошлых усилий<br>• Укрепление позиций<br><br><b>Практика:</b> Реализация целей, наставничество, создание структур, работа с властью и ответственностью.<br><br><b>Совет:</b> Используй накопленную мудрость для максимального проявления в мире.';
            color = '#dddddd';
        } else {
            desc = '<b>⚫ Чёрная половина 60-летнего цикла</b> (годы 1-30 и 51-60) — период обучения или завершения.<br><br><b>Символизм:</b> Чёрный цвет — тайна, потенциал, начало и конец. Время накопления или передачи.<br><br><b>Две фазы:</b><br><br><b>Годы 1-30 (Восходящая чёрная):</b><br>• Обучение и накопление опыта<br>• Рост и становление<br>• Поиск своего пути<br>• Совершение ошибок и извлечение уроков<br>• Формирование характера<br><br><b>Годы 51-60 (Нисходящая чёрная):</b><br>• Завершение циклов<br>• Передача знаний<br>• Подготовка к новому витку<br>• Освобождение от лишнего<br>• Мудрость старейшины<br><br><b>Для личности:</b><br>• 1-30 лет: Учись, исследуй, набирайся опыта<br>• 51-60 лет: Передавай знания, готовься к трансформации<br><br><b>Для года в цикле:</b><br>• Время перемен и непредсказуемости<br>• Благоприятно для обучения<br>• Период трансформации<br><br><b>Практика:</b> В начале — ученичество, эксперименты. В конце — наставничество, отпускание, подготовка к переходу.<br><br><b>Совет:</b> Принимай роль ученика или учителя в зависимости от фазы цикла.';
            color = '#888888';
        }
    } else if(type === 'field1' && details.data.label1 === 'ДЕКАН') {
        // Египетская система - Деканы
        var DECANS_FULL = [
            {name:'Хнум',desc:'<b>𓃝 Хнум</b> — бог-творец с головой барана.<br><br><b>Сфера:</b> Творчество, созидание.<br><b>Храм:</b> Элефантина · <b>Стихия:</b> Вода Нила<br><br><b>Энергия дня:</b> Благоприятен для создания нового, работы руками.<br><b>Практика:</b> Визуализация творения. <b>Символ:</b> Гончарный круг'},
            {name:'Хатхор',desc:'<b>𓁐 Хатхор</b> — богиня любви, красоты и музыки.<br><br><b>Сфера:</b> Любовь, искусство, материнство.<br><b>Храм:</b> Дендера · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День радости. Благоприятен для музыки, танца.<br><b>Практика:</b> Пение, ритуалы красоты. <b>Символ:</b> Систр'},
            {name:'Птах',desc:'<b>𓁹 Птах</b> — великий архитектор вселенной, создавший мир словом.<br><br><b>Сфера:</b> Ремесло, архитектура, магия слова.<br><b>Храм:</b> Мемфис · <b>Стихия:</b> Земля<br><br><b>Энергия дня:</b> День мастеров. Работа со словом силы.<br><b>Практика:</b> Произнесение слов силы. <b>Символ:</b> Посох Уас'},
            {name:'Ра',desc:'<b>☥ Ра</b> — верховный бог солнца, источник жизни.<br><br><b>Сфера:</b> Власть, жизненная сила, свет.<br><b>Храм:</b> Гелиополь · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> Самый мощный день. Благоприятен для важных начинаний.<br><b>Практика:</b> Солнечные медитации на восходе. <b>Символ:</b> Солнечный диск'},
            {name:'Анубис',desc:'<b>𓃥 Анубис</b> — проводник душ, хранитель врат между мирами.<br><br><b>Сфера:</b> Трансформация, переходы, защита.<br><b>Храм:</b> Некрополи · <b>Стихия:</b> Земля и Эфир<br><br><b>Энергия дня:</b> День завершения циклов и трансформации.<br><b>Практика:</b> Ритуалы отпускания. <b>Символ:</b> Чёрный шакал'},
            {name:'Сет',desc:'<b>𓃩 Сет</b> — бог хаоса и бурь. Сила разрушения и обновления.<br><br><b>Сфера:</b> Хаос, сила, разрушение старого.<br><b>Храм:</b> Омбос · <b>Стихия:</b> Огонь и Воздух<br><br><b>Энергия дня:</b> День испытаний и прорывов.<br><b>Практика:</b> Защитная магия. <b>Символ:</b> Красная корона'},
            {name:'Гор',desc:'<b>𓅃 Гор</b> — бог-сокол, царь богов, воплощение победы.<br><br><b>Сфера:</b> Победа, небесное царство, справедливость.<br><b>Храм:</b> Эдфу · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День победы и ясного видения.<br><b>Практика:</b> Медитация на Аджна-чакру (Всевидящее Око). <b>Символ:</b> Уджат'},
            {name:'Бастет',desc:'<b>𓀭 Бастет</b> — богиня-кошка, защитница дома и радости.<br><br><b>Сфера:</b> Защита дома, радость, интуиция.<br><b>Храм:</b> Бубастис · <b>Стихия:</b> Огонь (лунный)<br><br><b>Энергия дня:</b> День домашнего благополучия и интуиции.<br><b>Практика:</b> Защита пространства. <b>Символ:</b> Кошка'},
            {name:'Сехмет',desc:'<b>𓁢 Сехмет</b> — богиня-львица, сила войны и исцеления.<br><br><b>Сфера:</b> Сила, исцеление через разрушение.<br><b>Храм:</b> Мемфис · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> День мощной трансформации — яд и исцеление в одном.<br><b>Практика:</b> Работа с Манипурой. <b>Символ:</b> Львица'},
            {name:'Осирис',desc:'<b>𓀦 Осирис</b> — владыка воскресения и вечной жизни.<br><br><b>Сфера:</b> Воскресение, плодородие, справедливость.<br><b>Храм:</b> Абидос · <b>Стихия:</b> Земля и Вода<br><br><b>Энергия дня:</b> День глубокой трансформации — смерть как переход.<br><b>Практика:</b> Медитация на воскресение. <b>Символ:</b> Зелёная кожа'},
            {name:'Исида',desc:'<b>𓁹 Исида</b> — великая богиня магии и исцеления.<br><br><b>Сфера:</b> Магия, материнство, исцеление, мудрость.<br><b>Храм:</b> Филе · <b>Стихия:</b> Воздух и Вода<br><br><b>Энергия дня:</b> Самый магический день — лучшее время для ритуалов.<br><b>Практика:</b> Магические ритуалы, лунная энергия. <b>Символ:</b> Крылья, узел Тет'},
            {name:'Тот',desc:'<b>𓁟 Тот</b> — бог мудрости, письма и магии. Хранитель знаний.<br><br><b>Сфера:</b> Знания, письмо, магия, время.<br><b>Храм:</b> Гермополь · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> Лучший день для учёбы, письма, исследований.<br><b>Практика:</b> Чтение священных текстов, дневник. <b>Символ:</b> Ибис, папирус'},
            {name:'Маат',desc:'<b>𓁦 Маат</b> — богиня истины и космического порядка.<br><br><b>Сфера:</b> Истина, справедливость, гармония, закон.<br><b>Храм:</b> Во всех храмах · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День честности — живи так, чтобы сердце было легче пера.<br><b>Практика:</b> Медитация на истину. <b>Символ:</b> Перо страуса, весы'},
            {name:'Нефтида',desc:'<b>𓁡 Нефтида</b> — богиня сумерек, тайн и скорби.<br><br><b>Сфера:</b> Тайны, скорбь, интуиция, сумерки.<br><b>Храм:</b> Сепермеру · <b>Стихия:</b> Вода (тёмная)<br><br><b>Энергия дня:</b> День тайного знания и работы с тенью.<br><b>Практика:</b> Медитация в сумерках, работа со снами. <b>Символ:</b> Корзина, крылья'},
            {name:'Собек',desc:'<b>𓆊 Собек</b> — бог-крокодил, повелитель вод Нила.<br><br><b>Сфера:</b> Первобытная сила, плодородие воды, мощь.<br><b>Храм:</b> Ком-Омбо · <b>Стихия:</b> Вода<br><br><b>Энергия дня:</b> День первобытной силы — неукротимая жизненная энергия.<br><b>Практика:</b> Медитация у воды, Свадхистхана. <b>Символ:</b> Крокодил'},
            {name:'Амон',desc:'<b>𓀭 Амон</b> — "Сокрытый", великий царь богов.<br><br><b>Сфера:</b> Скрытая сила, ветер, мистерия.<br><b>Храм:</b> Карнак · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День скрытой мощи — невидимое движет всем.<br><b>Практика:</b> Пранаяма, медитация на Сахасрару. <b>Символ:</b> Два пера, баран'},
            {name:'Мут',desc:'<b>𓁐 Мут</b> — великая богиня-матерь, супруга Амона.<br><br><b>Сфера:</b> Материнство, защита, небо как лоно творения.<br><b>Храм:</b> Карнак · <b>Стихия:</b> Вода и Воздух<br><br><b>Энергия дня:</b> День великого материнства и безусловной любви.<br><b>Практика:</b> Анахата-чакра, медитация на первоматерь. <b>Символ:</b> Гриф'},
            {name:'Хонсу',desc:'<b>𓇳 Хонсу</b> — лунный бог целитель, сын Амона и Мут.<br><br><b>Сфера:</b> Луна, исцеление, изгнание злых духов.<br><b>Храм:</b> Карнак · <b>Стихия:</b> Вода (лунная)<br><br><b>Энергия дня:</b> День лунного исцеления и очищения пространства.<br><b>Практика:</b> Лунные медитации, изгнание негатива. <b>Символ:</b> Лунный диск'},
            {name:'Нейт',desc:'<b>𓁲 Нейт</b> — древнейшая богиня войны и ткачества судьбы.<br><br><b>Сфера:</b> Ткачество судьбы, мудрость, защита мёртвых.<br><b>Храм:</b> Саис · <b>Стихия:</b> Вода<br><br><b>Энергия дня:</b> День осознания паттернов судьбы.<br><b>Практика:</b> Медитация на нити судьбы. <b>Символ:</b> Два лука, ткацкий челнок'},
            {name:'Селкет',desc:'<b>𓆑 Селкет</b> — богиня-скорпион, защитница от яда.<br><br><b>Сфера:</b> Защита от яда, алхимия, магия исцеления.<br><b>Храм:</b> По всему Египту · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> День превращения опасного в целительное.<br><b>Практика:</b> Трансформация токсичных ситуаций. <b>Символ:</b> Скорпион'},
            {name:'Апис',desc:'<b>𓃒 Апис</b> — священный бык, воплощение Птаха и Осириса.<br><br><b>Сфера:</b> Плодородие, сила, воплощение духа в материи.<br><b>Храм:</b> Серапеум · <b>Стихия:</b> Земля<br><br><b>Энергия дня:</b> День воплощённой мощи — бог в теле животного.<br><b>Практика:</b> Заземление, воплощение духа. <b>Символ:</b> Бык с диском'},
            {name:'Хапи',desc:'<b>𓇌 Хапи</b> — бог разлива Нила, источника всей жизни.<br><br><b>Сфера:</b> Изобилие, плодородие, питание всех.<br><b>Храм:</b> Гебель ас-Силсила · <b>Стихия:</b> Вода<br><br><b>Энергия дня:</b> День изобилия — плодородный ил как духовное питание.<br><b>Практика:</b> Медитация на изобилие, щедрость. <b>Символ:</b> Синяя кожа, лотос'},
            {name:'Нун',desc:'<b>𓇋 Нун</b> — первозданный водный хаос, начало всего.<br><br><b>Сфера:</b> Первозданный потенциал, изначальные воды.<br><b>Храм:</b> Священные озёра · <b>Стихия:</b> Вода<br><br><b>Энергия дня:</b> День возврата к истокам — чистый потенциал до творения.<br><b>Практика:</b> Медитация в пустоте, очищающие ванны. <b>Символ:</b> Синяя кожа'},
            {name:'Атум',desc:'<b>𓁰 Атум</b> — "Завершённый", первый бог, создавший себя из Нуна.<br><br><b>Сфера:</b> Самосотворение, завершение, закат цикла.<br><b>Храм:</b> Гелиополь · <b>Стихия:</b> Огонь (закатный)<br><br><b>Энергия дня:</b> День завершения великих циклов.<br><b>Практика:</b> Медитация на самосотворение. <b>Символ:</b> Двойная корона, змей'},
            {name:'Шу',desc:'<b>𓇼 Шу</b> — бог воздуха, разделивший небо и землю.<br><br><b>Сфера:</b> Воздух, свет, пространство, ясность.<br><b>Храм:</b> Леонтополь · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День ясности — пространство между небом и землёй.<br><b>Практика:</b> Пранаяма, медитация на пустоту между мыслями. <b>Символ:</b> Перо Маат'},
            {name:'Тефнут',desc:'<b>𓁛 Тефнут</b> — богиня влаги и росы, близнец Шу.<br><br><b>Сфера:</b> Влага, эмоции, священный гнев, лунный свет.<br><b>Храм:</b> Леонтополь · <b>Стихия:</b> Вода и Огонь<br><br><b>Энергия дня:</b> День эмоционального очищения.<br><b>Практика:</b> Работа с эмоциями, очищение слезами. <b>Символ:</b> Львица'},
            {name:'Геб',desc:'<b>𓇿 Геб</b> — бог земли, отец Осириса и Исиды.<br><br><b>Сфера:</b> Земля, плодородие, предки, смех богов.<br><b>Храм:</b> Гелиополь · <b>Стихия:</b> Земля<br><br><b>Энергия дня:</b> День заземления и связи с предками.<br><b>Практика:</b> Муладхара, садоводство, контакт с землёй. <b>Символ:</b> Гусь'},
            {name:'Нут',desc:'<b>𓇋 Нут</b> — богиня неба, мать Ра и всех богов.<br><br><b>Сфера:</b> Небо, звёзды, космос, цикл возрождения.<br><b>Храм:</b> Дендера · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День космического сознания — небо как мать всего.<br><b>Практика:</b> Ночная медитация под звёздами, Сахасрара. <b>Символ:</b> Звёздное тело'},
            {name:'Уаджет',desc:'<b>𓆙 Уаджет</b> — священная кобра, символ кундалини и третьего глаза.<br><br><b>Сфера:</b> Защита, власть, кундалини, третий глаз.<br><b>Храм:</b> Буто · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> День пробуждения внутренней силы.<br><b>Практика:</b> Кундалини, активация Аджна-чакры. <b>Символ:</b> Кобра'},
            {name:'Нехбет',desc:'<b>𓅿 Нехбет</b> — богиня-гриф, покровительница цариц.<br><br><b>Сфера:</b> Материнская защита, рождение, судьба.<br><b>Храм:</b> Эль-Каб · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День священной защиты — распростёртые крылья любви.<br><b>Практика:</b> Принятие покровительства, медитация на защиту. <b>Символ:</b> Гриф'},
            {name:'Монту',desc:'<b>𓅃 Монту</b> — бог-сокол войны и воинского духа.<br><br><b>Сфера:</b> Война, воинская доблесть, ярость солнца.<br><b>Храм:</b> Армант · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> День воинского духа — ярость, побеждающая несправедливость.<br><b>Практика:</b> Боевые искусства, Манипура-чакра. <b>Символ:</b> Сокол, двойное перо'},
            {name:'Хепри',desc:'<b>𓆣 Хепри</b> — бог-скарабей, утреннее солнце и самосотворение.<br><br><b>Сфера:</b> Возрождение, утро, самосотворение.<br><b>Храм:</b> Гелиополь · <b>Стихия:</b> Огонь (рассветный)<br><br><b>Энергия дня:</b> День нового начала — скарабей катит солнце, символ обновления.<br><b>Практика:</b> Утренние практики на рассвете. <b>Символ:</b> Скарабей'},
            {name:'Сокар',desc:'<b>𓅃 Сокар</b> — хранитель врат некрополя Мемфиса.<br><br><b>Сфера:</b> Смерть, переход, глубины психики.<br><b>Храм:</b> Мемфис · <b>Стихия:</b> Земля<br><br><b>Энергия дня:</b> День глубокого внутреннего путешествия.<br><b>Практика:</b> Медитация на глубины, работа с тенью. <b>Символ:</b> Мумифицированный сокол'},
            {name:'Имхотеп',desc:'<b>𓀀 Имхотеп</b> — обожествлённый мудрец, архитектор и врач.<br><br><b>Сфера:</b> Медицина, архитектура, мудрость, письмо.<br><b>Храм:</b> Саккара · <b>Стихия:</b> Земля<br><br><b>Энергия дня:</b> День человеческого гения — таланты на благо всех.<br><b>Практика:</b> Применение своих даров. <b>Символ:</b> Папирус, посох'},
            {name:'Серкет',desc:'<b>𓆑 Серкет</b> — богиня алхимии, превращающая яд в исцеление.<br><br><b>Сфера:</b> Алхимия, исцеление ядом, защита, магия.<br><b>Храм:</b> По всему Египту · <b>Стихия:</b> Огонь<br><br><b>Энергия дня:</b> День алхимической трансформации.<br><b>Практика:</b> Трансформация токсичного в целительное. <b>Символ:</b> Скорпион, крылья'},
            {name:'Хех',desc:'<b>𓋹 Хех</b> — бог бесконечности, персонификация миллионов лет.<br><br><b>Сфера:</b> Вечность, бесконечность, безвременье.<br><b>Храм:</b> Во всех космогонических текстах · <b>Стихия:</b> Воздух<br><br><b>Энергия дня:</b> День соприкосновения с вечностью — жизнь и время в единстве.<br><b>Практика:</b> Медитация на вечное настоящее. <b>Символ:</b> Анкх, пальмовая ветвь'}
        ];
        var decanIdx = (new Date().getTime() / 86400000 + 2440588) % 36;
        if(DECANS_FULL[Math.floor(decanIdx)]) {
            var decan = DECANS_FULL[Math.floor(decanIdx)];
            title = decan.name;
            desc = decan.desc;
            color = '#d4af37';
        }
    } else if(type === 'field2' && details.data.label2 === 'ЧАС РА') {
        // Египетская система - Часы Ра
        title = details.data.val2;
        var hour = new Date().getHours();
        if(hour >= 5 && hour < 7) {
            desc = '<b>𓇳 Рассвет Ра</b> — священный момент рождения солнца из лона Нут.<br><br><b>Символизм:</b> Ра в форме Хепри (скарабея) выкатывает солнечный диск из подземного мира. Победа света над тьмой.<br><br><b>Энергия:</b> Обновление, возрождение, новое начало. Самое священное время суток.<br><br><b>Практика:</b> Приветствие восходящему солнцу, мантра "Дуа Ра" (Слава Ра), омовение в солнечных лучах, постановка намерений на день.<br><br><b>Божества часа:</b> Хепри (утреннее солнце), Нут (небо), Шу (воздух)';
            color = '#ffd700';
        } else if(hour >= 12 && hour < 14) {
            desc = '<b>☀ Полдень Ра</b> — зенит силы, Ра в своей полной славе как Ра-Хорахти.<br><br><b>Символизм:</b> Солнце в высшей точке, максимум света и силы. Ра на троне своей барки.<br><br><b>Энергия:</b> Пик силы, власть, проявление, видимость. Время царей и фараонов.<br><br><b>Практика:</b> Солнечные медитации, работа с властью и авторитетом, исцеление солнечным светом, активация Ка (жизненной силы).<br><br><b>Божества часа:</b> Ра-Хорахти, Сехмет (сила солнца), Маат (порядок)';
            color = '#ffaa00';
        } else if(hour >= 18 && hour < 20) {
            desc = '<b>🌅 Закат Ра</b> — Ра входит в западные врата, начиная путешествие через Дуат (подземный мир).<br><br><b>Символизм:</b> Солнце умирает, чтобы возродиться. Ра принимает форму барана, готовясь к ночному путешествию.<br><br><b>Энергия:</b> Завершение, подведение итогов, подготовка к внутренней работе. Переход от внешнего к внутреннему.<br><br><b>Практика:</b> Благодарность солнцу за день, ритуалы завершения, подготовка к ночным практикам, работа с переходами.<br><br><b>Божества часа:</b> Атум (заходящее солнце), Нефтида (сумерки), Анубис (проводник)';
            color = '#ff8844';
        } else {
            desc = '<b>🌙 Ночь Дуата</b> — Ра путешествует через 12 часов ночи в подземном мире, сражаясь с Апопом (змеем хаоса).<br><br><b>Символизм:</b> Путешествие души через тьму, испытания, трансформация. Ра в форме барана проходит через врата смерти.<br><br><b>Энергия:</b> Тайна, магия, работа с подсознанием, битва с внутренними демонами. Время некромантии и глубокой магии.<br><br><b>12 часов ночи:</b> Каждый час — врата с испытанием. Самый опасный — 7-й час (битва с Апопом).<br><br><b>Практика:</b> Ночные медитации, работа со снами, магия Дуата, защитные ритуалы, призыв богов-защитников.<br><br><b>Божества часа:</b> Осирис (владыка Дуата), Исида (магия), Тот (знание тайн)';
            color = '#4444aa';
        }
    } else if(type === 'field1' && details.data.label1 === 'СЕФИРА') {
        // Каббалистическая система - Сефирот
        var SEPHIROT_FULL = [
            {name:'Кетер',desc:'<b>✦ כתר Кетер — Корона</b><br><br><b>Мир:</b> Ацилут (Эманация) · <b>Планета:</b> Нептун / Первичный Свет · <b>Цвет:</b> Ослепительная белизна<br><b>Архангел:</b> Метатрон · <b>Имя Бога:</b> Эхье Ашер Эхье (אהיה אשר אהיה)<br><br><b>Сущность:</b> Высшая сефира, источник всего сущего. Чистое бытие без атрибутов. То, что выше понимания — корона над Древом Жизни. Единство до всякого разделения.<br><br><b>Энергия дня:</b> День высшего сознания. Медитация на Эйн Соф (Бесконечное), растворение эго в Источнике, постижение единства всего.<br><br><b>Практика:</b> Созерцание пустоты, битуль (самоаннигиляция), девекут (прилепление к Богу).<br><i>Мантра: Эхье Ашер Эхье — Я Есть То, Что Я Есть</i>'},
            {name:'Хокма',desc:'<b>✦ חכמה Хокма — Мудрость</b><br><br><b>Мир:</b> Ацилут · <b>Планета:</b> Уран / Зодиак · <b>Цвет:</b> Серебристый серый<br><b>Архангел:</b> Разиэль (Тайны Бога) · <b>Имя Бога:</b> Ях (יה)<br><br><b>Сущность:</b> Первая вспышка творения — чистый инсайт, семя всех идей. Отец, точка, первое движение от единства к множеству. Интуитивное знание до слов.<br><br><b>Энергия дня:</b> День озарений и откровений. Открытость к мудрости свыше. Вспышки гениальности и интуиции.<br><br><b>Практика:</b> Медитация на точку (йуд י), созерцание звёздного неба, получение откровений в тишине.<br><i>Мантра: Ях — краткое имя Бога, семя всего</i>'},
            {name:'Бина',desc:'<b>✦ בינה Бина — Понимание</b><br><br><b>Мир:</b> Ацилут · <b>Планета:</b> Сатурн · <b>Цвет:</b> Чёрный, тёмно-синий<br><b>Архангел:</b> Цафкиэль (Созерцание Бога) · <b>Имя Бога:</b> Элохим (אלהים)<br><br><b>Сущность:</b> Великая Мать, лоно творения. Семя Хокмы обретает форму. Структура, ограничение как условие проявления. Тьма как лоно света.<br><br><b>Энергия дня:</b> День глубокого понимания. Структурирование знаний, работа с формой и ограничениями как благословением.<br><br><b>Практика:</b> Работа с Сатурном, тшува (возвращение к истокам), медитация на тьму.<br><i>Мантра: Элохим — Бог как множественность в единстве</i>'},
            {name:'Хесед',desc:'<b>✦ חסד Хесед — Милость</b><br><br><b>Мир:</b> Брия (Творение) · <b>Планета:</b> Юпитер · <b>Цвет:</b> Синий, голубой<br><b>Архангел:</b> Цадкиэль (Праведность Бога) · <b>Имя Бога:</b> Эль (אל)<br><br><b>Сущность:</b> Безграничная любовь и щедрость. Правая рука Бога — дарение без меры. Экспансия, прощение, благословение всех существ.<br><br><b>Энергия дня:</b> День милосердия. Благотворительность, прощение обид, расширение сознания, безусловная любовь.<br><br><b>Практика:</b> Гмилут хасадим (деяния милосердия), практики любящей доброты, благотворительность.<br><i>Мантра: Эль — простота Божественной любви</i>'},
            {name:'Гебура',desc:'<b>✦ גבורה Гебура — Строгость</b><br><br><b>Мир:</b> Брия · <b>Планета:</b> Марс · <b>Цвет:</b> Красный, алый<br><b>Архангел:</b> Камаэль (Строгость Бога) · <b>Имя Бога:</b> Элохим Гибор (אלהים גבור)<br><br><b>Сущность:</b> Левая рука Бога. Сила, суд, дисциплина. Хесед без Гебуры — хаос. Гебура отсекает лишнее, очищает огнём. Героизм духа.<br><br><b>Энергия дня:</b> День силы и очищения. Установление границ, работа с гневом как трансформирующей силой, защита.<br><br><b>Практика:</b> Гвура (героизм), йира (трепет), защитные ритуалы, дисциплина тела и духа.<br><i>Мантра: Элохим Гибор — Бог Могущественный</i>'},
            {name:'Тиферет',desc:'<b>✦ תפארת Тиферет — Красота</b><br><br><b>Мир:</b> Брия · <b>Планета:</b> Солнце · <b>Цвет:</b> Золотой, жёлтый<br><b>Архангел:</b> Михаэль (Кто подобен Богу) · <b>Имя Бога:</b> YHWH (יהוה)<br><br><b>Сущность:</b> Сердце Древа Жизни. Центр равновесия, где Хесед и Гебура находят гармонию. Красота как выражение истины. Солнце духовного мира. Сефира Христа, Кришны, просветлённых учителей.<br><br><b>Энергия дня:</b> День красоты, равновесия и сердца. Работа с солнечным сознанием, медитация на Высшее Я, гармония противоположностей.<br><br><b>Практика:</b> Медитация на сердечный центр, работа с Солнцем, созерцание красоты.<br><i>Мантра: YHWH — непроизносимое имя, дыхание как молитва</i>'},
            {name:'Нецах',desc:'<b>✦ נצח Нецах — Вечность</b><br><br><b>Мир:</b> Ецира (Формирование) · <b>Планета:</b> Венера · <b>Цвет:</b> Зелёный, изумрудный<br><b>Архангел:</b> Ханиэль (Благодать Бога) · <b>Имя Бога:</b> YHWH Цбаот (יהוה צבאות)<br><br><b>Сущность:</b> Инстинкт, желание, природа, вечная жизненная сила. Сфера чувств, страстей, искусства, природных сил. Правая нога — движение к цели.<br><br><b>Энергия дня:</b> День страсти и красоты. Творчество, природа, любовь, чувственность как путь к Богу. День художника и влюблённого.<br><br><b>Практика:</b> Работа с природой, танец, музыка, созерцание красоты, медитация на желание как энергию.<br><i>Мантра: YHWH Цбаот — Господь Воинств в природе</i>'},
            {name:'Ход',desc:'<b>✦ הוד Ход — Слава</b><br><br><b>Мир:</b> Ецира · <b>Планета:</b> Меркурий · <b>Цвет:</b> Оранжевый<br><b>Архангел:</b> Рафаэль (Исцеление Бога) · <b>Имя Бога:</b> Элохим Цбаот (אלהים צבאות)<br><br><b>Сущность:</b> Интеллект, магия, слова, коммуникация. Левая нога — точность движения. Магия и ритуал как точное знание законов. Там, где Нецах — чувство, Ход — форма.<br><br><b>Энергия дня:</b> День магии слова и точного знания. Написание, изучение языков, ритуальная магия, точность мысли.<br><br><b>Практика:</b> Изучение священных имён, работа с Меркурием, ведение магического дневника, точность речи.<br><i>Мантра: Элохим Цбаот — Бог как сила точного знания</i>'},
            {name:'Йесод',desc:'<b>✦ יסוד Йесод — Основание</b><br><br><b>Мир:</b> Ецира · <b>Планета:</b> Луна · <b>Цвет:</b> Фиолетовый, серебристый<br><b>Архангел:</b> Гавриэль (Сила Бога) · <b>Имя Бога:</b> Шаддай Эль Хай (שדי אל חי)<br><br><b>Сущность:</b> Основание, фундамент, лунный свет. Место сбора всех энергий перед проявлением в Малкут. Астральный план, сны, подсознание, сексуальная энергия как творческая сила.<br><br><b>Энергия дня:</b> День лунной силы и снов. Работа с подсознанием, астральными практиками, циклами, памятью предков.<br><br><b>Практика:</b> Работа со снами, лунные медитации, работа с Йесодом как хранилищем прошлого.<br><i>Мантра: Шаддай — Бог-Всемогущий, питающий жизнь</i>'},
            {name:'Малкут',desc:'<b>✦ מלכות Малкут — Царство</b><br><br><b>Мир:</b> Асия (Действие) · <b>Планета:</b> Земля · <b>Цвет:</b> Коричневый, чёрный, оливковый, цитриновый<br><b>Архангел:</b> Сандалфон (Брат Метатрона) · <b>Имя Бога:</b> Адонай Мелех (אדני מלך)<br><br><b>Сущность:</b> Материальный мир, Шехина (Присутствие Бога в материи), тело, земля. Нижний конец Древа. Малкут — это не низший мир, это Кетер в другом аспекте — Бог, полностью воплощённый в материи.<br><br><b>Энергия дня:</b> День воплощения. Работа с телом, землёй, материальным. Шехина — Бог здесь и сейчас, в каждом атоме.<br><br><b>Практика:</b> Заземление, работа с телом, природа, медитация на присутствие Бога в материи.<br><i>Мантра: Адонай — Господь, присутствующий здесь и сейчас</i>'}
        ];
        var PATHS_FULL = [
            {letter:'א', name:'Алеф', tarot:'Шут (0)', planet:'Воздух', seph:'Кетер—Хокма', desc:'<b>א Алеф — Бык/Дыхание</b><br><br><b>Таро:</b> Шут · <b>Стихия:</b> Воздух · <b>Путь:</b> Кетер → Хокма<br><br>Алеф — первая буква, первое дыхание Бога. Символ быка (мощь) и воздуха (свобода). Шут — дух до воплощения, бесконечный потенциал. Переход от чистого бытия к первой мудрости.<br><br><b>Практика:</b> Медитация на первое дыхание, пранаяма как молитва. <i>Числовое значение: 1</i>'},
            {letter:'ב', name:'Бет', tarot:'Маг (I)', planet:'Меркурий', seph:'Кетер—Бина', desc:'<b>ב Бет — Дом</b><br><br><b>Таро:</b> Маг · <b>Планета:</b> Меркурий · <b>Путь:</b> Кетер → Бина<br><br>Бет — дом, место где разворачивается жизнь. Маг — воля, направляющая силу творения. Первое слово Торы — Берешит (בראשית) начинается с Бет. Создание дома для Бога в материи.<br><br><b>Практика:</b> Работа с волей и намерением, магия слова, создание священного пространства. <i>Числовое значение: 2</i>'},
            {letter:'ג', name:'Гимель', tarot:'Верховная Жрица (II)', planet:'Луна', seph:'Кетер—Тиферет', desc:'<b>ג Гимель — Верблюд</b><br><br><b>Таро:</b> Верховная Жрица · <b>Планета:</b> Луна · <b>Путь:</b> Кетер → Тиферет<br><br>Гимель — верблюд, несущий через пустыню. Прямой путь от Короны к Сердцу через Бездну (Даат). Верховная Жрица — тайное знание, лунная мудрость, хранительница порогов.<br><br><b>Практика:</b> Лунные медитации, работа с интуицией, созерцание тайного. <i>Числовое значение: 3</i>'},
            {letter:'ד', name:'Далет', tarot:'Императрица (III)', planet:'Венера', seph:'Хокма—Бина', desc:'<b>ד Далет — Дверь</b><br><br><b>Таро:</b> Императрица · <b>Планета:</b> Венера · <b>Путь:</b> Хокма → Бина<br><br>Далет — дверь, врата. Мост между Отцом (Хокма) и Матерью (Бина). Императрица — плодородие, природа, материнская любовь. Врата рождения всего творения.<br><br><b>Практика:</b> Работа с природой, плодородием, материнской любовью. <i>Числовое значение: 4</i>'},
            {letter:'ה', name:'Хе', tarot:'Император (IV)', planet:'Овен', seph:'Хокма—Тиферет', desc:'<b>ה Хе — Окно</b><br><br><b>Таро:</b> Император · <b>Планета:</b> Овен (Марс) · <b>Путь:</b> Хокма → Тиферет<br><br>Хе — окно, через которое входит свет. Два Хе в Имени YHWH. Император — структура, власть, земной порядок. Архетип отца, устанавливающего законы.<br><br><b>Практика:</b> Работа со структурой и властью, установление законов жизни. <i>Числовое значение: 5</i>'},
            {letter:'ו', name:'Вав', tarot:'Иерофант (V)', planet:'Телец', seph:'Хокма—Хесед', desc:'<b>ו Вав — Гвоздь/Крюк</b><br><br><b>Таро:</b> Иерофант · <b>Планета:</b> Телец (Венера) · <b>Путь:</b> Хокма → Хесед<br><br>Вав — гвоздь, соединяющий, связующее звено. Иерофант — хранитель традиции, учитель, мост между небесным и земным. Вав соединяет мудрость с милостью.<br><br><b>Практика:</b> Работа с традицией, почитание учителей, передача знания. <i>Числовое значение: 6</i>'},
            {letter:'ז', name:'Заин', tarot:'Влюблённые (VI)', planet:'Близнецы', seph:'Бина—Тиферет', desc:'<b>ז Заин — Меч</b><br><br><b>Таро:</b> Влюблённые · <b>Планета:</b> Близнецы (Меркурий) · <b>Путь:</b> Бина → Тиферет<br><br>Заин — меч различения. Влюблённые — выбор, союз противоположностей. Меч разделяет истинное от ложного. Путь от понимания к красоте через выбор любви.<br><br><b>Практика:</b> Работа с выбором, различение истинного, медитация на союз противоположностей. <i>Числовое значение: 7</i>'},
            {letter:'ח', name:'Хет', tarot:'Колесница (VII)', planet:'Рак', seph:'Бина—Гебура', desc:'<b>ח Хет — Ограда/Поле</b><br><br><b>Таро:</b> Колесница · <b>Планета:</b> Рак (Луна) · <b>Путь:</b> Бина → Гебура<br><br>Хет — защищённое пространство, ограда. Колесница — победа через контроль и направление силы. Путь от понимания к строгости через волю.<br><br><b>Практика:</b> Работа с защитой пространства, контроль энергий, направление воли. <i>Числовое значение: 8</i>'},
            {letter:'ט', name:'Тет', tarot:'Сила (VIII)', planet:'Лев', seph:'Хесед—Гебура', desc:'<b>ט Тет — Змей</b><br><br><b>Таро:</b> Сила · <b>Планета:</b> Лев (Солнце) · <b>Путь:</b> Хесед → Гебура<br><br>Тет — змей, скрытое добро. Внешне похожа на Бет, но открыта вовнутрь. Сила — укрощение зверя любовью. Баланс между милостью и строгостью.<br><br><b>Практика:</b> Укрощение инстинктов любовью, медитация на внутреннюю силу. <i>Числовое значение: 9</i>'},
            {letter:'י', name:'Йод', tarot:'Отшельник (IX)', planet:'Дева', seph:'Хесед—Тиферет', desc:'<b>י Йод — Рука</b><br><br><b>Таро:</b> Отшельник · <b>Планета:</b> Дева (Меркурий) · <b>Путь:</b> Хесед → Тиферет<br><br>Йод — самая малая буква иврита, но из неё составлены все остальные. Отшельник — свет внутреннего поиска. Рука Бога, создающая из малого великое.<br><br><b>Практика:</b> Медитация на малое как великое, внутренний поиск, уединение. <i>Числовое значение: 10</i>'},
            {letter:'כ', name:'Каф', tarot:'Колесо Фортуны (X)', planet:'Юпитер', seph:'Хесед—Нецах', desc:'<b>כ Каф — Ладонь</b><br><br><b>Таро:</b> Колесо Фортуны · <b>Планета:</b> Юпитер · <b>Путь:</b> Хесед → Нецах<br><br>Каф — ладонь, держащая и дающая. Колесо Фортуны — циклы судьбы, karma, вращение времени. Щедрость Хесед приходит к природным циклам Нецах.<br><br><b>Практика:</b> Принятие циклов, работа с судьбой, медитация на Колесо времени. <i>Числовое значение: 20</i>'},
            {letter:'ל', name:'Ламед', tarot:'Справедливость (XI)', planet:'Весы', seph:'Гебура—Тиферет', desc:'<b>ל Ламед — Бык-погонщик</b><br><br><b>Таро:</b> Справедливость · <b>Планета:</b> Весы (Венера) · <b>Путь:</b> Гебура → Тиферет<br><br>Ламед — самая высокая буква иврита, тянется вверх. Справедливость — равновесие, карма, безупречность. Строгость ведёт к красоте через справедливость.<br><br><b>Практика:</b> Работа с кармой, установление справедливости, медитация на равновесие. <i>Числовое значение: 30</i>'},
            {letter:'מ', name:'Мем', tarot:'Повешенный (XII)', planet:'Вода', seph:'Гебура—Ход', desc:'<b>מ Мем — Вода</b><br><br><b>Таро:</b> Повешенный · <b>Стихия:</b> Вода · <b>Путь:</b> Гебура → Ход<br><br>Мем — мать воды, первозданные воды. Повешенный — добровольная жертва ради высшего знания (Один на ясене). Капитуляция эго открывает тайну.<br><br><b>Практика:</b> Добровольное принятие страданий, работа с водой, отпускание контроля. <i>Числовое значение: 40</i>'},
            {letter:'נ', name:'Нун', tarot:'Смерть (XIII)', planet:'Скорпион', seph:'Тиферет—Нецах', desc:'<b>נ Нун — Рыба</b><br><br><b>Таро:</b> Смерть · <b>Планета:</b> Скорпион (Плутон) · <b>Путь:</b> Тиферет → Нецах<br><br>Нун — рыба в воде (бессознательное). Аркан Смерть — не физическая смерть, а трансформация. От сердца к вечности через смерть эго.<br><br><b>Практика:</b> Медитация на смерть эго, трансформирующие практики, работа с Плутоном. <i>Числовое значение: 50</i>'},
            {letter:'ס', name:'Самех', tarot:'Умеренность (XIV)', planet:'Стрелец', seph:'Тиферет—Йесод', desc:'<b>ס Самех — Подпора</b><br><br><b>Таро:</b> Умеренность · <b>Планета:</b> Стрелец (Юпитер) · <b>Путь:</b> Тиферет → Йесод<br><br>Самех — круг, поддержка, защита. Умеренность — алхимическое смешение, ангел льёт воду между кувшинами. Равновесие между сердцем и основанием.<br><br><b>Практика:</b> Алхимические медитации, работа с балансом, умеренность во всём. <i>Числовое значение: 60</i>'},
            {letter:'ע', name:'Айн', tarot:'Дьявол (XV)', planet:'Козерог', seph:'Тиферет—Ход', desc:'<b>ע Айн — Глаз</b><br><br><b>Таро:</b> Дьявол · <b>Планета:</b> Козерог (Сатурн) · <b>Путь:</b> Тиферет → Ход<br><br>Айн — глаз, видящий и невидящий. Дьявол — иллюзии, привязанности, материальный план. Но цепи на шее рабов свободны — они держатся сами. Знание своих тёмных сторон освобождает.<br><br><b>Практика:</b> Работа с тенью, освобождение от иллюзий, медитация на свободу воли. <i>Числовое значение: 70</i>'},
            {letter:'פ', name:'Пе', tarot:'Башня (XVI)', planet:'Марс', seph:'Нецах—Ход', desc:'<b>פ Пе — Рот</b><br><br><b>Таро:</b> Башня · <b>Планета:</b> Марс · <b>Путь:</b> Нецах → Ход<br><br>Пе — рот, слово, разрушение иллюзорных структур. Башня — внезапное разрушение ложных построений. Уста Бога произносят слово, которое разрушает то, что должно быть разрушено.<br><br><b>Практика:</b> Работа с разрушением старого, медитация на освобождение через катастрофу. <i>Числовое значение: 80</i>'},
            {letter:'צ', name:'Цади', tarot:'Звезда (XVII)', planet:'Водолей', seph:'Нецах—Йесод', desc:'<b>צ Цади — Рыболов</b><br><br><b>Таро:</b> Звезда · <b>Планета:</b> Водолей (Уран) · <b>Путь:</b> Нецах → Йесод<br><br>Цади — рыболов, ловящий в водах подсознания. Звезда — надежда после катастрофы Башни, исцеление, вдохновение. Природа и подсознание питают друг друга.<br><br><b>Практика:</b> Медитация на звёзды, работа с надеждой, исцеление природой. <i>Числовое значение: 90</i>'},
            {letter:'ק', name:'Коф', tarot:'Луна (XVIII)', planet:'Рыбы', seph:'Нецах—Малкут', desc:'<b>ק Коф — Затылок/Обезьяна</b><br><br><b>Таро:</b> Луна · <b>Планета:</b> Рыбы (Нептун) · <b>Путь:</b> Нецах → Малкут<br><br>Коф — задняя часть головы, подсознание. Луна — иллюзии, страхи, тёмная ночь души. Путь от природных сил к воплощению через туман неопределённости.<br><br><b>Практика:</b> Работа со страхами и иллюзиями, лунная магия, медитация в ночи. <i>Числовое значение: 100</i>'},
            {letter:'ר', name:'Реш', tarot:'Солнце (XIX)', planet:'Солнце', seph:'Ход—Йесод', desc:'<b>ר Реш — Голова</b><br><br><b>Таро:</b> Солнце · <b>Планета:</b> Солнце · <b>Путь:</b> Ход → Йесод<br><br>Реш — голова, вершина. Солнце — ясность, радость, просветление. После ночи Луны — свет Солнца. Путь от магии и знания к фундаменту через ясность сознания.<br><br><b>Практика:</b> Солнечные медитации, работа с ясностью, радость как духовная практика. <i>Числовое значение: 200</i>'},
            {letter:'ש', name:'Шин', tarot:'Суд (XX)', planet:'Огонь', seph:'Ход—Малкут', desc:'<b>ש Шин — Зуб/Огонь</b><br><br><b>Таро:</b> Суд · <b>Стихия:</b> Огонь · <b>Путь:</b> Ход → Малкут<br><br>Шин — три зуба/три языка пламени, Шаддай. Суд — воскресение, пробуждение, ответ на зов Бога. Огонь ангела трубит пробуждение всем спящим душам.<br><br><b>Практика:</b> Огненные медитации, работа с пробуждением, ответ на высший зов. <i>Числовое значение: 300</i>'},
            {letter:'ת', name:'Тав', tarot:'Мир (XXI)', planet:'Сатурн', seph:'Йесод—Малкут', desc:'<b>ת Тав — Знак/Крест</b><br><br><b>Таро:</b> Мир · <b>Планета:</b> Сатурн · <b>Путь:</b> Йесод → Малкут<br><br>Тав — последняя буква алфавита, печать, знак завершения. Мир — завершение цикла, танцующая фигура в венке. От Основания к Царству — последний шаг воплощения. Завершение и начало нового цикла.<br><br><b>Практика:</b> Медитация на завершение и начало, интеграция всего пути, танец как молитва. <i>Числовое значение: 400</i>'}
        ];
        // Ищем по имени из val1 — "✦ Тиферет (Красота)" → "Тиферет"
        var sephRaw = (details.data.val1 || '').replace(/✦\s*/g,'').trim();
        // Берём только первое слово до скобки
        var sephName = sephRaw.split('(')[0].trim();
        var sephFound = null;
        for(var si=0; si<SEPHIROT_FULL.length; si++){
            if(SEPHIROT_FULL[si].name === sephName || sephRaw.indexOf(SEPHIROT_FULL[si].name) >= 0){
                sephFound = SEPHIROT_FULL[si]; break;
            }
        }
        // Fallback по индексу дня
        if(!sephFound){
            var sephIdx = Math.floor((new Date().getTime() / 86400000 + 2440588) % 10);
            sephFound = SEPHIROT_FULL[sephIdx];
        }
        if(sephFound){
            title = sephFound.name;
            desc = sephFound.desc;
            color = '#6666ff';
        }
    } else if(type === 'field2' && details.data.label2 && details.data.label2.includes('ПУТЬ')) {
        // Каббала - 22 пути — полные описания
        var pathVal = details.data.val2 || '';
        var pathLetter = pathVal.split(' ')[1] || '';
        var pathFound = false;
        var PATHS_LOOKUP = [
            {letter:'א',name:'Алеф',tarot:'Шут (0)',planet:'Воздух',seph:'Кетер—Хокма',desc:'<b>א Алеф — Бык/Дыхание</b><br><br><b>Таро:</b> Шут · <b>Стихия:</b> Воздух · <b>Путь:</b> Кетер → Хокма<br><br>Алеф — первое дыхание Бога. Шут — дух до воплощения, бесконечный потенциал. Переход от чистого бытия к первой мудрости.<br><br><b>Практика:</b> Медитация на первое дыхание, пранаяма как молитва. <i>Числовое значение: 1</i>'},
            {letter:'ב',name:'Бет',tarot:'Маг (I)',planet:'Меркурий',seph:'Кетер—Бина',desc:'<b>ב Бет — Дом</b><br><br><b>Таро:</b> Маг · <b>Планета:</b> Меркурий · <b>Путь:</b> Кетер → Бина<br><br>Бет — дом, место жизни. Маг — воля, направляющая силу творения. Первое слово Торы (Берешит) начинается с Бет.<br><br><b>Практика:</b> Работа с волей и намерением, магия слова. <i>Числовое значение: 2</i>'},
            {letter:'ג',name:'Гимель',tarot:'Верховная Жрица (II)',planet:'Луна',seph:'Кетер—Тиферет',desc:'<b>ג Гимель — Верблюд</b><br><br><b>Таро:</b> Верховная Жрица · <b>Планета:</b> Луна · <b>Путь:</b> Кетер → Тиферет<br><br>Гимель — верблюд, несущий через пустыню. Прямой путь от Короны к Сердцу через Бездну (Даат). Хранительница тайного знания.<br><br><b>Практика:</b> Лунные медитации, работа с интуицией. <i>Числовое значение: 3</i>'},
            {letter:'ד',name:'Далет',tarot:'Императрица (III)',planet:'Венера',seph:'Хокма—Бина',desc:'<b>ד Далет — Дверь</b><br><br><b>Таро:</b> Императрица · <b>Планета:</b> Венера · <b>Путь:</b> Хокма → Бина<br><br>Далет — врата. Мост между Отцом и Матерью. Плодородие, природа, материнская любовь.<br><br><b>Практика:</b> Работа с природой, материнской любовью. <i>Числовое значение: 4</i>'},
            {letter:'ה',name:'Хе',tarot:'Император (IV)',planet:'Овен',seph:'Хокма—Тиферет',desc:'<b>ה Хе — Окно</b><br><br><b>Таро:</b> Император · <b>Планета:</b> Овен · <b>Путь:</b> Хокма → Тиферет<br><br>Хе — окно, через которое входит свет. Два Хе в Имени YHWH. Архетип отца, власть и закон.<br><br><b>Практика:</b> Работа со структурой, установление порядка. <i>Числовое значение: 5</i>'},
            {letter:'ו',name:'Вав',tarot:'Иерофант (V)',planet:'Телец',seph:'Хокма—Хесед',desc:'<b>ו Вав — Гвоздь</b><br><br><b>Таро:</b> Иерофант · <b>Планета:</b> Телец · <b>Путь:</b> Хокма → Хесед<br><br>Вав — связующее звено. Хранитель традиции, учитель, мост между небесным и земным.<br><br><b>Практика:</b> Почитание учителей, передача знания. <i>Числовое значение: 6</i>'},
            {letter:'ז',name:'Заин',tarot:'Влюблённые (VI)',planet:'Близнецы',seph:'Бина—Тиферет',desc:'<b>ז Заин — Меч</b><br><br><b>Таро:</b> Влюблённые · <b>Планета:</b> Близнецы · <b>Путь:</b> Бина → Тиферет<br><br>Заин — меч различения. Выбор, союз противоположностей. Путь от понимания к красоте через выбор.<br><br><b>Практика:</b> Различение истинного, медитация на выбор. <i>Числовое значение: 7</i>'},
            {letter:'ח',name:'Хет',tarot:'Колесница (VII)',planet:'Рак',seph:'Бина—Гебура',desc:'<b>ח Хет — Ограда</b><br><br><b>Таро:</b> Колесница · <b>Планета:</b> Рак · <b>Путь:</b> Бина → Гебура<br><br>Хет — защищённое пространство. Победа через контроль и направление силы.<br><br><b>Практика:</b> Защита пространства, направление воли. <i>Числовое значение: 8</i>'},
            {letter:'ט',name:'Тет',tarot:'Сила (VIII)',planet:'Лев',seph:'Хесед—Гебура',desc:'<b>ט Тет — Змей</b><br><br><b>Таро:</b> Сила · <b>Планета:</b> Лев · <b>Путь:</b> Хесед → Гебура<br><br>Тет — скрытое добро. Укрощение зверя любовью. Баланс милости и строгости.<br><br><b>Практика:</b> Укрощение инстинктов любовью, медитация на силу. <i>Числовое значение: 9</i>'},
            {letter:'י',name:'Йод',tarot:'Отшельник (IX)',planet:'Дева',seph:'Хесед—Тиферет',desc:'<b>י Йод — Рука</b><br><br><b>Таро:</b> Отшельник · <b>Планета:</b> Дева · <b>Путь:</b> Хесед → Тиферет<br><br>Йод — самая малая буква, но из неё составлены все остальные. Свет внутреннего поиска.<br><br><b>Практика:</b> Уединение, медитация на малое как великое. <i>Числовое значение: 10</i>'},
            {letter:'כ',name:'Каф',tarot:'Колесо Фортуны (X)',planet:'Юпитер',seph:'Хесед—Нецах',desc:'<b>כ Каф — Ладонь</b><br><br><b>Таро:</b> Колесо Фортуны · <b>Планета:</b> Юпитер · <b>Путь:</b> Хесед → Нецах<br><br>Каф — ладонь дарящая. Циклы судьбы, карма, вращение времени.<br><br><b>Практика:</b> Принятие циклов, работа с судьбой. <i>Числовое значение: 20</i>'},
            {letter:'ל',name:'Ламед',tarot:'Справедливость (XI)',planet:'Весы',seph:'Гебура—Тиферет',desc:'<b>ל Ламед — Погонщик</b><br><br><b>Таро:</b> Справедливость · <b>Планета:</b> Весы · <b>Путь:</b> Гебура → Тиферет<br><br>Ламед — самая высокая буква, тянется вверх. Равновесие, карма, безупречность.<br><br><b>Практика:</b> Медитация на равновесие, работа с кармой. <i>Числовое значение: 30</i>'},
            {letter:'מ',name:'Мем',tarot:'Повешенный (XII)',planet:'Вода',seph:'Гебура—Ход',desc:'<b>מ Мем — Вода</b><br><br><b>Таро:</b> Повешенный · <b>Стихия:</b> Вода · <b>Путь:</b> Гебура → Ход<br><br>Мем — мать воды. Добровольная жертва ради высшего знания. Капитуляция эго открывает тайну.<br><br><b>Практика:</b> Отпускание контроля, работа с водой. <i>Числовое значение: 40</i>'},
            {letter:'נ',name:'Нун',tarot:'Смерть (XIII)',planet:'Скорпион',seph:'Тиферет—Нецах',desc:'<b>נ Нун — Рыба</b><br><br><b>Таро:</b> Смерть · <b>Планета:</b> Скорпион · <b>Путь:</b> Тиферет → Нецах<br><br>Нун — рыба в водах бессознательного. Трансформация, смерть эго как переход.<br><br><b>Практика:</b> Трансформирующие практики, работа с Плутоном. <i>Числовое значение: 50</i>'},
            {letter:'ס',name:'Самех',tarot:'Умеренность (XIV)',planet:'Стрелец',seph:'Тиферет—Йесод',desc:'<b>ס Самех — Подпора</b><br><br><b>Таро:</b> Умеренность · <b>Планета:</b> Стрелец · <b>Путь:</b> Тиферет → Йесод<br><br>Самех — круг, поддержка. Алхимическое смешение, равновесие между сердцем и основанием.<br><br><b>Практика:</b> Алхимические медитации, умеренность во всём. <i>Числовое значение: 60</i>'},
            {letter:'ע',name:'Айн',tarot:'Дьявол (XV)',planet:'Козерог',seph:'Тиферет—Ход',desc:'<b>ע Айн — Глаз</b><br><br><b>Таро:</b> Дьявол · <b>Планета:</b> Козерог · <b>Путь:</b> Тиферет → Ход<br><br>Айн — глаз. Иллюзии и привязанности. Цепи на шее рабов свободны — они держатся сами. Знание тёмных сторон освобождает.<br><br><b>Практика:</b> Работа с тенью, освобождение от иллюзий. <i>Числовое значение: 70</i>'},
            {letter:'פ',name:'Пе',tarot:'Башня (XVI)',planet:'Марс',seph:'Нецах—Ход',desc:'<b>פ Пе — Рот</b><br><br><b>Таро:</b> Башня · <b>Планета:</b> Марс · <b>Путь:</b> Нецах → Ход<br><br>Пе — рот, слово. Внезапное разрушение ложных построений. Уста Бога разрушают иллюзорные структуры.<br><br><b>Практика:</b> Медитация на освобождение через катастрофу. <i>Числовое значение: 80</i>'},
            {letter:'צ',name:'Цади',tarot:'Звезда (XVII)',planet:'Водолей',seph:'Нецах—Йесод',desc:'<b>צ Цади — Рыболов</b><br><br><b>Таро:</b> Звезда · <b>Планета:</b> Водолей · <b>Путь:</b> Нецах → Йесод<br><br>Цади — рыболов в водах подсознания. Надежда после катастрофы, исцеление, вдохновение свыше.<br><br><b>Практика:</b> Медитация на звёзды, работа с надеждой. <i>Числовое значение: 90</i>'},
            {letter:'ק',name:'Коф',tarot:'Луна (XVIII)',planet:'Рыбы',seph:'Нецах—Малкут',desc:'<b>ק Коф — Затылок</b><br><br><b>Таро:</b> Луна · <b>Планета:</b> Рыбы · <b>Путь:</b> Нецах → Малкут<br><br>Коф — подсознание, задняя часть головы. Иллюзии, страхи, тёмная ночь души перед рассветом.<br><br><b>Практика:</b> Работа со страхами, лунная магия. <i>Числовое значение: 100</i>'},
            {letter:'ר',name:'Реш',tarot:'Солнце (XIX)',planet:'Солнце',seph:'Ход—Йесод',desc:'<b>ר Реш — Голова</b><br><br><b>Таро:</b> Солнце · <b>Планета:</b> Солнце · <b>Путь:</b> Ход → Йесод<br><br>Реш — голова, вершина. После тьмы Луны — свет Солнца. Ясность, радость, просветление.<br><br><b>Практика:</b> Солнечные медитации, радость как духовная практика. <i>Числовое значение: 200</i>'},
            {letter:'ש',name:'Шин',tarot:'Суд (XX)',planet:'Огонь',seph:'Ход—Малкут',desc:'<b>ש Шин — Огонь</b><br><br><b>Таро:</b> Суд · <b>Стихия:</b> Огонь · <b>Путь:</b> Ход → Малкут<br><br>Шин — три языка пламени. Воскресение, пробуждение, ответ на зов Бога. Огонь ангела трубит пробуждение.<br><br><b>Практика:</b> Огненные медитации, ответ на высший зов. <i>Числовое значение: 300</i>'},
            {letter:'ת',name:'Тав',tarot:'Мир (XXI)',planet:'Сатурн',seph:'Йесод—Малкут',desc:'<b>ת Тав — Знак/Крест</b><br><br><b>Таро:</b> Мир · <b>Планета:</b> Сатурн · <b>Путь:</b> Йесод → Малкут<br><br>Тав — последняя буква, печать завершения. Танцующая фигура в венке — интеграция всего пути. Конец цикла и начало нового.<br><br><b>Практика:</b> Медитация на завершение, интеграция, танец как молитва. <i>Числовое значение: 400</i>'}
        ];
        for(var pi=0;pi<PATHS_LOOKUP.length;pi++){
            if(pathVal.indexOf(PATHS_LOOKUP[pi].letter)>=0 || pathVal.indexOf(PATHS_LOOKUP[pi].name)>=0){
                title = PATHS_LOOKUP[pi].letter+' '+PATHS_LOOKUP[pi].name+' — '+PATHS_LOOKUP[pi].tarot;
                desc = PATHS_LOOKUP[pi].desc;
                pathFound = true;
                break;
            }
        }
        if(!pathFound){
            title = pathVal;
            desc = '<b>Пути Древа Жизни</b> — 22 канала между сефирот, 22 буквы иврита, 22 аркана Таро. Каждый путь — вибрация творения.<br><br><b>Практика:</b> Медитация на букву дня, работа с соответствующим арканом.';
        }
        color = '#8888ff';
    } else if(type === 'field1' && details.data.label1 === 'НАКШАТРА') {
        // Ведическая система - Накшатры
        // ПАТЧ: Заменить весь массив NAKSHATRAS_FULL в core.js
// Найти: var NAKSHATRAS_FULL = [
// Заменить всё до закрывающей ];

var NAKSHATRAS_FULL = [
    {name:'Ашвини',desc:'<b>🪷 Ашвини</b> — "Всадники", первая накшатра, символ быстрого движения и исцеления.<br><br><b>Божество:</b> Ашвини Кумары (божественные целители-близнецы)<br><b>Символ:</b> Голова лошади<br><b>Раши:</b> Меша (Овен)<br><br><b>Качества:</b> Скорость, исцеление, магия, инициация. Энергия быстрых перемен и чудесных исцелений.<br><br><b>Энергия дня:</b> Благоприятен для начала лечения, быстрых действий, путешествий, изучения медицины и целительства.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Пранаяма, мантры исцеления, работа с праной. <i>Ом Ашвини Кумарабхьям Намаха</i>'},

    {name:'Бхарани',desc:'<b>🪷 Бхарани</b> — "Носительница", накшатра трансформации через смерть и рождение.<br><br><b>Божество:</b> Яма (бог смерти и дхармы)<br><b>Символ:</b> Йони (лоно)<br><b>Раши:</b> Меша (Овен)<br><br><b>Качества:</b> Трансформация, сдержанность, ответственность. Энергия перехода между мирами.<br><br><b>Энергия дня:</b> День завершения циклов, отпускания старого, работы с кармой. Благоприятен для ритуалов перехода.<br><br><b>Карма:</b> Артха (материальное благополучие)<br><br><b>Практика:</b> Медитация на смерть эго, работа с предками. <i>Ом Ямайя Намаха</i>'},

    {name:'Критика',desc:'<b>🪷 Критика</b> — "Резец", накшатра творческой силы и очищения.<br><br><b>Божество:</b> Агни (бог огня)<br><b>Символ:</b> Бритва, пламя<br><b>Раши:</b> Меша / Вришабха (Овен / Телец)<br><br><b>Качества:</b> Очищение, острота ума, творчество. Энергия огня, который сжигает нечистое.<br><br><b>Энергия дня:</b> Благоприятен для очищения, резких решений, творческой работы, приготовления пищи на огне.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Агни Хотра (огненный ритуал), очищающие практики. <i>Ом Агнайе Намаха</i>'},

    {name:'Рохини',desc:'<b>🪷 Рохини</b> — "Красная", "Растущая", накшатра изобилия и красоты.<br><br><b>Божество:</b> Брахма (бог-творец) / Праджапати<br><b>Символ:</b> Повозка, храм, лотос<br><b>Раши:</b> Вришабха (Телец)<br><br><b>Качества:</b> Плодородие, красота, творчество, материальное изобилие. Любимая накшатра Луны — здесь она экзальтирована.<br><br><b>Энергия дня:</b> Исключительно благоприятный день для посева, творчества, романтики, торговли, начала важных дел. День роста и процветания.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Медитация на изобилие, пение, создание красоты, подношение цветов. <i>Ом Брахмане Намаха</i>'},

    {name:'Мригаширша',desc:'<b>🪷 Мригаширша</b> — "Голова оленя", накшатра поиска и исследования.<br><br><b>Божество:</b> Сома (бог Луны и нектара бессмертия)<br><b>Символ:</b> Голова оленя<br><b>Раши:</b> Вришабха / Митхуна (Телец / Близнецы)<br><br><b>Качества:</b> Любопытство, поиск, нежность, странствие. Энергия вечного искателя, ищущего нектар знания.<br><br><b>Энергия дня:</b> Благоприятен для путешествий, исследований, изучения нового, романтических встреч, торговли.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Медитация на луну, практики тишины, созерцание природы. <i>Ом Сомайя Намаха</i>'},

    {name:'Ардра',desc:'<b>🪷 Ардра</b> — "Влажная звезда", накшатра бури, разрушения и обновления.<br><br><b>Божество:</b> Рудра (бог бури, предтеча Шивы)<br><b>Символ:</b> Бриллиант, слеза<br><b>Раши:</b> Митхуна (Близнецы)<br><br><b>Качества:</b> Интенсивность, трансформация через разрушение, острый интеллект. Энергия шторма, очищающего небо.<br><br><b>Энергия дня:</b> День радикальных перемен, интеллектуальных прорывов. Не благоприятен для начала новых дел, но силён для разрушения препятствий.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Медитация на Рудру, работа с тёмными эмоциями, трансформирующие практики. <i>Ом Рудрайя Намаха</i>'},

    {name:'Пунарвасу',desc:'<b>🪷 Пунарвасу</b> — "Возвращение света", накшатра восстановления и надежды.<br><br><b>Божество:</b> Адити (мать богов, богиня бесконечного пространства)<br><b>Символ:</b> Колчан со стрелами, дом<br><b>Раши:</b> Митхуна / Карката (Близнецы / Рак)<br><br><b>Качества:</b> Оптимизм, возрождение, духовность, доброта. Энергия возвращения домой после долгого пути.<br><br><b>Энергия дня:</b> Благоприятен для восстановления, возвращения к прошлым проектам, духовных практик, путешествий домой.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Медитация на возрождение, пранаяма, работа с прощением. <i>Ом Адитйе Намаха</i>'},

    {name:'Пушья',desc:'<b>🪷 Пушья</b> — "Питающая", самая благоприятная из всех накшатр.<br><br><b>Божество:</b> Брихаспати (Юпитер, учитель богов)<br><b>Символ:</b> Цветок, круг, стрела<br><b>Раши:</b> Карката (Рак)<br><br><b>Качества:</b> Питание, защита, духовная мудрость, процветание. Считается "царём накшатр" — несёт чистое благо.<br><br><b>Энергия дня:</b> Один из наиболее благоприятных дней для любых начинаний — свадеб, бизнеса, духовных практик, покупок. Особенно силён в четверг.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Медитация на изобилие и защиту, чтение Вед, подношение учителям. <i>Ом Брихаспатайе Намаха</i>'},

    {name:'Ашлеша',desc:'<b>🪷 Ашлеша</b> — "Объятие", накшатра змеиной мудрости и кундалини.<br><br><b>Божество:</b> Сарпа (змеи-наги, хранители тайных знаний)<br><b>Символ:</b> Змея, колесо<br><b>Раши:</b> Карката (Рак)<br><br><b>Качества:</b> Проницательность, мистицизм, хитрость, целительство ядом. Двойственная накшатра — яд и нектар в одном.<br><br><b>Энергия дня:</b> Благоприятен для тайных практик, изучения мистицизма, работы с кундалини. Неблагоприятен для начала материальных дел.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Медитация на кундалини, работа со страхами, змеиные пранаямы. <i>Ом Сарпебхьо Намаха</i>'},

    {name:'Магха',desc:'<b>🪷 Магха</b> — "Великая", накшатра царской силы и предков.<br><br><b>Божество:</b> Питары (предки, хранители рода)<br><b>Символ:</b> Царский трон, паланкин<br><b>Раши:</b> Симха (Лев)<br><br><b>Качества:</b> Царственность, гордость, сила рода, лидерство. Энергия королевской власти и связи с предками.<br><br><b>Энергия дня:</b> Благоприятен для почитания предков, принятия важных решений, лидерских инициатив, работы с родовой кармой.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Шраддха (ритуал почитания предков), медитация на царское достоинство. <i>Ом Питрибхьо Намаха</i>'},

    {name:'Пурва Пхалгуни',desc:'<b>🪷 Пурва Пхалгуни</b> — "Первый плод смоковницы", накшатра наслаждения и творчества.<br><br><b>Божество:</b> Бхага (бог удачи и супружеского счастья)<br><b>Символ:</b> Гамак, передние ноги кровати<br><b>Раши:</b> Симха (Лев)<br><br><b>Качества:</b> Радость, отдых, наслаждение, творчество, романтика. Энергия законного наслаждения плодами труда.<br><br><b>Энергия дня:</b> Благоприятен для отдыха, романтики, искусства, музыки, свадеб, празднований.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Пение, танец, медитация на радость, практики благодарности. <i>Ом Бхагайя Намаха</i>'},

    {name:'Уттара Пхалгуни',desc:'<b>🪷 Уттара Пхалгуни</b> — "Второй плод смоковницы", накшатра союза и дружбы.<br><br><b>Божество:</b> Арьяман (хранитель союзов, покровитель браков)<br><b>Символ:</b> Задние ноги кровати, смоковница<br><b>Раши:</b> Симха / Канья (Лев / Дева)<br><br><b>Качества:</b> Верность, партнёрство, щедрость, слава. Энергия стабильных союзов и долгосрочных обязательств.<br><br><b>Энергия дня:</b> Отличный день для заключения договоров, браков, деловых партнёрств, благотворительности.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Медитация на единство, практики сострадания, seva (служение). <i>Ом Арйаману Намаха</i>'},

    {name:'Хаста',desc:'<b>🪷 Хаста</b> — "Рука", накшатра мастерства и умелости.<br><br><b>Божество:</b> Савитар (солнечное божество творческой силы)<br><b>Символ:</b> Рука, кулак<br><b>Раши:</b> Канья (Дева)<br><br><b>Качества:</b> Ловкость, мастерство, юмор, хитрость, целительство руками. Энергия умелых рук и быстрого ума.<br><br><b>Энергия дня:</b> Благоприятен для ремёсел, хирургии, торговли, переговоров, изучения ремёсел и искусств.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Мудры (жесты рук), хастa-йога, массаж, ручные искусства. <i>Ом Савитре Намаха</i>'},

    {name:'Читра',desc:'<b>🪷 Читра</b> — "Яркая, сверкающая", накшатра красоты и архитектуры.<br><br><b>Божество:</b> Вишвакарман (небесный архитектор и ремесленник богов)<br><b>Символ:</b> Жемчужина, яркий свет<br><b>Раши:</b> Канья / Тула (Дева / Весы)<br><br><b>Качества:</b> Красота, архитектура, дизайн, блеск, притяжение. Энергия создания совершенных форм.<br><br><b>Энергия дня:</b> Благоприятен для архитектуры, дизайна, создания украшений, работы с красотой во всех её формах.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Медитация на свет, тантрические практики красоты, создание мандал. <i>Ом Вишвакармане Намаха</i>'},

    {name:'Свати',desc:'<b>🪷 Свати</b> — "Меч", "Жемчужина", накшатра независимости и ветра.<br><br><b>Божество:</b> Ваю (бог ветра и праны)<br><b>Символ:</b> Молодой росток, колышущийся на ветру<br><b>Раши:</b> Тула (Весы)<br><br><b>Качества:</b> Независимость, гибкость, дипломатия, торговля. Энергия ветра — свободного, но всепроникающего.<br><br><b>Энергия дня:</b> Благоприятен для торговли, путешествий, дипломатических переговоров, медитации на пране.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Пранаяма, медитация на ветер, практики независимости духа. <i>Ом Вайаве Намаха</i>'},

    {name:'Вишакха',desc:'<b>🪷 Вишакха</b> — "Разветвлённая", накшатра целеустремлённости и победы.<br><br><b>Божество:</b> Индрагни (Индра и Агни — боги власти и огня)<br><b>Символ:</b> Триумфальная арка, гончарный круг<br><b>Раши:</b> Тула / Вришчика (Весы / Скорпион)<br><br><b>Качества:</b> Амбиции, целеустремлённость, страсть, двойственность. Энергия победителя, идущего к цели через любые препятствия.<br><br><b>Энергия дня:</b> Благоприятен для достижения целей, конкуренции, духовной практики, ритуалов огня.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Тапас (аскеза), агни-медитация, практики воли. <i>Ом Индрагнибхьям Намаха</i>'},

    {name:'Анурадха',desc:'<b>🪷 Анурадха</b> — "Следующая за Радхой", накшатра преданности и дружбы.<br><br><b>Божество:</b> Митра (бог дружбы, договоров и солнечного света)<br><b>Символ:</b> Лотос, ряд подношений<br><b>Раши:</b> Вришчика (Скорпион)<br><br><b>Качества:</b> Преданность, сотрудничество, оккультные способности, умение работать в группе. Энергия верной дружбы и духовного братства.<br><br><b>Энергия дня:</b> Благоприятен для дружеских встреч, духовных групп, тайных практик, оккультных исследований.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Бхакти-йога, медитация на преданность, групповые практики. <i>Ом Митрайя Намаха</i>'},

    {name:'Джйештха',desc:'<b>🪷 Джйештха</b> — "Старшая, наибольшая", накшатра власти и защиты.<br><br><b>Божество:</b> Индра (царь богов, повелитель грома)<br><b>Символ:</b> Круглый амулет, зонт<br><b>Раши:</b> Вришчика (Скорпион)<br><br><b>Качества:</b> Власть, защита, мужество, старшинство. Энергия вождя, несущего ответственность за других.<br><br><b>Энергия дня:</b> Благоприятен для защитных ритуалов, лидерских решений, работы с властью, магической защиты.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Медитация на защиту, мантры Индры, практики бесстрашия. <i>Ом Индрайя Намаха</i>'},

    {name:'Мула',desc:'<b>🪷 Мула</b> — "Корень", накшатра разрушения и освобождения.<br><br><b>Божество:</b> Нирритти (богиня разрушения и распада) / Кали<br><b>Символ:</b> Связанный пучок корней, хвост льва<br><b>Раши:</b> Дхану (Стрелец)<br><br><b>Качества:</b> Исследование корней, разрушение иллюзий, радикальная честность. Энергия вырывания с корнем всего ложного.<br><br><b>Энергия дня:</b> Мощный день для глубинных исследований, духовных прорывов, разрыва с прошлым. Неблагоприятен для материальных начинаний.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Медитация на корни бытия, работа с тенью, практики отречения. <i>Ом Ниррите Намаха</i>'},

    {name:'Пурва Ашадха',desc:'<b>🪷 Пурва Ашадха</b> — "Ранняя непобедимая", накшатра очищения водой.<br><br><b>Божество:</b> Апас (богиня воды, космические воды)<br><b>Символ:</b> Веер, бивень слона<br><b>Раши:</b> Дхану (Стрелец)<br><br><b>Качества:</b> Непобедимость, очищение, философия, вдохновение. Энергия первозданных вод, дающих жизнь.<br><br><b>Энергия дня:</b> Благоприятен для философских изысканий, омовений, работы с водной стихией, духовного очищения.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Омовения в священных водах, медитация у воды, джала-нети. <i>Ом Апас Намаха</i>'},

    {name:'Уттара Ашадха',desc:'<b>🪷 Уттара Ашадха</b> — "Поздняя непобедимая", накшатра универсальной победы.<br><br><b>Божество:</b> Вишвадева (десять универсальных божеств)<br><b>Символ:</b> Слоновий бивень, небольшая кровать<br><b>Раши:</b> Дхану / Макара (Стрелец / Козерог)<br><br><b>Качества:</b> Непоколебимость, честность, благородство, долгосрочная победа. Энергия тех, кто побеждает не силой, а праведностью.<br><br><b>Энергия дня:</b> Исключительно благоприятен для важных начинаний — победа обеспечена тому, кто действует с чистым намерением.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Медитация на честность и праведность, практики благородства. <i>Ом Вишвадевебхьо Намаха</i>'},

    {name:'Шравана',desc:'<b>🪷 Шравана</b> — "Слушающая", накшатра обучения и связи.<br><br><b>Божество:</b> Вишну (хранитель вселенной)<br><b>Символ:</b> Три следа, ухо<br><b>Раши:</b> Макара (Козерог)<br><br><b>Качества:</b> Слушание, обучение, связь, сохранение традиций. Энергия ученика, внимающего мудрости учителя.<br><br><b>Энергия дня:</b> Благоприятен для учёбы, слушания священных текстов, медитации на звук, паломничеств, работы с мантрами.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Нада-йога (йога звука), слушание Вед, медитация на ОМ. <i>Ом Вишнаве Намаха</i>'},

    {name:'Дхаништха',desc:'<b>🪷 Дхаништха</b> — "Богатейшая", накшатра ритма и изобилия.<br><br><b>Божество:</b> Ашта Васу (восемь богов изобилия)<br><b>Символ:</b> Барабан дамару, флейта<br><b>Раши:</b> Макара / Кумбха (Козерог / Водолей)<br><br><b>Качества:</b> Ритм, музыкальность, изобилие, марс-энергия. Энергия космического барабана Шивы, задающего ритм творения.<br><br><b>Энергия дня:</b> Благоприятен для музыки, танца, группового пения, ритуалов изобилия, военных действий.<br><br><b>Карма:</b> Дхарма (праведность)<br><br><b>Практика:</b> Мантра-пение, игра на барабанах, медитация на ритм вселенной. <i>Ом Васубхьо Намаха</i>'},

    {name:'Шатабхиша',desc:'<b>🪷 Шатабхиша</b> — "Сто целителей", накшатра тайного исцеления.<br><br><b>Божество:</b> Варуна (бог космического порядка и вод)<br><b>Символ:</b> Пустой круг, тысяча цветков<br><b>Раши:</b> Кумбха (Водолей)<br><br><b>Качества:</b> Исцеление, тайные знания, независимость, мистицизм. Энергия тысячи лекарств, скрытых в природе.<br><br><b>Энергия дня:</b> Благоприятен для медицины, астрологии, тайных практик, астрального путешествия, работы с водой.<br><br><b>Карма:</b> Артха (благополучие)<br><br><b>Практика:</b> Медитация на исцеление, работа с водной стихией, тайные ритуалы. <i>Ом Варунайя Намаха</i>'},

    {name:'Пурва Бхадрапада',desc:'<b>🪷 Пурва Бхадрапада</b> — "Первые благословенные стопы", накшатра трансформирующего огня.<br><br><b>Божество:</b> Аджа Экапада (одноногий козёл, древняя форма Рудры)<br><b>Символ:</b> Меч, передние ноги погребального ложа<br><b>Раши:</b> Кумбха / Мина (Водолей / Рыбы)<br><br><b>Качества:</b> Огненная трансформация, аскеза, двойственность, страсть. Энергия, сжигающая всё лишнее на пути к освобождению.<br><br><b>Энергия дня:</b> День мощных трансформаций и очищения. Подходит для тапаса, работы с тёмными аспектами, ритуалов огня.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Тапас, огненные практики, медитация на трансформацию. <i>Ом Аджа Экападайя Намаха</i>'},

    {name:'Уттара Бхадрапада',desc:'<b>🪷 Уттара Бхадрапада</b> — "Последние благословенные стопы", накшатра мудрости глубин.<br><br><b>Божество:</b> Ахир Будхния (змей глубин, хтоническая форма Шивы)<br><b>Символ:</b> Змей, задние ноги погребального ложа<br><b>Раши:</b> Мина (Рыбы)<br><br><b>Качества:</b> Глубинная мудрость, сострадание, стабильность, кундалини. Энергия змея в глубинах океана — спящая сила освобождения.<br><br><b>Энергия дня:</b> Благоприятен для глубокой медитации, работы с кундалини, изучения тайных учений, практик сострадания.<br><br><b>Карма:</b> Кама (желание)<br><br><b>Практика:</b> Кундалини-медитация, практики глубокого сострадания, работа со снами. <i>Ом Ахирбудхниайя Намаха</i>'},

    {name:'Ревати',desc:'<b>🪷 Ревати</b> — "Богатая, изобильная", последняя и завершающая накшатра.<br><br><b>Божество:</b> Пушан (бог путешествий, пастухов и защитник дорог)<br><b>Символ:</b> Барабан, рыбы в пруду<br><b>Раши:</b> Мина (Рыбы)<br><br><b>Качества:</b> Завершение цикла, питание, защита, сострадание. Энергия нежного завершения пути и подготовки к новому рождению.<br><br><b>Энергия дня:</b> Благоприятен для завершения дел, паломничеств, работы с животными, медитации на растворение в океане сознания.<br><br><b>Карма:</b> Мокша (освобождение)<br><br><b>Практика:</b> Медитация на растворение, практики отпускания, благодарственные ритуалы. <i>Ом Пушне Намаха</i>'}
];
        // Добавить остальные 24 накшатры...
        var nakIdx = Math.floor((new Date().getTime() / 86400000 + 2440588 + 11) % 27);
        if(NAKSHATRAS_FULL[nakIdx]) {
            var nak = NAKSHATRAS_FULL[nakIdx];
            title = nak.name;
            desc = nak.desc;
            color = '#ff8844';
        }
    } else if(type === 'field1' && details.data.label1 === 'ГЕКСАГРАММА') {
        // Даосская система - И-Цзин — поиск по val1
        var hexVal = details.data.val1 || '';
        // Берём имя после пробела (формат: "乾 Цянь·Творчество")
        var hexZh = hexVal.split(' ')[0] || '';
        var hexFound = null;
        if(typeof DAO_HEXAGRAMS !== 'undefined') {
            for(var hi=0;hi<DAO_HEXAGRAMS.length;hi++){
                if(DAO_HEXAGRAMS[hi].zh === hexZh || hexVal.indexOf(DAO_HEXAGRAMS[hi].ru) >= 0){
                    hexFound = DAO_HEXAGRAMS[hi]; break;
                }
            }
        }
        if(hexFound){
            title = '#'+hexFound.n+' '+hexFound.zh+' '+hexFound.ru+' — '+hexFound.key;
            desc = '<b>'+hexFound.zh+' '+hexFound.ru+'</b> ('+hexFound.key+')<br><br>'+hexFound.desc+'<br><br><b>Совет И-Цзин:</b><br><i>「'+hexFound.meaning+'」</i><br><br><b>Практика:</b> Медитируй на образ этой гексаграммы. Созерцай её шесть линий. Спроси себя — как этот архетип проявляется сегодня в твоей жизни?';
        } else {
            title = hexVal;
            desc = '<b>Гексаграмма И-Цзин</b> — один из 64 архетипов Книги Перемен.<br><br>Шесть линий (яо) — Ян (—) и Инь (- -) — описывают текущее состояние энергии Ци.<br><br>Всё в мире в постоянном изменении. Гексаграмма указывает на текущую фазу трансформации.<br><br><b>Практика:</b> Медитация на гексаграмму, созерцание баланса Инь-Ян.';
        }
        color = '#44aacc';
    } else if(type === 'field2' && details.data.label2 === 'У-СИН') {
        // Даосизм - 5 элементов (уже есть подробное описание в elements)
        var elemIdx = -1;
        details.elements.forEach(function(el, i) {
            if(details.data.val2.includes(el.name.split(' ')[1])) elemIdx = i;
        });
        if(elemIdx >= 0) {
            var elem = details.elements[elemIdx];
            title = elem.name;
            desc = elem.desc;
            color = details.data.col2 || '#44aacc';
        }
    } else if(type === 'field1' && details.data.label1 === 'КИН') {
        // Майянская система - Кин
        title = details.data.val1;
        desc = '<b>Кин (Kin)</b> — день в священном календаре Цолькин (260 дней).<br><br><b>Значение:</b> "Кин" означает "день" и "солнце". Каждый кин — уникальная комбинация Тональности (1-13) и Солнечной Печати (20 знаков).<br><br><b>Цолькин:</b> 260-дневный цикл = 13 тонов × 20 печатей. Это галактический код времени, описывающий частоту дня.<br><br><b>Энергия дня:</b> Каждый кин несёт уникальную вибрацию для синхронизации с галактическим сознанием.<br><br><b>Практика:</b> Медитация на свой кин рождения, изучение галактических подписей, синхронизация с естественным временем.';
        color = '#cc44ff';
    } else if(type === 'field2' && (details.data.label2 === 'ТОНАЛЬ' || (details.mayaData && matrixId === 'maya'))) {
        // Майянская система - Тональности (13 галактических тонов)
        var TONES_FULL = [
            {num:1,name:'Магнитный',desc:'<b>1 · Магнитный Тон</b> — начало волны творения.<br><br><b>Ключевое слово:</b> Цель, объединение, привлечение<br><b>Вопрос:</b> Какова моя цель?<br><br><b>Энергия:</b> Первый импульс, магнит который притягивает всё необходимое для реализации намерения. Тон единства и фокуса.<br><br><b>Практика:</b> Определи цель дня, притяни к себе нужные ресурсы, будь магнитом для возможностей.<br><br><b>Совет:</b> Сегодня задай намерение и позволь Вселенной откликнуться.'},
            {num:2,name:'Лунный',desc:'<b>2 · Лунный Тон</b> — поляризация и вызов.<br><br><b>Ключевое слово:</b> Вызов, поляризация, стабилизация<br><b>Вопрос:</b> Каков мой вызов?<br><br><b>Энергия:</b> Двойственность, противоположности, препятствия как учителя. Тон который выявляет слабые места и требует баланса.<br><br><b>Практика:</b> Прими вызов дня, найди баланс между противоположностями, стабилизируй энергию.<br><br><b>Совет:</b> Препятствия — это не блоки, а указатели на рост.'},
            {num:3,name:'Электрический',desc:'<b>3 · Электрический Тон</b> — активация и служение.<br><br><b>Ключевое слово:</b> Служение, активация, связь<br><b>Вопрос:</b> Как я могу служить?<br><br><b>Энергия:</b> Электрический разряд, который связывает и активирует. Тон действия и служения высшей цели.<br><br><b>Практика:</b> Действуй в служении, соедини намерение с действием, будь проводником энергии.<br><br><b>Совет:</b> Служение — это не жертва, а радость проявления своей цели.'},
            {num:4,name:'Самосущий',desc:'<b>4 · Самосущий Тон</b> — форма и определение.<br><br><b>Ключевое слово:</b> Форма, определение, измерение<br><b>Вопрос:</b> Какова форма моего действия?<br><br><b>Энергия:</b> Четыре стороны света, квадрат, основание. Тон который придаёт форму намерению и делает его измеримым.<br><br><b>Практика:</b> Создай структуру, определи границы, измерь прогресс, построй фундамент.<br><br><b>Совет:</b> Форма не ограничивает — она позволяет проявиться.'},
            {num:5,name:'Обертональный',desc:'<b>5 · Обертональный Тон</b> — сияние и расширение.<br><br><b>Ключевое слово:</b> Сияние, расширение, полномочия<br><b>Вопрос:</b> Как расширить своё влияние?<br><br><b>Энергия:</b> Центр креста, точка силы. Тон который даёт полномочия и расширяет влияние во все стороны.<br><br><b>Практика:</b> Излучай свою силу, расширяй границы, прими свои полномочия, сияй.<br><br><b>Совет:</b> Ты — центр своей вселенной. Сияй из этого центра.'},
            {num:6,name:'Ритмический',desc:'<b>6 · Ритмический Тон</b> — равенство и организация.<br><br><b>Ключевое слово:</b> Равенство, организация, баланс<br><b>Вопрос:</b> Как организовать равновесие?<br><br><b>Энергия:</b> Ритм, пульс, баланс между небом и землёй. Тон который организует хаос в порядок.<br><br><b>Практика:</b> Найди ритм дня, организуй пространство, балансируй между отдачей и получением.<br><br><b>Совет:</b> Равновесие — не статика, а танец противоположностей.'},
            {num:7,name:'Резонантный',desc:'<b>7 · Резонантный Тон</b> — настройка и канал.<br><br><b>Ключевое слово:</b> Настройка, канал, вдохновение<br><b>Вопрос:</b> Как настроиться на высшую волю?<br><br><b>Энергия:</b> Мистический центр, точка резонанса. Тон который открывает канал к высшему руководству.<br><br><b>Практика:</b> Настройся на высшую частоту, стань каналом, слушай вдохновение, резонируй с Источником.<br><br><b>Совет:</b> Сегодня ты — антенна между небом и землёй.'},
            {num:8,name:'Галактический',desc:'<b>8 · Галактический Тон</b> — целостность и гармония.<br><br><b>Ключевое слово:</b> Целостность, гармония, моделирование<br><b>Вопрос:</b> Живу ли я в целостности?<br><br><b>Энергия:</b> Бесконечность (8 на боку ∞), целостность всех частей. Тон который интегрирует и гармонизирует.<br><br><b>Практика:</b> Интегрируй все части себя, живи в целостности, моделируй гармонию, будь примером.<br><br><b>Совет:</b> Целостность — это когда внутреннее и внешнее едины.'},
            {num:9,name:'Солнечный',desc:'<b>9 · Солнечный Тон</b> — намерение и реализация.<br><br><b>Ключевое слово:</b> Намерение, импульс, реализация<br><b>Вопрос:</b> Как реализовать намерение?<br><br><b>Энергия:</b> Солнечный импульс, пульсация проявления. Тон который даёт финальный толчок к реализации.<br><br><b>Практика:</b> Пульсируй намерение в реальность, дай импульс, реализуй задуманное, сияй как солнце.<br><br><b>Совет:</b> Сегодня — день завершения и проявления. Действуй!'},
            {num:10,name:'Планетарный',desc:'<b>10 · Планетарный Тон</b> — проявление и совершенство.<br><br><b>Ключевое слово:</b> Проявление, совершенство, производство<br><b>Вопрос:</b> Как проявить совершенство?<br><br><b>Энергия:</b> Планетарное проявление, материализация в форме. Тон который доводит до совершенства и производит результат.<br><br><b>Практика:</b> Произведи результат, проявись в мире, доведи до совершенства, будь планетой — самодостаточной и полной.<br><br><b>Совет:</b> Совершенство — не идеал, а полнота проявления.'},
            {num:11,name:'Спектральный',desc:'<b>11 · Спектральный Тон</b> — освобождение и растворение.<br><br><b>Ключевое слово:</b> Освобождение, растворение, очищение<br><b>Вопрос:</b> Как освободиться?<br><br><b>Энергия:</b> Спектр света, разложение на составляющие. Тон который освобождает от старого и очищает для нового.<br><br><b>Практика:</b> Освободись от лишнего, растворь привязанности, очисти пространство, отпусти контроль.<br><br><b>Совет:</b> Освобождение — это не потеря, а обретение лёгкости.'},
            {num:12,name:'Кристальный',desc:'<b>12 · Кристальный Тон</b> — сотрудничество и универсализация.<br><br><b>Ключевое слово:</b> Сотрудничество, универсализация, преданность<br><b>Вопрос:</b> Как сотрудничать?<br><br><b>Энергия:</b> Кристалл с 12 гранями, отражающий свет во все стороны. Тон который объединяет всех в общей цели.<br><br><b>Практика:</b> Сотрудничай, объединяйся, будь преданным общему делу, универсализируй свой опыт.<br><br><b>Совет:</b> Вместе мы — кристалл, отражающий свет Источника.'},
            {num:13,name:'Космический',desc:'<b>13 · Космический Тон</b> — присутствие и трансцендентность.<br><br><b>Ключевое слово:</b> Присутствие, трансцендентность, магия<br><b>Вопрос:</b> Как превзойти?<br><br><b>Энергия:</b> Завершение волны, выход за пределы. Тон который трансцендирует и открывает магию присутствия.<br><br><b>Практика:</b> Будь здесь и сейчас, превзойди ограничения, открой магию момента, завершай цикл с благодарностью.<br><br><b>Совет:</b> Магия — это полное присутствие в моменте. Будь здесь.'}
        ];
        // Извлекаем номер тона из val2 (например "1 · Единство")
        var toneNum = parseInt(details.data.val2) || 1;
        var toneData = TONES_FULL[toneNum - 1];
        if(toneData) {
            title = toneData.num + ' · ' + toneData.name;
            desc = toneData.desc;
        } else {
            title = details.data.val2 || 'Тональность';
            desc = '<b>Тональность (Tone)</b> — один из 13 галактических тонов, описывающих качество энергии дня.';
        }
        color = '#cc44ff';
    } else if(type === 'field3' && (details.data.label3 === 'ЗНАК ДНЯ' || (details.mayaData && matrixId === 'maya'))) {
        // Майянская система - 20 Солнечных Печатей
        title = details.data.val3 || 'Солнечная Печать';
        desc = '<b>Солнечная Печать</b> — один из 20 архетипов творения в календаре Цолькин.<br><br><b>20 Печатей:</b> Красный Дракон, Белый Ветер, Синяя Ночь, Жёлтое Семя, Красный Змей, Белый Мост Миров, Синяя Рука, Жёлтая Звезда, Красная Луна, Белая Собака, Синяя Обезьяна, Жёлтый Человек, Красное Небо, Белый Волшебник, Синий Орёл, Жёлтый Воин, Красная Земля, Белое Зеркало, Синяя Буря, Жёлтое Солнце.<br><br><b>Цвета:</b><br>• Красный — инициация, начало<br>• Белый — очищение, дух<br>• Синий — трансформация, магия<br>• Жёлтый — созревание, плод<br><br><b>Энергия дня:</b> Каждая печать несёт уникальную частоту и учит определённому качеству сознания.<br><br><b>Практика:</b> Медитация на печать дня, изучение её качеств, воплощение архетипа в жизни.';
        color = '#cc44ff';
    } else if(type === 'field1' && (details.data.label1 === 'КЛЮЧ ГЕНА' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Ключ Гена
        title = details.data.val1 || 'Генный Ключ';
        desc = '<b>Генный Ключ</b> — один из 64 архетипов сознания, соответствующих 64 гексаграммам И-Цзин и 64 кодонам ДНК.<br><br><b>Система:</b> Разработана Ричардом Раддом, основана на И-Цзин и Дизайне Человека. 64 ключа соответствуют 64 кодонам ДНК — генетическому коду жизни.<br><br><b>Три уровня частоты:</b><br>• <b>Тень</b> (низкая частота) — страх, реактивность, выживание<br>• <b>Дар</b> (средняя частота) — творчество, служение, гений<br>• <b>Сиддхи</b> (высокая частота) — просветление, единство, божественность<br><br><b>Энергия дня:</b> Ключ дня активирует определённый аспект коллективного сознания. Наблюдай его проявление в себе, других и мире.<br><br><b>Практика:</b> Созерцание Тени → принятие → трансформация в Дар → открытие Сиддхи. Путь от страха к просветлению через принятие.';
        color = '#00cc88';
    } else if(type === 'field2' && (details.data.label2 === 'ТЕНЬ' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Тень
        title = details.data.val2 || 'Тень';
        desc = '<b>Тень</b> — низкочастотное состояние Генного Ключа.<br><br><b>Сущность:</b> Тень — это не зло, а непроявленный потенциал. Это страх, который блокирует поток жизни. Каждая Тень содержит в себе семя Дара.<br><br><b>Как работает:</b> Тень проявляется когда мы в стрессе, страхе, реактивности. Это паттерн выживания, записанный в ДНК.<br><br><b>Примеры Теней:</b><br>• Бесчестность → скрывание правды из страха<br>• Хаос → страх потери контроля<br>• Гнев → подавленная жизненная сила<br>• Тревога → страх будущего<br><br><b>Путь трансформации:</b><br>1. <b>Осознай</b> — увидь Тень без осуждения<br>2. <b>Прими</b> — позволь ей быть, не борись<br>3. <b>Созерцай</b> — наблюдай как она трансформируется в Дар<br><br><b>Практика дня:</b> Наблюдай проявление Тени дня в себе и других. Не суди, просто созерцай. Принятие Тени — первый шаг к Дару.<br><br><b>Важно:</b> Тень нельзя "победить" или "избавиться" от неё. Можно только принять и трансформировать через осознанность.';
        color = '#00cc88';
    } else if(type === 'field3' && (details.data.label3 === 'СИДДХИ' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Сиддхи
        title = details.data.val3 || 'Сиддхи';
        desc = '<b>Сиддхи</b> — высокочастотное просветлённое состояние Генного Ключа.<br><br><b>Сущность:</b> Сиддхи (санскр. "совершенство") — это божественное качество, проявленное через человека. Это не достижение, а откровение того, что всегда было.<br><br><b>Как проявляется:</b> Сиддхи нельзя "достичь" усилием. Оно приходит как благодать, когда Тень полностью принята, а Дар раскрыт до предела. Это спонтанное пробуждение.<br><br><b>Примеры Сиддхи:</b><br>• Честность → абсолютная прозрачность бытия<br>• Присутствие → растворение в моменте<br>• Единство → переживание недвойственности<br>• Милость → безусловная любовь<br><br><b>Характеристики:</b><br>• Не личное достижение, а проявление Источника<br>• Спонтанное, не контролируемое эго<br>• Благословляет всех вокруг<br>• Выходит за пределы причинности<br><br><b>Энергия дня:</b> Сиддхи дня — это высшая частота, доступная сегодня. Даже мгновенное прикосновение к ней меняет всё.<br><br><b>Практика:</b> Не пытайся "достичь" Сиддхи. Просто будь открыт. Созерцай Дар до тех пор, пока он не растворится в Сиддхи сам. Это происходит в своё время.<br><br><b>Совет:</b> Сиддхи — это не цель пути, а сам путь в его завершённости. Будь здесь, сейчас, полностью.';
        color = '#00cc88';
    } else if(type === 'field4' && (details.data.label4 === 'ТОТЕМ СИДДХИ' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Тотем Сиддхи
        title = details.data.val4 || 'Тотем Сиддхи';
        desc = '<b>Тотем Сиддхи</b> — животное-проводник высшей частоты Генного Ключа.<br><br><b>Сущность:</b> Каждый Генный Ключ имеет три тотемных животных, соответствующих трём уровням частоты. Тотем Сиддхи — это животное просветлённого состояния.<br><br><b>Символизм:</b> Животное Сиддхи обычно связано с небом, полётом, свободой — птицы, парящие существа. Они символизируют освобождение от земных ограничений, взгляд с высоты божественной перспективы.<br><br><b>Качества:</b><br>• Свобода и лёгкость<br>• Широта видения<br>• Связь с небом и духом<br>• Красота и грация<br>• Вестники высших миров<br><br><b>Энергия дня:</b> Тотем Сиддхи дня — это архетип, через который проявляется божественное качество. Созерцай это животное, его движения, его суть.<br><br><b>Практика:</b> Медитация на тотем Сиддхи. Представь себя этим животным. Почувствуй его свободу, его связь с небом. Позволь его качествам проявиться через тебя.<br><br><b>Шаманская традиция:</b> В шаманизме тотемы — это духи-помощники. Тотем Сиддхи — это дух, который ведёт к просветлению. Призови его, и он покажет путь.';
        color = '#00cc88';
    } else if(type === 'field5' && (details.data.label5 === 'ТОТЕМ ДАРА' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Тотем Дара
        title = details.data.val5 || 'Тотем Дара';
        desc = '<b>Тотем Дара</b> — животное-проводник творческой частоты Генного Ключа.<br><br><b>Сущность:</b> Тотем Дара соответствует средней частоте — уровню гения, творчества, служения. Это животное, которое живёт в гармонии с миром.<br><br><b>Символизм:</b> Животные Дара обычно млекопитающие — волки, медведи, дельфины, слоны. Они живут в сообществах, заботятся о своих, служат экосистеме. Они символизируют баланс между небом и землёй.<br><br><b>Качества:</b><br>• Сила и мудрость<br>• Социальность и служение<br>• Баланс инстинкта и разума<br>• Забота о стае/семье<br>• Творческая адаптация<br><br><b>Энергия дня:</b> Тотем Дара дня показывает, как проявить свой гений в мире. Это животное учит балансу между личным и коллективным, между силой и мягкостью.<br><br><b>Практика:</b> Изучи повадки тотема Дара. Как он охотится? Как заботится о своих? Как взаимодействует с миром? Примени эти качества в своей жизни.<br><br><b>Путь трансформации:</b> Когда Тень принята, она естественно трансформируется в Дар. Тотем Дара — это твоя истинная природа, освобождённая от страха.';
        color = '#00cc88';
    } else if(type === 'field6' && (details.data.label6 === 'ТОТЕМ ТЕНИ' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Тотем Тени
        title = details.data.val6 || 'Тотем Тени';
        desc = '<b>Тотем Тени</b> — животное-проводник низкой частоты Генного Ключа.<br><br><b>Сущность:</b> Тотем Тени соответствует частоте страха и выживания. Это животное, которое живёт в режиме реактивности, инстинкта, борьбы за существование.<br><br><b>Символизм:</b> Животные Тени обычно рептилии, насекомые, мелкие существа — змеи, пауки, скорпионы, черви. Они символизируют древние инстинкты, страх, холоднокровность. Но они также — основа пищевой цепи, без них экосистема рухнет.<br><br><b>Качества:</b><br>• Инстинкт выживания<br>• Реактивность и страх<br>• Холоднокровность<br>• Скрытность и защита<br>• Древняя мудрость рептильного мозга<br><br><b>Энергия дня:</b> Тотем Тени дня показывает, какой страх активен в коллективном поле. Это не враг — это учитель. Тень содержит семя Дара.<br><br><b>Практика:</b> Не борись с тотемом Тени. Прими его. Он часть тебя — древняя, инстинктивная, выживающая. Когда ты принимаешь Тень, она трансформируется.<br><br><b>Важно:</b> Тотем Тени — не "плохое" животное. Змея, паук, скорпион — они священны во многих традициях. Они символизируют трансформацию (змея сбрасывает кожу), терпение (паук плетёт сеть), защиту (скорпион жалит врагов).<br><br><b>Алхимия:</b> Принятие тотема Тени — это алхимия. Яд становится лекарством. Страх становится силой. Тьма становится светом.';
        color = '#00cc88';
    } else if(type === 'field7' && (details.data.label7 === 'МИНЕРАЛ' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Минерал
        title = details.data.val7 || 'Минерал';
        desc = '<b>Минерал Генного Ключа</b> — кристалл, резонирующий с частотой архетипа.<br><br><b>Сущность:</b> Каждый из 64 Генных Ключей имеет соответствующий минерал или кристалл. Минералы — это застывшая память Земли, они хранят частоты и могут усиливать или балансировать энергию Ключа.<br><br><b>Как работают минералы:</b> Кристаллы имеют упорядоченную кристаллическую решётку, которая резонирует с определёнными частотами. Когда ты носишь минерал Генного Ключа, он помогает настроиться на его частоту.<br><br><b>Три применения:</b><br>• <b>Для Тени:</b> Минерал помогает осознать и принять Тень. Носи его когда чувствуешь страх или реактивность.<br>• <b>Для Дара:</b> Минерал усиливает проявление Дара. Носи его когда хочешь раскрыть свой гений.<br>• <b>Для Сиддхи:</b> Минерал создаёт пространство для благодати. Медитируй с ним для прикосновения к просветлению.<br><br><b>Практика дня:</b> Найди минерал Генного Ключа дня (или его изображение). Подержи его в руках. Почувствуй его вибрацию. Попроси его показать тебе путь от Тени к Дару к Сиддхи.<br><br><b>Очищение:</b> Минералы накапливают энергию. Очищай их под проточной водой, на солнце/луне, или дымом шалфея.<br><br><b>Программирование:</b> Подержи минерал в руках и мысленно попроси его помочь тебе с конкретным Генным Ключом. Кристаллы — живые существа, они откликаются на намерение.<br><br><b>Совет:</b> Если у тебя нет физического минерала, визуализируй его. Намерение важнее формы.';
        color = '#00cc88';
    } else if(type === 'field8' && (details.data.label8 === 'АМИНОКИСЛОТА' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Аминокислота
        title = details.data.val8 || 'Аминокислота';
        desc = '<b>Аминокислота</b> — строительный блок ДНК, соответствующий Генному Ключу.<br><br><b>Сущность:</b> 64 Генных Ключа соответствуют 64 кодонам ДНК. Каждый кодон кодирует определённую аминокислоту — строительный блок белков и жизни. Это прямая связь между сознанием и материей.<br><br><b>ДНК и сознание:</b> ДНК — это не просто химическая молекула. Это антенна, которая принимает и передаёт информацию. 64 кодона ДНК резонируют с 64 архетипами сознания. Когда меняется сознание, меняется экспрессия генов.<br><br><b>20 аминокислот:</b> Существует 20 основных аминокислот, но 64 кодона. Это означает, что несколько кодонов могут кодировать одну аминокислоту. Эта избыточность — не случайность, а мудрость природы.<br><br><b>Эпигенетика:</b> Современная наука открыла, что гены можно включать и выключать без изменения ДНК. Это называется эпигенетика. Генные Ключи — это эпигенетическая система: меняя сознание (от Тени к Дару), мы меняем экспрессию генов.<br><br><b>Энергия дня:</b> Аминокислота дня — это биохимический аспект архетипа. Она показывает, какой строительный блок жизни активен сегодня в коллективном поле.<br><br><b>Практика:</b> Созерцай связь между сознанием и материей. Твои мысли, эмоции, состояния сознания буквально меняют химию твоего тела. Принятие Тени и раскрытие Дара — это не метафора, это биохимическая трансформация.<br><br><b>Научный факт:</b> Исследования показывают, что медитация, любовь, прощение меняют экспрессию генов. Генные Ключи — это карта этой трансформации.';
        color = '#00cc88';
    } else if(type === 'field9' && (details.data.label9 === 'ГЕКСАГРАММА' || (details.geneData && matrixId === 'gene'))) {
        // Генные Ключи - Гексаграмма
        title = details.data.val9 || 'Гексаграмма И-Цзин';
        desc = '<b>Гексаграмма И-Цзин</b> — древний символ, соответствующий Генному Ключу.<br><br><b>Сущность:</b> 64 Генных Ключа напрямую соответствуют 64 гексаграммам И-Цзин — древнейшей книги мудрости (3000 лет до н.э.). Это не совпадение. И-Цзин — это карта сознания, записанная в символах.<br><br><b>Структура гексаграммы:</b> Каждая гексаграмма состоит из 6 линий (сплошных или прерывистых). 6 линий = 2⁶ = 64 комбинации. Это тот же код, что и в ДНК: 4 основания × 3 позиции = 4³ = 64 кодона.<br><br><b>Инь и Ян:</b><br>• Сплошная линия (—) = Ян = активное, мужское, небо<br>• Прерывистая линия (- -) = Инь = пассивное, женское, земля<br><br><b>Как читать:</b> Гексаграмма читается снизу вверх. Нижние 3 линии — внутренняя триграмма (земля, основа). Верхние 3 линии — внешняя триграмма (небо, проявление).<br><br><b>И-Цзин и Генные Ключи:</b> Ричард Радд взял 64 гексаграммы И-Цзин и раскрыл их через призму трёх частот (Тень-Дар-Сиддхи). Каждая гексаграмма — это архетип, который может проявляться на разных уровнях сознания.<br><br><b>Энергия дня:</b> Гексаграмма дня — это древний символ, который активен сегодня. Созерцай его. Медитируй на линии. Они говорят на языке символов, который понимает подсознание.<br><br><b>Практика:</b> Нарисуй гексаграмму дня. Созерцай её. Какие линии сплошные? Какие прерывистые? Где Инь, где Ян? Гексаграмма — это ключ к архетипу.<br><br><b>Связь с ДНК:</b> 64 гексаграммы = 64 кодона ДНК. Древние китайцы знали код жизни 5000 лет назад. Они записали его в символах И-Цзин.';
        color = '#00cc88';
    } else if(type === 'field1' && (details.data.label1 === 'ЛУЧ ДНЯ' || (details.shambhalaData && matrixId === 'shambhala'))) {
        // Шамбала - Луч дня
        title = details.data.val1 || 'Луч дня';
        desc = '<b>Луч дня</b> — один из 7 лучей Шамбалы, управляющих эволюцией сознания.<br><br><b>Сущность:</b> 7 лучей — это 7 потоков божественной энергии, исходящих из Шамбалы (духовного центра планеты). Каждый луч несёт определённое качество сознания и управляет определённой сферой жизни.<br><br><b>7 Лучей:</b><br>• <b>I Луч — Воля-Власть</b> (Вулкан) — сила, лидерство, разрушение старого<br>• <b>II Луч — Любовь-Мудрость</b> (Юпитер) — любовь, учительство, объединение<br>• <b>III Луч — Активный Интеллект</b> (Сатурн) — творчество, адаптация, манипуляция материей<br>• <b>IV Луч — Гармония через Конфликт</b> (Меркурий) — красота, искусство, борьба противоположностей<br>• <b>V Луч — Конкретное Знание</b> (Венера) — наука, исследование, точность<br>• <b>VI Луч — Преданность-Идеализм</b> (Марс) — вера, фанатизм, служение идеалу<br>• <b>VII Луч — Церемониальная Магия</b> (Уран) — ритуал, порядок, проявление духа в материи<br><br><b>Энергия дня:</b> Луч дня окрашивает всё происходящее своим качеством. Наблюдай как проявляется энергия луча в событиях, людях, твоих мыслях.<br><br><b>Практика:</b> Настройся на луч дня. Призови его качество. Стань проводником этой энергии.';
        color = '#aaccff';
    } else if(type === 'field2' && (details.data.label2 === 'ЭЛЕМЕНТ' || (details.shambhalaData && matrixId === 'shambhala'))) {
        // Шамбала - Элемент
        title = details.data.val2 || 'Элемент';
        desc = '<b>Элемент Калачакры</b> — одна из 5 первостихий тибетской традиции.<br><br><b>Сущность:</b> Калачакра (Колесо Времени) — высшая тантра тибетского буддизма. 5 элементов — это 5 аспектов реальности, 5 мудростей Будды, 5 цветов радуги.<br><br><b>5 Элементов:</b><br>• <b>🌳 Дерево</b> — рост, расширение, весна, печень, гнев → сострадание<br>• <b>🔥 Огонь</b> — трансформация, лето, сердце, радость → различающая мудрость<br>• <b>🌍 Земля</b> — стабильность, центр, селезёнка, беспокойство → равностность<br>• <b>⚔ Металл</b> — сжатие, осень, лёгкие, печаль → зеркальная мудрость<br>• <b>💧 Вода</b> — течение, зима, почки, страх → мудрость дхармадхату<br><br><b>60-летний цикл:</b> Калачакра использует 60-летний цикл (12 животных × 5 элементов). Каждый год, месяц, день имеет свой элемент.<br><br><b>Энергия дня:</b> Элемент дня показывает, какая первостихия активна. Работай с её качествами — балансируй, усиливай, трансформируй.<br><br><b>Практика:</b> Медитация на элемент. Визуализируй его цвет, почувствуй его качество в теле. Элемент — это не метафора, это живая энергия.';
        color = '#aaccff';
    } else if(type === 'field3' && (details.data.label3 === 'ФАЗА ГОДА' || (details.shambhalaData && matrixId === 'shambhala'))) {
        // Шамбала - Фаза года
        title = details.data.val3 || 'Фаза года';
        desc = '<b>Фаза года</b> — День Брахмы или Ночь Вишну в космическом цикле.<br><br><b>Сущность:</b> В индуистской космологии время делится на День и Ночь Брахмы. День — период проявления, активности, творения. Ночь — период растворения, покоя, возвращения в непроявленное.<br><br><b>☀ День Брахмы (март-август):</b><br>• Период активности и проявления<br>• Время для действий, проектов, экспансии<br>• Энергия Ян — расширение, рост, свет<br>• Благоприятно: начинания, строительство, обучение<br><br><b>🌙 Ночь Вишну (сентябрь-февраль):</b><br>• Период покоя и интеграции<br>• Время для завершения, отдыха, внутренней работы<br>• Энергия Инь — сжатие, покой, тьма<br>• Благоприятно: медитация, завершение циклов, отпускание<br><br><b>Космический ритм:</b> Это не просто метафора. Вселенная дышит — вдох (День) и выдох (Ночь). Живи в гармонии с этим ритмом.<br><br><b>Практика:</b> В День Брахмы — действуй, твори, проявляй. В Ночь Вишну — созерцай, интегрируй, отпускай. Не борись с ритмом космоса.';
        color = '#aaccff';
    } else if(type === 'field4' && (details.data.label4 === 'ЦИКЛ 60' || (details.shambhalaData && matrixId === 'shambhala'))) {
        // Шамбала - Цикл 60
        title = details.data.val4 || 'Цикл 60';
        desc = '<b>60-летний цикл Калачакры</b> — великий цикл времени в тибетской традиции.<br><br><b>Сущность:</b> 60 лет = 12 животных × 5 элементов. Это полный цикл трансформации сознания. Каждые 60 лет космос возвращается в ту же точку, но на новом витке спирали.<br><br><b>Структура цикла:</b><br>• 12 животных (как в китайском календаре)<br>• 5 элементов (Дерево, Огонь, Земля, Металл, Вода)<br>• Каждое животное проходит через все 5 элементов за 60 лет<br><br><b>Чёрная и Белая половины:</b><br>• <b>⚫ Чёрная половина (1-30 годы):</b> период испытаний, очищения, работы с тенью<br>• <b>⚪ Белая половина (31-50 годы):</b> период света, реализации, проявления мудрости<br>• <b>Переход (51-60 годы):</b> подготовка к новому циклу<br><br><b>Энергия цикла:</b> Каждый год 60-летнего цикла несёт уникальную комбинацию энергий. Это не повторяется 60 лет.<br><br><b>Практика:</b> Узнай, в каком году цикла ты родился. Это твой кармический код. Узнай, в каком году цикла мы сейчас. Это коллективная карма человечества.<br><br><b>Мудрость:</b> Калачакра учит: время — не линия, а спираль. Мы возвращаемся в те же точки, но каждый раз на новом уровне сознания.';
        color = '#aaccff';
    } else if(type === 'field1' && (details.data.label1 === 'БОГ ДНЯ' || (details.slavicGods && matrixId === 'slavic'))) {
        // Славянская система - Боги
        var SLAVIC_GODS_FULL = [
            {name:'Перун',desc:'<b>⚡ Перун</b> — бог грозы, войны и справедливости. Громовержец, защитник Яви.<br><br><b>Сфера:</b> Сила, справедливость, защита, воинская доблесть.<br><b>Символы:</b> Молния, топор, дуб<br><br><b>Энергия дня:</b> День силы и справедливости. Благоприятен для защиты правды, борьбы с несправедливостью, воинских практик.<br><br><b>Практика:</b> Боевые искусства, защитные обереги, призыв силы Перуна, "Слава Перуну!"'},
            {name:'Велес',desc:'<b>🐻 Велес</b> — бог мудрости, магии, богатства и скота. Хранитель Нави, проводник между мирами.<br><br><b>Сфера:</b> Мудрость, магия, богатство, связь с предками.<br><b>Символы:</b> Медведь, посох, руны<br><br><b>Энергия дня:</b> День магии и мудрости. Благоприятен для гаданий, работы с предками, накопления богатства, изучения тайных знаний.<br><br><b>Практика:</b> Руническая магия, общение с духами природы, медитация в лесу.'},
            {name:'Макошь',desc:'<b>🕸 Макошь</b> — богиня судьбы, ткачиха нитей жизни, покровительница женщин и рукоделия.<br><br><b>Сфера:</b> Судьба, женская магия, рукоделие, урожай.<br><b>Символы:</b> Веретено, нить, пряжа<br><br><b>Энергия дня:</b> День женской силы и судьбы. Благоприятен для рукоделия, работы с судьбой, женских практик.<br><br><b>Практика:</b> Плетение, вышивка, работа с нитями судьбы, женские круги.'},
            {name:'Сварог',desc:'<b>🔨 Сварог</b> — бог-кузнец, творец мира, отец богов. Небесный кузнец, создавший землю и законы.<br><br><b>Сфера:</b> Творчество, ремесло, порядок, законы мироздания.<br><b>Символы:</b> Молот, наковальня, огонь кузни, квадрат<br><br><b>Энергия дня:</b> День творчества и созидания. Благоприятен для ремёсел, создания нового, установления порядка, работы с огнём и металлом.<br><br><b>Практика:</b> Кузнечное дело, любое ремесло, создание оберегов, работа с огнём. "Слава Сварогу!"'},
            {name:'Лада',desc:'<b>🌸 Лада</b> — богиня любви, красоты, весны и брака. Мать богов, покровительница семьи и лада (гармонии).<br><br><b>Сфера:</b> Любовь, красота, гармония, семья, весна.<br><b>Символы:</b> Лебедь, берёза, цветы, кольцо<br><br><b>Энергия дня:</b> День любви и гармонии. Благоприятен для свадеб, примирения, создания семьи, женских практик, работы с красотой.<br><br><b>Практика:</b> Любовная магия, семейные обряды, украшение дома, пение, хороводы. "Лада, Лада!"'},
            {name:'Стрибог',desc:'<b>🌪 Стрибог</b> — бог ветра, воздуха и неба. Повелитель всех ветров, дед ветров.<br><br><b>Сфера:</b> Ветер, воздух, дыхание, свобода, путешествия.<br><b>Символы:</b> Вихрь, перо, стрела ветра<br><br><b>Энергия дня:</b> День ветра и свободы. Благоприятен для путешествий, работы с дыханием, очищения воздухом, освобождения от старого.<br><br><b>Практика:</b> Дыхательные практики, медитация на ветер, путешествия, работа с воздушной стихией. Выйди на ветер и почувствуй его силу.'},
            {name:'Морена',desc:'<b>❄ Морена (Мара)</b> — богиня зимы, смерти и возрождения. Тёмная богиня, владычица Нави.<br><br><b>Сфера:</b> Зима, смерть, переход, возрождение, Навь.<br><b>Символы:</b> Чёрная коса, серп, зимние узоры, чучело<br><br><b>Энергия дня:</b> День завершения циклов и перехода. Благоприятен для отпускания старого, работы со смертью как переходом, зимних практик, работы с Навью.<br><br><b>Практика:</b> Медитация на смерть и возрождение, отпускание старого, работа с предками, зимние обряды. Морена — не зло, а необходимый переход. Сжигание чучела Морены на Масленицу символизирует конец зимы.'},
            {name:'Даждьбог',desc:'<b>☀ Даждьбог</b> — бог солнца, света, тепла и плодородия. Дающий бог, податель благ.<br><br><b>Сфера:</b> Солнце, свет, тепло, изобилие, щедрость.<br><b>Символы:</b> Солнечный диск, золото, колесо<br><br><b>Энергия дня:</b> День света и изобилия. Благоприятен для благодарности, щедрости, работы с солнечной энергией, земледелия.<br><br><b>Практика:</b> Приветствие солнцу, благодарственные обряды, работа с золотом, щедрость к другим. "Даждьбоже, дай!"'},
            {name:'Хорс',desc:'<b>🌞 Хорс</b> — бог солнечного диска, движения солнца по небу. Солнечный конь, везущий светило.<br><br><b>Сфера:</b> Движение солнца, циклы, время, ритм.<br><b>Символы:</b> Солнечный конь, круг, колесо года<br><br><b>Энергия дня:</b> День циклов и ритма. Благоприятен для работы с временем, циклическими практиками, понимания своего места в круге года.<br><br><b>Практика:</b> Медитация на движение солнца, работа с циклами природы, хороводы (движение по кругу). Наблюдай путь солнца от восхода до заката.'},
            {name:'Ярило',desc:'<b>🌱 Ярило</b> — бог весны, плодородия, страсти и ярой силы. Молодой бог пробуждающейся природы.<br><br><b>Сфера:</b> Весна, плодородие, страсть, молодость, сексуальная энергия.<br><b>Символы:</b> Колос, фаллос, зелёный щит, белый конь<br><br><b>Энергия дня:</b> День страсти и пробуждения. Благоприятен для любви, зачатия, посева, пробуждения жизненных сил, работы с сексуальной энергией.<br><br><b>Практика:</b> Весенние обряды, работа с жизненной силой, танцы, любовная магия. "Ярило, ярь!"'},
            {name:'Купала',desc:'<b>🔥💧 Купала</b> — бог летнего солнцестояния, очищения огнём и водой. Бог летнего расцвета.<br><br><b>Сфера:</b> Очищение, летнее солнце, союз огня и воды, любовь.<br><b>Символы:</b> Костёр, вода, венок, папоротник<br><br><b>Энергия дня:</b> День очищения и магии. Благоприятен для очистительных ритуалов, поиска папоротника (тайного знания), любовной магии, прыжков через костёр.<br><br><b>Практика:</b> Купание в реке, прыжки через костёр, плетение венков, поиск цветка папоротника (озарения). Ночь Купалы — самая магическая ночь года.'},
            {name:'Семаргл',desc:'<b>🔥🐉 Семаргл</b> — бог огня, защитник семян и посевов. Огненный крылатый пёс или дракон.<br><br><b>Сфера:</b> Огонь, защита, семена, связь миров.<br><b>Символы:</b> Крылатый пёс, огонь, семена<br><br><b>Энергия дня:</b> День защиты и огненной силы. Благоприятен для защитных ритуалов, работы с огнём, охраны посевов и начинаний.<br><br><b>Практика:</b> Огненные обряды, защита дома и посевов, работа с семенами (идеями), призыв огненной защиты. Семаргл охраняет границы между мирами.'},
            {name:'Тригла',desc:'<b>🌙🌙🌙 Тригла</b> — триединая богиня луны (Дева-Мать-Старуха), богиня трёх миров.<br><br><b>Сфера:</b> Луна, женские циклы, тройственность, магия.<br><b>Символы:</b> Три луны, треугольник, три лица<br><br><b>Энергия дня:</b> День лунной магии и женской силы. Благоприятен для работы с лунными циклами, женских мистерий, магии трёх миров (Явь-Навь-Правь).<br><br><b>Практика:</b> Лунные медитации, работа с тремя ликами богини, женские круги, магия трёх. Почитай три фазы луны и три возраста женщины.'},
            {name:'Чернобог',desc:'<b>🌑 Чернобог</b> — бог тьмы, зимы, испытаний и Нави. Тёмный лик мироздания, необходимый для равновесия.<br><br><b>Сфера:</b> Тьма, зима, смерть, испытания, Навь.<br><b>Символы:</b> Чёрный цвет, зима, ночь, волк<br><br><b>Энергия дня:</b> День испытаний и работы с тенью. Благоприятен для работы с тёмными аспектами, принятия смерти как части жизни, зимних практик.<br><br><b>Практика:</b> Работа с тенью, медитация на тьму, принятие испытаний, почитание предков в Нави. Чернобог — не зло, а необходимая тьма, дающая отдых и трансформацию.'},
            {name:'Белобог',desc:'<b>☀ Белобог</b> — бог света, добра, дня и Яви. Светлый лик мироздания, противовес Чернобогу.<br><br><b>Сфера:</b> Свет, добро, день, счастье, Явь.<br><b>Символы:</b> Белый цвет, день, солнце, белый конь<br><br><b>Энергия дня:</b> День света и радости. Благоприятен для добрых дел, радости, работы со светом, дневных практик.<br><br><b>Практика:</b> Солнечные медитации, добрые дела, работа со светом, радость как духовная практика. Белобог и Чернобог — два лика единого целого.'},
            {name:'Род',desc:'<b>🌌 Род</b> — бог-творец, источник всего сущего, прародитель богов и людей. Единый бог до разделения.<br><br><b>Сфера:</b> Творение, род, предки, единство всего.<br><b>Символы:</b> Мировое древо, яйцо, круг<br><br><b>Энергия дня:</b> День единства и связи с родом. Благоприятен для работы с предками, родовой памятью, пониманием единства всего сущего.<br><br><b>Практика:</b> Почитание предков, работа с родовым древом, медитация на единство, "Слава Роду!" Род — это всё, что было, есть и будет.'}
        ];
        // Поиск бога по имени
        var godName = (details.data.val1 || '').trim();
        var godFound = null;
        for(var gi=0; gi<SLAVIC_GODS_FULL.length; gi++){
            if(SLAVIC_GODS_FULL[gi].name === godName || godName.indexOf(SLAVIC_GODS_FULL[gi].name) >= 0){
                godFound = SLAVIC_GODS_FULL[gi];
                break;
            }
        }
        if(godFound){
            title = godFound.name;
            desc = godFound.desc;
        } else {
            title = godName;
            desc = '<b>Бог-покровитель дня</b> в славянском Круголете. Каждый день находится под покровительством одного из 16 богов славянского пантеона.<br><br><b>Практика:</b> Обращение к богу дня, изучение его качеств, подношения.';
        }
        color = '#ff4444';
    } else if(type === 'field1' && details.data.label1 === 'ДЕНЬ') {
        // Юлианский календарь - День недели
        var WEEKDAYS_FULL = [
            {name:'Воскресенье',desc:'<b>☀ Воскресенье</b> — день Солнца (Dies Solis), день отдыха и духовного обновления.<br><br><b>Планета:</b> Солнце<br><b>Металл:</b> Золото<br><b>Цвет:</b> Золотой, жёлтый<br><br><b>Энергия:</b> Отдых, восстановление, духовность, семья. День для души, а не для дел.<br><br><b>Традиция:</b> В христианстве — день воскресения Христа, день покоя. В язычестве — день солнечных богов.<br><br><b>Практика:</b> Отдых, семейные собрания, духовные практики, благодарность.'},
            {name:'Понедельник',desc:'<b>🌙 Понедельник</b> — день Луны (Dies Lunae), день новых начинаний.<br><br><b>Планета:</b> Луна<br><b>Металл:</b> Серебро<br><b>Цвет:</b> Серебряный, белый<br><br><b>Энергия:</b> Новое начало, эмоции, интуиция, женская энергия. Первый рабочий день недели.<br><br><b>Традиция:</b> День, когда начинается новый цикл работы и планирования.<br><br><b>Практика:</b> Планирование недели, работа с эмоциями, лунные практики.'},
            {name:'Вторник',desc:'<b>♂ Вторник</b> — день Марса (Dies Martis), день силы и действия.<br><br><b>Планета:</b> Марс<br><b>Металл:</b> Железо<br><b>Цвет:</b> Красный<br><br><b>Энергия:</b> Сила, действие, борьба, страсть. День воинов и активных действий.<br><br><b>Традиция:</b> Благоприятен для начала сложных дел, требующих силы и решительности.<br><br><b>Практика:</b> Физические упражнения, решительные действия, преодоление препятствий.'},
            {name:'Среда',desc:'<b>☿ Среда</b> — день Меркурия (Dies Mercurii), день коммуникации и торговли.<br><br><b>Планета:</b> Меркурий<br><b>Металл:</b> Ртуть<br><b>Цвет:</b> Оранжевый<br><br><b>Энергия:</b> Коммуникация, торговля, обучение, быстрота ума. Середина недели.<br><br><b>Традиция:</b> Благоприятен для переговоров, обучения, путешествий, торговли.<br><br><b>Практика:</b> Обучение, общение, чтение, письмо.'},
            {name:'Четверг',desc:'<b>♃ Четверг</b> — день Юпитера (Dies Jovis), день расширения и благословения.<br><br><b>Планета:</b> Юпитер<br><b>Металл:</b> Олово<br><b>Цвет:</b> Синий, фиолетовый<br><br><b>Энергия:</b> Расширение, рост, благословение, мудрость. День учителей и философов.<br><br><b>Традиция:</b> Благоприятен для важных начинаний, обучения, духовного роста.<br><br><b>Практика:</b> Изучение философии, щедрость, благословение других.'},
            {name:'Пятница',desc:'<b>♀ Пятница</b> — день Венеры (Dies Veneris), день любви и красоты.<br><br><b>Планета:</b> Венера<br><b>Металл:</b> Медь<br><b>Цвет:</b> Зелёный, розовый<br><br><b>Энергия:</b> Любовь, красота, гармония, наслаждение. День завершения рабочей недели.<br><br><b>Традиция:</b> Благоприятен для любви, искусства, отдыха, празднований.<br><br><b>Практика:</b> Искусство, украшение себя, романтика, наслаждение жизнью.'},
            {name:'Суббота',desc:'<b>♄ Суббота</b> — день Сатурна (Dies Saturni), день структуры и завершения.<br><br><b>Планета:</b> Сатурн<br><b>Металл:</b> Свинец<br><b>Цвет:</b> Чёрный, тёмно-синий<br><br><b>Энергия:</b> Структура, дисциплина, завершение, подведение итогов. Конец недели.<br><br><b>Традиция:</b> День отдыха (Шаббат в иудаизме), завершения дел, подготовки к новой неделе.<br><br><b>Практика:</b> Подведение итогов, очищение, подготовка к новому циклу.'}
        ];
        var dayIdx = new Date().getDay();
        if(WEEKDAYS_FULL[dayIdx]) {
            var day = WEEKDAYS_FULL[dayIdx];
            title = day.name;
            desc = day.desc;
            color = '#c9a84c';
        }
    } else if(type === 'field2' && (details.data.label2 === 'СТИХИЯ' || (details.slavicElements && matrixId === 'slavic'))) {
        // Славянская система - Стихии
        var SLAVIC_ELEMENTS_FULL = [
            {name:'Огонь',desc:'<b>🔥 Огонь</b> — первостихия творения, преобразования и очищения.<br><br><b>Сущность:</b> Огонь — это сила трансформации, страсть, воля. Он сжигает старое, освобождая место новому. Огонь — это жизненная сила, Агни внутри каждого существа.<br><br><b>Энергия дня:</b> День огненной силы. Благоприятен для активных действий, очищения, трансформации, работы с волей и страстью.<br><br><b>Практика:</b> Огненные ритуалы, прыжки через костёр, работа со свечами, разжигание внутреннего огня. Почитай огонь как священную силу.<br><br><b>Боги огня:</b> Сварог (небесный огонь), Семаргл (огонь-защитник), Агуня (богиня огня)'},
            {name:'Земля',desc:'<b>🌍 Земля</b> — стихия плодородия, стабильности и материального мира.<br><br><b>Сущность:</b> Земля — это Мать Сыра Земля, дающая жизнь всему. Она стабильна, плодородна, питает и поддерживает. Земля — это тело мира, материя.<br><br><b>Энергия дня:</b> День заземления и стабильности. Благоприятен для работы с землёй, посева, строительства, укоренения, материальных дел.<br><br><b>Практика:</b> Хождение босиком по земле, работа в саду, заземляющие медитации, почитание Матери Земли. Прикоснись к земле и почувствуй её силу.<br><br><b>Боги земли:</b> Мать Сыра Земля, Велес (хранитель земных богатств), Макошь (урожай)'},
            {name:'Вода',desc:'<b>💧 Вода</b> — стихия течения, очищения и эмоций.<br><br><b>Сущность:</b> Вода — это поток жизни, текучесть, адаптация. Она очищает, питает, принимает любую форму. Вода — это эмоции, интуиция, связь с Навью.<br><br><b>Энергия дня:</b> День текучести и очищения. Благоприятен для омовений, работы с эмоциями, интуицией, адаптации к переменам.<br><br><b>Практика:</b> Омовение в реке или роднике, работа с водой, медитация у воды, очищение водой. Вода смывает всё лишнее.<br><br><b>Боги воды:</b> Дана (богиня рек), Купала (очищение водой), Водяной (дух вод)'},
            {name:'Воздух',desc:'<b>🌪 Воздух</b> — стихия свободы, движения и дыхания жизни.<br><br><b>Сущность:</b> Воздух — это дыхание мира, ветер перемен, свобода духа. Он невидим, но всепроникающ. Воздух — это мысль, слово, связь между мирами.<br><br><b>Энергия дня:</b> День свободы и движения. Благоприятен для путешествий, общения, работы с дыханием, освобождения от старого.<br><br><b>Практика:</b> Дыхательные практики, медитация на ветер, путешествия, работа со словом и мыслью. Выйди на ветер и почувствуй свободу.<br><br><b>Боги воздуха:</b> Стрибог (повелитель ветров), Догода (западный ветер), Позвизд (северный ветер)'},
            {name:'Эфир',desc:'<b>✨ Эфир</b> — пятая стихия, дух, пространство, связующая сила всех стихий.<br><br><b>Сущность:</b> Эфир (Акаша) — это тонкая материя, из которой соткано пространство. Это дух, пронизывающий всё. Эфир — это связь между Явью, Навью и Правью.<br><br><b>Энергия дня:</b> День духовной работы и связи миров. Благоприятен для медитаций, духовных практик, работы с тонкими энергиями.<br><br><b>Практика:</b> Медитация на пустоту и полноту, работа с пространством, духовные путешествия между мирами. Эфир — это то, что содержит всё.<br><br><b>Боги эфира:</b> Род (всеобъемлющий), Сварог (творец пространства)'},
            {name:'Металл',desc:'<b>⚔ Металл</b> — стихия твёрдости, структуры и оружия.<br><br><b>Сущность:</b> Металл — это кованая сила, структура, оружие и инструмент. Он тверд, но поддаётся обработке огнём. Металл — это воля, закалённая в испытаниях.<br><br><b>Энергия дня:</b> День силы и структуры. Благоприятен для кузнечного дела, создания инструментов, укрепления воли, установления границ.<br><br><b>Практика:</b> Работа с металлом, ковка, создание оружия или инструментов, закалка характера. Металл куётся в огне.<br><br><b>Боги металла:</b> Сварог (небесный кузнец), Перун (оружие грома)'},
            {name:'Дерево',desc:'<b>🌳 Дерево</b> — стихия роста, связи земли и неба, жизненной силы.<br><br><b>Сущность:</b> Дерево — это Мировое Древо, соединяющее все миры. Оно растёт, тянется к свету, питается землёй. Дерево — это рост, развитие, связь поколений.<br><br><b>Энергия дня:</b> День роста и связи. Благоприятен для посадки деревьев, работы с деревом, роста и развития, связи с предками.<br><br><b>Практика:</b> Обнять дерево, медитация у дерева, работа с деревом, посадка деревьев. Дерево — живой мост между мирами.<br><br><b>Боги дерева:</b> Велес (хранитель лесов), Леший (дух леса)'},
            {name:'Свет',desc:'<b>☀ Свет</b> — стихия проявления, ясности и Яви.<br><br><b>Сущность:</b> Свет — это проявленный мир, Явь, то что видимо и познаваемо. Свет разгоняет тьму, делает явным скрытое. Свет — это знание, ясность, день.<br><br><b>Энергия дня:</b> День ясности и проявления. Благоприятен для познания, работы со светом, проявления намерений, дневных практик.<br><br><b>Практика:</b> Солнечные медитации, работа со светом, проявление намерений, познание явного мира. Свет — это Явь.<br><br><b>Боги света:</b> Белобог (светлый лик), Даждьбог (солнце), Хорс (солнечный диск)'},
            {name:'Тьма',desc:'<b>🌑 Тьма</b> — стихия сокрытого, покоя и Нави.<br><br><b>Сущность:</b> Тьма — это непроявленный мир, Навь, то что скрыто и таинственно. Тьма — это не зло, а необходимый покой, отдых, тайна. Тьма — это ночь, сон, смерть как переход.<br><br><b>Энергия дня:</b> День тайны и покоя. Благоприятен для работы с тенью, отдыха, ночных практик, работы с Навью и предками.<br><br><b>Практика:</b> Медитация в темноте, работа с тенью, ночные практики, почитание предков. Тьма — это Навь, мир предков и тайн.<br><br><b>Боги тьмы:</b> Чернобог (тёмный лик), Мара (богиня смерти), Велес (проводник в Навь)'}
        ];
        var elemName = (details.data.val2 || '').trim();
        var elemFound = null;
        for(var ei=0; ei<SLAVIC_ELEMENTS_FULL.length; ei++){
            if(SLAVIC_ELEMENTS_FULL[ei].name === elemName || elemName.indexOf(SLAVIC_ELEMENTS_FULL[ei].name) >= 0){
                elemFound = SLAVIC_ELEMENTS_FULL[ei];
                break;
            }
        }
        if(elemFound){
            title = elemFound.name;
            desc = elemFound.desc;
        } else {
            title = elemName;
            desc = '<b>Стихия дня</b> в Круголете Числобога. Одна из 9 первостихий славянского мироздания.';
        }
        color = '#ff4444';
    } else if(type === 'field4' && (details.data.label4 === 'ТИП ДНЯ' || (details.slavicDays && matrixId === 'slavic'))) {
        // Славянская система - Типы дней (9-дневная неделя)
        var SLAVIC_DAYS_FULL = [
            {name:'День Богов',desc:'<b>✦ День Богов</b> — первый день девятидневной недели, посвящённый почитанию богов.<br><br><b>Сущность:</b> В этот день особенно сильна связь с богами. Правь (мир богов) ближе к Яви. День для обращения к богам, требы, благодарности.<br><br><b>Энергия дня:</b> Благоприятен для духовных практик, обрядов, обращения к богам, изучения священных знаний.<br><br><b>Практика:</b> Треба богам (подношения), молитвы, изучение Вед, посещение капищ. "Слава богам нашим!"<br><br><b>Неблагоприятно:</b> Суетные дела, споры, грубая работа.'},
            {name:'День Предков',desc:'<b>🕯 День Предков</b> — день почитания предков и связи с родом.<br><br><b>Сущность:</b> В этот день открыты врата в Навь, мир предков. Предки слышат нас особенно хорошо. День для работы с родовой памятью и кармой.<br><br><b>Энергия дня:</b> Благоприятен для почитания предков, работы с родом, посещения могил, родовых практик.<br><br><b>Практика:</b> Тризна (поминальная трапеза), обращение к предкам, работа с родовым древом, медитация на род. Зажги свечу предкам.<br><br><b>Неблагоприятно:</b> Начало новых дел без благословения рода.'},
            {name:'День Природы',desc:'<b>🌿 День Природы</b> — день почитания природы и духов природы.<br><br><b>Сущность:</b> В этот день особенно сильна связь с природой. Духи природы (лешие, водяные, полевики) активны. День для работы с природными силами.<br><br><b>Энергия дня:</b> Благоприятен для работы в саду, лесу, общения с природой, травничества, работы с духами природы.<br><br><b>Практика:</b> Прогулка в лесу, общение с деревьями, сбор трав, подношения духам природы. Почувствуй живую душу природы.<br><br><b>Неблагоприятно:</b> Вред природе, вырубка деревьев без нужды.'},
            {name:'День Человека',desc:'<b>👤 День Человека</b> — день работы над собой, самопознания.<br><br><b>Сущность:</b> В этот день фокус на себе, своём развитии, своей душе. День для работы с собой, познания себя, своего пути.<br><br><b>Энергия дня:</b> Благоприятен для самопознания, обучения, развития навыков, работы над собой, медитации.<br><br><b>Практика:</b> Медитация, самоанализ, обучение, развитие талантов, работа с телом и душой. Познай себя.<br><br><b>Неблагоприятно:</b> Забвение себя в суете, игнорирование своих нужд.'},
            {name:'День Земли',desc:'<b>🌍 День Земли</b> — день почитания Матери Сырой Земли.<br><br><b>Сущность:</b> В этот день особенно сильна связь с Землёй. Мать Земля слышит нас. День для работы с землёй, заземления, материальных дел.<br><br><b>Энергия дня:</b> Благоприятен для работы с землёй, посева, строительства, заземления, материальных дел, работы с телом.<br><br><b>Практика:</b> Работа в огороде, хождение босиком по земле, заземляющие практики, благодарность Земле. Прикоснись к земле.<br><br><b>Неблагоприятно:</b> Копание земли в некоторые священные дни, вред земле.'},
            {name:'День Неба',desc:'<b>☁ День Неба</b> — день почитания Неба-Отца, Сварги.<br><br><b>Сущность:</b> В этот день особенно сильна связь с Небом, Сваргой (небесным миром). День для высоких помыслов, духовных устремлений.<br><br><b>Энергия дня:</b> Благоприятен для духовных практик, высоких целей, работы с небесными силами, астрологии.<br><br><b>Практика:</b> Медитация на небо, созерцание звёзд, высокие помыслы, обращение к небесным богам. Подними взор к небу.<br><br><b>Неблагоприятно:</b> Приземлённость, забвение духовного.'},
            {name:'День Огня',desc:'<b>🔥 День Огня</b> — день почитания священного огня.<br><br><b>Сущность:</b> В этот день особенно сильна огненная стихия. Огонь — священная сила, очищающая и преобразующая. День для огненных практик.<br><br><b>Энергия дня:</b> Благоприятен для огненных ритуалов, очищения, трансформации, активных действий, работы с волей.<br><br><b>Практика:</b> Огненные обряды, прыжки через костёр, работа со свечами, очищение огнём. Почитай священный огонь.<br><br><b>Неблагоприятно:</b> Тушение священного огня, неуважение к огню.'},
            {name:'День Воды',desc:'<b>💧 День Воды</b> — день почитания священных вод.<br><br><b>Сущность:</b> В этот день особенно сильна водная стихия. Вода — очищающая и питающая сила. День для водных практик.<br><br><b>Энергия дня:</b> Благоприятен для омовений, работы с водой, очищения, работы с эмоциями и интуицией.<br><br><b>Практика:</b> Омовение в реке или роднике, работа с водой, очищение водой, медитация у воды. Вода смывает всё лишнее.<br><br><b>Неблагоприятно:</b> Загрязнение воды, неуважение к водным источникам.'},
            {name:'День Воздуха',desc:'<b>🌪 День Воздуха</b> — день почитания ветра и воздушной стихии.<br><br><b>Сущность:</b> В этот день особенно сильна воздушная стихия. Ветер — дыхание мира, сила перемен. День для работы с дыханием и движением.<br><br><b>Энергия дня:</b> Благоприятен для путешествий, работы с дыханием, перемен, общения, освобождения от старого.<br><br><b>Практика:</b> Дыхательные практики, медитация на ветер, путешествия, работа со словом. Выйди на ветер.<br><br><b>Неблагоприятно:</b> Застой, неподвижность.'}
        ];
        var dayTypeName = (details.data.val4 || '').trim();
        var dayTypeFound = null;
        for(var di=0; di<SLAVIC_DAYS_FULL.length; di++){
            if(SLAVIC_DAYS_FULL[di].name === dayTypeName || dayTypeName.indexOf(SLAVIC_DAYS_FULL[di].name) >= 0){
                dayTypeFound = SLAVIC_DAYS_FULL[di];
                break;
            }
        }
        if(dayTypeFound){
            title = dayTypeFound.name;
            desc = dayTypeFound.desc;
        } else {
            title = dayTypeName;
            desc = '<b>Тип дня</b> в Круголете Числобога. Один из 9 дней славянской недели.';
        }
        color = '#ff4444';
    } else if(type === 'field3' && (details.data.label3 === 'ЛЕТО' || (details.slavicGods && matrixId === 'slavic'))) {
        // Славянская система - Лето (год)
        title = details.data.val3 || 'Лето от СМЗХ';
        desc = '<b>Лето от Сотворения Мира в Звёздном Храме (СМЗХ)</b><br><br><b>Летоисчисление:</b> Славянское летоисчисление ведётся от момента заключения мира (мирного договора) между Великой Расой (славяно-ариями) и Великим Драконом (древним Китаем) в Звёздном Храме.<br><br><b>Дата события:</b> 5508 год до н.э. по современному григорианскому календарю.<br><br><b>Философия:</b> В отличие от западного "года", славяне использовали понятие "Лето" — полный цикл природы от весны до весны, подчёркивая связь времени с природными циклами.<br><br><b>16-летний цикл животных:</b> Каждые 16 лет повторяется цикл тотемных животных (Тёмный Сох, Золотой Тур, Прекрасный Лось и т.д.), каждое из которых несёт свою энергию и уроки.<br><br><b>Современность:</b> 2026 год н.э. = 7534 Лето от СМЗХ.<br><br><b>Практика:</b> Осознание глубины времени, связь с предками, понимание циклов природы и истории.';
        color = '#ff4444';
    } else {
        // Общее описание для других полей
        title = details.data.label1 || 'Характеристика дня';
        desc = 'Эта характеристика отражает особую энергию сегодняшнего дня согласно выбранной системе восприятия времени.';
    }

    // Показываем детальное описание
    if(window.openKnowledge) {
        var subtitle = '✦ КАЛЕНДАРЬ ✦';
        if(window._calendarMatrix) subtitle = '✦ ' + window._calendarMatrix + ' ✦';

        window.openKnowledge({
            icon: '📅',
            col: color,
            title: title,
            subtitle: subtitle,
            body: '<div style="font-family:\'Cormorant Garamond\',serif;font-size:15px;line-height:1.85;color:rgba(255,255,255,0.8);">' + desc + '</div>'
        });
    }
};
