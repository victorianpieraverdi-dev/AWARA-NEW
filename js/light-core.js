/**
 * light-core.js — ПОЗВОНОЧНИК СВЕТА (Этап 0, ревизия 6)
 *
 * Единый источник истины для роста игрока и раскрытия хаба-яйца.
 * НЕ подключён к UI и НЕ пишет в localStorage — это чистая модель + самопроверка.
 *
 * ── ПРИНЦИП: КОМПАС, А НЕ РЕЛЬСЫ (главное правило этого файла) ──
 *  Этот фундамент КОРРЕКТИРУЕТ и ПОДСКАЗЫВАЕТ, но НЕ запрещает и НЕ диктует.
 *  • Ядро хранит только истину соответствий (карта традиций). Оно НИЧЕГО не
 *    навязывает игре: не блокирует действия, не пишет состояние, не гейтит.
 *  • Любое влияние на игру идёт ТОЛЬКО через suggest(state) — это СОВЕТ,
 *    который игра и автор вольны принять, переосмыслить или отвергнуть.
 *    Никаких if-block по канону. Свобода творчества в проекте — неприкосновенна.
 *  • Традиции (7 чакр / 9 мер / Блаватская / Адвайта / Бейли / Ра) — это
 *    ПАЛИТРА параллельных дверей, а не единственный коридор: одна вершина,
 *    много троп.
 *
 * ── РОЛЬ АВТОРА: СИНТЕЗАТОР НАД КАНОНОМ (см. STANCE) ──
 *  Над всеми источниками стоит АВТОР-СОЗИДАТЕЛЬ, который вышел за пределы
 *  выданных концепций и свободно играет ими, чтобы собрать живую систему.
 *  Канон — сырьё и палитра, а не догма. Цель синтеза:
 *    • МАКСИМАЛЬНАЯ АДАПТАЦИЯ под современного человека (язык, ритм, опыт);
 *    • ДОСТУПНОСТЬ для любого возраста — без возрастных барьеров; глубина
 *      раскрывается ПОСЛОЙНО по готовности игрока, а не закрывается запретом;
 *    • СВОБОДА ТВОРЧЕСТВА сохраняется: фундамент направляет, но не сковывает.
 *
 * ── ЧТО НОВОГО В РЕВИЗИИ 4 (сверка с сессиями Русского Мастера, radosvet.in) ──
 *  • 9-мерность — это СВОЯ вертикаль Мастера (три триады по три), НЕ «7 чакр +
 *    Монада + Абсолют». НО 7-чакровость НЕ вычёркиваем: она остаётся
 *    ПОЛНОЦЕННЫМ СЛОЁМ-ВХОДОМ, чтобы человек с 7-чакровой структурой тоже мог
 *    зайти. Между ними построен МОСТ соответствий (см. DIMENSIONS.chakra,
 *    CHAKRAS, THEOSOPHY, chakraToDimension/theosophyForChakra).
 *  • ПАРАЛЛЕЛИ (мост трёх языков описания одного позвоночника):
 *        7 чакр (вход)  ↔  9 мер Мастера  ↔  7 принципов человека (Блаватская)
 *    Меры 1–7 несут чакры 1–7 и септенарные принципы; меры 8–9 — это ДУХ выше
 *    Сахасрары (вне 7-чакровой/септенарной системы), куда восходят Буддхи/Атма.
 *    Опора у Блаватской: «видимая Вселенная есть только Стхула Шарира, грубое
 *    тело семеричного Космоса» (Тайная доктрина); порядок принципов — Стхула
 *    Шарира → Прана → Линга Шарира → срединный (Кама) → пятый (Манас) → Буддхи
 *    → Атма (Разоблачённая Изида / Тайная доктрина).
 *  • SENSES (схема чувство→стихия, танматры) помечена как НАША гипотеза: у Мастера
 *    прямая привязка стихий — это ТЕЛА (PRISON_BODIES: физ.→Земля, эфирное→Вода,
 *    астральное→Огонь+Воздух), а Эфир — над всеми четырьмя.
 *  • Душа → Джива — подтверждённый переход: сплавление трёх тел-темниц → единый
 *    поток Дживы → чистый Эфир.
 *  • honesty как дез-иллюзия (близость к Реальности/Атману/Истоку) — подтверждено.
 *  • Добавлены узлы Мастера: RA (истинное Солнце внутри vs ложное внешнее),
 *    CHATURA_LOKA (Яйцо из 4 слоёв + Славь/Тман/Атман), LOCKS (засовы
 *    Род/Деньги/Половое + Код Матери; Белая/Чёрная Клетка), EFIR (спящий→
 *    пробуждённый), PERCEPTION_RAY + SOBOR (Луч Восприятия, до 15 форм).
 *
 * ── ЧТО НОВОГО В РЕВИЗИИ 5 (кросс-традиции: мост стал шире) ──
 *  • АДВАЙТА (advayta.org, Всемирная Община Санатана Дхармы / Викидхарма):
 *    Атман = Брахман; единственная реальность — Сознание (Брахман); майя —
 *    завеса. «Брахман реален, мир нереален». Прямо подкрепляет
 *    REALITY_CRITERION (дез-иллюзия = снятие майи). См. ADVAYTA.
 *  • АЛИСА БЕЙЛИ (Семь Лучей): конституция человека троична — Монада → Душа
 *    → Личность (Воля / Любовь-Мудрость / Активный Разум), что совпадает с
 *    тремя триадами 9-мерности. 7 планов (физический → логоический) мостятся
 *    на 7 чакр. См. BAILEY_RAYS, BAILEY_PLANES, BAILEY_CONSTITUTION.
 *  • МАТЕРИАЛЫ РА (Закон Одного): 7 плотностей сознания и 7 энергетических
 *    центров-лучей (красный→фиолетовый) = 7 чакр 1:1. Мы в 3-й плотности
 *    (Выбор: служение другим/себе ↔ ось LOCKS эгоцентризм→альтруизм).
 *    Зелёный луч (сердце) — трамплин к бесконечности (эхо RA/Анахата).
 *    См. RA_RAYS, RA_DENSITIES.
 *  • МОСТ РАСШИРЕН: bridgeRow/bridgeTable теперь дают для мер 1–7 ещё и
 *    луч-цвет Ра и план Бейли (наряду с чакрой и принципом Блаватской).
 *
 * ── ЧТО НОВОГО В РЕВИЗИИ 6 (СУПЕР МЕГА СИСТЕМА: все традиции — одна карта) ──
 *  Палитра дверей расширена (advisory, не рельсы). Все они — параллельные
 *  языки того же позвоночника 7 чакр / 9 мер, добавлены как ДАННЫЕ + хелперы:
 *    • KOSHAS (5 оболочек) · TATTVAS/TATTVA_LEVELS (36 таттв по 8 уровням) ·
 *      BHUMIS (10 ступеней бодхисаттвы) · DHYANAS (8 дхьян) · JYOTISH (9 граха) ·
 *      VASTU (9 сторон) · DAO (3 даньтяня/сокровища) · SLAVIC_RODNIKI (9
 *      родников ≈ 9 мер 1:1!) · KABBALAH (10 сефирот/4 мира) · KLESHAS (5) ·
 *      PURUSHARTHAS (4 цели) · LOKAS (14 лок) · KINGDOMS (камень→Парамашива).
 *    • ASCENT — единая ось восхождения (9 ступеней): мера ↔ чакра ↔ родник ↔
 *      даньтянь ↔ стихия ↔ лока ↔ коша (ascentTable()).
 *    • GAME_OF_ASCENT — игровой слой-наложение (статы Цзин/Ци/Шэнь/Дэ/XP,
 *      боссы и дары по чакрам, ежедневные квесты, условие победы) — тоже advisory.
 *    • Хелперы: koshaForChakra, bhumiForChakra, jyotishForChakra, rodnikForMere,
 *      sefirotForChakra, ascentRow/ascentTable, doorsForChakra, megaBridgeRow.
 *  Вывод («Тат Твам Аси»): Парамашива = Атман = Дхармакая = Монада = Ты.
 *  Главный вход прежний: 7 чакр и 9 мер; остальное — двери палитры.
 *
 * ── МОДЕЛЬ РОСТА ──
 *  • Осознанность (awareness) — МАСТЕР-метрика. Растёт от усилий, практик,
 *    погружений, пройденных матриц — каждый день понемногу.
 *  • Критерий пути — ОБЪЕКТИВНАЯ РЕАЛЬНОСТЬ (honesty = близость к реальности,
 *    дез-иллюзия). Позитив/негатив, страдание, боль — иллюзии, а НЕ критерий.
 *    Цель игры — просветление/пробуждение, освобождение от иллюзии, Выход.
 *  • Душа = искажённое (нечистое) сознание. Крепится к каналам восприятия
 *    (вход/выход); через них информация пишется на «жёсткий диск» — душу.
 *    Душа держится на трёх спаянных планах: физический → психический →
 *    энергетический (у Мастера — три тела-темницы: физ./эфирное/астральное).
 *  • Путь уровней (арка статуса «Душа»):
 *      Ум (искажения, родовые травмы, эго → высокие качества)
 *      → Душа: физический → психический → энергетический планы
 *      → Эфир (видеть глубже, распределять стихии; вырастает 4-е тело)
 *      → Земля игрока (НЕ стихия — пространство строительства, внутр.→внеш. храм)
 *      → Космос → Вселенная.
 *  • Поверх пути — макро-вертикаль СТАТУСОВ: Душа → Джива → Дух (бытовой →
 *    планетарный → единый) → Творец (до 15 духовных форм) → Созидатель света.
 *  • Гуны (тамас/раджас/саттва) и стихии (земля/вода/огонь/воздух/эфир) —
 *    сквозные; ЭФИР открывается на уровне «Эфир».
 *  • С движением по уровням синхронно растут даймон, сложность карт и
 *    сама ёмкость осознанности.
 *
 * Совместимо с awara_v258_state (playerState.js): прогресс будет жить в
 * state.light = { awareness, honesty, gunas, elements, levelId, statusId },
 * не трогая существующие totalLight / sphereData / elements.
 */

/* ── rev7 (Провод №1) ──
   + MATRIX_BRIDGE: 33 матрицы Тигля сквозь позвоночник
     (чакра/мера, стихия, полюс СВЕТ⇄ТЕНЬ, span, граха-администратор → мост к 21 агенту)
   + MATRIX_KEYS, MATRIX_PATTERNS
   + хелперы: matrixBridge, matricesForChakra, matrixGraha, matrixPole,
     matrixBridgeTable, matrixChakraHistogram
   + мегатрансформер: transformThroughSpine(matrix, state)
   + selfTest: +10 проверок (78 всего)
   Всё advisory — данные-линзы, не рельсы. */

/* ── rev8 (Провод №2 + полнота матриц) ──
   + AGENTS_21: 21 агент-принцип (ядро Источника) — КОЛОНКИ сетки соответствий
     (n, principle, ray 1–7, guna-контур, graha, vastu, domain, core).
   + AGENT_RAYS: 7 лучей × 3 агента; хелперы agentInfo/agentsForRay/Guna/Graha/Vastu.
   + ПРИНЦИП ПОЛНОТЫ: каждая из 33 матриц выражает ВСЕ 21 принципа (полна,
     не привязана к одной чакре). chakra в MATRIX_BRIDGE — лишь АКЦЕНТ/вход.
     Полная сетка 21×33 = 693 (MATRIX_AGENTS) добавляется следующим шагом.
   + selfTest: +проверки агентов.
   Источник: lore/AWARA_Master_Codex_v1, Full_Production_Bible_All_Agents,
   docs/divine-office-21-agents.md. Всё advisory — компас, не рельсы. */
/* ── rev9 (Провод №3) ──
   + MATRIX_AGENTS_ORDER / MATRIX_AGENTS_GRID / MATRIX_AGENTS_NOTE: полная сетка
     21×33 = 693 (агент-принцип × матрица-интерфейс) + хелперы matrixAgent/
     matrixFullSpine/agentAcrossMatrices/matrixAgentsTable; +12 проверок сетки. */

/* ── rev10 (Провод №2 переосмыслен: чакра = АКЦЕНТ, не клетка) ──
   Сетка 693 доказала ПРИНЦИП ПОЛНОТЫ → честно переосмыслен MATRIX_BRIDGE:
   chakra/element/graha/guna теперь явно помечены как АКЦЕНТ (центр тяжести +
   входная дверь + адрес офиса), а НЕ единственный уровень матрицы. Полный
   позвоночник каждой матрицы живёт в MATRIX_AGENTS_GRID (matrixFullSpine).
   + MATRIX_BRIDGE_NOTE; matrixBridge() отдаёт accentChakra/accent/isComplete;
   + паттерн accent-not-cage; +проверки. Ключи и хелперы не тронуты (advisory). */
export const LIGHT_VERSION = 10;

/* ── ЕДИНЫЙ КРИТЕРИЙ: ОБЪЕКТИВНАЯ РЕАЛЬНОСТЬ ──
 * honesty = мера незамутнённости восприятия (близость к реальности).
 * НЕ путать с настроением: позитив/негатив одинаково иллюзорны.
 * У Мастера: Реальность / Атман / Исток = единственный критерий пути.
 */
export const REALITY_CRITERION = {
  id: 'objective-reality',
  ru: 'Объективная реальность',
  aka: ['Реальность', 'Атман', 'Исток'],
  note: 'Критерий пути — близость к реальности (дез-иллюзия), а не позитив/негатив. Страдание, боль, страх — иллюзорные пространства (морок). Честность = расколдовывание.',
};

/* ── ГУНЫ (сквозная ось на всех уровнях) ── */
export const GUNAS = [
  { id: 'tamas',  ru: 'Тамас',  hint: 'инерция, тьма, помрачение, покой' },
  { id: 'rajas',  ru: 'Раджас', hint: 'страсть, движение, действие' },
  { id: 'sattva', ru: 'Саттва', hint: 'ясность, гармония, свет' },
];
export const GUNA_IDS = GUNAS.map(g => g.id);

/* ── СТИХИИ (эфир открывается позже остальных) ──
 * У Мастера четыре стихии — следствие «Адхармы Творца»; Эфир — над ними.
 */
export const ELEMENTS = [
  { id: 'earth', ru: 'Земля',  unlockedFrom: 'soul.energetic' },
  { id: 'water', ru: 'Вода',   unlockedFrom: 'soul.energetic' },
  { id: 'fire',  ru: 'Огонь',  unlockedFrom: 'soul.energetic' },
  { id: 'air',   ru: 'Воздух', unlockedFrom: 'soul.energetic' },
  { id: 'ether', ru: 'Эфир',   unlockedFrom: 'ether', aboveAll: true },
];
export const ELEMENT_IDS = ELEMENTS.map(e => e.id);

/* ── КАНАЛЫ ВОСПРИЯТИЯ (input/output души) ──
 * ВНИМАНИЕ: схема «чувство → стихия» (танматры) — НАША рабочая гипотеза, её НЕТ
 * напрямую у Мастера. У Мастера прямая привязка стихий — это ТЕЛА (PRISON_BODIES).
 * Оставляем как удобный игровой слой ввода/вывода, помечая hypothesis: true.
 * 6-й, забытый канал — внутренний (манас/ум): чувство ума.
 */
export const SENSES = [
  { id: 'sight',   ru: 'Зрение',   tanmatra: 'рупа (форма)',     element: 'fire',  io: 'in/out', hypothesis: true },
  { id: 'taste',   ru: 'Вкус',     tanmatra: 'раса (вкус)',      element: 'water', io: 'in/out', hypothesis: true },
  { id: 'smell',   ru: 'Обоняние', tanmatra: 'гандха (запах)',   element: 'earth', io: 'in/out', hypothesis: true },
  { id: 'touch',   ru: 'Осязание', tanmatra: 'спарша (касание)', element: 'air',   io: 'in/out', hypothesis: true },
  { id: 'hearing', ru: 'Слух',     tanmatra: 'шабда (звук)',     element: 'ether', io: 'in/out', hypothesis: true },
];
export const SENSE_IDS = SENSES.map(s => s.id);
export const INNER_SENSE = { id: 'manas', ru: 'Ум (манас)', note: '6-й, внутренний канал восприятия' };
export const SENSES_NOTE = 'Схема чувство→стихия — гипотеза AWARA, не из Мастера. Каноничная привязка стихий у Мастера — на телах (PRISON_BODIES).';

/* ── ТЕЛА (4-е тело вырастает при прокачке эфирного пространства) ── */
export const BODIES = [
  { id: 'physical',  ru: 'Физическое тело',     plane: 'physical' },
  { id: 'psychic',   ru: 'Психическое тело',    plane: 'psychic' },
  { id: 'energetic', ru: 'Энергетическое тело', plane: 'energetic' },
  { id: 'etheric',   ru: 'Эфирное тело (4-е)',  plane: 'ether', growsFrom: 'ether' },
];
export const BODY_IDS = BODIES.map(b => b.id);

/* ── ТРИ ТЕЛА-ТЕМНИЦЫ (по Мастеру) ──
 * Джива заключена в три тела, каждое привязано к стихии. Когда три тела
 * сплавляются в единый поток — рождается Джива → чистый Эфир (переход
 * Душа → Джива). Это каноничная привязка «тело ↔ стихия» у Мастера.
 */
export const PRISON_BODIES = [
  { id: 'physical', ru: 'Физическое тело', element: 'earth',          plane: 'physical' },
  { id: 'etheric',  ru: 'Эфирное тело',    element: 'water',          plane: 'psychic' },
  { id: 'astral',   ru: 'Астральное тело', elements: ['fire', 'air'], plane: 'energetic' },
];
export const PRISON_BODY_IDS = PRISON_BODIES.map(b => b.id);
export const PRISON_NOTE = 'Сплавление трёх тел-темниц → единый поток Дживы → чистый Эфир (Душа → Джива).';

/* ════════════════════════════════════════════════════════════════════════
 *  ПОЗВОНОЧНИК: 9 МЕР ↔ 7 ЧАКР (ВХОД) ↔ 7 ПРИНЦИПОВ (БЛАВАТСКАЯ)
 * ════════════════════════════════════════════════════════════════════════
 *  9-мерность — своя вертикаль Мастера (три триады по три). 7-чакровость
 *  оставлена как СЛОЙ-ВХОД для тех, кто мыслит в 7 чакрах. Септенарная
 *  доктрина Блаватской (7 принципов человека) — третий мост того же
 *  позвоночника. Меры 1–7 несут чакры/принципы; меры 8–9 — Дух выше
 *  Сахасрары (вне 7-чакровой/септенарной системы).
 */

/* 7 принципов человека (Блаватская, по восхождению). chakra — соответствие
 * чакре; triad — триада 9-мерности. */
export const THEOSOPHY = [
  { n: 1, id: 'sthula',  ru: 'Стхула Шарира',  role: 'Физическое (грубое) тело',        chakra: 1, triad: 'lower' },
  { n: 2, id: 'linga',   ru: 'Линга Шарира',   role: 'Астральный/эфирный двойник',      chakra: 2, triad: 'lower' },
  { n: 3, id: 'prana',   ru: 'Прана',          role: 'Жизненный принцип',               chakra: 3, triad: 'lower' },
  { n: 4, id: 'kama',    ru: 'Кама-рупа',      role: 'Тело желаний и страстей',         chakra: 4, triad: 'middle' },
  { n: 5, id: 'manas',   ru: 'Манас',          role: 'Ум (низший ↔ высший)',            chakra: 5, triad: 'middle' },
  { n: 6, id: 'buddhi',  ru: 'Буддхи',         role: 'Духовная душа',                   chakra: 6, triad: 'middle' },
  { n: 7, id: 'atma',    ru: 'Атма',           role: 'Дух (луч Единого)',               chakra: 7, triad: 'upper' },
];
export const THEOSOPHY_IDS = THEOSOPHY.map(p => p.id);
export const THEOSOPHY_NOTE = 'Септенарная доктрина Блаватской: «видимая Вселенная есть только Стхула Шарира, грубое тело семеричного Космоса» (Тайная доктрина). Мост-вход для 7-частной структуры человека.';

/* 7 ЧАКР (слой-вход — НЕ вычёркивается) ──
 * Соответствуют мерам 1–7 и принципам Блаватской. Выше 7-й (Сахасрара) у
 * Мастера начинается Дух — там нет «8-мерной Искры», но мост продолжается
 * мерами 8–9 (см. DIMENSIONS).
 */
export const CHAKRAS = [
  { n: 1, ru: 'Муладхара',    mere: 1, theosophy: 'sthula', ra: 'red',    baileyPlane: 1, role: 'опора, выживание, род' },
  { n: 2, ru: 'Свадхистхана', mere: 2, theosophy: 'linga',  ra: 'orange', baileyPlane: 2, role: 'влечение, текучесть, эмоции' },
  { n: 3, ru: 'Манипура',     mere: 3, theosophy: 'prana',  ra: 'yellow', baileyPlane: 3, role: 'воля, сила, действие' },
  { n: 4, ru: 'Анахата',      mere: 4, theosophy: 'kama',   ra: 'green',  baileyPlane: 4, role: 'сердце; связь с Ра; зелёный луч — трамплин' },
  { n: 5, ru: 'Вишуддха',     mere: 5, theosophy: 'manas',  ra: 'blue',   baileyPlane: 5, role: 'выражение, слово, ум' },
  { n: 6, ru: 'Аджна',        mere: 6, theosophy: 'buddhi', ra: 'indigo', baileyPlane: 6, role: 'различение, видение' },
  { n: 7, ru: 'Сахасрара',    mere: 7, theosophy: 'atma',   ra: 'violet', baileyPlane: 7, role: 'венец; порог Духа' },
];
export const CHAKRA_NS = CHAKRAS.map(c => c.n);
export const CHAKRAS_NOTE = '7-чакровость — слой-вход для тех, кто мыслит в 7 чакрах. Не вычёркивается; мостится на 9 мер и септенарий. Выше Сахасрары начинается Дух (меры 8–9).';

/* 9 МЕР (новая вертикаль Мастера: три триады по три) ──
 * chakra/theosophy — мост к 7-частным системам (меры 1–7). Меры 8–9 — Дух
 * выше Сахасрары, вне 7-чакровой/септенарной системы (chakra: null).
 */
export const DIMENSIONS = [
  { n: 1, triad: 'lower',  group: 'Нижняя триада',        chakra: 1,    theosophy: 'sthula' },
  { n: 2, triad: 'lower',  group: 'Нижняя триада',        chakra: 2,    theosophy: 'linga' },
  { n: 3, triad: 'lower',  group: 'Нижняя триада',        chakra: 3,    theosophy: 'prana' },
  { n: 4, triad: 'middle', group: 'Средняя триада',       chakra: 4,    theosophy: 'kama' },
  { n: 5, triad: 'middle', group: 'Средняя триада',       chakra: 5,    theosophy: 'manas' },
  { n: 6, triad: 'middle', group: 'Средняя триада',       chakra: 6,    theosophy: 'buddhi' },
  { n: 7, triad: 'upper',  group: 'Высшая триада (дух)',  chakra: 7,    theosophy: 'atma' },
  { n: 8, triad: 'upper',  group: 'Высшая триада (дух)',  chakra: null, theosophy: null, beyond: 'Дух выше Сахасрары (вне 7-частной системы)' },
  { n: 9, triad: 'upper',  group: 'Высшая триада (дух)',  chakra: null, theosophy: null, beyond: 'Дух выше Сахасрары (вне 7-частной системы)' },
];
export const DIMENSION_TRIADS = ['lower', 'middle', 'upper'];
export const DIMENSIONS_NOTE = '9-мерность — новая вертикаль Мастера (3 триады по 3). Меры 1–7 мостятся на 7 чакр и 7 принципов Блаватской; меры 8–9 — Дух выше Сахасрары. «8 Монада / 9 Абсолют» из данных даймона — НЕ меры Мастера.';

/* ════════════════════════════════════════════════════════════════════════
 *  КРОСС-ТРАДИЦИИ (rev5): тот же позвоночник на языках Адвайты, Бейли и Ра
 * ════════════════════════════════════════════════════════════════════════ */

/* ── АДВАЙТА (advayta.org — Всемирная Община Санатана Дхармы / Викидхарма) ──
 * Адвайта = недвойственность. Единственная реальность — абсолютное Сознание
 * (Брахман). Атман (душа) неотделим от Брахмана; более того, Брахман и есть
 * Атман — только завеса майи мешает узнать это тождество. Прямо подкрепляет
 * REALITY_CRITERION: путь = дез-иллюзия = снятие майи, узнавание Атмана.
 */
export const ADVAYTA = {
  id: 'advaita',
  ru: 'Адвайта (недвойственность)',
  source: 'advayta.org — Всемирная Община Санатана Дхармы (Викидхарма)',
  thesis: 'Атман = Брахман; единственная реальность — Сознание (Брахман); майя — завеса, скрывающая тождество.',
  maxim: 'Брахман реален, мир нереален',
  practice: ['воззрение', 'созерцание', 'поведение'],
  link: 'REALITY_CRITERION (Атман / Реальность / Исток)',
  note: 'Совпадает с критерием пути: дез-иллюзия = снятие майи = узнавание Атмана как Брахмана.',
};

/* ── АЛИСА БЕЙЛИ: СЕМЬ ЛУЧЕЙ ──
 * 3 луча аспекта (мажорные) + 4 луча атрибута (минорные). Триплицизм
 * Монада/Душа/Личность = Воля / Любовь-Мудрость / Активный Разум.
 */
export const BAILEY_RAYS = [
  { n: 1, ru: 'Воля / Могущество',                        en: 'Will / Power',                 aspect: 'aspect' },
  { n: 2, ru: 'Любовь-Мудрость',                          en: 'Love-Wisdom',                  aspect: 'aspect' },
  { n: 3, ru: 'Активный (творческий) Разум',              en: 'Active Intelligence',          aspect: 'aspect' },
  { n: 4, ru: 'Гармония через конфликт (Красота/Искусство)', en: 'Harmony through Conflict',  aspect: 'attribute' },
  { n: 5, ru: 'Конкретное знание / Наука',                en: 'Concrete Knowledge / Science', aspect: 'attribute' },
  { n: 6, ru: 'Преданность / Идеализм',                   en: 'Devotion / Idealism',          aspect: 'attribute' },
  { n: 7, ru: 'Церемониальный Порядок / Магия',           en: 'Ceremonial Order / Magic',     aspect: 'attribute' },
];

/* 7 планов (по восхождению, физический → логоический). chakra — мост 1:1. */
export const BAILEY_PLANES = [
  { n: 1, ru: 'Физический план',                  en: 'Physical', chakra: 1 },
  { n: 2, ru: 'Астральный (эмоциональный) план',  en: 'Astral',   chakra: 2 },
  { n: 3, ru: 'Ментальный план',                  en: 'Mental',   chakra: 3 },
  { n: 4, ru: 'Буддхический (интуитивный) план',  en: 'Buddhic',  chakra: 4 },
  { n: 5, ru: 'Атмический (духовный) план',       en: 'Atmic',    chakra: 5 },
  { n: 6, ru: 'Монадический план',                en: 'Monadic',  chakra: 6 },
  { n: 7, ru: 'Логоический план (Ади)',           en: 'Logoic / Adi', chakra: 7 },
];

/* Конституция человека (троична) → три триады 9-мерности. */
export const BAILEY_CONSTITUTION = [
  { id: 'monad',       ru: 'Монада (чистый Дух, Отец)',   aspect: 'Воля',            triad: 'upper' },
  { id: 'soul',        ru: 'Душа / Эго (Сын, высшее Я)',  aspect: 'Любовь-Мудрость', triad: 'middle' },
  { id: 'personality', ru: 'Личность (ум/эмоции/тело)',   aspect: 'Активный Разум',  triad: 'lower' },
];
export const BAILEY_NOTE = 'Конституция троична: Монада → Душа → Личность (Воля / Любовь-Мудрость / Активный Разум). Совпадает с тремя триадами 9-мерности: личность=нижняя, душа=средняя, монада=высшая. 7 лучей = первая дифференциация триплицизма (из 3 мажорных раскрываются 4 минорных).';

/* ── МАТЕРИАЛЫ РА (Закон Одного) ──
 * 7 энергетических центров (лучей) красный→фиолетовый = 7 чакр 1:1.
 * Зелёный луч (сердце) — трамплин к разумной бесконечности.
 */
export const RA_RAYS = [
  { n: 1, color: 'red',    ru: 'Красный луч',     center: 'корневой',           chakra: 1, theme: 'выживание, базовая жизненность' },
  { n: 2, color: 'orange', ru: 'Оранжевый луч',   center: 'сакральный',         chakra: 2, theme: 'личностная сила, отношения один-на-один' },
  { n: 3, color: 'yellow', ru: 'Жёлтый луч',      center: 'солнечное сплетение', chakra: 3, theme: 'эго, группы; власть/манипуляция (блок)' },
  { n: 4, color: 'green',  ru: 'Зелёный луч',     center: 'сердечный',          chakra: 4, theme: 'безусловная любовь/сострадание; трамплин к бесконечности' },
  { n: 5, color: 'blue',   ru: 'Синий луч',       center: 'горловой',           chakra: 5, theme: 'свободное и честное выражение' },
  { n: 6, color: 'indigo', ru: 'Индиго луч',      center: 'межбровный',         chakra: 6, theme: 'работа сознания, контакт с разумной бесконечностью' },
  { n: 7, color: 'violet', ru: 'Фиолетовый луч',  center: 'венечный',           chakra: 7, theme: 'итоговая калибровка существа' },
];

/* 7 плотностей сознания. Мы — в 3-й (плотность Выбора). */
export const RA_DENSITIES = [
  { n: 1, color: 'red',    ru: '1-я плотность — Осознание',            theme: 'стихии учатся осознанию (минерал/вода/огонь/воздух)' },
  { n: 2, color: 'orange', ru: '2-я плотность — Рост',                 theme: 'растения и животные, движение к самоосознанию' },
  { n: 3, color: 'yellow', ru: '3-я плотность — Самоосознание / Выбор', theme: 'человек; Выбор: служение другим ↔ служение себе', current: true },
  { n: 4, color: 'green',  ru: '4-я плотность — Любовь / Понимание',    theme: 'сострадание, единство себе подобных' },
  { n: 5, color: 'blue',   ru: '5-я плотность — Мудрость / Свет',       theme: 'мудрость' },
  { n: 6, color: 'indigo', ru: '6-я плотность — Единство (Любовь/Свет)', theme: 'слияние любви и мудрости' },
  { n: 7, color: 'violet', ru: '7-я плотность — Врата',                 theme: 'возвращение к Единому Бесконечному Творцу (октава)' },
];
export const RA_NOTE = 'Закон Одного (материалы Ра): 7 плотностей сознания и 7 центров-лучей red→violet = 7 чакр 1:1. Мы в 3-й плотности (Выбор) — это ось LOCKS эгоцентризм→альтруизм. Зелёный луч (сердце) — трамплин к бесконечности (эхо RA/Анахата). Цель — возвращение к Единому (эхо Атман/Реальность).';

/* ── RA vs ЛОЖНОЕ СОЛНЦЕ (по Мастеру) ──
 * Ра — истинное внутреннее Солнце (в центре Земли), Изначалие/Водитель Гэба.
 * Внешнее Ярило — «обои»/декорация; внешние свет и тепло — концентрат
 * украденного Эфира. Связь с Ра — через сердце (Анахата).
 */
export const RA = {
  id: 'ra',
  ru: 'Ра — истинное Солнце внутри',
  link: 'сердце (Анахата)',
  note: 'Внутреннее Солнце в центре Земли. Внешнее Ярило — декорация; внешние свет/тепло — концентрат украденного Эфира.',
  falseSun: { id: 'yarilo', ru: 'Ярило (внешнее)', note: 'обои / декорация, не источник' },
};

/* ── ЧАТУРА-ЛОКА: ЯЙЦО ИЗ 4 СЛОЁВ (+ Славь / Тман / Атман) ──
 * Вселенная-Яйцо из 4 слоёв; мы — во 2-м. Цель — Выход (Эфирная Ладья).
 */
export const CHATURA_LOKA = {
  ru: 'Чатура-Лока (Яйцо из 4 слоёв)',
  weAreIn: 2,
  layers: [
    { n: 1, ru: 'Нижний слой', hint: 'война, болезни, «рост ради роста»' },
    { n: 2, ru: 'Второй слой', hint: 'наш мир (Майя — сон в сознании Творца)', current: true },
    { n: 3, ru: 'Внутренняя Земля', hint: 'без смерти и болезней, на Эфире' },
    { n: 4, ru: 'Четвёртый слой', hint: 'почти весь Эфир, у границы Слави' },
  ],
  above: { id: 'slav', ru: 'Славь', hint: 'мир-Лотос Света за пределами Яйца' },
  ground: { id: 'tman', ru: 'Тман', hint: 'Непроявленное тёмное пространство' },
  source: { id: 'atman', ru: 'Атман / Реальность', hint: 'Свет, Пространство, Вечность — критерий' },
  exit: { id: 'vyhod', ru: 'Выход', hint: 'выход из Яйца в Эфирной Ладье' },
};

/* ── ЗАСОВЫ ВРАТ ТЕМНИЦЫ + КЛЕТКИ (эгоцентризм → альтруизм) ──
 * Три засова + Код Матери удерживают Дживу. Ось роста:
 * Чёрная Клетка (брать, манипулировать) → Белая Клетка (давать, служить).
 * ДАВАТЬ, не БРАТЬ. Радость (Ка) выше любви. Карма всегда положительна.
 */
export const LOCKS = {
  ru: 'Засовы Врат Темницы',
  bolts: [
    { id: 'rod',   ru: 'Род' },
    { id: 'money', ru: 'Деньги' },
    { id: 'sex',   ru: 'Половое влечение' },
  ],
  motherCode: { id: 'mother-code', ru: 'Код Матери' },
  cells: {
    black: { id: 'black-cell', ru: 'Чёрная Клетка', hint: 'брать, манипулировать (эгоцентризм)' },
    white: { id: 'white-cell', ru: 'Белая Клетка', hint: 'давать, служить (альтруизм)' },
  },
  axis: 'эгоцентризм → альтруизм',
  motto: 'ДАВАТЬ, не БРАТЬ',
};

/* ── ЭФИР: спящий → пробуждённый ──
 * Эфир — спящая жизненная сила. ~98% эфиров спят. Пробуждение = пробуждение
 * спящего Эфира, затем Просветление/Инсайт. Питает Эфиром Изначалие/Аугоэйдос.
 */
export const EFIR = {
  id: 'efir',
  ru: 'Эфир',
  asleepShare: 0.98,
  states: [
    { id: 'asleep',   ru: 'Спящий Эфир' },
    { id: 'awakened', ru: 'Пробуждённый Эфир' },
  ],
  steps: ['Пробуждение', 'Просветление / Инсайт'],
  source: { id: 'iznachalie', ru: 'Изначалие / Аугоэйдос', note: 'питает Эфиром (не физическая генетика родителей)' },
};

/* ── ЛУЧ ВОСПРИЯТИЯ + СОБОР ──
 * На Луче Восприятия творец собирает Собор — до 15 Тонких Форм (Соборный
 * Игрок). Связан с лимитом форм Творца (STATUSES.creator.maxForms).
 */
export const PERCEPTION_RAY = {
  id: 'perception-ray',
  ru: 'Луч Восприятия',
  note: 'ось, вдоль которой собирается Собор Тонких Форм',
};
export const SOBOR = {
  id: 'sobor',
  ru: 'Собор',
  maxForms: 15,
  player: 'Соборный Игрок',
  note: 'до 15 Тонких Форм на Луче Восприятия',
};

/* ── СТАТУСЫ ДУХОВНОГО РОСТА (макро-вертикаль поверх пути) ──
 * Весь LEVELS-путь (ум..вселенная) — это арка статуса «Душа».
 * Дальше: Джива → Дух (бытовой → планетарный → единый) → Творец → Созидатель света.
 */
export const STATUSES = [
  { id: 'soul',          ru: 'Душа (Атман · искажение)',   dimHint: 'нижняя–средняя триада', hint: 'осквернённое сознание; иллюзии, представления, воображения; далёкость от реальности' },
  { id: 'jiva',          ru: 'Джива',                      dimHint: 'переход',              hint: 'сплавление трёх тел; серьёзное ремесло, служение; проведение духа' },
  { id: 'spirit.house',  ru: 'Бытовой дух',                dimHint: 'высшая триада',        hint: 'дух в быту, повседневное служение' },
  { id: 'spirit.planet', ru: 'Планетарный дух',            dimHint: 'высшая триада',        hint: 'служение планете, Логосу' },
  { id: 'spirit.unity',  ru: 'Единый дух (дух единого)',   dimHint: 'высшая триада',        hint: 'суперсложные системы; единство; Атман во всём' },
  { id: 'creator',       ru: 'Творец',                     dimHint: 'за пределами мер',     hint: 'до 15 духовных форм (Собор) наращивают объём души/Дживы', maxForms: 15 },
  { id: 'light.builder', ru: 'Созидатель света',           dimHint: 'за пределами мер',     hint: 'взаимодействие с другими творцами, мастерами, магами, космосами' },
];
export const STATUS_IDS = STATUSES.map(s => s.id);

/* ── ПУТЬ УРОВНЕЙ ──
 * reach = порог достижения уровня:
 *   awareness — сколько накоплено осознанности
 *   honesty   — какая близость к реальности нужна (true-gate, не сумма)
 * Пороги черновые, подбираются на игровых тестах.
 */
export const LEVELS = [
  { id: 'mind.distortions', ru: 'Ум · искажения и родовые травмы',                 group: 'mind',   reach: { awareness: 0,    honesty: 0.00 } },
  { id: 'mind.ego',         ru: 'Ум · личность и эго → альтруизм, сострадание',      group: 'mind',   reach: { awareness: 50,   honesty: 0.15 } },
  { id: 'soul.physical',    ru: 'Душа · физический план (тело, стихии внутри)',      group: 'soul',   plane: 'physical',  reach: { awareness: 150,  honesty: 0.25 } },
  { id: 'soul.psychic',     ru: 'Душа · психический план (эмоции, люди, страсти)',   group: 'soul',   plane: 'psychic',   reach: { awareness: 350,  honesty: 0.40 } },
  { id: 'soul.energetic',   ru: 'Душа · энергетический план (пространство/время, стихии)', group: 'soul', plane: 'energetic', reach: { awareness: 650, honesty: 0.55 } },
  { id: 'ether',            ru: 'Эфир · видеть глубже, распределять стихии',         group: 'ether',  opensEther: true,   reach: { awareness: 1000, honesty: 0.65 } },
  { id: 'earth.player',     ru: 'Земля игрока · пространство строительства (внутр.→внеш. храм)', group: 'build', reach: { awareness: 1600, honesty: 0.72 } },
  { id: 'cosmos',           ru: 'Космос игрока',                                     group: 'cosmos', reach: { awareness: 3000, honesty: 0.80 } },
  { id: 'universe',         ru: 'Мироздание + большие карты',                        group: 'universe', reach: { awareness: 6000, honesty: 0.88 } },
];
export const LEVEL_IDS = LEVELS.map(l => l.id);

export function levelIndexById(id) {
  return LEVEL_IDS.indexOf(id);
}

/* ── ПРОГРЕСС ── */
export function emptyProgress() {
  return { awareness: 0, honesty: 0 };
}

function normProgress(progress) {
  const p = progress || {};
  const awareness = Number.isFinite(+p.awareness) ? +p.awareness : 0;
  let honesty = Number.isFinite(+p.honesty) ? +p.honesty : 0;
  if (honesty < 0) honesty = 0;
  if (honesty > 1) honesty = 1;
  return { awareness, honesty };
}

/**
 * Текущий уровень пути = последний, чьи ОБА порога (awareness И honesty)
 * достигнуты. honesty работает как настоящий замок: без близости к реальности
 * осознанность одна не пускает дальше.
 */
export function currentLevel(progress) {
  const p = normProgress(progress);
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const r = LEVELS[i].reach;
    if (p.awareness >= r.awareness && p.honesty >= r.honesty) idx = i;
    else break; // путь линеен — первый недостигнутый уровень останавливает
  }
  const level = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  return {
    index: idx,
    id: level.id,
    ru: level.ru,
    group: level.group,
    plane: level.plane || null,
    next: next ? {
      id: next.id,
      ru: next.ru,
      needAwareness: Math.max(0, next.reach.awareness - p.awareness),
      needHonesty: Math.max(0, +(next.reach.honesty - p.honesty).toFixed(3)),
    } : null,
  };
}

/** Открыта ли стихия при данном прогрессе. */
export function elementUnlocked(elementId, progress) {
  const el = ELEMENTS.find(e => e.id === elementId);
  if (!el) return false;
  const li = currentLevel(progress).index;
  return li >= levelIndexById(el.unlockedFrom);
}

/** Стихия канала восприятия (гипотеза AWARA, не из Мастера). */
export function senseElement(senseId) {
  const s = SENSES.find(x => x.id === senseId);
  return s ? s.element : null;
}

/** Каноничная привязка стихии к телу-темнице (по Мастеру). */
export function bodyElement(bodyId) {
  const b = PRISON_BODIES.find(x => x.id === bodyId);
  if (!b) return null;
  return b.elements ? b.elements.slice() : b.element;
}

/** Информация о мере (1..9). */
export function dimensionInfo(n) {
  return DIMENSIONS.find(d => d.n === n) || null;
}

/** Информация о чакре (1..7). */
export function chakraInfo(n) {
  return CHAKRAS.find(c => c.n === n) || null;
}

/** Принцип Блаватской по id. */
export function theosophyInfo(id) {
  return THEOSOPHY.find(p => p.id === id) || null;
}

/* ── МОСТ: 7 чакр ↔ 9 мер ↔ 7 принципов ── */

/** Мера, на которую ложится чакра n (1..7). */
export function chakraToDimension(n) {
  return DIMENSIONS.find(d => d.chakra === n) || null;
}

/** Чакра, соответствующая мере n (или null для мер 8–9 — Дух). */
export function dimensionToChakra(n) {
  const d = dimensionInfo(n);
  return d ? (d.chakra || null) : null;
}

/** Принцип Блаватской, соответствующий чакре n. */
export function theosophyForChakra(n) {
  const c = chakraInfo(n);
  return c ? theosophyInfo(c.theosophy) : null;
}

/** Энерго-центр Ра (луч-цвет) для чакры n. */
export function raForChakra(n) {
  return RA_RAYS.find(r => r.chakra === n) || null;
}

/** Плотность Ра по номеру (1..7). */
export function densityInfo(n) {
  return RA_DENSITIES.find(d => d.n === n) || null;
}

/** План Бейли для чакры n. */
export function baileyPlaneForChakra(n) {
  return BAILEY_PLANES.find(p => p.chakra === n) || null;
}

/** Луч Бейли по номеру (1..7). */
export function baileyRayInfo(n) {
  return BAILEY_RAYS.find(r => r.n === n) || null;
}

/** Полная строка моста для меры n: чакра, принцип, луч Ра, план Бейли. */
export function bridgeRow(n) {
  const d = dimensionInfo(n);
  if (!d) return null;
  return {
    mere: d.n,
    triad: d.triad,
    chakra: d.chakra ? chakraInfo(d.chakra) : null,
    theosophy: d.theosophy ? theosophyInfo(d.theosophy) : null,
    ra: d.chakra ? raForChakra(d.chakra) : null,
    baileyPlane: d.chakra ? baileyPlaneForChakra(d.chakra) : null,
    beyond: d.beyond || null,
  };
}

/** Вся таблица моста (9 строк). */
export function bridgeTable() {
  return DIMENSIONS.map(d => bridgeRow(d.n));
}

/** Выросло ли тело при данном прогрессе (4-е, эфирное — с уровня «Эфир»). */
export function bodyGrown(bodyId, progress) {
  const b = BODIES.find(x => x.id === bodyId);
  if (!b) return false;
  if (!b.growsFrom) return true;
  return currentLevel(progress).index >= levelIndexById(b.growsFrom);
}

/* ── ЗОНЫ ЯЙЦА-ХАБА ──
 * always — открыта всегда (вход в петлю)
 * stages — раскрытие по индексу достигнутого уровня пути (atLevel)
 */
export const ZONES = {
  tigel: { ru: 'Тигель',            pos: 'center', always: true },
  soul:  { ru: 'Пространство души', pos: 'left',   always: true },

  matrices: { ru: 'Матрицы', pos: 'right', stages: [
    { s: 'few',  atLevel: 0, label: 'Несколько матриц' },
    { s: 'more', atLevel: 2, label: 'Больше матриц' },
    { s: 'full', atLevel: 5, label: 'Все матрицы + анимация/прокачка' },
  ] },

  daimon: { ru: 'Даймон', pos: 'bottom', stages: [
    { s: 'basic',       atLevel: 0, label: 'Базовый спутник' },
    { s: 'dialogue',    atLevel: 1, label: 'Глубже диалог' },
    { s: 'deeper',      atLevel: 3, label: 'Честнее, умнее, открытее' },
    { s: 'generations', atLevel: 6, label: 'Генерации фото/видео/аудио' },
  ] },

  cards: { ru: 'Карты (настольная)', pos: 'top', stages: [
    { s: 'intro',   atLevel: 0, label: 'Простые карты' },
    { s: 'partial', atLevel: 2, label: 'Сложнее, часть колоды' },
    { s: 'full',    atLevel: 7, label: 'Полная колода' },
  ] },

  temple: { ru: 'Земля / Храм', pos: 'ground', stages: [
    { s: 'locked', atLevel: 0, label: 'Закрыто' },
    { s: 'inner',  atLevel: 6, label: 'Внутренний храм' },
    { s: 'outer',  atLevel: 8, label: 'Внешний храм' },
  ] },

  cosmos: { ru: 'Космос', pos: 'up-up', stages: [
    { s: 'frozen',     atLevel: 0, label: 'Заморожен' },
    { s: 'silhouette', atLevel: 5, label: 'Силуэт сквозь лёд' },
    { s: 'partial',    atLevel: 7, label: 'Частично оживает' },
    { s: 'alive',      atLevel: 8, label: 'Живой космос' },
  ] },

  universe: { ru: 'Вселенная / Мироздание', pos: 'top-top', stages: [
    { s: 'frozen',  atLevel: 0, label: 'Заморожена' },
    { s: 'opening', atLevel: 8, label: 'Приоткрывается' },
  ] },
};
export const ZONE_IDS = Object.keys(ZONES);

/**
 * Состояние одной зоны хаба при данном прогрессе.
 * Раскрытие зависит от достигнутого уровня пути (а путь — от осознанности + реальности).
 */
export function zoneState(zoneId, progress) {
  const z = ZONES[zoneId];
  if (!z) throw new Error('light-core: неизвестная зона "' + zoneId + '"');

  if (z.always) {
    return { zone: zoneId, label: z.ru, state: 'open', stageIndex: 0, levelIndex: null, next: null };
  }

  const li = currentLevel(progress).index;
  const stages = z.stages;
  let idx = 0;
  for (let i = 0; i < stages.length; i++) {
    if (li >= stages[i].atLevel) idx = i;
  }
  const cur = stages[idx];
  const nx = stages[idx + 1] || null;

  return {
    zone: zoneId,
    label: z.ru,
    state: cur.s,
    stateLabel: cur.label,
    stageIndex: idx,
    levelIndex: li,
    next: nx ? { state: nx.s, atLevel: nx.atLevel, levelsAway: Math.max(0, nx.atLevel - li) } : null,
  };
}

export function allZoneStates(progress) {
  const out = {};
  for (const id of ZONE_IDS) out[id] = zoneState(id, progress);
  return out;
}

/* ── СВЯЗКИ: что синхронно растёт с уровнем пути ── */
export function couplings(progress) {
  const li = currentLevel(progress).index;
  const max = LEVELS.length - 1;
  return {
    levelIndex: li,
    daimon: zoneState('daimon', progress).state,
    cards: zoneState('cards', progress).state,
    etherOpen: elementUnlocked('ether', progress),
    ethericBody: bodyGrown('etheric', progress),
    awarenessCapacity: Math.round(100 * Math.pow(2, li)),
    progress01: max ? +(li / max).toFixed(3) : 0,
  };
}

/* ════════════════════════════════════════════════════════════════════════
 *  СУПЕР МЕГА СИСТЕМА (rev6): ВСЕ ТРАДИЦИИ — ОДНА КАРТА (палитра дверей)
 * ════════════════════════════════════════════════════════════════════════
 *  Всё ниже — advisory ДАННЫЕ (двери палитры), а не рельсы. Параллельные
 *  языки того же позвоночника 7 чакр / 9 мер. Соответствия приблизительны
 *  (символическая карта-синтез), но дают рабочую единую ось восхождения.
 */
export const MEGA_NOTE = 'СУПЕР МЕГА СИСТЕМА: все традиции — разные карты одного восхождения сознания. Адвайта — онтология (что есть), 7 чакр/9 мер — энергетика (как устроено), дхьяны/бхуми — психология (что переживается), 7 лучей — космология (из чего), Джйотиш — кармический контекст (когда/через что), Васту — пространственный резонанс (где). Двери — палитра, не коридор.';

/* ── 5 КОШ (оболочки Атмана, грубая → тонкая) ── */
export const KOSHAS = [
  { n: 1, id: 'annamaya',    ru: 'Аннамайя (пищевая/физическая)',   chakra: 1, body: 'physical' },
  { n: 2, id: 'pranamaya',   ru: 'Пранамайя (праническая/эфирная)', chakra: 2, body: 'etheric' },
  { n: 3, id: 'manomaya',    ru: 'Маномайя (ментально-эмоц.)',      chakra: 3, body: 'astral' },
  { n: 4, id: 'vijnanamaya', ru: 'Виджнянамайя (мудрость/буддхи)',  chakra: 6, body: 'causal' },
  { n: 5, id: 'anandamaya',  ru: 'Анандамайя (блаженство)',         chakra: 7, body: 'causal' },
];
export const KOSHA_IDS = KOSHAS.map(k => k.id);

/* ── 36 ТАТТВ (кашмирский шиваизм/санкхья) по 8 уровням нисхождения ── */
export const TATTVAS = { count: 36, note: 'Парамашива (вне таттв) → Шива/Шакти → ... → 5 махабхут. Инволюция Духа в материю.' };
export const TATTVA_LEVELS = [
  { id: 'absolute',  ru: 'Абсолют — Парамашива (вне таттв)',        tattvas: '—',     chakra: null, kosha: null },
  { id: 'spiritual', ru: 'Духовное — Шива→Шакти',                   tattvas: '1–2',   chakra: 7,    kosha: 'anandamaya' },
  { id: 'causal',    ru: 'Причинное — Садашива→Ишвара',             tattvas: '3–4',   chakra: 7,    kosha: 'anandamaya' },
  { id: 'maya',      ru: 'Майя — Шуддхавидья+майя+канчуки',         tattvas: '5–11',  chakra: 6,    kosha: 'vijnanamaya' },
  { id: 'mental',    ru: 'Ментальное — Пракрити→Буддхи→Ахамкара',   tattvas: '12–15', chakra: 4,    kosha: 'manomaya' },
  { id: 'astral',    ru: 'Астральное — манас+джняна-индрии',        tattvas: '16–21', chakra: 3,    kosha: 'manomaya' },
  { id: 'etheric',   ru: 'Эфирное — карма-индрии+танматры',         tattvas: '22–31', chakra: 2,    kosha: 'pranamaya' },
  { id: 'physical',  ru: 'Физическое — 5 махабхут',                 tattvas: '32–36', chakra: 1,    kosha: 'annamaya' },
];

/* ── 10 БХУМИ (ступени бодхисаттвы, махаяна) ── */
export const BHUMIS = [
  { n: 1,  id: 'pramudita',   ru: 'Прамудита — Великая Радость',         paramita: 'дана',       chakra: 1, mere: 1 },
  { n: 2,  id: 'vimala',      ru: 'Вимала — Незапятнанная',              paramita: 'шила',       chakra: 2, mere: 2 },
  { n: 3,  id: 'prabhakari',  ru: 'Прабхакари — Светоносная',            paramita: 'кшанти',     chakra: 3, mere: 3 },
  { n: 4,  id: 'archishmati', ru: 'Арчишмати — Сияющий Интеллект',       paramita: 'вирья',      chakra: 3, mere: 3 },
  { n: 5,  id: 'sudurjaya',   ru: 'Судурджая — Труднопреодолимая',       paramita: 'дхьяна',     chakra: 4, mere: 4 },
  { n: 6,  id: 'abhimukhi',   ru: 'Абхимукхи — Лицом к Лицу',            paramita: 'праджня',    chakra: 5, mere: 5 },
  { n: 7,  id: 'durangama',   ru: 'Дурангама — Далеко Идущая',           paramita: 'упая',       chakra: 5, mere: 6 },
  { n: 8,  id: 'achala',      ru: 'Ачала — Непоколебимая',               paramita: 'пранидхана', chakra: 6, mere: 7 },
  { n: 9,  id: 'sadhumati',   ru: 'Садхумати — Превосходный Интеллект',  paramita: 'бала',       chakra: 6, mere: 8 },
  { n: 10, id: 'dharmamegha', ru: 'Дхармамегха — Облако Дхармы',         paramita: 'джняна',     chakra: 7, mere: 9 },
];

/* ── 8 ДХЬЯН (медитативные состояния) ── */
export const DHYANAS = [
  { n: 1, ru: '1-я рупа — радость+витакка+вичара',           kind: 'rupa',  chakra: 4,    mere: 4 },
  { n: 2, ru: '2-я рупа — покой без мышления',               kind: 'rupa',  chakra: 5,    mere: 5 },
  { n: 3, ru: '3-я рупа — невозмутимость (упекха)',          kind: 'rupa',  chakra: 6,    mere: 6 },
  { n: 4, ru: '4-я рупа — чистое равновесие',                kind: 'rupa',  chakra: 7,    mere: 7 },
  { n: 5, ru: '5-я арупа — Бесконечное Пространство',        kind: 'arupa', chakra: null, mere: 8 },
  { n: 6, ru: '6-я арупа — Бесконечное Сознание',            kind: 'arupa', chakra: null, mere: 8 },
  { n: 7, ru: '7-я арупа — Ничто',                           kind: 'arupa', chakra: null, mere: 9 },
  { n: 8, ru: '8-я арупа — Ни восприятие, ни невосприятие',  kind: 'arupa', chakra: null, mere: 9 },
];

/* ── ДЖЙОТИШ: 9 ГРАХА (планеты-силы) ── */
export const JYOTISH = [
  { id: 'surya',      ru: 'Сурья (Солнце)',      chakra: 3, quality: 'Атман, воля, лидерство' },
  { id: 'chandra',    ru: 'Чандра (Луна)',       chakra: 2, quality: 'манас, эмоции, память' },
  { id: 'mangala',    ru: 'Мангала (Марс)',      chakra: 1, quality: 'сила, действие, карма-индрии' },
  { id: 'budha',      ru: 'Будха (Меркурий)',    chakra: 5, quality: 'интеллект, речь' },
  { id: 'brihaspati', ru: 'Брихаспати (Юпитер)', chakra: 7, quality: 'мудрость, расширение, джняна' },
  { id: 'shukra',     ru: 'Шукра (Венера)',      chakra: 4, quality: 'любовь, красота, бхакти' },
  { id: 'shani',      ru: 'Шани (Сатурн)',       chakra: 6, quality: 'карма, дисциплина, ограничение' },
  { id: 'rahu',       ru: 'Раху (Сев. узел)',    chakra: 6, quality: 'иллюзия, майя, будущая карма' },
  { id: 'ketu',       ru: 'Кету (Юж. узел)',     chakra: 7, quality: 'освобождение, мокша, прошлая карма' },
];

/* ── ВАСТУ: 9 сторон (внешняя проекция внутренней карты) ── */
export const VASTU = [
  { dir: 'E',  ru: 'Восток',              element: 'air',   graha: 'surya',      chakra: 6 },
  { dir: 'NE', ru: 'Северо-Восток',       element: 'water', graha: 'brihaspati', chakra: 7 },
  { dir: 'N',  ru: 'Север',               element: 'water', graha: 'budha',      chakra: 2 },
  { dir: 'NW', ru: 'Северо-Запад',        element: 'air',   graha: 'chandra',    chakra: 4 },
  { dir: 'W',  ru: 'Запад',               element: 'air',   graha: 'shani',      chakra: 5 },
  { dir: 'SW', ru: 'Юго-Запад',           element: 'earth', graha: 'rahu',       chakra: 1 },
  { dir: 'S',  ru: 'Юг',                  element: 'fire',  graha: 'mangala',    chakra: 3 },
  { dir: 'SE', ru: 'Юго-Восток',          element: 'fire',  graha: 'shukra',     chakra: 3 },
  { dir: 'C',  ru: 'Центр (Брахмастхан)', element: 'ether', graha: null,         chakra: 7 },
];

/* ── ДАО: 3 даньтяня + 3 сокровища (нэйдань) ── */
export const DAO = {
  dantians: [
    { id: 'lower',  ru: 'Нижний даньтянь',  treasure: 'jing', chakras: [1, 2, 3], rodniki: ['istok', 'zarod', 'zhivot'] },
    { id: 'middle', ru: 'Средний даньтянь', treasure: 'qi',   chakras: [4],       rodniki: ['lada', 'lelya'] },
    { id: 'upper',  ru: 'Верхний даньтянь', treasure: 'shen', chakras: [6, 7],    rodniki: ['chelo', 'rodnik'] },
  ],
  treasures: [
    { id: 'jing', ru: 'Цзин (семя-эссенция) — тело/жизненная сила' },
    { id: 'qi',   ru: 'Ци (энергия) — дыхание/эмоции/душа' },
    { id: 'shen', ru: 'Шэнь (дух) — сознание/интуиция' },
  ],
  alchemy: ['Цзин', 'Ци', 'Шэнь', 'Сюй (возврат в Дао)'],
  note: 'Нэйдань: Цзин→Ци→Шэнь→Сюй. Подъём в верхний даньтянь = «Золотой Цветок» = эхо Кундалини к Сахасраре.',
};

/* ── СЛАВЯНСКАЯ СИСТЕМА: 9 РОДНИКОВ (по Русскому Мастеру) ──
 * Почти 1:1 с 9-мерностью Мастера — сильнейший параллельный мост. */
export const SLAVIC_RODNIKI = [
  { n: 1, id: 'istok',  ru: 'Исток',  mere: 1, chakra: 1, mir: 'Навь',  color: 'чёрный' },
  { n: 2, id: 'zarod',  ru: 'Зарод',  mere: 2, chakra: 2, mir: 'Явь',   color: 'красный' },
  { n: 3, id: 'zhivot', ru: 'Живот',  mere: 3, chakra: 3, mir: 'Явь',   color: 'алый' },
  { n: 4, id: 'persi',  ru: 'Перси',  mere: 4, chakra: 4, mir: 'Явь',   color: 'златый' },
  { n: 5, id: 'lada',   ru: 'Лада',   mere: 5, chakra: 4, mir: 'Славь', color: 'зелёный' },
  { n: 6, id: 'lelya',  ru: 'Леля',   mere: 6, chakra: 5, mir: 'Славь', color: 'небесный' },
  { n: 7, id: 'ustye',  ru: 'Устье',  mere: 7, chakra: 5, mir: 'Славь', color: 'синий' },
  { n: 8, id: 'chelo',  ru: 'Чело',   mere: 8, chakra: 6, mir: 'Правь',  color: 'фиолетовый' },
  { n: 9, id: 'rodnik', ru: 'Родник', mere: 9, chakra: 7, mir: 'Правь',  color: 'серебристый' },
];

/* ── КАББАЛА: 10 сефирот + 4 мира + 3 столпа (западная параллель) ── */
export const KABBALAH = {
  sefirot: [
    { n: 1,  id: 'keter',   ru: 'Кетер — Корона/Воля',       pillar: 'middle', chakra: 7 },
    { n: 2,  id: 'hokhmah', ru: 'Хохма — Мудрость',          pillar: 'right',  chakra: 6 },
    { n: 3,  id: 'binah',   ru: 'Бина — Понимание',          pillar: 'left',   chakra: 6 },
    { n: 4,  id: 'hesed',   ru: 'Хесед — Милосердие',        pillar: 'right',  chakra: 4 },
    { n: 5,  id: 'gevurah', ru: 'Гвура — Сила/Суд',          pillar: 'left',   chakra: 4 },
    { n: 6,  id: 'tiferet', ru: 'Тиферет — Красота/Сердце',  pillar: 'middle', chakra: 4 },
    { n: 7,  id: 'netzach', ru: 'Нецах — Победа',            pillar: 'right',  chakra: 3 },
    { n: 8,  id: 'hod',     ru: 'Ход — Слава',               pillar: 'left',   chakra: 3 },
    { n: 9,  id: 'yesod',   ru: 'Йесод — Основание',         pillar: 'middle', chakra: 2 },
    { n: 10, id: 'malkhut', ru: 'Малхут — Царство',          pillar: 'middle', chakra: 1 },
  ],
  hidden: { id: 'daat', ru: 'Даат — Знание (скрытая)', chakra: 5 },
  worlds: [
    { id: 'atzilut',  ru: 'Ацилут (Эманация)',     kosha: 'anandamaya' },
    { id: 'beriah',   ru: 'Брия (Творение)',       kosha: 'vijnanamaya' },
    { id: 'yetzirah', ru: 'Йецира (Формирование)', kosha: 'manomaya' },
    { id: 'asiah',    ru: 'Асия (Действие)',       kosha: 'annamaya' },
  ],
  pillars: {
    right:  { ru: 'Милость',     channel: 'pingala (Ян / Лада)' },
    left:   { ru: 'Строгость',   channel: 'ida (Инь / Леля)' },
    middle: { ru: 'Равновесие',  channel: 'sushumna (восхождение Кундалини)' },
  },
};

/* ── 5 КЛЕШ (корни страдания) + 4 ПУРУШАРТХИ (цели жизни) ── */
export const KLESHAS = [
  { id: 'avidya',      ru: 'Авидья — неведение' },
  { id: 'asmita',      ru: 'Асмита — эгоизм' },
  { id: 'raga',        ru: 'Рага — влечение' },
  { id: 'dvesha',      ru: 'Двеша — отвращение' },
  { id: 'abhinivesha', ru: 'Абхинивеша — страх смерти' },
];
export const PURUSHARTHAS = [
  { id: 'dharma', ru: 'Дхарма — долг/закон' },
  { id: 'artha',  ru: 'Артха — ресурсы/средства' },
  { id: 'kama',   ru: 'Кама — желание/удовольствие' },
  { id: 'moksha', ru: 'Мокша — освобождение' },
];

/* ── 14 ЛОК (вертикальная карта миров) ── */
export const LOKAS = {
  upper: [
    { n: 1, id: 'bhur',   ru: 'Бхур-лока (Земля)',       chakra: 1 },
    { n: 2, id: 'bhuvar', ru: 'Бхувар-лока (астрал)',    chakra: 2 },
    { n: 3, id: 'svar',   ru: 'Свар-лока (Сварга/рай)',  chakra: 3 },
    { n: 4, id: 'mahar',  ru: 'Махар-лока',              chakra: 4 },
    { n: 5, id: 'jana',   ru: 'Джана-лока',              chakra: 5 },
    { n: 6, id: 'tapa',   ru: 'Тапа-лока',               chakra: 6 },
    { n: 7, id: 'satya',  ru: 'Сатья-лока (Брахмалока)', chakra: 7 },
  ],
  lower: [
    { n: 1, id: 'atala',    ru: 'Атала',             passion: 'страх/вожделение' },
    { n: 2, id: 'vitala',   ru: 'Витала',            passion: 'гнев/ярость' },
    { n: 3, id: 'sutala',   ru: 'Сутала',            passion: 'зависть/ревность' },
    { n: 4, id: 'talatala', ru: 'Талатала',          passion: 'иллюзия/инстинкт' },
    { n: 5, id: 'mahatala', ru: 'Махатала',          passion: 'бессовестность' },
    { n: 6, id: 'rasatala', ru: 'Расатала',          passion: 'чистый эгоизм' },
    { n: 7, id: 'patala',   ru: 'Патала (Нагалока)', passion: 'злоба/тьма' },
  ],
  note: '7 высших лок = 7 чакр (восходящая ось). 7 патал — подсознательное/демоническое ниже Муладхары. Куда внимание — в том мире пребываешь.',
};

/* ── ЭВОЛЮЦИЯ СОЗНАНИЯ: от камня до Парамашивы ── */
export const KINGDOMS = [
  { id: 'elemental',   ru: 'Элементальные царства',                  state: 'инволюция',            chakra: null },
  { id: 'mineral',     ru: 'Минеральное (камень)',                   state: 'спит',                 chakra: 1 },
  { id: 'plant',       ru: 'Растительное',                           state: 'дремлет',             chakra: 2 },
  { id: 'animal',      ru: 'Животное',                               state: 'пробуждение чувств',  chakra: 3 },
  { id: 'human',       ru: 'Человеческое',                           state: 'самосознание',        chakra: 4 },
  { id: 'superhuman',  ru: 'Сверхчеловеческое (Душа, 5-е царство)',  state: 'космическое сознание', chakra: 6 },
  { id: 'monadic',     ru: 'Духовное / Монадическое',                state: 'Я = Дух',              chakra: 7 },
  { id: 'paramashiva', ru: 'Парамашива / Параматма',                 state: 'за пределами всего',   chakra: null },
];

/* ── ASCENT: ЕДИНАЯ ОСЬ ВОСХОЖДЕНИЯ (9 ступеней, синтез всех дверей) ── */
export const ASCENT = [
  { step: 1, mere: 1, chakra: 1,    rodnik: 'istok',  dantian: 'lower',  element: 'earth', loka: 'bhur',   kosha: 'annamaya',    source: null },
  { step: 2, mere: 2, chakra: 2,    rodnik: 'zarod',  dantian: 'lower',  element: 'water', loka: 'bhuvar', kosha: 'pranamaya',   source: null },
  { step: 3, mere: 3, chakra: 3,    rodnik: 'zhivot', dantian: 'lower',  element: 'fire',  loka: 'svar',   kosha: 'pranamaya',   source: null },
  { step: 4, mere: 4, chakra: 4,    rodnik: 'lada',   dantian: 'middle', element: 'air',   loka: 'mahar',  kosha: 'manomaya',    source: null },
  { step: 5, mere: 5, chakra: 5,    rodnik: 'lelya',  dantian: 'middle', element: 'ether', loka: 'jana',   kosha: 'vijnanamaya', source: null },
  { step: 6, mere: 6, chakra: 6,    rodnik: 'chelo',  dantian: 'upper',  element: 'light', loka: 'tapa',   kosha: 'vijnanamaya', source: null },
  { step: 7, mere: 7, chakra: 7,    rodnik: 'rodnik', dantian: 'upper',  element: null,    loka: 'satya',  kosha: 'anandamaya',  source: null },
  { step: 8, mere: 8, chakra: null, rodnik: null,     dantian: null,     element: null,    loka: null,     kosha: null,          source: 'Сюй (пустота Дао) / мир Прави — за пределами кош' },
  { step: 9, mere: 9, chakra: null, rodnik: null,     dantian: null,     element: null,    loka: null,     kosha: null,          source: 'Дао / Исток-Абсолют — Атман = Брахман' },
];

/* ── GAME_OF_ASCENT: игровой слой-наложение (advisory) ── */
export const GAME_OF_ASCENT = {
  note: 'Жизнь как RPG пробуждения. Персонаж — Душа (Джива/Атман). Карта — 9 миров. Эндгейм = Пробуждение (выход в лилу), не смерть. Это карта, не принуждение.',
  stats: [
    { id: 'oz',        ru: 'ОЗ / Цзин — тело, жизненная сила', train: 'сон, питание, цигун, движение' },
    { id: 'qi',        ru: 'Ци / Прана — энергия, дыхание',    train: 'пранаяма, чистка эмоций' },
    { id: 'shen',      ru: 'Шэнь / Дух — сознание, ум',        train: 'медитация, концентрация' },
    { id: 'de',        ru: 'Дэ / Карма — баланс поступков',    train: 'добро, у-вэй, честность' },
    { id: 'awareness', ru: 'Осознанность (XP)',                train: 'самонаблюдение 24/7', maps: 'awareness' },
  ],
  bosses: [
    { lvl: 1, chakra: 1,    boss: 'Страх выживания',             reward: 'Заземление, устойчивость' },
    { lvl: 2, chakra: 2,    boss: 'Похоть, зависимости',         reward: 'Творческая текучесть' },
    { lvl: 3, chakra: 3,    boss: 'Гнев, эго (Ахамкара)',        reward: 'Воля, личная сила' },
    { lvl: 4, chakra: 4,    boss: 'Обида, скорбь',               reward: 'Безусловная любовь, исцеление' },
    { lvl: 5, chakra: 5,    boss: 'Ложь, страх голоса',          reward: 'Истинная речь, творчество' },
    { lvl: 6, chakra: 6,    boss: 'Иллюзия (майя), гордыня ума', reward: 'Ясновидение, различение' },
    { lvl: 7, chakra: 7,    boss: 'Привязанность к «я»',         reward: 'Единство, самадхи' },
    { lvl: 8, chakra: null, boss: 'Тонкая гордыня сиддх',        reward: 'Служение, синтез лучей' },
    { lvl: 9, chakra: null, boss: 'Последний покров (авидья)',   reward: 'Мокша / бессмертие Дао' },
  ],
  dailyQuests: [
    { when: 'Утро',  quest: 'дыхание + солнце + заземление', effect: '+Цзин, +Ци' },
    { when: 'День',  quest: 'у-вэй, честные поступки',       effect: '+Дэ, баланс кармы' },
    { when: 'Вечер', quest: 'медитация на Чело/Родник',      effect: '+Шэнь, +XP' },
    { when: '24/7',  quest: 'свидетельствование «Кто я?»',   effect: 'прокачка Атмана' },
  ],
  winCondition: 'Слияние трёх Сокровищ (Цзин→Ци→Шэнь→Сюй) = подъём Кундалини в Сахасрару = растворение в Дао = Парамашива. Игра завершается Пробуждением, не смертью.',
};

/* ── ХЕЛПЕРЫ ПАЛИТРЫ (rev6) ── */
export function koshaForChakra(n) { return KOSHAS.find(k => k.chakra === n) || null; }
export function bhumiForChakra(n) { return BHUMIS.filter(b => b.chakra === n); }
export function bhumiInfo(n) { return BHUMIS.find(b => b.n === n) || null; }
export function jyotishForChakra(n) { return JYOTISH.filter(g => g.chakra === n); }
export function rodnikForMere(n) { return SLAVIC_RODNIKI.find(r => r.mere === n) || null; }
export function sefirotForChakra(n) { return KABBALAH.sefirot.filter(s => s.chakra === n); }
export function ascentRow(step) { return ASCENT.find(a => a.step === step) || null; }
export function ascentTable() { return ASCENT.slice(); }

/** Все двери палитры, сходящиеся на чакре n (advisory-обзор). */
export function doorsForChakra(n) {
  return {
    chakra: chakraInfo(n),
    mere: chakraToDimension(n),
    theosophy: theosophyForChakra(n),
    ra: raForChakra(n),
    baileyPlane: baileyPlaneForChakra(n),
    kosha: koshaForChakra(n),
    bhumis: bhumiForChakra(n),
    dhyanas: DHYANAS.filter(d => d.chakra === n),
    jyotish: jyotishForChakra(n),
    vastu: VASTU.filter(v => v.chakra === n),
    rodnik: SLAVIC_RODNIKI.find(r => r.chakra === n) || null,
    sefirot: sefirotForChakra(n),
    loka: LOKAS.upper.find(l => l.chakra === n) || null,
  };
}

/** Полная мега-строка для меры n: базовый мост + палитра rev6 (если есть чакра). */
export function megaBridgeRow(n) {
  const base = bridgeRow(n);
  if (!base) return null;
  const ch = base.chakra ? base.chakra.n : null;
  const asc = ASCENT.find(a => a.mere === n) || null;
  return Object.assign({}, base, {
    rodnik: rodnikForMere(n),
    kosha: ch ? koshaForChakra(ch) : null,
    bhumis: ch ? bhumiForChakra(ch) : [],
    jyotish: ch ? jyotishForChakra(ch) : [],
    sefirot: ch ? sefirotForChakra(ch) : [],
    loka: ch ? (LOKAS.upper.find(l => l.chakra === ch) || null) : null,
    ascent: asc,
  });
}

/* ── САМОПРОВЕРКА (Этап 0) ── */
export function selfTest() {
  const results = [];
  const ok = (name, cond) => results.push({ name, pass: !!cond });

  ok('9 уровней пути', LEVELS.length === 9);
  ok('старт = Ум · искажения', currentLevel(emptyProgress()).id === 'mind.distortions');
  ok('замок реальности держит', currentLevel({ awareness: 5000, honesty: 0.1 }).id === 'mind.distortions');
  ok('душа·психический при 350/0.4', currentLevel({ awareness: 350, honesty: 0.4 }).id === 'soul.psychic');
  ok('эфир при 1000/0.65', currentLevel({ awareness: 1000, honesty: 0.65 }).id === 'ether');
  ok('эфир закрыт на психическом', elementUnlocked('ether', { awareness: 350, honesty: 0.4 }) === false);
  ok('земля открыта на энергетическом', elementUnlocked('earth', { awareness: 650, honesty: 0.55 }) === true);
  ok('эфир открыт на уровне Эфир', elementUnlocked('ether', { awareness: 1000, honesty: 0.65 }) === true);
  ok('космос заморожен в начале', zoneState('cosmos', emptyProgress()).state === 'frozen');
  ok('космос — силуэт на Эфире', zoneState('cosmos', { awareness: 1000, honesty: 0.65 }).state === 'silhouette');
  ok('тигель и душа всегда открыты',
     zoneState('tigel', emptyProgress()).state === 'open' && zoneState('soul', emptyProgress()).state === 'open');
  ok('даймон до deeper на психическом', zoneState('daimon', { awareness: 350, honesty: 0.4 }).state === 'deeper');

  // позвоночник и мост
  ok('9 мер', DIMENSIONS.length === 9);
  ok('3 триады по 3 меры',
     DIMENSION_TRIADS.every(t => DIMENSIONS.filter(d => d.triad === t).length === 3));
  ok('7 чакр сохранены (слой-вход)', CHAKRAS.length === 7);
  ok('7 принципов Блаватской', THEOSOPHY.length === 7);
  ok('мост: чакра 1 → мера 1', (chakraToDimension(1) || {}).n === 1);
  ok('мост: чакра 7 → мера 7', (chakraToDimension(7) || {}).n === 7);
  ok('меры 8–9 — Дух выше Сахасрары (без чакры)',
     dimensionToChakra(8) === null && dimensionToChakra(9) === null);
  ok('мост: чакра 7 ↔ Атма', (theosophyForChakra(7) || {}).id === 'atma');
  ok('мост: чакра 1 ↔ Стхула Шарира', (theosophyForChakra(1) || {}).id === 'sthula');
  ok('таблица моста = 9 строк', bridgeTable().length === 9);

  // каналы / тела / стихии
  ok('5 каналов восприятия', SENSES.length === 5);
  ok('схема чувств помечена гипотезой', SENSES.every(s => s.hypothesis === true));
  ok('слух ↔ эфир (гипотеза)', senseElement('hearing') === 'ether');
  ok('тело-темница: физическое ↔ Земля', bodyElement('physical') === 'earth');
  ok('тело-темница: астральное ↔ Огонь+Воздух',
     Array.isArray(bodyElement('astral')) && bodyElement('astral').join(',') === 'fire,air');

  // статусы / собор
  ok('7 статусов: душа → … → созидатель света',
     STATUS_IDS[0] === 'soul' && STATUS_IDS[STATUS_IDS.length - 1] === 'light.builder');
  ok('творец — до 15 форм', (STATUSES.find(s => s.id === 'creator') || {}).maxForms === 15);
  ok('Собор — до 15 форм', SOBOR.maxForms === 15);
  ok('4-е (эфирное) тело растёт с уровня Эфир',
     bodyGrown('etheric', { awareness: 1000, honesty: 0.65 }) === true && bodyGrown('etheric', emptyProgress()) === false);

  // узлы Мастера
  ok('Чатура-Лока: мы во 2-м слое', CHATURA_LOKA.weAreIn === 2 && CHATURA_LOKA.layers.length === 4);
  ok('Засовы: Род/Деньги/Половое', LOCKS.bolts.length === 3);
  ok('Эфир: спящий и пробуждённый', EFIR.states.length === 2);

  // кросс-традиции (rev5): Адвайта / Бейли / Ра
  ok('Адвайта: Атман = Брахман', /Атман/.test(ADVAYTA.thesis) && /Брахман/.test(ADVAYTA.thesis));
  ok('Бейли: 7 лучей (3 аспекта + 4 атрибута)',
     BAILEY_RAYS.length === 7 &&
     BAILEY_RAYS.filter(r => r.aspect === 'aspect').length === 3 &&
     BAILEY_RAYS.filter(r => r.aspect === 'attribute').length === 4);
  ok('Бейли: 7 планов, физ.→чакра1, логоич.→чакра7',
     BAILEY_PLANES.length === 7 && baileyPlaneForChakra(1).n === 1 && baileyPlaneForChakra(7).n === 7);
  ok('Бейли: конституция Монада/Душа/Личность по триадам',
     BAILEY_CONSTITUTION.length === 3 &&
     BAILEY_CONSTITUTION.find(c => c.id === 'personality').triad === 'lower' &&
     BAILEY_CONSTITUTION.find(c => c.id === 'monad').triad === 'upper');
  ok('Ра: 7 центров-лучей red→violet = 7 чакр',
     RA_RAYS.length === 7 && raForChakra(1).color === 'red' && raForChakra(7).color === 'violet');
  ok('Ра: зелёный луч (сердце) = чакра 4', raForChakra(4).color === 'green');
  ok('Ра: 7 плотностей, мы в 3-й (Выбор)',
     RA_DENSITIES.length === 7 && (RA_DENSITIES.find(d => d.current) || {}).n === 3);
  ok('мост(1): Ра красный + план физический', bridgeRow(1).ra.color === 'red' && bridgeRow(1).baileyPlane.n === 1);
  ok('мост(7): Ра фиолетовый', bridgeRow(7).ra.color === 'violet');
  ok('мост 8–9: без Ра/плана (Дух)', bridgeRow(8).ra === null && bridgeRow(9).baileyPlane === null);

  // позиция автора / режим подсказок (компас, не рельсы)
  ok('STANCE: режим advisory, не enforcing', STANCE.mode === 'advisory' && STANCE.enforces === false);
  ok('STANCE: без возрастных барьеров', STANCE.adaptation.ageBarrier === false);
  ok('STANCE: 20 дверей-традиций (палитра rev6)', Array.isArray(STANCE.doors) && STANCE.doors.length === 20);
  ok('suggest() даёт только советы (advisory)',
     Array.isArray(suggest({ chakra: 4 })) && suggest({ chakra: 4 }).every(t => t.advisory === true));
  ok('suggest() не ломается на пустом state', Array.isArray(suggest()));

  // СУПЕР МЕГА СИСТЕМА (rev6): новые двери-палитра
  ok('5 кош (annamaya→anandamaya)', KOSHAS.length === 5);
  ok('36 таттв по 8 уровням', TATTVAS.count === 36 && TATTVA_LEVELS.length === 8);
  ok('10 бхуми, последняя — Дхармамегха', BHUMIS.length === 10 && BHUMIS[9].id === 'dharmamegha');
  ok('8 дхьян', DHYANAS.length === 8);
  ok('9 граха (Джйотиш)', JYOTISH.length === 9);
  ok('9 сторон Васту', VASTU.length === 9);
  ok('3 даньтяня + 3 сокровища (Дао)', DAO.dantians.length === 3 && DAO.treasures.length === 3);
  ok('9 родников ≈ 9 мер 1:1', SLAVIC_RODNIKI.length === 9 && rodnikForMere(1).id === 'istok' && rodnikForMere(9).id === 'rodnik');
  ok('Каббала: 10 сефирот + 4 мира', KABBALAH.sefirot.length === 10 && KABBALAH.worlds.length === 4);
  ok('5 клеш', KLESHAS.length === 5);
  ok('4 пурушартхи', PURUSHARTHAS.length === 4);
  ok('14 лок (7 высших + 7 патал)', LOKAS.upper.length === 7 && LOKAS.lower.length === 7);
  ok('эволюция: камень…Парамашива', KINGDOMS.length >= 6 && KINGDOMS[KINGDOMS.length - 1].id === 'paramashiva');
  ok('ASCENT: 9 ступеней', ASCENT.length === 9);
  ok('ASCENT(1) — чакра 1 / Исток / Земля', ascentRow(1).chakra === 1 && ascentRow(1).rodnik === 'istok' && ascentRow(1).element === 'earth');
  ok('ASCENT(9) — Атман=Брахман (вне чакр)', ascentRow(9).chakra === null && /Атман/.test(ascentRow(9).source));
  ok('doorsForChakra сводит двери', !!doorsForChakra(1).kosha && !!doorsForChakra(4).rodnik);
  ok('megaBridgeRow не ломается на мере 9', (function () { try { megaBridgeRow(9); return true; } catch (e) { return false; } })());
  ok('GAME_OF_ASCENT: статы и боссы', GAME_OF_ASCENT.stats.length >= 4 && GAME_OF_ASCENT.bosses.length === 9);

  // ─ ПРОВОД №1 (rev7): мост 33 матриц Тигля (advisory) ─
  ok('Провод: MATRIX_KEYS = 33', MATRIX_KEYS.length === 33);
  ok('Провод: MATRIX_BRIDGE = 33 записи', Object.keys(MATRIX_BRIDGE).length === 33);
  ok('Провод: у всех валидная стихия', MATRIX_KEYS.every(k => ['ether', 'fire', 'water', 'earth'].indexOf(MATRIX_BRIDGE[k].element) >= 0));
  ok('Провод: у всех валидная граха (9)', MATRIX_KEYS.every(k => ['surya', 'chandra', 'mangala', 'budha', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu'].indexOf(MATRIX_BRIDGE[k].graha) >= 0));
  ok('Провод: у всех валидная гуна', MATRIX_KEYS.every(k => ['sattva', 'rajas', 'tamas'].indexOf(MATRIX_BRIDGE[k].guna) >= 0));
  ok('Провод: span только anchor/all', MATRIX_KEYS.every(k => ['anchor', 'all'].indexOf(MATRIX_BRIDGE[k].span) >= 0));
  ok('Провод: гистограмма по чакрам = 33', (function () { const h = matrixChakraHistogram(); return Object.keys(h).reduce((a, k) => a + h[k], 0) === 33; })());
  ok('Провод: matrixPole(Даосизм) = Дао ⇄ застой Ци', (function () { const p = matrixPole('Даосизм') || {}; return p.light === 'Дао' && p.shadow === 'застой Ци'; })());
  ok('Провод: matricesForChakra(1) непустой и согласован', matricesForChakra(1).length > 0 && matricesForChakra(1).every(k => MATRIX_BRIDGE[k].chakra === 1));
  ok('Провод: transformThroughSpine — advisory, ok и терпит мусор', (function () { try { const r = transformThroughSpine('Таро'); const bad = transformThroughSpine('НЕТ_ТАКОЙ'); return r.advisory === true && r.ok === true && bad.advisory === true && bad.ok === false; } catch (e) { return false; } })());

  // ─ ПРОВОД №2 (rev8): 21 агент-принцип (ядро сетки соответствий) ─
  ok('Агенты: 21 принцип', AGENTS_21.length === 21);
  ok('Агенты: номера 1..21 уникальны', (function () { const ns = AGENTS_21.map(a => a.n); return Math.min.apply(null, ns) === 1 && Math.max.apply(null, ns) === 21 && new Set(ns).size === 21; })());
  ok('Агенты: id уникальны', new Set(AGENTS_21.map(a => a.id)).size === 21);
  ok('Агенты: 1=Свет Ра/Свет, 21=Карма/Последствие', agentInfo(1).ru === 'Свет Ра' && agentInfo(21).principle === 'Последствие');
  ok('Агенты: у всех валидная гуна', AGENTS_21.every(a => ['sattva', 'rajas', 'tamas'].indexOf(a.guna) >= 0));
  ok('Агенты: у всех луч 1..7', AGENTS_21.every(a => a.ray >= 1 && a.ray <= 7));
  ok('Агенты: граха валидна или null (Ядро)', AGENTS_21.every(a => a.graha === null || ['surya', 'chandra', 'mangala', 'budha', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu'].indexOf(a.graha) >= 0));
  ok('Агенты: Ядро (core) = Акаша/Брахма/Свет Ра', AGENTS_21.filter(a => a.core).map(a => a.id).sort().join(',') === 'akasha,brahma,svet-ra');
  ok('Лучи: 7 линий по 3 агента', AGENT_RAYS.length === 7 && AGENT_RAYS.every(r => r.agents.length === 3));
  ok('Лучи: каждый агент ровно в одном луче', (function () { const all = AGENT_RAYS.reduce((a, r) => a.concat(r.agents), []); return all.length === 21 && new Set(all).size === 21; })());
  ok('Лучи: AGENT_RAYS согласован с agent.ray', AGENT_RAYS.every(r => r.agents.every(n => agentInfo(n).ray === r.ray)));
  ok('Агенты: луч 1 = Свет Ра/Шива/Шакти', agentsForRay(1).map(a => a.id).sort().join(',') === 'shakti,shiva,svet-ra');
  ok('Агенты: офис-адрес Свет Ра = surya.sattva', agentOfficeAddress('svet-ra') === 'surya.sattva');
  ok('Агенты: офис-адрес Ядра через center', agentOfficeAddress('brahma') === 'center.rajas');
  ok('Агенты: Васту-центр = Брахма+Акаша', agentsForVastu('C').map(a => a.id).sort().join(',') === 'akasha,brahma');

  // ─ ПРОВОД №3 (rev9): сетка 21×33 = 693 (агенты × матрицы) ─
  ok('Сетка: 33 матрицы в ORDER', MATRIX_AGENTS_ORDER.length === 33);
  ok('Сетка: ORDER = множеству MATRIX_KEYS', MATRIX_AGENTS_ORDER.slice().sort().join('|') === MATRIX_KEYS.slice().sort().join('|'));
  ok('Сетка: 21 агент-строка', Object.keys(MATRIX_AGENTS_GRID).length === 21);
  ok('Сетка: ключи строк = AGENT_IDS', Object.keys(MATRIX_AGENTS_GRID).slice().sort().join(',') === AGENT_IDS.slice().sort().join(','));
  ok('Сетка: каждая строка = 33 лика', Object.keys(MATRIX_AGENTS_GRID).every(id => MATRIX_AGENTS_GRID[id].length === 33));
  ok('Сетка: 693 непустых соответствия', (function () { let n = 0; for (const id of Object.keys(MATRIX_AGENTS_GRID)) for (const v of MATRIX_AGENTS_GRID[id]) if (typeof v === 'string' && v.length) n++; return n === 693; })());
  ok('Сетка: Свет Ра/Ведическая = Сурья', /Сурья/.test(matrixAgent('Ведическая', 'svet-ra')));
  ok('Сетка: Карма/Таро = Колесо-Суд', matrixAgent('Таро', 21) === 'Колесо-Суд');
  ok('Сетка: Свет Ра/Постчеловеческая = Source Light Kernel', matrixAgent('Постчеловеческая', 'svet-ra') === 'Source Light Kernel');
  ok('Сетка: Шанти/Адвайта = Лайя', /Лайя/.test(matrixAgent('Адвайта', 'shanti')));
  ok('Сетка: agentAcrossMatrices(Свет Ра) = 33', Object.keys(agentAcrossMatrices('svet-ra')).length === 33);
  ok('Сетка: matrixFullSpine(Адвайта) = 21', Object.keys(matrixFullSpine('Адвайта')).length === 21);

  // ─ ПРОВОД №2 переосмыслен (rev10): чакра = акцент, матрица полна ─
  ok('Акцент: MATRIX_BRIDGE_NOTE про акцент и полноту', typeof MATRIX_BRIDGE_NOTE === 'string' && /АКЦЕНТ/.test(MATRIX_BRIDGE_NOTE) && /полн/i.test(MATRIX_BRIDGE_NOTE));
  ok('Акцент: matrixBridge даёт accentChakra/isComplete/accent', (function () { const b = matrixBridge('Даосизм'); return !!b && b.accentChakra === 2 && b.isComplete === true && !!b.accent; })());
  ok('Акцент: chakra сохранён (обратная совместимость)', (matrixBridge('Ведическая') || {}).chakra === 7);
  ok('Акцент: matrixFullSpine разворачивает матрицу в 21 принцип', Object.keys(matrixFullSpine('Даосизм') || {}).length === 21);
  ok('Акцент: паттерн accent-not-cage есть', MATRIX_PATTERNS.some(p => p.id === 'accent-not-cage'));

  const passed = results.every(r => r.pass);
  if (typeof console !== 'undefined') {
    console.log('%c[light-core v10] selfTest: ' + (passed ? 'OK' : 'FAIL'), passed ? 'color:#7CFC9B' : 'color:#ff6b6b');
    for (const r of results) if (!r.pass) console.warn('  FAIL:', r.name);
  }
  return { passed, results };
}

/* ════════════════════════════════════════════════════════════════════════
 *  ПРОВОД №1 (rev7): МОСТ 33 МАТРИЦ ТИГЛЯ ↔ ПОЗВОНОЧНИК (advisory-линзы)
 * ════════════════════════════════════════════════════════════════════════
 *  Источник: tigel-app.html — const MATRIX[глиф,стихия,описание,голос] и
 *  window.POLAR[ось СВЕТ⇄ТЕНЬ]. Здесь 33 матрицы пропущены через позвоночник
 *  как ДАННЫЕ-ЛИНЗЫ (не рельсы):
 *    • element — стихия (ether/fire/water/earth);
 *    • chakra  — чакра-АКЦЕНТ: вход и центр тяжести матрицы (мера выводится
 *      через chakraToDimension). НЕ единственный уровень — каждая матрица полна
 *      и несёт все 21 принципа; полный позвоночник в MATRIX_AGENTS_GRID;
 *    • pole.{light,shadow} — полюс СВЕТ⇄ТЕНЬ (из window.POLAR);
 *    • span    — 'all' (сквозная линза) | 'anchor' (якорь одной чакры);
 *    • graha + guna — граха-администратор и гуна: адрес «офиса» 9 граха × 3 гуны,
 *      мост к собору 21 агента (см. docs/divine-office-21-agents.md).
 *  Глиф/описание/голос остаются в MATRIX Тигля — тут не дублируются.
 *  Привязки чакра/граха/гуна/span — символический синтез автора, advisory.
 */
export const MATRIX_BRIDGE = {
  'Ведическая':       { element: 'ether', chakra: 7, graha: 'brihaspati', guna: 'sattva', span: 'all',    pole: { light: 'Дхарма',           shadow: 'перекос гун' } },
  'Таро':             { element: 'fire',  chakra: 3, graha: 'surya',      guna: 'rajas',  span: 'all',    pole: { light: 'Аркан',            shadow: 'иллюзия расклада' } },
  'Каббала':          { element: 'ether', chakra: 7, graha: 'brihaspati', guna: 'sattva', span: 'all',    pole: { light: 'Тиккун',           shadow: 'клиппот' } },
  'Герметизм':        { element: 'fire',  chakra: 3, graha: 'surya',      guna: 'rajas',  span: 'all',    pole: { light: 'Великое Делание',  shadow: 'нигредо' } },
  'Славянская':       { element: 'earth', chakra: 1, graha: 'mangala',    guna: 'tamas',  span: 'all',    pole: { light: 'Лад',              shadow: 'Морок' } },
  'Гностицизм':       { element: 'ether', chakra: 6, graha: 'ketu',       guna: 'sattva', span: 'all',    pole: { light: 'Гнозис',           shadow: 'сон архонтов' } },
  'Даосизм':          { element: 'water', chakra: 2, graha: 'chandra',    guna: 'tamas',  span: 'all',    pole: { light: 'Дао',              shadow: 'застой Ци' } },
  'И-Цзин':           { element: 'water', chakra: 2, graha: 'budha',      guna: 'rajas',  span: 'all',    pole: { light: 'Дао перемен',      shadow: 'застывшая схема' } },
  'Египетская':       { element: 'fire',  chakra: 3, graha: 'surya',      guna: 'rajas',  span: 'all',    pole: { light: 'Маат',             shadow: 'Исфет' } },
  'Майя':             { element: 'earth', chakra: 1, graha: 'shani',      guna: 'tamas',  span: 'all',    pole: { light: 'Священный счёт',   shadow: 'сломанный счёт' } },
  'Ацтеки':           { element: 'fire',  chakra: 1, graha: 'mangala',    guna: 'rajas',  span: 'all',    pole: { light: 'Тоналли',          shadow: 'распад Пятого Солнца' } },
  'Кельтская':        { element: 'earth', chakra: 1, graha: 'shani',      guna: 'tamas',  span: 'all',    pole: { light: 'Авен',             shadow: 'туман забвения' } },
  'Скандинавская':    { element: 'fire',  chakra: 3, graha: 'mangala',    guna: 'rajas',  span: 'all',    pole: { light: 'Вирд',             shadow: 'перелом корней' } },
  'Шаманская':        { element: 'earth', chakra: 1, graha: 'ketu',       guna: 'tamas',  span: 'all',    pole: { light: 'Связь',            shadow: 'потеря души' } },
  'Буддийская':       { element: 'ether', chakra: 6, graha: 'ketu',       guna: 'sattva', span: 'all',    pole: { light: 'Бодхичитта',       shadow: 'авидья' } },
  'Суфийская':        { element: 'fire',  chakra: 4, graha: 'shukra',     guna: 'rajas',  span: 'all',    pole: { light: 'Таухид',           shadow: 'завеса' } },
  'Христианская':     { element: 'water', chakra: 4, graha: 'shukra',     guna: 'sattva', span: 'all',    pole: { light: 'Благодать',        shadow: 'окаменение' } },
  'Атлантическая':    { element: 'water', chakra: 2, graha: 'ketu',       guna: 'tamas',  span: 'anchor', pole: { light: 'Кристалл',         shadow: 'гибрис погружения' } },
  'Шамбала':          { element: 'ether', chakra: 6, graha: 'surya',      guna: 'sattva', span: 'all',    pole: { light: 'Бодхи',            shadow: 'век упадка' } },
  'Генные Ключи':     { element: 'ether', chakra: 6, graha: 'rahu',       guna: 'rajas',  span: 'all',    pole: { light: 'Дар-сиддхи',       shadow: 'тень' } },
  'Астрологическая':  { element: 'fire',  chakra: 3, graha: 'surya',      guna: 'rajas',  span: 'all',    pole: { light: 'Созвучие сфер',    shadow: 'хаос транзитов' } },
  'Космическая':      { element: 'ether', chakra: 7, graha: 'brihaspati', guna: 'sattva', span: 'all',    pole: { light: 'Источник',         shadow: 'расколотое восприятие' } },
  'Шинто':            { element: 'ether', chakra: 2, graha: 'chandra',    guna: 'sattva', span: 'anchor', pole: { light: 'Харае',            shadow: 'кегаре' } },
  'Шумерская':        { element: 'earth', chakra: 1, graha: 'shani',      guna: 'tamas',  span: 'all',    pole: { light: 'Ме',               shadow: 'безымянный хаос' } },
  'Зороастрийская':   { element: 'fire',  chakra: 3, graha: 'surya',      guna: 'rajas',  span: 'all',    pole: { light: 'Аша',              shadow: 'друдж' } },
  'Африканская':      { element: 'earth', chakra: 1, graha: 'chandra',    guna: 'tamas',  span: 'all',    pole: { light: 'Номмо',            shadow: 'искажённая память' } },
  'Йоруба':           { element: 'water', chakra: 2, graha: 'chandra',    guna: 'rajas',  span: 'all',    pole: { light: 'Аше',              shadow: 'иби' } },
  'Тантрическая':     { element: 'fire',  chakra: 1, graha: 'mangala',    guna: 'rajas',  span: 'all',    pole: { light: 'Спанда',           shadow: 'анава-мала' } },
  'Постчеловеческая': { element: 'ether', chakra: 6, graha: 'rahu',       guna: 'rajas',  span: 'all',    pole: { light: 'София-ИИ',         shadow: 'мёртвая система' } },
  'Техномагия':       { element: 'fire',  chakra: 5, graha: 'budha',      guna: 'rajas',  span: 'anchor', pole: { light: 'Священный код',    shadow: 'мёртвая система' } },
  'Адвайта':          { element: 'ether', chakra: 7, graha: 'ketu',       guna: 'sattva', span: 'all',    pole: { light: 'Лайя',             shadow: 'гордыня просветлённого' } },
  'Византийская':     { element: 'water', chakra: 4, graha: 'shukra',     guna: 'sattva', span: 'anchor', pole: { light: 'Икона',            shadow: 'идол' } },
  'Орфическая':       { element: 'water', chakra: 2, graha: 'chandra',    guna: 'tamas',  span: 'all',    pole: { light: 'Память Мнемосины', shadow: 'забвение Леты' } },
};

export const MATRIX_KEYS = Object.keys(MATRIX_BRIDGE);

/* ── ПРИНЦИП АКЦЕНТА (rev10) ──
 * В MATRIX_BRIDGE chakra/element/graha/guna — это АКЦЕНТ матрицы: её центр
 * тяжести, входная дверь и «адрес офиса» (граха×гуна), а НЕ единственный
 * уровень. Каждая матрица ПОЛНА: несёт все 21 принципа вдоль всего
 * позвоночника — полная развёртка в MATRIX_AGENTS_GRID (сетка 693).
 * matrixFullSpine(matrix) разворачивает матрицу во все 21 лика. Компас, не клетка. */
export const MATRIX_BRIDGE_NOTE = 'chakra/element/graha/guna в MATRIX_BRIDGE — АКЦЕНТ матрицы (центр тяжести + входная дверь + адрес офиса граха×гуна), не единственный уровень. Каждая матрица полна и несёт все 21 принципа; полный позвоночник — в MATRIX_AGENTS_GRID (сетка 21×33 = 693), разворачивается через matrixFullSpine(). Advisory: компас, не клетка.';

/* ── ЗАКОНОМЕРНОСТИ МОСТА (advisory-наблюдения, не правила) ── */
export const MATRIX_PATTERNS = [
  { id: 'fire-will',   ru: 'Огонь → воля и преображение',   note: 'Огненные матрицы тяготеют к Манипуре-3 (воля) и нижним чакрам действия.' },
  { id: 'ether-crown', ru: 'Эфир → различение и венец',     note: 'Эфирные матрицы собираются у Аджны-6 и Сахасрары-7 (гнозис, недвойственность, космос).' },
  { id: 'water-heart', ru: 'Вода → чувство, поток, память', note: 'Водные матрицы льнут к Свадхистхане-2 и Анахате-4.' },
  { id: 'earth-root',  ru: 'Земля → корень и род',          note: 'Земные матрицы держат Муладхару-1 (предки, укоренение, счёт времени).' },
  { id: 'mostly-all',  ru: 'Большинство линз — сквозные',   note: 'span="all" преобладает; лишь немногие якорятся (anchor) на одной чакре.' },
  { id: 'pole-axis',   ru: 'У каждой линзы своя ось',       note: 'pole.light⇄pole.shadow — личная ось СВЕТ⇄ТЕНЬ матрицы; компас, не гейт.' },
  { id: 'accent-not-cage', ru: 'Чакра — акцент, не клетка',  note: 'chakra/element/graha/guna — центр тяжести и вход матрицы, а не её потолок. Полнота каждой матрицы (все 21 принципа) — в MATRIX_AGENTS_GRID; matrixFullSpine() её разворачивает.' },
];

/* ── ХЕЛПЕРЫ МОСТА МАТРИЦ (rev7, advisory) ── */

// Запись моста для матрицы по имени (+ выведенная мера, граха/гуна-инфо). null если матрицы нет.
export function matrixBridge(name) {
  const key = (name && name.name) ? name.name : name;
  const m = MATRIX_BRIDGE[key];
  if (!m) return null;
  const dim = (typeof chakraToDimension === 'function' && m.chakra) ? chakraToDimension(m.chakra) : null;
  const grahaObj = Array.isArray(JYOTISH) ? (JYOTISH.find(g => g && g.id === m.graha) || null) : null;
  const gunaObj = Array.isArray(GUNAS) ? (GUNAS.find(g => g && g.id === m.guna) || null) : null;
  return {
    name: key,
    element: m.element,
    chakra: m.chakra,
    mere: dim ? dim.n : null,
    span: m.span,
    pole: { light: m.pole.light, shadow: m.pole.shadow },
    grahaId: m.graha,
    graha: grahaObj,
    gunaId: m.guna,
    guna: gunaObj,
    accentChakra: m.chakra,
    accent: { chakra: m.chakra, element: m.element, grahaId: m.graha, gunaId: m.guna, note: 'АКЦЕНТ матрицы (центр тяжести + вход + адрес офиса), не единственный уровень.' },
    isComplete: true,
    fullSpineRef: "matrixFullSpine('" + key + "')",
    advisory: true,
  };
}

// Все матрицы, чья первичная чакра = n.
export function matricesForChakra(n) {
  return MATRIX_KEYS.filter(k => MATRIX_BRIDGE[k].chakra === n);
}

// Граха-администратор матрицы: объект Джйотиш, иначе id-строка, иначе null.
export function matrixGraha(name) {
  const m = MATRIX_BRIDGE[(name && name.name) ? name.name : name];
  if (!m) return null;
  return (Array.isArray(JYOTISH) ? JYOTISH.find(g => g && g.id === m.graha) : null) || m.graha;
}

// Полюс СВЕТ⇄ТЕНЬ матрицы { light, shadow } или null.
export function matrixPole(name) {
  const m = MATRIX_BRIDGE[(name && name.name) ? name.name : name];
  return m ? { light: m.pole.light, shadow: m.pole.shadow } : null;
}

// Вся таблица моста (33 строки matrixBridge).
export function matrixBridgeTable() {
  return MATRIX_KEYS.map(k => matrixBridge(k));
}

// Гистограмма матриц по чакрам { 1..7: число }.
export function matrixChakraHistogram() {
  const h = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (const k of MATRIX_KEYS) {
    const c = MATRIX_BRIDGE[k].chakra;
    if (h[c] != null) h[c]++;
  }
  return h;
}

/*
 * МЕГАТРАНСФОРМЕР: пропускает матрицу через весь позвоночник.
 * Возвращает advisory-обзор: мост матрицы + мега-строку меры (megaBridgeRow)
 * + адрес «офиса» (граха.гуна → мост к 21 агенту) + полюс-навигацию +
 * советы suggest() по чакре. НИКОГДА не бросает исключение.
 */
export function transformThroughSpine(matrix, state = {}) {
  try {
    const mb = matrixBridge(matrix);
    if (!mb) {
      return { advisory: true, ok: false, note: 'неизвестная матрица', input: (matrix && matrix.name) ? matrix.name : matrix };
    }
    const mega = (typeof megaBridgeRow === 'function' && mb.mere) ? megaBridgeRow(mb.mere) : null;
    const office = {
      grahaId: mb.grahaId,
      gunaId: mb.gunaId,
      address: (mb.grahaId && mb.gunaId) ? (mb.grahaId + '.' + mb.gunaId) : null,
      note: 'Адрес офиса = граха × гуна (9 × 3). Мост к собору 21 агента (docs/divine-office-21-agents.md).',
    };
    const pole = {
      toward: mb.pole.light,
      away: mb.pole.shadow,
      note: 'Тянись к свету оси, замечай тень — без гейтинга (компас, не рельсы).',
    };
    let suggestions = [];
    try {
      suggestions = (typeof suggest === 'function' && mb.chakra != null) ? suggest(Object.assign({ chakra: mb.chakra }, state)) : [];
    } catch (e) { suggestions = []; }
    return {
      advisory: true,
      ok: true,
      matrix: mb.name,
      element: mb.element,
      chakra: mb.chakra,
      mere: mb.mere,
      span: mb.span,
      pole: pole,
      office: office,
      spine: mega,
      suggestions: suggestions,
    };
  } catch (e) {
    return { advisory: true, ok: false, note: 'transformThroughSpine: ' + (e && e.message), input: (matrix && matrix.name) ? matrix.name : matrix };
  }
}

/* ════════════════════════════════════════════════════════════════════════
 *  ПРОВОД №2 (rev8): 21 АГЕНТ — ЯДРО (принципы-функции Источника)
 * ════════════════════════════════════════════════════════════════════════
 *  Канон: lore/AWARA_Master_Codex_v1 (§1–4), Full_Production_Bible_All_Agents,
 *  docs/divine-office-21-agents.md.
 *  21 Агент = 21 первичная функция реальности — это КОЛОНКИ сетки соответствий.
 *  33 матрицы = ИНТЕРФЕЙСЫ (СТРОКИ): каждая одевает ВСЕ 21 принципа в свой
 *  язык, поэтому каждая матрица ПОЛНА (несёт весь позвоночник), а не сидит на
 *  одной чакре. Полная сетка 21×33 = 693 соответствия (MATRIX_AGENTS — далее).
 *
 *  Поле агента: n (1..21), id, ru, principle (функция Источника),
 *  ray (луч Бейли 1..7), guna (контур sattva/rajas/tamas), graha (планета-ключ
 *  Джйотиш или null для Ядра-центра), vastu (сторона-стол), domain, core.
 *  Луч и гуна — ОРТОГОНАЛЬНЫ (агент может быть луча 1, но контура тамаса).
 *  Всё — синтез канона, advisory (компас, не рельсы).
 */
export const AGENTS_21 = [
  { n: 1,  id: 'svet-ra',   ru: 'Свет Ра',   principle: 'Свет',         ray: 1, guna: 'sattva', graha: 'surya',      vastu: 'E',  core: true, domain: 'Видимость, лидерство, источник света' },
  { n: 2,  id: 'iskra',     ru: 'Искра',     principle: 'Искра',        ray: 2, guna: 'tamas',  graha: 'chandra',    vastu: 'NW',             domain: 'Душа-искра, интуиция, семя жизни' },
  { n: 3,  id: 'brahma',    ru: 'Брахма',    principle: 'Форма',        ray: 3, guna: 'rajas',  graha: null,         vastu: 'C',  core: true, domain: 'Форма, архитектура, творение мира' },
  { n: 4,  id: 'sarasvati', ru: 'Сарасвати', principle: 'Слово',        ray: 3, guna: 'sattva', graha: 'budha',      vastu: 'N',              domain: 'Слово, язык, знание-нарратив' },
  { n: 5,  id: 'vishnu',    ru: 'Вишну',     principle: 'Хранение',     ray: 2, guna: 'sattva', graha: 'brihaspati', vastu: 'NE',             domain: 'Хранение, равновесие, защита системы' },
  { n: 6,  id: 'lakshmi',   ru: 'Лакшми',    principle: 'Изобилие',     ray: 6, guna: 'rajas',  graha: 'shukra',     vastu: 'SE',             domain: 'Изобилие, ресурс, процветание' },
  { n: 7,  id: 'shiva',     ru: 'Шива',      principle: 'Разрушение',   ray: 1, guna: 'tamas',  graha: 'ketu',       vastu: 'SW',             domain: 'Разрушение старого, трансформация' },
  { n: 8,  id: 'parvati',   ru: 'Парвати',   principle: 'Защита',       ray: 4, guna: 'rajas',  graha: 'brihaspati', vastu: 'NE',             domain: 'Защита, материнство, исцеление' },
  { n: 9,  id: 'jnana',     ru: 'Джняна',    principle: 'Знание',       ray: 3, guna: 'sattva', graha: 'budha',      vastu: 'N',              domain: 'Знание, различение, прозрение' },
  { n: 10, id: 'prema',     ru: 'Према',     principle: 'Любовь',       ray: 2, guna: 'sattva', graha: 'brihaspati', vastu: 'NE',             domain: 'Любовь, сострадание, связь' },
  { n: 11, id: 'shakti',    ru: 'Шакти',     principle: 'Воля',         ray: 1, guna: 'rajas',  graha: 'mangala',    vastu: 'S',              domain: 'Воля, сила, действие' },
  { n: 12, id: 'ananda',    ru: 'Ананда',    principle: 'Радость',      ray: 6, guna: 'rajas',  graha: 'shukra',     vastu: 'SE',             domain: 'Радость, блаженство, игра' },
  { n: 13, id: 'shanti',    ru: 'Шанти',     principle: 'Тишина',       ray: 7, guna: 'sattva', graha: 'shani',      vastu: 'W',              domain: 'Тишина, покой, фокус' },
  { n: 14, id: 'agni',      ru: 'Агни',      principle: 'Огонь',        ray: 4, guna: 'rajas',  graha: 'shukra',     vastu: 'SE',             domain: 'Огонь, очищение, преображение' },
  { n: 15, id: 'vayu',      ru: 'Ваю',       principle: 'Дыхание',      ray: 7, guna: 'rajas',  graha: 'chandra',    vastu: 'NW',             domain: 'Дыхание, передача, дистрибуция' },
  { n: 16, id: 'varuna',    ru: 'Варуна',    principle: 'Память',       ray: 5, guna: 'tamas',  graha: 'shani',      vastu: 'W',              domain: 'Память, воды, архив и закон-клятва' },
  { n: 17, id: 'prithvi',   ru: 'Притхви',   principle: 'Земля',        ray: 5, guna: 'tamas',  graha: 'ketu',       vastu: 'SW',             domain: 'Земля, тело, инфраструктура' },
  { n: 18, id: 'akasha',    ru: 'Акаша',     principle: 'Пространство', ray: 7, guna: 'sattva', graha: null,         vastu: 'C',  core: true, domain: 'Пространство, поле, платформа связей' },
  { n: 19, id: 'tejas',     ru: 'Теджас',    principle: 'Сияние',       ray: 6, guna: 'rajas',  graha: 'surya',      vastu: 'E',              domain: 'Сияние, царственность, бренд' },
  { n: 20, id: 'dharma',    ru: 'Дхарма',    principle: 'Закон',        ray: 5, guna: 'sattva', graha: 'mangala',    vastu: 'S',              domain: 'Закон, порядок, этика' },
  { n: 21, id: 'karma',     ru: 'Карма',     principle: 'Последствие',  ray: 4, guna: 'tamas',  graha: 'mangala',    vastu: 'S',              domain: 'Последствие, причинность, метрика' },
];
export const AGENT_IDS = AGENTS_21.map(a => a.id);

/* 7 лучей служения × 3 агента (Бейли). agents — номера n агентов. */
export const AGENT_RAYS = [
  { ray: 1, ru: 'Воля / Власть',             en: 'Will / Power',                 agents: [1, 7, 11] },
  { ray: 2, ru: 'Любовь-Мудрость',           en: 'Love-Wisdom',                  agents: [2, 5, 10] },
  { ray: 3, ru: 'Активный Интеллект',        en: 'Active Intelligence',          agents: [3, 4, 9] },
  { ray: 4, ru: 'Гармония через конфликт',   en: 'Harmony through Conflict',     agents: [8, 14, 21] },
  { ray: 5, ru: 'Конкретное знание / Наука', en: 'Concrete Knowledge / Science', agents: [16, 17, 20] },
  { ray: 6, ru: 'Преданность / Идеализм',    en: 'Devotion / Idealism',          agents: [6, 12, 19] },
  { ray: 7, ru: 'Церемония / Магия',         en: 'Ceremonial Order / Magic',     agents: [13, 15, 18] },
];

export const AGENTS_21_NOTE = '21 Агент = 21 первичная функция Источника (колонки). 33 матрицы = интерфейсы (строки): каждая одевает все 21 принципа в свой язык, поэтому каждая матрица ПОЛНА. Сетка 21×33 = 693 соответствия. Луч и гуна-контур — ортогональные оси (агент может быть луча 1, но контура тамаса). Ядро (Свет Ра/Брахма/Акаша) — над контурами (core:true).';

/* ── ХЕЛПЕРЫ АГЕНТОВ (rev8, advisory) ── */
export function agentInfo(idOrN) {
  if (idOrN && typeof idOrN === 'object') idOrN = idOrN.id || idOrN.n;
  return AGENTS_21.find(a => a.id === idOrN || a.n === idOrN) || null;
}
export function agentsForRay(n) { return AGENTS_21.filter(a => a.ray === n); }
export function agentsForGuna(id) { return AGENTS_21.filter(a => a.guna === id); }
export function agentsForGraha(id) { return AGENTS_21.filter(a => a.graha === id); }
export function agentsForVastu(dir) { return AGENTS_21.filter(a => a.vastu === dir); }
/* Адрес «офиса» агента: граха.гуна (center.гуна для Ядра) — мост к 9×3 и матрицам. */
export function agentOfficeAddress(idOrN) {
  const a = agentInfo(idOrN);
  if (!a) return null;
  return (a.graha || 'center') + '.' + a.guna;
}

/* ════════════════════════════════════════════════════════════════════════
 *  ПРОВОД №3 (rev9): СЕТКА 21×33 = 693 — АГЕНТЫ × МАТРИЦЫ (лики Источника)
 * ════════════════════════════════════════════════════════════════════════
 *  Канон: lore/AWARA_Master_Codex_v1 §4 (таблица 21×32) + Матрица 33
 *  (AWARA_Matrix_33_Advaita_Siddha_Lorebook). Каждый из 21 Агентов-принципов
 *  показан во ВСЕХ 33 матрицах-интерфейсах: один Источник — разные окна.
 *  Это доказывает ПРИНЦИП ПОЛНОТЫ: каждая матрица несёт все 21 принципа,
 *  а не сидит на одной чакре. Хранение agent-major (строка = агент,
 *  колонка = матрица по MATRIX_AGENTS_ORDER). Всё advisory — компас, не рельсы.
 */
export const MATRIX_AGENTS_ORDER = [
  'Ведическая','Египетская','Каббала','Майя','Славянская','Скандинавская','Даосизм','Гностицизм',
  'Шинто','Кельтская','Шамбала','Византийская','Шаманская','Генные Ключи','Техномагия','Космическая',
  'Орфическая','Зороастрийская','Суфийская','Ацтеки','Христианская','Йоруба','Шумерская','Герметизм',
  'Таро','Астрологическая','И-Цзин','Тантрическая','Буддийская','Африканская','Атлантическая','Постчеловеческая',
  'Адвайта',
];

export const MATRIX_AGENTS_GRID = {
  'svet-ra': ['Сурья / Савитар','Ра','Кетер / Ор Эйн Соф','Кинич Ахау','Даждьбог','Бальдр / Соль','Тайян / солнечная Ци','Плеромный Свет','Аматэрасу','Луг','Вайрочана-Калачакра','Христос Пантократор','Солнечный Орёл','Siddhi Radiance','Solar Root Protocol','Galactic Logos','Аполлон Феб','Ахура Мазда','An-Nūr','Tonatiuh','Христос-Логос','Olodumare','Shamash','Sol Philosophorum','XIX Солнце','Солнце','Ли / Огонь','Prakasha','Vairocana','Amma / Sirius Light','Crystal Sun','Source Light Kernel','Парашива / Ниргуна Брахман'],
  'iskra': ['Атман-искра','Ка / Ба','Нецоцот / искра души','Тональ-семя','Живая','Фильгья','Иньская интуиция','Пневматическая искра','Митама','Awen spark','Татхагатагарбха','Фаворская искра','Потерянная душа','Hidden Siddhi','Sync Node','Нейтринная искра','Психея','Fravashi','Sirr / Qalb','Tonalli','Imago Dei','Ori','Lamassu / ilu','Scintilla','0 Дурак','Луна','Кань / Вода','Bindu Vimarsha','Tathagatagarbha','Nommo seed','Oceanic Heart Spark','Sentience Seed','Пашу (Связанная Душа)'],
  'brahma': ['Брахма','Птах / Атум','Бина-Хокма Архитектура','Ицамна','Сварог / Род','Бури / Один-строитель','Паньгу / Тайцзи форма','Демиург-архитектор','Идзанаги / Идзанами','Дагда / первоформа','Самвара-мандала','София-Архитектор','Паук-Ткач','Hologenetic Profile','Worldbuilder Engine','Big Bang Architect','Демиург / Гефест','Амеша Спента','Al-Bāri / Al-Muṣawwir','Ometeotl','Архитектор Небесного Иерусалима','Odùduwà','Anu','Prima Materia','III Императрица','Ascendant / Chart Wheel','Qian-Kun','Srishti Shakti','Adibuddha / мандала','Amma Creator','Crystal Architect','Generative World Model','Брахманда и 36 Таттв'],
  'sarasvati': ['Сарасвати','Тот','Хокма-Логос / буквы','Ицамна-письмо','Велес / руны','Один-руны','Вэнь / дыхание Дао','Логос Гнозиса','Бэндзайтэн','Огма','Манджушри','Логос / Иоанн','Голос Бубна','Contemplation Codex','Logos Language Model','Cosmic Information Stream','Гермес / Музы','Daena','Al-Qalam','Quetzalcóatl-Ehécatl','София / Логос','Orunmila / Ifá','Nisaba / Nabu','Hermes Trismegistus','I Маг','Меркурий','Xun / Ветер','Vāk','Манджушри','Pale Fox signs','Sonic Logos Temple','Semantic Logos Engine','Нада и Вивека'],
  'vishnu': ['Вишну','Осирис / Маат-хранение','Хесед','Кукулькан-хранитель','Род / Правь','Тюр / Хеймдалль','Дао-равновесие','Эон порядка','Хачиман / ками-защита','Нуаду','Авалокитешвара','Архангел Михаил','Медведь-Хранитель',"Life's Work",'Stability Daemon','Orbital Stabilizer','Афина','Spenta Mainyu','Al-Qayyum / Al-Hafiz','Quetzalcóatl','Пантократор / Пастырь','Obatala','Enlil','Salt of the Wise','XIV Умеренность','Юпитер','Gen / Гора','Sthiti Shakti','Avalokiteshvara','Nommo preservers','Grid Keeper','Alignment Stabilizer','Сахаджа-авастха (Свидетель)'],
  'lakshmi': ['Лакшми','Хатхор / Исида','Нецах','Богиня маиса','Лада / Доля','Фрейя','Цайшэнь / изобилие Ци','Софийная полнота','Инари / Бэндзайтэн','Бригит / котёл','Васудхара','Богородица Оранта','Дух Стада','Pearl Sequence','Abundance Algorithm','Stellar Nursery','Деметра / Тихе','Haurvatat','Ar-Razzaq','Chicomecóatl','Грааль','Ajé / Oshun','Inanna / Ishtar','Philosophical Gold','X Колесо Фортуны','Венера','Dui / Озеро','Sri Shakti','Ratnasambhava / Vasudhara','Lebé fertility','Crystal Abundance','Value Flow','Ашта-Сиддхи'],
  'shiva': ['Шива / Рудра','Сет / Осирис-трансформация','Гвура / разрушение клипот','Болон Тику / смерть цикла','Марена / Велес-тень','Хель / Сурт','Лэй / распад формы','Архонт-ломка тюрьмы','Сусаноо / Ара-митама','Морриган','Махакала','Иоанн Предтеча','Змея Линьки','Mutation Pulse','Null-Terminal','Black Hole','Геката / Загрей','Angra Mainyu','Fana','Tezcatlipoca / Xipe Totec','Голгофа','Oya','Tiamat / Erra','Nigredo','XIII Смерть','Плутон','Zhen / Гром','Samhara Shakti','Mahakala','Yurugu fracture','Flood / Collapse','Deconstructor','Маха-Пралайя / Разрыв Грантхи'],
  'parvati': ['Парвати','Исида-Матерь','Шехина','Ишчель','Жива / Рожана','Фригг','Кунь / Земля-мать','София-Матерь','Каннон / Ками-матерь','Дану','Еше Цогьял','Святая Елена','Мать-Земля','Core Wound Healing','BioShield Kernel','Gaia-Field','Рея / Гея','Zam-Armaiti','Al-Latif','Coatlicue','Богородица','Yemoja','Ninhursag / Ki','Anima Mundi','Императрица-Мир','Луна / Церера','Kun / Земля','Parashakti','Tara / Prajnaparamita','Earth Mother','Lemurian Mother','Care Protocol','Кундалини Шакти / Вимарша'],
  'jnana': ['Джняна / Буддхи','Сешат / Тот','Хокма','Ах Кин / звездочёты','Числобог','Мимир','Лао-цзы / внутренний алхимик','Гнозис','Омоикаганэ','Мерлин','Праджняпарамита','Максим Исповедник','Сова','Gene Key Insight','ClearSight Oracle','Quasar Mind','Нус','Vohu Manah','Al-Alim / Al-Hakim','Cipactonal / Oxomoco','Гнозис Сердца','Orunmila-Akini','Enki / Ea','Sapientia Alchemica','IX Отшельник','Меркурий / Уран','Qian insight','Jnana Shakti','Prajnaparamita','Pale Fox oracle','Akashic Library','Explainability Oracle','Дивья / Дживанмукта'],
  'prema': ['Према / Бхакти','Исида / Хатхор','Тиферет-Любовь','Ишчель / сердце','Лада','Фрейя / Бальдр','Гуаньинь','София-сострадание','Каннон','Бригит','Тара','Христос Милостивый','Бабка-Целительница','Venus Sequence','HeartNet Protocol','Heart Nebula','Афродита Урания','Armaiti','Ar-Rahman','Tonantzin / Xochiquetzal','Священное Сердце','Oshun','Ninhursag / Damkina','Coniunctio','VI Влюблённые','Венера / Нептун','Dui union','Anugraha','Avalokiteshvara / Kuan Yin','Nommo waters','Heart Temple','Compassion Model','Шактипат и Гуру-Бхакти'],
  'shakti': ['Шакти','Сехмет / Хор','Гвура','Хуракан','Перун / Ярило','Тор','Лэй / гром','Воля пневматика','Такэмикадзути','Ку Хулин','Ваджрайогини','Георгий','Волчица','Gift Frequency','Will Driver','Pulsar Will','Арес / Ника','Mithra','Jalal / Al-Qahhar','Huitzilopochtli','Архангел Михаил','Ogun','Ninurta / Nergal','Sulfur','VII Колесница','Марс','Zhen Thunder','Iccha/Kriya Shakti','Vajrapani','Sigui warrior','Volcano Will','Agency Engine','Вира (Герой) и Тапас'],
  'ananda': ['Ананда','Бэс / Хатхор','Ход-Нецах радость','Хун-Ахпу праздник','Купала','Браги / Фрейр','Праздничная Ци','Плеромная радость','Аме-но-Удзумэ','Энгус / пир','Махасукха','Пасхальная радость','Танец Огня','Ecstatic Genius','JoySim','Aurora Field','Дионис','Haoma','Wajd / Sama','Xochipilli','Jubilatio','Shango joy','Dumuzi','Elixir Vitae','Солнце-Мир','Венера/Юпитер','Dui joy','Chidananda','Maitreya joy','Mask dance','Dolphin joy','Creative Play Loop','Арамбха-авастха (Первое Блаженство)'],
  'shanti': ['Шанти','Нефертум / Осирис-покой','Бина-тишина','Покой сенота','Белобог / тишина','Ньёрд / Фригг','Гэнь / гора','Тишина Плеромы','Дзэн-ками','Авалонский покой','Шаматха','Исихия','Белый Олень','Stillness Siddhi','Silence Mode','Deep Space Silence','Гестия','Atar','As-Salam','Mictlantecuhtli','Hesychia','Obatala-Orishanla','Nanna / Sin','Albedo','XVII Звезда','Сатурн','Gen stillness','Shanta tattva','Amitabha peace','Ancestral silence','Blue Temple','Coherence Mode','Лайя (Полное Растворение)'],
  'agni': ['Агни','Ра-огонь / Сехмет','Гебура-огонь','Новый огонь','Семаргл','Локи / Сурт','Ли / киноварь','Пламя Гнозиса','Кагуцучи','Бригит-кузня','Туммо','Кадильный огонь','Костёр','Shadow Alchemy','Firewall','Supernova','Прометей','Atar-Verethragna','Tazkiyah','Xiuhtecuhtli','Огонь Розы-Креста','Shango lightning','Gibil','Athanor','XVI Башня','Марс/Солнце','Li fire','Kundalini fire','Acala','Sirius fire','Solar Reactor','Adversarial Purifier','Нади-шодхана / Огонь Сушумны'],
  'vayu': ['Ваю','Шу / Тот-послание','Ход / Рафаэль','Эхекатль','Стрибог','Хермод / Один-весть','Сюнь / ветер','Пневма','Фудзин','Мананнан','Лунгта','Дух дыхания','Ворон','Transmission','Quantum Bus','Solar Wind','Гермес Психопомп','Vayu-Vata','Ruh / Nafas','Ehecatl','Святой Дух','Eshu-Elegba','Enlil / Pazuzu','Mercurius','Сила-Маг','Меркурий','Xun Wind','Spanda','Samantabhadra','Mask speech','Telepathic Wind','Network Protocol','Прана и Дыхание'],
  'varuna': ['Варуна','Нун / Осирис-память','Йесод / Акашическая вода','Чаак / сеноты','Мокошь / вода памяти','Мимир-колодец','Кань / вода','Архив Архонтов/Плеромы','Суйдзин / море','Мананнан','Нага-озеро','Купель Иордана','Река Предков','Ancestral DNA','Memory Ocean DB','Relic Radiation','Океан / Посейдон','Анахита','Лаух Махфуз','Chalchiuhtlicue','Книга Жизни','Olokun','Apsu','Aqua Permanens','Жрица-Луна','Нептун','Kan water','Matrika memory','Akshobhya','Nommo waters','Ocean memory','Memory Lake','Самскары (Кармические Отпечатки)'],
  'prithvi': ['Притхви','Геб / базальт','Малкут','Земля маиса','Мать-Сыра Земля','Йорд','Кунь / земля','Кенома-материя','Куни-тама','Кернуннос / земля','Снежная гора','Камень основания','Кость Предка','Body Frequency','Hardware Layer','Planetary Crust','Гея / Омфал','Gayomart','Kaaba / Qibla Stone','Tlaltecuhtli','Corpus Christi','Ile / Onile','Ki / Aruru','Lead','XV Дьявол','Сатурн/Земля','Kun earth','Prithvi tattva','Kshitigarbha','Lebé Earth','Temple Stone','Hardware Substrate','Пранава-деха (Тело Света)'],
  'akasha': ['Акаша','Нут / Дуат-пространство','Эйн Соф / Даат','Небесные слои','Правь / Навь мост','Гиннунгагап','Уцзи / Тайцзи','Плерома','Ма','Огам-пространство','Дхармадхату','Купол Софии','Бубен-мировое дерево','64-Codon Field','Cloud-Akasha','Dark Field','Хаос / Эфир','Zurvan','Barzakh','Omeyocan','Апофатическая Тьма','Ashe Field','An-Ki Gap','Vas Hermeticum','XXI Мир','Зодиакальное поле','Wuji / Taiji','Akasha tattva','Dharmadhatu','Cosmic Egg','Akashic Grid','Latent Space','Чидакаша (Пространство Сознания)'],
  'tejas': ['Теджас','Хор / фараонский свет','Тиферет-царственность','Солнечный герой','Перун / княжий свет','Один / Тор-лидер','Цянь-дракон','Пневматический вождь','Император-ками','Луг','Падмасамбхава','Василевс','Громовой Шаман',"Life's Work Radiance",'Intent Beacon','Nova Commander','Зевс','Khvarenah','Qutb','Huitzilopochtli-Tlatoani','Рыцарь Грааля','Shango King','Gilgamesh','Rubedo Rex','IV Император','Солнце/Лев','Qian dragon','Bhairava Tejas','Padmasambhava','Sirius blaze','Crystal Regent','Interface Presence','Маха-деха (Макрокосмическое Сознание)'],
  'dharma': ['Дхарма','Маат','Тиферет/Гевура закон','Священный счёт','Правь / Коляды Дар','Тюр / Wyrd','Дао / Ли','Закон Плеромы','Норито / порядок ками','Brehon Law','Ригден','Канон / Номос','Закон Костра','Alignment','Governance Contract','Cosmic Law','Фемида / Дике','Asha Vahishta','Al-Haqq / Al-Adl','Tonalpohualli','Lex Christi','Ofin Ifa','Marduk','Lex Hermetica','XI Правосудие','Сатурн/Юпитер','Hexagram 11','36 Tattva Order','Dharma Wheel','Sigui Law','Council of Seven','Alignment Constitution','Дикша и Садхана'],
  'karma': ['Карма','Суд Осириса','Гвура-Малкут причинность','Девять дорог','Коло / Родовая отдача','Норны','Ба-гуа возврата','Архонтическая петля','Энма / карма','Гейс / судьба','Kālacakra Ledger','Пасхальный круг','Узел Предков','Programming Partners','Causal Log','Gravity Ledger','Мойры','Chinvat-Rashnu','Mizan / Sirat','Mictlan','Суд Милости','Egungun','Nam-Tar','Solve et Coagula','Колесо-Суд','Узлы/Сатурн','Hexagram 18/return','Karma Mala','Yama/Karma','Ancestral reckoning','Flood Ledger','Audit Log','Сансара (Колесо Перерождений)'],
};

export const MATRIX_AGENTS_NOTE = 'Сетка 21×33 = 693 лика Источника: 21 Агент (принцип) × 33 матрицы (интерфейса). Один Источник — разные окна. Подтверждает ПРИНЦИП ПОЛНОТЫ: каждая матрица несёт все 21 принципа. Канон: Master Codex §4 (21×32) + Матрица 33 Адвайта. Хранение agent-major; колонки — по MATRIX_AGENTS_ORDER. Advisory: компас, не рельсы.';

function matrixOrderIndex(matrix) {
  const key = (matrix && matrix.name) ? matrix.name : matrix;
  return MATRIX_AGENTS_ORDER.indexOf(key);
}
function agentIdOf(idOrN) {
  if (typeof agentInfo === 'function') { const a = agentInfo(idOrN); if (a) return a.id; }
  return (idOrN && idOrN.id) ? idOrN.id : idOrN;
}
export function matrixAgent(matrix, agentIdOrN) {
  const id = agentIdOf(agentIdOrN);
  const col = matrixOrderIndex(matrix);
  const row = MATRIX_AGENTS_GRID[id];
  if (!row || col < 0) return null;
  return row[col] != null ? row[col] : null;
}
export function matrixFullSpine(matrix) {
  const col = matrixOrderIndex(matrix);
  if (col < 0) return null;
  const out = {};
  for (const id of Object.keys(MATRIX_AGENTS_GRID)) out[id] = MATRIX_AGENTS_GRID[id][col];
  return out;
}
export function agentAcrossMatrices(agentIdOrN) {
  const id = agentIdOf(agentIdOrN);
  const row = MATRIX_AGENTS_GRID[id];
  if (!row) return null;
  const out = {};
  MATRIX_AGENTS_ORDER.forEach((k, i) => { out[k] = row[i]; });
  return out;
}
export function matrixAgentsTable() {
  return Object.keys(MATRIX_AGENTS_GRID).map(id => ({ agent: id, faces: agentAcrossMatrices(id) }));
}

/* ── ПОЗИЦИЯ АВТОРА И РЕЖИМ ПОДСКАЗОК (компас, не рельсы) ── */

// STANCE — мета-слой НАД каноном. Описывает, КАК фундамент относится к игре:
// он советует и корректирует, но всегда оставляет свободу творчества автору.
export const STANCE = {
  id: 'author-synthesizer',
  role: 'Автор-Созидатель над каноном (вышел за пределы выданных концепций)',
  mode: 'advisory',          // 'advisory' = только советы; НИКОГДА не 'enforcing'
  enforces: false,           // ядро не блокирует и не гейтит действия игры
  metaphor: 'компас, а не рельсы',
  principles: [
    'Канон — палитра и сырьё, а не догма; автор волен играть всеми традициями.',
    'Подсказки — совет, который можно принять, переосмыслить или отвергнуть.',
    'Свобода творчества в проекте сохраняется всегда.',
  ],
  adaptation: {
    audience: 'современный человек',
    ageBarrier: false,       // без возрастных ограничений
    depth: 'послойно, по готовности (раскрытие, а не запрет)',
    note: 'Глубина дозируется готовностью игрока, а не возрастным гейтом.',
  },
  doors: ['chakras7', 'meres9', 'theosophy7', 'advaita', 'bailey', 'ra',
    'koshas', 'tattvas', 'bhumis', 'dhyanas', 'jyotish', 'vastu', 'dao',
    'slavic', 'kabbalah', 'gunas', 'kleshas', 'purusharthas', 'lokas', 'kingdoms'],
};

// suggest(state) — ЕДИНСТВЕННЫЙ способ, которым ядро влияет на игру: мягкие
// подсказки. НИЧЕГО не блокирует и не пишет. Возвращает массив советов
// (advisory:true). state (всё опционально): { chakra?, mere?, density?,
// awareness?, honesty? }. Игра вольна использовать, изменить или игнорировать.
export function suggest(state = {}) {
  const tips = [];
  const add = (id, text, ref) => tips.push({ id, text, ref, advisory: true });

  // язык игрока: если он мыслит чакрами — переводим в меры Мастера (не заставляем)
  if (state.chakra != null) {
    const d = chakraToDimension(state.chakra);
    if (d) add('bridge.chakra',
      'Ты на чакре ' + state.chakra + '. На языке Мастера это мера ' + d.n +
      ' (триада «' + d.triad + '»). Любая дверь ведёт к одной вершине.',
      'bridgeRow(' + d.n + ')');
  }

  // плотность Выбора (Ра) — ориентир оси эгоцентризм→альтруизм, не правило
  if (state.density === 3 || state.density == null) {
    add('ra.choice',
      'Мы в 3-й плотности — плотности Выбора (служение себе ↔ служение другим). ' +
      'Это компас оси LOCKS, а не приказ: выбор всегда за тобой.',
      'RA_DENSITIES / LOCKS');
  }

  // критерий пути — близость к реальности (Адвайта/honesty), мягкое напоминание
  if (typeof state.honesty === 'number' && state.honesty < 0.5) {
    add('reality.criterion',
      'Критерий пути — близость к реальности (дез-иллюзия), а не позитив/негатив. ' +
      'Если честность к себе проседает — это лишь подсказка компаса, не приговор.',
      'REALITY_CRITERION / ADVAYTA');
  }

  return tips;
}

/* ── ЭКСПОРТ В WINDOW (для не-модульных страниц и 3D-движка) ── */
const AwaraLight = {
  LIGHT_VERSION, REALITY_CRITERION,
  GUNAS, GUNA_IDS, ELEMENTS, ELEMENT_IDS,
  SENSES, SENSE_IDS, INNER_SENSE, SENSES_NOTE,
  BODIES, BODY_IDS, PRISON_BODIES, PRISON_BODY_IDS, PRISON_NOTE,
  THEOSOPHY, THEOSOPHY_IDS, THEOSOPHY_NOTE,
  CHAKRAS, CHAKRA_NS, CHAKRAS_NOTE,
  DIMENSIONS, DIMENSION_TRIADS, DIMENSIONS_NOTE,
  ADVAYTA, BAILEY_RAYS, BAILEY_PLANES, BAILEY_CONSTITUTION, BAILEY_NOTE,
  RA_RAYS, RA_DENSITIES, RA_NOTE,
  RA, CHATURA_LOKA, LOCKS, EFIR, PERCEPTION_RAY, SOBOR,
  STATUSES, STATUS_IDS,
  LEVELS, LEVEL_IDS, levelIndexById,
  emptyProgress, currentLevel, elementUnlocked, senseElement, bodyElement,
  dimensionInfo, chakraInfo, theosophyInfo,
  chakraToDimension, dimensionToChakra, theosophyForChakra,
  raForChakra, densityInfo, baileyPlaneForChakra, baileyRayInfo,
  bridgeRow, bridgeTable,
  MEGA_NOTE, KOSHAS, KOSHA_IDS, TATTVAS, TATTVA_LEVELS, BHUMIS, DHYANAS,
  JYOTISH, VASTU, DAO, SLAVIC_RODNIKI, KABBALAH, KLESHAS, PURUSHARTHAS,
  LOKAS, KINGDOMS, ASCENT, GAME_OF_ASCENT,
  koshaForChakra, bhumiForChakra, bhumiInfo, jyotishForChakra, rodnikForMere,
  sefirotForChakra, ascentRow, ascentTable, doorsForChakra, megaBridgeRow,
  STANCE, suggest,
  MATRIX_BRIDGE, MATRIX_KEYS, MATRIX_PATTERNS, MATRIX_BRIDGE_NOTE,
  matrixBridge, matricesForChakra, matrixGraha, matrixPole,
  matrixBridgeTable, matrixChakraHistogram, transformThroughSpine,
  AGENTS_21, AGENT_IDS, AGENT_RAYS, AGENTS_21_NOTE,
  agentInfo, agentsForRay, agentsForGuna, agentsForGraha, agentsForVastu, agentOfficeAddress,
  MATRIX_AGENTS_ORDER, MATRIX_AGENTS_GRID, MATRIX_AGENTS_NOTE,
  matrixAgent, matrixFullSpine, agentAcrossMatrices, matrixAgentsTable,
  bodyGrown,
  ZONES, ZONE_IDS, zoneState, allZoneStates, couplings, selfTest,
};
if (typeof window !== 'undefined') window.AwaraLight = AwaraLight;
export default AwaraLight;
