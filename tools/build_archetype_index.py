#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AWARA · build_archetype_index.py
Собирает data/quest_archetype_index.json из квестов линз и локаций.

Архетип = тип квеста x мотив текста (регулярки по русским корням).
Ключ квеста = slug|level|title (для локаций level = tier).

Использование:
  python3 build_archetype_index.py --src <папка с данными> --out quest_archetype_index.json

--src должен указывать на папку, где лежат:
  - файлы линз {slug}.json (или подпапка matrix_quests/)
  - all_location_quests.json (опционально)
"""
import argparse, json, os, re, sys
from collections import defaultdict

LENS_SLUGS = [
    "vedic", "buddhist_mahayana", "daoist", "celtic", "egyptian", "norse",
    "slavic", "shamanic", "shinto", "hermetic_alchemical", "kabbalistic",
    "gnostic", "islamic_sufi_nur", "christian_mystical_grail", "tantric_kashmiri",
    "chinese_iching", "antique_greco_roman", "mayan", "aztec_mexica",
    "sumerian_babylonian", "advaita_siddha", "gene_keys", "cosmic_galactic",
    "posthuman_ai_sophianic", "tarot_arcanic", "astrological", "technomagical",
    "shambhala", "afro_dogon", "yoruba_ifa_orisha", "julian_byzantine",
    "atlantean_lemurian", "zoroastrian",
]

# Мотивы: имя -> регулярка по русским корням (без учёта регистра)
MOTIFS = {
    "огонь/пламя":        r"огн|огон|плам|свеч|костр|искр",
    "вода/поток":         r"вод[аоыуе]|поток|рек[аиу]|волн|течен|дожд",
    "дыхание":            r"дыхан|дыши|вдох|выдох",
    "тишина/молчание":    r"тишин|молчан|безмолв|молча",
    "слово/имя":          r"слов[оа]|имя|имен|назов|произнес",
    "зеркало/себя":       r"зеркал|отражен|самонаблюд|себя со стороны",
    "тень/страх":         r"тен[ьи]|страх|тревог|раздражен|завист",
    "сердце/любовь":      r"сердц|любов|любящ|нежност",
    "благодарность":      r"благодар|признательн",
    "служение/дар":       r"служен|помоги|помощ|подар|дар[иа]|отда[йт]|милостын",
    "граница/мера":       r"границ|мер[аыу]|запрет|воздерж|отказ|ограничен",
    "тело/движение":      r"тел[оа]|движен|походк|танц|жест|осанк",
    "еда/вкус":           r"ед[аыу]|пищ|вкус|трапез|чаш|ча[йя]",
    "сон/видение":        r"сон|снов|сновиден|виден|грез",
    "природа/земля":      r"природ|земл|дерев|растен|трав|камен|камн",
    "небо/звёзды":        r"неб[оае]|звезд|лун[аыу]|солнц|рассвет|закат",
    "смерть/непостоянство": r"смерт|конечн|непостоян|уход|прощан",
    "род/предки":         r"род[ауе]?\b|предк|семь|старш",
    "путь/дорога":        r"пут[ьи]|дорог|тропа|шаг[иа]|странств",
    "свет":               r"свет|сияни|луч",
    "звук/музыка":        r"звук|музык|мелоди|песн|ритм|барабан",
    "письмо/дневник":     r"запиш|запис|дневник|письм|списо?к",
    "время/момент":       r"момент|мгновен|минут|час[ае]?\b|сейчас|настоящ",
    "дом/пространство":   r"дом[ае]?\b|жилищ|комнат|пространств|порядок|убер",
    "обмен/деньги":       r"деньг|обмен|купи|трат|ценност",
    "прощение":           r"прости|прощен|примирен|обид",
    "внимание/наблюдение": r"вниман|наблюда|заметь|замеча|присмотр",
    "намерение/выбор":    r"намерен|выбор|выбери|реши|цел[ьи]",
    "община/другие":      r"común|общин|друг(ому|им|их)|ближн|незнаком|людям|человеку",
    "учение/знание":      r"учени|изучи|знани|прочти|узна[йт]",
    "созидание/творчество": r"созда[йт]|сотвор|нарису|слепи|постро|творч",
}
MAX_MOTIFS_PER_QUEST = 2

def find_lens_file(src, slug):
    for cand in (os.path.join(src, "matrix_quests", slug + ".json"),
                 os.path.join(src, slug + ".json")):
        if os.path.isfile(cand):
            return cand
    return None

def motifs_of(text):
    t = (text or "").lower()
    hits = []
    for name, rx in MOTIFS.items():
        if re.search(rx, t):
            hits.append(name)
        if len(hits) >= MAX_MOTIFS_PER_QUEST:
            break
    return hits

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="папка с данными (data/ репозитория)")
    ap.add_argument("--out", default="quest_archetype_index.json")
    args = ap.parse_args()

    index = {}
    arch_count = defaultdict(int)
    total = 0

    # 1. Квесты линз
    for slug in LENS_SLUGS:
        path = find_lens_file(args.src, slug)
        if not path:
            print("! нет файла линзы:", slug, file=sys.stderr)
            continue
        pack = json.load(open(path, encoding="utf-8"))
        for lv, quests in (pack.get("levels") or {}).items():
            for q in quests or []:
                total += 1
                ms = motifs_of((q.get("title", "") + " " + q.get("text", "")))
                if not ms:
                    continue
                archs = [q.get("type", "do") + " x " + m for m in ms]
                index["%s|%s|%s" % (slug, lv, q.get("title", ""))] = {"archetypes": archs}
                for a in archs:
                    arch_count[a] += 1

    # 2. Квесты локаций (если файл есть)
    loc_path = os.path.join(args.src, "all_location_quests.json")
    if os.path.isfile(loc_path):
        for q in json.load(open(loc_path, encoding="utf-8")):
            total += 1
            ms = motifs_of((q.get("title", "") + " " + q.get("text", "")))
            if not ms:
                continue
            archs = [q.get("type", "do") + " x " + m for m in ms]
            slug = q.get("matrix_slug") or ("loc:" + str(q.get("location_id", "")))
            key = "%s|%s|%s" % (slug, q.get("tier", q.get("level", "")), q.get("title", ""))
            index[key] = {"archetypes": archs}
            for a in archs:
                arch_count[a] += 1
    else:
        print("! all_location_quests.json не найден — индексируются только линзы", file=sys.stderr)

    out = {
        "_meta": {
            "version": "1.0",
            "total_quests_seen": total,
            "indexed": len(index),
            "archetypes": len(arch_count),
            "key_format": "slug|level|title",
        },
        "archetype_counts": dict(sorted(arch_count.items(), key=lambda x: -x[1])),
        "index": index,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("OK: просмотрено %d квестов, размечено %d, архетипов %d -> %s"
          % (total, len(index), len(arch_count), args.out))

if __name__ == "__main__":
    main()
