# AGENTS.md — applying the Marginalia style

Instructions for an AI coding agent asked to add the Paper Club style to a
repo. Read `USAGE.md` for the full token and component reference. This file is
the setup contract and the per-stack recipes.

Assume the target repo uses **Tailwind CSS**.

---

## What "using the style" means

1. The design decisions live in this repo. Do not reinvent colours, fonts, or
   effects. Pull them in.
2. Copy four asset files into the target repo (keep the paths similar):
   `css/tokens.css`, `css/primitives.css`, `css/components.css`, and the four
   scripts in `js/` (`filters.js`, `ink-lines.js`, `interactions.js`, and load
   `rough.js` from a CDN or npm).
3. Wire Tailwind to the tokens with the preset below.
4. Build UI by copying the markup patterns from `components.html` and using the
   token-backed utilities (`bg-rust`, `text-ink`) and `mg-*` classes.

---

## Setup (once per repo)

### 1. Tailwind preset

The file `js/tailwind.config.js` in this repo is the **Play CDN** form
(`tailwind.config = {…}`). For a real Tailwind build, convert it to a preset:

```js
// marginalia.preset.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        serif:   ['var(--font-serif)'],
        mono:    ['var(--font-mono)'],
      },
      colors: {
        paper:  'rgb(var(--rgb-paper) / <alpha-value>)',
        paper2: 'rgb(var(--rgb-paper2) / <alpha-value>)',
        ink:    'rgb(var(--rgb-ink) / <alpha-value>)',
        faded:  'rgb(var(--rgb-faded) / <alpha-value>)',
        rust:   'rgb(var(--rgb-rust) / <alpha-value>)',
        ember:  'rgb(var(--rgb-ember) / <alpha-value>)',
        coral:  'rgb(var(--rgb-coral) / <alpha-value>)',
        slate:  'rgb(var(--rgb-slate) / <alpha-value>)',
        grid:   'rgb(var(--rgb-grid) / <alpha-value>)',
        regmark:'rgb(var(--rgb-regmark) / <alpha-value>)',
      },
    },
  },
};
```

Then in the target's Tailwind config:

```js
module.exports = { presets: [require('./marginalia.preset.js')], /* … */ };
```

The `<alpha-value>` placeholder makes opacity utilities (`bg-rust/70`) resolve
from the CSS variables. So `tokens.css` must be loaded on the page too.

### 2. Load the CSS, in order

```
tokens.css  →  primitives.css  →  components.css  →  themes.css
```

For dark/light support, also load `themes.css` and `js/theme.js` (in `<head>`,
so the theme applies before first paint). Add a switch with buttons carrying
`data-theme-set="light|darkroom|blueprint"`. Themes are pure token overrides;
do not hardcode per-theme colours in components.

Load `tokens.css` before Tailwind's output is not required, but it must be
present at runtime for the colour variables to resolve.

### 3. Load the fonts (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 4. Load the scripts, before `</body>`

```html
<script src="https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js"></script>
<script src="/marginalia/js/filters.js"></script>
<script src="/marginalia/js/interactions.js"></script>
<script src="/marginalia/js/ink-lines.js"></script>
```

### 5. Page skeleton

```html
<body class="mg-paper-grain font-serif text-ink">
  <div class="mg-drafting-grid fixed inset-0 z-0 pointer-events-none opacity-50"></div>
  <div class="mg-reg-guides   fixed inset-0 z-0 pointer-events-none"></div>
  <!-- your content, in a wrapper with position relative + z-10 -->
</body>
```

---

## Per-stack recipes

### Rails (server-rendered ERB, no React)

- Put the CSS/JS under `app/assets/` (or `vendor/`), or `public/marginalia/`.
- Add the preset to `tailwind.config.js` if using `tailwindcss-rails`.
- Include the CSS and fonts in the layout `<head>`; include the scripts before
  `</body>` in `app/views/layouts/application.html.erb`.
- Build views with the markup patterns from `components.html`. Example:

```erb
<article class="mg-sheet p-7">
  <h2 class="font-display text-2xl mg-printed"><%= @note.title %></h2>
  <p class="font-serif text-[17px] leading-[1.8]"><%= @note.body %></p>
</article>
```

### Rails + React (or any React app)

- Install rough.js from npm: `npm i roughjs`. Import once at app entry, or keep
  the CDN tag.
- Import the three CSS files once at the app root.
- `filters.js` and `ink-lines.js` run against the DOM. In React, call the
  ink-lines redraw after render. Simplest: keep the scripts, and trigger a
  redraw with `window.dispatchEvent(new Event('resize'))` after mounting lists
  that add new `.mg-sheet`/`.mg-notecard` elements.
- Component example:

```jsx
function NoteCard({ title, body }) {
  return (
    <article className="mg-sheet p-7">
      <h2 className="font-display text-2xl mg-printed">{title}</h2>
      <p className="font-serif text-[17px] leading-[1.8]">{body}</p>
    </article>
  );
}
```

### Python (Flask / Django / Jinja templates)

- Serve the CSS/JS from `static/marginalia/`.
- Put the CSS + fonts in the base template `<head>`, scripts before `</body>`.
- Use the same markup patterns inside Jinja blocks.

### A blog (static site / Markdown)

- If the theme supports Tailwind, add the preset and CSS as above.
- Markdown content will not carry classes. Wrap the rendered article in a
  `.mg-sheet` (or style the prose container) and set body text in `font-serif`.
- The masthead, dividers, and pull-quotes are HTML snippets from
  `components.html`, pasted into the template around the Markdown.

---

## Charts & diagrams

Do NOT hand-place SVG points. Use the libraries with the locked presets, so new
visuals get the house style and correct scales from data. `charts.html` is the
canonical reference — copy a figure from it and change the data.

### Charts — Vega-Lite

Load `vega`, `vega-lite`, `vega-embed`, and `js/mg-vega-theme.js`. Write a spec,
merge the house config, render as SVG:

```js
vegaEmbed('#el', {
  mark: 'line',
  data: { values: rows },
  encoding: {
    x: { field: 'date',  type: 'temporal' },
    y: { field: 'price', type: 'quantitative' },
  },
  config: mgVegaConfig(),          // house style from tokens
}, { renderer: 'svg' });           // SVG so ink/fonts/tooltips apply
```

**The preset (`mgVegaConfig()`) already themes** the background (transparent),
fonts (mono labels, serif titles), faint horizontal gridlines, 12px axis
labels, legend colours, and the single-accent mark colours — all from tokens.
Do not restate these per spec.

**Layout conventions (match the figures in `charts.html`):**
- **Header lives in HTML, not the chart.** Put a title/subtitle (or a metric
  header: label + big number left, delta + note right) in the plate above the
  `<div>`, using `font-display` + `mg-mono-label`. Do not set a Vega `title`.
- **Few, clean ticks.** Set `axis.values` (e.g. `[60,90,120,150]`) instead of
  letting Vega pick many. Turn off the x grid (`axis:{grid:false}`).
- **Gaps.** Give the x scale `padding: 16` so the marks clear the axes.
- **Line ≠ area-to-zero.** For a line/area that shouldn't start at zero, set
  `y.scale:{ domain:[lo,hi], zero:false }`.

**Colour — the palette is single-accent:**
- **One series → rust**, no legend. Best case (see Figure A/B).
- **Many series on one chart → the validated categorical tokens**
  `--cat-1..4` (orange / steel / sage / plum; dark-theme variants exist). Set
  `color.scale.range` to `[rgb('--cat-1'), …]`. Never invent hues, never rely on
  colour alone for >4 — fold extras into "Other" or small multiples.
- Do not use `strokeDash` for identity when colour already distinguishes series.

**Hover (add it to every chart):** use a **single** nearest-point selection —
two `nearest` selections fight over the pointer. It drives the crosshair, the
dot, the tooltip, and the line emphasis together:

```js
params: [{ name:'pick', select:{ type:'point', fields:['series','x'], nearest:true,
                                  on:'pointerover', clear:'pointerout' } }],
```
- Crosshair: a `rule` layer filtered by `{param:'pick'}`.
- Dot + tooltip: an invisible `point` capture layer; `opacity` shows the dot on
  hover; `tooltip:[…]` is the popup.
- Emphasis: on the line layer, dim non-hovered lines with a `test` on the
  selection store (`pluck(data('pick_store'),'values')[0][0] === datum.series`);
  add a legend-bound `point` param for legend-hover too.
- The tooltip is styled once via `#vg-tooltip-element.vg-tooltip` CSS and
  re-themes with tokens.

**Re-embed on a theme switch** so `mgVegaConfig()` and the spec colours re-read
the tokens (listen on the `data-theme-set` buttons; see `charts.html`).

### Diagrams — Mermaid

Load `mermaid` and `js/mermaid-init.js`:

```js
mermaid.initialize(mgMermaidTheme());   // classic look, themed from tokens
const { svg } = await mermaid.render('id', 'flowchart LR\n A --> B --> C');
el.innerHTML = svg;
```

- `mgMermaidTheme()` themes nodes/edges/text from tokens.
- Apply `filter: url(#inkfaint)` to the diagram's `svg` in CSS for the subtle
  hand-inked wobble (requires `js/filters.js`).
- Re-initialise and re-render on a theme switch.

## Tests

`tests/` holds Playwright system tests. Run `cd tests && npm install &&
npm run setup && npm test`. They assert each page loads without JS errors and
that charts/diagrams render as SVG in light and dark. Add a case when you add a
page or a visual.

## Rules the agent must follow

- **Never hardcode a hex colour.** Use a token utility (`bg-rust`) or
  `rgb(var(--rgb-…) / a)`. If a needed colour is missing, add a token.
- **Keep the `mg-` prefix.** It stops clashes with the host repo's CSS.
- **Put reading text on a panel** (`mg-sheet`, `mg-notecard`, …) so the paper
  dots do not hurt legibility.
- **Every `mg-letterpress` needs `data-text`** equal to its visible text.
- **Ink lines are decorative and JavaScript-driven.** They attach to
  `.mg-sheet`, `.mg-notecard`, `.mg-sketch-box`, and `.h-px`. Do not depend on
  them for meaning; make sure `filters.js` and `ink-lines.js` load.
- **Prefer patterns over new CSS.** Copy from `components.html`. Add CSS only
  when Tailwind utilities cannot express it, and put it in `components.css`.

## Gotchas

- The Play CDN (`cdn.tailwindcss.com`) is for prototypes only. Production repos
  must use a real Tailwind build with the preset.
- The kit needs internet for three CDNs: Tailwind (dev), rough.js, Google
  Fonts. Self-host these for offline or locked-down repos.
- `ink-lines.js` targets `.h-px` for rules. In a large app this could catch an
  unintended 1px element; if so, switch its rule selector to an explicit class.
