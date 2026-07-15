// AWARA — hubZones
// Адаптер раскрытия хаба-яйца. Мост между состоянием игрока
// (localStorage "awara_v258_state") и моделью light-core
// (window.AwaraLight.allZoneStates / zoneState).
//
// ИСТОЧНИК ИСТИНЫ — js/light-core.js. Важное уточнение (сверка с
// кодом): зоны раскрываются по ЕДИНОМУ уровню пути
// currentLevel({ awareness, honesty }).index, А НЕ по вектору сфер. Поэтому
// здесь мы лишь СОБИРАЕМ progress из состояния и СПРАШИВАЕМ модель.
//
// ШКАЛА (из selfTest light-core):
//   awareness — СЫРОЙ накопленный свет (сотни-тысячи: 350 → психический,
//             1000 → Эфир). НЕ путать с нормализованным light.awareness (0..1)
//             от моста, который служит свечению (TigelGlow).
//   honesty   — 0..1 (близость к реальности; замок реальности держит
//             низкая честность).
//
// Advisory: компас, не рельсы. Никогда не бросает: без AwaraLight отдаёт
// безопасный фоллбэк (всегда-зоны открыты, остальное — базовое/заморожено).

const STATE_KEY = "awara_v258_state";

export type ZoneState = {
  zone: string;
  label: string;
  state: string;
  stateLabel?: string;
  stageIndex: number;
  levelIndex: number | null;
  next: { state: string; atLevel: number; levelsAway: number } | null;
};

export type HubProgress = { awareness: number; honesty: number };

export type HubCouplings = {
  levelIndex: number;
  daimon: string;
  cards: string;
  etherOpen: boolean;
  ethericBody: boolean;
  awarenessCapacity: number;
  progress01: number;
};

type Json = Record<string, any>;

function num(x: any): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, num(x)));
}

function readState(): Json | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function awaraLight(): Json | null {
  try {
    return typeof window !== "undefined" ? (window as any).AwaraLight || null : null;
  } catch {
    return null;
  }
}

// progress для light-core. awareness — СЫРОЙ накопленный свет (шкала
// уровней), берём totalLight; honesty — 0..1 из пакета light моста.
export function readHubProgress(): HubProgress {
  const s = readState() || {};
  const light: Json = s.light && typeof s.light === "object" ? s.light : {};
  // awareness: предпочитаем явно сырой (light.awarenessRaw), иначе totalLight.
  const awareness = Math.max(num(s.totalLight), num(light.awarenessRaw));
  // honesty: из пакета моста (0..1). Если мост ещё не считал — 0
  // (замок реальности держит на стартовом уровне, что верно).
  const honesty = clamp01(num(light.honesty));
  return { awareness, honesty };
}

// Безопасный фоллбэк, если light-core недоступен. Совпадает с ZONES
// на стартовом уровне (atLevel 0): тигель/душа открыты, остальное — база.
const FALLBACK_ZONES: Record<string, ZoneState> = {
  tigel:    { zone: "tigel",    label: "Тигель",                  state: "open",   stageIndex: 0, levelIndex: null, next: null },
  soul:     { zone: "soul",     label: "Пространство души",       state: "open",   stageIndex: 0, levelIndex: null, next: null },
  matrices: { zone: "matrices", label: "Матрицы",                 state: "few",    stageIndex: 0, levelIndex: 0,    next: null },
  daimon:   { zone: "daimon",   label: "Даймон",                  state: "basic",  stageIndex: 0, levelIndex: 0,    next: null },
  cards:    { zone: "cards",    label: "Карты (настольная)",      state: "intro",  stageIndex: 0, levelIndex: 0,    next: null },
  temple:   { zone: "temple",   label: "Земля / Храм",            state: "locked", stageIndex: 0, levelIndex: 0,    next: null },
  cosmos:   { zone: "cosmos",   label: "Космос",                  state: "frozen", stageIndex: 0, levelIndex: 0,    next: null },
  universe: { zone: "universe", label: "Вселенная / Мироздание", state: "frozen", stageIndex: 0, levelIndex: 0,    next: null },
};

function fallbackZones(): Record<string, ZoneState> {
  // Отдаём копию, чтобы вызывающий не мутировал эталон.
  const out: Record<string, ZoneState> = {};
  for (const k of Object.keys(FALLBACK_ZONES)) out[k] = Object.assign({}, FALLBACK_ZONES[k]);
  return out;
}

// Состояния всех зон хаба при текущем прогрессе. Никогда не бросает.
export function readHubZones(): Record<string, ZoneState> {
  try {
    const L = awaraLight();
    if (L && typeof L.allZoneStates === "function") {
      const z = L.allZoneStates(readHubProgress());
      if (z && typeof z === "object") return z as Record<string, ZoneState>;
    }
  } catch {
    /* advisory: фоллбэк ниже */
  }
  return fallbackZones();
}

// Состояние одной зоны. Никогда не бросает (фоллбэк по id).
export function readZone(zoneId: string): ZoneState | null {
  try {
    const L = awaraLight();
    if (L && typeof L.zoneState === "function") {
      const z = L.zoneState(zoneId, readHubProgress());
      if (z && typeof z === "object") return z as ZoneState;
    }
  } catch {
    /* advisory */
  }
  const fb = fallbackZones();
  return fb[zoneId] || null;
}

// Связки: что синхронно растёт с уровнем (daimon/cards/эфир/прогресс).
// null, если модель недоступна — вызывающий решает сам.
export function readHubCouplings(): HubCouplings | null {
  try {
    const L = awaraLight();
    if (L && typeof L.couplings === "function") {
      const c = L.couplings(readHubProgress());
      if (c && typeof c === "object") return c as HubCouplings;
    }
  } catch {
    /* advisory */
  }
  return null;
}

export default readHubZones;
