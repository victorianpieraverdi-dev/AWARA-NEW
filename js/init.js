'use strict';

// ── ДАННЫЕ ЮГ ──────────────────────────────────────────
var YUGAS = [
    {
        id:'kali',    name:'Кали Юга',    icon:'🌑', col:'#ff3333', cls:'yuga-kali',
        minLight:0,   maxLight:500,
        desc:'Железный век. Завеса Майи плотна. Первые шаги пробуждения — самые важные.',
        dharma:'Осознание страдания как зова к трансформации',
        bonus:'Каждое действие против инерции: +15% света',
        ritual:'5 минут тишины ежедневно без единой мысли',
    },
    {
        id:'dvapara', name:'Двапара Юга', icon:'🌒', col:'#6688ff', cls:'yuga-dvapara',
        minLight:500, maxLight:1500,
        desc:'Бронзовый век. Половина завесы поднята. Духовные практики дают плоды.',
        dharma:'Балансирование между духом и материей',
        bonus:'Медитации и ритуалы дают ×2 света',
        ritual:'Пранаяма · Созерцание огня · Пение мантр',
    },
    {
        id:'treta',   name:'Трета Юга',   icon:'🌕', col:'#44ffaa', cls:'yuga-treta',
        minLight:1500,maxLight:4000,
        desc:'Серебряный век. Три четверти Дхармы явлены. Тонкое восприятие открыто.',
        dharma:'Служение как путь освобождения',
        bonus:'Сферы развиваются на 30% быстрее',
        ritual:'Йога · Джнана · Бхакти',
    },
    {
        id:'satya',   name:'Сатья Юга',   icon:'☀️', col:'#ffd700', cls:'yuga-satya',
        minLight:4000,maxLight:Infinity,
        desc:'Золотой век. Полная Дхарма. Реальность прозрачна как кристалл. Ты — Свет.',
        dharma:'Бытие как само Осознание',
        bonus:'Все бонусы активны. Пассивный майнинг ×3',
        ritual:'Самоисследование · Сахаджа Самадхи',
    },
];
window.AWARA_YUGAS = YUGAS;

// ── СИСТЕМА ЮГ ─────────────────────────────────────────
var YugaSystem = {
    _current: null,
    _lastLight: -1,

    getYuga: function(light) {
        for (var i = YUGAS.length - 1; i >= 0; i--) {
            if (light >= YUGAS[i].minLight) return YUGAS[i];
        }
        return YUGAS[0];
    },

    getProgress: function(light) {
        var y = this.getYuga(light);
        var idx = YUGAS.indexOf(y);
        if (idx === YUGAS.length - 1) return 100;
        var range = YUGAS[idx + 1].minLight - y.minLight;
        return Math.min(100, Math.round(((light - y.minLight) / range) * 100));
    },

    update: function(light) {
        if (light === this._lastLight) return;
        this._lastLight = light;
        var y = this.getYuga(light);
        var prog = this.getProgress(light);

        // Класс body
        document.body.classList.remove('yuga-kali','yuga-dvapara','yuga-treta','yuga-satya');
        document.body.classList.add(y.cls);

        // CSS переменные
        document.body.style.setProperty('--yc', y.col);
        document.body.style.setProperty('--yg', y.col + '28');

        // HUD бейдж
        var badge = document.getElementById('yuga-hud-badge');
        var badgeName = document.getElementById('yuga-hud-name');
        if (badge) { badge.style.borderColor = y.col; badge.style.color = y.col; badge.style.boxShadow = '0 0 10px ' + y.col + '44'; }
        if (badgeName) badgeName.textContent = y.name.toUpperCase();

        // Прогресс-шкала
        var bar = document.getElementById('yuga-progress-bar');
        if (bar) { bar.style.width = prog + '%'; bar.style.boxShadow = '0 0 6px ' + y.col; }

        // Лобби-индикатор
        var ind = document.getElementById('lobby-yuga-indicator');
        if (ind) {
            ind.textContent = y.icon + ' ' + y.name.toUpperCase();
            ind.style.borderColor = y.col + '55';
            ind.style.color = y.col;
        }

        // Прогресс-панель — шкала Юги
        var pyn = document.getElementById('progress-yuga-name');
        var pyp = document.getElementById('progress-yuga-pct');
        var pyb = document.getElementById('progress-yuga-bar');
        if (pyn) { pyn.textContent = y.icon + ' ' + y.name; pyn.style.color = y.col; }
        if (pyp) { pyp.textContent = prog + '%'; pyp.style.color = y.col; }
        if (pyb) { pyb.style.width = prog + '%'; pyb.style.background = 'linear-gradient(90deg,' + y.col + ',#ffd700)'; }

        // Переход
        if (this._current && this._current.id !== y.id) {
            this._showTransition(y);
        }
        this._current = y;
    },

    _showTransition: function(y) {
        var overlay = document.getElementById('yuga-transition-overlay');
        var inner   = document.getElementById('ytm-inner');
        var icoEl   = document.getElementById('ytm-icon');
        var titleEl = document.getElementById('ytm-title');
        var descEl  = document.getElementById('ytm-desc');
        var btn     = document.getElementById('ytm-btn');

        if (icoEl) icoEl.textContent = y.icon;
        if (titleEl) { titleEl.textContent = y.name.toUpperCase(); titleEl.style.color = y.col; }
        if (descEl)  descEl.textContent = y.desc;
        if (btn)     { btn.style.borderColor = y.col; btn.style.color = y.col; }
        if (inner)   {
            inner.style.background = 'radial-gradient(ellipse at 50% 0%, ' + y.col + '15, rgba(4,2,18,0.98) 70%)';
            inner.style.border = '1px solid ' + y.col + '55';
            inner.style.boxShadow = '0 0 60px ' + y.col + '33';
        }
        if (overlay) overlay.classList.add('show');

        // Звук
        if (window.Audio && Audio.chord) try { Audio.chord(); } catch(e) {}
        // Хроника
        if (typeof addChronicle === 'function') addChronicle(y.icon + ' Переход в ' + y.name);
        if (typeof log === 'function') log('ЮГА', y.icon + ' <b>' + y.name + '</b> — ' + y.dharma);

        // Плавающий текст
        this.popup(y.icon + ' ' + y.name, window.innerWidth/2, window.innerHeight/2 - 60);
    },

    popup: function(text, x, y) {
        var el = document.createElement('div');
        el.className = 'light-popup';
        el.style.left = (x - 60) + 'px';
        el.style.top  = y + 'px';
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 2000);
    },
};
window.YugaSystem = YugaSystem;

// ── ОТКРЫТИЕ ИНФО О ЮГЕ ───────────────────────────────
window.openYugaInfo = function() {
    var light = (typeof state !== 'undefined') ? (state.totalLight || 0) : 0;
    var y    = YugaSystem.getYuga(light);
    var prog = YugaSystem.getProgress(light);
    var idx  = YUGAS.indexOf(y);
    var next = YUGAS[idx + 1];

    if (typeof window.openKnowledge !== 'function') return;
    window.openKnowledge({
        icon: y.icon, col: y.col,
        title: y.name,
        subtitle: '✦ СИСТЕМА ЮГ · ПУТЬ К САТЬЯ ЮГЕ ✦',
        body: '<div style="font-family:\'Cormorant Garamond\',serif;font-size:15px;line-height:1.85;color:rgba(255,255,255,0.8);">'
            + '<p style="font-size:17px;color:' + y.col + ';margin-bottom:14px;">' + y.icon + ' ' + y.name + '</p>'
            + '<p style="margin-bottom:14px;">' + y.desc + '</p>'
            + '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;margin-bottom:12px;border-left:3px solid ' + y.col + ';">'
            + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;letter-spacing:0.2em;color:' + y.col + ';margin-bottom:6px;">ДХАРМА ЭПОХИ</div>'
            + '<div>' + y.dharma + '</div></div>'
            + '<div style="background:rgba(255,215,0,0.04);border-radius:10px;padding:12px;margin-bottom:14px;">'
            + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;letter-spacing:0.18em;color:rgba(255,215,0,0.6);margin-bottom:6px;">⚡ БОНУС ЭПОХИ</div>'
            + '<div style="font-size:14px;">' + y.bonus + '</div></div>'
            + '<div style="margin-bottom:14px;">'
            + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:rgba(255,255,255,0.35);margin-bottom:7px;">ПРОГРЕСС · ' + prog + '%</div>'
            + '<div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">'
            + '<div style="height:100%;width:' + prog + '%;background:linear-gradient(90deg,' + y.col + ',#ffd700);border-radius:3px;"></div></div></div>'
            + (next
                ? '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(255,255,255,0.35);">Следующая: <span style="color:' + next.col + ';">' + next.icon + ' ' + next.name + '</span> при ' + next.minLight + ' света</div>'
                : '<div style="font-family:\'Cinzel\',serif;font-size:12px;color:#ffd700;text-align:center;">✦ ВЕРШИНА · САТЬЯ ЮГА ✦</div>')
            + '</div>',
        advice: [y.ritual, y.dharma, y.bonus],
        actionLabel: 'ПРОДОЛЖИТЬ →',
        action: function() { window.closeKnowledge(); },
    });
};

// ── ИСПРАВЛЕНИЕ БАГА: fetch('/api/chat') ───────────────
// window.send переопределяется ПОСЛЕ загрузки, не во время
window.addEventListener('load', function() {
    var _orig = window.send;
    window.send = function() {
        var inp = document.getElementById('inp');
        var val = inp ? inp.value.trim() : '';
        if (!val) return;
        if (typeof log === 'function') log('ВЫ', val);
        if (inp) inp.value = '';
        var replies = [
            '🌟 Твои слова приняты Матрицей...',
            '✦ Вселенная слышит тебя, искатель.',
            '🪷 Намерение звучит в пространстве Акаши.',
            '⚡ Свет внутри тебя усиливается.',
        ];
        var r = replies[Math.floor(Math.random() * replies.length)];
        setTimeout(function() {
            if (typeof log === 'function') log('РА', r);
        }, 700 + Math.random() * 600);
    };
});

// ── ПАССИВНЫЙ МАЙНИНГ СВЕТА ───────────────────────────
setInterval(function() {
    if (typeof state === 'undefined') return;
    var y = YugaSystem.getYuga(state.totalLight || 0);
    var gain = {kali:1, dvapara:2, treta:4, satya:8}[y.id] || 1;
    state.totalLight = (state.totalLight || 0) + gain;
    YugaSystem.update(state.totalLight);
    var pm = document.getElementById('passive-mining');
    if (pm) pm.textContent = '+' + (gain * 2) + '/мин';
    // Обновить счётчик света в лобби
    var lc = document.getElementById('lobby-light-count');
    if (lc) lc.textContent = state.totalLight;
}, 30000);

// ── ПЕРЕХВАТ syncState ─────────────────────────────────
window.addEventListener('load', function() {
    var _origSync = window.syncState;
    window.syncState = function() {
        if (typeof _origSync === 'function') _origSync.apply(this, arguments);
        setTimeout(function() {
            if (typeof state !== 'undefined') YugaSystem.update(state.totalLight || 0);
        }, 80);
    };

    // Перехват completeDailyRitual
    var _origDR = window.completeDailyRitual;
    window.completeDailyRitual = function(key) {
        if (typeof _origDR === 'function') _origDR(key);
        setTimeout(function() {
            if (typeof state !== 'undefined') YugaSystem.update(state.totalLight || 0);
        }, 300);
    };

    // Перехват updateProgressPanel
    var _origUP = window.updateProgressPanel;
    window.updateProgressPanel = function() {
        if (typeof _origUP === 'function') _origUP();
        if (typeof state !== 'undefined') YugaSystem.update(state.totalLight || 0);
    };
});

// ── ИНИЦИАЛИЗАЦИЯ ─────────────────────────────────────
function initYuga() {
    var light = (typeof state !== 'undefined') ? (state.totalLight || 0) : 0;
    YugaSystem._current = YugaSystem.getYuga(light);
    YugaSystem.update(light);
}

// ── ПОЗИЦИОНИРОВАНИЕ ВСЕЛЕННЫХ ПОД КВЕСТАМИ ──────────────
function repositionUniverses() {
    var qp = document.getElementById('quests-panel');
    var up = document.getElementById('universes-panel-wrap');
    if (!qp || !up) return;
    var rect = qp.getBoundingClientRect();
    var newTop = Math.round(rect.bottom + 6);
    up.style.top = newTop + 'px';
}

// Следим за раскрытием/закрытием панели квестов
(function() {
    var qp = document.getElementById('quests-panel');
    if (!qp) return;
    var header = qp.querySelector('.panel-header');
    if (!header) return;
    var orig = header.onclick;
    header.onclick = function(e) {
        if (orig) orig.call(this, e);
        setTimeout(repositionUniverses, 320); // после анимации
    };
    header.ontouchstart = header.onclick;
})();

setInterval(repositionUniverses, 500); // fallback-синхронизация

// ── ДОСТИЖЕНИЯ — ДИНАМИЧЕСКОЕ ОБНОВЛЕНИЕ ─────────────────
var ACHIEVEMENTS_DEF = [
    { id:'awaken',   icon:'🌅', name:'Пробуждение',       check: function(s) { return true; },                                              desc:'Ты вошёл в Матрицу' },
    { id:'light100', icon:'✨', name:'Первый свет',        check: function(s) { return (s.totalLight||0) >= 100; },                          desc:'100 единиц света' },
    { id:'crystal',  icon:'💎', name:'Первый кристалл',   check: function(s) { return Object.values(s.sphereData||{}).some(function(d){return (d.lvl||0)>=4;}); }, desc:'Сфера ур. 4+' },
    { id:'light500', icon:'⭐', name:'Поток света',       check: function(s) { return (s.totalLight||0) >= 500; },                          desc:'500 единиц света' },
    { id:'dvapara',  icon:'🌒', name:'Двапара Юга',       check: function(s) { return (s.totalLight||0) >= 500; },                          desc:'Переход эпохи' },
    { id:'journey',  icon:'🗺', name:'Путешественник',    check: function(s) { return (s.journey||[]).length >= 3; },                        desc:'3 прохождения' },
    { id:'sphere6',  icon:'🌀', name:'Мастер сфер',       check: function(s) { return Object.values(s.sphereData||{}).some(function(d){return (d.lvl||0)>=6;}); }, desc:'Сфера ур. 6+' },
    { id:'light1500',icon:'🌟', name:'Трета Юга',         check: function(s) { return (s.totalLight||0) >= 1500; },                         desc:'1500 единиц света' },
    { id:'karma100', icon:'⚖', name:'Карма чистая',      check: function(s) { return (s.karmaScore||0) >= 100; },                           desc:'100 кармы' },
    { id:'sphere12', icon:'👑', name:'Абсолют',           check: function(s) { return Object.values(s.sphereData||{}).some(function(d){return (d.lvl||0)>=12;}); }, desc:'Сфера ур. 12' },
    { id:'satya',    icon:'☀️', name:'Сатья Юга',         check: function(s) { return (s.totalLight||0) >= 4000; },                         desc:'Золотой век' },
];

function updateAchievements() {
    var el = document.getElementById('achievements');
    if (!el || typeof state === 'undefined') return;
    var unlocked = ACHIEVEMENTS_DEF.filter(function(a) { try { return a.check(state); } catch(e){ return false; } });
    var locked   = ACHIEVEMENTS_DEF.filter(function(a) { try { return !a.check(state); } catch(e){ return true; } });
    var html = '';
    // Разблокированные
    unlocked.forEach(function(a) {
        html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 4px;border-radius:5px;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.12);margin-bottom:2px;" title="' + a.desc + '">'
              + '<span style="font-size:12px;flex-shrink:0;">' + a.icon + '</span>'
              + '<span style="font-family:\'JetBrains Mono\',monospace;font-size:7px;color:rgba(255,215,0,0.8);letter-spacing:0.08em;">' + a.name + '</span>'
              + '</div>';
    });
    // Заблокированные (первые 3)
    locked.slice(0, 3).forEach(function(a) {
        html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 4px;border-radius:5px;opacity:0.28;margin-bottom:2px;" title="' + a.desc + '">'
              + '<span style="font-size:12px;flex-shrink:0;">🔒</span>'
              + '<span style="font-family:\'JetBrains Mono\',monospace;font-size:7px;color:rgba(255,255,255,0.5);letter-spacing:0.08em;">' + a.name + '</span>'
              + '</div>';
    });
    if (!html) html = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:rgba(255,255,255,0.2);text-align:center;padding:6px 0;">—</div>';
    el.innerHTML = html;
}

setInterval(updateAchievements, 4000);


function syncPsphButtons() {
    var map = {'psph-space':'psph-btn-space','psph-time':'psph-btn-time','psph-soul':'psph-btn-soul','psph-karma':'psph-btn-karma'};
    if (typeof PERSONAL_SPHERES === 'undefined') return;
    PERSONAL_SPHERES.forEach(function(ps) {
        var btn = document.getElementById(map[ps.id]);
        if (btn) btn.textContent = '◈ ' + ps.n;
    });
}

// ══ ЕЖЕДНЕВНЫЕ КВЕСТЫ ══
const DAILY_QUESTS = [
    {id:'q_light',     icon:'⚡', name:'Собрать свет',       desc:'Накопи 500 света',                 check:()=>state.totalLight>=500, reward:100},
    {id:'q_meditate',  icon:'🧘', name:'Медитация',          desc:'Войди в состояние покоя',         check:()=>(state.chronicle||[]).some(e=>e.includes('медитац')), reward:80},
    {id:'q_sphere',    icon:'⬆', name:'Прокачать сферу',   desc:'Улучши любую сферу',              check:()=>Object.values(state.sphereData||{}).some(d=>d.lvl>1), reward:150},
    {id:'q_sage',      icon:'🔱', name:'Спросить мудреца',  desc:'Задай вопрос Тримурти',          check:()=>(state.chronicle||[]).some(e=>e.includes('Ответ')), reward:80},
    {id:'q_gift',      icon:'🎁', name:'Подарить свет',     desc:'Поделись с игроком',              check:()=>(state.chronicle||[]).some(e=>e.includes('света →')), reward:120},
];

function renderQuests(){
    const el=document.getElementById('quests-list');if(!el) return;
    const today=new Date().toDateString();
    if(!state.questsDate||state.questsDate!==today){state.questsDate=today;state.questsDone={};}
    el.innerHTML=DAILY_QUESTS.map(q=>{
        const done=state.questsDone?.[q.id]||q.check();
        if(done&&!state.questsDone?.[q.id]){
            if(!state.questsDone)state.questsDone={};
            state.questsDone[q.id]=true;
            state.totalLight+=q.reward;
        }
        return `<div style="display:flex;align-items:center;gap:7px;padding:5px 10px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:14px;opacity:${done?1:0.5}">${q.icon}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:9px;color:${done?'rgba(0,250,255,0.8)':'rgba(255,255,255,0.5)'};">${q.name}</div>
                <div style="font-size:7px;color:rgba(255,255,255,0.25);">${done?'✓ Выполнено':q.desc}</div>
            </div>
            <span style="font-size:8px;color:rgba(255,215,0,0.5);flex-shrink:0;">+${q.reward}</span>
        </div>`;
    }).join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function(){
            if(window.AWARA_SYS && window.AWARA_SYS.DayData) {
                window.AWARA_SYS.DayData.update();
            }
        }, 300);
        setTimeout(initShambhalaCalendar, 500);
        setTimeout(initYuga, 600);
        setTimeout(syncPsphButtons, 800);
        setTimeout(repositionUniverses, 900);
        setTimeout(updateAchievements, 1000);
        setInterval(syncPsphButtons, 4000);
    });
} else {
    setTimeout(function(){
        if(window.AWARA_SYS && window.AWARA_SYS.DayData) {
            window.AWARA_SYS.DayData.update();
        }
    }, 300);
    setTimeout(initShambhalaCalendar, 500);
    setTimeout(initYuga, 600);
    setTimeout(syncPsphButtons, 800);
    setTimeout(repositionUniverses, 900);
    setTimeout(updateAchievements, 1000);
    setInterval(syncPsphButtons, 4000);
}
