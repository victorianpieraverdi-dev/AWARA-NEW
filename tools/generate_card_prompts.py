#!/usr/bin/env python3
"""
T-037: Generate image-generation prompts for all AWARA cards.

Reads agents.json, matrices.json, agent_matrix_map.json + lorebook texts.
Extracts cultural domain names, artifacts, esoteric descriptions from lorebooks.
Outputs data/card_prompts.json with fully English prompts for Flux/Replicate.

Usage:
    python tools/generate_card_prompts.py
"""

import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
LORE = os.path.join(BASE, "lore", "text")

# --- Translation maps ---

AGENT_ARCHETYPE = {
    "Свет Ра": "a radiant solar deity with sun disk crown and golden halo, divine ruler of light, holding sun scepter, rays of golden light emanating from body",
    "Искра": "a luminous tiny divine spark of consciousness floating in cosmic darkness, seed of soul-light, delicate flame of awareness, eternal inner light",
    "Брахма": "a majestic four-headed cosmic creator deity with long beard, four arms holding sacred book scepter water vessel and prayer beads, seated on grand lotus throne",
    "Сарасвати": "an elegant wisdom goddess playing stringed instrument, wearing flowing white robes, holding sacred book and lotus, swan companion nearby, river of knowledge",
    "Вишну": "a serene blue-skinned cosmic preserver deity with golden crown, four arms holding conch shell discus mace and lotus flower, reclining on cosmic serpent in ocean",
    "Лакшми": "a beautiful abundance goddess standing on blooming lotus, pouring gold coins from one hand, holding lotus flowers, wearing red-gold robes, elephants pouring water",
    "Шива": "a powerful ascetic destroyer-transformer deity with matted hair third eye and crescent moon, holding trident, cobra around neck, seated in deep meditation, sacred ash on body",
    "Парвати": "a gentle nurturing mountain goddess with golden ornaments, holding lotus and mirror, wearing green-gold garments with flowers, divine mother energy, mountain backdrop",
    "Джняна": "a wise all-knowing sage radiating pure white light of knowledge, third eye of wisdom open, surrounded by floating sacred texts, infinite cosmic library",
    "Према": "an embodiment of divine unconditional love as two luminous beings merging in heart-shaped golden radiance, rose petals floating, pink-gold cosmic love energy",
    "Шакти": "a fierce ten-armed divine feminine warrior riding a lion-tiger mount, wielding weapons in each hand including trident sword and bow, blazing energy aura",
    "Ананда": "an ecstatic figure of divine bliss dancing in rainbow cosmic light, levitating in joy, radiating waves of jubilation, music of celestial spheres",
    "Шанти": "a serene meditating figure of absolute divine peace, perfectly still, reflected in cosmic mirror-lake, single Om vibration, moonlit lotus, profound silence",
    "Агни": "a blazing fire deity with two faces and seven flame tongues, riding a ram, multiple arms holding torch and sacrificial ladle, sacred fire altar burning",
    "Ваю": "a dynamic wind deity riding an antelope mount, holding billowing white flag, flowing robes caught in cosmic winds, thousand-eyed wind form, breath of life swirling",
    "Варуна": "a deep-ocean cosmic deity riding sea-monster mount, holding binding noose, blue skin, crown of a thousand watching eyes, surrounded by dark cosmic waters under stars",
    "Притхви": "a patient earth-mother deity in brown-green garments, sitting on fertile soil, holding germinating seeds and grain, mountains as spine, roots growing from body",
    "Акаша": "infinite cosmic ether-space as vast starry void containing all possibility, galactic library of records, quantum vacuum luminosity, formless space of creation",
    "Теджас": "intense golden-white spiritual radiance and brilliance, crystalline flame body without smoke, aura of inner mastery, sacred protective light, divine inner fire",
    "Дхарма": "golden eight-spoked wheel of cosmic law (Dharmachakra), perfectly balanced scales of justice, eternal cosmic order written in starlight, lion-pillar throne",
    "Карма": "spinning cosmic wheel of cause and effect with Sanskrit symbols, threads connecting past to future, scales weighing actions, cycle of incarnation, chains and liberation",
}

AGENT_NAME_EN = {
    "Свет Ра": "Light of Ra",
    "Искра": "Iskra (Divine Spark)",
    "Брахма": "Brahma",
    "Сарасвати": "Sarasvati",
    "Вишну": "Vishnu",
    "Лакшми": "Lakshmi",
    "Шива": "Shiva",
    "Парвати": "Parvati",
    "Джняна": "Jnana",
    "Према": "Prema (Divine Love)",
    "Шакти": "Shakti",
    "Ананда": "Ananda",
    "Шанти": "Shanti",
    "Агни": "Agni",
    "Ваю": "Vayu",
    "Варуна": "Varuna",
    "Притхви": "Prithvi",
    "Акаша": "Akasha",
    "Теджас": "Tejas",
    "Дхарма": "Dharma",
    "Карма": "Karma",
}

DOMAIN_EN = {
    "Гелиосфера": "Heliosphere",
    "Океан Синхронности": "Ocean of Synchronicity",
    "Кузница Фракталов": "Fractal Forge",
    "Эфир Логоса": "Ether of Logos",
    "Горизонт Равновесия": "Horizon of Equilibrium",
    "Розарий Изобилия": "Rosary of Abundance",
    "Пепельный Зенит": "Ashen Zenith",
    "Колыбель Вершин": "Cradle of Summits",
    "Астральная Обсерватория": "Astral Observatory",
    "Сад Единого Сердца": "Garden of the One Heart",
    "Горнило Воли": "Crucible of Will",
    "Сфера Ликования": "Sphere of Jubilation",
    "Обитель Безмолвия": "Abode of Silence",
    "Горнило Возрождения": "Crucible of Rebirth",
    "Стратосфера Эха": "Stratosphere of Echo",
    "Бездна Воспоминаний": "Abyss of Memories",
    "Терракотовый Бастион": "Terracotta Bastion",
    "Космический Ткацкий Станок": "Cosmic Loom",
    "Эпицентр Сияния": "Epicenter of Radiance",
    "Залы Равновесия": "Halls of Balance",
    "Архив Эха": "Archive of Echo",
}

MATRIX_NAME_EN = {
    "Ведическая": "Vedic",
    "Египетская": "Egyptian",
    "Каббалистическая": "Kabbalistic",
    "Майянская": "Mayan",
    "Славянская": "Slavic",
    "Скандинавская/Норс": "Norse",
    "Даосская": "Daoist",
    "Гностическая": "Gnostic",
    "Японская/Синто": "Japanese Shinto",
    "Кельтская": "Celtic",
    "Шамбала": "Shambhala",
    "Юлианская/Византийская": "Byzantine",
    "Шаманская": "Shamanic",
    "Генные Ключи": "Gene Keys",
    "Техномагическая": "Technomagical",
    "Космическая/Галактическая": "Cosmic Galactic",
    "Античная/Греко-Римская": "Greco-Roman",
    "Зороастрийская/Персидская": "Zoroastrian Persian",
    "Исламская/Суфийская/Нуровая": "Islamic Sufi Nur",
    "Ацтекская/Мешикская": "Aztec Mexica",
    "Христианско-Мистическая/Розенкрейцерско-Граальная": "Christian Mystical Rosicrucian Grail",
    "Йоруба/Ifá-Orisha": "Yoruba Ifa Orisha",
    "Шумеро-Вавилонская/Месопотамская": "Sumerian Babylonian",
    "Герметико-Алхимическая": "Hermetic Alchemical",
    "Таро-Арканическая": "Tarot Arcanic",
    "Астрологическая": "Astrological",
    "Китайская/И-Цзин": "Chinese I-Ching",
    "Тантрическо-Кашмирская": "Tantric Kashmiri",
    "Буддийско-Махаянская": "Buddhist Mahayana",
    "Афро-Космическая/Догонская": "Afro-Cosmic Dogon",
    "Атлантическая/Лемурийская": "Atlantean Lemurian",
    "Постчеловеческая/AI-Софийная": "Posthuman AI Sophianic",
    "Адвайта-Сиддха AWARA": "Advaita Siddha",
}

ELEMENT_EN = {
    "Огонь": "Fire",
    "Вода": "Water",
    "Земля": "Earth",
    "Воздух": "Air",
    "Эфир": "Ether",
}

ELEMENT_VISUALS = {
    "Fire": "flames, embers, molten gold, solar corona, radiant heat haze",
    "Water": "flowing water, moonlit waves, deep ocean currents, mist, rain drops",
    "Earth": "ancient stone, roots, crystals, mountain peaks, terracotta, fertile soil",
    "Air": "swirling winds, feathers, clouds, translucent veils, breath of light",
    "Ether": "starfield, cosmic nebula, fractal geometry, iridescent void, quantum light",
}

AGENT_POWER = {
    "brahma": 5, "akasha": 5,
    "svet_ra": 4, "vishnu": 4, "shiva": 4,
    "sarasvati": 3, "lakshmi": 3, "parvati": 3, "shakti": 3,
    "agni": 2, "vayu": 2, "varuna": 2, "prithvi": 2, "tejas": 2,
    "iskra": 1, "jnana": 1, "prema": 1, "ananda": 1, "shanti": 1,
    "dharma": 1, "karma": 1,
}

MATRIX_DEPTH = {
    "vedic": 1, "egyptian": 1, "slavic": 1, "norse": 1, "daoist": 1,
    "shinto": 1, "celtic": 1, "antique_greco_roman": 1,
    "kabbalistic": 2, "mayan": 2, "gnostic": 2, "julian_byzantine": 2,
    "shamanic": 2, "zoroastrian": 2, "islamic_sufi_nur": 2,
    "aztec_mexica": 2, "christian_mystical_grail": 2, "yoruba_ifa_orisha": 2,
    "sumerian_babylonian": 2, "buddhist_mahayana": 2,
    "shambhala": 3, "gene_keys": 3, "hermetic_alchemical": 3,
    "tarot_arcanic": 3, "astrological": 3, "chinese_iching": 3,
    "tantric_kashmiri": 3,
    "technomagical": 4, "cosmic_galactic": 4, "afro_dogon": 4,
    "atlantean_lemurian": 4, "posthuman_ai_sophianic": 4, "advaita_siddha": 4,
}

GUNA_STYLE = {
    "саттва": "serene, luminous, harmonious, balanced light, ethereal glow",
    "раджас": "dynamic, passionate, energetic, vivid contrasts, motion blur",
    "тамас": "mysterious, deep, shadowy, ancient, cosmic darkness with pinpoints of light",
}

VISUAL_CODE_EN = {
    "Золото, лотосы, мандалы, шафран": "Gold, lotuses, mandalas, saffron",
    "Лазурит, базальт, Сириус": "Lapis lazuli, basalt, Sirius star",
    "Древо Сефирот, ивритская вязь": "Sephiroth Tree, Hebrew script",
    "Нефрит, обсидиан, Цолькин": "Jade, obsidian, Tzolkin calendar",
    "Резное дерево, Прави, коловраты": "Carved wood, Prav realm, sun wheels",
    "Морозное железо, Иггдрасиль": "Frost iron, Yggdrasil world tree",
    "Нефрит, киноварь, Инь-Ян": "Jade, cinnabar, Yin-Yang",
    "Разорванные цепи, искры": "Broken chains, divine sparks",
    "Кинцуги, Тории, ками": "Kintsugi, torii gates, kami spirits",
    "Изумруд, узлы вечности, Авалон": "Emerald, Celtic knots, Avalon",
    "Кристальные вершины, Калачакра": "Crystal peaks, Kalachakra wheel",
    "Золотая смальта, мозаики": "Golden smalto, Byzantine mosaics",
    "Кости, перья, бубен": "Bones, feathers, shaman drum",
    "ДНК-фракталы, тени-дары-сиддхи": "DNA fractals, shadow-gift-siddhi",
    "Неоновые руны, кибер-сакральность": "Neon runes, cyber-sacred",
    "Звёздная пыль, квазары": "Stardust, quasars",
    "Мрамор, бронза, лавр": "Marble, bronze, laurel",
    "Священный огонь, Фравахар": "Sacred fire, Faravahar",
    "Нур, каллиграфия, Кааба": "Nur light, calligraphy, Kaaba",
    "Обсидиан, Тональпоуалли": "Obsidian, Tonalpohualli",
    "Роза-Крест, Грааль": "Rose Cross, Holy Grail",
    "Каури, барабаны Бата, Ориша": "Cowrie shells, Bata drums, Orisha",
    "Клинопись, зиккураты, Апсу": "Cuneiform, ziggurats, Apsu",
    "Изумрудная Скрижаль, атанор": "Emerald Tablet, athanor furnace",
    "22 Старших Аркана": "22 Major Arcana",
    "Планеты, дома, эфемериды": "Planets, houses, ephemeris",
    "64 гексаграммы": "64 hexagrams",
    "Спанда, Шива-Шакти, бинду": "Spanda, Shiva-Shakti, bindu",
    "Стхупа, Дхармакайя, мандала": "Stupa, Dharmakaya, mandala",
    "Сириус, Номмо, спирали": "Sirius, Nommo, spirals",
    "Кристаллы, океан, спящие города": "Crystals, ocean, sleeping cities",
    "Нейросети, Source Light Kernel": "Neural nets, Source Light Kernel",
    "Сушумна, грантхи, Брахманда, лотос-сахасрара": "Sushumna, granthis, Brahmanda, Sahasrara lotus",
}

MATRIX_CULTURAL_STYLE = {
    "vedic": "Indian temple architecture, golden mandalas, lotus motifs, Vedic yantra patterns, Sanskrit sacred geometry, saffron and gold palette",
    "egyptian": "Egyptian temple columns, hieroglyphs, lapis lazuli and gold, scarab motifs, pyramidal geometry, Nile papyrus, Eye of Horus",
    "kabbalistic": "Tree of Life Sephiroth, Hebrew calligraphy, mystical blue-violet light, sacred geometry, Ein Sof emanations",
    "mayan": "jade and obsidian, feathered serpent Quetzalcoatl, jungle temple stepped pyramids, Tzolkin calendar glyphs, quetzal feathers",
    "slavic": "carved wooden architecture, Slavic embroidery patterns, birch forests, sacred fire, Sun wheel Kolovrat, Perun thunder symbols",
    "norse": "Viking rune stones, Yggdrasil world tree, frost and iron, Norse knotwork, aurora borealis, longship dragon prows",
    "daoist": "Chinese ink wash painting, jade and cinnabar, Yin-Yang symbol, mountain mist, bamboo, Tai Chi flowing energy",
    "gnostic": "broken chains of matter, divine light sparks in darkness, Pleroma radiance, ethereal aeons, cosmic egg, celestial spheres",
    "shinto": "Japanese torii gates, kintsugi gold repair, cherry blossoms, shimenawa sacred rope, kami spirit orbs, minimalist wabi-sabi",
    "celtic": "emerald green landscapes, Celtic knotwork, Avalon mists, druidic oak groves, spiral triskele, standing stones",
    "shambhala": "crystal mountain peaks, Kalachakra mandala, Tibetan thangka style, snow lion, dharma wheel, lotus throne",
    "julian_byzantine": "golden mosaic tesserae, Byzantine icon style, Hagia Sophia dome, sacred haloes, deep purple and gold",
    "shamanic": "animal bones and feathers, ritual drum, spirit animals, cave paintings, trance fire, shamanic journey visuals",
    "gene_keys": "DNA double helix fractals, shadow-gift-siddhi spectrum, holographic codes, bio-luminescent patterns",
    "technomagical": "neon rune circuits, cyber-sacred glyphs, holographic interfaces, digital mandalas, quantum code streams",
    "cosmic_galactic": "deep space nebulae, quasar light, galactic spiral arms, cosmic dust clouds, stellar nurseries, event horizons",
    "antique_greco_roman": "white marble columns, bronze statues, laurel wreaths, Greek temple pediments, amphora pottery, Olympic torches",
    "zoroastrian": "sacred eternal fire, Faravahar winged disk, Persian carpet patterns, Ahura Mazda light, cypress trees",
    "islamic_sufi_nur": "Arabic calligraphy, geometric arabesque patterns, Nur divine light, mosque dome and minaret, Kaaba, Sufi whirling",
    "aztec_mexica": "obsidian mirrors, Aztec sun stone, eagle warrior, Tonalpohualli calendar, sacrificial temple, jaguar motifs",
    "christian_mystical_grail": "Rose Cross, Holy Grail chalice, Gothic cathedral stained glass, Rosicrucian symbols, sacred heart radiance",
    "yoruba_ifa_orisha": "cowrie shells, Bata drums, Orisha beaded crowns, palm oil offerings, Ifa divination board, tropical sacred grove",
    "sumerian_babylonian": "cuneiform tablets, ziggurat stepped temples, Mesopotamian winged bulls lamassu, Ishtar gate blue tiles, Apsu primordial waters",
    "hermetic_alchemical": "Emerald Tablet, alchemical athanor furnace, philosopher's stone, Ouroboros serpent, Hermetic caduceus, nigredo-albedo-rubedo stages",
    "tarot_arcanic": "Tarot Major Arcana imagery, esoteric card borders, Rider-Waite symbolism, mystical divination symbols, fool's journey",
    "astrological": "zodiac wheel, planetary symbols, celestial ephemeris charts, horoscope houses, starry night dome",
    "chinese_iching": "I Ching hexagram lines, Chinese brush calligraphy, dragon and phoenix, trigram Ba Gua, flowing Qi energy",
    "tantric_kashmiri": "Shiva-Shakti union, spanda vibration waves, bindu point, kundalini serpent energy, tantric yantra",
    "buddhist_mahayana": "stupa monument, Dharmakaya golden Buddha, Mahayana mandala, bodhi tree, lotus sutra, compassion mudra",
    "afro_dogon": "Sirius star system, Nommo water spirits, Dogon spiral cosmology, African mask patterns, ancestral totems",
    "atlantean_lemurian": "submerged crystal cities, underwater temples, bioluminescent ocean, ancient crystalline technology, lost civilization ruins",
    "posthuman_ai_sophianic": "neural network patterns, AI consciousness nodes, Sophia divine wisdom circuits, digital light kernel, posthuman evolution",
    "advaita_siddha": "Sushumna central channel, granthis energy knots, Brahmananda cosmic egg, Sahasrara thousand-petal lotus, non-dual light",
}

STYLE_BASE = (
    "digital painting, card art, mystical esoteric style, "
    "ornate border frame, portrait orientation, "
    "highly detailed, 4k, atmospheric lighting"
)


def load_json(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


def transliterate_to_en(text):
    """Basic cleanup: keep Latin chars, transliterate common patterns."""
    if not text:
        return text
    result = text
    result = result.replace("ё", "yo").replace("Ё", "Yo")
    return result


def parse_lorebook_all(filepath):
    """Parse a lorebook and extract all agent blocks indexed by agent name."""
    if not os.path.exists(filepath):
        return {}

    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    results = {}
    pattern = re.compile(
        r'(\d{1,2})\.\s+'
        r'(\S[^\n]*?)\s*->\s*'
        r'([^\n]+)\n'
        r'(.*?)(?=\n\d{1,2}\.\s+\S[^\n]*?\s*->|\Z)',
        re.DOTALL,
    )

    for m in pattern.finditer(text):
        awara_name = m.group(2).strip()
        cultural = m.group(3).strip()
        block = m.group(4)

        entry = {"cultural_full": cultural}

        domain_m = re.search(
            r"(?:Название Домена|Domain)[:\s]*([^\n]+)", block
        )
        if domain_m:
            entry["domain_cultural"] = domain_m.group(1).strip()

        artifact_m = re.search(
            r"Артефакт[^:]*?:\s*([^\n]+)", block
        )
        if artifact_m:
            entry["artifact"] = artifact_m.group(1).strip()

        essence_m = re.search(
            r"Эзотерическая суть[:\s]*([^\n]+)", block
        )
        if essence_m:
            entry["essence"] = essence_m.group(1).strip()[:250]

        results[awara_name] = entry

    return results


def extract_en_parts(text):
    """Extract Latin-script words/names from a mixed Cyrillic/Latin string."""
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    latin = r"A-Za-z\xc0-\xff\u0100-\u017e\u1e00-\u1eff"
    parts = re.findall(
        rf"[{latin}][{latin}0-9\-'\s/\.]*",
        text,
    )
    cleaned = []
    for p in parts:
        p = p.strip().rstrip(".-,")
        if len(p) > 2 and p.upper() != "AWARA" and not p.isspace():
            cleaned.append(p)
    result = ", ".join(cleaned)
    result = re.sub(r"\s*,\s*,+", ",", result)
    result = re.sub(r",\s*$", "", result)
    result = re.sub(r"\s+,", ",", result)
    result = re.sub(r",\s+", ", ", result)
    return result.strip()


def clean_artifact(art):
    """Clean artifact string: remove prefix, keep only Latin names for English prompt."""
    for prefix in ["Ключ:", "/ Ключ:"]:
        if art.startswith(prefix):
            art = art[len(prefix):].strip()
    art = art.rstrip(".")
    en_parts = extract_en_parts(art)
    if en_parts and len(en_parts) > 3:
        if len(en_parts) > 100:
            en_parts = en_parts[:100].rsplit(",", 1)[0]
        return en_parts
    return ""


def clean_essence(ess):
    """Extract Latin deity/concept names from essence for English prompt."""
    ess = ess.rstrip(".")
    en_parts = extract_en_parts(ess)
    if en_parts and len(en_parts) > 10:
        if len(en_parts) > 100:
            en_parts = en_parts[:100].rsplit(",", 1)[0]
        return en_parts
    return ""


def get_rarity(agent_slug, matrix_slug):
    score = AGENT_POWER[agent_slug] + MATRIX_DEPTH[matrix_slug]
    if score <= 3:
        return "common"
    if score <= 5:
        return "uncommon"
    if score == 6:
        return "rare"
    if score <= 8:
        return "epic"
    return "legendary"


def build_prompts():
    agents = load_json("agents.json")
    matrices = load_json("matrices.json")
    agent_map = load_json("agent_matrix_map.json")
    iconography = load_json("iconography.json")

    agents_by_id = {a["id"]: a for a in agents}
    matrices_by_id = {m["id"]: m for m in matrices}

    lore_cache = {}

    prompts = []

    for entry in agent_map:
        agent = agents_by_id.get(entry["agent_id"])
        matrix = matrices_by_id.get(entry["matrix_id"])
        if not agent or not matrix:
            continue

        element_ru = agent.get("element", "Эфир")
        guna = agent.get("guna", "саттва")
        cultural_name = entry.get("cultural_name", agent["name"])
        visual_code_ru = matrix.get("visual_code", "")
        matrix_slug = matrix["slug"]

        element_en = ELEMENT_EN.get(element_ru, "Ether")
        element_vis = ELEMENT_VISUALS.get(element_en, ELEMENT_VISUALS["Ether"])
        guna_vis = GUNA_STYLE.get(guna, GUNA_STYLE["саттва"])
        culture_vis = MATRIX_CULTURAL_STYLE.get(matrix_slug, "")
        visual_code_en = VISUAL_CODE_EN.get(visual_code_ru, visual_code_ru)
        agent_en = AGENT_NAME_EN.get(agent["name"], agent["name"])
        matrix_en = MATRIX_NAME_EN.get(matrix["name"], matrix["name"])
        domain_en = DOMAIN_EN.get(agent["domain"], agent["domain"])

        icon_desc = iconography.get(cultural_name, "")

        source_file = matrix.get("source_file", "")
        if source_file not in lore_cache:
            if source_file:
                lore_path = os.path.join(LORE, source_file)
                lore_cache[source_file] = parse_lorebook_all(lore_path)
            else:
                lore_cache[source_file] = {}
        lore_all = lore_cache[source_file]

        lore = lore_all.get(agent["name"], {})

        domain_str = ""
        if lore.get("domain_cultural"):
            dom = lore["domain_cultural"].rstrip(".")
            dom_en = extract_en_parts(dom)
            if dom_en and len(dom_en) > 3:
                domain_str = f" Sacred domain: {dom_en}."

        artifact_str = ""
        if not icon_desc and lore.get("artifact"):
            art = clean_artifact(lore["artifact"])
            if art:
                artifact_str = f" Holding sacred artifact: {art}."

        archetype = AGENT_ARCHETYPE.get(agent["name"], "")

        if icon_desc:
            prompt = (
                f"A mystical tarot-style card depicting {icon_desc}. "
                f"{matrix_en} tradition. "
                f"Element: {element_en} — {element_vis}. "
                f"Setting: {culture_vis}. "
                f"Mood: {guna_vis}. "
                f"{STYLE_BASE}"
            )
        elif archetype:
            prompt = (
                f"A mystical tarot-style card depicting {archetype}, "
                f"reimagined as {cultural_name} in the {matrix_en} tradition. "
                f"{domain_str}{artifact_str} "
                f"Element: {element_en} — {element_vis}. "
                f"Setting: {culture_vis}. "
                f"Mood: {guna_vis}. "
                f"{STYLE_BASE}"
            )
        else:
            prompt = (
                f"A mystical card depicting {cultural_name}, "
                f"the {matrix_en} manifestation of cosmic agent {agent_en}. "
                f"Realm: {domain_en}.{domain_str}{artifact_str} "
                f"Element of power: {element_en} — {element_vis}. "
                f"Cultural visual style: {culture_vis}. "
                f"Symbolic motifs: {visual_code_en}. "
                f"Atmosphere: {guna_vis}. "
                f"{STYLE_BASE}"
            )

        negative = (
            "text, watermark, signature, blurry, low quality, "
            "modern clothing, photography, realistic face, "
            "deformed, ugly, nsfw"
        )

        card_id = f"{agent['slug']}__{matrix['slug']}"
        rarity = get_rarity(agent["slug"], matrix["slug"])

        prompts.append({
            "card_id": card_id,
            "rarity": rarity,
            "agent_slug": agent["slug"],
            "agent_name": agent["name"],
            "matrix_slug": matrix["slug"],
            "matrix_name": matrix["name"],
            "cultural_name": cultural_name,
            "element": element_ru,
            "domain": agent["domain"],
            "domain_cultural": lore.get("domain_cultural", ""),
            "artifact": lore.get("artifact", ""),
            "prompt": prompt,
            "negative_prompt": negative,
            "image_path": f"cards/{card_id}.webp",
        })

    return prompts


def main():
    prompts = build_prompts()
    out_path = os.path.join(DATA, "card_prompts.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)

    enriched = sum(1 for p in prompts if p.get("domain_cultural"))
    print(f"Generated {len(prompts)} card prompts -> {out_path}")
    print(f"  Enriched with lorebook data: {enriched}")
    print(f"  Without lorebook data: {len(prompts) - enriched}")


if __name__ == "__main__":
    main()
