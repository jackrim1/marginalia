/* Shared Tailwind (Play CDN) config.
   Load AFTER the Tailwind CDN script. Colours point at the CSS variables in
   tokens.css using the <alpha-value> placeholder, so utilities like bg-rust,
   text-ink, and border-ink/25 all resolve from the single token source. */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        serif:   ['var(--font-serif)'],
        mono:    ['var(--font-mono)'],
      },
      colors: {
        paper:   'rgb(var(--rgb-paper) / <alpha-value>)',
        paper2:  'rgb(var(--rgb-paper2) / <alpha-value>)',
        ink:     'rgb(var(--rgb-ink) / <alpha-value>)',
        faded:   'rgb(var(--rgb-faded) / <alpha-value>)',
        rust:    'rgb(var(--rgb-rust) / <alpha-value>)',
        ember:   'rgb(var(--rgb-ember) / <alpha-value>)',
        coral:   'rgb(var(--rgb-coral) / <alpha-value>)',
        slate:   'rgb(var(--rgb-slate) / <alpha-value>)',
        grid:    'rgb(var(--rgb-grid) / <alpha-value>)',
        regmark: 'rgb(var(--rgb-regmark) / <alpha-value>)',
      },
    },
  },
};
