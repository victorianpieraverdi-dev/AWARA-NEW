/**
 * cardEffects.js — бонусы собранных карт
 *
 * Матрицы:
 *   Ведическая     → +1 свет/час за каждую карту
 *   Славянская     → +5% шанс ключа за каждую карту
 *   Каббалистическая → +1 ключ при streak 7 за каждую карту
 *
 * Использование:
 *   import { getCardEffects, applyStreakBonus } from './js/cardEffects.js';
 *   const fx = getCardEffects();
 *   // { vedic: 3, slavic: 2, kabbalistic: 1,
 *   //   lightPerHour: 3, keyChancePct: 10, keysAtStreak7: 1 }
 */

const CARDS_KEY = 'awara_cards';
const KEYS_KEY = 'awara_keys';
const STREAK_BONUS_KEY = 'awara_streak_bonus_date';

function loadCollected() {
  try {
    return JSON.parse(localStorage.getItem(CARDS_KEY) || '{}');
  } catch (e) { return {}; }
}

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Подсчитать бонусы от собранных карт.
 * @returns {{vedic:number, slavic:number, kabbalistic:number,
 *            lightPerHour:number, keyChancePct:number, keysAtStreak7:number}}
 */
export function getCardEffects() {
  const collected = loadCollected();
  let vedic = 0;
  let slavic = 0;
  let kabbalistic = 0;

  Object.keys(collected).forEach(function(cid) {
    if (cid.endsWith('__\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f')) vedic++;
    else if (cid.endsWith('__\u0421\u043b\u0430\u0432\u044f\u043d\u0441\u043a\u0430\u044f')) slavic++;
    else if (cid.endsWith('__\u041a\u0430\u0431\u0431\u0430\u043b\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f')) kabbalistic++;
  });

  return {
    vedic: vedic,
    slavic: slavic,
    kabbalistic: kabbalistic,
    lightPerHour: vedic,
    keyChancePct: slavic * 5,
    keysAtStreak7: kabbalistic
  };
}

/**
 * Начислить ключи за streak 7 (раз в день).
 * @param {number} currentStreak — текущая серия из streak.js
 * @returns {{awarded:boolean, keys:number}}
 */
export function applyStreakBonus(currentStreak) {
  if (currentStreak < 7) {
    return { awarded: false, keys: 0 };
  }

  const today = todayISO();
  if (localStorage.getItem(STREAK_BONUS_KEY) === today) {
    return { awarded: false, keys: 0 };
  }

  const fx = getCardEffects();
  if (fx.keysAtStreak7 <= 0) {
    return { awarded: false, keys: 0 };
  }

  localStorage.setItem(STREAK_BONUS_KEY, today);
  var cur = 0;
  try { cur = parseInt(localStorage.getItem(KEYS_KEY) || '0'); } catch (e) {}
  localStorage.setItem(KEYS_KEY, String(cur + fx.keysAtStreak7));

  return { awarded: true, keys: fx.keysAtStreak7 };
}
