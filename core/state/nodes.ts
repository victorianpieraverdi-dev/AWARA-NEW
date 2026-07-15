// AWARA cosmology graph — single source of truth for navigation.
// `legacyHref` lets the new engine progressively wrap existing .html screens
// during migration (a node can render its 3D scene OR iframe/redirect to legacy).

import type { NodeId, Direction } from "../types"

export type TransitionKind = "spark" | "zoom-in" | "zoom-out" | "cross"

export interface NodeDef {
	id: NodeId
	key: string
	title: string
	/** Existing legacy screen used until the native 3D node is ready. */
	legacyHref?: string
	/** Neighboring nodes by direction (Vastu cross + zoom). */
	links: Partial<Record<Direction, NodeId>>
	/** Recommended GSAP transition when entering this node. */
	transition: TransitionKind
}

export const NODES: Record<NodeId, NodeDef> = {
	0: {
		id: 0, key: "void", title: "\u0418\u0441\u0442\u043e\u043a \u0438 \u041f\u0443\u0441\u0442\u043e\u0442\u0430",
		legacyHref: "dzyan.html", links: { in: 1 }, transition: "spark",
	},
	1: {
		id: 1, key: "macrocosm", title: "\u041c\u0430\u043a\u0440\u043e\u043a\u043e\u0441\u043c (\u0422\u043e\u0440)",
		legacyHref: "multiverse-map.html", links: { in: 2, out: 0 }, transition: "zoom-in",
	},
	2: {
		id: 2, key: "lobby", title: "\u041b\u043e\u0431\u0431\u0438 (\u0417\u043e\u043b\u043e\u0442\u043e\u0435 \u042f\u0439\u0446\u043e)",
		legacyHref: "index.html",
		// Vastu cross: South->Daimon, North->Light Game, West->Matrices, East->Tigel
		links: { out: 1, south: 4, north: 6, west: 3, east: 5 }, transition: "zoom-in",
	},
	3: {
		id: 3, key: "matrices", title: "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0438 \u041c\u0430\u0442\u0440\u0438\u0446\u044b",
		legacyHref: "matrices.html", links: { east: 2 }, transition: "cross",
	},
	4: {
		id: 4, key: "daimon", title: "\u0414\u0430\u0439\u043c\u043e\u043d",
		legacyHref: "daimon.html", links: { north: 2 }, transition: "cross",
	},
	5: {
		id: 5, key: "tigel", title: "\u0422\u0438\u0433\u0435\u043b\u044c \u0414\u0443\u0448\u0438 \u0438 \u0417\u0432\u0451\u0437\u0434\u043d\u044b\u0435 \u0425\u0440\u0430\u043c\u044b",
		legacyHref: "tigel.html", links: { west: 2 }, transition: "cross",
	},
	6: {
		id: 6, key: "light-game", title: "\u0421\u0432\u0435\u0442\u043e\u0432\u0430\u044f \u041d\u0430\u0441\u0442\u043e\u043b\u044c\u043d\u0430\u044f \u0418\u0433\u0440\u0430",
		legacyHref: "nine-measures.html", links: { south: 2, in: 7 }, transition: "cross",
	},
	7: {
		id: 7, key: "ra", title: "\u0414\u0435\u0440\u0436\u0430\u0432\u0430 RA (\u0425\u0440\u043e\u043d\u043e\u0433\u0440\u0430\u0444)",
		legacyHref: "dashboard.html", links: { out: 6 }, transition: "zoom-in",
	},
}

/** All node ids in canonical order. */
export const NODE_IDS = Object.keys(NODES).map(Number) as NodeId[]
