// AWARA - Matrix (culture lens) store + helpers for the Soul screen.
// Cyrillic strings are fine in this .ts module (no JSX here).
//
// A matrix is a CULTURE LENS laid over the vedic core of 21 agents. The player
// passes through ONE active matrix at a time; the Soul-screen background then
// shows that matrix's agent cards. Agents are spread across meras (1..9): low
// meras reveal only the first (low) agents (shown dim / greyscale), higher meras
// reveal higher agents, until at mera 9 the source agent (svet_ra) appears.
//
// Card files live at:
//   /exports/generated_cards/tarot_cards_webp/{NNN|NNNN}_{agent}__{matrix}.webp
// where number = agentIndex*33 + matrixIndex + 1 (3 digits below 100, else 4).
// Verified against the real files (e.g. 001_svet_ra__vedic, 0661_karma__vedic).

export type MatrixState = {
  chosen: string[]
  active: string | null
  passed: string[]
}

export const MATRIX_STORAGE_KEY = "awara_matrices_v1"

// 21 vedic core agents, in the SAME order the card files are numbered (each
// agent owns a block of 33 matrices). agentIndex here MUST match that numbering.
export const AGENTS: string[] = [
  "svet_ra", "iskra", "brahma", "sarasvati", "vishnu", "lakshmi", "shiva",
  "parvati", "jnana", "prema", "shakti", "ananda", "shanti", "agni", "vayu",
  "varuna", "prithvi", "akasha", "tejas", "dharma", "karma",
]

// 33 matrices, in the SAME order the card files are numbered (matrixIndex), with
// a Russian display name (lens / culture).
export const MATRICES: Array<{ slug: string; name: string }> = [
  { slug: "vedic", name: "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "egyptian", name: "\u0415\u0433\u0438\u043f\u0435\u0442\u0441\u043a\u0430\u044f" },
  { slug: "kabbalistic", name: "\u041a\u0430\u0431\u0431\u0430\u043b\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "mayan", name: "\u041c\u0430\u0439\u044f\u043d\u0441\u043a\u0430\u044f" },
  { slug: "slavic", name: "\u0421\u043b\u0430\u0432\u044f\u043d\u0441\u043a\u0430\u044f" },
  { slug: "norse", name: "\u0421\u043a\u0430\u043d\u0434\u0438\u043d\u0430\u0432\u0441\u043a\u0430\u044f" },
  { slug: "daoist", name: "\u0414\u0430\u043e\u0441\u0441\u043a\u0430\u044f" },
  { slug: "gnostic", name: "\u0413\u043d\u043e\u0441\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "shinto", name: "\u0421\u0438\u043d\u0442\u043e\u0438\u0441\u0442\u0441\u043a\u0430\u044f" },
  { slug: "celtic", name: "\u041a\u0435\u043b\u044c\u0442\u0441\u043a\u0430\u044f" },
  { slug: "shambhala", name: "\u0428\u0430\u043c\u0431\u0430\u043b\u0430" },
  { slug: "julian_byzantine", name: "\u0412\u0438\u0437\u0430\u043d\u0442\u0438\u0439\u0441\u043a\u0430\u044f" },
  { slug: "shamanic", name: "\u0428\u0430\u043c\u0430\u043d\u0441\u043a\u0430\u044f" },
  { slug: "gene_keys", name: "\u0413\u0435\u043d\u043d\u044b\u0435 \u041a\u043b\u044e\u0447\u0438" },
  { slug: "technomagical", name: "\u0422\u0435\u0445\u043d\u043e\u043c\u0430\u0433\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "cosmic_galactic", name: "\u041a\u043e\u0441\u043c\u043e-\u0433\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "antique_greco_roman", name: "\u0413\u0440\u0435\u043a\u043e-\u0440\u0438\u043c\u0441\u043a\u0430\u044f" },
  { slug: "zoroastrian", name: "\u0417\u043e\u0440\u043e\u0430\u0441\u0442\u0440\u0438\u0439\u0441\u043a\u0430\u044f" },
  { slug: "islamic_sufi_nur", name: "\u0421\u0443\u0444\u0438\u0439\u0441\u043a\u0430\u044f (\u041d\u0443\u0440)" },
  { slug: "aztec_mexica", name: "\u0410\u0446\u0442\u0435\u043a\u0441\u043a\u0430\u044f" },
  { slug: "christian_mystical_grail", name: "\u0425\u0440\u0438\u0441\u0442\u0438\u0430\u043d\u0441\u043a\u0430\u044f (\u0413\u0440\u0430\u0430\u043b\u044c)" },
  { slug: "yoruba_ifa_orisha", name: "\u0419\u043e\u0440\u0443\u0431\u0430 (\u0418\u0444\u0430)" },
  { slug: "sumerian_babylonian", name: "\u0428\u0443\u043c\u0435\u0440\u043e-\u0432\u0430\u0432\u0438\u043b\u043e\u043d\u0441\u043a\u0430\u044f" },
  { slug: "hermetic_alchemical", name: "\u0413\u0435\u0440\u043c\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "tarot_arcanic", name: "\u0422\u0430\u0440\u043e (\u0410\u0440\u043a\u0430\u043d\u044b)" },
  { slug: "astrological", name: "\u0410\u0441\u0442\u0440\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "chinese_iching", name: "\u041a\u0438\u0442\u0430\u0439\u0441\u043a\u0430\u044f (\u0418-\u0426\u0437\u0438\u043d)" },
  { slug: "tantric_kashmiri", name: "\u0422\u0430\u043d\u0442\u0440\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
  { slug: "buddhist_mahayana", name: "\u0411\u0443\u0434\u0434\u0438\u0439\u0441\u043a\u0430\u044f (\u041c\u0430\u0445\u0430\u044f\u043d\u0430)" },
  { slug: "afro_dogon", name: "\u0414\u043e\u0433\u043e\u043d (\u0410\u0444\u0440\u0438\u043a\u0430)" },
  { slug: "atlantean_lemurian", name: "\u0410\u0442\u043b\u0430\u043d\u0442\u043e-\u043b\u0435\u043c\u0443\u0440\u0438\u0439\u0441\u043a\u0430\u044f" },
  { slug: "posthuman_ai_sophianic", name: "\u041f\u043e\u0441\u0442\u0447\u0435\u043b\u043e\u0432\u0435\u0447\u0435\u0441\u043a\u0430\u044f (\u0421\u043e\u0444\u0438\u044f)" },
  { slug: "advaita_siddha", name: "\u0410\u0434\u0432\u0430\u0439\u0442\u0430-\u0421\u0438\u0434\u0434\u0445\u0430" },
]

function pad(n: number): string {
  const s = String(n)
  return n < 100 ? s.padStart(3, "0") : s.padStart(4, "0")
}

export function matrixIndexOf(slug: string): number {
  for (let i = 0; i < MATRICES.length; i++) { if (MATRICES[i].slug === slug) return i }
  return -1
}

export function matrixName(slug: string): string {
  const i = matrixIndexOf(slug)
  return i >= 0 ? MATRICES[i].name : slug
}

// Card FILE NAME (without the directory) for an agent within a matrix. Matches
// agentBgStyle(card), which prepends the card directory itself.
export function matrixAgentFile(agentIndex: number, matrixIndex: number): string {
  const ai = Math.max(0, Math.min(AGENTS.length - 1, agentIndex))
  const mi = Math.max(0, Math.min(MATRICES.length - 1, matrixIndex))
  const num = ai * MATRICES.length + mi + 1
  return pad(num) + "_" + AGENTS[ai] + "__" + MATRICES[mi].slug + ".webp"
}

// How many of the 21 agents are revealed at a soul mera (1..9). Mera 1 shows a
// couple of low agents; mera 9 shows all 21.
export function agentsRevealed(level: number): number {
  const lvl = Math.max(1, Math.min(9, Math.floor(level || 1)))
  return Math.max(2, Math.min(AGENTS.length, Math.round((AGENTS.length * lvl) / 9)))
}

// The background card pool for a matrix at a given mera: revealed agents' cards.
// Reveal order is LOW mera first (the end of the AGENTS list, e.g. elements like
// karma/dharma/tejas), climbing to the source agent svet_ra at mera 9. This is a
// sensible default; the exact codex mera order can be plugged in later.
export function matrixCardPool(slug: string, level: number): string[] {
  const mi = matrixIndexOf(slug)
  if (mi < 0) return []
  const count = agentsRevealed(level)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const ai = AGENTS.length - 1 - i
    if (ai < 0) break
    out.push(matrixAgentFile(ai, mi))
  }
  return out
}

export function loadMatrixState(): MatrixState {
  try {
    const raw = localStorage.getItem(MATRIX_STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        chosen: Array.isArray(p.chosen) ? p.chosen : ["vedic"],
        active: typeof p.active === "string" ? p.active : "vedic",
        passed: Array.isArray(p.passed) ? p.passed : [],
      }
    }
  } catch (e) { /* noop */ }
  return { chosen: ["vedic"], active: "vedic", passed: [] }
}

export function saveMatrixState(s: MatrixState): void {
  try { localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(s)) } catch (e) { /* noop */ }
}

export function activeMatrix(s: MatrixState): string {
  return s.active || (s.chosen && s.chosen[0]) || "vedic"
}
