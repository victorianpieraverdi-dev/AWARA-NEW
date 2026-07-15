import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"
BASE_STYLE = "premium mystical tarot card art, Vedic-Puranic cosmology, ornate golden border frame, portrait orientation, highly detailed, 8k, cinematic sacred atmosphere, symbolic hierarchy, mythological authority"

LOKA_FORCES = {
    "vedic_loka_satya_loka": [
        ("brahma_lord_of_satya", "Брахма — Владыка Сатья-локи", "ruler", "mythic", "Эфир", "правитель творящего знания", "управляет высшей архитектурой проявленного космоса, принципом истины и творческим словом", "открывает игроку испытания правды, ответственности за мысль и чистоты намерения", "four-faced Brahma enthroned in a golden-white lotus cosmos, creator scriptures, swan light, truth palaces"),
        ("satya_rishis", "Риши Сатья-локи", "inhabitants", "legendary", "Эфир", "совет освобождённых мудрецов", "хранят память о циклах творения и различение между истиной и иллюзией", "усиливают мудрость, ясность и способность игрока видеть корень события", "luminous liberated sages of Satya-loka, transparent bodies of mantra light, cosmic scrolls"),
        ("satya_dharma_order", "Порядок Сатьи", "law", "legendary", "Эфир", "закон соответствия истине", "всё ложное теряет форму, а всё истинное становится устойчивым и сияющим", "выпадение требует честного выбора и может открыть редкие карты истины", "abstract divine law of truth, crystalline scales, white-gold mandala, dissolving false forms")
    ],
    "vedic_loka_tapas_loka": [
        ("tapas_fire_ascetics", "Огненные Тапасвины", "ruler", "legendary", "Огонь", "владыки аскетического жара", "управляют внутренним огнём дисциплины, обета и добровольного ограничения", "дают игроку усиление воли и квесты самоочищения", "ascetic fire sages seated in pillars of saffron flame, blazing austerity mountains"),
        ("tapas_yogis", "Йоги Тапас-локи", "inhabitants", "epic", "Огонь", "обитатели огненной практики", "превращают боль усилия в свет концентрации и духовную выносливость", "помогают проходить длинные квесты и удерживать streak", "radiant yogis meditating inside sacred fire rings, ash, rudraksha, solar heat"),
        ("tapas_vrata_order", "Закон Враты", "law", "epic", "Огонь", "порядок обета", "каждый обещанный акт создаёт огненный контракт между волей и космосом", "усиливает награды за выполненные обещания и наказывает пустые декларации", "fiery vow seal, Sanskrit-like sacred geometry without readable text, golden-red contract of flame")
    ],
    "vedic_loka_jana_loka": [
        ("sanaka_sages", "Санака и Манасапутры", "ruler", "legendary", "Эфир", "старшие мудрецы ума", "управляют чистым созерцательным знанием и рождением идеи без страсти", "открывают игроку карты инсайта и внутреннего учителя", "childlike ancient sages Sanaka archetype, mind-born lotus realm, blue-white silence"),
        ("jana_loka_mindborn", "Уморожденные Джана-локи", "inhabitants", "epic", "Эфир", "существа чистой мысли", "служат живыми формами идей, мантр и тонких концепций", "дают игроку интеллектуальную ясность и новые сюжетные ветви", "luminous thought-beings, floating lotus diagrams, etheric idea-forms"),
        ("jana_contemplation_order", "Порядок Созерцания", "law", "epic", "Воздух", "закон неподвижного знания", "знание приходит не через захват, а через успокоение ума", "уменьшает хаос выбора и помогает открыть правильный путь", "still mind mandala, floating eye of wisdom, silent blue ether currents")
    ],
    "vedic_loka_mahar_loka": [
        ("bhrigu_maharishi", "Бхригу — Видящий Циклов", "ruler", "legendary", "Воздух", "старший махариши", "наблюдает космические циклы, ритмы времени и последствия действий", "даёт игроку понимание долгих причин и кармических паттернов", "Bhrigu-like great seer watching cosmic cycles, star wheels, mantra winds"),
        ("maharishi_council", "Совет Махариши", "inhabitants", "epic", "Воздух", "хранители мантр и циклов", "удерживают знание между мирами, когда нижние сферы меняются", "открывают квесты памяти, традиции и передачи знания", "council of great rishis in airy cosmic observatory, mantra constellations"),
        ("mahar_kalpa_order", "Закон Калпы", "law", "epic", "Эфир", "порядок космических эпох", "всё имеет цикл рождения, зрелости, растворения и нового начала", "показывает игроку когда действовать, ждать или отпускать", "cosmic kalpa wheel, ages turning, vast airy time mandala")
    ],
    "vedic_loka_svar_loka": [
        ("indra_lord_of_svarga", "Индра — Владыка Сварги", "ruler", "legendary", "Огонь", "царь дэвов", "управляет небесной властью, грозой, победой, заслугой и защитой порядка", "даёт карты победы, признания и испытания гордости", "Indra on Airavata in jeweled Svarga, thunderbolt vajra, golden storm clouds"),
        ("apsara_gandharva_host", "Апсары и Гандхарвы", "inhabitants", "epic", "Воздух", "небесные музыканты и танцовщицы", "управляют красотой, ритмом, искусством, вдохновением и тонким наслаждением", "усиливают творческие квесты и карты красоты", "apsaras dancing with gandharvas in celestial music palace, jeweled clouds"),
        ("svarga_punya_order", "Закон Пуньи", "law", "epic", "Огонь", "порядок заслуги", "благие действия созревают как небесная радость, но не дают окончательного освобождения", "награждает игрока за добрые действия, но напоминает о непостоянстве награды", "golden merit scales in heaven, fading garlands, radiant but impermanent light")
    ],
    "vedic_loka_bhuvar_loka": [
        ("pitri_ancestors", "Питри — Предки Междумирья", "ruler", "epic", "Воздух", "родовые хранители", "управляют памятью рода, невидимыми благословениями и нерешёнными наследствами", "открывают родовые квесты и очищение памяти", "ancestral lights in atmospheric realm, floating offerings, dusk winds"),
        ("yaksha_space_spirits", "Якши Бхувар-локи", "inhabitants", "rare", "Земля", "духи места и сокровищ", "охраняют переходы, деревья, камни, тайники и энергетические узлы", "дают игроку шанс найти скрытые карты и локальные знаки", "yaksha guardians in floating shrines between earth and sky, treasure roots"),
        ("bhuvar_prana_order", "Закон Праны", "law", "epic", "Воздух", "порядок жизненного дыхания", "всё живое связано потоками дыхания, внимания и тонкого влияния", "влияет на daily energy, синхронии и восстановление", "visible pranic winds connecting beings, silver-blue breath mandala")
    ],
    "vedic_loka_bhu_loka": [
        ("prithvi_guardian", "Притхви — Хранительница Бху-локи", "ruler", "legendary", "Земля", "земная мать и основа воплощения", "управляет телом, пищей, домом, плодородием, терпением и кармическим полем действий", "даёт игроку квесты воплощения, заботы о теле и ответственности", "Prithvi as sacred Earth mother, mountains, rivers, animals, fertile soil, temple world"),
        ("embodied_jivas", "Воплощённые Дживы", "inhabitants", "rare", "Земля", "люди и живые существа", "учатся через действие, отношения, ошибку, труд, любовь и время", "открывают практические земные задания и карты выбора", "many embodied souls on sacred Earth path, villages, forests, karma roads"),
        ("bhu_karma_order", "Закон Действия", "law", "epic", "Земля", "порядок воплощённой кармы", "только действие в материи превращает знание в судьбу", "усиливает награды за реальные поступки, а не только размышления", "earth mandala of footprints, seeds, tools, karma paths, sacred soil")
    ],
    "vedic_loka_atala_loka": [
        ("bala_atala_sorcerer", "Бала — Чародей Аталы", "ruler", "epic", "Земля", "владыка иллюзорного наслаждения", "управляет чарами желания, соблазном силы и плотной магнетичностью удовольствия", "проверяет игрока на зависимость, честность желания и границы", "asura sorcerer Bala in jeweled pleasure caverns, emerald illusion light"),
        ("atala_pleasure_asuras", "Асуры Наслаждения", "inhabitants", "rare", "Вода", "обитатели чарующего опыта", "создают миры удовольствия, игры, опьянения и привязанности", "дают карты искушения, харизмы и телесной осознанности", "pleasure asuras in subterranean jewel palaces, seductive but symbolic atmosphere"),
        ("atala_desire_order", "Закон Желания", "law", "epic", "Огонь", "порядок влечения", "желание раскрывает нехватку, но может стать дверью к силе, если осознано", "выпадение задаёт игроку вопрос о цене удовольствия", "fiery desire mandala in emerald cavern, chains becoming lotus vines")
    ],
    "vedic_loka_vitala_loka": [
        ("bhairava_underfire", "Бхайрава Подземного Огня", "ruler", "legendary", "Огонь", "страшная сила трансформации", "управляет скрытым огнём, который сжигает подавленное и выводит тень наружу", "открывает жёсткие, но очищающие shadow-квесты", "Bhairava-like dark fire presence, black-gold flames, subterranean altar"),
        ("vitala_fire_ganas", "Огненные Ганы Виталы", "inhabitants", "rare", "Огонь", "подземные помощники трансформации", "двигают жар гнева, страха и силы через тело и действие", "дают карты очищения, злости и смелого признания", "fiery subterranean ganas dancing around molten ritual fire"),
        ("vitala_alchemy_order", "Закон Алхимии", "law", "epic", "Металл", "порядок превращения тени", "то, что отвергнуто, возвращается как материал трансформации", "помогает превращать кризисы в ресурсы", "black-gold alchemical yantra, molten metal, shadow turning into light")
    ],
    "vedic_loka_sutala_loka": [
        ("mahabali_sutala_king", "Махабали — Царь Суталы", "ruler", "legendary", "Земля", "благородный асурический царь", "управляет достоинством после потери, щедростью, смирением и подземной суверенностью", "даёт игроку испытания власти, уступки и благородства", "Mahabali on golden underworld throne, humble royal dignity, Vamana light"),
        ("vamana_guardian", "Вамана — Хранитель Предела", "inhabitants", "legendary", "Эфир", "божественный хранитель обета", "измеряет гордость тремя шагами и восстанавливает космическую меру", "открывает квесты меры, обещания и правильного предела", "Vamana dwarf avatar radiant in Sutala, cosmic three steps, sacred umbrella"),
        ("sutala_sovereignty_order", "Закон Суверенности", "law", "epic", "Земля", "порядок зрелой власти", "власть истинна только тогда, когда может склониться перед высшим", "влияет на лидерские квесты и карты ответственности", "golden underworld crown bowing before cosmic light, sovereignty mandala")
    ],
    "vedic_loka_talatala_loka": [
        ("maya_danava_architect", "Майя Данава — Архитектор Талаталы", "ruler", "legendary", "Металл", "мастер иллюзии и форм", "управляет магической инженерией, дворцами, лабиринтами и точной силой формы", "открывает техномагические квесты и испытания иллюзии", "Maya Danava in impossible metal palace, yantra machines, glowing labyrinths"),
        ("talatala_asura_builders", "Асурические Строители", "inhabitants", "rare", "Металл", "мастера материи и конструкции", "создают формы, инструменты, системы и ловушки восприятия", "дают игроку карты стратегии, структуры и технического таланта", "asura architects building yantra engines in subterranean metal city"),
        ("talatala_maya_order", "Закон Майи", "law", "epic", "Воздух", "порядок формы и иллюзии", "форма может раскрывать истину или скрывать её за совершенством оболочки", "проверяет игрока на самообман и зависимость от образа", "illusion labyrinth mandala, mirrors, metal geometry, false doors and true portal")
    ],
    "vedic_loka_mahatala_loka": [
        ("takshaka_naga_lord", "Такшака — Наг Махаталы", "ruler", "legendary", "Вода", "змеиный владыка глубин", "управляет ядом, защитой, древней памятью тела и силой скрытого укуса", "открывает квесты инстинкта, границ и памяти", "Takshaka-like naga lord in blue-green serpent palace, jewel hood, deep waters"),
        ("mahatala_naga_clans", "Кланы Нагов Махаталы", "inhabitants", "epic", "Вода", "змеиные роды подземных вод", "хранят сокровища, родовую память, исцеление и опасную мудрость яда", "дают карты защиты, тайного знания и телесного чутья", "naga clans coiled around subterranean lakes, jewel treasures, ancient serpent wisdom"),
        ("mahatala_venom_order", "Закон Яда", "law", "epic", "Вода", "порядок токсина и лекарства", "то, что отравляет в неосознанности, исцеляет в правильной дозе", "помогает игроку работать с ревностью, болью и защитой", "venom-to-medicine mandala, serpent drops, blue-green healing poison light")
    ],
    "vedic_loka_rasatala_loka": [
        ("danava_depth_lords", "Данавы Глубин Расаталы", "ruler", "epic", "Вода", "владыки плотной силы rasa", "управляют глубинным вкусом опыта, родовой мощью и тяжёлыми водами желания", "открывают квесты мотива, жажды и силы рода", "danava lords in deep crimson-blue watery fortress, heavy rasa rivers"),
        ("rasatala_daitya_clans", "Дайтьи Расаталы", "inhabitants", "rare", "Земля", "мощные асурические роды", "несут силу сопротивления, выживания, обиды и древней конкуренции с дэвами", "дают карты конфликта, сопротивления и теневой силы", "daitya clans in subterranean fortresses, massive bodies, dark banners, sacred density"),
        ("rasatala_rasa_order", "Закон Расы", "law", "epic", "Вода", "порядок вкуса опыта", "каждый опыт имеет вкус, но привязанность к вкусу создаёт зависимость", "проверяет игрока на жажду эмоций, власти и повторения", "dark river of rasa, taste mandala, drops becoming chains and pearls")
    ],
    "vedic_loka_pātala_loka": [
        ("ananta_shesha_foundation", "Ананта-Шеша — Основание Миров", "ruler", "mythic", "Тьма", "космический змей основания", "держит глубинное основание миров и служит ложем Вишну в космическом покое", "открывает самые глубокие квесты основания, сна, доверия и возвращения к корню", "Ananta Shesha infinite serpent coils in jeweled cosmic darkness, Vishnu resting, underground stars"),
        ("vasuki_naga_king", "Васуки — Царь Нагов", "inhabitants", "legendary", "Вода", "владыка змеиных союзов", "управляет силой связывания, клятвами, ядом, сокровищами и глубинными договорами", "даёт карты союза, обязательства и опасной силы", "Vasuki naga king with jeweled hood, dark blue Patala palace, serpent oath light"),
        ("patala_root_order", "Закон Основания", "law", "legendary", "Тьма", "порядок корневой глубины", "свет может подняться только настолько, насколько признана его тёмная основа", "заставляет игрока встретиться с первичным страхом и опорой", "primordial root mandala in black-blue darkness, serpent coils supporting worlds")
    ]
}


def prompt_for(card):
    return (
        f"A supreme mystical tarot-style card depicting {card['name']}, a {card['hierarchy_role']} connected to {card['loka_name']} ({card['loka_sanskrit']}) in Vedic cosmology. "
        f"Role: {card['role']}. Authority and influence: {card['influence']}. "
        f"Effect on player experience: {card['player_effect']}. "
        f"Mythological context: this being/order belongs to the hierarchy of {card['loka_name']} and expresses its cosmic law, inhabitants, rulers and subtle forces. "
        f"Visual scene: {card['visual']}. "
        f"Rarity treatment: {'transcendent mythic aura, universe-level presence, prismatic sacred geometry' if card['rarity']=='mythic' else 'legendary divine aura, golden sacred authority, immense mythic presence' if card['rarity']=='legendary' else 'epic dramatic sacred lighting, powerful symbolic detail' if card['rarity']=='epic' else 'refined mystical atmosphere, grounded mythological detail'}. "
        f"No modern objects, no text on card, no western fantasy clichés, respectful Vedic-Puranic atmosphere. {BASE_STYLE}"
    )


def main():
    lokas = {c["card_id"]: c for c in json.loads((DATA / "vedic_loka_cards.json").read_text(encoding="utf-8"))}
    cards = []
    for loka_id, entries in LOKA_FORCES.items():
        loka = lokas[loka_id]
        for slug, name, hierarchy_role, rarity, element, role, influence, player_effect, visual in entries:
            card = {
                "card_id": f"vedic_loka_being__{slug}",
                "card_type": "vedic_loka_being",
                "rarity": rarity,
                "matrix_slug": "vedic",
                "matrix_name": "Ведическая",
                "loka_id": loka_id,
                "loka_name": loka["display_name"],
                "loka_sanskrit": loka["sanskrit"],
                "loka_axis": loka["axis"],
                "cosmic_order": loka["cosmic_order"],
                "display_name": name,
                "name": name,
                "hierarchy_role": hierarchy_role,
                "element": element,
                "role": role,
                "influence": influence,
                "player_effect": player_effect,
                "visual": visual,
                "description": f"{role}: {influence}",
                "game_significance": {
                    "significance_tier": "loka_ruler" if hierarchy_role == "ruler" else "loka_order" if hierarchy_role == "law" else "loka_inhabitant",
                    "gameplay_hint": player_effect,
                    "loka_axis": loka["axis"],
                    "cosmic_order": loka["cosmic_order"],
                    "hierarchy_role": hierarchy_role
                },
                "unlock_context": ["vedic_loka", "loka_hierarchy", "realm_drop", "cosmic_quest"],
                "future_effect_hooks": ["loka_affinity", "hierarchy_synergy", "vedic_realm_drop", "cosmic_order_progression"],
                "negative_prompt": NEGATIVE,
                "image_path": f"cards_loka_beings/vedic_loka_being__{slug}.webp",
                "type_label": "ОБИТАТЕЛЬ ЛОКИ"
            }
            card["prompt"] = prompt_for(card)
            cards.append(card)
    (DATA / "vedic_loka_being_cards.json").write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"vedic loka being cards {len(cards)}")


if __name__ == "__main__":
    main()
