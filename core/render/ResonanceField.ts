// Resonance field — a Chladni / cymatic plate + living "sand" simulation for modelling
// Schumann-style standing waves AND audio-reactive cymatics (резонанс Шумана /
// звук → рисунок). The plate sits just below the toroid, so the torus hovers in the
// centre above its own resonance field — like a real cymatics rig.
//
// Layers (bottom -> top):
//  0) a dark base disc with a glowing rim (the physical plate);
//  1) a faint glowing membrane whose nodal lines (field ~ 0) shine — the analytic guide;
//  2) thousands of "sand" grains that each frame descend the |field| gradient toward the
//     nearest nodal line while antinodes shake them loose. Within ~1-2 s they gather on
//     the nodal set — exactly what sand does on a vibrating plate.
//
// Membrane eigenmode: field(r, theta) = sin(n * PI * r / R) * cos(m * theta),
// where m = diameters (radial spokes) and n controls the nodal circles.

import * as THREE from "three"
import { resonanceVertex, resonanceFragment } from "./shaders/resonance.glsl"

export interface ResonanceFieldOptions {
	/** Disc radius. Default 4.6. */
	radius?: number
	/** Plane subdivisions per side (membrane lift smoothness). Default 180. */
	segments?: number
	/** Vertical displacement of the membrane / sand. Default 0.28. */
	amplitude?: number
	/** Nodal line crispness (smaller = thinner lines). Default 0.05. */
	lineWidth?: number
	/** Angular modes (diameters). Default 4. */
	m?: number
	/** Radial modes (nodal circles). Default 3. */
	n?: number
	/** Driving frequency in Hz (sets the temporal pulse). Default 7.83. */
	hz?: number
	/** Nodal line color. Default cyan #7ad3ff. */
	colorNode?: THREE.ColorRepresentation
	/** Antinode shimmer color. Default gold #ffd27a. */
	colorAnti?: THREE.ColorRepresentation
	/** Membrane opacity. Default 0.22. */
	opacity?: number
	/** Number of sand particles. Default 12000. */
	sandCount?: number
	/** Vertical position of the whole plate (below the torus). Default -1.6. */
	baseY?: number
	/** Show the dark base disc + glowing rim. Default true. */
	showPlate?: boolean
}

// Real Schumann frequencies are a few Hz — literal radians/sec would flicker. Slow the
// visible pulse while keeping it proportional to the chosen frequency.
const PULSE_SCALE = 0.28
const PI = Math.PI
const HZ_MIN = 7.83
const HZ_MAX = 33.8

export class ResonanceField {
	readonly group: THREE.Group
	private readonly mat: THREE.ShaderMaterial
	private readonly geo: THREE.PlaneGeometry

	// sand
	private readonly sand: THREE.Points
	private readonly sandGeo: THREE.BufferGeometry
	private readonly sandMat: THREE.PointsMaterial
	private readonly sandTex: THREE.Texture | null
	private readonly pos: Float32Array
	private readonly count: number
	private readonly colLow = new THREE.Color("#ffe6b0")
	private readonly colHigh = new THREE.Color("#aef0ff")

	// plate
	private baseGeo: THREE.CircleGeometry | null = null
	private baseMat: THREE.MeshBasicMaterial | null = null
	private rimGeo: THREE.RingGeometry | null = null
	private rimMat: THREE.MeshBasicMaterial | null = null

	// mode params kept as plain numbers for the CPU sand sim
	private R: number
	private m: number
	private n: number
	private amp: number
	private freqScale = 1
	private audioAgit = 0

	constructor(opts: ResonanceFieldOptions = {}) {
		const R = opts.radius ?? 4.6
		const seg = Math.max(8, Math.floor(opts.segments ?? 180))
		this.R = R
		this.m = opts.m ?? 4
		this.n = opts.n ?? 3
		this.amp = opts.amplitude ?? 0.28
		this.group = new THREE.Group()
		this.group.position.y = opts.baseY ?? -1.6

		// --- 0) physical plate: dark base disc + glowing rim ---
		if (opts.showPlate ?? true) {
			this.baseGeo = new THREE.CircleGeometry(R, 96)
			this.baseMat = new THREE.MeshBasicMaterial({
				color: new THREE.Color("#0a0712"),
				transparent: true,
				opacity: 0.55,
				depthWrite: false,
				side: THREE.DoubleSide,
			})
			const base = new THREE.Mesh(this.baseGeo, this.baseMat)
			base.rotation.x = -PI / 2
			base.position.y = -0.06
			base.renderOrder = 0
			base.frustumCulled = false
			this.group.add(base)

			this.rimGeo = new THREE.RingGeometry(R * 0.985, R, 128)
			this.rimMat = new THREE.MeshBasicMaterial({
				color: new THREE.Color("#7ad3ff"),
				transparent: true,
				opacity: 0.6,
				depthWrite: false,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
			})
			const rim = new THREE.Mesh(this.rimGeo, this.rimMat)
			rim.rotation.x = -PI / 2
			rim.renderOrder = 1
			rim.frustumCulled = false
			this.group.add(rim)
		}

		// --- 1) glowing membrane (analytic nodal lines, faint guide) ---
		this.geo = new THREE.PlaneGeometry(R * 2, R * 2, seg, seg)
		this.mat = new THREE.ShaderMaterial({
			vertexShader: resonanceVertex,
			fragmentShader: resonanceFragment,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uM: { value: this.m },
				uN: { value: this.n },
				uR: { value: R },
				uAmp: { value: this.amp },
				uLine: { value: opts.lineWidth ?? 0.05 },
				uOmega: { value: (opts.hz ?? 7.83) * PULSE_SCALE },
				uOpacity: { value: opts.opacity ?? 0.6 },
				uColorNode: { value: new THREE.Color(opts.colorNode ?? "#7ad3ff") },
				uColorAnti: { value: new THREE.Color(opts.colorAnti ?? "#ffd27a") },
			},
		})
		const mesh = new THREE.Mesh(this.geo, this.mat)
		mesh.rotation.x = -PI / 2
		mesh.renderOrder = 2
		mesh.frustumCulled = false
		this.group.add(mesh)

		// --- 2) living sand ---
		this.count = Math.max(0, Math.floor(opts.sandCount ?? 12000))
		this.pos = new Float32Array(this.count * 3)
		for (let i = 0; i < this.count; i++) {
			const r = R * Math.sqrt(Math.random())
			const th = Math.random() * 2 * PI
			const x = r * Math.cos(th)
			const z = r * Math.sin(th)
			this.pos[i * 3] = x
			this.pos[i * 3 + 1] = this.amp * this.fieldAt(x, z)
			this.pos[i * 3 + 2] = z
		}
		this.sandGeo = new THREE.BufferGeometry()
		this.sandGeo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3))
		this.sandTex = makeDotTexture()
		this.sandMat = new THREE.PointsMaterial({
			color: this.colLow.clone(),
			size: 0.1,
			sizeAttenuation: true,
			transparent: true,
			opacity: 1.0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			map: this.sandTex ?? undefined,
		})
		this.sand = new THREE.Points(this.sandGeo, this.sandMat)
		this.sand.renderOrder = 3
		this.sand.frustumCulled = false
		this.group.add(this.sand)
	}

	/** Membrane eigenmode value at plate coords (x, z). Supports fractional modes:
	 *  the angular term crossfades between cos(m0*th) and cos((m0+1)*th) so the figure
	 *  morphs smoothly along the vibration scale instead of snapping between integers. */
	private fieldAt(x: number, z: number): number {
		const r = Math.sqrt(x * x + z * z)
		const th = Math.atan2(z, x)
		const m0 = Math.floor(this.m)
		const frac = this.m - m0
		const ang = Math.cos(m0 * th) * (1 - frac) + Math.cos((m0 + 1) * th) * frac
		return Math.sin((this.n * PI * r) / this.R) * ang
	}

	/** Set the nodal figure: m diameters, n nodal circles. */
	setMode(m: number, n: number): void {
		this.m = m
		this.n = n
		this.mat.uniforms.uM.value = m
		this.mat.uniforms.uN.value = n
		// kick the sand off the nodes so it re-settles into the new figure
		this.scatter(0.5)
	}

	/** Continuous (fractional) mode for the smooth vibration scale. Unlike setMode it
	 *  does NOT scatter the sand, so the figure morphs gradually as m/n drift. */
	setModeF(m: number, n: number): void {
		this.m = m
		this.n = n
		this.mat.uniforms.uM.value = m
		this.mat.uniforms.uN.value = n
	}

	/** Set the driving frequency (Hz). Drives pulse, sand agitation and color. */
	setFrequency(hz: number): void {
		this.mat.uniforms.uOmega.value = hz * PULSE_SCALE
		this.freqScale = hz / HZ_MIN
		const t = THREE.MathUtils.clamp((hz - HZ_MIN) / (HZ_MAX - HZ_MIN), 0, 1)
		this.sandMat.color.copy(this.colLow).lerp(this.colHigh, t)
	}

	/** External agitation 0..1 (e.g. live audio loudness). Scales antinode shake. */
	setAgitation(a: number): void {
		this.audioAgit = a < 0 ? 0 : a > 1 ? 1 : a
	}

	/** Line crispness (smaller = thinner). */
	setLineWidth(w: number): void {
		this.mat.uniforms.uLine.value = w
	}

	/** Membrane displacement amplitude. */
	setAmplitude(a: number): void {
		this.amp = a
		this.mat.uniforms.uAmp.value = a
	}

	/** Membrane opacity. */
	setOpacity(o: number): void {
		this.mat.uniforms.uOpacity.value = o
	}

	/** Randomly nudge sand outward — used when the figure changes. */
	private scatter(amount: number): void {
		for (let i = 0; i < this.count; i++) {
			this.pos[i * 3] += (Math.random() - 0.5) * 2 * amount
			this.pos[i * 3 + 2] += (Math.random() - 0.5) * 2 * amount
		}
	}

	/** Call each frame. Advances the pulse and steps the sand toward the nodal lines. */
	update(dt: number): void {
		this.mat.uniforms.uTime.value += dt
		if (this.count === 0) return

		const k = Math.min(2, dt * 60) // frame-rate normalisation
		const eps = 0.02
		const lambda = 0.12 * k // gradient-descent step toward nodes (strong = crisp lines)
		const jitBase = 0.0018 * k // faint constant tremor so it never looks frozen
		const jitField = (0.06 + 0.5 * this.audioAgit) * k * Math.min(1.6, this.freqScale)
		const R = this.R

		for (let i = 0; i < this.count; i++) {
			const ix = i * 3
			let x = this.pos[ix]
			let z = this.pos[ix + 2]

			const f = this.fieldAt(x, z)
			const af = Math.abs(f)
			// finite-difference gradient of the field
			const fx = (this.fieldAt(x + eps, z) - this.fieldAt(x - eps, z)) / (2 * eps)
			const fz = (this.fieldAt(x, z + eps) - this.fieldAt(x, z - eps)) / (2 * eps)
			const s = f >= 0 ? 1 : -1
			// descend |field| toward the nearest nodal line
			x -= lambda * s * fx
			z -= lambda * s * fz
			// shake — strong where the plate moves most (antinodes), nil on the nodes
			const jit = jitBase + jitField * af
			x += (Math.random() - 0.5) * 2 * jit
			z += (Math.random() - 0.5) * 2 * jit

			// keep inside the disc
			const rr = Math.sqrt(x * x + z * z)
			if (rr > R) {
				const c = (R * 0.999) / rr
				x *= c
				z *= c
			}

			this.pos[ix] = x
			this.pos[ix + 1] = this.amp * this.fieldAt(x, z) + 0.02
			this.pos[ix + 2] = z
		}
		;(this.sandGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true
	}

	/** Free GPU resources. */
	dispose(): void {
		this.geo.dispose()
		this.mat.dispose()
		this.sandGeo.dispose()
		this.sandMat.dispose()
		if (this.sandTex) this.sandTex.dispose()
		if (this.baseGeo) this.baseGeo.dispose()
		if (this.baseMat) this.baseMat.dispose()
		if (this.rimGeo) this.rimGeo.dispose()
		if (this.rimMat) this.rimMat.dispose()
	}
}

// Soft round dot sprite for the sand grains (guarded for SSR / no-DOM).
function makeDotTexture(): THREE.Texture | null {
	if (typeof document === "undefined") return null
	const size = 64
	const c = document.createElement("canvas")
	c.width = size
	c.height = size
	const ctx = c.getContext("2d")
	if (!ctx) return null
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
	g.addColorStop(0, "rgba(255,255,255,1)")
	g.addColorStop(0.35, "rgba(255,255,255,0.85)")
	g.addColorStop(1, "rgba(255,255,255,0)")
	ctx.fillStyle = g
	ctx.fillRect(0, 0, size, size)
	const tex = new THREE.CanvasTexture(c)
	tex.needsUpdate = true
	return tex
}
