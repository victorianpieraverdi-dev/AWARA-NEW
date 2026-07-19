/* ============================================================
   AWARA · QUEST ARCS v1 — многодневные квесты для L5–L6
   (обеты/гейсы, циклы наблюдения, паломничества, синтез-недели)

   Хранение: localStorage 'awara_arcs_v1'
   API:
     AwaraArcs.start(quest)            — принять арку (quest с duration_days)
     AwaraArcs.checkin(arcId, note)    — дневной чекпоинт (1 раз в день)
     AwaraArcs.tick()                  — вызвать при открытии Тигеля / старте дня
     AwaraArcs.active()                — активные арки
     AwaraArcs.all()                   — все арки (включая завершённые)
     AwaraArcs.config                  — настройки (можно править)
     AwaraArcs.onLight = fn(payload)   — хук начисления света (опционально)

   События (CustomEvent на window):
     'awara:arc-started'   detail:{arc}
     'awara:arc-checkin'   detail:{arc, light}
     'awara:arc-completed' detail:{arc, light}
     'awara:arc-broken'    detail:{arc, light}  — сорвана, частичный зачёт

   Свет: каждый чекпоинт платит долю награды (checkpointShare),
   завершение — остаток × completionBonus. Начисление идёт через
   AwaraXP.processExperience если доступен, иначе через onLight/событие.
   Загружать ПОСЛЕ awara-experience-engine.js.
   ============================================================ */
(function () {
  'use strict';
  if (window.AwaraArcs) return;

  var KEY = 'awara_arcs_v1';

  var config = {
    maxActive: 2,          // не больше двух арок одновременно
    allowedSkips: 1,       // допустимо пропустить 1 день
    checkpointShare: 0.12, // доля суммы наград за каждый дневной чекпоинт
    completionBonus: 1.5,  // множитель финального зачёта
    brokenShare: 0.4       // доля заработанного при срыве (частичный зачёт)
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{"arcs":[]}'); }
    catch (e) { return { arcs: [] }; }
  }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }
  function rewardSum(reward) {
    var s = 0, k;
    for (k in (reward || {})) s += reward[k] || 0;
    return s || 2;
  }
  function emit(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {}
  }

  /* Начисление света: пробуем штатный движок, иначе хук/событие. */
  function grantLight(arc, amount, kind) {
    amount = Math.max(0, Math.round(amount * 10) / 10);
    if (!amount) return 0;
    var paid = false;
    if (typeof window.AwaraArcsLightAdapter === 'function') {
      /* Проектный адаптер (рекомендуется): связать с AwaraXP.processExperience
         по образцу awara-quest-flow.js (множители, окна Мер). */
      try { window.AwaraArcsLightAdapter(arc, amount, kind); paid = true; } catch (e) {}
    }
    if (!paid && window.AwaraArcs && typeof window.AwaraArcs.onLight === 'function') {
      try { window.AwaraArcs.onLight({ arc: arc, light: amount, kind: kind }); paid = true; } catch (e) {}
    }
    if (!paid) {
      /* fallback: копим бонус в tigel_v1, чтобы свет не терялся */
      try {
        var s = JSON.parse(localStorage.getItem('tigel_v1') || '{}');
        s.lightBonus = (s.lightBonus || 0) + amount;
        localStorage.setItem('tigel_v1', JSON.stringify(s));
      } catch (e) {}
    }
    emit('awara:arc-light', { arc: arc, light: amount, kind: kind });
    return amount;
  }

  function findArc(st, id) {
    for (var i = 0; i < st.arcs.length; i++) if (st.arcs[i].id === id) return st.arcs[i];
    return null;
  }

  var AwaraArcs = {
    config: config,

    active: function () {
      return load().arcs.filter(function (a) { return a.status === 'active'; });
    },
    all: function () { return load().arcs; },

    /* Принять многодневный квест. quest: {id, matrix_slug|slug, level, arc_type,
       duration_days, title, text, checkpoint_prompt, reward} */
    start: function (quest) {
      if (!quest || !quest.duration_days) return { ok: false, reason: 'not_an_arc' };
      var st = load();
      var act = st.arcs.filter(function (a) { return a.status === 'active'; });
      if (act.length >= config.maxActive) return { ok: false, reason: 'max_active' };
      var qid = quest.id || (quest.title || 'arc');
      for (var i = 0; i < act.length; i++)
        if (act[i].questId === qid) return { ok: false, reason: 'already_active' };
      var arc = {
        id: qid + '@' + todayISO(),
        questId: qid,
        slug: quest.matrix_slug || quest.slug || null,
        level: quest.level || 5,
        arcType: quest.arc_type || 'vow',
        title: quest.title || '',
        text: quest.text || '',
        checkpointPrompt: quest.checkpoint_prompt || 'Как прошёл этот день обета?',
        duration: quest.duration_days,
        reward: quest.reward || {},
        startedISO: todayISO(),
        days: {},           // dateISO -> {note, ts}
        doneCount: 0,
        paidLight: 0,
        status: 'active'
      };
      st.arcs.push(arc);
      save(st);
      emit('awara:arc-started', { arc: arc });
      return { ok: true, arc: arc };
    },

    /* Дневной чекпоинт. Возвращает {ok, light, completed} */
    checkin: function (arcId, note) {
      var st = load(), arc = findArc(st, arcId);
      if (!arc || arc.status !== 'active') return { ok: false, reason: 'not_active' };
      var t = todayISO();
      if (arc.days[t]) return { ok: false, reason: 'already_today' };
      arc.days[t] = { note: note || '', ts: Date.now() };
      arc.doneCount++;
      var base = rewardSum(arc.reward);
      var light = grantLight(arc, base * config.checkpointShare, 'checkpoint');
      arc.paidLight += light;
      var completed = false;
      if (arc.doneCount >= arc.duration) {
        completed = true;
        this._complete(arc);
      }
      save(st);
      emit('awara:arc-checkin', { arc: arc, light: light });
      return { ok: true, light: light, completed: completed };
    },

    _complete: function (arc) {
      arc.status = 'completed';
      arc.completedISO = todayISO();
      var base = rewardSum(arc.reward);
      var final_ = Math.max(0, base * config.completionBonus - arc.paidLight);
      var light = grantLight(arc, final_, 'completion');
      arc.paidLight += light;
      emit('awara:arc-completed', { arc: arc, light: light });
    },

    /* Вызывать при старте дня: проверяет пропуски, рвёт арки с превышением. */
    tick: function () {
      var st = load(), t = todayISO(), changed = false;
      for (var i = 0; i < st.arcs.length; i++) {
        var arc = st.arcs[i];
        if (arc.status !== 'active') continue;
        var elapsed = daysBetween(arc.startedISO, t); // без сегодняшнего
        var missed = Math.max(0, elapsed - arc.doneCount);
        arc.missed = missed;
        if (missed > config.allowedSkips) {
          arc.status = 'broken';
          arc.brokenISO = t;
          var base = rewardSum(arc.reward);
          var earned = base * (arc.doneCount / arc.duration) * config.brokenShare;
          var light = grantLight(arc, Math.max(0, earned - arc.paidLight * 0.5), 'broken');
          emit('awara:arc-broken', { arc: arc, light: light });
          changed = true;
        }
      }
      save(st);
      return { checked: st.arcs.length, changed: changed };
    },

    /* Для UI: сколько дней осталось и можно ли чекиниться сегодня */
    statusOf: function (arcId) {
      var st = load(), arc = findArc(st, arcId);
      if (!arc) return null;
      var t = todayISO();
      return {
        arc: arc,
        canCheckinToday: arc.status === 'active' && !arc.days[t],
        daysLeft: Math.max(0, arc.duration - arc.doneCount),
        missed: arc.missed || 0
      };
    }
  };

  window.AwaraArcs = AwaraArcs;
})();
