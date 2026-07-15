---
name: reference-awara-kb-obsidian
description: "Obsidian vault rooted at C:\\AWARA — game repo + memory (junction) + kb (junction) in one vault"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 00f9b4ed-fd7d-4be6-b6d3-a9381e9b3c8f
---

Obsidian vault корень: **`C:\AWARA\`** (это и сам game-repo, и vault одновременно).

Структура vault (что видит Obsidian при открытии `C:\AWARA`):
- Сам game-repo (index.html, spheres-v2.html, TASKS.md, lore/, docs/, …)
- **`memory/`** — junction на `C:\Users\pavelradost\.claude\projects\C--\memory\` (моя auto-memory; правки в Obsidian видны мне)
- **`kb/`** — junction на `C:\Users\pavelradost\ff\awara-kb\` (knowledge base — лор, концепты, синтез)

`.gitignore` в C:\AWARA исключает `/memory/`, `/kb/`, `/.obsidian/` — junction-папки не попадут в git.

### kb/ (knowledge base)
- `CLAUDE.md` — правила смотрителя (русский, даты YYYY-MM-DD, append-only log сверху)
- `raw/sources/` — лорбуки/дизайн-доки (read-only)
- `wiki/` — основная зона: `index.md`, `log.md`, `entities/` (agents 21, matrices 33, lokas 14, chakras 9, daimon 5, milost 7), `concepts/`, `mechanics/`, `architecture/`, `synthesis/`
- Pinecone-tools на верхнем уровне: `ingest_to_pinecone.py`, `query_pinecone.py`, `export_for_notebooklm.py`
- `notebooklm_export/` — экспорт для NotebookLM
- Канон (неизменяем): 21 агент / 33 матрицы / 14 лок / 9 чакр / 63 карты / 693 соответствия

### memory/
Моя auto-memory с индексом `MEMORY.md` — то же самое, что я читаю в начале каждой сессии. Изменения в Obsidian отражаются мгновенно (это симлинк, не копия).

**Why:** Один vault удобнее трёх раздельных — Pavel может видеть и редактировать игру, память и базу знаний в одном Obsidian-окне; ссылки `[[name]]` работают через папки.
**How to apply:** Когда нужно «открыть обсидиан» — это `C:\AWARA\`. Перед правками в kb читать `kb/CLAUDE.md` и `kb/wiki/index.md`. После ingest/synthesis обновлять `kb/wiki/index.md` и добавлять запись в `kb/wiki/log.md` сверху. Память править как обычно (см. инструкции в начале сессии) — путь `memory/<file>.md` или прямой путь к `.claude\projects\...` — оба ведут в одно место.

Related: [[user-pavel-awara]], [[reference-awara-repo]], [[project-awara-roadmap]], [[reference-notebooklm-setup]].
