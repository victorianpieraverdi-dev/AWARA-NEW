/* ============================================================
   AWARA · ENERGY MAP v1 — Энергокарта на завтра
   Полная энергокарта: стихия дня, агент, рекомендации,
   накшатра, гуна, оптимальные практики.
   Загружать ПОСЛЕ: awara-day-generation.js, awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraEnergyMap && window.__awaraEnergyMap >= 1) return;
window.__awaraEnergyMap = 1;

/* ═══════════════════════════════════════════
   I. ELEMENT & AGENT DATA
   ═══════════════════════════════════════════ */

var ELEMENTS = {
  earth: { icon:'🜃', name:'Земля', color:'#8B7355', advice:'Практика заземления. Тело, природа, труд руками.', optimal:['discipline','will'] },
  water: { icon:'🜄', name:'Вода',  color:'#4A90D9', advice:'День эмоций и интуиции. Медитация, вода, сострадание.', optimal:['compassion','devotion'] },
  fire:  { icon:'🜂', name:'Огонь', color:'#E07020', advice:'Энергия и трансформация. Действие, воля, творчество.', optimal:['will','transformation'] },
  air:   { icon:'🜁', name:'Воздух',color:'#7ECFC0', advice:'Ясность ума. Чтение, общение, новые связи.', optimal:['clarity','compassion'] },
  ether: { icon:'✦',  name:'Эфир', color:'#B090E0', advice:'Связь с Духом. Молчание, созерцание, единство.', optimal:['clarity','unity'] }
};

var GUNAS = {
  tamas:  { icon:'●', name:'Тамас',  color:'#666',    advice:'Инерция — используй для отдыха, глубокого восстановления.' },
  rajas:  { icon:'◐', name:'Раджас', color:'#D4A946', advice:'Действие — хороший день для квестов, задач, движения.' },
  sattva: { icon:'○', name:'Саттва', color:'#A0E0A0', advice:'Ясность — медитация, творчество, глубокие ответы дадут максимум.' }
};

/* ═══════════════════════════════════════════
   II. COMPUTE TOMORROW'S MAP
   ═══════════════════════════════════════════ */

/**
 * Calculate energy map for a given date (default: tomorrow).
 * Uses natal data from STATE for personalization.
 * @param {Date} date — target date (default: tomorrow)
 * @returns {object} energy map
 */
function computeEnergyMap(date){
  if(!date){
    date = new Date();
    date.setDate(date.getDate() + 1);
  }

  var s;
  try { s = window.STATE; } catch(e){ s = null; }
  var natal = s ? s.natal : null;

  /* Day number for cycling */
  var dayNum = Math.floor(date.getTime() / 86400000);

  /* Dominant element — from daily_energy calculation or simple cycle */
  var element = _computeDominantElement(date, natal, dayNum);

  /* Guna of the day */
  var guna = _computeGuna(date, dayNum);

  /* Agent of the day */
  var agent = _computeAgent(dayNum);

  /* Nakshatra */
  var nakshatra = _computeNakshatra(date);

  /* Ring-specific advice */
  var ring = (s && s.progress) ? (s.progress.current_ring || -3) : -3;
  var ringAdvice = _getRingAdvice(ring);

  /* Recommended quest types */
  var recommended = _getRecommendedQuests(element, guna);

  /* Ether forecast */
  var etherForecast = _getEtherForecast(ring, guna);

  return {
    date: date.toISOString().slice(0, 10),
    day_of_week: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][date.getDay()],
    element: element,
    element_info: ELEMENTS[element] || ELEMENTS.earth,
    guna: guna,
    guna_info: GUNAS[guna] || GUNAS.rajas,
    agent: agent,
    nakshatra: nakshatra,
    ring: ring,
    ring_advice: ringAdvice,
    recommended_quests: recommended,
    ether_forecast: etherForecast,
    optimal_axes: (ELEMENTS[element] || ELEMENTS.earth).optimal
  };
}

/* ═══════════════════════════════════════════
   III. CALCULATION HELPERS
   ═══════════════════════════════════════════ */

function _computeDominantElement(date, natal, dayNum){
  /* 7 calendar systems → simple element cycle weighted by natal */
  var elements = ['earth','water','fire','air','ether'];

  /* Base cycle: day of week maps to element */
  var dow = date.getDay(); /* 0=Sun..6=Sat */
  var dowElement = ['fire','water','fire','air','earth','water','earth'][dow];

  /* Lunar phase influence */
  var lunarDay = dayNum % 30;
  var lunarElement = elements[Math.floor(lunarDay / 6) % 5];

  /* Natal influence */
  var natalElement = 'fire';
  if(natal){
    /* Use sun sign element if available */
    if(natal.sunSign){
      var signEl = { Aries:'fire', Taurus:'earth', Gemini:'air', Cancer:'water',
        Leo:'fire', Virgo:'earth', Libra:'air', Scorpio:'water',
        Sagittarius:'fire', Capricorn:'earth', Aquarius:'air', Pisces:'water',
        /* Russian names */
        'Овен':'fire','Телец':'earth','Близнецы':'air','Рак':'water',
        'Лев':'fire','Дева':'earth','Весы':'air','Скорпион':'water',
        'Стрелец':'fire','Козерог':'earth','Водолей':'air','Рыбы':'water'
      };
      natalElement = signEl[natal.sunSign] || 'fire';
    }
  }

  /* Weighted vote */
  var votes = {};
  elements.forEach(function(e){ votes[e] = 0; });
  votes[dowElement] += 2;
  votes[lunarElement] += 1.5;
  votes[natalElement] += 1;

  /* Season bonus */
  var month = date.getMonth();
  if(month >= 2 && month <= 4) votes.fire += 0.5;       /* spring */
  else if(month >= 5 && month <= 7) votes.earth += 0.5;  /* summer */
  else if(month >= 8 && month <= 10) votes.air += 0.5;   /* autumn */
  else votes.water += 0.5;                                /* winter */

  /* Find max */
  var max = 0, result = 'fire';
  for(var e in votes){
    if(votes[e] > max){ max = votes[e]; result = e; }
  }
  return result;
}

function _computeGuna(date, dayNum){
  /* Simple cycle + lunar influence */
  var gunas = ['tamas','rajas','sattva'];
  var base = gunas[dayNum % 3];
  /* Lunar adjustment: full moon = sattva, new moon = tamas */
  var lunarDay = dayNum % 30;
  if(lunarDay >= 13 && lunarDay <= 16) return 'sattva';
  if(lunarDay >= 28 || lunarDay <= 1) return 'tamas';
  return base;
}

function _computeAgent(dayNum){
  /* 21 agents cycle */
  if(!window.AGENTS || !Array.isArray(window.AGENTS)){
    var defaultAgents = [
      'Раджас','Шакти','Сарасвати','Кали','Вишну','Лакшми','Ганеша',
      'Дурга','Хануман','Шива','Парвати','Брахма','Индра','Агни',
      'Сома','Варуна','Ваю','Яма','Кубера','Камадева','Сурья'
    ];
    return defaultAgents[dayNum % defaultAgents.length];
  }
  return window.AGENTS[dayNum % window.AGENTS.length];
}

function _computeNakshatra(date){
  /* Simplified nakshatra from lunar position */
  var dayNum = Math.floor(date.getTime() / 86400000);
  var nakshatras = [
    'Ашвини','Бхарани','Криттика','Рохини','Мригашира','Ардра','Пунарвасу',
    'Пушья','Ашлеша','Магха','Пурва Пхалгуни','Уттара Пхалгуни','Хаста',
    'Читра','Свати','Вишакха','Анурадха','Джьештха','Мула',
    'Пурва Ашадха','Уттара Ашадха','Шравана','Дхаништха','Шатабхиша',
    'Пурва Бхадрапада','Уттара Бхадрапада','Ревати'
  ];
  /* Moon moves ~1 nakshatra per day */
  return nakshatras[dayNum % 27];
}

function _getRingAdvice(ring){
  var advices = {
    '-3':'Записывай каждый опыт. Свет рождается из внимания.',
    '-2':'Какая ось растёт быстрее? Замечай паттерны.',
    '-1':'Порог близко. Качество важнее количества.',
    '0':'Каждый квест формирует направление. Экспериментируй с линзами.',
    '1':'Душа пробуждается. Ищи связи между заданиями и жизнью.',
    '2':'Линза кристаллизуется. Углубляй L4-L5.',
    '3':'Три кольца Души. Баланс осей: какая отстаёт?',
    '4':'Джива: квест = алхимическая реакция. Паттерны не случайны.',
    '5':'Середина Дживы. Начинай видеть целое.',
    '6':'Грань Духа. Качество сознания важнее всего.',
    '7':'Дух I. Квест — зеркало. Линзы скрещиваются.',
    '8':'Дух II. Медитация — ключ. Эфир долго держится.',
    '9':'Дух III. Ты и Луч — одно. Служение.'
  };
  return advices[String(ring)] || advices['-3'];
}

function _getRecommendedQuests(element, guna){
  var types = [];
  if(element === 'earth') types.push('do', 'ritual');
  else if(element === 'water') types.push('meditate', 'reflect');
  else if(element === 'fire') types.push('create', 'do');
  else if(element === 'air') types.push('observe', 'study');
  else types.push('meditate', 'reflect');

  if(guna === 'sattva') types.push('meditate');
  else if(guna === 'rajas') types.push('do', 'create');
  else types.push('reflect');

  /* Unique */
  return types.filter(function(v, i, a){ return a.indexOf(v) === i; });
}

function _getEtherForecast(ring, guna){
  if(guna === 'sattva') return { chance:'high', text:'Высокая вероятность пробуждения эфира. Саттвический день.' };
  if(guna === 'rajas') return { chance:'medium', text:'Средний шанс. Активность поможет, но нужна осознанность.' };
  return { chance:'low', text:'Тамасический день. Отдых важен. Эфир пробудится от искренности.' };
}

/* ═══════════════════════════════════════════
   IV. RENDER ENERGY MAP
   ═══════════════════════════════════════════ */

function renderEnergyMap(container, date){
  var map = computeEnergyMap(date);

  var html = '<div class="emap-container">';
  html += '<h3 style="color:#E0C060;margin:0 0 4px 0">🗺 Энергокарта на ' + map.date + ' (' + map.day_of_week + ')</h3>';

  /* Main element */
  html += '<div class="emap-element" style="border-color:' + map.element_info.color + '">';
  html += '<span style="font-size:32px">' + map.element_info.icon + '</span>';
  html += '<div>';
  html += '<div style="color:' + map.element_info.color + ';font-size:18px;font-weight:700">' + map.element_info.name + '</div>';
  html += '<div style="color:#aaa;font-size:12px">' + map.element_info.advice + '</div>';
  html += '</div></div>';

  /* Guna + Nakshatra row */
  html += '<div class="emap-row">';
  html += '<div class="emap-card"><span style="color:' + map.guna_info.color + ';font-size:18px">' + map.guna_info.icon + '</span><div style="color:#fff;font-size:13px">' + map.guna_info.name + '</div><div style="color:#888;font-size:11px">' + map.guna_info.advice + '</div></div>';
  html += '<div class="emap-card"><span style="font-size:18px">⭐</span><div style="color:#fff;font-size:13px">' + map.nakshatra + '</div><div style="color:#888;font-size:11px">Накшатра дня</div></div>';
  html += '</div>';

  /* Agent */
  html += '<div class="emap-card" style="margin-bottom:10px">';
  html += '<div style="color:#E0C060;font-size:14px">🕉 Агент дня: <strong>' + map.agent + '</strong></div>';
  html += '</div>';

  /* Ether forecast */
  var etherColor = map.ether_forecast.chance === 'high' ? '#6f6' : map.ether_forecast.chance === 'medium' ? '#E0C060' : '#888';
  html += '<div class="emap-card" style="border-color:' + etherColor + '">';
  html += '<div style="color:' + etherColor + ';font-size:13px">✦ Прогноз эфира: ' + map.ether_forecast.text + '</div>';
  html += '</div>';

  /* Recommended quests */
  html += '<div class="emap-card">';
  html += '<div style="color:#aaa;font-size:12px;margin-bottom:4px">Рекомендуемые типы квестов:</div>';
  var typeLabels = { do:'⚡ Действие', meditate:'🧘 Медитация', observe:'👁 Наблюдение', reflect:'💧 Рефлексия', create:'🎨 Творчество', study:'📖 Изучение', ritual:'🕯 Ритуал' };
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  map.recommended_quests.forEach(function(t){
    html += '<span style="background:rgba(224,192,96,0.1);padding:4px 10px;border-radius:8px;font-size:12px;color:#E0C060">' + (typeLabels[t]||t) + '</span>';
  });
  html += '</div></div>';

  /* Ring advice */
  html += '<div class="emap-card" style="border-color:#555">';
  html += '<div style="color:#888;font-size:12px">💡 ' + map.ring_advice + '</div>';
  html += '</div>';

  html += '</div>';

  /* Styles */
  html += '<style>';
  html += '.emap-container{padding:16px}';
  html += '.emap-element{display:flex;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid #444;border-radius:14px;margin-bottom:12px}';
  html += '.emap-row{display:flex;gap:8px;margin-bottom:10px}';
  html += '.emap-card{flex:1;padding:12px;background:rgba(255,255,255,0.02);border:1px solid #333;border-radius:12px;margin-bottom:8px}';
  html += '</style>';

  container.innerHTML = html;
}

/* ═══════════════════════════════════════════
   V. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraEnergyMap = {
  __v: 1,
  computeEnergyMap: computeEnergyMap,
  renderEnergyMap: renderEnergyMap
};

console.log('[AwaraEnergyMap] Energy Map v1 ready');
})();
