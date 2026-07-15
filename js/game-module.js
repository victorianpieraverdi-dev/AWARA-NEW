// =============================================
// AWARA — Game Logic Module
// ES6 module — логика разделов ИГРА
// 4 пространства: Пространства, Земля, Вселенная, Мироздание
// =============================================

import { CANON, TIMINGS, COLORS } from './core-module.js';
import { loadState, updateState, addLight } from './state-module.js';
import { 
  showToast, showModal, fadeIn, fadeOut,
  isMobile, vibrate, debounce
} from './ui-module.js';
import { 
  loadAgents, loadMatrices, loadLocas,
  getAgentById 
} from './canon-module.js';

// === Определения пространств ===
export const SPACES = [
  {
    id: 'spaces',
    name: 'ПРОСТРАНСТВА',
    description: 'Пространство инициации души',
    symbol: '◯',
    order: 1
  },
  {
    id: 'earth',
    name: 'ЗЕМЛЯ',
    description: 'Земля игрока (Васту-храм)',
    symbol: '▽',
    order: 2
  },
  {
    id: 'universe',
    name: 'ВСЕЛЕННАЯ',
    description: 'Космос игрока (агенты и матрицы)',
    symbol: '✦',
    order: 3
  },
  {
    id: 'creation',
    name: 'МИРОЗДАНИЕ',
    description: 'Игра мироздания',
    symbol: '⬡',
    order: 4
  }
];

// === Состояние game-модуля ===
let gameState = {
  initialized: false,
  currentSpace: null,
  agents: null,
  matrices: null,
  locas: null,
  transitionActive: false
};

// === Инициализация game-модуля ===
export async function initGame() {
  if (gameState.initialized) {
    console.log('[Game] Уже инициализировано');
    return gameState;
  }
  
  console.log('[Game] Инициализация...');
  const start = Date.now();
  
  try {
    // Параллельная загрузка данных
    const [agents, matrices, locas] = await Promise.all([
      loadAgents(),
      loadMatrices(),
      loadLocas()
    ]);
    
    gameState.agents = agents;
    gameState.matrices = matrices;
    gameState.locas = locas;
    
    // Слушаем эвенты переходов из lobby-module
    window.addEventListener('awara:section', handleSectionEvent);
    
    gameState.initialized = true;
    const elapsed = Date.now() - start;
    console.log(`[Game] Готово за ${elapsed}мс. Канон: ${agents?.length}/${matrices?.length}/${locas?.length}`);
    
    return gameState;
  } catch (e) {
    console.error('[Game] Ошибка инициализации:', e);
    return null;
  }
}

// === Обработка эвента section из lobby ===
function handleSectionEvent(event) {
  const section = event.detail?.section;
  if (!section) return;
  
  console.log('[Game] Получен section эвент:', section);
  
  // Если это game-section — переключаемся
  if (section === 'game') {
    showGameMenu();
  }
  
  // Если это конкретное пространство — открываем его
  const space = SPACES.find(s => s.id === section);
  if (space) {
    openSpace(space.id);
  }
}

// === Показать меню выбора пространства ===
export function showGameMenu() {
  console.log('[Game] Показать меню ИГРА');
  
  const content = `
    <div style="display: grid; gap: 12px; margin-top: 16px;">
      ${SPACES.map(space => `
        <button 
          class="space-btn" 
          data-space-id="${space.id}"
          style="
            padding: 16px;
            background: transparent;
            border: 1px solid #c9a84c;
            color: #ffd700;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Cinzel', serif;
            text-align: left;
            transition: all 0.3s ease;
          "
        >
          <div style="font-size: 1.4em; color: #ffd700;">${space.symbol} ${space.name}</div>
          <div style="font-size: 0.85em; color: #c9a84c; margin-top: 4px; font-family: 'Cormorant Garamond', serif;">
            ${space.description}
          </div>
        </button>
      `).join('')}
    </div>
  `;
  
  const modal = showModal({
    title: 'Игровые Пространства',
    content
  });
  
  // Привязываем клики к кнопкам пространств
  setTimeout(() => {
    document.querySelectorAll('.space-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const spaceId = btn.dataset.spaceId;
        modal.close();
        setTimeout(() => openSpace(spaceId), TIMINGS.NORMAL);
      });
    });
  }, 50);
}

// === Открыть конкретное пространство ===
export async function openSpace(spaceId) {
  if (gameState.transitionActive) {
    console.log('[Game] Переход уже идёт');
    return;
  }
  
  const space = SPACES.find(s => s.id === spaceId);
  if (!space) {
    console.warn('[Game] Неизвестное пространство:', spaceId);
    return;
  }
  
  console.log('[Game] Открываю пространство:', space.name);
  gameState.transitionActive = true;
  gameState.currentSpace = space;
  
  if (isMobile()) vibrate([30, 20, 30]);
  
  // Эвент для других модулей
  window.dispatchEvent(new CustomEvent('awara:space:enter', {
    detail: { space, previousSpace: gameState.currentSpace }
  }));
  
  // Открываем контент пространства
  switch (spaceId) {
    case 'spaces':
      showSpacesScreen();
      break;
    case 'earth':
      showEarthScreen();
      break;
    case 'universe':
      showUniverseScreen();
      break;
    case 'creation':
      showCreationScreen();
      break;
  }
  
  setTimeout(() => {
    gameState.transitionActive = false;
  }, TIMINGS.SLOW);
}

// === Экран ПРОСТРАНСТВА (инициация) ===
function showSpacesScreen() {
  const locasCount = gameState.locas?.length || 0;
  
  const content = `
    <p style="line-height: 1.8;">
      Пространство инициации души.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      Здесь начинается путь от Кали Юги к Сатья Юге через 13 уровней посвящения.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      <b style="color: #ffd700;">14 Лок:</b> ${locasCount} загружено
    </p>
    <div style="margin-top: 20px; padding: 12px; background: rgba(201,168,76,0.1); border-radius: 8px;">
      <small style="color: #c9a84c; font-style: italic;">
        Полная карта инициации будет добавлена в следующих обновлениях.
      </small>
    </div>
  `;
  
  showModal({ title: '◯ Пространства', content });
}

// === Экран ЗЕМЛЯ ИГРОКА ===
function showEarthScreen() {
  const state = loadState();
  const earthLight = state.earthLight || 0;
  
  const content = `
    <p style="line-height: 1.8;">
      Земля игрока — твой Васту-храм.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      8 направлений, 9 секторов, дом души.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      <b style="color: #ffd700;">Накопленный свет земли:</b> ${earthLight}
    </p>
    <div style="margin-top: 20px; padding: 12px; background: rgba(201,168,76,0.1); border-radius: 8px;">
      <small style="color: #c9a84c; font-style: italic;">
        3D-визуализация Васту-храма будет добавлена в T-064.
      </small>
    </div>
  `;
  
  showModal({ title: '▽ Земля Игрока', content });
}

// === Экран ВСЕЛЕННАЯ (космос) ===
function showUniverseScreen() {
  const agentsCount = gameState.agents?.length || 0;
  const matricesCount = gameState.matrices?.length || 0;
  const state = loadState();
  
  const content = `
    <p style="line-height: 1.8;">
      Вселенная игрока — космос агентов и матриц.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      <b style="color: #ffd700;">${CANON.AGENTS_COUNT} Космических Агентов</b> на орбитах вокруг Солнца РА.
    </p>
    <p style="line-height: 1.8;">
      <b style="color: #ffd700;">${CANON.MATRICES_COUNT} Матриц</b> восприятия мира.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      <b>Твой агент:</b> ${state.agent || 'Не выбран'}<br>
      <b>Твоя матрица:</b> ${state.matrix || 'Не выбрана'}
    </p>
    <div style="margin-top: 16px; padding: 12px; background: rgba(201,168,76,0.1); border-radius: 8px;">
      <small style="color: #c9a84c;">
        Загружено: ${agentsCount}/21 агентов, ${matricesCount}/33 матриц
      </small>
    </div>
  `;
  
  showModal({ title: '✦ Вселенная', content });
}

// === Экран МИРОЗДАНИЕ ===
function showCreationScreen() {
  const content = `
    <p style="line-height: 1.8;">
      Игра Мироздания — финальный уровень.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      Здесь игрок создаёт свою собственную игру для других душ.
    </p>
    <p style="line-height: 1.8; margin-top: 12px;">
      <b style="color: #ffd700;">Доступ открывается на ранге БУДДА (25000 света).</b>
    </p>
    <div style="margin-top: 20px; padding: 12px; background: rgba(201,168,76,0.1); border-radius: 8px;">
      <small style="color: #c9a84c; font-style: italic;">
        Конструктор игр будет добавлен после T-072.
      </small>
    </div>
  `;
  
  showModal({ title: '⬡ Мироздание', content });
}

// === Получить текущее пространство ===
export function getCurrentSpace() {
  return gameState.currentSpace;
}

// === Получить все пространства ===
export function getAllSpaces() {
  return [...SPACES];
}

// === Получить состояние game-модуля ===
export function getGameState() {
  return { ...gameState };
}

// === Сброс state ===
export function resetGameState() {
  window.removeEventListener('awara:section', handleSectionEvent);
  gameState = {
    initialized: false,
    currentSpace: null,
    agents: null,
    matrices: null,
    locas: null,
    transitionActive: false
  };
  console.log('[Game] State сброшен');
}
