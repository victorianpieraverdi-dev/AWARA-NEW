// Daimon stats display component
import { loadPlayerDaimon, getDaimonForm } from '../modules/daimon-manager.js';
import { getXPToNextLevel, getStreakDays } from '../modules/xp-manager.js';
import { getLang } from '../i18n.js';

var KINGDOM_SYMBOLS = {
  Beast: 'B', Avian: 'A', Aquatic: 'W', Serpent: 'S',
  Flora: 'F', Crystal: 'C', Mythic: 'M'
};

var CHAKRA_NAMES = {
  1: { en: 'Muladhara', ru: 'Муладхара' },
  2: { en: 'Svadhisthana', ru: 'Свадхистхана' },
  3: { en: 'Manipura', ru: 'Манипура' },
  4: { en: 'Anahata', ru: 'Анахата' },
  5: { en: 'Vishuddha', ru: 'Вишуддха' },
  6: { en: 'Ajna', ru: 'Аджна' },
  7: { en: 'Sahasrara', ru: 'Сахасрара' },
  8: { en: 'Bindu', ru: 'Бинду' },
  9: { en: 'Brahmarandra', ru: 'Брахмарандра' }
};

/**
 * Render daimon stats widget into container.
 * @param {Element} container - DOM element to render into
 * @returns {boolean} true if rendered, false if no daimon
 */
export async function renderDaimonStats(container) {
  var daimon = loadPlayerDaimon();
  if (!daimon) {
    container.innerHTML = '';
    return false;
  }

  var form = await getDaimonForm(daimon.formId);
  var lang = getLang();
  var xpInfo = await getXPToNextLevel(daimon);
  var streak = getStreakDays();

  var name = form ? (form.species[lang] || form.species.en) : daimon.formId;
  var kingdom = form ? form.kingdom : 'Unknown';
  var symbol = KINGDOM_SYMBOLS[kingdom] || '?';
  var chakraName = CHAKRA_NAMES[daimon.activeChakra] || { en: '?', ru: '?' };
  var bondPercent = Math.min(100, Math.round((daimon.stats.bond || 0)));

  var lvlLabel = lang === 'ru' ? 'Ур' : 'Lvl';
  var xpLabel = 'XP: ' + xpInfo.current + ' / ' + xpInfo.required;
  var bondLabel = (lang === 'ru' ? 'Связь' : 'Bond') + ': ' + bondPercent + '%';
  var chakraLabel = (lang === 'ru' ? 'Чакра' : 'Chakra') + ': ';
  var galleryLabel = lang === 'ru' ? 'ГАЛЕРЕЯ' : 'GALLERY';

  var html = '<div class="daimon-stats">';

  // Portrait
  html += '<div class="daimon-portrait">';
  html += '<div class="portrait-img">' + symbol + '</div>';
  html += '<div class="level-badge">' + lvlLabel + ' ' + daimon.level + '</div>';
  html += '</div>';

  // Info
  html += '<div class="daimon-info">';
  html += '<div class="daimon-name">' + name + '</div>';
  html += '<div class="tier-badge tier-' + daimon.tier + '">' + daimon.tier + '</div>';

  // XP bar
  html += '<div class="progress-bars">';
  html += '<div class="xp-bar">';
  html += '<label>' + xpLabel + '</label>';
  html += '<div class="bar"><div class="fill" style="width:' + xpInfo.percent + '%"></div></div>';
  html += '</div>';

  // Bond bar
  html += '<div class="bond-bar">';
  html += '<label>' + bondLabel + '</label>';
  html += '<div class="bar"><div class="fill" style="width:' + bondPercent + '%"></div></div>';
  html += '</div>';
  html += '</div>';

  // Chakra
  html += '<div class="chakra-indicator">' + chakraLabel + '<span>' + daimon.activeChakra + ' - ' + chakraName[lang] + '</span></div>';
  html += '</div>';

  // Gallery button
  html += '<button class="view-gallery">' + galleryLabel + '</button>';
  html += '</div>';

  container.innerHTML = html;
  return true;
}
