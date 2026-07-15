# AWARA — План переписывания квестов для линз (матричных квестов)

## Структура
- 33 линзы (традиции) × 6 уровней глубины × ~12-13 квестов = **2475 квестов**
- Файлы: `data/matrix_quests/{slug}.json`
- Формат каждого файла:
```json
{
  "matrix_slug": "vedic",
  "matrix_name": "Ведическая",
  "ui": {"quests_title": "...", "quests_sub": "...", "done_toast": "..."},
  "levels": {
    "1": [ {quest}, {quest}, ... ],  // ~12-21 квестов на уровень
    "2": [ ... ],
    ...
    "6": [ ... ]
  }
}
```

## Формат квеста
```json
{
  "id": "vedic-1-01",
  "type": "do|observe|reflect|meditate|create|study|ritual",
  "proof": "check|text|timer|intent|facets",
  "agent": "agent_id",
  "title": "Название",
  "text": "Текст задания",
  "reward": {
    "discipline": 0.9,
    "compassion": 0.1,
    "clarity": 0.7,
    "will": 0.4,
    "devotion": 0.1,
    "transformation": 0.1,
    "unity": 0.2
  }
}
```

## Философия нового движка (engine_config.json)

### 9 Мер (не = чакры, Мера выше)
Ось позвоночника игры. Два вектора: Качество (близость к Реальности) и Полнота (многомерность).

### 5 Стихий
- **Земля** → дисциплина, воля, стойкость, тело, действие
- **Вода** → гармония, сострадание, поток, эмоции, принятие  
- **Огонь** → воля, трансформация, интенсивность, тапас
- **Воздух** → ясность, контроль ума, равновесие, наблюдение
- **Эфир** → глубина, целостность, эзотерическое знание

### 7 Осей развития
discipline, compassion, clarity, will, devotion, transformation, unity

### 7 Теней (нижние локи 8-14)
inertia(8), attachment(9), manipulation(10), envy(11), deception(12), illusion(13), separation(14)

### 3 Принципа
- Стхула (грубое) — Земля
- Прана (жизненная сила) — Вода, Огонь
- Манас (ум) — Воздух, Эфир

## Правила переписывания квестов

### 1. Прогрессия proof по уровню
| Уровень | check | text | timer | intent | facets |
|---------|-------|------|-------|--------|--------|
| L1 | 50% | 20% | 20% | 5% | 5% |
| L2 | 30% | 30% | 20% | 10% | 10% |
| L3 | 15% | 40% | 15% | 15% | 15% |
| L4 | 5% | 45% | 10% | 25% | 15% |
| L5 | 0% | 50% | 10% | 30% | 10% |
| L6 | 0% | 40% | 5% | 40% | 15% |

Корректировки по типу квеста:
- meditate → больше timer
- reflect/create → больше text/intent
- ritual → больше timer/intent

### 2. Длина и глубина текста
- **L1-L2**: Простые, конкретные задания. 80-120 символов.
- **L3-L4**: Глубже, приглашение к размышлению. 150-200 символов.
- **L5-L6**: Максимальная глубина. Упоминание стихий, мер, теней. 200-300 символов.

### 3. Приглашение к творчеству (L2+)
Добавлять подсказки:
- reflect: «Если чувствуешь — напиши в стихах», «Выразить метафорой»
- create: «Сфотографируй результат», «Нарисуй, запиши песню»
- meditate: «Запиши что увидел/почувствовал», «Опиши образ»
- observe: «Сфотографируй», «Опиши как поэт»

### 4. Награды (7 осей)
Сумма rewards ~2 для L1, ~4 для L3, ~7-14 для L5-L6.
Распределение по осям зависит от типа квеста:
- do → discipline(главная), will
- meditate → clarity(главная), transformation
- observe → clarity(главная), compassion
- reflect → transformation(главная), clarity
- create → will(главная), transformation
- study → clarity(главная), discipline
- ritual → devotion(главная), unity

### 5. Множители (11 штук)
Движок (awara-experience-engine.js) перемножает:
1. lens_depth (L1=×1.0 → L6=×2.0)
2. daily_energy (0-7 совпадений → ×1.0-2.1)
3. agent_resonance (×1.0-1.2)
4. loka_density (×1.0-1.4)
5. guna (tamas=×0.6, rajas=×1.0, sattva=×1.5)
6. quality (×0.5-1.0)
7. shadow_bonus (×1.1 при проработке тени)
8. **mastery_bonus** (ring×quality_avg → ×1.0-2.0)
9. **coop_bonus** (solo=×1.0, группа=×1.7)
10. **creativity_bonus** (стихи/музыка → ×1.0-1.7)
11. **media_bonus** (фото/видео → ×1.0-1.6)

### 6. Пейсинг (6+ месяцев)
- ИИ-оценки/день: 3 (Ring -3) → 10 (Ring 3) → ∞ (Ring 9)
- Квесты/день: 5 (Ring -3) → 8 (Ring 4) → 12 (Ring 9)
- Гейты глубины: L3 требует 13 квестов + quality≥0.4, L6 требует 68 + quality≥0.7

### 7. ИИ-оценка ответа игрока
При каждом текстовом ответе ИИ определяет:
- element (стихия по качеству ответа)
- guna (tamas/rajas/sattva)
- quality_score (0-1)
- fullness_score (0-1, многомерность)
- loka (1-14)
- shadow_detected (какая тень проработана)
- creativity_level (none/lyrical/poetry/art_reference/original_creation)

## Список 33 линз (slug → name)
vedic, buddhist_mahayana, daoist, celtic, egyptian, norse, slavic, shamanic, 
shinto, hermetic_alchemical, kabbalistic, gnostic, islamic_sufi_nur, 
christian_mystical_grail, tantric_kashmiri, chinese_iching, 
antique_greco_roman, mayan, aztec_mexica, sumerian_babylonian, 
advaita_siddha, gene_keys, cosmic_galactic, posthuman_ai_sophianic, 
tarot_arcanic, astrological, technomagical, shambhala, afro_dogon, 
yoruba_ifa_orisha, julian_byzantine, atlantean_lemurian, zoroastrian
