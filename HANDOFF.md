# AWARA / ТИГЕЛЬ — HANDOFF

_Обновлено: 2026-07-09. Сессия Супер-Игры (P9)._

## 0. ТЕКУЩАЯ СЕССИЯ (2026-07-09) — начать отсюда

Читать сначала: `docs/BACKLOG.md` → раздел **P9** (Супер-Игра: борд как отражение пути игрока), затем:
- `kb/wiki/synthesis/super-igra-put-igroka-2026-07-07.md` — геометрия/иерархия/панель Духа/мета-прогрессия
- `kb/wiki/synthesis/brainstorm-telegram-2026-07-08.md` — смежный брейншторм по всей игре

**Сделано (P9.1-P9.3), всё в `js/superGameBoard.js`, живой борд `app/board/SuperGameBoard.tsx`:**
- P9.1 — 12 колец переосмыслены: -3…0 Даймон (ч/б) + 1-3 Душа + 4-6 Джива+Искра + 7-9 Дух (цвет), в т.ч. Three.js 3D-слой
- P9.2 — панель «Дух» (кольца 7-9): вопросы к одному из 21 Агента, тон ответа зависит от линзы, живой ИИ через `app/awaraAi.ts`→прокси :8787 + локальный фолбэк
- P9.3 — мета-прогрессия Дух-линзы → Собор Духов → Творец → Создатель → Свет Созидания, драйвер — качество+свет+сила Духа (не счёт), связь с Милостью (Сатья-юга) на верхнем уровне
- Плюс: мобильный UX борда (вкладки Путь/Вход/Линза/Поле/Игроки/Дух/Синтез вместо вертикального стека)

**Открыто, требует моего (Павла) решения** — см. итоговые отчёты задач в чате/логах, коротко:
- Пороги синтеза (1.0/2.5/6.0/1000 света) — не откалиброваны (сама формула качества 0.45/0.35/0.20 заменена на sensitivity в сверке-2)
- Слияние -2/-1 Даймона в одно серое кольцо; имена колец 8-9 "Собор"/"Дух" путаются с мета-уровнем "Собор Духов"
- Свет Созидания сейчас одноразовый за сохранение — не решено, должен ли быть переповторяемым

**Сверка с engine_config.json (2026-07-09, вторая-четвёртая сессии) — закрыты пункты 1, 2, 3, 4 и 5 из `kb/wiki/synthesis/engine-config-reconciliation-2026-07-09.md`:**
- Сверка-1 ✅ — глобальное кольцо `getCurrentRing(totalLight)` (`js/daimonAscent.js`, пороги спеки дословно: 0/5/15/30/50/100/200/400/700/1200/2000/3500/6000). Два слоя сосуществуют: фишка на борде (кубик) — локально, кольцо по свету — глобально.
- Сверка-3 ✅ — световые структуры `js/lightStructures.js` (6 штук из спеки, персист `state.lightStructures` в `awara_v258_state`), UI-блок «Световые структуры» на борде (desktop — в стеке панели после Синтеза, mobile — вкладка «Синтез»). Панель Духа: OR из трёх условий (ярус Дух на борде / глобальное кольцо ≥ 7 / построен «Канал Духа»).
- Сверка-2 ✅ — sensitivity вместо изобретённой формулы качества P9.3: `js/sensitivity.js` (уровни спеки дословно, персист `state.sensitivity`), качество Духа = clamp(sensitivity/100, 0.05, 1) — 1:1 замена переменной, пороги/иерархия SYNTH_RULES не тронуты. Рост при quality > 0.7: +(q−0.7)×10 за сигнал; v1-упрощение — quality из локальной эвристики текста игрока к Духу (живой ИИ-оценки в v258 нет; квест ячейки борда — display-only, без ответа игрока). Показ в панели «Синтез»: значение + уровень + качество Духа.
- Сверка-4 ✅ — механики Ра (ra_radiance), текстовый слой без новой механики: «послания Ра» (`RA_MESSAGES` в `js/superGameBoard.js`, банк 7 штук, детерминированная ротация) после закрытия квеста кольца яруса Дух (бросок, уводящий фишку с колец 9-11 борда — judgment call: явного события «квест выполнен» нет, квест ячейки display-only; ярус локальный, «Ра — фон, не метрика»); «голос Ра» (`RA_VOICE_INTRO`) — вступление к ответу Панели Духа при глубоком пробуждении = sensitivity «Чистая» (100+) И quality текста > 0.7; «прямая линия к Ра» в описании spirit_channel (`js/lightStructures.js`). Тексты посланий сочинены в духе спеки (готовых нет), 3-е — дословная цитата source_quote_s6.
- Сверка-5 ✅ — гностический миф: точные определения Джива/Душа/Дух/Эфир (`MYTH` в `js/spiritPanel.js`, дословно из foundational_myth.core.geb) — в системный промпт персоны Духа (ИИ говорит терминами мифа) и точечно в локальные фолбэки (ask: Дух представляется «продукт Вечности, Искра Единого»; illuminate: «эфир стянет три тела в единую текучую дживу»).
- Осталось: Сверка-6 (частицы/эфир — реальные эффекты структур + эффект sensitivity на particle_multiplier «+0.05 за уровень при пробуждённом эфире»; сейчас подключён только «Канал Духа») — крупная задача, требует отдельного решения по объёму.
- ⚠ Для Павла: глобальное кольцо — чистая функция от `state.totalLight`, поэтому постройка структуры (трата света) может ОПУСТИТЬ кольцо/Меру. Если кольцо должно быть монотонным («достиг — не теряешь»), нужно отдельное поле lifetime-света — решить.

**Следующее по очереди:**
- P9.4 — скрещивание линз на тире 4+ → уникальный портрет игрока
- P9.5 — кнопка генерации артефакта/музыки дня из 3D-модели пути

---

## Старое (архив, до 2026-07-09)

_Обновлено: 2026-06-15. Большая сессия дизайна и видения._

---

## 1. Инфраструктура

- **MCP-мост (файлы):** `https://cannot-marshland-subpanel.ngrok-free.dev/sse` — подключение `mcpServer_awara3`. Доступ к `C:\AWARA` и `C:\Users\pavelradost\ff\awara-kb`.
  - ⚠️ ngrok-URL меняется при перезапуске туннеля. Старые мёртвые: `grunt-author-divorcee…` (awara/awara2). При смене — создать новое подключение MCP с новым `serverUrl`.
  - Инструменты: `read_text_file{path,head?,tail?}`, `write_file{path,content}`, `edit_file{path,edits:[{oldText,newText}]}` (АТОМАРЕН — при ошибке ни одна правка не применяется), `list_directory`, `directory_tree`, `search_files` (по именам), `create_directory`, `get_file_info`. Пути в JSON: `C:\\AWARA\\...`.
- **Локальный сервер (Тигель + чат):** `awara-ai-proxy.cjs`, порт **8787**, ROOT=__dirname. Прокси на DeepSeek (`api.deepseek.com`, ключ в `C:\AWARA\deepseek.key`). `/` → `/tigel-app.html`.
  - Запуск: двойной клик `C:\AWARA\Запустить-ИИ.bat` (окно не закрывать) ИЛИ `cd /d C:\AWARA && node awara-ai-proxy.cjs`.
  - Порт занят → `taskkill /F /IM node.exe`, затем перезапуск. Перезапуск НЕ нужен при правке статики (только Ctrl+F5 в браузере).
- **Прототип:** `http://127.0.0.1:8787/tigel-app.html`.
- **Пользователь:** Pavel / pavelradost, TZ Europe/Kaliningrad.

---

## 2. Текущий статус дизайна (ГДЕ ОСТАНОВИЛИСЬ)

Стиль интерфейса переведён на **Linear (Dark Mode) + Aceternity UI**, чистый CSS без Tailwind. Файл: `C:\AWARA\awara-ds.css` (подключён в `tigel-app.html` как `awara-ds.css?v=8`).

Ключевые классы (применяются к существующей разметке):
- **`.awara-glass-card`** — карточка в стиле дашборда Linear: фон `#000000`, бордер `rgba(255,255,255,0.05)`, радиус 12px, микро-тень + тонкий верхний внутренний блик, без блюра. `:hover` — бордер `0.09`. Активная (`.glow`, `.df-chip.on`) — белый акцент `0.14`.
- **`.awara-gold-button`** — кнопка Aceternity «Moving Border»: вращающийся `conic-gradient(from var(--aw-angle))` по периметру через `@property --aw-angle` + `mask-composite: exclude` (ринг не перекрывает текст). Основа `#0a0a0a`, inset-ринг как фолбэк, золотое внешнее свечение на `:hover`, `scale(.98)` на `:active`.
- **`#dmGlyph, .avatar-lens`** — аватар Даймона: строгая чёрная линза Linear (бордер `rgba(255,255,255,0.08)`, без золотого свечения).
- **`.df-g, .icon-placeholder { display:none }`** — скрыты пустые слоты иконок.
- Погашен шумный космос-слой прототипа: `.neb, .scanline { display:none }` — фон действительно чёрный.
- Сохранена служебная типографика: `.ds-lore` (Cinzel), `.ds-stat` (JetBrains Mono, золото), `.ds-deglyph`.

`daimon-forms.js?v=8`: чипы форм используют класс `awara-glass-card`, аватары — `avatar-lens`, собственные перекрывающие стили сняты (чтобы эталон из awara-ds.css был главным).

---

## 3. СЕССИЯ 2026-06-15 — ЧТО СДЕЛАНО И С ЧЕГО НАЧАТЬ

### Что сделано за сессию
- Полное видение игры зафиксировано в `kb/wiki/synthesis/vision-core.md`
- Архитектура экранов (Васту-крест, 7 нод) → `kb/wiki/synthesis/screen-architecture.md`
- Прототип яйца → `C:\AWARA\egg-evolution.html` (6 стадий 2D→3D)
- Изучены папки с материалами: `C:\AWARA\lvl god\` и `C:\Users\pavelradost\awara-game\`

### Ключевые референсы
- `C:\Users\pavelradost\awara-game\` — предыдущая реализация Devin (40+ готовых экранов, живой деплой)
  - Данные: `awara-game/data/` — всё готово (agents, matrices, daimons, temples, ayurveda...)
  - Экраны-референсы: `earth-player.html`, `initiation-corridor.html`, `festivals.html`, `cosmic-map.html`
- `C:\AWARA\lvl god\` — материалы Павла: эскизы архитектуры, v253 прототип, философия
- `C:\AWARA\egg-evolution.html` — прототип центрального яйца (открыть в браузере)

### С ЧЕГО НАЧАТЬ В СЛЕДУЮЩЕЙ СЕССИИ
**Вариант A:** Интегрировать `egg-evolution.html` в `index.html` (заменить текущее лобби)
- читать `crystalsTotal` из `awara_v258_state` вместо `awara_egg_demo_light`
- убрать режим создателя из релиза, оставить за `?creator=1`

**Вариант B:** Взять любой следующий экран по архитектуре нод (нода 3/4/5/6)
- за референс брать соответствующий HTML из `awara-game/`

**Вариант C:** Аудио-система — базовые Hz-частоты чакр на переходах (готова таблица в vision-core)

Спросить Павла: с чего начинаем?

---

## 3b. СЛЕДУЮЩИЕ ШАГИ (старые)

1. **Прогнать оставшиеся экраны под классы `.awara-glass-card` / `.awara-gold-button`:** `#s-result`, `#s-chron`, `#s-natal`, `#s-tigel`, `#s-plan`, `#s-game`, модалки `#libModal` / `#genModal` / `#aiModal`, селекты, скроллбары. Сейчас часть блоков на этих экранах использует базовый `.card` и обычные кнопки → останутся в старом виде, пока не присвоить классы DS.
2. Проверить плоские `.card` без `awara-glass-card` (например `.dm-hero` на `#s-daimon`) — при жалобе на «тёмные блоки» дать им класс `awara-glass-card` (НЕ возвращать `#s-daimon .card`).
3. (опц.) Монохромные stroke-SVG вместо скрытых `.df-g` / `.icon-placeholder`.
4. **ФАЗА 3 (отложено):** подключение игроков / мультиплеер / профили / чат между игроками; Telegram-апп; «Весы»/блокчейн; генерация арта/трека.

---

## 4. Правила работы (важно)

- **edit_file АТОМАРЕН:** вернул `isError` → НИ ОДНА правка не применилась (перезапустить весь массив или разбить на отдельные вызовы с минимальными якорями). Вернул diff → правка УЖЕ применена, не повторять.
- **Кэш статики:** при правке КОНТЕНТА файла бампать `?v=N+1` в `tigel-app.html`, юзеру — Ctrl+F5.
- **Специфичность CSS:** ID-селекторы в JS-файлах (`#s-daimon .card`, `#dmGlyph`), грузящихся ПОСЛЕ `awara-ds.css`, перебивают классовые правила даже с `!important`. Нейтрализовать в исходном JS, а не плодить `!important`.
- **MCP/computer/images-правки — без editDescriptionVariableName и без edit_reference** (это не Notion-страницы).
- **computer-модуль НЕ видит `C:\AWARA`** — для файлов проекта только MCP-мост.
- Версии модулей (в `tigel-app.html`): `awara-ds.css?v=8`, `daimon-forms.js?v=8`, `awara-glass.js?v=4`; остальные (numerology/western/maya/bazi/slavic-krugolet/hd/i18n…) см. теги `<script>`.

---

## 5. Карта файлов (основное)

- `tigel-app.html` — главный прототип (vanilla, экраны `#s-istok/#s-natal/#s-tigel/#s-result/#s-daimon/#s-plan/#s-chron/#s-game` + модалки).
- `awara-ds.css` — дизайн-система (Linear + Aceternity).
- `daimon-forms.js` — формы/чипы Даймона, хукает `window.renderDaimon`.
- `awara-ai-proxy.cjs` — сервер+прокси DeepSeek.
- Расчётные ядра: `numerology.js`, `western.js`, `maya.js`, `bazi.js`, `slavic-krugolet.js`, `hd.js`, `calc-systems.js`, `natal-deep.js`.
- i18n: `i18n.js` + `i18n-data*.js` + `i18n-deep*.js`, `lore-en.js`.
- `data/`: `mythic_branches.json`, `mythic_locations.json`.
- React-версия (отдельно): `C:\AWARA\app\` (Vite, r3f/three), компоненты `C:\AWARA\components\ui\GlassCard.jsx`, `GoldButton.jsx`.
- 33 матрицы (слаги): vedic, egyptian, kabbalistic, mayan, slavic, norse, daoist, gnostic, shinto, celtic, shambhala, julian_byzantine, shamanic, gene_keys, technomagical, cosmic_galactic, antique_greco_roman, zoroastrian, islamic_sufi_nur, aztec_mexica, christian_mystical_grail, yoruba_ifa_orisha, sumerian_babylonian, hermetic_alchemical, tarot_arcanic, astrological, chinese_iching, tantric_kashmiri, buddhist_mahayana, afro_dogon, atlantean_lemurian, posthuman_ai_sophianic, advaita_siddha.
