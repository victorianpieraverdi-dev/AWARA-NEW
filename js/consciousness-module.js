// Consciousness Entry Module

const questions = [
  {
    id: 1,
    text: "Ты стоишь на пороге.\nЯ — тот, кто уже прошёл этот путь.\n\nГотов ли ты начать?",
    options: [
      { text: "Да, готов", spheres: { will: 20 } },
      { text: "Не уверен", spheres: { ego: 10 } },
      { text: "Что это за игра?", spheres: { mind: 15 } }
    ]
  },
  {
    id: 2,
    text: "Веришь ли ты, что твоя жизнь уже написана звёздами?\nИли ты сам пишешь свою историю?",
    options: [
      { text: "Судьба решает", spheres: { heart: 15 }, natal: true },
      { text: "Я выбираю сам", spheres: { will: 20 }, natal: false },
      { text: "И то, и то", spheres: { mind: 15, heart: 10 }, natal: true }
    ]
  },
  {
    id: 3,
    text: "Когда ты принимаешь важное решение —\nчто говорит громче?",
    options: [
      { text: "Голова (логика)", spheres: { mind: 25 } },
      { text: "Сердце (чувства)", spheres: { heart: 25 } },
      { text: "Оба спорят", spheres: { mind: 15, heart: 15 } }
    ]
  },
  {
    id: 4,
    text: "Сейчас в твоей жизни больше света или тьмы?",
    options: [
      { text: "Много света", spheres: { heart: 20 }, light: 30 },
      { text: "Баланс", spheres: { will: 15 }, light: 15 },
      { text: "Больше тьмы", spheres: { will: 10 }, light: 5 },
      { text: "Не знаю", spheres: { ego: 10 }, light: 10 }
    ]
  },
  {
    id: 5,
    text: "Что привело тебя в эту игру?",
    options: [
      { text: "Любопытство", spheres: { mind: 15 } },
      { text: "Ищу ответы", spheres: { mind: 20, heart: 10 } },
      { text: "Хочу измениться", spheres: { will: 25 } },
      { text: "Просто так", spheres: { ego: 10 } }
    ]
  },
  {
    id: 6,
    text: "В чём твоя настоящая сила?",
    options: [
      { text: "Ум и знания", spheres: { mind: 25 }, archetype: "sage" },
      { text: "Доброта", spheres: { heart: 25 }, archetype: "guardian" },
      { text: "Воля и упорство", spheres: { will: 25 }, archetype: "warrior" },
      { text: "Творчество", spheres: { heart: 20, mind: 10 }, archetype: "creator" },
      { text: "Не знаю пока", spheres: { ego: 10 }, archetype: "wanderer" }
    ]
  },
  {
    id: 7,
    text: "Чего ты боишься больше всего?",
    options: [
      { text: "Одиночества", spheres: { heart: 15 } },
      { text: "Неудачи", spheres: { will: 15 } },
      { text: "Потерять себя", spheres: { ego: 20 } },
      { text: "Боли", spheres: { heart: 10 } },
      { text: "Ничего не боюсь", spheres: { will: 20 } }
    ]
  },
  {
    id: 8,
    text: "Если бы ты мог стать животным на один день — кем бы стал?",
    options: [
      { text: "Хищник (волк, тигр)", spheres: { will: 20 }, kingdom: "Beast", element: "Fire" },
      { text: "Птица (орёл, ворон)", spheres: { mind: 20 }, kingdom: "Avian", element: "Air" },
      { text: "Водное (дельфин, кит)", spheres: { heart: 20 }, kingdom: "Aquatic", element: "Water" },
      { text: "Мудрое (сова, слон)", spheres: { mind: 20, heart: 10 }, kingdom: "Beast", element: "Earth" },
      { text: "Мистическое (дракон, феникс)", spheres: { will: 15, mind: 15 }, kingdom: "Mythic", element: "Ether" }
    ]
  },
  {
    id: 9,
    text: "Если бы ты мог изменить что-то в мире — что бы это было?",
    options: [
      { text: "Больше добра", spheres: { heart: 25 } },
      { text: "Больше справедливости", spheres: { will: 20, mind: 10 } },
      { text: "Больше свободы", spheres: { will: 25 } },
      { text: "Больше красоты", spheres: { heart: 20 } },
      { text: "Больше правды", spheres: { mind: 25 } }
    ]
  },
  {
    id: 10,
    text: "Веришь ли ты, что в мире есть магия?",
    options: [
      { text: "Да, точно есть", spheres: { heart: 25 }, light: 20 },
      { text: "Хочу верить", spheres: { heart: 15, will: 10 }, light: 15 },
      { text: "Не знаю", spheres: { mind: 10 }, light: 5 },
      { text: "Нет, это сказки", spheres: { mind: 20 }, light: 0 }
    ]
  }
];

// State
let currentQuestion = 0;
let playerState = {
  spheres: { mind: 0, ego: 0, will: 0, heart: 0 },
  totalLight: 0,
  answers: [],
  wantsNatal: false,
  archetype: null,
  kingdom: null,
  element: null
};

// Canvas для звёзд
let canvas, ctx;
let stars = [];

function initStars() {
  canvas = document.getElementById('stars-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Создаём звёзды
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      opacity: Math.random(),
      speed: Math.random() * 0.5
    });
  }

  animateStars();
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.fill();

    // Мерцание
    star.opacity += (Math.random() - 0.5) * 0.02;
    star.opacity = Math.max(0.1, Math.min(1, star.opacity));
  });

  requestAnimationFrame(animateStars);
}

// Показать вопрос
function showQuestion(index) {
  if (index >= questions.length) {
    finishQuestionnaire();
    return;
  }

  const q = questions[index];
  const dialogText = document.getElementById('dialog-text');
  const dialogOptions = document.getElementById('dialog-options');

  dialogText.textContent = q.text;
  dialogOptions.innerHTML = '';

  q.options.forEach((option, i) => {
    const btn = document.createElement('div');
    btn.className = 'dialog-option';
    btn.textContent = option.text;
    btn.onclick = () => selectOption(index, i);
    dialogOptions.appendChild(btn);
  });

  updateProgress();
}

// Выбор опции
function selectOption(questionIndex, optionIndex) {
  const q = questions[questionIndex];
  const option = q.options[optionIndex];

  // Сохраняем ответ
  playerState.answers.push({ questionId: q.id, optionIndex });

  // Обновляем сферы
  if (option.spheres) {
    Object.keys(option.spheres).forEach(sphere => {
      playerState.spheres[sphere] += option.spheres[sphere];
      updateSphere(sphere);
    });
  }

  // Обновляем свет
  if (option.light !== undefined) {
    playerState.totalLight += option.light;
  }

  // Сохраняем метаданные
  if (option.natal !== undefined) playerState.wantsNatal = option.natal;
  if (option.archetype) playerState.archetype = option.archetype;
  if (option.kingdom) playerState.kingdom = option.kingdom;
  if (option.element) playerState.element = option.element;

  // Следующий вопрос
  currentQuestion++;
  setTimeout(() => showQuestion(currentQuestion), 800);
}

// Обновить визуал сферы
function updateSphere(sphereName) {
  const sphere = document.getElementById(`sphere-${sphereName}`);
  if (!sphere) return;

  const value = playerState.spheres[sphereName];

  sphere.classList.add('active');

  if (value >= 20) {
    sphere.classList.add('filled');
  }
}

// Обновить прогресс
function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Завершение опроса
function finishQuestionnaire() {
  const dialogText = document.getElementById('dialog-text');
  const dialogOptions = document.getElementById('dialog-options');

  dialogText.textContent = "Первый шаг сделан.\n\nТеперь — инициация.";
  dialogOptions.innerHTML = '';

  // Сохраняем состояние
  localStorage.setItem('awara_consciousness_state', JSON.stringify(playerState));

  // Переход через 3 секунды
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3000);
}

// Инициализация
window.addEventListener('DOMContentLoaded', () => {
  initStars();
  showQuestion(0);
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
