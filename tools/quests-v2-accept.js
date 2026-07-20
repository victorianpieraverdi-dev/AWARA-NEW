/* Headless приёмка Квестов v2 (§8 docs/quests-v2-handoff.md). Node, без браузера.
   Запуск: node tools/quests-v2-accept.js
   Пункты 6 (?dev=arc) — только визуально в браузере. */
'use strict';
var fs = require('fs');
var path = require('path');

var store = {};
var localStorage = {
  getItem: function (k) { return store[k] === undefined ? null : store[k]; },
  setItem: function (k, v) { store[k] = String(v); },
  removeItem: function (k) { delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: function (i) { return Object.keys(store)[i] || null; }
};
global.localStorage = localStorage;
global.window = { localStorage: localStorage };
window.dispatchEvent = function (e) {
  window._events = window._events || [];
  window._events.push(e.type);
};
window.CustomEvent = function (name, opts) {
  this.type = name;
  this.detail = opts && opts.detail;
};

global.fetch = function (url) {
  var p = url.replace(/^\//, '').split('/').join(path.sep);
  return Promise.resolve({
    ok: true,
    json: function () {
      return Promise.resolve(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  });
};

function loadEngine(file) {
  eval(fs.readFileSync(file, 'utf8'));
}

var report = [];
function ok(name, cond, extra) {
  report.push((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' | ' + extra : ''));
}

function isoDaysAgo(n) {
  var d = new Date(Date.now() - n * 86400000);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

loadEngine('awara-quest-arcs.js');
loadEngine('awara-quest-selector.js');
var Arcs = window.AwaraArcs;
var Sel = window.AwaraQuestSelector;

/* §8.7 empty + broken JSON */
ok('7a empty arcs', Arcs.active().length === 0);
localStorage.setItem('awara_arcs_v1', '{not json');
ok('7c broken arcs JSON self-heal', Arcs.active().length === 0);
localStorage.setItem('awara_quest_journal_v1', '%%%');

Sel.init().then(function () {
  return Sel.pick({ slug: 'daoist', maxLevel: 4, count: 3 });
}).then(function (res) {
  ok('1 pick count=3', res && res.length === 3, 'n=' + (res && res.length));
  ok('1 has score', res && res.every(function (r) { return typeof r.score === 'number'; }),
    res && res.map(function (r) { return r.score; }).join(','));

  var ladderHits = 0;
  window.AwaraArcsLightAdapter = function () { ladderHits++; };
  localStorage.setItem('tigel_v1', JSON.stringify({ lightBonus: 0 }));

  var arcDef = {
    id: 'test-arc-accept',
    matrix_slug: 'daoist',
    level: 5,
    arc_type: 'vow',
    duration_days: 3,
    title: 'Test Arc',
    text: 't',
    checkpoint_prompt: '?',
    reward: { discipline: 10, clarity: 10, will: 10 }
  };
  var st = Arcs.start(arcDef);
  ok('2 start ok', st.ok, st.reason);

  var c1 = Arcs.checkin(st.arc.id, 'note1');
  ok('2 checkin ok + light', c1.ok && c1.light > 0, 'light=' + c1.light);
  var bonus = JSON.parse(localStorage.getItem('tigel_v1')).lightBonus;
  ok('2 adapter used, lightBonus untouched', ladderHits >= 1 && bonus === 0,
    'hits=' + ladderHits + ' bonus=' + bonus);

  var c2 = Arcs.checkin(st.arc.id, 'again');
  ok('3 already_today blocked', !c2.ok && c2.reason === 'already_today', c2.reason);

  var saved = JSON.parse(localStorage.getItem('awara_arcs_v1'));
  ok('3 persist doneCount=1', saved.arcs.length === 1 && saved.arcs[0].doneCount === 1,
    'done=' + saved.arcs[0].doneCount);

  /* §8.4: elapsed=3, done=1 => missed=2 > allowedSkips=1 */
  saved.arcs[0].startedISO = isoDaysAgo(3);
  localStorage.setItem('awara_arcs_v1', JSON.stringify(saved));
  delete window.AwaraArcs;
  loadEngine('awara-quest-arcs.js');
  Arcs = window.AwaraArcs;
  window.AwaraArcsLightAdapter = function () { ladderHits++; };
  var tick = Arcs.tick();
  var after = Arcs.all()[0];
  ok('4 tick -> broken', after.status === 'broken',
    'status=' + after.status + ' missed=' + after.missed);
  ok('4 tick.changed', tick.changed === true);

  /* §8.5 index (rebuild stdout was 5508/5205/214; file structure) */
  var idx = JSON.parse(fs.readFileSync('data/quest_archetype_index.json', 'utf8'));
  var nIndex = Object.keys(idx.index || {}).length;
  ok('5 index keys 5205', nIndex === 5205, 'indexKeys=' + nIndex);
  var archSet = {};
  Object.keys(idx.index || {}).forEach(function (k) {
    (idx.index[k].archetypes || []).forEach(function (a) { archSet[a] = 1; });
  });
  ok('5 archetypes 214', Object.keys(archSet).length === 214,
    'n=' + Object.keys(archSet).length);

  /* script order (static) */
  var html = fs.readFileSync('tigel-app.html', 'utf8');
  var iFlow = html.indexOf('awara-quest-flow.js');
  var iXp = html.indexOf('awara-experience-engine.js');
  var iArcs = html.indexOf('awara-quest-arcs.js');
  var iSel = html.indexOf('awara-quest-selector.js');
  ok('order flow<xp<arcs<sel', iFlow < iXp && iXp < iArcs && iArcs < iSel,
    [iFlow, iXp, iArcs, iSel].join('<'));
  ok('LightAdapter present', html.indexOf('AwaraArcsLightAdapter') >= 0);
  ok('tick on load', /AwaraArcs\.tick\(\)/.test(html));
  ok('dev-arc lastish', html.indexOf('awara-dev-arc.js') > iSel);

  console.log(report.join('\n'));
  var fails = report.filter(function (l) { return l.indexOf('FAIL') === 0; });
  console.log(fails.length ? '\nFAILS: ' + fails.length : '\nALL PASS (' + report.length + ')');
  process.exit(fails.length ? 1 : 0);
}).catch(function (e) {
  console.error(e);
  process.exit(2);
});
