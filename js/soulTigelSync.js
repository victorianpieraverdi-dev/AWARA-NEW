/**
 * soulTigelSync.js — T-603
 *
 * Двунаправленная синхронизация между Тиглем (awara_v258_state.sphereData)
 * и Душой v2 (spheres-v2.html, ключ awara_subspheres_v3).
 *
 * До T-603 экраны жили на разных ключах localStorage и не делились
 * данными. Этот модуль не переименовывает ключи (чтобы не сломать уже
 * сохранённые состояния игроков), а зеркалит запись в обе стороны при
 * каждом сохранении.
 *
 * Источник правды:
 *   - сводный свет / стихии / journey  → awara_v258_state (Тигель + дашборд)
 *   - визуализация подсфер / нитей    → awara_subspheres_v3 (Душа v2)
 *
 * Маппинг сфер Тигля → сфер Души v2 (см. cauldronEngine.js и spheres-v2.html):
 *   feet         (Земля, тело)         → foundation (Корни, Земля)
 *   heart        (Вода, чувства)       → heart      (Поток)
 *   head         (Воздух, ум)          → mind       (Творение)
 *   cooperation  (Эфир, светообмен)    → soul       (Источник)
 */

const SUBSPHERES_KEY = 'awara_subspheres_v3';
const SPHERE_STEP_KEY = 'awara_sphere_step_v3';
const STORAGE_KEY = 'awara_v258_state';

const TIGEL_TO_SOUL = {
  feet: 'foundation',
  heart: 'heart',
  head: 'mind',
  cooperation: 'soul',
  connections: 'connections'
};

const SOUL_TO_TIGEL = {
  foundation: 'feet',
  heart: 'heart',
  mind: 'head',
  soul: 'cooperation',
  connections: 'connections'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('soulTigelSync: ошибка записи ' + key, e);
  }
}

function readState() {
  return readJSON(STORAGE_KEY, null);
}

function shortTheme(themes) {
  if (!Array.isArray(themes) || themes.length === 0) return '';
  return themes.slice(0, 3).join(' · ');
}

/**
 * Зеркалит итог Тигля в Душу v2.
 * Для каждой Тигель-сферы с положительным score добавляет одну
 * подсферу в соответствующую Душу-сферу. Не создаёт дублей по id
 * результата (cauldronResult.id попадает в поле source подсферы).
 */
export function syncTigelToSoul(cauldronResult) {
  if (!cauldronResult || !cauldronResult.sphereScores) return;
  const subSpheres = readJSON(SUBSPHERES_KEY, {});
  const sourceId = cauldronResult.id || ('tigel_' + Date.now());
  let touched = false;
  let revealedMax = 0;

  Object.entries(cauldronResult.sphereScores).forEach(([tigelId, value]) => {
    const score = Number(value && value.score || 0);
    if (score <= 0) return;
    const soulId = TIGEL_TO_SOUL[tigelId];
    if (!soulId) return;

    if (!Array.isArray(subSpheres[soulId])) subSpheres[soulId] = [];
    const existing = subSpheres[soulId].find(x => x && x.source === sourceId);
    if (existing) return;

    subSpheres[soulId].push({
      text: shortTheme(value.themes) || (value.title || tigelId),
      date: cauldronResult.createdAt || new Date().toISOString(),
      light: Math.max(score * 4, 15),
      source: sourceId,
      origin: 'tigel'
    });
    touched = true;
    if (soulId === 'foundation') revealedMax = Math.max(revealedMax, 1);
    if (soulId === 'heart') revealedMax = Math.max(revealedMax, 2);
    if (soulId === 'mind') revealedMax = Math.max(revealedMax, 3);
  });

  if (!touched) return;
  writeJSON(SUBSPHERES_KEY, subSpheres);

  if (revealedMax > 0) {
    const currentStep = parseInt(localStorage.getItem(SPHERE_STEP_KEY) || '0', 10) || 0;
    if (revealedMax > currentStep) {
      localStorage.setItem(SPHERE_STEP_KEY, String(revealedMax));
    }
  }
}

/**
 * Зеркалит запись подсферы из Души v2 в Тигель (state.sphereData)
 * и добавляет запись в state.journey.
 *
 * Вызывать после save() в spheres-v2.html, передавая id Душа-сферы
 * (foundation/heart/mind/soul) и сам объект подсферы.
 */
export function syncSoulToTigel(soulSphereId, subSphereEntry) {
  if (!soulSphereId || !subSphereEntry || !subSphereEntry.text) return;
  const tigelId = SOUL_TO_TIGEL[soulSphereId];
  if (!tigelId) return;

  const state = readState();
  if (!state) return;

  const sphereData = state.sphereData || {};
  const cell = sphereData[tigelId] || { light: 0, entries: 0, themes: [] };
  const lightGain = Math.max(1, Math.round(Number(subSphereEntry.light || 0) / 4));
  const nextThemes = Array.from(new Set([...(cell.themes || []), subSphereEntry.text]))
    .slice(-12);

  sphereData[tigelId] = {
    light: Number(cell.light || 0) + lightGain,
    entries: Number(cell.entries || 0) + 1,
    themes: nextThemes
  };

  const journey = Array.isArray(state.journey) ? [...state.journey] : [];
  journey.unshift({
    id: 'soul_' + Date.now(),
    at: subSphereEntry.date || new Date().toISOString(),
    type: 'soul_subsphere',
    sphere: tigelId,
    soulSphere: soulSphereId,
    light: lightGain,
    text: subSphereEntry.text
  });

  state.sphereData = sphereData;
  state.journey = journey.slice(0, 90);
  state.totalLight = Number(state.totalLight || 0) + lightGain;
  state.cauldron = state.cauldron || {};
  state.cauldron.lastSoulEntry = {
    soulSphere: soulSphereId,
    tigelSphere: tigelId,
    at: subSphereEntry.date || new Date().toISOString(),
    light: lightGain
  };

  writeJSON(STORAGE_KEY, state);
}

/**
 * Slug активной Тигель-сферы из последнего результата.
 * Используется будущим Оракулом / промтом-генератором как «куда
 * смотрит душа сейчас».
 */
export function getCauldronLastResultSphereSlug() {
  const state = readState();
  const last = state && state.cauldron && state.cauldron.lastResult;
  return last && last.dominantSphere ? last.dominantSphere : null;
}

export const SPHERE_MAP = Object.freeze({
  TIGEL_TO_SOUL: { ...TIGEL_TO_SOUL },
  SOUL_TO_TIGEL: { ...SOUL_TO_TIGEL }
});
