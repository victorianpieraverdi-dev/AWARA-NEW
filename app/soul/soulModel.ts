// AWARA · Родная Душа (React) — модель данных.
// Инкремент 1 по docs/soul-merge-plan.md.
// Канон архетипов — из старой initiation-space.html;
// структура 5 сфер и слой данных — из новой spheres-v2.html.
// Принцип «компас, не рельсы»: свет влияет на яркость/слоты, но ничего не блокирует жёстко.

export type SoulSphereId =
	| "soul" // ДУША   — PRIMAL (ядро)
	| "osnova" // ОСНОВА — shiva
	| "serdce" // СЕРДЦЕ — vishnu
	| "razum" // РАЗУМ   — brahma (мысль/мечта)
	| "svyazi" // СВЯЗИ  — COTV (связи/обмен)

export type JournalEntryType =
	| "insight" // инсайт
	| "observation" // наблюдение
	| "feeling" // чувство
	| "dream" // сон/мечта
	| "question" // вопрос

export type MediaKind = "image" | "video" | "audio" | "link"

export interface SoulComment {
	id: string
	author: string
	text: string
	createdAt: number
}

export interface JournalEntry {
	id: string
	type: JournalEntryType
	title?: string
	body: string
	createdAt: number
	comments?: SoulComment[]
}

export interface PlanItem {
	id: string
	text: string
	done: boolean
	createdAt: number
}

export interface MediaItem {
	id: string
	kind: MediaKind
	// data — dataURL (фото/видео/аудио) или url (ссылка)
	data: string
	caption?: string
	createdAt: number
}

export interface SocialLink {
	id: string
	url: string
	label?: string
}

// Подсфера — живая микро-сфера внутри сферы (до 3, слоты по свету).
// Этап 1+: у подсферы есть свой свет, символ и (опц.) назначенная задача/курс.
export interface SubSphere {
	id: string
	text: string
	color?: string
	createdAt: number
	media?: MediaItem[]
	// свой свет 0..1 (перетекает по связям — Этап 4). По умолчанию 0.
	light?: number
	// свой символ (если не задан — берётся глиф родительской сферы)
	glyph?: string
	// назначенная задача или курс (Этап 5)
	task?: string
	// заметки/смысл грани (Этап 3) — короткие записи внутри подсферы
	notes?: string[]
}

// Пользовательское оформление сферы (вкладка «Стиль»).
export interface SphereStyle {
	color?: string
	size?: number // px, база 34
	glow?: number // 0..100
}

// Живое состояние сферы (персистится).
export interface SoulSphereState {
	id: SoulSphereId
	subSpheres: SubSphere[]
	journal: JournalEntry[]
	plans: PlanItem[]
	media: MediaItem[]
	social: SocialLink[]
	style?: SphereStyle
	// нормализованный свет сферы 0..1 (производный от нашего ядра + активности)
	light?: number
}

// Неизменяемый канон сферы (архетип, цвет, подсказка).
export interface SoulSphereCanon {
	id: SoulSphereId
	name: string // отображаемое имя
	archetype: string // shiva / vishnu / brahma / primal / cotv
	color: string // hex
	rgb: [number, number, number]
	glyph: string
	prompt: string // смысловой вопрос-приглашение
	// пороги света 0..1 для открытия слотов подсфер («компас, не рельсы»)
	slotThresholds: [number, number, number]
}

// Канон 5 сфер: структура из spheres-v2, архетипы/цвета из initiation-space.
export const SOUL_CANON: Record<SoulSphereId, SoulSphereCanon> = {
	soul: {
		id: "soul",
		name: "ДУША",
		archetype: "primal",
		color: "#b06ce0",
		rgb: [176, 108, 224],
		glyph: "✦",
		prompt: "Что сейчас живёт в твоём центрe?",
		slotThresholds: [0, 0.25, 0.55],
	},
	osnova: {
		id: "osnova",
		name: "ОСНОВА",
		archetype: "shiva",
		color: "#7b68ee",
		rgb: [123, 104, 238],
		glyph: "●",
		prompt: "На чём ты стоишь? Что держит тебя?",
		slotThresholds: [0, 0.2, 0.5],
	},
	serdce: {
		id: "serdce",
		name: "СЕРДЦЕ",
		archetype: "vishnu",
		color: "#3ddc84",
		rgb: [61, 220, 132],
		glyph: "♥",
		prompt: "Что ты любишь? Что тебя согревает?",
		slotThresholds: [0, 0.2, 0.5],
	},
	razum: {
		id: "razum",
		name: "РАЗУМ",
		archetype: "brahma",
		color: "#ff7043",
		rgb: [255, 112, 67],
		glyph: "◈",
		prompt: "О чём ты думаешь? О чём мечтаешь?",
		slotThresholds: [0, 0.25, 0.55],
	},
	svyazi: {
		id: "svyazi",
		name: "СВЯЗИ",
		archetype: "cotv",
		color: "#4fc3f7",
		rgb: [79, 195, 247],
		glyph: "⇄",
		prompt: "Кто рядом? С кем ты связан?",
		slotThresholds: [0, 0.3, 0.6],
	},
}

export const SOUL_SPHERE_ORDER: SoulSphereId[] = [
	"soul",
	"osnova",
	"serdce",
	"razum",
	"svyazi",
]

export const SOUL_STORAGE_KEY = "awara_soul_v1"
export const LEGACY_SUBSPHERES_KEY = "awara_subspheres_v3"
export const SOUL_DAY_CONTEXT_KEY = "awara_soul_day_context"

// Сколько слотов подсфер открыто при данном свете (0..3).
// Компас: это рекомендация для UI, а не жёсткая блокировка.
export function openSlots(sphereId: SoulSphereId, light: number): number {
	const th = SOUL_CANON[sphereId].slotThresholds
	const l = Number.isFinite(light) ? Math.max(0, Math.min(1, light)) : 0
	let n = 0
	for (const t of th) if (l >= t) n++
	return n
}

// Чистое начальное состояние сферы.
export function emptySphereState(id: SoulSphereId): SoulSphereState {
	return {
		id,
		subSpheres: [],
		journal: [],
		plans: [],
		media: [],
		social: [],
		light: 0,
	}
}

export type SoulState = Record<SoulSphereId, SoulSphereState>

export function emptySoulState(): SoulState {
	return {
		soul: emptySphereState("soul"),
		osnova: emptySphereState("osnova"),
		serdce: emptySphereState("serdce"),
		razum: emptySphereState("razum"),
		svyazi: emptySphereState("svyazi"),
	}
}

export function newId(prefix = "s"): string {
	return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7)
}
