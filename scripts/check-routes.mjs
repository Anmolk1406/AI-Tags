// Smoke test: opens every registered route and reports console errors / placeholders.
// Usage: node scripts/check-routes.mjs   (dev server running on :5180)
import { chromium } from 'playwright';
const base = `http://localhost:${process.env.PORT ?? 5180}/`;
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1400, height: 1000 } });
let errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto(base);
await page.waitForTimeout(800);
const routes = await page.evaluate(() => window.__NK_ROUTES__);
let failed = 0;
for (const r of routes) {
  errs = [];
  await page.goto(`${base}#/${r}`);
  await page.reload();
  await page.waitForTimeout(1300);
  const txt = await page.locator('.pg-stage').innerText().catch(() => '');
  const bad = errs.length || txt.includes('Coming soon');
  if (bad) failed++;
  console.log(`${bad ? '✗' : '✓'} ${r.padEnd(26)} ${errs.join(' | ').slice(0, 200)}${txt.includes('Coming soon') ? ' PLACEHOLDER' : ''}`);
}
console.log(`\n${routes.length - failed}/${routes.length} routes clean`);
await b.close();
process.exit(failed ? 1 : 0);
