# Контракт Моста Тигля (Этап 1)

> Версия контракта: **1**  ·  Файл моста: `js/tigelBridge.js`  ·  Ключ хранилища: `awara_v258_state`
>
> Назначение: зафиксировать интерфейс между **Тиглем** (что он производит в состоянии игрока)
> и **Мостом** (что он читает и какой `state.light` собирает), чтобы при углублении Тигля
> всё совпадало без переписывания моста.

---

## 0. Принцип — компас, не рельсы

- Мост только **читает** прогресс и **вычисляет** свет. Он ничего не блокирует и не гейтит.
- `state.light` — **advisory** (`advisory: true`). Это подсказка/индикация, не разрешение.
- `light-core.js` остаётся **чистой моделью** (не пишет в localStorage).
- Единственный писатель `state.light` — это мост (`computeLight` вызывается в точках сохранения).

---

## 1. Хранилище и кто пишет

- Ключ: **`awara_v258_state`** (тот же, что у `playerState.js` и `state-module.js`).
- Оба писателя **мерджат**, не перезатирают:
  - `js/state-module.js` → `saveState()` — живой контур Тигля (`synthesizeDay → updateState → saveState`).
  - `js/playerState.js` → `saveState()` — второй контур.
- При **каждом** сохранении вызывается `computeLight(state)` и результат кладётся в `state.light`.
- Разовый бэкфилл при старте: `tigelBridge.refresh()` (через 800 мс после загрузки модуля).

`state.light` — **производное** поле (как `level` из `totalLight`). Его не нужно хранить вручную:
он пересоберётся при следующем сохранении.

---

## 2. ВХОД — что мост читает из `state` (что Тигель должен производить)

Это и есть «контракт совпадения». Пока Тигель пишет эти поля в этих форматах — всё сойдётся.

| Поле state | Тип | Формат / допустимые значения | Как используется мостом |
|---|---|---|---|
| `totalLight` | number | ≥ 0, без потолка | awareness (сатурирующая кривая, шкала 600) |
| `journey` | Array&lt;entry&gt; | список событий пути | entries = длина; источник искажений |
| `journey[].type` | string | метка `'tigel_cauldron'` для записей Тигля | считает `tigelEntries` |
| `journey[].distortions` | string[] | подмножество `{ahamkara, fear, desire, illusion, inertia}` | `shadowFacings` + сдвиг гун |
| `elements` | object | **русские** ключи: `Земля, Вода, Огонь, Воздух, Эфир` → number | профиль стихий 0..1 + гуны |
| `sphereData` | object | ключи `feet, heart, head, cooperation`, каждый `{ light: number }` | баланс сфер для honesty |

**Важно:**
- Любое поле может отсутствовать — мост подставит 0/пусто (никаких падений).
- Незнакомые `distortions` (вне пятёрки) просто игнорируются (не ломают расчёт).
- Стихии читаются **только** по русским ключам (см. карту в §4). Латинские ключи будут проигнорированы.

---

## 3. ВЫХОД — форма `state.light` (что мост пишет)

```json
{
  "version": 1,
  "awareness": 0.0,                       // 0..1 — мастер-метрика
  "honesty": 0.0,                         // 0..1 — близость к реальности / дез-иллюзия
  "gunas": { "tamas": 0.0, "rajas": 0.0, "sattva": 0.0 },   // нормализовано, сумма ≈ 1
  "elements": { "earth": 0.0, "water": 0.0, "fire": 0.0, "air": 0.0, "ether": 0.0 }, // 0..1
  "dominantElement": "earth",             // id доминирующей стихии
  "levelId": null,                        // из light-core LEVELS (если загружен), иначе null
  "statusId": null,                       // из light-core STATUSES (если загружен), иначе null
  "totals": { "totalLight": 0, "entries": 0, "tigelEntries": 0, "shadowFacings": 0 },
  "suggestions": [],                      // advisory-подсказки из AwaraLight.suggest()
  "computedAt": "ISO-8601",
  "advisory": true
}
```

Потребители (UI: яркость вселенной, подсказки и т.п.) должны читать **только** `state.light`
и относиться к нему как к индикации. Если `state.light` нет — звать `AwaraTigelBridge.getLight()`.

---

## 4. Карты соответствий

**Стихии (рус. → id light-core), `ELEMENT_RU_TO_ID`:**

| Тигель (рус.) | light-core (id) |
|---|---|
| Земля | earth |
| Вода | water |
| Огонь | fire |
| Воздух | air |
| Эфир | ether |

**Искажения → гуна, к которой смещают баланс (`DISTORTION_GUNA`):**

| Искажение | Гуна |
|---|---|
| inertia | tamas |
| fear | tamas |
| desire | rajas |
| ahamkara | rajas |
| illusion | rajas |

**Сферы (`sphereData`) — стихийные якоря (из cauldronEngine):**

| Ключ сферы | Стихия |
|---|---|
| feet | Земля |
| heart | Вода |
| head | Воздух |
| cooperation | Эфир |

*(в 4-сферной модели honesty.balance Огонь напрямую не участвует — только стихийный профиль из `elements`.)*

---

## 5. Формулы (advisory-эвристики — можно переосмыслить, не ломая форму)

```
awareness = clamp01( 0.85·(1 − e^(−totalLight/600)) + 0.15·(1 − e^(−entries/40)) )

facingRatio = tigelEntries>0 ? clamp01(shadowFacings / tigelEntries) : 0
balance     = разброс light по сферам feet/heart/head/cooperation (1 − коэф. вариации)
illusionLoad= clamp01(tally.illusion / 8)
honesty     = clamp01( 0.35 + 0.30·facingRatio + 0.25·balance − 0.20·illusionLoad )

tamasRaw  = 0.7·earth + 0.3·water            (+ 0.05 за каждое tamas-искажение)
rajasRaw  = 0.7·fire  + 0.5·water + 0.3·air  (+ 0.05 за каждое rajas-искажение)
sattvaRaw = 0.7·ether + 0.5·air + 0.6·awareness + 0.4·honesty
gunas = нормировка (tamasRaw, rajasRaw, sattvaRaw) к сумме 1
```

---

## 6. Инварианты (что нельзя ломать без bump версии)

1. Ключ хранилища — `awara_v258_state`, merge-семантика (не перезатирать чужие поля).
2. Стихии в `state.elements` — **русские** ключи из §4.
3. `journey[].distortions` — строки из фиксированной пятёрки (прочее игнорируется).
4. Метка записей Тигля — `journey[].type === 'tigel_cauldron'`.
5. `sphereData.<feet|heart|head|cooperation>.light` — число.
6. `state.light.advisory === true` — свет никогда не гейтит и не блокирует.
7. Любое изменение **формы** `state.light` или входных контрактов → поднять `version`.

---

## 7. Чек-лист «чтобы совпало» при углублении Тигля

Когда добавляешь в Тигель новую механику — сверься:

- [ ] Новый свет идёт в `totalLight` (а не в отдельный счётчик мимо state)?
- [ ] Новая запись пути кладётся в `journey` и, если это «варка», помечена `type:'tigel_cauldron'`?
- [ ] Названные искажения попадают в `journey[].distortions` строками из пятёрки?
- [ ] Стихийные начисления идут в `state.elements` по русским ключам?
- [ ] Прогресс сфер пишется в `sphereData.<key>.light`?
- [ ] Сохранение проходит через `state-module.saveState()` или `playerState.saveState()` (а не прямой `setItem` мимо них)?
- [ ] Если нужна новая ось/метрика — решаем: расширяем формулы моста ИЛИ добавляем поле в `state.light` с bump версии.

Если все галочки стоят — `state.light` соберётся сам, и UI/верхние слои это подхватят.

---

## 8. Точки интеграции (уже подключено, Этап 1)

- `js/playerState.js` — поле `light` в DEFAULT_STATE/migrate/getState/saveState + пересчёт `computeLight` в `saveState()`.
- `js/state-module.js` — пересчёт `computeLight(merged)` в `saveState()`.
- `js/tigelBridge.js` — `computeLight / withLight / refresh / getLight`, `window.AwaraTigelBridge`, разовый `refresh()` при старте.

## 9. Открытый вопрос (Этап 1.5 — фрагментация неймспейсов)

Свет суммируется в `awara_v258_state`, но в проекте живут и другие ключи
(`tigel_v1`, `awara.*`, `awara_v255_state`, `awara_subspheres_v3`, `awara_toroid_history`,
`awara_key_inventory`, `awara_initiation_v1`, `awara_sphere_entries`, `jrn_<id>` и пр.).
Если углубление Тигля начнёт писать свет/прогресс в **другой** ключ — это нужно свести
к `awara_v258_state` (или научить мост читать оттуда) до того, как разойдёмся. Помечено как Этап 1.5.
