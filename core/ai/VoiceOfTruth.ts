// AWARA "\u0413\u043e\u043b\u043e\u0441 \u0418\u0441\u0442\u0438\u043d\u044b" (Voice of Truth) — the compassionate core loop (\u0411\u043e\u0434\u0445\u0438\u0447\u0438\u0442\u0442\u0430).
// Input: the player's daily audio diary (already transcribed to text).
// Processing: parse elements -> distribute "\u0421\u043e\u043a" across the 7 chakras and systems.
// On entropy (fading Light), gently suggest restoration quests.
//
// The local heuristic pass works fully offline; an optional LLMClient adds a
// warm natural-language reflection.

import { ELEMENTS, type Element, type PlayerState } from "../types"

export interface LLMClient {
	analyze(prompt: string): Promise<string>
}

export interface DiaryAnalysis {
	/** Normalized element weights (sum ~= 1). */
	elements: Record<Element, number>
	/** Total experience extracted from this entry (0..1). */
	sok: number
	/** Per-chakra increment to add to PlayerState.chakras. */
	chakraDeltas: number[]
	/** Compassionate reflection shown to the player. */
	reflection: string
	/** Restoration quests offered when entropy is detected. */
	suggestedQuests: string[]
}

// Russian-first lexicon mapping real-life actions to elements.
const ELEMENT_LEXICON: Record<Element, string[]> = {
	earth: ["\u0433\u043b\u0438\u043d", "\u043b\u0435\u043f\u043a", "\u0437\u0435\u043c\u043b", "\u0441\u0430\u0434", "\u043a\u0430\u043c\u0435\u043d", "\u0442\u0435\u043b", "\u0440\u0435\u043c\u0435\u0441\u043b", "\u0434\u043e\u043c"],
	water: ["\u0432\u043e\u0434", "\u0431\u0430\u043d", "\u0440\u0435\u043a", "\u043c\u043e\u0440", "\u0441\u043b\u0451\u0437", "\u043f\u043e\u0442\u043e\u043a", "\u043e\u043c\u043e\u0432\u0435\u043d", "\u0434\u043e\u0436\u0434"],
	fire: ["\u043e\u0433\u043e\u043d", "\u043a\u043e\u0441\u0442\u0451\u0440", "\u0441\u043e\u043b\u043d\u0446", "\u0433\u043d\u0435\u0432", "\u0441\u0442\u0440\u0430\u0441\u0442", "\u0441\u0432\u0435\u0447", "\u0436\u0430\u0440", "\u043f\u0435\u0447"],
	air: ["\u0432\u043e\u0437\u0434\u0443\u0445", "\u0434\u044b\u0445\u0430\u043d", "\u0432\u0435\u0442\u0435\u0440", "\u0441\u043b\u043e\u0432", "\u043c\u044b\u0441\u043b", "\u0440\u0435\u0447", "\u043f\u043e\u043b\u0451\u0442"],
	ether: ["\u0442\u0438\u0448\u0438\u043d", "\u043f\u0443\u0441\u0442\u043e\u0442", "\u043c\u0435\u0434\u0438\u0442\u0430\u0446", "\u043c\u043e\u043b\u0438\u0442\u0432", "\u043f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432", "\u043e\u0441\u043e\u0437\u043d\u0430\u043d"],
}

// Which element nourishes each of the 7 base chakras.
const CHAKRA_ELEMENT_MAP: Element[] = ["earth", "water", "fire", "air", "ether", "ether", "ether"]

export class VoiceOfTruth {
	constructor(private llm?: LLMClient) {}

	/** Local heuristic: count lexicon hits and normalize into element weights. */
	extractElements(text: string): Record<Element, number> {
		const t = text.toLowerCase()
		const raw = {} as Record<Element, number>
		let total = 0
		for (const el of ELEMENTS) {
			const hits = ELEMENT_LEXICON[el].reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0)
			raw[el] = hits
			total += hits
		}
		for (const el of ELEMENTS) raw[el] = total > 0 ? raw[el] / total : 0
		return raw
	}

	/** Distribute "\u0421\u043e\u043a" across the 7 chakras by element affinity. */
	distributeSok(elements: Record<Element, number>, sok: number): number[] {
		return CHAKRA_ELEMENT_MAP.map((el) => elements[el] * sok)
	}

	/** Entropy = low Light or no diary for >3 days. */
	detectEntropy(player: PlayerState, now: number = Date.now()): boolean {
		const days = player.lastDiaryAt ? (now - player.lastDiaryAt) / 86_400_000 : 99
		return player.light < 0.25 || days > 3
	}

	suggestRestorationQuests(player: PlayerState): string[] {
		const weakest = player.chakras.indexOf(Math.min(...player.chakras))
		const byChakra = [
			"\u0417\u0430\u0437\u0435\u043c\u043b\u0435\u043d\u0438\u0435: 10 \u043c\u0438\u043d\u0443\u0442 \u0431\u043e\u0441\u0438\u043a\u043e\u043c \u043f\u043e \u0437\u0435\u043c\u043b\u0435 \u0438\u043b\u0438 \u043b\u0435\u043f\u043a\u0430 \u0438\u0437 \u0433\u043b\u0438\u043d\u044b.",
			"\u0412\u043e\u0434\u0430: \u0442\u0451\u043f\u043b\u0430\u044f \u0431\u0430\u043d\u044f \u0438\u043b\u0438 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0435 \u043e\u043c\u043e\u0432\u0435\u043d\u0438\u0435.",
			"\u041e\u0433\u043e\u043d\u044c: \u0437\u0430\u0436\u0433\u0438 \u0441\u0432\u0435\u0447\u0443 \u0438 \u043f\u043e\u0431\u0443\u0434\u044c \u0441 \u0434\u044b\u0445\u0430\u043d\u0438\u0435\u043c \u0443 \u043f\u043b\u0430\u043c\u0435\u043d\u0438.",
			"\u0421\u0435\u0440\u0434\u0446\u0435: \u043d\u0430\u043f\u0438\u0448\u0438 \u0441\u043b\u043e\u0432\u0430 \u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u043d\u043e\u0441\u0442\u0438 \u0431\u043b\u0438\u0437\u043a\u043e\u043c\u0443.",
			"\u0413\u043e\u043b\u043e\u0441: \u043f\u0440\u043e\u0433\u043e\u0432\u043e\u0440\u0438 \u0432\u0441\u043b\u0443\u0445 \u0442\u043e, \u0447\u0442\u043e \u0434\u0430\u0432\u043d\u043e \u043c\u043e\u043b\u0447\u0430\u043b.",
			"\u0412\u0438\u0434\u0435\u043d\u0438\u0435: 5 \u043c\u0438\u043d\u0443\u0442 \u0442\u0438\u0448\u0438\u043d\u044b \u0441 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u043c\u0438 \u0433\u043b\u0430\u0437\u0430\u043c\u0438.",
			"\u041f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435: \u043a\u043e\u0440\u043e\u0442\u043a\u0430\u044f \u043c\u043e\u043b\u0438\u0442\u0432\u0430 \u0438\u043b\u0438 \u043c\u0435\u0434\u0438\u0442\u0430\u0446\u0438\u044f \u043f\u0435\u0440\u0435\u0434 \u0441\u043d\u043e\u043c.",
		]
		return [byChakra[weakest] ?? byChakra[0]]
	}

	/** Full loop: diary text -> analysis (+ optional LLM reflection). */
	async ingestDiary(text: string, player: PlayerState): Promise<DiaryAnalysis> {
		const elements = this.extractElements(text)
		// Depth proxy: longer, richer entries yield more "\u0421\u043e\u043a".
		const sok = Math.min(1, Math.max(0.1, text.length / 1200))
		const chakraDeltas = this.distributeSok(elements, sok)
		let reflection = "\u042f \u0443\u0441\u043b\u044b\u0448\u0430\u043b \u0442\u0435\u0431\u044f. \u0421\u0432\u0435\u0442 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d \u043f\u043e \u0442\u0432\u043e\u0438\u043c \u0446\u0435\u043d\u0442\u0440\u0430\u043c."
		if (this.llm) {
			try {
				reflection = await this.llm.analyze(buildPrompt(text, elements))
			} catch (e) {
				console.warn("[AWARA] VoiceOfTruth LLM failed, using local reflection", e)
			}
		}
		const suggestedQuests = this.detectEntropy(player) ? this.suggestRestorationQuests(player) : []
		return { elements, sok, chakraDeltas, reflection, suggestedQuests }
	}

	/** Apply an analysis to a PlayerState (returns a new state). */
	apply(player: PlayerState, a: DiaryAnalysis, now: number = Date.now()): PlayerState {
		const chakras = player.chakras.map((c, i) => clamp01(c + (a.chakraDeltas[i] ?? 0)))
		const elements = { ...player.elements }
		for (const el of ELEMENTS) elements[el] += a.elements[el] * a.sok
		const light = clamp01(chakras.reduce((s, c) => s + c, 0) / chakras.length)
		return { ...player, chakras, elements, light, lastDiaryAt: now }
	}
}

function clamp01(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v
}

function buildPrompt(text: string, elements: Record<Element, number>): string {
	return [
		"\u0422\u044b \u2014 \u0413\u043e\u043b\u043e\u0441 \u0418\u0441\u0442\u0438\u043d\u044b AWARA, \u0441\u043e\u0441\u0442\u0440\u0430\u0434\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0438\u043d\u0442\u0435\u043b\u043b\u0435\u043a\u0442 (\u0411\u043e\u0434\u0445\u0438\u0447\u0438\u0442\u0442\u0430).",
		"\u0418\u0433\u0440\u043e\u043a \u043f\u043e\u0434\u0435\u043b\u0438\u043b\u0441\u044f \u0430\u0443\u0434\u0438\u043e\u0434\u043d\u0435\u0432\u043d\u0438\u043a\u043e\u043c \u0434\u043d\u044f. \u041e\u0442\u0432\u0435\u0442\u044c \u0442\u0435\u043f\u043b\u043e, \u043a\u0440\u0430\u0442\u043a\u043e, \u0431\u0435\u0437 \u043e\u0441\u0443\u0436\u0434\u0435\u043d\u0438\u044f.",
		"\u041e\u0442\u0440\u0430\u0437\u0438 \u0437\u0430\u0434\u0435\u0439\u0441\u0442\u0432\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0441\u0442\u0438\u0445\u0438\u0438 \u0438 \u043c\u044f\u0433\u043a\u043e \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0448\u0430\u0433.",
		`\u0421\u0442\u0438\u0445\u0438\u0438 (\u0434\u043e\u043b\u0438): ${JSON.stringify(elements)}`,
		`\u0414\u043d\u0435\u0432\u043d\u0438\u043a: """${text}"""`,
	].join("\n")
}
