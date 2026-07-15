import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

MATRIX_NAMES = {m["slug"]: m["name"] for m in json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))}

DEEP_BEINGS = {
    "vedic": [
        ("saraswati", "Сарасвати", "goddess", "river_of_speech_and_learning", "epic", "Вода", ["slovo", "mudrost", "pamyat"], "Речная богиня знания, музыки и чистой речи, у которой поток становится обучением и вдохновением.", ["речь", "знание", "музыка", "река"]),
        ("lakshmi", "Лакшми", "goddess", "auspicious_abundance", "epic", "Земля", ["izobilie", "serdtse", "mati"], "Богиня благого изобилия, красоты, удачи и мягкого процветания, возникающего из чистого порядка.", ["изобилие", "лотос", "удача", "красота"]),
        ("durga", "Дурга", "warrior_goddess", "protective_shakti", "legendary", "Огонь", ["voin", "mati", "hranitel"], "Воинственная Шакти, побеждающая демоническую силу, когда мир нуждается в защитной материнской ярости.", ["защита", "шакти", "битва", "лев"]),
        ("shiva_nataraja", "Шива Натараджа", "deity", "cosmic_dance_of_dissolution", "legendary", "Эфир", ["ten", "svet_ra", "volya"], "Шива как владыка танца, в котором создание, сохранение, разрушение, сокрытие и милость становятся одним ритмом.", ["танец", "разрушение", "милость", "космос"]),
        ("vishnu", "Вишну", "deity", "preserver_of_cosmic_order", "legendary", "Вода", ["hranitel", "serdtse", "arhitektor"], "Хранитель космического порядка, поддерживающий мир через аватары, сон на водах и мягкую силу сохранения.", ["сохранение", "аватары", "порядок", "океан"]),
        ("agni", "Агни", "deity", "sacrificial_fire_messenger", "epic", "Огонь", ["slovo", "svet_ra", "putnik"], "Огонь жертвоприношения и посланник между людьми и дэвами, несущий подношение вверх.", ["огонь", "жертва", "посланник", "очищение"]),
        ("garuda", "Гаруда", "divine_mount", "serpent_enemy_solar_wings", "rare", "Воздух", ["voin", "putnik", "svet_ra"], "Солнечная птица-носитель Вишну, противостоящая змеиному плену и раскрывающая свободу неба.", ["птица", "свобода", "змеи", "небо"]),
    ],
    "egyptian": [
        ("isis", "Исида", "goddess", "magic_mother_restorer", "legendary", "Вода", ["mati", "mag", "serdtse"], "Великая магическая мать, собирающая тело Осириса и восстанавливающая царскую линию через любовь и знание имени.", ["магия", "мать", "исцеление", "имя"]),
        ("osiris", "Осирис", "god", "dead_king_of_regeneration", "legendary", "Земля", ["ten", "pamyat", "sudya"], "Убитый и восстановленный царь, владыка плодородного загробного порядка и воскресающей зелени.", ["воскресение", "подземный мир", "зерно", "царь"]),
        ("horus", "Гор", "falcon_god", "royal_sky_sight", "epic", "Воздух", ["svet_ra", "voin", "sudya"], "Соколиный наследник, восстанавливающий царский порядок после конфликта с Сетом.", ["сокол", "небо", "царство", "око"]),
        ("set", "Сет", "storm_god", "desert_disruption_and_power", "epic", "Огонь", ["ten", "volya", "voin"], "Пустынная сила бури, чуждости и разрушения, необходимая как испытание царской устойчивости.", ["буря", "пустыня", "хаос", "сила"]),
        ("sekmet", "Сехмет", "lioness_goddess", "solar_wrath_healing", "epic", "Огонь", ["voin", "celitel", "svet_ra"], "Львиная солнечная ярость, которая может уничтожать болезнь и чрезмерность, если умиротворена.", ["львица", "ярость", "исцеление", "солнце"]),
        ("bastet", "Бастет", "cat_goddess", "joy_protection_home", "rare", "Земля", ["serdtse", "hranitel", "izobilie"], "Кошачья защитница дома, радости, женской мягкости и тонкой стражи от разрушения.", ["кошка", "дом", "радость", "защита"]),
        ("hathor", "Хатхор", "goddess", "love_music_sky_cow", "epic", "Вода", ["serdtse", "izobilie", "slovo"], "Небесная корова любви, музыки, праздника и женской принимающей полноты.", ["любовь", "музыка", "небо", "праздник"]),
    ],
    "kabbalistic": [
        ("raziel", "Разиэль", "archangel", "keeper_of_secret_wisdom", "epic", "Эфир", ["mudrost", "slovo", "pamyat"], "Ангел тайной мудрости, связанный с книгой небесных тайн и чтением скрытого порядка.", ["тайна", "книга", "ангел", "мудрость"]),
        ("tzadkiel", "Цадкиэль", "archangel", "mercy_expansion", "rare", "Вода", ["serdtse", "sudya", "celitel"], "Архангельская сила милости, расширяющая суд до сострадания и благословения.", ["милость", "расширение", "благословение"]),
        ("samael", "Самаэль", "adversarial_angel", "severity_poison_and_trial", "epic", "Огонь", ["ten", "sudya", "voin"], "Опасная сила строгости, яда и обвинения, проверяющая зрелость различения.", ["строгость", "испытание", "яд", "обвинение"]),
        ("lilith", "Лилит", "night_figure", "untamed_shadow_feminine", "epic", "Воздух", ["ten", "volya", "serdtse"], "Ночная фигура необузданной автономии, тени желания и изгнанной силы женского образа.", ["ночь", "желание", "изгнание", "свобода"]),
        ("eliyahu", "Илия Пророк", "prophet", "threshold_messenger", "rare", "Огонь", ["slovo", "putnik", "svet_ra"], "Пророческий вестник порога, присутствующий в переходах, чаше и ожидании исправления.", ["пророк", "порог", "огонь", "вестник"]),
        ("sand_of_malkuth", "Песок Малкут", "earth_principle", "kingdom_embodiment", "rare", "Земля", ["arhitektor", "mati", "hranitel"], "Образ Царства как воплощённого сосуда, где высшие эманации должны стать земной ответственностью.", ["царство", "земля", "сосуд", "воплощение"]),
        ("cherubim", "Керувимы", "angelic_order", "throne_guardians", "epic", "Воздух", ["hranitel", "svet_ra", "sudya"], "Хранители престола и порога святыни, несущие мощь близости к божественному присутствию.", ["стражи", "престол", "крылья", "святость"]),
    ],
    "mayan": [
        ("chaac", "Чаак", "rain_god", "storm_rain_fertility", "epic", "Вода", ["celitel", "izobilie", "voin"], "Бог дождя и молнии, от которого зависит кукуруза, жизнь полей и гнев небесной влаги.", ["дождь", "молния", "кукуруза", "плодородие"]),
        ("hunab_ku", "Хунаб Ку", "cosmic_principle", "one_giver_of_measure", "legendary", "Эфир", ["svet_ra", "arhitektor", "mudrost"], "Единый принцип космической меры, интерпретируемый как центр порядка и вращения.", ["центр", "космос", "мера", "единство"]),
        ("yum_kaax", "Юм Кааш", "maize_lord", "green_life_of_fields", "rare", "Земля", ["izobilie", "mati", "serdtse"], "Владыка молодой кукурузы, лесной зелени и пропитания общины.", ["кукуруза", "поле", "зелень", "пища"]),
        ("ix_tab", "Иш Таб", "liminal_goddess", "death_threshold_shadow", "rare", "Вода", ["ten", "sudya", "putnik"], "Пороговая фигура смерти и перехода, требующая осторожного и уважительного обращения.", ["смерть", "порог", "тень", "переход"]),
        ("bacabs", "Бакабы", "directional_guardians", "four_sky_bearers", "epic", "Земля", ["hranitel", "arhitektor", "pamyat"], "Четыре держателя небесных направлений, удерживающие архитектуру мира.", ["направления", "небо", "стражи", "четыре"]),
        ("itzamna", "Ицамна", "creator_sage", "sky_writing_medicine", "legendary", "Воздух", ["slovo", "mudrost", "celitel"], "Старший бог письма, знания, целительства и небесного порядка.", ["письмо", "небо", "мудрость", "исцеление"]),
        ("ah_puch", "Ах Пуч", "death_lord", "underworld_decay", "epic", "Земля", ["ten", "sudya", "pamyat"], "Владыка смерти и распада, напоминающий о цене времени и необходимости обновления.", ["смерть", "подземный мир", "распад", "время"]),
    ],
    "slavic": [
        ("lada", "Лада", "goddess", "harmony_love_order", "epic", "Вода", ["serdtse", "mati", "izobilie"], "Сила любви, красоты и лада, собирающая общину и дом в мягкую согласованность.", ["лад", "любовь", "дом", "красота"]),
        ("svarog", "Сварог", "sky_smith_god", "celestial_forge_order", "epic", "Огонь", ["arhitektor", "svet_ra", "voin"], "Небесный кузнец и отец огненного порядка, формирующий закон, ремесло и свод.", ["кузня", "небо", "закон", "огонь"]),
        ("dazhdbog", "Даждьбог", "solar_god", "giving_sun_lineage", "epic", "Огонь", ["svet_ra", "izobilie", "serdtse"], "Солнечный дающий бог, связанный с благом, родом и светлой щедростью.", ["солнце", "дар", "род", "свет"]),
        ("mara", "Мара", "winter_death_goddess", "winter_sleep_and_release", "rare", "Вода", ["ten", "pamyat", "sudya"], "Зимняя сила смерти, сна и отпускания, без которой весеннее возвращение теряет правду.", ["зима", "смерть", "сон", "отпускание"]),
        ("domovoi", "Домовой", "house_spirit", "household_guardian", "common", "Земля", ["hranitel", "pamyat", "serdtse"], "Домашний дух очага, порядка, привычек и малого договора между семьёй и местом.", ["дом", "очаг", "дух", "порядок"]),
        ("leshy", "Леший", "forest_spirit", "wild_forest_master", "rare", "Земля", ["putnik", "ten", "hranitel"], "Хозяин леса, сбивающий с дороги тех, кто не уважает живую дикость.", ["лес", "дорога", "дикость", "хозяин"]),
        ("rusalka", "Русалка", "water_spirit", "liminal_water_memory", "rare", "Вода", ["serdtse", "ten", "pamyat"], "Водный дух красоты, печали и незавершённой памяти, связанный с берегами и переходами.", ["вода", "память", "берег", "печаль"]),
    ],
    "norse": [
        ("thor", "Тор", "thunder_god", "protector_against_giants", "epic", "Огонь", ["voin", "hranitel", "volya"], "Громовой защитник людей и богов, удерживающий границу мира от великаньего хаоса.", ["гром", "молот", "защита", "йотуны"]),
        ("loki", "Локи", "trickster", "disruptive_catalyst", "epic", "Огонь", ["iskra", "ten", "slovo"], "Трикстер, нарушающий порядок, рождающий кризисы и вынуждающий систему стать честнее.", ["трикстер", "огонь", "обман", "изменение"]),
        ("heimdall", "Хеймдалль", "watchman_god", "rainbow_bridge_guardian", "epic", "Воздух", ["hranitel", "svet_ra", "sudya"], "Страж Бифрёста с тончайшим слухом, охраняющий границу миров до Рагнарёка.", ["страж", "мост", "слух", "граница"]),
        ("tyr", "Тюр", "god", "oath_sacrifice_law", "rare", "Огонь", ["sudya", "voin", "volya"], "Бог закона и жертвенной честности, потерявший руку ради связывания Фенрира.", ["закон", "клятва", "жертва", "волк"]),
        ("fenrir", "Фенрир", "monster", "bound_devouring_force", "epic", "Земля", ["ten", "volya", "sudya"], "Связанный волк конца, воплощающий подавленную силу, которая однажды разрывает ложные цепи.", ["волк", "цепь", "конец", "сила"]),
        ("jormungandr", "Йормунганд", "world_serpent", "oceanic_boundary_serpent", "legendary", "Вода", ["ten", "arhitektor", "voin"], "Мировой змей океана, опоясывающий Мидгард и задающий предел обитаемого мира.", ["змей", "океан", "граница", "мир"]),
        ("valkyries", "Валькирии", "warrior_collective", "choosers_of_the_slain", "epic", "Воздух", ["voin", "sudya", "putnik"], "Выбирающие павших девы битвы, ведущие достойных к залам памяти и подготовки.", ["битва", "выбор", "крылья", "павшие"]),
    ],
    "shinto": [
        ("tsukuyomi", "Цукуёми", "moon_kami", "moon_order_and_distance", "rare", "Вода", ["pamyat", "sudya", "zerkalo"], "Лунный ками порядка, ночной дистанции и холодного отражения.", ["луна", "ночь", "порядок", "отражение"]),
        ("uzume", "Амэ-но-Удзумэ", "kami", "sacred_laughter_dance", "epic", "Огонь", ["iskra", "slovo", "serdtse"], "Ками танца и смеха, чья радость выманивает солнце из пещеры.", ["танец", "смех", "солнце", "ритуал"]),
        ("ryujin", "Рюдзин", "dragon_kami", "sea_dragon_palace", "epic", "Вода", ["hranitel", "pamyat", "voin"], "Морской дракон-ками дворца глубин, владеющий приливами, жемчужинами и водной властью.", ["дракон", "море", "прилив", "дворец"]),
        ("tengu", "Тэнгу", "mountain_spirit", "martial_pride_teacher", "rare", "Воздух", ["voin", "ten", "putnik"], "Горный дух-воин, обучающий дисциплине через гордость, испытание и резкий урок.", ["гора", "воин", "гордость", "крылья"]),
        ("kitsune", "Кицунэ", "fox_spirit", "fox_messenger_and_trickster", "rare", "Огонь", ["iskra", "mag", "slovo"], "Лисий дух-посланник Инари, способный быть хранителем, обманщиком и проводником между формами.", ["лиса", "посланник", "обман", "форма"]),
        ("kannon_shinto", "Каннон", "syncretic_bodhisattva", "compassionate_presence", "epic", "Вода", ["serdtse", "celitel", "mati"], "Сострадательное присутствие, вплетённое в японскую религиозную ткань как мягкая помощь слышащему сердцу.", ["сострадание", "слушание", "помощь"]),
        ("yamata_no_orochi", "Ямата-но-Ороти", "serpent_monster", "eight_headed_chaos", "epic", "Вода", ["ten", "voin", "volya"], "Восьмиглавый змей хаоса, чьё побеждение превращает бурю Сусаноо в героический порядок.", ["змей", "хаос", "восемь", "меч"]),
    ],
    "celtic": [
        ("cernunnos", "Кернунн", "horned_god", "wild_lord_of_animals", "epic", "Земля", ["putnik", "izobilie", "ten"], "Рогатый владыка дикой природы, животных, плодородия и пороговой силы леса.", ["рога", "лес", "животные", "плодородие"]),
        ("lugh", "Луг", "god", "many_skilled_solar_hero", "epic", "Огонь", ["svet_ra", "voin", "slovo"], "Сияющий многомастерный герой и бог искусств, ремёсел, власти и точного удара.", ["свет", "мастерство", "копьё", "герой"]),
        ("nuada", "Нуада", "king", "silver_hand_sovereignty", "rare", "Металл", ["sudya", "voin", "arhitektor"], "Король Серебряной Руки, чья власть связана с целостностью тела и законностью правления.", ["король", "рука", "серебро", "власть"]),
        ("manannan", "Мананнан мак Лир", "sea_god", "mist_and_otherworld_passage", "epic", "Вода", ["putnik", "mag", "pamyat"], "Морской владыка тумана, переходов и Иного Мира, скрывающий острова за завесой.", ["море", "туман", "иной мир", "переход"]),
        ("danu", "Дану", "mother_goddess", "ancestral_river_mother", "legendary", "Вода", ["mati", "pamyat", "serdtse"], "Материнский исток Tuatha Dé Danann, связанный с рекой, родом и древней полнотой.", ["мать", "река", "род", "исток"]),
        ("cu_chulainn", "Кухулин", "hero", "warp_spasm_oath_hero", "epic", "Огонь", ["voin", "volya", "ten"], "Герой яростной доблести и трагической клятвы, чья сила требует меры и цены.", ["герой", "ярость", "клятва", "битва"]),
        ("sidhe", "Сиды", "otherworld_collective", "hidden_folk_of_mounds", "rare", "Эфир", ["mag", "putnik", "zerkalo"], "Иной Народ холмов, живущий рядом с людьми в тонком договоре красоты, опасности и дара.", ["холмы", "иной народ", "красота", "договор"]),
    ],
    "antique_greco_roman": [
        ("apollo", "Аполлон", "god", "solar_music_oracle_measure", "epic", "Огонь", ["svet_ra", "slovo", "sudya"], "Бог солнечной ясности, музыки, прорицания и меры, исцеляющий через форму и гармонию.", ["солнце", "музыка", "оракул", "мера"]),
        ("artemis", "Артемида", "goddess", "wild_moon_huntress", "epic", "Воздух", ["hranitel", "volya", "mati"], "Лунная охотница дикого пространства, девственной автономии и защиты переходов рождения.", ["луна", "охота", "дикость", "защита"]),
        ("dionysus", "Дионис", "god", "ecstasy_wine_dissolution", "epic", "Вода", ["iskra", "ten", "serdtse"], "Бог вина, экстаза, театра и распада жёсткой личности в живую множественность.", ["вино", "экстаз", "театр", "маска"]),
        ("demeter", "Деметра", "goddess", "grain_mother_mystery", "epic", "Земля", ["mati", "izobilie", "pamyat"], "Мать зерна и мистерий утраты-возвращения, связывающая плодородие с подземным циклом.", ["зерно", "мать", "мистерия", "возвращение"]),
        ("persephone", "Персефона", "queen", "underworld_spring_queen", "epic", "Вода", ["ten", "serdtse", "putnik"], "Царица подземного мира и весеннего возвращения, соединяющая невинность, власть и сезонный переход.", ["подземный мир", "весна", "царица", "переход"]),
        ("prometheus", "Прометей", "titan", "fire_theft_forethought", "legendary", "Огонь", ["iskra", "volya", "arhitektor"], "Титан предвидения, похитивший огонь для людей и принявший страдание за дар культуры.", ["огонь", "титан", "дар", "страдание"]),
        ("chiron", "Хирон", "centaur_sage", "wounded_healer_teacher", "epic", "Земля", ["celitel", "mudrost", "voin"], "Мудрый кентавр и раненый целитель, обучающий героев через знание собственной боли.", ["кентавр", "целитель", "рана", "учитель"]),
    ],
}

DEEP_LOCATIONS = {
    "vedic": [("ganga_river", "Ганга", "sacred_river", "Небесная река очищения, нисходящая через волосы Шивы ради мира.", "epic"), ("kurukshetra", "Курукшетра", "dharma_battlefield", "Поле дхармического выбора, где действие, долг и откровение встречаются в кризисе.", "epic"), ("vrindavan", "Вриндаван", "devotional_grove", "Роща божественной игры, любви, флейты и сердечной преданности.", "rare"), ("saraswati_river", "Сарасвати", "lost_river_of_learning", "Скрытая река знания, речи и тонкой памяти ведического потока.", "rare")],
    "egyptian": [("temple_of_isis", "Храм Исиды", "magic_temple", "Место материнской магии, восстановления тела и силы тайного имени.", "epic"), ("heliopolis", "Гелиополь", "solar_city", "Солнечный центр Ра, творения, бенбена и царского света.", "epic"), ("abydos", "Абидос", "osirian_pilgrimage", "Священное место Осириса, паломничества, смерти и возрождения.", "rare"), ("sekmet_desert", "Пустыня Сехмет", "solar_wrath_field", "Раскалённое поле солнечной ярости, очищающей болезнь через огонь.", "rare")],
    "kabbalistic": [("garden_of_shekhinah", "Сад Шехины", "presence_garden", "Сад божественного присутствия, где изгнанная искра ищет дом.", "epic"), ("malkuth_gate", "Врата Малкут", "kingdom_gate", "Земные врата, где небесная структура проверяется воплощением.", "rare"), ("qlippoth_shells", "Скорлупы Клипот", "shadow_realm", "Область искажённых оболочек света, требующая различения и очищения.", "epic"), ("tiferet_sun", "Солнце Тиферет", "heart_sun", "Сердечный центр красоты, жертвы и гармонии эманаций.", "epic")],
    "mayan": [("palenque", "Паленке", "temple_city", "Город храмов, надписей, царской памяти и небесных переходов.", "rare"), ("temple_of_inscriptions", "Храм Надписей", "glyph_tomb", "Место, где глиф, смерть и царская звёздная дорога становятся единым текстом.", "epic"), ("maize_field", "Поле Кукурузы", "life_field", "Поле молодого маиса, питающее общину и связывающее людей с циклами богов.", "rare"), ("ballcourt", "Священная Площадка Игры", "ritual_ballcourt", "Арена, где игра становится космическим спором жизни, смерти и хитрости.", "epic")],
    "slavic": [("nav_forest", "Лес Нави", "underworld_forest", "Тёмный лес памяти, где предки, страхи и забытые обещания говорят через шорох.", "epic"), ("iriy", "Ирий", "bright_afterworld", "Светлая страна птиц, предков и весеннего возвращения жизни.", "epic"), ("perun_hill", "Холм Перуна", "thunder_hill", "Высокое место громовой клятвы, дуба и небесного удара.", "rare"), ("mokosh_well", "Колодец Мокоши", "fate_well", "Влажный источник женской судьбы, земли и родовой нити.", "rare")],
    "norse": [("valhalla", "Вальхалла", "hero_hall", "Зал павших, где героическая память готовится к последней битве.", "epic"), ("folkvangr", "Фолькванг", "freyja_field", "Поле Фрейи, принимающее половину павших и хранящее магию любви и войны.", "epic"), ("jotunheim", "Йотунхейм", "giant_realm", "Мир великанов, первичных сил, угрозы и древней мудрости хаоса.", "rare"), ("helheim", "Хельхейм", "underworld_realm", "Холодное царство умерших, где не всё зло, но всё требует честного завершения.", "rare")],
    "shinto": [("mount_fuji", "Фудзи", "sacred_mountain", "Священная гора чистоты, опасности, красоты и вертикального восхождения.", "epic"), ("dragon_palace", "Дворец Рюгу", "sea_palace", "Подводный дворец дракона, где время и жемчужины власти текут иначе.", "epic"), ("fox_shrine", "Святилище Инари", "fox_shrine", "Святилище риса, лисьих посланников, красных ворот и достатка.", "rare"), ("mountain_tengu_path", "Тропа Тэнгу", "mountain_trial", "Горная тропа дисциплины, гордости и внезапного урока.", "rare")],
    "celtic": [("tara_hill", "Холм Тары", "sovereignty_hill", "Центр царственности, договора земли и правомочности власти.", "epic"), ("well_of_segis", "Колодец Сегайс", "wisdom_well", "Источник мудрости, окружённый орешником вдохновения и лососем знания.", "epic"), ("brigid_kildare", "Очаг Бригид", "healing_hearth", "Место негасимого огня, исцеления, поэзии и женской общины.", "rare"), ("fomorian_sea", "Море Фоморов", "chaos_sea", "Тёмное море первичных сил, уродства, дара и угрозы племени.", "rare")],
    "antique_greco_roman": [("underworld_hades", "Аид", "underworld_realm", "Подземное царство памяти, теней, суда и неизбежной глубины.", "epic"), ("parnassus", "Парнас", "muse_mountain", "Гора муз, поэзии, вдохновения и аполлонической высоты.", "rare"), ("labyrinth", "Лабиринт", "trial_structure", "Архитектура заблуждения, чудовища и выхода через нить.", "epic"), ("olympic_agora", "Олимпийская Агора", "divine_council", "Место спора богов, где страсти бессмертных становятся судьбой людей.", "rare")],
}

DEEP_RELICS = {
    "vedic": [("veena", "Вина Сарасвати", "music_instrument", "Струнный инструмент знания, гармонии речи и обучающей красоты.", "rare"), ("lotus_lakshmi", "Лотос Лакшми", "auspicious_lotus", "Цветок благого изобилия, чистоты и процветания без привязанности к грязи.", "epic"), ("trishula", "Тришула", "trident", "Трезубец Шивы, рассекающий три узла времени, гун и ограничений.", "legendary"), ("agni_spoon", "Ложка Агни", "sacrificial_tool", "Ритуальная ложка, через которую подношение становится речью огня.", "rare")],
    "egyptian": [("eye_of_horus", "Око Гора", "healing_eye", "Око целостности, царского зрения, защиты и восстановленной меры.", "epic"), ("isis_knot", "Узел Исиды", "magic_knot", "Кроваво-красный узел материнской защиты и магической связи.", "epic"), ("djed_pillar", "Столп Джед", "stability_pillar", "Позвоночник Осириса, знак устойчивости, воскресения и вертикального порядка.", "epic"), ("sistrum", "Систр", "ritual_rattle", "Музыкальный инструмент Хатхор, отгоняющий застой и вызывающий радость.", "rare")],
    "kabbalistic": [("book_of_raziel", "Книга Разиэля", "secret_book", "Книга небесных тайн, требующая чистоты намерения перед чтением.", "epic"), ("tetragram_seal", "Печать Имени", "name_seal", "Сакральная печать непроизносимого имени как оси благоговения.", "legendary"), ("daat_vessel", "Сосуд Даат", "knowledge_vessel", "Сосуд опасного знания, который нельзя удержать без сердца.", "epic"), ("malkuth_crown", "Корона Малкут", "kingdom_crown", "Корона воплощения, где духовный свет становится ответственностью земли.", "rare")],
    "mayan": [("tzolkin_glyph", "Глиф Цолькина", "calendar_glyph", "Знак дня, соединяющий личную задачу с календарной силой.", "rare"), ("quetzal_feather", "Перо Кецаля", "sacred_feather", "Перо небесной красоты и пернато-змеиной мудрости.", "epic"), ("maize_seed", "Семя Кукурузы", "life_seed", "Семя общинной жизни, тела, питания и возвращения из земли.", "rare"), ("hero_twin_blowgun", "Духовая Трубка Близнецов", "hero_weapon", "Лёгкое оружие хитрости и точности против ложных владык игры.", "rare")],
    "slavic": [("mokosh_spindle", "Веретено Мокоши", "fate_spindle", "Инструмент женской судьбы, нити рода и влажной земли.", "epic"), ("veles_staff", "Посох Велеса", "underworld_staff", "Посох нижних дорог, звериной мудрости и тайного богатства.", "epic"), ("dazhdbog_shield", "Щит Даждьбога", "solar_shield", "Солнечный щит дара, рода и светлой защиты.", "rare"), ("domovoi_bread", "Хлеб Домового", "house_offering", "Малое подношение домашнему духу ради мира в очаге.", "common")],
    "norse": [("draupnir", "Драупнир", "multiplying_ring", "Кольцо Одина, умножающее богатство, клятву и циклическое возвращение.", "epic"), ("gjallarhorn", "Гьяллархорн", "watchman_horn", "Рог Хеймдалля, возвещающий предельный момент судьбы.", "legendary"), ("gleipnir", "Глейпнир", "binding_ribbon", "Тонкая невозможная цепь, связывающая Фенрира ценой доверия и жертвы.", "epic"), ("rune_stones", "Рунные Камни", "rune_record", "Камни памяти, где слово, имя и судьба становятся резьбой.", "rare")],
    "shinto": [("magatama", "Ясакани-но-Магатама", "curved_jewel", "Изогнутая яшмовая драгоценность, знак души, связи и императорского наследия.", "legendary"), ("gohei", "Гохэй", "purification_wand", "Жезл с бумажными лентами, обозначающий присутствие ками и очищение.", "rare"), ("fox_key", "Лисий Ключ Инари", "fox_key", "Ключ амбара, риса и лисьего договора с достатком.", "rare"), ("dragon_tide_jewel", "Жемчужина Прилива", "tide_jewel", "Драконья жемчужина управления приливами, временем и глубиной.", "epic")],
    "celtic": [("spear_of_lugh", "Копьё Луга", "victory_spear", "Копьё света и мастерства, чей удар несёт точность солнечного героя.", "epic"), ("nuada_silver_hand", "Серебряная Рука Нуады", "silver_hand", "Искусственная рука царя, возвращающая правомочность через восстановленную целостность.", "epic"), ("salmon_of_wisdom", "Лосось Мудрости", "wisdom_fish", "Существо источника знания, чья случайная искра даёт поэтическое прозрение.", "legendary"), ("mist_cloak", "Плащ Тумана", "otherworld_cloak", "Плащ Мананнана, скрывающий острова, пути и границы Иного Мира.", "epic")],
    "antique_greco_roman": [("lyre_of_apollo", "Лира Аполлона", "music_instrument", "Инструмент гармонии, меры, пророческого звука и исцеления формы.", "epic"), ("torch_of_demeter", "Факел Деметры", "mystery_torch", "Факел поиска утраченной дочери и посвящения в циклы зерна.", "epic"), ("thread_of_ariadne", "Нить Ариадны", "labyrinth_thread", "Нить выхода из лабиринта, соединяющая любовь, память и путь назад.", "epic"), ("promethean_fire", "Огонь Прометея", "culture_fire", "Похищенный огонь культуры, техники, риска и человеческой ответственности.", "legendary")],
}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def write_json(name, data):
    (DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def add_beings(beings):
    existing = {item["id"] for item in beings}
    for matrix_slug, rows in DEEP_BEINGS.items():
        for slug, name, typ, role, rarity, element, agents, description, tags in rows:
            item_id = f"{matrix_slug}__{slug}"
            if item_id in existing:
                continue
            beings.append({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "type": typ,
                "role": role,
                "rarity": rarity,
                "element": element,
                "linked_agents": agents,
                "tags": ["мифология", "матрица", "историческая_ветка"] + tags,
                "description": description,
                "gift_aspect": "раскрывает культурно-точный дар этой силы как дополнение к ведическому ядру игрока",
                "shadow_aspect": "показывает мифологически соответствующее искажение силы как испытание ветки",
                "artifact": "сакральный знак, связанный с исторической линией существа",
                "quest_line": f"{matrix_slug}_{slug}_path",
            })
            existing.add(item_id)
    return beings


def add_simple(items, source, filename_type):
    existing = {item["id"] for item in items}
    for matrix_slug, rows in source.items():
        for slug, name, typ, description, rarity in rows:
            item_id = f"{matrix_slug}__{slug}"
            if item_id in existing:
                continue
            items.append({
                "id": item_id,
                "name": name,
                "matrix_slug": matrix_slug,
                "matrix_name": MATRIX_NAMES[matrix_slug],
                "type": typ,
                "rarity": rarity,
                "description": description,
                "quest_use": "может стать исторически окрашенной сценой, наградой, испытанием или ключом ветки",
                "visual_tags": "историческая мифологическая детализация",
            })
            existing.add(item_id)
    return items


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
    } for being in beings]


def main():
    beings = add_beings(read_json("extra_beings.json"))
    locations = add_simple(read_json("mythic_locations.json"), DEEP_LOCATIONS, "locations")
    relics = add_simple(read_json("mythic_relics.json"), DEEP_RELICS, "relics")
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
