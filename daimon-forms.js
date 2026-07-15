/* AWARA · Формы Даймона — выбор 3–5 форм из натальной карты + живое имя Даймона повсюду.
   Доп. слой: не трогает движок, переопределяет effForm/aiFormDirective/aiMode/aiSystem/toggleDaimonForm и обновляет подписи имени. */
(function(){
'use strict';
if(window.AwaraForms&&window.AwaraForms.__ready)return;
var AX='awara_form_axis';
function $(id){return document.getElementById(id);}
function S(){return (typeof STATE!=='undefined'&&STATE)?STATE:window.STATE;}
function sgn(v){return (typeof signOf==='function')?signOf(v):'';}
function elOf(s){return (typeof elementOf==='function')?elementOf(s):'Эфир';}
var GL={'Гроза':'🐉','Огонь':'🔥','Вода':'🌊','Земля':'🪨','Воздух':'🌬','Эфир':'✨','Рассвет':'🌅'};
var SARCH={'Овен':'Воитель','Телец':'Хранитель','Близнецы':'Вестник','Рак':'Страж очага','Лев':'Венценосец','Дева':'Зодчий','Весы':'Гармонизатор','Скорпион':'Преобразитель','Стрелец':'Странник','Козерог':'Восходящий','Водолей':'Провидец','Рыбы':'Мистик'};

function styleOnce(){
 if($('df-style'))return;
 var st=document.createElement('style');st.id='df-style';
 st.textContent=".df-grid{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.df-chip{flex:1 1 28%;min-width:92px;padding:14px 8px;cursor:pointer;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.025);color:var(--text);display:flex;flex-direction:column;align-items:center;gap:8px;transition:.25s}.df-chip:hover{border-color:var(--lens,#9d86e0);background:rgba(255,255,255,.055)}.df-chip.on{border-color:var(--lens,#c9a84c);background:rgba(201,168,76,.10);box-shadow:0 0 0 1px var(--lens,#c9a84c),0 10px 24px -12px var(--lens,#c9a84c)}.df-chip,.df-chip .df-n{text-align:center}.df-chip .df-g{font-size:23px;line-height:1}.df-chip.on .df-g{filter:drop-shadow(0 0 8px var(--lens,#c9a84c))}.df-chip .df-n{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);line-height:1.3}.df-chip.on .df-n{color:var(--spark)}";
 document.head.appendChild(st);
}

function getForms(){
 var n=S()&&S().natal,d=S()&&S().daimon;if(!n||!d)return [];
 var lag=sgn(n.bodies['Лагна']),sun=sgn(n.bodies['Солнце']);
 var out=[];var dEl=d.el;
 out.push({axis:'moon',short:'Первозданный',glyph:GL[dEl]||'🐉',beast:true,quote:'«Я — '+d.name+', зверь, рождённый из '+d.nak+'. Под бурей я истинен.»',tag:'Первозданная форма — из накшатры Луны '+d.nak+' (стихия '+dEl+'). Голос древний и мощный.',voice:'Ты в первородной форме — Зверь из накшатры '+d.nak+' (стихия '+dEl+'). Говори древне, мощно, образами бури, охоты и защиты.'});
 var lagEl=elOf(lag);
 out.push({axis:'lik',short:'Лик · '+(SARCH[lag]||'Спутник'),glyph:GL[lagEl]||'✨',beast:false,quote:'«В облике Лика я — '+(SARCH[lag]||'твой спутник')+', мягкий голос Лагны в '+lag+'.»',tag:'Лик — проявленная форма от Лагны в '+lag+' ('+lagEl+'). Архетип: '+(SARCH[lag]||'Спутник')+'.',voice:'Ты в форме Лика — '+(SARCH[lag]||'мудрый спутник')+', окрашенный Лагной в '+lag+' (стихия '+lagEl+'). Говори мягко, изящно, тепло.'});
 var sunEl=elOf(sun);
 out.push({axis:'sun',short:'Солнечный · '+(SARCH[sun]||'Свет'),glyph:'🌅',beast:false,quote:'«Я — солнечный '+(SARCH[sun]||'свет')+' твоего Солнца в '+sun+'. Со мной ты сияешь волей.»',tag:'Солнечная форма — от Солнца в '+sun+' ('+sunEl+'). Воля и сияние.',voice:'Ты в солнечной форме от Солнца в '+sun+' (стихия '+sunEl+'). Говори ярко, вдохновляюще, с достоинством.'});
 var cnt={'Огонь':0,'Земля':0,'Воздух':0,'Вода':0};
 ['Лагна','Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн'].forEach(function(p){if(n.bodies[p]!=null){var e=elOf(sgn(n.bodies[p]));if(cnt[e]!=null)cnt[e]++;}});
 var domEl='Огонь',mx=-1;Object.keys(cnt).forEach(function(k){if(cnt[k]>mx){mx=cnt[k];domEl=k;}});
 out.push({axis:'dom',short:'Страж · '+domEl,glyph:GL[domEl]||'✨',beast:false,quote:'«Я — Страж стихии '+domEl+', той, что правит твоей картой.»',tag:'Доминанта карты — стихия '+domEl+' ('+mx+' из 8 точек). Форма-страж.',voice:'Ты — Страж преобладающей стихии '+domEl+'. Воплощай её природу в речи и советах.'});
 var dosha=(typeof doshaOf==='function')?doshaOf(lagEl):'';
 var DN={'Питта':'Пламенный','Капха':'Незыблемый','Вата':'Ветреный'};
 var dnm=DN[dosha]||dosha||'Уравновешенный';
 var dv=(dosha.indexOf('Питта')>=0)?'Говори страстно и прямо, учи остужать жар.':(dosha.indexOf('Вата')>=0)?'Говори лёгкими образами, учи заземляться и держать ритм.':'Говори устойчиво и основательно, призывай к движению.';
 out.push({axis:'dosha',short:dnm,glyph:GL[lagEl]||'✨',beast:false,quote:'«Мой нрав — '+dosha+'. Я отражаю твой телесный огонь и ритм.»',tag:'Темперамент по доше Лагны: '+dosha+'.',voice:'Ты — '+dnm+' (доша '+dosha+'). '+dv});
 var seen={},res=[];out.forEach(function(f){if(!seen[f.short]){seen[f.short]=1;res.push(f);}});
 return res.slice(0,5);
}

function activeAxis(){try{var a=localStorage.getItem(AX);if(a)return a;}catch(e){}return 'moon';}
function active(){var fs=getForms();var a=activeAxis();for(var i=0;i<fs.length;i++){if(fs[i].axis===a)return fs[i];}return fs[0]||null;}

var _origAiSystem=window.aiSystem;
window.aiSystem=function(role){var nm=(S()&&S().daimon&&S().daimon.name)?('Даймон '+S().daimon.name):null;try{return _origAiSystem(role||nm||undefined);}catch(e){return (typeof _origAiSystem==='function')?_origAiSystem(role):'';}};
window.aiFormDirective=function(){var f=active();try{if(window.FORM_OVERRIDE==='beast'){var fs=getForms();for(var i=0;i<fs.length;i++){if(fs[i].axis==='moon'){f=fs[i];break;}}}}catch(e){}if(!f)return '';return '\n\n=== ФОРМА СЕЙЧАС: '+String(f.short).toUpperCase()+' ===\n'+f.voice;};
window.effForm=function(){try{if(window.FORM_OVERRIDE)return window.FORM_OVERRIDE;}catch(e){}var f=active();return (f&&f.beast)?'beast':'lik';};
window.toggleDaimonForm=function(){var fs=getForms();if(!fs.length)return;var a=activeAxis(),idx=0;for(var i=0;i<fs.length;i++){if(fs[i].axis===a){idx=i;break;}}setAxis(fs[(idx+1)%fs.length].axis);};
window.aiMode=function(){try{var c=(typeof aiCfg==='function')?aiCfg():{};var b=$('aiModeTag');var f=active();if(b){var live=(c.key||(c.base&&String(c.base).indexOf('8787')>=0));b.textContent=(live?'● живой':'○ промты')+' · '+(f?f.short:'Лик')+' ⇄';b.style.cursor='pointer';b.title='Сменить форму Даймона (по очереди)';b.onclick=window.toggleDaimonForm;}updateLabels();}catch(e){}};

function updateLabels(){
 var d=S()&&S().daimon;if(!d)return;var nm=d.name||'Даймон';
 try{var nav=document.querySelector('.nav button[data-nav=\"daimon\"]');if(nav){nav.innerHTML='<span class=\"ic\">🐉</span>'+nm;}}catch(e){}
 try{var lib=document.querySelector('#aiModal .libcard');var hdr=lib?lib.querySelector('div > span'):null;if(hdr&&hdr.id!=='aiModeTag'){hdr.textContent='🤖 Даймон '+nm;}}catch(e){}
}

function setAxis(ax){try{localStorage.setItem(AX,ax);}catch(e){}applyForm();var f=active();if(typeof showToast==='function'&&f)showToast('Форма: '+f.short);}

function renderForms(){
 var s=$('s-daimon');if(!s)return;var fs=getForms();if(!fs.length)return;styleOnce();
 var card=$('df-card');
 if(!card){card=document.createElement('div');card.id='df-card';card.className='card awara-glass-card';var hero=s.querySelector('.dm-hero');if(hero&&hero.nextSibling){s.insertBefore(card,hero.nextSibling);}else if(hero){s.appendChild(card);}else{s.insertBefore(card,s.firstChild);}}
 var a=activeAxis();var chips='';
 for(var i=0;i<fs.length;i++){var f=fs[i];chips+='<button class=\"df-chip'+(f.axis===a?' on':'')+'\" data-axis=\"'+f.axis+'\"><span class=\"df-g\">'+f.glyph+'</span><span class=\"df-n\">'+f.short+'</span></button>';}
 var af=active();
 card.innerHTML='<span class=\"label\">Формы Даймона · из натальной карты</span><div class=\"df-grid\">'+chips+'</div><p class=\"adv\" style=\"font-size:15px;margin-top:11px\">'+(af?af.tag:'')+'</p>';
 var b=card.querySelectorAll('.df-chip');for(var j=0;j<b.length;j++){b[j].onclick=function(){setAxis(this.getAttribute('data-axis'));};}
 renderQual(s);
}

function renderQual(s){
 var n=S()&&S().natal;if(!n)return;
 var card=$('df-qual');if(!card){card=document.createElement('div');card.id='df-qual';card.className='card awara-glass-card';var ref=$('df-card');if(ref&&ref.nextSibling){s.insertBefore(card,ref.nextSibling);}else{s.appendChild(card);}}
 var lag=sgn(n.bodies['Лагна']),lagEl=elOf(lag);
 var cnt={'Огонь':0,'Земля':0,'Воздух':0,'Вода':0};['Лагна','Солнце','Луна','Меркурий','Венера','Марс','Юпитер','Сатурн'].forEach(function(p){if(n.bodies[p]!=null){var e=elOf(sgn(n.bodies[p]));if(cnt[e]!=null)cnt[e]++;}});
 var domEl='Огонь',mx=-1;Object.keys(cnt).forEach(function(k){if(cnt[k]>mx){mx=cnt[k];domEl=k;}});
 var dosha=(typeof doshaOf==='function')?doshaOf(lagEl):'';
 var GUNA={'Огонь':'Раджас','Воздух':'Раджас','Вода':'Саттва','Земля':'Тамас'};
 var guna=GUNA[domEl]||'—';
 var EGL={'Огонь':'🔥','Воздух':'🌬','Вода':'🌊','Земля':'🪨'};
 var pct=Math.max(6,Math.round(mx/8*100));
 card.innerHTML='<span class=\"label\">Качества из карты</span><div class=\"trait\" style=\"border:none;padding-bottom:5px\"><span>'+(EGL[domEl]||'✨')+' Акцент стихии</span><b>'+domEl+' · '+mx+'/8</b></div><div style=\"height:7px;border-radius:7px;background:rgba(255,255,255,.06);margin:0 0 12px;overflow:hidden\"><i style=\"display:block;height:100%;width:'+pct+'%;border-radius:7px;background:linear-gradient(90deg,var(--lens,#c9a84c),var(--spark,#ffd27a))\"></i></div><div class=\"trait\"><span>Доша Лагны</span><b>'+dosha+'</b></div><div class=\"trait\" style=\"border:none\"><span>Гуна</span><b>'+guna+'</b></div>';
}

function applyForm(){var f=active();var dn=(S()&&S().daimon&&S().daimon.name)?String(S().daimon.name):'';var ltr=dn?dn.charAt(0).toUpperCase():'';if(f){var g1=$('dmGlyph');if(g1){g1.textContent=ltr;g1.classList.add('avatar-lens');}var g2=$('dmGlyph2');if(g2){g2.textContent=ltr;g2.classList.add('avatar-lens');}var q=$('dmQuote');if(q&&f.quote)q.textContent=f.quote;}renderForms();updateLabels();if(typeof window.aiMode==='function')window.aiMode();}

function hook(){if(window.__dfHooked)return;var orig=window.renderDaimon;window.renderDaimon=function(){try{if(typeof orig==='function')orig.apply(this,arguments);}catch(e){}try{applyForm();}catch(e){}};window.__dfHooked=true;}

window.AwaraForms={list:getForms,active:active,setAxis:setAxis,cycle:function(){window.toggleDaimonForm&&window.toggleDaimonForm();},refresh:applyForm,__ready:true};

function boot(){hook();function run(){try{applyForm();}catch(e){}}run();setTimeout(run,400);setTimeout(run,1200);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,100);});}else{setTimeout(boot,100);}
})();
