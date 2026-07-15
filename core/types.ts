// AWARA core — shared types for the transformed (WebGL / Three.js / GSAP) architecture.
// Pure types + constants. No runtime deps, safe to import anywhere.

/** Node ids of the cosmology graph (0 Void .. 7 Endgame). */
export type NodeId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Navigation directions: Vastu cross + zoom in/out (Tor/Egg). */
export type Direction = "north" | "south" | "east" | "west" | "in" | "out"

/** The four (+ether) elements parsed from the audio diary. */
export type Element = "earth" | "water" | "fire" | "air" | "ether"

export const ELEMENTS: Element[] = ["earth", "water", "fire", "air", "ether"]

/** Canon allows 9 chakras; the base loop uses the first 7. */
export const CHAKRA_NAMES = [
	"\u041c\u0443\u043b\u0430\u0434\u0445\u0430\u0440\u0430",
	"\u0421\u0432\u0430\u0434\u0445\u0438\u0441\u0442\u0445\u0430\u043d\u0430",
	"\u041c\u0430\u043d\u0438\u043f\u0443\u0440\u0430",
	"\u0410\u043d\u0430\u0445\u0430\u0442\u0430",
	"\u0412\u0438\u0448\u0443\u0434\u0445\u0430",
	"\u0410\u0434\u0436\u043d\u0430",
	"\u0421\u0430\u0445\u0430\u0441\u0440\u0430\u0440\u0430",
	"\u041c\u043e\u043d\u0430\u0434\u0430",
	"\u0410\u0431\u0441\u043e\u043b\u044e\u0442",
] as const

/** Authoritative player state. `light` (0..1) drives Dynamic Dimensionality. */
export interface PlayerState {
	/** Master "\u0421\u0432\u0435\u0442" 0..1 — flat/monochrome at 0, volumetric/colored at 1. */
	light: number
	/** Per-chakra charge 0..1 (length 7..9). */
	chakras: number[]
	/** Accumulated "\u0421\u043e\u043a" (experience) per element. */
	elements: Record<Element, number>
	/** Epoch ms of last diary entry (for entropy detection). */
	lastDiaryAt: number | null
	/** Temples built in the City of Temples (node 5), up to 33. */
	templesBuilt: number
	/** Накопленные за всю игру кристаллы света (атом добра). 10 000 = 1 светмонета. Драйвер light/coins/tiers. */
	crystalsTotal: number
	/** Выбранная игроком ступень размерности, зажатая сверху renderTier(coins). */
	renderTierSelected: RenderTier
	/** T5: созданные игроком источники силы внутри вселенной. */
	powerSources?: PowerSource[]
	/** T5: протянутые игроком тонкие связи между планами. */
	subtleLinks?: SubtleLink[]
	/** loka cultivation: per-loka influence growth, levels 0..9, fixation. */
	lokas?: LokaState[]
	/** T5: космические соборы — объединения источников/духов в мандалы. */
	cathedrals?: Cathedral[]
	/** T5: высшие космосы за пределами вселенной (Творец / Создатель Света). */
	outerCosmoses?: OuterCosmos[]
}

// ===== Экономика света: кристаллы света → светмонеты =====

/** 1 светмонета = 10 000 кристаллов света. */
export const CRYSTALS_PER_COIN = 10_000

/** Целые светмонеты из накопленных кристаллов света. */
export const lightCoins = (crystals: number): number => Math.floor(crystals / CRYSTALS_PER_COIN)
/** Кристаллы света сверх целых монет (0..CRYSTALS_PER_COIN-1). */
export const crystalsInCoin = (crystals: number): number =>
	crystals % CRYSTALS_PER_COIN
/** light 0..1 — прогресс к следующей светмонете (для шейдеров/HUD). */
export const lightProgress = (crystals: number): number =>
	(crystals % CRYSTALS_PER_COIN) / CRYSTALS_PER_COIN

// ===== Две оси проявления (обе выводятся из накопленных светмонет) =====

/** Ось ЦВЕТА: ч/б → полный спектр (как в grayscale-to-color). */
export type ColorLevel = 0 | 1 | 2 | 3 | 4
/** Ось РАЗМЕРНОСТИ: плоскость → песочница законов. */
export type RenderTier = 0 | 1 | 2 | 3 | 4 | 5

/** Пороги уровней цвета, в светмонетах (черновик — тюнится). */
export const COLOR_LEVEL_COINS = [0, 1, 3, 10, 25] as const
/** Пороги ступеней размерности, в светмонетах (черновик — тюнится). */
export const RENDER_TIER_COINS = [0, 1, 7, 21, 63, 189] as const

const tierFrom = (table: readonly number[], coins: number): number => {
	let t = 0
	for (let i = table.length - 1; i >= 0; i--) {
		if (coins >= table[i]) {
			t = i
			break
		}
	}
	return t
}

/** Текущий уровень цвета (0..4) по числу светмонет. */
export const colorLevel = (coins: number): ColorLevel =>
	tierFrom(COLOR_LEVEL_COINS, coins) as ColorLevel
/** Максимально разблокированная ступень размерности (0..5) по числу светмонет. */
export const renderTier = (coins: number): RenderTier =>
	tierFrom(RENDER_TIER_COINS, coins) as RenderTier

/** Фактическая ступень: выбранная игроком, но не выше разблокированной. */
export const effectiveTier = (state: PlayerState): RenderTier =>
	Math.min(state.renderTierSelected, renderTier(lightCoins(state.crystalsTotal))) as RenderTier

export function createPlayerState(partial: Partial<PlayerState> = {}): PlayerState {
	return {
		light: 0,
		chakras: [0, 0, 0, 0, 0, 0, 0],
		elements: { earth: 0, water: 0, fire: 0, air: 0, ether: 0 },
		lastDiaryAt: null,
		templesBuilt: 0,
		crystalsTotal: 0,
		renderTierSelected: 0,
		powerSources: [],
		subtleLinks: [],
		lokas: [],
		cathedrals: [],
		outerCosmoses: [],
		...partial,
	}
}

// ===== T5: Источники силы и тонкие связи (творение) =====

/** План бытия: материя (эта вселенная), тонкий (локи/Душа — вверх), человек (вниз). */
export type PlaneId = "material" | "subtle" | "human"

/** Форма источника силы, создаётся на T5. */
export type PowerSourceForm = "sun" | "constellation" | "spirit"

/** Вид духа (форма призыва на T5): планетарный, бытовой, дух Единого. */
export type SpiritKind = "planetary" | "household" | "unified"

/** Миры, духов которых можно призвать (высокие Меры М7/М8/М9). */
export const SPIRIT_WORLDS = [7, 8, 9] as const
export type SpiritWorld = (typeof SPIRIT_WORLDS)[number]

/** К чему привязана тонкая связь. */
export type LinkTargetKind = "agent" | "loka" | "human" | "universe"

/** Источник силы, созданный игроком внутри вселенной (T5). */
export interface PowerSource {
	id: string
	form: PowerSourceForm
	/** Агент-покровитель 0..20 (из 21): цвет, качества, стихия. */
	agentIndex: number
	/** Лока резонанса 0..13 (из 14): «высота»/план. */
	lokaIndex: number
	/** Позиция в сцене вселенной. */
	pos: [number, number, number]
	/** Сколько кристаллов света заперто в источнике. */
	investedCrystals: number
	/** Epoch ms of last feed (Pralaya counts neglect from here). */
	lastFedAt?: number
	/** Для form==="spirit": вид духа (планетарный/бытовой/дух Единого). */
	spiritKind?: SpiritKind
	/** Для form==="spirit": мира духа — 7, 8 или 9 (высокие Меры). */
	worldIndex?: SpiritWorld
	createdAt: number
}

/** Тонкая связь между планами: вверх к локам, вниз к человеку, между вселенными (T5). */
export interface SubtleLink {
	id: string
	fromPlane: PlaneId
	toPlane: PlaneId
	targetKind: LinkTargetKind
	/** Индекс цели в её наборе: агент 0..20, лока 0..13, иначе -1. */
	targetIndex: number
	/** Сколько кристаллов света заперто в связи. */
	investedCrystals: number
	createdAt: number
}

// ===== T5: Соборы / космические объединения =====
// Несколько источников силы и духов соединяются в единый узор-мандалу и
// начинают работать как одно космическое объединение (собор).

/** Узор, по которому выстроен собор. */
export type CathedralPattern = "mandala" | "ring" | "flower" | "star"

/** Космический собор: объединение созданных сил/духов в светящийся узор. */
export interface Cathedral {
	id: string
	/** Название собора (как назвал игрок). */
	name: string
	/** Узор объединения. */
	pattern: CathedralPattern
	/** id входящих источников/духов (PowerSource.id). */
	memberIds: string[]
	createdAt: number
}

// ===== T5: Высшее творение — безмерные космосы за пределами вселенной =====
// Творец и Создатель Света: огромные сферы-космосы ЗА пределами нашей вселенной.
// Безмерные: влияют сразу на ВСЕ Меры самим своим присутствием и медленно
// вращаются вокруг всего нашего космоса. Высший уровень творения (только T5).

/** Вид высшего космоса: Творец или Создатель Света. */
export type OuterCosmosKind = "creator" | "lightmaker"

/** Безмерный космос-сфера за пределами вселенной (T5). */
export interface OuterCosmos {
	id: string
	kind: OuterCosmosKind
	/** Сколько кристаллов света заперто в этом космосе. */
	investedCrystals: number
	createdAt: number
}

/** Цена призыва высшего космоса, в светмонетах (черновик — тюнится). */
export const OUTER_COSMOS_COST_COINS: Record<OuterCosmosKind, number> = {
	creator: 81,
	lightmaker: 81,
}

/** Цена призыва высшего космоса, в кристаллах света. */
export const outerCosmosCostCrystals = (kind: OuterCosmosKind): number =>
	coinsToCrystals(OUTER_COSMOS_COST_COINS[kind])

// ===== Экономика творения (T5): цена в кристаллах света / тапасе =====
// Свет, вложенный в связь, ЗАПИРАЕТСЯ в ней: crystalsTotal (и ступени) не падают,
// но свободный свет уменьшается. При разрыве связи свет возвращается.

/** Базовая цена источника по форме, в светмонетах (черновик — тюнится). */
export const SOURCE_FORM_COST_COINS: Record<PowerSourceForm, number> = {
	sun: 1,
	constellation: 2,
	spirit: 1,
}

/** Цена призыва духа по виду, в светмонетах (черновик — тюнится). */
export const SPIRIT_COST_COINS: Record<SpiritKind, number> = {
	planetary: 1,
	household: 1,
	unified: 2,
}

/** Цена связи с агентом, растёт со старшинством агента 0..20 → 1..3 монеты (черновик). */
export const agentLinkCostCoins = (agentIndex: number): number =>
	1 + Math.floor(Math.max(0, Math.min(20, agentIndex)) / 14)

/** Цена связи с локой, растёт с высотой локи 0..13 → 1..6 монет (черновик). */
export const lokaLinkCostCoins = (lokaIndex: number): number =>
	1 + Math.round((Math.max(0, Math.min(13, lokaIndex)) / 13) * 2)

/** Цена тонкой связи вниз к человеку, в светмонетах (черновик). */
export const HUMAN_LINK_COST_COINS = 1
/** Цена моста между вселенными, в светмонетах (черновик). */
export const UNIVERSE_LINK_COST_COINS = 2

/** Перевод цены из светмонет в кристаллы света. */
export const coinsToCrystals = (coins: number): number => Math.round(coins * CRYSTALS_PER_COIN)

/** Всего света заперто (вложено) в источники и связи, в кристаллах. */
export const investedCrystals = (state: PlayerState): number =>
	(state.powerSources ?? []).reduce((s, p) => s + p.investedCrystals, 0) +
	(state.subtleLinks ?? []).reduce((s, l) => s + l.investedCrystals, 0) +
	(state.outerCosmoses ?? []).reduce((s, c) => s + c.investedCrystals, 0)

/** Свободные кристаллы света, доступные к вложению в новые связи. */
export const freeCrystals = (state: PlayerState): number =>
	Math.max(0, state.crystalsTotal - investedCrystals(state))

/** Цена тонкой связи по цели, в кристаллах света. */
export const linkCostCrystals = (kind: LinkTargetKind, targetIndex: number): number => {
	switch (kind) {
		case "agent":
			return coinsToCrystals(agentLinkCostCoins(targetIndex))
		case "loka":
			return coinsToCrystals(lokaLinkCostCoins(targetIndex))
		case "human":
			return coinsToCrystals(HUMAN_LINK_COST_COINS)
		case "universe":
			return coinsToCrystals(UNIVERSE_LINK_COST_COINS)
	}
}

/** Цена источника силы по форме (для духа — по виду), в кристаллах света. */
export const sourceCostCrystals = (
	form: PowerSourceForm,
	spiritKind?: SpiritKind,
): number =>
	coinsToCrystals(
		form === "spirit"
			? SPIRIT_COST_COINS[spiritKind ?? "planetary"]
			: SOURCE_FORM_COST_COINS[form],
	)


// ===== Loka cultivation: influence, levels, fixation =====
// A loka grows from EVERYTHING (its "spirit"): temples/mind/soul (indirect, via
// light-coins) and direct work — source/mantra/service/places of power, daimons,
// Tigel, the matrix of meras/chakras. Light feeds all in different proportions.
// Every loka has 9 levels. Dark lokas (lower worlds) run the other way: at first
// unruly, sucking light like black holes; as you work them they get subdued and,
// at the fixation mera, serve the yogi, becoming supernova supergenerators.

/** Loka polarity: light (upper), earth (center Bhur), dark (lower worlds). */
export type LokaPolarity = "light" | "earth" | "dark"

/** Every loka has 9 levels (light upward, dark "downward"). */
export const LOKA_MAX_LEVEL = 9

/** Fixation mera for a dark loka: from here it is subdued and serves. */
export const DARK_SUBDUE_LEVEL = 6

/** Loka polarity by index 0..13 (0 Satya .. 6 Bhur .. 13 Patala). */
export const lokaPolarity = (lokaIndex: number): LokaPolarity => {
	const i = Math.max(0, Math.min(13, lokaIndex))
	if (i <= 5) return "light"
	if (i === 6) return "earth"
	return "dark"
}

/** Nourishment channels of a loka (light feeds all in different proportions). */
export interface LokaNourish {
	/** Indirect: temples / mind / soul -> light-coins. */
	temple: number
	/** Direct: source / mantra / service / places of power. */
	source: number
	/** Work with daimon-agents. */
	daimon: number
	/** Tigel — daily water-light ritual. */
	tigel: number
	/** Matrix of meras and chakras. */
	matrix: number
}

/** Channel weights: direct work feeds stronger than indirect. */
export const LOKA_NOURISH_WEIGHT: Record<keyof LokaNourish, number> = {
	temple: 0.5,
	source: 1.0,
	daimon: 0.7,
	tigel: 0.8,
	matrix: 0.6,
}

/** Per-loka cultivation state. */
export interface LokaState {
	/** Loka index 0..13. */
	index: number
	/** Level 0..9. For a dark loka — degree of subjugation/transformation. */
	level: number
	/** Progress to next level 0..1 (visually: filling the Mera). */
	influence: number
	/** Fixed at current level (Pralaya leaves it alone). */
	fixed: boolean
	/** Dark loka: subdued (serves, became a supergenerator). */
	subdued: boolean
	/** Contribution per channel (for breakdown/balance). */
	nourish: LokaNourish
	/** Epoch ms of last feed. */
	lastFedAt: number | null
}

/** Make an empty cultivation state for a loka. */
export function createLokaState(index: number): LokaState {
	return {
		index: Math.max(0, Math.min(13, index)),
		level: 0,
		influence: 0,
		fixed: false,
		subdued: false,
		nourish: { temple: 0, source: 0, daimon: 0, tigel: 0, matrix: 0 },
		lastFedAt: null,
	}
}

/** Overall 0..1 fill of a loka for the Mera visual: level + current progress. */
export const lokaFill = (s: LokaState): number =>
	Math.max(0, Math.min(1, (s.level + Math.max(0, Math.min(1, s.influence))) / LOKA_MAX_LEVEL))
