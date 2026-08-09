/* Hand-drawn lines & boxes (rough.js).
   Scans the page for elements and replaces their straight borders / rules with
   an inked stroke: a rough.js path, an SVG opacity gradient so the ink fades
   unevenly, and the #inkbreak filter so the edge breaks up.

   Targets:
     .mg-sheet, .mg-notecard, .mg-sketch-box  -> hand-drawn box frame
     .h-px                            -> hand-drawn horizontal rule

   Redraws on load, when fonts finish, and on resize.
   Tune the look with CONFIG below. */
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';

  const CONFIG = {
    box:  { roughness: 0.6, bowing: 0.4, strokeWidth: 0.9 },
    line: { roughness: 0.5, bowing: 0.5, strokeWidth: 0.9 },
    baseAlpha: 0.55,   // centre of the opacity drift along a stroke
    driftLo: 0.75,     // opacity can dip to baseAlpha * driftLo ...
    driftHi: 1.25,     // ... and rise to baseAlpha * driftHi
    alphaMin: 0.2,
    alphaMax: 0.72,
  };

  const seed = (i) => Math.floor(((i + 1) * 2654435761) % 100000);

  function overlay(w, h) {
    const s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('width', w);
    s.setAttribute('height', h);
    s.setAttribute('data-rough', '');
    s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:1';
    return s;
  }
  function host(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  }

  // Read the ink-line colour token off an element (falls back to near-black).
  function inkColor(el) {
    const v = getComputedStyle(el).getPropertyValue('--mg-ink-line-rgb').trim();
    return 'rgb(' + (v || '28 26 23') + ')';
  }

  // A gradient of the ink colour whose OPACITY wanders along the stroke.
  let gid = 0;
  function inkGradient(svg, diagonal, color) {
    const id = 'ink-grad-' + (gid++);
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(SVGNS, 'defs'); svg.appendChild(defs); }
    const g = document.createElementNS(SVGNS, 'linearGradient');
    g.setAttribute('id', id);
    g.setAttribute('x1', '0'); g.setAttribute('y1', '0');
    g.setAttribute('x2', '1'); g.setAttribute('y2', diagonal ? '1' : '0');
    const stops = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < stops; i++) {
      const s = document.createElementNS(SVGNS, 'stop');
      s.setAttribute('offset', ((i / (stops - 1)) * 100).toFixed(1) + '%');
      s.setAttribute('stop-color', color);
      const a = CONFIG.baseAlpha * (CONFIG.driftLo + Math.random() * (CONFIG.driftHi - CONFIG.driftLo));
      s.setAttribute('stop-opacity', Math.max(CONFIG.alphaMin, Math.min(CONFIG.alphaMax, a)).toFixed(3));
      g.appendChild(s);
    }
    defs.appendChild(g);
    return id;
  }
  function paint(node, id) {
    node.querySelectorAll('path').forEach((p) => p.setAttribute('stroke', 'url(#' + id + ')'));
  }

  function draw() {
    if (!window.rough) return;
    document.querySelectorAll('[data-rough]').forEach((s) => s.remove());

    // boxes
    document.querySelectorAll('.mg-sheet, .mg-notecard, .mg-sketch-box').forEach((el, i) => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      host(el);
      const svg = overlay(w, h);
      const rc = rough.svg(svg);
      const id = inkGradient(svg, true, inkColor(el));
      const node = rc.rectangle(2, 2, w - 4, h - 4, { ...CONFIG.box, seed: seed(i) });
      node.setAttribute('filter', 'url(#inkbreak)');
      paint(node, id);
      svg.appendChild(node);
      el.appendChild(svg);
      el.style.borderColor = 'transparent';
    });

    // horizontal rules
    document.querySelectorAll('.h-px').forEach((el, i) => {
      const w = el.clientWidth;
      if (!w) return;
      host(el);
      const H = 12, y = H / 2;
      const svg = overlay(w, H);
      svg.style.top = -(H / 2) + 'px';
      const rc = rough.svg(svg);
      const id = inkGradient(svg, false, inkColor(el));
      const node = rc.line(1, y, w - 1, y, { ...CONFIG.line, seed: seed(i + 900) });
      node.setAttribute('filter', 'url(#inkbreak)');
      paint(node, id);
      svg.appendChild(node);
      el.appendChild(svg);
      el.style.background = 'transparent';
    });
  }

  let t;
  const schedule = () => { clearTimeout(t); t = setTimeout(draw, 120); };
  window.addEventListener('load', () => setTimeout(draw, 60));
  window.addEventListener('resize', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(draw, 60));
})();
