// AWARA — minimal DeepSeek client for the React/istok world.
// Talks to the local AWARA proxy (awara-ai-proxy.cjs, port 8787), which injects
// the DeepSeek API key and forwards to api.deepseek.com (OpenAI-compatible).
//
// PRINCIPLE — advisory, never gating: every failure resolves to null so the UI
// can fall back quietly to its static hints. No throw escapes this module.

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const PROXY_PORT = "8787";
const DEFAULT_MODEL = "deepseek-chat";

// Resolve the proxy base URL:
// - If the page is already served by the proxy (port 8787), use a same-origin
//   (relative) call.
// - Otherwise (e.g. the Vite dev server on :5173), call the proxy on the same
//   host at port 8787. Requires the local AI server to be running.
function proxyBase(): string {
  try {
    if (typeof window === "undefined") return "";
    const loc = window.location;
    if (loc.port === PROXY_PORT) return ""; // same-origin
    const proto = loc.protocol === "https:" ? "https:" : "http:";
    const host = loc.hostname || "127.0.0.1";
    return proto + "//" + host + ":" + PROXY_PORT;
  } catch {
    return "http://127.0.0.1:" + PROXY_PORT;
  }
}

// Send a chat completion through the proxy. Resolves to the assistant text, or
// null on any error / empty response.
export async function aiChat(
  messages: AiMessage[],
  opts?: { temperature?: number; model?: string; signal?: AbortSignal },
): Promise<string | null> {
  try {
    const url = proxyBase() + "/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: (opts && opts.model) || DEFAULT_MODEL,
        messages,
        stream: false,
        temperature: opts && typeof opts.temperature === "number" ? opts.temperature : 0.8,
      }),
      signal: opts && opts.signal,
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const txt =
      json && json.choices && json.choices[0] && json.choices[0].message
        ? json.choices[0].message.content
        : null;
    return typeof txt === "string" && txt.trim() ? txt.trim() : null;
  } catch {
    return null;
  }
}

export default aiChat;
