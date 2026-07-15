/* AWARA · Smooth transitions:
   - screens fade-in on navigation
   - modal windows (libModal / genModal / aiModal) open AND close softly
   - AwaraFx.toggle(): shared smooth expand/collapse for foldable panels
   Additive, idempotent, engine untouched. Boot phase is neutralized by
   html.aw-booting, so there is no flash on first load. */
(function () {
  "use strict";
  if (window.AwaraTransitions && window.AwaraTransitions.__ready) return;

  var CSS = [
    "/* screen fade-in on navigation */",
    ".screen.aw-scrin{animation:awScrIn .36s cubic-bezier(.2,.7,.2,1) both}",
    "@keyframes awScrIn{0%{opacity:0;transform:translateY(10px) scale(.995)}100%{opacity:1;transform:none}}",
    "/* modal windows: smooth open AND close */",
    ".libmodal{display:flex!important;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s ease,visibility .3s ease}",
    ".libmodal.open{opacity:1;visibility:visible;pointer-events:auto}",
    ".libmodal>.libcard{transform:translateY(16px) scale(.95);opacity:.5;transition:transform .34s cubic-bezier(.2,.7,.2,1),opacity .3s ease}",
    ".libmodal.open>.libcard{transform:none;opacity:1}",
    "/* foldable panels slide */",
    ".aw-foldbody{will-change:height}",
    "@media (prefers-reduced-motion:reduce){.screen.aw-scrin{animation-duration:.001s}.libmodal,.libmodal>.libcard{transition-duration:.001s}}"
  ].join("\n");

  function injectCss() {
    if (document.getElementById("aw-transitions-css")) return;
    var s = document.createElement("style");
    s.id = "aw-transitions-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // ---- shared smooth expand/collapse for foldable panels ----
  var Fx = {
    toggle: function (el, open, animate) {
      if (!el) return;
      if (!animate) {
        clearTimeout(el.__fxT);
        el.style.transition = "";
        el.style.height = "";
        el.style.overflow = "";
        el.style.opacity = "";
        el.style.display = open ? "" : "none";
        return;
      }
      if (open) {
        el.style.display = "";
        el.style.overflow = "hidden";
        var h = el.scrollHeight;
        el.style.height = "0px";
        el.style.opacity = "0";
        void el.offsetWidth;
        el.style.transition = "height .34s cubic-bezier(.2,.7,.2,1),opacity .3s ease";
        el.style.height = h + "px";
        el.style.opacity = "1";
        clearTimeout(el.__fxT);
        el.__fxT = setTimeout(function () {
          el.style.transition = ""; el.style.height = ""; el.style.overflow = ""; el.style.opacity = "";
        }, 380);
      } else {
        el.style.overflow = "hidden";
        var h2 = el.scrollHeight;
        el.style.height = h2 + "px";
        el.style.opacity = "1";
        void el.offsetWidth;
        el.style.transition = "height .34s cubic-bezier(.2,.7,.2,1),opacity .3s ease";
        el.style.height = "0px";
        el.style.opacity = "0";
        clearTimeout(el.__fxT);
        el.__fxT = setTimeout(function () {
          el.style.display = "none"; el.style.transition = ""; el.style.height = ""; el.style.overflow = ""; el.style.opacity = "";
        }, 380);
      }
    }
  };
  window.AwaraFx = Fx;

  function animateActiveScreen() {
    try {
      var d = document.documentElement;
      if (d.classList.contains("aw-booting") || d.classList.contains("aw-solo-istok")) return;
      var s = document.querySelector(".screen.active");
      if (!s) return;
      s.classList.remove("aw-scrin");
      void s.offsetWidth;
      s.classList.add("aw-scrin");
    } catch (e) {}
  }

  function wrapGo() {
    if (typeof window.go !== "function" || window.go.__awfx) return;
    var orig = window.go;
    var w = function () {
      var r = orig.apply(this, arguments);
      animateActiveScreen();
      return r;
    };
    w.__awfx = true;
    window.go = w;
  }

  function boot() {
    injectCss();
    wrapGo();
    var n = 0;
    var iv = setInterval(function () {
      wrapGo();
      if ((window.go && window.go.__awfx) || ++n > 24) clearInterval(iv);
    }, 300);
  }

  window.AwaraTransitions = { __ready: true, __v: 2 };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
