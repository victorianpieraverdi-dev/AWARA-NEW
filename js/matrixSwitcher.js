/**
 * matrixSwitcher.js — быстрый переключатель 3 основных матриц восприятия
 *
 * Ведическая / Славянская / Каббалистическая
 *
 * Использование:
 *   import { getActivePerception, setActivePerception, PERCEPTIONS } from './js/matrixSwitcher.js';
 *   const current = getActivePerception(); // 'vedic' | 'slavic' | 'kabbalistic'
 *   setActivePerception('slavic');
 */

const STORAGE_KEY = 'awara_matrix';
const LEGACY_MATRIX_KEY = 'awara_active_matrix';

export const PERCEPTIONS = [
  {
    id: 'vedic',
    slug: 'vedic',
    label: 'ВЕДИЧЕСКАЯ',
    shortLabel: 'ВЕДА',
    icon: 'ॐ',
    color: '#ff8844',
    accent: 'rgba(255,160,40,0.85)',
    bgGlow: 'rgba(255,140,30,0.15)',
    border: 'rgba(255,160,40,0.5)',
    borderIdle: 'rgba(255,160,40,0.15)',
    desc: 'Спанда, мандалы, янтры'
  },
  {
    id: 'slavic',
    slug: 'slavic',
    label: 'СЛАВЯНСКАЯ',
    shortLabel: 'СЛАВЬ',
    icon: '🌞',
    color: '#ff6450',
    accent: 'rgba(255,100,80,0.85)',
    bgGlow: 'rgba(255,80,60,0.15)',
    border: 'rgba(255,100,80,0.5)',
    borderIdle: 'rgba(255,100,80,0.15)',
    desc: 'Явь, Правь, Навь'
  },
  {
    id: 'kabbalistic',
    slug: 'kabbalistic',
    label: 'КАББАЛА',
    shortLabel: 'КАББАЛА',
    icon: '✡',
    color: '#8888ff',
    accent: 'rgba(136,136,255,0.85)',
    bgGlow: 'rgba(100,100,255,0.15)',
    border: 'rgba(136,136,255,0.5)',
    borderIdle: 'rgba(136,136,255,0.15)',
    desc: 'Древо Жизни, Сефирот'
  }
];

/**
 * Получить текущую активную матрицу восприятия.
 * @returns {string} 'vedic' | 'slavic' | 'kabbalistic'
 */
export function getActivePerception() {
  var stored = localStorage.getItem(STORAGE_KEY)
            || localStorage.getItem(LEGACY_MATRIX_KEY)
            || 'vedic';
  var found = PERCEPTIONS.find(function(p) { return p.id === stored; });
  return found ? found.id : 'vedic';
}

/**
 * Установить активную матрицу восприятия.
 * Синхронизирует все ключи localStorage и вызывает applyMatrixTheme если доступна.
 * @param {string} id — 'vedic' | 'slavic' | 'kabbalistic'
 */
export function setActivePerception(id) {
  var perc = PERCEPTIONS.find(function(p) { return p.id === id; });
  if (!perc) return;

  localStorage.setItem(STORAGE_KEY, id);
  localStorage.setItem(LEGACY_MATRIX_KEY, id);
  localStorage.setItem('awara_matrix_theme', id);

  if (typeof window.applyMatrixTheme === 'function') {
    window.applyMatrixTheme(id);
  }
}

/**
 * Получить объект описания матрицы по id.
 * @param {string} id
 * @returns {object|null}
 */
export function getPerception(id) {
  return PERCEPTIONS.find(function(p) { return p.id === id; }) || null;
}

/**
 * Отрисовать виджет переключателя в указанный контейнер.
 * @param {HTMLElement} container — DOM-элемент
 * @param {function} [onChange] — callback при смене матрицы
 */
export function renderSwitcher(container, onChange) {
  var current = getActivePerception();
  var _t = (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t : function(k) { return k; };

  container.innerHTML = '';
  container.style.cssText = 'display:flex;gap:6px;justify-content:center;width:100%;';

  PERCEPTIONS.forEach(function(p) {
    var isActive = p.id === current;
    var label = _t('msw.' + p.id + '.short') !== 'msw.' + p.id + '.short' ? _t('msw.' + p.id + '.short') : p.shortLabel;
    var desc = _t('msw.' + p.id + '.desc') !== 'msw.' + p.id + '.desc' ? _t('msw.' + p.id + '.desc') : p.desc;
    var btn = document.createElement('div');
    btn.setAttribute('data-matrix-id', p.id);
    btn.style.cssText =
      'flex:1;max-width:160px;padding:10px 6px;border-radius:10px;cursor:pointer;' +
      'text-align:center;transition:all 0.3s;position:relative;overflow:hidden;' +
      'background:' + (isActive ? p.bgGlow : 'rgba(255,255,255,0.02)') + ';' +
      'border:1px solid ' + (isActive ? p.border : p.borderIdle) + ';';

    btn.innerHTML =
      '<div style="font-size:clamp(18px,4vw,24px);line-height:1;margin-bottom:4px;' +
      'filter:drop-shadow(0 0 6px ' + p.color + ');">' + p.icon + '</div>' +
      '<div style="font-family:Cinzel,serif;font-size:clamp(8px,2vw,10px);' +
      'color:' + (isActive ? p.color : 'rgba(200,200,200,0.4)') + ';' +
      'letter-spacing:0.12em;line-height:1.3;">' + label + '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:6px;' +
      'color:rgba(200,200,200,0.2);margin-top:3px;letter-spacing:0.06em;">' + desc + '</div>' +
      (isActive ? '<div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);' +
      'width:16px;height:2px;border-radius:1px;background:' + p.color + ';' +
      'box-shadow:0 0 6px ' + p.color + ';"></div>' : '');

    btn.onmouseenter = function() {
      if (p.id !== getActivePerception()) {
        this.style.background = p.bgGlow;
        this.style.borderColor = p.border;
      }
    };
    btn.onmouseleave = function() {
      if (p.id !== getActivePerception()) {
        this.style.background = 'rgba(255,255,255,0.02)';
        this.style.borderColor = p.borderIdle;
      }
    };
    btn.onclick = function() {
      var prev = getActivePerception();
      if (prev === p.id) return;
      // Анимация кнопок: сжатие текущей, расширение новой
      var allBtns = container.querySelectorAll('[data-matrix-id]');
      allBtns.forEach(function(b) {
        b.style.transition = 'all 0.3s ease';
        if (b.getAttribute('data-matrix-id') === p.id) {
          b.style.transform = 'scale(1.08)';
          setTimeout(function() { b.style.transform = 'scale(1)'; }, 300);
        } else {
          b.style.transform = 'scale(0.95)';
          setTimeout(function() { b.style.transform = 'scale(1)'; }, 300);
        }
      });
      setActivePerception(p.id);
      setTimeout(function() {
        renderSwitcher(container, onChange);
      }, 300);
      if (typeof onChange === 'function') onChange(p.id);
    };

    container.appendChild(btn);
  });
}
