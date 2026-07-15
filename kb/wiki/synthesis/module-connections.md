# Связи между модулями

Создано: 2026-05-24

## Цепочки зависимостей

### Основная цепочка
```
core-module.js → state-module.js → ui-module.js → canon-module.js
                                                    ↓
                    lobby-module.js ← game-module.js ← universe-module.js
                         ↓
                    tigel-module.js
```

### Дополнительные модули
- `matrixSwitcher.js` → используется в `menu-module.js`
- `daimon-module.js` → `milost-module.js` → интеграция в Тигель
- `oracle.js` → `oraclePromptBuilder.js`
- `hints-module.js` → `i18n-module.js` → `i18n.js`

### Данные → Модули
- `data/agents.json` → `canon-module.js` → `universe-module.js`
- `data/matrices.json` → `canon-module.js` → `matrixSwitcher.js`
- `data/locas.json` → `canon-module.js` → `vedic-cosmos.html`
- `data/chakras.json` → `canon-module.js`
- `data/agent_matrix_map.json` → `canon-module.js`
- `data/daimon-forms.json` → `daimon-module.js`
- `data/milost-sources.json` → `milost-module.js`

## Экран → Модули
- `index.html` → `lobby-module.js`, `menu-module.js`, `i18n.js`, `matrixSwitcher.js`
- `tigel.html` → `tigel-module.js`, `state-module.js`, `ui-module.js`
- `universe.html` → `universe-module.js`, `canon-module.js`
- `initiation-space.html` → встроенная логика (Canvas)
- `festivals.html` → Three.js
- `vedic-cosmos.html` → Three.js + `data/locas.json`
