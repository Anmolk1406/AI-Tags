import { useEffect, useRef } from 'react';
import { useScreenActive } from '../kit/Navigator';

/**
 * A repeating tick for the auto-rotating bits of a screen (USP tickers, nudge flippers, countdowns, banner autoplay).
 * It runs only while the screen is the top of the stack and the tab is visible: a timer on a screen under a push or a
 * sheet, or in a background tab, re-rendered its carousel every few seconds for nobody — measured, the cart and the
 * PDP kept 50+ of these alive under whatever was on top. `cb` is read fresh on every tick, so pass it inline.
 */
export function useInterval(ms: number, cb: () => void, enabled = true) {
  const active = useScreenActive();
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!enabled || !active || ms <= 0) return;
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const start = () => {
      stop();
      if (!document.hidden) id = window.setInterval(() => ref.current(), ms);
    };
    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', start);
    };
  }, [ms, enabled, active]);
}

/**
 * A one-shot delay that re-arms whenever `key` changes (the pattern of a ticker whose wait depends on its step), gated
 * like `useInterval`: nothing fires while the screen is covered or the tab hidden.
 */
export function useStepTimeout(ms: number, cb: () => void, key: unknown, enabled = true) {
  const active = useScreenActive();
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!enabled || !active || ms <= 0) return;
    const id = window.setTimeout(() => !document.hidden && ref.current(), ms);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is the re-arm trigger
  }, [ms, enabled, active, key]);
}
