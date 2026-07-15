/**
 * streak.js — трекер 7-дневной серии посещений
 *
 * Использование:
 *   import { recordVisit, getStreak } from './js/streak.js';
 *   recordVisit();               // отметить сегодняшний визит
 *   const s = getStreak();       // { days: ['2026-05-10', ...], current: 3, max: 5 }
 */

const STORAGE_KEY = 'awara_streak_days';

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function loadDays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDays(days) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

/** Отметить визит сегодня */
export function recordVisit() {
  const today = todayISO();
  const days = loadDays();
  if (!days.includes(today)) {
    days.push(today);
    days.sort();
    // хранить максимум 30 дней
    while (days.length > 30) days.shift();
    saveDays(days);
  }
}

/** Получить данные серии за последние 7 дней */
export function getStreak() {
  const days = loadDays();
  const today = new Date();
  const last7 = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    last7.push({ date: iso, visited: days.includes(iso) });
  }

  // текущая серия (от сегодня назад)
  let current = 0;
  for (let i = last7.length - 1; i >= 0; i--) {
    if (last7[i].visited) current++;
    else break;
  }

  // максимальная серия за всё время
  let max = 0, run = 0;
  const allSorted = [...days].sort();
  for (let i = 0; i < allSorted.length; i++) {
    if (i === 0) { run = 1; }
    else {
      const prev = new Date(allSorted[i - 1]);
      const curr = new Date(allSorted[i]);
      const diff = (curr - prev) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    }
    if (run > max) max = run;
  }

  return { last7, current, max };
}
