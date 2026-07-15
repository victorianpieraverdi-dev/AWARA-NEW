const SPHERES = {
  feet: {
    title: 'Ноги',
    element: 'Земля',
    keywords: ['тело', 'делал', 'работа', 'дисциплина', 'дом', 'деньги', 'здоровье', 'сон', 'еда', 'практика', 'земля', 'порядок', 'уборка', 'спорт']
  },
  heart: {
    title: 'Сердце',
    element: 'Вода',
    keywords: ['чувствовал', 'любовь', 'боль', 'страх', 'радость', 'отношения', 'сердце', 'обида', 'принятие', 'благодарность', 'слёзы', 'вода', 'семья', 'сострадание']
  },
  head: {
    title: 'Голова',
    element: 'Воздух',
    keywords: ['понял', 'думал', 'решил', 'осознал', 'идея', 'смысл', 'ум', 'мысль', 'анализ', 'знание', 'слово', 'воздух', 'обучение', 'выбор']
  },
  cooperation: {
    title: 'Сотрудничество',
    element: 'Эфир',
    keywords: ['помог', 'вместе', 'обмен', 'служение', 'люди', 'команда', 'границы', 'сотрудничество', 'светообмен', 'другой', 'сообщество', 'эфир', 'договор', 'поддержка']
  }
};

const EXTRA_ELEMENTS = {
  'Огонь': ['воля', 'огонь', 'смелость', 'трансформация', 'сила', 'аскеза', 'энергия', 'действие'],
  'Эфир': ['бог', 'молитва', 'эфир', 'пространство', 'дух', 'медитация', 'тишина', 'смысл']
};

const DISTORTIONS = {
  ahamkara: ['эго', 'гордость', 'обида', 'контроль', 'важность', 'я прав'],
  fear: ['страх', 'боюсь', 'тревога', 'паника', 'опасность', 'избегал'],
  desire: ['хочу', 'желание', 'зависимость', 'тянет', 'страсть', 'привязанность'],
  illusion: ['иллюзия', 'самообман', 'кажется', 'фантазия', 'искажение', 'проекция'],
  inertia: ['лень', 'инерция', 'не сделал', 'застрял', 'сонливость', 'тяжесть']
};

function countMatches(text, keywords) {
  return keywords.reduce((sum, word) => sum + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function analyzeCauldronEntry(text, context = {}) {
  const normalized = String(text || '').toLowerCase();
  const lengthScore = clamp(Math.floor(normalized.length / 160), 0, 12);
  const toroidLight = Number(context.toroidLight || 0);
  const baseLight = 6 + lengthScore;
  const sphereScores = {};
  const elementsAwarded = { 'Огонь': 0, 'Вода': 0, 'Земля': 0, 'Воздух': 0, 'Эфир': 0 };

  Object.entries(SPHERES).forEach(([id, sphere]) => {
    const matches = countMatches(normalized, sphere.keywords);
    const score = clamp(matches, 0, 7);
    sphereScores[id] = {
      title: sphere.title,
      score,
      element: sphere.element,
      themes: sphere.keywords.filter(word => normalized.includes(word.toLowerCase())).slice(0, 5)
    };
    elementsAwarded[sphere.element] += score;
  });

  Object.entries(EXTRA_ELEMENTS).forEach(([element, keywords]) => {
    elementsAwarded[element] += clamp(countMatches(normalized, keywords), 0, 5);
  });

  const distortions = Object.entries(DISTORTIONS)
    .filter(([, keywords]) => countMatches(normalized, keywords) > 0)
    .map(([id]) => id);

  const sphereTotal = Object.values(sphereScores).reduce((sum, item) => sum + item.score, 0);
  const shadowBonus = distortions.length * 3;
  const lightAwarded = Math.round(baseLight + sphereTotal * 2 + shadowBonus + toroidLight * 0.1);
  const dominantSphere = Object.entries(sphereScores).sort((a, b) => b[1].score - a[1].score)[0][0];
  const dominantElement = Object.entries(elementsAwarded).sort((a, b) => b[1] - a[1])[0][0];

  return {
    id: 'tigel_' + Date.now(),
    createdAt: new Date().toISOString(),
    summary: 'День принят в Тигель. Опыт преобразован в свет, стихии и след пути.',
    dayEnergy: dominantElement,
    dominantSphere,
    sphereScores,
    elementsAwarded,
    distortionsDetected: distortions,
    lightAwarded,
    toroidLight,
    practiceTomorrow: buildPractice(dominantElement, dominantSphere),
    source: 'local_cauldron_engine_v1'
  };
}

const ELEMENT_TO_DAIMON = {
  'Огонь': 'fire',
  'Вода': 'water',
  'Земля': 'earth',
  'Воздух': 'air',
  'Эфир': 'ether'
};

function calculateDaimonCauldronBonus(daimon, result) {
  if (!daimon || !result) {
    return { multiplier: 1, xpMultiplier: 1, elementMatch: false, bonusLight: 0, xpGained: 0 };
  }

  const dayElement = ELEMENT_TO_DAIMON[result.dayEnergy] || null;
  const primary = daimon.gameEffects?.element || daimon.element || null;
  const secondary = daimon.secondaryElement || null;
  const baseBonus = Number(daimon.resonanceBonus || daimon.gameEffects?.elementBonus || 0.05);

  let resonance = 0;
  let elementMatch = false;
  if (dayElement && primary === dayElement) {
    resonance = baseBonus;
    elementMatch = true;
  } else if (dayElement && secondary === dayElement) {
    resonance = baseBonus * 0.5;
    elementMatch = true;
  }

  const multiplier = 1 + resonance;
  const xpMultiplier = Number(daimon.gameEffects?.daimonXpMultiplier || multiplier || 1);
  const bonusLight = Math.max(0, Math.round(Number(result.lightAwarded || 0) * resonance));
  const xpGained = Math.max(1, Math.round(Number(result.lightAwarded || 0) * xpMultiplier));

  return { multiplier, xpMultiplier, elementMatch, bonusLight, xpGained, dayElement, resonance };
}

export function applyCauldronResult(state, result) {
  const daimonBonus = calculateDaimonCauldronBonus(state?.daimon, result);
  const effectiveLightAwarded = Number(result.lightAwarded || 0) + daimonBonus.bonusLight;

  const next = {
    ...state,
    totalLight: Number(state.totalLight || 0) + effectiveLightAwarded,
    sphereData: { ...(state.sphereData || {}) },
    elements: { ...(state.elements || {}) },
    journey: Array.isArray(state.journey) ? [...state.journey] : []
  };

  if (next.daimon) {
    next.daimon = {
      ...next.daimon,
      xp: Number(next.daimon.xp || 0) + daimonBonus.xpGained,
      totalXP: Number(next.daimon.totalXP || next.daimon.experience || 0) + daimonBonus.xpGained,
      experience: Number(next.daimon.experience || next.daimon.totalXP || 0) + daimonBonus.xpGained,
      updatedAt: new Date().toISOString(),
      lastResonance: {
        at: result.createdAt,
        dayEnergy: result.dayEnergy,
        dayElement: daimonBonus.dayElement,
        elementMatch: daimonBonus.elementMatch,
        bonusLight: daimonBonus.bonusLight,
        xpGained: daimonBonus.xpGained,
        resonance: daimonBonus.resonance
      }
    };
  }

  Object.entries(result.sphereScores || {}).forEach(([id, value]) => {
    const current = next.sphereData[id] || { light: 0, entries: 0, themes: [] };
    next.sphereData[id] = {
      ...current,
      light: Number(current.light || 0) + value.score,
      entries: Number(current.entries || 0) + (value.score > 0 ? 1 : 0),
      themes: Array.from(new Set([...(current.themes || []), ...(value.themes || [])])).slice(-12)
    };
  });

  Object.entries(result.elementsAwarded || {}).forEach(([element, value]) => {
    next.elements[element] = Number(next.elements[element] || 0) + Number(value || 0);
  });

  next.journey.unshift({
    id: result.id,
    at: result.createdAt,
    type: 'tigel_cauldron',
    light: effectiveLightAwarded,
    baseLight: result.lightAwarded,
    daimonBonusLight: daimonBonus.bonusLight,
    daimonXpGained: daimonBonus.xpGained,
    daimonElementMatch: daimonBonus.elementMatch,
    energy: result.dayEnergy,
    sphere: result.dominantSphere,
    distortions: result.distortionsDetected,
    practiceTomorrow: result.practiceTomorrow
  });

  next.journey = next.journey.slice(0, 90);
  return next;
}

function buildPractice(element, sphere) {
  if (element === 'Земля') return 'Завтра сделай одно простое действие для тела, дома или порядка и отметь его в Тигле.';
  if (element === 'Вода') return 'Завтра мягко продыши сердце и назови одно чувство без подавления и без оценки.';
  if (element === 'Огонь') return 'Завтра выбери одно малое действие воли и доведи его до конца.';
  if (element === 'Воздух') return 'Завтра запиши одну ясную мысль, один выбор и одно слово, которое хочешь очистить.';
  if (sphere === 'cooperation') return 'Завтра сделай один честный жест сотрудничества или поддержки.';
  return 'Завтра сделай 7 мягких дыханий и почувствуй центральный канал внимания.';
}
