import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"

DOMAIN_LORE = {
    "svet_ra": ("Солнечная вселенная первичного света, восточного пробуждения и царственной ясности.", "a vast radiant solar realm of golden temples, dawn gates, heliospheres, divine sun rivers and crowned light beings"),
    "iskra": ("Океан синхронности, где малые события становятся знаками пути и пробуждают душу.", "an infinite moonlit ocean of synchronicity filled with glowing sparks, silver waves, floating omens and delicate soul-lights"),
    "brahma": ("Кузница творящих фракталов, где формы, миры и судьбы рождаются из эфирной архитектуры.", "a cosmic fractal forge where universes are shaped from luminous geometry, lotus engines, creator wheels and sacred blueprints"),
    "sarasvati": ("Эфир Логоса, библиотека речи, музыки, знания и тонкой структурирующей вибрации.", "an etheric library of living language, flowing white rivers, celestial veenas, sacred books and luminous calligraphy"),
    "vishnu": ("Горизонт равновесия, где сохранение мира держится на мягкой силе, мере и космическом сне.", "a serene cosmic horizon of balance with blue oceans, lotus constellations, preserving temples and endless equilibrium"),
    "lakshmi": ("Розарий изобилия, где красота, благословение и достаток раскрываются как форма гармонии.", "a rose-gold garden of abundance with lotus lakes, jewel vines, elephants of blessing and radiant prosperity mandalas"),
    "shiva": ("Пепельный зенит растворения, где ложная форма сгорает, чтобы открыть неподвижное сознание.", "an ash-white mountain zenith of cosmic dissolution, cremation grounds, tridents, blue fire, stars and silent ascetic power"),
    "parvati": ("Колыбель вершин, материнская горная вселенная тела, заботы, стойкости и воплощённой любви.", "a nurturing mountain cradle of emerald peaks, maternal shrines, flowers, stone womb caves and protective earth radiance"),
    "jnana": ("Астральная обсерватория знания, где душа учится видеть узоры истины за видимым небом.", "an astral observatory of wisdom with star maps, crystal telescopes, floating scriptures and white light of insight"),
    "prema": ("Сад Единого Сердца, где любовь становится не эмоцией, а законом соединённого бытия.", "a divine heart garden of rose light, twin flames, golden bridges, healing waters and luminous beings embracing as one"),
    "shakti": ("Горнило воли, где энергия, сила и действие проходят испытание огненной зрелостью.", "a blazing forge of divine will with red-gold flames, weapons of light, lion gates, molten yantras and heroic feminine power"),
    "ananda": ("Сфера ликования, вселенная священной радости, танца, экстаза и освобождённой жизненности.", "a rainbow sphere of sacred bliss with dancing light beings, celestial music, ecstatic halos and waves of pure joy"),
    "shanti": ("Обитель безмолвия, где мир достигается не бегством, а глубоким неподвижным присутствием.", "a silent monastery beyond time, moonlit still lake, white lotus, vast dark sky and absolute peaceful radiance"),
    "agni": ("Горнило возрождения, где огонь очищает, переваривает опыт и возвращает новую жизненную силу.", "a sacred fire crucible of rebirth with ritual altars, phoenix embers, seven flames, molten offerings and golden smoke"),
    "vayu": ("Стратосфера эха, воздушный мир дыхания, движения, голоса и невидимых сообщений.", "a high stratospheric realm of wind, echoing banners, cloud temples, antelope spirits, breath spirals and sonic waves"),
    "varuna": ("Бездна воспоминаний, океаническая вселенная глубины, клятвы, памяти и скрытых вод.", "a deep abyssal ocean of memory with starry waters, ancient vows, blue serpents, pearl archives and watching eyes"),
    "prithvi": ("Терракотовый бастион, земная крепость тела, рода, терпения и материи.", "a terracotta earth bastion of roots, mountains, fertile soil, ancestral stones, seed vaults and protective walls"),
    "akasha": ("Космический ткацкий станок, эфирная вселенная связей, пространства и невидимой ткани событий.", "a cosmic loom weaving galaxies, golden threads, star fields, void geometry and infinite etheric patterns"),
    "tejas": ("Эпицентр сияния, мир внутреннего огня, харизмы, ясности и духовной интенсивности.", "a brilliant epicenter of inner radiance with crystalline flames, golden-white aura, solar mirrors and sacred brilliance"),
    "dharma": ("Залы равновесия, вселенная закона, меры, правильного действия и зрелой ответственности.", "grand halls of cosmic balance with dharma wheels, golden scales, lion pillars, geometric law and serene judgment light"),
    "karma": ("Архив эха, где каждое действие оставляет след и возвращается как обучающий узор.", "an infinite archive of echoes with karmic wheels, threads of cause and effect, memory scrolls and shadow-light records"),
}

ELEMENT_VISUALS = {
    "Огонь": "flames, solar corona, molten gold, radiant heat, sacred intensity",
    "Вода": "moonlit waters, mist, blue currents, pearls, emotional depth",
    "Земля": "mountains, roots, stone, fertile soil, bones, ancient stability",
    "Воздух": "wind, clouds, feathers, breath spirals, echoing sky",
    "Эфир": "star fields, luminous void, sacred geometry, cosmic space, subtle light",
}

RARITY_WEIGHT = {"legendary": 8, "mythic": 13}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def write_json(name, data):
    (DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rarity_for(agent):
    if agent["slug"] in {"svet_ra", "brahma", "vishnu", "shiva", "shakti", "akasha", "dharma", "karma"}:
        return "mythic"
    return "legendary"


def build_prompt(agent, lore_en):
    element_visual = ELEMENT_VISUALS.get(agent["element"], ELEMENT_VISUALS["Эфир"])
    rarity = rarity_for(agent)
    rarity_visual = "transcendent prismatic universe-level aura, impossible sacred geometry, divine scale" if rarity == "mythic" else "white-gold legendary aura, immense sacred presence, cosmic grandeur"
    return (
        f"A supreme mystical tarot-style domain card depicting {agent['domain']}, the personal cosmic universe of {agent['name']}. "
        f"Scene: {lore_en}. "
        f"Agent correspondence: {agent['name']}, element {agent['element']}, planet {agent['planet']}, vastu direction {agent['vastu_zone']}, ray {agent['ray']}, guna {agent['guna']}. "
        f"Elemental atmosphere: {element_visual}. "
        f"Rarity treatment: {rarity_visual}. "
        f"No central human portrait, instead a vast immersive world-realm, mythic architecture, symbolic landscape, portals, relics and living cosmic forces. "
        f"digital painting, premium collectible card art, mystical esoteric style, ornate golden border frame, portrait orientation, highly detailed, 8k, cinematic atmospheric lighting, epic sacred worldbuilding"
    )


def main():
    agents = read_json("agents.json")
    cards = []
    for agent in agents:
        lore_ru, lore_en = DOMAIN_LORE[agent["slug"]]
        rarity = rarity_for(agent)
        card_id = f"domain__{agent['slug']}"
        cards.append({
            "card_id": card_id,
            "card_type": "agent_domain",
            "rarity": rarity,
            "agent_slug": agent["slug"],
            "agent_name": agent["name"],
            "domain": agent["domain"],
            "display_name": agent["domain"],
            "element": agent["element"],
            "planet": agent["planet"],
            "vastu_zone": agent["vastu_zone"],
            "guna": agent["guna"],
            "ray": agent["ray"],
            "description": lore_ru,
            "game_significance": {
                "rarity_weight": RARITY_WEIGHT[rarity],
                "significance_tier": "domain_universe" if rarity == "mythic" else "major_axis",
                "gameplay_hint": "доменная карта открывает вселенную агента, особые синергии, доменные квесты и усиления связанных матриц",
            },
            "unlock_context": ["agent_mastery", "domain_quest", "matrix_synergy", "collection"],
            "future_effect_hooks": ["agent_resonance", "domain_affinity", "quest_chapter_unlock", "high_rarity_reward"],
            "prompt": build_prompt(agent, lore_en),
            "negative_prompt": NEGATIVE,
            "image_path": f"cards_domains/{card_id}.webp",
            "type_label": "ДОМЕН",
        })
    write_json("domain_cards.json", cards)
    print(f"domain cards {len(cards)}")


if __name__ == "__main__":
    main()
