# OPUS TASK — AWARA Daimon Progression System

Дата: 2026-06-04
Проект: AWARA
Главная задача: внедрить работающую систему развития Daimon от малыша до космического существа.

---

## 0. Контекст

В проекте уже сохранены концепция и данные Daimon evolution.

Прочитать сначала:

```txt
docs/daimon-evolution-mechanics.md
data/daimons/daimon_evolution_path.json
data/daimons/level_progression.json
data/daimon-stages.json
```

Также уже есть базовая интеграция Daimon с игрой:

```txt
js/modules/daimon-manager.js
js/cauldronEngine.js
js/daimon-module.js
js/playerState.js
js/daimonFusionEngine.js
data/element_fusions.json
daimon.html
```

Главный state:

```txt
awara_v258_state
```

Daimon должен жить в:

```js
state.daimon
```

Старый ключ для совместимости:

```txt
awara_player_daimon
```

---

## 1. Цель

Сделать полноценную механику:

```txt
XP → level → tier → chakra → stage → granthi → abilities → synthesis/domains/worlds
```

Daimon должен развиваться не косметически, а открывать новые игровые функции:

```txt
Stage 1: базовый спутник
Stage 2: эмоциональный резонанс + двойные стихии
Stage 3: мантра + видение искажений
Stage 4: тройной синтез + domain_seed
Stage 5: minions + createDomain + sharedWorldCore
```

---

## 2. Важные существующие данные

### 2.1. level_progression

Файл:

```txt
data/daimons/level_progression.json
```

Уже содержит:

```txt
levels 1–100
xp_required
tier
chakra
```

Тиры:

```txt
1–20     Common
21–40    Uncommon
41–60    Rare
61–80    Epic
81–90    Mythic
91–100   Legendary
```

### 2.2. daimon-stages

Файл:

```txt
data/daimon-stages.json
```

Стадии:

```txt
1. Пашу — 2 DNA — chakra 1–2
2. Вира — 4 DNA — chakra 3–4 — seeEmotions, compositeElement
3. Садхака — 7 DNA — chakra 5–6 — mantra, seeThroughMaya
4. Дживанмукта — 10 DNA — chakra 7–8 — readAkasha, tripleElement, domainLink
5. Парамукти — 12 DNA — chakra 9 — generateMinions, realityWeave, createDomain
```

### 2.3. daimon_evolution_path

Файл:

```txt
data/daimons/daimon_evolution_path.json
```

Содержит расширенную концепцию:

```txt
stages
xpSources
granthiGates
nextImplementationSteps
```

---

## 3. Создать главный модуль прогресса

Создать файл:

```txt
js/daimonProgression.js
```

Он должен быть центральным модулем, который отвечает за:

```txt
начисление XP
расчёт уровня
расчёт tier
расчёт chakra
расчёт stage
расчёт DNA strands
расчёт abilities
грантхи-ворота
unlock events
```

---

## 4. API нового модуля

В `js/daimonProgression.js` реализовать и экспортировать:

```js
export function calculateDaimonLevel(totalXP)
export function calculateDaimonStage(level, granthiPierced = {})
export function updateDaimonProgressSync(daimon, xpDelta, context = {})
export function canPierceGranthi(daimon, granthiId)
export function pierceGranthi(daimon, granthiId)
export function getNextDaimonUnlock(daimon)
```

Важно: сделать именно sync-версию, чтобы не ломать текущий `cauldronEngine.js`, если он синхронный.

Для sync-варианта можно встроить минимальные таблицы прямо в модуль или импортировать статические данные осторожно. Если JSON fetch нужен, сделать отдельную async-обёртку позже, но MVP должен работать синхронно.

---

## 5. Логика calculateDaimonLevel

Функция:

```js
calculateDaimonLevel(totalXP)
```

Должна вернуть:

```js
{
  level,
  tier,
  chakra,
  chakraName,
  xpRequired,
  nextLevel,
  nextXpRequired,
  progressToNext
}
```

Логика:

- найти максимальный level, где `totalXP >= xp_required`
- если выше max, level = 100
- tier и chakra взять из таблицы
- chakraName по мапе:

```js
{
  1: 'Муладхара',
  2: 'Свадхистхана',
  3: 'Манипура',
  4: 'Анахата',
  5: 'Вишуддха',
  6: 'Аджна',
  7: 'Сахасрара',
  8: 'Монада',
  9: 'Абсолют'
}
```

---

## 6. Логика calculateDaimonStage

Функция:

```js
calculateDaimonStage(level, granthiPierced = {})
```

Стадии не должны открываться только от XP. Нужны грантхи-ворота.

Правила:

```txt
Stage 1: всегда, levels 1–20
Stage 2: level >= 20 и brahma === true
Stage 3: level >= 40 и brahma === true и vishnu === true
Stage 4: level >= 60 и brahma === true и vishnu === true и rudra === true
Stage 5: level >= 80 и brahma/vishnu/rudra === true и paramukti === true
```

Вернуть:

```js
{
  evolutionStage,
  evolutionStageName,
  dnaStrands,
  evolutionMultiplier,
  abilities,
  chakraRange,
  nextGate
}
```

---

## 7. Логика updateDaimonProgressSync

Функция:

```js
updateDaimonProgressSync(daimon, xpDelta, context = {})
```

Должна:

1. принять текущего Daimon
2. безопасно создать дефолты, если полей нет
3. добавить XP
4. пересчитать level/tier/chakra/stage/DNA/abilities
5. сформировать unlock events
6. записать lastProgressEvent
7. вернуть `{ daimon, unlocks }`

Поля Daimon после обновления:

```js
{
  level,
  tier,
  xp,
  totalXP,
  experience,
  chakra,
  chakraName,
  evolutionStage,
  evolutionStageName,
  dnaStrands,
  evolutionMultiplier,
  abilities,
  granthiPierced,
  updatedAt,
  lastProgressEvent
}
```

`xp`, `totalXP`, `experience` держать синхронно, чтобы старые экраны не ломались.

Пример unlock events:

```js
[
  { type: 'level_up', from: 12, to: 13 },
  { type: 'chakra_unlocked', chakra: 3, name: 'Манипура' },
  { type: 'tier_changed', from: 'Common', to: 'Uncommon' },
  { type: 'ability_unlocked', ability: 'compositeElement' }
]
```

---

## 8. Грантхи-ворота

Реализовать:

```js
canPierceGranthi(daimon, granthiId)
pierceGranthi(daimon, granthiId)
```

### 8.1. canPierceGranthi

Правила:

```txt
brahma:
  level >= 20

vishnu:
  level >= 40
  brahma === true

rudra:
  level >= 60
  brahma === true
  vishnu === true

paramukti:
  level >= 80
  brahma === true
  vishnu === true
  rudra === true
```

Возвращать:

```js
{
  canPierce: true,
  reason: null,
  requiredLevel: 20
}
```

или:

```js
{
  canPierce: false,
  reason: 'level_too_low',
  requiredLevel: 20
}
```

### 8.2. pierceGranthi

Должна:

1. проверить `canPierceGranthi`
2. поставить `granthiPierced[granthiId] = true`
3. пересчитать stage
4. добавить unlock events
5. вернуть `{ daimon, unlocks, success }`

---

## 9. Подключить к Тигелю

Файл:

```txt
js/cauldronEngine.js
```

Сейчас там уже есть Daimon bonus и XP. Нужно заменить ручное начисление:

```js
daimon.xp += ...
daimon.totalXP += ...
daimon.experience += ...
```

на:

```js
import { updateDaimonProgressSync } from './daimonProgression.js';

const progress = updateDaimonProgressSync(next.daimon, daimonBonus.xpGained, {
  source: 'tigel',
  dayEnergy: result.dayEnergy,
  dayElement: daimonBonus.dayElement,
  elementMatch: daimonBonus.elementMatch,
  bonusLight: daimonBonus.bonusLight,
  resonance: daimonBonus.resonance
});

next.daimon = progress.daimon;
```

В journey entry добавить:

```js
daimonUnlocks: progress.unlocks
```

Если импорт ломает окружение, проверить относительный путь. `cauldronEngine.js` лежит в `js/`, значит:

```js
'./daimonProgression.js'
```

---

## 10. Подключить к синтезу Daimon

Файл:

```txt
js/daimonFusionEngine.js
```

После создания результата синтеза начислять Daimon XP.

XP за тип результата:

```js
const FUSION_XP = {
  resonance_form: 100,
  elemental_minion: 300,
  oracle_being: 300,
  guardian: 300,
  artifact: 500,
  card_seed: 500,
  domain_seed: 1000,
  healing_domain: 1000,
  shared_domain: 3000
};
```

Логика:

```js
if (state.daimon) {
  const xpReward = FUSION_XP[result.type] || 100;
  const progress = updateDaimonProgressSync(state.daimon, xpReward, {
    source: 'fusion',
    fusionType: result.type,
    elements: result.elements,
    agent: result.agent,
    matrix: result.matrix
  });
  state.daimon = progress.daimon;
}
```

В journey добавить unlocks.

---

## 11. Проверить playerState.js

Файл:

```txt
js/playerState.js
```

Убедиться, что он не выбрасывает поля:

```js
fusionHistory
createdBeings
domainSeeds
```

Если выбрасывает — добавить в DEFAULT_STATE, getState, saveState, migrate.

Важно: сохранить `daimon` и новые массивы.

---

## 12. Обновить daimon.html

Файл:

```txt
daimon.html
```

Добавить блок:

```txt
Evolution Path
```

Показывать:

```txt
Level
Tier
Stage
Chakra
DNA strands
Granthi status
Abilities
Next unlock
XP progress
```

Пример UI:

```txt
Златогроз
Level 37
Tier: Uncommon
Stage: Вира
Chakra: Анахата
DNA: 4 / 12
Granthi: Брахма открыт
Next unlock: Mantra at Stage 3
```

---

## 13. Грантхи-кнопки на daimon.html

Если `canPierceGranthi(daimon, 'brahma')` возвращает true, показать кнопку:

```txt
Пробить Брахма-грантхи
```

Аналогично:

```txt
Пробить Вишну-грантхи
Пробить Рудра-грантхи
Выйти за Брахманду
```

Для MVP можно делать простое подтверждение без сложного квеста.

После клика:

```js
const result = pierceGranthi(daimon, granthiId);
state.daimon = result.daimon;
save/update state;
rerender UI;
```

---

## 14. Journey events

При важных событиях писать в:

```js
state.journey
```

Типы:

```txt
daimon_level_up
daimon_chakra_unlocked
daimon_tier_changed
daimon_granthi_pierced
daimon_stage_changed
daimon_ability_unlocked
daimon_fusion_xp
```

Минимум: если сложно писать отдельные события, положить `unlocks` в уже существующую запись Тигеля или синтеза.

---

## 15. Тестовые сценарии

### 15.1. Тигель

1. В localStorage есть `awara_v258_state.daimon`.
2. Игрок проходит Тигель.
3. Daimon получает XP.
4. Level пересчитывается.
5. Chakra / tier / stage обновляются.
6. `lastProgressEvent` появляется.
7. `journey` получает запись.

### 15.2. Синтез

1. Есть `state.daimon`.
2. Вызывается `createExampleGeyserFusion()`.
3. Создаётся fusion result.
4. Daimon получает XP.
5. `fusionHistory` пополняется.
6. `journey` пополняется.

### 15.3. Daimon screen

1. Открыть `daimon.html`.
2. Видно level.
3. Видно tier.
4. Видно stage.
5. Видно chakra.
6. Видно DNA.
7. Видно granthi.
8. Видно next unlock.

---

## 16. Не ломать

Важно:

```txt
Не удалять старые функции daimon-module.js.
Не ломать awara_player_daimon.
Не менять структуру level_progression.json без необходимости.
Не переписывать daimon.html целиком.
Не делать большие непроверяемые патчи.
Сохранять всё в awara_v258_state.daimon.
```

---

## 17. Приоритеты

```txt
P0: создать js/daimonProgression.js
P1: подключить к js/cauldronEngine.js
P2: подключить к js/daimonFusionEngine.js
P3: обновить daimon.html
P4: добавить granthi buttons
P5: добавить визуальные формы по стадиям
```

---

## 18. Ожидаемый результат

После выполнения:

```txt
Daimon получает XP.
Daimon автоматически получает level.
Level открывает chakra.
Tier меняется автоматически.
Stage зависит от level + granthi.
Granthi работают как ворота.
daimon.html показывает развитие.
Синтез даёт XP.
Тигель даёт XP.
Всё сохраняется в awara_v258_state.daimon.
```

---

## 19. Специальный Daimon: Златогроз

Текущий персональный архетип:

```txt
Златогроз, Кристальный Страж Рудры
Читра-Ардра, Златогрозовой Архитектор Храма
```

Накшатрический код:

```txt
Лагна: Весы, Читра 3
Луна: Близнецы, Ардра 4
Венера: Близнецы, Ардра 3
Солнце: Телец, Криттика 2
Юпитер: Рак, Пушйа 3
Сатурн: Козерог, Шравана 1
```

Эволюция формы:

```txt
Stage 1: детёныш бури
Stage 2: грозовой спутник
Stage 3: кристальный защитник
Stage 4: архитектор храма
Stage 5: космический Рудра-тигр
```

Особая механика для Ardra/Zlatogroz:

```txt
Бонус XP за честное проживание боли, кризиса, слёз, хаоса и превращение этого в свет через Тигель.
```

---

## 20. Минимальный код-скелет daimonProgression.js

Используй как ориентир, но адаптируй под фактический проект.

```js
const CHAKRA_NAMES = {
  1: 'Муладхара',
  2: 'Свадхистхана',
  3: 'Манипура',
  4: 'Анахата',
  5: 'Вишуддха',
  6: 'Аджна',
  7: 'Сахасрара',
  8: 'Монада',
  9: 'Абсолют'
};

export function calculateDaimonLevel(totalXP = 0) {
  // TODO: use level_progression table or embedded copy
}

export function calculateDaimonStage(level = 1, granthiPierced = {}) {
  // TODO: level + granthi gates
}

export function updateDaimonProgressSync(daimon, xpDelta = 0, context = {}) {
  const before = { ...(daimon || {}) };
  const next = { ...(daimon || {}) };
  const oldLevel = Number(next.level || 1);
  const oldTier = next.tier || 'Common';
  const oldChakra = Number(next.chakra || 1);

  const totalXP = Math.max(0, Number(next.totalXP || next.experience || next.xp || 0) + Number(xpDelta || 0));
  const levelInfo = calculateDaimonLevel(totalXP);
  const stageInfo = calculateDaimonStage(levelInfo.level, next.granthiPierced || {});

  next.xp = totalXP;
  next.totalXP = totalXP;
  next.experience = totalXP;
  next.level = levelInfo.level;
  next.tier = levelInfo.tier;
  next.chakra = levelInfo.chakra;
  next.chakraName = levelInfo.chakraName;
  next.evolutionStage = stageInfo.evolutionStage;
  next.evolutionStageName = stageInfo.evolutionStageName;
  next.dnaStrands = stageInfo.dnaStrands;
  next.evolutionMultiplier = stageInfo.evolutionMultiplier;
  next.abilities = stageInfo.abilities;
  next.updatedAt = new Date().toISOString();

  const unlocks = [];
  if (next.level > oldLevel) unlocks.push({ type: 'level_up', from: oldLevel, to: next.level });
  if (next.tier !== oldTier) unlocks.push({ type: 'tier_changed', from: oldTier, to: next.tier });
  if (next.chakra > oldChakra) unlocks.push({ type: 'chakra_unlocked', chakra: next.chakra, name: next.chakraName });

  next.lastProgressEvent = {
    at: next.updatedAt,
    xpDelta,
    source: context.source || 'unknown',
    context,
    unlocks
  };

  return { daimon: next, unlocks };
}
```
