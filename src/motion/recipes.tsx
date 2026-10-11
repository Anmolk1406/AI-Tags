import { animate, motion, useInView, useMotionValue, useTransform, type HTMLMotionProps } from 'motion/react';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { duration, easing, spring } from './presets';
import { palette } from '../foundations/palette';

/**
 * Drop-in animation recipes for prototypes. Wrap any element:
 *   <FadeIn delay={0.2}>…</FadeIn>   <Stagger>{items}</Stagger>   <CountUp to={1299} />
 * All timings come from ./presets so the whole kit shares one motion language.
 */

export function FadeIn({ children, delay = 0, y = 12, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.medium, ease: easing.out, delay }} {...rest}>
      {children}
    </motion.div>
  );
}

/** Staggers children in (PLP cards: rise 16px, 35ms stagger, spring 380/39). */
export function Stagger({ children, gap = 0.035, y = 16, max = 8, className, style }: { children: ReactNode; gap?: number; y?: number; max?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      {Children.map(children, (c, i) => (
        <motion.div initial={i < max ? { opacity: 0, y } : false} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 39, delay: Math.min(i, max) * gap }}>
          {c}
        </motion.div>
      ))}
    </div>
  );
}

/** Reveal when scrolled into view. */
export function Reveal({ children, y = 20 }: { children: ReactNode; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: duration.slow, ease: easing.out }}>
      {children}
    </motion.div>
  );
}

/** Bouncy pop-in (badges, success ticks). */
export function Pop({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.bouncy, delay }} style={{ display: 'inline-flex' }}>
      {children}
    </motion.div>
  );
}

/** Animated number (prices, savings, counters). */
export function CountUp({ to, from = 0, durationS = 0.9, format = (n: number) => Math.round(n).toLocaleString('en-US') }: { to: number; from?: number; durationS?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(from);
  const text = useTransform(mv, format);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: durationS, ease: easing.out });
    return () => c.stop();
  }, [inView, to, durationS, mv]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

/** Text shimmer sweep (checkout "Slide to Order" label, AI summary titles). */
export function ShimmerText({ children, base = palette.kitBlue66, highlight = palette.kitBlue91, durationS = 4 }: { children: ReactNode; base?: string; highlight?: string; durationS?: number }) {
  return (
    <motion.span
      style={{
        backgroundImage: `linear-gradient(90deg, ${base} 30%, ${highlight} 50%, ${base} 70%)`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      animate={{ backgroundPosition: ['100% 0', '0% 0'] }}
      transition={{ duration: durationS, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  );
}

/** Confetti burst — trigger by changing `fireKey`. */
export function Confetti({ fireKey, count = 28, colors = [palette.yellowColor, palette.primaryBlue, palette.pink600, palette.greenOff, palette.absoluteApricot] }: { fireKey: number | string; count?: number; colors?: string[] }) {
  const [pieces, setPieces] = useState<{ id: string; x: number; y: number; r: number; c: string }[]>([]);
  useEffect(() => {
    if (!fireKey) return;
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: `${fireKey}-${i}`,
        x: (Math.random() - 0.5) * 320,
        y: -120 - Math.random() * 220,
        r: Math.random() * 540 - 270,
        c: colors[i % colors.length],
      })),
    );
    const t = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireKey]);
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 999 }}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 420], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, ease: 'easeOut', times: [0, 0.35, 1] }}
          style={{ position: 'absolute', width: 8, height: 12, borderRadius: 2, background: p.c }}
        />
      ))}
    </div>
  );
}

/** Gentle infinite float (empty states, mascots). */
export function Float({ children, amplitude = 8, durationS = 3 }: { children: ReactNode; amplitude?: number; durationS?: number }) {
  return (
    <motion.div animate={{ y: [0, -amplitude, 0] }} transition={{ duration: durationS, repeat: Infinity, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
}
