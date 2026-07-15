// Daimon card component + gallery view
import { getLang } from '../i18n.js';
import { createPlayerDaimon } from '../modules/daimon-manager.js';

// Kingdom symbol map (SVG-safe, no emojis)
var KINGDOM_SYMBOLS = {
  Beast: 'B', Avian: 'A', Aquatic: 'W', Serpent: 'S',
  Flora: 'F', Crystal: 'C', Mythic: 'M'
};

/**
 * Render a single daimon card HTML.
 */
function renderCard(item) {
  var form = item.form;
  var lang = getLang();
  var name = form.species[lang] || form.species.en;
  var symbol = KINGDOM_SYMBOLS[form.kingdom] || '?';
  var match = item.matchPercent || 0;
  var desc = form.description ? (form.description[lang] || form.description.en) : '';

  return '<div class="daimon-card" data-id="' + form.id + '">'
    + '<div class="card-image">' + symbol + '</div>'
    + '<div class="card-name">' + name + '</div>'
    + '<div class="card-info">'
    + '<span>' + form.kingdom + '</span>'
    + '<span>' + form.element + '</span>'
    + '<span>' + form.archetype + '</span>'
    + '</div>'
    + '<div class="card-score">Match: ' + match + '%</div>'
    + '<button class="select-btn" data-id="' + form.id + '">SELECT</button>'
    + '</div>';
}

/**
 * Show daimon gallery in container.
 * @param {Element} container - DOM element
 * @param {Array} items - scored daimon items [{form, score, matchPercent}]
 * @param {string} method - "quick" | "natal" | "random"
 */
export function showDaimonGallery(container, items, method) {
  var lang = getLang();
  var titleText = lang === 'ru' ? 'Выбери своего Даймона' : 'Choose Your Daimon';
  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';
  html += '<h2 style="font-family:Cinzel,serif;font-size:clamp(16px,3.5vw,20px);color:var(--gold-bright);letter-spacing:0.15em;text-align:center;margin-bottom:20px;">' + titleText + '</h2>';
  html += '<div class="daimon-grid">';
  items.forEach(function(item) {
    html += renderCard(item);
  });
  html += '</div>';
  container.innerHTML = html;

  // Bind select buttons
  container.querySelectorAll('.select-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var formId = btn.dataset.id;
      showConfirmation(container, formId, items, method);
    });
  });

  // Card click highlights
  container.querySelectorAll('.daimon-card').forEach(function(card) {
    card.addEventListener('click', function() {
      container.querySelectorAll('.daimon-card').forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
    });
  });
}

/**
 * Show natal-based gallery with categories.
 */
export function showNatalGallery(container, natalResult, method) {
  var lang = getLang();
  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';

  // Primary recommendation
  var p = natalResult.primary;
  html += '<div class="primary-recommendation">';
  html += '<h3>' + (lang === 'ru' ? 'Главная рекомендация' : 'Primary Recommendation') + '</h3>';
  html += renderCard(p);
  html += '</div>';

  // Categories
  natalResult.categories.forEach(function(cat, idx) {
    html += '<div class="category' + (idx === 0 ? ' open' : '') + '">';
    html += '<h4>' + cat.title[lang] + '</h4>';
    html += '<div class="category-daimons">';
    cat.daimons.forEach(function(d) {
      html += renderCard(d);
    });
    html += '</div></div>';
  });

  container.innerHTML = html;

  // Toggle categories
  container.querySelectorAll('.category h4').forEach(function(h) {
    h.addEventListener('click', function() {
      h.parentElement.classList.toggle('open');
    });
  });

  // Select buttons
  container.querySelectorAll('.select-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      showConfirmation(container, btn.dataset.id, null, method);
    });
  });
}

/**
 * Confirmation screen after selecting a daimon.
 */
async function showConfirmation(container, formId, items, method) {
  var lang = getLang();
  var resp = await fetch('../data/daimons/daimon_forms.json');
  var data = await resp.json();
  var form = data.forms.find(function(f) { return f.id === formId; });
  if (!form) return;

  var name = form.species[lang] || form.species.en;
  var desc = form.description ? (form.description[lang] || form.description.en) : '';
  var confirmTitle = lang === 'ru' ? 'Ваш Даймон' : 'Your Daimon';
  var beginText = lang === 'ru' ? 'НАЧАТЬ ПУТЬ' : 'BEGIN JOURNEY';

  var html = '<div class="confirmation">';
  html += '<h2>' + confirmTitle + '</h2>';
  html += '<div class="daimon-details">';
  html += '<div class="card-image" style="width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,0.15),transparent);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:36px;font-family:Cinzel,serif;color:var(--gold-bright);">' + (KINGDOM_SYMBOLS[form.kingdom] || '?') + '</div>';
  html += '<div style="font-family:Cinzel,serif;font-size:18px;color:var(--gold-bright);letter-spacing:0.15em;margin-bottom:12px;">' + name + '</div>';
  html += '<div class="detail-row"><span class="detail-label">Kingdom</span><span class="detail-value">' + form.kingdom + '</span></div>';
  html += '<div class="detail-row"><span class="detail-label">Element</span><span class="detail-value">' + form.element + '</span></div>';
  html += '<div class="detail-row"><span class="detail-label">Archetype</span><span class="detail-value">' + form.archetype + '</span></div>';
  html += '<div class="detail-row"><span class="detail-label">Guna</span><span class="detail-value">' + form.guna + '</span></div>';
  html += '<div class="detail-row"><span class="detail-label">Chakra</span><span class="detail-value">' + (form.chakra_affinity || []).join(', ') + '</span></div>';
  html += '<div style="margin-top:12px;font-family:Cormorant Garamond,serif;font-size:14px;color:var(--text-soft);font-style:italic;">' + desc + '</div>';
  html += '</div>';
  html += '<button class="begin-journey-btn" id="begin-journey">' + beginText + '</button>';
  html += '</div>';

  container.innerHTML = html;

  document.getElementById('begin-journey').addEventListener('click', function() {
    var daimon = createPlayerDaimon(formId, method, null, form);
    // Redirect to the unified Daimon page so the player sees the game-linked guardian.
    window.location.href = '../daimon.html';
  });
}
