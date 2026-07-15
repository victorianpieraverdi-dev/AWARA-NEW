import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
EXPORT = ROOT / "exports"
EXPORT.mkdir(exist_ok=True)

RARITY_RU = {
    "common": "Земная (Common)",
    "uncommon": "Культурная (Uncommon)",
    "rare": "Агентская (Rare)",
    "epic": "Артефактная (Epic)",
    "legendary": "Божественная (Legendary)",
    "mythic": "Мифическая (Mythic)",
}

RARITY_VISUAL = {
    "common": "плотная земная фактура, тёплый натуральный свет, ощущение близости и практической силы",
    "uncommon": "утончённое культурное свечение, орнаменты традиции, мягкая магическая аура",
    "rare": "золотое агентское свечение, сильный символический центр, подчёркнутая сакральная геометрия",
    "epic": "драматическое божественное освещение, сияние артефактов, мощная энергетическая сцена, глубокий контраст",
    "legendary": "бело-золотая божественная аура, огромный масштаб, лучи космического света, ощущение священного величия",
    "mythic": "трансцендентное призматическое сияние, космический масштаб, невозможная сакральная геометрия, ощущение силы уровня вселенной",
}

ELEMENT_VISUAL = {
    "Огонь": "пламя, искры, солнечная корона, расплавленное золото, священный жар, красно-золотые потоки энергии",
    "Вода": "лунная вода, туман, синие и бирюзовые течения, жемчуг, отражения, глубинная эмоциональная сила",
    "Земля": "кристаллы, корни, горные породы, плодородная почва, каменные монолиты, древняя устойчивость",
    "Воздух": "ветер, облака, перья, дыхательные спирали, развевающиеся ткани, небесная перспектива",
    "Эфир": "звёздное поле, сияющая пустота, тонкий свет, мандалы пространства, космическая глубина",
    "Металл": "полированный металл, алхимические механизмы, звонкие пластины, лезвия света, холодная точность формы",
    "Дерево": "ветви, листья, живая древесина, весенний рост, зелёные спирали, корневая память",
    "Венера": "розово-золотое сияние, цветы, медь, красота, мягкое притяжение, гармония форм",
    "Тьма": "чёрно-синяя глубина, затмённый свет, подземные звёзды, первичная бездна, свет внутри мрака",
}

TYPE_RU = {
    "core_agent_matrix": "карта агента в культурной матрице",
    "agent_domain": "доменная карта-вселенная агента",
    "vedic_loka": "карта ведической локи / космического мира",
    "vedic_loka_being": "карта правителя, обитателя или закона ведической локи",
    "extra_being": "карта мифологического существа",
    "mythic_location": "карта мифологической локации",
    "mythic_relic": "карта мифологической реликвии",
}

NEGATIVE = "Ни текста, ни надписей, ни букв, ни водяных знаков, ни логотипов, ни подписи художника, без blurry, low quality, deformed, ugly, nsfw — только изображение карты."


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def collect_cards():
    cards = []
    for card in read_json("card_prompts.json"):
        cards.append({
            "card_id": card["card_id"],
            "card_type": "core_agent_matrix",
            "rarity": card.get("rarity", "common"),
            "display_name": card.get("cultural_name") or card.get("agent_name"),
            "agent_name": card.get("agent_name"),
            "matrix_name": card.get("matrix_name"),
            "element": card.get("element"),
            "domain": card.get("domain"),
            "artifact": card.get("artifact"),
            "source_prompt": card.get("prompt", ""),
            "image_path": card.get("image_path"),
        })
    for name in ["monad_path_cards.json", "domain_cards.json", "vedic_loka_cards.json", "vedic_loka_being_cards.json", "extra_card_prompts.json"]:
        for card in read_json(name):
            cards.append(card)
    return cards


def get_name(card):
    return card.get("display_name") or card.get("name") or card.get("domain") or card.get("card_id")


def get_context(card):
    parts = []
    if card.get("matrix_name"):
        parts.append(f"традиция / матрица — {card['matrix_name']}")
    if card.get("agent_name"):
        parts.append(f"связанный агент — {card['agent_name']}")
    if card.get("loka_name"):
        parts.append(f"лока — {card['loka_name']} ({card.get('loka_sanskrit', '')})")
    if card.get("domain"):
        parts.append(f"домен — {card['domain']}")
    if card.get("hierarchy_role"):
        parts.append(f"иерархическая роль — {card['hierarchy_role']}")
    if card.get("role"):
        parts.append(f"роль — {card['role']}")
    return "; ".join(parts) or "сакральный контекст AWARA"


def get_mythology(card):
    values = []
    for key in ["mythology", "description", "influence", "player_effect", "gift_aspect", "shadow_aspect"]:
        value = card.get(key)
        if isinstance(value, str) and value.strip():
            values.append(value.strip())
    if card.get("inhabitants"):
        values.append("Обитатели / связанные силы: " + ", ".join(card["inhabitants"]))
    if values:
        return " ".join(values)
    if card.get("source_prompt"):
        return card["source_prompt"][:1200]
    return "Сакральный архетип AWARA, раскрывающий связь мифа, внутреннего пути, судьбы и игрового выбора."


def get_visual_markers(card):
    markers = []
    for key in ["visual", "visual_tags", "artifact", "type", "domain", "sanskrit"]:
        value = card.get(key)
        if isinstance(value, str) and value.strip():
            markers.append(value.strip())
    if card.get("planet"):
        markers.append(f"планетарный символизм: {card['planet']}")
    if card.get("vastu_zone"):
        markers.append(f"направление Васту: {card['vastu_zone']}")
    if card.get("guna"):
        markers.append(f"гуна: {card['guna']}")
    if card.get("ray"):
        markers.append(f"луч: {card['ray']}")
    return "; ".join(markers) or "сакральная геометрия, мандалы, сияющие символы, драгоценные оттенки, мифологическая атмосфера"


def build_luxury_prompt(card, index, total):
    card_type = card.get("card_type", "unknown")
    rarity = card.get("rarity", "common")
    element = card.get("element", "Эфир")
    name = get_name(card)
    context = get_context(card)
    mythology = get_mythology(card)
    visual_markers = get_visual_markers(card)
    rarity_text = RARITY_RU.get(rarity, rarity)
    rarity_visual = RARITY_VISUAL.get(rarity, RARITY_VISUAL["common"])
    element_visual = ELEMENT_VISUAL.get(element, ELEMENT_VISUAL["Эфир"])
    type_text = TYPE_RU.get(card_type, card_type)

    prompt = f"""Создай роскошную коллекционную карту в стиле эпического мистического таро.
Величественная композиция с золотым свечением, сакральной геометрией, глубиной, объёмом и ощущением настоящей мифологической силы.

ЦЕНТРАЛЬНЫЙ ОБРАЗ:
{name} — {type_text}.
Образ должен выглядеть как самостоятельная коллекционная карта высокого уровня, не как иллюстрация из книги, а как сакральный игровой артефакт.

КУЛЬТУРНЫЙ И КОСМОЛОГИЧЕСКИЙ КОНТЕКСТ:
{context}.
Визуальные маркеры: {visual_markers}.

МИФОЛОГИЯ И СМЫСЛ:
{mythology}
Передай не только внешность, но и внутренний закон этой карты: кто управляет, какая сила действует, какой порядок мира проявлен, как эта карта влияет на путь игрока.

РАРНОСТЬ:
{rarity_text}.
Визуальное проявление рарности: {rarity_visual}.

СТИХИЯ:
{element} — {element_visual}.
Стихия должна быть видна в окружении, свете, фактуре, символах и энергетическом движении карты.

ФОН:
Величественный сакральный фон с глубиной и перспективой: храмы, небесные или подземные миры, мандалы, звёздные поля, горы, воды, огонь, корни, дворцы, пещеры или космические пространства — в зависимости от природы карты.
Фон не должен быть пустым: он должен рассказывать мифологию карты.

ЭФФЕКТЫ:
Золотые частицы, лучи света, тонкий ореол, энергетические спирали, драгоценное свечение, объёмное драматическое освещение с контражуром.
Для высоких редкостей добавь ощущение космического масштаба и божественного присутствия.

РАМКА:
Золотая чеканная рамка с сакральной геометрией, орнаментами, символами стихии и тонкими мифологическими деталями.
Рамка должна выглядеть как дорогая коллекционная карта премиум-класса.

СТИЛЬ:
Высокодетализированная цифровая живопись, богатая палитра с золотыми и драгоценными оттенками, cinematic lighting, epic mystical tarot card, premium collectible card art, ornate frame, portrait orientation, 3:4, 4K/8K quality.

ОГРАНИЧЕНИЯ:
{NEGATIVE}"""

    return {
        "index": index,
        "total": total,
        "card_id": card.get("card_id"),
        "card_type": card_type,
        "rarity": rarity,
        "display_name": name,
        "image_path": card.get("image_path"),
        "luxury_prompt": prompt,
        "negative_prompt": NEGATIVE,
    }


def main():
    cards = collect_cards()
    prompts = [build_luxury_prompt(card, i + 1, len(cards)) for i, card in enumerate(cards)]

    json_path = EXPORT / "all_luxury_tarot_prompts.json"
    jsonl_path = EXPORT / "all_luxury_tarot_prompts.jsonl"
    md_path = EXPORT / "all_luxury_tarot_prompts.md"

    json_path.write_text(json.dumps(prompts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with jsonl_path.open("w", encoding="utf-8") as f:
        for prompt in prompts:
            f.write(json.dumps(prompt, ensure_ascii=False) + "\n")

    lines = ["# AWARA Luxury Tarot Prompts", "", f"Total prompts: {len(prompts)}", ""]
    for item in prompts:
        lines.extend([
            f"--- [{item['index']}/{item['total']}] {item['card_id']} ---",
            f"Рарность: {RARITY_RU.get(item['rarity'], item['rarity'])}",
            f"Тип: {TYPE_RU.get(item['card_type'], item['card_type'])}",
            f"Название: {item['display_name']}",
            f"Файл: {item.get('image_path')}",
            "",
            "ПРОМПТ:",
            item["luxury_prompt"],
            "",
        ])
    md_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"exported {len(prompts)} luxury prompts")
    print(json_path)
    print(jsonl_path)
    print(md_path)


if __name__ == "__main__":
    main()
