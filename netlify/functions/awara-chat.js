/* ═══ AWARA · Chat — Netlify Function (DeepSeek + Firestore) ═══
   POST /.netlify/functions/awara-chat  { player, messages }
   - Ключ DeepSeek берётся из переменной окружения, никогда не уходит клиенту.
   - Системный промпт можно переопределить документом config/system-prompt
     в Firestore (поле text/prompt/content) — без передеплоя.
   - Каждый обмен логируется в коллекцию chats.
   - Лимит: 100 запросов в день на игрока (счётчик в Firestore).
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
const DAILY_LIMIT = 100;

async function getSystemPromptOverride(db) {
  try {
    const snap = await db.collection('config').doc('system-prompt').get();
    if (snap.exists) {
      const d = snap.data() || {};
      return d.text || d.prompt || d.content || null;
    }
  } catch (err) {
    console.error('[awara-chat] system-prompt read failed:', err);
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

    const allowed = await checkAndBumpQuota(db, player);
    if (!allowed) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choices: [{ message: { role: 'assistant', content: 'На сегодня лимит обращений исчерпан (100 в день) — возвращайся завтра.' } }],
        }),
      };
    }

    const override = await getSystemPromptOverride(db);
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

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    db.collection('chats').add({
      player,
      ts: Date.now(),
      question: (lastUser && lastUser.content) || '',
      answer: reply,
    }).catch((err) => console.error('[awara-chat] log failed:', err));

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: reply } }] }),
    };
  } catch (err) {
    console.error('[awara-chat] error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
