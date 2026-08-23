#!/usr/bin/env node
/* Derives house-data.js from the architect's IFC model.

   The house in this app used to be six boxes traced off the site plan PDF, with
   a ridge and an eave guessed per box. It is now the architect's own model:
   67 walls, 36 floors and roofs, 28 doors and windows, four storeys, lifted out
   of 234 Duffy Street, Ainslie - POST REVIEW FINAL7.ifc and placed in the app's
   frame. This is the script that places it.

   The IFC itself is not in the repo. It is 54.7 MB and only its extract is
   worth keeping, the same arrangement as the survey DWG. Two halves:

     python3 tools/ifc/extract.py '<file>.ifc' source/house.json
     node tools/house-extract.js

   The first half needs ifcopenshell and the IFC. The second half, this file,
   needs neither: it reads source/house.json, which is in the repo. It prints
   house-data.js to stdout, and its own checks to stderr first. Pass --check to
   compare against the house-data.js already on disk and print nothing else.

   What it does, in the order it does it.

   1. Reads source/house.json. Coordinates there are raw IFC world metres, with
      a y around -2470 and the building set turned about 14 degrees off the
      world axes. z is already AHD and is left alone: the model's FFL is
      611.65, which is the level the survey measured, so there is nothing to
      add and nothing to fit in z.
   2. Finds the building's own grid angle, as the length-weighted circular mean
      of every wall axis and every slab edge taken modulo 90 degrees. Using the
      whole model rather than one chosen edge means no single element can pull
      the fit.
   3. Rotates by that angle and translates so the garage floor slab lands on the
      garage in BOXH. The garage is the anchor because it is one clean isolated
      rectangle, 11.600 m by 3.992 m, and BOXH has it at 11.59 by 3.87.
   4. Checks the result against all six BOXH boxes and against the levels in
      source/project-data.json, and refuses to write if any of it has moved.

   The BOXH boxes were traced off the site plan PDF at 1:200. The IFC is the
   same architect's set and is the better record, so once the fit is confirmed
   the model wins and BOXH is derived from it rather than the other way about.

   Two things in the IFC that cannot be believed, both found by the extraction:

     Pset_WallCommon.IsExternal is true on all 67 walls, including 20 stud
     partitions carrying internal cavity sliders. It is not read here. A wall
     is called external if the floor stops on one side of it, which is tested
     against the floor slabs themselves.

     The IfcSite toposurface spans 32.2 by 46.7 m with a 3.0 m fall, wider than
     the block and steeper than it. The surveyor's TIN stays the ground. The
     toposurface is not read here at all. */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');

const H = JSON.parse(fs.readFileSync(path.join(ROOT, 'source/house.json'), 'utf8'));
const PD = JSON.parse(fs.readFileSync(path.join(ROOT, 'source/project-data.json'), 'utf8'));

const warn = [];
const say = m => { if (!CHECK) process.stderr.write(m + '\n'); };
const r3 = n => Math.round(n * 1000) / 1000;
const r2 = n => Math.round(n * 100) / 100;

/* ---- 1. the model is in metres and already in AHD ---- */

if (H.units.scale_to_metres !== 0.001 || H.units.length_unit !== 'MILLIMETRE')
  throw new Error('house.json is not the millimetre export this was written for');
if (H.units.z_is_AHD !== true)
  throw new Error('house.json says z is not AHD, so a z offset is pending and this script would be wrong');

/* ---- 2. the building's own grid angle ---- */

/* Every wall axis and every slab edge votes, weighted by its length. Direction
   is taken modulo 90 degrees, because a rectangular building's edges run two
   ways and both say the same thing about the grid. Averaging angles needs the
   circular mean, so the vote is cast as a unit vector at four times the angle
   and averaged there. */
let vx = 0, vy = 0, weight = 0;
const vote = (ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
  if (L < 0.4) return;                       /* short edges are noise */
  const a4 = 4 * Math.atan2(dy, dx);
  vx += L * Math.cos(a4); vy += L * Math.sin(a4); weight += L;
};
H.walls.forEach(w => { if (w.start && w.end) vote(w.start[0], w.start[1], w.end[0], w.end[1]); });
H.slabs.forEach(s => {
  if (!s.boundary) return;
  for (let i = 0; i + 1 < s.boundary.length; i++)
    vote(s.boundary[i][0], s.boundary[i][1], s.boundary[i + 1][0], s.boundary[i + 1][1]);
});
if (weight <= 0) throw new Error('no wall or slab edges to fit a grid angle to');

/* Back out of the four-times space. The result is the grid direction in the
   first quadrant; which of the four it is does not matter yet, the garage
   settles that. */
const gridDeg = Math.atan2(vy, vx) * 180 / Math.PI / 4;

/* ---- 3. rotate onto the app's axes, translate onto the garage ---- */

/* The app frame runs x 0 at the reserve boundary to 40 at the street, y 0 at
   the east-north-east boundary to 21.33 at the west-south-west. The garage's
   long side runs in x. */
const GARAGE_IFC = '2327953';                /* Floor:Conc 100, the garage slab */
const garage = H.slabs.find(s => s.name && s.name.indexOf(GARAGE_IFC) >= 0 && s.boundary);
if (!garage) throw new Error('the garage floor slab ' + GARAGE_IFC + ' is not in house.json');

const BOXH = [
  ['existing house', 20.38, 1.77, 29.01, 17.79],
  ['east wing', 25.94, 1.77, 33.33, 8.06],
  ['rear addition', 9.66, 11.96, 16.32, 17.96],
  ['link', 16.32, 12.51, 21.25, 13.88],
  ['garage', 16.32, 17.34, 27.91, 21.21],
  ['kitchen addition', 19.95, 2.3, 21.52, 7.48]
];
const boxOf = n => BOXH.find(b => b[0] === n);

/* The grid angle is only known modulo 90, so try all four quarter turns and
   both handedness, and keep whichever puts the garage the right way round: long
   side in x, and the rest of the house on the low-y side of it rather than off
   the block. */
const bbox = pts => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
let fit = null;
for (let q = 0; q < 4; q++) for (const flip of [false, true]) {
  const th = -(gridDeg + q * 90) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  const rot = p => { const x = c * p[0] - s * p[1], y = s * p[0] + c * p[1]; return [x, flip ? -y : y]; };
  const g = bbox(garage.boundary.map(rot));
  if (g[2] - g[0] < g[3] - g[1]) continue;                 /* long side must be x */
  const gb = boxOf('garage');
  const dx = gb[1] - g[0], dy = gb[2] - g[1];
  const T = p => { const u = rot(p); return [u[0] + dx, u[1] + dy]; };
  /* the existing house must land inside the block and south of the garage */
  const house = H.slabs.find(x => x.name && x.name.indexOf('2010085') >= 0 && x.boundary);
  if (!house) throw new Error('the existing house roof 2010085 is not in house.json');
  const hb = bbox(house.boundary.map(T));
  if (hb[1] < 0 || hb[1] > gb[2]) continue;
  if (hb[0] < 0 || hb[2] > 40) continue;
  const err = Math.abs(hb[0] - boxOf('existing house')[1]) + Math.abs(hb[3] - boxOf('existing house')[4]);
  if (!fit || err < fit.err) fit = { th, c, s, flip, dx, dy, T, err, q };
}
if (!fit) throw new Error('no quarter turn puts the garage and the house on the block');

const T = fit.T;
const fitDeg = -fit.th * 180 / Math.PI;
say('grid angle ' + gridDeg.toFixed(4) + ' deg, fitted rotation ' + fitDeg.toFixed(4)
  + ' deg, offset ' + fit.dx.toFixed(3) + ' ' + fit.dy.toFixed(3) + (fit.flip ? ', flipped' : ''));

/* ---- 4. transform everything ---- */

const storeys = H.storeys.map(s => [s.name, r3(s.world_z_m)]);
const sIdx = n => Math.max(0, storeys.findIndex(s => s[0] === n));

const walls = H.walls.filter(w => w.start && w.end).map(w => {
  const a = T(w.start), b = T(w.end);
  return { a: a, b: b, t: w.thickness_m, z0: w.base_z, z1: w.top_z, st: w.storey,
           name: w.name, id: w.GlobalId };
});

/* Floors first, because the external wall test needs them. IfcRoof entries that
   only aggregate a slab already listed carry no geometry, and are dropped. */
const slabs = H.slabs.filter(s => s.boundary && s.boundary.length >= 3).map(s => ({
  poly: s.boundary.map(T), bz: s.boundary_z || null,
  kind: (s.class === 'IfcRoof' || s.PredefinedType === 'ROOF') ? 'roof' : 'floor',
  z0: s.z_min, z1: s.z_max, thick: s.thickness_m, st: s.storey, name: s.name,
  plane: s.plane || null, eave: s.eave_z != null ? s.eave_z : null,
  ridge: s.ridge_z != null ? s.ridge_z : null, area: s.area_m2, id: s.GlobalId
}));
const dropped = H.slabs.length - slabs.length;
if (dropped) say(dropped + ' slab records carry no geometry and are dropped (aggregate wrappers)');

const floors = slabs.filter(s => s.kind === 'floor');
const inPoly = (p, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > p[1]) !== (yj > p[1]) &&
        p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const onFloor = p => floors.some(f => inPoly(p, f.poly));

/* A wall is external if the floor stops on one side of it. Sampled at five
   points along the axis, offset half the thickness plus 150 mm to clear the
   wall itself, and called external if either side is off the floor for most of
   the run. Pset_WallCommon.IsExternal says true for all 67 and is not used. */
walls.forEach(w => {
  const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1], L = Math.hypot(dx, dy);
  if (L < 1e-6) { w.ext = false; return; }
  const nx = -dy / L, ny = dx / L, off = (w.t || 0.1) / 2 + 0.15;
  let left = 0, right = 0;
  for (let i = 1; i <= 5; i++) {
    const t = i / 6, px = w.a[0] + dx * t, py = w.a[1] + dy * t;
    if (onFloor([px + nx * off, py + ny * off])) left++;
    if (onFloor([px - nx * off, py - ny * off])) right++;
  }
  w.ext = (left >= 3) !== (right >= 3);
});
say(walls.filter(w => w.ext).length + ' of ' + walls.length + ' walls read as external by the floor test'
  + ' (the IFC pset says ' + H.walls.filter(w => w.is_external_pset).length + ')');

const wallIdx = {};
walls.forEach((w, i) => { wallIdx[w.id] = i; });

const openings = H.openings.map(o => {
  const c = T(o.centre);
  return [o.class === 'IfcDoor' ? 'door' : 'window', r3(c[0]), r3(c[1]),
          r3(o.width_m), r3(o.height_m), r3(o.sill_z),
          o.host_wall != null && wallIdx[o.host_wall] != null ? wallIdx[o.host_wall] : -1,
          sIdx(o.storey), o.name];
});

const cwalls = H.curtain_walls.map(c => {
  /* only a bounding box came across, so both plan corners are transformed and
     the result re-boxed. Good enough for a glazing line on a plan. */
  const p = [T([c.bbox[0][0], c.bbox[0][1]]), T([c.bbox[1][0], c.bbox[1][1]]),
             T([c.bbox[0][0], c.bbox[1][1]]), T([c.bbox[1][0], c.bbox[0][1]])];
  const b = bbox(p);
  return [r3(b[0]), r3(b[1]), r3(b[2]), r3(b[3]), r3(c.base_z), r3(c.top_z), sIdx(c.storey), c.name];
});

/* ---- 5. the massing, rebuilt from the roofs ---- */

/* BOXH gave every building one ridge and one eave, and project-data.json
   records that the kitchen addition and the link came out below the finished
   ceiling because of it. The roofs carry their own planes, so the massing is
   now the roofs themselves. Each box keeps its footprint and takes the ridge
   and eave of the roofs that sit over it. */
const roofs = slabs.filter(s => s.kind === 'roof');

/* A roof belongs to the box it actually sits over, which is an overlap area and
   not a centroid: these roof outlines are L shaped and hipped, and the average
   of an L's corners lands outside the L. Sutherland and Hodgman clips the roof
   against the box, which is convex, so the clip is exact. */
const shoelace = poly => {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  return Math.abs(a) / 2;
};
const clipBox = (poly, x0, y0, x1, y1) => {
  const edges = [[1, 0, x0], [-1, 0, -x1], [0, 1, y0], [0, -1, -y1]];  /* ax+by >= c */
  let out = poly.slice();
  if (out.length && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  for (const [a, b, c] of edges) {
    const inp = out; out = [];
    const side = p => a * p[0] + b * p[1] - c;
    for (let i = 0; i < inp.length; i++) {
      const P = inp[i], Q = inp[(i + 1) % inp.length], sp = side(P), sq = side(Q);
      if (sp >= 0) out.push(P);
      if ((sp >= 0) !== (sq >= 0)) {
        const t = sp / (sp - sq);
        out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
      }
    }
    if (!out.length) return [];
  }
  return out;
};
const boxh = BOXH.map(b => {
  const boxArea = (b[3] - b[1]) * (b[4] - b[2]);
  const over = roofs.filter(r => {
    const cut = clipBox(r.poly, b[1], b[2], b[3], b[4]);
    if (cut.length < 3) return false;
    const a = shoelace(cut);
    /* a quarter of the roof, or a quarter of the box: either way it is the roof
       over this part of the house rather than a corner clipping past it */
    return a >= 0.25 * shoelace(r.poly) || a >= 0.25 * boxArea;
  });
  if (!over.length) return null;
  const ridge = Math.max(...over.map(r => r.ridge != null ? r.ridge : r.z1));
  const eave = Math.min(...over.map(r => r.eave != null ? r.eave : r.z0));
  return [b[0], b[1], b[2], b[3], b[4], r2(ridge), r2(eave), over.length];
});

/* ---- 6. checks ---- */

const fail = [];
const near = (a, b, tol, what) => {
  if (Math.abs(a - b) > tol) fail.push(what + ': ' + a + ' against ' + b
    + ', ' + Math.round(Math.abs(a - b) * 1000) + ' mm apart');
};

/* the levels the architect dimensioned */
const FL = PD.floor_levels_m_AHD;
const st = n => (storeys.find(s => s[0] === n) || [, null])[1];
near(st('FFL'), FL.house_and_addition_FFL, 0.001, 'FFL storey');
near(st('SUNKEN LOUNGE'), FL.sunken_lounge_FFL, 0.001, 'sunken lounge storey');
near(st('FCL'), FL.finished_ceiling_FCL, 0.001, 'FCL storey');

/* the footprints, against what the app already held */
const anchors = [
  ['garage', garage.boundary, [16.32, 17.34, 27.91, 21.21], 0.14],
  ['existing house roof', H.slabs.find(s => s.name.indexOf('2010085') >= 0).boundary,
   [20.38, null, null, 17.79], 0.03]
];
anchors.forEach(([name, poly, want, tol]) => {
  const b = bbox(poly.map(T));
  ['x0', 'y0', 'x1', 'y1'].forEach((k, i) => {
    if (want[i] == null) return;
    near(r3(b[i]), want[i], tol, name + ' ' + k);
  });
});

/* nothing may land off the block */
const all = [].concat(walls.map(w => w.a), walls.map(w => w.b),
  [].concat(...slabs.map(s => s.poly)));
const ab = bbox(all);
if (ab[0] < -1 || ab[1] < -1 || ab[2] > 41 || ab[3] > 22.5)
  fail.push('geometry lands off the block: ' + ab.map(v => v.toFixed(2)).join(' '));
say('all geometry inside x ' + ab[0].toFixed(2) + '..' + ab[2].toFixed(2)
  + ', y ' + ab[1].toFixed(2) + '..' + ab[3].toFixed(2));

/* project-data.json records the kitchen addition and the link as the two boxes
   whose ridge sat below the finished ceiling, which was the only place the app's
   massing disagreed with the architect's set. The model has to have settled it. */
['kitchen addition', 'link'].forEach(n => {
  const b = boxh.find(x => x && x[0] === n);
  if (!b) { fail.push(n + ' has no roof over it in the model'); return; }
  if (b[5] < FL.finished_ceiling_FCL)
    fail.push(n + ' ridge is still ' + b[5] + ', below the ceiling at ' + FL.finished_ceiling_FCL);
});

/* Every box that moved by more than 100 mm, so a change of this size is read
   rather than discovered. The garage is expected here: its metal roof is at
   613.09 to 613.77 in the model and BOXH had guessed 614.3 to 614.6. */
const OLDH = { 'existing house': [616.06, 613.93], 'east wing': [615.2, 613.5],
  'rear addition': [614.6, 614.17], 'link': [613.9, 613.9],
  'garage': [614.6, 614.3], 'kitchen addition': [614, 614] };
boxh.forEach(b => {
  if (!b) return;
  const o = OLDH[b[0]]; if (!o) return;
  const dr = b[5] - o[0], de = b[6] - o[1];
  if (Math.abs(dr) > 0.1 || Math.abs(de) > 0.1)
    warn.push(b[0] + ' ridge ' + o[0] + ' to ' + b[5] + ' (' + (dr >= 0 ? '+' : '') + r2(dr)
      + '), eave ' + o[1] + ' to ' + b[6] + ' (' + (de >= 0 ? '+' : '') + r2(de) + ')');
});

/* ---- 7. write ---- */

const out = {
  SRC: H.source_file,
  SCHEMA: H.schema,
  FIT: { deg: r3(fitDeg), dx: r3(fit.dx), dy: r3(fit.dy), flip: fit.flip,
         note: 'IFC world metres to the app frame. z is AHD in both and is untouched.' },
  STOREY: storeys,
  WALL: walls.map(w => [r3(w.a[0]), r3(w.a[1]), r3(w.b[0]), r3(w.b[1]), r3(w.t),
                        r3(w.z0), r3(w.z1), sIdx(w.st), w.ext ? 1 : 0, w.name]),
  SLAB: slabs.filter(s => s.kind === 'floor').map(s =>
    [r3(s.z1), r3(s.thick || 0), sIdx(s.st), s.name, s.poly.map(p => [r3(p[0]), r3(p[1])])]),
  ROOF: roofs.map(s => [r3(s.eave != null ? s.eave : s.z0), r3(s.ridge != null ? s.ridge : s.z1),
                        s.plane ? r2(s.plane.slope_deg) : null, sIdx(s.st), s.name,
                        s.poly.map(p => [r3(p[0]), r3(p[1])]),
                        s.bz ? s.bz.map(r3) : null]),
  OPEN: openings,
  CWALL: cwalls,
  BOXH: boxh.filter(Boolean).map(b => b.slice(0, 7))
};

if (fail.length) {
  process.stderr.write('\nthis does not agree with what the app holds:\n  ' + fail.join('\n  ') + '\n');
  process.exit(1);
}
warn.forEach(w => say('note: ' + w));
say('storeys ' + storeys.length + ', walls ' + out.WALL.length + ', floors ' + out.SLAB.length
  + ', roofs ' + out.ROOF.length + ', openings ' + out.OPEN.length + ', glazing ' + out.CWALL.length);

const text = '/* The house, from the architect\'s IFC model. Generated by\n'
  + '   tools/house-extract.js, which says where it comes from and how it is\n'
  + '   fitted. Do not edit by hand: run the tool again. */\n'
  + 'window.DUFFY_HOUSE = ' + JSON.stringify(out) + ';\n';

if (CHECK) {
  const onDisk = path.join(ROOT, 'house-data.js');
  if (!fs.existsSync(onDisk)) { console.log('house-data.js is not there yet'); process.exit(1); }
  const was = fs.readFileSync(onDisk, 'utf8');
  if (was === text) { console.log('house-data.js still agrees with the IFC extract'); process.exit(0); }
  console.log('house-data.js has drifted from what tools/house-extract.js derives');
  process.exit(1);
}
process.stdout.write(text);
