// ── Язык ──
window.openLangPanel = function() {
  var cur = localStorage.getItem('awara_lang') || 'ru';
  document.getElementById('lang-ru-check').textContent = (cur === 'ru') ? '✦' : '';
  document.getElementById('lang-modal').style.display = 'block';
};
window.selectLang = function(lang) {
  localStorage.setItem('awara_lang', lang);
  var lbl = document.getElementById('lang-current-lbl');
  if (lbl) lbl.textContent = lang.toUpperCase();
  document.getElementById('lang-ru-check').textContent = (lang === 'ru') ? '✦' : '';
  if (lang !== 'ru') {
    // EN пока недоступен
    return;
  }
  setTimeout(function() { document.getElementById('lang-modal').style.display = 'none'; }, 300);
};
// Инициализация lang label
(function() {
  var cur = localStorage.getItem('awara_lang') || 'ru';
  var lbl = document.getElementById('lang-current-lbl');
  if (lbl) lbl.textContent = cur.toUpperCase();
})();
