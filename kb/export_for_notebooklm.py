"""
Собрать все страницы wiki/ в 5 больших TXT-файлов для загрузки в NotebookLM.
NotebookLM принимает до 50 источников, так что группируем по категориям.
"""

from pathlib import Path
import os

WIKI = Path(__file__).parent / "wiki"
OUT = Path(__file__).parent / "notebooklm_export"
OUT.mkdir(exist_ok=True)

# Группировка по папкам
GROUPS = {}

for md in WIKI.rglob("*.md"):
    if md.name in ("index.md", "log.md"):
        continue
    rel = md.relative_to(WIKI)
    # Категория = первая папка в пути
    cat = str(rel.parts[0]) if len(rel.parts) > 1 else "root"
    if cat not in GROUPS:
        GROUPS[cat] = []
    GROUPS[cat].append(md)

print(f"Found {sum(len(v) for v in GROUPS.values())} files in {len(GROUPS)} categories\n")

for cat, files in sorted(GROUPS.items()):
    out_path = OUT / f"awara_{cat}.txt"
    with open(out_path, "w", encoding="utf-8") as out:
        for f in sorted(files):
            try:
                content = f.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                content = f.read_text(encoding="cp1251")
            out.write(f"\n\n{'='*60}\n")
            out.write(f"FILE: {f.relative_to(WIKI)}\n")
            out.write(f"{'='*60}\n\n")
            out.write(content)
    size_kb = out_path.stat().st_size // 1024
    print(f"  {out_path.name} — {len(files)} файлов, {size_kb} KB")

print(f"\nГотово! Загрузи эти {len(GROUPS)} файлов в NotebookLM.")
print(f"Папка: {OUT}")
