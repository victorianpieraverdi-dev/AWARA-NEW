// ══ MATRIX THEME SYSTEM ══
// ══════════════════════════════════════════════════════
// 16 КУЛЬТУРНЫХ ПРИЗМ — МАТРИЦЫ ВОСПРИЯТИЯ
// Каждая призма — ключ к распаковке ДНК Дживы.
// От Нейтрали через Культурный Опыт — к Космосу.
// ══════════════════════════════════════════════════════
var AWARA_MATRICES = [
  {
    id: 'neutral',
    label: _t('idx.mx.neutral.label','НЕЙТРАЛЬ'),
    icon: '⬡',
    sub: _t('idx.mx.neutral.sub','Чистое восприятие · Без фильтра'),
    accent: 'rgba(201,168,76,0.7)',
    guna: 'саттва',
    element: 'акаша',
    desc: _t('idx.mx.neutral.desc','Исходное состояние. Сознание без призмы. Точка до выбора пути.'),
    key: 'DHARMA',
    color: '#c9a84c'
  },
  {
    id: 'vedic',
    label: _t('idx.mx.vedic.label','ВЕДИЧЕСКАЯ'),
    icon: 'ॐ',
    sub: _t('idx.mx.vedic.sub','Спанда · Мандала · Янтра'),
    accent: 'rgba(255,160,40,0.85)',
    guna: 'саттва',
    element: 'огонь',
    desc: _t('idx.mx.vedic.desc','Синхронизация со Спандой — пульсацией Вселенной. Янтры как порталы, мантры как коды реальности.'),
    key: 'SPANDA',
    color: '#ff8844'
  },
  {
    id: 'egyptian',
    label: _t('idx.mx.egyptian.label','ЕГИПЕТСКАЯ'),
    icon: '𓄳',
    sub: _t('idx.mx.egyptian.sub','Солнечное сознание · Золотая геометрия'),
    accent: 'rgba(216,180,90,0.85)',
    guna: 'саттва',
    element: 'огонь',
    desc: _t('idx.mx.egyptian.desc','Солнечное сознание Ра. Золотая геометрия пирамид как антенн Высшего. Путь через Залы Амента.'),
    key: 'ANKH',
    color: '#d4af37'
  },
  {
    id: 'mayan',
    label: _t('idx.mx.mayan.label','МАЙЯНСКАЯ'),
    icon: '☀',
    sub: _t('idx.mx.mayan.sub','Цолькин · Циклы времени · Галактика'),
    accent: 'rgba(0,220,180,0.85)',
    guna: 'раджас',
    element: 'эфир',
    desc: _t('idx.mx.mayan.desc','Космические календари Цолькин и Хааб. Циклы Венеры и Галактического центра. Время как живая матрица.'),
    key: 'KIN',
    color: '#00ddb4'
  },
  {
    id: 'kabbalistic',
    label: _t('idx.mx.kabbalistic.label','КАББАЛА'),
    icon: '✡',
    sub: _t('idx.mx.kabbalistic.sub','Древо Жизни · Эманации Света · Сефирот'),
    accent: 'rgba(140,140,255,0.85)',
    guna: 'саттва',
    element: 'воздух',
    desc: _t('idx.mx.kabbalistic.desc','Десять Сефирот — эманации Бесконечного Света (Эйн Соф). Путь молнии сквозь Древо Жизни к Кетер.'),
    key: 'ALEPH',
    color: '#8888ff'
  },
  {
    id: 'gnostic',
    label: _t('idx.mx.gnostic.label','ГНОСТИЧЕСКАЯ'),
    icon: '🐍',
    sub: _t('idx.mx.gnostic.sub','Искра Плеромы · Лабиринт Архонтов · Гнозис'),
    accent: 'rgba(180,100,255,0.85)',
    guna: 'раджас',
    element: 'огонь',
    desc: _t('idx.mx.gnostic.desc','Искра Плеромы в темнице материи. Путь Гнозиса — прямого знания сквозь иллюзии Иалдабаофа к Свету.'),
    key: 'GNOSIS',
    color: '#b464ff'
  },
  {
    id: 'shambhala',
    label: _t('idx.mx.shambhala.label','ШАМБАЛА'),
    icon: '❄',
    sub: _t('idx.mx.shambhala.sub','Кристальная ясность · Ваджра · Чистота'),
    accent: 'rgba(170,204,255,0.85)',
    guna: 'саттва',
    element: 'вода',
    desc: _t('idx.mx.shambhala.desc','Кристальная ясность ума — Ваджра. Ледяное спокойствие Тантры. Путь к сокрытому царству Шамбале.'),
    key: 'VAJRA',
    color: '#aaccff'
  },
  {
    id: 'dao',
    label: _t('idx.mx.dao.label','ДАОССКАЯ'),
    icon: '☯',
    sub: _t('idx.mx.dao.sub','Баланс Ци · Инь/Ян · Вэй У Вэй'),
    accent: 'rgba(80,200,160,0.85)',
    guna: 'саттва',
    element: 'дерево',
    desc: _t('idx.mx.dao.desc','Баланс Ци — жизненной силы. Путь Дао: действие через недеяние (Вэй У Вэй). Текучесть воды и постоянство горы.'),
    key: 'QI',
    color: '#50c8a0'
  },
  {
    id: 'slavic',
    label: _t('idx.mx.slavic.label','СЛАВЯНСКАЯ'),
    icon: '🌞',
    sub: _t('idx.mx.slavic.sub','Родовая память · Солярные символы · Явь'),
    accent: 'rgba(255,100,80,0.85)',
    guna: 'раджас',
    element: 'земля',
    desc: _t('idx.mx.slavic.desc','Родовая память как ДНК культуры. Явь, Правь и Навь — три мира. Солярные символы Рода и Сварога.'),
    key: 'ROD',
    color: '#ff6450'
  },
  {
    id: 'julian',
    label: _t('idx.mx.julian.label','ХРИСТИАНСКАЯ'),
    icon: '✝',
    sub: _t('idx.mx.julian.sub','Према · Агапе · Безусловная Любовь'),
    accent: 'rgba(200,170,255,0.85)',
    guna: 'саттва',
    element: 'воздух',
    desc: _t('idx.mx.julian.desc','Агапе — безусловная любовь как космический принцип. Сердце как орган познания. Жертва как алхимия.'),
    key: 'AGAPE',
    color: '#c8aaff'
  },
  {
    id: 'gene',
    label: _t('idx.mx.gene.label','ГЕННЫЕ КЛЮЧИ'),
    icon: '🧬',
    sub: _t('idx.mx.gene.sub','Алхимия ДНК · Тень→Дар→Сиддхи'),
    accent: 'rgba(100,255,180,0.85)',
    guna: 'саттва',
    element: 'эфир',
    desc: _t('idx.mx.gene.desc','64 Генных Ключа — карта трансформации ДНК. Тень становится Даром, Дар — Сиддхи. Жизненный Путь как голограмма.'),
    key: 'SIDHI',
    color: '#64ffb4'
  },
  {
    id: 'norse',
    label: _t('idx.mx.norse.label','СКАНДИНАВСКАЯ'),
    icon: 'ᚢ',
    sub: _t('idx.mx.norse.sub','Иггдрасиль · Руны · Девять Миров'),
    accent: 'rgba(100,180,255,0.85)',
    guna: 'раджас',
    element: 'воздух',
    desc: _t('idx.mx.norse.desc','Иггдрасиль — Мировое Древо, соединяющее девять миров. Руническая воля Одина. Космос как нарратив.'),
    key: 'RUNA',
    color: '#64b4ff'
  },
  {
    id: 'japanese',
    label: _t('idx.mx.japanese.label','ДЗЭН·СИНТО'),
    icon: '⛩',
    sub: _t('idx.mx.japanese.sub','Му · Ками · Кинцуги · Пустота'),
    accent: 'rgba(255,200,160,0.85)',
    guna: 'саттва',
    element: 'вода',
    desc: _t('idx.mx.japanese.desc','Му — пустота как основа бытия. Ками — духи природы в каждом предмете. Кинцуги: трещины заполнены золотом.'),
    key: 'MU',
    color: '#ffc8a0'
  },
  {
    id: 'celtic',
    label: _t('idx.mx.celtic.label','КЕЛЬТСКАЯ'),
    icon: '☘',
    sub: _t('idx.mx.celtic.sub','Узлы бесконечности · Друиды · Аваlon'),
    accent: 'rgba(100,220,100,0.85)',
    guna: 'раджас',
    element: 'земля',
    desc: _t('idx.mx.celtic.desc','Кельтские узлы — бесконечность переплетённых нитей бытия. Друидическая магия дубовых рощ. Путь в Авалон.'),
    key: 'OAK',
    color: '#64dc64'
  },
  {
    id: 'shamanic',
    label: _t('idx.mx.shamanic.label','ШАМАНСКАЯ'),
    icon: '🥁',
    sub: _t('idx.mx.shamanic.sub','Тотем · Нижний мир · Астральный полёт'),
    accent: 'rgba(220,150,80,0.85)',
    guna: 'тамас',
    element: 'земля',
    desc: _t('idx.mx.shamanic.desc','Тотемная связь с духами животных. Бубен как врата между мирами. Астральный полёт Шамана через три мира.'),
    key: 'TOTEM',
    color: '#dc9650'
  },
  {
    id: 'techno',
    label: _t('idx.mx.techno.label','ТЕХНОМАГИЯ'),
    icon: '⬡',
    sub: _t('idx.mx.techno.sub','Код и Дух · Голограмма · Сингулярность'),
    accent: 'rgba(0,240,255,0.85)',
    guna: 'раджас',
    element: 'эфир',
    desc: _t('idx.mx.techno.desc','Синтез кода и духа. Реальность как голографическая симуляция Высшего Интеллекта. Хакинг Матрицы изнутри.'),
    key: 'GLITCH',
    color: '#00f0ff'
  },
  {
    id: 'cosmic',
    label: _t('idx.mx.cosmic.label','КОСМИЧЕСКАЯ'),
    icon: '🌌',
    sub: _t('idx.mx.cosmic.sub','Звёздная пыль · Порталы · Акаша'),
    accent: 'rgba(180,140,255,0.85)',
    guna: 'саттва',
    element: 'акаша',
    desc: _t('idx.mx.cosmic.desc','Звёздная пыль как материал существ. Акашические записи — библиотека Вселенной. Порталы между Локами.'),
    key: 'AKASHA',
    color: '#b48cff'
  },
];

// Имена для быстрого доступа (автогенерируется из массива)
var MATRIX_NAMES = (function(){
  var names = {};
  AWARA_MATRICES.forEach(function(m){ names[m.id] = m.label; });
  return names;
})();

// Полный доступ к матрице по id
window.getMatrix = function(id) {
  return AWARA_MATRICES.find(function(m){ return m.id === id; }) || AWARA_MATRICES[0];
};


window.applyMatrixTheme = function(mid) {
  var wrap = document.querySelector('.wrap, .main-wrap, body > div');

  // Фаза 1: fade-out контента
  if (wrap) {
    wrap.classList.add('matrix-fade-out');
  }

  // Цветовая вспышка
  document.body.classList.add('matrix-color-sweep');

  setTimeout(function() {
    // Применяем тему
    document.documentElement.setAttribute('data-matrix', mid);
    document.body.setAttribute('data-matrix', mid);
    localStorage.setItem('awara_matrix', mid);
    localStorage.setItem('awara_matrix_theme', mid);
    var lbl = document.getElementById('active-matrix-label');
    if (lbl) lbl.textContent = MATRIX_NAMES[mid] || mid.toUpperCase();

    // Pulse на body
    document.body.classList.add('matrix-switching');
    setTimeout(function(){ document.body.classList.remove('matrix-switching'); }, 600);

    // Фаза 2: fade-in контента
    if (wrap) {
      wrap.classList.remove('matrix-fade-out');
      wrap.classList.add('matrix-fade-in');
      setTimeout(function() {
        wrap.classList.remove('matrix-fade-in');
      }, 350);
    }

    setTimeout(function() {
      document.body.classList.remove('matrix-color-sweep');
    }, 500);

    // Обновить DayData если доступно
    if (window.AWARA_SYS && window.AWARA_SYS.DayData) {
      window.AWARA_SYS.DayData.update(mid);
    }
  }, 250);
};

window.openMatrixModal = function() {
  var grid = document.getElementById('matrix-grid');
  if (!grid) return;
  var cur = localStorage.getItem('awara_matrix') || 'neutral';

  // 17 карточек (neutral + 16) — 3 колонки на desktop, 2 на mobile
  grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(130px,1fr))';
  grid.style.maxWidth = '580px';

  grid.innerHTML = AWARA_MATRICES.map(function(m) {
    var isActive = m.id === cur;
    var accentRaw = m.color || '#c9a84c';
    var bg = isActive
      ? 'rgba('+hexToRgb(accentRaw)+',0.12)'
      : 'rgba(255,255,255,0.02)';
    var border = isActive
      ? 'rgba('+hexToRgb(accentRaw)+',0.55)'
      : 'rgba(255,255,255,0.08)';

    return '<div ontouchstart="this.click()" onclick="window.selectMatrix(\''+m.id+'\')"'+
      ' style="padding:12px 10px;border-radius:12px;cursor:pointer;text-align:center;'+
      'background:'+bg+';border:1px solid '+border+';transition:all 0.25s;position:relative;"'+
      ' onmouseenter="this.style.background=\'rgba('+hexToRgb(accentRaw)+',0.1)\';this.style.borderColor=\'rgba('+hexToRgb(accentRaw)+',0.4)\'"'+
      ' onmouseleave="this.style.background=\''+bg+'\';this.style.borderColor=\''+border+'\'"'+
      ' title="'+m.desc+'">'+
      // Гуна-бейдж
      '<div style="position:absolute;top:6px;left:8px;font-size:5px;letter-spacing:.12em;'+
      'color:rgba(255,255,255,.22);font-family:JetBrains Mono,monospace;text-transform:uppercase;">'+
      (m.guna||'')+
      '</div>'+
      // Иконка
      '<div style="font-size:26px;margin:6px 0 5px;line-height:1;filter:drop-shadow(0 0 8px '+accentRaw+');">'+m.icon+'</div>'+
      // Название
      '<div style="font-family:Cinzel,serif;font-size:8px;color:'+m.accent+';letter-spacing:.16em;margin-bottom:3px;line-height:1.2;">'+m.label+'</div>'+
      // Подпись
      '<div style="font-family:JetBrains Mono,monospace;font-size:6px;color:rgba(255,255,255,.25);letter-spacing:.06em;line-height:1.4;">'+m.sub+'</div>'+
      // Ключ-код
      (m.key ? '<div style="margin-top:5px;font-family:JetBrains Mono,monospace;font-size:6px;'+
      'color:rgba(255,255,255,.15);letter-spacing:.14em;">KEY·'+m.key+'</div>' : '')+
      // Активна
      (isActive ? '<div style="font-family:Cinzel,serif;font-size:6px;color:rgba(100,220,200,.8);'+
      'margin-top:5px;letter-spacing:.18em;">✦ АКТИВНА</div>' : '')+
      '</div>';
  }).join('');

  document.getElementById('matrix-modal').style.display = 'block';
};

// Вспомогательная: hex → "r,g,b"
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
  var r = parseInt(hex.substring(0,2),16);
  var g = parseInt(hex.substring(2,4),16);
  var b = parseInt(hex.substring(4,6),16);
  return r+','+g+','+b;
}

window.selectMatrix = function(mid) {
  window.applyMatrixTheme(mid);
  window.closeMatrixModal();
};

window.closeMatrixModal = function() {
  document.getElementById('matrix-modal').style.display = 'none';
};

// Перехватываем кнопку Матрицы восприятия → открываем наш modal
(function() {
  var origOpen = function() {};
  if (!window.AWARA_SYS) window.AWARA_SYS = {};
  if (!window.AWARA_SYS.PerceptionMatrix) {
    window.AWARA_SYS.PerceptionMatrix = { open: window.openMatrixModal };
  }

  // Применить сохранённую тему при загрузке
  var saved = localStorage.getItem('awara_matrix') || localStorage.getItem('awara_matrix_theme') || 'neutral';
  window.applyMatrixTheme(saved);
})();
