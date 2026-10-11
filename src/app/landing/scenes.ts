import type { AsciiScene } from './AsciiCanvas';

/* Source scenes for AsciiCanvas. They're painted small and turned into glyphs,
   so only light matters: soft shapes, gradients and glow read best. */

const TAU = Math.PI * 2;

const rand = (seed: number) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

const puffs = (() => {
  const r = rand(42);
  return Array.from({ length: 320 }, () => ({ a: r() * TAU, d: r(), s: r(), p: r() * TAU }));
})();

const streaks = (() => {
  const r = rand(5);
  return Array.from({ length: 90 }, () => ({ a: r() * TAU, l: 0.3 + r() * 0.7, hue: r() * 360, w: r() }));
})();

/** Heart curve point at angle a, unit-ish size, y down. */
const heart = (a: number) => {
  const s = Math.sin(a);
  return [16 * s * s * s / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 17] as const;
};

/** Looking up through an iridescent cloud ring into open sky. */
export const portal: AsciiScene = (ctx, w, h, t) => {
  const cx = w * 0.5;
  const cy = h * 0.52;
  const size = Math.min(w * 0.3, h * 0.36) * (1 + Math.sin(t * 0.5) * 0.02);

  ctx.fillStyle = '#04070d';
  ctx.fillRect(0, 0, w, h);

  // Deep blue cloud wall, then sky through the heart-shaped opening.
  const wall = ctx.createRadialGradient(cx, cy, size, cx, cy, Math.hypot(w, h) * 0.55);
  wall.addColorStop(0, '#1d3d5c');
  wall.addColorStop(1, '#04070d');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);
  const hole = new Path2D();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * TAU;
    const [hx, hy] = heart(a);
    const wob = 1 + 0.035 * Math.sin(a * 23 + t * 1.5) + 0.02 * Math.sin(a * 51 - t);
    i ? hole.lineTo(cx + hx * size * wob, cy + hy * size * wob) : hole.moveTo(cx + hx * size * wob, cy + hy * size * wob);
  }
  const sky = ctx.createRadialGradient(cx - size * 0.2, cy - size * 0.3, 0, cx, cy, size * 1.1);
  sky.addColorStop(0, '#eef9ff');
  sky.addColorStop(0.55, '#a9d6ec');
  sky.addColorStop(1, '#6aa3c4');
  ctx.fillStyle = sky;
  ctx.fill(hole);

  // Radial zoom streaks in spectral colours.
  ctx.globalCompositeOperation = 'lighter';
  for (const s of streaks) {
    const a = s.a + t * 0.03;
    const r0 = size * 1.05;
    const r1 = r0 + Math.hypot(w, h) * 0.5 * s.l;
    ctx.strokeStyle = `hsla(${(s.hue + t * 20) % 360},90%,60%,${0.08 + s.w * 0.12})`;
    ctx.lineWidth = 6 + s.w * 18;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }

  // Cloud ring: soft puffs hugging the heart's edge, brighter on the inside rim.
  for (const p of puffs) {
    const [hx, hy] = heart(p.a);
    const breathe = 1 + Math.sin(t * 0.7 + p.p) * 0.04;
    const out = 1 + p.d ** 1.6 * 0.7;
    const x = cx + hx * size * out * breathe;
    const y = cy + hy * size * out * breathe;
    const r = size * (0.05 + p.s * 0.12) * (1.2 - p.d * 0.5);
    const hue = (p.a * 57 + t * 25 + p.d * 120) % 360;
    const rim = 1 - p.d;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, p.s > 0.6 ? `hsla(${hue},100%,62%,${0.5 * rim + 0.12})` : `rgba(215,240,255,${0.55 * rim + 0.06})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // A shaft of light from the top left.
  const beam = ctx.createLinearGradient(w * 0.2, 0, cx, cy);
  beam.addColorStop(0, 'rgba(255,255,255,0.35)');
  beam.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(w * 0.18 + Math.sin(t * 0.3) * 10, 0);
  ctx.lineTo(w * 0.27, 0);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
  const edge = ctx.createRadialGradient(cx, cy, size * 1.2, cx, cy, Math.hypot(w, h) * 0.6);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
};

const sky = (() => {
  const r = rand(77);
  return Array.from({ length: 260 }, () => ({ x: r(), y: r() * 0.62, s: 0.6 + r() * 2.2, p: r() * TAU, warm: r() > 0.6 }));
})();

const blooms = (() => {
  const r = rand(91);
  return Array.from({ length: 70 }, () => ({ side: r() < 0.5 ? -1 : 1, u: r(), v: r(), s: r(), orange: r() > 0.62 }));
})();

function column(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, width: number, lightFromRight: boolean, shade = 1) {
  // shaft: lit on the inner side, flutes as vertical stripes
  const g = ctx.createLinearGradient(x, 0, x + width, 0);
  const lit = `rgba(${236 * shade},${214 * shade},${182 * shade},1)`;
  const dark = `rgba(${70 * shade},${58 * shade},${52 * shade},1)`;
  g.addColorStop(0, lightFromRight ? dark : lit);
  g.addColorStop(1, lightFromRight ? lit : dark);
  ctx.fillStyle = g;
  ctx.fillRect(x, top, width, bottom - top);
  const flutes = 7;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  for (let i = 0; i < flutes; i++) ctx.fillRect(x + ((i + 0.65) / flutes) * width, top, width * 0.045, bottom - top);
  // capital and base
  ctx.fillStyle = lit;
  ctx.fillRect(x - width * 0.14, top - width * 0.22, width * 1.28, width * 0.22);
  ctx.fillStyle = `rgba(${200 * shade},${178 * shade},${150 * shade},1)`;
  ctx.fillRect(x - width * 0.08, top, width * 1.16, width * 0.1);
  ctx.fillRect(x - width * 0.12, bottom - width * 0.14, width * 1.24, width * 0.14);
}

/** Night sky over a stair to a lit rotunda, framed by fluted columns and blossoms. */
export const temple: AsciiScene = (ctx, w, h, t) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#02040d');
  bg.addColorStop(0.55, '#0c2050');
  bg.addColorStop(0.8, '#1a3a70');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  // milky way
  for (let i = 0; i < 40; i++) {
    const u = i / 40;
    const x = w * (0.15 + u * 0.8);
    const y = h * (0.55 - u * 0.45) + Math.sin(u * 9) * h * 0.03;
    const r = h * 0.09;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(120,150,230,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (const s of sky) {
    const a = 0.35 + 0.65 * Math.sin(t * 1.4 + s.p) ** 2;
    ctx.fillStyle = s.warm ? `rgba(255,200,120,${a})` : `rgba(230,240,255,${a})`;
    ctx.fillRect(s.x * w, s.y * h, s.s * 2.4, s.s * 2.4);
  }

  // temple glow at the top of the stair
  const cx = w * 0.5;
  const top = h * 0.6;
  const glow = ctx.createRadialGradient(cx, top - h * 0.05, 0, cx, top - h * 0.05, w * 0.32);
  glow.addColorStop(0, 'rgba(255,190,120,0.55)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  // rotunda
  const rw = w * 0.2;
  ctx.fillStyle = '#d9b48a';
  ctx.fillRect(cx - rw * 0.62, top - h * 0.24, rw * 1.24, h * 0.03);
  for (let i = 0; i < 5; i++) column(ctx, cx - rw * 0.55 + (i / 4) * rw * 1.02, top - h * 0.21, top, rw * 0.075, i < 2, 0.85);

  // stair: steps widen and deepen toward the viewer
  const steps = 18;
  for (let i = 0; i < steps; i++) {
    const a = i / steps;
    const b = (i + 1) / steps;
    const y0 = top + (h - top) * a ** 1.35;
    const y1 = top + (h - top) * b ** 1.35;
    const half0 = w * (0.07 + a * 0.33);
    const half1 = w * (0.07 + b * 0.33);
    const tread = y0 + (y1 - y0) * 0.38;
    ctx.fillStyle = `rgb(${240 - a * 40},${220 - a * 50},${190 - a * 60})`;
    ctx.beginPath();
    ctx.moveTo(cx - half0, y0);
    ctx.lineTo(cx + half0, y0);
    ctx.lineTo(cx + half1, tread);
    ctx.lineTo(cx - half1, tread);
    ctx.fill();
    ctx.fillStyle = `rgb(${120 - a * 50},${95 - a * 45},${75 - a * 40})`;
    ctx.fillRect(cx - half1, tread, half1 * 2, y1 - tread);
  }

  // foreground columns, inner pair then outer pair
  column(ctx, w * 0.17, h * 0.2, h * 0.86, w * 0.075, true, 0.9);
  column(ctx, w * 0.755, h * 0.2, h * 0.86, w * 0.075, false, 0.9);
  column(ctx, -w * 0.01, h * 0.06, h * 1.0, w * 0.12, true, 1);
  column(ctx, w * 0.89, h * 0.06, h * 1.0, w * 0.12, false, 1);

  // blossoms at the base, swaying
  ctx.globalCompositeOperation = 'lighter';
  for (const f of blooms) {
    const x = (f.side < 0 ? f.u * 0.36 : 1 - f.u * 0.36) * w + Math.sin(t * 0.8 + f.v * 6) * 3;
    const y = h * (0.82 + f.v * 0.2);
    const r = h * (0.025 + f.s * 0.05);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, f.orange ? 'rgba(255,110,50,0.75)' : 'rgba(255,245,230,0.7)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
};
