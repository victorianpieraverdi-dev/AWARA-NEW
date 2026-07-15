// AWARA — T5 "Источник силы / Творец связей" (Шаг 3 UI).
// На T5 игрок создаёт источники силы (солнце/созвездие), привязанные к одному из
// 21 агента и одной из 14 лок, и протягивает тонкие связи между планами
// (материя ↔ локи ↔ человек, мосты между вселенными). Стоимость — в свободном
// свете (тапасе): вложенный свет запирается в связи, ступени T0..T5 не падают.
// Появляется с T1 и раскрывается ступенями до T5. Стиль повторяет TierLadder.

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./PlayerProvider";
import { TG, glassPanel, glassPill } from "./tigelGlass";
import {
  SOURCE_FORM_COST_COINS,
  SPIRIT_COST_COINS,
  SPIRIT_WORLDS,
  agentLinkCostCoins,
  lokaLinkCostCoins,
  HUMAN_LINK_COST_COINS,
  UNIVERSE_LINK_COST_COINS,
  OUTER_COSMOS_COST_COINS,
  type PowerSourceForm,
  type SpiritKind,
  type SpiritWorld,
  type CathedralPattern,
  type LinkTargetKind,
  type OuterCosmosKind,
} from "../core/types";
import agentsData from "../data/agents.json";
import vedicData from "../data/vedic_loka.json";

interface AgentRow {
  id: number;
  name: string;
  element: string;
}
interface LokaRow {
  id: number;
  name: string;
  color: string;
  tier: string;
}

const AGENTS = agentsData as AgentRow[];
const LOKAS = (vedicData as { lokas: LokaRow[] }).lokas;

// Слияние стилей без инлайн-литералов (избегаем двойных фигурных скобок в JSX).
const cx = (
  ...parts: Array<React.CSSProperties | false | null | undefined>
): React.CSSProperties => Object.assign({}, ...parts.filter(Boolean));

const FORM_LABEL: Record<PowerSourceForm, string> = {
  sun: "☀ Солнце",
  constellation: "✦ Созвездие",
  spirit: "✷ Дух",
};

const SPIRIT_KINDS: SpiritKind[] = ["planetary", "household", "unified"];

const SPIRIT_KIND_LABEL: Record<SpiritKind, string> = {
  planetary: "🪐 Планетарный",
  household: "🏠 Бытовой",
  unified: "✺ Дух Единого",
};

const SPIRIT_KIND_COLOR: Record<SpiritKind, string> = {
  planetary: "#5ab0ff",
  household: "#9ec45a",
  unified: "#e6d8ff",
};

const CATHEDRAL_PATTERNS: CathedralPattern[] = [
  "mandala",
  "ring",
  "flower",
  "star",
];

const PATTERN_LABEL: Record<CathedralPattern, string> = {
  mandala: "✺ Мандала",
  ring: "◯ Кольцо",
  flower: "✿ Цветок",
  star: "✦ Звезда",
};

const OUTER_COSMOS_KINDS: OuterCosmosKind[] = ["creator", "lightmaker"];

const OUTER_COSMOS_SUMMON: Record<OuterCosmosKind, string> = {
  creator: "🌌 Призвать Творца",
  lightmaker: "✨ Призвать Свет Созидания",
};

const OUTER_COSMOS_COLOR: Record<OuterCosmosKind, string> = {
  creator: "#b58cff",
  lightmaker: "#ffe9a8",
};

function linkLabel(kind: LinkTargetKind, idx: number): string {
  if (kind === "agent") return `Агент · ${AGENTS[idx]?.name ?? idx + 1}`;
  if (kind === "loka") return `Лока · ${LOKAS[idx]?.name ?? idx + 1}`;
  if (kind === "human") return "Человек (вниз)";
  return "Другая вселенная";
}

function linkCostCoins(kind: LinkTargetKind, idx: number): number {
  if (kind === "agent") return agentLinkCostCoins(idx);
  if (kind === "loka") return lokaLinkCostCoins(idx);
  if (kind === "human") return HUMAN_LINK_COST_COINS;
  return UNIVERSE_LINK_COST_COINS;
}

// ── Лестница раскрытия Творца (T1 → T5) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n// Связь вселенной игрока с тонкими планами растёт ступенями. Локи открываются\n// СНИЗУ ВВЕРХ: на T1 — Земля (Бхур) и семь низших миров; выше — высшие локи.
const L_T1 = [6, 7, 8, 9, 10, 11, 12, 13];
const L_T2 = [5, ...L_T1];
const L_T3 = [3, 4, ...L_T2];
const L_T4 = [1, 2, ...L_T3];
const L_T5 = [0, ...L_T4];

interface CreatorCaps {
  forms: PowerSourceForm[];
  spiritKinds: SpiritKind[];
  maxSources: number;
  agentSlots: number;
  lokaIndices: number[];
  linkKinds: LinkTargetKind[];
  maxLinks: number;
  unions: boolean;
  patterns: CathedralPattern[];
  maxCathedrals: number;
  note: string;
}

// Возможности растут ×3 на ступень — как и порог света (RENDER_TIER_COINS).
// T1 даёт полный выбор цели связи (лока/агент/человек/вселенная), но малый объём.
const CREATOR_CAPS: Record<number, CreatorCaps> = {
  1: { forms: ["spirit"], spiritKinds: SPIRIT_KINDS, maxSources: 3, agentSlots: 5, lokaIndices: L_T1, linkKinds: ["loka", "agent", "human", "universe"], maxLinks: 5, unions: false, patterns: [], maxCathedrals: 0, note: "первое движение — до ~6 света: дух, агент, лока, человек и вселенная." },
  2: { forms: ["sun", "spirit"], spiritKinds: SPIRIT_KINDS, maxSources: 9, agentSlots: 15, lokaIndices: L_T2, linkKinds: ["loka", "agent", "human", "universe"], maxLinks: 15, unions: false, patterns: [], maxCathedrals: 0, note: "втрое больше света — рождаются солнца." },
  3: { forms: ["sun", "constellation", "spirit"], spiritKinds: SPIRIT_KINDS, maxSources: 27, agentSlots: 21, lokaIndices: L_T3, linkKinds: ["loka", "agent", "human", "universe"], maxLinks: 45, unions: false, patterns: [], maxCathedrals: 0, note: "ещё втрое — созвездия и дальние локи." },
  4: { forms: ["sun", "constellation", "spirit"], spiritKinds: SPIRIT_KINDS, maxSources: 81, agentSlots: 21, lokaIndices: L_T4, linkKinds: ["loka", "agent", "human", "universe"], maxLinks: 135, unions: true, patterns: ["mandala", "ring"], maxCathedrals: 6, note: "ещё втрое — силы объединяются в первые соборы." },
  5: { forms: ["sun", "constellation", "spirit"], spiritKinds: SPIRIT_KINDS, maxSources: 999, agentSlots: 21, lokaIndices: L_T5, linkKinds: ["loka", "agent", "human", "universe"], maxLinks: 999, unions: true, patterns: CATHEDRAL_PATTERNS, maxCathedrals: 999, note: "полный свет Творца — без границ." },
};

function creatorCaps(tier: number): CreatorCaps {
  return CREATOR_CAPS[Math.max(1, Math.min(5, tier))];
}

export function T5Creator({ forceVisible = false, collapseSignal = 0 }: { forceVisible?: boolean; collapseSignal?: number } = {}) {
  const {
    tier,
    freeCoins,
    player,
    createPowerSource,
    createSubtleLink,
    severLink,
    removePowerSource,
    createCathedral,
    removeCathedral,
    createOuterCosmos,
    removeOuterCosmos,
    universes,
    activeUniverseId,
    universeMax,
    newUniverseCostCoins,
    createUniverse,
    switchUniverse,
    removeUniverse,
  } = usePlayer();

  const [open, setOpen] = useState(false); // по умолчанию свёрнуто — не загораживает вселенную
  // Сворачиваемся при переходе между вселенными / окнами (сигнал растёт в Macrocosm).
  const firstCollapse = useRef(true);
  useEffect(() => {
    if (firstCollapse.current) { firstCollapse.current = false; return; }
    setOpen(false);
  }, [collapseSignal]);
  const [form, setForm] = useState<PowerSourceForm>("sun");
  const [agentIdx, setAgentIdx] = useState(0);
  const [lokaIdx, setLokaIdx] = useState(0);
  const [spiritKind, setSpiritKind] = useState<SpiritKind>("planetary");
  const [world, setWorld] = useState<SpiritWorld>(7);
  const [linkKind, setLinkKind] = useState<LinkTargetKind>("loka");
  const [linkIdx, setLinkIdx] = useState(0);
  const [cathName, setCathName] = useState("");
  const [cathPattern, setCathPattern] = useState<CathedralPattern>("mandala");
  const [cathMembers, setCathMembers] = useState<string[]>([]);
  const [newUniName, setNewUniName] = useState("");

  // forceVisible: временный обход гейта — показывать панель на экране вселенной даже на T0 (потом убрать).
  if (tier < 1 && !forceVisible) return null;

  const caps = creatorCaps(tier);
  const agentSlots = Math.min(caps.agentSlots, AGENTS.length);
  // Разнообразим агентов: равномерный срез по всему списку, а не первые N подряд.
  const agentChoices = Array.from({ length: agentSlots }, (_, n) =>
    Math.floor((n * AGENTS.length) / agentSlots),
  );

  const sources = player.powerSources ?? [];
  const links = player.subtleLinks ?? [];
  const cathedrals = player.cathedrals ?? [];
  const cosmoses = player.outerCosmoses ?? [];

  // Валидируем выбор под возможности текущего тира.
  const vForm = caps.forms.includes(form) ? form : caps.forms[0];
  const isSpirit = vForm === "spirit";
  const vKind = caps.spiritKinds.includes(spiritKind) ? spiritKind : caps.spiritKinds[0];
  const vAgentIdx = agentChoices.includes(agentIdx) ? agentIdx : agentChoices[0];
  const vLokaIdx = caps.lokaIndices.includes(lokaIdx) ? lokaIdx : caps.lokaIndices[0];
  const vPattern = caps.patterns.includes(cathPattern) ? cathPattern : caps.patterns[0] ?? "mandala";

  const sourceCost = isSpirit
    ? SPIRIT_COST_COINS[vKind]
    : SOURCE_FORM_COST_COINS[vForm];
  const atSourceLimit = sources.length >= caps.maxSources;
  const canSource = freeCoins >= sourceCost && !atSourceLimit;

  const toggleMember = (id: string) =>
    setCathMembers((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id],
    );

  const vLinkKind = caps.linkKinds.includes(linkKind) ? linkKind : caps.linkKinds[0];
  const needsTarget = vLinkKind === "agent" || vLinkKind === "loka";
  const linkTargets =
    vLinkKind === "agent"
      ? agentChoices
      : vLinkKind === "loka"
        ? caps.lokaIndices
        : [];
  const vLinkIdx = linkTargets.includes(linkIdx) ? linkIdx : linkTargets[0] ?? 0;

  const lCost = linkCostCoins(vLinkKind, vLinkIdx);
  const atLinkLimit = links.length >= caps.maxLinks;
  const canLink = freeCoins >= lCost && !atLinkLimit;

  const atCathLimit = cathedrals.length >= caps.maxCathedrals;

  // Свёрнутое состояние — компактная «пилюля» в правом верхнем углу.
  if (!open) {
    return (
      <button style={tab} onClick={() => setOpen(true)} title="Развернуть Творца">
        ✦ Творец · T{tier}
      </button>
    );
  }

  return (
    <div style={wrap}>
      <div style={head} onClick={() => setOpen(false)} title="Свернуть">
        <span>✦ Творец · T{tier} ▾</span>
        <span style={freeTag}>{freeCoins} ⬡ свободно</span>
      </div>

      {open && (
        <div style={body}>
          <div style={hint}>Ступень T{tier}: {caps.note}</div>
          <div style={sectionTitle}>Форма сознания</div>
          <div style={rowWrap}>
            {caps.forms.map((f) => (
              <button key={f} style={cx(chip, vForm === f && chipOn)} onClick={() => setForm(f)}>
                {FORM_LABEL[f]}
              </button>
            ))}
          </div>
          <div style={lbl}>☀ Солнце · ✦ созвездие · ✷ дух — всё это формы сознания.</div>
          {isSpirit ? (
            <>
              <label style={lbl}>Вид духа</label>
              <div style={rowWrap}>
                {SPIRIT_KINDS.map((k) => (
                  <button
                    key={k}
                    style={cx(
                      chip,
                      spiritKind === k && chipOn,
                      spiritKind === k && {
                        borderColor: SPIRIT_KIND_COLOR[k],
                        color: SPIRIT_KIND_COLOR[k],
                      },
                    )}
                    onClick={() => setSpiritKind(k)}
                  >
                    {SPIRIT_KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              <label style={lbl}>Мира духа</label>
              <select
                style={sel}
                value={world}
                onChange={(e) => setWorld(Number(e.target.value) as SpiritWorld)}
              >
                {SPIRIT_WORLDS.map((w) => (
                  <option key={w} value={w}>
                    Дух {w}-й миры · М{w}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label style={lbl}>Агент-покровитель</label>
              <select style={sel} value={vAgentIdx} onChange={(e) => setAgentIdx(Number(e.target.value))}>
                {agentChoices.map((ai) => (
                  <option key={AGENTS[ai].id} value={ai}>
                    {AGENTS[ai].name} · {AGENTS[ai].element}
                  </option>
                ))}
              </select>
              <label style={lbl}>Лока резонанса</label>
              <select style={sel} value={vLokaIdx} onChange={(e) => setLokaIdx(Number(e.target.value))}>
                {caps.lokaIndices.map((li) => (
                  <option key={li} value={li}>
                    {LOKAS[li].name}
                  </option>
                ))}
              </select>
            </>
          )}
          {atSourceLimit && (
            <div style={hint}>Лимит источников на T{tier}: {caps.maxSources}. Поднимите ступень.</div>
          )}
          <button
            style={cx(act, !canSource && actOff)}
            disabled={!canSource}
            onClick={() =>
              isSpirit
                ? createPowerSource("spirit", 0, 0, undefined, {
                    spiritKind: vKind,
                    worldIndex: world,
                  })
                : createPowerSource(vForm, vAgentIdx, vLokaIdx)
            }
          >
            {isSpirit ? "Призвать" : "Создать"} · {sourceCost} ⬡
          </button>

          {sources.length > 0 && (
            <div style={list}>
              {sources.map((s) => {
                const a = AGENTS[s.agentIndex];
                const l = LOKAS[s.lokaIndex];
                const sp = s.form === "spirit";
                const spColor = sp
                  ? SPIRIT_KIND_COLOR[s.spiritKind ?? "planetary"]
                  : l?.color ?? "#ffd27a";
                const icon =
                  s.form === "sun" ? "☀" : s.form === "constellation" ? "✦" : "✷";
                const text = sp
                  ? `${SPIRIT_KIND_LABEL[s.spiritKind ?? "planetary"]} · ${s.worldIndex ?? 7}-я мира`
                  : `${a?.name ?? ""} · ${l?.name ?? ""}`;
                return (
                  <div key={s.id} style={item}>
                    <span style={cx(itemLabel, { color: spColor })}>
                      {icon} {text}
                    </span>
                    <button style={del} onClick={() => removePowerSource(s.id)}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={divider} />

          <div style={sectionTitle}>Тонкая связь</div>
          <div style={rowWrap}>
            {caps.linkKinds.map((k) => (
              <button
                key={k}
                style={cx(chip, vLinkKind === k && chipOn)}
                onClick={() => {
                  setLinkKind(k);
                  setLinkIdx(0);
                }}
              >
                {k === "loka"
                  ? "Лока ↑"
                  : k === "agent"
                    ? "Агент"
                    : k === "human"
                      ? "Человек ↓"
                      : "Вселенная"}
              </button>
            ))}
          </div>
          {needsTarget && (
            <select style={sel} value={vLinkIdx} onChange={(e) => setLinkIdx(Number(e.target.value))}>
              {linkTargets.map((i) => (
                <option key={i} value={i}>
                  {vLinkKind === "agent" ? AGENTS[i].name : LOKAS[i].name}
                </option>
              ))}
            </select>
          )}
          {atLinkLimit && (
            <div style={hint}>Лимит связей на T{tier}: {caps.maxLinks}.</div>
          )}
          <button
            style={cx(act, !canLink && actOff)}
            disabled={!canLink}
            onClick={() => {
              const from = "material" as const;
              const to =
                vLinkKind === "human"
                  ? "human"
                  : vLinkKind === "universe"
                    ? "material"
                    : "subtle";
              createSubtleLink(vLinkKind, needsTarget ? vLinkIdx : -1, from, to);
            }}
          >
            Протянуть · {lCost} ⬡
          </button>

          {links.length > 0 && (
            <div style={list}>
              {links.map((ln) => (
                <div key={ln.id} style={item}>
                  <span>{linkLabel(ln.targetKind, ln.targetIndex)}</span>
                  <button style={del} onClick={() => severLink(ln.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={divider} />

          {caps.unions ? (
            <>
          <div style={sectionTitle}>Соборы · космические объединения</div>
          <input
            style={sel}
            placeholder="Название собора"
            value={cathName}
            onChange={(e) => setCathName(e.target.value)}
          />
          <div style={rowWrap}>
            {caps.patterns.map((p) => (
              <button
                key={p}
                style={cx(chip, vPattern === p && chipOn)}
                onClick={() => setCathPattern(p)}
              >
                {PATTERN_LABEL[p]}
              </button>
            ))}
          </div>
          {sources.length === 0 ? (
            <div style={hint}>Сначала создайте источники силы или духов.</div>
          ) : (
            <div style={list}>
              {sources.map((s) => {
                const on = cathMembers.includes(s.id);
                const icon =
                  s.form === "sun" ? "☀" : s.form === "constellation" ? "✦" : "✷";
                const text =
                  s.form === "spirit"
                    ? `${SPIRIT_KIND_LABEL[s.spiritKind ?? "planetary"]} · ${s.worldIndex ?? 7}-я`
                    : `${AGENTS[s.agentIndex]?.name ?? ""} · ${LOKAS[s.lokaIndex]?.name ?? ""}`;
                return (
                  <button
                    key={s.id}
                    style={cx(memberChip, on && memberChipOn)}
                    onClick={() => toggleMember(s.id)}
                  >
                    <span style={itemLabel}>
                      {on ? "◉" : "○"} {icon} {text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {atCathLimit && (
            <div style={hint}>Лимит соборов на T{tier}: {caps.maxCathedrals}.</div>
          )}
          <button
            style={cx(act, (cathMembers.length < 2 || atCathLimit) && actOff)}
            disabled={cathMembers.length < 2 || atCathLimit}
            onClick={() => {
              createCathedral(cathName, vPattern, cathMembers);
              setCathName("");
              setCathMembers([]);
            }}
          >
            Возвести собор · {cathMembers.length} сил
          </button>

          {cathedrals.length > 0 && (
            <div style={list}>
              {cathedrals.map((c) => (
                <div key={c.id} style={item}>
                  <span style={itemLabel}>
                    {PATTERN_LABEL[c.pattern]} {c.name} · {c.memberIds.length}
                  </span>
                  <button style={del} onClick={() => removeCathedral(c.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
            </>
          ) : (
            <>
              <div style={sectionTitle}>Соборы · космические объединения</div>
              <div style={hint}>Объединение сил откроется на T4. Сейчас копите источники и связи.</div>
            </>
          )}

          <div style={divider} />

          <div style={sectionTitle}>Высшее творение · за пределами вселенной</div>
          {tier >= 5 ? (
            <>
              <div style={hint}>
                Безмерные космосы-сферы за гранью нашей вселенной. Влияют сразу на
                все Меры и медленно вращаются вокруг всего космоса.
              </div>
              <div style={rowWrap}>
                {OUTER_COSMOS_KINDS.map((k) => {
                  const cost = OUTER_COSMOS_COST_COINS[k];
                  const can = freeCoins >= cost;
                  return (
                    <button
                      key={k}
                      style={cx(
                        act,
                        !can && actOff,
                        can && {
                          borderColor: OUTER_COSMOS_COLOR[k],
                          color: OUTER_COSMOS_COLOR[k],
                        },
                      )}
                      disabled={!can}
                      onClick={() => createOuterCosmos(k)}
                    >
                      {OUTER_COSMOS_SUMMON[k]} · {cost} ⬡
                    </button>
                  );
                })}
              </div>
              {cosmoses.length > 0 && (
                <div style={list}>
                  {cosmoses.map((c) => (
                    <div key={c.id} style={item}>
                      <span style={cx(itemLabel, { color: OUTER_COSMOS_COLOR[c.kind] })}>
                        {OUTER_COSMOS_SUMMON[c.kind]}
                      </span>
                      <button style={del} onClick={() => removeOuterCosmos(c.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={hint}>Высшее творение откроется на T5 — полном свете Творца.</div>
          )}

          <div style={divider} />

          <div style={sectionTitle}>Вселенные · мультивселенная</div>
          {universes.length > 0 && (
            <div style={list}>
              {universes.map((u, i) => {
                const on = u.id === activeUniverseId;
                return (
                  <div key={u.id} style={cx(item, on && memberChipOn)}>
                    <button
                      style={cx(itemLabel, {
                        border: "none",
                        background: "transparent",
                        color: on ? "#ffd27a" : "#e8e6df",
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: 11,
                        textAlign: "left",
                        flex: 1,
                      })}
                      onClick={() => switchUniverse(u.id)}
                    >
                      {on ? "◉" : "○"} {u.name || `Вселенная ${i + 1}`}
                    </button>
                    {universes.length > 1 && (
                      <button style={del} onClick={() => removeUniverse(u.id)}>
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {tier >= 4 ? (
            <>
              <div style={hint}>
                Рождение новой вселенной запирает {newUniverseCostCoins} ⬡.
                Держать можно до {universeMax}. В каждой — свои Меры, свет общий
                на все.
              </div>
              <input
                style={sel}
                placeholder="Название новой вселенной"
                value={newUniName}
                onChange={(e) => setNewUniName(e.target.value)}
              />
              <button
                style={cx(
                  act,
                  (freeCoins < newUniverseCostCoins ||
                    universes.length >= universeMax) &&
                    actOff,
                )}
                disabled={
                  freeCoins < newUniverseCostCoins ||
                  universes.length >= universeMax
                }
                onClick={() => {
                  createUniverse(newUniName);
                  setNewUniName("");
                }}
              >
                🌌 Создать новую вселенную · {newUniverseCostCoins} ⬡
              </button>
            </>
          ) : (
            <div style={hint}>Создание новой вселенной откроется на T4.</div>
          )}
        </div>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  position: "fixed",
  right: 16,
  top: 110,
  zIndex: 50,
  width: 236,
  fontFamily: TG.fontSerif,
  userSelect: "none",
  color: TG.text,
};
const tab: React.CSSProperties = {
  ...glassPill,
  position: "fixed",
  right: 16,
  top: 110,
  zIndex: 50,
  padding: "8px 14px",
  fontFamily: TG.fontMono,
  fontSize: 11,
  letterSpacing: "0.12em",
  cursor: "pointer",
  userSelect: "none",
};
const head: React.CSSProperties = {
  ...glassPanel,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  padding: "9px 12px",
  borderRadius: 14,
  color: TG.spark,
  fontFamily: TG.fontMono,
  fontSize: 11,
  letterSpacing: "0.08em",
  cursor: "pointer",
};
const freeTag: React.CSSProperties = {
  fontFamily: TG.fontMono,
  fontSize: 10,
  opacity: 0.85,
  color: "#9fd8ff",
};
const body: React.CSSProperties = {
  ...glassPanel,
  marginTop: 6,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  maxHeight: "70vh",
  overflowY: "auto",
};
const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: "#c9a84c",
  opacity: 0.85,
};
const rowWrap: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};
const chip: React.CSSProperties = {
  padding: "5px 8px",
  borderRadius: 6,
  border: "1px solid rgba(201,168,76,0.25)",
  background: "rgba(255,255,255,0.04)",
  color: "#e8e6df",
  font: "inherit",
  fontSize: 11,
  cursor: "pointer",
};
const chipOn: React.CSSProperties = {
  border: "1px solid #c9a84c",
  background: "rgba(201,168,76,0.18)",
  boxShadow: "0 0 8px rgba(201,168,76,0.3)",
};
const lbl: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  marginTop: 2,
};
const sel: React.CSSProperties = {
  padding: "5px 6px",
  borderRadius: 6,
  border: "1px solid rgba(201,168,76,0.25)",
  background: "rgba(8,8,14,0.85)",
  color: "#e8e6df",
  font: "inherit",
  fontSize: 11,
};
const act: React.CSSProperties = {
  marginTop: 4,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #c9a84c",
  background: "rgba(201,168,76,0.18)",
  color: "#ffd27a",
  font: "inherit",
  fontSize: 12,
  cursor: "pointer",
};
const actOff: React.CSSProperties = {
  opacity: 0.4,
  cursor: "not-allowed",
  borderColor: "rgba(201,168,76,0.25)",
};
const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  marginTop: 4,
};
const item: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  padding: "3px 6px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.03)",
};
const itemLabel: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const del: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#ff8a8a",
  cursor: "pointer",
  fontSize: 11,
};
const divider: React.CSSProperties = {
  height: 1,
  background: "rgba(201,168,76,0.2)",
  margin: "4px 0",
};
const hint: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  fontStyle: "italic",
  padding: "2px 0",
};
const memberChip: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  textAlign: "left",
  padding: "4px 6px",
  borderRadius: 6,
  border: "1px solid rgba(201,168,76,0.2)",
  background: "rgba(255,255,255,0.03)",
  color: "#e8e6df",
  font: "inherit",
  fontSize: 11,
  cursor: "pointer",
};
const memberChipOn: React.CSSProperties = {
  border: "1px solid #c9a84c",
  background: "rgba(201,168,76,0.16)",
};
