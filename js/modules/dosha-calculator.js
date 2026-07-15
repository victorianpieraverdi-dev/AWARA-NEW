// Ayurvedic dosha calculator
// Determines constitution (Prakriti) from natal chart or quiz answers

const DOSHA_NAMES = {
  Vata:  { en: 'Vata',  ru: 'Вата' },
  Pitta: { en: 'Pitta', ru: 'Питта' },
  Kapha: { en: 'Kapha', ru: 'Капха' }
};

// Element-to-dosha mapping
const ELEMENT_DOSHA = {
  Fire:  'Pitta',
  Air:   'Vata',
  Ether: 'Vata',
  Earth: 'Kapha',
  Water: 'Kapha'
};

// Planet-to-dosha associations
const PLANET_DOSHA = {
  Sun:     'Pitta',
  Moon:    'Kapha',
  Mars:    'Pitta',
  Mercury: 'Vata',
  Jupiter: 'Kapha',
  Venus:   'Kapha',
  Saturn:  'Vata',
  Rahu:    'Vata',
  Ketu:    'Pitta'
};

// Sign-to-dosha mapping
const SIGN_DOSHA = {
  Aries:       'Pitta',
  Taurus:      'Kapha',
  Gemini:      'Vata',
  Cancer:      'Kapha',
  Leo:         'Pitta',
  Virgo:       'Vata',
  Libra:       'Vata',
  Scorpio:     'Pitta',
  Sagittarius: 'Pitta',
  Capricorn:   'Vata',
  Aquarius:    'Vata',
  Pisces:      'Kapha'
};

/**
 * Calculate dosha from natal chart data.
 * @param {Object} natalChart - Output from calculateNatalChart()
 * @returns {Object} dosha result
 */
export function calculateDoshaFromNatal(natalChart) {
  const scores = { Vata: 0, Pitta: 0, Kapha: 0 };

  // Sun sign contribution (weight: 3)
  if (natalChart.sun && natalChart.sun.sign) {
    const d = SIGN_DOSHA[natalChart.sun.sign];
    if (d) scores[d] += 3;
  }

  // Moon sign contribution (weight: 3)
  if (natalChart.moon && natalChart.moon.sign) {
    const d = SIGN_DOSHA[natalChart.moon.sign];
    if (d) scores[d] += 3;
  }

  // Lagna sign contribution (weight: 2)
  if (natalChart.lagna && natalChart.lagna.sign) {
    const d = SIGN_DOSHA[natalChart.lagna.sign];
    if (d) scores[d] += 2;
  }

  // Sun element (weight: 2)
  if (natalChart.sun && natalChart.sun.element) {
    const d = ELEMENT_DOSHA[natalChart.sun.element];
    if (d) scores[d] += 2;
  }

  // Moon element (weight: 2)
  if (natalChart.moon && natalChart.moon.element) {
    const d = ELEMENT_DOSHA[natalChart.moon.element];
    if (d) scores[d] += 2;
  }

  // Nakshatra ruler dosha (weight: 1 each)
  if (natalChart.sun && natalChart.sun.nakshatra_ruler) {
    const d = PLANET_DOSHA[natalChart.sun.nakshatra_ruler];
    if (d) scores[d] += 1;
  }
  if (natalChart.moon && natalChart.moon.nakshatra_ruler) {
    const d = PLANET_DOSHA[natalChart.moon.nakshatra_ruler];
    if (d) scores[d] += 1;
  }

  return buildDoshaResult(scores);
}

/**
 * Dosha quiz questions (10 questions, 3 options each: Vata / Pitta / Kapha)
 */
export const DOSHA_QUIZ = [
  {
    id: 'body_frame',
    question: { en: 'What is your body frame?', ru: 'Какое у вас телосложение?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Thin, light, hard to gain weight',   ru: 'Худое, лёгкое, сложно набрать вес' } },
      { dosha: 'Pitta', label: { en: 'Medium, athletic, muscular',         ru: 'Среднее, атлетичное, мускулистое' } },
      { dosha: 'Kapha', label: { en: 'Solid, heavy, easy to gain weight',  ru: 'Плотное, тяжёлое, легко набирать вес' } }
    ]
  },
  {
    id: 'skin_type',
    question: { en: 'How is your skin?', ru: 'Какая у вас кожа?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Dry, thin, cool to touch',           ru: 'Сухая, тонкая, прохладная' } },
      { dosha: 'Pitta', label: { en: 'Warm, oily, redness-prone',          ru: 'Тёплая, жирная, склонная к покраснению' } },
      { dosha: 'Kapha', label: { en: 'Thick, moist, smooth, pale',         ru: 'Толстая, влажная, гладкая, бледная' } }
    ]
  },
  {
    id: 'appetite',
    question: { en: 'How is your appetite?', ru: 'Какой у вас аппетит?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Irregular, sometimes forget to eat', ru: 'Нерегулярный, иногда забываю поесть' } },
      { dosha: 'Pitta', label: { en: 'Strong, irritable when hungry',      ru: 'Сильный, раздражаюсь когда голоден' } },
      { dosha: 'Kapha', label: { en: 'Steady, can skip meals easily',      ru: 'Стабильный, легко пропускаю приёмы пищи' } }
    ]
  },
  {
    id: 'sleep',
    question: { en: 'How do you sleep?', ru: 'Как вы спите?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Light, easily disturbed, insomnia',  ru: 'Лёгкий, легко нарушается, бессонница' } },
      { dosha: 'Pitta', label: { en: 'Moderate, wake up at night',         ru: 'Умеренный, просыпаюсь ночью' } },
      { dosha: 'Kapha', label: { en: 'Deep, heavy, hard to wake up',       ru: 'Глубокий, тяжёлый, сложно проснуться' } }
    ]
  },
  {
    id: 'mind_quality',
    question: { en: 'How does your mind work?', ru: 'Как работает ваш ум?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Quick, restless, many ideas',        ru: 'Быстрый, беспокойный, много идей' } },
      { dosha: 'Pitta', label: { en: 'Sharp, focused, analytical',         ru: 'Острый, сфокусированный, аналитический' } },
      { dosha: 'Kapha', label: { en: 'Calm, steady, methodical',           ru: 'Спокойный, устойчивый, методичный' } }
    ]
  },
  {
    id: 'stress_response',
    question: { en: 'How do you react to stress?', ru: 'Как вы реагируете на стресс?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Anxiety, worry, fear',               ru: 'Тревога, беспокойство, страх' } },
      { dosha: 'Pitta', label: { en: 'Anger, irritation, frustration',     ru: 'Гнев, раздражение, фрустрация' } },
      { dosha: 'Kapha', label: { en: 'Withdrawal, avoidance, denial',      ru: 'Замкнутость, избегание, отрицание' } }
    ]
  },
  {
    id: 'digestion',
    question: { en: 'How is your digestion?', ru: 'Как ваше пищеварение?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Irregular, gas and bloating',        ru: 'Нерегулярное, газы и вздутие' } },
      { dosha: 'Pitta', label: { en: 'Strong, prone to acidity',           ru: 'Сильное, склонно к кислотности' } },
      { dosha: 'Kapha', label: { en: 'Slow but steady, heavy after meals', ru: 'Медленное но стабильное, тяжесть после еды' } }
    ]
  },
  {
    id: 'energy_level',
    question: { en: 'How is your energy throughout the day?', ru: 'Как ваша энергия в течение дня?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Bursts of energy, then fatigue',     ru: 'Всплески энергии, затем усталость' } },
      { dosha: 'Pitta', label: { en: 'High, sustained, goal-driven',       ru: 'Высокая, устойчивая, целеустремлённая' } },
      { dosha: 'Kapha', label: { en: 'Slow start, steady, endurance',      ru: 'Медленный старт, стабильная, выносливость' } }
    ]
  },
  {
    id: 'emotions',
    question: { en: 'What emotions are most familiar?', ru: 'Какие эмоции вам наиболее знакомы?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Enthusiasm and fear',                ru: 'Восторг и страх' } },
      { dosha: 'Pitta', label: { en: 'Determination and anger',            ru: 'Решимость и гнев' } },
      { dosha: 'Kapha', label: { en: 'Contentment and attachment',         ru: 'Удовлетворённость и привязанность' } }
    ]
  },
  {
    id: 'physical_activity',
    question: { en: 'What type of physical activity do you prefer?', ru: 'Какой тип физической активности вы предпочитаете?' },
    options: [
      { dosha: 'Vata',  label: { en: 'Yoga, dance, walking',               ru: 'Йога, танцы, прогулки' } },
      { dosha: 'Pitta', label: { en: 'Competitive sports, intense workouts',ru: 'Соревновательный спорт, интенсивные тренировки' } },
      { dosha: 'Kapha', label: { en: 'Swimming, hiking, slow pace',        ru: 'Плавание, пешие прогулки, размеренный темп' } }
    ]
  }
];

/**
 * Calculate dosha from quiz answers.
 * @param {Object} answers - Map of question id to selected dosha string
 * @returns {Object} dosha result
 */
export function calculateDoshaFromQuiz(answers) {
  const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
  for (const [questionId, dosha] of Object.entries(answers)) {
    if (scores[dosha] !== undefined) {
      scores[dosha] += 1;
    }
  }
  return buildDoshaResult(scores);
}

// Build standardized result from scores
function buildDoshaResult(scores) {
  const total = scores.Vata + scores.Pitta + scores.Kapha;
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  // Dual dosha if top two are within 2 points
  const isDual = (sorted[0][1] - sorted[1][1]) <= 2 && total > 0;
  const doshaType = isDual ? primary + '-' + secondary : primary;

  return {
    primary: primary,
    primary_name: DOSHA_NAMES[primary],
    secondary: secondary,
    secondary_name: DOSHA_NAMES[secondary],
    isDual: isDual,
    doshaType: doshaType,
    scores: { ...scores },
    percentages: {
      Vata:  total > 0 ? Math.round(scores.Vata / total * 100) : 0,
      Pitta: total > 0 ? Math.round(scores.Pitta / total * 100) : 0,
      Kapha: total > 0 ? Math.round(scores.Kapha / total * 100) : 0
    }
  };
}

export { DOSHA_NAMES, ELEMENT_DOSHA, PLANET_DOSHA, SIGN_DOSHA };
