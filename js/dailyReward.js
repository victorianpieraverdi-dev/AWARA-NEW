/**
 * dailyReward.js — ежедневный шанс получить карту (~5%)
 *
 * Использование:
 *   import { checkDailyReward } from './js/dailyReward.js';
 *   const result = await checkDailyReward();
 *   // { rolled: false }                          — уже проверено сегодня
 *   // { rolled: true, won: false }               — не выпало
 *   // { rolled: true, won: true, card: {...} }   — выпала карта
 *   // { rolled: true, won: false, allCollected: true } — все 63 собраны
 */

const REWARD_DATE_KEY = 'awara_daily_reward_date';
const CARDS_KEY = 'awara_cards';
const DROP_CHANCE = 0.05;

const MATRICES = ['Ведическая', 'Славянская', 'Каббалистическая'];

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function loadCollected() {
  try {
    return JSON.parse(localStorage.getItem(CARDS_KEY) || '{}');
  } catch (e) { return {}; }
}

function saveCollected(collected) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(collected));
}

function cardId(agentSlug, matrix) {
  return agentSlug + '__' + matrix;
}

/**
 * Проверить ежедневную награду. Вызывать один раз при заходе в лобби.
 * @returns {Promise<{rolled:boolean, won?:boolean, card?:object, allCollected?:boolean}>}
 */
export async function checkDailyReward() {
  const today = todayISO();
  const lastDate = localStorage.getItem(REWARD_DATE_KEY);

  if (lastDate === today) {
    return { rolled: false };
  }

  localStorage.setItem(REWARD_DATE_KEY, today);

  const collected = loadCollected();

  let agents;
  try {
    agents = await fetch('data/agents.json').then(r => r.json());
  } catch (e) {
    console.warn('dailyReward: agents.json error', e);
    return { rolled: true, won: false };
  }

  const uncollected = [];
  agents.forEach(agent => {
    MATRICES.forEach(matrix => {
      const cid = cardId(agent.slug, matrix);
      if (!collected[cid]) {
        uncollected.push({ agent, matrix, cid });
      }
    });
  });

  if (uncollected.length === 0) {
    return { rolled: true, won: false, allCollected: true };
  }

  const roll = Math.random();
  if (roll >= DROP_CHANCE) {
    return { rolled: true, won: false };
  }

  const idx = Math.floor(Math.random() * uncollected.length);
  const pick = uncollected[idx];

  collected[pick.cid] = true;
  saveCollected(collected);

  return {
    rolled: true,
    won: true,
    card: {
      id: pick.cid,
      agent: pick.agent,
      matrix: pick.matrix
    }
  };
}
