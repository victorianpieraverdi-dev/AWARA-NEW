/* AWARA · Raspredelitel Potoka (Mozg Tiglya) v1
   Law: where the day's flow pours - Soul/Water/Info -> spheres (Cosmos/Soul/Daimon/Cells/Earth) by meras and levels.
   Master gate: awareness x fullness. Inputs: element, mera, conscious choice, balance, nakshatra/hour.
   Local deterministic brain; brainHook left for AI proxy later. Reads STATE, writes STATE.spheresLog. */
(function(){
'use strict';
if(window.AwaraFlow&&window.AwaraFlow.__ready&&window.AwaraFlow.__v>=1)return;

var SPHERES=[
 {k:'cosmos',name:'\u041a\u043e\u0441\u043c\u043e\u0441',icon:'\ud83c\udf0c',mera:8,col:['#9d86e0','#ffd27a']},
 {k:'soul',  name:'\u0414\u0443\u0448\u0430',        icon:'\ud83d\udc97',mera:6,col:['#ff9ec7','#ffd27a']},
 {k:'daimon',name:'\u0414\u0430\u0439\u043c\u043e\u043d',icon:'\ud83d\udc09',mera:5,col:['#b06bff','#7a5cff']},
 {k:'cells', name:'\u042f\u0447\u0435\u0439\u043a\u0438',icon:'\u25a6',mera:3,col:['#7ad0ff','#c8b6ff']},
 {k:'earth', name:'\u0417\u0435\u043c\u043b\u044f',     icon:'\ud83e\udea8',mera:1,col:['#b98a3c','#9bcf6a']}
];
var NAME={cosmos:'\u041a\u043e\u0441\u043c\u043e\u0441',soul:'\u0414\u0443\u0448\u0430',daimon:'\u0414\u0430\u0439\u043c\u043e\u043d',cells:'\u042f\u0447\u0435\u0439\u043a\u0438',earth:'\u0417\u0435\u043c\u043b\u044f'};
var EL_SPHERE={
 '\u041e\u0433\u043e\u043d\u044c':['cosmos','soul'],
 '\u0420\u0430\u0441\u0441\u0432\u0435\u0442':['soul','daimon'],
 '\u042d\u0444\u0438\u0440':['cosmos'],
 '\u0412\u043e\u0437\u0434\u0443\u0445':['soul','daimon'],
 '\u0412\u043e\u0434\u0430':['soul','earth'],
 '\u0417\u0435\u043c\u043b\u044f':['earth','cells'],
 '\u0413\u0440\u043e\u0437\u0430':['cosmos','cells']
};
var LEANS=[
 {k:'balance',name:'\u0411\u0430\u043b\u0430\u043d\u0441'},
 {k:'cosmos',name:'\u041a\u043e\u0441\u043c\u043e\u0441'},
 {k:'soul',name:'\u0414\u0443\u0448\u0430'},
 {k:'daimon',name:'\u0414\u0430\u0439\u043c\u043e\u043d'},
 {k:'cells',name:'\u042f\u0447\u0435\u0439\u043a\u0438'},
 {k:'earth',name:'\u0417\u0435\u043c\u043b\u044f'}
];

var raf=null, anim=0;

function c01(x){return Math.max(0,Math.min(1,x));}
function c100(x){return Math.max(0,Math.min(100,x));}
function S(){try{if(typeof STATE!=='undefined'&&STATE&&STATE.birth)return STATE;}catch(e){}try{return JSON.parse(localStorage.getItem('tigel_v1')||'{}');}catch(e){return{};}}
function persist(){try{if(typeof save==='function'){save();return;}}catch(e){}try{localStorage.setItem('tigel_v1',JSON.stringify(S()));}catch(e){}}
function light(){try{if(typeof lightVal==='function'){var v=lightVal();if(typeof v==='number'&&!isNaN(v))return c100(Math.round(v));}}catch(e){}var s=S();return c100(Math.round((s.baseLight||48)+(s.lightBonus||0)));}
function meraLevel(lv){return Math.max(1,Math.min(9,Math.round(lv/100*9)));}
function intentsDone(){var s=S(),a=s.intents||[],n=0,i;for(i=0;i<a.length;i++){if(a[i]&&a[i].done)n++;}return n;}
function intentsTotal(){var s=S();return (s.intents&&s.intents.length)?s.intents.length:0;}
function daimon(){var s=S();return s.daimon||null;}
function primEl(){var d=daimon();if(d&&d.el)return d.el;var s=S(),mats=s.mats||[];if(mats.length&&typeof MATRIX!=='undefined'&&MATRIX[mats[0]])return MATRIX[mats[0]][1];return '\u042d\u0444\u0438\u0440';}
function ymd(dt){var m=dt.getMonth()+1,d=dt.getDate();return dt.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);}

function substances(){
 var lv=light(),s=S(),trust=s.trust||0,idone=intentsDone(),lensN=(s.mats?s.mats.length:0),mera=meraLevel(lv);
 var soul=c100(lv*0.6+trust*0.4);
 var water=c100(idone*12+(s.streak||0)*3);
 var info=c100(lensN*16+mera*6);
 return {soul:soul,water:water,info:info,total:soul+water+info};
}
function awareness(){var s=S(),trust=s.trust||0,idone=intentsDone(),it=intentsTotal(),lensN=(s.mats?s.mats.length:0);return c01(trust/100*0.45+(it?idone/it:0)*0.35+Math.min(1,lensN/3)*0.2);}
function fullness(){var s=S(),lv=light(),days=(s.days?s.days.length:0);return c01(lv/100*0.55+Math.min(1,(s.streak||0)/14)*0.25+Math.min(1,days/90)*0.2);}

function reservoirs(){
 var s=S(),log=s.spheresLog||[],r={cosmos:0,soul:0,daimon:0,cells:0,earth:0},i,k;
 for(i=0;i<log.length;i++){var e=log[i];for(k in r){if(e.w&&e.w[k])r[k]+=e.V*e.w[k];}}
 for(k in r)r[k]=Math.round(r[k]);
 return r;
}
function sphereLevel(res){if(res<=0)return 0;return Math.min(9,Math.floor(Math.sqrt(res)/3)+1);}

function computeSplit(hour){
 var sub=substances(),s=S();
 var w={cosmos:0,soul:0,daimon:0,cells:0,earth:0},k;
 w.soul+=sub.soul*0.5; w.cosmos+=sub.soul*0.3; w.daimon+=sub.soul*0.2;
 w.earth+=sub.water*0.4; w.cells+=sub.water*0.3; w.daimon+=sub.water*0.3;
 w.cells+=sub.info*0.5; w.cosmos+=sub.info*0.3; w.soul+=sub.info*0.2;
 var el=primEl(),tg=EL_SPHERE[el]||['cosmos'],i;
 for(i=0;i<tg.length;i++)w[tg[i]]*=1.25;
 if(hour==null)hour=(new Date()).getHours();
 if(hour>=5&&hour<11){w.earth*=1.2;w.cells*=1.15;}
 else if(hour>=11&&hour<16){w.cells*=1.15;w.daimon*=1.15;}
 else if(hour>=16&&hour<21){w.soul*=1.25;w.cosmos*=1.2;}
 else {w.cosmos*=1.15;w.soul*=1.1;}
 var lean=s.flowLean||'balance';
 if(lean!=='balance'&&w[lean]!=null)w[lean]*=1.7;
 var res=reservoirs(),vals=[];for(k in res)vals.push(res[k]);var sum0=0;for(i=0;i<vals.length;i++)sum0+=vals[i];var avg=sum0/(vals.length||1);
 if(avg>0){for(k in w){if(res[k]<avg)w[k]*=(1+((avg-res[k])/avg)*0.5);}}
 var A=awareness(),F=fullness(),lift=A*0.5+F*0.5;
 w.cosmos*=(1+lift*0.9); w.soul*=(1+lift*0.6); w.earth*=(1-lift*0.35); w.cells*=(1-lift*0.2);
 var sum=0;for(k in w)sum+=w[k];if(sum<=0)sum=1;for(k in w)w[k]=w[k]/sum;
 var V=Math.min(160,Math.round(c100(light())+intentsDone()*3+(s.streak||0)));
 return {w:w,V:V,A:A,F:F,sub:sub,hour:hour,el:el,lean:lean};
}

function reasoning(sp){
 var out=[],w=sp.w,k,top=[];
 for(k in w)top.push([k,w[k]]);
 top.sort(function(a,b){return b[1]-a[1];});
 var up=(sp.A*0.5+sp.F*0.5>0.5);
 out.push('\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c '+Math.round(sp.A*100)+'% \u00b7 \u041f\u043e\u043b\u043d\u043e\u0442\u0430 '+Math.round(sp.F*100)+'% \u2192 '+(up?'\u043f\u043e\u0442\u043e\u043a \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0432 \u0414\u0443\u0448\u0443 \u0438 \u041a\u043e\u0441\u043c\u043e\u0441':'\u043f\u043e\u0442\u043e\u043a \u0434\u0435\u0440\u0436\u0438\u0442\u0441\u044f \u0443 \u0417\u0435\u043c\u043b\u0438 \u0438 \u042f\u0447\u0435\u0435\u043a'));
 out.push('\u0421\u0442\u0438\u0445\u0438\u044f \u0434\u043d\u044f \u2014 '+sp.el+' \u2192 \u0442\u044f\u043d\u0435\u0442 \u0432 '+(EL_SPHERE[sp.el]||['cosmos']).map(function(x){return NAME[x];}).join(' \u0438 '));
 out.push('\u0412\u0435\u0449\u0435\u0441\u0442\u0432\u0430: \u0414\u0443\u0448\u0430 '+Math.round(sp.sub.soul)+' \u00b7 \u0412\u043e\u0434\u0430 '+Math.round(sp.sub.water)+' \u00b7 \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f '+Math.round(sp.sub.info));
 if(sp.lean!=='balance')out.push('\u0422\u0432\u043e\u0439 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u044b\u0439 \u0432\u044b\u0431\u043e\u0440: \u0443\u0441\u0438\u043b\u0438\u0442\u044c '+NAME[sp.lean]);
 out.push('\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u0440\u0430\u0437\u043b\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u2192 '+NAME[top[0][0]]+' ('+Math.round(top[0][1]*100)+'%), \u0437\u0430\u0442\u0435\u043c '+NAME[top[1][0]]+' ('+Math.round(top[1][1]*100)+'%)');
 return out;
}

function pour(){
 var s=S();if(!s.spheresLog)s.spheresLog=[];
 var date=ymd(new Date()),sp=computeSplit(),i,idx=-1;
 for(i=0;i<s.spheresLog.length;i++){if(s.spheresLog[i].date===date){idx=i;break;}}
 var rec={date:date,V:sp.V,w:sp.w,A:sp.A,F:sp.F,hour:sp.hour};
 if(idx>=0)s.spheresLog[idx]=rec;else s.spheresLog.unshift(rec);
 persist();render();
 if(typeof showToast==='function')showToast('\ud83d\udca7 \u041f\u043e\u0442\u043e\u043a \u0434\u043d\u044f \u0440\u0430\u0437\u043b\u0438\u0442 \u043f\u043e \u0441\u0444\u0435\u0440\u0430\u043c');
}
function autoPour(){
 var s=S();if(!s.spheresLog)s.spheresLog=[];var date=ymd(new Date()),i;
 for(i=0;i<s.spheresLog.length;i++){if(s.spheresLog[i].date===date)return;}
 pour();
}

function bez(p0,p1,p2,p3,t){var u=1-t;return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3;}
function draw(cv){
 var ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
 var sp=computeSplit(),res=reservoirs(),src={x:150,y:H/2},i,j;
 for(i=0;i<SPHERES.length;i++){
  var SP=SPHERES[i],p={x:430,y:70+i*((H-140)/4)},wgt=sp.w[SP.k],mx=(src.x+p.x)/2;
  ctx.beginPath();ctx.moveTo(src.x,src.y);ctx.bezierCurveTo(mx,src.y,mx,p.y,p.x-30,p.y);
  ctx.strokeStyle=SP.col[0];ctx.globalAlpha=0.22+wgt*0.6;ctx.lineWidth=2+wgt*36;ctx.shadowColor=SP.col[0];ctx.shadowBlur=12;ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=0;
  var pc=Math.round(2+wgt*10);
  for(j=0;j<pc;j++){var t=((anim*0.01+j/pc)%1),bx=bez(src.x,mx,mx,p.x-30,t),by=bez(src.y,src.y,p.y,p.y,t);ctx.beginPath();ctx.arc(bx,by,2.2,0,Math.PI*2);ctx.fillStyle=SP.col[1];ctx.globalAlpha=Math.sin(t*Math.PI);ctx.fill();ctx.globalAlpha=1;}
  var rr=14+Math.min(40,Math.sqrt(res[SP.k])),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);g.addColorStop(0,SP.col[1]);g.addColorStop(1,SP.col[0]);
  ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fillStyle=g;ctx.globalAlpha=0.85;ctx.shadowColor=SP.col[0];ctx.shadowBlur=16;ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.font='13px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText(SP.icon+' '+SP.name+'  '+Math.round(sp.w[SP.k]*100)+'%',p.x+rr+12,p.y-7);
  ctx.fillStyle='#cbb6e8';ctx.font='11px monospace';
  ctx.fillText('\u0437\u0430\u043f\u0430\u0441 '+res[SP.k]+' \u00b7 \u0443\u0440.'+sphereLevel(res[SP.k])+' \u00b7 \u043c\u0435\u0440\u0430 '+SP.mera,p.x+rr+12,p.y+9);
 }
 var sg=ctx.createRadialGradient(src.x,src.y,0,src.x,src.y,42);sg.addColorStop(0,'#ffd27a');sg.addColorStop(1,'rgba(255,158,199,0.08)');
 ctx.beginPath();ctx.arc(src.x,src.y,30+3*Math.sin(anim*0.05),0,Math.PI*2);ctx.fillStyle=sg;ctx.shadowColor='#ffd27a';ctx.shadowBlur=22;ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('\u041f\u043e\u0442\u043e\u043a \u0434\u043d\u044f',src.x,src.y-46);
 ctx.fillStyle='#ffd27a';ctx.font='11px monospace';ctx.fillText('V='+sp.V,src.x,src.y);
}

function render(){
 var cv=document.getElementById('flw-cv');if(cv)draw(cv);
 var sp=computeSplit();
 var rd=document.getElementById('flw-read');if(rd)rd.innerHTML='\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c <b>'+Math.round(sp.A*100)+'%</b> \u00b7 \u041f\u043e\u043b\u043d\u043e\u0442\u0430 <b>'+Math.round(sp.F*100)+'%</b>';
 var rs=document.getElementById('flw-reason');if(rs){var lines=reasoning(sp);rs.innerHTML=lines.map(function(l){return '<div class="trait" style="border:none;padding:3px 0"><span style="max-width:100%">'+l+'</span></div>';}).join('');}
 var s=S(),lean=s.flowLean||'balance',i;
 for(i=0;i<LEANS.length;i++){var b=document.getElementById('flw-lean-'+LEANS[i].k);if(b)b.style.opacity=(LEANS[i].k===lean)?'1':'0.5';}
}

function ensureStyle(){
 if(document.getElementById('flw-style'))return;
 var st=document.createElement('style');st.id='flw-style';
 st.textContent=['#flw-cv{display:block;margin:6px auto;max-width:100%}',
  '#flw-read{font-family:monospace;font-size:11px;color:#ffd27a;letter-spacing:.05em;margin:6px 0}',
  '#flw-lean{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}',
  '#flw-lean .btn{margin:0;flex:0 0 auto;padding:5px 10px;font-size:12px}'].join('');
 document.head.appendChild(st);
}
function ensureModal(){
 if(document.getElementById('flw-modal'))return;
 var d=document.createElement('div');d.className='libmodal';d.id='flw-modal';
 var leanBtns='',i;for(i=0;i<LEANS.length;i++)leanBtns+='<button class="btn ghost" id="flw-lean-'+LEANS[i].k+'">'+LEANS[i].name+'</button>';
 d.innerHTML='<div class="libcard awara-glass-card" style="text-align:center;max-width:520px">'+
  '<div class="libel">\u041c\u043e\u0437\u0433 \u0422\u0438\u0433\u043b\u044f \u00b7 \u041f\u0443\u0442\u044c \u0414\u0443\u0445\u0430 \u00b7 \u0421\u043e\u0437\u043d\u0430\u043d\u0438\u044f \u00b7 \u0421\u0432\u0435\u0442\u0430</div>'+
  '<h2 style="margin-top:4px">\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u0435\u043b\u044c \u041f\u043e\u0442\u043e\u043a\u0430</h2>'+
  '<div class="label">\u0414\u0443\u0448\u0430 \u00b7 \u0412\u043e\u0434\u0430 \u00b7 \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u2192 \u041a\u043e\u0441\u043c\u043e\u0441 \u00b7 \u0414\u0443\u0448\u0430 \u00b7 \u0414\u0430\u0439\u043c\u043e\u043d \u00b7 \u042f\u0447\u0435\u0439\u043a\u0438 \u00b7 \u0417\u0435\u043c\u043b\u044f</div>'+
  '<canvas id="flw-cv" width="600" height="600" style="width:100%;max-width:560px"></canvas>'+
  '<div id="flw-read"></div>'+
  '<div class="label">\u041e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e \u043d\u0430\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0442\u043e\u043a</div>'+
  '<div id="flw-lean">'+leanBtns+'</div>'+
  '<button class="btn awara-gold-button" id="flw-pour">\ud83d\udca7 \u0420\u0430\u0437\u043b\u0438\u0442\u044c \u043f\u043e\u0442\u043e\u043a \u0434\u043d\u044f</button>'+
  '<div id="flw-reason" class="card awara-glass-card" style="text-align:left;margin-top:10px"></div>'+
  '<button class="btn ghost" id="flw-close" style="margin-top:8px">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button></div>';
 document.body.appendChild(d);
 d.onclick=function(e){if(e.target===d)close();};
 document.getElementById('flw-close').onclick=close;
 document.getElementById('flw-pour').onclick=pour;
 for(i=0;i<LEANS.length;i++){(function(k){var b=document.getElementById('flw-lean-'+k);if(b)b.onclick=function(){var s=S();s.flowLean=k;persist();render();};})(LEANS[i].k);}
}

function loop(){anim++;var cv=document.getElementById('flw-cv');if(cv)draw(cv);raf=requestAnimationFrame(loop);}
function open(){ensureStyle();ensureModal();render();document.getElementById('flw-modal').classList.add('open');if(!raf)loop();}
function close(){var m=document.getElementById('flw-modal');if(m)m.classList.remove('open');if(raf){cancelAnimationFrame(raf);raf=null;}}

function wrapDoLive(){try{if(typeof window.doLive==='function'&&!window.doLive.__flowWrapped){var _dl=window.doLive;window.doLive=function(){var r=_dl.apply(this,arguments);setTimeout(function(){try{autoPour();}catch(e){}},80);return r;};window.doLive.__flowWrapped=true;}}catch(e){}}
function launcher(txt){var b=document.createElement('button');b.className='btn ghost flw-launch';b.textContent=txt;b.onclick=open;return b;}
function injectLaunchers(){
 var ist=document.getElementById('s-plan');if(ist&&!ist.querySelector('.flw-launch'))ist.appendChild(launcher('\ud83d\udca7 \u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u0435\u043b\u044c \u041f\u043e\u0442\u043e\u043a\u0430'));
 var mac=document.getElementById('s-macro');if(mac&&!mac.querySelector('.flw-launch'))mac.appendChild(launcher('\ud83d\udca7 \u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u0435\u043b\u044c \u00b7 \u0421\u0444\u0435\u0440\u044b'));
 var r=document.getElementById('s-result');if(r&&!r.querySelector('.flw-launch'))r.appendChild(launcher('\ud83d\udca7 \u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u0435\u043b\u044c \u041f\u043e\u0442\u043e\u043a\u0430'));
}
function boot(){ensureStyle();injectLaunchers();wrapDoLive();setTimeout(function(){injectLaunchers();wrapDoLive();},900);setTimeout(function(){injectLaunchers();wrapDoLive();},1800);setTimeout(function(){injectLaunchers();wrapDoLive();},3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,200);});else setTimeout(boot,200);

window.AwaraFlow={open:open,close:close,render:render,split:computeSplit,pour:pour,reservoirs:reservoirs,brainHook:null,__ready:true,__v:1};
})();
