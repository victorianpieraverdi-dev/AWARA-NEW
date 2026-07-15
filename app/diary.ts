// AWARA · Phase 1 — daily loop controller (voice + text).
// Wires the diary UI to VoiceOfTruth: ingest diary -> apply to PlayerState ->
// animate Light (flat <-> volumetric) and render chakra charge + restoration hints.
//
// Kept ASCII-only on purpose: all Russian copy lives in index.html (data-*),
// so this .ts file never carries non-ASCII source.

import gsap from "gsap";
import { VoiceOfTruth, CHAKRA_NAMES, type PlayerState } from "../core/index";

// Minimal Web Speech API shape (not always in lib.dom typings).
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

export interface DiaryUIRefs {
  textarea: HTMLTextAreaElement;
  submitBtn: HTMLButtonElement;
  micBtn: HTMLButtonElement;
  reflection: HTMLElement;
  chakras: HTMLElement;
  quests: HTMLElement;
  msgs: HTMLElement; // hidden element holding localized strings via data-*
}

export interface SetupDiaryArgs {
  voice: VoiceOfTruth;
  player: PlayerState;
  refs: DiaryUIRefs;
  /** Drives the playerLight uniform + slider (animated). */
  onLight: (light: number) => void;
}

export function setupDiary(args: SetupDiaryArgs): void {
  const { voice, player, refs, onLight } = args;
  const { textarea, submitBtn, micBtn, reflection, chakras, quests, msgs } = refs;

  const msgListening = msgs.dataset.listening ?? "...";
  const msgNoSpeech = msgs.dataset.nospeech ?? "speech recognition unavailable";
  const labelQuests = msgs.dataset.quests ?? "";
  const micOn = micBtn.dataset.on ?? "REC";
  const micOff = micBtn.dataset.off ?? "MIC";

  // ---------- chakra charge bars ----------
  function renderChakras(): void {
    chakras.innerHTML = "";
    player.chakras.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "chakra-row";

      const name = document.createElement("span");
      name.className = "chakra-name";
      name.textContent = CHAKRA_NAMES[i] ?? ("#" + i);

      const bar = document.createElement("div");
      bar.className = "chakra-bar";
      const fill = document.createElement("i");
      fill.style.width = Math.round(Math.max(0, Math.min(1, c)) * 100) + "%";
      bar.appendChild(fill);

      row.appendChild(name);
      row.appendChild(bar);
      chakras.appendChild(row);
    });
  }
  renderChakras();

  // ---------- live one day ----------
  let busy = false;
  async function liveDay(): Promise<void> {
    if (busy) return;
    const text = textarea.value.trim();
    if (!text) return;
    busy = true;
    const from = player.light;
    reflection.textContent = msgListening;
    try {
      const analysis = await voice.ingestDiary(text, player);
      // NOTE: apply(player, analysis) returns a NEW state; merge it back in place.
      const updated = voice.apply(player, analysis);
      Object.assign(player, updated);

      reflection.textContent = analysis.reflection;

      quests.innerHTML = "";
      if (analysis.suggestedQuests.length > 0) {
        const head = document.createElement("b");
        head.textContent = labelQuests + " ";
        quests.appendChild(head);
        quests.appendChild(
          document.createTextNode(analysis.suggestedQuests.join(" "))
        );
      }

      renderChakras();

      gsap.to(
        { v: from },
        {
          v: player.light,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: function () {
            onLight((this.targets()[0] as { v: number }).v);
          },
        }
      );
    } finally {
      busy = false;
    }
  }
  submitBtn.addEventListener("click", () => void liveDay());

  // ---------- voice input (browser Web Speech API, ru-RU) ----------
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  let rec: SpeechRec | null = null;
  let recording = false;
  let baseText = "";

  function stopRec(): void {
    recording = false;
    micBtn.textContent = micOff;
    micBtn.classList.remove("rec");
    rec = null;
  }

  if (!Ctor) {
    micBtn.disabled = true;
    micBtn.title = msgNoSpeech;
  } else {
    micBtn.addEventListener("click", () => {
      if (recording) {
        rec?.stop();
        return;
      }
      const r = new Ctor() as SpeechRec;
      rec = r;
      r.lang = "ru-RU";
      r.continuous = true;
      r.interimResults = true;
      baseText = textarea.value ? textarea.value.trim() + " " : "";
      r.onresult = (e: any) => {
        let s = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          s += e.results[i][0].transcript;
        }
        textarea.value = baseText + s;
      };
      r.onerror = () => stopRec();
      r.onend = () => stopRec();
      recording = true;
      micBtn.textContent = micOn;
      micBtn.classList.add("rec");
      r.start();
    });
  }
}
