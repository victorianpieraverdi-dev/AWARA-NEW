/* AWARA . Daimon chat. Adds a reply box under the one-way "Daimon speaks"
   panel so the player can answer and hold a living conversation. ASCII source;
   all Russian UI text and prompt parts come from awara-daimon-chat.json.
   - Depth of the Daimon's reply scales with STATE.trust.
   - The Daimon asks clarifying questions (guide prompt).
   - Conversation is persisted in localStorage and always reopenable.
   - Soft per-day counter, no hard limit yet. */
(function () {
  "use strict";
  if (window.AwaraDaimonChat && window.AwaraDaimonChat.__ready) return;
  var VER = 1;
  var KEY = "awara_daimon_chat";
  var T = null, P = null, loaded = false, busy = false;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function getState() {
    try { if (typeof STATE !== "undefined") return STATE; } catch (e) {}
    return null;
  }
  function dname() {
    var s = getState();
    try { if (s && s.daimon && s.daimon.name) return s.daimon.name; } catch (e) {}
    return (T && T.ui && T.ui.daimon) ? T.ui.daimon : "Daimon";
  }
  function dtrust() {
    var s = getState();
    try { if (s && typeof s.trust === "number") return s.trust; } catch (e) {}
    return 0;
  }
  function opener() {
    try {
      var raw = localStorage.getItem("awara_daimon_live");
      if (raw) { var o = JSON.parse(raw); if (o && o.txt) return o.txt; }
    } catch (e) {}
    return "";
  }

  function loadStore() {
    var o = { day: today(), count: 0, turns: [] };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && typeof p === "object") {
          o.turns = p.turns || [];
          o.day = p.day || o.day;
          o.count = p.count || 0;
        }
      }
    } catch (e) {}
    if (o.day !== today()) { o.day = today(); o.count = 0; }
    return o;
  }
  function saveStore(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }

  function sysPrompt() {
    var base = "";
    try { base = (typeof window.aiSystem === "function") ? window.aiSystem("daimon") : ""; } catch (e) { base = ""; }
    if (!base) base = "You are the living Daimon companion in the AWARA game.";
    try { if (typeof window.awaraHumanVoice === "function") base = base + "\n\n" + window.awaraHumanVoice(); } catch (e) {}
    var name = dname(), tr = dtrust();
    var depth = tr < 30 ? P.depthLow : (tr < 80 ? P.depthMid : P.depthHigh);
    var add = [P.frame, depth, P.guide].join(" ");
    add = add.replace(/\{name\}/g, name).replace(/\{trust\}/g, tr);
    return base + "\n\n" + add;
  }

  function buildMessages(o) {
    var msgs = [{ role: "system", content: sysPrompt() }];
    var hasA = false;
    for (var i = 0; i < o.turns.length; i++) { if (o.turns[i].r === "d") { hasA = true; break; } }
    if (!hasA) { var op = opener(); if (op) msgs.push({ role: "assistant", content: op }); }
    for (var j = 0; j < o.turns.length; j++) {
      var tn = o.turns[j];
      msgs.push({ role: tn.r === "d" ? "assistant" : "user", content: tn.t });
    }
    return msgs;
  }

  function dBody(text) {
    try { return (typeof window.aiMd === "function") ? window.aiMd(text) : ('<p class="adv">' + esc(text) + "</p>"); }
    catch (e) { return '<p class="adv">' + esc(text) + "</p>"; }
  }
  function threadHtml(o) {
    if (!o.turns.length) return '<p class="adv" style="opacity:.6">' + esc(T.ui.empty) + "</p>";
    var h = "";
    for (var i = 0; i < o.turns.length; i++) {
      var tn = o.turns[i];
      if (tn.r === "d") {
        h += '<div class="dch-d"><span class="dch-who">' + esc(dname()) + '</span><div class="dch-body">' + dBody(tn.t) + "</div></div>";
      } else {
        h += '<div class="dch-u"><span class="dch-who">' + esc(T.ui.you) + '</span><div class="dch-txt">' + esc(tn.t) + "</div></div>";
      }
    }
    return h;
  }

  function scrollThread() { var t = $("dch-thread"); if (t) t.scrollTop = t.scrollHeight; }

  function render(card) {
    var o = loadStore();
    var head = '<div class="dl-h"><span class="label">' + esc(T.ui.title) +
      '</span><button class="dch-rs" title="' + esc(T.ui.restart) + '">' + esc(T.ui.restart) + "</button></div>";
    var thread = '<div class="dch-thread" id="dch-thread">' + threadHtml(o) + "</div>";
    var meta = '<div class="dch-meta">' + esc(T.ui.counter) + o.count + esc(T.ui.times) + "</div>";
    var input = '<div class="dch-in"><textarea class="dch-ta" id="dch-ta" rows="2" placeholder="' +
      esc(T.ui.placeholder) + '"></textarea><button class="dch-send" id="dch-send">' + esc(T.ui.send) + "</button></div>";
    card.innerHTML = head + thread + meta + input;
    bind(card);
    scrollThread();
  }

  function bind(card) {
    var send = card.querySelector("#dch-send");
    var ta = card.querySelector("#dch-ta");
    var rs = card.querySelector(".dch-rs");
    if (send && ta) {
      send.onclick = function () { doSend(ta.value); };
      ta.onkeydown = function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.keyCode === 13)) { e.preventDefault(); doSend(ta.value); }
      };
    }
    if (rs) {
      rs.onclick = function () {
        var o = loadStore(); o.turns = []; saveStore(o);
        var c = $("dchat"); if (c) render(c);
      };
    }
  }

  function appendBubble(html) {
    var thread = $("dch-thread");
    if (thread) { thread.insertAdjacentHTML("beforeend", html); scrollThread(); }
  }
  function loadBubble() {
    return '<div class="dch-d dch-load"><span class="dch-who">' + esc(dname()) +
      '</span><div class="dch-body"><p class="adv">' + esc(dname() + T.ui.sending) + "</p></div></div>";
  }
  function removeLoad() {
    var card = $("dchat"); if (!card) return;
    var l = card.querySelector(".dch-load"); if (l && l.parentNode) l.parentNode.removeChild(l);
  }

  function doSend(text) {
    text = ("" + text).trim();
    if (!text || busy) return;
    if (typeof window.aiCall !== "function") {
      appendBubble('<div class="dch-d"><span class="dch-who">' + esc(dname()) +
        '</span><div class="dch-body"><p class="adv" style="font-size:13px;opacity:.8">' + esc(dname() + T.ui.noai) + "</p></div></div>");
      return;
    }
    busy = true;
    var o = loadStore();
    o.turns.push({ r: "u", t: text, ts: Date.now() });
    saveStore(o);
    var card = $("dchat"); if (card) render(card);
    appendBubble(loadBubble());
    var sb = $("dch-send"); if (sb) sb.disabled = true;
    window.aiCall(buildMessages(o)).then(function (txt) {
      var reply = ("" + txt).replace(/\s+$/, "");
      var o2 = loadStore();
      o2.turns.push({ r: "d", t: reply, ts: Date.now() });
      o2.count = (o2.count || 0) + 1;
      saveStore(o2);
      try {
        if (text && text.length >= 8) {
          if (window.AwaraLight && typeof window.AwaraLight.addParticles === "function") window.AwaraLight.addParticles(1);
          if (window.AwaraMera && typeof window.AwaraMera.route === "function") window.AwaraMera.route(text, 1.5);
        }
      } catch (e) {}
      busy = false;
      var c = $("dchat"); if (c) render(c);
    }).catch(function () {
      busy = false;
      removeLoad();
      appendBubble('<div class="dch-d"><span class="dch-who">' + esc(dname()) +
        '</span><div class="dch-body"><p class="adv" style="font-size:13px;opacity:.8">' + esc(dname() + T.ui.noai) + "</p></div></div>");
      var sb2 = $("dch-send"); if (sb2) sb2.disabled = false;
    });
  }

  function styleOnce() {
    if ($("dch-style")) return;
    var st = document.createElement("style"); st.id = "dch-style";
    st.textContent =
      "#dchat{border:1px solid rgba(123,98,201,.4);background:linear-gradient(165deg,rgba(123,98,201,.12),rgba(201,168,76,.04));margin-top:16px}" +
      "#dchat .dl-h{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
      "#dchat .dch-rs{background:none;border:1px solid var(--line);color:var(--muted);border-radius:8px;font-size:11px;padding:3px 9px;cursor:pointer;font-family:'JetBrains Mono',monospace}" +
      "#dchat .dch-rs:hover{color:var(--violet-soft);border-color:rgba(123,98,201,.6)}" +
      "#dchat .dch-thread{max-height:340px;overflow-y:auto;margin:10px 0;display:flex;flex-direction:column;gap:10px}" +
      "#dchat .dch-who{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;font-family:'JetBrains Mono',monospace}" +
      "#dchat .dch-u{align-self:flex-end;max-width:85%;text-align:right}" +
      "#dchat .dch-u .dch-txt{display:inline-block;background:rgba(201,168,76,.14);border:1px solid rgba(201,168,76,.3);border-radius:12px 12px 4px 12px;padding:8px 12px;white-space:pre-wrap;text-align:left}" +
      "#dchat .dch-d{align-self:flex-start;max-width:92%}" +
      "#dchat .dch-d .dch-body{background:rgba(123,98,201,.12);border:1px solid rgba(123,98,201,.3);border-radius:12px 12px 12px 4px;padding:6px 12px}" +
      "#dchat .dch-d .dch-body p:first-child{margin-top:4px}#dchat .dch-d .dch-body p:last-child{margin-bottom:4px}" +
      "#dchat .dch-load p{animation:dchPulse 1.4s ease-in-out infinite}" +
      "@keyframes dchPulse{0%,100%{opacity:.45}50%{opacity:.95}}" +
      "#dchat .dch-meta{font-size:11px;color:var(--muted);margin:2px 0 10px;font-family:'JetBrains Mono',monospace}" +
      "#dchat .dch-in{display:flex;gap:8px;align-items:flex-end}" +
      "#dchat .dch-ta{flex:1;background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:10px;color:inherit;padding:9px 12px;font-family:inherit;font-size:14px;resize:vertical;min-height:42px}" +
      "#dchat .dch-ta:focus{outline:none;border-color:rgba(123,98,201,.6)}" +
      "#dchat .dch-send{background:linear-gradient(135deg,var(--violet),var(--violet-soft));border:none;color:#fff;border-radius:10px;padding:10px 16px;cursor:pointer;font-weight:600;white-space:nowrap}" +
      "#dchat .dch-send:disabled{opacity:.5;cursor:default}";
    document.head.appendChild(st);
  }

  function ensure() {
    if (!loaded) return null;
    var sd = $("s-daimon"); if (!sd) return null;
    var card = $("dchat");
    if (card) return card;
    card = document.createElement("div");
    card.id = "dchat";
    card.className = "card awara-glass-card";
    var live = $("dl-live");
    if (live && live.parentNode) {
      if (live.nextSibling) live.parentNode.insertBefore(card, live.nextSibling);
      else live.parentNode.appendChild(card);
    } else {
      sd.appendChild(card);
    }
    render(card);
    return card;
  }

  function wireNav() {
    var btns = document.querySelectorAll('.nav button[data-nav="daimon"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute("data-dch") === "1") continue;
      b.setAttribute("data-dch", "1");
      b.addEventListener("click", function () { setTimeout(ensure, 500); }, false);
    }
  }

  function boot() {
    try { styleOnce(); } catch (e) {}
    wireNav();
    var sd = $("s-daimon");
    if (sd && ("" + sd.className).indexOf("active") >= 0) setTimeout(ensure, 600);
  }

  function load() {
    fetch("awara-daimon-chat.json?v=" + VER)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        T = { ui: data.ui || {} };
        P = data.prompt || {};
        loaded = true;
        boot();
      })
      .catch(function () {});
  }

  window.AwaraDaimonChat = { __ready: true, ensure: ensure, reload: load, send: doSend };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(load, 200); });
  } else {
    setTimeout(load, 200);
  }
  setTimeout(wireNav, 1000);
  setTimeout(wireNav, 2000);
})();
