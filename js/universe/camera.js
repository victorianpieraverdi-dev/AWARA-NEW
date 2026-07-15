// AWARA · Universe mobile camera (extracted from index.html, block 7)
// Touch drag / pinch-zoom / double-tap reset for the player universe scene.
// Exposes globals: resetUniverseCamera, universeMobileReset, universeMobileZoom,
//                  setUniverseMobileMode, getUniverseSceneMetrics
(function(){
  var camera = { zoom: 1, x: 0, y: 0, min: 0.72, max: 1.65 };
  var drag = null;
  var pinch = null;
  var lastTap = 0;

  function isPhone() {
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }

  function view() {
    return document.querySelector('#awara-app #view');
  }

  window.getUniverseSceneMetrics = function() {
    var v = document.getElementById('view');
    var w = v ? v.offsetWidth : window.innerWidth;
    var h = v ? v.offsetHeight : window.innerHeight;
    var mobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    var zoom = mobile ? (window.universeMobileSceneZoom || 1) : 1;
    return {
      view: v, w: w, h: h, mobile: mobile, zoom: zoom,
      sceneScale: mobile ? Math.max(0.62, Math.min(0.86, w / 560)) * zoom : 1,
      cx: w / 2,
      cy: h / 2
    };
  };

  function applyCamera() {
    window.universeMobileSceneZoom = camera.zoom;
    var app = document.getElementById('awara-app');
    if (app) app.style.setProperty('--mobile-scene-zoom', camera.zoom.toFixed(3));
    if (typeof render === 'function') render();
    if (typeof initZodiacRing === 'function') initZodiacRing();
  }

  function resetCamera() {
    camera.zoom = 1;
    camera.x = 0;
    camera.y = 0;
    applyCamera();
  }

  function zoomCamera(factor) {
    camera.zoom = Math.max(camera.min, Math.min(camera.max, camera.zoom * factor));
    applyCamera();
  }

  function distance(t1, t2) {
    var dx = t1.clientX - t2.clientX;
    var dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function installResetButton() {
    var btn = document.getElementById('universe-camera-reset');
    if (btn) btn.remove();
  }

  function installHint() {
    if (document.getElementById('universe-camera-hint')) return;
    var hint = document.createElement('div');
    hint.id = 'universe-camera-hint';
    hint.textContent = 'ДВИГАЙ ОДНИМ ПАЛЬЦЕМ · МАСШТАБ ДВУМЯ';
    hint.style.cssText = 'display:none;position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:90019;padding:7px 11px;border-radius:999px;background:rgba(4,2,18,0.52);border:1px solid rgba(201,168,76,0.18);color:rgba(255,248,214,0.48);font-family:JetBrains Mono,monospace;font-size:7px;letter-spacing:0.12em;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:none;transition:opacity 0.4s;';
    document.body.appendChild(hint);
  }

  function refreshResetButton() {
    var hint = document.getElementById('universe-camera-hint');
    var app = document.getElementById('awara-app');
    var visible = app && app.style.display !== 'none' && isPhone() && app.classList.contains('mobile-overview');
    if (hint) hint.style.display = visible ? 'block' : 'none';
  }

  function setMode(mode) {
    var app = document.getElementById('awara-app');
    if (!app) return;
    app.classList.toggle('mobile-focus', mode === 'focus');
    app.classList.toggle('mobile-overview', mode === 'overview');
    document.body.classList.toggle('universe-mobile-focus', mode === 'focus');
    document.body.classList.toggle('universe-mobile-overview', mode === 'overview');
    if (mode === 'focus') resetCamera();
    refreshResetButton();
    setTimeout(function(){
      if (typeof initCanvases === 'function') initCanvases();
      if (typeof render === 'function') render();
      if (typeof initZodiacRing === 'function') initZodiacRing();
    }, 80);
  }

  function bindCamera() {
    var v = view();
    if (!v || v.dataset.cameraBound) return;
    v.dataset.cameraBound = '1';
    applyCamera();

    v.addEventListener('touchstart', function(e) {
      if (!isPhone()) return;
      if (e.touches.length === 1) {
        var now = Date.now();
        if (now - lastTap < 280) resetCamera();
        lastTap = now;
        drag = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          startX: camera.x,
          startY: camera.y
        };
      } else if (e.touches.length === 2) {
        pinch = {
          dist: distance(e.touches[0], e.touches[1]),
          zoom: camera.zoom
        };
      }
    }, { passive: true });

    v.addEventListener('touchmove', function(e) {
      if (!isPhone()) return;
      if (e.touches.length === 1 && drag) {
        e.preventDefault();
        camera.x = Math.max(-90, Math.min(90, drag.startX + e.touches[0].clientX - drag.x));
        camera.y = Math.max(-120, Math.min(120, drag.startY + e.touches[0].clientY - drag.y));
      } else if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        var ratio = distance(e.touches[0], e.touches[1]) / pinch.dist;
        camera.zoom = Math.max(camera.min, Math.min(camera.max, pinch.zoom * ratio));
        applyCamera();
      }
    }, { passive: false });

    v.addEventListener('touchend', function(e) {
      if (e.touches.length === 0) {
        drag = null;
        pinch = null;
      }
    }, { passive: true });
  }

  window.resetUniverseCamera = resetCamera;
  window.universeMobileReset = resetCamera;
  window.universeMobileZoom = zoomCamera;
  window.setUniverseMobileMode = setMode;
  document.addEventListener('DOMContentLoaded', function() {
    installResetButton();
    installHint();
    bindCamera();
    refreshResetButton();
    if (isPhone()) setMode('focus');
    setInterval(function() {
      bindCamera();
      refreshResetButton();
      var app = document.getElementById('awara-app');
      if (app && isPhone() && !app.classList.contains('mobile-focus') && !app.classList.contains('mobile-overview')) setMode('focus');
    }, 1000);
  });
})();
