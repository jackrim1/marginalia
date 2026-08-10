/* Marginalia Vega-Lite house theme.
   Exposes window.mgVegaConfig(): a Vega-Lite `config` object built from the
   current theme tokens. Merge it into any spec:

     vegaEmbed('#el', { ...spec, config: mgVegaConfig() }, { renderer: 'svg' });

   Rebuild and re-embed on a theme change so colours follow. The palette is
   single-accent (rust); for >1 series use strokeDash + direct labels, not
   colour alone. */
(function () {
  const root = document.documentElement;
  const tok  = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const rgb  = (n) => `rgb(${tok(n).replace(/\s+/g, ',')})`;
  const rgba = (n, a) => `rgba(${tok(n).replace(/\s+/g, ',')},${a})`;

  const MONO = "'IBM Plex Mono', monospace";
  const DISPLAY = "'Old Standard TT', Georgia, serif";

  window.mgVegaConfig = function () {
    return {
      background: null,
      font: MONO,
      view: { stroke: null },
      axisY: { grid: true, gridColor: rgb('--rgb-ink'), gridOpacity: 0.12, gridWidth: 1 },
      axisX: { grid: false },
      axis: {
        domainColor: rgba('--rgb-ink', 0.35),
        tickColor: rgba('--rgb-ink', 0.35),
        labelColor: rgb('--rgb-faded'), labelFont: MONO, labelFontSize: 12,
        titleColor: rgb('--rgb-faded'), titleFont: MONO, titleFontSize: 11, titleFontWeight: 400,
      },
      range: { category: [rgb('--rgb-rust'), rgb('--rgb-ink')] },
      line: { strokeWidth: 1.8, stroke: rgb('--rgb-rust') },
      area: { fill: rgb('--rgb-rust'), fillOpacity: 0.22, line: { color: rgb('--rgb-rust'), strokeWidth: 1.8 } },
      point: { filled: true, size: 24, fill: rgb('--rgb-rust') },
      bar: { fill: rgb('--rgb-rust'), cornerRadiusEnd: 3 },
      text: { color: rgb('--rgb-faded'), font: MONO, fontSize: 10 },
      title: {
        color: rgb('--rgb-ink'), font: DISPLAY, fontSize: 16, fontWeight: 400, anchor: 'start',
        subtitleColor: rgb('--rgb-faded'), subtitleFont: MONO, subtitleFontSize: 10,
      },
      legend: {
        labelColor: rgb('--rgb-ink'), labelFont: MONO, labelFontSize: 11,
        titleColor: rgb('--rgb-faded'), titleFont: MONO, titleFontSize: 10, titleFontWeight: 400,
        symbolStrokeWidth: 2,
      },
    };
  };
})();
