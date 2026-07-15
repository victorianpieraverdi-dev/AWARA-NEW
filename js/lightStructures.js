/**
 * lightStructures.js — Световые структуры (engine_config.json v2.3,
 * секция light_structures) — ГЛОБАЛЬНАЯ мета-фича, независимая от борда
 * конкретной линзы.
 *
 * «Игрок строит структуры из накопленного света. Структуры = сердце, связь
 * с Духом, Богом, Вечностью. Через них — противостояние тьме и невежеству.»
 *
 * Данные 6 структур (id, имя, Мера, стоимость, prerequisite, эффект) взяты
 * из engine_config.json ДОСЛОВНО. Условие доступности — глобальная Мера
 * игрока = getCurrentRing(state.totalLight) из daimonAscent.js (кольцо 1..9
 * совпадает с Мерой 1..9), НЕ позиция фишки на борде.
 *
 * Персистенция: state.lightStructures — массив id построенных структур
 * внутри awara_v258_state (playerState.js).
 *
 * ⚠ V1-СКОУП: эффекты структур здесь — декларативные строки из спеки.
 * Реально подключён только эффект spirit_channel («Открывает механику
 * 'Призыв Духа'») — через гейт панели Духа в superGameBoard.js.
 * Остальные эффекты (ether_conversion, тени ×0.7, перелив линз, перенос
 * эфира) относятся к слою частиц/эфира (daily_cycle + particles) — отдельная
 * задача сверки №6. partial_build («строить порциями») из спеки сознательно
 * НЕ реализован в v1 — постройка одним вложением.
 *
 * ⚠ Не путать с awara-light-structures.js (корень) — это параллельная
 * реализация той же спеки для прототипа tigel-app.html на window.STATE
 * (ключ 'STATE'), другая вселенная состояния. Здесь — v258-экосистема.
 */

import { getCurrentRing } from './daimonAscent.js';

// Дословно из engine_config.json → light_structures.structures
// (+ у spirit_channel фраза «прямая линия к Ра» — дословно из
// ra_radiance.in_gameplay.manifestations, сверка-4).
export const LIGHT_STRUCTURES = [
  {
    id: 'heart_core',
    name_ru: 'Сердечное ядро',
    unlock_mera: 4,
    description: 'Первая структура. Центр, из которого растут остальные. Связь игрока с собственным сердцем.',
    light_to_build: 100,
    requires: [],
    effect: 'ether_conversion +0.05, базовый якорь для остальных структур'
  },
  {
    id: 'spirit_channel',
    name_ru: 'Канал Духа',
    unlock_mera: 5,
    description: 'Связь вверх — к Духу. Призыв и получение. Прямая линия к Ра.',
    light_to_build: 250,
    requires: ['heart_core'],
    effect: "Открывает механику 'Призыв Духа', бонус к devotion-квестам"
  },
  {
    id: 'purification_ring',
    name_ru: 'Кольцо очищения',
    unlock_mera: 5,
    description: 'Очистка энергии. Противостояние теням.',
    light_to_build: 250,
    requires: ['heart_core'],
    effect: 'Снижает влияние теней на ×0.7, бонус к shadow-квестам'
  },
  {
    id: 'circulation_web',
    name_ru: 'Сеть циркуляции',
    unlock_mera: 6,
    description: 'Свет течёт между линзами, усиливая слабые.',
    light_to_build: 500,
    requires: ['heart_core', 'spirit_channel'],
    effect: 'Автоматический перелив 10% света из сильных линз в слабые'
  },
  {
    id: 'eternity_anchor',
    name_ru: 'Якорь Вечности',
    unlock_mera: 7,
    description: 'Связь с Вечностью. Свет больше не полностью остывает за ночь.',
    light_to_build: 1000,
    requires: ['heart_core', 'spirit_channel', 'purification_ring'],
    effect: 'Утром 20% эфира сохраняется пробуждённым — быстрее старт дня'
  },
  {
    id: 'radiance_body',
    name_ru: 'Тело сияния',
    unlock_mera: 9,
    description: 'Финальная структура. Все остальные объединяются. Полная связь с Духом.',
    light_to_build: 3000,
    requires: ['heart_core', 'spirit_channel', 'purification_ring', 'circulation_web', 'eternity_anchor'],
    effect: 'Максимальная конвертация (0.95), все линзы связаны, эфир пробуждается мгновенно'
  }
];

function byId(id) {
  return LIGHT_STRUCTURES.find(function (s) { return s.id === id; }) || null;
}

function builtList(state) {
  return Array.isArray(state && state.lightStructures) ? state.lightStructures : [];
}

/** Построена ли структура. */
export function hasStructure(state, id) {
  return builtList(state).indexOf(id) >= 0;
}

/**
 * Статус одной структуры для данного state:
 * { built, meraOk, missing (id[]), affordable, buildable, reason }
 */
export function structureStatus(state, id) {
  const s = byId(id);
  if (!s) return null;
  const built = hasStructure(state, id);
  const mera = getCurrentRing(state && state.totalLight);
  const meraOk = mera >= s.unlock_mera;
  const missing = s.requires.filter(function (r) { return !hasStructure(state, r); });
  const affordable = ((state && state.totalLight) || 0) >= s.light_to_build;
  let reason = null;
  if (built) reason = 'уже построена';
  else if (!meraOk) reason = 'нужна Мера ' + s.unlock_mera + ' (сейчас ' + mera + ')';
  else if (missing.length) reason = 'сначала: ' + missing.map(function (r) { const p = byId(r); return p ? p.name_ru : r; }).join(', ');
  else if (!affordable) reason = 'не хватает Света (' + Math.round((state && state.totalLight) || 0) + ' / ' + s.light_to_build + ')';
  return {
    built: built, meraOk: meraOk, missing: missing,
    affordable: affordable,
    buildable: !built && meraOk && !missing.length && affordable,
    reason: reason
  };
}

/** Все 6 структур со статусами (для UI). */
export function getAvailableStructures(state) {
  return LIGHT_STRUCTURES.map(function (s) {
    return Object.assign({}, s, { status: structureStatus(state, s.id) });
  });
}

/**
 * Построить структуру: валидирует Меру/prerequisite/свет, списывает
 * state.totalLight, добавляет id в state.lightStructures. МУТИРУЕТ state,
 * НЕ сохраняет — вызывающий сохраняет через saveState(state) (playerState.js),
 * как принято в слое данных superGameBoard.js.
 * @returns {{ok:true, structure:object, totalLight:number}|{ok:false, reason:string}}
 */
export function buildStructure(state, id) {
  const s = byId(id);
  if (!s) return { ok: false, reason: 'Неизвестная структура: ' + id };
  const st = structureStatus(state, id);
  if (!st.buildable) return { ok: false, reason: s.name_ru + ' — ' + (st.reason || 'ещё недоступна') };
  if (!Array.isArray(state.lightStructures)) state.lightStructures = [];
  state.totalLight = Math.round(((state.totalLight || 0) - s.light_to_build) * 100) / 100;
  state.lightStructures.push(s.id);
  return { ok: true, structure: s, totalLight: state.totalLight };
}
