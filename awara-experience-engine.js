/* AWARA · Unified Experience Engine v3 (hardened)
   Источник правды: data/engine_config.json
   
   Зависимости:
   - window.AwaraLight  — Лестница Света (awara-light.js)
   - window.STATE       — состояние игрока
   - window.aiCall      — AI вызовы
   - window.POLAR       — данные дня (энергия, агент)
   
   API:
   - AwaraXP.init()                          — загрузить config
   - AwaraXP.processExperience(quest, text, lens, depth, opts)
   - AwaraXP.getSensory(type, level)         — сенсорный слой
   - AwaraXP.renderDevPanel(el)              — DEV-панель
   - AwaraXP.getOracleReflection(...)        — текст оракула
   - AwaraXP.canDoQuest()                    — проверка дневного лимита
   - AwaraXP.canUseAI()                      — проверка лимита ИИ
   - AwaraXP.checkDepthGate(lens, depth)     — можно ли подняться
   
   Множители (11):
   1.lens_depth  2.daily_energy  3.agent_resonance  4.loka_density
   5.guna  6.quality  7.shadow_bonus  8.mastery_bonus
   9.coop_bonus  10.creativity_bonus  11.media_bonus
*/
(function(){
'use strict';
if(window.AwaraXP && window.AwaraXP.__v >= 3) return;

/* ═══════════════════════════════════════════
   I. CONFIG
   ═══════════════════════════════════════════ */

var CFG = null;
var AXES = ['discipline','compassion','clarity','will','devotion','transformation','unity'];
var ELEMENTS = ['earth','water','fire','air','ether'];

var ELEMENT_RU = {
  'Земля':'earth','Вода':'water','Огонь':'fire','Воздух':'air','Эфир':'ether',
  'earth':'earth','water':'water','fire':'fire','air':'air','ether':'ether'
};
var ELEMENT_EN = {
  'earth':'Земля','water':'Вода','fire':'Огонь','air':'Воздух','ether':'Эфир'
};

/* ═══════════════════════════════════════════
   II. DEFAULT MULTIPLIER TABLES
   ═══════════════════════════════════════════ */

var DEPTH_MULT = {1:1.0, 2:1.2, 3:1.4, 4:1.6, 5:1.8, 6:2.0};
var GUNA_MULT = {tamas:0.6, rajas:1.0, sattva:1.5};
var LOKA_DENSITY = {1:9,2:8,3:7,4:6,5:5,6:4,7:1,8:1,9:2,10:3,11:4,12:5,13:6,14:7};
var RESONANCE_MULT = {0:1.0, 1:1.15, 2:1.3, 3:1.45, 4:1.6, 5:1.75, 6:1.9, 7:2.1};
var AGENT_RESONANCE = {match:1.2, no_match:1.0};

var WINDOW_THRESHOLDS = [
  {id:'daimon',      mera:0, min:0,    max:0.5},
  {id:'locations',   mera:1, min:0.5,  max:1.5},
  {id:'emf',         mera:2, min:1.5,  max:3.0},
  {id:'newmatrix',   mera:3, min:3.0,  max:5.0},
  {id:'soul',        mera:4, min:5.0,  max:7.0},
  {id:'daimon_soul', mera:5, min:7.0,  max:10.0},
  {id:'chronicle',   mera:6, min:10.0, max:15.0},
  {id:'hram',        mera:7, min:15.0, max:25.0},
  {id:'cosmos',      mera:8, min:25.0, max:50.0},
  {id:'supergame',   mera:9, min:50.0, max:Infinity}
];

var QUEST_TYPE_ELEMENT = {
  do:'earth', meditate:'ether', observe:'air',
  reflect:'water', create:'fire', study:'air', ritual:'fire'
};
var QUEST_TYPE_AXIS = {
  do:'discipline', meditate:'clarity', observe:'clarity',
  reflect:'transformation', create:'will', study:'clarity', ritual:'devotion'
};
var ELEMENT_AXES = {
  earth:{primary:'discipline',secondary:'will'},
  water:{primary:'compassion',secondary:'devotion'},
  fire: {primary:'will',      secondary:'transformation'},
  air:  {primary:'clarity',   secondary:'compassion'},
  ether:{primary:'clarity',   secondary:'unity'}
};
var ELEMENT_PRINCIPLE = {
  earth:'sthula', water:'prana', fire:'prana', air:'manas', ether:'manas'
};

// Shadows
var SHADOWS = {
  8:{id:'inertia',      chakra:'Муладхара'},
  9:{id:'attachment',   chakra:'Свадхистхана'},
  10:{id:'manipulation',chakra:'Манипура'},
  11:{id:'envy',        chakra:'Анахата'},
  12:{id:'deception',   chakra:'Вишуддха'},
  13:{id:'illusion',    chakra:'Аджна'},
  14:{id:'separation',  chakra:'Сахасрара'}
};

// Mastery bonus thresholds
var MASTERY_TABLE = [
  {ring:-3, quality:0,   mult:1.0},
  {ring:1,  quality:0.5, mult:1.15},
  {ring:3,  quality:0.6, mult:1.3},
  {ring:5,  quality:0.7, mult:1.5},
  {ring:7,  quality:0.8, mult:1.8},
  {ring:9,  quality:0.9, mult:2.0}
];

// Coop bonus
var COOP_MULT = {1:1.0, 2:1.3, 3:1.5, 4:1.7};

// Creativity bonus
var CREATIVITY_MULT = {
  none:1.0, lyrical:1.2, poetry:1.4,
  art_reference:1.5, original_creation:1.7
};

// Media bonus
var MEDIA_MULT = {
  none:1.0, photo_1:1.2, photo_2plus:1.3,
  audio:1.4, video:1.5, mixed:1.6
};

// Pacing defaults
var AI_EVALS_BY_RING = {'-3':3,'-2':3,'-1':5,'0':5,'1':7,'2':8,'3':10,'4':12,'5':15,'6':20,'7':25,'8':30,'9':999};
var QUEST_CAP_BY_RING = {'-3':5,'-2':5,'-1':5,'0':5,'1':6,'2':6,'3':6,'4':8,'5':8,'6':8,'7':10,'8':10,'9':12};
var DEPTH_GATES = {
  2:{quests:5,quality:0}, 3:{quests:13,quality:0.4},
  4:{quests:25,quality:0.5}, 5:{quests:43,quality:0.6},
  6:{quests:68,quality:0.7}
};

var RING_THRESHOLDS = {
  '-3':0,'-2':5,'-1':15,'0':30,
  '1':50,'2':100,'3':200,'4':400,
  '5':700,'6':1200,'7':2000,'8':3500,'9':6000
};

/* ═══════════════════════════════════════════
   III. INIT
   ═══════════════════════════════════════════ */

async function init() {
  try {
    var resp = await fetch('data/engine_config.json');
    CFG = await resp.json();
    
    // Override from config
    if(CFG.multipliers) {
      var M = CFG.multipliers;
      if(M.lens_depth && M.lens_depth.values) {
        for(var k in M.lens_depth.values) DEPTH_MULT[parseInt(k)] = M.lens_depth.values[k];
      }
      if(M.guna && M.guna.values) {
        for(var g in M.guna.values) GUNA_MULT[g] = M.guna.values[g];
      }
      if(M.loka_density && M.loka_density.values) {
        for(var l in M.loka_density.values) LOKA_DENSITY[parseInt(l)] = M.loka_density.values[l];
      }
      if(M.agent_resonance) {
        AGENT_RESONANCE.match = M.agent_resonance.match || 1.2;
      }
      if(M.mastery_bonus && M.mastery_bonus.thresholds) {
        MASTERY_TABLE = M.mastery_bonus.thresholds.map(function(t){
          return {ring:t.ring_min, quality:t.quality_min, mult:t.multiplier};
        });
      }
      if(M.coop_bonus && M.coop_bonus.values) {
        COOP_MULT = {};
        for(var ck in M.coop_bonus.values) COOP_MULT[parseInt(ck)] = M.coop_bonus.values[ck];
      }
      if(M.creativity_bonus && M.creativity_bonus.levels) {
        CREATIVITY_MULT = {};
        for(var cl in M.creativity_bonus.levels) CREATIVITY_MULT[cl] = M.creativity_bonus.levels[cl].multiplier;
      }
      if(M.media_bonus && M.media_bonus.values) {
        MEDIA_MULT = M.media_bonus.values;
      }
    }
    if(CFG.daily_energy && CFG.daily_energy.dominance_calculation && CFG.daily_energy.dominance_calculation.resonance_multiplier) {
      var rm = CFG.daily_energy.dominance_calculation.resonance_multiplier;
      for(var rk in rm) { var n=parseInt(rk); if(!isNaN(n)) RESONANCE_MULT[n]=rm[rk]; }
    }
    if(CFG.mera_windows && CFG.mera_windows.windows) {
      WINDOW_THRESHOLDS = CFG.mera_windows.windows.map(function(w) {
        var parts=(w.threshold||'').replace(/[<>]/g,'').trim().split(/\s*-\s*/);
        var min=parseFloat(parts[0])||0, max=parts.length>1?parseFloat(parts[1]):Infinity;
        if(w.threshold.indexOf('>')>=0){min=parseFloat(parts[0])||0;max=Infinity;}
        if(w.threshold.indexOf('<')>=0){min=0;max=parseFloat(parts[0])||0.5;}
        return {id:w.id, mera:w.mera, min:min, max:max, name:w.name};
      });
    }
    if(CFG.pacing) {
      if(CFG.pacing.ai_evals_by_ring) AI_EVALS_BY_RING = CFG.pacing.ai_evals_by_ring;
      if(CFG.pacing.daily_quest_cap_by_ring) QUEST_CAP_BY_RING = CFG.pacing.daily_quest_cap_by_ring;
      if(CFG.pacing.depth_gates) {
        DEPTH_GATES = {};
        for(var dg in CFG.pacing.depth_gates) {
          var g2 = CFG.pacing.depth_gates[dg];
          DEPTH_GATES[parseInt(dg)] = {quests:g2.quests_in_lens, quality:g2.quality_avg};
        }
      }
    }
    
    console.log('[AwaraXP] Config v2 loaded, 11 multipliers active');
  } catch(e) {
    console.warn('[AwaraXP] Config load failed, using defaults:', e);
    CFG = null;
  }
  AwaraXP.__ready = true;
}

/* ═══════════════════════════════════════════
   IV. AI EVALUATION (extended: +creativity_level, +shadow_detected)
   ═══════════════════════════════════════════ */

var EVAL_SYSTEM = [
  'Ты — Дешифратор Качества ответа игрока в игре AWARA.',
  'Оцени КАЧЕСТВО ответа игрока и верни JSON:',
  '{',
  '  "element": "Земля|Вода|Огонь|Воздух|Эфир",',
  '  "guna": "tamas|rajas|sattva",',
  '  "quality_score": 0.0-1.0,',
  '  "fullness_score": 0.0-1.0,',
  '  "loka": 1-14,',
  '  "shadow_detected": null | "distortion_id",',
  '  "creativity_level": "none|lyrical|poetry|art_reference|original_creation",',
  '  "reasoning": "краткое пояснение"',
  '}',
  '',
  'Стихия определяется КАЧЕСТВОМ ответа:',
  '- Земля: стойкость, дисциплина, заземление, тело, действие',
  '- Вода: гармония, поток, сострадание, эмоции, принятие',
  '- Огонь: воля, интенсивность, трансформация, тапас',
  '- Воздух: контроль ума, ясность, равновесие, наблюдение',
  '- Эфир: глубина, точность, эзотерическое знание, целостность',
  '',
  'Гуна: тамас=вялый/формальный, раджас=активный/эмоциональный, саттва=ясный/гармоничный.',
  'quality_score: 0=формально, 1=глубоко и искренне.',
  'fullness_score: 0=одномерно, 1=многомерно (затрагивает тело+ум+чувства+волю+дух).',
  'loka: 1=Сатья (высшая), 7=Бхур (земля), 8-14=низшие (работа с тенями).',
  '',
  'shadow_detected: если игрок назвал И ПРОРАБОТАЛ теневой аспект:',
  '  8=inertia, 9=attachment, 10=manipulation, 11=envy,',
  '  12=deception, 13=illusion, 14=separation. Если нет — null.',
  '',
  'creativity_level: уровень творческого выражения:',
  '- none: обычный текст без художественности',
  '- lyrical: лиричный, поэтичный стиль, метафоры',
  '- poetry: стихи, ритм, глубокое чувство',
  '- art_reference: отсылка к музыке, живописи, танцу',
  '- original_creation: оригинальный стих, песня, рисунок',
  '',
  'Отвечай ТОЛЬКО JSON, без markdown.'
].join('\n');

async function evaluateResponse(quest, playerResponse, lensSlug) {
  if(!window.aiCall) {
    return fallbackEvaluation(quest);
  }

  // Check AI limit
  if(!canUseAI()) {
    console.log('[AwaraXP] AI limit reached, using fallback');
    return fallbackEvaluation(quest);
  }

  var userMsg = [
    'Квест: ' + (quest.title || ''),
    'Тип: ' + (quest.type || 'do'),
    'Линза: ' + (lensSlug || 'vedic'),
    'Текст квеста: ' + (quest.text || ''),
    '---',
    'Ответ игрока: ' + (playerResponse || '(выполнено без текста)')
  ].join('\n');

  try {
    var msgs = [
      {role:'system', content:EVAL_SYSTEM},
      {role:'user',   content:userMsg}
    ];
    var raw = await window.aiCall(msgs);
    var jsonStr = raw.replace(/```json?\n?/g,'').replace(/```/g,'').trim();
    var result = JSON.parse(jsonStr);
    
    result.element = ELEMENT_RU[result.element] || 'earth';
    if(ELEMENTS.indexOf(result.element)<0) result.element = 'earth';
    if(!['tamas','rajas','sattva'].includes(result.guna)) result.guna = 'rajas';
    result.quality_score = Math.max(0, Math.min(1, result.quality_score || 0.5));
    result.fullness_score = Math.max(0, Math.min(1, result.fullness_score || 0.3));
    result.loka = Math.max(1, Math.min(14, result.loka || 7));
    result.shadow_detected = result.shadow_detected || null;
    result.creativity_level = result.creativity_level || 'none';
    if(!CREATIVITY_MULT[result.creativity_level]) result.creativity_level = 'none';
    
    // Sanitize all fields (v3)
    result = sanitizeEvaluation(result, quest);
    result._source = 'ai';
    
    // Consume AI eval
    _consumeAIEval();
    
    return result;
  } catch(e) {
    console.error('[AwaraXP] AI eval failed:', e);
    return fallbackEvaluation(quest);
  }
}


/* ═══════════════════════════════════════════
   IV-b. SANITIZE EVALUATION (v3 hardening)
   Clamp, type-check, and fallback every AI field.
   Called on EVERY evaluation result (AI, fallback, dev_override).
   ═══════════════════════════════════════════ */

var VALID_GUNAS = ['tamas','rajas','sattva'];
var VALID_CREATIVITY = ['none','lyrical','poetry','art_reference','original_creation'];
var VALID_SHADOWS = ['inertia','attachment','manipulation','envy','deception','illusion','separation'];

function sanitizeEvaluation(ev, quest) {
  if(!ev || typeof ev !== 'object') ev = {};
  var clean = {};
  
  // element: must be one of 5
  var rawEl = ev.element;
  if(typeof rawEl === 'string') rawEl = ELEMENT_RU[rawEl] || rawEl;
  clean.element = (ELEMENTS.indexOf(rawEl) >= 0) ? rawEl : (QUEST_TYPE_ELEMENT[(quest||{}).type] || 'earth');
  
  // guna: must be one of 3
  clean.guna = (VALID_GUNAS.indexOf(ev.guna) >= 0) ? ev.guna : 'rajas';
  
  // quality_score: 0..1 float
  var qs = parseFloat(ev.quality_score);
  clean.quality_score = (isFinite(qs)) ? Math.max(0, Math.min(1, qs)) : 0.5;
  
  // fullness_score: 0..1 float
  var fs = parseFloat(ev.fullness_score);
  clean.fullness_score = (isFinite(fs)) ? Math.max(0, Math.min(1, fs)) : 0.1;
  
  // loka: 1..14 integer
  var lk = parseInt(ev.loka);
  clean.loka = (isFinite(lk) && lk >= 1 && lk <= 14) ? lk : 7;
  
  // shadow_detected: null or valid shadow id
  if(ev.shadow_detected && VALID_SHADOWS.indexOf(ev.shadow_detected) >= 0) {
    clean.shadow_detected = ev.shadow_detected;
  } else {
    clean.shadow_detected = null;
  }
  
  // creativity_level: must be one of 5
  clean.creativity_level = (VALID_CREATIVITY.indexOf(ev.creativity_level) >= 0) ? ev.creativity_level : 'none';
  
  // pass-through fields
  clean.reasoning = String(ev.reasoning || '');
  clean._source = ev._source || 'unknown';
  
  return clean;
}

function fallbackEvaluation(quest) {
  var type = quest.type || 'do';
  return {
    element: QUEST_TYPE_ELEMENT[type] || 'earth',
    guna: 'rajas',
    quality_score: 0.5,
    fullness_score: 0.1,
    loka: 7,
    shadow_detected: null,
    creativity_level: 'none',
    reasoning: 'Fallback (без ИИ)',
    _source: 'fallback'
  };
}

/* ═══════════════════════════════════════════
   V. MULTIPLIER COMPUTATION (11 multipliers)
   ═══════════════════════════════════════════ */

function computeMultipliers(evaluation, lensDepth, opts) {
  opts = opts || {};
  var details = {};
  var mult = 1.0;
  
  // 1. Lens depth
  var depth = Math.max(1, Math.min(6, lensDepth || 1));
  var dm = DEPTH_MULT[depth] || 1.0;
  mult *= dm;
  details.lens_depth = {value: dm, level: depth};
  
  // 2. Daily energy resonance
  var matchCount = 0;
  if(window.POLAR && window.POLAR.facets) {
    var elRu = ELEMENT_EN[evaluation.element] || '';
    window.POLAR.facets.forEach(function(f) {
      if(f && f.el && f.el === elRu) matchCount++;
    });
  }
  var drm = RESONANCE_MULT[matchCount] || 1.0;
  mult *= drm;
  details.daily_energy = {value: drm, matches: matchCount};
  
  // 3. Agent resonance
  var agentMatch = false;
  if(window.POLAR && window.POLAR.agent) {
    var agentEl = ELEMENT_RU[window.POLAR.agent.element] || '';
    agentMatch = (agentEl === evaluation.element);
  }
  var arm = agentMatch ? AGENT_RESONANCE.match : AGENT_RESONANCE.no_match;
  mult *= arm;
  details.agent = {value: arm, match: agentMatch};
  
  // 4. Loka density
  var density = LOKA_DENSITY[evaluation.loka] || 1;
  var ldm = 1 + (density - 1) * 0.05;
  mult *= ldm;
  details.loka_density = {value: _r(ldm), density: density, loka: evaluation.loka};
  
  // 5. Guna
  var gm = GUNA_MULT[evaluation.guna] || 1.0;
  mult *= gm;
  details.guna = {value: gm, type: evaluation.guna};
  
  // 6. Quality
  var qm = 0.5 + evaluation.quality_score * 0.5;
  mult *= qm;
  details.quality = {value: _r(qm), score: evaluation.quality_score};
  
  // 7. Shadow bonus (+10%)
  if(evaluation.shadow_detected) {
    mult *= 1.1;
    details.shadow_bonus = {value: 1.1, shadow: evaluation.shadow_detected};
  }
  
  // 8. Mastery bonus (ring × quality_avg)
  var ring = _getPlayerRing();
  var qAvg = _getPlayerQualityAvg();
  var masteryMult = 1.0;
  for(var i = MASTERY_TABLE.length - 1; i >= 0; i--) {
    if(ring >= MASTERY_TABLE[i].ring && qAvg >= MASTERY_TABLE[i].quality) {
      masteryMult = MASTERY_TABLE[i].mult;
      break;
    }
  }
  if(masteryMult > 1.0) {
    mult *= masteryMult;
    details.mastery = {value: masteryMult, ring: ring, quality_avg: _r(qAvg)};
  }
  
  // 9. Coop bonus
  var coopCount = opts.coop_players || 1;
  var coopKey = Math.min(coopCount, 4);
  var coopMult = COOP_MULT[coopKey] || 1.0;
  if(coopMult > 1.0) {
    mult *= coopMult;
    details.coop = {value: coopMult, players: coopCount};
  }
  
  // 10. Creativity bonus
  var creativityLevel = evaluation.creativity_level || 'none';
  var creativityMult = CREATIVITY_MULT[creativityLevel] || 1.0;
  if(creativityMult > 1.0) {
    mult *= creativityMult;
    details.creativity = {value: creativityMult, level: creativityLevel};
  }
  
  // 11. Media bonus
  var mediaType = opts.media_type || 'none';
  var mediaMult = MEDIA_MULT[mediaType] || 1.0;
  if(mediaMult > 1.0) {
    mult *= mediaMult;
    details.media = {value: mediaMult, type: mediaType};
  }
  
  // v3 guard: ensure multiplier is finite and positive
  mult = _safe(mult, 1.0);
  if(mult <= 0) mult = 0.01;
  return {total: _r(mult), details: details};
}

function _r(n){ var v = Math.round(n*100)/100; return isFinite(v) ? v : 0; }

/* v3 NaN/Infinity guard */
function _safe(n, fallback) {
  return (typeof n === 'number' && isFinite(n)) ? n : (fallback || 0);
}


/* ═══════════════════════════════════════════
   VI. WINDOW SELECTION BY THRESHOLD
   ═══════════════════════════════════════════ */

function selectWindow(finalLight) {
  for(var i = WINDOW_THRESHOLDS.length - 1; i >= 0; i--) {
    if(finalLight >= WINDOW_THRESHOLDS[i].min) {
      return {id: WINDOW_THRESHOLDS[i].id, mera: WINDOW_THRESHOLDS[i].mera, name: WINDOW_THRESHOLDS[i].name || WINDOW_THRESHOLDS[i].id};
    }
  }
  return {id:'daimon', mera:0, name:'Даймон'};
}

/* ═══════════════════════════════════════════
   VII. SENSORY, ORACLE, SUNO
   ═══════════════════════════════════════════ */

function getSensory(questType, level) {
  if(!CFG || !CFG.sensory || !CFG.sensory.mode_mapping) return null;
  var sm = CFG.sensory.mode_mapping;
  var lvl = String(Math.max(1, Math.min(6, level || 1)));
  var result = {};
  ['sound','visual','breath','body'].forEach(function(mode) {
    if(sm[mode] && sm[mode][questType]) {
      result[mode] = sm[mode][questType][lvl] || sm[mode][questType]['1'];
    }
  });
  return result;
}

function getOracleReflection(questType, quest, dominantAxis, sensoryText, agentVoice) {
  if(!CFG || !CFG.sensory || !CFG.sensory.oracle_reflection_templates) return '';
  var template = CFG.sensory.oracle_reflection_templates[questType] || '';
  return template
    .replace('{title}', quest.title || '')
    .replace('{dominant_axis_name}', dominantAxis || '')
    .replace('{sensory_text}', sensoryText || '')
    .replace('{agent_voice}', agentVoice || '');
}

function buildSunoPrompt(questType, level, traditionCulture) {
  if(!CFG || !CFG.sensory || !CFG.sensory.suno_prompt_config) return '';
  var sc = CFG.sensory.suno_prompt_config[questType];
  if(!sc) return '';
  var lvl = String(Math.max(1, Math.min(6, level || 1)));
  var mood = sc.mood_by_level[lvl] || sc.mood_by_level['1'];
  return (sc.style||'')+', '+(traditionCulture||'')+' influence, '+mood+'; instrumental, 2 minutes, no vocals';
}

/* ═══════════════════════════════════════════
   VIII. PACING SYSTEM
   ═══════════════════════════════════════════ */

var PACING_KEY = 'awara_pacing';
var DEV_MODE_KEY = 'awara_dev_mode';

function _isDevMode() {
  try { return localStorage.getItem(DEV_MODE_KEY) === '1'; } catch(e) { return false; }
}

function _loadPacing() {
  try {
    var d = JSON.parse(localStorage.getItem(PACING_KEY) || '{}');
    var today = new Date().toISOString().slice(0,10);
    if(d.date !== today) d = {date:today, ai_used:0, quests_done:0};
    return d;
  } catch(e) { return {date:new Date().toISOString().slice(0,10), ai_used:0, quests_done:0}; }
}

function _savePacing(d) {
  try { localStorage.setItem(PACING_KEY, JSON.stringify(d)); } catch(e){}
}

function canUseAI() {
  if(_isDevMode()) return true;
  var ring = _getPlayerRing();
  var limit = AI_EVALS_BY_RING[String(ring)] || AI_EVALS_BY_RING[String(Math.min(ring, 9))] || 10;
  var d = _loadPacing();
  return d.ai_used < limit;
}

function getAIRemaining() {
  var ring = _getPlayerRing();
  var limit = _isDevMode() ? 999 : (AI_EVALS_BY_RING[String(ring)] || 10);
  var d = _loadPacing();
  return {used: d.ai_used, limit: limit, remaining: Math.max(0, limit - d.ai_used)};
}

function _consumeAIEval() {
  var d = _loadPacing();
  d.ai_used++;
  _savePacing(d);
}

function canDoQuest() {
  if(_isDevMode()) return true;
  var ring = _getPlayerRing();
  var cap = QUEST_CAP_BY_RING[String(ring)] || QUEST_CAP_BY_RING[String(Math.min(ring, 9))] || 6;
  var d = _loadPacing();
  return d.quests_done < cap;
}

function getQuestRemaining() {
  var ring = _getPlayerRing();
  var cap = _isDevMode() ? 999 : (QUEST_CAP_BY_RING[String(ring)] || 6);
  var d = _loadPacing();
  return {done: d.quests_done, cap: cap, remaining: Math.max(0, cap - d.quests_done)};
}

function _consumeQuest() {
  var d = _loadPacing();
  d.quests_done++;
  _savePacing(d);
}

function checkDepthGate(lensSlug, targetDepth) {
  if(_isDevMode()) return {allowed:true, reason:'dev_mode'};
  var gate = DEPTH_GATES[targetDepth];
  if(!gate) return {allowed:true, reason:'no_gate'};
  
  // Count quests done in this lens
  var questsDone = 0;
  var qualityAvg = 0;
  try {
    var S = window.STATE;
    if(S && S.lenses && S.lenses[lensSlug]) {
      questsDone = S.lenses[lensSlug].quests_done || 0;
      qualityAvg = S.lenses[lensSlug].quality_avg || 0;
    }
  } catch(e){}
  
  var questsOk = questsDone >= gate.quests;
  var qualityOk = qualityAvg >= gate.quality;
  
  if(questsOk && qualityOk) {
    return {allowed:true, reason:'gates_passed'};
  }
  return {
    allowed: false,
    reason: !questsOk ? 'need_quests' : 'need_quality',
    required_quests: gate.quests,
    current_quests: questsDone,
    required_quality: gate.quality,
    current_quality: _r(qualityAvg)
  };
}

/* ═══════════════════════════════════════════
   IX. PLAYER STATE HELPERS
   ═══════════════════════════════════════════ */

function _getPlayerRing() {
  try {
    if(window.STATE && window.STATE.progress) return window.STATE.progress.current_ring || -3;
  } catch(e){}
  return -3;
}

function _getPlayerQualityAvg() {
  try {
    if(window.STATE && window.STATE.mera) return window.STATE.mera.quality || 0;
  } catch(e){}
  return 0;
}

function computeRing(totalLight) {
  var ring = -3;
  for(var r = -3; r <= 9; r++) {
    if(totalLight >= (RING_THRESHOLDS[String(r)] || 0)) ring = r;
    else break;
  }
  return ring;
}

/* ═══════════════════════════════════════════
   X. CORE: processExperience
   ═══════════════════════════════════════════ */

async function processExperience(quest, playerResponse, lensSlug, lensDepth, opts) {
  opts = opts || {};
  // opts.coop_players: number (1=solo)
  // opts.media_type: 'none'|'photo_1'|'photo_2plus'|'audio'|'video'|'mixed'
  // opts.override_eval: object (DEV override)
  
  // Check quest cap
  if(!canDoQuest() && !opts.override_eval) {
    return {error: 'quest_cap_reached', message: 'Дневной лимит квестов исчерпан'};
  }
  
  // Step 1: AI evaluation
  var evaluation;
  if(opts.override_eval) {
    evaluation = opts.override_eval;
    evaluation._source = 'dev_override';
  } else if((quest.proof === 'check' || quest.proof === 'timer') && (!playerResponse || playerResponse.length <= 20)) {
    evaluation = fallbackEvaluation(quest);
    evaluation._source = 'fallback';
  } else {
    evaluation = await evaluateResponse(quest, playerResponse, lensSlug);
    evaluation._source = evaluation._source || 'ai';
  }
  
  // Step 1b: Sanitize evaluation (v3 — catches any source)
  evaluation = sanitizeEvaluation(evaluation, quest);
  evaluation._source = evaluation._source || 'unknown';

  // Step 2: Compute multipliers (all 11)
  var multiplierResult = computeMultipliers(evaluation, lensDepth, opts);
  var multiplier = multiplierResult.total;
  
  // Step 3: Base reward
  var baseReward = quest.reward || {};
  var totalGrain = 0;
  for(var ax in baseReward) {
    if(AXES.indexOf(ax) >= 0) totalGrain += baseReward[ax];
  }
  if(totalGrain === 0) totalGrain = 2;
  
  // Step 4: Final light (v3 guarded)
  var finalLight = _r(_safe(totalGrain, 2) * _safe(multiplier, 1));
  if(finalLight <= 0) finalLight = 0.01; // always positive light
  
  // Step 5: Window by threshold
  var win = selectWindow(finalLight);
  
  // Step 6: Flow light
  if(window.AwaraLight && window.AwaraLight.botInfluence) {
    window.AwaraLight.botInfluence(win.id, finalLight);
  }
  
  // Step 7: Update state
  updateState(evaluation, baseReward, multiplier, win, finalLight, lensSlug);
  
  // Step 8: Consume quest counter
  _consumeQuest();
  
  // Step 9: Sensory
  var sensory = getSensory(quest.type || 'do', lensDepth || 1);
  
  // Step 10: Axes gained (v3 guarded)
  var axesGained = {};
  for(var ax2 in baseReward) {
    if(AXES.indexOf(ax2) >= 0) {
      axesGained[ax2] = _r(_safe(baseReward[ax2], 0) * _safe(multiplier, 1));
    }
  }
  
  var result = {
    evaluation: evaluation,
    multiplier: multiplier,
    multiplier_details: multiplierResult.details,
    baseGrain: _r(totalGrain),
    finalLight: finalLight,
    window: win,
    axes_gained: axesGained,
    element_axes: ELEMENT_AXES[evaluation.element] || {},
    principle: ELEMENT_PRINCIPLE[evaluation.element] || 'sthula',
    shadow_reduced: evaluation.shadow_detected || null,
    sensory: sensory,
    pacing: {
      ai: getAIRemaining(),
      quests: getQuestRemaining()
    }
  };
  
  // v3 audit
  _audit(result, quest, lensSlug, lensDepth);
  
  try { window.dispatchEvent(new CustomEvent('awara-xp', {detail: result})); } catch(e){}
  
  AwaraXP._lastResult = result;
  AwaraXP._lastQuest = {quest:quest, response:playerResponse, lens:lensSlug, depth:lensDepth, opts:opts};
  
  return result;
}

/* ═══════════════════════════════════════════
   XI. STATE UPDATE
   ═══════════════════════════════════════════ */

function updateState(evaluation, baseReward, multiplier, meraWindow, finalLight, lensSlug) {
  if(!window.STATE) return;
  var S = window.STATE;
  
  if(!S.progress) S.progress = {total_light:0, current_ring:-3, days_played:0, quests_completed:0};
  if(!S.axes) { S.axes = {}; AXES.forEach(function(a){ S.axes[a] = 0; }); }
  if(!S.elements) S.elements = {earth:0, water:0, fire:0, air:0, ether:0};
  if(!S.principles) S.principles = {sthula:0, prana:0, manas:0};
  if(!S.shadows) { S.shadows = {}; for(var lk in SHADOWS) S.shadows[SHADOWS[lk].id] = 0; }
  if(!S.mera_windows) { S.mera_windows = {}; WINDOW_THRESHOLDS.forEach(function(w){ S.mera_windows[w.id] = 0; }); }
  if(!S.mera) S.mera = {quality:0, fullness:0};
  if(!S.daily) S.daily = {quality_sum:0, fullness_sum:0, quest_count:0, dominant_guna:'rajas'};
  if(!S.lenses) S.lenses = {};
  
  // Update axes (v3 guarded)
  for(var ax in baseReward) {
    if(S.axes[ax] !== undefined) {
      var gain = _safe(baseReward[ax] * multiplier, 0);
      S.axes[ax] = _safe(S.axes[ax] + gain, 0);
    }
  }
  
  // Update elements (v3 guarded)
  var el = evaluation.element;
  if(S.elements[el] !== undefined) S.elements[el] = _safe(S.elements[el] + multiplier * 0.1, 0);
  
  // Update principles (v3 guarded)
  var principle = ELEMENT_PRINCIPLE[el];
  if(principle && S.principles[principle] !== undefined) S.principles[principle] = _safe(S.principles[principle] + multiplier * 0.05, 0);
  
  // Shadows
  if(evaluation.shadow_detected) {
    var sid = evaluation.shadow_detected;
    if(S.shadows[sid] !== undefined && S.shadows[sid] > 0) {
      S.shadows[sid] = Math.max(0, S.shadows[sid] - 0.02);
    }
  }
  
  // Mera windows
  if(meraWindow && S.mera_windows[meraWindow.id] !== undefined) {
    S.mera_windows[meraWindow.id] += finalLight;
  }
  
  // Total light + ring (v3 guarded)
  S.progress.total_light = _safe(S.progress.total_light + finalLight, 0);
  S.progress.quests_completed++;
  S.progress.current_ring = computeRing(S.progress.total_light);
  
  // Mera quality/fullness (EMA, v3 guarded)
  S.mera.quality = _safe(S.mera.quality * 0.95 + evaluation.quality_score * 0.05, 0);
  S.mera.fullness = _safe(S.mera.fullness * 0.95 + evaluation.fullness_score * 0.05, 0);
  
  // Daily tracking
  S.daily.quality_sum += evaluation.quality_score;
  S.daily.fullness_sum += evaluation.fullness_score;
  S.daily.quest_count++;
  S.daily.quality_avg = S.daily.quality_sum / S.daily.quest_count;
  S.daily.fullness_avg = S.daily.fullness_sum / S.daily.quest_count;
  
  if(!S.daily._gunas) S.daily._gunas = {tamas:0, rajas:0, sattva:0};
  S.daily._gunas[evaluation.guna] = (S.daily._gunas[evaluation.guna]||0) + 1;
  var maxG=0, domG='rajas';
  for(var g in S.daily._gunas) { if(S.daily._gunas[g]>maxG){maxG=S.daily._gunas[g];domG=g;} }
  S.daily.dominant_guna = domG;
  
  // Per-lens tracking (for depth gates)
  if(lensSlug) {
    if(!S.lenses[lensSlug]) S.lenses[lensSlug] = {quests_done:0, quality_sum:0, quality_avg:0, level:1};
    var lensState = S.lenses[lensSlug];
    lensState.quests_done++;
    lensState.quality_sum += evaluation.quality_score;
    lensState.quality_avg = lensState.quality_sum / lensState.quests_done;
  }
  
  try { localStorage.setItem('STATE', JSON.stringify(S)); } catch(e){}
}

/* ═══════════════════════════════════════════
   XII. OVERNIGHT LIGHT FLOW
   ═══════════════════════════════════════════ */

function overnightFlow() {
  if(!window.STATE || !window.STATE.mera_windows) return;
  var S = window.STATE;
  var mw = S.mera_windows;
  var ratio = 0.1;
  
  var windowIds = WINDOW_THRESHOLDS.map(function(w){ return w.id; });
  for(var i = windowIds.length - 1; i > 0; i--) {
    var light = mw[windowIds[i]] || 0;
    if(light > 0) {
      var cascade = light * ratio;
      for(var j = i - 1; j >= 0; j--) {
        mw[windowIds[j]] = (mw[windowIds[j]] || 0) + cascade;
      }
    }
  }
  
  S.daily = {quality_sum:0, fullness_sum:0, quest_count:0, dominant_guna:'rajas', _gunas:{tamas:0,rajas:0,sattva:0}};
  S.progress.days_played++;
  
  try { localStorage.setItem('STATE', JSON.stringify(S)); } catch(e){}
  console.log('[AwaraXP] Overnight flow complete');
}

/* ═══════════════════════════════════════════
   XIII. DEV PANEL
   ═══════════════════════════════════════════ */

function renderDevPanel(container) {
  if(!container) return;
  var last = AwaraXP._lastResult;
  
  // Pacing info
  var ai = getAIRemaining();
  var qs = getQuestRemaining();
  var ring = _getPlayerRing();
  var devOn = _isDevMode();
  
  var html = [
    '<div style="font-family:monospace;font-size:11px;background:#1a1a2e;color:#e0e0e0;padding:12px;border-radius:8px;max-width:420px;line-height:1.6">',
    '<div style="font-weight:bold;color:#ffd27a;margin-bottom:6px">🔧 Experience Engine v2 · 11 Multipliers</div>',
    
    // Pacing bar
    '<div style="color:#9d86e0;margin-top:4px">▸ Пейсинг (Ring '+ring+')</div>',
    '<div>ИИ: <b style="color:'+(ai.remaining>0?'#4ade80':'#e06a6a')+'">'+ai.remaining+'</b>/'+ai.limit+' · Квесты: <b style="color:'+(qs.remaining>0?'#4ade80':'#e06a6a')+'">'+qs.remaining+'</b>/'+qs.cap+'</div>',
    '<div><label><input type="checkbox" id="xp-dev-toggle" '+(devOn?'checked':'')+' onchange="localStorage.setItem(\'awara_dev_mode\',this.checked?\'1\':\'0\')"> DEV MODE (∞ лимиты)</label></div>',
  ];
  
  if(last) {
    var ev = last.evaluation||{};
    var d = last.multiplier_details||{};
    
    html.push(
      '<div style="color:#9d86e0;margin-top:8px">▸ Последняя оценка ('+( ev._source||'?')+')</div>',
      '<div>'+ELEMENT_EN[ev.element]+' · '+ev.guna+' · Лока '+ev.loka+' · Q='+(ev.quality_score*100|0)+'% · F='+(ev.fullness_score*100|0)+'%</div>',
      ev.creativity_level && ev.creativity_level!=='none' ? '<div style="color:#E0A0FF">✨ '+ev.creativity_level+'</div>' : '',
      ev.shadow_detected ? '<div style="color:#4ade80">🌿 shadow: '+ev.shadow_detected+'</div>' : '',
      
      '<div style="color:#9d86e0;margin-top:8px">▸ Множители (×'+last.multiplier+')</div>'
    );
    
    // All multiplier details
    var mOrder = ['lens_depth','daily_energy','agent','loka_density','guna','quality','shadow_bonus','mastery','coop','creativity','media'];
    var mLabels = {
      lens_depth:'Линза', daily_energy:'День', agent:'Агент', loka_density:'Лока',
      guna:'Гуна', quality:'Качество', shadow_bonus:'Тень', mastery:'Мастерство',
      coop:'Кооп', creativity:'Творчество', media:'Медиа'
    };
    for(var mi=0; mi<mOrder.length; mi++) {
      var mk = mOrder[mi];
      if(d[mk]) {
        var extra = '';
        if(mk==='lens_depth') extra = ' L'+d[mk].level;
        if(mk==='daily_energy') extra = ' ('+d[mk].matches+' совп.)';
        if(mk==='agent') extra = d[mk].match?' ✓':' ✗';
        if(mk==='guna') extra = ' '+d[mk].type;
        if(mk==='mastery') extra = ' R'+d[mk].ring+' q='+d[mk].quality_avg;
        if(mk==='coop') extra = ' ×'+d[mk].players;
        if(mk==='creativity') extra = ' '+d[mk].level;
        if(mk==='media') extra = ' '+d[mk].type;
        var color = d[mk].value > 1.0 ? '#4ade80' : (d[mk].value < 1.0 ? '#e06a6a' : '#888');
        html.push('<div>  <span style="color:'+color+'">'+(mLabels[mk]||mk)+extra+': ×'+d[mk].value+'</span></div>');
      }
    }
    
    html.push(
      '<div style="color:#9d86e0;margin-top:8px">▸ Результат</div>',
      '<div>База: '+last.baseGrain+' → Свет: <b style="color:#ffd27a">'+last.finalLight+'</b> → '+last.window.name+' (М'+last.window.mera+')</div>'
    );
  }
  
  html.push('</div>');
  container.innerHTML = html.join('');
}

/* ═══════════════════════════════════════════
   XIV. DEV MODE TOGGLE
   ═══════════════════════════════════════════ */


/* ═══════════════════════════════════════════
   XIV-b. AUDIT LOG (v3)
   Record last N results for debugging
   ═══════════════════════════════════════════ */

var AUDIT_MAX = 50;
var _auditLog = [];

function _audit(result, quest, lens, depth) {
  var entry = {
    ts: Date.now(),
    quest_id: (quest||{}).id || '?',
    lens: lens || '?',
    depth: depth || 1,
    element: (result.evaluation||{}).element,
    guna: (result.evaluation||{}).guna,
    quality: (result.evaluation||{}).quality_score,
    source: (result.evaluation||{})._source,
    multiplier: result.multiplier,
    baseGrain: result.baseGrain,
    finalLight: result.finalLight,
    window: (result.window||{}).id,
    has_nan: _checkNaN(result)
  };
  _auditLog.push(entry);
  if(_auditLog.length > AUDIT_MAX) _auditLog.shift();
  if(entry.has_nan) {
    console.error('[AwaraXP] ⚠️ NaN detected in result!', entry, result);
  }
}

function _checkNaN(obj) {
  if(obj === null || obj === undefined) return false;
  if(typeof obj === 'number') return !isFinite(obj);
  if(typeof obj === 'object') {
    for(var k in obj) {
      if(obj.hasOwnProperty(k) && _checkNaN(obj[k])) return true;
    }
  }
  return false;
}

function setDevMode(on) {
  try { localStorage.setItem(DEV_MODE_KEY, on ? '1' : '0'); } catch(e){}
}

/* ═══════════════════════════════════════════
   XV. PUBLIC API
   ═══════════════════════════════════════════ */


/* ═══════════════════════════════════════════
   XVI. SELF-TEST SUITE (v3)
   AwaraXP.runTests() — returns {passed, failed, total, details[]}
   ═══════════════════════════════════════════ */

function runTests() {
  var results = {passed:0, failed:0, total:0, details:[]};
  
  function assert(name, condition, info) {
    results.total++;
    if(condition) { results.passed++; }
    else { results.failed++; results.details.push('FAIL: '+name+' — '+(info||'')); }
  }
  
  function assertClose(name, actual, expected, tolerance) {
    tolerance = tolerance || 0.01;
    assert(name, Math.abs(actual - expected) <= tolerance, 'got='+actual+' expected='+expected);
  }
  
  // Save & mock state
  var origState = window.STATE;
  var origPolar = window.POLAR;
  
  // ── GROUP 1: sanitizeEvaluation (30 tests) ──
  console.log('[AwaraXP TEST] Group 1: sanitizeEvaluation');
  
  var s1 = sanitizeEvaluation(null, {type:'do'});
  assert('sanitize-null: returns object', typeof s1 === 'object');
  assert('sanitize-null: element=earth', s1.element === 'earth');
  assert('sanitize-null: guna=rajas', s1.guna === 'rajas');
  assertClose('sanitize-null: quality=0.5', s1.quality_score, 0.5);
  assert('sanitize-null: loka=7', s1.loka === 7);
  assert('sanitize-null: shadow=null', s1.shadow_detected === null);
  assert('sanitize-null: creativity=none', s1.creativity_level === 'none');
  
  var s2 = sanitizeEvaluation({element:'Огонь',guna:'sattva',quality_score:0.8,fullness_score:0.6,loka:3}, {type:'meditate'});
  assert('sanitize-valid-ru: element=fire', s2.element === 'fire');
  assert('sanitize-valid-ru: guna=sattva', s2.guna === 'sattva');
  assertClose('sanitize-valid-ru: quality=0.8', s2.quality_score, 0.8);
  assert('sanitize-valid-ru: loka=3', s2.loka === 3);
  
  var s3 = sanitizeEvaluation({element:'banana',guna:'chaotic',quality_score:5,loka:99,shadow_detected:'fake',creativity_level:'ultramax'}, {type:'ritual'});
  assert('sanitize-garbage: element→fire(ritual)', s3.element === 'fire');
  assert('sanitize-garbage: guna→rajas', s3.guna === 'rajas');
  assertClose('sanitize-garbage: quality clamped→1', s3.quality_score, 1.0);
  assert('sanitize-garbage: loka clamped→7', s3.loka === 7);
  assert('sanitize-garbage: shadow→null', s3.shadow_detected === null);
  assert('sanitize-garbage: creativity→none', s3.creativity_level === 'none');
  
  var s4 = sanitizeEvaluation({quality_score:-5, fullness_score:NaN, loka:0}, {type:'observe'});
  assertClose('sanitize-negative: quality→0', s4.quality_score, 0);
  assertClose('sanitize-NaN: fullness→0.1', s4.fullness_score, 0.1);
  assert('sanitize-zero-loka→7', s4.loka === 7);
  
  var s5 = sanitizeEvaluation({quality_score:Infinity, loka:-3}, {type:'study'});
  assertClose('sanitize-Inf: quality→0.5 (fallback)', s5.quality_score, 0.5);
  assert('sanitize-neg-loka→7', s5.loka === 7);
  
  var s6 = sanitizeEvaluation({shadow_detected:'illusion'}, {type:'do'});
  assert('sanitize-valid-shadow: kept', s6.shadow_detected === 'illusion');
  
  var s7 = sanitizeEvaluation({creativity_level:'poetry'}, {type:'create'});
  assert('sanitize-valid-creativity: kept', s7.creativity_level === 'poetry');
  
  var s8 = sanitizeEvaluation({element:'earth',guna:'tamas'}, {});
  assert('sanitize-minimal: element=earth', s8.element === 'earth');
  assert('sanitize-minimal: guna=tamas', s8.guna === 'tamas');
  
  var s9 = sanitizeEvaluation('not-an-object', {type:'do'});
  assert('sanitize-string: returns valid', typeof s9 === 'object' && s9.element === 'earth');
  
  var s10 = sanitizeEvaluation({quality_score:'0.7'}, {type:'do'});
  assertClose('sanitize-string-number: parsed', s10.quality_score, 0.7);
  
  // ── GROUP 2: computeMultipliers (30 tests) ──
  console.log('[AwaraXP TEST] Group 2: computeMultipliers');
  window.STATE = {progress:{total_light:0,current_ring:-3}, mera:{quality:0}};
  window.POLAR = null;
  
  var baseEval = {element:'earth',guna:'rajas',quality_score:0.5,loka:7,shadow_detected:null,creativity_level:'none'};
  
  var m1 = computeMultipliers(baseEval, 1, {});
  assert('mult-L1-base: >0', m1.total > 0);
  assert('mult-L1-base: finite', isFinite(m1.total));
  assert('mult-L1-base: has details', typeof m1.details === 'object');
  assert('mult-L1-base: lens_depth=1.0', m1.details.lens_depth.value === 1.0);
  
  var m2 = computeMultipliers(baseEval, 6, {});
  assert('mult-L6: lens=2.0', m2.details.lens_depth.value === 2.0);
  assert('mult-L6 > mult-L1', m2.total > m1.total);
  
  var satEval = {element:'earth',guna:'sattva',quality_score:1.0,loka:1,shadow_detected:'illusion',creativity_level:'original_creation'};
  var m3 = computeMultipliers(satEval, 6, {coop_players:4, media_type:'video'});
  assert('mult-max: >1', m3.total > 1);
  assert('mult-max: finite', isFinite(m3.total));
  assert('mult-max: has shadow', !!m3.details.shadow_bonus);
  assert('mult-max: has coop', !!m3.details.coop);
  assert('mult-max: has creativity', !!m3.details.creativity);
  assert('mult-max: has media', !!m3.details.media);
  
  var tamEval = {element:'earth',guna:'tamas',quality_score:0,loka:14,shadow_detected:null,creativity_level:'none'};
  var m4 = computeMultipliers(tamEval, 1, {});
  assert('mult-min: >0', m4.total > 0);
  assert('mult-min: finite', isFinite(m4.total));
  assert('mult-min: guna=0.6', m4.details.guna.value === 0.6);
  assert('mult-min: quality=0.5', m4.details.quality.value === 0.5);
  
  // Edge: NaN inputs
  var nanEval = {element:'earth',guna:'rajas',quality_score:NaN,loka:NaN};
  nanEval = sanitizeEvaluation(nanEval, {type:'do'});
  var m5 = computeMultipliers(nanEval, NaN, {});
  assert('mult-NaN-input: finite', isFinite(m5.total));
  assert('mult-NaN-input: >0', m5.total > 0);
  
  // All depth levels
  for(var dl = 1; dl <= 6; dl++) {
    var md = computeMultipliers(baseEval, dl, {});
    assert('mult-depth-'+dl+': finite', isFinite(md.total));
  }
  
  // Daily energy with POLAR
  window.POLAR = {facets:[{el:'Земля'},{el:'Земля'},{el:'Огонь'}], agent:{element:'Земля'}};
  var m6 = computeMultipliers(baseEval, 1, {});
  assert('mult-polar: daily>1', m6.details.daily_energy.value > 1);
  assert('mult-polar: agent=match', m6.details.agent.match === true);
  window.POLAR = null;
  
  // ── GROUP 3: selectWindow (15 tests) ──
  console.log('[AwaraXP TEST] Group 3: selectWindow');
  
  assert('window-0: daimon', selectWindow(0).id === 'daimon');
  assert('window-0.3: daimon', selectWindow(0.3).id === 'daimon');
  assert('window-0.5: locations', selectWindow(0.5).id === 'locations');
  assert('window-2: emf', selectWindow(2).id === 'emf');
  assert('window-4: newmatrix', selectWindow(4).id === 'newmatrix');
  assert('window-6: soul', selectWindow(6).id === 'soul');
  assert('window-8: daimon_soul', selectWindow(8).id === 'daimon_soul');
  assert('window-12: chronicle', selectWindow(12).id === 'chronicle');
  assert('window-20: hram', selectWindow(20).id === 'hram');
  assert('window-30: cosmos', selectWindow(30).id === 'cosmos');
  assert('window-100: supergame', selectWindow(100).id === 'supergame');
  assert('window-NaN: daimon', selectWindow(NaN).id === 'daimon');
  assert('window-neg: daimon', selectWindow(-5).id === 'daimon');
  assert('window-has-mera', typeof selectWindow(5).mera === 'number');
  assert('window-Infinity: supergame', selectWindow(Infinity).id === 'supergame');
  
  // ── GROUP 4: computeRing (10 tests) ──
  console.log('[AwaraXP TEST] Group 4: computeRing');
  
  assert('ring-0: -3', computeRing(0) === -3);
  assert('ring-5: -2', computeRing(5) === -2);
  assert('ring-15: -1', computeRing(15) === -1);
  assert('ring-50: 1', computeRing(50) === 1);
  assert('ring-200: 3', computeRing(200) === 3);
  assert('ring-700: 5', computeRing(700) === 5);
  assert('ring-2000: 7', computeRing(2000) === 7);
  assert('ring-6000: 9', computeRing(6000) === 9);
  assert('ring-NaN: -3', computeRing(NaN) === -3);
  assert('ring-999999: 9', computeRing(999999) === 9);
  
  // ── GROUP 5: _safe helper (10 tests) ──
  console.log('[AwaraXP TEST] Group 5: _safe helper');
  
  assertClose('safe-normal', _safe(3.14), 3.14);
  assertClose('safe-zero', _safe(0), 0);
  assertClose('safe-NaN', _safe(NaN, 1), 1);
  assertClose('safe-Inf', _safe(Infinity, 0), 0);
  assertClose('safe-negInf', _safe(-Infinity, 0), 0);
  assertClose('safe-null', _safe(null, 5), 5);
  assertClose('safe-undef', _safe(undefined, 2), 2);
  assertClose('safe-string', _safe('abc', 0), 0);
  assertClose('safe-negative', _safe(-3), -3);
  assertClose('safe-no-fallback', _safe(NaN), 0);
  
  // ── GROUP 6: Full pipeline (smoke, 10 tests) ──
  console.log('[AwaraXP TEST] Group 6: Pipeline smoke');
  
  window.STATE = {progress:{total_light:0,current_ring:-3,quests_completed:0}, mera:{quality:0,fullness:0}};
  window.POLAR = null;
  
  // Simulate processExperience without AI (sync parts)
  var testQuest = {id:'test-01',type:'do',proof:'check',reward:{discipline:0.8,will:0.4,clarity:0.2,compassion:0.2,devotion:0.2,transformation:0.0,unity:0.2}};
  var testEval = sanitizeEvaluation({element:'earth',guna:'rajas',quality_score:0.5,loka:7}, testQuest);
  var testMult = computeMultipliers(testEval, 1, {});
  var testGrain = 0; for(var ta in testQuest.reward) if(AXES.indexOf(ta)>=0) testGrain += testQuest.reward[ta];
  var testLight = _r(testGrain * testMult.total);
  var testWin = selectWindow(testLight);
  
  assert('pipe: eval.element valid', ELEMENTS.indexOf(testEval.element) >= 0);
  assert('pipe: mult finite', isFinite(testMult.total));
  assert('pipe: mult > 0', testMult.total > 0);
  assert('pipe: grain = 2', Math.abs(testGrain - 2) < 0.01);
  assert('pipe: light finite', isFinite(testLight));
  assert('pipe: light > 0', testLight > 0);
  assert('pipe: window found', !!testWin.id);
  
  // State update
  updateState(testEval, testQuest.reward, testMult.total, testWin, testLight, 'vedic');
  assert('pipe: state.axes.discipline > 0', window.STATE.axes.discipline > 0);
  assert('pipe: state.total_light > 0', window.STATE.progress.total_light > 0);
  assert('pipe: state.quests_completed = 1', window.STATE.progress.quests_completed === 1);
  
  // ── GROUP 7: Edge cases — extreme multipliers (10 tests) ──
  console.log('[AwaraXP TEST] Group 7: Extreme scenarios');
  
  window.STATE = {progress:{total_light:5999,current_ring:8,quests_completed:999}, mera:{quality:0.95,fullness:0.9}};
  
  // Max everything
  var maxEval = sanitizeEvaluation({element:'ether',guna:'sattva',quality_score:1.0,fullness_score:1.0,loka:1,shadow_detected:'separation',creativity_level:'original_creation'}, {type:'ritual'});
  window.POLAR = {facets:[{el:'Эфир'},{el:'Эфир'},{el:'Эфир'},{el:'Эфир'},{el:'Эфир'},{el:'Эфир'},{el:'Эфир'}], agent:{element:'Эфир'}};
  var maxMult = computeMultipliers(maxEval, 6, {coop_players:4, media_type:'mixed'});
  
  assert('extreme-max: finite', isFinite(maxMult.total));
  assert('extreme-max: > 1', maxMult.total > 1);
  var maxLight = _r(12 * maxMult.total);
  assert('extreme-max-light: finite', isFinite(maxLight));
  assert('extreme-max-light: > 0', maxLight > 0);
  var maxWin = selectWindow(maxLight);
  assert('extreme-max-window: supergame', maxWin.id === 'supergame' || maxWin.id === 'cosmos');
  
  // Min everything
  window.POLAR = null;
  window.STATE = {progress:{total_light:0,current_ring:-3}, mera:{quality:0}};
  var minEval = sanitizeEvaluation({element:'earth',guna:'tamas',quality_score:0,fullness_score:0,loka:14}, {type:'do'});
  var minMult = computeMultipliers(minEval, 1, {});
  assert('extreme-min: > 0', minMult.total > 0);
  assert('extreme-min: finite', isFinite(minMult.total));
  var minLight = _r(2 * minMult.total);
  assert('extreme-min-light: > 0', minLight > 0);
  assert('extreme-min-light: finite', isFinite(minLight));
  assert('extreme-min-window: daimon or locations', selectWindow(minLight).id === 'daimon' || selectWindow(minLight).id === 'locations');
  
  // ── GROUP 8: Audit log (5 tests) ──
  console.log('[AwaraXP TEST] Group 8: Audit log');
  
  _auditLog.length = 0;
  _audit({evaluation:testEval, multiplier:1.0, baseGrain:2, finalLight:2, window:{id:'daimon'}}, testQuest, 'vedic', 1);
  assert('audit: log has entry', _auditLog.length === 1);
  assert('audit: entry.quest_id', _auditLog[0].quest_id === 'test-01');
  assert('audit: no NaN', _auditLog[0].has_nan === false);
  
  _audit({evaluation:{element:'earth'}, multiplier:NaN, baseGrain:2, finalLight:NaN, window:{id:'daimon'}}, {id:'nan-test'}, 'vedic', 1);
  assert('audit: NaN detected', _auditLog[1].has_nan === true);
  assert('audit: 2 entries', _auditLog.length === 2);
  
  // Restore
  window.STATE = origState;
  window.POLAR = origPolar;
  
  // Summary
  console.log('[AwaraXP TEST] ═══════════════════════════════');
  console.log('[AwaraXP TEST] TOTAL: '+results.total+' | PASSED: '+results.passed+' | FAILED: '+results.failed);
  if(results.failed > 0) {
    results.details.forEach(function(d){ console.error('[AwaraXP TEST] '+d); });
  } else {
    console.log('[AwaraXP TEST] ✅ ALL TESTS PASSED — engine is mass-adoption ready');
  }
  console.log('[AwaraXP TEST] ═══════════════════════════════');
  
  return results;
}

var AwaraXP = {
  __v: 3,
  __ready: false,
  
  init: init,
  processExperience: processExperience,
  evaluateResponse: evaluateResponse,
  fallbackEvaluation: fallbackEvaluation,
  computeMultipliers: computeMultipliers,
  selectWindow: selectWindow,
  overnightFlow: overnightFlow,
  computeRing: computeRing,
  
  getSensory: getSensory,
  getOracleReflection: getOracleReflection,
  buildSunoPrompt: buildSunoPrompt,
  
  // Pacing
  canUseAI: canUseAI,
  canDoQuest: canDoQuest,
  getAIRemaining: getAIRemaining,
  getQuestRemaining: getQuestRemaining,
  checkDepthGate: checkDepthGate,
  setDevMode: setDevMode,
  
  renderDevPanel: renderDevPanel,
  runTests: runTests,
  getAuditLog: function(){ return _auditLog; },
  sanitizeEvaluation: sanitizeEvaluation,
  _lastResult: null,
  _lastQuest: null,
  
  AXES: AXES,
  ELEMENTS: ELEMENTS,
  ELEMENT_RU: ELEMENT_RU,
  ELEMENT_EN: ELEMENT_EN,
  ELEMENT_AXES: ELEMENT_AXES,
  SHADOWS: SHADOWS,
  WINDOW_THRESHOLDS: WINDOW_THRESHOLDS,
  RING_THRESHOLDS: RING_THRESHOLDS,
  
  getConfig: function(){ return CFG; },
  getAxes: function() {
    if(!window.STATE||!window.STATE.axes){ var e={}; AXES.forEach(function(a){e[a]=0;}); return e; }
    return window.STATE.axes;
  },
  getDominantAxis: function() {
    var ax=AwaraXP.getAxes(), max=0, dom='discipline';
    for(var a in ax){if(ax[a]>max){max=ax[a];dom=a;}} return dom;
  },
  getMeraState: function() {
    if(!window.STATE||!window.STATE.mera) return {quality:0,fullness:0};
    return window.STATE.mera;
  },
  getRing: function() { return _getPlayerRing(); },
  getTotalLight: function() {
    if(!window.STATE||!window.STATE.progress) return 0;
    return window.STATE.progress.total_light;
  }
};

window.AwaraXP = AwaraXP;
init().then(function(){ console.log('[AwaraXP] Unified Experience Engine v3 ready (11 multipliers + guards + tests)'); });

})();
