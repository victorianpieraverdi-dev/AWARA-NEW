// AWARA — HubZonesAura
// Лёгкий advisory-оверлей над сценой: вертикальная "спираль" зон хаба-яйца
// по космологической высоте (Вселенная вверху → Храм/Земля внизу).
// Яркость каждой зоны = zoneLiveness (frozen → silhouette → partial → alive),
// берётся из light-core через useHubZones.
//
// Принцип — компас, не рельсы: чисто созерцательный слой. pointer-events:none,
// ничего не гейтит и не перехватывает клики. Без данных — просто не мешает.
//
// Стили — const-объекты + Object.assign (никаких литеральных ... в JSX).

import * as React from "react";
import { useHubZones, zoneLiveness } from "./useHubZones";

// Порядок сверху вниз по высоте мироздания.
const ZONE_ORDER: string[] = [
  "universe",
  "cosmos",
  "cards",
  "matrices",
  "soul",
  "tigel",
  "daimon",
  "temple",
];

// Фоллбэк-ярлыки (короткие, через \uXXXX). Основные ярлыки приходят из zone.label.
const FALLBACK_LABEL: Record<string, string> = {
  universe: "\u0412\u0441\u0435\u043b\u0435\u043d\u043d\u0430\u044f",
  cosmos: "\u041a\u043e\u0441\u043c\u043e\u0441",
  cards: "\u041a\u0430\u0440\u0442\u044b",
  matrices: "\u041c\u0430\u0442\u0440\u0438\u0446\u044b",
  soul: "\u0414\u0443\u0448\u0430",
  tigel: "\u0422\u0438\u0433\u0435\u043b\u044c",
  daimon: "\u0414\u0430\u0439\u043c\u043e\u043d",
  temple: "\u0425\u0440\u0430\u043c",
};

const DOT_FULL = "\u25cf"; // ●
const DOT_EMPTY = "\u25cb"; // ○

const GOLD = "#c9a84c";
const SPARK = "#ffd27a";
const TEXT = "#e6e1f2";
const MUTED = "#8e88a4";

const wrapStyle: React.CSSProperties = {
  position: "fixed",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: "9px",
  padding: "12px 13px",
  borderRadius: "14px",
  background: "rgba(18,16,28,0.32)",
  border: "1px solid rgba(201,168,76,0.14)",
  backdropFilter: "blur(7px)",
  WebkitBackdropFilter: "blur(7px)",
  pointerEvents: "none",
  zIndex: 40,
  fontFamily: "inherit",
  fontSize: "11px",
  lineHeight: "1.1",
  userSelect: "none",
};

const rowBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  whiteSpace: "nowrap",
};

const dotBaseStyle: React.CSSProperties = {
  width: "12px",
  fontSize: "10px",
  textAlign: "center",
};

const labelStyle: React.CSSProperties = { color: TEXT };
const stateStyle: React.CSSProperties = { color: MUTED, fontSize: "9px" };

function rowStyle(live: number): React.CSSProperties {
  return Object.assign({}, rowBaseStyle, { opacity: 0.18 + 0.82 * live });
}
function dotStyle(live: number, isNext: boolean): React.CSSProperties {
  const color = live >= 1 ? GOLD : isNext ? SPARK : MUTED;
  return Object.assign({}, dotBaseStyle, { color });
}

export function HubZonesAura(): React.ReactElement | null {
  const { zones } = useHubZones();
  if (!zones || typeof zones !== "object") return null;

  const rows = ZONE_ORDER.map((id) => {
    const z = (zones as Record<string, any>)[id];
    const live = zoneLiveness(z);
    const label = (z && z.label) || FALLBACK_LABEL[id] || id;
    const stateLabel = z && z.stateLabel ? String(z.stateLabel) : "";
    const isNext = !!(z && z.next && z.next.levelsAway === 1);
    const glyph = live >= 1 ? DOT_FULL : DOT_EMPTY;
    return (
      <div key={id} style={rowStyle(live)}>
        <span style={dotStyle(live, isNext)}>{glyph}</span>
        <span style={labelStyle}>{label}</span>
        {stateLabel ? <span style={stateStyle}>{stateLabel}</span> : null}
      </div>
    );
  });

  return (
    <div style={wrapStyle} aria-hidden={true}>
      {rows}
    </div>
  );
}

export default HubZonesAura;
