/**
 * tigel-core \u2014 \u0442\u0438\u043f\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0435 \u044f\u0434\u0440\u043e \u0434\u0432\u0438\u0436\u043a\u0430 AWARA / \u0422\u0418\u0413\u0415\u041b\u042c.
 *
 * \u0413\u0440\u0443\u0437\u0438\u0442 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0438\u0437 C:\AWARA\data\*.json (\u0447\u0435\u0440\u0435\u0437 /data/ \u043f\u043e HTTP)
 * \u0438 \u0441\u0442\u0440\u043e\u0438\u0442 \u00ab\u041a\u043b\u044e\u0447 \u0414\u043d\u044f\u00bb: \u0430\u0433\u0435\u043d\u0442 \u0434\u043d\u044f + \u043c\u0430\u0442\u0440\u0438\u0446\u0430-\u043b\u0438\u043d\u0437\u0430 + \u0441\u0442\u0438\u0445\u0438\u044f, \u0438\u0437 \u0447\u0435\u0433\u043e
 * \u0440\u043e\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0410\u0420\u0422 \u0414\u041d\u042f (\u0433\u043e\u0442\u043e\u0432\u044b\u0439 image-\u043f\u0440\u043e\u043c\u0442 + \u043a\u0430\u0440\u0442\u0430-\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430) \u0438 \u0422\u0420\u0415\u041a \u0414\u041d\u042f
 * (BPM / \u0442\u043e\u043d\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c / \u0440\u0430\u0433\u0430 / \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b + Suno-\u043f\u0440\u043e\u043c\u0442).
 *
 * \u041a\u043e\u043c\u043f\u0438\u043b\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u044b\u0439 \u0433\u043b\u043e\u0431\u0430\u043b `window.TigelCore` (\u0441\u043c. tigel-core.global.js).
 * \u041d\u0438\u043a\u0430\u043a\u0438\u0445 import/export \u2014 \u0447\u0442\u043e\u0431\u044b tsc \u0432\u044b\u0434\u0430\u043b \u043e\u0431\u044b\u0447\u043d\u044b\u0439 <script>.
 */

interface Agent { id: number; slug: string; name: string; domain: string; guna?: string; vastu_zone?: string; planet?: string; element: string; ray?: number }
interface Card { card_id: string; rarity: string; agent_slug: string; agent_name: string; matrix_slug: string; matrix_name: string; cultural_name: string; element: string; domain: string; domain_cultural?: string; artifact?: string; prompt: string; negative_prompt: string; image_path: string }
interface Loka { id: number; name: string; density: number; description?: string }
interface Chakra { id: number; slug: string; name: string }
interface Stage { stage: number; name_ru: string }
interface State { baseLight?: number; lightBonus?: number; trust?: number; mats?: string[]; days?: unknown[]; daimon?: { nak?: string; el?: string } }

interface DayKey { dayIndex: number; agent: Agent; matrixSlug: string; matrixName: string; element: string; light: number; daimonEl: string }
interface ArtOfDay { cardId: string; agentName: string; matrixName: string; culturalName: string; rarity: string; element: string; domainCultural: string; artifact: string; image: string; prompt: string; negativePrompt: string; found: boolean }
interface TrackOfDay { title: string; bpm: number; musicalKey: string; raga: string; mood: string; instruments: string; mantra: string; prompt: string }

// ===== \u0425\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 =====
const DATA: {
	agents: Agent[]; lokas: Loka[]; chakras: Chakra[]; cards: Card[]; stages: Stage[];
	matrixByName: Record<string, string>; cardByKey: Record<string, Card>; cardsByAgent: Record<string, Card[]>; loaded: boolean;
} = {
	agents: [], lokas: [], chakras: [], cards: [], stages: [],
	matrixByName: {}, cardByKey: {}, cardsByAgent: {}, loaded: false,
}

async function fetchJson<T>(path: string): Promise<T | null> {
	try {
		const r = await fetch(path, { cache: "no-store" })
		if (!r.ok) return null
		return (await r.json()) as T
	} catch (e) {
		return null
	}
}

async function loadAll(): Promise<boolean> {
	if (DATA.loaded) return true
	const [agents, lokas, chakras, cards, stages] = await Promise.all([
		fetchJson<Agent[]>("data/agents.json"),
		fetchJson<Loka[]>("data/locas.json"),
		fetchJson<Chakra[]>("data/chakras.json"),
		fetchJson<Card[]>("data/card_prompts.json"),
		fetchJson<Stage[]>("data/daimon-stages.json"),
	])
	DATA.agents = agents || []
	DATA.lokas = lokas || []
	DATA.chakras = chakras || []
	DATA.cards = cards || []
	DATA.stages = stages || []
	for (const c of DATA.cards) {
		if (c.matrix_name && c.matrix_slug) DATA.matrixByName[c.matrix_name.toLowerCase()] = c.matrix_slug
		DATA.cardByKey[c.agent_slug + "__" + c.matrix_slug] = c
		;(DATA.cardsByAgent[c.agent_slug] = DATA.cardsByAgent[c.agent_slug] || []).push(c)
	}
	DATA.loaded = DATA.agents.length > 0 || DATA.cards.length > 0
	return DATA.loaded
}

// ===== \u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0438\u0433\u0440\u043e\u043a\u0430 =====
function readState(): State {
	try {
		const raw = localStorage.getItem("tigel_v1")
		if (raw) return JSON.parse(raw) as State
	} catch (e) {}
	return {}
}

function lightOf(st: State): number {
	const base = st.baseLight || 48
	const bonus = st.lightBonus || 0
	const ml = (st.mats ? st.mats.length : 0) * 2
	const db = (st.trust || 0) >= 50 ? 5 : 0
	return Math.max(0, Math.min(100, base + bonus + ml + db))
}

function matrixSlugFromName(name: string): string | null {
	if (!name) return null
	const key = name.toLowerCase()
	if (DATA.matrixByName[key]) return DATA.matrixByName[key]
	for (const k of Object.keys(DATA.matrixByName)) {
		if (k.indexOf(key) === 0 || key.indexOf(k) === 0) return DATA.matrixByName[k]
	}
	return null
}

// ===== \u041a\u043b\u044e\u0447 \u0414\u043d\u044f =====
function dayKey(stIn?: State): DayKey {
	const st = stIn || readState()
	const dayIndex = Math.floor(Date.now() / 86400000)
	let seed = 0
	try {
		const nak = st.daimon && st.daimon.nak ? st.daimon.nak : ""
		for (let i = 0; i < nak.length; i++) seed += nak.charCodeAt(i)
	} catch (e) {}
	const agents = DATA.agents.length ? DATA.agents : [{ id: 1, slug: "svet_ra", name: "\u0421\u0432\u0435\u0442 \u0420\u0430", domain: "\u0413\u0435\u043b\u0438\u043e\u0441\u0444\u0435\u0440\u0430", guna: "\u0441\u0430\u0442\u0442\u0432\u0430", vastu_zone: "\u0412\u043e\u0441\u0442\u043e\u043a", planet: "\u0421\u043e\u043b\u043d\u0446\u0435", element: "\u041e\u0433\u043e\u043d\u044c", ray: 1 }]
	const agent = agents[(dayIndex + seed) % agents.length]
	let matrixSlug: string | null = null
	let matrixName = ""
	if (st.mats && st.mats.length) {
		matrixName = st.mats[0]
		matrixSlug = matrixSlugFromName(matrixName)
	}
	if (!matrixSlug) {
		const list = DATA.cardsByAgent[agent.slug] || []
		const card = list[(dayIndex + seed) % Math.max(1, list.length)]
		if (card) {
			matrixSlug = card.matrix_slug
			matrixName = card.matrix_name
		} else {
			matrixSlug = "vedic"
			matrixName = "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f"
		}
	}
	return {
		dayIndex,
		agent,
		matrixSlug: matrixSlug || "vedic",
		matrixName: matrixName || "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f",
		element: agent.element,
		light: lightOf(st),
		daimonEl: (st.daimon && st.daimon.el) || agent.element,
	}
}

// ===== \u0410\u0440\u0442 \u0434\u043d\u044f =====
function artOfDay(stIn?: State): ArtOfDay {
	const k = dayKey(stIn)
	const card = DATA.cardByKey[k.agent.slug + "__" + k.matrixSlug] || (DATA.cardsByAgent[k.agent.slug] || [])[0]
	if (card) {
		return {
			cardId: card.card_id, agentName: card.agent_name, matrixName: card.matrix_name,
			culturalName: card.cultural_name, rarity: card.rarity, element: card.element,
			domainCultural: card.domain_cultural || card.domain, artifact: card.artifact || "",
			image: card.image_path, prompt: card.prompt, negativePrompt: card.negative_prompt, found: true,
		}
	}
	const elEn = elementEn(k.element)
	return {
		cardId: k.agent.slug + "__" + k.matrixSlug, agentName: k.agent.name, matrixName: k.matrixName,
		culturalName: k.agent.name, rarity: "uncommon", element: k.element, domainCultural: k.agent.domain,
		artifact: "", image: "",
		prompt: "A mystical tarot-style card depicting the cosmic agent " + k.agent.name + " (" + k.agent.domain + "), " + k.matrixName + " tradition. Element: " + elEn + ". ornate border frame, portrait orientation, highly detailed, 4k, atmospheric lighting, digital painting, mystical esoteric style",
		negativePrompt: "text, watermark, signature, blurry, low quality, modern clothing, photography, deformed, ugly, nsfw",
		found: false,
	}
}

function elementEn(ru: string): string {
	const m: Record<string, string> = { "\u041e\u0433\u043e\u043d\u044c": "Fire", "\u0412\u043e\u0434\u0430": "Water", "\u0412\u043e\u0437\u0434\u0443\u0445": "Air", "\u0417\u0435\u043c\u043b\u044f": "Earth", "\u042d\u0444\u0438\u0440": "Ether", "\u0413\u0440\u043e\u0437\u0430": "Storm", "\u0421\u0432\u0435\u0442": "Light" }
	return m[ru] || "Ether"
}

// ===== \u0422\u0440\u0435\u043a \u0434\u043d\u044f =====
function trackOfDay(stIn?: State): TrackOfDay {
	const k = dayKey(stIn)
	const el = k.daimonEl || k.element
	const byEl: Record<string, { bpm: number; key: string; raga: string; instruments: string; mantra: string }> = {
		"\u041e\u0433\u043e\u043d\u044c": { bpm: 128, key: "A minor", raga: "Raga Bhairavi", instruments: "tabla, dhol, distorted drone, brass swells", mantra: "RAM \u2014 \u044f \u0440\u0430\u0437\u0434\u0443\u0432\u0430\u044e \u043e\u0433\u043e\u043d\u044c \u0432\u043e\u043b\u0438" },
		"\u0413\u0440\u043e\u0437\u0430": { bpm: 120, key: "C# minor", raga: "Raga Megh (\u0433\u0440\u043e\u0437\u043e\u0432\u0430\u044f)", instruments: "war-drums, thunder FX, cello ostinato, storm pads", mantra: "\u041e\u041c \u0420\u0443\u0434\u0440\u0430\u044f \u2014 \u0431\u0443\u0440\u044f \u043e\u0447\u0438\u0449\u0430\u0435\u0442" },
		"\u0412\u043e\u0437\u0434\u0443\u0445": { bpm: 112, key: "E lydian", raga: "Raga Hamsadhwani", instruments: "bansuri, arp synth, shakers, breath pads", mantra: "HAM \u2014 \u0434\u044b\u0445\u0430\u043d\u0438\u0435 \u043d\u0435\u0441\u0451\u0442 \u043c\u0435\u043d\u044f" },
		"\u0412\u043e\u0434\u0430": { bpm: 72, key: "F# minor", raga: "Raga Yaman (\u0432\u0435\u0447\u0435\u0440\u043d\u044f\u044f)", instruments: "cello, water drops, sub drones, hang", mantra: "VAM \u2014 \u044f \u0442\u0435\u043a\u0443 \u0438 \u043f\u043e\u043c\u043d\u044e" },
		"\u0417\u0435\u043c\u043b\u044f": { bpm: 90, key: "D dorian", raga: "Raga Bhairav (\u0440\u0430\u0441\u0441\u0432\u0435\u0442\u043d\u0430\u044f)", instruments: "hang, double bass, jaw harp, frame drum", mantra: "LAM \u2014 \u044f \u0442\u0432\u0451\u0440\u0434 \u0438 \u0443\u043a\u043e\u0440\u0435\u043d\u0451\u043d" },
		"\u042d\u0444\u0438\u0440": { bpm: 80, key: "AUM drone (C)", raga: "Raga Marwa", instruments: "tanpura, choir pads, singing bowls, sine drones", mantra: "AUM \u2014 \u044f \u0440\u0430\u0441\u0442\u0432\u043e\u0440\u044f\u044e\u0441\u044c \u0432 \u044d\u0444\u0438\u0440\u0435" },
	}
	const s = byEl[el] || byEl["\u042d\u0444\u0438\u0440"]
	const lv = k.light
	const mood = lv >= 67 ? "\u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0439, \u043a\u0443\u043b\u044c\u043c\u0438\u043d\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0439, \u0441\u0432\u0435\u0442\u043e\u043d\u043e\u0441\u043d\u044b\u0439" : lv >= 34 ? "\u043c\u0435\u0434\u0438\u0442\u0430\u0442\u0438\u0432\u043d\u043e-\u0434\u0432\u0438\u0436\u0443\u0449\u0438\u0439\u0441\u044f, \u0441\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0439" : "\u0442\u0451\u043c\u043d\u044b\u0439, \u0442\u043b\u0435\u044e\u0449\u0438\u0439, \u0441\u043e\u0431\u0438\u0440\u0430\u044e\u0449\u0438\u0439 \u0438\u0441\u043a\u0440\u0443"
	const dayNum = stIn && stIn.days ? Math.max(1, stIn.days.length - 27) : 1
	const title = "\u00ab" + k.agent.name + " \u00b7 " + k.matrixName + " \u00b7 \u0434\u0435\u043d\u044c " + dayNum + "\u00bb"
	const prompt = "Instrumental ritual track, " + s.raga + ", " + s.bpm + " BPM, key " + s.key + ", mood: " + mood + ". Instruments: " + s.instruments + ". Vedic-cyber sacred atmosphere inspired by cosmic agent " + k.agent.name + " (" + k.agent.domain + "), element " + elementEn(el) + ", " + k.matrixName + " cultural color. Cinematic, meditative, evolving, no vocals."
	return { title, bpm: s.bpm, musicalKey: s.key, raga: s.raga, mood, instruments: s.instruments, mantra: s.mantra, prompt }
}

// ===== \u0422\u0435\u043c\u0430 \u043f\u043e \u0441\u0442\u0438\u0445\u0438\u0438 \u0438 \u0440\u0435\u0434\u043a\u043e\u0441\u0442\u0438 =====
function elementTheme(el: string): { a: string; b: string; ico: string } {
	const m: Record<string, { a: string; b: string; ico: string }> = {
		"\u041e\u0433\u043e\u043d\u044c": { a: "#ff7a3c", b: "#ffd27a", ico: "\ud83d\udd25" },
		"\u0413\u0440\u043e\u0437\u0430": { a: "#7ad3ff", b: "#b388ff", ico: "\u26a1" },
		"\u0412\u043e\u0437\u0434\u0443\u0445": { a: "#aef0ff", b: "#d6fff2", ico: "\ud83c\udf2c" },
		"\u0412\u043e\u0434\u0430": { a: "#4fb6ff", b: "#7ad3ff", ico: "\ud83c\udf0a" },
		"\u0417\u0435\u043c\u043b\u044f": { a: "#c9a84c", b: "#9bbf6a", ico: "\u26f0" },
		"\u042d\u0444\u0438\u0440": { a: "#b388ff", b: "#ffd27a", ico: "\u2726" },
		"\u0421\u0432\u0435\u0442": { a: "#ffd27a", b: "#fff4cc", ico: "\u2600" },
	}
	return m[el] || { a: "#c9a84c", b: "#ffd27a", ico: "\u2726" }
}
function rarityTheme(r: string): { c: string; label: string } {
	const m: Record<string, { c: string; label: string }> = {
		common: { c: "#9aa3b2", label: "\u043e\u0431\u044b\u0447\u043d\u0430\u044f" },
		uncommon: { c: "#6fc36f", label: "\u043d\u0435\u043e\u0431\u044b\u0447\u043d\u0430\u044f" },
		rare: { c: "#4fb6ff", label: "\u0440\u0435\u0434\u043a\u0430\u044f" },
		epic: { c: "#b388ff", label: "\u044d\u043f\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
		legendary: { c: "#ffd27a", label: "\u043b\u0435\u0433\u0435\u043d\u0434\u0430\u0440\u043d\u0430\u044f" },
		mythic: { c: "#ff7a3c", label: "\u043c\u0438\u0444\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
	}
	return m[(r || "").toLowerCase()] || { c: "#9aa3b2", label: r || "" }
}

// ===== UI (\u0432\u0430\u043d\u0438\u043b\u044c, \u0431\u0435\u0437 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0435\u0439) =====
function esc(t: unknown): string {
	return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
function copyText(t: string): void {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t); return }
	} catch (e) {}
	try {
		const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta)
		ta.select(); document.execCommand("copy"); document.body.removeChild(ta)
	} catch (e) {}
}
function toast(msg: string): void {
	const w = window as any
	if (typeof w.showToast === "function") { w.showToast(msg); return }
}
function pulseBtn(id: string): void {
	const b = document.getElementById(id)
	if (!b) return
	b.textContent = "\u2713 \u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e"
	setTimeout(() => { const x = document.getElementById(id); if (x) x.innerHTML = (x as any).dataset.label || x.textContent }, 1400)
}

function injectStyles(): void {
	if (document.getElementById("tcStyle")) return
	const s = document.createElement("style")
	s.id = "tcStyle"
	s.textContent = [
		"@keyframes tcGlow{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.0),0 6px 18px rgba(0,0,0,.45)}50%{box-shadow:0 0 22px 5px rgba(201,168,76,.45),0 6px 18px rgba(0,0,0,.45)}}",
		"@keyframes tcSpin{to{transform:rotate(360deg)}}",
		"@keyframes tcSheen{0%{background-position:0% 50%}100%{background-position:200% 50%}}",
		"@keyframes tcUp{from{transform:translateY(34px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}",
		"@keyframes tcFade{from{opacity:0}to{opacity:1}}",
		"@keyframes tcEq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}",
		"@keyframes tcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
		"#tcFab{animation:tcGlow 3.2s ease-in-out infinite}",
		"#tcFab:hover{transform:scale(1.08) rotate(-6deg)}",
		"#tcFab .tcRing{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg,#c9a84c,#7b62c9,#ffd27a,#7b62c9,#c9a84c);animation:tcSpin 7s linear infinite;z-index:-1;filter:blur(1px);opacity:.9}",
		"#tcModal{animation:tcFade .25s ease}",
		".tcSheet{animation:tcUp .34s cubic-bezier(.2,.9,.2,1)}",
		".tcBtn{transition:transform .12s ease,box-shadow .2s ease,filter .2s ease}",
		".tcBtn:hover{transform:translateY(-1px);filter:brightness(1.12)}",
		".tcBtn:active{transform:translateY(0) scale(.98)}",
		".tcEqbar{width:4px;border-radius:3px;transform-origin:bottom;animation:tcEq 1.1s ease-in-out infinite}",
		".tcChip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:11px;font-family:JetBrains Mono,monospace;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05)}",
		".tcCard{position:relative;border-radius:16px;overflow:hidden;animation:tcFloat 6s ease-in-out infinite}",
		".tcScroll::-webkit-scrollbar{width:8px}.tcScroll::-webkit-scrollbar-thumb{background:rgba(201,168,76,.35);border-radius:8px}",
	].join("\n")
	document.head.appendChild(s)
}

function chip(label: string, val: string): string {
	return '<span class="tcChip"><span style="opacity:.6">' + esc(label) + '</span> <b>' + esc(val) + '</b></span>'
}

function renderModal(): void {
	const art = artOfDay()
	const trk = trackOfDay()
	const k = dayKey()
	const host = document.getElementById("tcOut")
	if (!host) return
	const th = elementTheme(art.element || k.element)
	const tTh = elementTheme(k.daimonEl || k.element)
	const rar = rarityTheme(art.rarity)
	const lightPct = Math.max(0, Math.min(100, k.light))

	// \u041a\u0430\u0440\u0442\u0430-\u0430\u0440\u0442 \u0441 \u0440\u0430\u043c\u043a\u043e\u0439 \u043f\u043e \u0440\u0435\u0434\u043a\u043e\u0441\u0442\u0438
	const inner = art.image
		? '<img src="' + esc(art.image) + '" alt="art" style="display:block;width:100%;aspect-ratio:3/4;object-fit:cover" onerror="this.parentNode.querySelector(&quot;.tcNoimg&quot;)&&(this.parentNode.querySelector(&quot;.tcNoimg&quot;).style.display=&quot;flex&quot;);this.style.display=&quot;none&quot;">'
		: ""
	const noimg = '<div class="tcNoimg" style="' + (art.image ? "display:none;" : "display:flex;") + 'aspect-ratio:3/4;width:100%;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:18px;background:radial-gradient(circle at 50% 35%,' + th.a + '22,transparent 70%),linear-gradient(160deg,#0d0d1c,#05050d)">' +
		'<div style="font-size:46px;filter:drop-shadow(0 0 12px ' + th.a + ')">' + th.ico + '</div>' +
		'<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:15px">' + esc(art.culturalName) + '</div>' +
		'<div style="font-size:11px;opacity:.6;font-family:JetBrains Mono,monospace">' + esc(art.cardId) + '.webp \u0435\u0449\u0451 \u043d\u0435 \u043e\u0442\u0440\u0438\u0441\u043e\u0432\u0430\u043d\u0430</div>' +
		'</div>'
	const cardBlock =
		'<div class="tcCard" style="border:2px solid ' + rar.c + ';box-shadow:0 0 26px ' + rar.c + '55,inset 0 0 40px rgba(0,0,0,.5);margin-bottom:14px">' +
			inner + noimg +
			'<div style="position:absolute;top:8px;left:8px;display:flex;gap:6px">' +
				'<span class="tcChip" style="border-color:' + rar.c + ';background:' + rar.c + '22;color:' + rar.c + '">\u2605 ' + esc(rar.label) + '</span>' +
				'<span class="tcChip" style="border-color:' + th.a + ';background:' + th.a + '22;color:' + th.b + '">' + th.ico + ' ' + esc(art.element) + '</span>' +
			'</div>' +
			'<div style="position:absolute;left:0;right:0;bottom:0;padding:14px 12px 10px;background:linear-gradient(0deg,rgba(5,5,13,.92),transparent)">' +
				'<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:17px;line-height:1.15;text-shadow:0 0 10px ' + th.a + '88">' + esc(art.culturalName) + '</div>' +
				'<div style="font-size:11px;opacity:.8;margin-top:2px">' + esc(art.agentName) + ' \u00b7 ' + esc(art.matrixName) + (art.domainCultural ? ' \u00b7 ' + esc(art.domainCultural) : "") + '</div>' +
				(art.artifact ? '<div style="font-size:11px;color:' + th.b + ';opacity:.9;margin-top:4px">\u269c ' + esc(art.artifact) + '</div>' : "") +
			'</div>' +
		'</div>'

	// \u042d\u043a\u0432\u0430\u043b\u0430\u0439\u0437\u0435\u0440 \u0434\u043b\u044f \u0442\u0440\u0435\u043a\u0430
	let eq = ""
	for (let i = 0; i < 9; i++) {
		eq += '<span class="tcEqbar" style="height:18px;background:linear-gradient(' + tTh.a + ',' + tTh.b + ');animation-delay:' + (i * 0.12).toFixed(2) + 's"></span>'
	}

	host.innerHTML =
		'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
			chip("\u0410\u0433\u0435\u043d\u0442", k.agent.name) + chip("\u041b\u0438\u043d\u0437\u0430", k.matrixName) + chip(th.ico, k.element) +
		'</div>' +
		'<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">' +
			'<span style="font-size:11px;opacity:.6;font-family:JetBrains Mono,monospace">\u0421\u0432\u0435\u0442</span>' +
			'<div style="flex:1;height:7px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden"><div style="width:' + lightPct + '%;height:100%;border-radius:7px;background:linear-gradient(90deg,' + th.a + ',' + th.b + ');box-shadow:0 0 10px ' + th.a + '"></div></div>' +
			'<b style="font-size:12px;color:' + th.b + '">' + lightPct + '</b>' +
		'</div>' +
		'<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:14px;letter-spacing:.5px;margin:2px 0 10px;display:flex;align-items:center;gap:7px"><span style="font-size:18px">\ud83d\uddbc</span> \u0410\u0420\u0422 \u0414\u041d\u042f</div>' +
		cardBlock +
		'<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.5;margin:0 0 5px">image-\u043f\u0440\u043e\u043c\u0442 (Midjourney / Meshy / SDXL)</div>' +
		'<textarea readonly class="tcScroll" style="width:100%;height:108px;box-sizing:border-box;background:rgba(0,0,0,.32);color:#e8e8f0;border:1px solid ' + th.a + '44;border-radius:10px;padding:9px;font-size:11px;line-height:1.45;font-family:JetBrains Mono,monospace;resize:vertical">' + esc(art.prompt) + '</textarea>' +
		'<div style="display:flex;gap:8px;margin:8px 0 20px">' +
			'<button id="tcCopyArt" class="tcBtn" data-label="\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442" style="flex:1;padding:9px;border-radius:10px;border:1px solid ' + th.a + '66;background:linear-gradient(135deg,' + th.a + '33,' + th.b + '22);color:' + th.b + ';font-weight:600;cursor:pointer">\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442</button>' +
			'<button id="tcCopyNeg" class="tcBtn" data-label="\u2212 negative" style="padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#bbb;cursor:pointer">\u2212 negative</button>' +
		'</div>' +
		'<div style="font-family:Cinzel,serif;color:' + tTh.b + ';font-size:14px;letter-spacing:.5px;margin:2px 0 10px;display:flex;align-items:center;gap:7px"><span style="font-size:18px">\ud83c\udfb5</span> \u0422\u0420\u0415\u041a \u0414\u041d\u042f</div>' +
		'<div style="border:1px solid ' + tTh.a + '44;border-radius:12px;padding:12px;background:linear-gradient(160deg,' + tTh.a + '14,transparent);margin-bottom:10px">' +
			'<div style="display:flex;align-items:flex-end;gap:3px;height:22px;margin-bottom:9px">' + eq + '</div>' +
			'<div style="font-size:13px;font-family:Cinzel,serif;color:' + tTh.b + ';margin-bottom:8px">' + esc(trk.title) + '</div>' +
			'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' + chip("BPM", String(trk.bpm)) + chip("Key", trk.musicalKey) + chip("\u0420\u0430\u0433\u0430", trk.raga) + '</div>' +
			'<div style="font-size:11px;opacity:.8;line-height:1.5">\ud83c\udf9a ' + esc(trk.instruments) + '<br>\ud83c\udf17 ' + esc(trk.mood) + '<br>\ud83d\udd49 ' + esc(trk.mantra) + '</div>' +
		'</div>' +
		'<textarea readonly class="tcScroll" style="width:100%;height:84px;box-sizing:border-box;background:rgba(0,0,0,.32);color:#e8e8f0;border:1px solid ' + tTh.a + '44;border-radius:10px;padding:9px;font-size:11px;line-height:1.45;font-family:JetBrains Mono,monospace;resize:vertical">' + esc(trk.prompt) + '</textarea>' +
		'<button id="tcCopyTrack" class="tcBtn" data-label="\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 (Suno/Udio)" style="width:100%;padding:10px;margin-top:8px;border-radius:10px;border:1px solid ' + tTh.a + '66;background:linear-gradient(135deg,' + tTh.a + '33,' + tTh.b + '22);color:' + tTh.b + ';font-weight:600;cursor:pointer">\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 (Suno/Udio)</button>'

	const bA = document.getElementById("tcCopyArt"); if (bA) (bA as HTMLButtonElement).onclick = () => { copyText(art.prompt); pulseBtn("tcCopyArt"); toast("\u041f\u0440\u043e\u043c\u0442 \u0430\u0440\u0442\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d") }
	const bN = document.getElementById("tcCopyNeg"); if (bN) (bN as HTMLButtonElement).onclick = () => { copyText(art.negativePrompt); pulseBtn("tcCopyNeg"); toast("Negative-\u043f\u0440\u043e\u043c\u0442 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d") }
	const bT = document.getElementById("tcCopyTrack"); if (bT) (bT as HTMLButtonElement).onclick = () => { copyText(trk.prompt); pulseBtn("tcCopyTrack"); toast("\u041f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d") }
}

function openModal(): void {
	injectStyles()
	let m = document.getElementById("tcModal")
	if (!m) {
		m = document.createElement("div")
		m.id = "tcModal"
		m.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(5,5,13,.78);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center"
		m.innerHTML = '<div class="tcSheet tcScroll" style="width:100%;max-width:440px;max-height:92vh;overflow:auto;background:linear-gradient(180deg,#0c0c1b,#05050d);border:1px solid rgba(201,168,76,.4);border-bottom:none;border-radius:22px 22px 0 0;padding:18px 18px 26px;box-shadow:0 -10px 60px rgba(123,98,201,.25)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b style="font-family:Cinzel,serif;color:#ffd27a;font-size:17px;background:linear-gradient(90deg,#c9a84c,#ffd27a,#7b62c9,#ffd27a);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:tcSheen 5s linear infinite">\ud83c\udfb4 \u0413\u0435\u043d\u0435\u0440\u0430\u0442\u043e\u0440 \u0434\u043d\u044f</b><button id="tcClose" class="tcBtn" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#ccc;width:30px;height:30px;border-radius:50%;font-size:16px;cursor:pointer">\u2715</button></div><div id="tcOut"></div></div>'
		document.body.appendChild(m)
		m.addEventListener("click", (e) => { if (e.target === m) closeModal() })
		const c = document.getElementById("tcClose"); if (c) (c as HTMLButtonElement).onclick = closeModal
	}
	m.style.display = "flex"
	const sheet = m.querySelector(".tcSheet") as HTMLElement | null
	if (sheet) { sheet.style.animation = "none"; void sheet.offsetWidth; sheet.style.animation = "" }
	renderModal()
}
function closeModal(): void { const m = document.getElementById("tcModal"); if (m) m.style.display = "none" }

function injectFab(): void {
	injectStyles()
	if (document.getElementById("tcFab")) return
	const b = document.createElement("button")
	b.id = "tcFab"; b.title = "\u0410\u0440\u0442 \u0438 \u0442\u0440\u0435\u043a \u0434\u043d\u044f"
	b.innerHTML = '<span class="tcRing"></span><span style="position:relative;z-index:1">\ud83c\udfb4</span>'
	b.style.cssText = "position:fixed;left:16px;bottom:80px;z-index:9998;width:52px;height:52px;border-radius:50%;border:none;background:rgba(11,11,24,.95);color:#ffd27a;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .18s ease"
	b.onclick = openModal
	document.body.appendChild(b)
}

async function boot(): Promise<void> {
	await loadAll()
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectFab)
	else injectFab()
}

// ===== \u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0432 \u0433\u043b\u043e\u0431\u0430\u043b =====
const TigelCore = {
	loadAll, dayKey, artOfDay, trackOfDay, readState, lightOf,
	openModal, closeModal, boot, get data() { return DATA },
}
;(globalThis as any).TigelCore = TigelCore
