// js/lexicon.js
// ЕДИНЫЙ ЯЗЫК AWARA
// Понятный слой (player) показывается игроку; канон (санскрит/техника) живёт под капотом.
// UI всегда берёт player крупно, canon — мелкой подписью/тултипом.
// Тоггл «Сакральный язык» включает показ canon как основного.
//
// Использование:
//   import { lex, label, isSacredMode, toggleSacredMode } from './lexicon.js'
//   label(lex('stage','vira'))            -> 'Герой'
//   label(lex('stage','vira'),{withCanon:true}) -> 'Герой · Вира'
//   sub(lex('stage','vira'))              -> 'Вира'  (подпись мелким)
//
// Канон данных (JSON/код) НЕ меняется — этот модуль только переводит для показа.

export const SACRED_KEY = 'awara_sacred_language'

export function isSacredMode() {
	try { return localStorage.getItem(SACRED_KEY) === '1' } catch (e) { return false }
}
export function setSacredMode(on) {
	try { localStorage.setItem(SACRED_KEY, on ? '1' : '0') } catch (e) {}
}
export function toggleSacredMode() {
	const next = !isSacredMode()
	setSacredMode(next)
	return next
}

// Текущий язык интерфейса (ru/en). Берём из i18n, если доступно.
function curLang() {
	try {
		if (typeof window !== 'undefined' && typeof window.getLang === 'function') return window.getLang()
	} catch (e) {}
	try { return localStorage.getItem('awara_lang') || 'ru' } catch (e) { return 'ru' }
}

// ---------------------------------------------------------------------------
// СЛОВАРЬ. Каждый термин: { canon, player:{ru,en}, hint:{ru,en} }
// canon — то, что лежит в данных (id/санскрит). player — что видит игрок.
// ---------------------------------------------------------------------------
export const LEXICON = {
	// 5 стадий эволюции Даймона
	stage: {
		pashu:      { canon: 'Пашу',        player: { ru: 'Искра',      en: 'Spark' },      hint: { ru: 'Малыш-хранитель: только пробудился, учится чувствовать.', en: 'Guardian child: just awakened, learning to feel.' } },
		vira:       { canon: 'Вира',        player: { ru: 'Герой',      en: 'Hero' },       hint: { ru: 'Открылось сердце: видит эмоции, помогает честности.', en: 'Heart opened: sees emotions, supports honesty.' } },
		sadhaka:    { canon: 'Садхака',     player: { ru: 'Мастер',     en: 'Master' },     hint: { ru: 'Обрёл голос-мантру, видит сквозь иллюзии.', en: 'Found a voice-mantra, sees through illusions.' } },
		jivanmukta: { canon: 'Дживанмукта', player: { ru: 'Архитектор', en: 'Architect' },  hint: { ru: 'Свободен: строит миры, читает память мира.', en: 'Free: builds worlds, reads the world memory.' } },
		paramukti:  { canon: 'Парамукти',   player: { ru: 'Творец',     en: 'Creator' },    hint: { ru: 'Космическое существо: создаёт существ и миры.', en: 'Cosmic being: creates beings and worlds.' } },
	},

	// Редкость (tier)
	tier: {
		common:    { canon: 'Common',    player: { ru: 'Обычный',     en: 'Common' },    hint: { ru: '', en: '' } },
		uncommon:  { canon: 'Uncommon',  player: { ru: 'Необычный',   en: 'Uncommon' },  hint: { ru: '', en: '' } },
		rare:      { canon: 'Rare',      player: { ru: 'Редкий',      en: 'Rare' },      hint: { ru: '', en: '' } },
		epic:      { canon: 'Epic',      player: { ru: 'Эпический',   en: 'Epic' },      hint: { ru: '', en: '' } },
		mythic:    { canon: 'Mythic',    player: { ru: 'Мифический',  en: 'Mythic' },    hint: { ru: '', en: '' } },
		legendary: { canon: 'Legendary', player: { ru: 'Легендарный', en: 'Legendary' }, hint: { ru: '', en: '' } },
	},

	// 3 грантхи -> Врата
	granthi: {
		brahma:    { canon: 'Брахма-грантхи',   player: { ru: 'Врата Тела',      en: 'Gate of Body' },        hint: { ru: 'Страх, выживание, инерция. Сделать реальное действие, признать боль, заземлиться.', en: 'Fear, survival, inertia. Take real action, accept pain, ground yourself.' } },
		vishnu:    { canon: 'Вишну-грантхи',    player: { ru: 'Врата Сердца',    en: 'Gate of Heart' },       hint: { ru: 'Привязанности, отношения, голос. Сказать правду без разрушения.', en: 'Attachments, relationships, voice. Speak truth without destruction.' } },
		rudra:     { canon: 'Рудра-грантхи',    player: { ru: 'Врата Личности',  en: 'Gate of Self' },        hint: { ru: 'Эго, контроль, образ себя. Отпустить ложный образ себя.', en: 'Ego, control, self-image. Let go of the false self.' } },
		paramukti: { canon: 'Квест Шивы',       player: { ru: 'Последний Порог', en: 'Final Threshold' },     hint: { ru: 'Выход за личную форму. Создать мир или помочь другим.', en: 'Beyond personal form. Create a world or help others.' } },
	},

	// Механика -> понятные ярлыки
	mech: {
		chakra:     { canon: 'Чакра',          player: { ru: 'Ступень Света',  en: 'Light Step' },      hint: { ru: 'На какой высоте сейчас Даймон (от корня к вершине).', en: 'Current height of the Daimon (root to crown).' } },
		dna:        { canon: 'Нити ДНК',        player: { ru: 'Нити Силы',      en: 'Strands of Power' }, hint: { ru: 'Насколько полно пробудился код существа (2->12).', en: 'How fully the being\'s code is awakened (2->12).' } },
		multiplier: { canon: 'Множитель',      player: { ru: 'Усиление Света', en: 'Light Boost' },     hint: { ru: 'Во сколько раз сильнее всё, что он даёт.', en: 'How many times stronger everything he gives is.' } },
		xpThreshold:{ canon: 'Порог XP',       player: { ru: 'Нужно Света',    en: 'Light Needed' },    hint: { ru: 'Сколько опыта накопить для следующей ступени.', en: 'How much experience to reach the next step.' } },
		bond:       { canon: 'Резонанс',       player: { ru: 'Связь',          en: 'Bond' },            hint: { ru: 'Насколько близок Даймон к игроку.', en: 'How close the Daimon is to the player.' } },
		shift:      { canon: 'SHIFT',          player: { ru: 'Сдвиг дня',      en: 'Day Shift' },       hint: { ru: 'Куда повернулся день.', en: 'Where the day turned.' } },
		credits:    { canon: 'CREDITS',        player: { ru: 'Светокоины',     en: 'Lightcoins' },      hint: { ru: 'Валюта света.', en: 'Currency of light.' } },
		matrixTier: { canon: 'MATRIX TIER',    player: { ru: 'Уровень Матрицы',en: 'Matrix Level' },    hint: { ru: 'Слой глубины.', en: 'Layer of depth.' } },
		awareness:  { canon: 'awareness',      player: { ru: 'Осознанность',   en: 'Awareness' },       hint: { ru: '', en: '' } },
		dominantElement:{ canon: 'dominantElement', player: { ru: 'Стихия дня', en: 'Element of the Day' }, hint: { ru: '', en: '' } },
	},

	// Гуны -> качества
	guna: {
		tamas:  { canon: 'Тамас',  player: { ru: 'Тяжесть',  en: 'Heaviness' }, hint: { ru: 'Инерция, страх, покой.', en: 'Inertia, fear, stillness.' } },
		rajas:  { canon: 'Раджас', player: { ru: 'Движение', en: 'Motion' },    hint: { ru: 'Действие, желание, страсть.', en: 'Action, desire, passion.' } },
		sattva: { canon: 'Саттва', player: { ru: 'Ясность',  en: 'Clarity' },   hint: { ru: 'Гармония, свет, понимание.', en: 'Harmony, light, understanding.' } },
	},

	// Статусы (касты) -> ранг развития
	status: {
		dasyu:    { canon: 'Дасью',    player: { ru: 'Искатель',   en: 'Seeker' },   hint: { ru: '', en: '' } },
		shudra:   { canon: 'Шудра',    player: { ru: 'Труженик',   en: 'Worker' },   hint: { ru: '', en: '' } },
		vaishya:  { canon: 'Вайшью',   player: { ru: 'Созидатель', en: 'Builder' },  hint: { ru: '', en: '' } },
		kshatriya:{ canon: 'Кшатрий',  player: { ru: 'Воин',       en: 'Warrior' },  hint: { ru: '', en: '' } },
		brahman:  { canon: 'Брахман',  player: { ru: 'Мудрец',     en: 'Sage' },     hint: { ru: '', en: '' } },
		avatar:   { canon: 'Аватар',   player: { ru: 'Аватар',     en: 'Avatar' },   hint: { ru: '', en: '' } },
	},

	// Навигация/мир
	world: {
		assemblage: { canon: 'Точка Сборки', player: { ru: 'Точка Восприятия', en: 'Point of Perception' }, hint: { ru: '', en: '' } },
		contour:    { canon: 'Контур',       player: { ru: 'Круг роста',       en: 'Circle of Growth' },    hint: { ru: '', en: '' } },
		loka:       { canon: 'Лока',         player: { ru: 'Мир / уровень бытия', en: 'World / level of being' }, hint: { ru: '', en: '' } },
		akasha:     { canon: 'Акаша',        player: { ru: 'Память мира',      en: 'World Memory' },        hint: { ru: '', en: '' } },
		maya:       { canon: 'Майя',         player: { ru: 'Иллюзия',          en: 'Illusion' },            hint: { ru: '', en: '' } },
		domain:     { canon: 'Домен',        player: { ru: 'Мир',              en: 'World' },               hint: { ru: '', en: '' } },
		minion:     { canon: 'Minion',       player: { ru: 'Спутник',          en: 'Companion' },           hint: { ru: '', en: '' } },
		fusion:     { canon: 'Fusion',       player: { ru: 'Слияние',          en: 'Fusion' },              hint: { ru: '', en: '' } },
	},

	// Способности Даймона
	ability: {
		moodSense:        { canon: 'moodSense',        player: { ru: 'Чувствует настроение',  en: 'Senses mood' },           hint: { ru: '', en: '' } },
		basicResonance:   { canon: 'basicResonance',   player: { ru: 'Базовый резонанс',      en: 'Basic resonance' },       hint: { ru: '', en: '' } },
		dailyHint:        { canon: 'dailyHint',        player: { ru: 'Подсказка дня',         en: 'Daily hint' },            hint: { ru: '', en: '' } },
		seeEmotions:      { canon: 'seeEmotions',      player: { ru: 'Видит эмоции',          en: 'Sees emotions' },         hint: { ru: '', en: '' } },
		compositeElement: { canon: 'compositeElement', player: { ru: 'Смешивает 2 стихии',    en: 'Blends 2 elements' },     hint: { ru: '', en: '' } },
		mantra:           { canon: 'mantra',           player: { ru: 'Личная мантра',         en: 'Personal mantra' },       hint: { ru: 'Слово силы.', en: 'Word of power.' } },
		seeThroughMaya:   { canon: 'seeThroughMaya',   player: { ru: 'Видит сквозь иллюзии',  en: 'Sees through illusions' },hint: { ru: '', en: '' } },
		cardAffinityBoost:{ canon: 'cardAffinityBoost',player: { ru: 'Усиление карт',         en: 'Card affinity boost' },   hint: { ru: '', en: '' } },
		readAkasha:       { canon: 'readAkasha',       player: { ru: 'Читает память мира',    en: 'Reads world memory' },    hint: { ru: '', en: '' } },
		tripleElement:    { canon: 'tripleElement',    player: { ru: 'Смешивает 3 стихии',    en: 'Blends 3 elements' },     hint: { ru: '', en: '' } },
		domainLink:       { canon: 'domainLink',       player: { ru: 'Связь с миром',         en: 'World link' },            hint: { ru: '', en: '' } },
		generateMinions:  { canon: 'generateMinions',  player: { ru: 'Рождает спутников',     en: 'Generates companions' },  hint: { ru: '', en: '' } },
		realityWeave:     { canon: 'realityWeave',     player: { ru: 'Плетёт реальность',     en: 'Weaves reality' },        hint: { ru: '', en: '' } },
		createDomain:     { canon: 'createDomain',     player: { ru: 'Создаёт мир',           en: 'Creates a world' },       hint: { ru: '', en: '' } },
		sharedWorldCore:  { canon: 'sharedWorldCore',  player: { ru: 'Ядро общего мира',      en: 'Shared world core' },     hint: { ru: '', en: '' } },
	},
}

// ---------------------------------------------------------------------------
// ХЕЛПЕРЫ
// ---------------------------------------------------------------------------

// Получить запись по категории и id. Принимает также прямой id (поиск во всех категориях).
export function lex(category, id) {
	if (id === undefined) {
		// одноаргументный режим: ищем id по всем категориям
		const key = category
		for (const cat of Object.keys(LEXICON)) {
			if (LEXICON[cat] && LEXICON[cat][key]) return LEXICON[cat][key]
		}
		return null
	}
	return (LEXICON[category] && LEXICON[category][id]) || null
}

// Понятное имя игрока (с учётом языка). Фолбэк на canon.
export function player(entry, lang) {
	if (!entry) return ''
	const l = lang || curLang()
	return (entry.player && (entry.player[l] || entry.player.ru)) || entry.canon || ''
}

// Каноническая подпись (санскрит/техника).
export function sub(entry) {
	return entry ? (entry.canon || '') : ''
}

// Подсказка (тултип).
export function hint(entry, lang) {
	if (!entry || !entry.hint) return ''
	const l = lang || curLang()
	return entry.hint[l] || entry.hint.ru || ''
}

// Главная функция показа.
// opts: { lang, withCanon (показать canon рядом), sacred (canon крупно) }
// Возвращает строку. Для HTML используйте labelHtml.
export function label(entry, opts) {
	if (!entry) return ''
	const o = opts || {}
	const lang = o.lang || curLang()
	const sacred = o.sacred !== undefined ? o.sacred : isSacredMode()
	const p = player(entry, lang)
	const c = sub(entry)
	if (sacred) {
		// сакральный режим: канон крупно, понятное в скобках
		return c ? (p && p !== c ? c + ' (' + p + ')' : c) : p
	}
	if (o.withCanon && c && c !== p) return p + ' · ' + c
	return p
}

// HTML-вариант: понятное крупно + canon мелким курсивом (или наоборот в sacred).
export function labelHtml(entry, opts) {
	if (!entry) return ''
	const o = opts || {}
	const lang = o.lang || curLang()
	const sacred = o.sacred !== undefined ? o.sacred : isSacredMode()
	const p = esc(player(entry, lang))
	const c = esc(sub(entry))
	const h = esc(hint(entry, lang))
	const titleAttr = h ? ' title="' + h + '"' : ''
	if (sacred) {
		const small = (p && p !== c) ? ' <span class="lex-sub">· ' + p + '</span>' : ''
		return '<span class="lex-term"' + titleAttr + '>' + c + small + '</span>'
	}
	const small = (c && c !== p) ? ' <span class="lex-sub">· ' + c + '</span>' : ''
	return '<span class="lex-term"' + titleAttr + '>' + p + small + '</span>'
}

function esc(s) {
	return String(s == null ? '' : s)
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

// Удобные шорткаты по категориям
export const Stage   = (id, opts) => label(lex('stage', id), opts)
export const Tier    = (id, opts) => label(lex('tier', id), opts)
export const Granthi = (id, opts) => label(lex('granthi', id), opts)
export const Guna    = (id, opts) => label(lex('guna', id), opts)
export const Status  = (id, opts) => label(lex('status', id), opts)
export const Ability = (id, opts) => label(lex('ability', id), opts)

// CSS для подписи (можно вставить один раз на страницу).
export const LEX_CSS = '.lex-sub{font-size:0.72em;opacity:0.55;font-style:italic;font-weight:400;}'
export function injectLexStyles() {
	try {
		if (typeof document === 'undefined') return
		if (document.getElementById('awara-lex-styles')) return
		const s = document.createElement('style')
		s.id = 'awara-lex-styles'
		s.textContent = LEX_CSS
		document.head.appendChild(s)
	} catch (e) {}
}

// Экспорт в window для не-модульных страниц.
try {
	if (typeof window !== 'undefined') {
		window.AwaraLex = { lex, label, labelHtml, player, sub, hint, isSacredMode, setSacredMode, toggleSacredMode, injectLexStyles, LEXICON }
	}
} catch (e) {}
