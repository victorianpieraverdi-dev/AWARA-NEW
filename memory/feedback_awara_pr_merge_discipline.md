---
name: feedback-awara-pr-merge-discipline
description: После мержа PR ветку использовать НЕЛЬЗЯ — новые коммиты не попадут на live. Всегда новый PR или новая ветка.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a828e1dc-e132-489a-8cd3-932c612d88bd
---

После того как PR смержен в master, продолжать пушить в ту же ветку **бесполезно** — новые коммиты висят в ветке, но в master не попадают, на live (GitHub Pages деплоится из master) их нет.

**Why:** 2026-05-28 — Pavel сказал "ничего не поменялось". PR #184 смержили рано (только первые 4 правки). Я закоммитил 3 follow-up в ту же ветку (modal panel, + кнопки, СТИЛЬ tab). Думал, что они автоматически попадут в PR — нет, PR закрыт. Live не обновлялся. Пришлось открывать PR #185 вручную.

**How to apply:**
- Перед `git push` всегда проверять `gh pr view <число> --json state` — если `MERGED`, открывать **новый PR** или новую ветку.
- Или сразу после смерженного PR создавать новую ветку: `git checkout -b devin/<ts>-<task>` от свежего master.
- Когда Pavel говорит "не работает / ничего не изменилось" про live — первым делом проверять `git log origin/master --oneline` против локальных коммитов, не доверять слепо что "запушено == на сайте".
- Главная ветка проекта называется **`master`**, не `main`. `git fetch origin main` падает.

Связано: [[reference-awara-repo]], [[project-awara-pr184-state]].
