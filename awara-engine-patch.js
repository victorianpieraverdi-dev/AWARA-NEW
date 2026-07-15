/* ============================================================
   AWARA · ENGINE PATCH v1
   Патч для awara-experience-engine.js:
   - processExperience → даёт частицы вместо прямого света
   - Интегрирует эфирный множитель + чувствительность
   - overnightFlow → добавляет конвертацию + пассивный поток
   - Записывает в Свиток
   Загружать ПОСЛЕДНИМ — после всех новых модулей.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraEnginePatch && window.__awaraEnginePatch >= 1) return;
window.__awaraEnginePatch = 1;

/* ═══════════════════════════════════════════
   I. PATCH processExperience
   ═══════════════════════════════════════════ */

if(window.AwaraXP && window.AwaraXP.processExperience){
  var _origProcess = window.AwaraXP.processExperience;

  window.AwaraXP.processExperience = async function(quest, playerResponse, lensSlug, lensDepth, opts){
    /* Call original */
    var result = await _origProcess.call(window.AwaraXP, quest, playerResponse, lensSlug, lensDepth, opts);
    if(!result || result.error) return result;

    /* ── PARTICLES: convert finalLight to particles ── */
    var particles = result.finalLight;
    if(window.AwaraParticles){
      /* Collect particles (applies ether multiplier) */
      particles = window.AwaraParticles.collectParticles(result.finalLight);

      /* Update ether state */
      var quality = result.evaluation ? (result.evaluation.quality_score || 0) : 0;
      window.AwaraParticles.updateEther(particles, quality);

      /* Add sensitivity bonus to particles */
      if(window.AwaraSensitivity){
        var sensBonus = window.AwaraSensitivity.getParticleBonus();
        var etherState = window.AwaraParticles.getEtherState();
        if(etherState === 'awakened' && sensBonus > 0){
          var bonus = particles * sensBonus;
          particles += bonus;
          /* Re-collect the bonus */
          var s; try { s = window.STATE; } catch(e){}
          if(s){
            s.particles_today = (s.particles_today || 0) + bonus;
            s.particles_total = (s.particles_total || 0) + bonus;
          }
        }
      }
    }

    /* ── SENSITIVITY: update ── */
    if(window.AwaraSensitivity && result.evaluation){
      window.AwaraSensitivity.updateSensitivity(result.evaluation, result.multiplier);
    }

    /* ── ASSEMBLY POINT: update ── */
    if(window.AwaraSensitivity && result.evaluation && result.evaluation.loka){
      window.AwaraSensitivity.updateAssemblyPoint(result.evaluation.loka);
    }

    /* ── LIGHT STRUCTURES: apply effects ── */
    if(window.AwaraStructures){
      var effects = window.AwaraStructures.getActiveEffects();

      /* Shadow reduction from purification ring */
      if(effects.shadow_reduction < 1.0 && result.evaluation && result.evaluation.shadow_detected){
        /* Already processed in original, but reduce the shadow effect in state */
        try {
          var st = window.STATE;
          if(st && st.shadows){
            var sid = result.evaluation.shadow_detected;
            if(st.shadows[sid] !== undefined){
              st.shadows[sid] = Math.max(0, st.shadows[sid] * effects.shadow_reduction);
            }
          }
        } catch(e){}
      }

      /* Devotion bonus from spirit channel */
      if(effects.devotion_bonus > 0){
        var questType = quest ? quest.type : '';
        if(questType === 'ritual' || (result.evaluation && result.evaluation.primary_axis === 'devotion')){
          particles *= (1 + effects.devotion_bonus);
        }
      }

      /* Instant ether from radiance body */
      if(effects.instant_ether && window.AwaraParticles){
        try {
          var s2 = window.STATE;
          if(s2 && s2.ether_state !== 'awakened'){
            s2.ether_state = 'awakened';
          }
        } catch(e){}
      }
    }

    /* ── SCROLL: record entry ── */
    if(window.AwaraScroll){
      var etherSt = window.AwaraParticles ? window.AwaraParticles.getEtherState() : 'sleeping';
      var tier = window.AwaraRarity ? window.AwaraRarity.getTierByScore() : { id: 'common' };
      var ring = -3;
      try { ring = window.STATE.progress.current_ring || -3; } catch(e){}

      window.AwaraScroll.recordEntry({
        quest: quest,
        response_text: playerResponse,
        evaluation: result.evaluation,
        particles: particles,
        light: result.finalLight,
        lens: lensSlug,
        depth: lensDepth,
        ether_state: etherSt,
        tier: tier.id,
        ring: ring
      });
    }

    /* ── ENRICH result with new data ── */
    result.particles = particles;
    result.ether = window.AwaraParticles ? window.AwaraParticles.getEtherInfo() : null;
    result.sensitivity = window.AwaraSensitivity ? window.AwaraSensitivity.getSensitivity() : null;
    result.rarity = window.AwaraRarity ? window.AwaraRarity.getTierByScore() : null;
    result.assembly_point = window.AwaraSensitivity ? window.AwaraSensitivity.getAssemblyPoint() : null;
    result.ray = window.AwaraSensitivity ? window.AwaraSensitivity.getRayDescription() : null;

    /* Save */
    try { localStorage.setItem('STATE', JSON.stringify(window.STATE)); } catch(e){}

    return result;
  };

  console.log('[EnginePatch] processExperience patched: particles + ether + sensitivity + scroll');
}

/* ═══════════════════════════════════════════
   II. PATCH overnightFlow
   ═══════════════════════════════════════════ */

if(window.AwaraXP && window.AwaraXP.overnightFlow){
  var _origOvernight = window.AwaraXP.overnightFlow;

  window.AwaraXP.overnightFlow = function(){
    console.log('[EnginePatch] Enhanced overnight flow starting...');

    /* 1. Original cascade_down + daily reset */
    _origOvernight.call(window.AwaraXP);

    /* 2. Particle → Light conversion */
    if(window.AwaraParticles){
      var convResult = window.AwaraParticles.overnightConvert();
      console.log('[EnginePatch] Particles converted:', convResult);
    }

    /* 3. Passive flow (practices) */
    if(window.AwaraPassiveFlow){
      var passiveLight = window.AwaraPassiveFlow.overnightPassive();
      console.log('[EnginePatch] Passive flow:', passiveLight);
    }

    /* 4. Light structure: lens rebalancing */
    if(window.AwaraStructures){
      window.AwaraStructures.rebalanceLenses();
    }

    /* 5. Reset ether */
    if(window.AwaraParticles){
      window.AwaraParticles.resetEtherOvernight();
    }

    /* 6. Ring recalc */
    try {
      var S = window.STATE;
      if(S && S.progress && window.AwaraXP.computeRing){
        S.progress.current_ring = window.AwaraXP.computeRing(S.progress.total_light);
      }
      localStorage.setItem('STATE', JSON.stringify(S));
    } catch(e){}

    console.log('[EnginePatch] Enhanced overnight flow complete');
  };

  console.log('[EnginePatch] overnightFlow patched: particles + passive + structures + ether reset');
}

/* ═══════════════════════════════════════════
   III. DAILY CHECKIN HOOK
   ═══════════════════════════════════════════ */

/* Show daily checkin on first interaction */
function _tryCheckin(){
  if(!window.AwaraPassiveFlow) return;
  if(!window.AwaraPassiveFlow.needsCheckin()) return;

  /* Create container for checkin overlay */
  var div = document.createElement('div');
  div.id = 'awaraCheckinContainer';
  document.body.appendChild(div);

  var shown = window.AwaraPassiveFlow.renderCheckin(div);
  if(!shown) div.remove();
}

/* Run checkin after a small delay to let page load */
setTimeout(_tryCheckin, 2000);

/* Also listen for game entry */
window.addEventListener('awara-game-entered', function(){
  setTimeout(_tryCheckin, 500);
});

/* ═══════════════════════════════════════════
   IV. INIT NEW STATE FIELDS
   ═══════════════════════════════════════════ */

function _initNewFields(){
  try {
    var S = window.STATE;
    if(!S) return;

    /* Particles */
    if(window.AwaraParticles) window.AwaraParticles.ensureState();

    /* Sensitivity */
    if(window.AwaraSensitivity) window.AwaraSensitivity.ensureState();

    /* Structures */
    if(window.AwaraStructures) window.AwaraStructures.ensureState();

    /* Save */
    localStorage.setItem('STATE', JSON.stringify(S));
  } catch(e){}
}

setTimeout(_initNewFields, 1000);

console.log('[AwaraEnginePatch] Engine Patch v1 ready — all systems integrated');
})();
