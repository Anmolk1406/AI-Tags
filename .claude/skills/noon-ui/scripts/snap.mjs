#!/usr/bin/env node
// Visual validation: screenshot every screen of one or more flows (or single routes) from the running dev server.
//   node .claude/skills/noon-ui/scripts/snap.mjs <flow | flow/screen>... [--out <dir>] [--scroll <y>]
//   e.g. node .claude/skills/noon-ui/scripts/snap.mjs home cart/empty --out /tmp/review
// Writes <out>/<flow>__<screen>.png (default out: /tmp/noon-ui-snap) and prints console errors per screen.
// Needs `npm run dev` running (PORT=<port> if Vite didn't get 5180). Read every PNG it writes.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args.splice(i, 2)[1];
};
const out = opt('--out', '/tmp/noon-ui-snap');
const scroll = Number(opt('--scroll', 0));
if (!args.length) {
  console.error('Usage: node .claude/skills/noon-ui/scripts/snap.mjs <flow | flow/screen>... [--out <dir>] [--scroll <y>]');
  process.exit(1);
}
const base = `http://localhost:${process.env.PORT ?? 5180}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
let errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
try {
  await page.goto(base);
} catch {
  console.error(`✗ dev server not reachable at ${base} — run \`npm run dev\` (or set PORT)`);
  process.exit(1);
}
await page.waitForTimeout(800);
const all = await page.evaluate(() => window.__NK_ROUTES__ ?? []);
const targets = args.flatMap((a) => (a.includes('/') ? [a] : all.filter((r) => r.startsWith(`${a}/`))));
const unknown = targets.filter((r) => !all.includes(r));
if (!targets.length || unknown.length) {
  console.error(`✗ unknown flow or route: ${unknown.join(', ') || args.join(', ')}`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
let failed = 0;
for (const r of targets) {
  errors = [];
  await page.goto(`${base}#/${r}`);
  await page.waitForTimeout(1200);
  if (scroll) {
    await page.evaluate((y) => document.querySelectorAll('.nk-scroll').forEach((el) => (el.scrollTop = y)), scroll);
    await page.waitForTimeout(600);
  }
  const file = join(out, `${r.replace('/', '__')}${scroll ? `@${scroll}` : ''}.png`);
  await page.locator('.pg-stage').screenshot({ path: file, animations: 'disabled' });
  if (errors.length) failed++;
  console.log(`${errors.length ? '✗' : '✓'} ${r.padEnd(32)} ${file}${errors.length ? `\n    ${errors.join('\n    ')}` : ''}`);
}
await browser.close();
console.log(`\n${targets.length} screen(s) → ${out}${failed ? ` · ${failed} with console errors` : ''}. Read every PNG against the spec.`);
process.exit(failed ? 1 : 0);
