# Marginalia — Paper Club design system

A print-inspired UI kit for an academic note-taking app: off-white stippled
paper, technical-drawing grids, halftone blocks, and hand-drawn ink lines.

## Pages & docs

- **`index.html`** — the demo page. A full example layout using the system.
- **`components.html`** — the gallery. Every token, primitive, and component
  with a live example and copy-paste markup. Start here.
- **`USAGE.md`** — the vocabulary and rules (tokens, classes, do/don't).
- **`AGENTS.md`** — how to apply the style in another repo (Rails, React,
  Python, a blog), written for an AI coding agent. Read this to reuse the kit.

All classes are namespaced with `mg-` so they never clash with a host repo.

## The three layers

The system is organised bottom-up. Each layer only depends on the one below it.

| Layer | File | What it holds |
|-------|------|---------------|
| **Tokens** | `css/tokens.css` | Named values: colour, type, texture, grid. The single source of truth. |
| **Primitives** | `css/primitives.css` | The material: paper texture, drafting grid, halftone, letterpress, animations. |
| **Components** | `css/components.css` | Assembled parts that need custom CSS: the panel treatments (`.mg-sheet`, `.mg-notecard`, …). |

Components that are just Tailwind class combinations (nav, tags, table, meter)
are documented as markup patterns in the gallery, not as CSS classes.

## Scripts

| File | Role |
|------|------|
| `js/tailwind.config.js` | Maps Tailwind colour/font utilities to the tokens. Load **after** the Tailwind CDN. |
| `js/filters.js` | Injects the shared SVG filters (`#inkrough`, `#inkroughsoft`, `#inkbreak`). |
| `js/ink-lines.js` | Redraws borders and rules as hand-drawn ink (rough.js). Tunables in its `CONFIG`. |
| `js/interactions.js` | Scroll reveal, parallax on floating shapes, letterpress reseed. |

## How to change things

- **A colour, font, or the texture** → edit `css/tokens.css`. Everything follows.
- **The hand-drawn line look** (roughness, ink darkness) → the `CONFIG` at the
  top of `js/ink-lines.js`.
- **A new component** → add it to `components.html` so it is documented, and
  only add CSS to `css/components.css` if Tailwind utilities are not enough.

## Dependencies (CDN, need internet)

- Tailwind CSS (Play CDN)
- rough.js
- Google Fonts: Old Standard TT, Spectral, IBM Plex Mono

## Ink-line targets

`js/ink-lines.js` decorates these automatically:

- `.mg-sheet`, `.mg-notecard`, `.mg-sketch-box` → hand-drawn box frame
- `.h-px` → hand-drawn horizontal rule
