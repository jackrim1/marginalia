# Tests — Playwright system tests

Browser smoke tests (the JS-world equivalent of Rails system tests). They load
each page in headless Chromium and assert it works: no JS errors, charts and the
diagram render as SVG, and the demo figures reveal.

## Run

```bash
cd tests
npm install
npm run setup   # one-time: download headless Chromium
npm test
```

## What it checks

- `index.html`, `components.html`, `charts.html` load with no JS/console errors
  (external image/video failures and the Tailwind-CDN dev notice are ignored).
- `charts.html` renders an `<svg>` in each chart container and the diagram, in
  both light and dark themes.
- The demo figures get their `shown` class (guards against the `opacity:0`
  reveal bug where a page forgets to load `interactions.js`).
