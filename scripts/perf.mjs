#!/usr/bin/env node
// Smoothness probe: drives the main journeys in headless Chromium at a CPU slowdown and reports, per step, frames,
// dropped frames (> 25 ms), the worst frame, long tasks and the CDP layout / style / script counters; `--idle` measures
// each tab root sitting still and lists the Web Animations still running. Numbers are relative (headless has no GPU):
// compare before / after, watch the worst frame and the dropped-frame count on plain scrolls.
//
//   npm run build && npx vite preview --port 4199        # a served build: realistic numbers
//   npm run perf -- --base http://localhost:4199          # journeys (default cpu ×4)
//   npm run perf -- --base http://localhost:4199 --idle   # idle screens
//   npm run perf -- --cpu 1 --out perf.md                 # options: --cpu <n>, --out <file>, --base (default PORT / 5180)
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { PHONE, baseUrl } from './lib/capture.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const base = opt('--base', baseUrl().replace(/\/$/, ''));
const cpu = Number(opt('--cpu', 4));
const idle = argv.includes('--idle');
const out = opt('--out', null);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(() => {
  const P = (window.__perf = { frames: [], long: [] });
  let last = performance.now();
  const loop = (t) => {
    P.frames.push([t, t - last]);
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => P.long.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
  } catch {
    /* no longtask support */
  }
});
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const now = () => page.evaluate(() => performance.now());
const phone = () => page.locator(PHONE).first();
const go = async (route) => {
  await page.goto(`${base}/#/${route}`, { waitUntil: 'load' });
  await phone().waitFor();
  await page.waitForTimeout(1500);
};
const window_ = async (t0, t1) =>
  page.evaluate(([a, b]) => {
    const P = window.__perf;
    const fr = P.frames.filter(([t]) => t > a && t <= b).map(([, d]) => d);
    const long = P.long.filter(([t]) => t > a && t <= b);
    return { frames: fr.length, dropped: fr.filter((d) => d > 25).length, worst: Math.round(Math.max(0, ...fr)), longMs: Math.round(long.reduce((s, [, d]) => s + d, 0)), longN: long.length };
  }, [t0, t1]);
const delta = (m0, m1, k, ms = false) => (ms ? Math.round((m1[k] - m0[k]) * 1000) : m1[k] - m0[k]);

const rows = [];
async function step(name, fn, settle = 1300) {
  const t0 = await now();
  const m0 = await metrics();
  let err = null;
  try {
    await fn();
  } catch (e) {
    err = String(e.message ?? e).split('\n')[0];
  }
  await page.waitForTimeout(settle);
  const t1 = await now();
  const m1 = await metrics();
  rows.push({ name, ...(await window_(t0, t1)), layouts: delta(m0, m1, 'LayoutCount'), recalcs: delta(m0, m1, 'RecalcStyleCount'), layoutMs: delta(m0, m1, 'LayoutDuration', true), styleMs: delta(m0, m1, 'RecalcStyleDuration', true), scriptMs: delta(m0, m1, 'ScriptDuration', true), nodes: m1.Nodes, err });
}
const fling = async (n = 6, dy = 320) => {
  const b = await phone().boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  for (let i = 0; i < n; i++) {
    await page.mouse.wheel(0, dy);
    await page.waitForTimeout(40);
  }
};
const tab = (label) => phone().locator(`button[aria-label="${label}"]`).first().click();
const text = (t) => phone().getByText(t, { exact: false }).first().click({ timeout: 4000 });
const back = () => phone().locator('[aria-label=Back]').first().click();
const scrim = () => phone().locator('[class*=Scrim], [class*=scrim]').first().click({ position: { x: 20, y: 20 } });

let report = '';
if (idle) {
  report += `# perf · idle · cpu×${cpu} · ${base}\n\n| screen | frames | dropped | worst ms | recalcs (ms) | layouts (ms) | script ms | nodes | animations still running |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const route of ['home/home', 'categories/categories', 'deals/deals', 'cart/cart', 'account/account', 'checkout/checkout', 'plp/listing?query=phone', 'pdp/detail']) {
    await go(route);
    await page.waitForTimeout(1500);
    const t0 = await now();
    const m0 = await metrics();
    await page.waitForTimeout(3000);
    const t1 = await now();
    const m1 = await metrics();
    const w = await window_(t0, t1);
    const anims = await page.evaluate(() => {
      const counts = {};
      for (const a of document.getAnimations()) {
        const timing = a.effect?.getComputedTiming?.();
        const k = `${a.animationName || Object.keys(a.effect?.getKeyframes?.()[0] ?? {}).filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x)).join('+')} ×${timing?.iterations === Infinity ? '∞' : timing?.iterations}`;
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return Object.entries(counts).map(([k, v]) => `${v}× ${k}`).join(', ');
    });
    report += `| ${route} | ${w.frames} | ${w.dropped} | ${w.worst} | ${delta(m0, m1, 'RecalcStyleCount')} (${delta(m0, m1, 'RecalcStyleDuration', true)}) | ${delta(m0, m1, 'LayoutCount')} (${delta(m0, m1, 'LayoutDuration', true)}) | ${delta(m0, m1, 'ScriptDuration', true)} | ${m1.Nodes} | ${anims || '—'} |\n`;
  }
} else {
  await go('home/home');
  await step('home · fling scroll', () => fling(8), 900);
  await step('home · fling back up', () => fling(8, -320), 900);
  await step('tab → Categories', () => tab('Categories'));
  await step('tab → Deals', () => tab('Deals'));
  await step('tab → Home', () => tab('Home'));
  await step('home → PDP (card tap)', () => phone().locator('article').first().click());
  await step('PDP · fling scroll', () => fling(6), 900);
  await step('PDP → back', back);
  await go('search/search');
  await step('search · type iphone', async () => {
    await phone().locator('input').first().click();
    await phone().locator('input').first().type('iphone', { delay: 60 });
  }, 600);
  await step('search → results (Enter)', () => page.keyboard.press('Enter'), 2600);
  await step('PLP · fling scroll', () => fling(8), 900);
  await step('PLP · fling back up', () => fling(8, -320), 900);
  await step('PLP → Filters sheet', () => text('Filter'));
  await step('Filters → close (scrim)', scrim);
  await step('PLP → Sort sheet', () => text('Sort'));
  await step('Sort → pick', () => phone().getByText(/low to high/i).first().click({ timeout: 4000 }));
  await step('PLP → PDP', () => phone().locator('[data-testid=product_box]').first().click());
  await step('PDP → Add to cart', () => text('Add to cart'));
  await step('added sheet → close (scrim)', scrim);
  await step('PDP → back (to PLP)', back);
  await go('home/home');
  await step('tab → Cart', () => tab('Cart'));
  await step('cart · fling scroll', () => fling(5), 900);
  await step('cart → Checkout', () => text('Checkout'), 1800);
  await step('checkout · fling scroll', () => fling(6), 900);
  await go('account/account');
  await step('account → Addresses', () => text('Addresses'));
  await step('addresses → Add new address (map)', () => text('Add new address'), 1800);
  report += `# perf · journeys · cpu×${cpu} · ${base}\n\n| step | frames | dropped | worst ms | long tasks ms (n) | layouts | recalcs | layout ms | style ms | script ms | nodes | err |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) report += `| ${r.name} | ${r.frames} | ${r.dropped} | ${r.worst} | ${r.longMs} (${r.longN}) | ${r.layouts} | ${r.recalcs} | ${r.layoutMs} | ${r.styleMs} | ${r.scriptMs} | ${r.nodes} | ${r.err ?? ''} |\n`;
}
report += `\nconsole / page errors: ${errors.length}\n${errors.slice(0, 5).map((e) => `- ${e.slice(0, 160)}`).join('\n')}\n`;
console.log(report);
if (out) writeFileSync(out, report);
await browser.close();
