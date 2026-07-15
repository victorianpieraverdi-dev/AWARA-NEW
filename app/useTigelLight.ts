// AWARA — useTigelLight
// Advisory bridge between the Tigel (vanilla JS world, key "awara_v258_state")
// and the React universe (Macrocosm / istok).
//
// It exposes the light packet computed by js/tigelBridge.js (computeLight ->
// state.light) WITHOUT touching React's own PlayerState progression.
//
// PRINCIPLE — compass, not rails: this is purely advisory. It must NEVER gate,
// block, or override anything. Consumers may use it to softly modulate visuals
// (brightness, hints). If the bridge is absent, the hook returns null and the UI
// behaves exactly as before.
//
// See docs/tigel-bridge-contract.md for the authoritative packet shape.

import { useEffect, useState } from "react";

export interface TigelLightGunas {
  tamas: number;
  rajas: number;
  sattva: number;
}

export interface TigelLightElements {
  earth: number;
  water: number;
  fire: number;
  air: number;
  ether: number;
}

export interface TigelLightTotals {
  totalLight: number;
  entries: number;
  tigelEntries: number;
  shadowFacings: number;
}

// Mirror of js/tigelBridge.js computeLight() output. All numeric fields are
// advisory and may be absent on older/partial packets, so consumers should
// guard with sane defaults.
export interface TigelLight {
  version: number;
  awareness: number; // 0..1 master metric
  honesty: number; // 0..1
  gunas: TigelLightGunas;
  elements: TigelLightElements;
  dominantElement: string;
  levelId: string | null;
  statusId: string | null;
  totals: TigelLightTotals;
  suggestions: unknown[];
  computedAt: string;
  advisory: true;
}

const STATE_KEY = "awara_v258_state";

type BridgeLike = {
  getLight?: () => unknown;
};

function coercePacket(value: unknown): TigelLight | null {
  if (value && typeof value === "object") {
    // Minimal sanity check: a real packet carries the advisory flag or awareness.
    const v = value as Record<string, unknown>;
    if ("awareness" in v || v.advisory === true || "gunas" in v) {
      return value as TigelLight;
    }
  }
  return null;
}

// Reads the advisory light packet. Prefers the live bridge accessor, falls back
// to the raw persisted state. Always defensive: any failure yields null.
export function readTigelLight(): TigelLight | null {
  if (typeof window === "undefined") return null;

  try {
    const bridge = (window as unknown as { AwaraTigelBridge?: BridgeLike })
      .AwaraTigelBridge;
    if (bridge && typeof bridge.getLight === "function") {
      const packet = coercePacket(bridge.getLight());
      if (packet) return packet;
    }
  } catch {
    /* advisory: ignore */
  }

  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { light?: unknown };
      const packet = coercePacket(parsed && parsed.light);
      if (packet) return packet;
    }
  } catch {
    /* advisory: ignore */
  }

  return null;
}

// React hook: returns the latest advisory Tigel light packet, or null.
// Updates on a light poll and on cross-tab storage events. Safe to use anywhere
// inside the React tree; it never throws and never blocks rendering.
export function useTigelLight(pollMs: number = 4000): TigelLight | null {
  const [light, setLight] = useState<TigelLight | null>(() => readTigelLight());

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setLight(readTigelLight());
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

  return light;
}

export default useTigelLight;
