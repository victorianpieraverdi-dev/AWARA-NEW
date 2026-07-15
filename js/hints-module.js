// =============================================
// AWARA — Hints Module (M-006 + M-007 i18n)
// Единая система подсказок на всех экранах
// Подсказки хранят ключи i18n, не строки
// =============================================

import { t } from './i18n.js';

// === ПОДСКАЗКИ ДЛЯ КАЖДОГО ЭКРАНА (ключи i18n) ===
export const HINTS = {
  tigel:      ['hint.tigel.1', 'hint.tigel.2', 'hint.tigel.3'],
  initiation: ['hint.initiation.1', 'hint.initiation.2', 'hint.initiation.3'],
  passport:   ['hint.passport.1', 'hint.passport.2', 'hint.passport.3'],
  cards:      ['hint.cards.1', 'hint.cards.2', 'hint.cards.3'],
  matrix:     ['hint.matrix.1', 'hint.matrix.2', 'hint.matrix.3'],
  universe:   ['hint.universe.1', 'hint.universe.2', 'hint.universe.3'],
  oracle:     ['hint.oracle.1', 'hint.oracle.2', 'hint.oracle.3'],
  earth:      ['hint.earth.1', 'hint.earth.2', 'hint.earth.3'],
  dashboard:  ['hint.dashboard.1', 'hint.dashboard.2', 'hint.dashboard.3'],
  natal:      ['hint.natal.1', 'hint.natal.2', 'hint.natal.3'],
  daimon:     ['hint.daimon.1', 'hint.daimon.2', 'hint.daimon.3'],
  milost:     ['hint.milost.1', 'hint.milost.2', 'hint.milost.3']
};

// === ПОЛУЧИТЬ ПОДСКАЗКИ ДЛЯ ЭКРАНА (переведённые) ===
export function getHints(pageId) {
  var keys = HINTS[pageId] || [];
  return keys.map(function(key) { return t(key); });
}

// === ПРОВЕРИТЬ ПЕРВЫЙ ЛИ ВХОД НА ЭКРАН ===
export function isFirstVisit(pageId) {
  var key = 'awara_hint_seen_' + pageId;
  return localStorage.getItem(key) !== '1';
}

// === ОТМЕТИТЬ ЧТО ПОДСКАЗКИ ПОКАЗАНЫ ===
export function markHintsSeen(pageId) {
  localStorage.setItem('awara_hint_seen_' + pageId, '1');
}

// === СБРОСИТЬ ВСЕ ПОДСКАЗКИ (ДЛЯ ТЕСТИРОВАНИЯ) ===
export function resetAllHints() {
  for (var pageId of Object.keys(HINTS)) {
    localStorage.removeItem('awara_hint_seen_' + pageId);
  }
}

// === ПОКАЗАТЬ TOAST-ПОДСКАЗКУ ===
export function showHintToast(text) {
  var existing = document.querySelector('.awara-hint-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'awara-hint-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.style.opacity = '1'; });

  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// === ПОКАЗАТЬ МОДАЛЬНОЕ ОКНО ПОДСКАЗОК ===
export function showHintsModal(pageId) {
  var hints = getHints(pageId);
  if (!hints.length) return;

  var existing = document.getElementById('awara-hints-modal');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'awara-hints-modal';
  overlay.className = 'awara-hints-overlay';

  var content = document.createElement('div');
  content.className = 'awara-hints-content';

  var title = document.createElement('h3');
  title.textContent = t('hints.title');
  content.appendChild(title);

  hints.forEach(function(hint, i) {
    var p = document.createElement('p');
    p.innerHTML = '<span class="awara-hint-num">' + (i + 1) + '</span> ' + hint;
    content.appendChild(p);
  });

  var btn = document.createElement('div');
  btn.className = 'awara-hints-close';
  btn.textContent = t('hints.close');
  btn.onclick = function() { overlay.remove(); };
  content.appendChild(btn);

  overlay.appendChild(content);
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

// === ИНИЦИАЛИЗАЦИЯ ПОДСКАЗОК НА ЭКРАНЕ ===
export function initHints(pageId) {
  injectHintStyles();

  // Кнопка ?
  var btn = document.querySelector('.hint-btn');
  if (btn) {
    btn.onclick = function() { showHintsModal(pageId); };
  }

  // Первый вход — показать подсказки последовательно
  if (isFirstVisit(pageId)) {
    var hints = getHints(pageId);
    hints.forEach(function(hint, i) {
      setTimeout(function() { showHintToast(hint); }, 1200 + i * 5000);
    });
    markHintsSeen(pageId);
  }
}

// === ИНЪЕКЦИЯ CSS (один раз) ===
function injectHintStyles() {
  if (document.getElementById('awara-hint-styles')) return;

  var style = document.createElement('style');
  style.id = 'awara-hint-styles';
  style.textContent = [
    '.hint-btn{',
    '  position:fixed;top:12px;right:12px;z-index:100;',
    '  width:36px;height:36px;border-radius:50%;cursor:pointer;',
    '  background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);',
    '  color:#c9a84c;font-family:"Cinzel",serif;font-size:16px;',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:all 0.3s;',
    '}',
    '.hint-btn:hover{background:rgba(201,168,76,0.2);border-color:#ffd700;box-shadow:0 0 12px rgba(201,168,76,0.3);}',
    '.awara-hint-toast{',
    '  position:fixed;bottom:80px;left:50%;transform:translateX(-50%);',
    '  max-width:min(320px,85vw);padding:14px 20px;',
    '  background:rgba(10,5,20,0.92);border:1px solid rgba(201,168,76,0.3);',
    '  border-radius:12px;color:rgba(255,248,214,0.9);',
    '  font-family:"Cormorant Garamond",serif;font-size:14px;line-height:1.6;',
    '  text-align:center;z-index:9999;opacity:0;transition:opacity 0.4s;',
    '  pointer-events:none;box-shadow:0 0 30px rgba(201,168,76,0.1);',
    '}',
    '.awara-hints-overlay{',
    '  position:fixed;inset:0;z-index:10000;',
    '  background:rgba(2,1,10,0.88);backdrop-filter:blur(6px);',
    '  display:flex;align-items:center;justify-content:center;padding:20px;',
    '}',
    '.awara-hints-content{',
    '  background:rgba(10,6,20,0.95);border:1px solid rgba(201,168,76,0.3);',
    '  border-radius:14px;padding:24px;max-width:360px;width:100%;',
    '}',
    '.awara-hints-content h3{',
    '  font-family:"Cinzel",serif;font-size:15px;color:#ffd700;',
    '  letter-spacing:0.2em;text-align:center;margin:0 0 16px;',
    '}',
    '.awara-hints-content p{',
    '  font-family:"Cormorant Garamond",serif;font-size:14px;',
    '  color:rgba(220,210,190,0.75);line-height:1.6;margin:0 0 10px;',
    '}',
    '.awara-hint-num{',
    '  display:inline-block;width:20px;height:20px;line-height:20px;',
    '  border-radius:50%;background:rgba(201,168,76,0.15);',
    '  color:#c9a84c;font-size:11px;text-align:center;margin-right:6px;',
    '  font-family:"JetBrains Mono",monospace;',
    '}',
    '.awara-hints-close{',
    '  margin-top:16px;padding:8px 24px;border-radius:8px;cursor:pointer;',
    '  background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.3);',
    '  font-family:"Cinzel",serif;font-size:12px;color:#c9a84c;',
    '  letter-spacing:0.15em;text-align:center;transition:all 0.3s;',
    '}',
    '.awara-hints-close:hover{background:rgba(201,168,76,0.2);}'
  ].join('\n');
  document.head.appendChild(style);
}
