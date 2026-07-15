/* awara-soul-flow.js v2 - Soul light distributor (4 zones x 6 sub-spheres).
   Voice-of-conscience: AI-led distribution of the day into sub-spheres,
   mechanical keyword fallback, gentle confirmation, manual minor edits,
   export blob for the Soul window (istok). Self-contained state in localStorage.
   v2: light state moved to its own key 'awara_soul_light' to avoid the key
   collision with the Soul Scroll, which keeps owning 'awara_soul' in
   awara-tutor.js. A one-time migration adopts legacy light data that may
   still live under 'awara_soul' so accumulated light is not lost.
   Cyrillic UI strings are \u-escaped; code/comments ASCII. */
(function(){
 var SK='awara_soul_light';
 var LEGACY_SK='awara_soul';
 // Canon zones (mirror of soul-data.json). col = accent color.
 var Z=[
  {id:'osnova',name:'\u041e\u0441\u043d\u043e\u0432\u0430',body:'\u041d\u043e\u0433\u0438+\u0416\u0438\u0432\u043e\u0442',el:'\u0417\u0435\u043c\u043b\u044f\u00b7\u041e\u0433\u043e\u043d\u044c',col:'#b8860b',subs:[
   {id:'korni',n:'\u041a\u043e\u0440\u043d\u0438/\u0420\u043e\u0434'},{id:'telo',n:'\u0422\u0435\u043b\u043e/\u0417\u0434\u043e\u0440\u043e\u0432\u044c\u0435'},{id:'dom',n:'\u0414\u043e\u043c/\u0420\u0435\u0441\u0443\u0440\u0441\u044b'},{id:'volya',n:'\u0412\u043e\u043b\u044f/\u041d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435'},{id:'energiya',n:'\u042d\u043d\u0435\u0440\u0433\u0438\u044f'},{id:'delo',n:'\u0414\u0435\u043b\u043e/\u0422\u0432\u043e\u0440\u0447\u0435\u0441\u0442\u0432\u043e'}]},
  {id:'serdce',name:'\u0421\u0435\u0440\u0434\u0446\u0435',body:'\u0413\u0440\u0443\u0434\u044c',el:'\u0412\u043e\u0437\u0434\u0443\u0445',col:'#e06b9a',subs:[
   {id:'lyubov',n:'\u041b\u044e\u0431\u043e\u0432\u044c'},{id:'otnosheniya',n:'\u041e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u044f'},{id:'sostradanie',n:'\u0421\u043e\u0441\u0442\u0440\u0430\u0434\u0430\u043d\u0438\u0435'},{id:'radost',n:'\u0420\u0430\u0434\u043e\u0441\u0442\u044c/\u0411\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u043d\u043e\u0441\u0442\u044c'},{id:'iskrennost',n:'\u0418\u0441\u043a\u0440\u0435\u043d\u043d\u043e\u0441\u0442\u044c'},{id:'glubina',n:'\u0413\u043b\u0443\u0431\u0438\u043d\u0430 \u0447\u0443\u0432\u0441\u0442\u0432'}]},
  {id:'golova',name:'\u0413\u043e\u043b\u043e\u0432\u0430',body:'\u0413\u043e\u043b\u043e\u0432\u0430',el:'\u042d\u0444\u0438\u0440\u00b7\u0421\u0432\u0435\u0442',col:'#8a6dff',subs:[
   {id:'um',n:'\u0423\u043c/\u042f\u0441\u043d\u043e\u0441\u0442\u044c'},{id:'videnie',n:'\u0412\u0438\u0434\u0435\u043d\u0438\u0435'},{id:'intuiciya',n:'\u0418\u043d\u0442\u0443\u0438\u0446\u0438\u044f'},{id:'osoznannost',n:'\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c'},{id:'smysl',n:'\u0421\u043c\u044b\u0441\u043b/\u0414\u0445\u0430\u0440\u043c\u0430'},{id:'istochnik',n:'\u0421\u0432\u044f\u0437\u044c \u0441 \u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u043e\u043c'}]},
  {id:'sodeystvie',name:'\u0421\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435',body:'\u041c\u0435\u0436\u0434\u0443 \u0438\u0433\u0440\u043e\u043a\u0430\u043c\u0438',el:'\u0421\u043e\u0431\u043e\u0440\u043d\u043e\u0441\u0442\u044c',col:'#56c596',subs:[
   {id:'sluzhenie',n:'\u0421\u043b\u0443\u0436\u0435\u043d\u0438\u0435'},{id:'dar',n:'\u0414\u0430\u0440/\u0429\u0435\u0434\u0440\u043e\u0441\u0442\u044c'},{id:'sovmestnye',n:'\u0421\u043e\u0432\u043c\u0435\u0441\u0442\u043d\u044b\u0435 \u0434\u0435\u043b\u0430'},{id:'krug',n:'\u041a\u0440\u0443\u0433/\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e'},{id:'nastavnichestvo',n:'\u041d\u0430\u0441\u0442\u0430\u0432\u043d\u0438\u0447\u0435\u0441\u0442\u0432\u043e'},{id:'sobornost',n:'\u0421\u043e\u0431\u043e\u0440\u043d\u043e\u0441\u0442\u044c/\u0415\u0434\u0438\u043d\u0441\u0442\u0432\u043e'}]}
 ];
 // Mechanical fallback keyword stems (lowercase, Russian).
 var KW={
  korni:['\u0440\u043e\u0434','\u043f\u0440\u0435\u0434\u043a','\u0441\u0435\u043c\u044c','\u043a\u043e\u0440\u043d'],
  telo:['\u0442\u0435\u043b','\u0437\u0434\u043e\u0440\u043e\u0432','\u0441\u043e\u043d','\u0431\u043e\u043b','\u0443\u0441\u0442\u0430\u043b','\u0441\u043f\u043e\u0440\u0442'],
  dom:['\u0434\u043e\u043c','\u0434\u0435\u043d\u044c\u0433','\u0440\u0435\u0441\u0443\u0440\u0441','\u0431\u044b\u0442'],
  volya:['\u043d\u0430\u043c\u0435\u0440\u0435\u043d','\u0440\u0435\u0448\u0438','\u0432\u043e\u043b','\u0446\u0435\u043b','\u0434\u0438\u0441\u0446\u0438\u043f\u043b'],
  energiya:['\u044d\u043d\u0435\u0440\u0433','\u0441\u0438\u043b','\u0431\u043e\u0434\u0440','\u0432\u0438\u0431\u0440\u0430\u0446'],
  delo:['\u0434\u0435\u043b','\u0442\u0432\u043e\u0440\u0447','\u043f\u0440\u043e\u0435\u043a\u0442','\u0441\u043e\u0437\u0434\u0430','\u043a\u043e\u0434','\u0440\u0430\u0431\u043e\u0442'],
  lyubov:['\u043b\u044e\u0431\u043e\u0432','\u043b\u044e\u0431\u043b','\u043d\u0435\u0436\u043d'],
  otnosheniya:['\u043e\u0442\u043d\u043e\u0448\u0435\u043d','\u0434\u0440\u0443\u0433','\u043f\u0430\u0440\u0442\u043d','\u0432\u0441\u0442\u0440\u0435\u0442'],
  sostradanie:['\u0441\u043e\u0441\u0442\u0440\u0430\u0434','\u0436\u0430\u043b','\u0437\u0430\u0431\u043e\u0442','\u043f\u0440\u043e\u0449'],
  radost:['\u0440\u0430\u0434','\u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440','\u0441\u0447\u0430\u0441\u0442','\u0443\u043b\u044b\u0431'],
  iskrennost:['\u0438\u0441\u043a\u0440\u0435\u043d','\u0447\u0435\u0441\u0442\u043d','\u043f\u0440\u0430\u0432\u0434','\u043e\u0442\u043a\u0440\u044b\u0442'],
  glubina:['\u0447\u0443\u0432\u0441\u0442\u0432','\u0433\u043b\u0443\u0431\u0438\u043d','\u043f\u0435\u0440\u0435\u0436\u0438\u0432','\u044d\u043c\u043e\u0446'],
  um:['\u0443\u043c\u043d','\u044f\u0441\u043d','\u043c\u044b\u0441\u043b','\u043f\u043b\u0430\u043d','\u043f\u043e\u043d\u044f'],
  videnie:['\u0432\u0438\u0434\u0435\u043d','\u043e\u0431\u0440\u0430\u0437','\u043c\u0435\u0447\u0442','\u0432\u0438\u0437\u0443\u0430\u043b'],
  intuiciya:['\u0438\u043d\u0442\u0443\u0438\u0446','\u043f\u0440\u0435\u0434\u0447\u0443\u0432\u0441\u0442','\u0437\u043d\u0430\u043a'],
  osoznannost:['\u043e\u0441\u043e\u0437\u043d\u0430','\u043c\u0435\u0434\u0438\u0442','\u0432\u043d\u0438\u043c\u0430','\u043f\u0440\u0438\u0441\u0443\u0442','\u043d\u0430\u0431\u043b\u044e\u0434'],
  smysl:['\u0441\u043c\u044b\u0441\u043b','\u0434\u0445\u0430\u0440\u043c','\u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d','\u0437\u0430\u0447\u0435\u043c','\u043c\u0438\u0441\u0441'],
  istochnik:['\u0431\u043e\u0433','\u0438\u0441\u0442\u043e\u043a','\u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a','\u043c\u043e\u043b\u0438\u0442','\u0434\u0443\u0445','\u0432\u044b\u0441\u0448'],
  sluzhenie:['\u0441\u043b\u0443\u0436','\u0432\u043e\u043b\u043e\u043d\u0442','\u043e\u0442\u0434\u0430'],
  dar:['\u0434\u0430\u0440','\u0449\u0435\u0434\u0440','\u043f\u043e\u0434\u0430\u0440','\u0431\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440'],
  sovmestnye:['\u0441\u043e\u0432\u043c\u0435\u0441\u0442','\u0432\u043c\u0435\u0441\u0442\u0435','\u043a\u043e\u043c\u0430\u043d\u0434','\u0433\u0440\u0443\u043f\u043f'],
  krug:['\u043a\u0440\u0443\u0433','\u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442','\u043e\u0431\u0449\u0438\u043d','\u043a\u043e\u043b\u043b\u0435\u043a\u0442\u0438\u0432'],
  nastavnichestvo:['\u043d\u0430\u0441\u0442\u0430\u0432','\u0443\u0447\u0443','\u043e\u0431\u0443\u0447','\u043c\u0435\u043d\u0442\u043e','\u043f\u0435\u0440\u0435\u0434\u0430\u043b'],
  sobornost:['\u0441\u043e\u0431\u043e\u0440\u043d','\u0435\u0434\u0438\u043d\u0441\u0442\u0432','\u0441\u043e\u0431\u0440\u0430\u043b']
 };
 var PATH=['#0a0a0a','#3a3a3a','#6b6b6b','#8a6d3b','#b8860b','#ffd700','#fff8e1'];
 var anim=0,raf=null,lastConfirm='',pending=null;
 function r(n){return Math.round(n);}
 function subDef(id){for(var i=0;i<Z.length;i++)for(var j=0;j<Z[i].subs.length;j++)if(Z[i].subs[j].id===id)return {zone:Z[i],sub:Z[i].subs[j]};return null;}
 function seed(){var o={subs:{},zones:{},soulLight:0,mera:1,auras:{},log:[]};Z.forEach(function(z){o.zones[z.id]=0;z.subs.forEach(function(s){o.subs[s.id]={light:0,depth:0};});});return o;}
 function load(){
  try{var s=localStorage.getItem(SK);if(s){var o=JSON.parse(s);if(o&&o.subs)return o;}}catch(e){}
  // One-time migration: adopt legacy light data still under the shared key.
  try{var old=localStorage.getItem(LEGACY_SK);if(old){var p=JSON.parse(old);if(p&&p.subs){var m={subs:p.subs,zones:p.zones||{},soulLight:p.soulLight||0,mera:p.mera||1,auras:p.auras||{},log:p.log||[]};localStorage.setItem(SK,JSON.stringify(m));return m;}}}catch(e){}
  return seed();
 }
 var soul=load();
 function save(){try{localStorage.setItem(SK,JSON.stringify(soul));}catch(e){}}
 function recompute(){
  Z.forEach(function(z){var sum=0;z.subs.forEach(function(s){sum+=(soul.subs[s.id]||{light:0}).light;});soul.zones[z.id]=r(sum/z.subs.length);});
  var zs=0;Z.forEach(function(z){zs+=soul.zones[z.id];});soul.soulLight=r(zs/Z.length);
  soul.mera=Math.max(1,Math.min(9,1+Math.floor(soul.soulLight/12)));
  soul.auras={tela:soul.zones.osnova>=60,serdca:soul.zones.serdce>=60,uma:soul.zones.golova>=60,sodeystviya:soul.zones.sodeystvie>=60,edinstva:(soul.zones.osnova>=50&&soul.zones.serdce>=50&&soul.zones.golova>=50&&soul.zones.sodeystvie>=50)};
 }
 function colorFor(light){var t=Math.max(0,Math.min(100,light))/100,p=t*(PATH.length-1),i=Math.floor(p);if(i>=PATH.length-1)return PATH[PATH.length-1];return PATH[i];}
 function mechMap(text){var t=(text||'').toLowerCase(),map={},id,arr,i,hits;for(id in KW){arr=KW[id];hits=0;for(i=0;i<arr.length;i++)if(t.indexOf(arr[i])>=0)hits++;if(hits>0)map[id]=hits;}return map;}
 function applyMap(map,particles,who){
  var total=0,k;for(k in map)total+=map[k];if(total<=0)return false;
  var pool=Math.max(1,particles||10),bonus=map.sluzhenie||map.dar||map.sovmestnye?1.15:1;
  for(k in map){if(!soul.subs[k])continue;var w=map[k]/total,gain=r(pool*w*0.6*bonus),sub=soul.subs[k],before=sub.light;sub.light=Math.min(100,sub.light+gain);if(sub.light>=100&&before<100)sub.depth+=1;else if(gain>0&&sub.light>80)sub.depth=r((sub.depth+0.25)*100)/100;}
  recompute();soul.log.unshift({t:Date.now(),who:who||'ai',map:map});if(soul.log.length>200)soul.log.length=200;save();renderIfOpen();return true;
 }
 function topList(map,limit){var a=[],k;for(k in map){var d=subDef(k);if(d)a.push([d.zone.name+' \u00b7 '+d.sub.n,map[k]]);}a.sort(function(x,y){return y[1]-x[1];});return a.slice(0,limit||4);}
 function buildConfirm(map,src){var t=topList(map,4),s=t.map(function(x){return x[0];}).join(', ');if(!s)return '';return (src==='ai'?'\u042f \u043f\u043e\u043d\u044f\u043b \u0442\u0430\u043a':'\u041f\u043e \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u043c \u0441\u043b\u043e\u0432\u0430\u043c')+': '+s+'. \u2014 \u0432\u0435\u0440\u043d\u043e? \u043c\u043e\u0436\u043d\u043e \u043f\u043e\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043d\u0438\u0436\u0435.';}
 function aiSys(){return '\u0422\u044b \u2014 \u0433\u043e\u043b\u043e\u0441 \u0441\u043e\u0432\u0435\u0441\u0442\u0438 \u0438\u0433\u0440\u044b AWARA. \u0420\u0430\u0437\u043b\u0438\u0432\u0430\u0435\u0448\u044c \u0441\u0432\u0435\u0442 \u0434\u043d\u044f \u043f\u043e \u043f\u043e\u0434-\u0441\u0444\u0435\u0440\u0430\u043c \u0434\u0443\u0448\u0438. \u041e\u0442\u0432\u0435\u0447\u0430\u0439 \u0422\u041e\u041b\u042c\u041a\u041e JSON.';}
 function aiPrompt(text){var ids=[],i,j;for(i=0;i<Z.length;i++)for(j=0;j<Z[i].subs.length;j++)ids.push(Z[i].subs[j].id+' ('+Z[i].name+'/'+Z[i].subs[j].n+')');
  return '\u041f\u043e\u0434-\u0441\u0444\u0435\u0440\u044b (id):\n'+ids.join('\n')+'\n\n\u0417\u0430\u043f\u0438\u0441\u044c \u0434\u043d\u044f:\n\"'+(text||'').replace(/\"/g,"'")+'\"\n\n\u0412\u0435\u0440\u043d\u0438 JSON \u0432\u0438\u0434\u0430 {\"id\":\u0432\u0435\u0441} \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043b\u044f \u0437\u0430\u0442\u0440\u043e\u043d\u0443\u0442\u044b\u0445 \u043f\u043e\u0434-\u0441\u0444\u0435\u0440 (\u0432\u0435\u0441 0..1). \u0411\u0435\u0437 \u043f\u043e\u044f\u0441\u043d\u0435\u043d\u0438\u0439.';}
 function parseMap(resp){try{var m=(''+resp).match(/\{[\s\S]*\}/);if(m){var o=JSON.parse(m[0]),out={},k;for(k in o){if(soul.subs[k]){var v=parseFloat(o[k]);if(v>0)out[k]=v;}}return out;}}catch(e){}return null;}
 function distribute(text,particles,who){
  text=(text||'').trim();if(!text)return;
  var finish=function(map,src){if(!map||!Object.keys(map).length){map=mechMap(text);src='mech';}if(!Object.keys(map).length){lastConfirm='\u041d\u0435 \u043f\u043e\u043d\u044f\u043b, \u043a\u0443\u0434\u0430 \u0440\u0430\u0437\u043b\u0438\u0442\u044c \u2014 \u0443\u043a\u0430\u0436\u0438 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u043d\u0438\u0436\u0435.';renderIfOpen();return;}applyMap(map,particles,who||'ai');lastConfirm=buildConfirm(map,src);renderIfOpen();};
  try{if(typeof window.aiCall==='function'){window.aiCall([{role:'system',content:aiSys()},{role:'user',content:aiPrompt(text)}]).then(function(resp){finish(parseMap(resp),'ai');}).catch(function(){finish(mechMap(text),'mech');});return;}}catch(e){}
  finish(mechMap(text),'mech');
 }
 // Manual minor edits by the player.
 function nudge(id,delta){if(!soul.subs[id])return;var s=soul.subs[id];s.light=Math.max(0,Math.min(100,s.light+delta));recompute();save();renderIfOpen();}
 function setLight(id,v){if(!soul.subs[id])return;soul.subs[id].light=Math.max(0,Math.min(100,v));recompute();save();renderIfOpen();}
 function fromPlayer(text,particles){distribute(text,particles,'player');}
 function exportForIstok(){recompute();return JSON.parse(JSON.stringify({version:1,subs:soul.subs,zones:soul.zones,soulLight:soul.soulLight,mera:soul.mera,auras:soul.auras}));}
 function reset(){soul=seed();save();renderIfOpen();}
 // ---- UI ----
 function ensureStyle(){if(document.getElementById('sfl-style'))return;var st=document.createElement('style');st.id='sfl-style';st.textContent=['#sfl-modal .libcard{max-width:600px;text-align:left}','#sfl-zones{display:block;margin:6px 0}','.sfl-zone{margin:8px 0;padding:8px;border-radius:10px;background:rgba(255,255,255,.04)}','.sfl-zh{font-size:12px;letter-spacing:.04em;margin-bottom:4px;display:flex;justify-content:space-between}','.sfl-sub{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:11px}','.sfl-bar{flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden}','.sfl-fill{height:100%;border-radius:6px}','.sfl-nm{flex:0 0 130px;color:#cbb6e8}','.sfl-n{cursor:pointer;color:#8a7fae;padding:0 4px;user-select:none}','#sfl-in{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,210,122,.3);color:#fff;border-radius:10px;padding:8px;font-size:13px;margin:4px 0;resize:vertical;min-height:46px}','#sfl-confirm{font-size:11px;color:#ffd27a;margin:6px 0;min-height:14px}'].join('');document.head.appendChild(st);}
 function ensureModal(){if(document.getElementById('sfl-modal'))return;var d=document.createElement('div');d.className='libmodal';d.id='sfl-modal';
  d.innerHTML='<div class="libcard awara-glass-card"><div class="libel" id="sfl-head"></div><h2 style="margin-top:4px">\ud83c\udf38 \u0414\u0443\u0448\u0430: \u0440\u0430\u0437\u043b\u0438\u0432 \u0441\u0432\u0435\u0442\u0430</h2><textarea id="sfl-in" placeholder="\u0417\u0430\u043f\u0438\u0448\u0438 \u0434\u0435\u043d\u044c \u2014 \u0418\u0418 \u0440\u0430\u0437\u043e\u043b\u044c\u0451\u0442 \u0441\u0432\u0435\u0442 \u043f\u043e \u043f\u043e\u0434-\u0441\u0444\u0435\u0440\u0430\u043c\u2026"></textarea><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0"><button class="btn awara-gold-button" id="sfl-go">\ud83d\udd06 \u0420\u0430\u0437\u043b\u0438\u0442\u044c (\u0418\u0418)</button></div><div id="sfl-confirm"></div><div id="sfl-zones"></div><button class="btn ghost" id="sfl-close" style="margin-top:8px">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button></div>';
  document.body.appendChild(d);d.onclick=function(e){if(e.target===d)close();};document.getElementById('sfl-close').onclick=close;
  document.getElementById('sfl-go').onclick=function(){var ta=document.getElementById('sfl-in'),txt=ta?ta.value:'',amt=Math.min(48,12+(txt||'').length/8);fromPlayer(txt,amt);};
 }
 function render(){var head=document.getElementById('sfl-head');if(head)head.innerHTML='\u0421\u0432\u0435\u0442 \u0434\u0443\u0448\u0438 <b>'+soul.soulLight+'</b> \u00b7 \u043c\u0435\u0440\u0430 <b>'+soul.mera+'</b>/9 \u00b7 \u0430\u0443\u0440\u044b: '+(Object.keys(soul.auras).filter(function(k){return soul.auras[k];}).length)+'/5';
  var c=document.getElementById('sfl-confirm');if(c)c.textContent=lastConfirm||'';
  var box=document.getElementById('sfl-zones');if(!box)return;var html='';
  Z.forEach(function(z){html+='<div class="sfl-zone"><div class="sfl-zh"><span style="color:'+z.col+'"><b>'+z.name+'</b> \u00b7 '+z.body+'</span><span style="color:#8a7fae">'+soul.zones[z.id]+'%'+(soul.auras[z.id==='osnova'?'tela':z.id==='serdce'?'serdca':z.id==='golova'?'uma':'sodeystviya']?' \u2728':'')+'</span></div>';
   z.subs.forEach(function(s){var sd=soul.subs[s.id]||{light:0,depth:0};html+='<div class="sfl-sub"><span class="sfl-nm">'+s.n+'</span><span class="sfl-n" data-d="-8" data-id="'+s.id+'">\u2212</span><div class="sfl-bar"><div class="sfl-fill" style="width:'+sd.light+'%;background:'+colorFor(sd.light)+'"></div></div><span class="sfl-n" data-d="8" data-id="'+s.id+'">+</span><span style="flex:0 0 54px;color:#6f6790">'+sd.light+(sd.depth?' \u00b7d'+(Math.round(sd.depth)):'')+'</span></div>';});
   html+='</div>';});
  box.innerHTML=html;
  var ns=box.querySelectorAll('.sfl-n');for(var i=0;i<ns.length;i++)ns[i].onclick=function(){nudge(this.getAttribute('data-id'),parseInt(this.getAttribute('data-d'),10));};
 }
 function renderIfOpen(){var m=document.getElementById('sfl-modal');if(m&&m.classList.contains('open'))render();}
 function open(){ensureStyle();ensureModal();render();document.getElementById('sfl-modal').classList.add('open');}
 function close(){var m=document.getElementById('sfl-modal');if(m)m.classList.remove('open');}
 function launcher(txt){var b=document.createElement('button');b.className='btn ghost sfl-launch';b.textContent=txt;b.onclick=open;return b;}
 function injectLaunchers(){var ids=['s-plan','s-result'],i;for(i=0;i<ids.length;i++){var sc=document.getElementById(ids[i]);if(sc&&!sc.querySelector('.sfl-launch'))sc.appendChild(launcher('\ud83c\udf38 \u0414\u0443\u0448\u0430: \u0441\u0432\u0435\u0442'));}}
 function hookLight(){try{if(window.AwaraLight&&typeof window.AwaraLight.pour==='function'&&!window.AwaraLight.pour.__soulWrapped){var _p=window.AwaraLight.pour;window.AwaraLight.pour=function(amt,txt){var rr=_p.apply(this,arguments);try{if(txt&&(''+txt).trim())distribute(txt,amt,'ai');}catch(e){}return rr;};window.AwaraLight.pour.__soulWrapped=true;}if(window.AwaraLight)window.AwaraLight.brainHook=function(txt,amt){distribute(txt,amt,'ai');};}catch(e){}}
 function boot(){ensureStyle();injectLaunchers();hookLight();setTimeout(function(){injectLaunchers();hookLight();},1000);setTimeout(function(){injectLaunchers();hookLight();},2200);setTimeout(function(){injectLaunchers();hookLight();},3600);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 window.AwaraSoul={open:open,close:close,render:render,distribute:distribute,fromPlayer:fromPlayer,apply:applyMap,nudge:nudge,set:setLight,state:function(){recompute();return soul;},zones:function(){return Z;},exportForIstok:exportForIstok,reset:reset,__ready:true,__v:2};
})();