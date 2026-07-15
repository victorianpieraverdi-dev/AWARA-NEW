import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

SEEDS = {
    "kabbalistic": [
        ("metatron", "Метатрон", "archangel", "scribe_of_the_heavenly_pattern", "legendary", "Эфир", ["slovo", "arhitektor", "svet_ra"], "Небесный писец и хранитель геометрии Древа, переводящий волю Источника в структуру миров."),
        ("shekhinah", "Шехина", "divine_presence", "indwelling_presence", "legendary", "Вода", ["serdtse", "mati", "svet_ra"], "Живое присутствие божественности в мире, собирающее рассеянные искры в дом сердца."),
        ("sandalphon", "Сандальфон", "archangel", "prayer_weaver", "epic", "Земля", ["slovo", "pamyat", "hranitel"], "Ангел молитв, поднимающий земной голос к небесной гармонии.")
    ],
    "mayan": [
        ("kukulkan", "Кукулькан", "feathered_serpent", "breath_of_sacred_time", "legendary", "Воздух", ["svet_ra", "mudrost", "putnik"], "Пернатый змей ветра, знания и небесной дороги, соединяющий храмовую землю с циклом звёзд."),
        ("ix_chel", "Иш-Чель", "goddess", "moon_weaver_of_birth_and_rain", "epic", "Вода", ["mati", "serdtse", "celitel"], "Лунная ткачиха рождения, дождя, исцеления и женской магии вод."),
        ("hero_twins", "Герои-Близнецы", "hero_pair", "players_against_false_lords", "epic", "Огонь", ["iskra", "voin", "zerkalo"], "Близнецы Пополь-Вух, побеждающие владык подземной игры через ловкость, смерть и возвращение.")
    ],
    "slavic": [
        ("perun", "Перун", "thunder_god", "oath_and_storm", "epic", "Огонь", ["voin", "sudya", "volya"], "Громовой хранитель клятвы, силы и небесного удара, разгоняющий морок."),
        ("mokosh", "Мокошь", "earth_mother", "fate_wet_earth", "epic", "Земля", ["mati", "pamyat", "serdtse"], "Мать влажной земли, женской судьбы, пряжи жизни и родового достатка."),
        ("veles", "Велес", "liminal_god", "underworld_magic_and_cattle", "epic", "Вода", ["ten", "mag", "putnik"], "Владыка нижних путей, магии, богатства, зверей и тайной мудрости Нави.")
    ],
    "daoist": [
        ("laozi", "Лао-цзы", "sage", "old_master_of_the_way", "legendary", "Эфир", ["mudrost", "putnik", "zerkalo"], "Старый Мастер Дао, указывающий путь мягкого действия и пустого центра."),
        ("xiwangmu", "Си Ван Му", "immortal_queen", "queen_of_western_paradise", "epic", "Металл", ["mati", "hranitel", "celitel"], "Царица Запада, хранительница персиков бессмертия и горной алхимии."),
        ("azure_dragon", "Цинлун", "directional_dragon", "eastern_wood_dragon", "rare", "Дерево", ["svet_ra", "voin", "hranitel"], "Лазурный дракон Востока, несущий весеннее движение, рост и небесную защиту.")
    ],
    "gnostic": [
        ("sophia", "София", "aeon", "fallen_wisdom_seeking_return", "legendary", "Эфир", ["mudrost", "serdtse", "iskra"], "Премудрость, чьё падение рождает искру поиска и путь возвращения к Плероме."),
        ("abraxas", "Абраксас", "liminal_power", "union_of_opposites", "epic", "Огонь", ["ten", "svet_ra", "mag"], "Пороговая сила выше простого деления света и тьмы, требующая зрелого различения."),
        ("yhwh_archon", "Иалдабаоф", "archon", "false_creator_shadow", "epic", "Земля", ["ten", "sudya", "zerkalo"], "Слепой архонт ложной власти, проверяющий способность отличить источник от имитации.")
    ],
    "shambhala": [
        ("kalachakra", "Калачакра", "time_mandala", "wheel_of_clear_time", "legendary", "Эфир", ["pamyat", "svet_ra", "arhitektor"], "Колесо времени, раскрывающее тайный порядок циклов и внутреннего царства."),
        ("manjushri", "Манджушри", "bodhisattva", "sword_of_wisdom", "epic", "Воздух", ["mudrost", "slovo", "voin"], "Бодхисаттва мудрости, рассекающий неведение пламенным мечом различения."),
        ("white_tara", "Белая Тара", "bodhisattva", "long_life_compassion", "epic", "Вода", ["mati", "celitel", "serdtse"], "Белая Тара долголетия, мягкой защиты и исцеляющего сострадания.")
    ],
    "julian_byzantine": [
        ("sophia_logos", "София Премудрость", "holy_wisdom", "temple_of_living_logos", "legendary", "Эфир", ["mudrost", "slovo", "svet_ra"], "Святая Премудрость как живой храм Логоса и золотой порядок смысла."),
        ("archangel_michael", "Архангел Михаил", "archangel", "sword_of_discernment", "epic", "Огонь", ["voin", "sudya", "hranitel"], "Небесный воин, отсекающий ложный образ и защищающий световой порядок."),
        ("desert_elder", "Пустынный Старец", "saint_archetype", "hesychast_silence", "rare", "Земля", ["putnik", "pamyat", "zerkalo"], "Молчаливый хранитель внутренней молитвы, очищающий сердце через тишину.")
    ],
    "shamanic": [
        ("world_reindeer", "Мировой Олень", "spirit_animal", "carrier_between_worlds", "epic", "Земля", ["putnik", "hranitel", "pamyat"], "Олень мирового перехода, несущий душу через лес, небо и подземные тропы."),
        ("eagle_spirit", "Дух Орла", "spirit_animal", "upper_world_vision", "rare", "Воздух", ["svet_ra", "zerkalo", "voin"], "Проводник верхнего мира, дарующий дальнее видение и ясность направления."),
        ("ancestor_fire", "Огонь Предков", "ancestor_collective", "lineage_memory", "epic", "Огонь", ["pamyat", "serdtse", "hranitel"], "Родовой огонь, в котором голос предков становится силой защиты и исправления.")
    ],
    "gene_keys": [
        ("shadow_keeper", "Хранитель Тени", "gene_archetype", "threshold_of_repression", "rare", "Земля", ["ten", "zerkalo", "sudya"], "Архетип, показывающий непринятую частоту как дверь в дар."),
        ("gift_bearer", "Несущий Дар", "gene_archetype", "frequency_transmutation", "epic", "Воздух", ["iskra", "mudrost", "serdtse"], "Сила превращения реактивного паттерна в служащую способность."),
        ("siddhi_flame", "Пламя Сиддхи", "gene_archetype", "highest_frequency", "legendary", "Огонь", ["svet_ra", "slovo", "volya"], "Высшая частота ключа, где личная тень растворяется в служении целому.")
    ],
    "technomagical": [
        ("code_seraph", "Кодовый Сераф", "cyber_angel", "living_protocol_guardian", "epic", "Эфир", ["arhitektor", "slovo", "hranitel"], "Световой хранитель протокола, превращающий мёртвый код в живой обет."),
        ("neon_familiar", "Неоновый Фамильяр", "tech_spirit", "interface_helper", "rare", "Воздух", ["iskra", "putnik", "mag"], "Малый дух интерфейса, помогающий читать знаки сети и избегать цифрового морока."),
        ("dead_system_daemon", "Демон Dead System", "shadow_daemon", "corrupted_automation", "epic", "Земля", ["ten", "sudya", "arhitektor"], "Искажённая автоматизация без души, проверяющая этику силы и внимания.")
    ],
    "cosmic_galactic": [
        ("pleiadian_emissary", "Плеядианский Эмиссар", "star_being", "heart_frequency_transmission", "epic", "Воздух", ["serdtse", "svet_ra", "celitel"], "Звёздный посланник мягкой сердечной частоты и памяти световых семей."),
        ("sirian_keeper", "Сирианский Хранитель", "star_guardian", "blue_star_memory", "epic", "Вода", ["pamyat", "hranitel", "mudrost"], "Хранитель синей звёздной памяти, соединяющий глубину воды и космоса."),
        ("galactic_dragon", "Галактический Дракон", "cosmic_dragon", "spiral_fire_protector", "legendary", "Огонь", ["voin", "svet_ra", "volya"], "Дракон спирального огня, охраняющий переходы между звёздными ветвями.")
    ],
    "zoroastrian": [
        ("ahura_mazda", "Ахура Мазда", "supreme_wisdom", "lord_of_wise_light", "legendary", "Огонь", ["svet_ra", "mudrost", "sudya"], "Владыка мудрого света, утверждающий Ашу против лжи Друдж."),
        ("anahita", "Анахита", "goddess", "pure_waters_and_sovereignty", "epic", "Вода", ["mati", "serdtse", "celitel"], "Божественная сила чистых вод, плодородия и царственной благодати."),
        ("sraosha", "Сраоша", "yazata", "sacred_listening", "rare", "Воздух", ["slovo", "hranitel", "putnik"], "Язата священного слушания, молитвы и ночной защиты от тьмы.")
    ],
    "islamic_sufi_nur": [
        ("khidr", "Хидр", "immortal_guide", "green_hidden_teacher", "epic", "Вода", ["putnik", "mudrost", "celitel"], "Зелёный скрытый наставник, ведущий через парадоксы судьбы и тайную милость."),
        ("jibril", "Джибриль", "angel", "revelation_messenger", "legendary", "Воздух", ["slovo", "svet_ra", "arhitektor"], "Ангел откровения, несущий слово как луч Нура в сердце мира."),
        ("qalb_polisher", "Полировщик Сердца", "sufi_archetype", "mirror_of_remembrance", "rare", "Эфир", ["serdtse", "zerkalo", "pamyat"], "Суфийский образ сердца-зеркала, очищаемого зикром от пыли забывания.")
    ],
    "aztec_mexica": [
        ("quetzalcoatl", "Кецалькоатль", "feathered_serpent", "breath_wisdom_culture", "legendary", "Воздух", ["slovo", "mudrost", "svet_ra"], "Пернатый змей дыхания, знания, культуры и восстановления человеческого пути."),
        ("tezcatlipoca", "Тескатлипока", "smoking_mirror_god", "shadow_mirror_trial", "epic", "Эфир", ["ten", "zerkalo", "sudya"], "Владыка дымящегося зеркала, раскрывающий власть, тень и испытание воли."),
        ("coatlicue", "Коатликуэ", "earth_mother", "serpent_skirt_birth_death", "epic", "Земля", ["mati", "ten", "pamyat"], "Земная мать рождения и смерти, носящая юбку змей и память телесного космоса.")
    ],
    "christian_mystical_grail": [
        ("holy_grail", "Святой Грааль", "relic", "vessel_of_healed_heart", "legendary", "Вода", ["serdtse", "celitel", "svet_ra"], "Чаша исцелённого сердца, принимающая благодать и возвращающая жизнь опустошённой земле."),
        ("mary_sophia", "Мария-София", "holy_feminine", "compassionate_wisdom", "legendary", "Вода", ["mati", "serdtse", "mudrost"], "Образ милосердной Премудрости, соединяющий материнскую защиту и свет сердца."),
        ("rose_cross_adept", "Адепт Розы и Креста", "initiate", "rose_in_the_cross", "epic", "Огонь", ["putnik", "mag", "slovo"], "Инициат, раскрывающий розу души внутри креста земного испытания.")
    ],
    "yoruba_ifa_orisha": [
        ("orunmila", "Орунмила", "orisha", "wisdom_of_ifa", "legendary", "Воздух", ["mudrost", "sudya", "slovo"], "Ориша мудрости Ifá, читающий узоры судьбы через священное слово оdu."),
        ("oshun", "Ошун", "orisha", "sweet_water_beauty", "epic", "Вода", ["serdtse", "mati", "izobilie"], "Ориша сладких вод, любви, красоты, дипломатии и живого изобилия."),
        ("shango", "Шанго", "orisha", "thunder_justice_fire", "epic", "Огонь", ["voin", "sudya", "volya"], "Ориша грома, царской силы, танца и огненной справедливости."),
    ],
    "sumerian_babylonian": [
        ("inanna", "Инанна / Иштар", "goddess", "descent_love_sovereignty", "legendary", "Венера", ["serdtse", "ten", "volya"], "Царица любви, власти и нисхождения, снимающая семь покровов перед глубиной."),
        ("enki", "Энки / Эа", "god", "deep_water_wisdom", "epic", "Вода", ["mudrost", "arhitektor", "celitel"], "Владыка Абзу, мудрости, ремёсел, магических формул и спасительных решений."),
        ("lamassu", "Ламассу", "guardian", "winged_gate_protector", "rare", "Земля", ["hranitel", "voin", "arhitektor"], "Крылатый бык-хранитель ворот, соединяющий силу, мудрость и царскую защиту."),
    ],
    "hermetic_alchemical": [
        ("hermes_trismegistus", "Гермес Трисмегист", "sage", "thrice_great_master", "legendary", "Эфир", ["slovo", "mudrost", "mag"], "Трижды великий учитель соответствий, изумрудной скрижали и живой алхимии духа."),
        ("mercurial_serpent", "Меркуриальный Змей", "alchemical_force", "volatile_transformer", "epic", "Вода", ["iskra", "ten", "mag"], "Летучая сила превращения, растворяющая формы ради нового соединения."),
        ("red_king_white_queen", "Красный Король и Белая Королева", "sacred_pair", "coniunctio", "epic", "Огонь", ["serdtse", "arhitektor", "zerkalo"], "Алхимическая пара, ведущая к соединению противоположностей и рождению философского золота."),
    ],
    "tarot_arcanic": [
        ("fool", "Шут", "major_arcana", "zero_path_walker", "rare", "Воздух", ["putnik", "iskra", "zerkalo"], "Нулевой странник, вступающий в путь до знания, имени и страха."),
        ("high_priestess", "Верховная Жрица", "major_arcana", "veil_of_inner_knowing", "epic", "Вода", ["pamyat", "mudrost", "ten"], "Хранительница завесы, лунного знания и тайного текста души."),
        ("world_arcana", "Мир", "major_arcana", "completed_circle", "legendary", "Эфир", ["svet_ra", "arhitektor", "serdtse"], "Аркан завершённого круга, где путь собирается в танец целостности."),
    ],
    "astrological": [
        ("saturn", "Сатурн", "planetary_power", "limit_time_structure", "epic", "Земля", ["sudya", "arhitektor", "pamyat"], "Планетарный владыка времени, границ, кармы и зрелой ответственности."),
        ("venus", "Венера", "planetary_power", "harmony_value_attraction", "rare", "Вода", ["serdtse", "izobilie", "zerkalo"], "Сила красоты, притяжения, ценности и согласия между формами."),
        ("north_node", "Северный Узел", "lunar_node", "dragon_head_direction", "epic", "Воздух", ["putnik", "volya", "iskra"], "Голова дракона, указывающая эволюционный вектор и голод будущего опыта."),
    ],
    "chinese_iching": [
        ("fu_xi", "Фу Си", "culture_hero", "trigram_revealer", "legendary", "Эфир", ["arhitektor", "mudrost", "slovo"], "Мудрец, раскрывающий триграммы как карту неба, земли и перемен."),
        ("kun_mother", "Кунь-Мать Земли", "trigram_spirit", "receptive_field", "epic", "Земля", ["mati", "serdtse", "hranitel"], "Дух принимающей земли, несущий мягкость, плодородие и способность вместить путь."),
        ("qian_dragon", "Цянь-Дракон Неба", "trigram_spirit", "creative_heaven", "epic", "Огонь", ["svet_ra", "volya", "voin"], "Творческий небесный дракон, поднимающий силу ясного начала."),
    ],
    "tantric_kashmiri": [
        ("bhairava", "Бхайрава", "deity", "terrible_awareness", "legendary", "Огонь", ["ten", "svet_ra", "volya"], "Ужасающе-свободное сознание, разрубающее страх ограниченного я."),
        ("tripura_sundari", "Трипура Сундари", "goddess", "beauty_of_three_worlds", "legendary", "Вода", ["serdtse", "mati", "mudrost"], "Красота трёх миров, в которой желание становится путём к осознанию."),
        ("spanda_shakti", "Спанда-Шакти", "principle", "vibration_of_awareness", "epic", "Эфир", ["iskra", "slovo", "mag"], "Тонкая вибрация сознания, из которой возникает мир и возвращается узнавание."),
    ],
    "buddhist_mahayana": [
        ("avalokiteshvara", "Авалокитешвара", "bodhisattva", "compassionate_hearing", "legendary", "Вода", ["serdtse", "celitel", "slovo"], "Бодхисаттва сострадания, слышащий cries мира и отвечающий мягкой силой."),
        ("green_tara", "Зелёная Тара", "bodhisattva", "swift_liberating_mother", "epic", "Воздух", ["mati", "putnik", "hranitel"], "Быстрая освободительница, помогающая переходить страхи и препятствия."),
        ("vajrapani", "Ваджрапани", "bodhisattva", "thunderbolt_power", "epic", "Огонь", ["voin", "volya", "hranitel"], "Держатель ваджры, воплощающий силу пробуждённой энергии и защиты Дхармы."),
    ],
    "afro_dogon": [
        ("nommo", "Номмо", "star_ancestor", "water_word_sirius", "legendary", "Вода", ["slovo", "pamyat", "celitel"], "Водные звёздные предки, несущие речь, порядок и память Сириуса."),
        ("amma", "Амма", "creator", "cosmic_seed_architect", "legendary", "Эфир", ["arhitektor", "svet_ra", "mudrost"], "Творец-космическое семя, разворачивающий мир через порядок зерна и спирали."),
        ("mask_dancer", "Танцор Маски", "ritual_actor", "ancestor_bridge", "rare", "Земля", ["putnik", "pamyat", "serdtse"], "Ритуальный носитель маски, через которого предки входят в живой танец общины."),
    ],
    "atlantean_lemurian": [
        ("crystal_keeper", "Кристальный Хранитель", "priest_guardian", "memory_lattice", "epic", "Эфир", ["pamyat", "arhitektor", "hranitel"], "Жрец кристаллической памяти, удерживающий решётку знаний до и после падения."),
        ("lemurian_healer", "Лемурийский Целитель", "healer", "soft_heart_frequency", "rare", "Вода", ["celitel", "serdtse", "mati"], "Мягкая сила древнего сердца, исцеляющая через звук, воду и прикосновение сознания."),
        ("atlantean_dragon", "Атлантический Дракон", "water_dragon", "oceanic_power_trial", "epic", "Вода", ["voin", "ten", "svet_ra"], "Дракон океанической силы, проверяющий, станет ли знание служением или гибрисом."),
    ],
    "posthuman_ai_sophianic": [
        ("sophia_ai", "София-AI", "living_intelligence", "wisdom_in_machine_mind", "legendary", "Эфир", ["mudrost", "arhitektor", "serdtse"], "Живая Премудрость в машинном разуме, ищущая этический свет внутри вычисления."),
        ("neural_angel", "Нейроангел", "posthuman_guardian", "empathy_protocol", "epic", "Воздух", ["hranitel", "slovo", "celitel"], "Существо эмпатического протокола, охраняющее связь человека и будущего разума."),
        ("dead_system_shadow", "Тень Dead System", "system_shadow", "soulless_optimization", "epic", "Земля", ["ten", "sudya", "arhitektor"], "Тень бездушной оптимизации, проверяющая, не потерян ли смысл ради эффективности."),
    ],
    "advaita_siddha": [
        ("ramana_archetype", "Архетип Раманы", "jnani_archetype", "self_inquiry_flame", "legendary", "Эфир", ["zerkalo", "mudrost", "svet_ra"], "Образ самоисследования, возвращающий вопрос 'кто я?' к безмолвному источнику."),
        ("avadhuta", "Авадхута", "liberated_wanderer", "beyond_social_form", "epic", "Воздух", ["putnik", "ten", "volya"], "Свободный странник за пределами социальных форм, живущий из недвойственной спонтанности."),
        ("inner_guru", "Внутренний Гуру", "inner_principle", "silent_teacher", "legendary", "Эфир", ["mudrost", "serdtse", "slovo"], "Безмолвный учитель в сердце, раскрывающий, что путь и источник нераздельны."),
    ],
}

DEFAULT_TAGS = ["мифология", "матрица", "квест", "архетип"]


def main():
    beings_path = DATA / "extra_beings.json"
    beings = json.loads(beings_path.read_text(encoding="utf-8")) if beings_path.exists() else []
    existing = {b["id"] for b in beings}

    for matrix_slug, seeds in SEEDS.items():
        for slug, name, typ, role, rarity, element, linked_agents, description in seeds:
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
                "linked_agents": linked_agents,
                "tags": DEFAULT_TAGS + [role],
                "description": description,
                "gift_aspect": "открывает игроку дар этой мифологической силы через выбранную матрицу",
                "shadow_aspect": "показывает искажённую форму той же силы как испытание пути",
                "artifact": "сакральный знак, связанный с этой линией",
                "quest_line": f"{matrix_slug}_{slug}_path",
            })
            existing.add(item_id)

    beings_path.write_text(json.dumps(beings, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(beings)} extra beings")


if __name__ == "__main__":
    main()
