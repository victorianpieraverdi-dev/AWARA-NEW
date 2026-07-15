// AWARA -- Entry screen GLSL. Procedural nebula fallback + sacred-geometry ring + spark.

export const GLSL_NOISE = `
  float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vnoise(vec3 x){
    vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                   mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                   mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
`;

export const FULLSCREEN_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Procedural nebula -- FALLBACK when no art texture is provided.
export const NEBULA_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uParallax;
  uniform float uAspect;
  uniform float uHover;
  ${GLSL_NOISE}
  void main(){
    vec2 q = (vUv - 0.5);
    q.x *= uAspect;
    q += uParallax * 0.04;
    float r = length(q);
    vec3 wp = vec3(q*1.6, uTime*0.008);
    float w1 = fbm(wp);
    float w2 = fbm(wp + vec3(4.7,2.1,0.0));
    float neb = pow(max(fbm(vec3(q*1.6 + vec2(w1,w2)*1.6, uTime*0.01))*1.15,0.0),1.7);
    float band  = smoothstep(0.10,0.5,r) * smoothstep(1.1,0.4,r);
    float cloud = smoothstep(0.34,0.98,neb) * band;
    float tone  = fbm(vec3(q*1.6,3.3));
    vec3 violet = vec3(0.17,0.09,0.32);
    vec3 gold   = vec3(0.34,0.22,0.08);
    // Idle = deep dark cosmos with faint wisps; richer + emerges on approach.
    vec3 col = vec3(0.003,0.003,0.008) + mix(violet,gold,smoothstep(0.35,0.75,tone))*cloud*(0.16 + 1.2*uHover);
    // twinkling starfield -- gives the void real depth (fixes the "dry" look)
    vec2 g = q * 150.0;
    vec2 gi = floor(g);
    float sh1 = hash(vec3(gi, 1.0));
    float sh2 = hash(vec3(gi, 7.3));
    float dstar = length(fract(g) - vec2(sh1, sh2));
    float star = smoothstep(0.10, 0.0, dstar) * step(0.93, sh1);
    float twinkle = 0.5 + 0.5*sin(uTime*2.5 + sh2*30.0);
    col += vec3(0.72,0.78,1.0) * star * twinkle * (0.45 + 0.5*uHover);
    gl_FragColor = vec4(col,1.0);
  }
`;

export const RING_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

// Sacred geometry: hairline concentric rings + 9-rayed Star of Inglia + shimmering edge.
export const RING_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  float ringFn(float d,float rad,float w){ return smoothstep(rad-w,rad,d)-smoothstep(rad,rad+w,d); }
  float seg(vec2 p,vec2 a,vec2 b){ vec2 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h); }
  float folCirc(vec2 p,float rad,float w){ return 1.0 - smoothstep(0.0, w, abs(length(p)-rad)); }
  // Full Flower of Life: 19 overlapping circles on a hex lattice + outer boundary ring.
  float flowerOfLife(vec2 p,float u){
    float acc=0.0; float w=0.0024;
    vec2 e0=vec2(1.0,0.0)*u; vec2 e1=vec2(0.5,0.8660254)*u;
    for(int i=-2;i<=2;i++){ for(int j=-2;j<=2;j++){
      vec2 c=float(i)*e0+float(j)*e1;
      if(length(c)<=2.0*u+0.0001){ acc+=folCirc(p-c,u,w); }
    }}
    acc+=folCirc(p,3.0*u,w*1.3);
    return acc;
  }
  void main(){
    vec2 p=(vUv-0.5)*2.0; float r=length(p); float ang=atan(p.y,p.x);
    // PRESENCE: a faint mandala always hints in the void (baseline 0.18) and ramps
    // to full brightness as the cursor nears the centre (uHover -> 1). Never fully
    // zero, so the ring is RELIABLY visible. BOLD line widths (>= ~0.014) so every
    // figure renders well above one pixel.
    float uh = clamp(uHover, 0.0, 1.0);
    // Figures are always present (baseline) and IGNITE as the cursor nears: brighter,
    // faster rotation, pulsing radiant waves + an expanding shock-ring + core glow.
    float pres = uh*uh; // emerge GRADUALLY from darkness -- invisible far, full at the core
    float fade = 1.0 - smoothstep(0.92, 1.25, r);
    float vib = 0.92 + 0.08*sin(uTime*2.0); // calm shimmer (was a fast nervous flicker)
    float hov = uh*uh;
    vec3 violet = vec3(0.55,0.45,0.95);
    vec3 gold   = vec3(1.0,0.80,0.42);
    vec3 col = vec3(0.0); float a = 0.0;

    // ===== ЗВЕЗДА РУСИ (Star of Rus / Kvadrat Svaroga) =====
    float lw = 0.014 + 0.006*uh; // bold; thickens near the core so the star reads MONOLITHIC

    // (a) CIRCULAR BAND = the Universe / Rod: an outer + inner ring forming the rim.
    float bandO = ringFn(r, 0.90, 0.016);
    float bandI = ringFn(r, 0.82, 0.011);
    col += mix(violet, gold, 0.5+0.5*sin(ang*4.0)) * (bandO + bandI) * 0.85 * vib;
    a += (bandO + bandI) * 0.7;

    // (b) THREE INTERLOCKING TRIANGLES = the 9-rayed Star of Inglia. Each equilateral
    //     triangle is rotated by 40deg (= 120/3) from the next, so their 9 vertices land
    //     evenly every 40deg -> a clean 9-pointed star. Kept as the OUTER frame (obodok).
    float R = 0.84;
    float tri = 0.0;
    for(int t=0;t<3;t++){
      float b = float(t) * 0.6981317;          // 40 degrees
      vec2 v0 = vec2(cos(b + 1.5708),              sin(b + 1.5708))              * R;
      vec2 v1 = vec2(cos(b + 1.5708 + 2.0943951),  sin(b + 1.5708 + 2.0943951))  * R;
      vec2 v2 = vec2(cos(b + 1.5708 + 4.1887902),  sin(b + 1.5708 + 4.1887902))  * R;
      tri += 1.0 - smoothstep(0.0, lw, seg(p, v0, v1));
      tri += 1.0 - smoothstep(0.0, lw, seg(p, v1, v2));
      tri += 1.0 - smoothstep(0.0, lw, seg(p, v2, v0));
    }
    tri = clamp(tri, 0.0, 1.0);
    tri *= smoothstep(0.34, 0.60, r); // fade the star's inner crossings -> the 9-pointed star reads as an OUTER frame (obodok), leaving the centre clear for the cosmogony
    col += gold * tri * 0.85 * vib;
    a += tri * 0.7;

    // (c) Inner mandala MOVED: the centre now hosts the cosmogonic sequence
    //     (Pralaya -> Bindu -> Spirit/Matter -> Cross -> Sun-wheel/Galaxy), drawn
    //     after the presence multiply below so it is gated by APPROACH STAGES
    //     (per-stage windows on uh) rather than by the global presence factor.

    // (d) RUNNING WELD-SPARK: a bright bead races around the 9-gon outline like
    //     electricity inside a diode (two beads, opposite phase) + a chasing
    //     shimmer along the rim, so the geometry feels ALIVE.
    float ai  = (ang + 3.1415927) / 6.2831853;    // 0..1 around the rim
    float run = fract(uTime * 0.16);
    float dd  = abs(fract(ai - run  + 0.5) - 0.5);
    float run2 = fract(uTime * 0.16 + 0.5);
    float dd2 = abs(fract(ai - run2 + 0.5) - 0.5);
    float bead = exp(-dd*dd*1300.0) + 0.4*exp(-dd*dd*150.0) + exp(-dd2*dd2*1300.0);
    float chase = 0.6 + 0.4*sin(ai*56.5487 - uTime*5.0);
    float edge = max(tri, bandO + bandI);         // races along the star AND the rim
    float weld = edge * (bead*1.3 + chase*0.18);
    col += vec3(1.0,0.96,0.82) * weld;
    a += weld * 0.6;

    col *= pres;
    a *= pres;

    // ===== INNER COSMOGONY: Pralaya -> Bindu -> Spirit|Matter -> Cross -> Sun-wheel/Galaxy =====
    // The further the cursor approaches (uh 0->1), the further creation unfolds. Stage
    // windows cross-fade so the figure BUILDS, then the cross arms CURVE + SPIN and open
    // into a 4-arm spiral galaxy -- a transient solar wheel (rounded arms, always in
    // motion, dissolving into the cosmos), never a hard static emblem. Drawn OUTSIDE the
    // pres multiply so the early stages are visible the moment the approach begins.
    {
      float gDisk  = smoothstep(0.03, 0.12, uh) * (1.0 - smoothstep(0.74, 0.90, uh)); // ring dissolves at the wheel
      float gPoint = smoothstep(0.12, 0.22, uh);
      float gStrt  = 1.0 - smoothstep(0.72, 0.88, uh); // straight bars fade as the wheel forms
      float gHoriz = smoothstep(0.30, 0.44, uh) * gStrt;
      float gVert  = smoothstep(0.50, 0.64, uh) * gStrt;
      float gWheel = smoothstep(0.72, 0.97, uh);
      float ir = 0.50; // inner scene radius

      // (1) PRALAYA -- the resting circle of the Absolute.
      float disk = ringFn(r, ir, 0.012);
      col += mix(violet, gold, 0.30) * disk * gDisk * 0.80 * vib;
      a   += disk * gDisk * 0.55;

      // (2) BINDU -- the first point of creation at the centre.
      float bindu = exp(-r*r*440.0) + 0.35*exp(-r*r*90.0);
      col += vec3(1.0, 0.92, 0.70) * bindu * gPoint;
      a   += bindu * gPoint * 0.80;

      // (3) HORIZONTAL diameter -- Spirit | Matter.
      float horiz = (1.0 - smoothstep(0.0, lw*0.9, abs(p.y))) * (1.0 - smoothstep(ir-0.02, ir+0.02, abs(p.x)));
      col += gold * horiz * gHoriz * 0.80 * vib;
      a   += horiz * gHoriz * 0.55;

      // (4) VERTICAL diameter -- the Cross / Cosmic Mind.
      float vert = (1.0 - smoothstep(0.0, lw*0.9, abs(p.x))) * (1.0 - smoothstep(ir-0.02, ir+0.02, abs(p.y)));
      col += gold * vert * gVert * 0.80 * vib;
      a   += vert * gVert * 0.55;

      // (5) SUN-WHEEL -> SPIRAL GALAXY -- the 4 arms curve (twist) and spin (uTime),
      //     opening from a cross into a rotating 4-arm galaxy.
      float spin  = uTime * (0.4 + 1.4*gWheel);
      float twist = 9.0 * gWheel;                          // 0 = straight cross -> full log-spiral
      float gAng  = 4.0*ang - twist*log(r*3.0 + 1.0) - spin;
      float arm   = pow(max(0.0, 0.5 + 0.5*cos(gAng)), mix(9.0, 2.5, gWheel));
      float gMask = smoothstep(0.03, 0.10, r) * (1.0 - smoothstep(0.42, 0.56, r));
      float wheel = arm * gMask;
      col += mix(gold, vec3(1.0,0.90,0.70), 0.40) * wheel * gWheel * 0.70 * vib;
      a   += wheel * gWheel * 0.45;
    }

    // ===== FLOWER OF LIFE -- the sacred lattice RESTORED =====
    // A delicate gold mandala of overlapping circles, woven BEHIND the cosmogony.
    // It ignites with approach and stays as the geometric womb of creation. Drawn
    // OUTSIDE the pres multiply so it builds together with the inner sequence.
    {
      float fol  = clamp(flowerOfLife(p, 0.165), 0.0, 1.0);
      float gFol = smoothstep(0.14, 0.38, uh); // emerges early, then remains present
      col += mix(violet, gold, 0.5) * fol * gFol * 0.42 * vib;
      a   += fol * gFol * 0.30;
    }

    // 5) EFFECTS igniting on approach: pulsing radiant waves, breathing core glow,
    //    and an expanding shock-ring bursting outward from the centre.
    float pulse = 0.6 + 0.4*sin(uTime*1.8); // calmer, slower breath
    float waves = (0.5+0.5*sin(r*10.0 - uTime*2.2)) * exp(-r*r*2.8);
    float core  = exp(-r*r*4.5);
    // No harsh expanding shock-ring -- a soft, beckoning inner glow only.
    vec3 fxCol = mix(gold, vec3(1.0,0.92,0.72), 0.5);
    float beacon = (waves*0.7 + core*1.0) * pulse * hov;
    col += fxCol * beacon;
    a += beacon * 0.3;

    a = clamp(a * fade, 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`;

// Dark glass ORB -- a real volumetric sphere faked from a spherical normal +
// fresnel rim + specular glints. NORMAL-blended, so its dark body COVERS the
// cosmos behind it; only the thin rim + glints catch light, like the reference.
export const ORB_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  void main(){
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    if (r > 1.0) discard;
    float z = sqrt(max(0.0, 1.0 - r*r));
    vec3 n = vec3(p, z);
    vec3 L  = normalize(vec3(-0.45, 0.55, 0.78));
    vec3 L2 = normalize(vec3(0.32, -0.62, 0.72));
    float diff  = max(0.0, dot(n, L));
    float fres  = pow(1.0 - z, 3.4); // tighter rim -> crisp silhouette, light hugs the very edge
    float spec1 = pow(max(0.0, dot(n, L)),  64.0);
    float spec2 = pow(max(0.0, dot(n, L2)), 110.0);
    // COSMIC VOID bubble: near-BLACK interior (darker than the cosmos around it)
    // so it reads as a void sphere, NOT a lit glass ball. Minimal diffuse.
    // ABSOLUTE VOID interior: near pure black, far darker than the cosmos around it.
    // This is not a glass ball -- it is darkness/emptiness itself.
    vec3 body = vec3(0.0008,0.0010,0.0030) + vec3(0.02,0.022,0.05)*diff*0.06;
    // a WHISPER-thin glassy line right at the rim -- tight + faint, so the body stays
    // a deep void instead of reading as a milky soap bubble.
    float inner = exp(-pow((r-0.88)/0.05,2.0));
    body += vec3(0.05,0.06,0.13)*inner*0.07;
    vec3 rimCol = mix(vec3(0.38,0.60,1.0), vec3(0.74,0.58,1.0), 0.5+0.5*sin(uTime*0.4));
    // The void sphere LIVES even at rest: a slow primordial-darkness breath on the
    // rim + a faint inner swell, independent of hover.
    float idle = 0.5 + 0.5*sin(uTime*0.6);
    vec3 col = body;
    col += rimCol * fres * (0.42 + 0.12*idle + uHover*1.5);
    // GOLDEN KANT: a warm gold rim that ignites on the sphere of darkness and GROWS
    // as the cursor nears the core, in step with the rising 9-gon + Flower of Life.
    vec3 goldRim = vec3(1.0, 0.78, 0.35);
    col += goldRim * pow(fres, 1.6) * uHover * 1.4;
    col += vec3(0.02,0.025,0.06) * exp(-r*r*2.6) * (0.25 + 0.5*idle) * 0.18; // faint, no milky central haze
    {
      // Keep the body a DARK void even on hover, so the rotating runes around
      // the sphere stay readable instead of being drowned by a bright ball.
      float ig = exp(-r*r*4.0);
      col += mix(vec3(0.55,0.46,0.95), vec3(1.0,0.82,0.45), ig) * ig * uHover * 0.7;
      col += vec3(0.14,0.11,0.26) * uHover * (1.0 - r*0.55) * 0.18;
    }
    col += vec3(0.82,0.88,1.0)*spec1*0.8;
    col += vec3(0.70,0.76,1.0)*spec2*0.6;
    // hover: the void gently IGNITES from the core -- a soft inner cosmos rising from darkness.
    float core = exp(-r*r*3.5);
    col += vec3(0.60,0.52,0.96)*core*uHover*0.9;
    // a subtle breathing glow across the sphere as it awakens (uHover-gated, never at rest)
    float breath = 0.85 + 0.15*sin(uTime*1.6);
    col += vec3(0.30,0.27,0.60)*uHover*0.10*breath;
    // the bubble DARKENS whatever is behind it -> a true void on the cosmos.
    // Feather the very edge so the silhouette no longer clashes with the 9-gon
    // lines crossing it -- a clean, soft rim instead of a hard cut.
    float edgeAA = 1.0 - smoothstep(0.984, 1.0, r); // CRISP silhouette: tight ~1-2px feather only (still increasing-order so it stays defined on all GPUs)
    float a = edgeAA; // fully OPAQUE void inside; only the rim feathers -> the darkness truly BLOCKS the cosmos behind it
    gl_FragColor = vec4(col, a);
  }
`;

export const SPARK_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

// Razor-sharp gold spark (#ffd27a) + 4-point star + orbiting points.
export const SPARK_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  void main(){
    vec2 p = vUv - 0.5;
    float d = length(p);
    float ang = atan(p.y, p.x);
    float core   = exp(-d*d*180.0)*0.7 + exp(-d*d*26.0)*0.6; // soft + deep, not a hard hot dot
    float spikes = (pow(max(0.0,cos(ang*2.0)),52.0)+pow(max(0.0,cos(ang*2.0+1.5708)),52.0))*exp(-d*26.0)*0.28;
    float orbit = 0.0;
    for(int i=0;i<3;i++){
      float aa = uTime*0.35 + float(i)*2.0944;
      vec2 op = vec2(cos(aa),sin(aa)) * (0.05 + 0.012*float(i));
      float pd = length(p - op);
      orbit += exp(-pd*pd*6000.0) * 0.6;
    }
    vec3 gold = vec3(1.0, 0.823, 0.478);
    float i = (core*1.3 + spikes + orbit) * uIntensity;
    gl_FragColor = vec4(gold * i, clamp(i,0.0,1.0));
  }
`;
