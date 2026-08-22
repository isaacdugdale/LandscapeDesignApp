#!/usr/bin/env node
/* Ask the app a question without writing a harness first.

   Most of the cost of working on this repo has been rebuilding a loader to
   answer one question: what does this scheme cost, what does Checks say about
   that item, what is the ground level there. This does that in one line.

     node tools/ask.js schemes                       every scheme, at a glance
     node tools/ask.js issues s-sumps                every check, by severity
     node tools/ask.js issues s-sumps stop           just the stops
     node tools/ask.js item s-sumps "Yard sump"      every item of that name
     node tools/ask.js rl 12 4                       ground level at x, y
     node tools/ask.js data                          what site-data.js holds
     node tools/ask.js eval s-sumps "a.water().held" run an expression, with
                                                     a as the app and b as the built scheme
*/
const { load, R } = require('./load.js');
const make = load();
const D = window.DUFFY;
const [cmd, ...rest] = process.argv.slice(2);

function build(id) {
  const a = make();
  const b = id === 'base' ? a.baseItems() : a.seedScheme(id);
  if (!b) throw new Error('no scheme "' + id + '". Try: ' + D.SCHEMES.map(s => s.id).join(', '));
  a.state = { items: b.items, uid: b.uid, sel: null, doy: 1, hour: 12, schemeId: id };
  return { a, b };
}
const n = (x, d) => (typeof x === 'number' ? x.toFixed(d === undefined ? 2 : d) : x);

if (!cmd || cmd === 'help') { console.log(R('tools/ask.js').split('*/')[0].split('\n').slice(2).join('\n')); process.exit(0); }

if (cmd === 'schemes') {
  for (const id of ['base'].concat(D.SCHEMES.map(s => s.id))) {
    const { a, b } = build(id);
    const q = a.quantities(), w = a.water(), is = a.issues();
    const sc = D.SCHEMES.find(s => s.id === id);
    console.log(id.padEnd(18) + 'rev ' + (sc ? sc.rev || 1 : '-') +
      '  items ' + String(b.items.length).padStart(3) +
      '  $' + String(Math.round(q.cost)).padStart(6) +
      '  holds ' + n(w.held) + ' m3' +
      '  issues ' + String(is.length).padStart(3) +
      ' (' + is.filter(i => i.sev === 'stop').length + ' stop, ' +
      is.filter(i => i.sev === 'care').length + ' care)');
  }
} else if (cmd === 'issues') {
  const { a } = build(rest[0] || 'base');
  const want = rest[1];
  a.issues().filter(i => !want || i.sev === want).forEach(i =>
    console.log('[' + i.sev + '] ' + i.title + '\n        ' + (i.body || '').replace(/\s+/g, ' ').slice(0, 150)));
} else if (cmd === 'item') {
  const { a, b } = build(rest[0]);
  const name = (rest[1] || '').toLowerCase();
  b.items.filter(it => it.n.toLowerCase().includes(name)).forEach(it => {
    const ck = a.checks(it);
    console.log(it.n + '  u' + it.u + '  x ' + n(it.x) + ' y ' + n(it.y) +
      '  ' + (a.isRun(it) ? n(a.runLen(it)) + ' m run' : n(it.w) + ' x ' + n(it.h)) +
      '  area ' + n(a.area(it)) + ' m2  RL ' + n(a.RL(...a.centre(it))) +
      '  lvl ' + ck.lvl + (ck.why ? ' (' + ck.why + ')' : ''));
  });
} else if (cmd === 'rl') {
  const a = make(), x = +rest[0], y = +rest[1];
  console.log('RL at x ' + x + ', y ' + y + ' = ' + a.RL(x, y).toFixed(3) + ' m AHD');
} else if (cmd === 'data') {
  console.log('keys: ' + Object.keys(D).join(', '));
  console.log('SCHEMES ' + D.SCHEMES.length + '  LIB ' + D.LIB.length + '  PLANTS ' + D.PLANTS.length +
    '  START ' + D.START.length + '  STARTP ' + D.STARTP.length +
    '  SPOT ' + D.SPOT.length + '  TRI ' + D.TRI.length + '  TREES ' + D.TREES.length);
  console.log('LIB: ' + D.LIB.map(l => l[0]).join(', '));
  console.log('handbook: ' + window.HANDBOOK.map(s => s.group + '/' + s.id).join(', '));
} else if (cmd === 'eval') {
  const { a, b } = build(rest[0]);
  console.log(eval(rest[1]));
} else {
  console.log('unknown command "' + cmd + '". Run: node tools/ask.js help');
  process.exit(1);
}
