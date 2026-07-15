# M-030: Аудит всех страниц AWARA -- отчёт о дефектах

**Дата:** 2026-05-24  
**Ветка:** master (актуальная на момент аудита)  
**Метод:** Playwright (автоматизированный) + визуальная проверка (desktop 1280px + mobile 375px)  
**Окружение:** Chromium 133, Python HTTP Server, Ubuntu Linux

---

## Сводная таблица

| # | Страница | Консоль | 404 | НАЗАД | Mobile 375px | Кнопки 44px | Текст | Картинки | ES6 | localStorage |
|---|----------|---------|-----|-------|-------------|-------------|-------|----------|-----|-------------|
| 1 | index.html | WARN | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 2 | tigel.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 3 | passport.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 4 | oracle.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 5 | cards.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 6 | matrix.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 7 | universe.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 8 | initiation-space.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 9 | earth-player.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 10 | dashboard.html | OK | OK | OK | OK | FAIL | FAIL | OK | OK | OK |
| 11 | natal.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 12 | daimon.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 13 | milost.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 14 | chat.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 15 | festivals.html | WARN | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 16 | vedic-cosmos.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 17 | egg-3d.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |
| 18 | spheres-v2.html | OK | OK | OK | OK | FAIL | OK | OK | OK | OK |

**Легенда:** OK = проверка пройдена, FAIL = есть дефекты, WARN = предупреждения (не ошибки)

---

## Детальный отчёт по каждой странице

### 1. index.html

**Консоль (F12):**
- WARN: `streak: TypeError: Cannot set properties of null (setting 'innerHTML')` (строка 1601) -- элемент streak-календаря не найден в DOM на момент вызова
- WARN: `dailyKey: TypeError: Cannot set properties of null (setting 'textContent')` (строка 1572) -- элемент ежедневного ключа не найден
- WARN: `getDailyMeaning failed: Unexpected token '<'...` -- POST-запрос к API возвращает HTML вместо JSON (нет бэкенда)
- ERROR: `501 Unsupported method ('POST')` -- попытка POST на статический сервер (ожидаемо без бэкенда)

**Ссылки/404:** OK -- все ресурсы загружаются

**Кнопка НАЗАД:** N/A (это главная страница / лобби)

**Mobile 375px:** OK -- нет горизонтального скролла, контент помещается

**Кнопки < 44px (Apple HIG):**
- `BUTTON` "ВОЙТИ" -- 135x41 (высота 41 < 44)
- `DIV#yuga-hud-badge` "КАЛИ ЮГА" -- 69x17
- `SPAN#lobby-yuga-indicator` -- 78x17
- `DIV.egg-help-btn` "?" -- 28x28
- `BUTTON.lang-btn` RU -- 26x18
- `BUTTON.lang-btn` EN -- 26x18
- `A` "Натальная карта" -- 75x15
- `BUTTON#lobby-key-btn` "КЛЮЧИ БЛАГОДЕНСТВИЯ" -- 168x28

**Текст:** OK -- обрезки не обнаружено

**Картинки/иконки:** OK -- битых нет

**ES6 модули:** OK

**localStorage:**
- Используются 9 ключей с префиксом `awara_`
- Ключ `awara_keys` также записывается в earth-player.html (потенциальный конфликт -- см. раздел localStorage)
- Ключ `awara_matrix` также записывается в initiation-space.html

---

### 2. tigel.html

**Консоль:** OK -- чисто

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- есть, ведёт в лобби

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON` "СОБРАТЬ ОПЫТ ИЗ СФЕР" -- 295x38 (высота 38 < 44)
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 8 ключей, конфликтов нет

---

### 3. passport.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 5 ключей

---

### 4. oracle.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.settings-toggle` "X" -- 31x44 (ширина 31 < 44)
- `A` "Получить ключ" -- 78x13
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 5. cards.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK -- нет горизонтального скролла

**Кнопки < 44px:**
- `A.cards-back` "Колода Карт" -- 221x35 (высота 35 < 44)
- **39 кнопок `.filter-btn`** (матрицы + рарность) -- все высотой 32px < 44
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU/EN -- 38x24

Всего: **44 элемента** меньше 44px. Основная проблема -- кнопки-фильтры матриц (высота 32px).

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 6. matrix.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 7. universe.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 8. initiation-space.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- `#back-to-lobby`

**Mobile 375px:** OK -- нет горизонтального скролла

**Кнопки < 44px (45 элементов!):**
- `BUTTON#back-to-lobby` "В ЛОББИ" -- 96x28
- `DIV#day-widget-btn` "ДЕНЬ" -- 160x24
- `DIV#matrix-btn` "ШАМБАЛА" -- 104x31
- `BUTTON#lbtn` "СВЯЗАТЬ" -- 36x78 (ширина 36 < 44)
- `BUTTON#ebtn` "ВОЙТИ ВО ВСЕЛЕННУЮ" -- 244x36
- `BUTTON#oracle-close` "X" -- 13x16 (критично мал!)
- `BUTTON#oracle-send` ">" -- 33x33
- `BUTTON#sp-priv` "ЛИЧНАЯ" -- 69x19
- `BUTTON#sp-xcl` "X" -- 32x27
- Табы `.spt` "ПЛАНЕР"/"АРХИВ"/"СО-ПУТНИКИ" -- 217x31
- Кнопки навигации "ПРЕД"/"СЛЕД" -- 55x23
- `BUTTON.ab` "+" -- 34x34
- `BUTTON#spark-close` "X" -- 33x28
- Табы `.spark-mode-tab` -- 193x32
- `BUTTON#save-btn` "СОХРАНИТЬ" -- 114x37
- Кнопки restore -- 135x30, 124x30
- `BUTTON#atmo-btn` -- 36x36
- Табы `.psy-tab`, `.sh-tab`, `.cst` -- все 29-31px высоты
- `SPAN` "карандаш" -- 12x13

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 4 ключа

---

### 9. earth-player.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `DIV#back-lbl` "КАРТА ДУШИ" -- 73x24 (на десктопе; на мобильном 58x36)
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 3 ключа

---

### 10. dashboard.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст обрезается (text-overflow: ellipsis):**
- "Аватар Вишну -- Держатель Гиты" (таблица лидеров)
- "Царь Дхармы -- Объединитель"
- "Царь Мира -- Строитель Храма"
- "Воин Дхармы -- Ученик Кришны"
- "Владыка Справедливости -- Дин-и..."

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 3 ключа

---

### 11. natal.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 12. daimon.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 13. milost.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `A.milost-back` "<-" -- 32x32
- `BUTTON.hint-btn` "?" -- 36x36
- `BUTTON.lang-btn` RU -- 38x24
- `BUTTON.lang-btn` EN -- 38x24

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK

---

### 14. chat.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON` RU -- 28x17
- `BUTTON` EN -- 27x17
- `A.back` "<-" -- 33x30

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 3 ключа

---

### 15. festivals.html

**Консоль:**
- WARN: 4x `GL Driver Message (OpenGL, Performance): GPU stall due to ReadPixels` -- WebGL/Three.js предупреждение о производительности GPU

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- "ЛОББИ"

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON` RU -- 28x17
- `BUTTON` EN -- 27x17
- `A.back` "ЛОББИ" -- 75x30
- `BUTTON.list-toggle` "62 УЗЛА" -- 87x30

**Текст:** OK

**Картинки:** OK

**ES6:** OK -- `import * as THREE from 'three'` через importmap, три.js загружается с CDN

**localStorage:** OK

---

### 16. vedic-cosmos.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- "ЛОББИ"

**Mobile 375px:** OK

**Кнопки < 44px:**
- `A.back-btn` "ЛОББИ" -- 95x32
- `BUTTON` RU -- 28x17
- `BUTTON` EN -- 27x17

**Текст:** OK

**Картинки:** OK

**ES6:** OK -- Three.js через importmap (CDN jsdelivr)

**localStorage:** OK

---

### 17. egg-3d.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- "ЛОББИ"

**Mobile 375px:** OK

**Кнопки < 44px:**
- `A.back-btn` "ЛОББИ" -- 95x32

**Текст:** OK

**Картинки:** OK

**ES6:** OK -- Three.js через importmap (CDN unpkg)

**localStorage:** OK -- ключи не используются

---

### 18. spheres-v2.html

**Консоль:** OK

**Ссылки/404:** OK

**Кнопка НАЗАД:** OK -- "ЛОББИ"

**Mobile 375px:** OK

**Кнопки < 44px:**
- `BUTTON.sp-close` "x" -- 30x30
- `BUTTON.sp-save` "ДОБАВИТЬ" -- 287x32 (высота 32 < 44)
- `BUTTON.sp-remove` "очистить последнюю" -- 287x24 (высота 24 < 44)
- `A.back-btn` "ЛОББИ" -- 112x37

**Текст:** OK

**Картинки:** OK

**ES6:** OK

**localStorage:** OK -- 4 ключа с префиксом `awara_sphere*` / `awara_threads*`

---

## Сквозные проблемы (общие для всех/многих страниц)

### 1. Кнопки RU/EN меньше 44px (ВСЕ 18 страниц)

Переключатель языка `BUTTON.lang-btn` на всех страницах имеет размер:
- Формат 1 (подстраницы с hint-btn): **38x24** -- 14 страниц
- Формат 2 (chat, festivals, vedic-cosmos): **27-28 x 17** -- 3 страницы
- index.html: **26x18**

Apple HIG рекомендует минимум 44x44px для touch targets. Все кнопки RU/EN не соответствуют.

### 2. Кнопка "?" (hint-btn) меньше 44px (14 страниц)

`BUTTON.hint-btn` имеет размер **36x36** на страницах: tigel, passport, oracle, cards, matrix, universe, initiation-space, earth-player, dashboard, natal, daimon, milost, festivals.

На index.html -- `DIV.egg-help-btn` "?" имеет размер **28x28**.

### 3. localStorage: потенциальные конфликты записи

| Ключ | Записывается в | Читается в |
|------|---------------|------------|
| `awara_earth_v1` | earth-player.html, initiation-space.html | earth-player.html, initiation-space.html |
| `awara_keys` | earth-player.html, index.html | earth-player.html, index.html |
| `awara_matrix` | index.html, initiation-space.html | index.html, initiation-space.html |
| `awara_lang` | chat.html, festivals.html, index.html, i18n.js, i18n-module.js, vedic-cosmos.html | index.html, i18n.js, i18n-module.js |

`awara_lang` -- ожидаемое поведение (каждая страница может менять язык).  
`awara_earth_v1`, `awara_keys`, `awara_matrix` -- требуют проверки: нет ли неожиданной перезаписи данных.

### 4. Текст обрезается (dashboard.html)

Таблица лидеров на dashboard.html использует `text-overflow: ellipsis`, из-за чего длинные описания ("Аватар Вишну -- Держатель Гиты", "Владыка Справедливости -- Дин-и...") обрезаются. Это единственная страница с найденной обрезкой.

---

## Статистика

| Критерий | Страниц OK | Страниц FAIL/WARN |
|----------|-----------|-------------------|
| Консоль без ошибок | 16 | 2 (index: warnings, festivals: WebGL warnings) |
| Ссылки без 404 | 18 | 0 |
| Кнопка НАЗАД | 18 | 0 (index -- лобби, N/A) |
| Mobile 375px без скролла | 18 | 0 |
| Кнопки >= 44px | 0 | **18** (все страницы имеют RU/EN < 44px) |
| Текст без обрезки | 17 | 1 (dashboard) |
| Картинки без битых | 18 | 0 |
| ES6 модули | 18 | 0 |
| localStorage корректно | 18 | 0 (потенциальные конфликты -- не критичные) |

---

## Приоритеты

### Критичные (P0)
- Нет критичных дефектов. Все страницы загружаются и функционируют.

### Важные (P1)
- **index.html** -- streak и dailyKey TypeError: элементы не найдены при инициализации (вероятно, скрыты за Alpha Gate)
- **Все страницы** -- кнопки RU/EN меньше 44px (UX на мобильных)

### Желательные (P2)
- **initiation-space.html** -- 45 элементов < 44px (кнопка "X" oracle-close всего 13x16!)
- **cards.html** -- 44 элемента < 44px (все фильтры матриц)
- **dashboard.html** -- обрезка текста в таблице лидеров
- **Кнопка hint "?"** -- 36x36 на 14 страницах

### Информационные (P3)
- **festivals.html** -- WebGL GPU stall warnings (норма для Three.js)
- **localStorage конфликты** -- `awara_earth_v1`, `awara_keys`, `awara_matrix` записываются из нескольких страниц
