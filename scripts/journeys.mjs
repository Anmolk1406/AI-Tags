// Journey tests: walks the core user journeys in a real browser, asserts behaviour (routes, state, results),
// saves a screenshot at every checkpoint and fails on any console error / page error.
//
//   npm run test:journeys                 # starts its own Vite dev server
//   PORT=5182 npm run test:journeys       # or reuse a running one
//   npm run test:journeys -- plp-filter   # only journeys whose name contains "plp-filter"
//
// Screenshots: test-results/journeys/<journey>/<nn>-<checkpoint>.png (git-ignored).
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const outRoot = join(root, 'test-results/journeys');
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));

// ── dev server ───────────────────────────────────────────────────────────────────────────────────────────────
let server;
let base;
if (process.env.PORT) base = `http://localhost:${process.env.PORT}/`;
else {
  const { createServer } = await import('vite');
  server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } });
  await server.listen();
  base = server.resolvedUrls.local[0];
}

// ── helpers ──────────────────────────────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const nav = (page) => page.evaluate(() => window.__NK_NAV__ ?? { route: undefined, stack: [], params: {} });
async function waitRoute(page, pred, label, timeout = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const n = await nav(page);
    if (n.route && (typeof pred === 'string' ? n.route === pred : pred(n.route))) return n;
    await page.waitForTimeout(50);
  }
  throw new Error(`expected route ${label ?? pred}, still on ${(await nav(page)).route}`);
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}
const cartBadge = (page) => page.evaluate(() => Number(document.querySelector('nav [aria-label=Cart] span span')?.textContent ?? 0));
const phone = (page) => page.locator('.nk-scroll').last();
/** tap an element's centre like a finger: Playwright's actionability waits never settle on chrome that keeps animating
 *  (the PDP header's expandable search springs), and the scroll-into-view moves overlay headers */
async function tap(page, locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('tap: element not on screen');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

const journeys = [
  {
    name: 'search-to-plp',
    title: 'Search → results hand-off: no empty frame, the bar stays put, results load',
    async run(page, shot) {
      await page.goto(`${base}#/search/search`);
      await page.waitForTimeout(1200);
      await page.keyboard.type('phone', { delay: 30 });
      await page.waitForTimeout(900);
      await shot('suggestions');
      const bar = await page.locator('input:visible').first().boundingBox();
      await page.keyboard.press('Enter');
      // sample the hand-off: a search bar must be on screen in every frame, at the same spot
      const frames = [];
      for (let i = 0; i < 30; i++) {
        frames.push(await page.evaluate(() => [...document.querySelectorAll('input')].filter((x) => x.offsetParent).map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)]; })));
        await page.waitForTimeout(25);
      }
      expect(frames.every((f) => f.length > 0), 'a frame without a search bar (empty Suspense frame) during the hand-off');
      expect(frames.every((f) => f.every(([x, y]) => Math.abs(x - Math.round(bar.x)) <= 1 && Math.abs(y - Math.round(bar.y)) <= 1)), `the search bar moved during the hand-off: ${JSON.stringify(frames.flat().slice(0, 6))}`);
      const n = await waitRoute(page, 'plp/listing');
      expect(n.params.query === 'phone', `PLP query is "${n.params.query}", expected "phone"`);
      await page.waitForTimeout(1600);
      const boxes = await page.locator('[data-testid=product_box]').count();
      expect(boxes >= 4, `only ${boxes} product boxes on the PLP`);
      await shot('results');
    },
  },
  {
    name: 'plp-filter',
    title: 'PLP quick pill filters the grid and counts on Filter; tapping again clears it',
    async run(page, shot) {
      await page.goto(`${base}#/plp/listing?query=phone`);
      await page.waitForTimeout(2500);
      const before = await page.locator('[data-testid=product_box]').count();
      await page.locator('[class*=pills] button', { hasText: /^Samsung$/ }).click();
      await page.waitForTimeout(1400);
      const names = await page.locator('[data-testid=product_box] [class*=name]').allInnerTexts();
      expect(names.length > 0 && names.length < before, `Samsung filter left ${names.length} of ${before} results`);
      expect(names.every((t) => t.startsWith('Samsung')), `non-Samsung results after the brand filter: ${names.filter((t) => !t.startsWith('Samsung')).slice(0, 2).join(' / ')}`);
      const filterText = await page.locator('[class*=pills] button').first().innerText();
      expect(/1/.test(filterText), `Filter pill shows no count: "${filterText}"`);
      await shot('samsung-selected');
      await page.locator('[class*=pills] button', { hasText: /^Samsung$/ }).click();
      await page.waitForTimeout(1400);
      const after = await page.locator('[data-testid=product_box]').count();
      expect(after === before, `clearing the filter shows ${after} results, expected ${before}`);
      await shot('cleared');
    },
  },
  {
    name: 'plp-sort-sheet',
    title: 'Sort opens as a sheet, picking an option closes it and reorders the grid',
    async run(page, shot) {
      await page.goto(`${base}#/plp/listing?query=phone`);
      await page.waitForTimeout(2500);
      await page.locator('[class*=pills] button', { hasText: /^Sort$/ }).click();
      await waitRoute(page, 'plp/sort');
      await page.waitForTimeout(500);
      await shot('sheet-open');
      await page.getByText('Price: Low to High', { exact: true }).click();
      await waitRoute(page, 'plp/listing', 'plp/listing (sheet closed)');
      await page.waitForTimeout(1400);
      const label = await page.locator('[class*=pills] button').nth(1).innerText();
      expect(/Price Low to High/.test(label), `Sort pill reads "${label}"`);
      const prices = (await page.locator('[data-testid=product_box] [class*=sale]').allInnerTexts()).map((t) => Number(t.replace(/[^\d.]/g, '')));
      expect(prices.length > 2 && prices.every((p, i) => i === 0 || p >= prices[i - 1]), `prices are not ascending: ${prices.slice(0, 6).join(', ')}`);
      await shot('sorted');
    },
  },
  {
    name: 'pdp-add-to-cart',
    title: 'PLP → PDP → Add to cart updates the cart; Back returns to the same results',
    async run(page, shot) {
      await page.goto(`${base}#/plp/listing?query=phone`);
      await page.waitForTimeout(2500);
      const first = page.locator('[data-testid=product_box]').first();
      const name = (await first.locator('[class*=name]').innerText()).trim();
      await first.locator('[class*=name]').click();
      const n = await waitRoute(page, 'pdp/detail');
      expect(n.stack.includes('plp/listing'), `PDP was not pushed on top of the PLP (stack ${n.stack.join(' → ')})`);
      await page.waitForTimeout(1500);
      await shot('pdp');
      const badge = await cartBadge(page);
      // the footer ATC (product-card "+" buttons are also named "Add to cart", so match the visible label)
      await page.locator('button:visible', { hasText: /^Add to cart$/ }).last().click();
      await page.waitForTimeout(1200);
      const after = await cartBadge(page);
      const route = (await nav(page)).route;
      expect(after === badge + 1 || route === 'pdp/added' || route === 'pdp/variants', `Add to cart did nothing (badge ${badge} → ${after}, route ${route})`);
      await shot('added');
      // close the sheet that opened (tap its scrim), then the PDP header's Back — the app's own controls,
      // never history.back() (the preview keeps the URL with replaceState, so browser Back leaves the app)
      for (let i = 0; i < 4 && (await nav(page)).route !== 'plp/listing'; i++) {
        const r = (await nav(page)).route;
        const keepShopping = page.getByRole('button', { name: /continue shopping/i });
        // a dismissed sheet's scrim fades out for a moment and still takes taps: wait for it to go
        if (r === 'pdp/detail') await page.waitForFunction(() => !document.querySelector('[class*=scrim]'), null, { timeout: 3000 }).catch(() => undefined);
        if (r === 'pdp/detail') await tap(page, page.getByRole('button', { name: 'Back', exact: true }).last()); // the top-most screen's (stacked screens stay mounted)
        else if (await keepShopping.isVisible().catch(() => false)) await keepShopping.click();
        else await page.locator('[class*=scrim]').last().click({ position: { x: 20, y: 20 }, timeout: 3000 });
        await page.waitForTimeout(800);
      }
      const n2 = await waitRoute(page, 'plp/listing', 'plp/listing after Back');
      expect(n2.params.query === 'phone', `Back lost the query: "${n2.params.query}"`);
      const firstAgain = (await page.locator('[data-testid=product_box] [class*=name]').first().innerText()).trim();
      expect(firstAgain === name, `Back shows different results (first "${firstAgain}", was "${name}")`);
      await shot('back-on-plp');
    },
  },
  {
    name: 'cart-checkout',
    title: 'Cart: the order summary opens and closes from the footer, Checkout goes to checkout',
    async run(page, shot) {
      await page.goto(`${base}#/cart/cart`);
      await page.waitForTimeout(2500);
      expect((await page.locator('[class*=footer] button[aria-expanded]').count()) === 1, 'no footer total toggle');
      await page.locator('[class*=footer] button[aria-expanded]').click();
      await page.waitForTimeout(700);
      expect(await page.getByText('Order Summary').first().isVisible(), 'order summary did not open');
      expect((await page.locator('[class*=footer] button[aria-expanded=true]').count()) === 1, 'toggle not marked expanded');
      await shot('summary-open');
      await page.locator('[class*=footer] button[aria-expanded]').click();
      await page.waitForTimeout(700);
      expect((await page.locator('[class*=footer] button[aria-expanded=false]').count()) === 1, 'order summary did not close');
      await page.getByRole('button', { name: /^Checkout$/ }).click();
      // non-members get the noon One push first (bappzaar showVipPush → VIPCartOverlayScreen); × continues to checkout
      const first = await waitRoute(page, (r) => r.startsWith('checkout/') || r === 'noonone/cartOverlay', 'checkout/* or noonone/cartOverlay');
      if (first.route === 'noonone/cartOverlay') {
        await page.waitForTimeout(700);
        await shot('noon-one-push');
        await page.getByRole('button', { name: /close/i }).first().click();
      }
      const n = await waitRoute(page, (r) => r.startsWith('checkout/'), 'checkout/*');
      await page.waitForTimeout(1200);
      await shot(n.route.replace('/', '-'));
    },
  },
];

// ── run ──────────────────────────────────────────────────────────────────────────────────────────────────────
let failed = 0;
for (const j of journeys.filter((x) => !only.length || only.some((o) => x.name.includes(o)))) {
  const dir = join(outRoot, j.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  let n = 0;
  const shot = async (label) => {
    const box = await phone(page).evaluate((el) => { const r = (el.closest('[class*=phone]') ?? el).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }).catch(() => undefined);
    await page.screenshot({ path: join(dir, `${String(++n).padStart(2, '0')}-${label}.png`), clip: box });
  };
  const t0 = Date.now();
  try {
    await j.run(page, shot);
    if (errors.length) throw new Error(`console errors: ${errors.slice(0, 3).join(' | ')}`);
    console.log(`✓ ${j.name.padEnd(18)} ${j.title} (${((Date.now() - t0) / 1000).toFixed(1)}s, ${n} checkpoints)`);
  } catch (e) {
    failed++;
    await shot('failure').catch(() => undefined);
    console.log(`✗ ${j.name.padEnd(18)} ${j.title}\n    ${String(e.message).split('\n')[0]}`);
  }
  await ctx.close();
}
await browser.close();
await server?.close();
console.log(`\n${failed ? `${failed} journey(s) failed` : 'all journeys pass'} · screenshots in test-results/journeys/`);
process.exit(failed ? 1 : 0);
