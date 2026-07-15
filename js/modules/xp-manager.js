// XP Manager: tracking, multipliers, level up, evolution
import { savePlayerDaimon, loadPlayerDaimon } from './daimon-manager.js';

// XP sources and base values
var XP_SOURCES = {
  daily_practices: {
    morning_meditation: 50,
    evening_reflection: 50,
    daily_checkin: 30,
    feed_daimon: 40,
    journaling: 35,
    breathwork: 45
  },
  game_content: {
    agent_dialogue: 75,
    agent_quest: 200,
    matrix_unlock: 100,
    card_discovery: 50,
    loka_exploration: 150,
    oracle_consultation: 60
  },
  social: {
    share_wisdom: 30,
    help_player: 100,
    community_event: 250
  }
};

// Cached progression data
var _progression = null;

/**
 * Load level progression table.
 * @returns {Object} progression data
 */
export async function loadProgression() {
  if (_progression) return _progression;
  try {
    var resp = await fetch('../data/daimons/level_progression.json');
    _progression = await resp.json();
    return _progression;
  } catch (e) {
    // Fallback: build simple progression
    _progression = buildFallbackProgression();
    return _progression;
  }
}

function buildFallbackProgression() {
  var levels = {};
  for (var i = 1; i <= 100; i++) {
    var xp = i === 1 ? 0 : Math.round(100 * Math.pow(i, 1.8));
    var tier = i <= 20 ? 'Common' : i <= 40 ? 'Uncommon' : i <= 60 ? 'Rare' : i <= 80 ? 'Epic' : i <= 90 ? 'Mythic' : 'Legendary';
    var chakra = Math.min(9, Math.ceil(i / 11.2));
    levels[String(i)] = { xp_required: xp, tier: tier, chakra: chakra };
  }
  return {
    levels: levels,
    tiers: {
      Common:    { levels: '1-20',   multiplier: 1.0 },
      Uncommon:  { levels: '21-40',  multiplier: 1.2 },
      Rare:      { levels: '41-60',  multiplier: 1.5 },
      Epic:      { levels: '61-80',  multiplier: 2.0 },
      Mythic:    { levels: '81-90',  multiplier: 3.0 },
      Legendary: { levels: '91-100', multiplier: 5.0 }
    },
    evolution_levels: [20, 40, 60, 80, 100]
  };
}

/**
 * Calculate XP multipliers based on daimon state and player activity.
 * @param {Object} daimon
 * @returns {Object} { streak, resonance, tier, total }
 */
export function calculateMultipliers(daimon) {
  var streakDays = getStreakDays();
  var streakMult = 1.0;
  if (streakDays >= 3) streakMult = 1.1;
  if (streakDays >= 7) streakMult = 1.2;
  if (streakDays >= 14) streakMult = 1.3;
  if (streakDays >= 30) streakMult = 1.5;

  var resonanceMult = daimon.natalResonance || 0.5;
  resonanceMult = 1.0 + (resonanceMult * 0.3); // 1.0 to 1.3

  var tierMult = 1.0;
  if (daimon.tier === 'Uncommon') tierMult = 1.05;
  if (daimon.tier === 'Rare') tierMult = 1.1;
  if (daimon.tier === 'Epic') tierMult = 1.15;
  if (daimon.tier === 'Mythic') tierMult = 1.2;
  if (daimon.tier === 'Legendary') tierMult = 1.3;

  var total = streakMult * resonanceMult * tierMult;
  total = Math.round(total * 100) / 100;

  return { streak: streakMult, resonance: resonanceMult, tier: tierMult, total: total };
}

/**
 * Add XP to daimon.
 * @param {Object} daimon
 * @param {number} baseXP
 * @param {string} source - key from XP_SOURCES (e.g. "daily_practices.morning_meditation")
 * @returns {Object} { baseXP, multipliers, finalXP, levelsGained }
 */
export async function addXP(daimon, baseXP, source) {
  var multipliers = calculateMultipliers(daimon);
  var finalXP = Math.round(baseXP * multipliers.total);
  daimon.xp += finalXP;
  daimon.totalXP += finalXP;

  var levelsGained = await checkLevelUp(daimon);
  savePlayerDaimon(daimon);

  // Log XP event
  logXPEvent(daimon, baseXP, finalXP, source);

  return { baseXP: baseXP, multipliers: multipliers, finalXP: finalXP, levelsGained: levelsGained };
}

/**
 * Check and process level ups.
 * @param {Object} daimon
 * @returns {number} levels gained
 */
export async function checkLevelUp(daimon) {
  var progression = await loadProgression();
  var levelsGained = 0;
  var maxLevel = progression.max_level || 100;

  while (daimon.level < maxLevel) {
    var nextLevel = String(daimon.level + 1);
    var nextData = progression.levels[nextLevel];
    if (!nextData) break;
    if (daimon.totalXP < nextData.xp_required) break;

    daimon.level++;
    levelsGained++;

    // Update tier
    daimon.tier = nextData.tier;

    // Update chakra
    daimon.activeChakra = nextData.chakra;

    // Check for evolution (every 20 levels)
    var evoLevels = progression.evolution_levels || [20, 40, 60, 80, 100];
    if (evoLevels.indexOf(daimon.level) !== -1) {
      triggerEvolution(daimon);
    }
  }

  if (levelsGained > 0) {
    showLevelUpNotification(daimon, levelsGained);
  }

  return levelsGained;
}

/**
 * Trigger evolution at milestone levels.
 */
function triggerEvolution(daimon) {
  daimon.stats.evolution_count = (daimon.stats.evolution_count || 0) + 1;
  var evolutionEvent = {
    type: 'evolution',
    level: daimon.level,
    tier: daimon.tier,
    timestamp: new Date().toISOString()
  };
  daimon.experienceMarks.push(evolutionEvent);

  // Show evolution notification
  showNotification(
    'EVOLUTION',
    daimon.tier + ' form unlocked at level ' + daimon.level,
    'evolution'
  );
}

/**
 * Show level up notification.
 */
function showLevelUpNotification(daimon, levelsGained) {
  var msg = 'Level ' + daimon.level + ' reached';
  if (levelsGained > 1) msg = levelsGained + ' levels gained! Now level ' + daimon.level;
  showNotification('LEVEL UP', msg, 'levelup');
}

/**
 * Show a floating notification.
 */
function showNotification(title, message, type) {
  var existing = document.getElementById('awara-notification');
  if (existing) existing.remove();

  var div = document.createElement('div');
  div.id = 'awara-notification';
  var borderColor = type === 'evolution' ? 'rgba(255,215,0,0.6)' : 'rgba(201,168,76,0.4)';
  var bgColor = type === 'evolution' ? 'rgba(255,215,0,0.08)' : 'rgba(201,168,76,0.06)';
  div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:10px;padding:16px 24px;font-family:JetBrains Mono,monospace;animation:notifIn 0.4s ease;max-width:320px;';
  div.innerHTML = '<div style="font-family:Cinzel,serif;font-size:13px;color:#ffd700;letter-spacing:0.2em;margin-bottom:4px;">' + title + '</div>'
    + '<div style="font-size:11px;color:rgba(255,248,214,0.7);">' + message + '</div>';
  document.body.appendChild(div);

  // Add animation keyframes if not present
  if (!document.getElementById('awara-notif-style')) {
    var style = document.createElement('style');
    style.id = 'awara-notif-style';
    style.textContent = '@keyframes notifIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}@keyframes notifOut{from{opacity:1}to{opacity:0;transform:translateY(-20px)}}';
    document.head.appendChild(style);
  }

  setTimeout(function() {
    div.style.animation = 'notifOut 0.4s ease forwards';
    setTimeout(function() { div.remove(); }, 400);
  }, 3000);
}

/**
 * Log XP event to localStorage.
 */
function logXPEvent(daimon, baseXP, finalXP, source) {
  var key = 'awara_xp_log';
  var log = JSON.parse(localStorage.getItem(key) || '[]');
  log.push({
    timestamp: new Date().toISOString(),
    source: source,
    baseXP: baseXP,
    finalXP: finalXP,
    level: daimon.level,
    totalXP: daimon.totalXP
  });
  // Keep last 100 entries
  if (log.length > 100) log = log.slice(-100);
  localStorage.setItem(key, JSON.stringify(log));
}

/**
 * Get current streak days.
 */
export function getStreakDays() {
  var raw = localStorage.getItem('awara_streak');
  if (!raw) return 0;
  try {
    var data = JSON.parse(raw);
    return data.days || 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Update streak counter.
 */
export function updateStreak() {
  var today = new Date().toISOString().split('T')[0];
  var raw = localStorage.getItem('awara_streak');
  var data = raw ? JSON.parse(raw) : { days: 0, lastDate: null };

  if (data.lastDate === today) return data.days;

  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayStr = yesterday.toISOString().split('T')[0];

  if (data.lastDate === yesterdayStr) {
    data.days++;
  } else if (data.lastDate !== today) {
    data.days = 1;
  }
  data.lastDate = today;
  localStorage.setItem('awara_streak', JSON.stringify(data));
  return data.days;
}

/**
 * Get XP needed for next level.
 */
export async function getXPToNextLevel(daimon) {
  var progression = await loadProgression();
  var nextLevel = String(daimon.level + 1);
  var nextData = progression.levels[nextLevel];
  if (!nextData) return { current: daimon.totalXP, required: daimon.totalXP, remaining: 0, percent: 100 };

  var currentLevelXP = progression.levels[String(daimon.level)].xp_required;
  var nextLevelXP = nextData.xp_required;
  var rangeXP = nextLevelXP - currentLevelXP;
  var progressXP = daimon.totalXP - currentLevelXP;
  var percent = rangeXP > 0 ? Math.min(100, Math.round((progressXP / rangeXP) * 100)) : 100;

  return {
    current: daimon.totalXP,
    required: nextLevelXP,
    remaining: Math.max(0, nextLevelXP - daimon.totalXP),
    percent: percent
  };
}

// Export XP sources for reference
export { XP_SOURCES };
