// AWARA · Родная Душа (React) — состояние + персист + миграция.
// Инкремент 2 по docs/soul-merge-plan.md.
// Ключ хранения awara_soul_v1; мягкая миграция из awara_subspheres_v3.

import { useCallback, useEffect, useRef, useState } from "react"
import {
	LEGACY_SUBSPHERES_KEY,
	SOUL_CANON,
	SOUL_SPHERE_ORDER,
	SOUL_STORAGE_KEY,
	emptySoulState,
	newId,
	openSlots,
	type JournalEntry,
	type JournalEntryType,
	type MediaItem,
	type MediaKind,
	type PlanItem,
	type SocialLink,
	type SoulSphereId,
	type SoulSphereState,
	type SoulState,
	type SphereStyle,
	type SubSphere,
} from "./soulModel"

// ---- безопасный localStorage ----
function lsGet(key: string): string | null {
	try {
		if (typeof localStorage === "undefined") return null
		return localStorage.getItem(key)
	} catch {
		return null
	}
}
function lsSet(key: string, val: string): void {
	try {
		if (typeof localStorage === "undefined") return
		localStorage.setItem(key, val)
	} catch {
		/* quota / private mode — игнор */
	}
}

// ---- миграция старых подсфер (толерантно к форме) ----
const NAME_TO_ID: Record<string, SoulSphereId> = {
	душа: "soul",
	soul: "soul",
	primal: "soul",
	основа: "osnova",
	shiva: "osnova",
	сердце: "serdce",
	vishnu: "serdce",
	разум: "razum",
	brahma: "razum",
	мечта: "razum",
	связи: "svyazi",
	cotv: "svyazi",
}

function resolveSphereId(raw: string): SoulSphereId | null {
	if (!raw) return null
	const k = String(raw).trim().toLowerCase()
	if ((SOUL_SPHERE_ORDER as string[]).includes(k)) return k as SoulSphereId
	return NAME_TO_ID[k] ?? null
}

function toSubSphere(item: unknown): SubSphere | null {
	if (item == null) return null
	if (typeof item === "string") {
		const text = item.trim()
		if (!text) return null
		return { id: newId("sub"), text, createdAt: Date.now() }
	}
	if (typeof item === "object") {
		const o = item as Record<string, unknown>
		const text = String(o.text ?? o.name ?? o.title ?? "").trim()
		if (!text) return null
		return {
			id: String(o.id ?? newId("sub")),
			text,
			color: typeof o.color === "string" ? o.color : undefined,
			createdAt: typeof o.createdAt === "number" ? o.createdAt : Date.now(),
		}
	}
	return null
}

function migrateLegacy(): SoulState | null {
	const raw = lsGet(LEGACY_SUBSPHERES_KEY)
	if (!raw) return null
	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		return null
	}
	if (!parsed || typeof parsed !== "object") return null

	const state = emptySoulState()
	let migrated = false

	// Форма A: { <sphereKey>: [ подсферы ] }
	// Форма B: { spheres: { <sphereKey>: { subSpheres: [...] } } }
	const container =
		(parsed as Record<string, unknown>).spheres &&
		typeof (parsed as Record<string, unknown>).spheres === "object"
			? ((parsed as Record<string, unknown>).spheres as Record<string, unknown>)
			: (parsed as Record<string, unknown>)

	for (const [key, val] of Object.entries(container)) {
		const sid = resolveSphereId(key)
		if (!sid) continue
		let list: unknown[] = []
		if (Array.isArray(val)) list = val
		else if (val && typeof val === "object") {
			const o = val as Record<string, unknown>
			if (Array.isArray(o.subSpheres)) list = o.subSpheres
			else if (Array.isArray(o.items)) list = o.items
		}
		for (const it of list) {
			const sub = toSubSphere(it)
			if (sub) {
				state[sid].subSpheres.push(sub)
				migrated = true
			}
		}
	}
	return migrated ? state : null
}

function loadInitial(): SoulState {
	const raw = lsGet(SOUL_STORAGE_KEY)
	if (raw) {
		try {
			const parsed = JSON.parse(raw) as Partial<SoulState>
			const base = emptySoulState()
			for (const id of SOUL_SPHERE_ORDER) {
				const incoming = parsed?.[id]
				if (incoming && typeof incoming === "object") {
					base[id] = { ...base[id], ...incoming, id }
				}
			}
			return base
		} catch {
			/* битый JSON — падаем ниже на миграцию/пустоту */
		}
	}
	const legacy = migrateLegacy()
	if (legacy) {
		lsSet(SOUL_STORAGE_KEY, JSON.stringify(legacy))
		return legacy
	}
	return emptySoulState()
}

export interface UseSoulState {
	state: SoulState
	sphere: (id: SoulSphereId) => SoulSphereState
	openSlotsFor: (id: SoulSphereId) => number
	addSubSphere: (id: SoulSphereId, text: string, color?: string) => void
	removeLastSubSphere: (id: SoulSphereId) => void
	removeSubSphere: (id: SoulSphereId, subId: string) => void
	updateSubSphere: (id: SoulSphereId, subId: string, fields: Partial<SubSphere>) => void
	addJournal: (
		id: SoulSphereId,
		type: JournalEntryType,
		body: string,
		title?: string,
	) => void
	deleteJournal: (id: SoulSphereId, entryId: string) => void
	addPlan: (id: SoulSphereId, text: string) => void
	togglePlan: (id: SoulSphereId, planId: string) => void
	deletePlan: (id: SoulSphereId, planId: string) => void
	addMedia: (id: SoulSphereId, kind: MediaKind, data: string, caption?: string) => void
	removeMedia: (id: SoulSphereId, mediaId: string) => void
	addSocial: (id: SoulSphereId, url: string, label?: string) => void
	removeSocial: (id: SoulSphereId, linkId: string) => void
	setStyle: (id: SoulSphereId, style: SphereStyle) => void
	// приём света из внешнего моста (light-core / tigelBridge), 0..1 на сферу
	setLight: (light: Partial<Record<SoulSphereId, number>>) => void
	resetSphere: (id: SoulSphereId) => void
	resetAll: () => void
}

export function useSoulState(): UseSoulState {
	const [state, setState] = useState<SoulState>(loadInitial)
	const stateRef = useRef(state)
	stateRef.current = state

	// персист с лёгким debounce
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	useEffect(() => {
		if (saveTimer.current) clearTimeout(saveTimer.current)
		saveTimer.current = setTimeout(() => {
			lsSet(SOUL_STORAGE_KEY, JSON.stringify(stateRef.current))
		}, 250)
		return () => {
			if (saveTimer.current) clearTimeout(saveTimer.current)
		}
	}, [state])

	const patch = useCallback(
		(id: SoulSphereId, fn: (s: SoulSphereState) => SoulSphereState) => {
			setState((prev) => ({ ...prev, [id]: fn(prev[id]) }))
		},
		[],
	)

	const sphere = useCallback((id: SoulSphereId) => stateRef.current[id], [])

	const openSlotsFor = useCallback(
		(id: SoulSphereId) => openSlots(id, stateRef.current[id].light ?? 0),
		[],
	)

	const addSubSphere = useCallback(
		(id: SoulSphereId, text: string, color?: string) => {
			const t = text.trim()
			if (!t) return
			patch(id, (s) => {
				// компас: при переполнении слотов просто не блокируем жёстко, но держим потолок 3
				if (s.subSpheres.length >= 3) return s
				const sub: SubSphere = {
					id: newId("sub"),
					text: t,
					color: color ?? SOUL_CANON[id].color,
					createdAt: Date.now(),
					light: 0,
				}
				return { ...s, subSpheres: [...s.subSpheres, sub] }
			})
		},
		[patch],
	)

	const removeLastSubSphere = useCallback(
		(id: SoulSphereId) => {
			patch(id, (s) =>
				s.subSpheres.length === 0
					? s
					: { ...s, subSpheres: s.subSpheres.slice(0, -1) },
			)
		},
		[patch],
	)

	const removeSubSphere = useCallback(
		(id: SoulSphereId, subId: string) => {
			patch(id, (s) => ({
				...s,
				subSpheres: s.subSpheres.filter((sub) => sub.id !== subId),
			}))
		},
		[patch],
	)

	// Обновить любые поля подсферы (свет, символ, задача/курс). id не меняем.
	const updateSubSphere = useCallback(
		(id: SoulSphereId, subId: string, fields: Partial<SubSphere>) => {
			patch(id, (s) => ({
				...s,
				subSpheres: s.subSpheres.map((sub) =>
					sub.id === subId ? { ...sub, ...fields, id: sub.id } : sub,
				),
			}))
		},
		[patch],
	)

	const addJournal = useCallback(
		(id: SoulSphereId, type: JournalEntryType, body: string, title?: string) => {
			const b = body.trim()
			if (!b) return
			const entry: JournalEntry = {
				id: newId("jrn"),
				type,
				body: b,
				title: title?.trim() || undefined,
				createdAt: Date.now(),
				comments: [],
			}
			patch(id, (s) => ({ ...s, journal: [entry, ...s.journal] }))
		},
		[patch],
	)

	const deleteJournal = useCallback(
		(id: SoulSphereId, entryId: string) => {
			patch(id, (s) => ({
				...s,
				journal: s.journal.filter((e) => e.id !== entryId),
			}))
		},
		[patch],
	)

	const addPlan = useCallback(
		(id: SoulSphereId, text: string) => {
			const t = text.trim()
			if (!t) return
			const plan: PlanItem = {
				id: newId("pln"),
				text: t,
				done: false,
				createdAt: Date.now(),
			}
			patch(id, (s) => ({ ...s, plans: [...s.plans, plan] }))
		},
		[patch],
	)

	const togglePlan = useCallback(
		(id: SoulSphereId, planId: string) => {
			patch(id, (s) => ({
				...s,
				plans: s.plans.map((p) =>
					p.id === planId ? { ...p, done: !p.done } : p,
				),
			}))
		},
		[patch],
	)

	const deletePlan = useCallback(
		(id: SoulSphereId, planId: string) => {
			patch(id, (s) => ({
				...s,
				plans: s.plans.filter((p) => p.id !== planId),
			}))
		},
		[patch],
	)

	const addMedia = useCallback(
		(id: SoulSphereId, kind: MediaKind, data: string, caption?: string) => {
			if (!data) return
			const m: MediaItem = {
				id: newId("med"),
				kind,
				data,
				caption: caption?.trim() || undefined,
				createdAt: Date.now(),
			}
			patch(id, (s) => ({ ...s, media: [m, ...s.media] }))
		},
		[patch],
	)

	const removeMedia = useCallback(
		(id: SoulSphereId, mediaId: string) => {
			patch(id, (s) => ({
				...s,
				media: s.media.filter((m) => m.id !== mediaId),
			}))
		},
		[patch],
	)

	const addSocial = useCallback(
		(id: SoulSphereId, url: string, label?: string) => {
			const u = url.trim()
			if (!u) return
			const link: SocialLink = { id: newId("soc"), url: u, label: label?.trim() || undefined }
			patch(id, (s) => ({ ...s, social: [...s.social, link] }))
		},
		[patch],
	)

	const removeSocial = useCallback(
		(id: SoulSphereId, linkId: string) => {
			patch(id, (s) => ({
				...s,
				social: s.social.filter((l) => l.id !== linkId),
			}))
		},
		[patch],
	)

	const setStyle = useCallback(
		(id: SoulSphereId, style: SphereStyle) => {
			patch(id, (s) => ({ ...s, style: { ...s.style, ...style } }))
		},
		[patch],
	)

	const setLight = useCallback(
		(light: Partial<Record<SoulSphereId, number>>) => {
			setState((prev) => {
				let changed = false
				const next = { ...prev }
				for (const id of SOUL_SPHERE_ORDER) {
					const v = light[id]
					if (typeof v === "number" && Number.isFinite(v)) {
						const clamped = Math.max(0, Math.min(1, v))
						if (prev[id].light !== clamped) {
							next[id] = { ...prev[id], light: clamped }
							changed = true
						}
					}
				}
				return changed ? next : prev
			})
		},
		[],
	)

	const resetSphere = useCallback(
		(id: SoulSphereId) => {
			patch(id, (s) => ({
				id,
				subSpheres: [],
				journal: [],
				plans: [],
				media: [],
				social: [],
				style: undefined,
				light: s.light ?? 0,
			}))
		},
		[patch],
	)

	const resetAll = useCallback(() => {
		setState(emptySoulState())
	}, [])

	return {
		state,
		sphere,
		openSlotsFor,
		addSubSphere,
		removeLastSubSphere,
		removeSubSphere,
		updateSubSphere,
		addJournal,
		deleteJournal,
		addPlan,
		togglePlan,
		deletePlan,
		addMedia,
		removeMedia,
		addSocial,
		removeSocial,
		setStyle,
		setLight,
		resetSphere,
		resetAll,
	}
}
