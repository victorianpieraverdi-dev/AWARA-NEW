// AWARA — runtime holder for PlayerState (Block 1+).
// Single source of truth for accumulated Light and the two manifestation axes:
//   • colorLevel 0..4  (grayscale -> full spectrum)
//   • renderTier 0..5  (flat plane -> laws sandbox)
// Atomic unit = кристалл света (1 good deed); 10 000 = 1 светмонета.
// Syncs <body data-theme/data-tier> so CSS (grayscale->color) and the R3F scene react.

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createPlayerState,
  lightCoins,
  crystalsInCoin,
  lightProgress,
  colorLevel,
  renderTier,
  effectiveTier,
  freeCrystals,
  sourceCostCrystals,
  linkCostCrystals,
  createLokaState,
  lokaPolarity,
  LOKA_MAX_LEVEL,
  LOKA_NOURISH_WEIGHT,
  DARK_SUBDUE_LEVEL,
  type ColorLevel,
  type PlayerState,
  type RenderTier,
  type PowerSource,
  type SubtleLink,
  type PowerSourceForm,
  type LinkTargetKind,
  type PlaneId,
  type LokaNourish,
  type SpiritKind,
  type SpiritWorld,
  type Cathedral,
  type CathedralPattern,
  type OuterCosmos,
  type OuterCosmosKind,
  type LokaState,
  outerCosmosCostCrystals,
} from "../core/types";
import { loadPlayerState, PLAYER_STORAGE_KEY } from "../core/economy";

// ===== Мультивселенная (multiverse) — несколько вселенных под одним светом =====
// Свет — единый банк на всю мультивселенную. Активная вселенная живёт в рабочих
// полях PlayerState; остальные хранятся снимками в universes[]. Первая вселенная
// «Изначальная» бесплатна; каждая новая запирает NEW_UNIVERSE_COST_COINS света.
export const UNIVERSE_MAX = 7;
export const NEW_UNIVERSE_COST_COINS = 21;
export const NEW_UNIVERSE_COST_CRYSTALS = NEW_UNIVERSE_COST_COINS * 10_000;

export interface UniverseSlot {
  id: string;
  name: string;
  createdAt: number;
  /** Seed визуально различимой формы/туманности/галактики этой вселенной. */
  seed: number;
  powerSources: PowerSource[];
  subtleLinks: SubtleLink[];
  cathedrals: Cathedral[];
  outerCosmoses: OuterCosmos[];
  lokas: LokaState[];
}

export interface PlayerContextValue {
  player: PlayerState;
  /** Whole light-coins accumulated. */
  coins: number;
  /** Кристаллы света beyond whole coins (0..CRYSTALS_PER_COIN-1). */
  crystals: number;
  /** 0..1 progress toward the next coin (shader / HUD driver). */
  progress: number;
  /** Color axis 0..4 (grayscale -> full spectrum). */
  colorLevel: ColorLevel;
  /** Max unlocked dimensionality tier 0..5. */
  maxTier: RenderTier;
  /** Active dimensionality tier (selected, clamped to unlocked). */
  tier: RenderTier;
  /** Add кристаллы света. Drives all progression. */
  addCrystals: (n: number) => void;
  /** Player picks a dimensionality tier (clamped to unlocked max on read). */
  selectTier: (t: RenderTier) => void;
  /** Replace the whole state (load / save). */
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  /** T5: свободные кристаллы света (накопленные − вложенные в связи). */
  freeCrystals: number;
  /** T5: свободные светмонеты, доступные к вложению. */
  freeCoins: number;
  /** T5: создать источник силы / призвать духа (если хватает свободного света). */
  createPowerSource: (
    form: PowerSourceForm,
    agentIndex: number,
    lokaIndex: number,
    pos?: [number, number, number],
    opts?: { spiritKind?: SpiritKind; worldIndex?: SpiritWorld },
  ) => void;
  /** T5: протянуть тонкую связь (если хватает свободного света). */
  createSubtleLink: (
    kind: LinkTargetKind,
    targetIndex: number,
    fromPlane: PlaneId,
    toPlane: PlaneId,
  ) => void;
  /** T5: разорвать связь — вложенный свет возвращается. */
  severLink: (id: string) => void;
  /** T5: убрать источник силы — вложенный свет возвращается. */
  removePowerSource: (id: string) => void;
  /** T5: создать космический собор (объединение ≥2 сил/духов в узор). */
  createCathedral: (
    name: string,
    pattern: CathedralPattern,
    memberIds: string[],
  ) => void;
  /** T5: распустить собор. */
  removeCathedral: (id: string) => void;
  /** T5: призвать высший космос (Творец / Создатель Света) за пределами вселенной. */
  createOuterCosmos: (kind: OuterCosmosKind) => void;
  /** T5: отпустить высший космос — вложенный свет возвращается. */
  removeOuterCosmos: (id: string) => void;
  /** Loka cultivation: feed a loka via a channel (grows influence/level). */
  nourishLoka: (
    lokaIndex: number,
    contour: keyof LokaNourish,
    amount?: number,
  ) => void;
  /** Fix a loka at its current level (subdue a dark one). */
  fixLoka: (lokaIndex: number) => void;
  /** Release a loka's fixation. */
  unfixLoka: (lokaIndex: number) => void;
  /** Мультивселенная: все вселенные игрока (включая активную). */
  universes: UniverseSlot[];
  /** Id активной вселенной. */
  activeUniverseId: string;
  /** Seed активной вселенной (визуально различимая форма в Macrocosm). */
  activeUniverseSeed: number;
  /** Максимум одновременно удерживаемых вселенных. */
  universeMax: number;
  /** Стоимость рождения новой вселенной (в светмонетах). */
  newUniverseCostCoins: number;
  /** T4+: создать новую вселенную (если хватает света и есть слот). */
  createUniverse: (name: string) => void;
  /** Перейти в другую вселенную (снимок текущей сохраняется). */
  switchUniverse: (id: string) => void;
  /** Распустить вселенную — запертый свет возвращается. */
  removeUniverse: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// Простой уникальный id для созданных игроком источников/связей.
const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Seed новой вселенной: каждая получает свой, чтобы её форма/туманность (галактика)
// отличалась. Диапазон совпадает с reroll в Macrocosm.
const genSeed = (): number => Math.floor(Math.random() * 1_000_000_000);

// Ключ сохранённого seed «домашней» вселенной (тот же, что использует Macrocosm),
// чтобы форма первой вселенной оставалась стабильной между перезагрузками.
const HOME_SEED_KEY = "awara.universe.seed";
function readHomeSeed(): number {
  try {
    if (typeof window === "undefined") return 7;
    const v = window.localStorage.getItem(HOME_SEED_KEY);
    return v == null ? 7 : Number(v);
  } catch {
    return 7;
  }
}

// ===== Персист прогресса =====
// Весь прогресс игрока (свет/кристаллы, ступени T0–T5, локи, творения) и мультивселенная
// сохраняются в localStorage, чтобы при перезагрузке (Ctrl+F5) свет в меню T0–T5 и прогресс
// НЕ сбрасывались.
// Ключ сейва живёт в core/economy (там же миграция старого awara_v258_state).
const PLAYER_KEY = PLAYER_STORAGE_KEY;
const UNIVERSES_KEY = "awara.player.universes";
const ACTIVE_UNIVERSE_KEY = "awara.player.activeUniverse";

function loadJSON<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(key);
    return v == null ? null : (JSON.parse(v) as T);
  } catch {
    return null;
  }
}
function saveJSON(key: string, val: unknown) {
  try {
    if (typeof window !== "undefined")
      window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

// Снимок активной вселенной из рабочих полей PlayerState.
function snapshotUniverse(
  id: string,
  name: string,
  createdAt: number,
  seed: number,
  p: PlayerState,
): UniverseSlot {
  return {
    id,
    name,
    createdAt,
    seed,
    powerSources: p.powerSources ?? [],
    subtleLinks: p.subtleLinks ?? [],
    cathedrals: p.cathedrals ?? [],
    outerCosmoses: p.outerCosmoses ?? [],
    lokas: p.lokas ?? [],
  };
}

// Пустая новая вселенная. seed задаёт её форму/туманность (по умолчанию — случайный).
function makeUniverse(name: string, seed: number = genSeed()): UniverseSlot {
  return {
    id: genId(),
    name: name.trim() || "Вселенная",
    createdAt: Date.now(),
    seed,
    powerSources: [],
    subtleLinks: [],
    cathedrals: [],
    outerCosmoses: [],
    lokas: [],
  };
}

// Свет, запертый в неактивной вселенной (источники + связи + космосы).
function investedInSlot(s: UniverseSlot): number {
  let sum = 0;
  for (const x of s.powerSources) sum += x.investedCrystals ?? 0;
  for (const x of s.subtleLinks) sum += x.investedCrystals ?? 0;
  for (const x of s.outerCosmoses) sum += x.investedCrystals ?? 0;
  return sum;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // Восстанавливаем сохранённый прогресс, добивая недостающие поля дефолтами (на случай
  // изменения схемы между версиями). loadPlayerState (core/economy) при первом заходе
  // мигрирует старый сейв awara_v258_state (идемпотентно, старый ключ не удаляем) и
  // добирает свет, заработанный в legacy-модулях (Храм, «Голос совести» …).
  const [player, setPlayer] = useState<PlayerState>(() => {
    if (typeof window === "undefined") return createPlayerState();
    try {
      return { ...createPlayerState(), ...loadPlayerState() };
    } catch {
      return createPlayerState();
    }
  });

  // Мультивселенная: первая вселенная «Изначальная» рождается бесплатно.
  // При наличии сохранённых вселенных — восстанавливаем их.
  const [universes, setUniverses] = useState<UniverseSlot[]>(() => {
    const saved = loadJSON<UniverseSlot[]>(UNIVERSES_KEY);
    return saved && saved.length > 0
      ? saved
      : [makeUniverse("Изначальная", readHomeSeed())];
  });
  const [activeUniverseIdState, setActiveUniverseIdState] = useState<
    string | null
  >(() => loadJSON<string>(ACTIVE_UNIVERSE_KEY));
  const activeUniverseId = activeUniverseIdState ?? universes[0]?.id ?? "";
  // Seed активной вселенной — прокидывается в Macrocosm, чтобы у каждой вселенной
  // была своя форма/туманность/галактика.
  const activeUniverseSeed =
    universes.find((u) => u.id === activeUniverseId)?.seed ?? readHomeSeed();

  const coins = lightCoins(player.crystalsTotal);
  const level = colorLevel(coins);
  const maxTier = renderTier(coins);
  const tier = effectiveTier(player);

  // Reflect progression on <body> for CSS themes (grayscale->color) + scene hooks.
  useEffect(() => {
    const b = document.body;
    b.dataset.theme = `level${level}`;
    b.dataset.tier = String(tier);
  }, [level, tier]);

  // Персист: сохраняем прогресс игрока и мультивселенную при каждом изменении.
  useEffect(() => {
    saveJSON(PLAYER_KEY, player);
  }, [player]);
  useEffect(() => {
    saveJSON(UNIVERSES_KEY, universes);
  }, [universes]);
  useEffect(() => {
    saveJSON(ACTIVE_UNIVERSE_KEY, activeUniverseId);
  }, [activeUniverseId]);

  const addCrystals = useCallback((n: number) => {
    setPlayer((p) => {
      const crystalsTotal = Math.max(0, p.crystalsTotal + n);
      return { ...p, crystalsTotal, light: lightProgress(crystalsTotal) };
    });
  }, []);

  const selectTier = useCallback((t: RenderTier) => {
    setPlayer((p) => ({ ...p, renderTierSelected: t }));
  }, []);

  // ===== T5: творение источников силы и тонких связей =====
  // Свет, вложенный в связь, запирается в ней: crystalsTotal (и ступени) не падают.
  const createPowerSource = useCallback(
    (
      form: PowerSourceForm,
      agentIndex: number,
      lokaIndex: number,
      pos?: [number, number, number],
      opts?: { spiritKind?: SpiritKind; worldIndex?: SpiritWorld },
    ) => {
      const cost = sourceCostCrystals(form, opts?.spiritKind);
      const src: PowerSource = {
        id: genId(),
        form,
        agentIndex,
        lokaIndex,
        pos: pos ?? [0, 0, 0],
        investedCrystals: cost,
        createdAt: Date.now(),
        ...(form === "spirit"
          ? {
              spiritKind: opts?.spiritKind ?? "planetary",
              worldIndex: opts?.worldIndex ?? 7,
            }
          : {}),
      };
      setPlayer((p) =>
        freeCrystals(p) < cost
          ? p
          : { ...p, powerSources: [...(p.powerSources ?? []), src] },
      );
    },
    [],
  );

  const createSubtleLink = useCallback(
    (
      kind: LinkTargetKind,
      targetIndex: number,
      fromPlane: PlaneId,
      toPlane: PlaneId,
    ) => {
      const cost = linkCostCrystals(kind, targetIndex);
      const link: SubtleLink = {
        id: genId(),
        fromPlane,
        toPlane,
        targetKind: kind,
        targetIndex,
        investedCrystals: cost,
        createdAt: Date.now(),
      };
      setPlayer((p) =>
        freeCrystals(p) < cost
          ? p
          : { ...p, subtleLinks: [...(p.subtleLinks ?? []), link] },
      );
    },
    [],
  );

  const severLink = useCallback((id: string) => {
    setPlayer((p) => ({
      ...p,
      subtleLinks: (p.subtleLinks ?? []).filter((l) => l.id !== id),
    }));
  }, []);

  const removePowerSource = useCallback((id: string) => {
    setPlayer((p) => ({
      ...p,
      powerSources: (p.powerSources ?? []).filter((s) => s.id !== id),
    }));
  }, []);

  // ===== T5: соборы / космические объединения =====
  const createCathedral = useCallback(
    (name: string, pattern: CathedralPattern, memberIds: string[]) => {
      const cath: Cathedral = {
        id: genId(),
        name: name.trim() || "\u0421\u043e\u0431\u043e\u0440",
        pattern,
        memberIds: [...memberIds],
        createdAt: Date.now(),
      };
      setPlayer((p) =>
        memberIds.length < 2
          ? p
          : { ...p, cathedrals: [...(p.cathedrals ?? []), cath] },
      );
    },
    [],
  );

  const removeCathedral = useCallback((id: string) => {
    setPlayer((p) => ({
      ...p,
      cathedrals: (p.cathedrals ?? []).filter((c) => c.id !== id),
    }));
  }, []);

  // ===== T5: высшие космосы за пределами вселенной =====
  // Безмерные сферы-космосы, вращающиеся вокруг всего нашего космоса и влияющие
  // сразу на все Меры. Свет, вложенный в призыв, запирается в космосе.
  const createOuterCosmos = useCallback((kind: OuterCosmosKind) => {
    const cost = outerCosmosCostCrystals(kind);
    const cosmos: OuterCosmos = {
      id: genId(),
      kind,
      investedCrystals: cost,
      createdAt: Date.now(),
    };
    setPlayer((p) =>
      freeCrystals(p) < cost
        ? p
        : { ...p, outerCosmoses: [...(p.outerCosmoses ?? []), cosmos] },
    );
  }, []);

  const removeOuterCosmos = useCallback((id: string) => {
    setPlayer((p) => ({
      ...p,
      outerCosmoses: (p.outerCosmoses ?? []).filter((c) => c.id !== id),
    }));
  }, []);

  // ===== Loka cultivation: influence growth, levels 0..9, fixation =====
  const nourishLoka = useCallback(
    (lokaIndex: number, contour: keyof LokaNourish, amount = 1) => {
      const idx = Math.max(0, Math.min(13, lokaIndex));
      const gain = Math.max(0, amount) * (LOKA_NOURISH_WEIGHT[contour] ?? 0.5);
      setPlayer((p) => {
        const list = (p.lokas ?? []).slice();
        let i = list.findIndex((l) => l.index === idx);
        if (i < 0) {
          list.push(createLokaState(idx));
          i = list.length - 1;
        }
        const cur = list[i];
        if (cur.fixed) return p; // fixed loka no longer grows
        const nourish = {
          ...cur.nourish,
          [contour]: cur.nourish[contour] + amount,
        };
        let level = cur.level;
        let influence = cur.influence + gain;
        while (influence >= 1 && level < LOKA_MAX_LEVEL) {
          influence -= 1;
          level += 1;
        }
        if (level >= LOKA_MAX_LEVEL) {
          level = LOKA_MAX_LEVEL;
          influence = 0;
        }
        const subdued =
          cur.subdued ||
          (lokaPolarity(idx) === "dark" && level >= DARK_SUBDUE_LEVEL);
        list[i] = {
          ...cur,
          level,
          influence,
          nourish,
          subdued,
          lastFedAt: Date.now(),
        };
        return { ...p, lokas: list };
      });
    },
    [],
  );

  const fixLoka = useCallback((lokaIndex: number) => {
    const idx = Math.max(0, Math.min(13, lokaIndex));
    setPlayer((p) => {
      const list = (p.lokas ?? []).slice();
      let i = list.findIndex((l) => l.index === idx);
      if (i < 0) {
        list.push(createLokaState(idx));
        i = list.length - 1;
      }
      const cur = list[i];
      const subdued = cur.subdued || lokaPolarity(idx) === "dark";
      list[i] = { ...cur, fixed: true, subdued };
      return { ...p, lokas: list };
    });
  }, []);

  const unfixLoka = useCallback((lokaIndex: number) => {
    const idx = Math.max(0, Math.min(13, lokaIndex));
    setPlayer((p) => ({
      ...p,
      lokas: (p.lokas ?? []).map((l) =>
        l.index === idx ? { ...l, fixed: false } : l,
      ),
    }));
  }, []);

  // ===== Мультивселенная: запертый свет, рождение, переход, роспуск =====
  // Свет — единый банк. Неактивные вселенные держат свой вложенный свет, и каждая
  // вселенная сверх первой запирает стоимость рождения.
  const slotsInvested = universes
    .filter((u) => u.id !== activeUniverseId)
    .reduce((sum, u) => sum + investedInSlot(u), 0);
  const universeBirthLocked =
    Math.max(0, universes.length - 1) * NEW_UNIVERSE_COST_CRYSTALS;
  const freeCryst = Math.max(
    0,
    freeCrystals(player) - slotsInvested - universeBirthLocked,
  );
  const freeCoinsVal = lightCoins(freeCryst);

  const createUniverse = useCallback(
    (name: string) => {
      if (tier < 4) return; // мультивселенная открывается на T4
      if (universes.length >= UNIVERSE_MAX) return;
      if (freeCoinsVal < NEW_UNIVERSE_COST_COINS) return;
      const active = universes.find((u) => u.id === activeUniverseId);
      const snapped = snapshotUniverse(
        activeUniverseId,
        active?.name ?? "Вселенная",
        active?.createdAt ?? Date.now(),
        active?.seed ?? genSeed(),
        player,
      );
      const born = makeUniverse(name);
      setUniverses((list) => [
        ...list.map((u) => (u.id === snapped.id ? snapped : u)),
        born,
      ]);
      setPlayer((p) => ({
        ...p,
        powerSources: [],
        subtleLinks: [],
        cathedrals: [],
        outerCosmoses: [],
        lokas: [],
      }));
      setActiveUniverseIdState(born.id);
    },
    [tier, universes, activeUniverseId, freeCoinsVal, player],
  );

  const switchUniverse = useCallback(
    (id: string) => {
      if (id === activeUniverseId) return;
      const target = universes.find((u) => u.id === id);
      if (!target) return;
      const active = universes.find((u) => u.id === activeUniverseId);
      const snapped = snapshotUniverse(
        activeUniverseId,
        active?.name ?? "Вселенная",
        active?.createdAt ?? Date.now(),
        active?.seed ?? genSeed(),
        player,
      );
      setUniverses((list) =>
        list.map((u) => (u.id === snapped.id ? snapped : u)),
      );
      setPlayer((p) => ({
        ...p,
        powerSources: target.powerSources,
        subtleLinks: target.subtleLinks,
        cathedrals: target.cathedrals,
        outerCosmoses: target.outerCosmoses,
        lokas: target.lokas,
      }));
      setActiveUniverseIdState(target.id);
    },
    [universes, activeUniverseId, player],
  );

  const removeUniverse = useCallback(
    (id: string) => {
      if (universes.length <= 1) return; // последнюю не распускаем
      const remaining = universes.filter((u) => u.id !== id);
      if (remaining.length === universes.length) return;
      const removingActive = id === activeUniverseId;
      setUniverses(remaining);
      if (removingActive) {
        const fallback = remaining[0];
        setPlayer((p) => ({
          ...p,
          powerSources: fallback.powerSources,
          subtleLinks: fallback.subtleLinks,
          cathedrals: fallback.cathedrals,
          outerCosmoses: fallback.outerCosmoses,
          lokas: fallback.lokas,
        }));
        setActiveUniverseIdState(fallback.id);
      }
    },
    [universes, activeUniverseId],
  );

  // Light drives BOTH axes: when a new tier unlocks, auto-advance to it so the
  // universe actually comes alive (T1+ = movement), not just de-grayscales.
  // Manual down-select in the ladder persists as a preview until the next coin.
  useEffect(() => {
    selectTier(maxTier);
  }, [maxTier, selectTier]);

  // Creator / debug: press "+" / "=" grants +1 светмонета to preview tiers / levels.
  // (Ctrl+Shift+C is reserved by browsers for DevTools, so we use a plain key + a UI button.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "+" || e.key === "=") {
        addCrystals(10_000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addCrystals]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      player,
      coins,
      crystals: crystalsInCoin(player.crystalsTotal),
      progress: lightProgress(player.crystalsTotal),
      colorLevel: level,
      maxTier,
      tier,
      addCrystals,
      selectTier,
      setPlayer,
      freeCrystals: freeCryst,
      freeCoins: freeCoinsVal,
      createPowerSource,
      createSubtleLink,
      severLink,
      removePowerSource,
      createCathedral,
      removeCathedral,
      createOuterCosmos,
      removeOuterCosmos,
      nourishLoka,
      fixLoka,
      unfixLoka,
      universes,
      activeUniverseId,
      activeUniverseSeed,
      universeMax: UNIVERSE_MAX,
      newUniverseCostCoins: NEW_UNIVERSE_COST_COINS,
      createUniverse,
      switchUniverse,
      removeUniverse,
    }),
    [
      player,
      coins,
      level,
      maxTier,
      tier,
      addCrystals,
      selectTier,
      freeCryst,
      freeCoinsVal,
      createPowerSource,
      createSubtleLink,
      severLink,
      removePowerSource,
      createCathedral,
      removeCathedral,
      createOuterCosmos,
      removeOuterCosmos,
      nourishLoka,
      fixLoka,
      unfixLoka,
      universes,
      activeUniverseId,
      activeUniverseSeed,
      createUniverse,
      switchUniverse,
      removeUniverse,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
  return ctx;
}
