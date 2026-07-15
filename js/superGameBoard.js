/**
 * superGameBoard.js — «Игра Мироздания · мандала Тигля» (Супер-Игра).
 *
 * v2 — ВЕРНЫЙ ПОРТ рабочего оригинала mandala-game.html (+ vibe()/flows() из
 * awara-mandala.js), а НЕ свежая переизобретённая механика. Оригиналы не
 * трогаем — они остаются справочной (deprecated-surface) реализацией.
 *
 * ЧТО ПОРТИРОВАНО 1:1 из mandala-game.html (те же данные, формулы, поведение):
 *   - RINGS: кольца доски. С 2026-07-07 (док «Супер-Игра — карта как отражение
 *     пути игрока») состав ПЕРЕОСМЫСЛЕН: 12 колец + Центр Ра = 3 ч/б кольца
 *     Даймона (PRE_MERA −3…0 из daimonAscent.js) + 9 цветных мер по ярусам
 *     Душа (1–3) · Джива + Искра (4–6) · Дух (7–9). Прежние кольца Творец /
 *     Единство / Созидание Света удалены: по доку это мета-стадии ПОСЛЕ
 *     завершённых прохождений (задача P9.3), а не кольца борда.
 *   - SECTORS 24 (или 12 «сефирот»), posOf(t) = {ring: floor(t/SECTORS), sector: t%SECTORS}.
 *   - Врата по сторонам света с часовыми окнами: С 22–4 · Ю 4–10 · З 10–16 · В 16–22,
 *     sectorOfHour()/gateSector()/timeToGate(), «Войти по времени».
 *   - Бросок костей: d = 1..6 + bonusNext; +0.015 света за ход; NPC двигается сам.
 *   - Центр Ра (GOAL_T=(RING_N-1)*SECTORS) → модал → dive(): +0.2 света, следующая
 *     линза, карта в колоду, рестарт от врат.
 *   - Колода игрока: loadCards() из data/*.json + exports/generated_cards листинга,
 *     normalize()/cardFromFile()/SEED-фолбэк, hand=240 случайных, клик = фон сцены
 *     + зум-модал, activateCard() (3 случайных эффекта).
 *   - Отрисовка: 2D-канвас draw() с купольной проекцией proj() (1D/2D/3D),
 *     ringColor()/highlightCell()/drawToken(), drag-вращение, колесо-зум, клик по
 *     ячейке = телепорт, R/0 сброс вида.
 *   - Мост Тигля: чтение awara_v258_state → свет/стихия/кольцо (HUD).
 *
 * ЧТО ПОРТИРОВАНО ИЗ awara-mandala.js (дословно): vibe(snap), flows(snap),
 * meraLevel(), nakIdx() — геометрия/потоки из реального состояния игрока
 * (показываются в HUD Тигля: ↑восход/↓давление).
 *
 * ЧТО ОСТАВЛЕНО ОТ ПРЕДЫДУЩЕЙ REACT-ПОПЫТКИ (интеграции поверх механики):
 *   - Триггер «линза чёткости тира 4 (Сияющая) → матрица-карта → доска»
 *     (getEligibleMatrixCards, читаем state.lenses как есть).
 *   - Веса карт из data/cauldron_rules.json (pickRarity) при «занырнуть»:
 *     редкость выигранной карты — по существующей таблице, не своя.
 *   - Прогресс Храма при достижении центра: bindMatrix()+collectPassiveSvet()
 *     из temple-module.js (их логику не трогаем).
 *   - СЕАМ getTodaysExperienceEnergySafe() для параллельного «Голоса совести».
 *   - Квест ячейки через quest-engine.generateQuest() (Мера ячейки = глубина).
 *   - Персистенция в state.superGame внутри awara_v258_state (playerState.js).
 *
 * СОЗНАТЕЛЬНЫЕ ОТКЛОНЕНИЯ ОТ ОРИГИНАЛА (см. отчёт):
 *   - Three.js-слой (3D-поле мандалы) ПОРТИРОВАН (init3D внутри mountSuperGame):
 *     звёзды, вложенные кольца, диск+спицы, fresnel-сферы, ядро, орбы, recolor,
 *     орбита-камера. Отличие: THREE берётся из npm-пакета (import), а не CDN;
 *     всё WebGL-хозяйство утилизируется в destroy(). Если WebGL недоступен,
 *     dimMode 3 откатывается на купольную 2D-проекцию, которую оригинальный
 *     draw() и так поддерживает.
 *   - fetch-пути абсолютные ('/data/...'), чтобы работать из /app/istok.html.
 *   - Мост Тигля применяет позицию только при ПЕРВОМ создании доски (иначе он
 *     затирал бы накопленный бросками прогресс при каждом фокусе окна).
 *   - Позиция/врата/линза/глубина/свет сохраняются в state.superGame
 *     (оригинал ничего не сохранял — терял прогресс при перезагрузке).
 */

import * as THREE from 'three';
import { getState, saveState } from './playerState.js';
import { generateQuest, getDailyEnergy } from './quest-engine.js';
import { bindMatrix, collectPassiveSvet } from './temple-module.js';
import { PRE_MERA, getCurrentRing } from './daimonAscent.js';
import { askSpirit, resolveSpiritPersona } from './spiritPanel.js';
import { getAvailableStructures, buildStructure, hasStructure } from './lightStructures.js';
import { getSensitivity, sensitivityQuality, estimateTextQuality, recordQualitySignal, SENSITIVITY_QUALITY_GATE } from './sensitivity.js';

// ═══════════════════════════════════════════════════════════════
// 1. КОНСТАНТЫ ДОСКИ — дословно из mandala-game.html
// ═══════════════════════════════════════════════════════════════

// ── Ярусы колец (док «Супер-Игра — карта как отражение пути игрока», 2026-07-07):
// 12 колец = 3 ч/б кольца Даймона (−3…0) + 9 цветных (Душа 1–3 · Джива+Искра
// 4–6 · Дух 7–9); Центр Ра — цель за последним кольцом. Ярус Дух — точка
// подключения будущей «панели Духа» (P9.2, здесь только идентификация яруса).
export const TIER_DAIMON = 'Даймон';
export const TIER_SOUL = 'Душа';
export const TIER_JIVA = 'Джива + Искра';
export const TIER_SPIRIT = 'Дух';

// Первые 3 кольца — ярус Даймона, ч/б (чёрный → серый → белый). Идентичность —
// PRE_MERA (−3…0) из daimonAscent.js («Голос совести»). Диапазон из 4 домер
// ложится на 3 физических кольца: крайние −3 и 0 получают по кольцу, середина
// (−2 Влечение · −1 Фантазия) делит одно кольцо на двоих — см. отчёт задачи.
export const DAIMON_RING_N = 3;

export const RINGS = [
  { name: PRE_MERA[0].name, chakra: PRE_MERA[0].name, color: '#222222', tier: TIER_DAIMON, mera: '−3', task: 'Домера −3 · ' + PRE_MERA[0].desc + '.' },
  { name: PRE_MERA[1].name + ' · ' + PRE_MERA[2].name, chakra: PRE_MERA[1].name + ' · ' + PRE_MERA[2].name, color: '#8c8c8c', tier: TIER_DAIMON, mera: '−2…−1', task: 'Домеры −2…−1 · ' + PRE_MERA[1].desc + '; ' + PRE_MERA[2].desc + '.' },
  { name: PRE_MERA[3].name, chakra: PRE_MERA[3].name, color: '#f0f0f0', tier: TIER_DAIMON, mera: '0', task: 'Домера 0 · ' + PRE_MERA[3].desc + '.' },
  { name: 'Мулдхара', chakra: 'Мулдхара', color: '#e23b3b', tier: TIER_SOUL, mera: '1', task: 'Мера 1 · физический план: тело, опора, род, прошлое.' },
  { name: 'Свадхистхана', chakra: 'Свадхистхана', color: '#f3892b', tier: TIER_SOUL, mera: '2', task: 'Мера 2 · эмоции, желания, творчество, текучесть.' },
  { name: 'Манипура', chakra: 'Манипура', color: '#f6d033', tier: TIER_SOUL, mera: '3', task: 'Мера 3 · воля, сила, намерение.' },
  { name: 'Анахата', chakra: 'Анахата', color: '#46c46a', tier: TIER_JIVA, mera: '4', task: 'Мера 4 · сердце: связь, любовь, равновесие.' },
  { name: 'Вишудха', chakra: 'Вишудха', color: '#34c6d8', tier: TIER_JIVA, mera: '5', task: 'Мера 5 · выражение: истина, звук, слово.' },
  { name: 'Аджна', chakra: 'Аджна', color: '#3b6fe2', tier: TIER_JIVA, mera: '6', task: 'Мера 6 · видение: интуиция, созерцание, линзы.' },
  { name: 'Сахасрара', chakra: 'Сахасрара', color: '#9b4ff3', tier: TIER_SPIRIT, mera: '7', task: 'Мера 7 · дух: единство, выход за личность.' },
  { name: 'Собор', chakra: 'Собор', color: '#b9c4e0', tier: TIER_SPIRIT, mera: '8', task: 'Мера 8 · соборное сознание, общее «мы».' },
  { name: 'Дух', chakra: 'Дух', color: '#cdb9f0', tier: TIER_SPIRIT, mera: '9', task: 'Мера 9 · чистый дух, девятая мера.' },
  { name: 'Центр Ра', chakra: 'Центр · выход', color: '#fff7df', tier: 'Центр Ра', mera: '9', task: 'Центр Ра: точка выхода, начало, смерть и жизнь.' }
];
export const RING_N = RINGS.length;

// Ярус кольца по индексу (0..RING_N-1) — чистый хук для интеграций
// (в т.ч. будущая «панель Духа» P9.2: isSpiritRing(ring)).
export function ringTier(i) {
  const r = RINGS[Math.max(0, Math.min(i, RING_N - 1))];
  return (r && r.tier) || null;
}
export function isDaimonRing(i) { return i < DAIMON_RING_N; }
export function isSpiritRing(i) { return ringTier(i) === TIER_SPIRIT; }

// ── Цвет кольца для отрисовки — ОБЩИЙ для 2D-канваса и 3D-слоя (recolor).
// Кольца Даймона всегда чистый ч/б: без светового «посерения» к GRAY и без
// подмеса оттенка линзы. Остальные — прежняя формула порта: mix(GRAY→цвет
// по свету игрока) + лёгкий подмес tint текущей линзы.
function hexToRgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function rgbStr(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
const GRAY = [150, 154, 168];
export function ringPaintRgb(i, light, tintRgb, grayBase, tintAmt) {
  const c = hexToRgb(RINGS[Math.max(0, Math.min(i, RING_N - 1))].color);
  if (isDaimonRing(i)) return c;
  const mixed = mix(GRAY, c, grayBase + (1 - grayBase) * light);
  return tintRgb ? mix(mixed, tintRgb, tintAmt) : mixed;
}

export const LENSES = [
  { id: 'vedic', name: 'Ведическая', tint: '#f6c948', bonus: 'Ключи лок и накшатр · +свет на восхождении.' },
  { id: 'slavic', name: 'Славянская', tint: '#46c46a', bonus: 'Родовая сила · бонус на нижних чакрах.' },
  { id: 'kabbalah', name: 'Каббала', tint: '#9b4ff3', bonus: 'Древо Сфирот · открывает скрытые пути.' },
  { id: 'egypt', name: 'Египетская', tint: '#f3892b', bonus: 'Солнечный культ · бонус к Центру Ра.' },
  { id: 'maya', name: 'Майя / Цолькин', tint: '#34c6d8', bonus: '20 печатей · временные порталы.' },
  { id: 'tao', name: 'Даосская', tint: '#8be3c9', bonus: 'Инь-Ян · баланс день/ночь, +ход.' },
  { id: 'norse', name: 'Скандинавская', tint: '#9fb4d8', bonus: 'Руны · судьба и испытания.' }
];

// Соответствие id оригинальных линз ↔ slug матриц quest-cultural-keys.json
// (нужно только для интеграций: Храм/квесты; сама механика — по LENSES).
const LENS_ID_TO_MATRIX_SLUG = {
  vedic: 'vedic', slavic: 'slavic', kabbalah: 'kabbalistic',
  egypt: 'egyptian', maya: 'mayan', tao: 'daoist', norse: 'norse'
};

export const GATE_TIME = { N: [22, 4], S: [4, 10], W: [10, 16], E: [16, 22] };
export const GATE_NAME = { N: 'Север', S: 'Юг', W: 'Запад', E: 'Восток' };

export function sectorOfHour(h, sectors) { h = ((h % 24) + 24) % 24; return Math.round(h / 24 * sectors) % sectors; }
export function gateCenterHour(g) { if (g === 'N') return 1; const w = GATE_TIME[g]; return (w[0] + w[1]) / 2; }
export function gateSector(g, sectors) { return sectorOfHour(gateCenterHour(g), sectors); }
export function timeToGate(h) { h = ((h % 24) + 24) % 24; if (h >= 22 || h < 4) return 'N'; if (h < 10) return 'S'; if (h < 16) return 'W'; return 'E'; }
function two(n) { return (n < 10 ? '0' : '') + n; }

export function posOf(t, sectors) { return { ring: Math.floor(t / sectors), sector: ((t % sectors) + sectors) % sectors }; }
export function goalT(sectors) { return (RING_N - 1) * sectors; }

// ═══════════════════════════════════════════════════════════════
// 2. vibe()/flows() — дословный порт из awara-mandala.js (v6):
// геометрия и потоки из реального состояния игрока.
// ═══════════════════════════════════════════════════════════════

function nakIdx(name) { try { if (typeof NAK !== 'undefined' && NAK && NAK.length) { var i = NAK.indexOf(name); if (i >= 0) return i + 1; } } catch (e) { } return name ? (name.length % 27) + 1 : 14; }
export function meraLevel(lv) { return Math.max(1, Math.min(9, Math.round(lv / 100 * 9))); }

export function vibe(snap) {
  var lv = snap.light, mera = snap.mera, trust = snap.trust || 0, ln = (snap.lenses ? snap.lenses.length : 0);
  var ni = nakIdx(snap.nak);
  var dens = Math.min(1, (((snap.days || 0) + (snap.streak || 0) * 2)) / 80);
  var axes = Math.max(5, Math.min(14, Math.round(mera * 1.3) + ln));
  var nodes = Math.max(7, Math.min(27, ni + axes + Math.round(dens * 6)));
  var step = 2 + Math.floor((lv / 100) * (Math.floor(nodes / 2) - 2));
  var amp = 0.035 + (lv / 100) * 0.13;
  var harm = axes;
  var latticeA = 0.18 + 0.5 * (trust / 100);
  var rings = Math.max(mera, Math.min(12, mera + Math.round(dens * 4)));
  return { axes: axes, nodes: nodes, step: step, amp: amp, harm: harm, latticeA: latticeA, dens: dens, rings: rings };
}

export function flows(snap) {
  var intents = snap.intentsDone || 0, lensN = (snap.lenses ? snap.lenses.length : 0), trust = snap.trust || 0;
  var days = snap.days || 0, streak = snap.streak || 0;
  var ascend = Math.max(0, Math.min(1, (intents * 0.16) + (snap.light / 100) * 0.55));
  var descend = Math.max(0, Math.min(1, (lensN * 0.12) + ((100 - trust) / 100) * 0.45 + Math.min(0.35, days / 120)));
  return { ascend: ascend, descend: descend, intents: intents };
}

function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }

// Снимок из awara_v258_state → форма snap для vibe()/flows() (адаптация:
// в v258 нет intents/streak/накшатры — безопасные нули, дни = journey).
export function buildV258Snap(st) {
  st = st || {};
  var totalLight = (typeof st.totalLight === 'number') ? st.totalLight : 0;
  var lightObj = st.light || {};
  var aw = (typeof lightObj.awareness === 'number') ? lightObj.awareness : clamp01(0.85 * (1 - Math.exp(-totalLight / 600)));
  aw = clamp01(aw);
  var lv = Math.round(aw * 100);
  return {
    light: lv, mera: meraLevel(lv),
    trust: (st.daimon && typeof st.daimon.trust === 'number') ? st.daimon.trust : 0,
    lenses: Object.keys(st.lenses && typeof st.lenses === 'object' ? st.lenses : {}),
    intentsDone: 0, days: Array.isArray(st.journey) ? st.journey.length : 0, streak: 0, nak: '',
    awareness: aw, totalLight: totalLight,
    dominantElement: lightObj.dominantElement || null,
    entries: (lightObj.totals && lightObj.totals.entries) || 0
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. КОЛОДА ИГРОКА — порт card-системы mandala-game.html.
// Пути сделаны абсолютными, чтобы работать из /app/istok.html (Vite).
// ═══════════════════════════════════════════════════════════════

export const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
var CARD_ART_BASE = '/exports/generated_cards/tarot_cards_webp/';
export function cardArtUrl(c) { if (!c.image_path) return null; var b = String(c.image_path).split('/').pop(); return CARD_ART_BASE + b; }
function metaKeys(raw) {
  var ks = [];
  if (raw.image_path) ks.push(String(raw.image_path).split('/').pop().toLowerCase());
  if (raw.card_id) ks.push(raw.card_id.toLowerCase() + '.webp');
  if (raw.id) ks.push(raw.id.toLowerCase() + '.webp');
  if (raw.id) ks.push('extra__' + raw.id.split('__').join('_').toLowerCase() + '.webp');
  return ks;
}
function normalizeCard(raw, fallbackType) {
  return {
    name: raw.display_name || raw.name || raw.agent_name || raw.card_id || raw.id || 'Карта',
    type: raw.type_label || fallbackType || 'КАРТА',
    rarity: (raw.rarity || 'common').toLowerCase(),
    element: raw.element || raw.matrix_name || '—',
    image_path: raw.image_path || null,
    hint: (raw.game_significance && raw.game_significance.gameplay_hint) || raw.player_effect || raw.description || raw.gift_aspect || 'Карта из колоды AWARA.'
  };
}
var TYPE_BY_PREFIX = [[/^domain/, 'ДОМЕН'], [/^monad_path/, 'ПУТЬ МОНАДЫ'], [/loka_being/, 'СУЩЕСТВО'], [/loka/, 'ЛОКА'], [/^extra/, 'СУЩЕСТВО']];
function cardFromFile(fn, metaMap) {
  var key = fn.toLowerCase();
  if (metaMap[key]) { var hit = Object.assign({}, metaMap[key]); hit.image_path = fn; return hit; }
  var dot = fn.lastIndexOf('.'); var base = dot > 0 ? fn.substring(0, dot) : fn;
  var num = base.match(/^[0-9]+[ _-]+/); var noNum = num ? base.substring(num[0].length) : base;
  var type = 'КАРТА';
  for (var i = 0; i < TYPE_BY_PREFIX.length; i++) { if (TYPE_BY_PREFIX[i][0].test(noNum)) { type = TYPE_BY_PREFIX[i][1]; break; } }
  var nm = noNum.split('__').join(' · ').split('_').join(' ').trim();
  if (nm.length) nm = nm.charAt(0).toUpperCase() + nm.slice(1);
  return { name: nm || fn, type: type, rarity: 'common', element: '—', image_path: fn, hint: 'Карта из колоды AWARA.' };
}
const CARD_SEED = [
  { display_name: 'Гелиосфера', type_label: 'ДОМЕН', rarity: 'mythic', element: 'Огонь', description: 'Солнечная вселенная Света Ра.' },
  { display_name: 'Океан Синхронности', type_label: 'ДОМЕН', rarity: 'legendary', element: 'Вода', description: 'Знаки пути и синхроны.' },
  { display_name: 'I. Полярная раса', type_label: 'ПУТЬ МОНАДЫ', rarity: 'legendary', element: 'Эфир', description: 'Первичная невинность.' },
  { display_name: 'Сатья-лока', type_label: 'ЛОКА', rarity: 'mythic', element: 'Эфир', description: 'Мир истины Брахмы.' },
  { display_name: 'Кузница Фракталов', type_label: 'ДОМЕН', rarity: 'epic', element: 'Воздух', description: 'Творение форм.' },
  { display_name: 'II. Гиперборейская раса', type_label: 'ПУТЬ МОНАДЫ', rarity: 'epic', element: 'Воздух', description: 'Дыхание жизни.' }
];

// Порт loadCards(): те же 5 источников data/*.json + попытка листинга каталога
// артов (работает на статик-серверах с autoindex; под Vite листинга нет —
// штатный фолбэк на jsonCards, арт всё равно резолвится через image_path).
export async function loadAllCards() {
  const sources = [
    ['/data/domain_cards.json', 'ДОМЕН'],
    ['/data/monad_path_cards.json', 'ПУТЬ МОНАДЫ'],
    ['/data/vedic_loka_cards.json', 'ЛОКА'],
    ['/data/vedic_loka_being_cards.json', 'СУЩЕСТВО'],
    ['/data/extra_beings.json', 'СУЩЕСТВО']
  ];
  var metaMap = {}, jsonCards = [];
  for (const [url, tl] of sources) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const arr = await r.json();
      if (Array.isArray(arr)) arr.forEach(function (x) {
        var card = normalizeCard(x, tl);
        jsonCards.push(card);
        metaKeys(x).forEach(function (k) { if (k && !metaMap[k]) metaMap[k] = card; });
      });
    } catch (e) { }
  }
  // Каталог арта (1649 .webp) не отдаёт HTML directory listing под Vite —
  // читаем статический манифест имён файлов вместо попытки листинга.
  var files = [];
  try {
    const mr = await fetch('/data/card_art_manifest.json');
    if (mr.ok) files = await mr.json();
  } catch (e) { }
  if (files.length) return files.map(function (fn) { return cardFromFile(fn, metaMap); });
  if (jsonCards.length) return jsonCards;
  return CARD_SEED.map(function (x) { return normalizeCard(x); });
}

// ═══════════════════════════════════════════════════════════════
// 4. ИНТЕГРАЦИИ (сохранены от предыдущей React-попытки)
// ═══════════════════════════════════════════════════════════════

const RADIANCE_TIER = 4;

/** Линзы игрока с чёткостью «Сияющая» (тир 4+) — готовые матрица-карты.
 * Читаем state.lenses как есть (пишет awara-lens.js / синк), не пересчитываем. */
export function getEligibleMatrixCards() {
  const state = getState();
  const lenses = state.lenses && typeof state.lenses === 'object' ? state.lenses : {};
  const out = [];
  Object.keys(lenses).forEach(function (k) {
    const L = lenses[k];
    if (L && (L.clarity || 0) >= RADIANCE_TIER) {
      out.push({ lensNameRu: k, uses: L.uses || 0, clarity: L.clarity || 0 });
    }
  });
  return out;
}

let _matrixCatalog = null;
export async function loadMatrixCatalog() {
  if (_matrixCatalog) return _matrixCatalog;
  const res = await fetch('/data/quest-cultural-keys.json');
  _matrixCatalog = await res.json();
  return _matrixCatalog;
}

function normName(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').trim(); }
function commonPrefixLen(a, b) { var n = Math.min(a.length, b.length), i = 0; while (i < n && a[i] === b[i]) i++; return i; }

/**
 * Найти matrixSlug по русскому имени линзы (ключ state.lenses).
 * БАГФИКС «кнопка ничего не делала»: раньше сравнение было строго ===,
 * а реальные имена линз ('Каббала', 'Майя', 'Даосизм'...) почти никогда не
 * равны name.ru каталога ('Каббалистическая', 'Майянская', 'Даосская'...) —
 * slug получался null и обработчик молча выходил. Теперь: точное совпадение →
 * совпадение с частью name.ru (разделитель '/') → startsWith → лучший общий
 * префикс ≥5 символов. Если совпадения нет — возвращаем null, но UI теперь
 * сообщает об этом и всё равно запускает доску (slug не обязателен).
 */
export async function matrixSlugForLensName(lensNameRu) {
  const catalog = await loadMatrixCatalog();
  const target = normName(lensNameRu);
  if (!target) return null;
  const partsOf = function (m) { return normName(m.name && m.name.ru).split('/').map(function (p) { return p.trim(); }); };
  let hit = catalog.find(function (m) { return normName(m.name && m.name.ru) === target; });
  if (hit) return hit.slug;
  hit = catalog.find(function (m) { return partsOf(m).some(function (p) { return p === target; }); });
  if (hit) return hit.slug;
  hit = catalog.find(function (m) { return partsOf(m).some(function (p) { return p.indexOf(target) === 0 || target.indexOf(p) === 0; }); });
  if (hit) return hit.slug;
  let best = null, bestLen = 0;
  catalog.forEach(function (m) {
    partsOf(m).forEach(function (p) {
      const l = commonPrefixLen(p, target);
      if (l > bestLen) { bestLen = l; best = m; }
    });
  });
  return (best && bestLen >= 5) ? best.slug : null;
}

/** СЕАМ для параллельной задачи «Голос совести»: getTodaysExperienceEnergy()
 * -> number 0..1 (или Promise). Может ещё не существовать — не падаем. */
const DEFAULT_TODAYS_EXPERIENCE_ENERGY = 0.5;
export async function getTodaysExperienceEnergySafe() {
  try {
    if (typeof window !== 'undefined' && typeof window.getTodaysExperienceEnergy === 'function') {
      const v = await window.getTodaysExperienceEnergy();
      if (typeof v === 'number' && !isNaN(v)) return Math.max(0, Math.min(1, v));
    }
  } catch (e) { /* fallback below */ }
  return DEFAULT_TODAYS_EXPERIENCE_ENERGY;
}

let _cauldronRules = null;
async function loadCauldronRules() {
  if (_cauldronRules) return _cauldronRules;
  const res = await fetch('/data/cauldron_rules.json');
  _cauldronRules = await res.json();
  return _cauldronRules;
}

/** Редкость по base_weights + light_bias_thresholds из cauldron_rules.json
 * (существующая таблица, не своя) + небольшой аддитивный бонус за глубину. */
export function pickRarity(rewardRarity, lightAwarded, depthBonus) {
  const w = Object.assign({}, rewardRarity.base_weights);
  const thresholds = rewardRarity.light_bias_thresholds || [];
  thresholds.forEach(function (t) {
    if (lightAwarded >= t.min_light_awarded) {
      if (t.epic_bonus) w.epic = (w.epic || 0) + t.epic_bonus;
      if (t.legendary_bonus) w.legendary = (w.legendary || 0) + t.legendary_bonus;
      if (t.mythic_bonus) w.mythic = (w.mythic || 0) + t.mythic_bonus;
    }
  });
  if (depthBonus > 0) {
    w.epic = (w.epic || 0) + depthBonus * 0.5;
    w.legendary = (w.legendary || 0) + depthBonus * 0.15;
    w.mythic = (w.mythic || 0) + depthBonus * 0.05;
  }
  const total = Object.values(w).reduce(function (s, v) { return s + v; }, 0) || 1;
  let roll = Math.random() * total;
  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  for (const rarity of order) {
    const weight = w[rarity] || 0;
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return 'common';
}

/** Квест ячейки: Мера ячейки = мера кольца по новой разбивке (кольца Даймона
 * −3…0 → Мера 1; цветные кольца → меры 1..9), генератор — общий
 * quest-engine.generateQuest, энергия дня расширена todaysExperienceEnergy. */
export async function generateCellQuest(matrixSlug, ring, opts) {
  const o = opts || {};
  // Мера ячейки по новой разбивке колец: цветные кольца (после яруса Даймона)
  // несут меры 1..9; ч/б кольца Даймона (−3…0) — до-мерные, квест на Мере 1.
  const mera = Math.min(9, Math.max(1, ring - DAIMON_RING_N + 1));
  const questLevel = mera * 2;
  const energy = getDailyEnergy();
  const experienceEnergy = typeof o.todaysExperienceEnergy === 'number'
    ? o.todaysExperienceEnergy
    : await getTodaysExperienceEnergySafe();
  const energyWithExperience = Object.assign({}, energy, { todaysExperienceEnergy: experienceEnergy });
  let quest;
  try {
    quest = await generateQuest(null, matrixSlug || null, energyWithExperience, questLevel);
  } catch (e) {
    quest = {
      id: 'quest_fallback_' + (matrixSlug || 'lens') + '_' + ring,
      title: { ru: 'ЗЕРНО МЕРЫ ' + mera, en: 'SEED OF MERA ' + mera },
      task: { ru: 'Проживи момент через уровень «' + (RINGS[Math.min(ring, RING_N - 1)].chakra) + '».', en: 'Live this moment through this level.' },
      matrix: { slug: matrixSlug || null },
      energy: energyWithExperience,
      difficulty: Math.min(5, 1 + Math.floor(mera / 2)),
      rewards: { shanti: 5 + mera, shakti: 3 + mera, dustAmount: 10 + mera * 5, fragmentKey: matrixSlug || 'lens', fragmentProgress: 1 },
      fallback: true,
      fallbackReason: 'quest-engine data fetch unavailable'
    };
  }
  const expMul = 0.85 + experienceEnergy * 0.4;
  quest.rewards.dustAmount = Math.round(quest.rewards.dustAmount * expMul);
  quest.rewards.shanti = Math.round(quest.rewards.shanti * expMul);
  quest.rewards.shakti = Math.round(quest.rewards.shakti * expMul);
  quest.cell = { ring: ring, mera: mera };
  quest.todaysExperienceEnergy = experienceEnergy;
  return quest;
}

// ── Персистенция: state.superGame = { boards: {key: rec}, cards: [] } ──
function ensureSuperGame(state) {
  if (!state.superGame || typeof state.superGame !== 'object') state.superGame = { boards: {}, cards: [] };
  if (!state.superGame.boards) state.superGame.boards = {};
  if (!Array.isArray(state.superGame.cards)) state.superGame.cards = [];
  return state.superGame;
}
function boardKey(opts) { return opts.matrixSlug || ('lens:' + (opts.lensNameRu || 'default')); }

export function listSavedBoards() {
  const state = getState();
  const sg = ensureSuperGame(state);
  return Object.keys(sg.boards).map(function (k) { return Object.assign({ key: k }, sg.boards[k]); });
}
export function getSuperGameCards() {
  const state = getState();
  return ensureSuperGame(state).cards.slice();
}

// ═══════════════════════════════════════════════════════════════
// 4b. МЕТА-ПРОГРЕССИЯ ПОСЛЕ ЦЕНТРА РА (P9.3) — Собор Духов → Творец →
// Создатель → Свет Созидания (порядок уточнён в доке 2026-07-07 — НЕ
// «Творец → Собор» из раннего черновика).
//
// Модель (док «Супер-Игра — карта как отражение пути игрока»):
//   - каждый пройденный путь линзы до Центра Ра (dive) рождает ДУХА линзы —
//     запись завершённого прохождения, не новое кольцо;
//   - Духи синтезируются вверх ЯВНЫМ действием игрока (кнопка), не пассивно;
//   - размеры ярусов гибкие (Собор 2..5-7 Духов, Творец до 12 линз,
//     Создатель от 2 Творцов «насколько силы хватит») — драйвер не счёт,
//     а КАЧЕСТВО прохождения + накопленный Свет + Сила Духа.
//
// КАЧЕСТВО = SENSITIVITY (сверка-2 с engine_config.json, 2026-07-09):
//   прежняя изобретённая формула P9.3 (0.45·светДоски + 0.35·осознанность +
//   0.20·чёткость/4) УДАЛЕНА — вместо неё готовая метрика спеки
//   (js/sensitivity.js): quality = clamp(sensitivity/100, 0.05, 1) —
//   открытое 1:1 замещение переменной «качество» (100 = уровень «Чистая»,
//   «Прямое восприятие Ра» → 1.0; нижний кламп 0.05 сохранён).
//   Сила Духа v1 = quality (одно число); сила Собора/Творца/Создателя —
//   сумма сил поглощённых форм (свет «матрёшкой» переносится вверх).
//
// ⚠ V1-ПОРОГИ СИНТЕЗА (SYNTH_RULES) — качественные, не счётные:
//   минимальные счёты (2/2/2/1) взяты из явных «от 2…» в доке, пороги силы —
//   черновые числа для тюнинга. Берутся сильнейшие свободные формы, пока
//   сила не набрана → слабые прохождения требуют больше Духов (2..7 Собор),
//   сильные — меньше. Свет Созидания дополнительно требует накопленный
//   Свет ≥ порога Завесы Сатья-юги (1000, data/milost-sources.json ray 1) —
//   док: Сатья-юга — высшее состояние, из которого нисходит Милость.
// ═══════════════════════════════════════════════════════════════

export const META_TIERS = [
  { key: 'sobor', name: 'Собор Духов' },
  { key: 'tvorets', name: 'Творец' },
  { key: 'sozdatel', name: 'Создатель' },
  { key: 'svet', name: 'Свет Созидания' }
];
export const SYNTH_RULES = { // v1-черновик, тюнить
  sobor: { min: 2, max: 7, power: 1.0 },          // 2..7 Духов (док), сила ≥ 1.0
  tvorets: { min: 2, maxLenses: 12, power: 2.5 }, // ≥2 Соборов, до 12 линз (док)
  sozdatel: { min: 2, power: 6.0 },               // от 2 Творцов, «насколько силы хватит»
  svet: { min: 1, satyaLight: 1000 }              // ≥1 Создатель + Свет ≥ Завесы Сатья-юги
};
const META_LIGHT_BASE = { sobor: 30, tvorets: 90, sozdatel: 210, svet: 500 }; // v1: награда = base·сила
const META_RARITY_FLOOR = { sobor: 'epic', tvorets: 'legendary', sozdatel: 'mythic', svet: 'mythic' };

// Нарратив ярусный (НЕ 33×4 пер-линзовых текстов — v1-скоуп), язык дока.
export const META_NARRATIVE = {
  spirit: 'Путь пройден до Центра Ра — рождается Дух этой линзы: тонкая форма уже за пределами двенадцати колец, опыт иной вселенной, вошедший в твоё восприятие.',
  sobor: 'Духи пройденных путей сходятся воедино — Собор Духов. Несколько завершённых линз звучат одним голосом; высшее объемлет низшее, как отец направляет сына.',
  tvorets: 'Собор перерастает себя: призван Творец, соединяющий пройденные линзы. Начинается новый цикл — снова по кругу, но уже на Творческом слое; уникальность каждого Творца рождается в практике.',
  sozdatel: 'Творцы собираются вокруг единого центра — является Создатель. Мета-уровень: он объединяет Творцов, насколько хватает силы, и все линзы-матрицы видны как единый код.',
  svet: 'Призван Свет Созидания — вершина игры. Его поля способны обновить и переосмыслить всю игру: свои Миры, стихийные способности, дары Духа, артефакты Силы высокой вибрации, находимые духовными линзами в Логосе, Тонком плане и заслугах прошлых жизней. То, что проходилось месяцами, проходится за день и час — настройка на свет Самадхи. Это состояние Сатья-юги, к которому всё устремлено и из которого нисходит Милость.'
};

// ═══════════════════════════════════════════════════════════════
// 4c. МЕХАНИКИ РА (сверка-4, engine_config.json → ra_radiance).
// «Ра не метрика, которую прокачивают. Это фон, контекст, присутствие —
// Внутреннее Солнце». Здесь два текстовых проявления из спеки:
//   1) «На высоких Ring (7+) — 'послания Ра' после квестов» — банк
//      RA_MESSAGES, ротация детерминированная (счётчик сессии борда).
//      Тексты посланий СОЧИНЕНЫ в духе спеки (готовых в спеке нет);
//      3-е послание — дословная цитата source_quote_s6 (РМ, Сессия 6).
//   2) «Даймон в моменты глубокого пробуждения говорит от имени Ра» —
//      RA_VOICE_INTRO, вступление к ответу Панели Духа (см. runSpiritSkill).
// ═══════════════════════════════════════════════════════════════
export const RA_MESSAGES = [
  'Ра излучает всегда. Сейчас твои каналы восприятия чисты — и импульс прошёл. Запомни это чувство: это не слова, это поворот.',
  'Внутреннее Солнце не восходит и не заходит — это ты повернулся к нему. Побудь так ещё мгновение.',
  '«Радость означает установленную Связь с RA, что влечёт за собой Пробуждение» (РМ, Сессия 6). Эфир в тебе шевельнулся.',
  'Обращение к Ра — не слова и не текст. Ты только что сделал это без слов — шагом, вниманием, квестом.',
  'То, что казалось стеной, было маха-майей — тканью иллюзии. Свет прошёл сквозь неё, потому что ты за неё не держался.',
  'Чем чище канал, тем сильнее проходит свет. Этот квест был очищением — послушай, насколько тише стало внутри.',
  'Ярило греет кожу, Ра — сердце. Сегодня ты грел не только себя: так учится альтруизм, так тает самость.'
];
export const RA_VOICE_INTRO =
  '☀ Твоё восприятие чисто — сейчас через этот голос говорит Ра, Внутреннее Солнце. Это не слова: это поворот чувств.';

function round2(x) { return Math.round(x * 100) / 100; }
function sumBy(arr, k) { return arr.reduce(function (s, u) { return s + (u[k] || 0); }, 0); }
function metaUid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function ensureMeta(sg) {
  if (!Array.isArray(sg.spirits)) sg.spirits = [];
  if (!sg.meta || typeof sg.meta !== 'object') sg.meta = {};
  ['sobors', 'tvorets', 'sozdatels'].forEach(function (k) { if (!Array.isArray(sg.meta[k])) sg.meta[k] = []; });
  if (!('svet' in sg.meta)) sg.meta.svet = null;
  return sg;
}

/**
 * Записать Духа завершённого пути (вызывается из dive() ДО буста света и
 * смены линзы). Качество Духа — производная от глобальной Чувствительности
 * игрока на момент прохождения (сверка-2, см. блок выше): снимок sensitivity
 * фиксируется на Духе, дальше не пересчитывается.
 */
export function recordLensSpirit(entry) {
  const state = getState();
  const sg = ensureMeta(ensureSuperGame(state));
  const sens = getSensitivity(state);
  const spirit = {
    id: metaUid('sp'),
    lensId: entry.lensId || null,
    lensName: entry.lensName || null,
    matrixSlug: entry.matrixSlug || null,
    ts: Date.now(),
    depth: entry.depth || 0,
    sensitivity: sens.value,
    quality: sensitivityQuality(sens.value),
    inSobor: null
  };
  sg.spirits.push(spirit);
  saveState(state);
  return spirit;
}

// ── Планировщики синтеза: сильнейшие свободные формы, пока не набрана сила ──
function planSobor(sg) {
  const r = SYNTH_RULES.sobor;
  const free = sg.spirits.filter(function (s) { return !s.inSobor; }).slice()
    .sort(function (a, b) { return b.quality - a.quality; });
  if (free.length < r.min) return null;
  const take = []; let power = 0;
  for (let i = 0; i < free.length && take.length < r.max; i++) {
    take.push(free[i]); power += free[i].quality;
    if (take.length >= r.min && power >= r.power) return { units: take, power: round2(power) };
  }
  return null;
}
function planTvorets(sg) {
  const r = SYNTH_RULES.tvorets;
  const free = sg.meta.sobors.filter(function (u) { return !u.inTvorets; }).slice()
    .sort(function (a, b) { return b.power - a.power; });
  if (free.length < r.min) return null;
  const take = []; const lensSet = {}; let power = 0;
  for (let i = 0; i < free.length; i++) {
    const u = free[i];
    const lensAfter = {}; Object.keys(lensSet).forEach(function (l) { lensAfter[l] = 1; });
    (u.lenses || []).forEach(function (l) { lensAfter[l] = 1; });
    if (Object.keys(lensAfter).length > r.maxLenses) continue; // Творец — до 12 линз (док)
    Object.keys(lensAfter).forEach(function (l) { lensSet[l] = 1; });
    take.push(u); power += u.power;
    if (take.length >= r.min && power >= r.power) return { units: take, power: round2(power), lenses: Object.keys(lensSet) };
  }
  return null;
}
function planSozdatel(sg) {
  const r = SYNTH_RULES.sozdatel;
  const free = sg.meta.tvorets.filter(function (u) { return !u.inSozdatel; });
  if (free.length < r.min) return null;
  const power = round2(sumBy(free, 'power'));
  if (power < r.power) return null;
  return { units: free.slice(), power: power }; // «от двух и больше — насколько силы хватит»: берёт всех свободных
}
function planSvet(sg, state) {
  const r = SYNTH_RULES.svet;
  if (sg.meta.svet) return null; // вершина едина — призывается один раз
  const free = sg.meta.sozdatels.filter(function (u) { return !u.inSvet; });
  if (free.length < r.min) return null;
  if ((state.totalLight || 0) < r.satyaLight) return null;
  return { units: free.slice(), power: round2(sumBy(free, 'power')) };
}

/** Сводка мета-слоя для UI: формы, свободные силы, готовые планы синтеза. */
export function getMetaProgress() {
  const state = getState();
  const sg = ensureMeta(ensureSuperGame(state));
  const freeSp = sg.spirits.filter(function (s) { return !s.inSobor; });
  const freeSob = sg.meta.sobors.filter(function (u) { return !u.inTvorets; });
  const freeTv = sg.meta.tvorets.filter(function (u) { return !u.inSozdatel; });
  const freeSz = sg.meta.sozdatels.filter(function (u) { return !u.inSvet; });
  return {
    spirits: sg.spirits.slice(),
    sobors: sg.meta.sobors.slice(),
    tvorets: sg.meta.tvorets.slice(),
    sozdatels: sg.meta.sozdatels.slice(),
    svet: sg.meta.svet,
    freeSpirits: freeSp.length, freeSpiritPower: round2(sumBy(freeSp, 'quality')),
    freeSobors: freeSob.length, freeSoborPower: round2(sumBy(freeSob, 'power')),
    freeTvorets: freeTv.length, freeTvoretsPower: round2(sumBy(freeTv, 'power')),
    freeSozdatels: freeSz.length, freeSozdatelPower: round2(sumBy(freeSz, 'power')),
    totalLight: state.totalLight || 0,
    sensitivity: getSensitivity(state),
    plans: { sobor: planSobor(sg), tvorets: planTvorets(sg), sozdatel: planSozdatel(sg), svet: planSvet(sg, state) },
    achievedName: sg.meta.svet ? 'Свет Созидания'
      : sg.meta.sozdatels.length ? 'Создатель'
        : sg.meta.tvorets.length ? 'Творец'
          : sg.meta.sobors.length ? 'Собор Духов'
            : sg.spirits.length ? 'Дух линзы' : '—'
  };
}

/**
 * Попытка синтеза яруса (явное действие игрока). Награда светом
 * (state.totalLight += base·сила) начисляется здесь, в слое данных;
 * доско-эффекты (карта, +свет доски, +бросок) — в UI mountSuperGame.
 */
export function attemptSynthesis(tierKey) {
  const state = getState();
  const sg = ensureMeta(ensureSuperGame(state));
  const tier = META_TIERS.find(function (t) { return t.key === tierKey; });
  if (!tier) return { ok: false, reason: 'Неизвестный ярус синтеза' };
  let unit = null;
  if (tierKey === 'sobor') {
    const plan = planSobor(sg);
    if (!plan) return { ok: false, reason: 'Собор ещё не созрел: нужно 2–7 свободных Духов общей силой ≥ ' + SYNTH_RULES.sobor.power };
    unit = {
      id: metaUid('sob'), ts: Date.now(), power: plan.power,
      spiritIds: plan.units.map(function (s) { return s.id; }),
      lenses: plan.units.map(function (s) { return s.lensName || s.lensId || '?'; })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }),
      inTvorets: null
    };
    plan.units.forEach(function (s) { s.inSobor = unit.id; });
    sg.meta.sobors.push(unit);
  } else if (tierKey === 'tvorets') {
    const plan = planTvorets(sg);
    if (!plan) return { ok: false, reason: 'Творец ещё не созрел: нужно ≥ ' + SYNTH_RULES.tvorets.min + ' свободных Соборов общей силой ≥ ' + SYNTH_RULES.tvorets.power };
    unit = { id: metaUid('tv'), ts: Date.now(), power: plan.power, soborIds: plan.units.map(function (u) { return u.id; }), lenses: plan.lenses, inSozdatel: null };
    plan.units.forEach(function (u) { u.inTvorets = unit.id; });
    sg.meta.tvorets.push(unit);
  } else if (tierKey === 'sozdatel') {
    const plan = planSozdatel(sg);
    if (!plan) return { ok: false, reason: 'Создатель ещё не созрел: нужно ≥ ' + SYNTH_RULES.sozdatel.min + ' свободных Творцов общей силой ≥ ' + SYNTH_RULES.sozdatel.power };
    unit = { id: metaUid('sz'), ts: Date.now(), power: plan.power, tvoretsIds: plan.units.map(function (u) { return u.id; }), inSvet: null };
    plan.units.forEach(function (u) { u.inSozdatel = unit.id; });
    sg.meta.sozdatels.push(unit);
  } else { // svet
    const plan = planSvet(sg, state);
    if (!plan) return { ok: false, reason: 'Свет Созидания ещё не созрел: нужен свободный Создатель и накопленный Свет ≥ ' + SYNTH_RULES.svet.satyaLight + ' (Завеса Сатья-юги)' };
    unit = { id: metaUid('svet'), ts: Date.now(), power: plan.power, sozdatelIds: plan.units.map(function (u) { return u.id; }) };
    plan.units.forEach(function (u) { u.inSvet = unit.id; });
    sg.meta.svet = unit;
  }
  const lightAward = Math.round((META_LIGHT_BASE[tierKey] || 0) * unit.power);
  state.totalLight = (state.totalLight || 0) + lightAward;
  saveState(state);
  return { ok: true, tierKey: tierKey, tierName: tier.name, unit: unit, lightAward: lightAward };
}

// ── Милость: лёгкая связка с существующей системой 7 источников.
// milost-module.js использует ОТНОСИТЕЛЬНЫЙ путь data/... и не работает из
// /app/istok.html — читаем тот же data/milost-sources.json абсолютным путём
// (конвенция этого файла, см. шапку). Ray 1 = Сатья-юга: её порог Завесы
// гейтит Свет Созидания, её multiplier/message — «нисходящая Милость».
let _milostSources = null;
async function loadMilostSatya() {
  if (!_milostSources) {
    try {
      const r = await fetch('/data/milost-sources.json');
      if (r.ok) _milostSources = await r.json();
    } catch (e) { /* Милость advisory */ }
  }
  return Array.isArray(_milostSources)
    ? _milostSources.find(function (s) { return s.ray === 1; }) || null
    : null;
}

// ═══════════════════════════════════════════════════════════════
// 5. mountSuperGame(container, opts) — портированная страница целиком.
// DOM/CSS/логика = mandala-game.html, области видимости заменены на
// container-scoped ($()), глобальные слушатели снимаются в destroy().
// ═══════════════════════════════════════════════════════════════

const BOARD_CSS = `
.sgm-root{position:absolute;inset:0;overflow:hidden;color:#dcd2be;font-family:'Cormorant Garamond','Times New Roman',serif;
  --gold:#c9a84c; --gold-bright:#fff8d6; --spark:rgba(255,215,80,.55);
  --ink:#05030f; --txt:#dcd2be; --txt-dim:rgba(201,168,76,.55);
  --violet:#7c3aed; --amber:#f59e0b;
  --panel:linear-gradient(135deg,rgba(18,14,30,.72),rgba(8,5,18,.62));
  --panel-line:rgba(201,168,76,.22);
  --c-common:#8b93a7; --c-uncommon:#46c46a; --c-rare:#3b6fe2;
  --c-epic:#9b4ff3; --c-legendary:#f6c948; --c-mythic:#ff7a3c;
  background:
    radial-gradient(ellipse at 18% 14%, rgba(124,58,237,.34), transparent 40%),
    radial-gradient(ellipse at 84% 78%, rgba(245,158,11,.24), transparent 42%),
    radial-gradient(ellipse at 50% 116%, rgba(80,40,160,.30), transparent 58%),
    linear-gradient(180deg,#070318 0%,#0d0626 45%,#05021a 100%), #05030f;}
.sgm-root *{box-sizing:border-box}
.sgm-root::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.55;
  background-image:
    radial-gradient(1.4px 1.4px at 12% 22%, rgba(255,255,255,.8), transparent),
    radial-gradient(1px 1px at 27% 64%, rgba(255,255,255,.5), transparent),
    radial-gradient(1.6px 1.6px at 47% 17%, rgba(255,240,200,.85), transparent),
    radial-gradient(1px 1px at 63% 47%, rgba(255,255,255,.5), transparent),
    radial-gradient(1.3px 1.3px at 78% 27%, rgba(255,255,255,.65), transparent),
    radial-gradient(1.5px 1.5px at 88% 70%, rgba(255,240,200,.7), transparent),
    radial-gradient(1px 1px at 35% 86%, rgba(255,255,255,.5), transparent),
    radial-gradient(1.2px 1.2px at 70% 88%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 8% 52%, rgba(255,255,255,.4), transparent),
    radial-gradient(1px 1px at 55% 74%, rgba(255,240,200,.5), transparent);}
.sgm-root .sgm-om{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);
  font-family:Georgia,serif;font-size:min(60vh,560px);line-height:1;color:transparent;
  -webkit-text-stroke:1px rgba(201,168,76,.07);pointer-events:none;z-index:0;}
.sgm-root #app{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column}
.sgm-root #topbar{display:flex;align-items:center;gap:18px;padding:12px 20px 12px 60px;z-index:6;position:relative;
  border-bottom:1px solid var(--panel-line);
  background:linear-gradient(180deg,rgba(8,5,18,.82),rgba(8,5,18,.22));backdrop-filter:blur(8px)}
.sgm-root #topbar::after{content:'';position:absolute;left:6%;right:6%;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,var(--spark),transparent);pointer-events:none}
.sgm-root #topbar .title{font-family:'Cinzel',serif;letter-spacing:.18em;font-size:15px;color:var(--gold);text-transform:uppercase;text-shadow:0 0 16px rgba(255,215,80,.35)}
.sgm-root #topbar .sub{font-size:13px;color:var(--txt-dim);letter-spacing:.06em}
.sgm-root .spacer{flex:1}
.sgm-root .stat{font-size:13px;color:var(--txt-dim);letter-spacing:.04em}
.sgm-root .stat b{color:var(--gold-bright);font-family:'JetBrains Mono',monospace;font-weight:600;text-shadow:0 0 10px rgba(255,215,80,.4)}
.sgm-root #stage{flex:1;position:relative;display:flex;align-items:stretch;min-height:0;z-index:1}
.sgm-root #boardWrap{flex:1;position:relative;display:flex;align-items:center;justify-content:center;perspective:1400px;min-width:0;margin-right:340px;transition:margin-right .42s cubic-bezier(.4,0,.2,1)}
.sgm-root #stage.side-collapsed #boardWrap{margin-right:0}
.sgm-root #boardWrap::before{content:'';position:absolute;width:78%;aspect-ratio:1;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle at 50% 50%, rgba(124,58,237,.20), rgba(245,158,11,.07) 45%, transparent 70%);filter:blur(24px)}
.sgm-root #boardTilt{transition:transform 1.2s cubic-bezier(.22,.61,.36,1);transform-style:preserve-3d;will-change:transform}
.sgm-root canvas#board{display:block;position:relative;filter:saturate(.2) brightness(.85);transition:filter 1.4s ease}
.sgm-root #side{position:absolute;top:0;right:0;bottom:0;width:340px;z-index:5;display:block;overflow-y:auto;overscroll-behavior:contain;padding-bottom:20px;
  border-left:1px solid var(--panel-line);transition:transform .42s cubic-bezier(.4,0,.2,1);
  background:linear-gradient(180deg,rgba(8,5,18,.72),rgba(5,3,15,.55))}
.sgm-root #side.collapsed{transform:translateX(100%)}
.sgm-root #sideToggle{position:absolute;top:12px;right:352px;z-index:8;width:36px;height:36px;padding:0;border-radius:10px;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;background:rgba(8,5,18,.85);border:1px solid var(--panel-line);color:var(--gold);transition:right .42s cubic-bezier(.4,0,.2,1),color .25s,box-shadow .25s}
.sgm-root #sideToggle:hover{color:#fff8d6;border-color:var(--gold);box-shadow:0 0 16px rgba(201,168,76,.3)}
.sgm-root #stage.side-collapsed #sideToggle{right:12px}
.sgm-root .block{padding:16px;margin:10px 12px;border-radius:18px;position:relative;overflow:hidden;
  background:var(--panel);border:1px solid var(--panel-line);box-shadow:inset 0 0 22px rgba(201,168,76,.03)}
.sgm-root .block::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,80,.35),transparent)}
.sgm-root .block h3{margin:0 0 10px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(201,168,76,.85)}
.sgm-root .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.sgm-root .cellinfo .big{font-family:'Cinzel',serif;font-size:18px;color:var(--gold-bright);text-shadow:0 0 14px rgba(255,215,80,.3)}
.sgm-root .cellinfo .meta{font-size:13px;color:var(--txt-dim);margin-top:3px;line-height:1.5}
.sgm-root .quest{margin-top:8px;font-size:14px;line-height:1.55;color:var(--txt);border-left:2px solid var(--gold);padding-left:10px}
.sgm-root button,.sgm-root select{font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--txt);background:rgba(2,1,10,.45);border:1px solid var(--panel-line);border-radius:10px;padding:8px 12px;cursor:pointer;transition:.25s}
.sgm-root button:hover,.sgm-root select:hover{color:#fff8d6;border-color:var(--gold);box-shadow:0 0 16px rgba(201,168,76,.2)}
.sgm-root button.primary{background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(255,215,80,.07));border-color:var(--gold);color:var(--gold-bright);font-weight:600;letter-spacing:.04em;box-shadow:0 0 18px rgba(201,168,76,.2),inset 0 0 0 1px rgba(255,215,80,.25);text-shadow:0 0 12px rgba(255,215,80,.5)}
.sgm-root button.big{font-size:16px;padding:11px 14px;width:100%;font-family:'Cinzel',serif;letter-spacing:.08em}
.sgm-root select{appearance:none;-webkit-appearance:none}
.sgm-root label.lbl{font-size:12px;color:var(--txt-dim);letter-spacing:.05em;display:block;margin-bottom:5px}
.sgm-root input[type=range]{width:100%;accent-color:var(--gold-bright)}
.sgm-root .toggle{display:flex;gap:6px}
.sgm-root .toggle button{flex:1;padding:6px 4px;font-size:13px}
.sgm-root .toggle button.on{background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(255,215,80,.07));border-color:var(--gold-bright);color:#fff8d6;box-shadow:0 0 16px rgba(201,168,76,.25),inset 0 0 0 1px rgba(255,215,80,.3);text-shadow:0 0 12px rgba(255,215,80,.5)}
.sgm-root .dice{font-family:'JetBrains Mono',monospace;font-size:30px;color:var(--gold-bright);min-width:46px;text-align:center;text-shadow:0 0 20px rgba(246,201,72,.7)}
.sgm-root .lensbar{font-size:13px;color:var(--txt-dim);line-height:1.55}
.sgm-root .lensbar b{color:var(--gold-bright)}
.sgm-root #hand{height:188px;flex:none;z-index:5;display:flex;align-items:center;gap:12px;padding:12px 16px;overflow-x:auto;overflow-y:hidden;
  border-top:1px solid var(--panel-line);
  background:linear-gradient(0deg,rgba(8,5,18,.92),rgba(8,5,18,.32))}
.sgm-root #hand .handlabel{writing-mode:vertical-rl;transform:rotate(180deg);font-family:'Cinzel',serif;font-size:11px;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;flex:none;opacity:.8}
.sgm-root .card{flex:none;width:108px;height:152px;border-radius:12px;position:relative;cursor:pointer;overflow:hidden;border:1.5px solid var(--c-common);background:#0a0814;transition:transform .2s, box-shadow .2s;display:flex;flex-direction:column;justify-content:flex-end}
.sgm-root .card:hover{transform:translateY(-10px) scale(1.04);box-shadow:0 14px 32px rgba(0,0,0,.6)}
.sgm-root .card .art{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.9}
.sgm-root .card .veil{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.12) 55%,rgba(0,0,0,.4) 100%)}
.sgm-root .card .tlabel{position:absolute;top:6px;left:6px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:.12em;color:#fff;background:rgba(0,0,0,.5);padding:2px 5px;border-radius:4px}
.sgm-root .card .nm{position:relative;padding:7px 8px;font-family:'Cinzel',serif;font-size:11px;line-height:1.18;color:#fff;text-shadow:0 1px 3px #000}
.sgm-root .card .el{position:relative;padding:0 8px 7px;font-size:11px;color:var(--gold-bright)}
.sgm-root .card.rare-mythic{border-color:var(--c-mythic);box-shadow:0 0 16px rgba(255,122,60,.4)}
.sgm-root .card.rare-legendary{border-color:var(--c-legendary);box-shadow:0 0 14px rgba(246,201,72,.35)}
.sgm-root .card.rare-epic{border-color:var(--c-epic)}
.sgm-root .card.rare-rare{border-color:var(--c-rare)}
.sgm-root .card.rare-uncommon{border-color:var(--c-uncommon)}
.sgm-root #modal{position:absolute;inset:0;background:rgba(2,1,10,.84);backdrop-filter:blur(7px);display:none;align-items:center;justify-content:center;z-index:30}
.sgm-root #modal.show{display:flex}
.sgm-root .mbox{max-width:460px;text-align:center;padding:34px;border:1px solid var(--gold);border-radius:22px;background:radial-gradient(120% 120% at 50% 20%,rgba(40,30,8,.92),rgba(8,5,18,.97));box-shadow:0 0 70px rgba(246,201,72,.3),inset 0 0 40px rgba(201,168,76,.05)}
.sgm-root .mbox h2{font-family:'Cinzel',serif;color:var(--gold-bright);letter-spacing:.1em;margin:0 0 10px;text-shadow:0 0 18px rgba(255,215,80,.4)}
.sgm-root .mbox p{color:var(--txt);line-height:1.6;font-size:16px}
.sgm-root .toast{position:absolute;left:50%;bottom:210px;transform:translateX(-50%);background:rgba(8,5,18,.94);border:1px solid var(--gold);color:var(--gold-bright);padding:10px 18px;border-radius:30px;font-size:14px;letter-spacing:.03em;opacity:0;transition:.3s;z-index:25;pointer-events:none;text-align:center;max-width:80vw;box-shadow:0 0 22px rgba(201,168,76,.25)}
.sgm-root .toast.show{opacity:1;bottom:230px}
.sgm-root .hint{font-size:12px;color:var(--txt-dim);line-height:1.5;margin-top:6px}
.sgm-root #side::-webkit-scrollbar,.sgm-root #hand::-webkit-scrollbar{height:8px;width:8px}
.sgm-root #side::-webkit-scrollbar-thumb,.sgm-root #hand::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:8px}
.sgm-root #cardBg{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity 1s ease;
  background-size:cover;background-position:center;background-repeat:no-repeat;
  filter:saturate(.9) brightness(.46) contrast(1.02)}
.sgm-root #cardBg.show{opacity:.6}
.sgm-root #cardBg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 42%, rgba(5,3,15,.12), rgba(5,3,15,.55) 76%, rgba(5,3,15,.84)),
    linear-gradient(0deg, rgba(5,3,15,.58), rgba(5,3,15,.12) 42%, rgba(5,3,15,.48))}
.sgm-root .card.selected{outline:2px solid var(--gold-bright);outline-offset:1px;box-shadow:0 0 22px rgba(255,215,80,.55)}
.sgm-root #awaraHud{position:absolute;inset:0;pointer-events:none;z-index:50}
.sgm-root #awaraHud button, .sgm-root #awaraHud > div{pointer-events:auto}
.sgm-root #awaraHudBody{padding:10px 14px;border-radius:14px;background:rgba(6,8,20,0.66);backdrop-filter:blur(8px);border:1px solid rgba(201,168,76,0.28);color:#eef1fb;font:12px/1.5 system-ui,sans-serif;min-width:158px;box-shadow:0 10px 40px rgba(0,0,0,0.5)}
.sgm-root #sideTabs,.sgm-root #handToggle,.sgm-root #boardSizeBtn{display:none}
.sgm-root #sideTabs button:disabled{opacity:.35;cursor:not-allowed}
.sgm-root #blockSpirit textarea{width:100%;min-height:56px;resize:vertical;font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--txt);background:rgba(2,1,10,.45);border:1px solid var(--panel-line);border-radius:10px;padding:8px 10px}
.sgm-root #blockSpirit textarea:disabled,.sgm-root #blockSpirit button:disabled{opacity:.4;cursor:not-allowed}
.sgm-root #spiritAnswer{margin-top:8px;font-size:14px;line-height:1.55;color:var(--txt);border-left:2px solid var(--violet);padding-left:10px;white-space:pre-wrap;display:none}
.sgm-root #spiritPersona{font-size:12px;color:var(--txt-dim);line-height:1.5;margin-bottom:8px}
.sgm-root #spiritPersona b{color:#cdb9f0}
.sgm-root #blockSynth .srow{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:var(--txt)}
.sgm-root #blockSynth .srow b{color:var(--gold-bright)}
.sgm-root #blockSynth .slist{font-size:12px;color:var(--txt-dim);line-height:1.6;margin-top:4px}
.sgm-root #blockSynth button.synth{flex:none;font-size:12px;padding:7px 10px}
.sgm-root #blockSynth button:disabled{opacity:.35;cursor:not-allowed}
@media (max-width: 760px){
  .sgm-root #topbar{padding:10px 14px 10px 56px;flex-wrap:wrap;row-gap:2px;gap:10px}
  .sgm-root #topbar .title{font-size:13px}
  .sgm-root #topbar .stat{font-size:11px}
  .sgm-root #stage{flex-direction:column;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .sgm-root #boardWrap{margin-right:0 !important;height:28vh;min-height:180px;flex:none;order:1;overflow:hidden;transition:height .35s ease}
  .sgm-root #stage.board-expanded #boardWrap{height:56vh}
  .sgm-root #boardWrap::before{width:92%}
  .sgm-root #boardSizeBtn{display:flex;position:absolute;top:8px;right:8px;z-index:4;width:44px;height:44px;padding:0;align-items:center;justify-content:center;
    font-size:18px;line-height:1;border-radius:12px;background:rgba(8,5,18,.72);border:1px solid var(--panel-line);color:var(--gold)}
  .sgm-root #side{position:relative;top:auto;right:auto;bottom:auto;width:100%;height:auto;max-height:none;overflow:visible;
    border-left:none;border-top:1px solid var(--panel-line);order:2;transform:none !important}
  .sgm-root #stage.side-collapsed #side{display:none}
  .sgm-root #sideToggle{top:auto;bottom:12px;right:12px}
  .sgm-root #stage.side-collapsed #sideToggle{right:12px}
  .sgm-root #sideTabs{display:flex;position:sticky;top:0;z-index:6;gap:4px;padding:6px 8px;
    background:linear-gradient(180deg,rgba(8,5,18,.97),rgba(8,5,18,.9));border-bottom:1px solid var(--panel-line);backdrop-filter:blur(6px)}
  .sgm-root #sideTabs button{flex:1;min-height:44px;padding:4px 2px;font-size:11px;font-family:'Cinzel',serif;letter-spacing:.02em;border-radius:10px}
  .sgm-root #sideTabs button.on{background:linear-gradient(135deg,rgba(201,168,76,.22),rgba(255,215,80,.08));border-color:var(--gold-bright);color:#fff8d6;
    box-shadow:0 0 14px rgba(201,168,76,.22),inset 0 0 0 1px rgba(255,215,80,.28)}
  .sgm-root #side .block{display:none}
  .sgm-root #side .block.tab-on{display:block}
  .sgm-root #hand{height:44px;order:3;padding:0;gap:0}
  .sgm-root #hand .handlabel{display:none}
  .sgm-root #handToggle{display:flex;flex:1;align-items:center;justify-content:center;gap:8px;height:100%;min-height:44px;min-width:44px;
    border:none;border-radius:0;background:transparent;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.14em;color:var(--gold);text-transform:uppercase}
  .sgm-root #hand:not(.expanded) #cards{display:none !important} /* #cards несёт inline display:flex */
  .sgm-root #hand.expanded{height:150px;padding:8px 10px;gap:10px}
  .sgm-root #hand.expanded #handToggle{flex:none;width:44px;font-size:16px;letter-spacing:0}
  .sgm-root .toast{bottom:64px}
  .sgm-root .toast.show{bottom:84px}
  .sgm-root .card{width:92px;height:130px}
  .sgm-root .mbox{padding:22px;max-width:88vw}
  .sgm-root #blockSynth button.synth{min-height:44px}
}
`;

const BOARD_HTML = `
<div id="cardBg"></div>
<div class="sgm-om">ॐ</div>
<div id="app">
  <div id="topbar">
    <div>
      <div class="title">Игра Мироздания</div>
      <div class="sub">живая мандала Тигля · Супер-Игра</div>
    </div>
    <div class="spacer"></div>
    <div class="stat">Стихия: <b id="stEl">Огонь</b></div>
    <div class="stat">Чакра: <b id="stChakra">—</b></div>
    <div class="stat">Уровень: <b id="stDim">0</b>/12</div>
    <div class="stat">Свет: <b id="stLight">0%</b></div>
  </div>

  <div id="stage">
    <button id="sideToggle" title="Свернуть / развернуть панель">&gt;</button>
    <div id="boardWrap">
      <div id="boardTilt"><canvas id="board"></canvas></div>
      <canvas id="board3d" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:none;z-index:2"></canvas>
      <button id="boardSizeBtn" title="Развернуть поле">⛶</button>
    </div>

    <div id="side">
      <div id="sideTabs">
        <button data-tab="path" class="on">Путь</button>
        <button data-tab="gate">Вход</button>
        <button data-tab="lens">Линза</button>
        <button data-tab="dim">Поле</button>
        <button data-tab="mp">Игроки</button>
        <button data-tab="spirit" id="tabSpirit" disabled>Дух</button>
        <button data-tab="synth">Синтез</button>
      </div>
      <div class="block cellinfo tab-on" id="blockCell">
        <h3>Ячейка пути</h3>
        <div class="big" id="ciName">Порог — вход</div>
        <div class="meta" id="ciMeta">Выбери сторону света и брось кости.</div>
        <div class="quest" id="ciQuest">Дорога возникает под ногами идущего.</div>
        <div class="quest" id="cellQuest" style="display:none"></div>
        <div class="quest" id="raMessage" style="display:none"></div>
      </div>

      <div class="block tab-on" id="blockMove">
        <h3>Движение</h3>
        <div class="row" style="justify-content:space-between">
          <div class="dice" id="diceFace">·</div>
          <button class="primary" id="rollBtn" style="flex:1">Бросить кости</button>
        </div>
        <div class="hint" id="moveHint">Движешься от периферии к Центру Ра через 12 колец: 3 ч/б кольца Даймона (−3…0) → Душа (1–3) → Джива + Искра (4–6) → Дух (7–9).</div>
      </div>

      <div class="block" id="blockGate">
        <h3>Вход — время и сторона</h3>
        <div class="toggle" id="gateToggle" style="flex-wrap:wrap">
          <button data-gate="N" style="flex:1 1 44%">Север · 22–4</button>
          <button data-gate="S" style="flex:1 1 44%">Юг · 4–10</button>
          <button data-gate="W" style="flex:1 1 44%">Запад · 10–16</button>
          <button data-gate="E" class="on" style="flex:1 1 44%">Восток · 16–22</button>
        </div>
        <div class="row" style="margin-top:8px">
          <button id="timeBtn" class="primary" style="flex:1">Войти по времени · <span id="clock">--:--</span></button>
        </div>
        <div class="hint" id="windowHint">Сутки — спираль: 22–4 Север · 4–10 Юг · 10–16 Запад · 16–22 Восток.</div>
        <label class="lbl" style="margin-top:10px">Круг времени</label>
        <div class="toggle" id="secToggle">
          <button data-sec="24" class="on">24 часа</button>
          <button data-sec="12">12 сефирот / поясов</button>
        </div>
      </div>

      <div class="block" id="blockLens">
        <h3>Линза (культура / матрица)</h3>
        <select id="lensSel"></select>
        <div class="lensbar" id="lensInfo" style="margin-top:8px"></div>
      </div>

      <div class="block" id="blockDim">
        <h3>Мерность поля</h3>
        <div class="toggle" id="dimToggle">
          <button data-dim="1">1D</button>
          <button data-dim="2" class="on">2D</button>
          <button data-dim="3">3D</button>
        </div>
        <label class="lbl" style="margin-top:12px">Свет игрока — оживляет мир (ч/б → цвет)</label>
        <input type="range" id="lightRange" min="0" max="100" value="14" />
      </div>

      <div class="block" id="blockSpirit">
        <h3>Дух</h3>
        <div id="spiritPersona">Дух откроется на ярусе Дух (кольца 9–11), с глобального кольца 7 или после постройки «Канала Духа».</div>
        <textarea id="spiritQ" placeholder="Вопрос Духу об игре — или момент, который осветить…" disabled></textarea>
        <div class="row" style="margin-top:8px">
          <button id="spiritAskBtn" class="primary" style="flex:1" disabled>Спросить Духа</button>
          <button id="spiritIllumBtn" style="flex:1" disabled>Осветить момент</button>
        </div>
        <div id="spiritAnswer"></div>
        <div class="hint" id="spiritHint">Дух открывается любым из трёх путей: фишка на ярусе Дух этой доски · глобальное кольцо ≥ 7 по накопленному Свету · построенная структура «Канал Духа».</div>
      </div>

      <div class="block" id="blockSynth">
        <h3>Синтез · после Центра Ра</h3>
        <div class="lensbar" id="synthTier"></div>
        <div id="synthBody"></div>
        <div class="quest" id="synthStory" style="display:none"></div>
        <div class="hint">Каждый путь до Центра Ра рождает Духа линзы. Дальше рост — не в кольцах, а в синтезе: Собор Духов → Творец → Создатель → Свет Созидания. Двигает не число путей, а качество прохождения — Чувствительность игрока (растёт от глубоких искренних ответов Духу), накопленный Свет и Сила Духа.</div>
      </div>

      <div class="block" id="blockStruct">
        <h3>Световые структуры</h3>
        <div class="lensbar" id="structHead"></div>
        <div id="structBody"></div>
        <div class="hint">Структуры строятся из накопленного Света всей игры (не света этой доски). Доступность зависит от глобального кольца (Меры) по порогам накопленного Света — не от позиции фишки. Структуры = сердце, связь с Духом, Богом, Вечностью.</div>
      </div>

      <div class="block" id="blockMp">
        <h3>Мультиплеер</h3>
        <div class="row">
          <button id="summonBtn" style="flex:1">Призвать игрока</button>
          <button id="chatBtn" style="flex:1">Чат</button>
        </div>
        <div class="hint">Одиночная или общая игра · общие квесты.</div>
      </div>
    </div>
  </div>

  <div id="hand">
    <button id="handToggle">Колода игрока ▴</button>
    <div class="handlabel">Колода игрока</div>
    <div id="cards" style="display:flex;gap:12px"></div>
  </div>
</div>

<div class="toast" id="toast"></div>
<div id="modal"><div class="mbox">
  <h2 id="mTitle">Центр Ра</h2>
  <p id="mBody"></p>
  <div style="margin-top:18px;display:flex;gap:10px">
    <button class="primary big" id="mDive">Занырнуть → супер-генерация</button>
    <button class="big" id="mClose" style="flex:none;width:auto">Позже</button>
  </div>
</div></div>
`;

let _styleInjected = false;
function ensureBoardStyle() {
  if (_styleInjected || (typeof document !== 'undefined' && document.getElementById('sgm-style'))) { _styleInjected = true; return; }
  const st = document.createElement('style');
  st.id = 'sgm-style';
  st.textContent = BOARD_CSS;
  document.head.appendChild(st);
  _styleInjected = true;
}

/**
 * Смонтировать доску в контейнер.
 * @param {HTMLElement} container
 * @param {object} [opts]
 * @param {string} [opts.matrixSlug]  — slug матрицы (может быть null).
 * @param {string} [opts.lensNameRu]  — русское имя линзы-картриджа.
 * @returns {{ destroy: function }}
 */
export function mountSuperGame(container, opts) {
  const o = opts || {};
  ensureBoardStyle();
  container.classList.add('sgm-root');
  container.innerHTML = BOARD_HTML;

  const $ = function (id) { return container.querySelector('#' + id); };

  // ── персистенция инстанса ──
  const persistKey = boardKey(o);
  function readRec() {
    try { const sg = ensureSuperGame(getState()); return sg.boards[persistKey] || null; } catch (e) { return null; }
  }
  function writeRec(patch) {
    try {
      const state = getState();
      const sg = ensureSuperGame(state);
      const rec = sg.boards[persistKey] || { matrixSlug: o.matrixSlug || null, lensNameRu: o.lensNameRu || null, createdAt: Date.now(), depth: 0 };
      for (const k in patch) { if (Object.prototype.hasOwnProperty.call(patch, k)) rec[k] = patch[k]; }
      rec.updatedAt = Date.now();
      sg.boards[persistKey] = rec;
      saveState(state);
    } catch (e) { /* persistence is advisory */ }
  }

  // ═══ Состояние игры — те же переменные, что в оригинале ═══
  let SECTORS = 24;
  let lensIdx = 0;
  let gate = 'E';
  const player = { t: gateSector('E', SECTORS), element: 'Огонь', light: 0.14 };
  const npc = { active: false, t: 0 };
  let dimMode = 2;
  let lastRoll = 0;
  let bonusNext = 0;
  let zoom = 1;
  let rotX = 0, rotY = 0;
  let depth = 0; // счётчик «заныриваний» (интеграция: глубина для весов карт)
  let destroyed = false;

  function GOAL_T() { return (RING_N - 1) * SECTORS; }
  function pos(t) { return posOf(t, SECTORS); }
  function gs(g) { return gateSector(g, SECTORS); }

  // Рабочий список линз: оригинальные 7; если запущенная матрица не среди них —
  // добавляем её линзу в начало (интеграция «матрица-карта → доска»).
  const lensList = LENSES.slice();
  (function () {
    if (!o.lensNameRu && !o.matrixSlug) return;
    const bySlug = Object.keys(LENS_ID_TO_MATRIX_SLUG).find(function (id) { return LENS_ID_TO_MATRIX_SLUG[id] === o.matrixSlug; });
    if (bySlug) { lensIdx = lensList.findIndex(function (l) { return l.id === bySlug; }); if (lensIdx < 0) lensIdx = 0; return; }
    lensList.unshift({ id: o.matrixSlug || ('lens:' + o.lensNameRu), name: o.lensNameRu || o.matrixSlug, tint: '#c9a84c', bonus: 'Матрица-карта игрока · Сияющая линза.' });
    lensIdx = 0;
  })();

  /* купол: проекция полярной точки на полусферу — дословно из оригинала */
  let DOME_T = 0, DOME_H = 0;
  function proj(r, a) {
    const sinT = Math.sin(DOME_T), cosT = Math.cos(DOME_T);
    const nr = MAXR > 0 ? r / MAXR : 0;
    const z = DOME_H * (1 - nr * nr);
    return [CX + Math.cos(a) * r, CY + Math.sin(a) * r * cosT - z * sinT];
  }

  const cv = $('board');
  const ctx = cv.getContext('2d');
  let CX = 0, CY = 0, MAXR = 0, DPR = 1;
  function resize() {
    const wrap = $('boardWrap');
    // На мобильной раскладке поле компактное (28vh) — нижний предел меньше,
    // иначе канвас 320px вылезал бы из свернутого boardWrap.
    const s = Math.max(isMobileLayout() ? 160 : 320, Math.min(wrap.clientWidth || window.innerWidth, (wrap.clientHeight || window.innerHeight)) - 24);
    DPR = window.devicePixelRatio || 1;
    cv.width = s * DPR; cv.height = s * DPR; cv.style.width = s + 'px'; cv.style.height = s + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = s / 2; CY = s / 2; MAXR = s * 0.42;
  }

  // Общая формула ringPaintRgb (модульная): кольца Даймона — чистый ч/б,
  // остальные — прежний mix GRAY→цвет по свету (0.15+0.85·L) + tint линзы 0.12.
  function ringColor(i) {
    return ringPaintRgb(i, player.light, hexToRgb(lensList[lensIdx].tint), 0.15, 0.12);
  }

  let spin = 0, raf = 0;
  function draw() {
    if (destroyed) return;
    spin += 0.0016;
    if (dimMode === 3) {
      DOME_T = (40 + player.light * 26) * Math.PI / 180;
      DOME_H = MAXR * (0.30 + player.light * 0.75);
    } else { DOME_T = 0; DOME_H = 0; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, MAXR * 1.1);
    const coreA = 0.25 + 0.5 * player.light;
    g.addColorStop(0, rgbStr([255, 238, 170], coreA));
    g.addColorStop(0.5, rgbStr([60, 50, 20], 0.10));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, MAXR * 1.1, 0, 7); ctx.fill();

    for (let i = 0; i < RING_N; i++) {
      const rO = MAXR * (1 - i / RING_N);
      const rI = MAXR * (1 - (i + 1) / RING_N);
      const c = ringColor(i);
      const sinT = Math.sin(DOME_T), cosT = Math.cos(DOME_T);
      const zO = DOME_H * (1 - (rO / MAXR) * (rO / MAXR));
      const zI = DOME_H * (1 - (rI / MAXR) * (rI / MAXR));
      ctx.beginPath();
      ctx.ellipse(CX, CY - zO * sinT, rO, Math.max(0.3, rO * cosT), 0, 0, Math.PI * 2, false);
      ctx.ellipse(CX, CY - zI * sinT, rI, Math.max(0.3, rI * cosT), 0, 0, Math.PI * 2, true);
      ctx.fillStyle = rgbStr(c, 0.55 + 0.30 * player.light);
      ctx.fill('evenodd');
      ctx.lineWidth = 1.5; ctx.strokeStyle = rgbStr(c, 0.9);
      ctx.beginPath(); ctx.ellipse(CX, CY - zO * sinT, rO, Math.max(0.3, rO * cosT), 0, 0, Math.PI * 2); ctx.stroke();
    }
    for (let s = 0; s < SECTORS; s++) {
      const a = s / SECTORS * Math.PI * 2 - Math.PI / 2;
      const p0 = proj(0, a), p1 = proj(MAXR, a);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (let s = 0; s < SECTORS; s++) {
      const h = Math.round(s / SECTORS * 24) % 24;
      const day = h >= 6 && h < 18;
      const a0 = s / SECTORS * Math.PI * 2 - Math.PI / 2;
      const a1 = (s + 1) / SECTORS * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      for (let k = 0; k <= 5; k++) { const aa = a0 + (a1 - a0) * k / 5; const p = proj(MAXR * 1.03, aa); if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
      ctx.strokeStyle = day ? 'rgba(246,201,72,0.5)' : 'rgba(70,90,180,0.5)';
      ctx.lineWidth = 5; ctx.stroke();
    }

    for (const gn of ['N', 'S', 'W', 'E']) {
      const gsec = gs(gn);
      const a = gsec / SECTORS * Math.PI * 2 - Math.PI / 2;
      const on = (gn === gate);
      const gp = proj(MAXR + 16, a), x = gp[0], y = gp[1];
      ctx.fillStyle = on ? '#f6c948' : 'rgba(201,168,76,0.45)';
      ctx.beginPath(); ctx.arc(x, y, on ? 8 : 5, 0, 7); ctx.fill();
      ctx.fillStyle = on ? '#fff7df' : 'rgba(220,210,180,0.7)';
      ctx.font = (on ? 'bold ' : '') + "12px 'Cinzel',serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lp = proj(MAXR + 34, a), lx = lp[0], ly = lp[1];
      ctx.fillText(GATE_NAME[gn], lx, ly);
    }

    highlightCell(player.t, '#f6c948');
    if (npc.active) highlightCell(npc.t, '#34c6d8');

    const rc = MAXR / RING_N * 0.9;
    const cpt = proj(0, 0);
    const cg = ctx.createRadialGradient(cpt[0], cpt[1], 0, cpt[0], cpt[1], rc);
    cg.addColorStop(0, '#fff7df'); cg.addColorStop(0.6, rgbStr([246, 201, 72], 0.9)); cg.addColorStop(1, 'rgba(246,201,72,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cpt[0], cpt[1], rc * (1 + 0.06 * Math.sin(spin * 6)), 0, 7); ctx.fill();

    /* ОБЪЁМ в 3D: блик-полусфера, растёт со светом — как в оригинале */
    if (dimMode === 3 && player.light > 0.01) {
      const L = player.light, sinT = Math.sin(DOME_T);
      const topY = CY - DOME_H * sinT;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const hx = CX - MAXR * 0.30, hy = topY + MAXR * 0.12;
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, MAXR * 0.95);
      hg.addColorStop(0, rgbStr([255, 248, 214], 0.45 * L));
      hg.addColorStop(0.3, rgbStr([255, 236, 176], 0.15 * L));
      hg.addColorStop(1, 'rgba(255,248,214,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, MAXR * 0.95, 0, 7); ctx.fill();
      ctx.restore();
    }

    drawToken(player.t, '#fff', '#f6c948');
    if (npc.active) drawToken(npc.t, '#cfe9ff', '#34c6d8');

    raf = requestAnimationFrame(draw);
  }
  function cellXY(t) {
    const p = pos(t);
    const rMid = MAXR * (1 - (p.ring + 0.5) / RING_N);
    const a = p.sector / SECTORS * Math.PI * 2 - Math.PI / 2;
    const pr = proj(rMid, a);
    return { x: pr[0], y: pr[1], a, rMid };
  }
  function highlightCell(t, col) {
    const p = pos(t);
    const rO = MAXR * (1 - p.ring / RING_N), rI = MAXR * (1 - (p.ring + 1) / RING_N);
    const a0 = p.sector / SECTORS * Math.PI * 2 - Math.PI / 2;
    const a1 = (p.sector + 1) / SECTORS * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) { const aa = a0 + (a1 - a0) * k / 6; const pp = proj(rO, aa); if (k === 0) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]); }
    for (let k = 6; k >= 0; k--) { const aa = a0 + (a1 - a0) * k / 6; const pp = proj(rI, aa); ctx.lineTo(pp[0], pp[1]); }
    ctx.closePath();
    ctx.fillStyle = rgbStr(hexToRgb(col), 0.28);
    ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  }
  function drawToken(t, fill, ring) {
    const c = cellXY(t);
    ctx.save();
    ctx.shadowColor = ring; ctx.shadowBlur = 18;
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = ring; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }

  function nakshatraHour(sector) { return Math.round(sector / SECTORS * 24) % 24; }
  function monthName(sector) { const M = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы']; return M[sector % 12]; }
  function updateCellInfo() {
    const p = pos(Math.min(player.t, GOAL_T()));
    const ring = RINGS[Math.min(p.ring, RING_N - 1)];
    const hour = nakshatraHour(p.sector);
    const isDay = hour >= 6 && hour < 18;
    const lvl = Math.min(RING_N - 1, p.ring);
    const meraStr = ring.tier === TIER_DAIMON ? ('Домера ' + ring.mera) : ('Мера ' + ring.mera + '/9');
    $('ciName').textContent = ring.chakra;
    $('ciMeta').innerHTML =
      'Ярус: ' + ring.tier + ' · Кольцо: ' + ring.name + ' · Уровень ' + lvl + '/' + (RING_N - 1) + ' · ' + meraStr + '<br>' +
      'Сектор ' + (p.sector + 1) + '/' + SECTORS + ' · ' + (isDay ? '☀ день' : '☾ ночь') + ' · ' + hour + ':00 · ' + monthName(p.sector);
    const lens = lensList[lensIdx];
    $('ciQuest').innerHTML =
      ring.task + "<br><span style='color:var(--gold)'>Через линзу «" + lens.name + '»:</span> ' + lens.bonus;
    $('stChakra').textContent = ring.chakra;
    $('stDim').textContent = lvl;
    $('stLight').textContent = Math.round(player.light * 100) + '%';
    $('stEl').textContent = player.element;
    updateSpiritPanel();
  }

  // ═══ ПАНЕЛЬ ДУХА (P9.2) — доступна только на ярусе Дух (isSpiritRing) ═══
  // Скиллы/персона — js/spiritPanel.js (реестр в духе «Голоса совести»);
  // здесь только UI-обвязка: доступность, запуск скилла, вывод ответа.
  function currentMatrixSlug() {
    return o.matrixSlug || LENS_ID_TO_MATRIX_SLUG[lensList[lensIdx].id] || null;
  }
  let spiritPersonaSlug = false; // false = ещё не резолвили (null — валидный slug)
  // Дух открыт по ЛЮБОМУ из трёх условий (сверка с engine_config.json, 2026-07-09):
  //   1) фишка стоит на ярусе Дух ЭТОЙ доски (локальный слой, как раньше);
  //   2) глобальное кольцо по накопленному Свету ≥ 7
  //      (light_flow.supergame_board_thresholds → getCurrentRing);
  //   3) построена световая структура «Канал Духа» (light_structures.
  //      spirit_channel: «Открывает механику 'Призыв Духа'»).
  function spiritUnlocked(ring) {
    if (isSpiritRing(ring)) return true;
    try {
      const st = getState();
      return getCurrentRing(st.totalLight) >= 7 || hasStructure(st, 'spirit_channel');
    } catch (e) { return false; }
  }
  function updateSpiritPanel() {
    const ring = pos(Math.min(player.t, GOAL_T())).ring;
    const on = spiritUnlocked(ring);
    ['spiritQ', 'spiritAskBtn', 'spiritIllumBtn', 'tabSpirit'].forEach(function (id) {
      const el = $(id); if (el) el.disabled = !on;
    });
    const personaEl = $('spiritPersona');
    if (!personaEl) return;
    if (!on) {
      personaEl.textContent = 'Дух откроется на ярусе Дух (кольца 9–11), с глобального кольца 7 или после постройки «Канала Духа».';
      spiritPersonaSlug = false;
      // если на мобильной раскладке открыта вкладка Духа — вернуться на Путь
      const tabBtn = $('tabSpirit');
      if (tabBtn && tabBtn.classList.contains('on')) setTab('path');
      return;
    }
    const slug = currentMatrixSlug();
    if (spiritPersonaSlug === slug) return; // уже показана эта персона
    spiritPersonaSlug = slug;
    personaEl.textContent = 'Дух проявляется…';
    resolveSpiritPersona(slug).then(function (p) {
      if (destroyed || spiritPersonaSlug !== slug) return;
      personaEl.innerHTML = 'Говорит: <b>' + (p.symbol ? p.symbol + ' ' : '') + p.culturalName + '</b>' +
        (p.matrixName ? ' · линза «' + p.matrixName + '»' : '') +
        ' · агент «' + p.agent.name + '» (один во всех 33 линзах)';
    }).catch(function () {
      if (destroyed || spiritPersonaSlug !== slug) return;
      personaEl.textContent = 'Дух здесь — но канон недоступен (data/*.json).';
    });
  }
  let spiritSeq = 0;
  function runSpiritSkill(skillId) {
    const ring = pos(Math.min(player.t, GOAL_T())).ring;
    if (!spiritUnlocked(ring)) { toast('Дух доступен на ярусе Дух, с глобального кольца 7 или после «Канала Духа»'); return; }
    const q = ($('spiritQ') && $('spiritQ').value || '').trim();
    if (skillId === 'ask' && !q) { toast('Сначала напиши вопрос Духу'); return; }
    const R = RINGS[Math.min(ring, RING_N - 1)];
    const ctx = {
      question: q,
      cell: { ringName: R.name, tier: R.tier, mera: R.mera, task: R.task },
      awareness: player.light,
      lensNameRu: lensList[lensIdx].name
    };
    // Сверка-2 (sensitivity): текст игрока к Духу — сигнал качества.
    // ⚠ V1-упрощение: живой ИИ-оценки quality_score в v258-экосистеме нет,
    // качество считает локальная эвристика (js/sensitivity.js); рост только
    // при quality > 0.7 (спека). Логика Панели Духа (P9.2) не тронута —
    // это слой поверх, в UI-обвязке.
    // Сверка-4 (ra_radiance): «Даймон в моменты глубокого пробуждения говорит
    // от имени Ра». Глубокое пробуждение (judgment call) = чувствительность
    // «Чистая» (100+, «Прямое восприятие Ра», js/sensitivity.js) И искренний
    // текст игрока (quality > 0.7, тот же гейт, что у роста sensitivity).
    // Чисто текстовая надстройка над ответом — генерация P9.2 не тронута.
    let raVoice = false;
    if (q) {
      try {
        const st = getState();
        const quality = estimateTextQuality(q);
        const sig = recordQualitySignal(st, quality);
        if (sig.grown) {
          saveState(st);
          renderSynth();
          toast('✧ Чувствительность +' + sig.delta + (sig.levelUp ? ' · уровень: ' + sig.level.name_ru : ''));
        }
        raVoice = quality > SENSITIVITY_QUALITY_GATE && getSensitivity(st).level.level >= 4;
      } catch (e) { /* advisory, панель Духа не роняем */ }
    }
    const seq = ++spiritSeq;
    const out = $('spiritAnswer');
    out.style.display = 'block';
    out.textContent = skillId === 'illuminate' ? 'Свет Осознанности направляется…' : 'Дух вслушивается…';
    askSpirit(skillId, currentMatrixSlug(), ctx).then(function (res) {
      if (destroyed || seq !== spiritSeq) return;
      out.textContent = (raVoice ? RA_VOICE_INTRO + '\n\n' : '') + res.text +
        (res.source === 'local' ? '\n\n(локальный отклик — живой ИИ недоступен)' : '');
    }).catch(function (e) {
      if (destroyed || seq !== spiritSeq) return;
      out.textContent = 'Дух молчит: ' + String(e && e.message || e);
    });
  }
  function applyTilt() {
    const tilt = $('boardTilt');
    let deg = 0, sc = 1;
    if (dimMode === 1) { deg = 78; sc = 0.9; }
    else if (dimMode === 2) { deg = 0; sc = 1; }
    else { deg = 0; sc = 1; }
    tilt.style.transform = 'rotateX(' + (deg + rotX).toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale(' + (sc * zoom).toFixed(3) + ')';
    const sat = 0.2 + player.light * 1.0;
    const br = 1.05 + player.light * 0.35;
    let filt = 'saturate(' + sat.toFixed(2) + ') brightness(' + br.toFixed(2) + ')';
    if (dimMode === 3) { filt += ' drop-shadow(0 ' + (player.light * 26).toFixed(0) + 'px ' + (player.light * 30 + 10).toFixed(0) + 'px rgba(0,0,0,.5))'; }
    cv.style.filter = filt;
  }

  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600); }

  // ── ИНТЕГРАЦИЯ: квест текущей ячейки (quest-engine) ──
  let questSeq = 0;
  function refreshCellQuest() {
    const el = $('cellQuest'); if (!el) return;
    const seq = ++questSeq;
    const ring = pos(Math.min(player.t, GOAL_T())).ring;
    el.style.display = 'block';
    el.innerHTML = "<span style='color:var(--txt-dim)'>Квест ячейки проявляется…</span>";
    generateCellQuest(o.matrixSlug || LENS_ID_TO_MATRIX_SLUG[lensList[lensIdx].id] || null, ring)
      .then(function (q) {
        if (destroyed || seq !== questSeq) return;
        el.innerHTML = "<span style='color:var(--gold)'>Квест: " + (q.title ? q.title.ru : '') + '</span><br>' +
          (q.task ? q.task.ru : '') +
          "<br><span style='color:var(--txt-dim);font-size:12px'>Награда: " + q.rewards.dustAmount + ' пыли · ' + q.rewards.shanti + ' шанти · ' + q.rewards.shakti + ' шакти' +
          (q.fallback ? ' · (упрощённый)' : '') + '</span>';
      })
      .catch(function () { if (!destroyed && seq === questSeq) el.style.display = 'none'; });
  }

  // ── ПОСЛАНИЯ РА (сверка-4, ra_radiance: «На высоких Ring (7+) — 'послания
  // Ра' после квестов») ──
  // Явного события «квест выполнен» на борде нет (квест ячейки display-only,
  // см. HANDOFF/сверка-2) — ближайший момент закрытия квеста кольца: бросок
  // костей, уводящий фишку с ячейки (там же начисляется свет +0.015).
  // Judgment call: ярус считаем ЛОКАЛЬНО по фишке (кольца 9–11 борда = Меры
  // 7–9, isSpiritRing) — Ра «не метрика, а фон», послание привязано к месту
  // пути, не к накопленному свету. Ротация банка — детерминированный счётчик.
  let raMsgIdx = 0;
  function maybeShowRaMessage(completedRing) {
    const el = $('raMessage'); if (!el) return;
    if (!isSpiritRing(completedRing)) { el.style.display = 'none'; return; }
    const msg = RA_MESSAGES[raMsgIdx % RA_MESSAGES.length];
    raMsgIdx++;
    el.style.display = 'block';
    el.innerHTML = "<span style='color:var(--gold-bright)'>☀ Послание Ра</span><br>" + msg;
  }

  function roll() {
    // Сверка-4: кольцо, чей квест закрывается этим броском (фишка уходит с ячейки).
    const completedRing = pos(Math.min(player.t, GOAL_T())).ring;
    const d = 1 + Math.floor(Math.random() * 6) + bonusNext;
    bonusNext = 0;
    lastRoll = d;
    $('diceFace').textContent = d;
    player.t = Math.min(player.t + d, GOAL_T());
    maybeShowRaMessage(completedRing);
    setLight(player.light + 0.015);
    if (npc.active) npc.t = Math.min(npc.t + 1 + Math.floor(Math.random() * 6), GOAL_T());
    updateCellInfo();
    persistNow();
    if (player.t >= GOAL_T()) { openCenter(); }
    else { toast('Ход ' + d + ' → ' + RINGS[Math.min(pos(player.t).ring, RING_N - 1)].chakra); refreshCellQuest(); }
  }
  function setLight(v) { player.light = Math.max(0, Math.min(1, v)); $('lightRange').value = Math.round(player.light * 100); applyTilt(); updateCellInfo(); }

  function setGate(g) { gate = g; player.t = gs(g); container.querySelectorAll('#gateToggle button').forEach(function (b) { b.classList.toggle('on', b.dataset.gate === g); }); updateCellInfo(); persistNow(); toast('Вход: ' + GATE_NAME[g] + ' · ' + GATE_TIME[g][0] + '–' + GATE_TIME[g][1] + ' ч'); }
  function enterByTime() { const now = new Date(); const h = now.getHours(); const g = timeToGate(h); gate = g; player.t = sectorOfHour(h, SECTORS); container.querySelectorAll('#gateToggle button').forEach(function (b) { b.classList.toggle('on', b.dataset.gate === g); }); updateCellInfo(); persistNow(); toast('Вход по времени ' + two(h) + ':' + two(now.getMinutes()) + ' → ' + GATE_NAME[g]); }
  function setSectors(n) { SECTORS = n; player.t = gs(gate); if (npc.active) npc.t = gs('W'); container.querySelectorAll('#secToggle button').forEach(function (b) { b.classList.toggle('on', parseInt(b.dataset.sec, 10) === n); }); updateCellInfo(); persistNow(); toast(n === 12 ? '12 сефирот / часовых поясов' : '24 часа'); }
  function tickClock() { const now = new Date(); const h = now.getHours(), m = now.getMinutes(); const c = $('clock'); if (c) c.textContent = two(h) + ':' + two(m); const g = timeToGate(h); const wh = $('windowHint'); if (wh) wh.innerHTML = 'Сейчас ' + two(h) + ':' + two(m) + " → окно <b style='color:var(--gold)'>" + GATE_NAME[g] + '</b> (' + (h >= 6 && h < 18 ? '☀ день' : '☾ ночь') + '). Спираль суток: 22–4 С · 4–10 Ю · 10–16 З · 16–22 В.'; }

  function openCenter() {
    $('mDive').style.display = ''; // мог быть скрыт модалом Света Созидания
    $('mTitle').textContent = 'Центр Ра достигнут';
    $('mBody').textContent = 'Ты прошёл все 12 колец — от ч/б колец Даймона (−3…0) через Душу, Дживу с Искрой и Дух — к Центру Ра. Это точка выхода: начало, смерть и жизнь. Занырни — супер-генерация: новая карта и рестарт из другой линзы / часового пояса.';
    $('modal').classList.add('show');
  }

  // dive() — оригинальная супер-генерация + слои интеграций:
  // редкость выигранной карты по cauldron_rules.json, запись в state.superGame.cards,
  // прогресс Храма (bindMatrix + collectPassiveSvet), глубина++.
  function dive() {
    // P9.3: завершённый путь рождает Духа линзы — фиксируем ДО буста света
    // (+0.2) и смены линзы, чтобы снимок отражал само прохождение.
    try {
      const doneLens = lensList[lensIdx];
      const sp = recordLensSpirit({
        lensId: doneLens.id, lensName: doneLens.name,
        matrixSlug: o.matrixSlug || LENS_ID_TO_MATRIX_SLUG[doneLens.id] || null,
        depth: depth + 1
      });
      showStory('✦ ' + META_NARRATIVE.spirit + ' Дух линзы «' + doneLens.name + '» · качество ' + Math.round(sp.quality * 100) + '%.');
      renderSynth();
    } catch (e) { /* мета-слой advisory, доску не роняет */ }
    setLight(player.light + 0.2);
    lensIdx = (lensIdx + 1) % lensList.length;
    $('lensSel').value = String(lensIdx);
    updateLensInfo();
    depth += 1;
    const finishDive = function (wonCard, rarity) {
      if (wonCard) { hand.unshift(wonCard); renderHand(); }
      player.t = gs(gate);
      $('modal').classList.remove('show');
      updateCellInfo();
      persistNow();
      refreshCellQuest();
      toast('Супер-генерация! Новая линза: ' + lensList[lensIdx].name + (wonCard ? ' · карта: ' + wonCard.name + (rarity ? ' [' + rarity + ']' : '') : ''));
    };
    if (allCards.length) {
      // Интеграция: редкость — по существующим весам cauldron_rules.json
      // (оригинал брал равномерно случайную карту; фолбэк остаётся равномерным).
      loadCauldronRules()
        .then(function (rules) {
          const rarity = pickRarity(rules.reward_rarity, 10 + depth * 5, depth);
          const ofRarity = allCards.filter(function (c) { return c.rarity === rarity; });
          const src = ofRarity.length ? ofRarity : allCards;
          const c = src[Math.floor(Math.random() * src.length)];
          recordWonCard(c, rarity);
          finishDive(c, rarity);
        })
        .catch(function () {
          const c = allCards[Math.floor(Math.random() * allCards.length)];
          recordWonCard(c, c.rarity);
          finishDive(c, null);
        });
    } else {
      finishDive(null, null);
    }
    // Интеграция: прогресс Храма при достижении центра (существующие функции
    // temple-module.js, их математику не трогаем; ошибки не роняют доску).
    const slug = o.matrixSlug || LENS_ID_TO_MATRIX_SLUG[lensList[lensIdx].id] || null;
    if (slug) {
      Promise.resolve()
        .then(function () { return bindMatrix(slug); })
        .then(function () { return collectPassiveSvet().catch(function () { return null; }); })
        .then(function () { if (!destroyed) toast('⛩ Храм отозвался на проход к Центру Ра'); })
        .catch(function () { /* Храм опционален */ });
    }
  }
  function recordWonCard(c, rarity) {
    try {
      const state = getState();
      const sg = ensureSuperGame(state);
      sg.cards.push({ name: c.name, type: c.type, rarity: rarity || c.rarity, element: c.element, matrixSlug: o.matrixSlug || null, lensNameRu: o.lensNameRu || null, depth: depth, ts: Date.now() });
      saveState(state);
    } catch (e) { }
  }

  // ═══ СИНТЕЗ (P9.3) — UI-обвязка мета-прогрессии ═══
  function fmtPow(x) { return (Math.round((x || 0) * 100) / 100).toFixed(2); }
  function showStory(txt) { const st = $('synthStory'); if (!st) return; st.style.display = 'block'; st.textContent = txt; }
  function renderSynth() {
    const tierEl = $('synthTier'), bodyEl = $('synthBody');
    if (!tierEl || !bodyEl) return;
    let p;
    try { p = getMetaProgress(); } catch (e) { bodyEl.textContent = 'Мета-слой недоступен.'; return; }
    tierEl.innerHTML = 'Достигнуто: <b>' + p.achievedName + '</b>' + (p.svet ? ' · Сатья-юга' : '') +
      '<br>Чувствительность: <b>' + p.sensitivity.value + '</b> · ' + p.sensitivity.level.name_ru +
      ' (ур. ' + p.sensitivity.level.level + '/4) — качество Духа ' + Math.round(sensitivityQuality(p.sensitivity.value) * 100) + '%';
    const R = SYNTH_RULES;
    const rows = [];
    rows.push('<div class="slist">Духи линз: <b>' + p.spirits.length + '</b> · свободных ' + p.freeSpirits + ' · сила ' + fmtPow(p.freeSpiritPower) + '</div>');
    const lastSp = p.spirits.slice(-5).reverse();
    if (lastSp.length) {
      rows.push('<div class="slist">' + lastSp.map(function (s) {
        return (s.inSobor ? '☽' : '✦') + ' ' + (s.lensName || s.lensId || '?') + ' · ' + Math.round(s.quality * 100) + '%';
      }).join('<br>') + (p.spirits.length > 5 ? '<br>… ещё ' + (p.spirits.length - 5) : '') + '</div>');
    }
    function row(key, label, have, plan, reqText) {
      const btn = plan
        ? '<button class="synth primary" data-synth="' + key + '">Синтез · ' + fmtPow(plan.power) + '</button>'
        : '<button class="synth" disabled>Синтез</button>';
      return '<div class="srow"><span>' + label + ' · <b>' + have + '</b></span>' + btn + '</div>' +
        (plan ? '' : '<div class="slist">' + reqText + '</div>');
    }
    rows.push(row('sobor', 'Собор Духов', p.sobors.length, p.plans.sobor,
      '2–7 свободных Духов, сила ≥ ' + R.sobor.power + ' (есть ' + p.freeSpirits + ' · ' + fmtPow(p.freeSpiritPower) + ')'));
    rows.push(row('tvorets', 'Творец', p.tvorets.length, p.plans.tvorets,
      '≥' + R.tvorets.min + ' свободных Соборов, сила ≥ ' + R.tvorets.power + ', до ' + R.tvorets.maxLenses + ' линз (есть ' + p.freeSobors + ' · ' + fmtPow(p.freeSoborPower) + ')'));
    rows.push(row('sozdatel', 'Создатель', p.sozdatels.length, p.plans.sozdatel,
      '≥' + R.sozdatel.min + ' свободных Творцов, сила ≥ ' + R.sozdatel.power + ' — берёт всех, насколько силы хватит (есть ' + p.freeTvorets + ' · ' + fmtPow(p.freeTvoretsPower) + ')'));
    if (p.svet) {
      rows.push('<div class="slist" style="color:var(--gold-bright)">☀ Свет Созидания призван (сила ' + fmtPow(p.svet.power) + ') — Сатья-юга. Милость нисходит отдельным каналом.</div>');
    } else {
      rows.push(row('svet', 'Свет Созидания', 0, p.plans.svet,
        '≥1 свободный Создатель + накопленный Свет ≥ ' + R.svet.satyaLight + ' — Завеса Сатья-юги (есть ' + p.freeSozdatels + ' · Свет ' + Math.round(p.totalLight) + ')'));
    }
    bodyEl.innerHTML = rows.join('');
  }
  function awardMetaCard(tierKey) {
    if (!allCards.length) return null;
    const floor = RARITY_ORDER[META_RARITY_FLOOR[tierKey]] || 0;
    const pool = allCards.filter(function (c) { return (RARITY_ORDER[c.rarity] || 0) >= floor; });
    const src = pool.length ? pool : allCards;
    const c = src[Math.floor(Math.random() * src.length)];
    recordWonCard(c, c.rarity);
    hand.unshift(c); renderHand();
    return c;
  }
  function openSvetModal(res) {
    $('mTitle').textContent = 'Свет Созидания · Сатья-юга';
    $('mBody').innerHTML = META_NARRATIVE.svet + '<br><br>Награда вершины: +' + res.lightAward + ' Света.';
    $('mDive').style.display = 'none'; // это не «занырнуть», openCenter вернёт кнопку
    $('modal').classList.add('show');
    // Милость — отдельный канал (док): сверх наработанного, по Сатья-юге (ray 1).
    loadMilostSatya().then(function (src) {
      if (destroyed || !src) return;
      const extra = Math.round(res.lightAward * ((src.multiplier || 1) - 1));
      if (extra > 0) {
        try { const st = getState(); st.totalLight = (st.totalLight || 0) + extra; saveState(st); } catch (e) { }
      }
      const mb = $('mBody');
      if (mb) mb.innerHTML += '<br><br>☀ Милость нисходит (не наработанный путь — отдельный канал): «' + src.macrocosm_message + '» · +' + extra + ' Света (множитель Сатья-юги ×' + src.multiplier + ').';
      renderSynth();
    });
  }
  function doSynthesis(tierKey) {
    const res = attemptSynthesis(tierKey);
    if (!res.ok) { toast(res.reason || 'Синтез ещё не созрел'); renderSynth(); return; }
    const ti = META_TIERS.findIndex(function (t) { return t.key === tierKey; });
    setLight(player.light + 0.05 * (ti + 1));
    bonusNext += (ti + 1);
    const card = awardMetaCard(tierKey);
    showStory(META_NARRATIVE[tierKey] + ' Награда: +' + res.lightAward + ' Света' +
      (card ? ' · карта «' + card.name + '» [' + card.rarity + ']' : '') + ' · +' + (ti + 1) + ' к броску.');
    if (tierKey === 'svet') openSvetModal(res);
    renderSynth();
    renderStructures(); // синтез изменил накопленный Свет → пороги структур
    persistNow();
    toast('✦ ' + res.tierName + ' · сила ' + fmtPow(res.unit.power) + ' · +' + res.lightAward + ' Света');
  }

  // ═══ СВЕТОВЫЕ СТРУКТУРЫ (engine_config.json → light_structures) ═══
  // Глобальная фича: условия/стоимости — js/lightStructures.js, здесь только
  // UI-обвязка (список, кнопки постройки). Блок living в панели рядом с
  // Синтезом — там игрок уже видит свой глобальный Свет.
  function renderStructures() {
    const head = $('structHead'), body = $('structBody');
    if (!head || !body) return;
    let st, list;
    try { st = getState(); list = getAvailableStructures(st); }
    catch (e) { body.textContent = 'Структуры недоступны.'; return; }
    const ringG = getCurrentRing(st.totalLight);
    head.innerHTML = 'Накопленный Свет: <b>' + Math.round(st.totalLight || 0) + '</b> · глобальное кольцо: <b>' + ringG + '</b>' +
      (ringG >= 1 ? ' (Мера ' + ringG + ')' : ' (домеры Даймона)');
    body.innerHTML = list.map(function (s) {
      const stt = s.status;
      const btn = stt.built
        ? "<span style='color:var(--gold-bright)'>✓ построена</span>"
        : (stt.buildable
          ? '<button class="synth primary" data-build="' + s.id + '">Построить · ' + s.light_to_build + '</button>'
          : '<button class="synth" disabled>Построить · ' + s.light_to_build + '</button>');
      return '<div class="srow"><span>' + s.name_ru + ' · Мера ' + s.unlock_mera + '</span>' + btn + '</div>' +
        '<div class="slist">' + s.description + ' Эффект: ' + s.effect + '.' +
        (stt.built || stt.buildable ? '' : ' <span style="opacity:.75">(' + stt.reason + ')</span>') + '</div>';
    }).join('');
  }
  function doBuildStructure(id) {
    let res;
    try {
      const state = getState();
      res = buildStructure(state, id);
      if (res.ok) saveState(state);
    } catch (e) { res = { ok: false, reason: String(e && e.message || e) }; }
    if (!res.ok) { toast(res.reason || 'Структура ещё недоступна'); renderStructures(); return; }
    toast('☀ Построено: ' + res.structure.name_ru + ' · −' + res.structure.light_to_build + ' Света');
    renderStructures();
    renderSynth();        // изменился накопленный Свет (порог Сатья-юги)
    updateSpiritPanel();  // «Канал Духа» открывает Призыв Духа (гейт панели)
  }

  // ═══ Колода игрока — порт ═══
  let allCards = [];
  let hand = [];
  function renderHand() {
    const box = $('cards');
    box.innerHTML = '';
    hand.slice(0, 240).forEach(function (c, idx) {
      const el = document.createElement('div');
      el.className = 'card rare-' + c.rarity;
      const art = cardArtUrl(c);
      const cc = ({ mythic: '#ff7a3c', legendary: '#f6c948', epic: '#9b4ff3', rare: '#3b6fe2', uncommon: '#46c46a', common: '#8b93a7' })[c.rarity] || '#8b93a7';
      const grad = 'radial-gradient(120% 100% at 50% 20%,' + cc + '66,#0a0c16)';
      const bg = art ? ("url('" + art + "'), " + grad) : grad;
      const artHtml = '<div class="art" style="background-image:' + bg + ';background-size:cover;background-position:center"></div>';
      el.innerHTML = artHtml +
        '<div class="veil"></div>' +
        '<div class="tlabel">' + c.type + '</div>' +
        '<div class="nm">' + c.name + '</div>' +
        '<div class="el">' + c.element + '</div>';
      el.title = c.hint;
      el.addEventListener('click', function () { setCardBackground(c, el); openCard(c, idx); });
      box.appendChild(el);
    });
  }
  function setCardBackground(c, el) {
    const bg = $('cardBg');
    if (!bg) return;
    const art = cardArtUrl(c);
    if (!art) { bg.classList.remove('show'); bg.style.backgroundImage = ''; return; }
    bg.style.backgroundImage = "url('" + art + "')";
    bg.classList.add('show');
    try {
      container.querySelectorAll('#cards .card.selected').forEach(function (x) { x.classList.remove('selected'); });
      if (el) el.classList.add('selected');
    } catch (e) { }
  }
  function ensureCardModal() {
    let ov = container.querySelector('#cardZoom');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'cardZoom';
    ov.style.cssText = 'position:absolute;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(4,6,16,0.82);backdrop-filter:blur(6px);cursor:zoom-out';
    ov.innerHTML = '<div id="cardZoomInner" style="position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:94vw;max-height:96vh;overflow:auto;cursor:auto">' +
      '<div id="cardZoomArt" style="height:min(64vh,520px);aspect-ratio:3/4;border-radius:14px;background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(0 18px 60px rgba(0,0,0,0.7))"></div>' +
      '<div style="text-align:center;color:#eef1fb;max-width:min(60vh,420px)">' +
      '<div id="cardZoomType" style="font-size:12px;letter-spacing:2px;opacity:0.7;text-transform:uppercase"></div>' +
      '<div id="cardZoomName" style="font-size:22px;font-weight:700;margin:4px 0"></div>' +
      '<div id="cardZoomEl" style="font-size:13px;opacity:0.85;margin-bottom:6px"></div>' +
      '<div id="cardZoomHint" style="font-size:14px;opacity:0.9;line-height:1.45"></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
      '<button id="cardZoomAct" style="padding:10px 18px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#f6c948,#f3892b);color:#1a1206;font-weight:700">Активировать</button>' +
      '<button id="cardZoomClose" style="padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.25);cursor:pointer;background:transparent;color:#eef1fb">Закрыть</button>' +
      '</div>' +
      '</div>';
    container.appendChild(ov);
    function closeZoom() { ov.style.display = 'none'; }
    ov.addEventListener('click', function (e) { if (e.target === ov) closeZoom(); });
    ov.querySelector('#cardZoomClose').addEventListener('click', closeZoom);
    return ov;
  }
  function openCard(c, idx) {
    const ov = ensureCardModal();
    const art = cardArtUrl(c);
    const cc = ({ mythic: '#ff7a3c', legendary: '#f6c948', epic: '#9b4ff3', rare: '#3b6fe2', uncommon: '#46c46a', common: '#8b93a7' })[c.rarity] || '#8b93a7';
    const grad = 'radial-gradient(120% 100% at 50% 20%,' + cc + '66,#0a0c16)';
    ov.querySelector('#cardZoomArt').style.backgroundImage = art ? ("url('" + art + "'), " + grad) : grad;
    ov.querySelector('#cardZoomType').textContent = c.type || '';
    ov.querySelector('#cardZoomName').textContent = c.name || '';
    ov.querySelector('#cardZoomEl').textContent = c.element || '';
    ov.querySelector('#cardZoomHint').textContent = c.hint || '';
    ov.querySelector('#cardZoomAct').onclick = function () { activateCard(c, idx); };
    ov.style.display = 'flex';
  }
  function activateCard(c, idx) {
    const r = RARITY_ORDER[c.rarity] != null ? RARITY_ORDER[c.rarity] : 0;
    const effects = [
      function () { setLight(player.light + 0.02 * (r + 1)); return '+' + (2 * (r + 1)) + '% Света'; },
      function () { bonusNext += (r + 1); return '+' + (r + 1) + ' к следующему броску'; },
      function () { return 'Открыт ключ линзы «' + lensList[lensIdx].name + '»'; }
    ];
    const msg = effects[Math.floor(Math.random() * effects.length)]();
    toast('⚡ ' + c.name + ': ' + msg);
  }
  async function loadCardsIntoHand() {
    allCards = await loadAllCards();
    if (destroyed) return;
    const shuffled = allCards.slice().sort(function () { return Math.random() - 0.5; });
    hand = shuffled.slice(0, 240);
    renderHand();
    toast('Колода: ' + allCards.length + ' карт · показано ' + hand.length);
  }

  function buildLensSelect() {
    const sel = $('lensSel');
    sel.innerHTML = '';
    lensList.forEach(function (l, i) { const op = document.createElement('option'); op.value = String(i); op.textContent = l.name; sel.appendChild(op); });
    sel.value = String(lensIdx);
    sel.addEventListener('change', function () { lensIdx = parseInt(sel.value, 10); updateLensInfo(); updateCellInfo(); persistNow(); toast('Линза: ' + lensList[lensIdx].name + ' — поле переосмыслено'); });
  }
  function updateLensInfo() { $('lensInfo').innerHTML = '<b>' + lensList[lensIdx].name + '</b> — ' + lensList[lensIdx].bonus; }

  // ═══ Мост Тигля (порт HUD) + потоки vibe()/flows() из awara-mandala.js ═══
  const ELMAP = { earth: 'Земля', water: 'Вода', fire: 'Огонь', air: 'Воздух', ether: 'Эфир' };
  let hudOpen = false;
  function hudEl() {
    let el = container.querySelector('#awaraHud');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'awaraHud';
    const toggle = document.createElement('button');
    toggle.id = 'awaraHudToggle';
    toggle.type = 'button';
    toggle.textContent = '☉';
    toggle.title = 'Тигель · день';
    toggle.style.cssText = 'position:absolute;left:12px;top:64px;z-index:51;width:34px;height:34px;padding:0;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(6,8,20,0.7);border:1px solid rgba(201,168,76,0.35);color:#ffe080;font-size:15px;cursor:pointer';
    const body = document.createElement('div');
    body.id = 'awaraHudBody';
    body.style.cssText = 'position:absolute;left:12px;top:104px;z-index:50;display:none';
    toggle.addEventListener('click', function () { hudOpen = !hudOpen; body.style.display = hudOpen ? 'block' : 'none'; });
    el.appendChild(toggle); el.appendChild(body);
    container.appendChild(el);
    return el;
  }
  function hudRender() {
    hudEl();
    const el = container.querySelector('#awaraHudBody');
    let st = null;
    try { const raw = localStorage.getItem('awara_v258_state'); if (raw) st = JSON.parse(raw); } catch (e) { }
    if (!st) {
      el.innerHTML = "<div style='color:#c9a84c;font-weight:700;letter-spacing:1px'>ТИГЕЛЬ</div><div style='opacity:0.7;margin-top:4px'>нет данных дня — переплавь день в Тигле</div>";
      return;
    }
    const snap = buildV258Snap(st);
    const f = flows(snap);
    const elName = (snap.dominantElement && ELMAP[snap.dominantElement]) ? ELMAP[snap.dominantElement] : player.element;
    const pct = Math.round(snap.awareness * 100);
    el.innerHTML =
      "<div style='color:#c9a84c;font-weight:700;letter-spacing:1px'>ТИГЕЛЬ · ДЕНЬ ПЕРЕПЛАВЛЕН</div>" +
      "<div style='margin-top:6px;display:flex;justify-content:space-between'><span style='opacity:0.65'>Свет</span><span style='color:#ffe080'>" + Math.round(snap.totalLight) + '</span></div>' +
      "<div style='display:flex;justify-content:space-between'><span style='opacity:0.65'>Осознанность</span><span style='color:#9fe0ff'>" + pct + '%</span></div>' +
      "<div style='display:flex;justify-content:space-between'><span style='opacity:0.65'>Стихия</span><span>" + elName + '</span></div>' +
      "<div style='display:flex;justify-content:space-between'><span style='opacity:0.65'>Записей</span><span>" + snap.entries + '</span></div>' +
      "<div style='display:flex;justify-content:space-between'><span style='opacity:0.65'>↑ Восход / ↓ Давление</span><span>" + Math.round(f.ascend * 100) + '% / ' + Math.round(f.descend * 100) + '%</span></div>' +
      "<div style='margin-top:6px;height:6px;border-radius:6px;background:rgba(255,255,255,0.08);overflow:hidden'><div style='height:100%;width:" + pct + "%;background:linear-gradient(90deg,#e23b3b,#f6d033,#9b4ff3,#fff7df)'></div></div>" +
      "<div style='opacity:0.5;margin-top:4px;font-size:10px'>кольцо " + Math.round(snap.awareness * (RING_N - 1)) + ' / ' + (RING_N - 1) + '</div>';
  }
  // Начальная позиция из моста Тигля — только при ПЕРВОМ создании доски
  // (оригинальный мост перекидывал фигурку при каждом фокусе окна — это
  // затирало бы сохранённый прогресс бросков; сознательное отклонение).
  function bridgeApplyInitial() {
    let st = null;
    try { const raw = localStorage.getItem('awara_v258_state'); if (raw) st = JSON.parse(raw); } catch (e) { }
    if (!st) return;
    const snap = buildV258Snap(st);
    const ringTarget = Math.round(snap.awareness * (RING_N - 1));
    const sector = ((player.t % SECTORS) + SECTORS) % SECTORS;
    player.t = ringTarget * SECTORS + sector;
    player.light = snap.awareness;
    if (snap.dominantElement && ELMAP[snap.dominantElement]) player.element = ELMAP[snap.dominantElement];
  }

  function persistNow() {
    writeRec({
      matrixSlug: o.matrixSlug || null, lensNameRu: o.lensNameRu || null,
      t: player.t, gate: gate, sectors: SECTORS, lensIdx: lensIdx,
      bonusNext: bonusNext, dimMode: dimMode, light: player.light,
      element: player.element, depth: depth
    });
  }

  // ═══ Слушатели (все — с уборкой в destroy) ═══
  const cleanups = [];
  function on(target, ev, fn, opts2) { target.addEventListener(ev, fn, opts2); cleanups.push(function () { target.removeEventListener(ev, fn, opts2); }); }

  on($('rollBtn'), 'click', roll);
  on($('gateToggle'), 'click', function (e) { const b = e.target.closest('button'); if (b) setGate(b.dataset.gate); });
  on($('timeBtn'), 'click', enterByTime);
  on($('secToggle'), 'click', function (e) { const b = e.target.closest('button'); if (b) setSectors(parseInt(b.dataset.sec, 10)); });
  on($('dimToggle'), 'click', function (e) { const b = e.target.closest('button'); if (!b) return; dimMode = parseInt(b.dataset.dim, 10); container.querySelectorAll('#dimToggle button').forEach(function (x) { x.classList.toggle('on', x === b); }); applyTilt(); persistNow(); });
  on($('lightRange'), 'input', function (e) { player.light = parseInt(e.target.value, 10) / 100; applyTilt(); updateCellInfo(); });
  on($('summonBtn'), 'click', function () { npc.active = !npc.active; npc.t = gs('W'); toast(npc.active ? 'Игрок призван — общая игра' : 'Одиночная игра'); });
  on($('chatBtn'), 'click', function () { toast('Чат игроков — в разработке (прототип)'); });
  on($('mDive'), 'click', dive);
  on($('mClose'), 'click', function () { $('modal').classList.remove('show'); });
  on($('spiritAskBtn'), 'click', function () { runSpiritSkill('ask'); });
  on($('spiritIllumBtn'), 'click', function () { runSpiritSkill('illuminate'); });
  on($('blockSynth'), 'click', function (e) { const b = e.target.closest('button[data-synth]'); if (b) doSynthesis(b.dataset.synth); });
  on($('blockStruct'), 'click', function (e) { const b = e.target.closest('button[data-build]'); if (b) doBuildStructure(b.dataset.build); });
  on(cv, 'click', function (e) {
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left - CX, y = e.clientY - rect.top - CY;
    const dist = Math.hypot(x, y); if (dist > MAXR) return;
    const ring = Math.min(RING_N - 1, Math.floor((1 - dist / MAXR) * RING_N));
    let a = Math.atan2(y, x) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
    const sector = Math.floor(a / (Math.PI * 2) * SECTORS) % SECTORS;
    if (!dragMoved) { player.t = ring * SECTORS + sector; updateCellInfo(); persistNow(); refreshCellQuest(); } dragMoved = false;
  });

  const boardWrapEl = $('boardWrap');
  const sideEl = $('side');
  const handEl = $('hand');
  const sideToggleEl = $('sideToggle');
  const stageEl = $('stage');
  on(sideToggleEl, 'click', function () {
    const col = sideEl.classList.toggle('collapsed');
    if (stageEl) stageEl.classList.toggle('side-collapsed', col);
    sideToggleEl.textContent = col ? '<' : '>';
    setTimeout(function () { resize(); }, 430);
  });

  // ── Мобильная раскладка (≤760px): вкладки панели + колода-стрип + компакт-поле ──
  // Всё это — чисто view-состояние на время монтирования; в state.superGame
  // НЕ пишется (persistNow не трогаем), CSS применяется только в @media.
  const mq760 = (typeof window.matchMedia === 'function') ? window.matchMedia('(max-width: 760px)') : null;
  function isMobileLayout() { return !!(mq760 && mq760.matches); }
  const TAB_BLOCKS = { path: ['blockCell', 'blockMove'], gate: ['blockGate'], lens: ['blockLens'], dim: ['blockDim'], mp: ['blockMp'], spirit: ['blockSpirit'], synth: ['blockSynth', 'blockStruct'] };
  function setTab(name) {
    if (!TAB_BLOCKS[name]) name = 'path';
    container.querySelectorAll('#sideTabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === name); });
    container.querySelectorAll('#side .block').forEach(function (bl) { bl.classList.remove('tab-on'); });
    TAB_BLOCKS[name].forEach(function (id) { const el = $(id); if (el) el.classList.add('tab-on'); });
  }
  on($('sideTabs'), 'click', function (e) { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });
  on($('handToggle'), 'click', function () {
    const ex = handEl.classList.toggle('expanded');
    $('handToggle').textContent = ex ? '▾' : 'Колода игрока ▴';
    $('handToggle').title = ex ? 'Свернуть колоду' : 'Развернуть колоду';
  });
  on($('boardSizeBtn'), 'click', function () {
    const ex = stageEl.classList.toggle('board-expanded');
    $('boardSizeBtn').textContent = ex ? '⤡' : '⛶';
    $('boardSizeBtn').title = ex ? 'Свернуть поле' : 'Развернуть поле';
    setTimeout(function () { resize(); }, 380); // после CSS-перехода высоты; 3D-слой ресайзится сам (resize3 в frame())
  });

  function setZoom(z) { zoom = Math.max(0.4, Math.min(8, z)); applyTilt(); }

  /* единый маршрутизатор колеса: панель / лента скроллятся, над полем — зум */
  on(container, 'wheel', function (e) {
    if (e.ctrlKey) return;
    const t = e.target;
    if (sideEl && (t === sideEl || sideEl.contains(t))) {
      if (sideEl.scrollHeight > sideEl.clientHeight + 1) {
        sideEl.scrollTop += e.deltaY;
        e.preventDefault();
      }
      return;
    }
    if (handEl && (t === handEl || handEl.contains(t))) {
      if (handEl.scrollWidth > handEl.clientWidth + 1) {
        handEl.scrollLeft += e.deltaY;
        e.preventDefault();
      }
      return;
    }
    e.preventDefault();
    setZoom(zoom + (e.deltaY > 0 ? -0.2 : 0.2));
  }, { passive: false });

  /* вращение мандалы перетаскиванием мыши — как вселенную */
  const boardTiltEl = $('boardTilt');
  let dragOn = false, dragMoved = false, lastMX = 0, lastMY = 0;
  boardWrapEl.style.cursor = 'grab';
  on(boardWrapEl, 'mousedown', function (e) {
    dragOn = true; dragMoved = false;
    lastMX = e.clientX; lastMY = e.clientY;
    boardWrapEl.style.cursor = 'grabbing';
    boardTiltEl.style.transition = 'none';
  });
  on(window, 'mousemove', function (e) {
    if (!dragOn) return;
    const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    lastMX = e.clientX; lastMY = e.clientY;
    rotY -= dx * 0.3;
    rotX -= dy * 0.3;
    applyTilt();
  });
  on(window, 'mouseup', function () {
    if (dragOn) { dragOn = false; boardWrapEl.style.cursor = 'grab'; boardTiltEl.style.transition = ''; }
  });
  on(window, 'keydown', function (e) {
    if (e.key === 'r' || e.key === 'R' || e.key === '0') { rotX = 0; rotY = 0; zoom = 1; boardTiltEl.style.transition = ''; applyTilt(); }
    if (e.key === 'Escape') { const ov = container.querySelector('#cardZoom'); if (ov) ov.style.display = 'none'; }
  });
  on(window, 'resize', resize);
  on(window, 'storage', function (e) { if (e.key === 'awara_v258_state') hudRender(); });
  on(window, 'focus', hudRender);

  // ═══════════════════════════════════════════════════════════════
  // 3D-ПОЛЕ МАНДАЛЫ (Three.js) — дословный порт IIFE из mandala-game.html:
  // вложенные чакровые кольца + ядро-галактика (стиль Истока).
  // Отличия от оригинала: THREE из npm (import вверху файла, а не CDN-глобал);
  // локальные lensList/gs()/GRAY вместо LENSES/gateSector/GRAYV; полная
  // утилизация WebGL в destroy(); телепорт по клику дополнительно вызывает
  // persistNow()+refreshCellQuest() (так же, как 2D-клик этого порта).
  // ═══════════════════════════════════════════════════════════════
  let raf3 = 0;
  let dispose3D = null;
  function init3D() {
    const wrap = $('boardWrap');
    const tilt = $('boardTilt');
    const canvas = $('board3d');
    if (!canvas || !wrap) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

    function glowTex(stops) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      for (let s = 0; s < stops.length; s++) { rg.addColorStop(stops[s][0], stops[s][1]); }
      g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    function mkGlow(tex, size) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.set(size, size, 1); return sp;
    }

    // звёзды — глубокий космический фон
    const sN = 1100, sArr = new Float32Array(sN * 3);
    for (let i = 0; i < sN * 3; i += 3) { const rr = 30 + Math.random() * 60, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1); sArr[i] = rr * Math.sin(ph) * Math.cos(th); sArr[i + 1] = rr * Math.cos(ph); sArr[i + 2] = rr * Math.sin(ph) * Math.sin(th); }
    const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sArr, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xbfd0ff, size: 0.14, transparent: true, opacity: 0.6 })));

    const group = new THREE.Group(); scene.add(group);
    const spin3g = new THREE.Group(); group.add(spin3g);

    // === вложенные кольца: ring0 (Даймон −3, ч/б) снаружи, ring12 (Центр Ра) в глубине центра ===
    const RMAX = 7.4, RMIN = 0.7;

    // ===== CRISP RING TRACKS: тонкие концентрические круги в плоскости z=0 = наша плоская карта =====
    const ringMesh = [];
    for (let k = 0; k < RING_N; k++) {
      const rr0 = RMIN + (RMAX - RMIN) * ((k + 0.5) / RING_N);
      const ww = (k === 0) ? 0.055 : 0.038;
      const m = new THREE.Mesh(new THREE.RingGeometry(rr0 - ww, rr0 + ww, 168, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false }));
      spin3g.add(m); ringMesh.push(m);
    }

    // ===== OUR FIELD: плоский диск мандалы в центре (тёмная основа + тёплое радиальное свечение + спицы секторов) =====
    function discTex() {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d');
      const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      rg.addColorStop(0, 'rgba(255,238,170,0.50)');
      rg.addColorStop(0.30, 'rgba(150,110,50,0.20)');
      rg.addColorStop(0.68, 'rgba(50,38,72,0.14)');
      rg.addColorStop(1, 'rgba(8,5,20,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
      return new THREE.CanvasTexture(c);
    }
    const discBase = new THREE.Mesh(new THREE.CircleGeometry(RMAX * 1.04, 96),
      new THREE.MeshBasicMaterial({ color: 0x0b0820, transparent: true, opacity: 0.93, depthWrite: false }));
    discBase.position.z = -0.05; discBase.renderOrder = -3; spin3g.add(discBase);
    const discGlow = new THREE.Mesh(new THREE.CircleGeometry(RMAX * 1.04, 96),
      new THREE.MeshBasicMaterial({ map: discTex(), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    discGlow.position.z = -0.02; discGlow.renderOrder = -2; spin3g.add(discGlow);
    const fieldSpokes = new THREE.Group(); spin3g.add(fieldSpokes);
    function buildSpokes(n) {
      while (fieldSpokes.children.length) {
        const ch = fieldSpokes.children[0];
        fieldSpokes.remove(ch);
        if (ch.geometry) ch.geometry.dispose();
        if (ch.material) ch.material.dispose();
      }
      for (let si = 0; si < n; si++) {
        const ang = si / n * Math.PI * 2;
        const pa = new Float32Array([RMIN * Math.cos(ang), RMIN * Math.sin(ang), 0, RMAX * Math.cos(ang), RMAX * Math.sin(ang), 0]);
        const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
        fieldSpokes.add(new THREE.Line(gg, new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.3, depthWrite: false })));
      }
    }
    buildSpokes(SECTORS); buildSpokes.last = SECTORS;

    // ===== NESTED VOLUMETRIC SPHERES: каркасный глобус (меридианы+параллели) + лёгкая стеклянная заливка =====
    // Сетка широта/долгота делает сферу настоящим 3D-шаром при вращении; экватор лежит в плоскости карты.
    const SPH_VERT = 'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
    const SPH_FRAG = 'precision highp float;uniform vec3 uColor;uniform float uOpacity;uniform float uPower;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),uPower);float a=uOpacity*(0.12+0.88*f);gl_FragColor=vec4(uColor*(0.45+0.75*f),a);}';
    function circleGeo(fn) { const S = 96, a = new Float32Array((S + 1) * 3); for (let i = 0; i <= S; i++) { const pt = fn(i / S * Math.PI * 2); a[i * 3] = pt[0]; a[i * 3 + 1] = pt[1]; a[i * 3 + 2] = pt[2]; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g; }
    const SPH_N = 1, NPAR = 6, NMER = 8;
    const sphMesh = [], sphGrid = [];
    for (let s2 = 0; s2 < SPH_N; s2++) {
      const sr = RMAX * ((s2 + 1) / SPH_N);
      const sMat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Vector3(1, 1, 1) }, uOpacity: { value: 0.2 }, uPower: { value: 2.4 } }, vertexShader: SPH_VERT, fragmentShader: SPH_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const sm = new THREE.Mesh(new THREE.SphereGeometry(sr, 48, 32), sMat);
      spin3g.add(sm); sphMesh.push(sm);
      const gmats = [];
      for (let p = 1; p < NPAR + 1; p++) {
        const lat = p / (NPAR + 1) * Math.PI, rrp = sr * Math.sin(lat), zz = sr * Math.cos(lat);
        const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const lp = new THREE.LineLoop(circleGeo((function (R, Z) { return function (t) { return [R * Math.cos(t), R * Math.sin(t), Z]; }; })(rrp, zz)), lm);
        spin3g.add(lp); gmats.push(lm);
      }
      for (let mi = 0; mi < NMER; mi++) {
        const phi = mi / NMER * Math.PI;
        const lm2 = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const lp2 = new THREE.LineLoop(circleGeo((function (R, PH) { return function (t) { return [R * Math.sin(t) * Math.cos(PH), R * Math.sin(t) * Math.sin(PH), R * Math.cos(t)]; }; })(sr, phi)), lm2);
        spin3g.add(lp2); gmats.push(lm2);
      }
      sphGrid.push(gmats);
    }

    // ===== яркое компактное ядро в самом центре =====
    const coreHalo = mkGlow(glowTex([[0, 'rgba(255,255,255,0.9)'], [0.4, 'rgba(190,170,255,0.4)'], [1, 'rgba(0,0,0,0)']]), 1.5); spin3g.add(coreHalo);
    const coreGlow = mkGlow(glowTex([[0, '#ffffff'], [0.32, '#fff2c0'], [0.62, '#e8b84b'], [1, 'rgba(0,0,0,0)']]), 0.85); spin3g.add(coreGlow);
    const coreCore = new THREE.Mesh(new THREE.SphereGeometry(0.22, 28, 20), new THREE.MeshBasicMaterial({ color: 0xfff7df, transparent: true, opacity: 0.95 })); spin3g.add(coreCore);

    function cellPos3(k, sector, dz) {
      const r = RMIN + (RMAX - RMIN) * ((k + 0.5) / RING_N);
      const a = sector / SECTORS * Math.PI * 2 - Math.PI / 2;
      return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), (dz || 0.08));
    }

    const pGlowTex = glowTex([[0, '#ffffff'], [0.45, '#f6c948'], [1, 'rgba(0,0,0,0)']]);
    const nGlowTex = glowTex([[0, '#eaffff'], [0.45, '#34c6d8'], [1, 'rgba(0,0,0,0)']]);
    const gGlowTex = glowTex([[0, '#fff3c0'], [0.45, '#c9a84c'], [1, 'rgba(0,0,0,0)']]);
    function mkOrb(bodyCol, tex) {
      const orb = new THREE.Group();
      orb.add(mkGlow(tex, 0.95));
      orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), new THREE.MeshBasicMaterial({ color: bodyCol, transparent: true, opacity: 0.9 })));
      orb.visible = false; group.add(orb); return orb;
    }
    const pOrb = mkOrb(0xffffff, pGlowTex), nOrb = mkOrb(0xcfe9ff, nGlowTex);
    const gateOrb = {};
    ['N', 'S', 'W', 'E'].forEach(function (gn) { gateOrb[gn] = mkOrb(0xffe9a8, gGlowTex); gateOrb[gn].visible = true; });

    function ringOf(t) { return Math.min(Math.floor(t / SECTORS), RING_N - 1); }
    function sectorOf(t) { return ((t % SECTORS) + SECTORS) % SECTORS; }

    let lastL = -1, lastLens = -1;
    function recolor() {
      const L = player.light, tintC = hexToRgb(lensList[lensIdx].tint);
      for (let k = 0; k < RING_N; k++) {
        // Та же общая формула, что в 2D (ringPaintRgb): кольца Даймона — ч/б.
        const c = ringPaintRgb(k, L, tintC, 0.5, 0.14);
        ringMesh[k].material.color.setRGB(c[0] / 255, c[1] / 255, c[2] / 255);
        ringMesh[k].material.opacity = 0.7 + 0.3 * L;
      }
      for (let s3 = 0; s3 < SPH_N; s3++) {
        const ck = (SPH_N > 1) ? Math.round(s3 / (SPH_N - 1) * (RING_N - 1)) : Math.round((RING_N - 1) / 2);
        const sc = ringPaintRgb(ck, L, tintC, 0.55, 0.14);
        sphMesh[s3].material.uniforms.uColor.value.set(sc[0] / 255, sc[1] / 255, sc[2] / 255);
        sphMesh[s3].material.uniforms.uOpacity.value = 0.04 + 0.06 * L;
        const gm = sphGrid[s3];
        for (let gj = 0; gj < gm.length; gj++) { gm[gj].color.setRGB(sc[0] / 255, sc[1] / 255, sc[2] / 255); gm[gj].opacity = 0.10 + 0.12 * L; }
      }
      coreGlow.material.opacity = 0.22 + 0.22 * L;
      coreHalo.material.opacity = 0.10 + 0.14 * L;
      lastL = L; lastLens = lensIdx;
    }

    let lastW = 0, lastH = 0;
    function resize3() {
      const fl = isMobileLayout() ? 160 : 280; // компактное мобильное поле ниже 280px
      const w = Math.max(fl, wrap.clientWidth), h = Math.max(fl, wrap.clientHeight);
      if (w === lastW && h === lastH) return;
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    on(window, 'resize', resize3); resize3();

    // === фокус / занырнуть в ячейку: клик по ячейке — подлёт, клик мимо поля или C/Esc — назад в центр ===
    const focus = new THREE.Vector3(0, 0, 0), focusTarget = new THREE.Vector3(0, 0, 0);
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
    function toCenter() { focusTarget.set(0, 0, 0); zoom = 1; applyTilt(); }
    function focusCell(cx, cy) {
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(planeZ, hit)) { return; }
      const rr = Math.hypot(hit.x, hit.y);
      if (rr > RMAX * 1.04) { toCenter(); toast('Возврат в центр'); return; }
      let k = Math.round(((rr - RMIN) / (RMAX - RMIN)) * RING_N - 0.5); k = Math.max(0, Math.min(RING_N - 1, k));
      let a = Math.atan2(hit.y, hit.x) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
      const sector = Math.floor(a / (Math.PI * 2) * SECTORS) % SECTORS;
      player.t = k * SECTORS + sector;
      updateCellInfo();
      persistNow();
      refreshCellQuest();
      focusTarget.copy(cellPos3(k, sector, 0));
      zoom = Math.max(zoom, 2.8); if (zoom > 8) zoom = 8; applyTilt();
      toast('Ячейка: кольцо ' + k + ' · сектор ' + sector + ' — крути и приближайся, C — в центр');
    }
    on(canvas, 'click', function (e) {
      if (dimMode !== 3) return;
      if (dragMoved) { dragMoved = false; return; }
      focusCell(e.clientX, e.clientY);
    });
    on(canvas, 'dblclick', function () { if (dimMode === 3) toCenter(); });
    on(window, 'keydown', function (e) {
      if (dimMode !== 3) return;
      if (e.key === 'c' || e.key === 'C' || e.key === '0' || e.key === 'Escape') { toCenter(); }
    });

    let gTime = 0, lastDim3 = 0;
    function frame() {
      if (destroyed) return;
      const show3 = (dimMode === 3);
      canvas.style.display = show3 ? 'block' : 'none';
      if (tilt) tilt.style.visibility = show3 ? 'hidden' : '';
      if (show3) {
        gTime += 0.016;
        resize3();
        if (player.light !== lastL || lensIdx !== lastLens) recolor();
        if (buildSpokes.last !== SECTORS) { buildSpokes(SECTORS); buildSpokes.last = SECTORS; }
        spin3g.rotation.z = 0;
        pOrb.visible = true; pOrb.position.copy(cellPos3(ringOf(player.t), sectorOf(player.t)));
        nOrb.visible = !!npc.active; if (npc.active) nOrb.position.copy(cellPos3(ringOf(npc.t), sectorOf(npc.t)));
        ['N', 'S', 'W', 'E'].forEach(function (gn) {
          const orb = gateOrb[gn]; orb.position.copy(cellPos3(0, gs(gn)));
          const isOn = (gn === gate); orb.scale.setScalar(isOn ? 1.5 : 0.85);
        });
        const pulse = 1 + Math.sin(gTime * 1.7) * 0.10; coreGlow.scale.set(1.3 * pulse, 1.3 * pulse, 1);
        // при входе в 3D сбрасываем углы, чтобы начать по центру; дальше — свободная орбита мышью
        if (lastDim3 !== 3) { rotX = -22; rotY = 18; } lastDim3 = dimMode;
        const dist = 22 / Math.max(0.4, zoom);
        focus.lerp(focusTarget, 0.09);
        const eul = new THREE.Euler(rotX * Math.PI / 180, rotY * Math.PI / 180, 0, 'YXZ');
        const off = new THREE.Vector3(0, 0, dist).applyEuler(eul);
        const upv = new THREE.Vector3(0, 1, 0).applyEuler(eul);
        camera.position.set(focus.x + off.x, focus.y + off.y, focus.z + off.z);
        camera.up.copy(upv); camera.lookAt(focus);
        renderer.render(scene, camera);
      } else {
        lastDim3 = dimMode;
      }
      raf3 = requestAnimationFrame(frame);
    }
    recolor();
    raf3 = requestAnimationFrame(frame);

    dispose3D = function () {
      scene.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
        mats.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
      });
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch (e) { }
    };
  }

  // ═══ init — тот же порядок, что в оригинале, + восстановление/мост ═══
  let clockIv = 0;
  function init() {
    try {
      resize();
      buildLensSelect();
      updateLensInfo();
      const rec = readRec();
      if (rec && typeof rec.t === 'number') {
        // восстановление сохранённой доски
        SECTORS = (rec.sectors === 12 || rec.sectors === 24) ? rec.sectors : 24;
        container.querySelectorAll('#secToggle button').forEach(function (b) { b.classList.toggle('on', parseInt(b.dataset.sec, 10) === SECTORS); });
        gate = GATE_TIME[rec.gate] ? rec.gate : 'E';
        container.querySelectorAll('#gateToggle button').forEach(function (b) { b.classList.toggle('on', b.dataset.gate === gate); });
        if (typeof rec.lensIdx === 'number' && rec.lensIdx >= 0 && rec.lensIdx < lensList.length) { lensIdx = rec.lensIdx; $('lensSel').value = String(lensIdx); updateLensInfo(); }
        player.t = Math.max(0, Math.min(GOAL_T(), rec.t));
        bonusNext = rec.bonusNext || 0;
        depth = rec.depth || 0;
        if (typeof rec.light === 'number') player.light = clamp01(rec.light);
        if (rec.element) player.element = rec.element;
        if (rec.dimMode === 1 || rec.dimMode === 2 || rec.dimMode === 3) { dimMode = rec.dimMode; container.querySelectorAll('#dimToggle button').forEach(function (b) { b.classList.toggle('on', parseInt(b.dataset.dim, 10) === dimMode); }); }
      } else {
        setGate('E');
        bridgeApplyInitial();
        persistNow();
      }
      $('lightRange').value = Math.round(player.light * 100);
      applyTilt();
      updateCellInfo();
      loadCardsIntoHand();
      tickClock(); clockIv = setInterval(tickClock, 1000);
      raf = requestAnimationFrame(draw);
      // 3D-слой опционален: если WebGL недоступен, dimMode 3 откатится на
      // купольную 2D-проекцию draw() (прежний фолбэк), доска не падает.
      try { init3D(); } catch (e3d) { console.warn('SUPERGAME 3D layer unavailable', e3d); }
      hudRender();
      refreshCellQuest();
      renderSynth();
      renderStructures();
    } catch (err) {
      console.error('SUPERGAME INIT ERROR', err);
      const t = $('toast');
      if (t) { t.textContent = 'Ошибка: ' + (err && err.message || err); t.classList.add('show'); }
      const ci = $('ciName'); if (ci) ci.textContent = '⚠ Ошибка: ' + (err && err.message || err);
    }
  }
  init();

  return {
    destroy: function () {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (raf3) cancelAnimationFrame(raf3);
      if (dispose3D) { try { dispose3D(); } catch (e) { } dispose3D = null; }
      if (clockIv) clearInterval(clockIv);
      cleanups.forEach(function (fn) { try { fn(); } catch (e) { } });
      container.classList.remove('sgm-root');
      container.innerHTML = '';
    }
  };
}
