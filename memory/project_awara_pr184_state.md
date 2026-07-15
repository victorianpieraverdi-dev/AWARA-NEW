---
name: project-awara-pr184-state
description: "Текущее состояние PR #184 (spheres-v2) на 2026-05-28 — что сделано, что осталось доделать"
metadata: 
  node_type: memory
  type: project
  originSessionId: a828e1dc-e132-489a-8cd3-932c612d88bd
---

PR: https://github.com/victorianpieraverdi-dev/awara-game/pull/184
Branch: `devin/1779993309-spheres-v2-onboarding`
Last commit: `06964c4`

## ✅ Готово
- back-btn в top-left (не накладывается на панель игрока)
- runSpark подключён к OpenRouter API (meta-llama/llama-3.1-70b-instruct), запрашивает ключ при первом использовании, ключ хранится в `awara_openrouter_key`
- Кнопка ⟲ СБРОС: чистит 8 ключей localStorage + 4 префикса (awara_v2_jrn_*, awara_v2_plan_*, awara_v2_media_*, awara_evening_ritual_*), confirm-диалог, reload
- advanceStep исправлен: порядок foundation→mind→heart→connections соответствует TUT_STEPS (баг 3 сферы вместо 5)
- subpanel — центральное модальное окно с backdrop на всех устройствах
- Кнопки "+" возле каждой раскрытой сферы (HTML overlay поверх canvas)
- Tooltip при hover/touch: "Добавить подсферу в [имя] (1/3)"
- Счётчик 1/3 под "+" кнопкой
- Action buttons (+ ЗАПИСЬ / ⟲ СБРОС) — z-index:55, показываются только после enterSpace()

## ❌ Не доделано — нужно дописать в следующей сессии
**Вкладка СТИЛЬ** (HTML добавлен, но JS не написан):

Нужны функции в spheres-v2.html:
- `updateSphereStyle()` — читает значения из #style-sphere-color, #style-sphere-size, #style-sphere-glow, применяет к SPHERES.find(s => s.id === activePanel), вызывает renderSpherePlusButtons()
- `setStyleColor(color)` — устанавливает значение в #style-sphere-color и вызывает updateSphereStyle()
- `resetSphereStyle()` — возвращает дефолтные значения сферы (нужно сохранить дефолты при загрузке)
- `renderSubsphereColors()` — рендерит список подсфер активной сферы с color picker для каждой
- При открытии вкладки СТИЛЬ нужно подгружать текущие значения активной сферы (sp-body-style)

Сохранение стиля: в save() добавить SPHERES стили в localStorage (color/radius/glow/subsphereColors), в load() восстанавливать.

В sp-tabs вкладка помечена `opacity:0.5` и `title="WIP — не доделано"` пока JS не готов.

## Связанные памяти
- [[project-awara-roadmap]]
- [[reference-awara-repo]]
- [[user-pavel-awara]]
