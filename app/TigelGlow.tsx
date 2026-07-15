// AWARA — TigelGlow
// Advisory visual aura that reflects the Tigel spine's light onto the React
// universe. It wraps <Macrocosm/> and gently raises brightness (and a touch of
// saturation) as the player's awareness grows.
//
// PRINCIPLE — compass, not rails: this is purely cosmetic and advisory. It never
// gates, blocks, or changes any game state. When no Tigel light is available the
// filter is the identity (no visible change), so the scene looks exactly as before.
//
// It reads the advisory packet via useTigelLight() and applies a CSS filter on a
// transparent full-size wrapper, composing on top of the existing grayscale->color
// filters of the parent .scene-color / .scene-tier containers.

import * as React from "react";
import { useTigelLight } from "./useTigelLight";

function clamp01(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// Advisory tuning constants — kept deliberately subtle so the universe never
// blows out. Max boost at full awareness/honesty is gentle.
const BRIGHTNESS_GAIN = 0.2; // up to +20% brightness at awareness = 1
const SATURATE_GAIN = 0.15; // up to +15% saturation at honesty = 1

export function TigelGlow({ children }: { children: React.ReactNode }) {
  const light = useTigelLight();

  const awareness = clamp01(light ? light.awareness : 0);
  const honesty = clamp01(light ? light.honesty : 0);

  const brightness = 1 + BRIGHTNESS_GAIN * awareness;
  const saturate = 1 + SATURATE_GAIN * honesty;

  // Single-brace style binding (a const object) to avoid emitting literal
  // double curly braces in JSX.
  const glowStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    filter: `brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)})`,
    transition: "filter 1.6s ease",
    willChange: "filter",
  };

  return <div style={glowStyle}>{children}</div>;
}

export default TigelGlow;
