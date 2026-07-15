// AWARA · Lobby phone scroll reset (extracted from index.html, block 6)
// Сбрасывает скролл лобби/phone-shell в верх на load/pageshow, отключает scrollRestoration.
(function(){
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function resetLobbyPhoneScroll(){
    var phone = document.querySelector('.lobby-phone-shell');
    if (phone) phone.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  document.addEventListener('DOMContentLoaded', resetLobbyPhoneScroll);
  window.addEventListener('load', resetLobbyPhoneScroll);
  window.addEventListener('pageshow', resetLobbyPhoneScroll);
  setTimeout(resetLobbyPhoneScroll, 80);
  setTimeout(resetLobbyPhoneScroll, 300);
})();
