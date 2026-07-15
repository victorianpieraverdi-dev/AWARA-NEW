// AWARA -- Entry screen WebGL scene (React Three Fiber).
// LIVE layers only: rotating sacred ring + pulsing spark (+ Bloom). The cosmos
// itself is the concept art, shown as a full-bleed CSS background behind a
// TRANSPARENT canvas. When no art is available (proceduralBg=true) we fall back
// to a procedural nebula + dark glass sphere so the screen still looks complete.

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import type { EntryState, ParallaxVec } from "./core";
import {
  NEBULA_FRAG, FULLSCREEN_VERT,
  RING_VERT, RING_FRAG, ORB_FRAG,
  SPARK_VERT, SPARK_FRAG,
} from "./shaders";

type PRef = React.MutableRefObject<ParallaxVec>;

/* ---------------- Procedural nebula (fallback only) ---------------- */
function ProceduralNebula({ parallax, proximity }: { parallax: PRef; proximity: React.MutableRefObject<number> }) {
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uParallax: { value: new THREE.Vector2() }, uAspect: { value: 1 }, uHover: { value: 0 } }),
    []
  );
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uParallax.value.set(parallax.current.x, parallax.current.y);
    uniforms.uAspect.value = size.width / size.height;
    uniforms.uHover.value += (proximity.current - uniforms.uHover.value) * 0.14;
  });
  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={NEBULA_FRAG}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={NEBULA_FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---------------- Portal ring ---------------- */
function PortalRing({ proximity }: { proximity: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const breathRef = useRef(0);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0.0 } }), []);
  useFrame((s, delta) => {
    const t = s.clock.elapsedTime;
    const reveal = proximity.current; // 0 in the void -> 1 at the centre
    // Brightness ramps with proximity on the LIVE material: tender at the sphere's
    // edge, radiant at the core.
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uHover.value += (reveal - mat.current.uniforms.uHover.value) * 0.12;
    }
    // Appearance + life via mesh transforms: HIDDEN in the void, the mandala
    // materialises SOFTLY (grows + spins like a spell-ring) right as the cursor
    // crosses the sphere, and its breath ACCELERATES as it nears the centre.
    if (mesh.current) {
      mesh.current.visible = reveal > 0.02;
      const bspeed = 1.0 + 2.2 * reveal; // breath accelerates toward the core
      breathRef.current += delta * bspeed;
      const breath = 1.0 + (0.03 + 0.05 * reveal) * Math.sin(breathRef.current);
      const grow = 0.55 + 0.45 * reveal; // gentle materialisation
      mesh.current.rotation.z = t * 0.10;
      mesh.current.scale.setScalar(grow * breath);
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0.2]} renderOrder={1} visible={false}>
      <planeGeometry args={[2.7, 2.7]} />
      <shaderMaterial
        ref={mat}
        key={RING_FRAG}
        vertexShader={RING_VERT}
        fragmentShader={RING_FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Dark glass orb (always on) ---------------- */
// A real volumetric dark sphere: spherical normal + fresnel rim + glints.
// NORMAL-blended, so its dark body COVERS the cosmos behind it (no flat ring).
function GlassOrb({ proximity }: { proximity: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 } }), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uHover.value += (proximity.current - mat.current.uniforms.uHover.value) * 0.18;
    }
    // The sphere LIVES even at rest -- a slow, almost imperceptible breath of
    // primordial darkness, independent of the cursor.
    if (mesh.current) {
      const prox = proximity.current;            // 0 in the void -> 1 at the centre
      const grow = 1.0 + 0.45 * prox;            // the sphere SWELLS the closer the cursor gets to the core
      const breath = 1.0 + 0.014 * Math.sin(t * 0.7);
      mesh.current.scale.setScalar(grow * breath);
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0]} renderOrder={0}>
      <planeGeometry args={[1.1, 1.1]} />
      <shaderMaterial
        ref={mat}
        key={ORB_FRAG}
        vertexShader={RING_VERT}
        fragmentShader={ORB_FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---------------- Spark ---------------- */
function Spark({ state, proximity }: { state: EntryState; proximity: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  // uIntensity starts BRIGHT so the spark is luminous the instant it is revealed;
  // its appearance + pulse are driven by the mesh scale below (proven to animate),
  // so the central light is guaranteed to show even if uniforms stay frozen.
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 0.6 } }), []);
  const phaseRef = useRef(0);
  useFrame((s, delta) => {
    const t = s.clock.elapsedTime;
    let prox = proximity.current;
    if (state === "transition" || state === "pressed") prox = 1.0;
    // Pulse ACCELERATES toward the core: a slow tender breath at the sphere's edge,
    // a quick radiant throb at the centre. Phase is integrated so the frequency can
    // change smoothly without jumps.
    const speed = 0.35 + 0.9 * prox; // cycles per second -- accelerates toward the core
    phaseRef.current += delta * speed;
    const phase = (Math.sin(phaseRef.current * Math.PI * 2) + 1) / 2; // 0..1
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      // A SOFT, deep glow that beckons inward -- never a solar flash. Gentle far,
      // pleasantly luminous (not blinding) near the core.
      mat.current.uniforms.uIntensity.value = 0.25 + 1.5 * prox + phase * (0.12 + 0.35 * prox);
    }
    // The central light is BORN on approach: hidden in the void, it ignites and
    // visibly PULSES in size as the cursor nears -- the \"vhod\" / entrance light.
    if (mesh.current) {
      mesh.current.visible = prox > 0.02 || state === "transition" || state === "pressed";
      const grow = 0.16 + 0.42 * prox; // stays small -- beckons inward, never bloats
      const pulse = 1.0 + (0.05 + 0.13 * prox) * phase; // gentle, pleasant breath
      mesh.current.scale.setScalar(grow * pulse);
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0.3]} renderOrder={2} visible={false}>
      <planeGeometry args={[1.4, 1.4]} />
      <shaderMaterial
        ref={mat}
        key={SPARK_FRAG}
        vertexShader={SPARK_VERT}
        fragmentShader={SPARK_FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Scene contents ---------------- */
function SceneContents({
  state, parallax, proximityHint, proceduralBg, onTransitionComplete,
}: {
  state: EntryState;
  parallax: PRef;
  proximityHint?: React.MutableRefObject<number>;
  proceduralBg: boolean;
  onTransitionComplete: () => void;
}) {
  const { camera } = useThree();
  const proximity = useRef(0);
  const fired = useRef(false);

  // Independent, ALWAYS-ON pointer tracker (NDC, 0 = screen centre = orb).
  // Does NOT depend on the capability-gated useParallax pipeline, so the orb
  // reacts to the cursor even if that pipeline is disabled or stuck at zero.
  const pointer = useRef({ x: 0, y: 0 });        // camera parallax (centred at load)
  const proxPointer = useRef({ x: 99, y: 99 });  // cursor->centre proximity; FAR until first move
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current.x = nx; pointer.current.y = ny;
      proxPointer.current.x = nx; proxPointer.current.y = ny;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((s) => {
    camera.position.x += (pointer.current.x * 0.18 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.current.y * 0.18 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Reveal is driven SOLELY by the cursor's proximity to the sphere centre,
    // measured by the spark button (hint) -- eased (soft at the rim, accelerating
    // toward the core) and sphere-gated, so NOTHING appears until the cursor
    // actually CROSSES the sphere. Pressing / entering forces a full bloom.
    const hint = proximityHint ? proximityHint.current : 0;
    const active = state === "pressed" || state === "transition";
    const target = Math.max(hint, active ? 1.0 : 0.0);
    proximity.current += (target - proximity.current) * 0.12;
  });

  useEffect(() => {
    if (state === "transition" && !fired.current) {
      fired.current = true;
      // Dive INTO the sphere: the camera plunges toward the orb plane (z=0) so it
      // swells to fill the view -- a fall into the pupil of the void -- accelerating
      // hard at the end (power3.in), handed off to the CSS warp + flash + chime.
      gsap.to(camera.position, { z: 0.12, duration: 0.9, ease: "power3.in", onComplete: onTransitionComplete });
    }
  }, [state, camera, onTransitionComplete]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 2, 4]} intensity={1.2} color={"#9a86ff"} />
      {proceduralBg && <ProceduralNebula parallax={parallax} proximity={proximity} />}
      <GlassOrb proximity={proximity} />
      <PortalRing proximity={proximity} />
      <Spark state={state} proximity={proximity} />
      {/* Cinematic glow. Soft, mipmap-blurred bloom so the spark + ring radiate
          without blowing out. Works cleanly when the procedural nebula fills the
          canvas; with a transparent art background tune intensity down if needed. */}
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.9} radius={0.7} />
      </EffectComposer>
    </>
  );
}

/* ---------------- Exported Canvas ---------------- */
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 50, near: 0.1, far: 100 };
const GL_OPTS = { antialias: true, alpha: true, powerPreference: "high-performance" as const };

export interface EntrySceneProps {
  state: EntryState;
  parallax: PRef;
  /** Authoritative cursor->sphere proximity (0..1) driven by the spark button. */
  proximityHint?: React.MutableRefObject<number>;
  /** When true, draw the procedural nebula fallback (no concept art available). */
  proceduralBg: boolean;
  /** Touch device: cap DPR + drop MSAA so high-density phone screens stay smooth. */
  mobile?: boolean;
  onTransitionComplete: () => void;
}

export default function EntryScene(props: EntrySceneProps) {
  // On phones the fragment shaders (orb + ring + cosmogony) are the cost; cap the
  // DPR and drop MSAA so a high-density mobile screen stays at 60fps. Desktop keeps
  // the crisp [1,2] + antialias path.
  const dpr: [number, number] = props.mobile ? [1, 1.75] : [1, 2];
  const glOpts = props.mobile ? { ...GL_OPTS, antialias: false } : GL_OPTS;
  return (
    <Canvas
      frameloop="always"
      camera={CAMERA}
      dpr={dpr}
      gl={glOpts}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.setClearColor(0x000000, 0); // transparent -- reveal the CSS art background
      }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
