import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "exports"
BATCH = EXPORT / "luxury_batches"
BATCH.mkdir(exist_ok=True)

TYPE_FILE = {
    "core_agent_matrix": "luxury_prompts_core.md",
    "agent_domain": "luxury_prompts_domains.md",
    "vedic_loka": "luxury_prompts_vedic_lokas.md",
    "vedic_loka_being": "luxury_prompts_vedic_loka_beings.md",
    "extra_being": "luxury_prompts_extra_beings.md",
    "mythic_location": "luxury_prompts_locations.md",
    "mythic_relic": "luxury_prompts_relics.md",
    "monad_path": "luxury_prompts_monad_path.md",
}


def write_batch(card_type, items):
    path = BATCH / TYPE_FILE.get(card_type, f"luxury_prompts_{card_type}.md")
    lines = [f"# AWARA Luxury Tarot Prompts — {card_type}", "", f"Total prompts: {len(items)}", ""]
    for index, item in enumerate(items, 1):
        lines.extend([
            f"--- [{index}/{len(items)}] {item['card_id']} ---",
            f"Рарность: {item['rarity']}",
            f"Тип: {item['card_type']}",
            f"Название: {item['display_name']}",
            f"Файл: {item.get('image_path')}",
            "",
            "ПРОМПТ:",
            item["luxury_prompt"],
            "",
        ])
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main():
    prompts = json.loads((EXPORT / "all_luxury_tarot_prompts.json").read_text(encoding="utf-8"))
    grouped = defaultdict(list)
    for item in prompts:
        grouped[item["card_type"]].append(item)
    for card_type, items in sorted(grouped.items()):
        path = write_batch(card_type, items)
        print(card_type, len(items), path)


if __name__ == "__main__":
    main()
