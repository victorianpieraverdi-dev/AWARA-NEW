// AWARA — tigelStateSync
// Этап 1.5: связка состояний. Переносит прогресс прототипа Тигля (localStorage
// "tigel_v1") в состояние, которое читает мост света (localStorage
// "awara_v258_state" -> computeLight -> .light). Так живые awareness/honesty
// игрока из прототипа питают istok (свечение + подсказки Даймона).
//
// ПРИНЦИП — компас, не рельсы: только ЧИТАЕМ прототип и МЯГКО гидрируем
// advisory-состояние. Никогда не затираем реальный прогресс основного
// приложения: если awara_v258_state уже наполнен НЕ нашим синком — не трогаем.
//
// См. js/tigelBridge.js (computeLight) и docs/tigel-bridge-contract.md.

const STATE_KEY = "awara_v258_state";
const TIGEL_KEY = "tigel_v1";

// Имя матрицы-линзы (как в прототипе) -> стихия (рус., ключи как в
// ELEMENT_RU_TO_ID моста). Источник: объект MATRIX[...] в tigel-app.html.
export const MATRIX_ELEMENT: Record<string, string> = {
  "Ведическая": "Эфир",
  "Таро": "Огонь",
  "Каббала": "Эфир",
  "Герметизм": "Огонь",
  "Славянская": "Земля",
  "Гностицизм": "Эфир",
  "Даосизм": "Вода",
  "И-Цзин": "Вода",
  "Египетская": "Огонь",
  "Майя": "Земля",
  "Ацтеки": "Огонь",
  "Кельтская": "Земля",
  "Скандинавская": "Огонь",
  "Шаманская": "Земля",
  "Буддийская": "Эфир",
  "Суфийская": "Огонь",
  "Христианская": "Вода",
  "Атлантическая": "Вода",
  "Шамбала": "Эфир",
  "Генные Ключи": "Эфир",
  "Астрологическая": "Огонь",
  "Космическая": "Эфир",
  "Шинто": "Эфир",
  "Шумерская": "Земля",
  "Зороастрийская": "Огонь",
  "Африканская": "Земля",
  "Йоруба": "Вода",
  "Тантрическая": "Огонь",
  "Постчеловеческая": "Эфир",
  "Техномагия": "Огонь",
  "Адвайта": "Эфир",
  "Византийская": "Вода",
  "Орфическая": "Вода",
};

const ELEMENT_KEYS = ["Земля", "Вода", "Огонь", "Воздух", "Эфир"];

type Json = Record<string, any>;

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

// Поля awara_v258_state, выведённые из прототипа. Именно их читает
// computeLight() моста: totalLight (-> awareness), journey (-> entries),
// elements (-> gunas/доминантная стихия), sphereData (-> honesty через баланс).
function buildFromTigel(tigel: Json): {
  totalLight: number;
  journey: any[];
  elements: Record<string, number>;
  sphereData: Json;
} {
  const journal: any[] = Array.isArray(tigel.journal) ? tigel.journal : [];

  // totalLight = сумма света прожитых дней (фоллбэк — свет текущего дня).
  let totalLight = journal.reduce((a, e) => a + num(e && e.light), 0);
  if (totalLight <= 0) totalLight = num(tigel.baseLight);

  // journey: каждый прожитый день — событие 'tigel_cauldron' (-> entries/consistency).
  const journey = journal.map((e, i) => ({
    id: "tigel_" + (e && e.d ? e.d : String(i)),
    at: e && e.d ? e.d + "T12:00:00.000Z" : new Date().toISOString(),
    type: "tigel_cauldron",
    light: num(e && e.light),
    text: (e && e.advice) || "",
    lens: (e && e.lens) || "",
  }));

  // elements: талли по стихиям выбранных линз (lensTag = "A × B × C").
  const elements: Record<string, number> = {
    Земля: 0,
    Вода: 0,
    Огонь: 0,
    Воздух: 0,
    Эфир: 0,
  };
  for (const e of journal) {
    const lensStr = String((e && e.lens) || "");
    if (!lensStr) continue;
    const names = lensStr
      .split(/\s*[\u00d7x]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const nm of names) {
      const el = MATRIX_ELEMENT[nm];
      if (el && el in elements) elements[el] += 1;
    }
  }

  // sphereData: 4 сферы моста. Чем выше доверие Даймона (trust 0..100),
  // тем ровнее распределён свет -> выше balance -> выше honesty. Так
  // «честность» прототипа (trust растёт за честные записи) питает honesty.
  const t = clamp01(num(tigel.trust) / 100);
  const L = Math.max(1, totalLight);
  const sphereData: Json = {
    feet: { light: L, entries: journey.length, themes: [] },
    heart: { light: L * t, entries: 0, themes: [] },
    head: { light: L * (0.5 + 0.5 * t), entries: 0, themes: [] },
    cooperation: { light: L * (0.7 + 0.3 * t), entries: 0, themes: [] },
  };

  return { totalLight, journey, elements, sphereData };
}

// «Пакет света» (docs/bridge-integration-plan.md): вектор сфер
// { body, soul, earth, cosmos, universe } в диапазоне 0..1. Им хаб (zoneState)
// раскрывает зоны яйца ПО СВОЕЙ сфере, а не по общей сумме. Ближние сферы
// (тело/душа) растут быстро (малый масштаб), дальние (космос/вселенная) —
// медленно (большой масштаб): метафора буквальна. Advisory: компас, не рельсы.
function buildSpheres(
  totalLight: number,
  trust: number,
): { body: number; soul: number; earth: number; cosmos: number; universe: number } {
  const L = Math.max(0, num(totalLight));
  const t = clamp01(num(trust) / 100);
  const sat = (x: number, scale: number) => clamp01(1 - Math.exp(-x / scale));
  const r3 = (x: number) => Math.round(x * 1000) / 1000;
  return {
    body: r3(sat(L, 120)),                   // тело — быстрее всех
    soul: r3(sat(L * (0.5 + 0.5 * t), 320)), // душа — свет x доверие
    earth: r3(sat(L, 900)),                  // земля / храм
    cosmos: r3(sat(L, 2600)),                // космос — медленно
    universe: r3(sat(L, 6000)),              // вселенная — медленнее всех
  };
}

// Однократный проход синхронизации. Возвращает true, если была запись.
export function syncTigelToAwara(): boolean {
  const tigel = readJSON(TIGEL_KEY);
  if (!tigel || typeof tigel !== "object") return false;

  const awara = readJSON(STATE_KEY);
  const awaraHasReal =
    !!awara &&
    (num(awara.totalLight) > 0 ||
      (Array.isArray(awara.journey) && awara.journey.length > 0));
  // Если основное приложение уже владеет состоянием — не вмешиваемся.
  if (awaraHasReal && !awara.syncedFromTigel) return false;

  const derived = buildFromTigel(tigel);
  // Прототип ещё без прожитых дней — синкать нечего (остаёмся на baseline).
  if (derived.totalLight <= 0 && derived.journey.length === 0) return false;

  const base = awara && awara.syncedFromTigel ? awara : awara || {};
  const next: Json = Object.assign({}, base, derived, {
    syncedFromTigel: true,
  });

  // Пакет .light по-прежнему считает сам мост (единый источник формулы).
  try {
    const bridge =
      typeof window !== "undefined"
        ? (window as any).AwaraTigelBridge
        : null;
    if (bridge && typeof bridge.computeLight === "function") {
      next.light = bridge.computeLight(next);
    }
  } catch {
    /* advisory: мост сам пересчитает .light при bootRefresh */
  }

  // «Пакет света»: вектор сфер для раскрытия хаба (zoneState). Не трогает
  // формулу .light моста — лишь добавляет advisory-вектор поверх объекта light.
  const spheres = buildSpheres(derived.totalLight, num(tigel.trust));
  const lightObj: Json =
    next.light && typeof next.light === "object"
      ? next.light
      : typeof next.light === "number"
        ? { value: next.light }
        : {};
  lightObj.spheres = spheres;
  next.light = lightObj;

  writeJSON(STATE_KEY, next);
  return true;
}

// Запуск фоновой синхронизации: разово + по таймеру + на storage-события
// (прототип и istok живут на одном origin, localStorage общий). Возвращает cleanup.
export function startTigelStateSync(pollMs: number = 4000): () => void {
  if (typeof window === "undefined") return () => {};
  let alive = true;
  const tick = () => {
    if (!alive) return;
    try {
      syncTigelToAwara();
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

export default startTigelStateSync;
