# AWARA — Тестовые промпты для OpenArt.ai

**Цель:** протестировать генерацию карт AWARA на разных моделях OpenArt.ai и выбрать лучшую.
**Формат карты:** коллекционная карта таро, 3:4, золото на чёрном, сакральная геометрия.

---

## 🎨 МОДЕЛИ НА OPENART.AI (что пробовать)

| Приоритет | Модель | Для чего | Качество |
|-----------|--------|----------|----------|
| 🥇 | **Flux 2** | Основная модель. Детализация, свет, текстуры. | Максимальное |
| 🥈 | **Flux Pro / Flux 1.1** | Быстрее Flux 2. Хороший баланс скорость/качество. | Высокое |
| 🥉 | **SDXL / SD3** | Альтернатива. Разные стили, loras. | Хорошее |
| 4 | **Recraft / Ideogram** | Если доступны. Хороши для текста и рамок. | Высокое |
| 🎬 | **Kling / Runway Gen-3** | Видео. Анимированные карты. | — |

---

## 🧪 ТЕСТОВЫЙ НАБОР №1: 5 КАРТ ДЛЯ СРАВНЕНИЯ МОДЕЛЕЙ

Каждый промпт — универсальный (работает на Flux 2, Flux Pro, SDXL). Прогони один и тот же промпт через ВСЕ доступные модели и сравни.

---

### КАРТА 1: Свет Ра (Ведическая матрица)

```
A premium collectible tarot card in epic mystical style. Golden sacred geometry mandala background, ornate gold-embossed frame with Vedic yantra patterns.

CENTRAL IMAGE: Male Hindu sun god Surya with radiant golden crown, third eye glowing, riding a celestial golden chariot pulled by seven luminous white horses across the dawn sky. He holds two lotus flowers emitting divine light. Behind his head — a massive golden sun disk halo with coronal flares.

COSTUME: Red and gold royal silk robes with intricate zari embroidery, sacred thread across chest, ruby and gold ornaments, golden armbands.

BACKGROUND: Ancient Indian temple architecture — carved sandstone pillars, lotus mandalas floating in space, Sanskrit sacred geometry (Sri Yantra) in gold lines, saffron and gold atmosphere. Depth and perspective — temples in distance, celestial Ganges flowing through space.

EFFECTS: Volumetric god rays streaming from sun disk, floating golden particles (sparkles of light), ethereal golden glow aura, subtle lens flare at sun center, dramatic backlighting creating rim light on figure and horses.

COLOR PALETTE: Deep cosmic black (#0a0a14) background transitioning to warm gold (#c9a84c, #ffd700) in the center, accents of deep red (#8b0000), saffron orange, and pure white light (#fff8d6).

STYLE: High-end digital painting, cinematic lighting, premium collectible card art, ornate gilded border, 3:4 aspect ratio, hyperdetailed, 8K quality, photorealistic rendering with mystical atmosphere, expensive luxury aesthetic.

TECHNICAL: No text, no letters, no watermarks, no signatures, no logos. Only the card image. Portrait orientation. Professional color grading.
```

---

### КАРТА 2: Према (Славянская матрица)

```
A premium collectible tarot card in epic mystical style. Silver-gold sacred geometry background with Slavic protective symbols, ornate silver-embossed frame with Slavic knot patterns.

CENTRAL IMAGE: Ancient Slavic healer-woman, the Great Grandmother (Velika Babka-Tselitelnitsa), with long silver-white braided hair, wise wrinkled face with luminous kind eyes that glow with inner golden light. She wears traditional Slavic embroidered white dress with red protective embroidery (rushnyk patterns). Her hands, weathered but gentle, cradle a glowing golden orb of healing light. Around her — seven floating herbal bundles (chamomile, sage, St. John's wort) emitting soft green luminescence.

BACKGROUND: Ancient Slavic wooden izba interior at twilight — carved wooden beams with solar symbols, embroidered ritual towels (rushnyky) hanging, a clay stove (pech) with fire glowing inside, bundles of dried herbs hanging from rafters, a window showing the evening star (Zorya). Root-like energy threads connecting her to the earth below the wooden floor.

EFFECTS: Warm golden healing light radiating from her hands and the orb, tiny floating ember particles, soft ethereal glow around her silhouette, gentle volumetric rays through the window, subtle bio-luminescence from the herbs.

COLOR PALETTE: Deep forest green-black background, warm amber and gold light (#c9a84c, #ffd700), accents of embroidery red (#cc0000), herbal green, pure white linen, and soft silver moonlight.

STYLE: High-end digital painting, cinematic lighting, premium collectible card art, ornate Slavic-motif border, 3:4 aspect ratio, hyperdetailed, 8K quality, mystical folk atmosphere, expensive luxury aesthetic.

TECHNICAL: No text, no letters, no watermarks, no signatures, no logos. Only the card image. Portrait orientation.
```

---

### КАРТА 3: Искра (Каббалистическая матрица)

```
A premium collectible tarot card in epic mystical style. Deep indigo-violet sacred geometry with Tree of Life (Sefirot) pattern, ornate gold and amethyst frame with Hebrew letter motifs.

CENTRAL IMAGE: A divine cyber-organic feminine figure — Iskra (the Spark) — with crystalline-blue luminous skin revealing inner stars and circuitry patterns. Her hair is flowing plasma — violet and electric blue streams merging with cosmic energy. She has three eyes — two normal and one diamond-shaped third eye emitting pure white light. She floats in a meditation pose within a geometric Tree of Life structure made of light. Ten Sefirot spheres orbit around her at different levels, connected by lightning-flash paths (the Flaming Sword).

BACKGROUND: Deep cosmic void with Kabbalistic concentric circles — the Ein Sof (infinite light) at the very center behind her. Golden Hebrew letters float subtly in the space. The Four Worlds (Atzilut, Beriah, Yetzirah, Assiah) represented as four layers of reality from pure light to crystalline matter.

EFFECTS: Electric blue and violet energy streams along the Tree of Life paths, golden-white divine light descending through the Sefirot, crystalline reflections and refractions, subtle quantum particle effects, sacred geometry wireframe overlay.

COLOR PALETTE: Deep indigo-black (#0a0014), electric violet (#8b00ff), sapphire blue (#4169e1), pure white divine light (#ffffff), gold (#ffd700), amethyst purple (#9966cc).

STYLE: High-end digital painting, cinematic lighting, premium collectible card art, ornate Kabbalistic border, 3:4 aspect ratio, hyperdetailed, 8K quality, mystical sci-fi aesthetic, expensive luxury feel.

TECHNICAL: No text, no letters, no watermarks, no signatures, no logos. Only the card image. Portrait orientation.
```

---

### КАРТА 4: Архат (Даосская матрица)

```
A premium collectible tarot card in epic mystical style. Jade-green and gold sacred geometry with Bagua (Eight Trigrams) pattern, ornate jade-carved frame with Taoist symbol motifs.

CENTRAL IMAGE: An elderly Taoist immortal (Arhat / Xian) with flowing white beard and eyebrows, wearing flowing jade-green and white silk robes with cloud patterns. He stands on a mountain peak above the clouds, one hand raised holding a luminous golden pearl (the Elixir of Life), the other hand pointing down to earth. Behind him — a giant Yin-Yang symbol made of swirling golden light and deep water. A dragon (Yang) made of golden fire and a tiger (Yin) made of silver mist circle around him.

BACKGROUND: Misty sacred Chinese mountains (Huangshan-style granite peaks) emerging from a sea of clouds. Pine trees clinging to rocks. Above — the Big Dipper constellation (Northern Dipper) shining brightly. The Jade Emperor's celestial palace visible in distant clouds. Flowing calligraphic energy lines (Qi) throughout the space.

EFFECTS: Golden Qi energy streams flowing from the pearl, misty clouds swirling with inner light, subtle constellation lines, jade-green bioluminescence, floating peach blossom petals.

COLOR PALETTE: Jade green (#00a86b), celestial gold (#ffd700, #c9a84c), white cloud (#f0f0f0), vermillion red accents (#e34234), ink black (#1a1a1a), sky blue (#87ceeb).

STYLE: High-end digital painting, cinematic lighting, premium collectible card art, ornate jade-motif border, 3:4 aspect ratio, hyperdetailed, 8K quality, mystical Taoist aesthetic, expensive luxury feel.

TECHNICAL: No text, no letters, no watermarks, no signatures, no logos. Only the card image. Portrait orientation.
```

---

### КАРТА 5: Маат (Египетская матрица)

```
A premium collectible tarot card in epic mystical style. Lapis lazuli blue and gold sacred geometry with Egyptian temple patterns, ornate gold and lapis frame with hieroglyphic motifs.

CENTRAL IMAGE: Goddess Maat with majestic wings of white and gold feathers spread wide. She has lapis lazuli blue skin, wears a golden nemes headdress, and holds the Feather of Truth on one palm — a glowing white ostrich feather that radiates pure light. In her other hand — a golden ankh. Her eyes are cosmic — containing starfields. Above her head floats a massive golden scale — one plate holding a human heart, the other holding the feather, perfectly balanced.

BACKGROUND: The Hall of Two Truths (Hall of Maat) — massive Egyptian columns with lotus capitals, walls covered in glowing hieroglyphs, the 42 Assessors sitting in judgment along the walls as silhouettes. The ceiling opens to the starry sky where Ra's solar barque sails. The Nile flows at the bottom reflecting starlight.

EFFECTS: Golden light radiating from the balanced scale, lapis lazuli blue particles floating, subtle golden dust motes in temple light beams, ethereal glow around the feather, dramatic volumetric lighting through temple columns.

COLOR PALETTE: Lapis lazuli blue (#2e5090), Egyptian gold (#ffd700, #c9a84c), white marble (#f5f5dc), deep black (#0a0a0a), turquoise accents (#40e0d0), sandstone beige (#c2b280).

STYLE: High-end digital painting, cinematic lighting, premium collectible card art, ornate Egyptian-motif border, 3:4 aspect ratio, hyperdetailed, 8K quality, mystical ancient aesthetic, expensive luxury feel.

TECHNICAL: No text, no letters, no watermarks, no signatures, no logos. Only the card image. Portrait orientation.
```

---

## 📊 КАК ТЕСТИРОВАТЬ

1. Зайди в OpenArt.ai → выбор модели
2. Вставь промпт КАРТЫ 1 (Свет Ра) 
3. Сгенерируй на **Flux 2** (если доступен)
4. Сгенерируй тот же промпт на **Flux Pro**
5. Сгенерируй тот же промпт на **SDXL** (если доступен)
6. Сравни: детализация рамки, качество лица, свечение, сакральная геометрия, атмосфера
7. Повтори для КАРТ 2-5

**Что сравнивать:**
- Чёткость рамки и орнаментов
- Качество лица и рук
- Золотое свечение и объём
- Атмосфера (мистическая, не мультяшная)
- Детализация фона (храмы, символы)
- Отсутствие артефактов (кривые пальцы, размытость)

---

## 🎬 ВИДЕО-ПРОМПТЫ (для Kling / Runway / Mochi)

Тот же стиль, но в движении. Пробуй если на OpenArt.ai есть видео-генерация.

### ВИДЕО 1: Свет Ра — Восход

```
A premium collectible tarot card coming to life with subtle elegant motion. The golden sun disk behind Surya pulses gently with breathing light — expanding and contracting. The seven white horses shift their legs slightly, manes flowing in solar wind. Golden particles float upward from the chariot wheels. The lotus flowers in his hands emit soft radiating light rings. The background mandala rotates imperceptibly slowly. Camera slowly pushes in (dolly in) toward the sun disk center. The gold-embossed frame remains static and sharp. 8 seconds, 24fps, cinematic quality. No sudden movements — everything is slow, sacred, hypnotic. The card remains a card — just subtly alive.
```

### ВИДЕО 2: Према — Исцеление

```
A premium collectible tarot card with subtle sacred animation. The golden healing orb in the Grandmother's hands pulses with soft breathing light. The seven herbal bundles slowly orbit the orb with gentle floating motion. Her silver hair moves subtly as if in a gentle breeze. The fire inside the clay stove flickers with warm amber light casting moving shadows on the walls. Tiny golden ember particles float upward from her hands. The evening star outside the window twinkles faintly. The camera slowly pulls back (dolly out) revealing more of the carved wooden beams above. 8 seconds, 24fps, cinematic quality. Slow, peaceful, meditative motion. The ornate frame remains sharp and static.
```

### ВИДЕО 3: Искра — Древо Жизни

```
A premium collectible tarot card with subtle cosmic animation. The ten Sefirot spheres orbit Iskra in slow concentric circles at different speeds — the outermost slowest, the innermost slightly faster. Lightning-flash energy flows along the paths connecting the spheres. Her crystalline-blue skin reflects and refracts inner light that shifts very slowly. Her plasma hair flows upward like slow-motion aurora — violet and electric blue streams. The diamond third eye emits pulsing white light. The Ein Sof (infinite light) behind her breathes with imperceptible expansion. 8 seconds, 24fps, cinematic quality. Hypnotic, cosmic, sacred motion. Frame remains static.
```

---

## ⚡ БЫСТРЫЙ СТАРТ (если мало времени)

Промпты адаптированы для **Flux 2** — самая качественная модель на OpenArt.ai. Если она недоступна, используй **Flux Pro**.

**Минимальный тест (15 минут):**
1. Карта 1 (Свет Ра) на Flux 2
2. Карта 1 (Свет Ра) на Flux Pro  
3. Карта 1 (Свет Ра) на SDXL
4. Сравнить → выбрать лучшую модель
5. Сгенерировать остальные 4 карты на лучшей модели

---

## 📝 ПАРАМЕТРЫ ДЛЯ ВСЕХ ГЕНЕРАЦИЙ

```
Aspect ratio: 3:4 (портрет)
Steps: 30-40 (для Flux) / 25-35 (для SDXL)
Guidance scale: 3.5-5 (Flux) / 7-9 (SDXL)
Resolution: максимум что даёт модель
Negative prompt (общий): blurry, low quality, deformed, ugly, nsfw, text, letters, watermark, signature, logo, cropped, bad anatomy, extra fingers, missing fingers, distorted face, cartoon, anime, 3d render, plastic
```

---

*После тестов выберем лучшую модель и сгенерируем все 63 карты (21 агент × 3 матрицы).*
