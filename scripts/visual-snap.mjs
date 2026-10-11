// Visual regression helper: screenshots every registered route's phone into a folder, or diffs two folders.
// Usage (dev server on :5180):  node scripts/visual-snap.mjs snap <dir>     |   node scripts/visual-snap.mjs diff <dirA> <dirB>
import { chromium } from 'playwright';
import fs from 'node:fs';
const [mode, a, b] = process.argv.slice(2);
const base = `http://localhost:${process.env.PORT ?? 5180}/`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, reducedMotion: 'reduce' });
if (mode === 'snap') {
  fs.mkdirSync(a, { recursive: true });
  await page.goto(base);
  await page.waitForTimeout(800);
  const routes = await page.evaluate(() => window.__NK_ROUTES__);
  for (const r of routes) {
    await page.goto(`${base}#/${r}`);
    await page.reload();
    await page.waitForTimeout(2200);
    await page.locator('.pg-stage').screenshot({ path: `${a}/${r.replace('/', '__')}.png`, animations: 'disabled' });
  }
  console.log(`${routes.length} routes → ${a}`);
} else if (mode === 'diff') {
  const files = fs.readdirSync(a).filter((f) => f.endsWith('.png'));
  let changed = 0;
  for (const f of files) {
    if (!fs.existsSync(`${b}/${f}`)) { console.log(`MISSING ${f}`); changed++; continue; }
    const res = await page.evaluate(async ([x, y]) => {
      const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = s; });
      const [p, q] = await Promise.all([load(x), load(y)]);
      if (p.width !== q.width || p.height !== q.height) return -1;
      const px = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
      const d1 = px(p), d2 = px(q); let n = 0;
      for (let k = 0; k < d1.length; k += 4) if (Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]) > 40) n++;
      return n;
    }, [`data:image/png;base64,${fs.readFileSync(`${a}/${f}`).toString('base64')}`, `data:image/png;base64,${fs.readFileSync(`${b}/${f}`).toString('base64')}`]);
    if (res !== 0) { changed++; console.log(`${res === -1 ? 'SIZE' : String(res).padStart(6) + 'px'}  ${f}`); }
  }
  console.log(`${files.length - changed}/${files.length} identical`);
}
await browser.close();
