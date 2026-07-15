/* ============================================================
   AWARA · МЕСТА СИЛЫ / локации линзы (v2)
   Места по выбранным матрицам-линзам. Данные: data/mythic_locations.json.
   v2: EN-поддержка (имена/описания/метки) + перерисовка при смене языка.
   ============================================================ */
(function(){
'use strict';
if(window.__awaraPlaces) return; window.__awaraPlaces=true;

function S(){ try{ return STATE; }catch(e){ return null; } }
var DATA=null, LOADING=false, FAILED=false;

function EN(){ try{ return (window.AwaraI18n&&window.AwaraI18n.lang)==='en'; }catch(e){ return false; } }
function hasCyr(s){ return /[\u0400-\u04FF]/.test(String(s||'')); }
function lore(){ try{ return window.AwaraLoreEN||null; }catch(e){ return null; } }

var RAR={mythic:'Мифическое',legendary:'Легендарное',epic:'Эпическое',rare:'Редкое',uncommon:'Необычное',common:'Обычное'};
var RAR_EN={mythic:'Mythic',legendary:'Legendary',epic:'Epic',rare:'Rare',uncommon:'Uncommon',common:'Common'};
var TYPE={axis_mundi:'Ось мира',divine_mountain:'Священная гора',celestial_realm:'Небесный мир',underworld:'Нижний мир',sacred_city:'Священный град',temple:'Храм',garden:'Сад',sea:'Воды',portal:'Портал',forest:'Лес',river:'Река',island:'Остров',deep_mythic_context:'Глубинный контекст',quest_context:'Квест-контекст'};
var TYPE_EN={axis_mundi:'Axis mundi',divine_mountain:'Divine mountain',celestial_realm:'Celestial realm',underworld:'Underworld',sacred_city:'Sacred city',temple:'Temple',garden:'Garden',sea:'Waters',portal:'Portal',forest:'Forest',river:'River',island:'Island',deep_mythic_context:'Deep mythic context',quest_context:'Quest context'};
var MX_EN={'Ведическая':'Vedic','Египетская':'Egyptian','Каббалистическая':'Kabbalistic','Майянская':'Mayan','Славянская':'Slavic','Скандинавская/Норс':'Norse','Даосская':'Taoist','Гностическая':'Gnostic','Японская/Синто':'Shinto','Кельтская':'Celtic','Шамбала':'Shambhala','Юлианская/Византийская':'Julian/Byzantine','Шаманская':'Shamanic','Генные Ключи':'Gene Keys','Техномагическая':'Technomagical','Космическая/Галактическая':'Cosmic/Galactic','Античная/Греко-Римская':'Antique/Greco-Roman','Зороастрийская/Персидская':'Zoroastrian/Persian','Исламская/Суфийская/Нуровая':'Islamic/Sufi/Nur','Ацтекская/Мешикская':'Aztec/Mexica','Христианско-Мистическая/Граальная':'Christian/Grail','Христианско-Мистическая/Розенкрейцерско-Граальная':'Christian/Grail','Йоруба/Ifá-Orisha':'Yoruba/Ifá-Orisha','Шумеро-Вавилонская':'Sumerian-Babylonian','Шумеро-Вавилонская/Месопотамская':'Sumerian-Babylonian','Герметико-Алхимическая':'Hermetic-Alchemical','Таро-Арканическая':'Tarot-Arcanic','Астрологическая':'Astrological','Китайская/И-Цзин':'Chinese/I Ching','Тантрическо-Кашмирская':'Tantric-Kashmiri','Буддийско-Махаянская':'Buddhist-Mahayana','Афро-Космическая/Догонская':'Afro-Cosmic/Dogon','Атлантическая/Лемурийская':'Atlantean/Lemurian','Постчеловеческая/AI-Софийная':'Posthuman/AI-Sophianic','Адвайта-Сиддха AWARA':'Advaita-Siddha AWARA'};
var MXSLUG_EN={vedic:'Vedic',egyptian:'Egyptian',kabbalistic:'Kabbalistic',mayan:'Mayan',slavic:'Slavic',norse:'Norse',daoist:'Taoist',gnostic:'Gnostic',shinto:'Shinto',celtic:'Celtic',shambhala:'Shambhala',julian_byzantine:'Julian-Byzantine',shamanic:'Shamanic',gene_keys:'Gene Keys',technomagical:'Technomagical',cosmic_galactic:'Cosmic-Galactic',antique_greco_roman:'Greco-Roman',zoroastrian:'Zoroastrian',islamic_sufi_nur:'Sufi-Nur',aztec_mexica:'Aztec-Mexica',christian_mystical_grail:'Christian-Grail',yoruba_ifa_orisha:'Yoruba-Ifa',sumerian_babylonian:'Sumerian-Babylonian',hermetic_alchemical:'Hermetic-Alchemical',tarot_arcanic:'Tarot-Arcana',astrological:'Astrological',chinese_iching:'Chinese I-Ching',tantric_kashmiri:'Kashmiri-Tantric',buddhist_mahayana:'Buddhist-Mahayana',afro_dogon:'Afro-Dogon',atlantean_lemurian:'Atlantean-Lemurian',posthuman_ai_sophianic:'Posthuman/AI-Sophianic',advaita_siddha:'Advaita-Siddha'};
var _TRMAP={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
function translit(s){ s=String(s||''); var out=''; for(var i=0;i<s.length;i++){ var c=s[i],lc=c.toLowerCase(),t=_TRMAP[lc]; if(t==null){ out+=c; continue; } if(c!==lc&&t){ t=t.charAt(0).toUpperCase()+t.slice(1); } out+=t; } return out; }

function rarWeight(r){ return ({mythic:6,legendary:5,epic:4,rare:3,uncommon:2,common:1})[r]||0; }
function cap(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); }

/* Цвет матрицы = та же HSL-формула, что у орба (awara-tigel-skin): полоса стихии + сдвиг по индексу. */
function _hueOf(key){
  try{
    var M=window.MATRIX||{}; var m=M[key];
    var band={'\u041e\u0433\u043e\u043d\u044c':[5,45],'\u0417\u0435\u043c\u043b\u044f':[40,95],'\u0412\u043e\u0434\u0430':[188,232],'\u042d\u0444\u0438\u0440':[258,300]}[m?m[1]:'']||[258,300];
    var keys=window.MATKEYS||Object.keys(M);
    var idx=keys.indexOf(key); if(idx<0) idx=0;
    var span=band[1]-band[0];
    return band[0]+((idx*37)%(span+1));
  }catch(e){ return null; }
}
function _accent(key){ var h=_hueOf(key); return h==null?'':('hsl('+h+',64%,60%)'); }
/* Активная линза = тот же источник, что у рамки/фона (LensLevels.current), включая предпросмотр. */
function _lensNowSlug(){ try{ if(window.LensLevels&&LensLevels.current){ var c=LensLevels.current(); return c&&c.slug?c.slug:''; } }catch(e){} return ''; }
function _hex2hsl(h){ if(!(h&&h.charAt(0)==='#'&&h.length===7)) return null; var r=parseInt(h.substr(1,2),16)/255,g=parseInt(h.substr(3,2),16)/255,b=parseInt(h.substr(5,2),16)/255; var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0; if(mx!==mn){ var d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); } return {s:s,l:l}; }
function _vivid(arr){ if(!arr||!arr.length) return ''; var best='',bestSc=-1; for(var i=0;i<arr.length;i++){ var c=arr[i]; var hsl=_hex2hsl(c); if(!hsl){ if(bestSc<0){ best=c; bestSc=0; } continue; } var sc=hsl.s*(1-Math.abs(hsl.l-0.5)*1.1); if(sc>bestSc){ bestSc=sc; best=c; } } return best||arr[0]; }
function _activeAccent(){ var slug=_lensNowSlug(); if(!slug) return ''; try{ if(window.lensPalette){ var v=_vivid(lensPalette(slug)); if(v) return v; } }catch(e){} try{ if(window.lensStyleFor){ var st=lensStyleFor(slug); if(st&&st.palette){ var v2=_vivid(st.palette); if(v2) return v2; } } }catch(e){} try{ if(DATA){ for(var i=0;i<DATA.length;i++){ if((DATA[i].matrix_slug||'')===slug){ var a=_accent(DATA[i].matrix_name); if(a) return a; break; } } } }catch(e){} return ''; }
function _mkAlpha(c,hexA,f){ if(!c) return c; if(c.charAt(0)==='#'&&c.length===7) return c+hexA; if(c.indexOf('hsl(')===0) return c.replace('hsl(','hsla(').replace(')',','+f+')'); return c; }
function _lensTitle(slug){ try{ if(DATA){ for(var i=0;i<DATA.length;i++){ if((DATA[i].matrix_slug||'')===slug) return EN()?mxName(DATA[i]):(DATA[i].matrix_name||slug); } } }catch(e){} return slug; }

function load(cb){
  if(DATA){ cb(); return; }
  if(LOADING) return;
  LOADING=true;
  fetch('data/mythic_locations.json').then(function(r){ return r.json(); }).then(function(j){
    DATA=Array.isArray(j)?j:(j.locations||j.items||[]); LOADING=false; cb();
  }).catch(function(){ FAILED=true; LOADING=false; cb(); });
}

function trName(loc){ var n=(loc&&loc.name)||''; if(!EN()) return n; var L=lore(); if(L&&L.locn&&L.locn[n]) return L.locn[n]; return hasCyr(n)?translit(n):n; }
function mxName(loc){ var n=(loc&&loc.matrix_name)||''; if(!EN()) return n; return MX_EN[n]||MXSLUG_EN[loc&&loc.matrix_slug]||(hasCyr(n)?translit(n):n); }
function typeLabel(loc){ var t=loc&&loc.type; if(EN()) return TYPE_EN[t]||String(t||'').replace(/_/g,' '); return TYPE[t]||t||''; }
function rarLabel(loc){ var r=loc&&loc.rarity; if(EN()) return RAR_EN[r]||r||''; return RAR[r]||r||''; }
function richEnDesc(loc){ var nm=trName(loc); var et=(TYPE_EN[loc&&loc.type]||String((loc&&loc.type)||'').replace(/_/g,' ')||'sacred site').toLowerCase(); var uni=mxName(loc); var s=nm+' — a '+et+' of the '+uni+' universe.'; var L=lore(); var b=(L&&L.br&&L.br[loc&&loc.matrix_slug])||null; if(b&&b.mood) s+=' Its air: '+String(b.mood).toLowerCase()+'.'; return s; }
function trDesc(loc){ var d=(loc&&loc.description)||''; if(!EN()) return d; var L=lore(); if(L&&L.locd&&L.locd[d]&&!hasCyr(L.locd[d])) return L.locd[d]; if(d&&!hasCyr(d)) return d; return richEnDesc(loc); }

function compose(loc){
  if(EN()) return trDesc(loc);
  var out=[];
  if(loc.description) out.push(loc.description);
  if(loc.visual_tags) out.push('Атмосфера: '+String(loc.visual_tags).toLowerCase()+'.');
  if(loc.quest_use) out.push(cap(loc.quest_use)+'.');
  return out.join(' ');
}

function styleOnce(){
  if(document.querySelector('style[data-awara-places]')) return;
  var st=document.createElement('style'); st.setAttribute('data-awara-places','1');
  st.textContent=`
#lensPlaces{margin-top:20px}
#lensPlaces .lp-h{display:flex;align-items:baseline;justify-content:space-between;margin:0 2px 10px}
#lensPlaces .lp-t{font-size:18px;letter-spacing:.04em;color:var(--lp-accent,var(--text))!important}
#lensPlaces .lp-sub{font-size:12.5px;color:var(--muted)}
#lensPlaces .lp-grid{display:flex;flex-direction:column;gap:10px}
#lensPlaces .lp-card{border:1px solid var(--line);border-left:3px solid var(--lp-accent,var(--lens,#7b62c9))!important;border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02);box-shadow:0 8px 26px -16px var(--lp-accent,transparent);transition:border-color .5s ease,box-shadow .5s ease}
#lensPlaces .lp-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
#lensPlaces .lp-nm{font-size:16.5px;color:var(--text)}
#lensPlaces .lp-rar{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);white-space:nowrap}
#lensPlaces .lp-meta{font-size:12.5px;color:var(--muted);margin-top:3px}
#lensPlaces .lp-desc{font-size:15px;line-height:1.6;color:var(--text);opacity:.86;margin-top:8px}
#lensPlaces .lp-empty{font-size:13.5px;color:var(--muted);padding:8px 2px;line-height:1.5}
#lensPlaces .lp-card.r-legendary .lp-rar,#lensPlaces .lp-card.r-mythic .lp-rar{color:var(--spark)}
`;
  document.head.appendChild(st);
}

function ensureHost(){
  var scr=document.getElementById('s-tigel'); if(!scr) return null;
  var h=document.getElementById('lensPlaces');
  if(!h){ h=document.createElement('div'); h.id='lensPlaces'; scr.appendChild(h); }
  return h;
}

function render(){
  styleOnce();
  var h=ensureHost(); if(!h) return;
  var s=S(); var lenses=(s&&s.mats)?s.mats:[]; var en=EN();
  var _acc=_activeAccent();
  var _aslug=_lensNowSlug();
  var _soft=_mkAlpha(_acc,'59',0.35);
  var _glow=_mkAlpha(_acc,'40',0.25);
  var _bgTop=_mkAlpha(_acc,'30',0.20);
  var _bgBot=_mkAlpha(_acc,'14',0.07);
  var _brd=_mkAlpha(_acc,'8c',0.55);
  try{ h.style.setProperty('--lp-accent', _acc||''); }catch(e){}
  var title=en?'Places of Power':'Места силы';
  var _lname=_aslug?_lensTitle(_aslug):'';
  var sub=_lname?(en?('lens: '+_lname):('линза: '+_lname)):(lenses.length?(en?'by your lenses':'по твоим линзам'):(en?'choose a lens — places will open':'выбери линзу — откроются места'));
  var _tStyle=_acc?(' style="color:'+_acc+'!important"'):'';
  var head='<div class="lp-h"><span class="lp-t"'+_tStyle+'>'+title+'</span><span class="lp-sub">'+sub+'</span></div>';
  if(FAILED){ h.innerHTML=head+'<div class="lp-empty">'+(en?'Places data unavailable — open the app via a local server (not file://).':'Данные мест недоступны — открой приложение через локальный сервер (не file://).')+'</div>'; return; }
  if(!DATA){ h.innerHTML=head+'<div class="lp-empty">'+(en?'Loading places…':'Загружаю места…')+'</div>'; load(render); return; }
  var list=null;
  if(_aslug){ list=DATA.filter(function(l){ return (l.matrix_slug||'')===_aslug; }); list.sort(function(a,b){ return rarWeight(b.rarity)-rarWeight(a.rarity); }); }
  if(!list||!list.length){
    if(lenses.length){ list=DATA.filter(function(l){ return lenses.indexOf(l.matrix_name)>=0; }); list.sort(function(a,b){ return rarWeight(b.rarity)-rarWeight(a.rarity); }); }
    else { list=DATA.slice().sort(function(a,b){ return rarWeight(b.rarity)-rarWeight(a.rarity); }).slice(0,6); }
  }
  if(!list.length){ h.innerHTML=head+'<div class="lp-empty">'+(en?'No places opened for this lens yet.':'Для этой линзы места ещё не открыты.')+'</div>'; return; }
  var _cStyle=_acc?(' style="background:linear-gradient(180deg,'+_bgTop+','+_bgBot+'),#0e0c14!important;border:1px solid '+_brd+'!important;border-left:3px solid '+_acc+'!important;box-shadow:inset 0 0 40px -10px '+_glow+',0 10px 30px -14px '+_glow+'!important"'):'';
  var cards=list.map(function(l){
    return '<div class="lp-card r-'+(l.rarity||'common')+'"'+_cStyle+'>'+
      '<div class="lp-top"><span class="lp-nm">'+trName(l)+'</span><span class="lp-rar">'+rarLabel(l)+'</span></div>'+
      '<div class="lp-meta">'+typeLabel(l)+' · '+mxName(l)+'</div>'+
      '<div class="lp-desc">'+compose(l)+'</div>'+
    '</div>';
  }).join('');
  h.innerHTML=head+'<div class="lp-grid">'+cards+'</div>';
}

/* ---- хуки ---- */
function wrap(name){ if(typeof window[name]==='function'){ var _f=window[name]; window[name]=function(){ var r=_f.apply(this,arguments); try{ render(); }catch(e){} return r; }; } }
wrap('renderDeck'); wrap('toggleMat'); wrap('go');
try{ document.querySelectorAll('[data-nav="tigel"]').forEach(function(b){ b.addEventListener('click', function(){ setTimeout(render,40); }); }); }catch(e){}
window.addEventListener('awara:lang', function(){ try{ render(); }catch(e){} });

setTimeout(render, 450);

/* follow the active lens (incl. isolated preview) like the frame/background do */
var _lastSig='';
function _sig(){ var s=S(); var m=(s&&s.mats)?s.mats.join(','):''; return m+'|'+_lensNowSlug()+'|'+(EN()?'en':'ru'); }
setInterval(function(){ var g=_sig(); if(g!==_lastSig){ _lastSig=g; try{ render(); }catch(e){} } }, 900);

})();