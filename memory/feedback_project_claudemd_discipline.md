---
name: feedback-project-claudemd-discipline
description: "Embed core behavioral guidelines (think-before-coding, simplicity, surgical changes, goal-driven execution) directly into a project's own CLAUDE.md, not just rely on global ~/.claude/CLAUDE.md"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 38978919-f01e-41ff-b288-4d3470c82ca0
---

When working in a project directory (e.g. `C:\AWARA`) — especially one where work is delegated to background subagents (Fable/Sonnet tasks briefed via the Agent tool) — add the core behavioral discipline block (Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution, verbatim from the user's global `~/.claude/CLAUDE.md`) directly into that project's own `CLAUDE.md`, near the top, before project-specific rules.

**Why:** The user explicitly asked for this on 2026-07-07 while working on AWARA ("применяй всегда перед началом работы, это основной скилл") after a stretch of several large Fable-agent tasks. Global `~/.claude/CLAUDE.md` governs the main interactive session, but each spawned subagent gets a fresh, self-contained prompt — the project's own `CLAUDE.md` is what's actually visible/loaded when work happens inside that repo, regardless of who (main session or subagent) is doing it.

**How to apply:** When starting substantial work in any project repo that doesn't already have this discipline block in its `CLAUDE.md`, add it near the top (surgical edit — insert only, don't restructure the rest of the file). Applies generally, not just to AWARA — the user's phrasing ("основной скилл") suggests this is a standing expectation for any codebase, not a one-off.

Related: [[reference-awara-repo]], [[project-awara-roadmap]].
