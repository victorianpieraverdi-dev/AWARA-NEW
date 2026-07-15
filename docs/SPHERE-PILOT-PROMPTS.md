# AWARA · ПИЛОТ фонов под неподвижную сферу (33×6)

Цель: переделать карты `lens_levels/{slug}_l{N}.webp` так, чтобы они **идеально ложились под фиксированную центральную сферу** Тигля/Истока — БЕЗ ручной подгонки пультом. Сфера стоит всегда в одной точке; меняется фон, лор и отношение к сфере по сюжету восхождения.

Пилот: **vedic · egyptian · kabbalistic · slavic** (4 матрицы × 6 = 24 карты). Прогнать через Виктора (2:3), положить в `exports/generated_cards/lens_levels/`, обновить страницу (Ctrl+Shift+R), выбрать лучший стиль — потом раскатаем на все 33.

> **Стиль-принцип (утверждён):** красивый luxury-арт как в готовой колоде + ЖИРНЫЙ культурный лор (конкретные божества, храмы, символы, мифология) + канон неподвижной сферы. Не сухие технические промты, а богатые лорные — но со строгим замком композиции.

---

## 0. ОБЩИЕ БЛОКИ (вставлять в каждый промпт)

Каждый готовый промпт = **СЕРДЦЕ УРОВНЯ** (CENTRAL IMAGE + BACKGROUND + EFFECTS + COLOR PALETTE) + **COMPOSITION LOCK** + **STYLE** + **NEGATIVE**.

**STYLE (обычный):**
```
High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
```
**STYLE (для L6):** добавить в конце `, transcendent divine masterpiece`.

**NEGATIVE (обычный):**
```
text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**NEGATIVE (для L4):**
```
text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, figure fills frame, figure too big, figure too low, sphere too big, sphere too low, sphere below chest, off-center sphere, multiple spheres, empty sphere
```
**NEGATIVE (для L6):** обычный + `, dull, dim, mundane`.

**COMPOSITION LOCK — обычный (L1, L2, L3, L5):**
```
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom, nothing important there. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — always the SAME size (~20% of image height). The sphere is NEVER empty: it holds a clear glowing [SYMBOL] core. Keep a clean dark ring around the sphere. Compose everything else BELOW and around it. Keep detail out of the outer 8% margins.
```
**COMPOSITION LOCK — L4 (сфера в сердце, образ меньше и выше):**
```
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The deity is SMALL and LIFTED HIGH — it must NOT fill the frame; keep clear space in the lower third. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER lower. For THIS level the sphere is SMALL (~11% of image height) nested cleanly INSIDE the deity's chest as a glowing [SYMBOL] core, with a clean dark ring / breathing space around it inside the heart — a contained heart-core, NEVER empty, never squashed, never below the chest, never floating above the head. Keep detail out of the outer 8% margins.
```
**COMPOSITION LOCK — L6 (космическая мандала-вселенная):**
```
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame stays calm dark cosmic sky as headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER higher, never touching the top edge. Here the sphere expands into [SYMBOL] mandala-universe — the peak of the whole series, most luminous and divine — NEVER empty, and do NOT push it into the top edge. Keep a clean ring around the sphere; compose the cosmic hierarchy BELOW and around it. Keep detail out of the outer 8% margins.
```

> **ГЛАВНОЕ ПРАВИЛО — СФЕРА НИКОГДА НЕ ПУСТАЯ** и всегда на якоре ~31% сверху (не выше). В ней всегда светится узнаваемый супер-символ именно этой культуры. Меняется только *отношение* к сфере, яркость и богатство лора по уровням.

**Куда класть результат:** заменяет файл `exports/generated_cards/lens_levels/{slug}_l{N}.webp` (N = 1..6). Старые версии в git — можно откатить.

---

## 1. СЮЖЕТ ПО УРОВНЯМ (общий для всех матриц)

| Ур. | Имя | Сфера / отношение | Ищущий |
|---|---|---|---|
| 1 · Физика | Горн | Далёкая тусклая сфера-семя высоко (не выше 31%), «над головой» | Усталая душа глубоко ВНИЗУ, малая, тянется вверх |
| 2 · Пробуждение | Расплав | Сфера ярче, первые лучи вниз | Поднялся ближе, восходит, рассвет |
| 3 · Гармония | Бассейн | Сфера тёплая над ним, луч в грудь | Прямо под сферой, руки подняты, покой |
| 4 · Сияние | Призма | **Сфера в СЕРДЦЕ** (маленькая, в груди) | Божество МЕНЬШЕ и ВЫШЕ, не на весь кадр, низ свободный |
| 5 · Восход | Воронка | **Сфера = символ-ядро** тела, левитация | Восходящее божество, тело из света, лучи славы |
| 6 · Божественное | Квант | **Сфера = космическая мандала-вселенная** | Глава традиции + супер-символ, единство, пик культуры |

**Закон нарастания:** L1→L6 растут яркость, глубина, чистота, божественность и богатство лора. L1 тусклый земной; L6 ослепительный трансцендентный.
**Палитра по уровням:** L1 холодная тёмная; L2 рассветная; L3 тёплая живая; L4 многоцветная светящаяся; L5 самоцветная сияющая; L6 полный космический спектр.

---

## 2. VEDIC — супер-символ: ОМ + Шри-Янтра / тысячелепестковый лотос. Глава традиции: Вишну/Шива (Вишварупа)

> **v2 · родной путь (по каркасу):** восхождение атмана — гхат сансары → переправа через реку рождений → ашрам/ягья → раскрытие анахаты → подъём по сушумне (ОМ) → растворение в Брахмане (сахасрара).

**L1 · Физика**
```
CENTRAL IMAGE: a weary pilgrim-soul (yogin) crouched low on the dusty stone ghat steps at the river's edge in the dark before dawn, cradling an unlit clay lamp (diya), heavy with the weight of matter, longing to rise. BACKGROUND: cracked stone ghats descending into the black river of samsara, closed lotuses, faint Sri Yantra etched in shadow, cold ash of a spent yajna. EFFECTS: coarse grain, dense shadows, one thin ray finding the soul. COLOR PALETTE: cold night indigo #241a3a, slate blue #35406b, desaturated ochre #b1863a, ember red #8b2e2e on near-black.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a faint DIM golden lotus-mandala sphere-seed, distant and unreachable, NEVER empty: it holds a clear glowing Sri-Yantra/OM lotus core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L2 · Пробуждение**
```
CENTRAL IMAGE: the pilgrim crossing the river of samsara at first dawn in a slender ferry-boat, prana awakening as the current carries them onward, a lotus just beginning to open. BACKGROUND: the wide river of rebirth under breaking dawn, mist on the water, awakening Sri Yantra reflected on the surface, kindling yajna flame on the far shore. EFFECTS: first thin rays descending, soft glow, ripples of light on water. COLOR PALETTE: dawn rose #e8a07a, cool teal shadow #3a6f78, saffron #d99a2b, deep red #b13a2e, pale gold #f4e3b0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a brighter golden lotus-mandala sending its first thin rays down, NEVER empty: it holds a clear glowing Sri-Yantra/OM lotus core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L3 · Гармония**
```
CENTRAL IMAGE: a serene yogin standing in balance in a blessed ashram-garden directly beneath the sphere, hands lifted in reverence beside the steady yajna fire, dharma in perfect harmony, a warm beam touching the chest. BACKGROUND: tranquil ashram-garden of blooming lotuses, harmonious mandala, steady sacred fire, gentle bloom. EFFECTS: warm descending beam, soft light bloom. COLOR PALETTE: warm gold #d99a2b, emerald green #2f7d5b, soft rose #d98a8a, red #b13a2e, cream #f4e3b0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a warm glowing golden lotus-mandala, radiant and near, NEVER empty: it holds a clear glowing Sri-Yantra/OM lotus core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L4 · Сияние (сфера в сердце)**
```
CENTRAL IMAGE: a radiant siddha, shown SMALLER in scale (roughly hips-up, NOT filling the frame), raised HIGH into the UPPER portion of the frame so the opening anahata heart-lotus sits exactly at the sphere anchor and clear temple space remains in the lower third; the ishta-devata emerging in spectrum within the heart. COSTUME: red-and-gold royal silk, zari embroidery, sacred thread, ruby-gold ornaments. BACKGROUND: temple of gold filigree, sacred geometry, opening thousand-petal glow, translucent light filling the lower third. EFFECTS: luminous halos, radiant heart-lotus glow, spectrum refraction. COLOR PALETTE: gold #c9a84c, royal violet #6a3fa0, crimson #b13a2e, teal #2f8f95, cream #f4e3b0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The deity is SMALL and LIFTED HIGH — it must NOT fill the frame; keep clear space in the lower third. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER lower. For THIS level the sphere is SMALL (~11% of image height) nested cleanly INSIDE the deity's chest as a glowing Sri-Yantra/OM lotus core, with a clean dark ring / breathing space around it inside the heart — a contained heart-core, NEVER empty, never squashed, never below the chest, never floating above the head. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, figure fills frame, figure too big, figure too low, sphere too big, sphere too low, sphere below chest, off-center sphere, multiple spheres, empty sphere
```
**L5 · Восход (сфера-символ, левитация)**
```
CENTRAL IMAGE: an ascending luminous siddha levitating upward along the sushumna channel in glory, body woven of light, the sacred sound OM spiraling as a vortex, the loka-worlds parting in rays below. COSTUME: molten-gold light-robes, radiant ornaments. BACKGROUND: worlds of light opening as a ladder of lokas, cosmic lotus, triumphant yajna sun. EFFECTS: streaming glory rays, brilliant levitation aura, OM-vortex. COLOR PALETTE: molten gold #ffd700, magenta-rose #c0407a, turquoise #40c9d0, deep red #b13a2e, radiant cream #f4e3b0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere blazes as a living molten-gold Sri-Yantra/OM symbol-core of the being, NEVER empty. Keep a clean dark ring around the sphere. Compose everything else BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L6 · Божественное (трансцендентный пик)**
```
CENTRAL IMAGE: the supreme cosmic Vedic godhead in Vishvarupa (universal form) — serene infinite face, subtle multiple arms holding chakra, conch, lotus, flame — dissolved into blissful non-dual unity WITHIN their own sphere; deity, seeker and cosmos merged as ONE Brahman. The sacred syllable OM and a blooming thousand-petal sahasrara lotus radiate from the center. BACKGROUND: boundless mandala-cosmos, Mount Meru and spiraling galaxies of light, tiers of luminous devas and rishis bowing in the far depths, light-as-sound (Nada Brahman) rippling outward. EFFECTS: infinite radiance, cosmic bloom, golden mantra-light, halos within halos. COLOR PALETTE (full jewel spectrum): infinite gold #ffd700, cosmic violet #7b3fd0, cyan #3fd6e0, rose #e46aa0, sacred red #8b2e2e, luminous white-gold #fff6d6.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame stays calm dark cosmic sky as headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER higher, never touching the top edge. Here the sphere expands into a radiant cosmic thousand-petal lotus mandala-universe holding the OM core — the peak of the whole series, most luminous and divine — NEVER empty, and do NOT push it into the top edge. Keep a clean ring around the sphere; compose the cosmic hierarchy BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic, transcendent divine masterpiece. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom, dull, dim, mundane
```

---

## 3. EGYPTIAN — супер-символ: крылатый солнечный диск + Око Ра / анкх. Глава традиции: Ра (Амон-Ра / Ра-Атум)

> **v2 · родной путь (по каркасу MATRIX-ASCENSION-FRAMEWORK):** путешествие Ба сквозь Дуат — гробница → врата ночи (Апоп) → взвешивание сердца (Маат) → сердце-скарабей → ладья Ра (Ахет) → Ах среди нетленных звёзд.

**L1 · Физика**
```
CENTRAL IMAGE: the newly-deceased soul lying still in a stone sarcophagus at the bottom of a sealed dim tomb, wrapped in linen, heavy with the weight of matter, a faint spark of Ba not yet risen. BACKGROUND: deep tomb of black earth Kemet, canopic jars, sealed carved hieroglyphs, closed scarab, dim ankh, dust and torch-smoke. EFFECTS: coarse grain, dense shadows, one thin ray seeping through the sealed stone. COLOR PALETTE: cold night indigo #22314f, slate lapis #2b3f63, desaturated dull gold #a88b3e, dusty sandstone #b0a279 on near-black.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a faint DIM golden winged sun-disk sphere-seed, distant and unreachable, NEVER empty: it holds a clear glowing winged sun-disk / Eye of Ra core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L2 · Пробуждение**
```
CENTRAL IMAGE: the awakened Ba (a bird with a human face) setting out into the Duat, passing the first of the twelve night-gates, a lamp in the dark, hope in its flight. BACKGROUND: the river of night winding through gates of the underworld, the coiled shadow of the serpent Apophis held at bay, awakening hieroglyphs kindling gold along the walls, scarab Khepri rising. EFFECTS: first golden rays kindling along the gates, torchlight glow. COLOR PALETTE: dawn rose #e0a17f, cool teal shadow #3a6f78, lapis #2e5090, gold #c9a84c, turquoise #40e0d0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a brighter golden winged sun-disk sending its first rays down, NEVER empty: it holds a clear glowing winged sun-disk / Eye of Ra core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L3 · Гармония**
```
CENTRAL IMAGE: the soul standing in balance in the Hall of Two Truths as its heart is weighed against the feather of Maat on the great golden scales — the beam of judgment perfectly level, the peace of a heart found true. BACKGROUND: blessed calm hall of gold, Maat with outstretched feathered wings, Thoth recording, forty-two assessors softly lit, ankh of life, Nile lotus. EFFECTS: warm descending beam of justice, soft light bloom, scales in equilibrium. COLOR PALETTE: warm gold #c9a84c, nile green #2f7d5b, soft rose #d98a8a, lapis #2e5090, cream #f5f0dc.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a warm radiant golden winged sun-disk, near and blessing, NEVER empty: it holds a clear glowing winged sun-disk / Eye of Ra core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L4 · Сияние (сфера в сердце)**
```
CENTRAL IMAGE: the vindicated soul transfigured, shown SMALLER in scale (roughly hips-up, NOT filling the frame), raised HIGH into the UPPER portion of the frame so the radiant heart-scarab in its chest sits exactly at the sphere anchor and clear hall space remains in the lower third; the Ba-bird with human face alight, heart shining in spectrum. COSTUME: gold-and-lapis regalia, nemes headdress, broad usekh collar, turquoise inlay, spread feathered wings. BACKGROUND: hall of gold inlay dissolving into light, sacred geometry, radiant wings behind, translucent light in the lower third. EFFECTS: luminous halos, radiant heart-scarab glow, spectrum refraction. COLOR PALETTE: gold #ffd700, royal violet #6a3fa0, turquoise #40e0d0, lapis #2e5090, cream #f5f0dc.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The deity is SMALL and LIFTED HIGH — it must NOT fill the frame; keep clear space in the lower third. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER lower. For THIS level the sphere is SMALL (~11% of image height) nested cleanly INSIDE the deity's chest as a glowing winged sun-disk / Eye of Ra core, with a clean dark ring / breathing space around it inside the heart — a contained heart-core, NEVER empty, never squashed, never below the chest, never floating above the head. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, figure fills frame, figure too big, figure too low, sphere too big, sphere too low, sphere below chest, off-center sphere, multiple spheres, empty sphere
```
**L5 · Восход (сфера-символ, левитация)**
```
CENTRAL IMAGE: the glorified soul (Akh) ascending to join the solar barque of Ra as it crests the horizon (Akhet), levitating in glory, great feathered wings of gold spread wide, body woven of light, rays of glory below. COSTUME: molten-gold regalia, radiant nemes, solar crown. BACKGROUND: the barque of Ra sailing up over the twin-peaked horizon, the waters of night falling away below, cosmic scarab lifting the sun. EFFECTS: streaming glory rays, brilliant levitation aura, sunrise breaking. COLOR PALETTE: molten gold #ffd700, magenta-rose #c0407a, turquoise #40e0d0, lapis #2e5090, radiant white #fff6d6.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere blazes as a living molten-gold winged sun-disk / Eye of Ra symbol-core of the being, NEVER empty. Keep a clean dark ring around the sphere. Compose everything else BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L6 · Божественное (трансцендентный пик)**
```
CENTRAL IMAGE: the soul united with Ra as an eternal Akh among the imperishable stars — the supreme godhead Amun-Ra / Ra-Atum, king of all gods, dissolved into cosmic unity WITHIN their own sphere; deity, seeker and cosmos merged as one. A blazing cosmic Eye of Ra and winged sun-disk radiate from the center. BACKGROUND: boundless Duat night-cosmos crowned by dawn, the solar barque sailing spiraling star-fields, the Ennead of gods and the feather of Maat bowing in the far depths, the imperishable circumpolar stars wheeling outward. EFFECTS: infinite radiance, cosmic bloom, golden solar light, halos within halos. COLOR PALETTE (full jewel spectrum): infinite gold #ffd700, cosmic violet #7b3fd0, cyan #3fd6e0, rose #e46aa0, deep lapis #1f2f52, luminous white-gold #fff6d6.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame stays calm dark cosmic sky as headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER higher, never touching the top edge. Here the sphere expands into a radiant cosmic solar mandala-universe holding the Eye of Ra / winged sun-disk core — the peak of the whole series, most luminous and divine — NEVER empty, and do NOT push it into the top edge. Keep a clean ring around the sphere; compose the cosmic hierarchy BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic, transcendent divine masterpiece. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom, dull, dim, mundane
```

---

## 4. KABBALISTIC — супер-символ: Древо Жизни + венец Кетер / Эйн-Соф + буквы творения. Глава традиции: Эйн-Соф (Адам Кадмон)

> **v2 · родной путь (по каркасу):** подъём по Древу Жизни — Малкут (разбитые сосуды) → Йесод (луна, воды астрала) → Тиферет (сердце-солнце, баланс столбов) → призма сфирот → срединный столб через Бездну/Даат → Кетер (венец, свет Эйн-Соф).

**L1 · Физика**
```
CENTRAL IMAGE: a weary soul-spark (neshama) sunk low in Malkut, the kingdom of dense matter, kneeling among the broken vessels (shevirah) on black earth, gazing up with longing at the distant Tree. BACKGROUND: shattered clay vessels scattering dim sparks, the shadowed lowest sefirah, faint Hebrew letters etched in darkness. EFFECTS: coarse grain, dense shadows, one thin ray finding the soul. COLOR PALETTE: cold night indigo #182338, slate blue #35406b, desaturated dull gold #a5883a, muted violet #6f77a0 on near-black.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a faint DIM white-gold Ein-Sof sphere-seed, distant and unreachable, NEVER empty: it holds a clear glowing Keter / Tree-of-Life core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L2 · Пробуждение**
```
CENTRAL IMAGE: the soul risen to Yesod, the foundation, awakening at the shore of the silver astral waters beneath the moon, its reflection shimmering, first light stirring. BACKGROUND: moonlit foundation of the Tree, waters of the astral world full of reflections, kindling sefirot, glowing Hebrew letters. EFFECTS: first white-gold light rippling on the water, soft moon-glow. COLOR PALETTE: dawn rose #e0a17f, cool teal shadow #3a6f78, indigo #1d2b4a, gold #d4b14a, pale violet #8a93c2.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a brighter white-gold Ein-Sof sphere sending first light down the paths, NEVER empty: it holds a clear glowing Keter / Tree-of-Life core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L3 · Гармония**
```
CENTRAL IMAGE: a serene mystic standing in Tiferet at the heart of the Tree directly beneath the sphere, hands lifted, the two pillars of mercy and severity in perfect balance, a gentle white-gold beam descending the central pillar to the chest. BACKGROUND: balanced Tree of Life, the heart-sun of Tiferet radiant, luminous vessels of light, Hebrew letters glowing in harmony. EFFECTS: warm descending beam, soft light bloom. COLOR PALETTE: warm gold #d4b14a, emerald green #2f7d5b, soft rose #d98a8a, indigo #1d2b4a, white-gold #fff2c8.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a warm radiant Ein-Sof sphere, near and blessing, NEVER empty: it holds a clear glowing Keter / Tree-of-Life core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L4 · Сияние (сфера в сердце)**
```
CENTRAL IMAGE: a radiant Kabbalist luminary, shown SMALLER in scale (roughly hips-up, NOT filling the frame), raised HIGH into the UPPER portion of the frame so the glowing heart (Tiferet) sits exactly at the sphere anchor and clear space remains in the lower third; the coloured sefirot of the Tree flashing as a prism, refracting light in spectrum around the heart. COSTUME: white-and-gold robes of light, prayer shawl of radiance. BACKGROUND: luminous Tree of Life, sefirot-paths radiating as coloured halos, sacred geometry, translucent light in the lower third. EFFECTS: luminous halos, radiant heart-glow, spectrum refraction of the sefirot. COLOR PALETTE: gold #d4b14a, royal violet #6a3fa0, turquoise #40c9d0, indigo #1d2b4a, white-gold #fff2c8.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The deity is SMALL and LIFTED HIGH — it must NOT fill the frame; keep clear space in the lower third. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER lower. For THIS level the sphere is SMALL (~11% of image height) nested cleanly INSIDE the luminary's chest (Tiferet) as a glowing Keter / Tree-of-Life core, with a clean dark ring / breathing space around it inside the heart — a contained heart-core, NEVER empty, never squashed, never below the chest, never floating above the head. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, figure fills frame, figure too big, figure too low, sphere too big, sphere too low, sphere below chest, off-center sphere, multiple spheres, empty sphere
```
**L5 · Восход (сфера-символ, левитация)**
```
CENTRAL IMAGE: an ascending Kabbalist being levitating in glory up the central pillar, crossing the Abyss (Daat) on the lightning-flash path, body woven of light, rays of glory below. COSTUME: molten white-gold robes of light. BACKGROUND: the upper Tree beyond the Abyss, the Merkabah chariot of fire, the lightning-flash of creation, cosmic sefirot. EFFECTS: streaming glory rays, brilliant levitation aura, lightning-path. COLOR PALETTE: molten gold #ffdf8a, magenta-rose #c0407a, turquoise #40c9d0, indigo #1d2b4a, radiant white #fff6e0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere blazes as a living molten white-gold Keter / Tree-of-Life symbol-core of the being, NEVER empty. Keep a clean dark ring around the sphere. Compose everything else BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L6 · Божественное (трансцендентный пик)**
```
CENTRAL IMAGE: the supreme divine Kabbalistic godhead — Ein-Sof Or manifest as Adam Kadmon, the primordial being of light — dissolved into cosmic unity WITHIN their own sphere; seeker and cosmos merged as one. A blazing crown Keter and the full Tree of Life radiate from the center. BACKGROUND: boundless sacred cosmos of the four worlds, all ten sefirot and the twenty-two Hebrew letters of creation orbiting as constellations, luminous vessels overflowing with light. EFFECTS: infinite radiance, cosmic bloom, letters of living light, halos within halos. COLOR PALETTE (full jewel spectrum): infinite gold #ffdf8a, cosmic violet #7b3fd0, cyan #3fd6e0, rose #e46aa0, deep indigo #141f36, luminous white-gold #fff6e0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame stays calm dark cosmic sky as headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER higher, never touching the top edge. Here the sphere expands into a radiant cosmic Tree-of-Life mandala-universe holding the Keter / Ein-Sof core — the peak of the whole series, most luminous and divine — NEVER empty, and do NOT push it into the top edge. Keep a clean ring around the sphere; compose the cosmic hierarchy BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic, transcendent divine masterpiece. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom, dull, dim, mundane
```

---

## 5. SLAVIC — супер-символ: Коловрат / солнце Зори + Алатырь + Древо мира. Глава традиции: Род (Сварог / Даждьбог)

> **v2 · родной путь (по каркасу):** путь по Древу Мира — корни Нави → Калинов мост над Смородиной → Явь (поле, жатва, Лада) → подъём по стволу (берегини) → ветви к выси Перуна / Ирий → Правь (Род, Коловрат в кроне Древа).

**L1 · Физика**
```
CENTRAL IMAGE: a weary soul-wanderer in a linen shirt sunk low among the roots of the World Tree in Nav, the dark underworld, kneeling on the raw cold earth of a foggy primeval bor, a single dim ember-spark in hand. BACKGROUND: gnarled roots of the World Tree descending into misty darkness, black firs, faint embroidered rushnik patterns, dim kolovrat in shadow. EFFECTS: coarse grain, dense shadows, one thin ray finding the soul. COLOR PALETTE: cold night indigo #241f33, slate blue #35406b, desaturated red #8f3b32, dim cream #cfc7b6, dark #2c2a28 on near-black.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a faint DIM golden Zorya sun-wheel (kolovrat) sphere-seed, distant and unreachable, NEVER empty: it holds a clear glowing kolovrat sun-wheel core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L2 · Пробуждение**
```
CENTRAL IMAGE: the soul-wanderer awakening as it steps onto the Kalinov bridge over the fiery river Smorodina at first dawn, the mist parting to reveal the way across, hope rising. BACKGROUND: the arched Kalinov bridge spanning the smoking border-river, dawn through morning mist, awakening kolovrat, glowing rushnik embroidery, birches on the far bank. EFFECTS: first golden rays descending, soft glow, mist parting. COLOR PALETTE: dawn rose #e0a17f, cool teal shadow #3a6f78, red #c23b2e, cream #f2efe6, gold #d9a441.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a brighter golden Zorya sun-wheel sending its first rays down, NEVER empty: it holds a clear glowing kolovrat sun-wheel core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L3 · Гармония**
```
CENTRAL IMAGE: a serene Slavic keeper standing in Yav, a sunlit field of golden harvest directly beneath the sphere, hands lifted in harmony with the living land, Lada's blessing of peace, a warm golden beam to the chest. BACKGROUND: blessed sunlit field of wheat and cornflowers, sacred grove beyond, kolovrat, embroidered rushnik, gentle bloom. EFFECTS: warm descending beam, soft light bloom. COLOR PALETTE: warm gold #d9a441, meadow green #2f7d5b, soft rose #d98a8a, red #c23b2e, white #f2efe6.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere is a warm radiant golden Zorya sun-wheel, near and blessing, NEVER empty: it holds a clear glowing kolovrat sun-wheel core. Keep a clean dark ring around the sphere. Compose everything else BELOW it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L4 · Сияние (сфера в сердце)**
```
CENTRAL IMAGE: a radiant Slavic solar luminary rising up the trunk of the World Tree, shown SMALLER in scale (roughly hips-up, NOT filling the frame), raised HIGH into the UPPER portion of the frame so the glowing heart-center sits exactly at the sphere anchor and clear space remains in the lower third; bright bereginya light-spirits circling in spectrum. COSTUME: red-and-white embroidered ritual robes, gold solar ornaments, protective rushnik patterns. BACKGROUND: the shining trunk and branches of the World Tree, glowing protective embroidery radiating as halos, luminous bereginya spirits, translucent light in the lower third. EFFECTS: luminous halos, radiant heart-glow, spectrum shimmer of spirits. COLOR PALETTE: gold #d9a441, royal violet #6a3fa0, turquoise #40c9d0, red #c23b2e, cream #f2efe6.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The deity is SMALL and LIFTED HIGH — it must NOT fill the frame; keep clear space in the lower third. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER lower. For THIS level the sphere is SMALL (~11% of image height) nested cleanly INSIDE the luminary's chest as a glowing kolovrat sun-wheel core, with a clean dark ring / breathing space around it inside the heart — a contained heart-core, NEVER empty, never squashed, never below the chest, never floating above the head. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, figure fills frame, figure too big, figure too low, sphere too big, sphere too low, sphere below chest, off-center sphere, multiple spheres, empty sphere
```
**L5 · Восход (сфера-символ, левитация)**
```
CENTRAL IMAGE: an ascending Slavic solar deity (Dazhbog) levitating up the branches of the World Tree toward the heights of Perun and the garden of Iriy, body woven of light and embroidery, rays of glory below. COSTUME: molten-gold solar robes, radiant rushnik of light. BACKGROUND: the upper branches of the World Tree opening to the sky, sacred grove aflame with dawn, cosmic kolovrat, the falcon Rarog in flight. EFFECTS: streaming glory rays, brilliant levitation aura. COLOR PALETTE: molten gold #f0b84a, magenta-rose #c0407a, turquoise #40c9d0, red #c23b2e, radiant white #fff6e0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame is EMPTY calm dark sky — headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, hanging JUST BELOW that empty band with its CENTER at ~31% from the top — NEVER higher, never touching the top edge — same size (~20% of image height). Here the sphere blazes as a living molten-gold kolovrat sun-wheel symbol-core of the being, NEVER empty. Keep a clean dark ring around the sphere. Compose everything else BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom
```
**L6 · Божественное (трансцендентный пик)**
```
CENTRAL IMAGE: the supreme Slavic all-father god Rod (source of Svarog and Dazhbog), progenitor of all, dissolved into cosmic unity WITHIN their own sphere of eternal dawn; deity, seeker and cosmos merged as one. A blazing cosmic Kolovrat and the sacred Alatyr stone radiate from the center. BACKGROUND: boundless sacred cosmos, the World Tree (Древо мира) spanning heaven and earth, embroidery-constellations and rushnik patterns orbiting as galaxies, Svarga heaven rippling outward. EFFECTS: infinite radiance, cosmic bloom, golden solar light, halos within halos. COLOR PALETTE (full jewel spectrum): infinite gold #f0b84a, cosmic violet #7b3fd0, cyan #3fd6e0, rose #e46aa0, deep red #8f2f28, luminous white-gold #fff6e0.
COMPOSITION LOCK (obey strictly): vertical portrait 2:3 (1024x1536). The top ~28% of the frame stays calm dark cosmic sky as headroom. ONE sacred sphere is the fixed anchor: horizontally centered at 50% width, its CENTER at ~31% from the top — NEVER higher, never touching the top edge. Here the sphere expands into a radiant cosmic kolovrat sun-mandala-universe holding the Kolovrat / Alatyr core — the peak of the whole series, most luminous and divine — NEVER empty, and do NOT push it into the top edge. Keep a clean ring around the sphere; compose the cosmic hierarchy BELOW and around it. Keep detail out of the outer 8% margins.
STYLE: High-end digital painting, cinematic volumetric lighting, premium sacred collectible art, hyperdetailed, 8K, expensive luxury aesthetic, transcendent divine masterpiece. --ar 2:3
NEGATIVE: text, letters, watermark, signature, frame, border, ui, blurry, deformed, bad anatomy, cartoon, flat, cropped subject, off-center sphere, multiple spheres, sphere too high, sphere near top edge, no headroom, dull, dim, mundane
```

---

## 6. КАК ТЕСТИРОВАТЬ (пилот)

1. Прогони через Виктора одну матрицу целиком (6 уровней), формат 2:3.
2. Положи файлы в `exports/generated_cards/lens_levels/` с точными именами: `{slug}_l1.webp … {slug}_l6.webp` (заменяя старые).
3. Открой `localhost:5173/tigel-app.html`, Ctrl+Shift+R, зайди в матрицу, пролистай уровни 1→6.
4. Проверь: сфера везде на якоре ~31% (не выше, не залезает в верх)? L4 — образ меньше и выше, сфера-ядро в сердце? L6 — трансцендентный пик с главой традиции и супер-символом? нарастание яркости и лора L1→L6 есть?
5. Если ок — сравни 4 матрицы, выбери эталон стиля. Потом раскатка на все 33 (глава традиции + супер-символ у каждой культуры свои).

> Пульт (⚙) остаётся для редких мелких правок, но при правильной генерации почти не нужен.
