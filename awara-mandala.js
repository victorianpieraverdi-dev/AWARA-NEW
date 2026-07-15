/* AWARA · Мандала Пути — Образ Бытия. v6
   Генерация из 24 часов = встреча двух потоков (восходящий намерений + нисходящий давления).
   ЗАКАТ: в конце дня потоки сливаются — вспышка-генерация + горизонт + ударная волна.
   Слои: намерения→формы, баланс стихий→цвет/асимметрия, дыхание→пульс, глубина пути→слои/плотность.
   Приходит сама (doLive) + по желанию. Стрик + синтез + Хроника года с линией роста.
   Основа: Любовь и Красота · Создание. Доп. слой, движок не трогает, пишет в STATE.mandalas. */
(function(){
'use strict';
if(window.AwaraMandala&&window.AwaraMandala.__ready&&window.AwaraMandala.__v>=6)return;

var EL_COL={
 'Огонь':['#ff6a3d','#ffb347'],
 'Земля':['#b98a3c','#9bcf6a'],
 'Воздух':['#7ad0ff','#c8b6ff'],
 'Вода':['#3a8ff0','#6fd0ff'],
 'Эфир':['#9d86e0','#ffd27a'],
 'Гроза':['#b06bff','#ffd27a'],
 'Рассвет':['#ff9ec7','#ffd27a']
};
var EL_ORDER=['Огонь','Рассвет','Эфир','Воздух','Вода','Земля','Гроза'];
var GLY={'Гроза':'🐉','Огонь':'🔥','Вода':'🌊','Земля':'🪨','Воздух':'🌬','Эфир':'✨','Рассвет':'🌅'};
var EL_FREQ={'Земля':196.00,'Вода':220.00,'Огонь':261.63,'Воздух':329.63,'Эфир':392.00,'Гроза':440.00,'Рассвет':293.66};

var current=null, rot=0, raf=null, soundOn=true, AC=null, sunset=0;
var synthMode=false, synthSel=[], chronOpen=false;

function ymd(dt){var m=dt.getMonth()+1,d=dt.getDate();return dt.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);}

function S(){
 try{if(typeof STATE!=='undefined'&&STATE&&STATE.birth)return STATE;}catch(e){}
 try{return JSON.parse(localStorage.getItem('tigel_v1')||'{}');}catch(e){return{};}
}
function persist(){
 try{if(typeof save==='function'){save();return;}}catch(e){}
 try{localStorage.setItem('tigel_v1',JSON.stringify(S()));}catch(e){}
}
function light(){
 try{if(typeof lightVal==='function'){var v=lightVal();if(typeof v==='number'&&!isNaN(v))return Math.max(0,Math.min(100,Math.round(v)));}}catch(e){}
 var s=S();var db=(s.trust>=50)?5:0;var ml=(s.mats?s.mats.length:0)*2;
 return Math.max(0,Math.min(100,Math.round((s.baseLight||48)+(s.lightBonus||0)+ml+db)));
}
function moonNak(){try{var s=S();if(s.natal&&s.natal.bodies&&typeof nakOf==='function')return nakOf(s.natal.bodies['Луна']);}catch(e){}return null;}
function daimon(){var s=S();return s.daimon||null;}
function matEls(){
 var s=S(),out=[],mats=s.mats||[],i,m;
 for(i=0;i<mats.length;i++){m=(typeof MATRIX!=='undefined'&&MATRIX[mats[i]])?MATRIX[mats[i]]:null;out.push({key:mats[i],glyph:m?m[0]:'✦',el:m?m[1]:'Эфир'});}
 return out;
}
function intentsDone(){var s=S(),a=s.intents||[],n=0,i;for(i=0;i<a.length;i++){if(a[i]&&a[i].done)n++;}return n;}
function meraLevel(lv){return Math.max(1,Math.min(9,Math.round(lv/100*9)));}
function glyphFor(d,lv){if(d)return GLY[d.el]||'✨';return lv>=67?'🌕':lv>=34?'🌓':'🌑';}
function nakIdx(name){try{if(typeof NAK!=='undefined'&&NAK&&NAK.length){var i=NAK.indexOf(name);if(i>=0)return i+1;}}catch(e){}return name?(name.length%27)+1:14;}

function seedFromStr(str){var h=2166136261,i;for(i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function cardId(seed){var hx=(seed>>>0).toString(16).toUpperCase();while(hx.length<8)hx='0'+hx;return 'AWA-'+hx;}

function vibe(snap){
 var lv=snap.light,mera=snap.mera,trust=snap.trust||0,ln=(snap.lenses?snap.lenses.length:0);
 var ni=nakIdx(snap.nak);
 var dens=Math.min(1,(((snap.days||0)+(snap.streak||0)*2))/80);
 var axes=Math.max(5,Math.min(14,Math.round(mera*1.3)+ln));
 var nodes=Math.max(7,Math.min(27,ni+axes+Math.round(dens*6)));
 var step=2+Math.floor((lv/100)*(Math.floor(nodes/2)-2));
 var amp=0.035+(lv/100)*0.13;
 var harm=axes;
 var latticeA=0.18+0.5*(trust/100);
 var rings=Math.max(mera,Math.min(12,mera+Math.round(dens*4)));
 return{axes:axes,nodes:nodes,step:step,amp:amp,harm:harm,latticeA:latticeA,dens:dens,rings:rings};
}

function flows(snap){
 var intents=snap.intentsDone||0,lensN=(snap.lenses?snap.lenses.length:0),trust=snap.trust||0;
 var days=snap.days||0,streak=snap.streak||0;
 var ascend=Math.max(0,Math.min(1,(intents*0.16)+(snap.light/100)*0.55));
 var descend=Math.max(0,Math.min(1,(lensN*0.12)+((100-trust)/100)*0.45+Math.min(0.35,days/120)));
 return{ascend:ascend,descend:descend,intents:intents};
}
function balanceVec(snap){
 var els=(snap.lensesEl&&snap.lensesEl.length)?snap.lensesEl.map(function(x){return x.el;}):[snap.el||'Эфир'];
 var sx=0,sy=0,i,idx,ang;
 for(i=0;i<els.length;i++){idx=EL_ORDER.indexOf(els[i]);if(idx<0)idx=2;ang=-Math.PI/2+idx*(2*Math.PI/7);sx+=Math.cos(ang);sy+=Math.sin(ang);}
 var n=els.length||1;sx/=n;sy/=n;var mag=Math.min(1,Math.sqrt(sx*sx+sy*sy));
 return{x:sx,y:sy,asym:mag};
}

function buildSnap(){
 var s=S(),lv=light(),mn=moonNak(),d=daimon(),le=matEls();
 var el=d?d.el:(le[0]?le[0].el:'Эфир');
 var dateStr=ymd(new Date());
 var seed=seedFromStr(dateStr+'|'+lv+'|'+(s.mats||[]).join(',')+'|'+(mn?mn.n:''));
 return{date:dateStr,light:lv,mera:meraLevel(lv),trust:s.trust||0,streak:s.streak||0,
  lenses:(s.mats||[]).slice(),lensesEl:le,glyph:glyphFor(d,lv),nak:mn?mn.n:'',el:el,
  seed:seed,intentsDone:intentsDone(),days:(s.days?s.days.length:0),dayGen:dayGen()};
}
function hydrate(rec){
 var le=[],ls=rec.lenses||[],i,m;
 for(i=0;i<ls.length;i++){m=(typeof MATRIX!=='undefined'&&MATRIX[ls[i]])?MATRIX[ls[i]]:null;le.push({key:ls[i],glyph:m?m[0]:'✦',el:m?m[1]:'Эфир'});}
 var c={};for(var k in rec){if(rec.hasOwnProperty(k))c[k]=rec[k];}c.lensesEl=le;if(c.intentsDone==null)c.intentsDone=0;return c;
}
function elColor(el,i){var c=EL_COL[el]||EL_COL['Эфир'];return i?c[1]:c[0];}

function buildSynth(a,b){
 var base=Math.max(a.light,b.light),avg=(a.light+b.light)/2;
 var lv=Math.max(0,Math.min(100,Math.round(base+avg*0.22)));
 var hi=(a.light>=b.light)?a:b;
 var uni=[],seen={},src=(a.lenses||[]).concat(b.lenses||[]),i;
 for(i=0;i<src.length;i++){if(!seen[src[i]]){seen[src[i]]=1;uni.push(src[i]);}}
 uni=uni.slice(0,6);
 var dateStr=ymd(new Date());
 var seed=seedFromStr(a.date+'+'+b.date+'|'+lv+'|'+uni.join(','));
 var snap={date:dateStr,light:lv,mera:meraLevel(lv),trust:Math.round((a.trust+b.trust)/2),
  streak:Math.max(a.streak||0,b.streak||0),days:Math.max(a.days||0,b.days||0),
  lenses:uni,glyph:hi.glyph,nak:hi.nak,el:hi.el,
  seed:seed,intentsDone:(a.intentsDone||0)+(b.intentsDone||0),
  synth:true,sup:(lv>=80),parents:[a.date,b.date],card:cardId(seed)};
 return hydrate(snap);
}

function drawStream(ctx,cx,cy,R,rotation,strength,dir,c1,c2,pull){
 pull=pull||0;if(strength<=0&&pull<=0)return;
 var eff=Math.min(1,strength*(1+pull*0.9)+pull*0.2),count=Math.round(5+eff*26),i;
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();
 for(i=0;i<count;i++){
  var ph=((rotation*0.12*(0.5+eff))+(i/count))%1;if(ph<0)ph+=1;ph=ph+(1-ph)*pull*0.55;
  var startY=cy+dir*R*0.92,y=startY-dir*R*0.92*ph;
  var wob=Math.sin(ph*Math.PI*2+i*1.3),x=cx+wob*R*0.16*(1-ph*0.4)*(1-pull*0.6);
  var a=Math.sin(ph*Math.PI)*(0.5+eff*0.5),rad=1.2+eff*2.4*(0.4+0.6*ph);
  var col=ph<0.5?c1:c2;
  ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fillStyle=col;ctx.globalAlpha=Math.min(1,a*(1+pull*0.8));ctx.shadowColor=col;ctx.shadowBlur=8;ctx.fill();
 }
 ctx.restore();ctx.globalAlpha=1;
}
function drawIntentForms(ctx,cx,cy,R,rotation,intents,lenses){
 var n=Math.min(intents,12);if(n<=0)return;var i;
 for(i=0;i<n;i++){
  var ang=rotation*0.5+i*(Math.PI*2/n),rr=R*0.46;
  var x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;
  var el=lenses[i%lenses.length]?lenses[i%lenses.length].el:'Эфир',col=elColor(el,0);
  var sides=3+(i%4),rad=R*0.035,k;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang+rotation);ctx.beginPath();
  for(k=0;k<sides;k++){var a2=k*(Math.PI*2/sides),px=Math.cos(a2)*rad,py=Math.sin(a2)*rad;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
  ctx.closePath();ctx.fillStyle=col;ctx.globalAlpha=.35;ctx.fill();ctx.globalAlpha=.8;ctx.strokeStyle=col;ctx.lineWidth=1;ctx.shadowColor=col;ctx.shadowBlur=6;ctx.stroke();
  ctx.restore();ctx.globalAlpha=1;
 }
}

function draw(cv,snap,rotation){
 var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx0=W/2,cy0=H/2,R0=Math.min(W,H)/2-8;
 var v=vibe(snap),lv=snap.light,f=flows(snap),bal=balanceVec(snap),sun=sunset;
 var breath=1+0.028*Math.sin(rotation*0.9)+sun*0.05,R=R0*breath,ey=1+bal.asym*0.12;
 var cx=cx0+bal.x*R0*0.05,cy=cy0+bal.y*R0*0.05,rings=v.rings;
 ctx.clearRect(0,0,W,H);
 var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
 bg.addColorStop(0,'rgba(20,16,44,0)');bg.addColorStop(1,'rgba(5,5,13,.55)');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 /* горизонт заката */
 if(sun>0){ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();
  var hy=cy-R+(2*R)*(1-sun);var hg=ctx.createLinearGradient(0,hy-R*0.3,0,hy+R*0.3);
  hg.addColorStop(0,'rgba(255,158,199,0)');hg.addColorStop(0.5,'rgba(255,210,122,'+(0.5*sun)+')');hg.addColorStop(1,'rgba(176,107,255,0)');
  ctx.fillStyle=hg;ctx.fillRect(cx-R,hy-R*0.3,2*R,R*0.6);ctx.restore();}
 var lenses=(snap.lensesEl&&snap.lensesEl.length)?snap.lensesEl:[{el:(snap.el||'Эфир'),glyph:'✦'}];
 var primEl=lenses[0].el,r,a;
 drawStream(ctx,cx,cy,R,rotation,f.descend,-1,'#b06bff','#7a5cff',sun);
 for(r=rings;r>=1;r--){
  var rad=R*0.92*(r/rings),el=lenses[(r-1)%lenses.length].el;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation*(r%2?1:-1)*0.4);ctx.beginPath();
  for(a=0;a<=120;a++){var ang=a/120*Math.PI*2,wob=1+v.amp*Math.sin(ang*v.harm+r*0.6+rotation*2);var x=Math.cos(ang)*rad*wob,y=Math.sin(ang)*rad*wob*ey;if(a===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.closePath();var col=elColor(el,r%2);ctx.strokeStyle=col;ctx.lineWidth=1.3;ctx.globalAlpha=.4+.4*(r/rings);ctx.shadowColor=col;ctx.shadowBlur=9;ctx.stroke();ctx.restore();
 }
 ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation*0.3);ctx.beginPath();
 var M=v.nodes,rr=R*0.7,k;
 for(k=0;k<M;k++){var a1=k/M*Math.PI*2,a2=((k*v.step)%M)/M*Math.PI*2;ctx.moveTo(Math.cos(a1)*rr,Math.sin(a1)*rr*ey);ctx.lineTo(Math.cos(a2)*rr,Math.sin(a2)*rr*ey);}
 var lc=elColor(primEl,0);ctx.strokeStyle=lc;ctx.globalAlpha=v.latticeA;ctx.lineWidth=0.8;ctx.shadowColor=lc;ctx.shadowBlur=6;ctx.stroke();ctx.restore();
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-rotation);
 var p;for(p=0;p<v.axes;p++){var pang=p/v.axes*Math.PI*2,le2=lenses[p%lenses.length],pcol=elColor(le2.el,0),pr=R*0.6;var px=Math.cos(pang)*pr,py=Math.sin(pang)*pr;ctx.beginPath();ctx.ellipse(px,py,R*0.12,R*0.045,pang,0,Math.PI*2);ctx.fillStyle=pcol;ctx.globalAlpha=.15;ctx.fill();ctx.globalAlpha=.6;ctx.strokeStyle=pcol;ctx.lineWidth=1;ctx.stroke();}
 ctx.restore();
 drawIntentForms(ctx,cx,cy,R,rotation,f.intents,lenses);
 drawStream(ctx,cx,cy,R,rotation,f.ascend,1,'#ffd27a','#ff9ec7',sun);
 ctx.save();ctx.translate(cx,cy);ctx.beginPath();ctx.arc(0,0,R-2,-Math.PI/2,-Math.PI/2+Math.PI*2*(lv/100));ctx.strokeStyle='#ffd27a';ctx.lineWidth=3;ctx.globalAlpha=.9;ctx.shadowColor='#ffd27a';ctx.shadowBlur=14;ctx.stroke();ctx.restore();
 ctx.save();ctx.translate(cx,cy);
 var meet=Math.min(f.ascend,f.descend),coreR=R*0.2*(0.82+0.18*Math.sin(rotation*3))*(1+meet*0.25+sun*0.4);
 var cg=ctx.createRadialGradient(0,0,0,0,0,coreR*2.4);
 cg.addColorStop(0,'rgba(255,210,122,.95)');cg.addColorStop(.5,'rgba(201,168,76,.4)');cg.addColorStop(1,'rgba(123,98,201,0)');
 ctx.fillStyle=cg;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,coreR*2.4,0,Math.PI*2);ctx.fill();
 if(snap.synth){ctx.strokeStyle='#ffd27a';ctx.globalAlpha=.85;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,coreR*2.7,0,Math.PI*2);ctx.stroke();if(snap.sup){ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(0,0,coreR*3.1,0,Math.PI*2);ctx.stroke();}}
 ctx.font=(R*0.26)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=1;ctx.fillText(snap.glyph||'✦',0,0);
 ctx.restore();
 /* вспышка заката: ударная волна + блум */
 if(sun>0){ctx.save();ctx.translate(cx,cy);var sp=1-sun;
  ctx.beginPath();ctx.arc(0,0,R*(0.15+0.85*sp),0,Math.PI*2);ctx.strokeStyle='#ffd27a';ctx.globalAlpha=sun*0.7;ctx.lineWidth=2+4*sun;ctx.shadowColor='#ffd27a';ctx.shadowBlur=20;ctx.stroke();
  var b2=ctx.createRadialGradient(0,0,0,0,0,R*0.5*(0.4+sun));b2.addColorStop(0,'rgba(255,240,200,'+(0.6*sun)+')');b2.addColorStop(1,'rgba(255,210,122,0)');
  ctx.fillStyle=b2;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,R*0.5*(0.4+sun),0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;}
}

function audioCtx(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}catch(e){return null;}}
function playMandala(snap,climax){
 var ac=audioCtx();if(!ac)return;try{if(ac.state==='suspended')ac.resume();}catch(e){}
 var now=ac.currentTime,dur=climax?5.0:3.6;
 var els=(snap.lensesEl&&snap.lensesEl.length)?snap.lensesEl.map(function(x){return x.el;}):[snap.el||'Эфир'];
 var freqs=[120*Math.pow(1.5,(snap.mera-1)/8)],i;
 for(i=0;i<els.length;i++)freqs.push(EL_FREQ[els[i]]||EL_FREQ['Эфир']);
 var master=ac.createGain();master.connect(ac.destination);
 master.gain.setValueAtTime(0.0001,now);master.gain.exponentialRampToValueAtTime(climax?0.22:0.16,now+(climax?0.7:0.4));master.gain.exponentialRampToValueAtTime(0.0001,now+dur);
 for(i=0;i<freqs.length;i++){var o=ac.createOscillator();o.type=(i===0?'sine':['sine','triangle','sine'][i%3]);o.frequency.value=freqs[i];if(climax)o.frequency.exponentialRampToValueAtTime(freqs[i]*1.5,now+dur*0.8);var g=ac.createGain();g.gain.value=(i===0?0.5:0.3/Math.sqrt(freqs.length));o.connect(g);g.connect(master);o.start(now+i*0.12);o.stop(now+dur);}
}

function streakCount(arr){
 var set={},i;for(i=0;i<arr.length;i++)set[arr[i].date]=1;
 var d=new Date(),cnt=0,ds;
 for(;;){ds=ymd(d);if(set[ds]){cnt++;d.setDate(d.getDate()-1);}else break;}
 if(cnt===0){d=new Date();d.setDate(d.getDate()-1);for(;;){ds=ymd(d);if(set[ds]){cnt++;d.setDate(d.getDate()-1);}else break;}}
 return cnt;
}

function _esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function dayGen(){
 var s=S(),g={};
 try{var ta=document.getElementById('dayText');if(ta&&ta.value&&ta.value.trim())g.text=ta.value.trim();}catch(e){}
 if(!g.text&&s.dayText)g.text=s.dayText;
 if(s.advice)g.advice=s.advice;
 if(s.lensTag)g.lens=s.lensTag;
 try{if(window.TigelCore&&typeof TigelCore.artOfDay==='function'){var a=TigelCore.artOfDay();if(a){g.card={img:a.image||'',name:a.culturalName||a.matrixName||'',agent:a.agentName||'',el:a.element||''};if(a.prompt)g.cardPrompt=a.prompt;}}}catch(e){}
 try{if(window.TigelCore&&typeof TigelCore.trackOfDay==='function'){var t=TigelCore.trackOfDay();if(t)g.track={name:t.name||t.title||'',bpm:t.bpm||'',mood:t.mood||'',file:t.audio||t.file||t.track||''};}}catch(e){}
 try{if(typeof window.aiPrompt==='function')g.prompt=window.aiPrompt('cover');}catch(e){}
 try{var ao=document.getElementById('aiOut');if(ao){var av=(ao.innerText||ao.textContent||'').trim();if(av&&av.length>2)g.ai=av;}}catch(e){}
 try{var dc=(S().dayCards||{})[ymd(new Date())];if(dc){if(dc.prompt)g.prompt=dc.prompt;if(dc.img)g.cardImg=dc.img;}}catch(e){}
 return (g.text||g.advice||g.card||g.track||g.prompt||g.ai||g.cardImg)?g:null;
}
function genHero(snap){
 var g=snap&&snap.dayGen;var pr=g&&(g.prompt||g.cardPrompt);var img=g&&g.cardImg;var slot;
 if(img){slot='<img src="'+img+'" alt="card" style="display:block;width:200px;aspect-ratio:3/4;object-fit:cover;margin:0 auto;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.55);cursor:pointer" onclick="window.open(this.src,\'_blank\')">';}
 else{var lbl=pr?'\u0431\u0443\u0434\u0443\u0449\u0430\u044f \u043a\u0430\u0440\u0442\u0430 \u0438\u0433\u0440\u043e\u043a\u0430':'\u043f\u0443\u0441\u0442\u043e \u2014 \u043f\u0440\u043e\u0436\u0438\u0432\u0438 \u0434\u0435\u043d\u044c';slot='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;aspect-ratio:3/4;width:200px;margin:0 auto;border:1.5px dashed rgba(201,168,76,.6);border-radius:16px;background:radial-gradient(circle at 50% 35%,rgba(157,134,224,.2),transparent 70%);font-size:54px;opacity:.92">\ud83c\udfb4<span style="font-size:12px;opacity:.75;font-family:monospace;letter-spacing:.05em">'+lbl+'</span></div>';}
 var mkLbl=pr?'\u0414\u043e\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442':'\u0421\u043e\u0431\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u0442 \u043f\u043e \u0434\u043d\u044e';var upLbl=img?'\u0417\u0430\u043c\u0435\u043d\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u0443':'\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u0443';
 var ctrls='<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap"><button class="btn ghost" style="margin:0;font-size:12px;padding:7px 12px" id="mnd-make-prompt">\ud83e\udde9 '+mkLbl+'</button><button class="btn ghost" style="margin:0;font-size:12px;padding:7px 12px" id="mnd-up-btn">\ud83d\uddbc '+upLbl+'</button><input type="file" accept="image/*" id="mnd-up-inp" style="display:none"></div>';
 return slot+ctrls;
}
function dayGenHtml(snap){
 var g=snap&&snap.dayGen;if(!g)return '';
 var h='<details class="mnd-day"><summary>\ud83c\udfb4 \u0413\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f \u0434\u043d\u044f</summary><div>';
 if(g.cardImg)h+='<img class="mnd-day-card" src="'+g.cardImg+'" alt="card" style="cursor:pointer" onclick="window.open(this.src,\'_blank\')">';
 if(g.card&&(g.card.name||g.card.agent))h+='<div class="mnd-day-cap">'+_esc((g.card.agent?g.card.agent+' \u00b7 ':'')+(g.card.name||'')+(g.card.el?' \u00b7 '+g.card.el:''))+'</div>';
 if(g.text)h+='<div class="label" style="margin-top:8px">\u0417\u0430\u043f\u0438\u0441\u044c \u0434\u043d\u044f</div><p class="adv" style="font-size:14px">'+_esc(g.text)+'</p>';
 if(g.advice)h+='<div class="label" style="margin-top:8px">\u0421\u043e\u0432\u0435\u0442 \u0434\u043d\u044f</div><p class="adv" style="font-size:14px">'+_esc(g.advice)+'</p>';
 if(g.lens)h+='<div class="trait"><span>\u041b\u0438\u043d\u0437\u044b</span><b>'+_esc(g.lens)+'</b></div>';
 if(g.track&&(g.track.name||g.track.bpm))h+='<div class="trait"><span>\ud83c\udfb5 \u0417\u0432\u0443\u043a \u0434\u043d\u044f</span><b>'+_esc((g.track.name||'')+(g.track.bpm?' \u00b7 '+g.track.bpm+' BPM':''))+'</b></div>';
 if(g.ai)h+='<details class="mnd-day-prompt"><summary>\ud83e\udd16 \u041e\u0442\u0432\u0435\u0442 \u0418\u0418</summary><div class="adv" style="font-size:13px;white-space:pre-wrap">'+_esc(g.ai)+'</div></details>';
 var pr=g.prompt||g.cardPrompt;
 if(pr)h+='<details class="mnd-day-prompt" open><summary>\ud83d\udccb \u041f\u0440\u043e\u043c\u0442 \u043e\u0431\u043b\u043e\u0436\u043a\u0438</summary><textarea readonly class="mnd-day-ta">'+_esc(pr)+'</textarea></details>';
 h+='</div></details>';
 return h;
}
function saveDayCard(date,patch){
 var s=S();if(!s.dayCards)s.dayCards={};var cur=s.dayCards[date]||{};
 for(var k in patch){if(patch.hasOwnProperty(k))cur[k]=patch[k];}cur.ts=Date.now();s.dayCards[date]=cur;
 if(current&&current.date===date){if(!current.dayGen)current.dayGen={};if(patch.prompt!=null)current.dayGen.prompt=patch.prompt;if(patch.img!=null)current.dayGen.cardImg=patch.img;}
 var arr=s.mandalas||[],i;
 for(i=0;i<arr.length;i++){if(arr[i].date===date&&!arr[i].synth){if(!arr[i].dayGen)arr[i].dayGen={};if(patch.prompt!=null)arr[i].dayGen.prompt=patch.prompt;if(patch.img!=null)arr[i].dayGen.cardImg=patch.img;}}
 try{persist();}catch(e){}
}
function promptMessages(snap){
 var g=(snap&&snap.dayGen)||{},parts=[];
 parts.push('Lenses: '+((snap.lenses||[]).join(', ')||'none'));
 if(snap.nak)parts.push('Moon nakshatra: '+snap.nak);
 if(snap.el)parts.push('Element: '+snap.el);
 parts.push('Light: '+snap.light+'/100, quality Mera: '+snap.mera+'/9');
 if(g.card&&(g.card.agent||g.card.name))parts.push('Agent or archetype of the day: '+((g.card.agent||'')+' '+(g.card.name||'')).replace(/\s+/g,' ').trim());
 if(g.text)parts.push('Player diary of the day: '+g.text);
 if(g.advice)parts.push('Advice of the day: '+g.advice);
 if(g.ai)parts.push('AI reflection of the day: '+g.ai);
 try{var raw=localStorage.getItem('awara_daimon_chat');if(raw){var o=JSON.parse(raw);if(o&&o.turns&&o.turns.length){var conv=o.turns.slice(-10).map(function(t){return (t.r==='d'?'Daimon':'Player')+': '+t.t;}).join('\n');parts.push('Conversation with the Daimon today:\n'+conv);}}}catch(e){}
 try{var _lsArt=(window.lensPromptStyle?window.lensPromptStyle(snap.lenses):'');if(_lsArt)parts.push('Visual language of the day lens(es) (FOLLOW THIS STYLE AS DOMINANT): '+_lsArt);}catch(e){}
 try{var _lsTone=(window.lensToneStyle?window.lensToneStyle(snap.lenses):'');if(_lsTone)parts.push('Emotional tone of the day lens(es): '+_lsTone);}catch(e){}
  try{var _asc=(window.lensAscensionPrompt?window.lensAscensionPrompt(snap.lenses):'');if(_asc)parts.push('Mastery/dimension of the lens(es) - PUSH THE VISUAL TOWARD THIS: '+_asc);}catch(e){}
 var sys='You are the art director of the AWARA awakening game. From the player lived day below, craft ONE vivid English image-generation prompt for a tarot-like portrait card of the day. Portrait 3:4, luminous and symbolic. STRONGLY adopt the visual language and emotional tone of the day lens(es) given below as the dominant art style and palette. Reflect the element, mood and what the player actually lived and felt. Output ONLY the final prompt text, no preamble, no quotes, max 90 words.';
 return [{role:'system',content:sys},{role:'user',content:parts.join('\n')}];
}
function makeDayPrompt(){
 if(!current)return;
 if(typeof window.aiCall!=='function'){if(typeof showToast==='function')showToast('\u0418\u0418 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u2014 \u0437\u0430\u043f\u0443\u0441\u0442\u0438 \u043f\u0440\u043e\u043a\u0441\u0438');return;}
 var b=document.getElementById('mnd-make-prompt');if(b){b.disabled=true;b.textContent='\u2026 \u0441\u043e\u0431\u0438\u0440\u0430\u044e';}
 window.aiCall(promptMessages(current)).then(function(txt){var pr=(''+txt).trim();saveDayCard(current.date,{prompt:pr});render();if(typeof showToast==='function')showToast('\u041f\u0440\u043e\u043c\u0442 \u0441\u043e\u0431\u0440\u0430\u043d \u0418\u0418');}).catch(function(){render();if(typeof showToast==='function')showToast('\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u2014 \u043f\u0440\u043e\u0432\u0435\u0440\u044c \u043f\u0440\u043e\u043a\u0441\u0438');});
}
function downscaleImg(dataURL,maxDim,cb){
 try{var im=new Image();im.onload=function(){var w=im.width||maxDim,h=im.height||maxDim,sc=Math.min(1,maxDim/Math.max(w,h));var cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc));var cv=document.createElement('canvas');cv.width=cw;cv.height=ch;cv.getContext('2d').drawImage(im,0,0,cw,ch);var out='';try{out=cv.toDataURL('image/webp',0.85);}catch(e){out='';}if(!out||out.indexOf('data:image')!==0)out=cv.toDataURL('image/jpeg',0.85);cb(out||dataURL);};im.onerror=function(){cb(dataURL);};im.src=dataURL;}catch(e){cb(dataURL);}
}
function onDayUpload(inp){
 if(!current||!inp||!inp.files||!inp.files[0])return;
 var rd=new FileReader();rd.onload=function(){downscaleImg(''+rd.result,768,function(img){saveDayCard(current.date,{img:img});render();renderGallery();renderChron();if(typeof showToast==='function')showToast('\u041a\u0430\u0440\u0442\u0430 \u0434\u043d\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430');});};rd.readAsDataURL(inp.files[0]);
}
function bindHero(gh){
 if(!gh)return;
 var mp=gh.querySelector('#mnd-make-prompt');if(mp)mp.onclick=makeDayPrompt;
 var ub=gh.querySelector('#mnd-up-btn'),ui=gh.querySelector('#mnd-up-inp');
 if(ub&&ui){ub.onclick=function(){ui.click();};ui.onchange=function(){onDayUpload(ui);};}
}
function recOf(snap,flags){
 var r={date:snap.date,light:snap.light,mera:snap.mera,trust:snap.trust,streak:snap.streak,days:snap.days||0,lenses:snap.lenses,glyph:snap.glyph,nak:snap.nak,el:snap.el,seed:snap.seed,intentsDone:snap.intentsDone||0};
 if(snap.synth){r.synth=true;r.sup=!!snap.sup;r.parents=snap.parents;r.card=snap.card;}
 if(!snap.synth){var _dg=snap.dayGen||dayGen();if(_dg)r.dayGen=_dg;}
 if(flags&&flags.auto)r.auto=true;
 return r;
}
function saveSnap(){
 if(!current)return;var s=S();if(!s.mandalas)s.mandalas=[];
 var rec=recOf(current),idx=-1,i;
 for(i=0;i<s.mandalas.length;i++){if(s.mandalas[i].date===rec.date&&!!s.mandalas[i].synth===!!rec.synth){idx=i;break;}}
 if(idx>=0)s.mandalas[idx]=rec;else s.mandalas.unshift(rec);
 persist();renderGallery();renderChron();
 if(typeof showToast==='function')showToast((rec.synth?'⚭ Синтез · ':'💾 Слепок дня · ')+'собрано '+s.mandalas.length);
}
function autoCapture(){
 var s=S();if(!s.mandalas)s.mandalas=[];
 var snap=buildSnap(),i,exists=false;
 for(i=0;i<s.mandalas.length;i++){if(s.mandalas[i].date===snap.date&&!s.mandalas[i].synth){exists=true;break;}}
 if(exists)return;
 s.mandalas.unshift(recOf(snap,{auto:true}));persist();
 current=hydrate(recOf(snap));triggerSunset();renderGallery();renderChron();
 if(typeof showToast==='function')showToast('🌅 Закат · мандала дня родилась');
}

function ensureStyle(){
 if(document.getElementById('mnd-style'))return;
 var st=document.createElement('style');st.id='mnd-style';
 st.textContent=['#mnd-cv{border-radius:50%;box-shadow:0 0 40px rgba(123,98,201,.35)}',
  '#mnd-modal .libcard{max-width:380px}',
  '.mnd-super{font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.1em;color:var(--spark,#ffd27a);text-align:center;margin-top:8px}',
  '.mnd-launch{margin-top:10px}',
  '#mnd-gal canvas.sel{outline:2px solid #ffd27a;outline-offset:2px}',
  '#mnd-chron{display:none;margin-top:10px}',
  '#mnd-chron .cell{width:10px;height:10px;border-radius:2px;box-sizing:border-box}',
  '#mnd-chron .wk{display:flex;flex-direction:column;gap:3px}',
  '#mnd-spark{width:100%;height:40px;display:block;margin:4px 0 8px}',
  '.mnd-day{margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px}',
  '.mnd-day>summary{cursor:pointer;font-family:Cinzel,serif;color:var(--spark,#ffd27a);font-size:13px;list-style:none}',
  '.mnd-day>summary::-webkit-details-marker{display:none}',
  '.mnd-day-card{width:120px;height:120px;object-fit:cover;border-radius:14px;display:block;margin:8px auto 4px;box-shadow:0 6px 20px rgba(0,0,0,.5)}',
  '.mnd-day-cap{text-align:center;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.08em;color:var(--muted,#8e88a4);margin-bottom:6px}',
  '.mnd-day-prompt>summary{cursor:pointer;font-size:11px;color:var(--muted,#8e88a4);margin-top:6px}',
  '.mnd-day-ta{width:100%;min-height:90px;background:rgba(255,255,255,.04);border:1px solid var(--line,rgba(201,168,76,.16));border-radius:8px;color:var(--spark,#ffd27a);padding:8px;font-family:JetBrains Mono,monospace;font-size:11px;margin-top:4px}'].join('');
 document.head.appendChild(st);
}
function ensureModal(){
 if(document.getElementById('mnd-modal'))return;
 var d=document.createElement('div');d.className='libmodal';d.id='mnd-modal';
 d.innerHTML='<div class="libcard awara-glass-card" style="text-align:center">'+
  '<div class="libel">Образ Бытия · Любовь и Красота · Создание</div>'+
  '<h2 id="mnd-title" style="margin-top:4px">Мандала Пути</h2>'+
  '<div id="mnd-gen-hero" style="margin:10px auto"></div>'+
  '<div id="mnd-super" class="mnd-super"></div>'+
  '<div id="mnd-meta" class="card awara-glass-card" style="text-align:left;margin-top:10px"></div>'+
  '<div style="display:flex;gap:8px;margin-top:10px">'+
   '<button class="btn awara-gold-button" style="flex:1;margin:0" id="mnd-birth">✦ Родить заново</button>'+
   '<button class="btn ghost" style="flex:1;margin:0" id="mnd-sound">🔊 Звук: вкл</button></div>'+
  '<button class="btn awara-gold-button" id="mnd-sunset" style="margin-top:8px">🌅 Закат — слияние потоков</button>'+
  '<button class="btn awara-gold-button" id="mnd-save" style="margin-top:8px">💾 Сохранить слепок дня</button>'+
  '<div id="mnd-galwrap" style="margin-top:12px;display:none"><span class="label">Собрание слепков</span>'+
   '<div id="mnd-gal" style="display:flex;gap:8px;overflow-x:auto;padding:6px 0"></div>'+
   '<div style="display:flex;gap:8px"><button class="btn ghost" style="flex:1;margin:0" id="mnd-synth-mode">⚭ Режим синтеза</button>'+
   '<button class="btn awara-gold-button" style="flex:1;margin:0;display:none" id="mnd-synth-go">⚭ Скрестить</button></div>'+
   '<button class="btn ghost" id="mnd-chron-btn" style="margin-top:8px">🗓 Хроника года</button>'+
   '<div id="mnd-chron"></div></div>'+
  '<button class="btn ghost" id="mnd-close" style="margin-top:8px">Закрыть</button></div>';
 document.body.appendChild(d);
 d.onclick=function(e){if(e.target===d)close();};
 document.getElementById('mnd-birth').onclick=birth;
 document.getElementById('mnd-save').onclick=saveSnap;
 document.getElementById('mnd-close').onclick=close;
 document.getElementById('mnd-sunset').onclick=function(){triggerSunset(true);};
 document.getElementById('mnd-synth-mode').onclick=toggleSynthMode;
 document.getElementById('mnd-synth-go').onclick=doSynth;
 document.getElementById('mnd-chron-btn').onclick=toggleChron;
 var sb=document.getElementById('mnd-sound');
 sb.onclick=function(){soundOn=!soundOn;sb.textContent=soundOn?'🔊 Звук: вкл':'🔇 Звук: выкл';if(soundOn&&current)playMandala(current);};
}
function triggerSunset(climax){
 sunset=1;if(!raf)startLoop();
 if(soundOn&&current)playMandala(current,!!climax);
 if(typeof showToast==='function')showToast('🌅 Закат · потоки сливаются');
}
function toggleSynthMode(){
 synthMode=!synthMode;synthSel=[];
 var b=document.getElementById('mnd-synth-mode');
 if(b)b.textContent=synthMode?'✕ Выйти из синтеза':'⚭ Режим синтеза';
 renderGallery();
 if(typeof showToast==='function'&&synthMode)showToast('Выбери два слепка для скрещивания');
}
function toggleChron(){
 chronOpen=!chronOpen;var p=document.getElementById('mnd-chron');if(p)p.style.display=chronOpen?'block':'none';
 var b=document.getElementById('mnd-chron-btn');if(b)b.textContent=chronOpen?'🗓 Скрыть хронику':'🗓 Хроника года';
 if(chronOpen)renderChron();
}
function doSynth(){
 if(synthSel.length<2)return;var s=S(),arr=s.mandalas||[];
 var ra=null,rb=null,i;
 for(i=0;i<arr.length;i++){if(arr[i].date===synthSel[0]&&ra===null)ra=arr[i];else if(arr[i].date===synthSel[1]&&rb===null)rb=arr[i];}
 if(!ra||!rb)return;
 current=buildSynth(hydrate(ra),hydrate(rb));synthMode=false;synthSel=[];
 var b=document.getElementById('mnd-synth-mode');if(b)b.textContent='⚭ Режим синтеза';
 render();renderGallery();triggerSunset(true);
 if(typeof showToast==='function')showToast('⚭ Синтез рождён · '+current.card);
}
function metaHtml(snap){
 var lensTxt=(snap.lensesEl&&snap.lensesEl.length)?snap.lensesEl.map(function(x){return x.glyph+' '+x.key;}).join(', '):'линзы не выбраны';
 var f=flows(snap),head='';
 if(snap.synth){head='<div class="trait"><span>'+(snap.sup?'✦ Супер-состояние':'⚭ Синтез')+'</span><b>'+(snap.parents?snap.parents.join(' × '):'—')+'</b></div>'+
  '<div class="trait"><span>Семя карты</span><b>'+(snap.card||'—')+'</b></div>';}
 return head+
  '<div class="trait"><span>Дата</span><b>'+snap.date+'</b></div>'+
  '<div class="trait"><span>Свет</span><b>'+snap.light+' / 100</b></div>'+
  '<div class="trait"><span>Мера</span><b>'+snap.mera+' / 9</b></div>'+
  '<div class="trait"><span>↑ Восход / ↓ Давление</span><b>'+Math.round(f.ascend*100)+'% / '+Math.round(f.descend*100)+'%</b></div>'+
  '<div class="trait"><span>Накшатра Луны</span><b>'+(snap.nak||'—')+'</b></div>'+
  '<div class="trait"><span>Доверие Даймона</span><b>'+snap.trust+'%</b></div>'+
  '<div class="trait"><span>Намерения выполнены</span><b>'+(snap.intentsDone||0)+'</b></div>'+
  '<div class="trait" style="border:none"><span>Линзы</span><b style="max-width:55%">'+lensTxt+'</b></div>'+dayGenHtml(snap);
}
function renderGallery(){
 var s=S(),wrap=document.getElementById('mnd-galwrap'),gal=document.getElementById('mnd-gal'),sup=document.getElementById('mnd-super'),go=document.getElementById('mnd-synth-go');
 if(!gal)return;var arr=s.mandalas||[];
 if(!arr.length){if(wrap)wrap.style.display='none';}
 else{
  if(wrap)wrap.style.display='block';gal.innerHTML='';
  for(var i=0;i<Math.min(arr.length,16);i++){(function(rec){
   var cv=document.createElement('canvas');cv.width=120;cv.height=120;cv.style.width='56px';cv.style.height='56px';cv.style.flex='0 0 auto';cv.style.cursor='pointer';cv.style.borderRadius='50%';
   if(synthMode&&synthSel.indexOf(rec.date)>=0)cv.className='sel';
   draw(cv,hydrate(rec),(rec.seed%628)/100);cv.title=(rec.synth?'⚭ синтез · ':'')+rec.date+' · Свет '+rec.light;
   cv.onclick=function(){if(synthMode){var di=synthSel.indexOf(rec.date);if(di>=0)synthSel.splice(di,1);else{if(synthSel.length>=2)synthSel.shift();synthSel.push(rec.date);}renderGallery();}else{current=hydrate(rec);render();}};
   gal.appendChild(cv);
  })(arr[i]);}
 }
 if(go)go.style.display=(synthMode&&synthSel.length===2)?'block':'none';
 if(sup){
  var st=streakCount(arr),recent={},now=Date.now(),j;
  for(j=0;j<arr.length;j++){var t=Date.parse(arr[j].date);if(!isNaN(t)&&now-t<=7*864e5)recent[arr[j].date]=1;}
  var cnt=Object.keys(recent).length,txt='Стрик: '+st+' дн.';
  if(cnt>=5)txt+=' · ✦ Супер-состояние зреет ('+cnt+'/7)';else if(cnt>0)txt+=' · за неделю '+cnt+'/7';
  sup.textContent=txt;
 }
}
function chronMap(){var s=S(),arr=s.mandalas||[],map={},i;for(i=arr.length-1;i>=0;i--){map[arr[i].date]=arr[i];}return map;}
function chronSorted(){var map=chronMap(),keys=Object.keys(map).sort(),out=[],i;for(i=0;i<keys.length;i++)out.push(map[keys[i]]);return out;}
function qualityUps(sorted){var t={},last=null,i;for(i=0;i<sorted.length;i++){var m=sorted[i].mera||meraLevel(sorted[i].light);if(last!==null&&m>last)t[sorted[i].date]=true;last=m;}return t;}
function drawSpark(cv,sorted){
 var ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
 if(!sorted.length)return;var n=sorted.length,i,x,y;
 var grad=ctx.createLinearGradient(0,0,W,0);grad.addColorStop(0,'#9d86e0');grad.addColorStop(1,'#ffd27a');
 if(n>1){ctx.beginPath();for(i=0;i<n;i++){x=(i/(n-1))*(W-8)+4;y=H-4-((sorted[i].light/100)*(H-8));if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.shadowColor='#ffd27a';ctx.shadowBlur=6;ctx.stroke();}
 var last=null;for(i=0;i<n;i++){var m=sorted[i].mera||meraLevel(sorted[i].light);x=(n>1?(i/(n-1)):0.5)*(W-8)+4;y=H-4-((sorted[i].light/100)*(H-8));var up=(last!==null&&m>last);ctx.beginPath();ctx.arc(x,y,up?3.2:2,0,Math.PI*2);ctx.fillStyle=up?'#fff':'#ffd27a';ctx.globalAlpha=up?1:.7;ctx.fill();ctx.globalAlpha=1;last=m;}
}
function renderChron(){
 var panel=document.getElementById('mnd-chron');if(!panel||!chronOpen)return;
 panel.innerHTML='';
 var sorted=chronSorted(),ups=qualityUps(sorted),map=chronMap(),year=(new Date()).getFullYear();
 var lh=document.createElement('div');lh.className='label';lh.textContent='Линия роста качеств · ✦ = переход в новое качество';panel.appendChild(lh);
 var spark=document.createElement('canvas');spark.id='mnd-spark';spark.width=600;spark.height=80;panel.appendChild(spark);drawSpark(spark,sorted);
 var head=document.createElement('div');head.className='label';head.textContent='Хроника '+year+' — нажми день';head.style.marginBottom='6px';panel.appendChild(head);
 var wrap=document.createElement('div');wrap.style.display='flex';wrap.style.gap='3px';wrap.style.overflowX='auto';wrap.style.padding='4px 0';
 var firstDow=((new Date(year,0,1)).getDay()+6)%7,col=document.createElement('div');col.className='wk';wrap.appendChild(col);
 var dow=0,i;
 for(i=0;i<firstDow;i++){var bl=document.createElement('div');bl.className='cell';bl.style.background='transparent';col.appendChild(bl);dow++;}
 var cur=new Date(year,0,1);
 while(cur.getFullYear()===year){
  if(dow===7){col=document.createElement('div');col.className='wk';wrap.appendChild(col);dow=0;}
  var ds=ymd(cur),rec=map[ds],cell=document.createElement('div');cell.className='cell';
  if(rec){var c=EL_COL[rec.el]||EL_COL['Эфир'];cell.style.background=c[0];cell.style.opacity=String(0.4+0.6*(rec.light/100));cell.style.cursor='pointer';
   var sh=[];if(rec.synth)sh.push('0 0 0 1px #ffd27a');if(ups[ds])sh.push('inset 0 2px 0 #fff');if(sh.length)cell.style.boxShadow=sh.join(',');
   cell.title=(rec.synth?'⚭ ':'')+(ups[ds]?'✦ переход · ':'')+ds+' · Свет '+rec.light+' · Мера '+(rec.mera||meraLevel(rec.light));
   (function(r){cell.onclick=function(){current=hydrate(r);render();var m=document.getElementById('mnd-modal');if(m)m.scrollTop=0;};})(rec);
  }else{cell.style.background='rgba(255,255,255,.06)';cell.title=ds;}
  col.appendChild(cell);dow++;cur.setDate(cur.getDate()+1);
 }
 panel.appendChild(wrap);
}
function render(){if(!current)return;var mt=document.getElementById('mnd-meta');if(mt)mt.innerHTML=metaHtml(current);var gh=document.getElementById('mnd-gen-hero');if(gh){gh.innerHTML=genHero(current);bindHero(gh);}var cv=document.getElementById('mnd-cv');if(cv)draw(cv,current,rot);}
function loop(){var cv=document.getElementById('mnd-cv');if(cv&&current){rot+=0.004;if(sunset>0){sunset-=0.009;if(sunset<0)sunset=0;}draw(cv,current,rot);}raf=requestAnimationFrame(loop);}
function startLoop(){if(!raf)loop();}
function stopLoop(){if(raf){cancelAnimationFrame(raf);raf=null;}}
function open(){ensureStyle();ensureModal();current=buildSnap();render();renderGallery();renderChron();document.getElementById('mnd-modal').classList.add('open');startLoop();if(soundOn)playMandala(current);}
function close(){var m=document.getElementById('mnd-modal');if(m)m.classList.remove('open');stopLoop();}
function birth(){current=buildSnap();current.seed=(current.seed^((Date.now())>>>0))>>>0;render();triggerSunset(true);}

function wrapDoLive(){
 try{if(typeof window.doLive==='function'&&!window.doLive.__mndWrapped){var _dl=window.doLive;window.doLive=function(){var r=_dl.apply(this,arguments);setTimeout(function(){try{autoCapture();}catch(e){}},60);return r;};window.doLive.__mndWrapped=true;}}catch(e){}
}

function launcher(txt){var b=document.createElement('button');b.className='btn ghost mnd-launch';b.textContent=txt;b.onclick=open;return b;}
function injectLaunchers(){
 var r=document.getElementById('s-result');
 if(r&&!r.querySelector('.mnd-launch')){var live=document.getElementById('liveBtn');if(live&&live.parentNode)live.parentNode.insertBefore(launcher('✦ Мандала Пути'),live);else r.appendChild(launcher('✦ Мандала Пути'));}
 var ist=document.getElementById('s-plan');
 if(ist&&!ist.querySelector('.mnd-launch'))ist.appendChild(launcher('✦ Образ Бытия · Мандала Пути'));
 var mac=document.getElementById('s-macro');
 if(mac&&!mac.querySelector('.mnd-launch'))mac.appendChild(launcher('✦ Открыть Мандалу Пути'));
}
function boot(){ensureStyle();injectLaunchers();wrapDoLive();setTimeout(function(){injectLaunchers();wrapDoLive();},900);setTimeout(function(){injectLaunchers();wrapDoLive();},1800);setTimeout(function(){injectLaunchers();wrapDoLive();},3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,160);});else setTimeout(boot,160);

window.AwaraMandala={open:open,close:close,render:render,build:buildSnap,synth:buildSynth,sunset:triggerSunset,__ready:true,__v:7};
})();
