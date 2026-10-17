import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useScreenActive } from './Navigator';

/**
 * Mounts its children one beat after the screen appears, so a long page (PDP, Deals, the home feed) paints its first
 * viewport on the push frame and the rest arrives below the fold while the transition is still running. Measured:
 * mounting a storefront PDP in one go held the main thread 270–350 ms at 4× CPU, a visible freeze at the start of
 * the slide; the sections under the fold are not seen until the user scrolls anyway.
 *
 * `minHeight` keeps the page's scroll range stable until the content lands. `delayMs` is the beat: the default waits for
 * the push to settle (ios 0.42 s) and then takes the next idle slot.
 */
export function Deferred({ children, minHeight = 0, delayMs = 450, style }: { children: ReactNode; minHeight?: number | string; delayMs?: number; style?: CSSProperties }) {
  const [ready, setReady] = useState(false);
  const active = useScreenActive();
  useEffect(() => {
    if (ready) return;
    const ric = typeof window.requestIdleCallback === 'function' ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 400 }) : (cb: () => void) => window.setTimeout(cb, 0);
    const cancel = typeof window.cancelIdleCallback === 'function' ? (id: number) => window.cancelIdleCallback(id) : (id: number) => window.clearTimeout(id);
    let idle = 0;
    const t = window.setTimeout(() => {
      idle = ric(() => setReady(true));
    }, delayMs);
    return () => {
      window.clearTimeout(t);
      if (idle) cancel(idle);
    };
  }, [ready, delayMs, active]);
  return ready ? <>{children}</> : <div aria-hidden style={{ minHeight, ...style }} />;
}
