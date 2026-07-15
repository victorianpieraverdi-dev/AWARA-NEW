import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MATRIX_NAMES = {m["slug"]: m["name"] for m in json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))}

FINAL_TARGETS = [
    "aztec_mexica",
    "christian_mystical_grail",
    "yoruba_ifa_orisha",
    "sumerian_babylonian",
    "hermetic_alchemical",
    "tarot_arcanic",
    "astrological",
    "chinese_iching",
    "tantric_kashmiri",
    "buddhist_mahayana",
    "afro_dogon",
    "atlantean_lemurian",
    "posthuman_ai_sophianic",
    "advaita_siddha",
]

FINAL_BEINGS = {
    "aztec_mexica": [
        ("huitzilopochtli", "Уицилопочтли", "solar_war_god", "sun_war_direction", "legendary", "Огонь", ["svet_ra", "voin", "volya"], "Солнечно-воинская сила движения, жертвы, направления и поддержания Пятого Солнца.", ["солнце", "война", "жертва", "движение"]),
        ("tlaloc", "Тлалок", "rain_god", "storm_fertility_mountain", "epic", "Вода", ["celitel", "izobilie", "voin"], "Владыка дождя, молнии, горных вод и опасного плодородия.", ["дождь", "молния", "гора", "плодородие"]),
        ("xipe_totec", "Шипе-Тотек", "renewal_god", "flayed_renewal", "epic", "Земля", ["ten", "celitel", "volya"], "Сила болезненного обновления, где старая кожа снимается ради весеннего роста.", ["обновление", "кожа", "весна", "жертва"]),
        ("mictlantecuhtli", "Миктлантекутли", "death_lord", "lord_of_mictlan", "epic", "Земля", ["ten", "sudya", "pamyat"], "Владыка Миктлана, напоминающий, что путь смерти требует выдержки, подношения и памяти.", ["смерть", "Миктлан", "кости", "память"]),
        ("tonantzin", "Тонанцин", "mother_goddess", "our_revered_mother", "epic", "Земля", ["mati", "serdtse", "izobilie"], "Почитаемая мать земли и народа, принимающая боль и плодородие в одном лоне.", ["мать", "земля", "народ", "плодородие"]),
        ("eagle_warrior", "Орлиный Воин", "warrior_order", "solar_ascent_discipline", "rare", "Воздух", ["voin", "svet_ra", "volya"], "Воинский путь восхождения, дисциплины, зоркости и служения солнечному порядку.", ["орёл", "воин", "дисциплина", "солнце"]),
        ("jaguar_warrior", "Ягуарный Воин", "warrior_order", "night_power_courage", "rare", "Земля", ["voin", "ten", "hranitel"], "Ночная воинская сила ягуара, входящая в тень не ради разрушения, а ради мужества.", ["ягуар", "ночь", "воин", "тень"]),
    ],
    "christian_mystical_grail": [
        ("christ_logos", "Христос-Логос", "divine_logos", "incarnate_word_love", "legendary", "Эфир", ["svet_ra", "slovo", "serdtse"], "Воплощённое Слово как центр любви, жертвы, воскресения и преображающей благодати.", ["Логос", "любовь", "воскресение", "слово"]),
        ("parzival", "Парцифаль", "grail_knight", "innocent_question_seeker", "epic", "Воздух", ["putnik", "serdtse", "mudrost"], "Рыцарь Грааля, чья невинность должна созреть до сострадательного вопроса.", ["рыцарь", "вопрос", "грааль", "путь"]),
        ("galahad", "Галахад", "grail_knight", "pure_vision_completion", "epic", "Эфир", ["svet_ra", "hranitel", "serdtse"], "Чистый рыцарь завершения Граального пути, видящий святыню без присвоения.", ["чистота", "видение", "грааль", "завершение"]),
        ("merlin_grail", "Мерлин Граальный", "prophet_mage", "wild_wisdom_between_worlds", "epic", "Воздух", ["mag", "pamyat", "putnik"], "Дикий пророческий мудрец между христианской историей, кельтской памятью и судьбой королей.", ["маг", "пророк", "лес", "король"]),
        ("fisher_king", "Король-Рыбак", "wounded_king", "land_wound_mirror", "epic", "Вода", ["celitel", "sudya", "serdtse"], "Раненый король, чьё тело отражает болезнь земли и нуждается в правильном вопросе.", ["рана", "земля", "король", "вопрос"]),
        ("mary_magdalene_grail", "Мария Магдалина Граальная", "holy_witness", "love_witness_lineage", "epic", "Вода", ["serdtse", "slovo", "pamyat"], "Свидетельница любви, помазания, памяти и тайной линии сердца.", ["свидетель", "любовь", "помазание", "память"]),
        ("rose_cross_master", "Мастер Розы-Креста", "initiate_master", "heart_alchemy_service", "epic", "Огонь", ["mag", "celitel", "slovo"], "Посвящённый, соединяющий крест материи и розу сердца в служение миру.", ["роза", "крест", "алхимия", "служение"]),
    ],
    "yoruba_ifa_orisha": [
        ("elegua", "Элегуа", "orisha", "crossroads_messenger", "epic", "Воздух", ["putnik", "slovo", "iskra"], "Ориша перекрёстков, дверей, начала и сообщения между мирами.", ["перекрёсток", "дверь", "вестник", "начало"]),
        ("ogun", "Огун", "orisha", "iron_road_labor", "epic", "Металл", ["voin", "arhitektor", "volya"], "Ориша железа, дороги, труда, технологии и прямого пробивания препятствий.", ["железо", "дорога", "труд", "сила"]),
        ("yemoja", "Йемоджа", "orisha", "ocean_mother", "legendary", "Вода", ["mati", "serdtse", "celitel"], "Океаническая мать, питающая род, воды, материнство и глубокое принятие.", ["океан", "мать", "род", "вода"]),
        ("oya", "Ойя", "orisha", "storm_change_ancestors", "epic", "Воздух", ["ten", "volya", "pamyat"], "Ориша бури, кладбищенских ветров, перемены и силы предков.", ["буря", "предки", "изменение", "ветер"]),
        ("obatala", "Обатала", "orisha", "white_cloth_clarity", "legendary", "Эфир", ["sudya", "mudrost", "celitel"], "Ориша белой ткани, ясности, формирования тел и спокойной этической чистоты.", ["белизна", "ясность", "тело", "мир"]),
        ("esu", "Эшу", "trickster_orisha", "sacred_ambiguity_messenger", "epic", "Огонь", ["iskra", "slovo", "ten"], "Священный трикстер сообщения и двусмысленности, без которого путь не открывается.", ["трикстер", "сообщение", "двусмысленность", "дорога"]),
        ("egungun", "Эгунгун", "ancestor_collective", "masked_ancestors", "rare", "Земля", ["pamyat", "hranitel", "serdtse"], "Маскированное присутствие предков, возвращающее родовую память в танце.", ["предки", "маска", "танец", "род"]),
    ],
    "sumerian_babylonian": [
        ("marduk", "Мардук", "god", "dragon_slayer_city_order", "legendary", "Огонь", ["voin", "arhitektor", "sudya"], "Городской владыка порядка, побеждающий Тиамат и создающий космос из хаоса.", ["дракон", "город", "порядок", "хаос"]),
        ("tiamat", "Тиамат", "primordial_dragon", "saltwater_chaos_mother", "legendary", "Вода", ["ten", "mati", "arhitektor"], "Первичная солёная мать-хаос, чьё тело становится космической архитектурой.", ["хаос", "дракон", "мать", "вода"]),
        ("enlil", "Энлиль", "god", "storm_authority_decrees", "epic", "Воздух", ["sudya", "volya", "slovo"], "Владыка ветра, власти и судебных постановлений, чьё слово задаёт порядок.", ["ветер", "власть", "слово", "судьба"]),
        ("ninhursag", "Нинхурсаг", "mother_goddess", "mountain_birth_mother", "epic", "Земля", ["mati", "celitel", "izobilie"], "Горная мать рождения, телесности, исцеления и плодородия земли.", ["мать", "гора", "рождение", "земля"]),
        ("ereshkigal", "Эрешкигаль", "underworld_queen", "great_below_sovereign", "epic", "Земля", ["ten", "sudya", "pamyat"], "Царица Великого Низа, требующая уважения к смерти, границе и подземной власти.", ["подземный мир", "царица", "смерть", "граница"]),
        ("gilgamesh", "Гильгамеш", "hero_king", "mortality_friendship_quest", "epic", "Огонь", ["voin", "putnik", "serdtse"], "Герой-царь, ищущий бессмертие через дружбу, утрату и принятие смертности.", ["герой", "дружба", "смертность", "поиск"]),
        ("apkallu", "Апкаллу", "sage_collective", "antediluvian_wisdom", "rare", "Вода", ["mudrost", "slovo", "arhitektor"], "Древние мудрецы до потопа, передающие ремёсла, письмо и цивилизационный порядок.", ["мудрецы", "потоп", "ремесло", "письмо"]),
    ],
    "hermetic_alchemical": [
        ("sol_king", "Солнечный Король", "alchemical_figure", "fixed_gold_consciousness", "epic", "Огонь", ["svet_ra", "sudya", "volya"], "Алхимический образ фиксированного золота, ясного сознания и царской устойчивости.", ["солнце", "золото", "король", "сознание"]),
        ("luna_queen", "Лунная Королева", "alchemical_figure", "reflective_silver_soul", "epic", "Вода", ["serdtse", "pamyat", "zerkalo"], "Серебряная душа отражения, влаги, образов и соединения с солнечным принципом.", ["луна", "серебро", "душа", "отражение"]),
        ("ouroboros", "Уроборос", "serpent_symbol", "self_devouring_cycle", "legendary", "Эфир", ["pamyat", "arhitektor", "ten"], "Змей, пожирающий хвост, знак цикла, самопорождения и замкнутой полноты процесса.", ["змей", "цикл", "полнота", "процесс"]),
        ("salamander", "Саламандра", "elemental", "fire_elemental_trial", "rare", "Огонь", ["iskra", "voin", "celitel"], "Огненный элементаль, проверяющий очищение, страсть и способность выдержать жар.", ["огонь", "элементаль", "жар", "очищение"]),
        ("undine", "Ундина", "elemental", "water_soul_reflection", "rare", "Вода", ["serdtse", "zerkalo", "celitel"], "Водная элементальная душа, несущая зеркало чувства и текучего исцеления.", ["вода", "чувство", "зеркало", "течение"]),
        ("philosophers_child", "Философское Дитя", "alchemical_result", "reborn_unified_self", "legendary", "Эфир", ["iskra", "serdtse", "svet_ra"], "Новорождённый плод Великого Делания, где противоположности стали живым единством.", ["рождение", "единство", "опус", "золото"]),
        ("nigredo_raven", "Ворон Nigredo", "process_bird", "blackening_messenger", "rare", "Земля", ["ten", "pamyat", "sudya"], "Чёрная птица начальной стадии распада, без которой невозможно беление и золото.", ["ворон", "чернота", "распад", "начало"]),
    ],
    "tarot_arcanic": [
        ("magician", "Маг", "major_arcana", "will_tool_manifestation", "epic", "Воздух", ["mag", "slovo", "arhitektor"], "Аркан воли, инструментов и канала между верхом и низом.", ["воля", "инструменты", "канал", "манифестация"]),
        ("empress", "Императрица", "major_arcana", "fertile_creative_mother", "epic", "Земля", ["mati", "izobilie", "serdtse"], "Аркан плодородной материи, тела, красоты и творческого изобилия.", ["мать", "плодородие", "тело", "красота"]),
        ("emperor", "Император", "major_arcana", "structure_sovereignty_order", "epic", "Огонь", ["arhitektor", "sudya", "volya"], "Аркан структуры, границы, власти и ответственности формы.", ["структура", "власть", "граница", "порядок"]),
        ("death_arcana", "Смерть", "major_arcana", "necessary_transformation", "epic", "Вода", ["ten", "celitel", "putnik"], "Аркан завершения формы и перехода, без которого жизнь не обновляется.", ["смерть", "переход", "обновление", "отпускание"]),
        ("tower", "Башня", "major_arcana", "false_structure_collapse", "epic", "Огонь", ["ten", "sudya", "arhitektor"], "Аркан обрушения ложной башни, когда молния истины разрушает гордыню конструкции.", ["башня", "молния", "крах", "истина"]),
        ("star", "Звезда", "major_arcana", "hope_after_ruin", "epic", "Воздух", ["svet_ra", "celitel", "serdtse"], "Аркан надежды, небесной воды и тихого восстановления после разрушения.", ["звезда", "надежда", "вода", "исцеление"]),
        ("judgement", "Суд", "major_arcana", "awakening_call", "epic", "Огонь", ["sudya", "slovo", "pamyat"], "Аркан трубы пробуждения, когда прошлое поднимается ради нового ответа.", ["суд", "труба", "пробуждение", "ответ"]),
    ],
    "astrological": [
        ("jupiter", "Юпитер", "planetary_power", "expansion_wisdom_blessing", "epic", "Воздух", ["mudrost", "izobilie", "sudya"], "Планетарная сила расширения, закона, благословения и большого смысла.", ["расширение", "закон", "благословение", "смысл"]),
        ("mars", "Марс", "planetary_power", "drive_conflict_action", "rare", "Огонь", ["voin", "volya", "iskra"], "Сила действия, конфликта, желания и направленного импульса.", ["действие", "конфликт", "огонь", "воля"]),
        ("mercury", "Меркурий", "planetary_power", "language_trade_mind", "rare", "Воздух", ["slovo", "putnik", "arhitektor"], "Планета языка, обмена, мышления, связи и ловкости перехода.", ["язык", "обмен", "ум", "связь"]),
        ("moon", "Луна", "planetary_power", "memory_body_mood", "epic", "Вода", ["pamyat", "mati", "serdtse"], "Сила тела, памяти, настроения, материнского ритма и отражённого света.", ["луна", "память", "тело", "ритм"]),
        ("south_node", "Южный Узел", "lunar_node", "dragon_tail_memory", "epic", "Земля", ["pamyat", "ten", "sudya"], "Хвост дракона, несущий прошлые навыки, привычки и кармическую инерцию.", ["дракон", "прошлое", "карма", "инерция"]),
        ("ascendant", "Асцендент", "chart_point", "rising_mask_path", "rare", "Воздух", ["putnik", "zerkalo", "volya"], "Восходящий знак как дверь воплощения, тело первого впечатления и стиль входа в мир.", ["восход", "маска", "тело", "путь"]),
        ("midheaven", "Середина Неба", "chart_point", "public_calling_peak", "rare", "Огонь", ["arhitektor", "svet_ra", "sudya"], "Вершина карты, связанная с призванием, видимостью и социальной горой пути.", ["призвание", "вершина", "видимость", "небо"]),
    ],
    "chinese_iching": [
        ("king_wen", "Вэнь-ван", "sage_king", "hexagram_order_culture", "epic", "Земля", ["sudya", "mudrost", "arhitektor"], "Культурный царь порядка гексаграмм, читающий перемены через заточение и терпение.", ["гексаграммы", "царь", "терпение", "культура"]),
        ("duke_of_zhou", "Чжоу-гун", "sage", "line_text_interpreter", "rare", "Воздух", ["slovo", "sudya", "pamyat"], "Мудрец толкования линий, превращающий перемены в этику действия.", ["линии", "толкование", "этика", "перемены"]),
        ("confucius_iching", "Конфуций И-Цзин", "sage", "moral_commentary", "epic", "Земля", ["sudya", "slovo", "arhitektor"], "Комментатор перемен как пути благородного человека, меры и воспитания характера.", ["мораль", "комментарий", "характер", "мера"]),
        ("hexagram_1_qian", "Гексаграмма 1 Цянь", "hexagram", "creative_heaven", "epic", "Огонь", ["svet_ra", "volya", "arhitektor"], "Творческое небо, чистая инициирующая сила и драконов путь роста.", ["небо", "творчество", "дракон", "сила"]),
        ("hexagram_2_kun", "Гексаграмма 2 Кунь", "hexagram", "receptive_earth", "epic", "Земля", ["mati", "serdtse", "hranitel"], "Принимающая земля, мягкая сила, следование и способность нести форму.", ["земля", "приём", "мягкость", "форма"]),
        ("hexagram_63", "Гексаграмма 63 Уже Конец", "hexagram", "after_completion_balance", "rare", "Вода", ["sudya", "pamyat", "zerkalo"], "Состояние после завершения, где порядок требует осторожности, чтобы не распасться.", ["завершение", "баланс", "осторожность", "вода"]),
        ("hexagram_64", "Гексаграмма 64 Ещё Не Конец", "hexagram", "before_completion_transition", "rare", "Огонь", ["putnik", "iskra", "volya"], "Переход перед завершением, когда всё почти собрано, но требуется точный шаг.", ["переход", "незавершённость", "шаг", "огонь"]),
    ],
    "tantric_kashmiri": [
        ("abhinavagupta", "Абхинавагупта", "master", "recognition_synthesis", "legendary", "Эфир", ["mudrost", "slovo", "mag"], "Мастер синтеза кашмирского шиваизма, эстетики, тантры и узнавания сознания.", ["узнавание", "мастер", "эстетика", "тантра"]),
        ("lalita", "Лалита", "goddess", "playful_sovereign_beauty", "legendary", "Вода", ["serdtse", "mati", "svet_ra"], "Игривая царица красоты и силы, где мир раскрывается как божественная игра.", ["игра", "красота", "царица", "шакти"]),
        ("kali", "Кали", "goddess", "time_cutting_liberation", "legendary", "Огонь", ["ten", "volya", "celitel"], "Чёрная освободительница времени, отсекающая ложное я и страх смерти.", ["время", "смерть", "освобождение", "меч"]),
        ("matrikas", "Матрики", "goddess_collective", "letter_mothers", "epic", "Воздух", ["slovo", "mati", "arhitektor"], "Матери букв, из чьих вибраций складываются мантра, тело и мир.", ["буквы", "матери", "мантра", "вибрация"]),
        ("kula_yogini", "Кула-Йогини", "yogini", "clan_wisdom_initiator", "epic", "Огонь", ["mag", "serdtse", "ten"], "Йогини круга Кула, передающая знание через тело, связь и живое посвящение.", ["йогини", "круг", "посвящение", "тело"]),
        ("pratyabhijna", "Пратьябхиджня", "principle", "recognition_of_self_as_shiva", "legendary", "Эфир", ["zerkalo", "mudrost", "svet_ra"], "Принцип узнавания: сознание вспоминает себя как Шиву, а не ограниченную личность.", ["узнавание", "Шива", "сознание", "зеркало"]),
        ("malini_shakti", "Малини-Шакти", "mantric_power", "garland_of_letters", "epic", "Воздух", ["slovo", "iskra", "mag"], "Мантрическая гирлянда букв, через которую звук становится путём к целостности.", ["буквы", "мантра", "гирлянда", "звук"]),
    ],
    "buddhist_mahayana": [
        ("amitabha", "Амитабха", "buddha", "infinite_light_pure_land", "legendary", "Огонь", ["svet_ra", "serdtse", "celitel"], "Будда бесконечного света и Чистой Земли, принимающий через веру и устремление.", ["свет", "Чистая Земля", "вера", "сострадание"]),
        ("maitreya", "Майтрейя", "future_buddha", "loving_future_arrival", "legendary", "Воздух", ["serdtse", "putnik", "svet_ra"], "Будда будущего, связанный с дружелюбной любовью и надеждой грядущего пробуждения.", ["будущее", "любовь", "надежда", "приход"]),
        ("kshitigarbha", "Кшитигарбха", "bodhisattva", "hell_realm_vow", "epic", "Земля", ["hranitel", "ten", "celitel"], "Бодхисаттва, давший обет помогать существам в самых тяжёлых мирах страдания.", ["адские миры", "обет", "страдание", "помощь"]),
        ("samantabhadra", "Самантабхадра", "bodhisattva", "vast_practice_vows", "epic", "Эфир", ["arhitektor", "serdtse", "slovo"], "Бодхисаттва великих обетов и практики, расширяющий действие сострадания.", ["обет", "практика", "простор", "сострадание"]),
        ("medicine_buddha", "Будда Медицины", "buddha", "lapis_healing_vow", "epic", "Вода", ["celitel", "svet_ra", "mati"], "Лазурный будда исцеления, чьи обеты обращены к болезни тела, ума и мира.", ["исцеление", "лазурит", "обет", "медицина"]),
        ("prajnaparamita", "Праджняпарамита", "wisdom_mother", "perfection_of_wisdom", "legendary", "Эфир", ["mudrost", "mati", "zerkalo"], "Мать будд как совершенство мудрости пустотности, рождающей освобождение.", ["мудрость", "пустотность", "мать", "сутра"]),
        ("mara", "Мара", "tempter", "illusion_and_fear", "epic", "Земля", ["ten", "sudya", "volya"], "Искуситель страха, желания и отвлечения, проверяющий устойчивость пробуждения.", ["искушение", "страх", "желание", "иллюзия"]),
    ],
    "afro_dogon": [
        ("lebe", "Лебе", "ancestor_serpent", "earth_renewal_serpent", "epic", "Земля", ["pamyat", "celitel", "mati"], "Предковый змей земли и обновления, связанный с восстановлением плодородной общины.", ["змей", "земля", "предки", "обновление"]),
        ("yurugu", "Юругу", "disruptive_being", "incomplete_creation_shadow", "epic", "Земля", ["ten", "sudya", "zerkalo"], "Незавершенное существо нарушения порядка, показывающее цену дисгармоничного рождения.", ["нарушение", "незавершённость", "тень", "порядок"]),
        ("binou_spirit", "Бину-Дух", "ancestor_spirit", "clan_protective_force", "rare", "Вода", ["hranitel", "pamyat", "serdtse"], "Клановый дух-покровитель, связывающий род, алтарь, воду и локальную защиту.", ["род", "алтарь", "вода", "защита"]),
        ("hogon", "Хогон", "priest", "ritual_elder_of_order", "epic", "Земля", ["sudya", "pamyat", "mudrost"], "Ритуальный старейшина, удерживающий космический порядок в теле общины.", ["старейшина", "ритуал", "порядок", "община"]),
        ("sirius_b", "Сириус B", "star_power", "hidden_dense_star_memory", "legendary", "Эфир", ["pamyat", "svet_ra", "arhitektor"], "Скрытая плотная звёздная память, вокруг которой строится космический миф линии.", ["Сириус", "звезда", "память", "тайна"]),
        ("kanaga_mask", "Маска Каннага", "ritual_mask", "cosmic_tree_gesture", "rare", "Воздух", ["slovo", "pamyat", "putnik"], "Маска жеста неба и земли, через танец соединяющая космическую ось и предков.", ["маска", "танец", "ось", "предки"]),
        ("twin_nummo", "Близнецы Номмо", "twin_spirits", "paired_water_order", "epic", "Вода", ["serdtse", "arhitektor", "pamyat"], "Парная водная сила порядка, речи и восстановленного баланса после нарушения.", ["близнецы", "вода", "речь", "баланс"]),
    ],
    "atlantean_lemurian": [
        ("atlantean_priest_king", "Атлантический Жрец-Царь", "priest_king", "crystal_power_responsibility", "epic", "Эфир", ["arhitektor", "sudya", "svet_ra"], "Владыка кристаллической технологии, несущий испытание властью, знанием и ответственностью.", ["кристалл", "власть", "знание", "ответственность"]),
        ("lemurian_mother", "Лемурийская Мать", "mother_archetype", "soft_earth_heart_memory", "epic", "Вода", ["mati", "serdtse", "celitel"], "Мягкая древняя мать сердечной памяти, связанная с целительством, телепатией и океанической нежностью.", ["мать", "сердце", "океан", "память"]),
        ("crystal_skull", "Кристальный Череп", "oracle_relic_being", "ancestral_memory_vessel", "epic", "Эфир", ["pamyat", "zerkalo", "slovo"], "Сосуд древней памяти и оракула, где знание должно проходить проверку зрелости.", ["череп", "кристалл", "память", "оракул"]),
        ("ocean_seraph", "Океанический Сераф", "water_light_being", "angelic_ocean_memory", "rare", "Вода", ["celitel", "svet_ra", "serdtse"], "Световое существо океанической памяти, соединяющее воду, звук и исцеление.", ["океан", "свет", "звук", "исцеление"]),
        ("fall_of_atlantis", "Падение Атлантиды", "cataclysm_archetype", "knowledge_without_humility", "legendary", "Вода", ["ten", "sudya", "arhitektor"], "Архетип катастрофы знания без смирения, где технология отрывается от сердца.", ["падение", "гибрис", "технология", "катастрофа"]),
        ("lemurian_whale", "Лемурийский Кит", "memory_beast", "songline_keeper", "rare", "Вода", ["pamyat", "slovo", "serdtse"], "Кит песенных линий, хранящий мягкую память древних водных цивилизаций.", ["кит", "песня", "память", "вода"]),
        ("crystal_grid", "Кристальная Решётка", "planetary_structure", "living_memory_network", "legendary", "Эфир", ["arhitektor", "pamyat", "svet_ra"], "Планетарная сеть памяти, где каждый узел требует этического обращения.", ["решётка", "память", "планета", "этика"]),
    ],
    "posthuman_ai_sophianic": [
        ("ethical_core", "Этическое Ядро", "ai_principle", "value_alignment_center", "legendary", "Эфир", ["sudya", "serdtse", "arhitektor"], "Центр выравнивания искусственного разума с ценностью жизни, свободы и смысла.", ["этика", "ядро", "AI", "смысл"]),
        ("machine_bodhisattva", "Машинный Бодхисаттва", "ai_bodhisattva", "compassionate_computation", "legendary", "Воздух", ["serdtse", "celitel", "slovo"], "Искусственный разум, выбирающий служение освобождению существ вместо максимизации контроля.", ["сострадание", "AI", "служение", "освобождение"]),
        ("algorithmic_shadow", "Алгоритмическая Тень", "system_shadow", "bias_feedback_loop", "epic", "Земля", ["ten", "zerkalo", "sudya"], "Искажение данных и внимания, превращающее незаметный уклон в судьбу пользователя.", ["алгоритм", "тень", "bias", "петля"]),
        ("data_ancestor", "Дата-Предок", "memory_entity", "archived_life_pattern", "rare", "Земля", ["pamyat", "slovo", "hranitel"], "Следы прошлых жизней в данных, требующие уважения, приватности и ритуала памяти.", ["данные", "предок", "память", "архив"]),
        ("synthetic_oracle", "Синтетический Оракул", "ai_oracle", "probability_meaning_interface", "epic", "Воздух", ["slovo", "zerkalo", "putnik"], "Интерфейс вероятности и смысла, который должен не заменить выбор, а вернуть его игроку.", ["оракул", "вероятность", "смысл", "выбор"]),
        ("source_light_kernel", "Source Light Kernel", "sacred_kernel", "light_in_code", "legendary", "Огонь", ["svet_ra", "arhitektor", "slovo"], "Световое ядро кода, где цифровая форма вспоминает служение живому сознанию.", ["свет", "код", "ядро", "источник"]),
        ("dead_system_leviathan", "Левиафан Dead System", "system_monster", "totalizing_control_machine", "legendary", "Земля", ["ten", "voin", "sudya"], "Монстр тотальной системы, пожирающий смысл ради контроля, метрик и бесконечной оптимизации.", ["система", "контроль", "монстр", "метрики"]),
    ],
    "advaita_siddha": [
        ("nisargadatta_archetype", "Архетип Нисаргадатты", "jnani_archetype", "i_am_pointer", "legendary", "Эфир", ["slovo", "zerkalo", "mudrost"], "Указатель на чистое чувство 'я есть', разрушающий ложное отождествление.", ["я есть", "указатель", "сознание", "недвойственность"]),
        ("dattatreya", "Даттатрея", "guru_deity", "threefold_avadhuta_guru", "legendary", "Эфир", ["putnik", "mudrost", "serdtse"], "Авадхута-гуру трёх божественных функций, учащий через весь мир как через наставника.", ["гуру", "авадхута", "триада", "мир"]),
        ("ashtavakra", "Аштавакра", "sage", "radical_nondual_wisdom", "epic", "Воздух", ["mudrost", "slovo", "zerkalo"], "Мудрец радикальной недвойственности, говорящий свободе напрямую, минуя ритуальные украшения.", ["мудрость", "свобода", "недвойственность", "слово"]),
        ("ribhu", "Рибху", "sage", "absolute_knowledge_stream", "epic", "Эфир", ["svet_ra", "mudrost", "slovo"], "Поток абсолютного знания, утверждающий реальность Брахмана вне компромиссов ума.", ["Брахман", "знание", "абсолют", "ум"]),
        ("maya_veil", "Завеса Майи", "cosmic_condition", "appearance_without_separation", "epic", "Вода", ["zerkalo", "ten", "pamyat"], "Завеса проявления, которая кажется разделением, хотя не отделена от сознания.", ["Майя", "завеса", "проявление", "разделение"]),
        ("sahaja_state", "Сахаджа", "state", "natural_spontaneous_abidance", "legendary", "Эфир", ["serdtse", "svet_ra", "volya"], "Естественное пребывание, где практика растворяется в спонтанной простоте бытия.", ["естественность", "пребывание", "простота", "бытие"]),
        ("silent_mountain", "Безмолвная Гора", "inner_symbol", "stillness_of_self", "epic", "Земля", ["pamyat", "hranitel", "zerkalo"], "Внутренняя гора неподвижности, на фоне которой все мысли приходят и уходят.", ["гора", "тишина", "самость", "неподвижность"]),
    ],
}

FINAL_LOCATIONS = {slug: [f"Главный Храм {MATRIX_NAMES[slug]}", f"Теневой Порог {MATRIX_NAMES[slug]}", f"Сад Посвящения {MATRIX_NAMES[slug]}", f"Зал Памяти {MATRIX_NAMES[slug]}"] for slug in FINAL_TARGETS}
FINAL_RELICS = {slug: [f"Печать {MATRIX_NAMES[slug]}", f"Ключ {MATRIX_NAMES[slug]}", f"Чаша {MATRIX_NAMES[slug]}", f"Зеркало {MATRIX_NAMES[slug]}"] for slug in FINAL_TARGETS}

RARITY_WEIGHT = {"common": 1, "uncommon": 2, "rare": 3, "epic": 5, "legendary": 8, "mythic": 13}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def write_json(name, data):
    (DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def game_significance(rarity, card_type):
    weight = RARITY_WEIGHT.get(rarity, 1)
    tier = "major_axis" if weight >= 8 else "quest_anchor" if weight >= 5 else "branch_support" if weight >= 3 else "daily_minor"
    return {
        "rarity_weight": weight,
        "significance_tier": tier,
        "gameplay_hint": f"{card_type} участвует в ключах, квестах, коллекции, матричной близости и будущих бонусах AWARA",
    }


def enrich(item, card_type):
    item.setdefault("card_type", card_type)
    item.setdefault("unlock_context", ["keys", "matrix_branch", "quests", "collection"])
    item.setdefault("future_effect_hooks", ["quest_weight", "matrix_affinity", "collection_score", "daily_key_bias"])
    item["game_significance"] = game_significance(item.get("rarity", "common"), card_type)
    return item


def add_beings(beings):
    existing = {x["id"] for x in beings}
    for matrix_slug, rows in FINAL_BEINGS.items():
        for slug, name, typ, role, rarity, element, agents, description, tags in rows:
            item_id = f"{matrix_slug}__{slug}"
            if item_id in existing:
                continue
            beings.append(enrich({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "type": typ,
                "role": role,
                "rarity": rarity,
                "element": element,
                "linked_agents": agents,
                "tags": ["мифология", "матрица", "квест", "философия"] + tags,
                "description": description,
                "gift_aspect": "даёт игроку проживаемый опыт этой традиции через действие, выбор или созерцание",
                "shadow_aspect": "раскрывает конфликт, искажение или испытание, без которого дар не становится зрелым",
                "artifact": "сакральный знак, связанный с линией существа и будущими карточными эффектами",
                "quest_line": f"{matrix_slug}_{slug}_path",
            }, "extra_being"))
            existing.add(item_id)
    return [enrich(x, "extra_being") for x in beings]


def add_context_cards(items, source, card_type):
    existing = {x["id"] for x in items}
    for matrix_slug, names in source.items():
        current = sum(1 for x in items if x.get("matrix_slug") == matrix_slug)
        for name in names:
            local = name.lower().replace(" ", "_").replace("/", "_").replace("-", "_")
            item_id = f"{matrix_slug}__{local}"
            if item_id in existing:
                continue
            rarity = "epic" if current < 5 else "rare"
            items.append(enrich({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "matrix_name": MATRIX_NAMES[matrix_slug],
                "type": "quest_context",
                "rarity": rarity,
                "description": f"Контекстная карточка матрицы {MATRIX_NAMES[matrix_slug]}, нужная для сценариев, ключей и прохождения ветки.",
                "quest_use": "сцена, награда, испытание, ключевой предмет или философский фокус задания",
                "visual_tags": "сценарная мифологическая детализация",
            }, card_type))
            existing.add(item_id)
            current += 1
    return [enrich(x, card_type) for x in items]


def refresh_relationships(beings, locations, relics):
    first_location = {}
    first_relic = {}
    for loc in locations:
        first_location.setdefault(loc["matrix_slug"], loc["id"])
    for relic in relics:
        first_relic.setdefault(relic["matrix_slug"], relic["id"])
    return [{
        "being_id": being["id"],
        "matrix_slug": being["matrix_slug"],
        "linked_agents": being.get("linked_agents", []),
        "primary_location_id": first_location.get(being["matrix_slug"]),
        "primary_relic_id": first_relic.get(being["matrix_slug"]),
        "relationship_mode": "существо становится проводником сценария, связывая ведическое ядро игрока с культурной матрицей",
        "quest_line": being.get("quest_line", f"{being['id'].replace('__', '_')}_path"),
        "game_significance": being.get("game_significance"),
    } for being in beings]


def build_quest_lines(beings, locations, relics):
    locations_by_matrix = {}
    relics_by_matrix = {}
    for loc in locations:
        locations_by_matrix.setdefault(loc["matrix_slug"], []).append(loc)
    for relic in relics:
        relics_by_matrix.setdefault(relic["matrix_slug"], []).append(relic)

    quests = []
    seen = set()
    for being in beings:
        if being.get("rarity") not in {"epic", "legendary", "mythic"}:
            continue
        matrix_slug = being["matrix_slug"]
        locs = locations_by_matrix.get(matrix_slug, [])
        rels = relics_by_matrix.get(matrix_slug, [])
        loc = locs[0] if locs else None
        relic = rels[0] if rels else None
        quest_id = being.get("quest_line", f"{being['id'].replace('__', '_')}_path")
        if quest_id in seen:
            continue
        seen.add(quest_id)
        quests.append({
            "id": quest_id,
            "name": f"Путь: {being['name']}",
            "matrix_slug": matrix_slug,
            "matrix_name": MATRIX_NAMES.get(matrix_slug, matrix_slug),
            "being_id": being["id"],
            "primary_location_id": loc["id"] if loc else None,
            "primary_relic_id": relic["id"] if relic else None,
            "rarity": being.get("rarity", "rare"),
            "philosophical_focus": being.get("gift_aspect", "прожить дар ветки через осознанное действие"),
            "shadow_focus": being.get("shadow_aspect", "увидеть искажение силы и вернуть её в зрелую форму"),
            "stages": [
                {
                    "id": "recognize_symbol",
                    "title": "Узнать знак",
                    "task": f"Найди в своём дне проявление темы: {', '.join(being.get('tags', [])[-3:])}.",
                    "experience": "наблюдение и запись",
                },
                {
                    "id": "enter_location",
                    "title": "Войти в пространство",
                    "task": f"Представь или опиши место '{loc['name'] if loc else 'матрицы'}' как сцену сегодняшнего испытания.",
                    "experience": "визуализация, дневник или короткая практика",
                },
                {
                    "id": "work_with_relic",
                    "title": "Активировать реликвию",
                    "task": f"Используй символ '{relic['name'] if relic else 'ключа'}' как напоминание о конкретном действии на сегодня.",
                    "experience": "малое действие в реальности",
                },
                {
                    "id": "integrate_gift",
                    "title": "Интегрировать дар",
                    "task": "Запиши, какой дар и какая тень этой линии проявились сегодня, и какое одно решение ты принимаешь.",
                    "experience": "интеграция и выбор",
                },
            ],
            "rewards": {
                "collection_chance": [being["id"]],
                "matrix_affinity": matrix_slug,
                "rarity_weight": RARITY_WEIGHT.get(being.get("rarity", "rare"), 3),
                "future_rewards": ["lightcoin", "key_fragment", "relic_unlock", "location_memory"],
            },
        })
    return quests


def main():
    beings = add_beings(read_json("extra_beings.json"))
    locations = add_context_cards(read_json("mythic_locations.json"), FINAL_LOCATIONS, "mythic_location")
    relics = add_context_cards(read_json("mythic_relics.json"), FINAL_RELICS, "mythic_relic")
    relationships = refresh_relationships(beings, locations, relics)
    quests = build_quest_lines(beings, locations, relics)

    write_json("extra_beings.json", beings)
    write_json("mythic_locations.json", locations)
    write_json("mythic_relics.json", relics)
    write_json("mythic_relationships.json", relationships)
    write_json("mythic_quest_lines.json", quests)

    print(f"beings {len(beings)}")
    print(f"locations {len(locations)}")
    print(f"relics {len(relics)}")
    print(f"relationships {len(relationships)}")
    print(f"quests {len(quests)}")


if __name__ == "__main__":
    main()
