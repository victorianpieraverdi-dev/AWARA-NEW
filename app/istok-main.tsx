// React entry for the "Istok" screen (Block 0). When the entry dive completes,
// it mounts Block 1 (Macrocosm / personal toroidal universe) via onEnter -- no reload.

import * as React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import EntryScreen from "./entry/EntryScreen";
import Macrocosm from "./macrocosm/Macrocosm";
import EggHub from "./macrocosm/EggHub";
import { PlayerProvider, usePlayer } from "./PlayerProvider";
import { TierLadder } from "./TierLadder";
import { T5Creator } from "./T5Creator";
import { TigelGlow } from "./TigelGlow";
import { TigelHints } from "./TigelHints";
import { HubZonesAura } from "./HubZonesAura";
import { SoulSpace } from "./soul/SoulSpace";
import { DaimonSpace } from "./daimon/DaimonSpace";
import { SuperGameBoard } from "./board/SuperGameBoard";
import { startTigelStateSync } from "./tigelStateSync";
import { startTigelLevelFlow } from "./tigelLevelFlow";
// Tigel spine (side-effect imports): light-core sets window.AwaraLight, then the
// bridge sets window.AwaraTigelBridge. Order matters (core before bridge). This
// makes live advisory light/suggestions available to TigelGlow / TigelHints.
import "../js/light-core.js";
import "../js/tigelBridge.js";

// Лаунчер Души (нижний левый угол) — гласс-кнопка, в стиле хаба.
const launcherStyle: React.CSSProperties = {
  position: "fixed",
  left: "16px",
  bottom: "18px",
  zIndex: 45,
  padding: "9px 16px",
  borderRadius: "12px",
  background: "rgba(18,16,28,0.5)",
  border: "1px solid rgba(201,168,76,0.35)",
  color: "#e6e1f2",
  fontFamily: "inherit",
  fontSize: "12px",
  letterSpacing: "0.08em",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

function SoulLauncher(props: { onOpen: () => void }) {
  return (
    <button type="button" style={launcherStyle} onClick={props.onOpen}>
      {"\u2726 \u0414\u0443\u0448\u0430"}
    </button>
  );
}

// Полноэкранный оверлей с встроенной «Душой v2» (1в1).
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  background: "#05040a",
};

const closeBtnStyle: React.CSSProperties = {
  position: "fixed",
  right: "16px",
  top: "14px",
  zIndex: 62,
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  background: "rgba(18,16,28,0.6)",
  border: "1px solid rgba(201,168,76,0.35)",
  color: "#e6e1f2",
  fontSize: "16px",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

// \u2500\u2500\u2500\u2500\u2500 \u0415\u0414\u0418\u041d\u042b\u0419 \u041f\u0415\u0420\u0415\u041a\u041b\u042e\u0427\u0410\u0422\u0415\u041b\u042c \u0412\u0418\u0414\u041e\u0412 (\u0441\u0446\u0435\u043d). \u041e\u0434\u043d\u0430 \u0434\u0432\u0435\u0440\u044c \u044f\u0439\u0446\u0430 = \u043e\u0434\u043d\u0430 \u0441\u0446\u0435\u043d\u0430-\u043e\u0432\u0435\u0440\u043b\u0435\u0439.
// \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u0446\u0435\u043d\u0443: 1) id \u0432 SceneView; 2) \u043e\u0442\u0440\u0438\u0441\u0443\u0439 \u0432 renderSceneContent;
// 3) \u043d\u0430 \u044f\u0439\u0446\u0435 \u0432\u044b\u0437\u043e\u0432\u0438 openView("<id>"). \u0411\u0435\u0437 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u044b\u0445 \u0441\u0442\u0440\u0430\u043d\u0438\u0446.
type SceneView = "soul" | "cosmos" | "daymon" | "hronika" | "board" | "vastu" | "energo";

const SCENE_TITLES: Record<SceneView, string> = {
  soul: "\u0414\u0443\u0448\u0430",
  cosmos: "\u041a\u043e\u0441\u043c\u043e\u0441",
  daymon: "\u0414\u0430\u0439\u043c\u043e\u043d",
  hronika: "\u0425\u0440\u043e\u043d\u0438\u043a\u0430",
  board: "\u041d\u0430\u0441\u0442\u043e\u043b\u044c\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u0430",
  vastu: "\u0417\u0432\u0451\u0437\u0434\u043d\u044b\u0439 \u0445\u0440\u0430\u043c \u0412\u0430\u0441\u0442\u0443",
  energo: "\u041b\u043e\u043a\u0430\u0446\u0438\u0438 \u044d\u043d\u0435\u0440\u0433\u043e-\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440",
};

// \u0425\u0435\u043b\u043f\u0435\u0440\u044b: \u043e\u0442\u043a\u0440\u044b\u0442\u044c/\u0437\u0430\u043a\u0440\u044b\u0442\u044c \u043b\u044e\u0431\u0443\u044e \u0441\u0446\u0435\u043d\u0443 \u0438\u0437 \u043b\u044e\u0431\u043e\u0433\u043e \u043c\u0435\u0441\u0442\u0430 (\u043d\u0430\u043f\u0440. \u0441 \u0434\u0432\u0435\u0440\u0438 \u044f\u0439\u0446\u0430).
export function openView(view: SceneView) {
  try { window.dispatchEvent(new CustomEvent("awara:open-view", { detail: { view: view } })); } catch (e) { /* noop */ }
}
export function closeView() {
  try { window.dispatchEvent(new CustomEvent("awara:close-view")); } catch (e) { /* noop */ }
}

// \u0417\u0430\u0433\u043b\u0443\u0448\u043a\u0430 \u0434\u043b\u044f \u0441\u0446\u0435\u043d, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0435\u0449\u0451 \u043d\u0435 \u043d\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b (\u0414\u0430\u0439\u043c\u043e\u043d/\u0425\u0440\u043e\u043d\u0438\u043a\u0430/\u041d\u0430\u0441\u0442\u043e\u043b\u043a\u0430).
const placeholderWrap: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  background: "radial-gradient(120% 90% at 50% 30%, rgba(40,34,66,0.55), rgba(5,4,12,0.98) 70%)",
  color: "#e6e1f2",
  fontFamily: "inherit",
};
const placeholderTitle: React.CSSProperties = { fontSize: "26px", fontWeight: 600, letterSpacing: "0.08em", textShadow: "0 0 26px rgba(170,150,255,0.5)" };
const placeholderSub: React.CSSProperties = { fontSize: "12px", letterSpacing: "0.22em", color: "rgba(210,202,236,0.55)" };
const placeholderHint: React.CSSProperties = { marginTop: "8px", maxWidth: "360px", textAlign: "center", fontSize: "12.5px", lineHeight: 1.6, color: "rgba(214,206,238,0.7)" };

function ScenePlaceholder(props: { view: SceneView }) {
  return (
    <div style={placeholderWrap}>
      <div style={placeholderTitle}>{SCENE_TITLES[props.view]}</div>
      <div style={placeholderSub}>{"\u0421\u0426\u0415\u041d\u0410 \u0412 \u0420\u0410\u0417\u0412\u0418\u0422\u0418\u0418"}</div>
      <div style={placeholderHint}>{"\u0417\u0434\u0435\u0441\u044c \u0432\u044b\u0440\u0430\u0441\u0442\u0435\u0442 \u0441\u0432\u043e\u044f \u043c\u043d\u043e\u0433\u043e\u044f\u0440\u0443\u0441\u043d\u0430\u044f \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u2014 \u043a\u0430\u043a \u0441\u0444\u0435\u0440\u044b \u0432 \u0414\u0443\u0448\u0435. \u0415\u0434\u0438\u043d\u044b\u0439 \u0441\u0432\u0435\u0442 \u0443\u0436\u0435 \u043f\u0438\u0442\u0430\u0435\u0442 \u044d\u0442\u0443 \u0441\u0446\u0435\u043d\u0443."}</div>
    </div>
  );
}

// \u0427\u0442\u043e \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0434\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0439 \u0441\u0446\u0435\u043d\u044b. \u0414\u0443\u0448\u0430/\u041a\u043e\u0441\u043c\u043e\u0441 \u2014 \u043a\u0430\u043a \u0440\u0430\u043d\u044c\u0448\u0435,
// \u043d\u043e\u0432\u044b\u0435 \u0441\u0446\u0435\u043d\u044b \u043f\u043e\u043a\u0430 \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u0433\u043b\u0443\u0448\u043a\u0443 (\u043b\u0435\u0433\u043a\u043e \u0437\u0430\u043c\u0435\u043d\u0438\u0442\u044c \u043d\u0430 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442).
function renderSceneContent(view: SceneView, seed: number): React.ReactNode {
  if (view === "soul") return <SoulSpace />;
  if (view === "daymon") return <DaimonSpace />;
  if (view === "board") return <SuperGameBoard />;
  if (view === "cosmos") {
    return (
      <div className="scene-tier">
        <div className="scene-color">
          <TigelGlow>
            <Macrocosm seed={seed} />
          </TigelGlow>
        </div>
      </div>
    );
  }
  return <ScenePlaceholder view={view} />;
}

// \u0415\u0434\u0438\u043d\u044b\u0439 \u043e\u0432\u0435\u0440\u043b\u0435\u0439-\u043e\u0431\u0451\u0440\u0442\u043a\u0430 \u0434\u043b\u044f \u041b\u042e\u0411\u041e\u0419 \u0441\u0446\u0435\u043d\u044b: \u043f\u043b\u0430\u0432\u043d\u043e\u0435 \u043f\u043e\u044f\u0432\u043b\u0435\u043d\u0438\u0435 + \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u043d\u0430\u0437\u0430\u0434\u00bb.
function SceneOverlay(props: { onClose: () => void; children: React.ReactNode }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const contentStyle: React.CSSProperties = { position: "absolute", inset: 0, opacity: vis ? 1 : 0, transition: "opacity 0.45s ease" };
  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>{props.children}</div>
      <button type="button" style={closeBtnStyle} onClick={props.onClose} title={"\u041d\u0430\u0437\u0430\u0434 (Esc)"}>
        {"\u2715"}
      </button>
    </div>
  );
}

function App() {
  const [entered, setEntered] = useState(() => new URLSearchParams(window.location.search).has('direct'));
  const [hubOpen, setHubOpen] = useState(false);
  // Единый переключатель сцен: null = яйцо-меню, иначе активная сцена-оверлей.
  const [view, setView] = useState<SceneView | null>(null);
  const sceneOpen = view !== null;
  // Активная вселенная (мультивселенная) задаёт seed — у каждой своя форма/туманность.
  const { activeUniverseSeed } = usePlayer();

  // Открытие Души: по кастомному событию awara:open-soul (чтобы аура зон
  // или любой код могли позвать экран), Esc — закрыть. Компас, не рельсы.
  useEffect(() => {
    const onHubOpen = () => setHubOpen(true);
    const onHubClose = () => setHubOpen(false);
    window.addEventListener("awara:hub-open", onHubOpen);
    window.addEventListener("awara:hub-close", onHubClose);
    return () => {
      window.removeEventListener("awara:hub-open", onHubOpen);
      window.removeEventListener("awara:hub-close", onHubClose);
    };
  }, []);

  useEffect(() => {
    const openSoul = () => setView("soul");
    // → (вправо) из Души — назад в Яйцо; ↑ (вверх) — космос игрока.
    const closeSoul = () => setView((v) => (v === "soul" ? null : v));
    const openCosmos = () => setView("cosmos");
    // Обобщённое открытие любой сцены: awara:open-view { detail: { view } }.
    const onOpenView = (e: Event) => {
      const v = (e as CustomEvent).detail && (e as CustomEvent).detail.view;
      if (v) setView(v as SceneView);
    };
    const onCloseView = () => setView(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setView(null); };
    window.addEventListener("awara:open-soul", openSoul as EventListener);
    window.addEventListener("awara:soul-close", closeSoul as EventListener);
    window.addEventListener("awara:open-cosmos", openCosmos as EventListener);
    window.addEventListener("awara:open-view", onOpenView as EventListener);
    window.addEventListener("awara:close-view", onCloseView as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("awara:open-soul", openSoul as EventListener);
      window.removeEventListener("awara:soul-close", closeSoul as EventListener);
      window.removeEventListener("awara:open-cosmos", openCosmos as EventListener);
      window.removeEventListener("awara:open-view", onOpenView as EventListener);
      window.removeEventListener("awara:close-view", onCloseView as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Этап 1.5 — связка состояний: прогресс прототипа Тигля (tigel_v1) питает
  // живой свет istok (awareness/honesty -> свечение и подсказки Даймона).
  // Advisory; запускается один раз, чистится при размонтировании.
  useEffect(() => startTigelStateSync(), []);
  // Этап 2 — перетекание уровня: матрица + уровень из Тигля созревают 7->21
  // дней и распределяются по окнам игры (advisory; запуск один раз).
  useEffect(() => startTigelLevelFlow(), []);
  // Screen 0 runs out-of-the-box with the procedural nebula. For the reference
  // look, drop concept art at /public/assets/nebula.webp and pass
  // nebulaUrl="/assets/nebula2.webp" to <EntryScreen/>.
  // totalLight on <Macrocosm/> later wires to the player's accumulated Light.
  return entered ? (
    <>
      {/* Вселенная временно отключена ЗДЕСЬ. Её "назначим в другое место" --
         позже подвесим этот блок на одну из дверей яйца. Чтобы вернуть
         сразу: замените false на true. */}
      {false && (
        <div className="scene-tier">
          <div className="scene-color">
            <TigelGlow>
              <Macrocosm seed={activeUniverseSeed} />
            </TigelGlow>
          </div>
        </div>
      )}
      {/* Первый экран (Искра) ведёт сразу в меню-яйцо. Пока открыта Душа --
         яйцо снимается, чтобы её полноэкранный оверлей был виден. */}
      {!sceneOpen && <EggHub lang="ru" onClose={() => setEntered(false)} />}
      {!hubOpen && !sceneOpen && <TierLadder />}
      {!hubOpen && !sceneOpen && <T5Creator />}
      {!hubOpen && !sceneOpen && <TigelHints />}
      {!hubOpen && !sceneOpen && <HubZonesAura />}
      {!hubOpen && !sceneOpen && <SoulLauncher onOpen={() => setView("soul")} />}
      {sceneOpen ? <SceneOverlay onClose={() => setView(null)}>{renderSceneContent(view as SceneView, activeUniverseSeed)}</SceneOverlay> : null}
    </>
  ) : (
    <EntryScreen nebulaUrl="/assets/nebula2.webp" onEnter={() => setEntered(true)} />
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <PlayerProvider>
      <App />
    </PlayerProvider>
  );
}
