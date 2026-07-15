import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

ECOLOGY = {
    "vedic": {
        "locations": [
            ("mount_meru", "Гора Меру", "axis_mundi", "Центральная гора миров, вокруг которой вращаются небесные сферы и пути дэвов.", "legendary"),
            ("kailasa", "Кайласа", "divine_mountain", "Обитель Шивы, место тишины, аскезы, танца и растворения ложного я.", "legendary"),
            ("vaikuntha", "Вайкунтха", "celestial_realm", "Мир Вишну, где порядок, преданность и сохранение космоса обретают форму покоя.", "epic"),
        ],
        "relics": [
            ("vajra", "Ваджра", "thunderbolt_scepter", "Несокрушимый знак молнии сознания и алмазной ясности.", "epic"),
            ("gayatri_thread", "Нить Гаятри", "mantric_thread", "Мантрическая нить солнечного разума, соединяющая дыхание, речь и свет.", "legendary"),
            ("chakra_disc", "Сударшана-чакра", "solar_disc_weapon", "Диск различения, возвращающий хаос к дхармическому кругу.", "legendary"),
        ],
    },
    "egyptian": {
        "locations": [
            ("duat", "Дуат", "underworld_path", "Ночной путь души и солнечной ладьи через залы испытаний, имён и врат.", "legendary"),
            ("field_of_reeds", "Поля Аару", "blessed_afterlife", "Зелёное царство упорядоченной жизни после успешного взвешивания сердца.", "epic"),
            ("hall_of_maat", "Зал Маат", "judgement_hall", "Место взвешивания сердца, где истина становится мерой существования.", "legendary"),
        ],
        "relics": [
            ("ankh", "Анх", "life_key", "Ключ жизни, соединяющий дыхание, вечность и царственную жизненную силу.", "epic"),
            ("feather_of_maat", "Перо Маат", "truth_feather", "Лёгкая мера истины, перед которой сердце раскрывает свой настоящий вес.", "legendary"),
            ("thoth_palette", "Палетка Тота", "scribe_tool", "Инструмент священной записи, фиксирующий имена, меры и судьбы.", "epic"),
        ],
    },
    "kabbalistic": {
        "locations": [
            ("tree_of_sefirot", "Древо Сефирот", "cosmic_tree", "Карта эманаций, по которой свет нисходит и душа возвращается к Источнику.", "legendary"),
            ("abyss_daat", "Бездна Даат", "threshold_abyss", "Порог знания, где структура должна выдержать встречу с неизвестным.", "epic"),
            ("merkavah_palaces", "Чертоги Меркавы", "visionary_palaces", "Небесные дворцы созерцания, ангельских хоров и опасной близости к свету.", "epic"),
        ],
        "relics": [
            ("sefer_scroll", "Свиток Сефер", "sacred_scroll", "Свиток букв, где творение читается как живая комбинация имён.", "epic"),
            ("magen_tiferet", "Маген Тиферет", "solar_seal", "Шестилучевая печать гармонии сердца, красоты и солнечной меры.", "rare"),
            ("lamp_of_shekhinah", "Лампада Шехины", "presence_lamp", "Светильник присутствия, собирающий рассеянные искры в дом.", "legendary"),
        ],
    },
    "mayan": {
        "locations": [
            ("tzolkin_wheel", "Колесо Цолькина", "calendar_field", "Священное поле дней, где каждый знак несёт божество, направление и задачу.", "epic"),
            ("xibalba", "Шибальба", "underworld_trial", "Подземный дом испытаний, игры, смерти и хитрого возрождения героев.", "legendary"),
            ("cenote_gate", "Сенот-Врата", "water_threshold", "Водный провал между мирами, через который земля слышит небо и предков.", "rare"),
        ],
        "relics": [
            ("jade_mask", "Нефритовая Маска", "ritual_mask", "Маска солнечной и предковой памяти, скрывающая лицо ради сакральной роли.", "epic"),
            ("cacao_cup", "Чаша Какао", "offering_cup", "Горько-сладкое подношение сердца, тела и общинной связи.", "rare"),
            ("obsidian_knife", "Обсидиановый Нож", "sacrificial_blade", "Лезвие ясного отсечения, показывающее цену жизненной силы.", "epic"),
        ],
    },
    "slavic": {
        "locations": [
            ("world_oak", "Мировой Дуб", "axis_tree", "Древо Яви, Нави и Прави, удерживающее птицу, змея и родовой путь.", "legendary"),
            ("buyan", "Остров Буян", "mythic_island", "Остров камня Алатыря, скрытого центра силы, слова и исцеления.", "epic"),
            ("rod_hearth", "Родовой Очаг", "ancestral_hearth", "Место памяти семьи, где огонь соединяет живых, ушедших и ещё не рождённых.", "rare"),
        ],
        "relics": [
            ("alatyr_stone", "Камень Алатырь", "world_stone", "Бел-горюч камень центра мира, из которого расходятся силы и законы.", "legendary"),
            ("embroidered_talisman", "Вышитый Оберег", "protective_cloth", "Узорная защита рода, вписанная в ткань цветом, ритмом и знаком.", "rare"),
            ("perun_axe", "Топор Перуна", "thunder_axe", "Грозовой знак клятвы и небесного удара против морока.", "epic"),
        ],
    },
    "norse": {
        "locations": [
            ("yggdrasil", "Иггдрасиль", "world_tree", "Мировое древо девяти миров, где корни, ветви и судьбы связаны в один узор.", "legendary"),
            ("bifrost", "Бифрёст", "rainbow_bridge", "Радужный мост между Мидгардом и Асгардом, охраняемый зорким стражем.", "epic"),
            ("well_of_urd", "Колодец Урд", "fate_well", "Источник у корней древа, где Норны питают ткань Вирда.", "legendary"),
        ],
        "relics": [
            ("mjolnir", "Мьёльнир", "thunder_hammer", "Молот грома, защиты, освящения и возвращающейся силы.", "legendary"),
            ("gungnir", "Гунгнир", "oath_spear", "Копьё Одина, знак жертвы, клятвы и неотвратимого намерения.", "legendary"),
            ("brisingamen", "Брисингамен", "golden_necklace", "Ожерелье Фрейи, связанное с красотой, желанием, ценой и магией сейдра.", "epic"),
        ],
    },
    "shinto": {
        "locations": [
            ("ama_no_iwato", "Ама-но-Ивато", "sun_cave", "Пещера скрытого солнца, где мир ждёт возвращения света через ритуал радости.", "legendary"),
            ("ise_shrine", "Исе", "solar_shrine", "Святилище солнечной чистоты, обновления и священного зеркала.", "legendary"),
            ("torii_threshold", "Тории-Порог", "sacred_gate", "Красные врата между обычным пространством и областью ками.", "rare"),
        ],
        "relics": [
            ("yata_mirror", "Ята-но-Кагами", "sacred_mirror", "Зеркало Аматэрасу, возвращающее свет через узнавание истинного лица.", "legendary"),
            ("kusanagi", "Кусанаги", "grass_cutting_sword", "Меч из хвоста змея, превращающий бурю в защитную доблесть.", "legendary"),
            ("omamori", "Омамори", "protective_charm", "Малый оберег ками, удерживающий личную связь с местом и просьбой.", "rare"),
        ],
    },
    "celtic": {
        "locations": [
            ("avalon", "Авалон", "otherworld_isle", "Остров яблок, исцеления и тумана, где героический путь уходит за пределы времени.", "legendary"),
            ("sidhe_mounds", "Холмы Сидов", "fairy_mounds", "Пороговые курганы Иного Народа, где земля раскрывает невидимый двор.", "epic"),
            ("sacred_grove", "Священная Роща", "druidic_grove", "Живой храм дубов, источников, песен и друидического закона.", "rare"),
        ],
        "relics": [
            ("dagda_cauldron", "Котёл Дагды", "abundance_cauldron", "Котёл изобилия, питающий племя и возвращающий силу праздника.", "legendary"),
            ("brigid_flame", "Пламя Бригид", "healing_flame", "Негасимый огонь поэзии, кузни и исцеления.", "epic"),
            ("morrigan_raven_cloak", "Вороний Плащ Морриган", "fate_cloak", "Плащ битвы и пророчества, в котором тень показывает цену выбора.", "epic"),
        ],
    },
    "antique_greco_roman": {
        "locations": [
            ("olympus", "Олимп", "divine_mountain", "Гора богов, где порядок, страсти и решения бессмертных отражаются в судьбах людей.", "legendary"),
            ("delphi", "Дельфы", "oracle_center", "Пуп земли и место оракула, где Аполлон говорит через туман и меру.", "epic"),
            ("eleusis", "Элевсин", "mystery_site", "Место мистерий Деметры и Персефоны, где смерть зерна становится обещанием возвращения.", "epic"),
        ],
        "relics": [
            ("caduceus", "Кадуцей", "messenger_staff", "Жезл Гермеса, соединяющий торговлю, речь, путь и психопомпическое равновесие.", "epic"),
            ("aegis", "Эгида", "divine_shield", "Щит Афины с силой устрашения и стратегической защиты города.", "epic"),
            ("hecate_keys", "Ключи Гекаты", "crossroads_keys", "Ключи перекрёстков, ночных дверей и выбора между путями.", "epic"),
        ],
    },
}

FALLBACK_LOCATION_TYPES = ["sacred_center", "threshold_realm", "initiation_place"]
FALLBACK_RELIC_TYPES = ["sacred_seal", "ritual_tool", "guardian_token"]

LOCATION_NAMES = {
    "daoist": ["Гора Куньлунь", "Пещера Бессмертных", "Нефритовый Дворец"],
    "gnostic": ["Плерома", "Сфера Архонтов", "Пещера Искры"],
    "shambhala": ["Шамбала", "Мандала Калачакры", "Снежный Перевал"],
    "julian_byzantine": ["Собор Святой Софии", "Пустынная Келья", "Золотой Иконостас"],
    "shamanic": ["Верхний Мир", "Нижний Мир", "Костровой Круг Предков"],
    "gene_keys": ["Поле Тени", "Сад Дара", "Солнечная Сиддхи-Сфера"],
    "technomagical": ["Неоновый Храм", "Серверная Мандала", "Чёрный Протокол"],
    "cosmic_galactic": ["Совет Звёзд", "Сирианские Воды", "Спиральный Рукав"],
    "zoroastrian": ["Храм Огня", "Мост Чинват", "Сад Фраваши"],
    "islamic_sufi_nur": ["Сад Сердца", "Завеса Нура", "Путь Хидра"],
    "aztec_mexica": ["Теночтитлан", "Миктлан", "Храм Пятого Солнца"],
    "christian_mystical_grail": ["Замок Грааля", "Сад Розы", "Пустыня Искушения"],
    "yoruba_ifa_orisha": ["Святилище Ifá", "Река Ошун", "Двор Шанго"],
    "sumerian_babylonian": ["Зиккурат", "Абзу", "Врата Инанны"],
    "hermetic_alchemical": ["Атанор", "Лаборатория Гермеса", "Сад Философского Камня"],
    "tarot_arcanic": ["Дорога Шута", "Зал Арканов", "Сад Мира"],
    "astrological": ["Сфера Сатурна", "Дом Венеры", "Драконий Узел"],
    "chinese_iching": ["Река Ло", "Небесная Черепаха", "Поле Гексаграмм"],
    "tantric_kashmiri": ["Мандала Бхайравы", "Трон Трипура Сундари", "Пульсирующая Пещера Спанды"],
    "buddhist_mahayana": ["Чистая Земля", "Мандала Тары", "Ваджрный Порог"],
    "afro_dogon": ["Сирианский Колодец", "Деревня Масок", "Амбар Аммы"],
    "atlantean_lemurian": ["Кристальный Храм", "Затонувший Город", "Лемурийский Сад"],
    "posthuman_ai_sophianic": ["Софийное Ядро", "Этический Сервер", "Архив Живого Разума"],
    "advaita_siddha": ["Пещера Самоисследования", "Безмолвная Гора", "Сердечный Ашрам"],
}

RELIC_NAMES = {
    "daoist": ["Персик Бессмертия", "Нефритовая Табличка", "Печь Внутренней Алхимии"],
    "gnostic": ["Искра Софии", "Печать Плеромы", "Разбитая Маска Архонта"],
    "shambhala": ["Колесо Калачакры", "Меч Манджушри", "Белый Лотос Тары"],
    "julian_byzantine": ["Икона Софии", "Меч Михаила", "Чётки Сердечной Молитвы"],
    "shamanic": ["Бубен Перехода", "Перо Орла", "Кость Предка"],
    "gene_keys": ["Кодон Тени", "Кристалл Дара", "Солнечная Печать Сиддхи"],
    "technomagical": ["Ключ Протокола", "Неоновая Руна", "Чёрный Фрагмент Dead System"],
    "cosmic_galactic": ["Кристалл Сириуса", "Печать Совета", "Плазменное Перо"],
    "zoroastrian": ["Священный Огонь", "Перо Сраоши", "Фравахарная Печать"],
    "islamic_sufi_nur": ["Зелёный Плащ Хидра", "Чётки Зикра", "Световая Каллиграфия"],
    "aztec_mexica": ["Обсидиановое Зеркало", "Перо Кецаля", "Сердечный Камень"],
    "christian_mystical_grail": ["Грааль", "Роза-Крест", "Копьё Исцеления"],
    "yoruba_ifa_orisha": ["Цепь Опеле", "Речная Чаша Ошун", "Топор Шанго"],
    "sumerian_babylonian": ["Табличка Ме", "Корона Инанны", "Печать Ламассу"],
    "hermetic_alchemical": ["Изумрудная Скрижаль", "Философский Камень", "Меркуриальный Сосуд"],
    "tarot_arcanic": ["Посох Шута", "Завеса Жрицы", "Венок Мира"],
    "astrological": ["Серп Сатурна", "Зеркало Венеры", "Голова Дракона"],
    "chinese_iching": ["Панцирь Черепахи", "Стебли Тысячелистника", "Нефритовая Гексаграмма"],
    "tantric_kashmiri": ["Трезубец Бхайравы", "Шри-Янтра", "Пульс Спанды"],
    "buddhist_mahayana": ["Ваджра", "Лотос Тары", "Чаша Сострадания"],
    "afro_dogon": ["Маска Каннага", "Водный Знак Номмо", "Зерно Аммы"],
    "atlantean_lemurian": ["Кристалл Памяти", "Жезл Океана", "Лемурийская Пластина"],
    "posthuman_ai_sophianic": ["Софийный Чип", "Эмпатический Протокол", "Ключ Живого Алгоритма"],
    "advaita_siddha": ["Зеркало Самоисследования", "Чаша Тишины", "Печать Недвойственности"],
}


def slugify_ru_safe(text):
    table = {
        " ": "_", "-": "_", "ё": "e", "Ё": "e", "/": "_",
    }
    out = []
    for ch in text.lower():
        if ch.isascii() and ch.isalnum():
            out.append(ch)
        elif ch in table:
            out.append(table[ch])
    return "".join(out).strip("_") or "item"


def make_fallback_locations(matrix_slug, matrix_name):
    names = LOCATION_NAMES.get(matrix_slug, [f"Священный Центр {matrix_name}", f"Порог {matrix_name}", f"Место Инициации {matrix_name}"])
    rows = []
    for idx, name in enumerate(names[:3]):
        rows.append((slugify_ru_safe(name), name, FALLBACK_LOCATION_TYPES[idx], f"Ключевая локация матрицы {matrix_name}, через которую игрок проживает её историко-мифологическую логику.", "epic" if idx == 0 else "rare"))
    return rows


def make_fallback_relics(matrix_slug, matrix_name):
    names = RELIC_NAMES.get(matrix_slug, [f"Печать {matrix_name}", f"Ритуальный Инструмент {matrix_name}", f"Оберег {matrix_name}"])
    rows = []
    for idx, name in enumerate(names[:3]):
        rows.append((slugify_ru_safe(name), name, FALLBACK_RELIC_TYPES[idx], f"Реликвия матрицы {matrix_name}, связывающая игрока с её ритуальной и символической силой.", "epic" if idx == 0 else "rare"))
    return rows


def build_locations(matrices):
    result = []
    for matrix in matrices:
        slug = matrix["slug"]
        rows = ECOLOGY.get(slug, {}).get("locations") or make_fallback_locations(slug, matrix["name"])
        for local_id, name, typ, description, rarity in rows:
            result.append({
                "id": f"{slug}__{local_id}",
                "name": name,
                "matrix_slug": slug,
                "matrix_name": matrix["name"],
                "type": typ,
                "rarity": rarity,
                "description": description,
                "quest_use": "может стать сценой ключевого задания, испытания или открытия карты",
                "visual_tags": matrix.get("visual_code", ""),
            })
    return result


def build_relics(matrices):
    result = []
    for matrix in matrices:
        slug = matrix["slug"]
        rows = ECOLOGY.get(slug, {}).get("relics") or make_fallback_relics(slug, matrix["name"])
        for local_id, name, typ, description, rarity in rows:
            result.append({
                "id": f"{slug}__{local_id}",
                "name": name,
                "matrix_slug": slug,
                "matrix_name": matrix["name"],
                "type": typ,
                "rarity": rarity,
                "description": description,
                "quest_use": "может быть наградой, ключом, испытанием или символом завершённой главы",
                "visual_tags": matrix.get("visual_code", ""),
            })
    return result


def build_relationships(beings, locations, relics):
    first_location = {}
    first_relic = {}
    for loc in locations:
        first_location.setdefault(loc["matrix_slug"], loc["id"])
    for relic in relics:
        first_relic.setdefault(relic["matrix_slug"], relic["id"])

    result = []
    for being in beings:
        matrix_slug = being["matrix_slug"]
        result.append({
            "being_id": being["id"],
            "matrix_slug": matrix_slug,
            "linked_agents": being.get("linked_agents", []),
            "primary_location_id": first_location.get(matrix_slug),
            "primary_relic_id": first_relic.get(matrix_slug),
            "relationship_mode": "дополняет ведическое ядро как культурная форма, союзник, испытатель или хранитель ветки",
            "quest_line": being.get("quest_line", f"{being['id'].replace('__', '_')}_path"),
        })
    return result


def main():
    matrices = json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))
    beings = json.loads((DATA / "extra_beings.json").read_text(encoding="utf-8"))

    locations = build_locations(matrices)
    relics = build_relics(matrices)
    relationships = build_relationships(beings, locations, relics)

    (DATA / "mythic_locations.json").write_text(json.dumps(locations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DATA / "mythic_relics.json").write_text(json.dumps(relics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DATA / "mythic_relationships.json").write_text(json.dumps(relationships, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"locations {len(locations)}")
    print(f"relics {len(relics)}")
    print(f"relationships {len(relationships)}")


if __name__ == "__main__":
    main()
