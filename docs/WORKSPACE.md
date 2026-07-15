# AWARA Workspace — состояние на 10 мая 2026

## Что где

| Что | Путь |
|---|---|
| Репо (статика) | `/home/ubuntu/repos/awara-v258-modular/` |
| Лор: исходные .docx | `/home/ubuntu/awara-lore/raw/` (39 файлов) |
| Лор: текст для чтения | `/home/ubuntu/awara-lore/text/` (50 файлов) |
| Лор: личные/системные | `/home/ubuntu/awara-lore/personal/` (6 файлов) |
| Лор: zip-архивы | `/home/ubuntu/awara-lore/archives/` (4 zip) |
| Vision / Synthesis / Roadmap / Manifest | `/home/ubuntu/awara-{vision,synthesis,roadmap,handoff-manifest}.md` |
| Личный журнал Pavel'а | `/home/ubuntu/AWARA_PHILOSOPHY.md` (226 KB) |
| Этот файл | `/home/ubuntu/WORKSPACE.md` |

## Локальный сервер

```bash
cd /home/ubuntu/repos/awara-v258-modular
python3 -m http.server 8765
```

Открыт прямо сейчас: `http://127.0.0.1:8765/`

## Public deploy

`https://awara-v258-modular-epfubmxp.devinapps.com` (last-modified 10.05.2026 01:22 UTC)

Альфа-код для входа: `AWARA108`.

## Git (локальный, без push)

Репо на ветке `master`, 2 коммита:
1. `a96ecf5` — restore из `awara-v258-modular-fixed.zip`
2. `de74ba5` — подтянуть HTML из deploy (Светкоин 1e-10, табы Тигля, правки initiation-space)

## Расхождения zip ↔ deploy (важно)

`awara-v258-modular-fixed.zip` (handoff) был сделан на час раньше последнего деплоя. В deploy уже было:

- **index.html (+608 B)** — `lobby-light-count` и `topbar-light` теперь показывают `((totalLight||0)/1e10).toFixed(10)` → 10 знаков после запятой. Это Phase 0 task 0.2 уже выполнен.
- **tigel.html (+2.7 KB)** — Тигель разбит на 3 таба: Лог · Баланс · Алхимия (`switchTab(name)`). Совпадает с описанием в манифесте «вечерний лог (3 вкладки)».
- **initiation-space.html (+7.5 KB)** — 324 строк правок (детально не разбирал, но это правки по UI/логике).

JS, CSS, `earth-player.html`, `matrices.html` — байт-в-байт идентичны zip и deploy.

## Phase 0 — статус (по `awara-roadmap.md`)

| # | Задача | Статус |
|---|--------|--------|
| 0.1 | Roadmap-документ | done |
| 0.2 | Светкоин-экономика 10⁻¹⁰ → 10⁰ | **частично:** lobby + topbar показывают 10⁻¹⁰. Уровневая логика повышения множителя с прокачкой — **не сделано** |
| 0.3 | Mobile-pass всех экранов | unknown — надо открывать на мобильном viewport |
| 0.4 | Светкоин-банк / dashboard.html | **не сделано** (на deploy `dashboard.html` — это wildcard-фолбэк на index, не отдельная страница) |
| 0.5 | `/data/agents.json` (21) | **не сделано** (`data/` пуст) |
| 0.6 | `/data/matrices.json` (33) | **не сделано** |
| 0.7 | `/data/agent_matrix_map.json` (21×33 = 693) | **не сделано** |
| 0.8 | `/data/zones.json` + 9 построек | **не сделано** |
| 0.9 | `playerState` модуль и миграция `awara_initiation_v1` | **не сделано** |
| 0.10 | Lint + deploy | по ходу |

## Что отсутствует в репо относительно манифеста

- `dashboard.html`, `cards.html` — нет (только в roadmap)

## Открытые pending'и от Pavel'я (из манифеста)

- [ ] Накшатры (для натальной карты Phase 3)
- [ ] Список 9 матриц восприятия (либо взять первые 9 из 33)
- [ ] Референсы по натальной API
- [ ] ДД+время+место рождения Pavel'я (для тестов натальной)
