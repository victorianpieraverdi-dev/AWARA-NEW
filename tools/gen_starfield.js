const fs = require('fs');
function rng(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
const r = rng(7);
const W = 1920;
const H = 1080;
const colors = ['#ffffff', '#fff8d6', '#ffd877', '#bcdcff', '#ffffff', '#ffffff', '#ffe9a0'];
let stars = '';
for (let i = 0; i < 260; i++) {
  const x = Math.floor(r() * W);
  const y = Math.floor(r() * H);
  const rad = (r() * 1.4 + 0.3).toFixed(2);
  const op = (r() * 0.7 + 0.3).toFixed(2);
  const c = colors[Math.floor(r() * colors.length)];
  stars += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" opacity="${op}"/>`;
}
for (let i = 0; i < 40; i++) {
  const x = Math.floor(r() * W);
  const y = Math.floor(r() * H);
  const rad = (r() * 1.5 + 1.4).toFixed(2);
  const c = colors[Math.floor(r() * colors.length)];
  stars += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" opacity="0.95" filter="url(#glow)"/>`;
}
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>` +
  stars +
  `</svg>`;
fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/starfield.svg', svg);
console.log('written', svg.length, 'bytes', (svg.match(/<circle/g) || []).length, 'stars');
