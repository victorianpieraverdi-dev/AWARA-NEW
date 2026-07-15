// Resonance field shader — Chladni / cymatic nodal pattern of a circular membrane
// (резонанс Шумана). The eigenmodes of a round membrane are
//   field(r, theta) = sin(n * PI * r / R) * cos(m * theta)
// where m = number of diameters (angular sectors) and n = number of nodal circles.
// Sand in the classic experiment gathers on the NODES (field ~ 0), so we glow there.
// The vertex shader lifts the membrane by the field (a living, breathing plate); the
// fragment shader recomputes the field analytically for razor-sharp nodal lines
// regardless of mesh density.

export const resonanceVertex = /* glsl */ `
uniform float uTime;
uniform float uM;     // angular modes (diameters)
uniform float uN;     // radial modes (nodal circles)
uniform float uR;     // disc radius
uniform float uAmp;   // vertical displacement
uniform float uOmega; // temporal pulse speed
varying vec2 vPos;

const float PI = 3.141592653589793;

void main(){
	vec2 q = position.xy;
	float r = length(q);
	float th = atan(q.y, q.x);
	float m0 = floor(uM);
	float mfrac = uM - m0;
	float ang = mix(cos(m0 * th), cos((m0 + 1.0) * th), mfrac);
	float field = sin(uN * PI * r / uR) * ang;
	float disp = uAmp * field * cos(uTime * uOmega);
	vec3 np = vec3(q.x, q.y, disp);
	vPos = q;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(np, 1.0);
}
`

export const resonanceFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uM;
uniform float uN;
uniform float uR;
uniform float uLine;   // nodal line crispness (smaller = thinner)
uniform float uOmega;
uniform float uOpacity;
uniform vec3 uColorNode;
uniform vec3 uColorAnti;
varying vec2 vPos;

const float PI = 3.141592653589793;

void main(){
	float r = length(vPos);
	float th = atan(vPos.y, vPos.x);
	float m0 = floor(uM);
	float mfrac = uM - m0;
	float ang = mix(cos(m0 * th), cos((m0 + 1.0) * th), mfrac);
	float field = sin(uN * PI * r / uR) * ang;
	// fade out toward the rim and kill anything past the radius
	float edge = smoothstep(uR, uR * 0.65, r);
	// bright nodal lines where field crosses zero (sand gathers here)
	float node = smoothstep(uLine, 0.0, abs(field));
	// antinode shimmer pulsing in time
	float pulse = 0.5 + 0.5 * cos(uTime * uOmega);
	float anti = abs(field) * pulse;
	vec3 col = uColorNode * node + uColorAnti * anti * 0.6;
	float alpha = (node * 0.95 + anti * 0.22) * edge * uOpacity;
	if (alpha < 0.003) discard;
	gl_FragColor = vec4(col, alpha);
}
`
