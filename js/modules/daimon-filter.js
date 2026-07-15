// Daimon filtering: score and rank forms based on quiz answers or natal chart

/**
 * Filter daimons by quiz answers (element, archetype, kingdom).
 * @param {Object} quizAnswers - { element, archetype, kingdom }
 * @param {Array} allForms - array of daimon form objects
 * @returns {Array} top 7 forms with scores, sorted by score desc
 */
export function filterDaimonsByQuiz(quizAnswers, allForms) {
  var scored = allForms.map(function(form) {
    var score = 0;

    // Element match: +3
    if (form.element === quizAnswers.element) score += 3;
    // Also check natal_indicators.elements
    if (form.natal_indicators && form.natal_indicators.elements) {
      if (form.natal_indicators.elements.indexOf(quizAnswers.element) !== -1) score += 1;
    }

    // Archetype match: +2
    if (form.archetype === quizAnswers.archetype) score += 2;

    // Kingdom match: +3
    if (form.kingdom === quizAnswers.kingdom) score += 3;

    return { form: form, score: score };
  });

  // Sort by score descending, then by kingdom diversity
  scored.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return 0;
  });

  // Ensure diversity: max 2 from same kingdom in top 7
  var result = [];
  var kingdomCount = {};
  for (var i = 0; i < scored.length && result.length < 7; i++) {
    var k = scored[i].form.kingdom;
    kingdomCount[k] = (kingdomCount[k] || 0) + 1;
    if (kingdomCount[k] <= 2) {
      result.push(scored[i]);
    }
  }

  // If not enough, fill from remaining
  if (result.length < 7) {
    for (var j = 0; j < scored.length && result.length < 7; j++) {
      if (result.indexOf(scored[j]) === -1) {
        result.push(scored[j]);
      }
    }
  }

  // Calculate match percentage
  var maxScore = 9; // element(3+1) + archetype(2) + kingdom(3)
  result.forEach(function(item) {
    item.matchPercent = Math.round((item.score / maxScore) * 100);
  });

  return result;
}

/**
 * Filter daimons by natal chart data.
 * Returns 5 categories with 3 daimons each.
 * @param {Object} natalChart - from calculateNatalChart()
 * @param {Array} allForms - array of daimon form objects
 * @returns {Object} { primary, categories: [{title, daimons}] }
 */
export function filterDaimonsByNatal(natalChart, allForms) {
  // Score each form based on natal chart
  var scored = allForms.map(function(form) {
    var score = 0;
    var reasons = [];
    var ni = form.natal_indicators || {};

    // Lagna sign match
    if (natalChart.lagna && ni.signs) {
      if (ni.signs.indexOf(natalChart.lagna.sign) !== -1) {
        score += 4;
        reasons.push('lagna');
      }
    }

    // Sun sign match
    if (natalChart.sun && ni.signs) {
      if (ni.signs.indexOf(natalChart.sun.sign) !== -1) {
        score += 3;
        reasons.push('sun_sign');
      }
    }

    // Moon sign match
    if (natalChart.moon && ni.signs) {
      if (ni.signs.indexOf(natalChart.moon.sign) !== -1) {
        score += 3;
        reasons.push('moon_sign');
      }
    }

    // Element match (dominant)
    if (natalChart.dominantElement && ni.elements) {
      if (ni.elements.indexOf(natalChart.dominantElement) !== -1) {
        score += 3;
        reasons.push('element');
      }
    }

    // Nakshatra match (Sun)
    if (natalChart.sun && natalChart.sun.nakshatra && ni.nakshatras) {
      if (ni.nakshatras.indexOf(natalChart.sun.nakshatra) !== -1) {
        score += 2;
        reasons.push('sun_nakshatra');
      }
    }

    // Nakshatra match (Moon)
    if (natalChart.moon && natalChart.moon.nakshatra && ni.nakshatras) {
      if (ni.nakshatras.indexOf(natalChart.moon.nakshatra) !== -1) {
        score += 2;
        reasons.push('moon_nakshatra');
      }
    }

    // Planet match
    if (ni.planets) {
      if (natalChart.sun && natalChart.sun.nakshatra_ruler && ni.planets.indexOf(natalChart.sun.nakshatra_ruler) !== -1) {
        score += 1;
        reasons.push('planet');
      }
      if (natalChart.moon && natalChart.moon.nakshatra_ruler && ni.planets.indexOf(natalChart.moon.nakshatra_ruler) !== -1) {
        score += 1;
        reasons.push('planet');
      }
    }

    // Guna match
    if (natalChart.lagna && form.guna) {
      if (natalChart.lagna.guna === form.guna) {
        score += 1;
        reasons.push('guna');
      }
    }

    return { form: form, score: score, reasons: reasons };
  });

  scored.sort(function(a, b) { return b.score - a.score; });

  // Max possible score for percentage
  var maxScore = 20;

  // Primary recommendation
  var primary = scored[0];
  primary.matchPercent = Math.min(100, Math.round((primary.score / maxScore) * 100));

  // Build 5 categories
  var lang = 'en';
  var categories = [
    buildCategory('By Lagna', 'По Лагне', scored, 'lagna', maxScore),
    buildCategory('By Sun', 'По Солнцу', scored, 'sun_sign', maxScore),
    buildCategory('By Moon', 'По Луне', scored, 'moon_sign', maxScore),
    buildCategory('By Element', 'По стихии', scored, 'element', maxScore),
    buildCategory('By Nakshatra', 'По накшатре', scored, 'sun_nakshatra', maxScore)
  ];

  return { primary: primary, categories: categories };
}

function buildCategory(titleEn, titleRu, scored, reasonKey, maxScore) {
  // Get top 3 daimons that have this reason
  var matching = scored.filter(function(s) { return s.reasons.indexOf(reasonKey) !== -1; });
  // Fill with top scored if not enough
  while (matching.length < 3) {
    for (var i = 0; i < scored.length && matching.length < 3; i++) {
      if (matching.indexOf(scored[i]) === -1) matching.push(scored[i]);
    }
  }
  matching = matching.slice(0, 3);
  matching.forEach(function(m) {
    m.matchPercent = Math.min(100, Math.round((m.score / maxScore) * 100));
  });
  return { title: { en: titleEn, ru: titleRu }, daimons: matching };
}
