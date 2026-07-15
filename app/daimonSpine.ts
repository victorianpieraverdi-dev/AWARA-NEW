// AWARA — daimonSpine
// Этап 2: «более полный Даймон». Собирает grounded-контекст для живого
// голоса Даймона из позвоночника вселенной (window.AwaraLight, light-core.js):
// активная матрица-линза -> её стихия / чакра / полюс СВЕТ⇄ТЕНЬ
// (transformThroughSpine) + несколько ликов 21 агента в этой матрице
// (matrixFullSpine). Отсюда Даймон советует не одной абстрактной фразой, а
// сквозь язык текущей матрицы игрока.
//
// ПРИНЦИП — компас, не рельсы: всё advisory. Если ядро (window.AwaraLight)
// ещё не готово или матрица неизвестна — молча возвращаем минимум/null,
// и UI тихо откатывается к простой подсказке.

type Json = Record<string, any>;

const STATE_KEY = "awara_v258_state";
const TIGEL_KEY = "tigel_v1";
const DEFAULT_MATRIX = "Ведическая";

export type DaimonFace = {
  agent: string; // русское имя агента (AGENTS_21.ru)
  principle: string; // функция Источника (AGENTS_21.principle)
  face: string; // лик этого принципа в данной матрице (MATRIX_AGENTS_GRID)
};

export type DaimonSpine = {
  matrix: string;
  element?: string;
  chakra?: number;
  toward?: string; // полюс СВЕТ (pole.toward)
  away?: string; // полюс ТЕНЬ (pole.away)
  office?: string; // адрес офиса: граха.гуна
  faces: DaimonFace[];
};

function lc(): any {
  try {
    return typeof window !== "undefined" ? (window as any).AwaraLight : null;
  } catch {
    return null;
  }
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

// Ротация фокус-агентов по дням: чтобы Даймон со временем подсвечивал
// разные лики 21 агента, а не всегда одни и те же.
function dayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function pickFocusAgents(agents: any[], count: number): any[] {
  const n = agents.length;
  if (!n) return [];
  const start = ((dayIndex() % n) + n) % n;
  const out: any[] = [];
  for (let i = 0; i < Math.min(count, n); i++) out.push(agents[(start + i) % n]);
  return out;
}

// Активная матрица игрока: приоритет — выбранные линзы прототипа
// (tigel_v1.mats[0]), затем activeSystem из awara_v258_state, иначе — Дефолт.
export function activeMatrix(): string {
  const t = readJSON(TIGEL_KEY);
  if (t && Array.isArray(t.mats) && t.mats.length) {
    const m = String(t.mats[0] || "").trim();
    if (m) return m;
  }
  const a = readJSON(STATE_KEY);
  if (a && typeof a.activeSystem === "string" && a.activeSystem.trim()) {
    return a.activeSystem.trim();
  }
  return DEFAULT_MATRIX;
}

// Собрать grounded-позвоночник для активной матрицы. Никогда не бросает.
export function buildDaimonSpine(opts?: {
  awareness?: number;
  honesty?: number;
  focusCount?: number;
}): DaimonSpine | null {
  const matrix = activeMatrix();
  const L = lc();
  const out: DaimonSpine = { matrix, faces: [] };
  if (!L) return out;

  try {
    if (typeof L.transformThroughSpine === "function") {
      const s = L.transformThroughSpine(matrix, {
        awareness: opts && opts.awareness,
        honesty: opts && opts.honesty,
      });
      if (s && s.ok) {
        if (s.element) out.element = String(s.element);
        if (typeof s.chakra === "number") out.chakra = s.chakra;
        if (s.pole) {
          if (s.pole.toward) out.toward = String(s.pole.toward);
          if (s.pole.away) out.away = String(s.pole.away);
        }
        if (s.office && s.office.address) out.office = String(s.office.address);
      }
    }
  } catch {
    /* advisory */
  }

  try {
    const focusCount = opts && typeof opts.focusCount === "number" ? opts.focusCount : 3;
    const spine =
      typeof L.matrixFullSpine === "function" ? L.matrixFullSpine(matrix) : null;
    const agents = Array.isArray(L.AGENTS_21) ? L.AGENTS_21 : [];
    if (spine && agents.length) {
      const picked = pickFocusAgents(agents, focusCount);
      for (const a of picked) {
        const face = spine[a.id];
        if (face) {
          out.faces.push({
            agent: String(a.ru || a.id),
            principle: String(a.principle || ""),
            face: String(face),
          });
        }
      }
    }
  } catch {
    /* advisory */
  }

  return out;
}

// Превратить позвоночник в текст-контекст для живого голоса Даймона.
export function spineToPrompt(s: DaimonSpine): string {
  const lines: string[] = [];
  lines.push("Позвоночник вселенной сейчас (матрица-линза «" + s.matrix + "»):");
  const bits: string[] = [];
  if (s.element) bits.push("стихия " + s.element);
  if (typeof s.chakra === "number") bits.push("чакра " + s.chakra);
  if (bits.length) lines.push("- " + bits.join(", ") + ".");
  if (s.toward || s.away) {
    lines.push(
      "- Полюс оси: тянись к «" +
        (s.toward || "свету") +
        "», замечай тень «" +
        (s.away || "") +
        "» (компас, не рельсы).",
    );
  }
  if (s.faces.length) {
    lines.push("- Лики Источника в этой матрице (из 21 агента-принципа):");
    for (const f of s.faces) {
      lines.push("  \u00b7 " + f.agent + " (" + f.principle + ") \u2014 " + f.face);
    }
  }
  lines.push("");
  lines.push(
    "Если уместно — мягко вплети эту матрицу, её полюс или один из ликов в свою живую подсказку.",
  );
  return lines.join("\n");
}

export default buildDaimonSpine;
