/**
 * quest-engine.js — Генератор Квестов и Система Культурных Ключей
 * 
 * Загружает data/quest-cultural-keys.json + data/agents.json
 * Генерирует квесты на основе: агент × матрица × энергия дня × уровень игрока
 * Управляет: Световая Пыль, Фрагменты Ключей, Культурные Ключи, Кейсы
 * 
 * ES6 модуль — import { generateQuest, ... } from './js/quest-engine.js'
 */

// ══ КЭШИ ДАННЫХ ══
let _agents = null;
let _matrices = null;

// ══ ЗАГРУЗКА ДАННЫХ ══
async function loadAgents() {
  if (_agents) return _agents;
  const r = await fetch('/data/agents.json'); // абсолютный путь: работает и с корня, и из /app/istok.html (Vite)
  _agents = await r.json();
  return _agents;
}

async function loadMatrices() {
  if (_matrices) return _matrices;
  const r = await fetch('/data/quest-cultural-keys.json'); // абсолютный путь (см. loadAgents)
  _matrices = await r.json();
  return _matrices;
}

// ══ ДНЕВНАЯ ЭНЕРГИЯ ══
// Планета дня (Солнце-Луна-Марс-Меркурий-Юпитер-Венера-Сатурн)
const WEEKDAY_PLANETS = ['Солнце','Луна','Марс','Меркурий','Юпитер','Венера','Сатурн'];
const WEEKDAY_PLANETS_EN = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const GUNAS = ['Sattva','Rajas','Tamas'];
const ELEMENTS_5 = ['Fire','Water','Earth','Air','Ether'];

// Хэш-функция (FNV-1a 32-bit)
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

/**
 * Вычислить энергию текущего дня
 * @returns {{ planet: string, planetEn: string, guna: string, tithi: number, element: string, dayOfWeek: number }}
 */
export function getDailyEnergy() {
  const now = new Date();
  const dow = now.getDay(); // 0=Вс, 1=Пн...6=Сб
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
  const jd = Math.floor(Date.now() / 86400000) + 2440588;
  const tithi = ((jd * 12) % 30) + 1; // титхи 1-30
  const gunaIdx = dayOfYear % 3;
  const elemIdx = dayOfYear % 5;
  return {
    planet: WEEKDAY_PLANETS[dow],
    planetEn: WEEKDAY_PLANETS_EN[dow],
    guna: GUNAS[gunaIdx],
    tithi: tithi,
    element: ELEMENTS_5[elemIdx],
    dayOfWeek: dow
  };
}

// ══ ГЕНЕРАТОР КВЕСТОВ ══

// Шаблоны задач на RU/EN по стилю квеста
const QUEST_TASKS = {
  meditate:  { ru: 'Медитируй 10 минут, сосредоточившись на {key}', en: 'Meditate for 10 minutes focusing on {key}' },
  chant:     { ru: 'Повтори мантру {key} 108 раз', en: 'Chant the mantra of {key} 108 times' },
  balance:   { ru: 'Найди баланс между противоположностями {key}', en: 'Find balance between the opposites of {key}' },
  purify:    { ru: 'Очисти пространство и ум через практику {key}', en: 'Purify space and mind through the practice of {key}' },
  align:     { ru: 'Выровняй свои действия согласно принципу {key}', en: 'Align your actions according to the principle of {key}' },
  awaken:    { ru: 'Пробуди осознанность через {key}', en: 'Awaken awareness through {key}' },
  pierce:    { ru: 'Пронзи завесу иллюзии с помощью {key}', en: 'Pierce the veil of illusion using {key}' },
  ascend:    { ru: 'Поднимись на новый уровень через {key}', en: 'Ascend to a new level through {key}' },
  remember:  { ru: 'Вспомни забытую мудрость {key}', en: 'Remember the forgotten wisdom of {key}' },
  liberate:  { ru: 'Освободись от оков через практику {key}', en: 'Liberate yourself through the practice of {key}' },
  invoke:    { ru: 'Призови силу {key} в свою жизнь', en: 'Invoke the power of {key} into your life' },
  observe:   { ru: 'Наблюдай за проявлением {key} вокруг тебя', en: 'Observe the manifestation of {key} around you' },
  transform: { ru: 'Трансформируй энергию через {key}', en: 'Transform energy through {key}' },
  harmonize: { ru: 'Гармонизируй внутреннее и внешнее через {key}', en: 'Harmonize inner and outer through {key}' },
  connect:   { ru: 'Установи связь с {key} через созерцание', en: 'Establish connection with {key} through contemplation' },
  create:    { ru: 'Создай что-то новое, вдохновлённое {key}', en: 'Create something new inspired by {key}' },
  protect:   { ru: 'Защити священное пространство силой {key}', en: 'Protect the sacred space with the power of {key}' },
  heal:      { ru: 'Исцели себя и других через практику {key}', en: 'Heal yourself and others through the practice of {key}' },
  journey:   { ru: 'Отправься во внутреннее путешествие к {key}', en: 'Embark on an inner journey to {key}' },
  decode:    { ru: 'Расшифруй тайные знаки {key}', en: 'Decode the secret signs of {key}' },
};

// Шаблоны названий квестов
const QUEST_TITLES = [
  { ru: 'ПУТЬ {KEY}', en: 'PATH OF {KEY}' },
  { ru: 'ЗЕРНО {KEY}', en: 'SEED OF {KEY}' },
  { ru: 'ПУСТОЙ СОСУД', en: 'EMPTY VESSEL' },
  { ru: 'СИЯНИЕ {KEY}', en: 'RADIANCE OF {KEY}' },
  { ru: 'ТЕНЬ И СВЕТ', en: 'SHADOW AND LIGHT' },
  { ru: 'ВРАТА {KEY}', en: 'GATES OF {KEY}' },
  { ru: 'ПРОБУЖДЕНИЕ', en: 'AWAKENING' },
  { ru: 'МОСТ МИРОВ', en: 'BRIDGE OF WORLDS' },
  { ru: 'ГОЛОС {KEY}', en: 'VOICE OF {KEY}' },
  { ru: 'ОГОНЬ ИСТИНЫ', en: 'FIRE OF TRUTH' },
  { ru: 'КЛЮЧ ТИШИНЫ', en: 'KEY OF SILENCE' },
  { ru: 'ТАНЕЦ {KEY}', en: 'DANCE OF {KEY}' },
  { ru: 'АЛХИМИЯ ДНЯ', en: 'ALCHEMY OF THE DAY' },
  { ru: 'СОЗВЕЗДИЕ {KEY}', en: 'CONSTELLATION OF {KEY}' },
  { ru: 'КОРЕНЬ БЫТИЯ', en: 'ROOT OF BEING' },
];

// Длительности квестов (минуты)
const QUEST_DURATIONS = [5, 10, 15, 20, 30, 45, 60];

// Сферы квеста
const QUEST_SPHERES = [
  { ru: 'Медитация', en: 'Meditation' },
  { ru: 'Тело', en: 'Body' },
  { ru: 'Отношения', en: 'Relationships' },
  { ru: 'Творчество', en: 'Creativity' },
  { ru: 'Знание', en: 'Knowledge' },
  { ru: 'Служение', en: 'Service' },
  { ru: 'Природа', en: 'Nature' },
];

/**
 * Генерировать квест
 * @param {string} agentSlug — slug агента (или null для рандома)
 * @param {string} matrixSlug — slug матрицы (или null для рандома)
 * @param {object} [dailyEnergy] — от getDailyEnergy()
 * @param {number} [playerLevel] — уровень сознания игрока (1-14)
 * @returns {Promise<object>} — объект квеста
 */
export async function generateQuest(agentSlug, matrixSlug, dailyEnergy, playerLevel) {
  const [agents, matrices] = await Promise.all([loadAgents(), loadMatrices()]);
  const energy = dailyEnergy || getDailyEnergy();
  const level = playerLevel || 1;
  const dateStr = todayISO();
  const pid = localStorage.getItem('awara_player_id') || 'anon';

  // Сид для детерминированного выбора
  const seed = fnv1a(dateStr + ':' + pid + ':' + (agentSlug||'') + ':' + (matrixSlug||''));

  // Выбор агента
  let agent;
  if (agentSlug) {
    agent = agents.find(a => a.slug === agentSlug) || agents[seed % agents.length];
  } else {
    agent = agents[seed % agents.length];
  }

  // Выбор матрицы
  let matrix;
  if (matrixSlug) {
    matrix = matrices.find(m => m.slug === matrixSlug) || matrices[(seed >>> 4) % matrices.length];
  } else {
    matrix = matrices[(seed >>> 4) % matrices.length];
  }

  // Форма агента в этой матрице
  const agentForm = matrix.agentForms[agent.slug] || {
    name: agent.name,
    symbol: '✦',
    voice: { ru: 'Энергия течёт', en: 'Energy flows' }
  };

  // Культурный ключ
  const keyIdx = (seed >>> 8) % matrix.culturalKeys.length;
  const culturalKey = matrix.culturalKeys[keyIdx];

  // Стиль квеста → задача
  const styles = (matrix.questStyle || 'meditate / observe / connect').split(/\s*\/\s*/);
  const style = styles[(seed >>> 12) % styles.length].trim();
  const taskTemplate = QUEST_TASKS[style] || QUEST_TASKS.meditate;
  const task = {
    ru: taskTemplate.ru.replace(/\{key\}/g, culturalKey),
    en: taskTemplate.en.replace(/\{key\}/g, culturalKey)
  };

  // Название квеста
  const titleTemplate = QUEST_TITLES[(seed >>> 16) % QUEST_TITLES.length];
  const title = {
    ru: titleTemplate.ru.replace(/\{KEY\}/g, culturalKey.toUpperCase()),
    en: titleTemplate.en.replace(/\{KEY\}/g, culturalKey.toUpperCase())
  };

  // Длительность (зависит от уровня)
  const durIdx = Math.min(QUEST_DURATIONS.length - 1, Math.floor(level / 3) + ((seed >>> 20) % 3));
  const duration = QUEST_DURATIONS[durIdx];

  // Сфера
  const sphere = QUEST_SPHERES[(seed >>> 22) % QUEST_SPHERES.length];

  // Сложность (1-5)
  const difficulty = Math.min(5, 1 + Math.floor(level / 3) + ((seed >>> 24) % 2));

  // Награды
  const baseDust = 10 + difficulty * 5 + level * 2;
  const baseShanti = 5 + difficulty * 3;
  const baseShakti = 3 + difficulty * 2;
  // Бонус от энергии дня
  const gunaBonus = energy.guna === 'Sattva' ? 1.3 : energy.guna === 'Rajas' ? 1.1 : 0.9;
  const dustAmount = Math.round(baseDust * gunaBonus);
  const shantiReward = Math.round(baseShanti * gunaBonus);
  const shaktiReward = Math.round(baseShakti * gunaBonus);

  // Фрагмент ключа (3 фрагмента = 1 Культурный Ключ)
  const fragmentKey = matrix.slug;
  const fragmentProgress = 1; // каждый квест даёт 1 фрагмент

  return {
    id: 'quest_' + dateStr + '_' + agent.slug + '_' + matrix.slug,
    date: dateStr,
    agent: {
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      element: agent.element,
      planet: agent.planet,
      guna: agent.guna,
      ray: agent.ray
    },
    matrix: {
      id: matrix.id,
      slug: matrix.slug,
      name: matrix.name, // {ru, en}
      symbol: matrix.symbol,
      culturalKeys: matrix.culturalKeys
    },
    agentForm: agentForm,
    agentIcon: agentForm.symbol,
    title: title,
    agentVoice: agentForm.voice,
    task: task,
    duration: duration,
    sphere: sphere,
    element: energy.element,
    energy: energy,
    difficulty: difficulty,
    rewards: {
      shanti: shantiReward,
      shakti: shaktiReward,
      dustAmount: dustAmount,
      fragmentKey: fragmentKey,
      fragmentProgress: fragmentProgress
    }
  };
}

/**
 * Генерировать набор квестов (ежедневные, недельные, эпический)
 * @param {number} [playerLevel]
 * @returns {Promise<{daily: object[], weekly: object[], epic: object|null}>}
 */
export async function generateQuestSet(playerLevel) {
  const [agents, matrices] = await Promise.all([loadAgents(), loadMatrices()]);
  const energy = getDailyEnergy();
  const level = playerLevel || 1;
  const dateStr = todayISO();
  const pid = localStorage.getItem('awara_player_id') || 'anon';
  const baseSeed = fnv1a(dateStr + ':' + pid);

  // 3 ежедневных квеста
  const daily = [];
  for (let i = 0; i < 3; i++) {
    const s = (baseSeed + i * 7919) >>> 0;
    const ag = agents[s % agents.length];
    const mx = matrices[(s >>> 4) % matrices.length];
    const q = await generateQuest(ag.slug, mx.slug, energy, level);
    q.id = q.id + '_d' + i;
    q.type = 'daily';
    daily.push(q);
  }

  // 1 недельный квест (дольше, больше наград)
  const ws = (baseSeed + 31337) >>> 0;
  const wag = agents[ws % agents.length];
  const wmx = matrices[(ws >>> 4) % matrices.length];
  const weekly = await generateQuest(wag.slug, wmx.slug, energy, level);
  weekly.id = weekly.id + '_w';
  weekly.type = 'weekly';
  weekly.duration = 120;
  weekly.rewards.dustAmount *= 3;
  weekly.rewards.shanti *= 2;
  weekly.rewards.shakti *= 2;
  weekly.rewards.fragmentProgress = 3;

  // 1 эпический квест (если уровень >= 3)
  let epic = null;
  if (level >= 3) {
    const es = (baseSeed + 99991) >>> 0;
    const eag = agents[es % agents.length];
    const emx = matrices[(es >>> 4) % matrices.length];
    epic = await generateQuest(eag.slug, emx.slug, energy, level);
    epic.id = epic.id + '_e';
    epic.type = 'epic';
    epic.duration = 0; // без ограничения
    epic.difficulty = 5;
    epic.rewards.dustAmount *= 5;
    epic.rewards.shanti *= 4;
    epic.rewards.shakti *= 3;
    epic.rewards.fragmentProgress = 5;
  }

  return { daily, weekly: [weekly], epic: epic ? [epic] : [] };
}


// ══ СИСТЕМА ПЫЛИ И КЛЮЧЕЙ ══

const DUST_STORAGE_KEY = 'awara_cultural_dust';
const KEYS_STORAGE_KEY = 'awara_cultural_keys';
const FRAGMENTS_STORAGE_KEY = 'awara_cultural_fragments';
const COMPLETED_QUESTS_KEY = 'awara_completed_quests';
const COLLECTION_STORAGE_KEY = 'awara_card_collection';

/** Получить текущее количество Световой Пыли */
export function getDust() {
  try { return parseInt(localStorage.getItem(DUST_STORAGE_KEY) || '0'); } catch(e) { return 0; }
}

/** Добавить Световую Пыль */
export function addDust(amount) {
  const cur = getDust();
  try { localStorage.setItem(DUST_STORAGE_KEY, cur + amount); } catch(e) {}
  return cur + amount;
}

/** Получить все фрагменты {matrixSlug: count} */
export function getFragments() {
  try { return JSON.parse(localStorage.getItem(FRAGMENTS_STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}

/** Добавить фрагмент для матрицы */
export function addFragment(matrixSlug, count) {
  const frags = getFragments();
  frags[matrixSlug] = (frags[matrixSlug] || 0) + (count || 1);
  try { localStorage.setItem(FRAGMENTS_STORAGE_KEY, JSON.stringify(frags)); } catch(e) {}
  return frags;
}

/** Получить Культурные Ключи {matrixSlug: count} */
export function getCulturalKeys() {
  try { return JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}

/** Общее количество Культурных Ключей */
export function getTotalCulturalKeys() {
  const keys = getCulturalKeys();
  return Object.values(keys).reduce((s, v) => s + v, 0);
}

/**
 * Выковать Культурный Ключ из фрагментов
 * Требуется: 3 фрагмента одной матрицы + 100 пыли
 * @param {string} matrixSlug
 * @returns {{ success: boolean, reason?: string }}
 */
export function forgeCulturalKey(matrixSlug) {
  const dust = getDust();
  const frags = getFragments();
  const fragCount = frags[matrixSlug] || 0;

  if (fragCount < 3) {
    return { success: false, reason: 'not_enough_fragments' };
  }
  if (dust < 100) {
    return { success: false, reason: 'not_enough_dust' };
  }

  // Забираем ресурсы
  frags[matrixSlug] = fragCount - 3;
  try { localStorage.setItem(FRAGMENTS_STORAGE_KEY, JSON.stringify(frags)); } catch(e) {}
  try { localStorage.setItem(DUST_STORAGE_KEY, dust - 100); } catch(e) {}

  // Добавляем ключ
  const keys = getCulturalKeys();
  keys[matrixSlug] = (keys[matrixSlug] || 0) + 1;
  try { localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys)); } catch(e) {}

  return { success: true, matrixSlug, totalKeys: getTotalCulturalKeys() };
}


// ══ ЗАВЕРШЕНИЕ КВЕСТА ══

/** Получить завершённые квесты */
export function getCompletedQuests() {
  try { return JSON.parse(localStorage.getItem(COMPLETED_QUESTS_KEY) || '[]'); } catch(e) { return []; }
}

/**
 * Завершить квест → начислить награды
 * @param {object} quest — объект квеста
 * @returns {{ dust: number, shanti: number, shakti: number, fragment: string, newDustTotal: number }}
 */
export function completeQuest(quest) {
  const r = quest.rewards;

  // Начислить пыль
  const newDust = addDust(r.dustAmount);

  // Начислить фрагменты
  addFragment(r.fragmentKey, r.fragmentProgress);

  // Начислить шанти/шакти в state (если доступен)
  if (typeof window !== 'undefined' && window.state) {
    window.state.totalLight = (window.state.totalLight || 0) + r.shanti + r.shakti;
  }

  // Сохранить квест как завершённый
  const completed = getCompletedQuests();
  completed.push({
    id: quest.id,
    date: quest.date,
    agent: quest.agent.slug,
    matrix: quest.matrix.slug,
    ts: Date.now()
  });
  // Храним последние 100
  if (completed.length > 100) completed.splice(0, completed.length - 100);
  try { localStorage.setItem(COMPLETED_QUESTS_KEY, JSON.stringify(completed)); } catch(e) {}

  return {
    dust: r.dustAmount,
    shanti: r.shanti,
    shakti: r.shakti,
    fragment: r.fragmentKey,
    newDustTotal: newDust
  };
}

/** Проверить, завершён ли квест */
export function isQuestCompleted(questId) {
  return getCompletedQuests().some(q => q.id === questId);
}


// ══ СИСТЕМА КЕЙСОВ ══

const CASE_TYPES = [
  { id: 'common',    name: { ru: 'Обычный', en: 'Common' },       icon: '📦', keyCost: 1, color: '#a0b4cc', dropRates: { common: 0.60, uncommon: 0.25, rare: 0.10, epic: 0.04, legendary: 0.01 } },
  { id: 'uncommon',  name: { ru: 'Необычный', en: 'Uncommon' },   icon: '🎁', keyCost: 2, color: '#22c55e', dropRates: { common: 0.30, uncommon: 0.35, rare: 0.20, epic: 0.10, legendary: 0.04, sacred: 0.01 } },
  { id: 'rare',      name: { ru: 'Редкий', en: 'Rare' },          icon: '💎', keyCost: 3, color: '#3b82f6', dropRates: { common: 0.10, uncommon: 0.25, rare: 0.35, epic: 0.18, legendary: 0.09, sacred: 0.03 } },
  { id: 'epic',      name: { ru: 'Эпический', en: 'Epic' },       icon: '🔮', keyCost: 5, color: '#a855f7', dropRates: { uncommon: 0.15, rare: 0.30, epic: 0.30, legendary: 0.18, sacred: 0.07 } },
  { id: 'legendary', name: { ru: 'Легендарный', en: 'Legendary' }, icon: '👑', keyCost: 8, color: '#f59e0b', dropRates: { rare: 0.15, epic: 0.30, legendary: 0.35, sacred: 0.20 } },
  { id: 'sacred',    name: { ru: 'Священный', en: 'Sacred' },     icon: '✦',  keyCost: 12,color: '#ffd700', dropRates: { epic: 0.15, legendary: 0.40, sacred: 0.45 } },
];

const CARD_RARITIES = [
  { id: 'common',    name: { ru: 'Обычная', en: 'Common' },       color: '#a0b4cc', glow: 'rgba(160,180,204,0.3)' },
  { id: 'uncommon',  name: { ru: 'Необычная', en: 'Uncommon' },   color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { id: 'rare',      name: { ru: 'Редкая', en: 'Rare' },          color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { id: 'epic',      name: { ru: 'Эпическая', en: 'Epic' },       color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  { id: 'legendary', name: { ru: 'Легендарная', en: 'Legendary' }, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { id: 'sacred',    name: { ru: 'Священная', en: 'Sacred' },     color: '#ffd700', glow: 'rgba(255,215,0,0.5)' },
];

export function getCaseTypes() { return CASE_TYPES; }
export function getCardRarities() { return CARD_RARITIES; }

/**
 * Открыть кейс
 * Тратит Культурные Ключи → возвращает карту случайной редкости
 * @param {string} caseId — id типа кейса
 * @returns {Promise<{ success: boolean, card?: object, reason?: string }>}
 */
export async function openCase(caseId) {
  const caseType = CASE_TYPES.find(c => c.id === caseId);
  if (!caseType) return { success: false, reason: 'invalid_case' };

  const totalKeys = getTotalCulturalKeys();
  if (totalKeys < caseType.keyCost) {
    return { success: false, reason: 'not_enough_keys', needed: caseType.keyCost, have: totalKeys };
  }

  // Тратим ключи (забираем из первых доступных матриц)
  const keys = getCulturalKeys();
  let toSpend = caseType.keyCost;
  for (const slug of Object.keys(keys)) {
    if (toSpend <= 0) break;
    const available = keys[slug];
    const take = Math.min(available, toSpend);
    keys[slug] = available - take;
    toSpend -= take;
  }
  // Удаляем нулевые записи
  for (const slug of Object.keys(keys)) {
    if (keys[slug] <= 0) delete keys[slug];
  }
  try { localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys)); } catch(e) {}

  // Определяем редкость карты
  const roll = Math.random();
  let cumulative = 0;
  let cardRarity = 'common';
  for (const [rarity, chance] of Object.entries(caseType.dropRates)) {
    cumulative += chance;
    if (roll <= cumulative) {
      cardRarity = rarity;
      break;
    }
  }

  // Генерируем карту из случайной матрицы/агента
  const [agents, matrices] = await Promise.all([loadAgents(), loadMatrices()]);
  const seed = fnv1a(Date.now().toString() + Math.random().toString());
  const agent = agents[seed % agents.length];
  const matrix = matrices[(seed >>> 4) % matrices.length];
  const form = matrix.agentForms[agent.slug] || { name: agent.name, symbol: '✦', voice: { ru: '', en: '' } };
  const rarityData = CARD_RARITIES.find(r => r.id === cardRarity) || CARD_RARITIES[0];

  const card = {
    id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    agent: agent.slug,
    agentName: agent.name,
    matrix: matrix.slug,
    matrixName: matrix.name,
    matrixSymbol: matrix.symbol,
    form: form,
    rarity: cardRarity,
    rarityName: rarityData.name,
    rarityColor: rarityData.color,
    rarityGlow: rarityData.glow,
    ts: Date.now(),
    caseType: caseId
  };

  // Сохранить в коллекцию
  const collection = getCollection();
  collection.push(card);
  try { localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection)); } catch(e) {}

  return { success: true, card, caseType };
}

/** Получить коллекцию карт */
export function getCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || '[]'); } catch(e) { return []; }
}

/** Количество карт в коллекции */
export function getCollectionCount() {
  return getCollection().length;
}
