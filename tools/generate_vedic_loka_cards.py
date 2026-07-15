import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"
BASE_STYLE = "premium mystical tarot card art, Vedic cosmology, ornate golden border frame, portrait orientation, highly detailed, 8k, cinematic sacred atmosphere, intricate mandalas, divine worldbuilding"

LOKAS = [
    {
        "id": "vedic_loka_satya_loka",
        "name": "Сатья-лока",
        "sanskrit": "Satya-loka / Brahma-loka",
        "axis": "upper",
        "order": 14,
        "rarity": "mythic",
        "element": "Эфир",
        "inhabitants": ["Брахма", "великие риши", "освобождённые мудрецы", "существа чистой истины"],
        "mythology": "Высшая обитель Брахмы и мир истины, находящийся выше обычных циклов рождения и смерти. В пуранической космологии это вершина проявленного космоса, где знание почти не отделено от бытия.",
        "philosophy": "Сознание, которое перестало спорить с истиной. Финальная прозрачность ума перед непроявленным.",
        "shadow": "Опасность духовной гордыни: принять близость к истине за окончательное освобождение.",
        "visual": "an infinite golden-white lotus cosmos, Brahma's radiant realm, four-faced creator light, vast truth palaces, transparent ether, sages made of luminosity"
    },
    {
        "id": "vedic_loka_tapas_loka",
        "name": "Тапас-лока",
        "sanskrit": "Tapas-loka",
        "axis": "upper",
        "order": 13,
        "rarity": "legendary",
        "element": "Огонь",
        "inhabitants": ["тапасвины", "аскеты огня", "великие йоги", "сияющие отшельники"],
        "mythology": "Мир великих аскетов и существ, накопивших силу через тапас — внутренний жар дисциплины, молитвы, практики и самоограничения.",
        "philosophy": "Огонь усилия, который сжигает лишнее и превращает желание в силу сознания.",
        "shadow": "Аскеза без любви превращается в сухую жестокость к себе и миру.",
        "visual": "a blazing ascetic heaven of saffron fire, meditating rishis, pillars of tapas flame, austere crystal mountains, solar austerity and sacred heat"
    },
    {
        "id": "vedic_loka_jana_loka",
        "name": "Джана-лока",
        "sanskrit": "Jana-loka",
        "axis": "upper",
        "order": 12,
        "rarity": "legendary",
        "element": "Эфир",
        "inhabitants": ["манасапутры", "сыновья ума Брахмы", "санакари", "древние мудрецы"],
        "mythology": "Мир духовно-рождённых мудрецов, связанных с умственным творением Брахмы и высшим созерцательным знанием.",
        "philosophy": "Уровень, где мысль становится не шумом, а чистым органом творения.",
        "shadow": "Оторванность от воплощения: мудрость, которая не умеет спуститься в жизнь.",
        "visual": "a serene realm of mind-born sages, floating thought-lotuses, luminous childlike rishis, blue-white ether libraries, silent creative intelligence"
    },
    {
        "id": "vedic_loka_mahar_loka",
        "name": "Махар-лока",
        "sanskrit": "Mahar-loka",
        "axis": "upper",
        "order": 11,
        "rarity": "legendary",
        "element": "Воздух",
        "inhabitants": ["махариши", "Бхригу", "видящие космических циклов", "хранители мантр"],
        "mythology": "Великий мир махариши, расположенный выше небесных сфер. Его обитатели переживают длинные космические циклы и хранят знание мантр и ритмов времени.",
        "philosophy": "Широта видения, где личная история становится частью огромного космического дыхания.",
        "shadow": "Потеря человеческой конкретности в слишком больших масштабах.",
        "visual": "a vast airy realm of great seers, cosmic winds, mantra constellations, ancient observatories, Bhrigu-like sages watching cycles of creation"
    },
    {
        "id": "vedic_loka_svar_loka",
        "name": "Свар-лока",
        "sanskrit": "Svar-loka / Svarga",
        "axis": "upper",
        "order": 10,
        "rarity": "epic",
        "element": "Огонь",
        "inhabitants": ["Индра", "дэвы", "апсары", "гандхарвы", "васу"],
        "mythology": "Небесная сфера Индры, мир богов, заслуг, красоты, музыки, победы и тонкого наслаждения. Это не окончательное освобождение, а светлый плод благих действий.",
        "philosophy": "Радость заслуженного света, которую всё равно нельзя спутать с вечностью.",
        "shadow": "Привязанность к наградам, красоте и небесному статусу.",
        "visual": "Indra's radiant heaven with jeweled palaces, apsaras dancing, gandharva music, white elephant Airavata, storm-gold clouds, divine celebration"
    },
    {
        "id": "vedic_loka_bhuvar_loka",
        "name": "Бхувар-лока",
        "sanskrit": "Bhuvar-loka / Antariksha",
        "axis": "middle",
        "order": 9,
        "rarity": "epic",
        "element": "Воздух",
        "inhabitants": ["праны", "якши", "питри", "духи пространства", "полубожественные существа"],
        "mythology": "Промежуточная область атмосферы и тонких сил между землёй и небом. Здесь движутся праны, предки, духи пространства и невидимые влияния.",
        "philosophy": "Переходная зона: всё, что не стало телом и ещё не стало чистым светом.",
        "shadow": "Застревание в промежуточности, знаках, призраках и тревожных влияниях.",
        "visual": "a vast atmospheric middle world, floating yaksha shrines, ancestral lights, pranic winds, translucent spirits, dusk sky between earth and heaven"
    },
    {
        "id": "vedic_loka_bhu_loka",
        "name": "Бху-лока",
        "sanskrit": "Bhu-loka / Prithvi-loka",
        "axis": "middle",
        "order": 8,
        "rarity": "epic",
        "element": "Земля",
        "inhabitants": ["люди", "животные", "растения", "земные духи", "воплощённые дживы"],
        "mythology": "Земной мир воплощения, действия, кармы и выбора. Именно здесь духовное знание проверяется материей, телом, отношениями и временем.",
        "philosophy": "Священность воплощения: земля как школа, храм и поле ответственности.",
        "shadow": "Забыть, что материя не тюрьма, а место пробуждения.",
        "visual": "sacred Earth realm in Vedic cosmology, Mount Meru in distance, rivers, forests, villages, animals, humans, temples, fertile soil and karma pathways"
    },
    {
        "id": "vedic_loka_atala_loka",
        "name": "Атала-лока",
        "sanskrit": "Atala-loka",
        "axis": "lower",
        "order": 7,
        "rarity": "epic",
        "element": "Земля",
        "inhabitants": ["Бала", "асуры наслаждения", "чародеи", "существа иллюзорных удовольствий"],
        "mythology": "Один из нижних миров, связанный с властью желания, чарами и наслаждениями. В пуранических описаниях нижние локи не всегда являются адом, а скорее мощными подземными царствами опыта.",
        "philosophy": "Мир, где желание учится отличать жизненность от зависимости.",
        "shadow": "Очарование силой, сексуальностью и удовольствием без сознания.",
        "visual": "a subterranean pleasure realm of Atala, jeweled caverns, seductive illusion palaces, asura sorcerers, emerald darkness, sensual magical atmosphere"
    },
    {
        "id": "vedic_loka_vitala_loka",
        "name": "Витала-лока",
        "sanskrit": "Vitala-loka",
        "axis": "lower",
        "order": 6,
        "rarity": "epic",
        "element": "Огонь",
        "inhabitants": ["формы Бхайравы", "подземные ганы", "алхимические духи", "огненные асуры"],
        "mythology": "Подземный мир, связанный с мистическим огнём, скрытой алхимией и страшными формами трансформации. В некоторых традициях ассоциируется с присутствием Хары-Бхавы.",
        "philosophy": "Скрытый огонь, который работает в глубине психики, пока верхний ум думает, что ничего не происходит.",
        "shadow": "Подавленная сила становится разрушительным подземным жаром.",
        "visual": "a dark alchemical fire underworld, black-gold flames, Bhairava-like presence, subterranean ganas, molten rivers, occult Vedic transformation"
    },
    {
        "id": "vedic_loka_sutala_loka",
        "name": "Сутала-лока",
        "sanskrit": "Sutala-loka",
        "axis": "lower",
        "order": 5,
        "rarity": "legendary",
        "element": "Земля",
        "inhabitants": ["Махабали", "Вамана как хранитель", "благородные асуры", "подземные цари"],
        "mythology": "Царство великого асура Махабали, которому Вишну в форме Ваманы даровал особое подземное царство. Сутала — пример того, что смирение может превратить падение в благословение.",
        "philosophy": "Урок суверенности: настоящий царь не теряет достоинства даже после утраты внешней власти.",
        "shadow": "Испытание гордости, власти и готовности уступить место высшему порядку.",
        "visual": "the noble underworld kingdom of Mahabali, jeweled halls, Vamana's protective light, golden subterranean throne, humble kingly dignity, sacred depth"
    },
    {
        "id": "vedic_loka_talatala_loka",
        "name": "Талатала-лока",
        "sanskrit": "Talatala-loka",
        "axis": "lower",
        "order": 4,
        "rarity": "epic",
        "element": "Металл",
        "inhabitants": ["Майя-данава", "асурические архитекторы", "мастера иллюзии", "техномагические строители"],
        "mythology": "Царство Майи-данавы, великого архитектора асуров, мастера иллюзии, форм и чудесных сооружений. Это мир искусной материи и магической инженерии.",
        "philosophy": "Форма может быть храмом, а может быть ловушкой. Технология требует этики сознания.",
        "shadow": "Гениальность без мудрости создаёт лабиринт, в котором теряется сам создатель.",
        "visual": "a subterranean technomagical realm of Maya Danava, impossible metal palaces, illusion engines, yantra machines, asura architects, glowing labyrinths"
    },
    {
        "id": "vedic_loka_mahatala_loka",
        "name": "Махатала-лока",
        "sanskrit": "Mahatala-loka",
        "axis": "lower",
        "order": 3,
        "rarity": "epic",
        "element": "Вода",
        "inhabitants": ["наги", "змеиные кланы", "Кухака", "Такшака", "подземные хранители"],
        "mythology": "Один из змеиных нижних миров, населённый могущественными нагами и подземными кланами. Наги хранят память, сокровища, яд и мудрость глубины.",
        "philosophy": "Инстинкт как древняя мудрость тела: опасная, но необходимая.",
        "shadow": "Яд памяти, ревности и скрытой защиты может отравить сердце.",
        "visual": "a vast naga underworld, serpent palaces, blue-green waters, jewel hoods, ancient subterranean lakes, coiled guardians and hidden treasures"
    },
    {
        "id": "vedic_loka_rasatala_loka",
        "name": "Расатала-лока",
        "sanskrit": "Rasatala-loka",
        "axis": "lower",
        "order": 2,
        "rarity": "epic",
        "element": "Вода",
        "inhabitants": ["дайтьи", "данавы", "асурические роды", "владыки подземных вод"],
        "mythology": "Глубокий нижний мир могущественных дайтьев и данавов. Его название связано с rasa — соком, сущностью, вкусом опыта, но в тени это может стать погружением в плотные силы желания.",
        "philosophy": "Плотность жизни, вкус опыта и сила рода, которые требуют очищения мотивов.",
        "shadow": "Быть поглощённым вкусом власти, родовой обидой или глубинной жаждой.",
        "visual": "a deep watery asura realm, dark rivers of rasa, colossal daitya fortresses, danava clans, subterranean oceans, crimson-blue sacred density"
    },
    {
        "id": "vedic_loka_pātala_loka",
        "name": "Патала-лока",
        "sanskrit": "Pātāla-loka / Naga-loka",
        "axis": "lower",
        "order": 1,
        "rarity": "legendary",
        "element": "Тьма",
        "inhabitants": ["Васуки", "Шеша-Ананта", "наги", "подземные цари", "змеиные мудрецы"],
        "mythology": "Самая глубокая из нижних лок, часто связанная с нагами, подземными сокровищами и Анантой-Шешей, на котором покоится Вишну. Патала — не просто мрак, а глубина основания мира.",
        "philosophy": "Корневая глубина бытия: тьма как основание, а не только отсутствие света.",
        "shadow": "Соблазн уйти в глубину так далеко, что забывается возвращение к свету.",
        "visual": "the deepest Naga-loka, infinite jeweled serpent realm, Ananta Shesha coils, Vasuki, black-blue cosmic darkness, underground stars, primordial foundation of worlds"
    }
]


def prompt_for(loka):
    inhabitants = ", ".join(loka["inhabitants"])
    rarity_visual = "transcendent cosmic scale, prismatic mythic aura, impossible sacred geometry" if loka["rarity"] == "mythic" else "legendary divine aura, immense sacred presence, ornate gold and jewel detail" if loka["rarity"] == "legendary" else "epic mythological aura, dramatic sacred lighting, powerful symbolic landscape"
    return (
        f"A supreme mystical tarot-style realm card depicting {loka['name']} ({loka['sanskrit']}), one of the fourteen lokas of Vedic cosmology. "
        f"Realm mythology: {loka['mythology']} "
        f"Primary inhabitants: {inhabitants}. "
        f"Philosophical meaning: {loka['philosophy']} "
        f"Shadow teaching: {loka['shadow']} "
        f"Visual scene: {loka['visual']}. "
        f"Rarity treatment: {rarity_visual}. "
        f"No modern objects, no text on card, no western fantasy clichés, keep the atmosphere rooted in Vedic-Puranic cosmology. "
        f"{BASE_STYLE}"
    )


def main():
    cards = []
    for loka in LOKAS:
        card_id = loka["id"]
        cards.append({
            "card_id": card_id,
            "card_type": "vedic_loka",
            "rarity": loka["rarity"],
            "matrix_slug": "vedic",
            "matrix_name": "Ведическая",
            "display_name": loka["name"],
            "sanskrit": loka["sanskrit"],
            "axis": loka["axis"],
            "cosmic_order": loka["order"],
            "element": loka["element"],
            "inhabitants": loka["inhabitants"],
            "mythology": loka["mythology"],
            "description": loka["philosophy"],
            "shadow_aspect": loka["shadow"],
            "game_significance": {
                "significance_tier": "cosmic_realm" if loka["rarity"] == "mythic" else "major_realm",
                "gameplay_hint": "карта локи открывает ведические космологические квесты, обитателей мира, испытания восхождения и нисхождения",
                "cosmic_axis": loka["axis"],
                "cosmic_order": loka["order"]
            },
            "unlock_context": ["vedic_cosmology", "realm_quest", "agent_domain_synergy", "high_rarity_reward"],
            "future_effect_hooks": ["loka_affinity", "vedic_quest_chapter", "inhabitant_unlock", "cosmic_axis_progression"],
            "prompt": prompt_for(loka),
            "negative_prompt": NEGATIVE,
            "image_path": f"cards_lokas/{card_id}.webp",
            "type_label": "ЛОКА"
        })
    (DATA / "vedic_loka_cards.json").write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"vedic loka cards {len(cards)}")


if __name__ == "__main__":
    main()
