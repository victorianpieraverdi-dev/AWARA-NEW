export const UNIVERSE_LEVELS = [
  {
    id: 'ahamkara',
    order: 1,
    name: 'Ахамкара',
    subtitle: 'Ум · культура · ключи',
    minLight: 0,
    color: '#c9a84c',
    icon: '✧',
    focus: 'Развитие пространства ума через книги, культуры, истории, матрицы и ежедневные ключи.',
    gameplay: 'daily key → cultural lens → question → reflection → light → simple card chance',
    unlocks: ['daily_keys', 'culture_lenses', 'simple_cards', 'ahamkara_prompts'],
    cardDepth: 'simple',
    generationLayers: ['ahamkara']
  },
  {
    id: 'soul',
    order: 2,
    name: 'Душа',
    subtitle: 'Тело · чувство · восприятие',
    minLight: 500,
    color: '#f4a7ff',
    icon: '♡',
    focus: 'Переход от знания к чувствованию: тело, сердце, живот, меридианы, внутренние состояния и намерения.',
    gameplay: 'tigel entry → sensing analysis → soul state → light → embodied task → crystallized card',
    unlocks: ['soul_prompts', 'body_practices', 'feeling_diary', 'embodied_tasks'],
    cardDepth: 'embodied',
    generationLayers: ['ahamkara', 'soul']
  },
  {
    id: 'jiva',
    order: 3,
    name: 'Джива',
    subtitle: 'Земля · храм · пространство',
    minLight: 2000,
    color: '#7dd3fc',
    icon: '◇',
    focus: 'Создание космического дома: алтарь, звёздный храм, Васту-зоны, стороны света, стихии и связь с планетой.',
    gameplay: 'soul maturity → spatial map → vastu zones → buildings → planetary connection → stronger light field',
    unlocks: ['earth_map', 'vastu_zones', 'star_temple', 'space_cards'],
    cardDepth: 'spatial',
    generationLayers: ['ahamkara', 'soul', 'jiva']
  },
  {
    id: 'spirit',
    order: 4,
    name: 'Дух',
    subtitle: 'Космос · род · служение',
    minLight: 7000,
    color: '#ffd700',
    icon: '☀',
    focus: 'Космическая индивидуальность: дом, род, земля, служение, ответственность и связь с планетарным логосом.',
    gameplay: 'star temple → house / land / lineage → service projects → alliances → cosmic responsibility',
    unlocks: ['cosmos_map', 'lineage_paths', 'service_projects', 'alliance_keys'],
    cardDepth: 'cosmic',
    generationLayers: ['ahamkara', 'soul', 'jiva', 'spirit']
  },
  {
    id: 'sobor',
    order: 5,
    name: 'Собор',
    subtitle: 'Локи · соборы · творцы',
    minLight: 25000,
    color: '#a78bfa',
    icon: '✦',
    focus: 'Высшая архитектура: фестивали, соборы, локи, галактические структуры и взаимодействие с творцами реальности.',
    gameplay: 'service maturity → higher lokas → sobor architecture → creator contact → board-game scale',
    unlocks: ['higher_lokas', 'sobor_architecture', 'festival_paths', 'mythic_cards'],
    cardDepth: 'mythic',
    generationLayers: ['ahamkara', 'soul', 'jiva', 'spirit', 'sobor']
  },
  {
    id: 'board',
    order: 6,
    name: 'Игра Мироздания',
    subtitle: 'Настольная игра · весь путь сверху',
    minLight: 100000,
    color: '#ffffff',
    icon: '◎',
    focus: 'Верхний слой, где все матрицы, агенты, карты, квесты, локи, союзы и светообмен становятся единой картой игры.',
    gameplay: 'full cosmology → board view → collective quests → light exchange → divine play',
    unlocks: ['board_view', 'all_matrix_paths', 'collective_game', 'light_exchange'],
    cardDepth: 'divine',
    generationLayers: ['ahamkara', 'soul', 'jiva', 'spirit', 'sobor', 'board']
  }
];

export function getUniverseLevelByLight(light) {
  const value = Number.isFinite(Number(light)) ? Number(light) : 0;
  let current = UNIVERSE_LEVELS[0];
  for (let i = 0; i < UNIVERSE_LEVELS.length; i += 1) {
    if (value >= UNIVERSE_LEVELS[i].minLight) current = UNIVERSE_LEVELS[i];
  }
  return current;
}

export function getNextUniverseLevel(light) {
  const current = getUniverseLevelByLight(light);
  return UNIVERSE_LEVELS.find(function(level) {
    return level.order === current.order + 1;
  }) || null;
}

export function getUniverseProgress(light) {
  const value = Math.max(0, Number.isFinite(Number(light)) ? Number(light) : 0);
  const current = getUniverseLevelByLight(value);
  const next = getNextUniverseLevel(value);

  if (!next) {
    return {
      current: current,
      next: null,
      progress: 100,
      light: value,
      lightIntoLevel: value - current.minLight,
      lightToNext: 0
    };
  }

  const span = Math.max(1, next.minLight - current.minLight);
  const lightIntoLevel = Math.max(0, value - current.minLight);
  const progress = Math.max(0, Math.min(100, Math.round((lightIntoLevel / span) * 100)));

  return {
    current: current,
    next: next,
    progress: progress,
    light: value,
    lightIntoLevel: lightIntoLevel,
    lightToNext: Math.max(0, next.minLight - value)
  };
}

export function getUnlockedUniverseLevels(light) {
  const value = Math.max(0, Number.isFinite(Number(light)) ? Number(light) : 0);
  return UNIVERSE_LEVELS.filter(function(level) {
    return value >= level.minLight;
  });
}

export function getGenerationLayers(light) {
  return getUniverseLevelByLight(light).generationLayers.slice();
}

export function getUniverseCardDepth(light) {
  return getUniverseLevelByLight(light).cardDepth;
}

export function createUniverseSnapshot(playerState) {
  const state = playerState || {};
  const light = Number(state.totalLight || 0);
  const progress = getUniverseProgress(light);

  return {
    light: light,
    level: progress.current,
    nextLevel: progress.next,
    progress: progress.progress,
    lightToNext: progress.lightToNext,
    unlockedLevels: getUnlockedUniverseLevels(light),
    generationLayers: getGenerationLayers(light),
    cardDepth: getUniverseCardDepth(light),
    activeSystem: state.activeSystem || 'Ведическая',
    sphereData: state.sphereData || {},
    cauldron: state.cauldron || {},
    journey: state.journey || []
  };
}
