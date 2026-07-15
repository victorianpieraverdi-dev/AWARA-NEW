// Toroidal Field shaders — "Тороид — Дыхание Света" (coil-torus + vibration).
// Two programs share a standing-wave "vibration" driven by uMode / uAmp / uFreq:
//   * the angular lobe count (uMode) rises with the vibration level (Light), so the
//     surface ripples with more nodes at higher frequency — a cymatic-like figure.
//   * SPARKS ride helical coils (theta = aTheta + aK*alpha) up the thin waist, out
//     the crown, down the outside; they also pick up the ripple so they stay on the
//     vibrating structure.
//   * LINES (net + coils) are displaced by the same ripple in their vertex shader.

// ---------- Spark particles ----------
export const torusFieldVertex = /* glsl */ `
uniform float uTime;
uniform float uLight;
uniform float uA;
uniform float uRMin;
uniform float uSize;
uniform float uMode;  // angular lobe count (vibration frequency)
uniform float uAmp;   // ripple amplitude
uniform float uFreq;  // temporal vibration speed
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
`

export const torusFieldFragment = /* glsl */ `
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
`

// ---------- Lines (net + coils), rippled by the same vibration ----------
export const torusLineVertex = /* glsl */ `
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
`

export const torusLineFragment = /* glsl */ `
precision highp float;
uniform float uLight;
uniform float uOpacity;
varying vec3 vColor;

void main(){
	vec3 c = vColor * (0.5 + 1.3 * uLight);
	gl_FragColor = vec4(c, uOpacity);
}
`
