import { useEffect, useRef } from 'react';
import { cn, useReducedMotion } from 'lightweight-ui';

/** Paints a source frame in CSS pixels (w × h). t is seconds since mount. */
export type AsciiScene = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

interface AsciiCanvasProps {
  scene: AsciiScene;
  /** Row height in CSS px; a column is ~0.6 of it (monospace advance). */
  cell?: number;
  /** Dark → light. The first glyph is never drawn. */
  ramp?: string;
  /** Tint every glyph with its source pixel (otherwise white, alpha by luminance). */
  color?: boolean;
  /** Per-cell luminance jitter, so dense areas sparkle like particles. */
  grain?: number;
  fps?: number;
  /** Opacity of a soft, upscaled copy of the source drawn under the glyphs. */
  glow?: number;
  className?: string;
  label: string;
}

/**
 * ascii-magic style renderer (ascii-magic.com): every frame the scene is drawn
 * small, sampled one pixel per character cell, and re-drawn as glyphs whose
 * density follows the pixel's luminance. Pauses while off-screen; one still
 * frame under reduced motion.
 */
export function AsciiCanvas({
  scene,
  cell = 9,
  ramp = ' .·:-=+*#%@',
  color = false,
  grain = 0.12,
  fps = 24,
  glow = 0,
  className,
  label,
}: AsciiCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const src = document.createElement('canvas');
    const sctx = src.getContext('2d', { willReadFrequently: true })!;
    const glyphs = [...ramp];
    const cw = cell * 0.6;
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let visible = true;
    let last = -Infinity;
    const start = performance.now();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(W / cw));
      rows = Math.max(1, Math.floor(H / cell));
      src.width = cols;
      src.height = rows;
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      sctx.setTransform(cols / W, 0, 0, rows / H, 0, 0);
      sctx.globalCompositeOperation = 'source-over';
      sctx.globalAlpha = 1;
      scene(sctx, W, H, t);
      const px = sctx.getImageData(0, 0, cols, rows).data;
      const frame = Math.floor(t * 8);

      ctx.clearRect(0, 0, W, H);
      if (glow) {
        ctx.globalAlpha = glow;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      ctx.font = `500 ${cell}px "Geist Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = 'top';
      const n = glyphs.length - 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = px[i];
          const g = px[i + 1];
          const b = px[i + 2];
          let l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          if (grain) l += (hash(x, y, frame) - 0.5) * grain * (0.3 + l);
          if (l < 0.045) continue;
          const k = Math.min(n, Math.max(1, Math.round(l * n)));
          if (color) {
            const m = 255 / Math.max(r, g, b, 1);
            const lift = Math.min(1, 0.55 + l);
            ctx.fillStyle = `rgb(${(r * m * lift) | 0},${(g * m * lift) | 0},${(b * m * lift) | 0})`;
          } else {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(1, 0.25 + l * 0.9).toFixed(2)})`;
          }
          ctx.fillText(glyphs[k], x * cw, y * cell);
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / fps) return;
      last = now;
      draw(now);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    document.fonts?.ready.then(() => draw(performance.now()));

    if (reduced) draw(start + 4000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [scene, cell, ramp, color, grain, fps, glow, reduced]);

  return <canvas ref={ref} role="img" aria-label={label} className={cn('block h-full w-full', className)} />;
}

function hash(x: number, y: number, f: number) {
  let h = (x * 374761393 + y * 668265263 + f * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
