/* ============================================================
   AWARA · js/daimonCosmos.js
   «Космос Даймона» — генеративная орбитальная визуализация,
   адаптированная под активную Линзу (матрицу восприятия) игрока.
   См. docs/daimon-cosmos-tigel.md (Часть II–III).

   Чистый vanilla JS + Canvas, без зависимостей и без сборки.
   Глобальный API (в стиле awara-lens-styles.js):
     window.DaimonCosmos.mount(hostEl, daimon, opts)
       opts: { mera: MERA из js/daimonAscent.js (желательно),
               granthi: {brahma,vishnu,rudra} из getGranthiStatus(),
               lensSlug: явная линза (иначе автоопределение) }
     window.DaimonCosmos.detectLensSlug()
     window.DaimonCosmos.getCosmosSeed(daimon)
     window.DaimonCosmos.destroy()

   Канон: цвета 9 Мер — из daimonAscent.js MERA (передаются через opts,
   локальная копия ниже — только страховка). Палитра/мотивы линзы —
   из data/lens_styles.json через window.lensStyleFor (awara-lens-styles.js).
   ============================================================ */
(function () {
'use strict';
if (window.DaimonCosmos) return;

/* --- Страховочное зеркало MERA (истина живёт в js/daimonAscent.js) --- */
var MERA_FALLBACK = [
	{ mera: 1, chakra: 'Муладхара',   color: '#e23b3b' },
	{ mera: 2, chakra: 'Свадхистхана', color: '#f3892b' },
	{ mera: 3, chakra: 'Манипура',    color: '#f6d033' },
	{ mera: 4, chakra: 'Анахата',     color: '#46c46a' },
	{ mera: 5, chakra: 'Вишуддха',    color: '#34c6d8' },
	{ mera: 6, chakra: 'Аджна',       color: '#3b6fe2' },
	{ mera: 7, chakra: 'Сахасрара',   color: '#9b4ff3' },
	{ mera: 8, chakra: 'Монада',      color: '#b9c4e0' },
	{ mera: 9, chakra: 'Абсолют',     color: '#cdb9f0' }
];

/* --- RU-имя матрицы (MATKEYS в tigel-app.html) -> slug lens_styles.json.
       Порядок = SLUG_ARR в awara-lens.js. --- */
var LENS_RU = ['Ведическая','Таро','Каббала','Герметизм','Славянская','Гностицизм','Даосизм','И-Цзин','Египетская','Майя','Ацтеки','Кельтская','Скандинавская','Шаманская','Буддийская','Суфийская','Христианская','Атлантическая','Шамбала','Генные Ключи','Астрологическая','Космическая','Шинто','Шумерская','Зороастрийская','Африканская','Йоруба','Тантрическая','Постчеловеческая','Техномагия','Адвайта','Византийская','Орфическая'];
var LENS_SLUGS = ['vedic','tarot_arcanic','kabbalistic','hermetic_alchemical','slavic','gnostic','daoist','chinese_iching','egyptian','mayan','aztec_mexica','celtic','norse','shamanic','buddhist_mahayana','islamic_sufi_nur','christian_mystical_grail','atlantean_lemurian','shambhala','gene_keys','astrological','cosmic_galactic','shinto','sumerian_babylonian','zoroastrian','afro_dogon','yoruba_ifa_orisha','tantric_kashmiri','posthuman_ai_sophianic','technomagical','advaita_siddha','julian_byzantine','antique_greco_roman'];
var RU2SLUG = {}, SLUG2RU = {};
LENS_RU.forEach(function (n, i) { RU2SLUG[n] = LENS_SLUGS[i]; SLUG2RU[LENS_SLUGS[i]] = n; });

/* --- Визуальная трактовка каждой линзы: мотив-глиф + тип частиц + плотность.
       Мотивы — процедурные (рисуются кодом ниже), см. motifs из lens_styles.json. --- */
var LENS_FX = {
	vedic:                    { motif: 'lotus',       particle: 'ember',  density: 1.0 },
	tarot_arcanic:            { motif: 'cardframe',   particle: 'dust',   density: 0.8 },
	kabbalistic:              { motif: 'sefirot',     particle: 'dust',   density: 0.8 },
	hermetic_alchemical:      { motif: 'alchemy',     particle: 'ember',  density: 0.8 },
	slavic:                   { motif: 'kolovrat',    particle: 'ember',  density: 0.9 },
	gnostic:                  { motif: 'spiral',      particle: 'dust',   density: 0.9 },
	daoist:                   { motif: 'yinyang',     particle: 'mist',   density: 0.6 },
	chinese_iching:           { motif: 'hexagram',    particle: 'dust',   density: 0.7 },
	egyptian:                 { motif: 'ankh',        particle: 'dust',   density: 0.8 },
	mayan:                    { motif: 'ziggurat',    particle: 'dust',   density: 0.8 },
	aztec_mexica:             { motif: 'sunstone',    particle: 'ember',  density: 1.0 },
	celtic:                   { motif: 'triskelion',  particle: 'mist',   density: 0.7 },
	norse:                    { motif: 'rune',        particle: 'snow',   density: 0.9 },
	shamanic:                 { motif: 'drum',        particle: 'ember',  density: 0.9 },
	buddhist_mahayana:        { motif: 'mandala',     particle: 'dust',   density: 0.8 },
	islamic_sufi_nur:         { motif: 'crescent',    particle: 'dust',   density: 0.8 },
	christian_mystical_grail: { motif: 'grail',       particle: 'dust',   density: 0.8 },
	atlantean_lemurian:       { motif: 'crystal',     particle: 'bubble', density: 0.9 },
	shambhala:                { motif: 'mountain',    particle: 'snow',   density: 0.8 },
	gene_keys:                { motif: 'dna',         particle: 'dust',   density: 0.9 },
	astrological:             { motif: 'zodiac',      particle: 'dust',   density: 0.8 },
	cosmic_galactic:          { motif: 'spiral',      particle: 'stars',  density: 1.0 },
	shinto:                   { motif: 'torii',       particle: 'petal',  density: 0.8 },
	sumerian_babylonian:      { motif: 'ziggurat',    particle: 'dust',   density: 0.8 },
	zoroastrian:              { motif: 'flame',       particle: 'ember',  density: 1.0 },
	afro_dogon:               { motif: 'mask',        particle: 'dust',   density: 0.8 },
	yoruba_ifa_orisha:        { motif: 'cowrie',      particle: 'ember',  density: 0.9 },
	tantric_kashmiri:         { motif: 'yantra',      particle: 'ember',  density: 1.0 },
	posthuman_ai_sophianic:   { motif: 'neural',      particle: 'data',   density: 1.0 },
	technomagical:            { motif: 'circuit',     particle: 'data',   density: 1.0 },
	advaita_siddha:           { motif: 'halo',        particle: 'dust',   density: 0.35 },
	julian_byzantine:         { motif: 'cross',       particle: 'dust',   density: 0.7 },
	antique_greco_roman:      { motif: 'laurel',      particle: 'dust',   density: 0.7 }
};
var FX_DEFAULT = { motif: 'star4', particle: 'dust', density: 0.7 };
var STYLE_FALLBACK = { palette: ['#c9a84c', '#7c3aed', '#fff8d6'], motifs: '', art: '', tone: '' };

/* --- Глифы форм накшатр (как FORM_GLYPHS в daimon.html) --- */
var FORM_GLYPHS = {
	stag: '\u{1F98C}', phoenix: '\u{1F525}', swan: '\u{1F9A2}', dolphin: '\u{1F42C}',
	naga: '\u{1F40D}', lion: '\u{1F981}', tiger: '\u{1F405}', bear: '\u{1F43B}',
	raven: '\u{1F426}', unicorn: '\u{1F984}', owl: '\u{1F989}', dragon: '\u{1F409}',
	kirin: '\u{1F984}', eagle: '\u{1F985}', garuda: '\u{1F985}', wolf: '\u{1F43A}',
	deer: '\u{1F98C}', elephant: '\u{1F418}'
};

/* --- 3 Грантхи-врат: на Мерах их канонических чакр (см. daimonAscent.js /
       GRANTHI_REQ в daimon.html: brahma→Анахата(4), vishnu→Вишуддха(5), rudra→Аджна(6)) --- */
var GATES = [
	{ id: 'brahma', ring: 4, angle: 2.30 },
	{ id: 'vishnu', ring: 5, angle: 4.35 },
	{ id: 'rudra',  ring: 6, angle: 0.35 }
];

/* ================= утилиты ================= */
function hexRgb(hex) {
	var h = String(hex || '').replace('#', '');
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	var n = parseInt(h, 16);
	if (isNaN(n)) return { r: 201, g: 168, b: 76 };
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function mix(a, b, t) {
	var c1 = hexRgb(a), c2 = hexRgb(b);
	var r = Math.round(c1.r + (c2.r - c1.r) * t);
	var g = Math.round(c1.g + (c2.g - c1.g) * t);
	var bl = Math.round(c1.b + (c2.b - c1.b) * t);
	return 'rgb(' + r + ',' + g + ',' + bl + ')';
}
function rgba(hex, a) {
	var c = hexRgb(hex);
	return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
}
function hashStr(s) {
	var h = 2166136261;
	s = String(s || '');
	for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
	return h >>> 0;
}
function makeRng(seed) {
	var x = (seed >>> 0) || 88675123;
	return function () {
		x ^= x << 13; x >>>= 0;
		x ^= x >> 17;
		x ^= x << 5; x >>>= 0;
		return x / 4294967296;
	};
}
function clampChakra(c) { var n = Number(c) || 1; return Math.max(1, Math.min(9, n)); }

/* --- seed космоса: детерминирован из зерна Даймона (Часть II спеки) --- */
function getCosmosSeed(daimon) {
	var d = daimon || {};
	return hashStr((d.nakshatraName || d.nakshatra || '') + '|' + (d.element || '') + '|' + (d.name || ''));
}

/* --- фиксация seed в state (merge-not-overwrite, по спеке Часть III) --- */
function persistSeed(seed) {
	try {
		var raw = localStorage.getItem('awara_v258_state');
		if (!raw) return;
		var st = JSON.parse(raw);
		if (!st || !st.daimon) return;
		if (!st.daimon.cosmos) st.daimon.cosmos = {};
		if (st.daimon.cosmos.seed == null) {
			st.daimon.cosmos.seed = seed;
			localStorage.setItem('awara_v258_state', JSON.stringify(st));
		}
	} catch (e) { /* состояние не трогаем при любой ошибке */ }
}

/* --- активная линза игрока: tigel_v1.mats (выбранные сегодня) ->
       иначе самая «прокачанная» из tigel_v1.lenses -> иначе vedic --- */
function detectLensSlug() {
	try {
		var s = JSON.parse(localStorage.getItem('tigel_v1') || 'null');
		if (s) {
			if (Array.isArray(s.mats) && s.mats.length) {
				var sl = RU2SLUG[s.mats[s.mats.length - 1]];
				if (sl) return sl;
			}
			if (s.lenses && typeof s.lenses === 'object') {
				var best = null, bu = 0;
				Object.keys(s.lenses).forEach(function (k) {
					var u = (s.lenses[k] && s.lenses[k].uses) || 0;
					if (u > bu && RU2SLUG[k]) { bu = u; best = k; }
				});
				if (best) return RU2SLUG[best];
			}
		}
	} catch (e) { }
	return 'vedic';
}

function lensStyle(slug) {
	var st = null;
	try { if (typeof window.lensStyleFor === 'function') st = window.lensStyleFor(slug); } catch (e) { }
	if (!st && window.LENS_STYLE) st = window.LENS_STYLE[slug] || null;
	if (!st) st = STYLE_FALLBACK;
	if (!st.palette || st.palette.length < 3) st = Object.assign({}, st, { palette: STYLE_FALLBACK.palette });
	return st;
}

/* ================= процедурные мотивы =================
   Каждый мотив рисуется в системе координат с центром (0,0),
   вписан в радиус r. Цвет/альфу задаёт вызывающий код. */
var MOTIFS = {
	star4: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
		ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
		ctx.stroke();
	},
	lotus: function (ctx, r) {
		for (var i = 0; i < 8; i++) {
			var a = (i / 8) * Math.PI * 2;
			ctx.save(); ctx.rotate(a);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.quadraticCurveTo(r * 0.35, -r * 0.55, 0, -r);
			ctx.quadraticCurveTo(-r * 0.35, -r * 0.55, 0, 0);
			ctx.stroke(); ctx.restore();
		}
		ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.stroke();
	},
	mandala: function (ctx, r) {
		MOTIFS.lotus(ctx, r);
		ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.stroke();
		for (var i = 0; i < 12; i++) {
			var a = (i / 12) * Math.PI * 2;
			ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, 1.2, 0, Math.PI * 2); ctx.stroke();
		}
	},
	rune: function (ctx, r, rnd) {
		var v = rnd ? Math.floor(rnd() * 4) : 0;
		ctx.beginPath();
		ctx.moveTo(0, -r); ctx.lineTo(0, r); /* став */
		if (v === 0) { ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, -r * 0.3); ctx.lineTo(0, r * 0.2); }          /* руна-«турс» */
		else if (v === 1) { ctx.moveTo(0, -r * 0.6); ctx.lineTo(r * 0.7, 0); ctx.moveTo(0, 0); ctx.lineTo(r * 0.7, r * 0.6); } /* «ансуз» */
		else if (v === 2) { ctx.moveTo(-r * 0.6, -r * 0.4); ctx.lineTo(r * 0.6, r * 0.4); ctx.moveTo(-r * 0.6, r * 0.4); ctx.lineTo(r * 0.6, -r * 0.4); } /* «гебо» */
		else { ctx.moveTo(0, -r); ctx.lineTo(r * 0.6, -r * 0.4); ctx.moveTo(0, -r); ctx.lineTo(-r * 0.6, -r * 0.4); } /* «альгиз» перевёрнут */
		ctx.stroke();
	},
	yinyang: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, -r / 2, r / 2, Math.PI / 2, Math.PI * 1.5, true);
		ctx.arc(0, r / 2, r / 2, Math.PI * 1.5, Math.PI / 2, false);
		ctx.stroke();
		ctx.beginPath(); ctx.arc(0, -r / 2, r * 0.12, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath(); ctx.arc(0, r / 2, r * 0.12, 0, Math.PI * 2); ctx.stroke();
	},
	hexagram: function (ctx, r, rnd) {
		var w = r * 1.5, gap = (r * 2) / 5;
		for (var i = 0; i < 6; i++) {
			var y = -r + i * gap;
			var broken = rnd ? rnd() > 0.5 : (i % 2 === 0);
			ctx.beginPath();
			if (broken) { ctx.moveTo(-w / 2, y); ctx.lineTo(-w * 0.1, y); ctx.moveTo(w * 0.1, y); ctx.lineTo(w / 2, y); }
			else { ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); }
			ctx.stroke();
		}
	},
	ankh: function (ctx, r) {
		ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.32, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, -r * 0.1); ctx.lineTo(0, r);
		ctx.moveTo(-r * 0.5, 0); ctx.lineTo(r * 0.5, 0);
		ctx.stroke();
	},
	ziggurat: function (ctx, r) {
		var steps = 4;
		ctx.beginPath();
		for (var i = 0; i < steps; i++) {
			var w = r * (1 - i * 0.22), y = r * 0.7 - i * r * 0.42;
			ctx.moveTo(-w, y); ctx.lineTo(-w, y - r * 0.4); ctx.lineTo(w, y - r * 0.4); ctx.lineTo(w, y);
		}
		ctx.moveTo(-r, r * 0.7); ctx.lineTo(r, r * 0.7);
		ctx.stroke();
	},
	sunstone: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.stroke();
		for (var i = 0; i < 8; i++) {
			var a = (i / 8) * Math.PI * 2;
			ctx.save(); ctx.rotate(a);
			ctx.beginPath();
			ctx.moveTo(-r * 0.12, -r * 0.55); ctx.lineTo(0, -r); ctx.lineTo(r * 0.12, -r * 0.55);
			ctx.stroke(); ctx.restore();
		}
		ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.stroke();
	},
	triskelion: function (ctx, r) {
		for (var k = 0; k < 3; k++) {
			ctx.save(); ctx.rotate((k / 3) * Math.PI * 2);
			ctx.beginPath();
			for (var t = 0; t <= 1; t += 0.08) {
				var a = t * Math.PI * 1.5, rr = r * 0.14 + t * r * 0.66;
				var x = Math.cos(a) * rr, y = Math.sin(a) * rr - r * 0.1;
				if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
			}
			ctx.stroke(); ctx.restore();
		}
	},
	drum: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
		ctx.moveTo(0, -r); ctx.lineTo(0, r);
		ctx.stroke();
		for (var i = 0; i < 4; i++) {
			var a = Math.PI / 4 + (i / 4) * Math.PI * 2;
			ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 1.4, 0, Math.PI * 2); ctx.stroke();
		}
	},
	crescent: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r * 0.8, Math.PI * 0.35, Math.PI * 1.65); ctx.stroke();
		ctx.beginPath(); ctx.arc(r * 0.3, 0, r * 0.62, Math.PI * 0.45, Math.PI * 1.55); ctx.stroke();
		/* 8-конечная звезда рядом */
		ctx.save(); ctx.translate(r * 0.55, -r * 0.5);
		for (var i = 0; i < 8; i++) {
			var a = (i / 8) * Math.PI * 2;
			ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28); ctx.stroke();
		}
		ctx.restore();
	},
	grail: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(-r * 0.7, -r * 0.8);
		ctx.quadraticCurveTo(-r * 0.6, r * 0.1, 0, r * 0.15);
		ctx.quadraticCurveTo(r * 0.6, r * 0.1, r * 0.7, -r * 0.8);
		ctx.moveTo(0, r * 0.15); ctx.lineTo(0, r * 0.6);
		ctx.moveTo(-r * 0.45, r * 0.85); ctx.lineTo(r * 0.45, r * 0.85);
		ctx.moveTo(0, r * 0.6); ctx.lineTo(-r * 0.45, r * 0.85);
		ctx.moveTo(0, r * 0.6); ctx.lineTo(r * 0.45, r * 0.85);
		ctx.stroke();
		/* луч над чашей */
		ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r * 0.65); ctx.stroke();
	},
	crystal: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(0, -r); ctx.lineTo(r * 0.6, -r * 0.2); ctx.lineTo(r * 0.35, r); ctx.lineTo(-r * 0.35, r); ctx.lineTo(-r * 0.6, -r * 0.2); ctx.closePath();
		ctx.moveTo(0, -r); ctx.lineTo(0, r);
		ctx.moveTo(-r * 0.6, -r * 0.2); ctx.lineTo(r * 0.6, -r * 0.2);
		ctx.stroke();
	},
	mountain: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(-r, r * 0.7); ctx.lineTo(-r * 0.3, -r * 0.5); ctx.lineTo(r * 0.05, r * 0.1);
		ctx.lineTo(r * 0.4, -r); ctx.lineTo(r, r * 0.7);
		ctx.stroke();
		ctx.beginPath(); ctx.moveTo(r * 0.25, -r * 0.55); ctx.lineTo(r * 0.4, -r * 0.75) ; ctx.lineTo(r * 0.55, -r * 0.55); ctx.stroke();
	},
	dna: function (ctx, r) {
		ctx.beginPath();
		var i, x1, x2, y;
		for (i = 0; i <= 16; i++) {
			y = -r + (i / 16) * r * 2;
			x1 = Math.sin(i / 16 * Math.PI * 2) * r * 0.5;
			if (i === 0) ctx.moveTo(x1, y); else ctx.lineTo(x1, y);
		}
		for (i = 0; i <= 16; i++) {
			y = -r + (i / 16) * r * 2;
			x2 = Math.sin(i / 16 * Math.PI * 2 + Math.PI) * r * 0.5;
			if (i === 0) ctx.moveTo(x2, y); else ctx.lineTo(x2, y);
		}
		for (i = 1; i < 8; i++) {
			y = -r + (i / 8) * r * 2;
			x1 = Math.sin(i / 8 * Math.PI * 2) * r * 0.5;
			x2 = Math.sin(i / 8 * Math.PI * 2 + Math.PI) * r * 0.5;
			ctx.moveTo(x1, y); ctx.lineTo(x2, y);
		}
		ctx.stroke();
	},
	zodiac: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
		for (var i = 0; i < 12; i++) {
			var a = (i / 12) * Math.PI * 2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
			ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
			ctx.stroke();
		}
		ctx.beginPath(); ctx.arc(r * 0.4, -r * 0.3, 1.6, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.25, 1.6, 0, Math.PI * 2); ctx.stroke();
	},
	spiral: function (ctx, r) {
		ctx.beginPath();
		for (var t = 0; t <= 1; t += 0.04) {
			var a = t * Math.PI * 4, rr = t * r;
			var x = Math.cos(a) * rr, y = Math.sin(a) * rr;
			if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
		}
		ctx.stroke();
	},
	torii: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(-r, -r * 0.55); ctx.quadraticCurveTo(0, -r * 0.85, r, -r * 0.55);
		ctx.moveTo(-r * 0.8, -r * 0.3); ctx.lineTo(r * 0.8, -r * 0.3);
		ctx.moveTo(-r * 0.6, -r * 0.55); ctx.lineTo(-r * 0.6, r);
		ctx.moveTo(r * 0.6, -r * 0.55); ctx.lineTo(r * 0.6, r);
		ctx.stroke();
	},
	flame: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(0, r);
		ctx.quadraticCurveTo(-r * 0.85, r * 0.15, -r * 0.2, -r * 0.35);
		ctx.quadraticCurveTo(0, -r * 0.7, 0, -r);
		ctx.quadraticCurveTo(0.12 * r, -r * 0.5, r * 0.35, -r * 0.25);
		ctx.quadraticCurveTo(r * 0.85, r * 0.2, 0, r);
		ctx.stroke();
	},
	mask: function (ctx, r) {
		ctx.beginPath(); ctx.ellipse(0, 0, r * 0.6, r, 0, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-r * 0.35, -r * 0.25); ctx.lineTo(-r * 0.1, -r * 0.25);
		ctx.moveTo(r * 0.1, -r * 0.25); ctx.lineTo(r * 0.35, -r * 0.25);
		ctx.moveTo(0, -r * 0.05); ctx.lineTo(0, r * 0.55);
		ctx.stroke();
	},
	cowrie: function (ctx, r) {
		ctx.beginPath(); ctx.ellipse(0, 0, r * 0.55, r * 0.85, 0, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		for (var i = 0; i < 5; i++) {
			var y = -r * 0.5 + i * r * 0.25;
			ctx.moveTo(-r * 0.12, y); ctx.lineTo(r * 0.12, y + r * 0.1);
		}
		ctx.stroke();
	},
	yantra: function (ctx, r) {
		ctx.strokeRect(-r, -r, r * 2, r * 2);
		ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, -r * 0.7); ctx.lineTo(r * 0.6, r * 0.4); ctx.lineTo(-r * 0.6, r * 0.4); ctx.closePath();
		ctx.moveTo(0, r * 0.7); ctx.lineTo(r * 0.6, -r * 0.4); ctx.lineTo(-r * 0.6, -r * 0.4); ctx.closePath();
		ctx.stroke();
	},
	neural: function (ctx, r, rnd) {
		var pts = [], n = 7, i;
		var rr = rnd || function () { return 0.5; };
		for (i = 0; i < n; i++) {
			var a = (i / n) * Math.PI * 2 + rr() * 0.6;
			pts.push({ x: Math.cos(a) * r * (0.5 + rr() * 0.5), y: Math.sin(a) * r * (0.5 + rr() * 0.5) });
		}
		ctx.beginPath();
		for (i = 0; i < n; i++) {
			ctx.moveTo(0, 0); ctx.lineTo(pts[i].x, pts[i].y);
			var j = (i + 2) % n;
			ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
		}
		ctx.stroke();
		for (i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.6, 0, Math.PI * 2); ctx.stroke(); }
		ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.stroke();
	},
	circuit: function (ctx, r) {
		ctx.beginPath();
		ctx.moveTo(-r, -r * 0.5); ctx.lineTo(-r * 0.2, -r * 0.5); ctx.lineTo(-r * 0.2, r * 0.3); ctx.lineTo(r * 0.5, r * 0.3);
		ctx.moveTo(-r * 0.6, r * 0.8); ctx.lineTo(r * 0.1, r * 0.8); ctx.lineTo(r * 0.1, -r * 0.2); ctx.lineTo(r, -r * 0.2);
		ctx.moveTo(0, -r); ctx.lineTo(0, -r * 0.5);
		ctx.stroke();
		[[-r * 0.2, -r * 0.5], [r * 0.5, r * 0.3], [r, -r * 0.2], [0, -r]].forEach(function (p) {
			ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, Math.PI * 2); ctx.stroke();
		});
	},
	halo: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.stroke();
		for (var i = 0; i < 12; i++) {
			var a = (i / 12) * Math.PI * 2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
			ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
			ctx.stroke();
		}
	},
	cross: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, -r * 0.7); ctx.lineTo(0, r * 0.7);
		ctx.moveTo(-r * 0.55, -r * 0.15); ctx.lineTo(r * 0.55, -r * 0.15);
		ctx.stroke();
	},
	laurel: function (ctx, r) {
		for (var s = -1; s <= 1; s += 2) {
			ctx.beginPath();
			ctx.arc(0, r * 0.2, r * 0.85, Math.PI * 0.5 - s * 0.2, Math.PI * 0.5 - s * 1.35, s < 0);
			ctx.stroke();
			for (var i = 1; i <= 4; i++) {
				var a = Math.PI * 0.5 - s * (0.25 + i * 0.26);
				var x = Math.cos(a) * r * 0.85, y = r * 0.2 + Math.sin(a) * r * 0.85;
				ctx.beginPath(); ctx.ellipse(x, y, r * 0.14, r * 0.06, a + s * 0.7, 0, Math.PI * 2); ctx.stroke();
			}
		}
	},
	sefirot: function (ctx, r) {
		var P = [[0, -1], [-0.6, -0.62], [0.6, -0.62], [-0.6, -0.05], [0.6, -0.05], [0, 0.28], [-0.6, 0.55], [0.6, 0.55], [0, 0.8], [0, 1.15]];
		var E = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5], [5, 8], [3, 6], [4, 7], [6, 7], [6, 8], [7, 8], [8, 9]];
		var k = r * 0.8;
		ctx.beginPath();
		E.forEach(function (e) {
			ctx.moveTo(P[e[0]][0] * k, P[e[0]][1] * k);
			ctx.lineTo(P[e[1]][0] * k, P[e[1]][1] * k);
		});
		ctx.stroke();
		P.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0] * k, p[1] * k, 2, 0, Math.PI * 2); ctx.stroke(); });
	},
	cardframe: function (ctx, r) {
		var w = r * 1.3, h = r * 2;
		ctx.strokeRect(-w / 2, -h / 2, w, h);
		ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
		ctx.save(); ctx.translate(0, 0);
		MOTIFS.star4(ctx, r * 0.4);
		ctx.restore();
	},
	alchemy: function (ctx, r) {
		ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, -r * 0.75); ctx.lineTo(r * 0.65, r * 0.45); ctx.lineTo(-r * 0.65, r * 0.45); ctx.closePath();
		ctx.stroke();
		ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.28, 0, Math.PI * 2); ctx.stroke();
	},
	kolovrat: function (ctx, r) {
		for (var i = 0; i < 8; i++) {
			ctx.save(); ctx.rotate((i / 8) * Math.PI * 2);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, -r * 0.7);
			ctx.quadraticCurveTo(r * 0.35, -r * 0.85, r * 0.45, -r * 0.5);
			ctx.stroke(); ctx.restore();
		}
		ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2); ctx.stroke();
	}
};

/* ================= построение модели космоса ================= */
function buildModel(daimon, opts) {
	opts = opts || {};
	var d = daimon || {};
	var mera = (opts.mera && opts.mera.length === 9) ? opts.mera : MERA_FALLBACK;
	var chakra = clampChakra(d.chakra);
	var pierced = opts.granthi || d.granthiPierced || {};
	var slug = opts.lensSlug || detectLensSlug();
	if (!LENS_FX[slug] && LENS_SLUGS.indexOf(slug) < 0) slug = 'vedic';
	var style = lensStyle(slug);
	var fx = LENS_FX[slug] || FX_DEFAULT;
	var seed = getCosmosSeed(d);
	persistSeed(seed);
	var rng = makeRng(seed);

	/* созвездие рождения: 5–9 звёзд, детерминировано из seed */
	var starCount = 5 + Math.floor(rng() * 5);
	var constellation = [];
	for (var i = 0; i < starCount; i++) {
		var a = rng() * Math.PI * 2, rr = 0.25 + rng() * 0.75;
		constellation.push({ a: a, r: rr, mag: 0.5 + rng() * 0.5 });
	}
	constellation.sort(function (p, q) { return p.a - q.a; });

	/* фоновые звёзды неба */
	var sky = [];
	for (var s = 0; s < 80; s++) sky.push({ x: rng(), y: rng(), m: rng(), tw: rng() * Math.PI * 2 });

	/* кольцо малых мотивов вокруг космоса */
	var motifRing = [];
	var mCount = 6 + Math.floor(rng() * 3);
	for (var m = 0; m < mCount; m++) {
		motifRing.push({ a: (m / mCount) * Math.PI * 2 + rng() * 0.4, s: 0.7 + rng() * 0.6, rot: rng() * Math.PI * 2, seed: Math.floor(rng() * 1e9) });
	}

	return {
		daimon: d, mera: mera, chakra: chakra, pierced: pierced,
		slug: slug, style: style, fx: fx, seed: seed, rng: rng,
		dna: Math.max(0, Math.min(12, Number(d.dnaStrands) || 2)),
		glyph: FORM_GLYPHS[d.form] || '✨',
		constellation: constellation, sky: sky, motifRing: motifRing,
		markerPhase: rng() * Math.PI * 2
	};
}

/* ================= частицы ================= */
function initParticles(model, w, h) {
	var n = Math.round(46 * (model.fx.density || 0.7));
	var out = [];
	for (var i = 0; i < n; i++) out.push(spawnParticle(model, w, h, Math.random()));
	return out;
}
function spawnParticle(model, w, h, seedY) {
	var t = model.fx.particle;
	var p = { x: Math.random() * w, y: Math.random() * h, ph: Math.random() * Math.PI * 2, s: 0.5 + Math.random() };
	if (t === 'ember') { p.y = h * (seedY != null ? seedY : 1); p.vx = 0; p.vy = -(6 + Math.random() * 14); }
	else if (t === 'snow' || t === 'petal') { p.vy = 8 + Math.random() * 12; p.vx = 0; }
	else if (t === 'bubble') { p.vy = -(4 + Math.random() * 8); p.vx = 0; }
	else if (t === 'data') { p.vy = 60 + Math.random() * 120; p.vx = 0; p.len = 6 + Math.random() * 14; }
	else if (t === 'mist') { p.vx = (Math.random() - 0.5) * 4; p.vy = (Math.random() - 0.5) * 2; p.rr = 30 + Math.random() * 60; }
	else { p.vx = (Math.random() - 0.5) * 5; p.vy = (Math.random() - 0.5) * 5; } /* dust / stars */
	return p;
}
function stepDrawParticles(ctx, model, parts, w, h, dt, t) {
	var type = model.fx.particle, pal = model.style.palette;
	var c0 = pal[0], c1 = pal[1], c2 = pal[2];
	for (var i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (type === 'stars') {
			var tw = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.8 + p.ph));
			ctx.fillStyle = rgba(c2, 0.5 * tw);
			ctx.fillRect(p.x, p.y, 1.6 * p.s, 1.6 * p.s);
			continue;
		}
		p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
		if (type === 'snow' || type === 'petal') p.x += Math.sin(t * 1.2 + p.ph) * 12 * dt;
		if (type === 'ember') p.x += Math.sin(t * 2 + p.ph) * 8 * dt;
		/* возврат в поле */
		if (p.y < -20) { p.y = h + 10; p.x = Math.random() * w; }
		if (p.y > h + 20) { p.y = -10; p.x = Math.random() * w; }
		if (p.x < -20) p.x = w + 10;
		if (p.x > w + 20) p.x = -10;

		if (type === 'ember') {
			ctx.fillStyle = rgba(c0, 0.55);
			ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 * p.s, 0, Math.PI * 2); ctx.fill();
		} else if (type === 'snow') {
			ctx.fillStyle = rgba(c2, 0.6);
			ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 * p.s, 0, Math.PI * 2); ctx.fill();
		} else if (type === 'petal') {
			ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t + p.ph);
			ctx.fillStyle = rgba(c0, 0.5);
			ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * p.s, 1.2 * p.s, 0, 0, Math.PI * 2); ctx.fill();
			ctx.restore();
		} else if (type === 'bubble') {
			ctx.strokeStyle = rgba(c2, 0.35);
			ctx.lineWidth = 1;
			ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * p.s, 0, Math.PI * 2); ctx.stroke();
		} else if (type === 'data') {
			ctx.strokeStyle = rgba(c1, 0.5);
			ctx.lineWidth = 1;
			ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - p.len); ctx.stroke();
		} else if (type === 'mist') {
			var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rr);
			g.addColorStop(0, rgba(c2, 0.05));
			g.addColorStop(1, rgba(c2, 0));
			ctx.fillStyle = g;
			ctx.beginPath(); ctx.arc(p.x, p.y, p.rr, 0, Math.PI * 2); ctx.fill();
		} else { /* dust */
			ctx.fillStyle = rgba(c2, 0.30 + 0.2 * Math.sin(t + p.ph));
			ctx.fillRect(p.x, p.y, 1.2, 1.2);
		}
	}
}

/* ================= статичный слой (фон + мотивы + созвездие неба) ================= */
function buildStaticLayer(model, w, h, dpr) {
	var cv = document.createElement('canvas');
	cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
	var ctx = cv.getContext('2d');
	ctx.scale(dpr, dpr);
	var pal = model.style.palette;
	var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 16;

	/* атмосфера: тьма, тонированная палитрой линзы */
	ctx.fillStyle = mix('#02010a', pal[1], 0.10);
	ctx.fillRect(0, 0, w, h);
	var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
	g.addColorStop(0, rgba(pal[0], 0.14));
	g.addColorStop(0.55, rgba(pal[1], 0.07));
	g.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);

	/* фоновые звёзды */
	model.sky.forEach(function (s) {
		ctx.fillStyle = rgba(pal[2], 0.10 + s.m * 0.35);
		ctx.fillRect(s.x * w, s.y * h, s.m > 0.85 ? 2 : 1, s.m > 0.85 ? 2 : 1);
	});

	/* большой мотив-водяной знак за орбитами */
	var motifFn = MOTIFS[model.fx.motif] || MOTIFS.star4;
	ctx.save();
	ctx.translate(cx, cy);
	ctx.strokeStyle = rgba(pal[0], 0.07);
	ctx.lineWidth = 1.4;
	motifFn(ctx, R * 0.94, makeRng(model.seed ^ 0x5f5f5f));
	ctx.restore();

	/* кольцо малых мотивов по краю */
	model.motifRing.forEach(function (m) {
		var mr = R * 1.0;
		var x = cx + Math.cos(m.a) * mr, y = cy + Math.sin(m.a) * mr;
		if (x < 14 || x > w - 14 || y < 14 || y > h - 14) return;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(m.rot);
		ctx.strokeStyle = rgba(pal[0], 0.20);
		ctx.lineWidth = 1;
		motifFn(ctx, 9 * m.s, makeRng(m.seed));
		ctx.restore();
	});

	/* 12 нитей ДНК — «галактические рукава» от ядра; активные ярче */
	for (var i = 0; i < 12; i++) {
		var active = i < model.dna;
		var a0 = (i / 12) * Math.PI * 2 + 0.35;
		ctx.beginPath();
		for (var tt = 0; tt <= 1; tt += 0.1) {
			var rr = R * (0.16 + tt * 0.84), aa = a0 + tt * 0.9;
			var px = cx + Math.cos(aa) * rr, py = cy + Math.sin(aa) * rr;
			if (tt === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
		}
		ctx.strokeStyle = active ? rgba(pal[0], 0.10) : rgba(pal[2], 0.03);
		ctx.lineWidth = active ? 1.2 : 0.8;
		ctx.stroke();
	}
	return cv;
}

/* ================= отрисовка динамики ================= */
function ringRadius(i, R) { return R * (0.24 + 0.76 * (i - 1) / 8); }

function drawRings(ctx, model, cx, cy, R, t) {
	var pal = model.style.palette;
	for (var i = 1; i <= 9; i++) {
		var m = model.mera[i - 1];
		var r = ringRadius(i, R);
		var isCur = i === model.chakra, isPast = i < model.chakra;
		/* канонический цвет Меры — структура; палитра линзы — тон/свечение */
		var base = mix(m.color, pal[0], 0.25);
		ctx.save();
		if (isCur) {
			var pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
			ctx.shadowColor = mix(m.color, pal[1], 0.35);
			ctx.shadowBlur = 10 + 8 * pulse;
			ctx.strokeStyle = rgba(base, 0.95);
			ctx.lineWidth = 2 + pulse;
			ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
			/* вращающийся акцент-дуга на текущей Мере */
			ctx.shadowBlur = 0;
			ctx.strokeStyle = rgba(pal[2], 0.8);
			ctx.lineWidth = 1.4;
			var a0 = t * 0.35 + model.markerPhase;
			ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + 0.9); ctx.stroke();
		} else if (isPast) {
			ctx.strokeStyle = rgba(base, 0.55);
			ctx.lineWidth = 1.3;
			ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
		} else {
			ctx.strokeStyle = rgba(base, 0.18);
			ctx.lineWidth = 1;
			ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
		}
		/* Пуп (М4) — порог Восхождения: двойное пунктирное золотое кольцо */
		if (i === 4) {
			ctx.strokeStyle = rgba(mix('#ffd700', pal[0], 0.35), 0.5);
			ctx.lineWidth = 1;
			ctx.setLineDash([3, 5]);
			ctx.lineDashOffset = -t * 6;
			ctx.beginPath(); ctx.arc(cx, cy, r + 3.5, 0, Math.PI * 2); ctx.stroke();
			ctx.setLineDash([]);
		}
		ctx.restore();
	}
}

function drawGates(ctx, model, cx, cy, R, t) {
	var pal = model.style.palette;
	GATES.forEach(function (gt, gi) {
		var r = ringRadius(gt.ring, R);
		var x = cx + Math.cos(gt.angle) * r, y = cy + Math.sin(gt.angle) * r;
		var meraColor = model.mera[gt.ring - 1].color;
		var open = !!model.pierced[gt.id];
		var gr = 9;
		ctx.save();
		ctx.translate(x, y);
		if (open) {
			/* открытые врата: сияющая апертура-воронка */
			var pulse = 0.5 + 0.5 * Math.sin(t * 2 + gi * 2.1);
			var g = ctx.createRadialGradient(0, 0, 0, 0, 0, gr * 1.7);
			g.addColorStop(0, rgba('#ffffff', 0.85));
			g.addColorStop(0.35, rgba(mix(meraColor, pal[1], 0.4), 0.55));
			g.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = g;
			ctx.beginPath(); ctx.arc(0, 0, gr * 1.7, 0, Math.PI * 2); ctx.fill();
			/* вращающиеся дуги-вихрь */
			ctx.strokeStyle = rgba(pal[2], 0.85);
			ctx.lineWidth = 1.4;
			for (var k = 0; k < 3; k++) {
				var a0 = t * 1.3 + k * (Math.PI * 2 / 3);
				ctx.beginPath(); ctx.arc(0, 0, gr * (0.75 + 0.12 * k), a0, a0 + 1.5); ctx.stroke();
			}
			ctx.shadowColor = pal[1]; ctx.shadowBlur = 8 + 6 * pulse;
			ctx.strokeStyle = rgba(mix(meraColor, pal[0], 0.3), 0.9);
			ctx.lineWidth = 1.6;
			ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2); ctx.stroke();
		} else {
			/* запечатанный узел: тёмный диск, перевязанный нитями */
			ctx.fillStyle = 'rgba(4,2,12,0.9)';
			ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = rgba(meraColor, 0.4);
			ctx.lineWidth = 1.4;
			ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2); ctx.stroke();
			ctx.strokeStyle = rgba(pal[0], 0.35);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(-gr * 0.7, -gr * 0.4); ctx.quadraticCurveTo(0, gr * 0.3, gr * 0.7, -gr * 0.4);
			ctx.moveTo(-gr * 0.7, gr * 0.4); ctx.quadraticCurveTo(0, -gr * 0.3, gr * 0.7, gr * 0.4);
			ctx.moveTo(0, -gr * 0.85); ctx.lineTo(0, gr * 0.85);
			ctx.stroke();
		}
		ctx.restore();
	});
}

function drawCore(ctx, model, cx, cy, R, t) {
	var pal = model.style.palette;
	var meraColor = model.mera[model.chakra - 1].color;
	var r0 = R * 0.17;
	var pulse = 0.5 + 0.5 * Math.sin(t * 1.1);

	/* созвездие рождения вокруг ядра */
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(t * 0.05);
	ctx.strokeStyle = rgba(pal[2], 0.35);
	ctx.lineWidth = 0.8;
	ctx.beginPath();
	model.constellation.forEach(function (p, i) {
		var x = Math.cos(p.a) * p.r * r0, y = Math.sin(p.a) * p.r * r0;
		if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
	});
	ctx.stroke();
	model.constellation.forEach(function (p, i) {
		var x = Math.cos(p.a) * p.r * r0, y = Math.sin(p.a) * p.r * r0;
		var tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.4 + i));
		ctx.fillStyle = rgba(pal[2], 0.5 + 0.5 * p.mag * tw);
		ctx.beginPath(); ctx.arc(x, y, 1 + p.mag * 1.4, 0, Math.PI * 2); ctx.fill();
	});
	ctx.restore();

	/* сияние ядра: цвет текущей Меры + атмосфера линзы */
	var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0 * 1.5);
	g.addColorStop(0, rgba(mix(meraColor, pal[0], 0.4), 0.30 + 0.15 * pulse));
	g.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = g;
	ctx.beginPath(); ctx.arc(cx, cy, r0 * 1.5, 0, Math.PI * 2); ctx.fill();

	/* глиф формы накшатры */
	var fs = Math.round(r0 * 0.95);
	ctx.save();
	ctx.font = fs + 'px serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.shadowColor = mix(meraColor, pal[1], 0.4);
	ctx.shadowBlur = 12 + 6 * pulse;
	ctx.fillText(model.glyph, cx, cy + 1);
	ctx.restore();

	/* звезда-маркер игрока, странствующая по текущей Мере */
	var mr = ringRadius(model.chakra, R);
	var ma = model.markerPhase + t * 0.22;
	var mx = cx + Math.cos(ma) * mr, my = cy + Math.sin(ma) * mr;
	ctx.save();
	ctx.translate(mx, my);
	ctx.rotate(t * 0.6);
	ctx.strokeStyle = rgba(pal[2], 0.95);
	ctx.lineWidth = 1.2;
	ctx.shadowColor = meraColor;
	ctx.shadowBlur = 8;
	MOTIFS.star4(ctx, 5.5);
	ctx.restore();
}

/* ================= mount / lifecycle ================= */
var inst = null;
var lastArgs = null;

function destroy() {
	if (!inst) return;
	try { if (inst.raf) cancelAnimationFrame(inst.raf); } catch (e) { }
	try { window.removeEventListener('resize', inst.onResize); } catch (e) { }
	try { document.removeEventListener('visibilitychange', inst.onVis); } catch (e) { }
	try { if (inst.host) inst.host.innerHTML = ''; } catch (e) { }
	inst = null;
}

function lensLabel(model) {
	var lang = 'ru';
	try { lang = localStorage.getItem('awara_lang') || 'ru'; } catch (e) { }
	var name = lang === 'en'
		? model.slug.split('_').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ')
		: (SLUG2RU[model.slug] || model.slug);
	var meraName = model.mera[model.chakra - 1].chakra;
	return (lang === 'en' ? 'Lens: ' : 'Линза: ') + name +
		' · ' + (lang === 'en' ? 'Mera ' : 'Мера ') + model.chakra + ' · ' + meraName;
}

function mount(host, daimon, opts) {
	if (!host || !daimon) return null;
	destroy();
	lastArgs = { host: host, daimon: daimon, opts: opts || {} };

	var model = buildModel(daimon, opts);
	var dpr = Math.min(2, window.devicePixelRatio || 1);
	var reduced = false;
	try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

	host.innerHTML = '';
	var canvas = document.createElement('canvas');
	canvas.style.display = 'block';
	canvas.style.width = '100%';
	canvas.style.borderRadius = '10px';
	host.appendChild(canvas);
	var caption = document.createElement('div');
	caption.style.cssText = 'margin-top:8px;text-align:center;font-size:8px;letter-spacing:0.15em;color:rgba(201,168,76,0.55);font-family:"JetBrains Mono",monospace;';
	caption.textContent = lensLabel(model);
	host.appendChild(caption);

	var ctx = canvas.getContext('2d');
	var w = 0, h = 0, staticLayer = null, parts = null;

	function resize() {
		var cw = host.clientWidth || 320;
		w = cw;
		h = Math.max(280, Math.min(440, Math.round(cw * 0.92)));
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		canvas.style.height = h + 'px';
		staticLayer = buildStaticLayer(model, w, h, dpr);
		parts = initParticles(model, w, h);
	}
	resize();

	var t0 = performance.now(), last = t0, acc = 0;
	function frame(now) {
		inst.raf = requestAnimationFrame(frame);
		if (document.hidden) { last = now; return; }
		var dt = Math.min(0.1, (now - last) / 1000);
		acc += now - last;
		last = now;
		if (acc < 33) return; /* ~30fps достаточно для мягкой анимации */
		acc = 0;
		var t = (now - t0) / 1000;
		render(t, Math.max(dt, 0.033));
	}
	function render(t, dt) {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		ctx.drawImage(staticLayer, 0, 0, w, h);
		var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 16;
		stepDrawParticles(ctx, model, parts, w, h, dt, t);
		drawRings(ctx, model, cx, cy, R, t);
		drawGates(ctx, model, cx, cy, R, t);
		drawCore(ctx, model, cx, cy, R, t);
	}

	inst = {
		host: host, canvas: canvas, model: model, raf: 0,
		onResize: function () { resize(); if (reduced) render(0.001, 0.033); },
		onVis: function () { }
	};
	window.addEventListener('resize', inst.onResize);
	document.addEventListener('visibilitychange', inst.onVis);

	if (reduced) {
		render(0.001, 0.033); /* уважение prefers-reduced-motion: один статичный кадр */
	} else {
		inst.raf = requestAnimationFrame(frame);
	}
	return inst;
}

/* если стили линз догрузились после mount — перескинуть космос */
document.addEventListener('awara-lens-styles-ready', function () {
	if (inst && lastArgs) {
		try { mount(lastArgs.host, lastArgs.daimon, lastArgs.opts); } catch (e) { }
	}
});

window.DaimonCosmos = {
	mount: mount,
	destroy: destroy,
	detectLensSlug: detectLensSlug,
	getCosmosSeed: getCosmosSeed,
	/* для отладки/спот-чеков: явная смена линзы */
	_lensSlugs: LENS_SLUGS.slice()
};

})();
