/* AwaraSmooth: post-process DOM text so engine-stitched words read as
   grammatical Russian. Source is ASCII only; all word forms come from
   awara-smooth.json at runtime. Closed-set, boundary-checked replacement:
   it can only rewrite a known word right after a known trigger word, and it
   never invents a form that is not in the dictionary.

   v3: cross-node aware. Highlighted values (e.g. a gold <span>) live in a
   separate text node from the preposition before them, so per-node scanning
   missed them. Now each container's text nodes are concatenated in document
   order; matches are computed on the joined string, and each change is
   applied inside the single node that holds the target word. */
(function () {
  "use strict";
  if (window.AwaraSmooth && window.AwaraSmooth.__ready) return;
  var VER = 3;
  var IDS = [
    "s-istok", "s-natal", "s-tigel", "s-result",
    "s-daimon", "s-plan", "s-chron", "genModal", "libModal"
  ];
  var pairs = [];
  var loaded = false;

  function isCyr(code) {
    return (code >= 0x0410 && code <= 0x044f) || code === 0x0401 || code === 0x0451;
  }
  function beforeOk(text, pos) {
    return pos <= 0 || !isCyr(text.charCodeAt(pos - 1));
  }
  function afterOk(text, end) {
    return end >= text.length || !isCyr(text.charCodeAt(end));
  }

  /* String-level fix for the public API (single string, no DOM). */
  function applyPair(text, prefix, from, to) {
    var needle = prefix + from;
    var out = text;
    var pos = out.indexOf(needle);
    while (pos !== -1) {
      var ws = pos + prefix.length;
      var we = ws + from.length;
      if (beforeOk(out, pos) && afterOk(out, we)) {
        out = out.slice(0, ws) + to + out.slice(we);
        pos = out.indexOf(needle, ws + to.length);
      } else {
        pos = out.indexOf(needle, pos + 1);
      }
    }
    return out;
  }
  function fix(text) {
    if (!loaded || !text || text.indexOf(" ") === -1) return text;
    var out = text;
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      if (out.indexOf(p.from) === -1) continue;
      out = applyPair(out, p.prefix, p.from, p.to);
    }
    return out;
  }

  function pushMap(triggers, map) {
    if (!triggers || !map) return;
    for (var t = 0; t < triggers.length; t++) {
      var prefix = triggers[t] + " ";
      for (var from in map) {
        if (!Object.prototype.hasOwnProperty.call(map, from)) continue;
        var to = map[from];
        if (!to || to === from) continue;
        pairs.push({ prefix: prefix, from: from, to: to });
      }
    }
  }
  function byLen(a, b) {
    return (b.prefix.length + b.from.length) - (a.prefix.length + a.from.length);
  }
  function build(data) {
    pairs = [];
    var preps = data.preps || [];
    pushMap(preps, data.signs || {});
    pushMap(preps, data.naks || {});
    pushMap(data.nakLocTriggers || [], data.naks || {});
    pushMap(data.elTriggers || [], data.elements || {});
    pushMap(data.deityTriggers || [], data.deities || {});
    pushMap(data.accTriggers || [], data.accElements || {});
    pushMap(data.nakGenTriggers || [], data.nakGen || {});
    pairs.sort(byLen);
    loaded = true;
  }

  function skipNode(node) {
    var el = node.parentNode;
    while (el && el.nodeType === 1) {
      var tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "INPUT") return true;
      if (el.isContentEditable) return true;
      el = el.parentNode;
    }
    return false;
  }

  function sweepEl(root) {
    if (!root || !loaded) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var ranges = [];
    var S = "";
    var node;
    while ((node = walker.nextNode())) {
      if (skipNode(node)) continue;
      var v = node.nodeValue;
      if (!v) continue;
      ranges.push({ node: node, start: S.length, end: S.length + v.length });
      S += v;
    }
    if (!ranges.length || S.indexOf(" ") === -1) return;

    var reps = [];
    for (var pi = 0; pi < pairs.length; pi++) {
      var p = pairs[pi];
      var needle = p.prefix + p.from;
      var pos = S.indexOf(needle);
      while (pos !== -1) {
        var ws = pos + p.prefix.length;
        var we = ws + p.from.length;
        if (beforeOk(S, pos) && afterOk(S, we)) {
          reps.push({ gs: ws, ge: we, to: p.to });
          pos = S.indexOf(needle, we);
        } else {
          pos = S.indexOf(needle, pos + 1);
        }
      }
    }
    if (!reps.length) return;

    // Drop overlapping matches; keep the earliest.
    reps.sort(function (a, b) { return a.gs - b.gs; });
    var clean = [];
    var lastEnd = -1;
    for (var r = 0; r < reps.length; r++) {
      if (reps[r].gs >= lastEnd) { clean.push(reps[r]); lastEnd = reps[r].ge; }
    }

    // Map each match to the single node that fully contains the target word.
    var edits = [];
    for (var c = 0; c < clean.length; c++) {
      var rep = clean[c];
      for (var k = 0; k < ranges.length; k++) {
        if (rep.gs >= ranges[k].start && rep.ge <= ranges[k].end) {
          edits.push({
            node: ranges[k].node,
            local: rep.gs - ranges[k].start,
            len: rep.ge - rep.gs,
            to: rep.to
          });
          break;
        }
      }
    }
    // Apply largest local offset first so earlier offsets stay valid; edits in
    // different nodes are independent.
    edits.sort(function (a, b) { return b.local - a.local; });
    for (var e = 0; e < edits.length; e++) {
      var ed = edits[e];
      var nv = ed.node.nodeValue;
      ed.node.nodeValue = nv.slice(0, ed.local) + ed.to + nv.slice(ed.local + ed.len);
    }
  }

  function sweep() {
    if (!loaded) return;
    for (var i = 0; i < IDS.length; i++) {
      sweepEl(document.getElementById(IDS[i]));
    }
  }

  function load() {
    fetch("awara-smooth.json?v=" + VER)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        build(data);
        sweep();
        setTimeout(sweep, 400);
        setTimeout(sweep, 1200);
        setInterval(sweep, 1000);
      })
      .catch(function () {});
  }
  function reload() { load(); }

  window.AwaraSmooth = { __ready: true, fix: fix, sweep: sweep, reload: reload };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) sweep();
  });
})();
