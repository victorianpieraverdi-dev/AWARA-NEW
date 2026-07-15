/**
 * tigelBridge.js — МОСТ ТИГЛЯ (Этап 1)
 *
 * Соединяет накопленный «пакет света» Тигля (awara_v258_state: totalLight,
 * sphereData, elements, journey) с моделью позвоночника (window.AwaraLight из
 * light-core.js) и собирает ЕДИНЫЙ state.light:
 *
 *   state.light = {
 *     version, awareness, honesty,
 *     gunas:    { tamas, rajas, sattva },        // нормализовано, сумма ≈ 1
 *     elements: { earth, water, fire, air, ether }, // профиль 0..1
 *     dominantElement, levelId, statusId,
 *     totals:   { totalLight, entries, tigelEntries, shadowFacings },
 *     suggestions, computedAt, advisory:true
 *   }
 *
 * ── ПРИНЦИП: КОМПАС, НЕ РЕЛЬСЫ ──
 * Мост только ЧИТАЕТ прогресс и ВЫЧИСЛЯЕТ свет. Он ничего не блокирует и не
 * гейтит. Подсказки берутся из AwaraLight.suggest() и остаются advisory.
 * light-core.js остаётся чистой моделью (не пишет в localStorage) — вся
 * запись state.light происходит здесь.
 *
 * Формулы awareness/honesty/gunas — синтез автора (advisory-эвристики),
 * их можно переосмыслить или заменить, не ломая контракт state.light.
 */

const STORAGE_KEY = 'awara_v258_state';

// Стихии playerState (рус.) → id light-core (ELEMENT_IDS).
export const ELEMENT_RU_TO_ID = {
  'Земля': 'earth',
  'Вода': 'water',
  'Огонь': 'fire',
  'Воздух': 'air',
  'Эфир': 'ether'
};

// Искажения (cauldronEngine.DISTORTIONS) → гуна, к которой они смещают баланс.
//   inertia/fear → тамас (инерция, страх-морок)
//   desire/ahamkara/illusion → раджас (страсть, эго-движение, завеса)
const DISTORTION_GUNA = {
  inertia: 'tamas',
  fear: 'tamas',
  desire: 'rajas',
  ahamkara: 'rajas',
  illusion: 'rajas'
};

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function num(x) { return Number(x) || 0; }
function round3(x) { return Math.round(num(x) * 1000) / 1000; }

function readState() {
  try {
    const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeState(state) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('tigelBridge: ошибка записи ' + STORAGE_KEY, e);
  }
}

function awaraLight() {
  return (typeof window !== 'undefined' && window.AwaraLight) ? window.AwaraLight : null;
}

/**
 * Чистое вычисление пакета света из состояния игрока. Ничего не пишет.
 * @param {object} state — объект awara_v258_state (см. playerState.js).
 * @returns {object} state.light
 */
export function computeLight(state) {
  const s = state || {};
  const total = num(s.totalLight);
  const J = Array.isArray(s.journey) ? s.journey : [];
  const entries = J.length;
  const tigelEntries = J.filter(e => e && e.type === 'tigel_cauldron').length;

  // ── awareness (мастер-метрика): сатурирующая кривая от света + бонус за постоянство ──
  const fromLight = 1 - Math.exp(-total / 600);
  const fromConsistency = 1 - Math.exp(-entries / 40);
  const awareness = clamp01(0.85 * fromLight + 0.15 * fromConsistency);

  // ── профиль стихий (0..1, относительно максимума) ──
  const srcEl = s.elements || {};
  const elRaw = { earth: 0, water: 0, fire: 0, air: 0, ether: 0 };
  for (const ru in ELEMENT_RU_TO_ID) elRaw[ELEMENT_RU_TO_ID[ru]] = num(srcEl[ru]);
  const elMax = Math.max(1, elRaw.earth, elRaw.water, elRaw.fire, elRaw.air, elRaw.ether);
  const elements = {
    earth: clamp01(elRaw.earth / elMax),
    water: clamp01(elRaw.water / elMax),
    fire: clamp01(elRaw.fire / elMax),
    air: clamp01(elRaw.air / elMax),
    ether: clamp01(elRaw.ether / elMax)
  };
  const dominantElement = ['earth', 'water', 'fire', 'air', 'ether']
    .reduce((a, b) => (elements[b] > elements[a] ? b : a), 'earth');

  // ── разбор искажений из journey ──
  const tally = { ahamkara: 0, fear: 0, desire: 0, illusion: 0, inertia: 0 };
  let shadowFacings = 0;
  let distortionEvents = 0;
  for (const ev of J) {
    const ds = ev && ev.distortions;
    if (Array.isArray(ds) && ds.length) {
      shadowFacings++;
      for (const d of ds) {
        if (tally[d] != null) { tally[d]++; distortionEvents++; }
      }
    }
  }

  // ── honesty (критерий = близость к реальности, дез-иллюзия) ──
  // встреча с тенью (названо искажение) повышает; иллюзия снижает;
  // равномерный охват сфер (не избегаешь ни одной) повышает.
  const facingRatio = tigelEntries > 0 ? clamp01(shadowFacings / tigelEntries) : 0;
  const sd = s.sphereData || {};
  const sLights = ['feet', 'heart', 'head', 'cooperation'].map(k => num(sd[k] && sd[k].light));
  const sSum = sLights.reduce((a, b) => a + b, 0);
  let balance = 0;
  if (sSum > 0) {
    const mean = sSum / sLights.length;
    const variance = sLights.reduce((a, b) => a + (b - mean) * (b - mean), 0) / sLights.length;
    const cv = Math.sqrt(variance) / (mean || 1);
    balance = clamp01(1 - cv);
  }
  const illusionLoad = clamp01(tally.illusion / 8);
  const honesty = clamp01(0.35 + 0.30 * facingRatio + 0.25 * balance - 0.20 * illusionLoad);

  // ── гуны (нормализованный баланс) ──
  let tamasRaw = 0.7 * elements.earth + 0.3 * elements.water;
  let rajasRaw = 0.7 * elements.fire + 0.5 * elements.water + 0.3 * elements.air;
  let sattvaRaw = 0.7 * elements.ether + 0.5 * elements.air;
  for (const d in tally) {
    const g = DISTORTION_GUNA[d];
    const w = tally[d] * 0.05;
    if (g === 'tamas') tamasRaw += w;
    else if (g === 'rajas') rajasRaw += w;
  }
  sattvaRaw += 0.6 * awareness + 0.4 * honesty;
  const gSum = (tamasRaw + rajasRaw + sattvaRaw) || 1;
  const gunas = {
    tamas: tamasRaw / gSum,
    rajas: rajasRaw / gSum,
    sattva: sattvaRaw / gSum
  };

  // ── уровень / статус: мягко делегируем light-core, если он загружен ──
  let levelId = null;
  let statusId = null;
  try {
    const AL = awaraLight();
    if (AL && Array.isArray(AL.LEVELS) && AL.LEVELS.length) {
      const i = Math.min(AL.LEVELS.length - 1, Math.floor(awareness * AL.LEVELS.length));
      const lv = AL.LEVELS[i];
      if (lv) levelId = lv.id || lv.key || lv.ru || null;
    }
    if (AL && Array.isArray(AL.STATUSES) && AL.STATUSES.length) {
      const j = Math.min(AL.STATUSES.length - 1, Math.floor(awareness * AL.STATUSES.length));
      const st = AL.STATUSES[j];
      if (st) statusId = st.id || st.key || st.ru || null;
    }
  } catch (e) { /* advisory: уровень/статус опциональны */ }

  // ── advisory-подсказки из ядра (ничего не гейтят) ──
  let suggestions = [];
  try {
    const AL = awaraLight();
    if (AL && typeof AL.suggest === 'function') {
      suggestions = AL.suggest({ awareness: awareness, honesty: honesty, density: 3 }) || [];
    }
  } catch (e) { suggestions = []; }

  return {
    version: 1,
    awareness: round3(awareness),
    honesty: round3(honesty),
    gunas: { tamas: round3(gunas.tamas), rajas: round3(gunas.rajas), sattva: round3(gunas.sattva) },
    elements: {
      earth: round3(elements.earth),
      water: round3(elements.water),
      fire: round3(elements.fire),
      air: round3(elements.air),
      ether: round3(elements.ether)
    },
    dominantElement: dominantElement,
    levelId: levelId,
    statusId: statusId,
    totals: { totalLight: total, entries: entries, tigelEntries: tigelEntries, shadowFacings: shadowFacings },
    suggestions: suggestions,
    computedAt: new Date().toISOString(),
    advisory: true
  };
}

/**
 * Чистый merge: вернуть копию состояния с пересчитанным .light.
 * Удобно в потоке сохранения Тигля: saveState(withLight(next)).
 */
export function withLight(state) {
  if (!state) return state;
  return Object.assign({}, state, { light: computeLight(state) });
}

/**
 * Прочитать состояние из localStorage, пересчитать свет, записать обратно.
 * @returns {object|null} пакет state.light или null, если состояния нет.
 */
export function refresh() {
  const state = readState();
  if (!state) return null;
  const light = computeLight(state);
  state.light = light;
  writeState(state);
  return light;
}

/**
 * Текущий свет: из сохранённого state.light, иначе пересчёт «на лету».
 */
export function getLight() {
  const state = readState();
  // Нет сохранённого состояния на этой странице (напр., мир React/istok ещё не
  // прогонял ванильный конвейер Тигля) -> всё равно отдаём базовый advisory-пакет,
  // чтобы потребителям (свечение, подсказки) было что читать. Только совет, не гейт.
  if (!state) return computeLight({});
  return state.light || computeLight(state);
}

const AwaraTigelBridge = {
  version: 1,
  ELEMENT_RU_TO_ID: ELEMENT_RU_TO_ID,
  computeLight: computeLight,
  withLight: withLight,
  refresh: refresh,
  getLight: getLight
};

if (typeof window !== 'undefined') window.AwaraTigelBridge = AwaraTigelBridge;

// Разовый пересчёт при старте: как только модуль загружен в браузере, обновляем
// state.light, чтобы у текущих игроков он заполнился сразу (даже без новых сохранений).
// Guard'ы внутри refresh/computeLight безопасны, если window.AwaraLight ещё не готов.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const bootRefresh = function () { try { refresh(); } catch (e) { /* advisory */ } };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootRefresh, 800); });
  } else {
    setTimeout(bootRefresh, 800);
  }
}

export default AwaraTigelBridge;
