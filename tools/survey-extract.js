#!/usr/bin/env node
/* Derives SPOT and TRI in site-data.js from the surveyor's CAD file.

   The levels in this app are not a model fitted to the survey. They are the
   surveyor's own triangulated surface, lifted off layer SRF-VIEW of
   3891_ZB EXPLODED VERSION.dwg and placed in the app's frame. This is the
   script that does it. It lived in a scratchpad the first time and was lost,
   which cost a day to work out again, so it is in the repo now.

   The DWG is not in the repo, and neither is the tool that reads it:

     dwg2dxf comes from LibreDWG, which builds from source in about ten minutes
       git clone --depth 1 https://github.com/LibreDWG/libredwg.git
       cd libredwg && sh autogen.sh
       ./configure --disable-bindings --disable-shared --disable-docs && make
     the DWGs are AC1018, which nothing else in this image reads

   Then:

     dwg2dxf -y '3891_ZB EXPLODED VERSION.dwg'
     node tools/survey-extract.js '3891_ZB EXPLODED VERSION.dxf'

   It prints SPOT and TRI ready to paste into site-data.js, and prints its own
   checks first. Pass --check to compare against what site-data.js already
   holds and print nothing else. The DXF is parsed here rather than through
   ezdxf, so node and dwg2dxf are the whole toolchain.

   What it does, in the order it does it.

   1. Reads the LINE entities. SRF-VIEW carries the surveyor's TIN as 322
      edges between 126 measured ground points, each with a true 3D MGA
      coordinate. BOUN-0.5 carries the block boundary as a closed ring.
   2. Fits the four boundary corners to the app's own boundary, BNDP in
      site-data.js, as a similarity: rotation, uniform scale, translation. The
      corner correspondence is found by trying all eight ways round the ring
      and keeping the best, so nothing is hardcoded that the file could
      contradict.
   3. Rebuilds the surveyor's faces from their edges. The DWG has the edges but
      not the faces, so a face is a 3-clique in the edge graph. That over-counts
      slightly, because three edges can enclose a fourth point without a face
      being there, so any triangle containing another vertex is dropped.
   4. Fills what is left with Delaunay triangles. That is mostly the house
      footprint, where no levels were taken. Surveyed faces are written first so
      that RL answers from a surveyed face wherever there is one.

   Levels are rounded to the centimetre the survey quotes them in, half away
   from zero, which is what the surveyor's own printed labels do. Getting that
   wrong is not theoretical: the first extraction shipped ten of the 126 levels
   a centimetre out, and two of them are contradicted by the labels printed on
   the survey plan. */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const dxfPath = args.find(a => !a.startsWith('--'));
if (!dxfPath) { console.error('usage: node tools/survey-extract.js <file.dxf> [--check]'); process.exit(2); }

/* ---------- the DXF ---------- */

/* A DXF is group codes: a line holding a number, then a line holding its value.
   Only LINE entities are wanted, and only three of their codes, so the whole
   file is walked once rather than parsed into a document. */
function readLines(file) {
  const t = fs.readFileSync(file, 'latin1').split(/\r?\n/);
  const out = [];
  let cur = null;
  for (let i = 0; i + 1 < t.length; i += 2) {
    const code = t[i].trim(), val = t[i + 1];
    if (code === '0') {
      if (cur && cur.layer && cur.a && cur.b) out.push(cur);
      cur = val.trim() === 'LINE' ? { a: null, b: null } : null;
    } else if (cur) {
      if (code === '8') cur.layer = val.trim();
      else if (code === '10') (cur.a = cur.a || [])[0] = +val;
      else if (code === '20') (cur.a = cur.a || [])[1] = +val;
      else if (code === '30') (cur.a = cur.a || [])[2] = +val;
      else if (code === '11') (cur.b = cur.b || [])[0] = +val;
      else if (code === '21') (cur.b = cur.b || [])[1] = +val;
      else if (code === '31') (cur.b = cur.b || [])[2] = +val;
    }
  }
  if (cur && cur.layer && cur.a && cur.b) out.push(cur);
  return out;
}

const all = readLines(dxfPath);
const srf = all.filter(l => l.layer === 'SRF-VIEW');
const bnd = all.filter(l => l.layer === 'BOUN-0.5');
if (!srf.length) { console.error('no SRF-VIEW lines in ' + dxfPath + '; is this the survey DXF?'); process.exit(2); }

/* Vertices in the order the edges first mention them. Nothing depends on that
   order being meaningful, only on it being stable, because TRI indexes into it. */
const key = p => p[0].toFixed(6) + ',' + p[1].toFixed(6) + ',' + p[2].toFixed(6);
const index = new Map(), V = [];
const at = p => { const k = key(p); if (!index.has(k)) { index.set(k, V.length); V.push(p); } return index.get(k); };
const edges = new Set();
for (const l of srf) {
  const i = at(l.a), j = at(l.b);
  if (i !== j) edges.add(Math.min(i, j) + ':' + Math.max(i, j));
}

/* ---------- the app's own boundary ---------- */

global.window = global;
require(path.join(ROOT, 'site-data.js'));
const D = window.DUFFY;
/* BNDP is a screen-space path, so y comes back through YTOP the way fy() sends it */
const dst = [...D.BNDP.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], D.YTOP - +m[2]]);
if (dst.length !== 4) { console.error('expected four boundary corners in BNDP, got ' + dst.length); process.exit(2); }

/* The boundary ring, as corners rather than as lines. Zero-length lines are the
   closing artefact of an exploded polyline and carry no corner. */
const ring = [];
for (const l of bnd) {
  if (Math.hypot(l.a[0] - l.b[0], l.a[1] - l.b[1]) < 1e-6) continue;
  if (!ring.length) ring.push(l.a);
  ring.push(l.b);
}
if (ring.length >= 2 && Math.hypot(ring[0][0] - ring[ring.length - 1][0], ring[0][1] - ring[ring.length - 1][1]) < 1e-6) ring.pop();
if (ring.length !== 4) { console.error('expected a four-corner boundary on BOUN-0.5, got ' + ring.length); process.exit(2); }

/* ---------- the fit ---------- */

/* Similarity by least squares: one rotation, one scale, one translation. An
   affine fit would absorb the survey's grid-to-ground scale into a shear and
   quietly stop being a map, so the four parameters are the point. */
function helmert(src, dst) {
  const n = src.length;
  const m = src.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]);
  const u = dst.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]);
  let sxx = 0, syy = 0, sxy = 0, syx = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const ax = src[i][0] - m[0], ay = src[i][1] - m[1];
    const bx = dst[i][0] - u[0], by = dst[i][1] - u[1];
    sxx += ax * bx; syy += ay * by; sxy += ax * by; syx += ay * bx;
    den += ax * ax + ay * ay;
  }
  const a = (sxx + syy) / den, b = (sxy - syx) / den;
  const T = p => [a * (p[0] - m[0]) - b * (p[1] - m[1]) + u[0],
                  b * (p[0] - m[0]) + a * (p[1] - m[1]) + u[1]];
  return { T, scale: Math.hypot(a, b), rot: Math.atan2(b, a) * 180 / Math.PI };
}

/* Which corner is which is not written down anywhere, so all eight ways round
   the ring are tried and the one that fits is kept. */
let best = null;
for (const dir of [1, -1]) {
  for (let s = 0; s < 4; s++) {
    const src = [0, 1, 2, 3].map(i => ring[((dir > 0 ? i : -i) + s + 8) % 4]);
    const f = helmert(src, dst);
    const worst = Math.max(...src.map((p, i) => Math.hypot(...f.T(p).map((v, k) => v - dst[i][k]))));
    if (!best || worst < best.worst) best = { ...f, worst, src };
  }
}
const T = best.T;

/* ---------- the points ---------- */

const r2 = v => Math.round(v * 100) / 100;   /* half away from zero, as the survey quotes */
const SPOT = V.map(p => { const q = T(p); return [r2(q[0]), r2(q[1]), r2(p[2])]; });

/* ---------- the surveyed faces ---------- */

const adj = V.map(() => new Set());
for (const e of edges) { const [i, j] = e.split(':').map(Number); adj[i].add(j); adj[j].add(i); }

const cliques = [];
for (let i = 0; i < V.length; i++)
  for (const j of [...adj[i]].filter(x => x > i).sort((a, b) => a - b))
    for (const k of [...adj[i]].filter(x => x > j && adj[j].has(x)).sort((a, b) => a - b))
      cliques.push([i, j, k]);

/* Three edges can enclose a fourth point with no face between them. Such a
   clique is not a face the surveyor drew, and left in it would shadow the three
   real faces inside it, so it goes. */
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
function inside(t, p) {
  const a = V[t[0]], b = V[t[1]], c = V[t[2]];
  const d1 = cross(a, b, p), d2 = cross(b, c, p), d3 = cross(c, a, p);
  return !((d1 < -1e-9 || d2 < -1e-9 || d3 < -1e-9) && (d1 > 1e-9 || d2 > 1e-9 || d3 > 1e-9));
}
const faces = cliques.filter(t => !V.some((p, v) => !t.includes(v) && inside(t, p)));

/* ---------- the fill ---------- */

/* Bowyer-Watson over all the points, then anything that is already a surveyed
   face is dropped. What is left covers the ground the surveyor did not level,
   which is mostly under the house. */
function delaunay(P) {
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1000 + 10;
  /* The super-triangle has to be far enough out that every cavity stays
     star-shaped. At ten times the extent this quietly lost six triangles, so
     it is a thousand, which is free. */
  const pts = P.map(p => [p[0], p[1]]).concat([[cx - r, cy - r], [cx + r, cy - r], [cx, cy + r]]);
  const s0 = P.length;
  /* Triangles are held counter-clockwise so the in-circle sign means one thing */
  const ccw = t => cross(pts[t[0]], pts[t[1]], pts[t[2]]) > 0 ? t : [t[0], t[2], t[1]];
  const inCircle = (t, d) => {
    const a = pts[t[0]], b = pts[t[1]], c = pts[t[2]], p = pts[d];
    const ax = a[0] - p[0], ay = a[1] - p[1], bx = b[0] - p[0], by = b[1] - p[1];
    const cx2 = c[0] - p[0], cy2 = c[1] - p[1];
    return (ax * ax + ay * ay) * (bx * cy2 - by * cx2)
         - (bx * bx + by * by) * (ax * cy2 - ay * cx2)
         + (cx2 * cx2 + cy2 * cy2) * (ax * by - ay * bx) > 0;
  };
  let tris = [ccw([s0, s0 + 1, s0 + 2])];
  for (let i = 0; i < s0; i++) {
    const bad = [], good = [];
    for (const t of tris) (inCircle(t, i) ? bad : good).push(t);
    /* the cavity's boundary is every edge held by exactly one bad triangle */
    const count = new Map();
    for (const t of bad) for (const e of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) {
      const k = Math.min(e[0], e[1]) + ':' + Math.max(e[0], e[1]);
      const c = count.get(k); if (c) c.n++; else count.set(k, { n: 1, e });
    }
    tris = good;
    for (const { n, e } of count.values()) if (n === 1) tris.push(ccw([e[0], e[1], i]));
  }
  return tris.filter(t => t.every(i => i < s0)).map(t => t.slice().sort((a, b) => a - b));
}

const seen = new Set(faces.map(t => t.slice().sort((a, b) => a - b).join(':')));
const mesh = delaunay(V);
const fill = mesh.filter(t => !seen.has(t.join(':')));
const TRI = faces.concat(fill);

/* ---------- what it thinks of its own work ---------- */

const side = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const fitted = best.src.map(T);
const area = Math.abs(dst.reduce((s, p, i) => s + p[0] * dst[(i + 1) % 4][1] - dst[(i + 1) % 4][0] * p[1], 0) / 2);
const report = [];
report.push('points                 ' + SPOT.length);
report.push('edges                  ' + edges.size);
report.push('surveyed faces         ' + faces.length + '  (from ' + cliques.length + ' cliques, ' + (cliques.length - faces.length) + ' dropped as enclosing a point)');
report.push('Delaunay mesh          ' + mesh.length + '  (2n-2-h for a full triangulation), of which ' + (mesh.length - fill.length) + ' are already surveyed faces');
report.push('Delaunay fill          ' + fill.length);
report.push('triangles              ' + TRI.length);
report.push('scale                  ' + ((best.scale - 1) * 1e6).toFixed(1) + ' ppm  (the plan notes a grid-to-ground factor, STROMLO TO MGA2020)');
report.push('rotation               ' + best.rot.toFixed(5) + ' deg');
report.push('corner residuals       ' + best.src.map((p, i) => (side(T(p), dst[i]) * 1000).toFixed(1)).join(', ') + ' mm');
report.push('fitted sides           ' + [0, 1, 2, 3].map(i => side(fitted[i], fitted[(i + 1) % 4]).toFixed(3)).join(', ') + ' m');
report.push('surveyed sides         40.005, 21.335, 35.660, 21.775 m  (BEARING DIMENSIONS on the plan, in some order)');
report.push('boundary area          ' + area.toFixed(1) + ' m2 against the plan\'s 807');
/* Euler on a triangulated disc: F = E - V + 1. A face count short of that is a
   face the clique walk missed, and one over it is a clique that is not a face. */
report.push('Euler F = E - V + 1    ' + (edges.size - SPOT.length + 1) + ' against ' + faces.length + ' found');

if (CHECK) {
  console.log(report.join('\n'));
  console.log('');
  const S = D.SPOT, X = D.TRI;
  let dz = 0, nz = 0, dxy = 0, nxy = 0;
  for (let i = 0; i < Math.min(S.length, SPOT.length); i++) {
    const z = Math.abs(S[i][2] - SPOT[i][2]); if (z > 1e-9) { nz++; dz = Math.max(dz, z); }
    const d = Math.hypot(S[i][0] - SPOT[i][0], S[i][1] - SPOT[i][1]);
    if (d > 1e-9) { nxy++; dxy = Math.max(dxy, d); }
  }
  /* Levels have to match to the centimetre and there is no tolerance in it. The
     fit never touches z, so a level here is the surveyor's number rounded once
     and nothing else can move it. Position is not like that: it comes through
     the fit, and two honest fits to the same four corners disagree at the
     centimetre the points are stored to. So position is held to a tolerance and
     not to equality, and the same goes for the count of fill triangles, which
     depends on where the Delaunay breaks a tie. On a fall of 1 in 19, 20 mm of
     position is one millimetre of level. */
  const XYTOL = 0.02, TRITOL = 6;
  const line = (name, bad, detail) => {
    console.log('  ' + (bad ? 'FAIL  ' : 'ok    ') + name.padEnd(22) + detail);
    return bad ? 1 : 0;
  };
  console.log('against site-data.js');
  let bad = 0;
  bad += line('points', S.length !== SPOT.length, S.length + (S.length === SPOT.length ? ', same' : ' against ' + SPOT.length));
  bad += line('levels', nz !== 0, nz === 0 ? 'all ' + S.length + ' exact' : nz + ' differ, worst ' + (dz * 1000).toFixed(0) + ' mm');
  bad += line('positions', dxy > XYTOL, nxy + ' differ, worst ' + (dxy * 1000).toFixed(1) + ' mm, tolerance ' + (XYTOL * 1000) + ' mm');
  bad += line('triangles', Math.abs(X.length - TRI.length) > TRITOL, X.length + ' against ' + TRI.length + ', tolerance ' + TRITOL);
  console.log('');
  console.log(bad ? bad + ' failed' : 'the app holds the surveyor\'s surface');
  process.exit(bad ? 1 : 0);
}

console.error(report.join('\n'));
console.error('');
const fmt = rows => '[' + rows.map(r => '[' + r.join(',') + ']').join(',') + ']';
console.log('"SPOT":' + fmt(SPOT) + ',');
console.log('"TRI":' + fmt(TRI));
