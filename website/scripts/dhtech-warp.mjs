// dhtech: draws the page's background, public/dhtech-warp.svg - a floor of
// orange tiles that flows up into a point, after the grid of DreamHack's
// classic logo. Run by hand when the picture should change:
//
//   node scripts/dhtech-warp.mjs > public/dhtech-warp.svg
//
// The shape is the bell of a horn standing on its rim: wide and nearly
// flat at the bottom, turning upwards in one curve and narrowing to a
// point at the top. Only the part that faces the camera is drawn (ARC),
// as rings of tiles: every ring has the same number of tiles, so they
// are large at the rim and small at the tip, and each is drawn smaller
// than its cell so the ground shows between them. All tiles are one
// <path>, to keep the file small.

const WIDTH = 1600;
const HEIGHT = 1000;
const COLOR = '#ff7801'; // DreamHack's orange

const TILE = 0.64; // how much of its cell a tile fills
const SMALLEST = 1.6; // a tile smaller than this is left out
const RING = 20; // tiles in a ring
const ARC = [204, 351]; // the part of the bell that is drawn, in degrees
const RIM = 30; // the bell's radius at the bottom
const TIP = 0.12; // ... and where the drawing stops at the top
const CURVE = 3.8; // how tall the bell is (larger = taller and slimmer)

// the camera: where it stands, what it looks at, how wide it sees
const EYE = [13, -24, 9.5];
const LOOK = [13.5, 0, 6.6];
const FOCAL = 900;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = a => {
  const n = Math.hypot(...a);
  return [a[0] / n, a[1] / n, a[2] / n];
};
const round = n => Math.round(n * 10) / 10;

const FORWARD = unit(sub(LOOK, EYE));
const RIGHT = unit(cross(FORWARD, [0, 0, 1]));
const UP = cross(RIGHT, FORWARD);

// the bell: how high it is where its radius is r - nothing at the rim,
// and CURVE more for every time the radius shrinks to a third or so
const heightAt = r => CURVE * Math.log(RIM / r);

function project(angle, r) {
  const turn = (angle * Math.PI) / 180;
  const point = [r * Math.cos(turn), r * Math.sin(turn), heightAt(r)];
  const d = sub(point, EYE);
  const depth = dot(d, FORWARD);
  if (depth < 0.5) return null;
  return [
    WIDTH / 2 + (FOCAL * dot(d, RIGHT)) / depth,
    HEIGHT / 2 - (FOCAL * dot(d, UP)) / depth,
  ];
}

// the rings, from the rim up: each as deep (along the bell) as its tiles
// are wide, so the tiles stay near square
const step = (ARC[1] - ARC[0]) / RING;
const rings = [];
for (let r = RIM; r > TIP;) {
  const wide = (r * step * Math.PI) / 180;
  // walk `wide` along the bell from radius r
  let next = r;
  let walked = 0;
  while (walked < wide && next > TIP / 2) {
    const before = next;
    next *= 0.995;
    walked += Math.hypot(before - next, heightAt(next) - heightAt(before));
  }
  rings.push([r, next]);
  r = next;
}

let d = '';
const gap = (1 - TILE) / 2;
for (const [outer, inner] of rings) {
  const a = outer + (inner - outer) * gap;
  const b = outer + (inner - outer) * (1 - gap);
  for (let i = 0; i < RING; i++) {
    const from = ARC[0] + (i + gap) * step;
    const to = ARC[0] + (i + 1 - gap) * step;
    const corners = [
      project(from, b),
      project(to, b),
      project(to, a),
      project(from, a),
    ];
    if (corners.includes(null)) continue;
    const xs = corners.map(c => c[0]);
    const ys = corners.map(c => c[1]);
    // nothing of it on the picture, or too small to be seen
    if (Math.max(...xs) < 0 || Math.min(...xs) > WIDTH) continue;
    if (Math.max(...ys) < 0 || Math.min(...ys) > HEIGHT) continue;
    if (Math.max(...ys) - Math.min(...ys) < SMALLEST) continue;
    if (Math.max(...xs) - Math.min(...xs) < SMALLEST) continue;
    d +=
      'M' +
      corners.map(([px, py]) => `${round(px)} ${round(py)}`).join('L') +
      'z';
  }
}

// the stroke rounds the tiles' corners, as the logo's are
process.stdout.write(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" ` +
    `preserveAspectRatio="xMidYMid slice"><path fill="${COLOR}" ` +
    `stroke="${COLOR}" stroke-width="1.6" stroke-linejoin="round" d="${d}"/></svg>\n`,
);
