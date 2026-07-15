import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MATRIX_NAMES = {m["slug"]: m["name"] for m in json.loads((DATA / "matrices.json").read_text(encoding="utf-8"))}

STYLE_BASE = "digital painting, mystical esoteric tarot card art, ornate border frame, portrait orientation, highly detailed, 4k, atmospheric lighting, sacred mythological atmosphere"
NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"

TYPE_LABELS = {
    "extra_being": "СУЩЕСТВО",
    "mythic_location": "ЛОКАЦИЯ",
    "mythic_relic": "РЕЛИКВИЯ",
}

TYPE_PROMPT = {
    "extra_being": "a powerful mythological being or spiritual archetype",
    "mythic_location": "a sacred mythological landscape or temple realm",
    "mythic_relic": "a sacred mythological relic or ritual artifact",
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


def convert(card, card_type):
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
        "prompt": build_prompt(card),
        "negative_prompt": NEGATIVE,
        "image_path": f"cards_extra/{card_id}.webp",
        "type_label": TYPE_LABELS.get(card_type, card_type.upper()),
    }


def main():
    cards = []
    for item in read_json("extra_beings.json"):
        cards.append(convert(item, "extra_being"))
    for item in read_json("mythic_locations.json"):
        cards.append(convert(item, "mythic_location"))
    for item in read_json("mythic_relics.json"):
        cards.append(convert(item, "mythic_relic"))
    (DATA / "extra_card_prompts.json").write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"extra cards {len(cards)}")


if __name__ == "__main__":
    main()
