import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NEGATIVE = "Ни текста, ни надписей, ни букв, ни водяных знаков, ни логотипов, ни подписи художника — только изображение карты."
BASE_STYLE = "premium mystical tarot card art, esoteric cosmology, theosophical symbolic diagram atmosphere, ornate golden border frame, portrait orientation, highly detailed, 8k, cinematic sacred lighting, cosmic evolution, no readable text"

STAGES = [
    ("polar_race", "I. Полярная раса", "stage", "legendary", "Эфир", "инволюция", "эфирный бессознательный дух", "эфирные бесплотные существа, чистая духовная возможность без физического тела и индивидуального самосознания", "учит игрока теме первичной невинности, до-личностного света и начала нисхождения", "ethereal polar beings of pure light, translucent human seeds, arctic cosmic dawn, no physical bodies"),
    ("hyperborean_race", "II. Гиперборейская раса", "stage", "epic", "Воздух", "инволюция", "полудуховное уплотнение", "начало уплотнения формы, формирование пранического энергетического контура, зарождение жизненного дыхания", "открывает квесты жизненной силы, дыхания и первых границ формы", "semi-spiritual Hyperborean beings, aurora continents, pranic luminous outlines, floating subtle bodies"),
    ("lemurian_race", "III. Лемурийская раса", "stage", "legendary", "Огонь", "инволюция", "пробуждение Манаса", "обретение плотного тела, разделение полов, сошествие Манасапутр и зажигание искры интеллекта", "даёт карты пробуждения разума, тела, пола, ответственности и огня индивидуальности", "ancient Lemurian titanic silhouettes, volcanic earth, solar angels descending, flame of mind igniting humanity"),
    ("atlantean_race", "IV. Атлантическая раса", "stage", "legendary", "Вода", "нижняя точка", "максимальная плотность и астральная мощь", "полное погружение в физическую материю, расцвет астральной магии, технологий, эмоциональной силы и последующий катаклизм", "проверяет игрока на власть, эмоции, магию желания и злоупотребление силой", "Atlantean crystal cities, storm oceans, astral magic, colossal waves, luminous technology and tragic flood"),
    ("aryan_race", "V. Арийская раса", "stage", "epic", "Земля", "эволюция", "развитие низшего Манаса", "текущая стадия аналитического интеллекта, различения, культуры, науки и преодоления диктата желания", "усиливает карты выбора, дисциплины ума, кармы и ответственности эпохи", "current human age, sacred cities, books, tools, analytical mind mandalas, earth path rising from ruins"),
    ("sixth_race", "VI. Шестая раса", "stage", "mythic", "Воздух", "эволюция", "пробуждение Буддхи", "грядущий синтез интеллекта и духовной интуиции, мудрости, сострадания и группового сознания", "открывает карты будущего, интуиции, любви, братства и коллективной эволюции", "future luminous humanity, heart-mind halos, group consciousness, rainbow buddhic light, peaceful radiant cities"),
    ("seventh_race", "VII. Седьмая раса", "stage", "mythic", "Эфир", "эволюция", "раскрытие Атмы", "финальная стадия земного цикла, духовное просветление и возвращение Монады к божественному источнику с самосознанием", "является высшей картой завершения цикла, интеграции и перехода на новый космический виток", "final radiant humanity of Atma, golden-white ascension, monads returning to divine source, cosmic spiral completion")
]

PRINCIPLES = [
    ("atma", "Атма", "principle", "mythic", "Эфир", "божественный дух", "высший принцип человека, луч универсального духа и источник духовной воли", "усиливает карты предназначения, высшей воли и финального смысла", "pure divine spark above crown, white-gold flame, monadic ray, cosmic source"),
    ("buddhi", "Буддхи", "principle", "legendary", "Воздух", "духовная душа", "интуитивная мудрость, сострадание, безусловная любовь и способность прямого знания", "открывает квесты сердца, мудрости и синтеза", "buddhic lotus heart, rainbow-gold aura, compassionate wisdom light"),
    ("manas", "Манас", "principle", "legendary", "Огонь", "разум", "мыслящий принцип, мост между животной природой и духовной душой, искра самосознания", "влияет на выбор, стратегию, обучение и различение", "fiery mind mandala, solar angel spark, luminous brain-lotus bridge"),
    ("kama", "Кама", "principle", "epic", "Вода", "желание", "астрально-эмоциональный принцип влечения, страсти, жажды опыта и привязанности", "проверяет игрока на желания, эмоции и зависимость от образов", "astral desire waters, crimson-blue waves, emotional moon mirror, lotus and chains"),
    ("prana", "Прана", "principle", "epic", "Воздух", "жизненная сила", "дыхание жизни, энергетический ток, оживляющий форму и связывающий тело с тонкими полями", "усиливает восстановление, daily energy и телесную осознанность", "visible pranic winds, golden breath spirals, living energy currents"),
    ("linga_sharira", "Линга Шарира", "principle", "rare", "Эфир", "эфирный двойник", "тонкая матрица формы, энергетический шаблон физического тела", "связан с картами формы, здоровья, образа и скрытой структуры", "etheric human double, blue-violet subtle body grid, sacred anatomy lines"),
    ("sthula_sharira", "Стхула Шарира", "principle", "rare", "Земля", "физическое тело", "плотная форма воплощения, инструмент действия, опыта и кармической проверки", "даёт земные квесты тела, привычек, труда и материи", "sacred physical body as temple, earth, bones, roots, golden anatomical mandala")
]

ARCS = [
    ("involution_arc", "Дуга Инволюции", "arc", "mythic", "Тьма", "нисхождение души", "нисхождение Монады из чистого духа в плотную материю для обретения формы, тела, границ и опыта", "открывает сценарии погружения, испытания формой, тенью, желанием и плотностью", "great descending cosmic arc, monad falling into matter, spiral from white light into dense world"),
    ("evolution_arc", "Дуга Эволюции", "arc", "mythic", "Эфир", "восхождение души", "возвращение Монады к духовному Источнику через пробуждение самосознания, мудрости и духовной воли", "открывает сценарии восхождения, интеграции опыта и возвращения к источнику", "great ascending cosmic arc, soul rising from matter to spirit, golden spiral to divine source")
]


def prompt_for(card):
    return (
        f"Создай роскошную коллекционную карту в стиле эпического мистического таро. "
        f"Центральный образ: {card['display_name']} — {card['role']}, карта Пути Монады в эзотерической космологии. "
        f"Смысл: {card['mythology']} "
        f"Игровое влияние: {card['player_effect']} "
        f"Фаза пути: {card['arc_phase']}. Стихия: {card['element']}. "
        f"Визуальная сцена: {card['visual']}. "
        f"Передай инволюцию и эволюцию души, семь принципов человека, космические циклы, монадическую искру, сакральные диаграммы и золотую рамку. "
        f"Стиль: {BASE_STYLE}. {NEGATIVE}"
    )


def make_card(slug, name, category, rarity, element, arc_phase, role, mythology, player_effect, visual):
    card = {
        "card_id": f"monad_path__{slug}",
        "card_type": "monad_path",
        "rarity": rarity,
        "display_name": name,
        "category": category,
        "element": element,
        "arc_phase": arc_phase,
        "role": role,
        "mythology": mythology,
        "description": mythology,
        "player_effect": player_effect,
        "visual": visual,
        "game_significance": {
            "significance_tier": "monadic_axis" if rarity == "mythic" else "evolutionary_stage",
            "gameplay_hint": player_effect,
            "arc_phase": arc_phase,
            "category": category
        },
        "unlock_context": ["monad_path", "esoteric_evolution", "cosmic_cycle", "high_rarity_reward"],
        "future_effect_hooks": ["monad_progression", "principle_activation", "involution_evolution_arc", "consciousness_stage_unlock"],
        "negative_prompt": NEGATIVE,
        "image_path": f"cards_monad_path/monad_path__{slug}.webp",
        "type_label": "ПУТЬ МОНАДЫ"
    }
    card["prompt"] = prompt_for(card)
    return card


def main():
    principle_cards = [
        make_card(slug, name, category, rarity, element, "семь принципов человека", role, mythology, player_effect, visual)
        for slug, name, category, rarity, element, role, mythology, player_effect, visual in PRINCIPLES
    ]
    arc_cards = [
        make_card(slug, name, category, rarity, element, arc_phase, "великая дуга пути", mythology, player_effect, visual)
        for slug, name, category, rarity, element, arc_phase, mythology, player_effect, visual in ARCS
    ]
    cards = [make_card(*item) for item in STAGES] + principle_cards + arc_cards
    (DATA / "monad_path_cards.json").write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"monad path cards {len(cards)}")


if __name__ == "__main__":
    main()
