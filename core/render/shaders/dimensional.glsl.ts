// Dynamic Dimensionality shader.
// uLight = 0  -> flat, monochrome, no relief (low-Light UI).
// uLight = 1  -> volumetric (normal displacement), saturated sacred color, bloom rim.
// GLSL kept as TS string exports so no asset loader / bundler glsl plugin is required.

export const dimensionalVertex = /* glsl */ `
uniform float uLight;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;

// compact value noise (hash-based) — cheap, dependency-free
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
	vec3 i = floor(x), f = fract(x);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
	               mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
	           mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
	               mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main(){
	vNormal = normalize(normalMatrix * normal);
	// Geometry "inflates" from flat to volumetric as Light rises.
	float n = noise(position * 2.0 + uTime * 0.15);
	float relief = uLight * (0.12 + 0.28 * n);
	vec3 displaced = position + normal * relief;
	vec4 world = modelMatrix * vec4(displaced, 1.0);
	vWorldPos = world.xyz;
	gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const dimensionalFragment = /* glsl */ `
precision highp float;
uniform float uLight;
uniform float uTime;
uniform vec3 uColorLow;   // monochrome base (gold-gray)
uniform vec3 uColorHigh;  // saturated sacred color
uniform vec3 uCameraPos;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
	vec3 N = normalize(vNormal);
	vec3 V = normalize(uCameraPos - vWorldPos);
	float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

	// Desaturate toward luminance at low Light, restore full color at high Light.
	float lum = dot(uColorHigh, vec3(0.299, 0.587, 0.114));
	vec3 mono = mix(vec3(lum), uColorLow, 0.5);
	vec3 col = mix(mono, uColorHigh, smoothstep(0.0, 1.0, uLight));

	// Emissive rim grows with Light (HDR > 1.0 feeds the Bloom pass).
	float pulse = 0.5 + 0.5 * sin(uTime * 1.5);
	vec3 emissive = uColorHigh * fres * (0.2 + 1.4 * uLight) * mix(0.85, 1.0, pulse);

	gl_FragColor = vec4(col + emissive, 1.0);
}
`
