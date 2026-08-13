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

const PAGES = ['index.html', 'components.html', 'charts.html', 'board.html'];

for (const f of PAGES) {
  test(`${f} loads without JS errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(url(f), { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

const CHART_IDS = ['chart-price', 'chart-bar', 'chart-loss', 'chart-sector', 'diagram'];

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
