// AWARA - Native Soul screen (living cosmos of 5 spheres, no iframe).
// Mechanics ported from spheres-v2: subspheres, journal, plans, media, social, style.
// Directional navigation (arrows + swipe + arrow keys):
//   up    -> player cosmos (awara:open-cosmos)
//   down  -> location / soul energy structure (toast: soon)
//   left  -> star temple by Vastu (toast: soon)
//   right -> back to the Egg hub (awara:soul-close)
// All user-facing strings live in soulText.json. Comments are ASCII; symbols use \uXXXX.

import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SOUL_CANON, type JournalEntryType, type MediaKind, type SoulSphereId } from "./soulModel"
import { useSoulState } from "./useSoulState"
import txt from "./soulText.json"
import { loadMatrixState, saveMatrixState, activeMatrix, matrixName, matrixCardPool, MATRICES } from "./matrices"

// ---- module constants ----
const ALL_IDS: SoulSphereId[] = ["soul", "osnova", "serdce", "razum", "svyazi"]
const ORBIT_IDS: SoulSphereId[] = ["osnova", "serdce", "razum", "svyazi"]
const ORBIT_BASE_DEG = [-90, 0, 90, 180]
const JOURNAL_TYPES: JournalEntryType[] = ["insight", "observation", "feeling", "dream", "question"]
const PANEL_TABS = ["subs", "journal", "plans", "media", "social", "style"] as const
type PanelTab = (typeof PANEL_TABS)[number]

const TAB_GLYPH: Record<PanelTab, string> = {
  subs: "\u25C8",
  journal: "\u270E",
  plans: "\u2714",
  media: "\u25A3",
  social: "\u21C4",
  style: "\u2726",
}

const NAV_DIRS = [
  { dir: "up" as const, glyph: "\u2191", label: txt.nav.up },
  { dir: "down" as const, glyph: "\u2193", label: txt.nav.down },
  { dir: "left" as const, glyph: "\u2190", label: txt.nav.left },
  { dir: "right" as const, glyph: "\u2192", label: txt.nav.right },
]
type NavDir = "up" | "down" | "left" | "right"

const TAB_TXT = txt.tabs as Record<string, string>
const JT_TXT = txt.journal.types as Record<string, string>
const MEDIA_TXT = txt.media as Record<string, string>

type Star = { x: number; y: number; z: number; r: number; b: number; sp: number; ph: number }

// ---- helpers ----
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

function sphereLive(light: number, subs: number, journ: number, plans: number, media: number, social: number): number {
  const activity = Math.min(1, subs * 0.18 + journ * 0.1 + plans * 0.1 + media * 0.12 + social * 0.1)
  return clamp01(0.12 + (light || 0) * 0.6 + activity * 0.5)
}

function dispColorOf(id: SoulSphereId, color?: string): string {
  if (color && color.length > 0) return color
  return SOUL_CANON[id].color
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise(function (resolve, reject) {
    const fr = new FileReader()
    fr.onload = function () { resolve(String(fr.result || "")) }
    fr.onerror = function () { reject(fr.error) }
    fr.readAsDataURL(file)
  })
}

function makeStars(n: number): Star[] {
  const out: Star[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
      r: Math.random() < 0.85 ? 1 : 2,
      b: 0.3 + Math.random() * 0.7,
      sp: 0.6 + Math.random() * 2.2,
      ph: Math.random() * Math.PI * 2,
    })
  }
  return out
}

function drawCosmos(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, overall: number, stars: Star[], yaw: number, pitch: number, zoom: number): void {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = "#05040a"
  ctx.fillRect(0, 0, w, h)
  const cx0 = w / 2
  const cy0 = h / 2
  const blobs = [
    [0.3, 0.34, "160,90,220"],
    [0.72, 0.4, "255,120,70"],
    [0.46, 0.72, "80,150,240"],
    [0.66, 0.66, "230,70,160"],
  ]
  ctx.globalCompositeOperation = "lighter"
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i]
    const px = (b[0] as number) - 0.5 - Math.sin(yaw) * 0.12
    const py = (b[1] as number) - 0.5 - pitch * 0.06
    const cx = cx0 + px * w + Math.sin(t * 0.1 + i) * (w * 0.03)
    const cy = cy0 + py * h + Math.cos(t * 0.12 + i) * (h * 0.03)
    const rad = Math.min(w, h) * 0.46 * zoom
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
    const a = 0.08 + overall * 0.2
    g.addColorStop(0, "rgba(" + b[2] + "," + a + ")")
    g.addColorStop(1, "rgba(" + b[2] + ",0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  const cosY = Math.cos(yaw)
  const sinY = Math.sin(yaw)
  const cosX = Math.cos(pitch)
  const sinX = Math.sin(pitch)
  const spread = Math.min(w, h) * 0.62 * zoom
  const focal = 2.2
  for (let s = 0; s < stars.length; s++) {
    const st = stars[s]
    const x1 = st.x * cosY - st.z * sinY
    const z1 = st.x * sinY + st.z * cosY
    const y1 = st.y * cosX - z1 * sinX
    const z2 = st.y * sinX + z1 * cosX
    const depth = focal / (focal + z2)
    if (depth <= 0) continue
    const sx = cx0 + x1 * spread * depth
    const sy = cy0 + y1 * spread * depth
    if (sx < 0 || sx > w || sy < 0 || sy > h) continue
    const tw = 0.5 + 0.5 * Math.sin(t * st.sp + st.ph)
    const sz = Math.max(0.5, st.r * depth * 0.6)
    ctx.fillStyle = "rgba(255,255,255," + clamp01(st.b * tw * (0.35 + overall * 0.65) * depth) + ")"
    ctx.fillRect(sx, sy, sz, sz)
  }
  ctx.globalCompositeOperation = "source-over"
}

// Nine chakra colors (root -> crown -> above), mirrors the egg hub palette.
const CHAKRA_COLORS = ["#e23b3b", "#ff7a18", "#ffd400", "#3ddc84", "#4fc3f7", "#3b5bdb", "#7b48c8", "#c06cf0", "#f3e8ff"]

// RGB triplets for the chakra palette, used by the light-particle field.
const CHAKRA_RGB = ["226,59,59", "255,122,24", "255,212,0", "61,220,132", "79,195,247", "59,91,219", "123,72,200", "192,108,240", "243,232,255"]

// Nine dimension names, sourced from the text pack (root -> source).
const CHAKRA_NAMES = txt.chakras as string[]

// Luminous tints for the Spirits (Dukh), so each shines in its OWN colour of
// light instead of plain white. Picked by a per-Spirit hash for stable variety.
const SPIRIT_TINTS = ["255,236,170", "180,222,255", "200,255,214", "255,196,220", "216,196,255", "255,214,176", "188,246,240", "240,255,196", "208,224,255", "255,206,236", "198,238,255", "234,236,255"]

// Stable key for a link between two spheres (order-independent).
function linkKey(a: SoulSphereId, b: SoulSphereId): string {
  return [a, b].sort().join("|")
}

// Draw glowing lines between linked spheres onto the cosmos canvas. A link only
// starts after EVERY sphere is mostly born, then it grows out from sphere a
// toward b over ~1.1s with a bright spark riding the growing tip - so on entry
// the spheres appear first and the saved links sprout from them like magic.
// `born` carries each sphere's birth fraction; `seen` remembers when a link
// first became eligible so its growth can ease in (resets each mount).
function drawLinks(ctx: CanvasRenderingContext2D, sp: Record<string, { x: number; y: number }>, links: string[], t: number, born: Record<string, { born: number }>, seen: Record<string, number>, lvl: number, growth: number): void {
  if (!links || links.length === 0) return
  // Global readiness gate: hold every link until the whole constellation of
  // spheres has emerged, so structure never precedes the spheres themselves.
  let ready = 1
  for (let z = 0; z < ALL_IDS.length; z++) {
    const bz = born && born[ALL_IDS[z]] ? born[ALL_IDS[z]].born : 1
    if (bz < ready) ready = bz
  }
  if (ready < 0.6) return
  // Bead flow along the links is slow by default and quickens only with the
  // soul's measure (mera) and its light, so the current grows as the being does.
  const flow = 0.05 + 0.022 * Math.max(0, lvl - 1) + 0.12 * clamp01(growth)
  ctx.save()
  ctx.globalCompositeOperation = "lighter"
  for (let i = 0; i < links.length; i++) {
    const parts = links[i].split("|")
    const a = parts[0] as SoulSphereId
    const b = parts[1] as SoulSphereId
    const pa = sp[a]
    const pb = sp[b]
    if (!pa || !pb) continue
    if (seen[links[i]] === undefined) seen[links[i]] = t
    const gp = clamp01((t - seen[links[i]]) / 1.1)
    const grow = gp * gp * (3 - 2 * gp)
    if (grow <= 0.002) continue
    const ex = pa.x + (pb.x - pa.x) * grow
    const ey = pa.y + (pb.y - pa.y) * grow
    const ca = SOUL_CANON[a] ? SOUL_CANON[a].rgb : [200, 200, 200]
    const cb = SOUL_CANON[b] ? SOUL_CANON[b].rgb : [200, 200, 200]
    const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y)
    grad.addColorStop(0, "rgba(" + ca[0] + "," + ca[1] + "," + ca[2] + ",0.45)")
    grad.addColorStop(1, "rgba(" + cb[0] + "," + cb[1] + "," + cb[2] + ",0.45)")
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(pa.x, pa.y)
    ctx.lineTo(ex, ey)
    ctx.stroke()
    // Bright spark on the advancing tip, fading as the link finishes growing.
    const tipR = 6 + 4 * (1 - grow)
    const tg = ctx.createRadialGradient(ex, ey, 0, ex, ey, tipR)
    tg.addColorStop(0, "rgba(255,250,235," + (0.6 + 0.35 * (1 - grow)).toFixed(3) + ")")
    tg.addColorStop(1, "rgba(255,250,235,0)")
    ctx.fillStyle = tg
    ctx.beginPath()
    ctx.arc(ex, ey, tipR, 0, Math.PI * 2)
    ctx.fill()
    const mr0 = Math.round((ca[0] + cb[0]) / 2)
    const mr1 = Math.round((ca[1] + cb[1]) / 2)
    const mr2 = Math.round((ca[2] + cb[2]) / 2)
    for (let k = 0; k < 2; k++) {
      const ph = ((t * flow + i * 0.27 + k * 0.5) % 1) * grow
      const lx = pa.x + (pb.x - pa.x) * ph
      const ly = pa.y + (pb.y - pa.y) * ph
      const prad = 7
      const pg = ctx.createRadialGradient(lx, ly, 0, lx, ly, prad)
      pg.addColorStop(0, "rgba(" + mr0 + "," + mr1 + "," + mr2 + ",0.95)")
      pg.addColorStop(1, "rgba(" + mr0 + "," + mr1 + "," + mr2 + ",0)")
      ctx.fillStyle = pg
      ctx.beginPath()
      ctx.arc(lx, ly, prad, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// Draw a "vessel" fill gauge around each sphere: a faint full ring (the empty
// vessel) plus a bright arc that grows SYMMETRICALLY from the bottom (6 o'clock)
// up toward the top as the sphere's light rises - so you can literally watch how
// much light is poured into each sphere. `lights` are already-smoothed per-sphere
// fractions; `born` carries each sphere's screen depth and birth fraction.
function drawFillMeters(ctx: CanvasRenderingContext2D, sp: Record<string, { x: number; y: number }>, born: Record<string, { depth: number; born: number }>, lights: Record<string, number>, cols: Record<string, string>, t: number): void {
  ctx.save()
  ctx.globalCompositeOperation = "lighter"
  ctx.lineCap = "round"
  for (let i = 0; i < ALL_IDS.length; i++) {
    const id = ALL_IDS[i]
    const p = sp[id]
    const ps = born[id]
    if (!p || !ps) continue
    const bf = typeof ps.born === "number" ? ps.born : 1
    if (bf < 0.5) continue
    const lit = clamp01(lights[id] || 0)
    if (lit <= 0.001) continue
    const col = cols[id] || "#ffffff"
    const depth = typeof ps.depth === "number" ? ps.depth : 1
    const r = (id === "soul" ? 54 : 36) * depth
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.8 + i)
    // Faint full track so the still-empty part of the vessel stays readable.
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255,255,255," + (0.08 * bf).toFixed(3) + ")"
    ctx.lineWidth = 2.5
    ctx.stroke()
    // The FILL MECHANIC itself changes with the sphere's own measure (mera):
    //   tier 0 (lit < 0.40): liquid  - one smooth arc poured up from the bottom.
    //   tier 1 (0.40..0.75): crystal - the arc breaks into faceted segments.
    //   tier 2 (lit >= 0.75): gold    - a radiant golden arc with rays at the rim.
    const span = Math.PI * lit
    const tier = lit < 0.4 ? 0 : (lit < 0.75 ? 1 : 2)
    const start = Math.PI / 2 - span
    const end = Math.PI / 2 + span
    if (tier === 0) {
      // Liquid: a single continuous bright arc (light poured in like water).
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, start, end)
      ctx.strokeStyle = hexToRgba(col, clamp01(0.9 * pulse) * bf)
      ctx.lineWidth = 4
      ctx.stroke()
    } else if (tier === 1) {
      // Crystal: the same arc cut into facets, so the light reads as crystallized.
      const segs = 7
      const gap = 0.16
      const segLen = (end - start) / segs
      ctx.lineWidth = 4.5
      for (let g = 0; g < segs; g++) {
        const a0 = start + g * segLen + segLen * gap * 0.5
        const a1 = start + (g + 1) * segLen - segLen * gap * 0.5
        const fa = clamp01((0.55 + 0.4 * Math.sin(t * 2.2 + g * 0.9 + i)) * pulse) * bf
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, a0, a1)
        ctx.strokeStyle = hexToRgba(col, fa)
        ctx.stroke()
      }
    } else {
      // Gold: a blazing golden arc doubled over the sphere colour, plus short
      // rays standing off the rim - the vessel overflowing with refined light.
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, start, end)
      ctx.strokeStyle = hexToRgba(col, clamp01(0.5 * pulse) * bf)
      ctx.lineWidth = 6
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, start, end)
      ctx.strokeStyle = "rgba(255,224,130," + clamp01(0.85 * pulse * bf).toFixed(3) + ")"
      ctx.lineWidth = 3
      ctx.stroke()
      const rays = 9
      for (let g = 0; g <= rays; g++) {
        const ang2 = start + (g / rays) * (end - start)
        const r0 = r + 3
        const r1 = r + 9 + 3 * Math.sin(t * 3 + g + i)
        ctx.beginPath()
        ctx.moveTo(p.x + Math.cos(ang2) * r0, p.y + Math.sin(ang2) * r0)
        ctx.lineTo(p.x + Math.cos(ang2) * r1, p.y + Math.sin(ang2) * r1)
        ctx.strokeStyle = "rgba(255,236,170," + clamp01(0.5 * pulse * bf).toFixed(3) + ")"
        ctx.lineWidth = 1.4
        ctx.stroke()
      }
    }
    // Glowing beads at the two rising edges (the meniscus of the filling light).
    for (let s = -1; s <= 1; s += 2) {
      const ang = Math.PI / 2 + s * span
      const bx = p.x + Math.cos(ang) * r
      const by = p.y + Math.sin(ang) * r
      const beadCol = tier === 2 ? "#ffe082" : col
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 6)
      bg.addColorStop(0, hexToRgba(beadCol, 0.95 * bf))
      bg.addColorStop(1, hexToRgba(beadCol, 0))
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.arc(bx, by, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ---- light particles (the soul's field gathers Light into the spheres) ----
// Particles of Light drift in from the void; the field of the heart and the orbit
// spheres pulls them inward in a spiral and absorbs them, then they respawn at an
// edge. Colour encodes the dimension (mer) via the chakra palette. Purely visual
// for now; later this reads the real particle flow from the heart bridge.
type LightParticle = { x: number; y: number; vx: number; vy: number; hue: number; sz: number; tgt: number; seed: number; q: number }

// Experience queue: the Tigel/heart pushes real lived experience here as Light
// specs (mer = dimension/chakra, q = quality/purity, sphere = 0..3 target orbit
// or -1 for the heart). Particles are NOT abstract decor - each one is energy or
// information arriving from the crucible, or experience the grok brings into the
// game. When the queue is empty the field idles with faint ambient motes.
type LightSpec = { mer: number; q: number; sphere: number }
const heartQueue: LightSpec[] = []

function pushLight(mer: number, q: number, sphere: number, count: number): void {
  const n = Math.max(1, Math.min(400, Math.floor(count || 1)))
  const m = ((Math.floor(mer || 0) % 9) + 9) % 9
  const sp = typeof sphere === "number" && sphere >= 0 && sphere < 4 ? sphere : -1
  for (let i = 0; i < n; i++) heartQueue.push({ mer: m, q: clamp01(q), sphere: sp })
}

function spawnParticle(w: number, h: number): LightParticle {
  const edge = Math.floor(Math.random() * 4)
  let x = 0
  let y = 0
  if (edge === 0) { x = Math.random() * w; y = -8 }
  else if (edge === 1) { x = w + 8; y = Math.random() * h }
  else if (edge === 2) { x = Math.random() * w; y = h + 8 }
  else { x = -8; y = Math.random() * h }
  // Drain a real experience spec if the heart has sent one; else a faint ambient mote.
  const spec = heartQueue.length > 0 ? heartQueue.shift() : null
  const hue = spec ? spec.mer : Math.floor(Math.random() * 9)
  const q = spec ? spec.q : 0.32 + Math.random() * 0.46
  const tgt = spec ? spec.sphere : (Math.random() < 0.68 ? -1 : Math.floor(Math.random() * 4))
  const sz = 0.6 + q * 2.0
  return { x: x, y: y, vx: 0, vy: 0, hue: hue, sz: sz, tgt: tgt, seed: Math.random() * Math.PI * 2, q: q }
}

function drawParticles(ctx: CanvasRenderingContext2D, w: number, h: number, sp: Record<string, { x: number; y: number }>, list: LightParticle[], t: number, dt: number, growth: number, absorb: number[], lvl: number): void {
  // Population obeys the soul's measure (mera): few sparks at low mera, a dense
  // field at high mera; the soul's light (growth) adds on top of that.
  const mfPop = clamp01((lvl - 1) / 8)
  const want = Math.round(12 + 60 * mfPop + clamp01(growth) * 130)
  while (list.length < want) list.push(spawnParticle(w, h))
  if (list.length > want + 12) list.length = want
  const orbit = [sp.osnova, sp.serdce, sp.razum, sp.svyazi]
  const heart = sp.soul || { x: w / 2, y: h / 2 }
  // The gathered Light obeys the soul's measure (mera):
  //   low mera  -> few, slow, dim sparks with only a faint chakra tint;
  //   mid mera  -> brighter, quicker, fully chakra-coloured motes;
  //   mera 7..9 -> bright WHITE grains of light (colour burns off into pure light).
  const mf = clamp01((lvl - 1) / 8)
  const m79 = clamp01((lvl - 6) / 3)
  const spd = 0.32 + 0.95 * mf
  const swirl = 0.2 + 0.45 * mf
  const bright = 0.16 + 0.6 * mf
  const whiteBase = 232 + 23 * m79
  const satF = clamp01(0.35 + 0.6 * mf) * (1 - m79)
  ctx.save()
  ctx.globalCompositeOperation = "lighter"
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    let ax = heart.x
    let ay = heart.y
    if (p.tgt >= 0 && orbit[p.tgt]) { ax = orbit[p.tgt].x; ay = orbit[p.tgt].y }
    const dx = ax - p.x
    const dy = ay - p.y
    const dist = Math.hypot(dx, dy) || 1
    // Field pull (stronger when closer) plus a small swirl so they spiral in.
    const pull = (28 + growth * 70) / dist * spd
    const nx = dx / dist
    const ny = dy / dist
    p.vx += (nx * pull - ny * pull * swirl) * dt
    p.vy += (ny * pull + nx * pull * swirl) * dt
    p.vx *= 0.97
    p.vy *= 0.97
    p.x += p.vx * dt * 60
    p.y += p.vy * dt * 60
    // Absorbed near the attractor: tally the feed (heart = index 0, orbit = 1..4),
    // then respawn from an edge with a fresh dimension hue.
    if (dist < 16) { const fw = 0.15 + p.q; if (p.tgt < 0) absorb[0] += fw; else absorb[p.tgt + 1] += fw; list[i] = spawnParticle(w, h); continue }
    const baseRgb = (CHAKRA_RGB[p.hue] || "255,255,255").split(",")
    const cr = Math.round(whiteBase + (Number(baseRgb[0]) - whiteBase) * satF)
    const cgc = Math.round(whiteBase + (Number(baseRgb[1]) - whiteBase) * satF)
    const cbc = Math.round(whiteBase + (Number(baseRgb[2]) - whiteBase) * satF)
    const rgbStr = cr + "," + cgc + "," + cbc
    const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + p.seed)
    // From mera 7..9 the soft mote tightens into a crisp GRAIN OF MATTER: smaller,
    // less twinkle-swell, a flatter dense disk plus a hard bright core dot.
    const rad = p.sz * (1.2 + 0.85 * mf + tw * (1 - 0.7 * m79)) * (1 - 0.6 * m79)
    const a0 = (bright + (0.2 + 0.3 * mf) * p.q) * tw
    const core = 0.12 + 0.6 * m79
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad)
    g.addColorStop(0, "rgba(" + rgbStr + "," + a0.toFixed(3) + ")")
    g.addColorStop(core, "rgba(" + rgbStr + "," + (a0 * (0.55 + 0.45 * m79)).toFixed(3) + ")")
    g.addColorStop(1, "rgba(" + rgbStr + ",0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2)
    ctx.fill()
    if (m79 > 0.001) {
      const dotR = Math.max(0.5, p.sz * (0.42 - 0.12 * m79))
      ctx.fillStyle = "rgba(255,255,255," + clamp01(a0 * (0.5 + 0.5 * m79)).toFixed(3) + ")"
      ctx.beginPath()
      ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ---- per-level sphere decorations (the 9-dimension visual progression) ----
// Each mera (1..9) layers stage-appropriate ornaments around a sphere, growing
// with the soul's level: orbiting geometric satellites (L4+), a breathing aura
// field (L5+), a polyhedron shell - hexagon then dodecagon (L6+), a crystalline
// star burst (L7+), inner universe motes that order under gravity (L8+), and the
// grand master halo (L9). Drawn on the cosmos canvas behind the sphere buttons
// with additive blending so the lights stack up into colour.
// Screen-space hit targets for the Spirit crowns drawn on the cosmos canvas,
// rebuilt every frame by drawAuras so a tap on the stage can open a Spirit.
const spiritHits: Array<{ id: string; x: number; y: number; r: number }> = []

function drawAuras(ctx: CanvasRenderingContext2D, sp: Record<string, { x: number; y: number }>, t: number, lvl: number, growth: number, zoom: number, spirits?: any[]): void {
  spiritHits.length = 0
  if (lvl < 4) return
  const ids: SoulSphereId[] = ["soul", "osnova", "serdce", "razum", "svyazi"]
  // Mera 7..9 transition into a being of structured light: the coloured halo
  // glow of the soul-spheres recedes (about 80% gone by mera 9) while the white
  // and golden ray structures swell - a radiant, structural soul, building up.
  const m79 = clamp01((lvl - 7) / 2)
  const glowFade = 1 - 0.96 * m79
  const structGain = 1 + 1.1 * m79
  // Jiva web (mera 4+): the five spheres bind into ONE sacred figure - golden
  // spokes from the Soul out to each center, plus a ring through the four
  // centers, so the structure reads as a whole (celostnost), not separate orbs.
  // It brightens with the mera and breathes slowly.
  const c0 = sp.soul
  if (c0) {
    const ring: SoulSphereId[] = ["osnova", "serdce", "razum", "svyazi"]
    const wob = 0.5 + 0.5 * Math.sin(t * 0.8)
    const wa = clamp01((0.3 + 0.05 * (lvl - 4)) * (0.7 + growth * 0.5)) * (0.8 + 0.2 * wob) * structGain
    ctx.save()
    ctx.globalCompositeOperation = "lighter"
    ctx.strokeStyle = "rgba(235,205,120," + wa.toFixed(3) + ")"
    ctx.lineWidth = 2.4
    ctx.shadowColor = "rgba(235,205,120,0.9)"
    ctx.shadowBlur = 12 - 9 * m79
    for (let i = 0; i < ring.length; i++) {
      const p = sp[ring[i]]
      if (!p) continue
      ctx.beginPath()
      ctx.moveTo(c0.x, c0.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    ctx.beginPath()
    let started = false
    for (let i = 0; i <= ring.length; i++) {
      const p = sp[ring[i % ring.length]]
      if (!p) continue
      if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
    const na = clamp01(wa * 1.8) * glowFade
    for (let i = 0; i < ids.length; i++) {
      const p = sp[ids[i]]
      if (!p) continue
      const nr = (ids[i] === "soul" ? 8 : 5) + wob * 2
      const ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nr)
      ng.addColorStop(0, "rgba(255,240,205," + na.toFixed(3) + ")")
      ng.addColorStop(1, "rgba(255,240,205,0)")
      ctx.fillStyle = ng
      ctx.beginPath()
      ctx.arc(p.x, p.y, nr, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    // Jiva sigil + aspiration toward the Spirit. The Soul shows it has become a
    // WHOLE being (mera 4 = Jiva): a slow merkaba (two counter-rotating triangles
    // inside a halo ring) sits on the heart. A column of light rises upward - the
    // soul's striving toward the Spirit (Dukh), taller and brighter as the mera
    // climbs toward 7, where a seed of the Spirit ignites at its top.
    let rr = 0; let nrc = 0
    for (let i = 0; i < ring.length; i++) { const p = sp[ring[i]]; if (!p) continue; rr += Math.hypot(p.x - c0.x, p.y - c0.y); nrc++ }
    const orbR = nrc > 0 ? rr / nrc : 70
    const sigR = orbR * 0.42
    const sa = clamp01(0.4 + 0.06 * (lvl - 4)) * (0.82 + 0.18 * wob) * structGain
    // Flower of Life blooming behind the soul (mera 7..9): bronze -> gold, and it
    // expands with each mera, slowly turning - the divine ground of the Spirit.
    if (lvl >= 7) {
      const f = clamp01((lvl - 7) / 2)
      const flr = sigR * (0.55 + (lvl - 7) * 0.14)
      const fr = Math.round(180 + (245 - 180) * f)
      const fg = Math.round(120 + (215 - 120) * f)
      const fb = Math.round(60 + (130 - 60) * f)
      const fa = clamp01(0.1 + (lvl - 7) * 0.05) * (0.8 + 0.2 * wob)
      const fcol = "rgba(" + fr + "," + fg + "," + fb + "," + fa.toFixed(3) + ")"
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      ctx.translate(c0.x, c0.y)
      ctx.rotate(t * 0.02)
      ctx.strokeStyle = fcol
      ctx.lineWidth = 1.1
      ctx.shadowColor = fcol
      ctx.shadowBlur = 6
      const ax = flr
      const bx = flr * 0.5
      const by = flr * Math.sqrt(3) / 2
      for (let a = -2; a <= 2; a++) {
        for (let b = -2; b <= 2; b++) {
          const x = a * ax + b * bx
          const y = b * by
          if (Math.hypot(x, y) > flr * 2.05) continue
          ctx.beginPath(); ctx.arc(x, y, flr, 0, Math.PI * 2); ctx.stroke()
        }
      }
      ctx.restore()
    }
    ctx.save()
    ctx.globalCompositeOperation = "lighter"
    ctx.translate(c0.x, c0.y)
    ctx.strokeStyle = "rgba(240,214,140," + sa.toFixed(3) + ")"
    ctx.lineWidth = 1.6
    ctx.shadowColor = "rgba(240,214,140,0.9)"
    ctx.shadowBlur = 10 - 7 * m79
    ctx.beginPath(); ctx.arc(0, 0, sigR, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, sigR * 0.62, 0, Math.PI * 2); ctx.stroke()
    for (let tri = 0; tri < 2; tri++) {
      const rot = (tri === 0 ? t * 0.25 : -t * 0.25) + (tri === 0 ? 0 : Math.PI)
      ctx.beginPath()
      for (let v = 0; v < 3; v++) {
        const ang = rot + v * (Math.PI * 2 / 3) - Math.PI / 2
        const vx = Math.cos(ang) * sigR
        const vy = Math.sin(ang) * sigR
        if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy)
      }
      ctx.closePath(); ctx.stroke()
    }
    ctx.restore()
    const beamH = sigR * (1.6 + (lvl - 4) * 0.7)
    const ba = clamp01(0.18 + 0.05 * (lvl - 4)) * (0.7 + 0.3 * wob) * structGain
    const topY = c0.y - sigR - beamH
    ctx.save()
    ctx.globalCompositeOperation = "lighter"
    const grad = ctx.createLinearGradient(c0.x, c0.y - sigR, c0.x, topY)
    grad.addColorStop(0, "rgba(245,232,180," + ba.toFixed(3) + ")")
    grad.addColorStop(1, "rgba(245,232,180,0)")
    ctx.fillStyle = grad
    const halfW = 3 + (lvl - 4) * 0.8
    ctx.beginPath()
    ctx.moveTo(c0.x - halfW, c0.y - sigR)
    ctx.lineTo(c0.x + halfW, c0.y - sigR)
    ctx.lineTo(c0.x + halfW * 0.3, topY)
    ctx.lineTo(c0.x - halfW * 0.3, topY)
    ctx.closePath(); ctx.fill()
    for (let s = 0; s < 4; s++) {
      const ph = (t * 0.25 + s * 0.27) % 1
      const sy = c0.y - sigR - ph * beamH
      const sxj = c0.x + Math.sin((t + s) * 1.7) * halfW * 0.6
      const sr = (1.6 + (lvl - 4) * 0.2) * (1 - ph)
      const sg = ctx.createRadialGradient(sxj, sy, 0, sxj, sy, sr * 2.2)
      sg.addColorStop(0, "rgba(255,246,210," + (ba * 1.4).toFixed(3) + ")")
      sg.addColorStop(1, "rgba(255,246,210,0)")
      ctx.fillStyle = sg
      ctx.beginPath(); ctx.arc(sxj, sy, sr * 2.2, 0, Math.PI * 2); ctx.fill()
    }
    if (lvl >= 6) {
      const seedA = clamp01((lvl - 5) / 3) * (0.6 + 0.4 * wob)
      const seedR = 4 + (lvl - 6) * 2
      const seg = ctx.createRadialGradient(c0.x, topY, 0, c0.x, topY, seedR * 2.4)
      seg.addColorStop(0, "rgba(255,250,235," + seedA.toFixed(3) + ")")
      seg.addColorStop(1, "rgba(255,250,235,0)")
      ctx.fillStyle = seg
      ctx.beginPath(); ctx.arc(c0.x, topY, seedR * 2.4, 0, Math.PI * 2); ctx.fill()
    }
    // From mera 7 each new mera adds one more ascending ray toward the Spirit,
    // each finer, taller, brighter and more resonant than the last (7 -> 1 ray,
    // 8 -> 2, 9 -> 3). Every ray ends in a delicate 4-point star.
    if (lvl >= 7) {
      const rays = lvl - 6
      for (let k = 0; k < rays; k++) {
        const ang = (k - (rays - 1) / 2) * 0.16
        const dx = Math.sin(ang)
        const dy = -Math.cos(ang)
        const rayH = beamH * (1.2 + k * 0.22)
        const baseX = c0.x + dx * sigR
        const baseY = c0.y + dy * sigR
        const tipX = c0.x + dx * (sigR + rayH)
        const tipY = c0.y + dy * (sigR + rayH)
        const tw = 0.7 + 0.3 * Math.sin(t * (2.2 + k * 0.9) + k)
        const ra = clamp01(0.22 + k * 0.07) * (0.7 + 0.3 * tw) * structGain
        const hw = Math.max(0.7, 2.0 - k * 0.5)
        const px = -dy
        const py = dx
        const rg = ctx.createLinearGradient(baseX, baseY, tipX, tipY)
        rg.addColorStop(0, "rgba(250,240,205," + ra.toFixed(3) + ")")
        rg.addColorStop(1, "rgba(255,250,235,0)")
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.moveTo(baseX - px * hw, baseY - py * hw)
        ctx.lineTo(baseX + px * hw, baseY + py * hw)
        ctx.lineTo(tipX + px * hw * 0.15, tipY + py * hw * 0.15)
        ctx.lineTo(tipX - px * hw * 0.15, tipY - py * hw * 0.15)
        ctx.closePath(); ctx.fill()
        const starR = Math.max(2.4, 5.2 - k * 0.9) * (0.85 + 0.15 * tw)
        const ta = clamp01(0.5 + k * 0.12) * (0.7 + 0.3 * tw) * structGain
        ctx.save()
        ctx.shadowColor = "rgba(255,250,235,0.9)"
        ctx.shadowBlur = 8 + k * 3
        ctx.strokeStyle = "rgba(255,250,235," + ta.toFixed(3) + ")"
        ctx.lineWidth = Math.max(0.6, 1.2 - k * 0.25)
        ctx.beginPath(); ctx.moveTo(tipX, tipY - starR); ctx.lineTo(tipX, tipY + starR)
        ctx.moveTo(tipX - starR, tipY); ctx.lineTo(tipX + starR, tipY); ctx.stroke()
        const cg = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, starR)
        cg.addColorStop(0, "rgba(255,252,240," + ta.toFixed(3) + ")")
        cg.addColorStop(1, "rgba(255,252,240,0)")
        ctx.fillStyle = cg
        ctx.beginPath(); ctx.arc(tipX, tipY, starR, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
    }
    // Mera 7+: the Spirit-guide (Dukh). A steady bright vertical axis runs through
    // the soul, and a luminous guide-satellite circles it, leading upward.
    if (lvl >= 7) {
      const axA = clamp01(0.12 + (lvl - 7) * 0.05) * (0.75 + 0.25 * wob) * structGain
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      const axTop = c0.y - sigR - beamH * 1.1
      const axBot = c0.y + sigR * 1.4
      const axg = ctx.createLinearGradient(c0.x, axTop, c0.x, axBot)
      axg.addColorStop(0, "rgba(255,250,235,0)")
      axg.addColorStop(0.5, "rgba(255,248,225," + axA.toFixed(3) + ")")
      axg.addColorStop(1, "rgba(255,250,235,0)")
      ctx.strokeStyle = axg
      ctx.lineWidth = 1.4
      ctx.shadowColor = "rgba(255,248,225,0.8)"
      ctx.shadowBlur = 8
      ctx.beginPath(); ctx.moveTo(c0.x, axTop); ctx.lineTo(c0.x, axBot); ctx.stroke()
      const gaArc = t * 0.9
      const gx = c0.x + Math.cos(gaArc) * sigR * 1.15
      const gy = c0.y + Math.sin(gaArc) * sigR * 0.5 - sigR * 0.2
      const gr = 3.4 + (lvl - 7) * 0.7
      const gA = clamp01(0.55 + (lvl - 7) * 0.12) * (0.7 + 0.3 * wob)
      const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 2.6)
      gg.addColorStop(0, "rgba(255,252,240," + gA.toFixed(3) + ")")
      gg.addColorStop(1, "rgba(255,252,240,0)")
      ctx.fillStyle = gg
      ctx.beginPath(); ctx.arc(gx, gy, gr * 2.6, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    // Mera 5+: the Soul radiates thin waves of light that spread across the
    // screen. From mera 5 to 7 they grow stronger but stay thin; at mera 9 the
    // waves turn into rainbow light.
    if (lvl >= 5) {
      const maxR = orbR * 7.5
      const count = 3 + (lvl - 5)
      const baseA = clamp01(0.1 + (lvl - 5) * 0.055) * glowFade
      const rainbow = lvl >= 9
      const pal = [[255, 80, 80], [255, 160, 50], [250, 230, 70], [90, 225, 120], [70, 175, 255], [130, 110, 245], [210, 95, 235]]
      ctx.save()
      ctx.globalCompositeOperation = "screen"
      for (let k = 0; k < count; k++) {
        const ph = (t * 0.12 + k / count) % 1
        const rad = ph * maxR
        if (rad < 4) continue
        const a = clamp01(baseA * (1 - ph) * (0.7 + 0.3 * Math.sin(t + k)))
        if (a <= 0.002) continue
        if (rainbow) {
          const c = pal[(k + Math.floor(t * 0.5)) % pal.length]
          ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")"
        } else {
          ctx.strokeStyle = "rgba(225,230,255," + a.toFixed(3) + ")"
        }
        ctx.lineWidth = 1 + (lvl - 5) * 0.1
        ctx.beginPath(); ctx.arc(c0.x, c0.y, rad, 0, Math.PI * 2); ctx.stroke()
      }
      ctx.restore()
    }
    // Mera 7+: a thin "ray into eternity" - a slender rainbow beam rising from
    // the Jiva up the axis to the Spirit. Small and persistent (the saved bridge).
    if (lvl >= 7) {
      const ry0 = c0.y - sigR
      const ry1 = topY
      const grd = ctx.createLinearGradient(c0.x, ry0, c0.x, ry1)
      grd.addColorStop(0.0, "rgba(210,95,235,0)")
      grd.addColorStop(0.15, "rgba(130,110,245,0.5)")
      grd.addColorStop(0.35, "rgba(70,175,255,0.55)")
      grd.addColorStop(0.55, "rgba(90,225,120,0.55)")
      grd.addColorStop(0.72, "rgba(250,230,70,0.55)")
      grd.addColorStop(0.86, "rgba(255,160,50,0.5)")
      grd.addColorStop(1.0, "rgba(255,80,80,0)")
      ctx.save()
      ctx.globalCompositeOperation = "screen"
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 1.1)
      ctx.strokeStyle = grd
      ctx.lineWidth = 2.5
      ctx.shadowColor = "rgba(180,200,255,0.6)"
      ctx.shadowBlur = 8
      ctx.beginPath(); ctx.moveTo(c0.x, ry0); ctx.lineTo(c0.x, ry1); ctx.stroke()
      ctx.restore()
    }
    // Mera 7+: the Spirit (Dukh) becomes the CROWN at the top of the ray into
    // eternity - a luminous orb seated above the Jiva, tied to it by a thread of
    // light, its faces (grani) circling it like little moons. This weaves the
    // Spirit into the awakening composition instead of floating apart from it.
    if (lvl >= 7 && spirits && spirits.length > 0) {
      // Three Spirit tiers ride PARALLEL horizontal orbit rings stacked straight
      // UP the Soul's vertical light-shaft. They never swing left/right when the
      // cosmos is turned (the shaft stays plumb); rotating only opens or flattens
      // each ring VERTICALLY - the perspective volume is tied to how foreshortened
      // the Soul's own orbit looks right now. Each ring breathes up/down with the
      // Soul; rings sit well apart so they never merge; the One crowns the top of
      // the shaft and rays straight DOWN into the Soul.
      const C = sp.soul
      if (C) {
        const byTier: any[][] = [[], [], []]
        for (let i = 0; i < spirits.length; i++) {
          const trr = spirits[i].tier || 1
          const idx = trr <= 1 ? 0 : (trr >= 3 ? 2 : 1)
          byTier[idx].push(spirits[i])
        }
        // vertical openness of the rings = how flat the Soul's orbit looks now,
        // measured from the live orbit spheres so turning the cosmos changes only
        // the vertical squash, never any sideways lean.
        const serP = sp.serdce, svP = sp.svyazi, rzP = sp.razum, osP = sp.osnova
        const spanX = Math.max(10, (serP && svP ? Math.abs(serP.x - svP.x) : orbR * 2) / 2)
        const spanY = (rzP && osP ? Math.abs(rzP.y - osP.y) : orbR) / 2
        const squash = Math.max(0.16, Math.min(0.6, spanY / spanX))
        const beat = 0.5 + 0.5 * Math.sin(t * 1.1)
        const colX = C.x
        const shaft = Math.max(sigR * 3, C.y - topY)
        // Higher up the shaft (further from the Soul) and the two rings close
        // together near the crown; the One sits at the very top.
        const ringCfg = [{ cy: C.y - shaft * 0.62, rx: orbR * 0.5, dir: 1, spd: 0.32, base: 0.28 }, { cy: C.y - shaft * 0.8, rx: orbR * 0.7, dir: -1, spd: 0.22, base: 0.4 }]
        // The agreed Spirit colours: tier1 = seven rainbow hues leaning into white
        // light; tier2 = four softer sets, each orb blending up to three colours.
        const L1C = ["255,209,214", "255,224,189", "255,243,191", "211,249,216", "197,246,250", "208,235,255", "229,219,255"]
        const L2C = [["255,212,59", "255,146,43", "247,103,7"], ["116,192,252", "77,171,247", "59,91,219"], ["177,151,252", "151,117,250", "112,72,232"], ["99,230,190", "56,217,169", "12,166,120"]]
        for (let tl = 0; tl < 2; tl++) {
          const list = byTier[tl]
          if (list.length === 0) continue
          const cfg = ringCfg[tl]
          const cyR = cfg.cy - 5 * Math.sin(t * 1.1 + tl)
          const ry = cfg.rx * squash
          ctx.save()
          ctx.globalCompositeOperation = "lighter"
          ctx.strokeStyle = "rgba(210,205,255,0.1)"
          ctx.lineWidth = 1
          ctx.beginPath()
          for (let a = 0; a <= 48; a++) {
            const th = (a / 48) * Math.PI * 2
            const gx = colX + Math.cos(th) * cfg.rx
            const gy = cyR + Math.sin(th) * ry
            if (a === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy)
          }
          ctx.stroke()
          ctx.restore()
          const cnt = list.length
          for (let si = 0; si < cnt; si++) {
            const th = cfg.dir * t * cfg.spd + (si / cnt) * Math.PI * 2
            const px = colX + Math.cos(th) * cfg.rx
            const py = cyR + Math.sin(th) * ry
            const depthF = 0.74 + 0.26 * Math.sin(th)
            const breath = 0.86 + 0.14 * Math.sin(t * 1.3 + si)
            const cr = sigR * cfg.base * depthF * breath
            spiritHits.push({ id: list[si].id, x: px, y: py, r: cr + 14 })
            const seedStr = String(list[si].id || si)
            let hsh = 0
            for (let hi = 0; hi < seedStr.length; hi++) hsh = (hsh * 31 + seedStr.charCodeAt(hi)) % 997
            const lum = 0.45 + (hsh / 997) * 0.55
            const lumP = clamp01(lum * (0.85 + 0.15 * Math.sin(t * 1.6 + si)))
            let tint = "255,255,255"
            let set3: string[] | null = null
            if (tl === 0) { tint = L1C[si % L1C.length] } else { set3 = L2C[si % L2C.length]; tint = set3[1] }
            ctx.save()
            ctx.globalCompositeOperation = "lighter"
            const tg2 = ctx.createLinearGradient(C.x, C.y, px, py)
            tg2.addColorStop(0, "rgba(" + tint + ",0)")
            tg2.addColorStop(1, "rgba(" + tint + "," + (0.08 + 0.28 * lum).toFixed(3) + ")")
            ctx.strokeStyle = tg2
            ctx.lineWidth = 0.6 + 0.9 * lum
            ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.lineTo(px, py); ctx.stroke()
            const hg2 = ctx.createRadialGradient(px, py, 0, px, py, cr * 2.6)
            hg2.addColorStop(0, "rgba(255,255,255," + clamp01(0.8 * lumP).toFixed(3) + ")")
            hg2.addColorStop(0.35, "rgba(" + tint + "," + clamp01(0.55 * lumP).toFixed(3) + ")")
            hg2.addColorStop(1, "rgba(" + tint + ",0)")
            ctx.fillStyle = hg2
            ctx.beginPath(); ctx.arc(px, py, cr * 2.6, 0, Math.PI * 2); ctx.fill()
            ctx.shadowColor = "rgba(" + tint + ",0.9)"
            ctx.shadowBlur = (set3 ? 18 : 10) + 16 * lum
            const bodyG = ctx.createRadialGradient(px - cr * 0.32, py - cr * 0.34, cr * 0.1, px, py, cr)
            if (set3) {
              bodyG.addColorStop(0, "rgba(255,255,255," + clamp01(0.55 + 0.35 * lumP).toFixed(3) + ")")
              bodyG.addColorStop(0.4, "rgba(" + set3[0] + "," + clamp01(0.5 + 0.4 * lumP).toFixed(3) + ")")
              bodyG.addColorStop(0.72, "rgba(" + set3[1] + "," + clamp01(0.45 + 0.4 * lumP).toFixed(3) + ")")
              bodyG.addColorStop(1, "rgba(" + set3[2] + ",0.16)")
            } else {
              bodyG.addColorStop(0, "rgba(255,255,255," + clamp01(0.8 + 0.2 * lumP).toFixed(3) + ")")
              bodyG.addColorStop(0.5, "rgba(" + tint + "," + clamp01(0.5 + 0.45 * lumP).toFixed(3) + ")")
              bodyG.addColorStop(1, "rgba(" + tint + ",0.16)")
            }
            ctx.fillStyle = bodyG
            ctx.beginPath(); ctx.arc(px, py, cr, 0, Math.PI * 2); ctx.fill()
            ctx.shadowBlur = 0
            ctx.fillStyle = "rgba(255,255,255," + clamp01(0.4 + 0.5 * lumP).toFixed(3) + ")"
            ctx.beginPath(); ctx.arc(px - cr * 0.28, py - cr * 0.3, cr * 0.34, 0, Math.PI * 2); ctx.fill()
            const subs = list[si].subs || []
            const fn = subs.length
            for (let fi = 0; fi < fn; fi++) {
              const fa2 = t * 0.6 + (fi / (fn < 1 ? 1 : fn)) * Math.PI * 2
              const fx = px + Math.cos(fa2) * cr * 2.1
              const fy = py + Math.sin(fa2) * cr * 1.05
              const fsz = cr * 0.3 * (0.8 + 0.2 * Math.sin(t * 2 + fi))
              const fg2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, fsz * 2.4)
              fg2.addColorStop(0, "rgba(" + tint + ",0.92)")
              fg2.addColorStop(1, "rgba(" + tint + ",0)")
              ctx.fillStyle = fg2
              ctx.beginPath(); ctx.arc(fx, fy, fsz * 2.4, 0, Math.PI * 2); ctx.fill()
            }
            ctx.restore()
          }
        }
        const one = byTier[2][0]
        if (one) {
          const ox = colX
          const oy = topY - 6 * Math.sin(t * 1.1)
          const orr = sigR * 0.6 * (0.88 + 0.12 * Math.sin(t * 0.9))
          spiritHits.push({ id: one.id, x: ox, y: oy, r: orr + 18 })
          ctx.save()
          ctx.globalCompositeOperation = "lighter"
          const rg = ctx.createLinearGradient(ox, oy, C.x, C.y)
          rg.addColorStop(0, "rgba(255,250,235," + (0.4 + 0.25 * beat).toFixed(3) + ")")
          rg.addColorStop(1, "rgba(255,250,235,0)")
          ctx.strokeStyle = rg
          ctx.lineWidth = 2.4
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(C.x, C.y); ctx.stroke()
          const hg = ctx.createRadialGradient(ox, oy, 0, ox, oy, orr * 2.8)
          hg.addColorStop(0, "rgba(255,255,255,0.85)")
          hg.addColorStop(1, "rgba(255,255,255,0)")
          ctx.fillStyle = hg
          ctx.beginPath(); ctx.arc(ox, oy, orr * 2.8, 0, Math.PI * 2); ctx.fill()
          // Crown rays: the SAME crisp white-gold structural spikes the soul
          // spheres cast, now streaming OUT of the One in every direction and
          // reaching far past it - the Spirit radiating clear structured light.
          const oneSpikes = 16
          const oInner = orr * 0.9
          const oOuter = orr * (3.4 + 0.5 * Math.sin(t * 0.6))
          for (let os = 0; os < oneSpikes; os++) {
            const oang = (os / oneSpikes) * Math.PI * 2 + t * 0.12
            const ofl = 0.6 + 0.4 * Math.sin(t * 2.2 + os * 1.7)
            const oex = ox + Math.cos(oang) * oOuter * ofl
            const oey = oy + Math.sin(oang) * oOuter * ofl
            const obx = ox + Math.cos(oang) * oInner
            const oby = oy + Math.sin(oang) * oInner
            const onx = -Math.sin(oang)
            const ony = Math.cos(oang)
            const ohw = 1.0 + 1.3 * beat
            const orgd = ctx.createLinearGradient(obx, oby, oex, oey)
            orgd.addColorStop(0, "rgba(255,240,200," + (0.5 * ofl).toFixed(3) + ")")
            orgd.addColorStop(0.4, "rgba(255,250,235," + (0.4 * ofl).toFixed(3) + ")")
            orgd.addColorStop(1, "rgba(255,255,255,0)")
            ctx.fillStyle = orgd
            ctx.beginPath()
            ctx.moveTo(obx - onx * ohw, oby - ony * ohw)
            ctx.lineTo(obx + onx * ohw, oby + ony * ohw)
            ctx.lineTo(oex, oey)
            ctx.closePath(); ctx.fill()
          }
          const pal = [[255, 93, 93], [255, 178, 77], [255, 226, 77], [110, 240, 122], [77, 210, 255], [109, 139, 255], [192, 107, 255]]
          ctx.lineWidth = orr * 0.5
          for (let k = 0; k < pal.length; k++) {
            const a0 = (k / pal.length) * Math.PI * 2 + t * 0.3
            const a1 = ((k + 1) / pal.length) * Math.PI * 2 + t * 0.3
            const cc = pal[k]
            ctx.strokeStyle = "rgba(" + cc[0] + "," + cc[1] + "," + cc[2] + ",0.55)"
            ctx.beginPath(); ctx.arc(ox, oy, orr * 0.8, a0, a1); ctx.stroke()
          }
          // The Spirit of the One is an iridescent aura-stone: a crystalline
          // sphere shimmering through the whole spectrum (not plain white).
          ctx.save()
          ctx.beginPath(); ctx.arc(ox, oy, orr, 0, Math.PI * 2); ctx.clip()
          ctx.globalCompositeOperation = "source-over"
          const con = (ctx as any).createConicGradient ? (ctx as any).createConicGradient(t * 0.4, ox, oy) : null
          if (con) {
            con.addColorStop(0, "rgba(255,120,120,0.92)")
            con.addColorStop(0.16, "rgba(255,190,90,0.92)")
            con.addColorStop(0.33, "rgba(250,240,120,0.92)")
            con.addColorStop(0.5, "rgba(120,240,150,0.92)")
            con.addColorStop(0.66, "rgba(90,200,255,0.92)")
            con.addColorStop(0.82, "rgba(170,140,255,0.92)")
            con.addColorStop(1, "rgba(255,120,120,0.92)")
            ctx.fillStyle = con
          } else {
            const lin = ctx.createLinearGradient(ox - orr, oy - orr, ox + orr, oy + orr)
            lin.addColorStop(0, "rgba(255,140,140,0.92)")
            lin.addColorStop(0.35, "rgba(250,240,130,0.92)")
            lin.addColorStop(0.6, "rgba(110,230,160,0.92)")
            lin.addColorStop(0.85, "rgba(120,180,255,0.92)")
            lin.addColorStop(1, "rgba(180,140,255,0.92)")
            ctx.fillStyle = lin
          }
          ctx.fillRect(ox - orr, oy - orr, orr * 2, orr * 2)
          const irad = ctx.createRadialGradient(ox - orr * 0.34, oy - orr * 0.36, orr * 0.1, ox, oy, orr)
          irad.addColorStop(0, "rgba(255,255,255,0.85)")
          irad.addColorStop(0.4, "rgba(255,255,255,0.04)")
          irad.addColorStop(1, "rgba(35,18,55,0.45)")
          ctx.fillStyle = irad
          ctx.fillRect(ox - orr, oy - orr, orr * 2, orr * 2)
          ctx.restore()
          ctx.restore()
        }
      }
    }
    ctx.restore()
  }
  ctx.save()
  ctx.globalCompositeOperation = "lighter"
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const p = sp[id]
    if (!p) continue
    const rgb = SOUL_CANON[id] ? SOUL_CANON[id].rgb : [200, 200, 200]
    const col = rgb[0] + "," + rgb[1] + "," + rgb[2]
    const rad = (id === "soul" ? 46 : 30) * zoom
    const phase = t * 0.5 + i * 1.3
    if (lvl >= 7 && m79 > 0.001) {
      // Mera 7..9: each SOUL sphere crystallises its light into a burst of fine
      // white-gold rays with a faceted rim - the coloured halo gives way to sharp
      // crystalline STRUCTURE, growing as the mera climbs from 7 to 9.
      const spikes = 12
      const innerR = rad * 0.92
      // Reach the crisp rays far OUT past the sphere body so the structured
      // light of the soul clearly breaks its own boundary (mera 7..9).
      const outerR = rad * (1.7 + 3.2 * m79)
      const rayA = clamp01(0.26 + 0.66 * m79)
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (let s = 0; s < spikes; s++) {
        const ang = (s / spikes) * Math.PI * 2 + phase * 0.15
        const fl = 0.62 + 0.38 * Math.sin(t * 2.4 + s * 1.7 + i)
        const ex = p.x + Math.cos(ang) * outerR * fl
        const ey = p.y + Math.sin(ang) * outerR * fl
        const bx = p.x + Math.cos(ang) * innerR
        const by = p.y + Math.sin(ang) * innerR
        const nx = -Math.sin(ang)
        const ny = Math.cos(ang)
        const hw = 1.2 + 1.3 * m79
        const rgd = ctx.createLinearGradient(bx, by, ex, ey)
        rgd.addColorStop(0, "rgba(255,236,175," + clamp01(rayA * fl).toFixed(3) + ")")
        rgd.addColorStop(0.45, "rgba(255,250,235," + clamp01(rayA * 0.8 * fl).toFixed(3) + ")")
        rgd.addColorStop(1, "rgba(255,255,255,0)")
        ctx.fillStyle = rgd
        ctx.beginPath()
        ctx.moveTo(bx - nx * hw, by - ny * hw)
        ctx.lineTo(bx + nx * hw, by + ny * hw)
        ctx.lineTo(ex, ey)
        ctx.closePath(); ctx.fill()
      }
      const facets = 6
      ctx.strokeStyle = "rgba(255,250,235," + clamp01(0.42 + 0.55 * m79).toFixed(3) + ")"
      ctx.lineWidth = 1.2 + 1.2 * m79
      ctx.shadowColor = "rgba(255,244,210,0.8)"
      ctx.shadowBlur = 4 + 6 * m79
      ctx.beginPath()
      for (let s = 0; s <= facets; s++) {
        const ang = (s / facets) * Math.PI * 2 + phase * 0.1
        const fr = rad * (1.1 + 0.06 * Math.sin(t * 1.6 + i))
        const vx = p.x + Math.cos(ang) * fr
        const vy = p.y + Math.sin(ang) * fr
        if (s === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy)
      }
      ctx.stroke()
      ctx.restore()
    }
    if (lvl >= 5) {
      const aR = rad * (1.35 + 0.1 * Math.sin(t * 1.3 + i))
      const a = clamp01((0.1 + 0.05 * (lvl - 5) + 0.05 * Math.sin(t * 1.6 + i)) * (0.7 + growth * 0.5)) * glowFade * glowFade * 0.4
      const g = ctx.createRadialGradient(p.x, p.y, rad * 0.6, p.x, p.y, aR)
      g.addColorStop(0, "rgba(" + col + ",0)")
      g.addColorStop(0.7, "rgba(" + col + "," + a.toFixed(3) + ")")
      g.addColorStop(1, "rgba(" + col + ",0)")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, aR, 0, Math.PI * 2)
      ctx.fill()
    }
    if (lvl >= 6) {
      const sides = lvl >= 7 ? 12 : 6
      const pr = rad * 1.5
      const rot = t * 0.2 + i
      const polyA = clamp01((0.3 + 0.06 * (lvl - 6)) * structGain)
      // Mera 8..9: bleed the polyhedron colour toward white-gold so the shell
      // reads as STRUCTURE (less colour, more visible geometry).
      const pgR = Math.round(rgb[0] + (255 - rgb[0]) * m79)
      const pgG = Math.round(rgb[1] + (244 - rgb[1]) * m79)
      const pgB = Math.round(rgb[2] + (210 - rgb[2]) * m79)
      ctx.strokeStyle = "rgba(" + pgR + "," + pgG + "," + pgB + "," + polyA.toFixed(3) + ")"
      ctx.lineWidth = 1.4 + 1.2 * m79
      ctx.beginPath()
      const verts: Array<[number, number]> = []
      for (let k = 0; k <= sides; k++) {
        const ang = rot + (k / sides) * Math.PI * 2
        const vx = p.x + Math.cos(ang) * pr
        const vy = p.y + Math.sin(ang) * pr
        verts.push([vx, vy])
        if (k === 0) ctx.moveTo(vx, vy)
        else ctx.lineTo(vx, vy)
      }
      ctx.stroke()
      // Mera 7..9: crisp crystal faceting - bright white-gold spokes from the
      // core to every vertex plus a tighter inner facet ring, so each soul
      // sphere reads as a CUT GEM of structured light, not a soft glowing ball.
      if (m79 > 0.001) {
        const fA = clamp01(0.55 + 0.45 * m79)
        ctx.strokeStyle = "rgba(255,248,225," + fA.toFixed(3) + ")"
        ctx.lineWidth = 1.1 + 1.1 * m79
        ctx.beginPath()
        for (let k = 0; k < sides; k++) {
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(verts[k][0], verts[k][1])
        }
        const ir = pr * 0.6
        for (let k = 0; k <= sides; k++) {
          const ang = rot + (k / sides) * Math.PI * 2 + Math.PI / sides
          const vx = p.x + Math.cos(ang) * ir
          const vy = p.y + Math.sin(ang) * ir
          if (k === 0) ctx.moveTo(vx, vy)
          else ctx.lineTo(vx, vy)
        }
        ctx.stroke()
      }
    }
    if (lvl >= 7) {
      const rays = 6
      const len = rad * (1.9 + 0.3 * Math.sin(t * 2 + i))
      ctx.strokeStyle = "rgba(255,250,230," + (0.4 + 0.2 * Math.sin(t * 2.4 + i)).toFixed(3) + ")"
      ctx.lineWidth = 1.4
      for (let k = 0; k < rays; k++) {
        const ang = phase * 0.4 + (k / rays) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len)
        ctx.stroke()
      }
      const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 0.85)
      cg.addColorStop(0, "rgba(255,255,245," + (0.5 * glowFade).toFixed(3) + ")")
      cg.addColorStop(1, "rgba(255,255,245,0)")
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(p.x, p.y, rad * 0.85, 0, Math.PI * 2)
      ctx.fill()
    }
    const sats = lvl >= 8 ? 5 : (lvl >= 6 ? 4 : 3)
    const orbitR = rad * (1.8 + 0.1 * Math.sin(t + i))
    for (let k = 0; k < sats; k++) {
      const ang = phase + (k / sats) * Math.PI * 2
      const sx = p.x + Math.cos(ang) * orbitR
      const sy = p.y + Math.sin(ang) * orbitR * 0.62
      const ssz = 2.2 + Math.sin(t * 2 + k) * 0.8
      ctx.fillStyle = "rgba(" + col + "," + (0.85 * glowFade).toFixed(3) + ")"
      ctx.beginPath()
      ctx.moveTo(sx, sy - ssz)
      ctx.lineTo(sx + ssz, sy)
      ctx.lineTo(sx, sy + ssz)
      ctx.lineTo(sx - ssz, sy)
      ctx.closePath()
      ctx.fill()
    }
    if (lvl >= 8) {
      const motes = 7
      for (let k = 0; k < motes; k++) {
        const ang = -phase * 1.5 + (k / motes) * Math.PI * 2
        const mr = rad * (0.5 + 0.3 * Math.sin(t * 1.7 + k))
        const mx = p.x + Math.cos(ang) * mr
        const my = p.y + Math.sin(ang) * mr
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.fillRect(mx, my, 1.4, 1.4)
      }
    }
    if (lvl >= 9) {
      const hg = ctx.createRadialGradient(p.x, p.y, rad, p.x, p.y, rad * 2.6)
      hg.addColorStop(0, "rgba(" + col + "," + (0.12 * glowFade).toFixed(3) + ")")
      hg.addColorStop(1, "rgba(" + col + ",0)")
      ctx.fillStyle = hg
      ctx.beginPath()
      ctx.arc(p.x, p.y, rad * 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// Per-level filter ramp: darkness/grey (1) -> colour returns (2-3) -> colour
// dominates (4-6) -> blazing gold tones (7-9). Indexed by (lvl - 1).
const SAT_RAMP = ["grayscale(0.92) brightness(0.58) contrast(1.3)", "grayscale(0.55) brightness(0.72) saturate(0.68) contrast(1.16)", "grayscale(0.18) brightness(0.88) saturate(0.95) contrast(1.06)", "saturate(1.25) brightness(1.05)", "saturate(1.4) brightness(1.08)", "saturate(1.55) brightness(1.12)", "saturate(1.6) brightness(1.15)", "saturate(1.65) brightness(1.18)", "saturate(1.7) brightness(1.2)"]

// ---- crystallization + elite framing (the higher the mera, the richer) ----
// hexToRgba: turn a #rrggbb sphere colour into an rgba() string with alpha so we
// can paint translucent colour inclusions inside the sphere body.
function hexToRgba(hex: string, a: number): string {
  let h = (hex || "").replace("#", "")
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h, 16)
  if (!Number.isFinite(n) || h.length !== 6) return "rgba(255,255,255," + a + ")"
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

// sphereBg: the living interior of a sphere. Mera 1 = a near-empty dark body;
// mera 2 the darkness starts drifting; 3 light specks brighten; from 4 colour
// inclusions dominate the dark; from 6 a faceted crystal (conic) layer appears,
// turning the sphere into a cut gem holding light.
function sphereBg(color: string, lvl: number, t: number): string {
  const layers: string[] = []
  const g = clamp01((lvl - 1) / 8)
  // Crystallization: a faceted gem layer fades in from mera 4 and sharpens, so
  // the murky orb slowly turns into a cut crystal holding light.
  if (lvl >= 4) {
    const fa = (t * 6) % 360
    const ca = (0.05 + 0.035 * (lvl - 4)).toFixed(3)
    const cb = (0.09 + 0.05 * (lvl - 4)).toFixed(3)
    layers.push("conic-gradient(from " + fa.toFixed(1) + "deg, rgba(255,255,255," + ca + "), rgba(255,255,255," + cb + "), rgba(255,255,255,0.02), rgba(255,255,255," + cb + "), rgba(255,255,255,0.03), rgba(255,255,255," + cb + "), rgba(255,255,255," + ca + "))")
  }
  // Inner light source: dim and murky at low mera, then brighter, larger and
  // pulsing as the soul grows, until it reaches the rim (light inside AND out).
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.6)
  // Mera 7..9: damp the bulb-like inner glow (lampovost) of the soul body so it
  // reads as structured light, not a lit lamp. Crystalline structures untouched.
  const lampFade = 1 - 0.85 * clamp01((lvl - 7) / 2)
  // Mera 7..9: dissolve the solid coloured body into clear glass so the crisp
  // canvas wireframe (sacred geometry) reads through, keeping only a THIN tint
  // of the sphere colour - the soul becomes structure, not a glowing ball.
  const wireF = clamp01((lvl - 7) / 2)
  const reach = 30 + g * 66
  const coreA = clamp01((0.1 + g * 0.85) * (0.72 + 0.28 * pulse)) * lampFade
  const midA = clamp01((0.12 + g * 0.5) * (0.7 + 0.3 * pulse)) * lampFade
  layers.push("radial-gradient(circle at 50% 48%, rgba(255,250,235," + coreA.toFixed(3) + "), " + hexToRgba(color, midA) + " " + (reach * 0.55).toFixed(1) + "%, transparent " + reach.toFixed(1) + "%)")
  // Light waves: a bright ring travels outward, stronger with the mera (5+).
  if (lvl >= 5) {
    const wp = (t * 0.5) % 1
    const wm = 20 + wp * 70
    const wa = clamp01((0.18 + 0.05 * (lvl - 5)) * (1 - wp)) * lampFade
    layers.push("radial-gradient(circle at 50% 50%, transparent " + (wm - 14).toFixed(1) + "%, rgba(255,245,220," + wa.toFixed(3) + ") " + wm.toFixed(1) + "%, transparent " + (wm + 12).toFixed(1) + "%)")
  }
  // Colour inclusions that drift inside the body (the gathered specks of Light).
  const n = Math.min(4, 1 + Math.floor(lvl / 2))
  const op = (lvl >= 4 ? 0.3 : (lvl >= 2 ? 0.18 : 0.1)) * (1 - 0.8 * wireF)
  for (let k = 0; k < n; k++) {
    const drift = lvl >= 2 ? t * (0.15 + k * 0.05) : k * 1.3
    const px = 50 + Math.sin(drift + k * 1.7) * 26
    const py = 50 + Math.cos(drift * 0.9 + k * 2.1) * 26
    const tint = k % 2 === 0 ? hexToRgba(color, op) : "rgba(255,255,255," + op.toFixed(2) + ")"
    layers.push("radial-gradient(circle at " + px.toFixed(1) + "% " + py.toFixed(1) + "%, " + tint + ", transparent " + (16 + k * 3) + "%)")
  }
  // Body base opacity: heavy and fully opaque up to mera 4 (raw matter), then a
  // SMOOTH (smoothstep) growth into transparency and light transmission from 4
  // to 9, so high spheres turn into clear crystal that lets the light pass.
  const clr = clamp01((lvl - 4) / 5)
  const clrE = clr * clr * (3 - 2 * clr)
  const baseA = ((0.99 - 0.59 * clrE) * (1 - 0.74 * wireF)).toFixed(3)
  const bodyTint = (0.5 + g * 0.4) * (1 - 0.82 * wireF)
  layers.push("radial-gradient(circle at 36% 30%, " + hexToRgba(color, bodyTint) + ", rgba(8,6,16," + baseA + "))")
  // Mera 1..3: raw, heavy matter. A directional gradient sinks the lower half
  // into darkness (density / gravity) and a dark pool weighs it down, so the orb
  // reads as a rough, heavy stone. As the soul nears mera 4 (Jiva) this clears -
  // the sphere LIGHTENS and turns glassy. At mera 4+ heavy === 0, so the original
  // crystal mechanic is fully preserved (these overlays simply vanish).
  const heavy = clamp01((4 - lvl) / 3)
  if (heavy > 0) {
    // Hold the weight HIGH up toward mera 4 (power < 1 keeps low meras heavy for
    // longer), then ease off so the clearing into crystal stays smooth.
    const hv = Math.pow(heavy, 0.7)
    // Greyscale luminance of raw matter as light GROWS into it with the mera:
    // mera 1 = near-black, mera 2 = storm grey, mera 3 = close to white (colour
    // returns from mera 4). A faint cold-blue keeps it stormy, not a flat grey.
    const litT = Math.round(8 + 92 * (lvl - 1))
    const lr = Math.min(255, Math.round(litT * 0.96))
    const lg = Math.min(255, Math.round(litT * 0.99))
    const lb = Math.min(255, Math.round(litT * 1.1))
    const lit = lr + "," + lg + "," + lb
    const mr = Math.round(lr * 0.42) + "," + Math.round(lg * 0.42) + "," + Math.round(lb * 0.48)
    // Spherical body, fully OPAQUE: a sunlit shoulder on the upper-left falls to a
    // near-black limb, so each orb reads as a heavy 3D ball - a cosmic object, not
    // a flat disc. Stacked on top, it hides the colour body until mera 4 clears it.
    layers.unshift("radial-gradient(circle at 33% 27%, rgba(" + lit + ",1) 0%, rgba(" + mr + ",1) 44%, rgba(3,3,7,1) 82%, rgba(1,1,3,1) 100%)")
    // A dark terminator pool on the far lower-right deepens the curvature.
    layers.unshift("radial-gradient(circle at 70% 74%, rgba(0,0,0," + (0.45 * hv).toFixed(3) + ") 0%, transparent 52%)")
    // A small specular star-glint on the lit shoulder - the polish of a weighty
    // cosmic stone; it brightens with the mera as more light lands on it.
    layers.unshift("radial-gradient(circle at 30% 24%, rgba(255,255,255," + (0.12 + 0.08 * (lvl - 1)).toFixed(3) + ") 0%, transparent 26%)")
  }
  return layers.join(", ")
}

// sphereFrame: the elite ring around a sphere. Coloured glow always; then bronze
// (L4-5), a double bronze ring (L6), gold with inner highlight (L7), heavier gold
// (L8) and a radiant white+gold obod at the master stage (L9).
function sphereFrame(glowPx: number, color: string, lvl: number): string {
  const g = clamp01((lvl - 1) / 8)
  // Inner-light bloom that spills BEYOND the sphere edge, widening with the mera
  // so high spheres glow into the cosmos (light inside and outside the body).
  // Mera 7..9: damp this bulb-like bloom (lampovost) so the high soul reads as
  // structured radiance rather than a glowing lamp; the gold/white obod stays.
  const lampFade = 1 - 0.85 * clamp01((lvl - 7) / 2)
  const bloom = Math.round(glowPx * (1 + g * 1.8) * lampFade)
  const out: string[] = ["0 0 " + bloom + "px " + color]
  if (lvl >= 5) out.push("0 0 " + Math.round(bloom * 1.8) + "px " + hexToRgba(color, 0.5))
  if (lvl >= 7) out.push("0 0 " + Math.round(bloom * 2.6) + "px " + hexToRgba(color, 0.4))
  if (lvl >= 4) out.push("0 0 0 1px rgba(201,168,76,0.32)")
  if (lvl >= 5) out.push("inset 0 0 10px rgba(255,240,200," + (0.18 * lampFade).toFixed(3) + ")")
  if (lvl >= 6) { out.push("0 0 0 2px rgba(201,168,76,0.42)"); out.push("0 0 0 4px rgba(201,168,76,0.16)") }
  if (lvl >= 7) { out.push("0 0 0 2px rgba(212,175,55,0.6)"); out.push("inset 0 0 12px rgba(255,240,200," + (0.32 * lampFade).toFixed(3) + ")") }
  if (lvl >= 8) { out.push("0 0 0 5px rgba(201,168,76,0.4)"); out.push("0 0 22px rgba(212,175,55," + (0.5 * lampFade).toFixed(3) + ")") }
  if (lvl >= 9) { out.push("0 0 0 3px rgba(255,245,215,0.85)"); out.push("0 0 0 7px rgba(212,175,55,0.5)"); out.push("0 0 34px rgba(212,175,55," + (0.6 * lampFade).toFixed(3) + ")") }
  return out.join(", ")
}

// windowFrameShadow: the elite border of the whole Soul window. Hidden below L3,
// then a faint bronze inset that thickens and turns to gold, ending in a radiant
// master frame at L9. Depends only on level so re-applying each frame is free.
function windowFrameShadow(lvl: number): string {
  if (lvl < 3) return "none"
  const out: string[] = []
  if (lvl >= 3) out.push("inset 0 0 0 1px rgba(201,168,76,0.18)")
  if (lvl >= 5) { out.push("inset 0 0 0 2px rgba(201,168,76,0.3)"); out.push("inset 0 0 60px rgba(201,168,76,0.05)") }
  if (lvl >= 7) { out.push("inset 0 0 0 2px rgba(212,175,55,0.5)"); out.push("inset 0 0 0 6px rgba(201,168,76,0.18)"); out.push("inset 0 0 90px rgba(212,175,55,0.08)") }
  if (lvl >= 8) out.push("inset 0 0 0 4px rgba(255,240,200,0.28)")
  if (lvl >= 9) { out.push("inset 0 0 0 3px rgba(255,245,215,0.7)"); out.push("inset 0 0 0 9px rgba(212,175,55,0.45)"); out.push("inset 0 0 140px rgba(212,175,55,0.12)") }
  return out.join(", ")
}

// windowFrameBg: gilded corner ornaments for the window from L7 (like the 1500+ cards).
function windowFrameBg(lvl: number): string {
  if (lvl < 7) return "none"
  const s = lvl >= 9 ? 150 : (lvl >= 8 ? 120 : 90)
  const a = lvl >= 9 ? 0.22 : 0.16
  const col = "rgba(212,175,55," + a + ")"
  const out: string[] = []
  out.push("radial-gradient(circle at top left, " + col + ", transparent " + s + "px)")
  out.push("radial-gradient(circle at top right, " + col + ", transparent " + s + "px)")
  out.push("radial-gradient(circle at bottom left, " + col + ", transparent " + s + "px)")
  out.push("radial-gradient(circle at bottom right, " + col + ", transparent " + s + "px)")
  return out.join(", ")
}

// Yin-yang silhouette (contour only, no black/white fill) shown inside each
// sphere while it is still raw (mera 1..3): the outer circle, the S-curve
// divider and the two eyes, all stroked in a soft light tint so the symbol
// reads as a pure outline rather than a filled black/white figure.
const YIN_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "66%",
  height: "66%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
  zIndex: 2,
}
function yinYang(alpha: number): React.ReactElement {
  const col = "rgba(232,230,255," + clamp01(alpha).toFixed(2) + ")"
  return (
    <svg style={YIN_STYLE} viewBox="0 0 100 100" fill="none">
      <g transform="translate(50 50)">
        <g>
          <animateTransform attributeName="transform" attributeType="XML" type="scale" values="0.05;1;0.05" keyTimes="0;0.72;1" calcMode="spline" keySplines="0.34 0 0.2 1;0.7 0 0.5 1" dur="9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;1;0.1" keyTimes="0;0.72;1" calcMode="spline" keySplines="0.34 0 0.2 1;0.7 0 0.5 1" dur="9s" repeatCount="indefinite" />
          <g transform="translate(-50 -50)">
            <circle cx="50" cy="50" r="47" stroke={col} strokeWidth="3" />
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 50 50" to="360 50 50" dur="24s" repeatCount="indefinite" />
              <path d="M50 3 A23.5 23.5 0 0 1 50 50 A23.5 23.5 0 0 0 50 97" stroke={col} strokeWidth="3" />
              <circle cx="50" cy="26.5" r="6.5" stroke={col} strokeWidth="2.6" />
              <circle cx="50" cy="73.5" r="6.5" stroke={col} strokeWidth="2.6" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

// Two-colour sphere contour. The rim is split top=red / bottom=blue; as the mera
// climbs toward 4 the two halves bleed together through a widening violet band
// (the red and blue spectra overlapping into violet). Past mera 4 the ring
// matures into a magical lilac with golden accents. Each instance needs a unique
// gradient id (gid) so several spheres can show different stages at once.
const CONTOUR_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 1,
}
function mixHex(a: string, b: string, t: number): string {
  const na = parseInt((a || "").replace("#", ""), 16)
  const nb = parseInt((b || "").replace("#", ""), 16)
  const k = clamp01(t)
  const r = Math.round(((na >> 16) & 255) + (((nb >> 16) & 255) - ((na >> 16) & 255)) * k)
  const g = Math.round(((na >> 8) & 255) + (((nb >> 8) & 255) - ((na >> 8) & 255)) * k)
  const c = Math.round((na & 255) + ((nb & 255) - (na & 255)) * k)
  return "rgb(" + r + "," + g + "," + c + ")"
}
function sphereContour(lvl: number, gid: string): React.ReactElement {
  const t1 = clamp01((lvl - 1) / 3)
  const u = clamp01((lvl - 4) / 5)
  const top = mixHex("#ff3b46", "#ffcf6a", u)
  const mid = mixHex("#9a4bff", "#c77dff", u)
  const bot = mixHex("#3b7bff", "#c77dff", u)
  const half = 5 + 38 * t1
  const vTop = (50 - half).toFixed(1) + "%"
  const vBot = (50 + half).toFixed(1) + "%"
  const idv = "syc-" + gid
  return (
    <svg style={CONTOUR_STYLE} viewBox="0 0 100 100" fill="none">
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.35;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" dur="0.7s" fill="freeze" />
      <defs>
        <linearGradient id={idv} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={top} />
          <stop offset={vTop} stopColor={top} />
          <stop offset="50%" stopColor={mid} />
          <stop offset={vBot} stopColor={bot} />
          <stop offset="100%" stopColor={bot} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" stroke={"url(#" + idv + ")"} strokeWidth="7" opacity="0.25" />
      <circle cx="50" cy="50" r="46" stroke={"url(#" + idv + ")"} strokeWidth="3.4" opacity="0.95" />
    </svg>
  )
}

// Full-window elite frame overlay (edges only; never blocks pointer events).
const FRAME_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  pointerEvents: "none",
  borderRadius: "inherit",
}

// ---- static styles ----
const STAGE_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  userSelect: "none",
  touchAction: "none",
}
const CANVAS_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
}
const BRAND_WRAP: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "18px",
  zIndex: 4,
  pointerEvents: "none",
}
const BRAND_STYLE: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "17px",
  letterSpacing: "0.22em",
  color: "#f0e8ff",
  textShadow: "0 0 18px rgba(176,108,224,0.6)",
}
const TAGLINE_STYLE: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.16em",
  color: "rgba(220,210,245,0.6)",
  marginTop: "3px",
}
const HINT_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "22px",
  transform: "translateX(-50%)",
  zIndex: 4,
  fontSize: "12px",
  letterSpacing: "0.1em",
  color: "rgba(220,210,245,0.5)",
  textAlign: "center",
  pointerEvents: "none",
  width: "90%",
}
const PANEL_STYLE: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  height: "100%",
  width: "min(420px, 92vw)",
  zIndex: 8,
  background: "linear-gradient(180deg, rgba(16,12,26,0.94), rgba(10,8,18,0.97))",
  borderLeft: "1px solid rgba(201,168,76,0.25)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  animation: "soulPanelIn 0.32s ease",
}
const PANEL_HEAD: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "18px 18px 12px",
}
const PANEL_TITLE: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "18px",
  letterSpacing: "0.14em",
  color: "#f0e8ff",
  flex: 1,
}
const PANEL_PROMPT: React.CSSProperties = {
  padding: "0 18px 10px",
  fontSize: "13px",
  fontStyle: "italic",
  color: "rgba(220,210,245,0.62)",
}
const TABS_ROW: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  padding: "0 12px 10px",
  overflowX: "auto",
}
const PANEL_BODY: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "6px 18px 24px",
}
const ROW_WRAP: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  marginBottom: "12px",
  flexWrap: "wrap",
}
const INPUT_STYLE: React.CSSProperties = {
  flex: 1,
  minWidth: "120px",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(201,168,76,0.25)",
  background: "rgba(255,255,255,0.04)",
  color: "#ece7f7",
  fontFamily: "inherit",
  fontSize: "14px",
  outline: "none",
}
const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: "64px",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(201,168,76,0.25)",
  background: "rgba(255,255,255,0.04)",
  color: "#ece7f7",
  fontFamily: "inherit",
  fontSize: "14px",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
}
const TYPE_ROW: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginBottom: "10px",
}
const EMPTY_NOTE: React.CSSProperties = {
  fontSize: "13px",
  fontStyle: "italic",
  color: "rgba(220,210,245,0.4)",
  padding: "8px 0",
}
const LIST_WRAP: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}
const CARD_STYLE: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}
const CARD_HEAD: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
}
const CARD_META: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.7)",
  flex: 1,
}
const CARD_BODY: React.CSSProperties = {
  fontSize: "14px",
  color: "#e6e1f2",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
}
const DEL_BTN: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,140,140,0.7)",
  cursor: "pointer",
  fontSize: "14px",
  lineHeight: 1,
  padding: "2px 4px",
}
const PLAN_ITEM: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.03)",
}
const SUB_TEXT: React.CSSProperties = {
  flex: 1,
  fontSize: "14px",
  color: "#e6e1f2",
}
const PLAN_CHECK: React.CSSProperties = {
  flex: "0 0 auto",
  width: "20px",
  height: "20px",
  borderRadius: "6px",
  border: "1px solid rgba(201,168,76,0.5)",
  background: "transparent",
  color: "#c9a84c",
  cursor: "pointer",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
}
const PLAN_TEXT: React.CSSProperties = {
  flex: 1,
  fontSize: "14px",
  color: "#e6e1f2",
}
const HIDDEN_INPUT: React.CSSProperties = { display: "none" }
const AUDIO_STYLE: React.CSSProperties = { width: "100%", marginTop: "4px" }
const LINK_STYLE: React.CSSProperties = {
  color: "#8fb8ff",
  fontSize: "14px",
  wordBreak: "break-all",
  textDecoration: "none",
}
const SOCIAL_LINK: React.CSSProperties = {
  flex: 1,
  color: "#8fb8ff",
  fontSize: "14px",
  wordBreak: "break-all",
  textDecoration: "none",
}
const CAPTION_STYLE: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(220,210,245,0.6)",
  marginTop: "4px",
}
const COLOR_INPUT: React.CSSProperties = {
  width: "48px",
  height: "30px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
}
const MEDIA_THUMB: React.CSSProperties = {
  width: "100%",
  maxHeight: "180px",
  objectFit: "cover",
  borderRadius: "8px",
  display: "block",
}
const STYLE_LABEL: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(220,210,245,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  margin: "12px 0",
}
const RANGE_STYLE: React.CSSProperties = { flex: 1 }
const RESET_BTN: React.CSSProperties = {
  marginTop: "22px",
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid rgba(255,120,120,0.3)",
  background: "rgba(255,80,80,0.08)",
  color: "rgba(255,170,170,0.9)",
  fontFamily: "inherit",
  fontSize: "13px",
  cursor: "pointer",
}
const TOAST_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "70px",
  transform: "translateX(-50%)",
  zIndex: 12,
  padding: "10px 18px",
  borderRadius: "12px",
  background: "rgba(18,14,28,0.9)",
  border: "1px solid rgba(201,168,76,0.35)",
  color: "#f0e8ff",
  fontSize: "13px",
  letterSpacing: "0.06em",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  pointerEvents: "none",
}
const NAV_TOGGLE: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  bottom: "24px",
  zIndex: 7,
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(201,168,76,0.3)",
  background: "rgba(18,14,28,0.55)",
  color: "#e6e1f2",
  fontFamily: "inherit",
  fontSize: "16px",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
}
const CLOSE_BTN: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "9px",
  border: "1px solid rgba(201,168,76,0.3)",
  background: "rgba(255,255,255,0.04)",
  color: "#e6e1f2",
  fontSize: "15px",
  cursor: "pointer",
}
const CHAKRA_ROW: React.CSSProperties = {
  display: "none",
  position: "absolute",
  left: "50%",
  bottom: "12px",
  transform: "translateX(-50%)",
  zIndex: 5,
  display: "flex",
  gap: "8px",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "92vw",
  padding: "6px 12px",
  borderRadius: "22px",
  background: "rgba(12,10,20,0.4)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  pointerEvents: "auto",
}

// ---- dimension (9 spaces) overlay styles ----
const DIM_OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(5,4,10,0.82)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  animation: "soulPanelIn 0.3s ease",
}
const DIM_CARD: React.CSSProperties = {
  width: "min(420px, 90vw)",
  padding: "28px 26px 24px",
  borderRadius: "20px",
  border: "1px solid rgba(201,168,76,0.3)",
  background: "linear-gradient(180deg, rgba(18,14,30,0.96), rgba(10,8,18,0.98))",
  boxShadow: "0 0 60px rgba(0,0,0,0.6)",
  textAlign: "center",
}
const DIM_NAME: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "22px",
  letterSpacing: "0.12em",
  color: "#f0e8ff",
  marginTop: "12px",
}
const DIM_HINT: React.CSSProperties = {
  fontSize: "14px",
  fontStyle: "italic",
  color: "rgba(220,210,245,0.62)",
  margin: "14px 0 20px",
  lineHeight: 1.6,
}
const DIM_BAR_WRAP: React.CSSProperties = {
  height: "8px",
  borderRadius: "6px",
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
  marginBottom: "6px",
}
const DIM_FILL_TXT: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.75)",
  marginBottom: "22px",
}
const DIM_CLOSE: React.CSSProperties = {
  width: "100%",
  padding: "11px",
  borderRadius: "12px",
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(201,168,76,0.12)",
  color: "#f5ecc0",
  fontFamily: "inherit",
  fontSize: "14px",
  cursor: "pointer",
}

// ---- onboarding (tutorial) styles ----
const ONB_TITLE: React.CSSProperties = { fontFamily: "'Cinzel Decorative', serif", fontSize: "20px", letterSpacing: "0.08em", color: "#f5ecc0", marginBottom: "12px", textAlign: "center" }
const ONB_BODY: React.CSSProperties = { fontSize: "14px", lineHeight: 1.7, color: "rgba(228,222,248,0.86)", textAlign: "center", marginBottom: "20px", minHeight: "120px" }
const ONB_DOTS: React.CSSProperties = { display: "flex", gap: "6px", justifyContent: "center", marginBottom: "18px" }
const ONB_BTNS: React.CSSProperties = { display: "flex", gap: "10px", justifyContent: "center" }
const ONB_NEXT: React.CSSProperties = { flex: "1 1 auto", padding: "11px", borderRadius: "12px", border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.16)", color: "#f5ecc0", fontFamily: "inherit", fontSize: "14px", cursor: "pointer" }
const ONB_SKIP: React.CSSProperties = { padding: "11px 14px", borderRadius: "12px", border: "1px solid rgba(150,130,210,0.3)", background: "transparent", color: "rgba(220,210,245,0.7)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }
const ONB_OPEN: React.CSSProperties = { position: "absolute", left: "14px", bottom: "112px", zIndex: 7, width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,168,76,0.3)", background: "rgba(18,14,28,0.55)", color: "#e6e1f2", fontFamily: "inherit", fontSize: "18px", cursor: "pointer", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }
const ISKRA_BTN: React.CSSProperties = { position: "absolute", left: "14px", bottom: "156px", zIndex: 7, width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(230,198,106,0.5)", background: "rgba(28,22,40,0.62)", color: "#f5ecc0", fontFamily: "inherit", fontSize: "18px", cursor: "pointer", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", boxShadow: "0 0 14px rgba(230,198,106,0.4)" }
function onbDotStyle(active: boolean): React.CSSProperties { return { width: "8px", height: "8px", borderRadius: "50%", background: active ? "#f5ecc0" : "rgba(200,190,230,0.28)" } }
const ONB_TOGGLE: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", fontSize: "13px", color: "rgba(220,210,245,0.75)", marginBottom: "14px", cursor: "pointer" }
const BIRTH_WRAP: React.CSSProperties = { position: "absolute", left: "50%", bottom: "84px", transform: "translateX(-50%)", zIndex: 11, width: "min(440px, 92vw)", padding: "18px 20px", borderRadius: "18px", border: "1px solid rgba(201,168,76,0.3)", background: "linear-gradient(180deg, rgba(18,14,30,0.92), rgba(10,8,18,0.96))", boxShadow: "0 0 50px rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", textAlign: "center", animation: "soulPanelIn 0.4s ease" }
const BIRTH_TITLE: React.CSSProperties = { fontFamily: "'Cinzel Decorative', serif", fontSize: "19px", letterSpacing: "0.06em", color: "#f5ecc0", marginBottom: "10px" }
const BIRTH_BODY: React.CSSProperties = { fontSize: "15px", lineHeight: 1.6, color: "rgba(230,224,250,0.9)", marginBottom: "14px" }
const BIRTH_BTNS: React.CSSProperties = { display: "flex", gap: "10px", justifyContent: "center" }
// Background agent cards (one per domain agent). Shown faintly behind the soul on
// levels 7-9. Random for now; later the player will generate their own.
const CARD_DIR = "/exports/generated_cards/tarot_cards_webp/"
const CARD_POOL: string[] = [
  "0709_domain__svet_ra.webp",
  "0710_domain__iskra.webp",
  "0711_domain__brahma.webp",
  "0712_domain__sarasvati.webp",
  "0713_domain__vishnu.webp",
  "0714_domain__lakshmi.webp",
  "0715_domain__shiva.webp",
  "0716_domain__parvati.webp",
  "0717_domain__jnana.webp",
  "0718_domain__prema.webp",
  "0719_domain__shakti.webp",
  "0720_domain__ananda.webp",
  "0721_domain__shanti.webp",
  "0722_domain__agni.webp",
  "0723_domain__vayu.webp",
  "0724_domain__varuna.webp",
  "0725_domain__prithvi.webp",
  "0726_domain__akasha.webp",
  "0727_domain__tejas.webp",
  "0728_domain__dharma.webp",
  "0729_domain__karma.webp",
]
function agentBgStyle(card: string): React.CSSProperties { return { position: "absolute", inset: 0, zIndex: 0, backgroundImage: "url(" + CARD_DIR + card + ")", backgroundSize: "cover", backgroundPosition: "center", opacity: 0, transition: "opacity 1.6s ease", pointerEvents: "none", filter: "saturate(0.8)", mixBlendMode: "screen" } }

// ---- matrix (culture lens) switcher ----
// Comment is ASCII; the visible text uses \uXXXX escapes ("Matrix - tap for next").
const MATRIX_HINT = "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u2014 \u043D\u0430\u0436\u043C\u0438 \u0434\u043B\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439"
const MATRIX_BTN: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "104px",
  zIndex: 6,
  padding: "5px 12px",
  borderRadius: "16px",
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(18,14,28,0.55)",
  color: "#f0e8ff",
  fontFamily: "inherit",
  fontSize: "12px",
  letterSpacing: "0.06em",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
}

// ---- top-right collapsible menu (day energy / crucible / daimon / supergame) ----
const MENU_ITEMS = [
  { key: "energy", glyph: "\u2600", label: "\u042D\u043D\u0435\u0440\u0433\u0438\u044F \u0434\u043D\u044F" },
  { key: "tigel", glyph: "\u2697", label: "\u0422\u0438\u0433\u0435\u043B\u044C" },
  { key: "daimon", glyph: "\u2734", label: "\u0414\u0430\u0439\u043C\u043E\u043D" },
  { key: "supergame", glyph: "\u2726", label: "\u0421\u0443\u043F\u0435\u0440 \u0438\u0433\u0440\u0430" },
]
const MENU_HINT = "\u041C\u0435\u043D\u044E"
const MENU_TOGGLE: React.CSSProperties = { position: "absolute", right: "14px", top: "60px", zIndex: 9, width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,168,76,0.55)", background: "rgba(18,14,28,0.7)", color: "#f5ecc0", fontFamily: "inherit", fontSize: "18px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }
const MENU_PANEL: React.CSSProperties = { position: "absolute", right: "14px", top: "112px", zIndex: 9, display: "flex", flexDirection: "column", gap: "8px", padding: "10px", borderRadius: "14px", border: "1px solid rgba(201,168,76,0.3)", background: "rgba(16,12,28,0.86)", boxShadow: "0 12px 34px rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "soulPanelIn 0.24s ease", minWidth: "176px" }
const MENU_BTN: React.CSSProperties = { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(201,168,76,0.25)", background: "rgba(255,255,255,0.04)", color: "#ece7f7", fontFamily: "inherit", fontSize: "13px", letterSpacing: "0.04em", cursor: "pointer", whiteSpace: "nowrap" }
const MENU_GLYPH: React.CSSProperties = { fontSize: "15px", color: "#c9a84c", width: "18px", textAlign: "center" }

// ---- maya / illusion: the soul gently fades over real time (a few percent per
// day), so light must be renewed. Mild on purpose. ----
const MAYA_KEY = "awara_soul_maya_v1"
const MAYA_DECAY_PER_DAY = 0.03

// ---- inside-a-sphere view (zoom in: the parent sphere centered, its subspheres
// orbiting around it as real smaller spheres; a back button returns to cosmos) ----
const INSIDE_OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at 50% 50%, rgba(12,9,24,0.82), rgba(4,3,10,0.96))",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  animation: "soulPanelIn 0.3s ease",
}
const INSIDE_STAGE: React.CSSProperties = {
  position: "relative",
  width: "min(520px, 92vw)",
  height: "min(520px, 64vh)",
}
const INSIDE_HEAD: React.CSSProperties = {
  position: "absolute",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 12,
  textAlign: "center",
  pointerEvents: "none",
  width: "90%",
}
const INSIDE_TITLE: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "21px",
  letterSpacing: "0.12em",
  color: "#f0e8ff",
}
const INSIDE_PROMPT: React.CSSProperties = {
  fontSize: "13px",
  fontStyle: "italic",
  color: "rgba(220,210,245,0.62)",
  marginTop: "6px",
}
const INSIDE_HINT: React.CSSProperties = {
  position: "absolute",
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 12,
  fontSize: "12px",
  letterSpacing: "0.06em",
  color: "rgba(220,210,245,0.5)",
  textAlign: "center",
  pointerEvents: "none",
  width: "90%",
}
const INSIDE_EMPTY: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "calc(50% + 96px)",
  transform: "translateX(-50%)",
  width: "80%",
  textAlign: "center",
  fontSize: "13px",
  fontStyle: "italic",
  color: "rgba(220,210,245,0.5)",
}
const INSIDE_BACK: React.CSSProperties = {
  position: "absolute",
  left: "16px",
  top: "16px",
  zIndex: 13,
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(18,14,28,0.6)",
  color: "#f0e8ff",
  fontFamily: "inherit",
  fontSize: "20px",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
}
function insideCenterStyle(color: string): React.CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "120px",
    height: "120px",
    marginLeft: "-60px",
    marginTop: "-60px",
    borderRadius: "50%",
    border: "none",
    background: "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.92))",
    boxShadow: "0 0 64px " + color,
    color: "#fff",
    fontSize: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 11,
  }
}
function insideSubStyle(idx: number, total: number, color: string): React.CSSProperties {
  const ang = (idx / (total < 1 ? 1 : total)) * Math.PI * 2 - Math.PI / 2
  const rad = 160
  const x = Math.cos(ang) * rad
  const y = Math.sin(ang) * rad
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "66px",
    height: "66px",
    marginLeft: "-33px",
    marginTop: "-33px",
    transform: "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)",
    borderRadius: "50%",
    border: "none",
    background: "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.9))",
    boxShadow: "0 0 26px " + color,
    color: "#fff",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 11,
  }
}

// ---- inside-a-subsphere (a facet's own little world): its core glows with its
// own light, a bar + buttons let the player pour light into just this facet. ----
function subCoreStyle(color: string, light: number): React.CSSProperties {
  const lit = clamp01(light)
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "120px",
    height: "120px",
    marginLeft: "-60px",
    marginTop: "-60px",
    borderRadius: "50%",
    border: "none",
    background: "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.92))",
    boxShadow: "0 0 " + (28 + lit * 80).toFixed(0) + "px " + color,
    color: "#fff",
    fontSize: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 11,
    opacity: 0.5 + lit * 0.5,
  }
}
const SUB_LIGHT_ROW: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "18px",
  transform: "translateX(-50%)",
  zIndex: 13,
  width: "min(320px, 84vw)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  alignItems: "center",
}
const SUB_BAR_WRAP: React.CSSProperties = {
  width: "100%",
  height: "8px",
  borderRadius: "6px",
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
}
const SUB_LIGHT_BTNS: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  justifyContent: "center",
}
const SUB_LIGHT_PCT: React.CSSProperties = {
  minWidth: "42px",
  textAlign: "center",
  fontSize: "12px",
  letterSpacing: "0.12em",
  color: "rgba(201,168,76,0.85)",
}

// ---- style functions ----
function coreStyle(color: string, size: number, glow: number, live: number): React.CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    touchAction: "none",
    width: size + "px",
    height: size + "px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    zIndex: 3,
    background: "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.92))",
    boxShadow: "0 0 " + (24 + glow * 0.5 + live * 46) + "px " + color,
    color: "#fff",
    fontSize: size * 0.42 + "px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    willChange: "transform",
  }
}

function orbitStyle(color: string, size: number, glow: number, live: number): React.CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: size + "px",
    height: size + "px",
    marginLeft: -size / 2 + "px",
    marginTop: -size / 2 + "px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    touchAction: "none",
    zIndex: 3,
    background: "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.9))",
    boxShadow: "0 0 " + (10 + glow * 0.4 + live * 28) + "px " + color,
    opacity: 0.55 + live * 0.45,
    color: "#fff",
    fontSize: size * 0.4 + "px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    willChange: "transform",
  }
}

function badgeStyle(color: string): React.CSSProperties {
  return {
    position: "absolute",
    right: "-4px",
    top: "-4px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    borderRadius: "9px",
    background: color,
    color: "#0a0814",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 8px " + color,
  }
}

function panelGlyph(color: string): React.CSSProperties {
  return { fontSize: "22px", color: color, lineHeight: 1 }
}

function arrowStyle(dir: NavDir): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    zIndex: 6,
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(201,168,76,0.3)",
    background: "rgba(18,14,28,0.5)",
    color: "#f0e8ff",
    fontFamily: "inherit",
    fontSize: "18px",
    lineHeight: 1,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    opacity: 0.7,
  }
  if (dir === "up") {
    base.top = "62px"
    base.left = "50%"
    base.transform = "translateX(-50%)"
  } else if (dir === "down") {
    base.bottom = "70px"
    base.left = "50%"
    base.transform = "translateX(-50%)"
  } else if (dir === "left") {
    base.left = "14px"
    base.top = "50%"
    base.transform = "translateY(-50%)"
  } else {
    base.right = "14px"
    base.top = "50%"
    base.transform = "translateY(-50%)"
  }
  return base
}

function chakraDotStyle(color: string, fill: number): React.CSSProperties {
  // Empty (no color) until growth lights it up, then the chakra color fades in.
  const sz = 13 + fill * 10
  const lit = fill > 0.04
  return {
    width: sz + "px",
    height: sz + "px",
    borderRadius: "50%",
    padding: 0,
    border: lit ? "1px solid transparent" : "1px solid rgba(190,190,210,0.28)",
    background: lit ? color : "rgba(120,120,140,0.14)",
    opacity: lit ? 0.4 + fill * 0.6 : 0.85,
    boxShadow: lit ? "0 0 " + (3 + fill * 16) + "px " + color : "none",
    transition: "all 0.5s ease",
    flex: "0 0 auto",
    cursor: "pointer",
  }
}

function dimOrbStyle(color: string, fill: number): React.CSSProperties {
  const lit = fill > 0.04
  return {
    width: "76px",
    height: "76px",
    margin: "0 auto",
    borderRadius: "50%",
    border: lit ? "1px solid transparent" : "1px solid rgba(190,190,210,0.3)",
    background: lit ? "radial-gradient(circle at 36% 30%, " + color + ", rgba(10,8,20,0.92))" : "rgba(120,120,140,0.14)",
    boxShadow: lit ? "0 0 " + (12 + fill * 30) + "px " + color : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    color: "#fff",
    opacity: lit ? 0.5 + fill * 0.5 : 0.8,
  }
}

function dimBarStyle(color: string, fill: number): React.CSSProperties {
  return {
    width: clamp01(fill) * 100 + "%",
    height: "100%",
    borderRadius: "6px",
    background: color,
    boxShadow: "0 0 10px " + color,
    transition: "width 0.5s ease",
  }
}

function linkBtnStyle(active: boolean): React.CSSProperties {
  return {
    position: "absolute",
    left: "14px",
    bottom: "68px",
    zIndex: 7,
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid " + (active ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,0.3)"),
    background: active ? "rgba(201,168,76,0.22)" : "rgba(18,14,28,0.55)",
    color: active ? "#f5ecc0" : "#e6e1f2",
    fontFamily: "inherit",
    fontSize: "18px",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  }
}

function viewBtnStyle(bottom: number): React.CSSProperties {
  return {
    position: "absolute",
    right: "14px",
    bottom: bottom + "px",
    zIndex: 7,
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(201,168,76,0.3)",
    background: "rgba(18,14,28,0.55)",
    color: "#e6e1f2",
    fontFamily: "inherit",
    fontSize: "18px",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  }
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 11px",
    borderRadius: "10px",
    border: active ? "1px solid rgba(201,168,76,0.5)" : "1px solid transparent",
    background: active ? "rgba(201,168,76,0.14)" : "transparent",
    color: active ? "#f0e8ff" : "rgba(220,210,245,0.55)",
    fontFamily: "inherit",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }
}

function chipStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: "5px 10px",
    borderRadius: "20px",
    border: "1px solid " + (active ? color : "rgba(255,255,255,0.14)"),
    background: active ? color : "transparent",
    color: active ? "#0a0814" : "rgba(220,210,245,0.7)",
    fontFamily: "inherit",
    fontSize: "12px",
    cursor: "pointer",
  }
}

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: "9px 14px",
    borderRadius: "10px",
    border: "1px solid " + color,
    background: "transparent",
    color: color,
    fontFamily: "inherit",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }
}

const CSS = [
  "@keyframes soulCorePulse {",
  "  0% { transform: translate(-50%,-50%) scale(1); }",
  "  50% { transform: translate(-50%,-50%) scale(1.07); }",
  "  100% { transform: translate(-50%,-50%) scale(1); }",
  "}",
  "@keyframes soulPanelIn {",
  "  from { opacity: 0; transform: translateX(24px); }",
  "  to { opacity: 1; transform: translateX(0); }",
  "}",
  ".soul-orbit:hover { filter: brightness(1.3); }",
  ".soul-core:hover { filter: brightness(1.2); }",
  ".soul-arrow:hover { opacity: 1 !important; }",
  ".soul-tab:hover { color: #fff !important; }",
  ".soul-body::-webkit-scrollbar { width: 8px; }",
  ".soul-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 8px; }",
].join("\n")

export function SoulSpace(): React.JSX.Element {
  const soul = useSoulState()
  const [selected, setSelected] = useState<SoulSphereId | null>(null)
  const [inside, setInside] = useState<SoulSphereId | null>(null)
  const [insideSub, setInsideSub] = useState<{ pid: SoulSphereId; subId: string } | null>(null)
  const [tab, setTab] = useState<PanelTab>("subs")
  const [subInput, setSubInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [noteType, setNoteType] = useState<JournalEntryType>("insight")
  const [planInput, setPlanInput] = useState("")
  const [linkInput, setLinkInput] = useState("")
  const [mediaCaption, setMediaCaption] = useState("")
  const [socialUrl, setSocialUrl] = useState("")
  const [socialLabel, setSocialLabel] = useState("")
  const [toast, setToast] = useState("")
  const [navShown, setNavShown] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [iskraOpen, setIskraOpen] = useState(false)
  const [iskraText, setIskraText] = useState("")
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(function () {
    try {
      const raw = localStorage.getItem("awara_soul_positions_v1")
      return raw ? JSON.parse(raw) : {}
    } catch (e) { return {} }
  })
  const [linkMode, setLinkMode] = useState(false)
  const [links, setLinks] = useState<string[]>(function () {
    try {
      const raw = localStorage.getItem("awara_soul_links_v1")
      return raw ? JSON.parse(raw) : []
    } catch (e) { return [] }
  })
  const [dimOpen, setDimOpen] = useState<number | null>(null)
  const [onbStep, setOnbStep] = useState<number | null>(null)
  const [birthStep, setBirthStep] = useState<number | null>(function () {
    try {
      if (localStorage.getItem("awara_soul_onboarded_v1")) return null
      if (localStorage.getItem("awara_soul_tutorial_enabled_v1") === "0") return null
      return 0
    } catch (e) { return 0 }
  })
  const [tutorialOn, setTutorialOn] = useState<boolean>(function () {
    try { return localStorage.getItem("awara_soul_tutorial_enabled_v1") !== "0" } catch (e) { return true }
  })
  const [matrixState, setMatrixState] = useState(function () { return loadMatrixState() })
  const matrixRef = useRef(matrixState)
  const [agentCard, setAgentCard] = useState<string>(function () {
    const ms = loadMatrixState()
    const pool = matrixCardPool(activeMatrix(ms), 9)
    return pool[0] || CARD_POOL[0]
  })

  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const orbitRefs = useRef<Array<HTMLButtonElement | null>>([])
  const coreRef = useRef<HTMLButtonElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const colorsRef = useRef<Record<string, string>>({})
  const starsRef = useRef<Star[]>([])
  const fxRef = useRef<{ overall: number }>({ overall: 0.2 })
  const selectedRef = useRef<SoulSphereId | null>(null)
  const zoomRef = useRef<number>(1)
  const rotRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0.5 })
  const bgPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const bgRotRef = useRef<{ sx: number; sy: number; yaw: number; pitch: number } | null>(null)
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null)
  const imgRef = useRef<HTMLInputElement | null>(null)
  const vidRef = useRef<HTMLInputElement | null>(null)
  const audRef = useRef<HTMLInputElement | null>(null)
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const offRef = useRef<Record<string, { az: number; el: number }>>((function () {
    try { const raw = localStorage.getItem("awara_soul_offsets_v1"); return raw ? JSON.parse(raw) : {} } catch (e) { return {} }
  })())
  const panRef = useRef<{ x: number; y: number }>((function () {
    try { const raw = localStorage.getItem("awara_soul_pan_v1"); return raw ? JSON.parse(raw) : { x: 0, y: 0 } } catch (e) { return { x: 0, y: 0 } }
  })())
  const spinRef = useRef(0)
  const lastTRef = useRef(0)
  const wOffRef = useRef<Record<string, { x: number; y: number; z: number }>>((function () {
    try { const raw = localStorage.getItem("awara_soul_woff_v1"); return raw ? JSON.parse(raw) : {} } catch (e) { return {} }
  })())
  const dragScreenRef = useRef<{ id: SoulSphereId; dx: number; dy: number } | null>(null)
  const camRef = useRef<{ cosY: number; sinY: number; cosP: number; sinP: number; R3: number }>({ cosY: 1, sinY: 0, cosP: 1, sinP: 0, R3: 1 })
  const growthRef = useRef(0)
  const particlesRef = useRef<LightParticle[]>([])
  // Per-sphere tally of absorbed particles (index 0 = soul heart, 1..4 = orbit).
  const absorbRef = useRef<number[]>([0, 0, 0, 0, 0])
  const soulRef = useRef(soul)
  const linkMetaRef = useRef<Record<string, { from: SoulSphereId; to: SoulSphereId; name: string }>>((function () {
    try { const raw = localStorage.getItem("awara_soul_linkmeta_v1"); return raw ? JSON.parse(raw) : {} } catch (e) { return {} }
  })())
  const dragRef = useRef<{ id: SoulSphereId; sx: number; sy: number; bx: number; by: number; moved: boolean } | null>(null)
  const lastDragEndRef = useRef<number>(0)
  const linksRef = useRef<string[]>([])
  const linkModeRef = useRef(false)
  const linkFromRef = useRef<SoulSphereId | null>(null)
  const revealStartRef = useRef<number[]>([-1, -1, -1, -1, -1])
  const birthStepRef = useRef<number | null>(null)
  const agentBgRef = useRef<HTMLDivElement | null>(null)
  // Drives the background card cross-fade (1 = shown, 0 = hidden during a swap).
  const cardFadeRef = useRef(1)
  // Refs for subsphere mini-spheres, keyed by subsphere id.
  const subRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  // Live mirror of the Spirits array so the animation loop (mounted once) can
  // draw their crowns on the canvas each frame.
  const spiritsRef = useRef([] as any[])
  // Visual-only glow bonus from attracted Spirits (does NOT change the mera/level).
  const spiritGlowRef = useRef(0)

  useEffect(function () { selectedRef.current = selected }, [selected])
  useEffect(function () { positionsRef.current = positions }, [positions])
  useEffect(function () { linksRef.current = links }, [links])
  useEffect(function () { linkModeRef.current = linkMode }, [linkMode])
  useEffect(function () { soulRef.current = soul }, [soul])
  useEffect(function () { birthStepRef.current = birthStep }, [birthStep])
  useEffect(function () { matrixRef.current = matrixState; saveMatrixState(matrixState) }, [matrixState])

  const liveMap = useMemo(function () {
    const m: Record<string, number> = {}
    for (const id of ALL_IDS) {
      const s = soul.state[id]
      m[id] = sphereLive(s.light || 0, s.subSpheres.length, s.journal.length, s.plans.length, s.media.length, s.social.length)
    }
    return m
  }, [soul.state])

  const overall = (liveMap.soul + liveMap.osnova + liveMap.serdce + liveMap.razum + liveMap.svyazi) / 5
  useEffect(function () { fxRef.current.overall = overall }, [overall])

  // animation loop: nebula + orbit positions
  useEffect(function () {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (starsRef.current.length === 0) starsRef.current = makeStars(260)
    let raf = 0
    // Displayed growth eases toward the real target each frame, so feeding the
    // soul (sun/moon, particles, heart bridge) pours light in smoothly instead
    // of snapping between levels. It lives across frames in this effect closure.
    let dispGrowth = growthRef.current
    // Per-link first-eligible timestamp (seconds): lets each saved link grow out
    // of its spheres only after the spheres are born. Resets on every mount.
    const linkSeen: Record<string, number> = {}
    // Eased per-sphere displayed light: each sphere's vessel gauge animates
    // smoothly toward its real light instead of jumping. Resets every mount.
    const litEase: Record<string, number> = {}
    const t0 = performance.now()
    const frame = function (now: number) {
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      const t = (now - t0) / 1000
      // Shared camera so the whole space moves as one.
      const zoom = zoomRef.current
      const dtS = lastTRef.current ? Math.min(0.05, t - lastTRef.current) : 0
      lastTRef.current = t
      // Auto-spin accumulates only when idle; it freezes the instant a sphere is
      // grabbed or selected (no snap-back), so a dragged sphere tracks the finger.
      // Current level (1..9) from the soul overall light drives the space state:
      // 1 = static + desaturated, 2 = colours return, 3+ = full volume + motion.
      const growthTarget = growthRef.current
      dispGrowth = dispGrowth + (growthTarget - dispGrowth) * Math.min(1, (dtS || 0.016) * 1.5)
      const growthL = dispGrowth
      const lvl = Math.max(1, Math.min(9, Math.floor(growthL * 9) + 1))
      const glowBoost = spiritGlowRef.current || 0
      // Nested (matryoshka) states: each level keeps the lower ones. 1 static+grey,
      // 2 colour returns, 3+ volume+motion, 7+ the spheres blaze gold (cosmic light).
      const sat = SAT_RAMP[Math.max(0, Math.min(8, lvl - 1))]
      // Mera 7..9: ease the SOUL SPHERES toward white-gold crystal (a little
      // less colour, more structure) - but ONLY the spheres. The canvas (cosmos,
      // stars, the whole space) keeps its normal colour, so nothing else whitens.
      const m79f = Math.max(0, Math.min(1, (lvl - 7) / 2))
      const goldSat = (1.18 - 0.32 * m79f).toFixed(2)
      const gold = lvl >= 7 ? "drop-shadow(0 0 14px rgba(255,238,190,0.95)) drop-shadow(0 0 30px rgba(212,175,55,0.55)) saturate(" + goldSat + ") brightness(1.22) contrast(1.12)" : sat
      if (canvasRef.current) canvasRef.current.style.filter = sat
      if (coreRef.current) coreRef.current.style.filter = gold
      for (let fi = 0; fi < orbitRefs.current.length; fi++) { const oe = orbitRefs.current[fi]; if (oe) oe.style.filter = gold }
      // Crystallization inside spheres + elite framing of spheres and the window.
      const cols = colorsRef.current
      if (coreRef.current && cols.soul) { coreRef.current.style.background = sphereBg(cols.soul, lvl, t); coreRef.current.style.boxShadow = sphereFrame(28 + glowBoost * 60, cols.soul, lvl) }
      for (let ci = 0; ci < ORBIT_IDS.length; ci++) { const oe2 = orbitRefs.current[ci]; const oc = cols[ORBIT_IDS[ci]]; if (oe2 && oc) { oe2.style.background = sphereBg(oc, lvl, t + ci * 0.7); oe2.style.boxShadow = sphereFrame(14 + glowBoost * 40, oc, lvl) } }
      if (frameRef.current) { frameRef.current.style.boxShadow = windowFrameShadow(lvl); frameRef.current.style.backgroundImage = windowFrameBg(lvl) }
      if (lvl >= 3 && !selectedRef.current && !dragRef.current) spinRef.current += dtS * 0.12
      const yaw = rotRef.current.yaw + spinRef.current
      const pitch = rotRef.current.pitch
      drawCosmos(ctx, w, h, t, Math.min(1, fxRef.current.overall + glowBoost), starsRef.current, yaw, pitch, zoom)
      // 3D ring uses the same camera.
      const baseR = Math.min(w, h) * 0.30
      const R3 = baseR * zoom
      const focal = Math.min(w, h) * 0.95
      const cosP = Math.cos(pitch)
      const sinP = Math.sin(pitch)
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      // Capture the live camera so a released drag can be turned into a world offset.
      camRef.current = { cosY: cosY, sinY: sinY, cosP: cosP, sinP: sinP, R3: R3 }
      const sp: Record<string, { x: number; y: number }> = {}
      // The Soul lives at the heart: a gentle idle drift plus parallax with rotation,
      // so it breathes inside the cosmos instead of sitting as a dead pivot.
      const swayX = (Math.sin(t * 0.4) * 0.5 + Math.sin(yaw)) * baseR * 0.06 * zoom
      const swayY = (Math.cos(t * 0.33) * 0.5 - Math.sin(pitch)) * baseR * 0.055 * zoom
      sp.soul = { x: w / 2 + swayX, y: h / 2 + swayY }
      const corePulse = 1 + Math.sin(t * 1.4) * 0.05
      // Birth reveal: spheres are born one at a time. In the guided first-entry
      // tutorial (birthStepRef) each sphere waits until the player has read its
      // card; otherwise they rise in a slow automatic cascade so a child can watch
      // each one arrive. revealStartRef stores the moment each sphere became born.
      const rs = revealStartRef.current
      const bStep = birthStepRef.current
      const AUTO_AT = [0, 0.7, 1.5, 2.3, 3.1]
      const allowed = bStep == null ? 5 : Math.min(5, bStep + 1)
      for (let k = 0; k < 5; k++) {
        const okAuto = bStep == null && t >= AUTO_AT[k]
        const okGate = bStep != null && k < allowed
        if ((okAuto || okGate) && rs[k] < 0) rs[k] = t
      }
      const bornFrac = function (k: number): number {
        const st0 = rs[k]
        if (st0 < 0) return 0
        const pp = clamp01((t - st0) / 0.9)
        return pp * pp * (3 - 2 * pp)
      }
      const eCore = bornFrac(0)
      if (coreRef.current) {
        coreRef.current.style.transform = "translate(-50%,-50%) translate(" + swayX.toFixed(1) + "px," + swayY.toFixed(1) + "px) scale(" + (zoom * corePulse * (0.3 + eCore * 0.7)).toFixed(3) + ")"
        coreRef.current.style.opacity = eCore.toFixed(3)
      }
      // Background agent card fades in on levels 7-9 (discrete steps so the CSS
      // transition handles the fade). Level is derived locally from growth.
      if (agentBgRef.current) {
        const gl = Math.max(1, Math.min(9, Math.floor(growthL * 9) + 1))
        // Active-matrix agents appear faintly from the first meras and brighten as
        // the soul rises (~0.06 at mera 1 -> ~0.3 at mera 9).
        const base = 0.06 + (gl - 1) * 0.03
        const ab = (base * cardFadeRef.current).toFixed(3)
        if (agentBgRef.current.style.opacity !== ab) agentBgRef.current.style.opacity = ab
        // Greyscale + dim on low meras, full colour higher up (mirrors the cosmos).
        const af = SAT_RAMP[Math.max(0, Math.min(8, gl - 1))]
        if (agentBgRef.current.style.filter !== af) agentBgRef.current.style.filter = af
      }
      // Parent screen positions (offset from centre + depth + birth) so subspheres
      // can ride just outside each parent sphere in this same frame.
      const parentScreen: Record<string, { ox: number; oy: number; depth: number; born: number }> = {}
      parentScreen.soul = { ox: swayX, oy: swayY, depth: zoom, born: eCore }
      for (let i = 0; i < ORBIT_IDS.length; i++) {
        const el = orbitRefs.current[i]
        // Each sphere can be moved around the globe (its own azimuth + elevation),
        // yet it stays in the same 3D world and turns with the shared camera.
        const off = offRef.current[ORBIT_IDS[i]] || { az: 0, el: 0 }
        const ang = (ORBIT_BASE_DEG[i] * Math.PI) / 180 + off.az
        const ce = Math.cos(off.el)
        const ux = ce * Math.cos(ang)
        const uz = ce * Math.sin(ang)
        const uy = Math.sin(off.el)
        const px = ux * cosY - uz * sinY
        const pz = ux * sinY + uz * cosY
        const x3 = px * R3
        const wy3 = uy * R3
        const wz3 = pz * R3
        const y2 = wy3 * cosP - wz3 * sinP
        const z2 = wy3 * sinP + wz3 * cosP
        const depth = focal / (focal + z2)
        let ox = x3 * depth
        let oy = y2 * depth
        // World-space offset (set when a drag is released) rides the camera, so the
        // sphere keeps its volume and rotates together with the whole space.
        const wo = wOffRef.current[ORBIT_IDS[i]]
        if (wo) {
          const wpx = wo.x * cosY - wo.z * sinY
          const wpz = wo.x * sinY + wo.z * cosY
          const wy2 = wo.y * cosP - wpz * sinP
          ox = ox + wpx * R3 * depth
          oy = oy + wy2 * R3 * depth
        }
        // While actively dragging, the sphere moves flat in the screen plane (1:1).
        const ds = dragScreenRef.current
        if (ds && ds.id === ORBIT_IDS[i]) {
          ox = ox + ds.dx
          oy = oy + ds.dy
        }
        sp[ORBIT_IDS[i]] = { x: w / 2 + ox, y: h / 2 + oy }
        // Birth reveal: orbit sphere i is reveal index i+1 (the heart is 0). It
        // eases in once allowed - either the auto cascade or after its card.
        const ae = bornFrac(i + 1)
        parentScreen[ORBIT_IDS[i]] = { ox: ox, oy: oy, depth: depth, born: ae }
        if (el) {
          el.style.transform = "translate(" + ox + "px," + oy + "px) scale(" + (depth * (0.25 + ae * 0.75)).toFixed(3) + ")"
          el.style.opacity = (clamp01(0.4 + depth * 0.5) * ae).toFixed(3)
          el.style.zIndex = z2 < 0 ? "4" : "2"
        }
      }
      // Subspheres: real but smaller spheres riding just outside their parent.
      const subApi = soulRef.current
      if (subApi) {
        const pidsS: SoulSphereId[] = ["soul", "osnova", "serdce", "razum", "svyazi"]
        for (let pi = 0; pi < pidsS.length; pi++) {
          const pid = pidsS[pi]
          const ps = parentScreen[pid]
          if (!ps) continue
          const subs = subApi.state[pid].subSpheres
          const n = subs.length
          const baseR = pid === "soul" ? 88 : 44
          for (let k = 0; k < n; k++) {
            const refEl = subRefs.current[subs[k].id]
            if (!refEl) continue
            // Real 3D orbit: grains ride a ring in the horizontal plane, tilted by
            // the camera pitch and revolved by time + world yaw, so they pass in
            // front of and behind the mother sphere instead of sitting flat.
            const a = (k / (n < 1 ? 1 : n)) * Math.PI * 2 + t * 0.22 + yaw
            const ringR = baseR * ps.depth
            const lx = Math.cos(a)
            const lz = Math.sin(a)
            const ez = lz * cosP
            const sx = ps.ox + lx * ringR
            // Each grain rides its OWN tilted orbit at its own speed, so the
            // rings are no longer parallel: per-index inclination + ascending
            // node + speed give every subsphere a distinct 3D plane that still
            // turns inside the shared camera view (cosP/sinP).
            const spd = 0.12 + (k % 3) * 0.05
            const inc = 0.45 + (k % 4) * 0.4
            const node = k * 1.7
            const a2 = (k / (n < 1 ? 1 : n)) * Math.PI * 2 + t * spd + yaw + k * 0.6
            const ci = Math.cos(inc)
            const si = Math.sin(inc)
            const cn = Math.cos(node)
            const sn = Math.sin(node)
            const bx3 = Math.cos(a2)
            const by3 = Math.sin(a2) * ci
            const bz3 = Math.sin(a2) * si
            const ox3 = bx3 * cn - bz3 * sn
            const oz3 = bx3 * sn + bz3 * cn
            const fz = by3 * sinP + oz3 * cosP
            const fy = by3 * cosP - oz3 * sinP
            const sx2 = ps.ox + ox3 * ringR
            const sy2 = ps.oy + fy * ringR
            const dsc = ps.depth * 0.92 * (1 + fz * 0.32)
            refEl.style.transform = "translate(" + sx2.toFixed(1) + "px," + sy2.toFixed(1) + "px) scale(" + dsc.toFixed(3) + ")"
            refEl.style.opacity = (clamp01(0.35 + ps.depth * 0.4 + fz * 0.25) * ps.born).toFixed(3)
            refEl.style.zIndex = fz >= 0 ? "5" : "1"
            // Subspheres mirror the mother sphere's look: same crystallized fill,
            // elite frame and gold bloom, just smaller. Their own light can push
            // their level above the mother's, so a fed grain crystallizes further.
            const subColor = subs[k].color || cols[pid]
            if (subColor) {
              const subLit = clamp01(subs[k].light || 0)
              const subLvl = Math.max(lvl, Math.max(1, Math.min(9, Math.floor(subLit * 9) + 1)))
              refEl.style.background = sphereBg(subColor, subLvl, t + k * 0.5)
              refEl.style.boxShadow = sphereFrame(9, subColor, subLvl)
              refEl.style.filter = subLvl >= 7 ? gold : sat
            }
          }
        }
      }
      drawParticles(ctx, w, h, sp, particlesRef.current, t, dtS || 0.016, Math.min(1, growthL + glowBoost), absorbRef.current, lvl)
      drawAuras(ctx, sp, t, lvl, Math.min(1, growthL + glowBoost), zoom, spiritsRef.current)
      drawLinks(ctx, sp, linksRef.current, t, parentScreen, linkSeen, lvl, Math.min(1, growthL + glowBoost))
      // Smooth each sphere's displayed light, then draw its vessel fill gauge.
      const liveApi = soulRef.current
      for (let li = 0; li < ALL_IDS.length; li++) {
        const lid = ALL_IDS[li]
        const lt = clamp01((liveApi.state[lid] && liveApi.state[lid].light) || 0)
        litEase[lid] = litEase[lid] === undefined ? lt : litEase[lid] + (lt - litEase[lid]) * Math.min(1, (dtS || 0.016) * 2)
      }
      drawFillMeters(ctx, sp, parentScreen, litEase, cols, t)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return function () { cancelAnimationFrame(raf) }
  }, [])

  // toast auto-clear
  useEffect(function () {
    if (!toast) return
    const id = setTimeout(function () { setToast("") }, 2200)
    return function () { clearTimeout(id) }
  }, [toast])

  // Iskra bridge: a mounted AI agent can answer the gathered summary with richer
  // text by dispatching awara:iskra-result; swap it straight into the panel.
  useEffect(function () {
    const onRes = function (e: Event) {
      const d = ((e as CustomEvent).detail || {}) as any
      if (d && typeof d.text === "string" && d.text.length > 0) setIskraText(d.text)
    }
    window.addEventListener("awara:iskra-result", onRes as any)
    return function () { window.removeEventListener("awara:iskra-result", onRes as any) }
  }, [])

  // Background agent card slowly cycles to the next one every 30s. cardFadeRef
  // fades the layer out, then the image swaps and fades back via its CSS transition.
  useEffect(function () {
    const iv = setInterval(function () {
      cardFadeRef.current = 0
      setTimeout(function () {
        setAgentCard(function (prev) {
          const ms = matrixRef.current
          const lvl = Math.max(1, Math.min(9, Math.floor(growthRef.current * 9) + 1))
          const pool = matrixCardPool(activeMatrix(ms), lvl)
          if (pool.length === 0) return prev
          const idx = pool.indexOf(prev)
          return pool[(idx + 1) % pool.length]
        })
        cardFadeRef.current = 1
      }, 1700)
    }, 90000)
    return function () { clearInterval(iv) }
  }, [])

  // Absorbed particles slowly nourish each sphere's light (growing, not grinding).
  // Flushed every 2s. Particle feed alone tops out at 0.85; the final bloom
  // (mer 7..9 gold) still requires real content the player adds by hand.
  useEffect(function () {
    const iv = setInterval(function () {
      const acc = absorbRef.current
      const total = acc[0] + acc[1] + acc[2] + acc[3] + acc[4]
      if (total <= 0) return
      const api = soulRef.current
      const st = api.state
      const ids: SoulSphereId[] = ["soul", "osnova", "serdce", "razum", "svyazi"]
      const next: Record<string, number> = {}
      for (let i = 0; i < ids.length; i++) {
        const cur = st[ids[i]].light || 0
        const gain = Math.min(0.02, acc[i] * 0.0006)
        next[ids[i]] = cur >= 0.85 ? cur : Math.min(0.85, cur + gain)
      }
      absorbRef.current = [0, 0, 0, 0, 0]
      api.setLight(next as any)
    }, 2000)
    return function () { clearInterval(iv) }
  }, [])

  // Heart bridge: lets the Tigel/experience agent inject real Light into the soul.
  //   window.AwaraHeart.light(mer, q, sphere, count)
  //   window.dispatchEvent(new CustomEvent("awara:light", { detail: { mer, q, sphere, count } }))
  // mer 0..8 = dimension/chakra, q 0..1 = quality, sphere 0..3 (orbit) or -1 (heart).
  useEffect(function () {
    const wAny = window as any
    if (!wAny.AwaraHeart) wAny.AwaraHeart = {}
    wAny.AwaraHeart.light = function (mer: number, q: number, sphere: number, count: number) { pushLight(mer, q, sphere, count) }
    const onLight = function (e: Event) {
      const d = ((e as CustomEvent).detail || {}) as any
      pushLight(d.mer || 0, typeof d.q === "number" ? d.q : 0.85, typeof d.sphere === "number" ? d.sphere : -1, d.count || 1)
    }
    window.addEventListener("awara:light", onLight as any)
    return function () { window.removeEventListener("awara:light", onLight as any) }
  }, [])

  // Maya / illusion: gently fade every sphere's light over real elapsed time
  // (about a few percent per day). Catches up on mount and keeps nudging while
  // open. Timestamp only advances when a real change is applied, so fractional
  // decay accumulates instead of being lost.
  useEffect(function () {
    const applyDecay = function () {
      let last = 0
      try { last = parseInt(localStorage.getItem(MAYA_KEY) || "0", 10) || 0 } catch (e) { last = 0 }
      const now = Date.now()
      if (!last) { try { localStorage.setItem(MAYA_KEY, String(now)) } catch (e) { /* noop */ } return }
      const days = (now - last) / 86400000
      if (days <= 0) return
      const factor = Math.pow(1 - MAYA_DECAY_PER_DAY, days)
      if (factor >= 0.99999) return
      const api = soulRef.current
      const st = api.state
      const ids: SoulSphereId[] = ["soul", "osnova", "serdce", "razum", "svyazi"]
      const next: Record<string, number> = {}
      let changed = false
      for (let i = 0; i < ids.length; i++) {
        const cur = clamp01(st[ids[i]].light || 0)
        const nv = clamp01(cur * factor)
        next[ids[i]] = nv
        if (Math.abs(nv - cur) > 0.0001) changed = true
      }
      if (!changed) return
      api.setLight(next as any)
      try { localStorage.setItem(MAYA_KEY, String(now)) } catch (e) { /* noop */ }
    }
    applyDecay()
    const iv = setInterval(applyDecay, 600000)
    return function () { clearInterval(iv) }
  }, [])

  const navigate = useCallback(function (dir: NavDir) {
    if (dir === "up") { window.dispatchEvent(new Event("awara:open-cosmos")); return }
    if (dir === "right") { window.dispatchEvent(new Event("awara:soul-close")); return }
    const label = dir === "down" ? txt.nav.down : txt.nav.left
    setToast(label + " \u2014 " + txt.nav.soon)
  }, [])

  // arrow keys (only when no panel open and not typing)
  useEffect(function () {
    const onKey = function (e: KeyboardEvent) {
      if (selectedRef.current) return
      const ae = document.activeElement as HTMLElement | null
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return
      if (e.key === "ArrowUp") navigate("up")
      else if (e.key === "ArrowDown") navigate("down")
      else if (e.key === "ArrowLeft") navigate("left")
      else if (e.key === "ArrowRight") navigate("right")
    }
    window.addEventListener("keydown", onKey)
    return function () { window.removeEventListener("keydown", onKey) }
  }, [navigate])

  // ---- 3D view: drag background to rotate, wheel/pinch to zoom ----
  const isBackground = useCallback(function (t: EventTarget | null): boolean {
    return t === canvasRef.current || t === stageRef.current
  }, [])

  const onStagePointerDown = useCallback(function (e: React.PointerEvent) {
    if (selectedRef.current) return
    if (!isBackground(e.target)) return
    bgPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (bgPointersRef.current.size >= 2) {
      const pts = Array.from(bgPointersRef.current.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      pinchRef.current = { dist: Math.hypot(dx, dy) || 1, zoom: zoomRef.current }
      bgRotRef.current = null
    } else {
      bgRotRef.current = { sx: e.clientX, sy: e.clientY, yaw: rotRef.current.yaw, pitch: rotRef.current.pitch }
      pinchRef.current = null
    }
  }, [isBackground])

  const onStagePointerMove = useCallback(function (e: React.PointerEvent) {
    const map = bgPointersRef.current
    if (!map.has(e.pointerId)) return
    map.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (map.size >= 2 && pinchRef.current) {
      const pts = Array.from(map.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const dist = Math.hypot(dx, dy) || 1
      const z = pinchRef.current.zoom * (dist / pinchRef.current.dist)
      zoomRef.current = Math.max(0.5, Math.min(2.6, z))
      return
    }
    const b = bgRotRef.current
    if (b) {
      rotRef.current.yaw = b.yaw + (e.clientX - b.sx) * 0.01
      rotRef.current.pitch = Math.max(-1.2, Math.min(1.2, b.pitch + (e.clientY - b.sy) * 0.01))
    }
  }, [])

  const onStagePointerUp = useCallback(function (e: React.PointerEvent) {
    const b = bgRotRef.current
    bgPointersRef.current.delete(e.pointerId)
    if (bgPointersRef.current.size < 2) pinchRef.current = null
    if (bgPointersRef.current.size === 0) bgRotRef.current = null
    // A tap (not a drag) on the cosmos opens a Spirit crown drawn on the canvas.
    if (b && spiritHits.length > 0) {
      const moved = Math.abs(e.clientX - b.sx) + Math.abs(e.clientY - b.sy)
      if (moved < 7) {
        const stage = stageRef.current
        const sr = stage ? stage.getBoundingClientRect() : null
        const px = sr ? e.clientX - sr.left : e.clientX
        const py = sr ? e.clientY - sr.top : e.clientY
        for (let hi = 0; hi < spiritHits.length; hi++) {
          const hh = spiritHits[hi]
          if (Math.hypot(px - hh.x, py - hh.y) <= hh.r) { setSpiritOpenId(hh.id); break }
        }
      }
    }
  }, [])

  const onStageWheel = useCallback(function (e: React.WheelEvent) {
    const z = zoomRef.current * (1 - e.deltaY * 0.0012)
    zoomRef.current = Math.max(0.5, Math.min(2.6, z))
  }, [])

  const zoomBy = useCallback(function (f: number) {
    zoomRef.current = Math.max(0.5, Math.min(2.6, zoomRef.current * f))
  }, [])

  const resetView = useCallback(function () {
    rotRef.current = { yaw: 0, pitch: 0.5 }
    zoomRef.current = 1
    // Also return moved spheres to their default places on the ring.
    positionsRef.current = {}
    setPositions({})
    offRef.current = {}
    panRef.current = { x: 0, y: 0 }
    try { localStorage.removeItem("awara_soul_positions_v1") } catch (e) { /* noop */ }
    try { localStorage.removeItem("awara_soul_offsets_v1") } catch (e) { /* noop */ }
    try { localStorage.removeItem("awara_soul_pan_v1") } catch (e) { /* noop */ }
  }, [])

  // Switch the active matrix (culture lens): cycle to the next of the 33 and add
  // it to the chosen set. The cycling pool follows matrixRef on its next swap; we
  // also swap the shown card now so the change reads at once.
  const cycleMatrix = useCallback(function () {
    const prev = matrixRef.current
    const cur = activeMatrix(prev)
    let idx = 0
    for (let i = 0; i < MATRICES.length; i++) { if (MATRICES[i].slug === cur) idx = i }
    const next = MATRICES[(idx + 1) % MATRICES.length].slug
    const chosen = prev.chosen.indexOf(next) >= 0 ? prev.chosen : prev.chosen.concat([next])
    const lvl = Math.max(1, Math.min(9, Math.floor(growthRef.current * 9) + 1))
    const pool = matrixCardPool(next, lvl)
    if (pool.length > 0) setAgentCard(pool[0])
    setMatrixState({ chosen: chosen, active: next, passed: prev.passed })
  }, [])

  const selectSphere = useCallback(function (id: SoulSphereId) {
    setSelected(id)
    setTab("subs")
    setSubInput("")
    setNoteInput("")
    setPlanInput("")
    setLinkInput("")
    setMediaCaption("")
    setSocialUrl("")
    setSocialLabel("")
  }, [])

  const closePanel = useCallback(function () { setSelected(null) }, [])

  // ---- enter / leave the inside of a sphere (zoom into it; subspheres orbit it) ----
  const enterSphere = useCallback(function (id: SoulSphereId) { setSelected(null); setInside(id) }, [])
  const exitInside = useCallback(function () { setInside(null) }, [])

  // ---- enter / leave a subsphere (its own entity, still tied to its parent sphere) ----
  const enterSub = useCallback(function (pid: SoulSphereId, subId: string) { setInsideSub({ pid: pid, subId: subId }) }, [])
  const exitInsideSub = useCallback(function () { setInsideSub(null) }, [])

  // ---- enter / leave a dimension space ----
  const openDim = useCallback(function (i: number) { setDimOpen(i) }, [])
  const closeDim = useCallback(function () { setDimOpen(null) }, [])

  // ---- onboarding (tutorial) ----
  const openOnb = useCallback(function () { setOnbStep(0) }, [])
  const finishOnb = useCallback(function () {
    setOnbStep(null)
    try { localStorage.setItem("awara_soul_onboarded_v1", "1") } catch (e) { /* noop */ }
  }, [])
  const nextOnb = useCallback(function () {
    setOnbStep(function (v) {
      const steps = ((txt as any).onboard && (txt as any).onboard.steps) || []
      const cur = v == null ? 0 : v
      if (cur + 1 >= steps.length) {
        try { localStorage.setItem("awara_soul_onboarded_v1", "1") } catch (e) { /* noop */ }
        return null
      }
      return cur + 1
    })
  }, [])

  // ---- guided birth (slow first-entry reveal, one sphere per read) ----
  const nextBirth = useCallback(function () {
    setBirthStep(function (v) {
      const arr = ((txt as any).onboard && (txt as any).onboard.birth) || []
      const cur = v == null ? 0 : v
      if (cur + 1 >= arr.length) {
        try { localStorage.setItem("awara_soul_onboarded_v1", "1") } catch (e) { /* noop */ }
        return null
      }
      return cur + 1
    })
  }, [])
  const skipBirth = useCallback(function () {
    setBirthStep(null)
    try { localStorage.setItem("awara_soul_onboarded_v1", "1") } catch (e) { /* noop */ }
  }, [])
  const toggleTutorial = useCallback(function () {
    setTutorialOn(function (v) {
      const nv = !v
      try { localStorage.setItem("awara_soul_tutorial_enabled_v1", nv ? "1" : "0") } catch (e) { /* noop */ }
      return nv
    })
  }, [])

  // ---- link spheres together ----
  const toggleLinkMode = useCallback(function () {
    const nv = !linkModeRef.current
    linkModeRef.current = nv
    setLinkMode(nv)
    linkFromRef.current = null
    setToast(nv ? txt.link.pick : txt.link.cancel)
  }, [])

  const handleLinkTap = useCallback(function (id: SoulSphereId) {
    const from = linkFromRef.current
    if (!from) { linkFromRef.current = id; setToast(txt.link.pick2); return }
    if (from === id) { linkFromRef.current = null; setToast(txt.link.cancel); return }
    const key = linkKey(from, id)
    const exists = linksRef.current.indexOf(key) >= 0
    if (exists) {
      delete linkMetaRef.current[key]
    } else {
      let nm = ""
      try { nm = window.prompt((txt.link as any).name || "", "") || "" } catch (e) { nm = "" }
      linkMetaRef.current[key] = { from: from, to: id, name: nm }
    }
    try { localStorage.setItem("awara_soul_linkmeta_v1", JSON.stringify(linkMetaRef.current)) } catch (e) { /* noop */ }
    setLinks(function (prev) {
      const next = exists ? prev.filter(function (k) { return k !== key }) : prev.concat([key])
      linksRef.current = next
      try { localStorage.setItem("awara_soul_links_v1", JSON.stringify(next)) } catch (e) { /* noop */ }
      return next
    })
    linkFromRef.current = null
    setToast(exists ? txt.link.removed : txt.link.created)
  }, [])

  const removeLink = useCallback(function (key: string) {
    delete linkMetaRef.current[key]
    try { localStorage.setItem("awara_soul_linkmeta_v1", JSON.stringify(linkMetaRef.current)) } catch (e) { /* noop */ }
    setLinks(function (prev) {
      const next = prev.filter(function (k) { return k !== key })
      linksRef.current = next
      try { localStorage.setItem("awara_soul_links_v1", JSON.stringify(next)) } catch (e) { /* noop */ }
      return next
    })
    setToast(txt.link.removed)
  }, [])

  const setOrbitRef = useCallback(function (i: number) {
    return function (el: HTMLButtonElement | null) { orbitRefs.current[i] = el }
  }, [])

  const setSubRef = useCallback(function (id: string) {
    return function (el: HTMLButtonElement | null) { subRefs.current[id] = el }
  }, [])

  // ---- sphere drag (mouse hold + touch via Pointer Events) ----
  const centerOffset = useCallback(function (el: HTMLElement): { x: number; y: number } {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const sr = stage.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2 - (sr.left + sr.width / 2), y: r.top + r.height / 2 - (sr.top + sr.height / 2) }
  }, [])

  const onSpherePointerDown = useCallback(function (id: SoulSphereId) {
    return function (e: React.PointerEvent) {
      const el = e.currentTarget as HTMLElement
      try { el.setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      if (id === "soul") {
        // Grabbing the Soul turns the whole cosmos around its heart (no sliding).
        dragRef.current = { id: id, sx: e.clientX, sy: e.clientY, bx: rotRef.current.yaw, by: rotRef.current.pitch, moved: false }
      } else {
        // Grabbing an orbit sphere drags it flat in the screen plane (camera frozen).
        dragRef.current = { id: id, sx: e.clientX, sy: e.clientY, bx: 0, by: 0, moved: false }
        dragScreenRef.current = { id: id, dx: 0, dy: 0 }
      }
    }
  }, [])

  const onSpherePointerMove = useCallback(function (e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
    if (!d.moved) return
    if (d.id === "soul") {
      rotRef.current.yaw = d.bx + dx * 0.01
      rotRef.current.pitch = Math.max(-1.2, Math.min(1.2, d.by + dy * 0.01))
    } else {
      // Strict in-plane tracking: the sphere follows the finger by raw pixels.
      dragScreenRef.current = { id: d.id, dx: dx, dy: dy }
    }
  }, [])

  const onSpherePointerUp = useCallback(function (id: SoulSphereId) {
    return function (e: React.PointerEvent) {
      const el = e.currentTarget as HTMLElement
      try { el.releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
      const d = dragRef.current
      dragRef.current = null
      if (!d) return
      if (!d.moved) { if (linkModeRef.current) handleLinkTap(id); else selectSphere(id); return }
      lastDragEndRef.current = Date.now()
      if (d.id !== "soul") {
        // Bake the flat screen drag into a world offset so the sphere rejoins the volume.
        const ds = dragScreenRef.current
        const cam = camRef.current
        if (ds && cam.R3) {
          const kx = ds.dx / cam.R3
          const ky = ds.dy / cam.R3
          const wdx = cam.cosY * kx - cam.sinY * cam.sinP * ky
          const wdy = cam.cosP * ky
          const wdz = -cam.sinY * kx - cam.cosY * cam.sinP * ky
          const prev = wOffRef.current[d.id] || { x: 0, y: 0, z: 0 }
          wOffRef.current[d.id] = { x: prev.x + wdx, y: prev.y + wdy, z: prev.z + wdz }
        }
        dragScreenRef.current = null
        try { localStorage.setItem("awara_soul_woff_v1", JSON.stringify(wOffRef.current)) } catch (err) { /* noop */ }
      }
    }
  }, [selectSphere, handleLinkTap])

  const onPickFile = useCallback(async function (id: SoulSphereId, kind: MediaKind, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const data = await readFileAsDataUrl(f)
    soul.addMedia(id, kind, data, mediaCaption)
    setMediaCaption("")
    e.target.value = ""
  }, [soul, mediaCaption])

  function renderSubs(id: SoulSphereId) {
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    return (
      <div>
        <div style={ROW_WRAP}>
          <input
            style={INPUT_STYLE}
            value={subInput}
            placeholder={txt.subs.placeholder}
            onChange={function (e) { setSubInput(e.target.value) }}
            onKeyDown={function (e) { if (e.key === "Enter") { soul.addSubSphere(id, subInput); setSubInput("") } }}
          />
          <button type="button" style={actionBtn(color)} onClick={function () { soul.addSubSphere(id, subInput); setSubInput("") }}>
            {"+ " + txt.subs.add}
          </button>
        </div>
        {s.subSpheres.length === 0 ? <div style={EMPTY_NOTE}>{txt.subs.empty}</div> : null}
        <div style={LIST_WRAP}>
          {s.subSpheres.map(function (sub) {
            return (
              <div key={sub.id} style={PLAN_ITEM}>
                <span style={SUB_TEXT}>{sub.text}</span>
                <button type="button" style={DEL_BTN} onClick={function () { soul.removeSubSphere(id, sub.id) }}>{"\u2715"}</button>
              </div>
            )
          })}
        </div>
        <button type="button" style={RESET_BTN} onClick={function () { if (window.confirm(txt.reset + "?")) { soul.resetSphere(id); closePanel() } }}>{txt.reset}</button>
      </div>
    )
  }

  function renderJournal(id: SoulSphereId) {
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    return (
      <div>
        <div style={TYPE_ROW}>
          {JOURNAL_TYPES.map(function (jt) {
            return (
              <button key={jt} type="button" style={chipStyle(noteType === jt, color)} onClick={function () { setNoteType(jt) }}>
                {JT_TXT[jt]}
              </button>
            )
          })}
        </div>
        <textarea
          style={TEXTAREA_STYLE}
          value={noteInput}
          placeholder={txt.journal.placeholder}
          onChange={function (e) { setNoteInput(e.target.value) }}
        />
        <div style={ROW_WRAP}>
          <button type="button" style={actionBtn(color)} onClick={function () { soul.addJournal(id, noteType, noteInput); setNoteInput("") }}>
            {txt.journal.add}
          </button>
        </div>
        {s.journal.length === 0 ? <div style={EMPTY_NOTE}>{txt.journal.empty}</div> : null}
        <div style={LIST_WRAP}>
          {s.journal.map(function (en) {
            return (
              <div key={en.id} style={CARD_STYLE}>
                <div style={CARD_HEAD}>
                  <span style={CARD_META}>{JT_TXT[en.type]}</span>
                  <button type="button" style={DEL_BTN} onClick={function () { soul.deleteJournal(id, en.id) }}>{"\u2715"}</button>
                </div>
                <div style={CARD_BODY}>{en.body}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderPlans(id: SoulSphereId) {
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    return (
      <div>
        <div style={ROW_WRAP}>
          <input
            style={INPUT_STYLE}
            value={planInput}
            placeholder={txt.plans.placeholder}
            onChange={function (e) { setPlanInput(e.target.value) }}
            onKeyDown={function (e) { if (e.key === "Enter") { soul.addPlan(id, planInput); setPlanInput("") } }}
          />
          <button type="button" style={actionBtn(color)} onClick={function () { soul.addPlan(id, planInput); setPlanInput("") }}>
            {txt.plans.add}
          </button>
        </div>
        {s.plans.length === 0 ? <div style={EMPTY_NOTE}>{txt.plans.empty}</div> : null}
        <div style={LIST_WRAP}>
          {s.plans.map(function (p) {
            return (
              <div key={p.id} style={PLAN_ITEM}>
                <button type="button" onClick={function () { soul.togglePlan(id, p.id) }} style={PLAN_CHECK}>
                  {p.done ? "\u2714" : ""}
                </button>
                <span style={PLAN_TEXT}>{p.text}</span>
                <button type="button" style={DEL_BTN} onClick={function () { soul.deletePlan(id, p.id) }}>{"\u2715"}</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderMedia(id: SoulSphereId) {
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    return (
      <div>
        <input type="file" accept="image/*" ref={imgRef} style={HIDDEN_INPUT} onChange={function (e) { onPickFile(id, "image", e) }} />
        <input type="file" accept="video/*" ref={vidRef} style={HIDDEN_INPUT} onChange={function (e) { onPickFile(id, "video", e) }} />
        <input type="file" accept="audio/*" ref={audRef} style={HIDDEN_INPUT} onChange={function (e) { onPickFile(id, "audio", e) }} />
        <div style={ROW_WRAP}>
          <button type="button" style={actionBtn(color)} onClick={function () { if (imgRef.current) imgRef.current.click() }}>{MEDIA_TXT.image}</button>
          <button type="button" style={actionBtn(color)} onClick={function () { if (vidRef.current) vidRef.current.click() }}>{MEDIA_TXT.video}</button>
          <button type="button" style={actionBtn(color)} onClick={function () { if (audRef.current) audRef.current.click() }}>{MEDIA_TXT.audio}</button>
        </div>
        <input
          style={INPUT_STYLE}
          value={mediaCaption}
          placeholder={txt.media.caption}
          onChange={function (e) { setMediaCaption(e.target.value) }}
        />
        <div style={ROW_WRAP}>
          <input
            style={INPUT_STYLE}
            value={linkInput}
            placeholder={txt.media.linkPlaceholder}
            onChange={function (e) { setLinkInput(e.target.value) }}
            onKeyDown={function (e) { if (e.key === "Enter") { soul.addMedia(id, "link", linkInput, mediaCaption); setLinkInput(""); setMediaCaption("") } }}
          />
          <button type="button" style={actionBtn(color)} onClick={function () { soul.addMedia(id, "link", linkInput, mediaCaption); setLinkInput(""); setMediaCaption("") }}>
            {txt.media.addLink}
          </button>
        </div>
        {s.media.length === 0 ? <div style={EMPTY_NOTE}>{txt.media.empty}</div> : null}
        <div style={LIST_WRAP}>
          {s.media.map(function (m) {
            return (
              <div key={m.id} style={CARD_STYLE}>
                <div style={CARD_HEAD}>
                  <span style={CARD_META}>{MEDIA_TXT[m.kind]}</span>
                  <button type="button" style={DEL_BTN} onClick={function () { soul.removeMedia(id, m.id) }}>{"\u2715"}</button>
                </div>
                {m.kind === "image" ? <img src={m.data} alt={m.caption || ""} style={MEDIA_THUMB} /> : null}
                {m.kind === "video" ? <video src={m.data} controls style={MEDIA_THUMB} /> : null}
                {m.kind === "audio" ? <audio src={m.data} controls style={AUDIO_STYLE} /> : null}
                {m.kind === "link" ? <a href={m.data} target="_blank" rel="noreferrer" style={LINK_STYLE}>{m.caption || m.data}</a> : null}
                {m.caption && m.kind !== "link" ? <div style={CAPTION_STYLE}>{m.caption}</div> : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderSocial(id: SoulSphereId) {
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    return (
      <div>
        <input
          style={INPUT_STYLE}
          value={socialUrl}
          placeholder={txt.social.urlPlaceholder}
          onChange={function (e) { setSocialUrl(e.target.value) }}
        />
        <div style={ROW_WRAP}>
          <input
            style={INPUT_STYLE}
            value={socialLabel}
            placeholder={txt.social.labelPlaceholder}
            onChange={function (e) { setSocialLabel(e.target.value) }}
          />
          <button type="button" style={actionBtn(color)} onClick={function () { soul.addSocial(id, socialUrl, socialLabel); setSocialUrl(""); setSocialLabel("") }}>
            {"+ " + txt.social.add}
          </button>
        </div>
        {s.social.length === 0 ? <div style={EMPTY_NOTE}>{txt.social.empty}</div> : null}
        <div style={LIST_WRAP}>
          {s.social.map(function (l) {
            return (
              <div key={l.id} style={PLAN_ITEM}>
                <a href={l.url} target="_blank" rel="noreferrer" style={SOCIAL_LINK}>{l.label || l.url}</a>
                <button type="button" style={DEL_BTN} onClick={function () { soul.removeSocial(id, l.id) }}>{"\u2715"}</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderStyleTab(id: SoulSphereId) {
    const SOUND_FREQS = [396, 417, 528, 639, 741, 852, 963]
    const s = soul.state[id]
    const st = s.style || {}
    const color = dispColorOf(id, st.color)
    const size = st.size || 46
    const glow = typeof st.glow === "number" ? st.glow : 40
    const sound = typeof (st as any).sound === "number" ? (st as any).sound : 528
    const quality = typeof (st as any).quality === "number" ? (st as any).quality : 1
    if (soulLevel < 3) {
      return (
        <div>
          <div style={EMPTY_NOTE}>{(txt.style as any).locked}</div>
        </div>
      )
    }
    return (
      <div>
        <div style={STYLE_LABEL}>
          <span>{txt.style.color}</span>
          <input type="color" value={color} onChange={function (e) { soul.setStyle(id, { color: e.target.value }) }} style={COLOR_INPUT} />
        </div>
        <div style={STYLE_LABEL}>
          <span>{txt.style.size}</span>
          <input type="range" min={30} max={72} value={size} onChange={function (e) { soul.setStyle(id, { size: Number(e.target.value) }) }} style={RANGE_STYLE} />
        </div>
        <div style={STYLE_LABEL}>
          <span>{txt.style.glow}</span>
          <input type="range" min={0} max={100} value={glow} onChange={function (e) { soul.setStyle(id, { glow: Number(e.target.value) }) }} style={RANGE_STYLE} />
        </div>
        <div style={STYLE_LABEL}>
          <span>{(txt.style as any).quality}</span>
          <input type="range" min={1} max={3} value={quality} onChange={function (e) { soul.setStyle(id, { quality: Number(e.target.value) } as any) }} style={RANGE_STYLE} />
        </div>
        <div style={STYLE_LABEL}>
          <span>{(txt.style as any).sound + " \u00B7 " + sound + " Hz"}</span>
          <button type="button" style={actionBtn(color)} onClick={function () { try { const AC = (window as any).AudioContext || (window as any).webkitAudioContext; const ac = new AC(); const osc = ac.createOscillator(); const g = ac.createGain(); osc.frequency.value = sound; osc.type = "sine"; g.gain.value = 0.12; osc.connect(g); g.connect(ac.destination); osc.start(); setTimeout(function () { try { osc.stop(); ac.close() } catch (e2) { /* noop */ } }, 1300) } catch (e) { /* noop */ } }}>
            {(txt.style as any).play}
          </button>
        </div>
        <div style={TYPE_ROW}>
          {SOUND_FREQS.map(function (f) {
            return (
              <button key={f} type="button" style={chipStyle(sound === f, color)} onClick={function () { soul.setStyle(id, { sound: f } as any) }}>
                {f + " Hz"}
              </button>
            )
          })}
        </div>
        <button type="button" style={actionBtn("rgba(201,168,76,0.85)")} onClick={function () { soul.setStyle(id, { color: SOUL_CANON[id].color, size: 46, glow: 40, sound: 528, quality: 1 } as any) }}>
          {txt.style.reset}
        </button>
        <button type="button" style={RESET_BTN} onClick={function () { if (window.confirm(txt.reset + "?")) { soul.resetSphere(id); closePanel() } }}>
          {txt.reset}
        </button>
      </div>
    )
  }

  function renderDim(i: number) {
    const color = CHAKRA_COLORS[i]
    const name = CHAKRA_NAMES[i] || ""
    const growth = clamp01((overall - 0.12) / 0.88)
    const fill = clamp01(growth * 9 - i)
    const pct = Math.round(fill * 100)
    return (
      <div style={DIM_OVERLAY} onClick={closeDim}>
        <div style={DIM_CARD} onClick={function (e) { e.stopPropagation() }}>
          <div style={dimOrbStyle(color, fill)}>{"\u2756"}</div>
          <div style={DIM_NAME}>{name}</div>
          <div style={DIM_HINT}>{txt.dim.hint}</div>
          <div style={DIM_BAR_WRAP}><div style={dimBarStyle(color, fill)} /></div>
          <div style={DIM_FILL_TXT}>{pct + "% " + txt.dim.fill}</div>
          <button type="button" style={DIM_CLOSE} onClick={closeDim}>{txt.dim.close}</button>
        </div>
      </div>
    )
  }

  function renderOnboard() {
    const ob = (txt as any).onboard || {}
    const steps = ob.steps || []
    const idx = onbStep == null ? 0 : onbStep
    const step = steps[idx] || { title: "", body: "" }
    const last = idx >= steps.length - 1
    return (
      <div style={DIM_OVERLAY} onClick={finishOnb}>
        <div style={DIM_CARD} onClick={function (e) { e.stopPropagation() }}>
          <div style={ONB_TITLE}>{step.title}</div>
          <div style={ONB_BODY}>{step.body}</div>
          <div style={ONB_DOTS}>
            {steps.map(function (_st: any, di: number) {
              return <span key={di} style={onbDotStyle(di === idx)} />
            })}
          </div>
          <label style={ONB_TOGGLE}>
            <input type="checkbox" checked={tutorialOn} onChange={toggleTutorial} />
            <span>{ob.toggle}</span>
          </label>
          <div style={ONB_BTNS}>
            <button type="button" style={ONB_SKIP} onClick={finishOnb}>{ob.skip}</button>
            <button type="button" style={ONB_NEXT} onClick={nextOnb}>{last ? ob.done : ob.next}</button>
          </div>
        </div>
      </div>
    )
  }

  function renderBirth() {
    const ob = (txt as any).onboard || {}
    const arr = ob.birth || []
    const idx = birthStep == null ? 0 : birthStep
    const step = arr[idx] || { title: "", body: "" }
    const last = idx >= arr.length - 1
    return (
      <div style={BIRTH_WRAP}>
        <div style={BIRTH_TITLE}>{step.title}</div>
        <div style={BIRTH_BODY}>{step.body}</div>
        <div style={ONB_DOTS}>
          {arr.map(function (_st: any, di: number) {
            return <span key={di} style={onbDotStyle(di === idx)} />
          })}
        </div>
        <div style={BIRTH_BTNS}>
          <button type="button" style={ONB_SKIP} onClick={skipBirth}>{ob.skip}</button>
          <button type="button" style={ONB_NEXT} onClick={nextBirth}>{last ? ob.done : ob.next}</button>
        </div>
      </div>
    )
  }

  function renderInside() {
    const id = inside as SoulSphereId
    const canon = SOUL_CANON[id]
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    const subs = s.subSpheres
    return (
      <div style={INSIDE_OVERLAY}>
        <button type="button" style={INSIDE_BACK} title={"\u041d\u0430\u0440\u0443\u0436\u0443"} onClick={exitInside}>{"\u2190"}</button>
        <div style={INSIDE_HEAD}>
          <div style={INSIDE_TITLE}>{id === "soul" ? soulDisplayName : canon.name}</div>
          <div style={INSIDE_PROMPT}>{canon.prompt}</div>
        </div>
        <div style={INSIDE_STAGE}>
          <button type="button" className="soul-core" style={insideCenterStyle(color)} onClick={function () { setInside(null); selectSphere(id) }}>{sigilFor(id, "50%", 0.95)}</button>
          {subs.map(function (sub, k) {
            const sc = sub.color || color
            return (
              <button key={sub.id} type="button" className="soul-orbit" style={insideSubStyle(k, subs.length, sc)} title={sub.text} onClick={function () { enterSub(id, sub.id) }}>
                {sub.glyph || canon.glyph}
              </button>
            )
          })}
          {subs.length === 0 ? <div style={INSIDE_EMPTY}>{"\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u043e\u0434\u0441\u0444\u0435\u0440. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0441\u0444\u0435\u0440\u0443 \u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0438\u0445 \u0432\u043e \u0432\u043a\u043b\u0430\u0434\u043a\u0435 \u0413\u0440\u0430\u043d\u0438."}</div> : null}
        </div>
        <div style={INSIDE_HINT}>{"\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u0441\u0444\u0435\u0440\u0443 \u0432 \u0446\u0435\u043d\u0442\u0440\u0435, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0435\u0451 \u0433\u0440\u0430\u043d\u0438"}</div>
      </div>
    )
  }

  // Shared centered window shell (same look + feel as renderPanel): mera-tinted
  // card, sigil orb header, title and close. Reused by sub-spheres and Spirit so
  // entering them opens the SAME kind of window as the main spheres.
  function panelShell(opts: any) {
    const color = opts.color
    const g = clamp01(opts.lit || 0)
    const plvl = Math.max(1, Math.min(9, Math.floor(g * 9) + 1))
    const tintA = hexToRgba(color, 0.1 + 0.2 * g)
    const tintB = hexToRgba(color, 0.05 + 0.12 * g)
    const edgeC = hexToRgba(color, 0.3 + 0.42 * g)
    const haloC = hexToRgba(color, 0.16 + 0.46 * g)
    const glowPx = (16 + g * 48).toFixed(0)
    const liftA = (0.86 - 0.05 * g).toFixed(3)
    const liftB = (0.94 - 0.03 * g).toFixed(3)
    const panelBg = "radial-gradient(130% 90% at 28% -10%, " + tintA + ", rgba(14,10,28,0) 62%), radial-gradient(150% 130% at 78% 120%, " + tintB + ", rgba(10,7,20,0) 58%), linear-gradient(180deg, rgba(18,13,34," + liftA + "), rgba(10,7,22," + liftB + "))"
    const goldEdge = plvl >= 7 ? ", inset 0 0 30px rgba(230,198,106,0.2)" : ""
    const cardShadow = "0 26px 72px rgba(0,0,0,0.52), 0 0 " + glowPx + "px " + haloC + ", inset 0 1px 0 rgba(255,255,255,0.07)" + goldEdge
    const CARD = { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(640px, 94vw)", maxHeight: "84vh", display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", borderRadius: "20px", background: panelBg, border: "1px solid " + edgeC, boxShadow: cardShadow, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 41, animation: "soulPanelIn 0.26s cubic-bezier(0.2,0.8,0.2,1)" } as React.CSSProperties
    const HEAD = { display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "1px solid " + hexToRgba(color, 0.2) } as React.CSSProperties
    const ORB_MINI = { flex: "0 0 auto", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: sphereBg(color, plvl, 0), boxShadow: sphereFrame(10, color, plvl) } as React.CSSProperties
    const TITLE = { flex: "1 1 auto", minWidth: 0, fontSize: "17px", fontWeight: 600, letterSpacing: "0.02em", color: "rgba(248,245,255,0.98)", textShadow: "0 0 16px " + hexToRgba(color, 0.45), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as React.CSSProperties
    const PROMPT = { fontSize: "13px", lineHeight: "1.5", color: "rgba(214,206,238,0.82)", marginTop: "-2px" } as React.CSSProperties
    const closeBtn = { flex: "0 0 auto", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", color: "rgba(228,222,246,0.85)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.22)" } as React.CSSProperties
    const BODY = { flex: "1 1 auto", minWidth: 0, overflowY: "auto", maxHeight: "66vh", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" } as React.CSSProperties
    return (
      <div style={CARD}>
        <style>{"@keyframes soulPanelIn{from{opacity:0;transform:translate(-50%,-46%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}"}</style>
        <div style={HEAD}>
          <span style={ORB_MINI}>{opts.sigil}</span>
          <span style={TITLE}>{opts.title}</span>
          <button type="button" style={closeBtn} onClick={opts.onClose}>{"\u2715"}</button>
        </div>
        {opts.prompt ? <div style={PROMPT}>{opts.prompt}</div> : null}
        <div style={BODY}>{opts.children}</div>
      </div>
    )
  }

  function renderInsideSub() {
    const ref = insideSub as { pid: SoulSphereId; subId: string }
    const canon = SOUL_CANON[ref.pid]
    const s = soul.state[ref.pid]
    const list = s.subSpheres.filter(function (x) { return x.id === ref.subId })
    const sub = list[0]
    if (!sub) return null
    const color = sub.color || dispColorOf(ref.pid, s.style && s.style.color)
    const lit = clamp01(sub.light || 0)
    const notes = sub.notes || []
    const feed = function (d: number) { soul.updateSubSphere(ref.pid, sub.id, { light: clamp01((sub.light || 0) + d) }) }
    const editTask = function () { let v = ""; try { v = window.prompt("\u041a\u0443\u0440\u0441 / \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0433\u0440\u0430\u043d\u0438:", sub.task || "") || "" } catch (e) { v = "" }; soul.updateSubSphere(ref.pid, sub.id, { task: v }) }
    const addNote = function () { let v = ""; try { v = window.prompt("\u0417\u0430\u043c\u0435\u0442\u043a\u0430 (\u0441\u043c\u044b\u0441\u043b \u0433\u0440\u0430\u043d\u0438):", "") || "" } catch (e) { v = "" }; if (!v) return; soul.updateSubSphere(ref.pid, sub.id, { notes: notes.concat([v]) }) }
    const delNote = function (i: number) { const nx = notes.slice(0); nx.splice(i, 1); soul.updateSubSphere(ref.pid, sub.id, { notes: nx }) }
    const PANEL = { position: "absolute", left: "50%", bottom: "14px", transform: "translateX(-50%)", width: "min(560px, 92vw)", maxHeight: "40vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", padding: "12px 14px", borderRadius: "16px", background: "rgba(16,12,32,0.74)", border: "1px solid rgba(150,130,210,0.28)", boxShadow: "0 -8px 30px rgba(0,0,0,0.35)", zIndex: 13 } as React.CSSProperties
    const SECTION = { display: "flex", flexDirection: "column", gap: "6px" } as React.CSSProperties
    const SEC_HEAD = { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", letterSpacing: "0.04em", color: "rgba(232,226,248,0.72)" } as React.CSSProperties
    const TASK_BOX = { fontSize: "14px", color: "rgba(240,236,252,0.95)", lineHeight: "1.45", padding: "8px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(150,130,210,0.2)", cursor: "pointer" } as React.CSSProperties
    const NOTE_ROW = { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "rgba(232,226,248,0.9)", lineHeight: "1.45", padding: "6px 8px", borderRadius: "8px", background: "rgba(255,255,255,0.035)" } as React.CSSProperties
    const NOTE_TXT = { flex: "1 1 auto", whiteSpace: "pre-wrap" } as React.CSSProperties
    const SMALL_BTN = { flex: "0 0 auto", cursor: "pointer", color: "rgba(220,210,245,0.8)", background: "transparent", border: "none", fontSize: "14px", lineHeight: "1" } as React.CSSProperties
    const BAR_WRAP = { width: "100%", height: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", overflow: "hidden" } as React.CSSProperties
    const LIGHT_BTNS = { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" } as React.CSSProperties
    const PCT = { minWidth: "44px", textAlign: "center", fontSize: "13px", color: "rgba(240,236,252,0.9)" } as React.CSSProperties
    const EMPTY = { fontSize: "12px", color: "rgba(200,194,224,0.5)", fontStyle: "italic", cursor: "pointer" } as React.CSSProperties
    return panelShell({
      color: color,
      lit: lit,
      title: sub.text,
      prompt: canon.name,
      sigil: sigilFor(ref.pid, "62%", 0.95),
      onClose: exitInsideSub,
      children: (
        <>
          <div style={SECTION}>
            <div style={SEC_HEAD}><span>{"\u2728 \u0421\u0432\u0435\u0442 \u0433\u0440\u0430\u043d\u0438"}</span><span>{Math.round(lit * 100) + "%"}</span></div>
            <div style={BAR_WRAP}><div style={dimBarStyle(color, lit)} /></div>
            <div style={LIGHT_BTNS}>
              <button type="button" style={actionBtn(color)} onClick={function () { feed(-0.1) }}>{"\u2212 \u0421\u0432\u0435\u0442"}</button>
              <div style={PCT}>{Math.round(lit * 100) + "%"}</div>
              <button type="button" style={actionBtn(color)} onClick={function () { feed(0.1) }}>{"+ \u0421\u0432\u0435\u0442"}</button>
            </div>
          </div>
          <div style={SECTION}>
            <div style={SEC_HEAD}><span>{"\u25C8 \u041a\u0443\u0440\u0441 / \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430"}</span><button type="button" style={SMALL_BTN} onClick={editTask}>{sub.task ? "\u270e" : "+"}</button></div>
            {sub.task ? <div style={TASK_BOX} onClick={editTask}>{sub.task}</div> : <div style={EMPTY} onClick={editTask}>{"\u041d\u0430\u0437\u043d\u0430\u0447\u044c \u043a\u0443\u0440\u0441 \u0438\u043b\u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0443"}</div>}
          </div>
          <div style={SECTION}>
            <div style={SEC_HEAD}><span>{"\u270d \u0417\u0430\u043c\u0435\u0442\u043a\u0438 / \u0441\u043c\u044b\u0441\u043b"}</span><button type="button" style={SMALL_BTN} onClick={addNote}>{"+"}</button></div>
            {notes.length === 0 ? <div style={EMPTY} onClick={addNote}>{"\u0417\u0430\u043f\u0438\u0448\u0438 \u043f\u0435\u0440\u0432\u0443\u044e \u043c\u044b\u0441\u043b\u044c"}</div> : notes.map(function (nt, i) { return (<div key={i} style={NOTE_ROW}><span style={NOTE_TXT}>{nt}</span><button type="button" style={SMALL_BTN} onClick={function () { delNote(i) }}>{"\u2715"}</button></div>) })}
          </div>
        </>
      ),
    })
  }

  // Vector line-sigils per sphere: thin engraved-light glyphs that scale cleanly
  // and replace the crude unicode symbols. pointerEvents none so drag still works.
  function sigilFor(id: string, size: any, op: number) {
    const SIG = { display: "inline-block", verticalAlign: "middle", opacity: op, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.45))", overflow: "visible", pointerEvents: "none" } as React.CSSProperties
    const sc = "rgba(248,246,255,0.95)"
    let body: any = null
    if (id === "osnova") {
      body = (<rect x="6.2" y="6.2" width="11.6" height="11.6" />)
    } else if (id === "serdce") {
      body = (<g><circle cx="9.4" cy="12" r="5.2" /><circle cx="14.6" cy="12" r="5.2" /></g>)
    } else if (id === "razum") {
      body = (<path d="M12 5 L19 18.5 L5 18.5 Z" />)
    } else if (id === "svyazi") {
      body = (<g><path d="M12 4.8 L19.5 17.8 L4.5 17.8 Z" /><path d="M12 19.2 L4.5 6.2 L19.5 6.2 Z" /></g>)
    } else {
      body = (<g><circle cx="12" cy="12" r="7.6" /><circle cx="12" cy="12" r="1.7" fill="rgba(248,246,255,0.95)" /></g>)
    }
    return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={sc} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={SIG}>{body}</svg>)
  }

  function renderPanel() {
    const id = selected as SoulSphereId
    const canon = SOUL_CANON[id]
    const s = soul.state[id]
    const color = dispColorOf(id, s.style && s.style.color)
    const lit = clamp01(s.light || 0)
    // Centered floating panel that TRANSFORMS to match its sphere: tinted by the
    // sphere colour, with depth + glow that grow with the mera (heavy/dark low,
    // luminous glass high, a gold inner edge once the Jiva is whole at mera 7+).
    const g = clamp01(lit)
    const plvl = Math.max(1, Math.min(9, Math.floor(g * 9) + 1))
    const tintA = hexToRgba(color, 0.1 + 0.2 * g)
    const tintB = hexToRgba(color, 0.05 + 0.12 * g)
    const edgeC = hexToRgba(color, 0.3 + 0.42 * g)
    const haloC = hexToRgba(color, 0.16 + 0.46 * g)
    const glowPx = (16 + g * 48).toFixed(0)
    const liftA = (0.86 - 0.05 * g).toFixed(3)
    const liftB = (0.94 - 0.03 * g).toFixed(3)
    const panelBg = "radial-gradient(130% 90% at 28% -10%, " + tintA + ", rgba(14,10,28,0) 62%), radial-gradient(150% 130% at 78% 120%, " + tintB + ", rgba(10,7,20,0) 58%), linear-gradient(180deg, rgba(18,13,34," + liftA + "), rgba(10,7,22," + liftB + "))"
    const goldEdge = plvl >= 7 ? ", inset 0 0 30px rgba(230,198,106,0.2)" : ""
    const panelShadow = "0 26px 72px rgba(0,0,0,0.52), 0 0 " + glowPx + "px " + haloC + ", inset 0 1px 0 rgba(255,255,255,0.07)" + goldEdge
    const PANEL_CENTER = { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(680px, 94vw)", maxHeight: "84vh", display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", borderRadius: "20px", background: panelBg, border: "1px solid " + edgeC, boxShadow: panelShadow, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 40, animation: "soulPanelIn 0.26s cubic-bezier(0.2,0.8,0.2,1)" } as React.CSSProperties
    const SPLIT = { display: "flex", alignItems: "stretch", gap: "12px", flex: "1 1 auto", minHeight: 0 } as React.CSSProperties
    const TABRAIL = { display: "flex", flexDirection: "column", gap: "6px", flex: "0 0 auto", width: "124px", borderRight: "1px solid " + hexToRgba(color, 0.14), paddingRight: "10px" } as React.CSSProperties
    const BODY_COL = { flex: "1 1 auto", minWidth: 0, overflowY: "auto", maxHeight: "64vh", paddingRight: "4px" } as React.CSSProperties
    const tabV = function (on: boolean) { return { display: "flex", alignItems: "center", gap: "8px", textAlign: "left", padding: "9px 11px", borderRadius: "11px", cursor: "pointer", fontSize: "13px", lineHeight: "1.1", color: on ? "rgba(248,244,255,0.99)" : "rgba(210,202,236,0.68)", background: on ? hexToRgba(color, 0.2) : "rgba(255,255,255,0.035)", border: on ? "1px solid " + hexToRgba(color, 0.55) : "1px solid rgba(150,130,210,0.16)", boxShadow: on ? "0 0 14px " + hexToRgba(color, 0.3) : "none" } as React.CSSProperties }
    // Header styled as a slice of the sphere: a mini-orb built from the SAME
    // material (sphereBg/sphereFrame at this mera), a colour-lit title and round
    // enter/close controls tinted to the sphere.
    const HEAD = { display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "1px solid " + hexToRgba(color, 0.2) } as React.CSSProperties
    const ORB_MINI = { flex: "0 0 auto", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "rgba(255,255,255,0.92)", background: sphereBg(color, plvl, 0), boxShadow: sphereFrame(10, color, plvl) } as React.CSSProperties
    const TITLE = { flex: "1 1 auto", minWidth: 0, fontSize: "17px", fontWeight: 600, letterSpacing: "0.02em", color: "rgba(248,245,255,0.98)", textShadow: "0 0 16px " + hexToRgba(color, 0.45), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as React.CSSProperties
    const PROMPT = { fontSize: "13px", lineHeight: "1.5", color: "rgba(214,206,238,0.82)", marginTop: "-2px" } as React.CSSProperties
    const enterBtn = { flex: "0 0 auto", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "15px", color: hexToRgba(color, 0.95), background: hexToRgba(color, 0.16), border: "1px solid " + hexToRgba(color, 0.5), boxShadow: "0 0 12px " + hexToRgba(color, 0.35) } as React.CSSProperties
    const deepBtn = { flex: "0 0 auto", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "15px", color: "rgba(230,198,106,0.95)", background: "rgba(230,198,106,0.14)", border: "1px solid rgba(230,198,106,0.5)", boxShadow: "0 0 12px rgba(230,198,106,0.35)" } as React.CSSProperties
    const closeBtn = { flex: "0 0 auto", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", color: "rgba(228,222,246,0.85)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.22)" } as React.CSSProperties
    return (
      <div style={PANEL_CENTER}>
        <style>{"@keyframes soulPanelIn{from{opacity:0;transform:translate(-50%,-46%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}"}</style>
        <div style={HEAD}>
          <span style={ORB_MINI}>{sigilFor(id, "62%", 0.95)}</span>
          <span style={TITLE}>{id === "soul" ? soulDisplayName : canon.name}</span>
          <button type="button" style={enterBtn} title={"\u0412\u043e\u0439\u0442\u0438 \u0432\u043d\u0443\u0442\u0440\u044c"} onClick={function () { enterSphere(id) }}>{"\u26F6"}</button>
          <button type="button" style={deepBtn} title={"\u0412\u0433\u043b\u0443\u0431\u044c"} onClick={function () { setDeepSpace({ kind: "sphere", id: id }) }}>{"\u2193"}</button>
          <button type="button" style={closeBtn} onClick={closePanel}>{"\u2715"}</button>
        </div>
        <div style={PROMPT}>{canon.prompt}</div>
        <div style={SPLIT}>
          <div style={TABRAIL}>
            {PANEL_TABS.map(function (tb) {
              return (
                <button key={tb} type="button" className="soul-tab" style={tabV(tab === tb)} onClick={function () { setTab(tb) }}>
                  <span>{TAB_GLYPH[tb]}</span>
                  <span>{TAB_TXT[tb]}</span>
                </button>
              )
            })}
          </div>
          <div style={BODY_COL} className="soul-body">
            {tab === "subs" ? renderSubs(id) : null}
            {tab === "journal" ? renderJournal(id) : null}
            {tab === "plans" ? renderPlans(id) : null}
            {tab === "media" ? renderMedia(id) : null}
            {tab === "social" ? renderSocial(id) : null}
            {tab === "style" ? renderStyleTab(id) : null}
          </div>
        </div>
      </div>
    )
  }

  // The Spirits are drawn in 3D on the cosmos canvas (drawAuras), bound to the
  // Soul so they lean with the cosmos and keep their height. In the DOM we only
  // keep three "+" controls (one per tier) to add a Spirit to each level; tapping
  // an existing Spirit orb on the canvas opens it (spiritHits hit-testing).
  function renderSpiritAdders() {
    const L1 = tierOf(1)
    const L2 = tierOf(2)
    const L3 = tierOf(3)
    const WRAP = { position: "absolute", right: "16px", top: "152px", display: "flex", flexDirection: "column", gap: "12px", zIndex: 35 } as React.CSSProperties
    const ROW = { display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" } as React.CSSProperties
    const LBL = { fontSize: "10px", letterSpacing: "0.14em", color: "rgba(232,226,248,0.6)", whiteSpace: "nowrap" } as React.CSSProperties
    const adder = function (active: boolean, col: string) { return { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", color: "rgba(255,245,225,0.95)", background: "rgba(34,26,52,0.66)", border: "1px solid " + col, boxShadow: "0 0 12px " + col, cursor: active ? "pointer" : "default", opacity: active ? 1 : 0.32 } as React.CSSProperties }
    return (
      <div style={WRAP}>
        <div style={ROW}>
          <span style={LBL}>{"\u0415\u0434\u0438\u043d\u044b\u0439 " + L3.length + "/1"}</span>
          <button type="button" style={adder(L3.length < 1, "rgba(230,198,106,0.7)")} title={"\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e"} onClick={function () { addSpiritTier(3) }}>{"\u002B"}</button>
        </div>
        <div style={ROW}>
          <span style={LBL}>{"\u041b\u043e\u0433\u043e\u0441 " + L2.length + "/4"}</span>
          <button type="button" style={adder(L2.length < 4, "rgba(154,167,255,0.7)")} title={"\u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u044b\u0439 \u0434\u0443\u0445"} onClick={function () { addSpiritTier(2) }}>{"\u002B"}</button>
        </div>
        <div style={ROW}>
          <span style={LBL}>{"\u0411\u044b\u0442\u043e\u0432\u044b\u0435 " + L1.length + "/7"}</span>
          <button type="button" style={adder(L1.length < 7, "rgba(219,228,255,0.7)")} title={"\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445"} onClick={function () { addSpiritTier(1) }}>{"\u002B"}</button>
        </div>
      </div>
    )
  }

  // Three Spirit tiers as DOM rotating rings (replaces the single canvas-crown
  // layer). Each tier carries its own + button:
  //  L1 everyday spirits - up to 7 rainbow-into-white orbs, ring spins clockwise
  //  L2 planetary Logos   - up to 4 larger blurred tri-colour orbs, counter-cw
  //  L3 Spirit of the One - one big rainbow sphere that breathes, rays to soul
  function renderSpiritTiers() {
    const L1 = tierOf(1)
    const L2 = tierOf(2)
    const L3 = tierOf(3)
    const L1_HUES = ["#ffd1d6", "#ffe0bd", "#fff3bf", "#d3f9d8", "#c5f6fa", "#d0ebff", "#e5dbff"]
    const L2_SETS = [["#ffd43b", "#ff922b", "#f76707"], ["#74c0fc", "#4dabf7", "#3b5bdb"], ["#b197fc", "#9775fa", "#7048e8"], ["#63e6be", "#38d9a9", "#0ca678"]]
    // Compact upper-region stack (near where the old spirits lived), with a soft
    // light axis that descends from the One down into the Soul below. Smaller,
    // and shaded as real 3D spheres (bytovye reuse the main-sphere material).
    const R1 = 38
    const R2 = 42
    const ZL1 = 260
    const ZL2 = 150
    const ZL3 = 56
    const SHADE = "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.92), rgba(255,255,255,0) 38%)"
    const SPH3D = "inset -4px -6px 11px rgba(0,0,0,0.42), inset 3px 4px 9px rgba(255,255,255,0.4)"
    const KEY = "@keyframes spiritSpinCW{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes spiritSpinCCW{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(-360deg)}}@keyframes spiritBreathe{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.06)}}@keyframes spiritRay{0%,100%{opacity:0.32}50%{opacity:0.6}}"
    const zoneWrap = function (top: number) { return { position: "absolute", left: "50%", top: top + "px", width: "0px", height: "0px", zIndex: 34 } as React.CSSProperties }
    const ringSpin = function (dir: string, dur: number) { return { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px", transform: "translate(-50%,-50%)", animation: "spiritSpin" + (dir === "cw" ? "CW" : "CCW") + " " + dur + "s linear infinite" } as React.CSSProperties }
    const seat = function (a: number, r: number) { return { position: "absolute", left: "0px", top: "0px", transform: "rotate(" + a + "deg) translateY(-" + r + "px)" } as React.CSSProperties }
    const orbL1 = function (hue: string) { return { position: "absolute", left: "0px", top: "0px", width: "20px", height: "20px", borderRadius: "50%", transform: "translate(-50%,-50%)", cursor: "pointer", padding: 0, border: "1px solid rgba(255,255,255,0.5)", background: sphereBg(hue, 9, 0), boxShadow: sphereFrame(8, hue, 9) } as React.CSSProperties }
    const orbL2 = function (set: string[]) { return { position: "absolute", left: "0px", top: "0px", width: "28px", height: "28px", borderRadius: "50%", transform: "translate(-50%,-50%)", cursor: "pointer", padding: 0, border: "1px solid rgba(230,224,255,0.5)", background: SHADE + ", radial-gradient(circle at 30% 30%, " + set[0] + ", rgba(0,0,0,0) 55%), radial-gradient(circle at 72% 60%, " + set[1] + ", rgba(0,0,0,0) 55%), radial-gradient(circle at 50% 82%, " + set[2] + ", rgba(0,0,0,0) 60%), radial-gradient(circle at 50% 50%, #2a2348, #160f2e)", boxShadow: SPH3D + ", 0 0 16px rgba(180,170,255,0.42)" } as React.CSSProperties }
    const unityBtn = { position: "absolute", left: "0px", top: "0px", width: "48px", height: "48px", borderRadius: "50%", transform: "translate(-50%,-50%)", cursor: "pointer", padding: 0, border: "1px solid rgba(255,255,255,0.6)", background: SHADE + ", conic-gradient(from 0deg, #ff5d5d, #ffb24d, #ffe24d, #6ef07a, #4dd2ff, #6d8bff, #c06bff, #ff5d5d)", boxShadow: SPH3D + ", 0 0 24px rgba(255,255,255,0.5), 0 0 48px rgba(180,170,255,0.45)", animation: "spiritBreathe 6s ease-in-out infinite" } as React.CSSProperties
    const unityCore = { position: "absolute", left: "50%", top: "50%", width: "22px", height: "22px", borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95), rgba(255,255,255,0) 72%)", pointerEvents: "none" } as React.CSSProperties
    const beam = { position: "absolute", left: "50%", top: ZL3 + "px", width: "12px", height: "calc(50vh - " + (ZL3 - 26) + "px)", transform: "translateX(-50%)", background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(200,190,255,0.24) 38%, rgba(150,140,230,0.12) 70%, rgba(120,110,210,0) 100%)", filter: "blur(6px)", borderRadius: "50%", pointerEvents: "none", animation: "spiritRay 5s ease-in-out infinite", zIndex: 13 } as React.CSSProperties
    const plus = function (active: boolean) { return { position: "absolute", left: "0px", top: "0px", width: "26px", height: "26px", borderRadius: "50%", transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "rgba(255,245,225,0.92)", background: "rgba(40,30,60,0.62)", border: "1px solid rgba(255,250,235,0.4)", cursor: active ? "pointer" : "default", opacity: active ? 1 : 0.3, zIndex: 35 } as React.CSSProperties }
    const lbl = function (top: number) { return { position: "absolute", left: "calc(50% + 58px)", top: top + "px", transform: "translateY(-50%)", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(232,226,248,0.55)", whiteSpace: "nowrap", zIndex: 34, pointerEvents: "none" } as React.CSSProperties }
    return (
      <>
        <style>{KEY}</style>
        <div style={beam} />
        <div style={zoneWrap(ZL3)}>
          {L3.length > 0 ? (
            <button type="button" style={unityBtn} title={"\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e"} onClick={function () { setSpiritOpenId(L3[0].id) }}><span style={unityCore} /></button>
          ) : (
            <button type="button" style={plus(true)} title={"\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e"} onClick={function () { addSpiritTier(3) }}>{"\u002B"}</button>
          )}
        </div>
        <div style={lbl(ZL3)}>{"\u0415\u0434\u0438\u043d\u044b\u0439"}</div>
        <div style={zoneWrap(ZL2)}>
          <div style={ringSpin("ccw", 64)}>
            {L2.map(function (sp: any, i: number) { const a = i * (360 / Math.max(1, L2.length)); return (<div key={sp.id} style={seat(a, R2)}><button type="button" style={orbL2(L2_SETS[i % 4])} title={sp.name || "\u041b\u043e\u0433\u043e\u0441"} onClick={function () { setSpiritOpenId(sp.id) }} /></div>) })}
          </div>
          <button type="button" style={plus(L2.length < 4)} title={"\u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u044b\u0439 \u0434\u0443\u0445"} onClick={function () { addSpiritTier(2) }}>{"\u002B"}</button>
        </div>
        <div style={lbl(ZL2)}>{"\u041b\u043e\u0433\u043e\u0441"}</div>
        <div style={zoneWrap(ZL1)}>
          <div style={ringSpin("cw", 50)}>
            {L1.map(function (sp: any, i: number) { const a = i * (360 / Math.max(1, L1.length)); return (<div key={sp.id} style={seat(a, R1)}><button type="button" style={orbL1(L1_HUES[i % 7])} title={sp.name || "\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445"} onClick={function () { setSpiritOpenId(sp.id) }} /></div>) })}
          </div>
          <button type="button" style={plus(L1.length < 7)} title={"\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445"} onClick={function () { addSpiritTier(1) }}>{"\u002B"}</button>
        </div>
        <div style={lbl(ZL1)}>{"\u0411\u044b\u0442\u043e\u0432\u044b\u0435"}</div>
      </>
    )
  }

  // The Spirit (Dukh) hall: a dedicated inner scene one can enter once the
  // Jiva is whole (mera 7+). It is the sixth sphere, the beyond that guides.
  function renderSpirit() {
    const sp = spirits.filter(function (s: any) { return s.id === spiritOpenId })[0]
    if (!sp) return null
    const subs = sp.subs || []
    const tier = sp.tier || 1
    const tierCol = tier === 3 ? "#e6c66a" : tier === 2 ? "#9aa7ff" : "#dbe4ff"
    const tcol = sp.color || tierCol
    const spGlow = typeof sp.glow === "number" ? sp.glow : 1
    const SP_SWATCHES = ["#e6c66a", "#9aa7ff", "#dbe4ff", "#ff7043", "#3ddc84", "#4fc3f7", "#b06ce0", "#ff6fae", "#7b68ee", "#f6f2ff"]
    const SKIN_ROW = { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } as React.CSSProperties
    const SKIN_LBL = { fontSize: "12px", color: "rgba(232,226,248,0.8)", minWidth: "44px" } as React.CSSProperties
    const SKIN_COLOR = { width: "40px", height: "28px", padding: 0, border: "1px solid " + hexToRgba(tcol, 0.5), borderRadius: "8px", background: "transparent", cursor: "pointer" } as React.CSSProperties
    const SKIN_SWWRAP = { display: "flex", gap: "6px", flexWrap: "wrap", flex: "1 1 auto" } as React.CSSProperties
    const skinSw = function (c: string, on: boolean) { return { width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", background: c, border: on ? "2px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.35)", boxShadow: on ? "0 0 10px " + c : "none" } as React.CSSProperties }
    const SKIN_RANGE = { flex: "1 1 auto", accentColor: tcol } as React.CSSProperties
    const SKIN_RESET = { alignSelf: "flex-start", padding: "6px 10px", borderRadius: "9px", fontSize: "12px", color: "rgba(236,230,250,0.85)", background: "rgba(255,255,255,0.05)", border: "1px solid " + hexToRgba(tcol, 0.35), cursor: "pointer" } as React.CSSProperties
    const defName = tier === 3 ? "\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e" : tier === 2 ? "\u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u044b\u0439 \u0434\u0443\u0445 \u041b\u043e\u0433\u043e\u0441\u0430" : "\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445"
    const orbStyle = { width: "108px", height: "108px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "rgba(60,42,20,0.8)", background: "radial-gradient(circle at 50% 40%, rgba(255,255,250,0.98), rgba(255,240,205,0.85) 55%, rgba(245,225,255,0.22) 80%)", border: "1px solid rgba(255,250,235,0.7)", boxShadow: "0 0 50px rgba(255,245,220,0.7), 0 0 100px rgba(220,200,255,0.4)", cursor: "default" } as React.CSSProperties
    const PANEL = { position: "absolute", left: "50%", bottom: "14px", transform: "translateX(-50%)", width: "min(560px, 92vw)", maxHeight: "40vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", padding: "12px 14px", borderRadius: "16px", background: "rgba(16,12,32,0.74)", border: "1px solid rgba(150,130,210,0.28)", boxShadow: "0 -8px 30px rgba(0,0,0,0.35)", zIndex: 13 } as React.CSSProperties
    const ROW = { display: "flex", alignItems: "center", gap: "8px" } as React.CSSProperties
    const INP = { flex: "1 1 auto", padding: "8px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.3)", color: "rgba(240,236,252,0.95)", fontSize: "14px", outline: "none" } as React.CSSProperties
    const ADD = { flex: "0 0 auto", padding: "8px 12px", borderRadius: "10px", background: hexToRgba(tcol, 0.2), border: "1px solid " + hexToRgba(tcol, 0.55), color: "rgba(255,250,245,0.96)", fontSize: "13px", cursor: "pointer" } as React.CSSProperties
    const ITEM = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(232,226,248,0.92)", padding: "6px 8px", borderRadius: "8px", background: "rgba(255,255,255,0.04)" } as React.CSSProperties
    const TXT = { flex: "1 1 auto", cursor: "pointer" } as React.CSSProperties
    const DEL = { flex: "0 0 auto", cursor: "pointer", color: "rgba(220,210,245,0.8)", background: "transparent", border: "none", fontSize: "14px", lineHeight: "1" } as React.CSSProperties
    const HEADROW = { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", letterSpacing: "0.04em", color: "rgba(232,226,248,0.72)" } as React.CSSProperties
    const EMPTY = { fontSize: "12px", color: "rgba(200,194,224,0.5)", fontStyle: "italic" } as React.CSSProperties
    const RM = { marginTop: "2px", alignSelf: "flex-start", cursor: "pointer", color: "rgba(235,170,170,0.85)", background: "transparent", border: "none", fontSize: "12px" } as React.CSSProperties
    const NAMEINP = { width: "100%", boxSizing: "border-box", fontSize: "16px", fontWeight: 600, letterSpacing: "0.03em", color: "rgba(245,240,255,0.96)", background: "rgba(255,255,255,0.05)", border: "1px solid " + hexToRgba(tcol, 0.4), borderRadius: "10px", outline: "none", padding: "9px 11px" } as React.CSSProperties
    const SP_TA = { width: "100%", boxSizing: "border-box", minHeight: "96px", resize: "vertical", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(150,130,210,0.3)", color: "rgba(240,236,252,0.96)", fontSize: "14px", lineHeight: "1.5", outline: "none" } as React.CSSProperties
    const SECTION = { display: "flex", flexDirection: "column", gap: "8px", padding: "12px 13px", borderRadius: "14px", background: hexToRgba(tcol, 0.07), border: "1px solid " + hexToRgba(tcol, 0.2), boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" } as React.CSSProperties
    const SEC_HEAD = { fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: hexToRgba(tcol, 0.92), textShadow: "0 0 10px " + hexToRgba(tcol, 0.4) } as React.CSSProperties
    const DEEP_ROW = { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "12px", textAlign: "center", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,250,245,0.97)", background: "linear-gradient(180deg, " + hexToRgba(tcol, 0.3) + ", " + hexToRgba(tcol, 0.14) + ")", border: "1px solid " + hexToRgba(tcol, 0.6), boxShadow: "0 0 16px " + hexToRgba(tcol, 0.4) + ", inset 0 1px 0 rgba(255,255,255,0.12)", cursor: "pointer" } as React.CSSProperties
    return panelShell({
      color: tcol,
      lit: spGlow,
      title: sp.name ? sp.name : defName,
      prompt: "\u0421\u0432\u0435\u0442 \u0437\u0430\u043f\u0440\u0435\u0434\u0435\u043b\u044c\u043d\u043e\u0433\u043e, \u0447\u0442\u043e \u0432\u0435\u0434\u0451\u0442 \u0414\u0436\u0438\u0432\u0443 \u043a \u0418\u0441\u0442\u043e\u043a\u0443",
      sigil: sigilFor("spirit", "62%", 0.95),
      onClose: function () { setSpiritOpenId(null); setSpiritSubInput("") },
      children: (
        <>
          <button type="button" style={DEEP_ROW} onClick={function () { setDeepSpace({ kind: "spirit", id: sp.id }) }}>{"\u2193 \u0412\u0433\u043b\u0443\u0431\u044c \u0414\u0443\u0445\u0430"}</button>
          <div style={SECTION}>
            <div style={SEC_HEAD}>{"\u2728 \u041e\u0431\u043b\u0438\u043a \u0414\u0443\u0445\u0430"}</div>
            <div style={SKIN_ROW}>
              <span style={SKIN_LBL}>{"\u0426\u0432\u0435\u0442"}</span>
              <input type="color" style={SKIN_COLOR} value={tcol} onChange={function (e) { patchSpirit(sp.id, { color: e.target.value }) }} />
              <div style={SKIN_SWWRAP}>
                {SP_SWATCHES.map(function (c: string) { return <button key={c} type="button" style={skinSw(c, tcol === c)} onClick={function () { patchSpirit(sp.id, { color: c }) }} /> })}
              </div>
            </div>
            <div style={SKIN_ROW}>
              <span style={SKIN_LBL}>{"\u0421\u0432\u0435\u0442"}</span>
              <input type="range" min={0} max={100} value={Math.round(spGlow * 100)} onChange={function (e) { patchSpirit(sp.id, { glow: Number(e.target.value) / 100 }) }} style={SKIN_RANGE} />
            </div>
            <button type="button" style={SKIN_RESET} onClick={function () { patchSpirit(sp.id, { color: tierCol, glow: 1 }) }}>{"\u21bb \u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e"}</button>
          </div>
          <div style={SECTION}>
            <div style={SEC_HEAD}>{"\u25C9 \u0418\u043c\u044f \u0414\u0443\u0445\u0430"}</div>
            <input style={NAMEINP} value={sp.name || ""} placeholder={"\u0414\u0443\u0445 \u0442\u0430\u043a\u043e\u0439-\u0442\u043e..."} onChange={function (e) { patchSpirit(sp.id, { name: e.target.value }) }} />
          </div>
          <div style={SECTION}>
            <div style={SEC_HEAD}>{"\u270d \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438"}</div>
            <textarea style={SP_TA} value={sp.notes || ""} placeholder={"\u0417\u0430\u043f\u0438\u0448\u0438 \u043e \u044d\u0442\u043e\u043c \u0414\u0443\u0445\u0435..."} onChange={function (e) { patchSpirit(sp.id, { notes: e.target.value }) }} />
          </div>
          <div style={SECTION}>
          <div style={HEADROW}><span>{"\u2742 \u0413\u0440\u0430\u043d\u0438 \u0414\u0443\u0445\u0430"}</span><span>{subs.length + " / 6"}</span></div>
          <div style={ROW}>
            <input style={INP} value={spiritSubInput} placeholder={"\u0413\u0440\u0430\u043d\u044c \u0414\u0443\u0445\u0430..."} onChange={function (e) { setSpiritSubInput(e.target.value) }} onKeyDown={function (e) { if (e.key === "Enter") { addSpiritSub(sp.id, spiritSubInput); setSpiritSubInput("") } }} />
            <button type="button" style={ADD} onClick={function () { addSpiritSub(sp.id, spiritSubInput); setSpiritSubInput("") }}>{"+ \u0413\u0440\u0430\u043d\u044c"}</button>
          </div>
          {subs.length === 0 ? <div style={EMPTY}>{"\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0433\u0440\u0430\u043d\u0435\u0439. \u0414\u043e 6 \u0433\u0440\u0430\u043d\u0435\u0439 \u0443 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u0414\u0443\u0445\u0430."}</div> : null}
          {subs.map(function (sub: any) {
            return (
              <div key={sub.id} style={ITEM}>
                <span style={TXT} onClick={function () { setSpiritSubOpenId(sub.id) }}>{sub.text}</span>
                <button type="button" style={DEL} onClick={function () { removeSpiritSub(sp.id, sub.id) }}>{"\u2715"}</button>
              </div>
            )
          })}
          </div>
          <button type="button" style={RM} onClick={function () { if (window.confirm("\u0423\u0431\u0440\u0430\u0442\u044c \u044d\u0442\u043e\u0442 \u0414\u0443\u0445?")) { removeSpirit(sp.id) } }}>{"\u2715 \u0423\u0431\u0440\u0430\u0442\u044c \u0414\u0443\u0445"}</button>
        </>
      ),
    })
  }

  // A single gran (face) of a Spirit, opened as its own full sub-sphere where
  // one can write freely. Mirrors how a Spirit itself is entered.
  function renderSpiritSub() {
    const sp = spirits.filter(function (s: any) { return s.id === spiritOpenId })[0]
    if (!sp) return null
    const sub = (sp.subs || []).filter(function (x: any) { return x.id === spiritSubOpenId })[0]
    if (!sub) return null
    const orbStyle = { width: "92px", height: "92px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "rgba(60,42,20,0.85)", background: "radial-gradient(circle at 50% 40%, rgba(255,255,250,0.98), rgba(255,240,205,0.85) 55%, rgba(245,225,255,0.22) 80%)", border: "1px solid rgba(255,250,235,0.7)", boxShadow: "0 0 40px rgba(255,245,220,0.65), 0 0 80px rgba(220,200,255,0.35)", cursor: "default" } as React.CSSProperties
    const TITLEINP = { textAlign: "center", fontSize: "18px", fontWeight: 600, letterSpacing: "0.04em", color: "rgba(245,240,255,0.96)", background: "transparent", border: "none", borderBottom: "1px solid rgba(150,130,210,0.3)", outline: "none", padding: "2px 6px" } as React.CSSProperties
    const PANEL = { position: "absolute", left: "50%", bottom: "14px", transform: "translateX(-50%)", width: "min(620px, 94vw)", display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px", borderRadius: "16px", background: "rgba(16,12,32,0.74)", border: "1px solid rgba(150,130,210,0.28)", boxShadow: "0 -8px 30px rgba(0,0,0,0.35)", zIndex: 13 } as React.CSSProperties
    const TA = { width: "100%", minHeight: "120px", resize: "vertical", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.3)", color: "rgba(240,236,252,0.96)", fontSize: "14px", lineHeight: "1.5", outline: "none" } as React.CSSProperties
    return panelShell({
      color: "#e6c66a",
      lit: 1,
      title: "\u0413\u0440\u0430\u043d\u044c \u0414\u0443\u0445\u0430",
      prompt: "\u0417\u0430\u043f\u0438\u0448\u0438, \u0447\u0442\u043e \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f",
      sigil: sigilFor("spirit", "62%", 0.95),
      onClose: function () { setSpiritSubOpenId(null) },
      children: (
        <>
          <input style={TITLEINP} value={sub.text} onChange={function (e) { patchSpiritSub(sp.id, sub.id, { text: e.target.value }) }} />
          <textarea style={TA} value={sub.notes || ""} placeholder={"\u0417\u0430\u043f\u0438\u0448\u0438 \u0437\u0434\u0435\u0441\u044c..."} onChange={function (e) { patchSpiritSub(sp.id, sub.id, { notes: e.target.value }) }} />
        </>
      ),
    })
  }

  // Bottom dock (outside the spheres): collapsible <details>. One Soul mera
  // scale (9 cells, each its own hue) + a per-center slider tinted in the
  // sphere's own color. Soul is the center -> moving it shifts every center by
  // the same delta (both directions); a sub-center pulls the Soul to the average.
  function renderMeraDock() {
    const cur: Record<string, number> = {
      soul: clamp01(soul.state.soul.light || 0),
      osnova: clamp01(soul.state.osnova.light || 0),
      serdce: clamp01(soul.state.serdce.light || 0),
      razum: clamp01(soul.state.razum.light || 0),
      svyazi: clamp01(soul.state.svyazi.light || 0),
    }
    const soulFilled = Math.min(9, Math.round(cur.soul * 9))
    const setCenterLight = function (cid: SoulSphereId, v: number) {
      if (cid === "soul") {
        const d = v - cur.soul
        soul.setLight({ soul: v, osnova: clamp01(cur.osnova + d), serdce: clamp01(cur.serdce + d), razum: clamp01(cur.razum + d), svyazi: clamp01(cur.svyazi + d) })
        return
      }
      const subs: Record<string, number> = { osnova: cur.osnova, serdce: cur.serdce, razum: cur.razum, svyazi: cur.svyazi }
      subs[cid] = v
      const avg = (subs.osnova + subs.serdce + subs.razum + subs.svyazi) / 4
      soul.setLight({ [cid]: v, soul: avg })
    }
    const centers = (["soul", "osnova", "serdce", "razum", "svyazi"] as SoulSphereId[]).map(function (cid) {
      return { id: cid, glyph: SOUL_CANON[cid].glyph, color: (colorsRef.current as any)[cid] || SOUL_CANON[cid].color }
    })
    const MERA_HUES = ["#d65b5b", "#d97b39", "#d9b53c", "#86c34e", "#46c7b8", "#4c93d6", "#6f6bd8", "#a85bd6", "#e2a6f2"]
    const DOCK = { position: "absolute", left: "50%", bottom: "14px", transform: "translateX(-50%)", width: "min(560px, calc(100vw - 140px))", display: "flex", flexDirection: "column", gap: "8px", padding: "10px 14px", borderRadius: "16px", background: "rgba(16,12,32,0.72)", border: "1px solid rgba(150,130,210,0.28)", boxShadow: "0 -8px 30px rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 12 } as React.CSSProperties
    const SUMMARY = { cursor: "pointer", fontSize: "12px", letterSpacing: "0.05em", color: "rgba(240,236,252,0.9)", userSelect: "none" } as React.CSSProperties
    const SCALE = { display: "none", gap: "4px" } as React.CSSProperties
    const SLIDER_ROW = { display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties
    const cell = function (on: boolean, c: string) { return { flex: 1, height: "10px", borderRadius: "3px", background: on ? c : "rgba(255,255,255,0.08)", boxShadow: on ? ("0 0 8px " + c) : "none", transition: "background 0.45s ease, box-shadow 0.45s ease" } as React.CSSProperties }
    const glyphStyle = function (c: string) { return { minWidth: "20px", textAlign: "center", fontSize: "15px", color: c, textShadow: "0 0 8px " + c } as React.CSSProperties }
    const sliderStyle = function (c: string) { return { flex: 1, accentColor: c } as React.CSSProperties }
    const MAYA_ROW = { display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" } as React.CSSProperties
    const MAYA_LABEL = { minWidth: "20px", textAlign: "center", fontSize: "15px", color: "#a78bd6", textShadow: "0 0 8px rgba(167,139,214,0.6)" } as React.CSSProperties
    const MAYA_TRACK = { flex: 1, height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" } as React.CSSProperties
    const MAYA_FILL = { width: Math.round(MAYA_DECAY_PER_DAY * 100 * 4) + "%", height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, rgba(167,139,214,0.75), rgba(120,90,180,0.2))", boxShadow: "0 0 8px rgba(167,139,214,0.5)" } as React.CSSProperties
    const MAYA_PCT = { fontSize: "10px", letterSpacing: "0.06em", color: "rgba(200,190,230,0.62)", minWidth: "62px", textAlign: "right" } as React.CSSProperties
    return (
      <details open style={DOCK}>
        <summary style={SUMMARY}>{"\u2728 " + soulDisplayName + " \u00B7 \u041C\u0435\u0440\u0430 " + soulFilled + " / 9"}</summary>
        <div style={SCALE}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (m) { return <div key={m} style={cell(m < soulFilled, MERA_HUES[m])} /> })}
        </div>
        {centers.map(function (c) {
          return (
            <div key={c.id} style={SLIDER_ROW}>
              <span style={glyphStyle(c.color)}>{c.glyph}</span>
              <input type="range" min={0} max={100} value={Math.round(cur[c.id] * 100)} onChange={function (e) { setCenterLight(c.id, Number(e.target.value) / 100) }} style={sliderStyle(c.color)} />
            </div>
          )
        })}
        <div style={MAYA_ROW}>
          <span style={MAYA_LABEL} title={"\u0412\u043B\u0438\u044F\u043D\u0438\u0435 \u043C\u0430\u0439\u0438 \u00B7 \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E\u0435 \u0443\u0433\u0430\u0441\u0430\u043D\u0438\u0435"}>{"\u263E"}</span>
          <div style={MAYA_TRACK}><div style={MAYA_FILL} /></div>
          <span style={MAYA_PCT}>{"\u2212" + Math.round(MAYA_DECAY_PER_DAY * 100) + "%/\u0441\u0443\u0442"}</span>
        </div>
      </details>
    )
  }

  function contentCount(id: SoulSphereId): number {
    const s = soul.state[id]
    return s.subSpheres.length + s.journal.length + s.plans.length + s.media.length + s.social.length
  }

  const soulSph = soul.state.soul
  const soulColor = dispColorOf("soul", soulSph.style && soulSph.style.color)
  const soulSize = (soulSph.style && soulSph.style.size ? soulSph.style.size : 46) * 1.9
  const soulQ = soulSph.style && typeof (soulSph.style as any).quality === "number" ? (soulSph.style as any).quality : 1
  const soulGlow = (soulSph.style && typeof soulSph.style.glow === "number" ? soulSph.style.glow : 50) * (0.8 + soulQ * 0.2)
  const avgLight = ((soul.state.soul.light || 0) + (soul.state.osnova.light || 0) + (soul.state.serdce.light || 0) + (soul.state.razum.light || 0) + (soul.state.svyazi.light || 0)) / 5
  const soulGrowth = clamp01(Math.max((overall - 0.12) / 0.88, avgLight, soul.state.soul.light || 0))
  growthRef.current = soulGrowth
  colorsRef.current = { soul: soulColor, osnova: dispColorOf("osnova", soul.state.osnova.style && soul.state.osnova.style.color), serdce: dispColorOf("serdce", soul.state.serdce.style && soul.state.serdce.style.color), razum: dispColorOf("razum", soul.state.razum.style && soul.state.razum.style.color), svyazi: dispColorOf("svyazi", soul.state.svyazi.style && soul.state.svyazi.style.color) }
  const soulLevel = Math.max(1, Math.min(9, Math.floor(soulGrowth * 9) + 1))
  const soulLevelPct = Math.round(soulGrowth * 100)
  // Past mera 4 the Soul has become Jiva (whole being); its shown name changes.
  const soulDisplayName = soulLevel >= 7 ? "\u0410\u0437\u0430\u0440\u0430 \u00B7 \u0414\u0443\u0445" : soulLevel >= 4 ? "\u0414\u0436\u0438\u0432\u0430" : SOUL_CANON.soul.name
  const levelNames = (txt as any).levels || []
  const activeMatrixSlug = activeMatrix(matrixState)
  const matrixLabel = "\u25C8 " + matrixName(activeMatrixSlug)
  const linkList = Object.keys(linkMetaRef.current).filter(function (k) { return linksRef.current.indexOf(k) >= 0 })
  const onbTxt = (txt as any).onboard || {}
  const LEGEND_WRAP = { position: "absolute", top: "138px", left: "12px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 33, maxWidth: "200px" } as React.CSSProperties
  const LEGEND_ITEM = { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(232,226,248,0.88)", background: "rgba(20,16,38,0.6)", border: "1px solid rgba(150,130,210,0.28)", borderRadius: "8px", padding: "3px 8px" } as React.CSSProperties
  const LEGEND_X = { marginLeft: "auto", cursor: "pointer", color: "rgba(235,200,200,0.85)", background: "transparent", border: "none", fontSize: "12px", lineHeight: "1" } as React.CSSProperties
  const JIVA_TAG = { fontSize: "12px", letterSpacing: "0.14em", color: "rgba(230,198,106,0.92)", textShadow: "0 0 10px rgba(230,198,106,0.5)", marginTop: "3px" } as React.CSSProperties
  const [spiritOpenId, setSpiritOpenId] = useState(null as any)
  const [spiritSubInput, setSpiritSubInput] = useState("")
  const [spiritSubOpenId, setSpiritSubOpenId] = useState(null as any)
  const [deepSpace, setDeepSpace] = useState(null as any)
  // Razum mind-map: draggable shaped nodes you can write into, recolor and
  // reshape, on a pan/zoom board with links. Persisted under MIND_KEY.
  const MIND_KEY = "awara_soul_razum_mindmap_v1"
  const [mindNodes, setMindNodes] = useState(function () {
    try { const raw = localStorage.getItem("awara_soul_razum_mindmap_v1"); if (raw) { const a = JSON.parse(raw); if (a && Array.isArray(a.nodes)) return a.nodes } } catch (e) { /* noop */ }
    return [] as any[]
  })
  const [mindEdges, setMindEdges] = useState(function () {
    try { const raw = localStorage.getItem("awara_soul_razum_mindmap_v1"); if (raw) { const a = JSON.parse(raw); if (a && Array.isArray(a.edges)) return a.edges } } catch (e) { /* noop */ }
    return [] as any[]
  })
  const [mindSel, setMindSel] = useState(null as any)
  const [mindLinkMode, setMindLinkMode] = useState(false)
  const [mindLinkFrom, setMindLinkFrom] = useState(null as any)
  const [mindEdgeSel, setMindEdgeSel] = useState(null as any)
  const [mindZones, setMindZones] = useState([] as any[])
  const [mindZoneSel, setMindZoneSel] = useState(null as any)
  const [mindView, setMindView] = useState(function () { return { scale: 1, ox: 0, oy: 0 } as any })
  const mindDragRef = useRef(null as any)
  const mindPanRef = useRef(null as any)
  const mindEntityRef = useRef(null as any)
  const mindZonesRef = useRef([] as any[])
  const mindZoneDragRef = useRef(null as any)
  const mindPointersRef = useRef(new Map() as any)
  const mindPinchRef = useRef(null as any)
  const persistMind = function (nodes: any[], edges: any[], zones?: any[]) { try { localStorage.setItem(mindEntityRef.current || MIND_KEY, JSON.stringify({ nodes: nodes, edges: edges, zones: zones || mindZonesRef.current || [] })) } catch (e) { /* noop */ } }
  const addMindNode = function () {
    const v = mindView || { scale: 1, ox: 0, oy: 0 }
    const sc = v.scale || 1
    const cx = (window.innerWidth / 2 - (v.ox || 0)) / sc
    const cy = (window.innerHeight / 2 - (v.oy || 0)) / sc
    const id = "mn_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
    let mindNodeColor = "#ff7043"
    try { const _ds = deepSpace; if (_ds && _ds.kind === "sphere") { const _st = soul.state[_ds.id]; mindNodeColor = dispColorOf(_ds.id, _st && _st.style && _st.style.color) } else if (_ds && _ds.kind === "spirit") { const _sp = spirits.filter(function (s: any) { return s.id === _ds.id })[0]; const _t = _sp ? (_sp.tier || 1) : 1; mindNodeColor = (_sp && _sp.color) ? _sp.color : (_t === 3 ? "#e6c66a" : _t === 2 ? "#9aa7ff" : "#dbe4ff") } } catch (e) { /* noop */ }
    const node = { id: id, x: Math.round(cx + (Math.random() * 50 - 25)), y: Math.round(cy + (Math.random() * 50 - 25)), text: "", color: mindNodeColor, shape: "circle", size: 88, done: false, due: "", kind: "idea", note: "" }
    const nodes = mindNodes.concat([node])
    setMindNodes(nodes); persistMind(nodes, mindEdges)
    setMindSel(id); setMindEdgeSel(null); setMindZoneSel(null); setMindLinkMode(false); setMindLinkFrom(null)
  }
  const patchMindNode = function (id: string, patch: any) {
    const nodes = mindNodes.map(function (n: any) { return n.id === id ? Object.assign({}, n, patch) : n })
    setMindNodes(nodes); persistMind(nodes, mindEdges)
  }
  const removeMindNode = function (id: string) {
    const nodes = mindNodes.filter(function (n: any) { return n.id !== id })
    const edges = mindEdges.filter(function (e: any) { return e.from !== id && e.to !== id })
    setMindNodes(nodes); setMindEdges(edges); persistMind(nodes, edges)
    setMindSel(function (v: any) { return v === id ? null : v })
  }
  const edgeKeyOf = function (ed: any) { return ed.id ? ed.id : (ed.from + "__" + ed.to) }
  const patchMindEdge = function (key: string, patch: any) {
    const edges = mindEdges.map(function (ed: any) { return edgeKeyOf(ed) === key ? Object.assign({}, ed, patch) : ed })
    setMindEdges(edges); persistMind(mindNodes, edges)
  }
  const removeMindEdge = function (key: string) {
    const edges = mindEdges.filter(function (ed: any) { return edgeKeyOf(ed) !== key })
    setMindEdges(edges); persistMind(mindNodes, edges)
    setMindEdgeSel(function (v: any) { return v === key ? null : v })
  }
  const onMindEdgeDown = function (key: string) {
    return function (e: React.PointerEvent) {
      e.stopPropagation()
      setMindEdgeSel(key); setMindSel(null); setMindLinkFrom(null); setMindLinkMode(false)
    }
  }
  const addMindZone = function () {
    const v = mindView || { scale: 1, ox: 0, oy: 0 }
    const sc = v.scale || 1
    const cx = (window.innerWidth / 2 - (v.ox || 0)) / sc
    const cy = (window.innerHeight / 2 - (v.oy || 0)) / sc
    const id = "mz_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
    const zone = { id: id, x: Math.round(cx - 200), y: Math.round(cy - 140), w: 400, h: 280, label: "", color: "#7b68ee" }
    const zones = mindZones.concat([zone])
    mindZonesRef.current = zones
    setMindZones(zones); persistMind(mindNodes, mindEdges, zones)
    setMindZoneSel(id); setMindSel(null); setMindEdgeSel(null)
  }
  const patchMindZone = function (id: string, patch: any) {
    const zones = mindZones.map(function (z: any) { return z.id === id ? Object.assign({}, z, patch) : z })
    mindZonesRef.current = zones
    setMindZones(zones); persistMind(mindNodes, mindEdges, zones)
  }
  const removeMindZone = function (id: string) {
    const zones = mindZones.filter(function (z: any) { return z.id !== id })
    mindZonesRef.current = zones
    setMindZones(zones); persistMind(mindNodes, mindEdges, zones)
    setMindZoneSel(function (v: any) { return v === id ? null : v })
  }
  const onMindZoneDown = function (id: string, mode: string) {
    return function (e: React.PointerEvent) {
      e.stopPropagation()
      try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      const z = mindZones.filter(function (zz: any) { return zz.id === id })[0]
      if (!z) return
      mindZoneDragRef.current = { id: id, mode: mode, sx: e.clientX, sy: e.clientY, x: z.x, y: z.y, w: z.w, h: z.h, moved: false }
      setMindZoneSel(id); setMindSel(null); setMindEdgeSel(null)
    }
  }
  const onMindZoneMove = function (e: React.PointerEvent) {
    const d = mindZoneDragRef.current
    if (!d) return
    const sc = (mindView && mindView.scale) || 1
    const dx = (e.clientX - d.sx) / sc
    const dy = (e.clientY - d.sy) / sc
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 3) d.moved = true
    if (!d.moved) return
    setMindZones(function (prev: any[]) {
      const next = prev.map(function (z: any) {
        if (z.id !== d.id) return z
        if (d.mode === "resize") return Object.assign({}, z, { w: Math.max(120, Math.round(d.w + dx)), h: Math.max(80, Math.round(d.h + dy)) })
        return Object.assign({}, z, { x: Math.round(d.x + dx), y: Math.round(d.y + dy) })
      })
      mindZonesRef.current = next
      return next
    })
  }
  const onMindZoneUp = function (e: React.PointerEvent) {
    const d = mindZoneDragRef.current
    mindZoneDragRef.current = null
    try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
    if (d && d.moved) persistMind(mindNodes, mindEdges)
  }
  const addGoalPlan = function () {
    const v = mindView || { scale: 1, ox: 0, oy: 0 }
    const sc = v.scale || 1
    const cx = Math.round((window.innerWidth / 2 - (v.ox || 0)) / sc)
    const cy = Math.round((window.innerHeight / 2 - (v.oy || 0)) / sc)
    let acc = "#4fc3f7"
    try { const _ds = deepSpace; if (_ds && _ds.kind === "sphere") { const _st = soul.state[_ds.id]; acc = dispColorOf(_ds.id, _st && _st.style && _st.style.color) } else if (_ds && _ds.kind === "spirit") { const _sp = spirits.filter(function (s: any) { return s.id === _ds.id })[0]; const _t = _sp ? (_sp.tier || 1) : 1; acc = (_sp && _sp.color) ? _sp.color : (_t === 3 ? "#e6c66a" : _t === 2 ? "#9aa7ff" : "#dbe4ff") } } catch (e) { /* noop */ }
    const t = Date.now()
    const goal = { id: "mn_" + t + "_g", x: cx, y: cy - 150, text: "\u0426\u0435\u043b\u044c", color: "#ffd43b", shape: "hexagon", size: 104, done: false, due: "", kind: "goal", note: "" }
    const s1 = { id: "mn_" + t + "_s1", x: cx - 200, y: cy + 40, text: "\u0428\u0430\u0433 1", color: acc, shape: "square", size: 88, done: false, due: "", kind: "step", note: "" }
    const s2 = { id: "mn_" + t + "_s2", x: cx, y: cy + 40, text: "\u0428\u0430\u0433 2", color: acc, shape: "square", size: 88, done: false, due: "", kind: "step", note: "" }
    const s3 = { id: "mn_" + t + "_s3", x: cx + 200, y: cy + 40, text: "\u0428\u0430\u0433 3", color: acc, shape: "square", size: 88, done: false, due: "", kind: "step", note: "" }
    const res = { id: "mn_" + t + "_r", x: cx, y: cy + 230, text: "\u0420\u0435\u0441\u0443\u0440\u0441\u044b", color: "#3ddc84", shape: "circle", size: 80, done: false, due: "", kind: "resource", note: "" }
    const nodes = mindNodes.concat([goal, s1, s2, s3, res])
    const edges = mindEdges.concat([{ from: goal.id, to: s1.id, arrow: true }, { from: goal.id, to: s2.id, arrow: true }, { from: goal.id, to: s3.id, arrow: true }, { from: s3.id, to: res.id, arrow: true }])
    setMindNodes(nodes); setMindEdges(edges); persistMind(nodes, edges)
    setMindSel(goal.id); setMindEdgeSel(null); setMindZoneSel(null); setMindLinkMode(false); setMindLinkFrom(null)
  }
  const toggleMindLink = function () { setMindLinkFrom(null); setMindLinkMode(function (v: boolean) { return !v }) }
  const zoomMind = function (f: number) { setMindView(function (v: any) { const cur = v || { scale: 1, ox: 0, oy: 0 }; const ns = Math.max(0.35, Math.min(2.6, (cur.scale || 1) * f)); return { scale: ns, ox: cur.ox || 0, oy: cur.oy || 0 } }) }
  const resetMindView = function () { setMindView({ scale: 1, ox: 0, oy: 0 }) }
  const onMindWheel = function (e: React.WheelEvent) { zoomMind(e.deltaY < 0 ? 1.12 : 0.9) }
  const onMindNodeDown = function (id: string) {
    return function (e: React.PointerEvent) {
      e.stopPropagation()
      try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      const n = mindNodes.filter(function (x: any) { return x.id === id })[0]
      mindDragRef.current = { id: id, sx: e.clientX, sy: e.clientY, bx: n ? n.x : 0, by: n ? n.y : 0, moved: false }
    }
  }
  const onMindNodeMove = function (e: React.PointerEvent) {
    const d = mindDragRef.current
    if (!d) return
    const sc = (mindView && mindView.scale) || 1
    const dx = (e.clientX - d.sx) / sc
    const dy = (e.clientY - d.sy) / sc
    if (!d.moved && Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true
    if (!d.moved) return
    setMindNodes(function (prev: any[]) { return prev.map(function (n: any) { return n.id === d.id ? Object.assign({}, n, { x: d.bx + dx, y: d.by + dy }) : n }) })
  }
  const onMindNodeUp = function (id: string) {
    return function (e: React.PointerEvent) {
      const d = mindDragRef.current
      mindDragRef.current = null
      try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
      if (!d) return
      if (!d.moved) {
        if (mindLinkMode) {
          if (!mindLinkFrom) { setMindLinkFrom(id) }
          else if (mindLinkFrom !== id) { const exists = mindEdges.some(function (ee: any) { return (ee.from === mindLinkFrom && ee.to === id) || (ee.from === id && ee.to === mindLinkFrom) }); const edges = exists ? mindEdges : mindEdges.concat([{ from: mindLinkFrom, to: id }]); setMindEdges(edges); persistMind(mindNodes, edges); setMindLinkFrom(null); setMindLinkMode(false) }
          else { setMindLinkFrom(null) }
        } else { setMindSel(id); setMindEdgeSel(null); setMindZoneSel(null) }
        return
      }
      const sc = (mindView && mindView.scale) || 1
      const dx = (e.clientX - d.sx) / sc
      const dy = (e.clientY - d.sy) / sc
      setMindNodes(function (prev: any[]) {
        const nodes = prev.map(function (n: any) { return n.id === d.id ? Object.assign({}, n, { x: d.bx + dx, y: d.by + dy }) : n })
        persistMind(nodes, mindEdges)
        return nodes
      })
    }
  }
  const onMindBoardDown = function (e: React.PointerEvent) {
    mindPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
    // Two fingers on the empty board start a pinch-to-zoom (mobile).
    if (mindPointersRef.current.size >= 2) {
      const pts = Array.from(mindPointersRef.current.values()) as any[]
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const v0 = mindView || { scale: 1, ox: 0, oy: 0 }
      let rect = { left: 0, top: 0 } as any
      try { rect = (e.currentTarget as any).getBoundingClientRect() } catch (err) { /* noop */ }
      mindPinchRef.current = { dist: Math.hypot(dx, dy) || 1, scale: v0.scale || 1, ox: v0.ox || 0, oy: v0.oy || 0, left: rect.left, top: rect.top }
      mindPanRef.current = null
      return
    }
    const v = mindView || { scale: 1, ox: 0, oy: 0 }
    mindPanRef.current = { sx: e.clientX, sy: e.clientY, ox: v.ox || 0, oy: v.oy || 0, moved: false }
  }
  const onMindBoardMove = function (e: React.PointerEvent) {
    if (mindPointersRef.current.has(e.pointerId)) mindPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    // Pinch: scale around the midpoint between the two fingers so it zooms where you pinch.
    if (mindPointersRef.current.size >= 2 && mindPinchRef.current) {
      const pts = Array.from(mindPointersRef.current.values()) as any[]
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const dist = Math.hypot(dx, dy) || 1
      const pr = mindPinchRef.current
      const ns = Math.max(0.35, Math.min(2.6, (pr.scale || 1) * (dist / pr.dist)))
      const mx = (pts[0].x + pts[1].x) / 2 - pr.left
      const my = (pts[0].y + pts[1].y) / 2 - pr.top
      const k = ns / (pr.scale || 1)
      setMindView({ scale: ns, ox: mx - (mx - pr.ox) * k, oy: my - (my - pr.oy) * k })
      return
    }
    const p = mindPanRef.current
    if (!p) return
    const dx2 = e.clientX - p.sx
    const dy2 = e.clientY - p.sy
    if (!p.moved && Math.abs(dx2) + Math.abs(dy2) > 4) p.moved = true
    if (!p.moved) return
    setMindView(function (v: any) { const cur = v || { scale: 1, ox: 0, oy: 0 }; return { scale: cur.scale, ox: p.ox + dx2, oy: p.oy + dy2 } })
  }
  const onMindBoardUp = function (e: React.PointerEvent) {
    mindPointersRef.current.delete(e.pointerId)
    try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
    if (mindPointersRef.current.size < 2) mindPinchRef.current = null
    if (mindPointersRef.current.size === 0) {
      const p = mindPanRef.current
      mindPanRef.current = null
      if (p && !p.moved) { setMindSel(null); setMindEdgeSel(null); setMindZoneSel(null); setMindLinkFrom(null); setMindLinkMode(false) }
    }
  }
  useEffect(function () {
    const ds = deepSpace
    if (!ds) return
    const key = "awara_soul_mindmap_" + ds.kind + "_" + ds.id + "_v1"
    mindEntityRef.current = key
    let nodes: any[] = []
    let edges: any[] = []
    let zones: any[] = []
    try { const raw = localStorage.getItem(key); if (raw) { const p = JSON.parse(raw); if (p && Array.isArray(p.nodes)) nodes = p.nodes; if (p && Array.isArray(p.edges)) edges = p.edges; if (p && Array.isArray(p.zones)) zones = p.zones } } catch (e) { /* noop */ }
    if (nodes.length === 0 && ds.kind === "sphere" && ds.id === "razum") {
      try { const old = localStorage.getItem("awara_soul_razum_mindmap_v1"); if (old) { const p = JSON.parse(old); if (p && Array.isArray(p.nodes) && p.nodes.length) { nodes = p.nodes; edges = Array.isArray(p.edges) ? p.edges : [] } } } catch (e) { /* noop */ }
    }
    mindZonesRef.current = zones
    setMindNodes(nodes); setMindEdges(edges); setMindZones(zones)
    setMindSel(null); setMindEdgeSel(null); setMindZoneSel(null); setMindLinkMode(false); setMindLinkFrom(null)
  }, [deepSpace])
  const [spirits, setSpirits] = useState(function () {
    try { const raw = localStorage.getItem("awara_soul_spirits_v2"); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a } } catch (e) { /* noop */ }
    try { const old = localStorage.getItem("awara_soul_spirits_v1"); if (old) { const a = JSON.parse(old); if (Array.isArray(a)) return a.map(function (s: any) { return Object.assign({ tier: 1 }, s) }) } } catch (e2) { /* noop */ }
    return [] as any[]
  })
  const spiritDragRef = useRef(null as any)
  // Spirits ride 3D orbit rings on the cosmos canvas (drawn in drawAuras), bound
  // to the live Soul + orbit-sphere geometry so they lean in 3D with the cosmos.
  spiritsRef.current = spirits
  // Each Spirit attracted onto the ray amplifies the shine of the soul + spheres.
  spiritGlowRef.current = Math.min(0.5, spirits.length * 0.045)
  const persistSpirits = function (arr: any[]) {
    try { localStorage.setItem("awara_soul_spirits_v2", JSON.stringify(arr)) } catch (e) { /* noop */ }
  }
  const saveSpirits = function (arr: any[]) { setSpirits(arr); persistSpirits(arr) }
  useEffect(function () {
    if (soulLevel < 7) return
    try { if (localStorage.getItem("awara_soul_spirit_seeded_v2")) return } catch (e) { return }
    setSpirits(function (prev: any[]) {
      if (prev.length > 0) return prev
      const seed = [{ id: "dukh_first", tier: 1, name: "", notes: "", subs: [] }]
      try { localStorage.setItem("awara_soul_spirits_v2", JSON.stringify(seed)); localStorage.setItem("awara_soul_spirit_seeded_v2", "1") } catch (e2) { /* noop */ }
      return seed
    })
  }, [soulLevel])
  const TIER_CAP = { 1: 7, 2: 4, 3: 1 } as any
  const tierOf = function (t: number) { return spirits.filter(function (s: any) { return (s.tier || 1) === t }) }
  const addSpiritTier = function (tier: number) {
    if (tierOf(tier).length >= TIER_CAP[tier]) return
    const id = "dukh_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
    saveSpirits(spirits.concat([{ id: id, tier: tier, name: "", notes: "", subs: [] }]))
  }
  const removeSpirit = function (id: string) {
    saveSpirits(spirits.filter(function (s: any) { return s.id !== id }))
    setSpiritOpenId(function (v: any) { return v === id ? null : v })
  }
  const addSpiritSub = function (id: string, text: string) {
    const t = (text || "").trim()
    if (!t) return
    saveSpirits(spirits.map(function (s: any) {
      if (s.id !== id) return s
      if ((s.subs || []).length >= 6) return s
      return Object.assign({}, s, { subs: (s.subs || []).concat([{ id: "ss_" + Date.now(), text: t }]) })
    }))
  }
  const removeSpiritSub = function (id: string, subId: string) {
    saveSpirits(spirits.map(function (s: any) {
      if (s.id !== id) return s
      return Object.assign({}, s, { subs: (s.subs || []).filter(function (x: any) { return x.id !== subId }) })
    }))
    setSpiritSubOpenId(function (v: any) { return v === subId ? null : v })
  }
  const patchSpirit = function (id: string, patch: any) {
    saveSpirits(spirits.map(function (s: any) { return s.id === id ? Object.assign({}, s, patch) : s }))
  }
  const patchSpiritSub = function (id: string, subId: string, patch: any) {
    saveSpirits(spirits.map(function (s: any) {
      if (s.id !== id) return s
      return Object.assign({}, s, { subs: (s.subs || []).map(function (x: any) { return x.id === subId ? Object.assign({}, x, patch) : x }) })
    }))
  }
  const onSpiritDown = function (id: string) {
    return function (e: React.PointerEvent) {
      try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      const sp = spirits.filter(function (s: any) { return s.id === id })[0]
      spiritDragRef.current = { id: id, sx: e.clientX, sy: e.clientY, bx: sp ? sp.x : 0, by: sp ? sp.y : 0, moved: false }
    }
  }
  const onSpiritMove = function (e: React.PointerEvent) {
    const d = spiritDragRef.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
    if (!d.moved) return
    setSpirits(function (prev: any[]) { return prev.map(function (s: any) { return s.id === d.id ? Object.assign({}, s, { x: d.bx + dx, y: d.by + dy }) : s }) })
  }
  const onSpiritUp = function (e: React.PointerEvent) {
    const d = spiritDragRef.current
    spiritDragRef.current = null
    try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
    if (!d) return
    if (!d.moved) { setSpiritOpenId(d.id); return }
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    const arr = spirits.map(function (s: any) { return s.id === d.id ? Object.assign({}, s, { x: d.bx + dx, y: d.by + dy }) : s })
    saveSpirits(arr)
  }
  const spiritStyleOf = function (s: any) {
    return { position: "absolute", left: "50%", top: "82px", transform: "translate(-50%, 0) translate(" + s.x + "px, " + s.y + "px)", width: "58px", height: "58px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "rgba(255,250,235,0.95)", background: "radial-gradient(circle at 50% 40%, rgba(255,252,240,0.6), rgba(245,225,255,0.16) 60%, rgba(245,225,255,0) 78%)", border: "1px solid rgba(255,250,235,0.6)", boxShadow: "0 0 24px rgba(255,245,220,0.65), 0 0 50px rgba(220,200,255,0.35)", cursor: "grab", touchAction: "none", zIndex: 34 } as React.CSSProperties
  }
  const SPIRIT_ADD = { position: "absolute", left: "50%", top: "150px", transform: "translateX(-50%)", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "rgba(255,245,225,0.9)", background: "rgba(40,30,60,0.6)", border: "1px solid rgba(255,250,235,0.4)", cursor: "pointer", zIndex: 34 } as React.CSSProperties

  // Iskra: the spark gathers the light + content of every sphere and reflects a
  // reading back. It also emits awara:iskra so a real AI agent (if mounted) can
  // answer with richer text via awara:iskra-result.
  const runIskra = function () {
    const ids = ALL_IDS
    const data: any[] = []
    let maxId = ids[0]
    let minId = ids[0]
    let maxL = -1
    let minL = 2
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const s = soul.state[id]
      const lit = clamp01(s.light || 0)
      const lvl = Math.max(1, Math.min(9, Math.floor(lit * 9) + 1))
      const cnt = contentCount(id)
      data.push({ id: id, name: SOUL_CANON[id].name, glyph: SOUL_CANON[id].glyph, lit: lit, lvl: lvl, cnt: cnt })
      if (lit > maxL) { maxL = lit; maxId = id }
      if (lit < minL) { minL = lit; minId = id }
    }
    const lines: string[] = []
    lines.push("\u2728 " + soulDisplayName + " \u00b7 \u041c\u0435\u0440\u0430 " + soulLevel + "/9 \u00b7 " + Math.round(soulGrowth * 100) + "%")
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      lines.push(d.glyph + " " + d.name + " \u2014 \u041c\u0435\u0440\u0430 " + d.lvl + " \u00b7 " + Math.round(d.lit * 100) + "% \u00b7 " + d.cnt + " \u2756")
    }
    lines.push("\u042f\u0440\u0447\u0435 \u0432\u0441\u0435\u0433\u043e: " + SOUL_CANON[maxId].name)
    lines.push("\u0421\u043b\u0430\u0431\u0435\u0435 \u0432\u0441\u0435\u0433\u043e: " + SOUL_CANON[minId].name)
    lines.push("\u0421\u043e\u0432\u0435\u0442: \u043d\u0430\u043f\u043e\u043b\u043d\u0438 \u0441\u0432\u0435\u0442\u043e\u043c \u00ab" + SOUL_CANON[minId].name + "\u00bb")
    const text = lines.join("\n")
    setIskraText(text)
    setIskraOpen(true)
    try { window.dispatchEvent(new CustomEvent("awara:iskra", { detail: { spheres: data, mera: soulLevel, growth: soulGrowth, summary: text } })) } catch (e) { /* noop */ }
  }

  function renderIskra() {
    const BODYW = { whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.65", color: "rgba(240,236,252,0.95)" } as React.CSSProperties
    return panelShell({
      color: "#e6c66a",
      lit: 1,
      title: "\u0418\u0441\u043a\u0440\u0430",
      prompt: "\u0410\u043d\u0430\u043b\u0438\u0437 \u0441\u0432\u0435\u0442\u0430 \u0432\u0441\u0435\u0445 \u0441\u0444\u0435\u0440",
      sigil: sigilFor("soul", "62%", 0.95),
      onClose: function () { setIskraOpen(false) },
      children: (<div style={BODYW}>{iskraText}</div>),
    })
  }

  // Razum deep space: an interactive mind-map board. Draggable shaped nodes you
  // can write into, recolor, reshape and resize; link them; pan + zoom the board.
  function renderRazumMind(accent: string) {
    const view = mindView || { scale: 1, ox: 0, oy: 0 }
    const sc = view.scale || 1
    const gridStep = (40 * sc).toFixed(2)
    const BOARD = { flex: "1 1 auto", position: "relative", margin: "8px 14px 14px", borderRadius: "16px", border: "1px solid " + hexToRgba(accent, 0.3), overflow: "hidden", background: "radial-gradient(120% 100% at 50% 0%, " + hexToRgba(accent, 0.07) + ", rgba(0,0,0,0) 62%), rgba(8,6,16,0.4)", touchAction: "none" } as React.CSSProperties
    const GRID = { position: "absolute", left: "0px", top: "0px", right: "0px", bottom: "0px", backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) " + gridStep + "px), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) " + gridStep + "px)", backgroundPosition: view.ox + "px " + view.oy + "px", pointerEvents: "none" } as React.CSSProperties
    const WORLD = { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px", transform: "translate(" + view.ox + "px, " + view.oy + "px) scale(" + sc + ")", transformOrigin: "0 0" } as React.CSSProperties
    const SVG = { position: "absolute", left: "-2000px", top: "-1500px", width: "4000px", height: "3000px", overflow: "visible", pointerEvents: "none" } as React.CSSProperties
    const EHIT = { pointerEvents: "stroke", cursor: "pointer" } as React.CSSProperties
    const ENONE = { pointerEvents: "none" } as React.CSSProperties
    const TOOLBAR = { position: "absolute", right: "12px", top: "12px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 4 } as React.CSSProperties
    const tbtn = { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", color: "rgba(245,240,255,0.95)", background: "rgba(20,16,38,0.72)", border: "1px solid " + hexToRgba(accent, 0.4), boxShadow: "0 0 12px rgba(0,0,0,0.3)" } as React.CSSProperties
    const tbtnLink = Object.assign({}, tbtn, mindLinkMode ? { background: hexToRgba(accent, 0.35), border: "1px solid " + hexToRgba(accent, 0.85), color: "rgba(255,250,245,1)" } : {}) as React.CSSProperties
    const HINT = { position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-50%)", fontSize: "13px", fontStyle: "italic", color: "rgba(206,198,230,0.5)", pointerEvents: "none", textAlign: "center", maxWidth: "260px", lineHeight: "1.6" } as React.CSSProperties
    const todayStr = new Date().toISOString().slice(0, 10)
    const nodeEl = function (n: any) {
      const seld = mindSel === n.id
      const fromd = mindLinkFrom === n.id
      let br = "50%"
      let clip = "none"
      if (n.shape === "square") { br = "16%" } else if (n.shape === "diamond") { br = "8%"; clip = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" } else if (n.shape === "triangle") { clip = "polygon(50% 2%, 100% 100%, 0% 100%)"; br = "0%" } else if (n.shape === "hexagon") { clip = "polygon(25% 2%, 75% 2%, 100% 50%, 75% 98%, 25% 98%, 0% 50%)"; br = "0%" }
      const col = n.color || accent
      const sz = n.size || 88
      const done = !!n.done
      const kind = n.kind || "idea"
      const glyph = kind === "goal" ? "\u2605" : kind === "step" ? "\u2192" : kind === "resource" ? "\u25C8" : ""
      const overdue = !!n.due && !done && n.due < todayStr
      const WRAP = { position: "absolute", left: n.x + "px", top: n.y + "px", width: sz + "px", height: sz + "px", transform: "translate(-50%, -50%)", cursor: "grab", touchAction: "none", opacity: done ? 0.62 : 1 } as React.CSSProperties
      const SHAPE = { position: "absolute", left: "0px", top: "0px", width: sz + "px", height: sz + "px", borderRadius: br, clipPath: clip, WebkitClipPath: clip, background: "radial-gradient(circle at 38% 30%, " + hexToRgba(col, 0.96) + ", " + hexToRgba(col, 0.55) + " 68%, rgba(10,8,20,0.88))", border: seld ? "2px solid rgba(255,255,255,0.92)" : "1px solid " + hexToRgba(col, 0.7), boxShadow: (seld ? "0 0 22px " + hexToRgba(col, 0.8) : "0 0 14px " + hexToRgba(col, 0.4)) + (fromd ? ", 0 0 0 3px rgba(255,255,255,0.55)" : ""), display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", boxSizing: "border-box", pointerEvents: "none" } as React.CSSProperties
      const TXT = { fontSize: "12px", lineHeight: "1.25", color: "rgba(255,250,245,0.97)", textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.6)", overflow: "hidden", maxHeight: "100%", wordBreak: "break-word", pointerEvents: "none", textDecoration: done ? "line-through" : "none" } as React.CSSProperties
      const BADGE = { position: "absolute", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" } as React.CSSProperties
      const GBADGE = Object.assign({}, BADGE, { left: "-6px", top: "-6px", background: "rgba(16,12,32,0.92)", color: hexToRgba(col, 1), border: "1px solid " + hexToRgba(col, 0.8) }) as React.CSSProperties
      const DBADGE = Object.assign({}, BADGE, { right: "-6px", top: "-6px", background: "#3ddc84", color: "rgba(8,20,12,0.95)", border: "1px solid rgba(255,255,255,0.6)" }) as React.CSSProperties
      const NBADGE = Object.assign({}, BADGE, { right: "-6px", bottom: "-6px", background: "rgba(16,12,32,0.92)", color: "rgba(245,240,255,0.9)", border: "1px solid rgba(150,130,210,0.5)", fontSize: "11px" }) as React.CSSProperties
      const DUE = { position: "absolute", left: "50%", bottom: "-9px", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: "10px", lineHeight: "1", padding: "3px 7px", borderRadius: "8px", pointerEvents: "none", background: overdue ? "rgba(120,30,30,0.92)" : "rgba(16,12,32,0.92)", color: overdue ? "rgba(255,225,225,0.98)" : "rgba(228,222,246,0.92)", border: "1px solid " + (overdue ? "rgba(220,90,90,0.7)" : "rgba(150,130,210,0.4)") } as React.CSSProperties
      return (
        <div key={n.id} style={WRAP} onPointerDown={onMindNodeDown(n.id)} onPointerMove={onMindNodeMove} onPointerUp={onMindNodeUp(n.id)} onPointerCancel={onMindNodeUp(n.id)}>
          <div style={SHAPE}><div style={TXT}>{n.text || ""}</div></div>
          {glyph ? <div style={GBADGE}>{glyph}</div> : null}
          {done ? <div style={DBADGE}>{"\u2713"}</div> : null}
          {n.note ? <div style={NBADGE}>{"\u270E"}</div> : null}
          {n.due ? <div style={DUE}>{n.due}</div> : null}
        </div>
      )
    }
    const zoneEl = function (z: any) {
      const zon = mindZoneSel === z.id
      const zcol = z.color || "#7b68ee"
      const ZONE = { position: "absolute", left: z.x + "px", top: z.y + "px", width: z.w + "px", height: z.h + "px", borderRadius: "14px", border: (zon ? "2px" : "1px") + " dashed " + hexToRgba(zcol, zon ? 0.95 : 0.6), background: hexToRgba(zcol, 0.07), boxSizing: "border-box", cursor: "move", touchAction: "none" } as React.CSSProperties
      const ZLBL = { position: "absolute", left: "10px", top: "-12px", fontSize: "11px", letterSpacing: "0.08em", padding: "2px 9px", borderRadius: "8px", background: "rgba(16,12,32,0.92)", color: hexToRgba(zcol, 1), border: "1px solid " + hexToRgba(zcol, 0.6), pointerEvents: "none", whiteSpace: "nowrap" } as React.CSSProperties
      const ZRES = { position: "absolute", right: "-7px", bottom: "-7px", width: "16px", height: "16px", borderRadius: "5px", background: hexToRgba(zcol, 0.85), border: "1px solid rgba(255,255,255,0.7)", cursor: "nwse-resize", touchAction: "none" } as React.CSSProperties
      return (
        <div key={z.id} style={ZONE} onPointerDown={onMindZoneDown(z.id, "move")} onPointerMove={onMindZoneMove} onPointerUp={onMindZoneUp} onPointerCancel={onMindZoneUp}>
          <div style={ZLBL}>{z.label || "\u042d\u0442\u0430\u043f"}</div>
          <div style={ZRES} onPointerDown={onMindZoneDown(z.id, "resize")} />
        </div>
      )
    }
    const sel = mindNodes.filter(function (n: any) { return n.id === mindSel })[0]
    let selEdge: any = null
    let selEdgeKey: any = null
    mindEdges.forEach(function (ed: any) { const ek = edgeKeyOf(ed); if (ek === mindEdgeSel) { selEdge = ed; selEdgeKey = ek } })
    const selZone = mindZones.filter(function (z: any) { return z.id === mindZoneSel })[0]
    const COLORS = ["#ff7043", "#ffd43b", "#3ddc84", "#4fc3f7", "#7b68ee", "#b06ce0", "#ff6b9d", "#f3f0ff"]
    const SHAPES = [["circle", "\u25CF"], ["square", "\u25A0"], ["diamond", "\u25C6"], ["triangle", "\u25B2"], ["hexagon", "\u2B22"]]
    const EDITOR = { position: "absolute", left: "50%", bottom: "12px", transform: "translateX(-50%)", width: "min(520px, 92%)", display: "flex", flexDirection: "column", gap: "8px", padding: "10px 12px", borderRadius: "14px", background: "rgba(16,12,32,0.88)", border: "1px solid " + hexToRgba(accent, 0.45), boxShadow: "0 -8px 30px rgba(0,0,0,0.4)", zIndex: 6, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" } as React.CSSProperties
    const EROW = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" } as React.CSSProperties
    const ELBL = { fontSize: "12px", letterSpacing: "0.04em", color: "rgba(232,226,248,0.75)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as React.CSSProperties
    const EX = { cursor: "pointer", color: "rgba(228,222,246,0.85)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.22)", borderRadius: "8px", width: "26px", height: "26px", fontSize: "13px" } as React.CSSProperties
    const ETA = { width: "100%", boxSizing: "border-box", minHeight: "58px", resize: "vertical", padding: "8px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid " + hexToRgba(accent, 0.3), color: "rgba(240,236,252,0.96)", fontSize: "14px", lineHeight: "1.45", outline: "none" } as React.CSSProperties
    const EROW2 = { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } as React.CSSProperties
    const EROW3 = { display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties
    const ELBL2 = { fontSize: "12px", color: "rgba(214,206,238,0.7)" } as React.CSSProperties
    const swatch = function (c: string, on: boolean) { return { width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", background: c, border: on ? "2px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.25)", boxShadow: on ? "0 0 10px " + c : "none" } as React.CSSProperties }
    const shapeBtn = function (on: boolean) { return { width: "34px", height: "30px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", color: "rgba(245,240,255,0.95)", background: on ? hexToRgba(accent, 0.3) : "rgba(255,255,255,0.05)", border: on ? "1px solid " + hexToRgba(accent, 0.7) : "1px solid rgba(150,130,210,0.2)" } as React.CSSProperties }
    const ebtn = { width: "30px", height: "30px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", color: "rgba(245,240,255,0.95)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,130,210,0.25)" } as React.CSSProperties
    const edel = { marginLeft: "auto", cursor: "pointer", color: "rgba(235,170,170,0.9)", background: "rgba(80,30,30,0.32)", border: "1px solid rgba(200,90,90,0.4)", borderRadius: "9px", padding: "6px 10px", fontSize: "12px" } as React.CSSProperties
    const taskNodes = mindNodes.filter(function (n: any) { return n.kind === "step" || n.kind === "goal" })
    const doneTasks = taskNodes.filter(function (n: any) { return !!n.done }).length
    const pct = taskNodes.length ? Math.round((doneTasks / taskNodes.length) * 100) : 0
    const PROG = { position: "absolute", left: "12px", top: "12px", display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "11px", background: "rgba(16,12,32,0.78)", border: "1px solid " + hexToRgba(accent, 0.4), zIndex: 5, fontSize: "12px", color: "rgba(238,232,252,0.92)" } as React.CSSProperties
    const PBAR = { position: "relative", width: "84px", height: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.12)", overflow: "hidden" } as React.CSSProperties
    const PFILL = { position: "absolute", left: "0px", top: "0px", bottom: "0px", width: pct + "%", background: hexToRgba(accent, 0.95) } as React.CSSProperties
    const NTYPES = [["idea", "\u0418\u0434\u0435\u044f"], ["goal", "\u0426\u0435\u043b\u044c"], ["step", "\u0428\u0430\u0433"], ["resource", "\u0420\u0435\u0441\u0443\u0440\u0441"]]
    const typeBtn = function (on: boolean) { return { flex: "1 1 0", padding: "6px 4px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", color: "rgba(245,240,255,0.95)", background: on ? hexToRgba(accent, 0.3) : "rgba(255,255,255,0.05)", border: on ? "1px solid " + hexToRgba(accent, 0.7) : "1px solid rgba(150,130,210,0.2)" } as React.CSSProperties }
    const dinput = { flex: "1 1 auto", boxSizing: "border-box", padding: "6px 9px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid " + hexToRgba(accent, 0.3), color: "rgba(240,236,252,0.96)", fontSize: "13px", outline: "none", colorScheme: "dark" } as React.CSSProperties
    const togBtn = function (on: boolean) { return { display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", padding: "6px 11px", borderRadius: "9px", fontSize: "12px", color: on ? "rgba(20,30,16,0.95)" : "rgba(232,226,248,0.85)", background: on ? "#3ddc84" : "rgba(255,255,255,0.06)", border: "1px solid " + (on ? "rgba(255,255,255,0.5)" : "rgba(150,130,210,0.25)") } as React.CSSProperties }
    const ELBL3 = { fontSize: "12px", color: "rgba(214,206,238,0.7)", whiteSpace: "nowrap" } as React.CSSProperties
    const noteTA = { width: "100%", boxSizing: "border-box", minHeight: "42px", resize: "vertical", padding: "7px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.045)", border: "1px solid rgba(150,130,210,0.22)", color: "rgba(232,228,246,0.92)", fontSize: "12.5px", lineHeight: "1.4", outline: "none" } as React.CSSProperties
    const stop = function (e: React.PointerEvent) { e.stopPropagation() }
    return (
      <div style={BOARD} onPointerDown={onMindBoardDown} onPointerMove={onMindBoardMove} onPointerUp={onMindBoardUp} onPointerCancel={onMindBoardUp} onWheel={onMindWheel}>
        <div style={GRID} />
        {taskNodes.length > 0 ? (
          <div style={PROG}>
            <span>{"\u2713 " + doneTasks + "/" + taskNodes.length + " \u00b7 " + pct + "%"}</span>
            <div style={PBAR}><div style={PFILL} /></div>
          </div>
        ) : null}
        <div style={WORLD}>
          {mindZones.map(function (z: any) { return zoneEl(z) })}
          <svg style={SVG} viewBox="-2000 -1500 4000 3000">
            {mindEdges.map(function (ed: any, i: number) {
              const a = mindNodes.filter(function (n: any) { return n.id === ed.from })[0]
              const b = mindNodes.filter(function (n: any) { return n.id === ed.to })[0]
              if (!a || !b) return null
              const ek = edgeKeyOf(ed)
              const ecol = ed.color || accent
              const eon = mindEdgeSel === ek
              const ang = Math.atan2(b.y - a.y, b.x - a.x)
              const br2 = (b.size || 88) / 2 + 4
              const tipx = b.x - Math.cos(ang) * br2
              const tipy = b.y - Math.sin(ang) * br2
              const ah = 14
              const aw = 7
              const perp = ang + Math.PI / 2
              const p1x = tipx - Math.cos(ang) * ah + Math.cos(perp) * aw
              const p1y = tipy - Math.sin(ang) * ah + Math.sin(perp) * aw
              const p2x = tipx - Math.cos(ang) * ah - Math.cos(perp) * aw
              const p2y = tipy - Math.sin(ang) * ah - Math.sin(perp) * aw
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              const LBLST = { fontSize: "13px", fill: "rgba(245,240,255,0.96)", paintOrder: "stroke", stroke: "rgba(10,8,20,0.9)", strokeWidth: 4, strokeLinejoin: "round" } as React.CSSProperties
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(0,0,0,0)" strokeWidth={16} style={EHIT} onPointerDown={onMindEdgeDown(ek)} />
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hexToRgba(ecol, eon ? 0.98 : 0.62)} strokeWidth={eon ? 4 : 2.2} style={ENONE} />
                  {ed.arrow ? <polygon points={tipx + "," + tipy + " " + p1x + "," + p1y + " " + p2x + "," + p2y} fill={hexToRgba(ecol, eon ? 0.98 : 0.78)} style={ENONE} /> : null}
                  {ed.label ? <text x={mx} y={my - 6} textAnchor="middle" style={LBLST}>{ed.label}</text> : null}
                </g>
              )
            })}
          </svg>
          {mindNodes.map(function (n: any) { return nodeEl(n) })}
        </div>
        {mindNodes.length === 0 ? <div style={HINT}>{"\u0414\u043e\u0431\u0430\u0432\u044c \u043f\u0435\u0440\u0432\u044b\u0439 \u0443\u0437\u0435\u043b \u043a\u043d\u043e\u043f\u043a\u043e\u0439 \u2295 \u0438 \u043d\u0430\u0447\u043d\u0438 \u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0431\u0443\u0434\u0443\u0449\u0435\u0435"}</div> : null}
        <div style={TOOLBAR} onPointerDown={stop}>
          <button type="button" style={tbtn} title={"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0443\u0437\u0435\u043b"} onClick={addMindNode}>{"\u2295"}</button>
          <button type="button" style={tbtnLink} title={"\u0421\u0432\u044f\u0437\u0430\u0442\u044c \u0443\u0437\u043b\u044b"} onClick={toggleMindLink}>{"\u221e"}</button>
          <button type="button" style={tbtn} title={"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u043e\u043d\u0443 \u044d\u0442\u0430\u043f\u0430"} onClick={addMindZone}>{"\u25A1"}</button>
          <button type="button" style={tbtn} title={"\u041f\u043b\u0430\u043d \u0446\u0435\u043b\u0438"} onClick={addGoalPlan}>{"\u2605"}</button>
          <button type="button" style={tbtn} title={"\u041f\u0440\u0438\u0431\u043b\u0438\u0437\u0438\u0442\u044c"} onClick={function () { zoomMind(1.15) }}>{"+"}</button>
          <button type="button" style={tbtn} title={"\u041e\u0442\u0434\u0430\u043b\u0438\u0442\u044c"} onClick={function () { zoomMind(0.87) }}>{"\u2212"}</button>
          <button type="button" style={tbtn} title={"\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0432\u0438\u0434"} onClick={resetMindView}>{"\u21bb"}</button>
        </div>
        {sel ? (
          <div style={EDITOR} onPointerDown={stop}>
            <div style={EROW}>
              <span style={ELBL}>{sel.text ? sel.text : "\u0423\u0437\u0435\u043b"}</span>
              <button type="button" style={EX} onClick={function () { setMindSel(null) }}>{"\u2715"}</button>
            </div>
            <textarea style={ETA} value={sel.text || ""} placeholder={"\u041f\u0438\u0448\u0438 \u0432\u043d\u0443\u0442\u0440\u044c \u0443\u0437\u043b\u0430..."} onChange={function (e: any) { patchMindNode(sel.id, { text: e.target.value }) }} />
            <div style={EROW2}>
              {NTYPES.map(function (tp: any) { return <button key={tp[0]} type="button" style={typeBtn((sel.kind || "idea") === tp[0])} onClick={function () { patchMindNode(sel.id, { kind: tp[0] }) }}>{tp[1]}</button> })}
            </div>
            <div style={EROW3}>
              <button type="button" style={togBtn(!!sel.done)} onClick={function () { patchMindNode(sel.id, { done: !sel.done }) }}>{(sel.done ? "\u2713 " : "") + "\u0412\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e"}</button>
              <span style={ELBL3}>{"\u0421\u0440\u043e\u043a"}</span>
              <input type="date" style={dinput} value={sel.due || ""} onChange={function (e: any) { patchMindNode(sel.id, { due: e.target.value }) }} />
            </div>
            <textarea style={noteTA} value={sel.note || ""} placeholder={"\u0417\u0430\u043c\u0435\u0442\u043a\u0438..."} onChange={function (e: any) { patchMindNode(sel.id, { note: e.target.value }) }} />
            <div style={EROW2}>
              {COLORS.map(function (c: string) { return <button key={c} type="button" style={swatch(c, sel.color === c)} onClick={function () { patchMindNode(sel.id, { color: c }) }} /> })}
            </div>
            <div style={EROW2}>
              {SHAPES.map(function (sp: any) { return <button key={sp[0]} type="button" style={shapeBtn(sel.shape === sp[0])} onClick={function () { patchMindNode(sel.id, { shape: sp[0] }) }}>{sp[1]}</button> })}
            </div>
            <div style={EROW3}>
              <button type="button" style={ebtn} onClick={function () { patchMindNode(sel.id, { size: Math.max(48, (sel.size || 88) - 16) }) }}>{"\u2212"}</button>
              <span style={ELBL2}>{"\u0420\u0430\u0437\u043c\u0435\u0440"}</span>
              <button type="button" style={ebtn} onClick={function () { patchMindNode(sel.id, { size: Math.min(220, (sel.size || 88) + 16) }) }}>{"+"}</button>
              <button type="button" style={edel} onClick={function () { removeMindNode(sel.id) }}>{"\u2715 \u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</button>
            </div>
          </div>
        ) : null}
        {!sel && selEdge ? (
          <div style={EDITOR} onPointerDown={stop}>
            <div style={EROW}>
              <span style={ELBL}>{"\u0426\u0432\u0435\u0442 \u0441\u0432\u044f\u0437\u0438"}</span>
              <button type="button" style={EX} onClick={function () { setMindEdgeSel(null) }}>{"\u2715"}</button>
            </div>
            <div style={EROW2}>
              {COLORS.map(function (c: string) { return <button key={c} type="button" style={swatch(c, selEdge.color === c || (!selEdge.color && c === accent))} onClick={function () { patchMindEdge(selEdgeKey, { color: c }) }} /> })}
            </div>
            <div style={EROW3}>
              <button type="button" style={edel} onClick={function () { removeMindEdge(selEdgeKey) }}>{"\u2715 \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0432\u044f\u0437\u044c"}</button>
            </div>
          </div>
        ) : null}
        {!sel && !selEdge && selZone ? (
          <div style={EDITOR} onPointerDown={stop}>
            <div style={EROW}>
              <span style={ELBL}>{"\u0417\u043e\u043d\u0430 \u044d\u0442\u0430\u043f\u0430"}</span>
              <button type="button" style={EX} onClick={function () { setMindZoneSel(null) }}>{"\u2715"}</button>
            </div>
            <input type="text" style={dinput} value={selZone.label || ""} placeholder={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u043f\u0430..."} onChange={function (e: any) { patchMindZone(selZone.id, { label: e.target.value }) }} />
            <div style={EROW2}>
              {COLORS.map(function (c: string) { return <button key={c} type="button" style={swatch(c, selZone.color === c)} onClick={function () { patchMindZone(selZone.id, { color: c }) }} /> })}
            </div>
            <div style={EROW3}>
              <button type="button" style={edel} onClick={function () { removeMindZone(selZone.id) }}>{"\u2715 \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u043e\u043d\u0443"}</button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }
  // Deep space: full-window schematic. Every sphere AND Spirit opens its own
  // interactive mind-map organizer (separate storage per entity).
  function renderDeepSpace() {
    const ds = deepSpace as { kind: string; id: string }
    if (!ds) return null
    let title = ""
    let color = "#b06ce0"
    let sigil: any = null
    if (ds.kind === "spirit") {
      const sp = spirits.filter(function (s: any) { return s.id === ds.id })[0]
      if (!sp) return null
      const tier = sp.tier || 1
      color = sp.color || (tier === 3 ? "#e6c66a" : tier === 2 ? "#9aa7ff" : "#dbe4ff")
      const defName = tier === 3 ? "\u0414\u0443\u0445 \u0415\u0434\u0438\u043d\u043e\u0433\u043e" : tier === 2 ? "\u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u044b\u0439 \u0434\u0443\u0445 \u041b\u043e\u0433\u043e\u0441\u0430" : "\u0411\u044b\u0442\u043e\u0432\u043e\u0439 \u0434\u0443\u0445"
      title = sp.name ? sp.name : defName
      sigil = sigilFor("spirit", "100%", 0.95)
    } else if (ds.kind === "axis") {
      color = ds.id === "dr" ? "#e6c66a" : "#dbe4ff"
      title = ds.id === "dr" ? "\u0414\u0443\u0445 \u0420\u0430 \u00B7 \u041B\u043E\u0433\u043E\u0441" : "\u0412\u044B\u0441\u0448\u0435\u0435 \u042F"
      sigil = sigilFor(ds.id === "dr" ? "spirit" : "soul", "100%", 0.95)
    } else {
      const id = ds.id as SoulSphereId
      const canon = SOUL_CANON[id]
      if (!canon) return null
      const s = soul.state[id]
      color = dispColorOf(id, s.style && s.style.color)
      title = id === "soul" ? soulDisplayName : canon.name
      sigil = sigilFor(id, "100%", 0.95)
    }
    const OVERLAY = { position: "absolute", left: "0px", top: "0px", right: "0px", bottom: "0px", zIndex: 60, display: "flex", flexDirection: "column", overflow: "hidden", background: "radial-gradient(95% 62% at 50% 4%, " + hexToRgba(color, 0.24) + ", rgba(8,6,16,0) 58%), radial-gradient(80% 70% at 50% 112%, " + hexToRgba(color, 0.14) + ", rgba(6,5,14,0) 60%), radial-gradient(150% 120% at 50% 50%, rgba(12,9,24,0.0), rgba(4,3,10,0.96) 80%), linear-gradient(180deg, rgba(10,8,20,0.98), rgba(5,4,12,0.99))", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } as React.CSSProperties
    const AURA = { position: "absolute", left: "50%", top: "-14%", width: "min(640px, 96vw)", height: "460px", transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle at 50% 42%, " + hexToRgba(color, 0.42) + ", rgba(0,0,0,0) 66%)", filter: "blur(48px)", pointerEvents: "none", zIndex: 0, animation: "deepAura 8s ease-in-out infinite" } as React.CSSProperties
    const BACK = { position: "absolute", left: "16px", top: "16px", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", color: "rgba(236,230,250,0.92)", background: "rgba(255,255,255,0.07)", border: "1px solid " + hexToRgba(color, 0.45), boxShadow: "0 0 16px " + hexToRgba(color, 0.3), zIndex: 3 } as React.CSSProperties
    const HEAD = { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", paddingTop: "30px", zIndex: 2 } as React.CSSProperties
    const ORBWRAP = { position: "relative", width: "82px", height: "82px", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties
    const HALO = { position: "absolute", left: "50%", top: "50%", width: "82px", height: "82px", transform: "translate(-50%,-50%)", borderRadius: "50%", border: "1px solid " + hexToRgba(color, 0.55), boxShadow: "0 0 30px " + hexToRgba(color, 0.5) + ", inset 0 0 20px " + hexToRgba(color, 0.32), pointerEvents: "none", animation: "deepHalo 4.5s ease-in-out infinite" } as React.CSSProperties
    const ORB = { position: "relative", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: sphereBg(color, 9, 0), boxShadow: sphereFrame(20, color, 9) } as React.CSSProperties
    const TITLE = { fontSize: "22px", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(248,245,255,0.99)", textShadow: "0 0 24px " + hexToRgba(color, 0.6) } as React.CSSProperties
    const SUB = { fontSize: "11px", letterSpacing: "0.2em", color: "rgba(214,206,238,0.6)" } as React.CSSProperties
    const DIVLINE = { width: "128px", height: "1px", marginTop: "3px", background: "linear-gradient(90deg, rgba(0,0,0,0), " + hexToRgba(color, 0.75) + ", rgba(0,0,0,0))", boxShadow: "0 0 8px " + hexToRgba(color, 0.5) } as React.CSSProperties
    const DEEP_KEY = "@keyframes deepAura{0%,100%{opacity:0.68;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}@keyframes deepHalo{0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.95;transform:translate(-50%,-50%) scale(1.12)}}"
    const STAGE = { flex: "1 1 auto", margin: "18px", borderRadius: "18px", border: "1px dashed " + hexToRgba(color, 0.4), background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 40px)", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties
    const EMPTY = { fontSize: "13px", color: "rgba(206,198,230,0.5)", fontStyle: "italic", textAlign: "center", lineHeight: "1.6", maxWidth: "340px", padding: "0 20px" } as React.CSSProperties
    const DESC = { maxWidth: "440px", margin: "4px 20px 0", fontSize: "12.5px", lineHeight: "1.6", textAlign: "center", color: "rgba(226,220,246,0.82)" } as React.CSSProperties
    return (
      <div style={OVERLAY}>
        <style>{DEEP_KEY}</style>
        <div style={AURA} />
        <button type="button" style={BACK} title={"\u041d\u0430\u0437\u0430\u0434"} onClick={function () { setDeepSpace(null) }}>{"\u2190"}</button>
        <div style={HEAD}>
          <div style={ORBWRAP}>
            <div style={HALO} />
            <div style={ORB}>{sigil}</div>
          </div>
          <div style={TITLE}>{title}</div>
          <div style={SUB}>{"\u0413\u041b\u0423\u0411\u0418\u041d\u041d\u041e\u0415 \u041f\u0420\u041e\u0421\u0422\u0420\u0410\u041d\u0421\u0422\u0412\u041e"}</div>
          <div style={DIVLINE} />
          {ds.kind === "axis" ? <div style={DESC}>{ds.id === "dr" ? DR_DESC : HS_DESC}</div> : null}
        </div>
        {ds.kind === "sphere" || ds.kind === "spirit" || ds.kind === "axis" ? renderRazumMind(color) : (
          <div style={STAGE}>
            <div style={EMPTY}>{"\u041f\u0443\u0441\u0442\u043e\u0435 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e. \u0417\u0434\u0435\u0441\u044c \u0431\u0443\u0434\u0435\u0442 \u0441\u0432\u043e\u044f \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u2014 \u0441\u043a\u0430\u0436\u0438, \u0447\u0442\u043e \u0438 \u0433\u0434\u0435 \u0440\u0430\u0437\u043c\u0435\u0441\u0442\u0438\u0442\u044c."}</div>
          </div>
        )}
      </div>
    )
  }

  const axisPosRef = useRef((function () { try { const raw = localStorage.getItem("awara_soul_axis_v1"); return raw ? JSON.parse(raw) : { hs: { x: 0, y: 0 }, dr: { x: 0, y: 0 } } } catch (e) { return { hs: { x: 0, y: 0 }, dr: { x: 0, y: 0 } } } })())
  const [axisPos, setAxisPos] = useState(axisPosRef.current)
  const axisDragRef = useRef(null as any)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const [axisHover, setAxisHover] = useState("")
  useEffect(function () {
    function measure() { const st = stageRef.current; if (st) setStageSize({ w: st.clientWidth, h: st.clientHeight }) }
    measure()
    window.addEventListener("resize", measure)
    const iv = setInterval(measure, 1200)
    return function () { window.removeEventListener("resize", measure); clearInterval(iv) }
  }, [])
  const onAxisDown = function (which: string) {
    return function (e: React.PointerEvent) {
      e.stopPropagation()
      try { (e.currentTarget as any).setPointerCapture(e.pointerId) } catch (err) { /* noop */ }
      const p = (axisPos as any)[which] || { x: 0, y: 0 }
      axisDragRef.current = { which: which, sx: e.clientX, sy: e.clientY, bx: p.x, by: p.y, moved: false }
    }
  }
  const onAxisMove = function (e: React.PointerEvent) {
    const d = axisDragRef.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    if (!d.moved) return
    setAxisPos(function (prev: any) { const nx = Object.assign({}, prev); nx[d.which] = { x: d.bx + dx, y: d.by + dy }; axisPosRef.current = nx; return nx })
  }
  const onAxisUp = function (e: React.PointerEvent) {
    const d = axisDragRef.current
    axisDragRef.current = null
    try { (e.currentTarget as any).releasePointerCapture(e.pointerId) } catch (err) { /* noop */ }
    if (d && d.moved) { try { localStorage.setItem("awara_soul_axis_v1", JSON.stringify(axisPosRef.current)) } catch (err) { /* noop */ } }
    else if (d && !d.moved) { setAxisHover(""); setDeepSpace({ kind: "axis", id: d.which } as any) }
  }
  const axisGlow = clamp01(soulGrowth)
  const AXIS_SVG = { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 } as React.CSSProperties
  const HIGHER_SELF = { position: "absolute", left: "50%", top: "9%", width: "40px", height: "40px", transform: "translate(-50%, -50%) translate(" + (axisPos.hs ? axisPos.hs.x : 0) + "px, " + (axisPos.hs ? axisPos.hs.y : 0) + "px)", borderRadius: "50%", background: "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.99), rgba(246,249,255,0.7) 46%, rgba(214,228,255,0.16) 74%, rgba(0,0,0,0) 86%)", boxShadow: "0 0 " + (16 + 34 * axisGlow) + "px rgba(255,255,255," + (0.35 + 0.5 * axisGlow) + "), 0 0 " + (30 + 40 * axisGlow) + "px rgba(210,225,255," + (0.2 + 0.4 * axisGlow) + ")", border: "1px solid rgba(255,255,255,0.75)", pointerEvents: "auto", cursor: "grab", touchAction: "none", animation: "awaraAxisPulse 4.6s ease-in-out infinite", zIndex: 8 } as React.CSSProperties
  const DUX_RA = { position: "absolute", left: "50%", top: "80%", width: "38px", height: "38px", transform: "translate(-50%, -50%) translate(" + (axisPos.dr ? axisPos.dr.x : 0) + "px, " + (axisPos.dr ? axisPos.dr.y : 0) + "px)", borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, rgba(255,252,235,0.97), rgba(255,214,140,0.55) 54%, rgba(180,120,40,0.18) 78%, rgba(0,0,0,0) 86%)", boxShadow: "0 0 " + (14 + 30 * axisGlow) + "px rgba(255,210,120," + (0.3 + 0.55 * axisGlow) + ")", border: "1px solid rgba(255,236,190,0.7)", pointerEvents: "auto", cursor: "grab", touchAction: "none", animation: "awaraAxisPulse 5.2s ease-in-out infinite", zIndex: 8 } as React.CSSProperties
  const HS_LBL = { position: "absolute", left: "50%", top: "9%", transform: "translate(-50%, -32px) translate(" + (axisPos.hs ? axisPos.hs.x : 0) + "px, " + (axisPos.hs ? axisPos.hs.y : 0) + "px)", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(236,230,255,0.82)", whiteSpace: "nowrap", pointerEvents: "none", textShadow: "0 0 8px rgba(120,110,190,0.6)", zIndex: 8 } as React.CSSProperties
  const DR_LBL = { position: "absolute", left: "50%", top: "80%", transform: "translate(-50%, 28px) translate(" + (axisPos.dr ? axisPos.dr.x : 0) + "px, " + (axisPos.dr ? axisPos.dr.y : 0) + "px)", fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,238,205,0.82)", whiteSpace: "nowrap", pointerEvents: "none", textShadow: "0 0 8px rgba(150,110,40,0.6)", zIndex: 8 } as React.CSSProperties
  const stW = stageSize.w || 0
  const stH = stageSize.h || 0
  const HS_TOP = 0.09
  const DR_TOP = 0.80
  const soulCX = stW / 2
  const soulCY = stH / 2
  const hsCX = stW * 0.5 + (axisPos.hs ? axisPos.hs.x : 0)
  const hsCY = stH * HS_TOP + (axisPos.hs ? axisPos.hs.y : 0)
  const drCX = stW * 0.5 + (axisPos.dr ? axisPos.dr.x : 0)
  const drCY = stH * DR_TOP + (axisPos.dr ? axisPos.dr.y : 0)
  const hsNear = "rgba(255,255,255," + (0.5 + 0.5 * axisGlow) + ")"
  const hsFar = "rgba(226,236,255," + (0.14 + 0.5 * axisGlow) + ")"
  const drNear = "rgba(255,236,180," + (0.5 + 0.5 * axisGlow) + ")"
  const drFar = "rgba(255,205,120," + (0.14 + 0.5 * axisGlow) + ")"
  const axisWide = "rgba(255,244,220," + (0.05 + 0.28 * axisGlow) + ")"
  const hsMidX = (hsCX + soulCX) / 2 + 16
  const hsMidY = (hsCY + soulCY) / 2
  const drMidX = (drCX + soulCX) / 2 - 16
  const drMidY = (drCY + soulCY) / 2
  const hsPath = "M " + hsCX + " " + hsCY + " Q " + hsMidX + " " + hsMidY + " " + soulCX + " " + soulCY
  const drPath = "M " + drCX + " " + drCY + " Q " + drMidX + " " + drMidY + " " + soulCX + " " + soulCY
  const axisDurN = 2.8 - 1.3 * axisGlow
  const axisDur = axisDurN + "s"
  const axisFlow = (1.6 - 0.7 * axisGlow) + "s"
  const axisPr = 1.6 + 1.4 * axisGlow
  const axisPo = 0.4 + 0.55 * axisGlow
  const AXIS_PARTS = [0, 1, 2, 3, 4]
  const AXIS_TIP_BASE = { position: "absolute", left: "50%", width: "230px", padding: "10px 12px", borderRadius: "10px", fontSize: "11px", lineHeight: "1.5", letterSpacing: "0.02em", textAlign: "center", pointerEvents: "none", zIndex: 12, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" } as React.CSSProperties
  const HS_TIP = Object.assign({}, AXIS_TIP_BASE, { top: "9%", transform: "translate(-50%, 34px) translate(" + (axisPos.hs ? axisPos.hs.x : 0) + "px, " + (axisPos.hs ? axisPos.hs.y : 0) + "px)", color: "rgba(240,244,255,0.95)", background: "rgba(20,22,40,0.92)", border: "1px solid rgba(200,214,255,0.4)", boxShadow: "0 0 22px rgba(150,170,255,0.35)" }) as React.CSSProperties
  const DR_TIP = Object.assign({}, AXIS_TIP_BASE, { top: "80%", transform: "translate(-50%, calc(-100% - 30px)) translate(" + (axisPos.dr ? axisPos.dr.x : 0) + "px, " + (axisPos.dr ? axisPos.dr.y : 0) + "px)", color: "rgba(255,246,228,0.96)", background: "rgba(38,28,12,0.92)", border: "1px solid rgba(255,224,170,0.45)", boxShadow: "0 0 22px rgba(255,200,110,0.35)" }) as React.CSSProperties
  const HS_DESC = "\u0412\u044b\u0441\u0448\u0435\u0435 \u042F \u2014 \u0432\u0435\u0440\u0448\u0438\u043d\u0430 \u043f\u043e\u0437\u0432\u043e\u043d\u043e\u0447\u043d\u0438\u043a\u0430 \u043c\u0435\u0440 (\u0421\u0430\u0445\u0430\u0441\u0440\u0430\u0440\u0430, \u041c\u043e\u043d\u0430\u0434\u0430). \u0411\u0435\u0441\u0441\u043c\u0435\u0440\u0442\u043d\u044b\u0439 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c \u043d\u0430\u0434 \u0447\u0430\u043a\u0440\u0430\u043c\u0438: \u043e\u0442\u0441\u044e\u0434\u0430 \u043d\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u0441\u0432\u0435\u0442 \u0437\u0430\u043c\u044b\u0441\u043b\u0430. \u0412\u044b\u0448\u0435 \u043c\u0435\u0440\u0430 \u2014 \u044f\u0440\u0447\u0435 \u0441\u0432\u044f\u0437\u044c."
  const DR_DESC = "\u0414\u0443\u0445 \u0420\u0430 \u2014 \u0437\u043e\u043b\u043e\u0442\u043e\u0439 \u0418\u0441\u0442\u043e\u043a, \u0446\u0435\u043d\u0442\u0440 \u041f\u043b\u0430\u043d\u0435\u0442\u0430\u0440\u043d\u043e\u0433\u043e \u041b\u043e\u0433\u043e\u0441\u0430. \u041a\u043e\u0441\u0442\u0451\u0440, \u0438\u0437 \u043a\u043e\u0442\u043e\u0440\u043e\u0433\u043e \u0440\u043e\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0434\u0443\u0448\u0438 \u0438 \u043a\u0443\u0434\u0430 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u044e\u0442 \u0441\u0432\u0435\u0442. \u0412\u044b\u0448\u0435 \u043c\u0435\u0440\u0430 \u2014 \u043a\u0440\u0435\u043f\u0447\u0435 \u043d\u0438\u0442\u044c."
  const sPath = function (x1: number, y1: number, x2: number, y2: number, amp: number) { const my1 = y1 + (y2 - y1) / 3; const my2 = y1 + 2 * (y2 - y1) / 3; return "M " + x1 + " " + y1 + " C " + (x1 + amp) + " " + my1 + " " + (x2 - amp) + " " + my2 + " " + x2 + " " + y2 }
  const hsV1 = sPath(hsCX, hsCY, soulCX, soulCY, 26) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, -8) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 16) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 26)
  const hsV2 = sPath(hsCX, hsCY, soulCX, soulCY, 10) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 30) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, -6) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 10)
  const hsV3 = sPath(hsCX, hsCY, soulCX, soulCY, -14) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 12) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, 32) + ";" + sPath(hsCX, hsCY, soulCX, soulCY, -14)
  const drV1 = sPath(drCX, drCY, soulCX, soulCY, -26) + ";" + sPath(drCX, drCY, soulCX, soulCY, 8) + ";" + sPath(drCX, drCY, soulCX, soulCY, -16) + ";" + sPath(drCX, drCY, soulCX, soulCY, -26)
  const drV2 = sPath(drCX, drCY, soulCX, soulCY, -10) + ";" + sPath(drCX, drCY, soulCX, soulCY, -30) + ";" + sPath(drCX, drCY, soulCX, soulCY, 6) + ";" + sPath(drCX, drCY, soulCX, soulCY, -10)
  const drV3 = sPath(drCX, drCY, soulCX, soulCY, 14) + ";" + sPath(drCX, drCY, soulCX, soulCY, -12) + ";" + sPath(drCX, drCY, soulCX, soulCY, -32) + ";" + sPath(drCX, drCY, soulCX, soulCY, 14)
  return (
    <div ref={stageRef} style={STAGE_STYLE} onPointerDown={onStagePointerDown} onPointerMove={onStagePointerMove} onPointerUp={onStagePointerUp} onPointerCancel={onStagePointerUp} onWheel={onStageWheel}>
      <style>{CSS}</style>
      <canvas ref={canvasRef} style={CANVAS_STYLE} />
      <div ref={agentBgRef} style={agentBgStyle(agentCard)} />

      <div ref={frameRef} style={FRAME_STYLE} />

      <div style={BRAND_WRAP}>
        <div style={BRAND_STYLE}>{txt.brand}</div>
        <div style={TAGLINE_STYLE}>{txt.tagline}</div>
        <div style={TAGLINE_STYLE}>{(txt as any).timeline + " " + soulLevel + "/9 \u00B7 " + (levelNames[soulLevel - 1] || "") + " \u00B7 " + soulLevelPct + "%"}</div>
        {soulLevel >= 7 ? <div style={JIVA_TAG}>{"\u2742 \u0410\u0437\u0430\u0440\u0430 \u00B7 \u0421\u0432\u0435\u0442\u043E\u043D\u043E\u0441\u043D\u043E\u0441\u0442\u044C"}</div> : soulLevel >= 4 ? <div style={JIVA_TAG}>{"\u2742 \u0414\u0436\u0438\u0432\u0430 \u00B7 \u0426\u0435\u043B\u043E\u0441\u0442\u043D\u043E\u0441\u0442\u044C"}</div> : null}
      </div>

      <button type="button" ref={coreRef} className="soul-core" style={coreStyle(soulColor, soulSize, soulGlow, liveMap.soul)} onPointerDown={onSpherePointerDown("soul")} onPointerMove={onSpherePointerMove} onPointerUp={onSpherePointerUp("soul")}>
        {sphereContour(soulLevel, "soul")}
        {sigilFor("soul", "52%", 0.95)}
        {soulLevel <= 4 ? yinYang(1) : null}
      </button>

      {!selected ? <style>{"@keyframes awaraAxisPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4)}}"}</style> : null}

      {!selected && stW > 0 ? (
        <svg style={AXIS_SVG}>
          <defs>
            <linearGradient id="awara-hs" gradientUnits="userSpaceOnUse" x1={hsCX} y1={hsCY} x2={soulCX} y2={soulCY}>
              <stop offset="0%" stopColor={hsFar} />
              <stop offset="100%" stopColor={hsNear} />
            </linearGradient>
            <linearGradient id="awara-dr" gradientUnits="userSpaceOnUse" x1={drCX} y1={drCY} x2={soulCX} y2={soulCY}>
              <stop offset="0%" stopColor={drFar} />
              <stop offset="100%" stopColor={drNear} />
            </linearGradient>
          </defs>
          <filter id="awara-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.5" /></filter>
          <g filter="url(#awara-soft)">
            <path d={hsPath} fill="none" stroke={axisWide} strokeWidth={5} strokeLinecap="round" opacity={0.45}>
              <animate attributeName="d" values={hsV1} dur="7.5s" repeatCount="indefinite" />
            </path>
            <path d={drPath} fill="none" stroke={axisWide} strokeWidth={5} strokeLinecap="round" opacity={0.45}>
              <animate attributeName="d" values={drV1} dur="7.5s" repeatCount="indefinite" />
            </path>
          </g>
          <path d={hsPath} fill="none" stroke="url(#awara-hs)" strokeWidth={2} strokeLinecap="round">
            <animate attributeName="d" values={hsV1} dur="7.5s" repeatCount="indefinite" />
          </path>
          <path d={hsPath} fill="none" stroke="url(#awara-hs)" strokeWidth={1.1} strokeLinecap="round" opacity={0.7}>
            <animate attributeName="d" values={hsV2} dur="9s" begin="-2s" repeatCount="indefinite" />
          </path>
          <path d={hsPath} fill="none" stroke="url(#awara-hs)" strokeWidth={0.7} strokeLinecap="round" opacity={0.5}>
            <animate attributeName="d" values={hsV3} dur="10.5s" begin="-4s" repeatCount="indefinite" />
          </path>
          <path d={drPath} fill="none" stroke="url(#awara-dr)" strokeWidth={2} strokeLinecap="round">
            <animate attributeName="d" values={drV1} dur="7.5s" repeatCount="indefinite" />
          </path>
          <path d={drPath} fill="none" stroke="url(#awara-dr)" strokeWidth={1.1} strokeLinecap="round" opacity={0.7}>
            <animate attributeName="d" values={drV2} dur="9s" begin="-2s" repeatCount="indefinite" />
          </path>
          <path d={drPath} fill="none" stroke="url(#awara-dr)" strokeWidth={0.7} strokeLinecap="round" opacity={0.5}>
            <animate attributeName="d" values={drV3} dur="10.5s" begin="-4s" repeatCount="indefinite" />
          </path>
          <g filter="url(#awara-soft)">
            {AXIS_PARTS.map(function (i) { return (
              <circle key={"hsp" + i} r={axisPr + 0.8} fill={hsNear} opacity={axisPo * 0.7}>
                <animateMotion dur={axisDurN * 1.7 + "s"} begin={(-i * axisDurN * 1.7 / AXIS_PARTS.length) + "s"} repeatCount="indefinite" path={hsPath} />
              </circle>
            ) })}
            {AXIS_PARTS.map(function (i) { return (
              <circle key={"drp" + i} r={axisPr + 0.8} fill={drNear} opacity={axisPo * 0.7}>
                <animateMotion dur={axisDurN * 1.7 + "s"} begin={(-i * axisDurN * 1.7 / AXIS_PARTS.length) + "s"} repeatCount="indefinite" path={drPath} />
              </circle>
            ) })}
          </g>
          <circle cx={soulCX} cy={soulCY} r={6} fill={hsNear}>
            <animate attributeName="r" from="5" to={16 + 12 * axisGlow} dur="3.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" from={0.14 + 0.34 * axisGlow} to="0" dur="3.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={hsCX} cy={hsCY} r={9} fill="none" stroke={hsNear} strokeWidth={1}>
            <animate attributeName="r" from="8" to={22 + 16 * axisGlow} dur="5.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.42" to="0" dur="5.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={drCX} cy={drCY} r={9} fill="none" stroke={drNear} strokeWidth={1}>
            <animate attributeName="r" from="8" to={22 + 16 * axisGlow} dur="5.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.42" to="0" dur="5.9s" repeatCount="indefinite" />
          </circle>
        </svg>
      ) : null}

      {!selected ? <div style={HIGHER_SELF} title={HS_DESC} onPointerDown={onAxisDown("hs")} onPointerMove={onAxisMove} onPointerUp={onAxisUp} onPointerCancel={onAxisUp} onPointerEnter={function () { setAxisHover("hs") }} onPointerLeave={function () { setAxisHover("") }} /> : null}
      {!selected && axisHover === "hs" ? <div style={HS_TIP}>{HS_DESC}</div> : null}
      {!selected ? <div style={HS_LBL}>{"\u0412\u044B\u0441\u0448\u0435\u0435 \u042F"}</div> : null}
      {!selected ? <div style={DUX_RA} title={DR_DESC} onPointerDown={onAxisDown("dr")} onPointerMove={onAxisMove} onPointerUp={onAxisUp} onPointerCancel={onAxisUp} onPointerEnter={function () { setAxisHover("dr") }} onPointerLeave={function () { setAxisHover("") }} /> : null}
      {!selected && axisHover === "dr" ? <div style={DR_TIP}>{DR_DESC}</div> : null}
      {!selected ? <div style={DR_LBL}>{"\u0414\u0443\u0445 \u0420\u0430 \u00B7 \u041B\u043E\u0433\u043E\u0441"}</div> : null}

      {ORBIT_IDS.map(function (id, i) {
        const s = soul.state[id]
        const color = dispColorOf(id, s.style && s.style.color)
        const size = s.style && s.style.size ? s.style.size : 46
        const q = s.style && typeof (s.style as any).quality === "number" ? (s.style as any).quality : 1
        const glow = (s.style && typeof s.style.glow === "number" ? s.style.glow : 40) * (0.8 + q * 0.2)
        const count = contentCount(id)
        return (
          <button key={id} type="button" ref={setOrbitRef(i)} className="soul-orbit" style={orbitStyle(color, size, glow, liveMap[id])} onPointerDown={onSpherePointerDown(id)} onPointerMove={onSpherePointerMove} onPointerUp={onSpherePointerUp(id)}>
            {sphereContour(Math.max(1, Math.min(9, Math.floor(clamp01(s.light || 0) * 9) + 1)), id)}
            {sigilFor(id, "58%", 0.92)}
            {Math.max(1, Math.min(9, Math.floor(clamp01(s.light || 0) * 9) + 1)) <= 4 ? yinYang(1) : null}
          </button>
        )
      })}

      {(["soul", "osnova", "serdce", "razum", "svyazi"] as SoulSphereId[]).map(function (pid) {
        const psph = soul.state[pid]
        const baseColor = dispColorOf(pid, psph.style && psph.style.color)
        return psph.subSpheres.map(function (sub) {
          const sc = sub.color || baseColor
          return (
            <button key={sub.id} type="button" className="soul-orbit" ref={setSubRef(sub.id)} style={orbitStyle(sc, 24, 26, 0)} title={sub.text} onClick={function () { enterSub(pid, sub.id) }}>
              {sub.glyph ? sub.glyph : sigilFor(pid, "62%", 0.85)}
            </button>
          )
        })
      })}

      {!selected ? (
        <button type="button" className="soul-arrow" style={NAV_TOGGLE} title={txt.navHint} onClick={function () { setNavShown(function (v) { return !v }) }}>
          {navShown ? "\u2212" : "\u2725"}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={linkBtnStyle(linkMode)} title={txt.link.tip} onClick={toggleLinkMode}>
          {"\u221E"}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={ONB_OPEN} title={onbTxt.open} onClick={openOnb}>
          {"\u003F"}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={ISKRA_BTN} title={"\u0418\u0441\u043a\u0440\u0430"} onClick={runIskra}>
          {"\u2728"}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={MATRIX_BTN} title={MATRIX_HINT} onClick={cycleMatrix}>
          {matrixLabel}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={MENU_TOGGLE} title={MENU_HINT} onClick={function () { setMenuOpen(function (v) { return !v }) }}>
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      ) : null}

      {!selected && menuOpen ? (
        <div style={MENU_PANEL}>
          {MENU_ITEMS.map(function (mi) {
            return (
              <button key={mi.key} type="button" style={MENU_BTN} onClick={function () { setMenuOpen(false); setToast(mi.label + " \u2014 " + txt.nav.soon); try { window.dispatchEvent(new CustomEvent("awara:menu", { detail: { key: mi.key } })) } catch (e) { /* noop */ } }}>
                <span style={MENU_GLYPH}>{mi.glyph}</span>
                <span>{mi.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Three Spirit tiers (everyday / planetary Logos / the One) as rotating DOM rings, each with its own + button. */}

      {soulLevel >= 7 && !selected && inside === null && insideSub === null && spiritOpenId === null && birthStep === null ? renderSpiritAdders() : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={viewBtnStyle(112)} title={txt.view.zoomIn} onClick={function () { zoomBy(1.18) }}>
          {"\u002B"}
        </button>
      ) : null}

      {!selected ? (
        <button type="button" className="soul-arrow" style={viewBtnStyle(24)} title={txt.view.reset} onClick={resetView}>
          {"\u21BB"}
        </button>
      ) : null}

      {/* Light is poured per-sphere via the slider in the sphere panel now. */}

      {!selected && navShown ? NAV_DIRS.map(function (n) {
        return (
          <button key={n.dir} type="button" className="soul-arrow" style={arrowStyle(n.dir)} title={n.label} onClick={function () { if (n.dir === "left") { try { window.dispatchEvent(new CustomEvent("awara:open-view", { detail: { view: "vastu" } })) } catch (e) { navigate(n.dir) } } else if (n.dir === "down") { try { window.dispatchEvent(new CustomEvent("awara:open-view", { detail: { view: "energo" } })) } catch (e) { navigate(n.dir) } } else { navigate(n.dir) } }}>
            {n.glyph}
          </button>
        )
      }) : null}

      {/* Chakra dot row (red->white circles) removed per request */}

      {!selected && linkList.length > 0 ? (
        <div style={LEGEND_WRAP}>
          {linkList.map(function (k) {
            const m = linkMetaRef.current[k]
            const nm = m && m.name ? m.name : (SOUL_CANON[m.from].name + " \u2013 " + SOUL_CANON[m.to].name)
            return (
              <div key={k} style={LEGEND_ITEM}>
                <span>{"\u221E " + nm}</span>
                <button type="button" style={LEGEND_X} onClick={function () { removeLink(k) }}>{"\u2715"}</button>
              </div>
            )
          })}
        </div>
      ) : null}

      {!selected && inside === null && insideSub === null && birthStep === null && spiritOpenId === null ? renderMeraDock() : null}

      {dimOpen !== null ? renderDim(dimOpen) : null}

      {onbStep !== null ? renderOnboard() : null}

      {iskraOpen ? renderIskra() : null}

      {birthStep !== null && !selected && inside === null && insideSub === null ? renderBirth() : null}

      {selected ? renderPanel() : null}

      {inside !== null ? renderInside() : null}

      {spiritOpenId !== null && spiritSubOpenId === null ? renderSpirit() : null}

      {spiritOpenId !== null && spiritSubOpenId !== null ? renderSpiritSub() : null}

      {insideSub !== null ? renderInsideSub() : null}

      {deepSpace !== null ? renderDeepSpace() : null}

      {toast ? <div style={TOAST_STYLE}>{toast}</div> : null}
    </div>
  )
}

export default SoulSpace
