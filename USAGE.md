# Marginalia — usage reference

The vocabulary and rules of the Paper Club style. Read this before using the
kit. For a live view of every part, open `components.html`. For step-by-step
setup in a specific stack, read `AGENTS.md`.

All consuming repos use **Tailwind CSS**. Colours and fonts come through a
Tailwind preset that points at the tokens; textures and effects come through
the `mg-*` CSS classes.

---

## The three layers

1. **Tokens** (`css/tokens.css`) — named values. The single source of truth.
2. **Primitives** (`css/primitives.css`) — paper, ink, and print effects, as
   `mg-*` classes.
3. **Components** (`css/components.css` + patterns in `components.html`) — the
   assembled parts.

Rule of dependence: a layer may use the layer below it, never the one above.

---

## Tokens

### Colour (CSS variables, stored as `r g b` triplets)

| Token (var)      | Tailwind name | Use |
|------------------|---------------|-----|
| `--rgb-paper`    | `paper`       | page background |
| `--rgb-paper2`   | `paper2`      | warmer panel background |
| `--rgb-panel`    | (n/a)         | tint behind text panels |
| `--rgb-ink`      | `ink`         | body text, borders |
| `--rgb-faded`    | `faded`       | muted text, captions, labels |
| `--rgb-rust`     | `rust`        | primary accent (deep orange) |
| `--rgb-ember`    | `ember`       | bright accent, dots, highlights |
| `--rgb-coral`    | `coral`       | pale salmon block |
| `--rgb-slate`    | `slate`       | grey-blue block |
| `--rgb-grid`     | `grid`        | drafting grid lines |
| `--rgb-regmark`  | `regmark`     | faint red registration guides |

Because colours are `r g b` triplets, any opacity works: `bg-rust`,
`bg-rust/70`, `border-ink/25`, or in CSS `rgb(var(--rgb-ink) / .16)`.

### Type

| Token | Tailwind name | Role |
|-------|---------------|------|
| `--font-display` (Old Standard TT) | `font-display` | headings, masthead |
| `--font-serif` (Spectral)          | `font-serif`   | reading text |
| `--font-mono` (IBM Plex Mono)      | `font-mono`    | labels, meta rows |

Tracking tokens: `--tracking-body`, `--tracking-display`, `--tracking-serif`.

### Texture & grid

`--dot-size` (9px), `--dot-alpha`, `--dot-layer-opacity`, `--grid-step` (96px),
`--grid-substep` (24px), `--panel-alpha`, `--halo-alpha`.

---

## Primitives (`mg-*`)

| Class | What it does |
|-------|--------------|
| `mg-paper-grain` | stippled paper texture. Put on `<body>`. |
| `mg-drafting-grid` | technical grid. Put on a fixed full-screen div. |
| `mg-reg-guides` | faint red registration lines. Fixed full-screen div. |
| `mg-halftone`, `mg-halftone-fine`, `mg-halftone-light` | dot fill for a coloured block. |
| `mg-letterpress` | distressed ink heading. Needs `data-text="…"` equal to its text. |
| `mg-printed` | subtle ink wobble on smaller headings. |
| `mg-crop` | corner crop mark. Position with inline `top/left/right/bottom`. |
| `mg-rule-double` | thin double rule (old-paper table header). |
| `mg-anim-drawX/drawY/rise/ink`, `mg-floaty` | entrance / float animations. |

Two effects are added by JavaScript, not CSS:

- **Hand-drawn borders** — `js/ink-lines.js` finds `.mg-sheet`, `.mg-notecard`,
  `.mg-sketch-box` and draws an inked frame; it finds `.h-px` and draws an inked
  rule. It hides the original straight border.
- **SVG ink filters** — `js/filters.js` injects `#inkrough`, `#inkroughsoft`,
  `#inkbreak`, used by the classes above.

---

## Components

Custom-CSS components:

| Class | Component |
|-------|-----------|
| `mg-sheet` | Panel A — clean opaque card |
| `mg-sheet-inset` | Panel B — pressed-in inset plate |
| `mg-sheet-soft` | Panel C — borderless soft halo |
| `mg-notecard` (+ `mg-line` rows) | Panel D — ruled index-card |
| `mg-text-halo` | Panel E — per-line highlighter |
| `mg-mono-label` | small uppercase mono label |

Everything else (navbar, buttons, tags, progress meter, table, pull-quote,
figure, timeline) is a **Tailwind markup pattern**. Copy it from
`components.html` — each example has a copy button.

---

## Rules

**Do**

- Use token-backed utilities: `bg-rust`, `text-ink`, `border-ink/25`.
- Put `mg-paper-grain` on `<body>` and add the grid/guide divs once per page.
- Give every `mg-letterpress` element a `data-text` equal to its visible text.
- Use a panel class (`mg-sheet` …) behind any block of reading text, so the
  dots do not reduce legibility.
- Load the four scripts (see `AGENTS.md`): `filters.js`, `ink-lines.js`,
  `interactions.js`, plus rough.js.

**Don't**

- Do not write raw hex colours. Add or use a token instead.
- Do not rename or drop the `mg-` prefix; it prevents clashes with host CSS.
- Do not put large body text straight on `mg-paper-grain` with no panel.
- Do not rely on the ink lines for meaning; they are decorative and JS-driven.
