#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AWARA · build_pilgrimages.py
Собирает пилотные арки-паломничества из квестов локаций.

Паломничество = восхождение по пирамиде: по одному квесту с каждого
тира 1..6 одной культуры, 6 дней. Совместимо с форматом arc_quests_seed.json
(движок AwaraArcs), плюс опциональное поле days[] с квестом на каждый день.

Награда арки нормализуется к --target-sum (по умолчанию 30), чтобы быть
соизмеримой с арками сида — пропорции осей сохраняются.

Использование:
  py tools/build_pilgrimages.py --src data --out data/pilgrimage_pilot.json --slugs daoist,slavic,egyptian,celtic,posthuman_ai_sophianic
"""
import argparse, json, os, re, sys
from collections import defaultdict

TIERS = [1, 2, 3, 4, 5, 6]

META_LINE = re.compile(
    r"^\s*(Название|Тип|Tier/Level|Tier|Level|Уровень)\s*:.*$", re.IGNORECASE)

def clean_text(title, text):
    """Убирает служебные строки и продублированный заголовок из текста квеста."""
    lines = (text or "").splitlines()
    out = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if META_LINE.match(s):
            continue
        bare = s.strip("«»\"„“”'‘’:—- ").lower()
        if bare and bare == (title or "").strip().lower():
            continue
        out.append(s)
    cleaned = " ".join(out)
    t = (title or "").strip()
    if t and cleaned.lower().startswith(t.lower() + ":"):
        cleaned = cleaned[len(t) + 1:].strip()
    return cleaned

def pick_day_quest(quests, used_types):
    """Выбирает квест тира: сначала разнообразие типов, потом длина чистого текста."""
    fresh = [q for q in quests if q.get("type") not in used_types] or quests
    return max(fresh, key=lambda q: len(clean_text(q.get("title"), q.get("text"))))

def build_for_slug(slug, tiers_map, target_sum):
    days, used_types = [], set()
    reward = defaultdict(float)
    for t in TIERS:
        pool = tiers_map.get(t)
        if not pool:
            return None
        q = pick_day_quest(pool, used_types)
        used_types.add(q.get("type"))
        title = (q.get("title") or "").strip()
        title = re.sub(r"^[A-Za-z]+\s*:\s*", "", title)
        days.append({
            "day": t,
            "quest_id": q.get("id"),
            "location_id": q.get("location_id"),
            "tier": t,
            "type": q.get("type"),
            "title": title,
            "text": clean_text(q.get("title"), q.get("text")),
        })
        for axis, v in (q.get("reward") or {}).items():
            reward[axis] += float(v)
    total = sum(reward.values()) or 1.0
    scale = target_sum / total
    reward = {k: round(v * scale, 2) for k, v in
              sorted(reward.items(), key=lambda x: -x[1]) if round(v * scale, 2) > 0}
    return {
        "id": "arc-pilgrim-%s-6" % slug,
        "matrix_slug": slug,
        "level": 5,
        "arc_type": "pilgrimage",
        "duration_days": 6,
        "agent": "страж пути",
        "title": "Паломничество: восхождение (%s)" % slug,
        "text": "Шесть дней — шесть ярусов пирамиды. Каждый день ты проходишь одну ступень: задание дня — ниже, в свитке пути. Не спеши: паломник несёт с собой всё, что увидел на предыдущем ярусе.",
        "checkpoint_prompt": "Какую ступень ты прошёл сегодня и что оставил на ней?",
        "proof": "text",
        "reward": reward,
        "echo_archetype": "ritual x путь/дорога",
        "days": days,
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", default="pilgrimage_pilot.json")
    ap.add_argument("--slugs", required=True, help="через запятую")
    ap.add_argument("--target-sum", type=float, default=30.0,
                    help="суммарная награда арки по всем осям (соизмеримо с арками сида)")
    args = ap.parse_args()

    loc_path = os.path.join(args.src, "all_location_quests.json")
    if not os.path.isfile(loc_path):
        sys.exit("нет файла: " + loc_path)

    by = defaultdict(lambda: defaultdict(list))
    for q in json.load(open(loc_path, encoding="utf-8")):
        by[q.get("matrix_slug")][q.get("tier")].append(q)

    arcs = []
    for slug in [s.strip() for s in args.slugs.split(",") if s.strip()]:
        arc = build_for_slug(slug, by.get(slug, {}), args.target_sum)
        if arc is None:
            print("! пропускаю %s: нет полного покрытия тиров" % slug, file=sys.stderr)
            continue
        arcs.append(arc)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump({"version": "pilot-1", "arcs": arcs}, f, ensure_ascii=False, indent=1)
    print("OK: %d паломничеств -> %s" % (len(arcs), args.out))

if __name__ == "__main__":
    main()
