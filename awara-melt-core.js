/* AWARA Melt Core - universal heart of the Tigel melt ritual. v1
   Fullscreen canvas portal over the phone; six distinct visual melt models
   (level 1 physics -> level 6 divine/quantum). Hooks the Plavit button and
   adds a 1..6 preview row on the Tigel screen. ASCII comments/anchors;
   Cyrillic only inside strings as \u escapes. */
(function(){
'use strict';
if(window.AwaraMeltCore&&window.AwaraMeltCore.__v>=1)return;

var LV=[
 null,
 {key:1,name:'\u0424\u0438\u0437\u0438\u043a\u0430',mode:'forge',method:'\u0413\u043e\u0440\u043d',bg:['#1a0a06','#070302'],par:['#ff7a1e','#ff3b1e','#ffb14e'],core:'#ff8a32',ring:'#ff6a2a'},
 {key:2,name:'\u041f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u0435',mode:'melt',method:'\u0420\u0430\u0441\u043f\u043b\u0430\u0432',bg:['#1d1205','#080502'],par:['#ffd27a','#e3a93c','#fff0c2'],core:'#ffd27a',ring:'#e3a93c'},
 {key:3,name:'\u0413\u0430\u0440\u043c\u043e\u043d\u0438\u044f',mode:'mandala',method:'\u0421\u0432\u0435\u0442\u043e\u0432\u043e\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043d',bg:['#160f2b','#070512'],par:['#c8b6ff','#ffd27a','#9d86e0'],core:'#fff0d8',ring:'#9d86e0'},
 {key:4,name:'\u0421\u0438\u044f\u043d\u0438\u0435',mode:'prism',method:'\u041f\u0440\u0438\u0437\u043c\u0430',bg:['#101830','#05060f'],par:['#7ad0ff','#ffffff','#ffd27a'],core:'#ffffff',ring:'#7ad0ff'},
 {key:5,name:'\u0412\u043e\u0441\u0445\u043e\u0434',mode:'vortex',method:'\u0417\u0432\u0451\u0437\u0434\u043d\u0430\u044f \u0432\u043e\u0440\u043e\u043d\u043a\u0430',bg:['#0b0a2a','#040312'],par:['#9d86e0','#ffd27a','#ff9ec7'],core:'#ffe6b0',ring:'#b06bff'},
 {key:6,name:'\u0411\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435',mode:'quantum',method:'\u041a\u0432\u0430\u043d\u0442\u043e\u0432\u044b\u0439 \u0442\u0438\u0433\u0435\u043b\u044c',bg:['#03101a','#000308'],par:['#7ad0ff','#ffffff','#b06bff','#ffd27a'],core:'#ffffff',ring:'#9be6ff'}
];

var DUR=2200,raf=null,t0=0,parts=[],curLv=3,running=false,onDoneCb=null,isPreview=false;

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function ease(x){x=clamp(x,0,1);return x*x*(3-2*x);}
function host(){return document.querySelector('.phone')||document.body;}
function lightNow(){try{if(typeof lightVal==='function'){var v=lightVal();if(typeof v==='number'&&!isNaN(v))return v;}}catch(e){}return 48;}
function meltLevel(){
 try{if(window.LensLevels&&typeof LensLevels.current==='function'){var c=LensLevels.current();if(c&&typeof c.lv==='number')return clamp(c.lv,1,6);}}catch(e){}
 return clamp(Math.floor(lightNow()/17)+1,1,6);
}

function ensureOv(){
 var ov=document.getElementById('meltCoreOv');if(ov)return ov;
 ov=document.createElement('div');ov.id='meltCoreOv';
 ov.style.cssText='position:absolute;inset:0;z-index:57;display:none;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,.18),rgba(0,0,0,.8) 72%);opacity:0;transition:opacity .4s ease';
 var cv=document.createElement('canvas');cv.id='meltCoreCv';cv.style.cssText='width:100%;height:100%;display:block';ov.appendChild(cv);
 var cap=document.createElement('div');cap.id='meltCoreCap';cap.style.cssText='position:absolute;left:0;right:0;bottom:48px;text-align:center;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.7)';ov.appendChild(cap);
 host().appendChild(ov);
 ov.addEventListener('click',function(){if(isPreview)stop(true);});
 return ov;
}
function sizeCv(cv){var ov=cv.parentNode;cv.width=ov.clientWidth||390;cv.height=ov.clientHeight||780;}
function setCap(L){var c=document.getElementById('meltCoreCap');if(c)c.innerHTML='<div style="font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#ffd27a;opacity:.9">\u0423\u0440\u043e\u0432\u0435\u043d\u044c '+L.key+' \u00b7 '+L.method+'</div><div style="font-family:Cinzel,serif;font-size:21px;margin-top:3px;color:#fff">'+L.name+'</div>';}

function initParts(L){
 parts=[];var n=L.mode==='quantum'?120:L.mode==='vortex'?112:92,i;
 for(i=0;i<n;i++){parts.push({a:Math.random()*Math.PI*2,sp:0.4+Math.random()*0.9,col:L.par[i%L.par.length],sz:1.4+Math.random()*2.6,ph:Math.random()*Math.PI*2,spin:(Math.random()<0.5?-1:1)*(0.5+Math.random())});}
}

function decoBack(ctx,L,cx,cy,R,t,anim,tg,em){
 var m=L.mode,i,W=ctx.canvas.width,H=ctx.canvas.height;
 if(m==='mandala'){ctx.strokeStyle=L.ring;ctx.globalAlpha=0.28*(1-em);ctx.lineWidth=1.5;for(i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,R*0.24*i*(0.6+0.4*ease(tg)),0,6.2832);ctx.stroke();}ctx.globalAlpha=1;}
 else if(m==='vortex'){ctx.strokeStyle=L.ring;ctx.globalAlpha=0.2*(1-em);ctx.lineWidth=1.4;for(i=0;i<3;i++){ctx.beginPath();var rr=R*(0.35+0.28*i),a2,first=true;for(a2=0;a2<6.5;a2+=0.18){var rad2=rr*(1-a2/14),ang=a2+anim*0.02+i*2,x=cx+Math.cos(ang)*rad2,y=cy+Math.sin(ang)*rad2;if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);}ctx.stroke();}ctx.globalAlpha=1;}
 else if(m==='quantum'){ctx.strokeStyle=L.ring;ctx.globalAlpha=0.14*(1-em);ctx.lineWidth=1;var step=Math.max(26,R/4),gx,gy;for(gx=cx%step;gx<W;gx+=step){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}for(gy=cy%step;gy<H;gy+=step){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}ctx.globalAlpha=1;}
 else if(m==='forge'){ctx.strokeStyle=L.ring;ctx.globalAlpha=0.16*(1-em);ctx.lineWidth=2;for(i=1;i<=3;i++){ctx.beginPath();ctx.arc(cx,cy,R*0.2*i+6*Math.sin(anim*0.1+i),0,6.2832);ctx.stroke();}ctx.globalAlpha=1;}
}
function decoFront(ctx,L,cx,cy,R,t,anim,tg,em){
 var m=L.mode,i,W=ctx.canvas.width,H=ctx.canvas.height;
 if(m==='prism'){ctx.globalAlpha=0.5*ease(clamp((t-0.2)/0.4,0,1))*(1-em);ctx.lineWidth=3;for(i=0;i<8;i++){var ang=anim*0.01+i*Math.PI/4,ex=cx+Math.cos(ang)*R*1.3,ey=cy+Math.sin(ang)*R*1.3,gr=ctx.createLinearGradient(cx,cy,ex,ey);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,L.par[i%L.par.length]);gr.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=gr;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();}ctx.globalAlpha=1;}
 else if(m==='melt'){ctx.globalAlpha=0.6*(1-em)*ease(tg);ctx.strokeStyle=L.core;ctx.lineWidth=2;for(i=0;i<10;i++){var px=cx+(i-4.5)*R*0.12,drop=R*(0.2+0.5*(((anim*0.5+i*30)%60)/60));ctx.beginPath();ctx.moveTo(px,cy);ctx.lineTo(px,cy+drop);ctx.stroke();}ctx.globalAlpha=1;}
 else if(m==='forge'){ctx.globalAlpha=0.85*(1-em);for(i=0;i<14;i++){var sx=cx+(Math.random()-0.5)*R*0.6,sy=cy-(((anim*2+i*20)%R))*0.8;ctx.fillStyle=L.par[i%L.par.length];ctx.fillRect(sx,sy,1.6,4);}ctx.globalAlpha=1;}
 else if(m==='quantum'&&em>0){ctx.globalAlpha=0.5*em;for(i=0;i<4;i++){ctx.fillStyle=L.par[Math.floor(Math.random()*L.par.length)];ctx.fillRect(Math.random()*W,cy+(Math.random()-0.5)*R,Math.random()*40+10,2);}ctx.globalAlpha=1;}
}
function vesselPath(ctx,mode,cx,cy,R,anim){
 ctx.beginPath();
 if(mode==='forge'){
  var w=R*0.9,top=cy-R*0.03,bot=cy+R*0.56,i,jag=6;
  ctx.moveTo(cx-w*0.55,top);ctx.lineTo(cx-w*0.32,bot);ctx.lineTo(cx+w*0.32,bot);ctx.lineTo(cx+w*0.55,top);
  for(i=jag;i>=0;i--){ctx.lineTo(cx-w*0.55+w*1.1*(i/jag),top-3*(i%2));}
  ctx.closePath();
 }else if(mode==='melt'){
  ctx.moveTo(cx-R*0.5,cy-R*0.08);
  ctx.bezierCurveTo(cx-R*0.5,cy+R*0.55,cx+R*0.5,cy+R*0.55,cx+R*0.5,cy-R*0.08);
  ctx.closePath();
 }else if(mode==='mandala'){
  ctx.ellipse(cx,cy+R*0.05,R*0.62,R*0.3,0,0,6.2832);
 }else if(mode==='prism'){
  var pts=6,a,px,py,k;
  for(k=0;k<pts;k++){a=anim*0.006+k*Math.PI*2/pts-Math.PI/2;px=cx+Math.cos(a)*R*0.5;py=cy+Math.sin(a)*R*0.42;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
  ctx.closePath();
 }else if(mode==='vortex'){
  ctx.moveTo(cx-R*0.5,cy-R*0.35);ctx.lineTo(cx+R*0.5,cy-R*0.35);ctx.lineTo(cx+R*0.08,cy+R*0.5);ctx.lineTo(cx-R*0.08,cy+R*0.5);ctx.closePath();
 }else if(mode==='quantum'){
  ctx.arc(cx,cy,R*0.46,0,6.2832);
 }
}
function drawVessel(ctx,L,cx,cy,R,t,anim,em){
 var grow=ease(clamp(t/0.3,0,1))*(1-em*0.4);
 ctx.save();ctx.globalAlpha=0.85*grow;
 vesselPath(ctx,L.mode,cx,cy,R,anim);
 var g=ctx.createLinearGradient(cx,cy-R*0.5,cx,cy+R*0.5);
 g.addColorStop(0,'rgba(255,255,255,0.14)');g.addColorStop(0.5,L.ring);g.addColorStop(1,'rgba(0,0,0,0.3)');
 ctx.fillStyle=g;ctx.fill();
 ctx.lineWidth=2;ctx.strokeStyle=L.core;ctx.globalAlpha=0.55*grow;ctx.stroke();
 if(L.mode==='mandala'){
  ctx.globalAlpha=0.3*grow;ctx.strokeStyle=L.core;ctx.lineWidth=1;var kk;
  for(kk=1;kk<=5;kk++){ctx.beginPath();ctx.moveTo(cx,cy+R*0.05);ctx.lineTo(cx+Math.cos(kk*1.2566)*R*0.55,cy+R*0.05+Math.sin(kk*1.2566)*R*0.26);ctx.stroke();}
 }
 if(L.mode==='quantum'){
  ctx.globalAlpha=0.25*grow;ctx.strokeStyle=L.ring;ctx.lineWidth=1;var lat;
  for(lat=1;lat<4;lat++){ctx.beginPath();ctx.ellipse(cx,cy,R*0.46,R*0.46*lat/4,0,0,6.2832);ctx.stroke();}
 }
 ctx.restore();
}
function drawCore(ctx,L,cx,cy,R,t,em){
 var grow=ease(clamp((t-0.18)/0.5,0,1)),s=R*(0.05+0.5*grow);
 if(em>0)s=R*lerp(0.55,1.6,ease(em));
 var ca=clamp((t-0.12)/0.2,0,1)*(1-clamp((em-0.55)/0.45,0,1));
 var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,s));g.addColorStop(0,'#ffffff');g.addColorStop(0.3,L.core);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.globalAlpha=clamp(ca,0,1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,Math.max(1,s),0,6.2832);ctx.fill();ctx.globalAlpha=1;
}
function draw(cv,L,t,anim){
 var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H*0.46,R=Math.min(W,H)*0.36;
 ctx.clearRect(0,0,W,H);
 var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);bg.addColorStop(0,L.bg[0]);bg.addColorStop(1,L.bg[1]);
 ctx.globalAlpha=clamp(t/0.1,0,1)*0.92;ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
 var tg=clamp(t/0.4,0,1),em=clamp((t-0.62)/0.38,0,1),i,P,rad,ang,x,y,al;
 decoBack(ctx,L,cx,cy,R,t,anim,tg,em);
 drawVessel(ctx,L,cx,cy,R,t,anim,em);
 for(i=0;i<parts.length;i++){P=parts[i];
  var rot=anim*0.018*P.spin*(L.mode==='vortex'?2.2:L.mode==='mandala'?1.4:0.7);
  rad=em>0?lerp(0.16,1.4,ease(em)):lerp(1.15,0.16,ease(tg));
  ang=P.a+rot+(L.mode==='vortex'?(1-rad)*6:0);
  x=cx+Math.cos(ang)*rad*R;y=cy+Math.sin(ang)*rad*R*(L.mode==='prism'?1.05:1);
  al=clamp(t/0.12,0,1)*(1-clamp(em-0.1,0,1))*0.85+0.12*Math.abs(Math.sin(P.ph+anim*0.05));
  var sz=P.sz*(1+(L.mode==='quantum'?0.5*Math.sin(anim*0.2+P.ph):0));
  ctx.beginPath();ctx.arc(x,y,Math.max(0.6,sz),0,6.2832);ctx.fillStyle=P.col;ctx.globalAlpha=clamp(al,0,1);ctx.shadowColor=P.col;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;}
 drawCore(ctx,L,cx,cy,R,t,em);
 decoFront(ctx,L,cx,cy,R,t,anim,tg,em);
}

function frame(ts){
 if(!running)return;
 if(!t0)t0=ts;var el=ts-t0,t=clamp(el/DUR,0,1);
 var cv=document.getElementById('meltCoreCv');if(cv)draw(cv,LV[curLv],t,el*0.06);
 if(t>=1){stop(false);return;}
 raf=requestAnimationFrame(frame);
}
function activeLensKey(){
 try{if(window.LensLevels&&typeof LensLevels.active==='function'){var a=LensLevels.active();if(a&&a.key)return a.key;}}catch(e){}
 return null;
}
function lensTint(L){
 var key=activeLensKey();if(!key)return L;
 try{
  if(typeof window.lensPalette!=='function')return L;
  var pal=window.lensPalette(key);if(!pal||!pal.length)return L;
  var t={};for(var k in L){if(L.hasOwnProperty(k))t[k]=L[k];}
  t.par=pal;t.core=pal[0]||L.core;t.ring=pal[pal.length-1]||L.ring;
  return t;
 }catch(e){return L;}
}
function play(opts){
 opts=opts||{};curLv=clamp(opts.level||meltLevel(),1,6);isPreview=!!opts.preview;onDoneCb=opts.onDone||null;
 var L=lensTint(LV[curLv]),ov=ensureOv(),cv=document.getElementById('meltCoreCv');
 ov.style.display='flex';sizeCv(cv);initParts(L);setCap(L);
 requestAnimationFrame(function(){ov.style.opacity='1';});
 running=true;t0=0;if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
function stop(){
 running=false;if(raf){cancelAnimationFrame(raf);raf=null;}
 var ov=document.getElementById('meltCoreOv');if(ov){ov.style.opacity='0';setTimeout(function(){if(!running)ov.style.display='none';},420);}
 var cb=onDoneCb;onDoneCb=null;if(cb){try{cb();}catch(e){}}
}
function preview(n){play({level:n,preview:true});}

function ensurePicker(){
 var sc=document.getElementById('s-tigel');if(!sc)return;if(document.getElementById('meltCorePick'))return;
 var btn=document.getElementById('meltBtn');if(!btn)return;
 var wrap=document.createElement('div');wrap.id='meltCorePick';wrap.style.cssText='margin-top:12px;text-align:center';
 var html='<span style="font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#8e88a4;display:block;margin-bottom:6px">\u0421\u0435\u0440\u0434\u0446\u0435 \u00b7 \u0443\u0440\u043e\u0432\u043d\u0438 \u043f\u043b\u0430\u0432\u043a\u0438 (\u043f\u0440\u0435\u0432\u044c\u044e)</span><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">';
 for(var i=1;i<=6;i++){html+='<button class="mc-dot" data-l="'+i+'" style="width:32px;height:32px;border-radius:9px;border:1px solid rgba(201,168,76,.4);background:rgba(255,255,255,.04);color:#ffd27a;font-family:JetBrains Mono,monospace;font-size:12px;cursor:pointer">'+i+'</button>';}
 html+='</div>';wrap.innerHTML=html;
 btn.parentNode.insertBefore(wrap,btn.nextSibling);
 wrap.querySelectorAll('.mc-dot').forEach(function(b){b.onclick=function(){preview(parseInt(b.getAttribute('data-l'),10));};});
}
function hookBtn(){
 var btn=document.getElementById('meltBtn');if(!btn||btn.__meltCore)return;
 var orig=btn.onclick;btn.__meltCore=true;
 btn.onclick=function(ev){play({level:meltLevel()});if(typeof orig==='function')orig.call(btn,ev);};
}
function boot(){ensureOv();hookBtn();ensurePicker();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,300);});else setTimeout(boot,300);
setTimeout(boot,1200);setTimeout(boot,2600);

window.AwaraMeltCore={play:play,preview:preview,stop:function(){stop(true);},meltLevel:meltLevel,levels:LV,__v:1};
})();