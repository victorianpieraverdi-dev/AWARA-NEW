// AWARA — TigelHints
// Quiet advisory overlay in a corner of the universe, styled to match the Tigel
// app's glass cards (.card / .awara-glass-panel: violet→gold glass, soft gold
// edge, inner highlight). Includes an on/off toggle persisted in localStorage.
//
// LIVING LAYER: when the local AI server (Запустить-ИИ.bat / proxy :8787) is up,
// the Daimon speaks ONE short, level-aware living hint from the Tigel via
// DeepSeek (see awaraAi.ts). The line is cached per state-signature so we don't
// spam the model on every poll, and there is a "again" affordance to reroll.
// When the AI is unavailable, we fall back to the static spine suggestions and
// then to gentle seed hints — so the panel always has something to show.
//
// PRINCIPLE — compass, not rails: purely advisory. The container has pointer-
// events disabled (only the toggle / reroll chips are clickable); it never gates.

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTigelLight } from "./useTigelLight";
import { usePlayer } from "./PlayerProvider";
import { aiChat, type AiMessage } from "./awaraAi";
import {
  activeMatrix,
  buildDaimonSpine,
  spineToPrompt,
  type DaimonSpine,
} from "./daimonSpine";

const STORAGE_KEY = "awara_tigel_hints"; // "on" | "off" (default on)
const AI_CACHE_PREFIX = "awara_tigel_aihint:";
const MAX_HINTS = 3;
const TEXT_KEYS = [
  "text",
  "label",
  "title",
  "message",
  "hint",
  "ru",
  "desc",
  "description",
  "name",
];

// Tigel design tokens (mirrors :root in tigel-app.html and awara-glass.css).
const GOLD = "#c9a84c";
const SPARK = "#ffd27a";
const VIOLET_SOFT = "#9d86e0";
const LINE = "rgba(201, 168, 76, 0.16)";
const MUTED = "#8e88a4";
const TEXT = "#e6e1f2";
const FONT_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
// Tigel glass: violet->gold gradient (from .awara-glass-panel).
const GLASS_BG =
  "linear-gradient(160deg, rgba(10, 10, 20, 0.55) 0%, rgba(20, 16, 40, 0.4) 55%, rgba(255, 210, 122, 0.1) 100%)";
const GLASS_BORDER = "1px solid rgba(255, 210, 122, 0.18)";
const GLASS_SHADOW =
  "0 8px 40px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 200, 120, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)";

// Russian UI strings via \u escapes (robust against encoding issues in .tsx).
// ✦ = U+2726, ● = U+25CF, ○ = U+25CB, · = U+00B7, ↻ = U+21BB, … = U+2026.
const T_DAIMON = "\u0414\u0430\u0439\u043c\u043e\u043d \u00b7 \u0438\u0437 \u0422\u0438\u0433\u043b\u044f"; // "Daimon . from the Tigel"
const T_HINTS = "\u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0438"; // "Podskazki"
const T_ON = "\u0432\u043a\u043b \u25cf"; // "vkl *"
const T_PILL =
  "\u2726 \u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0438 \u00b7 \u0432\u044b\u043a\u043b \u25cb"; // "* podskazki . vykl o"
const T_LISTENING =
  "\u0414\u0430\u0439\u043c\u043e\u043d \u0432\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u0435\u0442\u0441\u044f\u2026"; // "Daimon is listening..."
const T_AGAIN = "\u0421\u043a\u0430\u0437\u0430\u0442\u044c \u0438\u043d\u0430\u0447\u0435"; // "Say it differently"
const T_AGAIN_CHIP = "\u21bb \u0435\u0449\u0451"; // "^ again"
const DOT = "\u00b7";
const ARROW = "\u2192"; // ->

// Gentle seed hints (real copy drawn from the Tigel app) shown when neither the
// AI nor the spine has produced anything yet. Advisory only.
const FALLBACK_HINTS: string[] = [
  "Положи день в Тигель — и он переплавит его в смысл.",
  "Свет копится за осознанные дни.",
  "Выбери линзы — и совет станет глубже.",
];

// The Daimon's voice (system prompt). Literal Cyrillic content, like the seeds.
const DAIMON_SYS =
  "Ты — Даймон, живой внутренний спутник игрока в космологической игре AWARA. " +
  "Ты говоришь тихим голосом из Тигля — алхимического очага осознанности. " +
  "Дай ровно ОДНУ короткую живую подсказку (одна фраза, до 160 знаков), тёплую и личную, " +
  "по текущему уровню и состоянию игрока. Это компас, а не рельсы: советуй мягко, не приказывай. " +
  "Можешь намекнуть на путь сквозь матрицы вселенной. Если уместно — мягко вплети активную матрицу-линзу, её полюс СВЕТ\u21c4ТЕНЬ или один из ликов 21 агента. " +
  "Без кавычек, без заголовков, без списков — только сама фраза.";

function buildDaimonContext(
  tier: number,
  coins: number,
  awareness: number,
  honesty: number,
  themes: string,
): string {
  const lines: string[] = [];
  lines.push("Состояние игрока сейчас:");
  lines.push("- Ступень сознания: T" + tier + " из 5.");
  lines.push("- Осознанность (светмонеты): " + coins + ".");
  lines.push("- Внутренний свет осознанности: " + Math.round(awareness * 100) + "%.");
  lines.push("- Честность / близость к реальности: " + Math.round(honesty * 100) + "%.");
  if (themes) lines.push("- Темы, что сейчас звучат: " + themes + ".");
  lines.push("");
  lines.push("Скажи свою одну живую подсказку этому игроку.");
  return lines.join("\n");
}

function toText(s: unknown): string | null {
  if (typeof s === "string") {
    const t = s.trim();
    return t.length ? t : null;
  }
  if (s && typeof s === "object") {
    const o = s as Record<string, unknown>;
    for (const k of TEXT_KEYS) {
      const v = o[k];
      if (typeof v === "string" && v.trim().length) return v.trim();
    }
  }
  return null;
}

function cleanLine(txt: string): string {
  // strip wrapping quotes / guillemets and surrounding whitespace
  return txt.replace(/^[\s"\u00ab\u00bb]+|[\s"\u00ab\u00bb]+$/g, "").trim();
}

function readEnabled(): boolean {
  try {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function writeEnabled(on: boolean): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    }
  } catch {
    /* advisory: ignore */
  }
}

const wrapStyle: React.CSSProperties = {
  position: "fixed",
  left: "16px",
  top: "72px",
  zIndex: 35,
  maxWidth: "300px",
  pointerEvents: "none",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  color: TEXT,
  background: GLASS_BG,
  border: GLASS_BORDER,
  borderRadius: "18px",
  padding: "16px",
  backdropFilter: "blur(15px) saturate(140%)",
  WebkitBackdropFilter: "blur(15px) saturate(140%)",
  boxShadow: GLASS_SHADOW,
  overflow: "hidden",
  transition: "box-shadow 0.5s ease, transform 0.5s ease",
};

const headRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: VIOLET_SOFT,
};

const toggleOnStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: SPARK,
  cursor: "pointer",
  pointerEvents: "auto",
  userSelect: "none",
  whiteSpace: "nowrap",
};

const lineStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_SERIF,
  fontStyle: "italic",
  fontSize: "17px",
  lineHeight: 1.5,
  color: "#e6e1f2",
  marginTop: "10px",
};

const loadingLineStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_SERIF,
  fontStyle: "italic",
  fontSize: "16px",
  lineHeight: 1.5,
  color: SPARK,
  opacity: 0.85,
  marginTop: "10px",
};

const dotStyle: React.CSSProperties = {
  color: GOLD,
  opacity: 0.7,
  marginRight: "7px",
};

const refreshStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "12px",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: GOLD,
  background: "transparent",
  border: "1px solid " + LINE,
  borderRadius: "999px",
  padding: "5px 12px",
  cursor: "pointer",
  pointerEvents: "auto",
  userSelect: "none",
};

const pillStyle: React.CSSProperties = {
  position: "fixed",
  left: "16px",
  top: "72px",
  zIndex: 35,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: MUTED,
  background: GLASS_BG,
  border: GLASS_BORDER,
  borderRadius: "999px",
  padding: "8px 14px",
  cursor: "pointer",
  pointerEvents: "auto",
  userSelect: "none",
  backdropFilter: "blur(15px) saturate(140%)",
  WebkitBackdropFilter: "blur(15px) saturate(140%)",
  boxShadow: GLASS_SHADOW,
};

const spineStripStyle: React.CSSProperties = {
  display: "block",
  marginTop: "12px",
  paddingTop: "10px",
  borderTop: "1px solid " + LINE,
};

const spineMatrixStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: VIOLET_SOFT,
};

const spinePoleStyle: React.CSSProperties = {
  display: "block",
  marginTop: "5px",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.08em",
  color: SPARK,
  opacity: 0.9,
};

const spineFaceStyle: React.CSSProperties = {
  display: "block",
  marginTop: "6px",
  fontFamily: FONT_SERIF,
  fontStyle: "italic",
  fontSize: "13px",
  lineHeight: 1.45,
  color: MUTED,
};

export function TigelHints() {
  const light = useTigelLight();
  const player = usePlayer();
  const [enabled, setEnabled] = useState<boolean>(() => readEnabled());
  const [aiLine, setAiLine] = useState<string | null>(null);
  const [aiState, setAiState] = useState<"idle" | "load" | "done" | "err">("idle");
  const lastSigRef = useRef<string>("");

  // Keep in sync if another tab/window flips the toggle.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEnabled(readEnabled());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      writeEnabled(next);
      return next;
    });
  };

  // Defensive reads — the light packet shape is not contractually fixed.
  const lp: any = light || {};
  const tier: number = typeof player.tier === "number" ? player.tier : 0;
  const coins: number = typeof player.coins === "number" ? player.coins : 0;
  const awareness: number = typeof lp.awareness === "number" ? lp.awareness : 0;
  const honesty: number = typeof lp.honesty === "number" ? lp.honesty : 0;

  const rawSuggestions: unknown[] = Array.isArray(lp.suggestions) ? lp.suggestions : [];
  const hints: string[] = [];
  for (const item of rawSuggestions) {
    const t = toText(item);
    if (t) hints.push(t);
    if (hints.length >= MAX_HINTS) break;
  }
  const themes = hints.slice(0, 3).join(" / ");

  // Этап 2 — «более полный Даймон»: grounded-контекст из позвоночника
  // вселенной (активная матрица -> стихия / полюс / лики 21 агента).
  // Advisory; при отсутствии ядра вернётся минимум, UI тихо откатится.
  const matrix = activeMatrix();
  const spine: DaimonSpine | null = React.useMemo(
    () => buildDaimonSpine({ awareness, honesty }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matrix, Math.round(awareness * 4), Math.round(honesty * 4)],
  );

  // State-signature: bucketed so small fluctuations don't re-trigger the model.
  // Includes the active matrix so switching lenses refreshes the Daimon's voice.
  const sig = [matrix, tier, Math.round(awareness * 4), Math.round(honesty * 4)].join("|");

  // Request a living line from the Daimon (DeepSeek via proxy). force=true rerolls.
  const requestLine = (force: boolean) => {
    const cacheKey = AI_CACHE_PREFIX + sig;
    if (!force) {
      try {
        const cached = window.localStorage.getItem(cacheKey);
        if (cached) {
          setAiLine(cached);
          setAiState("done");
          lastSigRef.current = sig;
          return;
        }
      } catch {
        /* ignore */
      }
    } else {
      try {
        window.localStorage.removeItem(cacheKey);
      } catch {
        /* ignore */
      }
    }
    setAiState("load");
    const spineText = spine ? spineToPrompt(spine) : "";
    const userContent =
      buildDaimonContext(tier, coins, awareness, honesty, themes) +
      (spineText ? "\n\n" + spineText : "");
    const msgs: AiMessage[] = [
      { role: "system", content: DAIMON_SYS },
      { role: "user", content: userContent },
    ];
    const sigAtCall = sig;
    aiChat(msgs, { temperature: force ? 0.95 : 0.85 }).then((txt) => {
      if (txt) {
        const line = cleanLine(txt);
        setAiLine(line);
        setAiState("done");
        lastSigRef.current = sigAtCall;
        try {
          window.localStorage.setItem(AI_CACHE_PREFIX + sigAtCall, line);
        } catch {
          /* ignore */
        }
      } else {
        setAiState("err");
      }
    });
  };

  // Fetch a living line on mount and whenever the state-signature changes.
  useEffect(() => {
    if (!enabled) return;
    if (lastSigRef.current === sig && aiLine) return;
    requestLine(false);
    // requestLine is stable enough for our purposes; deps kept minimal on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, enabled]);

  // No live suggestions yet -> gentle seed hints so the panel is never empty.
  const shown = hints.length > 0 ? hints : FALLBACK_HINTS.slice(0, 2);

  const showAi = aiState === "done" && !!aiLine;
  const showLoading = aiState === "load" && !aiLine;

  // Turned off -> minimal pill to switch hints back on.
  if (!enabled) {
    return (
      <div style={pillStyle} onClick={toggle} role="button" title={T_HINTS}>
        {T_PILL}
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={headRowStyle}>
          <span style={labelStyle}>{showAi || showLoading ? T_DAIMON : T_HINTS}</span>
          <span style={toggleOnStyle} onClick={toggle} role="button" title={T_HINTS}>
            {T_ON}
          </span>
        </div>

        {showAi ? (
          <>
            <span style={lineStyle}>
              <span style={dotStyle}>{DOT}</span>
              {aiLine}
            </span>
            {spine ? (
              <div style={spineStripStyle}>
                <span style={spineMatrixStyle}>
                  {spine.matrix}
                  {spine.element ? " " + DOT + " " + spine.element : ""}
                </span>
                {spine.toward ? (
                  <span style={spinePoleStyle}>
                    {ARROW} {spine.toward}
                  </span>
                ) : null}
                {spine.faces && spine.faces[0] ? (
                  <span style={spineFaceStyle}>
                    {spine.faces[0].agent}
                    {spine.faces[0].principle
                      ? " " + DOT + " " + spine.faces[0].principle
                      : ""}
                    {" \u2014 "}
                    {spine.faces[0].face}
                  </span>
                ) : null}
              </div>
            ) : null}
            <span
              style={refreshStyle}
              onClick={() => requestLine(true)}
              role="button"
              title={T_AGAIN}
            >
              {T_AGAIN_CHIP}
            </span>
          </>
        ) : showLoading ? (
          <span style={loadingLineStyle}>{T_LISTENING}</span>
        ) : (
          shown.map((h, i) => (
            <span key={i} style={lineStyle}>
              <span style={dotStyle}>{DOT}</span>
              {h}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default TigelHints;
