/* AWARA . Istok 'here and now' + foldable lore cards.
   1) Replaces the cluttered #istokChron rows with a compact, gentle snapshot
      of level (Mera + light) and experience (day / streak / open windows).
   2) Makes the long reading cards on Istok ('Tvoy mif' / 'Dukhovny portret')
      collapsible by clicking their label. Collapsed by default so they do not
      strain the eyes every time; state remembered in localStorage.
   SILENT, soft wording, no scary labels. Pure ASCII source; Cyrillic via \u. */
(function () {
  "use strict";
  if (window.AwaraIstokNow && window.AwaraIstokNow.__ready) return;

  function $(id) { return document.getElementById(id); }

  // ---------- compact 'here and now' summary ----------

  // Gentle, non-diagnostic display names for each Mera (1..9).
  var SOFT = {
    1: "\u0422\u0435\u043b\u043e \u0438 \u043f\u043e\u0447\u0432\u0430",          // Telo i pochva
    2: "\u041e\u0447\u0438\u0449\u0435\u043d\u0438\u0435",                        // Ochishchenie
    3: "\u041b\u0430\u0434 \u0441 \u043c\u0438\u0440\u043e\u043c",               // Lad s mirom
    4: "\u0416\u0438\u0432\u043e\u0435 \u0447\u0443\u0432\u0441\u0442\u0432\u043e", // Zhivoe chuvstvo
    5: "\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c",      // Tselostnost
    6: "\u0421\u043b\u0443\u0436\u0435\u043d\u0438\u0435",                        // Sluzhenie
    7: "\u0421\u0438\u044f\u043d\u0438\u0435",                                      // Siyanie
    8: "\u0417\u043e\u0432 \u0434\u0443\u0445\u0430",                              // Zov dukha
    9: "\u0421\u0432\u043e\u0431\u043e\u0434\u0430"                                  // Svoboda
  };

  var L_MERA = "\u041c\u0435\u0440\u0430";       // Mera
  var L_SVET = "\u0421\u0432\u0435\u0442";       // Svet
  var L_DEN = "\u0414\u0435\u043d\u044c";        // Den
  var L_SER = "\u0441\u0435\u0440\u0438\u044f";  // seriya
  var L_OKON = "\u043e\u043a\u043e\u043d";       // okon
  var IC = '<span class="icon-placeholder"></span> ';

  function store() {
    try { return JSON.parse(localStorage.getItem("tigel_v1") || "{}"); } catch (e) { return {}; }
  }
  function lv() {
    try { if (typeof window.lightVal === "function") { var v = window.lightVal(); if (typeof v === "number" && !isNaN(v)) return Math.round(v); } } catch (e) {}
    var s = store(); return Math.max(0, Math.min(100, Math.round((s.baseLight || 48) + (s.lightBonus || 0))));
  }
  function lightState() {
    try { if (window.AwaraLight && typeof window.AwaraLight.state === "function") return window.AwaraLight.state(); } catch (e) {}
    return null;
  }
  function meraNum(st) {
    if (st && st.mera) return st.mera;
    var v = lv(); return Math.max(1, Math.min(9, Math.round(v / 100 * 9)));
  }
  function dayNum(s) { var d = (s.days ? s.days.length : 0) - 27; return d > 0 ? d : 1; }

  function paint() {
    var box = $("istokChron"); if (!box) return;
    var s = store(), st = lightState();
    var v = lv(), m = meraNum(st), nm = SOFT[m] || "";
    var day = dayNum(s), streak = s.streak || 0;
    var open = st ? st.open : null;
    var html = "";
    html += '<div class="trait"><span>' + IC + L_MERA + '</span><b>' + m + (nm ? ' \u00b7 ' + nm : '') + '</b></div>';
    html += '<div class="trait"><span>' + IC + L_SVET + '</span><b>' + v + '/100</b></div>';
    var right = (open != null) ? (L_OKON + ' ' + open + '/9') : '';
    html += '<div class="trait" style="border:none"><span>' + IC + L_DEN + ' ' + day + ' \u00b7 ' + L_SER + ' ' + streak + '</span><b>' + right + '</b></div>';
    box.innerHTML = html;
  }

  // ---------- foldable lore cards ----------

  // Labels (lowercased substrings) of cards that should be collapsible.
  var FOLD_KEYS = [
    "\u043c\u0438\u0444",                       // mif  (Tvoy mif)
    "\u043f\u043e\u0440\u0442\u0440\u0435\u0442" // portret (Dukhovny portret)
    /* khronika: handled by awara-day-generation.js fixChronikaStyling */
  ];

  function foldCards() {
    var scr = $("s-istok"); if (!scr) return;
    var cards = scr.querySelectorAll(".card"); var i;
    for (i = 0; i < cards.length; i++) tryFold(cards[i]);
    var sp = document.getElementById("soulPortrait");
    if (sp) tryFold(sp);
  }

  function labelKey(label) {
    return (label.textContent || "").toLowerCase().replace(/[\u25b8\u25be]/g, "").replace(/\s+/g, " ").trim();
  }

  function tryFold(card) {
    var label = card.querySelector(".label"); if (!label) return;
    var t = labelKey(label);
    var match = false, j;
    for (j = 0; j < FOLD_KEYS.length; j++) { if (t.indexOf(FOLD_KEYS[j]) >= 0) { match = true; break; } }
    if (!match) return;

    var keyId = "awara_istok_fold_" + encodeURIComponent(t.replace(/\s+/g, "_")).slice(0, 40);
    function get() { try { return localStorage.getItem(keyId) || "collapsed"; } catch (e) { return "collapsed"; } }
    function set(v) { try { localStorage.setItem(keyId, v); } catch (e) {} }

    var wrap = card.querySelector(".aw-foldbody");
    var caret = label.__awCaret;

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "aw-foldbody";
      var kids = [], k;
      for (k = 0; k < card.childNodes.length; k++) { if (card.childNodes[k] !== label) kids.push(card.childNodes[k]); }
      for (k = 0; k < kids.length; k++) wrap.appendChild(kids[k]);
      card.appendChild(wrap);
    }

    if (!label.__awFoldInit) {
      label.__awFoldInit = true;
      label.style.cursor = "pointer";
      label.style.userSelect = "none";
      caret = document.createElement("span");
      caret.style.float = "right";
      caret.style.opacity = "0.55";
      caret.style.fontSize = "12px";
      label.__awCaret = caret;
      label.appendChild(caret);
      label.addEventListener("click", function (e) {
        e.stopPropagation();
        card.__awUserToggled = true;
        set(get() === "open" ? "collapsed" : "open");
        card.__awApply(true, false);
      });
    }

    if (caret && caret.parentNode !== label) label.appendChild(caret);

    card.__folded = true;
    card.__awApply = function (animate, force) {
      var open = force ? false : (card.__awUserToggled && get() === "open");
      wrap.setAttribute("data-fold", open ? "1" : "0");
      wrap.classList.toggle("is-collapsed", !open);
      if (window.AwaraFx) window.AwaraFx.toggle(wrap, open, !!animate);
      else wrap.style.display = open ? "" : "none";
      if (label.__awCaret) label.__awCaret.textContent = open ? "\u25be" : "\u25b8";
    };
    card.__awApply(false, false);
  }

  function collapseLore() {
    var scr = $("s-istok"); if (!scr) return;
    var cards = scr.querySelectorAll(".card"), i;
    for (i = 0; i < cards.length; i++) {
      if (!cards[i].__folded || !cards[i].__awApply) continue;
      cards[i].__awUserToggled = false;
      cards[i].__awApply(false, true);
    }
    var sp = document.getElementById("soulPortrait");
    if (sp && sp.__awApply) {
      sp.__awUserToggled = false;
      sp.__awApply(false, true);
    }
  }

  // ---------- reorder: move 'Tvoy mif' below 'Dukhovny portret' ----------

  function findCardByLabel(scr, key) {
    var cards = scr.querySelectorAll(".card"), i, lb, t;
    for (i = 0; i < cards.length; i++) {
      lb = cards[i].querySelector(".label");
      if (!lb) continue;
      t = labelKey(lb);
      if (t.indexOf(key) >= 0) return cards[i];
    }
    return null;
  }

  function reorderLore() {
    var scr = $("s-istok"); if (!scr) return;
    var mif = findCardByLabel(scr, FOLD_KEYS[0]);
    var portret = findCardByLabel(scr, FOLD_KEYS[1]);
    if (mif && portret && mif !== portret && portret.nextSibling !== mif) {
      portret.parentNode.insertBefore(mif, portret.nextSibling);
    }
  }

  // ---------- keep applied ----------

  function wrap() {
    try {
      if (typeof window.renderIstok === "function" && !window.renderIstok.__nowWrapped) {
        var _ri = window.renderIstok;
        window.renderIstok = function () {
          var r = _ri.apply(this, arguments);
          try { paint(); } catch (e) {}
          try { foldCards(); } catch (e) {}

          return r;
        };
        window.renderIstok.__nowWrapped = true;
      }
    } catch (e) {}
  }

  function tick() {
    wrap();
    try { paint(); } catch (e) {}
    try { foldCards(); } catch (e) {}
    try { reorderLore(); } catch (e) {}
  }

  function boot() {
    tick();
    collapseLore();
    setTimeout(tick, 700);
    setTimeout(collapseLore, 720);
    setTimeout(tick, 1800);
    setTimeout(tick, 3400);
  }

  window.AwaraIstokNow = { __ready: true, __v: 9, refresh: function () {
    paint();
    foldCards();
    try { if (window.AwaraIstokFold && window.AwaraIstokFold.refresh) window.AwaraIstokFold.refresh(); } catch (e) {}
  }, collapseLore: collapseLore };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
