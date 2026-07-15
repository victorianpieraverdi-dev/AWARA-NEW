// Toroidal field of Light — "Тороид — Дыхание Света" (coil-torus + vibration scale).
// The single Light value (0..1) behaves like a VIBRATION LEVEL (cf. Hawkins' Map of
// Consciousness, hate/low -> love/high). Raising it:
//   * speeds up the counter-rotation strongly (heavy & slow at the bottom, swift on top);
//   * raises the standing-wave frequency — more angular lobes ripple across the surface
//     (a cymatic-like figure by frequency);
//   * brightens net, coils, sparks and the central axis.
// Structure: faint NET shell + bright rainbow helical COILS (two opposite helicities,
// counter-rotating) + SPARKS flowing helically along the coils + a thin glowing waist
// column (Сушумна / 9D Vertical).
// Public API (group / setLight / light / update / dispose) is unchanged.

import * as THREE from "three"
import {
	torusFieldVertex,
	torusFieldFragment,
	torusLineVertex,
	torusLineFragment,
} from "./shaders/torus.glsl"

export interface TorusFieldOptions {
	/** Tube / major half-extent. Default 1.6. */
	majorRadius?: number
	/** Thin central waist radius. Default 0.08. */
	waistRadius?: number
	/** Total flowing spark particles. Default 1400. */
	particleCount?: number
	/** Base point size in px. Default 3. */
	pointSize?: number
	/** Bright rainbow coils per helicity layer. Default 12. */
	coilCount?: number
	/** Toroidal turns per poloidal loop (coil steepness). Default 3. */
	coilTurns?: number
	/** Rainbow tint 0..1. Default 1. */
	rainbow?: number
	/** Base counter-rotation speed in rad/s. Default 0.25. */
	spinSpeed?: number
	/** Central axis color. Default gold #ffd27a. */
	colorCore?: THREE.ColorRepresentation
	/** Faint net color. Default soft blue #4a7bff. */
	colorNet?: THREE.ColorRepresentation
	/** Ambient field tint. Default violet #b388ff. */
	colorField?: THREE.ColorRepresentation
	/** Ascending core current. Default cyan #7ad3ff. */
	colorAscending?: THREE.ColorRepresentation
	/** Descending outer current. Default gold #ffd27a. */
	colorDescending?: THREE.ColorRepresentation
	/** Spark opacity. Default 0.55. */
	opacity?: number
	/** Initial Light / vibration level 0..1. */
	light?: number
}

const TAU = Math.PI * 2

export class TorusField {
	readonly group: THREE.Group
	private readonly material: THREE.ShaderMaterial // sparks
	private readonly netMat: THREE.ShaderMaterial
	private readonly coilMat: THREE.ShaderMaterial
	private readonly spineMat: THREE.MeshBasicMaterial
	private readonly spinCW: THREE.Group
	private readonly spinCCW: THREE.Group
	private readonly spinSpeed: number
	private coreGlow: THREE.Sprite | null = null
	private auraGlow: THREE.Sprite | null = null
	private coreBase = 0
	private auraBase = 0
	private time = 0
	private spinMul = 1
	private morphAmp = 0
	private morphMode = 0
	private morphFreq = 0
	private morphSquash = 0
	private morphBulge = 0

	constructor(opts: TorusFieldOptions = {}) {
		const A = opts.majorRadius ?? 1.6
		const rMin = opts.waistRadius ?? 0.08
		const total = Math.max(256, Math.floor(opts.particleCount ?? 1400))
		const rainbow = clamp01(opts.rainbow ?? 1)
		const useRainbow = rainbow > 0.001
		const nCoils = Math.max(1, Math.floor(opts.coilCount ?? 12))
		const baseK = opts.coilTurns ?? 3
		const L0 = clamp01(opts.light ?? 0)
		this.spinSpeed = opts.spinSpeed ?? 0.25

		this.group = new THREE.Group()
		this.spinCW = new THREE.Group()
		this.spinCCW = new THREE.Group()
		this.group.add(this.spinCW, this.spinCCW)

		const pointAt = (theta: number, alpha: number): [number, number, number] => {
			const rho = rMin + A * (1 + Math.cos(alpha))
			const y = A * Math.sin(alpha)
			return [rho * Math.cos(theta), y, rho * Math.sin(theta)]
		}
		const col = new THREE.Color()

		// Shared vibration uniforms (mode / amp / freq) are kept in sync per material.
		const vib = vibrationFor(L0)

		// --- 1) NET: faint wireframe shell (single color, rippled by the line shader) ---
		const netPos: number[] = []
		const netCol: number[] = []
		const netColor = new THREE.Color(opts.colorNet ?? "#4a7bff")
		const pushNet = (a: [number, number, number], b: [number, number, number]) => {
			netPos.push(a[0], a[1], a[2], b[0], b[1], b[2])
			netCol.push(netColor.r, netColor.g, netColor.b, netColor.r, netColor.g, netColor.b)
		}
		const meridianCount = 40
		const meridianSegs = 60
		for (let m = 0; m < meridianCount; m++) {
			const theta = (m / meridianCount) * TAU
			for (let s = 0; s < meridianSegs; s++) {
				pushNet(pointAt(theta, (s / meridianSegs) * TAU), pointAt(theta, ((s + 1) / meridianSegs) * TAU))
			}
		}
		const parallelCount = 26
		const parallelSegs = 90
		for (let p = 0; p < parallelCount; p++) {
			const alpha = (p / parallelCount) * TAU
			for (let s = 0; s < parallelSegs; s++) {
				pushNet(pointAt((s / parallelSegs) * TAU, alpha), pointAt(((s + 1) / parallelSegs) * TAU, alpha))
			}
		}
		const netGeo = new THREE.BufferGeometry()
		netGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(netPos), 3))
		netGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(netCol), 3))
		netGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), A * 3)
		this.netMat = makeLineMaterial(L0, 0.12, vib)
		const net = new THREE.LineSegments(netGeo, this.netMat)
		net.frustumCulled = false
		this.group.add(net)

		// --- 2) COILS: bright rainbow helical lines (two helicities) ---
		this.coilMat = makeLineMaterial(L0, 0.7, vib)
		const coilSegs = 200
		const buildCoils = (sign: number): THREE.BufferGeometry => {
			const pos: number[] = []
			const cols: number[] = []
			const K = baseK * sign
			for (let c = 0; c < nCoils; c++) {
				const phi0 = (c / nCoils) * TAU
				if (useRainbow) col.setHSL(c / nCoils, 0.85, 0.6)
				else col.set(opts.colorField ?? "#b388ff")
				for (let s = 0; s < coilSegs; s++) {
					const a0 = (s / coilSegs) * TAU
					const a1 = ((s + 1) / coilSegs) * TAU
					const a = pointAt(phi0 + K * a0, a0)
					const b = pointAt(phi0 + K * a1, a1)
					pos.push(a[0], a[1], a[2], b[0], b[1], b[2])
					cols.push(col.r, col.g, col.b, col.r, col.g, col.b)
				}
			}
			const g = new THREE.BufferGeometry()
			g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3))
			g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cols), 3))
			g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), A * 3)
			return g
		}

		// --- 3) SPARKS flowing helically along the coils ---
		this.material = new THREE.ShaderMaterial({
			vertexShader: torusFieldVertex,
			fragmentShader: torusFieldFragment,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uLight: { value: L0 },
				uA: { value: A },
				uRMin: { value: rMin },
				uSize: { value: opts.pointSize ?? 3 },
				uRainbow: { value: rainbow },
				uMode: { value: vib.mode },
				uAmp: { value: vib.amp },
				uFreq: { value: vib.freq },
				uColorAsc: { value: new THREE.Color(opts.colorAscending ?? "#7ad3ff") },
				uColorDesc: { value: new THREE.Color(opts.colorDescending ?? "#ffd27a") },
				uColorField: { value: new THREE.Color(opts.colorField ?? "#b388ff") },
				uOpacity: { value: opts.opacity ?? 0.55 },
			},
		})
		const buildSparks = (sign: number, n: number): THREE.BufferGeometry => {
			const positions = new Float32Array(n * 3)
			const alpha0 = new Float32Array(n)
			const theta = new Float32Array(n)
			const scale = new Float32Array(n)
			const seed = new Float32Array(n)
			const kArr = new Float32Array(n)
			for (let i = 0; i < n; i++) {
				const c = Math.floor(Math.random() * nCoils)
				alpha0[i] = Math.random() * TAU
				theta[i] = (c / nCoils) * TAU
				scale[i] = 0.6 + Math.random() * 0.9
				seed[i] = Math.random()
				kArr[i] = baseK * sign
			}
			const g = new THREE.BufferGeometry()
			g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
			g.setAttribute("aAlpha0", new THREE.BufferAttribute(alpha0, 1))
			g.setAttribute("aTheta", new THREE.BufferAttribute(theta, 1))
			g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1))
			g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1))
			g.setAttribute("aK", new THREE.BufferAttribute(kArr, 1))
			g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), A * 3)
			return g
		}

		const half = Math.floor(total / 2)
		const coilsCW = new THREE.LineSegments(buildCoils(1), this.coilMat)
		const sparksCW = new THREE.Points(buildSparks(1, half), this.material)
		coilsCW.frustumCulled = false
		sparksCW.frustumCulled = false
		this.spinCW.add(coilsCW, sparksCW)
		const coilsCCW = new THREE.LineSegments(buildCoils(-1), this.coilMat)
		const sparksCCW = new THREE.Points(buildSparks(-1, total - half), this.material)
		coilsCCW.frustumCulled = false
		sparksCCW.frustumCulled = false
		this.spinCCW.add(coilsCCW, sparksCCW)

		// --- 4) Central axis inside the waist ---
		const spineGeo = new THREE.CylinderGeometry(rMin * 0.9, rMin * 0.9, A * 2.05, 12, 1, true)
		this.spineMat = new THREE.MeshBasicMaterial({
			color: new THREE.Color(opts.colorCore ?? "#ffd27a"),
			transparent: true,
			opacity: 0.7,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		})
		const spine = new THREE.Mesh(spineGeo, this.spineMat)
		this.group.add(spine)

		// --- 5) Heart-core glow (Анахата): white-gold core + violet aura halo ---
		this.coreBase = A * 0.7
		this.auraBase = A * 4.2
		const coreTex = makeGlowTexture("255,232,180")
		const auraTex = makeGlowTexture("179,136,255")
		if (coreTex && auraTex) {
			this.coreGlow = makeGlowSprite(coreTex, this.coreBase)
			this.auraGlow = makeGlowSprite(auraTex, this.auraBase)
			this.group.add(this.auraGlow, this.coreGlow)
		}

		this.setLight(L0)
	}

	/** Set Light / vibration level (0..1). */
	setLight(v: number): void {
		const L = clamp01(v)
		const vib = vibrationFor(L)
		for (const mat of [this.material, this.netMat, this.coilMat]) {
			mat.uniforms.uLight.value = L
			mat.uniforms.uMode.value = vib.mode
			mat.uniforms.uAmp.value = vib.amp
			mat.uniforms.uFreq.value = vib.freq
		}
		this.netMat.uniforms.uOpacity.value = 0.07 + 0.13 * L
		this.coilMat.uniforms.uOpacity.value = 0.45 + 0.4 * L
		this.spineMat.opacity = 0.35 + 0.55 * L
		if (this.coreGlow) (this.coreGlow.material as THREE.SpriteMaterial).opacity = 0.3 + 0.8 * L
		if (this.auraGlow) (this.auraGlow.material as THREE.SpriteMaterial).opacity = 0.16 + 0.45 * L
		this.group.scale.setScalar(0.9 + 0.2 * L)
	}

	get light(): number {
		return this.material.uniforms.uLight.value as number
	}

	/** Multiply the Light-driven rotation speed (0 = frozen, large = wild spin). */
	setSpin(mult: number): void {
		this.spinMul = mult < 0 ? 0 : mult
	}

	/** Audio-driven shape morph: extra surface ripple (amp/mode/freq) plus a
	 *  breathing squash/bulge. All fields optional; omit or pass 0 to relax.
	 *  Combined with the Light level every frame inside update(). */
	setMorph(m: { amp?: number; mode?: number; freq?: number; squash?: number; bulge?: number }): void {
		this.morphAmp = clampRange(m.amp ?? 0, 0, 1)
		this.morphMode = clampRange(m.mode ?? 0, 0, 16)
		this.morphFreq = clampRange(m.freq ?? 0, 0, 12)
		this.morphSquash = clampRange(m.squash ?? 0, -0.4, 0.55)
		this.morphBulge = clampRange(m.bulge ?? 0, -0.4, 0.7)
	}

	/** Call each frame. Rotation speed scales strongly with the vibration level. */
	update(dt: number, _cameraPos?: THREE.Vector3): void {
		const L = this.material.uniforms.uLight.value as number
		const vib = vibrationFor(L)
		const aAmp = vib.amp + this.morphAmp
		const aMode = vib.mode + this.morphMode
		const aFreq = vib.freq + this.morphFreq
		for (const mat of [this.material, this.netMat, this.coilMat]) {
			mat.uniforms.uTime.value += dt
			mat.uniforms.uAmp.value = aAmp
			mat.uniforms.uMode.value = aMode
			mat.uniforms.uFreq.value = aFreq
		}
		const baseS = 0.9 + 0.2 * L
		const sx = baseS * (1 + this.morphBulge)
		const sy = baseS * (1 - this.morphSquash)
		this.group.scale.set(sx, sy, sx)
		const w = this.spinSpeed * (0.15 + 2.2 * L) * this.spinMul * dt
		this.spinCW.rotation.y += w
		this.spinCCW.rotation.y -= w
		this.time += dt
		if (this.coreGlow) this.coreGlow.scale.setScalar(this.coreBase * (1 + 0.06 * Math.sin(this.time * 1.2)))
		if (this.auraGlow) this.auraGlow.scale.setScalar(this.auraBase * (1 + 0.04 * Math.sin(this.time * 0.7)))
	}

	/** Free GPU resources. */
	dispose(): void {
		this.material.dispose()
		this.netMat.dispose()
		this.coilMat.dispose()
		this.spineMat.dispose()
		for (const glow of [this.coreGlow, this.auraGlow]) {
			if (!glow) continue
			const m = glow.material as THREE.SpriteMaterial
			if (m.map) m.map.dispose()
			m.dispose()
		}
		this.group.traverse((o) => {
			const m = o as THREE.Mesh
			if (m.geometry) m.geometry.dispose()
		})
	}
}

// Vibration mapping: higher level -> more lobes, faster temporal beat, a touch more amp.
function vibrationFor(L: number): { mode: number; amp: number; freq: number } {
	return {
		mode: Math.round(3 + L * 9), // 3..12 angular lobes
		amp: 0.05 + 0.05 * L,
		freq: 0.6 + 4.0 * L,
	}
}

function makeLineMaterial(
	L: number,
	opacity: number,
	vib: { mode: number; amp: number; freq: number },
): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		vertexShader: torusLineVertex,
		fragmentShader: torusLineFragment,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uLight: { value: L },
			uMode: { value: vib.mode },
			uAmp: { value: vib.amp },
			uFreq: { value: vib.freq },
			uOpacity: { value: opacity },
		},
	})
}

function makeGlowSprite(map: THREE.Texture, scale: number): THREE.Sprite {
	const mat = new THREE.SpriteMaterial({
		map,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		opacity: 0.6,
	})
	const s = new THREE.Sprite(mat)
	s.scale.set(scale, scale, 1)
	return s
}

function makeGlowTexture(rgb: string): THREE.Texture | null {
	if (typeof document === "undefined") return null
	const size = 128
	const c = document.createElement("canvas")
	c.width = size
	c.height = size
	const ctx = c.getContext("2d")
	if (!ctx) return null
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
	g.addColorStop(0.0, "rgba(255,255,255,0.95)")
	g.addColorStop(0.18, "rgba(" + rgb + ",0.85)")
	g.addColorStop(0.5, "rgba(" + rgb + ",0.25)")
	g.addColorStop(1.0, "rgba(" + rgb + ",0.0)")
	ctx.fillStyle = g
	ctx.fillRect(0, 0, size, size)
	const tex = new THREE.CanvasTexture(c)
	tex.needsUpdate = true
	return tex
}

function clamp01(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v
}

function clampRange(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v
}
