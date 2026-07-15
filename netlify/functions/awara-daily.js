const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ── Firebase init (singleton) ──────────────────────────────────────────────
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

// ── JSON extractor (handles ```json ... ``` wrapping) ──────────────────────
function extractJson(text) {
  if (!text) throw new Error('Empty AI response');
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = match ? match[1] : text;
  return JSON.parse(raw.trim());
}

// ── OpenRouter call ────────────────────────────────────────────────────────
async function callAI(messages) {
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer':  'https://awara.app',
      'X-Title':       'AWARA',
    },
    body: JSON.stringify({ model, messages, temperature: 0.85 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── CORS headers ───────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── getDailyMeaning ────────────────────────────────────────────────────────
async function getDailyMeaning(body) {
  const { playerId, date, player = {}, force = false } = body;
  if (!playerId || !date) throw new Error('playerId and date required');

  const db  = getDb();
  const ref = db.collection('dailyMeanings').doc(playerId)
                .collection('days').doc(date);

  // Return cached unless force
  if (!force) {
    const snap = await ref.get();
    if (snap.exists) {
      return { cached: true, date, playerId, meaning: snap.data() };
    }
  }

  // Build prompt context
  const ctx = JSON.stringify({
    date,
    culture:     player.cultureMatrix?.name || 'Нейтраль',
    birth:       player.birthData || null,
    state:       player.state     || {},
    initiation:  player.initiationContext || {},
  }, null, 2);

  const today = date;
  const systemPrompt = `Ты — Искра, зеркало Дживы в игре AWARA.

ЗАДАЧА:
Создай персональный смысл дня для игрока.
Ответ строго JSON. Без markdown. Без пояснений.

КОНТЕКСТ AWARA:
AWARA — духовная игра эволюции сознания.
Инициация предшествует переходу игрока на следующий уровень.
Игрок видит послание, квест, практику и вопрос.
Агенты работают за занавесом.

ПРАВИЛА:
- русский язык для message, quest, practice, question;
- коротко, живо, без эзотерической воды;
- если дата рождения есть — используй мягко как ориентир, не как точную астрологию;
- если даты рождения нет — используй выборы, сферы, матрицу и энергию дня;
- квест должен быть выполним сегодня;
- imagePrompt и musicPrompt пиши на английском;
- не обещай медицинские, финансовые или юридические результаты.

JSON:
{
  "message": "короткое личное послание дня",
  "quest": {
    "title": "название квеста",
    "mainAction": "одно главное действие",
    "smallSteps": ["шаг 1", "шаг 2", "шаг 3"]
  },
  "practice": "короткая практика на 2-5 минут",
  "question": "вопрос дня",
  "reward": {
    "light": 7,
    "sphere": "название сферы",
    "keyFragment": "INIT-${today}"
  },
  "imagePrompt": "short production image prompt in English",
  "musicPrompt": "short music mood prompt in English"
}`;

  const raw  = await callAI([
    { role: 'system',  content: systemPrompt },
    { role: 'user',    content: `КОНТЕКСТ ИГРОКА:\n${ctx}` },
  ]);
  const meaning = extractJson(raw);
  meaning.createdAt = new Date().toISOString();

  // Also read / create daily seed
  const seedRef  = db.collection('dailySeeds').doc(date);
  const seedSnap = await seedRef.get();
  meaning.sourceSeed = seedSnap.exists ? date : null;

  await ref.set(meaning);
  return { cached: false, date, playerId, meaning };
}

// ── askOracle ──────────────────────────────────────────────────────────────
async function askOracle(body) {
  const { playerId, date, question, context = {} } = body;
  if (!playerId || !question) throw new Error('playerId and question required');

  const db  = getDb();
  const col = db.collection('oracleSessions').doc(playerId).collection('messages');

  const systemPrompt = `Ты — Голос Сфер в AWARA.

ЗАДАЧА:
Ответь игроку внутри игры.
Ответ строго JSON. Без markdown.

ПРАВИЛА:
- не раскрывай будущие уровни и награды;
- не объясняй механику технически;
- будь кратким, тёплым и конкретным;
- дай один следующий шаг;
- если вопрос про здоровье, право, деньги или психику — отвечай бережно и не заменяй специалиста.

JSON:
{
  "answer": "2-4 предложения",
  "nextAction": "одно действие сейчас",
  "agent": "Искра / Шива / Вишну / Брахма / РА",
  "tone": "soft / clear / focus / deep"
}`;

  const raw    = await callAI([
    { role: 'system',  content: systemPrompt },
    { role: 'user',    content: `Вопрос: ${question}\n\nКонтекст: ${JSON.stringify(context)}` },
  ]);
  const answer = extractJson(raw);

  // Save to Firestore
  const record = {
    date:      date || new Date().toISOString().slice(0, 10),
    question,
    context,
    answer,
    createdAt: new Date().toISOString(),
  };
  await col.add(record);

  return { date: record.date, playerId, answer };
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body   = JSON.parse(event.body || '{}');
    const action = body.action;

    let result;
    if (action === 'getDailyMeaning') {
      result = await getDailyMeaning(body);
    } else if (action === 'askOracle') {
      result = await askOracle(body);
    } else {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: `Unknown action: ${action}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('[awara-daily]', err);
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
