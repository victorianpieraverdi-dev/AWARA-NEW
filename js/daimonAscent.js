// js/daimonAscent.js
// Чистый helper Восхождения Даймона: 9 Мер x 7 чакр x 5 стадий x 21 агент.
// БЕЗ побочных эффектов и без записи в state. Всё вычисляется из:
//   daimon.chakra (1..9), daimon.element ('fire'|'water'|'earth'|'air'|'ether'),
//   daimon.evolutionStage, daimon.granthiPierced, state.totalLight,
//   и массива агентов из data/agents.json (передаётся аргументом).
// Единственный источник истины по агентам — agents.json. Здесь только логика.
// Пороги чакр и стадии живут в daimon-module.js / daimon-stages.json — не дублируем.

// --- 9 Мер (= чакры 1..9; 8 Монада, 9 Абсолют) ---
export const MERA = [
	{ mera: 1, chakra: 'Муладхара',   element: 'Земля',  color: '#e23b3b' },
	{ mera: 2, chakra: 'Свадхистхана', element: 'Вода',   color: '#f3892b' },
	{ mera: 3, chakra: 'Манипура',    element: 'Огонь',  color: '#f6d033' },
	{ mera: 4, chakra: 'Анахата',     element: 'Воздух', color: '#46c46a' },
	{ mera: 5, chakra: 'Вишуддха',    element: 'Эфир',   color: '#34c6d8' },
	{ mera: 6, chakra: 'Аджна',       element: 'Свет',   color: '#3b6fe2' },
	{ mera: 7, chakra: 'Сахасрара',   element: 'Сознание', color: '#9b4ff3' },
	{ mera: 8, chakra: 'Монада',      element: 'Монадический Свет', color: '#b9c4e0' },
	{ mera: 9, chakra: 'Абсолют',     element: 'Абсолют', color: '#cdb9f0' }
]

// --- 3 группы Вертикали ---
export const GROUPS = {
	1: { id: 1, name: 'Первая Группа · Инволюция', meras: [1, 2, 3], color: '#7a4a2a', contour: 'тамас' },
	2: { id: 2, name: 'Солнце Первоматерии',       meras: [4, 5, 6], color: '#ffcf6a', contour: 'раджас' },
	3: { id: 3, name: 'Высокие Меры',              meras: [7, 8, 9], color: '#b58cff', contour: 'саттва' }
}

// --- Точка Сборки (Ведическая пирамида, 6 уровней) ---
export const ASSEMBLAGE_LEVELS = [
	{ key: 'dasju',    name: 'Дасью',    pos: 'низ тела' },
	{ key: 'shudra',   name: 'Шудра',    pos: 'низ тела' },
	{ key: 'vaishya',  name: 'Вайшью',   pos: 'солнечное сплетение' },
	{ key: 'kshatriy', name: 'Кшатрий',  pos: 'плечи' },
	{ key: 'brahman',  name: 'Брахман',  pos: 'у Луча Восприятия' },
	{ key: 'avatar',   name: 'Аватар',   pos: '8–13 м над макушкой' }
]

// --- Стадии (зеркало daimon-stages.json, для подписей) ---
export const STAGE_NAMES = {
	1: 'Пашу', 2: 'Вира', 3: 'Садхака', 4: 'Дживанмукта', 5: 'Парамукти'
}

// Грантхи -> номер стадии (как в daimon-module.js GRANTHI_TO_STAGE)
export const GRANTHI_TO_STAGE = { brahma: 2, vishnu: 3, rudra: 4 }

// --- Домера (pre-measure, -3..0): «Манас природы / фантазия Даймона» ---
// Аддитивный слой НИЖЕ Меры 1 (Муладхара). Не влияет на 1-9 логику выше:
// это отдельная шкала для допороговых/инстинктивных/фантазийных откликов
// Даймона (сны, интуитивные образы, детская/животная часть психики) —
// область, из которой Даймон говорит ДО того, как опыт окреп до Меры 1.
// ДОБАВЛЕНО для «Голоса совести» (см. awara-voice-conscience.js) —
// в каноне 9 Мер такого диапазона не было, это расширение по запросу
// геймдизайнера; при уточнении канона можно скорректировать имена/цвета.
export const PRE_MERA = [
	{ mera: -3, name: 'Тень инстинкта',  desc: 'выживание, реакция тела до мысли' },
	{ mera: -2, name: 'Влечение',        desc: 'тяга, отвращение, сырое желание' },
	{ mera: -1, name: 'Фантазия',        desc: 'образ, грёза, ещё не оформленная воля' },
	{ mera: 0,  name: 'Манас природы',   desc: 'порог пробуждения — природный ум Даймона перед Муладхарой' }
]

// Плоская шкала -3..9 для скоринга: pre-measure ниже нуля, затем обычные Меры.
export function clampPreMera(n) {
	const v = Number(n)
	if (!Number.isFinite(v)) return 0
	return Math.max(-3, Math.min(9, Math.round(v)))
}
export function getPreMera(n) {
	const v = clampPreMera(n)
	if (v <= 0) return PRE_MERA.find(p => p.mera === v) || PRE_MERA[PRE_MERA.length - 1]
	return null // 1..9 — используй getMera()
}

// --- Глобальное кольцо Супер-Игры по накопленному свету (engine_config.json
// v2.3, light_flow.supergame_board_thresholds). Это НЕ позиция фишки на борде
// конкретной линзы (та живёт в state.superGame.boards и двигается кубиком) —
// это персистентный игровой стат уровня Мер: общий state.totalLight →
// кольцо -3..9. Пороги взяты из спеки дословно.
export const RING_LIGHT_THRESHOLDS = [
	{ ring: -3, light: 0 },
	{ ring: -2, light: 5 },
	{ ring: -1, light: 15 },
	{ ring: 0,  light: 30 },
	{ ring: 1,  light: 50 },
	{ ring: 2,  light: 100 },
	{ ring: 3,  light: 200 },
	{ ring: 4,  light: 400 },
	{ ring: 5,  light: 700 },
	{ ring: 6,  light: 1200 },
	{ ring: 7,  light: 2000 },
	{ ring: 8,  light: 3500 },
	{ ring: 9,  light: 6000 }
]
export function getCurrentRing(totalLight) {
	const L = Number(totalLight)
	if (!Number.isFinite(L) || L <= 0) return -3
	let ring = -3
	for (const t of RING_LIGHT_THRESHOLDS) {
		if (L >= t.light) ring = t.ring
		else break
	}
	return ring
}

// Нормализация стихии: id Даймона ('fire'...) <-> русское имя из agents.json.
const ELEMENT_RU_BY_ID = { fire: 'Огонь', water: 'Вода', earth: 'Земля', air: 'Воздух', ether: 'Эфир' }
const ELEMENT_ID_BY_RU = { 'Огонь': 'fire', 'Вода': 'water', 'Земля': 'earth', 'Воздух': 'air', 'Эфир': 'ether' }

export function elementToId(value) {
	if (!value) return null
	if (ELEMENT_RU_BY_ID[value]) return value           // уже id
	if (ELEMENT_ID_BY_RU[value]) return ELEMENT_ID_BY_RU[value]
	return null
}
export function elementToRu(value) {
	if (!value) return null
	if (ELEMENT_ID_BY_RU[value]) return value            // уже русское
	if (ELEMENT_RU_BY_ID[value]) return ELEMENT_RU_BY_ID[value]
	return null
}

function clampChakra(chakra) {
	const n = Number(chakra) || 1
	return Math.max(1, Math.min(9, n))
}

// --- Базовые производные ---
export function getMera(chakra) {
	return MERA[clampChakra(chakra) - 1]
}

export function getGroup(mera) {
	const m = clampChakra(mera)
	if (m <= 3) return GROUPS[1]
	if (m <= 6) return GROUPS[2]
	return GROUPS[3]
}

// Порог Восхождения = Анахата (Мера 4). Ниже Пупа: Меры 1-3.
export function isAboveNavel(mera) {
	return clampChakra(mera) >= 4
}

export function ascentPhase(mera) {
	return isAboveNavel(mera) ? 'Восхождение' : 'Инволюция'
}

// --- Точка Сборки: уровень по Мере, НО не выше, чем позволяет Свет игрока ---
function assemblageIndexByMera(mera) {
	const m = clampChakra(mera)
	if (m <= 1) return 0 // Дасью
	if (m === 2) return 1 // Шудра
	if (m === 3) return 2 // Вайшью
	if (m <= 5) return 3 // Кшатрий (Анахата-Вишуддха)
	if (m <= 7) return 4 // Брахман (Аджна-Сахасрара)
	return 5             // Аватар (Монада-Абсолют)
}
function assemblageMaxByLight(totalLight) {
	const L = Number(totalLight) || 0
	if (L < 500) return 1   // до Шудры
	if (L < 2000) return 2  // до Вайшью
	if (L < 8000) return 3  // до Кшатрия
	if (L < 20000) return 4 // до Брахмана
	return 5                // Аватар
}
export function getAssemblagePoint(mera, totalLight) {
	const idx = Math.min(assemblageIndexByMera(mera), assemblageMaxByLight(totalLight))
	const capped = assemblageIndexByMera(mera) > assemblageMaxByLight(totalLight)
	return Object.assign({ index: idx, cappedByLight: capped }, ASSEMBLAGE_LEVELS[idx])
}

// --- Контур, открытый текущей группой ---
export function getOpenContour(group) {
	const g = typeof group === 'number' ? GROUPS[group] : group
	return g ? g.contour : 'тамас'
}

// --- Резонанс с 21 агентом (agents — массив из data/agents.json) ---
function sameElement(agent, elementId) {
	return elementToId(agent && agent.element) === elementId
}

// Патрон: агент той же стихии. Приоритет по лучу (ray 1 первее), затем по id.
export function getPatronAgent(daimonElement, agents) {
	const id = elementToId(daimonElement)
	if (!id || !Array.isArray(agents)) return null
	const pool = agents.filter(a => sameElement(a, id))
	pool.sort((a, b) => (a.ray - b.ray) || (a.id - b.id))
	return pool[0] || null
}

// Все агенты-резонансы по стихии Даймона.
export function getResonantAgents(daimonElement, agents) {
	const id = elementToId(daimonElement)
	if (!id || !Array.isArray(agents)) return []
	return agents.filter(a => sameElement(a, id))
}

// Агенты текущего контура (по гуне группы).
export function getContourAgents(group, agents) {
	const contour = getOpenContour(group)
	if (!Array.isArray(agents)) return []
	return agents.filter(a => a && a.guna === contour)
}

// Доступные союзники: пересечение контура группы и общего резонанса по стихии,
// плюс гарантированно — патрон.
export function getAvailableAllies(daimon, group, agents) {
	if (!Array.isArray(agents)) return []
	const patron = getPatronAgent(daimon && daimon.element, agents)
	const contourAgents = getContourAgents(group, agents)
	const seen = new Set()
	const out = []
	if (patron) { out.push(patron); seen.add(patron.id) }
	for (const a of contourAgents) {
		if (!seen.has(a.id)) { out.push(a); seen.add(a.id) }
	}
	return out
}

// --- Единая сводка состояния Восхождения (для рендера панели) ---
export function getAscentState(daimon, state, agents) {
	const d = daimon || {}
	const chakra = clampChakra(d.chakra)
	const mera = getMera(chakra)
	const group = getGroup(chakra)
	const totalLight = (state && (state.totalLight != null ? state.totalLight : (state.light && state.light.totals && state.light.totals.totalLight))) || 0
	return {
		chakra,
		mera,
		group,
		phase: ascentPhase(chakra),
		aboveNavel: isAboveNavel(chakra),
		assemblage: getAssemblagePoint(chakra, totalLight),
		contour: getOpenContour(group),
		stageName: STAGE_NAMES[d.evolutionStage || 1] || STAGE_NAMES[1],
		patron: getPatronAgent(d.element, agents),
		allies: getAvailableAllies(d, group, agents),
		resonant: getResonantAgents(d.element, agents)
	}
}

// Следующее открытие: что даст переход на следующую Меру.
export function getNextUnlock(chakra) {
	const m = clampChakra(chakra)
	if (m >= 9) return null
	const next = getMera(m + 1)
	const nextGroup = getGroup(m + 1)
	const crossesNavel = !isAboveNavel(m) && isAboveNavel(m + 1)
	const changesGroup = getGroup(m).id !== nextGroup.id
	return {
		mera: next,
		group: nextGroup,
		crossesNavel,          // пересечение Пупа (порог Восхождения)
		changesContour: changesGroup,
		newContour: changesGroup ? nextGroup.contour : null
	}
}
