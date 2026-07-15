"""Generate AWARA Тигель roadmap PDF — dark-themed report."""
from weasyprint import HTML, default_url_fetcher

def fetcher(url, t=15):
    try: return default_url_fetcher(url, timeout=t)
    except Exception: return {'string': b'', 'mime_type': 'image/jpeg'}

html = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

@page {
  size: A4;
  margin: 20mm;
}

:root {
  --bg: #0E0C15;
  --surface: #16131F;
  --card: #1A1726;
  --ink: #E8E4F0;
  --dim: rgba(232,228,240,0.55);
  --faint: rgba(232,228,240,0.30);
  --gold: #C9A84C;
  --violet: #7B62C9;
  --line: rgba(232,228,240,0.10);
}

html, body {
  margin: 0; padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  color: var(--ink);
  background: var(--bg);
  font-size: 10.5pt;
  line-height: 1.55;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

/* ── Cover ── */
.cover {
  page-break-after: always;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10mm;
}
.cover .eyebrow {
  font-size: 9pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 24px;
}
.cover h1 {
  font-size: 42pt;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 18px 0;
  color: var(--ink);
}
.cover .sub {
  font-size: 14pt;
  color: var(--dim);
  margin: 0 0 40px 0;
  max-width: 480px;
}
.cover .meta {
  font-size: 9pt;
  color: var(--faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* ── Section headers ── */
h2 {
  font-size: 18pt;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 32px 0 6px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--gold);
  break-after: avoid;
}
h2 .num {
  color: var(--gold);
  margin-right: 8px;
}

h3 {
  font-size: 12pt;
  font-weight: 600;
  color: var(--gold);
  margin: 20px 0 6px 0;
  break-after: avoid;
}

/* ── Body ── */
p { margin: 6px 0; orphans: 3; widows: 3; }

ul {
  margin: 6px 0 12px 0;
  padding-left: 20px;
}
li {
  margin-bottom: 4px;
}
li::marker { color: var(--gold); }

/* ── Cards ── */
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-left: 3px solid var(--violet);
  padding: 14px 18px;
  margin: 10px 0;
  break-inside: avoid;
}
.card .label {
  font-size: 9pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}
.card p { margin: 3px 0; }

/* ── Status table ── */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 10pt;
  break-inside: avoid;
}
th {
  font-size: 8.5pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
  font-weight: 500;
}
td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
tr:last-child td { border-bottom: none; }
.tag {
  display: inline-block;
  font-size: 8pt;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  margin-right: 4px;
}
.tag-mvp { background: rgba(123,98,201,0.25); color: #B3A0E8; }
.tag-v2 { background: rgba(201,168,76,0.20); color: var(--gold); }
.tag-v3 { background: rgba(232,228,240,0.08); color: var(--dim); }

.done { color: #6BC96B; }
.priority { color: var(--gold); }

.page-break { page-break-after: always; }
</style>
</head>
<body>

<!-- ════════ COVER ════════ -->
<div class="cover">
  <div class="eyebrow">AWARA · Тигель · Дорожная карта</div>
  <h1>Roadmap<br>Тигель v3</h1>
  <p class="sub">Структурированный план развития игры — все идеи, системы, и направления в одном документе</p>
  <div class="meta">09 июля 2026 · Pavel + Viktor</div>
</div>

<!-- ════════ CONTENTS ════════ -->

<h2><span class="num">01</span> Намерение · Ритуал · Мечта</h2>

<div class="card">
  <div class="label">Концепция</div>
  <p>Дать игроку инструменты осознанного целеполагания — план-схема, майнд-мап. Наполняй энергией и силой, а Игра поможет реализовать.</p>
</div>

<ul>
  <li><b>Майнд-мап намерений</b> — визуальная карта целей и мечт, связанная с энергиями Тигеля</li>
  <li><b>Ритуальный фреймворк</b> — шаблоны ритуалов (утренний, вечерний, сезонный), привязанные к чакрам и мерам</li>
  <li><b>Мечта как навигатор</b> — мечта влияет на подбор квестов, линз, советов Даймона</li>
</ul>

<h2><span class="num">02</span> Интерактив и кастомизация</h2>

<h3>Перетаскивание панелей</h3>
<ul>
  <li>Drag-and-drop панелей — игрок сам выстраивает экраны</li>
  <li>Смена мест секций, возможность скрывать/добавлять блоки</li>
</ul>

<h3>Стили и режим творца</h3>
<ul>
  <li>Выбор и создание собственного стиля — фон, панельки, музыка, стиль текста</li>
  <li><b>Режим Творца / Создателя / Духа</b> — расширенный дизайн-режим для продвинутых игроков</li>
  <li>Градуальный доступ: сначала немного, потом больше (по уровню / частицам света)</li>
  <li>Особые награды за творчество и общение</li>
</ul>

<h3>Реструктуризация панелей</h3>
<ul>
  <li>Адаптивный лейаут — реструктуризация под контент и уровень игрока</li>
  <li>Усложнение дизайна сфер по уровням</li>
  <li>Добавить 7-й уровень — <b>Дух</b> с уникальными способностями</li>
</ul>

<h2><span class="num">03</span> Путешествие во времени</h2>

<div class="card">
  <div class="label">Машина времени</div>
  <p>Возможность ходить в прошлое (перепросмотр) и будущее (прогнозирование). Связь древностей, Тигеля и настоящего через фильмы, песни, образы, подсказки.</p>
</div>

<ul>
  <li><b>Перепросмотр</b> — возврат к прошлым дням, анализ паттернов</li>
  <li><b>Прогнозирование</b> — проекция энергий, вероятные события</li>
  <li><b>Культурные связи</b> — привязка к фильмам, песням, образам эпох</li>
</ul>

<h2><span class="num">04</span> Команды и Дома</h2>

<ul>
  <li><b>Дома</b> — игроки объединяются в команды-Дома</li>
  <li>Постройте лучшую команду — совместные квесты, общие ресурсы</li>
  <li>Общий чат в Тигеле — коммуникация между игроками</li>
  <li>Поселенные пузыри — пространства для команд</li>
</ul>

<div class="page-break"></div>

<h2><span class="num">05</span> Светообмен и экономика</h2>

<div class="card">
  <div class="label">Экосистема обмена</div>
  <p>Доступ за актив — за частицы света. Внутренние продукты и внешний обмен.</p>
</div>

<ul>
  <li><b>Биржа</b> — обмен ресурсами, артефактами, энергиями между игроками</li>
  <li><b>Доска объявлений</b> — поиск единомышленников</li>
  <li><b>Сайт игры</b> — витрина + портал входа</li>
  <li>Внутренняя валюта — частицы света как универсальная единица</li>
</ul>

<h2><span class="num">06</span> 3D-моделирование и трансформация</h2>

<div class="card">
  <div class="label">Артефакты ↔ Энергии</div>
  <p>Предметы из жизни (чайная доска, кристалл) превращаются в силы Даймона через <b>Трансформатор</b> и <b>Интроприатор</b>. И наоборот — из фантазии в 3D-измерение.</p>
</div>

<ul>
  <li>Цели/мечты из профиля → силы и энергии Даймона + пути переноса в явь</li>
  <li>Действия 3 уровня: он стойкий → даёт практику → игрок создаёт предмет → светообмен</li>
  <li>3D-визуализация артефактов, тотемов, мест силы</li>
</ul>

<h2><span class="num">07</span> Даймон — глубинная система</h2>

<h3>Сущность Даймона</h3>
<ul>
  <li>Внутренний ребёнок в темнице подсознания</li>
  <li>Йога связи с ним — взаимопонимание в «здесь и сейчас»</li>
  <li>Он же Бог в будущем — разговор с собой</li>
  <li>Основа: разумность, понимание поступков человека, интеграция, мимикрия</li>
  <li>Даймон как искра — внутренний ответ</li>
</ul>

<h3>Функции Даймона</h3>
<ul>
  <li>До 10 советов от Даймона — понимание друг друга</li>
  <li>Характер Даймона — доп. списки по желанию игрока</li>
  <li>Мир / Вселенная Даймонов</li>
  <li>Царства: минералы, растения и прочее (TBD)</li>
</ul>

<h2><span class="num">08</span> Профиль и данные игрока</h2>

<ul>
  <li>Выбор: давать инфо по датам и имени или нет</li>
  <li>Расширенный профиль — доп. списки, интересы</li>
  <li>Типы питания, путь эволюции, высокие/низкие вибрации, образование</li>
  <li>Определение линз игрока через вложенные данные + частицы</li>
  <li>Подбор линз под энергии дня или случайно (усиление)</li>
  <li>Генные Ключи как грани — возможно ещё грани</li>
</ul>

<div class="page-break"></div>

<h2><span class="num">09</span> Карта сознания</h2>

<div class="card">
  <div class="label">Внутреннее + Внешнее</div>
  <p>Маркеры: внутри тело, снаружи локация + миры и локи. Нейрофизиология и соматика. Путешествие по сознанию с советами.</p>
</div>

<ul>
  <li>Визуальная карта тела — чакры, энергетические центры, блоки</li>
  <li>Внешняя карта — локации, места силы, миры</li>
  <li>Нейро-соматические советы — практики по состоянию</li>
</ul>

<h2><span class="num">10</span> Дневник и итоги дня</h2>

<h3>Дневник игрока</h3>
<ul>
  <li>Личные заметки, сайты, книги, музыка, фильмы, интересы</li>
  <li>Библиотека — обозреватель контента</li>
  <li>Браузер внутри игры (?)</li>
</ul>

<h3>Итоги дня (выход)</h3>
<div class="card">
  <div class="label">На выходе</div>
  <p>Собрано частиц света · Пробуждён эфир · Работа по телам · Задействовано мер · Энергия по чакрам · Состояние сознания · Основные мысли и моменты · Трудности и блоки · Свет циркуляции · Преисполненность и пустоты · Вдохновение · Взаимодействия с другими · Общение с Даймоном · Генерации и творчество · Совет на завтра · Дополнение от игрока</p>
</div>

<ul>
  <li>Конкретно: что откуда собрано, какие действия пробудили эфир, что вдохновило</li>
  <li>Создание позитива Бодхи — творческого открытого ума и сердца</li>
</ul>

<h2><span class="num">11</span> Синхронизация систем</h2>

<ul>
  <li>Концепция по мерам и чакрам — синхронизировать Тигель с Душой, Даймоном, Хроникой, Сефер-Игрой</li>
  <li>После тестов: строить пространства храмов, домов, земель, островов, лок</li>
  <li>Сначала логическое отражение в Тигель → потом большая игра</li>
  <li>Только время и опыт → взаимообучение → память → скиллы</li>
</ul>

<h2><span class="num">12</span> Мультиплатформа</h2>

<table>
  <tr><th>Платформа</th><th>Приоритет</th><th>Описание</th></tr>
  <tr><td>📱 Мобильная (текущая)</td><td><span class="done">Активна</span></td><td>PWA, основной интерфейс</td></tr>
  <tr><td>🖥 Версия для ПК</td><td><span class="tag tag-v2">V2</span></td><td>Расширенный интерфейс, больше панелей</td></tr>
  <tr><td>🤖 Telegram-бот</td><td><span class="tag tag-v2">V2</span></td><td>Упрощённый вход, нотификации</td></tr>
  <tr><td>🌐 Сайт игры</td><td><span class="tag tag-v2">V2</span></td><td>Лендинг + портал</td></tr>
  <tr><td>📣 Соцсети</td><td><span class="tag tag-v3">V3</span></td><td>Контент, комьюнити</td></tr>
</table>

<div class="page-break"></div>

<h2><span class="num">13</span> Текущий статус</h2>

<table>
  <tr><th>Система</th><th>Статус</th><th>Файл</th></tr>
  <tr><td>Частицы + Эфир</td><td><span class="done">✅ Готово</span></td><td>awara-particles.js</td></tr>
  <tr><td>Чувствительность + Точка сборки</td><td><span class="done">✅ Готово</span></td><td>awara-sensitivity.js</td></tr>
  <tr><td>Световые структуры</td><td><span class="done">✅ Готово</span></td><td>awara-light-structures.js</td></tr>
  <tr><td>Пассивный поток + Чекин</td><td><span class="done">✅ Готово</span></td><td>awara-passive-flow.js</td></tr>
  <tr><td>Раритет промптов</td><td><span class="done">✅ Готово</span></td><td>awara-rarity.js</td></tr>
  <tr><td>Свиток</td><td><span class="done">✅ Готово</span></td><td>awara-scroll.js</td></tr>
  <tr><td>Панорама 33 линзы</td><td><span class="done">✅ Готово</span></td><td>awara-longterm.js</td></tr>
  <tr><td>Энергокарта на завтра</td><td><span class="done">✅ Готово</span></td><td>awara-energy-map.js</td></tr>
  <tr><td>Патч движка</td><td><span class="done">✅ Готово</span></td><td>awara-engine-patch.js</td></tr>
  <tr><td>UI интеграция (Хроника)</td><td><span class="done">✅ Готово</span></td><td>awara-integration.js</td></tr>
  <tr><td>Suno / Art API</td><td><span class="priority">⏳ Нужен ключ</span></td><td>—</td></tr>
  <tr><td>defState() — мультипользователь</td><td><span class="priority">⏳ TODO</span></td><td>—</td></tr>
  <tr><td>Серверный бэкап</td><td><span class="priority">⏳ TODO</span></td><td>—</td></tr>
</table>

<h2><span class="num">14</span> Документация</h2>

<ul>
  <li>Дополнить основной документ из загрузок старой игры и GitHub</li>
  <li>Интегрировать AI-наработки</li>
  <li>Вести changelog по версиям</li>
</ul>

<div class="card">
  <div class="label">Принцип</div>
  <p>Сначала создать логическое отражение в Тигель → потом отразить в большую Игру. Время + опыт → взаимообучение → память → скиллы.</p>
</div>

</body>
</html>
'''

def main():
    out = "/work/temp/awara-roadmap-v3.pdf"
    HTML(string=html, url_fetcher=fetcher).write_pdf(out)
    print(f"PDF created: {out}")

if __name__ == "__main__":
    main()
