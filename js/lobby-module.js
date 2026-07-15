// =============================================
// AWARA — Lobby Logic Module
// ES6 module — главная страница (лобби)
// =============================================

import { STAGES, CANON, COLORS, TIMINGS } from './core-module.js';
import { 
  loadState, getLight, addLight, updateState, 
  getLevel, setLevel 
} from './state-module.js';
import { 
  formatLight, showToast, showModal, fadeIn, fadeOut,
  getCurrentBreakpoint, isMobile, debounce, vibrate
} from './ui-module.js';
import { preloadCanon, getAgentById, getMatrixById } from './canon-module.js';

// === Состояние лобби ===
let lobbyState = {
  initialized: false,
  canon: null,
  userState: null,
  sunAnimationActive: false
};

// === Инициализация лобби ===
export async function initLobby() {
  if (lobbyState.initialized) {
    console.log('[Lobby] Уже инициализировано');
    return lobbyState;
  }
  
  console.log('[Lobby] Инициализация...');
  const start = Date.now();
  
  try {
    // Загружаем канон (21/33/14/9/693)
    lobbyState.canon = await preloadCanon();
    
    // Загружаем состояние пользователя
    lobbyState.userState = loadState();
    
    // Обновляем UI элементы
    updateLightCounter();
    updateLevelDisplay();
    updateAgentDisplay();
    
    // Привязываем обработчики
    attachSectionListeners();
    attachResizeListener();
    
    // Запускаем анимации
    startSunBreathing();
    
    // Отмечаем последний визит
    updateState({ lastVisit: Date.now() });
    
    lobbyState.initialized = true;
    const elapsed = Date.now() - start;
    console.log(`[Lobby] Готово за ${elapsed}мс`);
    
    return lobbyState;
  } catch (e) {
    console.error('[Lobby] Ошибка инициализации:', e);
    return null;
  }
}

// === Обновление счётчика света ===
export function updateLightCounter() {
  const counters = document.querySelectorAll('[data-light-counter]');
  if (counters.length === 0) return;
  
  const light = getLight();
  const formatted = formatLight(light);
  
  counters.forEach(el => {
    el.textContent = formatted;
  });
}

// === Обновление отображения уровня ===
export function updateLevelDisplay() {
  const levelEls = document.querySelectorAll('[data-level-name]');
  if (levelEls.length === 0) return;
  
  const state = loadState();
  const light = state.totalLight || 0;
  
  // Найти текущий ранг по STAGES
  let currentStage = STAGES[0];
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (light >= STAGES[i].threshold) {
      currentStage = STAGES[i];
      break;
    }
  }
  
  levelEls.forEach(el => {
    el.textContent = currentStage.name;
  });
  
  // Обновляем ID уровня в state если изменился
  if (state.level !== currentStage.id) {
    setLevel(currentStage.id);
  }
}

// === Обновление отображения агента ===
export function updateAgentDisplay() {
  const agentEls = document.querySelectorAll('[data-agent-name]');
  if (agentEls.length === 0) return;
  
  const state = loadState();
  const agentName = state.agent || 'Не выбран';
  
  agentEls.forEach(el => {
    el.textContent = agentName;
  });
}

// === Обработчики кликов по разделам ===
function attachSectionListeners() {
  const sections = document.querySelectorAll('[data-section]');
  sections.forEach(section => {
    section.addEventListener('click', handleSectionClick);
  });
  console.log(`[Lobby] Привязано ${sections.length} разделов`);
}

function handleSectionClick(event) {
  const section = event.currentTarget.dataset.section;
  if (!section) return;
  
  console.log('[Lobby] Переход в раздел:', section);
  
  // Вибрация на мобильных
  if (isMobile()) {
    vibrate([30]);
  }
  
  // Эвент для других модулей (game-module слушает)
  window.dispatchEvent(new CustomEvent('awara:section', { 
    detail: { section, source: 'lobby' } 
  }));
}

// === Анимация дыхания центрального солнца ===
function startSunBreathing() {
  const sun = document.querySelector('[data-central-sun]');
  if (!sun) {
    console.warn('[Lobby] Элемент [data-central-sun] не найден');
    return;
  }
  
  if (lobbyState.sunAnimationActive) return;
  
  sun.style.animation = `breath ${TIMINGS.BREATH}ms ease-in-out infinite`;
  lobbyState.sunAnimationActive = true;
  console.log('[Lobby] Солнце дышит');
}

// === Остановить анимацию солнца ===
export function stopSunBreathing() {
  const sun = document.querySelector('[data-central-sun]');
  if (sun) {
    sun.style.animation = '';
  }
  lobbyState.sunAnimationActive = false;
}

// === Добавить свет с анимацией и toast ===
export function addLightAnimated(amount, message = null) {
  if (typeof amount !== 'number' || amount < 0) {
    console.warn('[Lobby] Некорректное количество света:', amount);
    return null;
  }
  
  const newLight = addLight(amount);
  updateLightCounter();
  updateLevelDisplay();
  
  const text = message || `Светкоин: +${formatLight(amount * 1e10)}`;
  showToast(text);
  
  if (isMobile()) vibrate([50, 30, 50]);
  
  return newLight;
}

// === Показать паспорт души (модалка) ===
export async function showPassport() {
  const state = loadState();
  const canon = lobbyState.canon;
  
  if (!canon) {
    showToast('Канон ещё загружается...');
    return;
  }
  
  // Найти агента
  const agent = state.agent 
    ? await getAgentById(state.agent)
    : null;
  
  // Найти матрицу
  const matrix = state.matrix 
    ? await getMatrixById(state.matrix)
    : null;
  
  // Найти текущий ранг
  let currentStage = STAGES[0];
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if ((state.totalLight || 0) >= STAGES[i].threshold) {
      currentStage = STAGES[i];
      break;
    }
  }
  
  const content = `
    <div style="line-height: 1.8;">
      <p><b style="color: #ffd700;">Уровень:</b> ${currentStage.name}</p>
      <p><b style="color: #ffd700;">Свет:</b> ${formatLight(state.totalLight || 0)}</p>
      <p><b style="color: #ffd700;">Агент:</b> ${agent ? (agent.name || agent.id) : 'Не выбран'}</p>
      <p><b style="color: #ffd700;">Матрица:</b> ${matrix ? (matrix.name || matrix.id) : 'Не выбрана'}</p>
      <p><b style="color: #ffd700;">Записей в Тигле:</b> ${(state.tigelEntries || []).length}</p>
      <p><b style="color: #ffd700;">Ключей открыто:</b> ${(state.unlockedKeys || []).length}</p>
    </div>
  `;
  
  showModal({
    title: 'Паспорт Души',
    content
  });
}

// === Адаптация под breakpoint ===
const handleResize = debounce(() => {
  const bp = getCurrentBreakpoint();
  document.body.dataset.breakpoint = bp;
  console.log('[Lobby] Breakpoint:', bp, '|', window.innerWidth, 'px');
}, 200);

function attachResizeListener() {
  window.addEventListener('resize', handleResize);
  handleResize(); // initial
}

// === Сброс состояния лобби ===
export function resetLobbyState() {
  stopSunBreathing();
  lobbyState = {
    initialized: false,
    canon: null,
    userState: null,
    sunAnimationActive: false
  };
  console.log('[Lobby] Состояние сброшено');
}

// === Получить текущее состояние лобби ===
export function getLobbyState() {
  return { ...lobbyState };
}
