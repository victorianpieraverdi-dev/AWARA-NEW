---
name: reference-awara-repo
description: "AWARA repo and live site URLs, plus branching conventions used by Pavel + Devin."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 9a837a63-481d-4e79-914f-0b7d1bdaed3e
---

- **GitHub:** https://github.com/victorianpieraverdi-dev/awara-game — **retired to test-branch status by Pavel around mid-June 2026.** Anything merged there after that point is not authoritative. Local git history in `C:\AWARA` stops at commit `01127a2` (2026-06-12, "macrocosm #173-195") and was never pushed (5 commits ahead of origin, never `git push`'d) — this is intentional, not an oversight.
- **Live (GitHub Pages):** https://victorianpieraverdi-dev.github.io/awara-game/index.html — **outdated/not in use as of 2026-07-02**, per Pavel. Only the local clone reflects current state.
- **Description:** "AWARA — sacred operational system / esoteric game" (HTML/JS, Three.js, Leaflet)

**Local clone:** `C:\AWARA` — cloned 2026-05-31. This is the **sole source of truth** since mid-June 2026 — Pavel works only here now, not against GitHub. As of 2026-07-02: 211 uncommitted changes, 184 of them files that have never been added to git at all (by design — local-only development, not forgotten commits). Pavel runs a local server during sessions to verify changes.

**Why:** Pavel confirmed explicitly (2026-07-02): "я отказался примерно в середине июня полностью от версии на гитхаб оставив её тестовой и начал работать только локально." No backup/push cadence has been established — flag this if asked about backup risk, but don't push to GitHub unprompted (that would resurrect the abandoned test branch as if it were current).

**Branching conventions:**
- `task/T-NNN-...` — Pavel's local task branches (e.g. `task/T-004-agent-hero-dashboard`)
- `Task/E-0NN-...` — feature epics
- `devin/<timestamp>-<slug>` or `devin/T-NNN-...` — branches authored by Devin agent
- `capy/...` — capy agent branches
- Merges land in `main` via PR.

Top-level pages of note: `index.html`, `dashboard.html`, `tigel.html`, `daimon.html`, `milost.html`, `oracle.html`, `natal.html`, `archetype.html`, `cosmic-map.html`, `nine-measures.html`, `aura-pole.html`, `festivals.html`, `region-map.html`, `earth-player.html`, `passport.html`, `matrices.html`, `cards.html`, plus `docs/`, `lore/`, `data/`, `js/`, `css/`, `pages/`, `tools/`, `netlify/`.

Related: [[user-pavel-awara]], [[project-awara-roadmap]].
