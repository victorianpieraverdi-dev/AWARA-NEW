/* awara-card-visuals.js v17 — 33 cards; Космическая: monotonic lens L1→L6 */
(function(){
'use strict';

/* ── helpers ── */
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function rgba(h,a){var c=hex2rgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}

/* ── pattern generators ── */
function rlg(deg,c,a,sp,w){return 'repeating-linear-gradient('+deg+'deg,transparent,transparent '+sp+'px,'+rgba(c,a)+' '+sp+'px,'+rgba(c,a)+' '+(sp+w)+'px)';}
function rrg(c,a,sp,w){return 'repeating-radial-gradient(circle at 50% 50%,transparent,transparent '+sp+'px,'+rgba(c,a)+' '+sp+'px,'+rgba(c,a)+' '+(sp+w)+'px)';}

function mkPat(type,c1,c2,a){
  switch(type){
    case 'diag':    return {bg:rlg(45,c1,a,7,1)};
    case 'diag30':  return {bg:rlg(30,c1,a,6,1)};
    case 'diag60':  return {bg:rlg(60,c1,a,8,1)};
    case 'cross':   return {bg:rlg(45,c1,a,6,1)+','+rlg(-45,c2,a*.7,6,1)};
    case 'horiz':   return {bg:rlg(0,c1,a,6,1)};
    case 'vert':    return {bg:rlg(90,c1,a,7,1)};
    case 'grid':    return {bg:rlg(0,c1,a,10,1)+','+rlg(90,c1,a*.7,10,1)};
    case 'conc':    return {bg:rrg(c1,a,10,1)};
    case 'dots':    return {bg:'radial-gradient('+rgba(c1,a)+' 1px,transparent 1.5px)',sz:'7px 7px'};
    case 'zigzag':  return {bg:rlg(60,c1,a,7,1)+','+rlg(-60,c2,a*.7,7,1)};
    case 'diamond': return {bg:rlg(45,c1,a,12,1)+','+rlg(-45,c1,a,12,1)};
    case 'wave':    return {bg:rlg(15,c1,a,6,1)+','+rlg(-15,c2,a*.5,8,1)};
    case 'none':    return {bg:'none'};
    default:        return {bg:rlg(45,c1,a,7,1)};
  }
}

/* ══════════════════════════════════════════════════════════════
   LORE STYLES — [borderStyle, borderRadius, gradAngle, patternType, cornerSize]
   ══════════════════════════════════════════════════════════════ */
var LORE={
  'Ведическая':      ['double',16,145,'conc',   14],
  'Таро':            ['double', 3,180,'vert',   18],
  'Каббала':         ['ridge', 10,160,'diamond',16],
  'Герметизм':       ['groove', 8,135,'cross',  14],
  'Славянская':      ['ridge', 10,155,'diag',   16],
  'Гностицизм':      ['solid', 18,130,'conc',   12],
  'Даосизм':         ['solid', 20,160,'horiz',  10],
  'И-Цзин':          ['solid', 10,  0,'horiz',  12],
  'Египетская':      ['double', 4,135,'grid',   18],
  'Майя':            ['solid',  8,145,'cross',  16],
  'Ацтеки':          ['ridge',  4,150,'zigzag', 16],
  'Кельтская':       ['ridge', 12,140,'conc',   14],
  'Скандинавская':   ['ridge',  6,150,'vert',   16],
  'Шаманская':       ['dashed',18,145,'dots',   12],
  'Буддийская':      ['solid', 16,155,'dots',   14],
  'Суфийская':       ['solid', 14,145,'diag30', 12],
  'Христианская':    ['double',10,135,'cross',  16],
  'Атлантическая':   ['solid', 20,120,'conc',   12],
  'Шамбала':         ['double',14,140,'conc',   14],
  'Генные Ключи':    ['solid', 12,150,'diag',   14],
  'Астрологическая': ['solid', 10,135,'conc',   14],
  'Космическая':     ['solid', 20,135,'dots',   10],
  'Шинто':           ['solid', 10,160,'horiz',  10],
  'Шумерская':       ['double', 2,180,'grid',   18],
  'Зороастрийская':  ['ridge', 10,145,'diag60', 16],
  'Африканская':     ['dashed',10,155,'zigzag', 14],
  'Йоруба':          ['dotted',14,150,'dots',   12],
  'Тантрическая':    ['solid', 12,130,'conc',   16],
  'Постчеловеческая':['solid',  2,120,'dots',   10],
  'Техномагия':      ['solid',  4, 90,'grid',   12],
  'Адвайта':         ['solid', 22,180,'none',    8],
  'Византийская':    ['double', 8,135,'grid',   16],
  'Орфическая':      ['solid', 14,140,'wave',   12]
};
var DEF_LORE=['solid',12,145,'diag',14];

function bdW(st,lv){
  if(st==='double') return lv>=6?4:lv>=5?3.5:3;
  if(st==='ridge'||st==='groove') return lv>=6?3:lv>=5?2.5:2;
  return lv>=6?2:lv>=5?1.5:1;
}

/* ══════════════════════════════════════════════════════════════
   LEVEL TIERS — dramatic visual ascent (L1 Физика → L6 Божественное)
   patA  = alpha passed to mkPat(); patO = .cv-pattern opacity
   ══════════════════════════════════════════════════════════════ */
var TIER={
  1:{orbOp:.58, orbFilt:'grayscale(.32) brightness(.72) contrast(.92)', tintMode:'weak',
     patA:.06, patO:.05, frameA:.04, corners:false, frameGlow:null,
     borderA:.10, bgKey:'dawn', shadowKey:'faint', textKey:'dawn'},
  2:{orbOp:.66, orbFilt:'grayscale(.14) brightness(.76) saturate(.82) contrast(.93)', tintMode:'weak',
     patA:.10, patO:.08, frameA:.07, corners:false, frameGlow:null,
     borderA:.18, bgKey:'wake', shadowKey:'faint', textKey:'wake'},
  3:{orbOp:.80, orbFilt:'grayscale(0) saturate(1.02) brightness(.94)', tintMode:'mid',
     patA:.14, patO:.12, frameA:.11, corners:false, frameGlow:null,
     borderA:.30, bgKey:'harmony', shadowKey:'mid', textKey:'harmony'},
  4:{orbOp:.88, orbFilt:'saturate(1.06) brightness(.98) contrast(1.01)', tintMode:'strong',
     patA:.18, patO:.16, frameA:.15, corners:false, frameGlow:null,
     borderA:.42, bgKey:'shine', shadowKey:'strong', textKey:'shine'},
  5:{orbOp:.93, orbFilt:'saturate(1.12) brightness(1.02) contrast(1.02)', tintMode:'full',
     patA:.22, patO:.20, frameA:.20, corners:true, frameGlow:'soft',
     borderA:.54, bgKey:'rise', shadowKey:'rise', textKey:'rise'},
  6:{orbOp:.98, orbFilt:'saturate(1.18) brightness(1.05) contrast(1.03)', tintMode:'divine',
     patA:.26, patO:.24, frameA:.24, corners:true, frameGlow:'bright',
     borderA:.64, bgKey:'divine', shadowKey:'divine', textKey:'divine'}
};

/* ── Космическая only — nebula ascent L1→L6 (other cards use TIER above) ── */
var COSMIC_KEY='\u041a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f';
var COSMIC_LV_NAMES=['','\u0444\u0438\u0437\u0438\u043a\u0430','\u043f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u0435','\u0433\u0430\u0440\u043c\u043e\u043d\u0438\u044f','\u0441\u0438\u044f\u043d\u0438\u0435','\u0432\u043e\u0441\u0445\u043e\u0434','\u0431\u043e\u0436\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435'];
var COSMIC_TIER={
  1:{patA:.10,patO:.11,nebOp:.16,orbOp:.66,orbFilt:'grayscale(.22) brightness(.78) saturate(.75)',borderA:.16,frameA:.07,corners:false,frameGlow:null},
  2:{patA:.14,patO:.17,nebOp:.22,orbOp:.74,orbFilt:'grayscale(.08) brightness(.82) saturate(.88)',borderA:.24,frameA:.11,corners:false,frameGlow:null},
  3:{patA:.18,patO:.23,nebOp:.28,orbOp:.84,orbFilt:'grayscale(0) brightness(.92) saturate(1.05)',borderA:.36,frameA:.15,corners:false,frameGlow:null},
  4:{patA:.22,patO:.29,nebOp:.34,orbOp:.91,orbFilt:'saturate(1.08) brightness(.98)',borderA:.48,frameA:.19,corners:false,frameGlow:null},
  5:{patA:.26,patO:.35,nebOp:.40,orbOp:.96,orbFilt:'saturate(1.14) brightness(1.02)',borderA:.60,frameA:.24,corners:true,frameGlow:'soft'},
  6:{patA:.30,patO:.42,nebOp:.48,orbOp:1,orbFilt:'saturate(1.22) brightness(1.06) contrast(1.02)',borderA:.74,frameA:.30,corners:true,frameGlow:'bright'}
};

function cosmicPalette(pal){
  return [(pal&&pal[0])||'#1a0d3a',(pal&&pal[1])||'#c24a8a',(pal&&pal[2])||'#3aa8d6'];
}

function cosmicTierBg(lv,c1,c2,c3){
  var deep=rgba(c1,.94);
  switch(lv){
    case 1: return 'radial-gradient(ellipse 75% 55% at 50% 8%,'+rgba(c3,.10)+' 0%,transparent 58%),'+
                  'linear-gradient(165deg,'+rgba(c1,.55)+' 0%,#14121f 42%,#0e0c18 100%)';
    case 2: return 'radial-gradient(ellipse 70% 50% at 30% 12%,'+rgba(c3,.12)+' 0%,transparent 55%),'+
                  'radial-gradient(ellipse 55% 40% at 78% 88%,'+rgba(c2,.08)+' 0%,transparent 52%),'+
                  'linear-gradient(160deg,'+deep+' 0%,#12101e 50%,#0a0814 100%)';
    case 3: return 'radial-gradient(ellipse 80% 60% at 50% 0%,'+rgba(c3,.16)+' 0%,transparent 54%),'+
                  'radial-gradient(ellipse 50% 45% at 90% 75%,'+rgba(c2,.12)+' 0%,transparent 50%),'+
                  'linear-gradient(155deg,'+rgba(c1,.88)+' 0%,'+rgba(c2,.06)+' 45%,#0a0814 100%)';
    case 4: return 'radial-gradient(ellipse 90% 65% at 50% -5%,'+rgba(c3,.18)+' 0%,transparent 50%),'+
                  'radial-gradient(ellipse 60% 50% at 12% 82%,'+rgba(c2,.14)+' 0%,transparent 52%),'+
                  'linear-gradient(150deg,'+rgba(c1,.82)+' 0%,'+rgba(c2,.10)+' 38%,'+rgba(c3,.05)+' 68%,#080612 100%)';
    case 5: return 'radial-gradient(ellipse 100% 75% at 50% -8%,'+rgba(c2,.16)+' 0%,transparent 48%),'+
                  'radial-gradient(ellipse 70% 55% at 85% 90%,'+rgba(c3,.14)+' 0%,transparent 52%),'+
                  'linear-gradient(145deg,'+rgba(c1,.78)+' 0%,'+rgba(c2,.14)+' 32%,'+rgba(c3,.08)+' 62%,#06050f 100%)';
    case 6: return 'radial-gradient(ellipse 110% 85% at 50% -10%,'+rgba(c3,.22)+' 0%,transparent 46%),'+
                  'radial-gradient(ellipse 75% 55% at 18% 88%,'+rgba(c2,.18)+' 0%,transparent 50%),'+
                  'radial-gradient(ellipse 55% 40% at 92% 35%,'+rgba(c3,.10)+' 0%,transparent 48%),'+
                  'linear-gradient(140deg,'+rgba(c1,.72)+' 0%,'+rgba(c2,.16)+' 28%,'+rgba(c3,.10)+' 55%,'+rgba(c2,.06)+' 78%,#05040c 100%)';
    default:return 'linear-gradient(160deg,#14121f,#0a0814)';
  }
}

function cosmicTierShadow(lv,c1,c2,c3){
  var base='inset 0 0 24px '+rgba(c1,.08);
  if(lv<=1) return '0 0 10px '+rgba(c3,.12)+','+base;
  if(lv===2) return '0 0 14px '+rgba(c3,.16)+',0 0 6px '+rgba(c2,.08)+','+base;
  if(lv===3) return '0 0 20px '+rgba(c3,.20)+',0 0 8px '+rgba(c2,.12)+','+base;
  if(lv===4) return '0 0 28px '+rgba(c2,.24)+',0 0 12px '+rgba(c3,.16)+',inset 0 0 32px '+rgba(c1,.10);
  if(lv===5) return '0 0 36px '+rgba(c2,.30)+',0 0 14px '+rgba(c3,.20)+',0 0 52px '+rgba(c1,.10)+',inset 0 0 40px '+rgba(c2,.08);
  return '0 0 44px '+rgba(c3,.34)+',0 0 18px '+rgba(c2,.26)+',0 0 64px '+rgba(c1,.12)+',inset 0 0 48px '+rgba(c3,.10)+',inset 0 -6px 20px '+rgba(c2,.06);
}

function cosmicTierText(lv,c2,c3){
  if(lv<=1) return {color:'#b8c6dc',shadow:'0 1px 4px rgba(0,0,0,.55)'};
  if(lv===2) return {color:'#c4d0e4',shadow:'0 1px 4px rgba(0,0,0,.45)'};
  if(lv===3) return {color:rgba(c3,.90),shadow:'0 0 8px '+rgba(c3,.22)};
  if(lv===4) return {color:rgba(c3,.94),shadow:'0 0 10px '+rgba(c3,.28)+',0 0 4px '+rgba(c2,.16)};
  if(lv===5) return {color:'#d8ecff',shadow:'0 0 14px '+rgba(c3,.34)+',0 0 5px '+rgba(c2,.22)};
  return {color:'#e8f4ff',shadow:'0 0 18px '+rgba(c3,.40)+',0 0 8px '+rgba(c2,.28)+',0 0 4px rgba(255,255,255,.12)'};
}

function stripCosmic(card){
  card.removeAttribute('data-cv-cosmic');
  var nb=card.querySelector('.cv-cosmic-nebula'); if(nb) nb.remove();
  var tg=card.querySelector('.cv-cosmic-lv'); if(tg) tg.remove();
  var gl=card.querySelector('.gl');
  if(gl) stripCosmicLens(gl);
}

var COSMIC_LEN_IDS=['cv-cl-sky','cv-cl-nebula','cv-cl-rays','cv-cl-stars','cv-cl-core','cv-cl-orbit','cv-cl-lv-ring','cv-cl-lv-mark'];

function stripCosmicLens(gl){
  if(!gl) return;
  gl.removeAttribute('data-cv-cosmic-lens');
  gl.removeAttribute('data-cv-cl-lv');
  COSMIC_LEN_IDS.forEach(function(cls){
    var el=gl.querySelector('.'+cls);
    if(el) el.remove();
  });
}

function ensureCosmicLensLayer(gl, cls){
  var el=gl.querySelector('.'+cls);
  if(!el){
    el=document.createElement('div');
    el.className=cls+' cv-cl-layer';
    gl.insertBefore(el, gl.firstChild);
  }
  return el;
}

function ensureCosmicLens(gl, lv, c1, c2, c3){
  if(!gl) return;
  gl.setAttribute('data-cv-cosmic-lens','1');
  gl.setAttribute('data-cv-cl-lv',String(lv));
  gl.style.setProperty('--cv-cl-c1',c1);
  gl.style.setProperty('--cv-cl-c2',c2);
  gl.style.setProperty('--cv-cl-c3',c3);
  gl.classList.add('lens-orb');

  ensureCosmicLensLayer(gl,'cv-cl-sky');
  ensureCosmicLensLayer(gl,'cv-cl-nebula');
  ensureCosmicLensLayer(gl,'cv-cl-rays');
  ensureCosmicLensLayer(gl,'cv-cl-stars');
  ensureCosmicLensLayer(gl,'cv-cl-core');
  ensureCosmicLensLayer(gl,'cv-cl-orbit');

  var ring=gl.querySelector('.cv-cl-lv-ring');
  if(!ring){
    ring=document.createElement('div');
    ring.className='cv-cl-lv-ring cv-cl-layer';
    var ri;
    for(ri=0;ri<6;ri++){
      var dot=document.createElement('span');
      dot.className='cv-cl-lv-dot';
      dot.style.cssText='position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.12);transform:rotate('+(ri*60)+'deg) translateY(-24px)';
      ring.appendChild(dot);
    }
    gl.appendChild(ring);
  }
  var dots=ring.querySelectorAll('.cv-cl-lv-dot');
  var di;
  for(di=0;di<dots.length;di++){
    if(di+1<=lv){
      if(lv<=2){
        dots[di].style.background='rgba(255,255,255,.16)';
        dots[di].style.boxShadow='none';
      }else if(lv===3){
        dots[di].style.background=rgba(c3,.32);
        dots[di].style.boxShadow='0 0 2px '+rgba(c3,.18);
      }else{
        dots[di].style.background='linear-gradient(145deg,'+rgba(c3,.75)+','+rgba(c2,.45)+')';
        dots[di].style.boxShadow='0 0 4px '+rgba(c3,.35);
      }
    }else{
      dots[di].style.background='rgba(255,255,255,.10)';
      dots[di].style.boxShadow='none';
    }
    if(di+1===lv) dots[di].style.transform='rotate('+(di*60)+'deg) translateY(-24px) scale(1.5)';
    else dots[di].style.transform='rotate('+(di*60)+'deg) translateY(-24px)';
  }

  var mark=gl.querySelector('.cv-cl-lv-mark');
  if(!mark){
    mark=document.createElement('span');
    mark.className='cv-cl-lv-mark';
    gl.appendChild(mark);
  }
  mark.textContent='L'+lv;

  var tint=gl.querySelector('.cv-tint');
  if(!tint){
    tint=document.createElement('div');
    tint.className='cv-tint';
    var img=gl.querySelector('.lens-orb-img');
    if(img) img.parentNode.insertBefore(tint, img.nextSibling);
    else gl.appendChild(tint);
  }
  tint.style.background=lv<=1
    ?'radial-gradient(circle at 50% 50%,rgba(6,5,12,.72),rgba(2,2,6,.88))'
    :lv===2
    ?'radial-gradient(circle at 50% 50%,rgba(8,7,14,.62),rgba(3,3,8,.78))'
    :lv===3
    ?'radial-gradient(circle at 50% 40%,'+rgba(c3,.16)+','+rgba(c1,.38)+')'
    :lv===4
    ?'radial-gradient(circle at 50% 38%,'+rgba(c3,.26)+','+rgba(c2,.16)+','+rgba(c1,.24)+')'
    :lv===5
    ?'radial-gradient(circle at 50% 36%,'+rgba(c3,.34)+','+rgba(c2,.26)+','+rgba(c1,.14)+')'
    :'radial-gradient(circle at 50% 34%,'+rgba(c3,.42)+','+rgba(c2,.32)+','+rgba(c1,.08)+')';
  tint.style.mixBlendMode=lv>=4?'screen':lv>=3?'color':'normal';
  tint.style.opacity=lv<=1?'.94':lv===2?'.86':lv===3?'.62':lv===4?'.48':lv===5?'.36':'.24';

  if(lv<=1){
    gl.style.setProperty('border','1px solid rgba(255,255,255,.06)','important');
    gl.style.setProperty('box-shadow','inset 0 0 18px rgba(0,0,0,.58)','important');
  }else if(lv===2){
    gl.style.setProperty('border','1px solid rgba(255,255,255,.10)','important');
    gl.style.setProperty('box-shadow','inset 0 0 16px rgba(0,0,0,.48)','important');
  }else if(lv===3){
    gl.style.setProperty('border','1.5px solid '+rgba(c3,.26),'important');
    gl.style.setProperty('box-shadow','0 0 8px '+rgba(c3,.10)+',inset 0 0 14px '+rgba(c1,.10),'important');
  }else if(lv===4){
    gl.style.setProperty('border','2px solid '+rgba(c3,.40),'important');
    gl.style.setProperty('box-shadow','0 0 16px '+rgba(c3,.20)+',0 0 6px '+rgba(c2,.10)+',inset 0 0 18px '+rgba(c1,.08),'important');
  }else if(lv===5){
    gl.style.setProperty('border','2.5px solid '+rgba(c3,.56),'important');
    gl.style.setProperty('box-shadow','0 0 24px '+rgba(c3,.30)+',0 0 10px '+rgba(c2,.20)+',0 0 40px '+rgba(c1,.08)+',inset 0 0 22px '+rgba(c2,.06),'important');
  }else{
    gl.style.setProperty('border','3px solid '+rgba(c3,.72),'important');
    gl.style.setProperty('box-shadow','0 0 32px '+rgba(c3,.42)+',0 0 14px '+rgba(c2,.30)+',0 0 52px '+rgba(c1,.12)+',0 0 6px rgba(255,255,255,.14),inset 0 0 26px '+rgba(c3,.10),'important');
  }
  gl.style.setProperty('opacity','1','important');
  gl.style.setProperty('filter','none','important');
  gl.style.setProperty('transform','none','important');
  gl.style.setProperty('background','transparent','important');

  var orbImg=gl.querySelector('.lens-orb-img');
  if(orbImg){
    orbImg.style.filter='';
    orbImg.style.opacity='';
  }
}

function ensureCosmicNebula(card,lv,c2,c3,op){
  var nb=card.querySelector('.cv-cosmic-nebula');
  if(!nb){
    nb=document.createElement('div');
    nb.className='cv-cosmic-nebula';
    var band=card.querySelector('.cv-lv-band');
    if(band&&band.nextSibling) card.insertBefore(nb,band.nextSibling);
    else card.insertBefore(nb,card.firstChild);
  }
  nb.style.setProperty('--cv-neb-op',String(op));
  nb.style.setProperty('--cv-c2-a',rgba(c2,.22+lv*.04));
  nb.style.setProperty('--cv-c3-a',rgba(c3,.18+lv*.04));
}

function tierBg(key,ga,c1,c2,c3){
  switch(key){
    case 'dawn':   return 'linear-gradient('+(ga+14)+'deg,'+rgba(c1,.10)+' 0%,'+rgba(c2,.05)+' 36%,rgba(28,28,40,.46) 70%,rgba(20,20,32,.52) 100%)';
    case 'dead':   return 'rgba(5,5,10,.78)';
    case 'wake':   return 'linear-gradient('+(ga+18)+'deg,'+rgba(c1,.10)+' 0%,'+rgba(c1,.04)+' 48%,rgba(10,10,20,.60) 100%)';
    case 'harmony':return 'linear-gradient('+(ga+12)+'deg,'+rgba(c1,.16)+' 0%,'+rgba(c2,.07)+' 55%,rgba(8,8,18,.54) 100%)';
    case 'shine':  return 'radial-gradient(ellipse 90% 70% at 50% 18%,'+rgba(c1,.12)+' 0%,transparent 58%),'+
                          'linear-gradient('+(ga+6)+'deg,'+rgba(c1,.20)+' 0%,'+rgba(c2,.09)+' 42%,'+rgba(c3,.04)+' 72%,rgba(6,6,14,.40) 100%)';
    case 'rise':   return 'radial-gradient(ellipse 100% 80% at 50% 0%,'+rgba(c1,.16)+' 0%,transparent 52%),'+
                          'radial-gradient(ellipse 70% 50% at 80% 90%,'+rgba(c2,.08)+' 0%,transparent 55%),'+
                          'linear-gradient('+ga+'deg,'+rgba(c1,.22)+' 0%,'+rgba(c2,.12)+' 38%,'+rgba(c1,.06)+' 72%,rgba(5,5,12,.36) 100%)';
    case 'divine': return 'radial-gradient(ellipse 110% 90% at 50% -8%,'+rgba(c3,.14)+' 0%,transparent 48%),'+
                          'radial-gradient(ellipse 80% 60% at 15% 85%,'+rgba(c2,.10)+' 0%,transparent 50%),'+
                          'radial-gradient(ellipse 60% 45% at 88% 70%,'+rgba(c1,.08)+' 0%,transparent 52%),'+
                          'linear-gradient('+ga+'deg,'+rgba(c1,.24)+' 0%,'+rgba(c2,.13)+' 32%,'+rgba(c3,.06)+' 58%,'+rgba(c1,.05)+' 82%,rgba(4,4,10,.34) 100%)';
    default:       return 'rgba(8,8,16,.6)';
  }
}

function tierShadow(key,c1,c2,c3){
  switch(key){
    case 'none':   return 'none';
    case 'faint':  return '0 0 8px '+rgba(c1,.10)+',inset 0 0 18px '+rgba(c1,.04);
    case 'mid':    return '0 0 16px '+rgba(c1,.18)+',0 0 4px '+rgba(c2,.08)+
                          ',inset 0 0 28px '+rgba(c1,.06)+',inset 0 0 12px '+rgba(c2,.03);
    case 'strong': return '0 0 24px '+rgba(c1,.24)+',0 0 8px '+rgba(c2,.12)+
                          ',inset 0 0 36px '+rgba(c1,.08)+',inset 0 0 16px '+rgba(c2,.05);
    case 'rise':   return '0 0 32px '+rgba(c1,.30)+',0 0 12px '+rgba(c2,.16)+',0 0 48px '+rgba(c1,.10)+
                          ',inset 0 0 40px '+rgba(c1,.10)+',inset 0 0 22px '+rgba(c2,.06);
    case 'divine': return '0 0 40px '+rgba(c1,.36)+',0 0 16px '+rgba(c2,.20)+',0 0 64px '+rgba(c1,.12)+
                          ',inset 0 0 48px '+rgba(c1,.12)+',inset 0 0 28px '+rgba(c2,.08)+',inset 0 -8px 24px '+rgba(c3,.05);
    default:       return 'none';
  }
}

function tierText(key,c1,c2,c3){
  switch(key){
    case 'dawn':    return {color:rgba(c3,.78), shadow:'0 1px 4px rgba(0,0,0,.4)'};
    case 'dead':    return {color:'#383840', shadow:'none'};
    case 'wake':    return {color:rgba(c3,.62), shadow:'0 1px 4px rgba(0,0,0,.6)'};
    case 'harmony': return {color:rgba(c3,.84), shadow:'0 0 8px '+rgba(c1,.22)+',0 1px 3px rgba(0,0,0,.4)'};
    case 'shine':   return {color:rgba(c3,.92), shadow:'0 0 10px '+rgba(c1,.28)+',0 1px 4px rgba(0,0,0,.35)'};
    case 'rise':    return {color:c3, shadow:'0 0 14px '+rgba(c1,.34)+',0 0 5px '+rgba(c3,.22)+',0 1px 4px rgba(0,0,0,.3)'};
    case 'divine':  return {color:rgba(c3,.98), shadow:'0 0 18px '+rgba(c1,.40)+',0 0 8px '+rgba(c3,.28)+',0 1px 4px rgba(0,0,0,.28)'};
    default:        return {color:c3, shadow:'none'};
  }
}

function applyOrbTint(tint,mode,c1,c2,c3,ga){
  switch(mode){
    case 'dead':   tint.style.background='none'; tint.style.mixBlendMode='normal'; tint.style.opacity='1'; break;
    case 'weak':   tint.style.background=rgba(c1,.18); tint.style.mixBlendMode='color'; tint.style.opacity='1'; break;
    case 'mid':    tint.style.background=rgba(c1,.30); tint.style.mixBlendMode='color'; tint.style.opacity='1'; break;
    case 'strong': tint.style.background=rgba(c1,.42); tint.style.mixBlendMode='color'; tint.style.opacity='1'; break;
    case 'full':   tint.style.background=rgba(c1,.52); tint.style.mixBlendMode='color'; tint.style.opacity='.85'; break;
    case 'divine': tint.style.background='linear-gradient('+ga+'deg,'+rgba(c1,.65)+','+rgba(c2,.45)+','+rgba(c3,.35)+')';
                   tint.style.mixBlendMode='color'; tint.style.opacity='.78'; break;
  }
}

/* ── inject styles — neutralize awara-lens.js + smooth transitions ── */
['cv-deco-v9','cv-deco-v10','cv-deco-v11','cv-deco-v12','cv-deco-v14','cv-deco-v15','cv-deco-v16'].forEach(function(id){var o=document.getElementById(id);if(o)o.remove();});
var sid='cv-deco-v17';
if(!document.getElementById(sid)){
  var st=document.createElement('style'); st.id=sid;
  st.textContent=[
    /* neutralize [data-alv] rules from awara-lens.js */
    '#deck .mcard[data-alv]{background:none !important;border-color:transparent !important;box-shadow:none !important}',
    '#deck .mcard[data-alv] .gl{opacity:unset !important;filter:unset !important;border:none !important;box-shadow:none !important}',
    '#deck .mcard[data-alv] .nm{opacity:unset !important;color:unset !important;text-shadow:none !important}',
    /* smooth transitions on animatable properties */
    '#deck .mcard{transform:none !important;transition:border-color .5s ease,border-width .5s ease,box-shadow .6s ease,background .6s ease,border-radius .5s ease !important}',
    '#deck .mcard .gl{transition:opacity .5s ease,filter .5s ease,box-shadow .5s ease,border-color .5s ease !important}',
    '#deck .mcard .nm{transition:color .45s ease,text-shadow .55s ease !important}',
    '#deck .mcard .el{transition:color .45s ease,opacity .45s ease !important}',
    '#deck .mcard .lv-badge{transition:color .45s ease,background .45s ease,border-color .45s ease,box-shadow .45s ease !important}',
    /* hide legacy bottom ladder (<i> from renderDeck/decorateDeck) — single 6-dot row only */
    '#deck .mcard .lens-lad{display:none!important}',
    /* card-level level indicator (NOT on lens orb) */
    '#deck .mcard .cv-lv-band{position:absolute;top:0;left:0;right:0;height:3px;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:3;background:rgba(255,255,255,.03)}',
    '#deck .mcard .cv-lv-band::after{content:"";display:block;height:100%;width:var(--cv-fill,16.6%);background:linear-gradient(90deg,var(--cv-c1,rgba(201,168,76,.42)),var(--cv-c2,rgba(123,98,201,.24)));opacity:.72;transition:width .55s ease,opacity .55s ease}',
    '#deck .mcard[data-cv-lv="4"] .cv-lv-band::after,#deck .mcard[data-cv-lv="5"] .cv-lv-band::after,#deck .mcard[data-cv-lv="6"] .cv-lv-band::after{opacity:.88}',
    '#deck .mcard .cv-lv-crest{display:flex;justify-content:center;align-items:center;gap:5px;margin:6px 0 7px;pointer-events:none;min-height:14px}',
    '#deck .mcard .cv-lv-crest::before,#deck .mcard .cv-lv-crest::after{content:"";flex:1;max-width:28%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)}',
    '#deck .mcard .cv-lv-crest .cv-crest-node{flex:0 0 7px;width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);transition:background .45s ease,border-color .45s ease,box-shadow .45s ease,transform .45s ease}',
    '#deck .mcard .cv-lv-crest .cv-crest-node.on{background:linear-gradient(145deg,var(--cv-c1,rgba(201,168,76,.24)),var(--cv-c2,rgba(123,98,201,.14)));border-color:rgba(255,255,255,.12)}',
    '#deck .mcard .cv-lv-crest .cv-crest-node.cur{transform:scale(1.15);box-shadow:0 0 5px var(--cv-c1,rgba(201,168,76,.22));border-color:rgba(244,227,176,.32);background:linear-gradient(145deg,var(--cv-c1,rgba(201,168,76,.34)),var(--cv-c2,rgba(123,98,201,.18)))}',
    '#deck .mcard[data-cv-lv="5"] .cv-lv-crest .cv-crest-node.cur{box-shadow:0 0 6px var(--cv-c1,rgba(201,168,76,.26))}',
    '#deck .mcard[data-cv-lv="6"] .cv-lv-crest .cv-crest-node.cur{transform:scale(1.2);box-shadow:0 0 7px var(--cv-c1,rgba(201,168,76,.28)),0 0 3px var(--cv-c3,rgba(244,227,176,.16))}',
    /* ── Космическая card only ── */
    '#deck .mcard[data-cv-cosmic="1"] .cv-lv-band::after{background:linear-gradient(90deg,var(--cv-c3,#3aa8d6),var(--cv-c2,#c24a8a),var(--cv-c1,#1a0d3a))}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-cosmic-lv{display:block;font-family:"JetBrains Mono",monospace;font-size:7.5px;letter-spacing:.12em;text-transform:uppercase;text-align:center;margin:0 0 5px;pointer-events:none;color:var(--cv-c3,#3aa8d6);opacity:.88;transition:color .45s ease,opacity .45s ease,text-shadow .5s ease}',
    '#deck .mcard[data-cv-cosmic="1"][data-cv-lv="1"] .cv-cosmic-lv{color:#a8b8d0;opacity:.92}',
    '#deck .mcard[data-cv-cosmic="1"][data-cv-lv="5"] .cv-cosmic-lv,#deck .mcard[data-cv-cosmic="1"][data-cv-lv="6"] .cv-cosmic-lv{text-shadow:0 0 8px var(--cv-c3,rgba(58,168,214,.35))}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-lv-crest{position:relative;gap:4px;margin:4px 0 8px}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-lv-crest::before,#deck .mcard[data-cv-cosmic="1"] .cv-lv-crest::after{background:linear-gradient(90deg,transparent,rgba(58,168,214,.18),rgba(194,74,138,.12),transparent)}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-crest-node{border-radius:1px;transform:rotate(45deg);width:6px;height:6px;background:rgba(58,168,214,.12);border-color:rgba(194,74,138,.18)}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-crest-node.on{background:linear-gradient(145deg,var(--cv-c3,rgba(58,168,214,.42)),var(--cv-c2,rgba(194,74,138,.28)));border-color:rgba(180,210,240,.22)}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-crest-node.cur{transform:rotate(45deg) scale(1.4);border-color:rgba(200,230,255,.45);box-shadow:0 0 7px var(--cv-c3,rgba(58,168,214,.45)),0 0 3px var(--cv-c2,rgba(194,74,138,.30))}',
    '#deck .mcard[data-cv-cosmic="1"][data-cv-lv="6"] .cv-crest-node.cur{box-shadow:0 0 9px var(--cv-c3,rgba(58,168,214,.50)),0 0 4px var(--cv-c2,rgba(194,74,138,.35)),0 0 12px rgba(255,255,255,.08)}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-cosmic-nebula{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;opacity:var(--cv-neb-op,.2);background:radial-gradient(ellipse 85% 65% at 18% 12%,var(--cv-c2-a,rgba(194,74,138,.2)) 0%,transparent 52%),radial-gradient(ellipse 75% 55% at 82% 78%,var(--cv-c3-a,rgba(58,168,214,.18)) 0%,transparent 54%);transition:opacity .6s ease}',
    '#deck .mcard[data-cv-cosmic="1"] .cv-pattern{mix-blend-mode:screen}',
    /* ── Космическая lens orb (.gl) — dedicated L1→L6 layers ── */
    '#deck .mcard .gl[data-cv-cosmic-lens="1"]{position:relative!important;overflow:hidden!important;transform:none!important;width:56px!important;height:56px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 8px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-layer{position:absolute;inset:0;border-radius:50%;pointer-events:none;transition:opacity .55s ease,filter .55s ease,transform .55s ease}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-sky{z-index:0;background:radial-gradient(circle at 50% 42%,#1a1830 0%,#0a0814 68%,#04030a 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="2"] .cv-cl-sky{background:radial-gradient(circle at 48% 38%,#1e1a36 0%,#0c0a18 62%,#05040c 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-sky{background:radial-gradient(circle at 50% 35%,#221e42 0%,#100e1e 58%,#06050f 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-sky{background:radial-gradient(circle at 50% 32%,#282450 0%,#12101f 55%,#05040e 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-sky{background:radial-gradient(circle at 50% 28%,#2e2858 0%,#141228 52%,#04030c 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-sky{background:radial-gradient(circle at 50% 25%,#342e62 0%,#16142c 48%,#03020a 100%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-nebula{z-index:1;opacity:0;mix-blend-mode:screen;background:radial-gradient(ellipse 85% 65% at 28% 22%,var(--cv-cl-c2,rgba(194,74,138,.55)) 0%,transparent 56%),radial-gradient(ellipse 75% 55% at 78% 72%,var(--cv-cl-c3,rgba(58,168,214,.45)) 0%,transparent 54%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="2"] .cv-cl-nebula{opacity:.08}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-nebula{opacity:.28}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-nebula{opacity:.50}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-nebula{opacity:.70}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-nebula{opacity:.88}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-rays{z-index:2;opacity:0;mix-blend-mode:screen;background:repeating-conic-gradient(from 0deg at 50% 50%,transparent 0deg 7deg,var(--cv-cl-c3,rgba(58,168,214,.85)) 7deg 8deg,transparent 8deg 15deg,var(--cv-cl-c2,rgba(194,74,138,.55)) 15deg 16deg)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-rays{opacity:.18}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-rays{opacity:.36}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-rays{opacity:.54;animation:cvClSpin 28s linear infinite}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-rays{opacity:.72;animation:cvClSpin 16s linear infinite}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-stars{z-index:3;opacity:0;background-image:radial-gradient(1px 1px at 18% 24%,rgba(255,255,255,.9) 50%,transparent 51%),radial-gradient(1px 1px at 72% 18%,rgba(200,230,255,.75) 50%,transparent 51%),radial-gradient(1px 1px at 44% 68%,rgba(255,255,255,.65) 50%,transparent 51%),radial-gradient(1px 1px at 82% 58%,rgba(180,210,255,.55) 50%,transparent 51%),radial-gradient(1.2px 1.2px at 30% 78%,rgba(255,255,255,.8) 50%,transparent 51%),radial-gradient(1px 1px at 58% 38%,rgba(220,240,255,.6) 50%,transparent 51%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="1"] .cv-cl-stars{opacity:.06}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="2"] .cv-cl-stars{opacity:.12}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-stars{opacity:.28}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-stars{opacity:.48}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-stars{opacity:.66}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-stars{opacity:.88}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .lens-orb-img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:4!important;transition:opacity .5s ease,filter .5s ease!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-tint{z-index:5}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-core{z-index:6;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.95) 0%,var(--cv-cl-c3,rgba(58,168,214,.75)) 12%,var(--cv-cl-c2,rgba(194,74,138,.35)) 28%,transparent 58%)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-core{opacity:.14}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-core{opacity:.30}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-core{opacity:.50;animation:cvClPulse 3.2s ease-in-out infinite}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-core{opacity:.78;animation:cvClPulse 2.2s ease-in-out infinite}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-orbit{z-index:7;opacity:0;border:1px solid transparent;border-radius:50%;box-sizing:border-box}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-orbit{opacity:.42;inset:5px;border-color:rgba(58,168,214,.22);box-shadow:0 0 5px rgba(58,168,214,.12)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-orbit{opacity:.68;inset:3px;border-color:rgba(194,74,138,.36);box-shadow:0 0 10px rgba(194,74,138,.24),inset 0 0 8px rgba(58,168,214,.14);animation:cvClSpin 22s linear infinite reverse}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-orbit{opacity:.92;inset:2px;border-width:1.5px;border-color:rgba(200,230,255,.52);box-shadow:0 0 14px rgba(58,168,214,.36),0 0 6px rgba(194,74,138,.28);animation:cvClSpin 12s linear infinite}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-lv-ring{z-index:8;position:absolute;inset:0;opacity:0;transition:opacity .45s ease}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-lv-dot{left:50%;top:50%;margin-left:-1.5px;margin-top:-1.5px;transition:background .45s ease,box-shadow .45s ease,transform .45s ease}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-lv-ring,#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-lv-ring,#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-lv-ring,#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-lv-ring{opacity:1}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .cv-cl-lv-mark{font-family:"JetBrains Mono",monospace;font-size:6px;letter-spacing:.08em;line-height:1;color:rgba(160,170,190,.38);text-shadow:none;position:absolute;bottom:5px;left:50%;transform:translateX(-50%);z-index:9;pointer-events:none;transition:color .45s ease,text-shadow .5s ease,opacity .45s ease}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .cv-cl-lv-mark{color:rgba(180,200,220,.50)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .cv-cl-lv-mark{color:rgba(190,210,235,.62)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .cv-cl-lv-mark,#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .cv-cl-lv-mark{color:var(--cv-cl-c3,#3aa8d6);text-shadow:0 0 8px rgba(58,168,214,.42)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"] .lens-orb-gl{position:relative!important;z-index:10!important;font-size:15px!important;line-height:1!important;transition:opacity .45s ease,filter .45s ease,text-shadow .5s ease,font-size .45s ease!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="1"] .lens-orb-gl{opacity:.50;filter:grayscale(.45) brightness(.72)}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="2"] .lens-orb-gl{opacity:.44;filter:grayscale(.35) brightness(.76);font-size:16px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .lens-orb-gl{opacity:.36;filter:grayscale(.15) brightness(.82);font-size:17px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .lens-orb-gl{opacity:.24;font-size:18px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .lens-orb-gl{opacity:.14;font-size:18px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .lens-orb-gl{opacity:.08;font-size:17px!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="1"] .lens-orb-img{opacity:.20!important;filter:grayscale(.72) brightness(.48) contrast(.86)!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="2"] .lens-orb-img{opacity:.30!important;filter:grayscale(.55) brightness(.58) saturate(.72)!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="3"] .lens-orb-img{opacity:.52!important;filter:grayscale(.18) brightness(.78) saturate(.95)!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="4"] .lens-orb-img{opacity:.72!important;filter:brightness(.92) saturate(1.14) drop-shadow(0 0 8px rgba(58,168,214,.24))!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="5"] .lens-orb-img{opacity:.88!important;filter:brightness(1.06) saturate(1.28) drop-shadow(0 0 14px rgba(194,74,138,.32)) drop-shadow(0 0 8px rgba(58,168,214,.28))!important}',
    '#deck .mcard .gl[data-cv-cosmic-lens="1"][data-cv-cl-lv="6"] .lens-orb-img{opacity:1!important;filter:brightness(1.14) saturate(1.42) contrast(1.04) drop-shadow(0 0 20px rgba(58,168,214,.48)) drop-shadow(0 0 10px rgba(194,74,138,.36)) drop-shadow(0 0 4px rgba(255,255,255,.22))!important}',
    '@keyframes cvClSpin{to{transform:rotate(360deg)}}',
    '@keyframes cvClPulse{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}',
    /* deco elements */
    '.cv-tint{position:absolute;inset:0;border-radius:50%;pointer-events:none;z-index:1;transition:background .5s ease,opacity .5s ease}',
    '.cv-frame{position:absolute;pointer-events:none;z-index:0;border:0 solid transparent;background-repeat:no-repeat;transition:border-color .45s ease,box-shadow .5s ease}',
    '.cv-pattern{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0;transition:opacity .55s ease}',
    /* ── light-burst overlay ── */
    '.cv-burst{position:absolute;inset:0;pointer-events:none;z-index:15;opacity:0;border-radius:inherit}',
    '@keyframes cvBurst{0%{opacity:0;transform:scale(.85)}15%{opacity:.75;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}'
  ].join('\n');
  document.head.appendChild(st);
}

/* ── restore central Istok orb (undo any prior tier overrides) ── */
function restoreCentralOrb(){
  var wrap=document.querySelector('#s-istok .orb-wrap');
  if(wrap){
    wrap.removeAttribute('data-orb-lv');
    var orb=wrap.querySelector('#awaraHeartOrb')||wrap.querySelector('.orb');
    if(orb){
      orb.style.removeProperty('filter');
      orb.style.removeProperty('box-shadow');
      orb.style.removeProperty('opacity');
    }
  }
  var lad=document.getElementById('istokOrbLad');
  if(lad&&lad.parentNode) lad.parentNode.removeChild(lad);
}

/* ── ensure decorative DOM ── */
function ensureDeco(card){
  var f=card.querySelector('.cv-frame');
  if(!f){f=document.createElement('div');f.className='cv-frame';card.appendChild(f);}
  var p=card.querySelector('.cv-pattern');
  if(!p){p=document.createElement('div');p.className='cv-pattern';card.appendChild(p);}
  var b=card.querySelector('.cv-burst');
  if(!b){b=document.createElement('div');b.className='cv-burst';card.appendChild(b);}
  return{frame:f,pattern:p,burst:b};
}

/* ── fire light-burst on a card ── */
function fireBurst(card,c1,c2){
  var b=card.querySelector('.cv-burst');
  if(!b) return;
  /* radial glow in tradition color */
  b.style.background='radial-gradient(ellipse at 50% 40%,'+rgba(c1,.85)+' 0%,'+rgba(c2,.35)+' 40%,transparent 72%)';
  /* restart animation */
  b.style.animation='none';
  void b.offsetWidth; /* reflow */
  b.style.animation='cvBurst .45s ease-out forwards';
}

/* ── corner accents ── */
function setCorners(fr,color,sz){
  var g='linear-gradient('+color+','+color+')';
  var s=sz+'px',w='1.5px';
  fr.style.backgroundImage=[g,g,g,g,g,g,g,g].join(',');
  fr.style.backgroundSize=[s+' '+w,w+' '+s,s+' '+w,w+' '+s,s+' '+w,w+' '+s,s+' '+w,w+' '+s].join(',');
  fr.style.backgroundPosition=['top left','top left','top right','top right','bottom left','bottom left','bottom right','bottom right'].join(',');
}
function clearCorners(fr){fr.style.backgroundImage='none';}

/* ── remove stale orb markers (legacy cv-lv-sigil) ── */
function clearOrbMarkers(gl){
  if(!gl) return;
  var sig=gl.querySelector('.cv-lv-sigil');
  if(sig) sig.remove();
}

var LV_STEPS=6;

function ensureLevelUI(card){
  var bands=card.querySelectorAll('.cv-lv-band');
  var bi;
  for(bi=1;bi<bands.length;bi++) bands[bi].remove();
  var band=bands[0];
  if(!band){ band=document.createElement('div'); band.className='cv-lv-band'; card.insertBefore(band,card.firstChild); }

  var crests=card.querySelectorAll('.cv-lv-crest');
  for(bi=1;bi<crests.length;bi++) crests[bi].remove();
  var crest=crests[0];
  if(!crest){
    crest=document.createElement('div');
    crest.className='cv-lv-crest';
    crest.setAttribute('data-cv-steps',String(LV_STEPS));
    var nm=card.querySelector('.nm');
    if(nm&&nm.nextSibling) card.insertBefore(crest,nm.nextSibling);
    else card.appendChild(crest);
  }
  return {band:band,crest:crest};
}

function paintCrestDots(crest,lv){
  crest.innerHTML='';
  var ni,node,ncls;
  for(ni=0;ni<LV_STEPS;ni++){
    node=document.createElement('span');
    ncls='cv-crest-node';
    if(ni+1<=lv) ncls+=' on';
    if(ni+1===lv) ncls+=' cur';
    node.className=ncls;
    node.setAttribute('data-lv',String(ni+1));
    node.title='L'+(ni+1);
    crest.appendChild(node);
  }
}

function paintCardLevelUI(card,lv,c1,c2,c3){
  var ui=ensureLevelUI(card);
  ui.band.style.setProperty('--cv-fill',(lv/LV_STEPS*100)+'%');
  ui.band.style.setProperty('--cv-c1',c1);
  ui.band.style.setProperty('--cv-c2',c2);
  ui.band.style.setProperty('--cv-c3',c3);
  ui.crest.style.setProperty('--cv-c1',c1);
  ui.crest.style.setProperty('--cv-c2',c2);
  ui.crest.style.setProperty('--cv-c3',c3);
  paintCrestDots(ui.crest,lv);
  styleLvBadge(card,lv,c1,c2,c3);
}

function styleLvBadge(card,lv,c1,c2,c3){
  var lb=card.querySelector('.lv-badge');
  if(!lb) return;
  lb.style.setProperty('color',lv>=5?rgba(c3,.82):lv>=3?rgba(c1,.78):rgba(c3,.62),'important');
  lb.style.setProperty('background',rgba(c1,.03+lv*.018),'important');
  lb.style.setProperty('border-color',rgba(c1,.08+lv*.04),'important');
  if(lv>=4) lb.style.setProperty('box-shadow','0 0 '+(3+lv)+'px '+rgba(c1,.08+lv*.03),'important');
  else lb.style.removeProperty('box-shadow');
}

function paintCosmicLevelUI(card,lv,c1,c2,c3){
  var ui=ensureLevelUI(card);
  ui.band.style.setProperty('--cv-fill',(lv/LV_STEPS*100)+'%');
  ui.band.style.setProperty('--cv-c1',c1);
  ui.band.style.setProperty('--cv-c2',c2);
  ui.band.style.setProperty('--cv-c3',c3);
  ui.crest.style.setProperty('--cv-c1',c1);
  ui.crest.style.setProperty('--cv-c2',c2);
  ui.crest.style.setProperty('--cv-c3',c3);
  var tag=card.querySelector('.cv-cosmic-lv');
  if(!tag){
    tag=document.createElement('span');
    tag.className='cv-cosmic-lv';
    card.insertBefore(tag,ui.crest);
  }
  var lvn=COSMIC_LV_NAMES[lv]||'';
  tag.textContent='L'+lv+(lvn?' \u00b7 '+lvn:'');
  paintCrestDots(ui.crest,lv);
  var lb=card.querySelector('.lv-badge');
  if(lb){
    lb.style.setProperty('color',lv>=5?rgba(c3,.92):lv>=3?rgba(c3,.82):'#9eb0c8','important');
    lb.style.setProperty('background',rgba(c2,.06+lv*.02),'important');
    lb.style.setProperty('border-color',rgba(c3,.14+lv*.05),'important');
    if(lv>=4) lb.style.setProperty('box-shadow','0 0 '+(4+lv)+'px '+rgba(c3,.12+lv*.04),'important');
    else lb.style.removeProperty('box-shadow');
  }
}

function applyCosmicLevel(card,lv,pal,deco,gl,nm,el,pt,ga,bst,rad,csz){
  var ct=COSMIC_TIER[lv]||COSMIC_TIER[1];
  var cc=cosmicPalette(pal);
  var c1=cc[0],c2=cc[1],c3=cc[2];
  var cs=card.style;

  card.setAttribute('data-cv-cosmic','1');
  ensureCosmicNebula(card,lv,c2,c3,ct.nebOp);

  if(gl){
    clearOrbMarkers(gl);
    ensureCosmicLens(gl,lv,c1,c2,c3);
  }

  if(lv===1) cs.setProperty('border','1px solid '+rgba(c3,.20),'important');
  else cs.setProperty('border',bdW(bst,lv)+'px '+bst+' '+rgba(c3,ct.borderA),'important');

  cs.setProperty('background',cosmicTierBg(lv,c1,c2,c3),'important');
  cs.setProperty('box-shadow',cosmicTierShadow(lv,c1,c2,c3),'important');

  var txt=cosmicTierText(lv,c2,c3);
  nm.style.setProperty('color',txt.color,'important');
  nm.style.setProperty('text-shadow',txt.shadow,'important');
  nm.style.setProperty('opacity','1','important');

  if(el){
    el.style.setProperty('opacity',lv<=1?'0.90':lv<=2?'0.94':'1','important');
    el.style.setProperty('color',lv<=1?'#8fa0b8':lv<=2?'#9aaec4':'','important');
  }

  var fr=deco.frame;
  fr.style.borderWidth='0';
  fr.style.boxShadow='none';
  clearCorners(fr);
  if(ct.frameA>0){
    fr.style.borderWidth='1px';
    fr.style.borderColor=rgba(c3,ct.frameA);
    if(ct.frameGlow==='soft') fr.style.boxShadow='inset 0 0 16px '+rgba(c3,.08)+',0 0 6px '+rgba(c2,.05);
    if(ct.frameGlow==='bright') fr.style.boxShadow='inset 0 0 20px '+rgba(c3,.12)+',0 0 10px '+rgba(c2,.08);
  }
  if(ct.corners) setCorners(fr,rgba(c3,lv>=6?.75:.50),lv>=6?csz+4:csz);

  if(pt!=='none'&&ct.patO>0){
    var pat=mkPat(pt,c1,c2,ct.patA);
    deco.pattern.style.opacity=String(ct.patO);
    deco.pattern.style.background=pat.bg;
    if(pat.sz) deco.pattern.style.backgroundSize=pat.sz;
  }

  paintCosmicLevelUI(card,lv,c1,c2,c3);
}

/* ══════════════════════════════════════════════════════════════
   setLevel — apply tier visuals (TIER drives dramatic L1→L6 ascent)
   ══════════════════════════════════════════════════════════════ */
function setLevel(card,key,alv){
  var nm=card.querySelector('.nm');
  if(!nm) return;

  var lv=Math.max(1,Math.min(6,alv|0));
  var isCosmic=(key===COSMIC_KEY);
  if(!isCosmic) stripCosmic(card);

  var t=TIER[lv];

  var pal=null;
  try{if(typeof window.lensPalette==='function') pal=window.lensPalette(key);}catch(e){}
  var c1=(pal&&pal[0])||'#c9a84c';
  var c2=(pal&&pal[1])||'#7b62c9';
  var c3=(pal&&pal[2])||'#f4e3b0';

  var L=LORE[key]||DEF_LORE;
  var bst=L[0], rad=L[1], ga=L[2], pt=L[3], csz=L[4];

  var gl=card.querySelector('.gl');
  var cs=card.style;
  var deco=ensureDeco(card);

  card.setAttribute('data-cv-lv',String(lv));

  if(isCosmic){
    applyCosmicLevel(card,lv,pal,deco,gl,nm,card.querySelector('.el'),pt,ga,bst,rad,csz);
    return;
  }

  /* ═══════ LENS ORB (.gl) — visual only, no L1-L6 markers ═══════ */
  if(gl){
    clearOrbMarkers(gl);
    gl.style.setProperty('position','relative','important');
    var tint=gl.querySelector('.cv-tint');
    if(!tint){tint=document.createElement('div');tint.className='cv-tint';gl.appendChild(tint);}
    var orbBw=lv>=6?3:lv>=5?2.5:lv>=4?2:lv>=3?1.5:lv>=2?1:0;
    if(orbBw>0){
      gl.style.setProperty('border',orbBw+'px solid '+rgba(c1,lv>=5?.72:t.borderA+.14),'important');
      gl.style.setProperty('box-shadow','0 0 '+(6+lv*3)+'px '+rgba(c1,.08+lv*.05)+(lv>=4?',0 0 '+(3+lv)+'px '+rgba(c2,.06+lv*.03):''),'important');
    }else{
      gl.style.setProperty('border','1px solid rgba(255,255,255,.10)','important');
      gl.style.setProperty('box-shadow','none','important');
    }
    gl.style.setProperty('transform','none','important');
    applyOrbTint(tint,t.tintMode,c1,c2,c3,ga);
    gl.style.setProperty('opacity',String(t.orbOp),'important');
    gl.style.setProperty('filter',t.orbFilt,'important');
  }

  /* ═══════ CARD BODY — fixed size, no scale ═══════ */
  cs.setProperty('transform','none','important');
  cs.setProperty('position','relative','important');
  cs.setProperty('border-radius',rad+'px','important');

  var fr=deco.frame;
  var fi=rad>14?6:rad>6?5:4;
  fr.style.inset=fi+'px';
  fr.style.borderRadius=Math.max(0,rad-fi)+'px';
  fr.style.borderColor='transparent';
  fr.style.borderWidth='0';
  fr.style.borderStyle='solid';
  fr.style.boxShadow='none';
  clearCorners(fr);
  deco.pattern.style.opacity='0';
  deco.pattern.style.background='none';
  deco.pattern.style.backgroundSize='';
  deco.pattern.style.borderRadius=rad+'px';

  if(lv===1){
    cs.setProperty('border','1px solid rgba(255,255,255,'+t.borderA+')','important');
  }else{
    var bw=bdW(bst,lv);
    cs.setProperty('border',bw+'px '+bst+' '+rgba(c1,t.borderA),'important');
  }

  cs.setProperty('background',tierBg(t.bgKey,ga,c1,c2,c3),'important');
  cs.setProperty('box-shadow',tierShadow(t.shadowKey,c1,c2,c3),'important');

  var txt=tierText(t.textKey,c1,c2,c3);
  nm.style.setProperty('color',txt.color,'important');
  nm.style.setProperty('text-shadow',txt.shadow,'important');

  if(t.frameA>0){
    fr.style.borderWidth='1px';
    fr.style.borderColor=rgba(c1,t.frameA);
    if(t.frameGlow==='soft') fr.style.boxShadow='inset 0 0 14px '+rgba(c1,.07);
    if(t.frameGlow==='bright') fr.style.boxShadow='inset 0 0 18px '+rgba(c1,.10)+',0 0 8px '+rgba(c1,.06);
  }

  if(t.corners) setCorners(fr,rgba(c1,lv>=6?.82:.58),lv>=6?csz+4:csz);

  if(pt!=='none'&&t.patO>0){
    var pat=mkPat(pt,c1,c2,t.patA);
    deco.pattern.style.opacity=String(t.patO);
    deco.pattern.style.background=pat.bg;
    if(pat.sz) deco.pattern.style.backgroundSize=pat.sz;
  }

  nm.style.setProperty('opacity','1','important');
  var el=card.querySelector('.el');
  if(el){
    el.style.setProperty('opacity',lv<=1?'0.82':lv<=2?'0.88':'1','important');
    el.style.setProperty('color',lv<=1?rgba(c3,.58):lv<=2?rgba(c3,.66):'','important');
  }
  paintCardLevelUI(card,lv,c1,c2,c3);
}

/* ══════════════════════════════════════════════════════════════
   applyCardVisuals — instant style swap, CSS transitions do the rest
   ══════════════════════════════════════════════════════════════ */
function applyCardVisuals(){
  var cards=document.querySelectorAll('#deck .mcard');
  if(!cards.length) return;

  cards.forEach(function(card){
    var nm=card.querySelector('.nm');
    if(!nm) return;
    var key=nm.textContent;

    var alv=1;
    try{
      if(window.__deckLvPreview>0) alv=window.__deckLvPreview;
      else if(window.AwaraAscension&&AwaraAscension.level) alv=AwaraAscension.level(key);
    }catch(e){}

    /* always apply — guards against decorateDeck overrides */
    setLevel(card,key,alv);
  });
}

/* ── scheduling ── */
var _pending=0;
function scheduleApply(){
  if(_pending) return;
  _pending=1;
  requestAnimationFrame(function(){applyCardVisuals();_pending=0;});
}

var deck=document.getElementById('deck');
if(deck){
  var mo=new MutationObserver(scheduleApply);
  mo.observe(deck,{childList:true,subtree:true,attributes:true});
}
try{
  if(typeof window.decorateDeck==='function'&&!window.decorateDeck.__cvWrap){
    var _dd=window.decorateDeck;
    window.decorateDeck=function(){
      var r=_dd.apply(this,arguments);
      scheduleApply();
      return r;
    };
    window.decorateDeck.__cvWrap=true;
  }
}catch(e){}

/* Capture click BEFORE the button's onclick fires.
   Suppress decorateDeck (paintOrb → flash), apply our styles + light burst. */
document.addEventListener('click',function(e){
  if(!e.target.closest('#lvTestBtns')) return;

  var origDD=window.decorateDeck;
  var origRD=window.renderDeck;
  window.decorateDeck=function(){};
  window.renderDeck=function(){};

  /* Restore originals + apply our visuals + fire bursts after onclick sets __deckLvPreview */
  setTimeout(function(){
    window.decorateDeck=origDD;
    window.renderDeck=origRD;

    /* fire light-burst on every card */
    var cards=document.querySelectorAll('#deck .mcard');
    cards.forEach(function(card){
      var nm=card.querySelector('.nm');
      if(!nm) return;
      var key=nm.textContent;
      var pal=null;
      try{if(typeof window.lensPalette==='function') pal=window.lensPalette(key);}catch(e){}
      var c1=(pal&&pal[0])||'#c9a84c';
      var c2=(pal&&pal[1])||'#7b62c9';
      fireBurst(card,c1,c2);
    });

    applyCardVisuals();
  },0);
},true); /* capturing phase */

restoreCentralOrb();
setTimeout(applyCardVisuals,500);
setTimeout(applyCardVisuals,2000);
setTimeout(restoreCentralOrb,300);
setTimeout(restoreCentralOrb,2500);

window._applyCardVisuals=applyCardVisuals;
window._restoreCentralOrb=restoreCentralOrb;
console.log('[VISUALS] awara-card-visuals.js v17 — Космическая monotonic lens');
})();
