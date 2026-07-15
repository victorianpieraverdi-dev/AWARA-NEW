'use strict';

// ══ LOCAL STORAGE KEY ══
const LS = 'awara_patch_v258';

function loadData() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch(e) { return {}; }
}
function saveData(d) {
  try { localStorage.setItem(LS, JSON.stringify(d)); } catch(e) {}
}

let D = loadData();
if (!D.diary)    D.diary    = [];
if (!D.ach)      D.ach      = {};
if (!D.quests)   D.quests   = {};
if (!D.tarot)    D.tarot    = [];
if (!D.med)      D.med      = { total: 0, minutes: 0 };
if (!D.karma)    D.karma    = 0;
if (!D.bank)     D.bank     = { balance: 0, lastInterest: Date.now(), history: [] };
saveData(D);

// ══ ACHIEVEMENT DEFINITIONS ══
const ACHIEVEMENTS = [
  { id:'first_diary',   icon:'📖', name:'Первая запись',       desc:'Записал первую мысль в дневник',     secret: false },
  { id:'diary_7',       icon:'🌙', name:'Неделя практики',     desc:'7 записей в дневнике',                secret: false },
  { id:'diary_30',      icon:'📚', name:'Мудрец',              desc:'30 записей в дневнике',               secret: false },
  { id:'first_med',     icon:'🧘', name:'Первый вдох',         desc:'Провёл первую медитацию',            secret: false },
  { id:'med_10',        icon:'🔮', name:'Искатель тишины',     desc:'10 завершённых медитаций',           secret: false },
  { id:'med_60min',     icon:'⏳', name:'Час молчания',        desc:'Суммарно 60 минут медитации',        secret: false },
  { id:'first_tarot',   icon:'🎴', name:'Первый оракул',       desc:'Вытянул первую карту оракула',       secret: false },
  { id:'tarot_7',       icon:'🌀', name:'Читатель судеб',      desc:'7 карт оракула',                     secret: false },
  { id:'karma_100',     icon:'✨', name:'Светоносец',          desc:'Карма достигла +100',                secret: false },
  { id:'karma_neg',     icon:'🌑', name:'Теневой путь',        desc:'Карма ушла в минус',                 secret: true  },
  { id:'quest_daily_3', icon:'⚔️', name:'Воин духа',           desc:'Выполнил 3 ежедневных испытания',   secret: false },
  { id:'quest_epic',    icon:'🏛️', name:'Эпический герой',     desc:'Завершил эпическое испытание',      secret: false },
];

// ══ QUEST DEFINITIONS ══
const QUESTS = {
  daily: [
    { id:'q_d1', icon:'🌅', name:'Утренняя практика',     desc:'Сделай запись в дневнике до полудня',         reward:'+5 кармы',  karmaVal: 5  },
    { id:'q_d2', icon:'🔮', name:'5 минут тишины',        desc:'Проведи медитацию не менее 5 минут',           reward:'+8 кармы',  karmaVal: 8  },
    { id:'q_d3', icon:'🎴', name:'Спроси оракул',         desc:'Вытяни карту и прими послание',                reward:'+3 кармы',  karmaVal: 3  },
    { id:'q_d4', icon:'💧', name:'Сосуд воды',            desc:'Выпей 2 литра воды сегодня',                   reward:'+4 кармы',  karmaVal: 4  },
    { id:'q_d5', icon:'🌿', name:'Прогулка в природе',   desc:'Проведи 20 минут на свежем воздухе',           reward:'+6 кармы',  karmaVal: 6  },
  ],
  weekly: [
    { id:'q_w1', icon:'🏔️', name:'Семь дней практики',   desc:'Медитируй каждый день в течение недели',       reward:'+50 кармы', karmaVal:50  },
    { id:'q_w2', icon:'📖', name:'Архив мудрости',        desc:'Сделай 7 записей в дневнике за неделю',        reward:'+40 кармы', karmaVal:40  },
    { id:'q_w3', icon:'⚡', name:'Цикл трансформации',   desc:'Пройди все уровни медитации (5,10,20,30 мин)',  reward:'+60 кармы', karmaVal:60  },
  ],
  epic: [
    { id:'q_e1', icon:'🌌', name:'Великое Молчание',      desc:'Проведи суммарно 5 часов медитации',           reward:'+200 кармы',karmaVal:200 },
    { id:'q_e2', icon:'🏛️', name:'Страж Традиции',        desc:'30 дней непрерывного ведения дневника',        reward:'+300 кармы',karmaVal:300 },
    { id:'q_e3', icon:'🔯', name:'Мастер Оракула',        desc:'Вытяни 50 карт оракула',                       reward:'+150 кармы',karmaVal:150 },
  ]
};

// ══ TAROT CARDS ══
const TAROT = [
  { icon:'🌟', name:'Звезда',       num:'XVII',  msg:'Надежда и вдохновение освещают твой путь. Доверься потоку Вселенной.' },
  { icon:'☀️', name:'Солнце',       num:'XIX',   msg:'Радость и жизненная сила достигают своего пика. Время расцвета.' },
  { icon:'🌙', name:'Луна',         num:'XVIII', msg:'Погрузись в глубины подсознания. Иллюзии скоро рассеются.' },
  { icon:'⚡', name:'Башня',        num:'XVI',   msg:'Разрушение старого — путь к новому. Прими трансформацию.' },
  { icon:'⚖️', name:'Справедливость',num:'XI',  msg:'Карма восстанавливает равновесие. Каждое действие имеет следствие.' },
  { icon:'🔮', name:'Верховная Жрица',num:'II', msg:'Прислушайся к голосу интуиции. Истина скрыта в молчании.' },
  { icon:'🌍', name:'Мир',          num:'XXI',   msg:'Завершение великого цикла. Ты достиг целостности.' },
  { icon:'🦁', name:'Сила',         num:'VIII',  msg:'Укроти внутреннего зверя нежностью, а не силой.' },
  { icon:'🎰', name:'Колесо Судьбы',num:'X',    msg:'Колесо вращается. Принимай перемены как неизбежность.' },
  { icon:'💀', name:'Смерть',       num:'XIII',  msg:'Конец одной главы — начало следующей. Трансформация неизбежна.' },
  { icon:'😇', name:'Суд',          num:'XX',    msg:'Пробуждение и возрождение. Прошлое прощено, будущее открыто.' },
  { icon:'🃏', name:'Шут',          num:'0',     msg:'Начни с чистого листа. Доверяй неизвестному пути.' },
  { icon:'🧙', name:'Маг',          num:'I',     msg:'У тебя есть все инструменты. Действуй с намерением.' },
  { icon:'🏠', name:'Императрица',  num:'III',   msg:'Изобилие и творение расцветают. Питай то, что любишь.' },
  { icon:'👑', name:'Император',    num:'IV',    msg:'Установи порядок и дисциплину. Власть рождается из структуры.' },
  { icon:'🕍', name:'Иерофант',     num:'V',     msg:'Прикоснись к традиции и мудрости предков.' },
  { icon:'👫', name:'Влюблённые',   num:'VI',    msg:'Выбор, сделанный из сердца, всегда правилен.' },
  { icon:'🚗', name:'Колесница',    num:'VII',   msg:'Управляй противоположными силами в одном направлении.' },
  { icon:'☠️', name:'Отшельник',    num:'IX',    msg:'Уединение и поиск внутреннего света. Ответ внутри тебя.' },
  { icon:'🔗', name:'Дьявол',       num:'XV',    msg:'Освободись от привязанностей. Цепи иллюзорны.' },
  { icon:'🌊', name:'Умеренность',  num:'XIV',   msg:'Смешай противоположности с мудростью. Средний путь.' },
  { icon:'💫', name:'Повешенный',   num:'XII',   msg:'Смени угол зрения. Отпусти контроль — и откроется мудрость.' },
];

// ══ KARMA ACTIONS ══
const KARMA_ACTIONS = [
  { icon:'🙏', name:'Медитация',     desc:'Практика внутренней тишины',        val: 10  },
  { icon:'📖', name:'Запись мысли',  desc:'Осознанность через письмо',         val:  5  },
  { icon:'🌟', name:'Добрый поступок',desc:'Помог кому-то искренне',           val: 15  },
  { icon:'🌿', name:'Чистое питание', desc:'День без вредной пищи',            val:  8  },
  { icon:'😤', name:'Гнев',          desc:'Потерял контроль над эмоциями',     val: -10 },
  { icon:'📵', name:'Цифровой детокс',desc:'День без соцсетей',               val: 12  },
  { icon:'💤', name:'Нарушение сна',  desc:'Лёг спать позже полуночи',        val: -5  },
  { icon:'🫁', name:'Пранаяма',       desc:'Дыхательные практики',            val:  7  },
];

const REINCARNATIONS = [
  { min:-999, max:-100, path:'🌑 Тёмный путь · Следующее воплощение — урок смирения через трудности.' },
  { min:-99,  max:-30,  path:'🌒 Путь очищения · Тень ещё велика, но свет начинает проникать.' },
  { min:-29,  max:29,   path:'⚖️ Путь равновесия · Ты балансируешь между светом и тьмой.' },
  { min:30,   max:99,   path:'🌔 Путь восхождения · Свет нарастает. Духовная эволюция ускоряется.' },
  { min:100,  max:999,  path:'🌟 Путь освобождения · Высшее воплощение — учитель и служение миру.' },
];

// ══ MEDITATION STATE ══
let medState = { running: false, total: 300, remaining: 300, timer: null };

// ══ PM OBJECT (Patch Manager) ══
window.PM = {

  // — OPEN / CLOSE —
  open(id) {
    document.querySelectorAll('.pm').forEach(m => m.classList.remove('open'));
    const m = document.getElementById('pm-'+id);
    if (m) {
      m.classList.add('open');
      this['render_'+id] && this['render_'+id]();
    }
  },
  close(id) {
    const m = document.getElementById('pm-'+id);
    if (m) m.classList.remove('open');
  },

  // ══ 1. ACHIEVEMENTS ══
  render_ach() {
    const grid = document.getElementById('ach-grid'); if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = !!D.ach[a.id];
      const isNew = D.ach[a.id] === 'new';
      return `<div class="ach-card ${unlocked?'unlocked':'locked'}">
        ${isNew ? '<div class="ach-new">НОВОЕ</div>' : ''}
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${unlocked||!a.secret ? a.desc : '???'}</div>
      </div>`;
    }).join('');
    // clear "new" flags
    ACHIEVEMENTS.forEach(a => { if (D.ach[a.id]==='new') D.ach[a.id]='unlocked'; });
    saveData(D);
  },

  unlock(id) {
    const a = ACHIEVEMENTS.find(x => x.id===id);
    if (!a || D.ach[id]) return;
    D.ach[id] = 'new';
    saveData(D);
    // show popup
    const pop = document.getElementById('ach-popup');
    if (pop) {
      document.getElementById('ach-popup-icon').textContent = a.icon;
      document.getElementById('ach-popup-name').textContent = a.name;
      pop.classList.add('show');
      setTimeout(() => pop.classList.remove('show'), 3000);
    }
  },

  checkAchievements() {
    if (D.diary.length >= 1) this.unlock('first_diary');
    if (D.diary.length >= 7) this.unlock('diary_7');
    if (D.diary.length >= 30) this.unlock('diary_30');
    if (D.med.total >= 1)  this.unlock('first_med');
    if (D.med.total >= 10) this.unlock('med_10');
    if (D.med.minutes >= 60) this.unlock('med_60min');
    if (D.tarot.length >= 1) this.unlock('first_tarot');
    if (D.tarot.length >= 7) this.unlock('tarot_7');
    if (D.karma >= 100) this.unlock('karma_100');
    if (D.karma < 0) this.unlock('karma_neg');
    const doneDaily = QUESTS.daily.filter(q => D.quests[q.id]).length;
    if (doneDaily >= 3) this.unlock('quest_daily_3');
    if (QUESTS.epic.some(q => D.quests[q.id])) this.unlock('quest_epic');
  },

  // ══ 2. DIARY ══
  selectedMood: '🌟',
  selectMood(btn) {
    document.querySelectorAll('.diary-mood-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    this.selectedMood = btn.dataset.mood;
  },
  saveDiary() {
    const txt = document.getElementById('diary-text').value.trim();
    if (!txt) return;
    D.diary.unshift({
      text: txt, mood: this.selectedMood,
      date: new Date().toLocaleString('ru-RU', {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})
    });
    document.getElementById('diary-text').value = '';
    saveData(D); this.render_diary(); this.checkAchievements();
    this.toast('Запись сохранена ✦');
    this.addKarma(3, 'Запись в дневнике');
  },
  render_diary() {
    const c = document.getElementById('diary-entries'); if (!c) return;
    c.innerHTML = D.diary.slice(0,20).map(e => `
      <div class="diary-entry">
        <div class="diary-entry-date">
          <span class="diary-entry-mood">${e.mood||'🌟'}</span>
          ${e.date}
        </div>
        <div class="diary-entry-text">${e.text}</div>
      </div>`).join('') || '<div style="text-align:center;color:var(--p-dim);font-family:JetBrains Mono,monospace;font-size:9px;padding:20px;">Записей пока нет</div>';
  },

  // ══ 3. QUESTS ══
  currentQuestTab: 'daily',
  questTab(btn, tab) {
    document.querySelectorAll('.quest-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.currentQuestTab = tab;
    this.render_quests();
  },
  render_quests() {
    const c = document.getElementById('quest-list'); if (!c) return;
    const qs = QUESTS[this.currentQuestTab] || [];
    c.innerHTML = qs.map(q => {
      const done = !!D.quests[q.id];
      return `<div class="quest-item ${done?'done':''}" onclick="PM.completeQuest('${q.id}')">
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title">${q.name}</div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward">${q.reward}</div>
        </div>
        <div class="quest-check">${done?'✅':'○'}</div>
      </div>`;
    }).join('');
  },
  completeQuest(id) {
    if (D.quests[id]) return;
    const q = [...QUESTS.daily,...QUESTS.weekly,...QUESTS.epic].find(x=>x.id===id);
    if (!q) return;
    D.quests[id] = true; saveData(D);
    this.addKarma(q.karmaVal, q.name);
    this.render_quests(); this.checkAchievements();
    this.toast(`✦ ${q.name} — выполнено!`);
  },

  // ══ 4. TAROT ══
  isFlipping: false,
  render_tarot() {
    this.renderTarotHistory();
  },
  drawTarot() {
    if (this.isFlipping) return;
    this.isFlipping = true;
    const card = TAROT[Math.floor(Math.random()*TAROT.length)];
    const disp = document.getElementById('tarot-card-display'); if (!disp) return;
    disp.classList.add('flipping');
    setTimeout(() => {
      disp.innerHTML = `
        <div class="tarot-card-icon">${card.icon}</div>
        <div class="tarot-card-name">${card.name}</div>
        <div class="tarot-card-num">${card.num}</div>`;
      disp.classList.remove('flipping');
      setTimeout(() => {
        disp.innerHTML += `<div class="tarot-card-msg">${card.msg}</div>`;
        this.isFlipping = false;
      }, 300);
    }, 350);
    D.tarot.unshift({ icon:card.icon, name:card.name, ts: Date.now() });
    if (D.tarot.length > 50) D.tarot = D.tarot.slice(0,50);
    saveData(D); this.renderTarotHistory(); this.checkAchievements();
  },
  renderTarotHistory() {
    const h = document.getElementById('tarot-history'); if (!h) return;
    h.innerHTML = D.tarot.slice(0,10).map(c=>`<span class="tarot-hist-item" title="${c.name}">${c.icon}</span>`).join('');
  },

  // ══ 5. MEDITATION ══
  medMinutes: 5,
  medPreset(btn) {
    document.querySelectorAll('.med-preset').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    this.medMinutes = parseInt(btn.dataset.min);
    if (!medState.running) {
      medState.total = medState.remaining = this.medMinutes * 60;
      this.updateTimerDisplay();
    }
  },
  medToggle() {
    if (medState.running) {
      clearInterval(medState.timer);
      medState.running = false;
      document.getElementById('med-start-btn').textContent = '▶ ПРОДОЛЖИТЬ';
      document.getElementById('med-orb').classList.remove('active');
      document.getElementById('med-guide').textContent = 'Пауза. Ты можешь продолжить в любой момент.';
    } else {
      if (medState.remaining <= 0) { this.medReset(); return; }
      medState.running = true;
      document.getElementById('med-start-btn').textContent = '⏸ ПАУЗА';
      document.getElementById('med-orb').classList.add('active');
      const guides = [
        'Сосредоточься на дыхании. Вдох — задержка — выдох.',
        'Отпусти все мысли. Ты — наблюдатель.',
        'Почувствуй тишину внутри.',
        'Каждый вдох наполняет тебя светом.',
        'Ты — в центре Вселенной.'
      ];
      let gi = 0;
      document.getElementById('med-guide').textContent = guides[0];
      medState.timer = setInterval(() => {
        medState.remaining--;
        this.updateTimerDisplay();
        if (medState.remaining % 60 === 0) {
          gi = (gi+1) % guides.length;
          document.getElementById('med-guide').textContent = guides[gi];
        }
        if (medState.remaining <= 0) {
          clearInterval(medState.timer);
          medState.running = false;
          document.getElementById('med-start-btn').textContent = '▶ НАЧАТЬ';
          document.getElementById('med-orb').classList.remove('active');
          document.getElementById('med-guide').textContent = '✦ Медитация завершена. Благодать.';
          D.med.total++;
          D.med.minutes += Math.floor(medState.total / 60);
          saveData(D);
          this.updateMedStats();
          this.checkAchievements();
          this.addKarma(Math.floor(medState.total/60)*2, 'Медитация');
          this.toast(`✦ Медитация завершена · +${Math.floor(medState.total/60)*2} кармы`);
        }
      }, 1000);
    }
  },
  medReset() {
    clearInterval(medState.timer);
    medState.running = false;
    medState.remaining = this.medMinutes * 60;
    document.getElementById('med-start-btn').textContent = '▶ НАЧАТЬ';
    document.getElementById('med-orb').classList.remove('active');
    document.getElementById('med-guide').textContent = 'Выбери время и начни путешествие внутрь';
    this.updateTimerDisplay();
  },
  updateTimerDisplay() {
    const m = Math.floor(medState.remaining/60);
    const s = medState.remaining % 60;
    const el = document.getElementById('med-timer-display');
    if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },
  updateMedStats() {
    const tc = document.getElementById('med-total-count');
    const tm = document.getElementById('med-total-min');
    if (tc) tc.textContent = D.med.total;
    if (tm) tm.textContent = D.med.minutes;
  },
  render_med() {
    medState.total = medState.remaining = this.medMinutes * 60;
    this.updateTimerDisplay();
    this.updateMedStats();
  },

  // ══ 6. KARMA ══
  addKarma(val, reason) {
    D.karma = Math.max(-500, Math.min(500, D.karma + val));
    saveData(D);
    this.updateKarmaDisplay();
    this.checkAchievements();
  },
  updateKarmaDisplay() {
    const vd = document.getElementById('karma-value-display');
    const fill = document.getElementById('karma-fill');
    const rei = document.getElementById('rei-path');
    if (vd) vd.textContent = (D.karma >= 0 ? '+' : '') + D.karma;
    if (fill) {
      const pct = ((D.karma + 500) / 1000 * 100);
      fill.style.width = pct + '%';
    }
    if (rei) {
      const r = REINCARNATIONS.find(x => D.karma >= x.min && D.karma <= x.max);
      rei.textContent = r ? r.path : '⚖️ Путь равновесия';
    }
  },
  render_karma() {
    const c = document.getElementById('karma-actions'); if (!c) return;
    c.innerHTML = KARMA_ACTIONS.map(a => `
      <div class="karma-act" onclick="PM.doKarmaAct(${a.val}, '${a.name}')">
        <div class="karma-act-icon">${a.icon}</div>
        <div class="karma-act-info">
          <div class="karma-act-name">${a.name}</div>
          <div class="karma-act-desc">${a.desc}</div>
        </div>
        <div class="karma-act-val ${a.val<0?'neg':''}">${a.val>0?'+':''}${a.val}</div>
      </div>`).join('');
    this.updateKarmaDisplay();
  },
  doKarmaAct(val, name) {
    this.addKarma(val, name);
    this.toast(`${val>0?'+':`${val}`} карма · ${name}`);
  },

  // ══ BANK (КАЗНА СВЕТА) ══
  render_bank() {
    this.updateBankDisplay();
    this.updateBankTimer();
  },

  updateBankDisplay() {
    const bal = document.getElementById('bank-balance');
    if (bal) bal.textContent = D.bank.balance.toLocaleString();

    const hist = document.getElementById('bank-history');
    if (hist) {
      if (D.bank.history.length === 0) {
        hist.innerHTML = '<div style="text-align:center;padding:8px;color:rgba(255,255,255,0.3);">Пока нет начислений</div>';
      } else {
        hist.innerHTML = D.bank.history.slice(-10).reverse().map(h =>
          `<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="color:#64ff64;">+${h.amount}</span> · ${h.date}
          </div>`
        ).join('');
      }
    }
  },

  updateBankTimer() {
    const nextEl = document.getElementById('bank-next-time');
    if (!nextEl) return;

    const now = Date.now();
    const nextInterest = D.bank.lastInterest + 3600000; // +1 час
    const diff = nextInterest - now;

    if (diff <= 0) {
      // Начислить проценты
      this.applyInterest();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    nextEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    setTimeout(() => this.updateBankTimer(), 1000);
  },

  applyInterest() {
    if (D.bank.balance <= 0) {
      D.bank.lastInterest = Date.now();
      saveData(D);
      this.updateBankTimer();
      return;
    }

    const interest = Math.floor(D.bank.balance * 0.05); // 5%
    D.bank.balance += interest;
    D.bank.lastInterest = Date.now();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    D.bank.history.push({ amount: interest, date: timeStr });
    if (D.bank.history.length > 50) D.bank.history = D.bank.history.slice(-50);

    saveData(D);
    this.updateBankDisplay();
    this.updateBankTimer();
    this.toast(`✦ Начислено ${interest} света`);
  },

  depositLight() {
    const input = document.getElementById('bank-amount');
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) {
      this.toast('⚠️ Укажи количество света');
      return;
    }

    if (!window.state || window.state.totalLight < amount) {
      this.toast('⚠️ Недостаточно света');
      return;
    }

    window.state.totalLight -= amount;
    D.bank.balance += amount;
    saveData(D);

    if (window.updateStatsAndProgress) window.updateStatsAndProgress();
    this.updateBankDisplay();
    this.toast(`✦ Внесено ${amount} света в Казну`);
    input.value = '';
  },

  withdrawLight() {
    const input = document.getElementById('bank-amount');
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) {
      this.toast('⚠️ Укажи количество света');
      return;
    }

    if (D.bank.balance < amount) {
      this.toast('⚠️ Недостаточно света в Казне');
      return;
    }

    D.bank.balance -= amount;
    if (window.state) window.state.totalLight += amount;
    saveData(D);

    if (window.updateStatsAndProgress) window.updateStatsAndProgress();
    this.updateBankDisplay();
    this.toast(`✦ Снято ${amount} света из Казны`);
    input.value = '';
  },

  // ══ TOAST ══
  toast(msg) {
    const t = document.createElement('div');
    t.className = 'karma-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
};

// ══ INIT ══
// sync karma with existing S.polarity if available
setTimeout(() => {
  if (window.S && typeof S.polarity === 'number' && D.karma === 0) {
    D.karma = S.polarity * 2;
    saveData(D);
  }
  PM.updateKarmaDisplay();
  PM.updateMedStats();
  PM.checkAchievements();
}, 1500);

// close on backdrop click
document.querySelectorAll('.pm').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.pm').forEach(m => m.classList.remove('open'));
});

console.log('✦ AWARA v258 Patch loaded — 7 mechanics active (Bank added)');
