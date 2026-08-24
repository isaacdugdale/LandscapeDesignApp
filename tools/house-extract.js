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

/* Footprint and the new work flag stay as they are. The footprints are the
   architect's own site plan traced at 1:200 and the model agrees with them to
   20 mm, so re-deriving them would move the whole layout for no gain. Column 7
   is 1 for new build, which is how the Shape view knows to leave a building out
   of the surveyed half. Only the ridge and the eave come from the model. */
const BOXH = [
  ['existing house', 20.38, 1.77, 29.01, 17.79, 0],
  ['east wing', 25.94, 1.77, 33.33, 8.06, 0],
  ['rear addition', 9.66, 11.96, 16.32, 17.96, 1],
  ['link', 16.32, 12.51, 21.25, 13.88, 1],
  ['garage', 16.32, 17.34, 27.91, 21.21, 0],
  ['kitchen addition', 19.95, 2.3, 21.52, 7.48, 1]
];
const boxOf = n => BOXH.find(b => b[0] === n);
const inBox = (b, x, y, g) => x >= b[1] - g && x <= b[3] + g && y >= b[2] - g && y <= b[4] + g;


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

const shoelace = poly => {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  return Math.abs(a) / 2;
};
/* The building grid angle as sine and cosine, used to un-turn an axis-aligned
   IFC bounding box back into the rectangle inside it. Both the glazing and the
   roof coverage test need it. */
const th0 = gridDeg * Math.PI / 180;
const c0 = Math.abs(Math.cos(th0)), s0 = Math.abs(Math.sin(th0)), c2 = c0 * c0 - s0 * s0;

/* ---- 4. transform everything ---- */

const storeys = H.storeys.map(s => [s.name, r3(s.world_z_m)]);
const sIdx = n => Math.max(0, storeys.findIndex(s => s[0] === n));

const walls = H.walls.filter(w => w.start && w.end).map(w => {
  const a = T(w.start), b = T(w.end);
  return { a: a, b: b, t: w.thickness_m, z0: w.base_z, z1: w.top_z, st: w.storey,
           name: w.name, id: w.GlobalId };
});

/* Floors first, because the external wall test needs them. IfcRoof entries that
   only aggregate a slab already listed carry no geometry, and are dropped.

   A roof arrives as one entry per solid with a list of its upward faces. A
   gable has two and they are kept as two, because a section cutting the roof
   has to meet both slopes. Older exports carry a single face at the top level
   and no list, and those still read: the fallback below makes a one-face list
   out of them. */
const facesOf = s => {
  if (Array.isArray(s.faces) && s.faces.length) return s.faces;
  if (!s.boundary) return [];
  /* Where the roof came off a brep, the face carries its own z and the solid's
     bbox does not: s.z_min sits at the fascia soffit, 228 mm under the eave.
     Where it came off an extrusion, boundary_z is the base polygon and the
     solid rises above it by its thickness, so the bbox is the one to read. */
  const brep = s.geometry_source === 'brep_top_face';
  return [{boundary: s.boundary, boundary_z: s.boundary_z, plane: s.plane || null,
           z_min: brep ? s.top_face_z_min : s.z_min,
           z_max: brep ? s.top_face_z_max : s.z_max}];
};
const isRoof = s => s.class === 'IfcRoof' || s.PredefinedType === 'ROOF';
const slabs = [];
H.slabs.forEach(s => {
  if (!s.boundary || s.boundary.length < 3) return;
  const common = {kind: isRoof(s) ? 'roof' : 'floor', thick: s.thickness_m,
                  st: s.storey, name: s.name, area: s.area_m2, id: s.GlobalId};
  if (!isRoof(s)) {
    slabs.push(Object.assign({poly: s.boundary.map(T), bz: s.boundary_z || null,
      z0: s.z_min, z1: s.z_max, plane: null,
      eave: s.eave_z != null ? s.eave_z : null,
      ridge: s.ridge_z != null ? s.ridge_z : null}, common));
    return;
  }
  const fs = facesOf(s);
  fs.forEach((fc, i) => {
    if (!fc.boundary || fc.boundary.length < 3) return;
    const zs = fc.boundary_z || null;
    const lo = fc.z_min != null ? fc.z_min : (zs ? Math.min.apply(null, zs) : s.z_min);
    const hi = fc.z_max != null ? fc.z_max : (zs ? Math.max.apply(null, zs) : s.z_max);
    slabs.push(Object.assign({poly: fc.boundary.map(T), bz: zs,
      z0: lo, z1: hi, plane: fc.plane || null, eave: lo, ridge: hi,
      face: i, faces: fs.length}, common));
  });
});
const dropped = H.slabs.length - slabs.length;
if (dropped > 0) say(dropped + ' slab records carry no geometry and are dropped (aggregate wrappers)');
const multi = slabs.filter(s => s.kind === 'roof' && s.faces > 1).length;
if (multi) say(multi + ' roof faces come from solids with more than one slope');

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

/* How a door opens, and how wide the leaf really is.

   Two things in the export cannot be drawn from directly. width_m is the IFC
   OverallWidth of the whole unit, which for a cavity slider is the pocket and
   not the leaf: the 1060 sliders report 2.196 m. And nothing in the geometry
   says whether a door swings or slides.

   Both are in the type name, which carries the family and the nominal leaf:
   ASA_Concealed Cavity Slider:1060 x 2400. The architect's floor plan A2.02
   agrees with it, calling up two full height cavity sliders at 1060, a square
   set at 820 and a three track sliding door at the patio, and drawing a swing
   only on the feature entry door. Where the two could differ the plan is the
   record, so these are the rules the plan draws by:

     swings   the arc is drawn, and the leaf is the nominal width
     slides   no arc, the leaf runs back into its pocket

   Door - Solidcore is the feature entry door at 870, which A2.02 draws with a
   swing. It carries no size in its name, so its reported width stands. */
const openKind = name => {
  const n = String(name || '');
  if (/Slider|Sliding/i.test(n)) return 'slide';
  return 'hinge';
};
const openPanels = name => {
  const m = /(\d)[\s_-]*Panel/i.exec(String(name || ''));
  return m ? +m[1] : 1;
};
const openLeaf = (name, fallback) => {
  const m = /:(\d{3,4})\s*w?\s*[xX]\s*(\d{3,4})/.exec(String(name || ''));
  if (!m) return fallback;
  const mm = +m[1];
  return mm >= 300 && mm <= 6000 ? r3(mm / 1000) : fallback;
};
/* The feature entry door is placed in the model without a host and cuts
   nothing, so it was drawn nowhere: the plan skips an opening it cannot put in
   a wall. Its centre sits 2 mm off a 230 double brick wall, so the wall it
   belongs to is not in doubt. Anything unhosted takes the nearest wall within
   300 mm, and stays unhosted past that rather than being guessed onto one. */
let adopted = 0;
const nearestWall = c => {
  let best = -1, bd = 0.3;
  walls.forEach((w, i) => {
    const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1], L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    const t = Math.max(0, Math.min(1, ((c[0] - w.a[0]) * dx + (c[1] - w.a[1]) * dy) / (L * L)));
    const d = Math.hypot(c[0] - (w.a[0] + dx * t), c[1] - (w.a[1] + dy * t));
    if (d < bd) { bd = d; best = i; }
  });
  return best;
};
const openings = H.openings.map(o => {
  const c = T(o.centre), door = o.class === 'IfcDoor';
  let host = o.host_wall != null && wallIdx[o.host_wall] != null ? wallIdx[o.host_wall] : -1;
  if (host < 0) { host = nearestWall(c); if (host >= 0) adopted++; }
  return [door ? 'door' : 'window', r3(c[0]), r3(c[1]),
          r3(o.width_m), r3(o.height_m), r3(o.sill_z),
          host,
          sIdx(o.storey), o.name,
          door ? openKind(o.name) : null,
          door ? openLeaf(o.name, r3(o.width_m)) : r3(o.width_m),
          door ? openPanels(o.name) : 1];
});
if (adopted) say(adopted + ' unhosted opening takes its nearest wall');
const slid = openings.filter(o => o[9] === 'slide').length;
say(slid + ' of ' + openings.filter(o => o[0] === 'door').length + ' doors slide, the rest swing');

/* Glazing came across as a bounding box and nothing else, and the box is
   axis-aligned to the IFC world rather than to the building. A panel 2.75 m
   long and 50 mm thick, sitting 14 degrees off those axes, has a box 2.747 by
   0.829: the box is most of a metre thick where the glass is a finger wide.
   Transforming the box and re-boxing it keeps that error and draws a room-sized
   rectangle where there is a window.

   The panel can be recovered exactly, because the angle is known. For a
   rectangle L by t turned by theta inside an axis-aligned box Wx by Wy,

     Wx = L cos + t sin        L = (Wx cos - Wy sin) / cos 2theta
     Wy = L sin + t cos        t = (Wy cos - Wx sin) / cos 2theta

   which is solvable while cos 2theta stays away from zero, and at 14.37 degrees
   it is 0.877. Which way round the panel runs is not decided by algebra, so
   both are tried and the one that rebuilds the given box is kept. */
let cwFallback = 0;
const cwalls = H.curtain_walls.map(c => {
  const Wx = c.bbox[1][0] - c.bbox[0][0], Wy = c.bbox[1][1] - c.bbox[0][1];
  const mid = T([(c.bbox[0][0] + c.bbox[1][0]) / 2, (c.bbox[0][1] + c.bbox[1][1]) / 2]);
  let best = null;
  if (Math.abs(c2) > 0.2) [[Wx, Wy], [Wy, Wx]].forEach(([A, B], swap) => {
    const L = (A * c0 - B * s0) / c2, t = (B * c0 - A * s0) / c2;
    if (L <= 0 || t <= 0) return;
    /* rebuild the box this pair would have made, and keep it only if it is the
       box the export actually carried */
    const gx = L * c0 + t * s0, gy = L * s0 + t * c0;
    const err = swap ? Math.abs(gx - Wy) + Math.abs(gy - Wx) : Math.abs(gx - Wx) + Math.abs(gy - Wy);
    if (err < 0.002 && (!best || err < best.err)) best = { L: L, t: t, swap: swap, err: err };
  });
  let hx, hy;
  if (best) { const lx = best.swap ? best.t : best.L, ly = best.swap ? best.L : best.t;
              hx = lx / 2; hy = ly / 2; }
  else { cwFallback++; hx = Math.max(Wx, Wy) / 2; hy = Math.min(Wx, Wy) / 2; }
  return [r3(mid[0] - hx), r3(mid[1] - hy), r3(mid[0] + hx), r3(mid[1] + hy),
          r3(c.base_z), r3(c.top_z), sIdx(c.storey), c.name];
});
if (cwFallback) say(cwFallback + ' of ' + cwalls.length + ' glazing panels could not be un-boxed and keep their bounding box');

/* ---- 4b. does every roof face come across? ---- */

/* A roof solid's own bounding box is in the IFC world frame, turned off the
   building grid, so it says nothing directly. Un-turning it the way the glazing
   is un-turned gives the roof's plan rectangle, and that is the area its faces
   should add up to. A gable whose second slope was dropped covers half of it.

   This is the test that would have caught the tile roof over the existing
   house: exported as 16.02 by 4.318 where the solid's box un-turns to 16.02 by
   8.636. Ridge and eave were right, so nothing else noticed. */
const unboxArea = (Wx, Wy) => {
  if (Math.abs(c2) < 0.2) return null;
  let best = null;
  [[Wx, Wy], [Wy, Wx]].forEach(([A, B]) => {
    const L = (A * c0 - B * s0) / c2, t = (B * c0 - A * s0) / c2;
    if (L <= 0 || t <= 0) return;
    const gx = L * c0 + t * s0, gy = L * s0 + t * c0;
    const err = Math.min(Math.abs(gx - Wx) + Math.abs(gy - Wy),
                         Math.abs(gx - Wy) + Math.abs(gy - Wx));
    if (err < 0.01 && (!best || err < best.err)) best = {a: L * t, err: err};
  });
  return best ? best.a : null;
};
const partialRoofs = [];
H.slabs.forEach(sl => {
  if (!(sl.class === 'IfcRoof' || sl.PredefinedType === 'ROOF') || !sl.bbox) return;
  const solid = unboxArea(sl.bbox[1][0] - sl.bbox[0][0], sl.bbox[1][1] - sl.bbox[0][1]);
  if (!solid || solid < 2) return;
  const covered = slabs.filter(x => x.id === sl.GlobalId && x.kind === 'roof')
    .reduce((n, x) => n + shoelace(x.poly), 0);
  if (covered < solid * 0.75)
    partialRoofs.push({name: sl.name, covered: r2(covered), solid: r2(solid)});
});
if (partialRoofs.length) {
  say(partialRoofs.length + ' roof' + (partialRoofs.length === 1 ? '' : 's')
    + ' came across with only part of the solid, so a section through them draws part of a roof:');
  partialRoofs.forEach(r => say('  ' + r.covered + ' m2 of ' + r.solid + ' m2  ' + r.name));
  say('  re-run tools/ifc/extract.py against the IFC to pick up every upward face');
}

/* A roof off a brep carries no thickness, but its type name does: the family
   is called Tile Roof - 210 or Metal Roof - 180, and that number is the build
   up in millimetres. The two roofs that came across as extrusions confirm the
   convention, measuring 158 mm against a name of 150 and 181 against 180. So
   the name is read where there is nothing to measure, and the measurement wins
   where there is one. Only the section drawing uses this. */
const roofThick = s => {
  if (s.thick > 0) return s.thick;
  const m = /-\s*(\d{2,4})\s*(?::|$)/.exec(String(s.name || ''));
  const mm = m ? +m[1] : 0;
  return mm >= 20 && mm <= 500 ? mm / 1000 : 0.15;
};

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
  const row = [b[0], b[1], b[2], b[3], b[4], r2(ridge), r2(eave)];
  if (b[5]) row.push(1);
  return row;
});

/* ---- 5b. the outline the plan should draw ---- */

/* The plan has been drawing BLDS, nine paths traced off the site plan PDF, and
   the massing has been drawing six rectangles. Neither is the building. The
   building is the region the external walls enclose, and that is what this
   works out.

   It is done on a grid rather than by unioning polygons, because a polygon
   union of 19 overlapping wall rectangles is a great deal of code to get one
   outline and every corner case in it is a hairline. On a 50 mm grid the
   building is rectilinear and axis-aligned in this frame, so the traced
   boundary is exact once collinear runs are dropped, and the cell count gives
   the footprint area for free. That area is the thing the earthworks want: it
   is the ground that is under the house and cannot be regraded or stripped. */

const CELL = 0.05;
const ext = walls.map(intQuad).filter(Boolean);
function intQuad(w) {
  const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1], L = Math.hypot(dx, dy);
  if (L < 1e-6) return null;
  /* half a cell of reach on each side, so two walls meeting at a corner touch
     on the grid instead of leaving a hairline for the fill to leak through */
  const t = w.t / 2 + CELL, ux = dx / L, uy = dy / L, nx = -uy * t, ny = ux * t;
  const ex = ux * CELL, ey = uy * CELL;
  return [[w.a[0] + nx - ex, w.a[1] + ny - ey], [w.b[0] + nx + ex, w.b[1] + ny + ey],
          [w.b[0] - nx + ex, w.b[1] - ny + ey], [w.a[0] - nx - ex, w.a[1] - ny - ey]];
}
/* A floor counts as house if it sits inside one of the six building extents.

   Being under a roof was tried first and got two things wrong. The paved
   terrace sits under a transparent canopy, which is a roof in the model, so
   49.6 m2 of paving was drawn as building. And both tile roofs are missing a
   pitch, so eight rooms under the half that did not come across read as
   unroofed and were cut out of the outline.

   The boxes have neither problem. They are the architect's own building
   extents off the site plan, the model agrees with them to 20 mm, and a canopy
   over a courtyard is not one of them. They decide what counts; the walls and
   the slabs still give the shape inside. The 200 mm of reach picks up a slab
   sitting on the line of its own box. */
const houseFloors = floors.filter(f => {
  const c = f.poly.reduce(function (a, p) { return [a[0] + p[0], a[1] + p[1]]; }, [0, 0]);
  const n = f.poly.length;
  return BOXH.some(b => inBox(b, c[0] / n, c[1] / n, 0.2));
});
const openFloors = floors.length - houseFloors.length;

/* The grid has to cover the floors as well as the walls. Sizing it off the
   walls alone lost the garage: it has no modelled wall past y 18.02, being
   open along its long side, and its slab reaches y 21.34. Those cells fell
   outside the array and the footprint came out 40 m2 short. */
const gb = bbox([].concat(...ext, ...houseFloors.map(f => f.poly)));
const GX0 = gb[0] - 0.5, GY0 = gb[1] - 0.5;
const NXc = Math.ceil((gb[2] - GX0 + 0.5) / CELL), NYc = Math.ceil((gb[3] - GY0 + 0.5) / CELL);
const cellAt = (i, j) => [GX0 + (i + 0.5) * CELL, GY0 + (j + 0.5) * CELL];

const WALLC = new Uint8Array(NXc * NYc);
ext.forEach(q => {
  const b = bbox(q);
  const i0 = Math.max(0, Math.floor((b[0] - GX0) / CELL)), i1 = Math.min(NXc - 1, Math.ceil((b[2] - GX0) / CELL));
  const j0 = Math.max(0, Math.floor((b[1] - GY0) / CELL)), j1 = Math.min(NYc - 1, Math.ceil((b[3] - GY0) / CELL));
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++)
    if (!WALLC[j * NXc + i] && inPoly(cellAt(i, j), q)) WALLC[j * NXc + i] = 1;
});

/* Floors fill what the walls surround. Flooding the outside and keeping what
   it cannot reach was tried first and gave 20 m2, because the 19 external walls
   do not close: glazing and breeze block make up part of the enclosure and
   those are not walls. Marking walls and floors directly needs no watertight
   ring and cannot leak.

   A floor counts as house if it is under a roof. That is what separates the
   rooms from the driveway apron and the brick paving, which are floor slabs in
   the model too and are not building. */
houseFloors.forEach(f => {
  const b = bbox(f.poly);
  const i0 = Math.max(0, Math.floor((b[0] - GX0) / CELL)), i1 = Math.min(NXc - 1, Math.ceil((b[2] - GX0) / CELL));
  const j0 = Math.max(0, Math.floor((b[1] - GY0) / CELL)), j1 = Math.min(NYc - 1, Math.ceil((b[3] - GY0) / CELL));
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++)
    if (!WALLC[j * NXc + i] && inPoly(cellAt(i, j), f.poly)) WALLC[j * NXc + i] = 1;
});
const IN = WALLC;
let cells = 0;
for (let k = 0; k < IN.length; k++) if (IN[k]) cells++;
const footprint_m2 = r2(cells * CELL * CELL);
say(houseFloors.length + ' floor slabs are inside a building extent, ' + openFloors + ' are paving outside one');

/* Trace the boundary. Every cell edge with house on one side and not on the
   other is a segment; the segments are then chained into rings and collinear
   runs collapsed, which on a rectilinear building leaves the corners and
   nothing else. */
const key = p => p[0] + ',' + p[1];
function trace(mask) {
const has = (i, j) => i >= 0 && j >= 0 && i < NXc && j < NYc && mask[j * NXc + i] === 1;
const segs = new Map();
const addSeg = (a, b) => { const k = key(a); if (!segs.has(k)) segs.set(k, []); segs.get(k).push(b); };
for (let i = 0; i < NXc; i++) for (let j = 0; j < NYc; j++) {
  if (!has(i, j)) continue;
  /* wound so the house is on the left, which keeps outer rings one way round */
  if (!has(i, j - 1)) addSeg([i, j], [i + 1, j]);
  if (!has(i + 1, j)) addSeg([i + 1, j], [i + 1, j + 1]);
  if (!has(i, j + 1)) addSeg([i + 1, j + 1], [i, j + 1]);
  if (!has(i - 1, j)) addSeg([i, j + 1], [i, j]);
}
const rings = [];
while (segs.size) {
  const start = segs.keys().next().value;
  let cur = start.split(',').map(Number), ring = [cur];
  for (;;) {
    const list = segs.get(key(cur));
    if (!list || !list.length) break;
    const nxt = list.pop();
    if (!list.length) segs.delete(key(cur));
    ring.push(nxt); cur = nxt;
    if (key(cur) === key(ring[0])) break;
  }
  if (ring.length > 8) rings.push(ring);
}
const simplify = ring => {
  const out = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const p = ring[(i - 1 + ring.length - 1) % (ring.length - 1)], c = ring[i], n = ring[i + 1];
    if ((c[0] - p[0]) * (n[1] - c[1]) !== (c[1] - p[1]) * (n[0] - c[0])) out.push(c);
  }
  return out;
};
return rings.map(simplify).filter(r => r.length >= 4).map(r =>
  r.map(p => [r3(GX0 + p[0] * CELL), r3(GY0 + p[1] * CELL)]));
}

const OUTLINE = trace(IN);
OUTLINE.sort((a, b) => Math.abs(shoelace(b)) - Math.abs(shoelace(a)));

/* The plan draws one path per building, not one merged outline.

   Merging them was the first attempt and it read badly: the garage, the east
   wing and the house ran together into a single blob and the additions stopped
   being legible as additions. The traced paths this replaces kept the
   buildings apart, and a plan has to.

   Each cell goes to the smallest building extent that contains it. Smallest
   matters, because the boxes overlap: the kitchen addition sits inside the
   existing house's box, and picking the first or the largest match drew that
   pop-out as existing rather than as new work. The smallest containing box is
   always the specific one. */
const boxFor = (x, y) => {
  let best = null, bestA = Infinity;
  BOXH.forEach(b => {
    if (!inBox(b, x, y, 0.2)) return;
    const a = (b[3] - b[1]) * (b[4] - b[2]);
    if (a < bestA) { bestA = a; best = b; }
  });
  return best;
};
const masks = BOXH.map(() => new Uint8Array(NXc * NYc));
let newCells = 0, orphan = 0;
for (let i = 0; i < NXc; i++) for (let j = 0; j < NYc; j++) {
  const k = j * NXc + i; if (!IN[k]) continue;
  const c = cellAt(i, j), b = boxFor(c[0], c[1]);
  if (!b) { orphan++; continue; }
  masks[BOXH.indexOf(b)][k] = 1;
  if (b[5]) newCells++;
}
if (orphan) say(r2(orphan * CELL * CELL) + ' m2 of footprint sits in no building extent and is not drawn');
const footprint_new_m2 = r2(newCells * CELL * CELL);
const asPath = rs => rs.map(r => 'M' + r.map(q => n2(q[0]) + ' ' + n2(YTOP - q[1])).join('L') + 'Z').join('');
const n2 = v => (Math.round(v * 100) / 100).toFixed(2);
const YTOP = 23.5;                     /* the plan draws y flipped, as fy() does */
const BLDS = BOXH.map((b, i) => ({k: b[5] ? 'proposed' : 'existing', n: b[0], d: asPath(trace(masks[i]))}))
  .filter(b => b.d);
say('footprint ' + footprint_m2 + ' m2 in ' + OUTLINE.length + ' ring'
  + (OUTLINE.length === 1 ? '' : 's') + ', ' + OUTLINE.reduce((n, r) => n + r.length, 0) + ' corners');

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
                        s.bz ? s.bz.map(r3) : null, r3(roofThick(s))]),
  OPEN: openings,
  CWALL: cwalls,
  BOXH: boxh.filter(Boolean),
  OUTLINE: OUTLINE,
  BLDS: BLDS,
  ROOF_PARTIAL: partialRoofs,
  FOOTPRINT: footprint_m2,
  FOOTPRINT_NEW: footprint_new_m2
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
