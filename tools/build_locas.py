#!/usr/bin/env python3
"""
build_locas.py — генератор data/locas.json (14 лок / плотностей Axis Mundi).

Источник: AWARA_Vedic_Cosmogenesis_Ultimate.txt, Часть 5
          «14 ЛОК (ВЕРТИКАЛЬНАЯ ОСЬ МИРА - AXIS MUNDI)»

Запуск: python3 tools/build_locas.py
Выход:  data/locas.json
"""

import json
import os

LOCAS = [
    {
        "id": 1,
        "name": "Сатья-лока",
        "density": 7,
        "description": "Обитель Истины (Свет Ра, Акаша)"
    },
    {
        "id": 2,
        "name": "Тапа-лока",
        "density": 6,
        "description": "Обитель Аскезы и Концентрации (Брахма, Теджас)"
    },
    {
        "id": 3,
        "name": "Джана-лока",
        "density": 5,
        "description": "Обитель Божественного Знания (Сарасвати, Джняна)"
    },
    {
        "id": 4,
        "name": "Махар-лока",
        "density": 4,
        "description": "Обитель Равновесия (Вишну, Шанти)"
    },
    {
        "id": 5,
        "name": "Свар-лока",
        "density": 3,
        "description": "Небесное Царство Радости (Лакшми, Ананда)"
    },
    {
        "id": 6,
        "name": "Бхувар-лока",
        "density": 2,
        "description": "Астральный План / Эмпатия (Ваю, Искра, Према)"
    },
    {
        "id": 7,
        "name": "Бхур-лока",
        "density": 1,
        "description": "Земной План / Твердь (Притхви, Парвати, Шакти, Агни)"
    },
    {
        "id": 8,
        "name": "Атала",
        "density": -1,
        "description": "Обитель Утраченных Иллюзий"
    },
    {
        "id": 9,
        "name": "Витала",
        "density": -2,
        "description": "Обитель Глубинной Трансформации (Шива)"
    },
    {
        "id": 10,
        "name": "Сутала",
        "density": -3,
        "description": "Обитель Благого Подземелья (Дхарма)"
    },
    {
        "id": 11,
        "name": "Талатала",
        "density": -4,
        "description": "Обитель Матричной Магии (Владения Майи)"
    },
    {
        "id": 12,
        "name": "Махатала",
        "density": -5,
        "description": "Обитель Великих Глубин / Память (Варуна)"
    },
    {
        "id": 13,
        "name": "Расатала",
        "density": -6,
        "description": "Обитель Подземных Потоков (Инстинкты)"
    },
    {
        "id": 14,
        "name": "Патала",
        "density": -7,
        "description": "Корневой Каталог / Основание (Карма)"
    }
]


def main():
    out_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'locas.json')
    out_path = os.path.normpath(out_path)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(LOCAS, f, ensure_ascii=False, indent=2)

    print(f'locas.json: {len(LOCAS)} лок -> {out_path}')


if __name__ == '__main__':
    main()
