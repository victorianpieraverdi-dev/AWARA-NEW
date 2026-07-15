/* AWARA Heart of the Source - rotating static images in the Istok orb.
   Cycles heart_A..F every 30s (wall-clock). Black-hole / gravitational-lens
   vibe: crisp center, glow halo + a real backdrop lens that bleeds past the
   orb edges and bends the surroundings; slow accretion swirl at the rim.
   v6: center fully sharp, blur/lens lives outside the orb.
   Claims the Istok .orb-wrap (sets data-lo-sym) so awara-light-orb.js
   does not overwrite it with its SVG symbol, regardless of load order. */
(function(){
  "use strict";
  var IMGS=[
    'hero_orbs/vedic.webp','hero_orbs/egyptian.webp','hero_orbs/kabbalistic.webp',
    'hero_orbs/mayan.webp','hero_orbs/slavic.webp','hero_orbs/norse.webp',
    'hero_orbs/daoist.webp','hero_orbs/gnostic.webp','hero_orbs/shinto.webp',
    'hero_orbs/celtic.webp','hero_orbs/shambhala.webp','hero_orbs/julian_byzantine.webp',
    'hero_orbs/shamanic.webp','hero_orbs/gene_keys.webp','hero_orbs/technomagical.webp',
    'hero_orbs/cosmic_galactic.webp','hero_orbs/antique_greco_roman.webp','hero_orbs/zoroastrian.webp',
    'hero_orbs/islamic_sufi_nur.webp','hero_orbs/aztec_mexica.webp','hero_orbs/christian_mystical_grail.webp',
    'hero_orbs/yoruba_ifa_orisha.webp','hero_orbs/sumerian_babylonian.webp','hero_orbs/hermetic_alchemical.webp',
    'hero_orbs/tarot_arcanic.webp','hero_orbs/astrological.webp','hero_orbs/chinese_iching.webp',
    'hero_orbs/tantric_kashmiri.webp','hero_orbs/buddhist_mahayana.webp','hero_orbs/afro_dogon.webp',
    'hero_orbs/atlantean_lemurian.webp','hero_orbs/posthuman_ai_sophianic.webp','hero_orbs/advaita_siddha.webp'
  ];
  var PERIOD=14000;
  var layA=null, layB=null, topLay=null, shownIdx=-1;

  function styleOnce(){
    if(document.getElementById('awara-heart-style')) return;
    var st=document.createElement('style');
    st.id='awara-heart-style';
    st.textContent=[
      /* orb gravity: gentle inhale with a slight twist */
      '#awaraHeartOrb{animation:ahPull 8s ease-in-out infinite !important}',
      '@keyframes ahPull{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(.965) rotate(2deg)}}',
      /* images: crisp; only a tiny blur during the spiral swap */
      '.awara-heart-img{opacity:0}',
      '.awara-heart-img.ah-in{animation:ahIn 1.9s cubic-bezier(.22,.61,.36,1) both}',
      '.awara-heart-img.ah-out{animation:ahOut 1.9s cubic-bezier(.55,.06,.68,.19) both}',
      '@keyframes ahIn{0%{opacity:0;transform:scale(.34) rotate(-140deg);filter:blur(1.4px)}55%{opacity:1}100%{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}}',
      '@keyframes ahOut{0%{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}100%{opacity:0;transform:scale(.28) rotate(155deg);filter:blur(1.8px)}}',
      /* glow halo: soft light bleeding well past the orb edges */
      '#awaraHeartOrb .ah-halo{position:absolute;inset:-36px;border-radius:50%;pointer-events:none;z-index:1;mix-blend-mode:screen;filter:blur(11px);background:radial-gradient(circle at 50% 50%,rgba(157,134,224,.3) 0%,rgba(123,98,201,.16) 40%,rgba(255,210,122,.1) 60%,transparent 78%);animation:ahHalo 8s ease-in-out infinite}',
      '@keyframes ahHalo{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}',
      /* faint swirl streaks at the rim, counter-rotating */
      '#awaraHeartOrb .ah-swirl{position:absolute;inset:-6px;border-radius:50%;pointer-events:none;z-index:4;mix-blend-mode:screen;opacity:.3;background:conic-gradient(from 0deg,rgba(255,255,255,0) 0deg,rgba(200,180,255,.16) 24deg,rgba(255,255,255,0) 60deg,rgba(255,255,255,0) 180deg,rgba(255,235,170,.14) 210deg,rgba(255,255,255,0) 250deg,rgba(255,255,255,0) 360deg);-webkit-mask:radial-gradient(closest-side,transparent 62%,#000 70%);mask:radial-gradient(closest-side,transparent 62%,#000 70%);animation:ahSpinRev 19s linear infinite}',
      /* accretion disk: hot ring sitting just outside the rim, slow */
      '#awaraHeartOrb .ah-disk{position:absolute;inset:-16px;border-radius:50%;pointer-events:none;z-index:5;mix-blend-mode:screen;background:conic-gradient(from 0deg,rgba(123,98,201,0) 0deg,rgba(157,134,224,.36) 28deg,rgba(255,235,170,.55) 58deg,rgba(255,210,122,.2) 110deg,rgba(123,98,201,0) 185deg,rgba(157,134,224,.26) 250deg,rgba(255,210,122,.44) 310deg,rgba(123,98,201,0) 360deg);-webkit-mask:radial-gradient(closest-side,transparent 70%,#000 76%);mask:radial-gradient(closest-side,transparent 70%,#000 76%);animation:ahSpin 13s linear infinite}',
      /* gravitational lens: real backdrop blur in a ring past the orb edge,
         bending the surroundings; inner area transparent so center stays crisp */
      '#awaraHeartOrb .ah-lens{position:absolute;inset:-24px;border-radius:50%;pointer-events:none;z-index:6;-webkit-backdrop-filter:blur(3px) saturate(1.18);backdrop-filter:blur(3px) saturate(1.18);-webkit-mask:radial-gradient(closest-side,transparent 56%,#000 66%,#000 84%,transparent 100%);mask:radial-gradient(closest-side,transparent 56%,#000 66%,#000 84%,transparent 100%);animation:ahLens 9s ease-in-out infinite}',
      '@keyframes ahLens{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}',
      '@keyframes ahSpin{to{transform:rotate(360deg)}}',
      '@keyframes ahSpinRev{to{transform:rotate(-360deg)}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function mkLayer(){
    var i=document.createElement('img');
    i.className='awara-heart-img';
    i.alt='';
    i.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;'+
      'border-radius:50%;object-fit:cover;pointer-events:none;z-index:2';
    return i;
  }

  function swapTo(want){
    if(!layA||!layB) return;
    var inc=(topLay===layA)?layB:layA;
    var out=topLay;
    inc.src=IMGS[want];
    inc.classList.remove('ah-in','ah-out');
    inc.style.animation='';inc.style.opacity='';
    void inc.offsetWidth; /* reflow to restart the emerge animation */
    if(out){
      inc.classList.add('ah-in');
      out.classList.remove('ah-in','ah-out');
      out.style.animation='';out.style.opacity='';
      void out.offsetWidth;
      out.classList.add('ah-out');
    } else {
      /* first appearance: show final state instantly, no emerge zoom */
      inc.style.opacity='1';
      inc.style.animation='none';
    }
    topLay=inc;
    shownIdx=want;
  }

  var nextAt=0;
  function applyCurrent(){
    if(!layA||!layB) return;
    var now=Date.now();
    if(shownIdx>=0 && now<nextAt) return;
    var want=Math.floor(Math.random()*IMGS.length);
    if(IMGS.length>1){ var guard=0; while(want===shownIdx && guard++<8){ want=Math.floor(Math.random()*IMGS.length); } }
    nextAt=now+PERIOD;
    swapTo(want);
  }

  function build(wrap){
    wrap.setAttribute('data-heart','1');
    wrap.style.position='relative';
    wrap.style.overflow='visible';
    wrap.innerHTML='<div class="orb" id="awaraHeartOrb" style="width:150px;height:150px;overflow:visible"></div>';
    var orb=wrap.querySelector('#awaraHeartOrb');
    var halo=document.createElement('div'); halo.className='ah-halo';
    orb.appendChild(halo);
    layA=mkLayer(); layB=mkLayer();
    orb.appendChild(layA); orb.appendChild(layB);
    var swirl=document.createElement('div'); swirl.className='ah-swirl';
    var disk=document.createElement('div'); disk.className='ah-disk';
    var lens=document.createElement('div'); lens.className='ah-lens';
    orb.appendChild(swirl); orb.appendChild(disk); orb.appendChild(lens);
    topLay=null; shownIdx=-1;
    applyCurrent();
  }

  function ensure(){
    var s=document.getElementById('s-istok');
    if(!s) return;
    var wrap=s.querySelector('.orb-wrap');
    if(!wrap) return;
    styleOnce();
    /* claim the container so light-orb skips its SVG symbol */
    wrap.setAttribute('data-lo-sym','1');
    if(wrap.getAttribute('data-heart')==='1' && wrap.querySelector('img.awara-heart-img')){
      applyCurrent();
      return;
    }
    build(wrap);
  }

  function boot(){
    ensure();
    setInterval(ensure, 1000);
  }

  if(document.readyState!=='loading'){ boot(); }
  else { document.addEventListener('DOMContentLoaded', boot); }

  window.AwaraHeart={
    ensure:ensure,
    next:function(){
      if(!layA||!layB) return;
      var want=((shownIdx<0?Math.floor(Date.now()/PERIOD):shownIdx)+1)%IMGS.length;
      swapTo(want);
    },
    imgs:IMGS,
    setPeriod:function(ms){ PERIOD=ms; shownIdx=-1; applyCurrent(); },
    __v:6
  };
})();
