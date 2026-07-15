// =============================================
// AWARA — Universe (Cosmos) Module
// ES6 module — космическая визуализация
// Canvas 2D: Солнце РА + 21 агент на орбитах + звёзды
// =============================================

import { CANON, COLORS, TIMINGS } from './core-module.js';
import { loadState, updateState } from './state-module.js';
import { showToast, showModal, isMobile, vibrate } from './ui-module.js';
import { loadAgents, loadMatrices, getAgentById } from './canon-module.js';

// === Конфигурация визуализации ===
const UNIVERSE_CONFIG = {
  sunRadius: 40,
  agentRadius: 8,
  orbitRings: 3,
  starsCount: 200,
  rotationSpeed: 0.0005,
  pulseSpeed: 2000
};

// === Состояние модуля ===
let universeState = {
  initialized: false,
  canvas: null,
  ctx: null,
  agents: null,
  stars: [],
  animationId: null,
  time: 0,
  selectedAgent: null
};

// === Инициализация визуализации ===
export async function initUniverse(canvasElement) {
  if (!canvasElement) {
    console.error('[Universe] Canvas элемент не передан');
    return null;
  }
  
  console.log('[Universe] Инициализация...');
  const start = Date.now();
  
  universeState.canvas = canvasElement;
  universeState.ctx = canvasElement.getContext('2d');
  
  // Загружаем агентов
  universeState.agents = await loadAgents();
  
  if (!universeState.agents || universeState.agents.length !== CANON.AGENTS_COUNT) {
    console.error(`[Universe] КАНОН: ожидалось ${CANON.AGENTS_COUNT} агентов`);
  }
  
  // Генерируем звёзды
  generateStars();
  
  // Настраиваем размер canvas
  resizeCanvas();
  window.addEventListener('resize', debouncedResize);
  
  // Привязываем клики
  canvasElement.addEventListener('click', handleCanvasClick);
  
  // Запускаем анимацию
  startAnimation();
  
  universeState.initialized = true;
  const elapsed = Date.now() - start;
  console.log(`[Universe] Готово за ${elapsed}мс`);
  
  return universeState;
}

// === Установка размера canvas ===
function resizeCanvas() {
  if (!universeState.canvas) return;
  const parent = universeState.canvas.parentElement;
  const size = Math.min(parent.clientWidth, parent.clientHeight || window.innerHeight - 100);
  universeState.canvas.width = size;
  universeState.canvas.height = size;
}

const debouncedResize = (() => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(resizeCanvas, 200);
  };
})();

// === Генерация звёзд ===
function generateStars() {
  universeState.stars = [];
  for (let i = 0; i < UNIVERSE_CONFIG.starsCount; i++) {
    universeState.stars.push({
      x: Math.random(),
      y: Math.random(),
      brightness: Math.random(),
      pulseOffset: Math.random() * Math.PI * 2
    });
  }
}

// === Получение позиции агента на орбите ===
function getAgentPosition(agentIndex, time) {
  const cx = universeState.canvas.width / 2;
  const cy = universeState.canvas.height / 2;
  const maxRadius = Math.min(cx, cy) - 20;
  
  // Распределение по 3 кольцам
  const ring = agentIndex % UNIVERSE_CONFIG.orbitRings;
  const ringRadius = maxRadius * (0.4 + ring * 0.25);
  
  // Угол с учётом времени
  const agentsPerRing = Math.ceil(CANON.AGENTS_COUNT / UNIVERSE_CONFIG.orbitRings);
  const baseAngle = (agentIndex % agentsPerRing) * (Math.PI * 2 / agentsPerRing);
  const speed = UNIVERSE_CONFIG.rotationSpeed * (1 + ring * 0.3);
  const angle = baseAngle + time * speed;
  
  return {
    x: cx + Math.cos(angle) * ringRadius,
    y: cy + Math.sin(angle) * ringRadius,
    ring,
    angle
  };
}

// === Отрисовка кадра ===
function render(time) {
  if (!universeState.ctx) return;
  const ctx = universeState.ctx;
  const w = universeState.canvas.width;
  const h = universeState.canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  
  universeState.time = time;
  
  // Фон
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  
  // Звёзды
  universeState.stars.forEach(star => {
    const pulse = (Math.sin(time / 1000 + star.pulseOffset) + 1) / 2;
    const brightness = star.brightness * 0.5 + pulse * 0.5;
    ctx.fillStyle = `rgba(255, 248, 214, ${brightness * 0.6})`;
    ctx.beginPath();
    ctx.arc(star.x * w, star.y * h, 1, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Орбитальные кольца
  for (let i = 0; i < UNIVERSE_CONFIG.orbitRings; i++) {
    const maxRadius = Math.min(cx, cy) - 20;
    const ringRadius = maxRadius * (0.4 + i * 0.25);
    ctx.strokeStyle = `rgba(201, 168, 76, ${0.15 + i * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Центральное Солнце РА (с пульсацией)
  const sunPulse = Math.sin(time / UNIVERSE_CONFIG.pulseSpeed) * 0.1 + 1;
  const sunRadius = UNIVERSE_CONFIG.sunRadius * sunPulse;
  
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * 1.5);
  gradient.addColorStop(0, '#fff8d6');
  gradient.addColorStop(0.5, '#ffd700');
  gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, sunRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(cx, cy, sunRadius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  // Агенты на орбитах
  if (universeState.agents) {
    universeState.agents.forEach((agent, i) => {
      const pos = getAgentPosition(i, time);
      const isSelected = universeState.selectedAgent === i;
      const pulse = Math.sin(time / 800 + i) * 0.2 + 1;
      const radius = UNIVERSE_CONFIG.agentRadius * pulse * (isSelected ? 1.5 : 1);
      
      // Свечение
      const agentGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
      agentGradient.addColorStop(0, isSelected ? '#ffd700' : '#c9a84c');
      agentGradient.addColorStop(1, 'rgba(201, 168, 76, 0)');
      ctx.fillStyle = agentGradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Тело агента
      ctx.fillStyle = isSelected ? '#fff8d6' : '#ffd700';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Подпись (только для выбранного)
      if (isSelected && agent.name) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, pos.x, pos.y - radius - 8);
      }
    });
  }
  
  // Метка "СВЕТ РА"
  ctx.fillStyle = '#fff8d6';
  ctx.font = '10px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('СВЕТ РА', cx, cy + sunRadius + 15);
}

// === Запуск анимации ===
function startAnimation() {
  if (universeState.animationId) {
    cancelAnimationFrame(universeState.animationId);
  }
  
  const animate = (time) => {
    render(time);
    universeState.animationId = requestAnimationFrame(animate);
  };
  
  animate(0);
  console.log('[Universe] Анимация запущена');
}

// === Остановка анимации ===
export function stopUniverseAnimation() {
  if (universeState.animationId) {
    cancelAnimationFrame(universeState.animationId);
    universeState.animationId = null;
    console.log('[Universe] Анимация остановлена');
  }
}

// === Обработка кликов по canvas ===
function handleCanvasClick(event) {
  if (!universeState.canvas || !universeState.agents) return;
  
  const rect = universeState.canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  // Проверяем попадание в агента
  let clickedIndex = -1;
  universeState.agents.forEach((agent, i) => {
    const pos = getAgentPosition(i, universeState.time);
    const dx = pos.x - clickX;
    const dy = pos.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < UNIVERSE_CONFIG.agentRadius * 2) {
      clickedIndex = i;
    }
  });
  
  if (clickedIndex >= 0) {
    selectAgent(clickedIndex);
  } else {
    universeState.selectedAgent = null;
  }
}

// === Выбор агента ===
export async function selectAgent(index) {
  if (!universeState.agents || index < 0 || index >= universeState.agents.length) {
    return null;
  }
  
  universeState.selectedAgent = index;
  const agent = universeState.agents[index];
  
  if (isMobile()) vibrate([30]);
  
  // Показываем информацию об агенте
  showAgentInfo(agent);
  
  return agent;
}

// === Показать информацию об агенте ===
function showAgentInfo(agent) {
  const content = `
    <div style="line-height: 1.8;">
      <p><b style="color: #ffd700;">Имя:</b> ${agent.name || agent.id}</p>
      ${agent.symbol ? `<p><b style="color: #ffd700;">Символ:</b> ${agent.symbol}</p>` : ''}
      ${agent.element ? `<p><b style="color: #ffd700;">Стихия:</b> ${agent.element}</p>` : ''}
      ${agent.description ? `<p style="margin-top: 12px; font-style: italic;">${agent.description}</p>` : ''}
    </div>
  `;
  
  showModal({
    title: agent.name || 'Агент',
    content
  });
}

// === Получить состояние ===
export function getUniverseState() {
  return {
    initialized: universeState.initialized,
    agentsCount: universeState.agents?.length || 0,
    selectedAgent: universeState.selectedAgent,
    canvasSize: universeState.canvas 
      ? { w: universeState.canvas.width, h: universeState.canvas.height }
      : null
  };
}

// === Сброс ===
export function resetUniverse() {
  stopUniverseAnimation();
  window.removeEventListener('resize', debouncedResize);
  if (universeState.canvas) {
    universeState.canvas.removeEventListener('click', handleCanvasClick);
  }
  universeState = {
    initialized: false,
    canvas: null,
    ctx: null,
    agents: null,
    stars: [],
    animationId: null,
    time: 0,
    selectedAgent: null
  };
  console.log('[Universe] Сброс выполнен');
}
