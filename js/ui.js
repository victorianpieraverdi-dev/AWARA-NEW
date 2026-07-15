// ══════════════════════════════════════════════════════
// ✦ КАМНИ ТРАНСЦЕНДЕНТНОСТИ · ДОСПЕХИ ЗОЛОТОГО ВЕКА
// ✦ КАРТА САТЬЯ ЮГИ · ЗОЛОТО ОСОЗНАННОСТИ
// ══════════════════════════════════════════════════════

// ── КАМНИ ТРАНСЦЕНДЕНТНОСТИ ──
window.TRANSCENDENCE_STONES = [
    {id:'sat',   name:'САТ',       icon:'◉', col:'#ffffff', req:15000, desc:'Камень Бытия · Чистое Существование · Основа всего проявленного',         power:'Все сферы +25% скорость роста'},
    {id:'chit',  name:'ЧИТ',       icon:'◈', col:'#00faff', req:20000, desc:'Камень Сознания · Безграничное Знание · Свет Истинного Видения',          power:'Открывает скрытые измерения'},
    {id:'ananda',name:'АНАНДА',    icon:'✦', col:'#ffd700', req:30000, desc:'Камень Блаженства · Вечная Радость · Состояние вне страдания',             power:'Ключи ×3 · Свет пассивно +50/мин'},
    {id:'om',    name:'ОМ',        icon:'ॐ', col:'#cc88ff', req:50000, desc:'Камень Первозвука · Вибрация Творения · Пранава — мать всех мантр',       power:'Резонанс планетарный · Все бонусы ×1.5'},
    {id:'ra',    name:'РА',        icon:'☀', col:'#ff8800', req:75000, desc:'Камень Солнца · Первичный Огонь · Источник Жизни всей Системы',            power:'Держава РА полностью открыта'},
    {id:'infinity',name:'АН-АДИ',  icon:'∞', col:'#aaaaff', req:100000,desc:'Камень Бесконечности · Вне времени и пространства · Предвечное Состояние', power:'Планетарный Логос · Высшая Инициация'},
];

// ── ДОСПЕХИ ЗОЛОТОГО ВЕКА ──
window.GOLDEN_ARMOR = [
    {id:'sandals', name:'САНДАЛИИ ДХАРМЫ',   icon:'👟', col:'#c9a84c', pieces:1,  req:5000,   desc:'Твёрдость на Пути · Каждый шаг — служение',       bonus:'Тапас ×1.2'},
    {id:'robe',    name:'ОДЕЯНИЕ САТВЫ',      icon:'🥻', col:'#88ccff', pieces:2,  req:10000,  desc:'Чистота намерения · Без тени эго',                  bonus:'Свет +10/мин пассивно'},
    {id:'belt',    name:'ПОЯС ИСТИНЫ',         icon:'💛', col:'#ffd700', pieces:3,  req:18000,  desc:'Сила воли опоясана · Карма очищена',               bonus:'Стоимость сфер -15%'},
    {id:'gloves',  name:'ПЕРЧАТКИ СОЗИДАНИЯ', icon:'🤲', col:'#44ff88', pieces:4,  req:28000,  desc:'Руки строителя Золотого Века · Творение из Света',   bonus:'Строительство ×1.3'},
    {id:'shield',  name:'ЩИТ СОСТРАДАНИЯ',   icon:'🛡', col:'#4488ff', pieces:5,  req:40000,  desc:'Защита Ахимсы · Непроницаем для Тьмы',              bonus:'Ильдабаоф не атакует'},
    {id:'crown',   name:'КОРОНА САТЬЯ ЮГИ',  icon:'👑', col:'#ffffff', pieces:6,  req:60000,  desc:'Полное пробуждение · Венец Золотого Века надет',     bonus:'Все системы ×2 · Держава РА'},
    {id:'armor',   name:'ДОСПЕХ РА ПОЛНЫЙ',   icon:'⚔', col:'#ffd700', pieces:7,  req:100000, desc:'Воин Света облачён · Строитель Сатья Юги готов',    bonus:'Максимальная Реализация'},
];

// ── ОБЪЕКТЫ САТЬЯ ЮГИ ──
window.SATYA_OBJECTS = [
    {id:'school',   name:'ШКОЛА МУДРОСТИ',     icon:'🏛', col:'#88ccff', goldCost:500,   desc:'Место познания Истины · Гурукула Нового Века',           built:false},
    {id:'temple',   name:'ХРАМ ЕДИНСТВА',       icon:'⛩', col:'#ffd700', goldCost:1000,  desc:'Святилище всех традиций · Пространство Тишины',          built:false},
    {id:'garden',   name:'САД ИСЦЕЛЕНИЯ',       icon:'🌿', col:'#44ff88', goldCost:800,   desc:'Лес целительных растений · Аюрведа и Прана',             built:false},
    {id:'library',  name:'БИБЛИОТЕКА АКАШИ',    icon:'📚', col:'#cc88ff', goldCost:1500,  desc:'Хранилище вечного Знания · Записи всех эпох',            built:false},
    {id:'village',  name:'ДЕРЕВНЯ ДХАРМЫ',      icon:'🏘', col:'#ffaa44', goldCost:2000,  desc:'Поселение праведных · Еда вода тепло для каждой семьи', built:false},
    {id:'city',     name:'ГОРОД СВЕТА',         icon:'🌆', col:'#ffffff', goldCost:5000,  desc:'Средоточие Золотого Века · Столица Сатья Юги',            built:false},
    {id:'planet',   name:'ПЛАНЕТАРНЫЙ ЛОГОС',   icon:'🌍', col:'#00faff', goldCost:15000, desc:'Вся планета — единый организм Света · Высшая цель',       built:false},
];

// Хранилище
window._satyaData = (function(){
    try{ return JSON.parse(localStorage.getItem('awara_satya')||'{"gold":0,"stones":[],"armor":[],"objects":[]}'); }catch(e){ return {gold:0,stones:[],armor:[],objects:[]}; }
})();
function saveSatya(){ try{ localStorage.setItem('awara_satya',JSON.stringify(window._satyaData)); }catch(e){} }

// Конвертация света в золото Сатья Юги (1 золото = 10 света × бонус ключей)
window.convertLightToGold = function(amount){
    if(typeof state==='undefined') return;
    var rate = 10; // 10 света = 1 золото
    var keyMult = (state._keyMult||1.0);
    var gold = Math.floor((amount||100) / rate * keyMult);
    if((state.totalLight||0) < (amount||100)){ if(typeof log==='function') log('РА','⚡ Недостаточно света'); return; }
    state.totalLight -= (amount||100);
    window._satyaData.gold = (window._satyaData.gold||0) + gold;
    saveSatya();
    if(typeof log==='function') log('ЗОЛОТО','✦ +'+ gold +' золота Сатья Юги');
    if(typeof updateProgressPanel==='function') updateProgressPanel();
    return gold;
};

// Открыть главный экран Сатья Юги
window.openSatyaYuga = function(){
    var m = document.getElementById('satya-modal');
    if(m) m.remove();
    m = document.createElement('div');
    m.id = 'satya-modal';
    m.style.cssText = 'position:fixed;inset:0;z-index:99992;background:rgba(0,0,0,0.92);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;';

    var light = typeof state!=='undefined'?(state.totalLight||0):0;
    var gold = window._satyaData.gold||0;
    var stones = window._satyaData.stones||[];
    var armor = window._satyaData.armor||[];
    var objects = window._satyaData.objects||[];

    // Камни
    var stonesHTML = window.TRANSCENDENCE_STONES.map(function(s){
        var owned = stones.indexOf(s.id)!==-1;
        var canGet = light >= s.req && !owned;
        return '<div style="padding:10px 12px;border-radius:10px;background:'+(owned?s.col+'14':'rgba(255,255,255,0.02)')+';border:1px solid '+(owned?s.col+'44':'rgba(255,255,255,0.06)')+';margin-bottom:6px;display:flex;align-items:center;gap:10px;">'
            +'<div style="font-size:22px;'+(owned?'filter:drop-shadow(0 0 10px '+s.col+')':'')+'">'+(owned?s.icon:'🌑')+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:10px;color:'+(owned?s.col:'rgba(255,255,255,0.25)')+';letter-spacing:0.15em;">'+s.name+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.3);margin-top:2px;">'+s.power+'</div></div>'
            +'<div style="text-align:right;">'
            +(owned?'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:'+s.col+';">✦ ОБРЕТЁН</div>'
            :canGet?'<button data-sid="'+s.id+'" class="sy-get-stone" style="padding:5px 10px;border-radius:6px;cursor:pointer;background:'+s.col+'14;border:1px solid '+s.col+'44;font-family:JetBrains Mono,monospace;font-size:7px;color:'+s.col+';touch-action:manipulation;">ОБРЕСТИ</button>'
            :'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.2);">'+s.req+' света</div>')
            +'</div></div>';
    }).join('');

    // Доспехи
    var armorHTML = window.GOLDEN_ARMOR.map(function(a){
        var owned = armor.indexOf(a.id)!==-1;
        var canGet = gold >= a.goldCost && !owned;
        return '<div style="padding:10px 12px;border-radius:10px;background:'+(owned?a.col+'10':'rgba(255,255,255,0.02)')+';border:1px solid '+(owned?a.col+'33':'rgba(255,255,255,0.06)')+';margin-bottom:6px;display:flex;align-items:center;gap:10px;">'
            +'<div style="font-size:20px;">'+a.icon+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:9px;color:'+(owned?a.col:'rgba(255,255,255,0.3)')+';letter-spacing:0.12em;">'+a.name+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin-top:2px;">'+a.bonus+'</div></div>'
            +'<div style="text-align:right;">'
            +(owned?'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+a.col+';">✦ НАДЕТ</div>'
            :'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,215,0,0.4);">'+a.goldCost+' 🪙'
            +(canGet?'</div><button data-aid="'+a.id+'" data-cost="'+a.goldCost+'" class="sy-get-armor" style="padding:4px 8px;border-radius:5px;cursor:pointer;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;margin-top:3px;touch-action:manipulation;">СОЗДАТЬ</button>'
            :'</div>'))
            +'</div></div>';
    }).join('');

    // Объекты Сатья Юги
    var objHTML = window.SATYA_OBJECTS.map(function(o){
        var built = objects.indexOf(o.id)!==-1;
        var canBuild = gold >= o.goldCost && !built;
        return '<div style="padding:10px 12px;border-radius:10px;background:'+(built?o.col+'0a':'rgba(255,255,255,0.02)')+';border:1px solid '+(built?o.col+'33':'rgba(255,255,255,0.06)')+';margin-bottom:6px;display:flex;align-items:center;gap:10px;">'
            +'<div style="font-size:22px;">'+o.icon+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:9px;color:'+(built?o.col:'rgba(255,255,255,0.3)')+';letter-spacing:0.12em;">'+o.name+'</div>'
            +'<div style="font-family:Cormorant Garamond,serif;font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">'+o.desc+'</div></div>'
            +'<div style="text-align:right;">'
            +(built?'<div style="font-size:16px;">✅</div>'
            :'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,215,0,0.4);">'+o.goldCost+' 🪙'
            +(canBuild?'</div><button data-oid="'+o.id+'" data-cost="'+o.goldCost+'" class="sy-build" style="padding:4px 8px;border-radius:5px;cursor:pointer;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;margin-top:3px;touch-action:manipulation;">ПОСТРОИТЬ</button>'
            :'</div>'))
            +'</div></div>';
    }).join('');

    m.innerHTML = '<div style="width:100%;max-width:520px;background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,0.06),rgba(4,2,18,0.99) 60%);border:1px solid rgba(255,215,0,0.25);border-radius:20px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;">'

        // Шапка
        +'<div style="padding:20px 22px 14px;border-bottom:1px solid rgba(255,215,0,0.1);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;">'
        +'<div><div style="font-family:Cinzel Decorative,serif;font-size:13px;color:#ffd700;letter-spacing:0.2em;">✦ САТЬЯ ЮГА</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.25);margin-top:3px;">ЗОЛОТОЙ ВЕК · СВЕТ ОСОЗНАННОСТИ</div></div>'
        +'<div style="text-align:right;">'
        +'<div style="font-family:Cinzel,serif;font-size:13px;color:#ffd700;">'+gold+' 🪙</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,215,0,0.4);">золото Сатья Юги</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.25);margin-top:2px;">'+light+' света</div></div></div>'

        // Конвертер
        +'<div style="padding:10px 22px;background:rgba(255,215,0,0.04);border-bottom:1px solid rgba(255,215,0,0.08);flex-shrink:0;display:flex;align-items:center;gap:10px;">'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,215,0,0.5);">💡 СВЕТ → 🪙 ЗОЛОТО · курс 10:1</div>'
        +'<div style="flex:1;display:flex;gap:6px;">'
        +'<button data-conv="100" class="sy-conv" style="padding:5px 10px;border-radius:6px;cursor:pointer;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;touch-action:manipulation;">100💡→10🪙</button>'
        +'<button data-conv="500" class="sy-conv" style="padding:5px 10px;border-radius:6px;cursor:pointer;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;touch-action:manipulation;">500💡→50🪙</button>'
        +'<button data-conv="1000" class="sy-conv" style="padding:5px 10px;border-radius:6px;cursor:pointer;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);font-family:JetBrains Mono,monospace;font-size:7px;color:#ffd700;touch-action:manipulation;">1000💡→100🪙</button>'
        +'</div></div>'

        // Вкладки
        +'<div id="sy-tabs" style="display:flex;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;">'
        +'<button data-tab="stones" class="sy-tab" style="flex:1;padding:8px 4px;background:rgba(255,255,255,0.06);border:none;border-bottom:2px solid rgba(255,215,0,0.6);font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,215,0,0.8);cursor:pointer;letter-spacing:0.1em;">◉ КАМНИ</button>'
        +'<button data-tab="armor" class="sy-tab" style="flex:1;padding:8px 4px;background:transparent;border:none;border-bottom:2px solid transparent;font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.35);cursor:pointer;letter-spacing:0.1em;">⚔ ДОСПЕХИ</button>'
        +'<button data-tab="map" class="sy-tab" style="flex:1;padding:8px 4px;background:transparent;border:none;border-bottom:2px solid transparent;font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.35);cursor:pointer;letter-spacing:0.1em;">🌍 КАРТА</button>'
        +'</div>'

        // Контент
        +'<div style="flex:1;overflow-y:auto;padding:12px 18px;">'
        +'<div id="sy-stones">'+stonesHTML+'</div>'
        +'<div id="sy-armor" style="display:none;">'+armorHTML+'</div>'
        +'<div id="sy-map" style="display:none;">'+objHTML+'</div>'
        +'</div>'

        // Закрыть
        +'<div style="padding:12px 18px;border-top:1px solid rgba(255,215,0,0.08);flex-shrink:0;">'
        +'<button id="sy-close" style="width:100%;padding:10px;border-radius:10px;cursor:pointer;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);font-family:Cinzel,serif;font-size:9px;color:rgba(255,215,0,0.6);letter-spacing:0.15em;touch-action:manipulation;">✦ ЗАКРЫТЬ</button>'
        +'</div></div>';

    document.body.appendChild(m);

    // Закрыть
    document.getElementById('sy-close').onclick = function(){ m.remove(); };
    m.onclick = function(e){ if(e.target===m) m.remove(); };

    // Вкладки
    m.querySelectorAll('.sy-tab').forEach(function(btn){
        btn.onclick = function(){
            m.querySelectorAll('.sy-tab').forEach(function(b){ b.style.background='transparent'; b.style.borderBottom='2px solid transparent'; b.style.color='rgba(255,255,255,0.35)'; });
            btn.style.background='rgba(255,255,255,0.06)'; btn.style.borderBottom='2px solid rgba(255,215,0,0.6)'; btn.style.color='rgba(255,215,0,0.8)';
            ['sy-stones','sy-armor','sy-map'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });
            var tab = btn.dataset.tab;
            var el = document.getElementById('sy-'+tab); if(el) el.style.display='block';
        };
    });

    // Конвертация
    m.querySelectorAll('.sy-conv').forEach(function(btn){
        btn.onclick = function(){
            var g = window.convertLightToGold(parseInt(btn.dataset.conv));
            if(g) setTimeout(function(){ m.remove(); window.openSatyaYuga(); }, 200);
        };
    });

    // Камни
    m.querySelectorAll('.sy-get-stone').forEach(function(btn){
        btn.onclick = function(){
            var sid = btn.dataset.sid;
            var st = window.TRANSCENDENCE_STONES.find(function(s){ return s.id===sid; });
            if(!st) return;
            if((typeof state!=='undefined'?state.totalLight||0:0) < st.req){ if(typeof log==='function') log('РА','⚡ Недостаточно света'); return; }
            window._satyaData.stones.push(sid); saveSatya();
            if(typeof log==='function') log('КАМЕНЬ','◉ '+st.name+' · '+st.power);
            m.remove(); window.openSatyaYuga();
        };
    });

    // Доспехи
    m.querySelectorAll('.sy-get-armor').forEach(function(btn){
        btn.onclick = function(){
            var aid = btn.dataset.aid; var cost = parseInt(btn.dataset.cost);
            if((window._satyaData.gold||0) < cost){ if(typeof log==='function') log('РА','⚡ Недостаточно золота'); return; }
            window._satyaData.gold -= cost;
            window._satyaData.armor.push(aid); saveSatya();
            var ar = window.GOLDEN_ARMOR.find(function(a){ return a.id===aid; });
            if(ar && typeof log==='function') log('ДОСПЕХ','⚔ '+ar.name+' · '+ar.bonus);
            m.remove(); window.openSatyaYuga();
        };
    });

    // Строительство
    m.querySelectorAll('.sy-build').forEach(function(btn){
        btn.onclick = function(){
            var oid = btn.dataset.oid; var cost = parseInt(btn.dataset.cost);
            if((window._satyaData.gold||0) < cost){ if(typeof log==='function') log('РА','⚡ Недостаточно золота'); return; }
            window._satyaData.gold -= cost;
            window._satyaData.objects.push(oid); saveSatya();
            var ob = window.SATYA_OBJECTS.find(function(o){ return o.id===oid; });
            if(ob && typeof log==='function') log('СТРОИТЕЛЬСТВО','🌍 '+ob.name+' · Построен!');
            // Вспышка
            var fl=document.createElement('div');fl.style.cssText='position:fixed;inset:0;background:rgba(255,215,0,0.15);z-index:99991;pointer-events:none;transition:opacity 1s;';document.body.appendChild(fl);
            setTimeout(function(){fl.style.opacity='0';setTimeout(function(){fl.remove();},1000);},300);
            m.remove(); window.openSatyaYuga();
        };
    });
};

// Кнопка в топбаре
setTimeout(function(){
    var tb = document.getElementById('awara-topbar');
    if(tb && !document.getElementById('satya-btn')){
        var btn = document.createElement('button');
        btn.id = 'satya-btn';
        btn.style.cssText = 'padding:4px 10px;border-radius:7px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);font-family:Cinzel,serif;font-size:8px;color:rgba(255,215,0,0.6);cursor:pointer;margin-left:4px;touch-action:manipulation;flex-shrink:0;letter-spacing:0.1em;';
        btn.textContent = '🌍 САТЬЯ ЮГА';
        btn.onclick = function(){ window.openSatyaYuga(); };
        tb.appendChild(btn);
    }
}, 1600);

// ══ СИСТЕМА КЛЮЧЕЙ AWARA ══
window.KEY_RARITIES = {
    common:    { name:'ОБЫЧНЫЙ',    col:'#aaaaaa', glow:'#888888', mult:1.0,  icon:'🔑', desc:'Ключ Пути · +5% к свету' },
    uncommon:  { name:'РЕДКИЙ',     col:'#44cc88', glow:'#00ff88', mult:1.15, icon:'🗝',  desc:'Ключ Праны · +15% к свету, -5% стоимость сфер' },
    rare:      { name:'ЦЕННЫЙ',     col:'#4488ff', glow:'#00aaff', mult:1.35, icon:'✦',  desc:'Ключ Атмана · +35% свет, +10% резонанс' },
    epic:      { name:'ЭПИЧЕСКИЙ',  col:'#cc44ff', glow:'#aa00ff', mult:1.6,  icon:'💎', desc:'Ключ Брахмана · ×1.6 весь прогресс' },
    legendary: { name:'ЛЕГЕНДАРНЫЙ',col:'#ffd700', glow:'#ffaa00', mult:2.0,  icon:'👑', desc:'Ключ РА · ×2 всё, открывает скрытые сферы' },
};

window.KEY_CODES = {
    // Обычные
    'SATYA':     { rarity:'common',    name:'Сатья',       desc:'Ключ Истины · Путь к Сатья-Юге' },
    'PRANA':     { rarity:'common',    name:'Прана',       desc:'Жизненная сила · Дыхание вселенной' },
    'DHARMA':    { rarity:'uncommon',  name:'Дхарма',      desc:'Праведный Путь · Исполнение предназначения' },
    'AKASHA':    { rarity:'uncommon',  name:'Акаша',       desc:'Эфир · Пятая стихия' },
    'ATMAN':     { rarity:'rare',      name:'Атман',       desc:'Высшее Я · Искра Брахмана' },
    'KUNDALINI': { rarity:'rare',      name:'Кундалини',   desc:'Огонь Змеи · Пробуждение' },
    'TRIMURTI':  { rarity:'epic',      name:'Тримурти',    desc:'Три Лика · Брахма Вишну Шива' },
    'SATYAYUGA': { rarity:'legendary', name:'Сатья Юга',   desc:'Золотой Век · Высший из четырёх' },
    'RA':        { rarity:'legendary', name:'РА',          desc:'Источник Света · Первичный Огонь' },
};

// Хранилище активированных ключей
window._activeKeys = (function(){
    try{ return JSON.parse(localStorage.getItem('awara_active_keys')||'[]'); }catch(e){ return []; }
})();

// Применить бонусы от всех активных ключей
window.applyKeyBonuses = function(){
    if(!window._activeKeys.length) return;
    var totalMult = 1.0;
    window._activeKeys.forEach(function(k){
        var kd = window.KEY_CODES[k.code];
        var rd = window.KEY_RARITIES[kd?kd.rarity:'common'];
        totalMult *= (rd?rd.mult:1.0);
    });
    if(typeof state !== 'undefined'){
        state._keyMult = Math.min(totalMult, 5.0); // максимум ×5
    }
    if(typeof log === 'function') log('КЛЮЧИ','✦ Бонус ×'+state._keyMult.toFixed(2)+' активен');
};

// Открыть панель ключей
window.openKeyPanel = function(){
    var existing = document.getElementById('key-panel-modal');
    if(existing){ existing.remove(); return; }

    var activeKeys = window._activeKeys || [];
    var m = document.createElement('div');
    m.id = 'key-panel-modal';
    m.style.cssText = 'position:fixed;inset:0;z-index:99994;background:rgba(0,0,0,0.88);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

    var cardList = activeKeys.length ? activeKeys.map(function(k){
        var kd = window.KEY_CODES[k.code]||{name:k.code,rarity:'common',desc:''};
        var rd = window.KEY_RARITIES[kd.rarity]||window.KEY_RARITIES.common;
        return '<div style="padding:12px 14px;border-radius:10px;background:'+rd.col+'0a;border:1px solid '+rd.col+'33;margin-bottom:8px;display:flex;align-items:center;gap:12px;">'
            +'<div style="font-size:22px;filter:drop-shadow(0 0 8px '+rd.glow+');">'+rd.icon+'</div>'
            +'<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:10px;color:'+rd.col+';letter-spacing:0.15em;">'+kd.name+'</div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:'+rd.col+';opacity:0.5;margin-top:2px;">'+rd.name+' · ×'+window.KEY_RARITIES[kd.rarity].mult+'</div>'
            +'<div style="font-family:Cormorant Garamond,serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;">'+kd.desc+'</div></div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:'+rd.col+';">' + new Date(k.ts).toLocaleDateString('ru') + '</div>'
            +'</div>';
    }).join('') : '<div style="text-align:center;padding:30px;font-family:JetBrains Mono,monospace;font-size:9px;color:rgba(255,255,255,0.2);">Нет активированных ключей</div>';

    m.innerHTML = '<div style="width:100%;max-width:480px;background:rgba(4,2,18,0.98);border:1px solid rgba(201,168,76,0.3);border-radius:18px;overflow:hidden;max-height:88vh;display:flex;flex-direction:column;">'
        +'<div style="padding:20px 22px 14px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;">'
        +'<div><div style="font-family:Cinzel Decorative,serif;font-size:13px;color:#c9a84c;letter-spacing:0.2em;">🔑 КЛЮЧИ AWARA</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.25);margin-top:4px;">Бонус ×'+(typeof state!=='undefined'&&state._keyMult?state._keyMult.toFixed(2):'1.00')+' к прогрессу</div></div>'
        +'<button id="kp-close" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:20px;touch-action:manipulation;">✕</button></div>'
        +'<div style="flex:1;overflow-y:auto;padding:14px 18px;">'
        +cardList
        +'</div>'
        +'<div style="padding:14px 18px;border-top:1px solid rgba(255,255,255,0.07);">'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:rgba(255,255,255,0.3);margin-bottom:8px;letter-spacing:0.12em;">АКТИВИРОВАТЬ КОД КЛЮЧА</div>'
        +'<div style="display:flex;gap:8px;">'
        +'<input id="key-code-input" placeholder="ВВЕДИ КОД..." style="flex:1;padding:9px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.25);border-radius:8px;font-family:JetBrains Mono,monospace;font-size:10px;color:#c9a84c;letter-spacing:0.15em;outline:none;text-transform:uppercase;" maxlength="20">'
        +'<button id="key-activate-btn" style="padding:9px 18px;border-radius:8px;cursor:pointer;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.35);font-family:JetBrains Mono,monospace;font-size:9px;color:#c9a84c;letter-spacing:0.12em;touch-action:manipulation;">✦ ОТКРЫТЬ</button>'
        +'</div>'
        +'<div id="key-result" style="margin-top:8px;font-family:JetBrains Mono,monospace;font-size:8px;min-height:16px;"></div>'
        +'<div style="margin-top:12px;font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.15);line-height:1.7;">'
        +'Редкости: ОБЫЧНЫЙ · РЕДКИЙ · ЦЕННЫЙ · ЭПИЧЕСКИЙ · ЛЕГЕНДАРНЫЙ<br>'
        +'Каждый ключ — уникальная NFT-карточка · Влияет на весь прогресс вселенной</div>'
        +'</div></div>';

    document.body.appendChild(m);

    document.getElementById('kp-close').onclick = function(){ m.remove(); };
    m.onclick = function(e){ if(e.target===m) m.remove(); };

    var inp = document.getElementById('key-code-input');
    var res = document.getElementById('key-result');

    function tryActivate(){
        var code = inp.value.trim().toUpperCase();
        if(!code){ res.textContent='Введи код'; res.style.color='rgba(255,100,100,0.7)'; return; }
        var kd = window.KEY_CODES[code];
        if(!kd){ res.textContent='✗ Неизвестный код'; res.style.color='rgba(255,100,100,0.7)'; return; }
        var already = window._activeKeys.some(function(k){ return k.code===code; });
        if(already){ res.textContent='✦ Этот ключ уже активирован'; res.style.color='rgba(255,215,0,0.6)'; return; }
        var rd = window.KEY_RARITIES[kd.rarity];
        window._activeKeys.push({ code:code, ts:Date.now() });
        try{ localStorage.setItem('awara_active_keys', JSON.stringify(window._activeKeys)); }catch(e){}
        window.applyKeyBonuses();
        res.innerHTML = '✦ '+rd.icon+' <span style="color:'+rd.col+'">'+kd.name+'</span> активирован · ×'+rd.mult+' к прогрессу';
        res.style.color = rd.col;
        inp.value = '';
        // NFT-карточка
        setTimeout(function(){ window.showKeyCard(code); }, 400);
    }

    document.getElementById('key-activate-btn').onclick = tryActivate;
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') tryActivate(); });
    inp.focus();
};

// NFT-карточка ключа
window.showKeyCard = function(code){
    var kd = window.KEY_CODES[code];
    if(!kd) return;
    var rd = window.KEY_RARITIES[kd.rarity];
    var card = document.createElement('div');
    card.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);backdrop-filter:blur(16px);';
    card.innerHTML = '<div style="width:min(320px,88vw);background:radial-gradient(ellipse at 30% 20%,'+rd.col+'18,rgba(4,2,18,0.99) 70%);border:2px solid '+rd.col+'55;border-radius:20px;padding:32px 24px;text-align:center;box-shadow:0 0 80px '+rd.glow+'33,0 0 160px '+rd.glow+'11;">'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;letter-spacing:0.3em;color:'+rd.col+';opacity:0.6;margin-bottom:16px;">NFT · КЛЮЧ AWARA</div>'
        +'<div style="font-size:56px;margin-bottom:12px;filter:drop-shadow(0 0 20px '+rd.glow+');">'+rd.icon+'</div>'
        +'<div style="font-family:Cinzel Decorative,serif;font-size:16px;color:'+rd.col+';letter-spacing:0.2em;margin-bottom:6px;">'+kd.name.toUpperCase()+'</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:8px;color:'+rd.col+';letter-spacing:0.2em;margin-bottom:14px;">'+rd.name+'</div>'
        +'<div style="font-family:Cormorant Garamond,serif;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:20px;">'+kd.desc+'</div>'
        +'<div style="padding:10px;background:'+rd.col+'0a;border-radius:10px;border:1px solid '+rd.col+'22;margin-bottom:20px;">'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:9px;color:'+rd.col+';">✦ БОНУС × '+rd.mult+'</div>'
        +'<div style="font-family:JetBrains Mono,monospace;font-size:7px;color:rgba(255,255,255,0.3);margin-top:3px;">'+rd.desc+'</div></div>'
        +'<button id="card-close" style="padding:10px 28px;border-radius:10px;cursor:pointer;background:'+rd.col+'15;border:1px solid '+rd.col+'44;font-family:Cinzel,serif;font-size:10px;color:'+rd.col+';letter-spacing:0.2em;touch-action:manipulation;">✦ ПРИНЯТЬ</button>'
        +'</div>';
    document.body.appendChild(card);
    card.querySelector('#card-close').onclick = function(){ card.remove(); window.openKeyPanel(); };
    card.onclick = function(e){ if(e.target===card){ card.remove(); window.openKeyPanel(); } };
};

// Добавляем кнопку ключей в топбар
setTimeout(function(){
    var tb = document.getElementById('awara-topbar');
    // кнопка ключей уже в топбаре HTML
    // Также в лобби — кнопка ключей
    var lobby = document.getElementById('s0');
    if(lobby && !document.getElementById('lobby-key-btn')){
        var lbtn = document.createElement('button');
        lbtn.id = 'lobby-key-btn';
        lbtn.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:99999;padding:7px 16px;background:rgba(0,250,255,0.06);border:1px solid rgba(0,250,255,0.25);border-radius:8px;font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:0.12em;color:rgba(0,250,255,0.6);cursor:pointer;touch-action:manipulation;';
        lbtn.textContent = '🔑 КЛЮЧИ AWARA';
        // Используем debounce для защиты от spam-кликов
        lbtn.onclick = () => { window.openKeyPanel(); };
        document.body.appendChild(lbtn);
    }
    // Применяем сохранённые бонусы
    window.applyKeyBonuses();
}, 1200);

