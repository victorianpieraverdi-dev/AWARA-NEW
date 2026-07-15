import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
EXPORT = ROOT / "exports"
EXPORT.mkdir(exist_ok=True)

DEFAULT_NEGATIVE = "text, watermark, signature, blurry, low quality, modern clothing, photography, realistic face, deformed, ugly, nsfw"


def read_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def normalize_core(card):
    return {
        "card_id": card["card_id"],
        "card_type": "core_agent_matrix",
        "rarity": card.get("rarity", "common"),
        "matrix_slug": card.get("matrix_slug"),
        "matrix_name": card.get("matrix_name"),
        "agent_slug": card.get("agent_slug"),
        "agent_name": card.get("agent_name"),
        "display_name": card.get("cultural_name") or card.get("agent_name"),
        "element": card.get("element"),
        "domain": card.get("domain"),
        "artifact": card.get("artifact"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def normalize_extra(card):
    return {
        "card_id": card["card_id"],
        "card_type": card.get("card_type"),
        "rarity": card.get("rarity", "common"),
        "matrix_slug": card.get("matrix_slug"),
        "matrix_name": card.get("matrix_name"),
        "display_name": card.get("display_name") or card.get("name"),
        "element": card.get("element"),
        "type": card.get("type"),
        "role": card.get("role"),
        "description": card.get("description"),
        "gift_aspect": card.get("gift_aspect"),
        "shadow_aspect": card.get("shadow_aspect"),
        "game_significance": card.get("game_significance"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def normalize_domain(card):
    return {
        "card_id": card["card_id"],
        "card_type": card.get("card_type"),
        "rarity": card.get("rarity", "legendary"),
        "agent_slug": card.get("agent_slug"),
        "agent_name": card.get("agent_name"),
        "display_name": card.get("display_name") or card.get("domain"),
        "domain": card.get("domain"),
        "element": card.get("element"),
        "planet": card.get("planet"),
        "vastu_zone": card.get("vastu_zone"),
        "guna": card.get("guna"),
        "ray": card.get("ray"),
        "description": card.get("description"),
        "game_significance": card.get("game_significance"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def normalize_loka(card):
    return {
        "card_id": card["card_id"],
        "card_type": card.get("card_type"),
        "rarity": card.get("rarity", "epic"),
        "matrix_slug": card.get("matrix_slug"),
        "matrix_name": card.get("matrix_name"),
        "display_name": card.get("display_name"),
        "sanskrit": card.get("sanskrit"),
        "axis": card.get("axis"),
        "cosmic_order": card.get("cosmic_order"),
        "element": card.get("element"),
        "inhabitants": card.get("inhabitants"),
        "mythology": card.get("mythology"),
        "description": card.get("description"),
        "shadow_aspect": card.get("shadow_aspect"),
        "game_significance": card.get("game_significance"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def normalize_loka_being(card):
    return {
        "card_id": card["card_id"],
        "card_type": card.get("card_type"),
        "rarity": card.get("rarity", "rare"),
        "matrix_slug": card.get("matrix_slug"),
        "matrix_name": card.get("matrix_name"),
        "loka_id": card.get("loka_id"),
        "loka_name": card.get("loka_name"),
        "loka_sanskrit": card.get("loka_sanskrit"),
        "loka_axis": card.get("loka_axis"),
        "cosmic_order": card.get("cosmic_order"),
        "display_name": card.get("display_name"),
        "hierarchy_role": card.get("hierarchy_role"),
        "element": card.get("element"),
        "role": card.get("role"),
        "influence": card.get("influence"),
        "player_effect": card.get("player_effect"),
        "description": card.get("description"),
        "game_significance": card.get("game_significance"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def normalize_monad(card):
    return {
        "card_id": card["card_id"],
        "card_type": card.get("card_type"),
        "rarity": card.get("rarity", "epic"),
        "display_name": card.get("display_name"),
        "category": card.get("category"),
        "element": card.get("element"),
        "arc_phase": card.get("arc_phase"),
        "role": card.get("role"),
        "mythology": card.get("mythology"),
        "description": card.get("description"),
        "player_effect": card.get("player_effect"),
        "game_significance": card.get("game_significance"),
        "prompt_for_gemini_or_gpt": card.get("prompt", ""),
        "negative_prompt": card.get("negative_prompt", DEFAULT_NEGATIVE),
        "image_path": card.get("image_path"),
    }


def main():
    core = [normalize_core(card) for card in read_json("card_prompts.json")]
    extra = [normalize_extra(card) for card in read_json("extra_card_prompts.json")]
    domains = [normalize_domain(card) for card in read_json("domain_cards.json")]
    lokas = [normalize_loka(card) for card in read_json("vedic_loka_cards.json")]
    loka_beings = [normalize_loka_being(card) for card in read_json("vedic_loka_being_cards.json")]
    monad = [normalize_monad(card) for card in read_json("monad_path_cards.json")]
    all_cards = core + monad + domains + lokas + loka_beings + extra

    json_path = EXPORT / "all_high_quality_card_prompts.json"
    jsonl_path = EXPORT / "all_high_quality_card_prompts.jsonl"
    md_path = EXPORT / "all_high_quality_card_prompts.md"

    json_path.write_text(json.dumps(all_cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with jsonl_path.open("w", encoding="utf-8") as f:
        for card in all_cards:
            f.write(json.dumps(card, ensure_ascii=False) + "\n")

    lines = [
        "# AWARA High Quality Card Prompts",
        "",
        "This file contains prompts for Gemini, GPT, or image-generation workflows.",
        "",
        f"Total cards: {len(all_cards)}",
        f"Core cards: {len(core)}",
        f"Monad Path cards: {len(monad)}",
        f"Domain cards: {len(domains)}",
        f"Vedic loka cards: {len(lokas)}",
        f"Vedic loka being cards: {len(loka_beings)}",
        f"Extra mythic cards: {len(extra)}",
        "",
    ]
    for card in all_cards:
        lines.extend([
            f"## {card['card_id']}",
            "",
            f"- **Type:** {card.get('card_type')}",
            f"- **Name:** {card.get('display_name')}",
            f"- **Rarity:** {card.get('rarity')}",
            f"- **Matrix:** {card.get('matrix_name') or '—'}",
            f"- **Image path:** `{card.get('image_path')}`",
            "",
            "### Prompt",
            "",
            card.get("prompt_for_gemini_or_gpt", ""),
            "",
            "### Negative prompt",
            "",
            card.get("negative_prompt", DEFAULT_NEGATIVE),
            "",
        ])
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"exported {len(all_cards)} prompts")
    print(json_path)
    print(jsonl_path)
    print(md_path)


if __name__ == "__main__":
    main()
