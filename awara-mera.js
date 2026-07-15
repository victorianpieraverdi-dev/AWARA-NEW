/* AWARA . Mera decoder (Russian Master canon -> light routing).
   HYBRID: instant local keyword decode + optional AI refine when proxy is up.
   SILENT by design: no labels, no 'Mera N' toasts. Only quiet light flow
   into ladder windows via AwaraLight.botInfluence(windowKey, grain).
   Reads the mera table (real Cyrillic) from awara-mera.json so this source
   stays pure ASCII. Canon: ascension = quality of Mera (closeness to Reality),
   not raw count. Ladder = Aharata (multidimensional conducting axis).
   Window keys: daimon, locations, emf, newmatrix, soul, hram, chronicle,
   cosmos, supergame. Source of truth: C:/AWARA/awara-mera-canon.md (+ -2.md) */
(function () {
  "use strict";
  if (window.AwaraMera && window.AwaraMera.__ready) return;
  var VER = 1;
  var DATA = null, loaded = false;

  // normalize: lowercase + map yo(0451) to ye(0435) for robust matching
  function norm(s) { return ("" + s).toLowerCase().replace(/\u0451/g, "\u0435"); }

  function scoreKeys(text, keys) {
    var n = 0, i, k;
    if (!keys) return 0;
    for (i = 0; i < keys.length; i++) {
      k = norm(keys[i]);
      if (k && text.indexOf(k) >= 0) n += Math.max(1, k.length / 4);
    }
    return n;
  }

  function decode(text) {
    if (!DATA) return null;
    var t = norm(text), best = null, bestScore = 0, i, sc;
    var list = DATA.meras || [];
    for (i = 0; i < list.length; i++) {
      sc = scoreKeys(t, list[i].keys);
      if (sc > bestScore) { bestScore = sc; best = list[i]; }
    }
    if (DATA.bezmernost) {
      sc = scoreKeys(t, DATA.bezmernost.keys);
      if (sc > bestScore) { bestScore = sc; best = DATA.bezmernost; }
    }
    if (!best) {
      return { n: 0, name: "default", window: DATA.default_window || "daimon", score: 0 };
    }
    return { n: best.n || 0, name: best.name, window: best.window, score: bestScore };
  }

  function windowByNum(num) {
    if (!DATA) return "daimon";
    if (num === 0) return (DATA.bezmernost && DATA.bezmernost.window) || "supergame";
    var list = DATA.meras || [], i;
    for (i = 0; i < list.length; i++) { if (list[i].n === num) return list[i].window; }
    return DATA.default_window || "daimon";
  }

  // Quiet pour: botInfluence does not toast, so nothing surfaces to the player.
  function pour(win, grain) {
    try {
      if (win && window.AwaraLight && typeof window.AwaraLight.botInfluence === "function") {
        window.AwaraLight.botInfluence(win, grain);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function aiRefine(text, cb) {
    try {
      if (typeof window.aiCall !== "function") { cb(null); return; }
      var sys = "You classify a player's short message into the Russian Master's Mera scale for the AWARA game. " +
        "Reply with ONE integer only, no words, no punctuation. Scale: " +
        "1 = physical body, money, things, growth for growth; " +
        "2 = fear, anger, aggression, illness, conflict, burnout; " +
        "3 = harmony with nature, craft, home, beauty, cleanliness; " +
        "4 = living feeling, heart, intuition, subtle sense; " +
        "5 = wholeness, sincerity, love-what-i-do, meaning, flow; " +
        "6 = service, helping others, giving, mentoring; " +
        "7 = radiance, inspiration, leading, inner fire; " +
        "8 = spirit, perception, vision, meditation, presence; " +
        "9 = freedom, cosmos, liberation, unity with all; " +
        "0 = boundlessness, super-player, many spirits. Return only the digit 0-9.";
      var msgs = [{ role: "system", content: sys }, { role: "user", content: ("" + text).slice(0, 500) }];
      window.aiCall(msgs).then(function (out) {
        var mt = ("" + out).match(/-?\d+/);
        if (!mt) { cb(null); return; }
        var num = parseInt(mt[0], 10);
        if (isNaN(num) || num < 0 || num > 9) { cb(null); return; }
        cb(num);
      }).catch(function () { cb(null); });
    } catch (e) { cb(null); }
  }

  // Main entry: decode a message and route light to its Mera window, silently.
  // Local decode is instant; AI refine adds a smaller correction if it differs.
  function route(text, grain) {
    grain = (typeof grain === "number") ? grain : 1.5;
    var m = decode(text);
    if (m) pour(m.window, grain);
    aiRefine(text, function (num) {
      if (num == null) return;
      var w = windowByNum(num);
      if (w && (!m || w !== m.window)) pour(w, grain * 0.7);
    });
    return m;
  }

  function level() {
    try { if (window.AwaraLight && typeof window.AwaraLight.state === "function") return window.AwaraLight.state().mera; } catch (e) {}
    return null;
  }

  function load() {
    fetch("awara-mera.json?v=" + VER)
      .then(function (r) { return r.json(); })
      .then(function (d) { DATA = d; loaded = true; })
      .catch(function () {});
  }

  window.AwaraMera = {
    __ready: true, __v: 1,
    decode: decode, route: route, level: level,
    windowByNum: windowByNum, data: function () { return DATA; }, reload: load
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(load, 180); });
  } else {
    setTimeout(load, 180);
  }
})();
