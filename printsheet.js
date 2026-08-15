/* The printable set: three sheets built from whatever is on the plan right now.

   Everything is drawn in millimetres at a true, stated scale, so a dimension
   taken off the paper with a ruler is real. The plan is vector, not a screenshot
   of the editor — heavier boundary, no selection handles, numbered keys instead
   of labels crowding the drawing, and a title block.

   Entry point: PRINTSHEET.open(app, size) — 'A4' or 'A3', both landscape. */
window.PRINTSHEET = (function () {

  /* page, margin, title strip, footer strip — all mm */
  var PAGE = {
    A4: {w: 297, h: 210, m: 10, head: 19, foot: 23, body: 3.05, head1: 6.4, head2: 4.4},
    A3: {w: 420, h: 297, m: 13, head: 25, foot: 28, body: 3.5,  head1: 8.4, head2: 5.2}
  };
  /* Only scales a drawing is allowed to be issued at. The plan takes the
     largest one that still fits, and says which on the sheet. */
  var SCALES = [50, 75, 100, 125, 150, 200, 250, 300];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var INK = '#2e2b25', MUT = '#6f6959', FAINT = '#b9b1a1', RULE = '#d8d0c0', PAPER = '#ffffff';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var n1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1); };
  var money = function (v) { return '$' + Math.round(v).toLocaleString('en-AU'); };

  /* ---------------------------------------------------------------- plan --- */

  /* The block, plus a margin, in the drawing's own frame. Always landscape and
     always the whole block, whatever the editor happens to be zoomed to. */
  function planExtent() { return {x: -0.9, y: 1.27, w: 41.8, h: 23.13}; }

  function pickScale(availW, availH) {
    var e = planExtent();
    for (var i = 0; i < SCALES.length; i++) {
      var mmPerM = 1000 / SCALES[i];
      if (e.w * mmPerM <= availW && e.h * mmPerM <= availH) return SCALES[i];
    }
    return SCALES[SCALES.length - 1];
  }

  function planSvg(app, P) {
    var D = app.D, s = app.state, e = planExtent();
    var availW = P.w - P.m * 2, availH = P.h - P.m * 2 - P.head - P.foot;
    var scale = pickScale(availW, availH), mmPerM = 1000 / scale;
    var wmm = e.w * mmPerM, hmm = e.h * mmPerM;
    /* stroke widths are quoted in mm of paper, so convert to drawing metres */
    var L = function (mm) { return (mm / mmPerM).toFixed(4); };
    var T = function (mm) { return (mm / mmPerM).toFixed(3); };  /* type size */
    var g = '';

    g += '<rect x="' + e.x + '" y="' + e.y + '" width="' + e.w + '" height="' + e.h + '" fill="' + PAPER + '"/>';

    /* contours, faint, so the fall is readable without competing */
    g += '<g fill="none" stroke="#e2dac9" stroke-width="' + L(0.18) + '">'
      + D.CONT.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>';

    /* tree constraints: the thing most likely to be argued about on site */
    g += D.TREES.map(function (t) {
      var o = '';
      if (t.ctrl) o += '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.ctrl + '" fill="#b2622d" fill-opacity="0.05" stroke="#b2622d" stroke-width="' + L(0.25) + '" stroke-dasharray="' + L(1.6) + ' ' + L(1.1) + '"/>';
      o += '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.srz + '" fill="#8c491a" fill-opacity="0.16" stroke="none"/>';
      o += '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.canopy + '" fill="none" stroke="#8fa073" stroke-width="' + L(0.3) + '" stroke-dasharray="' + L(1.3) + ' ' + L(1) + '"/>';
      return o;
    }).join('');

    /* drainage */
    var P2 = D.DRAIN, line = function (pts, st) {
      return '<path d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + app.fy(p[1]); }).join('') + '" fill="none" ' + st + '/>';
    };
    g += line(P2.overland, 'stroke="#33646b" stroke-width="' + L(2.6) + '" opacity="0.12"');
    g += line(P2.swale, 'stroke="#33646b" stroke-width="' + L(1.3) + '" opacity="0.32"');
    g += line(P2.berm, 'stroke="#b2622d" stroke-width="' + L(0.5) + '" stroke-dasharray="' + L(1.6) + ' ' + L(1) + '" opacity="0.65"');
    g += line(P2.spine, 'stroke="#33646b" stroke-width="' + L(0.45) + '"');
    g += line(P2.north, 'stroke="#33646b" stroke-width="' + L(0.45) + '"');
    g += line(P2.sleeve, 'stroke="#33646b" stroke-width="' + L(1.5) + '" opacity="0.2"');
    g += line(P2.court, 'stroke="#33646b" stroke-width="' + L(0.4) + '" stroke-dasharray="' + L(1.4) + ' ' + L(0.9) + '"');
    g += P2.pits.map(function (p) {
      return '<circle cx="' + p[1] + '" cy="' + app.fy(p[2]) + '" r="' + (0.28) + '" fill="#33646b" stroke="#fff" stroke-width="' + L(0.3) + '"/>';
    }).join('');

    g += (D.DRIVE || []).map(function (d) {
      return '<rect x="' + d[1] + '" y="' + app.fy(d[4]) + '" width="' + (d[3] - d[1]) + '" height="' + (d[4] - d[2]) + '" fill="#efe9dc" stroke="#b9b1a1" stroke-width="' + L(0.2) + '"/>';
    }).join('');

    /* the design itself, hard surfaces under planting */
    var items = s.items.slice();
    var hard = items.filter(function (i) { return i.t !== 'plant'; });
    var soft = items.filter(function (i) { return i.t === 'plant'; });
    var shape = function (it, fillOp) {
      var st = 'fill="' + it.fill + '" fill-opacity="' + fillOp + '" stroke="' + it.stroke + '" stroke-width="' + L(0.28) + '"';
      if (it.shape === 'circ') return '<circle cx="' + it.x + '" cy="' + app.fy(it.y) + '" r="' + app.growR(it, s.years) + '" ' + st + '/>';
      var cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      return '<rect x="' + (-it.w / 2) + '" y="' + (-it.h / 2) + '" width="' + it.w + '" height="' + it.h + '" ' + st
        + ' transform="translate(' + cx + ' ' + app.fy(cy) + ') rotate(' + (-(it.rot || 0)) + ')"/>';
    };
    g += hard.map(function (it) { return shape(it, 0.9); }).join('');
    g += soft.map(function (it) { return shape(it, 0.5); }).join('');

    /* buildings sit over everything: they are the fixed thing */
    g += D.BLDS.map(function (b) {
      return '<path d="' + b.d + '" fill="' + (b.k === 'existing' ? '#ded6c6' : '#f0ebe0') + '" stroke="' + (b.k === 'existing' ? '#8d8474' : '#8d8474') + '" stroke-width="' + L(0.35) + '"'
        + (b.k === 'existing' ? '' : ' stroke-dasharray="' + L(1.5) + ' ' + L(1) + '"') + '/>';
    }).join('');

    g += '<path d="' + D.BNDP + '" fill="none" stroke="' + INK + '" stroke-width="' + L(0.7) + '"/>';

    /* protected trees, numbered as the tree plan numbers them */
    g += D.TREES.map(function (t) {
      return '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + (0.42) + '" fill="#b2622d" stroke="#fff" stroke-width="' + L(0.35) + '"/>'
        + '<text x="' + t.x + '" y="' + (app.fy(t.y) + Number(T(1.05))) + '" font-size="' + T(2.7) + '" font-weight="700" text-anchor="middle" fill="#fff">' + t.id + '</text>';
    }).join('');

    /* numbered keys, so the drawing stays legible and the schedule carries names */
    var keys = keyList(app);
    g += keys.map(function (k) {
      var r = Number(T(2.0));
      return '<circle cx="' + k.x + '" cy="' + k.y + '" r="' + r + '" fill="#fff" fill-opacity="0.92" stroke="' + INK + '" stroke-width="' + L(0.22) + '"/>'
        + '<text x="' + k.x + '" y="' + (k.y + Number(T(0.95))) + '" font-size="' + T(2.6) + '" font-weight="700" text-anchor="middle" fill="' + INK + '">' + k.no + '</text>';
    }).join('');

    return {
      svg: '<svg width="' + n1(wmm) + 'mm" height="' + n1(hmm) + 'mm" viewBox="' + e.x + ' ' + e.y + ' ' + e.w + ' ' + e.h + '" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>',
      scale: scale, wmm: wmm, hmm: hmm, keys: keys
    };
  }

  /* One number per placed element, ordered the way you read the block: from the
     reserve end toward the street, top of the sheet down. */
  function keyList(app) {
    var s = app.state;
    var out = s.items.map(function (it) {
      var c = app.centre(it);
      return {it: it, x: c[0], y: app.fy(c[1])};
    });
    out.sort(function (a, b) { return (a.x - b.x) || (a.y - b.y); });
    out.forEach(function (k, i) { k.no = i + 1; });
    /* Two numbers printed on top of each other are worse than one moved slightly
       off its centroid, so nudge them apart. Metres, at plan scale. */
    var MIN = 0.62;
    for (var pass = 0; pass < 24; pass++) {
      var moved = false;
      for (var i = 0; i < out.length; i++) for (var j = i + 1; j < out.length; j++) {
        var dx = out[j].x - out[i].x, dy = out[j].y - out[i].y;
        var d = Math.hypot(dx, dy);
        if (d >= MIN) continue;
        if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
        var push = (MIN - d) / 2 / d;
        out[i].x -= dx * push; out[i].y -= dy * push;
        out[j].x += dx * push; out[j].y += dy * push;
        moved = true;
      }
      if (!moved) break;
    }
    return out;
  }

  /* ----------------------------------------------------------- earthworks --- */

  /* What a machine operator has to know before he arrives: where he may not dig
     at all, where only a shovel is allowed, how deep each thing goes, and how
     much comes out. The levels are a fitted surface, not a survey pickup — that
     caveat is printed on the sheet, not buried here. */

  var BOUND = [[0, 0], [39.999, 0], [39.999, 21.333], [4.343, 21.333]];

  /* Depth below finished level, where a document states one. Only the firepit
     does — the handbook calls it a 450 mm cut, which is also what keeps it under
     the 500 mm that would force a site reclassification. Everything else is
     levelling of the existing surface, and anything needing a depth decided on
     site is left blank rather than guessed. */
  var DIG_DEPTH = {'Sunken firepit': 0.45};

  function inBound(x, y) {
    var c = false;
    for (var i = 0, j = BOUND.length - 1; i < BOUND.length; j = i++) {
      if ((BOUND[i][1] > y) !== (BOUND[j][1] > y) &&
          x < (BOUND[j][0] - BOUND[i][0]) * (y - BOUND[i][1]) / (BOUND[j][1] - BOUND[i][1]) + BOUND[i][0]) c = !c;
    }
    return c;
  }

  function spotLevels(app, step) {
    var out = [];
    for (var x = 2; x <= 40; x += step) {
      for (var y = 2; y <= 21.3; y += step) {
        if (inBound(x, y)) out.push({x: x, y: y, rl: app.RL(x, y)});
      }
    }
    return out;
  }

  /* Machine, shovel, or nothing — straight off the same protection-zone test the
     Checks screen runs, so the sheet cannot disagree with the app. */
  function digMethod(app, it) {
    var ck = app.checks(it);
    if (ck.srz && ck.srz.size) return {m: 'NO EXCAVATION', why: 'structural root zone, tree ' + [].concat(Array.from(ck.srz)).join(', '), rank: 0};
    if (ck.tpz && ck.tpz.size) return {m: 'Hand or hydro only', why: 'protection zone, tree ' + [].concat(Array.from(ck.tpz)).join(', ') + ' — arborist present', rank: 1};
    return {m: 'Machine', why: 'clear of every protection zone', rank: 2};
  }

  function earthRows(app) {
    var s = app.state, keys = keyList(app);
    return keys.filter(function (k) { return k.it.cat === 'dig' || k.it.cat === 'pave'; })
      .map(function (k) {
        var it = k.it, cf = app.cutfill(it), c = app.centre(it), meth = digMethod(app, it);
        var depth = DIG_DEPTH[it.n] || 0;
        return {no: k.no, name: it.n, it: it,
          size: it.shape === 'circ' ? n1(it.w * 2) + ' m dia' : n1(it.w) + ' × ' + n1(it.h) + ' m',
          area: app.area(it), rl: app.RL(c[0], c[1]),
          cut: cf.cutV, fill: cf.fillV, maxCut: cf.maxCut * 1000, maxFill: cf.maxFill * 1000,
          depth: depth, digV: depth * app.area(it),
          meth: meth};
      });
  }

  function earthSvg(app, P) {
    var D = app.D, s = app.state, e = planExtent();
    var availW = P.w - P.m * 2, availH = P.h - P.m * 2 - P.head - P.foot;
    var scale = pickScale(availW, availH), mmPerM = 1000 / scale;
    var L = function (mm) { return (mm / mmPerM).toFixed(4); };
    var T = function (mm) { return (mm / mmPerM).toFixed(3); };
    var g = '';

    g += '<rect x="' + e.x + '" y="' + e.y + '" width="' + e.w + '" height="' + e.h + '" fill="' + PAPER + '"/>';
    g += '<g fill="none" stroke="#e7e0d0" stroke-width="' + L(0.18) + '">'
      + D.CONT.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>';

    /* the no-go zones, loud, because this is the sheet they get read off */
    g += D.TREES.map(function (t) {
      var o = '';
      if (t.ctrl) o += '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.ctrl + '" fill="#b2622d" fill-opacity="0.07" stroke="#b2622d" stroke-width="' + L(0.4) + '" stroke-dasharray="' + L(2) + ' ' + L(1.2) + '"/>';
      o += '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.srz + '" fill="#8c491a" fill-opacity="0.34" stroke="#8c491a" stroke-width="' + L(0.4) + '"/>';
      return o;
    }).join('');

    /* existing surface, on a grid he can pace out */
    spotLevels(app, 4).forEach(function (sp) {
      g += '<circle cx="' + sp.x + '" cy="' + app.fy(sp.y) + '" r="' + T(0.5) + '" fill="' + MUT + '"/>'
        + '<text x="' + (sp.x + Number(T(0.9))) + '" y="' + (app.fy(sp.y) + Number(T(0.8))) + '" font-size="' + T(2.1) + '" fill="' + MUT + '">' + sp.rl.toFixed(2) + '</text>';
    });

    g += D.BLDS.map(function (b) {
      return '<path d="' + b.d + '" fill="#ece6da" stroke="#8d8474" stroke-width="' + L(0.35) + '"'
        + (b.k === 'existing' ? '' : ' stroke-dasharray="' + L(1.5) + ' ' + L(1) + '"') + '/>';
    }).join('');
    g += (D.DRIVE || []).map(function (d) {
      return '<rect x="' + d[1] + '" y="' + app.fy(d[4]) + '" width="' + (d[3] - d[1]) + '" height="' + (d[4] - d[2]) + '" fill="#e6dbc4" stroke="#a89878" stroke-width="' + L(0.3) + '"/>';
    }).join('');

    /* the swale and the bund: the actual shaping work, not editor items */
    var line = function (pts, st) {
      return '<path d="' + pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + app.fy(q[1]); }).join('') + '" fill="none" ' + st + '/>';
    };
    g += line(D.DRAIN.swale, 'stroke="#33646b" stroke-width="' + L(2.2) + '" opacity="0.5" stroke-linecap="round"');
    g += line(D.DRAIN.berm, 'stroke="#b2622d" stroke-width="' + L(1.6) + '" opacity="0.5" stroke-linecap="round"');

    /* every excavation, keyed and shaded by what may touch it */
    earthRows(app).forEach(function (r) {
      var it = r.it, col = r.meth.rank === 0 ? '#a8332a' : r.meth.rank === 1 ? '#b2622d' : '#33646b';
      var st = 'fill="' + col + '" fill-opacity="0.16" stroke="' + col + '" stroke-width="' + L(0.55) + '"';
      if (it.shape === 'circ') g += '<circle cx="' + it.x + '" cy="' + app.fy(it.y) + '" r="' + it.w + '" ' + st + '/>';
      else {
        var cx = it.x + it.w / 2, cy = it.y + it.h / 2;
        g += '<rect x="' + (-it.w / 2) + '" y="' + (-it.h / 2) + '" width="' + it.w + '" height="' + it.h + '" ' + st
          + ' transform="translate(' + cx + ' ' + app.fy(cy) + ') rotate(' + (-(it.rot || 0)) + ')"/>';
      }
      var c = app.centre(it), kx = c[0], ky = app.fy(c[1]);
      g += '<circle cx="' + kx + '" cy="' + ky + '" r="' + T(2.1) + '" fill="#fff" stroke="' + col + '" stroke-width="' + L(0.35) + '"/>'
        + '<text x="' + kx + '" y="' + (ky + Number(T(1)))  + '" font-size="' + T(2.7) + '" font-weight="700" text-anchor="middle" fill="' + col + '">' + r.no + '</text>';
    });

    g += '<path d="' + D.BNDP + '" fill="none" stroke="' + INK + '" stroke-width="' + L(0.7) + '"/>';
    g += D.TREES.map(function (t) {
      return '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + 0.42 + '" fill="#8c491a" stroke="#fff" stroke-width="' + L(0.35) + '"/>'
        + '<text x="' + t.x + '" y="' + (app.fy(t.y) + Number(T(1.05))) + '" font-size="' + T(2.7) + '" font-weight="700" text-anchor="middle" fill="#fff">' + t.id + '</text>';
    }).join('');

    return {svg: '<svg width="' + n1(e.w * mmPerM) + 'mm" height="' + n1(e.h * mmPerM) + 'mm" viewBox="' + e.x + ' ' + e.y + ' ' + e.w + ' ' + e.h + '" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>',
      scale: scale};
  }

  /* ------------------------------------------------------------- schedules --- */

  function schedules(app) {
    var s = app.state, keys = keyList(app);
    var hard = keys.filter(function (k) { return k.it.t !== 'plant'; });
    /* plants collapse to one row per species, with a count */
    var byName = {}, order = [];
    keys.filter(function (k) { return k.it.t === 'plant'; }).forEach(function (k) {
      var n = k.it.pn || k.it.n;
      if (!byName[n]) { byName[n] = {name: n, it: k.it, nos: [], count: 0}; order.push(n); }
      byName[n].nos.push(k.no); byName[n].count++;
    });
    return {
      hard: hard.map(function (k) {
        var it = k.it, size, qty;
        if (it.shape === 'circ') { size = n1(it.w * 2) + ' m diameter'; qty = n1(app.area(it)) + ' m²'; }
        else { size = n1(it.w) + ' × ' + n1(it.h) + ' m'; qty = it.unit === 'lin' ? n1(Math.max(it.w, it.h)) + ' m' : n1(app.area(it)) + ' m²'; }
        return {no: k.no, name: it.n, size: size, qty: it.unit === 'item' ? '1 item' : qty, cost: it.unit === 'm2' ? app.area(it) * it.cost : it.unit === 'lin' ? Math.max(it.w, it.h) * it.cost : it.cost};
      }),
      plants: order.map(function (n) {
        var r = byName[n], p = app.PL[n] || {}, b = (window.BLOOM || {})[n];
        return {nos: r.nos.join(', '), name: r.it.n, botanical: n, count: r.count, h: p.h, w: p.w,
          cost: r.count * (r.it.cost || 0), bloom: b || null, group: p.g || r.it.g};
      })
    };
  }

  /* ---------------------------------------------------------------- bloom --- */

  /* Mature height up the side, month across, the flower's own colour in the
     mark, and the mark's thickness is the plant's mature spread. Height needs a
     log scale: this list runs from 50 mm of dichondra to a 12 m gum. */
  function bloomSvg(app, P, rows) {
    var flowering = rows.filter(function (r) { return r.bloom; });
    var foliage = rows.filter(function (r) { return !r.bloom; });
    var W = P.w - P.m * 2, H = (P.h - P.m * 2 - P.head - P.foot) * 0.62;
    var padL = 15, padR = 46, padT = 7, padB = 12;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    if (!flowering.length) return {svg: '', foliage: foliage, empty: true};

    var hs = flowering.map(function (r) { return Math.max(0.05, r.h || 0.3); });
    var lo = Math.min.apply(null, hs), hi = Math.max.apply(null, hs);
    /* fit the planting actually on the plan — a scheme of four fruit trees should
       not be drawn against an axis running down to a 50 mm groundcover */
    if (hi / lo < 1.6) { lo = lo / 1.6; hi = hi * 1.6; }
    var ly = function (h) {
      var a = Math.log(Math.max(0.05, h)), b = Math.log(lo * 0.85), c = Math.log(hi * 1.18);
      return padT + plotH - (a - b) / (c - b) * plotH;
    };
    var mx = function (m) { return padL + (m - 1) / 12 * plotW; };   /* month start edge */
    var spreads = flowering.map(function (r) { return r.w || 0.5; });
    var smin = Math.min.apply(null, spreads), smax = Math.max.apply(null, spreads);
    var thick = function (w) {
      var t = smax > smin ? Math.sqrt(((w || 0.5) - smin) / (smax - smin)) : 0.5;
      return 1.6 + t * 4.6;
    };

    var g = '', i;
    /* month bands: solid hairlines, one step off the surface, never dashed */
    for (i = 0; i <= 12; i++) {
      g += '<line x1="' + n1(mx(i + 1)) + '" y1="' + padT + '" x2="' + n1(mx(i + 1)) + '" y2="' + n1(padT + plotH) + '" stroke="' + (i === 0 || i === 12 ? RULE : '#ece7dc') + '" stroke-width="0.2"/>';
    }
    /* the two solstices, so summer and winter are locatable at a glance */
    [12, 6].forEach(function (m) {
      g += '<rect x="' + n1(mx(m)) + '" y="' + padT + '" width="' + n1(plotW / 12) + '" height="' + n1(plotH) + '" fill="#8c7a5a" opacity="0.05"/>';
    });
    for (i = 0; i < 12; i++) {
      g += '<text x="' + n1(mx(i + 1) + plotW / 24) + '" y="' + n1(padT + plotH + 4.2) + '" font-size="2.7" text-anchor="middle" fill="' + MUT + '">' + MONTHS[i] + '</text>';
    }
    g += '<text x="' + n1(mx(12.5)) + '" y="' + n1(padT + plotH + 8.4) + '" font-size="2.4" text-anchor="middle" fill="' + FAINT + '">midsummer</text>';
    g += '<text x="' + n1(mx(6.5)) + '" y="' + n1(padT + plotH + 8.4) + '" font-size="2.4" text-anchor="middle" fill="' + FAINT + '">midwinter</text>';

    var lastTick = -1e9;
    [12, 10, 8, 6, 4, 3, 2, 1.5, 1, 0.6, 0.4, 0.25, 0.15, 0.1, 0.05].forEach(function (h) {
      if (h < lo * 0.85 || h > hi * 1.18) return;
      var y = ly(h);
      if (y - lastTick < 4.2) return;                 /* no stacked tick labels */
      lastTick = y;
      g += '<line x1="' + padL + '" y1="' + n1(y) + '" x2="' + n1(padL + plotW) + '" y2="' + n1(y) + '" stroke="#ece7dc" stroke-width="0.2"/>';
      g += '<text x="' + n1(padL - 2) + '" y="' + n1(y + 1) + '" font-size="2.6" text-anchor="end" fill="' + MUT + '" style="font-variant-numeric:tabular-nums">' + (h < 1 ? h.toFixed(2).replace(/0$/, '') : h) + '</text>';
    });
    g += '<text transform="translate(' + n1(padL - 10) + ' ' + n1(padT + plotH / 2) + ') rotate(-90)" font-size="2.7" text-anchor="middle" fill="' + MUT + '">mature height (m)</text>';

    /* one capsule per species; a range that crosses the new year draws twice */
    var marks = flowering.map(function (r) {
      return {r: r, y: ly(r.h), t: thick(r.w),
        segs: r.bloom[0] <= r.bloom[1] ? [[r.bloom[0], r.bloom[1]]] : [[r.bloom[0], 12], [1, r.bloom[1]]]};
    });
    marks.forEach(function (m) {
      var col = m.r.bloom[2], pale = isPale(col);
      m.segs.forEach(function (sg) {
        var x0 = mx(sg[0]), x1 = mx(sg[1] + 1), w = Math.max(m.t, x1 - x0);
        g += '<rect x="' + n1(x0) + '" y="' + n1(m.y - m.t / 2) + '" width="' + n1(w) + '" height="' + n1(m.t) + '" rx="' + n1(m.t / 2) + '"'
          + ' fill="' + col + '"' + (pale ? ' stroke="#bcb3a2" stroke-width="0.18"' : '') + '/>';
      });
    });
    /* Names live in a gutter down the right, never over a bar. Assign top to
       bottom and push each one below the last, so the leaders never cross. */
    var gap = Math.min(3.3, Math.max(2.5, plotH / (marks.length + 1)));
    var lx = padL + plotW + 4, prev = -1e9;
    marks.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (m) {
      var ty = Math.max(m.y, prev + gap);
      prev = ty;
      var label = m.r.name + (m.r.count > 1 ? ' ×' + m.r.count : '');
      g += '<text x="' + n1(lx) + '" y="' + n1(ty + 0.9) + '" font-size="2.6" fill="' + INK + '">' + esc(label) + '</text>';
      var endX = mx((m.r.bloom[0] <= m.r.bloom[1] ? m.r.bloom[1] : 12) + 1);
      g += '<path d="M' + n1(endX + 0.6) + ' ' + n1(m.y) + 'H' + n1(lx - 2.4) + 'L' + n1(lx - 0.9) + ' ' + n1(ty)
        + '" stroke="' + FAINT + '" stroke-width="0.15" fill="none"/>';
    });

    return {
      svg: '<svg width="' + n1(W) + 'mm" height="' + n1(H) + 'mm" viewBox="0 0 ' + n1(W) + ' ' + n1(H) + '" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>',
      foliage: foliage, empty: false
    };
  }

  function isPale(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 205;
  }

  /* ---------------------------------------------------------------- build --- */

  /* The block's +x runs toward Duffy Street on a bearing of 345.66 degrees, so
     north is not up the sheet — it is 14.3 degrees clockwise of the right-hand
     edge. Rotate the arrow to match, or the drawing lies about which way it
     faces. */
  function northArrow(app) {
    var nb = (window.SITEBEARING != null) ? window.SITEBEARING : 345.6611;
    var th = ((360 - nb) % 360) * Math.PI / 180;      /* screen angle, clockwise from the right-hand edge */
    var C = 26, rot = (90 + (360 - nb)) % 360;
    var nx = C + 21 * Math.cos(th), ny = C + 21 * Math.sin(th);
    return '<svg viewBox="0 0 52 52" width="13.5mm" height="13.5mm">'
      + '<circle cx="' + C + '" cy="' + C + '" r="15.5" fill="none" stroke="' + RULE + '" stroke-width="0.7"/>'
      + '<g transform="rotate(' + rot.toFixed(2) + ' ' + C + ' ' + C + ')">'
      + '<path d="M26 12 L31 34 L26 30 L21 34 Z" fill="' + INK + '"/>'
      + '<circle cx="26" cy="38" r="1.4" fill="' + INK + '"/></g>'
      + '<text x="' + nx.toFixed(1) + '" y="' + (ny + 2.6).toFixed(1) + '" font-size="8" text-anchor="middle" font-weight="700" fill="' + INK + '">N</text></svg>';
  }

  function scaleBar(scale) {
    var barM = scale <= 125 ? 5 : 10, barmm = barM * 1000 / scale, bar = '';
    for (var i = 0; i < 4; i++) bar += '<span class="ps-bar" style="width:' + n1(barmm) + 'mm;background:' + (i % 2 ? '#fff' : INK) + '"></span>';
    return '<div class="ps-bars">' + bar + '</div><div class="ps-barlab"><span>0</span><span>' + (barM * 4) + ' m</span></div>';
  }

  function sheetHead(P, title, sub, right) {
    return '<div class="ps-head"><div><div class="ps-t">' + esc(title) + '</div>'
      + '<div class="ps-s">' + esc(sub) + '</div></div><div class="ps-r">' + right + '</div></div>';
  }

  /* The excavation schedule, shared by the printed sheet and the Works screen so
     the two can never quote different volumes. */
  var WARN = '<b>Levels are indicative, not setting-out.</b> They come from a surface fitted to the 0.25 m contour survey \u2014 mean error \u221220 mm, RMS 129 mm. Establish a benchmark on site and confirm every level with a level before cutting. Nothing here overrides the tree management plan.';

  function earthLegend() {
    return [
      ['#8c491a', 'solid', 'Structural root zone \u2014 no excavation, not even by hand'],
      ['#b2622d', 'dash', 'Tree protection zone \u2014 hand or hydro dig, arborist present'],
      ['#33646b', 'solid', 'Corner swale \u2014 the one part of the rear boundary that can be cut'],
      ['#b2622d', 'solid', 'Diversion bund \u2014 built up in mulch, never dug'],
      ['level', 'level', 'Existing surface level, m AHD, on a 4 m grid'],
      ['key', 'key', 'Excavation, numbered in the schedule']
    ].map(function (l) {
      var sw = l[1] === 'level' ? '<span class="ps-sw" style="background:none;color:' + MUT + ';font-size:2.3mm;height:auto">\u00b7611.52</span>'
        : l[1] === 'key' ? '<span class="ps-sw ps-kdot" style="background:#fff;border:0.2mm solid #33646b;color:#33646b">4</span>'
        : l[1] === 'dash' ? '<span class="ps-sw" style="border-top:0.6mm dashed ' + l[0] + '"></span>'
        : '<span class="ps-sw" style="background:' + l[0] + '"></span>';
      return '<div class="ps-lg">' + sw + '<span>' + esc(l[2]) + '</span></div>';
    }).join('');
  }

  function earthTable(app) {
    var rows = earthRows(app);
    var totCut = 0, totFill = 0, totDig = 0;
    rows.forEach(function (r) { totCut += r.cut; totFill += r.fill; totDig += r.digV; });
    var net = totCut + totDig - totFill;
    var rowHtml = rows.map(function (r) {
      var cls = r.meth.rank === 0 ? 'ps-no-dig' : r.meth.rank === 1 ? 'ps-hand' : '';
      return '<tr class="' + cls + '"><td class="ps-no">' + r.no + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.size) + '</td>'
        + '<td class="ps-num">' + r.rl.toFixed(2) + '</td>'
        + '<td class="ps-num">' + (r.depth ? Math.round(r.depth * 1000) : '\u2014') + '</td>'
        + '<td class="ps-num">' + (r.cut + r.digV >= 0.05 ? n1(r.cut + r.digV) : '\u2014') + '</td>'
        + '<td class="ps-num">' + (r.fill >= 0.05 ? n1(r.fill) : '\u2014') + '</td>'
        + '<td class="ps-num">' + Math.round(Math.max(r.maxCut, r.maxFill) + r.depth * 1000) + '</td>'
        + '<td><b>' + esc(r.meth.m) + '</b><br><span class="ps-mut">' + esc(r.meth.why) + '</span></td></tr>';
    }).join('');
    return '<h3 class="ps-h3">Excavations and levelling</h3>'
      + '<table class="ps-tbl"><thead><tr><th>No.</th><th>Item</th><th>Size</th><th class="ps-num">Existing RL</th><th class="ps-num">Dig mm</th><th class="ps-num">Cut m\u00b3</th><th class="ps-num">Fill m\u00b3</th><th class="ps-num">Total mm</th><th>Method</th></tr></thead>'
      + '<tbody>' + (rowHtml || '<tr><td colspan="9" class="ps-mut">Nothing on the plan needs excavating.</td></tr>') + '</tbody></table>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Total cut</td><td class="ps-num">' + n1(totCut + totDig) + ' m\u00b3</td></tr>'
      + '<tr><td>Total fill</td><td class="ps-num">' + n1(totFill) + ' m\u00b3</td></tr>'
      + '<tr class="ps-tot"><td>' + (net >= 0 ? 'Net to cart away' : 'Net to import') + '</td><td class="ps-num">' + n1(Math.abs(net)) + ' m\u00b3</td></tr>'
      + '</tbody></table>'
      + '<p class="ps-fine"><b>Dig mm</b> is depth below finished level where a document states one \u2014 only the firepit does, at 450 mm, which is also what keeps it under the 500 mm that would force a site reclassification. Everything else is levelling of the existing surface across the item\u2019s own footprint, from the fitted surface. Anything needing a depth decided on site is left blank rather than guessed. Bulking is not allowed for: loose spoil carts at roughly 1.25 times these figures.</p>';
  }

  function earthNotes() {
      + '</div>'

    return '<h3 class="ps-h3">Shaping along the rear boundary</h3>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Corner swale, position</td><td>western 4 m of the rear boundary, 0.8–1.2 m inside the fence</td></tr>'
      + '<tr><td>Cross-section</td><td>about 2 m wide, 250 mm deep, batters around 1 in 6</td></tr>'
      + '<tr><td>Grade</td><td>around 1 in 40, cutting deeper toward the pit</td></tr>'
      + '<tr><td>Clearance from the gum</td><td>7.1 m — outside the 6.5 m protection zone. The only diggable stretch</td></tr>'
      + '<tr><td>Diversion bund</td><td>built up, 100 mm of coarse woodchip maximum, hand placed, arborist supervising. No excavation, no soil</td></tr>'
      + '<tr><td>Mulch blanket</td><td>100 mm coarse 25 mm chip across the boundary in front of the gum. Spread, not graded in</td></tr>'
      + '</tbody></table>'

      + '<h3 class="ps-h3">Rules that bind the machine</h3><ul class="ps-ul">'
      + '<li><b>Nothing deeper than 50 mm inside a protection zone</b> counts as excavation. Hand dig, hydro-excavate or bore. No root over 30 mm may be cut, and a locating trench is dug along the line nearest the tree first.</li>'
      + '<li><b>Nothing at all inside a structural root zone</b>, by any method.</li>'
      + '<li><b>Keep cut under 500 mm and fill under 400 mm.</b> Beyond that the site classification has to be reassessed. The deepest thing here is the firepit at about 450 mm.</li>'
      + '<li><b>Near footings:</b> no trench below a 30° line from the footing edge, 45° in clay. Any permanent excavation deeper than 600 mm must be retained or battered.</li>'
      + '<li><b>No tracking or spoil stockpiles inside a protection zone.</b> Ground protection is rumble boards over 200 mm of coarse woodchip, cellular geotextile, or rated mats.</li>'
      + '<li><b>Keep the overland flow path along the side boundary clear</b> — no spoil heap, no plant, no materials, at any stage.</li>'
      + '</ul>'

      + '<h3 class="ps-h3">Confirm before the machine arrives</h3><ul class="ps-ul">'
      + '<li>A benchmark on site, and a level check against the RLs on the drawing.</li>'
      + '<li>Protection zone fencing up, and the arborist booked for anything inside one.</li>'
      + '<li>Service locations — dial before you dig — and the garage slab sleeves cast before the slab goes down.</li>'
      + '<li>Where spoil is stockpiled and where it goes.</li>'
      + '</ul>';
  }

  /* The two sheets the digger gets. Deliberately separable from the design set:
     you hand these over and keep the rest. */
  function earthSheets(app, P, size, stamp, scheme) {
    var draw = earthSvg(app, P);

    var legend = earthLegend();

    var h = '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Earthworks and levels', 'What can be dug, what cannot, and to what depth — ' + scheme, stamp)
      + '<div class="ps-warn">' + WARN + '</div>'
      + '<div class="ps-plan">' + draw.svg + '</div>'
      + '<div class="ps-foot"><div class="ps-legend">' + legend + '</div>'
      + '<div class="ps-scalebar">' + scaleBar(draw.scale)
      + '<div class="ps-note" style="max-width:96mm">Scale 1:' + draw.scale + ' at ' + size
      + '. Access is the existing crossover at the north-east corner and the driveway; there is no other way in for a machine.</div></div>'
      + '<div class="ps-north">' + northArrow(app) + '<div class="ps-nlab">Duffy Street is<br>north-north-west</div></div>'
      + '</div></section>';

    h += '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Earthworks schedule', 'Volumes, depths and method, by the numbers on the drawing \u2014 ' + scheme, stamp)
      + '<div class="ps-cols ps-cols-earth">'
      + '<div>' + earthTable(app) + '</div>'
      + '<div>' + earthNotes() + '</div>'
      + '</div></section>';
    return h;
  }

  function build(app, size, which) {
    var P = PAGE[size] || PAGE.A3, s = app.state, q = app.quantities();
    var plan = planSvg(app, P), sch = schedules(app);
    var scheme = (s.schemes.find(function (x) { return x.id === s.schemeId; }) || {}).name || 'Working scheme';
    var d = new Date();
    var date = d.getDate() + ' ' + ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] + ' ' + d.getFullYear();
    var stamp = '<div class="ps-meta"><b>' + esc(scheme) + '</b><span>' + esc(date) + '</span><span>1:' + plan.scale + ' at ' + size + '</span></div>';
    var h = '';

    /* --- sheet 1: the plan --- */
    var legend = [
      ['#8c491a', 'solid', 'Structural root zone — no excavation, ever'],
      ['#b2622d', 'dash', 'Tree protection zone — hand dig, arborist present'],
      ['#8fa073', 'dash', 'Mature canopy'],
      ['#33646b', 'solid', 'Stormwater line and pit'],
      ['#33646b', 'wide', 'Overland flow path — keep clear'],
      ['#b2622d', 'dash', 'Diversion bund'],
      ['key', 'key', 'Element number — see the schedules'],
      ['tree', 'tree', 'Protected tree, numbered as the tree plan numbers it']
    ].map(function (l) {
      var sw = l[1] === 'wide' ? '<span class="ps-sw" style="background:' + l[0] + ';opacity:.25;height:2.4mm"></span>'
        : l[1] === 'key' ? '<span class="ps-sw ps-kdot" style="background:#fff;border:0.2mm solid ' + INK + ';color:' + INK + '">4</span>'
        : l[1] === 'tree' ? '<span class="ps-sw ps-kdot" style="background:#b2622d;color:#fff">2</span>'
        : l[1] === 'dash' ? '<span class="ps-sw" style="border-top:0.5mm dashed ' + l[0] + '"></span>'
        : '<span class="ps-sw" style="background:' + l[0] + '"></span>';
      return '<div class="ps-lg">' + sw + '<span>' + esc(l[2]) + '</span></div>';
    }).join('');


    h += '<section class="ps-sheet">'
      + sheetHead(P, '234 Duffy Street, Ainslie', 'Landscape plan — ' + scheme, stamp)
      + '<div class="ps-plan">' + plan.svg + '</div>'
      + '<div class="ps-foot">'
      + '<div class="ps-legend">' + legend + '</div>'
      + '<div class="ps-scalebar">' + scaleBar(plan.scale)
      + '<div class="ps-note">Scale 1:' + plan.scale + ' at ' + size + '. Levels from the 0.25 m contour survey — check on site before digging.</div></div>'
      + '<div class="ps-north">' + northArrow(app) + '<div class="ps-nlab">Duffy Street is<br>north-north-west</div></div>'
      + '</div></section>';

    /* --- sheet 2: schedules --- */
    var hardRows = sch.hard.map(function (r) {
      return '<tr><td class="ps-no">' + r.no + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.size) + '</td><td>' + esc(r.qty) + '</td><td class="ps-num">' + money(r.cost) + '</td></tr>';
    }).join('');
    var plantRows = sch.plants.map(function (r) {
      var b = r.bloom;
      return '<tr><td class="ps-no">' + esc(r.nos) + '</td><td>' + esc(r.name) + '</td><td class="ps-num">' + r.count + '</td>'
        + '<td>' + n1(r.h) + ' × ' + n1(r.w) + ' m</td>'
        + '<td>' + (b ? '<span class="ps-dot" style="background:' + b[2] + (isPale(b[2]) ? ';box-shadow:inset 0 0 0 0.2mm #bcb3a2' : '') + '"></span>' + esc(MONTHS[b[0] - 1] + '–' + MONTHS[b[1] - 1] + ', ' + b[3]) : '<span class="ps-mut">foliage</span>') + '</td>'
        + '<td class="ps-num">' + money(r.cost) + '</td></tr>';
    }).join('');

    var over = q.cost - 10000;
    h += '<section class="ps-sheet">'
      + sheetHead(P, 'Schedules', 'Every element on the plan, by its number — ' + scheme, stamp)
      + '<div class="ps-cols">'
      + '<div><h3 class="ps-h3">Elements</h3><table class="ps-tbl"><thead><tr><th>No.</th><th>Item</th><th>Size</th><th>Quantity</th><th class="ps-num">Materials</th></tr></thead><tbody>'
      + (hardRows || '<tr><td colspan="5" class="ps-mut">Nothing placed.</td></tr>') + '</tbody></table>'
      + '<h3 class="ps-h3">Quantities</h3><table class="ps-tbl"><tbody>'
      + '<tr><td>Paving and terrace</td><td class="ps-num">' + n1(q.pave) + ' m²</td></tr>'
      + '<tr><td>Soft surfaces</td><td class="ps-num">' + n1(q.soft) + ' m²</td></tr>'
      + '<tr><td>Walls and edges</td><td class="ps-num">' + n1(q.lin) + ' m</td></tr>'
      + '<tr><td>Mulch at 100 mm</td><td class="ps-num">' + n1(q.mulch) + ' m³</td></tr>'
      + '<tr><td>Plants</td><td class="ps-num">' + q.plants + '</td></tr>'
      + '<tr class="ps-tot"><td>Materials total, your labour</td><td class="ps-num">' + money(q.cost) + '</td></tr>'
      + '<tr><td>Against the $10,000 budget</td><td class="ps-num">' + (over > 0 ? money(over) + ' over' : money(-over) + ' left') + '</td></tr>'
      + '</tbody></table></div>'
      + '<div><h3 class="ps-h3">Planting</h3><table class="ps-tbl"><thead><tr><th>No.</th><th>Plant</th><th class="ps-num">No.</th><th>Mature h × w</th><th>Flower</th><th class="ps-num">Cost</th></tr></thead><tbody>'
      + (plantRows || '<tr><td colspan="6" class="ps-mut">Nothing planted.</td></tr>') + '</tbody></table>'
      + '<h3 class="ps-h3">Before anything is dug</h3><ul class="ps-ul">'
      + '<li>Inside a protection zone: hand or hydro excavation only, no root over 30 mm cut, arborist present. Paths and beds built up above existing grade, never cut in.</li>'
      + '<li>A 900 mm paved apron right around the house, falling away at 1:60. No beds, no irrigation and no taps inside it.</li>'
      + '<li>The overland flow path along the side boundary stays open and continuous to the street. Nothing gets built across it.</li>'
      + '<li>Backfill service trenches with the spoil that came out, compacted — not gravel — and plug with clay every 6 m near the house.</li>'
      + '</ul></div></div></section>';

    /* --- sheet 3: bloom calendar --- */
    var bloom = bloomSvg(app, P, sch.plants);
    var bloomRows = sch.plants.filter(function (r) { return r.bloom; })
      .sort(function (a, b) { return (b.h || 0) - (a.h || 0); });
    var rowHtml = function (r) {
      return '<tr><td>' + esc(r.name) + '</td><td class="ps-num">' + r.count + '</td><td class="ps-num">' + n1(r.h) + '</td><td class="ps-num">' + n1(r.w) + '</td>'
        + '<td>' + esc(MONTHS[r.bloom[0] - 1] + '–' + MONTHS[r.bloom[1] - 1]) + '</td>'
        + '<td><span class="ps-dot" style="background:' + r.bloom[2] + (isPale(r.bloom[2]) ? ';box-shadow:inset 0 0 0 0.2mm #bcb3a2' : '') + '"></span>' + esc(r.bloom[3]) + '</td></tr>';
    };
    var half = Math.ceil(bloomRows.length / 2);
    var tableOf = function (rows) {
      return !rows.length ? '' : '<table class="ps-tbl ps-wide"><colgroup><col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5"><col></colgroup>'
        + '<thead><tr><th>Plant</th><th class="ps-num">No.</th><th class="ps-num">H m</th><th class="ps-num">W m</th><th>Flowers</th><th>Colour</th></tr></thead>'
        + '<tbody>' + rows.map(rowHtml).join('') + '</tbody></table>';
    };
    var tables = '<div class="ps-two">' + tableOf(bloomRows.slice(0, half)) + tableOf(bloomRows.slice(half)) + '</div>';

    h += '<section class="ps-sheet">'
      + sheetHead(P, 'Bloom calendar', 'When each plant flowers, how tall it gets, and in what colour — ' + scheme, stamp)
      + (bloom.empty
        ? '<div class="ps-empty">No flowering plants on the plan yet. Place some on the Plan screen and print again.</div>'
        : '<div class="ps-chart">' + bloom.svg + '</div>'
          + '<div class="ps-key">Each bar runs from the first flowering month to the last. Its thickness is the plant’s mature spread; its colour is the flower’s. Height is a log scale, so a 50 mm groundcover and a 12 m gum fit on one sheet.'
          + (bloom.foliage.length ? ' Grown for foliage, so not charted: ' + esc(bloom.foliage.map(function (r) { return r.name; }).join(', ')) + '.' : '')
          + '</div>'
          + tables)
      + '<div class="ps-src">Flowering months and colours are horticultural figures for a cool-temperate Canberra garden, not survey data — see bloom.js. Everything else on this set is computed from the survey.</div>'
      + '</section>';

    var earth = earthSheets(app, P, size, stamp, scheme);
    return which === 'earth' ? earth : earth + h;
  }

  /* --------------------------------------------------------------- styles --- */

  function css(P, size) {
    return '@page{size:' + size + ' landscape;margin:0}'
      + '#ps-root{position:fixed;inset:0;z-index:999;overflow:auto;background:#57534a;padding:16px 0;-webkit-overflow-scrolling:touch}'
      + '#ps-root .ps-sheet{width:' + P.w + 'mm;height:' + P.h + 'mm;background:#fff;color:' + INK + ';margin:0 auto 16px;padding:' + P.m + 'mm;'
      + 'box-sizing:border-box;display:flex;flex-direction:column;font-family:Figtree,system-ui,sans-serif;font-size:' + P.body + 'mm;line-height:1.45;box-shadow:0 6px 26px rgba(0,0,0,.4);overflow:hidden}'
      + '.ps-head{display:flex;align-items:flex-start;gap:8mm;height:' + P.head + 'mm;flex:0 0 auto;border-bottom:0.4mm solid ' + INK + ';padding-bottom:2.4mm}'
      + '.ps-t{font-family:Caprasimo,Georgia,serif;font-size:' + P.head1 + 'mm;line-height:1.05}'
      + '.ps-s{font-size:' + P.head2 + 'mm;color:' + MUT + ';margin-top:0.8mm}'
      + '.ps-r{margin-left:auto;text-align:right}'
      + '.ps-meta{display:flex;flex-direction:column;gap:0.5mm;font-size:' + P.head2 * 0.82 + 'mm;color:' + MUT + '}'
      + '.ps-meta b{color:' + INK + ';font-size:' + P.head2 + 'mm}'
      + '.ps-plan{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:2mm 0}'
      + '.ps-foot{flex:0 0 ' + P.foot + 'mm;display:flex;align-items:flex-end;gap:8mm;border-top:0.25mm solid ' + RULE + ';padding-top:2.2mm}'
      + '.ps-legend{display:grid;grid-template-columns:1fr 1fr;gap:0.9mm 6mm;flex:1}'
      + '.ps-lg{display:flex;align-items:center;gap:1.8mm;font-size:2.5mm;color:' + MUT + '}'
      + '.ps-sw{width:6mm;height:0.9mm;flex:0 0 6mm;border-radius:0.5mm}'
      + '.ps-kdot{height:3.4mm;width:3.4mm;flex:0 0 3.4mm;border-radius:50%;font-size:2.2mm;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:1.3mm}'
      + '.ps-scalebar{flex:0 0 auto}.ps-bars{display:flex;border:0.2mm solid ' + INK + '}'
      + '.ps-bar{height:1.5mm;display:block}'
      + '.ps-barlab{display:flex;justify-content:space-between;font-size:2.3mm;color:' + MUT + ';margin-top:0.5mm}'
      + '.ps-note{font-size:2.3mm;color:' + FAINT + ';margin-top:1mm;max-width:78mm}'
      + '.ps-north{flex:0 0 auto;text-align:center}.ps-nlab{font-size:2.2mm;color:' + MUT + ';line-height:1.3}'
      + '.ps-cols{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.25fr;gap:9mm;padding-top:3mm;overflow:hidden}'
      + '.ps-h3{font-family:Caprasimo,Georgia,serif;font-size:' + P.head2 * 1.05 + 'mm;margin:0 0 1.6mm;font-weight:400}'
      + '.ps-h3+.ps-h3,.ps-tbl+.ps-h3{margin-top:5mm}'
      + '.ps-tbl{width:100%;border-collapse:collapse;margin-bottom:1mm}'
      + '.ps-tbl th{text-align:left;font-size:2.4mm;text-transform:uppercase;letter-spacing:0.08mm;color:' + MUT + ';font-weight:700;border-bottom:0.3mm solid ' + INK + ';padding:0 1.6mm 1mm 0}'
      + '.ps-tbl td{padding:0.9mm 1.6mm 0.9mm 0;border-bottom:0.15mm solid ' + RULE + ';vertical-align:top}'
      + '.ps-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}'
      + '.ps-no{font-variant-numeric:tabular-nums;color:' + MUT + ';white-space:nowrap}'
      + '.ps-tot td{font-weight:700;border-bottom:0.3mm solid ' + INK + '}'
      + '.ps-mut{color:' + FAINT + '}'
      + '.ps-dot{display:inline-block;width:2.4mm;height:2.4mm;border-radius:50%;margin-right:1.4mm;vertical-align:-0.3mm}'
      + '.ps-ul{margin:0;padding-left:4mm}.ps-ul li{margin-bottom:1.2mm}'
      + '.ps-chart{padding:3mm 0 0}.ps-key{font-size:2.5mm;color:' + MUT + ';margin:1mm 0 3mm;max-width:200mm}'
      + '.ps-wide{table-layout:fixed}'
      + '.ps-two{display:grid;grid-template-columns:1fr 1fr;gap:7mm;align-items:start}'
      + '.ps-wide col.c1{width:33%}.ps-wide col.c2{width:7%}.ps-wide col.c3{width:11%}.ps-wide col.c4{width:11%}.ps-wide col.c5{width:16%}'
      + '.ps-warn{flex:0 0 auto;margin:2.6mm 0 0;padding:2.6mm 3.4mm;border-radius:2mm;background:#f8e6df;color:#7a1f18;font-size:2.7mm;line-height:1.45}'
      + '.ps-cols-earth{grid-template-columns:1.35fr 1fr}'
      + '.ps-earth .ps-tbl td{padding:1mm 1.6mm}'
      + '.ps-no-dig td{background:#fbecea}.ps-no-dig td:nth-child(8) b{color:#a8332a}'
      + '.ps-hand td{background:#fbf1e7}.ps-hand td:nth-child(8) b{color:#8c491a}'
      + '.ps-fine{font-size:2.4mm;color:' + FAINT + ';margin:1.4mm 0 0;line-height:1.45}'
      + '.ps-src{margin-top:auto;font-size:2.3mm;color:' + FAINT + ';border-top:0.15mm solid ' + RULE + ';padding-top:1.6mm}'
      + '.ps-empty{flex:1;display:flex;align-items:center;justify-content:center;color:' + MUT + ';font-size:5mm}'
      /* on paper: only the sheets, no chrome, no shadows, one sheet per page */
      + '@media print{html,body{background:#fff!important}'
      + 'body>*{display:none!important}body>#ps-root{display:block!important;position:static;padding:0;background:#fff;overflow:visible}'
      + '#ps-root .ps-bararea,#ps-root #ps-toolbar{display:none!important}'
      + '#ps-root .ps-sheet{margin:0;box-shadow:none;break-after:page;page-break-after:always}'
      + '#ps-root .ps-sheet:last-child{break-after:auto;page-break-after:auto}}';
  }

  /* ----------------------------------------------------------------- open --- */

  function open(app, size, which) {
    close();
    size = (size === 'A4' || size === 'A3') ? size : 'A3';
    which = which === 'earth' ? 'earth' : 'all';
    var P = PAGE[size];
    var st = document.createElement('style');
    st.id = 'ps-style'; st.textContent = css(P, size);
    document.head.appendChild(st);

    var root = document.createElement('div');
    root.id = 'ps-root';
    root.innerHTML =
      '<div id="ps-toolbar" style="position:sticky;top:0;z-index:2;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;padding:10px;background:rgba(40,38,33,.94)">'
      + '<button data-ps="all" style="' + btn(which === 'all') + '">Whole set</button>'
      + '<button data-ps="earth" style="' + btn(which === 'earth') + '">Earthworks only</button>'
      + '<span style="width:10px"></span>'
      + '<button data-ps="A4" style="' + btn(size === 'A4') + '">A4</button>'
      + '<button data-ps="A3" style="' + btn(size === 'A3') + '">A3</button>'
      + '<span style="width:10px"></span>'
      + '<button data-ps="print" style="' + btn(true) + '">Print or save as PDF</button>'
      + '<button data-ps="close" style="' + btn(false) + '">Close</button>'
      + '</div>' + build(app, size, which);
    document.body.appendChild(root);

    root.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-ps]'); if (!t) return;
      var a = t.getAttribute('data-ps');
      if (a === 'close') { close(); return; }
      if (a === 'print') { window.print(); return; }
      if (a === 'all' || a === 'earth') { open(app, size, a); return; }
      open(app, a, which);
      });
    return root;
  }

  function btn(on) {
    return 'appearance:none;border:1.5px solid ' + (on ? '#c67139' : 'rgba(255,255,255,.35)') + ';background:' + (on ? '#c67139' : 'transparent')
      + ';color:#fff;font:600 13px Figtree,system-ui;padding:8px 15px;border-radius:999px;cursor:pointer';
  }

  function close() {
    var r = document.getElementById('ps-root'); if (r) r.remove();
    var s = document.getElementById('ps-style'); if (s) s.remove();
  }

  /* The same chart the printed sheet carries, sized for a screen instead of a
     page, so the app can show it without anyone going near the print dialog. */
  function bloomChart(app) {
    var P = {w: 260, h: 150, m: 0, head: 0, foot: 0};
    var rows = schedules(app).plants;
    var r = bloomSvg(app, P, rows);
    return {svg: r.svg, empty: r.empty,
      foliage: (r.foliage || []).map(function (x) { return x.name; })};
  }

  /* Everything the two printed sheets carry, laid out for a screen, so the
     Works tab can show it without anyone opening a print dialog. */
  function earthView(app) {
    var P = {w: 250, h: 150, m: 0, head: 0, foot: 0};
    var draw = earthSvg(app, P);
    return '<div class="ps-screen">'
      + '<div class="ps-warn">' + WARN + '</div>'
      + '<div class="ps-screen-plan">' + draw.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ') + '</div>'
      + '<div class="ps-screen-legend">' + earthLegend() + '</div>'
      + earthTable(app)
      + earthNotes()
      + '<button data-earth-print="1" class="ps-print-btn">Print these two sheets</button>'
      + '</div>';
  }

  return {open: open, close: close, build: build, bloomChart: bloomChart, earthView: earthView};
})();
