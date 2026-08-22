#!/usr/bin/env node
/* Runs the app under node and asserts what a change must not break.
   `node tools/check.js` before you ship anything. `--update` rewrites the
   baseline, which you should only do when a count moved on purpose.

   The app is one HTML file with no build step, so the class body is pulled out
   by pattern rather than by line number. Line numbers moved under every edit in
   the session this was written in, and every ad-hoc harness broke on them. */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'baseline.json');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let failed = 0, checked = 0;
const ok = (name, cond, detail) => {
  checked++;
  if (cond) return true;
  failed++;
  console.log('  FAIL  ' + name + (detail ? '  ' + detail : ''));
  return false;
};
const eq = (name, got, want) => ok(name, got === want, 'got ' + got + ', want ' + want);

/* ---------- load the app ---------- */

function loadApp() {
  global.window = global;
  global.localStorage = {
    _d: {}, getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }
  };
  global.document = { addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, getElementById() { return null; } };
  global.DCLogic = class { constructor() { this.state = {}; } setState(o) { Object.assign(this.state, o); } };

  require(path.join(ROOT, 'site-data.js'));
  require(path.join(ROOT, 'handbook.js'));

  const src = R('index.html');
  /* the module-level consts sit between the DC script tag and the class */
  const tag = src.indexOf('data-dc-script');
  const cls = src.indexOf('\nclass Component extends DCLogic {');
  if (tag < 0 || cls < 0) throw new Error('cannot find the class in index.html');
  const preStart = src.indexOf('>', tag) + 1;
  const pre = src.slice(preStart, cls);
  /* the class ends at the first column-zero brace after it */
  const end = src.indexOf('\n}\n', cls);
  const body = src.slice(cls, end + 3);

  const Component = eval(pre + body + '\n;Component');
  return function make() {
    const a = Object.create(Component.prototype);
    a.state = {}; a.setState = o => Object.assign(a.state, o);
    const D = window.DUFFY;
    a.D = D; a.C = D.TREND; a.YTOP = D.YTOP;
    a.LIBM = {}; D.LIB.forEach(l => a.LIBM[l[0]] = l);
    a.PL = {}; D.PLANTS.forEach(p => { if (!a.PL[p.n]) a.PL[p.n] = p; });
    a.BLDR = D.BOXH.map(b => [b[0], b[1], b[2], b[3], b[4]])
      .concat((D.DRIVE || []).map(d => [d[0], d[1], d[2], d[3], d[4]]));
    return a;
  };
}

const make = loadApp();
const D = window.DUFFY;

/* ---------- the handbook ---------- */

console.log('handbook');
const H = window.HANDBOOK;
eq('sections', H.length, 13);
ok('no undefined blocks', H.every(s => s.blocks.every(b => b !== undefined)),
   'a missing comma between two blocks parses as an index expression and yields undefined');
ok('every block has a type', H.every(s => s.blocks.every(b => typeof b[0] === 'string')));
ok('every section has an id, group and nav', H.every(s => s.id && s.group && s.nav));
ok('the earthworks section exists', !!H.find(s => s.id === 'earthworks'),
   'it renders the setout drawing and the volumes schedule');

/* ---------- levels ---------- */

console.log('levels');
{
  const a = make();
  let worst = 0;
  D.SPOT.forEach(p => { const e = Math.abs(a.RL(p[0], p[1]) - p[2]); if (e > worst) worst = e; });
  ok('RL is exact at all ' + D.SPOT.length + ' surveyed points', worst < 1e-9,
     'worst ' + (worst * 1000).toFixed(4) + ' mm');
  ok('every TRI index points at a real SPOT',
     D.TRI.every(t => t.every(i => i >= 0 && i < D.SPOT.length)));
  ok('RL is finite across the block', (() => {
    for (let x = 0; x <= 40; x += 2) for (let y = 0; y <= 21; y += 2)
      if (!isFinite(a.RL(x, y))) return false;
    return true;
  })());
}

/* ---------- the element library ---------- */

console.log('library');
{
  const bad = D.LIB.filter(l => typeof l[3] !== 'number' || typeof l[4] !== 'number' || typeof l[5] !== 'number');
  ok('every LIB row has numeric w, h and cost', bad.length === 0, bad.map(l => l[0]).join(', '));
  const rows = [].concat(D.START, ...D.SCHEMES.map(s => s.items));
  const norot = rows.filter(r => typeof r[5] !== 'number');
  ok('every item row carries a numeric rot', norot.length === 0,
     'a dropped rot reads the build-up depth as a rotation and the cost comes out NaN: ' +
     norot.map(r => r[0]).join(', '));
}

/* ---------- every scheme ---------- */

console.log('schemes');
const seen = {};
for (const id of ['base'].concat(D.SCHEMES.map(s => s.id))) {
  const a = make();
  let b;
  try { b = id === 'base' ? a.baseItems() : a.seedScheme(id); }
  catch (e) { ok(id + ' builds', false, e.message); continue; }
  a.state = { items: b.items, uid: b.uid, sel: null, doy: 1, hour: 12, schemeId: id };
  const q = a.quantities(), w = a.water(), is = a.issues();
  ok(id + ' costs a finite amount', isFinite(q.cost), String(q.cost));
  ok(id + ' holds a finite volume', isFinite(w.held), String(w.held));
  ok(id + ' gives every issue a title and a body',
     is.every(i => i.title && i.body && i.sev));
  seen[id] = { items: b.items.length, issues: is.length,
    stop: is.filter(i => i.sev === 'stop').length,
    care: is.filter(i => i.sev === 'care').length,
    cost: Math.round(q.cost), held: +w.held.toFixed(2) };
}
for (const s of D.SCHEMES) ok('scheme ' + s.id + ' has notes', (s.notes || '').length > 50);

/* ---------- prose ---------- */

console.log('prose');
{
  /* STYLE.md allows a range dash inside a table cell and a plant name that has to
     match its key in site-data.js. Those are counted, not waved through, so a new
     one shows up as a failure rather than hiding inside an allowance. */
  const allow = {'bloom.js': 1, 'STYLE.md': 2};
  const files = ['index.html', 'printsheet.js', 'bloom.js', 'sw.js', 'README.md', 'CLAUDE.md', 'STYLE.md'];
  for (const f of files) {
    const s = R(f);
    const lit = (s.match(/[—–]/g) || []).length;
    const esc = (s.match(/\\u201[34]/g) || []).length;
    const let_ = allow[f] || 0;
    ok(f + ' has no dash in prose' + (let_ ? ' beyond its ' + let_ + ' allowed' : ''),
       lit + esc === let_, lit + ' literal, ' + esc + ' escaped, ' + let_ + ' allowed');
  }
  /* handbook.js keeps range dashes inside table cells, so only its prose is checked */
  let bad = 0;
  H.forEach(s => s.blocks.forEach(b => {
    const t = ['p', 'note', 'h'].includes(b[0]) ? [b[1]] : (b[0] === 'ul' ? b[1] : []);
    t.forEach(x => { if (typeof x === 'string' && /[—–]/.test(x)) bad++; });
  }));
  eq('handbook prose blocks with a dash', bad, 0);
}

/* ---------- seeding ---------- */

console.log('seeding');
{
  const a = make();
  const first = D.SCHEMES[0].id;
  localStorage.setItem(a.key(), JSON.stringify({
    seeded: [first], schemes: { [first]: { name: 'edited', items: [{ u: 1 }], uid: 9 } },
    index: [{ id: first, name: 'edited' }]
  }));
  a.state = { items: [], schemes: [{ id: first, name: 'edited' }], sel: null };
  a.seedStore();
  const after = JSON.parse(localStorage.getItem(a.key()));
  ok('an edited scheme already on the device is left alone',
     after.schemes[first].items.length === 1 && after.schemes[first].uid === 9);
  ok('a scheme the device has not seen is added',
     D.SCHEMES.every(s => after.seeded.includes(s.id)));
}
{
  /* revisions: a corrected note has to reach a device that already has the scheme,
     without ever touching the layout or overwriting what the owner wrote there */
  const id = D.SCHEMES[0].id;
  const seed = () => { const a = make(); a.state = { items: [], schemes: [], sel: null };
    a.toast = () => {}; a.seedStore(); return a; };
  const store = () => JSON.parse(localStorage.getItem(make().key()) || '{}');
  ok('every scheme carries a rev', D.SCHEMES.every(s => typeof (s.rev || 1) === 'number'));

  localStorage.removeItem(make().key());
  seed();
  let st = store();
  ok('a fresh device records a rev per scheme', Object.keys(st.revs).length === D.SCHEMES.length);

  st.revs[id] = 1; st.schemes[id].notes = 'OLD'; st.noteH[id] = make().hash('OLD');
  localStorage.setItem(make().key(), JSON.stringify(st));
  seed(); st = store();
  ok('a corrected note reaches a device on an older rev', st.schemes[id].notes !== 'OLD');

  st.revs[id] = 1; st.schemes[id].notes = 'OWNER WROTE THIS';
  st.noteH[id] = make().hash('something the app seeded');
  st.schemes[id].items = [{ u: 1 }]; st.schemes[id].uid = 9;
  localStorage.setItem(make().key(), JSON.stringify(st));
  seed(); st = store();
  ok('a note the owner has written in is never overwritten', st.schemes[id].notes === 'OWNER WROTE THIS');
  ok('the layout is never touched by a rev bump',
     st.schemes[id].items.length === 1 && st.schemes[id].uid === 9);

  const before = JSON.stringify(store()); seed();
  ok('a second open changes nothing', before === JSON.stringify(store()));
}

/* ---------- the baseline ---------- */

console.log('baseline');
if (process.argv.includes('--update')) {
  fs.writeFileSync(BASELINE, JSON.stringify(seen, null, 1) + '\n');
  console.log('  baseline rewritten, ' + Object.keys(seen).length + ' schemes');
} else if (!fs.existsSync(BASELINE)) {
  console.log('  no baseline yet, run with --update');
} else {
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  for (const id of Object.keys(base)) {
    if (!seen[id]) { ok('scheme ' + id + ' still exists', false); continue; }
    for (const k of Object.keys(base[id]))
      eq(id + '.' + k, seen[id][k], base[id][k]);
  }
  for (const id of Object.keys(seen))
    ok('scheme ' + id + ' is in the baseline', !!base[id], 'run with --update if it is new');
}

console.log('\n' + (failed ? failed + ' failed of ' + checked : 'all ' + checked + ' checks passed'));
process.exit(failed ? 1 : 0);
