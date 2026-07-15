// AWARA -- Node 2 "Golden Egg" hub / main menu (egg-hub).
// Cinematic entrance: a point of light blooms -> the egg is born from it ->
// light rings spin in -> orbital sparkles drift. On entering, ONLY the egg
// (with its living aura) is shown. Clicking the egg fans out 4 directional
// gates, appearing clockwise out of emptiness:
//   UP -> Board game (6), RIGHT -> Chronicle (3), DOWN -> Daimon (4), LEFT -> Soul (5)
// Choosing a gate zooms cinematically toward it. Click empty space / Esc closes
// the gates; again -> back to the Universe.
// Layout is responsive (min()/vw/vh) so nothing clips on narrow screens.
// All Cyrillic UI text lives in eggHubText.json. Inline style object literals are
// avoided (named consts/helpers only) so the source never contains a literal
// double-brace; a few glyphs use \u escapes.

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlayer } from "../PlayerProvider";
import TEXT from "./eggHubText.json";

type Locale = "ru" | "en";
type GateId = "up" | "down" | "right" | "left";

// 9 levels bottom -> top: 7 chakras + white + gold (9-dimensional system).
const CHAKRA_COLORS = ["#ff2d2d", "#ff8a1f", "#ffd11f", "#27d96a", "#1fb6ff", "#3a54ff", "#9b4dff", "#ffffff", "#ffd24a"];
const GREY = "#5d5d66";
const EGG_SHAPE = "50% 50% 50% 50% / 60% 60% 42% 42%";

// Responsive sizes (egg stays small so gates & halos fit any screen).
const EGG_W = "min(168px, 50vw)";
const EGG_H = "min(224px, 42vh)";
const HALO1_W = "min(214px, 62vw)";
const HALO1_H = "min(286px, 54vh)";
const HALO2_W = "min(250px, 72vw)";
const HALO2_H = "min(322px, 60vh)";
const AURA_W = "min(360px, 94vw)";
const AURA_H = "min(420px, 80vh)";
const RAYS = "min(460px, 120vw)";
const BLOOM = "min(150px, 36vw)";
const OFF_X = "min(174px, 38vw)";
const OFF_Y = "min(176px, 29vh)";

const KEYFRAMES =
  "@keyframes egghubFade{from{opacity:0}to{opacity:1} }" +
  "@keyframes egghubStars{0%,100%{opacity:.45}50%{opacity:.85} }" +
  "@keyframes egghubBloom{0%{opacity:0;transform:scale(.2)}28%{opacity:.95}100%{opacity:0;transform:scale(2.4)} }" +
  "@keyframes egghubRise{from{opacity:0;transform:scale(.4);filter:blur(18px)}to{opacity:1;transform:scale(1);filter:blur(0)} }" +
  "@keyframes egghubBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)} }" +
  "@keyframes egghubAura{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.72;transform:scale(1.08)} }" +
  "@keyframes egghubSpin{from{transform:rotate(0)}to{transform:rotate(360deg)} }" +
  "@keyframes egghubSpinRev{from{transform:rotate(360deg)}to{transform:rotate(0)} }" +
  "@keyframes egghubRingIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)} }" +
  "@keyframes egghubGateIn{from{opacity:0;transform:translateY(12px) scale(.6);filter:blur(7px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)} }" +
  "@keyframes egghubPulse{0%,100%{opacity:.85}50%{opacity:1} }" +
  "@keyframes egghubShimmer{0%{background-position:0% 0%}100%{background-position:220% 220%} }" +
  "@keyframes egghubCore{0%,100%{transform:translate(-50%,-50%) scale(1);box-shadow:0 0 14px rgba(255,205,90,.7),0 0 30px rgba(255,180,60,.45)}50%{transform:translate(-50%,-50%) scale(1.12);box-shadow:0 0 22px rgba(255,222,120,.95),0 0 48px rgba(255,190,70,.7)} }" +
  ".egghub-gate{transition:filter .3s ease}.egghub-gate:hover{filter:brightness(1.2)}.egghub-gate:hover .egghub-ring{box-shadow:0 0 16px rgba(255,205,110,.85);border-color:rgba(255,228,150,.95);background:radial-gradient(circle, rgba(255,224,150,.28), transparent 70%)}" +
  ".egghub-corner{transition:all .3s ease}.egghub-corner:hover{filter:brightness(1.18);transform:translateY(-1px)}" +
  "@keyframes egghubFadeOut{0%{opacity:0}100%{opacity:1}}" +
  "@keyframes egghubRipple{0%{transform:scale(.5);opacity:.7}70%{opacity:.15}100%{transform:scale(2.2);opacity:0}}" +
  "@keyframes egghubArrival{0%{opacity:1}100%{opacity:0;visibility:hidden}}";

// Centre a fixed/responsive-sized box without using transform (so transform stays
// free for entrance/spin animations).
const centerBox = (w: string, h: string): React.CSSProperties => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: w,
  height: h,
  marginLeft: "calc(" + w + " / -2)",
  marginTop: "calc(" + h + " / -2)",
  pointerEvents: "none",
});

const RING_MASK_A = "radial-gradient(closest-side, transparent 69%, #000 71%, #000 85%, transparent 100%)";
const RING_MASK_B = "radial-gradient(closest-side, transparent 75%, #000 77%, #000 87%, transparent 100%)";

const STARFIELD =
  "radial-gradient(1.6px 1.6px at 12% 16%, rgba(255,255,255,.9), transparent 60%)," +
  "radial-gradient(1.2px 1.2px at 27% 62%, rgba(255,240,210,.8), transparent 60%)," +
  "radial-gradient(1.3px 1.3px at 41% 24%, rgba(255,255,255,.7), transparent 60%)," +
  "radial-gradient(1px 1px at 55% 78%, rgba(210,225,255,.8), transparent 60%)," +
  "radial-gradient(1.5px 1.5px at 68% 34%, rgba(255,255,255,.85), transparent 60%)," +
  "radial-gradient(1.1px 1.1px at 79% 70%, rgba(255,235,200,.7), transparent 60%)," +
  "radial-gradient(1.4px 1.4px at 88% 22%, rgba(255,255,255,.8), transparent 60%)," +
  "radial-gradient(1px 1px at 17% 84%, rgba(255,255,255,.6), transparent 60%)," +
  "radial-gradient(1.2px 1.2px at 33% 90%, rgba(210,225,255,.7), transparent 60%)," +
  "radial-gradient(1.3px 1.3px at 62% 12%, rgba(255,255,255,.75), transparent 60%)," +
  "radial-gradient(1px 1px at 73% 88%, rgba(255,240,210,.65), transparent 60%)," +
  "radial-gradient(1.5px 1.5px at 92% 56%, rgba(255,255,255,.8), transparent 60%)," +
  "radial-gradient(1.1px 1.1px at 8% 44%, rgba(210,225,255,.7), transparent 60%)," +
  "radial-gradient(1.2px 1.2px at 48% 48%, rgba(255,255,255,.5), transparent 60%)," +
  "radial-gradient(1px 1px at 84% 84%, rgba(255,255,255,.6), transparent 60%)," +
  "radial-gradient(1.3px 1.3px at 22% 36%, rgba(255,255,255,.7), transparent 60%)";

const ORBITS = [
  { w: "min(244px, 70vw)", h: "min(312px, 58vh)", dur: "30s", rev: false, color: "#ffe6a6" },
  { w: "min(300px, 84vw)", h: "min(372px, 70vh)", dur: "46s", rev: true, color: "#bcd4ff" },
  { w: "min(196px, 58vw)", h: "min(260px, 48vh)", dur: "22s", rev: false, color: "#ffffff" },
];

// Extra "cosmic bodies" that fade & scale in as Light grows: empty space at 0%,
// a rich 3D cosmos at 100%. Count shown scales with the light fraction.
const COSMIC = [
  { w: "min(264px, 76vw)", h: "min(330px, 62vh)", dur: "38s", rev: true, size: 10, color: "#9fd0ff", glow: "#5aa6ff" },
  { w: "min(212px, 62vw)", h: "min(286px, 52vh)", dur: "27s", rev: false, size: 8, color: "#ffd0a0", glow: "#ff9a4a" },
  { w: "min(322px, 90vw)", h: "min(392px, 72vh)", dur: "52s", rev: false, size: 13, color: "#d9b8ff", glow: "#9b6bff" },
  { w: "min(180px, 54vw)", h: "min(240px, 46vh)", dur: "19s", rev: true, size: 6, color: "#bafce0", glow: "#37d9a0" },
];

export default function EggHub({ lang, onClose }: { lang: Locale; onClose: () => void }) {
  const player = usePlayer() as any;
  const colorLevel: number = Math.max(0, Math.min(4, Number(player?.colorLevel ?? 0)));
  const txt: any = (TEXT as any)[lang] ?? (TEXT as any).ru;

  const [menuOpen, setMenuOpen] = useState(false);
  const [diving, setDiving] = useState<GateId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // DEV-only preview: override the player's real Light to see how the menu
  // transforms as Light rises. null = use the real player value.
  const [devLight, setDevLight] = useState<number | null>(null);
  const [tigelDive, setTigelDive] = useState(false);
  const [arriving] = useState(() => new URLSearchParams(window.location.search).has('direct'));

  const realFrac = colorLevel / 4;
  const lightFrac = devLight != null ? devLight / 100 : realFrac;
  const lightPct = Math.round(lightFrac * 100);
  const coloredCount = Math.round(lightFrac * 9);
  const cosmicCount = Math.round(lightFrac * COSMIC.length);

  const notify = useCallback((s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  const onEggClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((o) => !o);
  }, []);

  const onBackdrop = useCallback(() => {
    if (menuOpen) { setMenuOpen(false); return; }
    onClose();
  }, [menuOpen, onClose]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("awara:hub-open"));
    return () => window.dispatchEvent(new CustomEvent("awara:hub-close"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (diving) return;
      if (menuOpen) { setMenuOpen(false); return; }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, diving, menuOpen]);

  const enterGate = useCallback(
    (g: GateId) => {
      if (diving) return;
      setDiving(g);
      window.setTimeout(() => {
        if (g === "left") {
          // Open the Soul screen; the host unmounts the egg while soul is open
          // (do NOT call onClose here -- onClose is reserved for exiting the hub).
          try {
            window.dispatchEvent(new CustomEvent("awara:open-soul"));
          } catch (_) {
            /* ignore */
          }
          return;
        }
        const viewByGate: Record<GateId, string> = {
          up: "board",
          down: "daymon",
          right: "hronika",
          left: "soul",
        };
        try {
          window.dispatchEvent(new CustomEvent("awara:open-view", { detail: { view: viewByGate[g] } }));
        } catch (_) {
          /* ignore */
        }
        setDiving(null);
      }, 820);
    },
    [diving, onClose, notify, txt],
  );

  const gateClick = useCallback(
    (e: React.MouseEvent, g: GateId) => {
      e.stopPropagation();
      enterGate(g);
    },
    [enterGate],
  );

  // Tigel -- the "heart of all". For now it just shows a "soon" toast.
  const enterTigel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (tigelDive) return;
      setTigelDive(true);
      window.setTimeout(() => {
        window.location.href = "http://127.0.0.1:8787/tigel-app.html?direct=1";
      }, 300);
    },
    [tigelDive],
  );

  // Corner auxiliary zones. "menu" is the master toggle (shows/hides every
  // button); the others just toast "soon" for now.
  const cornerClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (id === "menu") { setMenuOpen((o) => !o); return; }
      const names: Record<string, string> = {
        level: txt.cornerLevel,
        chat: txt.cornerChat,
        games: txt.cornerGames,
      };
      notify((names[id] || "") + "  " + txt.soon);
    },
    [notify, txt],
  );

  const stageTransform = useMemo(() => {
    switch (diving) {
      case "up":
        return "translateY(64vh) scale(3)";
      case "down":
        return "translateY(-64vh) scale(3)";
      case "right":
        return "translateX(-64vw) scale(3)";
      case "left":
        return "translateX(64vw) scale(3)";
      default:
        return "translate(0,0) scale(1)";
    }
  }, [diving]);

  // ---------- styles ----------
  const root: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 9000,
    overflow: "hidden",
    background:
      "radial-gradient(120% 120% at 50% 42%, #211505 0%, #0a0a13 60%, #020207 100%)",
    // No root-level opacity fade: the opaque background must cover the screen
    // from frame 0, otherwise the previous (universe) frame flashes through
    // during the entry transition. Inner layers keep their own entrances.
    fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
    color: "#f0e3b8",
  };

  const starsStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    backgroundImage: STARFIELD,
    filter: "brightness(" + (1 + lightFrac * 1.1) + ") saturate(" + (1 + lightFrac * 0.6) + ")",
    transition: "filter 1s ease",
    animation: "egghubStars 6s ease-in-out infinite",
  };

  // A golden cosmic glow that swells with Light, brightening the whole lobby.
  const lightGlow: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle at 50% 46%, rgba(255,212,128," + (lightFrac * 0.3) + "), transparent 62%)",
    opacity: 0.35 + lightFrac * 0.65,
    transition: "opacity 1s ease, background 1s ease",
  };

  const vignette: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    background: "radial-gradient(120% 100% at 50% 45%, transparent 52%, rgba(2,2,7,0.65) 100%)",
  };

  const stage: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: stageTransform,
    opacity: diving ? 0 : 1,
    transition: "transform .82s cubic-bezier(.5,.02,.2,1), opacity .82s ease",
    zIndex: 2,
  };

  const rays: React.CSSProperties = {
    ...centerBox(RAYS, RAYS),
    zIndex: 0,
    background:
      "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,221,150,.06) 0deg 3deg, transparent 3deg 28deg)",
    WebkitMaskImage: "radial-gradient(closest-side, transparent 16%, #000 42%, transparent 88%)",
    maskImage: "radial-gradient(closest-side, transparent 16%, #000 42%, transparent 88%)",
    animation: "egghubSpin 90s linear infinite",
    opacity: 0.28 + lightFrac * 0.55,
    transition: "opacity 1s ease",
  };

  const aura: React.CSSProperties = {
    ...centerBox(AURA_W, AURA_H),
    zIndex: 0,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 50% 46%, rgba(255,205,110,.30), rgba(255,170,70,.10) 42%, transparent 70%)",
    filter: "blur(10px) brightness(" + (1 + lightFrac * 1.2) + ")",
    animation: "egghubAura 7s ease-in-out infinite",
  };

  const haloWrapA: React.CSSProperties = {
    ...centerBox(HALO1_W, HALO1_H),
    zIndex: 1,
    animation: "egghubRingIn 1s ease both",
    animationDelay: ".5s",
  };
  const haloA: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: EGG_SHAPE,
    background:
      "conic-gradient(from 0deg, transparent 0deg, rgba(255,228,150,0) 28deg, rgba(255,232,160,.62) 78deg, rgba(255,200,110,.12) 128deg, transparent 168deg, transparent 208deg, rgba(255,228,150,.48) 258deg, rgba(255,200,110,.06) 300deg, transparent 340deg)",
    WebkitMaskImage: RING_MASK_A,
    maskImage: RING_MASK_A,
    animation: "egghubSpin 26s linear infinite",
    filter: "blur(.4px) drop-shadow(0 0 8px rgba(255,205,110,.5))",
  };

  const haloWrapB: React.CSSProperties = {
    ...centerBox(HALO2_W, HALO2_H),
    zIndex: 1,
    animation: "egghubRingIn 1.05s ease both",
    animationDelay: ".66s",
  };
  const haloB: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: EGG_SHAPE,
    background:
      "conic-gradient(from 120deg, transparent 0deg, rgba(190,212,255,.0) 30deg, rgba(200,220,255,.4) 70deg, transparent 120deg, transparent 250deg, rgba(255,230,170,.32) 290deg, transparent 330deg)",
    WebkitMaskImage: RING_MASK_B,
    maskImage: RING_MASK_B,
    animation: "egghubSpinRev 40s linear infinite",
    filter: "blur(.3px)",
  };

  const orbitWrap = (w: string, h: string): React.CSSProperties => ({ ...centerBox(w, h), zIndex: 1 });
  const orbitInner = (dur: string, rev: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    animation: (rev ? "egghubSpinRev " : "egghubSpin ") + dur + " linear infinite",
  });
  const sparkle = (color: string): React.CSSProperties => ({
    position: "absolute",
    top: "1%",
    left: "50%",
    width: 5,
    height: 5,
    marginLeft: -2.5,
    borderRadius: "50%",
    background: color,
    boxShadow: "0 0 8px " + color + ", 0 0 16px " + color,
    animation: "egghubPulse 3.5s ease-in-out infinite",
  });

  // Cosmic body orb (planet/star) that appears as Light grows.
  const cosmicOrb = (size: number, color: string, glow: string, shown: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "0%",
    left: "50%",
    width: size,
    height: size,
    marginLeft: -size / 2,
    borderRadius: "50%",
    background: "radial-gradient(circle at 35% 30%, #fff, " + color + " 70%)",
    boxShadow: "0 0 10px " + glow + ", 0 0 22px " + glow,
    opacity: shown ? 0.92 : 0,
    transform: shown ? "scale(1)" : "scale(0.2)",
    transition: "opacity 1.1s ease, transform 1.1s ease",
  });

  const bloom: React.CSSProperties = {
    ...centerBox(BLOOM, BLOOM),
    zIndex: 3,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,250,232,.95) 0%, rgba(255,222,142,.45) 38%, transparent 70%)",
    filter: "blur(2px)",
    animation: "egghubBloom 1.5s ease-out both",
    animationDelay: ".12s",
  };

  const arena: React.CSSProperties = {
    position: "relative",
    width: EGG_W,
    height: EGG_H,
    zIndex: 2,
    animation: "egghubRise 1.3s cubic-bezier(.2,.7,.2,1) both",
    animationDelay: ".34s",
  };

  const eggBtn: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    zIndex: 2,
  };

  // 3D volume wrapper: flat at low Light, tilts & swells into a rounded orb as
  // Light rises (the 2D -> 3D feel the egg "levels up" into).
  const eggVolume: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: "perspective(900px) rotateX(" + (lightFrac * 7) + "deg) scale(" + (1 + lightFrac * 0.06) + ")",
    transformStyle: "preserve-3d",
    transition: "transform 1.1s ease",
  };

  const eggGlow = 0.35 + lightFrac * 0.65;
  const egg: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    borderRadius: EGG_SHAPE,
    background:
      "radial-gradient(58% 50% at 50% 38%, rgba(255,244,206," +
      (0.16 + lightFrac * 0.2) +
      ") 0%, rgba(150,118,52,0.14) 52%, rgba(28,24,15,0.16) 100%)",
    border: "1px solid rgba(232,205,128," + (0.5 + lightFrac * 0.4) + ")",
    boxShadow:
      "0 0 " +
      (44 + eggGlow * 90) +
      "px rgba(255,205,90," +
      (0.2 + lightFrac * 0.45) +
      "), inset 0 0 54px rgba(255,224,150," +
      (0.1 + lightFrac * 0.2) +
      ")",
    backdropFilter: "blur(2px)",
    animation: "egghubBreathe 6s ease-in-out infinite",
    pointerEvents: "none",
  };
  const eggShine: React.CSSProperties = {
    position: "absolute",
    inset: "-25%",
    background:
      "linear-gradient(115deg, rgba(255,248,222,0) 40%, rgba(255,248,222,.22) 50%, rgba(255,248,222,0) 60%)",
    backgroundSize: "240% 240%",
    animation: "egghubShimmer 8s ease-in-out infinite",
    pointerEvents: "none",
  };
  // Highlight (top-left) + shadow (bottom) that deepen with Light to fake volume.
  const eggDepth: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: EGG_SHAPE,
    background:
      "radial-gradient(46% 40% at 36% 28%, rgba(255,252,235," + (0.06 + lightFrac * 0.45) + ") 0%, transparent 56%)," +
      "radial-gradient(70% 56% at 62% 92%, rgba(0,0,0," + (0.08 + lightFrac * 0.4) + ") 0%, transparent 62%)",
    pointerEvents: "none",
    transition: "background 1s ease",
  };
  const column: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    display: "flex",
    flexDirection: "column-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    zIndex: 3,
    pointerEvents: "none",
  };
  const chakraDot = (c: string, lit: boolean): React.CSSProperties => ({
    width: 15,
    height: 15,
    borderRadius: "50%",
    background: lit
      ? "radial-gradient(circle at 35% 30%, #fff, " + c + " 70%)"
      : "radial-gradient(circle at 35% 30%, #8a8a93, " + GREY + " 75%)",
    opacity: lit ? 1 : 0.55,
    boxShadow: lit ? "0 0 10px " + c + ", 0 0 22px " + c : "none",
    animation: lit ? "egghubPulse 3s ease-in-out infinite" : "none",
    transition: "all .6s ease",
  });

  // Tigel -- the golden "heart of all" at the very centre of the egg. The 9
  // dimension dots stay; this glowing core sits above them, inviting a click.
  const tigelCore: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "min(30px, 9vw)",
    height: "min(30px, 9vw)",
    borderRadius: "50%",
    border: "1px solid rgba(255,238,176,0.92)",
    background: "radial-gradient(circle at 38% 32%, #fff7de 0%, #ffd96c 38%, #f0a92e 74%, #a86c18 100%)",
    cursor: "pointer",
    zIndex: 4,
    padding: 0,
    pointerEvents: "auto",
    animation: "egghubCore 2.6s ease-in-out infinite",
  };

  const gateWrap = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: 5,
    ...pos,
  });
  const gateBtn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    padding: 4,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "#f0e3b8",
    animation: "egghubGateIn .6s cubic-bezier(.2,.8,.2,1) both",
    font: "500 13px/1.15 'Cormorant Garamond', ui-serif, serif",
  };
  const gateRing: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(232,205,128,0.5)",
    background: "radial-gradient(circle, rgba(255,220,140,.16), transparent 70%)",
    boxShadow: "0 0 12px rgba(255,200,90,.3), inset 0 0 8px rgba(255,210,120,.15)",
    transition: "all .3s ease",
  };
  const gateGlyph: React.CSSProperties = { fontSize: 16, color: "#ffd98a", lineHeight: 1, textShadow: "0 0 8px rgba(255,200,90,.7)" };
  const gateLabel: React.CSSProperties = { letterSpacing: "0.1em", textShadow: "0 0 10px rgba(255,200,90,.35)" };
  const gateNote: React.CSSProperties = { fontSize: 9.5, letterSpacing: "0.06em", color: "rgba(240,227,184,0.5)" };
  const gateBtnFor = (i: number): React.CSSProperties => ({ ...gateBtn, animationDelay: i * 0.15 + "s" });

  // ---- Corner "auxiliary" zones ----
  // Visibly extra (cooler blue accent dot + lighter weight) yet in the golden
  // style. The Menu corner is "primary" (brighter gold badge) and toggles all.
  const cornerWrap = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    zIndex: 6,
    ...pos,
  });
  const cornerBtn = (primary: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "7px 13px 7px 9px",
    borderRadius: 999,
    cursor: "pointer",
    border: "1px solid rgba(232,205,128," + (primary ? 0.6 : 0.3) + ")",
    background: "linear-gradient(180deg, rgba(26,21,38,0.66), rgba(10,9,18,0.6))",
    color: "#ece0b6",
    backdropFilter: "blur(7px)",
    WebkitBackdropFilter: "blur(7px)",
    boxShadow: primary
      ? "0 0 18px rgba(255,200,90,0.3), inset 0 0 10px rgba(255,210,120,0.12)"
      : "0 0 12px rgba(0,0,0,0.35), inset 0 0 8px rgba(150,170,255,0.06)",
    font: "600 12px/1.1 'Cormorant Garamond', ui-serif, serif",
    transition: "all .3s ease",
    animation: "egghubGateIn .55s cubic-bezier(.2,.8,.2,1) both",
  });
  const cornerBadge = (primary: boolean): React.CSSProperties => ({
    position: "relative",
    width: 26,
    height: 26,
    flex: "0 0 auto",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: primary ? "#1a1206" : "#ffe6ad",
    background: primary
      ? "radial-gradient(circle at 38% 32%, #fff7de, #ffd96c 55%, #f0a92e 100%)"
      : "radial-gradient(circle at 38% 32%, rgba(255,236,180,0.18), rgba(120,140,220,0.12) 70%, transparent 100%)",
    border: "1px solid rgba(255,228,150," + (primary ? 0.9 : 0.4) + ")",
    boxShadow: primary ? "0 0 12px rgba(255,205,90,0.7)" : "0 0 8px rgba(150,170,255,0.25)",
  });
  const cornerText: React.CSSProperties = { display: "flex", flexDirection: "column", lineHeight: 1.05, textAlign: "left" };
  const cornerLabel: React.CSSProperties = { letterSpacing: "0.07em", textShadow: "0 0 8px rgba(255,200,90,.3)" };
  const cornerNote: React.CSSProperties = { fontSize: 8.5, letterSpacing: "0.05em", color: "rgba(230,222,190,0.5)" };
  // Tiny cool-blue dot that marks these as "additional" zones.
  const cornerDot: React.CSSProperties = {
    position: "absolute",
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "radial-gradient(circle, #cfe0ff, #6f8dff 70%)",
    boxShadow: "0 0 6px rgba(120,150,255,0.85)",
  };

  const toastStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    bottom: 64,
    transform: "translateX(-50%)",
    zIndex: 95,
    padding: "9px 16px",
    borderRadius: 999,
    border: "1px solid rgba(232,205,128,0.5)",
    background: "rgba(8,8,16,0.82)",
    color: "#f3e7bd",
    font: "600 13px/1 'Cormorant Garamond', ui-serif, serif",
    letterSpacing: "0.04em",
    boxShadow: "0 0 30px rgba(255,200,90,0.25)",
  };

  // DEV-only preview panel (bottom) -- drag to preview the menu at higher Light.
  const devBarStyle: React.CSSProperties = {
    position: "absolute",
    left: 14,
    bottom: 30,
    zIndex: 96,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderRadius: 14,
    border: "1px solid rgba(232,205,128,0.28)",
    background: "rgba(8,8,16,0.7)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    width: "min(228px, 62vw)",
    color: "#f0e3b8",
    font: "600 11px/1.2 'JetBrains Mono', ui-monospace, monospace",
    letterSpacing: "0.06em",
    boxShadow: "0 0 24px rgba(0,0,0,0.4)",
  };
  const devLabelRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", width: "100%", opacity: 0.9 };
  const devRange: React.CSSProperties = { width: "100%", accentColor: "#ffcf6e", cursor: "pointer" };
  const devStageStyle: React.CSSProperties = { fontSize: 10, opacity: 0.6, letterSpacing: "0.04em" };

  // Gates sit at screen-centre and translate outward responsively (clockwise order).
  const GATES: Array<{ id: GateId; label: string; note: string; glyph: string; pos: React.CSSProperties }> = [
    { id: "up", label: txt.gateUp, note: txt.gateUpNote, glyph: "\u2191", pos: { transform: "translate(-50%, calc(-50% - " + OFF_Y + "))" } },
    { id: "right", label: txt.gateRight, note: txt.gateRightNote, glyph: "\u2192", pos: { transform: "translate(calc(-50% + " + OFF_X + "), -50%)" } },
    { id: "down", label: txt.gateDown, note: txt.gateDownNote, glyph: "\u2193", pos: { transform: "translate(-50%, calc(-50% + " + OFF_Y + "))" } },
    { id: "left", label: txt.gateLeft, note: txt.gateLeftNote, glyph: "\u2190", pos: { transform: "translate(calc(-50% - " + OFF_X + "), -50%)" } },
  ];

  // Corner zones at the 4 screen corners. "menu" (top-right) is always shown and
  // toggles everything; the rest appear only while the menu is open. Glyphs:
  // diagonal corner arrows for the aux zones, a hamburger for the menu toggle.
  const CORNERS: Array<{ id: string; primary: boolean; label: string; note: string; glyph: string; pos: React.CSSProperties }> = [
    { id: "level", primary: false, label: txt.cornerLevel, note: txt.cornerLevelNote, glyph: "\u2196", pos: { left: 18, top: 18 } },
    { id: "menu", primary: true, label: txt.cornerMenu, note: txt.cornerMenuNote, glyph: "\u2261", pos: { right: 18, top: 18 } },
    { id: "chat", primary: false, label: txt.cornerChat, note: txt.cornerChatNote, glyph: "\u2198", pos: { right: 18, bottom: 24 } },
    { id: "games", primary: false, label: txt.cornerGames, note: txt.cornerGamesNote, glyph: "\u2199", pos: { left: 18, bottom: 124 } },
  ];

  return (
    <div style={root} onClick={onBackdrop}>
      <style>{KEYFRAMES}</style>
      <div style={starsStyle} aria-hidden="true" />
      <div style={lightGlow} aria-hidden="true" />

      <div style={stage}>
        <div style={rays} aria-hidden="true" />
        <div style={aura} aria-hidden="true" />
        <div style={haloWrapA} aria-hidden="true"><div style={haloA} /></div>
        <div style={haloWrapB} aria-hidden="true"><div style={haloB} /></div>
        {ORBITS.map((o, i) => (
          <div key={i} style={orbitWrap(o.w, o.h)} aria-hidden="true">
            <div style={orbitInner(o.dur, o.rev)}>
              <span style={sparkle(o.color)} />
            </div>
          </div>
        ))}
        {COSMIC.map((c, i) => (
          <div key={"c" + i} style={orbitWrap(c.w, c.h)} aria-hidden="true">
            <div style={orbitInner(c.dur, c.rev)}>
              <span style={cosmicOrb(c.size, c.color, c.glow, i < cosmicCount)} />
            </div>
          </div>
        ))}
        <div style={bloom} aria-hidden="true" />

        <div style={arena}>
          <div style={eggVolume}>
          <button type="button" style={eggBtn} onClick={onEggClick} aria-label="menu">
            <span style={egg} aria-hidden="true">
              <span style={eggShine} aria-hidden="true" />
              <span style={eggDepth} aria-hidden="true" />
            </span>
            <span style={column} aria-hidden="true">
              {CHAKRA_COLORS.map((c, i) => (
                <span key={i} style={chakraDot(c, i < coloredCount)} />
              ))}
            </span>
            <span
            style={tigelCore}
            role="button"
            title={txt.tigel}
            onClick={enterTigel}
            >
      <span style={{position:"absolute",inset:"-60%",borderRadius:"50%",border:"1px solid rgba(255,220,120,0.6)",pointerEvents:"none",animation:"egghubRipple 3s ease-out infinite"}} />
      <span style={{position:"absolute",inset:"-60%",borderRadius:"50%",border:"1px solid rgba(255,220,120,0.5)",pointerEvents:"none",animation:"egghubRipple 3s ease-out 1s infinite"}} />
      <span style={{position:"absolute",inset:"-60%",borderRadius:"50%",border:"1px solid rgba(255,220,120,0.4)",pointerEvents:"none",animation:"egghubRipple 3s ease-out 2s infinite"}} />
    </span>
          </button>
          </div>
        </div>

        {menuOpen &&
          GATES.map((g, i) => (
            <div key={g.id} style={gateWrap(g.pos)}>
              <button type="button" className="egghub-gate" style={gateBtnFor(i)} onClick={(e) => gateClick(e, g.id)}>
                <span className="egghub-ring" style={gateRing}>
                  <span style={gateGlyph}>{g.glyph}</span>
                </span>
                <span style={gateLabel}>{g.label}</span>
                <span style={gateNote}>{g.note}</span>
              </button>
            </div>
          ))}

        {CORNERS.filter((c) => c.primary || menuOpen).map((c) => (
          <div key={c.id} style={cornerWrap(c.pos)}>
            <button type="button" className="egghub-corner" style={cornerBtn(c.primary)} onClick={(e) => cornerClick(e, c.id)}>
              <span style={cornerBadge(c.primary)}>
                {c.glyph}
                <span style={cornerDot} aria-hidden="true" />
              </span>
              <span style={cornerText}>
                <span style={cornerLabel}>{c.label}</span>
                <span style={cornerNote}>{c.note}</span>
              </span>
            </button>
          </div>
        ))}
      </div>

      <div style={vignette} aria-hidden="true" />
      {tigelDive && (
        <div style={{position:"fixed",inset:0,zIndex:99999,pointerEvents:"none",background:"#05050a",animation:"egghubFadeOut .6s ease forwards"}} />
      )}
      {arriving && (
        <div style={{position:"fixed",inset:0,zIndex:99998,pointerEvents:"none",background:"#05050a",animation:"egghubArrival .6s ease .1s forwards"}} />
      )}
      {toast && <div style={toastStyle}>{toast}</div>}

      <div style={devBarStyle} onClick={(e) => e.stopPropagation()}>
        <div style={devLabelRow}>
          <span>{"\u2600 \u0421\u0432\u0435\u0442 (preview)"}</span>
          <span>{lightPct + "%"}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={devLight != null ? devLight : lightPct}
          onChange={(e) => setDevLight(Number(e.target.value))}
          style={devRange}
        />
        <div style={devStageStyle}>{"\u0441\u0442\u0443\u043f\u0435\u043d\u0435\u0439 \u0441\u0432\u0435\u0442\u0430: " + coloredCount + " / 9"}</div>
      </div>
    </div>
  );
}
