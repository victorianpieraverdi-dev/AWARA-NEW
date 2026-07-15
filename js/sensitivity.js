/**
 * sensitivity.js — Чувствительность (engine_config.json v2.3, секция
 * sensitivity.metric) — ГЛОБАЛЬНЫЙ персистентный стат игрока, не per-board.
 *
 * «Чувствительность — главное качество, развиваемое в игре. НЕ ощущаемость
 * (тело/ум), а Чувствительность к Свету, Духу, Сострадание. Растёт от
 * глубины и качества, не от количества.»
 *
 * Уровни (имена/диапазоны) взяты из спеки ДОСЛОВНО:
 * Спящая 0-5 · Пробуждающаяся 5-20 · Тонкая 20-50 · Глубокая 50-100 ·
 * Чистая 100+.
 *
 * Персистенция: state.sensitivity (число ≥ 0) внутри awara_v258_state
 * (playerState.js) — по образцу state.lightStructures из сверки-3.
 *
 * РОСТ (спека): «ИИ-оценка quality > 0.7 → чувствительность растёт».
 * ⚠ V1-УПРОЩЕНИЕ: в v258-экосистеме пока НЕТ живой ИИ-оценки текста игрока
 * (ai_evaluation.quality_score из спеки реализован только в параллельном
 * прототипе tigel-app.html: awara-experience-engine.js + awara-sensitivity.js
 * на window.STATE — другая вселенная состояния, не трогаем). Поэтому здесь
 * quality-сигнал даёт локальная эвристика estimateTextQuality() (длина +
 * содержательность + личность текста), как в остальных local-fallback местах
 * проекта. Когда появится живой quality_score — подставить его же в
 * recordQualitySignal(), эвристику оставить фолбэком.
 *
 * ⚠ V1-СКОУП эффектов: из трёх эффектов спеки подключён «качество Духа
 * линзы» (замена изобретённой формулы P9.3 в superGameBoard.js, сверка-2).
 * particle_multiplier при пробуждённом эфире (+0.05 за уровень) и «более
 * тонкие тексты Даймона» — слой частиц/эфира (сверка-6), отдельная задача.
 *
 * Конвенция слоя данных superGameBoard.js: функции МУТИРУЮТ state и НЕ
 * сохраняют — вызывающий сохраняет через saveState(state) (playerState.js).
 */

// Дословно из engine_config.json → sensitivity.metric.levels.
export const SENSITIVITY_LEVELS = [
  { level: 0, name_ru: 'Спящая',         min: 0,   max: 5,        note: 'Обычное состояние' },
  { level: 1, name_ru: 'Пробуждающаяся', min: 5,   max: 20,       note: 'Начинает различать' },
  { level: 2, name_ru: 'Тонкая',         min: 20,  max: 50,       note: 'Чувствует свет, тени, связи' },
  { level: 3, name_ru: 'Глубокая',       min: 50,  max: 100,      note: 'Сострадание как состояние' },
  { level: 4, name_ru: 'Чистая',         min: 100, max: Infinity, note: 'Прямое восприятие Ра' }
];

// Порог роста — из спеки: «ИИ-оценка quality > 0.7 → чувствительность растёт».
export const SENSITIVITY_QUALITY_GATE = 0.7;

function round2(x) { return Math.round(x * 100) / 100; }

/** Текущее значение sensitivity из state (0, если поля ещё нет). */
export function sensitivityValue(state) {
  const v = state && Number(state.sensitivity);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/** Уровень по значению (объект из SENSITIVITY_LEVELS). */
export function sensitivityLevel(value) {
  const v = Number(value) || 0;
  for (let i = SENSITIVITY_LEVELS.length - 1; i >= 0; i--) {
    if (v >= SENSITIVITY_LEVELS[i].min) return SENSITIVITY_LEVELS[i];
  }
  return SENSITIVITY_LEVELS[0];
}

/** Сводка для UI: { value, level }. */
export function getSensitivity(state) {
  const value = sensitivityValue(state);
  return { value: value, level: sensitivityLevel(value) };
}

/**
 * «Качество» 0.05..1 из sensitivity — 1:1 замещение изобретённой формулы
 * качества P9.3 (0.45·светДоски + 0.35·осознанность + 0.20·чёткость/4).
 * Judgement call: quality = clamp(sensitivity / 100, 0.05, 1) — значение 100
 * (нижняя граница уровня «Чистая», «Прямое восприятие Ра») даёт 1.0; нижний
 * кламп 0.05 сохранён от старой формулы. Пороги силы SYNTH_RULES
 * (1.0 / 2.5 / 6.0) не тронуты — меняется только источник переменной.
 */
export function sensitivityQuality(value) {
  return Math.max(0.05, Math.min(1, round2((Number(value) || 0) / 100)));
}

/**
 * ⚠ V1-эвристика качества текста игрока 0..1 (см. шапку файла) — локальный
 * заменитель ai_evaluation.quality_score («Искренность, глубина, конкретность
 * ответа») до появления живой ИИ-оценки в v258-экосистеме:
 *   0.40·содержательность (уникальные слова ≥4 букв, насыщение к 25) +
 *   0.35·развёрнутость (длина, насыщение к 240 символам) +
 *   0.25·личность (я/чувствую/осознаю/сострадание/служение/благодарность).
 * Порог 0.7 проходится искренним конкретным текстом в 2-4 предложения.
 */
export function estimateTextQuality(text) {
  const t = String(text || '').trim();
  if (!t) return 0;
  const words = t.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/i)
    .filter(function (w) { return w.length >= 4; });
  const uniq = {};
  words.forEach(function (w) { uniq[w] = 1; });
  const depth = Math.min(1, Object.keys(uniq).length / 25);
  const len = Math.min(1, t.length / 240);
  const personal = /(^|[^а-яa-z])(я|мне|меня|мо[йяёеию]|чувству|осозна|сострада|служени|благодар|прощ[аеу])/i.test(t) ? 1 : 0;
  return round2(0.40 * depth + 0.35 * len + 0.25 * personal);
}

/**
 * Сигнал качества → рост sensitivity. Растёт только при quality > 0.7
 * (спека). Величина прироста — judgement call: (quality − 0.7) × 10, т.е.
 * +0..+3 за сигнал (типичный искренний ответ +1..+2). Темп: «Пробуждающаяся»
 * (5) за ~3-5 качественных ответов, «Чистая» (100) за ~50-100 — уровни
 * заполняются за сессии, не за клики. МУТИРУЕТ state, НЕ сохраняет.
 * @param {object} state — awara_v258_state (playerState.getState())
 * @param {number} quality — 0..1 (живой quality_score или estimateTextQuality)
 * @returns {{grown:boolean, delta:number, value:number, level:object, levelUp:boolean}}
 */
export function recordQualitySignal(state, quality) {
  const q = Math.max(0, Math.min(1, Number(quality) || 0));
  const before = sensitivityValue(state);
  const lvlBefore = sensitivityLevel(before);
  if (q <= SENSITIVITY_QUALITY_GATE) {
    return { grown: false, delta: 0, value: before, level: lvlBefore, levelUp: false };
  }
  const delta = round2((q - SENSITIVITY_QUALITY_GATE) * 10);
  const value = round2(before + delta);
  state.sensitivity = value;
  const lvlAfter = sensitivityLevel(value);
  return { grown: true, delta: delta, value: value, level: lvlAfter, levelUp: lvlAfter.level > lvlBefore.level };
}
