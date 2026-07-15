// AWARA — tigelLevelFlow
// Stage 2: level handoff. Reads the Tigel prototype progress (localStorage
// "tigel_v1") and lets the matrix + level "ripen" over 7..21 days, then flows
// that matured experience into the main game, distributed across the per-matrix
// "windows" (culture skins). Advisory: a compass, not rails. Never gates play.
//
// The matured packet is written onto awara_v258_state.tigelFlow and, when the
// vanilla culture-skin engine is present (window.AwaraCultureSkin), the dominant
// matrix + level are pushed live so the windows/styles actually change.
//
// SAME-ORIGIN ONLY: this works only when the Tigel and the game share an origin
// (e.g. both on http://localhost:5173). Different origins (127.0.0.1:8787 vs
// localhost:5173) do NOT share localStorage, so nothing would flow.

import { MATRIX_ELEMENT } from "./tigelStateSync";

const STATE_KEY = "awara_v258_state";
const TIGEL_KEY = "tigel_v1";
const FLOW_KEY = "tigelFlow"; // field added onto awara_v258_state

// Ripening window (days of practice). Tunable knobs: before RIPEN_START nothing
// flows; at RIPEN_FULL the whole experience has flowed in. Linear in between.
export const RIPEN_START_DAYS = 0;
export const RIPEN_FULL_DAYS = 1;

// Matured-light thresholds -> window level 1..6. Tunable knobs.
const LEVEL_LIGHT = [12, 40, 100, 220, 420];

// Tigel lens name (RU) -> culture-skin slug. We reuse the RU key ORDER of
// MATRIX_ELEMENT (n-order 1..33) and zip it with the slug list below, so this
// file stays free of Cyrillic literals.
const SLUG_BY_N = [
  "vedic", "tarot_arcanic", "kabbalistic", "hermetic_alchemical", "slavic",
  "gnostic", "daoist", "chinese_iching", "egyptian", "mayan", "aztec_mexica",
  "celtic", "norse", "shamanic", "buddhist_mahayana", "islamic_sufi_nur",
  "christian_mystical_grail", "atlantean_lemurian", "shambhala", "gene_keys",
  "astrological", "cosmic_galactic", "shinto", "sumerian_babylonian",
  "zoroastrian", "afro_dogon", "yoruba_ifa_orisha", "tantric_kashmiri",
  "posthuman_ai_sophianic", "technomagical", "advaita_siddha",
  "julian_byzantine", "antique_greco_roman",
];

const RU_TO_SLUG: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const keys = Object.keys(MATRIX_ELEMENT);
  for (let i = 0; i < keys.length && i < SLUG_BY_N.length; i++) {
    out[keys[i]] = SLUG_BY_N[i];
  }
  return out;
})();

type Json = Record<string, any>;

export type TigelWindow = {
  slug: string;
  rawLight: number; // total light tallied for this window
  maturedLight: number; // rawLight * ripeness
  level: number; // 1..6 derived from maturedLight
  share: number; // 0..1 of total raw light
};

export type TigelFlowPacket = {
  version: 1;
  advisory: true;
  practiceDays: number;
  ripeness: number; // 0..1 over RIPEN_START..RIPEN_FULL days
  dominantMatrix: string | null;
  level: number; // dominant window level 1..6
  windows: Record<string, TigelWindow>;
  computedAt: string;
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
function num(x: any): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
function readJSON(key: string): any {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: any): void {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* advisory: ignore */
  }
}

function levelFromLight(light: number): number {
  let lv = 1;
  for (const t of LEVEL_LIGHT) if (light >= t) lv++;
  return Math.max(1, Math.min(6, lv));
}

// Split a lens tag "A x B x C" into trimmed matrix names.
function lensNames(lens: any): string[] {
  return String(lens || "")
    .split(/\s*[\u00d7x]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Build the matured flow packet from the raw Tigel state.
export function buildFlow(tigel: Json): TigelFlowPacket {
  const journal: any[] = Array.isArray(tigel.journal) ? tigel.journal : [];

  // Practice days = distinct calendar days journalled.
  const days = new Set<string>();
  for (const e of journal) if (e && e.d) days.add(String(e.d));
  const practiceDays = days.size;

  // Linear ripening RIPEN_START -> RIPEN_FULL days.
  const span = Math.max(1, RIPEN_FULL_DAYS - RIPEN_START_DAYS);
  const ripeness = clamp01((practiceDays - RIPEN_START_DAYS) / span);

  // Tally raw light per window (slug). Each day's light is split evenly across
  // the matrices in that day's lens, so a 3-matrix lens feeds 3 windows.
  const raw: Record<string, number> = {};
  let totalRaw = 0;
  for (const e of journal) {
    const names = lensNames(e && e.lens);
    if (!names.length) continue;
    const light = Math.max(0, num(e && e.light));
    const per = light / names.length;
    for (const nm of names) {
      const slug = RU_TO_SLUG[nm];
      if (!slug) continue;
      raw[slug] = (raw[slug] || 0) + per;
      totalRaw += per;
    }
  }

  const windows: Record<string, TigelWindow> = {};
  let dominant: string | null = null;
  let domRaw = -1;
  for (const slug of Object.keys(raw)) {
    const rawLight = raw[slug];
    const maturedLight = rawLight * ripeness;
    windows[slug] = {
      slug,
      rawLight: Math.round(rawLight * 100) / 100,
      maturedLight: Math.round(maturedLight * 100) / 100,
      level: levelFromLight(maturedLight),
      share: totalRaw > 0 ? Math.round((rawLight / totalRaw) * 1000) / 1000 : 0,
    };
    if (rawLight > domRaw) {
      domRaw = rawLight;
      dominant = slug;
    }
  }

  return {
    version: 1,
    advisory: true,
    practiceDays,
    ripeness: Math.round(ripeness * 1000) / 1000,
    dominantMatrix: dominant,
    level: dominant ? windows[dominant].level : 1,
    windows,
    computedAt: new Date().toISOString(),
  };
}

// Best-effort: drive the live vanilla culture-skin engine if it is loaded on
// this page (it sets <html> CSS vars + decorates windows). No-op otherwise.
function pushToSkin(flow: TigelFlowPacket): void {
  try {
    if (typeof window === "undefined") return;
    const skin = (window as any).AwaraCultureSkin;
    if (!skin || !flow.dominantMatrix) return;
    if (typeof skin.setMatrix === "function") skin.setMatrix(flow.dominantMatrix);
    if (typeof skin.setLevel === "function") skin.setLevel(flow.level);
    if (typeof skin.refresh === "function") skin.refresh();
  } catch {
    /* advisory */
  }
}

// One pass. Returns true if a packet was written.
export function syncTigelLevelFlow(): boolean {
  const tigel = readJSON(TIGEL_KEY);
  if (!tigel || typeof tigel !== "object") return false;

  const flow = buildFlow(tigel);
  // Nothing practised yet -> nothing to flow.
  if (flow.practiceDays === 0) return false;

  // Merge onto existing state without clobbering the light-bridge fields.
  const awara = readJSON(STATE_KEY) || {};
  awara[FLOW_KEY] = flow;
  writeJSON(STATE_KEY, awara);

  pushToSkin(flow);

  // Let any listener (React hook / scene) react immediately.
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("awara:tigel-flow", { detail: flow }));
    }
  } catch {
    /* advisory */
  }
  return true;
}

// Read the last computed packet (or null).
export function getTigelFlow(): TigelFlowPacket | null {
  const awara = readJSON(STATE_KEY);
  const f = awara && awara[FLOW_KEY];
  return f && typeof f === "object" ? (f as TigelFlowPacket) : null;
}

// Background runner: once + interval + storage events. Same-origin only.
export function startTigelLevelFlow(pollMs: number = 4000): () => void {
  if (typeof window === "undefined") return () => {};
  let alive = true;
  const tick = () => {
    if (!alive) return;
    try {
      syncTigelLevelFlow();
    } catch {
      /* advisory */
    }
  };
  tick();
  const id = window.setInterval(tick, Math.max(1500, pollMs));
  const onStorage = (e: StorageEvent) => {
    if (e.key === TIGEL_KEY || e.key == null) tick();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    alive = false;
    window.clearInterval(id);
    window.removeEventListener("storage", onStorage);
  };
}

export default startTigelLevelFlow;
