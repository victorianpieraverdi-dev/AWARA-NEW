// Random Gift flow: random daimon with 3 rerolls
import { getLang } from '../i18n.js';
import { showDaimonGallery } from '../components/daimon-card.js';

var rerollsLeft = 3;
var currentForm = null;
var allForms = null;

export async function initRandomGift(container) {
  rerollsLeft = 3;
  try {
    var resp = await fetch('../data/daimons/daimon_forms.json');
    var data = await resp.json();
    allForms = data.forms;
    rollDaimon(container);
  } catch (err) {
    container.innerHTML = '<div style="color:#ff4444;text-align:center;">Error loading daimon data</div>';
  }
}

function rollDaimon(container) {
  var idx = Math.floor(Math.random() * allForms.length);
  currentForm = allForms[idx];
  renderRandom(container);
}

function renderRandom(container) {
  var lang = getLang();
  var name = currentForm.species[lang] || currentForm.species.en;
  var desc = currentForm.description ? (currentForm.description[lang] || currentForm.description.en) : '';
  var rerollText = lang === 'ru' ? 'ПЕРЕБРОСИТЬ' : 'REROLL';
  var acceptText = lang === 'ru' ? 'ПРИНЯТЬ' : 'ACCEPT';
  var titleText = lang === 'ru' ? 'Дар судьбы' : 'Gift of Fate';
  var leftText = lang === 'ru' ? 'Осталось перебросов' : 'Rerolls left';

  var KINGDOM_SYMBOLS = {
    Beast: 'B', Avian: 'A', Aquatic: 'W', Serpent: 'S',
    Flora: 'F', Crystal: 'C', Mythic: 'M'
  };
  var symbol = KINGDOM_SYMBOLS[currentForm.kingdom] || '?';

  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';
  html += '<div class="random-container">';
  html += '<h2 style="font-family:Cinzel,serif;font-size:clamp(16px,3.5vw,20px);color:var(--gold-bright);letter-spacing:0.15em;margin-bottom:20px;">' + titleText + '</h2>';
  html += '<div class="reroll-counter">' + leftText + ': ' + rerollsLeft + '</div>';

  // Single large card
  html += '<div class="daimon-card selected" style="max-width:280px;margin:0 auto;">';
  html += '<div class="card-image" style="width:80px;height:80px;margin:0 auto 12px;font-size:36px;">' + symbol + '</div>';
  html += '<div class="card-name" style="font-size:16px;margin-bottom:6px;">' + name + '</div>';
  html += '<div class="card-info">';
  html += '<span>' + currentForm.kingdom + '</span>';
  html += '<span>' + currentForm.element + '</span>';
  html += '<span>' + currentForm.archetype + '</span>';
  html += '</div>';
  html += '<div style="margin-top:10px;font-family:Cormorant Garamond,serif;font-size:13px;color:var(--text-soft);font-style:italic;">' + desc + '</div>';
  html += '</div>';

  // Buttons
  html += '<div class="random-actions">';
  if (rerollsLeft > 0) {
    html += '<button class="card-btn" id="reroll-btn">' + rerollText + ' (' + rerollsLeft + ')</button>';
  }
  html += '<button class="submit-btn" style="display:inline-block;width:auto;margin:0;padding:12px 28px;" id="accept-btn">' + acceptText + '</button>';
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;

  // Reroll
  var rerollBtn = document.getElementById('reroll-btn');
  if (rerollBtn) {
    rerollBtn.addEventListener('click', function() {
      rerollsLeft--;
      container.style.opacity = '0';
      setTimeout(function() {
        rollDaimon(container);
        container.style.opacity = '1';
      }, 300);
    });
  }

  // Accept
  document.getElementById('accept-btn').addEventListener('click', function() {
    // Show as single-item gallery for confirmation
    var item = { form: currentForm, score: 0, matchPercent: 0 };
    var results = document.getElementById('results-container');
    container.classList.add('hidden');
    results.classList.remove('hidden');
    showDaimonGallery(results, [item], 'random');
  });
}
