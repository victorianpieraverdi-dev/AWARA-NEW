// T-048: СКРЫТЬ КАЛЕНДАРНЫЕ ЭЛЕМЕНТЫ
(function hideCalendarUI() {
  var calendarKeywords = [
    'юлианский', 'григорианский', 'кармическая',
    'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];

  function hideElements() {
    var hiddenCount = 0;
    var raDaySub = document.getElementById('ra-day-sub');
    if (raDaySub && raDaySub.style.display !== 'none') {
      raDaySub.style.display = 'none';
      hiddenCount++;
    }
    var root = document.querySelector('#awara-app');
    if (!root) root = document.body;
    root.querySelectorAll('*').forEach(function(el) {
      if (el.id === 'ra-day-sub') return;
      if (el.id === 'ra-anchor' || el.id === 'ra-core' || el.id === 'ra-wings') return;
      if (raDaySub && el.contains(raDaySub)) return;
      if (el.closest && el.closest('.awara-panel')) return;
      if (el.children.length > 5) return;
      var text = (el.textContent || '').toLowerCase();
      for (var i = 0; i < calendarKeywords.length; i++) {
        if (text.includes(calendarKeywords[i])) {
          var rect = el.getBoundingClientRect();
          if (rect.width < 500 && rect.height < 100) {
            el.style.display = 'none';
            hiddenCount++;
            break;
          }
        }
      }
      if (/\d+\s*(число|н\.э\.)/.test(text) || /\d+\/\d+/.test(text)) {
        var rect2 = el.getBoundingClientRect();
        if (rect2.width < 300 && rect2.height < 50) {
          el.style.display = 'none';
          hiddenCount++;
        }
      }
    });
    if (hiddenCount > 0) {
      console.log('[AWARA] Скрыто календарных элементов: ' + hiddenCount);
    }
  }

  function startObserving() {
    hideElements();
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          if (nodes[j].nodeType === 1) {
            if (nodes[j].id === 'ra-day-sub' ||
                (nodes[j].textContent || '').toLowerCase().indexOf('юлианский') !== -1 ||
                (nodes[j].textContent || '').toLowerCase().indexOf('григорианский') !== -1 ||
                (nodes[j].textContent || '').toLowerCase().indexOf('кармическая') !== -1) {
              hideElements();
              return;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(hideElements, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
  } else {
    startObserving();
  }
})();
