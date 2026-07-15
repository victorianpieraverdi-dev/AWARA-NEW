// AWARA — Светообмен (Light Exchange): поле резонанса и служения — НЕ рынок.
// Канон (game-space-changes.md §5.3): светообмен — это поле резонанса,
// служения и обмена возможностями, а не спекулятивная экономика. Игрок фиксирует
// пять вещей: что может предложить, что ищет, что строит, какой обмен готов
// нести и какое служение может проявить. Всё хранится локально (localStorage).

import * as React from "react";
import { useState, useEffect } from "react";
import { usePlayer } from "./PlayerProvider";

type FieldId = "offer" | "seek" | "build" | "exchange" | "service";

const FIELDS: { id: FieldId; label: string; placeholder: string }[] = [
  { id: "offer", label: "Что могу предложить", placeholder: "дары, навыки, свет…" },
  { id: "seek", label: "Что ищу", placeholder: "встречи, знания, поддержку…" },
  { id: "build", label: "Что строю", placeholder: "пространство, проект, храм…" },
  { id: "exchange", label: "Какой обмен готов нести", placeholder: "чем делюсь и что принимаю…" },
  { id: "service", label: "Какое служение проявить", placeholder: "вклад в общее поле…" },
];

const LS_KEY = "awara.lightexchange";

type ExchangeState = Record<FieldId, string>;
const EMPTY: ExchangeState = { offer: "", seek: "", build: "", exchange: "", service: "" };

function load(): ExchangeState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  return EMPTY;
}

export function LightExchange() {
  const { coins } = usePlayer();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExchangeState>(load);

  // Пишем в localStorage при каждом изменении — поле резонанса переживает перезагрузку.
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const filled = FIELDS.filter((f) => data[f.id].trim().length > 0).length;

  // Свёрнутое состояние — компактная «пилюля» в левом верхнем углу.
  if (!open) {
    return (
      <button style={tab} onClick={() => setOpen(true)} title="Светообмен — поле резонанса и служения (не рынок)">
        ⇄ Светообмен · {filled}/5
      </button>
    );
  }

  return (
    <div style={wrap}>
      <div style={head} onClick={() => setOpen(false)} title="Свернуть">
        Светообмен · {coins} ⬡ ▾
      </div>
      <div style={note} title="Канон: обмен светом осознанности и возможностями, а не торговля.">
        Поле резонанса и служения — обмен светом осознанности. Не рынок.
      </div>
      <div style={body}>
        {FIELDS.map((f) => (
          <label key={f.id} style={fieldWrap}>
            <span style={lbl}>{f.label}</span>
            <textarea
              style={area}
              rows={2}
              value={data[f.id]}
              placeholder={f.placeholder}
              onChange={(e) => setData((d) => ({ ...d, [f.id]: e.target.value }))}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  position: "fixed",
  left: 16,
  top: 16,
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  width: 234,
  maxHeight: "76vh",
  fontFamily: "system-ui, sans-serif",
  userSelect: "none",
};
const head: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: "#c9a84c",
  opacity: 0.85,
  marginBottom: 2,
  cursor: "pointer",
};
const tab: React.CSSProperties = {
  position: "fixed",
  left: 16,
  top: 16,
  zIndex: 50,
  padding: "7px 12px",
  borderRadius: 999,
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(8,8,14,0.7)",
  color: "#ffd27a",
  fontFamily: "system-ui, sans-serif",
  fontSize: 12,
  letterSpacing: 0.5,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  userSelect: "none",
};
const note: React.CSSProperties = {
  fontSize: 10,
  lineHeight: 1.3,
  color: "#ffd27a",
  opacity: 0.8,
  marginBottom: 2,
};
const body: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  overflowY: "auto",
  paddingRight: 4,
};
const fieldWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
};
const lbl: React.CSSProperties = {
  fontSize: 10,
  color: "#c9a84c",
  letterSpacing: 0.3,
};
const area: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(8,8,14,0.55)",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 8,
  color: "#e8e6df",
  font: "inherit",
  fontSize: 12,
  lineHeight: 1.35,
  padding: "6px 8px",
  resize: "vertical",
  outline: "none",
  backdropFilter: "blur(6px)",
  userSelect: "text",
};
