/* AWARA · FX LAYER (v1)
   Аддитивный слой эффектов поверх Linear + Aceternity DS.
   — внедряет awara-fx.css;
   — Card Spotlight (радиальный блик за курсором в стеклянных карточках);
   — золотые Sparkles при клике по кнопкам;
   — пословное проявление (Text Generate) ответов Даймона в #aiChat.
   Ничего не ломает: всё обёрнуто в гарды и try/catch. */
(function () {
  "use strict";

  try {
    if (!document.querySelector('link[data-awara-fx]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'awara-fx.css?v=2';
      link.setAttribute('data-awara-fx', '1');
      document.head.appendChild(link);
    }
  } catch (e) {}

  var reduce = false;
  try {
    reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* 1) CARD SPOTLIGHT */
  document.addEventListener('pointermove', function (e) {
    var t = e.target;
    var card = (t && t.closest) ? t.closest('.awara-glass-card') : null;
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* 2) SPARKLES */
  function burst(x, y, host) {
    if (reduce) return;
    var n = 12;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'aw-spark';
      var ang = (Math.PI * 2) * (i / n) + Math.random() * 0.6;
      var dist = 20 + Math.random() * 38;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
      s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
      s.style.animationDelay = (Math.random() * 70).toFixed(0) + 'ms';
      host.appendChild(s);
      (function (el) {
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
      })(s);
    }
  }
  document.addEventListener('click', function (e) {
    var b = (e.target && e.target.closest) ? e.target.closest('.awara-gold-button, .btn:not(.ghost)') : null;
    if (!b) return;
    var host = document.querySelector('.phone') || document.body;
    var hr = host.getBoundingClientRect();
    burst(e.clientX - hr.left, e.clientY - hr.top, host);
  }, true);

  /* 3) TEXT GENERATE */
  function reveal(el) {
    if (el.getAttribute('data-aw-gen')) return;
    var txt = el.textContent;
    if (!txt || !txt.trim()) return;
    el.setAttribute('data-aw-gen', '1');
    if (reduce) return;
    var parts = txt.split(/(\s+)/);
    el.textContent = '';
    var k = 0;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      if (!p.trim()) { el.appendChild(document.createTextNode(p)); continue; }
      var w = document.createElement('span');
      w.className = 'aw-word';
      w.textContent = p;
      w.style.animationDelay = (k * 32) + 'ms';
      el.appendChild(w);
      k++;
    }
  }
  function track(node) {
    if (node.getAttribute('data-aw-track')) return;
    node.setAttribute('data-aw-track', '1');
    var timer = null;
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(finish, 350);
    });
    function finish() { mo.disconnect(); reveal(node); }
    mo.observe(node, { childList: true, characterData: true, subtree: true });
    clearTimeout(timer);
    timer = setTimeout(finish, 350);
  }
  function watchChat() {
    var chat = document.getElementById('aiChat');
    if (!chat) return;
    Array.prototype.forEach.call(chat.querySelectorAll('.bub.daimon'), track);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes || [], function (node) {
          if (node.nodeType === 1 && node.classList &&
              node.classList.contains('bub') && node.classList.contains('daimon')) {
            track(node);
          }
        });
      });
    }).observe(chat, { childList: true });
  }
  if (document.readyState !== 'loading') watchChat();
  else document.addEventListener('DOMContentLoaded', watchChat);
})();
