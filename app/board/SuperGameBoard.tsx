// AWARA -- SuperGameBoard: сцена "board" (Игра Мироздания / Супер-Игра).
//
// v2 -- ВЕРНЫЙ ПОРТ рабочего оригинала mandala-game.html: вся механика,
// отрисовка и DOM живут в js/superGameBoard.js (mountSuperGame -- портированная
// страница целиком, те же формулы/данные/поведение). Этот файл -- только
// React-обёртка: экран выбора матрица-карты (триггер "линза чёткости тира 4")
// и монтирование/размонтирование портированной доски.
//
// БАГФИКС "Запустить доску ничего не делала": раньше matrixSlugForLensName
// сравнивал имя линзы с name.ru каталога строго на равенство и молча выходил
// при несовпадении (slug=null -> return). Теперь матчинг нестрогий (см.
// js/superGameBoard.js), а если матрица всё равно не найдена -- доска
// запускается по имени линзы и игроку показывается сообщение, а не тишина.

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getEligibleMatrixCards,
  matrixSlugForLensName,
  listSavedBoards,
  mountSuperGame,
} from "../../js/superGameBoard.js";

type EligibleCard = { lensNameRu: string; uses: number; clarity: number };
type SavedBoard = { key: string; matrixSlug: string | null; lensNameRu: string | null; depth?: number; updatedAt?: number };
type ActiveBoard = { matrixSlug: string | null; lensNameRu: string | null };

const S: { [k: string]: React.CSSProperties } = {
  outer: {
    position: "absolute", inset: 0, overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.28), transparent 45%), linear-gradient(180deg,#070318 0%,#0d0626 55%,#05021a 100%)",
    color: "rgba(255,248,214,0.85)",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  inner: { maxWidth: "480px", margin: "0 auto", padding: "54px 16px 96px" },
  title: { textAlign: "center", color: "#c9a84c", letterSpacing: "0.16em", fontSize: "22px", fontWeight: 600, fontFamily: "'Cinzel', serif" },
  subtitle: { textAlign: "center", color: "rgba(255,255,255,0.34)", letterSpacing: "0.2em", fontSize: "9px", marginTop: "6px", marginBottom: "20px", fontFamily: "'JetBrains Mono', monospace" },
  card: {
    border: "1px solid rgba(201,168,76,0.20)", borderRadius: "14px",
    padding: "16px", marginBottom: "14px", background: "rgba(14,8,32,0.34)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 22px rgba(0,0,0,0.32)",
  },
  label: { fontSize: "9px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.6)", marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace" },
  row: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  btn: {
    border: "1px solid rgba(201,168,76,0.4)", borderRadius: "10px", padding: "10px 16px",
    background: "rgba(201,168,76,0.10)", color: "#ffd700", fontSize: "13px",
    letterSpacing: "0.06em", cursor: "pointer", fontFamily: "'Cinzel', serif",
  },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  empty: { fontSize: "13px", lineHeight: 1.6, color: "rgba(255,248,214,0.55)" },
  small: { fontSize: "10px", color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 },
  notice: { fontSize: "12px", lineHeight: 1.5, color: "#ffb86b", margin: "8px 0" },
};

function LensPicker(props: { cards: EligibleCard[]; onPick: (lensNameRu: string) => void; busy: boolean }) {
  if (!props.cards.length) {
    return (
      <div style={S.card}>
        <div style={S.label}>МАТРИЦА-КАРТЫ</div>
        <div style={S.empty}>
          Пока нет линз с чёткостью "Сияющая" (тир 4+). Проживай дни через линзы в Тигле --
          когда одна из них засияет, здесь появится картридж Супер-Игры для неё.
        </div>
      </div>
    );
  }
  return (
    <div style={S.card}>
      <div style={S.label}>МАТРИЦА-КАРТЫ · ГОТОВЫ К ЗАПУСКУ</div>
      {props.cards.map(function (c) {
        return (
          <div key={c.lensNameRu} style={S.row}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#ffd700", fontSize: "15px" }}>{c.lensNameRu}</div>
              <div style={S.small}>Сияющая · {c.uses} исп.</div>
            </div>
            <button
              type="button"
              style={Object.assign({}, S.btn, props.busy ? S.btnDisabled : {})}
              disabled={props.busy}
              onClick={function () { props.onPick(c.lensNameRu); }}
            >
              Запустить доску
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Портированная доска целиком: mountSuperGame рисует и ведёт всё сам.
function MountedBoard(props: { board: ActiveBoard; onBack: () => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(function () {
    const el = hostRef.current;
    if (!el) return;
    const inst = mountSuperGame(el, {
      matrixSlug: props.board.matrixSlug || undefined,
      lensNameRu: props.board.lensNameRu || undefined,
    });
    return function () { inst.destroy(); };
  }, [props.board.matrixSlug, props.board.lensNameRu]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <button
        type="button"
        aria-label="К списку досок"
        style={{
          position: "absolute", left: "12px", top: "12px", zIndex: 60,
          width: "36px", height: "36px", padding: 0, borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(201,168,76,0.4)", background: "rgba(8,5,18,0.85)",
          color: "#ffd700", fontSize: "16px", cursor: "pointer",
        }}
        onClick={props.onBack}
      >
        &#8592;
      </button>
    </div>
  );
}

export function SuperGameBoard() {
  const [cards, setCards] = useState<EligibleCard[]>([]);
  const [boards, setBoards] = useState<SavedBoard[]>([]);
  const [active, setActive] = useState<ActiveBoard | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(function () {
    try { setCards(getEligibleMatrixCards()); } catch (e) { setCards([]); }
    try { setBoards(listSavedBoards()); } catch (e) { setBoards([]); }
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  const onPickLens = useCallback(function (lensNameRu: string) {
    setBusy(true);
    setNotice(null);
    matrixSlugForLensName(lensNameRu)
      .then(function (slug: string | null) {
        if (!slug) {
          setNotice("Матрица для линзы «" + lensNameRu + "» не найдена в каталоге -- доска запущена по имени линзы.");
        }
        setActive({ matrixSlug: slug, lensNameRu: lensNameRu });
      })
      .catch(function (e: unknown) {
        // Раньше здесь была тишина -- теперь любая ошибка видна игроку.
        setNotice("Не удалось запустить доску: " + String((e as Error) && (e as Error).message || e));
      })
      .finally(function () { setBusy(false); });
  }, []);

  const onBack = useCallback(function () { setActive(null); refresh(); }, [refresh]);

  if (active) {
    return <MountedBoard board={active} onBack={onBack} />;
  }

  return (
    <div style={S.outer}>
      <div style={S.inner}>
        <div style={S.title}>ИГРА МИРОЗДАНИЯ</div>
        <div style={S.subtitle}>ЖИВАЯ МАНДАЛА ТИГЛЯ · ПЕРИФЕРИЯ &#8594; ЦЕНТР РА</div>
        {notice ? <div style={S.notice}>{notice}</div> : null}
        <LensPicker cards={cards} onPick={onPickLens} busy={busy} />
        {boards.length ? (
          <div style={S.card}>
            <div style={S.label}>АКТИВНЫЕ ДОСКИ</div>
            {boards.map(function (b) {
              return (
                <div key={b.key} style={S.row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#ffd700", fontSize: "14px" }}>{b.lensNameRu || b.matrixSlug || b.key}</div>
                    <div style={S.small}>{b.matrixSlug || ""} · заныриваний: {b.depth || 0}</div>
                  </div>
                  <button
                    type="button"
                    style={S.btn}
                    onClick={function () { setActive({ matrixSlug: b.matrixSlug, lensNameRu: b.lensNameRu }); }}
                  >
                    Продолжить
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SuperGameBoard;
