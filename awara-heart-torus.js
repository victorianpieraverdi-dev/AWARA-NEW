/* AWARA — Тороид «Дыхание Света» в сердце Истока.
   Vanilla-порт движка core/render/TorusField.ts (+ шейдеры core/render/shaders/torus.glsl.ts)
   на чистый Three.js (ESM). Вешает маленький WebGL-canvas прямо в #awaraHeartOrb на экране
   Истока. Пока: авто-дыхание Света (0..1). Кнопка слева-внизу прячет/показывает образ сердца,
   чтобы сравнить «тор + образ» и «чистый тор».  __v:1 */
import * as THREE from "https://esm.sh/three@0.184.0";

const torusFieldVertex = `
uniform float uTime;
uniform float uLight;
uniform float uA;
uniform float uRMin;
uniform float uSize;
uniform float uMode;
uniform float uAmp;
uniform float uFreq;
attribute float aAlpha0;
attribute float aTheta;
attribute float aScale;
attribute float aSeed;
attribute float aK;
varying float vAsc;
varying float vLife;
varying float vHue;

void main(){
	float speed = 0.15 + 1.10 * uLight;
	float alpha = aAlpha0 - uTime * speed;
	float ca = cos(alpha);
	float sa = sin(alpha);
	float rho = uRMin + uA * (1.0 + ca);
	float y = uA * sa;
	float th = aTheta + aK * alpha;
	float wave = sin(uMode * th + uTime * uFreq);
	rho *= (1.0 + uAmp * wave);
	y *= (1.0 + 0.25 * uAmp * wave);
	float jitter = 0.02 * sin(uTime * 1.7 + aSeed * 6.2831);
	rho += jitter;
	vec3 pos = vec3(rho * cos(th), y + jitter, rho * sin(th));
	vAsc = clamp(1.0 - rho / (2.0 * uA), 0.0, 1.0);
	vLife = 0.5 + 0.5 * sa;
	vHue = fract(aTheta / 6.2831853);
	vec4 mv = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mv;
	float psize = uSize * aScale * (0.5 + 1.0 * uLight) * (10.0 / max(-mv.z, 0.1));
	gl_PointSize = clamp(psize, 1.0, 16.0);
}
`;

const torusFieldFragment = `
precision highp float;
uniform float uLight;
uniform float uOpacity;
uniform float uRainbow;
uniform vec3 uColorAsc;
uniform vec3 uColorDesc;
uniform vec3 uColorField;
varying float vAsc;
varying float vLife;
varying float vHue;

vec3 hsv2rgb(vec3 c){
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
	vec2 d = gl_PointCoord - vec2(0.5);
	float r = length(d);
	float mask = smoothstep(0.5, 0.0, r);
	if (mask <= 0.001) discard;
	vec3 scheme = mix(uColorDesc, uColorAsc, vAsc);
	scheme = mix(scheme, uColorField, 0.18);
	vec3 rainbow = hsv2rgb(vec3(fract(vHue + 0.04 * vLife), 0.85, 1.0));
	float core = smoothstep(0.16, 0.0, r);
	vec3 col = mix(scheme, rainbow, uRainbow);
	col *= 0.55 + 1.5 * uLight;
	col += core * (0.4 + 0.6 * uLight);
	float alpha = mask * uOpacity * (0.12 + 0.55 * uLight) * (0.5 + 0.5 * vLife);
	gl_FragColor = vec4(col, alpha);
}
`;

const torusLineVertex = `
uniform float uTime;
uniform float uLight;
uniform float uMode;
uniform float uAmp;
uniform float uFreq;
attribute vec3 color;
varying vec3 vColor;

void main(){
	vec3 p = position;
	float th = atan(p.z, p.x);
	float rho = length(p.xz);
	float wave = sin(uMode * th + uTime * uFreq);
	float disp = uAmp * wave;
	float nrho = rho * (1.0 + disp);
	float ny = p.y * (1.0 + 0.25 * disp);
	vec3 np = vec3(nrho * cos(th), ny, nrho * sin(th));
	vColor = color;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(np, 1.0);
}
`;

const torusLineFragment = `
precision highp float;
uniform float uLight;
uniform float uOpacity;
varying vec3 vColor;

void main(){
	vec3 c = vColor * (0.5 + 1.3 * uLight);
	gl_FragColor = vec4(c, uOpacity);
}
`;

const TAU = Math.PI * 2;
function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
function clampRange(v, lo, hi){ return v < lo ? lo : v > hi ? hi : v; }
function vibrationFor(L){ return { mode: Math.round(3 + L * 9), amp: 0.05 + 0.05 * L, freq: 0.6 + 4.0 * L }; }

function makeLineMaterial(L, opacity, vib){
	return new THREE.ShaderMaterial({
		vertexShader: torusLineVertex,
		fragmentShader: torusLineFragment,
		transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
		uniforms: { uTime:{value:0}, uLight:{value:L}, uMode:{value:vib.mode}, uAmp:{value:vib.amp}, uFreq:{value:vib.freq}, uOpacity:{value:opacity} }
	});
}
function makeGlowSprite(map, scale){
	const mat = new THREE.SpriteMaterial({ map, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0.6 });
	const s = new THREE.Sprite(mat); s.scale.set(scale, scale, 1); return s;
}
function makeGlowTexture(rgb){
	if (typeof document === "undefined") return null;
	const size = 128;
	const c = document.createElement("canvas"); c.width = size; c.height = size;
	const ctx = c.getContext("2d"); if (!ctx) return null;
	const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
	g.addColorStop(0.0, "rgba(255,255,255,0.95)");
	g.addColorStop(0.18, "rgba(" + rgb + ",0.85)");
	g.addColorStop(0.5, "rgba(" + rgb + ",0.25)");
	g.addColorStop(1.0, "rgba(" + rgb + ",0.0)");
	ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
	const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; return tex;
}

class TorusField {
	constructor(opts = {}){
		const A = opts.majorRadius ?? 1.6;
		const rMin = opts.waistRadius ?? 0.08;
		const total = Math.max(256, Math.floor(opts.particleCount ?? 1400));
		const rainbow = clamp01(opts.rainbow ?? 1);
		const useRainbow = rainbow > 0.001;
		const nCoils = Math.max(1, Math.floor(opts.coilCount ?? 12));
		const baseK = opts.coilTurns ?? 3;
		const L0 = clamp01(opts.light ?? 0);
		this.spinSpeed = opts.spinSpeed ?? 0.25;
		this.spinMul = 1; this.time = 0;
		this.morphAmp = 0; this.morphMode = 0; this.morphFreq = 0; this.morphSquash = 0; this.morphBulge = 0;
		this.coreGlow = null; this.auraGlow = null; this.coreBase = 0; this.auraBase = 0;

		this.group = new THREE.Group();
		this.spinCW = new THREE.Group();
		this.spinCCW = new THREE.Group();
		this.group.add(this.spinCW, this.spinCCW);

		const pointAt = (theta, alpha) => {
			const rho = rMin + A * (1 + Math.cos(alpha));
			const y = A * Math.sin(alpha);
			return [rho * Math.cos(theta), y, rho * Math.sin(theta)];
		};
		const col = new THREE.Color();
		const vib = vibrationFor(L0);

		const netPos = []; const netCol = [];
		const netColor = new THREE.Color(opts.colorNet ?? "#4a7bff");
		const pushNet = (a, b) => { netPos.push(a[0],a[1],a[2], b[0],b[1],b[2]); netCol.push(netColor.r,netColor.g,netColor.b, netColor.r,netColor.g,netColor.b); };
		const meridianCount = 40, meridianSegs = 60;
		for (let m = 0; m < meridianCount; m++){ const theta = (m/meridianCount)*TAU; for (let s = 0; s < meridianSegs; s++){ pushNet(pointAt(theta,(s/meridianSegs)*TAU), pointAt(theta,((s+1)/meridianSegs)*TAU)); } }
		const parallelCount = 26, parallelSegs = 90;
		for (let p = 0; p < parallelCount; p++){ const alpha = (p/parallelCount)*TAU; for (let s = 0; s < parallelSegs; s++){ pushNet(pointAt((s/parallelSegs)*TAU,alpha), pointAt(((s+1)/parallelSegs)*TAU,alpha)); } }
		const netGeo = new THREE.BufferGeometry();
		netGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(netPos), 3));
		netGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(netCol), 3));
		netGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), A*3);
		this.netMat = makeLineMaterial(L0, 0.12, vib);
		const net = new THREE.LineSegments(netGeo, this.netMat); net.frustumCulled = false; this.group.add(net);

		this.coilMat = makeLineMaterial(L0, 0.7, vib);
		const coilSegs = 200;
		const buildCoils = (sign) => {
			const pos = []; const cols = []; const K = baseK * sign;
			for (let c = 0; c < nCoils; c++){
				const phi0 = (c/nCoils)*TAU;
				if (useRainbow) col.setHSL(c/nCoils, 0.85, 0.6); else col.set(c % 2 === 0 ? (opts.colorAscending ?? "#ffd27a") : (opts.colorField ?? "#b388ff"));
				for (let s = 0; s < coilSegs; s++){
					const a0 = (s/coilSegs)*TAU; const a1 = ((s+1)/coilSegs)*TAU;
					const a = pointAt(phi0 + K*a0, a0); const b = pointAt(phi0 + K*a1, a1);
					pos.push(a[0],a[1],a[2], b[0],b[1],b[2]);
					cols.push(col.r,col.g,col.b, col.r,col.g,col.b);
				}
			}
			const g = new THREE.BufferGeometry();
			g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
			g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cols), 3));
			g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), A*3);
			return g;
		};

		this.material = new THREE.ShaderMaterial({
			vertexShader: torusFieldVertex,
			fragmentShader: torusFieldFragment,
			transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
			uniforms: {
				uTime:{value:0}, uLight:{value:L0}, uA:{value:A}, uRMin:{value:rMin}, uSize:{value:opts.pointSize ?? 3}, uRainbow:{value:rainbow},
				uMode:{value:vib.mode}, uAmp:{value:vib.amp}, uFreq:{value:vib.freq},
				uColorAsc:{value:new THREE.Color(opts.colorAscending ?? "#7ad3ff")},
				uColorDesc:{value:new THREE.Color(opts.colorDescending ?? "#ffd27a")},
				uColorField:{value:new THREE.Color(opts.colorField ?? "#b388ff")},
				uOpacity:{value:opts.opacity ?? 0.21}
			}
		});
		const buildSparks = (sign, n) => {
			const positions = new Float32Array(n*3);
			const alpha0 = new Float32Array(n); const theta = new Float32Array(n); const scale = new Float32Array(n); const seed = new Float32Array(n); const kArr = new Float32Array(n);
			for (let i = 0; i < n; i++){ const c = Math.floor(Math.random()*nCoils); alpha0[i] = Math.random()*TAU; theta[i] = (c/nCoils)*TAU; scale[i] = 0.6 + Math.random()*0.9; seed[i] = Math.random(); kArr[i] = baseK*sign; }
			const g = new THREE.BufferGeometry();
			g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			g.setAttribute("aAlpha0", new THREE.BufferAttribute(alpha0, 1));
			g.setAttribute("aTheta", new THREE.BufferAttribute(theta, 1));
			g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
			g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
			g.setAttribute("aK", new THREE.BufferAttribute(kArr, 1));
			g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), A*3);
			return g;
		};
		const half = Math.floor(total/2);
		const coilsCW = new THREE.LineSegments(buildCoils(1), this.coilMat);
		const sparksCW = new THREE.Points(buildSparks(1, half), this.material);
		coilsCW.frustumCulled = false; sparksCW.frustumCulled = false; this.spinCW.add(coilsCW, sparksCW);
		const coilsCCW = new THREE.LineSegments(buildCoils(-1), this.coilMat);
		const sparksCCW = new THREE.Points(buildSparks(-1, total-half), this.material);
		coilsCCW.frustumCulled = false; sparksCCW.frustumCulled = false; this.spinCCW.add(coilsCCW, sparksCCW);

		const spineGeo = new THREE.CylinderGeometry(rMin*0.9, rMin*0.9, A*2.05, 12, 1, true);
		this.spineMat = new THREE.MeshBasicMaterial({ color:new THREE.Color(opts.colorCore ?? "#ffd27a"), transparent:true, opacity:0.7, blending:THREE.AdditiveBlending, depthWrite:false });
		const spine = new THREE.Mesh(spineGeo, this.spineMat); this.group.add(spine);

		this.coreBase = A*0.7; this.auraBase = A*4.2;
		const coreTex = makeGlowTexture("255,232,180");
		const auraTex = makeGlowTexture("179,136,255");
		if (coreTex && auraTex){ this.coreGlow = makeGlowSprite(coreTex, this.coreBase); this.auraGlow = makeGlowSprite(auraTex, this.auraBase); this.group.add(this.auraGlow, this.coreGlow); }

		this.setLight(L0);
	}
	setLight(v){
		const L = clamp01(v); const vib = vibrationFor(L);
		for (const mat of [this.material, this.netMat, this.coilMat]){ mat.uniforms.uLight.value = L; mat.uniforms.uMode.value = vib.mode; mat.uniforms.uAmp.value = vib.amp; mat.uniforms.uFreq.value = vib.freq; }
		this.netMat.uniforms.uOpacity.value = 0.026 + 0.049*L;
		this.coilMat.uniforms.uOpacity.value = 0.17 + 0.15*L;
		this.spineMat.opacity = 0.13 + 0.205*L;
		if (this.coreGlow) this.coreGlow.material.opacity = 0.11 + 0.3*L;
		if (this.auraGlow) this.auraGlow.material.opacity = 0.06 + 0.17*L;
		this.group.scale.setScalar(0.9 + 0.2*L);
	}
	get light(){ return this.material.uniforms.uLight.value; }
	setSpin(mult){ this.spinMul = mult < 0 ? 0 : mult; }
	setMorph(m){ this.morphAmp = clampRange(m.amp ?? 0, 0, 1); this.morphMode = clampRange(m.mode ?? 0, 0, 16); this.morphFreq = clampRange(m.freq ?? 0, 0, 12); this.morphSquash = clampRange(m.squash ?? 0, -0.4, 0.55); this.morphBulge = clampRange(m.bulge ?? 0, -0.4, 0.7); }
	update(dt){
		const L = this.material.uniforms.uLight.value; const vib = vibrationFor(L);
		const aAmp = vib.amp + this.morphAmp; const aMode = vib.mode + this.morphMode; const aFreq = vib.freq + this.morphFreq;
		for (const mat of [this.material, this.netMat, this.coilMat]){ mat.uniforms.uTime.value += dt; mat.uniforms.uAmp.value = aAmp; mat.uniforms.uMode.value = aMode; mat.uniforms.uFreq.value = aFreq; }
		const baseS = 0.9 + 0.2*L; const sx = baseS*(1+this.morphBulge); const sy = baseS*(1-this.morphSquash);
		this.group.scale.set(sx, sy, sx);
		const w = this.spinSpeed * 1.5 * this.spinMul * dt;
		this.spinCW.rotation.y += w; this.spinCCW.rotation.y -= w;
		this.time += dt;
		if (this.coreGlow) this.coreGlow.scale.setScalar(this.coreBase*(1 + 0.06*Math.sin(this.time*1.2)));
		if (this.auraGlow) this.auraGlow.scale.setScalar(this.auraBase*(1 + 0.04*Math.sin(this.time*0.7)));
	}
	dispose(){
		this.material.dispose(); this.netMat.dispose(); this.coilMat.dispose(); this.spineMat.dispose();
		for (const glow of [this.coreGlow, this.auraGlow]){ if (!glow) continue; const m = glow.material; if (m.map) m.map.dispose(); m.dispose(); }
		this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
	}
}

(function(){
	"use strict";
	let renderer = null, scene = null, camera = null, field = null, canvas = null, raf = 0, last = 0;
	let lastW = 0, lastH = 0, imgOn = true, btn = null;
	let hostOrb = null, mo = null, flash = 0, lastFlash = 0;
	let callOpen = false;
	let sparks = null, actx = null, entering = false, enterT = 0;
	let lastBreathCyc = null, heartTamed = false;
	const BREATH_PERIOD = 15, BREATH = TAU / BREATH_PERIOD;
	function makeInflowSparks(){
		const N = 90; const pos = new Float32Array(N*3);
		const spawn = (i) => { const R = 2.8 + Math.random()*1.7; const u = Math.random()*TAU; const v = Math.acos(2*Math.random()-1); pos[i*3] = R*Math.sin(v)*Math.cos(u); pos[i*3+1] = R*Math.cos(v)*0.7; pos[i*3+2] = R*Math.sin(v)*Math.sin(u); };
		for (let i = 0; i < N; i++) spawn(i);
		const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 8);
		const mat = new THREE.PointsMaterial({ size: 0.13, color: new THREE.Color("#ffe6b0"), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
		const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.userData = { N: N, pos: pos, spawn: spawn };
		return pts;
	}
	function heartbeat(){
		try {
			if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
			if (actx.state === "suspended") actx.resume();
			const t0 = actx.currentTime;
			const thump = (at, freq, gain) => { const o = actx.createOscillator(); const gg = actx.createGain(); const f = actx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 210; o.type = "sine"; o.frequency.setValueAtTime(freq, at); o.frequency.exponentialRampToValueAtTime(freq*0.5, at+0.18); gg.gain.setValueAtTime(0.0001, at); gg.gain.exponentialRampToValueAtTime(gain, at+0.03); gg.gain.exponentialRampToValueAtTime(0.0001, at+0.3); o.connect(f); f.connect(gg); gg.connect(actx.destination); o.start(at); o.stop(at+0.34); };
			thump(t0, 62, 0.32); thump(t0+0.28, 48, 0.24);
		} catch (e){}
	}
	function driveImage(){
		const H = window.AwaraHeart; if (!H) return;
		if (!heartTamed){ heartTamed = true; if (H.setPeriod){ try { H.setPeriod(3600000); return; } catch (e){} } }
		if (H.next){ try { H.next(); } catch (e){} }
	}

	function injectStyle(){
		if (document.getElementById("aht-style")) return;
		const st = document.createElement("style"); st.id = "aht-style";
		st.textContent = ".heart-img-off .awara-heart-img{opacity:0 !important}" +
			"canvas.awara-heart-torus{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;-webkit-mask:radial-gradient(circle at 50% 50%,#000 60%,rgba(0,0,0,.55) 80%,transparent 94%);mask:radial-gradient(circle at 50% 50%,#000 60%,rgba(0,0,0,.55) 80%,transparent 94%)}" +
			"#s-istok .orb-wrap{position:relative;min-height:250px;align-items:center;justify-content:center;margin:12px 0 17px !important}" +
			"#s-istok .orb-wrap::after{content:'';position:absolute;left:50%;top:50%;width:225px;height:225px;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:0;animation:aoPulse 2.8s ease-in-out infinite}" +
			"@keyframes aoPulse{0%,100%{box-shadow:0 0 38px 6px rgba(255,210,122,.12)}50%{box-shadow:0 0 96px 26px rgba(255,210,122,.34)}}" +
			"#s-istok #awaraHeartOrb{position:relative;z-index:1;cursor:pointer;width:225px !important;height:225px !important;opacity:.82 !important}" +
			"#s-istok #awaraHeartOrb:active{filter:brightness(1.12)}" +
			"#aoCallVeil{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(11,8,19,.985);opacity:0;pointer-events:none;transition:none}" +
			"#aoCallVeil.show{opacity:1;pointer-events:auto}" +
			"#aoCallVeil .ao-call{position:relative;max-width:330px;width:100%;text-align:center;padding:30px 26px 26px;border-radius:20px;border:1px solid rgba(201,168,76,.4);background:linear-gradient(180deg,rgba(26,22,40,.97),rgba(16,13,26,.97));box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 50px rgba(255,210,122,.12)}" +
			"#aoCallVeil .ao-call .ao-ic{font-size:34px;line-height:1;margin-bottom:12px}" +
			"#aoCallVeil .ao-call h3{margin:0 0 10px;font-size:19px;letter-spacing:.04em;color:#ffd27a;font-weight:600}" +
			"#aoCallVeil .ao-call p{margin:0 0 20px;font-size:15px;line-height:1.5;color:#cfc9e0}" +
			"#aoCallVeil .ao-call button{appearance:none;-webkit-appearance:none;cursor:pointer;padding:11px 26px;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:rgba(201,168,76,.14);color:#ffd27a;font-size:14px;letter-spacing:.04em}" +
			"#aoCallVeil .ao-call button:active{filter:brightness(1.15)}" +
			"html.ao-open #s-istok .orb-wrap{visibility:hidden}" +
			"canvas.awara-heart-torus.aht-entry{position:absolute;inset:auto;left:50%;top:50%;width:86%;height:86%;transform:translate(-50%,-50%);z-index:5;-webkit-mask:radial-gradient(circle at 50% 50%,#000 36%,rgba(0,0,0,.5) 58%,transparent 74%);mask:radial-gradient(circle at 50% 50%,#000 36%,rgba(0,0,0,.5) 58%,transparent 74%)}" +
			"#awEntry .awEntry-orb::after{display:none !important}" +
			".aht-ripple{position:absolute;inset:0;pointer-events:none;z-index:6}" +
			".aht-ripple i{position:absolute;left:50%;top:50%;width:34%;height:34%;transform:translate(-50%,-50%) scale(.5);border-radius:50%;border:1px solid rgba(255,220,150,.5);box-shadow:0 0 6px rgba(255,214,140,.3);opacity:0;animation:ahtRipple 6s cubic-bezier(.33,0,.25,1) infinite}" +
			".aht-ripple i:nth-child(2){animation-delay:2s}" +
			".aht-ripple i:nth-child(3){animation-delay:4s}" +
			"@keyframes ahtRipple{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}10%{opacity:.5}55%{opacity:.34}82%{opacity:.16}100%{opacity:0;transform:translate(-50%,-50%) scale(3.6)}}" +
			"#awEntry .awEntry-cap{animation:ahtCap 4.5s ease-in-out 2.6s infinite}" +
			"@keyframes ahtCap{0%,100%{opacity:.74;text-shadow:0 0 8px rgba(255,214,140,.15)}50%{opacity:1;text-shadow:0 0 20px rgba(255,214,140,.55)}}" +
			"#awEntry .aht-hint{display:block;margin-top:9px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(236,233,245,.5);animation:ahtHint 2.6s ease-in-out infinite}" +
			"@keyframes ahtHint{0%,100%{opacity:.22}50%{opacity:.72}}" +
			".phone.aw-portal-in{animation:none!important}" +
			"#awEntry.sg.sgout{opacity:1!important}" +
			"#awEntry.sg .awEntry-orb,#awEntry.sg .awEntry-aura,#awEntry.sg .awEntry-cap{transition:opacity 1.3s linear!important}";
		document.head.appendChild(st);
	}
	function mount(orb){
		injectStyle();
		canvas = document.createElement("canvas");
		canvas.className = "awara-heart-torus" + ((orb.closest && orb.closest("#awEntry")) ? " aht-entry" : "");
		orb.appendChild(canvas);
		if (orb.closest && orb.closest("#awEntry") && !orb.querySelector(".aht-ripple")){ const rip = document.createElement("div"); rip.className = "aht-ripple"; rip.innerHTML = "<i></i><i></i><i></i>"; orb.appendChild(rip); }
		const cap = document.querySelector("#awEntry .awEntry-cap"); if (cap && !cap.querySelector(".aht-hint")) cap.innerHTML = "Войти в игру<span class=\"aht-hint\">нажми, чтобы войти</span>";
		const entry = orb.closest && orb.closest("#awEntry"); if (entry && !entry.__ahtSound){ entry.__ahtSound = true; entry.addEventListener("pointerdown", function(){ heartbeat(); if (!entering){ entering = true; enterT = performance.now(); const veil = document.createElement("div"); veil.id = "ahtVeil"; veil.style.cssText = "position:fixed;inset:0;background:#05050d;opacity:0;z-index:100010;pointer-events:none;transition:opacity 1.3s linear"; document.body.appendChild(veil); requestAnimationFrame(function(){ veil.style.opacity = "1"; }); setTimeout(function(){ veil.style.transition = "opacity 2.2s ease-out"; veil.style.opacity = "0"; }, 1900); setTimeout(function(){ if (veil.parentNode) veil.parentNode.removeChild(veil); }, 4300); } }, { passive: true }); }
		try { renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true }); }
		catch (e){ console.warn("[heart-torus] WebGL init failed", e); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); canvas = null; return; }
		renderer.setClearColor(0x000000, 0);
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		camera.position.set(0, 2.2, 8.5); camera.lookAt(0, 0, 0); // крупный тор-портал во всю сферу
		field = new TorusField({ light: 0.6, rainbow: 0, colorAscending: "#ffd27a", colorDescending: "#9d86e0", colorField: "#b38bff", colorCore: "#ffd27a", colorNet: "#6f5bb0" });
		scene.add(field.group);
		if (orb.closest && orb.closest("#awEntry")){ sparks = makeInflowSparks(); scene.add(sparks); }
		hostOrb = orb; setupFlash(orb);
		lastW = 0; lastH = 0; resize();
		last = performance.now();
		cancelAnimationFrame(raf); loop();
	}
	function resize(){
		if (!canvas || !renderer) return;
		const r = canvas.getBoundingClientRect();
		const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
		renderer.setSize(w, h, false);
		camera.aspect = w / h; camera.updateProjectionMatrix();
		lastW = w; lastH = h;
	}
	function loop(){
		raf = requestAnimationFrame(loop);
		if (callOpen) return;
		if (!renderer || !field || !canvas) return;
		const r = canvas.getBoundingClientRect();
		const w = Math.round(r.width), h = Math.round(r.height);
		if (w > 0 && h > 0 && (w !== lastW || h !== lastH)) resize();
		const now = performance.now(); let dt = (now - last) / 1000; last = now; if (dt > 0.1) dt = 0.1;
		const t = now / 1000;
		if (flash > 0) flash = Math.max(0, flash - dt / 1.3);
		const env = flash * flash;
		// Дыхание-портал: тор всегда живой, мягко пульсирует светом и масштабом — внутрь сферы и наружу, зовёт войти.
		const phase = t * BREATH;
		const breath = 0.5 + 0.5 * Math.sin(phase); // 0..1, плавный вдох-выдох
		field.setLight(Math.min(1, 0.34 + 0.6 * breath + 0.12 * env)); // всегда светится, ярче на вдохе
		field.setSpin(0.7);
		// лёгкая волна-искажение по тору (мягко, без «разматывания»)
		field.setMorph({ amp: 0.05 + 0.06 * breath, mode: 3, freq: 0.8 + 0.6 * breath, bulge: 0, squash: 0 });
		if (field.material && field.material.uniforms.uRainbow) field.material.uniforms.uRainbow.value = 0.06 + 0.16 * breath;
		field.update(dt);
		// явная пульсация: тор дышит внутрь сферы и наружу (после update, чтобы не затиралось)
		if (field.group) field.group.scale.setScalar(0.80 + 0.34 * breath);
		if (sparks){ const su = sparks.userData; const p = su.pos; const speed = 1.1 + 1.7 * breath; for (let i = 0; i < su.N; i++){ const ix = i*3, iy = ix+1, iz = ix+2; const x = p[ix], y = p[iy], z = p[iz]; const d = Math.sqrt(x*x + y*y + z*z) || 0.0001; let step = speed * dt * (0.5 + 1.5 / Math.max(d, 0.4)); if (step > d) step = d; if (d < 0.32){ su.spawn(i); } else { const nd = (d - step) / d; p[ix] = x*nd; p[iy] = y*nd; p[iz] = z*nd; } } sparks.geometry.attributes.position.needsUpdate = true; sparks.material.opacity = 0.45 + 0.45 * breath; }
		if (entering){ const e = Math.min(1, (now - enterT) / 1300); const ee = e*e; field.setLight(0.6); field.setSpin(0.7); if (field.group) field.group.scale.setScalar((0.80 + 0.34 * breath) * (1 - 0.55 * ee)); if (hostOrb) hostOrb.style.setProperty("opacity", String(1 - ee), "important"); if (canvas) canvas.style.setProperty("opacity", String(1 - ee), "important"); }
		renderer.render(scene, camera);
	}
	function teardown(){
		cancelAnimationFrame(raf); raf = 0;
		if (sparks){ if (sparks.geometry) sparks.geometry.dispose(); if (sparks.material) sparks.material.dispose(); if (sparks.parent) sparks.parent.remove(sparks); sparks = null; } entering = false;
		if (field){ field.dispose(); field = null; }
		if (renderer){ renderer.dispose(); renderer = null; }
		scene = null; camera = null;
		if (mo){ mo.disconnect(); mo = null; } hostOrb = null;
		if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
		canvas = null;
	}
	function triggerFlash(){
		const now = performance.now();
		if (now - lastFlash < 1200) return;
		lastFlash = now; flash = 1;
	}
	function setupFlash(orb){
		if (mo) mo.disconnect();
		mo = new MutationObserver(function(muts){
			for (const m of muts){ if (m.type === "attributes" && m.attributeName === "src"){ triggerFlash(); break; } }
		});
		mo.observe(orb, { attributes:true, attributeFilter:["src"], subtree:true });
	}
	function ensure(){
		if (canvas && !canvas.isConnected) teardown();
		// AWARA: монтируем тор в стартовую сферу «Войди в сферу» (#awEntry), а не в Исток.
		const orb = document.querySelector("#awEntry .awEntry-orb");
		if (!orb) return;
		if (canvas && canvas.isConnected && renderer) return;
		mount(orb);
	}
	function applyImg(){
		document.documentElement.classList.toggle("heart-img-off", !imgOn);
		if (btn) btn.textContent = imgOn ? "\uD83E\uDEC0 образ: вкл" : "\uD83E\uDEC0 образ: выкл";
	}
	function addToggle(){
		if (btn) return;
		btn = document.createElement("button");
		btn.type = "button";
		btn.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:56;padding:6px 11px;border-radius:11px;border:1px solid rgba(201,168,76,.4);background:rgba(18,16,28,.72);color:#e6e1f2;font:12px/1 'JetBrains Mono',monospace;letter-spacing:.04em;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)";
		btn.textContent = "\uD83E\uDEC0 образ: вкл";
		btn.onclick = function(){ imgOn = !imgOn; applyImg(); };
		document.body.appendChild(btn);
	}
	function showCall(){
		let veil = document.getElementById("aoCallVeil");
		if (!veil){
			veil = document.createElement("div");
			veil.id = "aoCallVeil";
			veil.innerHTML = '<div class="ao-call" role="dialog" aria-modal="true"><div class="ao-ic">\uD83D\uDD4A\uFE0F</div><h3>\u0417\u043E\u0432 \u0421\u0435\u0440\u0434\u0446\u0430</h3><p>\u041F\u0440\u043E\u0439\u0434\u0438 \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u0442 7 \u0434\u043E 21 \u0434\u043D\u044F \u0432 \u0421\u0435\u0440\u0434\u0446\u0435 \u2014 \u0438 \u0432\u0440\u0430\u0442\u0430 \u0432 \u0431\u043E\u043B\u044C\u0448\u0443\u044E \u0438\u0433\u0440\u0443 \u043E\u0442\u043A\u0440\u043E\u044E\u0442\u0441\u044F.</p><button type="button">\u041F\u043E\u043D\u044F\u0442\u043D\u043E</button></div>';
			document.body.appendChild(veil);
			const close = function(){ callOpen = false; veil.classList.remove("show"); document.documentElement.classList.remove("ao-open"); };
			veil.addEventListener("click", function(e){ if (e.target === veil) close(); });
			const b = veil.querySelector("button"); if (b) b.addEventListener("click", close);
			document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });
		}
		callOpen = true;
		document.documentElement.classList.add("ao-open");
		veil.classList.add("show");
	}
	function onOrbClick(e){
		const t = e.target;
		if (!t || !t.closest) return;
		if (!t.closest("#awaraHeartOrb")) return;
		showCall();
	}
	function boot(){
		// AWARA: тор-портал в стартовой сфере Истока — крупный, дышит и пульсирует, зовёт войти в сферу.
		injectStyle();
		ensure();
		setInterval(ensure, 800);
		window.addEventListener("resize", resize);
		document.addEventListener("click", onOrbClick);
	}
	if (document.readyState !== "loading") boot();
	else document.addEventListener("DOMContentLoaded", boot);

	window.AwaraHeartTorus = {
		setLight: function(v){ if (field) field.setLight(v); },
		image: function(on){ imgOn = !!on; applyImg(); },
		remount: function(){ teardown(); ensure(); },
		dispose: teardown,
		__v: 1
	};
})();
