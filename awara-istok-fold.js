/* AWARA · Istok fold: collapse the Light/Awareness indicator and the
   'Khronika puti' block by DEFAULT. Each panel opens only on its own header
   click — never together. Additive, idempotent, no engine changes. */
(function () {
  "use strict";
  if (window.AwaraIstokFold && window.AwaraIstokFold.__ready) return;

  (function injectFoldCss() {
    if (document.getElementById("aw-istok-fold-css")) return;
    var s = document.createElement("style");
    s.id = "aw-istok-fold-css";
    s.textContent = [
      "#awaraLightOrb:not([data-aw-fold='1']) .lo-head,",
      "#awaraLightOrb:not([data-aw-fold='1']) .lo-elwrap{display:none!important}",
      "#chronCardWrap:not([data-aw-fold='1']) .aw-foldbody{display:none!important}",
      "#s-istok .aw-foldbody[data-fold='0']{display:none!important}",
      "#s-istok>h2{display:none!important}",
      "#s-istok>#istokChron.card{display:none!important}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  })();

  function $(id) { return document.getElementById(id); }
  function get(k, def) { try { return localStorage.getItem(k) || def; } catch (e) { return def; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function caret(open) { return open ? "\u25be" : "\u25b8"; }

  var K_LIGHT = "awara_istok_fold_light";
  var K_CHRON = "awara_istok_fold_chron";
  var K_CHRON_V4 = "awara_chron_v4";

  function setHostFold(host, open) {
    if (!host) return;
    host.setAttribute("data-aw-fold", open ? "1" : "0");
  }

  function setEl(el, open, animate) {
    if (!el) return;
    if (!animate && el.__awOpen === open) {
      if (!open && el.style.display !== "none") {
        if (window.AwaraFx) window.AwaraFx.toggle(el, false, false);
        else el.style.display = "none";
      }
      return;
    }
    el.__awOpen = open;
    if (window.AwaraFx) window.AwaraFx.toggle(el, open, !!animate);
    else el.style.display = open ? "" : "none";
  }

  function lightOpen(host, forceClosed) {
    if (forceClosed) return false;
    if (!host || !host.__awUserToggled) return false;
    return get(K_LIGHT, "collapsed") === "open";
  }

  function chronOpen(wrap, forceClosed) {
    if (forceClosed) return false;
    if (!wrap || !wrap.__awUserToggled) return false;
    return get(K_CHRON_V4, "collapsed") === "open";
  }

  function foldLight(animate, forceClosed) {
    var host = $("awaraLightOrb"); if (!host) return;
    var label = $("loLabel"); if (!label) return;
    var head = host.querySelector(".lo-head");
    var elw = host.querySelector(".lo-elwrap");
    var open = lightOpen(host, !!forceClosed);
    setHostFold(host, open);
    setEl(head, open, animate);
    setEl(elw, open, animate);
    if (!label.__awFoldInit) {
      label.__awFoldInit = true;
      label.style.cursor = "pointer";
      label.style.userSelect = "none";
      var c = document.createElement("span");
      c.className = "aif-caret";
      c.style.cssText = "float:right;opacity:.55;font-size:12px";
      label.__awCaret = c;
      label.addEventListener("click", function (e) {
        e.stopPropagation();
        host.__awUserToggled = true;
        set(K_LIGHT, get(K_LIGHT, "collapsed") === "open" ? "collapsed" : "open");
        foldLight(true, false);
      });
    }
    if (label.__awCaret && label.__awCaret.parentNode !== label) label.appendChild(label.__awCaret);
    if (label.__awCaret) label.__awCaret.textContent = caret(open);
  }

  function foldChron(animate, forceClosed) {
    var wrap = $("chronCardWrap");
    if (wrap) {
      var body = wrap.querySelector(".aw-foldbody");
      var label = wrap.querySelector(".label");
      var caretEl = label && label.querySelector("span[style*='float:right']");
      if (!body || !label) return;
      var open = chronOpen(wrap, !!forceClosed);
      setHostFold(wrap, open);
      body.setAttribute("data-fold", open ? "1" : "0");
      body.classList.toggle("is-collapsed", !open);
      setEl(body, open, animate);
      if (caretEl) caretEl.textContent = caret(open);
      return;
    }

    var chron = $("istokChron"); if (!chron) return;
    var h2 = null, p = chron.previousElementSibling;
    while (p) { if (p.tagName === "H2") { h2 = p; break; } p = p.previousElementSibling; }
    if (!h2) return;
    var openLegacy = forceClosed ? false : (h2.__awUserToggled && get(K_CHRON, "collapsed") === "open");
    setEl(chron, openLegacy, animate);
    if (!h2.__awFoldInit) {
      h2.__awFoldInit = true;
      h2.style.cursor = "pointer";
      h2.style.userSelect = "none";
      var c = document.createElement("span");
      c.style.cssText = "float:right;opacity:.55;font-size:12px;font-family:'JetBrains Mono',monospace";
      h2.__awCaret = c;
      h2.appendChild(c);
      h2.addEventListener("click", function (e) {
        e.stopPropagation();
        h2.__awUserToggled = true;
        set(K_CHRON, get(K_CHRON, "collapsed") === "open" ? "collapsed" : "open");
        foldChron(true, false);
      });
    }
    if (h2.__awCaret && h2.__awCaret.parentNode !== h2) h2.appendChild(h2.__awCaret);
    if (h2.__awCaret) h2.__awCaret.textContent = caret(openLegacy);
  }

  function collapseAll() {
    var host = $("awaraLightOrb");
    var wrap = $("chronCardWrap");
    if (host) host.__awUserToggled = false;
    if (wrap) wrap.__awUserToggled = false;
    try { foldLight(false, true); } catch (e) {}
    try { foldChron(false, true); } catch (e) {}
    try { if (window.__refreshChronFold) window.__refreshChronFold(false, true); } catch (e) {}
    try { if (window.AwaraIstokNow && window.AwaraIstokNow.collapseLore) window.AwaraIstokNow.collapseLore(); } catch (e) {}
  }

  function tick() {
    try { foldLight(false, false); } catch (e) {}
    try { foldChron(false, false); } catch (e) {}
  }

  function onIstokNav() {
    collapseAll();
    setTimeout(collapseAll, 80);
    setTimeout(tick, 400);
  }

  function boot() {
    collapseAll();
    setTimeout(tick, 500);
    setTimeout(tick, 1600);
    setInterval(tick, 2500);
  }

  if (typeof window.go === "function" && !window.go.__aif) {
    var _go = window.go;
    window.go = function (n) {
      var r = _go.apply(this, arguments);
      if (n === "istok") onIstokNav();
      return r;
    };
    window.go.__aif = true;
  }

  function wrapLightOrbRender() {
    function hook() {
      var R = window.AwaraLightOrb;
      if (!R || !R.render || R.__foldHook) return;
      var _lr = R.render;
      R.render = function () {
        var out = _lr.apply(this, arguments);
        try {
          var h = $("awaraLightOrb");
          if (h && !h.getAttribute("data-aw-fold")) setHostFold(h, false);
          foldLight(false, false);
        } catch (e) {}
        return out;
      };
      R.__foldHook = true;
    }
    hook();
    setTimeout(hook, 400);
    setTimeout(hook, 1600);
  }

  window.AwaraIstokFold = {
    __ready: true, __v: 6,
    refresh: tick,
    collapseAll: collapseAll,
    forceEntryCollapse: collapseAll,
    inEntryPhase: function () { return false; },
    armEntryPhase: function () {}
  };

  wrapLightOrbRender();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();