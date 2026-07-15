// AWARA -- Screen Zero: "Istok" (entry screen).
// Cinematic esoteric cosmos: volumetric violet+gold nebula, dark crystal portal-sphere
// with a soft luminous rim-halo, a tiny razor-sharp gold spark (+orbiting points & flare),
// delicate hairline sacred rings + octagram OUTSIDE the sphere, mouse ripples,
// GSAP dive-to-flash.
//
// Deps: three, @react-three/fiber, @react-three/drei (useFBO),
//       @react-three/postprocessing (Bloom), gsap.

import * as React from "react";
import { useMemo, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";

/* ============================ shared noise ============================ */
const NOISE = `
float hash(vec3 p){ p = fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){
  vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
`;

/* ============================ cosmos + volumetric nebula ============================ */
const COSMOS_VERT = `
  varying vec3 vDir;
  void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const COSMOS_FRAG = `
  precision highp float;
  varying vec3 vDir;
  uniform float uTime;
  ${NOISE}
  void main(){
    vec3 d = normalize(vDir);
    vec2 q = d.xy / (abs(d.z)+0.6);
    float rad = length(q);
    float ang = atan(q.y, q.x);

    // --- domain-warped billowing nebula ---
    vec3 wp  = vec3(q*1.5, uTime*0.008);
    float w1 = fbm(wp);
    float w2 = fbm(wp + vec3(4.7,2.1,0.0));
    vec3 wp2 = vec3(q*1.5 + vec2(w1,w2)*1.6, uTime*0.010);
    float neb = fbm(wp2*1.15);
    neb = pow(max(neb,0.0), 1.7);
    // clouds cluster in a band around the centre, centre stays clear
    float band  = smoothstep(0.12,0.55,rad) * smoothstep(1.7,0.6,rad);
    float cloud = smoothstep(0.18,0.95,neb) * band;

    // violet <-> cosmic-gold mix driven by a second noise field
    float tone = fbm(wp2 + vec3(3.3,1.7,0.0));
    vec3 violet = vec3(0.17,0.09,0.32);
    vec3 gold   = vec3(0.34,0.22,0.08);
    vec3 nebCol = mix(violet, gold, smoothstep(0.35,0.75,tone));

    // faint inner galactic spiral (revealed dimly through the lens)
    float spiral = sin(ang*2.0 + log(rad+0.08)*6.0 - uTime*0.05);
    spiral = smoothstep(0.3,1.0,spiral) * exp(-rad*2.2);

    vec3 vacuum = vec3(0.004,0.004,0.012);
    vec3 col = vacuum;
    col += nebCol * cloud * 1.05;
    col += (violet*0.5 + gold*0.5) * spiral * 0.5;
    gl_FragColor = vec4(col,1.0);
  }
`;

function Cosmos({ uniforms }: { uniforms: any }) {
  return (
    <mesh>
      <sphereGeometry args={[60, 64, 64]} />
      <shaderMaterial vertexShader={COSMOS_VERT} fragmentShader={COSMOS_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/* ============================ stars ============================ */
const STAR_VERT = `
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  varying float vTw;
  void main(){
    vTw = 0.4 + 0.6*sin(uTime*(1.2+aSize) + aPhase*6.2831853);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    gl_PointSize = aSize * (240.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const STAR_FRAG = `
  precision highp float;
  varying float vTw;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a = pow(smoothstep(0.5,0.02,length(c)), 1.8);
    gl_FragColor = vec4(vec3(1.0,0.96,0.86), a*vTw*0.85);
  }
`;

function StarField({ count = 1200 }: { count?: number }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 34;
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(1 - u * u);
      pos[i * 3 + 0] = r * rr * Math.cos(th);
      pos[i * 3 + 1] = r * rr * Math.sin(th);
      pos[i * 3 + 2] = r * u - 6;
      phase[i] = Math.random();
      sz[i] = 0.5 + Math.random() * Math.random() * 2.2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s) => { uniforms.uTime.value = s.clock.elapsedTime; });
  return (
    <points geometry={geom}>
      <shaderMaterial vertexShader={STAR_VERT} fragmentShader={STAR_FRAG} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ============================ portal lens (dark crystal sphere) ============================ */
const LENS_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const LENS_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uScene;
  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uHover;
  uniform vec2  uMouse;
  uniform float uFlash;

  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;            // 0..1
    float mask = smoothstep(1.0, 0.985, r);
    if(mask <= 0.001) discard;

    float z = sqrt(max(0.0, 1.0 - r*r));
    vec3  N = normalize(vec3(p * 2.0, z));
    vec2  dir = normalize(p + 1e-5);
    vec2  screen = gl_FragCoord.xy / uResolution;

    // convex refraction of the cosmos behind the glass + slight mouse parallax
    vec2 off = -N.xy * 0.05 * (1.0 - z*0.5) + uMouse * 0.007 * (1.0 - r);
    vec3 bg  = texture2D(uScene, screen + off).rgb;

    // DARK glass interior
    vec3 col = bg * 0.28;

    // faint geodesic facets inside the glass
    float fac = abs(sin(atan(p.y,p.x)*7.0 + r*9.0 - uTime*0.05));
    col += smoothstep(0.93,1.0,fac) * 0.015 * (1.0 - r);

    // fresnel rim (cool inner edge of the sphere)
    float fres = pow(1.0 - z, 3.0);
    col += fres * vec3(0.40,0.38,0.72) * 0.6;
    float cres = smoothstep(0.55,1.0,r) * max(0.0, dot(dir, normalize(vec2(-0.55,0.62))));
    col += pow(cres,2.5) * vec3(0.75,0.74,1.0) * 0.55;

    // razor-sharp spark, just below centre
    vec2  sp = p - vec2(0.0, -0.01);
    float sd = length(sp);
    float a  = atan(sp.y, sp.x);
    float breathe = 0.92 + 0.08*sin(uTime*2.2);
    float core   = exp(-sd*sd*2200.0) * breathe;
    float spikes = pow(max(0.0,cos(a*2.0)),52.0) + pow(max(0.0,cos(a*2.0+1.5708)),52.0);
    float star   = exp(-sd*90.0) * spikes * 0.45;
    col += (core*2.3 + star) * vec3(1.3,1.12,0.78);

    // tiny orbiting points
    for(int i=0;i<3;i++){
      float aa = uTime*0.35 + float(i)*2.0944;
      vec2  op = vec2(cos(aa),sin(aa)) * (0.06 + 0.012*float(i));
      float pd = length(sp - op);
      col += exp(-pd*pd*5000.0) * vec3(1.0,0.92,0.7) * 0.6;
    }
    // thin horizontal lens-flare ellipse around the spark
    vec2 ep = sp * vec2(1.0, 2.3);
    col += smoothstep(0.052,0.04,abs(length(ep)-0.045)) * vec3(1.0,0.9,0.7) * (0.3 + uHover*0.25);

    col = mix(col, vec3(1.1,1.05,0.95), clamp(uFlash,0.0,1.0));
    gl_FragColor = vec4(col, mask);
  }
`;

/* ============================ aura (rim-halo + faint rings + octagram) ============================ */
// In aura plane coords p in [-1,1] maps to +/-3 world units; sphere radius 1.12 world = 0.373.
const AURA_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const AURA_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  uniform vec2  uMouse;
  uniform float uFlash;

  float ringFn(float dist, float radius, float width){
    return smoothstep(radius-width, radius, dist) - smoothstep(radius, radius+width, dist);
  }
  float seg(vec2 p, vec2 a, vec2 b){
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
  }
  void main(){
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float ang = atan(p.y, p.x);
    float SPH = 0.373;                 // sphere radius in these coords

    vec3 col = vec3(0.0);
    float alpha = 0.0;

    // --- soft luminous rim-halo hugging the sphere (violet <-> gold by angle) ---
    float rim = exp(-pow((r - SPH)/0.055, 2.0));
    vec3 rimCol = mix(vec3(0.42,0.32,0.85), vec3(0.86,0.66,0.32), 0.5+0.5*sin(ang+0.6));
    col   += rimCol * rim * (0.55 + uHover*0.4);
    alpha += rim * (0.45 + uHover*0.3);

    // --- delicate hairline rings OUTSIDE the sphere ---
    float rings = 0.0;
    for(int i=0;i<6;i++){
      float fi = float(i);
      float rd = SPH + 0.07 + fi*0.085 + 0.01*sin(uTime*0.5 + fi);
      rd += fract(uTime*0.04 - fi*0.16) * 0.04;
      rings += ringFn(r, rd, 0.0016);
    }
    vec3 ringCol = mix(vec3(0.5,0.45,0.88), vec3(0.88,0.7,0.34), smoothstep(0.45,0.95,r));
    float ringFade = smoothstep(1.05, 0.42, r);
    col   += ringCol * rings * (0.28 + uHover*0.5) * ringFade;
    alpha += rings * (0.22 + uHover*0.35) * ringFade;

    // --- faint octagram {8/3} ---
    float lines = 0.0;
    float R = 0.62;
    for(int k=0;k<8;k++){
      float a0 = (float(k)   / 8.0) * 6.2831853 + uTime*0.015;
      float a1 = (float(k+3) / 8.0) * 6.2831853 + uTime*0.015;
      vec2 v0 = vec2(cos(a0),sin(a0)) * R;
      vec2 v1 = vec2(cos(a1),sin(a1)) * R;
      lines += smoothstep(0.0035, 0.0, seg(p, v0, v1));
    }
    col   += vec3(0.6,0.55,0.7) * lines * (0.12 + uHover*0.3) * ringFade;
    alpha += lines * (0.10 + uHover*0.22) * ringFade;

    // --- pointer ripple ---
    float dm = length(p - uMouse);
    float mr = ringFn(dm, fract(uTime*0.5)*0.5, 0.012) * (1.0 - smoothstep(0.0,0.55,dm));
    col   += vec3(0.85,0.72,0.42) * mr * (0.2 + uHover*0.5);
    alpha += mr * (0.18 + uHover*0.35);

    col   = mix(col, vec3(1.0), clamp(uFlash,0.0,1.0)*0.6);
    alpha = mix(alpha, 1.0, clamp(uFlash,0.0,1.0)*0.6);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

/* ============================ scene ============================ */
function IstokSceneInner({ onEnter }: { onEnter?: () => void }) {
  const { size, camera } = useThree();
  const fxRef = useRef<THREE.Group>(null!);
  const fbo = useFBO();
  const entering = useRef(false);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const hoverTarget = useRef(0.25);

  const cosmosU = useMemo(() => ({ uTime: { value: 0 } }), []);
  const lensU = useMemo(
    () => ({
      uScene: { value: fbo.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uHover: { value: 0.25 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uFlash: { value: 0 },
    }),
    [fbo.texture] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const auraU = useMemo(
    () => ({ uTime: { value: 0 }, uHover: { value: 0.25 }, uMouse: { value: new THREE.Vector2(0, 0) }, uFlash: { value: 0 } }),
    []
  );

  useFrame((state) => {
    const { gl, scene, camera: cam } = state;
    const t = state.clock.elapsedTime;
    cosmosU.uTime.value = t;
    lensU.uTime.value = t;
    auraU.uTime.value = t;
    lensU.uResolution.value.set(size.width, size.height);

    lensU.uMouse.value.lerp(mouseTarget.current, 0.08);
    auraU.uMouse.value.copy(lensU.uMouse.value);
    const h = lensU.uHover.value + (hoverTarget.current - lensU.uHover.value) * 0.06;
    lensU.uHover.value = h;
    auraU.uHover.value = h;

    if (fxRef.current) fxRef.current.visible = false;
    gl.setRenderTarget(fbo);
    gl.render(scene, cam);
    gl.setRenderTarget(null);
    if (fxRef.current) fxRef.current.visible = true;
  });

  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (entering.current) return;
    mouseTarget.current.set(e.pointer.x, e.pointer.y);
    hoverTarget.current = Math.hypot(e.pointer.x, e.pointer.y) < 0.5 ? 1.0 : 0.3;
  }, []);
  const onLeave = useCallback(() => { if (!entering.current) hoverTarget.current = 0.25; }, []);

  const onDown = useCallback(() => {
    if (entering.current) return;
    entering.current = true;
    hoverTarget.current = 1.0;
    const tl = gsap.timeline({ onComplete: () => onEnter && onEnter() });
    tl.to(lensU.uHover, { value: 1.4, duration: 0.4, ease: "power2.out" }, 0);
    if (fxRef.current) tl.to(fxRef.current.scale, { x: 7, y: 7, z: 7, duration: 1.25, ease: "power2.in" }, 0.1);
    tl.to(camera.position, { z: 0.3, duration: 1.3, ease: "power2.in" }, 0.1);
    tl.to(lensU.uFlash, { value: 1, duration: 0.55, ease: "power2.in" }, 0.78);
    tl.to(auraU.uFlash, { value: 1, duration: 0.55, ease: "power2.in" }, 0.78);
  }, [camera, lensU, auraU, onEnter]);

  return (
    <>
      <Cosmos uniforms={cosmosU} />
      <StarField />
      <group ref={fxRef}>
        <mesh position={[0, 0, -0.05]} renderOrder={2}>
          <planeGeometry args={[6, 6]} />
          <shaderMaterial vertexShader={AURA_VERT} fragmentShader={AURA_FRAG} uniforms={auraU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh renderOrder={1}>
          <circleGeometry args={[1.12, 128]} />
          <shaderMaterial vertexShader={LENS_VERT} fragmentShader={LENS_FRAG} uniforms={lensU} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 2]} onPointerMove={onMove} onPointerOut={onLeave} onPointerDown={onDown}>
          <planeGeometry args={[14, 22]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.7} luminanceSmoothing={0.9} mipmapBlur radius={0.55} />
      </EffectComposer>
    </>
  );
}

/* ============================ public component ============================ */
export interface IstokProps {
  onEnter?: () => void;
}

const STAGE_OUTER: React.CSSProperties = {
  position: "fixed", inset: 0, background: "#03030a",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", touchAction: "none",
};
const STAGE_INNER: React.CSSProperties = { position: "relative", height: "100vh", aspectRatio: "9 / 16", maxWidth: "100vw" };
const CAPTION: React.CSSProperties = {
  position: "absolute", bottom: "6%", left: 0, right: 0, textAlign: "center",
  fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic",
  letterSpacing: "0.14em", fontSize: "clamp(13px,2.4vw,18px)",
  color: "rgba(225,214,180,0.5)", pointerEvents: "none",
  textShadow: "0 0 18px rgba(201,168,76,0.3)", userSelect: "none",
};
const CH_BASE: React.CSSProperties = { position: "absolute", color: "rgba(225,218,190,0.2)", fontSize: "20px", pointerEvents: "none", userSelect: "none", fontFamily: "Georgia, serif" };
const CH_TOP: React.CSSProperties = { ...CH_BASE, top: "3%", left: "50%", transform: "translateX(-50%)" };
const CH_BOTTOM: React.CSSProperties = { ...CH_BASE, bottom: "2.5%", left: "50%", transform: "translateX(-50%)" };
const CH_LEFT: React.CSSProperties = { ...CH_BASE, left: "4%", top: "50%", transform: "translateY(-50%)" };
const CH_RIGHT: React.CSSProperties = { ...CH_BASE, right: "4%", top: "50%", transform: "translateY(-50%)" };
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 50, near: 0.1, far: 100 };
const GL_OPTS = { antialias: true, powerPreference: "high-performance" as const };
const CAPTION_TEXT = "\u041a\u043e\u0441\u043d\u0438\u0441\u044c \u0418\u0441\u043a\u0440\u044b / Touch the Spark";

export default function Istok({ onEnter }: IstokProps) {
  return (
    <div style={STAGE_OUTER}>
      <div style={STAGE_INNER}>
        <Canvas
          camera={CAMERA}
          dpr={[1, 2]}
          gl={GL_OPTS}
          onCreated={(state) => {
            state.gl.toneMapping = THREE.ACESFilmicToneMapping;
            state.gl.toneMappingExposure = 1.0;
          }}
        >
          <IstokSceneInner onEnter={onEnter} />
        </Canvas>
        <div style={CH_TOP}>{"\u2303"}</div>
        <div style={CH_BOTTOM}>{"\u2304"}</div>
        <div style={CH_LEFT}>{"\u2039"}</div>
        <div style={CH_RIGHT}>{"\u203A"}</div>
        <div style={CAPTION}>{CAPTION_TEXT}</div>
      </div>
    </div>
  );
}
