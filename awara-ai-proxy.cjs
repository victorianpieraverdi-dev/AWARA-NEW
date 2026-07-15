/* AWARA proxy + static server -> DeepSeek (OpenAI-compatible) */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const TARGET = 'https://api.deepseek.com';
const PORT = 8787;
const ROOT = __dirname;
let API_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();
try { const _k = fs.readFileSync(path.join(__dirname, 'deepseek.key'), 'utf8'); if (_k && _k.trim()) API_KEY = _k.trim(); } catch (e) {}
console.log('DeepSeek key: ' + (API_KEY ? 'loaded (' + API_KEY.length + ' chars)' : 'NOT SET -> create C:\\AWARA\\deepseek.key'));
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, x-requested-with',
  'Access-Control-Allow-Private-Network': 'true',
  'Access-Control-Max-Age': '86400'
};
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/markdown; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.wav':'audio/wav' };
const API_PREFIXES = ['/chat', '/completions', '/models', '/v1', '/beta', '/anthropic'];
function isApi(p){ return API_PREFIXES.some(function(x){ return p.indexOf(x) === 0; }); }
function proxyApi(req, res, body){
  const target = new URL(req.url, TARGET);
  const headers = {};
  ['content-type','authorization','x-api-key','anthropic-version','accept'].forEach(function(h){ if (req.headers[h]) headers[h] = req.headers[h]; });
  if (!headers['authorization'] && API_KEY) headers['authorization'] = 'Bearer ' + API_KEY;
  if (!(req.method === 'GET' || req.method === 'HEAD')) headers['content-length'] = Buffer.byteLength(body);
  const opts = { method: req.method, hostname: target.hostname, path: target.pathname + target.search, port: 443, headers };
  const preq = https.request(opts, function(pres){
    const out = [];
    pres.on('data', function(d){ out.push(d); });
    pres.on('end', function(){
      const buf = Buffer.concat(out);
      const h = Object.assign({ 'Content-Type': pres.headers['content-type'] || 'application/json' }, CORS);
      res.writeHead(pres.statusCode || 502, h);
      res.end(buf);
      console.log(req.method + ' ' + req.url + ' -> ' + pres.statusCode);
    });
  });
  preq.on('error', function(e){
    res.writeHead(502, Object.assign({ 'Content-Type':'application/json' }, CORS));
    res.end(JSON.stringify({ error: 'proxy: ' + String(e && e.message || e) }));
    console.log('ERR ' + req.url + ' ' + (e && e.message));
  });
  if (!(req.method === 'GET' || req.method === 'HEAD')) preq.write(body);
  preq.end();
}
function serveStatic(req, res){
  let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/') pathname = '/tigel-app.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (filePath.indexOf(path.normalize(ROOT)) !== 0) { res.writeHead(403, CORS); res.end('Forbidden'); return; }
  fs.readFile(filePath, function(err, data){
    if (err) { res.writeHead(404, Object.assign({ 'Content-Type':'text/plain; charset=utf-8' }, CORS)); res.end('Not found: ' + pathname); console.log('404 ' + pathname); return; }
    const ext = path.extname(filePath).toLowerCase();
    const NOCACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0' };
    res.writeHead(200, Object.assign({ 'Content-Type': MIME[ext] || 'application/octet-stream' }, NOCACHE, CORS));
    res.end(data);
  });
}
const server = http.createServer(function(req, res){
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
  const pathname = new URL(req.url, 'http://x').pathname;
  if (req.method === 'POST' && pathname === '/api/forge') {
    const fchunks = [];
    req.on('data', function(c){ fchunks.push(c); });
    req.on('end', function(){
      var body = {};
      try { body = JSON.parse(Buffer.concat(fchunks).toString('utf8')); } catch(e) { body = {}; }
      body.ts = body.ts || new Date().toISOString();
      var qf = path.join(ROOT, 'data', 'forge_queue.json');
      var arr = [];
      try { arr = JSON.parse(fs.readFileSync(qf, 'utf8')); } catch(e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      arr.push(body);
      try { fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true }); } catch(e) {}
      try { fs.writeFileSync(qf, JSON.stringify(arr, null, 2)); } catch(e) {}
      res.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS));
      res.end(JSON.stringify({ ok: true, id: body.id || null, queued: arr.length }));
    });
    return;
  }
  if (req.method === 'GET' && pathname === '/api/forge-list') {
    var qf2 = path.join(ROOT, 'data', 'forge_queue.json');
    var data = '[]';
    try { data = fs.readFileSync(qf2, 'utf8') || '[]'; } catch(e) { data = '[]'; }
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS));
    res.end(data);
    return;
  }
  // Cross-origin state bridge: Tigel (8787) publishes its Daimon/natal snapshot
  // here so the app on 5173 can read it (localStorage is NOT shared by origin).
  if (req.method === 'POST' && pathname === '/api/state') {
    const schunks = [];
    req.on('data', function(c){ schunks.push(c); });
    req.on('end', function(){
      var obj = {};
      try { obj = JSON.parse(Buffer.concat(schunks).toString('utf8')); } catch(e) { obj = {}; }
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) obj = {};
      obj.ts = obj.ts || new Date().toISOString();
      var sf = path.join(ROOT, 'data', 'awara_state.json');
      try { fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true }); } catch(e) {}
      try { fs.writeFileSync(sf, JSON.stringify(obj, null, 2)); } catch(e) {}
      res.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS));
      res.end(JSON.stringify({ ok: true, ts: obj.ts }));
    });
    return;
  }
  if (req.method === 'GET' && pathname === '/api/state') {
    var sf2 = path.join(ROOT, 'data', 'awara_state.json');
    var sdata = '{}';
    try { sdata = fs.readFileSync(sf2, 'utf8') || '{}'; } catch(e) { sdata = '{}'; }
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS));
    res.end(sdata);
    return;
  }
  if (isApi(pathname)) {
    const chunks = [];
    req.on('data', function(c){ chunks.push(c); });
    req.on('end', function(){ proxyApi(req, res, Buffer.concat(chunks)); });
  } else {
    serveStatic(req, res);
  }
});
server.listen(PORT, '0.0.0.0', function(){ console.log('AWARA proxy+static listening on 0.0.0.0:' + PORT + '\n  Local:   http://127.0.0.1:' + PORT + '/tigel-app.html\n  Network: http://<your-LAN-IP>:' + PORT + '/tigel-app.html   (API -> ' + TARGET + ')'); });
