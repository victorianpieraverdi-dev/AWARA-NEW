/* ============================================================
   AWARA · DEV-ARC v1 — dev-режим по URL-параметру для визуальной
   проверки карточки «Многодневный путь» и строк спирали/эха
   на экране «План» (tigel-app.html).

   Без параметра ?dev в URL файл не делает НИЧЕГО (ни чтения,
   ни записи localStorage).

   ?dev=arc     — бэкап боевого состояния -> тестовые данные
                  (daoist L5, две активные арки: обычная arc-daoist-tea-5
                  и паломничество arc-pilgrim-daoist-6 на дне 2 из 6,
                  журнал для спирали/эха) -> перезагрузка ->
                  переход на экран «План» + баннер.
   ?dev=restore — восстановить ровно то, что было до ?dev=arc,
                  удалить тестовые ключи и сам бэкап.

   Грузить ПОСЛЕДНИМ скриптом перед </body>.
   ============================================================ */
(function () {
  'use strict';
  var dev = null;
  try { dev = new URLSearchParams(location.search).get('dev'); } catch (e) { return; }
  if (!dev) return; /* нет параметра — ноль побочных эффектов */

  var BACKUP_KEY = 'awara_dev_backup';
  var RELOAD_FLAG = 'awara_dev_arc_injected'; /* sessionStorage: защита от reload-петли */

  function isoDaysAgo(n) {
    var d = new Date(Date.now() - n * 86400000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* все боевые ключи: awara_* плюс tigel_v1 (без префикса, но тоже состояние игрока) */
  function playerKeys() {
    var out = [], i, k;
    for (i = 0; i < localStorage.length; i++) {
      k = localStorage.key(i);
      if (k && k.indexOf('awara_') === 0 && k !== BACKUP_KEY) out.push(k);
    }
    if (localStorage.getItem('tigel_v1') !== null && out.indexOf('tigel_v1') < 0) out.push('tigel_v1');
    return out;
  }

  function banner(text) {
    var el = document.createElement('div');
    el.id = 'awara-dev-banner';
    el.textContent = text;
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
      'background:#c9a84c;color:#0a0a14;font:600 13px/1.4 "JetBrains Mono",monospace;' +
      'text-align:center;padding:8px 12px;letter-spacing:.04em;box-shadow:0 2px 12px rgba(0,0,0,.5)';
    function add() { document.body.appendChild(el); }
    if (document.body) add();
    else document.addEventListener('DOMContentLoaded', add);
  }

  /* ═══ ?dev=arc ═══ */
  function runArc() {
    /* Шаг 1 — бэкап (только если его ещё нет: не терять оригинал под тестовыми данными) */
    if (localStorage.getItem(BACKUP_KEY) === null) {
      var b = {}, keys = playerKeys(), i;
      for (i = 0; i < keys.length; i++) b[keys[i]] = localStorage.getItem(keys[i]);
      localStorage.setItem(BACKUP_KEY, JSON.stringify(b));
    }

    var alreadyInjected = sessionStorage.getItem(RELOAD_FLAG) === '1';
    if (!alreadyInjected) {
      /* Шаг 2 — тестовое состояние */
      var today = isoDaysAgo(0), d1 = isoDaysAgo(1), d2 = isoDaysAgo(2);

      /* 2a. tigel_v1: движок tigel-app.html держит STATE именно здесь (const KEY='tigel_v1').
         activeSlug() читает s.mats (русские имена матриц, MATKEYS[6]='Даосизм' -> slug 'daoist'),
         уровень = AwaraAscension.level = max(levelOf(s.lenses[key].uses), lightLevel());
         uses=14 -> ровно L5. Форма — как defState() в tigel-app.html (load() требует s.birth). */
      var st = {
        birth: { date: '', time: '12:00', city: '', lat: 0, lon: 0, tz: 0 },
        natal: null, daimon: null, trust: 62,
        mats: ['Даосизм'],
        lenses: { 'Даосизм': { uses: 14, xp: 0, clarity: 4 } },
        baseLight: 0, lightBonus: 0, advice: '', lensTag: '', melted: false,
        intents: [
          { ti: 'Утренняя практика 20 мин', pat: '🔥 Шакти', bonus: '+3', done: false },
          { ti: 'Глубокая работа', pat: '📜 Сарасвати', bonus: '+2', done: false },
          { ti: 'Прогулка и тишина', pat: '🕊 Шанти', bonus: '+2', done: false }
        ],
        days: Array.apply(null, new Array(28)).map(function () { return 2; }),
        streak: 7, gens: 0, journal: []
      };
      localStorage.setItem('tigel_v1', JSON.stringify(st));

      /* 2b. Активная арка arc-daoist-tea-5: форма дословно как в AwaraArcs.start(),
         данные — из data/arc_quests_seed.json. Начата 2 дня назад, 2 чекина,
         сегодняшнего нет -> кнопка «Отметить день» активна. */
      var days = {};
      days[d2] = { note: 'Первая чаша — спешка растворилась.', ts: Date.now() - 2 * 86400000 };
      days[d1] = { note: 'Вторая чаша — тише и медленнее.', ts: Date.now() - 86400000 };
      var arc = {
        id: 'arc-daoist-tea-5@' + d2,
        questId: 'arc-daoist-tea-5',
        slug: 'daoist',
        level: 5,
        arcType: 'cycle',
        title: 'Пять Чаш Недеяния',
        text: 'Пять дней подряд — одна осознанная чаша (чай, вода, что угодно тёплое). Наливай медленно, пей без телефона и мыслей о делах. Наблюдай, как с каждым днём меняется вкус одного и того же. Меняется не чай — меняется пьющий.',
        checkpointPrompt: 'Какой была сегодняшняя чаша? Что в ней растворилось?',
        duration: 5,
        reward: { clarity: 3.0, unity: 2.5, discipline: 2.0 },
        startedISO: d2,
        days: days,
        doneCount: 2,
        paidLight: 1.8,
        status: 'active'
      };
      /* 2b'. Вторая активная арка — паломничество arc-pilgrim-daoist-6 (день 2 из 6):
         данные дословно из data/arc_quests_seed.json (пилот паломничеств),
         doneCount=1 -> карточка показывает days[1] («Голос Грома», ярус 2).
         Обе арки сразу = оба вида карточек для сравнения (maxActive:2 занят — ок). */
      var pdays = {};
      pdays[d1] = { note: 'Первый ярус пройден — сад отпущен.', ts: Date.now() - 86400000 };
      var pilg = {
        id: 'arc-pilgrim-daoist-6@' + d1,
        questId: 'arc-pilgrim-daoist-6',
        slug: 'daoist',
        level: 5,
        arcType: 'pilgrimage',
        title: 'Паломничество: восхождение (daoist)',
        text: 'Шесть дней — шесть ярусов пирамиды. Каждый день ты проходишь одну ступень: задание дня — ниже, в свитке пути. Не спеши: паломник несёт с собой всё, что увидел на предыдущем ярусе.',
        checkpointPrompt: 'Какую ступень ты прошёл сегодня и что оставил на ней?',
        duration: 6,
        reward: { clarity: 13.78, devotion: 4.13, compassion: 3.94, transformation: 3.11, discipline: 2.38, will: 1.43, unity: 1.24 },
        startedISO: d1,
        days: pdays,
        doneCount: 1,
        paidLight: 3.6,
        status: 'active'
      };
      localStorage.setItem('awara_arcs_v1', JSON.stringify({ arcs: [arc, pilg] }));

      /* 2c. Журнал селектора: архетип 'reflect x вода/поток' пройден в daoist на L4
         (спираль для daoist L5 «Польза Бесформенного») и в vedic на L2 (эхо). */
      localStorage.setItem('awara_quest_journal_v1', JSON.stringify({
        served: {},
        completed: {
          'reflect x вода/поток': {
            daoist: { level: 4, date: d1 },
            vedic: { level: 2, date: d1 }
          }
        }
      }));

      /* 2d. Онбординг-гейт: пропустить (ключ onboard.js) */
      localStorage.setItem('awara_onboarded', '1');

      /* Перезагрузка: движок уже прочитал старый tigel_v1 при парсинге,
         чистый способ применить состояние — reload (один раз, под флагом). */
      sessionStorage.setItem(RELOAD_FLAG, '1');
      location.reload();
      return;
    }

    /* Шаг 3 — показать (после reload) */
    banner('🔧 DEV-РЕЖИМ: тестовые данные — восстановить: ?dev=restore');
    window.addEventListener('load', function () {
      setTimeout(function () {
        /* если онбординг-гейт всё же открыт — пропустить знакомство */
        try {
          var ov = document.getElementById('ob-overlay');
          if (ov && ov.classList.contains('open')) {
            var skip = document.getElementById('ob-skip0');
            if (skip) skip.click();
          }
        } catch (e) {}
        /* перейти на экран «План»: go() обёрнут в awara-matrix-quests.js
           и сам триггерит render() квестов */
        try { if (typeof window.go === 'function') window.go('plan'); } catch (e) {}
      }, 800); /* после boot-скрипта (forceIstok на DOMContentLoaded/release) */
    });
  }

  /* ═══ ?dev=restore ═══ */
  function runRestore() {
    var raw = localStorage.getItem(BACKUP_KEY);
    if (raw === null) {
      banner('DEV: нечего восстанавливать (бэкап не найден)');
      return;
    }
    var b;
    try { b = JSON.parse(raw); } catch (e) {
      banner('DEV: бэкап повреждён — восстановление отменено');
      return;
    }
    function applyBackup() {
      /* удалить тестовые ключи, которых не было до теста */
      var keys = playerKeys(), i, k;
      for (i = 0; i < keys.length; i++) {
        k = keys[i];
        if (!Object.prototype.hasOwnProperty.call(b, k)) localStorage.removeItem(k);
      }
      /* вернуть ровно исходные значения */
      for (k in b) {
        if (Object.prototype.hasOwnProperty.call(b, k)) localStorage.setItem(k, b[k]);
      }
    }
    applyBackup();
    localStorage.removeItem(BACKUP_KEY);
    sessionStorage.removeItem(RELOAD_FLAG);
    banner('✅ Восстановлено');
    setTimeout(function () {
      /* модули страницы (напр. awara-skills upsertDay) пишут в awara_* уже
         ПОСЛЕ восстановления (DOMContentLoaded+таймеры), держа в памяти
         тестовое состояние — перекрываем их записи прямо перед уходом */
      applyBackup();
      localStorage.removeItem(BACKUP_KEY);
      location.href = location.pathname;
    }, 1000);
  }

  if (dev === 'arc') runArc();
  else if (dev === 'restore') runRestore();
})();
