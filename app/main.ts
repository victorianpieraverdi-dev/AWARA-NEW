import * as THREE from "three";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { setupDiary } from "./diary";

import {
  StateManager,
  VoiceOfTruth,
  DimensionalMaterial,
  createPlayerState,
  NODES,
  type NodeId,
  type CameraRig,
  type Direction,
} from "../core/index";

// ---------- renderer / scene / camera ----------
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#05050a");

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 26);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.PointLight(0xffe9b0, 1.2, 0, 2);
key.position.set(8, 12, 18);
scene.add(key);

// ---------- node anchors (0..7) ----------
const ANCHORS: Record<NodeId, THREE.Vector3> = {
  0: new THREE.Vector3(0, 0, 60),
  1: new THREE.Vector3(0, 0, 32),
  2: new THREE.Vector3(0, 0, 0),
  3: new THREE.Vector3(-22, 0, 0),
  4: new THREE.Vector3(0, -22, 0),
  5: new THREE.Vector3(22, 0, 0),
  6: new THREE.Vector3(0, 22, 0),
  7: new THREE.Vector3(0, 0, -40),
};

// ---------- node 0: spark field (Исток) ----------
const sparkGeo = new THREE.BufferGeometry();
const SPARKS = 1400;
const sp = new Float32Array(SPARKS * 3);
for (let i = 0; i < SPARKS; i++) {
  sp[i * 3] = (Math.random() - 0.5) * 60;
  sp[i * 3 + 1] = (Math.random() - 0.5) * 60;
  sp[i * 3 + 2] = 60 + (Math.random() - 0.5) * 30;
}
sparkGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
const sparks = new THREE.Points(
  sparkGeo,
  new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.18, transparent: true, opacity: 0.8 })
);
scene.add(sparks);

// ---------- node 1: macrocosm torus (Тор) ----------
const torMat = new DimensionalMaterial({ colorLow: "#3a3550", colorHigh: "#8a6ad8" });
const torus = new THREE.Mesh(new THREE.TorusGeometry(7, 2.2, 32, 120), torMat);
torus.position.copy(ANCHORS[1]);
scene.add(torus);

// ---------- node 2: golden egg (Золотое Яйцо / Лобби) ----------
const eggMat = new DimensionalMaterial({ colorLow: "#6b6256", colorHigh: "#c9a84c" });
const egg = new THREE.Mesh(new THREE.SphereGeometry(6, 96, 96), eggMat);
egg.scale.set(1, 1.3, 1);
egg.position.copy(ANCHORS[2]);
scene.add(egg);

// ---------- post-processing: bloom ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.9, 0.6, 0.85
);
composer.addPass(bloom);

// ---------- camera rig (GSAP) ----------
const rig: CameraRig = {
  focusNode(node, opts) {
    const target = ANCHORS[node];
    const duration = opts?.duration ?? 1.2;
    const ease = opts?.ease ?? "power3.inOut";
    return new Promise<void>((resolve) => {
      gsap.to(camera.position, {
        x: target.x,
        y: target.y,
        z: target.z + 26,
        duration,
        ease,
        onUpdate: () => camera.lookAt(target),
        onComplete: () => resolve(),
      });
    });
  },
};

// ---------- state + ai + player ----------
const sm = new StateManager(rig, 0);
const voice = new VoiceOfTruth();
const player = createPlayerState();

const nodeLabel = document.getElementById("nodeLabel")!;
function renderNodeLabel(id: NodeId) {
  const def = NODES[id];
  nodeLabel.textContent = "[" + id + "] " + def.title;
}
sm.on((to) => renderNodeLabel(to));
renderNodeLabel(sm.current);
void rig.focusNode(sm.current, { duration: 0 });

// ---------- HUD wiring ----------
document.getElementById("intro")!.addEventListener("click", () => {
  void sm.runIntro();
});
document.getElementById("back")!.addEventListener("click", () => {
  void sm.back();
});
// Nodes 0-2 render natively in WebGL; 3-7 open their legacy screen (full game)
// via Vite's static root until each gets a native 3D scene.
const NATIVE = new Set<NodeId>([0, 1, 2]);
function openNode(id: NodeId, dir?: Direction) {
  if (NATIVE.has(id)) {
    if (dir && sm.canGo(dir)) void sm.move(dir);
    return;
  }
  const href = NODES[id].legacyHref;
  if (href) window.open("/" + href, "_blank");
}
document.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.dataset.dir as Direction;
    const target = NODES[sm.current].links[dir];
    if (target === undefined) return;
    openNode(target, dir);
  });
});

// light slider -> playerLight uniform
const lightInput = document.getElementById("light") as HTMLInputElement;
const lightVal = document.getElementById("lightVal")!;
function applyLight(v: number) {
  player.light = v;
  eggMat.setLight(v);
  torMat.setLight(v);
  lightVal.textContent = v.toFixed(2);
  lightInput.value = String(v);
}
lightInput.addEventListener("input", () => applyLight(parseFloat(lightInput.value)));
applyLight(player.light);

// diary (voice + text) -> Voice of Truth -> player light + chakras
setupDiary({
  voice,
  player,
  onLight: (v) => applyLight(v),
  refs: {
    textarea: document.getElementById("diary") as HTMLTextAreaElement,
    submitBtn: document.getElementById("diaryBtn") as HTMLButtonElement,
    micBtn: document.getElementById("micBtn") as HTMLButtonElement,
    reflection: document.getElementById("reflection")!,
    chakras: document.getElementById("chakras")!,
    quests: document.getElementById("quests")!,
    msgs: document.getElementById("diaryMsgs")!,
  },
});

// ---------- render loop ----------
const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;
  torus.rotation.x = t * 0.3;
  torus.rotation.y = t * 0.2;
  egg.rotation.y = t * 0.15;
  sparks.rotation.y = t * 0.04;
  eggMat.update(dt, camera.position);
  torMat.update(dt, camera.position);
  composer.render();
  requestAnimationFrame(tick);
}
tick();

// ---------- resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
