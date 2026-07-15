// =============================================
// AWARA — UI Helpers Module
// ES6 module — modals, animations, breakpoints
// =============================================

import { BREAKPOINTS, TIMINGS, COLORS } from './core-module.js';

// === Форматирование света ===
export function formatLight(raw) {
  if (typeof raw !== 'number') return '0.0000000000';
  return (raw / 1e10).toFixed(10);
}

// === Форматирование процентов ===
export function formatPercent(value, total) {
  if (!total) return '0%';
  return Math.round((value / total) * 100) + '%';
}

// === Форматирование больших чисел ===
export function formatBigNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1e6) return (num / 1000).toFixed(1) + 'K';
  if (num < 1e9) return (num / 1e6).toFixed(1) + 'M';
  return (num / 1e9).toFixed(1) + 'B';
}

// === Модальные окна ===
export function showModal({ title = '', content = '', onClose = null } = {}) {
  // Удаляем существующие модалки
  const existing = document.querySelector('.awara-modal-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'awara-modal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity ${TIMINGS.NORMAL}ms ease;
  `;
  
  const modal = document.createElement('div');
  modal.className = 'awara-modal';
  modal.style.cssText = `
    background: ${COLORS.BG_DARK};
    border: 1px solid ${COLORS.GOLD_PRIMARY};
    border-radius: 12px;
    padding: 24px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    color: ${COLORS.GOLD_PRIMARY};
  `;
  
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title;
    h.style.cssText = `
      color: ${COLORS.GOLD_BRIGHT};
      margin-bottom: 16px;
      font-family: 'Cinzel', serif;
    `;
    modal.appendChild(h);
  }
  
  const body = document.createElement('div');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  modal.appendChild(body);
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Закрыть';
  closeBtn.style.cssText = `
    margin-top: 16px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid ${COLORS.GOLD_PRIMARY};
    color: ${COLORS.GOLD_BRIGHT};
    cursor: pointer;
    font-family: 'Cinzel', serif;
    text-transform: uppercase;
  `;
  
  const close = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, TIMINGS.NORMAL);
  };
  
  closeBtn.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
  
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Анимация появления
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
  
  return { close, overlay, modal };
}

// === Анимация fade in ===
export function fadeIn(element, duration = TIMINGS.NORMAL) {
  if (!element) return Promise.resolve();
  return new Promise(resolve => {
    element.style.opacity = '0';
    element.style.display = '';
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  });
}

// === Анимация fade out ===
export function fadeOut(element, duration = TIMINGS.NORMAL) {
  if (!element) return Promise.resolve();
  return new Promise(resolve => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

// === Вибрация (только на поддерживающих устройствах) ===
export function vibrate(pattern = [50]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

// === Текущий breakpoint ===
export function getCurrentBreakpoint() {
  const w = window.innerWidth;
  if (w < BREAKPOINTS.MOBILE) return 'xs';
  if (w < BREAKPOINTS.TABLET) return 'mobile';
  if (w < BREAKPOINTS.DESKTOP) return 'tablet';
  return 'desktop';
}

// === Проверка mobile ===
export function isMobile() {
  return window.innerWidth < BREAKPOINTS.TABLET;
}

// === Toast уведомление ===
export function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'awara-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: ${COLORS.BG_DARK};
    border: 1px solid ${COLORS.GOLD_PRIMARY};
    color: ${COLORS.GOLD_BRIGHT};
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
    opacity: 0;
    transition: opacity ${TIMINGS.NORMAL}ms ease;
    font-family: 'Cinzel', serif;
    max-width: 90vw;
  `;
  
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), TIMINGS.NORMAL);
  }, duration);
}

// === Дебаунс ===
export function debounce(fn, delay = TIMINGS.FAST) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === Throttle ===
export function throttle(fn, limit = TIMINGS.FAST) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
