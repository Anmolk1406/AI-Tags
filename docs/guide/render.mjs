#!/usr/bin/env node
// Renders docs/guide/guide.html to docs/guide/noon-flow-kit-guide.pdf (8 landscape pages, 1280 × 905).
//   node docs/guide/render.mjs            → the PDF
//   node docs/guide/render.mjs --png dir  → also one PNG per page, to review the layout
// Screenshots in docs/guide/img/ come from `node scripts/shot.mjs <route> docs/guide/img/<name>.png` (dev server running).
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(new URL(import.meta.url).pathname);
const pngIdx = process.argv.indexOf('--png');
const pngDir = pngIdx > 0 ? process.argv[pngIdx + 1] : null;

const browser = await chromium.launch();

// Bake the panel backgrounds (gradient + grain) into JPEGs once: Chrome rasterises CSS gradients per panel in a PDF,
// which made it ~6 MB. guide.html uses img/bg-<name>.jpg; the CSS gradients in BAKE are the source.
const BAKE = {
  rust: 'radial-gradient(120% 80% at 10% 0%, #F2EDE6 0%, transparent 45%), radial-gradient(90% 90% at 80% 100%, #3A1A10 0%, transparent 60%), linear-gradient(160deg, #E9C7AE 0%, #C8673B 45%, #8E3B1E 100%)',
  steel: 'radial-gradient(90% 70% at 50% 0%, #9DB0C2 0%, transparent 60%), linear-gradient(180deg, #7F95AB 0%, #4E6A85 55%, #26394D 100%)',
  forest: 'radial-gradient(70% 60% at 30% 30%, #6E8F68 0%, transparent 60%), radial-gradient(80% 80% at 80% 90%, #0F2A18 0%, transparent 60%), linear-gradient(160deg, #3F6346 0%, #23412C 60%, #142A1B 100%)',
  sand: 'radial-gradient(90% 80% at 20% 10%, #F4EFE6 0%, transparent 55%), linear-gradient(170deg, #E3D6BF 0%, #BFA27A 60%, #7C6340 100%)',
  dusk: 'radial-gradient(80% 70% at 70% 10%, #C9B8D9 0%, transparent 55%), linear-gradient(170deg, #8D7DA8 0%, #514470 60%, #241D36 100%)',
  // the "problem" page: desaturated, low light
  ash: 'radial-gradient(80% 60% at 30% 10%, #5A5755 0%, transparent 60%), linear-gradient(175deg, #3B3937 0%, #262524 60%, #191817 100%)',
  ember: 'radial-gradient(70% 60% at 70% 15%, #6E3A30 0%, transparent 60%), linear-gradient(170deg, #4A2620 0%, #2C1714 60%, #1A0E0C 100%)',
  slate: 'radial-gradient(70% 60% at 40% 10%, #4D5560 0%, transparent 60%), linear-gradient(175deg, #353B44 0%, #23272D 60%, #16181C 100%)',
};
const baker = await browser.newPage({ viewport: { width: 900, height: 1140 } });
// inline: a setContent page (about:blank) may not load file:// URLs
const grain = `data:image/png;base64,${fs.readFileSync(path.join(dir, 'img/grain.png')).toString('base64')}`;
for (const [name, bg] of Object.entries(BAKE)) {
  // two layers: the gradient, then the grain tile over it (one background list would cycle the tile size onto the gradients)
  await baker.setContent(`<body style="margin:0"><div style="position:relative;width:900px;height:1140px;background:${bg}"><div style="position:absolute;inset:0;background:url('${grain}') repeat;background-size:128px 128px"></div></div></body>`);
  await baker.waitForLoadState('load');
  await baker.screenshot({ path: path.join(dir, `img/bg-${name}.jpg`), type: 'jpeg', quality: 80 });
}

// Cover: the home screen as coloured ASCII on charcoal (img/cover-ascii.png). Each 7 × 12 cell takes the image's colour
// there; brighter cells get denser glyphs. Rendered on a canvas so the PDF gets one image.
await baker.setViewportSize({ width: 1280, height: 905 });
const home = `data:image/jpeg;base64,${fs.readFileSync(path.join(dir, 'img/home.jpg')).toString('base64')}`;
await baker.setContent('<body style="margin:0;background:#121211"><canvas id="c" width="2560" height="1810"></canvas></body>');
const ascii = await baker.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const W = 2560, H = 1810, cw = 10, ch = 17;
  const c = document.getElementById('c');
  const g = c.getContext('2d');
  g.fillStyle = '#121211';
  g.fillRect(0, 0, W, H);
  // the phone on the right, a little taller than the page so it bleeds top and bottom
  const scale = (H * 1.08) / img.height;
  const iw = img.width * scale, ih = img.height * scale, ix = W - iw - 140, iy = (H - ih) / 2 + 40;
  const s = document.createElement('canvas');
  s.width = W; s.height = H;
  const sg = s.getContext('2d');
  sg.drawImage(img, ix, iy, iw, ih);
  const px = sg.getImageData(0, 0, W, H).data;
  // density follows darkness: the white screen becomes faint dots, text / images / buttons dense coloured glyphs
  const ramp = '.:-=+*#%@';
  g.font = `500 ${ch - 3}px 'JetBrains Mono', Menlo, monospace`;
  g.textBaseline = 'top';
  for (let y = 0; y < H; y += ch) for (let x = 0; x < W; x += cw) {
    const i = ((y + (ch >> 1)) * W + (x + (cw >> 1))) * 4;
    const [r, gr, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]];
    if (!a) continue;
    const lum = (0.299 * r + 0.587 * gr + 0.114 * b) / 255;
    const sat = (Math.max(r, gr, b) - Math.min(r, gr, b)) / 255;
    const ink = Math.min(1, (1 - lum) * 1.25 + sat * 0.9);
    const glyph = ramp[Math.min(ramp.length - 1, Math.floor(ink * ramp.length))];
    if (ink < 0.08) { g.fillStyle = 'rgba(243,241,234,0.16)'; g.fillText('.', x, y); continue; }
    // dark ink on a dark page would vanish: lift dark colours toward a warm light tone, keep saturated ones
    const lift = sat > 0.25 ? 0.15 : 0.62;
    const R = r + (236 - r) * lift, G = gr + (226 - gr) * lift, B = b + (206 - b) * lift;
    g.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${0.45 + ink * 0.55})`;
    g.fillText(glyph, x, y);
  }
  // fade the top so the header reads
  const top = g.createLinearGradient(0, 0, 0, 460);
  top.addColorStop(0, 'rgba(18,18,17,1)');
  top.addColorStop(0.45, 'rgba(18,18,17,0.96)');
  top.addColorStop(1, 'rgba(18,18,17,0)');
  g.fillStyle = top;
  g.fillRect(0, 0, W, 460);
  // fade the left side so the heading reads
  const fade = g.createLinearGradient(0, 0, W * 0.62, 0);
  fade.addColorStop(0, 'rgba(18,18,17,1)');
  fade.addColorStop(0.55, 'rgba(18,18,17,0.92)');
  fade.addColorStop(1, 'rgba(18,18,17,0)');
  g.fillStyle = fade;
  g.fillRect(0, 0, W, H);
  return c.toDataURL('image/png');
}, home);
fs.writeFileSync(path.join(dir, 'img/cover-ascii.png'), Buffer.from(ascii.split(',')[1], 'base64'));
await baker.close();

const page = await browser.newPage({ viewport: { width: 1280, height: 905 } });
await page.goto(`file://${path.join(dir, 'guide.html')}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const out = path.join(dir, 'noon-flow-kit-guide.pdf');
await page.pdf({ path: out, width: '1280px', height: '905px', printBackground: true, preferCSSPageSize: true });

if (pngDir) {
  fs.mkdirSync(pngDir, { recursive: true });
  const pages = await page.$$('.page');
  for (const [i, el] of pages.entries()) await el.screenshot({ path: path.join(pngDir, `page-${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
console.log(`✔ ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB)`);
