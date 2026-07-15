// js/soulPrompts.js
// T-608 v2: guided Q&A для входа в сферу Души.
//
// Каждая сфера сопоставлена со временем и пластом существа:
//   foundation → ТЕЛО · ПРОШЛОЕ (ноги, живот, корни, материя).
//   heart      → СЕРДЦЕ · НАСТОЯЩЕЕ (чувства, поток, отношения).
//   mind       → РАЗУМ · БУДУЩЕЕ (намерения, мысли, творение).
//   soul       → ДУША · ИСТОЧНИК (мета-вопрос — про целое).
//
// Возврат: одна философская подсказка-вопрос, ротация по дню + длине истории,
// чтобы игрок не видел один и тот же вопрос две сессии подряд.

export const SPHERE_PROMPTS = {
  foundation: [
    'Что в моём теле сегодня уже сделано? Что отдала земля, что отдал я?',
    'Где сейчас стоят мои ноги? На что я опираюсь — реально, не в идее?',
    'Какой кусок прошлого я несу в этом дне как корень, а какой — как камень?',
    'Какие действия живота, рук, ног были моими сегодня — без слов?',
    'Что моё тело знает, чего ум ещё не догнал?'
  ],
  heart: [
    'Что я чувствую прямо сейчас, до того как назвал это словом?',
    'Кто или что сегодня было моим настоящим — без прошлого и будущего?',
    'Где сегодня прошёл мой поток, а где он остановился?',
    'Кому я отдал свет сегодня и от кого принял — честно?',
    'Что в сердце ждёт, чтобы я его наконец признал?'
  ],
  mind: [
    'Какое намерение я хочу унести в завтра — одним словом?',
    'Какая мысль сегодня впервые показалась моей, а не чужой?',
    'Что я готов сотворить, чего ещё нет? Опиши образом, не планом.',
    'Какой образ будущего я кормлю, и стоит ли он того?',
    'Какой вопрос я задаю себе про завтра, когда никто не слушает?'
  ],
  soul: [
    'Если день — это одно слово, какое?',
    'Что сегодня было светом, а что — тьмой, через которую этот свет вошёл?',
    'Какая нить связала тело, сердце и разум в этом дне?',
    'Я сегодня — кто? Из источника или из эха?',
    'Что осталось от меня, когда отняли всё пережитое?'
  ],
  connections: [
    'С кем ты хочешь разделить свой свет? Кого ты ищешь?',
    'Какой мост ты готов построить к другому — и зачем?',
    'Что ты можешь отдать другому, чего у тебя в избытке?',
    'Кто рядом идёт похожим путём — и как вы можете усилить друг друга?',
    'Что ты создал бы вместе с другими, чего не можешь один?'
  ]
};

// Простой хеш для «равномерной» ротации без рандома (детерминированно по дню+истории).
function rotIndex(sphereId, historyLen) {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seed = (sphereId.charCodeAt(0) * 31 + day + historyLen) >>> 0;
  return seed;
}

export function getPromptForSphere(sphereId, historyLen) {
  const pool = SPHERE_PROMPTS[sphereId] || SPHERE_PROMPTS.soul;
  const idx = rotIndex(sphereId, historyLen || 0) % pool.length;
  return pool[idx];
}

// Композиция «промт-образа дня» для Тигля: собирает темы Тигля + последние записи
// + текущие подсферы и формирует текстовый промт-семя для генерации.
//
// Не делает сетевых вызовов; на этом этапе мы просто собираем строку, которую
// игрок может скопировать или передать дальше в любой внешний генератор.
export function composeDailyImagePrompt(state, subSpheres) {
  const totalLight = Number(state && state.totalLight || 0);
  const cauldron = (state && state.cauldron) || {};
  const journey = Array.isArray(state && state.journey) ? state.journey : [];
  const sphereData = (state && state.sphereData) || {};

  const dominant = cauldron.lastResult && cauldron.lastResult.dominantSphere || null;
  const recentThemes = [];
  ['feet','heart','head','cooperation'].forEach(key => {
    const node = sphereData[key];
    if (node && Array.isArray(node.themes)) {
      node.themes.slice(-3).forEach(t => { if (t && recentThemes.indexOf(t) === -1) recentThemes.push(t); });
    }
  });

  const subTexts = [];
  ['foundation','heart','mind','soul'].forEach(id => {
    const arr = (subSpheres && subSpheres[id]) || [];
    arr.slice(-2).forEach(s => { if (s && s.text) subTexts.push(s.text); });
  });

  const lastJourney = journey.slice(-3).map(j => (j && (j.text || j.title)) || '').filter(Boolean);

  const lines = [];
  lines.push('# AWARA · промт-образ дня');
  lines.push('');
  lines.push(`Свет души игрока: ${totalLight} ✦`);
  if (dominant) lines.push(`Доминанта Тигля: ${dominant}`);
  lines.push('');
  if (recentThemes.length) {
    lines.push('Темы из сфер:');
    recentThemes.forEach(t => lines.push(`  · ${t}`));
    lines.push('');
  }
  if (subTexts.length) {
    lines.push('Голос подсфер:');
    subTexts.forEach(t => lines.push(`  · ${t}`));
    lines.push('');
  }
  if (lastJourney.length) {
    lines.push('Последние шаги пути:');
    lastJourney.forEach(t => lines.push(`  · ${t}`));
    lines.push('');
  }
  lines.push('Образ: тёмный фон, источник света изнутри фигуры, четыре сферы — тело, сердце, разум, душа — соединены золотой нитью. Стиль: алхимическая миниатюра, тёплый свет, без логотипов и подписей.');
  return lines.join('\n');
}

export const DAILY_PROMPT_LIGHT_GATE = 200;
