// AWARA — useHubZones
// React-companion к app/hubZones.ts. Отдаёт живые состояния зон хаба-яйца
// (window.AwaraLight.allZoneStates) и связки (couplings) в React-дерево Macrocosm/istok.
//
// Принцип — компас, не рельсы: чисто advisory. НИКОГДА не гейтит и не
// блокирует рендер. Потребители могут мягко модулировать видимость/
// яркость зон (frozen → silhouette → partial → alive). Без AwaraLight хук отдаёт
// безопасный фоллбэк, и UI ведёт себя ровно как раньше.
//
// Шкала/модель — в hubZones.ts (источник истины: js/light-core.js).

import { useEffect, useState } from "react";
import {
  readHubZones,
  readHubCouplings,
  readHubProgress,
  type ZoneState,
  type HubCouplings,
  type HubProgress,
} from "./hubZones";

const STATE_KEY = "awara_v258_state";

export type HubZonesSnapshot = {
  zones: Record<string, ZoneState>;
  couplings: HubCouplings | null;
  progress: HubProgress;
};

function readSnapshot(): HubZonesSnapshot {
  return {
    zones: readHubZones(),
    couplings: readHubCouplings(),
    progress: readHubProgress(),
  };
}

// React-хук: последнее advisory-состояние зон хаба. Обновляется по поллингу
// и по cross-tab storage-событию. Безопасен везде в дереве: не бросает,
// не блокирует рендер.
export function useHubZones(pollMs: number = 4000): HubZonesSnapshot {
  const [snap, setSnap] = useState<HubZonesSnapshot>(() => readSnapshot());

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setSnap(readSnapshot());
    };

    tick();
    const id = window.setInterval(tick, Math.max(1000, pollMs));
    const onStorage = (e: StorageEvent) => {
      if (e.key === STATE_KEY || e.key == null) tick();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, [pollMs]);

  return snap;
}

// Удобный хелпер: одно число 0..1 — насколько зона "ожила". Сопоставляет
// известные стадии light-core к плавной яркости для veil/opacity.
// Неизвестные стадии — по стадийному индексу (мягко). Чисто advisory.
const STATE_LIVENESS: Record<string, number> = {
  // заморожено / закрыто
  frozen: 0,
  locked: 0,
  // первые проблески
  silhouette: 0.33,
  few: 0.33,
  basic: 0.33,
  intro: 0.33,
  inner: 0.33,
  opening: 0.5,
  // частично
  partial: 0.66,
  more: 0.66,
  dialogue: 0.66,
  deeper: 0.66,
  outer: 0.66,
  generations: 0.85,
  // живое / открыто
  alive: 1,
  full: 1,
  open: 1,
};

export function zoneLiveness(zone: ZoneState | null | undefined): number {
  if (!zone) return 0;
  if (zone.state && zone.state in STATE_LIVENESS) return STATE_LIVENESS[zone.state];
  // Фоллбэк: по стадийному индексу (0,1,2,3 → 0..1).
  const idx = typeof zone.stageIndex === "number" ? zone.stageIndex : 0;
  return Math.max(0, Math.min(1, idx / 3));
}

export default useHubZones;
