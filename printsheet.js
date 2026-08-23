/* The printable set: three sheets built from whatever is on the plan right now.

   Everything is drawn in millimetres at a true, stated scale, so a dimension
   taken off the paper with a ruler is real. The plan is vector, not a screenshot
   of the editor, heavier boundary, no selection handles, numbered keys instead
   of labels crowding the drawing, and a title block.

   Entry point: PRINTSHEET.open(app, size). 'A4' or 'A3', both landscape. */
window.PRINTSHEET = (function () {

  /* page, margin, title strip, footer strip. All mm */
  var PAGE = {
    A4: {w: 297, h: 210, m: 10, head: 19, foot: 23, body: 3.05, head1: 6.4, head2: 4.4},
    A3: {w: 420, h: 297, m: 13, head: 25, foot: 28, body: 3.5,  head1: 8.4, head2: 5.2}
  };
  /* Only scales a drawing is allowed to be issued at. The plan takes the
     largest one that still fits, and says which on the sheet. */
  var SCALES = [50, 75, 100, 125, 150, 200, 250, 300];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var INK = '#2e2b25', MUT = '#6f6959', FAINT = '#b9b1a1', RULE = '#d8d0c0', PAPER = '#ffffff';
  /* the interior drawings, which need a few inks the site sheets never wanted */
  var COLI = {glass: '#33646b', cut: '#8c491a', roof: '#645c50',
              floor: '#a19786', ground: '#6f6959', fin: '#8c491a'};

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
    if (!app.owns('Diversion berm')) g += line(P2.berm, 'stroke="#b2622d" stroke-width="' + L(0.5) + '" stroke-dasharray="' + L(1.6) + ' ' + L(1) + '" opacity="0.65"');
    if (!app.owns('Stormwater line')) {
      g += line(P2.spine, 'stroke="#33646b" stroke-width="' + L(0.45) + '"');
      g += line(P2.north, 'stroke="#33646b" stroke-width="' + L(0.45) + '"');
    }
    g += line(P2.sleeve, 'stroke="#33646b" stroke-width="' + L(1.5) + '" opacity="0.2"');
    if (!app.owns('Stormwater line')) g += line(P2.court, 'stroke="#33646b" stroke-width="' + L(0.4) + '" stroke-dasharray="' + L(1.4) + ' ' + L(0.9) + '"');
    if (!app.owns('Yard sump')) g += P2.pits.map(function (p) {
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
      if (app.isRun && app.isRun(it)) return '<path d="' + app.polyD(app.runPoly(it)) + '" stroke-linejoin="round" ' + st + '/>';
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

  /* What a machine operator has to know before he arrives: where he may not dig at all,
     where only a shovel is allowed, how deep each thing goes, and how much comes out. The
     levels are the surveyor's own surface, not a set-out pickup, so that caveat is printed
     on the sheet, not buried here. */

  var BOUND = [[0, 0], [39.999, 0], [39.999, 21.333], [4.343, 21.333]];

  /* Depth below finished level, where a document states one. Only the firepit
     does, the handbook calls it a 450 mm cut, which is also what keeps it under
     the 500 mm that would force a site reclassification. Everything else is
     levelling of the existing surface, and anything needing a depth decided on
     site is left blank rather than guessed. A yard sump is the clearest case of
     that: how deep it goes is set by the invert of the line it joins, which
     comes off the stormwater contractor's set and not off anything here, so it
     stays blank and the schedule asks for it rather than inventing it. */
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

  /* Machine, shovel, or nothing, straight off the same protection-zone test the
     Checks screen runs, so the sheet cannot disagree with the app. */
  function digMethod(app, it) {
    var ck = app.checks(it);
    if (ck.srz && ck.srz.size) return {m: 'NO EXCAVATION', why: 'structural root zone, tree ' + [].concat(Array.from(ck.srz)).join(', '), rank: 0};
    if (ck.tpz && ck.tpz.size) return {m: 'Hand or hydro only', why: 'protection zone, tree ' + [].concat(Array.from(ck.tpz)).join(', ') + ' · arborist present', rank: 1};
    return {m: 'Machine', why: 'clear of every protection zone', rank: 2};
  }

  function earthRows(app) {
    var s = app.state, keys = keyList(app);
    return keys.filter(function (k) { return k.it.cat === 'dig' || k.it.cat === 'pave'; })
      .map(function (k) {
        var it = k.it, cf = app.cutfill(it), c = app.centre(it), meth = digMethod(app, it);
        var depth = DIG_DEPTH[it.n] || 0;
        return {no: k.no, name: it.n, it: it,
          size: app.isRun && app.isRun(it) ? n1(app.runLen(it)) + ' m × ' + n1(it.w) + ' m'
            : it.shape === 'circ' ? n1(it.w * 2) + ' m dia' : n1(it.w) + ' × ' + n1(it.h) + ' m',
          area: app.area(it), rl: app.RL(c[0], c[1]),
          cut: cf.cutV, fill: cf.fillV, maxCut: cf.maxCut * 1000, maxFill: cf.maxFill * 1000,
          depth: depth, digV: depth * app.area(it),
          meth: meth};
      });
  }

  /* Ground made up rather than cut. Not an excavation, so it cannot go in the
     table above, but it is the digger's business all the same, and inside a
     zone it is the number that binds, not the cut. */
  function buildRows(app) {
    return keyList(app).filter(function (k) { return app.buildup(k.it); })
      .map(function (k) {
        var bu = app.buildup(k.it), bc = app.buildCheck(k.it);
        return {no: k.no, name: k.it.n, mm: bu.mm, vol: bu.vol,
          mat: bu.mat === 'soil' ? 'Soil' : 'Coarse woodchip', lvl: bc.lvl, why: bc.msg};
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

    /* the rear swale: still site data rather than an editor item. The berm
       beside it may be either, so it is drawn here only while the layout has
       no element standing in for it, otherwise it arrives twice. */
    var line = function (pts, st) {
      return '<path d="' + pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + app.fy(q[1]); }).join('') + '" fill="none" ' + st + '/>';
    };
    g += line(D.DRAIN.swale, 'stroke="#33646b" stroke-width="' + L(2.2) + '" opacity="0.5" stroke-linecap="round"');
    if (!app.owns('Diversion berm')) g += line(D.DRAIN.berm, 'stroke="#b2622d" stroke-width="' + L(1.6) + '" opacity="0.5" stroke-linecap="round"');

    /* every excavation, keyed and shaded by what may touch it */
    earthRows(app).forEach(function (r) {
      var it = r.it, col = r.meth.rank === 0 ? '#a8332a' : r.meth.rank === 1 ? '#b2622d' : '#33646b';
      var st = 'fill="' + col + '" fill-opacity="0.16" stroke="' + col + '" stroke-width="' + L(0.55) + '"';
      if (app.isRun && app.isRun(it)) g += '<path d="' + app.polyD(app.runPoly(it)) + '" stroke-linejoin="round" ' + st + '/>';
      else if (it.shape === 'circ') g += '<circle cx="' + it.x + '" cy="' + app.fy(it.y) + '" r="' + it.w + '" ' + st + '/>';
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
        if (app.isRun && app.isRun(it)) { size = n1(app.runLen(it)) + ' m curved run, ' + n1(it.w) + ' m wide'; qty = n1(app.area(it)) + ' m²'; }
        else if (it.shape === 'circ') { size = n1(it.w * 2) + ' m diameter'; qty = n1(app.area(it)) + ' m²'; }
        else { size = n1(it.w) + ' × ' + n1(it.h) + ' m'; qty = it.unit === 'lin' ? n1(Math.max(it.w, it.h)) + ' m' : n1(app.area(it)) + ' m²'; }
        var lin = app.linLen ? app.linLen(it) : Math.max(it.w, it.h);
        if (app.isRun && app.isRun(it) && it.unit === 'lin') qty = n1(lin) + ' m';
        return {no: k.no, name: it.n, size: size, qty: it.unit === 'item' ? '1 item' : qty, cost: it.unit === 'm2' ? app.area(it) * it.cost : it.unit === 'lin' ? lin * it.cost : it.cost};
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
    /* fit the planting actually on the plan, a scheme of four fruit trees should
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
     north is not up the sheet, it is 14.3 degrees clockwise of the right-hand
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
  var WARN = '<b>Levels are indicative, not setting-out.</b> They are the surveyor\u2019s own triangulated surface: 126 measured ground points, exact where they measured, interpolated between, and an older fitted surface past the last point. Set out from the survey plan, datum A.H.D., origin SR585 RL 608.442, and confirm on site. No underground services have been located.';

  function earthLegend() {
    return [
      ['#8c491a', 'solid', 'Structural root zone: no excavation, not even by hand'],
      ['#b2622d', 'dash', 'Tree protection zone: hand or hydro dig, arborist present'],
      ['#33646b', 'solid', 'Corner swale: the one part of the rear boundary that can be cut'],
      ['#b2622d', 'solid', 'Diversion bund: built up in mulch, never dug'],
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
        + '<td class="ps-num">' + (r.depth ? Math.round(r.depth * 1000) : '\u00b7') + '</td>'
        + '<td class="ps-num">' + (r.cut + r.digV >= 0.05 ? n1(r.cut + r.digV) : '\u00b7') + '</td>'
        + '<td class="ps-num">' + (r.fill >= 0.05 ? n1(r.fill) : '\u00b7') + '</td>'
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
      + buildTable(app)
      + '<p class="ps-fine"><b>Dig mm</b> is depth below finished level where a document states one. Only the firepit does, at 450 mm, which is also what keeps it under the 500 mm that would force a site reclassification. Everything else is levelling of the existing surface across the item\u2019s own footprint, from the fitted surface. Anything needing a depth decided on site is left blank rather than guessed. Bulking is not allowed for: loose spoil carts at roughly 1.25 times these figures.</p>';
  }

  function buildTable(app) {
    var rows = buildRows(app);
    if (!rows.length) return '';
    var tot = 0;
    rows.forEach(function (r) { tot += r.vol; });
    return '<h3 class="ps-h3">Ground made up above existing grade</h3>'
      + '<table class="ps-tbl"><thead><tr><th>No.</th><th>Item</th><th class="ps-num">Depth mm</th><th>Material</th><th class="ps-num">Volume m³</th></tr></thead><tbody>'
      + rows.map(function (r) {
        return '<tr' + (r.lvl === 'r' ? ' class="ps-no-dig"' : '') + '><td class="ps-no">' + r.no + '</td><td>' + esc(r.name) + '</td>'
          + '<td class="ps-num">' + r.mm + '</td><td>' + esc(r.mat) + '</td><td class="ps-num">' + n1(r.vol) + '</td></tr>'
          + '<tr><td></td><td colspan="4" class="ps-mut">' + esc(r.why) + '</td></tr>';
      }).join('')
      + '<tr class="ps-tot"><td></td><td>Total to cart in</td><td></td><td></td><td class="ps-num">' + n1(tot) + ' m³</td></tr>'
      + '</tbody></table>';
  }

  function earthNotes() {

    return '<h3 class="ps-h3">Shaping along the rear boundary</h3>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Corner swale, position</td><td>western 4 m of the rear boundary, 0.8 to 1.2 m inside the fence</td></tr>'
      + '<tr><td>Cross-section</td><td>about 2 m wide, 250 mm deep, batters around 1 in 6</td></tr>'
      + '<tr><td>Grade</td><td>around 1 in 40, cutting deeper toward the pit</td></tr>'
      + '<tr><td>Clearance from the gum</td><td>7.1 m, outside the 6.5 m protection zone. The only diggable stretch</td></tr>'
      + '<tr><td>Diversion bund</td><td>built up, 100 mm of coarse woodchip maximum, hand placed, arborist supervising. No excavation, no soil</td></tr>'
      + '<tr><td>Mulch blanket</td><td>100 mm coarse 25 mm chip across the boundary in front of the gum. Spread, not graded in</td></tr>'
      + '</tbody></table>'

      + '<h3 class="ps-h3">Contour troughs and mounds</h3>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Direction</td><td>across the block, not down it: 1 in 19 along the fall, 1 in 132 across it</td></tr>'
      + '<tr><td>Trough section</td><td>1.0 to 1.4 m wide, 250 mm invert to crest, batters about 1 in 4</td></tr>'
      + '<tr><td>Method inside a zone</td><td>shoulders raised in coarse woodchip. The invert is not cut: no excavation, no compaction</td></tr>'
      + '<tr><td>Method clear of a zone</td><td>may be cut instead, spoil to the mound. Only the rear pocket qualifies</td></tr>'
      + '<tr><td>Level</td><td>set out with a water level on the day. Over 100 mm end to end it is a drain, not a store</td></tr>'
      + '<tr><td>Standoff</td><td>3 m minimum from any wall for anything holding water in the ground</td></tr>'
      + '</tbody></table>'

      + '<h3 class="ps-h3">Rules that bind the machine</h3><ul class="ps-ul">'
      + '<li><b>Nothing deeper than 50 mm inside a protection zone</b> counts as excavation. Hand dig, hydro-excavate or bore. No root over 30 mm may be cut, and a locating trench is dug along the line nearest the tree first.</li>'
      + '<li><b>Nothing at all inside a structural root zone</b>, by any method.</li>'
      + '<li><b>Building up inside a protection zone is capped at 100 mm</b>, hand placed, arborist supervising, and in coarse woodchip rather than soil. Soil over a root plate reduces the air reaching the roots, which is the reason the cap exists. Building up is how paths and beds are made inside a zone; the cap is what makes it safe.</li>'
      + '<li><b>Keep cut under 500 mm and fill under 400 mm.</b> Beyond that the site classification has to be reassessed. The deepest thing here is the firepit at about 450 mm.</li>'
      + '<li><b>Near footings:</b> no trench below a 30° line from the footing edge, 45° in clay. Any permanent excavation deeper than 600 mm must be retained or battered.</li>'
      + '<li><b>No tracking or spoil stockpiles inside a protection zone.</b> Ground protection is rumble boards over 200 mm of coarse woodchip, cellular geotextile, or rated mats.</li>'
      + '<li><b>Keep the overland flow path along the side boundary clear</b>. No spoil heap, no plant, no materials, at any stage. No trough or mound crosses it either.</li>'
      + '<li><b>Nothing that puts water into the ground within 3 m of a wall.</b> Troughs, gravel paths and soak pits all stand off; mulch and mounds sit on the surface and do not.</li>'
      + '</ul>'

      + '<h3 class="ps-h3">Confirm before the machine arrives</h3><ul class="ps-ul">'
      + '<li>A benchmark on site, and a level check against the RLs on the drawing.</li>'
      + '<li>Protection zone fencing up, and the arborist booked for anything inside one.</li>'
      + '<li>Service locations: dial before you dig. And the garage slab sleeves cast before the slab goes down.</li>'
      + '<li>Where spoil is stockpiled and where it goes.</li>'
      + '</ul>';
  }

  /* --------------------------------------------------------------- levels ---

     The sheet the builder asked for. Earthworks says what may be dug; this says
     what the ground finishes at. One string line along each surface, the RL at
     each end of it, the grade between them, and the cut and fill that takes.

     Only the surfaces that are mostly clear of a protection zone carry set-out
     levels. The rest are printed as found, in grey, because inside a zone the
     finished surface is the existing surface and a level there would be an
     instruction nobody may follow. */

  function levelRows(app) {
    var keys = {}, list = keyList(app);
    list.forEach(function (k) { keys[k.it.u] = k.no; });
    return app.levels().rows.map(function (r) {
      r.no = keys[r.u] || '';
      r.it = app.state.items.find(function (i) { return i.u === r.u; });
      return r;
    });
  }

  function levelSvg(app, P) {
    var D = app.D, e = planExtent();
    var availW = P.w - P.m * 2, availH = P.h - P.m * 2 - P.head - P.foot;
    var scale = pickScale(availW, availH), mmPerM = 1000 / scale;
    var L = function (mm) { return (mm / mmPerM).toFixed(4); };
    var T = function (mm) { return (mm / mmPerM).toFixed(3); };
    var g = '';

    g += '<rect x="' + e.x + '" y="' + e.y + '" width="' + e.w + '" height="' + e.h + '" fill="' + PAPER + '"/>';
    g += '<g fill="none" stroke="#e7e0d0" stroke-width="' + L(0.18) + '">'
      + D.CONT.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>';

    /* the ground a machine may stand on, which is what decides every level here */
    g += D.TREES.map(function (t) {
      if (!t.ctrl) return '';
      return '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="' + t.ctrl + '" fill="#b2622d" fill-opacity="0.07" stroke="#b2622d" stroke-width="' + L(0.35) + '" stroke-dasharray="' + L(2) + ' ' + L(1.2) + '"/>';
    }).join('');

    g += D.BLDS.map(function (b) {
      return '<path d="' + b.d + '" fill="#ece6da" stroke="#8d8474" stroke-width="' + L(0.35) + '"'
        + (b.k === 'existing' ? '' : ' stroke-dasharray="' + L(1.5) + ' ' + L(1) + '"') + '/>';
    }).join('');
    g += (D.DRIVE || []).map(function (d) {
      return '<rect x="' + d[1] + '" y="' + app.fy(d[4]) + '" width="' + (d[3] - d[1]) + '" height="' + (d[4] - d[2]) + '" fill="#e6dbc4" stroke="#a89878" stroke-width="' + L(0.3) + '"/>';
    }).join('');

    /* the overland flow corridor, because a level set across it is a weir */
    g += '<rect x="0" y="' + app.fy(3.0) + '" width="40" height="2.5" fill="#33646b" fill-opacity="0.07"/>';

    levelRows(app).forEach(function (r) {
      var it = r.it, col = !r.graded ? MUT : r.lvl === 'r' ? '#a8332a' : r.lvl === 'a' ? '#b2622d' : '#33646b';
      var st = 'fill="' + col + '" fill-opacity="' + (r.graded ? 0.13 : 0.05) + '" stroke="' + col + '" stroke-width="' + L(0.5) + '"'
        + (r.graded ? '' : ' stroke-dasharray="' + L(1.2) + ' ' + L(1) + '"');
      if (app.isRun(it)) g += '<path d="' + app.polyD(app.runPoly(it)) + '" stroke-linejoin="round" ' + st + '/>';
      else {
        var cx = it.x + it.w / 2, cy = it.y + it.h / 2;
        g += '<rect x="' + (-it.w / 2) + '" y="' + (-it.h / 2) + '" width="' + it.w + '" height="' + it.h + '" ' + st
          + ' transform="translate(' + cx + ' ' + app.fy(cy) + ') rotate(' + (-(it.rot || 0)) + ')"/>';
      }
      /* the string line, with its level written at each end and an arrow down it */
      var a = r.a, b = r.b;
      g += '<path d="M' + a[0] + ' ' + app.fy(a[1]) + 'L' + b[0] + ' ' + app.fy(b[1]) + '" stroke="' + col + '" stroke-width="' + L(0.45) + '" stroke-dasharray="' + L(0.9) + ' ' + L(0.7) + '" fill="none"/>';
      [[a, r.from], [b, r.to]].forEach(function (q) {
        g += '<circle cx="' + q[0][0] + '" cy="' + app.fy(q[0][1]) + '" r="' + T(0.7) + '" fill="' + col + '"/>'
          + '<text x="' + (q[0][0] + Number(T(1.1))) + '" y="' + (app.fy(q[0][1]) - Number(T(0.9))) + '" font-size="' + T(2.3) + '" font-weight="' + (r.graded ? 700 : 400) + '" fill="' + col + '">' + q[1].toFixed(2) + '</text>';
      });
      var c = app.centre(it), kx = c[0], ky = app.fy(c[1]);
      g += '<circle cx="' + kx + '" cy="' + ky + '" r="' + T(2.1) + '" fill="#fff" stroke="' + col + '" stroke-width="' + L(0.35) + '"/>'
        + '<text x="' + kx + '" y="' + (ky + Number(T(1))) + '" font-size="' + T(2.7) + '" font-weight="700" text-anchor="middle" fill="' + col + '">' + r.no + '</text>';
    });

    g += '<path d="' + D.BNDP + '" fill="none" stroke="' + INK + '" stroke-width="' + L(0.7) + '"/>';
    g += D.TREES.map(function (t) {
      return '<circle cx="' + t.x + '" cy="' + app.fy(t.y) + '" r="0.42" fill="#8c491a" stroke="#fff" stroke-width="' + L(0.35) + '"/>'
        + '<text x="' + t.x + '" y="' + (app.fy(t.y) + Number(T(1.05))) + '" font-size="' + T(2.7) + '" font-weight="700" text-anchor="middle" fill="#fff">' + t.id + '</text>';
    }).join('');

    return {svg: '<svg viewBox="' + e.x + ' ' + e.y + ' ' + e.w + ' ' + e.h + '" width="' + n1(e.w * mmPerM) + 'mm" height="' + n1(e.h * mmPerM) + 'mm">' + g + '</svg>',
      scale: scale};
  }

  function levelLegend() {
    return [
      ['#33646b', 'Finishes at the grade it should. Set out to the levels shown'],
      ['#b2622d', 'Finishes flatter or steeper than it wants. Read the schedule'],
      ['#a8332a', 'Wrong grade for what it is. Change the shape, not the levels'],
      [MUT, 'Left as found: mostly inside a protection zone, so not set out'],
      ['zone', 'Tree protection zone: no machine, no cut, 100 mm of chip at most'],
      ['flow', 'Overland flow corridor: nothing set out here may dam it']
    ].map(function (l) {
      var sw = l[0] === 'zone' ? '<span class="ps-sw" style="border-top:0.6mm dashed #b2622d"></span>'
        : l[0] === 'flow' ? '<span class="ps-sw" style="background:#33646b;opacity:0.18"></span>'
        : '<span class="ps-sw" style="background:' + l[0] + '"></span>';
      return '<div class="ps-lg">' + sw + '<span>' + esc(l[1]) + '</span></div>';
    }).join('');
  }

  function levelTable(app) {
    var rows = levelRows(app), lv = app.levels();
    var grade = function (n) { return n === Infinity ? 'level' : '1 in ' + Math.round(n); };
    var body = rows.map(function (r) {
      var cls = !r.graded ? 'ps-hand' : r.lvl === 'r' ? 'ps-no-dig' : '';
      return '<tr class="' + cls + '"><td class="ps-no">' + r.no + '</td><td>' + esc(r.n) + '</td>'
        + '<td>' + n1(r.len) + ' \u00d7 ' + n1(r.w) + ' m</td>'
        + '<td class="ps-num">' + r.exLo.toFixed(2) + ' to ' + r.exHi.toFixed(2) + '</td>'
        + '<td class="ps-num">' + (r.graded ? '<b>' + r.from.toFixed(2) + ' \u2192 ' + r.to.toFixed(2) + '</b>' : '<span class="ps-mut">as found</span>') + '</td>'
        + '<td class="ps-num">' + grade(r.finN) + '</td>'
        + '<td class="ps-num">' + (r.cut >= 0.05 ? n1(r.cut) : '\u00b7') + '</td>'
        + '<td class="ps-num">' + (r.fill >= 0.05 ? n1(r.fill) : '\u00b7') + '</td>'
        + '<td class="ps-num">' + (r.graded ? Math.round(Math.max(r.maxCut, r.maxFill) * 1000) : '\u00b7') + '</td></tr>'
        + '<tr><td></td><td colspan="8" class="ps-mut">' + esc(r.msg) + '</td></tr>';
    }).join('');
    return '<h3 class="ps-h3">Finished levels, surface by surface</h3>'
      + '<table class="ps-tbl"><thead><tr><th>No.</th><th>Surface</th><th>Size</th>'
      + '<th class="ps-num">Existing RL</th><th class="ps-num">Finished RL</th><th class="ps-num">Grade</th>'
      + '<th class="ps-num">Cut m\u00b3</th><th class="ps-num">Fill m\u00b3</th><th class="ps-num">Deepest mm</th></tr></thead>'
      + '<tbody>' + (body || '<tr><td colspan="9" class="ps-mut">Nothing on the plan is a surface with a level to set.</td></tr>') + '</tbody></table>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Machine cut, all surfaces</td><td class="ps-num">' + n1(lv.cut) + ' m\u00b3</td></tr>'
      + '<tr><td>Machine fill, all surfaces</td><td class="ps-num">' + n1(lv.fill) + ' m\u00b3</td></tr>'
      + '<tr class="ps-tot"><td>Left as found, inside a protection zone</td><td class="ps-num">' + n1(lv.asFound) + ' m\u00b2</td></tr>'
      + '</tbody></table>'
      + '<p class="ps-fine"><b>Finished RL</b> is one string line along the surface, read at the two ends marked on the drawing, and the grade is the fall between them. '
      + 'Cut and fill balance about the middle of each surface, so nothing here needs importing or carting away. '
      + '<b>Deepest mm</b> is the worst single cut or fill on that surface, which is what decides whether an edge has to retain. '
      + 'A row printed <i>as found</i> is mostly inside a protection zone: those levels describe the ground, they are not levels to work to.</p>';
  }

  function levelNotes(app) {
    var w = app.water(), dup = w.dup || [];
    return '<h3 class="ps-h3">What counts as level</h3>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Lawn</td><td>1 in 40 reads level underfoot. 1 in 20 reads as a slope</td></tr>'
      + '<tr><td>Paving and terrace</td><td>1 in 80 sheds without being felt. Flatter than 1 in 150 ponds, steeper than 1 in 40 will not hold a table</td></tr>'
      + '<tr><td>Path</td><td>1 in 20 is walked without thinking about it. 1 in 14 is the ramp limit in AS 1428.1. Past 1 in 10 it wants steps</td></tr>'
      + '<tr><td>Gravel path and trough</td><td>judged end to end, not on a grade: over 100 mm from high point to low it drains instead of holding</td></tr>'
      + '<tr><td>Crossfall on a path</td><td>1 in 50 to one side, so it sheds rather than puddles</td></tr>'
      + '</tbody></table>'

      + '<h3 class="ps-h3">Why most of the block has no set-out level</h3><ul class="ps-ul">'
      + '<li>Inside a tree protection zone the finished surface <b>is</b> the existing surface. Digging there is hand or hydro only, with the arborist present and the work in the approved scope, and added material is capped at 100 mm of coarse woodchip, which is not something grass grows in.</li>'
      + '<li>So a surface that is mostly inside a zone is printed as found. Grading the clear part of it and leaving the rest builds a step where the two meet, which is worse than leaving all of it alone.</li>'
      + '<li>The overland flow corridor along the side boundary, y 0.5 to 3.0 m on the plan, takes the reserve bank if it overtops. A level platform may sit in it; a retaining edge across it may not, unless a formed route past the end of it is built at the same time.</li>'
      + '<li>Nothing that infiltrates comes within 3 m of a wall, whatever its level.</li>'
      + '</ul>'

      + '<h3 class="ps-h3">Setting out on the day</h3><ul class="ps-ul">'
      + '<li>Peg the two ends of each string line marked on the drawing, to the RLs in the schedule, and run a line between them.</li>'
      + '<li>Feather every graded surface out into the ground beside it over about 2 m. No lip, and nothing across the flow corridor.</li>'
      + '<li>Strip and stack the topsoil before cutting, and put it back on top. The cut and fill figures are the shaping, not the topsoil.</li>'
      + '<li>Set the sandstone while the machine is on site. One course 500 mm high is 0.6 to 0.9 tonnes a metre depending on its width, and there is no second visit in which to lift it.</li>'
      + '</ul>'

      + (dup.length ? '<h3 class="ps-h3">Surfaces sharing one piece of ground</h3><table class="ps-tbl"><tbody>'
          + dup.map(function (d) {
            return '<tr><td>' + esc(d.a) + ' and ' + esc(d.b) + '</td><td class="ps-num">' + n1(d.area) + ' m\u00b2</td>'
              + '<td class="ps-num">' + Math.round(d.vol * 1000) + ' L counted once</td></tr>';
          }).join('')
          + '</tbody></table><p class="ps-fine">A gravel path laid along a trough is one gravel filled trench, not two things stacked. Build it as a single excavation and finish the walking gravel flush with the ground either side. The Drainage page deducts the shared ground so the total is not counted twice.</p>' : '');
  }

  function levelSheets(app, P, size, stamp, scheme) {
    var draw = levelSvg(app, P);
    var h = '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Levels', 'What the ground finishes at, and what the machine takes to get there \u00b7 ' + scheme, stamp)
      + '<div class="ps-warn">' + WARN + '</div>'
      + '<div class="ps-plan">' + draw.svg + '</div>'
      + '<div class="ps-foot"><div class="ps-legend">' + levelLegend() + '</div>'
      + '<div class="ps-scalebar">' + scaleBar(draw.scale)
      + '<div class="ps-note" style="max-width:96mm">Scale 1:' + draw.scale + ' at ' + size
      + '. Each surface carries one string line with its finished level at both ends.</div></div>'
      + '<div class="ps-north">' + northArrow(app) + '<div class="ps-nlab">Duffy Street is<br>north-north-west</div></div>'
      + '</div></section>';
    h += '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Levels schedule', 'Existing and finished, by the numbers on the drawing \u00b7 ' + scheme, stamp)
      + '<div class="ps-cols ps-cols-earth">'
      + '<div>' + levelTable(app) + '</div>'
      + '<div>' + levelNotes(app) + '</div>'
      + '</div></section>';
    return h;
  }

  /* The two sheets the digger gets. Deliberately separable from the design set:
     you hand these over and keep the rest. */
  function earthSheets(app, P, size, stamp, scheme) {
    var draw = earthSvg(app, P);

    var legend = earthLegend();

    var h = '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Earthworks and levels', 'What can be dug, what cannot, and to what depth · ' + scheme, stamp)
      + '<div class="ps-warn">' + WARN + '</div>'
      + '<div class="ps-plan">' + draw.svg + '</div>'
      + '<div class="ps-foot"><div class="ps-legend">' + legend + '</div>'
      + '<div class="ps-scalebar">' + scaleBar(draw.scale)
      + '<div class="ps-note" style="max-width:96mm">Scale 1:' + draw.scale + ' at ' + size
      + '. Access is the existing crossover at the north-east corner and the driveway; there is no other way in for a machine.</div></div>'
      + '<div class="ps-north">' + northArrow(app) + '<div class="ps-nlab">Duffy Street is<br>north-north-west</div></div>'
      + '</div></section>';

    h += '<section class="ps-sheet ps-earth">'
      + sheetHead(P, 'Earthworks schedule', 'Volumes, depths and method, by the numbers on the drawing \u00b7 ' + scheme, stamp)
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
      ['#8c491a', 'solid', 'Structural root zone: no excavation, ever'],
      ['#b2622d', 'dash', 'Tree protection zone: hand dig, arborist present'],
      ['#8fa073', 'dash', 'Mature canopy'],
      ['#33646b', 'solid', 'Stormwater line and pit'],
      ['#33646b', 'wide', 'Overland flow path: keep clear'],
      ['#b2622d', 'dash', 'Diversion bund'],
      ['key', 'key', 'Element number: see the schedules'],
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
      + sheetHead(P, '234 Duffy Street, Ainslie', 'Landscape plan · ' + scheme, stamp)
      + '<div class="ps-plan">' + plan.svg + '</div>'
      + '<div class="ps-foot">'
      + '<div class="ps-legend">' + legend + '</div>'
      + '<div class="ps-scalebar">' + scaleBar(plan.scale)
      + '<div class="ps-note">Scale 1:' + plan.scale + ' at ' + size + '. Levels are the surveyor’s own triangulated surface. Check on site before digging.</div></div>'
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
        + '<td>' + (b ? '<span class="ps-dot" style="background:' + b[2] + (isPale(b[2]) ? ';box-shadow:inset 0 0 0 0.2mm #bcb3a2' : '') + '"></span>' + esc(MONTHS[b[0] - 1] + ' to ' + MONTHS[b[1] - 1] + ', ' + b[3]) : '<span class="ps-mut">foliage</span>') + '</td>'
        + '<td class="ps-num">' + money(r.cost) + '</td></tr>';
    }).join('');

    var over = q.cost - 10000;
    h += '<section class="ps-sheet">'
      + sheetHead(P, 'Schedules', 'Every element on the plan, by its number · ' + scheme, stamp)
      + '<div class="ps-cols">'
      + '<div><h3 class="ps-h3">Elements</h3><table class="ps-tbl"><thead><tr><th>No.</th><th>Item</th><th>Size</th><th>Quantity</th><th class="ps-num">Materials</th></tr></thead><tbody>'
      + (hardRows || '<tr><td colspan="5" class="ps-mut">Nothing placed.</td></tr>') + '</tbody></table>'
      + '<h3 class="ps-h3">Quantities</h3><table class="ps-tbl"><tbody>'
      + '<tr><td>Paving and terrace</td><td class="ps-num">' + n1(q.pave) + ' m²</td></tr>'
      + '<tr><td>Soft surfaces</td><td class="ps-num">' + n1(q.soft) + ' m²</td></tr>'
      + '<tr><td>Walls and edges</td><td class="ps-num">' + n1(q.lin) + ' m</td></tr>'
      + (q.pipe > 0 ? '<tr><td>Drainage line</td><td class="ps-num">' + n1(q.pipe) + ' m</td></tr>' : '')
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
      + '<li>Backfill service trenches with the spoil that came out, compacted, not gravel, and plug with clay every 6 m near the house.</li>'
      + '</ul></div></div></section>';

    /* --- sheet 3: bloom calendar --- */
    var bloom = bloomSvg(app, P, sch.plants);
    var bloomRows = sch.plants.filter(function (r) { return r.bloom; })
      .sort(function (a, b) { return (b.h || 0) - (a.h || 0); });
    var rowHtml = function (r) {
      return '<tr><td>' + esc(r.name) + '</td><td class="ps-num">' + r.count + '</td><td class="ps-num">' + n1(r.h) + '</td><td class="ps-num">' + n1(r.w) + '</td>'
        + '<td>' + esc(MONTHS[r.bloom[0] - 1] + ' to ' + MONTHS[r.bloom[1] - 1]) + '</td>'
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
      + sheetHead(P, 'Bloom calendar', 'When each plant flowers, how tall it gets, and in what colour · ' + scheme, stamp)
      + (bloom.empty
        ? '<div class="ps-empty">No flowering plants on the plan yet. Place some on the Plan screen and print again.</div>'
        : '<div class="ps-chart">' + bloom.svg + '</div>'
          + '<div class="ps-key">Each bar runs from the first flowering month to the last. Its thickness is the plant’s mature spread; its colour is the flower’s. Height is a log scale, so a 50 mm groundcover and a 12 m gum fit on one sheet.'
          + (bloom.foliage.length ? ' Grown for foliage, so not charted: ' + esc(bloom.foliage.map(function (r) { return r.name; }).join(', ')) + '.' : '')
          + '</div>'
          + tables)
      + '<div class="ps-src">Flowering months and colours are horticultural figures for a cool-temperate Canberra garden, not survey data. See bloom.js. Everything else on this set is computed from the survey.</div>'
      + '</section>';

    var earth = earthSheets(app, P, size, stamp, scheme);
    var lev = levelSheets(app, P, size, stamp, scheme);
    if (which === 'earth') return earth;
    if (which === 'levels') return lev;
    return lev + earth + h;
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
      + '.ps-fine{font-size:2.4mm;color:' + FAINT + ';margin:1.4mm 0 0;line-height:1.45}\n    ul.ps-fine{padding-left:4mm}\n    ul.ps-fine li{margin:0.6mm 0}'
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
    which = (which === 'earth' || which === 'levels') ? which : 'all';
    var P = PAGE[size];
    var st = document.createElement('style');
    st.id = 'ps-style'; st.textContent = css(P, size);
    document.head.appendChild(st);

    var root = document.createElement('div');
    root.id = 'ps-root';
    root.innerHTML =
      '<div id="ps-toolbar" style="position:sticky;top:0;z-index:2;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;padding:10px;background:rgba(40,38,33,.94)">'
      + '<button data-ps="all" style="' + btn(which === 'all') + '">Whole set</button>'
      + '<button data-ps="levels" style="' + btn(which === 'levels') + '">Levels only</button>'
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
      if (a === 'all' || a === 'earth' || a === 'levels') { open(app, size, a); return; }
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

  function levelsView(app) {
    var P = {w: 250, h: 150, m: 0, head: 0, foot: 0};
    var draw = levelSvg(app, P);
    return '<div class="ps-screen">'
      + '<div class="ps-warn">' + WARN + '</div>'
      + '<div class="ps-screen-plan">' + draw.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ') + '</div>'
      + '<div class="ps-screen-legend">' + levelLegend() + '</div>'
      + levelTable(app)
      + levelNotes(app)
      + '<button data-levels-print="1" class="ps-print-btn">Print these two sheets</button>'
      + '</div>';
  }

  /* ------------------------------------------------------------------ iso --- */

  /* The block as a solid of earth, seen from above one corner, before and after.

     A plan says what the levels are and a section says what one line does.
     Neither shows the shape of the ground, and that is the thing an owner and a
     builder argue about: how much is this actually falling, where does the hump
     sit, what does the cut look like once it is dug. So this draws the surveyed
     surface and the finished one side by side, out of the same numbers the
     Levels sheet is built from.

     There is no perspective in it. A length on the drawing is the same length
     wherever it sits, which is what an isometric is for. Height is stretched,
     because the block falls 2 m across 40 m and at true scale that is a flat
     sheet of paper. The stretch is written on the drawing and in the legend: a
     drawing that exaggerates a slope without saying so is a lie about it. */

  var ISOZ = 4;                 /* height stretch, stated on the drawing */
  /* What each quarter turn is looking from, said on the drawing so a turned view
     is still placeable without counting corners. */
  var ISOVIEWS = [
    'From the reserve boundary. Duffy Street away to the right, driveway top right.',
    'From the north east boundary. Reserve away to the right, driveway top left.',
    'From Duffy Street. Reserve away to the right, driveway bottom left.',
    'From the west south west boundary. Duffy Street to the left, driveway bottom right.'
  ];
  var NX = 40, NY = 21;         /* grid cells over the block, about a metre each */
  var ISOX = 40, ISOY = 21.33;  /* the block, reserve boundary to street and across */
  var COS30 = 0.8660254;

  /* Reserve boundary at the near left, Duffy Street away to the right, so the
     block sits the way the plan draws it and the driveway is top right. The
     viewer stands over the reserve corner and the ground falls away toward the
     street. */
  /* The view turns in quarter steps about the middle of the block. A quarter is
     exact, so the boundary stays square to the drawing and the two panels keep
     the same footing however far round it is turned. Turn 0 is the plan's own
     framing: reserve boundary near left, Duffy Street away right. */
  function isoRot(x, y, turn) {
    var dx = x - ISOX / 2, dy = y - ISOY / 2;
    if (turn === 1) return [-dy, dx];
    if (turn === 2) return [-dx, -dy];
    if (turn === 3) return [dy, -dx];
    return [dx, dy];
  }
  function isoPt(x, y, z, o) {
    var r = isoRot(x, y, o.turn);
    return [o.cx + ((r[0] - r[1]) * COS30 - o.mx) * o.k,
            o.cy + (-(r[0] + r[1]) * 0.5 - (z - o.z0) * ISOZ - o.my) * o.k];
  }
  /* How far away a point is. Nearest is the smallest, so the painter works down
     from the largest. */
  function isoAt(x, y, turn) { var r = isoRot(x, y, turn); return r[0] + r[1]; }
  function isoDepth(p, q) { return q.d - p.d; }
  /* A face with this outward normal turns toward the viewer when the normal,
     turned the same way, points at lower depth. */
  function isoFacing(nx, ny, turn) {
    var r = isoRot(nx + ISOX / 2, ny + ISOY / 2, turn);
    return r[0] + r[1] < -1e-9;
  }

  /* Hypsometric tint, low ground dark and high ground pale, times a Lambert
     term off the surface normal so the form reads rather than just the height. */
  function isoFill(z, lo, hi, shade, tint) {
    var t = hi > lo ? (z - lo) / (hi - lo) : 0.5;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var r = 122 + 104 * t, g = 140 + 88 * t, b = 100 + 78 * t;
    if (tint === 'cut') { r = 198 + 34 * t; g = 116 + 36 * t; b = 84 + 28 * t; }
    if (tint === 'fill') { r = 104 + 54 * t; g = 146 + 46 * t; b = 186 + 34 * t; }
    var k = 0.74 + 0.40 * shade;
    var q = function (v) { v = Math.round(v * k); return v < 0 ? 0 : v > 255 ? 255 : v; };
    return 'rgb(' + q(r) + ',' + q(g) + ',' + q(b) + ')';
  }

  /* Two thirds of the way to a flat grey, which reads as "not measured" without
     disappearing next to the ground beside it. */
  function isoMute(c) {
    var m = c.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!m) return c;
    var f = function (v, g) { return Math.round(+v * 0.34 + g * 0.66); };
    return 'rgb(' + f(m[1], 176) + ',' + f(m[2], 172) + ',' + f(m[3], 158) + ')';
  }

  var isoPoly = function (pts, fill, stroke) {
    return '<polygon points="' + pts.map(function (p) { return n1(p[0]) + ',' + n1(p[1]); }).join(' ')
      + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="0.25"' : '') + '/>';
  };

  /* One surface, as a solid: the ground on top and a cut face down the two sides
     that turn toward the viewer. `zf` gives a level at a point, so the same code
     draws the survey and the finished ground and the two cannot come out of
     step. */
  function isoSolid(app, zf, o, lo, hi, base, diff) {
    var out = [], i, j, Z = [], S = [];
    for (i = 0; i <= NX; i++) { Z[i] = []; S[i] = [];
      for (j = 0; j <= NY; j++) { var px = i / NX * ISOX, py = j / NY * ISOY;
        Z[i][j] = zf(px, py); S[i][j] = app.onSurvey(px, py); } }
    var gx = ISOX / NX, gy = ISOY / NY;
    for (i = 0; i < NX; i++) for (j = 0; j < NY; j++) {
      var x0 = i * gx, x1 = x0 + gx, y0 = j * gy, y1 = y0 + gy;
      var za = Z[i][j], zb = Z[i + 1][j], zc = Z[i + 1][j + 1], zd = Z[i][j + 1];
      var nx = -(zb - za) * gy, ny = -(zd - za) * gx, nz = gx * gy;
      var L = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      var shade = (nx * 0.42 + ny * 0.30 + nz * 0.86) / L; if (shade < 0) shade = 0;
      var zm = (za + zb + zc + zd) / 4, tint = null;
      if (diff) { var d = zm - diff(x0 + gx / 2, y0 + gy / 2);
        if (d > 0.02) tint = 'fill'; else if (d < -0.02) tint = 'cut'; }
      var c = isoFill(zm, lo, hi, shade, tint);
      /* Past the last measured point the fitted surface answers, and the seam
         between the two is a step. Drawn muted so it is not read as survey. */
      if (!(S[i][j] && S[i + 1][j] && S[i + 1][j + 1] && S[i][j + 1])) c = isoMute(c);
      /* stroked in its own colour: without it the quads leave hairline gaps
         where they meet and the surface reads as graph paper */
      out.push({d: isoAt(x0, y0, o.turn), s: isoPoly([isoPt(x0, y0, za, o), isoPt(x1, y0, zb, o), isoPt(x1, y1, zc, o), isoPt(x0, y1, zd, o)], c, c)});
    }
    out.sort(isoDepth);

    /* The two cut faces that turn toward the viewer, each one polygon following
       the ground along its edge. The other two are behind the surface and are
       not drawn. Drawn after it, because both are nearer than any of it.

       The solid is a constant thickness rather than a flat base. On a block that
       falls 2 m the near edge is the high one, and a flat base under it puts a
       three metre wall across the front of the drawing with the ground squeezed
       above it. A slab of even depth keeps the ground the subject. */
    var edge = function (pts) {
      var a = [], b = [], k;
      for (k = 0; k < pts.length; k++) a.push(isoPt(pts[k][0], pts[k][1], pts[k][2], o));
      for (k = pts.length - 1; k >= 0; k--) b.push(isoPt(pts[k][0], pts[k][1], pts[k][2] - base, o));
      var d = 0; pts.forEach(function (q) { d += isoAt(q[0], q[1], o.turn); });
      return {d: d / pts.length, s: a.concat(b)};
    };
    var sides = [], p4 = [];
    for (i = 0; i <= NX; i++) p4.push([i * gx, 0, Z[i][0]]);           sides.push(edge(p4));
    p4 = []; for (i = 0; i <= NX; i++) p4.push([i * gx, ISOY, Z[i][NY]]); sides.push(edge(p4));
    p4 = []; for (j = 0; j <= NY; j++) p4.push([0, j * gy, Z[0][j]]);   sides.push(edge(p4));
    p4 = []; for (j = 0; j <= NY; j++) p4.push([ISOX, j * gy, Z[NX][j]]); sides.push(edge(p4));
    /* only the two edges that turn toward the viewer; the far two are behind
       the surface and drawing them puts a wall across it */
    sides.sort(function (a, b) { return a.d - b.d; });
    var shown = sides.slice(0, 2).sort(isoDepth);

    /* The quads go back to the caller unsorted into the drawing, so anything
       else standing on the ground can be merged into the same order. A platform
       drawn after all of it floats over ground that should hide it. */
    return {quads: out, sides: isoPoly(shown[0].s, '#c6bba2', '#9c9078') + isoPoly(shown[1].s, '#b3a68c', '#9c9078')};
  }

  /* The house is six overlapping rectangles in the data. Drawn as six boxes they
     intersect and read as a pile, so they are merged into one outline first.
     Everything is axis aligned, so the merge is a grid over the distinct edges:
     mark the cells any rectangle covers, keep the cell edges where covered meets
     uncovered, and chain those into rings. Interior stays on the left, so a ring
     comes out anticlockwise. */
  function rectUnion(rects) {
    var xs = [], ys = [], i, j;
    rects.forEach(function (r) { xs.push(r[0], r[2]); ys.push(r[1], r[3]); });
    var uniq = function (a) { return a.sort(function (p, q) { return p - q; })
      .filter(function (v, k, arr) { return !k || Math.abs(v - arr[k - 1]) > 1e-9; }); };
    xs = uniq(xs); ys = uniq(ys);
    var nx = xs.length - 1, ny = ys.length - 1, cov = [];
    for (i = 0; i < nx; i++) { cov[i] = [];
      for (j = 0; j < ny; j++) {
        var cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
        cov[i][j] = rects.some(function (r) { return cx > r[0] && cx < r[2] && cy > r[1] && cy < r[3]; });
      } }
    var on = function (a, b) { return a >= 0 && b >= 0 && a < nx && b < ny && cov[a][b]; };
    var segs = [];
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) {
      if (!cov[i][j]) continue;
      if (!on(i, j - 1)) segs.push([[xs[i], ys[j]], [xs[i + 1], ys[j]]]);
      if (!on(i, j + 1)) segs.push([[xs[i + 1], ys[j + 1]], [xs[i], ys[j + 1]]]);
      if (!on(i - 1, j)) segs.push([[xs[i], ys[j + 1]], [xs[i], ys[j]]]);
      if (!on(i + 1, j)) segs.push([[xs[i + 1], ys[j]], [xs[i + 1], ys[j + 1]]]);
    }
    var key = function (p) { return p[0].toFixed(4) + ',' + p[1].toFixed(4); };
    var from = {};
    segs.forEach(function (sg) { (from[key(sg[0])] = from[key(sg[0])] || []).push(sg); });
    var used = {}, rings = [];
    segs.forEach(function (sg, k) {
      if (used[k]) return;
      var ring = [sg[0]], cur = sg, guard = 0;
      used[segs.indexOf(cur)] = 1;
      while (guard++ < 4000) {
        ring.push(cur[1]);
        var next = (from[key(cur[1])] || []).filter(function (t) { return !used[segs.indexOf(t)]; })[0];
        if (!next) break;
        used[segs.indexOf(next)] = 1; cur = next;
        if (key(cur[1]) === key(ring[0])) { ring.push(cur[1]); break; }
      }
      if (ring.length > 3) rings.push(ring);
    });
    return { rings: rings, segs: segs };
  }

  /* The house, standing at its finished floor rather than lying on the ground.
     The step from a door down to the paving is the thing worth seeing, and at
     four times height a roof would hide the yard behind it, so the floor plane
     is drawn and the roof is not. The driveway has no floor level and lies on
     the ground. */
  function isoFootprints(app, zf, o, built) {
    var D = app.D, out = [], fl = app.D.FFL;
    (D.DRIVE || []).forEach(function (b) {
      var C = [[b[1], b[2]], [b[3], b[2]], [b[3], b[4]], [b[1], b[4]]];
      out.push(isoPoly(C.map(function (c) { return isoPt(c[0], c[1], zf(c[0], c[1]) + 0.02, o); }),
        'rgba(236,229,214,.85)', '#a79d88'));
    });
    /* Before the build, only what is standing. The link, the rear addition and
       the kitchen addition are new work on the demolition plan, so they are left
       out of the surveyed half and appear in the built one. The existing floor
       is 611.65 either way, which is the level the survey measured on it and the
       level the architect keeps. */
    var u = rectUnion((D.BOXH || []).filter(function (b) { return built || !b[7]; })
      .map(function (b) { return [b[1], b[2], b[3], b[4]]; }));
    /* A boundary segment faces the viewer when its outward normal points at
       lower x or lower y, which with this winding is a run along +x or along
       -y. Those get a face down to the ground; the rest are behind the floor. */
    var faces = [];
    u.segs.forEach(function (sg) {
      /* interior is on the left of the run, so the outward normal is its right */
      var dx = sg[1][0] - sg[0][0], dy = sg[1][1] - sg[0][1];
      if (!isoFacing(dy, -dx, o.turn)) return;
      /* the ground is read a little outside the wall, so where paving is made up
         to the floor the face closes rather than leaving a sliver of skirt */
      var L = Math.hypot(dx, dy) || 1, ox = dy / L * 0.35, oy = -dx / L * 0.35;
      var g0 = zf(sg[0][0] + ox, sg[0][1] + oy), g1 = zf(sg[1][0] + ox, sg[1][1] + oy);
      if (Math.min(g0, g1) > fl - 0.02) return;
      faces.push({d: isoAt((sg[0][0] + sg[1][0]) / 2, (sg[0][1] + sg[1][1]) / 2, o.turn), s: isoPoly([
        isoPt(sg[0][0], sg[0][1], fl, o), isoPt(sg[1][0], sg[1][1], fl, o),
        isoPt(sg[1][0], sg[1][1], Math.min(g1, fl), o), isoPt(sg[0][0], sg[0][1], Math.min(g0, fl), o)],
        'rgba(222,213,194,.98)', null)});
    });
    faces.sort(isoDepth);
    out.push(faces.map(function (q) { return q.s; }).join(''));
    u.rings.forEach(function (r) {
      out.push(isoPoly(r.map(function (c) { return isoPt(c[0], c[1], fl, o); }),
        'rgba(248,244,235,.99)', '#8d8574'));
    });
    return out.join('');
  }

  /* Every surface the scheme lays down, at the level it actually finishes at.

     The ground under it is drawn on a metre grid, and a platform three metres
     across cannot land on that: the quads straddling its edge ramp from the
     finished level down to the ground and the platform reads as a smudge rather
     than a plane. Worse, paving set level with the floor then looks as though it
     misses it. So each one is laid out as its own polygon at its own level, and
     a face is dropped from its edge to the ground it stands on, which is the
     depth of fill under it. */
  function isoPlatforms(app, ex, o) {
    var parts = app.finParts(), out = [];
    parts.forEach(function (pt) {
      var poly = pt.poly, n = poly.length;
      if (!poly || n < 3) return;
      var top = poly.map(function (p) { return app.partZ(pt, p[0], p[1]); });
      var gnd = poly.map(function (p) { return ex(p[0], p[1]); });
      var cx = 0, cy = 0, zm = 0, gm = 0, i;
      for (i = 0; i < n; i++) { cx += poly[i][0] / n; cy += poly[i][1] / n; zm += top[i] / n; gm += gnd[i] / n; }
      var d = zm - gm, tint = d > 0.02 ? 'fill' : d < -0.02 ? 'cut' : null;
      if (!tint && !pt.bu) return;
      /* the side faces first, then the top, so the top closes the shape off */
      for (i = 0; i < n; i++) {
        var a = poly[i], b = poly[(i + 1) % n];
        var ex2 = b[0] - a[0], ey = b[1] - a[1];
        /* outward normal is whichever of the two turns away from the middle */
        var nx = ey, ny = -ex2;
        if (nx * (a[0] - cx) + ny * (a[1] - cy) < 0) { nx = -nx; ny = -ny; }
        if (!isoFacing(nx, ny, o.turn)) continue;
        var ta = top[i], tb = top[(i + 1) % n], ga = gnd[i], gb = gnd[(i + 1) % n];
        if (ta - ga < 0.02 && tb - gb < 0.02) continue;
        out.push({d: isoAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, o.turn), s: isoPoly([
          isoPt(a[0], a[1], ta, o), isoPt(b[0], b[1], tb, o),
          isoPt(b[0], b[1], Math.min(gb, tb), o), isoPt(a[0], a[1], Math.min(ga, ta), o)],
          isoFill(zm, o.lo, o.hi, 0.45, tint), null)});
      }
      out.push({d: isoAt(cx, cy, o.turn) - 0.01, s: isoPoly(poly.map(function (p, k) {
        return isoPt(p[0], p[1], top[k], o); }), isoFill(zm, o.lo, o.hi, 1, tint), null)});
    });
    return out;
  }

  /* The sandstone block edge, which is the thing that holds the high side up.
     Only its top is drawn, and that is not a shortcut: the viewer stands on the
     high side, where a retaining wall shows its coping and keeps its face to the
     ground below. The lawn is level with the top, so without the band drawn in
     stone there is nothing to see where the edge runs. */
  function isoWalls(app, zf, o) {
    var items = (app.state.items || []).filter(function (i) {
      return i.n === 'Sandstone block edge' || i.n === 'Seat / retaining wall'; });
    if (!items.length) return '';
    var out = [];
    items.forEach(function (it) {
      var poly = app.itemPoly(it);
      if (!poly || poly.length < 3) return;
      /* the top sits at the high side, so the band reads as the edge of the
         platform it retains rather than sinking into the ground below it */
      var top = -1e9;
      poly.forEach(function (p) { var z = zf(p[0], p[1]); if (z > top) top = z; });
      var c = app.centre(it);
      [-1, 1].forEach(function (sgn) {
        poly.forEach(function (p) {
          var dx = p[0] - c[0], dy = p[1] - c[1], L = Math.hypot(dx, dy) || 1;
          var z = zf(p[0] + sgn * dx / L * 0.8, p[1] + sgn * dy / L * 0.8);
          if (z > top) top = z;
        });
      });
      var c2 = app.centre(it);
      out.push({d: isoAt(c2[0], c2[1], o.turn), s: isoPoly(poly.map(function (p) { return isoPt(p[0], p[1], top + 0.03, o); }),
        '#e0cda6', '#8a7250')});
    });
    out.sort(isoDepth);
    return out.map(function (q) { return q.s; }).join('');
  }

  /* Fits the drawing to its half of the sheet, so nothing depends on the block
     staying the size it is. */
  /* Fits the drawing to its half of the sheet, from the ground it actually
     draws. Fitting the corners against the full range of levels counted
     combinations that never occur, a corner at the highest level and another at
     the lowest, and left the drawing filling about half its box. */
  function isoFit(cx, cy, w, h, samples, lo, turn) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    samples.forEach(function (p) {
      var r = isoRot(p[0], p[1], turn);
      var sx = (r[0] - r[1]) * COS30;
      var sy = -(r[0] + r[1]) * 0.5 - (p[2] - lo) * ISOZ;
      if (sx < x0) x0 = sx; if (sx > x1) x1 = sx;
      if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
    });
    var k = Math.min(w / (x1 - x0), h / (y1 - y0));
    return {cx: cx, cy: cy, k: k, z0: lo, turn: turn, mx: (x0 + x1) / 2, my: (y0 + y1) / 2};
  }

  /* The drawing, and under it the numbers the plan already computes, so nothing
     here is a second opinion. */
  function isoView(app) {
    var ex = function (x, y) { return app.RL(x, y); };
    var fin = function (x, y) { return app.finRL(x, y); };

    /* One tint ramp across both panels, so a colour means the same level in
       each and the pair can be read against one another. The row in the table
       is the surveyed ground on its own, because that is what it says it is. */
    var lo = 1e9, hi = -1e9, exLo = 1e9, exHi = -1e9, i, j, x, y;
    for (i = 0; i <= NX; i++) for (j = 0; j <= NY; j++) {
      x = i / NX * ISOX; y = j / NY * ISOY;
      var a = ex(x, y), b = fin(x, y);
      if (a < exLo) exLo = a; if (a > exHi) exHi = a;
      if (a < lo) lo = a; if (b < lo) lo = b;
      if (a > hi) hi = a; if (b > hi) hi = b;
    }
    var base = 0.5;   /* how deep the slab is drawn, not a datum */

    var cell = (ISOX / NX) * (ISOY / NY), cut = 0, fill = 0, mxc = 0, mxf = 0, moved = 0;
    for (i = 0; i < NX; i++) for (j = 0; j < NY; j++) {
      var px = (i + 0.5) / NX * ISOX, py = (j + 0.5) / NY * ISOY;
      var d = fin(px, py) - ex(px, py);
      if (d > 0.02) { fill += d * cell; moved++; if (d > mxf) mxf = d; }
      else if (d < -0.02) { cut -= d * cell; moved++; if (-d > mxc) mxc = -d; }
    }

    /* Both panels take one scale, so the pair can be read against each other.
       The samples are the ground both surfaces actually reach, top and bottom. */
    var samp = [];
    for (i = 0; i <= NX; i++) for (j = 0; j <= NY; j++) {
      var sx2 = i / NX * ISOX, sy2 = j / NY * ISOY;
      var ze = ex(sx2, sy2), zf2 = fin(sx2, sy2);
      samp.push([sx2, sy2, ze], [sx2, sy2, zf2],
                [sx2, sy2, Math.min(ze, zf2) - base]);
    }
    var turn = ((app.state && app.state.isoTurn) | 0) & 3;
    var W = 250, H = 128, PW = 122, PH = 92, top = 22;
    var o1 = isoFit(W * 0.25, top + PH / 2, PW, PH, samp, lo, turn);
    var o2 = isoFit(W * 0.75, top + PH / 2, PW, PH, samp, lo, turn);
    o1.lo = o2.lo = lo; o1.hi = o2.hi = hi;
    var panel = function (o, title, sub, zf, diff) {
      return '<text x="' + n1(o.cx) + '" y="11" text-anchor="middle" font-size="6.6" font-weight="700" fill="' + INK + '">' + esc(title) + '</text>'
        + '<text x="' + n1(o.cx) + '" y="18" text-anchor="middle" font-size="4.6" fill="' + MUT + '">' + esc(sub) + '</text>'
        + (function () {
          var body = isoSolid(app, zf, o, lo, hi, base, diff);
          var ground = body.quads.concat(diff ? isoPlatforms(app, diff, o) : []).sort(isoDepth);
          return ground.map(function (q) { return q.s; }).join('') + body.sides;
        })()
        + (diff ? isoWalls(app, zf, o) : '') + isoFootprints(app, zf, o, !!diff);
    };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
      + '<rect width="' + W + '" height="' + H + '" fill="' + PAPER + '"/>'
      + panel(o1, 'As surveyed', 'the ground and the house as they stand', ex, null)
      + panel(o2, 'As built', moved ? 'the additions built and the ground shaped' : 'the additions built, no earth moved yet', fin, ex)
      + '<text x="' + n1(W / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="4.4" fill="' + MUT + '">'
      + esc(ISOVIEWS[turn]) + '</text>'
      + '<text x="' + n1(W / 2) + '" y="' + (H - 2.5) + '" text-anchor="middle" font-size="4.4" fill="' + MUT + '">'
      + 'Height stretched ' + ISOZ + ' times so the fall reads. Plan lengths are true.</text>'
      + '</svg>';

    var sw = function (c, t) {
      return '<span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:' + c + ';vertical-align:-1px"></span> ' + t + '</span>';
    };
    var legend = '<div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--color-neutral-700)">'
      + sw('rgb(205,130,96)', 'cut, ground taken away')
      + sw('rgb(120,163,200)', 'fill, ground made up')
      + sw('rgb(160,175,130)', 'left as the surveyor found it')
      + sw('rgb(171,169,152)', 'no survey here, the fitted surface answers')
      + sw('#e0cda6', 'sandstone block edge, holding the high side up')
      + '<span>Pale is high ground, dark is low.</span></div>';

    var tbl = '<table class="ps-tbl"><tbody>'
      + '<tr><td>Falls, reserve boundary to street</td><td class="ps-num">' + n1(ex(0, ISOY / 2) - ex(ISOX, ISOY / 2)) + ' m over ' + ISOX + ' m</td></tr>'
      + '<tr><td>Highest and lowest surveyed ground on the block</td><td class="ps-num">' + n1(exHi) + ' to ' + n1(exLo) + ' m AHD</td></tr>'
      + '<tr><td>Finished floor, and the paving set level with it</td><td class="ps-num">' + app.D.FFL.toFixed(2) + ' m AHD</td></tr>'
      + '<tr><td>Ground this scheme cuts away</td><td class="ps-num">' + n1(cut) + ' m³, deepest ' + Math.round(mxc * 1000) + ' mm</td></tr>'
      + '<tr><td>Ground this scheme makes up</td><td class="ps-num">' + n1(fill) + ' m³, deepest ' + Math.round(mxf * 1000) + ' mm</td></tr>'
      + '<tr class="ps-tot"><td>Share of the block that moves at all</td><td class="ps-num">' + Math.round(moved / (NX * NY) * 100) + '%</td></tr>'
      + '</tbody></table>';

    var turns = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px">'
      + '<button data-iso-turn="' + ((turn + 3) & 3) + '" class="ps-turn-btn">Turn left</button>'
      + '<button data-iso-turn="' + ((turn + 1) & 3) + '" class="ps-turn-btn">Turn right</button>'
      + '<button data-iso-turn="0" class="ps-turn-btn"' + (turn === 0 ? ' aria-pressed="true"' : '') + '>Back to the plan\u2019s framing</button>'
      + '</div>';
    return '<div class="ps-screen">'
      + '<div class="ps-warn">' + WARN + '</div>'
      + turns
      + '<div class="ps-screen-plan">' + svg + '</div>'
      + '<div class="ps-screen-legend">' + legend + '</div>'
      + tbl
      + '<p class="ps-fine">Both halves are the same grid, a metre square, over the whole block. The left one asks the survey for every level. '
      + 'The right one asks the plan: a surface that grades finishes on its own string line, anything with build-up declared finishes that much above what it sits on, and everything else is left as found. '
      + 'So the cut and fill here is the shaping this scheme does to the ground and not the trenching, and it will not match the Earthworks sheet, which counts the digging too. '
      + 'Inside a tree protection zone the ground is drawn as found, because that is what the tree plan allows: hand or hydro digging only, and no more than 100 mm of coarse woodchip added. '
      + 'The house is outlined where it sits and not drawn up, because at four times height a roof hides the yard behind it.</p>'
      + '</div>';
  }

  /* ----------------------------------------------------------- levels grid --- */

  /* Every square metre of the block, with the level it is now and the level it
     finishes at. A setting-out grid rather than a drawing: the builder stands on
     a square, reads the two numbers, and knows what to take off or put on.

     Two sheets, because the ground does not care about the tree plan and the
     tree plan does not care about the ground.

       As designed   what the levels are, with nothing in the way
       What is in the way   the same grid, marked where a restriction bites

     Two metres a square. A metre a square is 440 squares on this block and the
     numbers stop being readable at any size the sheet can carry. */

  var GRIDM = 2;
  /* the block itself, so squares off it are not printed */
  var BOUND = [[0, 0], [ISOX, 0], [ISOX, ISOY], [4.34, ISOY]];

  function gridCells(app) {
    var out = [], x, y;
    var nx = Math.ceil(ISOX / GRIDM), ny = Math.ceil(ISOY / GRIDM);
    for (y = 0; y < ny; y++) for (x = 0; x < nx; x++) {  /* eslint-disable-line */
      var x0 = x * GRIDM, y0 = y * GRIDM;
      var x1 = Math.min(x0 + GRIDM, ISOX), y1 = Math.min(y0 + GRIDM, ISOY);
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var now = app.RL(cx, cy), goal = app.finRL(cx, cy);
      var d = goal - now;
      /* inside a building there is nothing to set out, and the block is a
         trapezoid, so the squares past its west side are not the site */
      var built = (app.D.BOXH || []).some(function (b) {
        return cx > b[1] && cx < b[3] && cy > b[2] && cy < b[4]; });
      if (!app.inPoly([cx, cy], BOUND)) continue;
      /* what a restriction would say about this square */
      var zone = null, over = null;
      (app.D.TREES || []).forEach(function (t) {
        if (!t.ctrl) return;
        var r2 = (cx - t.x) * (cx - t.x) + (cy - t.y) * (cy - t.y);
        if (r2 <= t.srz * t.srz) zone = 'srz';
        else if (r2 <= t.ctrl * t.ctrl && zone !== 'srz') zone = 'tpz';
      });
      if (d > 0.4) over = 'fill'; else if (d < -0.5) over = 'cut';
      out.push({x0: x0, y0: y0, x1: x1, y1: y1, cx: cx, cy: cy,
        now: now, goal: goal, d: d, built: built, zone: zone, over: over,
        survey: app.onSurvey(cx, cy)});
    }
    return out;
  }

  /* Cut is warm, fill is cool, and ground that does not move is left alone. The
     scale is the same on both sheets so a colour means one thing. */
  function gridFill(c) {
    if (c.built) return '#efeae0';
    var d = c.d;
    if (d > 0.02) { var t = Math.min(1, d / 0.6); return 'rgb(' + Math.round(226 - 66 * t) + ',' + Math.round(238 - 46 * t) + ',' + Math.round(248 - 22 * t) + ')'; }
    if (d < -0.02) { var u = Math.min(1, -d / 0.6); return 'rgb(' + Math.round(250 - 8 * u) + ',' + Math.round(234 - 60 * u) + ',' + Math.round(222 - 70 * u) + ')'; }
    return '#f4f2ea';
  }

  function gridSheet(app, cells, marked) {
    var M = 13, S = 5.4, W = ISOX * S + M * 2, H = ISOY * S + M * 2 + 11;
    var g = '';
    cells.forEach(function (c) {
      var X = M + c.x0 * S, Y = M + (ISOY - c.y1) * S;
      var w = (c.x1 - c.x0) * S, h = (c.y1 - c.y0) * S;
      g += '<rect x="' + n1(X) + '" y="' + n1(Y) + '" width="' + n1(w) + '" height="' + n1(h)
        + '" fill="' + gridFill(c) + '" stroke="#cfc7b6" stroke-width="0.25"/>';
      if (c.built) return;
      /* now on top, goal under it, and the change only where there is one */
      g += '<text x="' + n1(X + w / 2) + '" y="' + n1(Y + h / 2 - 0.6) + '" text-anchor="middle" font-size="2.5" fill="' + MUT + '">' + c.now.toFixed(2) + '</text>'
        + '<text x="' + n1(X + w / 2) + '" y="' + n1(Y + h / 2 + 2.6) + '" text-anchor="middle" font-size="2.9" font-weight="700" fill="' + INK + '">' + c.goal.toFixed(2) + '</text>';
      if (Math.abs(c.d) > 0.02)
        g += '<text x="' + n1(X + w / 2) + '" y="' + n1(Y + h / 2 + 5.4) + '" text-anchor="middle" font-size="2.3" fill="' + (c.d > 0 ? '#2f6ea8' : '#a8532a') + '">'
          + (c.d > 0 ? '+' : '−') + Math.round(Math.abs(c.d) * 1000) + '</text>';
      if (!marked) return;
      if (c.zone) g += '<rect x="' + n1(X) + '" y="' + n1(Y) + '" width="' + n1(w) + '" height="' + n1(h)
        + '" fill="none" stroke="' + (c.zone === 'srz' ? '#7a5b2a' : '#a08a52') + '" stroke-width="' + (c.zone === 'srz' ? 1.1 : 0.7) + '"/>';
      if (c.over) g += '<circle cx="' + n1(X + w - 2.2) + '" cy="' + n1(Y + 2.2) + '" r="1.5" fill="'
        + (c.over === 'cut' ? '#a8332a' : '#2f6ea8') + '"/>';
      if (!c.survey) g += '<circle cx="' + n1(X + 2.2) + '" cy="' + n1(Y + 2.2) + '" r="1.2" fill="#9c9078"/>';
    });
    /* the boundary and the buildings over the top, so the grid is placeable */
    var pt = function (x, y) { return n1(M + x * S) + ',' + n1(M + (ISOY - y) * S); };
    g += '<polygon points="' + [[0, 0], [ISOX, 0], [ISOX, ISOY], [4.34, ISOY]].map(function (q) { return pt(q[0], q[1]); }).join(' ')
      + '" fill="none" stroke="' + INK + '" stroke-width="0.7"/>';
    (app.D.BOXH || []).forEach(function (b) {
      g += '<polygon points="' + [[b[1], b[2]], [b[3], b[2]], [b[3], b[4]], [b[1], b[4]]].map(function (q) { return pt(q[0], q[1]); }).join(' ')
        + '" fill="none" stroke="#8d8574" stroke-width="0.5"/>';
    });
    g += '<text x="' + n1(M) + '" y="' + n1(H - 7) + '" font-size="3.1" fill="' + MUT + '">Reserve boundary left, Duffy Street right. '
      + GRIDM + ' m squares. Levels in metres AHD, taken at the middle of each square.</text>'
      + '<text x="' + n1(M) + '" y="' + n1(H - 2.6) + '" font-size="3.1" fill="' + MUT + '">Grey is the ground now, black is what it finishes at, and the third line is the change in millimetres.</text>';
    return '<svg viewBox="0 0 ' + n1(W) + ' ' + n1(H) + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
      + '<rect width="' + n1(W) + '" height="' + n1(H) + '" fill="' + PAPER + '"/>' + g + '</svg>';
  }

  function gridView(app) {
    var cells = gridCells(app);
    var moved = cells.filter(function (c) { return !c.built && Math.abs(c.d) > 0.02; });
    var cut = 0, fill = 0;
    cells.forEach(function (c) { if (c.built) return;
      var A = (c.x1 - c.x0) * (c.y1 - c.y0);
      if (c.d > 0) fill += c.d * A; else cut -= c.d * A; });
    var inZone = moved.filter(function (c) { return c.zone; });
    var over = moved.filter(function (c) { return c.over; });

    var sw = function (col, t) {
      return '<span style="white-space:nowrap"><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:' + col + ';vertical-align:-1px"></span> ' + t + '</span>';
    };
    return '<div class="ps-screen">'
      + '<div class="ps-warn">' + WARN + '</div>'

      + '<h4 style="margin:16px 0 2px;font-size:15px">Sheet one, as designed</h4>'
      + '<p class="ps-fine" style="margin:0 0 8px">The levels on their own. Nothing here asks whether a tree plan or a site classification allows it.</p>'
      + '<div class="ps-screen-plan">' + gridSheet(app, cells, false) + '</div>'
      + '<div class="ps-screen-legend" style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--color-neutral-700)">'
      + sw('rgb(160,178,178)', 'made up') + sw('rgb(242,174,152)', 'taken off')
      + sw('#f4f2ea', 'left alone') + sw('#efeae0', 'under the house, nothing to set out')
      + '</div>'

      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Squares that move at all</td><td class="ps-num">' + moved.length + ' of ' + cells.filter(function (c) { return !c.built; }).length + '</td></tr>'
      + '<tr><td>Ground to bring in</td><td class="ps-num">' + n1(fill) + ' m³</td></tr>'
      + '<tr><td>Ground to take off</td><td class="ps-num">' + n1(cut) + ' m³</td></tr>'
      + '<tr class="ps-tot"><td>Net</td><td class="ps-num">' + (fill - cut >= 0 ? 'import ' : 'export ') + n1(Math.abs(fill - cut)) + ' m³</td></tr>'
      + '</tbody></table>'

      + '<h4 style="margin:26px 0 2px;font-size:15px">Sheet two, what is in the way</h4>'
      + '<p class="ps-fine" style="margin:0 0 8px">The same grid and the same numbers, marked where something has an opinion about them.</p>'
      + '<div class="ps-screen-plan">' + gridSheet(app, cells, true) + '</div>'
      + '<div class="ps-screen-legend" style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--color-neutral-700)">'
      + '<span style="white-space:nowrap"><span style="display:inline-block;width:11px;height:11px;border:1.6px solid #7a5b2a;vertical-align:-1px"></span> structural root zone</span>'
      + '<span style="white-space:nowrap"><span style="display:inline-block;width:11px;height:11px;border:1px solid #a08a52;vertical-align:-1px"></span> tree protection zone</span>'
      + sw('#2f6ea8', 'over 400 mm of fill') + sw('#a8332a', 'over 500 mm of cut')
      + sw('#9c9078', 'no survey here, the fitted surface answers')
      + '</div>'

      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Squares that move inside a protection zone</td><td class="ps-num">' + inZone.length + '</td></tr>'
      + '<tr><td>Squares past the 400 mm fill or 500 mm cut limit</td><td class="ps-num">' + over.length + '</td></tr>'
      + '<tr class="ps-tot"><td>Squares that move and nothing objects to</td><td class="ps-num">' + (moved.length - new Set(inZone.concat(over)).size) + '</td></tr>'
      + '</tbody></table>'

      + '<p class="ps-fine">Set out from the survey plan, not from this. The levels here are the surveyor’s surface, exact where they measured and interpolated between, and the goal is what the plan grades to. '
      + 'A square marked inside a protection zone is not a square you cannot touch. It is one the tree plan wants hand or hydro dug, in the approved scope, with an arborist there. '
      + 'The 400 mm fill and 500 mm cut marks are the point at which the geotechnical report’s Class P classification has to be looked at again. '
      + 'Both sheets carry the same numbers, so nothing is being softened on the first one.</p>'
      + '</div>';
  }

  /* ---------------------------------------------------------------- water --- */

  /* The half of the drainage design that is not a pipe. Every surface on the plan
     that puts water into the ground, what it holds, and, for the three that
     concentrate it. How far it is standing off a wall. Read off the plan, so it
     answers for the layout as it is now rather than for the one in the handbook. */
  function waterView(app) {
    var w = app.water();
    if (!w.rows.length) {
      return '<div class="ps-screen"><p class="ps-fine">Nothing on the plan is holding water yet. '
        + 'Swales, gravel paths, mulched beds and mounds all count here; add one and this fills in.</p></div>';
    }
    var rows = w.rows.map(function (r) {
      var stand = r.eng ? (r.wall == null ? '·'
        : n1(r.wall) + ' m' + (r.wall < 3 ? ' <b>too close</b>' : '')) : 'on the surface';
      return '<tr><td>' + esc(r.n) + '</td><td class="ps-num">' + n1(r.area) + '</td>'
        + '<td class="ps-num">' + Math.round(r.d * 1000) + '</td>'
        + '<td class="ps-num">' + Math.round(r.vol * 1000).toLocaleString('en-AU') + '</td>'
        + '<td>' + esc(r.mat) + '</td><td class="ps-num">' + stand + '</td></tr>';
    }).join('');
    return '<div class="ps-screen">'
      + '<table class="ps-tbl"><thead><tr><th>Surface</th><th class="ps-num">Area m²</th>'
      + '<th class="ps-num">Depth mm</th><th class="ps-num">Holds L</th><th>Made of</th>'
      + '<th class="ps-num">Off the wall</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<table class="ps-tbl"><tbody>'
      + '<tr><td>Held where it falls</td><td class="ps-num">' + Math.round(w.held * 1000).toLocaleString('en-AU') + ' L</td></tr>'
      + '<tr><td>Of that, still working once the mulch is wet</td><td class="ps-num">' + Math.round(w.eng * 1000).toLocaleString('en-AU') + ' L</td></tr>'
      + '<tr><td>Design storm over the whole block, 5 min, 1 in 10 yr</td><td class="ps-num">' + Math.round(w.storm * 1000).toLocaleString('en-AU') + ' L</td></tr>'
      + '<tr class="ps-tot"><td>Share of that storm never reaching a pipe</td><td class="ps-num">' + Math.round(w.share * 100) + '%</td></tr>'
      + '</tbody></table>'
      + '<p class="ps-fine">Depth is the working depth of the material, not how deep it is dug: a trough ponds 250 mm at its invert over a battered section, a gravel path is the void in its 150 mm base, and a mound or a mulch blanket holds what the chip itself holds. '
      + 'These are first-flush figures into dry ground. In sustained rain the chip is already wet and only the troughs and the gravel are still taking water, which is the second line above. '
      + 'None of it replaces the piped system, and none of it is allowed to change the fact that the overland flow path stays clear. It decides how much of ordinary rain never reaches a pipe at all.</p>'
      + '</div>';
  }

  /* ------------------------------------------------------- interior --- */

  /* The house itself, which until now was six boxes with a guessed ridge. This
     draws the architect's model: the plan of what is actually built, and a
     section cut straight through it.

     The plan and the section share one horizontal scale and one origin, so the
     section sits under the plan and every wall in it is directly below the wall
     it cuts. That is the whole point of drawing them together: the owner can
     put a finger on a wall in the plan and read its height off the section.

     The cut runs in x, which is the fall line, 1 in 19 to the street. So the
     section also shows the ground falling under the floor, and the floor
     staying level across it, which is the thing that decides where a step
     appears at a door. */

  var INTPAD = 1.2;                    /* metres of paper round the house */

  function intBounds(H) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    var put = function (x, y) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    };
    H.WALL.forEach(function (w) { put(w[0], w[1]); put(w[2], w[3]); });
    H.SLAB.forEach(function (s) { s[4].forEach(function (p) { put(p[0], p[1]); }); });
    H.ROOF.forEach(function (r) { r[5].forEach(function (p) { put(p[0], p[1]); }); });
    return [x0 - INTPAD, y0 - INTPAD, x1 + INTPAD, y1 + INTPAD];
  }

  /* A wall drawn as what it is, a rectangle t wide about its axis. */
  function intWallQuad(w) {
    var dx = w[2] - w[0], dy = w[3] - w[1], L = Math.hypot(dx, dy);
    if (L < 1e-6) return null;
    var nx = -dy / L * (w[4] / 2), ny = dx / L * (w[4] / 2);
    return [[w[0] + nx, w[1] + ny], [w[2] + nx, w[3] + ny],
            [w[2] - nx, w[3] - ny], [w[0] - nx, w[1] - ny]];
  }

  /* Where a segment of the house crosses the cut, and at what height. Roofs
     carry a z per boundary point, so the roof line in the section is read off
     the model rather than rebuilt from a pitch. */
  function intCross(poly, zs, cy) {
    var hits = [], i, j, a, b, t;
    for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      a = poly[j]; b = poly[i];
      if ((a[1] > cy) === (b[1] > cy)) continue;
      t = (cy - a[1]) / (b[1] - a[1]);
      hits.push([a[0] + (b[0] - a[0]) * t,
                 zs ? zs[j] + (zs[i] - zs[j]) * t : null]);
    }
    return hits.sort(function (p, q) { return p[0] - q[0]; });
  }

  function interiorView(app) {
    var H = window.DUFFY_HOUSE;
    if (!H) return '<div class="ps-screen"><p class="ps-fine">The house model is not loaded.</p></div>';

    var bbox = function (pts) {
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      return [Math.min.apply(null, xs), Math.min.apply(null, ys),
              Math.max.apply(null, xs), Math.max.apply(null, ys)];
    };
    var B = intBounds(H), X0 = B[0], X1 = B[2], Y0 = B[1], Y1 = B[3];
    var W = 250, k = W / (X1 - X0);
    var sx = function (x) { return (x - X0) * k; };
    var sy = function (y) { return (Y1 - y) * k; };
    var PH = (Y1 - Y0) * k;

    /* the cut, stepped by the buttons under the drawing */
    var cy = app.state && app.state.intCut != null ? app.state.intCut : 13.2;
    cy = Math.max(Y0 + 0.3, Math.min(Y1 - 0.3, cy));

    var FFL = H.STOREY.reduce(function (m, s) { return s[0] === 'FFL' ? s[1] : m; }, 611.65);
    var lvlFill = function (z) {
      return Math.abs(z - FFL) < 0.02 ? '#efe9dd' : (z < FFL ? '#e2dac9' : '#f5f1e8');
    };

    /* ---- the plan ---- */
    var plan = '<svg viewBox="0 0 ' + n1(W) + ' ' + n1(PH) + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
      + '<rect width="' + n1(W) + '" height="' + n1(PH) + '" fill="' + PAPER + '"/>';

    H.SLAB.forEach(function (s) {
      plan += '<path d="' + s[4].map(function (p, i) {
        return (i ? 'L' : 'M') + n1(sx(p[0])) + ' ' + n1(sy(p[1]));
      }).join('') + 'Z" fill="' + lvlFill(s[0]) + '" stroke="' + FAINT + '" stroke-width="0.25"/>';
    });

    H.WALL.forEach(function (w) {
      var q = intWallQuad(w);
      if (!q) return;
      plan += '<path d="' + q.map(function (p, i) {
        return (i ? 'L' : 'M') + n1(sx(p[0])) + ' ' + n1(sy(p[1]));
      }).join('') + 'Z" fill="' + (w[8] ? INK : '#8d8471') + '"/>';
    });

    /* Openings are painted over the wall rather than cut out of it: a white
       rectangle the width of the unit, then glass for a window and a swing for
       a door. Boolean geometry would buy nothing a reader can see. */
    H.OPEN.forEach(function (o) {
      var w = o[6] >= 0 ? H.WALL[o[6]] : null;
      if (!w) return;
      var dx = w[2] - w[0], dy = w[3] - w[1], L = Math.hypot(dx, dy);
      if (L < 1e-6) return;
      var ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      var hw = Math.min(o[3], 2.2) / 2, ht = w[4] / 2 + 0.03;
      var q = [[o[1] - ux * hw + nx * ht, o[2] - uy * hw + ny * ht],
               [o[1] + ux * hw + nx * ht, o[2] + uy * hw + ny * ht],
               [o[1] + ux * hw - nx * ht, o[2] + uy * hw - ny * ht],
               [o[1] - ux * hw - nx * ht, o[2] - uy * hw - ny * ht]];
      plan += '<path d="' + q.map(function (p, i) {
        return (i ? 'L' : 'M') + n1(sx(p[0])) + ' ' + n1(sy(p[1]));
      }).join('') + 'Z" fill="' + PAPER + '"/>';
      if (o[0] === 'window') {
        plan += '<line x1="' + n1(sx(o[1] - ux * hw)) + '" y1="' + n1(sy(o[2] - uy * hw))
          + '" x2="' + n1(sx(o[1] + ux * hw)) + '" y2="' + n1(sy(o[2] + uy * hw))
          + '" stroke="' + COLI.glass + '" stroke-width="0.7"/>';
      } else {
        plan += '<path d="M' + n1(sx(o[1] - ux * hw)) + ' ' + n1(sy(o[2] - uy * hw))
          + 'A' + n1(hw * 2 * k) + ' ' + n1(hw * 2 * k) + ' 0 0 1 '
          + n1(sx(o[1] - ux * hw + nx * hw * 2)) + ' ' + n1(sy(o[2] - uy * hw + ny * hw * 2))
          + '" fill="none" stroke="' + MUT + '" stroke-width="0.3"/>';
      }
    });

    H.CWALL.forEach(function (c) {
      plan += '<rect x="' + n1(sx(c[0])) + '" y="' + n1(sy(c[3])) + '" width="' + n1((c[2] - c[0]) * k)
        + '" height="' + n1((c[3] - c[1]) * k) + '" fill="none" stroke="' + COLI.glass + '" stroke-width="0.8"/>';
    });

    /* the cut line, and which way you are looking */
    plan += '<line x1="0" y1="' + n1(sy(cy)) + '" x2="' + n1(W) + '" y2="' + n1(sy(cy))
      + '" stroke="' + COLI.cut + '" stroke-width="0.6" stroke-dasharray="4 2"/>'
      + '<text x="2" y="' + n1(sy(cy) - 1.6) + '" font-size="3.4" fill="' + COLI.cut + '">Section A, y ' + cy.toFixed(1) + ' m</text>';

    plan += '</svg>';

    /* ---- the section ---- */
    var zLo = 1e9, zHi = -1e9, xi;
    for (xi = X0; xi <= X1; xi += 0.5) {
      var g = app.RL(xi, cy), f = app.finRL(xi, cy);
      if (g < zLo) zLo = g; if (f < zLo) zLo = f;
      if (g > zHi) zHi = g; if (f > zHi) zHi = f;
    }
    H.WALL.forEach(function (w) { if (w[6] > zHi) zHi = w[6]; });
    H.ROOF.forEach(function (r) { if (r[1] > zHi) zHi = r[1]; });
    zLo -= 0.6; zHi += 0.5;
    var SH = (zHi - zLo) * k;
    var sz = function (z) { return (zHi - z) * k; };

    var sec = '<svg viewBox="0 0 ' + n1(W) + ' ' + n1(SH) + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
      + '<rect width="' + n1(W) + '" height="' + n1(SH) + '" fill="' + PAPER + '"/>';

    /* the ground, surveyed and finished, along the cut */
    var line = function (f) {
      var d = '', x;
      for (x = X0; x <= X1 + 0.001; x += 0.25)
        d += (d ? 'L' : 'M') + n1(sx(x)) + ' ' + n1(sz(f(x)));
      return d;
    };
    var gd = line(function (x) { return app.RL(x, cy); });
    sec += '<path d="' + gd + 'L' + n1(W) + ' ' + n1(SH) + 'L0 ' + n1(SH) + 'Z" fill="#e6dfd0"/>'
      + '<path d="' + gd + '" fill="none" stroke="' + COLI.ground + '" stroke-width="0.5"/>'
      + '<path d="' + line(function (x) { return app.finRL(x, cy); })
      + '" fill="none" stroke="' + COLI.fin + '" stroke-width="0.6" stroke-dasharray="3 1.6"/>';

    /* roofs first, so a wall drawn after reads in front of the roof behind it */
    H.ROOF.forEach(function (r) {
      var hits = intCross(r[5], r[6], cy);
      if (hits.length < 2) return;
      var i;
      for (i = 0; i + 1 < hits.length; i += 2)
        sec += '<line x1="' + n1(sx(hits[i][0])) + '" y1="' + n1(sz(hits[i][1]))
          + '" x2="' + n1(sx(hits[i + 1][0])) + '" y2="' + n1(sz(hits[i + 1][1]))
          + '" stroke="' + COLI.roof + '" stroke-width="1.1" stroke-linecap="round"/>';
    });

    /* floors */
    H.SLAB.forEach(function (s) {
      var hits = intCross(s[4], null, cy);
      var i;
      for (i = 0; i + 1 < hits.length; i += 2)
        sec += '<rect x="' + n1(sx(hits[i][0])) + '" y="' + n1(sz(s[0]))
          + '" width="' + n1((hits[i + 1][0] - hits[i][0]) * k) + '" height="' + n1(Math.max(0.35, s[1] * k))
          + '" fill="' + COLI.floor + '"/>';
    });

    /* walls that the cut passes through, drawn cut: base to top, t wide */
    var cutWalls = [];
    H.WALL.forEach(function (w, i) {
      var q = intWallQuad(w);
      if (!q) return;
      var hits = intCross(q, null, cy);
      if (hits.length < 2) return;
      var x0 = hits[0][0], x1 = hits[hits.length - 1][0];
      cutWalls.push(i);
      sec += '<rect x="' + n1(sx(x0)) + '" y="' + n1(sz(w[6])) + '" width="' + n1(Math.max(0.5, (x1 - x0) * k))
        + '" height="' + n1(Math.max(0.5, (w[6] - w[5]) * k)) + '" fill="' + (w[8] ? INK : '#8d8471') + '"/>';
    });

    /* an opening in a cut wall is a hole in it, so it is painted back out */
    H.OPEN.forEach(function (o) {
      if (o[6] < 0 || cutWalls.indexOf(o[6]) < 0) return;
      var w = H.WALL[o[6]], q = intWallQuad(w), hits = intCross(q, null, cy);
      if (hits.length < 2) return;
      var x0 = hits[0][0], x1 = hits[hits.length - 1][0];
      sec += '<rect x="' + n1(sx(x0)) + '" y="' + n1(sz(o[5] + o[4])) + '" width="' + n1(Math.max(0.5, (x1 - x0) * k))
        + '" height="' + n1(Math.max(0.5, o[4] * k)) + '" fill="' + PAPER + '"/>'
        + '<line x1="' + n1(sx(x0)) + '" y1="' + n1(sz(o[5] + o[4])) + '" x2="' + n1(sx(x1)) + '" y2="' + n1(sz(o[5] + o[4]))
        + '" stroke="' + MUT + '" stroke-width="0.3"/>';
    });

    /* the levels worth naming, as a line each with its RL */
    [['FFL', FFL], ['FCL', H.STOREY.reduce(function (m, s) { return s[0] === 'FCL' ? s[1] : m; }, 614.165)]]
      .forEach(function (L) {
        sec += '<line x1="0" y1="' + n1(sz(L[1])) + '" x2="' + n1(W) + '" y2="' + n1(sz(L[1]))
          + '" stroke="' + RULE + '" stroke-width="0.25" stroke-dasharray="2 2"/>'
          + '<text x="' + n1(W - 1) + '" y="' + n1(sz(L[1]) - 1) + '" text-anchor="end" font-size="3.2" fill="' + MUT + '">'
          + L[0] + ' ' + L[1].toFixed(2) + '</text>';
      });
    sec += '</svg>';

    /* ---- what the section is standing on ---- */
    var gLo = app.RL(X0 + INTPAD, cy), gHi = app.RL(X1 - INTPAD, cy);
    var nCut = cutWalls.length;
    var rows = ''
      + '<tr><td>Cut at</td><td class="ps-num">y ' + cy.toFixed(1) + ' m</td></tr>'
      + '<tr><td>Walls cut</td><td class="ps-num">' + nCut + '</td></tr>'
      + '<tr><td>Finished floor</td><td class="ps-num">' + FFL.toFixed(2) + ' m</td></tr>'
      + '<tr><td>Ground under the cut, reserve end to street end</td><td class="ps-num">'
      + gLo.toFixed(2) + ' to ' + gHi.toFixed(2) + ' m</td></tr>'
      + '<tr class="ps-tot"><td>Floor above ground at the street end</td><td class="ps-num">'
      + Math.round((FFL - gHi) * 1000) + ' mm</td></tr>';

    /* ---- the levels, throughout rather than at the three dimensioned points ---- */

    /* The architect dimensions three levels on the elevations and the sections.
       The model carries a level on every slab, so the question of whether the
       floor levels are right everywhere can be answered rather than assumed. */
    var polyArea = function (p) {
      var a = 0, i, j;
      for (i = 0, j = p.length - 1; i < p.length; j = i++) a += p[j][0] * p[i][1] - p[i][0] * p[j][1];
      return Math.abs(a) / 2;
    };
    var byLevel = {};
    H.SLAB.forEach(function (s) {
      var k = s[0].toFixed(3);
      if (!byLevel[k]) byLevel[k] = {a: 0, n: 0, names: {}};
      byLevel[k].a += polyArea(s[4]); byLevel[k].n++;
      byLevel[k].names[s[3].replace('Floor:', '').split(':')[0].replace(/ - \d+$/, '')] = 1;
    });
    var DIM = {'611.650': 'FFL, dimensioned 611.65', '611.652': 'FFL, dimensioned 611.65',
               '611.070': 'sunken lounge, dimensioned 611.07', '611.072': 'sunken lounge, dimensioned 611.07'};
    var lvlRows = Object.keys(byLevel).sort().map(function (k) {
      var v = byLevel[k], off = Math.round((parseFloat(k) - FFL) * 1000);
      return '<tr><td>' + k + '</td><td class="ps-num">' + (off === 0 ? '0' : (off > 0 ? '+' : '') + off)
        + '</td><td class="ps-num">' + v.a.toFixed(1) + '</td><td>'
        + esc(DIM[k] || Object.keys(v.names).join(', ')) + '</td></tr>';
    }).join('');

    /* ---- the sunken lounge ---- */
    var SUNK = H.STOREY.reduce(function (m, s) { return s[0] === 'SUNKEN LOUNGE' ? s[1] : m; }, 611.07);
    var sunkSlabs = H.SLAB.filter(function (s) { return Math.abs(s[0] - SUNK) < 0.01; });
    var sunkTxt = '';
    if (sunkSlabs.length) {
      var sb = bbox([].concat.apply([], sunkSlabs.map(function (s) { return s[4]; })));
      var sMid = [(sb[0] + sb[2]) / 2, (sb[1] + sb[3]) / 2];
      var sGround = app.RL(sMid[0], sMid[1]);
      sunkTxt = '<h3 class="ps-h3">The sunken lounge</h3><ul class="ps-fine">'
        + '<li>It is at ' + SUNK.toFixed(2) + ', ' + Math.round((FFL - SUNK) * 1000)
        + ' mm below the rest of the floor. That matches the architect\u2019s dimension.</li>'
        + '<li>It sits at x ' + sb[0].toFixed(1) + ' to ' + sb[2].toFixed(1) + ', y ' + sb[1].toFixed(1)
        + ' to ' + sb[3].toFixed(1) + ', in the east wing, over ' + polyArea(sunkSlabs[0][4]).toFixed(1) + ' m\u00b2 of slab.</li>'
        + '<li>The surveyed ground under it is ' + sGround.toFixed(2) + '. The floor sits '
        + Math.abs(Math.round((SUNK - sGround) * 1000)) + ' mm ' + (SUNK > sGround ? 'above' : 'below') + ' it.</li>'
        + '</ul>';
    }

    /* ---- what is under the house, and what can come off it ---- */

    /* The app has been treating the house as six rectangles, which is 284.4 m²
       of ground. The model's own footprint is smaller, and the difference is
       ground that can be stripped and regraded after all. */
    var STRIP = 0.1;                    /* the topsoil strip this assumes, in metres */
    var rings = H.OUTLINE;
    var inHouse = function (x, y) {
      var c = false, r, i, j, p;
      for (r = 0; r < rings.length; r++) {
        p = rings[r];
        for (i = 0, j = p.length - 1; i < p.length; j = i++)
          if ((p[i][1] > y) !== (p[j][1] > y) &&
              x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
      }
      return c;
    };
    var CG = 0.25, cut = 0, fill = 0, nIn = 0, xg, yg;
    for (xg = B[0]; xg <= B[2]; xg += CG) for (yg = B[1]; yg <= B[3]; yg += CG) {
      if (!inHouse(xg, yg)) continue;
      nIn++;
      var d = app.RL(xg, yg) - FFL;
      if (d > 0) cut += d * CG * CG; else fill -= d * CG * CG;
    }
    var boxArea = 0;
    H.BOXH.forEach(function (b) { boxArea += (b[3] - b[1]) * (b[4] - b[2]); });
    var freed = boxArea - H.FOOTPRINT;

    var qtyRows = ''
      + '<tr><td>Ground actually under the house</td><td class="ps-num">' + H.FOOTPRINT.toFixed(1) + ' m²</td></tr>'
      + '<tr><td>What the six boxes were claiming</td><td class="ps-num">' + boxArea.toFixed(1) + ' m²</td></tr>'
      + '<tr><td>Ground the boxes were holding that is open</td><td class="ps-num">' + freed.toFixed(1) + ' m²</td></tr>'
      + '<tr><td>Cut to bring the ground under the house down to floor</td><td class="ps-num">' + cut.toFixed(1) + ' m³</td></tr>'
      + '<tr><td>Ground below floor level, spanned rather than filled</td><td class="ps-num">' + fill.toFixed(1) + ' m³</td></tr>'
      + '<tr><td>Of that, under the new build</td><td class="ps-num">' + H.FOOTPRINT_NEW.toFixed(1) + ' m²</td></tr>'
      + '<tr class="ps-tot"><td>Topsoil off the new build at ' + Math.round(STRIP * 1000) + ' mm</td><td class="ps-num">'
      + (H.FOOTPRINT_NEW * STRIP).toFixed(1) + ' m³</td></tr>';

    return '<div class="ps-screen">'
      + '<div class="ps-screen-plan">' + plan + '</div>'
      + '<div class="ps-btnrow">'
      + '<button data-int-cut="-0.5" class="ps-print-btn">Move the cut back</button>'
      + '<button data-int-cut="0.5" class="ps-print-btn">Move the cut forward</button>'
      + '</div>'
      + '<div class="ps-screen-plan">' + sec + '</div>'
      + '<table class="ps-tbl"><tbody>' + rows + '</tbody></table>'
      + '<ul class="ps-fine">'
      + '<li>The plan and the section share one scale. A wall in the section sits under the wall it cuts.</li>'
      + '<li>Walls in ink are external. The model flags all 67 as external, so the floor decides it instead.</li>'
      + '<li>Roof lines are the heights the model carries. The ' + H.ROOF.length + ' roofs set the ridges and eaves the sun map uses.</li>'
      + '<li>The ground is the surveyor\u2019s surface, dashed where the design finishes it.</li>'
      + '<li>From ' + esc(H.SRC) + ', placed by tools/house-extract.js.</li>'
      + '</ul>'
      + '<h3 class="ps-h3">Every level the model carries</h3>'
      + '<table class="ps-tbl"><thead><tr><th>RL</th><th class="ps-num">Off FFL mm</th>'
      + '<th class="ps-num">Area m\u00b2</th><th>What is on it</th></tr></thead><tbody>' + lvlRows + '</tbody></table>'
      + '<ul class="ps-fine">'
      + '<li>The architect dimensions three levels. The model carries one on every slab. They agree.</li>'
      + '<li>Two levels are new to the app. The garage floor is 611.535, 115 mm below the house. The apron is 611.575.</li>'
      + '<li>The app held one finished floor for the whole building.</li>'
      + '<li>Areas sum every slab at a level. A finish laid over an underlay counts twice.</li>'
      + '</ul>'
      + sunkTxt
      + '<h3 class="ps-h3">What is under the house</h3>'
      + '<table class="ps-tbl"><tbody>' + qtyRows + '</tbody></table>'
      + '<ul class="ps-fine">'
      + '<li>The footprint is traced on a 50 mm grid: every wall, and every floor slab under a roof. That leaves out the driveway apron and the brick paving.</li>'
      + '<li>Cut and fill are sampled on a 250 mm grid against the surveyed surface. They cover the footprint only. The block figure is on the Works page.</li>'
      + '<li>The house stands above the ground almost everywhere. The second line is the void a floor spans, not fill to import.</li>'
      + '<li>Topsoil comes off the new build at the ' + Math.round(STRIP * 1000) + ' mm the borehole logs record for the silty sand. The six boxes made that 55 m\u00b2 and 5.5 m\u00b3.</li>'
      + '<li>Stripping the whole footprint would give ' + (H.FOOTPRINT * STRIP).toFixed(1) + ' m\u00b3. The existing house is not coming up.</li>'
      + '</ul>'

      + '</div>';
  }

  return {open: open, close: close, build: build, bloomChart: bloomChart, earthView: earthView, levelsView: levelsView, waterView: waterView, isoView: isoView, gridView: gridView, interiorView: interiorView};
})();
