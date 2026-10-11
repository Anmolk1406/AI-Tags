// Usage: node scripts/shot.mjs <route> [out.png] [--click "selector"]...  (dev server must be running on :5180)
// Screenshots the phone in the playground at the given route, e.g. `node scripts/shot.mjs pdp/detail`.
import { chromium } from 'playwright';
const [route = 'home/home', out = `/tmp/nk-${route.replace(/\//g, '_')}.png`, ...rest] = process.argv.slice(2);
const port = process.env.PORT ?? 5180;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://localhost:${port}/#/${route}`);
await page.waitForTimeout(1200);
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i] === '--click') { await page.locator(rest[i + 1]).first().click(); await page.waitForTimeout(900); }
  if (rest[i] === '--type') { await page.keyboard.type(rest[i + 1], { delay: 40 }); await page.waitForTimeout(900); }
  if (rest[i] === '--wait') { await page.waitForTimeout(Number(rest[i + 1])); }
  if (rest[i] === '--scroll') { await page.evaluate((y) => document.querySelectorAll('.nk-scroll').forEach((el) => el.scrollTop = Number(y)), rest[i + 1]); await page.waitForTimeout(700); }
}
const phone = page.locator('.pg-stage');
await phone.screenshot({ path: out });
console.log(out, errors.length ? `\nERRORS:\n${errors.join('\n')}` : '(no console errors)');
await browser.close();
