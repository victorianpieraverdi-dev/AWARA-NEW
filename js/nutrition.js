// Nutrition recommendations module
// Loads dietary data for player's dosha and renders recommendations

import { translatePage, getLang, createLangSwitcher, t } from './i18n.js';

const SEASON_MAP = {
  0: 'winter', 1: 'winter', 2: 'spring',
  3: 'spring', 4: 'spring', 5: 'summer',
  6: 'summer', 7: 'summer', 8: 'autumn',
  9: 'autumn', 10: 'autumn', 11: 'winter'
};

const DOSHA_COLORS = {
  Vata:  { main: 'rgba(100,180,255,0.6)', bg: 'rgba(100,180,255,0.08)', border: 'rgba(100,180,255,0.25)' },
  Pitta: { main: 'rgba(255,140,60,0.6)',  bg: 'rgba(255,140,60,0.08)',  border: 'rgba(255,140,60,0.25)'  },
  Kapha: { main: 'rgba(100,200,100,0.6)', bg: 'rgba(100,200,100,0.08)', border: 'rgba(100,200,100,0.25)' }
};

const CATEGORY_ICONS = {
  grains: '🌾', proteins: '🥩', vegetables: '🥬',
  fruits: '🍎', spices: '🫚', beverages: '🍵'
};

let dietaryData = null;

async function loadDietaryData() {
  try {
    var resp = await fetch('../data/ayurveda/dietary_recommendations.json');
    dietaryData = await resp.json();
    return dietaryData;
  } catch (e) {
    console.error('Failed to load dietary data:', e);
    return null;
  }
}

function getCurrentSeason() {
  return SEASON_MAP[new Date().getMonth()];
}

function getPlayerDosha() {
  try {
    var raw = localStorage.getItem('awara_player_dosha');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function renderNoDoshaState(container) {
  var lang = getLang();
  var html = '<div class="no-dosha-state" style="text-align:center;padding:60px 20px;">';
  html += '<div style="font-size:48px;margin-bottom:24px;opacity:0.4;">&#9765;</div>';
  html += '<h2 style="font-family:Cinzel,serif;font-size:clamp(16px,3vw,20px);color:#ffd700;letter-spacing:0.15em;margin-bottom:12px;">' + t('nutr.no_dosha_title') + '</h2>';
  html += '<p style="font-family:Cormorant Garamond,serif;font-size:14px;color:rgba(255,248,214,0.5);margin-bottom:24px;">' + t('nutr.no_dosha_desc') + '</p>';
  html += '<a href="dosha-quiz.html" class="submit-btn" style="display:inline-block;width:auto;margin:0;padding:12px 24px;text-decoration:none;">' + t('nutr.take_quiz') + '</a>';
  html += '</div>';
  container.innerHTML = html;
}

function renderFoodList(items, type) {
  var html = '<div class="food-list ' + type + '">';
  items.forEach(function(item) {
    html += '<span class="food-tag">' + item + '</span>';
  });
  html += '</div>';
  return html;
}

function renderRecommendations(container, doshaResult) {
  var lang = getLang();
  var dosha = doshaResult.primary;
  var data = dietaryData.doshas[dosha];
  if (!data) return;

  var colors = DOSHA_COLORS[dosha] || DOSHA_COLORS.Vata;
  var season = getCurrentSeason();
  var seasonData = data.seasonal_adjustments[season];

  var html = '';

  // Dosha badge
  html += '<div class="dosha-badge" style="text-align:center;margin-bottom:32px;">';
  html += '<div style="display:inline-block;background:' + colors.bg + ';border:1px solid ' + colors.border + ';border-radius:12px;padding:16px 32px;">';
  html += '<div style="font-size:10px;color:rgba(255,248,214,0.4);letter-spacing:0.15em;margin-bottom:4px;">' + t('nutr.your_dosha') + '</div>';
  html += '<div style="font-family:Cinzel,serif;font-size:20px;color:' + colors.main + ';letter-spacing:0.15em;">' + dosha + '</div>';
  html += '<div style="font-size:11px;color:rgba(255,248,214,0.4);margin-top:4px;">' + doshaResult.percentages[dosha] + '%</div>';
  html += '</div></div>';

  // Eating habits
  html += '<section class="rec-section">';
  html += '<h3 class="rec-heading">' + t('nutr.eating_habits') + '</h3>';
  html += '<div class="rec-text">' + data.eating_habits[lang] + '</div>';
  html += '</section>';

  // Seasonal recommendation
  html += '<section class="rec-section">';
  html += '<h3 class="rec-heading">' + t('nutr.season_' + season) + '</h3>';
  html += '<div class="rec-text">' + seasonData[lang] + '</div>';
  html += '</section>';

  // Favorable foods
  html += '<section class="rec-section">';
  html += '<h3 class="rec-heading favorable-heading">' + t('nutr.favorable') + '</h3>';
  Object.keys(data.favorable).forEach(function(cat) {
    var icon = CATEGORY_ICONS[cat] || '';
    html += '<div class="food-category">';
    html += '<div class="food-cat-label">' + icon + ' ' + t('nutr.cat.' + cat) + '</div>';
    html += renderFoodList(data.favorable[cat], 'favorable');
    html += '</div>';
  });
  html += '</section>';

  // Unfavorable foods
  html += '<section class="rec-section">';
  html += '<h3 class="rec-heading unfavorable-heading">' + t('nutr.unfavorable') + '</h3>';
  Object.keys(data.unfavorable).forEach(function(cat) {
    var icon = CATEGORY_ICONS[cat] || '';
    html += '<div class="food-category">';
    html += '<div class="food-cat-label">' + icon + ' ' + t('nutr.cat.' + cat) + '</div>';
    html += renderFoodList(data.unfavorable[cat], 'unfavorable');
    html += '</div>';
  });
  html += '</section>';

  // Recipes
  html += '<section class="rec-section">';
  html += '<h3 class="rec-heading">' + t('nutr.recipes') + '</h3>';
  data.recipes.forEach(function(recipe) {
    html += '<div class="recipe-card">';
    html += '<div class="recipe-name">' + recipe.name[lang] + '</div>';
    html += '<div class="recipe-desc">' + recipe.description[lang] + '</div>';
    html += '<div class="recipe-ingredients">';
    recipe.ingredients.forEach(function(ing) {
      html += '<span class="ingredient-tag">' + ing + '</span>';
    });
    html += '</div></div>';
  });
  html += '</section>';

  // Retake quiz link
  html += '<div style="text-align:center;margin-top:32px;">';
  html += '<a href="dosha-quiz.html" class="card-btn" style="text-decoration:none;display:inline-block;">' + t('nutr.retake_quiz') + '</a>';
  html += '</div>';

  container.innerHTML = html;
}

export async function init() {
  translatePage();
  createLangSwitcher();

  var container = document.getElementById('nutrition-content');
  if (!container) return;

  var doshaResult = getPlayerDosha();

  await loadDietaryData();

  if (!doshaResult || !dietaryData) {
    renderNoDoshaState(container);
    return;
  }

  renderRecommendations(container, doshaResult);
}
