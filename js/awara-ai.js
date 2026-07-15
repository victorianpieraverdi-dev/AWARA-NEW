/**
 * AWARA_AI — frontend helper
 * Подключить перед </body> в index.html и initiation-space.html:
 * <script src="js/awara-ai.js"></script>
 *
 * Console test:
 *   AWARA_AI.getDailyMeaning().then(console.log).catch(console.error)
 *   AWARA_AI.askOracle("Что мне выбрать сейчас?").then(console.log).catch(console.error)
 */

(function () {
  'use strict';

  const ENDPOINT = '/.netlify/functions/awara-daily';

  // ── playerId ──────────────────────────────────────────────────────────────
  function getOrCreatePlayerId() {
    let id = localStorage.getItem('awara_player_id');
    if (!id) {
      id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('awara_player_id', id);
    }
    return id;
  }

  // ── date ──────────────────────────────────────────────────────────────────
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // ── birthData ─────────────────────────────────────────────────────────────
  function getBirthData() {
    const d = localStorage.getItem('awara_birth_date');
    if (!d) return null;
    return {
      date:  d,
      time:  localStorage.getItem('awara_birth_time')  || null,
      place: localStorage.getItem('awara_birth_place') || null,
    };
  }

  // ── active culture matrix ─────────────────────────────────────────────────
  function getActiveMatrix() {
    if (window._ACTIVE_MATRIX) return window._ACTIVE_MATRIX;
    const el = document.getElementById('active-matrix-label');
    if (el && el.textContent.trim()) {
      return { name: el.textContent.trim() };
    }
    return { name: 'Нейтраль' };
  }

  // ── game state ────────────────────────────────────────────────────────────
  function getPlayerState() {
    const s = window.state;
    if (!s) return {};
    return {
      level:      s.level      ?? null,
      totalLight: s.totalLight ?? null,
      energy:     s.energy     ?? null,
      awareness:  s.awareness  ?? null,
      path:       s.path       ?? null,
      gene:       s.gene       ?? null,
      element:    s.element    ?? null,
      dayEnergy:  s.dayEnergy  ?? null,
      choices:    s.choices    ?? [],
      journey:    s.journey    ?? [],
      sphereData: s.sphereData ?? {},
      spirit:     s.spirit     ?? null,
      elements:   s.elements   ?? {},
    };
  }

  // ── POST to Netlify Function ──────────────────────────────────────────────
  async function post(payload) {
    const res = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
  }

  // ── getDailyMeaning ───────────────────────────────────────────────────────
  async function getDailyMeaning(force = false) {
    const playerId = getOrCreatePlayerId();
    const date     = getToday();

    const player = {
      cultureMatrix:     getActiveMatrix(),
      birthData:         getBirthData(),
      state:             getPlayerState(),
      initiationContext: typeof window.getGameContext === 'function'
                           ? window.getGameContext()
                           : {},
    };

    return post({ action: 'getDailyMeaning', playerId, date, player, force });
  }

  // ── askOracle ─────────────────────────────────────────────────────────────
  async function askOracle(question, context) {
    if (!question || !question.trim()) throw new Error('Question is empty');

    const playerId = getOrCreatePlayerId();
    const date     = getToday();

    const ctx = context || {
      matrix:  getActiveMatrix(),
      state:   getPlayerState(),
      birth:   getBirthData(),
    };

    return post({ action: 'askOracle', playerId, date, question: question.trim(), context: ctx });
  }

  // ── showDailyMeaningCard ──────────────────────────────────────────────────
  // Минимальный fallback. Если в игре уже есть свой виджет — он имеет приоритет.
  function showDailyMeaningCard(meaning) {
    // Если игра умеет сама показывать — передаём ей
    if (typeof window.renderDailyMeaning === 'function') {
      window.renderDailyMeaning(meaning);
      return;
    }
    // Иначе — тихо логируем; не ломаем UI
    console.info('[AWARA_AI] Daily meaning ready:', meaning);
  }

  // ── Auto-load on DOMContentLoaded ────────────────────────────────────────
  // Вызывает getDailyMeaning и передаёт результат в showDailyMeaningCard.
  // Безопасно: не трогает DOM напрямую.
  document.addEventListener('DOMContentLoaded', function () {
    // Небольшая задержка, чтобы игра успела инициализировать window.state
    setTimeout(function () {
      getDailyMeaning()
        .then(function (result) {
          if (result && result.meaning) {
            showDailyMeaningCard(result.meaning);
          }
        })
        .catch(function (err) {
          console.warn('[AWARA_AI] getDailyMeaning failed:', err.message);
        });
    }, 1200);
  });

  // ── Expose ────────────────────────────────────────────────────────────────
  window.AWARA_AI = {
    getOrCreatePlayerId,
    getPlayerState,
    getDailyMeaning,
    askOracle,
    showDailyMeaningCard,
  };

})();
