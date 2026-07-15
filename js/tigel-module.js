// =============================================
// AWARA — Tigel (Evening Crucible) Module
// ES6 module — логика Вечернего Тигеля
// У-Син, Тороидальный Баланс, Генерация Ключей
// =============================================

import { CANON, COLORS, TIMINGS } from './core-module.js';
import { loadState, updateState } from './state-module.js';
import { showToast, showModal, isMobile, vibrate } from './ui-module.js';
import { loadAgents, getAgentById } from './canon-module.js';

// === Конфигурация Тигеля ===
const TIGEL_CONFIG = {
  baseLight: 108,
  miningMin: 1,
  miningMax: 3,
  resonanceDefault: 87,
  maxHistoryEntries: 30,
  maxKeyInventory: 30,
  particleCount: 50
};

// === У-Син: ключевые слова для автоматического теггинга ===
const WU_XING_KEYWORDS = {
  water: ['дневник','покой','сон','вода','чай','медитация','тишина','наблюдение','созерцание'],
  wood:  ['код','рост','учёба','книга','проект','дерево','зелень','планирование','развитие'],
  fire:  ['джапа','мантра','страсть','спорт','бег','огонь','энергия','действие','практика'],
  earth: ['еда','семья','стабильность','земля','центр','гармония','дом','забота'],
  metal: ['пранаяма','завершение','металл','очищение','дисциплина','порядок','структура','йога']
};

// === Веса каналов для расчёта Тороида ===
const CHANNEL_WEIGHTS = {
  pingala: { fire: 0.5, wood: 0.35, earth: 0.15 },
  ida:     { water: 0.5, metal: 0.35, earth: 0.15 }
};

// === Состояние модуля ===
let tigelState = {
  initialized: false,
  agents: null,
  wuXing: { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 },
  toroidResult: null,
  generatedKey: null,
  activeTab: 'log',
  bgAnimationId: null
};

// === Инициализация Тигеля ===
export async function initTigel() {
  if (tigelState.initialized) {
    console.log('[Tigel] Уже инициализировано');
    return tigelState;
  }

  console.log('[Tigel] Инициализация...');
  const start = Date.now();

  try {
    tigelState.agents = await loadAgents();

    if (!tigelState.agents || tigelState.agents.length !== CANON.AGENTS_COUNT) {
      console.error(`[Tigel] КАНОН: ожидалось ${CANON.AGENTS_COUNT} агентов`);
    }

    tigelState.initialized = true;
    const elapsed = Date.now() - start;
    console.log(`[Tigel] Готово за ${elapsed}мс. Агентов: ${tigelState.agents?.length}`);

    return tigelState;
  } catch (e) {
    console.error('[Tigel] Ошибка инициализации:', e);
    return null;
  }
}

// === Получение имени агента по slug ===
export function getAgentName(slug) {
  if (!tigelState.agents) return slug;
  const agent = tigelState.agents.find(a => a.slug === slug);
  return agent ? agent.name : slug;
}

// =============================================
// У-СИН: Автоматический теггинг текста
// =============================================

// Анализ текста и распределение по 5 стихиям
export function autoTagWuXing(text) {
  const lower = text.toLowerCase();
  const wx = { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 };
  let total = 0;

  Object.entries(WU_XING_KEYWORDS).forEach(([elem, keywords]) => {
    keywords.forEach(kw => {
      const matches = (lower.match(new RegExp(kw, 'g')) || []).length;
      wx[elem] += matches;
      total += matches;
    });
  });

  // Нормализация
  if (total > 0) {
    Object.keys(wx).forEach(k => { wx[k] = +(wx[k] / total).toFixed(2); });
  } else {
    // Дефолт: равномерное распределение
    Object.keys(wx).forEach(k => { wx[k] = 0.2; });
  }

  tigelState.wuXing = wx;
  return wx;
}

// Ручная настройка стихии (+/- delta)
export function adjustWuXing(elem, delta) {
  tigelState.wuXing[elem] = Math.max(0, Math.min(1, tigelState.wuXing[elem] + delta));

  // Нормализация до 1.0
  const sum = Object.values(tigelState.wuXing).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    Object.keys(tigelState.wuXing).forEach(k => {
      tigelState.wuXing[k] /= sum;
    });
  }

  return tigelState.wuXing;
}

// Получение текущего состояния У-Син
export function getWuXing() {
  return { ...tigelState.wuXing };
}

// =============================================
// ТОРОИДАЛЬНЫЙ БАЛАНС (Ида / Пингала / Сушумна)
// =============================================

// Классификация состояния Сушумны по балансу
function classifySushumna(balance) {
  if (balance >= 0.92) return {
    label: 'ПОЛНОЕ ОТКРЫТИЕ', icon: '*', tier: 5,
    color: '#ffe080', desc: 'Все три нади в гармонии. Майнинг x3.'
  };
  if (balance >= 0.78) return {
    label: 'ВЫСОКАЯ АКТИВАЦИЯ', icon: 'o', tier: 4,
    color: '#c9a84c', desc: 'Сушумна открыта. Майнинг x2.5+.'
  };
  if (balance >= 0.6) return {
    label: 'ЧАСТИЧНЫЙ ПОТОК', icon: '~', tier: 3,
    color: '#88aacc', desc: 'Хороший баланс. Майнинг x2+.'
  };
  if (balance >= 0.35) return {
    label: 'СЛАБЫЙ ПОТОК', icon: '.', tier: 2,
    color: '#666688', desc: 'Дисбаланс. Майнинг x1.5.'
  };
  return {
    label: 'ЗАКРЫТА', icon: 'x', tier: 1,
    color: '#443344', desc: 'Сильный дисбаланс. Майнинг x1.'
  };
}

// Расчёт тороидального баланса из У-Син
export function computeToroid(wuXing) {
  const wx = wuXing || tigelState.wuXing;

  const W = CHANNEL_WEIGHTS;
  const pingala = Math.min(1,
    (wx.fire || 0) * W.pingala.fire +
    (wx.wood || 0) * W.pingala.wood +
    (wx.earth || 0) * W.pingala.earth
  );
  const ida = Math.min(1,
    (wx.water || 0) * W.ida.water +
    (wx.metal || 0) * W.ida.metal +
    (wx.earth || 0) * W.ida.earth
  );

  const delta = Math.abs(pingala - ida);
  const balance = +Math.max(0, 1 - delta * 2).toFixed(4);

  const dominant = pingala > ida
    ? { channel: 'Пингала', glyph: 'Yang', color: '#ff8844', advice: 'Добавь отдых, чай, музыку' }
    : pingala < ida
      ? { channel: 'Ида', glyph: 'Yin', color: '#4488cc', advice: 'Добавь действие, практику, движение' }
      : { channel: 'Сушумна', glyph: 'Balance', color: '#c9a84c', advice: 'Идеальный баланс — майнинг максимален' };

  const mining = +(TIGEL_CONFIG.miningMin + balance * (TIGEL_CONFIG.miningMax - TIGEL_CONFIG.miningMin)).toFixed(3);
  const sushumna = classifySushumna(balance);
  const resonance = TIGEL_CONFIG.resonanceDefault / 100;
  const lightTotal = +(TIGEL_CONFIG.baseLight * mining * resonance).toFixed(2);
  const svetcoin = +(lightTotal * 0.000000001).toFixed(12);

  const result = {
    pingala: +pingala.toFixed(4),
    ida: +ida.toFixed(4),
    delta: +delta.toFixed(4),
    balance,
    sushumna,
    dominant,
    mining_multiplier: mining,
    mining_pct: Math.round(mining / TIGEL_CONFIG.miningMax * 100),
    light_base: TIGEL_CONFIG.baseLight,
    light_total: lightTotal,
    svetcoin,
    snapshot: {
      timestamp: Date.now(),
      pingala: +pingala.toFixed(3),
      ida: +ida.toFixed(3),
      balance,
      mining
    }
  };

  tigelState.toroidResult = result;
  return result;
}

// Рекомендации на основе баланса
export function getRecommendations(toroidResult) {
  const result = toroidResult || tigelState.toroidResult;
  if (!result) return [];

  const recs = [];
  const { pingala, ida, balance, dominant } = result;

  if (balance < 0.35) {
    recs.push({
      priority: 'CRIT',
      action: dominant.advice,
      effect: 'Критический дисбаланс снижает майнинг до x1'
    });
  } else if (balance < 0.6) {
    recs.push({
      priority: 'HIGH',
      action: dominant.advice,
      effect: 'Улучшение баланса повысит майнинг'
    });
  } else if (balance < 0.78) {
    recs.push({
      priority: 'MED',
      action: 'Небольшая коррекция улучшит поток Сушумны',
      effect: 'Баланс хороший, но есть потенциал'
    });
  }

  return recs;
}

// Сохранение снимка Тороида в историю
export function saveToroidSnapshot(wuXing) {
  const snap = computeToroid(wuXing).snapshot;
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('awara_toroid_history') || '[]');
  } catch (e) { /* игнорируем */ }
  history.unshift(snap);
  if (history.length > TIGEL_CONFIG.maxHistoryEntries) history.pop();
  localStorage.setItem('awara_toroid_history', JSON.stringify(history));
  return snap;
}

// Загрузка истории Тороида
export function loadToroidHistory() {
  try {
    return JSON.parse(localStorage.getItem('awara_toroid_history') || '[]');
  } catch (e) {
    return [];
  }
}

// =============================================
// ГЕНЕРАЦИЯ КЛЮЧЕЙ
// =============================================

// Генерация Ключа дня
export function generateKey(logText, wuXing, toroidResult) {
  const wx = wuXing || tigelState.wuXing;
  const toroid = toroidResult || tigelState.toroidResult || computeToroid(wx);

  const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  const balance = toroid.balance || 0.5;
  const rarityIdx = Math.min(4, Math.floor(balance * 5));
  const rarity = rarities[rarityIdx];

  const elementMap = { water: 'Вода', wood: 'Дерево', fire: 'Огонь', earth: 'Земля', metal: 'Металл' };
  const topElement = Object.keys(wx).reduce((a, b) => wx[a] > wx[b] ? a : b);
  const element = elementMap[topElement] || 'Эфир';

  const lightTotal = Math.round(
    TIGEL_CONFIG.baseLight * toroid.mining_multiplier *
    (TIGEL_CONFIG.resonanceDefault / 100)
  );

  const matrix = {
    id: 'vedic', label: 'Ведическая', icon: 'Om',
    guna: 'саттва', key_code: 'SPANDA'
  };

  const buffs = [
    { id: 'buff_mining', label: 'Множитель добычи', value: 'x' + toroid.mining_multiplier.toFixed(1), desc: 'Тороидальный множитель' },
    { id: 'buff_resonance', label: 'Резонанс транзита', value: TIGEL_CONFIG.resonanceDefault + '%', desc: 'Планетарный резонанс' }
  ];

  const key = {
    id: 'key_' + Date.now() + '_' + matrix.id,
    name: 'Ключ ' + matrix.key_code + ' / ' + element,
    icon: matrix.icon,
    rarity,
    mernost: Math.min(9, Math.ceil(balance * 9)),
    element,
    guna: matrix.guna,
    light_base: TIGEL_CONFIG.baseLight,
    light_total: lightTotal,
    expires_days: 7,
    buffs,
    created_at: new Date().toISOString(),
    wu_xing: { ...wx },
    channels: {
      pingala: toroid.pingala,
      ida: toroid.ida,
      balance: toroid.balance,
      mining_multiplier: toroid.mining_multiplier
    }
  };

  const prompt = 'Psy-Vedic AI Art: "' + matrix.label + ' Key - ' + element +
    ' Crystallization". Sacred geometry mandala, ' + matrix.guna + ' guna, ' +
    rarity + ' rarity, ' + (balance > 0.8 ? 'balanced' : 'asymmetric') +
    ' flow. Deep cosmic background with golden sacred symbols. Photorealistic 3D render, 8K, octane.';

  const result = { key, prompt };
  tigelState.generatedKey = result;
  return result;
}

// Сохранение ключа в инвентарь
export function saveKeyToInventory(keyData) {
  const key = keyData || tigelState.generatedKey;
  if (!key) return null;

  let inventory = [];
  try {
    inventory = JSON.parse(localStorage.getItem('awara_key_inventory') || '[]');
  } catch (e) { /* игнорируем */ }
  inventory.unshift(key);
  if (inventory.length > TIGEL_CONFIG.maxKeyInventory) inventory.pop();
  localStorage.setItem('awara_key_inventory', JSON.stringify(inventory));
  return inventory;
}

// Загрузка инвентаря ключей
export function loadKeyInventory() {
  try {
    return JSON.parse(localStorage.getItem('awara_key_inventory') || '[]');
  } catch (e) {
    return [];
  }
}

// =============================================
// СИНТЕЗ ДНЯ (полный цикл)
// =============================================

// Полный синтез: теггинг -> тороид -> ключ -> сохранение
export function synthesizeDay(logText) {
  if (!logText || !logText.trim()) {
    console.warn('[Tigel] Пустой лог — синтез невозможен');
    return null;
  }

  console.log('[Tigel] Синтез дня...');

  // 1. Авто-теггинг У-Син
  const wuXing = autoTagWuXing(logText);

  // 2. Расчёт Тороида
  const toroid = computeToroid(wuXing);

  // 3. Генерация Ключа
  const keyResult = generateKey(logText, wuXing, toroid);

  // 4. Сохранение снимка
  saveToroidSnapshot(wuXing);

  // 5. Сохранение ключа
  saveKeyToInventory(keyResult);

  // 6. Добавление света в state
  if (keyResult.key.light_total > 0) {
    const state = loadState();
    updateState({
      totalLight: (state.totalLight || 0) + keyResult.key.light_total
    });
  }

  const result = {
    wuXing,
    toroid,
    key: keyResult,
    lightAwarded: keyResult.key.light_total,
    timestamp: Date.now()
  };

  console.log('[Tigel] Синтез завершён. Свет: +' + result.lightAwarded);
  return result;
}

// =============================================
// СБОР ОПЫТА ИЗ СФЕР
// =============================================

export function gatherExperienceFromSpheres() {
  const collected = [];

  // Источник 1: Граф Пространства Инициации (awara_initiation_v1)
  let graph = null;
  try {
    const raw = localStorage.getItem('awara_initiation_v1');
    if (raw) graph = JSON.parse(raw);
  } catch (e) {
    console.warn('[Tigel] Не удалось прочитать awara_initiation_v1:', e);
  }

  if (graph && Array.isArray(graph.spheres) && graph.spheres.length > 0) {
    graph.spheres.forEach(s => {
      if (!s || !s.id || s.id === 'cotv') return;
      let entries = [];
      try {
        const raw = localStorage.getItem('jrn_' + s.id);
        if (raw) entries = JSON.parse(raw) || [];
      } catch (e) { /* игнорируем */ }

      if (!Array.isArray(entries)) return;
      entries.forEach(entry => {
        const text = (entry.body || entry.note || '').trim();
        if (!text) return;
        collected.push({
          name: s.lbl || s.id,
          title: entry.title || '',
          text,
          date: entry.date || null
        });
      });
    });
  }

  // Источник 2: Старый формат (awara_sphere_entries)
  if (collected.length === 0) {
    let sphereData = {};
    try {
      const saved = localStorage.getItem('awara_sphere_entries');
      if (saved) sphereData = JSON.parse(saved);
    } catch (e) {
      console.warn('[Tigel] Не удалось загрузить sphereData:', e);
    }

    const sphereMapping = {
      'psph-space': 'ОСНОВА / НОГИ',
      'psph-karma': 'СЕРДЦЕ',
      'psph-time': 'МЕЧТА / ГОЛОВА'
    };

    Object.keys(sphereMapping).forEach(sphereId => {
      const sphere = sphereData[sphereId];
      if (sphere && Array.isArray(sphere.entries)) {
        sphere.entries.forEach(entry => {
          const text = (entry.note || entry.body || '').trim();
          if (!text) return;
          collected.push({
            name: sphereMapping[sphereId],
            title: '',
            text,
            date: entry.timestamp || null
          });
        });
      }
    });
  }

  if (collected.length === 0) {
    console.log('[Tigel] Сферы пусты, собирать нечего');
    return null;
  }

  // Форматируем собранный опыт
  const experienceText = collected.map(entry => {
    const head = entry.title
      ? '[СФЕРА: ' + entry.name + ' / ' + entry.title + ']'
      : '[СФЕРА: ' + entry.name + ']';
    return head + ':\n' + entry.text;
  }).join('\n\n');

  const uniqueNames = Array.from(new Set(collected.map(e => e.name)));
  console.log('[Tigel] Собрано записей: ' + collected.length + ' из ' + uniqueNames.length + ' сфер');

  return {
    text: experienceText,
    entries: collected,
    sphereNames: uniqueNames,
    count: collected.length
  };
}

// =============================================
// ФОНОВАЯ АНИМАЦИЯ (частицы)
// =============================================

export function startBgAnimation(canvasElement) {
  if (!canvasElement) return;

  const ctx = canvasElement.getContext('2d');
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  const particles = Array(TIGEL_CONFIG.particleCount).fill(null).map(() => ({
    x: Math.random() * canvasElement.width,
    y: Math.random() * canvasElement.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1,
    color: 'rgba(201,168,76,' + (Math.random() * 0.3 + 0.1).toFixed(2) + ')'
  }));

  function draw() {
    ctx.fillStyle = 'rgba(10,8,18,0.05)';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvasElement.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvasElement.height) p.vy *= -1;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    tigelState.bgAnimationId = requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
  });

  console.log('[Tigel] Фоновая анимация запущена');
}

export function stopBgAnimation() {
  if (tigelState.bgAnimationId) {
    cancelAnimationFrame(tigelState.bgAnimationId);
    tigelState.bgAnimationId = null;
    console.log('[Tigel] Фоновая анимация остановлена');
  }
}

// =============================================
// УПРАВЛЕНИЕ ТАБАМИ
// =============================================

export function switchTab(tabName) {
  tigelState.activeTab = tabName;
  return tabName;
}

export function getActiveTab() {
  return tigelState.activeTab;
}

// =============================================
// УТИЛИТЫ
// =============================================

// Итоговые параметры дня (7 параметров)
export function getDaySummary(wuXing, toroidResult) {
  const wx = wuXing || tigelState.wuXing;
  const toroid = toroidResult || tigelState.toroidResult;
  if (!toroid) return null;

  const ELEM_RU = { water: 'Вода', wood: 'Дерево', fire: 'Огонь', earth: 'Земля', metal: 'Металл' };
  const topElem = Object.entries(wx).sort((a, b) => b[1] - a[1])[0];

  return [
    { label: 'Доминантная стихия', value: ELEM_RU[topElem[0]] || topElem[0], sub: Math.round(topElem[1] * 100) + '%' },
    { label: 'Канал Пингала (Ян)', value: Math.round(toroid.pingala * 100) + '%' },
    { label: 'Канал Ида (Инь)', value: Math.round(toroid.ida * 100) + '%' },
    { label: 'Баланс Сушумны', value: toroid.sushumna.label, sub: Math.round(toroid.balance * 100) + '%' },
    { label: 'Множитель майнинга', value: 'x' + toroid.mining_multiplier },
    { label: 'Свет за сессию', value: toroid.light_total + ' sv' },
    { label: 'Рекомендация', value: toroid.dominant.advice }
  ];
}

// Получение текущего состояния модуля
export function getTigelState() {
  return {
    initialized: tigelState.initialized,
    wuXing: { ...tigelState.wuXing },
    toroidResult: tigelState.toroidResult ? { ...tigelState.toroidResult } : null,
    generatedKey: tigelState.generatedKey,
    activeTab: tigelState.activeTab,
    agentsLoaded: tigelState.agents?.length || 0
  };
}

// Сброс состояния
export function resetTigelState() {
  stopBgAnimation();
  tigelState = {
    initialized: false,
    agents: null,
    wuXing: { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 },
    toroidResult: null,
    generatedKey: null,
    activeTab: 'log',
    bgAnimationId: null
  };
  console.log('[Tigel] Состояние сброшено');
}
