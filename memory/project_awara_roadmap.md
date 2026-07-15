---
name: project-awara-roadmap
description: "AWARA project status — refactor complete (May 17, 2026); Phases 6-12 remain (~65 tasks) toward v1.0 public launch."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9a837a63-481d-4e79-914f-0b7d1bdaed3e
---

**Status as of 2026-05-17:** Refactor phase 100% complete. 24 tasks done. Code reduced ~78× (1 MB → 12.7 KB). Clean modular architecture established.

**Why:** This was foundation cleanup — "чистка хаоса". The actual feature/content building begins now ("строительство дома"). Canon numbers 21/33/14/9/63/693 are locked and won't shift.

**How to apply:** When Pavel asks about next steps or "что дальше?", use this roadmap as reference. When he picks a phase, look up the matching task IDs.

## Completed
- ФАЗА 1: Подготовка ✓
- ФАЗА 2: CSS-модули ✓
- ФАЗА 3: JS-модули ✓
- ФАЗА 4: Разбивка экранов ✓
- ФАЗА 5: Финализация ✓

## Remaining roadmap (~65 tasks to v1.0)

**ФАЗА 6: Земля Игрока (Васту 3D)** — 2-4 нед
- T-100 Three.js в earth.html · T-101 Васту-храм 3D · T-102 8 направлений (Брахма-стхана) · T-103 9 секторов · T-104 свет земли ↔ ежедневная практика · T-105 натальная карта внутри земли · T-106 объекты дома (дерево/фонтан/алтарь)

**ФАЗА 7: Оракул AI** — 1-2 нед
- T-110 OpenRouter/Claude API · T-111 промпт-инженерия · T-112 канон AWARA (агенты × матрицы) · T-113 совет дня · T-114 сохранение сессий · T-115 AI-визуализация карт (Replicate Flux)

**ФАЗА 8: Сообщество (Firebase)** — 2-3 нед
- T-120 Firebase Auth · T-121 профили · T-122 светкоин P2P · T-123 топ Державы РА · T-124 публичный дневник Тигеля · T-125 чат внутри матрицы

**ФАЗА 9: Канон + контент** — 3-6 нед
- T-130 13 уровней инициации · T-131 27 накшатр · T-132 14 лок · T-133 9 чакр · T-134 693 пары агент×матрица · T-135 100+ ежедневных квестов · T-136 тексты от мудрецов

**ФАЗА 10: UX/UI Polish** — 2-3 нед
- T-140 дизайн (Claude Designer) · T-141 анимации · T-142 звук (чакры/мантры) · T-143 микро-взаимодействия · T-144 a11y · T-145 темы (день/ночь/закат)

**ФАЗА 11: Монетизация** — 1-2 нед
- T-150 Donate (Boosty/Tinkoff) · T-151 Patreon-уровни · T-152 платные карты · T-153 книга (PDF) · T-154 курс "Путь Создателя"

**ФАЗА 12: Запуск** — 1 нед
- T-160 бета 10-20 юзеров · T-161 фидбек · T-162 prod deploy (Netlify Pro) · T-163 аналитика (Plausible/Yandex) · T-164 SEO+соцсети · T-165 публичный запуск

**Pace estimates:** sprint 1.5-2 мес · средний 4-5 мес · расслабленный 8-12 мес.

Related: [[user-pavel-awara]], [[reference-awara-repo]].
