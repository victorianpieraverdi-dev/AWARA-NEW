import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import T from "./daimonText.json";
import CFdata from "../../data/cosmic_forces.json";
import LKdata from "../../data/quest-cultural-keys.json";
import LSdata from "../../data/lens_styles.json";
// Cosmos visualization: reuse the legacy vanilla-Canvas module as-is (it sets
// window.DaimonCosmos) plus the canonical 9-Mera table from the Ascent helper.
// Plain-JS imports from js/ follow the istok-main.tsx precedent (light-core.js).
// @ts-ignore -- no type declarations for the legacy js/ modules
import { MERA } from "../../js/daimonAscent.js";
// @ts-ignore -- side-effect import, sets window.DaimonCosmos
import "../../js/daimonCosmos.js";

// DaimonSpace: scene v1. Reads the same localStorage as Tigel.
// UI strings live in daimonText.json to keep this file ASCII-only.

const TX = T as any;
const CF = CFdata as any;
const LK = LKdata as any;
const STATE_KEY = "awara_v258_state";
const AXIS_KEY = "awara_form_axis";

type AnyObj = { [k: string]: any };

function readState(): AnyObj {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// signOf: natal body value -> sign name. Accepts sign name, degrees, or index.
function signOf(v: any): string {
  const signs = TX.signs as string[];
  if (v == null) return "";
  if (typeof v === "object") {
    if (v.sign) return signOf(v.sign);
    if (v.rashi) return signOf(v.rashi);
    if (typeof v.deg === "number") return signOf(v.deg);
    if (typeof v.lon === "number") return signOf(v.lon);
    return "";
  }
  if (typeof v === "string") {
    if (signs.indexOf(v) >= 0) return v;
    const num = parseFloat(v);
    if (!isFinite(num)) return "";
    v = num;
  }
  if (typeof v === "number") {
    let idx: number;
    if (v >= 0 && v < 12 && Math.floor(v) === v) {
      idx = v;
    } else {
      const deg = ((v % 360) + 360) % 360;
      idx = Math.floor(deg / 30);
    }
    return signs[((idx % 12) + 12) % 12] || "";
  }
  return "";
}

function elementOfSign(sign: string): string {
  const map = TX.signElement as AnyObj;
  return (sign && map[sign]) ? map[sign] : "";
}

function glyphOfElement(el: string): string {
  const map = TX.elementGlyph as AnyObj;
  return (el && map[el]) ? map[el] : "\u2728";
}

function classOfElement(el: string): string {
  const map = TX.elementClass as AnyObj;
  return (el && map[el]) ? map[el] : "ether";
}

function fill(tpl: string, vars: AnyObj): string {
  let s = tpl || "";
  Object.keys(vars).forEach(function (k) {
    const token = "{" + k + "}";
    s = s.split(token).join(String(vars[k] == null ? "" : vars[k]));
  });
  return s;
}

type ElStat = { cnt: AnyObj; dom: string; max: number; total: number };

function elementCounts(state: AnyObj): ElStat {
  const els = TX.elements as string[];
  const planets = TX.planets as string[];
  const cnt: AnyObj = {};
  els.forEach(function (e) { cnt[e] = 0; });
  let total = 0;
  const natal = state && state.natal;
  const bodies = natal && natal.bodies;
  if (bodies) {
    planets.forEach(function (p) {
      if (bodies[p] != null) {
        const e = elementOfSign(signOf(bodies[p]));
        if (cnt[e] != null) { cnt[e] += 1; total += 1; }
      }
    });
  }
  let dom = els[0];
  let max = -1;
  els.forEach(function (k) { if (cnt[k] > max) { max = cnt[k]; dom = k; } });
  return { cnt: cnt, dom: dom, max: max, total: total };
}

type Form = {
  axis: string;
  short: string;
  glyph: string;
  el: string;
  quote: string;
  tag: string;
};

function buildForms(state: AnyObj, stat: ElStat): Form[] {
  const forms = TX.forms as AnyObj;
  const archMap = TX.signArch as AnyObj;
  const planets = TX.planets as string[];
  const out: Form[] = [];
  const d = state && state.daimon;
  if (!d) return out;
  const name = d.name || "";
  const nak = d.nak || d.nakshatra || "";
  const dEl = d.el || d.element || "";

  out.push({
    axis: "moon",
    short: forms.moon.short,
    glyph: glyphOfElement(dEl),
    el: dEl,
    quote: fill(forms.moon.quote, { name: name, nak: nak, el: dEl }),
    tag: fill(forms.moon.tag, { name: name, nak: nak, el: dEl }),
  });

  const natal = state && state.natal;
  const bodies = natal && natal.bodies;
  if (bodies) {
    const lag = signOf(bodies[planets[0]]);
    const sun = signOf(bodies[planets[1]]);
    if (lag) {
      const lagEl = elementOfSign(lag);
      const arch = archMap[lag] || forms.lik.fallbackArch;
      out.push({
        axis: "lik",
        short: forms.lik.prefix + arch,
        glyph: glyphOfElement(lagEl),
        el: lagEl,
        quote: fill(forms.lik.quote, { arch: arch, sign: lag }),
        tag: fill(forms.lik.tag, { arch: arch, sign: lag, el: lagEl }),
      });
    }
    if (sun) {
      const sunEl = elementOfSign(sun);
      const arch = archMap[sun] || forms.sun.fallbackArch;
      out.push({
        axis: "sun",
        short: forms.sun.prefix + arch,
        glyph: glyphOfElement("\u0420\u0430\u0441\u0441\u0432\u0435\u0442"),
        el: sunEl,
        quote: fill(forms.sun.quote, { arch: arch, sign: sun }),
        tag: fill(forms.sun.tag, { arch: arch, sign: sun, el: sunEl }),
      });
    }
    if (stat.total > 0) {
      out.push({
        axis: "dom",
        short: forms.dom.prefix + stat.dom,
        glyph: glyphOfElement(stat.dom),
        el: stat.dom,
        quote: fill(forms.dom.quote, { dom: stat.dom }),
        tag: fill(forms.dom.tag, { dom: stat.dom, count: stat.max }),
      });
      if (lag) {
        const lagEl = elementOfSign(lag);
        const dosha = (TX.doshaByElement as AnyObj)[lagEl] || "";
        const dn = (TX.doshaName as AnyObj)[dosha] || dosha;
        if (dosha) {
          out.push({
            axis: "dosha",
            short: dn,
            glyph: glyphOfElement(lagEl),
            el: lagEl,
            quote: fill(forms.dosha.quote, { dosha: dosha }),
            tag: fill(forms.dosha.tag, { dosha: dosha }),
          });
        }
      }
    }
  }

  const seen: AnyObj = {};
  const res: Form[] = [];
  out.forEach(function (f) { if (!seen[f.short]) { seen[f.short] = 1; res.push(f); } });
  return res.slice(0, 5);
}

type Kingdom = { name: string; glyph: string; cls: string; desc: string; rep: string; nak: string; hybridOf: string };

// computeKingdom: element + nakshatra -> kingdom. Base kingdom from the
// dominant natal element; a tie between the top two elements yields a hybrid
// (Earth+Water is the special Plants stitch). The nakshatra deterministically
// picks the representative creature within the kingdom.
function computeKingdom(state: AnyObj, stat: ElStat): Kingdom | null {
  const K = TX.kingdoms as AnyObj;
  if (!K || !K.byElement || stat.total <= 0) return null;
  const els = TX.elements as string[];
  const cnt = stat.cnt;
  const sorted = els.slice().sort(function (a, b) { return (cnt[b] || 0) - (cnt[a] || 0); });
  const first = sorted[0];
  const second = sorted[1];
  const c1 = cnt[first] || 0;
  const c2 = cnt[second] || 0;
  if (c1 <= 0) return null;
  const tie = c2 > 0 && (c1 - c2) <= 1;
  let name = "";
  let hybridOf = "";
  if (tie) {
    const pp = (K.pairPlant as string[]) || [];
    if (pp.indexOf(first) >= 0 && pp.indexOf(second) >= 0) {
      name = K.plantName || K.hybridName;
    } else {
      name = K.hybridName;
      hybridOf = (K.byElement[first] || "") + " + " + (K.byElement[second] || "");
    }
  } else {
    name = K.byElement[first] || K.hybridName;
  }
  const info = (K.info && K.info[name]) || null;
  if (!info) return null;
  const d = state && state.daimon;
  const nak = d ? String(d.nak || d.nakshatra || "") : "";
  const reps = (info.reps as string[]) || [];
  let rep = "";
  if (reps.length) {
    const s = nak || first;
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    rep = reps[h % reps.length];
  }
  return { name: name, glyph: info.glyph || "", cls: info.cls || "ether", desc: info.desc || "", rep: rep, nak: nak, hybridOf: hybridOf };
}

// computeDeities: nakshatra devata + ruling graha + natal pantheon + day
// patrons, sourced from data/cosmic_forces.json so the Daimon page stays in
// sync with the Cosmos scene (nakshatras / nakshatraInfo / nakshatraLords /
// planetInfo are index-aligned tables there).
function computeDeities(state: AnyObj): AnyObj | null {
  const d = state && state.daimon;
  if (!d) return null;
  const nak = String(d.nak || d.nakshatra || "");
  const list = (CF.nakshatras as string[]) || [];
  const info = (CF.nakshatraInfo as AnyObj[]) || [];
  const lords = (CF.nakshatraLords as string[]) || [];
  const idx = list.indexOf(nak);
  let deity = "", symbol = "", meaning = "", lord = "";
  if (idx >= 0) {
    const ni = info[idx] || {};
    deity = ni.deity || ""; symbol = ni.symbol || ""; meaning = ni.meaning || "";
    lord = lords[idx] || "";
  }
  if (!lord) lord = String(d.lord || "");
  const roles: AnyObj = {};
  ((CF.planetInfo as AnyObj[]) || []).forEach(function (p) { roles[p.name] = p.role; });
  const bodies = state.natal && state.natal.bodies;
  const pantheon: AnyObj[] = [];
  if (bodies) { Object.keys(bodies).forEach(function (p) { if (roles[p]) pantheon.push({ name: p, role: roles[p] }); }); }
  const patrons: string[] = [];
  if (Array.isArray(state.intents)) { state.intents.forEach(function (it: AnyObj) { if (it && it.pat) patrons.push(String(it.pat)); }); }
  return { nak: nak, nakDeity: deity, nakSymbol: symbol, nakMeaning: meaning, nakLord: lord, lordRole: roles[lord] || "", pantheon: pantheon, patrons: patrons };
}

// computeFacets: every natal body is a facet ("gran") of the Daimon - its sign,
// element and gift. Codex-calculated calcFacets are surfaced when present.
function computeFacets(state: AnyObj): AnyObj {
  const glyphs = (TX.planetGlyph as AnyObj) || {};
  const roles: AnyObj = {};
  ((CF.planetInfo as AnyObj[]) || []).forEach(function (p) { roles[p.name] = p.role; });
  const lagna = (TX.planets as string[])[0];
  const bodies = state.natal && state.natal.bodies;
  const out: AnyObj[] = [];
  if (bodies) {
    Object.keys(bodies).forEach(function (p) {
      const sign = signOf(bodies[p]);
      if (!sign) return;
      const el = elementOfSign(sign);
      const role = roles[p] || (p === lagna ? (TX.lagnaRole || "") : "");
      out.push({ planet: p, glyph: glyphs[p] || "\u2726", sign: sign, el: el, elGlyph: glyphOfElement(el), cls: classOfElement(el), role: role });
    });
  }
  const calc = Array.isArray(state.calcFacets) ? state.calcFacets : [];
  return { planets: out, calc: calc };
}

// computeLenses: the traditions the Daimon sees through. Native lens from
// daimon.sig, opened lenses (xp/clarity) from state.lenses, daily lens quests
// from state.quests. Russian names map to data/quest-cultural-keys.json.
function computeLenses(state: AnyObj): AnyObj {
  const d = state && state.daimon;
  const native = d ? String(d.sig || "") : "";
  const cat: AnyObj = {};
  ((LK as AnyObj[]) || []).forEach(function (c) { if (c && c.name && c.name.ru) cat[c.name.ru] = c; });
  const ls = (state.lenses && typeof state.lenses === "object") ? state.lenses : {};
  const active: AnyObj[] = [];
  Object.keys(ls).forEach(function (nm) {
    const v = ls[nm] || {};
    const c = cat[nm] || null;
    active.push({ name: nm, symbol: c ? c.symbol : "", xp: Number(v.xp || 0), uses: Number(v.uses || 0), clarity: Number(v.clarity || 0) });
  });
  active.sort(function (a, b) { return b.xp - a.xp; });
  const day: AnyObj[] = [];
  const q = state.quests && Array.isArray(state.quests.items) ? state.quests.items : [];
  q.forEach(function (it: AnyObj) { if (it && it.lens) day.push({ name: it.lens, glyph: it.glyph || "", el: it.el || "" }); });
  let nativeSym = "";
  if (native) {
    if (cat[native]) nativeSym = cat[native].symbol;
    else { Object.keys(cat).forEach(function (k) { if (native.indexOf(k) >= 0) nativeSym = cat[k].symbol; }); }
  }
  return { native: native, nativeSym: nativeSym, active: active, day: day };
}

// cosmosLensSlug: RU lens name -> lens_styles.json slug, via the slug field of
// quest-cultural-keys.json (already imported as LK) plus the alias mirror
// above. Mirrors the priority of DaimonCosmos.detectLensSlug() -- today's
// chosen lens, then the most progressed, then the native one -- but computed
// from THIS page's lens data (computeLenses), because tigel_v1 localStorage
// may not exist on this origin.
// Returns "" when nothing matches (caller then lets detectLensSlug() decide).
function cosmosLensSlug(lenses: AnyObj): string {
  // TX.tigelLensSlug (daimonText.json): Tigel matrix names (MATKEYS in
  // tigel-app.html) that differ from the quest-cultural-keys.json catalog
  // names. READ-ONLY MIRROR of the canonical LENS_RU/LENS_SLUGS pairing in
  // js/daimonCosmos.js (RU2SLUG) -- that table is IIFE-internal and not
  // exported, and no data JSON carries this pairing. Keep in sync with
  // js/daimonCosmos.js if the lens set ever changes. Names that DO match the
  // catalog resolve through LK below, so the mirror only lists divergents.
  const byRu: AnyObj = Object.assign({}, TX.tigelLensSlug);
  ((LK as AnyObj[]) || []).forEach(function (c) {
    if (!(c && c.slug && c.name && c.name.ru)) return;
    // Catalog names can be combined ("X/Y"); index each part so the plain
    // Tigel matrix key ("X") still resolves.
    String(c.name.ru).split("/").forEach(function (part) {
      const p = part.trim();
      if (p) byRu[p] = c.slug;
    });
    byRu[c.name.ru] = c.slug;
  });
  const names: string[] = [];
  if (lenses.day.length) names.push(String(lenses.day[lenses.day.length - 1].name || ""));
  lenses.active.forEach(function (l: AnyObj) { names.push(String(l.name || "")); });
  if (lenses.native) names.push(String(lenses.native));
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    if (!n) continue;
    if (byRu[n]) return byRu[n];
    // The native sig may only embed the lens name as a substring --
    // substring match, same trick computeLenses uses for nativeSym.
    let hit = "";
    Object.keys(byRu).forEach(function (k) { if (n.indexOf(k) >= 0) hit = byRu[k]; });
    if (hit) return hit;
  }
  return "";
}

const KING = {
  row: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { minWidth: "54px", width: "54px", height: "54px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", border: "1px solid rgba(201,168,76,0.30)" },
  meta: { display: "flex", flexDirection: "column", gap: "3px" },
  name: { color: "#ffd700", fontSize: "18px", letterSpacing: "0.04em" },
  rep: { fontSize: "12px", color: "rgba(255,248,214,0.55)" },
  desc: { marginTop: "11px", fontSize: "13px", lineHeight: 1.5, color: "rgba(255,248,214,0.6)" }
} as AnyObj;

const EXT = {
  row: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  badge: { minWidth: "40px", width: "40px", height: "40px", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", border: "1px solid rgba(201,168,76,0.28)" },
  meta: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  name: { color: "#ffd700", fontSize: "15px", letterSpacing: "0.03em" },
  sub: { fontSize: "12px", color: "rgba(255,248,214,0.5)", lineHeight: 1.4 },
  chip: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "999px", border: "1px solid rgba(201,168,76,0.22)", background: "rgba(255,255,255,0.02)", color: "rgba(255,248,214,0.7)", fontSize: "12px" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "4px" },
  intro: { fontSize: "13px", lineHeight: 1.5, color: "rgba(255,248,214,0.55)", marginBottom: "12px" },
  section: { marginTop: "14px" },
  small: { fontSize: "10px", color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }
} as AnyObj;

function glyphBg(cls: string): string {
  switch (cls) {
    case "fire": return "radial-gradient(circle, rgba(255,110,40,0.22), rgba(14,8,32,0.65))";
    case "water": return "radial-gradient(circle, rgba(40,120,255,0.22), rgba(14,8,32,0.65))";
    case "earth": return "radial-gradient(circle, rgba(110,185,70,0.22), rgba(14,8,32,0.65))";
    case "air": return "radial-gradient(circle, rgba(200,220,255,0.22), rgba(14,8,32,0.65))";
    default: return "radial-gradient(circle, rgba(185,110,255,0.22), rgba(14,8,32,0.65))";
  }
}

// Avatar images are forged inside Tigel and saved to disk under
// avatars_generated/. Their metadata lives in the proxy queue, served at
// /api/forge-list with CORS. We fetch it cross-origin (5173 -> 8787) because
// localStorage is NOT shared between the two origins.
// Same-origin paths. On 5173 the Vite dev proxy forwards /api and
// /avatars_generated to the AI proxy (port 8787); on 8787 they are native.
// Avoids cross-origin / CORS / Private-Network-Access problems entirely.
const FORGE_LIST = "/api/forge-list";
// Cross-origin state bridge. Tigel (8787) publishes its Daimon/natal snapshot to
// /api/state; the app on 5173 reads it here (localStorage is per-origin).
const STATE_URL = "/api/state";

function avatarUrl(a: AnyObj): string {
  let p = String((a && (a.img || (a.id ? "avatars_generated/" + a.id + ".webp" : ""))) || "");
  if (!p) return "";
  if (/^https?:/.test(p)) return p;
  if (p.charAt(0) !== "/") p = "/" + p;
  return p;
}

function isAvatar(a: AnyObj): boolean {
  if (!a) return false;
  if (a.kind === "avatar") return true;
  return String(a.img || "").indexOf("avatars_generated/") === 0;
}

// Ordered list of image URLs to try for the active form. Priority: same axis and
// same Daimon name first, then same axis, then same name, then anything. Newest
// (by ts) wins within each tier. onError walks to the next candidate, so a
// missing file gracefully falls through to the next best image.
function avatarCandidates(list: AnyObj[], axis: string, name: string): string[] {
  const arr = (list || []).filter(isAvatar).slice();
  arr.sort(function (x, y) { return String(y.ts || "").localeCompare(String(x.ts || "")); });
  const nm = String(name || "");
  const nameHit = function (a: AnyObj) { return nm && String(a.title || "").indexOf(nm) >= 0; };
  const tiers: AnyObj[][] = [[], [], [], []];
  arr.forEach(function (a) {
    const ax = a.axis === axis;
    const nh = nameHit(a);
    if (ax && nh) tiers[0].push(a);
    else if (ax) tiers[1].push(a);
    else if (nh) tiers[2].push(a);
    else tiers[3].push(a);
  });
  const out: string[] = [];
  const seen: AnyObj = {};
  tiers.forEach(function (t) {
    t.forEach(function (a) {
      const u = avatarUrl(a);
      if (u && !seen[u]) { seen[u] = 1; out.push(u); }
    });
  });
  return out;
}

const S: { [k: string]: React.CSSProperties } = {
  outer: {
    position: "absolute", inset: 0, overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.28), transparent 45%), linear-gradient(180deg,#070318 0%,#0d0626 55%,#05021a 100%)",
    color: "rgba(255,248,214,0.85)",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  inner: { maxWidth: "480px", margin: "0 auto", padding: "54px 16px 96px" },
  title: { textAlign: "center", color: "#c9a84c", letterSpacing: "0.16em", fontSize: "22px", fontWeight: 600, fontFamily: "'Cinzel', serif" },
  subtitle: { textAlign: "center", color: "rgba(255,255,255,0.34)", letterSpacing: "0.2em", fontSize: "9px", marginTop: "6px", marginBottom: "20px", fontFamily: "'JetBrains Mono', monospace" },
  card: {
    border: "1px solid rgba(201,168,76,0.20)", borderRadius: "14px",
    padding: "16px", marginBottom: "14px", background: "rgba(14,8,32,0.34)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 22px rgba(0,0,0,0.32)",
  },
  label: { fontSize: "9px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.6)", marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace" },
  hero: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "8px 6px 4px" },
  glyph: {
    width: "118px", height: "118px", borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "52px",
    border: "2px solid rgba(201,168,76,0.30)",
    boxShadow: "0 0 34px rgba(124,58,237,0.25), inset 0 0 22px rgba(201,168,76,0.08)",
  },
  glyphImg: { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" },
  name: { color: "#ffd700", textShadow: "0 0 14px rgba(255,215,0,0.25)", fontSize: "26px", textAlign: "center", letterSpacing: "0.05em", fontFamily: "'Cinzel', serif" },
  arch: { color: "rgba(255,248,214,0.62)", fontStyle: "italic", fontSize: "15px", textAlign: "center" },
  quote: { color: "rgba(255,248,214,0.55)", fontSize: "14px", lineHeight: 1.5, textAlign: "center", maxWidth: "340px", marginTop: "2px", fontStyle: "italic" },
  modelRow: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "8px" },
  modelOn: { fontSize: "10px", padding: "5px 11px", borderRadius: "999px", border: "1px solid rgba(201,168,76,0.5)", color: "#ffd700", background: "rgba(201,168,76,0.12)", fontFamily: "'JetBrains Mono', monospace" },
  modelOff: { fontSize: "10px", padding: "5px 11px", borderRadius: "999px", border: "1px dashed rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" },
  formGrid: { display: "flex", flexWrap: "wrap", gap: "9px" },
  formChip: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 11px", borderRadius: "11px", border: "1px solid rgba(201,168,76,0.20)", background: "rgba(255,255,255,0.02)", color: "rgba(255,248,214,0.72)", fontSize: "13px", cursor: "pointer" },
  formChipOn: { border: "1px solid rgba(201,168,76,0.62)", background: "rgba(201,168,76,0.14)", color: "#ffd700" },
  formTag: { marginTop: "12px", fontSize: "13px", lineHeight: 1.5, color: "rgba(255,248,214,0.6)" },
  qRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  qKey: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
  qVal: { fontSize: "14px", color: "#ffd700" },
  bar: { height: "7px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden", marginTop: "6px" },
  barFill: { height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#c9a84c,#ffd700)" },
  soon: { fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.32)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px", padding: "2px 8px", fontFamily: "'JetBrains Mono', monospace" },
  soonHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  soonText: { fontSize: "14px", lineHeight: 1.55, color: "rgba(255,248,214,0.55)" },
  dimRow: { display: "flex", gap: "12px", alignItems: "flex-start", padding: "9px 0" },
  dimBadge: { minWidth: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontFamily: "'JetBrains Mono', monospace" },
  dimName: { fontSize: "14px", color: "rgba(255,248,214,0.82)" },
  dimDesc: { fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px", lineHeight: 1.4 },
};

function SoonCard(props: { title: string; text: string }) {
  return (
    <div style={S.card}>
      <div style={S.soonHead}>
        <div style={S.label}>{props.title}</div>
        <div style={S.soon}>{TX.soonTag}</div>
      </div>
      <div style={S.soonText}>{props.text}</div>
    </div>
  );
}

export function DaimonSpace() {
  const [state, setState] = useState<AnyObj>(function () { return readState(); });
  const [axis, setAxis] = useState<string>(function () {
    try { return localStorage.getItem(AXIS_KEY) || "moon"; } catch (e) { return "moon"; }
  });
  const [avatars, setAvatars] = useState<AnyObj[]>([]);
  const [remote, setRemote] = useState<AnyObj>({});
  const [imgIdx, setImgIdx] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(function () {
    let alive = true;
    function pull() {
      try {
        fetch(FORGE_LIST, { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (j) { if (alive && Array.isArray(j)) setAvatars(j); })
          .catch(function () {});
      } catch (e) {}
      try {
        fetch(STATE_URL, { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : {}; })
          .then(function (j) { if (alive && j && typeof j === "object" && !Array.isArray(j)) setRemote(j); })
          .catch(function () {});
      } catch (e) {}
    }
    function refresh() { setState(readState()); pull(); }
    pull();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", refresh);
    return function () {
      alive = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Merge remote (Tigel-published) state UNDER local. Local wins where present;
  // remote fills Daimon/natal when THIS origin's localStorage has none yet
  // (8787 and 5173 do NOT share localStorage). See the /api/state bridge.
  const mstate = useMemo(function () { return Object.assign({}, remote, state); }, [remote, state]);
  const stat = useMemo(function () { return elementCounts(mstate); }, [mstate]);
  const forms = useMemo(function () { return buildForms(mstate, stat); }, [mstate, stat]);

  function pickAxis(a: string) {
    setTouched(true);
    setAxis(a);
    try { localStorage.setItem(AXIS_KEY, a); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("awara:form-axis", { detail: { axis: a } })); } catch (e) {}
  }

  // Effective axis: follow the form/avatar active in Tigel (remote.axis) until
  // the user manually picks a form here. Keeps the hero in sync with Tigel.
  const remoteAxis = (remote && typeof remote.axis === "string") ? remote.axis : "";
  const effAxis = touched ? axis : (remoteAxis || axis);
  let active: Form | null = null;
  for (let i = 0; i < forms.length; i++) { if (forms[i].axis === effAxis) { active = forms[i]; break; } }
  if (!active && forms.length > 0) active = forms[0];
  // Newest forged avatar from Tigel (source of truth across origins). Drives
  // the hero even when THIS origin's localStorage has no Daimon yet (Tigel on
  // 8787 and the app on 5173 do NOT share localStorage).
  const forge = useMemo(function () {
    const arr = (avatars || []).filter(isAvatar).slice();
    arr.sort(function (x, y) { return String(y.ts || "").localeCompare(String(x.ts || "")); });
    return arr[0] || null;
  }, [avatars]);
  const forgeName = forge ? String(forge.title || "").split("\u00b7")[0].trim() : "";
  const dName = (mstate.daimon && mstate.daimon.name) || forgeName || "";

  const activeAxis = active ? active.axis : effAxis;
  const sources = useMemo(function () {
    const merged = (avatars || []).concat(Array.isArray(mstate.avatars) ? mstate.avatars : []);
    return avatarCandidates(merged, activeAxis, dName);
  }, [avatars, mstate, activeAxis, dName]);
  useEffect(function () { setImgIdx(0); }, [sources.join("|")]);
  const heroImg = sources[imgIdx] || "";
  const showImg = !!heroImg;

  const heroName = (mstate.daimon && mstate.daimon.name) || forgeName || TX.title;
  const heroEl = active ? active.el : ((forge && forge.el) || "");
  const hasHero = (forms.length > 0 && active != null) || showImg;
  const hasDaimon = hasHero;
  const dosha = (TX.doshaByElement as AnyObj)[stat.dom] || "";
  const doshaN = (TX.doshaName as AnyObj)[dosha] || dosha;
  const guna = (TX.gunaByElement as AnyObj)[stat.dom] || "";
  const accentPct = stat.total > 0 ? Math.max(8, Math.round((stat.max / 8) * 100)) : 0;
  const kingdom = useMemo(function () { return computeKingdom(mstate, stat); }, [mstate, stat]);
  const deities = useMemo(function () { return computeDeities(mstate); }, [mstate]);
  const facets = useMemo(function () { return computeFacets(mstate); }, [mstate]);
  const lenses = useMemo(function () { return computeLenses(mstate); }, [mstate]);

  // --- Cosmos of the Daimon (9 Mera rings + 3 Granthi gates + birth core) ---
  // Progression source: mstate.daimon.chakra (Mera 1..9) and
  // mstate.daimon.granthiPierced -- the exact fields js/daimonAscent.js
  // documents as canonical Daimon ascent state, read from the same
  // awara_v258_state (plus the Tigel /api/state bridge) this page already uses.
  const cosmosDaimon = useMemo(function () {
    const d = mstate.daimon;
    if (!d) return null;
    // Normalize this page's short keys (nak/el) to the field names
    // js/daimonCosmos.js expects (nakshatra/element). Read-only mapping.
    return {
      name: d.name || "",
      nakshatraName: d.nakshatraName || "",
      nakshatra: d.nak || d.nakshatra || "",
      element: d.el || d.element || "",
      chakra: d.chakra,
      dnaStrands: d.dnaStrands,
      form: d.form,
      granthiPierced: (d.granthiPierced && typeof d.granthiPierced === "object") ? d.granthiPierced : {},
    };
  }, [mstate]);
  const cosmosSlug = useMemo(function () { return cosmosLensSlug(lenses); }, [lenses]);
  const kingdomGlyph = kingdom ? kingdom.glyph : "";
  // Stable signature so the canvas only remounts when its inputs actually
  // change (mstate is re-read on every window focus / visibility change).
  const cosmosSig = useMemo(function () {
    return JSON.stringify([cosmosDaimon, cosmosSlug, kingdomGlyph]);
  }, [cosmosDaimon, cosmosSlug, kingdomGlyph]);
  const cosmosRef = useRef<HTMLDivElement | null>(null);
  useEffect(function () {
    const host = cosmosRef.current;
    const w = window as any;
    const DC = w.DaimonCosmos;
    if (!host || !DC || !cosmosDaimon) return;
    // daimonCosmos skins itself from window.lensStyleFor (awara-lens-styles.js)
    // or its documented fallback window.LENS_STYLE. That loader script is not
    // part of the Vite app, so fill the fallback slot with the same JSON it
    // would fetch (data/lens_styles.json).
    if (!w.LENS_STYLE) w.LENS_STYLE = LSdata;
    const inst = DC.mount(host, cosmosDaimon, {
      mera: MERA, // canonical 9-Mera colors from js/daimonAscent.js
      granthi: cosmosDaimon.granthiPierced,
      lensSlug: cosmosSlug || undefined, // "" -> let DC.detectLensSlug() decide
    });
    // Central glyph: reuse the richer Kingdom computation (element+nakshatra ->
    // representative creature) instead of the legacy FORM_GLYPHS[d.form]
    // lookup, without modifying js/daimonCosmos.js: tweak the mounted model,
    // then repaint once so the prefers-reduced-motion static frame shows it too.
    if (inst && inst.model && kingdomGlyph) {
      inst.model.glyph = kingdomGlyph;
      try { inst.onResize(); } catch (e) {}
    }
    return function () { try { DC.destroy(); } catch (e) {} };
  }, [cosmosSig]);

  return (
    <div style={S.outer}>
      <div style={S.inner}>
        <div style={S.title}>{TX.title}</div>
        <div style={S.subtitle}>{TX.subtitle}</div>

        {hasHero ? (
          <div style={S.card}>
            <div style={S.hero}>
              <div style={Object.assign({}, S.glyph, { background: glyphBg(classOfElement(heroEl)) })}>
                {showImg
                  ? <img key={heroImg} src={heroImg} alt="" style={S.glyphImg} onError={function () { setImgIdx(function (n) { return n + 1; }); }} />
                  : (active ? active.glyph : glyphOfElement(heroEl))}
              </div>
              <div style={S.name}>{heroName}</div>
              {active ? <div style={S.arch}>{active.short}</div> : null}
              {active ? <div style={S.quote}>{active.quote}</div> : null}
              <div style={S.modelRow}>
                <span style={S.modelOn}>{TX.model2d}</span>
                <span style={S.modelOff}>{TX.model3d}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={S.card}>
            <div style={Object.assign({}, S.label, { marginBottom: "8px" })}>{TX.noDaimonTitle}</div>
            <div style={S.soonText}>{TX.noDaimon}</div>
          </div>
        )}

        {forms.length > 0 ? (
          <div style={S.card}>
            <div style={S.label}>{TX.formsTitle}</div>
            <div style={S.formGrid}>
              {forms.map(function (f) {
                const on = active != null && f.axis === active.axis;
                return (
                  <div
                    key={f.axis}
                    onClick={function () { pickAxis(f.axis); }}
                    style={Object.assign({}, S.formChip, on ? S.formChipOn : null)}
                  >
                    <span>{f.glyph}</span>
                    <span>{f.short}</span>
                  </div>
                );
              })}
            </div>
            {active ? <div style={S.formTag}>{active.tag}</div> : null}
          </div>
        ) : null}

        {stat.total > 0 ? (
          <div style={S.card}>
            <div style={S.label}>{TX.qualTitle}</div>
            <div style={S.qRow}>
              <span style={S.qKey}>{TX.elementAccent}</span>
              <span style={S.qVal}>{glyphOfElement(stat.dom) + " " + stat.dom + " " + stat.max + "/8"}</span>
            </div>
            <div style={S.bar}><div style={Object.assign({}, S.barFill, { width: accentPct + "%" })} /></div>
            {doshaN ? (
              <div style={S.qRow}>
                <span style={S.qKey}>{TX.doshaLabel}</span>
                <span style={S.qVal}>{doshaN}</span>
              </div>
            ) : null}
            {guna ? (
              <div style={Object.assign({}, S.qRow, { borderBottom: "none" })}>
                <span style={S.qKey}>{TX.gunaLabel}</span>
                <span style={S.qVal}>{guna}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {kingdom ? (
          <div style={S.card}>
            <div style={S.label}>{TX.kingdomTitle}</div>
            <div style={KING.row}>
              <div style={Object.assign({}, KING.badge, { background: glyphBg(kingdom.cls) })}>{kingdom.glyph}</div>
              <div style={KING.meta}>
                <div style={KING.name}>{kingdom.name}</div>
                {kingdom.rep ? <div style={KING.rep}>{TX.kingdomRepLabel + " " + kingdom.rep}</div> : null}
                {kingdom.hybridOf ? <div style={KING.rep}>{TX.kingdomHybridLabel + " " + kingdom.hybridOf}</div> : null}
              </div>
            </div>
            <div style={KING.desc}>{kingdom.desc}</div>
          </div>
        ) : (
          <SoonCard title={TX.kingdomTitle} text={TX.kingdomSoon} />
        )}

        {cosmosDaimon ? (
          <div style={S.card}>
            <div style={S.label}>{TX.cosmosTitle}</div>
            <div style={EXT.intro}>{TX.cosmosIntro}</div>
            <div ref={cosmosRef} />
          </div>
        ) : (
          <SoonCard title={TX.cosmosTitle} text={TX.cosmosSoon} />
        )}

        {deities && (deities.nakDeity || deities.pantheon.length) ? (
          <div style={S.card}>
            <div style={S.label}>{TX.deitiesTitle}</div>
            <div style={EXT.intro}>{TX.deitiesIntro}</div>
            {deities.nakDeity ? (
              <div style={EXT.row}>
                <div style={Object.assign({}, EXT.badge, { background: glyphBg("ether") })}>{"\u2734"}</div>
                <div style={EXT.meta}>
                  <div style={EXT.name}>{deities.nakDeity}</div>
                  <div style={EXT.sub}>{TX.deitiesNakLabel + ": " + deities.nak + (deities.nakMeaning ? " \u00b7 " + deities.nakMeaning : "")}</div>
                </div>
              </div>
            ) : null}
            {deities.nakLord ? (
              <div style={EXT.row}>
                <div style={Object.assign({}, EXT.badge, { background: glyphBg("fire") })}>{(TX.planetGlyph as AnyObj)[deities.nakLord] || "\u2609"}</div>
                <div style={EXT.meta}>
                  <div style={EXT.name}>{deities.nakLord}</div>
                  <div style={EXT.sub}>{TX.deitiesLordLabel + (deities.lordRole ? " \u00b7 " + deities.lordRole : "")}</div>
                </div>
              </div>
            ) : null}
            {deities.patrons.length ? (
              <div style={EXT.section}>
                <div style={Object.assign({}, S.label, { marginBottom: "7px" })}>{TX.deitiesPatronsLabel}</div>
                <div style={EXT.chipRow}>
                  {deities.patrons.map(function (p: string, i: number) { return <span key={i} style={EXT.chip}>{p}</span>; })}
                </div>
              </div>
            ) : null}
            {deities.pantheon.length ? (
              <div style={EXT.section}>
                <div style={Object.assign({}, S.label, { marginBottom: "7px" })}>{TX.deitiesPantheonLabel}</div>
                <div style={EXT.chipRow}>
                  {deities.pantheon.map(function (p: AnyObj, i: number) { return <span key={i} style={EXT.chip}>{(((TX.planetGlyph as AnyObj)[p.name] || "") + " " + p.name).trim()}</span>; })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <SoonCard title={TX.deitiesTitle} text={TX.deitiesSoon} />
        )}

        {facets && facets.planets.length ? (
          <div style={S.card}>
            <div style={S.label}>{TX.facetsTitle}</div>
            <div style={EXT.intro}>{TX.facetsIntro}</div>
            {facets.planets.map(function (f: AnyObj, i: number) {
              return (
                <div key={i} style={EXT.row}>
                  <div style={Object.assign({}, EXT.badge, { background: glyphBg(f.cls) })}>{f.glyph}</div>
                  <div style={EXT.meta}>
                    <div style={EXT.name}>{f.planet + "  " + f.elGlyph + " " + f.sign}</div>
                    {f.role ? <div style={EXT.sub}>{f.role}</div> : null}
                  </div>
                </div>
              );
            })}
            {facets.calc.length ? (
              <div style={EXT.section}>
                <div style={Object.assign({}, S.label, { marginBottom: "7px" })}>{TX.facetsCalcLabel}</div>
                <div style={EXT.chipRow}>
                  {facets.calc.map(function (c: AnyObj, i: number) {
                    const lbl = (typeof c === "string") ? c : String((c && (c.name || c.title || c.label)) || "");
                    return <span key={i} style={EXT.chip}>{lbl}</span>;
                  })}
                </div>
              </div>
            ) : (
              <div style={Object.assign({}, EXT.small, EXT.section)}>{TX.facetsCalcSoon}</div>
            )}
          </div>
        ) : null}

        {lenses && (lenses.native || lenses.active.length || lenses.day.length) ? (
          <div style={S.card}>
            <div style={S.label}>{TX.lensesTitle}</div>
            <div style={EXT.intro}>{TX.lensesIntro}</div>
            {lenses.native ? (
              <div style={EXT.row}>
                <div style={Object.assign({}, EXT.badge, { background: glyphBg("ether") })}>{lenses.nativeSym || "\u25c9"}</div>
                <div style={EXT.meta}>
                  <div style={EXT.name}>{lenses.native}</div>
                  <div style={EXT.sub}>{TX.lensNativeLabel}</div>
                </div>
              </div>
            ) : null}
            {lenses.active.length ? (
              <div style={EXT.section}>
                <div style={Object.assign({}, S.label, { marginBottom: "7px" })}>{TX.lensActiveLabel}</div>
                {lenses.active.map(function (l: AnyObj, i: number) {
                  const pct = Math.max(6, Math.min(100, Math.round(l.xp)));
                  return (
                    <div key={i} style={Object.assign({}, EXT.row, { borderBottom: "none", paddingBottom: "2px" })}>
                      <div style={Object.assign({}, EXT.badge, { background: glyphBg("ether"), fontSize: "16px" })}>{l.symbol || "\u25c9"}</div>
                      <div style={EXT.meta}>
                        <div style={EXT.name}>{l.name}</div>
                        <div style={S.bar}><div style={Object.assign({}, S.barFill, { width: pct + "%" })} /></div>
                        <div style={EXT.small}>{TX.lensXp + " " + l.xp + " \u00b7 " + TX.lensClarity + " " + l.clarity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={Object.assign({}, EXT.small, EXT.section)}>{TX.lensEmpty}</div>
            )}
            {lenses.day.length ? (
              <div style={EXT.section}>
                <div style={Object.assign({}, S.label, { marginBottom: "7px" })}>{TX.lensDayLabel}</div>
                <div style={EXT.chipRow}>
                  {lenses.day.map(function (q: AnyObj, i: number) { return <span key={i} style={EXT.chip}>{((q.glyph ? q.glyph + " " : "") + q.name)}</span>; })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={S.card}>
          <div style={S.label}>{TX.dimTitle}</div>
          <div style={Object.assign({}, S.soonText, { marginBottom: "6px" })}>{TX.dimIntro}</div>
          {(TX.dimLevels as AnyObj[]).map(function (lv, i) {
            const cur = !!lv.current;
            const badge = Object.assign({}, S.dimBadge, cur
              ? { background: "rgba(201,168,76,0.16)", color: "#ffd700", border: "1px solid rgba(201,168,76,0.5)" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" });
            return (
              <div key={i} style={S.dimRow}>
                <div style={badge}>{lv.m}</div>
                <div>
                  <div style={Object.assign({}, S.dimName, cur ? { color: "#ffd700" } : null)}>{lv.name}</div>
                  <div style={S.dimDesc}>{lv.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <SoonCard title={TX.universeTitle} text={TX.universeSoon} />
        <SoonCard title={TX.questsTitle} text={TX.questsSoon} />
      </div>
    </div>
  );
}

export default DaimonSpace;
