/* ============================================================
   AWARA · LIGHT STRUCTURES v1
   Световые структуры — высокоуровневая механика.
   6 структур (Мера 4-9) с эффектами на геймплей.
   Загружать ПОСЛЕ: awara-experience-engine.js, awara-particles.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraStructures && window.__awaraStructures >= 1) return;
window.__awaraStructures = 1;

/* ═══════════════════════════════════════════
   I. STRUCTURE DEFINITIONS
   ═══════════════════════════════════════════ */

var STRUCTURES = [
  {
    id: 'heart_core',
    name_ru: 'Сердечное ядро',
    icon: '💎',
    unlock_mera: 4,
    light_to_build: 100,
    requires: [],
    effect: 'ether_conversion +0.05',
    effect_desc_ru: 'Конвертация частиц +5%. Якорь для всех структур.',
    color: '#E06080'
  },
  {
    id: 'spirit_channel',
    name_ru: 'Канал Духа',
    icon: '🔮',
    unlock_mera: 5,
    light_to_build: 250,
    requires: ['heart_core'],
    effect: 'devotion_bonus +0.15',
    effect_desc_ru: 'Бонус ×1.15 к квестам на преданность. Призыв Духа.',
    color: '#8060E0'
  },
  {
    id: 'purification_ring',
    name_ru: 'Кольцо очищения',
    icon: '⭕',
    unlock_mera: 5,
    light_to_build: 250,
    requires: ['heart_core'],
    effect: 'shadow_reduction ×0.7',
    effect_desc_ru: 'Тени ослаблены на 30%. Бонус к работе с тенью.',
    color: '#60A0E0'
  },
  {
    id: 'circulation_web',
    name_ru: 'Сеть циркуляции',
    icon: '🕸',
    unlock_mera: 6,
    light_to_build: 500,
    requires: ['heart_core', 'spirit_channel'],
    effect: 'lens_rebalance 10%',
    effect_desc_ru: 'Автоперелив 10% света из сильных линз в слабые.',
    color: '#60E0A0'
  },
  {
    id: 'eternity_anchor',
    name_ru: 'Якорь Вечности',
    icon: '⚓',
    unlock_mera: 7,
    light_to_build: 1000,
    requires: ['heart_core', 'spirit_channel', 'purification_ring'],
    effect: 'ether_carry 0.2',
    effect_desc_ru: 'Утром 20% эфира сохраняется пробуждённым.',
    color: '#E0E060'
  },
  {
    id: 'radiance_body',
    name_ru: 'Тело сияния',
    icon: '☀',
    unlock_mera: 9,
    light_to_build: 3000,
    requires: ['heart_core', 'spirit_channel', 'purification_ring', 'circulation_web', 'eternity_anchor'],
    effect: 'max_conversion 0.95, instant_ether',
    effect_desc_ru: 'Конвертация 95%. Эфир пробуждается мгновенно. Все линзы связаны.',
    color: '#FFD700'
  }
];

/* ═══════════════════════════════════════════
   II. HELPERS
   ═══════════════════════════════════════════ */

function S(){ try { return window.STATE; } catch(e) { return null; } }
function r(n){ return Math.round(n * 100) / 100; }

function getMera(){
  var s = S();
  if(!s || !s.mera) return 0;
  /* Mera = max window reached */
  if(!s.mera_windows) return 0;
  var WINDOWS = ['daimon','locations','emf','newmatrix','soul','daimon_soul','chronicle','hram','cosmos','supergame'];
  for(var i = WINDOWS.length - 1; i >= 0; i--){
    if((s.mera_windows[WINDOWS[i]] || 0) > 0) return i;
  }
  return 0;
}

function ensureStructureState(){
  var s = S();
  if(!s) return;
  if(!Array.isArray(s.structures_built)) s.structures_built = [];
  if(!s.structures_in_progress) s.structures_in_progress = {};
}

function _save(){
  try { localStorage.setItem('STATE', JSON.stringify(S())); } catch(e){}
}

function _fireEvent(name, detail){
  try { window.dispatchEvent(new CustomEvent('awara-' + name, { detail: detail || {} })); } catch(e){}
}

/* ═══════════════════════════════════════════
   III. CORE FUNCTIONS
   ═══════════════════════════════════════════ */

function isBuilt(structureId){
  var s = S();
  if(!s) return false;
  ensureStructureState();
  return s.structures_built.indexOf(structureId) >= 0;
}

function canUnlock(structureId){
  var struct = STRUCTURES.find(function(st){ return st.id === structureId; });
  if(!struct) return { can: false, reason: 'Структура не найдена' };
  if(isBuilt(structureId)) return { can: false, reason: 'Уже построена' };

  var mera = getMera();
  if(mera < struct.unlock_mera) return { can: false, reason: 'Нужна Мера ' + struct.unlock_mera + ' (текущая: ' + mera + ')' };

  for(var i = 0; i < struct.requires.length; i++){
    if(!isBuilt(struct.requires[i])){
      var req = STRUCTURES.find(function(st){ return st.id === struct.requires[i]; });
      return { can: false, reason: 'Сначала постройте: ' + (req ? req.name_ru : struct.requires[i]) };
    }
  }

  return { can: true };
}

function getBuildProgress(structureId){
  var s = S();
  if(!s) return 0;
  ensureStructureState();
  return s.structures_in_progress[structureId] || 0;
}

/**
 * Invest light into building a structure.
 * @param {string} structureId
 * @param {number} lightAmount — how much light to invest
 * @returns {object} { success, invested, total, remaining, completed }
 */
function investLight(structureId, lightAmount){
  var check = canUnlock(structureId);
  if(!check.can) return { success: false, reason: check.reason };

  var struct = STRUCTURES.find(function(st){ return st.id === structureId; });
  var s = S();
  ensureStructureState();

  /* Check available light */
  var available = (s.progress ? s.progress.total_light : 0) || 0;
  var invest = Math.min(lightAmount, available);
  if(invest <= 0) return { success: false, reason: 'Недостаточно света' };

  /* Deduct light */
  s.progress.total_light = r(s.progress.total_light - invest);

  /* Add to build progress */
  var current = s.structures_in_progress[structureId] || 0;
  current = r(current + invest);
  s.structures_in_progress[structureId] = current;

  var completed = false;
  if(current >= struct.light_to_build){
    /* Structure complete! */
    s.structures_built.push(structureId);
    delete s.structures_in_progress[structureId];
    completed = true;
    _applyEffect(struct);
    _fireEvent('structure-built', { structure: struct });
  }

  _save();

  return {
    success: true,
    invested: invest,
    total: completed ? struct.light_to_build : current,
    remaining: completed ? 0 : r(struct.light_to_build - current),
    completed: completed,
    structure: struct
  };
}

/* ═══════════════════════════════════════════
   IV. APPLY STRUCTURE EFFECTS
   ═══════════════════════════════════════════ */

function _applyEffect(struct){
  var s = S();
  if(!s) return;

  switch(struct.id){
    case 'heart_core':
      /* +0.05 ether conversion — handled in particles module */
      break;
    case 'eternity_anchor':
      s.ether_awakened_carry = 0.2;
      break;
    case 'radiance_body':
      s.ether_awakened_carry = 0.5;
      break;
  }
}

/**
 * Get current active effects from built structures.
 * @returns {object} effects
 */
function getActiveEffects(){
  var s = S();
  if(!s) return {};
  ensureStructureState();

  var effects = {
    ether_conversion_bonus: 0,
    devotion_bonus: 0,
    shadow_reduction: 1.0,
    lens_rebalance: false,
    ether_carry: 0,
    instant_ether: false,
    max_conversion: 0
  };

  s.structures_built.forEach(function(id){
    switch(id){
      case 'heart_core':
        effects.ether_conversion_bonus += 0.05;
        break;
      case 'spirit_channel':
        effects.devotion_bonus = 0.15;
        break;
      case 'purification_ring':
        effects.shadow_reduction = 0.7;
        break;
      case 'circulation_web':
        effects.lens_rebalance = true;
        break;
      case 'eternity_anchor':
        effects.ether_carry = 0.2;
        break;
      case 'radiance_body':
        effects.max_conversion = 0.95;
        effects.instant_ether = true;
        effects.ether_carry = 0.5;
        break;
    }
  });

  return effects;
}

/**
 * Apply circulation_web effect: rebalance light across lenses.
 * Called during overnight flow.
 */
function rebalanceLenses(){
  if(!isBuilt('circulation_web')) return;
  var s = S();
  if(!s || !s.lenses) return;

  var lensKeys = Object.keys(s.lenses).filter(function(k){
    return s.lenses[k].quests_done > 0;
  });
  if(lensKeys.length < 2) return;

  /* Calculate average passive light */
  var total = 0;
  lensKeys.forEach(function(k){ total += (s.lenses[k].passive_light || 0); });
  var avg = total / lensKeys.length;

  /* Transfer 10% from above-avg to below-avg */
  var transfers = [];
  lensKeys.forEach(function(k){
    var diff = (s.lenses[k].passive_light || 0) - avg;
    if(diff > 0){
      var transfer = r(diff * 0.1);
      s.lenses[k].passive_light = r((s.lenses[k].passive_light || 0) - transfer);
      transfers.push({ from: k, amount: transfer });
    }
  });

  /* Distribute to below-avg */
  var totalTransfer = 0;
  transfers.forEach(function(t){ totalTransfer += t.amount; });
  if(totalTransfer > 0){
    var belowAvg = lensKeys.filter(function(k){ return (s.lenses[k].passive_light || 0) < avg; });
    if(belowAvg.length > 0){
      var perLens = r(totalTransfer / belowAvg.length);
      belowAvg.forEach(function(k){
        s.lenses[k].passive_light = r((s.lenses[k].passive_light || 0) + perLens);
      });
    }
  }

  _save();
}

/* ═══════════════════════════════════════════
   V. UI PANEL
   ═══════════════════════════════════════════ */

function renderPanel(container){
  var s = S();
  if(!s) return;
  ensureStructureState();
  var mera = getMera();

  var html = '<div class="structures-panel">';
  html += '<h3 style="color:#E0C060;margin:0 0 16px 0">🏛 Световые структуры</h3>';

  STRUCTURES.forEach(function(struct){
    var built = isBuilt(struct.id);
    var check = canUnlock(struct.id);
    var progress = getBuildProgress(struct.id);
    var pct = built ? 100 : Math.floor((progress / struct.light_to_build) * 100);
    var locked = !built && !check.can;

    html += '<div class="structure-item' + (built ? ' built' : locked ? ' locked' : '') + '" data-id="' + struct.id + '">';
    html += '<div class="structure-header">';
    html += '<span class="structure-icon">' + struct.icon + '</span>';
    html += '<span class="structure-name">' + struct.name_ru + '</span>';
    html += '<span class="structure-mera">Мера ' + struct.unlock_mera + '</span>';
    html += '</div>';

    html += '<div class="structure-desc">' + struct.effect_desc_ru + '</div>';

    if(built){
      html += '<div class="structure-status built">✅ Построена</div>';
    } else if(locked){
      html += '<div class="structure-status locked">🔒 ' + check.reason + '</div>';
    } else {
      html += '<div class="structure-progress-bar"><div class="structure-progress-fill" style="width:' + pct + '%;background:' + struct.color + '"></div></div>';
      html += '<div class="structure-progress-text">' + r(progress) + ' / ' + struct.light_to_build + ' ☀ (' + pct + '%)</div>';
      html += '<button class="structure-invest-btn" data-id="' + struct.id + '">Вложить свет</button>';
    }

    html += '</div>';
  });

  html += '</div>';

  /* Styles */
  html += '<style>';
  html += '.structures-panel{padding:16px}';
  html += '.structure-item{background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:12px;padding:14px;margin-bottom:10px;transition:all .3s}';
  html += '.structure-item.built{border-color:#4a6a4a;background:rgba(100,200,100,0.05)}';
  html += '.structure-item.locked{opacity:0.5}';
  html += '.structure-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}';
  html += '.structure-icon{font-size:20px}';
  html += '.structure-name{color:#fff;font-weight:600;flex:1}';
  html += '.structure-mera{color:#888;font-size:12px}';
  html += '.structure-desc{color:#aaa;font-size:12px;margin-bottom:8px}';
  html += '.structure-status{font-size:13px;padding:4px 0}';
  html += '.structure-status.built{color:#6f6}';
  html += '.structure-status.locked{color:#888}';
  html += '.structure-progress-bar{height:6px;background:#222;border-radius:3px;overflow:hidden;margin-bottom:4px}';
  html += '.structure-progress-fill{height:100%;border-radius:3px;transition:width .5s}';
  html += '.structure-progress-text{color:#aaa;font-size:11px;margin-bottom:6px}';
  html += '.structure-invest-btn{background:#2a2a4a;color:#aaf;border:1px solid #444;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px}';
  html += '</style>';

  container.innerHTML = html;

  /* Invest buttons */
  container.querySelectorAll('.structure-invest-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = this.dataset.id;
      var struct = STRUCTURES.find(function(st){ return st.id === id; });
      if(!struct) return;
      var remaining = struct.light_to_build - getBuildProgress(id);
      var available = (s.progress ? s.progress.total_light : 0) || 0;
      var amount = Math.min(remaining, available, Math.max(1, Math.floor(available * 0.1)));

      if(amount <= 0){
        alert('Недостаточно света для вложения');
        return;
      }

      var result = investLight(id, amount);
      if(result.success){
        if(result.completed){
          alert('🎉 ' + struct.name_ru + ' построена!');
        }
        renderPanel(container); /* re-render */
      }
    });
  });
}

/* ═══════════════════════════════════════════
   VI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraStructures = {
  __v: 1,
  STRUCTURES: STRUCTURES,
  isBuilt: isBuilt,
  canUnlock: canUnlock,
  getBuildProgress: getBuildProgress,
  investLight: investLight,
  getActiveEffects: getActiveEffects,
  rebalanceLenses: rebalanceLenses,
  renderPanel: renderPanel,
  ensureState: ensureStructureState
};

console.log('[AwaraStructures] Light Structures v1 ready');
})();
