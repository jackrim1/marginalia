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

const PAGES = ['index.html', 'components.html', 'charts.html'];

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

test('demo page reveals its figures (no stuck opacity:0)', async ({ page }) => {
  await page.goto(url('index.html'), { waitUntil: 'load' });
  // scroll so the reveal observer fires
  for (let y = 0; y <= 4000; y += 500) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  const firstFigure = page.locator('figure[data-reveal]').first();
  await expect(firstFigure).toHaveClass(/shown/);
});
