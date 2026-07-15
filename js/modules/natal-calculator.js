// Vedic (sidereal) natal chart calculator
// Uses Lahiri ayanamsa for sidereal correction
// No external API -- pure ephemeris approximation

const SIGNS = [
  { en: 'Aries',       ru: 'Овен',       element: 'Fire',  guna: 'Rajas' },
  { en: 'Taurus',      ru: 'Телец',      element: 'Earth', guna: 'Tamas' },
  { en: 'Gemini',      ru: 'Близнецы',   element: 'Air',   guna: 'Sattva' },
  { en: 'Cancer',      ru: 'Рак',        element: 'Water', guna: 'Rajas' },
  { en: 'Leo',         ru: 'Лев',        element: 'Fire',  guna: 'Tamas' },
  { en: 'Virgo',       ru: 'Дева',       element: 'Earth', guna: 'Sattva' },
  { en: 'Libra',       ru: 'Весы',       element: 'Air',   guna: 'Rajas' },
  { en: 'Scorpio',     ru: 'Скорпион',   element: 'Water', guna: 'Tamas' },
  { en: 'Sagittarius', ru: 'Стрелец',    element: 'Fire',  guna: 'Sattva' },
  { en: 'Capricorn',   ru: 'Козерог',    element: 'Earth', guna: 'Rajas' },
  { en: 'Aquarius',    ru: 'Водолей',    element: 'Air',   guna: 'Tamas' },
  { en: 'Pisces',      ru: 'Рыбы',       element: 'Water', guna: 'Sattva' }
];

const NAKSHATRAS = [
  { en: 'Ashvini',            ru: 'Ашвини',             ruler: 'Ketu' },
  { en: 'Bharani',            ru: 'Бхарани',            ruler: 'Venus' },
  { en: 'Krittika',           ru: 'Криттика',           ruler: 'Sun' },
  { en: 'Rohini',             ru: 'Рохини',             ruler: 'Moon' },
  { en: 'Mrigashira',         ru: 'Мригашира',          ruler: 'Mars' },
  { en: 'Ardra',              ru: 'Ардра',              ruler: 'Rahu' },
  { en: 'Punarvasu',          ru: 'Пунарвасу',          ruler: 'Jupiter' },
  { en: 'Pushya',             ru: 'Пушья',              ruler: 'Saturn' },
  { en: 'Ashlesha',           ru: 'Ашлеша',             ruler: 'Mercury' },
  { en: 'Magha',              ru: 'Магха',              ruler: 'Ketu' },
  { en: 'Purva_Phalguni',     ru: 'Пурва Пхалгуни',    ruler: 'Venus' },
  { en: 'Uttara_Phalguni',    ru: 'Уттара Пхалгуни',   ruler: 'Sun' },
  { en: 'Hasta',              ru: 'Хаста',              ruler: 'Moon' },
  { en: 'Chitra',             ru: 'Читра',              ruler: 'Mars' },
  { en: 'Swati',              ru: 'Свати',              ruler: 'Rahu' },
  { en: 'Vishakha',           ru: 'Вишакха',            ruler: 'Jupiter' },
  { en: 'Anuradha',           ru: 'Анурадха',           ruler: 'Saturn' },
  { en: 'Jyeshtha',           ru: 'Джьештха',           ruler: 'Mercury' },
  { en: 'Mula',               ru: 'Мула',               ruler: 'Ketu' },
  { en: 'Purva_Ashadha',      ru: 'Пурва Ашадха',      ruler: 'Venus' },
  { en: 'Uttara_Ashadha',     ru: 'Уттара Ашадха',     ruler: 'Sun' },
  { en: 'Shravana',           ru: 'Шравана',            ruler: 'Moon' },
  { en: 'Dhanishta',          ru: 'Дханишта',           ruler: 'Mars' },
  { en: 'Shatabhisha',        ru: 'Шатабхиша',          ruler: 'Rahu' },
  { en: 'Purva_Bhadrapada',   ru: 'Пурва Бхадрапада',  ruler: 'Jupiter' },
  { en: 'Uttara_Bhadrapada',  ru: 'Уттара Бхадрапада', ruler: 'Saturn' },
  { en: 'Revati',             ru: 'Ревати',             ruler: 'Mercury' }
];

// Julian Day Number from calendar date
function toJD(year, month, day, hour) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + (hour || 0) / 24.0 + B - 1524.5;
}

// Lahiri ayanamsa approximation (degrees)
function lahiriAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.856 + 0.01396971 * (jd - 2451545.0) / 365.25;
}

// Tropical Sun longitude (simplified VSOP87 approximation)
function tropicalSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  return ((L0 + C) % 360 + 360) % 360;
}

// Simplified Moon longitude (accuracy ~1-2 degrees)
function tropicalMoonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = 218.3165 + 481267.8813 * T;
  const D  = 297.8502 + 445267.1115 * T;
  const M  = 357.5291 + 35999.0503 * T;
  const Mp = 134.9634 + 477198.8676 * T;
  const F  = 93.2720  + 483202.0175 * T;
  const toRad = (d) => d * Math.PI / 180;
  let lon = Lp
    + 6.289 * Math.sin(toRad(Mp))
    - 1.274 * Math.sin(toRad(2 * D - Mp))
    + 0.658 * Math.sin(toRad(2 * D))
    + 0.214 * Math.sin(toRad(2 * Mp))
    - 0.186 * Math.sin(toRad(M))
    - 0.114 * Math.sin(toRad(2 * F));
  return ((lon % 360) + 360) % 360;
}

// Ascendant (Lagna) calculation
function calculateAscendant(jd, latitude, longitude) {
  const T = (jd - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time (degrees)
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
           + 0.000387933 * T * T;
  GMST = ((GMST % 360) + 360) % 360;
  // Local Sidereal Time
  const LST = ((GMST + longitude) % 360 + 360) % 360;
  const LSTrad = LST * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  // Obliquity of ecliptic
  const eps = (23.4393 - 0.01300 * T) * Math.PI / 180;
  // Ascendant formula
  const asc = Math.atan2(
    Math.cos(LSTrad),
    -(Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(LSTrad))
  ) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
}

// Degree to sign index (0-11)
function degreeToSignIndex(deg) {
  return Math.floor(((deg % 360) + 360) % 360 / 30);
}

// Degree to nakshatra index (0-26)
function degreeToNakshatraIndex(deg) {
  return Math.floor(((deg % 360) + 360) % 360 / (360 / 27));
}

// Degree within sign
function degreeInSign(deg) {
  return ((deg % 360) + 360) % 360 % 30;
}

// House number from degree (whole-sign houses from ascendant)
function houseFromDegree(planetDeg, ascDeg) {
  const diff = ((planetDeg - ascDeg) % 360 + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

/**
 * Calculate a basic Vedic natal chart.
 * @param {Object} params
 * @param {string} params.date - ISO date string "YYYY-MM-DD"
 * @param {string} [params.time] - "HH:MM" (24h). If omitted, noon is used.
 * @param {string} [params.timezone] - "+HH:MM" or "-HH:MM". Default "+00:00"
 * @param {number} [params.latitude] - decimal degrees
 * @param {number} [params.longitude] - decimal degrees
 * @returns {Object} natal chart data
 */
export function calculateNatalChart(params) {
  const { date, time, timezone, latitude, longitude } = params;

  // Parse date
  const [year, month, day] = date.split('-').map(Number);

  // Parse time (default noon)
  let hours = 12, minutes = 0;
  if (time) {
    const parts = time.split(':').map(Number);
    hours = parts[0];
    minutes = parts[1] || 0;
  }

  // Parse timezone offset (default UTC)
  let tzOffset = 0;
  if (timezone) {
    const match = timezone.match(/([+-])(\d{2}):(\d{2})/);
    if (match) {
      tzOffset = (parseInt(match[2]) + parseInt(match[3]) / 60) * (match[1] === '-' ? -1 : 1);
    }
  }

  // Convert to UT
  const utHour = hours + minutes / 60 - tzOffset;
  const jd = toJD(year, month, day, utHour);
  const ayanamsa = lahiriAyanamsa(jd);

  // Tropical longitudes
  const tropSun = tropicalSunLongitude(jd);
  const tropMoon = tropicalMoonLongitude(jd);

  // Sidereal longitudes
  const sidSun = ((tropSun - ayanamsa) % 360 + 360) % 360;
  const sidMoon = ((tropMoon - ayanamsa) % 360 + 360) % 360;

  // Sun
  const sunSignIdx = degreeToSignIndex(sidSun);
  const sunSign = SIGNS[sunSignIdx];
  const sunNakIdx = degreeToNakshatraIndex(sidSun);

  // Moon
  const moonSignIdx = degreeToSignIndex(sidMoon);
  const moonSign = SIGNS[moonSignIdx];
  const moonNakIdx = degreeToNakshatraIndex(sidMoon);

  // Lagna (needs lat/lon)
  let lagna = null;
  if (latitude != null && longitude != null && time) {
    const tropAsc = calculateAscendant(jd, latitude, longitude);
    const sidAsc = ((tropAsc - ayanamsa) % 360 + 360) % 360;
    const lagnaIdx = degreeToSignIndex(sidAsc);
    lagna = {
      sign: SIGNS[lagnaIdx].en,
      sign_ru: SIGNS[lagnaIdx].ru,
      degree: Math.round(degreeInSign(sidAsc)),
      element: SIGNS[lagnaIdx].element,
      guna: SIGNS[lagnaIdx].guna,
      index: lagnaIdx
    };
  }

  const result = {
    sun: {
      sign: sunSign.en,
      sign_ru: sunSign.ru,
      degree: Math.round(degreeInSign(sidSun)),
      element: sunSign.element,
      guna: sunSign.guna,
      nakshatra: NAKSHATRAS[sunNakIdx].en,
      nakshatra_ru: NAKSHATRAS[sunNakIdx].ru,
      nakshatra_ruler: NAKSHATRAS[sunNakIdx].ruler,
      house: lagna ? houseFromDegree(sidSun, degreeToSignIndex(lagna.index * 30) * 30) : null
    },
    moon: {
      sign: moonSign.en,
      sign_ru: moonSign.ru,
      degree: Math.round(degreeInSign(sidMoon)),
      element: moonSign.element,
      guna: moonSign.guna,
      nakshatra: NAKSHATRAS[moonNakIdx].en,
      nakshatra_ru: NAKSHATRAS[moonNakIdx].ru,
      nakshatra_ruler: NAKSHATRAS[moonNakIdx].ruler,
      house: lagna ? houseFromDegree(sidMoon, lagna.index * 30) : null
    },
    lagna: lagna,
    ayanamsa: Math.round(ayanamsa * 100) / 100,
    jd: jd
  };

  // Dominant element analysis
  const elements = {};
  [result.sun.element, result.moon.element].forEach(e => {
    elements[e] = (elements[e] || 0) + 1;
  });
  if (lagna) elements[lagna.element] = (elements[lagna.element] || 0) + 1;
  result.dominantElement = Object.entries(elements)
    .sort((a, b) => b[1] - a[1])[0][0];

  return result;
}

export { SIGNS, NAKSHATRAS };
