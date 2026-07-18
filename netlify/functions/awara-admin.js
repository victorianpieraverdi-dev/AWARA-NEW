/* ═══ AWARA · Admin — Netlify Function (Firestore) ═══
   POST /.netlify/functions/awara-admin  { code, action, ... }
   Код доступа сверяется с ADMIN_CODE из переменных окружения — сам код
   нигде в репо не хранится. Без верного кода — ни одно действие не отдаёт
   данные (проверка до любого обращения к Firestore).
   Действия: listPlayers, getPlayerDetail, setUnlimited, getConfig, setConfig
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

const CONFIG_DOCS = ['system-prompt', 'quota-message', 'chronicle-prompt'];

async function listPlayers(db) {
  const playersSnap = await db.collection('players').get();
  const today = new Date().toISOString().slice(0, 10);
  const players = await Promise.all(playersSnap.docs.map(async (doc) => {
    const id = doc.id;
    const [quotaSnap, flagSnap] = await Promise.all([
      db.collection('chat_quota').doc(id + '_' + today).get(),
      db.collection('player_flags').doc(id).get(),
    ]);
    return {
      player: id,
      lastSeen: doc.data().updatedAt || null,
      todayCount: quotaSnap.exists ? (quotaSnap.data().count || 0) : 0,
      unlimited: flagSnap.exists && flagSnap.data().unlimited === true,
    };
  }));
  players.sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));
  return { players };
}

async function getPlayerDetail(db, player) {
  if (!player) throw new Error('player required');
  const [chatsSnap, chronSnap, stateSnap] = await Promise.all([
    db.collection('chats').where('player', '==', player).limit(200).get(),
    db.collection('chronicle').where('player', '==', player).limit(90).get(),
    db.collection('players').doc(player).get(),
  ]);
  const chats = chatsSnap.docs.map((d) => d.data()).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 30);
  const chronicle = chronSnap.docs.map((d) => d.data()).sort((a, b) => (a.day < b.day ? 1 : -1));

  let state = null;
  let updatedAt = null;
  if (stateSnap.exists) {
    updatedAt = stateSnap.data().updatedAt || null;
    try {
      const all = JSON.parse(stateSnap.data().data || '{}');
      state = all.awara_v258_state ? JSON.parse(all.awara_v258_state) : null;
    } catch (err) {
      console.error('[awara-admin] state parse failed:', err);
    }
  }
  return { player, chats, chronicle, state, updatedAt };
}

async function setUnlimited(db, player, unlimited) {
  if (!player) throw new Error('player required');
  await db.collection('player_flags').doc(player).set({ unlimited: !!unlimited }, { merge: true });
  return { ok: true, player, unlimited: !!unlimited };
}

async function getAllConfig(db) {
  const config = {};
  await Promise.all(CONFIG_DOCS.map(async (id) => {
    const snap = await db.collection('config').doc(id).get();
    config[id] = snap.exists ? (snap.data().text || '') : '';
  }));
  return { config };
}

async function setConfig(db, docId, text) {
  if (!CONFIG_DOCS.includes(docId)) throw new Error('Unknown config doc: ' + docId);
  await db.collection('config').doc(docId).set({ text: String(text || '') }, { merge: true });
  return { ok: true, docId };
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
    const { code, action } = body;
    const adminCode = process.env.ADMIN_CODE || '';

    if (!adminCode || code !== adminCode) {
      return { statusCode: 401, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Неверный код доступа' }) };
    }

    const db = getDb();
    let result;
    if (action === 'listPlayers') {
      result = await listPlayers(db);
    } else if (action === 'getPlayerDetail') {
      result = await getPlayerDetail(db, body.player);
    } else if (action === 'setUnlimited') {
      result = await setUnlimited(db, body.player, body.unlimited);
    } else if (action === 'getConfig') {
      result = await getAllConfig(db);
    } else if (action === 'setConfig') {
      result = await setConfig(db, body.docId, body.text);
    } else {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(result) };
  } catch (err) {
    console.error('[awara-admin] error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
