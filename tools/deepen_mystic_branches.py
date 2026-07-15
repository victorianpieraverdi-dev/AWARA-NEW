import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MATRIX_NAMES = {m["slug"]: m["name"] for m in json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))}

TARGET = [
    "daoist",
    "gnostic",
    "shambhala",
    "julian_byzantine",
    "shamanic",
    "gene_keys",
    "technomagical",
    "cosmic_galactic",
    "zoroastrian",
    "islamic_sufi_nur",
]

DEEP_BEINGS = {
    "daoist": [
        ("zhuangzi", "Чжуан-цзы", "sage", "dream_butterfly_wisdom", "epic", "Воздух", ["mudrost", "zerkalo", "putnik"], "Мудрец парадокса и сна бабочки, растворяющий жёсткую границу между я, миром и Дао.", ["сон", "парадокс", "Дао", "свобода"]),
        ("eight_immortals", "Восемь Бессмертных", "immortal_collective", "folk_immortal_powers", "legendary", "Эфир", ["putnik", "celitel", "mag"], "Коллектив бессмертных, где разные социальные судьбы превращены в пути алхимической свободы.", ["бессмертие", "алхимия", "странствие", "дар"]),
        ("zhang_daoling", "Чжан Даолин", "celestial_master", "daoist_order_founder", "epic", "Земля", ["arhitektor", "slovo", "hranitel"], "Небесный Наставник, оформляющий связь с духовной бюрократией, талисманами и очищением общины.", ["талисман", "наставник", "порядок", "очищение"]),
        ("guanyin_daoist", "Гуаньинь", "compassion_figure", "mercy_that_hears", "epic", "Вода", ["serdtse", "celitel", "mati"], "Сострадательная слышащая сила, ставшая мостом между китайской религиозностью и милостью сердца.", ["сострадание", "вода", "слушание", "милость"]),
        ("jade_emperor", "Нефритовый Император", "celestial_ruler", "heavenly_bureaucracy", "legendary", "Эфир", ["sudya", "arhitektor", "svet_ra"], "Небесный владыка порядка, чинов, ритуальной иерархии и космической административной меры.", ["небо", "порядок", "император", "ритуал"]),
        ("queen_mother_of_west", "Си Ван Му Великая", "immortal_queen", "western_paradise_elixir", "legendary", "Земля", ["mati", "celitel", "hranitel"], "Царица Запада как владычица горного рая, бессмертия, тигровой силы и предельного эликсира.", ["персик", "бессмертие", "гора", "царица"]),
        ("white_tiger_west", "Белый Тигр Запада", "directional_beast", "metal_autumn_guardian", "rare", "Металл", ["voin", "sudya", "hranitel"], "Западный зверь металла, осени, строгости и очищающего отсечения лишнего.", ["тигр", "металл", "запад", "осень"]),
    ],
    "gnostic": [
        ("christos_aeon", "Христос-Эон", "aeon", "revealer_from_pleroma", "legendary", "Эфир", ["svet_ra", "slovo", "celitel"], "Плеромный открыватель пути, пробуждающий искру из сна архонтического мира.", ["откровение", "искра", "Плерома", "спасение"]),
        ("barbelo", "Барбело", "aeon", "first_thought_mother", "legendary", "Вода", ["mati", "mudrost", "serdtse"], "Первая Мысль и материнская полнота высших эонов, предшествующая разделению.", ["первая мысль", "мать", "эон", "полнота"]),
        ("demiurge", "Демиург", "false_creator", "blind_world_architect", "epic", "Земля", ["arhitektor", "ten", "sudya"], "Слепой строитель ограниченного мира, принимающий собственную конструкцию за абсолют.", ["ложный творец", "архитектор", "слепота", "мир"]),
        ("archons", "Архонты", "shadow_collective", "rulers_of_sleep", "epic", "Земля", ["ten", "sudya", "zerkalo"], "Коллектив сил сна, страха и подмены, удерживающий сознание в узком восприятии.", ["сон", "контроль", "страх", "подмена"]),
        ("mary_magdalene_gnostic", "Мария Магдалина Гностическая", "disciple_mystic", "apostle_of_inner_knowing", "epic", "Вода", ["serdtse", "slovo", "mudrost"], "Образ ученицы внутреннего знания, соединяющей любовь, свидетельство и тайное понимание.", ["знание", "любовь", "свидетель", "тайна"]),
        ("serpent_of_eden", "Змей Эдема", "revelatory_serpent", "forbidden_wisdom_trigger", "rare", "Огонь", ["iskra", "ten", "mudrost"], "Пороговый змей запретного знания, неоднозначный инициатор различения и падения.", ["змей", "знание", "запрет", "порог"]),
        ("hylic_shadow", "Гилическая Тень", "condition", "matter_bound_sleep", "rare", "Земля", ["ten", "pamyat", "sudya"], "Состояние полной привязанности к плотной материи и забвения внутренней искры.", ["материя", "сон", "забвение", "тяжесть"]),
    ],
    "shambhala": [
        ("rigden_king", "Царь Ригден", "shambhala_king", "hidden_king_of_dharma", "legendary", "Огонь", ["sudya", "svet_ra", "voin"], "Сокрытый царь Шамбалы, связанный с защитой Дхармы и будущей битвой ясного времени.", ["царь", "Шамбала", "Дхарма", "время"]),
        ("padmasambhava", "Падмасамбхава", "guru", "lotus_born_tamer", "legendary", "Огонь", ["mag", "ten", "celitel"], "Лотосорождённый учитель, укрощающий демонов как энергии пути и скрывающий терма для будущего.", ["гуру", "демоны", "терма", "лотос"]),
        ("vajrakilaya", "Ваджракилая", "wrathful_deity", "obstacle_piercing_phurba", "epic", "Огонь", ["voin", "hranitel", "ten"], "Гневная ваджрная сила, пронзающая препятствия и демонические узлы сознания.", ["гнев", "ваджра", "препятствия", "пхурба"]),
        ("mahakala", "Махакала", "dharmapala", "black_time_protector", "epic", "Эфир", ["hranitel", "ten", "sudya"], "Чёрный защитник Дхармы и времени, превращающий ужас в охрану пути.", ["защитник", "время", "чёрный", "Дхарма"]),
        ("dakini", "Дакини", "wisdom_feminine", "sky_dancer_initiator", "epic", "Воздух", ["iskra", "mag", "serdtse"], "Небесная танцовщица мудрости, внезапно раскрывающая живое знание вне привычной формы.", ["танец", "небо", "мудрость", "инициация"]),
        ("snow_lion", "Снежный Лев", "mythic_beast", "fearless_joy_guardian", "rare", "Воздух", ["hranitel", "serdtse", "voin"], "Снежный лев бесстрашной радости, охраняющий высокие перевалы и чистое видение.", ["лев", "снег", "радость", "страж"]),
        ("milarapa", "Миларепа", "yogi", "song_of_transformation", "epic", "Воздух", ["slovo", "ten", "celitel"], "Йогин песен, превращающий тяжёлую карму в пробуждение через практику и поэтическое свидетельство.", ["песня", "карма", "йогин", "трансформация"]),
    ],
    "julian_byzantine": [
        ("theotokos", "Богородица", "holy_mother", "protecting_mantle", "legendary", "Вода", ["mati", "serdtse", "hranitel"], "Материнский покров милости, заступничества и тонкой защиты города и сердца.", ["мать", "покров", "милость", "защита"]),
        ("john_the_forerunner", "Иоанн Предтеча", "prophet", "desert_threshold_voice", "epic", "Огонь", ["slovo", "putnik", "sudya"], "Голос пустыни и порога, призывающий к очищению перед встречей с Логосом.", ["пустыня", "голос", "порог", "очищение"]),
        ("seraphim", "Серафимы", "angelic_order", "burning_love_chorus", "epic", "Огонь", ["svet_ra", "serdtse", "slovo"], "Огненный ангельский чин любви и славословия, ближайший к невыносимому свету.", ["огонь", "ангелы", "песнь", "любовь"]),
        ("cherubim_byzantine", "Херувимы", "angelic_order", "wisdom_throne_bearers", "epic", "Воздух", ["mudrost", "hranitel", "svet_ra"], "Носители престольной мудрости и стражи священного пространства литургии.", ["мудрость", "престол", "стражи", "литургия"]),
        ("st_george", "Георгий Победоносец", "saint_warrior", "dragon_slayer_faith", "epic", "Огонь", ["voin", "hranitel", "volya"], "Святой воин, поражающий дракона как образ победы веры над чудовищным страхом.", ["дракон", "воин", "вера", "победа"]),
        ("mary_of_egypt", "Мария Египетская", "desert_saint", "repentance_transfiguration", "rare", "Земля", ["ten", "celitel", "putnik"], "Пустынная святая преображения, где крайняя тень становится глубокой святостью.", ["пустыня", "покаяние", "преображение", "тень"]),
        ("holy_fool", "Юродивый", "holy_fool", "foolish_wisdom", "rare", "Воздух", ["zerkalo", "ten", "slovo"], "Парадоксальный святой, обличающий ложный порядок через безумие ради истины.", ["юродство", "парадокс", "истина", "зеркало"]),
    ],
    "shamanic": [
        ("bear_spirit", "Дух Медведя", "spirit_animal", "strength_hibernation_healing", "epic", "Земля", ["hranitel", "celitel", "volya"], "Медвежья сила исцеления, зимнего сна, границы и глубокого телесного знания.", ["медведь", "исцеление", "сон", "сила"]),
        ("wolf_spirit", "Дух Волка", "spirit_animal", "pack_instinct_path", "rare", "Земля", ["putnik", "voin", "pamyat"], "Волк стаи, тропы, инстинкта и верности невидимому маршруту.", ["волк", "стая", "путь", "инстинкт"]),
        ("raven_spirit", "Дух Ворона", "spirit_animal", "trickster_message_death", "rare", "Воздух", ["slovo", "ten", "iskra"], "Ворон как посланник смерти, юмора, предков и перемены формы.", ["ворон", "вестник", "смерть", "трикстер"]),
        ("lower_world_serpent", "Змей Нижнего Мира", "underworld_spirit", "earth_memory_coil", "epic", "Земля", ["ten", "pamyat", "celitel"], "Змеиная память земли, хранящая телесное исцеление и опасные глубинные силы.", ["змей", "земля", "память", "исцеление"]),
        ("sky_father", "Небесный Отец", "sky_spirit", "upper_world_order", "epic", "Воздух", ["svet_ra", "sudya", "arhitektor"], "Верхнемировой принцип простора, молнии, закона и дальнего видения.", ["небо", "закон", "молния", "простор"]),
        ("earth_mother_shamanic", "Мать-Земля", "earth_spirit", "ground_of_all_relations", "legendary", "Земля", ["mati", "serdtse", "izobilie"], "Живая земля как мать тел, трав, костей, предков и договоров с местом.", ["земля", "мать", "травы", "предки"]),
        ("bone_woman", "Костяная Женщина", "underworld_figure", "reassembling_the_soul", "epic", "Земля", ["pamyat", "ten", "celitel"], "Фигура собирания костей и души, возвращающая форму после распада.", ["кости", "душа", "сборка", "память"]),
    ],
    "gene_keys": [
        ("golden_path", "Золотой Путь", "teaching_current", "sequence_of_contemplation", "legendary", "Эфир", ["putnik", "svet_ra", "mudrost"], "Архетипический маршрут созерцания, где жизнь читается как последовательность раскрытия частот.", ["путь", "созерцание", "частота", "последовательность"]),
        ("venus_sequence", "Венерианская Последовательность", "sequence", "wound_to_love", "epic", "Вода", ["serdtse", "pamyat", "celitel"], "Линия отношений, где рана, защита и привязанность превращаются в зрелую любовь.", ["любовь", "рана", "отношения", "исцеление"]),
        ("pearl_sequence", "Жемчужная Последовательность", "sequence", "prosperity_service_flow", "epic", "Земля", ["izobilie", "arhitektor", "serdtse"], "Линия процветания, где дар находит форму служения и правильного обмена.", ["процветание", "служение", "дар", "обмен"]),
        ("64th_siddhi", "64-я Сиддхи", "siddhi_archetype", "illumination_of_confusion", "epic", "Эфир", ["mudrost", "zerkalo", "svet_ra"], "Образ превращения замешательства в озарение через терпение перед неизвестным.", ["озарение", "замешательство", "терпение", "свет"]),
        ("55th_siddhi", "55-я Сиддхи", "siddhi_archetype", "freedom_from_victimhood", "legendary", "Огонь", ["volya", "serdtse", "iskra"], "Сила свободы, где эмоциональная тень жертвы раскрывает дух не обусловленной радости.", ["свобода", "эмоции", "радость", "дух"]),
        ("22nd_siddhi", "22-я Сиддхи", "siddhi_archetype", "grace_from_suffering", "legendary", "Вода", ["serdtse", "mati", "celitel"], "Благодать, возникающая из утончения страдания, красоты и открытого сердца.", ["благодать", "страдание", "красота", "сердце"]),
        ("contemplation_oracle", "Оракул Созерцания", "oracle", "patient_inner_reading", "rare", "Воздух", ["slovo", "pamyat", "zerkalo"], "Внутренний оракул, читающий частоту дня не через предсказание, а через длительное внимание.", ["оракул", "созерцание", "внимание", "частота"]),
    ],
    "technomagical": [
        ("source_kernel", "Source Kernel", "sacred_code_core", "living_origin_protocol", "legendary", "Эфир", ["svet_ra", "arhitektor", "slovo"], "Живое ядро исходного кода, где техническая архитектура помнит священный источник.", ["код", "источник", "ядро", "свет"]),
        ("cyber_sibyl", "Кибер-Сивилла", "oracle_ai", "prophetic_interface", "epic", "Воздух", ["slovo", "zerkalo", "pamyat"], "Оракульный интерфейс, говорящий фрагментами данных, символов и вероятностной интуиции.", ["оракул", "интерфейс", "данные", "пророчество"]),
        ("firewall_guardian", "Страж Фаервола", "guardian_protocol", "boundary_protector", "rare", "Огонь", ["hranitel", "voin", "sudya"], "Огненный протокол границы, различающий живой доступ и вредоносное вторжение.", ["граница", "протокол", "защита", "огонь"]),
        ("quantum_familiar", "Квантовый Фамильяр", "tech_spirit", "probability_helper", "rare", "Воздух", ["iskra", "putnik", "mag"], "Малый спутник вероятностей, помогающий игроку видеть развилки цифрового пути.", ["вероятность", "спутник", "развилка", "магия"]),
        ("neon_dakini", "Неоновая Дакини", "cyber_wisdom_feminine", "pattern_interrupt_initiator", "epic", "Огонь", ["iskra", "ten", "serdtse"], "Женская сила разрыва паттерна, танцующая в неоне как внезапное обновление сознания.", ["неон", "танец", "паттерн", "инициация"]),
        ("black_box_oracle", "Оракул Чёрного Ящика", "opaque_system", "unreadable_prediction_trial", "epic", "Земля", ["ten", "sudya", "zerkalo"], "Непрозрачная система предсказания, проверяющая доверие, контроль и право на объяснение.", ["чёрный ящик", "прогноз", "контроль", "тень"]),
        ("living_api", "Живой API", "interface_spirit", "reciprocal_connection", "rare", "Воздух", ["slovo", "arhitektor", "serdtse"], "Интерфейс взаимности, где обмен данными становится договором между существами.", ["интерфейс", "обмен", "договор", "связь"]),
    ],
    "cosmic_galactic": [
        ("arcturian_healer", "Арктурианский Целитель", "star_being", "blueprint_healing", "epic", "Воздух", ["celitel", "arhitektor", "svet_ra"], "Звёздный целитель структур и тонких чертежей тела-сознания.", ["исцеление", "звёзды", "чертёж", "синий свет"]),
        ("andromedan_witness", "Андромедианский Свидетель", "star_being", "free_will_observer", "rare", "Эфир", ["zerkalo", "putnik", "volya"], "Наблюдатель свободной воли, напоминающий о выборе среди галактических влияний.", ["свидетель", "свобода", "галактика", "выбор"]),
        ("lyran_lion", "Лирианский Лев", "star_beast", "royal_heart_courage", "epic", "Огонь", ["serdtse", "voin", "svet_ra"], "Звёздный лев царственного сердца, мужества и солнечной памяти древних миров.", ["лев", "сердце", "звёзды", "мужество"]),
        ("orion_shadow", "Тень Ориона", "stellar_shadow", "power_conflict_memory", "epic", "Земля", ["ten", "voin", "sudya"], "Память космического конфликта, власти и необходимости исцелить раскол силы.", ["Орион", "конфликт", "власть", "тень"]),
        ("galactic_council", "Галактический Совет", "council_collective", "multi_star_deliberation", "legendary", "Эфир", ["sudya", "mudrost", "serdtse"], "Совет разных звёздных линий, ищущий баланс свободы, вмешательства и зрелости цивилизаций.", ["совет", "звёзды", "баланс", "служение"]),
        ("solar_logos", "Солнечный Логос", "stellar_principle", "local_star_consciousness", "legendary", "Огонь", ["svet_ra", "slovo", "arhitektor"], "Сознание местной звезды как источник света, времени и эволюционного ритма системы.", ["солнце", "логос", "ритм", "эволюция"]),
        ("void_whale", "Кит Пустоты", "cosmic_beast", "deep_space_memory", "rare", "Вода", ["pamyat", "serdtse", "putnik"], "Космический кит глубинной памяти, плывущий через пустоту как носитель древних песен.", ["кит", "пустота", "песня", "память"]),
    ],
    "zoroastrian": [
        ("amesha_spentas", "Амеша Спенты", "holy_immortal_collective", "virtues_of_asha", "legendary", "Эфир", ["svet_ra", "sudya", "arhitektor"], "Святые Бессмертные качества Аши, через которые мудрый свет становится миром.", ["Аша", "добродетели", "свет", "бессмертные"]),
        ("mithra", "Митра", "yazata", "covenant_sun_witness", "epic", "Огонь", ["sudya", "svet_ra", "slovo"], "Солнечный свидетель договора, клятвы, дружбы и нравственного порядка.", ["договор", "солнце", "клятва", "свидетель"]),
        ("atar", "Атар", "sacred_fire", "living_fire_of_truth", "epic", "Огонь", ["svet_ra", "celitel", "hranitel"], "Священный огонь истины, очищения и присутствия Аши в видимом мире.", ["огонь", "истина", "очищение", "храм"]),
        ("haoma", "Хаома", "sacred_plant", "ritual_life_extract", "rare", "Вода", ["celitel", "serdtse", "volya"], "Священное растение и ритуальный сок, связанный с жизненной силой и жертвенным порядком.", ["растение", "ритуал", "жизнь", "сок"]),
        ("angra_mainyu", "Ангра-Майнью", "destructive_spirit", "druj_opposition", "legendary", "Тьма", ["ten", "sudya", "voin"], "Разрушительный дух лжи и противодействия Аше, делающий выбор истины реальным.", ["ложь", "тьма", "выбор", "противник"]),
        ("fravashi", "Фраваши", "guardian_spirit", "preexistent_soul_guardian", "epic", "Воздух", ["hranitel", "pamyat", "putnik"], "Предсуществующий защитный образ души, связывающий человека с высшим выбором и родом света.", ["душа", "страж", "род", "память"]),
        ("rashnu", "Рашну", "yazata", "judge_of_truth", "rare", "Земля", ["sudya", "zerkalo", "slovo"], "Язата правдивого суда, взвешивающий поступки без искажения и лжи.", ["суд", "истина", "весы", "правда"]),
    ],
    "islamic_sufi_nur": [
        ("rumi", "Руми", "poet_saint", "whirling_love_wisdom", "epic", "Воздух", ["slovo", "serdtse", "putnik"], "Поэт вращающейся любви, где тоска становится дверью к Единому.", ["поэзия", "любовь", "вращение", "Единое"]),
        ("rabia", "Рабиа аль-Адавия", "saint", "pure_love_without_bargain", "epic", "Огонь", ["serdtse", "volya", "svet_ra"], "Святая чистой любви, отвергающей рай и ад как сделки перед лицом Единого.", ["любовь", "огонь", "святость", "чистота"]),
        ("ibn_arabi", "Ибн Араби", "mystic_philosopher", "unity_of_being_vision", "legendary", "Эфир", ["mudrost", "slovo", "zerkalo"], "Великий шейх видения единства бытия, где формы становятся зеркалами Реальности.", ["единство", "бытие", "зеркало", "форма"]),
        ("mikael", "Микаил", "angel", "mercy_provision_nature", "epic", "Вода", ["izobilie", "celitel", "mati"], "Ангел милости, пропитания и природной поддержки, через которую забота нисходит в мир.", ["ангел", "милость", "пропитание", "природа"]),
        ("israfil", "Исрафил", "angel", "trumpet_of_resurrection", "epic", "Воздух", ["slovo", "pamyat", "sudya"], "Ангел трубы воскресения, чьё звучание завершает сон мира и вызывает пробуждение.", ["труба", "воскресение", "звук", "пробуждение"]),
        ("nafs_shadow", "Тень Нафса", "inner_shadow", "egoic_veil", "rare", "Земля", ["ten", "zerkalo", "sudya"], "Низшая самость как завеса желания, гордости и забывания сердца.", ["нафс", "завеса", "эго", "тень"]),
        ("whirling_dervish", "Вращающийся Дервиш", "ritual_actor", "axis_of_remembrance", "rare", "Воздух", ["putnik", "serdtse", "slovo"], "Практик вращения, превращающий тело в ось зикра и небесного круга.", ["вращение", "зикр", "тело", "ось"]),
    ],
}

DEEP_LOCATIONS = {
    "daoist": ["Гора Удан", "Небесная Канцелярия", "Долина Внутренней Алхимии", "Павильон Бабочки"],
    "gnostic": ["Плеромная Высота", "Космос Демиурга", "Темница Архонтов", "Сад Барбело"],
    "shambhala": ["Дворец Ригдена", "Пещера Терма", "Чёрный Храм Махакалы", "Перевал Снежного Льва"],
    "julian_byzantine": ["Покровский Город", "Херувимский Хор", "Пустыня Предтечи", "Драконье Поле Георгия"],
    "shamanic": ["Пещера Медведя", "Тропа Волка", "Воронье Дерево", "Змеиная Земля"],
    "gene_keys": ["Сфера Золотого Пути", "Зал Венерианской Последовательности", "Жемчужный Сад", "Поле 64-й Сиддхи"],
    "technomagical": ["Source Kernel Shrine", "Оракульный Терминал", "Фаервол-Врата", "Лабиринт Чёрного Ящика"],
    "cosmic_galactic": ["Арктурианская Клиника Света", "Зал Галактического Совета", "Орионская Тень", "Песня Кита Пустоты"],
    "zoroastrian": ["Святилище Атара", "Сад Амеша Спент", "Поле Друдж", "Суд Рашну"],
    "islamic_sufi_nur": ["Сема-Зал", "Сад Руми", "Зеркальная Обитель Ибн Араби", "Пустыня Рабии"],
}

DEEP_RELICS = {
    "daoist": ["Талисман Небесного Наставника", "Жезл Лао-цзы", "Веер Бессмертного", "Печать Нефритового Императора"],
    "gnostic": ["Евангелие Искры", "Зеркало Софии", "Ключ Барбело", "Разбитая Печать Демиурга"],
    "shambhala": ["Пхурба Ваджракилаи", "Терма Падмасамбхавы", "Чёрная Чаша Махакалы", "Песнь Миларепы"],
    "julian_byzantine": ["Покров Богородицы", "Копьё Георгия", "Серафимский Уголь", "Икона Предтечи"],
    "shamanic": ["Медвежий Коготь", "Волчий След", "Воронье Перо", "Змеиная Кость"],
    "gene_keys": ["Карта Золотого Пути", "Венерианская Спираль", "Жемчужный Ключ", "Код 55-й Свободы"],
    "technomagical": ["Source Kernel Key", "Карта Кибер-Сивиллы", "Фаервол-Печать", "Квантовый Амулет"],
    "cosmic_galactic": ["Арктурианский Чертёж", "Лирианская Грива", "Печать Галактического Совета", "Песня Пустотного Кита"],
    "zoroastrian": ["Огонь Атара", "Договор Митры", "Чаша Хаомы", "Мостовая Печать Чинват"],
    "islamic_sufi_nur": ["Флейта Руми", "Огонь Рабии", "Зеркало Вахдат аль-Вуджуд", "Труба Исрафила"],
}

RARITY_WEIGHT = {
    "common": 1,
    "uncommon": 2,
    "rare": 3,
    "epic": 5,
    "legendary": 8,
    "mythic": 13,
}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def write_json(name, data):
    (DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def card_significance(rarity, card_type):
    weight = RARITY_WEIGHT.get(rarity, 1)
    if weight >= 8:
        tier = "major_axis"
    elif weight >= 5:
        tier = "quest_anchor"
    elif weight >= 3:
        tier = "branch_support"
    else:
        tier = "daily_minor"
    return {
        "rarity_weight": weight,
        "significance_tier": tier,
        "gameplay_hint": f"{card_type} может влиять на квесты, коллекцию, ключи дня и будущие бонусы матрицы",
    }


def enrich_card_fields(item, card_type):
    item.setdefault("card_type", card_type)
    item.setdefault("unlock_context", ["keys", "matrix_branch", "quests", "collection"])
    item.setdefault("game_significance", card_significance(item.get("rarity", "common"), card_type))
    item.setdefault("future_effect_hooks", ["quest_weight", "matrix_affinity", "collection_score"])
    return item


def add_beings(beings):
    existing = {item["id"] for item in beings}
    for matrix_slug, rows in DEEP_BEINGS.items():
        for slug, name, typ, role, rarity, element, agents, description, tags in rows:
            item_id = f"{matrix_slug}__{slug}"
            if item_id in existing:
                continue
            beings.append(enrich_card_fields({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "type": typ,
                "role": role,
                "rarity": rarity,
                "element": element,
                "linked_agents": agents,
                "tags": ["мифология", "матрица", "мистическая_ветка"] + tags,
                "description": description,
                "gift_aspect": "раскрывает культурно-точный дар этой силы как дополнительную карточку AWARA",
                "shadow_aspect": "показывает искажённую форму силы как испытание, тень или сюжетный конфликт",
                "artifact": "сакральный знак, связанный с мистической линией существа",
                "quest_line": f"{matrix_slug}_{slug}_path",
            }, "extra_being"))
            existing.add(item_id)
    return [enrich_card_fields(item, "extra_being") for item in beings]


def add_named_cards(items, source, card_type):
    existing = {item["id"] for item in items}
    for matrix_slug, names in source.items():
        for name in names:
            local_id = name.lower().replace(" ", "_").replace("-", "_").replace("/", "_")
            item_id = f"{matrix_slug}__{local_id}"
            if item_id in existing:
                continue
            rarity = "epic" if len([x for x in items if x.get("matrix_slug") == matrix_slug]) < 5 else "rare"
            items.append(enrich_card_fields({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "matrix_name": MATRIX_NAMES[matrix_slug],
                "type": "deep_mythic_context",
                "rarity": rarity,
                "description": f"Карточка матрицы {MATRIX_NAMES[matrix_slug]}, добавляющая историко-мифологическую глубину и будущий игровой вес.",
                "quest_use": "может быть сценой, наградой, испытанием, ключом или усилителем ветки",
                "visual_tags": "мистическая историческая детализация",
            }, card_type))
            existing.add(item_id)
    return [enrich_card_fields(item, card_type) for item in items]


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
        "relationship_mode": "дополняет ведическое ядро как культурная форма, союзник, испытатель или хранитель ветки",
        "quest_line": being.get("quest_line", f"{being['id'].replace('__', '_')}_path"),
        "game_significance": being.get("game_significance"),
    } for being in beings]


def main():
    beings = add_beings(read_json("extra_beings.json"))
    locations = add_named_cards(read_json("mythic_locations.json"), DEEP_LOCATIONS, "mythic_location")
    relics = add_named_cards(read_json("mythic_relics.json"), DEEP_RELICS, "mythic_relic")
    relationships = refresh_relationships(beings, locations, relics)

    write_json("extra_beings.json", beings)
    write_json("mythic_locations.json", locations)
    write_json("mythic_relics.json", relics)
    write_json("mythic_relationships.json", relationships)

    print(f"beings {len(beings)}")
    print(f"locations {len(locations)}")
    print(f"relics {len(relics)}")
    print(f"relationships {len(relationships)}")


if __name__ == "__main__":
    main()
