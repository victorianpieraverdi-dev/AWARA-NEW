// AWARA — dimensionality tier switcher (Шаг 1 UI).
// Shows T0..T5 toggle buttons. Unlocked tiers are switchable; locked ones show the
// светмонеты requirement. Reads / writes the global PlayerState via usePlayer().

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./PlayerProvider";
import { RENDER_TIER_COINS, type RenderTier } from "../core/types";
import { TG, glassPanel, glassPill } from "./tigelGlass";

const TIERS: { id: RenderTier; label: string; hint: string }[] = [
  { id: 0, label: "T0 · Плоскость", hint: "плоско, ч/б" },
  { id: 1, label: "T1 · Движение", hint: "ч/б, но живёт" },
  { id: 2, label: "T2 · Свет и звук", hint: "цвет + аудио" },
  { id: 3, label: "T3 · Перестановка", hint: "двигать объекты" },
  { id: 4, label: "T4 · Творение", hint: "создавать" },
  { id: 5, label: "T5 · Законы", hint: "менять физику" },
];

export function TierLadder({ collapseSignal = 0 }: { collapseSignal?: number } = {}) {
  const { tier, maxTier, selectTier, coins, progress, addCrystals } = usePlayer();
  const [open, setOpen] = useState(false); // по умолчанию свёрнуто — не загораживает вселенную
  // Сворачиваемся при переходе между вселенными / окнами (сигнал растёт в Macrocosm).
  const firstCollapse = useRef(true);
  useEffect(() => {
    if (firstCollapse.current) { firstCollapse.current = false; return; }
    setOpen(false);
  }, [collapseSignal]);

  // Свёрнутое состояние — компактная «пилюля» в левом нижнем углу.
  if (!open) {
    return (
      <button style={tab} onClick={() => setOpen(true)} title="Развернуть · ⬡ светмонета — свет осознанности">
        ▸ T{tier} · {coins} ⬡
      </button>
    );
  }

  // Искра осознанности: растёт со светом (искренность, честность, правдивость)
  // и поднимается по ступеням T0–T5. Полнота — к порогу T5 (189 светмонет).
  const sparkFull = Math.min(1, coins / 189);
  const sparkSize = 10 + sparkFull * 14;
  const sparkGlow = 6 + progress * 18;
  const sparkDotDyn: React.CSSProperties = {
    ...sparkDot,
    width: sparkSize,
    height: sparkSize,
    boxShadow: `0 0 ${sparkGlow}px ${sparkGlow / 2}px rgba(255,221,122,0.9)`,
  };

  return (
    <div style={wrap}>
      <div style={head} onClick={() => setOpen(false)} title="Свернуть">
        Размерность · {coins} ⬡ ▾
      </div>
      <div style={coinNote} title="Светмонета (⬡) — мера осознанности: растёт со светом искренности, честности и правдивости.">
        ⬡ светмонета · свет осознанности
      </div>
      <div style={sparkRow} title="Искра осознанности: растёт со светом искренности, честности и правдивости; поднимается по ступеням T0–T5.">
        <span style={sparkDotDyn} />
        <span style={sparkLabel}>Искра · T{tier} · осознанность {coins} ⬡</span>
      </div>
      <button
        style={creatorBtn}
        onClick={() => addCrystals(10_000)}
        title="Креатор: +1 светмонета (или клавиша +)"
      >
        + 1 светмонета ☀
      </button>
      <div style={coinNote} title="Ступени T0–T5 — формы сознания; дальше — дух и выше.">T0–T5 · формы сознания</div>
      {TIERS.map((t) => {
        const unlocked = t.id <= maxTier;
        const active = t.id === tier;
        const need = RENDER_TIER_COINS[t.id];
        const css: React.CSSProperties = {
          ...btn,
          ...(active ? btnActive : null),
          ...(unlocked ? null : btnLocked),
        };
        return (
          <button
            key={t.id}
            disabled={!unlocked}
            onClick={() => unlocked && selectTier(t.id)}
            style={css}
            title={unlocked ? t.hint : `нужно ${need} светмонет`}
          >
            <span>{unlocked ? t.label : `🔒 ${t.label}`}</span>
            <span style={sub}>{unlocked ? t.hint : `нужно ${need} ⬡`}</span>
          </button>
        );
      })}
    </div>
  );
}

const wrap: React.CSSProperties = {
  ...glassPanel,
  position: "fixed",
  left: 16,
  bottom: 64,
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  width: 196,
  padding: 12,
  fontFamily: TG.fontSerif,
  userSelect: "none",
};
const head: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: TG.fontMono,
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: TG.gold,
  opacity: 0.85,
  marginBottom: 2,
  cursor: "pointer",
};
const tab: React.CSSProperties = {
  ...glassPill,
  position: "fixed",
  left: 16,
  bottom: 64,
  zIndex: 50,
  padding: "8px 14px",
  fontFamily: TG.fontMono,
  fontSize: 11,
  letterSpacing: "0.12em",
  cursor: "pointer",
  userSelect: "none",
};
const btn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 1,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid " + TG.line,
  background: "rgba(255,255,255,0.03)",
  color: TG.text,
  fontFamily: TG.fontSerif,
  fontSize: 13,
  cursor: "pointer",
  transition: "all .18s ease",
};
const btnActive: React.CSSProperties = {
  border: "1px solid " + TG.gold,
  background:
    "linear-gradient(150deg, rgba(201,168,76,0.22), rgba(123,98,201,0.12))",
  boxShadow: "0 0 16px rgba(201,168,76,0.3)",
};
const btnLocked: React.CSSProperties = {
  opacity: 0.4,
  cursor: "not-allowed",
};
const sub: React.CSSProperties = {
  fontFamily: TG.fontMono,
  fontSize: 9.5,
  color: TG.muted,
  opacity: 0.85,
};
const coinNote: React.CSSProperties = {
  fontFamily: TG.fontMono,
  fontSize: 9.5,
  lineHeight: 1.3,
  letterSpacing: "0.04em",
  color: TG.spark,
  opacity: 0.8,
  marginBottom: 4,
};
const sparkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "2px 0 6px",
};
const sparkDot: React.CSSProperties = {
  flexShrink: 0,
  borderRadius: 999,
  background:
    "radial-gradient(circle at 35% 35%, #ffffff, #ffd27a 55%, #c9a84c 100%)",
  transition: "all .3s ease",
};
const sparkLabel: React.CSSProperties = {
  fontFamily: TG.fontMono,
  fontSize: 9.5,
  color: TG.spark,
  opacity: 0.9,
};
const creatorBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px dashed rgba(255,210,122,0.5)",
  background: "rgba(255,210,122,0.10)",
  color: TG.spark,
  fontFamily: TG.fontMono,
  fontSize: 11,
  letterSpacing: "0.04em",
  cursor: "pointer",
  marginBottom: 2,
};
