# -*- coding: utf-8 -*-
"""
Генератор карт-промтов для ВСЕГО мифо-слоя AWARA.
Существа + Локации + Реликвии + КВЕСТЫ (пути) в едином стиле extra_card_prompts.json.

Выходные файлы (внутри C:\\AWARA):
  data/mythic_quest_card_prompts.json   - только новые карты квестов (~261)
  data/full_mythic_card_prompts.json    - весь мифо-слой: существа+локации+реликвии+квесты (~1053)
  exports/all_card_prompts_master.json  - грандиозный единый набор всех типов карт (~1839, 1500+)

Запуск:
  cd C:\\AWARA
  python tools\\generate_full_mythic_card_prompts.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
EXPORT = ROOT / "exports"
EXPORT.mkdir(exist_ok=True)

MATRIX_NAMES = {m["slug"]: m["name"] for m in json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))}

STYLE_BASE = "digital painting, mystical esoteric tarot card art, ornate border frame, portrait orientation, highly detailed, 4k, atmospheric lighting, sacred mythological atmosphere"
NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"

TYPE_LABELS = {
    "extra_being": "СУЩЕСТВО",
    "mythic_location": "ЛОКАЦИЯ",
    "mythic_relic": "РЕЛИКВИЯ",
    "mythic_quest": "ПУТЬ",
}

TYPE_PROMPT = {
    "extra_being": "a powerful mythological being or spiritual archetype",
    "mythic_location": "a sacred mythological landscape or temple realm",
    "mythic_relic": "a sacred mythological relic or ritual artifact",
    "mythic_quest": "a sacred initiatory quest scene, a mythic pilgrimage and ritual path of inner transformation",
}

RARITY_EFFECTS = {
    "common": "subtle earthly aura, humble sacred simplicity",
    "uncommon": "soft cultural glow, refined symbolic detail",
    "rare": "golden aura, strong magical presence, detailed sacred ornaments",
    "epic": "violet-gold aura, dramatic divine energy, powerful ritual atmosphere",
    "legendary": "radiant white-gold divine aura, cosmic scale, overwhelming sacred presence",
    "mythic": "transcendent prismatic cosmic light, impossible sacred geometry, universe-level presence",
}

ELEMENT_VISUALS = {
    "Огонь": "flames, embers, solar radiance, molten gold, sacred heat",
    "Вода": "flowing water, moon reflections, deep blue currents, mist, tears of healing",
    "Земля": "stone, roots, fertile soil, mountains, ancient bones, green growth",
    "Воздух": "wind, feathers, clouds, breath, banners, swirling sky patterns",
    "Эфир": "star fields, luminous void, sacred geometry, subtle light, cosmic space",
    "Металл": "polished metal, blades, bells, white tiger light, autumn clarity",
    "Дерево": "branches, leaves, green dragon energy, spring growth, living wood",
    "Венера": "rose-gold light, beauty, copper glow, flowers, attraction field",
    "Тьма": "deep shadow, black flame, eclipsed light, abyssal contrast",
}


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def safe_json(name):
    try:
        return read_json(name)
    except FileNotFoundError:
        return []


def normalize_slug(raw):
    return raw.replace("__", "_").replace("/", "_").replace(" ", "_").lower()


def build_prompt(card):
    card_type = card.get("card_type", "extra_being")
    name = card.get("name", "Unknown")
    matrix_name = MATRIX_NAMES.get(card.get("matrix_slug"), card.get("matrix_name") or card.get("matrix_slug", "mythic"))
    rarity = card.get("rarity", "common")
    element = card.get("element", "Эфир")
    description = card.get("description", "")
    tags = ", ".join(card.get("tags", [])[:8])
    visual = card.get("visual_tags", "")
    type_prompt = TYPE_PROMPT.get(card_type, "a mystical card subject")
    rarity_effect = RARITY_EFFECTS.get(rarity, RARITY_EFFECTS["common"])
    element_visual = ELEMENT_VISUALS.get(element, ELEMENT_VISUALS["Эфир"])
    return (
        f"A mystical tarot-style card depicting {type_prompt}: {name}. "
        f"Cultural matrix: {matrix_name}. "
        f"Mythic meaning: {description} "
        f"Symbolic tags: {tags}. "
        f"Elemental atmosphere: {element_visual}. "
        f"Rarity treatment: {rarity_effect}. "
        f"Visual culture: {visual}. "
        f"{STYLE_BASE}"
    )


def convert_entity(card, card_type):
    card_id = f"extra__{normalize_slug(card['id'])}"
    matrix_name = MATRIX_NAMES.get(card.get("matrix_slug"), card.get("matrix_name") or card.get("matrix_slug"))
    return {
        "card_id": card_id,
        "card_type": card_type,
        "rarity": card.get("rarity", "common"),
        "matrix_slug": card.get("matrix_slug"),
        "matrix_name": matrix_name,
        "name": card.get("name"),
        "display_name": card.get("name"),
        "element": card.get("element", "Эфир"),
        "type": card.get("type", card_type),
        "role": card.get("role", ""),
        "description": card.get("description", ""),
        "gift_aspect": card.get("gift_aspect", ""),
        "shadow_aspect": card.get("shadow_aspect", ""),
        "game_significance": card.get("game_significance", {}),
        "unlock_context": card.get("unlock_context", []),
        "future_effect_hooks": card.get("future_effect_hooks", []),
        "prompt": build_prompt({**card, "card_type": card_type}),
        "negative_prompt": NEGATIVE,
        "image_path": f"cards_extra/{card_id}.webp",
        "type_label": TYPE_LABELS.get(card_type, card_type.upper()),
    }


def build_being_index():
    idx = {}
    for b in safe_json("extra_beings.json"):
        idx[b.get("id")] = {"element": b.get("element", "Эфир"), "tags": b.get("tags", [])}
    return idx


BEINGS = build_being_index()


def convert_quest(q):
    being = BEINGS.get(q.get("being_id"), {})
    element = being.get("element", "Эфир")
    tags = being.get("tags", [])
    description = q.get("philosophical_focus", "")
    card_id = f"extra__quest_{normalize_slug(q['id'])}"
    matrix_name = MATRIX_NAMES.get(q.get("matrix_slug"), q.get("matrix_name") or q.get("matrix_slug"))
    prompt_card = {
        "card_type": "mythic_quest",
        "name": q.get("name"),
        "matrix_slug": q.get("matrix_slug"),
        "matrix_name": matrix_name,
        "rarity": q.get("rarity", "rare"),
        "element": element,
        "description": description,
        "tags": tags,
        "visual_tags": "ритуальный путь, паломничество, инициатическая сцена, этапы посвящения",
    }
    return {
        "card_id": card_id,
        "card_type": "mythic_quest",
        "rarity": q.get("rarity", "rare"),
        "matrix_slug": q.get("matrix_slug"),
        "matrix_name": matrix_name,
        "name": q.get("name"),
        "display_name": q.get("name"),
        "element": element,
        "type": "quest_line",
        "role": "",
        "description": description,
        "gift_aspect": q.get("philosophical_focus", ""),
        "shadow_aspect": q.get("shadow_focus", ""),
        "being_id": q.get("being_id"),
        "primary_location_id": q.get("primary_location_id"),
        "primary_relic_id": q.get("primary_relic_id"),
        "stages": q.get("stages", []),
        "rewards": q.get("rewards", {}),
        "game_significance": {
            "rarity_weight": q.get("rewards", {}).get("rarity_weight", 5),
            "significance_tier": "quest_line",
            "gameplay_hint": "mythic_quest задаёт ежедневный ритуальный путь: этапы, награды, ключи и матричную близость AWARA",
        },
        "unlock_context": ["keys", "matrix_branch", "quests", "collection"],
        "future_effect_hooks": ["quest_weight", "matrix_affinity", "collection_score", "daily_key_bias"],
        "prompt": build_prompt(prompt_card),
        "negative_prompt": NEGATIVE,
        "image_path": f"cards_extra/{card_id}.webp",
        "type_label": "ПУТЬ",
    }


def main():
    beings = [convert_entity(x, "extra_being") for x in read_json("extra_beings.json")]
    locations = [convert_entity(x, "mythic_location") for x in read_json("mythic_locations.json")]
    relics = [convert_entity(x, "mythic_relic") for x in read_json("mythic_relics.json")]
    quests = [convert_quest(x) for x in read_json("mythic_quest_lines.json")]

    # 1) только новые карты квестов
    (DATA / "mythic_quest_card_prompts.json").write_text(
        json.dumps(quests, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # 2) весь мифо-слой в одном файле
    full_mythic = beings + locations + relics + quests
    (DATA / "full_mythic_card_prompts.json").write_text(
        json.dumps(full_mythic, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # 3) грандиозный единый набор (1500+): все готовые наборы + весь мифо-слой
    master = []
    master += safe_json("card_prompts.json")
    master += safe_json("domain_cards.json")
    master += safe_json("vedic_loka_cards.json")
    master += safe_json("vedic_loka_being_cards.json")
    master += safe_json("monad_path_cards.json")
    master += full_mythic
    (EXPORT / "all_card_prompts_master.json").write_text(
        json.dumps(master, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"beings:    {len(beings)}")
    print(f"locations: {len(locations)}")
    print(f"relics:    {len(relics)}")
    print(f"quests:    {len(quests)}")
    print(f"FULL MYTHIC (data/full_mythic_card_prompts.json): {len(full_mythic)}")
    print(f"MASTER (exports/all_card_prompts_master.json):    {len(master)}")


if __name__ == "__main__":
    main()
