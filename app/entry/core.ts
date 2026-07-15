// AWARA -- Entry screen core logic (no JSX): i18n, state machine,
// device capabilities and parallax. Framework-agnostic, production-ready.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

/* ============================ i18n ============================ */
export type Locale = "ru" | "en";

export const DICT = {
  ru: {
    sparkAria: "\u0412\u043e\u0439\u0434\u0438 \u0432 \u0441\u0444\u0435\u0440\u0443",
    caption: "\u0412\u043e\u0439\u0434\u0438 \u0432 \u0441\u0444\u0435\u0440\u0443",
    enterHint: "\u041d\u0430\u0436\u043c\u0438\u0442\u0435 Enter \u0438\u043b\u0438 \u041f\u0440\u043e\u0431\u0435\u043b, \u0447\u0442\u043e\u0431\u044b \u0432\u043e\u0439\u0442\u0438",
    touchHint: "\u041a\u043e\u0441\u043d\u0438\u0441\u044c \u0441\u0444\u0435\u0440\u044b",
    tapAgainHint: "\u041a\u043e\u0441\u043d\u0438\u0441\u044c \u0435\u0449\u0451 \u0440\u0430\u0437, \u0447\u0442\u043e\u0431\u044b \u0432\u043e\u0439\u0442\u0438",
  },
  en: {
    sparkAria: "Enter the Sphere",
    caption: "Enter the Sphere",
    enterHint: "Press Enter or Space to enter",
    touchHint: "Touch the sphere",
    tapAgainHint: "Tap again to enter",
  },
} as const;

export type DictKey = keyof typeof DICT["ru"];

export function resolveLocale(override?: Locale): Locale {
  if (override) return override;
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ru")) return "ru";
  return "en";
}

export function useLocale(override?: Locale) {
  const locale = resolveLocale(override);
  const t = useCallback((key: DictKey) => DICT[locale][key], [locale]);
  const bilingualCaption = `${DICT.ru.caption} / ${DICT.en.caption}`;
  return { locale, t, bilingualCaption };
}

/* ============================ state machine ============================ */
// idle -> hover/focus -> pressed -> transition (terminal)
export type EntryState = "idle" | "hover" | "pressed" | "transition";
export type EntryEvent =
  | { type: "HOVER" }
  | { type: "UNHOVER" }
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "PRESS" }
  | { type: "CANCEL" }
  | { type: "ACTIVATE" };

function reducer(state: EntryState, event: EntryEvent): EntryState {
  if (state === "transition") return state;
  switch (event.type) {
    case "HOVER":
    case "FOCUS":
      return state === "idle" ? "hover" : state;
    case "UNHOVER":
    case "BLUR":
      return state === "hover" ? "idle" : state;
    case "PRESS":
      return state === "hover" || state === "idle" ? "pressed" : state;
    case "CANCEL":
      return state === "pressed" ? "hover" : state;
    case "ACTIVATE":
      return "transition";
    default:
      return state;
  }
}

export function useEntryMachine() {
  const [state, dispatch] = useReducer(reducer, "idle");
  const send = useCallback((e: EntryEvent) => dispatch(e), []);
  const flags = useMemo(
    () => ({
      isIdle: state === "idle",
      isHover: state === "hover",
      isPressed: state === "pressed",
      isTransition: state === "transition",
    }),
    [state]
  );
  return { state, send, ...flags };
}

/* ============================ device capabilities ============================ */
export interface DeviceCapabilities {
  reducedMotion: boolean;
  lowPower: boolean;
  webgl: boolean;
  canRender3D: boolean;
  mobile: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      (window as any).WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function detectLowPower(): boolean {
  // Only bail to the static fallback on genuinely weak hardware. Most phones
  // (4-8 cores, 3-4 GB) SHOULD get the full living entry -- they are the whole
  // point of "touch the beauty on mobile". A coarse-pointer device is handled
  // separately (lower DPR), not by killing 3D.
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as any).deviceMemory as number | undefined;
  return cores <= 2 || (typeof mem === "number" && mem <= 1);
}

// Coarse pointer + no hover = a touch device (phone / tablet). Used to cap the
// renderer DPR and tune the touch interaction, NOT to disable the experience.
function detectMobile(): boolean {
  try {
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch {
    return false;
  }
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    reducedMotion: false,
    lowPower: false,
    webgl: true,
    canRender3D: true,
    mobile: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webgl = detectWebGL();
    const lowPower = detectLowPower();
    const mobile = detectMobile();
    const update = () => {
      const reducedMotion = mq.matches;
      setCaps({ reducedMotion, lowPower, webgl, mobile, canRender3D: webgl && !reducedMotion && !lowPower });
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return caps;
}

/* ============================ parallax ============================ */
export interface ParallaxVec {
  x: number;
  y: number;
}

export function useParallax(enabled: boolean) {
  const target = useRef<ParallaxVec>({ x: 0, y: 0 });
  const value = useRef<ParallaxVec>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onPointer = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma != null) target.current.x = Math.max(-1, Math.min(1, e.gamma / 45));
      if (e.beta != null) target.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    let raf = 0;
    const tick = () => {
      value.current.x += (target.current.x - value.current.x) * 0.08;
      value.current.y += (target.current.y - value.current.y) * 0.08;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return value;
}

/* ============================ ambient sound ============================ */
// Pure Web Audio (no asset files): a low "void" drone that swells with proximity
// to the sphere, plus a soft gold chime on entry. Created lazily on the FIRST
// user gesture (browser autoplay policy). Fully optional + mutable -- if it ever
// feels wrong, drop the useAmbientSound() call in EntryScreen and the toggle.
export function useAmbientSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const mutedRef = useRef(false);
  const [muted, setMutedState] = useState(false);

  // Build the graph once, on a real user gesture, and resume if suspended.
  const ensureStarted = useCallback(() => {
    if (!enabled) return;
    if (startedRef.current) { ctxRef.current?.resume?.(); return; }
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = mutedRef.current ? 0 : 1;
      master.connect(ctx.destination);
      // Warm low hum: detuned sines + a triangle, softened by a lowpass.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 320;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.0001; // essentially silent until proximity raises it
      lp.connect(droneGain);
      droneGain.connect(master);
      const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
      const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 82.5; o2.detune.value = -6;
      const o3 = ctx.createOscillator(); o3.type = "triangle"; o3.frequency.value = 110; o3.detune.value = 4;
      o1.connect(lp); o2.connect(lp); o3.connect(lp);
      o1.start(); o2.start(); o3.start();
      ctxRef.current = ctx;
      droneGainRef.current = droneGain;
      masterRef.current = master;
      startedRef.current = true;
      ctx.resume?.();
    } catch {
      /* audio unavailable -- silently ignore */
    }
  }, [enabled]);

  // Swell the drone with cursor->sphere proximity (0..1). Gentle by design.
  const setLevel = useCallback((p: number) => {
    const g = droneGainRef.current;
    const ctx = ctxRef.current;
    if (!g || !ctx) return;
    const clamped = Math.max(0, Math.min(1, p));
    const target = 0.0001 + clamped * 0.10;
    g.gain.setTargetAtTime(target, ctx.currentTime, 0.2);
  }, []);

  // A soft gold bell on entry: a few harmonics with a gentle exponential decay.
  const chime = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    [528, 792, 1056].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      const peak = 0.18 / (i + 1);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      o.connect(g);
      g.connect(master);
      o.start(now);
      o.stop(now + 1.7);
    });
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMutedState(mutedRef.current);
    const m = masterRef.current;
    const ctx = ctxRef.current;
    if (m && ctx) m.gain.setTargetAtTime(mutedRef.current ? 0 : 1, ctx.currentTime, 0.05);
  }, []);

  useEffect(() => () => { try { ctxRef.current?.close?.(); } catch { /* ignore */ } }, []);

  return { ensureStarted, setLevel, chime, muted, toggleMute };
}
