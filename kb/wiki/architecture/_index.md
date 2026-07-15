# Архитектура проекта

Создано: 2026-05-24

## Технологии
- Чистый HTML/CSS/JS, без фреймворков
- ES6 модули (import/export)
- localStorage для хранения состояния
- Three.js для 3D-визуализаций (глобус, яйцо, ведический космос)
- GitHub Pages для деплоя

## Канон (фиксирован)
- 21 Космический Агент
- 33 Матрицы Восприятия
- 14 Лок (плотностей)
- 9 Чакр-мер
- 63 Карты (21 × 3 матрицы)
- 693 Соответствия агент×матрица

## Файловая структура
```
awara-game/
├── index.html              ← лобби (яйцо, меню)
├── css/
│   ├── main.css            ← точка входа
│   ├── variables.css       ← дизайн-токены
│   ├── typography.css      ← шрифты
│   ├── components.css      ← кнопки, карточки, модалки
│   └── legacy.css          ← старые стили (не трогать)
├── js/
│   ├── core-module.js      ← константы, канон
│   ├── state-module.js     ← localStorage
│   ├── ui-module.js        ← модалки, тосты, анимации
│   ├── canon-module.js     ← загрузка agents/matrices/locas
│   ├── lobby-module.js     ← логика лобби
│   ├── game-module.js      ← 4 пространства
│   ├── universe-module.js  ← Canvas космос
│   ├── tigel-module.js     ← Тигель, У-Син, ключи
│   ├── menu-module.js      ← меню яйца
│   ├── i18n-module.js      ← переводы RU/EN
│   ├── hints-module.js     ← подсказки
│   ├── daimon-module.js    ← Даймон
│   ├── milost-module.js    ← Милость
│   └── ...
├── data/                   ← 30 JSON-файлов (канон)
├── docs/                   ← документация
├── lore/                   ← 95 лорбуков
└── *.html                  ← 30 экранов
```

## Основные экраны
- [[../screens/_index|Индекс всех экранов]]

## Модули
- [[../modules/_index|Индекс всех JS-модулей]]

## Данные
- [[../data/_index|Индекс всех data-файлов]]

## Механики
- [[../mechanics/_index|Индекс механик]]
