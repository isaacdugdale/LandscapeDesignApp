/* Loads the app under node so a script can ask it things.

   The app is one HTML file with no build step, so the class body is pulled out
   by pattern and never by line number: line numbers move under every edit, and
   every throwaway harness written against them broke on the next change.

   Returns make(), which gives a fresh instance wired up the way boot() does.
   window.DUFFY and window.HANDBOOK are on the global after this runs. */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

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

module.exports = { load: loadApp, ROOT, R };
