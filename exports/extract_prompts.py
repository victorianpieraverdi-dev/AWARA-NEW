import json
lines = open(r"C:\AWARA\exports\all_luxury_tarot_prompts.jsonl", encoding="utf-8").readlines()
selected = []
for i in range(1099, min(1200, len(lines))):
    data = json.loads(lines[i])
    selected.append({"index": data["index"], "card_id": data["card_id"], "display_name": data["display_name"], "image_path": data.get("image_path",""), "luxury_prompt": data["luxury_prompt"]})
with open(r"C:\AWARA\exports\prompts_1100_1200.json", "w", encoding="utf-8") as f:
    json.dump(selected, f, ensure_ascii=False)
print(f"Extracted {len(selected)} prompts to prompts_1100_1200.json")
