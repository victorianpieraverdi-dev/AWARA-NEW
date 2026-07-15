/* ═════════ AWARA · Sacred Cyber-Mystic 3D ═════════
   createSacredNode(type)  — магические сферы-узлы вместо планет
   createHexMap(opts)      — 3D голографическая карта гексо-кристаллов
   Требует: importmap "three"  +  (опц.) глобальный window.gsap
   Импорт:  import { createSacredNode, createHexMap } from './js/awara-sacred-nodes.js'
   Каждый объект имеет .userData.update(t) — вызывайте в animate-лупе. */
import * as THREE from 'three';

const G = (typeof window!=='undefined' && window.gsap) ? window.gsap : {
  to:(t,o)=>{ const skip=['duration','ease','onUpdate','onComplete','delay','overwrite'];
    Object.keys(o).forEach(k=>{ if(!skip.includes(k) && typeof o[k]==='number') t[k]=o[k]; });
    o.onUpdate&&o.onUpdate(); o.onComplete&&o.onComplete(); return {kill(){}}; }
};

/* круглая glow-текстура для точек (иначе PointsMaterial даёт квадраты) */
function makeGlowSprite(){
  const c=document.createElement('canvas'); c.width=c.height=64;
  const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');
  gr.addColorStop(0.4,'rgba(180,220,255,0.6)');
  gr.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c); t.needsUpdate=true; return t;
}

/* общие GLSL-хелперы: 3D value-noise + fBM */
const GLSL_NOISE = `
float vn(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float n=i.x+i.y*57.0+113.0*i.z;
  float a=fract(sin(n)*43758.5453),       b=fract(sin(n+1.0)*43758.5453);
  float c=fract(sin(n+57.0)*43758.5453),  d=fract(sin(n+58.0)*43758.5453);
  float e=fract(sin(n+113.0)*43758.5453), g=fract(sin(n+114.0)*43758.5453);
  float h=fract(sin(n+170.0)*43758.5453), k=fract(sin(n+171.0)*43758.5453);
  return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y), mix(mix(e,g,f.x),mix(h,k,f.x),f.y), f.z);
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=0.5; } return s; }
`;

/* ══════════ САКРАЛЬНЫЕ УЗЛЫ ══════════ */
export function createSacredNode(type){
  const g=new THREE.Group(); g.userData.type=type;
  const upd=[];

  if(type==='game'){
    // Золото-красная бурлящая плазма (fBM) + орбитальные кольца
    const mat=new THREE.ShaderMaterial({ uniforms:{ uTime:{value:0} },
      vertexShader:`varying vec3 vP; varying vec3 vN;
        void main(){ vP=position; vN=normalize(normalMatrix*normal);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: GLSL_NOISE + `
        uniform float uTime; varying vec3 vP; varying vec3 vN;
        void main(){
          float n=fbm(vP*2.2+vec3(0.0,uTime*0.4,uTime*0.25)); n=pow(n,1.4);
          vec3 hot=vec3(1.0,0.85,0.35), red=vec3(0.9,0.18,0.08);
          vec3 col=mix(red,hot,n);
          float fres=pow(1.0-abs(dot(normalize(vN),vec3(0.0,0.0,1.0))),2.0);
          col+=hot*fres*0.8; col*=0.6+0.9*n;
          gl_FragColor=vec4(col,1.0);
        }` });
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.5,64,64),mat); g.add(core);
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.75+i*0.14,0.006,8,180),
        new THREE.MeshBasicMaterial({color:i%2?0xffcf6a:0xff5a2a,transparent:true,opacity:0.5,
          blending:THREE.AdditiveBlending,depthWrite:false}));
      ring.rotation.x=Math.PI/2+i*0.5; ring.rotation.y=i*0.7; g.add(ring);
      upd.push(t=>{ ring.rotation.z=t*(0.3+i*0.2); });
    }
    upd.push(t=>{ mat.uniforms.uTime.value=t; core.rotation.y=t*0.15; });
  }

  else if(type==='chronicle'){
    // Полупрозрачная индиго-сфера с кристаллом-октаэдром внутри
    const shell=new THREE.Mesh(new THREE.SphereGeometry(0.55,48,48),
      new THREE.MeshPhysicalMaterial({color:0x3a3aff,transparent:true,opacity:0.22,
        roughness:0.1,metalness:0.0,transmission:0.9,thickness:0.5,
        emissive:0x1a1a66,emissiveIntensity:0.4}));
    const fill=new THREE.Mesh(new THREE.OctahedronGeometry(0.27,0),
      new THREE.MeshBasicMaterial({color:0x4455cc,transparent:true,opacity:0.25,blending:THREE.AdditiveBlending}));
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),
      new THREE.MeshBasicMaterial({color:0x9ab4ff,wireframe:true,transparent:true,opacity:0.9}));
    g.add(shell,fill,crystal);
    upd.push(t=>{ crystal.rotation.set(t*0.3,t*0.5,0); fill.rotation.copy(crystal.rotation);
      const s=1.0+0.06*Math.sin(t*1.6); crystal.scale.setScalar(s); });
  }

  else if(type==='neural'){
    // Сфера из пульсирующих точек и линий (Constellation / нейросеть)
    const N=90, R=0.55, pts=[], pos=new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const ph=Math.acos(1-2*(i+0.5)/N), th=Math.PI*(1+Math.sqrt(5))*i;
      const v=new THREE.Vector3(Math.sin(ph)*Math.cos(th),Math.sin(ph)*Math.sin(th),Math.cos(ph)).multiplyScalar(R);
      pts.push(v); pos.set([v.x,v.y,v.z],i*3);
    }
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const points=new THREE.Points(pg,new THREE.PointsMaterial({size:0.07,map:makeGlowSprite(),
      color:0x8ad4ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    g.add(points);
    const lp=[];
    for(let i=0;i<N;i++) for(let j=i+1;j<N;j++)
      if(pts[i].distanceTo(pts[j])<0.42) lp.push(pts[i].x,pts[i].y,pts[i].z, pts[j].x,pts[j].y,pts[j].z);
    const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(lp),3));
    const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x4aa3ff,transparent:true,
      opacity:0.25,blending:THREE.AdditiveBlending,depthWrite:false}));
    g.add(lines);
    upd.push(t=>{ g.rotation.y=t*0.12;
      points.material.opacity=0.7+0.3*Math.sin(t*2.0);
      lines.material.opacity=0.18+0.12*Math.sin(t*1.3+1.0); });
  }

  else if(type==='matrix'){
    // Голографический wireframe-додекаэдр, плавно меняющий форму
    const geo=new THREE.DodecahedronGeometry(0.55,0);
    const base=geo.attributes.position.array.slice();
    const wf=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffd27a,wireframe:true,transparent:true,opacity:0.85}));
    const glow=new THREE.Mesh(new THREE.DodecahedronGeometry(0.57,0),
      new THREE.MeshBasicMaterial({color:0xffcf6a,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending}));
    g.add(glow,wf);
    upd.push(t=>{ const p=geo.attributes.position;
      for(let i=0;i<p.count;i++){ const ix=i*3, x=base[ix],y=base[ix+1],z=base[ix+2];
        const d=1.0+0.08*Math.sin(t*1.5+x*3.0+y*2.0+z*1.5);
        p.array[ix]=x*d; p.array[ix+1]=y*d; p.array[ix+2]=z*d; }
      p.needsUpdate=true; g.rotation.y=t*0.25; g.rotation.x=Math.sin(t*0.4)*0.3; });
  }

  g.userData.update=(t)=>{ for(let i=0;i<upd.length;i++) upd[i](t); };
  return g;
}

/* ══════════ 3D ГОЛОГРАФИЧЕСКАЯ КАРТА (гексо-кристаллы) ══════════
   InstancedMesh из гексагональных призм. Шейдер: тёмное основание → светящийся
   неон/золото наверху. Hover (Raycaster) → подъём и свечение (GSAP). */
export function createHexMap({ cols=9, rows=7, spacing=1.0, dom=null, camera=null }={}){
  const group=new THREE.Group();
  const count=cols*rows;

  const geo=new THREE.CylinderGeometry(0.5,0.5,1.0,6); // 6 граней = гексагон
  geo.translate(0,0.5,0);                              // основание в y=0, растёт вверх

  const mat=new THREE.ShaderMaterial({ transparent:true, uniforms:{ uTime:{value:0} },
    vertexShader:`attribute float aGlow; attribute vec3 aColor;
      varying float vY; varying float vGlow; varying vec3 vCol;
      void main(){ vY=position.y; vGlow=aGlow; vCol=aColor;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
    fragmentShader:`varying float vY; varying float vGlow; varying vec3 vCol; uniform float uTime;
      void main(){
        float topF=smoothstep(0.0,1.0,vY);
        vec3 dark=vec3(0.02,0.03,0.07);
        vec3 col=mix(dark, vCol, topF*topF);
        float edge=pow(topF,6.0);
        col+=vCol*edge*(0.6+vGlow*1.4);
        float alpha=mix(0.35,0.92,topF)+vGlow*0.08;
        gl_FragColor=vec4(col,alpha);
      }` });

  const mesh=new THREE.InstancedMesh(geo,mat,count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const baseH=new Float32Array(count), lift=new Float32Array(count), glow=new Float32Array(count);
  const px=new Float32Array(count), pz=new Float32Array(count);
  const colArr=new Float32Array(count*3), glowAttr=new Float32Array(count);
  const PAL=[new THREE.Color(0xffd27a),new THREE.Color(0x49e6ff),new THREE.Color(0x9a78ff)];
  let idx=0;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    px[idx]=(c-(cols-1)/2)*spacing*1.5;
    pz[idx]=(r-(rows-1)/2)*spacing*Math.sqrt(3)+(c%2)*spacing*Math.sqrt(3)/2;
    baseH[idx]=0.3+Math.random()*0.5;
    const col=PAL[Math.floor(Math.random()*PAL.length)];
    colArr.set([col.r,col.g,col.b],idx*3);
    idx++;
  }
  geo.setAttribute('aGlow',new THREE.InstancedBufferAttribute(glowAttr,1));
  geo.setAttribute('aColor',new THREE.InstancedBufferAttribute(colArr,3));
  group.add(mesh);

  const dummy=new THREE.Object3D();
  function rebuild(){
    for(let i=0;i<count;i++){
      dummy.position.set(px[i],lift[i],pz[i]);
      dummy.scale.set(0.9,baseH[i],0.9); dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix); glowAttr[i]=glow[i];
    }
    mesh.instanceMatrix.needsUpdate=true; geo.attributes.aGlow.needsUpdate=true;
  }
  rebuild();

  const ray=new THREE.Raycaster(), mouse=new THREE.Vector2();
  let hovered=-1;
  function setHover(id){
    if(id===hovered) return;
    if(hovered>=0){ G.to(lift,{[hovered]:0,duration:0.5,ease:'power2.inOut'});
                    G.to(glow,{[hovered]:0,duration:0.5}); }
    hovered=id;
    if(id>=0){ G.to(lift,{[id]:0.6,duration:0.6,ease:'back.out(2)'});
               G.to(glow,{[id]:1.0,duration:0.4});
               group.userData.onHover && group.userData.onHover(id); }
  }
  function onMove(ev){
    if(!dom||!camera) return;
    const rect=dom.getBoundingClientRect();
    mouse.x=((ev.clientX-rect.left)/rect.width)*2-1;
    mouse.y=-((ev.clientY-rect.top)/rect.height)*2+1;
    ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObject(mesh,false);
    setHover(hit.length?hit[0].instanceId:-1);
  }
  if(dom) dom.addEventListener('pointermove',onMove);

  group.userData.mesh=mesh;
  group.userData.update=(t)=>{ mat.uniforms.uTime.value=t; rebuild(); };
  group.userData.dispose=()=>{ if(dom) dom.removeEventListener('pointermove',onMove); };
  return group;
}
