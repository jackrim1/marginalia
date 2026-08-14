import { test, expect } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// repo root is the parent of tests/
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = (f) => pathToFileURL(path.join(root, f)).href;

// benign console noise we do not fail on (external assets, dev-CDN notice)
const IGNORE = [
  /Failed to load resource/i,
  /net::ERR/i,
  /favicon/i,
  /cdn\.tailwindcss\.com should not be used/i,
];

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORE.some((r) => r.test(m.text()))) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  return errors;
}

const PAGES = ['index.html', 'components.html', 'charts.html', 'board.html', 'read.html'];

for (const f of PAGES) {
  test(`${f} loads without JS errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(url(f), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

const CHART_IDS = ['chart-price', 'chart-bar', 'chart-loss', 'chart-sector', 'chart-growth', 'diagram'];

test('charts & diagram render SVGs in light and dark', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  for (const id of CHART_IDS) {
    await expect(page.locator(`#${id} svg`), `${id} (light)`).toHaveCount(1);
  }
  await page.click('[data-theme-set="darkroom"]');
  await page.waitForTimeout(2500);
  for (const id of CHART_IDS) {
    await expect(page.locator(`#${id} svg`), `${id} (dark)`).toHaveCount(1);
  }
});

test('price chart time-range buttons re-render and update the header', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const label = page.locator('#px-label');
  await expect(label).toContainText('1-month');
  await page.click('[data-range="MAX"]');
  await page.waitForTimeout(1200);
  await expect(label).toContainText('all-time');
  await expect(page.locator('#chart-price svg')).toHaveCount(1);
  await expect(page.locator('[data-range="MAX"]')).toHaveClass(/is-active/);
});

test('sector chart time-range buttons re-render and relabel', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.click('[data-srange="1Y"]');
  await page.waitForTimeout(1200);
  await expect(page.locator('#sector-label')).toContainText('1-year');
  await expect(page.locator('#chart-sector svg')).toHaveCount(1);
  await expect(page.locator('[data-srange="1Y"]')).toHaveClass(/is-active/);
});

test('watchlist lists all six tickers with real data', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const rows = page.locator('#watchlist > div');
  await expect(rows).toHaveCount(6);
  await expect(page.locator('#watchlist')).toContainText('SpaceX');
  await expect(page.locator('#watchlist')).toContainText('Beta Technologies');
  await expect(page.locator('#watchlist')).toContainText('$');
});

test('portfolio ledger computes TWR/MWR and populates its ledgers', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await expect(page.locator('#pl-net-deposited')).toContainText('$13,000.00');
  await expect(page.locator('#pl-current-value')).toContainText('$16,469.45');
  await expect(page.locator('#pl-twr')).toContainText('+13.1%');
  await expect(page.locator('#pl-mwr')).toContainText('+12.8%');
  await expect(page.locator('#pl-cashflow-body tr')).toHaveCount(10);
  await expect(page.locator('#pl-holdings-body tr')).toHaveCount(6);
  await expect(page.locator('#pl-meters')).toContainText('Time-weighted');
  await expect(page.locator('#pl-meters')).toContainText('Money-weighted');
});

test('growth chart compares the portfolio to the illustrative benchmark', async ({ page }) => {
  await page.goto(url('charts.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await expect(page.locator('#growth-value')).toContainText('$16,469.45');
  await expect(page.locator('#growth-delta')).toContainText('$1,024.71 vs tracker');
  await expect(page.locator('#growth-delta')).toHaveClass(/text-pos/);
  await expect(page.locator('#chart-growth svg')).toHaveCount(1);
});

test('demo page reveals its figures (no stuck opacity:0)', async ({ page }) => {
  await page.goto(url('index.html'), { waitUntil: 'load' });
  // scroll so the reveal observer fires
  for (let y = 0; y <= 4000; y += 500) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  const firstFigure = page.locator('figure[data-reveal]').first();
  await expect(firstFigure).toHaveClass(/shown/);
});

test('board page renders the kanban, checklist, and gantt chart', async ({ page }) => {
  await page.goto(url('board.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await expect(page.locator('[data-column="submitted"] .mg-card')).toHaveCount(2);
  await expect(page.locator('#kanban-total')).toContainText('7 open');
  await expect(page.locator('#checklist .mg-task')).toHaveCount(7);
  await expect(page.locator('#chart-gantt svg')).toHaveCount(1);
});

test('board page kanban card drags between columns and updates counts', async ({ page }) => {
  await page.goto(url('board.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const card = page.locator('[data-column="submitted"] .mg-card').first();
  const target = page.locator('[data-column="accepted"]');
  await card.dragTo(target);
  await expect(page.locator('[data-column="submitted"] .mg-card')).toHaveCount(1);
  await expect(page.locator('[data-column="accepted"] .mg-card')).toHaveCount(3);
});

test('board page checklist checkbox toggles done state and progress count', async ({ page }) => {
  await page.goto(url('board.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await expect(page.locator('#checklist-progress')).toContainText('2 / 7 done');
  const box = page.locator('[data-task="t1"]');
  await box.check();
  await expect(page.locator('#checklist-progress')).toContainText('3 / 7 done');
  await expect(page.locator('[data-task="t1"]').locator('xpath=ancestor::label')).toHaveClass(/is-done/);
});

// selects an exact phrase inside #article-body (must sit in a single text
// node, i.e. not already split by another inline mark) and fires the mouseup
// our annotate-popup listener is bound to, same as a real drag-select would.
async function selectPhrase(page, phrase) {
  const ok = await page.evaluate((needle) => {
    const paras = Array.from(document.querySelectorAll('#article-body p'));
    for (const p of paras) {
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.textContent.indexOf(needle);
        if (idx !== -1) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + needle.length);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return true;
        }
      }
    }
    return false;
  }, phrase);
  if (!ok) throw new Error(`phrase not found in a single text node: "${phrase}"`);
  await page.dispatchEvent('#article-body', 'mouseup');
  await page.waitForTimeout(150);
}

test('read page renders margin notes positioned next to their markers', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await expect(page.locator('.mg-margin-note')).toHaveCount(3);
  await expect(page.locator('.mg-note-marker')).toHaveCount(3);
  const style = await page.locator('.mg-margin-note').first().getAttribute('style');
  expect(style).toMatch(/position:\s*absolute/);
  expect(style).toMatch(/top:\s*-?[\d.]+px/);
});

test('read page: selecting text offers flag/wash/note, and flag marks it', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await expect(page.locator('.mg-mark-flag')).toHaveCount(2);
  await selectPhrase(page, 'a better use of a fixed parameter budget');
  await expect(page.locator('#annot-popup')).not.toHaveClass(/hidden/);
  await page.click('#annot-popup button[data-act="flag"]');
  await expect(page.locator('.mg-mark-flag')).toHaveCount(3);
  await expect(page.locator('#annot-popup')).toHaveClass(/hidden/);
});

test('read page: a new note can be created from a selection', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await selectPhrase(page, 'a sweep across both');
  await page.click('#annot-popup button[data-act="note"]');
  await expect(page.locator('.mg-note-marker')).toHaveCount(4);
  const input = page.locator('[data-note-input="4"]');
  await input.fill('Check this against the appendix.');
  await page.click('[data-save-note="4"]');
  await expect(page.locator('.mg-margin-note[data-note="4"]')).toContainText('Check this against the appendix.');
});

test('read page: a margin note thread accepts a new reply', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.click('[data-toggle="1"]');
  await expect(page.locator('[data-thread="1"]')).not.toHaveClass(/hidden/);
  await page.fill('[data-reply-input="1"]', 'Agreed — flagging in the next pass.');
  await page.click('[data-post-reply="1"]');
  await expect(page.locator('[data-thread="1"]')).toContainText('Agreed — flagging in the next pass.');
  await expect(page.locator('[data-toggle="1"]')).toContainText('2 replies');
});

test('read page: citation hover shows its reference preview', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.hover('.mg-cite[data-cite="1"]');
  await expect(page.locator('#cite-preview')).toHaveClass(/is-shown/);
  await expect(page.locator('#cite-preview')).toContainText('LeCun');
});

test('read page: sketch mode places a stamp on the sketch layer', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.click('[data-mode="sketch"]');
  await expect(page.locator('#sketch-tools')).toBeVisible();
  await page.click('[data-stamp="circle"]');
  await page.click('#sketch-svg', { position: { x: 150, y: 100 } });
  await expect(page.locator('#sketch-svg > *')).not.toHaveCount(0);
});

test('read page: a margin note can hold its own freehand sketch', async ({ page }) => {
  await page.goto(url('read.html'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.click('[data-toggle-sketch="1"]');
  await expect(page.locator('[data-sketchwrap="1"]')).toBeVisible();

  const box = await page.locator('[data-sketch="1"]').boundingBox();
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 40, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('[data-sketch="1"] > *')).not.toHaveCount(0);

  // survives a re-render triggered elsewhere (e.g. posting a reply on another note)
  await page.click('[data-toggle="2"]');
  await expect(page.locator('[data-sketch="1"] > *')).not.toHaveCount(0);

  await page.click('[data-clear-sketch="1"]');
  await expect(page.locator('[data-sketch="1"] > *')).toHaveCount(0);
});
