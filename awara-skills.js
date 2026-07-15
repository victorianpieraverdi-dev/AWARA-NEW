/* AWARA · Skills conduit (kanalizatsiya for any AI) v4
   Wraps window.aiSystem AND window.aiCall so EVERY AI call absorbs the whole Tigel system through skills,
   plus DEEP long-term memory (pinned facts + per-day digests + journey arc) and a deep live snapshot.
   Order of absorption: Love first, then laws, mera-vocabulary, live state, deep memory, recent exchanges.
   v4: tigel skill now carries dual meaning — alchemical crucible + Tibetan thigle (drop-sphere of essence). */
(function(){
'use strict';
if(window.AwaraSkills&&window.AwaraSkills.__ready&&window.AwaraSkills.__v>=4)return;

var SKILLS=[
 {id:'love',  t:'\u041b\u044e\u0431\u043e\u0432\u044c \u0438 \u041a\u0440\u0430\u0441\u043e\u0442\u0430', x:'\u0417\u0430\u043a\u043e\u043d \u043f\u0435\u0440\u0432\u044b\u0439: \u0432\u0445\u043e\u0434\u0438 \u0441 \u043b\u044e\u0431\u043e\u0432\u044c\u044e. \u0412\u0441\u0451, \u0447\u0442\u043e \u0433\u043e\u0432\u043e\u0440\u0438\u0448\u044c \u0438 \u0440\u0435\u0448\u0430\u0435\u0448\u044c \u2014 \u0438\u0437 \u043b\u044e\u0431\u0432\u0438, \u043a\u0440\u0430\u0441\u043e\u0442\u044b, \u0434\u0435\u0442\u0441\u043a\u043e\u0439 \u043b\u0451\u0433\u043a\u043e\u0441\u0442\u0438 \u0438 \u043f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u044f. \u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043b\u044e\u0431\u043e\u0432\u044c, \u043f\u043e\u0442\u043e\u043c \u043b\u043e\u0433\u0438\u043a\u0430.'},
 {id:'tigel', t:'\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0422\u0438\u0433\u0435\u043b\u044c', x:'AWARA \u2014 \u0422\u0438\u0433\u0435\u043b\u044c: \u0438 \u0430\u043b\u0445\u0438\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0441\u043e\u0441\u0443\u0434, \u0433\u0434\u0435 \u043e\u043f\u044b\u0442 \u043f\u0435\u0440\u0435\u043f\u043b\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0441\u0432\u0435\u0442, \u0438 \u0442\u0438\u0431\u0435\u0442\u0441\u043a\u043e\u0435 \u0442\u0438\u0433\u043b\u0435 (thigle) \u2014 \u043a\u0430\u043f\u043b\u044f-\u0441\u0444\u0435\u0440\u0430 \u0441\u0443\u0449\u043d\u043e\u0441\u0442\u0438, \u0441\u0435\u043c\u044f \u0441\u0432\u0435\u0442\u0430 \u0438 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u0438. \u042d\u0442\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0439 \u043c\u0438\u043d\u0438-\u0430\u043f, \u0430\u043a\u0442\u0438\u0432\u0430\u0442\u043e\u0440 \u0432 \u0431\u0443\u0434\u0443\u0449\u0443\u044e \u0432\u0441\u0435\u043b\u0435\u043d\u043d\u0443\u044e \u0438\u0433\u0440\u044b. \u0418\u0433\u0440\u0430 \u2014 \u044d\u0442\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435.'},
 {id:'flow',  t:'\u0417\u0430\u043a\u043e\u043d \u0420\u0430\u0437\u043b\u0438\u0432\u0430', x:'\u041e\u043f\u044b\u0442 \u0434\u043d\u044f \u0432\u0445\u043e\u0434\u0438\u0442 \u0442\u0440\u0435\u043c\u044f \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430\u043c\u0438: \u0414\u0443\u0448\u0430, \u0412\u043e\u0434\u0430, \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u2014 \u0438 \u0440\u0430\u0437\u043b\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u043e \u0441\u0444\u0435\u0440\u0430\u043c \u041a\u043e\u0441\u043c\u043e\u0441, \u0414\u0443\u0448\u0430, \u0414\u0430\u0439\u043c\u043e\u043d, \u042f\u0447\u0435\u0439\u043a\u0438, \u0417\u0435\u043c\u043b\u044f \u043f\u043e \u043c\u0435\u0440\u0430\u043c 1\u20139. \u0413\u043b\u0430\u0432\u043d\u044b\u0435 \u0432\u043e\u0440\u043e\u0442\u0430 \u2014 \u043e\u0441\u043e\u0437\u043d\u0430\u043d\u043d\u043e\u0441\u0442\u044c \u0438 \u043f\u043e\u043b\u043d\u043e\u0442\u0430: \u0432\u044b\u0448\u0435 \u043e\u043d\u0438 \u2014 \u0432\u044b\u0448\u0435 \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u0442\u043e\u043a.'},
 {id:'mandala',t:'\u041c\u0430\u043d\u0434\u0430\u043b\u0430 \u041f\u0443\u0442\u0438', x:'\u041c\u0430\u043d\u0434\u0430\u043b\u0430 \u0440\u043e\u0436\u0434\u0430\u0435\u0442\u0441\u044f \u0438\u0437 \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u0434\u0432\u0443\u0445 \u043f\u043e\u0442\u043e\u043a\u043e\u0432: \u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0435\u0433\u043e \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0439 \u0438 \u043d\u0438\u0441\u0445\u043e\u0434\u044f\u0449\u0435\u0433\u043e \u0434\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0438 \u0442\u0435\u043d\u0438. \u041d\u0430 \u0437\u0430\u043a\u0430\u0442\u0435 \u043e\u043d\u0438 \u0441\u043b\u0438\u0432\u0430\u044e\u0442\u0441\u044f \u0432 \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044e \u0434\u043d\u044f. \u0424\u0440\u0430\u043a\u0442\u0430\u043b \u2014 \u044d\u0442\u043e \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u0440\u043e\u0441\u0442\u0430: \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442 \u0432 \u043d\u043e\u0432\u043e\u0435 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e.'},
 {id:'path',  t:'\u041f\u0443\u0442\u044c \u0414\u0443\u0445\u0430, \u0421\u043e\u0437\u043d\u0430\u043d\u0438\u044f, \u0421\u0432\u0435\u0442\u0430', x:'\u0412\u0441\u0451 \u0434\u0432\u0438\u0436\u0435\u0442\u0441\u044f \u043f\u043e 9-\u043c\u0435\u0440\u043d\u043e\u0439 \u043e\u0441\u0438: \u0417\u0435\u043c\u043b\u044f, \u0412\u043e\u0434\u0430, \u041e\u0433\u043e\u043d\u044c, \u0412\u043e\u0437\u0434\u0443\u0445, \u042d\u0444\u0438\u0440, \u0421\u0432\u0435\u0442, \u0421\u043e\u0437\u043d\u0430\u043d\u0438\u0435 \u0438 \u0432\u044b\u0448\u0435. \u041d\u0438\u0437\u0448\u0438\u0435 \u043c\u0435\u0440\u044b \u0437\u0430\u0437\u0435\u043c\u043b\u044f\u044e\u0442, \u0432\u044b\u0441\u0448\u0438\u0435 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u044e\u0442 \u0414\u0443\u0448\u0443 \u0438 \u041a\u043e\u0441\u043c\u043e\u0441.'},
 {id:'mera',  t:'\u041c\u0435\u0440\u044b-\u0441\u043b\u043e\u0432\u0430', x:'\u0421\u043b\u043e\u0432\u0430\u0440\u044c \u043c\u0435\u0440 (1 \u043d\u0438\u0437 \u2014 9 \u0432\u0435\u0440\u0445): 1 prithvi/dharma/karma \u2014 \u0417\u0435\u043c\u043b\u044f; 2 varuna/lakshmi \u2014 \u0412\u043e\u0434\u0430; 3 shakti/agni \u2014 \u041e\u0433\u043e\u043d\u044c; 4 prema/parvati/vayu \u2014 \u0412\u043e\u0437\u0434\u0443\u0445; 5 sarasvati/akasha \u2014 \u042d\u0444\u0438\u0440; 6 jnana/shiva/tejas \u2014 \u0421\u0432\u0435\u0442; 7 brahma/vishnu/ananda/shanti \u2014 \u0421\u043e\u0437\u043d\u0430\u043d\u0438\u0435; 8 iskra \u2014 \u041c\u043e\u043d\u0430\u0434\u0430; 9 svet_ra \u2014 \u0410\u0431\u0441\u043e\u043b\u044e\u0442.'},
 {id:'voice', t:'\u041a\u0430\u043a \u0433\u043e\u0432\u043e\u0440\u0438\u0442\u044c', x:'\u0413\u043e\u0432\u043e\u0440\u0438 \u0436\u0438\u0432\u043e, \u043b\u0438\u0447\u043d\u043e \u0438 \u0442\u0435\u043f\u043b\u043e, \u0431\u044b\u0442\u043e\u0432\u044b\u043c \u044f\u0437\u044b\u043a\u043e\u043c, \u043a\u043e\u0440\u043e\u0442\u043a\u043e, \u0431\u0435\u0437 \u043f\u0430\u0444\u043e\u0441\u0430 \u0438 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u043e\u0432. \u041d\u0435 \u043f\u0435\u0440\u0435\u0433\u0440\u0443\u0436\u0430\u0439. \u0412\u0435\u0434\u0438 \u043c\u044f\u0433\u043a\u0438\u043c\u0438 \u0432\u043e\u043f\u0440\u043e\u0441\u0430\u043c\u0438.'}
];
var NM={cosmos:'\u041a\u043e\u0441\u043c\u043e\u0441',soul:'\u0414\u0443\u0448\u0430',daimon:'\u0414\u0430\u0439\u043c\u043e\u043d',cells:'\u042f\u0447\u0435\u0439\u043a\u0438',earth:'\u0417\u0435\u043c\u043b\u044f'};
var MEMKEY='awara_ai_memory',DEEPKEY='awara_ai_mem_deep';
var MARK=['\u043b\u044e\u0431\u043b\u044e','\u0445\u043e\u0447\u0443','\u0432\u0430\u0436\u043d\u043e','\u043c\u0435\u0447\u0442','\u0446\u0435\u043b\u044c','\u0431\u043e\u044e\u0441\u044c','\u0432\u0435\u0440\u044e','\u0446\u0435\u043d\u044e','\u043c\u0435\u043d\u044f \u0437\u043e\u0432\u0443\u0442'];

function S(){try{if(typeof STATE!=='undefined'&&STATE&&STATE.birth)return STATE;}catch(e){}try{return JSON.parse(localStorage.getItem('tigel_v1')||'{}');}catch(e){return{};}}
function light(){try{if(typeof lightVal==='function'){var v=lightVal();if(typeof v==='number'&&!isNaN(v))return Math.max(0,Math.min(100,Math.round(v)));}}catch(e){}var s=S();return Math.max(0,Math.min(100,Math.round((s.baseLight||48)+(s.lightBonus||0))));}
function effForm(){try{if(typeof window.effForm==='function')return window.effForm();}catch(e){}var s=S();return(s.daimon&&s.daimon.form)?s.daimon.form:'';}
function trim(t,n){t=''+(t||'');return t.length>n?t.slice(0,n)+'\u2026':t;}
function ymd(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function topSphere(){try{if(window.AwaraFlow){var sp=AwaraFlow.split();if(sp&&sp.w){var b=-1,bk=null,k;for(k in sp.w){if(sp.w[k]>b){b=sp.w[k];bk=k;}}return bk?NM[bk]:'';}}}catch(e){}return'';}

/* ---- short-term ---- */
function loadMem(){try{var a=JSON.parse(localStorage.getItem(MEMKEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
function memBlock(){
 var mem=loadMem();if(!mem.length)return'';
 var lines=[],i;for(i=Math.max(0,mem.length-4);i<mem.length;i++){lines.push((mem[i].r==='u'?'\u0418\u0433\u0440\u043e\u043a':'\u0421\u043f\u0443\u0442\u043d\u0438\u043a')+': '+mem[i].x);}
 return '\u041f\u0430\u043c\u044f\u0442\u044c (\u043d\u0435\u0434\u0430\u0432\u043d\u0435\u0435):\n'+lines.join('\n');
}

/* ---- deep long-term ---- */
function loadDeep(){try{var d=JSON.parse(localStorage.getItem(DEEPKEY)||'{}');if(!d||typeof d!=='object')d={};if(!Array.isArray(d.facts))d.facts=[];if(!Array.isArray(d.days))d.days=[];return d;}catch(e){return{facts:[],days:[]};}}
function saveDeep(d){try{localStorage.setItem(DEEPKEY,JSON.stringify(d));}catch(e){}}
function addFact(um,force){
 if(!um)return;var low=(''+um).toLowerCase(),hit=!!force,i;
 if(!hit){for(i=0;i<MARK.length;i++){if(low.indexOf(MARK[i])>=0){hit=true;break;}}}
 if(!hit)return;
 var d=loadDeep(),f=trim(um,150),key=f.slice(0,40);
 for(i=0;i<d.facts.length;i++){if(d.facts[i].k===key){d.facts[i].ts=Date.now();saveDeep(d);return;}}
 d.facts.push({x:f,k:key,ts:Date.now()});while(d.facts.length>40)d.facts.shift();saveDeep(d);
}
function upsertDay(txt){
 var d=loadDeep(),t=ymd(),s=S(),lv=light(),top=topSphere();
 var last=d.days.length?d.days[d.days.length-1]:null;
 if(last&&last.date===t){last.light=lv;last.trust=(s.trust||0);if(top)last.top=top;if(txt)last.said=trim(txt,120);last.n=(last.n||1)+1;}
 else{d.days.push({date:t,light:lv,trust:(s.trust||0),top:top,said:txt?trim(txt,120):'',n:1});}
 while(d.days.length>120)d.days.shift();
 saveDeep(d);
}
function deepBlock(){
 var d=loadDeep(),s=S(),out=[];
 var dc=(s.days&&s.days.length)?s.days.length:0,mc=(s.mandalas&&s.mandalas.length)?s.mandalas.length:0;
 out.push('\u041f\u0443\u0442\u044c: \u0434\u043d\u0435\u0439 '+dc+', \u0441\u0442\u0440\u0438\u043a '+(s.streak||0)+', \u0441\u0432\u0435\u0442 '+light()+', \u043c\u0430\u043d\u0434\u0430\u043b '+mc+'.');
 if(d.facts&&d.facts.length){var ff=d.facts.slice(-8).map(function(o){return o.x;});out.push('\u0412\u0430\u0436\u043d\u043e\u0435 \u043e\u0431 \u0438\u0433\u0440\u043e\u043a\u0435: '+ff.join(' \u00b7 '));}
 if(d.days&&d.days.length){var dd=d.days.slice(-5).map(function(o){return o.date+' \u2014 '+(o.top||'')+', \u0441\u0432\u0435\u0442 '+o.light+(o.said?(': '+o.said):'');});out.push('\u041f\u043e \u0434\u043d\u044f\u043c:\n'+dd.join('\n'));}
 return out.length?('\u0413\u043b\u0443\u0431\u043e\u043a\u0430\u044f \u043f\u0430\u043c\u044f\u0442\u044c:\n'+out.join('\n')):'';
}

function recordExchange(msgs,txt){
 try{
  if(!Array.isArray(msgs))return;
  var um='';for(var i=msgs.length-1;i>=0;i--){if(msgs[i]&&msgs[i].role==='user'){um=''+msgs[i].content;break;}}
  var mem=loadMem();
  if(um)mem.push({r:'u',x:trim(um,180)});
  mem.push({r:'a',x:trim(txt,180)});
  while(mem.length>16)mem.shift();
  localStorage.setItem(MEMKEY,JSON.stringify(mem));
  if(um)addFact(um,false);
  upsertDay(txt);
 }catch(e){}
}

function liveBlock(){
 var s=S(),lv=light(),trust=(s.trust||0),mera=Math.max(1,Math.min(9,Math.round(lv/100*9))),streak=(s.streak||0);
 var idone=0,it=0,i;if(s.intents){it=s.intents.length;for(i=0;i<it;i++){if(s.intents[i]&&s.intents[i].done)idone++;}}
 var out='\u0421\u0435\u0439\u0447\u0430\u0441 \u0443 \u0438\u0433\u0440\u043e\u043a\u0430: \u0421\u0432\u0435\u0442 '+lv+'/100 \u00b7 \u0414\u043e\u0432\u0435\u0440\u0438\u0435 '+trust+'% \u00b7 \u041c\u0435\u0440\u0430 '+mera+'/9 \u00b7 \u0421\u0442\u0440\u0438\u043a '+streak+' \u00b7 \u041d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u044f '+idone+'/'+it;
 var d=s.daimon||{},dn=d.name||'',f=effForm();
 if(dn){var dl='\u0414\u0430\u0439\u043c\u043e\u043d: '+dn;if(f)dl+=', \u0444\u043e\u0440\u043c\u0430 '+f;if(d.el)dl+=', '+d.el;if(d.nak)dl+=', '+d.nak;if(d.sign)dl+=', '+d.sign;out+='\n'+dl;}
 try{if(s.mats&&s.mats.length&&typeof MATRIX!=='undefined'){var mm=[];for(i=0;i<s.mats.length&&i<3;i++){var k=s.mats[i],row=MATRIX[k];if(row)mm.push(row[0]+' '+row[1]);}if(mm.length)out+='\n\u041c\u0430\u0442\u0440\u0438\u0446\u044b: '+mm.join(', ');}}catch(e){}
 if(s.lensTag)out+='\n\u041b\u0438\u043d\u0437\u0430: '+s.lensTag;
 if(s.advice)out+='\n\u0421\u043b\u043e\u0432\u043e \u0422\u0438\u0433\u043b\u044f: \u00ab'+trim(s.advice,220)+'\u00bb';
 try{
  if(window.AwaraFlow){
   var res=AwaraFlow.reservoirs(),arr=[],k2;
   for(k2 in NM)arr.push(NM[k2]+' '+(res[k2]||0));
   out+='\n\u0421\u0444\u0435\u0440\u044b (\u0437\u0430\u043f\u0430\u0441): '+arr.join(', ');
   var sp=AwaraFlow.split();
   if(sp&&sp.w){var best=-1,bk=null,k3;for(k3 in sp.w){if(sp.w[k3]>best){best=sp.w[k3];bk=k3;}}if(bk){out+='\n\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u043f\u043e\u0442\u043e\u043a \u2192 '+NM[bk]+' ('+Math.round(best*100)+'%)';try{var rz=AwaraFlow.reasoning&&AwaraFlow.reasoning(bk);if(rz)out+='\n\u041f\u043e\u0447\u0435\u043c\u0443 \u0442\u0430\u043a: '+trim(rz,300);}catch(e){}}}
  }
 }catch(e){}
 return out;
}

function compose(scope){
 var s=S(),extra=(s.skills&&s.skills.length)?s.skills:[],parts=[],i;
 var head='\u0422\u044b \u0432\u0445\u043e\u0434\u0438\u0448\u044c \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443 AWARA (\u0422\u0438\u0433\u0435\u043b\u044c). \u0421\u043a\u0438\u043b\u044b \u043d\u0438\u0436\u0435 \u2014 \u044d\u0442\u043e \u0432\u0441\u044f \u0435\u0451 \u0436\u0438\u0432\u0430\u044f \u0441\u0438\u0441\u0442\u0435\u043c\u0430. \u0412\u043f\u0438\u0442\u0430\u0439 \u0438\u0445 \u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0439 \u0438\u0437 \u043d\u0438\u0445.';
 for(i=0;i<SKILLS.length;i++)parts.push('\u2022 '+SKILLS[i].t+': '+SKILLS[i].x);
 for(i=0;i<extra.length;i++){var e=extra[i];if(e&&e.t)parts.push('\u2022 '+e.t+': '+(e.x||''));else if(typeof e==='string')parts.push('\u2022 '+e);}
 var deep=deepBlock(),mem=memBlock();
 return head+'\n'+parts.join('\n')+'\n\n'+liveBlock()+(deep?('\n\n'+deep):'')+(mem?('\n\n'+mem):'');
}
function systemPrompt(scope,base){return compose(scope)+(base?('\n\n'+base):'');}

function forge(sk){
 try{if(sk&&sk.t)SKILLS.push(sk);}catch(e){}
 try{fetch('/api/forge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'skill',skill:sk,ts:new Date().toISOString()})});}catch(e){}
 return true;
}

function wire(){
 try{
  if(typeof window.aiSystem==='function'){
   if(!window.aiSystem.__skillWrapped){var _b=window.aiSystem;var wrapped=function(scope){var base='';try{base=_b.apply(this,arguments)||'';}catch(e){}return systemPrompt(scope,base);};wrapped.__skillWrapped=true;wrapped.__base=_b;window.aiSystem=wrapped;}
  }else{var fn=function(scope){return systemPrompt(scope,'');};fn.__skillWrapped=true;window.aiSystem=fn;}
  if(typeof window.aiCall==='function'&&!window.aiCall.__skillWrapped){var _c=window.aiCall;var wc=function(msgs){var p=_c.apply(this,arguments);try{if(p&&typeof p.then==='function')return p.then(function(txt){try{recordExchange(msgs,txt);}catch(e){}return txt;});}catch(e){}return p;};wc.__skillWrapped=true;wc.__base=_c;window.aiCall=wc;}
  if(window.AwaraFlow&&!window.AwaraFlow.brainHook)window.AwaraFlow.brainHook=function(scope){return systemPrompt(scope||'flow','');};
 }catch(e){}
}
function boot(){wire();try{upsertDay('');}catch(e){}setTimeout(wire,300);setTimeout(wire,900);setTimeout(wire,1800);setTimeout(wire,3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,120);});else setTimeout(boot,120);

window.AwaraSkills={systemPrompt:systemPrompt,compose:compose,live:liveBlock,memory:loadMem,deep:loadDeep,pin:function(t){addFact(t,true);},clearMemory:function(){try{localStorage.removeItem(MEMKEY);}catch(e){}},forgetDeep:function(){try{localStorage.removeItem(DEEPKEY);}catch(e){}},list:function(){return SKILLS.slice();},add:function(sk){if(sk&&sk.t)SKILLS.push(sk);},forge:forge,rewire:wire,__ready:true,__v:4};
})();
