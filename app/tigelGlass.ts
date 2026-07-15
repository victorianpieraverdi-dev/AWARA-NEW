// AWARA — shared Tigel glass design tokens for istok overlays / panels.
// Mirrors :root in tigel-app.html and .awara-glass-panel in awara-glass.css so
// every floating menu (hints, tier ladder, creator) shares one glass language.
//
// Usage: spread a base style and override layout, e.g.
//   const panel = { ...glassPanel, position: "fixed", top: 72, left: 16 };

import type * as React from "react";

export const TG = {
  gold: "#c9a84c",
  spark: "#ffd27a",
  violet: "#7b62c9",
  violetSoft: "#9d86e0",
  text: "#e6e1f2",
  muted: "#8e88a4",
  line: "rgba(201, 168, 76, 0.16)",
  fontSerif: "'Cormorant Garamond', Georgia, serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  fontTitle: "'Cinzel', 'Cormorant Garamond', serif",
  glassBg:
    "linear-gradient(160deg, rgba(10, 10, 20, 0.55) 0%, rgba(20, 16, 40, 0.4) 55%, rgba(255, 210, 122, 0.1) 100%)",
  glassBorder: "1px solid rgba(255, 210, 122, 0.18)",
  glassBlur: "blur(15px) saturate(140%)",
  glassShadow:
    "0 8px 40px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 200, 120, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
} as const;

// Base Tigel glass panel (violet->gold gradient, soft gold edge, inner highlight).
export const glassPanel: React.CSSProperties = {
  position: "relative",
  background: TG.glassBg,
  border: TG.glassBorder,
  borderRadius: 16,
  backdropFilter: TG.glassBlur,
  WebkitBackdropFilter: TG.glassBlur,
  boxShadow: TG.glassShadow,
  color: TG.text,
};

// Compact glass pill (collapsed tabs / toggles).
export const glassPill: React.CSSProperties = {
  borderRadius: 999,
  background: TG.glassBg,
  border: TG.glassBorder,
  backdropFilter: TG.glassBlur,
  WebkitBackdropFilter: TG.glassBlur,
  boxShadow: TG.glassShadow,
  color: TG.spark,
};
