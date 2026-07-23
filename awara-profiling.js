/* ═══════════════════════════════════════════════════════════════════
   AWARA — Экран Профилирования v2 (Игровой Онбординг)
   Выбирай сколько хочешь — твой профиль растёт в реальном времени.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── Data: 9 сфер × 46 путей ─── */
const CATS = [
  { id:'body', name:'Тело', icon:'💪', axis:'discipline', loka:'Бхур-лока',
    branches:[
      {id:'body.yoga',     name:'Йога',               lenses:['vedic','tantric_kashmiri']},
      {id:'body.martial',  name:'Боевые искусства',   lenses:['chinese_iching','shamanic']},
      {id:'body.breath',   name:'Дыхание',            lenses:['vedic','daoist']},
      {id:'body.food',     name:'Питание',             lenses:['vedic','slavic']},
      {id:'body.dance',    name:'Танец',               lenses:['shamanic','afro_dogon']},
      {id:'body.sport',    name:'Выносливость',        lenses:['norse','slavic']}
    ]},
  { id:'emotion', name:'Сердце', icon:'💗', axis:'compassion', loka:'Бхувар-лока',
    branches:[
      {id:'emotion.empathy',  name:'Сострадание',       lenses:['buddhist_mahayana','christian_mystical_grail']},
      {id:'emotion.family',   name:'Семья / Род',       lenses:['slavic','celtic']},
      {id:'emotion.trauma',   name:'Исцеление',         lenses:['gnostic','shamanic']},
      {id:'emotion.love',     name:'Любовь',            lenses:['islamic_sufi_nur','tantric_kashmiri']},
      {id:'emotion.ancestors',name:'Предки',            lenses:['slavic','yoruba_ifa_orisha']}
    ]},
  { id:'power', name:'Воля', icon:'🔥', axis:'will', loka:'Свар-лока',
    branches:[
      {id:'power.leadership', name:'Лидерство',         lenses:['norse','zoroastrian']},
      {id:'power.business',   name:'Созидание',         lenses:['hermetic_alchemical','gene_keys']},
      {id:'power.discipline', name:'Аскеза',            lenses:['vedic','advaita_siddha']},
      {id:'power.strategy',   name:'Стратегия',         lenses:['chinese_iching','sumerian_babylonian']},
      {id:'power.create',     name:'Творчество',        lenses:['celtic','technomagical']}
    ]},
  { id:'heart', name:'Служение', icon:'💚', axis:'devotion', loka:'Махар-лока',
    branches:[
      {id:'heart.service',  name:'Волонтёрство',       lenses:['christian_mystical_grail','buddhist_mahayana']},
      {id:'heart.nature',   name:'Природа',            lenses:['celtic','shinto']},
      {id:'heart.music',    name:'Музыка',             lenses:['islamic_sufi_nur','vedic']},
      {id:'heart.poetry',   name:'Слово / Поэзия',    lenses:['islamic_sufi_nur','antique_greco_roman']},
      {id:'heart.animals',  name:'Тотемы',             lenses:['shamanic','egyptian']}
    ]},
  { id:'knowledge', name:'Мудрость', icon:'📖', axis:'clarity', loka:'Джана-лока',
    branches:[
      {id:'know.philosophy', name:'Философия',          lenses:['antique_greco_roman','advaita_siddha']},
      {id:'know.mythology',  name:'Мифы / Архетипы',    lenses:['norse','egyptian']},
      {id:'know.science',    name:'Наука / Космос',     lenses:['cosmic_galactic','posthuman_ai_sophianic']},
      {id:'know.symbols',    name:'Символы',            lenses:['kabbalistic','sumerian_babylonian']},
      {id:'know.astrology',  name:'Астрология',         lenses:['astrological','mayan']},
      {id:'know.tarot',      name:'Таро / Оракулы',     lenses:['tarot_arcanic','hermetic_alchemical']}
    ]},
  { id:'vision', name:'Видение', icon:'👁', axis:'transformation', loka:'Тапа-лока',
    branches:[
      {id:'vis.meditation', name:'Медитация',           lenses:['buddhist_mahayana','vedic']},
      {id:'vis.dreams',     name:'Сновидения',          lenses:['shamanic','gnostic']},
      {id:'vis.psychic',    name:'Тонкое восприятие',   lenses:['shambhala','atlantean_lemurian']},
      {id:'vis.alchemy',    name:'Алхимия',             lenses:['hermetic_alchemical','egyptian']},
      {id:'vis.art',        name:'Визионерство',        lenses:['aztec_mexica','celtic']}
    ]},
  { id:'unity', name:'Запредельное', icon:'✨', axis:'unity', loka:'Сатья-лока',
    branches:[
      {id:'uni.nondual',  name:'Недвойственность',     lenses:['advaita_siddha','daoist']},
      {id:'uni.mysticism',name:'Мистицизм',            lenses:['gnostic','kabbalistic']},
      {id:'uni.cosmic',   name:'Космос сознания',      lenses:['cosmic_galactic','shambhala']},
      {id:'uni.silence',  name:'Тишина',               lenses:['buddhist_mahayana','shinto']},
      {id:'uni.death',    name:'Перерождение',          lenses:['egyptian','julian_byzantine']}
    ]},
  { id:'shadow', name:'Тень', icon:'🌑', axis:'transformation', loka:'Атала—Патала',
    branches:[
      {id:'shd.jung',    name:'Тень Юнга',             lenses:['gnostic','tarot_arcanic']},
      {id:'shd.power',   name:'Власть',                lenses:['sumerian_babylonian','norse']},
      {id:'shd.addiction',name:'Привязанности',        lenses:['daoist','shamanic']},
      {id:'shd.anger',   name:'Гнев',                  lenses:['zoroastrian','aztec_mexica']},
      {id:'shd.fear',    name:'Страх',                  lenses:['slavic','yoruba_ifa_orisha']}
    ]},
  { id:'future', name:'Будущее', icon:'🚀', axis:'clarity', loka:'Транс-лок.',
    branches:[
      {id:'fut.ai',       name:'ИИ и Сознание',        lenses:['posthuman_ai_sophianic','technomagical']},
      {id:'fut.bio',      name:'Биохакинг',            lenses:['gene_keys','technomagical']},
      {id:'fut.vr',       name:'Метавселенные',         lenses:['technomagical','atlantean_lemurian']},
      {id:'fut.evolution', name:'Эволюция',             lenses:['cosmic_galactic','posthuman_ai_sophianic']}
    ]}
];

/* ─── Rank titles ─── */
const RANKS = [
  { min:0,  title:'Спящий',       glow:'rgba(142,136,164,.3)' },
  { min:1,  title:'Пробуждённый', glow:'rgba(123,98,201,.4)' },
  { min:3,  title:'Искатель',     glow:'rgba(123,98,201,.6)' },
  { min:6,  title:'Путник',       glow:'rgba(170,140,76,.5)' },
  { min:10, title:'Странник',     glow:'rgba(201,168,76,.6)' },
  { min:15, title:'Видящий',      glow:'rgba(201,168,76,.7)' },
  { min:20, title:'Мудрец',       glow:'rgba(255,210,122,.6)' },
  { min:30, title:'Мастер Путей', glow:'rgba(255,210,122,.8)' },
];

const AXIS_NAMES = {
  discipline:'Дисциплина', compassion:'Сострадание', will:'Воля',
  devotion:'Преданность', clarity:'Ясность', transformation:'Трансформация', unity:'Единство'
};

let selected = new Set();
let expandedCat = null;

function getRank(n){
  let r = RANKS[0];
  for(const rk of RANKS){ if(n >= rk.min) r = rk; }
  return r;
}

/* ─── CSS ─── */
function injectCSS(){
  if(document.getElementById('profCSS')) return;
  const s = document.createElement('style');
  s.id = 'profCSS';
  s.textContent = `
#profilingOverlay{
  position:fixed;inset:0;z-index:100010;background:#05050d;
  display:flex;flex-direction:column;opacity:0;
  transition:opacity .7s ease;overflow:hidden;
}
#profilingOverlay.visible{opacity:1}
#profilingOverlay.hiding{opacity:0;pointer-events:none}

/* ── Cosmos background ── */
.prof-cosmos{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.prof-neb{position:absolute;border-radius:50%;filter:blur(50px);opacity:.55;mix-blend-mode:screen;animation:profDrift 26s ease-in-out infinite}
.prof-neb.a{width:340px;height:340px;top:-90px;left:-70px;background:radial-gradient(circle,#5b3ea8,transparent 70%)}
.prof-neb.b{width:300px;height:300px;bottom:40px;right:-90px;background:radial-gradient(circle,#8a6a2e,transparent 70%);animation-delay:-8s}
.prof-neb.c{width:260px;height:260px;top:40%;left:30%;background:radial-gradient(circle,#3a2f73,transparent 70%);animation-delay:-15s}
@keyframes profDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-24px) scale(1.12)}}
canvas#profStars{position:absolute;inset:0;width:100%;height:100%}
.prof-scanline{position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 3px,rgba(255,255,255,.012) 3px 4px);pointer-events:none}

/* ── Scroll ── */
.prof-scroll{position:relative;z-index:2;flex:1;overflow-y:auto;overflow-x:hidden;padding:0 18px 140px;-webkit-overflow-scrolling:touch;max-width:520px;margin:0 auto}
.prof-scroll::-webkit-scrollbar{width:0}

/* ── Header ── */
.prof-hdr{text-align:center;padding:40px 10px 0;position:relative}
.prof-hdr h1{font-family:'Cinzel',serif;font-size:22px;font-weight:400;color:#fff;
  letter-spacing:.04em;margin:0;text-shadow:0 0 40px rgba(201,168,76,.15)}
.prof-hdr .prof-sub{font-family:'Cormorant Garamond',serif;font-size:15px;
  color:#8e88a4;margin:6px 0 0;line-height:1.4}

/* ── Live Profile Panel ── */
.prof-live{
  margin:18px auto 0;padding:14px 18px;max-width:340px;
  border:1px solid rgba(201,168,76,.12);border-radius:18px;
  background:linear-gradient(160deg,rgba(201,168,76,.04),rgba(123,98,201,.03));
  transition:all .5s ease;position:relative;overflow:hidden;
}
.prof-live::before{content:'';position:absolute;inset:-2px;border-radius:20px;
  background:conic-gradient(from 0deg,transparent,rgba(201,168,76,.15),transparent,
  rgba(123,98,201,.1),transparent);opacity:0;transition:opacity .5s;pointer-events:none}
.prof-live.active::before{opacity:1;animation:profSpin 8s linear infinite}
@keyframes profSpin{to{transform:rotate(360deg)}}

.prof-rank-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.prof-orb{width:38px;height:38px;border-radius:50%;flex:0 0 38px;
  background:radial-gradient(circle at 40% 35%,rgba(123,98,201,.5),rgba(28,22,52,.9));
  box-shadow:0 0 20px rgba(123,98,201,.2);display:flex;align-items:center;justify-content:center;
  font-family:'Cinzel',serif;font-size:16px;color:var(--spark,#ffd27a);
  transition:all .4s ease}
.prof-rank-title{font-family:'Cinzel',serif;font-size:16px;color:#fff;letter-spacing:.03em}
.prof-rank-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8e88a4;
  letter-spacing:.1em;text-transform:uppercase}

/* Axes bars */
.prof-axes{display:flex;flex-direction:column;gap:5px}
.prof-ax{display:flex;align-items:center;gap:8px}
.prof-ax-name{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.06em;
  color:#8e88a4;text-transform:uppercase;width:90px;text-align:right;flex:0 0 90px}
.prof-ax-bar{flex:1;height:5px;border-radius:5px;background:rgba(255,255,255,.06);overflow:hidden}
.prof-ax-fill{height:100%;border-radius:5px;transition:width .5s cubic-bezier(.22,.68,.36,1);
  min-width:0}
.prof-ax-val{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gold,#c9a84c);
  width:20px;flex:0 0 20px}

/* Lenses line */
.prof-lenses-row{margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;min-height:18px}
.prof-lens-tag{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.04em;
  padding:2px 7px;border-radius:8px;border:1px solid rgba(123,98,201,.25);
  color:rgba(157,134,224,.8);background:rgba(123,98,201,.06);
  animation:tagIn .3s ease both}
@keyframes tagIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}

/* ── Category Grid ── */
.prof-cats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:16px}

/* ── Category Card ── */
.prof-cat{
  border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:14px 8px;
  background:rgba(255,255,255,.015);cursor:pointer;text-align:center;
  transition:all .35s cubic-bezier(.22,.68,.36,1);position:relative;overflow:hidden;
  -webkit-tap-highlight-color:transparent;
}
.prof-cat:active{transform:scale(.95)}
.prof-cat .ci{font-size:26px;display:block;margin-bottom:4px;transition:transform .3s ease}
.prof-cat .cn{font-family:'Cinzel',serif;font-size:11px;color:#fff;line-height:1.2;letter-spacing:.02em}

/* Category glow states */
.prof-cat.s1{border-color:rgba(123,98,201,.25);background:rgba(123,98,201,.04)}
.prof-cat.s1 .ci{transform:scale(1.05)}
.prof-cat.s2{border-color:rgba(170,140,76,.3);background:linear-gradient(160deg,rgba(201,168,76,.06),rgba(123,98,201,.04))}
.prof-cat.s2 .ci{transform:scale(1.1)}
.prof-cat.s3{border-color:rgba(201,168,76,.4);background:linear-gradient(160deg,rgba(201,168,76,.1),rgba(123,98,201,.06));
  box-shadow:0 0 16px rgba(201,168,76,.1)}
.prof-cat.s3 .ci{transform:scale(1.15)}
.prof-cat.smax{border-color:rgba(255,210,122,.5);background:linear-gradient(160deg,rgba(255,210,122,.12),rgba(201,168,76,.08));
  box-shadow:0 0 24px rgba(201,168,76,.2)}
.prof-cat.smax .ci{transform:scale(1.2);filter:drop-shadow(0 0 6px rgba(255,210,122,.5))}

/* Badge */
.prof-cat .cb{position:absolute;top:5px;right:6px;min-width:16px;height:16px;border-radius:10px;
  padding:0 4px;background:linear-gradient(135deg,var(--gold,#c9a84c),var(--spark,#ffd27a));
  color:#0a0a14;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  opacity:0;transform:scale(0);transition:all .3s cubic-bezier(.34,1.56,.64,1)}
.prof-cat.s1 .cb,.prof-cat.s2 .cb,.prof-cat.s3 .cb,.prof-cat.smax .cb{opacity:1;transform:scale(1)}

/* ── Expand Panel ── */
.prof-exp{grid-column:1/-1;overflow:hidden;max-height:0;opacity:0;display:none;
  transition:max-height .45s cubic-bezier(.22,.68,.36,1),opacity .35s ease,margin .35s ease;margin:0}
.prof-exp.open{display:block;max-height:800px;opacity:1;margin:2px 0 6px}
.prof-exp-in{padding:4px 0;display:flex;flex-wrap:wrap;gap:8px}

/* ── Branch Chip ── */
.prof-br{
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 14px;border:1px solid rgba(255,255,255,.07);border-radius:24px;
  background:rgba(255,255,255,.02);cursor:pointer;
  transition:all .25s cubic-bezier(.22,.68,.36,1);
  -webkit-tap-highlight-color:transparent;
}
.prof-br:active{transform:scale(.95)}
.prof-br .bn{font-family:'Cormorant Garamond',serif;font-size:15px;color:#ece9f5;white-space:nowrap}
.prof-br .bk{width:8px;height:8px;border-radius:50%;border:1.5px solid rgba(157,134,224,.4);
  flex:0 0 8px;transition:all .2s cubic-bezier(.34,1.56,.64,1)}
.prof-br.sel{border-color:rgba(201,168,76,.4);
  background:linear-gradient(150deg,rgba(201,168,76,.12),rgba(123,98,201,.06));
  box-shadow:0 4px 12px rgba(201,168,76,.1)}
.prof-br.sel .bk{background:var(--spark,#ffd27a);border-color:var(--gold,#c9a84c);
  box-shadow:0 0 6px rgba(255,210,122,.5);transform:scale(1.3)}
.prof-br.sel .bn{color:#fff}

/* ── Confirm ── */
.prof-cfm-wrap{position:fixed;bottom:0;left:0;right:0;padding:14px 22px 26px;z-index:100011;
  background:linear-gradient(to top,#05050d 55%,transparent);
  transform:translateY(100%);transition:transform .4s cubic-bezier(.22,.68,.36,1)}
.prof-cfm-wrap.show{transform:translateY(0)}
.prof-cfm{width:100%;padding:15px;border:none;border-radius:16px;cursor:pointer;
  font-family:'Cinzel',serif;font-size:14px;letter-spacing:.12em;text-transform:uppercase;
  color:#0a0a14;background:linear-gradient(120deg,var(--gold,#c9a84c),var(--spark,#ffd27a));
  box-shadow:0 8px 34px rgba(201,168,76,.35);transition:all .25s ease}
.prof-cfm:active{transform:scale(.97)}


/* Reset button */
.prof-reset{
  margin-top:10px;padding:7px 18px;border:1px solid rgba(142,136,164,.25);border-radius:20px;
  background:rgba(255,255,255,.03);color:#8e88a4;cursor:pointer;
  font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;
  text-transform:uppercase;transition:all .25s ease;
  -webkit-tap-highlight-color:transparent;
}
.prof-reset:hover,.prof-reset:active{border-color:rgba(201,168,76,.3);color:var(--gold,#c9a84c)}

/* ── Responsive ── */
@media(max-width:360px){.prof-cats{grid-template-columns:1fr 1fr;gap:8px}.prof-hdr h1{font-size:20px}}

/* ── Pulse on rank change ── */
@keyframes rankPulse{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
.prof-orb.pulse{animation:rankPulse .5s ease}
  `;
  document.head.appendChild(s);
}

/* ─── Build DOM ─── */
function buildOverlay(){
  const ov = document.createElement('div');
  ov.id = 'profilingOverlay';

  const axisKeys = ['discipline','compassion','will','devotion','clarity','transformation','unity'];
  const axColors = ['#c9a84c','#e08686','#ff7a3d','#7bc98a','#86b4e0','#c986e0','#ffd27a'];

  let html = `<div class="prof-cosmos"><div class="prof-neb a"></div><div class="prof-neb b"></div><div class="prof-neb c"></div><canvas id="profStars"></canvas><div class="prof-scanline"></div></div>
  <div class="prof-scroll">
    <div class="prof-hdr">
      <h1>Карта Путей</h1>
      <p class="prof-sub">Открывай сферы — выбирай всё, что резонирует</p>
      <button class="prof-reset" id="profResetBtn" style="display:none">⟳ Сбросить</button>
    </div>

    <div class="prof-live" id="profLive">
      <div class="prof-rank-row">
        <div class="prof-orb" id="profOrb">0</div>
        <div>
          <div class="prof-rank-title" id="profRankTitle">Спящий</div>
          <div class="prof-rank-sub" id="profRankSub">выбери хотя бы 1 путь</div>
        </div>
      </div>
      <div class="prof-axes" id="profAxes">`;

  axisKeys.forEach((ax, i) => {
    html += `
        <div class="prof-ax">
          <span class="prof-ax-name">${AXIS_NAMES[ax]}</span>
          <div class="prof-ax-bar"><div class="prof-ax-fill" id="axFill_${ax}" style="width:0;background:${axColors[i]}"></div></div>
          <span class="prof-ax-val" id="axVal_${ax}">0</span>
        </div>`;
  });

  html += `
      </div>
      <div class="prof-lenses-row" id="profLensesRow"></div>
    </div>

    <div class="prof-cats" id="profCats">`;

  CATS.forEach(cat => {
    html += `
      <div class="prof-cat" data-cat="${cat.id}" id="pc_${cat.id}">
        <div class="cb" id="pcb_${cat.id}">0</div>
        <span class="ci">${cat.icon}</span>
        <div class="cn">${cat.name}</div>
      </div>
      <div class="prof-exp" id="pe_${cat.id}"><div class="prof-exp-in">`;
    cat.branches.forEach(br => {
      html += `<div class="prof-br" data-branch="${br.id}"><div class="bk"></div><span class="bn">${br.name}</span></div>`;
    });
    html += `</div></div>`;
  });

  html += `</div></div>
    <div class="prof-cfm-wrap" id="profCfmWrap">
      <button class="prof-cfm" id="profCfmBtn">Начать путь</button>
    </div>`;

  ov.innerHTML = html;
  document.body.appendChild(ov);
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('visible')));
  bindEvents();
  profStarfield();
}

/* ─── Cosmos starfield (mirrors tigel-app.html's own #stars canvas) ─── */
function profStarfield(){
  const c = document.getElementById('profStars');
  if(!c) return;
  const ctx = c.getContext('2d');
  function size(){ c.width = c.offsetWidth; c.height = c.offsetHeight; }
  size();
  const stars = Array.from({length:70}, () => ({
    x:Math.random(), y:Math.random(), r:Math.random()*1.3+.2,
    t:Math.random()*6.28, s:Math.random()*.02+.005
  }));
  function loop(){
    if(!document.body.contains(c)) return;
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(st => {
      st.t += st.s;
      const a = .35 + .55*Math.abs(Math.sin(st.t));
      ctx.beginPath();
      ctx.arc(st.x*c.width, st.y*c.height, st.r, 0, 6.28);
      ctx.fillStyle = 'rgba(255,240,210,'+a+')';
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
  window.addEventListener('resize', size);
}

/* ─── Events ─── */
function bindEvents(){
  document.querySelectorAll('.prof-cat').forEach(el => {
    el.addEventListener('click', () => toggleExpand(el.dataset.cat));
  });
  document.querySelectorAll('.prof-br').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      toggleBranch(el.dataset.branch, el);
    });
  });
  document.getElementById('profCfmBtn').addEventListener('click', confirmProfile);
  document.getElementById('profResetBtn').addEventListener('click', function(){
    selected.clear();
    document.querySelectorAll('.prof-br.sel').forEach(el => el.classList.remove('sel'));
    updateUI();
  });
}

function toggleExpand(catId){
  const was = expandedCat;
  if(was){
    const old = document.getElementById('pe_' + was);
    if(old){
      old.classList.remove('open');
      setTimeout(() => { old.style.display = 'none'; }, 450);
    }
  }
  if(catId !== was){
    expandedCat = catId;
    const panel = document.getElementById('pe_' + catId);
    if(panel){
      panel.style.display = 'block';
      void panel.offsetHeight; // force reflow so max-height transition animates
      panel.classList.add('open');
      setTimeout(() => {
        const ce = document.getElementById('pc_' + catId);
        if(ce) ce.scrollIntoView({behavior:'smooth', block:'nearest'});
      }, 120);
    }
  } else { expandedCat = null; }
}

function toggleBranch(brId, el){
  if(selected.has(brId)){ selected.delete(brId); el.classList.remove('sel'); }
  else { selected.add(brId); el.classList.add('sel'); }
  updateUI();
}

/* ─── Update all live elements ─── */
function updateUI(){
  const n = selected.size;

  // ── Rank ──
  const rank = getRank(n);
  const orb = document.getElementById('profOrb');
  const prevN = parseInt(orb.textContent);
  orb.textContent = n;
  orb.style.boxShadow = '0 0 24px ' + rank.glow;
  document.getElementById('profRankTitle').textContent = rank.title;
  document.getElementById('profRankSub').textContent =
    n === 0 ? 'выбери хотя бы 1 путь' :
    n < 3 ? (3-n) + ' ещё до Искателя' :
    n + ' ' + (n<5?'пути':'путей') + ' открыто';
  if(n > prevN && getRank(prevN).title !== rank.title){
    orb.classList.remove('pulse'); void orb.offsetWidth; orb.classList.add('pulse');
  }

  const live = document.getElementById('profLive');
  live.classList.toggle('active', n >= 3);

  // ── Per-category ──
  const axisW = {};
  const lensW = {};
  CATS.forEach(cat => {
    const ce = document.getElementById('pc_' + cat.id);
    const be = document.getElementById('pcb_' + cat.id);
    const cnt = cat.branches.filter(b => selected.has(b.id)).length;
    const total = cat.branches.length;
    be.textContent = cnt;
    ce.className = 'prof-cat' + (
      cnt === 0 ? '' :
      cnt === 1 ? ' s1' :
      cnt <= 3 ? ' s2' :
      cnt < total ? ' s3' : ' smax'
    );
    // Axes + lenses
    cat.branches.forEach(br => {
      if(!selected.has(br.id)) return;
      axisW[cat.axis] = (axisW[cat.axis]||0) + 1;
      br.lenses.forEach(l => { lensW[l] = (lensW[l]||0) + 1; });
    });
  });

  // ── Axes bars ──
  const maxAx = Math.max(1, ...Object.values(axisW));
  for(const ax of Object.keys(AXIS_NAMES)){
    const v = axisW[ax]||0;
    document.getElementById('axFill_'+ax).style.width = (v/maxAx*100)+'%';
    document.getElementById('axVal_'+ax).textContent = v;
  }

  // ── Top lenses ──
  const sorted = Object.entries(lensW).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const row = document.getElementById('profLensesRow');
  row.innerHTML = sorted.map(([l,c]) =>
    `<span class="prof-lens-tag">${l.replace(/_/g,' ')} ×${c}</span>`
  ).join('');

  // ── Confirm ──
  document.getElementById('profCfmWrap').classList.toggle('show', n >= 1);
  var rb = document.getElementById('profResetBtn'); if(rb) rb.style.display = n > 0 ? 'inline-block' : 'none';
}

/* ─── Build Profile ─── */
function confirmProfile(){
  const selBranches = [];
  CATS.forEach(cat => {
    cat.branches.forEach(br => {
      if(selected.has(br.id)){
        selBranches.push({id:br.id, name:br.name, lenses:br.lenses, category:cat.id, axis:cat.axis});
      }
    });
  });
  const lensCount = {};
  selBranches.forEach(b => b.lenses.forEach(l => { lensCount[l]=(lensCount[l]||0)+1; }));
  const axisCount = {};
  selBranches.forEach(b => { axisCount[b.axis]=(axisCount[b.axis]||0)+1; });

  const startLenses = Object.entries(lensCount).sort((a,b)=>b[1]-a[1])
    .slice(0, Math.min(8, Object.keys(lensCount).length)).map(e=>e[0]);
  const dominantAxes = Object.entries(axisCount).sort((a,b)=>b[1]-a[1])
    .slice(0,3).map(e=>e[0]);
  const rank = getRank(selected.size);

  const profile = {
    branches_selected: selBranches.map(b=>b.id),
    selection_count: selected.size,
    rank: rank.title,
    start_lenses: startLenses,
    dominant_axes: dominantAxes,
    lens_weights: lensCount,
    axis_weights: axisCount,
    timestamp: Date.now()
  };

  try{ localStorage.setItem('awara_player_profile', JSON.stringify(profile)); }catch(e){}
  window.AwaraProfile = profile;

  // ── Sync into main game state (awara_v258_state) ──
  try{
    var SKEY = 'awara_v258_state';
    var raw = localStorage.getItem(SKEY);
    var gs = raw ? JSON.parse(raw) : {};
    // Merge profile data
    gs.profileBranches = profile.branches_selected;
    gs.profileRank = profile.rank;
    gs.activeSystem = profile.start_lenses[0] || gs.activeSystem || 'vedic';
    if(!gs.lenses) gs.lenses = {};
    profile.start_lenses.forEach(function(l){ if(!gs.lenses[l]) gs.lenses[l] = {level:1}; });
    // Merge into soul layer if it exists
    if(gs.soul){
      gs.soul.active_matrices = profile.start_lenses;
    }
    localStorage.setItem(SKEY, JSON.stringify(gs));
    console.log('[AWARA Profiling] Synced to', SKEY);
  }catch(e){ console.warn('[AWARA Profiling] State sync failed:', e); }

  // ── Sync into window.STATE (experience engine) ──
  try{
    if(window.STATE){
      if(!window.STATE.profile) window.STATE.profile = {};
      window.STATE.profile.branches_selected = profile.branches_selected;
      window.STATE.profile.start_lenses = profile.start_lenses;
      window.STATE.profile.dominant_axes = profile.dominant_axes;
      window.STATE.profile.rank = profile.rank;
      try{ localStorage.setItem('STATE', JSON.stringify(window.STATE)); }catch(e2){}
    }
  }catch(e){}

  window.dispatchEvent(new CustomEvent('awara:profile-ready', {detail:profile}));
  console.log('[AWARA Profiling] Profile:', profile);
  closeOverlay();
}

function closeOverlay(){
  const ov = document.getElementById('profilingOverlay');
  if(!ov) return;
  ov.classList.add('hiding');
  setTimeout(() => ov.remove(), 700);
}

/* ─── Init ─── */
function init(){
  try{
    const existing = localStorage.getItem('awara_player_profile');
    if(existing){
      window.AwaraProfile = JSON.parse(existing);
      console.log('[AWARA Profiling] Loaded:', window.AwaraProfile.start_lenses);
      // Ensure window.STATE has profile on boot
      setTimeout(function(){
        try{
          if(window.STATE){
            if(!window.STATE.profile) window.STATE.profile = {};
            window.STATE.profile.branches_selected = window.AwaraProfile.branches_selected;
            window.STATE.profile.start_lenses = window.AwaraProfile.start_lenses;
            window.STATE.profile.dominant_axes = window.AwaraProfile.dominant_axes;
            window.STATE.profile.rank = window.AwaraProfile.rank;
          }
        }catch(e){}
      }, 1500);
      return;
    }
  }catch(e){}
  injectCSS(); buildOverlay();
}

window.AwaraProfiling = {
  show(fresh){
    expandedCat=null;
    const x=document.getElementById('profilingOverlay'); if(x)x.remove();
    injectCSS(); buildOverlay();
    // Restore previously saved selections (unless fresh=true means hard reset)
    if(fresh){
      selected.clear();
      try{localStorage.removeItem('awara_player_profile')}catch(e){}
    } else {
      try{
        var saved = JSON.parse(localStorage.getItem('awara_player_profile') || 'null');
        if(saved && saved.branches_selected && saved.branches_selected.length > 0){
          selected.clear();
          saved.branches_selected.forEach(function(b){ selected.add(b); });
          document.querySelectorAll('.prof-br').forEach(function(el){
            var bid = el.getAttribute('data-bid');
            if(selected.has(bid)) el.classList.add('sel');
            else el.classList.remove('sel');
          });
        }
      }catch(e){}
    }
    updateUI();
  },
  reset(){ this.show(true); },
  getProfile(){ try{return JSON.parse(localStorage.getItem('awara_player_profile'))}catch(e){return null} }
};

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else setTimeout(init, 800);



/* ─── Floating re-open button (right side, under матрицы + подсказки) ─── */
function addReopenButton(){
  if(document.getElementById('profReopenBtn')) return;
  var btn = document.createElement('button');
  btn.id = 'profReopenBtn';
  btn.innerHTML = '🧭';
  btn.title = 'Карта Путей';
  btn.className = 'trBtn';
  btn.style.cssText = 'font-size:16px;cursor:pointer;text-align:center;' +
    'padding:8px 10px;border-radius:12px;border:1px solid var(--line,rgba(201,168,76,.12));' +
    'background:rgba(8,7,18,.7);backdrop-filter:blur(8px);color:var(--gold,#c9a84c);' +
    'transition:all .3s ease;-webkit-tap-highlight-color:transparent';
  btn.addEventListener('click', function(){
    window.AwaraProfiling.show();
  });
  // Append into topRightBtns — day-gen will move it into #trBtnRow flex row
  var container = document.querySelector('.topRightBtns');
  if(container){
    container.appendChild(btn);
  } else {
    btn.style.cssText += ';position:fixed;top:100px;right:14px;z-index:80;width:40px;height:40px';
    document.body.appendChild(btn);
  }
}

// Show re-open button if profile exists
window.addEventListener('awara:profile-ready', addReopenButton);
try{ if(localStorage.getItem('awara_player_profile')){ setTimeout(addReopenButton, 1200); } }catch(e){}

})();
