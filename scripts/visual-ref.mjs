// Reference fidelity: compares the kit against EXTERNAL references (Figma exports, real-app screenshots) stored in
// visual/refs/, one entry per reference in visual/refs/manifest.json. For each entry it renders the route at the
// reference's viewport width, captures the selected element(s) at the reference's scale, and reports:
//   · size mismatch (the captured box vs the reference, in px)   · % of differing pixels (masked areas excluded)
//   · the worst regions (24px cells, reference coordinates)      · a diff image
// and fails when a size is off by more than `sizeTolerance` px or the diff is above the entry's `threshold`.
//
//   npm run visual:ref                    # all references (starts its own Vite server unless PORT is set)
//   npm run visual:ref -- cart            # entries whose name contains "cart"
//
// Output: test-results/visual-ref/<name>.{kit,ref,diff}.png (git-ignored).
// Rule: references only ever come from outside the kit. Nothing here writes into visual/refs/ — a kit screenshot is
// never its own baseline (that's `npm run visual:snap`, a regression check against the kit's previous self).
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const refsDir = join(root, 'visual/refs');
const outDir = join(root, 'test-results/visual-ref');
mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(readFileSync(join(refsDir, 'manifest.json'), 'utf8'));
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));

let server;
let base;
if (process.env.PORT) base = `http://localhost:${process.env.PORT}/`;
else {
  const { createServer } = await import('vite');
  server = await createServer({ root, logLevel: 'error', server: { port: 5198, strictPort: false } });
  await server.listen();
  base = server.resolvedUrls.local[0];
}

const browser = await chromium.launch();
const CELL = 24;
const CHANNEL_TOLERANCE = 40; // per-channel delta treated as the same pixel (anti-aliasing, font hinting)
let failed = 0;

for (const ref of manifest.refs.filter((r) => !only.length || only.some((o) => r.name.includes(o)))) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: ref.scale ?? 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}#/${ref.route}`);
  await page.waitForTimeout(400);
  // render the phone at the reference's width (the layout is fluid; the 390 device is a token, Figma frames are 375)
  await page.addStyleTag({ content: `[class*=device] > [class*=viewport], [class*=frameless] > [class*=viewport] { width: ${ref.viewport}px !important; clip-path: none !important; } vite-error-overlay { display: none !important; }` });
  await page.waitForTimeout(ref.wait ?? 2500);

  const box = await page.evaluate((selectors) => {
    const rects = selectors.map((s) => [...document.querySelectorAll(s)].find((e) => e.offsetParent || e.getClientRects().length)?.getBoundingClientRect()).filter(Boolean);
    if (rects.length !== selectors.length) return null;
    const x = Math.min(...rects.map((r) => r.left));
    const y = Math.min(...rects.map((r) => r.top));
    return { x, y, width: Math.max(...rects.map((r) => r.right)) - x, height: Math.max(...rects.map((r) => r.bottom)) - y };
  }, ref.select);
  if (!box) {
    failed++;
    console.log(`✗ ${ref.name}: selector(s) not found on ${ref.route}: ${ref.select.join(', ')}`);
    await page.close();
    continue;
  }
  const kitPath = join(outDir, `${ref.name}.kit.png`);
  await page.screenshot({ path: kitPath, clip: box, animations: 'disabled' });
  await page.close();

  // reference (optionally cropped), kit capture resized onto it for the pixel comparison
  let refImg = sharp(join(refsDir, ref.file));
  const meta = await refImg.metadata();
  const crop = ref.refCrop ? { left: ref.refCrop[0], top: ref.refCrop[1], width: ref.refCrop[2], height: ref.refCrop[3] } : { left: 0, top: 0, width: meta.width, height: meta.height };
  refImg = refImg.extract(crop);
  const W = crop.width;
  const H = crop.height;
  const scale = ref.scale ?? 1;
  const kitW = Math.round(box.width * scale);
  const kitH = Math.round(box.height * scale);
  const sizeOff = { w: kitW - W, h: kitH - H };
  const tol = (ref.sizeTolerance ?? 2) * scale;
  const [a, b] = await Promise.all([
    refImg.clone().removeAlpha().raw().toBuffer(),
    sharp(kitPath).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer(),
  ]);
  await refImg.clone().png().toFile(join(outDir, `${ref.name}.ref.png`));

  const masked = (x, y) => (ref.masks ?? []).some(([mx, my, mw, mh]) => x >= mx * scale && x < (mx + mw) * scale && y >= my * scale && y < (my + mh) * scale);
  const cells = new Map();
  const diff = Buffer.alloc(W * H * 3);
  let counted = 0;
  let different = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const grey = Math.round((a[i] + a[i + 1] + a[i + 2]) / 3 * 0.35 + 165);
      if (masked(x, y)) {
        diff[i] = 120; diff[i + 1] = 170; diff[i + 2] = 255;
        continue;
      }
      counted++;
      const off = Math.abs(a[i] - b[i]) > CHANNEL_TOLERANCE || Math.abs(a[i + 1] - b[i + 1]) > CHANNEL_TOLERANCE || Math.abs(a[i + 2] - b[i + 2]) > CHANNEL_TOLERANCE;
      const key = `${Math.floor(x / (CELL * scale))},${Math.floor(y / (CELL * scale))}`;
      const c = cells.get(key) ?? { n: 0, d: 0 };
      c.n++;
      if (off) {
        different++;
        c.d++;
        diff[i] = 230; diff[i + 1] = 40; diff[i + 2] = 40;
      } else {
        diff[i] = grey; diff[i + 1] = grey; diff[i + 2] = grey;
      }
      cells.set(key, c);
    }
  }
  await sharp(diff, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(outDir, `${ref.name}.diff.png`));
  const pct = counted ? different / counted : 0;
  const worst = [...cells.entries()]
    .map(([k, c]) => ({ k, r: c.d / c.n }))
    .filter((c) => c.r > 0.2)
    .sort((p, q) => q.r - p.r)
    .slice(0, 4)
    .map(({ k, r }) => { const [cx, cy] = k.split(',').map(Number); return `(${cx * CELL},${cy * CELL}) ${Math.round(r * 100)}%`; });
  const sizeBad = Math.abs(sizeOff.w) > tol || Math.abs(sizeOff.h) > tol;
  const bad = sizeBad || pct > ref.threshold || errors.length;
  if (bad) failed++;
  console.log(
    `${bad ? '✗' : '✓'} ${ref.name.padEnd(28)} diff ${(pct * 100).toFixed(1)}% (max ${(ref.threshold * 100).toFixed(0)}%)` +
      ` · size ${Math.round(box.width)}×${Math.round(box.height)} vs ${W / scale}×${H / scale}${sizeBad ? ' ← off' : ''}` +
      (worst.length ? `\n    worst 24px cells (ref coords): ${worst.join(' · ')}` : '') +
      (errors.length ? `\n    console errors: ${errors.slice(0, 2).join(' | ')}` : '') +
      `\n    ${ref.source}`,
  );
}
await browser.close();
await server?.close();
console.log(`\n${failed ? `${failed} reference(s) off` : 'all references within threshold'} · images in test-results/visual-ref/`);
process.exit(failed ? 1 : 0);
