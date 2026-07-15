---
name: project-awara-spheres-v2-status
description: "spheres-v2.html status (2026-05-28): PR #182 merged, media attachments complete. New requirements: mobile panel UX, evening Spark ritual, Earth transition."
metadata: 
  node_type: memory
  type: project
  originSessionId: a828e1dc-e132-489a-8cd3-932c612d88bd
---

**Статус spheres-v2.html по состоянию на 2026-05-28 20:48 UTC:**

PR #182 (`devin/1779993309-spheres-v2-onboarding`) **смерджен в master**. Коммит `0717115` содержит полную реализацию медиа-вложений.

**Что готово (в master):**
1. Onboarding tutorial (6 шагов: Welcome → Foundation → Future → Present → Connections → Complete)
2. 5-я сфера СВЯЗИ / CONNECTIONS (id: `connections`, позиция (0.82, 0.75))
3. Искра-подсказчик (Spark Helper) — золотая частица, летает между сферами, подсказки каждые ~25 сек (8 RU / 8 EN)
4. Кнопка «Перейти в Тигель» — появляется после заполнения 3+ сфер
5. **Медиа-вложения (полностью реализованы):**
   - 🎤 Диктофон (MediaRecorder API, WebM, max 2MB)
   - 📷 Фото / 🎬 Видео (FileReader → base64 dataURL, max 2MB)
   - 🔗 Ссылки (URL input, auto https://)
   - Вкладка МЕДИА в панели сферы (галерея всех медиа)
   - 🌐 Социальные профили (Telegram, VK, Instagram и т.д., авто-иконки)
   - Интеграция: `pendingAttachments` сохраняются в `addSubSphere()`, иконки в списке подсфер
   - localStorage: `awara_v2_media_<sphereId>`, `awara_social_links`

**Новые требования от Павла (2026-05-28, ✅ РЕАЛИЗОВАНЫ в коммите 434bb68):**

1. **Мобильная UX панели сферы:** ✅
   - При тапе на сферу на мобильном (max-width: 768px) — панель выходит **сверху** (top:0, height:85vh) вместо справа.
   - Кнопка Тигель на мобильном — по центру внизу.

2. **Кнопка Тигель → передача содержимого дня:** ✅
   - При клике на «Перейти в Тигель» — функция `goToTigel()` собирает все записи подсфер за сегодня (фильтр по `date`), упаковывает в `localStorage` ключ `awara_soul_day_context` (JSON: {date, spheres:[{id, label, entries:[{text, date, light, attachments}]}]}).
   - `tigel.html` может прочитать этот ключ и сгенерировать смысл дня.

3. **Переход на Землю игрока:** ✅
   - Кнопка «🌍 ЗЕМЛЯ ИГРОКА» (left bottom, зелёная тема) → `earth-player.html`.
   - Файл `earth-player.html` уже существует (778 строк, полноценная страница), не заглушка.

4. **Вечерняя Искра (Evening Spark Ritual):** ✅
   - Кнопка «✦ ИСКРА» (top right) меняет текст по времени суток: 17:00–05:00 → "ВЕЧЕРНЯЯ ИСКРА", 05:00–12:00 → "УТРЕННЯЯ ИСКРА", 12:00–17:00 → "✦ ИСКРА".
   - Режимы: `morning` / `evening` / `full` (переменная `SPARK_MODE`).
   - При клике — функция `openSpark()` → `runSpark()` собирает контекст дня:
     - Все записи подсфер за сегодня (`subSpheres[*]`, фильтр по `date`)
     - Планы за сегодня (`awara_v2_plan_<sphereId>`)
     - Журнал за сегодня (`awara_v2_jrn_<sphereId>`)
   - Показывает модальное окно с результатом (пока демо-шаблон, без AI):
     - **ИНСАЙТ** — резюме дня
     - **СОВЕТЫ** — 3 действия с эмодзи
     - **ВОПРОС** — для вечерней медитации
   - Сохраняет флаг `awara_evening_ritual_<date>` в `localStorage` (не показывать дважды за день).
   - Формат вывода: JSON `{insight, advices:[{ico, text}], question}`.
   - **TODO для продакшена:** заменить демо-шаблон на реальный AI-запрос (OpenRouter API, как в `initiation-space.html` строка 5828+).

**Коммит:** `434bb68` (2026-05-28)
**Ветка:** `devin/1779993309-spheres-v2-onboarding`
**Статус:** запушен в origin, PR #182 уже смерджен (старая версия), нужен новый PR для этих изменений.

**Старая версия Души (для справки):**
- Файл: `spheres.html` (не `spheres-v2.html`) — проверить, есть ли там вечерняя искра, переход на Землю, другие фичи, которые нужно портировать.

**Связанные задачи из vision:**
- T-603: синхронизация Тигель↔Душа (двунаправленная, единый источник правды)
- T-608: дозированные сферы (1 + 1×3 + союзы)
- T-611: атмосфера интерфейса по `totalLight`
- T-614: Земля игрока (Храм по Васту)

**Файлы:**
- `spheres-v2.html` (текущая версия, 1885 строк, в master)
- `spheres.html` (старая версия — проверить на наличие вечерней искры и перехода на Землю)
- `tigel.html` (Тигель — куда передаётся контекст дня)
- `earth-player.html` (Земля — пока заглушка)
- `js/soulTigelSync.js` (синхронизация Душа↔Тигель)

Related: [[project-awara-vision-2026-05-28]], [[user-pavel-awara]], [[reference-awara-repo]].
