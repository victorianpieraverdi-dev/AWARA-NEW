/* ═══ AWARA · Chat — Netlify Function (DeepSeek + Firestore) ═══
   POST /.netlify/functions/awara-chat  { player, messages }
   - Ключ DeepSeek берётся из переменной окружения, никогда не уходит клиенту.
   - Системный промпт можно переопределить документом config/system-prompt
     в Firestore (поле text/prompt/content) — без передеплоя.
   - Каждый обмен логируется в коллекцию chats.
   - Лимит: 20 запросов в день на игрока (счётчик в Firestore, chat_quota).
     При исчерпании — игровой ответ из config/quota-message (или дефолт).
   - Админ-код: сообщение "код: ...", сверяется с ADMIN_CODE из переменных
     окружения (никогда не хранится в коде/репо). Совпало — player_flags/
     {player}.unlimited=true снимает лимит; снять флаг — вручную в Firestore.
   Ответ в формате, совместимом с OpenAI: { choices: [{ message: { content } }] }
   ═══════════════════════════════════════════════════════════════ */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const DAILY_LIMIT = 20;
const DEFAULT_QUOTA_MESSAGE = 'Энергия дня исчерпана. Тигель должен остыть — вернись на рассвете.';
const CODE_RE = /^\s*код\s*:\s*(.+)$/i;

function aiReply(text) {
  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: text } }] }),
  };
}

async function getConfigText(db, docId) {
  try {
    const snap = await db.collection('config').doc(docId).get();
    if (snap.exists) {
      const d = snap.data() || {};
      return d.text || d.prompt || d.content || null;
    }
  } catch (err) {
    console.error(`[awara-chat] config/${docId} read failed:`, err);
  }
  return null;
}

// Атомарный счётчик "player_YYYY-MM-DD" — считает и проверяет лимит за один проход.
async function checkAndBumpQuota(db, player) {
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection('chat_quota').doc(player + '_' + day);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? (snap.data().count || 0) : 0;
    if (count >= DAILY_LIMIT) return false;
    tx.set(ref, { player, day, count: count + 1 }, { merge: true });
    return true;
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { player, messages } = body;

    if (!player || typeof player !== 'string') {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid player' }) };
    }
    if (!Array.isArray(messages) || !messages.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid messages' }) };
    }

    const db = getDb();
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const lastUserText = (lastUser && lastUser.content) || '';

    // Админ-код — перехватывается до ИИ и до счётчика лимита.
    const codeMatch = CODE_RE.exec(lastUserText);
    if (codeMatch) {
      const entered = codeMatch[1].trim();
      const adminCode = process.env.ADMIN_CODE || '';
      const ok = Boolean(adminCode) && entered === adminCode;
      if (ok) {
        await db.collection('player_flags').doc(player).set({ unlimited: true }, { merge: true });
      }
      return aiReply(ok ? 'Канал расширен' : 'Код не подошёл');
    }

    const flagSnap = await db.collection('player_flags').doc(player).get();
    const unlimited = flagSnap.exists && flagSnap.data().unlimited === true;

    if (!unlimited) {
      const allowed = await checkAndBumpQuota(db, player);
      if (!allowed) {
        const quotaMsg = (await getConfigText(db, 'quota-message')) || DEFAULT_QUOTA_MESSAGE;
        return aiReply(quotaMsg);
      }
    }

    const override = await getConfigText(db, 'system-prompt');
    const finalMessages = override ? [{ role: 'system', content: override }, ...messages] : messages;

    const dsRes = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({ model: 'deepseek-chat', messages: finalMessages, temperature: 0.85 }),
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      console.error('[awara-chat] DeepSeek error:', dsRes.status, errText);
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'AI upstream error' }) };
    }

    const dsJson = await dsRes.json();
    const reply = (dsJson.choices && dsJson.choices[0] && dsJson.choices[0].message && dsJson.choices[0].message.content) || '';

    db.collection('chats').add({
      player,
      ts: Date.now(),
      question: lastUserText,
      answer: reply,
    }).catch((err) => console.error('[awara-chat] log failed:', err));

    return aiReply(reply);
  } catch (err) {
    console.error('[awara-chat] error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
