// Natal Chart flow: form -> calculate -> display -> filter daimons
import { getLang } from '../i18n.js';
import { calculateNatalChart } from '../modules/natal-calculator.js';
import { filterDaimonsByNatal } from '../modules/daimon-filter.js';
import { showNatalGallery } from '../components/daimon-card.js';

export function initNatalFlow(container) {
  renderForm(container);
}

function renderForm(container) {
  var lang = getLang();
  var labels = {
    date:     lang === 'ru' ? 'Дата рождения *'          : 'Birth Date *',
    time:     lang === 'ru' ? 'Время рождения'            : 'Birth Time',
    noTime:   lang === 'ru' ? 'Не знаю точное время'      : "Don't know exact time",
    lat:      lang === 'ru' ? 'Широта'                     : 'Latitude',
    lon:      lang === 'ru' ? 'Долгота'                    : 'Longitude',
    tz:       lang === 'ru' ? 'Часовой пояс'               : 'Timezone',
    skipLoc:  lang === 'ru' ? 'Не хочу указывать'          : 'Skip location',
    accuracy: lang === 'ru' ? 'Точность'                   : 'Accuracy',
    privacy:  lang === 'ru' ? 'Данные не сохраняются'      : 'Data not stored',
    submit:   lang === 'ru' ? 'РАССЧИТАТЬ КАРТУ'           : 'CALCULATE CHART'
  };

  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';
  html += '<form class="natal-form" id="natal-form">';

  // Date
  html += '<div class="form-group">';
  html += '<label class="form-label">' + labels.date + '</label>';
  html += '<input type="date" class="form-input" name="date" required>';
  html += '</div>';

  // Time
  html += '<div class="form-group">';
  html += '<label class="form-label">' + labels.time + '</label>';
  html += '<input type="time" class="form-input" name="time" id="natal-time">';
  html += '<label class="form-checkbox"><input type="checkbox" id="unknown-time"> ' + labels.noTime + '</label>';
  html += '</div>';

  // Timezone
  html += '<div class="form-group">';
  html += '<label class="form-label">' + labels.tz + '</label>';
  html += '<select class="form-input" name="timezone">';
  for (var i = -12; i <= 14; i++) {
    var sign = i >= 0 ? '+' : '';
    var pad = Math.abs(i) < 10 ? '0' : '';
    var val = sign + pad + Math.abs(i) + ':00';
    var sel = i === 3 ? ' selected' : ''; // Default Moscow
    html += '<option value="' + val + '"' + sel + '>UTC' + val + '</option>';
  }
  html += '</select>';
  html += '</div>';

  // Location
  html += '<div class="form-group" id="loc-group">';
  html += '<label class="form-label">' + labels.lat + '</label>';
  html += '<input type="number" step="0.01" class="form-input" name="latitude" placeholder="55.75">';
  html += '<label class="form-label" style="margin-top:8px">' + labels.lon + '</label>';
  html += '<input type="number" step="0.01" class="form-input" name="longitude" placeholder="37.62">';
  html += '<label class="form-checkbox"><input type="checkbox" id="skip-location"> ' + labels.skipLoc + '</label>';
  html += '</div>';

  // Accuracy meter
  html += '<div class="accuracy-meter">';
  html += '<div class="accuracy-label">' + labels.accuracy + ': <span id="acc-val">50%</span></div>';
  html += '<div class="meter-bar"><div class="meter-fill" id="acc-fill" style="width:50%"></div></div>';
  html += '</div>';

  // Privacy note
  html += '<div class="privacy-note">' + labels.privacy + '</div>';

  // Submit
  html += '<button type="submit" class="submit-btn">' + labels.submit + '</button>';
  html += '</form>';

  container.innerHTML = html;

  // Bind events
  var form = document.getElementById('natal-form');
  var unknownTime = document.getElementById('unknown-time');
  var skipLoc = document.getElementById('skip-location');
  var timeInput = document.getElementById('natal-time');

  unknownTime.addEventListener('change', function() {
    timeInput.disabled = unknownTime.checked;
    if (unknownTime.checked) timeInput.value = '';
    updateAccuracy(form);
  });

  skipLoc.addEventListener('change', function() {
    var locGroup = document.getElementById('loc-group');
    locGroup.querySelectorAll('input[type=number]').forEach(function(inp) {
      inp.disabled = skipLoc.checked;
      if (skipLoc.checked) inp.value = '';
    });
    updateAccuracy(form);
  });

  // Update accuracy on any input change
  form.querySelectorAll('input, select').forEach(function(inp) {
    inp.addEventListener('change', function() { updateAccuracy(form); });
    inp.addEventListener('input', function() { updateAccuracy(form); });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    processNatalForm(form, container);
  });
}

function updateAccuracy(form) {
  var fd = new FormData(form);
  var acc = 30; // base for date only
  if (fd.get('date')) acc = 40;
  if (fd.get('time') && !document.getElementById('unknown-time').checked) acc += 30;
  if (fd.get('latitude') && fd.get('longitude') && !document.getElementById('skip-location').checked) acc += 25;
  if (fd.get('timezone')) acc += 5;
  acc = Math.min(100, acc);
  var valEl = document.getElementById('acc-val');
  var fillEl = document.getElementById('acc-fill');
  if (valEl) valEl.textContent = acc + '%';
  if (fillEl) fillEl.style.width = acc + '%';
}

async function processNatalForm(form, container) {
  var fd = new FormData(form);
  var params = {
    date: fd.get('date'),
    time: fd.get('time') || null,
    timezone: fd.get('timezone') || '+03:00'
  };
  if (fd.get('latitude') && fd.get('longitude')) {
    params.latitude = parseFloat(fd.get('latitude'));
    params.longitude = parseFloat(fd.get('longitude'));
  }

  var chart = calculateNatalChart(params);

  // Show chart result
  showChartResult(container, chart);
}

function showChartResult(container, chart) {
  var lang = getLang();
  var titleText = lang === 'ru' ? 'Ваша натальная карта' : 'Your Natal Chart';
  var continueText = lang === 'ru' ? 'ВЫБРАТЬ ДАЙМОНА' : 'CHOOSE DAIMON';
  var sunLabel = lang === 'ru' ? 'Солнце' : 'Sun';
  var moonLabel = lang === 'ru' ? 'Луна' : 'Moon';
  var lagnaLabel = lang === 'ru' ? 'Лагна' : 'Lagna';
  var elementLabel = lang === 'ru' ? 'Стихия' : 'Element';

  var html = '<button class="flow-back" onclick="backToMethodSelect()">&larr; BACK</button>';
  html += '<div class="natal-result">';
  html += '<h2>' + titleText + '</h2>';
  html += '<div class="chart-summary">';

  // Sun
  html += '<div class="planet-row">';
  html += '<span class="planet">' + sunLabel + '</span>';
  html += '<span class="sign">' + (lang === 'ru' ? chart.sun.sign_ru : chart.sun.sign) + ' ' + chart.sun.degree + '</span>';
  html += '<span class="house">' + (chart.sun.nakshatra || '') + '</span>';
  html += '</div>';

  // Moon
  html += '<div class="planet-row">';
  html += '<span class="planet">' + moonLabel + '</span>';
  html += '<span class="sign">' + (lang === 'ru' ? chart.moon.sign_ru : chart.moon.sign) + ' ' + chart.moon.degree + '</span>';
  html += '<span class="house">' + (chart.moon.nakshatra || '') + '</span>';
  html += '</div>';

  // Lagna
  if (chart.lagna) {
    html += '<div class="planet-row">';
    html += '<span class="planet">' + lagnaLabel + '</span>';
    html += '<span class="sign">' + (lang === 'ru' ? chart.lagna.sign_ru : chart.lagna.sign) + ' ' + chart.lagna.degree + '</span>';
    html += '<span class="house">' + chart.lagna.element + '</span>';
    html += '</div>';
  }

  // Dominant element
  html += '<div class="planet-row">';
  html += '<span class="planet">' + elementLabel + '</span>';
  html += '<span class="sign">' + chart.dominantElement + '</span>';
  html += '<span class="house"></span>';
  html += '</div>';

  html += '</div>'; // chart-summary

  html += '<button class="submit-btn" id="continue-to-daimons">' + continueText + '</button>';
  html += '</div>';

  container.innerHTML = html;

  document.getElementById('continue-to-daimons').addEventListener('click', async function() {
    container.innerHTML = '<div style="text-align:center;color:var(--text-mute);padding:40px;">Loading...</div>';
    try {
      var resp = await fetch('../data/daimons/daimon_forms.json');
      var data = await resp.json();
      var natalResult = filterDaimonsByNatal(chart, data.forms);
      var results = document.getElementById('results-container');
      container.classList.add('hidden');
      results.classList.remove('hidden');
      showNatalGallery(results, natalResult, 'natal');
    } catch (err) {
      container.innerHTML = '<div style="color:#ff4444;text-align:center;">Error loading daimon data</div>';
    }
  });
}
