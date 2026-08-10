/* Marginalia Mermaid house theme.
   Exposes window.mgMermaidTheme(): the mermaid.initialize() config built from
   the current theme tokens, with the hand-drawn look. Usage:

     mermaid.initialize(mgMermaidTheme());
     const { svg } = await mermaid.render('id', source);
     el.innerHTML = svg;

   Re-initialise and re-render on a theme change so colours follow. */
(function () {
  const root = document.documentElement;
  const tok  = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const rgb  = (n) => `rgb(${tok(n).replace(/\s+/g, ',')})`;
  const rgba = (n, a) => `rgba(${tok(n).replace(/\s+/g, ',')},${a})`;

  const DISPLAY = "'Old Standard TT', Georgia, serif";

  window.mgMermaidTheme = function () {
    return {
      startOnLoad: false,
      securityLevel: 'loose',
      look: 'classic',        // clean shapes; a faint ink filter (CSS) adds the hand-inked feel
      theme: 'base',
      fontFamily: DISPLAY,
      themeVariables: {
        background: 'transparent',
        primaryColor: rgba('--rgb-panel', 0.6),
        primaryTextColor: rgb('--rgb-ink'),
        primaryBorderColor: rgb('--rgb-ink'),
        lineColor: rgba('--rgb-ink', 0.7),
        secondaryColor: rgba('--rgb-paper2', 0.6),
        tertiaryColor: rgba('--rgb-paper', 0.6),
        fontSize: '15px',
      },
    };
  };
})();
