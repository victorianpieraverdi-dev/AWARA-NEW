---
name: feedback-awara-verify-not-trust
description: "For AWARA work, verify task DoD against actual code — TASKS.md checkmarks regularly drift from reality."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9a837a63-481d-4e79-914f-0b7d1bdaed3e
---

In the AWARA project, when asked to audit, plan, or build on top of "completed" tasks: don't trust `[x]` marks in `TASKS.md`. Verify each DoD against the current code (grep for the named exports / localStorage keys / DOM ids / file paths the DoD specifies).

**Why:** Pavel said directly "в прошлый раз мы нашли кучу нестыковок и потихоньку правили" — drift between TASKS.md and code is recurring. Audit on 2026-05-28 confirmed 8 concrete drift items (see [[project-awara-audit-2026-05-28]]) including a real user-visible bug (passport Milost panel always shows "не рассчитан" because no one writes the localStorage key it reads). The drift sources are typically: v2 rewrites (E-001..E-005 Milost v2.0) that don't backfill old-API consumers, multiple parallel state keys (v255/v258/player_state), and stale docs (`screen-status.md`).

**How to apply:**
- When a task says module X exports function Y → grep `js/X` for `export.*Y`. If absent, the task is undone or superseded.
- When a task references a localStorage key → grep both reads and writes. A read with no writer = silent broken UI.
- When DoD names UI fields → check the rendering code populates them from a real source.
- Before recommending implementation work on top of "done" tasks, confirm the foundation actually works.
- Surface drift findings explicitly — Pavel wants the inconsistency list, not just a green-tick summary.

Related: [[user-pavel-awara]], [[project-awara-audit-2026-05-28]].
