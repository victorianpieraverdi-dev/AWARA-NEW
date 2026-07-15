// Three.js material wrapper for the Dynamic Dimensionality shader.
// Requires `three` (peer dep). Drives flat<->volumetric transform via setLight().

import * as THREE from "three"
import { dimensionalVertex, dimensionalFragment } from "./shaders/dimensional.glsl"

export interface DimensionalOptions {
	/** Monochrome base color at low Light. Default: muted gold-gray. */
	colorLow?: THREE.ColorRepresentation
	/** Saturated sacred color at high Light. Default: AWARA gold #c9a84c. */
	colorHigh?: THREE.ColorRepresentation
	/** Initial Light 0..1. */
	light?: number
}

export class DimensionalMaterial extends THREE.ShaderMaterial {
	constructor(opts: DimensionalOptions = {}) {
		super({
			vertexShader: dimensionalVertex,
			fragmentShader: dimensionalFragment,
			uniforms: {
				uLight: { value: clamp01(opts.light ?? 0) },
				uTime: { value: 0 },
				uColorLow: { value: new THREE.Color(opts.colorLow ?? "#6b6256") },
				uColorHigh: { value: new THREE.Color(opts.colorHigh ?? "#c9a84c") },
				uCameraPos: { value: new THREE.Vector3() },
			},
		})
	}

	/** Set player Light (0..1). Hook this to PlayerState.light via GSAP for smooth morphs. */
	setLight(v: number): void {
		this.uniforms.uLight.value = clamp01(v)
	}

	get light(): number {
		return this.uniforms.uLight.value as number
	}

	/** Call each frame. */
	update(dt: number, cameraPos: THREE.Vector3): void {
		this.uniforms.uTime.value += dt
		;(this.uniforms.uCameraPos.value as THREE.Vector3).copy(cameraPos)
	}
}

function clamp01(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v
}
