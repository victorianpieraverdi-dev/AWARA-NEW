// AWARA -- Block 1 "Personal Universe" + Block 1.3 "Other players' universes" (nodes 1 / 1.3).
// Interactive map of consciousness / mirror of awareness. Each universe is seeded, so its
// FORM (torus / spiral / sphere / rings), its STAR colour and its CENTRAL SOURCE colour all
// differ -- and they change as you travel left/right between players' universes (node 1.3).
// Luminosity (Light) drives star density + brightness + the central source's volume; a dark
// veil dims a low-Light cosmos and lifts as Light grows. A tinted nebula BACKGROUND sets the
// mood per universe. Zoom in/out with wheel (desktop) or pinch (mobile). At the start the
// player may re-roll their universe a few times. RU/EN toggle (top-right) switches the single,
// non-duplicated caption. Everything works with touch on phones too.
// Stack: R3F + postprocessing + gsap. Cyrillic only as \uXXXX escapes; GLSL in backtick strings.

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { usePlayer } from "../PlayerProvider";
import EggHub from "./EggHub";
import { T5Creator } from "../T5Creator";
import { TierLadder } from "../TierLadder";
import { useHubZones, zoneLiveness } from "../useHubZones";
import { lokaFill, lokaPolarity, type LokaNourish } from "../../core/types";
import type { PowerSource, SubtleLink } from "../../core/types";

// Node 1.2 "Human architecture" data. Imported as JSON so its Cyrillic content needs NO \uXXXX escaping.
import chakrasData from "../../data/chakras.json";
import dims9Data from "../../data/dimensions_9.json";
import archData from "../../data/human_architecture.json";
import chaturaData from "../../data/chatura_loka.json";
import vedicData from "../../data/vedic_loka.json";
import agentsData from "../../data/agents.json";
import forcesData from "../../data/cosmic_forces.json";

/* ============================ i18n ============================ */

type Locale = "ru" | "en";

const T = {
  ru: {
    own: "\u0422\u0432\u043e\u044f \u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f", // Tvoya Vselennaya
    sub: "\u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f \u0438\u0433\u0440\u043e\u043a\u0430", // Vselennaya igroka
    light: "\u0421\u0432\u0435\u0442", // Svet
    reroll: "\u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c", // Sgenerirovat
    accept: "\u041f\u0440\u0438\u043d\u044f\u0442\u044c", // Prinyat
    fixed: "\u2726 \u043a\u043e\u0441\u043c\u043e\u0441 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d", // kosmos opredelyon
  },
  en: {
    own: "Your Universe",
    sub: "Player universe",
    light: "Light",
    reroll: "Generate",
    accept: "Accept",
    fixed: "\u2726 cosmos is set",
  },
} as const;

function resolveLocale(): Locale {
  try {
    if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ru")) return "ru";
  } catch {
    /* ignore */
  }
  return "en";
}

/* ============================ helpers ============================ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Shape = "torus" | "spiral" | "sphere" | "rings";
const SHAPES: Shape[] = ["torus", "spiral", "sphere", "rings"];

type SourceKind = "sun" | "beam";

interface UniverseForm {
  seed: number;
  shape: Shape;
  hueA: number;     // star hue
  hueB: number;     // central source hue
  tilt: number;
  twist: number;
  tubeRatio: number;
  arms: number;
  source: SourceKind; // central source: radiant sun OR a vertical beam piercing the cosmos
}

function buildForm(seed: number): UniverseForm {
  const rnd = mulberry32(seed);
  const shape = SHAPES[Math.floor(rnd() * SHAPES.length)];
  const hueA = rnd();
  const hueB = rnd();
  const tilt = (rnd() - 0.5) * 1.1;
  const twist = 2.0 + rnd() * 4.0;
  const tubeRatio = 0.3 + rnd() * 0.2;
  const arms = 2 + Math.floor(rnd() * 4);
  const source: SourceKind = rnd() < 0.4 ? "beam" : "sun";
  return { seed, shape, hueA, hueB, tilt, twist, tubeRatio, arms, source };
}

const LIGHT_MAX = 1.5;
function clampLight(x: number) {
  return Math.max(0, Math.min(LIGHT_MAX, x));
}
function hsl(h: number, s: number, l: number) {
  return new THREE.Color().setHSL((h % 1 + 1) % 1, s, l);
}
function hex(c: THREE.Color) {
  return "#" + c.getHexString();
}

// Seeded nebula BACKGROUND -- each universe gets its own mood: several soft colour clouds at
// seeded positions / hues over a dark vignette. Pure CSS (sits under the transparent canvas).
function buildNebulaBg(form: UniverseForm, frac: number): string {
  const rnd = mulberry32(form.seed ^ 0x1b873593);
  const a = Math.round((0.2 + frac * 0.4) * 255).toString(16).padStart(2, "0");
  const layers: string[] = [];
  const nBlobs = 3 + Math.floor(rnd() * 3); // 3-5 colour clouds
  for (let i = 0; i < nBlobs; i++) {
    const hue = (form.hueA + (rnd() - 0.5) * 0.55 + i * 0.13 + 1) % 1;
    const col = hex(hsl(hue, 0.5 + rnd() * 0.25, 0.4 + rnd() * 0.1));
    const px = Math.round(12 + rnd() * 76);
    const py = Math.round(12 + rnd() * 76);
    const w = Math.round(42 + rnd() * 46);
    const h = Math.round(38 + rnd() * 44);
    layers.push(
      "radial-gradient(ellipse " + w + "% " + h + "% at " + px + "% " + py + "%, " + col + a + " 0%, transparent 60%)"
    );
  }
  layers.push("radial-gradient(circle at 50% 50%, " + hex(hsl(form.hueB, 0.72, 0.7)) + "2e 0%, transparent 44%)");
  layers.push("radial-gradient(circle at 50% 50%, #06040f 0%, #04040a 100%)");
  return layers.join(",");
}

/* ============================ persistence (start-of-game generation) ============================ */

const SEED_KEY = "awara.universe.seed";
const ROLLS_KEY = "awara.universe.rolls";
const LIGHT_KEY = "awara.universe.light"; // персистентный «Свет» с ползунка (−1 = не задан, следуем реальному свету)
const ROLLS_START = 3;

function loadNum(key: string, fallback: number): number {
  try {
    if (typeof window === "undefined") return fallback;
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : Number(v);
  } catch {
    return fallback;
  }
}
function saveNum(key: string, val: number) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, String(val));
  } catch {
    /* ignore */
  }
}

/* ============================ universe roster (node 1.3) ============================ */

interface UniverseEntry {
  seed: number;
  name: string;
  light: number;
  own?: boolean;
}

// Player's own universe is first; the rest are other players' cosmoses (distinct seeds ->
// distinct shapes, colours + Light). Later wires to real players / NPCs from the backend.
const OTHERS: UniverseEntry[] = [
  { seed: 1102, name: "Iskra", light: 0.85 },
  { seed: 2238, name: "Veles", light: 1.25 },
  { seed: 3391, name: "Lada", light: 0.5 },
  { seed: 4417, name: "Svet Ra", light: 1.45 },
  { seed: 5560, name: "Mokosh", light: 1.0 },
];

/* ============================ vertical "windows" (node 1 sub-views) ============================ */

// Besides paging LEFT/RIGHT through other players' universes (node 1.3), the player can list
// UP/DOWN through "windows" stacked above & below the living cosmos. For now these are just the
// visual SKELETON -- empty panels floating in space. Their content + the inner-energy / light-
// exchange (prana) mechanics get wired in later as the game logic comes together.
// Level 0 is the universe itself; positive = up, negative = down.
interface VWindow {
  level: number;
  titleRu: string;
  titleEn: string;
}
// Vertical canon (node 1). Up = expansion outward (lokas -> cosmic forces);
// down = inward (Chatur-loka -> the human architecture / chakras). Tree & Crystal
// will later sit LEFT/RIGHT of the "human" screen; not top-level windows yet.
const V_WINDOWS: VWindow[] = [
  // \u0421\u0430\u0442\u044c\u044f \u042e\u0433\u0430 (Satya Yuga -- the golden gate into Creation, above the forces)
  { level: 3, titleRu: "\u0421\u0430\u0442\u044c\u044f \u042e\u0433\u0430", titleEn: "Satya Yuga" },
  // \u041a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0441\u0438\u043b\u044b (Cosmic forces)
  { level: 2, titleRu: "\u041a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0441\u0438\u043b\u044b", titleEn: "Cosmic forces" },
  // 14 \u043b\u043e\u043a (14 lokas)
  { level: 1, titleRu: "14 \u043b\u043e\u043a", titleEn: "14 lokas" },
  // \u0427\u0430\u0442\u0443\u0440-\u043b\u043e\u043a\u0430 (Chatur-loka)
  { level: -1, titleRu: "\u0427\u0430\u0442\u0443\u0440-\u043b\u043e\u043a\u0430", titleEn: "Chatur-loka" },
  // \u0410\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430 (Human architecture: 7 chakras / 9D)
  { level: -2, titleRu: "\u0410\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430 \u00b7 7 \u0447\u0430\u043a\u0440 / 9 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u0439", titleEn: "Human architecture \u00b7 7 chakras / 9D" },
];
const V_LEVELS = [0, ...V_WINDOWS.map((w) => w.level)];
const V_MAX = Math.max(...V_LEVELS);
const V_MIN = Math.min(...V_LEVELS);
// Levels top -> bottom for the side "floor" indicator rail (highest window sits at the top).
const V_RAIL = [...V_LEVELS].sort((a, b) => b - a);

/* ============================ Energy of the day: an active loka infuses YOUR universe ============================ */
// As above, so below. The day's energy activates one of the 14 Vedic lokas, whose signature colour
// bleeds into the player's OWN universe -- its central source and stars take on that energy, so the
// macrocosm visibly reflects the active loka. (For now the loka rotates by calendar day; later this is
// driven by the energy the player has actually earned / by active cards.)
type DayLoka = { id: number; color: string; name: string; name_en: string };
// Home base of the player's OWN universe: Bhur-loka (id 7 -- Muladhara, physical Earth, #66bbff).
// The middle/physical world that has ALL spectra available; influences shift it from here.
function lokaById(id: number): DayLoka {
  const lokas = (vedicData as { lokas: DayLoka[] }).lokas;
  return (lokas.find((l) => l.id === id) ?? lokas[0]) as DayLoka;
}
function lokaOfTheDay(): DayLoka {
  const lokas = (vedicData as { lokas: DayLoka[] }).lokas;
  const day = Math.floor(Date.now() / 86400000);
  const i = ((day % lokas.length) + lokas.length) % lokas.length;
  return (lokas[i] ?? lokas[0]) as DayLoka;
}
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function hexToRgb(h: string): [number, number, number] {
  const s = h.replace("#", "");
  const full = s.length === 3 ? s[0] + s[0] + s[1] + s[1] + s[2] + s[2] : s;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexMix(a: string, b: string, t: number): string {
  const k = clamp01(t);
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return "#" + ch(ca[0], cb[0]) + ch(ca[1], cb[1]) + ch(ca[2], cb[2]);
}

/* ============================ GLSL: galaxy points ============================ */

const GALAXY_VERT = `
  uniform float uTime;
  uniform float uLight;
  uniform float uHeart;
  attribute vec3 aColor;
  attribute float aSize;
  varying vec3 vColor;
  varying float vPulse;
  void main(){
    vColor = aColor;
    float rc = length(position);
    float centerW = exp(-rc * rc * 2.4);            // 1 at the nucleus, fading softly across the bulge
    float beat = uHeart * centerW;                  // heart pulse concentrated at the galactic centre
    vPulse = beat;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.93 + 0.07 * sin(uTime * 0.7 + position.x * 3.0 + position.z * 2.0);
    gl_PointSize = max(aSize * (0.42 + uLight * 0.36) * twinkle * (1.0 + beat * 0.5) * (98.0 / -mv.z), 0.65);
    gl_Position = projectionMatrix * mv;
  }
`;
const GALAXY_FRAG = `
  precision highp float;
  uniform float uLight;
  varying vec3 vColor;
  varying float vPulse;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float core = exp(-d * d * 64.0);        // tight, crisp stellar core
    float glow = exp(-d * d * 16.0) * 0.26; // faint diffraction-like halo
    float a = core + glow;
    if (a < 0.012) discard;
    gl_FragColor = vec4(vColor * (0.32 + uLight * 0.4) * (1.0 + vPulse * 0.85), a * 0.9);
  }
`;

const COUNT_MIN = 5200;
const COUNT_SPAN = 32000;

function buildGalaxy(form: UniverseForm, count: number, starHex: string, coreHex: string) {
  const rnd = mulberry32(form.seed ^ 0x9e3779b9);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const cStar = new THREE.Color(starHex);
  const cCore = new THREE.Color(coreHex);
  const base = new THREE.Color();
  const RMAX = 2.2;
  const nBulge = Math.floor(count * 0.2);                                 // dense hot central bulge
  const nHalo = form.shape === "sphere" ? 0 : Math.floor(count * 0.06);   // thin bright rim ring

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0, mix = rnd();

    if (i < nBulge) {
      // Central BULGE -- the bright hot core every galaxy grows from (slightly flattened sphere).
      const rad = 0.46 * Math.pow(rnd(), 1.8);
      const uu = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const rr = Math.sqrt(1 - uu * uu);
      x = rad * rr * Math.cos(th);
      y = rad * uu * 0.6;
      z = rad * rr * Math.sin(th);
      mix = Math.min(1, rad / 0.46) * 0.35; // hottest at the very centre
    } else if (i < nBulge + nHalo) {
      // Thin bright HALO RING at the disk rim (the lit ring seen on the references).
      const rad = RMAX * (0.92 + (rnd() - 0.5) * 0.07);
      const ang = rnd() * Math.PI * 2;
      x = Math.cos(ang) * rad;
      z = Math.sin(ang) * rad;
      y = (rnd() - 0.5) * 0.05;
      mix = 1.0;
    } else if (form.shape === "torus") {
      const R = 1.9;
      const r = R * form.tubeRatio;
      const u = rnd() * Math.PI * 2;
      const v = rnd() * Math.PI * 2;
      const jit = Math.pow(rnd(), 1.6);
      const rr = r * jit;
      const vt = v + u * form.twist;
      const ringX = R + rr * Math.cos(vt);
      x = ringX * Math.cos(u);
      y = rr * Math.sin(vt) * 0.7;
      z = ringX * Math.sin(u);
      mix = jit;
    } else if (form.shape === "spiral") {
      // FLAT disk with thin, crisp LOGARITHMIC spiral arms blending out of the bulge.
      const t = Math.pow(rnd(), 0.5);
      const rad = 0.18 + t * (RMAX - 0.18);
      const arm = Math.floor(rnd() * form.arms);
      const wind = Math.log(rad / 0.18) * form.twist * 0.55;     // logarithmic winding (real arms)
      const thin = (rnd() - 0.5) * (rnd() - 0.5) * 1.1;          // peaked offset -> thin, crisp arm
      const ang = (arm / form.arms) * Math.PI * 2 + wind + thin;
      x = Math.cos(ang) * rad;
      z = Math.sin(ang) * rad;
      y = (rnd() - 0.5) * 0.12 * (1.0 - t * 0.55);               // thin disk, a touch thicker inside
      mix = t;
    } else if (form.shape === "sphere") {
      // Elliptical galaxy -- a soft, slightly oblate spheroid.
      const uu = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const rr = Math.sqrt(1 - uu * uu);
      const rad = RMAX * Math.pow(rnd(), 1 / 3);
      x = rad * rr * Math.cos(th);
      y = rad * uu * 0.78;
      z = rad * rr * Math.sin(th);
      mix = rad / RMAX;
    } else {
      // rings: flat concentric lit rings (Helios-/Saturn-like nested haloes).
      const nRings = 4;
      const ri = Math.floor(rnd() * nRings);
      const baseR = 0.6 + ri * ((RMAX - 0.6) / (nRings - 1));
      const rad = baseR + (rnd() - 0.5) * 0.18;                  // tighter band -> crisper ring
      const ang = rnd() * Math.PI * 2;
      x = Math.cos(ang) * rad;
      z = Math.sin(ang) * rad;
      y = (rnd() - 0.5) * 0.06;                                  // flat disk plane
      mix = Math.min(1, Math.max(0, rad / RMAX));
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    base.copy(cCore).lerp(cStar, mix);
    colors[i * 3 + 0] = base.r;
    colors[i * 3 + 1] = base.g;
    colors[i * 3 + 2] = base.b;
    sizes[i] = 0.18 + rnd() * 0.7; // even finer, more numerous stars
  }

  return { positions, colors, sizes };
}

function GalaxyPoints({
  form,
  light,
  starHex,
  coreHex,
  draggingRef,
}: {
  form: UniverseForm;
  light: number;
  starHex: string;
  coreHex: string;
  draggingRef: React.MutableRefObject<boolean>;
}) {
  const group = useRef<THREE.Group>(null!);
  const count = Math.round(COUNT_MIN + Math.min(1, light / LIGHT_MAX) * COUNT_SPAN);
  // Плотность звёзд зашита в GPU-буфер при монтировании: смена длины массива у <bufferAttribute>
  // сама по себе НЕ перезаливает буфер (поэтому раньше «работало» только после пересоздания
  // вселенной). Ключуем геометрию по «корзине» плотности — она перемонтируется и звёзд реально
  // становится больше/меньше прямо во время перетаскивания ползунка. Шаг ~1500 звёзд: плавно и без
  // лишних перемонтирований на каждый тик.
  const densityKey = Math.round(count / 1500);
  const buffers = useMemo(
    () => buildGalaxy(form, count, starHex, coreHex),
    [form, count, starHex, coreHex]
  );
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uLight: { value: light }, uHeart: { value: 0 } }), []);
  const invalidate = useThree((s) => s.invalidate);
  // Свет должен меняться СРАЗУ при движении ползунка — даже без непрерывного кадрового цикла
  // (на T0 frameloop="demand"). Поэтому впечатываем новое значение в юниформу и просим перерисовку,
  // иначе яркость догоняет ползунок только после пересоздания вселенной.
  useEffect(() => {
    uniforms.uLight.value = light;
    invalidate();
  }, [light, uniforms, invalidate]);
  const { tier, player } = usePlayer();
  // The galaxy's own CORE (the bright central bulge) beats with the high Meras (M6-M9): the more
  // those high dimensions are pumped, the more the nucleus breathes with light. T5 forces it on.
  const heartBase = useMemo(() => {
    const vc = visibleSpheresForTier(tier);
    let hi = tier >= 5 ? 1 : 0;
    for (const l of player.lokas ?? []) {
      if (meraIndexForLoka(l.index, vc) >= 5) hi = Math.max(hi, lokaFill(l));
    }
    return hi;
  }, [player.lokas, tier]);
  useFrame((s, dt) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uLight.value += (light - uniforms.uLight.value) * 0.05;
    // A slow, gentle heartbeat of the galactic nucleus -- swells with the pumped high Meras.
    uniforms.uHeart.value = heartBase * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 0.4));
    // The universe is a FIXED body in world space: its own natural tilt + a gentle self-spin on
    // its axis. We no longer rotate it on drag -- instead the CAMERA orbits it (see SceneContents),
    // so dragging feels like turning your head INSIDE the surrounding sphere, on a full 360.
    if (group.current) {
      group.current.rotation.x = form.tilt;
      if (!draggingRef.current) group.current.rotation.y += dt * 0.025; // gentle idle self-spin
    }
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry key={densityKey}>
          <bufferAttribute attach="attributes-position" array={buffers.positions} count={count} itemSize={3} />
          <bufferAttribute attach="attributes-aColor" array={buffers.colors} count={count} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" array={buffers.sizes} count={count} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={GALAXY_VERT}
          fragmentShader={GALAXY_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ============================ GLSL: colored background stars ============================ */

const BG_VERT = `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  varying float vTw;
  void main(){
    vTw = 0.74 + 0.26 * sin(uTime * 0.55 + aPhase * 6.2831853);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * (105.0 / -mv.z), 0.6);
    gl_Position = projectionMatrix * mv;
  }
`;
const BG_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  varying float vTw;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = exp(-d * d * 60.0) + exp(-d * d * 16.0) * 0.22; // crisp point + faint halo
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor, a * vTw * 0.9);
  }
`;

function BackgroundStars({ count, colorHex }: { count: number; colorHex: string }) {
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const rr = 9 + Math.random() * 34;
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3 + 0] = rr * s * Math.cos(th);
      pos[i * 3 + 1] = rr * u;
      pos[i * 3 + 2] = rr * s * Math.sin(th);
      sz[i] = 0.28 + Math.random() * Math.random() * 1.2;
      ph[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(colorHex) } }),
    []
  );
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uColor.value.copy(color);
  });
  return (
    <points geometry={geom}>
      <shaderMaterial
        vertexShader={BG_VERT}
        fragmentShader={BG_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ============================ GLSL: volumetric central source ============================ */

const CORE_VERT = `
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const CORE_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uLight;
  uniform float uHeart;
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    float d = max(dot(vN, vV), 0.0);
    float core = pow(d, 1.6);        // bright, rounded centre -> volume
    float rim  = pow(1.0 - d, 2.6);  // glowing limb -> the sense of a sphere
    float pulse = 0.9 + 0.06 * sin(uTime * 0.7);             // slow, soft idle breath
    float heart = 1.0 + uHeart * 0.5;                        // the centre swells with the high Meras
    vec3 col = uColor * (core * 1.3 + rim * 0.85) * (0.5 + uLight * 0.6) * heart;
    float a = (core * 0.8 + rim * 0.6) * pulse * (0.85 + uHeart * 0.35);
    gl_FragColor = vec4(col, a);
  }
`;
const HALO_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const HALO_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uLight;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float g = exp(-r * r * 3.0);
    float pulse = 0.9 + 0.1 * sin(uTime * 1.2);
    gl_FragColor = vec4(uColor * g * (0.5 + uLight * 0.55), g * 0.4 * pulse);
  }
`;

// A faint gravitational FIELD shell around the source -- the well that holds the cosmos together.
const FIELD_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uLight;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float shell = exp(-pow((r - 0.6) * 4.5, 2.0)); // soft ring -> the field boundary
    float inner = exp(-r * r * 1.4) * 0.3;          // gentle inward glow
    float pulse = 0.92 + 0.08 * sin(uTime * 0.8);
    float g = (shell * 0.55 + inner) * pulse;
    gl_FragColor = vec4(uColor * g * (0.4 + uLight * 0.4), g * 0.5);
  }
`;

// A radiant CORONA for a sun source: a soft disc that flares into turning rays.
// Brightness scales with uLight (the source's growing influence).
const CORONA_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uLight;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float ang = atan(p.y, p.x);
    float rays = 0.5 + 0.5 * sin(ang * 12.0 + uTime * 0.6);
    rays = pow(rays, 3.0);
    float ring = exp(-pow((r - 0.34) * 3.0, 2.0));
    float disc = exp(-r * r * 2.4);
    float pulse = 0.9 + 0.1 * sin(uTime * 1.3);
    float g = (disc * 0.6 + ring * rays * 0.95) * (0.55 + uLight * 0.5) * pulse;
    if (g < 0.01) discard;
    gl_FragColor = vec4(uColor * g, g * 0.55);
  }
`;

// The "beam" central source is a luminous VORTEX / bipolar jet of stars: a laser-thin bright
// waist at the centre that flares into two spiralling plumes up & down -- the axis mundi /
// polar jets of the nucleus. Astrophysics + myth, not a flat stick.
const BEAMSTAR_VERT = `
  uniform float uTime;
  uniform float uLight;
  attribute float aSize;
  attribute float aPhase;
  varying float vTw;
  varying float vGlow;
  void main(){
    vTw = 0.85 + 0.15 * sin(uTime * 1.4 + aPhase * 6.2831853);
    vGlow = 1.0 + 2.4 * exp(-position.y * position.y * 0.8); // laser-bright at the centre where energy is born
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * (0.55 + uLight * 0.45) * (170.0 / -mv.z), 1.4);
    gl_Position = projectionMatrix * mv;
  }
`;
const BEAMSTAR_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uLight;
  varying float vTw;
  varying float vGlow;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float core = exp(-d * d * 64.0);        // tight, crisp star
    float glow = exp(-d * d * 16.0) * 0.26; // faint halo
    float a = core + glow;
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor * (0.7 + uLight * 0.6) * vGlow, a * vTw * min(vGlow, 1.8));
  }
`;

function buildBeamStars(seed: number, count: number) {
  const rnd = mulberry32(seed ^ 0x51ed2701);
  const pos = new Float32Array(count * 3);
  const sz = new Float32Array(count);
  const ph = new Float32Array(count);
  const H = 3.4;        // half-height of the luminous axis (pierces the cosmos)
  const R_CORE = 0.05;  // laser-thin bright waist at the centre
  const R_TIP = 0.62;   // flares into faint plumes at the tips (like a galactic jet)
  const STRANDS = 3;    // spiralling filaments -> a vortex, not a flat stick
  const TWIST = 5.4;    // radians of swirl from waist to tip
  for (let i = 0; i < count; i++) {
    const r1 = rnd() * 2 - 1;
    const yn = Math.sign(r1) * Math.pow(Math.abs(r1), 1.5);     // dense at the waist, still reaching the tips
    const ay = Math.abs(yn);
    const flare = R_CORE + (R_TIP - R_CORE) * Math.pow(ay, 1.3); // narrow waist -> wide plume
    const r = flare * Math.sqrt(rnd());                          // fill the cone cross-section
    const strand = Math.floor(rnd() * STRANDS);
    const th = (strand / STRANDS) * Math.PI * 2 + yn * TWIST + (rnd() - 0.5) * 0.9; // helical strands
    pos[i * 3 + 0] = Math.cos(th) * r;
    pos[i * 3 + 1] = yn * H;
    pos[i * 3 + 2] = Math.sin(th) * r;
    sz[i] = 0.45 + rnd() * 1.5;
    ph[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  return g;
}

function BeamStars({
  seed,
  light,
  colorHex,
  tilt,
}: {
  seed: number;
  light: number;
  colorHex: string;
  tilt: number;
}) {
  const grp = useRef<THREE.Group>(null!);
  const count = Math.round(640 + Math.min(1, light / LIGHT_MAX) * 1120);
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const geom = useMemo(() => buildBeamStars(seed, count), [seed, count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uLight: { value: light }, uColor: { value: new THREE.Color(colorHex) } }),
    []
  );
  useFrame((s, dt) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uLight.value += (light - uniforms.uLight.value) * 0.05;
    uniforms.uColor.value.copy(color);
    // The beam IS the centre / spin axis: it shares the galaxy's fixed tilt + gentle self-spin.
    if (grp.current) {
      grp.current.rotation.x = tilt;
      grp.current.rotation.y += dt * 0.025;
    }
  });
  return (
    <group ref={grp}>
      <points geometry={geom}>
        <shaderMaterial
          vertexShader={BEAMSTAR_VERT}
          fragmentShader={BEAMSTAR_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

const DUST_VERT = `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  varying float vTw;
  void main(){
    vTw = 0.5 + 0.5 * sin(uTime * 0.6 + aPhase * 6.2831853);
    vec3 p = position;
    p.y += sin(uTime * 0.3 + aPhase * 6.2831853) * 0.18;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = max(aSize * (300.0 / -mv.z), 2.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const DUST_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  varying float vTw;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d); // round mote, fully fades to the sprite edge (no square corners)
    a = a * a;
    if (a < 0.02) discard;
    gl_FragColor = vec4(uColor, a * vTw * 0.3);
  }
`;

// Slow-drifting motes of light -> a little "magic" floating through the cosmos.
function MagicDust({ colorHex }: { colorHex: string }) {
  const grp = useRef<THREE.Group>(null!);
  const count = 80;
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const rr = 1.2 + Math.random() * 3.0;
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3 + 0] = rr * s * Math.cos(th);
      pos[i * 3 + 1] = rr * u * 0.7;
      pos[i * 3 + 2] = rr * s * Math.sin(th);
      sz[i] = 1.5 + Math.random() * 2.5;
      ph[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    return g;
  }, []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(colorHex) } }),
    []
  );
  useFrame((s, dt) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uColor.value.copy(color);
    if (grp.current) grp.current.rotation.y += dt * 0.04;
  });
  return (
    <group ref={grp}>
      <points geometry={geom}>
        <shaderMaterial
          vertexShader={DUST_VERT}
          fragmentShader={DUST_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function CoreSource({
  light,
  colorHex,
  kind,
  seed,
  tilt,
}: {
  light: number;
  colorHex: string;
  kind: SourceKind;
  seed: number;
  tilt: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const field = useRef<THREE.Mesh>(null!);
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const orbU = useMemo(
    () => ({ uColor: { value: new THREE.Color(colorHex) }, uTime: { value: 0 }, uLight: { value: light }, uHeart: { value: 0 } }),
    []
  );
  const haloU = useMemo(
    () => ({ uColor: { value: new THREE.Color(colorHex) }, uTime: { value: 0 }, uLight: { value: light } }),
    []
  );
  const fieldU = useMemo(
    () => ({ uColor: { value: new THREE.Color(colorHex) }, uTime: { value: 0 }, uLight: { value: light } }),
    []
  );
  const { camera } = useThree();
  const { tier, player } = usePlayer();
  // Heart strength is born from the HIGH dimensions (M6-M9): the more the player has pumped
  // those high Meras, the stronger the central sun beats with light. T5 forces it fully on.
  const heartBase = useMemo(() => {
    const vc = visibleSpheresForTier(tier);
    let hi = tier >= 5 ? 1 : 0;
    for (const l of player.lokas ?? []) {
      if (meraIndexForLoka(l.index, vc) >= 5) hi = Math.max(hi, lokaFill(l));
    }
    return hi;
  }, [player.lokas, tier]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    orbU.uTime.value = t;
    haloU.uTime.value = t;
    fieldU.uTime.value = t;
    orbU.uLight.value += (light - orbU.uLight.value) * 0.05;
    // The heart-sun breathes with light as the high Meras rise: a soft, slow swelling glow that
    // births the impulse rolling outward through every Mera shell. Gentle, never harsh.
    const heart = heartBase * (0.5 + 0.5 * Math.sin(t * 0.4));
    orbU.uHeart.value = heart;
    haloU.uLight.value = orbU.uLight.value + heart * 0.5;
    fieldU.uLight.value = orbU.uLight.value + heart * 0.5;
    orbU.uColor.value.copy(color);
    haloU.uColor.value.copy(color);
    fieldU.uColor.value.copy(color);
    const pulse = 1 + Math.sin(t * 0.8) * 0.02 + heart * 0.12;
    if (group.current) group.current.scale.setScalar(pulse * (0.55 + light * 0.5));
    if (halo.current) halo.current.quaternion.copy(camera.quaternion); // billboard
    if (field.current) field.current.quaternion.copy(camera.quaternion); // billboard
  });
  return (
    <>
      {/* The visible energy source -- ALWAYS present (the "sun"); the bright knot where energy is born. */}
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[0.5, 4]} />
          <shaderMaterial
            vertexShader={CORE_VERT}
            fragmentShader={CORE_FRAG}
            uniforms={orbU}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      {/* For beam universes: a dense, laser-thin column of stars piercing the centre. */}
      {kind === "beam" && <BeamStars seed={seed} light={light} colorHex={colorHex} tilt={tilt} />}
      {/* Gravitational field shell that holds the cosmos around the source. */}
      <mesh ref={field}>
        <planeGeometry args={[6.2, 6.2]} />
        <shaderMaterial
          vertexShader={HALO_VERT}
          fragmentShader={FIELD_FRAG}
          uniforms={fieldU}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Bright inner halo of the source. */}
      <mesh ref={halo}>
        <planeGeometry args={[3.4, 3.4]} />
        <shaderMaterial
          vertexShader={HALO_VERT}
          fragmentShader={HALO_FRAG}
          uniforms={haloU}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/* ============================ The nine nested spheres of the universe (canon) ============================ */
// As the player rises in dimension (tier) the universe condenses into 9 nested spheres of light:
// red on the OUTSIDE -> gold at the CENTRE (rainbow 1-7 + white-silver 8 + gold 9). Triads are
// revealed AND the existing shells CONDENSE inward as each new triad is born:
//   T0-T1: no shells -- T2: spheres 1-3 -- T3: 1-6 -- T4: 1-9 -- T5 (later): all merge into one light.
// Step 1 = nested rim-lit shells + tier gating + condensation animation. Centre blue world and the
// single-sphere merge (T5) arrive in later steps.
const NINE_SPHERE_COLORS = [
  "#d8333a", // 1 red    (outermost)
  "#e8843a", // 2 orange
  "#e8c33a", // 3 yellow
  "#3ad87a", // 4 green
  "#3ab4d8", // 5 blue
  "#6a78d8", // 6 indigo
  "#b58cff", // 7 violet
  "#f0eede", // 8 white-silver
  "#c9a84c", // 9 gold   (centre)
];
const SHELL_R_OUT = 3.25; // outermost shell radius (wraps the whole galaxy disk ~2.2)
const SHELL_R_IN = 1.05;  // innermost shell radius (near the centre / future blue world)

function visibleSpheresForTier(tier: number): number {
  if (tier <= 1) return 0;
  if (tier === 2) return 3;
  if (tier === 3) return 6;
  return 9; // T4 (and T5 until the merge step lands)
}

const SHELL_VERT = `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vPos;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;
const SHELL_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uLight;
  uniform float uTime;
  uniform float uFill;
  uniform float uHeart;
  uniform float uFrac;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vPos;
  const float PI = 3.14159265;
  float gridLine(float coord){
    float f = fract(coord);
    float dist = min(f, 1.0 - f);
    return 1.0 - smoothstep(0.0, 0.03, dist);
  }
  float hash(vec3 q){ return fract(sin(dot(q, vec3(17.1, 113.5, 1.7))) * 43758.5453); }
  float vnoise(vec3 q){
    vec3 i = floor(q);
    vec3 f = fract(q);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
  }
  void main(){
    vec3 p = normalize(vPos);
    float d = max(dot(normalize(vN), normalize(vV)), 0.0);
    // Thin bright silhouette limb -> the crisp EDGE of a transparent sphere.
    float rim = pow(1.0 - d, 3.0);
    // Soft atmospheric Fresnel halo around the limb.
    float halo = pow(1.0 - d, 1.3) * 0.22;
    // Slowly drifting lat/long grid so each shell reads as a living 3D globe.
    float lat = asin(clamp(p.y, -1.0, 1.0));
    float lon = atan(p.z, p.x) + uTime * 0.06;
    float lines = max(gridLine(lat / (PI / 8.0)), gridLine(lon / (PI / 8.0)));
    lines *= 0.26 * d;
    // Subtle surface shimmer / iridescence drifting over time.
    float shimmer = 0.82 + 0.18 * vnoise(p * 5.0 + vec3(0.0, 0.0, uTime * 0.15));
    // Base idle breathing PLUS a gentle loka-driven heartbeat: the more this Mera is
    // pumped (uFill), the more the whole shell breathes -- soft and slow, never harsh.
    float pulse = 0.92 + 0.06 * sin(uTime * 0.25) + uFill * 0.20 * (0.65 + 0.35 * sin(uTime * 0.55));
    // A slow light impulse is born at the heart-sun and rolls OUTWARD through every Mera.
    // dCenter is 0 at the innermost Mera and grows toward the periphery; a soft bright band sweeps it.
    float dCenter = 1.0 - uFrac;
    float front = fract(uTime * 0.055);
    float wave = exp(-pow((front - dCenter) * 9.0, 2.0));
    pulse += uHeart * wave * 0.34;
    // The heart wave does not just brush the silhouette limb: it gently floods the NEAR FACE of the
    // shell, so the impulse reads as light breathing across the globe, not a thin contour.
    float face = pow(max(d, 0.0), 1.4);
    float waveFace = uHeart * wave * face;
    float a = (rim + halo + lines) * uOpacity * (0.55 + uLight * 0.5) * pulse * shimmer;
    a += waveFace * uOpacity * (0.5 + uLight * 0.4) * 0.28;
    if (a < 0.003) discard;
    // Iridescent edge + a soft wash where the heart wave floods the near face.
    vec3 col = mix(uColor, vec3(1.0), rim * 0.35 + waveFace * 0.2);
    gl_FragColor = vec4(col * (0.85 + uLight * 0.4) + uColor * waveFace * 0.2, a);
  }
`;

// Per-sphere labels (canon): Меры dominate, chakra second. Мера 1 = periphery (red) -> Мера 9 = centre
// (gold) = source of the initial Light. Names align with data/dimensions_9.json.
const NINE_SPHERE_LABELS = [
  { n: 1, ch: "Муладхара" },
  { n: 2, ch: "Свадхистхана" },
  { n: 3, ch: "Манипура" },
  { n: 4, ch: "Анахата" },
  { n: 5, ch: "Вишуддха" },
  { n: 6, ch: "Аджна" },
  { n: 7, ch: "Сахасрара" },
  { n: 8, ch: "Монада" },
  { n: 9, ch: "Абсолют" },
];

function NineSphereShell({ index, visibleCount, light, active, fill = 0, heart = 0 }: { index: number; visibleCount: number; light: number; active?: boolean; fill?: number; heart?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = useMemo(() => new THREE.Color(NINE_SPHERE_COLORS[index]), [index]);
  // Opacity + colour are render-driven (so a shell is NEVER invisible), while the radius is eased
  // toward its target every frame -> when a new triad unlocks (tier up) the shells smoothly
  // re-space / condense. The galaxy runs frameloop="always" at T>=1, so useFrame ticks continuously
  // here, also driving the shimmer / grid drift / pulse.
  const visible = index < visibleCount;
  const span = Math.max(1, visibleCount - 1);
  const frac = visibleCount > 1 ? index / span : 0;
  const targetRadius = SHELL_R_OUT + (SHELL_R_IN - SHELL_R_OUT) * frac; // red outside -> gold centre
  const baseOpacity = (0.28 + frac * 0.20) * (active ? 1.9 : 1) * (1 + fill * 0.85); // selected/hovered + loka influence (fill) glow brighter
  const uniforms = useMemo(
    () => ({ uColor: { value: color.clone() }, uOpacity: { value: baseOpacity }, uLight: { value: light }, uTime: { value: 0 }, uFill: { value: fill }, uHeart: { value: heart }, uFrac: { value: frac } }),
    []
  );
  uniforms.uOpacity.value = baseOpacity;
  uniforms.uLight.value = light + fill * 0.6;
  uniforms.uFill.value = fill;
  uniforms.uHeart.value = heart;
  uniforms.uFrac.value = frac;
  uniforms.uColor.value.copy(color);
  const radiusRef = useRef(targetRadius);
  useFrame((s, dt) => {
    radiusRef.current += (targetRadius - radiusRef.current) * Math.min(1, dt * 4.0);
    if (meshRef.current) meshRef.current.scale.setScalar(radiusRef.current);
    uniforms.uTime.value = s.clock.elapsedTime;
  });
  if (!visible) return null;
  return (
    <mesh ref={meshRef} scale={radiusRef.current}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial
        vertexShader={SHELL_VERT}
        fragmentShader={SHELL_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        side={THREE.FrontSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const CORE_ORB_VERT = `
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const CORE_ORB_FRAG = `
  precision highp float;
  uniform float uLight;
  uniform float uTime;
  uniform float uHeart;
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    float d = max(dot(normalize(vN), normalize(vV)), 0.0);
    float core = pow(d, 2.4);                 // tight bright centre -> a compact glowing orb
    float rim = pow(1.0 - d, 2.0);            // soft golden halo at the edge
    float pulse = 0.9 + 0.06 * sin(uTime * 0.7);
    float heart = 1.0 + uHeart * 0.6;         // the gold heart swells with the high Meras
    vec3 gold = vec3(0.93, 0.78, 0.36);
    float a = (core * 0.32 + rim * 0.5) * (0.55 + uLight * 0.45) * pulse * (0.8 + uHeart * 0.45);
    if (a < 0.004) discard;
    vec3 col = mix(gold, vec3(1.0, 0.96, 0.82), core * 0.5) * heart;
    gl_FragColor = vec4(col, a);
  }
`;

// Each expanding circle is WOVEN FROM LIGHT: many fine luminous filaments (threads) run around
// the band so the halo looks spun/woven from rays of the central star, not a solid painted hoop.
// The spectrum still runs red(inner)->violet(outer) across the woven thread bundle.
const WEAVE_VERT = `
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAng;
  varying float vRad;
  void main(){
    vColor = color;
    vAng = atan(position.y, position.x);
    float r = length(position.xy);
    vRad = (r - 0.96) / (1.0 - 0.96);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const WEAVE_FRAG = `
  precision highp float;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAng;
  varying float vRad;
  const float PI = 3.14159265;
  void main(){
    // Two layered sets of fine threads -> a spun, woven texture of light.
    float t1 = 0.5 + 0.5 * sin(vAng * 168.0 + uTime * 0.5);
    t1 = pow(max(t1, 0.0), 3.0);
    float t2 = 0.5 + 0.5 * sin(vAng * 74.0 - uTime * 0.35);
    t2 = pow(max(t2, 0.0), 2.0);
    float weave = t1 * 0.7 + t2 * 0.45 + 0.10;    // faint base keeps the hoop continuous
    float edge = sin(clamp(vRad, 0.0, 1.0) * PI); // feather the band edges -> no hard rim
    float a = uOpacity * weave * edge;
    if (a < 0.002) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

// A slow gold ring that breathes OUTWARD from the heart as the high Meras are pumped --
// the same expanding-pulse language the power sources use, so the very centre clearly lives.
// It is geometry on a radius (not raw brightness), so Bloom / ACES can't wash it out the way
// it flattens the white-hot core. Driven by heartAmt; fully invisible when the heart is quiet.
function HeartRings({ heart = 0 }: { heart?: number }) {
  const RINGS = 3;
  const refs = useRef<THREE.Mesh[]>([]);
  const { camera } = useThree();
  // EACH ring is a full rainbow HALO: the spectrum runs RADIALLY across the band's WIDTH --
  // red on the inner edge -> violet on the outer edge -- so every expanding circle carries all
  // seven colours at once (like a halo), not one solid colour per ring.
  const geom = useMemo(() => {
    const inner = 0.96;
    const outer = 1.0;
    const g = new THREE.RingGeometry(inner, outer, 160, 14);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      const t = (r - inner) / (outer - inner);    // 0 at the inner edge -> 1 at the outer edge
      c.setHSL(t * 0.78, 1.0, 0.5);               // red (inner) -> violet (outer): a radial rainbow
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  // One woven-light material per ring (its own uOpacity / uTime).
  const mats = useMemo(
    () =>
      Array.from({ length: RINGS }).map(
        () =>
          new THREE.ShaderMaterial({
            vertexShader: WEAVE_VERT,
            fragmentShader: WEAVE_FRAG,
            uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 } },
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          })
      ),
    []
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < RINGS; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const rp = ((t * 0.07) + i / RINGS) % 1;        // very slow outward drift
      m.scale.setScalar(0.75 + rp * 2.7);              // start clear of the white-hot core
      m.quaternion.copy(camera.quaternion);           // face the viewer so it always reads
      const mat = mats[i];
      mat.uniforms.uTime.value = t;
      // Brightest at mid-flight (over dark space) so the spectrum reads; fades to nothing at both ends.
      mat.uniforms.uOpacity.value = heart * Math.sin(rp * Math.PI) * 0.5;
    }
  });
  return (
    <group>
      {Array.from({ length: RINGS }).map((_, i) => (
        <mesh
          key={i}
          geometry={geom}
          material={mats[i]}
          ref={(el) => {
            if (el) refs.current[i] = el as THREE.Mesh;
          }}
        />
      ))}
    </group>
  );
}

// The gold 9th sphere, rendered as a luminous core orb at the heart of the cosmos (T4+).
function GoldCoreOrb({ light, heart = 0 }: { light: number; heart?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uLight: { value: light }, uTime: { value: 0 }, uHeart: { value: 0 } }), []);
  uniforms.uLight.value = light;
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    uniforms.uTime.value = t;
    // The gold core breathes with the high Meras: a slow, soft swell of light + size.
    const beat = heart * (0.5 + 0.5 * Math.sin(t * 0.4));
    uniforms.uHeart.value = beat;
    if (meshRef.current) meshRef.current.scale.setScalar(0.55 * (1 + beat * 0.12));
  });
  return (
    <mesh ref={meshRef} scale={0.55}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial
        vertexShader={CORE_ORB_VERT}
        fragmentShader={CORE_ORB_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Mera fill stars: as a loka's influence grows, its Mera shell fills with motes of light --
// more stars + brighter glow the closer that loka climbs toward its 9th level (lokaFill 0..1).
const MERA_STAR_VERT = `
  uniform float uTime;
  uniform float uFill;
  attribute float aSize;
  attribute float aPhase;
  varying float vTw;
  void main(){
    vTw = 0.7 + 0.3 * sin(uTime * 0.9 + aPhase * 6.2831853);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * (0.5 + uFill * 0.8) * (120.0 / -mv.z), 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const MERA_STAR_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uFill;
  uniform float uTime;
  varying float vTw;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float core = exp(-d * d * 64.0);
    float glow = exp(-d * d * 16.0) * 0.3;
    float pulse = 1.0 + (0.3 * uFill + 0.7 * uFill * uFill) * sin(uTime * 2.4); // visible at mid fill, strong as the loka nears its 9th level
    float a = (core + glow) * vTw * pulse;
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor * (0.7 + uFill * 0.7), a * 0.92);
  }
`;
const MERA_FILL_MAX_STARS = 64;
// Map a loka (0 = Satya highest -> 13 = Patala lowest) to a revealed Mera shell index, same
// height rule as creations: higher worlds sit on inner shells, lower worlds on the periphery.
function meraIndexForLoka(lokaIndex: number, visibleCount: number): number {
  if (visibleCount <= 1) return 0;
  const li = Math.max(0, Math.min(13, lokaIndex | 0));
  return Math.round((1 - li / 13) * (visibleCount - 1));
}
function buildMeraFillGeom(seed: number, radius: number, count: number): THREE.BufferGeometry {
  const rnd = mulberry32(((seed * 2654435761) >>> 0) ^ 0x68bc21eb);
  const N = Math.max(1, Math.round(count));
  const pos = new Float32Array(N * 3);
  const sz = new Float32Array(N);
  const ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = radius * (0.98 + rnd() * 0.04); // sit just on the shell surface
    pos[i * 3 + 0] = r * s * Math.cos(th);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(th);
    sz[i] = 0.9 + rnd() * 1.4;
    ph[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  return g;
}
// Motes of light spread over a Mera shell; their count + brightness scale with the loka fill.
function MeraFillStars({ radius, color, fill, seed }: { radius: number; color: string; fill: number; seed: number }) {
  const grp = useRef<THREE.Group>(null!);
  const f = clamp01(fill);
  const count = Math.max(1, Math.round(f * MERA_FILL_MAX_STARS));
  const col = useMemo(() => new THREE.Color(color), [color]);
  const geom = useMemo(() => buildMeraFillGeom(seed, radius, count), [seed, radius, count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFill: { value: f }, uColor: { value: new THREE.Color(color) } }), []);
  useFrame((s, dt) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uFill.value += (f - uniforms.uFill.value) * 0.05;
    uniforms.uColor.value.copy(col);
    if (grp.current) grp.current.rotation.y += dt * 0.06; // gentle shimmer drift over the shell
  });
  return (
    <group ref={grp}>
      <points geometry={geom}>
        <shaderMaterial
          vertexShader={MERA_STAR_VERT}
          fragmentShader={MERA_STAR_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// --- Loka cultivation panel data (Step 3) ---
// Channels that feed a loka's influence (keys match LokaNourish in core/types).
const LOKA_CONTOURS: Array<{ key: keyof LokaNourish; label: string }> = [
  { key: "tigel", label: "\u0422\u0438\u0433\u0435\u043b\u044c" },
  { key: "temple", label: "\u0425\u0440\u0430\u043c" },
  { key: "source", label: "\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a" },
  { key: "daimon", label: "\u0414\u0430\u0439\u043c\u043e\u043d" },
  { key: "matrix", label: "\u041c\u0430\u0442\u0440\u0438\u0446\u0430" },
];
// Inverse of meraIndexForLoka: the representative loka anchored to a revealed Mera shell.
function repLokaForMera(meraIndex: number, visibleCount: number): number {
  if (visibleCount <= 1) return 0;
  const li = Math.round(13 * (1 - meraIndex / (visibleCount - 1)));
  return Math.max(0, Math.min(13, li));
}
const LOKA_TASKS = [
  "\u041f\u0440\u043e\u0432\u0435\u0434\u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0443 \u0422\u0438\u0433\u0435\u043b\u044f \u0438 \u043d\u0430\u043f\u0440\u0430\u0432\u044c \u0435\u0451 \u0441\u0432\u0435\u0442 \u0432 \u044d\u0442\u0443 \u043b\u043e\u043a\u0443.",
  "\u041e\u0447\u0438\u0441\u0442\u0438 \u043e\u0434\u043d\u0443 \u0442\u0435\u043d\u044c \u0434\u043d\u044f \u2014 \u0432\u043b\u0435\u0439 \u043e\u0447\u0438\u0449\u0435\u043d\u043d\u044b\u0439 \u0441\u0432\u0435\u0442 \u0441\u044e\u0434\u0430.",
  "\u0421\u043e\u0432\u0435\u0440\u0448\u0438 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u044b\u0439 \u0434\u043e\u0431\u0440\u044b\u0439 \u043f\u043e\u0441\u0442\u0443\u043f\u043e\u043a \u0432\u043e \u0438\u043c\u044f \u044d\u0442\u043e\u0439 \u043b\u043e\u043a\u0438.",
  "\u0423\u0434\u0435\u0440\u0436\u0438 \u043c\u0430\u043d\u0442\u0440\u0443 \u0438 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435 \u043d\u0430 \u044d\u0442\u043e\u0439 \u043c\u0435\u0440\u0435.",
  "\u0421\u043e\u0435\u0434\u0438\u043d\u0438 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435 \u0441 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043c \u2014 \u043f\u043e\u0441\u043b\u0443\u0436\u0438 \u044d\u0442\u043e\u0439 \u043b\u043e\u043a\u0435.",
  "\u0412\u0434\u043e\u0445\u043d\u0438, \u043f\u0440\u043e\u0441\u0442\u0438, \u043e\u0442\u043f\u0443\u0441\u0442\u0438 \u2014 \u043f\u0440\u0435\u043e\u0431\u0440\u0430\u0437\u0438 \u0438\u043c\u043f\u0443\u043b\u044c\u0441 \u0432 \u0441\u0432\u0435\u0442.",
];
function lokaTaskFor(lokaIndex: number, level: number): string {
  const n = LOKA_TASKS.length;
  const i = (((lokaIndex + level) % n) + n) % n;
  return LOKA_TASKS[i];
}

/* ============================ Iskra: spark of awareness rising through the cosmos ============================ */
// A bright spark born at the bottom of the cosmos and rising up through it along the WORLD vertical --
// the player's growing awareness physically ascending. It grows BIGGER, BRIGHTER and FASTER with the
// light of awareness (light-coins / svetmoneta) and the progress toward the next coin. Pure additive
// glow + a downward wake; billboarded to the camera; world-space so it pierces the cosmos straight up
// regardless of the universe's tilt / spin.
const SPARK_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SPARK_FRAG = `
  precision highp float;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - 0.5;
    // Bright round head.
    float core = exp(-dot(p, p) * 46.0);
    // A luminous tail trailing DOWNWARD (the spark rises, so its wake is below it).
    float below = max(0.0, -p.y * 2.0);          // 0 at the head -> 1 at the bottom edge
    float tail = exp(-p.x * p.x * 240.0) * exp(-below * 3.4);
    // Soft outer halo + a gentle flicker so it reads as living fire.
    float halo = exp(-dot(p, p) * 9.0) * 0.18;
    float flick = 0.85 + 0.15 * sin(uTime * 9.0);
    float a = (core + tail * 0.65 + halo) * uOpacity * flick;
    if (a < 0.004) discard;
    vec3 col = mix(uColor, vec3(1.0), core * 0.7);  // white-hot core -> golden body
    gl_FragColor = vec4(col, a);
  }
`;

function SparkRise() {
  const { coins, progress, tier } = usePlayer();
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  // Awareness 0..1: filled by the light-coins toward the T5 threshold (189), nudged by progress to next coin.
  const sparkAmt = Math.min(1, (coins || 0) / 189 + (progress || 0) * 0.12);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#ffd27a") } }),
    []
  );
  const phase = useRef(Math.random());
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    uniforms.uTime.value = t;
    // The brighter the awareness, the FASTER + LARGER the spark climbs; a faint ember even at zero.
    const dur = 6.5 - sparkAmt * 3.2;            // seconds for one ascent (faster as awareness grows)
    phase.current += dt / dur;
    if (phase.current > 1) phase.current -= 1;
    const ph = phase.current;
    const y = -3.6 + ph * 7.2;                   // rise from below the cosmos up past the top
    const env = Math.sin(ph * Math.PI);          // fade in at the bottom, out at the top
    const drift = Math.sin(t * 1.3 + ph * 6.2831) * 0.12;
    if (group.current) group.current.position.set(drift, y, 0);
    if (mesh.current) {
      mesh.current.quaternion.copy(camera.quaternion); // billboard toward the viewer
      const sc = 0.45 + sparkAmt * 1.15;
      mesh.current.scale.set(sc, sc * 1.7, sc);        // taller -> room for the wake
    }
    uniforms.uOpacity.value = env * (0.35 + sparkAmt * 0.75) * (tier >= 1 ? 1 : 0.55);
  });
  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={SPARK_VERT}
          fragmentShader={SPARK_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// All nine shells, gated + condensed by tier. The gold 9th sphere is drawn as a glowing core orb.
// The galaxy already runs frameloop="always" at T>=1 (spheres appear from T2), so shimmer / grid
// drift / condensation animate continuously without any extra frame pump.
function NineSpheres({ tier, light, zoomRef, focusRef }: { tier: number; light: number; zoomRef: React.MutableRefObject<number>; focusRef: React.MutableRefObject<{ target: THREE.Vector3; active: boolean; owner?: "src" | "mera" | null }> }) {
  const { player, nourishLoka, fixLoka, unfixLoka } = usePlayer();
  const visibleCount = visibleSpheresForTier(tier); // canon: T0-T1 none, T2 -> 3, T3 -> 6, T4-T5 -> 9
  const [hover, setHover] = useState<number | null>(null);   // hovered Мера (label preview)
  const [pinned, setPinned] = useState<number | null>(null); // magnetized Мера (camera locked onto it)
  const span = Math.max(1, visibleCount - 1);
  // Loka influence -> per-Mera fill (0..1): how full each Mera shell has grown from its lokas.
  const fills = useMemo(() => {
    const arr = new Array(9).fill(0);
    for (const l of player.lokas ?? []) {
      const mi = meraIndexForLoka(l.index, visibleCount);
      const fv = lokaFill(l);
      if (fv > arr[mi]) arr[mi] = fv;
    }
    // Light spills to neighbouring Meras: each shell also takes a fraction of its
    // neighbours' fill, so light bleeds up/down the ladder of Meras.
    const SPILL = 0.35;
    const out = arr.slice();
    for (let i = 0; i < 9; i++) {
      const nb = Math.max(i + 1 < 9 ? arr[i + 1] : 0, i - 1 >= 0 ? arr[i - 1] : 0) * SPILL;
      if (nb > out[i]) out[i] = nb;
    }
    return out;
  }, [player.lokas, visibleCount]);
  // Heart impulse strength: born from the HIGH Meras (M6-M9 = inner shells 5..8). The more the
  // player pumps those high dimensions, the stronger a slow light wave rolls out through ALL Meras
  // (mirrored by the central sun). T5 forces it fully on.
  const heartAmt = Math.max(tier >= 5 ? 1 : 0, fills[5] || 0, fills[6] || 0, fills[7] || 0, fills[8] || 0);
  const radiusFor = (i: number) => SHELL_R_OUT + (SHELL_R_IN - SHELL_R_OUT) * (visibleCount > 1 ? i / span : 0);
  // Dive INTO a Мера: ease the orbit radius BELOW that shell's radius so the camera passes
  // through its surface and ends up INSIDE it, with the sphere wrapping around you (and the inner
  // Меры still ahead toward the centre). Clicking it again (or another Мера) flies back out /
  // across; from the overview, zooming travels in/out through the nested spheres.
  const focusZoom = (i: number) => clampZoom(radiusFor(i) * 0.82);
  const magnetize = (i: number) => {
    const next = pinned === i ? null : i;
    setPinned(next);
    if (next === null) {
      focusRef.current.active = false;
      focusRef.current.owner = null;
      gsap.to(zoomRef, { current: ZOOM_BASE, duration: 0.9, ease: "power2.inOut", overwrite: true });
    } else {
      // Land ON the Mera: pivot the camera onto a point on THIS shell (not the universe centre),
      // then ease the orbit in close so you stand AT that Mera, looking along its surface.
      focusRef.current.target.set(0, radiusFor(i), 0);
      focusRef.current.active = true;
      focusRef.current.owner = "mera";
      gsap.to(zoomRef, { current: clampZoom(0.95), duration: 0.9, ease: "power2.inOut", overwrite: true });
    }
  };
  useEffect(() => () => {
    // Leaving the home view (or a tier drop) unmounts the Meras -> release Mera focus + reset zoom.
    if (focusRef.current.owner === "mera") {
      focusRef.current.active = false;
      focusRef.current.owner = null;
      zoomRef.current = ZOOM_BASE;
    }
  }, []);
  if (visibleCount === 0) return null;
  return (
    <group>
      {NINE_SPHERE_COLORS.map((_, i) =>
        i === 8 ? null : (
          <NineSphereShell key={i} index={i} visibleCount={visibleCount} light={light} active={hover === i || pinned === i} fill={fills[i]} heart={heartAmt} />
        )
      )}
      {NINE_SPHERE_COLORS.map((_, i) =>
        i >= visibleCount || fills[i] <= 0.001 ? null : (
          <MeraFillStars key={"fill" + i} radius={radiusFor(i)} color={NINE_SPHERE_COLORS[i]} fill={fills[i]} seed={i + 1} />
        )
      )}
      {visibleCount >= 9 && <GoldCoreOrb light={light} heart={heartAmt} />}
      <HeartRings heart={heartAmt} />
      {/* When a Мера is opened, a real translucent 3D orb appears at its position so the camera flies
          TO a tangible glowing object (its own spectral colour), not into empty space. */}
      {pinned !== null && pinned < visibleCount && (
        <group position={[0, radiusFor(pinned), 0]}>
          <mesh>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshBasicMaterial color={"#fff6e8"} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.27, 32, 32]} />
            <meshBasicMaterial color={NINE_SPHERE_COLORS[pinned]} transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshBasicMaterial color={NINE_SPHERE_COLORS[pinned]} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
          </mesh>
        </group>
      )}
      {NINE_SPHERE_COLORS.map((_, i) => {
        if (i >= visibleCount) return null;
        if (pinned !== null && pinned !== i) return null; // dive: hide the OTHER Meras so the view is clean
        const dived = pinned === i;
        const lab = NINE_SPHERE_LABELS[i];
        const col = NINE_SPHERE_COLORS[i];
        const on = hover === i || pinned === i;
        const wrapStyle = { pointerEvents: "auto" } as any;
        // Each Мера button is now a MINI COSMIC SPHERE in its own spectral colour (a small glowing
        // orb), stacked in the same vertical column. Hover / pin expands a name pill beside it.
        const sphereSize = on ? 24 : 18;
        const orbStyle = {
          width: sphereSize,
          height: sphereSize,
          borderRadius: "50%",
          flex: "0 0 auto",
          // Glassy, see-through orb: a translucent radial wash of its spectral colour with a
          // soft white highlight, so it reads like a little bubble of light rather than a solid dot.
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.3) 0%, " +
            col +
            "33 42%, " + col + "0a 100%)",
          border: "1px solid " + col + "4d",
          boxShadow:
            "0 0 6px " + col + "4d, 0 0 13px " + col + "1f, inset 0 0 8px rgba(255,255,255,0.15)",
          backdropFilter: "blur(1.5px)",
          WebkitBackdropFilter: "blur(1.5px)",
          transition: "all .18s ease",
        } as any;
        const rowStyle = {
          display: "flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
          transform: "translateY(-50%)",
          cursor: "pointer",
          userSelect: "none",
        } as any;
        const labelStyle = {
          padding: "2px 9px",
          borderRadius: 999,
          border: "1px solid " + col,
          background: "rgba(6,6,14,0.62)",
          color: "#ece8f7",
          font: "600 11px/1 ui-sans-serif, system-ui, sans-serif",
          backdropFilter: "blur(4px)",
        } as any;
        return (
          <Html
            key={"lab" + i}
            position={[0, radiusFor(i), 0]}
            center
            distanceFactor={dived ? undefined : 9}
            zIndexRange={[30, 0]}
            style={wrapStyle}
          >
            <div
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((a) => (a === i ? null : a))}
              onClick={() => magnetize(i)}
              style={rowStyle}
            >
              {!dived && <span style={orbStyle} />}
              {on && (
                <span style={labelStyle}>
                  {"Мера " + lab.n + " · " + lab.ch + (i === 8 ? " · источник света" : "")}
                </span>
              )}
            </div>
          </Html>
        );
      })}
      {pinned !== null && (() => {
        // Diving into a Mera opens the loka anchored to it: Tigel task + nourishment + fix.
        const pin = pinned as number;
        const li = repLokaForMera(pin, visibleCount);
        const ls = (player.lokas ?? []).find((l) => l.index === li);
        const lvl = ls?.level ?? 0;
        const fillv = ls ? lokaFill(ls) : 0;
        const fixedv = !!ls?.fixed;
        const lk = lokaAt(li);
        const lname = (lk && lk.name) || "Loka";
        const lcolor = (lk && lk.color) || "#c9a84c";
        const pol = lokaPolarity(li);
        const polLabel = pol === "dark" ? "\u0442\u0451\u043c\u043d\u0430\u044f" : pol === "earth" ? "\u0437\u0435\u043c\u043d\u0430\u044f" : "\u0441\u0432\u0435\u0442\u043b\u0430\u044f";
        const wrap = { pointerEvents: "none", display: "flex", alignItems: "flex-start", justifyContent: "flex-start", width: "100%", height: "100%", padding: "76px 0 0 16px" } as any;
        const panel = { pointerEvents: "auto", width: 320, maxWidth: "86vw", padding: "14px 16px", borderRadius: 16, border: "1px solid " + lcolor, background: "rgba(8,7,16,0.86)", color: "#ece8f7", font: "500 12px/1.45 ui-sans-serif, system-ui, sans-serif", backdropFilter: "blur(9px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", animation: "awaraLokaIn 0.5s cubic-bezier(0.22,1,0.36,1)" } as any;
        const head = { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } as any;
        const dot = { width: 12, height: 12, borderRadius: "50%", background: lcolor, boxShadow: "0 0 10px " + lcolor } as any;
        const title = { fontSize: 15, fontWeight: 700 } as any;
        const badge = { marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 999, border: "1px solid " + lcolor, color: lcolor } as any;
        const barWrap = { height: 7, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden", margin: "8px 0 4px" } as any;
        const barFill = { height: "100%", width: Math.round(fillv * 100) + "%", background: lcolor, borderRadius: 999, transition: "width 0.4s ease" } as any;
        const meta = { display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(220,214,240,0.7)" } as any;
        const taskBox = { margin: "10px 0", padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", borderLeft: "3px solid " + lcolor } as any;
        const taskKick = { fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: lcolor, marginBottom: 3 } as any;
        const btnRow = { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 } as any;
        const btn = { flex: "1 1 30%", cursor: "pointer", padding: "7px 6px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", color: "#ece8f7", font: "600 11px/1.1 ui-sans-serif, system-ui, sans-serif" } as any;
        const footRow = { display: "flex", gap: 8, marginTop: 10 } as any;
        const fixBtn = { flex: 1, cursor: "pointer", padding: "8px 6px", borderRadius: 9, border: "1px solid " + lcolor, background: fixedv ? lcolor : "transparent", color: fixedv ? "#0a0710" : lcolor, font: "700 11px/1.1 ui-sans-serif, system-ui, sans-serif" } as any;
        const closeBtn = { cursor: "pointer", padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#cfc8e0", font: "600 11px/1.1 ui-sans-serif, system-ui, sans-serif" } as any;
        const mapKick = { fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: lcolor, margin: "10px 0 3px" } as any;
        const mapBox = { fontSize: 10.5, lineHeight: 1.5, color: "rgba(220,214,240,0.82)" } as any;
        return (
          <Html fullscreen calculatePosition={(_el: any, _cam: any, size: any) => [size.width / 2, size.height / 2]} zIndexRange={[45, 0]} style={wrap}>
            <style>{"@keyframes awaraLokaIn{from{opacity:0;transform:translateY(-26px)}to{opacity:1;transform:translateY(0)}}"}</style>
            <div style={panel} onPointerDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
              <div style={head}>
                <span style={dot} />
                <span style={title}>{lname}</span>
                <span style={badge}>{polLabel}</span>
              </div>
              <div style={barWrap}><div style={barFill} /></div>
              <div style={meta}>
                <span>{"\u0423\u0440\u043e\u0432\u0435\u043d\u044c " + lvl + " / 9"}</span>
                <span>{"\u0432\u043b\u0438\u044f\u043d\u0438\u0435 " + Math.round(fillv * 100) + "%"}</span>
              </div>
              <div style={mapKick}>Где это в мерах</div>
              <div style={mapBox}>
                Светлые локи — в верхних Мерах (к центру, к золоту), тёмные — в нижних (к периферии). Рубеж — Бхур, земля.
                <br />Качаешь влияние → Мера копит звёзды и светится ярче; чем выше Мера, тем ярче. Свет переливается на соседние Меры, а на 8–9 уровне идёт пульсация.
              </div>
              <div style={taskBox}>
                <div style={taskKick}>{"\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u00b7 \u0422\u0438\u0433\u0435\u043b\u044c"}</div>
                <div>{lokaTaskFor(li, lvl)}</div>
              </div>
              {!fixedv && (
                <div style={btnRow}>
                  {LOKA_CONTOURS.map((c) => (
                    <button key={c.key} type="button" style={btn} onPointerDown={(e) => e.stopPropagation()} onClick={() => nourishLoka(li, c.key, 0.5)}>
                      {"+ " + c.label}
                    </button>
                  ))}
                </div>
              )}
              <div style={footRow}>
                <button type="button" style={fixBtn} onPointerDown={(e) => e.stopPropagation()} onClick={() => (fixedv ? unfixLoka(li) : fixLoka(li))}>
                  {fixedv ? "\u2713 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u0430" : "\u2726 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c"}
                </button>
                <button type="button" style={closeBtn} onPointerDown={(e) => e.stopPropagation()} onClick={() => magnetize(pin)}>
                  {"\u0437\u0430\u043a\u0440\u044b\u0442\u044c"}
                </button>
              </div>
            </div>
          </Html>
        );
      })()}
    </group>
  );
}

/* ============================ T5: creator power sources + subtle links ============================ */
// The player's own creations (node 1, T5): power sources born inside the living cosmos, and
// subtle threads reaching UP to the lokas, DOWN to the human, or ACROSS to other universes.
// They live INSIDE the spinning universe group (shared tilt + idle self-spin) so they feel like
// real bodies the creator placed in their own world -- glowing, pulsing, flowing, interactive.

const LINK_VERT = `
  uniform float uTime;
  uniform float uFocus;
  attribute float aT;
  attribute float aSize;
  varying float vGlow;
  void main(){
    float wave = 0.5 + 0.5 * sin(aT * 16.0 - uTime * 3.0); // a pulse of light travelling along the thread
    vGlow = 0.3 + 0.7 * pow(wave, 2.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * (0.42 + vGlow * 0.85) * (1.0 + uFocus * 0.5) * (82.0 / -mv.z), 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const LINK_FRAG = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uFocus;
  varying float vGlow;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float core = exp(-d * d * 120.0);  // tighter -> finer, more elegant thread
    float glow = exp(-d * d * 22.0) * 0.18;
    float a = (core + glow) * vGlow;
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor * (0.75 + vGlow * 0.8 + uFocus * 0.45), a * (0.78 + uFocus * 0.22));
  }
`;

const VLOKAS_T5 = ((vedicData as { lokas?: Array<{ color?: string; name?: string }> }).lokas) ?? [];
const AGENTS_T5 = (agentsData as Array<{ name?: string; element?: string }>) ?? [];

// Each force (agent) carries an ELEMENT; we tint its created source by that element so the colour
// reads as the FORCE it embodies. Lokas keep their own canonical colours (the WORLD it is anchored
// in), used for the halo + loka links.
const EL_FIRE = "\u041e\u0433\u043e\u043d\u044c";          // Ogon (Fire)
const EL_WATER = "\u0412\u043e\u0434\u0430";               // Voda (Water)
const EL_AIR = "\u0412\u043e\u0437\u0434\u0443\u0445";     // Vozdukh (Air)
const EL_EARTH = "\u0417\u0435\u043c\u043b\u044f";          // Zemlya (Earth)
const EL_ETHER = "\u042d\u0444\u0438\u0440";               // Efir (Ether)
function elementColor(el?: string): string {
  if (el === EL_FIRE) return "#ff8a4c";
  if (el === EL_WATER) return "#5ab0ff";
  if (el === EL_AIR) return "#7fe3d4";
  if (el === EL_EARTH) return "#a9c45a";
  if (el === EL_ETHER) return "#a884f0";
  return "#c9a84c";
}

// Spirits (\u0434\u0443\u0445\u0438) are tinted by their KIND, not by an agent's element.
const SPIRIT_KIND_HEX: Record<string, string> = {
  planetary: "#5ab0ff",
  household: "#9ec45a",
  unified: "#e6d8ff",
};
function spiritColorHex(kind?: string): string {
  return SPIRIT_KIND_HEX[kind ?? "planetary"] ?? "#e6d8ff";
}
const SPIRIT_KIND_NAME: Record<string, string> = {
  planetary: "\u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u044b\u0439 \u0434\u0443\u0445",
  household: "\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445",
  unified: "\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e",
};
// Cathedrals / cosmic unions are tinted by their pattern.
const CATHEDRAL_HEX: Record<string, string> = {
  mandala: "#e6d8ff",
  ring: "#7fe3d4",
  flower: "#ffb6e1",
  star: "#ffd27a",
};
function cathedralColor(pattern?: string): string {
  return CATHEDRAL_HEX[pattern ?? "mandala"] ?? "#e6d8ff";
}

function agentAt(i: number) {
  if (AGENTS_T5.length === 0) return undefined;
  return AGENTS_T5[Math.max(0, Math.min(AGENTS_T5.length - 1, i | 0))];
}
function lokaAt(i: number) {
  if (VLOKAS_T5.length === 0) return undefined;
  return VLOKAS_T5[Math.max(0, Math.min(VLOKAS_T5.length - 1, i | 0))];
}

// Small static labels (Cyrillic as \uXXXX per file rule; dynamic names come from JSON data).
const LBL = {
  source: "\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a",                                  // Istochnik (Source)
  link: "\u0422\u043e\u043d\u043a\u0430\u044f \u0441\u0432\u044f\u0437\u044c",                  // Tonkaya svyaz (Subtle link)
  human: "\u0427\u0435\u043b\u043e\u0432\u0435\u043a",                                          // Chelovek (Human)
  otherUniverse: "\u0414\u0440\u0443\u0433\u0430\u044f \u0432\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f", // Drugaya vselennaya
};

type HoverHandlers = { over: () => void; out: () => void; toggle: () => void };

function mergeStyle(b: React.CSSProperties, color: string): React.CSSProperties {
  return Object.assign({}, b, { color });
}

const T5_PILL: React.CSSProperties = {
  pointerEvents: "none",
  padding: "6px 11px",
  borderRadius: 11,
  background: "rgba(8,6,18,0.82)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  backdropFilter: "blur(7px)",
  WebkitBackdropFilter: "blur(7px)",
  whiteSpace: "nowrap",
  textAlign: "center",
  fontFamily: "Inter, system-ui, sans-serif",
};
const T5_TITLE: React.CSSProperties = { fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", color: "#f5efff" };
const T5_SUB: React.CSSProperties = { fontSize: 10.5, marginTop: 2, letterSpacing: "0.03em", color: "rgba(220,214,240,0.72)" };

function sourceLabel(src: PowerSource): { title: string; sub: string } {
  if (src.form === "spirit") {
    const w = src.worldIndex ?? 7;
    return {
      title: SPIRIT_KIND_NAME[src.spiritKind ?? "planetary"] ?? LBL.source,
      sub: "\u2737  \u00b7  " + w + "-\u044f \u043c\u0438\u0440\u0430",
    };
  }
  const ag = agentAt(src.agentIndex);
  const lk = lokaAt(src.lokaIndex);
  const icon = src.form === "constellation" ? "\u2726" : "\u2600";
  const parts = [icon, ag && ag.element, lk && lk.name].filter(Boolean) as string[];
  return { title: (ag && ag.name) || LBL.source, sub: parts.join("  \u00b7  ") };
}
function linkLabel(link: SubtleLink): { title: string; sub: string } {
  if (link.targetKind === "loka") {
    const lk = lokaAt(link.targetIndex);
    return { title: (lk && lk.name) || LBL.link, sub: LBL.link };
  }
  if (link.targetKind === "agent") {
    const ag = agentAt(link.targetIndex);
    const parts = [LBL.link, ag && ag.element].filter(Boolean) as string[];
    return { title: (ag && ag.name) || LBL.link, sub: parts.join("  \u00b7  ") };
  }
  if (link.targetKind === "human") return { title: LBL.human, sub: LBL.link };
  if (link.targetKind === "universe") return { title: LBL.otherUniverse, sub: LBL.link };
  return { title: LBL.link, sub: LBL.link };
}
function linkMidpoint(link: SubtleLink): [number, number, number] {
  const end = linkEnd(link);
  const cx = end[0] / 2 + end[2] * 0.2;
  const cy = end[1] / 2 + 0.55;
  const cz = end[2] / 2 - end[0] * 0.2;
  const t = 0.5, it = 0.5;
  return [
    2 * it * t * cx + t * t * end[0],
    2 * it * t * cy + t * t * end[1],
    2 * it * t * cz + t * t * end[2],
  ];
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sourceCoreHex(src: PowerSource): string {
  if (src.form === "spirit") return spiritColorHex(src.spiritKind);
  const ag = agentAt(src.agentIndex);
  return elementColor(ag && ag.element); // the FORCE colour (its element)
}
function sourceHaloHex(src: PowerSource): string {
  if (src.form === "spirit") return spiritColorHex(src.spiritKind);
  const lk = lokaAt(src.lokaIndex);
  return (lk && lk.color) || sourceCoreHex(src); // the WORLD colour (its loka)
}

function linkColorHex(link: SubtleLink): string {
  if (link.targetKind === "loka") {
    const lk = lokaAt(link.targetIndex);
    return (lk && lk.color) || "#c9a84c";
  }
  if (link.targetKind === "agent") {
    const ag = agentAt(link.targetIndex);
    return elementColor(ag && ag.element);
  }
  if (link.targetKind === "human") return "#ffd27a";
  if (link.targetKind === "universe") return "#6ad8c8";
  return "#c9a84c";
}

// Mera dynamics: map a creation to one of the currently-revealed Meras by the height of its loka
// lokaIndex 0 = Satya (highest world) -> innermost shell near the gold centre/light;
// lokaIndex 13 = Patala (lowest world) -> outermost shell at the periphery. Shells gated by tier.
function meraIndexForSource(src: PowerSource, visibleCount: number): number {
  if (visibleCount <= 1) return 0;
  // Spirits dwell on the high inner Meras of their world (M7 / M8 / M9).
  if (src.form === "spirit") {
    const w = Math.max(7, Math.min(9, src.worldIndex ?? 7));
    return Math.max(0, Math.min(visibleCount - 1, w - 1));
  }
  const li = Math.max(0, Math.min(13, src.lokaIndex | 0));
  return Math.round((1 - li / 13) * (visibleCount - 1));
}
function shellRadiusFor(i: number, visibleCount: number): number {
  const span = Math.max(1, visibleCount - 1);
  return SHELL_R_OUT + (SHELL_R_IN - SHELL_R_OUT) * (visibleCount > 1 ? i / span : 0);
}
// A creation SITS ON its Mera shell: seeded direction snapped to that shell's radius, spread over
// the sphere surface (not just the equator). When no shells are revealed yet (T<2) it free-floats.
function sourcePosOnShell(src: PowerSource, visibleCount: number): [number, number, number] {
  const p = src.pos;
  if (
    Array.isArray(p) && p.length === 3 &&
    p.every((n) => typeof n === "number" && isFinite(n)) &&
    (p[0] !== 0 || p[1] !== 0 || p[2] !== 0)
  ) {
    return [p[0], p[1], p[2]];
  }
  if (visibleCount <= 0) return sourcePos(src);
  const rnd = mulberry32((hashId(src.id) ^ 0x5bd1e995) >>> 0);
  const ang = rnd() * Math.PI * 2;
  const li = Math.max(0, Math.min(13, src.lokaIndex | 0));
  // Height by loka: higher worlds (Satya, li=0) rise toward the top/light, lower worlds (Patala, li=13) sink down.
  const lat = Math.max(-1.3, Math.min(1.3, ((1 - li / 13) - 0.5) * 2.2 + (rnd() - 0.5) * 0.5));
  const R = shellRadiusFor(meraIndexForSource(src, visibleCount), visibleCount);
  const cl = Math.cos(lat);
  return [Math.cos(ang) * cl * R, Math.sin(lat) * R, Math.sin(ang) * cl * R];
}
function sourcePos(src: PowerSource): [number, number, number] {
  const p = src.pos;
  if (
    Array.isArray(p) && p.length === 3 &&
    p.every((n) => typeof n === "number" && isFinite(n)) &&
    (p[0] !== 0 || p[1] !== 0 || p[2] !== 0)
  ) {
    return [p[0], p[1], p[2]];
  }
  const rnd = mulberry32(hashId(src.id));
  const ang = rnd() * Math.PI * 2;
  const rad = 1.3 + rnd() * 1.05;
  return [Math.cos(ang) * rad, (rnd() - 0.5) * 0.85, Math.sin(ang) * rad];
}

function buildClusterGeom(seedId: string): THREE.BufferGeometry {
  const rnd = mulberry32(hashId(seedId) ^ 0x2545f491);
  const N = 11;
  const pos = new Float32Array(N * 3);
  const sz = new Float32Array(N);
  const ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 0.12 + rnd() * 0.34;
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3 + 0] = r * s * Math.cos(th);
    pos[i * 3 + 1] = r * u * 0.8;
    pos[i * 3 + 2] = r * s * Math.sin(th);
    sz[i] = 1.4 + rnd() * 2.2;
    ph[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  return g;
}

// Pralaya / neglect: a creation fed with light (rising investedCrystals) stays bright; left
// unfed it dims, shrinks, drifts toward the periphery, sinks, and slowly dissolves into the
// unmanifest over DAYS -- a neglected world recedes a few Meras per day, not in minutes.
// Neglect is measured from the last feed (seeded from createdAt until a real lastFedAt lands),
// so it persists across sessions. Bump PRALAYA_SPEEDUP (e.g. 240) to preview the whole arc fast.
const DAY_MS = 86_400_000;
const PRALAYA_SPEEDUP = 1;                                  // >1 = faster decay (debug/preview only)
const PRALAYA_START_MS = (DAY_MS * 0.5) / PRALAYA_SPEEDUP;  // stays full ~half a day after the last feed
const PRALAYA_FULL_MS = (DAY_MS * 3) / PRALAYA_SPEEDUP;     // fully dissolved ~3 days after the last feed
function freshnessFrom(sinceMs: number): number {
  if (sinceMs <= PRALAYA_START_MS) return 1;
  if (sinceMs >= PRALAYA_FULL_MS) return 0;
  return clamp01(1 - (sinceMs - PRALAYA_START_MS) / (PRALAYA_FULL_MS - PRALAYA_START_MS));
}

// Influence 1..6 -- how full / powerful a source has grown, driven by the light fed into it.
function sourceInfluence(src: PowerSource): number {
  const base = (src.form === "constellation" ? 5 : 2) * 10000; // creation cost in crystals
  const ratio = (src.investedCrystals || base) / base; // how much light has been fed into it
  return Math.max(1, Math.min(6, ratio)); // growth = feeding; neglect handled by freshness (Pralaya)
}

// Faint star-burst: a line from the cluster centre to each star, so a constellation reads as one figure.
function buildClusterLinks(seedId: string): THREE.BufferGeometry {
  const cl = buildClusterGeom(seedId);
  const p = cl.getAttribute("position") as THREE.BufferAttribute;
  const seg = new Float32Array(p.count * 6);
  for (let i = 0; i < p.count; i++) {
    seg[i * 6 + 0] = 0; seg[i * 6 + 1] = 0; seg[i * 6 + 2] = 0;
    seg[i * 6 + 3] = p.getX(i); seg[i * 6 + 4] = p.getY(i); seg[i * 6 + 5] = p.getZ(i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(seg, 3));
  return g;
}

// A ring of small motes orbiting the source; more motes appear as its influence grows.
function buildOrbitGeom(seedId: string, count: number): THREE.BufferGeometry {
  const rnd = mulberry32(hashId(seedId) ^ 0x9e3779b9);
  const N = Math.max(3, Math.round(count));
  const pos = new Float32Array(N * 3);
  const sz = new Float32Array(N);
  const ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rnd() * 0.4;
    const rad = 0.3 + rnd() * 0.12;
    pos[i * 3 + 0] = Math.cos(a) * rad;
    pos[i * 3 + 1] = (rnd() - 0.5) * 0.12;
    pos[i * 3 + 2] = Math.sin(a) * rad;
    sz[i] = 1.1 + rnd() * 1.4;
    ph[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  return g;
}

function linkEnd(link: SubtleLink): [number, number, number] {
  const i = link.targetIndex;
  if (link.targetKind === "loka") {
    const h = 2.4 + (Math.max(0, Math.min(13, i)) / 13) * 1.9; // higher lokas reach further up
    return [Math.sin(i * 0.7) * 0.45, h, Math.cos(i * 0.7) * 0.45];
  }
  if (link.targetKind === "agent") {
    const a = (Math.max(0, Math.min(20, i)) / 21) * Math.PI * 2;
    const r = 2.75;
    return [Math.cos(a) * r, 0.12, Math.sin(a) * r];
  }
  if (link.targetKind === "human") return [0, -2.75, 0];
  if (link.targetKind === "universe") return [5.2, 0.9, 1.2]; // shoot OUT past the 9th shell into another universe
  return [0, 2.6, 0];
}

function buildLinkGeom(link: SubtleLink): THREE.BufferGeometry {
  const N = 84;
  const end = linkEnd(link);
  const sx = 0, sy = 0, sz0 = 0;
  const mx = (sx + end[0]) / 2;
  const my = (sy + end[1]) / 2;
  const mz = (sz0 + end[2]) / 2;
  const cx = mx + (end[2] - sz0) * 0.2; // bow the thread sideways into a graceful arc
  const cy = my + 0.55;
  const cz = mz - (end[0] - sx) * 0.2;
  const pos = new Float32Array(N * 3);
  const aT = new Float32Array(N);
  const aSize = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const it = 1 - t;
    pos[i * 3 + 0] = it * it * sx + 2 * it * t * cx + t * t * end[0];
    pos[i * 3 + 1] = it * it * sy + 2 * it * t * cy + t * t * end[1];
    pos[i * 3 + 2] = it * it * sz0 + 2 * it * t * cz + t * t * end[2];
    aT[i] = t;
    aSize[i] = 0.7 + Math.sin(t * Math.PI) * 1.1; // fattest mid-thread, tapering at both ends
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  g.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
  return g;
}

// One created power source -- a glowing sun (or a small star-cluster for the constellation form),
// bobbing gently and slowly turning on its own orbit. Core = element colour (the force), halo =
// loka colour (the world). Hover/tap reveals a label and gently brightens + scales it up.
function PowerSourceObject({ src, open, pinned, visibleCount, resonance, handlers }: { src: PowerSource; open: boolean; pinned: boolean; visibleCount: number; resonance: number; handlers: HoverHandlers }) {
  const coreHex = sourceCoreHex(src);
  const haloHex = sourceHaloHex(src);
  const base = useMemo(() => sourcePosOnShell(src, visibleCount), [src.id, src.pos, visibleCount]);
  const phase = useMemo(() => (hashId(src.id) % 1000) / 1000 * Math.PI * 2, [src.id]);
  const core = useMemo(() => new THREE.Color(coreHex), [coreHex]);
  const haloC = useMemo(() => new THREE.Color(haloHex), [haloHex]);
  const label = useMemo(() => sourceLabel(src), [src.id, src.form, src.agentIndex, src.lokaIndex]);
  const grp = useRef<THREE.Group>(null!);
  const vis = useRef<THREE.Group>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const corona = useRef<THREE.Mesh>(null!);
  const field = useRef<THREE.Mesh>(null!);
  const orbit = useRef<THREE.Group>(null!);
  const rings = useRef<THREE.Group>(null!);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const bq = useRef(new THREE.Quaternion()).current;
  const scaleRef = useRef(1);
  const lastFedRef = useRef<number>(src.createdAt || Date.now()); // neglect measured from last feed; createdAt proxy until a real lastFedAt field lands
  const prevInvRef = useRef<number>(src.investedCrystals || 0);
  const freshRef = useRef(1);
  const influence = useMemo(() => sourceInfluence(src), [src.id, src.investedCrystals, src.form, src.createdAt]);
  const coreU = useMemo(() => ({ uColor: { value: new THREE.Color(coreHex) }, uTime: { value: 0 }, uLight: { value: 1.1 } }), []);
  const haloU = useMemo(() => ({ uColor: { value: new THREE.Color(haloHex) }, uTime: { value: 0 }, uLight: { value: 1.1 } }), []);
  const clusterU = useMemo(() => ({ uColor: { value: new THREE.Color(coreHex) }, uTime: { value: 0 } }), []);
  const fieldU = useMemo(() => ({ uColor: { value: new THREE.Color(haloHex) }, uTime: { value: 0 }, uLight: { value: 1.1 } }), []);
  const orbitU = useMemo(() => ({ uColor: { value: new THREE.Color(coreHex) }, uTime: { value: 0 } }), []);
  const clusterGeom = useMemo(() => buildClusterGeom(src.id), [src.id]);
  const linkGeom = useMemo(() => buildClusterLinks(src.id), [src.id]);
  const orbitGeom = useMemo(() => buildOrbitGeom(src.id, 3 + Math.round(influence * 2)), [src.id, influence]);
  const { camera } = useThree();
  const isConstellation = src.form === "constellation";
  const isSpirit = src.form === "spirit";
  const spiritKind = src.spiritKind ?? "planetary";
  const crystalGeo = () =>
    spiritKind === "household" ? (
      <tetrahedronGeometry args={[0.26, 0]} />
    ) : spiritKind === "unified" ? (
      <icosahedronGeometry args={[0.2, 0]} />
    ) : (
      <octahedronGeometry args={[0.22, 0]} />
    );
  const pillBtnStyle = { textAlign: "center" } as any;
  const backBtnStyle = { marginTop: "6px", display: "inline-block", pointerEvents: "auto", cursor: "pointer", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em", color: coreHex, padding: "3px 11px", borderRadius: "999px", border: "1px solid " + coreHex, background: "rgba(255,255,255,0.07)" } as any;
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    // Pralaya: refresh on feeding (investedCrystals rose), else fade with time since last feed.
    const now = Date.now();
    const inv = src.investedCrystals || 0;
    if (inv > prevInvRef.current) lastFedRef.current = now;
    prevInvRef.current = inv;
    const fTarget = freshnessFrom(now - lastFedRef.current);
    freshRef.current += (fTarget - freshRef.current) * 0.04;
    const fresh = freshRef.current;
    // Own heartbeat: every creation softly breathes with its own light; the higher its
    // dimensionality (inner Meras M6-M9 / higher lokas), the stronger it pulses -- echoing the
    // central heart-sun. Each source keeps its own phase so the field shimmers organically.
    const li = Math.max(0, Math.min(13, src.lokaIndex | 0));
    const dim = 1 - li / 13;                    // 0 = low world (periphery) .. 1 = high world (M9)
    const highDim = clamp01((dim - 0.5) / 0.5); // ramps in across M6..M9
    const res = clamp01(resonance);             // how pumped THIS source's Mera is -> its resonance
    const ownPulse = 0.5 + 0.5 * Math.sin(t * 0.4 + phase); // same slow cadence as the centre
    // The creation comes alive only when the Mera it sits on is pumped (res); higher Meras beat harder.
    const beat = res * (0.18 + 0.32 * highDim) * ownPulse;
    const glow = (0.8 + influence * 0.35) * (0.16 + 0.84 * fresh) * (1 + beat * 0.3); // dims as neglected, softly breathes by dimension
    coreU.uTime.value = t;
    haloU.uTime.value = t;
    clusterU.uTime.value = t;
    fieldU.uTime.value = t;
    orbitU.uTime.value = t;
    coreU.uColor.value.copy(core);
    clusterU.uColor.value.copy(core);
    orbitU.uColor.value.copy(core);
    haloU.uColor.value.copy(haloC);
    fieldU.uColor.value.copy(haloC);
    coreU.uLight.value = glow;
    haloU.uLight.value = glow;
    fieldU.uLight.value = (0.55 + influence * 0.18) * (0.16 + 0.84 * fresh) * (1 + beat * 0.2);
    if (grp.current) {
      const sink = 1 - fresh; // neglected creations drift outward to the periphery and sink down
      const spread = 1 + sink * 0.5;
      grp.current.position.set(
        base[0] * spread,
        base[1] * spread + Math.sin(t * 0.8 + phase) * 0.1 - sink * 1.7,
        base[2] * spread,
      );
      grp.current.rotation.y += 0.004;
    }
    if (orbit.current) orbit.current.rotation.y = t * 0.5; // motes circle the source
    const grow = 1 + (influence - 1) * 0.14; // grows as it develops
    const fit = visibleCount > 0 ? 0.21 : 0.5; // created objects rendered ~half size (smaller, daintier on the shell)
    const target = (open ? 1.35 : 1) * grow * fit * (0.3 + 0.7 * fresh) * (1 + beat * 0.06); // shrinks toward Pralaya, gentle breath by dimension
    scaleRef.current += (target - scaleRef.current) * 0.18;
    if (vis.current) {
      vis.current.scale.setScalar(scaleRef.current);
      vis.current.visible = fresh > 0.015; // fully neglected -> dissolved into the unmanifest
    }
    const face = (m: THREE.Object3D | null) => {
      if (!m || !m.parent) return;
      m.parent.getWorldQuaternion(bq);
      bq.invert();
      m.quaternion.copy(bq).multiply(camera.quaternion); // true billboard, immune to parent spin/tilt
    };
    face(halo.current);
    face(corona.current);
    face(field.current);
    // Expanding colour rings -> the source's own pulse rippling outward in its spectrum, an echo of
    // the central heart, emitted only while its Mera resonates (is pumped).
    face(rings.current);
    const RINGS = 3;
    for (let i = 0; i < RINGS; i++) {
      const m = ringRefs.current[i];
      if (!m) continue;
      const rp = ((t * 0.11) + i / RINGS) % 1;       // staggered expanding phase 0..1 (slower)
      m.scale.setScalar(0.25 + rp * 1.25);          // ripple grows from the core outward
      const fadeIn = Math.min(1, rp / 0.08);        // soft birth, no pop
      const op = res * (0.6 + 0.4 * highDim) * (1 - rp) * (1 - rp) * fadeIn * fresh * 0.4;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = op;
      mat.color.copy(core);
      m.visible = op > 0.002;
    }
  });
  return (
    <group ref={grp}>
      <group ref={vis}>
        {isConstellation ? (
          <group>
            <lineSegments geometry={linkGeom}>
              <lineBasicMaterial color={coreHex} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
            </lineSegments>
            <points geometry={clusterGeom}>
              <shaderMaterial
                vertexShader={BG_VERT}
                fragmentShader={BG_FRAG}
                uniforms={clusterU}
                transparent
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </points>
          </group>
        ) : isSpirit ? (
          <group>
            <mesh ref={corona}>
              <planeGeometry args={[1.5, 1.5]} />
              <shaderMaterial
                vertexShader={HALO_VERT}
                fragmentShader={CORONA_FRAG}
                uniforms={coreU}
                transparent
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh>
              {crystalGeo()}
              <meshBasicMaterial color={coreHex} transparent opacity={0.34} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
            <mesh scale={1.04}>
              {crystalGeo()}
              <meshBasicMaterial color={coreHex} wireframe transparent opacity={0.78} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh ref={corona}>
              <planeGeometry args={[1.7, 1.7]} />
              <shaderMaterial
                vertexShader={HALO_VERT}
                fragmentShader={CORONA_FRAG}
                uniforms={coreU}
                transparent
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh>
              <icosahedronGeometry args={[0.16, 3]} />
              <shaderMaterial
                vertexShader={CORE_VERT}
                fragmentShader={CORE_FRAG}
                uniforms={coreU}
                transparent
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}
        <mesh ref={halo}>
          <planeGeometry args={[isConstellation ? 0.95 : 0.78, isConstellation ? 0.95 : 0.78]} />
          <shaderMaterial
            vertexShader={HALO_VERT}
            fragmentShader={HALO_FRAG}
            uniforms={haloU}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <group ref={orbit}>
          <points geometry={orbitGeom}>
            <shaderMaterial
              vertexShader={BG_VERT}
              fragmentShader={BG_FRAG}
              uniforms={orbitU}
              transparent
              depthWrite={false}
              depthTest={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
        <mesh ref={field}>
          <planeGeometry args={[2.6, 2.6]} />
          <shaderMaterial
            vertexShader={HALO_VERT}
            fragmentShader={FIELD_FRAG}
            uniforms={fieldU}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      {/* Resonance rings: concentric waves in the source's own colour, expanding when its Mera is pumped. */}
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(el) => { ringRefs.current[i] = el; }} visible={false}>
            <ringGeometry args={[0.985, 1.0, 96]} />
            <meshBasicMaterial color={coreHex} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); handlers.over(); }}
        onPointerOut={(e) => { e.stopPropagation(); handlers.out(); }}
        onClick={(e) => { e.stopPropagation(); handlers.toggle(); }}
      >
        <sphereGeometry args={[0.46, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {open && (
        <Html position={[0, 0.6, 0]} center style={T5_PILL} zIndexRange={[60, 0]}>
          <div style={pillBtnStyle}>
            <div style={mergeStyle(T5_TITLE, coreHex)}>{label.title}</div>
            <div style={T5_SUB}>{label.sub}</div>
            {pinned && (
              <div onClick={(e) => { e.stopPropagation(); handlers.toggle(); }} style={backBtnStyle}>
                {"\u21A9 \u0432 \u0446\u0435\u043D\u0442\u0440 \u00B7 back"}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// One subtle link -- a thread of streaming light particles flowing from the heart of the cosmos
// toward its target (a loka above, the human below, an agent on the rim, or another universe).
// Hover/tap brightens the flow (uFocus) and shows a label naming the target.
function LinkThread({ link, open, handlers }: { link: SubtleLink; open: boolean; handlers: HoverHandlers }) {
  const colorHex = linkColorHex(link);
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const geom = useMemo(() => buildLinkGeom(link), [link.id, link.targetKind, link.targetIndex]);
  const mid = useMemo(() => linkMidpoint(link), [link.id, link.targetKind, link.targetIndex]);
  const end = useMemo(() => linkEnd(link), [link.id, link.targetKind, link.targetIndex]);
  const label = useMemo(() => linkLabel(link), [link.id, link.targetKind, link.targetIndex]);
  const focusRef = useRef(0);
  const endGrp = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const u = useMemo(() => ({ uColor: { value: new THREE.Color(colorHex) }, uTime: { value: 0 }, uFocus: { value: 0 } }), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    u.uTime.value = t;
    u.uColor.value.copy(color);
    const target = open ? 1 : 0;
    focusRef.current += (target - focusRef.current) * 0.18;
    u.uFocus.value = focusRef.current;
    // The destination blossom always faces the camera: a glowing bead wrapped in soft, slowly
    // counter-turning rings that breathe -> the connection ends in a pretty halo-ring, not a dot.
    if (endGrp.current) endGrp.current.quaternion.copy(camera.quaternion);
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.3);
    if (coreRef.current) coreRef.current.scale.setScalar(1 + 0.16 * pulse);
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.012;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (open ? 0.85 : 0.5) * (0.45 + 0.55 * pulse);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.007;
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = (open ? 0.5 : 0.28) * (0.4 + 0.6 * (1 - pulse));
    }
  });
  return (
    <group>
      <points geometry={geom}>
        <shaderMaterial
          vertexShader={LINK_VERT}
          fragmentShader={LINK_FRAG}
          uniforms={u}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <group ref={endGrp} position={end}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.1, 18, 18]} />
          <meshBasicMaterial color={colorHex} transparent opacity={open ? 0.95 : 0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.2, 28]} />
          <meshBasicMaterial color={colorHex} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.18, 0.22, 48]} />
          <meshBasicMaterial color={colorHex} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={ring2Ref}>
          <ringGeometry args={[0.27, 0.295, 56]} />
          <meshBasicMaterial color={colorHex} transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh
        position={mid}
        onPointerOver={(e) => { e.stopPropagation(); handlers.over(); }}
        onPointerOut={(e) => { e.stopPropagation(); handlers.out(); }}
        onClick={(e) => { e.stopPropagation(); handlers.toggle(); }}
      >
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {open && (
        <Html position={mid} center style={T5_PILL} zIndexRange={[60, 0]}>
          <div style={mergeStyle(T5_TITLE, colorHex)}>{label.title}</div>
          <div style={T5_SUB}>{label.sub}</div>
        </Html>
      )}
    </group>
  );
}

// A cathedral / cosmic union -- binds several created forces & spirits into one luminous pattern
// (mandala / ring / flower / star): glowing spokes from a central node out to each member, an
// optional connecting loop, and a softly pulsing heart at the centre of the union.
function CathedralBond({ cathedral, sources, visibleCount }: { cathedral: { id: string; name: string; pattern: string; memberIds: string[] }; sources: PowerSource[]; visibleCount: number }) {
  // Each member force keeps its real position (for the spokes/loop) AND its own colour, so the
  // forces that were called to unity can gather and DANCE around the new union sphere.
  const members = useMemo(() => {
    const arr: { pos: THREE.Vector3; color: string }[] = [];
    for (const id of cathedral.memberIds) {
      const src = sources.find((s) => s.id === id);
      if (!src) continue;
      const b = sourcePosOnShell(src, visibleCount);
      arr.push({ pos: new THREE.Vector3(b[0], b[1], b[2]), color: sourceCoreHex(src) });
    }
    return arr;
  }, [cathedral.memberIds, sources, visibleCount]);
  const pts = useMemo(() => members.map((m) => m.pos), [members]);
  const center = useMemo(() => {
    const c = new THREE.Vector3();
    pts.forEach((p) => c.add(p));
    if (pts.length) c.multiplyScalar(1 / pts.length);
    return c;
  }, [pts]);
  const spokeGeom = useMemo(() => {
    const seg = new Float32Array(pts.length * 6);
    pts.forEach((p, i) => {
      seg[i * 6 + 0] = center.x; seg[i * 6 + 1] = center.y; seg[i * 6 + 2] = center.z;
      seg[i * 6 + 3] = p.x; seg[i * 6 + 4] = p.y; seg[i * 6 + 5] = p.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(seg, 3));
    return g;
  }, [pts, center]);
  const loopGeom = useMemo(() => {
    const N = pts.length;
    if (N < 2) return null;
    const seg = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const a = pts[i]; const b = pts[(i + 1) % N];
      seg[i * 6 + 0] = a.x; seg[i * 6 + 1] = a.y; seg[i * 6 + 2] = a.z;
      seg[i * 6 + 3] = b.x; seg[i * 6 + 4] = b.y; seg[i * 6 + 5] = b.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(seg, 3));
    return g;
  }, [pts]);
  // The forces called to unity, each given its own tilted orbit, pace and bob -> a beautiful
  // dance around the union sphere. Seeded per cathedral so the choreography is stable.
  const dancers = useMemo(() => {
    const N = Math.max(1, members.length);
    return members.map((m, i) => {
      const rnd = mulberry32((hashId(cathedral.id) ^ (i * 0x9e3779b9)) >>> 0);
      return {
        color: m.color,
        a0: (i / N) * Math.PI * 2 + rnd() * 0.6,
        r: 0.42 + rnd() * 0.18,
        inc: (rnd() - 0.5) * 1.5,
        speed: 0.45 + rnd() * 0.5,
        bobAmp: 0.04 + rnd() * 0.07,
        bobSpeed: 1.1 + rnd() * 1.3,
        size: 0.05 + rnd() * 0.035,
      };
    });
  }, [members, cathedral.id]);
  const coreRef = useRef<THREE.Mesh>(null!);
  const unityRef = useRef<THREE.Group>(null!);
  const dancerRefs = useRef<Array<THREE.Group | null>>([]);
  const birthRef = useRef(0); // 0 -> 1 ease so the union sphere is BORN (appears) when created
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    birthRef.current += (1 - birthRef.current) * Math.min(1, dt * 2.2);
    const grow = birthRef.current;
    // The unifying force-sphere slowly turns around itself as it gathers the forces into one.
    if (unityRef.current) {
      unityRef.current.rotation.y += dt * 0.35;
      unityRef.current.rotation.x = Math.sin(t * 0.2) * 0.16;
      unityRef.current.scale.setScalar(grow * (1 + 0.07 * Math.sin(t * 1.1)));
    }
    if (coreRef.current) coreRef.current.scale.setScalar(1 + 0.18 * Math.sin(t * 1.4));
    // Each called force dances around the new sphere: orbit on its own tilted plane, gently bobbing.
    for (let i = 0; i < dancers.length; i++) {
      const g = dancerRefs.current[i];
      if (!g) continue;
      const d = dancers[i];
      const ang = d.a0 + t * d.speed;
      const ca = Math.cos(ang) * d.r;
      const sa = Math.sin(ang) * d.r;
      const bob = Math.sin(t * d.bobSpeed + d.a0) * d.bobAmp;
      g.position.set(ca, sa * Math.cos(d.inc) + bob, sa * Math.sin(d.inc));
      g.scale.setScalar(grow);
    }
  });
  if (pts.length < 2) return null;
  const color = cathedralColor(cathedral.pattern);
  const showSpokes = cathedral.pattern !== "ring";
  const showLoop = cathedral.pattern !== "star";
  return (
    <group>
      {showSpokes && (
        <lineSegments geometry={spokeGeom}>
          <lineBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}
      {showLoop && loopGeom && (
        <lineSegments geometry={loopGeom}>
          <lineBasicMaterial color={color} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}
      {/* The unifying force-sphere: a glassy, slowly self-rotating orb born at the heart of the union. */}
      <group ref={unityRef} position={center}>
        <mesh>
          <sphereGeometry args={[0.2, 28, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
        <mesh scale={1.03}>
          <sphereGeometry args={[0.2, 22, 16]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.36, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>
      </group>
      {/* The forces & spheres called to unity, dancing around the new union sphere. */}
      <group position={center}>
        {dancers.map((d, i) => (
          <group key={i} ref={(el) => { dancerRefs.current[i] = el; }}>
            <mesh>
              <sphereGeometry args={[d.size, 16, 16]} />
              <meshBasicMaterial color={d.color} transparent opacity={0.92} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={2.2}>
              <sphereGeometry args={[d.size, 16, 16]} />
              <meshBasicMaterial color={d.color} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// The highest creations (T5): boundless cosmos-spheres BEYOND our universe. Each is its own great
// cosmos, slowly wheeling around the whole of our cosmos far past the 9th shell and -- being
// immeasurable -- touching every Mera at once by its mere presence. Creator (Творец, violet) and
// the Light-Maker (Создатель Света, gold) wheel on their own great orbits, gently breathing.
const OUTER_COSMOS_HEX: Record<string, { core: string; halo: string }> = {
  creator: { core: "#b58cff", halo: "#6a78d8" },
  lightmaker: { core: "#ffe9a8", halo: "#ffd27a" },
};

// A boundless outer cosmos contains the powers of every tier below it: being immeasurable it
// holds the light-capacities of all previous forms and so BIRTHS its own life -- sparks (Искры)
// whirling within, little spirits each haloed with a tiny wireframe form, and subtle-link threads
// reaching from its heart out to every spirit it creates.
function OuterCosmosLife({ seed, hex }: { seed: string; hex: { core: string; halo: string } }) {
  const grp = useRef<THREE.Group>(null!);
  const spiritRefs = useRef<Array<THREE.Group | null>>([]);
  // Seeded so each cosmos keeps a stable inner life.
  const cfg = useMemo(() => {
    const rnd = mulberry32(hashId(seed) ^ 0x1b873593);
    const orbits = Array.from({ length: 60 }, () => ({
      r: 0.45 + rnd() * 0.85,
      a0: rnd() * Math.PI * 2,
      inc: (rnd() - 0.5) * Math.PI,
      speed: 0.15 + rnd() * 0.5,
    }));
    const spirits = Array.from({ length: 5 }, (_, i) => ({
      r: 0.7 + rnd() * 0.55,
      a0: (i / 5) * Math.PI * 2 + rnd() * 0.5,
      inc: (rnd() - 0.5) * 1.4,
      speed: 0.2 + rnd() * 0.3,
      size: 0.05 + rnd() * 0.05,
    }));
    return { orbits, spirits };
  }, [seed]);
  const sparkGeom = useMemo(() => {
    const arr = new Float32Array(cfg.orbits.length * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [cfg.orbits.length]);
  const linkGeom = useMemo(() => {
    const seg = new Float32Array(cfg.spirits.length * 6);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(seg, 3));
    return g;
  }, [cfg.spirits.length]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    // Whirl the sparks (Искры) on their little orbits.
    const pa = sparkGeom.getAttribute("position") as THREE.BufferAttribute;
    const arr = pa.array as Float32Array;
    for (let i = 0; i < cfg.orbits.length; i++) {
      const o = cfg.orbits[i];
      const ang = o.a0 + t * o.speed;
      const ca = Math.cos(ang) * o.r;
      const sa = Math.sin(ang) * o.r;
      arr[i * 3] = ca;
      arr[i * 3 + 1] = sa * Math.cos(o.inc);
      arr[i * 3 + 2] = sa * Math.sin(o.inc);
    }
    pa.needsUpdate = true;
    // Drift the born spirits and re-aim the subtle-link threads at them.
    const la = linkGeom.getAttribute("position") as THREE.BufferAttribute;
    const larr = la.array as Float32Array;
    for (let i = 0; i < cfg.spirits.length; i++) {
      const sp = cfg.spirits[i];
      const ang = sp.a0 + t * sp.speed;
      const ca = Math.cos(ang) * sp.r;
      const sa = Math.sin(ang) * sp.r;
      const x = ca;
      const y = sa * Math.cos(sp.inc);
      const z = sa * Math.sin(sp.inc);
      const g = spiritRefs.current[i];
      if (g) g.position.set(x, y, z);
      larr[i * 6 + 0] = 0; larr[i * 6 + 1] = 0; larr[i * 6 + 2] = 0;
      larr[i * 6 + 3] = x; larr[i * 6 + 4] = y; larr[i * 6 + 5] = z;
    }
    la.needsUpdate = true;
  });
  return (
    <group ref={grp}>
      <points geometry={sparkGeom}>
        <pointsMaterial size={0.05} color={hex.core} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments geometry={linkGeom}>
        <lineBasicMaterial color={hex.halo} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      {cfg.spirits.map((sp, i) => (
        <group key={i} ref={(el) => { spiritRefs.current[i] = el; }}>
          <mesh>
            <sphereGeometry args={[sp.size, 14, 14]} />
            <meshBasicMaterial color={hex.core} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh scale={2.2}>
            <sphereGeometry args={[sp.size, 12, 12]} />
            <meshBasicMaterial color={hex.halo} transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh scale={3.2}>
            <icosahedronGeometry args={[sp.size, 0]} />
            <meshBasicMaterial color={hex.core} wireframe transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OuterCosmosSphere({ cosmos, index, count }: { cosmos: { id: string; kind: string; createdAt: number }; index: number; count: number }) {
  const hex = OUTER_COSMOS_HEX[cosmos.kind] ?? OUTER_COSMOS_HEX.creator;
  const grp = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const birthRef = useRef(0);
  const cfg = useMemo(() => {
    const rnd = mulberry32(hashId(cosmos.id) ^ 0x51ed2701);
    return {
      radius: 6.4 + rnd() * 1.8,            // far beyond the 9th shell (SHELL_R_OUT ~3.25)
      a0: (index / Math.max(1, count)) * Math.PI * 2 + rnd() * 0.5,
      speed: 0.03 + rnd() * 0.025,          // slow, majestic wheel around the whole cosmos
      inc: (rnd() - 0.5) * 0.7,             // tilt of its great orbit
      yBob: 0.35 + rnd() * 0.4,
      size: 1.5 + rnd() * 0.6,              // huge -- a cosmos unto itself
    };
  }, [cosmos.id, index, count]);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    birthRef.current += (1 - birthRef.current) * Math.min(1, dt * 1.3);
    const grow = birthRef.current;
    if (grp.current) {
      const ang = cfg.a0 + t * cfg.speed;
      const ca = Math.cos(ang) * cfg.radius;
      const sa = Math.sin(ang) * cfg.radius;
      grp.current.position.set(
        ca,
        sa * Math.sin(cfg.inc) + Math.sin(t * 0.2 + cfg.a0) * cfg.yBob,
        sa * Math.cos(cfg.inc),
      );
      grp.current.scale.setScalar(grow * cfg.size);
    }
    if (spin.current) {
      spin.current.rotation.y += dt * 0.12;   // the great cosmos turns slowly about itself
      spin.current.rotation.x = Math.sin(t * 0.13) * 0.15;
    }
    if (coreRef.current) coreRef.current.scale.setScalar(0.42 * (1 + 0.05 * Math.sin(t * 0.8)));
  });
  return (
    <group ref={grp}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial color={hex.core} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
        <mesh scale={1.012}>
          <sphereGeometry args={[1, 30, 22]} />
          <meshBasicMaterial color={hex.core} wireframe transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshBasicMaterial color={hex.core} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <mesh scale={1.55}>
        <sphereGeometry args={[1, 28, 28]} />
        <meshBasicMaterial color={hex.halo} transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      {/* The boundless cosmos holds the powers of all lower tiers: it births its own sparks, spirits, links and forms. */}
      <OuterCosmosLife seed={cosmos.id} hex={hex} />
    </group>
  );
}

// All the player's boundless outer cosmoses, wheeling OUTSIDE the universe (not riding its tilt/spin),
// so they truly orbit the whole cosmos and touch every Mera at once.
function OuterCosmosLayer() {
  const { player } = usePlayer();
  const cosmoses = player.outerCosmoses ?? [];
  if (cosmoses.length === 0) return null;
  return (
    <group>
      {cosmoses.map((c, i) => (
        <OuterCosmosSphere key={c.id} cosmos={c} index={i} count={cosmoses.length} />
      ))}
    </group>
  );
}

// The creator's own layer: all power sources + subtle links, riding the universe's tilt + spin so
// they sit INSIDE the player's living, turning cosmos. Owns the hover/tap selection: one label is
// shown at a time (hovered on desktop, pinned by tap on phone -- tap again to dismiss).
function CreatorLayer({ tilt, tier, draggingRef, zoomRef, focusRef }: { tilt: number; tier: number; draggingRef: React.MutableRefObject<boolean>; zoomRef: React.MutableRefObject<number>; focusRef: React.MutableRefObject<{ target: THREE.Vector3; active: boolean; owner?: "src" | "mera" | null }> }) {
  const { player } = usePlayer();
  const visibleCount = visibleSpheresForTier(tier);
  const sources = player.powerSources ?? [];
  const links = player.subtleLinks ?? [];
  const cathedrals = player.cathedrals ?? [];
  // Per-Mera fill (0..1), computed exactly like NineSpheres, so a creation can tell whether the
  // Mera it sits on has been pumped -> it RESONATES and ripples with its own light.
  const fills = useMemo(() => {
    const arr = new Array(9).fill(0);
    for (const l of player.lokas ?? []) {
      const mi = meraIndexForLoka(l.index, visibleCount);
      const fv = lokaFill(l);
      if (fv > arr[mi]) arr[mi] = fv;
    }
    const SPILL = 0.35;
    const out = arr.slice();
    for (let i = 0; i < 9; i++) {
      const nb = Math.max(i + 1 < 9 ? arr[i + 1] : 0, i - 1 >= 0 ? arr[i - 1] : 0) * SPILL;
      if (nb > out[i]) out[i] = nb;
    }
    return out;
  }, [player.lokas, visibleCount]);
  const grp = useRef<THREE.Group>(null!);
  const focusVec = useRef(new THREE.Vector3()).current;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinId, setPinId] = useState<string | null>(null);
  useFrame((s, dt) => {
    const g = grp.current;
    if (!g) return;
    g.rotation.x = tilt;
    // Freeze the idle self-spin while a source is magnetized so its world position (the camera
    // pivot) stays put -> stable orbit around IT instead of a wobbling target.
    if (!draggingRef.current && !pinId) g.rotation.y += dt * 0.025;
    // Feed the magnetized source's LIVE world position into focusRef so SceneContents recenters
    // the camera on it. (Links carry no position, so only "s:" sources become the pivot.)
    if (pinId && pinId.startsWith("s:")) {
      const src = sources.find((p) => "s:" + p.id === pinId);
      if (src) {
        const b = sourcePosOnShell(src, visibleCount);
        g.updateMatrixWorld();
        focusVec.set(b[0], b[1], b[2]).applyMatrix4(g.matrixWorld);
        focusRef.current.target.copy(focusVec);
        focusRef.current.active = true;
        focusRef.current.owner = "src";
      } else if (focusRef.current.owner !== "mera") {
        focusRef.current.active = false;
        focusRef.current.owner = null;
      }
    } else if (focusRef.current.owner !== "mera") {
      focusRef.current.active = false;
      focusRef.current.owner = null;
    }
  });
  const makeHandlers = useCallback((id: string): HoverHandlers => ({
    over: () => { setHoverId(id); if (typeof document !== "undefined") document.body.style.cursor = "pointer"; },
    out: () => { setHoverId((h) => (h === id ? null : h)); if (typeof document !== "undefined") document.body.style.cursor = "auto"; },
    toggle: () => setPinId((p) => {
      const next = p === id ? null : id;
      // Click a source = make IT the centre and fly the orbit in close; click again (or another) = back to overview.
      if (id.startsWith("s:")) {
        const targetZoom = next === null ? ZOOM_BASE : 1.7;
        gsap.to(zoomRef, { current: targetZoom, duration: 0.9, ease: "power2.inOut", overwrite: true });
      }
      return next;
    }),
  }), []);
  if (sources.length === 0 && links.length === 0 && cathedrals.length === 0) return null;
  return (
    <group ref={grp}>
      {cathedrals.map((c) => (
        <CathedralBond key={"c:" + c.id} cathedral={c} sources={sources} visibleCount={visibleCount} />
      ))}
      {links.map((l) => {
        const id = "l:" + l.id;
        return <LinkThread key={id} link={l} open={pinId === id || hoverId === id} handlers={makeHandlers(id)} />;
      })}
      {sources.map((p) => {
        const id = "s:" + p.id;
        const resonance = fills[meraIndexForSource(p, visibleCount)] ?? 0;
        return <PowerSourceObject key={id} src={p} open={pinId === id || hoverId === id} pinned={pinId === id} visibleCount={visibleCount} resonance={resonance} handlers={makeHandlers(id)} />;
      })}
    </group>
  );
}

/* ============================ scene ============================ */

function SceneContents({
  form,
  light,
  starHex,
  coreHex,
  starCount,
  zoomRef,
  rotRef,
  draggingRef,
  focusRef,
  own,
  tier,
}: {
  form: UniverseForm;
  light: number;
  starHex: string;
  coreHex: string;
  starCount: number;
  zoomRef: React.MutableRefObject<number>;
  rotRef: React.MutableRefObject<{ x: number; y: number }>;
  draggingRef: React.MutableRefObject<boolean>;
  focusRef: React.MutableRefObject<{ target: THREE.Vector3; active: boolean }>;
  own: boolean;
  tier: number;
}) {
  const { camera } = useThree();
  const frac = Math.min(1, light / LIGHT_MAX);
  // ORBIT CAMERA: dragging turns the camera AROUND the universe on a sphere -- you are INSIDE,
  // looking around it on a full 360 in yaw (rotRef.y), with pitch (rotRef.x) clamped in the
  // pointer handler. Zoom = orbit radius. This replaces spinning the universe object itself.
  const radius = useRef(ZOOM_BASE);
  const pivot = useRef(new THREE.Vector3());
  useFrame(() => {
    radius.current += (zoomRef.current - radius.current) * 0.2; // smooth zoom -> orbit radius
    // PIVOT = the point the camera orbits AND looks at. Default = the universe core (0,0,0).
    // When a creation is magnetized, focusRef feeds ITS live world position, so the camera
    // recenters on that object and the wheel/pinch zoom approaches IT, not the core.
    const f = focusRef.current;
    const tx = f.active ? f.target.x : 0;
    const ty = f.active ? f.target.y : 0;
    const tz = f.active ? f.target.z : 0;
    pivot.current.x += (tx - pivot.current.x) * 0.08;
    pivot.current.y += (ty - pivot.current.y) * 0.08;
    pivot.current.z += (tz - pivot.current.z) * 0.08;
    const yaw = rotRef.current.y;
    const pitch = rotRef.current.x;
    const cp = Math.cos(pitch);
    const r = radius.current;
    const px = pivot.current.x, py = pivot.current.y, pz = pivot.current.z;
    camera.position.set(px + r * Math.sin(yaw) * cp, py + r * Math.sin(pitch), pz + r * Math.cos(yaw) * cp);
    camera.lookAt(px, py, pz);
  });
  return (
    <>
      <ambientLight intensity={0.12 + frac * 0.3} />
      <pointLight position={[4, 3, 5]} intensity={0.6 + frac * 1.2} color={"#fff2cf"} />
      <BackgroundStars count={starCount} colorHex={starHex} />
      <GalaxyPoints key={form.seed} form={form} light={light} starHex={starHex} coreHex={coreHex} draggingRef={draggingRef} />
      <MagicDust colorHex={coreHex} />
      <CoreSource light={light} colorHex={coreHex} kind={form.source} seed={form.seed} tilt={form.tilt} />
      {/* The player's own T5 creations -- power sources + subtle links living inside the cosmos. */}
      {own && <CreatorLayer tilt={form.tilt} tier={tier} draggingRef={draggingRef} zoomRef={zoomRef} focusRef={focusRef} />}
      {/* The highest creations -- boundless cosmos-spheres wheeling far OUTSIDE our universe. */}
      {own && <OuterCosmosLayer />}
      {/* Bloom temporarily disabled to isolate the strobe flicker (additive glow only). */}
    </>
  );
}

/* ============================ styles ============================ */

const STAGE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#04040a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};
const INNER: React.CSSProperties = {
  position: "relative",
  height: "100vh",
  aspectRatio: "9 / 16",
  maxWidth: "100vw",
  overflow: "hidden",
  touchAction: "none",
};
const BG_BASE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  transition: "background 0.8s ease",
};
const CANVAS_WRAP: React.CSSProperties = { position: "absolute", inset: 0 };
const DARK_VEIL_BASE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(circle at center, rgba(2,2,8,0.22) 0%, rgba(2,2,8,0.72) 62%, rgba(2,2,8,0.94) 100%)",
};
const COVER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(circle at center, #160f2c 0%, #04040a 72%)",
  opacity: 0,
};
const FLASH: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(circle at center, #fff7e6 0%, #ffd27a 35%, transparent 72%)",
  opacity: 1,
};
const CAPTION: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: "clamp(24px, 6vh, 64px)",
  margin: 0,
  textAlign: "center",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  letterSpacing: "0.14em",
  fontSize: "clamp(13px, 3.6vw, 18px)",
  color: "rgba(225, 214, 180, 0.62)",
  textShadow: "0 0 18px rgba(201, 168, 76, 0.3)",
  pointerEvents: "none",
};
const META: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: "calc(clamp(24px, 6vh, 64px) + 30px)",
  margin: 0,
  textAlign: "center",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.22em",
  fontSize: "clamp(10px, 2.6vw, 12px)",
  color: "rgba(225, 218, 190, 0.34)",
  pointerEvents: "none",
};
const ARROW_BASE: React.CSSProperties = {
  position: "absolute",
  zIndex: 20, // stay above full-screen window overlays (e.g. Chatura-Loka) so vertical nav always works
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  padding: "18px 12px",
  lineHeight: 1,
  color: "rgba(225, 218, 190, 0.42)",
  fontSize: "clamp(26px, 7vw, 40px)",
  fontFamily: "Georgia, serif",
  cursor: "pointer",
  pointerEvents: "auto",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  textShadow: "0 0 16px rgba(201, 168, 76, 0.35)",
};
const ARROW_LEFT: React.CSSProperties = { ...ARROW_BASE, left: "clamp(4px, 2vw, 20px)" };
const ARROW_RIGHT: React.CSSProperties = { ...ARROW_BASE, right: "clamp(4px, 2vw, 20px)" };
const ARROW_UP: React.CSSProperties = {
  ...ARROW_BASE,
  left: "50%",
  right: "auto",
  top: "clamp(52px, 9vh, 92px)",
  transform: "translateX(-50%)",
};
const ARROW_DOWN: React.CSSProperties = {
  ...ARROW_BASE,
  left: "50%",
  right: "auto",
  top: "auto",
  bottom: "clamp(64px, 13vh, 120px)",
  transform: "translateX(-50%)",
};
const WINDOW_OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at center, rgba(4,4,12,0.5) 0%, rgba(2,2,8,0.86) 100%)",
  pointerEvents: "auto",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};
const WINDOW_PANEL: React.CSSProperties = {
  minWidth: "min(74vw, 320px)",
  padding: "34px 30px",
  textAlign: "center",
  borderRadius: "18px",
  border: "1px solid rgba(201, 168, 76, 0.32)",
  background: "rgba(18, 16, 32, 0.5)",
  boxShadow: "0 0 42px rgba(138, 106, 216, 0.18)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  pointerEvents: "none",
};
const WINDOW_KICKER: React.CSSProperties = {
  margin: "0 0 10px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.34em",
  textTransform: "uppercase",
  fontSize: "clamp(9px, 2.2vw, 11px)",
  color: "rgba(201, 168, 76, 0.62)",
};
const WINDOW_TITLE: React.CSSProperties = {
  margin: 0,
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  fontSize: "clamp(18px, 5vw, 26px)",
  color: "rgba(231, 221, 190, 0.92)",
  textShadow: "0 0 18px rgba(201, 168, 76, 0.3)",
};
const WINDOW_SOON: React.CSSProperties = {
  margin: "12px 0 0",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.2em",
  fontSize: "clamp(10px, 2.6vw, 12px)",
  color: "rgba(225, 218, 190, 0.4)",
};

// Side "floor" rail -- a column of dots showing which vertical level you are on.
const LEVEL_RAIL: React.CSSProperties = {
  position: "absolute",
  right: "clamp(4px, 1.2vw, 10px)",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "9px",
  pointerEvents: "none",
  zIndex: 5,
};
const LEVEL_DOT: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "rgba(225, 218, 190, 0.26)",
  transition: "all 0.45s ease",
};
const LEVEL_DOT_ON: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#ffd27a",
  boxShadow: "0 0 10px rgba(255, 210, 122, 0.85)",
  transition: "all 0.45s ease",
};

const HUD: React.CSSProperties = {
  position: "absolute",
  top: "clamp(14px, 3vh, 28px)",
  left: "clamp(12px, 3vw, 26px)",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  pointerEvents: "none",
  fontFamily: "Georgia, 'Times New Roman', serif",
};
const HUD_ROW: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: "8px" };
const HUD_LABEL: React.CSSProperties = {
  letterSpacing: "0.28em",
  fontSize: "clamp(9px, 2.4vw, 11px)",
  textTransform: "uppercase",
  color: "rgba(225, 218, 190, 0.5)",
};
const HUD_VALUE: React.CSSProperties = {
  fontStyle: "italic",
  fontSize: "clamp(13px, 3.4vw, 17px)",
  color: "rgba(255, 226, 150, 0.9)",
  textShadow: "0 0 14px rgba(201, 168, 76, 0.4)",
};
const HUD_BAR: React.CSSProperties = {
  width: "clamp(92px, 30vw, 150px)",
  height: "3px",
  borderRadius: "2px",
  background: "rgba(225, 218, 190, 0.12)",
  overflow: "hidden",
};
const HUD_BAR_FILL_BASE: React.CSSProperties = {
  height: "100%",
  borderRadius: "2px",
  background: "linear-gradient(90deg, #8a6ad8 0%, #c9a84c 100%)",
  boxShadow: "0 0 10px rgba(201, 168, 76, 0.6)",
};
const CTRL: React.CSSProperties = {
  position: "absolute",
  top: "calc(clamp(14px, 3vh, 28px) + 30px)",
  right: "clamp(12px, 3vw, 26px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "8px",
};
const PILL: React.CSSProperties = {
  background: "rgba(20, 18, 34, 0.55)",
  border: "1px solid rgba(201, 168, 76, 0.35)",
  color: "rgba(231, 221, 190, 0.88)",
  borderRadius: "999px",
  padding: "7px 14px",
  fontSize: "clamp(11px, 2.8vw, 13px)",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.05em",
  cursor: "pointer",
  pointerEvents: "auto",
  WebkitTapHighlightColor: "transparent",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};
const TAG: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  fontSize: "clamp(10px, 2.6vw, 12px)",
  letterSpacing: "0.12em",
  color: "rgba(201, 168, 76, 0.6)",
  pointerEvents: "none",
};
const LANG: React.CSSProperties = {
  position: "absolute",
  top: "clamp(14px, 3vh, 28px)",
  right: "clamp(12px, 3vw, 26px)",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  pointerEvents: "auto",
  fontFamily: "Georgia, 'Times New Roman', serif",
  userSelect: "none",
};
const LANG_OPT_BASE: React.CSSProperties = {
  background: "none",
  border: "none",
  margin: 0,
  padding: "4px 7px",
  font: "inherit",
  fontSize: "clamp(13px, 1.7vh, 16px)",
  letterSpacing: "0.12em",
  lineHeight: 1,
  cursor: "pointer",
  borderRadius: "6px",
  WebkitTapHighlightColor: "transparent",
  transition: "color 0.35s ease, text-shadow 0.35s ease",
};
const LANG_ON: React.CSSProperties = {
  ...LANG_OPT_BASE,
  color: "#ffd27a",
  textShadow: "0 0 12px rgba(255, 210, 122, 0.65), 0 0 3px rgba(255, 210, 122, 0.9)",
};
const LANG_OFF: React.CSSProperties = { ...LANG_OPT_BASE, color: "rgba(255, 210, 122, 0.42)" };
const LANG_SEP: React.CSSProperties = { color: "rgba(255, 210, 122, 0.3)", fontSize: "clamp(12px, 1.5vh, 15px)" };

const CAM = { position: [0, 0, 12.4] as [number, number, number], fov: 50, near: 0.1, far: 200 };
const GL_DESKTOP = { antialias: false, powerPreference: "high-performance" as const };
const GL_MOBILE = { antialias: false, powerPreference: "high-performance" as const };
const ZOOM_MIN = 0.6; // allow flying right into the core
const ZOOM_MAX = 22;
const ZOOM_BASE = 12.4;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function clampZoom(z: number) {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}

/* ============================ node 1.2: human architecture window ============================ */

// Colours for the 7 classic chakra points on the central figure (root -> crown).
const CHAKRA_HEX: Record<number, string> = {
  1: "#d8333a", 2: "#e8843a", 3: "#e8c33a", 4: "#3ad87a",
  5: "#3ab4d8", 6: "#6a78d8", 7: "#b58cff",
};

// Chakra centres on the figure, top (crown) -> bottom (root).
const FIGURE_NODES = [
  { id: 7, y: 74 },
  { id: 6, y: 110 },
  { id: 5, y: 152 },
  { id: 4, y: 206 },
  { id: 3, y: 258 },
  { id: 2, y: 304 },
  { id: 1, y: 358 },
];

// A weaving side-channel (ida / pingala): crosses the central axis at every chakra,
// bulging out to one side between them. startSide -1 = first bulge left, +1 = right.
function meridianPath(ys: number[], cx: number, amp: number, startSide: number): string {
  let d = "M " + cx + " " + (ys[0] - 14);
  let prev = ys[0] - 14;
  for (let i = 0; i < ys.length; i++) {
    const y = ys[i];
    const my = (prev + y) / 2;
    const side = startSide * (i % 2 === 0 ? 1 : -1);
    const bx = cx + side * amp;
    d += " Q " + bx + " " + my + " " + cx + " " + y;
    prev = y;
  }
  return d;
}

const HW_WRAP: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at center, rgba(4,4,12,0.55) 0%, rgba(2,2,8,0.9) 100%)",
  pointerEvents: "auto",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};
const HW_PANEL: React.CSSProperties = {
  position: "relative",
  width: "min(86vw, 360px)",
  maxHeight: "82vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflowY: "auto",
  padding: "20px 18px 26px",
  borderRadius: "20px",
  border: "1px solid rgba(201, 168, 76, 0.3)",
  background: "rgba(16, 14, 30, 0.55)",
  boxShadow: "0 0 46px rgba(138, 106, 216, 0.2)",
  backdropFilter: "blur(7px)",
  WebkitBackdropFilter: "blur(7px)",
};
const HW_KICKER: React.CSSProperties = {
  margin: "0 0 4px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.34em",
  textTransform: "uppercase",
  fontSize: "clamp(8px, 2vw, 10px)",
  color: "rgba(201, 168, 76, 0.6)",
};
const HW_TITLE: React.CSSProperties = {
  margin: "0 0 14px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  fontSize: "clamp(18px, 5vw, 24px)",
  color: "rgba(231, 221, 190, 0.94)",
  textShadow: "0 0 18px rgba(201, 168, 76, 0.3)",
};
const HW_SVG: React.CSSProperties = { maxWidth: "260px", margin: "0 auto", display: "block" };
const HW_HINT: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.16em",
  fontSize: "clamp(10px, 2.6vw, 12px)",
  color: "rgba(225, 218, 190, 0.5)",
  textAlign: "center",
};
const HW_LEAD: React.CSSProperties = {
  margin: "0 0 14px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(11px, 2.7vw, 13px)",
  lineHeight: 1.5,
  color: "rgba(225, 218, 190, 0.72)",
  textAlign: "center",
};
const HW_LIST: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
};
const HW_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  textAlign: "left",
};
const HW_DOT_BASE: React.CSSProperties = {
  flex: "0 0 auto",
  width: "16px",
  height: "16px",
  marginTop: "3px",
  borderRadius: "50%",
  boxShadow: "0 0 10px rgba(255,255,255,0.25)",
};
const HW_NAME: React.CSSProperties = {
  margin: 0,
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(13px, 3.3vw, 15px)",
  color: "rgba(238, 230, 205, 0.95)",
};
const HW_META: React.CSSProperties = {
  margin: "1px 0 0",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(10px, 2.5vw, 12px)",
  lineHeight: 1.45,
  color: "rgba(210, 202, 178, 0.62)",
};
const HW_FOOT: React.CSSProperties = {
  margin: "16px 0 0",
  paddingTop: "12px",
  borderTop: "1px solid rgba(201, 168, 76, 0.2)",
  width: "100%",
  textAlign: "left",
};
const HW_FOOT_P: React.CSSProperties = {
  margin: "0 0 8px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(10px, 2.5vw, 12px)",
  lineHeight: 1.5,
  color: "rgba(210, 202, 178, 0.6)",
};
const HW_ARROW_L: React.CSSProperties = { ...ARROW_BASE, left: "clamp(2px, 1vw, 10px)" };
const HW_ARROW_R: React.CSSProperties = { ...ARROW_BASE, right: "clamp(2px, 1vw, 10px)" };
const HW_PAGER: React.CSSProperties = {
  display: "flex",
  gap: "7px",
  marginTop: "14px",
  alignItems: "center",
  justifyContent: "center",
};
const HW_PAGER_DOT: React.CSSProperties = {
  width: "7px", height: "7px", borderRadius: "50%",
  background: "rgba(225,218,190,0.28)", transition: "all 0.3s ease",
};
const HW_PAGER_ON: React.CSSProperties = {
  width: "9px", height: "9px", borderRadius: "50%",
  background: "#ffd27a", boxShadow: "0 0 9px rgba(255,210,122,0.8)", transition: "all 0.3s ease",
};
const HW_SECTION: React.CSSProperties = {
  margin: "16px 0 8px",
  alignSelf: "flex-start",
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  fontSize: "clamp(9px, 2.2vw, 11px)",
  color: "rgba(201, 168, 76, 0.7)",
};

// The central screen: a human figure with the central channel (sushumna), the weaving
// ida / pingala side channels crossing at each chakra, the 7 chakra points, the auric egg,
// the Ray of Perception above the crown, the violet lotus over the head and the white-lotus
// Assemblage point behind the back.
function HumanFigure() {
  const ys = FIGURE_NODES.map((n) => n.y);
  const cx = 110;
  const ida = meridianPath(ys, cx, 30, -1);
  const pingala = meridianPath(ys, cx, 30, 1);
  return (
    <svg viewBox="0 0 220 430" width="100%" style={HW_SVG} aria-hidden="true">
      <ellipse cx="110" cy="230" rx="86" ry="205" fill="rgba(138,106,216,0.05)" stroke="rgba(201,168,76,0.18)" />
      <line x1="110" y1="74" x2="110" y2="8" stroke="#ffd27a" strokeWidth="2" strokeDasharray="2 5" opacity="0.7" />
      <circle cx="110" cy="20" r="6" fill="#b58cff" opacity="0.85" />
      <circle cx="110" cy="46" r="20" fill="rgba(231,221,190,0.06)" stroke="rgba(231,221,190,0.4)" />
      <line x1="110" y1="70" x2="110" y2="392" stroke="#ffd27a" strokeWidth="3" opacity="0.85" />
      <path d={ida} fill="none" stroke="#4cc9e0" strokeWidth="2" opacity="0.7" />
      <path d={pingala} fill="none" stroke="#e8843a" strokeWidth="2" opacity="0.7" />
      <circle cx="150" cy="206" r="5" fill="#ffffff" opacity="0.9" />
      {FIGURE_NODES.map((n) => (
        <circle key={n.id} cx="110" cy={n.y} r="9" fill={CHAKRA_HEX[n.id]} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ---- node 1.2: real 3D human energy body (loaded from /assets/human.glb) ---- */

const CAM_HUMAN = { position: [0, 0, 4.3] as [number, number, number], fov: 42 };
const GL_HUMAN = { antialias: true, alpha: true };
const HW_CANVAS_STYLE: React.CSSProperties = {
  width: "100%",
  height: "clamp(260px, 44vh, 360px)",
  margin: "2px 0 0",
  cursor: "grab",
};

// Chakra heights as a fraction of total body height (0 = feet, 1 = crown), id 1..7.
const CHAKRA_F = [0.5, 0.57, 0.65, 0.72, 0.82, 0.93, 1.0];
// Normalised positions of the chakras ALONG the central channel (root -> crown),
// where the weaving side-channels pinch back to the axis.
const BREAKPOINTS = [0, 0.14, 0.3, 0.44, 0.64, 0.86, 1.0];

// One weaving side-channel (ida / pingala): a 3D helix whose radius collapses toward
// the axis at each chakra node and bulges out between them.
function weaveGeometry(yA: number, yB: number, base: number, phase: number, turns: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = yA + (yB - yA) * t;
    let u = 0;
    for (let k = 0; k < BREAKPOINTS.length - 1; k++) {
      if (t >= BREAKPOINTS[k] && t <= BREAKPOINTS[k + 1]) {
        u = (t - BREAKPOINTS[k]) / (BREAKPOINTS[k + 1] - BREAKPOINTS[k]);
        break;
      }
    }
    const radius = base * (0.16 + 0.84 * Math.sin(Math.PI * u));
    const ang = phase + t * Math.PI * turns;
    pts.push(new THREE.Vector3(radius * Math.cos(ang), y, radius * Math.sin(ang)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 220, 0.012, 8, false);
}

// The .glb body: cloned, re-skinned with a translucent glowing "energy" material,
// auto-centered and auto-scaled so the feet sit at y=0 and the crown at y=height.
function HumanModel({ height }: { height: number }) {
  const gltf = useGLTF("/assets/human.glb") as any;
  const energyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x9fb4ff),
        emissive: new THREE.Color(0x4657cc),
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.34,
        roughness: 0.35,
        metalness: 0.0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  const fit = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((o: any) => {
      if (o.isMesh) o.material = energyMat;
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const h = size.y || 1;
    return { cloned: c, s: height / h, cx: center.x, cz: center.z, minY: box.min.y };
  }, [gltf, energyMat, height]);
  return (
    <group scale={fit.s}>
      <group position={[-fit.cx, -fit.minY, -fit.cz]}>
        <primitive object={fit.cloned} />
      </group>
    </group>
  );
}

function EnergyChannels({ height }: { height: number }) {
  const yRoot = 0.5 * height;
  const yCrown = 1.0 * height;
  const ida = useMemo(() => weaveGeometry(yRoot, yCrown, 0.17, 0, 5), [yRoot, yCrown]);
  const pingala = useMemo(() => weaveGeometry(yRoot, yCrown, 0.17, Math.PI, 5), [yRoot, yCrown]);
  const len = yCrown - yRoot;
  const midY = (yRoot + yCrown) / 2;
  return (
    <group>
      <mesh position={[0, midY, 0]}>
        <cylinderGeometry args={[0.014, 0.014, len, 14]} />
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh position={[0, midY, 0]}>
        <cylinderGeometry args={[0.045, 0.045, len, 14]} />
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh geometry={ida}>
        <meshBasicMaterial color={0x4cc9e0} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh geometry={pingala}>
        <meshBasicMaterial color={0xe8843a} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ChakraPoints({ height }: { height: number }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const g = refs.current[i];
      if (g) g.scale.setScalar(1 + 0.12 * Math.sin(t * 1.6 + i * 0.7));
    }
  });
  return (
    <group>
      {CHAKRA_F.map((f, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0, f * height, 0.05]}
        >
          <mesh>
            <sphereGeometry args={[0.052, 20, 20]} />
            <meshBasicMaterial color={CHAKRA_HEX[i + 1]} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshBasicMaterial color={CHAKRA_HEX[i + 1]} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function AuricEgg({ height }: { height: number }) {
  return (
    <mesh position={[0, height * 0.52, 0]} scale={[height * 0.32, height * 0.56, height * 0.32]}>
      <sphereGeometry args={[1, 40, 40]} />
      <meshBasicMaterial color={0x8a6ad8} transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// A single poloidal field line of the toroidal field: an ellipse in a meridian plane that
// passes through the central axis at the crown & feet, rotated around Y to form the full torus.
function fieldLineGeometry(cy: number, A: number, B: number, phi: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2;
    const mx = A * Math.sin(th);
    const y = cy + B * Math.cos(th);
    pts.push(new THREE.Vector3(mx * Math.cos(phi), y, mx * Math.sin(phi)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  return new THREE.TubeGeometry(curve, 130, 0.008, 6, true);
}

// The toroidal field that passes THROUGH the figure: energy enters the crown, flows down the
// central axis and loops back up the outside -- the human as a toroidal electromagnetic body.
function TorusField({ height }: { height: number }) {
  const grp = useRef<THREE.Group>(null!);
  const lines = useMemo(() => {
    const cy = 0.5 * height;
    const A = 0.36 * height;
    const B = 0.5 * height;
    const N = 16;
    const arr: THREE.TubeGeometry[] = [];
    for (let i = 0; i < N; i++) arr.push(fieldLineGeometry(cy, A, B, (i / N) * Math.PI * 2));
    return arr;
  }, [height]);
  const ring = useMemo(() => new THREE.TorusGeometry(0.36 * height, 0.008, 8, 90), [height]);
  useFrame((s, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.22;
  });
  return (
    <group ref={grp}>
      {lines.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={0x6ad8c8} transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <mesh geometry={ring} rotation-x={Math.PI / 2} position={[0, 0.5 * height, 0]}>
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function HumanScene() {
  const H = 2.4;
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color={0xcdd8ff} />
      <directionalLight position={[-3, 2, -4]} intensity={0.8} color={0x8a6ad8} />
      <group position={[0, -H / 2, 0]}>
        <React.Suspense fallback={null}>
          <HumanModel height={H} />
        </React.Suspense>
        <AuricEgg height={H} />
        <EnergyChannels height={H} />
        <ChakraPoints height={H} />
        <React.Suspense fallback={null}>
          <TorusModel height={H} />
        </React.Suspense>
        <mesh position={[0, H * 1.18, 0]}>
          <cylinderGeometry args={[0.006, 0.02, H * 0.36, 10]} />
          <meshBasicMaterial color={0xffd27a} transparent opacity={0.45} depthWrite={false} />
        </mesh>
        <mesh position={[0, H * 1.02, 0]}>
          <sphereGeometry args={[0.05, 18, 18]} />
          <meshBasicMaterial color={0xb58cff} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, H * 0.72, -0.2]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.9} />
        </mesh>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={0.55}
        maxPolarAngle={2.5}
        target={[0, 0, 0]}
      />
    </>
  );
}

function HumanFigure3D() {
  return (
    <div style={HW_CANVAS_STYLE}>
      <Canvas dpr={[1, 2]} camera={CAM_HUMAN} gl={GL_HUMAN}>
        <HumanScene />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/human.glb");
useGLTF.preload("/assets/tree.glb");
useGLTF.preload("/assets/crystal.glb");
useGLTF.preload("/assets/tor.glb");

// Loads a .glb, clones it, fits its vertical extent to targetY and sits its base at y=0,
// centered on the X/Z axis. Used for the generated tree & crystal models.
function FittedModel({ url, targetY }: { url: string; targetY: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = targetY / (size.y || 1);
    clone.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(clone);
    const c = new THREE.Vector3();
    box2.getCenter(c);
    clone.position.x -= c.x;
    clone.position.z -= c.z;
    clone.position.y -= box2.min.y;
    return clone;
  }, [scene, targetY]);
  return <primitive object={obj} />;
}

// Loads the toroidal-field model, fits its diameter to ~body width and spins it slowly
// around the central axis at mid-body height -- the torus passing THROUGH the figure.
function TorusModel({ height }: { height: number }) {
  const { scene } = useGLTF("/assets/tor.glb");
  const grp = useRef<THREE.Group>(null!);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxXZ = Math.max(size.x, size.z) || 1;
    const s = (height * 0.95) / maxXZ;
    clone.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(clone);
    const c = new THREE.Vector3();
    box2.getCenter(c);
    clone.position.sub(c);
    return clone;
  }, [scene, height]);
  useFrame((s, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.22;
  });
  return (
    <group ref={grp} position={[0, height * 0.5, 0]}>
      <primitive object={obj} />
    </group>
  );
}

/* ---- node 1.23 LEFT "Chelovek-Drevo": tree-of-life energy body (tree + subtle bodies + chakras) ---- */

// A curved limb (branch going up / root going down), splaying outward from the trunk.
function branchGeometry(baseY: number, ang: number, len: number, up: number, spread: number, radius: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const r = spread * Math.pow(t, 1.25);
    const y = baseY + up * len * t;
    pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 26, radius, 6, false);
}

function TreeForm({ height }: { height: number }) {
  const trunkLen = height * 0.96;
  const branches = useMemo(() => {
    const arr: THREE.TubeGeometry[] = [];
    const M = 6;
    for (let i = 0; i < M; i++) arr.push(branchGeometry(height * 0.84, (i / M) * Math.PI * 2, height * 0.46, 1, height * 0.34, 0.016));
    return arr;
  }, [height]);
  const roots = useMemo(() => {
    const arr: THREE.TubeGeometry[] = [];
    const M = 6;
    for (let i = 0; i < M; i++) arr.push(branchGeometry(height * 0.05, ((i + 0.5) / M) * Math.PI * 2, height * 0.32, -1, height * 0.3, 0.02));
    return arr;
  }, [height]);
  return (
    <group>
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.09, trunkLen, 16]} />
        <meshStandardMaterial color={0x9b7ad8} emissive={0x4657cc} emissiveIntensity={0.5} transparent opacity={0.55} roughness={0.4} depthWrite={false} />
      </mesh>
      {branches.map((g, i) => (
        <mesh key={"b" + i} geometry={g}>
          <meshBasicMaterial color={0xb58cff} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {roots.map((g, i) => (
        <mesh key={"r" + i} geometry={g}>
          <meshBasicMaterial color={0xc9a84c} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

const SUBTLE_SHELL_HEX = [0x9aa0a8, 0x6ad8c8, 0x4cc9e0, 0x6a78d8, 0xb58cff, 0xffd27a, 0xffffff];
const SUBTLE_SHELL_HEX_CSS = ["#9aa0a8", "#6ad8c8", "#4cc9e0", "#6a78d8", "#b58cff", "#ffd27a", "#ffffff"];

// Nested auric shells -- the layered subtle bodies (physical -> atmanic) around the tree.
function SubtleShells({ height }: { height: number }) {
  return (
    <group position={[0, height * 0.52, 0]}>
      {SUBTLE_SHELL_HEX.map((c, i) => {
        const s = 0.2 + i * 0.05;
        return (
          <mesh key={i} scale={[height * s, height * (s + 0.2), height * s]}>
            <sphereGeometry args={[1, 28, 28]} />
            <meshBasicMaterial color={c} transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
}

const TREE_CHAKRA_F = [0.1, 0.22, 0.36, 0.52, 0.68, 0.84, 0.97];
function TreeChakras({ height }: { height: number }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const g = refs.current[i];
      if (g) g.scale.setScalar(1 + 0.12 * Math.sin(t * 1.6 + i * 0.7));
    }
  });
  return (
    <group>
      {TREE_CHAKRA_F.map((f, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[0, f * height, 0.02]}>
          <mesh>
            <sphereGeometry args={[0.05, 18, 18]} />
            <meshBasicMaterial color={CHAKRA_HEX[i + 1]} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.1, 18, 18]} />
            <meshBasicMaterial color={CHAKRA_HEX[i + 1]} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function TreeScene() {
  const H = 2.4;
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color={0xcdd8ff} />
      <directionalLight position={[-3, 2, -4]} intensity={0.7} color={0x8a6ad8} />
      <group position={[0, -H / 2, 0]}>
        <React.Suspense fallback={null}>
          <FittedModel url="/assets/tree.glb" targetY={H} />
        </React.Suspense>
        <SubtleShells height={H} />
        <TreeChakras height={H} />
      </group>
      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.6} minPolarAngle={0.5} maxPolarAngle={2.5} target={[0, 0, 0]} />
    </>
  );
}

function TreeFigure3D() {
  return (
    <div style={HW_CANVAS_STYLE}>
      <Canvas dpr={[1, 2]} camera={CAM_HUMAN} gl={GL_HUMAN}>
        <TreeScene />
      </Canvas>
    </div>
  );
}

/* ---- node 1.23 RIGHT "Kristall + 9 mernost": crystalline 4th body + the 9-Meras column ---- */

function CrystalBody({ height }: { height: number }) {
  const grp = useRef<THREE.Group>(null!);
  useFrame((s, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.4;
  });
  return (
    <group ref={grp} position={[0, height * 0.5, 0]} scale={[height * 0.32, height * 0.6, height * 0.32]}>
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={0x9fd8ff} emissive={0x3a78c0} emissiveIntensity={0.45} transparent opacity={0.2} roughness={0.15} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[1.002, 0]} />
        <meshBasicMaterial color={0xbfe6ff} wireframe transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
}

const MERA_F = [0.08, 0.16, 0.24, 0.38, 0.5, 0.62, 0.78, 0.88, 0.98];
function MeraColumn({ height }: { height: number }) {
  const dims = (dims9Data.dimensions as any[]);
  return (
    <group>
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.009, 0.009, height, 10]} />
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {dims.map((d, i) => (
        <group key={i} position={[0, (MERA_F[i] ?? 0.5) * height, 0]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={d.color} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CrystalScene() {
  const H = 2.4;
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color={0xcdd8ff} />
      <directionalLight position={[-3, 2, -4]} intensity={0.7} color={0x8a6ad8} />
      <group position={[0, -H / 2, 0]}>
        <React.Suspense fallback={null}>
          <FittedModel url="/assets/crystal.glb" targetY={H * 0.62} />
        </React.Suspense>
        <MeraColumn height={H} />
        <mesh position={[0, H * 1.14, 0]}>
          <cylinderGeometry args={[0.006, 0.02, H * 0.34, 10]} />
          <meshBasicMaterial color={0xffd27a} transparent opacity={0.5} depthWrite={false} />
        </mesh>
        <mesh position={[0, H * 1.0, 0]}>
          <sphereGeometry args={[0.05, 18, 18]} />
          <meshBasicMaterial color={0xb58cff} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, H * 0.7, -0.24]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.9} />
        </mesh>
      </group>
      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.6} minPolarAngle={0.5} maxPolarAngle={2.5} target={[0, 0, 0]} />
    </>
  );
}

function CrystalFigure3D() {
  return (
    <div style={HW_CANVAS_STYLE}>
      <Canvas dpr={[1, 2]} camera={CAM_HUMAN} gl={GL_HUMAN}>
        <CrystalScene />
      </Canvas>
    </div>
  );
}

const CAM_CHATURA = { position: [0, 0.5, 5.6] as [number, number, number], fov: 50 };

// Node 1.1 -- Chatura-Loka: the four-layered cosmic Egg of differing density / transparency,
// with Ra glowing at the center and the Great Lotos of Slavi above, beyond the shell.
const CHATURA_R = [0.42, 0.72, 1.02, 1.32];
const CHATURA_HEX = [0x2a2a2e, 0x7a3b34, 0x2f9e8f, 0xc9a84c];
const CHATURA_OP = [0.3, 0.24, 0.18, 0.12];

// Smoothly lerps the whole egg's scale so selecting a layer feels like diving inward.
function DiveGroup({ targetScale, children }: { targetScale: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (ref.current) {
      const s = ref.current.scale.x + (targetScale - ref.current.scale.x) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });
  return <group ref={ref}>{children}</group>;
}

function EggShell({ index, r, color, baseOpacity, faded, onSelect }: { index: number; r: number; color: number; baseOpacity: number; faded: boolean; onSelect: (i: number) => void }) {
  const fillRef = useRef<THREE.MeshStandardMaterial>(null!);
  const wireRef = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(() => {
    const tFill = faded ? baseOpacity * 0.05 : baseOpacity;
    const tWire = faded ? 0.02 : 0.13;
    if (fillRef.current) fillRef.current.opacity += (tFill - fillRef.current.opacity) * 0.12;
    if (wireRef.current) wireRef.current.opacity += (tWire - wireRef.current.opacity) * 0.12;
  });
  const onClick = (e: any) => {
    e.stopPropagation();
    onSelect(index);
  };
  return (
    <group scale={[r, r * 1.32, r]}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial ref={fillRef} color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={baseOpacity} roughness={0.4} metalness={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.003, 26, 26]} />
        <meshBasicMaterial ref={wireRef} color={color} wireframe transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

function RaCore() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((s) => {
    if (ref.current) ref.current.scale.setScalar(1 + 0.06 * Math.sin(s.clock.elapsedTime * 1.5));
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color={0xfff0c0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshBasicMaterial color={0xffb84a} transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// Vertical Monadic channels: Ra's rays rising from the core through all layers up to Slavi.
function RaChannels({ top }: { top: number }) {
  const offs = useMemo(() => {
    const arr: Array<[number, number]> = [];
    const N = 10;
    for (let i = 0; i < N; i++) arr.push([Math.cos((i / N) * Math.PI * 2) * 0.07, Math.sin((i / N) * Math.PI * 2) * 0.07]);
    return arr;
  }, []);
  return (
    <group>
      <mesh position={[0, top * 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.05, top, 12]} />
        <meshBasicMaterial color={0xffd27a} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {offs.map(([x, z], i) => (
        <mesh key={i} position={[x, top * 0.5, z]}>
          <cylinderGeometry args={[0.004, 0.004, top, 6]} />
          <meshBasicMaterial color={0xfff0c0} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// Slavi -- the Great Lotos beyond the egg (above the top), a flower-world of Light.
function SlaviLotos({ y }: { y: number }) {
  const petals = useMemo(() => {
    const arr: number[] = [];
    const N = 8;
    for (let i = 0; i < N; i++) arr.push((i / N) * Math.PI * 2);
    return arr;
  }, []);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      {petals.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16]} rotation={[Math.PI / 2.4, a, 0]}>
          <coneGeometry args={[0.07, 0.24, 8]} />
          <meshStandardMaterial color={0xb58cff} emissive={0x8a6ad8} emissiveIntensity={0.6} transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial color={0xc9b0ff} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ChaturLokaScene({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) {
  const topY = CHATURA_R[3] * 1.32 + 0.55;
  const targetScale = selected == null ? 1 : 1.55 / CHATURA_R[selected];
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color={0xffd27a} distance={8} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} color={0xcdd8ff} />
      {/* Real cosmos behind the egg -- a field of distant stars (stays fixed, does not dive). */}
      <BackgroundStars count={1800} colorHex={"#bcd0ff"} />
      <DiveGroup targetScale={targetScale}>
        <RaChannels top={topY} />
        <RaCore />
        {CHATURA_R.map((r, i) => (
          <EggShell key={i} index={i} r={r} color={CHATURA_HEX[i]} baseOpacity={CHATURA_OP[i]} faded={selected != null && i > selected} onSelect={onSelect} />
        ))}
        <SlaviLotos y={topY} />
      </DiveGroup>
      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.35} minPolarAngle={0.35} maxPolarAngle={2.65} target={[0, 0, 0]} />
    </>
  );
}

/* ===== Chatura-Loka full-screen "universe" UI ===== */
const CL_CANVAS_STYLE: React.CSSProperties = { width: "100%", height: "100%", display: "block" };
const CL_WRAP: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 6 };
const CL_CANVAS_WRAP: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(circle at 50% 42%, #07070f 0%, #04040a 70%, #020207 100%)",
};
const CL_TOPBAR: React.CSSProperties = { position: "absolute", top: 16, left: 20, pointerEvents: "none", zIndex: 8 };
const CL_TITLE: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "0.04em", color: "#f4ecd6" };
const CL_KICKER: React.CSSProperties = { margin: "3px 0 0", fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c" };
const CL_RAIL: React.CSSProperties = { position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 8 };
const CL_CHIP: React.CSSProperties = { display: "flex", alignItems: "center", gap: 9, padding: "8px 13px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(10,10,20,0.5)", color: "#e3ddcd", fontSize: 13, cursor: "pointer", backdropFilter: "blur(6px)", textAlign: "left", minWidth: 150 };
const CL_CHIP_DOT: React.CSSProperties = { width: 12, height: 12, borderRadius: "50%", flex: "0 0 auto" };
const CL_DESC: React.CSSProperties = { position: "absolute", left: 20, bottom: 26, maxWidth: 380, padding: "16px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(8,8,16,0.64)", backdropFilter: "blur(8px)", zIndex: 8 };
const CL_DESC_NAME: React.CSSProperties = { margin: "0 0 7px", fontSize: 16, fontWeight: 600, color: "#f4ecd6" };
const CL_DESC_BODY: React.CSSProperties = { margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#cec7b7" };
const CL_BACK: React.CSSProperties = { marginTop: 13, padding: "6px 13px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.13)", color: "#e8d9a8", fontSize: 12.5, cursor: "pointer" };
const CL_HINT: React.CSSProperties = { position: "absolute", bottom: 26, right: 18, maxWidth: 210, fontSize: 11, letterSpacing: "0.05em", lineHeight: 1.5, textAlign: "right", color: "rgba(220,220,235,0.45)", zIndex: 8, pointerEvents: "none" };

type CLView = number | "overview" | "ra" | "slavi";

function ChaturLokaWindow({ panelRef }: { panelRef: React.RefObject<HTMLDivElement> }) {
  const C = chaturaData as any;
  const layers = C.layers as any[];
  const [view, setView] = useState<CLView>("overview");
  const selected = typeof view === "number" ? view : null;
  const onSelectLayer = useCallback((i: number) => setView(i), []);

  // The separate description panel reflects the current focus (overview / a layer / Ra / Slavi).
  let descName = C.title as string;
  let descBody = C.lead as string;
  if (typeof view === "number") {
    const l = layers[view];
    descName = l.n + ". " + l.name + "  \u00b7  " + l.density;
    descBody = l.ru;
  } else if (view === "ra") {
    descName = C.center.name;
    descBody = C.center.note;
  } else if (view === "slavi") {
    descName = C.slavi.name;
    descBody = C.slavi.note;
  }

  const chip = (active: boolean, hex: string) => {
    const s: React.CSSProperties = { ...CL_CHIP };
    if (active) {
      s.border = "1px solid rgba(201,168,76,0.7)";
      s.background = "rgba(201,168,76,0.18)";
      s.color = "#f4ecd6";
    }
    const dot: React.CSSProperties = { ...CL_CHIP_DOT, background: hex };
    return { s, dot };
  };

  const raChip = chip(view === "ra", "#ffd27a");
  const slaviChip = chip(view === "slavi", "#c9b0ff");

  return (
    <div ref={panelRef} style={CL_WRAP}>
      <div style={CL_CANVAS_WRAP}>
        <Canvas dpr={[1, 2]} camera={CAM_CHATURA} gl={GL_HUMAN} style={CL_CANVAS_STYLE}>
          <ChaturLokaScene selected={selected} onSelect={onSelectLayer} />
        </Canvas>
      </div>

      <div style={CL_TOPBAR}>
        <p style={CL_TITLE}>{C.title}</p>
        <p style={CL_KICKER}>{C.kicker}</p>
      </div>

      <div style={CL_RAIL}>
        <button type="button" style={slaviChip.s} onClick={() => setView("slavi")}>
          <span style={slaviChip.dot} />
          {C.slavi.name}
        </button>
        {layers.slice().reverse().map((l) => {
          const i = l.n - 1;
          const c = chip(view === i, l.color);
          return (
            <button key={i} type="button" style={c.s} onClick={() => onSelectLayer(i)}>
              <span style={c.dot} />
              {l.n + ". " + l.name}
            </button>
          );
        })}
        <button type="button" style={raChip.s} onClick={() => setView("ra")}>
          <span style={raChip.dot} />
          {C.center.name}
        </button>
      </div>

      <div style={CL_DESC}>
        <p style={CL_DESC_NAME}>{descName}</p>
        <p style={CL_DESC_BODY}>{descBody}</p>
        {view !== "overview" && (
          <button type="button" style={CL_BACK} onClick={() => setView("overview")}>
            {"\u2190 \u041d\u0430\u0440\u0443\u0436\u0443"}
          </button>
        )}
      </div>

      <p style={CL_HINT}>{"\u0412\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u2014 \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u043d\u0438\u0435\u043c. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u0441\u043b\u043e\u0439, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u043d\u0438\u043a\u043d\u0443\u0442\u044c \u0432\u043d\u0443\u0442\u0440\u044c."}</p>
    </div>
  );
}

const CAM_VEDIC = { position: [0, 0, 11] as [number, number, number], fov: 48 };
const VEDIC_Y = [4.5, 3.8, 3.1, 2.4, 1.7, 1.0, 0.3, -0.5, -1.1, -1.7, -2.3, -2.9, -3.5, -4.1];
const VEDIC_R = [0.35, 0.45, 0.55, 0.7, 0.85, 1.0, 1.3, 0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.38];
// Bhur-loka (id 7) -- the player's home world (Earth). Marked with a steady white ring.
const VEDIC_HOME_ID = 7;

// --- Cinematic upgrades (node 1.4): nebula sky, deep stars, Ra corona/rays, Meru light-flow ---
const VEDIC_NEBULA_VERT = `
  varying vec3 vDir;
  void main(){
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const VEDIC_NEBULA_FRAG = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec3 vDir;
  float hash(vec3 q){ return fract(sin(dot(q, vec3(17.1, 113.5, 1.7))) * 43758.5453); }
  float vnoise(vec3 q){
    vec3 i = floor(q);
    vec3 f = fract(q);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
  }
  float fbm(vec3 p){
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 5; i++){
      v += a * vnoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
  void main(){
    vec3 d = normalize(vDir);
    float t = uTime * 0.015;
    float n1 = fbm(d * 2.2 + vec3(t, 0.0, -t));
    float n2 = fbm(d * 4.6 + vec3(-t, t, 0.0) + n1);
    float clouds = pow(clamp(n1 * 0.7 + n2 * 0.5, 0.0, 1.0), 1.7);
    float band = smoothstep(0.0, 0.78, abs(d.y));
    vec3 col = mix(uColorA, uColorB, clouds);
    col = mix(col, uColorC, band * 0.5);
    float a = clouds * 0.55 + 0.06;
    gl_FragColor = vec4(col, a);
  }
`;

// A deep, slowly drifting nebula sky-dome -- the "\u043a\u043e\u0441\u043c\u043e\u0444\u043e\u043d" behind the Lokas.
function VedicNebula({ tint }: { tint: string }) {
	const tintCol = useMemo(() => new THREE.Color(tint), [tint]);
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColorA: { value: new THREE.Color("#05050e") },
			uColorB: { value: new THREE.Color("#2a1c52") },
			uColorC: { value: new THREE.Color(tint) },
		}),
		[]
	);
	useFrame((s) => {
		uniforms.uTime.value = s.clock.elapsedTime;
		uniforms.uColorC.value.copy(tintCol);
	});
	return (
		<mesh renderOrder={-20} scale={46}>
			<sphereGeometry args={[1, 36, 24]} />
			<shaderMaterial vertexShader={VEDIC_NEBULA_VERT} fragmentShader={VEDIC_NEBULA_FRAG} uniforms={uniforms} side={THREE.BackSide} transparent depthWrite={false} />
		</mesh>
	);
}

// Thin radiant blades streaming from Ra -- the sun's corona rays.
function RaSunRays({ count, color }: { count: number; color: string }) {
	const grp = useRef<THREE.Group>(null);
	useFrame((_, dt) => { if (grp.current) grp.current.rotation.z += dt * 0.05; });
	const angles = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);
	return (
		<group ref={grp}>
			{angles.map((a, i) => (
				<mesh key={i} position={[-Math.sin(a) * 0.62, Math.cos(a) * 0.62, 0]} rotation={[0, 0, a]}>
					<planeGeometry args={[0.02, 0.95]} />
					<meshBasicMaterial color={i % 2 ? color : "#fff6da"} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
				</mesh>
			))}
		</group>
	);
}

// Ra-core corona: a layered golden sun with a breathing halo + turning sun-rays.
function RaCorona() {
	const halo = useRef<THREE.Mesh>(null);
	useFrame((s) => {
		const t = s.clock.elapsedTime;
		if (halo.current) halo.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08);
	});
	return (
		<group>
			<mesh>
				<sphereGeometry args={[0.34, 32, 32]} />
				<meshBasicMaterial color={"#fff6da"} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
			<mesh ref={halo}>
				<sphereGeometry args={[0.6, 32, 32]} />
				<meshBasicMaterial color={"#ffd27a"} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
			<mesh>
				<sphereGeometry args={[0.98, 32, 32]} />
				<meshBasicMaterial color={"#ffb24a"} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
			<RaSunRays count={28} color={"#ffd27a"} />
		</group>
	);
}

// A stream of light motes rising and falling along the Meru axis (\u0432\u0432\u0435\u0440\u0445/\u0432\u043d\u0438\u0437).
function MeruLightFlow({ count }: { count: number }) {
	const H = 4.8;
	const makeGeo = () => {
		const arr = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			const th = Math.random() * Math.PI * 2;
			const rr = 0.04 + Math.random() * 0.16;
			arr[i * 3] = Math.cos(th) * rr;
			arr[i * 3 + 1] = (Math.random() * 2 - 1) * H;
			arr[i * 3 + 2] = Math.sin(th) * rr;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
		return g;
	};
	const upGeo = useMemo(makeGeo, [count]);
	const downGeo = useMemo(makeGeo, [count]);
	useFrame((_, dt) => {
		const ua = upGeo.getAttribute("position") as THREE.BufferAttribute;
		const uarr = ua.array as Float32Array;
		for (let i = 0; i < count; i++) {
			uarr[i * 3 + 1] += dt * (0.7 + (i % 5) * 0.1);
			if (uarr[i * 3 + 1] > H) uarr[i * 3 + 1] = -H;
		}
		ua.needsUpdate = true;
		const da = downGeo.getAttribute("position") as THREE.BufferAttribute;
		const darr = da.array as Float32Array;
		for (let i = 0; i < count; i++) {
			darr[i * 3 + 1] -= dt * (0.55 + (i % 5) * 0.08);
			if (darr[i * 3 + 1] < -H) darr[i * 3 + 1] = H;
		}
		da.needsUpdate = true;
	});
	return (
		<group>
			<points geometry={upGeo}>
				<pointsMaterial size={0.055} color={"#ffe6a0"} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
			</points>
			<points geometry={downGeo}>
				<pointsMaterial size={0.04} color={"#9fd8ff"} sizeAttenuation transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
			</points>
		</group>
	);
}

function VedicFocusGroup({ focus, children }: { focus: number | null; children: React.ReactNode }) {
	const ref = useRef<THREE.Group>(null);
	const sRef = useRef(1);
	useFrame(() => {
		const g = ref.current;
		if (!g) return;
		const targetS = focus == null ? 1 : 1.85;
		sRef.current = THREE.MathUtils.lerp(sRef.current, targetS, 0.07);
		g.scale.setScalar(sRef.current);
		const targetY = focus == null ? -0.2 : -sRef.current * VEDIC_Y[focus];
		g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.09);
	});
	return <group ref={ref}>{children}</group>;
}

function LokaDisk({ index, y, r, color, name, isEarth, isHome, isToday, level, faded, selected, onSelect }: { index: number; y: number; r: number; color: string; name: string; isEarth: boolean; isHome: boolean; isToday: boolean; level: number; faded: boolean; selected: boolean; onSelect: (i: number) => void }) {
	const spin = useRef<THREE.Group>(null);
	const faceRef = useRef<THREE.MeshStandardMaterial>(null);
	const glowRef = useRef<THREE.MeshBasicMaterial>(null);
	const edgeRef = useRef<THREE.MeshBasicMaterial>(null);
	const beadRef = useRef<THREE.MeshBasicMaterial>(null);
	const auraRef = useRef<THREE.Mesh>(null);
	const phase = useRef(index * 0.7);
	const lbl = useMemo(() => makeLabelTexture(name), [name]);
	const lvl = Math.max(0, Math.min(9, level)) / 9;
	useFrame((_, dt) => {
		phase.current += dt;
		const p = 0.5 + 0.5 * Math.sin(phase.current * 1.2);
		const tp = 0.5 + 0.5 * Math.sin(phase.current * 2.4);
		if (spin.current) spin.current.rotation.y += dt * (isEarth ? 0.05 : 0.11);
		const boost = isToday ? 1.5 : 1;
		const faceO = faded ? 0.12 : selected ? 0.92 : (0.66 + 0.26 * lvl);
		const glowO = faded ? 0.04 : (selected ? 0.26 : 0.1 + 0.16 * lvl) * (0.7 + 0.3 * p) * boost;
		const edgeO = faded ? 0.06 : (selected ? 0.75 : 0.38 + 0.3 * lvl);
		const beadO = faded ? 0.1 : (selected ? 0.95 : 0.5 + 0.4 * lvl) * (0.6 + 0.4 * p);
		if (faceRef.current) faceRef.current.opacity = THREE.MathUtils.lerp(faceRef.current.opacity, faceO, 0.1);
		if (glowRef.current) glowRef.current.opacity = THREE.MathUtils.lerp(glowRef.current.opacity, glowO, 0.1);
		if (edgeRef.current) edgeRef.current.opacity = THREE.MathUtils.lerp(edgeRef.current.opacity, edgeO, 0.1);
		if (beadRef.current) beadRef.current.opacity = THREE.MathUtils.lerp(beadRef.current.opacity, beadO, 0.1);
		if (auraRef.current) auraRef.current.scale.setScalar(1 + (isToday ? 0.12 * tp : 0));
	});
	const handleClick = (e: any) => { e.stopPropagation(); onSelect(index); };
	return (
		<group position={[0, y, 0]}>
			<group ref={spin}>
				<mesh onClick={handleClick}>
					<cylinderGeometry args={[r, r, isEarth ? 0.1 : 0.05, 64]} />
					<meshStandardMaterial ref={faceRef} color={color} emissive={color} emissiveIntensity={0.5} metalness={0.3} roughness={0.4} transparent opacity={0.7} side={THREE.DoubleSide} />
				</mesh>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<ringGeometry args={[r * 0.96, r * 1.5, 80]} />
					<meshBasicMaterial ref={glowRef} color={color} transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
				</mesh>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[r, 0.014, 12, 96]} />
					<meshBasicMaterial ref={edgeRef} color={color} transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
				<mesh>
					<sphereGeometry args={[isEarth ? 0.09 : 0.06, 18, 18]} />
					<meshBasicMaterial ref={beadRef} color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
			</group>
			{!faded && (
				<group>
					<mesh>
						<sphereGeometry args={[r * 0.92, 24, 24]} />
						<meshBasicMaterial color={color} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
					</mesh>
					<mesh>
						<sphereGeometry args={[r * 1.3, 24, 24]} />
						<meshBasicMaterial color={color} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
					</mesh>
				</group>
			)}
			{isToday && (
				<mesh ref={auraRef} rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[r * 1.62, 0.02, 12, 96]} />
					<meshBasicMaterial color={"#ffe6a0"} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
			)}
			{isHome && (
				<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
					<torusGeometry args={[r * 1.33, 0.016, 10, 96]} />
					<meshBasicMaterial color={"#ffffff"} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
			)}
			{!faded && (
				<sprite position={[r + 0.5, 0, 0]} scale={[lbl.w * ((selected || isHome || isToday) ? 0.0056 : 0.004), lbl.h * ((selected || isHome || isToday) ? 0.0056 : 0.004), 1]}>
					<spriteMaterial map={lbl.tex} transparent depthWrite={false} opacity={selected || isHome || isToday ? 1 : 0.66} />
				</sprite>
			)}
		</group>
	);
}

function VedicDust() {
	const ref = useRef<THREE.Points>(null);
	const geo = useMemo(() => {
		const n = 280;
		const arr = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const rr = 1.4 + Math.random() * 6.2;
			const th = Math.random() * Math.PI * 2;
			arr[i * 3] = Math.cos(th) * rr;
			arr[i * 3 + 1] = (Math.random() - 0.5) * 10.5;
			arr[i * 3 + 2] = Math.sin(th) * rr;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
		return g;
	}, []);
	useFrame((_, dt) => {
		if (ref.current) ref.current.rotation.y += dt * 0.018;
	});
	return (
		<points ref={ref} geometry={geo}>
			<pointsMaterial size={0.045} color={"#cfe0ff"} transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}

function VedicCosmosScene({ selected, onSelect, tier, homeIdx, todayIdx, levels }: { selected: number | null; onSelect: (i: number) => void; tier: number; homeIdx: number; todayIdx: number; levels: Record<number, number> }) {
	const lokas = (vedicData as any).lokas as Array<any>;
	// Atmosphere shifts with the tier: overview (0) = neutral cosmos,
	// upper (+1) = bright celestial light from above (gods & heavens),
	// lower (-1) = dense infernal red glow from below (toward the hells).
	const A = tier === 1
		? { fogC: "#0a1230", fogN: 9, fogF: 36, amb: 0.82, ptC: "#fff0c8", ptI: 1.35, ptX: 0, ptY: 5.5, ptZ: 3, d1C: "#ffffff", d2C: "#a9c8ff", starC: "#e8eeff", starN: 2200, nebula: "#1f3a72", starDeep: "#aebfff" }
		: tier === -1
			? { fogC: "#170405", fogN: 6, fogF: 22, amb: 0.3, ptC: "#ff5a22", ptI: 2.6, ptX: 0, ptY: -5.5, ptZ: 2, d1C: "#ff8a4a", d2C: "#7a1d0d", starC: "#ff7a44", starN: 1100, nebula: "#3a0c0c", starDeep: "#ff9a6a" }
			: { fogC: "#04040a", fogN: 8, fogF: 30, amb: 0.5, ptC: "#ffd27a", ptI: 2.0, ptX: 0, ptY: 0.3, ptZ: 0, d1C: "#cdd8ff", d2C: "#8a6ad8", starC: "#bcd0ff", starN: 1800, nebula: "#2a1c52", starDeep: "#7e8fd8" };
	return (
		<>
			<fog attach="fog" args={[A.fogC, A.fogN, A.fogF]} />
			<ambientLight intensity={A.amb} />
			<pointLight position={[A.ptX, A.ptY, A.ptZ]} intensity={A.ptI} color={A.ptC} distance={16} decay={1.6} />
			<directionalLight position={[4, 5, 6]} intensity={0.6} color={A.d1C} />
			<directionalLight position={[-5, -3, -4]} intensity={0.35} color={A.d2C} />
			<VedicNebula tint={A.nebula} />
			<BackgroundStars count={A.starN} colorHex={A.starC} />
			<BackgroundStars count={Math.round(A.starN * 0.55)} colorHex={A.starDeep} />
			<VedicDust />
			<VedicFocusGroup focus={selected}>
				<mesh>
					<cylinderGeometry args={[0.018, 0.018, 9.6, 8]} />
					<meshBasicMaterial color={"#ffe6b0"} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
				<mesh>
					<cylinderGeometry args={[0.07, 0.07, 9.6, 14]} />
					<meshBasicMaterial color={"#ffd27a"} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
				</mesh>
				<RaCore />
				<RaCorona />
				<MeruLightFlow count={120} />
				{lokas.map((l, i) => (
				<LokaDisk key={l.id} index={i} y={VEDIC_Y[i]} r={VEDIC_R[i]} color={l.color} name={l.name} isEarth={l.tier === "earth"} isHome={i === homeIdx} isToday={i === todayIdx} level={levels[i] != null ? levels[i] : 0} faded={(selected != null && i !== selected) || (tier !== 0 && !vlInTier(l, tier))} selected={selected === i} onSelect={onSelect} />
				))}
			</VedicFocusGroup>
			<OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.25} minDistance={3.5} maxDistance={20} minPolarAngle={0.35} maxPolarAngle={2.7} />
		</>
	);
}

const VL_RAIL: React.CSSProperties = { position: "absolute", top: 52, right: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 9, maxHeight: "80%", overflowY: "auto", padding: 8, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(8,8,16,0.72)", backdropFilter: "blur(8px)" };
const VL_MENU_BTN: React.CSSProperties = { position: "absolute", top: 16, right: 16, zIndex: 10, padding: "8px 13px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.45)", background: "rgba(10,10,20,0.62)", color: "#e3ddcd", fontSize: 12.5, cursor: "pointer", backdropFilter: "blur(6px)" };
const VL_CHIP: React.CSSProperties = { minWidth: 134, fontSize: 11.5, whiteSpace: "nowrap" };
const VL_CHIP_DOT: React.CSSProperties = { width: 10, height: 10 };

function vlChipStyle(active: boolean): React.CSSProperties {
	return { ...CL_CHIP, ...VL_CHIP, cursor: "pointer", opacity: active ? 1 : 0.5 };
}
function vlDotStyle(color: string): React.CSSProperties {
	return { ...CL_CHIP_DOT, ...VL_CHIP_DOT, background: color };
}

// Which lokas belong to the active tier: +1 = upper worlds (incl. Earth),
// -1 = lower worlds, 0 = the whole axis (overview).
function vlInTier(l: any, tier: number): boolean {
	if (tier === 1) return l.tier === "upper" || l.tier === "earth";
	if (tier === -1) return l.tier === "lower";
	return true;
}

// Mood overlays: celestial light pouring from above (heavens) vs an
// infernal glow rising from below (hells).
const VL_ATMO_UP: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to bottom, rgba(255,240,200,0.22), rgba(160,200,255,0.09) 42%, rgba(0,0,0,0) 72%)" };
const VL_ATMO_DOWN: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to top, rgba(200,40,12,0.32), rgba(120,20,8,0.15) 44%, rgba(0,0,0,0) 74%)" };
const VL_TIER_HINT: React.CSSProperties = { position: "absolute", left: "50%", bottom: 58, transform: "translateX(-50%)", zIndex: 8, fontSize: 10.5, letterSpacing: "0.12em", whiteSpace: "nowrap", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" };
const VL_GAME: React.CSSProperties = { marginTop: 10, paddingTop: 9, borderTop: "1px solid rgba(201,168,76,0.25)", fontSize: 11.5, letterSpacing: "0.03em", color: "#ffe6a0", fontFamily: "'JetBrains Mono', monospace" };

function VedicLokaWindow({ panelRef }: { panelRef: any }) {
	const [sel, setSel] = useState<number | null>(null);
	const [tier, setTier] = useState(0); // -1 lower worlds (hells), 0 overview, +1 upper worlds (heavens)
	const [menuOpen, setMenuOpen] = useState(false);
	const data = vedicData as any;
	const lokas = data.lokas as Array<any>;
	const { player, progress } = usePlayer();
	const lightPct = Math.round((progress ?? 0) * 100);
	const todayIdx = useMemo(() => lokaOfTheDay().id - 1, []);
	const homeIdx = VEDIC_HOME_ID - 1;
	const levels = useMemo(() => {
		const m: Record<number, number> = {};
		(player.lokas ?? []).forEach((l: any) => { m[l.index] = l.level; });
		return m;
	}, [player.lokas]);
	const todayName = lokas[todayIdx] ? lokas[todayIdx].name : "";
	const homeName = lokas[homeIdx] ? lokas[homeIdx].name : "";
	const visibleCount = lokas.filter((l: any) => tier === 0 || vlInTier(l, tier)).length;
	const active = sel == null ? null : lokas[sel];
	const changeTier = (d: number) => { setSel(null); setMenuOpen(false); setTier((t) => Math.max(-1, Math.min(1, t + d))); };
	const tierTitle = tier === 1 ? "\u0412\u044b\u0441\u0448\u0438\u0435 \u043c\u0438\u0440\u044b" : tier === -1 ? "\u041d\u0438\u0437\u0448\u0438\u0435 \u043c\u0438\u0440\u044b" : data.title;
	const tierKicker = tier === 1 ? "7 \u043b\u043e\u043a \u00b7 \u043a \u0431\u043e\u0433\u0430\u043c \u0438 \u043d\u0435\u0431\u0435\u0441\u0430\u043c" : tier === -1 ? "7 \u043b\u043e\u043a \u00b7 \u043a \u0430\u0434\u0430\u043c \u0438 \u0431\u0435\u0437\u0434\u043d\u0430\u043c" : data.kicker;
	const tierLead = tier === 1 ? "\u0421\u0435\u043c\u044c \u0432\u044b\u0441\u0448\u0438\u0445 \u043b\u043e\u043a \u2014 \u043e\u0442 \u0417\u0435\u043c\u043b\u0438 \u0432\u0432\u0435\u0440\u0445 \u043a \u043d\u0435\u0431\u0435\u0441\u0430\u043c \u0418\u043d\u0434\u0440\u044b \u0438 \u043c\u0438\u0440\u0443 \u0418\u0441\u0442\u0438\u043d\u044b \u0411\u0440\u0430\u0445\u043c\u044b, \u043e\u0431\u0438\u0442\u0435\u043b\u0438 \u0431\u043e\u0433\u043e\u0432, \u0440\u0438\u0448\u0438 \u0438 \u043f\u0440\u0430\u0432\u0435\u0434\u043d\u0438\u043a\u043e\u0432." : tier === -1 ? "\u0421\u0435\u043c\u044c \u043d\u0438\u0437\u0448\u0438\u0445 \u043b\u043e\u043a \u2014 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u044b\u0435 \u0446\u0430\u0440\u0441\u0442\u0432\u0430 \u043d\u0430\u0433\u043e\u0432, \u0442\u0438\u0442\u0430\u043d\u043e\u0432 \u0438 \u0434\u0435\u043c\u043e\u043d\u043e\u0432, \u043d\u0438\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0435 \u0432\u043e \u0442\u044c\u043c\u0443 \u043a \u0441\u0430\u043c\u043e\u043c\u0443 \u0434\u043d\u0443 \u0432\u0441\u0435\u043b\u0435\u043d\u043d\u043e\u0439 \u2014 \u041f\u0430\u0442\u0430\u043b\u0435." : data.lead;
	const tierHint = tier === -1 ? "\u2039 \u043d\u0438\u0436\u0435 \u2014 \u0430\u0434\u044b" : tier === 1 ? "\u0432\u044b\u0448\u0435 \u2014 \u043d\u0435\u0431\u0435\u0441\u0430 \u203a" : "\u2039 \u043d\u0438\u0437\u0448\u0438\u0435    \u00b7    \u0432\u044b\u0441\u0448\u0438\u0435 \u203a";
	const tierHintColor = tier === -1 ? "#ff8a5a" : tier === 1 ? "#ffe6a0" : "rgba(201,168,76,0.7)";
	const tierHintStyle: React.CSSProperties = { ...VL_TIER_HINT, color: tierHintColor };
	return (
		<div style={CL_WRAP}>
			<div style={CL_CANVAS_WRAP}>
				<Canvas dpr={[1, 2]} camera={CAM_VEDIC} gl={GL_HUMAN} style={CL_CANVAS_STYLE} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; }}>
					<VedicCosmosScene selected={sel} onSelect={setSel} tier={tier} homeIdx={homeIdx} todayIdx={todayIdx} levels={levels} />
					<EffectComposer multisampling={0}>
						<Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.5} luminanceSmoothing={0.9} radius={0.72} />
					</EffectComposer>
				</Canvas>
			</div>
			{tier !== 0 && <div style={tier === 1 ? VL_ATMO_UP : VL_ATMO_DOWN} aria-hidden="true" />}
			<div style={CL_TOPBAR}>
				<div style={CL_KICKER}>{tierKicker}</div>
				<div style={CL_TITLE}>{tierTitle}</div>
			</div>
			<button type="button" style={VL_MENU_BTN} onClick={() => setMenuOpen((x) => !x)}>
				{menuOpen ? "\u2715 \u0417\u0430\u043a\u0440\u044b\u0442\u044c" : "\u2630 " + visibleCount + " \u043b\u043e\u043a"}
			</button>
			{menuOpen && (
				<div style={VL_RAIL}>
					{lokas.map((l, i) => (
						(tier === 0 || vlInTier(l, tier)) ? (
							<div key={l.id} style={vlChipStyle(sel == null || sel === i)} onClick={() => { setSel(i); setMenuOpen(false); }}>
								<span style={vlDotStyle(l.color)} />
								{l.id + ". " + l.name}
							</div>
						) : null
					))}
				</div>
			)}
			<div style={CL_DESC} ref={panelRef}>
				{active == null ? (
					<>
						<div style={CL_DESC_NAME}>{tier === 0 ? data.center.name : tierTitle}</div>
						<div style={CL_DESC_BODY}>{tierLead}</div>
						{tier === 0 && (
							<div style={VL_GAME}>{"\u0421\u0432\u0435\u0442 " + lightPct + "%   \u00b7   \u043b\u043e\u043a\u0430 \u0434\u043d\u044f: " + todayName + "   \u00b7   \u0434\u043e\u043c: " + homeName}</div>
						)}
					</>
				) : (
					<>
						<div style={CL_DESC_NAME}>{active.id + ". " + active.name + " \u00b7 " + active.sanskrit}</div>
						<div style={CL_DESC_BODY}>{active.deity + " \u2014 " + active.ru}</div>
						<div style={VL_GAME}>{(sel === homeIdx ? "\u2302 \u0432\u0430\u0448 \u0434\u043e\u043c    " : "") + (sel === todayIdx ? "\u2600 \u043b\u043e\u043a\u0430 \u0434\u043d\u044f    " : "") + "\u0443\u0440\u043e\u0432\u0435\u043d\u044c " + (sel != null && levels[sel] != null ? levels[sel] : 0) + " / 9"}</div>
						<div style={CL_BACK} onClick={() => setSel(null)}>{"\u2190 \u041e\u0431\u0437\u043e\u0440"}</div>
					</>
				)}
			</div>
			<div style={CL_HINT}>{"\u0412\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u2014 \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u043d\u0438\u0435\u043c. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043b\u043e\u043a\u0443, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u0438\u0431\u043b\u0438\u0437\u0438\u0442\u044c\u0441\u044f."}</div>
			{tier > -1 && (
				<button type="button" style={HW_ARROW_L} onClick={() => changeTier(-1)} aria-label="Lower worlds">
					{"\u2039"}
				</button>
			)}
			{tier < 1 && (
				<button type="button" style={HW_ARROW_R} onClick={() => changeTier(1)} aria-label="Upper worlds">
					{"\u203A"}
				</button>
			)}
			<div style={tierHintStyle}>{tierHint}</div>
		</div>
	);
}

/* ---------------------------------------------------------------------------
   Node 1.44 -- Cosmic Forces of Brahmanda: 21 luminous agents (Powers of the
   Cosmos) orbiting the central Light of Ra. A R3F port of the old
   cosmic-forces.html "map of agents as lights in space". Reached by paging UP
   from the 14 Lokas (vIdx 2). Click a light to read its force; rotate / zoom.
--------------------------------------------------------------------------- */

const CAM_FORCES = { position: [0, 0, 9] as [number, number, number], fov: 46 };
// Colour each force by its Ray (1..7); index 0 (centre / Svet Ra) uses gold.
const CF_RAY_HEX = ["#c9a84c", "#ff5a4a", "#5aa0ff", "#9b6aff", "#6ad8c8", "#ffd27a", "#ff8a3a", "#bcd0ff"];
function cfColor(a: any): string {
  return CF_RAY_HEX[a.ray] || "#c9a84c";
}
// Even spread of n lights over a sphere (Fibonacci), gently flattened on Y.
function cfPositions(n: number, R: number): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    out.push([Math.cos(th) * rad * R, y * R * 0.8, Math.sin(th) * rad * R]);
  }
  return out;
}

// Faint descending rays from the central Light of Ra to every force.
function ForceLines({ positions }: { positions: Array<[number, number, number]> }) {
  const geo = useMemo(() => {
    const arr = new Float32Array(positions.length * 6);
    positions.forEach((p, i) => {
      arr[i * 6 + 3] = p[0];
      arr[i * 6 + 4] = p[1];
      arr[i * 6 + 5] = p[2];
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [positions]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={"#c9a84c"} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function ForceNode({ id, pos, color, faded, selected, onSelect }: { id: number; pos: [number, number, number]; color: string; faded: boolean; selected: boolean; onSelect: (id: number) => void }) {
  const grp = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const phase = useRef(id * 0.6);
  useFrame((_, dt) => {
    phase.current += dt;
    const p = 0.5 + 0.5 * Math.sin(phase.current * 1.3);
    const o = faded ? 0.16 : selected ? 0.96 : 0.78;
    const go = faded ? 0.03 : (selected ? 0.32 : 0.14) * (0.7 + 0.3 * p);
    const s = selected ? 1.45 : 1;
    if (matRef.current) matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, o, 0.1);
    if (glowRef.current) glowRef.current.opacity = THREE.MathUtils.lerp(glowRef.current.opacity, go, 0.1);
    if (grp.current) grp.current.scale.setScalar(THREE.MathUtils.lerp(grp.current.scale.x, s, 0.12));
  });
  return (
    <group ref={grp} position={pos}>
      <mesh onClick={(e: any) => { e.stopPropagation(); onSelect(id); }}>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.65} metalness={0.4} roughness={0.35} transparent opacity={0.78} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial ref={glowRef} color={color} transparent opacity={0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---- #190: Vastu Shastra energy web + nakshatras (toggled by buttons) ----
const NAKSH_R = 5.2;

// Distinct colours per Vimshottari planet-lord, assigned in first-seen order so
// each nakshatra (its star, thread and the force it ties to) is colour-keyed to
// the planet that rules it. Order of lords: Ketu, Venus, Sun, Moon, Mars, Rahu,
// Jupiter, Saturn, Mercury.
const PLANET_PALETTE = ["#9aa0a6", "#ff9ed8", "#ffb24a", "#cfe0ff", "#ff5a4a", "#8a6ad8", "#ffe066", "#5aa0ff", "#6ad8a0", "#c9a84c"];
function buildLordColors(lords: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  let k = 0;
  for (const l of lords) { if (!(l in map)) { map[l] = PLANET_PALETTE[k % PLANET_PALETTE.length]; k++; } }
  return map;
}

// Order the forces along the Vastu Purusha Mandala flow (energy enters at the
// North-East / Ishanya and circles the directions toward the South-West),
// returning their positions in that sequence so we can wire a flowing circuit.
function vastuChainPositions(others: any[], positions: Array<[number, number, number]>, order: string[]): Array<[number, number, number]> {
  const oi = (z: string) => { const i = order.indexOf(z); return i < 0 ? order.length : i; };
  const paired = others.map((a, i) => ({ a, pos: positions[i] }));
  paired.sort((p, q) => (oi(p.a.vastu_zone) - oi(q.a.vastu_zone)) || (p.a.id - q.a.id));
  return paired.map((p) => p.pos);
}

// Colours for each segment of the Vastu circuit, in the same sorted order as
// vastuChainPositions -- each link is tinted with the ray-colour of the force it
// flows out of, so the energy carries that force's hue.
function vastuChainColors(others: any[], order: string[]): string[] {
  const oi = (z: string) => { const i = order.indexOf(z); return i < 0 ? order.length : i; };
  return others.slice().sort((p, q) => (oi(p.vastu_zone) - oi(q.vastu_zone)) || (p.id - q.id)).map((a) => cfColor(a));
}

// The links between forces: a closed circuit following the Vastu flow, with a
// gentle breathing glow.
function VastuLinks({ positions, colors }: { positions: Array<[number, number, number]>; colors: string[] }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const n = positions.length;
    const arr = new Float32Array(n * 2 * 3);
    const col = new Float32Array(n * 2 * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = positions[i];
      const b = positions[(i + 1) % n];
      arr[i * 6 + 0] = a[0]; arr[i * 6 + 1] = a[1]; arr[i * 6 + 2] = a[2];
      arr[i * 6 + 3] = b[0]; arr[i * 6 + 4] = b[1]; arr[i * 6 + 5] = b[2];
      c.set(colors[i] || "#8af0e0");
      col[i * 6 + 0] = c.r; col[i * 6 + 1] = c.g; col[i * 6 + 2] = c.b;
      col[i * 6 + 3] = c.r; col[i * 6 + 4] = c.g; col[i * 6 + 5] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [positions, colors]);
  useFrame((s) => {
    if (matRef.current) matRef.current.opacity = 0.5 + 0.22 * Math.sin(s.clock.elapsedTime * 0.5);
  });
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={matRef} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

// Beads of light gliding along the circuit -- the energy flowing North-East
// -> South-West through the mandala of forces. Slow and soft for a calm feel.
function FlowPulses({ positions }: { positions: Array<[number, number, number]> }) {
  const curve = useMemo(() => {
    const pts = positions.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.18);
  }, [positions]);
  const N = 26;
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame((s) => {
    const time = s.clock.elapsedTime;
    const t = time * 0.025;
    for (let i = 0; i < N; i++) {
      const m = refs.current[i];
      if (!m) continue;
      curve.getPointAt((t + i / N) % 1, v);
      m.position.set(v.x, v.y, v.z);
      const tw = 0.7 + 0.3 * Math.sin(time * 1.3 + i * 0.9);
      m.scale.setScalar(tw);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + 0.45 * tw;
    }
  });
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={"#ffe9b0"} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const NAKSH_SPIN = 0.012;

// A small canvas-sprite text label (renders Cyrillic) that always faces the camera.
function makeLabelTexture(text: string) {
  const fs = 30;
  const pad = 10;
  const measure = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  measure.font = fs + "px sans-serif";
  const w = Math.ceil(measure.measureText(text).width) + pad * 2;
  const h = fs + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = fs + "px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "rgba(232,238,255,0.96)";
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return { tex, w, h };
}

function NakshatraLabel({ text, position, highlight }: { text: string; position: [number, number, number]; highlight?: boolean }) {
  const lbl = useMemo(() => makeLabelTexture(text), [text]);
  const k = highlight ? 0.0058 : 0.0042;
  return (
    <sprite position={position} scale={[lbl.w * k, lbl.h * k, 1]}>
      <spriteMaterial map={lbl.tex} transparent depthWrite={false} opacity={highlight ? 1 : 0.9} />
    </sprite>
  );
}

// Faint threads tying each nakshatra to the force ruled by its planetary lord
// (Vimshottari). They follow the slow turning of the belt.
function NakshatraLinks({ bases, targets, colors }: { bases: Array<[number, number, number]>; targets: Array<[number, number, number]>; colors: string[] }) {
  const n = bases.length;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    const colArr = new Float32Array(n * 2 * 3);
    const cc = new THREE.Color();
    for (let i = 0; i < n; i++) {
      cc.set(colors[i] || "#c6cdff");
      colArr[i * 6 + 0] = cc.r; colArr[i * 6 + 1] = cc.g; colArr[i * 6 + 2] = cc.b;
      colArr[i * 6 + 3] = cc.r; colArr[i * 6 + 4] = cc.g; colArr[i * 6 + 5] = cc.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
    return g;
  }, [n, colors]);
  useFrame((s) => {
    const ang = s.clock.elapsedTime * NAKSH_SPIN;
    const c = Math.cos(ang);
    const sn = Math.sin(ang);
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < n; i++) {
      const b = bases[i];
      const x = b[0] * c + b[2] * sn;
      const z = -b[0] * sn + b[2] * c;
      const t = targets[i];
      arr[i * 6 + 0] = x; arr[i * 6 + 1] = b[1]; arr[i * 6 + 2] = z;
      arr[i * 6 + 3] = t[0]; arr[i * 6 + 4] = t[1]; arr[i * 6 + 5] = t[2];
    }
    pos.needsUpdate = true;
  });
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.46} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

// The 27 Nakshatras (lunar mansions) as a slowly turning star-belt, each labelled.
function Nakshatras({ bases, names, colors, selected, onSelect }: { bases: Array<[number, number, number]>; names: string[]; colors: string[]; selected: number | null; onSelect: (i: number) => void }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((s) => { if (grp.current) grp.current.rotation.y = s.clock.elapsedTime * NAKSH_SPIN; });
  return (
    <group ref={grp}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[NAKSH_R, 0.01, 8, 200]} />
        <meshBasicMaterial color={"#bcd0ff"} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {bases.map((p, i) => {
        const col = colors[i] || "#e6ecff";
        const on = selected === i;
        return (
          <group key={i} position={p} onClick={(e: any) => { e.stopPropagation(); onSelect(i); }}>
            <mesh>
              <sphereGeometry args={[on ? 0.11 : 0.07, 14, 14]} />
              <meshBasicMaterial color={col} />
            </mesh>
            <mesh>
              <sphereGeometry args={[on ? 0.27 : 0.16, 14, 14]} />
              <meshBasicMaterial color={col} transparent opacity={on ? 0.42 : 0.24} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
      {bases.map((p, i) => (
        <NakshatraLabel key={"l" + i} text={names[i] || ""} position={[p[0] * 1.09, p[1] + 0.22, p[2] * 1.09]} highlight={selected === i} />
      ))}
    </group>
  );
}

function CosmicForcesScene({ selected, onSelect, nakSel, onSelectNak, links, naksh, order, nakshNames, nakshLords }: { selected: number | null; onSelect: (id: number) => void; nakSel: number | null; onSelectNak: (i: number) => void; links: boolean; naksh: boolean; order: string[]; nakshNames: string[]; nakshLords: string[] }) {
  const agents = agentsData as any[];
  const others = useMemo(() => agents.filter((a) => a.id !== 1), [agents]);
  const positions = useMemo(() => cfPositions(others.length, 3.5), [others.length]);
  const chainPos = useMemo(() => vastuChainPositions(others, positions, order), [others, positions, order]);
  const chainColors = useMemo(() => vastuChainColors(others, order), [others, order]);
  const lordColor = useMemo(() => buildLordColors(nakshLords), [nakshLords]);
  const nakColors = useMemo(() => nakshLords.map((l) => lordColor[l] || "#c6cdff"), [nakshLords, lordColor]);
  const nakBases = useMemo(
    () =>
      nakshNames.map((_, i) => {
        const a = (i / nakshNames.length) * Math.PI * 2;
        return [Math.cos(a) * NAKSH_R, Math.sin(a * 3) * 0.25, Math.sin(a) * NAKSH_R] as [number, number, number];
      }),
    [nakshNames]
  );
  const nakTargets = useMemo(() => {
    const byPlanet: Record<string, Array<[number, number, number]>> = {};
    others.forEach((a, i) => { (byPlanet[a.planet] = byPlanet[a.planet] || []).push(positions[i]); });
    return nakshLords.map((lord, i) => {
      const cands = byPlanet[lord];
      if (cands && cands.length) return cands[i % cands.length];
      return [0, 0, 0] as [number, number, number];
    });
  }, [others, positions, nakshLords]);
  return (
    <>
      <fog attach="fog" args={["#04040a", 9, 40]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} intensity={2.4} color={"#ffd27a"} distance={20} decay={1.4} />
      <directionalLight position={[4, 5, 6]} intensity={0.4} color={"#cdd8ff"} />
      <BackgroundStars count={2200} colorHex={"#dfe6ff"} />
      <VedicDust />
      {naksh && <Nakshatras bases={nakBases} names={nakshNames} colors={nakColors} selected={nakSel} onSelect={onSelectNak} />}
      {naksh && links && nakBases.length > 0 && nakTargets.length === nakBases.length && <NakshatraLinks bases={nakBases} targets={nakTargets} colors={nakColors} />}
      <group>
        <RaCore />
        <ForceLines positions={positions} />
        {links && <VastuLinks positions={chainPos} colors={chainColors} />}
        {links && <FlowPulses positions={chainPos} />}
        {others.map((a, i) => (
          <ForceNode key={a.id} id={a.id} pos={positions[i]} color={cfColor(a)} faded={selected != null && selected !== a.id} selected={selected === a.id} onSelect={onSelect} />
        ))}
      </group>
      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.3} minDistance={4} maxDistance={24} />
    </>
  );
}

const CF_ATMO: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 38%, rgba(255,224,160,0.12), rgba(0,0,0,0) 62%)" };
const CF_CTRL: React.CSSProperties = { position: "absolute", top: 64, left: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, zIndex: 9 };
const CF_BTN_BASE: React.CSSProperties = { padding: "8px 13px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(10,10,20,0.55)", color: "#e3ddcd", fontSize: 12.5, cursor: "pointer", backdropFilter: "blur(6px)", letterSpacing: "0.03em", whiteSpace: "nowrap" };
const CF_MENU_BTN: React.CSSProperties = { position: "absolute", top: 16, right: 16, zIndex: 10, padding: "8px 13px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.45)", background: "rgba(10,10,20,0.62)", color: "#e3ddcd", fontSize: 12.5, cursor: "pointer", backdropFilter: "blur(6px)" };
const CF_RAIL: React.CSSProperties = { position: "absolute", top: 52, right: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 9, maxHeight: "78%", overflowY: "auto", padding: 8, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(8,8,16,0.72)", backdropFilter: "blur(8px)" };
function cfBtnStyle(active: boolean): React.CSSProperties {
  return active
    ? { ...CF_BTN_BASE, border: "1px solid rgba(201,168,76,0.85)", background: "rgba(201,168,76,0.2)", color: "#f4ecd6" }
    : CF_BTN_BASE;
}

const CF_LEGEND: React.CSSProperties = { position: "absolute", left: 20, top: 150, maxWidth: 232, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(8,8,16,0.66)", backdropFilter: "blur(8px)", zIndex: 8, display: "flex", flexDirection: "column", gap: 5 };
const CF_LEGEND_TITLE: React.CSSProperties = { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 };
const CF_LEGEND_ROW: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 11.5 };
const CF_LEGEND_NAME: React.CSSProperties = { color: "#e3ddcd", minWidth: 64 };
const CF_LEGEND_ROLE: React.CSSProperties = { color: "rgba(206,199,183,0.72)", fontSize: 11 };
const CF_LEGEND_HINT: React.CSSProperties = { marginTop: 4, fontSize: 10, lineHeight: 1.45, color: "rgba(206,199,183,0.6)" };
function cfLegendDot(color: string): React.CSSProperties {
  return { width: 9, height: 9, borderRadius: "50%", flex: "0 0 auto", background: color, boxShadow: "0 0 6px " + color };
}

function CosmicForcesWindow({ panelRef }: { panelRef: any }) {
  const [sel, setSel] = useState<number | null>(null);
  const [nakSel, setNakSel] = useState<number | null>(null);
  const [links, setLinks] = useState(false);
  const [naksh, setNaksh] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const data = forcesData as any;
  const agents = agentsData as any[];
  const order = (data.vastuOrder as string[]) || [];
  const nakshNames = (data.nakshatras as string[]) || [];
  const nakshLords = (data.nakshatraLords as string[]) || [];
  const nakshInfo = (data.nakshatraInfo as any[]) || [];
  const planetInfo = (data.planetInfo as any[]) || [];
  const lordColors = buildLordColors(nakshLords);
  const pickForce = (id: number) => { setNakSel(null); setSel(id); };
  const pickNak = (i: number) => { setSel(null); setNakSel(i); };
  const active = sel == null ? null : agents.find((a) => a.id === sel);

  // Description follows the focus: a picked force, else the active overlay
  // (Vastu flow / Nakshatras), else the centre of Brahmanda.
  let dName = data.centerName as string;
  let dBody = data.lead as string;
  let showBack = false;
  if (active != null) {
    dName = active.id + ". " + active.name;
    dBody = active.domain + data.sep + active.element + data.sep + active.guna + data.sep + data.zoneLabel + " " + active.vastu_zone + data.sep + data.rayLabel + " " + active.ray;
    showBack = true;
  } else if (nakSel != null) {
    const ni = nakshInfo[nakSel] || {};
    dName = (nakSel + 1) + ". " + nakshNames[nakSel] + data.sep + data.rulesLabel + " " + nakshLords[nakSel];
    dBody = (ni.deity ? ni.deity + data.sep : "") + (ni.symbol ? ni.symbol + ". " : "") + (ni.meaning || "") + " " + data.connectLabel + " " + nakshLords[nakSel] + ".";
    showBack = true;
  } else if (links) {
    dName = data.vastuName;
    dBody = data.vastuDesc;
  } else if (naksh) {
    dName = data.nakshName;
    dBody = data.nakshDesc;
  }

  return (
    <div style={CL_WRAP}>
      <div style={CL_CANVAS_WRAP}>
        <Canvas dpr={[1, 2]} camera={CAM_FORCES} gl={GL_HUMAN} style={CL_CANVAS_STYLE}>
          <CosmicForcesScene selected={sel} onSelect={pickForce} nakSel={nakSel} onSelectNak={pickNak} links={links} naksh={naksh} order={order} nakshNames={nakshNames} nakshLords={nakshLords} />
        </Canvas>
      </div>
      <div style={CF_ATMO} aria-hidden="true" />
      <div style={CL_TOPBAR}>
        <div style={CL_KICKER}>{data.kicker}</div>
        <div style={CL_TITLE}>{data.title}</div>
      </div>

      <div style={CF_CTRL}>
        <button type="button" style={cfBtnStyle(links)} onClick={() => setLinks((x) => !x)}>{data.linksBtn}</button>
        <button type="button" style={cfBtnStyle(naksh)} onClick={() => { setNaksh((x) => !x); setNakSel(null); }}>{data.nakshBtn}</button>
      </div>

      {naksh && (
        <div style={CF_LEGEND}>
          <div style={CF_LEGEND_TITLE}>{data.legendTitle}</div>
          {planetInfo.map((p: any) => (
            <div key={p.name} style={CF_LEGEND_ROW}>
              <span style={cfLegendDot(lordColors[p.name] || "#c9a84c")} />
              <span style={CF_LEGEND_NAME}>{p.name}</span>
              <span style={CF_LEGEND_ROLE}>{p.role}</span>
            </div>
          ))}
          <div style={CF_LEGEND_HINT}>{data.legendHint}</div>
        </div>
      )}

      <button type="button" style={CF_MENU_BTN} onClick={() => setMenuOpen((x) => !x)}>
        {menuOpen ? data.menuClose : data.menuBtn}
      </button>
      {menuOpen && (
        <div style={CF_RAIL}>
          {agents.map((a) => (
            <div key={a.id} style={vlChipStyle(sel == null || sel === a.id)} onClick={() => { pickForce(a.id); setMenuOpen(false); }}>
              <span style={vlDotStyle(cfColor(a))} />
              {a.id + ". " + a.name}
            </div>
          ))}
        </div>
      )}

      <div style={CL_DESC} ref={panelRef}>
        <div style={CL_DESC_NAME}>{dName}</div>
        <div style={CL_DESC_BODY}>{dBody}</div>
        {showBack && <div style={CL_BACK} onClick={() => { setSel(null); setNakSel(null); }}>{data.back}</div>}
      </div>
      <div style={CL_HINT}>{data.hint}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Node 1.444 -- SATYA YUGA: the golden space ABOVE the cosmic forces. The
   culmination -- the exit into Creation (Mirozdanie). A blazing golden Source
   with radiant blades of light, breathing halo-rings and motes ascending into
   the light. Reached by the UP arrow from the Cosmic Forces (top window).
--------------------------------------------------------------------------- */

const SY_GOLD = "#ffd27a";
const SY_WHITE = "#fff6da";
const SY_CAM = { position: [0, 1.2, 13.5] as [number, number, number], fov: 50 };

// Blazing central Source -- a layered golden sun that slowly breathes.
function SatyaSun() {
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06);
    if (glow.current) glow.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.1);
  });
  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[0.92, 48, 48]} />
        <meshBasicMaterial color={SY_WHITE} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshBasicMaterial color={SY_GOLD} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={glow}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshBasicMaterial color={SY_GOLD} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// A slowly turning sunburst -- thin radiant blades streaming from the Source.
function SatyaRays({ count }: { count: number }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (grp.current) grp.current.rotation.z += dt * 0.035; });
  const angles = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);
  return (
    <group ref={grp}>
      {angles.map((a, i) => (
        <mesh key={i} position={[-Math.sin(a) * 1.95, Math.cos(a) * 1.95, 0]} rotation={[0, 0, a]}>
          <planeGeometry args={[0.045, 2.7]} />
          <meshBasicMaterial color={i % 2 ? SY_GOLD : SY_WHITE} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Motes of light rising upward -- the ascent / exit into Creation.
function AscendingMotes({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = (0.4 + Math.random() * 0.6) * (0.6 + Math.random() * 4.6);
      const th = Math.random() * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(th) * r;
      pos[i * 3 + 1] = -3 + Math.random() * 8;
      pos[i * 3 + 2] = Math.sin(th) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += dt * (0.35 + (i % 5) * 0.07);
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -3;
    }
    attr.needsUpdate = true;
  });
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.055} color={SY_GOLD} sizeAttenuation transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// Concentric halo-rings -- the gateway threshold, gently breathing.
function SatyaPortalRings() {
  const grp = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (grp.current) grp.current.children.forEach((c, i) => c.scale.setScalar(1 + Math.sin(t * 0.6 + i) * 0.04));
  });
  return (
    <group ref={grp} rotation={[Math.PI / 2.2, 0, 0]}>
      {[2.3, 3.0, 3.7, 4.4].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.016, 8, 180]} />
          <meshBasicMaterial color={SY_GOLD} transparent opacity={0.3 - i * 0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const BUBBLE_COLORS = ["#8a6ad8", "#b06ad8", "#6a8ad8", "#6ad8c8", "#9fd8ff", "#d86ab0"];

type BubbleSpec = {
  pos: [number, number, number];
  size: number;
  color: string;
  phase: number;
  spin: number;
  pts: Float32Array;
};

// Deterministic little PRNG so the multiverse layout is stable across renders.
function syRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeBubbleField(n: number, seed: number): BubbleSpec[] {
  const rnd = syRand(seed);
  const out: BubbleSpec[] = [];
  for (let i = 0; i < n; i++) {
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    const R = 4.6 + rnd() * 7.5;
    const x = Math.sin(ph) * Math.cos(th) * R;
    const y = Math.cos(ph) * R * 0.7 + (rnd() - 0.5) * 2.5;
    const z = Math.sin(ph) * Math.sin(th) * R * 0.75 - rnd() * 3;
    const size = 0.55 + rnd() * 1.7;
    const color = BUBBLE_COLORS[Math.floor(rnd() * BUBBLE_COLORS.length)];
    const pc = 46;
    const pts = new Float32Array(pc * 3);
    for (let j = 0; j < pc; j++) {
      const rr = Math.pow(rnd(), 0.6) * size * 0.62;
      const aa = rnd() * Math.PI * 2;
      pts[j * 3 + 0] = Math.cos(aa) * rr;
      pts[j * 3 + 1] = (rnd() - 0.5) * size * 0.2;
      pts[j * 3 + 2] = Math.sin(aa) * rr;
    }
    out.push({ pos: [x, y, z], size, color, phase: rnd() * Math.PI * 2, spin: 0.05 + rnd() * 0.16, pts });
  }
  return out;
}

// One iridescent bubble = a whole little universe drifting in the void.
function UniverseBubble({ spec }: { spec: BubbleSpec }) {
  const grp = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(spec.pts, 3));
    return g;
  }, [spec]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (grp.current) grp.current.position.y = spec.pos[1] + Math.sin(t * 0.32 + spec.phase) * 0.28;
    if (inner.current) inner.current.rotation.y = t * spec.spin;
  });
  const sz = spec.size;
  return (
    <group ref={grp} position={spec.pos}>
      <mesh>
        <sphereGeometry args={[sz, 32, 32]} />
        <meshBasicMaterial color={spec.color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[sz, 32, 32]} />
        <meshBasicMaterial color={spec.color} transparent opacity={0.1} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <points ref={inner} geometry={geo}>
        <pointsMaterial size={0.038} color={"#ffffff"} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <mesh>
        <sphereGeometry args={[sz * 0.2, 16, 16]} />
        <meshBasicMaterial color={spec.color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[-sz * 0.4, sz * 0.42, sz * 0.55]}>
        <sphereGeometry args={[sz * 0.1, 12, 12]} />
        <meshBasicMaterial color={"#ffffff"} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MultiverseBubbles({ count }: { count: number }) {
  const specs = useMemo(() => makeBubbleField(count, 1444), [count]);
  return (
    <group>
      {specs.map((sp, i) => (
        <UniverseBubble key={i} spec={sp} />
      ))}
    </group>
  );
}

// The Golden Age universe -- the blazing Source wrapped in its own glass sphere.
function GoldenAgeSphere() {
  const shell = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (shell.current) shell.current.rotation.y = s.clock.elapsedTime * 0.03;
  });
  const R = 2.7;
  return (
    <group>
      <group scale={0.6}>
        <SatyaSun />
        <SatyaRays count={40} />
        <SatyaPortalRings />
      </group>
      <mesh>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color={SY_GOLD} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={shell} scale={1.04}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color={SY_WHITE} transparent opacity={0.06} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh position={[-R * 0.42, R * 0.45, R * 0.5]}>
        <sphereGeometry args={[R * 0.13, 18, 18]} />
        <meshBasicMaterial color={"#ffffff"} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SatyaYugaScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={3} color={SY_GOLD} distance={36} decay={1.2} />
      <BackgroundStars count={2400} colorHex={"#cfd8ff"} />
      <GoldenAgeSphere />
      <MultiverseBubbles count={22} />
      <AscendingMotes count={180} />
      <OrbitControls enablePan={false} enableZoom autoRotate autoRotateSpeed={0.18} minDistance={6} maxDistance={34} />
    </>
  );
}

const SY_VIGNETTE: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(circle at 50% 44%, rgba(40,28,6,0) 38%, rgba(3,2,0,0.6) 100%)" };
const SY_ATMO: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "radial-gradient(ellipse 82% 72% at 50% 44%, rgba(255,210,122,0.22), rgba(20,12,2,0) 66%)" };

function SatyaYugaWindow({ panelRef, lang }: { panelRef: any; lang: Locale }) {
  const ru = lang === "ru";
  const title = ru ? "\u0421\u0430\u0442\u044c\u044f \u042e\u0433\u0430" : "Satya Yuga";
  const kicker = ru
    ? "\u0412\u042b\u0425\u041e\u0414 \u0412 \u041c\u0418\u0420\u041e\u0417\u0414\u0410\u041d\u0418\u0415 \u00b7 \u0417\u041e\u041b\u041e\u0422\u041e\u0419 \u0412\u0415\u041a \u00b7 NODE 1.444"
    : "GATE INTO CREATION \u00b7 GOLDEN AGE \u00b7 NODE 1.444";
  const name = ru ? "\u0417\u043e\u043b\u043e\u0442\u043e\u0435 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e" : "The golden expanse";
  const body = ru
    ? "\u0417\u0430 \u0441\u0438\u043b\u0430\u043c\u0438 \u0411\u0440\u0430\u0445\u043c\u0430\u043d\u0434\u044b \u2014 \u0447\u0438\u0441\u0442\u044b\u0439 \u0441\u0432\u0435\u0442 \u0418\u0441\u0442\u043e\u043a\u0430. \u0412\u0435\u043a \u0418\u0441\u0442\u0438\u043d\u044b, \u0433\u0434\u0435 \u0432\u0441\u0451 \u0441\u0438\u044f\u0435\u0442 \u0437\u043e\u043b\u043e\u0442\u043e\u043c \u0435\u0434\u0438\u043d\u043e\u0433\u043e \u0421\u043e\u0437\u043d\u0430\u043d\u0438\u044f. \u041e\u0442\u0441\u044e\u0434\u0430 \u2014 \u0432\u044b\u0445\u043e\u0434 \u0432 \u041c\u0438\u0440\u043e\u0437\u0434\u0430\u043d\u0438\u0435."
    : "Beyond the forces of Brahmanda lies the pure light of the Source. The Age of Truth, where all shines with the gold of one Consciousness -- the gate into Creation itself.";
  const hint = ru ? "\u25b2 \u043f\u0440\u0435\u0434\u0435\u043b \u00b7 \u0418\u0441\u0442\u043e\u043a" : "\u25b2 the summit \u00b7 Source";
  return (
    <div style={CL_WRAP}>
      <div style={CL_CANVAS_WRAP}>
        <Canvas dpr={[1, 2]} camera={SY_CAM} gl={GL_HUMAN} style={CL_CANVAS_STYLE}>
          <SatyaYugaScene />
        </Canvas>
      </div>
      <div style={SY_VIGNETTE} aria-hidden="true" />
      <div style={SY_ATMO} aria-hidden="true" />
      <div style={CL_TOPBAR}>
        <div style={CL_KICKER}>{kicker}</div>
        <div style={CL_TITLE}>{title}</div>
      </div>
      <div style={CL_DESC} ref={panelRef}>
        <div style={CL_DESC_NAME}>{name}</div>
        <div style={CL_DESC_BODY}>{body}</div>
      </div>
      <div style={CL_HINT}>{hint}</div>
    </div>
  );
}

function HumanWindow({
  lang,
  hIdx,
  goH,
  panelRef,
}: {
  lang: Locale;
  hIdx: number;
  goH: (dir: number) => void;
  panelRef: React.RefObject<HTMLDivElement>;
}) {
  const ru = lang === "ru";
  const chakras7 = (chakrasData as any[]).filter((c) => c.id <= 7).slice().reverse(); // crown -> root
  const dims = (dims9Data.dimensions as any[]).slice().reverse();                     // 9 -> 1 (top -> bottom)
  const groupsById: Record<number, any> = {};
  (dims9Data.groups as any[]).forEach((g) => { groupsById[g.id] = g; });

  const L = (archData as any).left;
  const R = (archData as any).right;
  const treeDot = { ...HW_DOT_BASE, background: "#c9a84c" };

  const title =
    hIdx === -1 ? L.title
      : hIdx === 1 ? R.title
        : (ru ? "\u0427\u0435\u043b\u043e\u0432\u0435\u043a" : "Human");
  const kicker =
    hIdx === -1 ? L.kicker
      : hIdx === 1 ? R.kicker
        : (ru ? "\u0410\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430" : "Human architecture");

  return (
    <div style={HW_WRAP}>
      <div ref={panelRef} style={HW_PANEL}>
        <p style={HW_KICKER}>{kicker}</p>
        <p style={HW_TITLE}>{title}</p>

        {hIdx === 0 && (
          <>
            <HumanFigure3D />
            <p style={HW_LEAD}>{(archData as any).binding}</p>
            <p style={HW_HINT}>{"\u2039 \u0414\u0440\u0435\u0432\u043e    \u00b7    \u041a\u0440\u0438\u0441\u0442\u0430\u043b\u043b \u203a"}</p>
          </>
        )}

        {hIdx === -1 && (
          <>
            <TreeFigure3D />
            <p style={HW_LEAD}>{L.lead}</p>

            <p style={HW_SECTION}>{"\u0414\u0440\u0435\u0432\u043e \u0416\u0438\u0437\u043d\u0438"}</p>
            <div style={HW_LIST}>
              {(L.tree as any[]).map((t, i) => (
                <div key={"t" + i} style={HW_ROW}>
                  <span style={treeDot} />
                  <div>
                    <p style={HW_NAME}>{t.part}</p>
                    <p style={HW_META}>{t.ru}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={HW_SECTION}>{"\u0422\u043e\u043d\u043a\u0438\u0435 \u0442\u0435\u043b\u0430"}</p>
            <div style={HW_LIST}>
              {(L.subtle_bodies as any[]).map((b, i) => {
                const dotStyle = { ...HW_DOT_BASE, background: SUBTLE_SHELL_HEX_CSS[i % SUBTLE_SHELL_HEX_CSS.length] };
                return (
                  <div key={"s" + i} style={HW_ROW}>
                    <span style={dotStyle} />
                    <div>
                      <p style={HW_NAME}>{b.n + ". " + b.name}</p>
                      <p style={HW_META}>{b.ru}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={HW_SECTION}>{"\u0427\u0430\u043a\u0440\u044b"}</p>
            <div style={HW_LIST}>
              {chakras7.map((c) => {
                const dotStyle = { ...HW_DOT_BASE, background: CHAKRA_HEX[c.id] };
                return (
                  <div key={c.id} style={HW_ROW}>
                    <span style={dotStyle} />
                    <div>
                      <p style={HW_NAME}>{c.name + "   \u00b7   " + c.mantra_seed}</p>
                      <p style={HW_META}>{c.position + " \u2014 " + c.element}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={HW_SECTION}>{"\u041a\u043e\u0448\u0438"}</p>
            <div style={HW_LIST}>
              {(L.koshas as any[]).map((k, i) => (
                <div key={"k" + i} style={HW_ROW}>
                  <span style={treeDot} />
                  <div>
                    <p style={HW_NAME}>{k.name}</p>
                    <p style={HW_META}>{k.ru}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {hIdx === 1 && (
          <>
            <CrystalFigure3D />
            <p style={HW_LEAD}>{R.lead}</p>

            <p style={HW_SECTION}>{"\u041a\u0440\u0438\u0441\u0442\u0430\u043b\u043b \u00b7 4-\u0435 \u0442\u0435\u043b\u043e"}</p>
            <p style={HW_FOOT_P}>{R.crystal}</p>

            <p style={HW_SECTION}>{"9 \u041c\u0435\u0440 \u00b7 3 \u0433\u0440\u0443\u043f\u043f\u044b"}</p>
            <p style={HW_LEAD}>{(dims9Data as any).core_principle}</p>
            <div style={HW_LIST}>
              {dims.map((d) => {
                const g = groupsById[d.group];
                const dotStyle = d.highlighted
                  ? { ...HW_DOT_BASE, background: d.color, boxShadow: "0 0 0 2px #ffd27a, 0 0 12px rgba(255,210,122,0.7)" }
                  : { ...HW_DOT_BASE, background: d.color };
                const work = d.shift_note ? d.shift_note : (g ? g.function : d.position);
                return (
                  <div key={d.mera} style={HW_ROW}>
                    <span style={dotStyle} />
                    <div>
                      <p style={HW_NAME}>{d.name + "   \u00b7   " + d.chakra_name}</p>
                      <p style={HW_META}>{(g ? g.title + " \u2014 " : "") + work}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={HW_SECTION}>{"\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u041f\u0438\u0440\u0430\u043c\u0438\u0434\u0430"}</p>
            <div style={HW_LIST}>
              {(R.pyramid as any[]).map((p, i) => (
                <div key={"p" + i} style={HW_ROW}>
                  <span style={treeDot} />
                  <div>
                    <p style={HW_NAME}>{p.name}</p>
                    <p style={HW_META}>{p.ru}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={HW_FOOT}>
              <p style={HW_FOOT_P}>{(dims9Data as any).assemblage_point.title + ": " + (dims9Data as any).assemblage_point.note}</p>
              <p style={HW_FOOT_P}>{(dims9Data as any).luch_vospriyatiya.title + ": " + (dims9Data as any).luch_vospriyatiya.note}</p>
            </div>
          </>
        )}

        <div style={HW_PAGER} aria-hidden="true">
          <span style={hIdx === -1 ? HW_PAGER_ON : HW_PAGER_DOT} />
          <span style={hIdx === 0 ? HW_PAGER_ON : HW_PAGER_DOT} />
          <span style={hIdx === 1 ? HW_PAGER_ON : HW_PAGER_DOT} />
        </div>
      </div>

      {hIdx > -1 && (
        <button type="button" style={HW_ARROW_L} onClick={() => goH(-1)} aria-label="Previous page">
          {"\u2039"}
        </button>
      )}
      {hIdx < 1 && (
        <button type="button" style={HW_ARROW_R} onClick={() => goH(1)} aria-label="Next page">
          {"\u203A"}
        </button>
      )}
    </div>
  );
}

const CENTER_DIVE: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "clamp(120px, 26vw, 200px)",
  height: "clamp(120px, 26vw, 200px)",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
  zIndex: 12,
  cursor: "pointer",
  background: "transparent",
  border: "none",
  padding: 0,
};
const CENTER_DIVE_RING: React.CSSProperties = {
  position: "absolute",
  inset: "14%",
  borderRadius: "50%",
  border: "1px solid rgba(201,168,76,0.35)",
  boxShadow: "0 0 26px rgba(255,210,122,0.25), inset 0 0 26px rgba(255,210,122,0.12)",
  pointerEvents: "none",
};
const CENTER_DIVE_HINT: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "-28px",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.7)",
  fontFamily: "'JetBrains Mono', monospace",
  pointerEvents: "none",
};

/* ---------------------------------------------------------------------------
   Node 2 -- the Golden Egg lobby (Hiranyagarbha). Reached by clicking the
   CENTER of YOUR universe: a slowly turning golden egg with Ra at its heart,
   ringed by four gates -- Game, Chronicle, Exchange, Society. A lightweight
   R3F rebuild of the old lobby-3d.html. (Chatura-Loka keeps its own level.)
--------------------------------------------------------------------------- */

const LB_CAM = { position: [0, 0, 5.4] as [number, number, number], fov: 46 };
const LB_GL = { antialias: true, alpha: true };

const stopLobbySwipe = (e: React.PointerEvent) => e.stopPropagation();

type LobbyGate = {
  id: string;
  ru: string;
  en: string;
  dsRu: string;
  dsEn: string;
  color: string;
  pos: React.CSSProperties;
};

const LOBBY_GATES: LobbyGate[] = [
  { id: "game", ru: "\u0418\u0413\u0420\u0410", en: "GAME", dsRu: "\u0432\u043e\u0439\u0442\u0438 \u0432 \u043c\u0438\u0440", dsEn: "enter the world", color: "120,170,255", pos: { top: "19%", left: "13%" } },
  { id: "chronicle", ru: "\u0425\u0440\u043e\u043d\u0438\u043a\u0430", en: "CHRONICLE", dsRu: "\u043f\u0430\u043c\u044f\u0442\u044c \u043f\u0443\u0442\u0438", dsEn: "your path", color: "255,215,0", pos: { top: "19%", right: "13%" } },
  { id: "exchange", ru: "\u041e\u0431\u043c\u0435\u043d", en: "EXCHANGE", dsRu: "\u0434\u0430\u0440\u044b \u0438 \u0441\u0432\u044f\u0437\u0438", dsEn: "gifts & links", color: "100,220,230", pos: { bottom: "17%", left: "13%" } },
  { id: "social", ru: "\u0421\u043e\u0446\u0438\u0443\u043c", en: "SOCIETY", dsRu: "\u0434\u0440\u0443\u0433\u0438\u0435 \u0438\u0433\u0440\u043e\u043a\u0438", dsEn: "other players", color: "150,120,255", pos: { bottom: "17%", right: "13%" } },
];

const LB_WRAP: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 30,
  overflow: "hidden",
  background:
    "radial-gradient(ellipse at 50% 42%, rgba(48,36,104,0.42) 0%, rgba(8,6,22,0.72) 56%, #03020c 100%)",
};
const LB_CANVAS_WRAP: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 1 };
const LB_TOPBAR: React.CSSProperties = { position: "absolute", top: "26px", left: 0, right: 0, textAlign: "center", zIndex: 5, pointerEvents: "none" };
const LB_KICKER: React.CSSProperties = { margin: 0, fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.55)", fontFamily: "'JetBrains Mono', monospace" };
const LB_TITLE: React.CSSProperties = { margin: "8px 0 0", fontSize: "clamp(22px, 5vw, 34px)", letterSpacing: "0.18em", color: "#f3e2b0", fontWeight: 600 };
const LB_NM: React.CSSProperties = { display: "block", fontSize: "14px", letterSpacing: "0.16em", color: "#fff8d6", fontWeight: 600 };
const LB_DS: React.CSSProperties = { display: "block", marginTop: "3px", fontSize: "11px", fontStyle: "italic", color: "rgba(201,168,76,0.62)" };
const LB_HINT: React.CSSProperties = { position: "absolute", left: "50%", bottom: "86px", transform: "translateX(-50%)", margin: 0, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", fontFamily: "'JetBrains Mono', monospace", zIndex: 5, pointerEvents: "none" };
const LB_BACK: React.CSSProperties = { position: "absolute", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: 6, background: "rgba(12,9,28,0.42)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: "11px", padding: "9px 20px", color: "rgba(201,168,76,0.85)", fontSize: "11px", letterSpacing: "0.16em", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" };
const LB_TOAST: React.CSSProperties = { position: "absolute", left: "50%", bottom: "122px", transform: "translateX(-50%)", zIndex: 7, background: "rgba(12,9,28,0.78)", border: "1px solid rgba(201,168,76,0.6)", borderRadius: "12px", padding: "10px 18px", color: "#ffd27a", fontSize: "12px", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" };
const LB_VEIL: React.CSSProperties = { position: "absolute", inset: 0, zIndex: 8, background: "#03020c", opacity: 0, pointerEvents: "none" };

function lobbyGateStyle(pos: React.CSSProperties): React.CSSProperties {
  return Object.assign(
    {
      position: "absolute",
      width: "clamp(92px, 22vw, 150px)",
      textAlign: "center",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      padding: "6px",
      zIndex: 4,
    } as React.CSSProperties,
    pos
  );
}
function lobbyDotStyle(color: string): React.CSSProperties {
  return {
    display: "block",
    width: "16px",
    height: "16px",
    margin: "0 auto 8px",
    borderRadius: "50%",
    background: "rgba(" + color + ",0.95)",
    boxShadow: "0 0 18px rgba(" + color + ",0.7)",
  };
}

function LobbyEgg() {
  const g = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g.current) g.current.rotation.y = t * 0.18;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.05);
  });
  return (
    <group ref={g}>
      <mesh scale={[1, 1.32, 1]}>
        <sphereGeometry args={[1.15, 64, 48]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.6} roughness={0.35} transparent opacity={0.34} emissive="#7a5a14" emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color="#fff3c4" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function LobbyStars() {
  const geo = useMemo(() => {
    const N = 900;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 8 + Math.random() * 14;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return bg;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.05} color="#cfe0ff" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function LobbyEggScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0.2, 2]} intensity={1.6} color="#ffd27a" />
      <LobbyEgg />
      <LobbyStars />
    </>
  );
}

const LB_IFRAME: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: "none",
  zIndex: 1,
  background: "#000",
};

// Full port of the original lobby-3d.html: the real page is embedded as-is via
// an <iframe> (eye-portal intro, Hiranyagarbha egg, orbiting world-portals,
// passport, modals, 432Hz audio -- all preserved exactly). A floating back
// button returns to YOUR universe. Served by Vite from the project root.
function LobbyEggWindow({ lang, onClose }: { lang: Locale; onClose: () => void }) {
  return (
    <div style={LB_WRAP} onPointerDown={stopLobbySwipe}>
      <iframe src="../lobby-3d.html" title="AWARA Lobby 3D" style={LB_IFRAME} />
      <button type="button" style={LB_BACK} onPointerDown={stopLobbySwipe} onClick={onClose}>
        {lang === "ru" ? "\u2190 \u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f" : "\u2190 Universe"}
      </button>
    </div>
  );
}

/* ============================ exported component ============================ */

// T4 backdrop images the player drops into public/assets -- one meaningful image per loka / universe
// (mythologically authentic, NOT generic). Each image may be paired with a DEPTH MAP (same name +
// "_depth.png", e.g. exported from Immersity / Depth Anything V2) which displaces a subdivided plane into
// real relief; the plane then parallaxes about its own centre as you orbit, so you peer *into* the image
// with true volume (see CosmosDepthDome). No depth map -> graceful flat fallback. Unlocks at creator-tier T4.
const COSMOS_PHOTOS = [
  "assets/2026-06-12_01-18-23.webp",
  "assets/2026-06-12_01-18-29.webp",
  "assets/2026-06-12_01-20-23.webp",
  "assets/2026-06-12_01-21-12.webp",
  "assets/2026-06-12_01-23-09.webp",
  "assets/2026-06-12_01-32-54.webp",
  "assets/2026-06-12_01-33-38.webp",
  "assets/2026-06-12_01-33-52.webp",
];
function assetBase(): string {
  try {
    return ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) || "/";
  } catch {
    return "/";
  }
}
function cosmosPhotoUrl(form: { hueA?: number }): string {
  const h = typeof form.hueA === "number" ? form.hueA : 0;
  const i = Math.abs(Math.floor(h * 997)) % COSMOS_PHOTOS.length;
  return assetBase() + COSMOS_PHOTOS[i];
}
// Parallax layers that pair with the chosen photo: same path with ".webp" -> a suffix, e.g.
// "_bg.png" (far background, figure removed), "_mid.png" (the figure/column isolated on black) and
// "_fg.png" (drifting dust/sparks on black). Drop these beside the photo in public/assets to give
// the curated image REAL layered depth without distorting it. Missing layers degrade gracefully.
function cosmosLayerUrl(form: { hueA?: number }, suffix: string): string {
  const h = typeof form.hueA === "number" ? form.hueA : 0;
  const i = Math.abs(Math.floor(h * 997)) % COSMOS_PHOTOS.length;
  return assetBase() + COSMOS_PHOTOS[i].replace(/\.webp$/, suffix);
}

// Layered-parallax cosmos backdrop. Instead of warping one image (depth maps looked terrible), we stack
// 2-3 FLAT layers cut from the curated loka image and spread them across depth: a far background plate,
// the figure/column in the middle, and drifting dust up front. As you orbit, nearer layers slide further
// than far ones -> honest volume, and the picture itself is never distorted. The whole rig is pinned to
// the camera so it always fills the frame. The mid/fg layers sit on black and use additive blending, so
// their black areas vanish and only the glow remains. Missing layers degrade gracefully (bg falls back to
// the base photo; mid/fg are simply skipped). Unlocks at creator-tier T4.
function CosmosParallax({
  form,
  rotRef,
  active,
}: {
  form: { hueA?: number };
  rotRef: React.MutableRefObject<{ x: number; y: number }>;
  active: boolean;
}) {
  const followRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const fgRef = useRef<THREE.Group>(null);
  const bgMat = useRef<THREE.MeshBasicMaterial>(null);
  const midMat = useRef<THREE.MeshBasicMaterial>(null);
  const fgMat = useRef<THREE.MeshBasicMaterial>(null);
  const [bgTex, setBgTex] = useState<THREE.Texture | null>(null);
  const [midTex, setMidTex] = useState<THREE.Texture | null>(null);
  const [fgTex, setFgTex] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);
  const drift = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    let alive = true;
    setBgTex(null);
    setMidTex(null);
    setFgTex(null);
    setReady(false);
    const loader = new THREE.TextureLoader();
    const asSrgb = (t: THREE.Texture) => {
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    // Background layer, with a graceful fallback to the base photo if no "_bg.png" exists.
    loader.load(
      cosmosLayerUrl(form, "_bg.png"),
      (t) => {
        if (!alive) return;
        setBgTex(asSrgb(t));
        setReady(true);
      },
      undefined,
      () => {
        loader.load(
          cosmosPhotoUrl(form),
          (t2) => {
            if (!alive) return;
            setBgTex(asSrgb(t2));
            setReady(true);
          },
          undefined,
          () => {
            if (alive) setReady(true);
          }
        );
      }
    );
    loader.load(
      cosmosLayerUrl(form, "_mid.png"),
      (t) => {
        if (alive) setMidTex(asSrgb(t));
      },
      undefined,
      () => {}
    );
    loader.load(
      cosmosLayerUrl(form, "_fg.png"),
      (t) => {
        if (alive) setFgTex(asSrgb(t));
      },
      undefined,
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [form]);

  const clampN = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    drift.current += d;
    // Pin the rig to the camera so the backdrop always fills the frame (reads as surrounding space).
    const f = followRef.current;
    if (f) {
      f.position.copy(camera.position);
      f.quaternion.copy(camera.quaternion);
    }
    const ry = clampN(rotRef.current.y, -1.2, 1.2);
    const rx = clampN(rotRef.current.x, -1.0, 1.0);
    const dz = drift.current;
    // Differential lateral slide = parallax. Nearer layers (bigger k) move more than far ones.
    const slide = (g: THREE.Group | null, kx: number, ky: number, ax: number, ay: number) => {
      if (!g) return;
      const tx = ry * kx + Math.sin(dz * 0.25) * ax;
      const ty = -rx * ky + Math.cos(dz * 0.2) * ay;
      g.position.x += (tx - g.position.x) * 0.05;
      g.position.y += (ty - g.position.y) * 0.05;
    };
    slide(bgRef.current, 2, 1.5, 0.6, 0.4);
    slide(midRef.current, 6, 4, 1.4, 1.0);
    slide(fgRef.current, 13, 9, 3.2, 2.2);
    const o = active ? 1 : 0;
    if (bgMat.current) bgMat.current.opacity += (o - bgMat.current.opacity) * 0.05;
    if (midMat.current) midMat.current.opacity += (o - midMat.current.opacity) * 0.05;
    if (fgMat.current) fgMat.current.opacity += (o - fgMat.current.opacity) * 0.05;
  });

  if (!ready || !bgTex) return null;

  return (
    <group ref={followRef}>
      <group ref={bgRef} position={[0, 0, -160]}>
        <mesh renderOrder={-53} frustumCulled={false}>
          <planeGeometry args={[1200, 780]} />
          <meshBasicMaterial
            ref={bgMat}
            map={bgTex}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      {midTex ? (
        <group ref={midRef} position={[0, 0, -120]}>
          <mesh renderOrder={-52} frustumCulled={false}>
            <planeGeometry args={[980, 640]} />
            <meshBasicMaterial
              ref={midMat}
              map={midTex}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ) : null}
      {fgTex ? (
        <group ref={fgRef} position={[0, 0, -70]}>
          <mesh renderOrder={-51} frustumCulled={false}>
            <planeGeometry args={[780, 510]} />
            <meshBasicMaterial
              ref={fgMat}
              map={fgTex}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

export interface MacrocosmProps {
  /** Accumulated player Light (0..1.5). Drives stars / brightness / central source of YOUR universe. */
  totalLight?: number;
  /** Seed for YOUR deterministic universe (overrides the locally stored seed). */
  seed?: number;
  /** Force a locale; otherwise detected from navigator. */
  locale?: Locale;
}

export default function Macrocosm({ totalLight, seed, locale }: MacrocosmProps) {
  const flashRef = useRef<HTMLDivElement>(null!);
  const coverRef = useRef<HTMLDivElement>(null!);
  const transitioning = useRef(false);
  const zoomRef = useRef(ZOOM_BASE);

  // Multi-pointer tracking: 1 finger = swipe, 2 fingers = pinch zoom.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const rotRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  // Orbit PIVOT focus: when a creation (power source) is magnetized, the camera recenters on its
  // live world position instead of the universe core (0,0,0). { active:false } -> core.
  const focusRef = useRef<{ target: THREE.Vector3; active: boolean; owner?: "src" | "mera" | null }>({ target: new THREE.Vector3(), active: false, owner: null });
  // Dimensionality tier (T0..T5): orbiting the universe unlocks at T3, regeneration at T4.
  const { tier } = usePlayer();
  const tierRef = useRef(0);
  tierRef.current = tier;

  // Advisory (компас, не рельсы): состояния зон хаба из light-core. Используется
  // лишь для мягкого подъёма завесы над космосом. Никогда не гейтит.
  const { zones: hubZones } = useHubZones();

  const [lang, setLang] = useState<Locale>(() => locale ?? resolveLocale());
  const [mobile, setMobile] = useState(false);
  const [ownSeed, setOwnSeed] = useState<number>(() => seed ?? loadNum(SEED_KEY, 7));
  const [rollsLeft, setRollsLeft] = useState<number>(() => loadNum(ROLLS_KEY, ROLLS_START));
  const [idx, setIdx] = useState(0);
  const [vIdx, setVIdx] = useState(0); // vertical window level (0 = the living cosmos)
  const vDirRef = useRef(0); // last vertical travel direction (+1 up / -1 down) for the slide-in
  const winPanelRef = useRef<HTMLDivElement>(null);
  const diveRingRef = useRef<HTMLSpanElement>(null);
  const [hIdx, setHIdx] = useState(0); // horizontal page in the "human" window: -1 = 7 chakras, 0 = figure, +1 = 9 dimensions
  const [lobbyOpen, setLobbyOpen] = useState(false); // node 2 egg-lobby (4 gates), opened by clicking the center of YOUR universe
  // DEBUG: manual override of the Light value (0..LIGHT_MAX) so the scale can be dragged back and forth
  // to preview how brightness / stars react. null = follow the real accumulated Light.
  const [lightDebug, setLightDebug] = useState<number | null>(() => {
    const v = loadNum(LIGHT_KEY, -1);
    return v >= 0 ? v : null;
  });
  // Placeholder toggle for the future "Map of Creation" overlay (top-left). Not built yet.
  const [mapOpen, setMapOpen] = useState(false);
  // Сигнал «свернуть плавающие панели»: растёт при каждом переходе между вселенными / окнами,
  // чтобы Творец и Лестница размерности сворачивались и не загораживали обзор.
  const [collapseSignal, setCollapseSignal] = useState(0);

  useEffect(() => {
    try {
      setMobile(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
    } catch {
      /* ignore */
    }
  }, []);

  // Мультивселенная: активная вселенная передаёт свой seed сверху (istok App).
  // При переключении вселенных YOUR-космос перекатывается на новый seed, поэтому у
  // каждой вселенной — своя форма / туманность / цвета галактики.
  useEffect(() => {
    if (seed === undefined) return;
    setOwnSeed(seed);
    setIdx(0);
  }, [seed]);

  // Мультивселенная: активная вселенная передаёт свой seed сверху (istok App).
  // При переключении вселенных YOUR-космос перекатывается на новый seed, поэтому у
  // каждой вселенной — своя форма / туманность / цвета галактики.
  useEffect(() => {
    if (seed === undefined) return;
    setOwnSeed(seed);
    setIdx(0);
  }, [seed]);

  const roster: UniverseEntry[] = useMemo(() => {
    const own: UniverseEntry = { seed: ownSeed, name: "", light: totalLight ?? 0.25, own: true };
    return [own, ...OTHERS];
  }, [ownSeed, totalLight]);

  const current = roster[idx];
  const form = useMemo(() => buildForm(current.seed), [current.seed]);
  // On YOUR universe a debug override (if set) wins, so the Light scale can be dragged freely for preview.
  const light = clampLight(current.own && lightDebug !== null ? lightDebug : current.light);
  const frac = Math.min(1, light / LIGHT_MAX);
  const starCount = Math.round(600 + frac * 4800);
  const pct = Math.round(frac * 100);

  // HOME base: the player's OWN universe rests in Bhur-loka (#66bbff) -- the physical middle world
  // that holds all spectra. Other players' universes keep their own seeded palette.
  // Each universe is created in its OWN rolled spectrum -- re-rolling at the start again gives
  // universes of different spectra / colours, exactly as before. (Bhur-loka via lokaById stays the
  // conceptual home for the later influence steps.)
  const baseStarHex = hex(hsl(form.hueA, 0.6, 0.62));
  const baseCoreHex = hex(hsl(form.hueB, 0.72, 0.7));
  // Active lokas influencing this universe. Scaffold: today's loka + its neighbour as a co-active
  // influence. Later this list is built from the daily crucible (tigel) + natal chart + transit + links.
  const activeLoka = current.own ? lokaOfTheDay() : null;
  const activeLokas = activeLoka ? [activeLoka, lokaById((activeLoka.id % 14) + 1)] : [];
  // FUSION: all active loka colours blend into one energy that pools in the CENTRE -- the core reads the
  // mix (e.g. red + blue -> violet). FRINGE: the periphery (outer stars) leans toward the *secondary*
  // loka, so each loka's nature stays distinguishable at the rim instead of collapsing to one flat hue.
  const fusionHex = activeLokas.length
    ? activeLokas.reduce((acc, l, i) => hexMix(acc, l.color, 1 / (i + 1)), activeLokas[0].color)
    : null;
  const fringeHex = activeLokas.length > 1 ? activeLokas[activeLokas.length - 1].color : fusionHex;
  const LOKA_SHIFT = 0.3;
  const coreHex = fusionHex ? hexMix(baseCoreHex, fusionHex, LOKA_SHIFT) : baseCoreHex;
  const starHex = fringeHex ? hexMix(baseStarHex, fringeHex, LOKA_SHIFT * 0.85) : baseStarHex;

  // Seeded nebula background per universe (its own mood; dims with low Light).
  const bgStyle: React.CSSProperties = { ...BG_BASE, background: "#04040a" };

  // Smooth cross-fade through darkness while the next universe mounts.
  const transition = useCallback((apply: () => void) => {
    setCollapseSignal((n) => n + 1); // на каждом переходе сворачиваем плавающие панели
    const cover = coverRef.current;
    if (prefersReducedMotion() || !cover) {
      apply();
      return;
    }
    if (transitioning.current) return;
    transitioning.current = true;
    const tl = gsap.timeline({ onComplete: () => { transitioning.current = false; } });
    tl.to(cover, { opacity: 1, duration: 0.42, ease: "power2.inOut" })
      .add(apply)
      .to(cover, { opacity: 0, duration: 0.7, ease: "power2.out" });
  }, []);

  const go = useCallback(
    (dir: number) => {
      zoomRef.current = ZOOM_BASE; // reset zoom on travel
      transition(() => setIdx((i) => (i + dir + roster.length) % roster.length));
    },
    [transition, roster.length]
  );

  // Vertical navigation: list the windows stacked above / below the cosmos.
  const goV = useCallback(
    (dir: number) => {
      const nv = Math.max(V_MIN, Math.min(V_MAX, vIdx + dir));
      if (nv === vIdx) return;
      vDirRef.current = dir; // remember direction so the panel slides in from the right side
      zoomRef.current = ZOOM_BASE; // reset zoom when leaving / entering the cosmos
      transition(() => setVIdx(nv));
    },
    [vIdx, transition]
  );

  // Dive THROUGH the center of YOUR universe into the Egg-LOBBY menu (node 2):
  // fly the camera into the core while the screen fades, then reveal the lobby
  // with its four gates. (Chatura-Loka stays reachable by paging DOWN.)
  const diveToEgg = useCallback(() => {
    if (transitioning.current) return;
    setCollapseSignal((n) => n + 1); // ныряем в Яйцо — тоже сворачиваем панели
    const cover = coverRef.current;
    if (prefersReducedMotion() || !cover) {
      zoomRef.current = ZOOM_BASE;
      setLobbyOpen(true);
      return;
    }
    transitioning.current = true;
    const tl = gsap.timeline({ onComplete: () => { transitioning.current = false; } });
    tl.to(zoomRef, { current: ZOOM_MIN, duration: 0.5, ease: "power2.in" }, 0)
      .to(cover, { opacity: 1, duration: 0.5, ease: "power2.in" }, 0)
      .add(() => { setLobbyOpen(true); zoomRef.current = ZOOM_BASE; })
      .to(cover, { opacity: 0, duration: 0.6, ease: "power2.out" }, "+=0.35");
  }, []);

  // Horizontal paging INSIDE the "human" window (node 1.2): center figure,
  // left = 7 chakras, right = 9 dimensions. Only meaningful on the human level (vIdx === -2).
  const goH = useCallback((dir: number) => {
    setHIdx((h) => Math.max(-1, Math.min(1, h + dir)));
  }, []);

  // Always return to the central figure when entering / leaving any vertical window.
  useEffect(() => { setHIdx(0); }, [vIdx]);

  // Gentle breathing pulse on the central "enter the egg" ring.
  useEffect(() => {
    const el = diveRingRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.to(el, { scale: 1.14, opacity: 0.45, duration: 1.9, ease: "sine.inOut", repeat: -1, yoyo: true, transformOrigin: "center center" });
    return () => { tween.kill(); gsap.set(el, { scale: 1, opacity: 1 }); };
  }, [vIdx]);

  const reroll = useCallback(() => {
    if (transitioning.current || rollsLeft <= 0) return;
    const ns = Math.floor(Math.random() * 1_000_000_000);
    const nr = rollsLeft - 1;
    transition(() => { setIdx(0); setOwnSeed(ns); });
    saveNum(SEED_KEY, ns);
    saveNum(ROLLS_KEY, nr);
    setRollsLeft(nr);
  }, [rollsLeft, transition]);

  const acceptCosmos = useCallback(() => {
    if (rollsLeft <= 0) return;
    saveNum(ROLLS_KEY, 0);
    setRollsLeft(0);
  }, [rollsLeft]);

  // T4 creator power: remake YOUR universe from a fresh seed at will (no roll cost).
  const regenerate = useCallback(() => {
    if (transitioning.current) return;
    const ns = Math.floor(Math.random() * 1_000_000_000);
    transition(() => { setIdx(0); setOwnSeed(ns); });
    saveNum(SEED_KEY, ns);
  }, [transition]);

  // Arrival flash.
  useEffect(() => {
    const el = flashRef.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.style.opacity = "0"; return; }
    const tween = gsap.to(el, { opacity: 0, duration: 1.1, ease: "power2.out" });
    return () => { tween.kill(); };
  }, []);

  // Keyboard navigation: Left/Right page universes (only on the cosmos level),
  // Up/Down list the vertical windows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && vIdx === 0) go(-1);
      else if (e.key === "ArrowRight" && vIdx === 0) go(1);
      else if (e.key === "ArrowLeft" && vIdx === -2) goH(-1);
      else if (e.key === "ArrowRight" && vIdx === -2) goH(1);
      else if (e.key === "ArrowUp") goV(1);
      else if (e.key === "ArrowDown") goV(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goH, goV, vIdx]);

  // Slide the window panel in vertically: going up -> it descends from above,
  // going down -> it rises from below. (The backdrop crossfades via transition().)
  useEffect(() => {
    if (vIdx === 0) return;
    const el = winPanelRef.current;
    if (!el) return;
    const from = vDirRef.current > 0 ? -54 : 54;
    const tween = gsap.fromTo(
      el,
      { y: from, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.62, ease: "back.out(1.5)" } // gentle inertial settle (slight overshoot)
    );
    return () => { tween.kill(); };
  }, [vIdx]);

  // Reset the CAMERA orbit to a level front view whenever the universe changes
  // (the universe carries its own tilt; the camera just starts looking straight at it).
  useEffect(() => {
    rotRef.current.x = 0;
    rotRef.current.y = 0;
  }, [form]);

  const pinchDist = useCallback(() => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = tierRef.current >= 3; // orbit (drag-to-rotate) unlocks at T3
    } else if (pointers.current.size === 2) {
      drag.current = null;
      draggingRef.current = false;
      pinch.current = { dist: pinchDist(), zoom: zoomRef.current };
    }
  }, [pinchDist]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const d = pinchDist();
      if (d > 0) zoomRef.current = clampZoom(pinch.current.zoom * (pinch.current.dist / d));
      return;
    }
    // 1 finger / mouse drag = orbit the universe (360 inspect). Unlocks at T3.
    if (pointers.current.size === 1 && drag.current && tierRef.current >= 3) {
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current = { x: e.clientX, y: e.clientY };
      rotRef.current.y += dx * 0.006;
      rotRef.current.x = Math.max(-1.35, Math.min(1.35, rotRef.current.x + dy * 0.006));
    }
  }, [pinchDist]);

  const endPointer = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      drag.current = null;
      draggingRef.current = false;
    }
  }, []);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    drag.current = null;
    draggingRef.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    zoomRef.current = clampZoom(zoomRef.current + e.deltaY * 0.0078);
  }, []);

  const stopSwipe = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  // Ось размерности (tier): T0 — замороженный кадр + грубый низкий dpr; T1 — грубо, но движется; T2+ — полно.
  const frameloop: "always" | "demand" = tier === 0 ? "demand" : "always";
  const baseDpr: [number, number] = mobile ? [1, 1.75] : [1, 2];
  const dpr: [number, number] =
    tier === 0 ? [0.35, 0.35] : tier === 1 ? [0.6, 0.6] : baseDpr;
  const glOpts = mobile ? GL_MOBILE : GL_DESKTOP;
  const counter = (idx + 1) + " / " + roster.length;
  const captionText = current.own
    ? (activeLoka ? T[lang].own + "  \u00b7  " + (lang === "ru" ? activeLoka.name : activeLoka.name_en) : T[lang].own)
    : current.name;
  // Чем живее зоны Космоса/Мироздания (по уровню пути), тем меньше тьмы
  // над космосом. compass-not-rails: нет данных → cosmosLive=0 → множитель 1.
  const cosmosLive = Math.max(zoneLiveness(hubZones.cosmos), zoneLiveness(hubZones.universe));
  const veilLift = 1 - 0.5 * cosmosLive;
  const veilStyle: React.CSSProperties = { ...DARK_VEIL_BASE, opacity: (1 - frac) * 0.82 * veilLift };
  const barFillStyle: React.CSSProperties = { ...HUD_BAR_FILL_BASE, width: pct + "%" };
  const canUp = vIdx < V_MAX;
  const canDown = vIdx > V_MIN;
  const winRec = V_WINDOWS.find((w) => w.level === vIdx);
  const winTitle = winRec ? (lang === "ru" ? winRec.titleRu : winRec.titleEn) : "";

  // --- Placeholder "Map of Creation" button (top-left) + debug Light slider styles ---
  const MAP_BTN: React.CSSProperties = {
    position: "absolute", bottom: 18, left: 14, zIndex: 40,
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 12px", borderRadius: 999,
    border: "1px solid rgba(201,168,76,0.5)", background: "rgba(8,8,16,0.55)",
    color: "#e8dca8", font: "600 12px/1 ui-sans-serif, system-ui, sans-serif",
    letterSpacing: "0.04em", cursor: "pointer", backdropFilter: "blur(6px)",
  };
  const SLIDER_WRAP: React.CSSProperties = {
    position: "absolute", left: "50%", top: 58, transform: "translateX(-50%)",
    zIndex: 52, display: "flex", alignItems: "center", gap: 10,
    padding: "9px 16px", borderRadius: 999,
    border: "1px solid rgba(159,216,255,0.5)", background: "rgba(8,8,16,0.72)",
    color: "#cfe6ff", font: "600 11px/1 ui-sans-serif, system-ui, sans-serif",
    backdropFilter: "blur(6px)", whiteSpace: "nowrap",
  };
  const SLIDER_INPUT: React.CSSProperties = { width: 200, accentColor: "#9fd8ff", cursor: "pointer" };
  const SLIDER_RESET: React.CSSProperties = {
    border: "none", background: "transparent", color: "#9fd8ff",
    cursor: "pointer", font: "600 11px/1 ui-sans-serif, system-ui, sans-serif",
  };

  // "Refresh of consciousness": a bright wave of light that pierces EVERYTHING,
  // sweeping top->bottom AND bottom->up at once, at ANY universe level.
  // Two tiers: white light + golden (full renewal).
  const waveTopRef = useRef<HTMLDivElement>(null);
  const waveBotRef = useRef<HTMLDivElement>(null);
  const waveBusy = useRef(false);
  const playWave = useCallback((mode: "white" | "gold") => {
    const top = waveTopRef.current;
    const bot = waveBotRef.current;
    if (!top || !bot || waveBusy.current) return;
    waveBusy.current = true;
    const dur = mode === "gold" ? 1.55 : 1.05;
    const bg =
      mode === "gold"
        ? "linear-gradient(to bottom, transparent 0%, rgba(255,228,150,0.6) 38%, rgba(255,215,110,0.99) 50%, rgba(255,228,150,0.6) 62%, transparent 100%)"
        : "linear-gradient(to bottom, transparent 0%, rgba(214,236,255,0.6) 38%, rgba(255,255,255,0.99) 50%, rgba(214,236,255,0.6) 62%, transparent 100%)";
    const glow =
      mode === "gold"
        ? "0 0 130px 70px rgba(255,200,80,0.9), 0 0 260px 150px rgba(255,160,30,0.55)"
        : "0 0 120px 64px rgba(255,255,255,0.9), 0 0 250px 150px rgba(170,215,255,0.55)";
    for (const el of [top, bot]) {
      el.style.background = bg;
      el.style.boxShadow = glow;
    }
    const h = (typeof window !== "undefined" ? window.innerHeight : 800) + 260;
    gsap.killTweensOf([top, bot]);
    gsap.set(top, { y: -260, opacity: 1 });
    gsap.set(bot, { y: h, opacity: 1 });
    const tl = gsap.timeline({ onComplete: () => { waveBusy.current = false; } });
    tl.to(top, { y: h, duration: dur, ease: "power1.inOut" }, 0)
      .to(bot, { y: -260, duration: dur, ease: "power1.inOut" }, 0)
      .to([top, bot], { opacity: 0, duration: 0.45, ease: "power2.out" }, dur - 0.3);
  }, []);
  const WAVE_BAND: React.CSSProperties = {
    position: "fixed", left: 0, right: 0, top: 0, height: 220,
    zIndex: 60, opacity: 0, pointerEvents: "none",
    mixBlendMode: "screen", filter: "blur(2px)",
  };
  const WAVE_CTRL: React.CSSProperties = {
    position: "fixed", right: 16, bottom: 18, zIndex: 50,
    display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end",
  };
  const WAVE_BTN: React.CSSProperties = {
    padding: "7px 12px", borderRadius: 999,
    border: "1px solid rgba(190,225,255,0.5)", background: "rgba(8,8,16,0.55)",
    color: "#dff0ff", font: "600 12px/1 ui-sans-serif, system-ui, sans-serif",
    letterSpacing: "0.04em", cursor: "pointer", backdropFilter: "blur(6px)", whiteSpace: "nowrap",
  };
  const WAVE_BTN_GOLD: React.CSSProperties = {
    ...WAVE_BTN,
    border: "1px solid rgba(255,210,110,0.6)", color: "#ffe7a8",
  };

  return (
    <div style={STAGE}>
      <div
        style={INNER}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerLeave={endPointer}
        onPointerCancel={onPointerCancel}
        onWheel={onWheel}
      >
        <div style={bgStyle} aria-hidden="true" />

        <div style={CANVAS_WRAP}>
          <Canvas
            camera={CAM}
            dpr={dpr}
            frameloop={frameloop}
            gl={glOpts}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
            }}
          >
            <SceneContents
              form={form}
              light={light}
              starHex={starHex}
              coreHex={coreHex}
              starCount={starCount}
              zoomRef={zoomRef}
              rotRef={rotRef}
              draggingRef={draggingRef}
              focusRef={focusRef}
              own={!!current.own}
              tier={tier}
            />
            {/* The nine nested spheres of the universe (canon): revealed + condensed by tier
                (T2 -> 3 spheres, T3 -> 6, T4 -> 9). Player's own universe only for now. */}
            {current.own && vIdx === 0 && <NineSpheres tier={tier} light={light} zoomRef={zoomRef} focusRef={focusRef} />}
            {/* Spark of awareness rising up through the cosmos; grows + speeds up with the light of awareness. */}
            {current.own && vIdx === 0 && <SparkRise />}
            {/* background cosmos photo disabled */}
          </Canvas>
        </div>

        <div style={veilStyle} aria-hidden="true" />
        <div ref={coverRef} style={COVER} aria-hidden="true" />
        <div ref={flashRef} style={FLASH} aria-hidden="true" />
        <div ref={waveTopRef} style={WAVE_BAND} aria-hidden="true" />
        <div ref={waveBotRef} style={WAVE_BAND} aria-hidden="true" />

        {vIdx === 0 && (
          <div style={HUD}>
            <div style={HUD_ROW}>
              <span style={HUD_LABEL}>{T[lang].light}</span>
              <span style={HUD_VALUE}>{pct + "%"}</span>
            </div>
            <div style={HUD_BAR}>
              <div style={barFillStyle} />
            </div>
          </div>
        )}

        {/* DEBUG Light scale: drag to preview brightness / stars at any Light %. Own universe, cosmos level. */}
        {vIdx === 0 && current.own && (
          <div
            style={SLIDER_WRAP}
            onPointerDown={stopSwipe}
            onPointerMove={stopSwipe}
            onPointerUp={stopSwipe}
          >
            <span>{(lang === "ru" ? "\u0421\u0432\u0435\u0442" : "Light") + "  " + pct + "%"}</span>
            <input
              type="range"
              min={0}
              max={LIGHT_MAX}
              step={0.01}
              value={light}
              style={SLIDER_INPUT}
              onChange={(e) => { const v = parseFloat(e.target.value); setLightDebug(v); saveNum(LIGHT_KEY, v); }}
            />
            {lightDebug !== null && (
              <button type="button" style={SLIDER_RESET} onPointerDown={stopSwipe} onClick={() => { setLightDebug(null); saveNum(LIGHT_KEY, -1); }}>
                {lang === "ru" ? "\u0441\u0431\u0440\u043e\u0441" : "reset"}
              </button>
            )}
          </div>
        )}

        {/* Placeholder button for the future Map of Creation (живой дашборд прогресса). Wiring comes later. */}
        <button type="button" style={MAP_BTN} onPointerDown={stopSwipe} onClick={() => setMapOpen(true)}>
          {"\u2316 " + (lang === "ru" ? "\u041a\u0430\u0440\u0442\u0430 \u041c\u0438\u0440\u043e\u0437\u0434\u0430\u043d\u0438\u044f" : "Map of Creation")}
        </button>

        <div style={LANG} role="group" aria-label="Language">
          <button
            type="button"
            style={lang === "ru" ? LANG_ON : LANG_OFF}
            onPointerDown={stopSwipe}
            onClick={() => setLang("ru")}
          >
            RU
          </button>
          <span style={LANG_SEP} aria-hidden="true">/</span>
          <button
            type="button"
            style={lang === "en" ? LANG_ON : LANG_OFF}
            onPointerDown={stopSwipe}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>

        {/* Refresh of consciousness: bright light wave piercing everything, at ANY level. White + gold. */}
        <div style={WAVE_CTRL}>
          <button type="button" style={WAVE_BTN} onPointerDown={stopSwipe} onClick={() => playWave("white")} title={lang === "ru" ? "\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0441\u043e\u0437\u043d\u0430\u043d\u0438\u044f \u2014 \u0431\u0435\u043b\u044b\u0439 \u0441\u0432\u0435\u0442" : "Refresh of consciousness -- white light"}>
            {(lang === "ru" ? "\u2726 \u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u043e\u0437\u043d\u0430\u043d\u0438\u0435" : "\u2726 Refresh consciousness")}
          </button>
          <button type="button" style={WAVE_BTN_GOLD} onPointerDown={stopSwipe} onClick={() => playWave("gold")} title={lang === "ru" ? "\u041f\u043e\u043b\u043d\u043e\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u2014 \u0437\u043e\u043b\u043e\u0442\u043e\u0439 \u0441\u0432\u0435\u0442" : "Full renewal -- golden light"}>
            {(lang === "ru" ? "\u2600 \u041f\u043e\u043b\u043d\u043e\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435" : "\u2600 Full renewal")}
          </button>
        </div>

        {/* Creator panel: create forms of consciousness, power sources, subtle links, cathedrals, summon the Creator, and birth universes. Shown on YOUR own universe. */}
        {current.own && <T5Creator forceVisible collapseSignal={collapseSignal} />}
        {/* Tier ladder + "+1 \u0441\u0432\u0435\u0442\u043c\u043e\u043d\u0435\u0442\u0430" button: raises light coins, switches T0..T5. */}
        {current.own && <TierLadder collapseSignal={collapseSignal} />}

        {vIdx === 0 && current.own ? (
          <div style={CTRL}>
            {rollsLeft > 0 ? (
              <>
                <button type="button" style={PILL} onPointerDown={stopSwipe} onClick={reroll}>
                  {T[lang].reroll + "  (" + rollsLeft + ")"}
                </button>
                <button type="button" style={PILL} onPointerDown={stopSwipe} onClick={acceptCosmos}>
                  {T[lang].accept}
                </button>
              </>
            ) : (
              <span style={TAG}>{T[lang].fixed}</span>
            )}
            {tier >= 4 && (
              <button type="button" style={PILL} onPointerDown={stopSwipe} onClick={regenerate}>
                {lang === "ru" ? "\u2726 \u041f\u0435\u0440\u0435\u0441\u043e\u0437\u0434\u0430\u0442\u044c" : "\u2726 Regenerate"}
              </button>
            )}
          </div>
        ) : null}

        {vIdx === 0 && (
          <>
            <button
              type="button"
              style={ARROW_LEFT}
              onPointerDown={stopSwipe}
              onClick={() => go(-1)}
              aria-label="Previous universe"
            >
              {"\u2039"}
            </button>
            <button
              type="button"
              style={ARROW_RIGHT}
              onPointerDown={stopSwipe}
              onClick={() => go(1)}
              aria-label="Next universe"
            >
              {"\u203A"}
            </button>

            <p style={META}>{current.own ? counter : T[lang].sub + "  \u00b7  " + counter}</p>
            <p style={CAPTION}>{captionText}</p>
          </>
        )}

        {/* Dive through the center of YOUR universe into the Egg-lobby menu (node 2).
            Center-as-entrance now works from ANY vertical level (not only the cosmos
            level vIdx===0); hidden only while the lobby itself or the Map overlay is open.
            zIndex + pointerEvents are forced here so the center stays clickable ABOVE the
            transparent canvas / dark veil / cover / flash full-screen layers -- those have
            no pointer-events:none, and the corner controls already sit at zIndex 40-60. */}
        {current.own && !mapOpen && !lobbyOpen && (
          <button
            type="button"
            style={Object.assign({}, CENTER_DIVE, { zIndex: 45, pointerEvents: "auto" })}
            onPointerDown={stopSwipe}
            onClick={diveToEgg}
            aria-label="Enter the Egg menu"
          >
            <span ref={diveRingRef} style={CENTER_DIVE_RING} aria-hidden="true" />
            <span style={CENTER_DIVE_HINT}>{lang === "ru" ? "\u0432\u043e\u0439\u0442\u0438" : "enter"}</span>
          </button>
        )}

        {/* Vertical "window" overlay -- empty panels floating above / below the living cosmos.
            Content + inner-energy (prana) mechanics get wired in later. */}
        {vIdx !== 0 && vIdx !== -2 && vIdx !== -1 && vIdx !== 1 && vIdx !== 2 && vIdx !== 3 && (
          <div style={WINDOW_OVERLAY}>
            <div ref={winPanelRef} style={WINDOW_PANEL}>
              <p style={WINDOW_KICKER}>
                {vIdx > 0
                  ? (lang === "ru" ? "\u0432\u0435\u0440\u0445" : "up")
                  : (lang === "ru" ? "\u043d\u0438\u0437" : "down")}
              </p>
              <p style={WINDOW_TITLE}>{winTitle}</p>
              <p style={WINDOW_SOON}>{lang === "ru" ? "\u2014 \u0441\u043a\u043e\u0440\u043e \u2014" : "\u2014 soon \u2014"}</p>
            </div>
          </div>
        )}

        {/* Node 1.2 -- the human architecture window: a 3-page horizontal pager.
            Center = human figure with meridian channels + points; left = 7 chakras; right = 9 dimensions. */}
        {vIdx === -2 && (
          <HumanWindow lang={lang} hIdx={hIdx} goH={goH} panelRef={winPanelRef} />
        )}

        {/* Node 1.1 -- Chatura-Loka: the four-layered cosmic Egg with Ra at the center. */}
        {vIdx === -1 && (
          <ChaturLokaWindow panelRef={winPanelRef} />
        )}
        {/* Node 1.4 -- Vedic Cosmos: 14 Lokas along Mount Meru with Ra at center. */}
        {vIdx === 1 && (
          <VedicLokaWindow panelRef={winPanelRef} />
        )}
        {/* Node 1.44 -- Cosmic Forces of Brahmanda: 21 luminous agents around Ra. */}
        {vIdx === 2 && (
          <CosmicForcesWindow panelRef={winPanelRef} />
        )}
        {/* Node 1.444 -- Satya Yuga: the golden gate into Creation, above the forces. */}
        {vIdx === 3 && (
          <SatyaYugaWindow panelRef={winPanelRef} lang={lang} />
        )}

        {/* Node 2 -- the Golden Egg lobby (4 gates), entered by clicking the CENTER of YOUR universe. */}
        {lobbyOpen && (
          <EggHub lang={lang} onClose={() => setLobbyOpen(false)} />
        )}

        {/* Placeholder overlay for the future Map of Creation (multi-map, concentric rings -> single Light). */}
        {mapOpen && (
          <div style={WINDOW_OVERLAY} onPointerDown={stopSwipe}>
            <div style={WINDOW_PANEL}>
              <p style={WINDOW_KICKER}>{lang === "ru" ? "\u043c\u0435\u0442\u0430-\u043a\u0430\u0440\u0442\u0430" : "meta-map"}</p>
              <p style={WINDOW_TITLE}>{lang === "ru" ? "\u041a\u0430\u0440\u0442\u0430 \u041c\u0438\u0440\u043e\u0437\u0434\u0430\u043d\u0438\u044f" : "Map of Creation"}</p>
              <p style={WINDOW_SOON}>{lang === "ru" ? "\u2014 \u0441\u043a\u043e\u0440\u043e \u2014" : "\u2014 soon \u2014"}</p>
              <button type="button" style={PILL} onPointerDown={stopSwipe} onClick={() => setMapOpen(false)}>
                {lang === "ru" ? "\u0437\u0430\u043a\u0440\u044b\u0442\u044c" : "close"}
              </button>
            </div>
          </div>
        )}

        {/* Vertical navigation arrows (list windows up / down). Keys: Up / Down. Drag stays orbit. */}
        {canUp && (
          <button
            type="button"
            style={ARROW_UP}
            onPointerDown={stopSwipe}
            onClick={() => goV(1)}
            aria-label="Window above"
          >
            {"\u25B2"}
          </button>
        )}
        {canDown && (
          <button
            type="button"
            style={ARROW_DOWN}
            onPointerDown={stopSwipe}
            onClick={() => goV(-1)}
            aria-label="Window below"
          >
            {"\u25BC"}
          </button>
        )}

        {/* Floor indicator: which vertical level you are on (top window -> living cosmos -> bottom). */}
        <div style={LEVEL_RAIL} aria-hidden="true">
          {V_RAIL.map((lv) => (
            <span key={lv} style={lv === vIdx ? LEVEL_DOT_ON : LEVEL_DOT} />
          ))}
        </div>
      </div>
    </div>
  );
}
