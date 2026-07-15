// AWARA State Manager — drives seamless navigation across the cosmology graph.
// Transitions are delegated to a CameraRig (GSAP zoom-in/zoom-out instead of slides),
// so this class stays render-agnostic and testable.

import { NODES, type NodeDef } from "./nodes"
import type { NodeId, Direction } from "../types"

export interface FocusOptions {
	duration: number
	ease: string
	kind: NodeDef["transition"]
}

/** Implemented by the renderer (R3F/Three) — performs the actual GSAP camera move. */
export interface CameraRig {
	focusNode(node: NodeDef, opts: FocusOptions): void | Promise<void>
}

export type TransitionListener = (from: NodeId, to: NodeId, node: NodeDef) => void

export class StateManager {
	current: NodeId
	readonly history: NodeId[] = []
	private busy = false
	private listeners = new Set<TransitionListener>()

	constructor(private rig: CameraRig, start: NodeId = 0) {
		this.current = start
	}

	/** Subscribe to transitions. Returns an unsubscribe fn. */
	on(l: TransitionListener): () => void {
		this.listeners.add(l)
		return () => this.listeners.delete(l)
	}

	/** Is `to` reachable from the current node? */
	canGo(to: NodeId): boolean {
		return Object.values(NODES[this.current].links).includes(to)
	}

	get node(): NodeDef {
		return NODES[this.current]
	}

	private async transition(to: NodeId): Promise<NodeDef> {
		const from = this.current
		const node = NODES[to]
		this.busy = true
		const kind = node.transition
		const ease = kind === "spark" ? "power4.in" : "power3.inOut"
		const duration = kind === "cross" ? 0.9 : kind === "spark" ? 1.1 : 1.4
		try {
			await Promise.resolve(this.rig.focusNode(node, { duration, ease, kind }))
		} finally {
			this.busy = false
		}
		this.current = to
		this.listeners.forEach((l) => l(from, to, node))
		return node
	}

	/** Navigate to an explicit node id (must be a neighbor). Records history. */
	async go(to: NodeId): Promise<boolean> {
		if (this.busy) return false
		if (to === this.current) return true
		if (!this.canGo(to)) {
			console.warn(`[AWARA] no link ${this.current} -> ${to}`)
			return false
		}
		const from = this.current
		await this.transition(to)
		this.history.push(from)
		return true
	}

	/** Navigate by direction (Vastu cross / zoom). */
	async move(dir: Direction): Promise<boolean> {
		const target = NODES[this.current].links[dir]
		return target == null ? false : this.go(target)
	}

	/** Step back to the previous node (does not re-record history). */
	async back(): Promise<boolean> {
		if (this.busy) return false
		const prev = this.history.pop()
		if (prev == null) return false
		await this.transition(prev)
		return true
	}

	/** Onboarding cinematic: Void -> Macrocosm -> Lobby (0 -> 1 -> 2). */
	async runIntro(): Promise<void> {
		if (this.current !== 0) return
		await this.go(1)
		await this.go(2)
	}
}
