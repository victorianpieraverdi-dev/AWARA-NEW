// ── ДВИЖОК КЛЮЧЕЙ ──
window.AwaraKeyEngine = {
  WU_XING_WORDS: {
    water:['дневник','сон','отдых','тишина','медитация','вода','купание','интроспекция','луна','чтение','покой','созерцание','молчание'],
    wood: ['код','программирование','рост','план','обучение','изучение','проект','движение','создание','написал','написала','строк','работа'],
    fire: ['джапа','мантра','молитва','пение','танец','страсть','солнце','огонь','активность','йога','прана','энергия','вдохновение','поток'],
    earth:['чай','еда','земля','семья','дом','стабильность','практика','ритуал','традиция','обед','ужин','встреча','общение','забота'],
    metal:['пранаяма','очищение','завершение','структура','порядок','дисциплина','выдох','завершил','завершила','итог','рефлексия','анализ'],
  },
  tagWuXing(text) {
    const t=text.toLowerCase(), scores={water:0,wood:0,fire:0,earth:0,metal:0}; let total=0;
    for(const[elem,words]of Object.entries(this.WU_XING_WORDS)){words.forEach(w=>{if(t.includes(w)){scores[elem]++;total++;}});}
    if(!total)return{water:.2,wood:.2,fire:.2,earth:.2,metal:.2};
    const r={};for(const[k,v]of Object.entries(scores))r[k]=+(v/total).toFixed(3);return r;
  },
  calcChannels(wx) {
    const p=Math.min(1,wx.wood+wx.fire+wx.earth*.5);
    const i=Math.min(1,wx.water+wx.metal+wx.earth*.5);
    const balance=+Math.max(0,1-Math.abs(p-i)*2).toFixed(3);
    return{pingala:+p.toFixed(3),ida:+i.toFixed(3),balance,mining_multiplier:+(1+balance*2).toFixed(2)};
  },
  calcSpheres(wx){
    return{brahma:+(wx.wood*.6+wx.fire*.4).toFixed(3),vishnu:+(wx.water*.6+wx.earth*.4).toFixed(3),
           shiva:+(wx.metal*.6+wx.fire*.4).toFixed(3),creation:+(wx.wood*.5+wx.earth*.5).toFixed(3)};
  },
  generate(logText,matrix){
    const wx=this.tagWuXing(logText),ch=this.calcChannels(wx),sph=this.calcSpheres(wx);
    const res=0.87,mat=matrix||{id:'neutral',label:'Нейтраль',icon:'⬡',guna:'саттва',key_code:'DHARMA',color:'#c9a84c'};
    const score=res*100*.4+ch.balance*100*.35+Math.max(...Object.values(sph))*100*.25;
    const rarity=score>=82?'epic':score>=65?'rare':'common';
    const mernost=Math.min(9,1+Math.floor(12/2)+(ch.balance>=.8?1:0));
    const lightTotal=+(108*ch.mining_multiplier*res).toFixed(1);
    const buffs=[];
    if(sph.brahma>.25)buffs.push({type:'focus',value:Math.round(sph.brahma*80),desc:_t('idx.buff.focus','Ментальная ясность')});
    if(sph.vishnu>.2)buffs.push({type:'harmony',value:Math.round(sph.vishnu*70),desc:_t('idx.buff.harmony','Семейный резонанс')});
    if(sph.shiva>.2)buffs.push({type:'willpower',value:Math.round(sph.shiva*75),desc:_t('idx.buff.will','Воля и дисциплина')});
    if(sph.creation>.15)buffs.push({type:'creativity',value:Math.round(sph.creation*90),desc:_t('idx.buff.creativity','Творческий поток')});
    if(ch.balance>.8)buffs.push({type:'mining',value:ch.mining_multiplier,desc:_t('idx.buff.sush','Сушумна ×')+ch.mining_multiplier});
    return{id:'key_'+Date.now()+'_'+mat.id+'_'+rarity,name:_t('idx.key.name','Ключ ')+(mat.key_code||mat.id)+' · '+_t('idx.key.architect','Зодчий Перехода'),
      rarity,mernost,lightTotal,buffs,wu_xing:wx,channels:ch,spheres:sph,
      ai_prompt:mat.label+' sacred artifact, earth crystal, divine geometry, gold palette, unreal engine 5, 8k',
      created_at:new Date().toLocaleString((window.getLang&&window.getLang())||'ru')};
  },
};

// ── ТОРОИДАЛЬНЫЙ ДВИЖОК ──
window.ToroidEngine = {
  compute(wx){
    const p=Math.min(1,(wx.fire||0)*.5+(wx.wood||0)*.35+(wx.earth||0)*.15);
    const i=Math.min(1,(wx.water||0)*.5+(wx.metal||0)*.35+(wx.earth||0)*.15);
    const delta=Math.abs(p-i);
    const balance=+Math.max(0,1-delta*2).toFixed(4);
    const mining=+(1+balance*2).toFixed(3);
    const lightTotal=+(108*mining*.87).toFixed(2);
    const sushumna=balance>=.92?{label:_t('idx.sush.full','ПОЛНОЕ ОТКРЫТИЕ'),icon:'✦',color:'#ffe080'}:
                   balance>=.78?{label:_t('idx.sush.high','ВЫСОКАЯ АКТИВАЦИЯ'),icon:'◎',color:'#c9a84c'}:
                   balance>=.60?{label:_t('idx.sush.partial','ЧАСТИЧНЫЙ ПОТОК'),icon:'○',color:'#88aacc'}:
                   balance>=.35?{label:_t('idx.sush.weak','СЛАБЫЙ ПОТОК'),icon:'◌',color:'#666688'}:
                                {label:_t('idx.sush.closed','ЗАКРЫТА'),icon:'×',color:'#443344'};
    return{pingala:+p.toFixed(3),ida:+i.toFixed(3),balance,mining_multiplier:mining,
           mining_pct:Math.round(mining/3*100),light_total:lightTotal,sushumna,
           dominant:p>i?{channel:_t('idx.ch.pingala','Пингала'),advice:_t('idx.ch.pingala.adv','Добавь отдых, чай, музыку')}:
                    i>p?{channel:_t('idx.ch.ida','Ида'),advice:_t('idx.ch.ida.adv','Добавь действие, практику')}:
                        {channel:_t('idx.ch.sushumna','Сушумна'),advice:_t('idx.ch.sushumna.adv','Идеальный баланс')}};
  },
};

// ── ОБНОВЛЕНИЕ БЕЙДЖА ТИГЛЯ В ЛОББИ ──
(function updateTigelBadge(){
  var history=[];
  try{history=JSON.parse(localStorage.getItem('awara_toroid_history')||'[]');}catch(e){}
  if(!history.length)return;
  var last=history[0];
  var badge=document.getElementById('tigel-mining-badge');
  if(badge&&last.mining){
    badge.textContent='×'+last.mining;
    if(last.mining>=2.5)badge.style.color='rgba(0,255,170,0.8)';
    else if(last.mining>=1.8)badge.style.color='rgba(201,168,76,0.8)';
  }
})();

// ══ ДАННЫЕ МАТРИЦ И ВРАТ ══
const matricesData = {
  vedic: { title: "Путь Звука и Дхармы", lore: "Восстановление архитектуры судьбы через ритм первоначальной мантры. Гармонизация пространства вибрацией.", dust: 30 },
  techno: { title: "Путь Архитектора", lore: "Код — это современная магия. Переписывание битых секторов реальности, превращение хаоса в кристальный алгоритмический порядок.", dust: 0 },
  dao: { title: "Путь Воды и Пустоты", lore: "Истинная сила в недеянии (У-Вэй). Познание через наблюдение и остановку внутреннего диалога.", dust: 85 },
  alchemy: { title: "Путь Трансмутации", lore: "Великое Делание. Превращение свинца повседневной рутины и эго в чистое золото осознанности.", dust: 15 }
};

const mentalGatesDB = [
  { id: "mg_v_1", type: "visual", matrix: "dao", question: "Куда тянется твой взгляд?", options: [{text: "Пылающий костер", effect_channel: "pingala", effect_val: 0.1}, {text: "Спокойное озеро", effect_channel: "ida", effect_val: 0.1}], success_msg: "Энергия считана. Твой тороид принимает этот поток." },
  { id: "mg_q_1", type: "quiz", matrix: "techno", question: "Какое действие лучше всего очищает цифровой Тамас?", options: [{text: "Дефрагментация и удаление отживших файлов", isCorrect: true}, {text: "Покупка нового жесткого диска", isCorrect: false}], success_msg: "Верно. Эфир освобожден. Пыль собрана.", fail_msg: "Искажение. Накопление без очищения ведет к застою." },
  { id: "mg_v_2", type: "visual", matrix: "vedic", question: "Что ближе твоему сердцу сейчас?", options: [{text: "Звук мантры ОМ", effect_channel: "ida", effect_val: 0.08}, {text: "Ритм барабана", effect_channel: "pingala", effect_val: 0.08}], success_msg: "Резонанс принят. Энергия течёт." }
];

let currentSelectedMatrix = 'vedic';
let currentGate = null;
let pingalaGlobal = 0.5;
let idaGlobal = 0.5;
let inventory = [];

// ══ ПЕРСИСТЕНТНОСТЬ ══
function saveData() {
  try {
    localStorage.setItem('awara_matrices', JSON.stringify(matricesData));
    localStorage.setItem('awara_inventory', JSON.stringify(inventory));
  } catch(e) {
    console.warn('localStorage недоступен:', e);
  }
}

function loadData() {
  try {
    const matrices = localStorage.getItem('awara_matrices');
    const inv = localStorage.getItem('awara_inventory');
    if(matrices) Object.assign(matricesData, JSON.parse(matrices));
    if(inv) inventory = JSON.parse(inv);
  } catch(e) {
    console.warn('Ошибка загрузки данных:', e);
  }
}

// ══ ФУНКЦИИ ГРИМУАРА ══
function toggleGrimoire() {
  const grimoire = document.getElementById('grimoire-overlay');
  grimoire.style.display = (grimoire.style.display === 'none' || grimoire.style.display === '') ? 'block' : 'none';
  if(grimoire.style.display === 'block') {
    loadData();
    selectMatrix(currentSelectedMatrix);
  }
}

function forgeKey(matrixId) {
  if(matricesData[matrixId].dust < 100) {
    alert('⚠ Недостаточно пыли! Нужно 100, у вас: ' + matricesData[matrixId].dust);
    return;
  }
  
  matricesData[matrixId].dust -= 100;
  const key = {
    id: Date.now(),
    matrix: matrixId,
    name: matricesData[matrixId].title,
    forged: new Date().toISOString()
  };
  inventory.push(key);
  saveData();
  renderInventory(matrixId);
  selectMatrix(matrixId);
  
  alert('✦ Ключ выкован успешно! ✦\n\n' + key.name);
}

function renderInventory(matrixId) {
  const container = document.getElementById('inventory-slots');
  const keys = inventory.filter(k => k.matrix === matrixId);
  
  if(keys.length === 0) {
    container.innerHTML = '<div class="key-slot empty-slot">' + t('idx.empty.slot') + '</div>';
    return;
  }
  
  container.innerHTML = keys.map(k => `
    <div class="card-container">
      <div class="card-inner">
        <div class="card-front">
          <div class="card-image-placeholder">🗝️</div>
          <div style="padding: 10px; font-size: 10px; color: #ffe080; text-align: center; font-family: 'Cinzel', serif; line-height: 1.2;">
            ${k.name}
          </div>
        </div>
        <div class="card-back">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 7px; color: #88aacc; margin-bottom: 10px;">
            ID: ${k.id}
          </div>
          <div style="font-size: 9px; color: #c9a84c; margin-bottom: 8px; line-height: 1.4;">
            Уровень: 1<br>
            Синтез: Успешно<br>
            Матрица: ${k.matrix}
          </div>
          <button onclick="alert('🔮 Интеграция в Васту скоро...')" style="background: transparent; border: 1px solid #c9a84c; color: #c9a84c; font-family: 'Cinzel', serif; font-size: 7px; padding: 6px 10px; cursor: pointer; text-transform: uppercase; border-radius: 4px; transition: 0.3s;" onmouseover="this.style.background='rgba(201,168,76,0.1)'" onmouseout="this.style.background='transparent'">
            В ВАСТУ
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function selectMatrix(matrixId) {
  currentSelectedMatrix = matrixId;
  document.querySelectorAll('.matrix-tab').forEach(t => t.classList.remove('active-matrix'));
  document.getElementById('tab-' + matrixId).classList.add('active-matrix');
  const d = matricesData[matrixId];
  document.getElementById('m-title').innerText = d.title;
  document.getElementById('m-lore').innerText = d.lore;
  document.getElementById('m-progress-text').innerText = d.dust + " / 100";
  document.getElementById('m-progress-bar').style.width = d.dust + "%";
  renderInventory(matrixId);
  
  const forgeBtn = document.getElementById('forge-btn');
  if(forgeBtn) {
    if(d.dust >= 100) {
      forgeBtn.style.opacity = '1';
      forgeBtn.style.cursor = 'pointer';
      forgeBtn.style.borderColor = '#ffe080';
      forgeBtn.style.color = '#ffe080';
    } else {
      forgeBtn.style.opacity = '0.3';
      forgeBtn.style.cursor = 'not-allowed';
      forgeBtn.style.borderColor = '#c9a84c';
      forgeBtn.style.color = '#c9a84c';
    }
  }
}

// ══ ФУНКЦИИ ВРАТ ══
function openRandomMentalGate() {
  const availableGates = mentalGatesDB.filter(g => g.matrix === currentSelectedMatrix);
  currentGate = availableGates.length > 0 ? availableGates[Math.floor(Math.random() * availableGates.length)] : mentalGatesDB[Math.floor(Math.random() * mentalGatesDB.length)];
  
  document.getElementById('mg-feedback').style.display = 'none';
  document.getElementById('mg-close-btn').style.display = 'none';
  const optsEl = document.getElementById('mg-options');
  optsEl.style.display = 'flex';
  optsEl.innerHTML = '';
  document.getElementById('mg-question').innerHTML = currentGate.question;

  currentGate.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerHTML = opt.text;
    btn.style.cssText = `padding: 12px; background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.3); color: #fff; cursor: pointer; transition: 0.3s; font-family: 'JetBrains Mono', monospace;`;
    btn.onmouseenter = function() { this.style.background = 'rgba(201,168,76,0.15)'; };
    btn.onmouseleave = function() { this.style.background = 'rgba(201,168,76,0.05)'; };
    btn.onclick = () => handleGateAnswer(opt);
    optsEl.appendChild(btn);
  });
  document.getElementById('mental-gate-overlay').style.display = 'flex';
}

function handleGateAnswer(selectedOption) {
  document.getElementById('mg-options').style.display = 'none';
  const fb = document.getElementById('mg-feedback');
  fb.style.display = 'block';

  if (currentGate.type === 'visual') {
    fb.innerHTML = currentGate.success_msg; 
    fb.style.color = '#88aacc';
    matricesData[currentSelectedMatrix].dust += 5;
    
    // ══ ИНТЕГРАЦИЯ С ТОРОИДОМ ══
    if (selectedOption.effect_channel === 'pingala') {
      pingalaGlobal = Math.min(1, pingalaGlobal + 0.05);
      console.log('Пингала +0.05 → ' + pingalaGlobal.toFixed(3));
    } else if (selectedOption.effect_channel === 'ida') {
      idaGlobal = Math.min(1, idaGlobal + 0.05);
      console.log('Ида +0.05 → ' + idaGlobal.toFixed(3));
    }
  } else {
    if (selectedOption.isCorrect) {
      fb.innerHTML = currentGate.success_msg; 
      fb.style.color = '#c9a84c';
      matricesData[currentSelectedMatrix].dust += 10;
    } else {
      fb.innerHTML = currentGate.fail_msg; 
      fb.style.color = '#886666';
    }
  }
  
  if (matricesData[currentSelectedMatrix].dust > 100) matricesData[currentSelectedMatrix].dust = 100;
  
  saveData();
  
  if(matricesData[currentSelectedMatrix].dust >= 100) {
    fb.innerHTML += '<br><br><span style="color: #ffe080;">✦ ПЫЛЬ ДОСТИГЛА 100! ВЕРНИСЬ В ГРИМУАР ДЛЯ КОВКИ ✦</span>';
  }
  
  document.getElementById('mg-close-btn').style.display = 'inline-block';
}

function closeMentalGate() {
  document.getElementById('mental-gate-overlay').style.display = 'none';
  selectMatrix(currentSelectedMatrix);
}

// ══ ФУНКЦИИ СВИТКА СИНТЕЗА ══
function showSynthesisReport() {
  document.getElementById('synthesis-report-overlay').style.display = 'block';
  // Скрываем кнопку накоплений
  const nakopBtn = document.getElementById('nakop-btn');
  if(nakopBtn) nakopBtn.style.display = 'none';
}

function closeSynthesisReport() {
  document.getElementById('synthesis-report-overlay').style.display = 'none';
  // Восстанавливаем кнопку накоплений
  const nakopBtn = document.getElementById('nakop-btn');
  if(nakopBtn) nakopBtn.style.display = 'flex';
}

// ══ ФУНКЦИЯ НАКОПЛЕНИЙ ══
function toggleNakopPanel() {
  const overlay = document.getElementById('nakop-overlay');
  const btn = document.getElementById('nakop-btn');
  if(overlay.style.display === 'none' || !overlay.style.display) {
    overlay.style.display = 'block';
    if(btn) btn.style.display = 'none';
  } else {
    overlay.style.display = 'none';
    if(btn) btn.style.display = 'flex';
  }
}
