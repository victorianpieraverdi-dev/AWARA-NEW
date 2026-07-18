/* ═══ AWARA · Cloud Sync — Netlify Function (Firestore) ═══
   POST /api/sync  { action: "save", playerId, data, ts }
   POST /api/sync  { action: "load", playerId }
   Uses existing Firebase env vars from awara-daily.js
   ═══════════════════════════════════════════════════════ */
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

const COL = 'players';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, playerId } = body;

    if (!playerId || typeof playerId !== 'string' || playerId.length < 4) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid playerId' }) };
    }

    const db = getDb();
    const docRef = db.collection(COL).doc(playerId);

    // ── SAVE ──
    if (action === 'save') {
      const { data, ts } = body;
      if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No data' }) };
      }
      // Проверить: не перезаписываем более новые данные
      const existing = await docRef.get();
      if (existing.exists) {
        const oldTs = existing.data().ts || 0;
        if (ts && oldTs && ts < oldTs) {
          return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ ok: false, reason: 'cloud_newer', cloudTs: oldTs }),
          };
        }
      }
      await docRef.set({
        data: JSON.stringify(data),
        ts: ts || Date.now(),
        updatedAt: new Date().toISOString(),
      });
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ ok: true, ts: ts || Date.now() }),
      };
    }

    // ── LOAD ──
    if (action === 'load') {
      const snap = await docRef.get();
      if (!snap.exists) {
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, found: false }) };
      }
      const d = snap.data();
      let parsed;
      try { parsed = JSON.parse(d.data); } catch (e) { parsed = d.data; }
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ ok: true, found: true, data: parsed, ts: d.ts }),
      };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('sync error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
