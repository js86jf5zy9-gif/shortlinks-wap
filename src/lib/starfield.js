// Deterministic star tiles rendered as SVG data URIs, so the sky is identical
// on every load and costs no network requests.
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const TINTS = ['#ffffff', '#ffffff', '#ffffff', '#cfe3ff', '#ffe9c4'];

export const starTile = ({ size, count, minR, maxR, minO, maxO, seed, glow = false }) => {
  const rand = mulberry32(seed);
  let circles = '';
  for (let i = 0; i < count; i += 1) {
    const x = (rand() * size).toFixed(1);
    const y = (rand() * size).toFixed(1);
    const r = (minR + rand() * (maxR - minR)).toFixed(2);
    const o = (minO + rand() * (maxO - minO)).toFixed(2);
    const fill = TINTS[Math.floor(rand() * TINTS.length)];
    if (glow) circles += `<circle cx="${x}" cy="${y}" r="${(r * 3.5).toFixed(2)}" fill="${fill}" opacity="${(o * 0.12).toFixed(3)}"/>`;
    circles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${o}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${circles}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const STAR_LAYERS = [
  { name: 'far', rate: 0.06, size: 420, count: 150, minR: 0.3, maxR: 0.7, minO: 0.25, maxO: 0.6, seed: 11 },
  { name: 'mid', rate: 0.14, size: 560, count: 70, minR: 0.6, maxR: 1.1, minO: 0.45, maxO: 0.85, seed: 23 },
  { name: 'near', rate: 0.26, size: 720, count: 26, minR: 1, maxR: 1.7, minO: 0.7, maxO: 1, seed: 47, glow: true },
];
