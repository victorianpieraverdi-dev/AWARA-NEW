---
name: feedback-no-local-servers
description: Never start local preview servers (node/python http.server) or shell commands to verify HTML files — user opens them manually
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 17750536-a9c5-4349-96ef-cd34186ff00f
---

Never run local servers or shell commands (`python -m http.server`, `node ... http server`, `npx http-server`, etc.) to preview/verify HTML deliverables.

**Why:** User explicitly stopped this mid-session (2026-07-15) after I spun up a Node static server to visually verify a Vedic-matrix HTML component before delivering it. They want to open files themselves, not have background servers running.

**How to apply:** When asked to produce an HTML/CSS/JS file (e.g. AWARA UI components), just write the file with Write/Edit and hand over the path. Do not use Bash/PowerShell to launch `python -m http.server`, `node -e "...createServer..."`, `npx http-server`, or navigate a browser tab to `localhost:*` for self-verification. If visual verification is genuinely needed, either publish via the Artifact tool (with the CSP/font caveats noted — see [[feedback_no_local_servers]] sibling notes on Google Fonts CDN being blocked) or skip verification and let the user check it themselves.
