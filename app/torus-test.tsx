// Standalone test stand for the Toroidal Field of Light (Тороид — Дыхание Света).
// Open at /app/torus-test.html. Drag to orbit. The slider drives Light (0..1) as a
// VIBRATION LEVEL on Hawkins' Map of Consciousness (hate/low -> love/high): rotation
// speed, the standing-wave frequency pattern (lobes), brightness and color all rise
// with it. The HUD names the emotion + frequency (Hz) for the current level.
// Isolated from PlayerProvider so the engine (core/render/TorusField) is verified alone.

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { TorusField } from "../core/render/TorusField";
import { ResonanceField } from "../core/render/ResonanceField";
import * as THREE from "three";

// --- Hawkins Map of Consciousness, read as a vibration scale (Hz), low -> high. ---
type Level = { name: string; hz: number; color: string };
const SCALE: Level[] = [
  { name: "Стыд", hz: 20, color: "#5a1020" },
  { name: "Вина", hz: 30, color: "#73142a" },
  { name: "Апатия", hz: 50, color: "#7a2233" },
  { name: "Горе", hz: 75, color: "#8a3a2a" },
  { name: "Страх", hz: 100, color: "#9c5a1f" },
  { name: "Желание", hz: 125, color: "#b07415" },
  { name: "Ненависть · Гнев", hz: 150, color: "#c0392b" },
  { name: "Гордыня", hz: 175, color: "#c98a3a" },
  { name: "Смелость", hz: 200, color: "#cbb53a" },
  { name: "Нейтральность", hz: 250, color: "#9fc93a" },
  { name: "Готовность", hz: 310, color: "#5ec96b" },
  { name: "Принятие", hz: 350, color: "#3ec9a4" },
  { name: "Разум", hz: 400, color: "#3aa0c9" },
  { name: "Любовь", hz: 500, color: "#ff5fa2" },
  { name: "Радость", hz: 540, color: "#ffb14e" },
  { name: "Мир", hz: 600, color: "#c9a8ff" },
  { name: "Просветление", hz: 700, color: "#ffffff" },
];

function levelFor(light: number): Level {
  const idx = Math.min(SCALE.length - 1, Math.max(0, Math.floor(light * SCALE.length)));
  return SCALE[idx];
}

// Schumann resonance harmonics (Hz) -> circular-membrane modes (m diameters, n circles).
// Higher harmonics give richer cymatic figures.
type Harmonic = { hz: number; m: number; n: number };
const SCHUMANN: Harmonic[] = [
  { hz: 7.83, m: 2, n: 1 },
  { hz: 14.3, m: 3, n: 2 },
  { hz: 20.8, m: 5, n: 2 },
  { hz: 27.3, m: 6, n: 3 },
  { hz: 33.8, m: 8, n: 4 },
];

// Chakra spectrum (root -> crown). Used so colour radiates outward by frequency.
const CHAKRA_HEX = ["#ff2d2d", "#ff7a18", "#ffd400", "#3fe06a", "#36c5ff", "#4453ff", "#b14bff"];
const chakraColors = CHAKRA_HEX.map((h) => new THREE.Color(h));
function chakraColor(t: number): THREE.Color {
  const x = Math.min(0.9999, Math.max(0, t)) * (chakraColors.length - 1);
  const i = Math.floor(x);
  const out = new THREE.Color();
  out.copy(chakraColors[i]).lerp(chakraColors[Math.min(chakraColors.length - 1, i + 1)], x - i);
  return out;
}

// --- Shared "mood of the music": one pulse read per frame, handed to the whole
// scene so the heart torus + the ecosystem breathe with the song together. ---
type Mood = {
  on: boolean;
  level: number;
  bass: number;
  mid: number;
  treble: number;
  beat: number;
  hue: number;
  joy: number;
};
function makeMood(): Mood {
  return { on: false, level: 0, bass: 0, mid: 0, treble: 0, beat: 0, hue: 0.6, joy: 0.3 };
}
function hueColor(h: number): THREE.Color {
  const c = new THREE.Color();
  c.setHSL(((h % 1) + 1) % 1, 0.72, 0.58);
  return c;
}

// Reads the spectrum once per frame and writes a smoothed mood into moodRef.
// When audio is off it synthesises a gentle mood from the vibration slider so
// the world still breathes. Renders nothing.
function AudioMood(props: {
  analyser: React.MutableRefObject<AnalyserNode | null>;
  audioOn: boolean;
  vibe: number;
  beat: number;
  moodRef: React.MutableRefObject<Mood>;
}) {
  const buf = useRef<Uint8Array | null>(null);
  const bassAvg = useRef(0);
  const beatCd = useRef(0);
  useFrame((state, dt) => {
    const mood = props.moodRef.current;
    mood.beat = Math.max(0, mood.beat - dt * 2.2);
    beatCd.current = Math.max(0, beatCd.current - dt);
    const an = props.analyser.current;
    if (!props.audioOn || !an) {
      mood.on = false;
      const tt = state.clock.elapsedTime;
      const bt = props.beat > 0.05 ? props.beat : 1;
      const env = 0.5 + 0.5 * Math.sin(tt * bt * Math.PI * 2);
      const v = props.vibe;
      mood.level += (0.22 + 0.4 * v * env - mood.level) * 0.08;
      mood.bass += (0.3 * env - mood.bass) * 0.08;
      mood.mid += (0.3 * v - mood.mid) * 0.08;
      mood.treble += (0.3 * v * env - mood.treble) * 0.08;
      // No music: let the vibration slider stand in for the emotional reading.
      const joyTarget = v;
      mood.joy += (joyTarget - mood.joy) * 0.03;
      const sweep = (tt * 0.05) % 1;
      const joyHue = (sweep + 0.08) % 1;
      const target = 0.6 + (joyHue - 0.6) * mood.joy;
      const raw = target - mood.hue;
      const dh = (((raw % 1) + 1.5) % 1) - 0.5;
      mood.hue = (((mood.hue + dh * 0.04) % 1) + 1) % 1;
      return;
    }
    mood.on = true;
    const bins = an.frequencyBinCount;
    if (!buf.current || buf.current.length !== bins) buf.current = new Uint8Array(bins);
    const data = buf.current;
    an.getByteFrequencyData(data);
    const hzPerBin = an.context.sampleRate / 2 / bins;
    let bass = 0;
    let bassN = 0;
    let mid = 0;
    let midN = 0;
    let treble = 0;
    let trebleN = 0;
    let energy = 0;
    for (let i = 0; i < bins; i++) {
      const mag = data[i];
      energy += mag;
      const f = i * hzPerBin;
      if (f < 250) {
        bass += mag;
        bassN++;
      } else if (f < 2000) {
        mid += mag;
        midN++;
      } else {
        treble += mag;
        trebleN++;
      }
    }
    const bassA = bassN > 0 ? bass / (bassN * 255) : 0;
    const midA = midN > 0 ? mid / (midN * 255) : 0;
    const trebleA = trebleN > 0 ? treble / (trebleN * 255) : 0;
    const level = energy / (bins * 255);
    mood.level += (level - mood.level) * 0.2;
    mood.bass += (bassA - mood.bass) * 0.25;
    mood.mid += (midA - mood.mid) * 0.25;
    mood.treble += (trebleA - mood.treble) * 0.25;
    bassAvg.current += (bassA - bassAvg.current) * 0.08;
    if (bassA > bassAvg.current * 1.35 && bassA > 0.04 && beatCd.current <= 0) {
      mood.beat = 1;
      beatCd.current = 0.18;
    }
    const sum = bassA + midA + trebleA + 0.0001;
    const bright = trebleA / sum; // spectral tilt: bass-heavy (0) .. airy/treble (1)
    const loud = Math.min(1, level * 2.4); // perceived loudness 0..1
    const joyTarget = Math.min(1, 0.45 * bright + 0.55 * loud);
    mood.joy += (joyTarget - mood.joy) * 0.03; // emotions drift slowly, not jittery
    // Heavy / quiet music settles into deep blue; bright, energetic music opens
    // into a slowly moving rainbow. Blend the two by the emotional "joy" reading.
    const sweep = (state.clock.elapsedTime * 0.05) % 1;
    const joyHue = (sweep + bright * 0.3) % 1;
    const target = 0.6 + (joyHue - 0.6) * mood.joy;
    const raw = target - mood.hue;
    const dh = (((raw % 1) + 1.5) % 1) - 0.5;
    mood.hue = (((mood.hue + dh * 0.05) % 1) + 1) % 1;
  });
  return null;
}

// Paints the whole atmosphere from the music's mood: a deep, dim blue when the
// song is heavy or sad, opening into a brighter, warmer, rainbow-tinted space as
// it grows joyful. Tints the scene background + fog so the feeling fills the room.
function MoodAtmosphere(props: { moodRef: React.MutableRefObject<Mood> }) {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.FogExp2(0x070b1e, 0.02), []);
  const calm = useMemo(() => new THREE.Color("#070b1e"), []); // deep night-blue (never black)
  const warm = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);
  useFrame(() => {
    const mood = props.moodRef.current;
    const joy = mood.joy;
    // joyful end pulls a luminous tint from the live mood hue.
    warm.setHSL(((mood.hue % 1) + 1) % 1, 0.5, 0.16 + 0.16 * joy);
    tmp.copy(calm).lerp(warm, joy);
    // a soft beat-flash lifts the whole room — only ever brighter, never to black.
    const flash = mood.on ? 0.06 * mood.beat : 0;
    tmp.offsetHSL(0, 0, flash);
    const bg = scene.background as THREE.Color | null;
    if (bg && bg.isColor) {
      bg.copy(tmp);
    } else {
      scene.background = tmp.clone();
    }
    fog.color.copy(tmp);
    fog.density = 0.02 - 0.012 * joy; // joy clears the air; sadness fogs it in
  });
  return null;
}

// A living starfield: the night breathes with the song — stars wheel a little
// faster with the music and give a soft twinkle-pulse on every beat, drifting
// gently when it is quiet.
function MoodStars(props: { moodRef: React.MutableRefObject<Mood> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_s, dt) => {
    const g = ref.current;
    if (!g) return;
    const mood = props.moodRef.current;
    const spin = 0.015 + (mood.on ? mood.level * 0.22 : 0);
    g.rotation.y += dt * spin;
    g.rotation.x += dt * spin * 0.35;
    const pulse = 1 + (mood.on ? mood.beat * 0.05 : 0);
    g.scale.setScalar(pulse);
  });
  return (
    <group ref={ref}>
      <Stars radius={120} depth={60} count={4000} factor={5} saturation={0} fade speed={0.6} />
    </group>
  );
}

// Bloom that rejoices: when the music turns bright and joyful (or a beat lands),
// the whole world's glow swells. Throttled to ~8x/sec and pushed through React
// state — never mutate the Bloom effect by ref (that blanks the screen).
function MoodGlow(props: { moodRef: React.MutableRefObject<Mood>; onBoost: (v: number) => void }) {
  const acc = useRef(0);
  const last = useRef(0);
  useFrame((_s, dt) => {
    acc.current += dt;
    if (acc.current < 0.12) return;
    acc.current = 0;
    const mood = props.moodRef.current;
    const target = mood.on ? 1.4 * mood.joy + 0.6 * mood.beat : 0;
    if (Math.abs(target - last.current) < 0.05) return;
    last.current = target;
    props.onBoost(target);
  });
  return null;
}

// 1) Expanding ring shockwaves from the centre, one emitted per beat.
function CenterRings(props: { vibe: number; beat: number; show: boolean; moodRef: React.MutableRefObject<Mood> }) {
  const N = 6;
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.position.y = -1.56;
    for (let i = 0; i < N; i++) {
      const geo = new THREE.RingGeometry(0.9, 1.0, 96);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#7ad3ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.frustumCulled = false;
      m.scale.setScalar(0.001);
      g.add(m);
    }
    return g;
  }, []);
  const ages = useRef<number[]>(new Array(N).fill(999));
  const timer = useRef(0);
  const next = useRef(0);
  const beatGate = useRef(0);

  useEffect(() => {
    group.visible = props.show;
  }, [group, props.show]);
  useEffect(
    () => () => {
      group.children.forEach((c) => {
        const m = c as THREE.Mesh;
        (m.geometry as THREE.BufferGeometry).dispose();
        (m.material as THREE.Material).dispose();
      });
    },
    [group],
  );

  useFrame((_s, dt) => {
    const mood = props.moodRef.current;
    // with music: a ring blooms out on every beat; otherwise on the beat slider.
    const period = mood.on ? 0.3 + (1 - mood.level) * 1.0 : props.beat > 0.05 ? 1 / props.beat : 1.5;
    const life = 2.6;
    const maxR = 5.3;
    beatGate.current = Math.max(0, beatGate.current - dt);
    timer.current += dt;
    let emit = false;
    if (timer.current >= period) {
      timer.current -= period;
      emit = true;
    }
    if (mood.on && mood.beat > 0.85 && beatGate.current <= 0) {
      emit = true;
      beatGate.current = 0.16;
    }
    if (emit) {
      ages.current[next.current] = 0;
      next.current = (next.current + 1) % N;
    }
    const col = mood.on ? hueColor(mood.hue) : chakraColor(props.vibe);
    const boost = mood.on ? 0.5 + 0.5 * mood.level : 0.5;
    for (let i = 0; i < N; i++) {
      const a = ages.current[i];
      const mesh = group.children[i] as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (a > life) {
        mat.opacity = 0;
        continue;
      }
      const p = a / life;
      mesh.scale.setScalar(0.05 + p * maxR);
      mat.opacity = boost * (1 - p) * (1 - p);
      mat.color.copy(col);
      ages.current[i] = a + dt;
    }
  });

  return <primitive object={group} />;
}

// 2) Light sparks streaming outward from the centre; rate/speed rise with Light.
function CenterSparks(props: { vibe: number; light: number; show: boolean; moodRef: React.MutableRefObject<Mood> }) {
  const COUNT = 500;
  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const life = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) life[i] = Math.random() * 3;
    return { pos, vel, life };
  }, []);
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(data.pos, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color("#ffe6b0"),
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const g = new THREE.Group();
    g.position.y = -1.5;
    g.add(pts);
    return { g, geo, mat };
  }, [data]);

  useEffect(() => {
    obj.g.visible = props.show;
  }, [obj, props.show]);
  useEffect(
    () => () => {
      obj.geo.dispose();
      obj.mat.dispose();
    },
    [obj],
  );

  useFrame((_s, dt) => {
    const mood = props.moodRef.current;
    const k = Math.min(2, dt * 60);
    const drive = mood.on ? mood.level : props.light;
    const speed = 0.6 + drive * 2.2 + (mood.on ? mood.beat * 1.6 : 0);
    const up = 0.25 + drive * 0.6 + (mood.on ? mood.bass * 0.5 : 0);
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      let l = data.life[i] - dt;
      if (l <= 0) {
        const th = Math.random() * Math.PI * 2;
        const sp = speed * (0.5 + Math.random());
        data.vel[ix] = Math.cos(th) * sp;
        data.vel[ix + 1] = up * (0.4 + Math.random());
        data.vel[ix + 2] = Math.sin(th) * sp;
        data.pos[ix] = 0;
        data.pos[ix + 1] = 0;
        data.pos[ix + 2] = 0;
        l = 1.4 + Math.random() * 1.8;
      } else {
        data.pos[ix] += data.vel[ix] * dt;
        data.pos[ix + 1] += data.vel[ix + 1] * dt;
        data.pos[ix + 2] += data.vel[ix + 2] * dt;
        data.vel[ix + 1] -= 0.4 * dt * k;
      }
      data.life[i] = l;
    }
    obj.mat.color.copy(mood.on ? hueColor(mood.hue) : chakraColor(props.vibe));
    obj.mat.opacity = 0.45 + (mood.on ? mood.level : props.light) * 0.45;
    (obj.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return <primitive object={obj.g} />;
}

// Expanding wave-rings that radiate outward FAR beyond the torus, each on its
// own random plane, so the music sends ripples off into space. Driven by mood:
// they bloom on beats, brighten with loudness and take the song's colour.
function SpectrumWaves(props: { show: boolean; moodRef: React.MutableRefObject<Mood> }) {
  const N = 10;
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.position.y = -1.5;
    for (let i = 0; i < N; i++) {
      const geo = new THREE.RingGeometry(0.92, 1.0, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#9fd0ff"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(geo, mat);
      m.frustumCulled = false;
      m.scale.setScalar(0.001);
      g.add(m);
    }
    return g;
  }, []);
  const ages = useRef<number[]>(new Array(N).fill(999));
  const next = useRef(0);
  const timer = useRef(0);
  const beatGate = useRef(0);
  const baseCol = useMemo(() => new THREE.Color("#9fd0ff"), []);

  useEffect(() => {
    group.visible = props.show;
  }, [group, props.show]);
  useEffect(
    () => () => {
      group.children.forEach((c) => {
        const m = c as THREE.Mesh;
        (m.geometry as THREE.BufferGeometry).dispose();
        (m.material as THREE.Material).dispose();
      });
    },
    [group],
  );

  useFrame((_s, dt) => {
    const mood = props.moodRef.current;
    beatGate.current = Math.max(0, beatGate.current - dt);
    const period = mood.on ? 0.5 + (1 - mood.level) * 1.4 : 2.0;
    timer.current += dt;
    let emit = false;
    if (timer.current >= period) {
      timer.current -= period;
      emit = true;
    }
    if (mood.on && mood.beat > 0.85 && beatGate.current <= 0) {
      emit = true;
      beatGate.current = 0.2;
    }
    if (emit) {
      const idx = next.current;
      ages.current[idx] = 0;
      const mesh = group.children[idx] as THREE.Mesh;
      // random tilt so each wave radiates into space on its own plane.
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      next.current = (next.current + 1) % N;
    }
    const col = mood.on ? hueColor(mood.hue) : baseCol;
    const life = 3.2;
    const maxR = 11;
    for (let i = 0; i < N; i++) {
      const a = ages.current[i];
      const mesh = group.children[i] as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (a > life) {
        mat.opacity = 0;
        continue;
      }
      const p = a / life;
      mesh.scale.setScalar(0.3 + p * maxR);
      const amp = mood.on ? 0.32 + 0.4 * mood.level : 0.16;
      mat.opacity = amp * (1 - p);
      mat.color.copy(col);
      ages.current[i] = a + dt;
    }
  });

  return <primitive object={group} />;
}

function ResonancePlane(props: {
  vibe: number;
  show: boolean;
  beat: number;
  audioOn: boolean;
  analyser: React.MutableRefObject<AnalyserNode | null>;
}) {
  const field = useMemo(() => new ResonanceField({}), []);
  const buf = useRef<Uint8Array | null>(null);
  const mode = useRef({ m: 0, n: 0 });
  const lvl = useRef(0);
  const bassAvg = useRef(0);
  const beatEnv = useRef(0);
  const beatCd = useRef(0);

  // Continuous vibration scale drives the figure smoothly when audio is OFF.
  // No scatter: as the slider moves, m/n drift and the sand morphs gradually.
  useEffect(() => {
    if (props.audioOn) return;
    const v = props.vibe;
    const mf = v * 9; // 0 -> pure concentric rings, up -> a many-petalled flower
    const nf = 1 + v * 4; // more nodal circles higher up the scale
    const hz = 7.83 + v * 32; // base Schumann 7.83 Hz -> ~40 Hz
    field.setModeF(mf, nf);
    field.setFrequency(hz);
    mode.current = { m: mf, n: nf };
  }, [field, props.vibe, props.audioOn]);

  useEffect(() => {
    field.group.visible = props.show;
  }, [field, props.show]);

  useEffect(() => () => field.dispose(), [field]);

  useFrame((state, dt) => {
    // beat flash + cooldown decay every frame
    beatEnv.current = Math.max(0, beatEnv.current - dt * 2.4);
    beatCd.current = Math.max(0, beatCd.current - dt);
    // gentle rotation so the figure always reads as alive
    field.group.rotation.y += dt * 0.12;
    field.update(dt);
    if (!props.audioOn) {
      // two-frequency interference: the pattern breathes at the beat rate, i.e.
      // the envelope of two waves spaced props.beat Hz apart. beat = 0 -> steady.
      const tt = state.clock.elapsedTime;
      const env = 0.5 + 0.5 * Math.cos(tt * props.beat * Math.PI * 2);
      field.setAmplitude(0.12 + 0.22 * env);
      field.setAgitation(0.06 + 0.2 * env);
      return;
    }
    const an = props.analyser.current;
    if (!an) return;
    const bins = an.frequencyBinCount;
    if (!buf.current || buf.current.length !== bins) buf.current = new Uint8Array(bins);
    const data = buf.current;
    an.getByteFrequencyData(data);
    const hzPerBin = an.context.sampleRate / 2 / bins;
    // split the spectrum into bass / mid / treble bands
    let bass = 0;
    let bassN = 0;
    let mid = 0;
    let midN = 0;
    let treble = 0;
    let trebleN = 0;
    let energy = 0;
    for (let i = 0; i < bins; i++) {
      const mag = data[i];
      energy += mag;
      const f = i * hzPerBin;
      if (f < 250) {
        bass += mag;
        bassN++;
      } else if (f < 2000) {
        mid += mag;
        midN++;
      } else {
        treble += mag;
        trebleN++;
      }
    }
    const bassA = bassN > 0 ? bass / (bassN * 255) : 0;
    const midA = midN > 0 ? mid / (midN * 255) : 0;
    const trebleA = trebleN > 0 ? treble / (trebleN * 255) : 0;
    const level = energy / (bins * 255);
    lvl.current += (level - lvl.current) * 0.2; // smooth loudness

    // beat = sudden bass spike above its running average
    bassAvg.current += (bassA - bassAvg.current) * 0.08;
    if (bassA > bassAvg.current * 1.35 && bassA > 0.04 && beatCd.current <= 0) {
      beatEnv.current = 1;
      beatCd.current = 0.18;
    }

    // bass -> nodal rings (n); treble -> diameters / spokes (m)
    const n = Math.max(1, Math.min(5, Math.round(1 + bassA * 7)));
    const m = Math.max(2, Math.min(11, Math.round(2 + trebleA * 16)));
    if (m !== mode.current.m || n !== mode.current.n) {
      field.setMode(m, n);
      mode.current = { m, n };
    }

    // mid + overall loudness lift the plate; the beat adds a sharp pop
    field.setAmplitude(0.1 + 0.55 * lvl.current + 0.35 * midA + 0.5 * beatEnv.current);
    field.setAgitation(Math.min(1, lvl.current * 1.8 + beatEnv.current));
  });

  return <primitive object={field.group} />;
}

function TorusBreath(props: { light: number; spin: number; moodRef: React.MutableRefObject<Mood> }) {
  const field = useMemo(() => new TorusField({ light: props.light }), []);
  const three = useThree();
  const baseLight = useRef(props.light);
  const baseSpin = useRef(props.spin);

  useEffect(() => {
    baseLight.current = props.light;
    field.setLight(props.light);
  }, [field, props.light]);

  useEffect(() => {
    baseSpin.current = props.spin;
    field.setSpin(props.spin);
  }, [field, props.spin]);

  useEffect(() => () => field.dispose(), [field]);

  useFrame((_, dt) => {
    const mood = props.moodRef.current;
    if (mood.on) {
      // The heart torus breathes WITH the song: brighter and flaring on beats,
      // spinning up on the highs, and its very shape ripples + pumps to the mix
      // (bass swells the surface, mids add petals, treble quickens the ripple,
      //  beats squash-and-bulge it like a heartbeat).
      const lit = Math.min(1, baseLight.current * (0.7 + 0.5 * mood.level) + 0.35 * mood.beat);
      field.setLight(lit);
      field.setSpin(baseSpin.current * (1 + 0.8 * mood.treble + 0.6 * mood.beat));
      field.setMorph({
        amp: 0.1 * mood.bass + 0.18 * mood.beat,
        mode: 5 * mood.mid,
        freq: 3 * mood.treble + 4 * mood.beat,
        squash: 0.18 * mood.beat + 0.08 * mood.bass,
        bulge: 0.12 * mood.level + 0.15 * mood.beat,
      });
    } else {
      // No music: relax the morph so the slider-driven torus looks as before.
      field.setLight(baseLight.current);
      field.setSpin(baseSpin.current);
      field.setMorph({});
    }
    field.update(dt, three.camera.position);
  });

  return <primitive object={field.group} />;
}

// --- Cosmic colour disco: rainbow club lights flashing to the beat across space,
// a pulsing coloured cosmos, a bloom strobe, and a slow spin of the whole scene.
function Disco(props: {
  on: boolean;
  beat: number;
}) {
  const three = useThree();
  const COUNT = 260;
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const hue = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 9 + Math.random() * 11;
      pos[i * 3] = Math.cos(th) * s * r;
      pos[i * 3 + 1] = u * r * 0.6 - 0.5;
      pos[i * 3 + 2] = Math.sin(th) * s * r;
      hue[i] = Math.random();
      phase[i] = Math.random() * Math.PI * 2;
      col[i * 3] = 1;
      col[i * 3 + 1] = 1;
      col[i * 3 + 2] = 1;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const g = new THREE.Group();
    g.add(pts);
    return { g, geo, mat, hue, phase };
  }, []);

  const tRef = useRef(0);
  const baseBg = useMemo(() => new THREE.Color("#0b0712"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    obj.g.visible = props.on;
  }, [obj, props.on]);

  useEffect(
    () => () => {
      obj.geo.dispose();
      obj.mat.dispose();
    },
    [obj],
  );

  useFrame((_s, dt) => {
    const scene = three.scene;
    if (!props.on) {
      obj.g.visible = false;
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(baseBg, Math.min(1, dt * 4));
      }
      return;
    }
    obj.g.visible = true;
    tRef.current += dt;
    const t = tRef.current;
    const beat = props.beat > 0.05 ? props.beat : 1.5;
    const env = 0.5 + 0.5 * Math.sin(t * beat * Math.PI * 2);
    const flash = env * env;
    const baseHue = (t * 0.12) % 1;

    const colAttr = obj.geo.getAttribute("color") as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const h = (obj.hue[i] + baseHue) % 1;
      const b = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * beat * Math.PI * 2 + obj.phase[i]));
      tmp.setHSL(h, 1, 0.5 * b);
      arr[i * 3] = tmp.r;
      arr[i * 3 + 1] = tmp.g;
      arr[i * 3 + 2] = tmp.b;
    }
    colAttr.needsUpdate = true;
    obj.g.rotation.y += dt * 0.25;
    obj.mat.size = 0.55 + 0.45 * flash;

    // Disco only ADDS light/colour — it never drives the scene toward black,
    // so there is no harsh flicker into darkness.
    if (scene.background instanceof THREE.Color) {
      tmp.setHSL(baseHue, 0.55, 0.07 + 0.06 * env);
      scene.background.lerp(tmp, Math.min(1, dt * 2.5));
    }
  });

  return <primitive object={obj.g} />;
}

// All inline objects are named consts (single-brace JSX) on purpose.
const cameraProps = { position: [0, 1.4, 6] as [number, number, number], fov: 50 };
const bgArgs: [string] = ["#0b0712"];

const panelStyle: React.CSSProperties = {
  position: "fixed",
  left: "18px",
  bottom: "18px",
  zIndex: 20,
  width: "268px",
  padding: "14px 16px",
  borderRadius: "14px",
  background: "rgba(18,16,28,0.55)",
  border: "1px solid rgba(201,168,76,0.35)",
  color: "#e6e1f2",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  letterSpacing: "0.04em",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: "14px",
  letterSpacing: "0.12em",
  color: "#c9a84c",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  marginBottom: "10px",
};

const chevronStyle: React.CSSProperties = { color: "#c9a84c", fontSize: "12px" };

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "8px",
};

const valueStyle: React.CSSProperties = { color: "#7ad3ff" };

const sliderStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "6px",
  accentColor: "#c9a84c",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "12px",
  cursor: "pointer",
};

const checkStyle: React.CSSProperties = { accentColor: "#c9a84c" };

const hintStyle: React.CSSProperties = {
  marginTop: "10px",
  opacity: 0.6,
  lineHeight: 1.5,
};

const btnRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  marginTop: "8px",
};

const btnStyle: React.CSSProperties = {
  flex: "1 1 auto",
  padding: "4px 6px",
  borderRadius: "8px",
  border: "1px solid rgba(122,211,255,0.35)",
  background: "rgba(122,211,255,0.06)",
  color: "#cfe9ff",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  cursor: "pointer",
};

const btnActiveStyle: React.CSSProperties = {
  ...btnStyle,
  borderColor: "#7ad3ff",
  color: "#cdebff",
  boxShadow: "0 0 8px rgba(122,211,255,0.5)",
};

const chipRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  marginTop: "6px",
};

const chipStyle: React.CSSProperties = {
  width: "22px",
  height: "22px",
  borderRadius: "6px",
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(255,255,255,0.04)",
  color: "#d8c79a",
  fontSize: "11px",
  cursor: "pointer",
};

const chipActiveStyle: React.CSSProperties = {
  ...chipStyle,
  borderColor: "#7ad3ff",
  color: "#eaf6ff",
  background: "rgba(122,211,255,0.18)",
};

const hiddenInputStyle: React.CSSProperties = { display: "none" };

const dividerStyle: React.CSSProperties = {
  height: "1px",
  background: "rgba(201,168,76,0.25)",
  margin: "12px 0 4px",
};

const barTrackStyle: React.CSSProperties = {
  position: "relative",
  height: "8px",
  borderRadius: "6px",
  marginTop: "10px",
  overflow: "hidden",
  background:
    "linear-gradient(90deg,#5a1020,#c0392b,#cbb53a,#5ec96b,#3aa0c9,#ff5fa2,#ffffff)",
};

// --- Resonator network: several little resonators you can place + connect. ---
type NetNode = { id: number; vibe: number; light: number; phase: number; chakra: number };

function netPos(i: number, count: number, layout: string, t: number): [number, number, number] {
  const spin = t * 0.15;
  if (layout === "spine") {
    const y = -2.2 + i * 0.72;
    return [Math.sin(t * 0.4 + i) * 0.05, y, Math.cos(t * 0.4 + i) * 0.05];
  }
  if (layout === "sun") {
    if (i === 0) return [0, -1.4, 0];
    const k = count > 1 ? (i - 1) / (count - 1) : 0;
    const a = k * Math.PI * 2 + spin;
    const r = 3.4;
    return [Math.cos(a) * r, -1.4, Math.sin(a) * r];
  }
  if (layout === "free") {
    const h = Math.sin(i * 12.9898) * 43758.5453;
    const rnd = h - Math.floor(h);
    const a = rnd * Math.PI * 2 + spin * 0.3;
    const r = 1.8 + rnd * 2.6;
    return [Math.cos(a) * r, -1.4 + (rnd - 0.5) * 2.2, Math.sin(a) * r];
  }
  const a = (count > 0 ? i / count : 0) * Math.PI * 2 + spin;
  const r = 3.2;
  return [Math.cos(a) * r, -1.45, Math.sin(a) * r];
}

// Each node is a FULL Toroidal Field of Light (its own torus engine floating in space),
// full detail like the central one, just spaced apart so several can coexist and be linked.
const NODE_SCALE = 0.8;

function ResonatorNet(props: {
  nodes: NetNode[];
  links: [number, number][];
  layout: string;
  orbit: boolean;
  show: boolean;
  activeId: number | null;
  manual: Record<number, [number, number, number]>;
  onMove: (id: number, pos: [number, number, number]) => void;
}) {
  const RING_PER = 2;
  const sig =
    props.nodes.map((n) => n.id).join(",") +
    "|" +
    props.links.map((l) => l[0] + "-" + l[1]).join(",") +
    "|" +
    props.layout;

  const built = useMemo(() => {
  const root = new THREE.Group();
  const toruses: TorusField[] = [];
  const hitboxes: THREE.Mesh[] = [];
    const disposables: THREE.BufferGeometry[] = [];

  for (let i = 0; i < props.nodes.length; i++) {
  const g = new THREE.Group();
  g.userData.nodeIndex = i;
  // a FULL torus engine per node — same richness as the central one.
  const tf = new TorusField({
    light: props.nodes[i].light,
    spinSpeed: 0.25,
  });
  g.add(tf.group);
  g.scale.setScalar(NODE_SCALE);
    // invisible pick sphere so the node can be grabbed + dragged with the mouse.
      const hitGeo = new THREE.SphereGeometry(1.8, 12, 12);
      const hit = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.nodeIndex = i;
      g.add(hit);
      disposables.push(hitGeo);
      hitboxes.push(hit);
      toruses.push(tf);
      root.add(g);
    }

    const linkLines: THREE.Line[] = [];
    const linkPulses: THREE.Mesh[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.09, 10, 10);
    disposables.push(pulseGeo);
    for (let i = 0; i < props.links.length; i++) {
      const lgeo = new THREE.BufferGeometry();
      lgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const lmat = new THREE.LineBasicMaterial({
        color: new THREE.Color("#9fd0ff"),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(lgeo, lmat);
      line.frustumCulled = false;
      root.add(line);
      linkLines.push(line);
      const pmat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pulse = new THREE.Mesh(pulseGeo, pmat);
      pulse.frustumCulled = false;
      root.add(pulse);
      linkPulses.push(pulse);
    }

    return { root, toruses, hitboxes, linkLines, linkPulses, disposables };
  }, [sig]);

  useEffect(() => {
    built.root.visible = props.show;
  }, [built, props.show]);

  useEffect(
    () => () => {
      built.disposables.forEach((d) => d.dispose());
      built.toruses.forEach((tf) => tf.dispose());
      built.hitboxes.forEach((h) => (h.material as THREE.Material).dispose());
      built.linkLines.forEach((l) => (l.material as THREE.Material).dispose());
      built.linkPulses.forEach((p) => (p.material as THREE.Material).dispose());
    },
    [built],
  );

  const { camera, gl, raycaster } = useThree();
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const builtRef = useRef(built);
  builtRef.current = built;
  const propsRef = useRef(props);
  propsRef.current = props;
  const dragId = useRef<number | null>(null);
  const dragPlane = useRef(new THREE.Plane());
  const ndc = useRef(new THREE.Vector2());
  const hitPoint = useRef(new THREE.Vector3());

  // Grab a node with the mouse and slide it on a camera-facing plane. Orbit is paused
  // only while a node is held, so the rest of the canvas still rotates freely.
  useEffect(() => {
    const el = gl.domElement;
    function setNDC(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      ndc.current.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
    }
    function onDown(e: PointerEvent) {
      const b = builtRef.current;
      if (!propsRef.current.show || !b) return;
      setNDC(e);
      raycaster.setFromCamera(ndc.current, camera);
      const hits = raycaster.intersectObjects(b.hitboxes, false);
      if (!hits.length) return;
      const idx = hits[0].object.userData.nodeIndex as number;
      const node = propsRef.current.nodes[idx];
      if (!node) return;
      dragId.current = node.id;
      const grp = b.root.children[idx] as THREE.Object3D;
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      dragPlane.current.setFromNormalAndCoplanarPoint(camDir, grp.position.clone());
      if (controls) controls.enabled = false;
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
        void err;
      }
    }
    function onMove(e: PointerEvent) {
      if (dragId.current == null) return;
      setNDC(e);
      raycaster.setFromCamera(ndc.current, camera);
      const ok = raycaster.ray.intersectPlane(dragPlane.current, hitPoint.current);
      if (!ok) return;
      propsRef.current.onMove(dragId.current, [
        hitPoint.current.x,
        hitPoint.current.y,
        hitPoint.current.z,
      ]);
    }
    function onUp(e: PointerEvent) {
      if (dragId.current == null) return;
      dragId.current = null;
      if (controls) controls.enabled = true;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (err) {
        void err;
      }
    }
    el.addEventListener("pointerdown", onDown, true);
    el.addEventListener("pointermove", onMove, true);
    el.addEventListener("pointerup", onUp, true);
    return () => {
      el.removeEventListener("pointerdown", onDown, true);
      el.removeEventListener("pointermove", onMove, true);
      el.removeEventListener("pointerup", onUp, true);
    };
  }, [gl, camera, raycaster, controls]);

  const tideRef = useRef(0);
  // Runtime coupling state, kept in a ref so we never re-render per frame.
  // phase[id] = the node's current oscillator angle; light[id] = its current
  // effective brightness. Both evolve along the links: phases pull into one
  // shared rhythm (Kuramoto), and light flows from bright nodes to dim ones.
  const simRef = useRef<{ phase: Record<number, number>; light: Record<number, number> }>({
    phase: {},
    light: {},
  });

  useFrame((state, dt) => {
    if (!props.show) return;
    tideRef.current += dt;
    const t = tideRef.current;
    const tt = props.orbit ? t : 0;
    const nodes = props.nodes;
    const count = nodes.length;
    const camPos = state.camera.position;
    const positions: [number, number, number][] = [];
    const sim = simRef.current;

    // --- neighbour lists from the current links (by node id) ---
    const neighbours: Record<number, number[]> = {};
    for (let i = 0; i < count; i++) neighbours[nodes[i].id] = [];
    for (let li = 0; li < props.links.length; li++) {
      const a = props.links[li][0];
      const b = props.links[li][1];
      if (neighbours[a] && neighbours[b]) {
        neighbours[a].push(b);
        neighbours[b].push(a);
      }
    }

    // --- seed runtime phase/light for any new node from its own base values ---
    for (let i = 0; i < count; i++) {
      const id = nodes[i].id;
      if (sim.phase[id] == null) sim.phase[id] = nodes[i].phase;
      if (sim.light[id] == null) sim.light[id] = nodes[i].light;
    }

    // --- integrate coupling: phase sync + light flow along the links ---
    const K = 1.6; // how hard linked nodes pull each other into one rhythm
    const D = 0.9; // how fast light flows from a bright node to a dim neighbour
    const step = Math.min(dt, 0.05);
    const nextPhase: Record<number, number> = {};
    const nextLight: Record<number, number> = {};
    for (let i = 0; i < count; i++) {
      const id = nodes[i].id;
      const omega = 1 + nodes[i].vibe * 3; // this node's natural frequency
      const ph = sim.phase[id];
      const myLight = sim.light[id];
      const nb = neighbours[id];
      let dPhase = omega;
      let dLight = 0;
      for (let k = 0; k < nb.length; k++) {
        const jp = sim.phase[nb[k]];
        const jl = sim.light[nb[k]];
        if (jp != null) dPhase += K * Math.sin(jp - ph);
        if (jl != null) dLight += D * (jl - myLight);
      }
      nextPhase[id] = ph + dPhase * step;
      // each node also drifts back toward its own vibe-brightness, so a lone
      // node keeps its colour while a connected cluster settles to a shared glow.
      const target = 0.3 + 0.6 * nodes[i].vibe;
      const pull = (target - myLight) * 0.5;
      nextLight[id] = Math.max(0, Math.min(1, myLight + (dLight + pull) * step));
    }
    sim.phase = nextPhase;
    sim.light = nextLight;

    for (let i = 0; i < count; i++) {
      const node = nodes[i];
      const mp = props.manual[node.id];
      const p = mp ? mp : netPos(i, count, props.layout, tt);
      positions.push(p);
      const grp = built.root.children[i] as THREE.Group;
      if (grp) grp.position.set(p[0], p[1], p[2]);
      const isActive = node.id === props.activeId;
      // pulse + brightness are driven by the SYNCED phase and the FLOWING light,
      // so connected nodes visibly breathe together.
      const pulse = 0.5 + 0.5 * Math.sin(sim.phase[node.id]);
      const tf = built.toruses[i];
      if (tf) {
        tf.setLight(sim.light[node.id]);
        tf.setSpin(0.6 + node.vibe * 2.2);
        tf.update(dt, camPos);
      }
      if (grp) grp.scale.setScalar(NODE_SCALE * (isActive ? 1.3 : 1) * (0.97 + pulse * 0.06));
    }

    for (let li = 0; li < props.links.length; li++) {
      const aId = props.links[li][0];
      const bId = props.links[li][1];
      const ai = nodes.findIndex((n) => n.id === aId);
      const bi = nodes.findIndex((n) => n.id === bId);
      const line = built.linkLines[li];
      const pulse = built.linkPulses[li];
      if (ai < 0 || bi < 0 || !positions[ai] || !positions[bi]) {
        if (line) line.visible = false;
        if (pulse) pulse.visible = false;
        continue;
      }
      line.visible = true;
      pulse.visible = true;
      const pa = positions[ai];
      const pb = positions[bi];
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      arr[0] = pa[0]; arr[1] = pa[1]; arr[2] = pa[2];
      arr[3] = pb[0]; arr[4] = pb[1]; arr[5] = pb[2];
      attr.needsUpdate = true;
      const col = chakraColor((nodes[ai].vibe + nodes[bi].vibe) * 0.5);
      const lineMat = line.material as THREE.LineBasicMaterial;
      lineMat.color.copy(col);
      // sync = how aligned the two ends are right now. In phase -> the link
      // glows; out of phase -> it dims, so you can watch them lock together.
      const sync = 0.5 + 0.5 * Math.cos(sim.phase[aId] - sim.phase[bId]);
      lineMat.opacity = 0.2 + 0.6 * sync;
      // the bead flows from the brighter node toward the dimmer one (a current
      // of light); the stronger the sync, the faster and brighter it runs.
      const la = sim.light[aId];
      const lb = sim.light[bId];
      const speed = 0.3 + 0.7 * sync;
      const raw = (t * speed + li * 0.37) % 1;
      const fp = la >= lb ? raw : 1 - raw;
      pulse.position.set(
        pa[0] + (pb[0] - pa[0]) * fp,
        pa[1] + (pb[1] - pa[1]) * fp,
        pa[2] + (pb[2] - pa[2]) * fp,
      );
      const pulseMat = pulse.material as THREE.MeshBasicMaterial;
      pulseMat.color.copy(col);
      const carry = 0.4 + 0.6 * Math.max(la, lb);
      pulseMat.opacity = (0.4 + 0.6 * sync) * carry;
      pulse.scale.setScalar(0.7 + 0.9 * sync * carry);
    }
  });

  return <primitive object={built.root} />;
}

function Stand() {
  const [light, setLight] = useState(0.6);
  const [auto, setAuto] = useState(true);
  const [spin, setSpin] = useState(1);
  const [glow, setGlow] = useState(1.75);
  const [reson, setReson] = useState(true);
  const [vibe, setVibe] = useState(0.25);
  const [collapsed, setCollapsed] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [audioName, setAudioName] = useState("");
  const [toneOn, setToneOn] = useState(false);
  const [beatHz, setBeatHz] = useState(2);
  const [sweeping, setSweeping] = useState(false);
  const [chordOn, setChordOn] = useState(false);
  const [story, setStory] = useState(false);
  const [nodes, setNodes] = useState<NetNode[]>([]);
  const [links, setLinks] = useState<[number, number][]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [layout, setLayout] = useState("mandala");
  const [orbit, setOrbit] = useState(false);
  const [netShow, setNetShow] = useState(true);
  const [nodeToneOn, setNodeToneOn] = useState(false);
  const [nodePos, setNodePos] = useState<Record<number, [number, number, number]>>({});
  const [disco, setDisco] = useState(false);
  const [glowBoost, setGlowBoost] = useState(0);
  const moodRef = useRef<Mood>(makeMood());
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const toneOscRef = useRef<OscillatorNode | null>(null);
  const toneOsc2Ref = useRef<OscillatorNode | null>(null);
  const toneGainRef = useRef<GainNode | null>(null);
  const chordOscsRef = useRef<{ osc: OscillatorNode; mult: number }[]>([]);
  const chordGainRef = useRef<GainNode | null>(null);
  const nodeToneOscRef = useRef<OscillatorNode | null>(null);
  const nodeToneGainRef = useRef<GainNode | null>(null);
  const bloomRef = useRef<{ intensity: number } | null>(null);
  const sweepRef = useRef<number>(0);
  const nodeSeq = useRef(1);
  const [panel, setPanel] = useState<string | null>("light");

  function setNodeVibe(id: number, v: number) {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, vibe: v } : n)));
  }
  function resetActivePos() {
    if (activeId == null) return;
    setNodePos((m) => {
      const next = { ...m };
      delete next[activeId];
      return next;
    });
  }
  function addNode() {
    const id = nodeSeq.current++;
    setNodes((ns) => [
      ...ns,
      { id, vibe: Math.random(), light: 0.6, phase: Math.random() * Math.PI * 2, chakra: ns.length % 7 },
    ]);
    setActiveId(id);
  }
  function removeActive() {
    if (nodes.length === 0) return;
    const target =
      activeId != null && nodes.some((n) => n.id === activeId) ? activeId : nodes[nodes.length - 1].id;
    const next = nodes.filter((n) => n.id !== target);
    setNodes(next);
    setLinks((ls) => ls.filter((l) => l[0] !== target && l[1] !== target));
    setActiveId(next.length ? next[next.length - 1].id : null);
  }
  function linkRing() {
    if (nodes.length < 2) return;
    const out: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) out.push([nodes[i].id, nodes[(i + 1) % nodes.length].id]);
    setLinks(out);
  }
  function linkStar() {
    if (nodes.length < 2) return;
    const out: [number, number][] = [];
    for (let i = 1; i < nodes.length; i++) out.push([nodes[0].id, nodes[i].id]);
    setLinks(out);
  }
  function linkAll() {
    const out: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) out.push([nodes[i].id, nodes[j].id]);
    setLinks(out);
  }
  function clearLinks() {
    setLinks([]);
  }

  function ensureCtx(): AudioContext {
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  }

  function ensureAnalyser(ctx: AudioContext): AnalyserNode {
    if (!analyserRef.current) {
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      an.smoothingTimeConstant = 0.82;
      analyserRef.current = an;
    }
    return analyserRef.current;
  }

  async function onAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const ctx = ensureCtx();
    await ctx.resume();
    let el = audioElRef.current;
    if (!el) {
      el = new Audio();
      el.loop = true;
      audioElRef.current = el;
    }
    el.src = URL.createObjectURL(file);
    const an = ensureAnalyser(ctx);
    if (!srcRef.current) {
      srcRef.current = ctx.createMediaElementSource(el);
      srcRef.current.connect(an);
      an.connect(ctx.destination);
    }
    setAudioName(file.name);
    setAudioOn(true);
    await el.play();
  }

  async function onMic() {
    const ctx = ensureCtx();
    await ctx.resume();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const an = ensureAnalyser(ctx);
    const mic = ctx.createMediaStreamSource(stream);
    mic.connect(an); // analyse only, do not route mic to speakers
    setAudioName("Микрофон");
    setAudioOn(true);
  }

  function stopAudio() {
    if (audioElRef.current) audioElRef.current.pause();
    setAudioOn(false);
  }

  // --- Tone generator: sing the actual vibration frequency, octave-shifted up so
  //     the sub-audible Schumann band (7.83..40 Hz) becomes audible (x16). ---
  const TONE_OCTAVE = 16;
  function audibleHz(v: number): number {
    return (7.83 + v * 32) * TONE_OCTAVE;
  }

  function startTone() {
    const ctx = ensureCtx();
    ctx.resume();
    let gain = toneGainRef.current;
    if (!gain) {
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      toneGainRef.current = gain;
    }
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(audibleHz(vibe), ctx.currentTime);
    osc.connect(gain);
    osc.start();
    toneOscRef.current = osc;
    // second, slightly detuned voice -> audible beats at |f2 - f1| = beatHz
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(audibleHz(vibe) + beatHz, ctx.currentTime);
    osc2.connect(gain);
    osc2.start();
    toneOsc2Ref.current = osc2;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.05);
    // optional chord voices: a perfect fifth + octave above the root (consonant)
    chordOscsRef.current = [];
    if (chordOn) {
      let cg = chordGainRef.current;
      if (!cg) {
        cg = ctx.createGain();
        cg.gain.value = 0;
        cg.connect(ctx.destination);
        chordGainRef.current = cg;
      }
      cg.gain.cancelScheduledValues(ctx.currentTime);
      cg.gain.setTargetAtTime(0.05, ctx.currentTime, 0.06);
      for (const mult of [1.5, 2]) {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(audibleHz(vibe) * mult, ctx.currentTime);
        o.connect(cg);
        o.start();
        chordOscsRef.current.push({ osc: o, mult });
      }
    }
    setToneOn(true);
  }

  function stopTone() {
    const ctx = audioCtxRef.current;
    const gain = toneGainRef.current;
    const osc = toneOscRef.current;
    const osc2 = toneOsc2Ref.current;
    if (ctx && gain) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    const stopAt = ctx ? ctx.currentTime + 0.2 : 0;
    for (const o of [osc, osc2]) {
      if (o) {
        try {
          o.stop(stopAt);
        } catch (err) {
          void err;
        }
      }
    }
    for (const c of chordOscsRef.current) {
      try {
        c.osc.stop(stopAt);
      } catch (err) {
        void err;
      }
    }
    chordOscsRef.current = [];
    if (ctx && chordGainRef.current) chordGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    toneOscRef.current = null;
    toneOsc2Ref.current = null;
    setToneOn(false);
  }

  // Per-node tone: sing the active node's own frequency (its vibe), so each node can be
  // voiced individually — build the network's chord one node at a time.
  function startNodeTone() {
    const an = nodes.find((n) => n.id === activeId) || null;
    if (!an) return;
    const ctx = ensureCtx();
    ctx.resume();
    let gain = nodeToneGainRef.current;
    if (!gain) {
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      nodeToneGainRef.current = gain;
    }
    if (nodeToneOscRef.current) {
      try {
        nodeToneOscRef.current.stop();
      } catch (err) {
        void err;
      }
    }
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(audibleHz(an.vibe), ctx.currentTime);
    osc.connect(gain);
    osc.start();
    nodeToneOscRef.current = osc;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0.1, ctx.currentTime, 0.05);
    setNodeToneOn(true);
  }

  function stopNodeTone() {
    const ctx = audioCtxRef.current;
    const gain = nodeToneGainRef.current;
    const osc = nodeToneOscRef.current;
    if (ctx && gain) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    const stopAt = ctx ? ctx.currentTime + 0.2 : 0;
    if (osc) {
      try {
        osc.stop(stopAt);
      } catch (err) {
        void err;
      }
    }
    nodeToneOscRef.current = null;
    setNodeToneOn(false);
  }

  // Play the whole vibration scale as a rising "song": sweep vibe 0 -> 1 so the tone
  // glides up and the figure morphs from rings to a full flower (hate -> love).
  function playScale() {
    if (!toneOn) startTone();
    cancelAnimationFrame(sweepRef.current);
    setSweeping(true);
    const dur = 14000;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      setVibe(p);
      if (p < 1) {
        sweepRef.current = requestAnimationFrame(tick);
      } else {
        setSweeping(false);
      }
    };
    sweepRef.current = requestAnimationFrame(tick);
  }

  function stopScale() {
    cancelAnimationFrame(sweepRef.current);
    setSweeping(false);
  }

  // Auto-breath: gently oscillate Light to show the living torus.
  useEffect(() => {
    if (!auto || story) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      setLight(0.52 + 0.45 * Math.sin(t * 0.5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, story]);

  // Restart the tone so chord voices are added/removed live when toggled.
  useEffect(() => {
    if (!toneOn) return;
    stopTone();
    const id = setTimeout(() => startTone(), 70);
    return () => clearTimeout(id);
  }, [chordOn]);

  // 5) Auto-story: the scene lives the whole "song" of Light, rising and falling
  //    through the scale on a slow loop (colour, frequency, rings, sparks, tone).
  useEffect(() => {
    if (!story) return;
    if (!toneOn) startTone();
    let raf = 0;
    const CYCLE = 48000;
    const t0 = performance.now();
    const tick = () => {
      const phase = ((performance.now() - t0) % CYCLE) / CYCLE;
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      setLight(tri);
      setVibe(tri);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [story]);

  // The singing tones track the vibration slider + beat spacing in real time.
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const osc = toneOscRef.current;
    const osc2 = toneOsc2Ref.current;
    if (!toneOn || !ctx) return;
    const f1 = audibleHz(vibe);
    if (osc) osc.frequency.setTargetAtTime(f1, ctx.currentTime, 0.05);
    if (osc2) osc2.frequency.setTargetAtTime(f1 + beatHz, ctx.currentTime, 0.05);
    for (const c of chordOscsRef.current) {
      c.osc.frequency.setTargetAtTime(f1 * c.mult, ctx.currentTime, 0.05);
    }
  }, [vibe, beatHz, toneOn]);

  // The per-node tone follows the active node's frequency live.
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const osc = nodeToneOscRef.current;
    const an = nodes.find((n) => n.id === activeId) || null;
    if (!nodeToneOn || !ctx || !osc || !an) return;
    osc.frequency.setTargetAtTime(audibleHz(an.vibe), ctx.currentTime, 0.05);
  });

  const activeNode = nodes.find((n) => n.id === activeId) || null;
  const activeIndexLabel = activeNode ? String(nodes.findIndex((n) => n.id === activeId) + 1) : "";
  const activeIdx = activeNode ? nodes.findIndex((n) => n.id === activeId) : -1;
  const activePos: [number, number, number] =
    activeNode != null
      ? nodePos[activeNode.id] || netPos(activeIdx, nodes.length, layout, 0)
      : [0, 0, 0];
  const level = levelFor(light);
  const levelValueStyle: React.CSSProperties = { color: level.color, fontWeight: 700 };
  const markerStyle: React.CSSProperties = {
    position: "absolute",
    top: "-3px",
    left: Math.round(light * 100) + "%",
    width: "3px",
    height: "14px",
    marginLeft: "-1px",
    background: "#ffffff",
    boxShadow: "0 0 6px #ffffff",
  };

  const panelTitle =
    panel === "light"
      ? "💡 Свет"
      : panel === "vibe"
      ? "🌊 Вибрация"
      : panel === "sound"
      ? "🔊 Звук"
      : panel === "music"
      ? "🎵 Музыка"
      : panel === "net"
      ? "🪩 Сеть резонаторов"
      : "";
  const dockStyle: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    padding: "8px 12px",
    background: "rgba(12,8,20,0.72)",
    border: "1px solid rgba(180,150,255,0.25)",
    borderRadius: "16px",
    backdropFilter: "blur(8px)",
    zIndex: 20,
  };
  const dockBtnStyle: React.CSSProperties = {
    width: "44px",
    height: "44px",
    fontSize: "20px",
    lineHeight: "1",
    borderRadius: "12px",
    border: "1px solid rgba(180,150,255,0.25)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8e0ff",
    cursor: "pointer",
  };
  const dockBtnActiveStyle: React.CSSProperties = {
    ...dockBtnStyle,
    background: "rgba(90,200,255,0.22)",
    border: "1px solid #36c5ff",
    boxShadow: "0 0 12px rgba(54,197,255,0.5)",
  };

  return (
    <>
      <Canvas camera={cameraProps} dpr={[1, 2]}>
        <color attach="background" args={bgArgs} />
        <ambientLight intensity={0.3} />
        <MoodStars moodRef={moodRef} />
        <AudioMood analyser={analyserRef} audioOn={audioOn} vibe={vibe} beat={beatHz} moodRef={moodRef} />
        <MoodAtmosphere moodRef={moodRef} />
        <MoodGlow moodRef={moodRef} onBoost={setGlowBoost} />
        <ResonancePlane vibe={vibe} show={reson} beat={beatHz} analyser={analyserRef} audioOn={audioOn} />
        <CenterRings vibe={vibe} beat={beatHz} show={reson} moodRef={moodRef} />
        <CenterSparks vibe={vibe} light={light} show={reson} moodRef={moodRef} />
        <SpectrumWaves show={reson} moodRef={moodRef} />
        <ResonatorNet nodes={nodes} links={links} layout={layout} orbit={orbit} show={netShow} activeId={activeId} manual={nodePos} onMove={(id, p) => setNodePos((m) => ({ ...m, [id]: p }))} />
        <TorusBreath light={light} spin={spin} moodRef={moodRef} />
        <Disco on={disco} beat={beatHz} />
        <OrbitControls makeDefault enablePan={false} minDistance={1.5} maxDistance={120} />
        <EffectComposer>
          <Bloom mipmapBlur intensity={glow + glowBoost} luminanceThreshold={0.06} luminanceSmoothing={0.88} radius={0.92} />
          <Vignette offset={0.28} darkness={0.88} />
        </EffectComposer>
      </Canvas>

      {panel ? (
      <div style={panelStyle}>
        <div style={titleRowStyle} onClick={() => setPanel(null)}>
          <span style={titleStyle}>{panelTitle}</span>
          <span style={chevronStyle}>{"✕"}</span>
        </div>
        {!collapsed ? (
          <>
        {panel === "light" ? (
          <>
        <div style={rowStyle}>
          <span>{"Свет"}</span>
          <span style={valueStyle}>{light.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={light}
          onChange={(e) => {
            setAuto(false);
            setLight(parseFloat(e.target.value));
          }}
          style={sliderStyle}
        />
        <div style={barTrackStyle}>
          <div style={markerStyle} />
        </div>
        <div style={dividerStyle} />
        <div style={rowStyle}>
          <span>{"Состояние"}</span>
          <span style={levelValueStyle}>{level.name}</span>
        </div>
        <div style={rowStyle}>
          <span>{"Частота"}</span>
          <span style={levelValueStyle}>{level.hz + " Гц"}</span>
        </div>
        <div style={rowStyle}>
          <span>{"Вращение"}</span>
          <span style={valueStyle}>{"×" + spin.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={1}
          value={spin}
          onChange={(e) => setSpin(parseFloat(e.target.value))}
          style={sliderStyle}
        />
        <div style={rowStyle}>
          <span>{"Свечение"}</span>
          <span style={valueStyle}>{glow.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={0.05}
          value={glow}
          onChange={(e) => setGlow(parseFloat(e.target.value))}
          style={sliderStyle}
        />
        <label style={labelStyle}>
          <span>{"Авто-дыхание"}</span>
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            style={checkStyle}
          />
        </label>
          </>
        ) : null}
        {panel === "vibe" ? (
          <>
        <label style={labelStyle}>
          <span>{"Резонанс Шумана"}</span>
          <input
            type="checkbox"
            checked={reson}
            onChange={(e) => setReson(e.target.checked)}
            style={checkStyle}
          />
        </label>
        <div style={rowStyle}>
          <span>{"Частота вибрации"}</span>
          <span style={valueStyle}>{(7.83 + vibe * 32).toFixed(1) + " Гц"}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={vibe}
          onChange={(e) => setVibe(parseFloat(e.target.value))}
          style={sliderStyle}
        />
        <div style={hintStyle}>
          {"Тяни по шкале — рисунок плавно густеет: от колец к многолепестковому цветку."}
        </div>
          </>
        ) : null}
        {panel === "sound" ? (
          <>
        <label style={labelStyle}>
          <span>{"🔊 Звучание частоты"}</span>
          <input
            type="checkbox"
            checked={toneOn}
            onChange={(e) => (e.target.checked ? startTone() : stopTone())}
            style={checkStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>{"🎼 Аккорд (квинта + октава)"}</span>
          <input
            type="checkbox"
            checked={chordOn}
            onChange={(e) => setChordOn(e.target.checked)}
            style={checkStyle}
          />
        </label>
        <div style={rowStyle}>
          <span>{"Тон"}</span>
          <span style={valueStyle}>{Math.round(audibleHz(vibe)) + " Гц"}</span>
        </div>
        <div style={rowStyle}>
          <span>{"Биения"}</span>
          <span style={valueStyle}>{beatHz.toFixed(1) + " Гц"}</span>
        </div>
        <input
          type="range"
          min={0}
          max={8}
          step={0.1}
          value={beatHz}
          onChange={(e) => setBeatHz(parseFloat(e.target.value))}
          style={sliderStyle}
        />
        <div style={hintStyle}>
          {"Две близкие частоты дают биение: рисунок дышит, тон пульсирует. 0 — ровно."}
        </div>
        <div style={btnRowStyle}>
          <button style={btnStyle} onClick={sweeping ? stopScale : playScale}>
            {sweeping ? "⏹ Стоп шкалы" : "▶ Прослушать шкалу"}
          </button>
        </div>
        <label style={labelStyle}>
          <span>{"🎬 Авто-сюжет (песня Света)"}</span>
          <input
            type="checkbox"
            checked={story}
            onChange={(e) => setStory(e.target.checked)}
            style={checkStyle}
          />
        </label>
          </>
        ) : null}
        {panel === "net" ? (
          <>
        <label style={labelStyle}>
          <span>{"Показывать сеть"}</span>
          <input type="checkbox" checked={netShow} onChange={(e) => setNetShow(e.target.checked)} style={checkStyle} />
        </label>
        <div style={rowStyle}>
          <span>{"Узлов"}</span>
          <span style={valueStyle}>{nodes.length + " · связей " + links.length}</span>
        </div>
        <div style={btnRowStyle}>
          <button style={btnStyle} onClick={addNode}>{"➕ Узел"}</button>
          <button style={btnStyle} onClick={removeActive}>{"✕ Убрать"}</button>
        </div>
        {nodes.length ? (
          <div style={chipRowStyle}>
            {nodes.map((n, i) => (
              <button
                key={n.id}
                style={n.id === activeId ? chipActiveStyle : chipStyle}
                onClick={() => setActiveId(n.id)}
              >
                {String(i + 1)}
              </button>
            ))}
          </div>
        ) : null}
        {activeNode ? (
          <>
            <div style={rowStyle}>
              <span>{"Узел " + activeIndexLabel + " · частота"}</span>
              <span style={valueStyle}>{(7.83 + activeNode.vibe * 32).toFixed(1) + " Гц"}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={activeNode.vibe}
              onChange={(e) => setNodeVibe(activeNode.id, parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <label style={labelStyle}>
              <span>{"🔊 Тон узла"}</span>
              <input
                type="checkbox"
                checked={nodeToneOn}
                onChange={(e) => (e.target.checked ? startNodeTone() : stopNodeTone())}
                style={checkStyle}
              />
            </label>
            <div style={btnRowStyle}>
              <button style={btnStyle} onClick={resetActivePos}>{"⟲ Вернуть на место"}</button>
            </div>
            <div style={hintStyle}>{"🌌 Тащи узел мышью, чтобы двигать его по вселенной."}</div>
          </>
        ) : null}
        <div style={rowStyle}>
          <span>{"Расположение"}</span>
        </div>
        <div style={btnRowStyle}>
          <button style={layout === "mandala" ? btnActiveStyle : btnStyle} onClick={() => setLayout("mandala")}>{"🌀 Мандала"}</button>
          <button style={layout === "spine" ? btnActiveStyle : btnStyle} onClick={() => setLayout("spine")}>{"🧬 Лестница"}</button>
        </div>
        <div style={btnRowStyle}>
          <button style={layout === "sun" ? btnActiveStyle : btnStyle} onClick={() => setLayout("sun")}>{"☀️ Солнце"}</button>
          <button style={layout === "free" ? btnActiveStyle : btnStyle} onClick={() => setLayout("free")}>{"🆓 Свободно"}</button>
        </div>
        <div style={rowStyle}>
          <span>{"Связи"}</span>
        </div>
        <div style={btnRowStyle}>
          <button style={btnStyle} onClick={linkRing}>{"⭕ Кольцо"}</button>
          <button style={btnStyle} onClick={linkStar}>{"⭐ Звезда"}</button>
        </div>
        <div style={btnRowStyle}>
          <button style={btnStyle} onClick={linkAll}>{"🕸 Все"}</button>
          <button style={btnStyle} onClick={clearLinks}>{"🚫 Сброс"}</button>
        </div>
        <label style={labelStyle}>
          <span>{"🪐 Орбиты (вращение сети)"}</span>
          <input type="checkbox" checked={orbit} onChange={(e) => setOrbit(e.target.checked)} style={checkStyle} />
        </label>
        <div style={hintStyle}>
          {"Добавляй узлы, выбирай форму и связывай их. Каждый узел пульсирует на своей частоте — целая дискотека Света."}
        </div>
          </>
        ) : null}
        {panel === "music" ? (
          <>
        <div style={rowStyle}>
          <span>{"Звук → рисунок"}</span>
          <span style={valueStyle}>{audioOn ? "вкл" : "выкл"}</span>
        </div>
        <div style={btnRowStyle}>
          <label style={btnStyle}>
            {"🎵 Музыка"}
            <input type="file" accept="audio/*" onChange={onAudioFile} style={hiddenInputStyle} />
          </label>
          <button style={btnStyle} onClick={onMic}>{"🎤 Микрофон"}</button>
          {audioOn ? (
            <button style={btnStyle} onClick={stopAudio}>{"⏸ Стоп"}</button>
          ) : null}
        </div>
        {audioName ? <div style={hintStyle}>{"♪ " + audioName}</div> : null}
        <div style={hintStyle}>
          {"Низ шкалы — ненависть (тяжёло, медленно). Вверх — любовь и свет: вращение ускоряется, рисунок учащается."}
        </div>
          </>
        ) : null}
          </>
        ) : null}
      </div>
      ) : null}

      <div style={dockStyle}>
        <button style={panel === "light" ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setPanel((p) => (p === "light" ? null : "light"))}>{"💡"}</button>
        <button style={panel === "vibe" ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setPanel((p) => (p === "vibe" ? null : "vibe"))}>{"🌊"}</button>
        <button style={panel === "sound" ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setPanel((p) => (p === "sound" ? null : "sound"))}>{"🔊"}</button>
        <button style={panel === "music" ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setPanel((p) => (p === "music" ? null : "music"))}>{"🎵"}</button>
        <button style={panel === "net" ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setPanel((p) => (p === "net" ? null : "net"))}>{"🪩"}</button>
        <button style={disco ? dockBtnActiveStyle : dockBtnStyle} onClick={() => setDisco((d) => !d)}>{"\ud83c\udf08"}</button>
      </div>
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<Stand />);
}
