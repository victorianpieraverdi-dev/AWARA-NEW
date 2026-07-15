// AWARA -- Screen 0 "Entry". Accessible orchestrator: capability gate, lazy WebGL,
// state machine, parallax, i18n, GSAP transition. No router -- uses onEnter callback.
//
// The cosmos is concept art: drawn as a full-bleed CSS background (cover) behind a
// transparent canvas that renders ONLY live layers (ring + spark). The art is
// preloaded; if it is missing / 404s we silently keep the procedural fallback,
// so the screen never crashes before the asset is dropped into /public/assets.

import * as React from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import EntryScene from "./scene";
import {
  useEntryMachine,
  useDeviceCapabilities,
  useParallax,
  useAmbientSound,
  useLocale,
  resolveLocale,
  type Locale,
} from "./core";
import styles from "./EntryScreen.module.css";

export interface EntryScreenProps {
  /** Called when the entry transition completes (navigate to next screen). */
  onEnter?: () => void;
  /** Force a locale; otherwise detected from navigator. */
  locale?: Locale;
  /** URL of the premium nebula concept art (recommended .webp). Falls back to procedural. */
  nebulaUrl?: string;
}

function StaticFallback({ nebulaUrl }: { nebulaUrl?: string }) {
  const bgStyle: React.CSSProperties = nebulaUrl ? { backgroundImage: `url(${nebulaUrl})` } : {};
  return (
    <div className={styles.fallbackBg} style={bgStyle} aria-hidden="true">
      <div className={styles.fallbackSpark} />
    </div>
  );
}

export default function EntryScreen({ onEnter, locale, nebulaUrl }: EntryScreenProps) {
  const machine = useEntryMachine();
  const caps = useDeviceCapabilities();
  const parallax = useParallax(caps.canRender3D);
  // Locale is now STATEFUL so the RU/EN toggle can switch the caption live.
  const [lang, setLang] = useState<Locale>(resolveLocale(locale));
  const { t } = useLocale(lang);

  // Direct cursor->sphere proximity, driven by the button itself (which covers
  // the orb and reliably receives pointer events). 1 at the centre, 0 at the
  // edge. Independent of the window listener / state machine. This is the
  // authoritative wake signal for the scene.
  const hoverProx = useRef(0);

  // Ambient sound (pure Web Audio, no assets). Disabled under reduced motion.
  const sound = useAmbientSound(!caps.reducedMotion);

  // Raw pointer (window space) for the cursor comet.
  const pointer = useRef({ x: -1, y: -1, seen: false });
  // Comet tail: a short chain of dots that lerp toward the pointer, each trailing
  // the previous. Transform-only (GPU); built imperatively to avoid React churn.
  const cometDots = useRef<Array<HTMLDivElement | null>>([]);
  const meteorRef = useRef<HTMLDivElement>(null);

  // ---- Mobile "hold to summon" charge ----------------------------------------
  // A phone has no hover, so instead of snapping the cosmos open on tap we let it
  // be BORN gradually. TWO touch modes:
  //  * HOLD: while the orb is held, touchCharge eases 0 -> 1 over ~1.6s and feeds
  //    hoverProx, so the cosmogony (Pralaya -> Bindu -> Cross -> 9-gon -> spiral
  //    galaxy) unfolds under the finger; holding to full pulls you in. A partial
  //    hold released past the threshold also enters; released early it recedes.
  //  * SINGLE TAP: kicks off the SAME birth hands-free (autoReveal) over ~3.2s --
  //    no need to keep holding -- and the universe WAITS, fully born, for a SECOND
  //    tap to cross the threshold. Desktop is untouched.
  const touchHold = useRef(false);
  const touchCharge = useRef(0);
  const touchEntered = useRef(false);
  const touchStartT = useRef(0);
  const autoReveal = useRef(false);   // a single tap kicked off the hands-free birth
  const touchTickIdx = useRef(0);     // next cosmogony-stage haptic to fire
  const lastPointerType = useRef("mouse"); // guards onClick from double-firing on touch
  const [revealReady, setRevealReady] = useState(false); // show the "tap again to enter" hint

  // Preload the concept art. Unknown -> procedural; success -> CSS background;
  // error (asset not present yet) -> stay procedural. Never throws.
  const [artReady, setArtReady] = useState(false);
  useEffect(() => {
    setArtReady(false);
    if (!nebulaUrl) return;
    const img = new Image();
    let alive = true;
    img.onload = () => { if (alive) setArtReady(true); };
    img.onerror = () => { if (alive) setArtReady(false); };
    img.src = nebulaUrl;
    return () => { alive = false; };
  }, [nebulaUrl]);

  // The cosmos + halo emerge GRADUALLY from darkness, tied to the SAME cursor signal
  // as the figures (hoverProx) but TIME-SMOOTHED: nothing snaps in the instant the
  // cursor crosses the sphere -- it swells in softly and recedes softly.
  const bgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const revealSmooth = useRef(0);
  useEffect(() => {
    if (!caps.canRender3D) return;
    let raf = 0;
    const tick = () => {
      revealSmooth.current += (hoverProx.current - revealSmooth.current) * 0.06; // slow ease
      const p = revealSmooth.current;       // 0..1, eased + sphere-gated + smoothed
      sound.setLevel(p); // swell the low void drone as the cursor nears the core
      const bg = bgRef.current;
      if (bg) {
        const x = parallax.current.x * 14;
        const y = parallax.current.y * 14;
        const sc = 1.03 + 0.14 * p;           // gentle bloom / zoom from the centre
        bg.style.opacity = String(Math.min(1, p * 1.15));
        bg.style.transform = `scale(${sc}) translate(${x}px, ${y}px)`;
      }
      const gl = glowRef.current;
      if (gl) gl.style.opacity = String(p * 0.5); // soft halo, fades in with distance
      const pf = pulseRef.current;
      if (pf) pf.style.opacity = String(p * 0.9); // waves only roll while approaching
      const st = starsRef.current;
      if (st) {
        // Feed the SAME proximity + parallax signal to the CSS star layers. Each
        // layer reads --p/--px/--py with its own depth coefficient, so deeper
        // layers spiral + contract toward the centre faster -> a vortex that
        // draws the cosmos into the void as the cursor nears the core.
        //
        // Idle drift: a slow circular offset folded into the parallax signal so the
        // field keeps gently breathing even at rest. This rides the SAME transform
        // the layers already use (GPU composite only -- no per-frame repaint), so
        // it is essentially free, unlike the old background-position animation.
        const drift = performance.now() * 0.00006;
        st.style.setProperty("--p", String(p));
        st.style.setProperty("--px", String(parallax.current.x + Math.cos(drift) * 0.35));
        st.style.setProperty("--py", String(parallax.current.y + Math.sin(drift) * 0.35));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [caps.canRender3D, parallax]);

  // Cursor comet + rare shooting star. Both are pointer-driven, transform-only,
  // and fully gated by reduced motion. Each is independent + easy to remove.
  useEffect(() => {
    if (caps.reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.seen = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Comet: each dot eases toward the one ahead of it (head follows the pointer).
    const pos = cometDots.current.map(() => ({ x: -50, y: -50 }));
    let raf = 0;
    const tick = () => {
      const dots = cometDots.current;
      for (let i = 0; i < dots.length; i++) {
        const tx = i === 0 ? pointer.current.x : pos[i - 1].x;
        const ty = i === 0 ? pointer.current.y : pos[i - 1].y;
        pos[i].x += (tx - pos[i].x) * 0.35;
        pos[i].y += (ty - pos[i].y) * 0.35;
        const el = dots[i];
        if (el) {
          el.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`;
          el.style.opacity = pointer.current.seen ? "" : "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Meteor: streak across the deep field at long random intervals.
    let meteorTimer = 0;
    const fireMeteor = () => {
      const el = meteorRef.current;
      if (el) {
        const mx = 8 + Math.random() * 60;
        const my = 4 + Math.random() * 26;
        const ma = 18 + Math.random() * 24;
        const md = 60 + Math.random() * 30;
        const mdur = 0.9 + Math.random() * 0.6;
        el.style.setProperty("--mx", `${mx}vw`);
        el.style.setProperty("--my", `${my}vh`);
        el.style.setProperty("--ma", `${ma}deg`);
        el.style.setProperty("--md", `${md}vw`);
        el.style.setProperty("--mdur", `${mdur}s`);
        el.classList.remove(styles.meteorFire);
        void el.offsetWidth; // reflow so the animation can restart
        el.classList.add(styles.meteorFire);
        const clear = () => { el.classList.remove(styles.meteorFire); };
        el.addEventListener("animationend", clear, { once: true });
      }
      meteorTimer = window.setTimeout(fireMeteor, 18000 + Math.random() * 22000);
    };
    meteorTimer = window.setTimeout(fireMeteor, 6000 + Math.random() * 8000);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      window.clearTimeout(meteorTimer);
    };
  }, [caps.reducedMotion]);

  // ---- Mobile sensory package (touch only; desktop is left untouched) ----
  // Light haptic feedback. Android honours navigator.vibrate; iOS Safari has no
  // vibrate API (there the magic is carried by sound + gyro-tilt), so this is a
  // silent no-op on iPhone. Fully gated by reduced motion.
  const tiltAsked = useRef(false);
  const haptic = useCallback((pattern: number | number[]) => {
    if (caps.reducedMotion) return;
    try { navigator.vibrate?.(pattern); } catch { /* unsupported -> ignore */ }
  }, [caps.reducedMotion]);

  // iOS 13+ gates DeviceOrientation behind a user-gesture permission prompt, so
  // the gyro-tilt parallax (already wired in useParallax) silently does nothing
  // on iPhone until we ASK. Ask ONCE, on the first touch. No-op on Android /
  // desktop, where the permission API is absent.
  const unlockTilt = useCallback(() => {
    if (tiltAsked.current) return;
    tiltAsked.current = true;
    const DOE = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      DOE.requestPermission().catch(() => { /* denied -> tilt stays off */ });
    }
  }, []);

  const goNext = useCallback(() => { if (onEnter) onEnter(); }, [onEnter]);

  const activate = useCallback(() => {
    if (machine.isTransition) return;
    hoverProx.current = 1;          // hold the full bloom through the dive into the sphere
    haptic([0, 18, 55, 30]);        // deep threshold-crossing pulse on entry (Android)
    if (!caps.canRender3D) { goNext(); return; }
    sound.ensureStarted();
    sound.chime(); // a soft gold bell as you cross the threshold
    machine.send({ type: "ACTIVATE" });
    window.setTimeout(goNext, 1300); // safety net if scene onComplete is missed
  }, [machine, caps.canRender3D, goNext, sound, haptic]);

  // Drive the mobile hold-charge each frame: ramp up while held (and gently pull
  // the player in once the universe is fully born), recede when released early.
  // touchCharge stays exactly 0 on desktop, so hoverProx is never touched there.
  useEffect(() => {
    // Cosmogony-stage thresholds on the 0..1 charge: Bindu point, first cross
    // line, second cross line / 9-gon, then the spiral-galaxy motion. Each fires a
    // soft stage haptic (Android) as that layer is born.
    const STAGE_TICKS = [0.16, 0.37, 0.57, 0.80];
    let raf = 0;
    const tick = () => {
      const charging = touchHold.current || autoReveal.current;
      if (charging) {
        if (touchHold.current) {
          touchCharge.current += (1 - touchCharge.current) * 0.035 + 0.004; // ~1.6s while held
        } else {
          touchCharge.current += 0.0052; // ~3.2s hands-free birth after a single tap
        }
        if (touchCharge.current > 1) touchCharge.current = 1;
        hoverProx.current = touchCharge.current;
        while (touchTickIdx.current < STAGE_TICKS.length && touchCharge.current >= STAGE_TICKS[touchTickIdx.current]) {
          haptic(8 + touchTickIdx.current * 2);
          touchTickIdx.current += 1;
        }
        // Holding to full pulls you in. A single-tap auto-reveal instead WAITS at
        // the fully-born universe for a second tap (handled in onPointerUp).
        if (touchHold.current && touchCharge.current >= 0.985 && !touchEntered.current) {
          touchEntered.current = true;
          activate();
        }
      } else if (touchCharge.current > 0.002 && !machine.isTransition) {
        touchCharge.current += (0 - touchCharge.current) * 0.08;
        hoverProx.current = touchCharge.current;
      } else if (touchCharge.current !== 0 && !machine.isTransition) {
        touchCharge.current = 0;
        hoverProx.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [machine.isTransition, activate, haptic]);

  const nebulaBgStyle: React.CSSProperties = nebulaUrl ? { backgroundImage: `url(${nebulaUrl})` } : {};

  return (
    <main className={styles.root} data-state={machine.state}>
      <div className={styles.centerVeil} aria-hidden="true" />

      {/* Birth from the void: a one-time intro -- a spark ignites in pure black,
          swells, then blooms outward as the veil lifts (CSS only, plays once). */}
      <div className={styles.birth} aria-hidden="true">
        <div className={styles.birthSpark} />
      </div>

      {/* Sound toggle -- gold, top-left. Mutes/unmutes the ambient void + chime. */}
      <div className={styles.soundToggle}>
        <button
          type="button"
          className={styles.soundButton}
          data-muted={sound.muted ? "true" : "false"}
          aria-pressed={sound.muted ? "true" : "false"}
          aria-label={sound.muted ? "Unmute sound" : "Mute sound"}
          onClick={() => { sound.ensureStarted(); sound.toggleMute(); }}
        >
          {"\u266A"}
        </button>
      </div>

      {/* RU/EN language toggle -- gold, top-right. Switches the caption language. */}
      <div className={styles.langToggle} role="group" aria-label="Language">
        <button
          type="button"
          className={styles.langOption}
          data-active={lang === "ru" ? "true" : "false"}
          onClick={() => setLang("ru")}
        >
          RU
        </button>
        <span className={styles.langSep} aria-hidden="true">/</span>
        <button
          type="button"
          className={styles.langOption}
          data-active={lang === "en" ? "true" : "false"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>

      {/* Deep cosmos: a layered nebula that BLOOMS from the centre, driven by cursor
          proximity (bgRef) -- the same signal as the figures. Dark/empty at rest; it
          emanates outward as the cursor crosses the sphere and nears the core. */}
      <div ref={bgRef} className={styles.cosmos} aria-hidden="true" />

      {/* Parallax star funnel: three depth layers of living, twinkling stars on a
          deep-dark void. Driven by cursor proximity (starsRef) -- deeper layers
          spiral + contract toward the centre faster, so the cosmos is drawn into
          the sphere like a vortex as you approach. */}
      <div ref={starsRef} className={styles.starField} aria-hidden="true">
        <div className={styles.starFar} />
        <div className={styles.starMid} />
        <div className={styles.starNear} />
      </div>

      {/* Breath field: slow, DARK primordial waves that always emanate from the
          sphere -- a subtle space-distorting vibration, the sphere's living breath
          even at rest. Always on (very faint), independent of proximity. */}
      <div className={styles.breathField} aria-hidden="true">
        <span className={styles.breathRing} />
        <span className={styles.breathRing} />
      </div>

      {/* Pulse field: waves emanate from the central spark, roll out past the sphere
          across the whole screen, and fade toward the edges. Opacity is gated by
          cursor proximity (pulseRef) so they only roll while approaching. */}
      <div ref={pulseRef} className={styles.pulseField} aria-hidden="true">
        <span className={styles.pulseRing} />
        <span className={styles.pulseRing} />
        <span className={styles.pulseRing} />
      </div>

      {/* Rare shooting star (fired from JS) + the cursor comet trail. */}
      <div ref={meteorRef} className={styles.meteor} aria-hidden="true" />
      <div className={styles.comet} aria-hidden="true">
        <div ref={(el) => { cometDots.current[0] = el; }} className={styles.cometDot} />
        <div ref={(el) => { cometDots.current[1] = el; }} className={styles.cometDot} />
        <div ref={(el) => { cometDots.current[2] = el; }} className={styles.cometDot} />
        <div ref={(el) => { cometDots.current[3] = el; }} className={styles.cometDot} />
        <div ref={(el) => { cometDots.current[4] = el; }} className={styles.cometDot} />
        <div ref={(el) => { cometDots.current[5] = el; }} className={styles.cometDot} />
      </div>

      <div className={styles.canvasLayer} aria-hidden="true">
        {caps.canRender3D ? (
          <Suspense fallback={<StaticFallback nebulaUrl={nebulaUrl} />}>
            <EntryScene
              state={machine.state}
              parallax={parallax}
              proximityHint={hoverProx}
              proceduralBg={false}
              mobile={caps.mobile}
              onTransitionComplete={goNext}
            />
          </Suspense>
        ) : (
          <StaticFallback nebulaUrl={nebulaUrl} />
        )}
      </div>

      <div ref={glowRef} className={styles.hoverGlow} aria-hidden="true" />

      <div className={styles.flash} aria-hidden="true" />

      <button
        type="button"
        className={styles.sparkButton}
        aria-label={t("sparkAria")}
        title={t("enterHint")}
        onPointerEnter={() => { sound.ensureStarted(); machine.send({ type: "HOVER" }); }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch") return; // touch blooms fully on tap (below) -- no proximity tracking on phones
          const r = e.currentTarget.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          // Distance to the sphere centre (0 = centre, 1 = button edge). The sphere
          // fills the inner ~62% of the button, so reveal stays 0 until the cursor
          // actually CROSSES the sphere, then eases in (s*s) and accelerates toward
          // the core -- a soft tender emergence, not a hard pop a few cm early.
          const h = Math.hypot(dx, dy);
          const SPHERE = 0.62;
          const s = Math.max(0, Math.min(1, (SPHERE - h) / SPHERE));
          hoverProx.current = s * s;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "touch") { touchHold.current = false; return; }
          hoverProx.current = 0; machine.send({ type: "UNHOVER" });
        }}
        onFocus={() => machine.send({ type: "FOCUS" })}
        onBlur={() => machine.send({ type: "BLUR" })}
        onPointerDown={(e) => {
          sound.ensureStarted();
          lastPointerType.current = e.pointerType;
          if (e.pointerType === "touch") {
            // Touch press. Holding summons the cosmos gradually under the finger;
            // a quick tap (decided in onPointerUp) instead kicks off the hands-free
            // birth. A soft haptic marks the touch + the gyro-tilt is unlocked. NO
            // state PRESS here: that would force a full bloom and skip the gradual
            // birth we want on mobile.
            touchHold.current = true;
            touchStartT.current = performance.now();
            if (!autoReveal.current) {
              // First contact: a fresh birth from the void.
              touchEntered.current = false;
              touchTickIdx.current = 0;
            }
            haptic(14);
            unlockTilt();
          } else {
            machine.send({ type: "PRESS" });
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "touch") return;
          touchHold.current = false;
          if (touchEntered.current) return;
          const quickTap = performance.now() - touchStartT.current < 300;
          if (autoReveal.current) {
            // SECOND tap (during or after the hands-free birth) -> cross the threshold.
            touchEntered.current = true;
            activate();
          } else if (quickTap) {
            // FIRST single tap -> let the cosmos be born hands-free over a few
            // seconds (point -> circle -> cross -> 9-gon -> spiral galaxy). The NEXT
            // tap enters. No transition yet.
            autoReveal.current = true;
            setRevealReady(true);
          } else if (touchCharge.current >= 0.45) {
            // A deliberate hold released past the threshold -> enter.
            touchEntered.current = true;
            activate();
          }
          // else: a short partial hold -> recede (handled in the rAF loop).
        }}
        onPointerCancel={(e) => { if (e.pointerType === "touch") touchHold.current = false; }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } }}
        onClick={() => { if (lastPointerType.current !== "touch") activate(); }}
      />

      <p className={styles.caption}>{t("caption")}</p>
      <p className={styles.touchHint} aria-hidden="true">{revealReady ? t("tapAgainHint") : t("touchHint")}</p>
    </main>
  );
}
