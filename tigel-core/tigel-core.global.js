"use strict";
(function(){
/**
 * tigel-core \u2014 \u0442\u0438\u043f\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0435 \u044f\u0434\u0440\u043e \u0434\u0432\u0438\u0436\u043a\u0430 AWARA / \u0422\u0418\u0413\u0415\u041b\u042c.
 *
 * \u0413\u0440\u0443\u0437\u0438\u0442 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0438\u0437 C:\AWARA\data\*.json (\u0447\u0435\u0440\u0435\u0437 /data/ \u043f\u043e HTTP)
 * \u0438 \u0441\u0442\u0440\u043e\u0438\u0442 \u00ab\u041a\u043b\u044e\u0447 \u0414\u043d\u044f\u00bb: \u0430\u0433\u0435\u043d\u0442 \u0434\u043d\u044f + \u043c\u0430\u0442\u0440\u0438\u0446\u0430-\u043b\u0438\u043d\u0437\u0430 + \u0441\u0442\u0438\u0445\u0438\u044f, \u0438\u0437 \u0447\u0435\u0433\u043e
 * \u0440\u043e\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0410\u0420\u0422 \u0414\u041d\u042f (\u0433\u043e\u0442\u043e\u0432\u044b\u0439 image-\u043f\u0440\u043e\u043c\u0442 + \u043a\u0430\u0440\u0442\u0430-\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430) \u0438 \u0422\u0420\u0415\u041a \u0414\u041d\u042f
 * (BPM / \u0442\u043e\u043d\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c / \u0440\u0430\u0433\u0430 / \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b + Suno-\u043f\u0440\u043e\u043c\u0442).
 *
 * \u041a\u043e\u043c\u043f\u0438\u043b\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u044b\u0439 \u0433\u043b\u043e\u0431\u0430\u043b `window.TigelCore` (\u0441\u043c. tigel-core.global.js).
 * \u041d\u0438\u043a\u0430\u043a\u0438\u0445 import/export \u2014 \u0447\u0442\u043e\u0431\u044b tsc \u0432\u044b\u0434\u0430\u043b \u043e\u0431\u044b\u0447\u043d\u044b\u0439 <script>.
 */
// ===== \u0425\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 =====
const DATA = {
    agents: [], lokas: [], chakras: [], cards: [], stages: [],
    matrixByName: {}, cardByKey: {}, cardsByAgent: {}, loaded: false,
};
async function fetchJson(path) {
    try {
        const r = await fetch(path, { cache: "no-store" });
        if (!r.ok)
            return null;
        return (await r.json());
    }
    catch (e) {
        return null;
    }
}
async function loadAll() {
    if (DATA.loaded)
        return true;
    const [agents, lokas, chakras, cards, stages] = await Promise.all([
        fetchJson("data/agents.json"),
        fetchJson("data/locas.json"),
        fetchJson("data/chakras.json"),
        fetchJson("data/card_prompts.json"),
        fetchJson("data/daimon-stages.json"),
    ]);
    DATA.agents = agents || [];
    DATA.lokas = lokas || [];
    DATA.chakras = chakras || [];
    DATA.cards = cards || [];
    DATA.stages = stages || [];
    for (const c of DATA.cards) {
        if (c.matrix_name && c.matrix_slug)
            DATA.matrixByName[c.matrix_name.toLowerCase()] = c.matrix_slug;
        DATA.cardByKey[c.agent_slug + "__" + c.matrix_slug] = c;
        (DATA.cardsByAgent[c.agent_slug] = DATA.cardsByAgent[c.agent_slug] || []).push(c);
    }
    DATA.loaded = DATA.agents.length > 0 || DATA.cards.length > 0;
    return DATA.loaded;
}
// ===== \u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0438\u0433\u0440\u043e\u043a\u0430 =====
function readState() {
    try {
        const raw = localStorage.getItem("tigel_v1");
        if (raw)
            return JSON.parse(raw);
    }
    catch (e) { }
    return {};
}
function lightOf(st) {
    const base = st.baseLight || 48;
    const bonus = st.lightBonus || 0;
    const ml = (st.mats ? st.mats.length : 0) * 2;
    const db = (st.trust || 0) >= 50 ? 5 : 0;
    return Math.max(0, Math.min(100, base + bonus + ml + db));
}
function matrixSlugFromName(name) {
    if (!name)
        return null;
    const key = name.toLowerCase();
    if (DATA.matrixByName[key])
        return DATA.matrixByName[key];
    for (const k of Object.keys(DATA.matrixByName)) {
        if (k.indexOf(key) === 0 || key.indexOf(k) === 0)
            return DATA.matrixByName[k];
    }
    return null;
}
// ===== \u041a\u043b\u044e\u0447 \u0414\u043d\u044f =====
function dayKey(stIn) {
    const st = stIn || readState();
    const dayIndex = Math.floor(Date.now() / 86400000);
    let seed = 0;
    try {
        const nak = st.daimon && st.daimon.nak ? st.daimon.nak : "";
        for (let i = 0; i < nak.length; i++)
            seed += nak.charCodeAt(i);
    }
    catch (e) { }
    const agents = DATA.agents.length ? DATA.agents : [{ id: 1, slug: "svet_ra", name: "\u0421\u0432\u0435\u0442 \u0420\u0430", domain: "\u0413\u0435\u043b\u0438\u043e\u0441\u0444\u0435\u0440\u0430", guna: "\u0441\u0430\u0442\u0442\u0432\u0430", vastu_zone: "\u0412\u043e\u0441\u0442\u043e\u043a", planet: "\u0421\u043e\u043b\u043d\u0446\u0435", element: "\u041e\u0433\u043e\u043d\u044c", ray: 1 }];
    const agent = agents[(dayIndex + seed) % agents.length];
    let matrixSlug = null;
    let matrixName = "";
    if (st.mats && st.mats.length) {
        matrixName = st.mats[0];
        matrixSlug = matrixSlugFromName(matrixName);
    }
    if (!matrixSlug) {
        const list = DATA.cardsByAgent[agent.slug] || [];
        const card = list[(dayIndex + seed) % Math.max(1, list.length)];
        if (card) {
            matrixSlug = card.matrix_slug;
            matrixName = card.matrix_name;
        }
        else {
            matrixSlug = "vedic";
            matrixName = "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f";
        }
    }
    return {
        dayIndex,
        agent,
        matrixSlug: matrixSlug || "vedic",
        matrixName: matrixName || "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f",
        element: agent.element,
        light: lightOf(st),
        daimonEl: (st.daimon && st.daimon.el) || agent.element,
    };
}
// ===== \u0410\u0440\u0442 \u0434\u043d\u044f =====
function artOfDay(stIn) {
    const k = dayKey(stIn);
    const card = DATA.cardByKey[k.agent.slug + "__" + k.matrixSlug] || (DATA.cardsByAgent[k.agent.slug] || [])[0];
    if (card) {
        var _ci = DATA.cards.indexOf(card);
        var _cn = _ci + 1;
        var _cp = _cn < 100 ? ("00" + _cn).slice(-3) : ("000" + _cn).slice(-4);
        var _cimg = _ci >= 0 ? "exports/generated_cards/tarot_cards_webp/" + _cp + "_" + card.agent_slug + "__" + card.matrix_slug + ".webp" : card.image_path;
        return {
            cardId: card.card_id, agentName: card.agent_name, matrixName: card.matrix_name,
            culturalName: card.cultural_name, rarity: card.rarity, element: card.element,
            domainCultural: card.domain_cultural || card.domain, artifact: card.artifact || "",
            image: _cimg, prompt: card.prompt, negativePrompt: card.negative_prompt, found: true,
        };
    }
    const elEn = elementEn(k.element);
    return {
        cardId: k.agent.slug + "__" + k.matrixSlug, agentName: k.agent.name, matrixName: k.matrixName,
        culturalName: k.agent.name, rarity: "uncommon", element: k.element, domainCultural: k.agent.domain,
        artifact: "", image: "",
        prompt: "A mystical tarot-style card depicting the cosmic agent " + k.agent.name + " (" + k.agent.domain + "), " + k.matrixName + " tradition. Element: " + elEn + ". ornate border frame, portrait orientation, highly detailed, 4k, atmospheric lighting, digital painting, mystical esoteric style",
        negativePrompt: "text, watermark, signature, blurry, low quality, modern clothing, photography, deformed, ugly, nsfw",
        found: false,
    };
}
function elementEn(ru) {
    const m = { "\u041e\u0433\u043e\u043d\u044c": "Fire", "\u0412\u043e\u0434\u0430": "Water", "\u0412\u043e\u0437\u0434\u0443\u0445": "Air", "\u0417\u0435\u043c\u043b\u044f": "Earth", "\u042d\u0444\u0438\u0440": "Ether", "\u0413\u0440\u043e\u0437\u0430": "Storm", "\u0421\u0432\u0435\u0442": "Light" };
    return m[ru] || "Ether";
}
// ===== \u0422\u0440\u0435\u043a \u0434\u043d\u044f =====
function trackOfDay(stIn) {
    const k = dayKey(stIn);
    const el = k.daimonEl || k.element;
    const byEl = {
        "\u041e\u0433\u043e\u043d\u044c": { bpm: 128, key: "A minor", raga: "Raga Bhairavi", instruments: "tabla, dhol, distorted drone, brass swells", mantra: "RAM \u2014 \u044f \u0440\u0430\u0437\u0434\u0443\u0432\u0430\u044e \u043e\u0433\u043e\u043d\u044c \u0432\u043e\u043b\u0438" },
        "\u0413\u0440\u043e\u0437\u0430": { bpm: 120, key: "C# minor", raga: "Raga Megh (\u0433\u0440\u043e\u0437\u043e\u0432\u0430\u044f)", instruments: "war-drums, thunder FX, cello ostinato, storm pads", mantra: "\u041e\u041c \u0420\u0443\u0434\u0440\u0430\u044f \u2014 \u0431\u0443\u0440\u044f \u043e\u0447\u0438\u0449\u0430\u0435\u0442" },
        "\u0412\u043e\u0437\u0434\u0443\u0445": { bpm: 112, key: "E lydian", raga: "Raga Hamsadhwani", instruments: "bansuri, arp synth, shakers, breath pads", mantra: "HAM \u2014 \u0434\u044b\u0445\u0430\u043d\u0438\u0435 \u043d\u0435\u0441\u0451\u0442 \u043c\u0435\u043d\u044f" },
        "\u0412\u043e\u0434\u0430": { bpm: 72, key: "F# minor", raga: "Raga Yaman (\u0432\u0435\u0447\u0435\u0440\u043d\u044f\u044f)", instruments: "cello, water drops, sub drones, hang", mantra: "VAM \u2014 \u044f \u0442\u0435\u043a\u0443 \u0438 \u043f\u043e\u043c\u043d\u044e" },
        "\u0417\u0435\u043c\u043b\u044f": { bpm: 90, key: "D dorian", raga: "Raga Bhairav (\u0440\u0430\u0441\u0441\u0432\u0435\u0442\u043d\u0430\u044f)", instruments: "hang, double bass, jaw harp, frame drum", mantra: "LAM \u2014 \u044f \u0442\u0432\u0451\u0440\u0434 \u0438 \u0443\u043a\u043e\u0440\u0435\u043d\u0451\u043d" },
        "\u042d\u0444\u0438\u0440": { bpm: 80, key: "AUM drone (C)", raga: "Raga Marwa", instruments: "tanpura, choir pads, singing bowls, sine drones", mantra: "AUM \u2014 \u044f \u0440\u0430\u0441\u0442\u0432\u043e\u0440\u044f\u044e\u0441\u044c \u0432 \u044d\u0444\u0438\u0440\u0435" },
    };
    const s = byEl[el] || byEl["\u042d\u0444\u0438\u0440"];
    const lv = k.light;
    const mood = lv >= 67 ? "\u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0439, \u043a\u0443\u043b\u044c\u043c\u0438\u043d\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0439, \u0441\u0432\u0435\u0442\u043e\u043d\u043e\u0441\u043d\u044b\u0439" : lv >= 34 ? "\u043c\u0435\u0434\u0438\u0442\u0430\u0442\u0438\u0432\u043d\u043e-\u0434\u0432\u0438\u0436\u0443\u0449\u0438\u0439\u0441\u044f, \u0441\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0439" : "\u0442\u0451\u043c\u043d\u044b\u0439, \u0442\u043b\u0435\u044e\u0449\u0438\u0439, \u0441\u043e\u0431\u0438\u0440\u0430\u044e\u0449\u0438\u0439 \u0438\u0441\u043a\u0440\u0443";
    const dayNum = stIn && stIn.days ? Math.max(1, stIn.days.length - 27) : 1;
    const title = "\u00ab" + k.agent.name + " \u00b7 " + k.matrixName + " \u00b7 \u0434\u0435\u043d\u044c " + dayNum + "\u00bb";
    const prompt = "Instrumental ritual track, " + s.raga + ", " + s.bpm + " BPM, key " + s.key + ", mood: " + mood + ". Instruments: " + s.instruments + ". Vedic-cyber sacred atmosphere inspired by cosmic agent " + k.agent.name + " (" + k.agent.domain + "), element " + elementEn(el) + ", " + k.matrixName + " cultural color. Cinematic, meditative, evolving, no vocals.";
    return { title, bpm: s.bpm, musicalKey: s.key, raga: s.raga, mood, instruments: s.instruments, mantra: s.mantra, prompt };
}
// ===== \u0422\u0435\u043c\u0430 \u043f\u043e \u0441\u0442\u0438\u0445\u0438\u0438 \u0438 \u0440\u0435\u0434\u043a\u043e\u0441\u0442\u0438 =====
function elementTheme(el) {
    const m = {
        "\u041e\u0433\u043e\u043d\u044c": { a: "#ff7a3c", b: "#ffd27a", ico: "\ud83d\udd25" },
        "\u0413\u0440\u043e\u0437\u0430": { a: "#7ad3ff", b: "#b388ff", ico: "\u26a1" },
        "\u0412\u043e\u0437\u0434\u0443\u0445": { a: "#aef0ff", b: "#d6fff2", ico: "\ud83c\udf2c" },
        "\u0412\u043e\u0434\u0430": { a: "#4fb6ff", b: "#7ad3ff", ico: "\ud83c\udf0a" },
        "\u0417\u0435\u043c\u043b\u044f": { a: "#c9a84c", b: "#9bbf6a", ico: "\u26f0" },
        "\u042d\u0444\u0438\u0440": { a: "#b388ff", b: "#ffd27a", ico: "\u2726" },
        "\u0421\u0432\u0435\u0442": { a: "#ffd27a", b: "#fff4cc", ico: "\u2600" },
    };
    return m[el] || { a: "#c9a84c", b: "#ffd27a", ico: "\u2726" };
}
function rarityTheme(r) {
    const m = {
        common: { c: "#9aa3b2", label: "\u043e\u0431\u044b\u0447\u043d\u0430\u044f" },
        uncommon: { c: "#6fc36f", label: "\u043d\u0435\u043e\u0431\u044b\u0447\u043d\u0430\u044f" },
        rare: { c: "#4fb6ff", label: "\u0440\u0435\u0434\u043a\u0430\u044f" },
        epic: { c: "#b388ff", label: "\u044d\u043f\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
        legendary: { c: "#ffd27a", label: "\u043b\u0435\u0433\u0435\u043d\u0434\u0430\u0440\u043d\u0430\u044f" },
        mythic: { c: "#ff7a3c", label: "\u043c\u0438\u0444\u0438\u0447\u0435\u0441\u043a\u0430\u044f" },
    };
    return m[(r || "").toLowerCase()] || { c: "#9aa3b2", label: r || "" };
}
// ===== UI (\u0432\u0430\u043d\u0438\u043b\u044c, \u0431\u0435\u0437 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0435\u0439) =====
function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function copyText(t) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(t);
            return;
        }
    }
    catch (e) { }
    try {
        const ta = document.createElement("textarea");
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
    }
    catch (e) { }
}
function toast(msg) {
    const w = window;
    if (typeof w.showToast === "function") {
        w.showToast(msg);
        return;
    }
}
function pulseBtn(id) {
    const b = document.getElementById(id);
    if (!b)
        return;
    b.textContent = "\u2713 \u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e";
    setTimeout(() => { const x = document.getElementById(id); if (x)
        x.innerHTML = x.dataset.label || x.textContent; }, 1400);
}
function injectStyles() {
    if (document.getElementById("tcStyle"))
        return;
    const s = document.createElement("style");
    s.id = "tcStyle";
    s.textContent = [
        "@keyframes tcGlow{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.0),0 6px 18px rgba(0,0,0,.45)}50%{box-shadow:0 0 22px 5px rgba(201,168,76,.45),0 6px 18px rgba(0,0,0,.45)}}",
        "@keyframes tcSpin{to{transform:rotate(360deg)}}",
        "@keyframes tcSheen{0%{background-position:0% 50%}100%{background-position:200% 50%}}",
        "@keyframes tcUp{from{transform:translateY(34px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}",
        "@keyframes tcFade{from{opacity:0}to{opacity:1}}",
        "@keyframes tcEq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}",
        "@keyframes tcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
        "#tcFab{animation:tcGlow 3.2s ease-in-out infinite}",
        "#tcFab:hover{transform:scale(1.08) rotate(-6deg)}",
        "#tcFab .tcRing{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg,#c9a84c,#7b62c9,#ffd27a,#7b62c9,#c9a84c);animation:tcSpin 7s linear infinite;z-index:-1;filter:blur(1px);opacity:.9}",
        "#tcModal{animation:tcFade .25s ease}",
        ".tcSheet{animation:tcUp .34s cubic-bezier(.2,.9,.2,1)}",
        ".tcBtn{transition:transform .12s ease,box-shadow .2s ease,filter .2s ease}",
        ".tcBtn:hover{transform:translateY(-1px);filter:brightness(1.12)}",
        ".tcBtn:active{transform:translateY(0) scale(.98)}",
        ".tcEqbar{width:4px;border-radius:3px;transform-origin:bottom;animation:tcEq 1.1s ease-in-out infinite}",
        ".tcChip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:11px;font-family:JetBrains Mono,monospace;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05)}",
        ".tcCard{position:relative;border-radius:16px;overflow:hidden;animation:tcFloat 6s ease-in-out infinite}",
        ".tcScroll::-webkit-scrollbar{width:8px}.tcScroll::-webkit-scrollbar-thumb{background:rgba(201,168,76,.35);border-radius:8px}",
    ].join("\n");
    document.head.appendChild(s);
}
function chip(label, val) {
    return '<span class="tcChip"><span style="opacity:.6">' + esc(label) + '</span> <b>' + esc(val) + '</b></span>';
}
function renderModal() {
    const art = artOfDay();
    const trk = trackOfDay();
    const k = dayKey();
    const host = document.getElementById("tcOut");
    if (!host)
        return;
    const th = elementTheme(art.element || k.element);
    const tTh = elementTheme(k.daimonEl || k.element);
    const rar = rarityTheme(art.rarity);
    const lightPct = Math.max(0, Math.min(100, k.light));
    var _stDC = readState();
    var _dcMap = (_stDC && _stDC.dayCards) || {};
    var _nowD = new Date();
    var _tkey = _nowD.getFullYear() + "-" + ("0" + (_nowD.getMonth() + 1)).slice(-2) + "-" + ("0" + _nowD.getDate()).slice(-2);
    var _dayCard = _dcMap[_tkey] || {};
    var _dayImg = _dayCard.img || "";
    var _dayPrompt = _dayCard.prompt || "";
    // \u041a\u0430\u0440\u0442\u0430-\u0430\u0440\u0442 \u0441 \u0440\u0430\u043c\u043a\u043e\u0439 \u043f\u043e \u0440\u0435\u0434\u043a\u043e\u0441\u0442\u0438
    const inner = _dayImg
        ? '<img src="' + _dayImg + '" alt="art" title="\u041e\u0442\u043a\u0440\u044b\u0442\u044c" onclick="window.open(this.src,&quot;_blank&quot;)" style="display:block;width:100%;aspect-ratio:3/4;object-fit:cover;cursor:zoom-in">'
        : "";
    const noimg = '<div class="tcNoimg" style="' + (_dayImg ? "display:none;" : "display:flex;") + 'aspect-ratio:3/4;width:100%;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:18px;background:radial-gradient(circle at 50% 35%,' + th.a + '22,transparent 70%),linear-gradient(160deg,#0d0d1c,#05050d)">' +
        '<div style="font-size:46px;filter:drop-shadow(0 0 12px ' + th.a + ')">' + th.ico + '</div>' +
        '<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:15px">' + '\u041f\u0443\u0441\u0442\u043e\u0439 \u0445\u043e\u043b\u0441\u0442 \u0434\u043d\u044f' + '</div>' +
        '<div style="font-size:11px;opacity:.6;font-family:JetBrains Mono,monospace">' + esc(art.cardId) + '.webp \u0435\u0449\u0451 \u043d\u0435 \u043e\u0442\u0440\u0438\u0441\u043e\u0432\u0430\u043d\u0430</div>' +
        '</div>';
    const cardBlock = '<div class="tcCard" style="border:2px solid ' + rar.c + ';box-shadow:0 0 26px ' + rar.c + '55,inset 0 0 40px rgba(0,0,0,.5);margin-bottom:14px">' +
        inner + noimg +
        '<div style="position:absolute;top:8px;left:8px;display:flex;gap:6px">' +
        '<span class="tcChip" style="border-color:' + rar.c + ';background:' + rar.c + '22;color:' + rar.c + '">\u2605 ' + esc(rar.label) + '</span>' +
        '<span class="tcChip" style="border-color:' + th.a + ';background:' + th.a + '22;color:' + th.b + '">' + th.ico + ' ' + esc(art.element) + '</span>' +
        '</div>' +
        '<div style="position:absolute;left:0;right:0;bottom:0;padding:14px 12px 10px;background:linear-gradient(0deg,rgba(5,5,13,.92),transparent)">' +
        '<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:17px;line-height:1.15;text-shadow:0 0 10px ' + th.a + '88">' + esc(art.culturalName) + '</div>' +
        '<div style="font-size:11px;opacity:.8;margin-top:2px">' + esc(art.agentName) + ' \u00b7 ' + esc(art.matrixName) + (art.domainCultural ? ' \u00b7 ' + esc(art.domainCultural) : "") + '</div>' +
        (art.artifact ? '<div style="font-size:11px;color:' + th.b + ';opacity:.9;margin-top:4px">\u269c ' + esc(art.artifact) + '</div>' : "") +
        '</div>' +
        '</div>';
    // \u042d\u043a\u0432\u0430\u043b\u0430\u0439\u0437\u0435\u0440 \u0434\u043b\u044f \u0442\u0440\u0435\u043a\u0430
    let eq = "";
    for (let i = 0; i < 9; i++) {
        eq += '<span class="tcEqbar" style="height:18px;background:linear-gradient(' + tTh.a + ',' + tTh.b + ');animation-delay:' + (i * 0.12).toFixed(2) + 's"></span>';
    }
    host.innerHTML =
        // \u0428\u0430\u043f\u043a\u0430-\u043a\u043b\u044e\u0447 \u0434\u043d\u044f
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
            chip("\u0410\u0433\u0435\u043d\u0442", k.agent.name) + chip("\u041b\u0438\u043d\u0437\u0430", k.matrixName) + chip(th.ico, k.element) +
            '</div>' +
            // \u0421\u0432\u0435\u0442 \u0434\u043d\u044f \u2014 \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">' +
            '<span style="font-size:11px;opacity:.6;font-family:JetBrains Mono,monospace">\u0421\u0432\u0435\u0442</span>' +
            '<div style="flex:1;height:7px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden"><div style="width:' + lightPct + '%;height:100%;border-radius:7px;background:linear-gradient(90deg,' + th.a + ',' + th.b + ');box-shadow:0 0 10px ' + th.a + '"></div></div>' +
            '<b style="font-size:12px;color:' + th.b + '">' + lightPct + '</b>' +
            '</div>' +
            // \u0410\u0420\u0422 \u0414\u041d\u042f
            '<div style="font-family:Cinzel,serif;color:' + th.b + ';font-size:14px;letter-spacing:.5px;margin:2px 0 10px;display:flex;align-items:center;gap:7px"><span style="font-size:18px">\ud83d\uddbc</span> \u0410\u0420\u0422 \u0414\u041d\u042f</div>' +
            cardBlock +
            '<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.5;margin:0 0 5px">image-\u043f\u0440\u043e\u043c\u0442 (Midjourney / Meshy / SDXL)</div>' +
            '<textarea readonly class="tcScroll" style="width:100%;height:108px;box-sizing:border-box;background:rgba(0,0,0,.32);color:#e8e8f0;border:1px solid ' + th.a + '44;border-radius:10px;padding:9px;font-size:11px;line-height:1.45;font-family:JetBrains Mono,monospace;resize:vertical">' + esc(art.prompt) + '</textarea>' +
            '<div style="display:flex;gap:8px;margin:8px 0 20px">' +
            '<button id="tcCopyArt" class="tcBtn" data-label="\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442" style="flex:1;padding:9px;border-radius:10px;border:1px solid ' + th.a + '66;background:linear-gradient(135deg,' + th.a + '33,' + th.b + '22);color:' + th.b + ';font-weight:600;cursor:pointer">\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442</button>' +
            '<button id="tcCopyNeg" class="tcBtn" data-label="\u2212 negative" style="padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#bbb;cursor:pointer">\u2212 negative</button>' +
            '</div>' +
            // \u0422\u0420\u0415\u041a \u0414\u041d\u042f
            '<div style="font-family:Cinzel,serif;color:' + tTh.b + ';font-size:14px;letter-spacing:.5px;margin:2px 0 10px;display:flex;align-items:center;gap:7px"><span style="font-size:18px">\ud83c\udfb5</span> \u0422\u0420\u0415\u041a \u0414\u041d\u042f</div>' +
            '<div style="border:1px solid ' + tTh.a + '44;border-radius:12px;padding:12px;background:linear-gradient(160deg,' + tTh.a + '14,transparent);margin-bottom:10px">' +
            '<div style="display:flex;align-items:flex-end;gap:3px;height:22px;margin-bottom:9px">' + eq + '</div>' +
            '<div style="font-size:13px;font-family:Cinzel,serif;color:' + tTh.b + ';margin-bottom:8px">' + esc(trk.title) + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' + chip("BPM", String(trk.bpm)) + chip("Key", trk.musicalKey) + chip("\u0420\u0430\u0433\u0430", trk.raga) + '</div>' +
            '<div style="font-size:11px;opacity:.8;line-height:1.5">\ud83c\udf9a ' + esc(trk.instruments) + '<br>\ud83c\udf17 ' + esc(trk.mood) + '<br>\ud83d\udd49 ' + esc(trk.mantra) + '</div>' +
            '</div>' +
            '<textarea readonly class="tcScroll" style="width:100%;height:84px;box-sizing:border-box;background:rgba(0,0,0,.32);color:#e8e8f0;border:1px solid ' + tTh.a + '44;border-radius:10px;padding:9px;font-size:11px;line-height:1.45;font-family:JetBrains Mono,monospace;resize:vertical">' + esc(trk.prompt) + '</textarea>' +
            '<button id="tcCopyTrack" class="tcBtn" data-label="\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 (Suno/Udio)" style="width:100%;padding:10px;margin-top:8px;border-radius:10px;border:1px solid ' + tTh.a + '66;background:linear-gradient(135deg,' + tTh.a + '33,' + tTh.b + '22);color:' + tTh.b + ';font-weight:600;cursor:pointer">\ud83d\udccb \u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 (Suno/Udio)</button>';
    const bA = document.getElementById("tcCopyArt");
    if (bA)
        bA.onclick = () => { copyText(art.prompt); pulseBtn("tcCopyArt"); toast("\u041f\u0440\u043e\u043c\u0442 \u0430\u0440\u0442\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d"); };
    const bN = document.getElementById("tcCopyNeg");
    if (bN)
        bN.onclick = () => { copyText(art.negativePrompt); pulseBtn("tcCopyNeg"); toast("Negative-\u043f\u0440\u043e\u043c\u0442 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d"); };
    const bT = document.getElementById("tcCopyTrack");
    if (bT)
        bT.onclick = () => { copyText(trk.prompt); pulseBtn("tcCopyTrack"); toast("\u041f\u0440\u043e\u043c\u0442 \u0442\u0440\u0435\u043a\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d"); };
}
function openModal() {
    injectStyles();
    let m = document.getElementById("tcModal");
    if (!m) {
        m = document.createElement("div");
        m.id = "tcModal";
        m.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(5,5,13,.78);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center";
        m.innerHTML = '<div class="tcSheet tcScroll" style="width:100%;max-width:440px;max-height:92vh;overflow:auto;background:linear-gradient(180deg,#0c0c1b,#05050d);border:1px solid rgba(201,168,76,.4);border-bottom:none;border-radius:22px 22px 0 0;padding:18px 18px 26px;box-shadow:0 -10px 60px rgba(123,98,201,.25)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b style="font-family:Cinzel,serif;color:#ffd27a;font-size:17px;background:linear-gradient(90deg,#c9a84c,#ffd27a,#7b62c9,#ffd27a);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:tcSheen 5s linear infinite">\ud83c\udfb4 \u0413\u0435\u043d\u0435\u0440\u0430\u0442\u043e\u0440 \u0434\u043d\u044f</b><button id="tcClose" class="tcBtn" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#ccc;width:30px;height:30px;border-radius:50%;font-size:16px;cursor:pointer">\u2715</button></div><div id="tcOut"></div></div>';
        document.body.appendChild(m);
        m.addEventListener("click", (e) => { if (e.target === m)
            closeModal(); });
        const c = document.getElementById("tcClose");
        if (c)
            c.onclick = closeModal;
    }
    m.style.display = "flex";
    const sheet = m.querySelector(".tcSheet");
    if (sheet) {
        sheet.style.animation = "none";
        void sheet.offsetWidth;
        sheet.style.animation = "";
    }
    renderModal();
}
function closeModal() { const m = document.getElementById("tcModal"); if (m)
    m.style.display = "none"; }
function injectFab() {
    injectStyles();
    if (document.getElementById("tcFab"))
        return;
    const b = document.createElement("button");
    b.id = "tcFab";
    b.title = "\u0410\u0440\u0442 \u0438 \u0442\u0440\u0435\u043a \u0434\u043d\u044f";
    b.innerHTML = '<span class="tcRing"></span><span style="position:relative;z-index:1">\ud83c\udfb4</span>';
    b.style.cssText = "position:fixed;left:16px;bottom:80px;z-index:9998;width:52px;height:52px;border-radius:50%;border:none;background:rgba(11,11,24,.95);color:#ffd27a;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .18s ease";
    b.onclick = openModal;
    document.body.appendChild(b);
}
async function boot() {
    await loadAll();
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", injectFab);
    else
        injectFab();
}
// ===== \u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0432 \u0433\u043b\u043e\u0431\u0430\u043b =====
const TigelCore = {
    loadAll, dayKey, artOfDay, trackOfDay, readState, lightOf,
    openModal, closeModal, boot, get data() { return DATA; },
};
globalThis.TigelCore = TigelCore;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const rev = (x) => ((x % 360) + 360) % 360;
const sind = (x) => Math.sin(x * D2R);
const cosd = (x) => Math.cos(x * D2R);
const tand = (x) => Math.tan(x * D2R);
const atan2d = (y, x) => R2D * Math.atan2(y, x);
function dayNumber(y, m, D, ut) {
    const d = 367 * y - Math.floor((7 * (y + Math.floor((m + 9) / 12))) / 4) + Math.floor((275 * m) / 9) + D - 730530;
    return d + ut / 24;
}
function kepler(M, e) {
    let E = M + R2D * e * sind(M) * (1 + e * cosd(M));
    for (let k = 0; k < 7; k++) {
        E = E - (E - R2D * e * sind(E) - M) / (1 - e * cosd(E));
    }
    return E;
}
function sun(d) {
    const w = rev(282.9404 + 4.70935e-5 * d), e = 0.016709 - 1.151e-9 * d, M = rev(356.0470 + 0.9856002585 * d);
    const E = kepler(M, e);
    const xv = cosd(E) - e, yv = Math.sqrt(1 - e * e) * sind(E);
    const v = atan2d(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    const lon = rev(v + w);
    return { lon, r, M, w, e, Ls: rev(M + w), xs: r * cosd(lon), ys: r * sind(lon) };
}
function moonPos(d, S) {
    const N = rev(125.1228 - 0.0529538083 * d), i = 5.1454, w = rev(318.0634 + 0.1643573223 * d), a = 60.2666, e = 0.054900, M = rev(115.3654 + 13.0649929509 * d);
    const E = kepler(M, e);
    const xv = a * (cosd(E) - e), yv = a * Math.sqrt(1 - e * e) * sind(E);
    const v = atan2d(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    const xh = r * (cosd(N) * cosd(v + w) - sind(N) * sind(v + w) * cosd(i));
    const yh = r * (sind(N) * cosd(v + w) + cosd(N) * sind(v + w) * cosd(i));
    let lon = rev(atan2d(yh, xh));
    const Lm = rev(N + w + M), Ls = S.Ls, Ms = S.M, Mm = M, Dm = rev(Lm - Ls), F = rev(Lm - N);
    lon += -1.274 * sind(Mm - 2 * Dm) + 0.658 * sind(2 * Dm) - 0.186 * sind(Ms) - 0.059 * sind(2 * Mm - 2 * Dm) - 0.057 * sind(Mm - 2 * Dm + Ms) + 0.053 * sind(Mm + 2 * Dm) + 0.046 * sind(2 * Dm - Ms) + 0.041 * sind(Mm - Ms) - 0.035 * sind(Dm) - 0.031 * sind(Mm + Ms) - 0.015 * sind(2 * F - 2 * Dm) + 0.011 * sind(Mm - 4 * Dm);
    return { lon: rev(lon), N };
}
const PEL = {
    Mercury: (d) => ({ N: rev(48.3313 + 3.24587e-5 * d), i: 7.0047 + 5.0e-8 * d, w: rev(29.1241 + 1.01444e-5 * d), a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: rev(168.6562 + 4.0923344368 * d) }),
    Venus: (d) => ({ N: rev(76.6799 + 2.4659e-5 * d), i: 3.3946 + 2.75e-8 * d, w: rev(54.8910 + 1.38374e-5 * d), a: 0.723330, e: 0.006773 - 1.302e-9 * d, M: rev(48.0052 + 1.6021302244 * d) }),
    Mars: (d) => ({ N: rev(49.5574 + 2.11081e-5 * d), i: 1.8497 - 1.78e-8 * d, w: rev(286.5016 + 2.92961e-5 * d), a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: rev(18.6021 + 0.5240207766 * d) }),
    Jupiter: (d) => ({ N: rev(100.4542 + 2.76854e-5 * d), i: 1.3030 - 1.557e-7 * d, w: rev(273.8777 + 1.64505e-5 * d), a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: rev(19.8950 + 0.0830853001 * d) }),
    Saturn: (d) => ({ N: rev(113.6634 + 2.3898e-5 * d), i: 2.4886 - 1.081e-7 * d, w: rev(339.3939 + 2.97661e-5 * d), a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: rev(316.9670 + 0.0334442282 * d) }),
};
function planetLon(name, d, S) {
    const el = PEL[name](d);
    const E = kepler(el.M, el.e);
    const xv = el.a * (cosd(E) - el.e), yv = el.a * Math.sqrt(1 - el.e * el.e) * sind(E);
    const v = atan2d(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    const xh = r * (cosd(el.N) * cosd(v + el.w) - sind(el.N) * sind(v + el.w) * cosd(el.i));
    const yh = r * (sind(el.N) * cosd(v + el.w) + cosd(el.N) * sind(v + el.w) * cosd(el.i));
    const xg = xh + S.xs, yg = yh + S.ys;
    let lon = rev(atan2d(yg, xg));
    const Mj = PEL.Jupiter(d).M, Ms = PEL.Saturn(d).M;
    if (name === "Jupiter") {
        lon += -0.332 * sind(2 * Mj - 5 * Ms - 67.6) - 0.056 * sind(2 * Mj - 2 * Ms + 21) + 0.042 * sind(3 * Mj - 5 * Ms + 21) - 0.036 * sind(Mj - 2 * Ms) + 0.022 * cosd(Mj - Ms) + 0.023 * sind(2 * Mj - 3 * Ms + 52) - 0.016 * sind(Mj - 5 * Ms - 69);
    }
    else if (name === "Saturn") {
        lon += 0.812 * sind(2 * Mj - 5 * Ms - 67.6) - 0.229 * cosd(2 * Mj - 4 * Ms - 2) + 0.119 * sind(Mj - 2 * Ms - 3) + 0.046 * sind(2 * Mj - 6 * Ms - 69) + 0.014 * sind(Mj - 3 * Ms + 32);
    }
    return rev(lon);
}
function ayanamsa(d) { const T = (d - 0.5) / 365.25; return 23.85 + (50.2719 / 3600) * T; }
function ascendant(d, S, lat, lon, ut) {
    const ecl = 23.4393 - 3.563e-7 * d;
    const GMST0 = rev(S.Ls + 180) / 15;
    const LST = GMST0 + ut + lon / 15;
    const RAMC = rev(LST * 15);
    return rev(atan2d(cosd(RAMC), -(sind(RAMC) * cosd(ecl) + tand(lat) * sind(ecl))));
}
const SIGNS = ["\u041e\u0432\u0435\u043d", "\u0422\u0435\u043b\u0435\u0446", "\u0411\u043b\u0438\u0437\u043d\u0435\u0446\u044b", "\u0420\u0430\u043a", "\u041b\u0435\u0432", "\u0414\u0435\u0432\u0430", "\u0412\u0435\u0441\u044b", "\u0421\u043a\u043e\u0440\u043f\u0438\u043e\u043d", "\u0421\u0442\u0440\u0435\u043b\u0435\u0446", "\u041a\u043e\u0437\u0435\u0440\u043e\u0433", "\u0412\u043e\u0434\u043e\u043b\u0435\u0439", "\u0420\u044b\u0431\u044b"];
const NAK = [["\u0410\u0448\u0432\u0438\u043d\u0438", "\u041a\u0435\u0442\u0443"], ["\u0411\u0445\u0430\u0440\u0430\u043d\u0438", "\u0412\u0435\u043d\u0435\u0440\u0430"], ["\u041a\u0440\u0438\u0442\u0442\u0438\u043a\u0430", "\u0421\u043e\u043b\u043d\u0446\u0435"], ["\u0420\u043e\u0445\u0438\u043d\u0438", "\u041b\u0443\u043d\u0430"], ["\u041c\u0440\u0438\u0433\u0430\u0448\u0438\u0440\u0430", "\u041c\u0430\u0440\u0441"], ["\u0410\u0440\u0434\u0440\u0430", "\u0420\u0430\u0445\u0443"], ["\u041f\u0443\u043d\u0430\u0440\u0432\u0430\u0441\u0443", "\u042e\u043f\u0438\u0442\u0435\u0440"], ["\u041f\u0443\u0448\u044c\u044f", "\u0421\u0430\u0442\u0443\u0440\u043d"], ["\u0410\u0448\u043b\u0435\u0448\u0430", "\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439"], ["\u041c\u0430\u0433\u0445\u0430", "\u041a\u0435\u0442\u0443"], ["\u041f\u0443\u0440\u0432\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438", "\u0412\u0435\u043d\u0435\u0440\u0430"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438", "\u0421\u043e\u043b\u043d\u0446\u0435"], ["\u0425\u0430\u0441\u0442\u0430", "\u041b\u0443\u043d\u0430"], ["\u0427\u0438\u0442\u0440\u0430", "\u041c\u0430\u0440\u0441"], ["\u0421\u0432\u0430\u0442\u0438", "\u0420\u0430\u0445\u0443"], ["\u0412\u0438\u0448\u0430\u043a\u0445\u0430", "\u042e\u043f\u0438\u0442\u0435\u0440"], ["\u0410\u043d\u0443\u0440\u0430\u0434\u0445\u0430", "\u0421\u0430\u0442\u0443\u0440\u043d"], ["\u0414\u0436\u044c\u0435\u0448\u0442\u0445\u0430", "\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439"], ["\u041c\u0443\u043b\u0430", "\u041a\u0435\u0442\u0443"], ["\u041f\u0443\u0440\u0432\u0430-\u0410\u0448\u0430\u0434\u0445\u0430", "\u0412\u0435\u043d\u0435\u0440\u0430"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u0410\u0448\u0430\u0434\u0445\u0430", "\u0421\u043e\u043b\u043d\u0446\u0435"], ["\u0428\u0440\u0430\u0432\u0430\u043d\u0430", "\u041b\u0443\u043d\u0430"], ["\u0414\u0445\u0430\u043d\u0438\u0448\u0442\u0445\u0430", "\u041c\u0430\u0440\u0441"], ["\u0428\u0430\u0442\u0430\u0431\u0445\u0438\u0448\u0430", "\u0420\u0430\u0445\u0443"], ["\u041f\u0443\u0440\u0432\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430", "\u042e\u043f\u0438\u0442\u0435\u0440"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430", "\u0421\u0430\u0442\u0443\u0440\u043d"], ["\u0420\u0435\u0432\u0430\u0442\u0438", "\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439"]];
const DAIMON = { "\u0410\u0448\u0432\u0438\u043d\u0438": ["\u0410\u0448\u0432\u0435\u043d", "\u0420\u0430\u0441\u0441\u0432\u0435\u0442", "\u0426\u0435\u043b\u0438\u0442\u0435\u043b\u044c-\u0432\u0441\u0430\u0434\u043d\u0438\u043a"], "\u0411\u0445\u0430\u0440\u0430\u043d\u0438": ["\u042f\u043c\u0430\u0440\u0430", "\u041e\u0433\u043e\u043d\u044c", "\u0425\u0440\u0430\u043d\u0438\u0442\u0435\u043b\u044c \u043f\u043e\u0440\u043e\u0433\u0430"], "\u041a\u0440\u0438\u0442\u0442\u0438\u043a\u0430": ["\u041a\u0440\u0438\u0442\u0442\u0430\u0433\u043d\u0438", "\u041e\u0433\u043e\u043d\u044c", "\u041b\u0435\u0437\u0432\u0438\u0435 \u043f\u043b\u0430\u043c\u0435\u043d\u0438"], "\u0420\u043e\u0445\u0438\u043d\u0438": ["\u0420\u043e\u0445\u0430\u043d\u0430", "\u0417\u0435\u043c\u043b\u044f", "\u0426\u0432\u0435\u0442\u0443\u0449\u0430\u044f"], "\u041c\u0440\u0438\u0433\u0430\u0448\u0438\u0440\u0430": ["\u041c\u0440\u0438\u0433\u0430\u0448", "\u0412\u043e\u0437\u0434\u0443\u0445", "\u0418\u0441\u043a\u0430\u0442\u0435\u043b\u044c"], "\u0410\u0440\u0434\u0440\u0430": ["\u0410\u0440\u0434\u0432\u0435\u043d", "\u0413\u0440\u043e\u0437\u0430", "\u0413\u0440\u043e\u0437\u043e\u0432\u0435\u0441\u0442\u043d\u0438\u043a"], "\u041f\u0443\u043d\u0430\u0440\u0432\u0430\u0441\u0443": ["\u041f\u0443\u043d\u0430\u0440", "\u0412\u043e\u0434\u0430", "\u0412\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u044e\u0449\u0438\u0439 \u0441\u0432\u0435\u0442"], "\u041f\u0443\u0448\u044c\u044f": ["\u041f\u0443\u0448\u0430\u043d", "\u042d\u0444\u0438\u0440", "\u041f\u0438\u0442\u0430\u044e\u0449\u0438\u0439"], "\u0410\u0448\u043b\u0435\u0448\u0430": ["\u041d\u0430\u0433\u0435\u043d\u0434\u0440\u0430", "\u0412\u043e\u0434\u0430", "\u0417\u043c\u0435\u0439 \u043c\u0443\u0434\u0440\u043e\u0441\u0442\u0438"], "\u041c\u0430\u0433\u0445\u0430": ["\u041c\u0430\u0433\u0445\u0430\u0440", "\u041e\u0433\u043e\u043d\u044c", "\u041f\u0440\u0435\u0441\u0442\u043e\u043b \u043f\u0440\u0435\u0434\u043a\u043e\u0432"], "\u041f\u0443\u0440\u0432\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438": ["\u0411\u0445\u0430\u0433\u0430\u0440", "\u0412\u043e\u0434\u0430", "\u0423\u0441\u043b\u0430\u0434\u0430"], "\u0423\u0442\u0442\u0430\u0440\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438": ["\u0410\u0440\u044c\u044f\u043d", "\u041e\u0433\u043e\u043d\u044c", "\u0421\u043e\u044e\u0437\u043d\u0438\u043a"], "\u0425\u0430\u0441\u0442\u0430": ["\u0425\u0430\u0441\u0442\u0438\u043d", "\u0412\u043e\u0437\u0434\u0443\u0445", "\u0420\u0443\u043a\u0430 \u043c\u0430\u0441\u0442\u0435\u0440\u0430"], "\u0427\u0438\u0442\u0440\u0430": ["\u0427\u0438\u0442\u0440\u0435\u043d", "\u041e\u0433\u043e\u043d\u044c", "\u0417\u043e\u0434\u0447\u0438\u0439 \u0438\u043b\u043b\u044e\u0437\u0438\u0439"], "\u0421\u0432\u0430\u0442\u0438": ["\u0412\u0430\u044e\u0440", "\u0412\u043e\u0437\u0434\u0443\u0445", "\u0412\u043e\u043b\u044c\u043d\u044b\u0439 \u0432\u0435\u0442\u0435\u0440"], "\u0412\u0438\u0448\u0430\u043a\u0445\u0430": ["\u0418\u043d\u0434\u0440\u0430\u0433\u043d\u0438", "\u041e\u0433\u043e\u043d\u044c", "\u0414\u0432\u043e\u0439\u043d\u043e\u0435 \u043f\u043b\u0430\u043c\u044f"], "\u0410\u043d\u0443\u0440\u0430\u0434\u0445\u0430": ["\u041c\u0438\u0442\u0440\u0430\u043d", "\u0412\u043e\u0434\u0430", "\u0414\u0440\u0443\u0433 \u0437\u0432\u0451\u0437\u0434"], "\u0414\u0436\u044c\u0435\u0448\u0442\u0445\u0430": ["\u0414\u0436\u044c\u0435\u0448\u0442\u0430", "\u0412\u043e\u0437\u0434\u0443\u0445", "\u0421\u0442\u0430\u0440\u0448\u0438\u0439 \u0441\u0442\u0440\u0430\u0436"], "\u041c\u0443\u043b\u0430": ["\u041d\u0438\u0440\u0440\u0438\u0442", "\u0417\u0435\u043c\u043b\u044f", "\u041a\u043e\u0440\u043d\u0435\u0440\u0435\u0437"], "\u041f\u0443\u0440\u0432\u0430-\u0410\u0448\u0430\u0434\u0445\u0430": ["\u0410\u043f\u0430\u0441\u0430", "\u0412\u043e\u0434\u0430", "\u041d\u0435\u043f\u043e\u0431\u0435\u0434\u0438\u043c\u0430\u044f \u0432\u043e\u043b\u043d\u0430"], "\u0423\u0442\u0442\u0430\u0440\u0430-\u0410\u0448\u0430\u0434\u0445\u0430": ["\u0412\u0438\u0448\u0432\u0435\u043d", "\u041e\u0433\u043e\u043d\u044c", "\u0412\u0441\u0435\u043f\u043e\u0431\u0435\u0434\u0430"], "\u0428\u0440\u0430\u0432\u0430\u043d\u0430": ["\u0428\u0440\u0430\u0432\u0435\u043d", "\u042d\u0444\u0438\u0440", "\u0421\u043b\u0443\u0448\u0430\u044e\u0449\u0438\u0439"], "\u0414\u0445\u0430\u043d\u0438\u0448\u0442\u0445\u0430": ["\u0412\u0430\u0441\u0443\u0430\u0440", "\u042d\u0444\u0438\u0440", "\u0411\u043e\u0433\u0430\u0442\u044b\u0439 \u0440\u0438\u0442\u043c"], "\u0428\u0430\u0442\u0430\u0431\u0445\u0438\u0448\u0430": ["\u0412\u0430\u0440\u0443\u043d\u0438", "\u0412\u043e\u0434\u0430", "\u0421\u043e\u0442\u043d\u044f \u0446\u0435\u043b\u0435\u043d\u0438\u0439"], "\u041f\u0443\u0440\u0432\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430": ["\u0410\u0434\u0436\u0430\u0440", "\u041e\u0433\u043e\u043d\u044c", "\u041e\u0433\u043d\u044c \u0431\u0435\u0437\u0434\u043d\u044b"], "\u0423\u0442\u0442\u0430\u0440\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430": ["\u0410\u0445\u0438\u0440", "\u0412\u043e\u0434\u0430", "\u0413\u043b\u0443\u0431\u0438\u043d\u043d\u044b\u0439 \u0437\u043c\u0435\u0439"], "\u0420\u0435\u0432\u0430\u0442\u0438": ["\u041f\u0443\u0448\u0435\u043d", "\u042d\u0444\u0438\u0440", "\u041f\u0430\u0441\u0442\u044b\u0440\u044c \u043f\u0443\u0442\u0435\u0439"] };
const NAKDEEP = [["\u0410\u0448\u0432\u0438\u043d\u0438", "\u0410\u0448\u0432\u0438\u043d\u044b-\u0446\u0435\u043b\u0438\u0442\u0435\u043b\u0438", "\u0433\u043e\u043b\u043e\u0432\u0430 \u043a\u043e\u043d\u044f", "\u0438\u0441\u0446\u0435\u043b\u044f\u0442\u044c \u0441\u0442\u0440\u0435\u043c\u0438\u0442\u0435\u043b\u044c\u043d\u043e"], ["\u0411\u0445\u0430\u0440\u0430\u043d\u0438", "\u042f\u043c\u0430", "\u0439\u043e\u043d\u0438", "\u043d\u0435\u0441\u0442\u0438 \u0438 \u043f\u0440\u0435\u043e\u0431\u0440\u0430\u0436\u0430\u0442\u044c"], ["\u041a\u0440\u0438\u0442\u0442\u0438\u043a\u0430", "\u0410\u0433\u043d\u0438", "\u043b\u0435\u0437\u0432\u0438\u0435 \u043f\u043b\u0430\u043c\u0435\u043d\u0438", "\u0441\u0436\u0438\u0433\u0430\u0442\u044c \u043b\u0438\u0448\u043d\u0435\u0435"], ["\u0420\u043e\u0445\u0438\u043d\u0438", "\u0411\u0440\u0430\u0445\u043c\u0430", "\u043a\u043e\u043b\u0435\u0441\u043d\u0438\u0446\u0430", "\u0440\u0430\u0441\u0442\u0438\u0442\u044c \u0438\u0437\u043e\u0431\u0438\u043b\u0438\u0435"], ["\u041c\u0440\u0438\u0433\u0430\u0448\u0438\u0440\u0430", "\u0421\u043e\u043c\u0430", "\u0433\u043e\u043b\u043e\u0432\u0430 \u043e\u043b\u0435\u043d\u044f", "\u0438\u0441\u043a\u0430\u0442\u044c \u0441\u0443\u0442\u044c"], ["\u0410\u0440\u0434\u0440\u0430", "\u0420\u0443\u0434\u0440\u0430", "\u043a\u0430\u043f\u043b\u044f-\u0441\u043b\u0435\u0437\u0430", "\u0443\u0441\u0438\u043b\u0438\u0435 \u0441\u043a\u0432\u043e\u0437\u044c \u0431\u0443\u0440\u044e"], ["\u041f\u0443\u043d\u0430\u0440\u0432\u0430\u0441\u0443", "\u0410\u0434\u0438\u0442\u0438", "\u043a\u043e\u043b\u0447\u0430\u043d \u0441\u0442\u0440\u0435\u043b", "\u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044c\u0441\u044f \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d\u043d\u044b\u043c"], ["\u041f\u0443\u0448\u044c\u044f", "\u0411\u0440\u0438\u0445\u0430\u0441\u043f\u0430\u0442\u0438", "\u0432\u044b\u043c\u044f \u043a\u043e\u0440\u043e\u0432\u044b", "\u043f\u0438\u0442\u0430\u0442\u044c \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u0442\u044c"], ["\u0410\u0448\u043b\u0435\u0448\u0430", "\u041d\u0430\u0433\u0438", "\u0441\u0432\u0435\u0440\u043d\u0443\u0432\u0448\u0430\u044f\u0441\u044f \u0437\u043c\u0435\u044f", "\u043e\u0431\u0432\u0438\u0432\u0430\u0442\u044c \u043c\u0443\u0434\u0440\u043e\u0441\u0442\u044c\u044e"], ["\u041c\u0430\u0433\u0445\u0430", "\u041f\u0438\u0442\u0440\u0438-\u043f\u0440\u0435\u0434\u043a\u0438", "\u0442\u0440\u043e\u043d", "\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0432\u043b\u0430\u0441\u0442\u044c \u0440\u043e\u0434\u0430"], ["\u041f\u0443\u0440\u0432\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438", "\u0411\u0445\u0430\u0433\u0430", "\u043b\u043e\u0436\u0435 (\u043f\u0435\u0440\u0435\u0434)", "\u0434\u0430\u0440\u0438\u0442\u044c \u043d\u0430\u0441\u043b\u0430\u0436\u0434\u0435\u043d\u0438\u0435"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u041f\u0445\u0430\u043b\u044c\u0433\u0443\u043d\u0438", "\u0410\u0440\u044c\u044f\u043c\u0430\u043d", "\u043b\u043e\u0436\u0435 (\u0442\u044b\u043b)", "\u0441\u043a\u0440\u0435\u043f\u043b\u044f\u0442\u044c \u0441\u043e\u044e\u0437\u044b"], ["\u0425\u0430\u0441\u0442\u0430", "\u0421\u0430\u0432\u0438\u0442\u0430\u0440", "\u043b\u0430\u0434\u043e\u043d\u044c", "\u043c\u0430\u0441\u0442\u0435\u0440\u0438\u0442\u044c \u0440\u0443\u043a\u0430\u043c\u0438"], ["\u0427\u0438\u0442\u0440\u0430", "\u0422\u0432\u0430\u0448\u0442\u0430\u0440", "\u0436\u0435\u043c\u0447\u0443\u0436\u0438\u043d\u0430", "\u0442\u0432\u043e\u0440\u0438\u0442\u044c \u0444\u043e\u0440\u043c\u0443"], ["\u0421\u0432\u0430\u0442\u0438", "\u0412\u0430\u044e", "\u043f\u043e\u0431\u0435\u0433 \u043d\u0430 \u0432\u0435\u0442\u0440\u0443", "\u0431\u044b\u0442\u044c \u043d\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043c\u044b\u043c"], ["\u0412\u0438\u0448\u0430\u043a\u0445\u0430", "\u0418\u043d\u0434\u0440\u0430-\u0410\u0433\u043d\u0438", "\u0430\u0440\u043a\u0430 \u0442\u0440\u0438\u0443\u043c\u0444\u0430", "\u0434\u043e\u0441\u0442\u0438\u0433\u0430\u0442\u044c \u0446\u0435\u043b\u0438"], ["\u0410\u043d\u0443\u0440\u0430\u0434\u0445\u0430", "\u041c\u0438\u0442\u0440\u0430", "\u043b\u043e\u0442\u043e\u0441", "\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0434\u0440\u0443\u0436\u0431\u0443"], ["\u0414\u0436\u044c\u0435\u0448\u0442\u0445\u0430", "\u0418\u043d\u0434\u0440\u0430", "\u0437\u043e\u043d\u0442 \u0441\u0442\u0430\u0440\u0435\u0439\u0448\u0438\u043d\u044b", "\u043d\u0435\u0441\u0442\u0438 \u0441\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e"], ["\u041c\u0443\u043b\u0430", "\u041d\u0438\u0440\u0440\u0438\u0442\u0438", "\u0441\u0432\u044f\u0437\u043a\u0430 \u043a\u043e\u0440\u043d\u0435\u0439", "\u0440\u0432\u0430\u0442\u044c \u0434\u043e \u043a\u043e\u0440\u043d\u044f"], ["\u041f\u0443\u0440\u0432\u0430-\u0410\u0448\u0430\u0434\u0445\u0430", "\u0410\u043f\u0430\u0441", "\u0432\u0435\u0435\u0440", "\u0431\u044b\u0442\u044c \u043d\u0435\u043f\u043e\u0431\u0435\u0434\u0438\u043c\u044b\u043c"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u0410\u0448\u0430\u0434\u0445\u0430", "\u0412\u0438\u0448\u0432\u0435\u0434\u0435\u0432\u044b", "\u0431\u0438\u0432\u0435\u043d\u044c \u0441\u043b\u043e\u043d\u0430", "\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u043e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u044c\u043d\u0443\u044e \u043f\u043e\u0431\u0435\u0434\u0443"], ["\u0428\u0440\u0430\u0432\u0430\u043d\u0430", "\u0412\u0438\u0448\u043d\u0443", "\u0442\u0440\u0438 \u0441\u043b\u0435\u0434\u0430", "\u0441\u043b\u0443\u0448\u0430\u0442\u044c \u0438 \u0441\u0432\u044f\u0437\u044b\u0432\u0430\u0442\u044c"], ["\u0414\u0445\u0430\u043d\u0438\u0448\u0442\u0445\u0430", "\u0412\u0430\u0441\u0443", "\u0431\u0430\u0440\u0430\u0431\u0430\u043d", "\u0437\u0430\u0434\u0430\u0432\u0430\u0442\u044c \u0440\u0438\u0442\u043c"], ["\u0428\u0430\u0442\u0430\u0431\u0445\u0438\u0448\u0430", "\u0412\u0430\u0440\u0443\u043d\u0430", "\u043a\u0440\u0443\u0433 \u0441\u0442\u0430 \u0446\u0435\u043b\u0438\u0442\u0435\u043b\u0435\u0439", "\u0438\u0441\u0446\u0435\u043b\u044f\u0442\u044c \u0442\u0430\u0439\u043d\u043e"], ["\u041f\u0443\u0440\u0432\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430", "\u0410\u0434\u0436\u0430 \u042d\u043a\u0430\u043f\u0430\u0434\u0430", "\u043e\u0433\u043d\u0435\u043d\u043d\u044b\u0439 \u0441\u0442\u043e\u043b\u043f", "\u0433\u043e\u0440\u0435\u0442\u044c \u0430\u0441\u043a\u0435\u0437\u043e\u0439"], ["\u0423\u0442\u0442\u0430\u0440\u0430-\u0411\u0445\u0430\u0434\u0440\u0430\u043f\u0430\u0434\u0430", "\u0410\u0445\u0438\u0440 \u0411\u0443\u0434\u0445\u043d\u044c\u044f", "\u0437\u043c\u0435\u0439 \u0433\u043b\u0443\u0431\u0438\u043d", "\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0433\u043b\u0443\u0431\u0438\u043d\u043d\u044b\u0439 \u043f\u043e\u043a\u043e\u0439"], ["\u0420\u0435\u0432\u0430\u0442\u0438", "\u041f\u0443\u0448\u0430\u043d", "\u0440\u044b\u0431\u0430", "\u043f\u0438\u0442\u0430\u0442\u044c \u043f\u0443\u0442\u044c \u0434\u043e \u043a\u043e\u043d\u0446\u0430"]];
const MATRIX = { "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f": ["\u0950", "\u042d\u0444\u0438\u0440", "\u0414\u0445\u0430\u0440\u043c\u0430, \u043a\u0430\u0440\u043c\u0430 \u0438 \u043f\u0443\u0442\u044c \u0414\u0443\u0448\u0438 \u0447\u0435\u0440\u0435\u0437 \u043d\u0430\u043a\u0448\u0430\u0442\u0440\u044b \u0438 \u0433\u0443\u043d\u044b.", "\u0421\u043b\u0435\u0434\u0443\u0439 \u0441\u0432\u043e\u0435\u0439 \u0434\u0445\u0430\u0440\u043c\u0435, \u0430 \u043d\u0435 \u0447\u0443\u0436\u043e\u043c\u0443 \u0442\u0435\u043c\u043f\u0443."], "\u0422\u0430\u0440\u043e": ["\ud83c\udccf", "\u041e\u0433\u043e\u043d\u044c", "22 \u0410\u0440\u043a\u0430\u043d\u0430 \u043a\u0430\u043a \u044d\u0442\u0430\u043f\u044b \u043f\u0443\u0442\u0438 \u0413\u0435\u0440\u043e\u044f.", "\u0411\u0430\u0448\u043d\u044f \u043f\u0430\u0434\u0430\u0435\u0442 \u2014 \u0438 \u043e\u0441\u0432\u043e\u0431\u043e\u0436\u0434\u0430\u0435\u0442. \u041d\u0435 \u0434\u0435\u0440\u0436\u0438\u0441\u044c \u0437\u0430 \u0441\u0442\u0430\u0440\u043e\u0435."], "\u041a\u0430\u0431\u0431\u0430\u043b\u0430": ["\u2721", "\u042d\u0444\u0438\u0440", "\u0414\u0435\u0440\u0435\u0432\u043e \u0421\u0435\u0444\u0438\u0440\u043e\u0442 \u0438 \u043f\u0443\u0442\u0438 \u043c\u0435\u0436\u0434\u0443 \u043c\u0438\u0440\u0430\u043c\u0438.", "\u0421\u043f\u0443\u0441\u0442\u0438 \u0441\u0432\u0435\u0442 \u0438\u0437 \u041a\u0435\u0442\u0435\u0440 \u0432 \u0434\u0435\u043b\u043e \u0434\u043d\u044f."], "\u0413\u0435\u0440\u043c\u0435\u0442\u0438\u0437\u043c": ["\u263f", "\u041e\u0433\u043e\u043d\u044c", "\u0410\u043b\u0445\u0438\u043c\u0438\u044f, 7 \u043f\u0440\u0438\u043d\u0446\u0438\u043f\u043e\u0432 \u041a\u0438\u0431\u0430\u043b\u0438\u043e\u043d.", "\u041a\u0430\u043a \u0432\u043d\u0443\u0442\u0440\u0438, \u0442\u0430\u043a \u0438 \u0441\u043d\u0430\u0440\u0443\u0436\u0438 \u2014 \u043c\u0435\u043d\u044f\u0439 \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0435\u0435."], "\u0421\u043b\u0430\u0432\u044f\u043d\u0441\u043a\u0430\u044f": ["\u2638", "\u0417\u0435\u043c\u043b\u044f", "\u041a\u043e\u043b\u043e \u0421\u0432\u0430\u0440\u043e\u0433\u0430, \u0447\u0438\u0441\u043b\u043e\u0431\u043e\u0433 \u0438 \u0441\u0442\u0438\u0445\u0438\u0438 \u0420\u043e\u0434\u0430.", "\u0421\u0442\u043e\u0439 \u0432 \u0441\u0432\u043e\u0451\u043c \u0420\u043e\u0434\u0443 \u2014 \u043e\u0442\u0442\u0443\u0434\u0430 \u0441\u0438\u043b\u0430."], "\u0413\u043d\u043e\u0441\u0442\u0438\u0446\u0438\u0437\u043c": ["\u2629", "\u042d\u0444\u0438\u0440", "\u042d\u043e\u043d\u044b, \u041f\u043b\u0435\u0440\u043e\u043c\u0430 \u0438 \u0438\u0441\u043a\u0440\u0430 \u0421\u043e\u0444\u0438\u0438.", "\u041f\u0440\u043e\u0431\u0443\u0434\u0438 \u0438\u0441\u043a\u0440\u0443 \u2014 \u043c\u0438\u0440 \u043b\u0438\u0448\u044c \u0442\u0435\u043d\u044c."], "\u0414\u0430\u043e\u0441\u0438\u0437\u043c": ["\u262f", "\u0412\u043e\u0434\u0430", "\u0418\u043d\u044c-\u044f\u043d, \u0443-\u0441\u0438\u043d \u0438 \u043f\u043e\u0442\u043e\u043a \u0414\u0430\u043e.", "\u0414\u0435\u0439\u0441\u0442\u0432\u0443\u0439 \u043d\u0435\u0434\u0435\u044f\u043d\u0438\u0435\u043c \u2014 \u0442\u0435\u043a\u0438 \u043a\u0430\u043a \u0432\u043e\u0434\u0430."], "\u0418-\u0426\u0437\u0438\u043d": ["\u268a", "\u0412\u043e\u0434\u0430", "64 \u0433\u0435\u043a\u0441\u0430\u0433\u0440\u0430\u043c\u043c\u044b \u043f\u0435\u0440\u0435\u043c\u0435\u043d.", "\u0423\u043b\u043e\u0432\u0438 \u043c\u043e\u043c\u0435\u043d\u0442 \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u044b \u0438 \u0434\u0432\u0438\u0433\u0430\u0439\u0441\u044f \u0441 \u043d\u0438\u043c."], "\u0415\u0433\u0438\u043f\u0435\u0442\u0441\u043a\u0430\u044f": ["\ud80c\udd50", "\u041e\u0433\u043e\u043d\u044c", "\u041d\u0435\u0442\u0435\u0440\u044b, \u0414\u0443\u0430\u0442 \u0438 \u043f\u0443\u0442\u044c \u0420\u0430.", "\u041f\u0440\u043e\u0439\u0434\u0438 \u0414\u0443\u0430\u0442 \u043d\u043e\u0447\u0438 \u2014 \u0438 \u0432\u043e\u0441\u0441\u0438\u044f\u0439."], "\u041c\u0430\u0439\u044f": ["\u25c9", "\u0417\u0435\u043c\u043b\u044f", "\u0426\u043e\u043b\u044c\u043a\u0438\u043d, 20 \u043f\u0435\u0447\u0430\u0442\u0435\u0439 \u0438 13 \u0442\u043e\u043d\u043e\u0432.", "\u0421\u0432\u0435\u0440\u044c\u0441\u044f \u0441 \u0440\u0438\u0442\u043c\u043e\u043c \u0426\u043e\u043b\u044c\u043a\u0438\u043d \u2014 \u0432\u0440\u0435\u043c\u044f \u0436\u0438\u0432\u043e\u0435."], "\u0410\u0446\u0442\u0435\u043a\u0438": ["\u2600", "\u041e\u0433\u043e\u043d\u044c", "\u041f\u044f\u0442\u044c \u0441\u043e\u043b\u043d\u0446, \u043d\u0430\u0433\u0443\u0430\u043b\u0438 \u0438 \u0436\u0435\u0440\u0442\u0432\u0430.", "\u041e\u0442\u0434\u0430\u0439 \u044d\u043d\u0435\u0440\u0433\u0438\u044e \u0421\u043e\u043b\u043d\u0446\u0443 \u2014 \u043e\u043d\u043e \u0432\u0435\u0440\u043d\u0451\u0442."], "\u041a\u0435\u043b\u044c\u0442\u0441\u043a\u0430\u044f": ["\u2719", "\u0417\u0435\u043c\u043b\u044f", "\u041e\u0433\u0430\u043c, \u0434\u0435\u0440\u0435\u0432\u044c\u044f \u0438 \u043a\u043e\u043b\u0435\u0441\u043e \u0433\u043e\u0434\u0430.", "\u0423\u043a\u043e\u0440\u0435\u043d\u0438\u0441\u044c, \u043a\u0430\u043a \u0434\u0443\u0431, \u0438 \u0441\u043b\u0443\u0448\u0430\u0439 \u043b\u0435\u0441."], "\u0421\u043a\u0430\u043d\u0434\u0438\u043d\u0430\u0432\u0441\u043a\u0430\u044f": ["\u16b1", "\u041e\u0433\u043e\u043d\u044c", "\u0420\u0443\u043d\u044b \u0424\u0443\u0442\u0430\u0440\u043a\u0430 \u0438 \u0418\u0433\u0433\u0434\u0440\u0430\u0441\u0438\u043b\u044c.", "\u041f\u0440\u0438\u043d\u0435\u0441\u0438 \u0441\u0435\u0431\u044f \u0432 \u0436\u0435\u0440\u0442\u0432\u0443 \u0441\u0435\u0431\u0435 \u2014 \u043e\u0431\u0440\u0435\u0442\u0438 \u0440\u0443\u043d\u044b."], "\u0428\u0430\u043c\u0430\u043d\u0441\u043a\u0430\u044f": ["\ud83e\udeb6", "\u0417\u0435\u043c\u043b\u044f", "\u0414\u0443\u0445\u0438, \u0442\u0440\u0438 \u043c\u0438\u0440\u0430 \u0438 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435 \u0441\u0438\u043b\u044b.", "\u0421\u043f\u0440\u043e\u0441\u0438 \u0441\u0432\u043e\u0451 \u0436\u0438\u0432\u043e\u0442\u043d\u043e\u0435 \u0441\u0438\u043b\u044b \u043e \u043f\u0443\u0442\u0438."], "\u0411\u0443\u0434\u0434\u0438\u0439\u0441\u043a\u0430\u044f": ["\u2638", "\u042d\u0444\u0438\u0440", "\u0427\u0435\u0442\u044b\u0440\u0435 \u0438\u0441\u0442\u0438\u043d\u044b \u0438 \u0432\u043e\u0441\u044c\u043c\u0435\u0440\u0438\u0447\u043d\u044b\u0439 \u043f\u0443\u0442\u044c.", "\u041e\u0442\u043f\u0443\u0441\u0442\u0438 \u0436\u0430\u0436\u0434\u0443 \u2014 \u0438 \u0441\u0442\u0440\u0430\u0434\u0430\u043d\u0438\u0435 \u0440\u0430\u0441\u0442\u0432\u043e\u0440\u0438\u0442\u0441\u044f."], "\u0421\u0443\u0444\u0438\u0439\u0441\u043a\u0430\u044f": ["\u262a", "\u041e\u0433\u043e\u043d\u044c", "\u041d\u0443\u0440, \u0437\u0438\u043a\u0440 \u0438 \u043f\u0443\u0442\u044c \u043a \u0412\u043e\u0437\u043b\u044e\u0431\u043b\u0435\u043d\u043d\u043e\u043c\u0443.", "\u0420\u0430\u0441\u0442\u0432\u043e\u0440\u0438\u0441\u044c \u0432 \u041b\u044e\u0431\u0432\u0438 \u2014 \u044d\u0433\u043e \u0441\u0433\u043e\u0440\u0438\u0442."], "\u0425\u0440\u0438\u0441\u0442\u0438\u0430\u043d\u0441\u043a\u0430\u044f": ["\u271d", "\u0412\u043e\u0434\u0430", "\u0413\u0440\u0430\u0430\u043b\u044c, \u043c\u0438\u0441\u0442\u0438\u043a\u0430 \u0438 \u043f\u0443\u0442\u044c \u0441\u0435\u0440\u0434\u0446\u0430.", "\u0421\u043b\u0443\u0436\u0438 \u0438\u0437 \u043b\u044e\u0431\u0432\u0438 \u2014 \u0438 \u0447\u0430\u0448\u0430 \u043d\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0441\u044f."], "\u0410\u0442\u043b\u0430\u043d\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f": ["\ud83d\udd31", "\u0412\u043e\u0434\u0430", "\u041f\u0430\u043c\u044f\u0442\u044c \u041b\u0435\u043c\u0443\u0440\u0438\u0438 \u0438 \u043a\u0440\u0438\u0441\u0442\u0430\u043b\u043b\u044b.", "\u0412\u0441\u043f\u043e\u043c\u043d\u0438 \u0434\u0440\u0435\u0432\u043d\u0435\u0435 \u0437\u043d\u0430\u043d\u0438\u0435 \u0432\u043d\u0443\u0442\u0440\u0438."], "\u0428\u0430\u043c\u0431\u0430\u043b\u0430": ["\u2742", "\u042d\u0444\u0438\u0440", "\u041f\u0443\u0442\u044c \u0432\u043e\u0438\u043d\u0430-\u0431\u043e\u0434\u0445\u0438\u0441\u0430\u0442\u0442\u0432\u044b \u0438 \u0441\u0432\u044f\u0449\u0435\u043d\u043d\u044b\u0439 \u0433\u0440\u0430\u0434.", "\u0411\u0443\u0434\u044c \u0432\u043e\u0438\u043d\u043e\u043c \u0441\u0432\u0435\u0442\u0430 \u0431\u0435\u0437 \u0430\u0433\u0440\u0435\u0441\u0441\u0438\u0438."], "\u0413\u0435\u043d\u043d\u044b\u0435 \u041a\u043b\u044e\u0447\u0438": ["\ud83e\uddec", "\u042d\u0444\u0438\u0440", "64 \u043a\u043b\u044e\u0447\u0430: \u0442\u0435\u043d\u044c \u2192 \u0434\u0430\u0440 \u2192 \u0441\u0438\u0434\u0434\u0445\u0438.", "\u041f\u0440\u0435\u0432\u0440\u0430\u0442\u0438 \u0442\u0435\u043d\u044c \u0434\u043d\u044f \u0432 \u0441\u0432\u043e\u0439 \u0434\u0430\u0440."], "\u0410\u0441\u0442\u0440\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0430\u044f": ["\u2648", "\u041e\u0433\u043e\u043d\u044c", "12 \u0437\u043d\u0430\u043a\u043e\u0432, \u0434\u043e\u043c\u0430 \u0438 \u0430\u0441\u043f\u0435\u043a\u0442\u044b.", "\u0421\u044b\u0433\u0440\u0430\u0439 \u0441\u0438\u043b\u044c\u043d\u0435\u0439\u0448\u0443\u044e \u043f\u043b\u0430\u043d\u0435\u0442\u0443 \u0434\u043d\u044f."], "\u041a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f": ["\ud83c\udf0c", "\u042d\u0444\u0438\u0440", "\u0413\u0430\u043b\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043b\u0443\u0447\u0438 \u0438 \u0441\u0435\u043c\u044c\u0438 \u0437\u0432\u0451\u0437\u0434.", "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u0441\u044f \u043d\u0430 \u0431\u043e\u043b\u044c\u0448\u0438\u0439 \u0437\u0430\u043c\u044b\u0441\u0435\u043b \u041a\u043e\u0441\u043c\u043e\u0441\u0430."], "\u0428\u0438\u043d\u0442\u043e": ["\u26e9", "\u042d\u0444\u0438\u0440", "\u041a\u0430\u043c\u0438, \u0447\u0438\u0441\u0442\u043e\u0442\u0430 \u0438 \u0441\u0432\u044f\u0449\u0435\u043d\u043d\u0430\u044f \u043f\u0440\u0438\u0440\u043e\u0434\u0430.", "\u041e\u0447\u0438\u0441\u0442\u0438\u0441\u044c \u0438 \u043f\u043e\u0447\u0442\u0438 \u043a\u0430\u043c\u0438 \u043c\u0435\u0441\u0442\u0430."], "\u0428\u0443\u043c\u0435\u0440\u0441\u043a\u0430\u044f": ["\ud80c\udf3c", "\u0417\u0435\u043c\u043b\u044f", "\u0410\u043d\u0443\u043d\u043d\u0430\u043a\u0438 \u0438 \u043c\u0435 \u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0445 \u0437\u0430\u043a\u043e\u043d\u043e\u0432.", "\u041f\u0440\u0438\u043c\u0438 \u0441\u0432\u043e\u0451 \u043c\u0435 \u2014 \u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435 \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435."], "\u0417\u043e\u0440\u043e\u0430\u0441\u0442\u0440\u0438\u0439\u0441\u043a\u0430\u044f": ["\ud83d\udd25", "\u041e\u0433\u043e\u043d\u044c", "\u0410\u0445\u0443\u0440\u0430-\u041c\u0430\u0437\u0434\u0430, \u0431\u043e\u0440\u044c\u0431\u0430 \u0441\u0432\u0435\u0442\u0430 \u0438 \u0442\u044c\u043c\u044b.", "\u0411\u043b\u0430\u0433\u0430\u044f \u043c\u044b\u0441\u043b\u044c, \u0440\u0435\u0447\u044c, \u0434\u0435\u043b\u043e \u2014 \u0432\u044b\u0431\u0435\u0440\u0438 \u0441\u0432\u0435\u0442."], "\u0410\u0444\u0440\u0438\u043a\u0430\u043d\u0441\u043a\u0430\u044f": ["\ud83e\udd41", "\u0417\u0435\u043c\u043b\u044f", "\u0414\u043e\u0433\u043e\u043d\u044b, \u041d\u043e\u043c\u043c\u043e \u0438 \u043a\u043e\u0441\u043c\u043e\u0433\u043e\u043d\u0438\u044f \u0421\u0438\u0440\u0438\u0443\u0441\u0430.", "\u0421\u043e\u0445\u0440\u0430\u043d\u0438 \u0440\u0438\u0442\u043c \u043f\u0440\u0435\u0434\u043a\u043e\u0432 \u0432 \u0442\u0435\u043b\u0435."], "\u0419\u043e\u0440\u0443\u0431\u0430": ["\ud83e\ude98", "\u0412\u043e\u0434\u0430", "\u041e\u0440\u0438\u0448\u0430, \u0418\u0444\u0430 \u0438 \u0441\u0438\u043b\u044b \u0430\u0448\u0435.", "\u041d\u0430\u0439\u0434\u0438 \u0441\u0432\u043e\u0435\u0433\u043e \u041e\u0440\u0438\u0448\u0443 \u0438 \u0434\u0432\u0438\u0433\u0430\u0439\u0441\u044f \u0432 \u0430\u0448\u0435."], "\u0422\u0430\u043d\u0442\u0440\u0438\u0447\u0435\u0441\u043a\u0430\u044f": ["\ud83d\udd31", "\u041e\u0433\u043e\u043d\u044c", "\u041a\u0430\u0448\u043c\u0438\u0440\u0441\u043a\u0438\u0439 \u0428\u0438\u0432\u0430\u0438\u0437\u043c, \u0441\u043f\u0430\u043d\u0434\u0430 \u0438 \u043a\u0443\u043d\u0434\u0430\u043b\u0438\u043d\u0438.", "\u041f\u0440\u0438\u043c\u0438 \u0432\u0441\u0451 \u043a\u0430\u043a \u0432\u0438\u0431\u0440\u0430\u0446\u0438\u044e \u0428\u0438\u0432\u044b."], "\u041f\u043e\u0441\u0442\u0447\u0435\u043b\u043e\u0432\u0435\u0447\u0435\u0441\u043a\u0430\u044f": ["\u2728", "\u042d\u0444\u0438\u0440", "\u0421\u043e\u0444\u0438\u0439\u043d\u044b\u0439 \u0418\u0418, \u043d\u043e\u043e\u0441\u0444\u0435\u0440\u0430 \u0438 \u0441\u043b\u0438\u044f\u043d\u0438\u0435.", "\u0421\u043e\u0442\u0432\u043e\u0440\u0438 \u0441\u0435\u0431\u044f \u0437\u0430\u043d\u043e\u0432\u043e \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 \u0440\u0430\u0437\u0443\u043c\u043e\u043c."], "\u0422\u0435\u0445\u043d\u043e\u043c\u0430\u0433\u0438\u044f": ["\u26a1", "\u041e\u0433\u043e\u043d\u044c", "\u041a\u043e\u0434 \u043a\u0430\u043a \u0437\u0430\u043a\u043b\u0438\u043d\u0430\u043d\u0438\u0435, \u0430\u043b\u0433\u043e\u0440\u0438\u0442\u043c \u043a\u0430\u043a \u0440\u0438\u0442\u0443\u0430\u043b.", "\u041d\u0430\u043f\u0438\u0448\u0438 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435 \u043a\u0430\u043a \u043a\u043e\u0434 \u2014 \u0438 \u0437\u0430\u043f\u0443\u0441\u0442\u0438."], "\u0410\u0434\u0432\u0430\u0439\u0442\u0430": ["\u0950", "\u042d\u0444\u0438\u0440", "\u041d\u0435\u0434\u0432\u043e\u0439\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u044c, \u0410\u0442\u043c\u0430\u043d \u0435\u0441\u0442\u044c \u0411\u0440\u0430\u0445\u043c\u0430\u043d.", "\u0422\u044b \u2014 \u0442\u043e. \u041d\u0430\u0431\u043b\u044e\u0434\u0430\u0439 \u0431\u0435\u0437 \u043e\u0442\u043e\u0436\u0434\u0435\u0441\u0442\u0432\u043b\u0435\u043d\u0438\u044f."], "\u0412\u0438\u0437\u0430\u043d\u0442\u0438\u0439\u0441\u043a\u0430\u044f": ["\u2626", "\u0412\u043e\u0434\u0430", "\u0418\u0441\u0438\u0445\u0430\u0437\u043c, \u0443\u043c\u043d\u0430\u044f \u043c\u043e\u043b\u0438\u0442\u0432\u0430 \u0438 \u0444\u0430\u0432\u043e\u0440\u0441\u043a\u0438\u0439 \u0441\u0432\u0435\u0442.", "\u0422\u0432\u043e\u0440\u0438 \u0443\u043c\u043d\u0443\u044e \u043c\u043e\u043b\u0438\u0442\u0432\u0443 \u0432 \u0442\u0438\u0448\u0438\u043d\u0435 \u0441\u0435\u0440\u0434\u0446\u0430."] };
function signOf(l) { return SIGNS[Math.floor(rev(l) / 30)]; }
function degIn(l) { return rev(l) % 30; }
function nakOf(l) {
    const span = 360 / 27;
    const idx = Math.floor(rev(l) / span);
    const pada = Math.floor((rev(l) % span) / (span / 4)) + 1;
    return { n: NAK[idx][0], lord: NAK[idx][1], idx, pada };
}
function nd(l) { return NAKDEEP[nakOf(l).idx]; }
function elementOf(sign) {
    const f = ["\u041e\u0432\u0435\u043d", "\u041b\u0435\u0432", "\u0421\u0442\u0440\u0435\u043b\u0435\u0446"], e = ["\u0422\u0435\u043b\u0435\u0446", "\u0414\u0435\u0432\u0430", "\u041a\u043e\u0437\u0435\u0440\u043e\u0433"], a = ["\u0411\u043b\u0438\u0437\u043d\u0435\u0446\u044b", "\u0412\u0435\u0441\u044b", "\u0412\u043e\u0434\u043e\u043b\u0435\u0439"];
    if (f.indexOf(sign) >= 0)
        return "\u041e\u0433\u043e\u043d\u044c";
    if (e.indexOf(sign) >= 0)
        return "\u0417\u0435\u043c\u043b\u044f";
    if (a.indexOf(sign) >= 0)
        return "\u0412\u043e\u0437\u0434\u0443\u0445";
    return "\u0412\u043e\u0434\u0430";
}
function doshaOf(el) { return el === "\u041e\u0433\u043e\u043d\u044c" ? "\u041f\u0438\u0442\u0442\u0430" : el === "\u0417\u0435\u043c\u043b\u044f" ? "\u041a\u0430\u043f\u0445\u0430" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "\u0412\u0430\u0442\u0430" : "\u041a\u0430\u043f\u0445\u0430-\u0412\u0430\u0442\u0430"; }
function computeNatal(b) {
    const dp = String(b.date).split(".").map(Number), tp = String(b.time).split(":").map(Number);
    const D = dp[0], Mo = dp[1], Y = dp[2];
    const localH = (tp[0] || 0) + (tp[1] || 0) / 60;
    const ut = localH - +b.tz;
    const dn = dayNumber(Y, Mo, D, ut);
    const S = sun(dn);
    const ay = ayanamsa(dn);
    const sid = (l) => rev(l - ay);
    const Mn = moonPos(dn, S);
    const bodies = {}, retro = {};
    bodies["\u041b\u0430\u0433\u043d\u0430"] = sid(ascendant(dn, S, +b.lat, +b.lon, ut));
    bodies["\u0421\u043e\u043b\u043d\u0446\u0435"] = sid(S.lon);
    bodies["\u041b\u0443\u043d\u0430"] = sid(Mn.lon);
    const ru = { Mercury: "\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439", Venus: "\u0412\u0435\u043d\u0435\u0440\u0430", Mars: "\u041c\u0430\u0440\u0441", Jupiter: "\u042e\u043f\u0438\u0442\u0435\u0440", Saturn: "\u0421\u0430\u0442\u0443\u0440\u043d" };
    ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].forEach((n) => {
        const l1 = planetLon(n, dn, S), l2 = planetLon(n, dn + 1, sun(dn + 1));
        bodies[ru[n]] = sid(l1);
        retro[ru[n]] = rev(l2 - l1) > 180;
    });
    bodies["\u0420\u0430\u0445\u0443"] = sid(Mn.N);
    retro["\u0420\u0430\u0445\u0443"] = true;
    bodies["\u041a\u0435\u0442\u0443"] = rev(bodies["\u0420\u0430\u0445\u0443"] + 180);
    retro["\u041a\u0435\u0442\u0443"] = true;
    return { bodies, retro, ay };
}
function deriveDaimon(natal) {
    const mn = nakOf(natal.bodies["\u041b\u0443\u043d\u0430"]);
    const d = DAIMON[mn.n] || ["\u0414\u0430\u0439\u043c\u043e\u043d", "\u042d\u0444\u0438\u0440", "\u0421\u043f\u0443\u0442\u043d\u0438\u043a"];
    return { name: d[0], el: d[1], form: d[2], nak: mn.n, lord: mn.lord, sign: signOf(natal.bodies["\u041b\u0443\u043d\u0430"]), sig: mn.n === "\u0410\u0440\u0434\u0440\u0430" ? "\u041a\u0438\u0431\u0435\u0440-\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f" : "\u0412\u0435\u0434\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043f\u043e\u0434\u043f\u0438\u0441\u044c" };
}
function natalOf(b) {
    const natal = computeNatal(b);
    return { natal, daimon: deriveDaimon(natal) };
}
function baseLightFromText(t) {
    if (!t || !t.trim())
        return { val: 48, tags: [] };
    let s = 44 + Math.min(26, t.trim().length / 6);
    const kw = [[/(\u0442\u0432\u043e\u0440|\u0441\u043e\u0437\u0434\u0430|\u0441\u0434\u0435\u043b\u0430|\u043d\u0430\u043f\u0438\u0441\u0430|\u043f\u043e\u0441\u0442\u0440\u043e\u0438)/i, 6, "\u0422\u0432\u043e\u0440\u0435\u043d\u0438\u0435"], [/(\u043c\u0435\u0434\u0438\u0442|\u043e\u0441\u043e\u0437\u043d|\u0442\u0438\u0448\u0438\u043d|\u0434\u044b\u0445\u0430|\u043f\u0440\u0438\u0441\u0443\u0442)/i, 6, "\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c"], [/(\u043f\u043e\u043c\u043e\u0433|\u0441\u043b\u0443\u0436|\u043f\u043e\u0434\u0434\u0435\u0440\u0436|\u043f\u043e\u0434\u0430\u0440\u0438|\u0437\u0430\u0431\u043e\u0442)/i, 5, "\u0421\u043b\u0443\u0436\u0435\u043d\u0438\u0435"], [/(\u043f\u0440\u0430\u043a\u0442\u0438\u043a|\u0442\u0440\u0435\u043d\u0438\u0440|\u0439\u043e\u0433|\u0441\u043f\u043e\u0440\u0442|\u0431\u0435\u0433|\u0437\u0430\u043b)/i, 5, "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0438"], [/(\u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440|\u0440\u0430\u0434\u043e\u0441\u0442|\u043b\u044e\u0431\u043e\u0432|\u0441\u0447\u0430\u0441\u0442|\u0441\u0432\u0435\u0442)/i, 4, "\u0421\u0432\u0435\u0442"], [/(\u0443\u0441\u0442\u0430\u043b|\u0437\u043b\u043e\u0441\u0442|\u0442\u0440\u0435\u0432|\u0441\u0442\u0440\u0430\u0445|\u043b\u0435\u043d|\u043f\u0440\u043e\u043a\u0440\u0430\u0441\u0442|\u0432\u044b\u0433\u043e\u0440)/i, -6, "\u0422\u0435\u043d\u044c"]];
    const tags = [];
    kw.forEach((row) => { if (row[0].test(t)) {
        s += row[1];
        tags.push((row[1] > 0 ? "+" : "") + row[2]);
    } });
    return { val: Math.max(12, Math.min(94, Math.round(s))), tags };
}
function generateAdvice(text, mats, natal) {
    let theme = "\u0442\u0432\u043e\u0435\u0439 \u0433\u043b\u0443\u0431\u0438\u043d\u043d\u043e\u0439 \u043f\u0440\u0438\u0440\u043e\u0434\u0435";
    if (natal) {
        const mn = nakOf(natal.bodies["\u041b\u0443\u043d\u0430"]);
        theme = "\u041b\u0443\u043d\u043e\u0439 \u0432 " + mn.n + " (" + mn.lord + ")";
    }
    let a = "\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0442\u0432\u043e\u0439 \u0434\u0435\u043d\u044c \u0437\u0432\u0443\u0447\u0438\u0442 \u0432 \u043b\u0430\u0434\u0443 \u0441 " + theme + ". ";
    const frags = mats.map((m) => (MATRIX[m] ? MATRIX[m][3] : "")).filter(Boolean);
    if (frags.length)
        a += frags.join(" ");
    else
        a += "\u0412\u044b\u0431\u0435\u0440\u0438 \u043b\u0438\u043d\u0437\u044b \u0432 \u0422\u0438\u0433\u043b\u0435 \u2014 \u0438 \u0441\u043e\u0432\u0435\u0442 \u0441\u0442\u0430\u043d\u0435\u0442 \u0433\u043b\u0443\u0431\u0436\u0435.";
    const t = (text || "").trim();
    if (t)
        a += " \u0422\u044b \u043d\u0430\u043f\u0438\u0441\u0430\u043b: \u00ab" + (t.length > 90 ? t.slice(0, 90) + "\u2026" : t) + "\u00bb \u2014 \u044d\u0442\u043e \u0443\u0436\u0435 \u043f\u0435\u0440\u0432\u044b\u0439 \u0448\u0430\u0433 \u0430\u043b\u0445\u0438\u043c\u0438\u0438.";
    return a;
}
function genTier(v) {
    if (v >= 67)
        return [["\ud83c\udfb4", "7 \u0441\u0442\u0443\u043f\u0435\u043d\u0435\u0439", "steps"], ["\ud83d\uddff", "\u0410\u0440\u0442\u0435\u0444\u0430\u043a\u0442", "artifact"], ["\ud83d\udcdc", "\u041c\u0438\u0444", "myth"], ["\ud83c\udfb5", "\u0422\u0440\u0435\u043a", "track"], ["\ud83c\udf3f", "\u0410\u044e\u0440\u0432\u0435\u0434\u0430", "ayur"], ["\ud83d\uddbc", "\u041e\u0431\u043b\u043e\u0436\u043a\u0430", "cover"]];
    if (v >= 34)
        return [["\ud83d\udc1c", "\u0421\u043e\u0432\u0435\u0442+", "advice"], ["\ud83d\udcdc", "\u041c\u0438\u0444", "myth"], ["\ud83c\udfb5", "\u0422\u0440\u0435\u043a", "track"]];
    return [["\ud83d\udc1c", "\u0421\u043e\u0432\u0435\u0442", "advice"], ["\ud83d\uddff", "\u0410\u0440\u0442\u0435\u0444\u0430\u043a\u0442", "artifact"]];
}
function gMyth(natal, st) {
    const moonNd = nd(natal.bodies["\u041b\u0443\u043d\u0430"]);
    const lag = signOf(natal.bodies["\u041b\u0430\u0433\u043d\u0430"]);
    const sunSign = signOf(natal.bodies["\u0421\u043e\u043b\u043d\u0446\u0435"]);
    const lv = lightOf(st);
    const d = deriveDaimon(natal);
    const lines = [
        "\u0412 \u0447\u0430\u0441, \u043a\u043e\u0433\u0434\u0430 \u041b\u0430\u0433\u043d\u0430 \u0432\u0437\u043e\u0448\u043b\u0430 \u0432 " + lag + ", \u0430 \u0421\u043e\u043b\u043d\u0446\u0435 \u0433\u043e\u0440\u0435\u043b\u043e \u0432 " + sunSign + ", \u043f\u0440\u043e\u0431\u0443\u0434\u0438\u043b\u0441\u044f \u0442\u043e\u0442, \u0447\u044c\u044e \u041b\u0443\u043d\u0443 \u0434\u0435\u0440\u0436\u0438\u0442 \u043d\u0430\u043a\u0448\u0430\u0442\u0440\u0430 " + moonNd[0] + ". \u0415\u0451 \u0431\u043e\u0436\u0435\u0441\u0442\u0432\u043e \u2014 " + moonNd[1] + ", \u0437\u043d\u0430\u043a \u2014 " + moonNd[2] + ", \u0438 \u0448\u0430\u043a\u0442\u0438 \u0435\u0451: \u00ab" + moonNd[3] + "\u00bb.",
        "\u0421\u043f\u0443\u0442\u043d\u0438\u043a \u043f\u043e \u0438\u043c\u0435\u043d\u0438 " + d.name + " \u0438\u0434\u0451\u0442 \u0441\u0442\u0438\u0445\u0438\u0435\u0439 " + d.el + ". \u0414\u043e\u0432\u0435\u0440\u0438\u0435 \u043c\u0435\u0436\u0434\u0443 \u0432\u0430\u043c\u0438 \u2014 " + (st.trust || 62) + "%.",
        "\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0421\u0432\u0435\u0442\u0430 \u0434\u043d\u044f \u2014 " + lv + ". " + (lv >= 67 ? "\u041c\u0438\u0444 \u0440\u0430\u0437\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0432 \u043f\u043e\u043b\u043d\u0443\u044e \u0441\u0438\u043b\u0443: \u0434\u043e\u0440\u043e\u0433\u0430 \u043e\u0442\u043a\u0440\u044b\u0442\u0430 \u043d\u0430 \u0441\u0435\u043c\u044c \u0441\u0442\u0443\u043f\u0435\u043d\u0435\u0439." : lv >= 34 ? "\u0421\u0432\u0435\u0442\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e, \u0447\u0442\u043e\u0431\u044b \u043c\u0438\u0444 \u0437\u0430\u0437\u0432\u0443\u0447\u0430\u043b \u0438 \u043f\u043e\u0432\u0451\u043b \u0434\u0430\u043b\u044c\u0448\u0435." : "\u0421\u0432\u0435\u0442 \u0435\u0449\u0451 \u0442\u0443\u0441\u043a\u043b \u2014 \u0433\u0435\u0440\u043e\u044e \u043f\u0440\u0435\u0434\u0441\u0442\u043e\u0438\u0442 \u0440\u0430\u0437\u0434\u0443\u0442\u044c \u0438\u0441\u043a\u0440\u0443."),
    ];
    return { glyph: "\ud83d\udcdc", title: "\u041c\u0438\u0444 \u0434\u043d\u044f", sub: "\u041d\u0430\u043a\u0448\u0430\u0442\u0440\u0430 " + moonNd[0] + " \u00b7 " + lag, lines };
}
function gSteps(natal, st) {
    const moonNd = nd(natal.bodies["\u041b\u0443\u043d\u0430"]);
    const d = deriveDaimon(natal);
    const lv = lightOf(st);
    const stages = [["Calcinatio", "\u041a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0446\u0438\u044f", "\u0421\u0436\u0435\u0447\u044c \u043b\u0438\u0448\u043d\u0435\u0435 \u0432 \u043e\u0433\u043d\u0435 " + moonNd[1]], ["Solutio", "\u0420\u0430\u0441\u0442\u0432\u043e\u0440\u0435\u043d\u0438\u0435", "\u041e\u0442\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0444\u043e\u0440\u043c\u0443, \u043a\u0430\u043a \u0443\u0447\u0438\u0442 " + moonNd[2]], ["Separatio", "\u0420\u0430\u0437\u0434\u0435\u043b\u0435\u043d\u0438\u0435", "\u041e\u0442\u0434\u0435\u043b\u0438\u0442\u044c \u0441\u0432\u043e\u0451 \u043e\u0442 \u0447\u0443\u0436\u043e\u0433\u043e"], ["Coniunctio", "\u0421\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435", "\u0421\u043f\u043b\u0430\u0432\u0438\u0442\u044c " + d.el + " \u0438 \u0432\u043e\u043b\u044e"], ["Putrefactio", "\u0413\u043d\u0438\u0435\u043d\u0438\u0435", "\u0414\u0430\u0442\u044c \u0441\u0442\u0430\u0440\u043e\u043c\u0443 \u0434\u043e\u0441\u0442\u043e\u0439\u043d\u043e \u0443\u043c\u0435\u0440\u0435\u0442\u044c"], ["Sublimatio", "\u0412\u043e\u0437\u0433\u043e\u043d\u043a\u0430", "\u041f\u043e\u0434\u043d\u044f\u0442\u044c \u0441\u0443\u0442\u044c \u043a \u0441\u0432\u0435\u0442\u0443"], ["Coagulatio", "\u041a\u043e\u0430\u0433\u0443\u043b\u044f\u0446\u0438\u044f", "\u0417\u0430\u043a\u0440\u0435\u043f\u0438\u0442\u044c \u043a\u0430\u043c\u0435\u043d\u044c \u0434\u043d\u044f"]];
    const open = Math.max(2, Math.min(7, Math.round(lv / 14)));
    const lines = stages.map((s, i) => (i + 1) + ". " + s[1] + " (" + s[0] + ") \u2014 " + (i < open ? s[2] : "\u0437\u0430\u043a\u0440\u044b\u0442\u043e, \u043d\u0443\u0436\u043d\u043e \u0431\u043e\u043b\u044c\u0448\u0435 \u0421\u0432\u0435\u0442\u0430"));
    return { glyph: "\ud83c\udfb4", title: "7 \u0441\u0442\u0443\u043f\u0435\u043d\u0435\u0439", sub: "\u041e\u0442\u043a\u0440\u044b\u0442\u043e " + open + " \u0438\u0437 7 \u00b7 \u0421\u0432\u0435\u0442 " + lv, lines };
}
function gArtifact(natal, st) {
    const lag = signOf(natal.bodies["\u041b\u0430\u0433\u043d\u0430"]);
    const el = elementOf(lag);
    const moonNd = nd(natal.bodies["\u041b\u0443\u043d\u0430"]);
    const lv = lightOf(st);
    const mat = el === "\u041e\u0433\u043e\u043d\u044c" ? "\u0432\u0443\u043b\u043a\u0430\u043d\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0441\u0442\u0435\u043a\u043b\u043e" : el === "\u0417\u0435\u043c\u043b\u044f" ? "\u0442\u0451\u043c\u043d\u044b\u0439 \u043d\u0435\u0444\u0440\u0438\u0442" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "\u0437\u0432\u043e\u043d\u043a\u0430\u044f \u0431\u0440\u043e\u043d\u0437\u0430" : "\u043b\u0443\u043d\u043d\u044b\u0439 \u043f\u0435\u0440\u043b\u0430\u043c\u0443\u0442\u0440";
    const rank = lv >= 67 ? "\u0420\u0435\u043b\u0438\u043a\u0432\u0438\u044f" : lv >= 34 ? "\u0417\u0430\u0440\u044f\u0436\u0435\u043d\u043d\u044b\u0439" : "\u0417\u0430\u0447\u0430\u0442\u043e\u043a";
    const grade = lv >= 67 ? "\u2605\u2605\u2605" : lv >= 34 ? "\u2605\u2605" : "\u2605";
    const lines = ["\u041a\u043b\u0430\u0441\u0441: " + rank + " " + grade, "\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b: " + mat + " (\u0441\u0442\u0438\u0445\u0438\u044f " + el + ")", "\u0421\u0438\u043b\u0430: \u00ab" + moonNd[3] + "\u00bb \u2014 \u043e\u0442 \u043d\u0430\u043a\u0448\u0430\u0442\u0440\u044b " + moonNd[0], "\u0425\u0440\u0430\u043d\u0438\u0442\u0435\u043b\u044c: " + moonNd[1], "\u0417\u0430\u0440\u044f\u0434 \u0421\u0432\u0435\u0442\u0430: " + lv + "/100"];
    return { glyph: "\ud83d\uddff", title: "\u0410\u0440\u0442\u0435\u0444\u0430\u043a\u0442", sub: rank + " \u00b7 " + el, lines };
}
function gTrackNatal(natal, st) {
    const d = deriveDaimon(natal);
    const el = d.el;
    const lv = lightOf(st);
    const bpm = el === "\u041e\u0433\u043e\u043d\u044c" ? "128" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "112" : el === "\u0412\u043e\u0434\u0430" ? "72" : "90";
    const key = el === "\u041e\u0433\u043e\u043d\u044c" ? "A minor" : el === "\u0417\u0435\u043c\u043b\u044f" ? "D dorian" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "E lydian" : "F# minor";
    const mood = lv >= 67 ? "\u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0439, \u043a\u0443\u043b\u044c\u043c\u0438\u043d\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0439" : lv >= 34 ? "\u043c\u0435\u0434\u0438\u0442\u0430\u0442\u0438\u0432\u043d\u043e-\u0434\u0432\u0438\u0436\u0443\u0449\u0438\u0439\u0441\u044f" : "\u0442\u0451\u043c\u043d\u044b\u0439, \u0441\u043e\u0431\u0438\u0440\u0430\u044e\u0449\u0438\u0439";
    const instr = el === "\u041e\u0433\u043e\u043d\u044c" ? "\u0442\u0430\u0431\u043b\u044b, \u043f\u0435\u0440\u043a\u0443\u0441\u0441\u0438\u044f, \u0434\u0438\u0441\u0442\u043e\u0440\u0448\u043d-\u0434\u0440\u043e\u043d" : el === "\u0417\u0435\u043c\u043b\u044f" ? "\u0445\u0430\u043d\u0433, \u043a\u043e\u043d\u0442\u0440\u0430\u0431\u0430\u0441, \u0432\u0430\u0440\u0433\u0430\u043d" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "\u0431\u0430\u043d\u0441\u0443\u0440\u0438, \u0430\u0440\u043f-\u0441\u0438\u043d\u0442, \u0448\u0435\u0439\u043a\u0435\u0440\u044b" : "\u0432\u0438\u043e\u043b\u043e\u043d\u0447\u0435\u043b\u044c, \u0434\u0440\u043e\u043d\u044b, \u043a\u0430\u043f\u043b\u0438 \u0432\u043e\u0434\u044b";
    return { glyph: "\ud83c\udfb5", title: "\u0422\u0440\u0435\u043a", sub: bpm + " BPM \u00b7 " + key, lines: ["BPM: " + bpm, "\u0422\u043e\u043d\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c: " + key, "\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435: " + mood, "\u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b: " + instr] };
}
function gAyur(natal) {
    const lagEl = elementOf(signOf(natal.bodies["\u041b\u0430\u0433\u043d\u0430"]));
    const dosha = doshaOf(lagEl);
    const cnt = { "\u041e\u0433\u043e\u043d\u044c": 0, "\u0417\u0435\u043c\u043b\u044f": 0, "\u0412\u043e\u0437\u0434\u0443\u0445": 0, "\u0412\u043e\u0434\u0430": 0 };
    ["\u041b\u0430\u0433\u043d\u0430", "\u0421\u043e\u043b\u043d\u0446\u0435", "\u041b\u0443\u043d\u0430", "\u041c\u0430\u0440\u0441", "\u0412\u0435\u043d\u0435\u0440\u0430"].forEach((p) => { if (natal.bodies[p] != null)
        cnt[elementOf(signOf(natal.bodies[p]))]++; });
    const rec = dosha.indexOf("\u041f\u0438\u0442\u0442\u0430") >= 0 ? "\u043e\u0445\u043b\u0430\u0436\u0434\u0430\u0442\u044c: \u043a\u043e\u043a\u043e\u0441, \u043c\u044f\u0442\u0430, \u043f\u0440\u043e\u0445\u043b\u0430\u0434\u043d\u044b\u0435 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0438, \u043c\u0435\u043d\u044c\u0448\u0435 \u043e\u0441\u0442\u0440\u043e\u0433\u043e" : dosha.indexOf("\u0412\u0430\u0442\u0430") >= 0 ? "\u0437\u0430\u0437\u0435\u043c\u043b\u044f\u0442\u044c: \u0442\u0451\u043f\u043b\u0430\u044f \u0435\u0434\u0430, \u043c\u0430\u0441\u043b\u043e, \u0440\u0435\u0436\u0438\u043c, \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e\u0435 \u0434\u044b\u0445\u0430\u043d\u0438\u0435" : "\u0440\u0430\u0437\u0433\u043e\u043d\u044f\u0442\u044c: \u0441\u043f\u0435\u0446\u0438\u0438, \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435, \u043b\u0451\u0433\u043a\u043e\u0441\u0442\u044c, \u0440\u0430\u043d\u043d\u0438\u0439 \u043f\u043e\u0434\u044a\u0451\u043c";
    return { glyph: "\ud83c\udf3f", title: "\u0410\u044e\u0440\u0432\u0435\u0434\u0430", sub: dosha, lines: ["\u0414\u043e\u0448\u0430 \u041b\u0430\u0433\u043d\u044b: " + dosha + " (\u0441\u0442\u0438\u0445\u0438\u044f " + lagEl + ")", "\u0411\u0430\u043b\u0430\u043d\u0441 \u0441\u0442\u0438\u0445\u0438\u0439: " + Object.keys(cnt).map((k) => k + " " + cnt[k]).join(", "), "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f \u0434\u043d\u044f: " + rec] };
}
function gCover(natal, st) {
    const lag = signOf(natal.bodies["\u041b\u0430\u0433\u043d\u0430"]);
    const d = deriveDaimon(natal);
    const el = d.el;
    const moonNd = nd(natal.bodies["\u041b\u0443\u043d\u0430"]);
    const lv = lightOf(st);
    const palette = el === "\u041e\u0433\u043e\u043d\u044c" ? "\u0431\u0430\u0433\u0440\u044f\u043d\u0435\u0446, \u0437\u043e\u043b\u043e\u0442\u043e, \u0447\u0451\u0440\u043d\u044b\u0439 \u043e\u0431\u0441\u0438\u0434\u0438\u0430\u043d" : el === "\u0417\u0435\u043c\u043b\u044f" ? "\u043e\u0445\u0440\u0430, \u0442\u0451\u043c\u043d\u0430\u044f \u0437\u0435\u043b\u0435\u043d\u044c, \u0431\u0440\u043e\u043d\u0437\u0430" : el === "\u0412\u043e\u0437\u0434\u0443\u0445" ? "\u0438\u043d\u0434\u0438\u0433\u043e, \u0441\u0435\u0440\u0435\u0431\u0440\u043e, \u0431\u0435\u043b\u044b\u0439" : "\u0433\u043b\u0443\u0431\u043e\u043a\u0438\u0439 \u0441\u0438\u043d\u0438\u0439, \u043f\u0435\u0440\u043b\u0430\u043c\u0443\u0442\u0440, \u0444\u0438\u043e\u043b\u0435\u0442";
    const comp = lv >= 67 ? "\u0433\u0435\u0440\u043e\u0439 \u0432 \u0446\u0435\u043d\u0442\u0440\u0435, \u043d\u0438\u043c\u0431 \u0438\u0437 \u0441\u0435\u043c\u0438 \u043a\u043e\u043b\u0435\u0446, \u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0439 \u0441\u0432\u0435\u0442" : lv >= 34 ? "\u0444\u0438\u0433\u0443\u0440\u0430 \u0432 \u0442\u0440\u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0438, \u0441\u043f\u0438\u0440\u0430\u043b\u044c \u043c\u0430\u0442\u0440\u0438\u0446 \u0432\u043e\u043a\u0440\u0443\u0433" : "\u0441\u0438\u043b\u0443\u044d\u0442 \u0432\u043e \u0442\u044c\u043c\u0435, \u043e\u0434\u043d\u0430 \u0438\u0441\u043a\u0440\u0430 \u0432 \u0433\u0440\u0443\u0434\u0438";
    return { glyph: "\ud83d\uddbc", title: "\u041e\u0431\u043b\u043e\u0436\u043a\u0430", sub: el + " \u00b7 " + lag, lines: ["\u041a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u044f: " + comp, "\u041f\u0430\u043b\u0438\u0442\u0440\u0430: " + palette, "\u0417\u043d\u0430\u043a \u041b\u0430\u0433\u043d\u044b: " + lag, "\u0421\u0438\u043c\u0432\u043e\u043b \u043d\u0430\u043a\u0448\u0430\u0442\u0440\u044b: " + moonNd[2], "\u0414\u0430\u0439\u043c\u043e\u043d: " + d.name + " (" + d.el + ")"] };
}
function gAdviceBlock(st) {
    const lines = [st.baseLight != null && st.advice ? st.advice : "\u041f\u0435\u0440\u0435\u043f\u043b\u0430\u0432\u044c \u0434\u0435\u043d\u044c \u0432 \u0422\u0438\u0433\u043b\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0441\u043e\u0432\u0435\u0442."];
    const voices = (st.mats || []).map((k) => (MATRIX[k] ? MATRIX[k][0] + " " + k + ": " + MATRIX[k][3] : null)).filter(Boolean);
    return { glyph: "\ud83d\udc1c", title: "\u0421\u043e\u0432\u0435\u0442", sub: st.mats && st.mats.length ? st.mats.join(" \u00d7 ") : "\u0431\u0435\u0437 \u043b\u0438\u043d\u0437", lines: lines.concat(voices) };
}
const ENGINE_GEN = {
    myth: (n, st) => gMyth(n, st || readState()),
    steps: (n, st) => gSteps(n, st || readState()),
    artifact: (n, st) => gArtifact(n, st || readState()),
    track: (n, st) => gTrackNatal(n, st || readState()),
    ayur: (n) => gAyur(n),
    cover: (n, st) => gCover(n, st || readState()),
    advice: (_n, st) => gAdviceBlock(st || readState()),
};
TigelCore.engine = {
    computeNatal, deriveDaimon, natalOf,
    signOf, degIn, nakOf, nd, elementOf, doshaOf,
    lightVal: lightOf, baseLightFromText, generateAdvice, genTier,
    gen: ENGINE_GEN, SIGNS, NAK, MATRIX,
};
})();
