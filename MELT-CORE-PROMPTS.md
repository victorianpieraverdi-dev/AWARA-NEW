# AWARA · Тигель — Промты плавки (Сердце + 6 уровней)

Цель: сгенерировать **6 отдельных анимаций/гифок** плавления (по уровням) + **образ «Сердца Истока»**. Движок `awara-melt-core.js` (v1) уже работает каркасом-плеером: когда ассеты готовы — кладём их в `exports/melt/` и подключаем вместо canvas-сцен по уровням.

---

## Общие правила генерации (для всех)

- **Формат:** квадрат 1:1 (1024×1024 или 1080×1080). Если нужен вертикальный портал — 9:16 (1080×1920).
- **Длительность:** 3–4 сек, **бесшовный луп** (seamless loop) — конец перетекает в начало.
- **Композиция:** статичная камера, всё центрировано, движение к центру → вспышка → расхождение. Должно красиво вставать в круглый орб / портал.
- **Фон:** глубокий чёрный или прозрачный (alpha), без рамок и текста.
- **Сквозной стиль:** алхимия + космос, тёмная база, светящееся ядро в центре, кинематографичный объёмный свет, частицы.
- **Дуга действия (одинаковая для всех 6):** `0–35%` материя/опыт стягивается к центру → `35–65%` трансформация (тут уникальный визуал уровня) → `65–100%` рождение капли света + расхождение/затухание.
- **Генераторы:** Kling / Runway Gen-3 / Luma Dream Machine / Sora / Pika / AnimateDiff. Промты на английском (так стабильнее), концепт продублирован по-русски.
- **Куда класть:** `C:\AWARA\exports\melt\level_1.webm … level_6.webm` + `heart.webm` (webm с alpha идеально; gif/mp4 тоже ок).
- **Прогрессия мощности (канон «Win98 → квантовый ПК»):** L1 грубо/искристо/тускло → L6 идеально/голографично/ослепительно. Сложность, разрешение света и «чистота» нарастают с уровнем.

---

## ❤️ СЕРДЦЕ — образ Истока / универсальное ядро

**Концепт (RU):** Живое сердце-Тигель — центр всей игры. Светящаяся капля-ядро из расплавленного золота и звёздного света, дышит как сердце, внутри прокручивается вся вселенная (33 матрицы как тонкие орбиты). Из него рождается путь.

### Вариант A — «Алхимическое сердце-звезда»
```
A living alchemical heart-core floating in deep cosmic void, a molten orb of liquid gold and starlight slowly pulsing like a heartbeat, thin luminous orbital rings rotating around it, sacred geometry faintly glowing inside, soft volumetric god-rays, golden and violet palette, cinematic, hyper-detailed, dark background, centered composition, seamless loop, 4s
```
**Negative:** `text, watermark, frame, border, human face, logo, low quality, flicker`
**Motion:** медленный «вдох-выдох» (scale 1.0→1.06), кольца вращаются в разные стороны, частицы плывут к ядру и обратно.

### Вариант B — «Око Истока»
```
The Source eye: a radiant golden-white core opening like an iris in the cosmos, concentric mandala rings unfolding, particles of light spiraling inward then blooming outward, deep indigo and gold nebula, ethereal, sacred, cinematic volumetric light, centered, dark void, seamless loop
```
**Negative:** `text, ui, realistic human eye, gore, low detail`
**Motion:** ирис раскрывается на 50%, затем мягко закрывается → бесшовный луп.

### Вариант C — «Семя мира»
```
A seed of light suspended in darkness, golden filaments weaving a small glowing sphere, tiny galaxies orbiting, threads of 33 luminous lines converging into the center, warm gold core with violet edges, minimalist cosmic alchemy, cinematic, centered, seamless loop
```
**Negative:** `text, busy background, clutter, harsh edges`
**Motion:** нити медленно затягиваются к ядру, лёгкое мерцание галактик.

> Из 3 вариантов выбери базовый — он станет «лицом» и Истока, и кнопки Тигля.

---

## Уровень 1 — Физика · «Горн»
**RU:** Грубая первородная плавка. Кузнечный горн: тёмные угли, рыжее пламя, искры летят вверх, дым. Тускло, сыро, по-земному. (Win98-уровень)
```
A primitive blacksmith forge in darkness, raw glowing embers and crude orange-red flames, sparks flying upward, drifting smoke, a dull molten blob slowly forming at the center, gritty, low-tech, earthy, heavy shadows, ember particles, cinematic, centered, dark background, seamless loop, 3s
```
**Negative:** `clean, futuristic, neon, holographic, text, watermark`
**Палитра:** #ff3b1e #ff7a1e #ffb14e на #1a0a06 → #070302
**Motion:** хаотичные искры вверх, мерцание углей, неровный пульс ядра.
**Аудио (≈48 BPM):** низкий гул горна, треск углей, удары молота вдалеке.

## Уровень 2 — Пробуждение · «Расплав»
**RU:** Металл плавится в золото. Появляется первая структура: потёки жидкого золота и бронзы стекают и собираются в каплю.
```
Molten metal transforming into liquid gold, glowing bronze and gold streams dripping and merging into a bright droplet at the center, first signs of order emerging, warm metallic reflections, alchemical crucible, cinematic, centered, dark background, seamless loop, 3s
```
**Negative:** `chaotic fire, holographic, neon, text, watermark`
**Палитра:** #ffd27a #e3a93c #fff0c2 на #1d1205 → #080502
**Motion:** золото стекает струйками к центру, поверхность капли блестит и колышется.
**Аудио (≈52 BPM):** льющийся металл, мягкие колокольные обертоны.

## Уровень 3 — Гармония · «Световой бассейн»
**RU:** Спокойствие и баланс. Мягкий световой бассейн, концентрические мандала-кольца, фиолет переходит в золото. Рай-на-земле (Мера 3).
```
A calm pool of living light, soft concentric mandala rings rippling outward, violet shifting into gold, gentle floating luminous particles, serene sacred harmony, warm white core, dreamy volumetric glow, cinematic, centered, dark background, seamless loop, 4s
```
**Negative:** `harsh, fire, chaotic, neon glitch, text, watermark`
**Палитра:** #c8b6ff #ffd27a #9d86e0 на #160f2b → #070512
**Motion:** кольца плавно расходятся, частицы дрейфуют, дыхание ядра ровное.
**Аудио (≈56 BPM):** хрустальные тоны, мягкие пэды, поющая чаша.

## Уровень 4 — Сияние · «Призма»
**RU:** Свет дробится и кристаллизуется. Вращающиеся призматические лучи, грани кристаллов ловят свет, спектр.
```
Light refracting through a rotating crystal prism, radiant beams fanning out in spectral colors, crystalline shards catching and scattering light, a brilliant white-gold core, prismatic rainbow edges, elegant, luminous, cinematic, centered, dark background, seamless loop, 4s
```
**Negative:** `dull, muddy, fire, smoke, text, watermark`
**Палитра:** #7ad0ff #ffffff #ffd27a на #101830 → #05060f
**Motion:** лучи медленно вращаются, грани вспыхивают по очереди, ядро пульсирует ярко.
**Аудио (≈60 BPM):** звенящие кристаллы, восходящие арпеджио, светлый эфир.

## Уровень 5 — Восход · «Звёздная воронка»
**RU:** Космический подъём. Звёздный вихрь-воронка затягивает день и пересобирает его, на горизонте — рассвет.
```
A cosmic star vortex spiraling inward, streams of stars and stardust swirling into a luminous funnel, a sunrise glow blooming at the center, galaxies forming, epic ascension, deep blue-violet with warm sunrise core, cinematic volumetric light, centered, dark background, seamless loop, 4s
```
**Negative:** `flat, static, fire forge, text, watermark, low detail`
**Палитра:** #9d86e0 #ffd27a #ff9ec7 / ядро #ffe6b0 на #0b0a2a → #040312
**Motion:** спиральные рукава вращаются и затягиваются, рассветное ядро разгорается → расхождение.
**Аудио (≈64 BPM):** нарастающий космический свелл, хор-пэд, дыхание ветра.

## Уровень 6 — Божественное · «Квантовый тигель»
**RU:** Идеал. Голографическая сетка-решётка, квантовые частицы, лёгкие глитч-вспышки, в финале — сверхновая. Максимальная чистота и мощь. (квантовый ПК)
```
A quantum crucible: a glowing holographic lattice grid in deep space, quantum particles blinking and entangling, subtle data-glitch flashes, sacred geometry sigil assembling from light, everything collapsing into a blinding supernova core then radiating outward, divine, hyper-clean, futuristic-sacred, iridescent white with cyan-violet-gold, cinematic, centered, dark background, seamless loop, 4s
```
**Negative:** `dirty, smoky, primitive, low-res, dull, text, watermark`
**Палитра:** #7ad0ff #ffffff #b06bff #ffd27a / ядро #ffffff на #03101a → #000308
**Motion:** сетка пульсирует, частицы мерцают, глитч-полосы, финальная сверхновая-вспышка → бесшовный возврат.
**Аудио (≈70 BPM):** кристально-цифровой звон, суб-бас, ангельский хор, квантовые «блики».

---

## Как подключить готовые ассеты к движку (на будущее)

Когда гифки/видео готовы:
1. Положить в `C:\AWARA\exports\melt\level_{1..6}.webm` (+ `heart.webm`).
2. В `awara-melt-core.js` добавить режим `asset`: вместо canvas-сцены показывать `<video autoplay muted playsinline>` (или `<img>` для gif) по `LV[n].asset`, оставив canvas как фолбэк.
3. Кнопки 1–6 (превью) и кнопка «Плавить» уже вызывают `AwaraMeltCore.play({level})` — менять их не нужно.

> Заметка по стилю: чтобы 6 уровней читались как одна эволюция, генерируй их одной серией (один сид/один базовый промт-стиль), меняя только блок трансформации. Тогда переход L1→L6 будет ощущаться как апгрейд одной системы, а не 6 случайных клипов.
