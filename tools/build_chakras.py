#!/usr/bin/env python3
"""
build_chakras.py — генератор data/chakras.json (9 чакр-мер).

Источник: AWARA_Structured_Omnibus_V3.txt (Глава 8, «Девятимерная система»),
          AWARA_Zodiac_and_Chakra_Prompts_Expansion.txt (7 классических чакр),
          Ведическая традиция (биджа-мантры, цвета, элементы).

7 классических чакр (Муладхара → Сахасрара) + 2 высшие мерности (Монада, Абсолют).

Запуск: python3 tools/build_chakras.py
Выход:  data/chakras.json
"""

import json
import os

CHAKRAS = [
    {
        "id": 1,
        "slug": "muladhara",
        "name": "Муладхара",
        "sanskrit": "Mūlādhāra",
        "position": "Корень (основание позвоночника)",
        "color": "Красный",
        "element": "Земля",
        "mantra_seed": "LAM"
    },
    {
        "id": 2,
        "slug": "svadhisthana",
        "name": "Свадхистхана",
        "sanskrit": "Svādhiṣṭhāna",
        "position": "Крестец (ниже пупка)",
        "color": "Оранжевый",
        "element": "Вода",
        "mantra_seed": "VAM"
    },
    {
        "id": 3,
        "slug": "manipura",
        "name": "Манипура",
        "sanskrit": "Maṇipūra",
        "position": "Солнечное сплетение",
        "color": "Жёлтый",
        "element": "Огонь",
        "mantra_seed": "RAM"
    },
    {
        "id": 4,
        "slug": "anahata",
        "name": "Анахата",
        "sanskrit": "Anāhata",
        "position": "Сердце",
        "color": "Зелёный",
        "element": "Воздух",
        "mantra_seed": "YAM"
    },
    {
        "id": 5,
        "slug": "vishuddha",
        "name": "Вишуддха",
        "sanskrit": "Viśuddha",
        "position": "Горло",
        "color": "Голубой",
        "element": "Эфир",
        "mantra_seed": "HAM"
    },
    {
        "id": 6,
        "slug": "ajna",
        "name": "Аджна",
        "sanskrit": "Ājñā",
        "position": "Третий глаз (межбровье)",
        "color": "Индиго",
        "element": "Свет",
        "mantra_seed": "OM"
    },
    {
        "id": 7,
        "slug": "sahasrara",
        "name": "Сахасрара",
        "sanskrit": "Sahasrāra",
        "position": "Корона (макушка)",
        "color": "Фиолетовый / Белый",
        "element": "Сознание",
        "mantra_seed": "AUM"
    },
    {
        "id": 8,
        "slug": "monada",
        "name": "Монада",
        "sanskrit": "Monad (Overself)",
        "position": "Надастральный план (8-я мерность)",
        "color": "Золотой",
        "element": "Монадический Свет",
        "mantra_seed": "SO-HAM"
    },
    {
        "id": 9,
        "slug": "absolut",
        "name": "Абсолют (Параматман)",
        "sanskrit": "Paramātman",
        "position": "Исходный Код (9-я мерность)",
        "color": "Прозрачный",
        "element": "Абсолют",
        "mantra_seed": "Тишина"
    }
]


def main():
    out_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'chakras.json')
    out_path = os.path.normpath(out_path)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(CHAKRAS, f, ensure_ascii=False, indent=2)

    print(f'chakras.json: {len(CHAKRAS)} чакр-мер -> {out_path}')


if __name__ == '__main__':
    main()
