// =============================================
// AWARA — Menu Module (M-001)
// Структура меню «Золотое Яйцо»: 4 категории, уровни доступа
// =============================================

import { loadState } from './state-module.js';

// === 4 КАТЕГОРИИ МЕНЮ ===
export const MENU = {
  game: {
    id: 'game',
    icon: '🎮',
    label: 'ИГРА',
    description: 'практика и развитие',
    items: [
      { id: 'matrix', label: 'Матрицы', description: '33 восприятия мира', href: 'matrix.html', minLight: 0 },
      { id: 'maps', label: 'Карты', description: 'додекаэдр Земли · ведический космос',
        children: [
          { id: 'golden-egg-3d', label: 'Золотое Яйцо', description: 'Хираньягарбха · 4 слоя', href: 'egg-3d.html', minLight: 0 },
          { id: 'dodecahedron', label: 'Додекаэдр Земли', description: '62 узла · места силы', href: 'festivals.html', minLight: 0 },
          { id: 'vedic-cosmos', label: 'Ведическая Вселенная', description: '14 лок · Брахманда', href: 'vedic-cosmos.html', minLight: 0 },
          { id: 'aura-pole', label: 'Аура-Поле', description: '7 чакр · 7 тонких тел · 3D', href: 'aura-pole.html', minLight: 0 },
          { id: 'nine-measures', label: '9-Мерная Система', description: '9 мер · 3 группы · меркаба · 3D', href: 'nine-measures.html', minLight: 0 },
        ]
      },
      { id: 'levels', label: 'Уровни', description: 'путь души: инициация → земля → космос → суперигра',
        children: [
          { id: 'initiation-corridor', label: 'Коридор Инициации', description: '13 шагов · от Хаоса к Свету', href: 'initiation-corridor.html', minLight: 0 },
          { id: 'initiation-v2', label: 'Душа · Инициация v2', description: 'тёмная Душа · 3 сферы времени · Q&A', href: 'spheres-v2.html', minLight: 0 },
          { id: 'initiation', label: 'Инициация (Древняя · v1)', description: 'старое пространство · временно для сравнения', href: 'initiation-space.html', minLight: 0 },
          { id: 'earth', label: 'Земля Игрока', description: 'Васту-храм · стихии · постройки', href: 'earth-player.html', minLight: 0 },
          { id: 'universe', label: 'Вселенная (новая)', description: 'Canvas · агенты · орбиты', href: 'universe.html', minLight: 0 },
          { id: 'universe-old', label: 'Вселенная (старая)', description: 'зодиак · RA · оригинал', href: 'javascript:window.gsUniverseClick()', minLight: 0 },
          { id: 'creation', label: 'Супер Игра', description: 'Мироздание · карточная настолка', href: 'javascript:window.openGameSpaces()', minLight: 0 }
        ]
      },
      { id: 'tigel', label: 'Тигель', description: 'вечерний лог дня · ключи · алхимия', href: 'tigel.html', minLight: 0 },
      { id: 'quests', label: 'Квесты', description: 'культурные ключи · пыль · кейсы', href: 'javascript:window.openQuestSpace()', minLight: 0 }
    ]
  },
  chronicle: {
    id: 'chronicle',
    icon: '📜',
    label: 'ХРОНИКА',
    description: 'путь и коллекция',
    items: [
      { id: 'meaning', label: 'Смысл дня', description: 'ежедневное послание', href: 'javascript:window.openDailyMeaning()', minLight: 0 },
      { id: 'passport', label: 'Паспорт души', description: 'твой профиль', href: 'passport.html', minLight: 0 },
      { id: 'cards', label: 'Колода', description: '63 карты', href: 'cards.html', minLight: 0 },
      { id: 'natal', label: 'Натальная карта', description: 'звёздный код', href: 'natal.html', minLight: 0 },
      { id: 'tree', label: 'Древо пути', description: 'история роста', href: 'tree.html', minLight: 0 },
      { id: 'archetype', label: 'Архетип', description: 'кто ты', href: 'archetype.html', minLight: 0 }
    ]
  },
  exchange: {
    id: 'exchange',
    icon: '💫',
    label: 'ОБМЕН',
    description: 'энергия и ресурсы',
    items: [
      { id: 'svetcoin', label: 'Светкоин', description: 'баланс', href: 'dashboard.html', minLight: 0 },
      { id: 'milost', label: 'Милость', description: '7 источников', href: 'milost.html', minLight: 0 },
      { id: 'daimon', label: 'Даймон', description: 'хранитель', href: 'daimon.html', minLight: 0 },
      { id: 'dosha-quiz', label: 'Квиз доши', description: 'Vata/Pitta/Kapha', href: 'pages/dosha-quiz.html', minLight: 0 },
      { id: 'nutrition', label: 'Питание', description: 'аюрведа', href: 'pages/nutrition.html', minLight: 0 },
      { id: 'gen-image', label: 'Образ', description: 'генерация', href: 'pages/generate-image.html', minLight: 0 },
      { id: 'practice', label: 'Практика', description: 'ежедневная', href: 'pages/daily-practice.html', minLight: 0 },
      { id: 'artifacts', label: 'Артефакты', description: 'предметы силы', href: 'javascript:window.toggleNakopPanel()', minLight: 0 },
      { id: 'exchange', label: 'Светообмен', description: 'P2P свет', href: 'javascript:window.openMarketplace()', minLight: 0 }
    ]
  },
  social: {
    id: 'social',
    icon: '🌐',
    label: 'ОБЩЕНИЕ',
    description: 'связь и мир',
    items: [
      { id: 'oracle', label: 'Оракул', description: 'AI-советник', href: 'oracle.html', minLight: 0 },
      { id: 'chat', label: 'Чат матрицы', description: 'свои по духу', href: 'chat.html', minLight: 0 },
      { id: 'society', label: 'Социум', description: 'топ державы', href: 'society.html', minLight: 0 },
      { id: 'festivals', label: 'Фестивали', description: '62 узла силы', href: 'festivals.html', minLight: 0 }
    ]
  }
};

// === УРОВНИ ДОСТУПА (для отображения) ===
export const ACCESS_LEVELS = [
  { name: 'ИНИЦИАТ', minLight: 0 },
  { name: 'ВОИН СВЕТА', minLight: 3000 },
  { name: 'МУДРЕЦ', minLight: 7000 },
  { name: 'ЦАРЬ', minLight: 10000 },
  { name: 'БУДДА', minLight: 25000 },
  { name: 'ПЛАНЕТАРНЫЙ ЛОГОС', minLight: 50000 }
];

// === ПОЛУЧИТЬ ДОСТУПНЫЕ ЭКРАНЫ ===
export function getAccessibleItems(light) {
  const result = {};
  for (const [categoryId, category] of Object.entries(MENU)) {
    const accessible = category.items.filter(item => light >= item.minLight);
    if (accessible.length > 0) {
      result[categoryId] = {
        ...category,
        items: accessible
      };
    }
  }
  return result;
}

// === ПОЛУЧИТЬ ЗАКРЫТЫЕ ЭКРАНЫ ===
export function getLockedItems(light) {
  const locked = [];
  for (const [, category] of Object.entries(MENU)) {
    for (const item of category.items) {
      if (light < item.minLight) {
        locked.push({
          ...item,
          category: category.id,
          categoryLabel: category.label,
          requiredLevel: ACCESS_LEVELS.find(l => l.minLight >= item.minLight) || ACCESS_LEVELS[ACCESS_LEVELS.length - 1],
          lightNeeded: item.minLight - light
        });
      }
    }
  }
  return locked;
}

// === ПОЛУЧИТЬ ТЕКУЩИЙ УРОВЕНЬ ===
export function getCurrentLevel(light) {
  let level = ACCESS_LEVELS[0];
  for (const l of ACCESS_LEVELS) {
    if (light >= l.minLight) level = l;
  }
  return level;
}

// === ПОЛУЧИТЬ СЛЕДУЮЩИЙ УРОВЕНЬ ===
export function getNextLevel(light) {
  for (const l of ACCESS_LEVELS) {
    if (light < l.minLight) return l;
  }
  return null;
}

// === ПОЛУЧИТЬ ПОЛНОЕ СОСТОЯНИЕ МЕНЮ ===
export function getMenuState() {
  const state = loadState();
  const light = state.totalLight || 0;
  return {
    light,
    currentLevel: getCurrentLevel(light),
    nextLevel: getNextLevel(light),
    accessible: getAccessibleItems(light),
    locked: getLockedItems(light),
    categories: Object.keys(MENU)
  };
}
