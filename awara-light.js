/* AWARA · Razliv Sveta / Lestnica Sveta (Light Particles flow, two-way) v2
   Canon v2 (user 19:20): light PARTICLES == 'svet osoznannosti' (one and the same). Base = particles.
   FLOW: particles flow through connection to DAIMON (lower nature) -> Mind/Soul -> Temple (if level) ->
   matrices open NEW MATRICES & charge the ELECTROMAGNETIC FIELD that sits UNDER the soul -> reflected in
   LOCATIONS (under soul, where player did tasks) -> all filled via the TIGEL -> up to COSMOS (above soul, if level)
   -> into the SUPER-GAME by level. NEXT DAY: charges the player's DAIMON + intentions + creation of NEW SPHERES in the soul.
   Customization of all windows & the Tigel is powered by a strong, spun-up EM FIELD that collects particles from everywhere,
   in service of Svetkoin / Svet-coin / Svet Ra. Every day: light grows. Matrix positions revealed in C:/AWARA/lvl god.
   NOT building the big-game transition or real customization UI - only flow, accrual, EM field & window-unlock as foundation. Bot hook: botInfluence(). */
(function(){
'use strict';
if(window.AwaraLight&&window.AwaraLight.__ready&&window.AwaraLight.__v>=4)return;

var Z={ch:'\u0441\u0432\u044f\u0437\u044c',un:'\u043f\u043e\u0434 \u0434\u0443\u0448\u043e\u0439',co:'\u0446\u0435\u043d\u0442\u0440',ov:'\u043d\u0430\u0434 \u0434\u0443\u0448\u043e\u0439'};
var LADDER=[
 {k:'daimon',   name:'\u0414\u0430\u0439\u043c\u043e\u043d',                       zone:Z.ch,th:0,   col:['#b06bff','#7a5cff'],sub:'\u043a\u0430\u043d\u0430\u043b \u043d\u0438\u0437\u0448\u0435\u0439 \u043f\u0440\u0438\u0440\u043e\u0434\u044b'},
 {k:'locations',name:'\u041b\u043e\u043a\u0430\u0446\u0438\u0438',                  zone:Z.un,th:30,  col:['#9bcf6a','#7ad0ff'],sub:'\u0447\u0442\u043e \u0438\u0433\u0440\u043e\u043a \u043d\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u043b'},
 {k:'emf',      name:'\u042d\u041c-\u043f\u043e\u043b\u0435',                     zone:Z.un,th:70,  col:['#7ad0ff','#c8b6ff'],sub:'\u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442 \u0447\u0430\u0441\u0442\u0438\u0446\u044b \u043e\u0442\u043e\u0432\u0441\u044e\u0434\u0443'},
 {k:'newmatrix',name:'\u041d\u043e\u0432\u044b\u0435 \u041c\u0430\u0442\u0440\u0438\u0446\u044b',zone:Z.un,th:130,col:['#c8b6ff','#b06bff'],sub:'\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u2014 lvl god'},
 {k:'soul',     name:'\u0414\u0443\u0448\u0430 \u00b7 \u0423\u043c',              zone:Z.co,th:0,   col:['#ff9ec7','#ffd27a'],sub:'\u043d\u043e\u0432\u044b\u0435 \u0441\u0444\u0435\u0440\u044b \u0440\u043e\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0437\u0434\u0435\u0441\u044c'},
 {k:'hram',     name:'\u0425\u0440\u0430\u043c',                                   zone:Z.ov,th:220, col:['#ffd27a','#ff9ec7'],sub:''},
 {k:'chronicle',name:'\u0425\u0440\u043e\u043d\u0438\u043a\u0430 \u00b7 \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f',zone:Z.ov,th:360,col:['#9d86e0','#7ad0ff'],sub:''},
 {k:'cosmos',   name:'\u041a\u043e\u0441\u043c\u043e\u0441',                       zone:Z.ov,th:560, col:['#9d86e0','#ffd27a'],sub:''},
 {k:'supergame',name:'\u0421\u0443\u043f\u0435\u0440-\u0418\u0433\u0440\u0430 \u00b7 \u0421\u0432\u0435\u0442\u043a\u043e\u0438\u043d \u00b7 \u0421\u0432\u0435\u0442 \u0420\u0430',zone:Z.ov,th:1200,col:['#ffd27a','#ff9ec7'],sub:'\u043e\u0447\u0435\u043d\u044c \u0434\u043e\u0440\u043e\u0433\u043e'}
];
var BASEW={daimon:0.16,locations:0.12,emf:0.10,newmatrix:0.10,soul:0.22,hram:0.08,chronicle:0.08,cosmos:0.08,supergame:0.06};
var CALIB_DEF={w:{daimon:0.16,locations:0.12,emf:0.10,newmatrix:0.10,soul:0.22,hram:0.08,chronicle:0.08,cosmos:0.08,supergame:0.06},meraMax:10,burnBase:0.06,lift:1};
function loadCalib(){try{var c=JSON.parse(localStorage.getItem('awara_calib')||'null');if(c&&c.w){if(c.meraMax==null)c.meraMax=10;if(c.burnBase==null)c.burnBase=0.06;if(c.lift==null)c.lift=1;return c;}}catch(e){}return JSON.parse(JSON.stringify(CALIB_DEF));}
var CALIB=loadCalib();
function saveCalib(){try{localStorage.setItem('awara_calib',JSON.stringify(CALIB));}catch(e){}}
function setW(k,v){if(CALIB.w[k]!=null){CALIB.w[k]=Math.max(0,v);saveCalib();}return CALIB.w[k];}
function setKnob(k,v){if(k==='meraMax')CALIB.meraMax=Math.max(1,v);else if(k==='burnBase')CALIB.burnBase=Math.max(0,v);else if(k==='lift')CALIB.lift=Math.max(0,v);saveCalib();return CALIB[k];}
function resetCalib(){CALIB=JSON.parse(JSON.stringify(CALIB_DEF));saveCalib();return CALIB;}
function listVariants(){try{return JSON.parse(localStorage.getItem('awara_variants')||'[]');}catch(e){return[];}}
function saveVariant(note){var a=listVariants();var st=state();var v={id:'v'+Date.now(),date:ymd(new Date()),note:(''+(note||'')).slice(0,120),calib:JSON.parse(JSON.stringify(CALIB)),snap:{particles:st.particles,emf:st.emf,svetkoin:st.svetkoin,mera:st.mera,meraMul:st.meraMul,open:st.open,soul:st.soul,daimon:st.daimon}};a.unshift(v);if(a.length>200)a.pop();try{localStorage.setItem('awara_variants',JSON.stringify(a));}catch(e){}return v;}
function applyVariant(id){var a=listVariants(),i;for(i=0;i<a.length;i++){if(a[i].id===id&&a[i].calib){CALIB=JSON.parse(JSON.stringify(a[i].calib));if(!CALIB.w)CALIB.w=JSON.parse(JSON.stringify(CALIB_DEF.w));if(CALIB.meraMax==null)CALIB.meraMax=10;if(CALIB.burnBase==null)CALIB.burnBase=0.06;if(CALIB.lift==null)CALIB.lift=1;saveCalib();return true;}}return false;}
function exportCalib(){return JSON.stringify({calib:CALIB,variants:listVariants()},null,2);}
var NAME={};(function(){var i;for(i=0;i<LADDER.length;i++)NAME[LADDER[i].k]=LADDER[i].name;})();
var CH={1:'muladhara',2:'svadhisthana',3:'manipura',4:'anahata',5:'vishuddha',6:'ajna',7:'sahasrara',8:'bindu',9:'absolut'};
var raf=null,anim=0;

function c100(x){return Math.max(0,Math.min(100,x));}
function r(x){return Math.round(x);}
function S(){try{if(typeof STATE!=='undefined'&&STATE&&STATE.birth)return STATE;}catch(e){}try{return JSON.parse(localStorage.getItem('tigel_v1')||'{}');}catch(e){return{};}}
function persist(){try{if(typeof save==='function'){save();return;}}catch(e){}try{localStorage.setItem('tigel_v1',JSON.stringify(S()));}catch(e){}}
function light(){try{if(typeof lightVal==='function'){var v=lightVal();if(typeof v==='number'&&!isNaN(v))return c100(r(v));}}catch(e){}var s=S();return c100(r((s.baseLight||48)+(s.lightBonus||0)));}
function meraLevel(lv){return Math.max(1,Math.min(9,Math.round(lv/100*9)));}
function intentsDone(){var s=S(),a=s.intents||[],n=0,i;for(i=0;i<a.length;i++){if(a[i]&&a[i].done)n++;}return n;}
function intentsTotal(){var s=S();return(s.intents&&s.intents.length)?s.intents.length:0;}
function streakOf(){var s=S();return s.streak||0;}
function daysOf(){var s=S();return s.days?s.days.length:0;}
function ymd(dt){var m=dt.getMonth()+1,d=dt.getDate();return dt.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);}
function awarenessL(){var s=S(),trust=s.trust||0,idone=intentsDone(),it=intentsTotal(),lensN=(s.mats?s.mats.length:0);return Math.max(0,Math.min(1,trust/100*0.45+(it?idone/it:0)*0.35+Math.min(1,lensN/3)*0.2));}
function fullnessL(){var s=S(),lv=light(),days=daysOf();return Math.max(0,Math.min(1,lv/100*0.55+Math.min(1,streakOf()/14)*0.25+Math.min(1,days/90)*0.2));}
function AF(){try{if(window.AwaraFlow&&AwaraFlow.split){var sp=AwaraFlow.split();if(sp&&typeof sp.A==='number')return{A:sp.A,F:sp.F};}}catch(e){}return{A:awarenessL(),F:fullnessL()};}
function regularity(){return Math.max(0,Math.min(1,streakOf()/21*0.6+Math.min(1,daysOf()/60)*0.4));}

function ensure(s){if(!s.ladder)s.ladder={};var i;for(i=0;i<LADDER.length;i++){if(typeof s.ladder[LADDER[i].k]!=='number')s.ladder[LADDER[i].k]=0;}if(typeof s.ladder.player!=='number')s.ladder.player=0;if(typeof s.svet!=='number')s.svet=0;if(typeof s.svetkoin!=='number')s.svetkoin=0;if(typeof s.emf!=='number')s.emf=0;if(typeof s.soulSpheres!=='number')s.soulSpheres=0;}
function particles(){var s=S();ensure(s);return s.svet||0;}
function emf(){var s=S();ensure(s);return s.emf||0;}
function emfMul(){return 1+Math.min(emf()/300,1)*0.8;}
function canCustomize(){return emf()>=120;}
function meraNow(){var s=S();if(typeof s.meraLived==='number'&&s.meraLived>=1)return Math.max(1,Math.min(9,Math.round(s.meraLived)));return meraLevel(light());}
function meraMul(m){m=(m!=null?m:meraNow());m=Math.max(1,Math.min(9,m));return Math.pow((CALIB.meraMax||10),(m-1)/8);}
function setMera(m){var s=S();ensure(s);s.meraLived=Math.max(1,Math.min(9,m));persist();return s.meraLived;}
function dnum(str){var p=(''+(str||'')).split('-');if(p.length<3)return 0;return Math.round(Date.UTC(+p[0],(+p[1])-1,+p[2])/86400000);}
function daysGap(a,b){var g=dnum(b)-dnum(a);return g>0?g:0;}
function burnRate(){return (CALIB.burnBase||0.06)*(1-0.7*awarenessL());}
function decayCheck(){
 var s=S();ensure(s);var today=ymd(new Date());
 if(s.lastDecay===today)return null;
 var last=s.lastActive||today,gap=daysGap(last,today),burned=0,eb=0;
 if(gap>=1){
  var rate=burnRate(),keep=Math.pow(1-rate,gap),ekeep=Math.pow(1-rate*0.7,gap);
  var b0=s.svet||0;s.svet=r(b0*keep);burned=b0-s.svet;
  var e0=s.emf||0;s.emf=r(e0*ekeep);eb=e0-s.emf;
  if(burned>0){s.lightLog=s.lightLog||[];s.lightLog.unshift({date:today,src:'burn',amt:-r(burned),gap:gap});if(s.lightLog.length>200)s.lightLog.pop();}
 }
 s.lastDecay=today;persist();
 return {burned:burned,emfBurned:eb,gap:gap};
}
function matrixYield(mera,cards){
 var s=S();ensure(s);mera=Math.max(1,Math.min(9,mera||1));cards=cards||1;
 var val=cards*3*meraMul(mera)*0.6;
 s.svet=r((s.svet||0)+val);
 s.ladder.newmatrix=r((s.ladder.newmatrix||0)+val*0.4);
 s.ladder.soul=r((s.ladder.soul||0)+val*0.2);
 growEMF(cards*1.2);s.lastActive=ymd(new Date());
 s.lightLog=s.lightLog||[];s.lightLog.unshift({date:ymd(new Date()),src:'matrix',amt:r(val),m:mera});if(s.lightLog.length>200)s.lightLog.pop();
 persist();render();return val;
}
function isOpen(k){var s=S(),sv=s.svet||0,i;for(i=0;i<LADDER.length;i++){if(LADDER[i].k===k)return sv>=LADDER[i].th;}return true;}
function openCount(){var sv=particles(),n=0,i;for(i=0;i<LADDER.length;i++){if(sv>=LADDER[i].th)n++;}return n;}
function nextWindow(){var sv=particles(),best=null,i;for(i=0;i<LADDER.length;i++){if(sv<LADDER[i].th){if(!best||LADDER[i].th<best.w.th)best={w:LADDER[i],need:LADDER[i].th-sv};}}return best;}

function dist(){
 var lv=light(),m=meraNow(),af=AF(),A=af.A,F=af.F,lift=(A*0.5+F*0.5)*(CALIB.lift||1);
 var w={},k;for(k in CALIB.w)w[k]=CALIB.w[k];
 w.cosmos*=(1+lift*0.9);w.supergame*=(1+lift*1.0);w.hram*=(1+lift*0.7);w.chronicle*=(1+lift*0.5);w.newmatrix*=(1+lift*0.4);w.soul*=(1+lift*0.25);w.daimon*=(1-lift*0.2);w.locations*=(1-lift*0.15);
 var i;for(i=0;i<LADDER.length;i++){var key=LADDER[i].k;w[key]*=(particles()>=LADDER[i].th?1:0.15);}
 var sum=0;for(k in w)sum+=w[k];if(sum<=0)sum=1;for(k in w)w[k]=w[k]/sum;
 return {frac:w,m:m,A:A,F:F,lv:lv,lift:lift};
}

function accrueParticles(amount){var s=S();ensure(s);var add=(amount!=null?amount:((light()/100)*4+Math.min(streakOf(),30)*0.4+regularity()*3+1))*emfMul()*(amount!=null?1:meraMul());s.svet=r((s.svet||0)+add);return add;}
function growEMF(x){var s=S();ensure(s);s.emf=r((s.emf||0)+(x||0));return s.emf;}
function accrueSvetkoin(){var s=S();ensure(s);var blago=0.5+regularity()*0.5;var coin=awarenessL()*regularity()*blago*6;s.svetkoin=r((s.svetkoin||0)+coin);return coin;}

function pourLight(amount,text){
 var s=S();ensure(s);var d=dist(),mm=meraMul(d.m),amt=amount*mm,add={},k;
 for(k in d.frac){var inc=d.frac[k]*amt;s.ladder[k]=r((s.ladder[k]||0)+inc);add[k]=inc;}
 var back=amt*0.10*(0.5+d.A*0.5);s.ladder.player=r((s.ladder.player||0)+back);
 accrueParticles(amt*0.18*(0.5+d.A*0.5));growEMF(amount*0.04*(0.5+d.F*0.5));
 s.lastActive=ymd(new Date());
 s.lightLog=s.lightLog||[];s.lightLog.unshift({date:ymd(new Date()),src:'tigel',amt:r(amt),back:r(back),m:d.m,mul:+mm.toFixed(2),A:d.A,F:d.F,text:(''+(text||'')).slice(0,80)});
 if(s.lightLog.length>200)s.lightLog.pop();persist();
 if(typeof showToast==='function')showToast('\ud83d\udd06 \u0421\u0432\u0435\u0442 \u0442\u0435\u0447\u0451\u0442 \u0447\u0435\u0440\u0435\u0437 \u0422\u0438\u0433\u0435\u043b\u044c');
 render();return {d:d,add:add,back:back};
}
function fromGame(amount){
 var s=S();ensure(s);amount=amount||12;
 s.ladder.player=r((s.ladder.player||0)+amount);
 s.ladder.cosmos=r((s.ladder.cosmos||0)+amount*0.3);
 s.ladder.supergame=r((s.ladder.supergame||0)+amount*0.2);
 var cap=6,nb=Math.min(cap,(s.lbFromGame||0)+amount*0.05),prev=s.lbFromGame||0;
 s.lightBonus=(s.lightBonus||0)+(nb-prev);s.lbFromGame=nb;accrueParticles(amount*0.12);
 s.lightLog=s.lightLog||[];s.lightLog.unshift({date:ymd(new Date()),src:'game',amt:r(amount)});
 if(s.lightLog.length>200)s.lightLog.pop();persist();
 if(typeof showToast==='function')showToast('\u2728 \u0418\u0433\u0440\u0430 \u043d\u0430\u043f\u043e\u043b\u043d\u0438\u043b\u0430 \u0441\u0432\u0435\u0442 \u0438\u0433\u0440\u043e\u043a\u0430');
 render();
}
function addParticles(n){
 var s=S();ensure(s);n=n||1;var mm=meraMul(),grain=n*1.5*emfMul()*mm;
 s.ladder.player=r((s.ladder.player||0)+grain);s.ladder.daimon=r((s.ladder.daimon||0)+grain*0.5);accrueParticles(n*0.6*mm);growEMF(n*0.5);s.lastActive=ymd(new Date());
 s.lightLog=s.lightLog||[];s.lightLog.unshift({date:ymd(new Date()),src:'particles',amt:r(grain)});
 if(s.lightLog.length>200)s.lightLog.pop();persist();
 if(typeof showToast==='function')showToast('\ud83d\udcac +'+r(grain)+' \u0447\u0430\u0441\u0442\u0438\u0446 \u0441\u0432\u0435\u0442\u0430');
 render();
}
function botInfluence(key,amount){var s=S();ensure(s);if(s.ladder[key]!=null){s.ladder[key]=r(s.ladder[key]+(amount||0));persist();render();}return s.ladder;}
function autoFlow(){
 var s=S();ensure(s);decayCheck();s.lightLog=s.lightLog||[];var date=ymd(new Date()),i;
 for(i=0;i<s.lightLog.length;i++){if(s.lightLog[i].date===date&&s.lightLog[i].auto)return;}
 var amt=Math.min(30,8+light()*0.12+intentsDone()*2);var rzt=pourLight(amt,'\u0436\u0438\u0432\u043e\u0439 \u0434\u0435\u043d\u044c');
 s.ladder.daimon=r((s.ladder.daimon||0)+6+light()*0.05);
 s.ladder.locations=r((s.ladder.locations||0)+intentsDone()*1.5+2);
 growEMF(2+regularity()*4);accrueParticles();accrueSvetkoin();
 if(streakOf()>0&&daysOf()%3===0){s.soulSpheres=(s.soulSpheres||0)+1;s.ladder.soul=r((s.ladder.soul||0)+8);}
 var s2=S();if(s2.lightLog&&s2.lightLog[0])s2.lightLog[0].auto=true;persist();
 if(typeof showToast==='function')showToast('\ud83c\udf05 \u041d\u043e\u0432\u044b\u0439 \u0434\u0435\u043d\u044c: \u0437\u0430\u0440\u044f\u0434 \u0414\u0430\u0439\u043c\u043e\u043d\u0430, \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0439, \u0441\u0444\u0435\u0440');
 render();return rzt;
}

function state(){var s=S();ensure(s);var L=s.ladder,o={},i;for(i=0;i<LADDER.length;i++)o[LADDER[i].k]=L[LADDER[i].k]||0;o.player=L.player||0;o.particles=s.svet||0;o.svetkoin=s.svetkoin||0;o.emf=s.emf||0;o.soulSpheres=s.soulSpheres||0;o.mera=meraNow();o.meraMul=+meraMul().toFixed(2);o.burnPerDay=+burnRate().toFixed(3);o.open=openCount();o.canCustomize=canCustomize();return o;}
function brief(){var st=state(),nw=nextWindow();var s='\u0427\u0430\u0441\u0442\u0438\u0446\u044b \u0441\u0432\u0435\u0442\u0430 (=\u0441\u0432\u0435\u0442 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u0438) '+st.particles+' \u00b7 \u042d\u041c-\u043f\u043e\u043b\u0435 '+st.emf+' \u00b7 \u043e\u043a\u043e\u043d '+st.open+'/'+LADDER.length+' \u00b7 \u0421\u0432\u0435\u0442\u043a\u043e\u0438\u043d '+st.svetkoin+' \u00b7 \u0441\u0444\u0435\u0440 \u0414\u0443\u0448\u0438 '+st.soulSpheres+'. \u0422\u0435\u043a\u0443\u0442 \u0447\u0435\u0440\u0435\u0437 \u0414\u0430\u0439\u043c\u043e\u043d\u0430 ('+st.daimon+') \u0432 \u0414\u0443\u0448\u0443 ('+st.soul+').';if(nw)s+=' \u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0435 \u043e\u043a\u043d\u043e: '+nw.w.name+' (\u0435\u0449\u0451 '+r(nw.need)+').';s+=' Мера '+st.mera+'/9, ценность частицы ×'+st.meraMul+'. Без осознанности свет сгорает ~'+r(st.burnPerDay*100)+'%/день.';return s;}
function reasoning(d){
 d=d||dist();var out=[],k,top=[];for(k in d.frac)top.push([k,d.frac[k]]);top.sort(function(a,b){return b[1]-a[1];});
 out.push('\u0427\u0430\u0441\u0442\u0438\u0446\u044b \u0441\u0432\u0435\u0442\u0430 = \u0441\u0432\u0435\u0442 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u0438 (\u043e\u0434\u043d\u043e \u0438 \u0442\u043e \u0436\u0435): '+particles());
 out.push('\u0422\u0435\u043a\u0443\u0442 \u0447\u0435\u0440\u0435\u0437 \u0414\u0430\u0439\u043c\u043e\u043d\u0430 (\u0441\u0432\u044f\u0437\u044c) \u2192 \u0423\u043c/\u0414\u0443\u0448\u0430 \u2192 \u0425\u0440\u0430\u043c (\u043f\u043e \u0443\u0440\u043e\u0432\u043d\u044e)');
 out.push('\u041f\u043e\u0434 \u0434\u0443\u0448\u043e\u0439: \u041b\u043e\u043a\u0430\u0446\u0438\u0438, \u042d\u041c-\u043f\u043e\u043b\u0435, \u041d\u043e\u0432\u044b\u0435 \u041c\u0430\u0442\u0440\u0438\u0446\u044b \u0437\u0430\u0440\u044f\u0436\u0430\u044e\u0442\u0441\u044f');
 out.push('\u041d\u0430\u0434 \u0434\u0443\u0448\u043e\u0439: \u041a\u043e\u0441\u043c\u043e\u0441 \u0438 \u0421\u0443\u043f\u0435\u0440-\u0418\u0433\u0440\u0430 \u2014 \u043f\u043e \u0443\u0440\u043e\u0432\u043d\u044e');
 out.push('\u042d\u041c-\u043f\u043e\u043b\u0435 '+emf()+' \u2014 \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442 \u0447\u0430\u0441\u0442\u0438\u0446\u044b \u043e\u0442\u043e\u0432\u0441\u044e\u0434\u0443 (\u00d7'+(emfMul().toFixed(2))+(canCustomize()?', \u043a\u0430\u0441\u0442\u043e\u043c\u0438\u0437\u0430\u0446\u0438\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u0430':'')+')');
 out.push('\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u2192 '+NAME[top[0][0]]+' ('+r(top[0][1]*100)+'%), \u0437\u0430\u0442\u0435\u043c '+NAME[top[1][0]]+' ('+r(top[1][1]*100)+'%)');
 var nw=nextWindow();if(nw)out.push('\u0421\u0432\u0435\u0442 \u043e\u0442\u043a\u0440\u043e\u0435\u0442: '+nw.w.name+' \u2014 \u0435\u0449\u0451 '+r(nw.need)+' \u0447\u0430\u0441\u0442\u0438\u0446');
 out.push('\u041d\u0430 \u0441\u043b\u0435\u0434. \u0434\u0435\u043d\u044c: \u0437\u0430\u0440\u044f\u0434 \u0414\u0430\u0439\u043c\u043e\u043d\u0430 + \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u044f + \u043d\u043e\u0432\u044b\u0435 \u0441\u0444\u0435\u0440\u044b \u0414\u0443\u0448\u0438');
 out.push('\u0421\u0432\u0435\u0442 \u0440\u0430\u0441\u0442\u0451\u0442 \u043a\u0430\u0436\u0434\u044b\u0439 \u0434\u0435\u043d\u044c \u00b7 \u0441\u043b\u0443\u0436\u0435\u043d\u0438\u0435 \u0421\u0432\u0435\u0442\u043a\u043e\u0438\u043d\u0443 / \u0421\u0432\u0435\u0442\u0443 \u0420\u0430');
 return out;
}

function draw(cv){
 var ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
 var st=state(),d=dist(),n=LADDER.length,padT=30,padB=44,rowH=(H-padT-padB)/n,cx=W*0.52,i;
 var srcY=H-padB+20;
 for(i=0;i<n;i++){
  var L=LADDER[i],idx=n-1-i,y=padT+idx*rowH+rowH/2,open=particles()>=L.th,frac=d.frac[L.k]||0,charge=st[L.k]||0;
  var bx0=cx-150,bx1=cx+150,bw=bx1-bx0;
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(bx0,y-9,bw,18);
  var fillw=bw*Math.min(1,Math.sqrt(charge)/14);
  var g=ctx.createLinearGradient(bx0,0,bx1,0);g.addColorStop(0,L.col[0]);g.addColorStop(1,L.col[1]);
  ctx.fillStyle=g;ctx.globalAlpha=open?0.9:0.32;ctx.fillRect(bx0,y-9,fillw,18);ctx.globalAlpha=1;
  ctx.fillStyle=open?'#fff':'#8a7fae';ctx.font='12px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText((open?'':'\ud83d\udd12 ')+L.name,bx0,y-20);
  ctx.fillStyle='#8a7fae';ctx.font='9px monospace';ctx.fillText('['+L.zone+(L.sub?'] '+L.sub:']'),bx0,y+19);
  ctx.fillStyle=open?'#cbb6e8':'#6f6790';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('\u0441\u0432\u0435\u0442 '+charge+' \u00b7 '+r(frac*100)+'%'+(L.th>0?' \u00b7 \u043e\u0442\u043a\u0440 '+L.th:''),bx1,y-20);
 }
 var sg=ctx.createRadialGradient(cx,srcY,0,cx,srcY,40);sg.addColorStop(0,'#ffe9a8');sg.addColorStop(1,'rgba(255,210,122,0.05)');
 ctx.beginPath();ctx.arc(cx,srcY,16+2*Math.sin(anim*0.05),0,Math.PI*2);ctx.fillStyle=sg;ctx.shadowColor='#ffe9a8';ctx.shadowBlur=20;ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#ffd27a';ctx.font='10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('\u0421\u0432\u0435\u0442 \u0438\u0433\u0440\u043e\u043a\u0430 '+light()+' \u00b7 +'+st.player,cx,srcY);
}

function render(){
 var cv=document.getElementById('lgt-cv');if(cv)draw(cv);
 var st=state();
 var rd=document.getElementById('lgt-read');if(rd)rd.innerHTML='\ud83d\udcab \u0427\u0430\u0441\u0442\u0438\u0446\u044b <b>'+st.particles+'</b> \u00b7 \u26a1 \u042d\u041c-\u043f\u043e\u043b\u0435 <b>'+st.emf+'</b> \u00b7 \u043e\u043a\u043e\u043d <b>'+st.open+'/'+LADDER.length+'</b> \u00b7 \ud83e\ude99 \u0421\u0432\u0435\u0442\u043a\u043e\u0438\u043d <b>'+st.svetkoin+'</b>';
 var rs=document.getElementById('lgt-reason');if(rs){var lines=reasoning();rs.innerHTML=lines.map(function(l){return '<div class="trait" style="border:none;padding:3px 0"><span style="max-width:100%">'+l+'</span></div>';}).join('');}
}

function ensureStyle(){
 if(document.getElementById('lgt-style'))return;var st=document.createElement('style');st.id='lgt-style';
 st.textContent=['#lgt-cv{display:block;margin:6px auto;max-width:100%}',
  '#lgt-read{font-family:monospace;font-size:11px;color:#ffd27a;letter-spacing:.04em;margin:6px 0}',
  '#lgt-in{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,210,122,.3);color:#fff;border-radius:10px;padding:8px 10px;font-size:13px;margin:4px 0;resize:vertical;min-height:46px}',
  '#lgt-btns{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}',
  '#lgt-btns .btn{margin:0;flex:0 0 auto;padding:6px 10px;font-size:12px}'].join('');
 document.head.appendChild(st);
}
function ensureModal(){
 if(document.getElementById('lgt-modal'))return;
 var d=document.createElement('div');d.className='libmodal';d.id='lgt-modal';
 d.innerHTML='<div class="libcard awara-glass-card" style="text-align:center;max-width:560px">'+
  '<div class="libel">\u0427\u0430\u0441\u0442\u0438\u0446\u044b \u0441\u0432\u0435\u0442\u0430 \u0442\u0435\u043a\u0443\u0442 \u0447\u0435\u0440\u0435\u0437 \u0422\u0438\u0433\u0435\u043b\u044c \u00b7 \u0441\u0432\u0435\u0442 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0443\u0440\u043e\u0432\u043d\u0438</div>'+
  '<h2 style="margin-top:4px">\u0420\u0430\u0437\u043b\u0438\u0432 \u0421\u0432\u0435\u0442\u0430</h2>'+
  '<canvas id="lgt-cv" width="600" height="680" style="width:100%;max-width:560px"></canvas>'+
  '<div id="lgt-read"></div>'+
  '<textarea id="lgt-in" placeholder="\u0427\u0442\u043e \u0442\u044b \u0432\u043b\u0438\u0432\u0430\u0435\u0448\u044c \u0432 \u0422\u0438\u0433\u0435\u043b\u044c\u2026"></textarea>'+
  '<div id="lgt-btns">'+
   '<button class="btn awara-gold-button" id="lgt-pour">\ud83d\udd06 \u0420\u0430\u0437\u043b\u0438\u0442\u044c \u043f\u043e \u0443\u0440\u043e\u0432\u043d\u044f\u043c</button>'+
   '<button class="btn ghost" id="lgt-game">\u2728 \u0427\u0435\u0440\u0435\u0437 \u0418\u0433\u0440\u0443 \u2192 \u0441\u0432\u0435\u0442 \u0438\u0433\u0440\u043e\u043a\u0430</button>'+
   '<button class="btn ghost" id="lgt-part">\ud83d\udcac \u0427\u0430\u0441\u0442\u0438\u0446\u044b (\u043e\u0431\u0449\u0435\u043d\u0438\u0435)</button>'+
  '</div>'+
  '<div id="lgt-reason" class="card awara-glass-card" style="text-align:left;margin-top:10px"></div>'+
  '<button class="btn ghost" id="lgt-close" style="margin-top:8px">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button></div>';
 document.body.appendChild(d);
 d.onclick=function(e){if(e.target===d)close();};
 document.getElementById('lgt-close').onclick=close;
 document.getElementById('lgt-pour').onclick=function(){var ta=document.getElementById('lgt-in'),txt=ta?ta.value:'',len=(txt||'').length,amt=Math.min(48,10+len/8);pourLight(amt,txt);if(ta)ta.value='';};
 document.getElementById('lgt-game').onclick=function(){fromGame(14);};
 document.getElementById('lgt-part').onclick=function(){addParticles(3);};
 var cb=document.createElement('button');cb.className='btn ghost';cb.textContent='⚙ Калибровка';cb.onclick=openCalib;document.getElementById('lgt-btns').appendChild(cb);
}
function loop(){anim++;var cv=document.getElementById('lgt-cv');if(cv)draw(cv);raf=requestAnimationFrame(loop);}
function open(){ensureStyle();ensureModal();render();document.getElementById('lgt-modal').classList.add('open');if(!raf)loop();}
function close(){var m=document.getElementById('lgt-modal');if(m)m.classList.remove('open');if(raf){cancelAnimationFrame(raf);raf=null;}}

function wrapDoLive(){try{if(typeof window.doLive==='function'&&!window.doLive.__lightWrapped){var _dl=window.doLive;window.doLive=function(){var r2=_dl.apply(this,arguments);setTimeout(function(){try{autoFlow();}catch(e){}},120);return r2;};window.doLive.__lightWrapped=true;}}catch(e){}}
function launcher(txt){var b=document.createElement('button');b.className='btn ghost lgt-launch';b.textContent=txt;b.onclick=open;return b;}
function injectLaunchers(){
 var ids=['s-plan','s-macro','s-result'],i;
 for(i=0;i<ids.length;i++){var sc=document.getElementById(ids[i]);if(sc&&!sc.querySelector('.lgt-launch'))sc.appendChild(launcher('\ud83d\udd06 \u0420\u0430\u0437\u043b\u0438\u0432 \u0421\u0432\u0435\u0442\u0430'));}
}
function boot(){try{decayCheck();}catch(e){}ensureStyle();injectLaunchers();wrapDoLive();setTimeout(function(){injectLaunchers();wrapDoLive();},900);setTimeout(function(){injectLaunchers();wrapDoLive();},1800);setTimeout(function(){injectLaunchers();wrapDoLive();},3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,220);});else setTimeout(boot,220);

function fmtCalibSum(){var sum=0,k;for(k in CALIB.w)sum+=CALIB.w[k];return sum>0?sum:1;}
function ensureCalibStyle(){if(document.getElementById('clb-style'))return;var st=document.createElement('style');st.id='clb-style';st.textContent=['#clb-modal .libcard{max-width:620px;text-align:center}','.clb-row{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12px}','.clb-row label{flex:0 0 150px;color:#cbb6e8;text-align:left}','.clb-row input[type=range]{flex:1}','.clb-row .clb-val{flex:0 0 56px;text-align:right;font-family:monospace;color:#ffd27a}','.clb-desc{font-size:11px;color:#8a7fae;margin-bottom:6px}','.clb-note{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,210,122,.3);color:#fff;border-radius:10px;padding:7px 10px;font-size:12px;margin:8px 0}','.clb-out{display:none;width:100%;box-sizing:border-box;min-height:90px;background:rgba(0,0,0,.3);color:#cbb6e8;border:1px solid rgba(255,255,255,.1);border-radius:8px;font-family:monospace;font-size:10px;margin-top:8px}','#clb-vars{text-align:left;max-height:170px;overflow:auto;margin-top:8px;font-size:11px}','#clb-vars .vrow{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)}','#clb-vars .vrow button{padding:2px 8px;font-size:11px}'].join('');document.head.appendChild(st);}
function calibSliders(){var h='',i,L=LADDER;for(i=0;i<L.length;i++){var k=L[i].k;h+='<div class="clb-row"><label>'+L[i].name+'</label><input type="range" min="0" max="0.4" step="0.005" data-w="'+k+'" value="'+(CALIB.w[k]||0)+'"><span class="clb-val" id="clbv-'+k+'"></span></div>';}h+='<div class="clb-row"><label>Макс. множитель меры</label><input type="range" min="1" max="20" step="0.5" data-knob="meraMax" value="'+(CALIB.meraMax||10)+'"><span class="clb-val" id="clbv-meraMax"></span></div>';h+='<div class="clb-row"><label>Горение в день</label><input type="range" min="0" max="0.2" step="0.005" data-knob="burnBase" value="'+(CALIB.burnBase||0.06)+'"><span class="clb-val" id="clbv-burnBase"></span></div>';h+='<div class="clb-row"><label>Подъём (lift)</label><input type="range" min="0" max="2" step="0.05" data-knob="lift" value="'+(CALIB.lift||1)+'"><span class="clb-val" id="clbv-lift"></span></div>';return h;}
function calibValsUpdate(){var sum=fmtCalibSum(),i,L=LADDER;for(i=0;i<L.length;i++){var k=L[i].k,el=document.getElementById('clbv-'+k);if(el)el.textContent=r((CALIB.w[k]/sum)*100)+'%';}var a=document.getElementById('clbv-meraMax');if(a)a.textContent='×'+(CALIB.meraMax||10);var b=document.getElementById('clbv-burnBase');if(b)b.textContent=r((CALIB.burnBase||0.06)*100)+'%';var c=document.getElementById('clbv-lift');if(c)c.textContent=(CALIB.lift||1).toFixed(2);}
function calibVarsRender(){var box=document.getElementById('clb-vars');if(!box)return;var a=listVariants();if(!a.length){box.innerHTML='<div style="color:#8a7fae">Пока нет сохранённых вариантов</div>';return;}box.innerHTML=a.slice(0,40).map(function(v){return '<div class="vrow"><span>'+v.date+' · '+(v.note||'без заметки')+' · ч'+v.snap.particles+' м'+v.snap.mera+' ×'+v.snap.meraMul+'</span><button class="btn ghost" data-apply="'+v.id+'">Применить</button></div>';}).join('');}
function calibRefill(){var box=document.getElementById('clb-sliders');if(box)box.innerHTML=calibSliders();calibValsUpdate();calibVarsRender();}
function ensureCalibModal(){if(document.getElementById('clb-modal'))return;var d=document.createElement('div');d.className='libmodal';d.id='clb-modal';d.innerHTML='<div class="libcard awara-glass-card"><div class="libel">Тест-режим · калибровка распределения света</div><h2 style="margin-top:4px">Калибровка</h2><div class="clb-desc">Крути веса 9 окон, кривую меры и горение. Сохраняй варианты — копится опора для будущего. % справа — доля окна от целого.</div><div id="clb-sliders"></div><input id="clb-note" class="clb-note" placeholder="Заметка к варианту — что меняли и зачем"><div id="lgt-btns"><button class="btn awara-gold-button" id="clb-save">Сохранить вариант</button><button class="btn ghost" id="clb-reset">Сбросить</button><button class="btn ghost" id="clb-export">Экспорт</button></div><div id="clb-vars"></div><textarea id="clb-out" class="clb-out"></textarea><button class="btn ghost" id="clb-close" style="margin-top:8px">Закрыть</button></div>';document.body.appendChild(d);d.onclick=function(e){if(e.target===d)closeCalib();};document.getElementById('clb-close').onclick=closeCalib;document.getElementById('clb-save').onclick=function(){var n=document.getElementById('clb-note');saveVariant(n?n.value:'');if(n)n.value='';calibVarsRender();if(typeof showToast==='function')showToast('Вариант сохранён');};document.getElementById('clb-reset').onclick=function(){resetCalib();calibRefill();render();};document.getElementById('clb-export').onclick=function(){var o=document.getElementById('clb-out');if(o){o.style.display='block';o.value=exportCalib();o.focus();o.select();}};d.addEventListener('input',function(e){var t=e.target;if(t&&t.dataset){if(t.dataset.w){setW(t.dataset.w,parseFloat(t.value));calibValsUpdate();render();}else if(t.dataset.knob){setKnob(t.dataset.knob,parseFloat(t.value));calibValsUpdate();render();}}});d.addEventListener('click',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.apply){applyVariant(t.dataset.apply);calibRefill();render();if(typeof showToast==='function')showToast('Вариант применён');}});}
function openCalib(){ensureStyle();ensureCalibStyle();ensureCalibModal();calibRefill();document.getElementById('clb-modal').classList.add('open');}
function closeCalib(){var m=document.getElementById('clb-modal');if(m)m.classList.remove('open');}
window.AwaraLight={open:open,close:close,render:render,pour:pourLight,fromGame:fromGame,addParticles:addParticles,botInfluence:botInfluence,autoFlow:autoFlow,dist:dist,reasoning:reasoning,state:state,brief:brief,particles:particles,emf:emf,canCustomize:canCustomize,ladder:function(){return LADDER;},meraMul:meraMul,meraNow:meraNow,setMera:setMera,matrixYield:matrixYield,decay:decayCheck,openCalib:openCalib,calib:function(){return CALIB;},setW:setW,setKnob:setKnob,resetCalib:resetCalib,saveVariant:saveVariant,listVariants:listVariants,applyVariant:applyVariant,exportCalib:exportCalib,brainHook:null,__ready:true,__v:4};
})();