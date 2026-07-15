/* ============================================================
   AWARA · PROMPT PANEL v1
   Панель доставки промптов для Suno/Art.
   Показывает сгенерированные промпты с раритетом,
   кнопка копирования в буфер.
   Загружать после: awara-rarity.js, awara-experience-engine.js
   ============================================================ */
(function(){
'use strict';
if(window.__awaraPromptPanel && window.__awaraPromptPanel >= 1) return;
window.__awaraPromptPanel = 1;

/* ═══════════════════════════════════════════
   I. PROMPT STORAGE
   ═══════════════════════════════════════════ */

var STORAGE_KEY = 'awara_prompts_history';
var MAX_PROMPTS = 50;

function getPrompts(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; }
}
function savePrompts(arr){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(-MAX_PROMPTS))); } catch(e){}
}

function addPrompt(prompt){
  var arr = getPrompts();
  prompt.id = Date.now() + '_' + Math.random().toString(36).substr(2,6);
  prompt.ts = new Date().toISOString();
  prompt.copied = false;
  arr.push(prompt);
  savePrompts(arr);
  return prompt;
}

/* ═══════════════════════════════════════════
   II. PROMPT GENERATION
   ═══════════════════════════════════════════ */

var RARITY_STYLES = {
  common:    {label:'Обычный',     color:'#8B7355', bg:'rgba(139,115,85,.12)', border:'rgba(139,115,85,.3)'},
  uncommon:  {label:'Необычный',   color:'#4ade80', bg:'rgba(74,222,128,.08)', border:'rgba(74,222,128,.25)'},
  rare:      {label:'Редкий',      color:'#60a5fa', bg:'rgba(96,165,250,.08)', border:'rgba(96,165,250,.25)'},
  epic:      {label:'Эпический',   color:'#c084fc', bg:'rgba(192,132,252,.1)', border:'rgba(192,132,252,.3)'},
  legendary: {label:'Легендарный', color:'#fbbf24', bg:'rgba(251,191,36,.1)',  border:'rgba(251,191,36,.35)'}
};

function generateArtPrompt(questResult, quest, lens){
  var rarity = 'common';
  var rarityData = null;
  if(window.AwaraRarity){
    rarityData = window.AwaraRarity.getTierByScore();
    rarity = rarityData ? rarityData.id : 'common';
  }
  var ev = questResult ? questResult.evaluation : {};
  var el = ev.element || 'earth';
  var guna = ev.guna || 'rajas';
  var loka = ev.loka || 7;
  var depth = quest ? (quest.level || 1) : 1;
  var tradition = lens || 'vedic';
  
  /* Build art prompt based on rarity */
  var parts = [];
  parts.push('Digital spiritual art');
  
  /* Tradition flavor */
  var TRAD_STYLE = {
    vedic:'Vedic mandala with golden fire, Sanskrit symbols',
    tarot:'Dark mystical tarot card, esoteric symbolism',
    kabbalistic:'Tree of Life geometry, Hebrew letters glowing',
    hermetic:'Alchemical laboratory, Emerald Tablet symbols',
    slavic:'Slavic folk art, red and white embroidery patterns',
    gnostic:'Gnostic light spiral, divine spark ascending',
    daoist:'Chinese ink wash painting, yin-yang harmony',
    chinese:'I-Ching hexagrams, ancient Chinese cosmology',
    egyptian:'Egyptian temple, Eye of Horus, golden hieroglyphs',
    mayan:'Mayan pyramid calendar stone, jungle temple',
    aztec:'Aztec sun stone, feathered serpent, obsidian',
    celtic:'Celtic knotwork, emerald spirals, standing stones',
    norse:'Nordic runes carved in ice, aurora borealis',
    shamanic:'Shamanic journey, spirit animals, drumbeat vision',
    buddhist:'Buddhist lotus mandala, golden Buddha, peaceful',
    sufi:'Sufi whirling dervish, geometric arabesque, rose garden',
    christian_mystical:'Stained glass cathedral, divine light rays',
    atlantean:'Crystal city underwater, bioluminescent, ancient technology',
    shambhala:'Hidden mountain kingdom, pure light, sacred geometry',
    gene_keys:'DNA helix transforming into light, fractal biology',
    astrological:'Zodiac wheel, constellation map, cosmic observatory',
    cosmic:'Deep space nebula, galactic consciousness, star birth',
    shinto:'Japanese torii gate, cherry blossoms, sacred spring',
    sumerian:'Cuneiform tablets, ziggurat, winged beings',
    zoroastrian:'Sacred fire altar, Ahura Mazda wings, persian garden',
    afro_dogon:'African cosmic art, Dogon star map, tribal geometry',
    yoruba:'Yoruba orisha, cowrie shells, thunder and rivers',
    tantric:'Sacred geometry yantra, kundalini serpent, chakra lotus',
    posthuman:'Cybernetic transcendence, neural network mandala, AI awakening',
    technomagical:'Circuit board magic circle, digital sigils, holographic',
    advaita:'Pure white space dissolving into nothing, minimal',
    julian_byzantine:'Byzantine mosaic, gold leaf icons, halos',
    antique_greco_roman:'Greek temple, Orphic lyre, Mediterranean light'
  };
  parts.push(TRAD_STYLE[tradition] || 'mystical spiritual art');
  
  /* Element */
  var ELEMENT_VISUAL = {
    earth:'rich earth tones, mountain, crystals, roots',
    water:'deep ocean blue, flowing water, moonlight reflection',
    fire:'blazing golden flames, phoenix, volcanic energy',
    air:'ethereal mist, feathers, wind spirals, clouds',
    ether:'cosmic violet glow, starfield, transcendent light'
  };
  parts.push(ELEMENT_VISUAL[el] || '');
  
  /* Rarity enrichment */
  if(rarity === 'rare' || rarity === 'epic' || rarity === 'legendary'){
    parts.push('sacred geometry overlay, multiple layers of meaning');
  }
  if(rarity === 'epic' || rarity === 'legendary'){
    parts.push('mythological beings, divine emanation, multi-dimensional');
  }
  if(rarity === 'legendary'){
    parts.push('all traditions unified in one transcendent vision, pure radiance of Ra, beyond duality');
  }
  
  /* Guna mood */
  if(guna === 'sattva') parts.push('harmonious, luminous, peaceful, balanced');
  if(guna === 'tamas') parts.push('dark, mysterious, contemplative, depth');
  
  /* Level */
  if(depth >= 5) parts.push('masterwork quality, extraordinary detail, luminous');
  else if(depth >= 3) parts.push('detailed, rich symbolism');
  
  parts.push('dark background, cinematic lighting, 4K quality');
  
  return {
    type: 'art',
    prompt: parts.filter(Boolean).join(', '),
    rarity: rarity,
    tradition: tradition,
    element: el,
    guna: guna,
    depth: depth
  };
}

function generateSunoPrompt(questResult, quest, lens){
  var rarity = 'common';
  if(window.AwaraRarity){
    var rd = window.AwaraRarity.getTierByScore();
    rarity = rd ? rd.id : 'common';
  }
  var sunoText = '';
  if(window.AwaraXP && window.AwaraXP.buildSunoPrompt){
    var questType = quest ? (quest.type || 'do') : 'do';
    var depth = quest ? (quest.level || 1) : 1;
    sunoText = window.AwaraXP.buildSunoPrompt(questType, depth, lens);
  } else {
    sunoText = 'ambient, meditative, ethereal, spiritual journey';
  }
  
  /* Enrich by rarity */
  if(rarity === 'rare') sunoText += ', layered, evolving, deep resonance';
  if(rarity === 'epic') sunoText += ', orchestral, mythic, transcendent crescendo';
  if(rarity === 'legendary') sunoText += ', masterpiece, otherworldly, divine symphony, all traditions unified';
  
  return {
    type: 'suno',
    prompt: sunoText,
    rarity: rarity,
    tradition: lens || 'vedic'
  };
}

/* ═══════════════════════════════════════════
   III. UI — PROMPT PANEL
   ═══════════════════════════════════════════ */

function renderPanel(container){
  if(!container) return;
  var prompts = getPrompts().reverse();
  
  var html = [];
  html.push('<div style="font-family:\'Cormorant Garamond\',Georgia,serif">');
  
  if(prompts.length === 0){
    html.push('<div style="text-align:center;color:#666;padding:32px 16px;font-size:13px">');
    html.push('Промпты появятся после выполнения квестов.<br>Выполни квест → получи арт и трек дня.');
    html.push('</div>');
  } else {
    for(var i=0; i<Math.min(20, prompts.length); i++){
      var p = prompts[i];
      var rs = RARITY_STYLES[p.rarity] || RARITY_STYLES.common;
      var typeIcon = p.type === 'suno' ? '🎵' : '🎨';
      var typeLabel = p.type === 'suno' ? 'Suno' : 'Art';
      var date = p.ts ? new Date(p.ts).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
      
      html.push('<div style="margin:8px 0;padding:10px 12px;background:'+rs.bg+';border:1px solid '+rs.border+';border-radius:10px">');
      html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">');
      html.push('<div style="display:flex;align-items:center;gap:6px">');
      html.push('<span>'+typeIcon+'</span>');
      html.push('<span style="font-size:12px;font-weight:700;color:'+rs.color+'">'+typeLabel+' · '+rs.label+'</span>');
      html.push('</div>');
      html.push('<span style="font-size:10px;color:#666">'+date+'</span>');
      html.push('</div>');
      html.push('<div style="font-size:11px;color:#ccc;line-height:1.5;word-break:break-word;font-family:\'JetBrains Mono\',monospace;background:rgba(0,0,0,.2);padding:8px;border-radius:6px" id="prompt-text-'+p.id+'">'+_esc(p.prompt)+'</div>');
      html.push('<div style="display:flex;gap:6px;margin-top:6px">');
      html.push('<button onclick="AwaraPromptPanel.copy(\''+p.id+'\')" style="font-size:10px;padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#ccc;cursor:pointer">📋 Копировать</button>');
      if(p.tradition) html.push('<span style="font-size:10px;color:#888;padding:4px 0">'+_esc(p.tradition)+(p.element?' · '+_esc(p.element):'')+'</span>');
      html.push('</div>');
      html.push('</div>');
    }
  }
  
  /* Clear button */
  if(prompts.length > 0){
    html.push('<div style="text-align:center;margin-top:12px">');
    html.push('<button onclick="AwaraPromptPanel.clear();AwaraPromptPanel.show()" style="font-size:10px;padding:4px 12px;border-radius:4px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#888;cursor:pointer">🗑 Очистить историю</button>');
    html.push('</div>');
  }
  
  html.push('</div>');
  container.innerHTML = html.join('');
}

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function copyPrompt(id){
  var el = document.getElementById('prompt-text-'+id);
  if(!el) return;
  var text = el.textContent || el.innerText;
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(function(){
      _toast('📋 Промпт скопирован!');
    });
  } else {
    /* Fallback */
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    _toast('📋 Скопировано');
  }
  /* Mark as copied */
  var arr = getPrompts();
  for(var i=0;i<arr.length;i++){ if(arr[i].id===id) arr[i].copied=true; }
  savePrompts(arr);
}

function _toast(msg){
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#ffd27a;padding:8px 20px;border-radius:20px;font-size:13px;z-index:99999;border:1px solid rgba(255,210,122,.2);animation:sg-fadein .2s ease';
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .3s'; }, 1800);
  setTimeout(function(){ t.remove(); }, 2200);
}

/* ═══════════════════════════════════════════
   IV. SHOW AS MODAL
   ═══════════════════════════════════════════ */

function showPanel(){
  var existing = document.getElementById('pp-overlay');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'pp-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);overflow-y:auto;-webkit-overflow-scrolling:touch;animation:sg-fadein .3s ease';
  overlay.onclick = function(e){ if(e.target===overlay) overlay.remove(); };

  var card = document.createElement('div');
  card.style.cssText = 'max-width:420px;margin:40px auto;background:linear-gradient(145deg,#0d0d1a,#1a1a2e);border-radius:16px;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 60px rgba(0,0,0,.5);overflow:hidden';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.06)';
  hdr.innerHTML = '<div style="font-size:16px;font-weight:700;color:#ffd27a;font-family:Cinzel,serif">🎨 Промпты</div><button onclick="this.closest(\'#pp-overlay\').remove()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:4px">✕</button>';
  card.appendChild(hdr);

  /* Generate fresh prompts buttons */
  var genDiv = document.createElement('div');
  genDiv.style.cssText = 'padding:12px 16px;display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,.04)';
  genDiv.innerHTML = '<button onclick="AwaraPromptPanel.generateAndShow(\'art\')" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(251,191,36,.2);background:rgba(251,191,36,.06);color:#fbbf24;cursor:pointer;font-size:12px;font-family:inherit">🎨 Генерировать Арт</button>' +
    '<button onclick="AwaraPromptPanel.generateAndShow(\'suno\')" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(96,165,250,.2);background:rgba(96,165,250,.06);color:#60a5fa;cursor:pointer;font-size:12px;font-family:inherit">🎵 Генерировать Suno</button>';
  card.appendChild(genDiv);

  var bc = document.createElement('div');
  bc.id = 'pp-container';
  bc.style.cssText = 'padding:8px 16px 16px;max-height:60vh;overflow-y:auto';
  card.appendChild(bc);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  renderPanel(bc);
}

function generateAndShow(type){
  var lastResult = window.AwaraXP ? window.AwaraXP._lastResult : null;
  var lastQuest = window.AwaraXP ? window.AwaraXP._lastQuest : null;
  var quest = lastQuest ? lastQuest.quest : null;
  var lens = lastQuest ? lastQuest.lens : 'vedic';

  var prompt;
  if(type === 'suno'){
    prompt = generateSunoPrompt(lastResult, quest, lens);
  } else {
    prompt = generateArtPrompt(lastResult, quest, lens);
  }
  addPrompt(prompt);
  
  /* Refresh panel */
  var c = document.getElementById('pp-container');
  if(c) renderPanel(c);
  _toast((type==='suno'?'🎵':'🎨')+' Промпт сгенерирован!');
}

/* ═══════════════════════════════════════════
   V. HOOK INTO QUEST COMPLETION
   ═══════════════════════════════════════════ */

window.addEventListener('awara-xp', function(e){
  /* Auto-generate prompts after quest */
  var detail = e.detail;
  if(!detail || detail.error) return;
  var lastQuest = window.AwaraXP ? window.AwaraXP._lastQuest : null;
  var quest = lastQuest ? lastQuest.quest : null;
  var lens = lastQuest ? lastQuest.lens : 'vedic';
  
  var artPrompt = generateArtPrompt(detail, quest, lens);
  var sunoPrompt = generateSunoPrompt(detail, quest, lens);
  addPrompt(artPrompt);
  addPrompt(sunoPrompt);
});

/* ═══════════════════════════════════════════
   VI. PUBLIC API
   ═══════════════════════════════════════════ */

window.AwaraPromptPanel = {
  show: showPanel,
  render: renderPanel,
  generateArt: generateArtPrompt,
  generateSuno: generateSunoPrompt,
  generateAndShow: generateAndShow,
  copy: copyPrompt,
  getHistory: getPrompts,
  clear: function(){ localStorage.removeItem(STORAGE_KEY); }
};

console.log('[AwaraPromptPanel] Prompt Panel v1 ready');
})();
