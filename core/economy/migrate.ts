// core/economy/migrate.ts
//
// МИГРАЦИЯ СТАРОГО СЕЙВА → НОВЫЙ PlayerState.
//
// Контекст для новичка:
//   Старая игра (legacy) хранит прогресс в localStorage под ключом
//   "awara_v258_state" (подтверждено в js/core-module.js → STORAGE_KEYS.STATE).
//   «Свет» там — одно целое число (totalLight).
//   Новая модель (core/types.ts) считает тот же свет «кристаллами света»:
//   1 единица старого света = 1 кристалл. 10 000 кристаллов = 1 светмонета.
//
// ВАЖНО: базовые формулы экономики (lightCoins, renderTier и т.д.)
// уже живут в core/types.ts — здесь мы их НЕ дублируем, а импортируем.

import {
	type Element,
	type PlayerState,
	type RenderTier,
	createPlayerState,
	lightCoins,
	lightProgress,
	renderTier,
} from "../types"

// Ключи localStorage.
// ВАЖНО: новый ключ = тот, куда УЖЕ пишет app/PlayerProvider.tsx (живые сейвы).
// В docs/ECONOMY_MIGRATION.md ключ назван "awara_player_v1", но к моменту
// монтирования миграции продакшен-стек React уже сохранял прогресс под
// "awara.player.state" — используем его, чтобы не осиротить живые сейвы.
export const LEGACY_STORAGE_KEY = "awara_v258_state"
export const PLAYER_STORAGE_KEY = "awara.player.state"

/** Зажать число в диапазон 0..1. */
const clamp01 = (n: number): number => Math.max(0, Math.min(1, n))

/**
 * Минимум полей, которые нам нужны из старого сейва.
 * Всё опционально: старые сейвы бывают неполными.
 * (Старый формат богаче: sphereData/spirit/cauldron/journey и пр. —
 *  эти поля пока НЕ переносим в лёгкий PlayerState, см. TODO ниже.)
 */
export interface LegacyV258State {
	totalLight?: number
	renderTier?: number
	/** Старые стихии с русскими ключами (Огонь/Вода/…). */
	elements?: Record<string, number>
	// Остальные поля старого сейва пока игнорируем.
	[key: string]: unknown
}

// ===== Стихии: старые русские ключи → новый Element =====
// И старая, и новая модель копят «Сок» по стихиям — перенос без потерь.
const LEGACY_ELEMENT_MAP: Record<string, Element> = {
	"\u041e\u0433\u043e\u043d\u044c": "fire",
	"\u0412\u043e\u0434\u0430": "water",
	"\u0417\u0435\u043c\u043b\u044f": "earth",
	"\u0412\u043e\u0437\u0434\u0443\u0445": "air",
	"\u042d\u0444\u0438\u0440": "ether",
}

/** Переносим старые стихии (рус. ключи) в новый Record<Element, number>. */
function migrateElements(legacyElements: unknown): Record<Element, number> {
	const out: Record<Element, number> = { earth: 0, water: 0, fire: 0, air: 0, ether: 0 }
	if (legacyElements && typeof legacyElements === "object") {
		for (const [ruKey, value] of Object.entries(legacyElements as Record<string, unknown>)) {
			const en = LEGACY_ELEMENT_MAP[ruKey]
			const num = Number(value)
			if (en && Number.isFinite(num)) out[en] = num
		}
	}
	return out
}

// ===== Презентационные оси прогресса (выводятся из кристаллов) =====
// Это НЕ новые поля состояния, а вычисляемые «ярлыки» по crystalsTotal.
// Обе оси подтверждены в коде:
//   • Уровни Души — js/universe/universeProgression.js (UNIVERSE_LEVELS.minLight)
//   • Державы РА — js/core-module.js (STAGES.threshold)

/** Общий хелпер: индекс порога, ниже которого опустилось значение. */
const indexFromThresholds = (table: readonly number[], value: number): number => {
	let idx = 0
	for (let i = table.length - 1; i >= 0; i--) {
		if (value >= table[i]) {
			idx = i
			break
		}
	}
	return idx
}

/**
 * Уровни Души (старая прогрессия вселенной).
 * Пороги в свете (= кристаллах): 0 / 500 / 2000 / 7000 / 25000 / 100000.
 */
export const SOUL_LEVEL_THRESHOLDS = [0, 500, 2000, 7000, 25000, 100000] as const
export const SOUL_LEVEL_NAMES = [
	"\u0410\u0445\u0430\u043c\u043a\u0430\u0440\u0430",
	"\u0414\u0443\u0448\u0430",
	"\u0414\u0436\u0438\u0432\u0430",
	"\u0414\u0443\u0445",
	"\u0421\u043e\u0431\u043e\u0440",
	"\u0418\u0433\u0440\u0430 \u041c\u0438\u0440\u043e\u0437\u0434\u0430\u043d\u0438\u044f",
] as const
/** Индекс уровня Души 0..5 по кристаллам. */
export const soulLevelIndex = (crystals: number): number =>
	indexFromThresholds(SOUL_LEVEL_THRESHOLDS, crystals)

/**
 * Державы РА — ОТДЕЛЬНАЯ ось «ранг служения» (endgame, узел 7),
 * А НЕ уровень Души. Пороги: 0 / 3000 / 7000 / 10000 / 25000 / 50000.
 */
export const RA_RANK_THRESHOLDS = [0, 3000, 7000, 10000, 25000, 50000] as const
export const RA_RANK_NAMES = [
	"\u0418\u041d\u0418\u0426\u0418\u0410\u0422",
	"\u0412\u041e\u0418\u041d \u0421\u0412\u0415\u0422\u0410",
	"\u041c\u0423\u0414\u0420\u0415\u0426",
	"\u0426\u0410\u0420\u042c",
	"\u0411\u0423\u0414\u0414\u0410",
	"\u041f\u041b\u0410\u041d\u0415\u0422\u0410\u0420\u041d\u042b\u0419 \u041b\u041e\u0413\u041e\u0421",
] as const
/** Индекс ранга РА 0..5 по кристаллам. */
export const raRankIndex = (crystals: number): number =>
	indexFromThresholds(RA_RANK_THRESHOLDS, crystals)

// ===== Собственно миграция =====

/**
 * PlayerState + служебные поля миграции/моста (см. docs/ECONOMY_MIGRATION.md §4).
 * Держим их здесь (а не в core/types.ts), чтобы не засорять чистую модель:
 * PlayerProvider сохраняет объект целиком, так что поля переживают перезагрузки.
 */
export interface MigratedPlayerState extends PlayerState {
	/** Откуда мигрировали (метка из доки: 'v258'). */
	_migratedFrom?: string
	/** Когда мигрировали (epoch ms). */
	_migratedAt?: number
	/**
	 * МОСТ ПЕРЕХОДНОГО ПЕРИОДА: последнее значение legacy totalLight,
	 * которое уже учтено в crystalsTotal. Пока legacy-модули (temple,
	 * «Голос совести», суперигра …) продолжают копить свет в awara_v258_state,
	 * каждый заход в новый стек добирает ПОЛОЖИТЕЛЬНУЮ дельту:
	 *   crystalsTotal += max(0, totalLight − legacyLightSeen).
	 * Отрицательные дельты (трата света на апгрейд Храма, потери Илдабаофа,
	 * сброс Создателя) кристаллы НЕ уменьшают: crystalsTotal — накопительный
	 * счётчик добрых дел, а не расходуемый баланс.
	 */
	legacyLightSeen?: number
}

/**
 * Превращаем старый сейв в новый PlayerState без потери света.
 * - crystalsTotal       ← старый totalLight (1:1)
 * - light (0..1)         ← прогресс к следующей светмонете (для шейдера/HUD)
 * - elements            ← старые стихии (рус. ключи → en)
 * - renderTierSelected   ← старый выбор, но не выше разблокированного
 *
 * TODO (при интеграции): решить, куда ложатся sphereData, spirit,
 * cauldron, journey, soulPassport, daimon — либо расширить PlayerState,
 * либо хранить рядом отдельным блоком.
 */
export function migrateLegacyState(legacy: LegacyV258State): MigratedPlayerState {
	const rawLight = Number(legacy.totalLight ?? 0)
	const crystalsTotal = Math.max(0, Math.round(Number.isFinite(rawLight) ? rawLight : 0))

	// Сколько ступеней размерности уже разблокировано этим светом.
	const unlockedTier = renderTier(lightCoins(crystalsTotal))

	// Если в старом сейве был выбор тира — уважаем его, но не выше разблока.
	const rawSelected = Number(legacy.renderTier)
	const renderTierSelected = (
		Number.isFinite(rawSelected)
			? Math.max(0, Math.min(Math.round(rawSelected), unlockedTier))
			: unlockedTier
	) as RenderTier

	return {
		...createPlayerState({
			crystalsTotal,
			light: clamp01(lightProgress(crystalsTotal)),
			elements: migrateElements(legacy.elements),
			renderTierSelected,
		}),
		_migratedFrom: "v258",
		_migratedAt: Date.now(),
		legacyLightSeen: crystalsTotal,
	}
}

// ===== Мост переходного периода (1–2 релиза, см. доку §5) =====
//
// Legacy-модули (temple-module.js, awara-voice-conscience.js, superGameBoard.js,
// universeProgression.js, daimonAscent.js …) продолжают читать/писать
// awara_v258_state.totalLight как раньше — их НЕ трогаем, ключ НЕ удаляем.
// Новый стек при каждой загрузке добирает заработанный там свет дельтой.
//
// Обратно (кристаллы → legacy totalLight) НЕ пишем: totalLight в legacy —
// РАСХОДУЕМЫЙ баланс (Храм тратит, Илдабаоф отнимает), а crystalsTotal —
// накопительный; запись абсолютного значения «возвращала бы» потраченный свет
// и ломала бы экономику Храма. Перевод legacy-модулей на единый API —
// следующий шаг доки (§5 п.3), после него мост станет не нужен.

/**
 * Добрать в кристаллы свет, заработанный в legacy-модулях после миграции.
 * Идемпотентно: повторный вызов без изменений в legacy ничего не меняет.
 * Legacy-ключ только читается — никогда не пишется и не удаляется.
 */
export function syncLegacyLight(
	state: MigratedPlayerState,
	storage: Storage = localStorage,
): MigratedPlayerState {
	let legacyRaw: string | null = null
	try {
		legacyRaw = storage.getItem(LEGACY_STORAGE_KEY)
	} catch {
		return state
	}
	if (!legacyRaw) return state

	let legacyLight = 0
	try {
		const parsed = JSON.parse(legacyRaw) as LegacyV258State
		const n = Number(parsed?.totalLight ?? 0)
		legacyLight = Math.max(0, Math.round(Number.isFinite(n) ? n : 0))
	} catch {
		return state
	}

	const seen = Number(state.legacyLightSeen)
	if (!Number.isFinite(seen)) {
		// Сейв нового стека существовал ДО моста (кристаллы копились отдельно,
		// в основном дебаг-кнопками). Однократная сверка без двойного счёта:
		// берём больший из двух прогрессов.
		const crystalsTotal = Math.max(state.crystalsTotal, legacyLight)
		return {
			...state,
			crystalsTotal,
			light: clamp01(lightProgress(crystalsTotal)),
			legacyLightSeen: legacyLight,
		}
	}

	if (legacyLight === seen) return state

	// Положительная дельта — заработанный в legacy свет; отрицательная
	// (трата/потеря) кристаллы не уменьшает, только сдвигает отметку.
	const delta = Math.max(0, legacyLight - seen)
	const crystalsTotal = state.crystalsTotal + delta
	return {
		...state,
		crystalsTotal,
		light: clamp01(lightProgress(crystalsTotal)),
		legacyLightSeen: legacyLight,
	}
}

/**
 * Идемпотентная загрузка состояния игрока.
 * 1) есть новый сейв — берём его;
 * 2) иначе есть старый — мигрируем ОДИН раз
 *    (старый ключ НЕ удаляем — нужен для отката);
 * 3) иначе — свежий чистый игрок.
 * Затем в любом случае добираем свет, заработанный в legacy-модулях
 * (syncLegacyLight), и сохраняем новый сейв, если что-то изменилось.
 */
export function loadPlayerState(storage: Storage = localStorage): MigratedPlayerState {
	let state: MigratedPlayerState | null = null
	let dirty = false

	const fresh = storage.getItem(PLAYER_STORAGE_KEY)
	if (fresh) {
		try {
			state = JSON.parse(fresh) as MigratedPlayerState
		} catch {
			// битый новый сейв — пробуем миграцию/дефолт ниже
		}
	}

	if (!state) {
		const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY)
		if (legacyRaw) {
			try {
				state = migrateLegacyState(JSON.parse(legacyRaw) as LegacyV258State)
				dirty = true
			} catch {
				// не смогли разобрать старый — отдаём дефолт
			}
		}
	}

	if (!state) state = createPlayerState() as MigratedPlayerState

	const synced = syncLegacyLight(state, storage)
	if (synced !== state) {
		state = synced
		dirty = true
	}

	if (dirty) savePlayerState(state, storage)
	return state
}

/** Сохранить новый сейв. */
export function savePlayerState(
	state: PlayerState,
	storage: Storage = localStorage,
): void {
	storage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state))
}
