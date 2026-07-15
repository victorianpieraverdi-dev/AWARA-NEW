const STORAGE_DOSHA = 'awara_dosha';

const ELEMENTS = ['Огонь', 'Земля', 'Воздух', 'Вода', 'Эфир'];
const SIGN_ELEMENTS = [
  'Огонь', 'Земля', 'Воздух', 'Вода',
  'Огонь', 'Земля', 'Воздух', 'Вода',
  'Огонь', 'Земля', 'Воздух', 'Вода'
];

function createScores() {
  return ELEMENTS.reduce(function(acc, element) {
    acc[element] = 0;
    return acc;
  }, {});
}

function addScore(scores, element, weight) {
  scores[element] += weight;
}

function toBreakdown(scores) {
  const total = ELEMENTS.reduce(function(sum, element) {
    return sum + scores[element];
  }, 0);

  return ELEMENTS.map(function(element) {
    const score = scores[element];
    return {
      element,
      score,
      percent: total ? Math.round((score / total) * 100) : 0
    };
  });
}

export function calculateDosha(chart) {
  const scores = createScores();

  if (typeof chart.ascSign === 'number') {
    addScore(scores, SIGN_ELEMENTS[chart.ascSign], 3);
  }

  for (const planet of chart.planets || []) {
    if (planet.id === 'rahu' || planet.id === 'ketu') {
      addScore(scores, 'Эфир', 1);
      continue;
    }

    const weight = planet.id === 'sun' || planet.id === 'moon' ? 3 : 2;
    addScore(scores, SIGN_ELEMENTS[planet.sign], weight);
  }

  const elements = toBreakdown(scores);
  const dominant = elements.reduce(function(max, item) {
    return item.score > max.score ? item : max;
  }, elements[0]);

  return {
    elements,
    dominant,
    totalWeight: elements.reduce(function(sum, item) { return sum + item.score; }, 0)
  };
}

export function saveDosha(dosha) {
  localStorage.setItem(STORAGE_DOSHA, JSON.stringify(dosha));
}

export function renderDoshaHtml(dosha) {
  let html = '<div class="dosha-block">';
  html += '<div class="section-title">КОНСТИТУЦИЯ (ПАНЧА-БХУТА)</div>';
  html += '<div class="dosha-dominant">Доминантная стихия: <span>' + dosha.dominant.element + ' · ' + dosha.dominant.percent + '%</span></div>';
  html += '<div class="dosha-grid">';

  for (const item of dosha.elements) {
    html += '<div class="dosha-row">';
    html += '<div class="dosha-meta"><span>' + item.element + '</span><b>' + item.percent + '%</b></div>';
    html += '<div class="dosha-bar"><i style="width:' + item.percent + '%"></i></div>';
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}
