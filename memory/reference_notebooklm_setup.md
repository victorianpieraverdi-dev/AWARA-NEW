---
name: reference-notebooklm-setup
description: NotebookLM CLI setup status and how to install it
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0fb8e6d8-e90b-4d5f-8ac7-a407fd30d021
---

NotebookLM CLI (`notebooklm-py`) is NOT yet installed on this machine (as of 2026-05-26).

Setup steps (from `Skill - NotebookLM.md`):
1. Create venv: `python -m venv ~/.notebooklm-venv`
2. Install: `pip install "notebooklm-py[browser]"` and `playwright install chromium`
3. Symlink: `ln -sf ~/.notebooklm-venv/bin/notebooklm ~/bin/notebooklm`
4. Authenticate using the custom login script in the skill file (NOT `notebooklm login` — interactive input not supported in Claude Code bash)

The WrapUp skill pushes session logs to an "AI Brain" NotebookLM notebook — this won't work until setup is complete.

**How to apply:** Prompt user to run setup before any WrapUp or NotebookLM operations.
