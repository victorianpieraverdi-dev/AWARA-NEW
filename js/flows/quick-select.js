// Quick Select flow: 3 questions -> filter daimons -> gallery
import { t, getLang } from '../i18n.js';
import { filterDaimonsByQuiz } from '../modules/daimon-filter.js';
import { showDaimonGallery } from '../components/daimon-card.js';

const QUESTIONS = [
  {
    key: 'element',
    title: { en: 'Which element calls to you?', ru: 'Какая стихия тебе ближе?' },
    options: [
      { value: 'Fire',  label: { en: 'Fire',  ru: 'Огонь' },  desc: { en: 'Passion, transformation', ru: 'Страсть, трансформация' } },
      { value: 'Water', label: { en: 'Water', ru: 'Вода' },   desc: { en: 'Intuition, depth',       ru: 'Интуиция, глубина' } },
      { value: 'Air',   label: { en: 'Air',   ru: 'Воздух' }, desc: { en: 'Freedom, thought',       ru: 'Свобода, мысль' } },
      { value: 'Earth', label: { en: 'Earth', ru: 'Земля' },  desc: { en: 'Stability, strength',    ru: 'Стабильность, сила' } },
      { value: 'Ether', label: { en: 'Ether', ru: 'Эфир' },   desc: { en: 'Spirit, connection',     ru: 'Дух, связь' } }
    ]
  },
  {
    key: 'archetype',
    title: { en: 'Which archetype resonates?', ru: 'Какой архетип резонирует?' },
    options: [
      { value: 'Guardian',  label: { en: 'Guardian',  ru: 'Страж' },     desc: { en: 'Protection, boundaries', ru: 'Защита, границы' } },
      { value: 'Sage',      label: { en: 'Sage',      ru: 'Мудрец' },    desc: { en: 'Knowledge, wisdom',      ru: 'Знание, мудрость' } },
      { value: 'Healer',    label: { en: 'Healer',    ru: 'Целитель' },  desc: { en: 'Restoration, harmony',   ru: 'Восстановление, гармония' } },
      { value: 'Wanderer',  label: { en: 'Wanderer',  ru: 'Странник' },  desc: { en: 'Exploration, freedom',   ru: 'Исследование, свобода' } },
      { value: 'Alchemist', label: { en: 'Alchemist', ru: 'Алхимик' },   desc: { en: 'Transformation, craft',  ru: 'Трансформация, мастерство' } },
      { value: 'Sovereign', label: { en: 'Sovereign', ru: 'Властелин' }, desc: { en: 'Leadership, order',      ru: 'Лидерство, порядок' } }
    ]
  },
  {
    key: 'kingdom',
    title: { en: 'Which kingdom attracts you?', ru: 'Какое царство привлекает?' },
    options: [
      { value: 'Beast',   label: { en: 'Beasts',    ru: 'Звери' },      desc: { en: 'Power, instinct',     ru: 'Сила, инстинкт' } },
      { value: 'Avian',   label: { en: 'Avian',     ru: 'Птицы' },      desc: { en: 'Vision, sky',         ru: 'Зрение, небо' } },
      { value: 'Aquatic', label: { en: 'Aquatic',   ru: 'Водные' },     desc: { en: 'Depth, flow',         ru: 'Глубина, поток' } },
      { value: 'Serpent', label: { en: 'Serpents',   ru: 'Змеи' },       desc: { en: 'Wisdom, rebirth',     ru: 'Мудрость, перерождение' } },
      { value: 'Flora',   label: { en: 'Flora',     ru: 'Растения' },   desc: { en: 'Growth, patience',    ru: 'Рост, терпение' } },
      { value: 'Crystal', label: { en: 'Crystals',  ru: 'Кристаллы' },  desc: { en: 'Clarity, resonance',  ru: 'Ясность, резонанс' } },
      { value: 'Mythic',  label: { en: 'Mythic',    ru: 'Мифические' }, desc: { en: 'Transcendence, magic',ru: 'Трансцендентность, магия' } }
    ]
  }
];

var currentStep = 0;
var answers = {};

export function initQuickSelect(container) {
  currentStep = 0;
  answers = {};
  renderQuestion(container);
}

function renderQuestion(container) {
  var q = QUESTIONS[currentStep];
  var lang = getLang();
  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';
  html += '<div class="quiz-progress">' + (currentStep + 1) + ' / ' + QUESTIONS.length + '</div>';
  html += '<div class="quiz-question">' + q.title[lang] + '</div>';
  html += '<div class="quiz-options">';
  q.options.forEach(function(opt) {
    var sel = answers[q.key] === opt.value ? ' selected' : '';
    html += '<div class="quiz-option' + sel + '" data-value="' + opt.value + '">';
    html += '<div class="quiz-option-title">' + opt.label[lang] + '</div>';
    html += '<div class="quiz-option-desc">' + opt.desc[lang] + '</div>';
    html += '</div>';
  });
  html += '</div>';

  if (currentStep > 0) {
    html += '<button class="flow-back" style="margin-top:16px" id="quiz-prev">&larr; PREV</button>';
  }

  container.innerHTML = html;

  // Bind option clicks
  container.querySelectorAll('.quiz-option').forEach(function(el) {
    el.addEventListener('click', function() {
      container.querySelectorAll('.quiz-option').forEach(function(o) { o.classList.remove('selected'); });
      el.classList.add('selected');
      answers[q.key] = el.dataset.value;

      // Auto-advance after short delay
      setTimeout(function() {
        if (currentStep < QUESTIONS.length - 1) {
          currentStep++;
          renderQuestion(container);
        } else {
          showResults(container);
        }
      }, 350);
    });
  });

  // Prev button
  var prev = container.querySelector('#quiz-prev');
  if (prev) {
    prev.addEventListener('click', function(e) {
      e.stopPropagation();
      currentStep--;
      renderQuestion(container);
    });
  }
}

async function showResults(container) {
  container.innerHTML = '<div style="text-align:center;color:var(--text-mute);padding:40px;">Loading...</div>';

  try {
    var resp = await fetch('../data/daimons/daimon_forms.json');
    var data = await resp.json();
    var filtered = filterDaimonsByQuiz(answers, data.forms);
    var results = document.getElementById('results-container');
    container.classList.add('hidden');
    results.classList.remove('hidden');
    showDaimonGallery(results, filtered, 'quick');
  } catch (err) {
    container.innerHTML = '<div style="color:#ff4444;text-align:center;">Error loading daimon data</div>';
  }
}
