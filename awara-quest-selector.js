/* ============================================================
   AWARA · QUEST SELECTOR v1 — взвешенная выдача квестов
   Спираль архетипа · Эхо-параллели · Анти-повтор · Профиль игрока

   Данные:
     data/quest_archetype_index.json  — индекс: квест -> архетипы (тип x мотив)
     data/matrix_quests/{slug}.json   — квесты линзы (levels 1..6)
     data/arc_quests_seed.json        — многодневные арки (L5-L6)

   API:
     await AwaraQuestSelector.init()
     AwaraQuestSelector.pick({slug, maxLevel, count}) -> [{quest, score, spiral_of, echoes}]
     AwaraQuestSelector.pickArc({slug}) -> арка или null
     AwaraQuestSelector.markServed(quest)
     AwaraQuestSelector.markCompleted(quest)   — питает спираль и эхо
     AwaraQuestSelector.setProfile({lenses:{slug:weight}, laggingAxes:[...]})

   Журнал: localStorage 'awara_quest_journal_v1'
   ============================================================ */
(function () {
  'use strict';
  if (window.AwaraQuestSelector) return;

  var PATHS = {
    index: '/data/quest_archetype_index.json',
    lens: function (slug) { return '/data/matrix_quests/' + slug + '.json'; },
    arcs: '/data/arc_quests_seed.json'
  };
  var JKEY = 'awara_quest_journal_v1';

  var W = {
    profile: 1.5,        // линза из профиля игрока (онбординг / life_activities)
    energyElement: 1.3,  // совпадение стихии квеста со стихией дня
    laggingAxis: 1.4,    // квест качает отстающую ось
    spiralNext: 1.6,     // архетип пройден на уровне ниже -> предлагать глубже
    echoNew: 1.15,       // архетип пройден в другой линзе -> видимая параллель
    repeatPenalty: 0.45, // тот же архетип в той же линзе недавно
    repeatDays: 10       // окно анти-повтора, дней
  };

  var TYPE_ELEMENT = { do: 'Земля', meditate: 'Эфир', observe: 'Воздух', reflect: 'Вода', create: 'Огонь', study: 'Воздух', ritual: 'Огонь' };
  var ELEMENTS_5 = ['Огонь', 'Вода', 'Земля', 'Воздух', 'Эфир'];

  var _index = null, _arcs = null, _lensCache = {};
  var _profile = { lenses: {}, laggingAxes: [] };

  function journal() {
    try { return JSON.parse(localStorage.getItem(JKEY) || '{"served":{},"completed":{}}'); }
    catch (e) { return { served: {}, completed: {} }; }
  }
  function saveJournal(j) { try { localStorage.setItem(JKEY, JSON.stringify(j)); } catch (e) {} }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysAgo(iso) { return Math.round((Date.now() - new Date(iso).getTime()) / 86400000); }

  function qkey(slug, level, title) { return slug + '|' + level + '|' + title; }

  function archetypesOf(slug, level, title) {
    if (!_index) return [];
    var rec = _index.index[qkey(slug, level, title)];
    return rec ? rec.archetypes : [];
  }

  /* Стихия дня — та же простая логика, что в quest-engine.js */
  function dailyElement() {
    var now = new Date();
    var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    return ELEMENTS_5[dayOfYear % 5];
  }

  /* Профиль: пробуем вытащить веса линз из состояния игры */
  function autoProfile() {
    var lenses = {};
    try {
      var st = window.STATE;
      if (st && st.mats && window.AwaraLens && AwaraLens.slugFor) {
        st.mats.forEach(function (k) {
          var s = AwaraLens.slugFor(k); if (s) lenses[s] = (lenses[s] || 0) + 1;
        });
      }
    } catch (e) {}
    try {
      var ob = JSON.parse(localStorage.getItem('awara_onboarding_v1') || 'null');
      if (ob && ob.branches) ob.branches.forEach(function (b) {
        (b.maps_to_lenses || b.maps_to_lens || []).forEach(function (s) { lenses[s] = (lenses[s] || 0) + 1; });
      });
    } catch (e) {}
    return lenses;
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); });
  }

  var AwaraQuestSelector = {
    W: W, PATHS: PATHS,

    init: function () {
      var self = this;
      var p1 = _index ? Promise.resolve(_index) : fetchJson(PATHS.index).then(function (d) { _index = d; });
      var p2 = _arcs ? Promise.resolve(_arcs) : fetchJson(PATHS.arcs).then(function (d) { _arcs = d; }).catch(function () { _arcs = []; });
      var auto = autoProfile();
      Object.keys(auto).forEach(function (s) { if (!_profile.lenses[s]) _profile.lenses[s] = auto[s]; });
      return Promise.all([p1, p2]).then(function () { return self; });
    },

    setProfile: function (p) {
      if (p && p.lenses) _profile.lenses = p.lenses;
      if (p && p.laggingAxes) _profile.laggingAxes = p.laggingAxes;
    },

    _loadLens: function (slug) {
      if (_lensCache[slug]) return Promise.resolve(_lensCache[slug]);
      return fetchJson(PATHS.lens(slug)).then(function (d) { _lensCache[slug] = d; return d; });
    },

    /* Главный вызов: кандидаты для линзы с учётом всех весов */
    pick: function (opts) {
      var slug = opts.slug, maxLevel = opts.maxLevel || 6, count = opts.count || 3;
      var self = this;
      return this._loadLens(slug).then(function (pack) {
        var j = journal(), el = dailyElement();
        var out = [];
        Object.keys(pack.levels || {}).forEach(function (lvStr) {
          var lv = parseInt(lvStr, 10);
          if (lv > maxLevel) return;
          (pack.levels[lvStr] || []).forEach(function (q) {
            var archs = archetypesOf(slug, lv, q.title);
            var score = 1.0;
            var spiral_of = null, echoes = [];

            /* профиль */
            if (_profile.lenses[slug]) score *= W.profile;
            /* стихия дня */
            if (TYPE_ELEMENT[q.type] === el) score *= W.energyElement;
            /* отстающая ось */
            if (_profile.laggingAxes.length && q.reward) {
              var main = Object.keys(q.reward).sort(function (a, b) { return q.reward[b] - q.reward[a]; })[0];
              if (_profile.laggingAxes.indexOf(main) >= 0) score *= W.laggingAxis;
            }

            archs.forEach(function (a) {
              /* анти-повтор: этот архетип в этой линзе недавно выдавался */
              var served = (j.served[a] || {})[slug];
              if (served && daysAgo(served) < W.repeatDays) score *= W.repeatPenalty;

              var comp = j.completed[a] || {};
              /* спираль: пройден в этой линзе на уровне ниже -> зовём глубже */
              if (comp[slug] && comp[slug].level === lv - 1) { score *= W.spiralNext; spiral_of = { archetype: a, level: comp[slug].level }; }
              /* эхо: пройден в других линзах */
              Object.keys(comp).forEach(function (other) {
                if (other !== slug) echoes.push({ archetype: a, lens: other, level: comp[other].level });
              });
            });
            if (echoes.length) score *= W.echoNew;

            out.push({ quest: q, level: lv, slug: slug, score: Math.round(score * 100) / 100, spiral_of: spiral_of, echoes: echoes.slice(0, 3), archetypes: archs });
          });
        });
        out.sort(function (a, b) { return b.score - a.score; });
        return out.slice(0, count);
      });
    },

    /* Многодневная арка для линзы (L5-L6): если уровень открыт и нет активной */
    pickArc: function (opts) {
      var slug = opts.slug, maxLevel = opts.maxLevel || 6;
      if (!_arcs || !_arcs.length) return null;
      var act = (window.AwaraArcs ? AwaraArcs.active() : []);
      if (act.length >= (window.AwaraArcs ? AwaraArcs.config.maxActive : 2)) return null;
      var done = {};
      act.forEach(function (a) { done[a.questId] = 1; });
      var j = journal();
      var cands = _arcs.filter(function (a) {
        return a.matrix_slug === slug && a.level <= maxLevel && !done[a.id] && !(j.completed['arc:' + a.id]);
      });
      return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
    },

    markServed: function (q) {
      var j = journal(), t = todayISO();
      (q.archetypes || archetypesOf(q.slug, q.level, (q.quest || q).title)).forEach(function (a) {
        j.served[a] = j.served[a] || {};
        j.served[a][q.slug] = t;
      });
      saveJournal(j);
    },

    markCompleted: function (q) {
      var j = journal();
      var archs = q.archetypes || archetypesOf(q.slug, q.level, (q.quest || q).title);
      archs.forEach(function (a) {
        j.completed[a] = j.completed[a] || {};
        var prev = j.completed[a][q.slug];
        if (!prev || prev.level < q.level) j.completed[a][q.slug] = { level: q.level, date: todayISO() };
      });
      if (q.arcId) j.completed['arc:' + (q.questId || q.arcId)] = { date: todayISO() };
      saveJournal(j);
    }
  };

  window.AwaraQuestSelector = AwaraQuestSelector;
})();
