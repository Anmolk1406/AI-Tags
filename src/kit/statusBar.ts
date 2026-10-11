import { createContext, useContext, useEffect } from 'react';
import { useNav } from './Navigator';

export type StatusBarTone = 'dark' | 'light';

/** NoonPrototype's per-route status-bar overrides (set by `useStatusBar`). */
export const StatusBarCtx = createContext<((route: string, tone: StatusBarTone | undefined) => void) | null>(null);

/**
 * Override the status-bar ink while this screen is on top, e.g. a page whose header turns dark at runtime
 * (home department tabs). `undefined` falls back to `ScreenDef.statusBar` (default 'dark'). Cleared on unmount.
 */
export function useStatusBar(tone: StatusBarTone | undefined) {
  const set = useContext(StatusBarCtx);
  const { route } = useNav();
  useEffect(() => {
    if (!set) return;
    set(route, tone);
    return () => set(route, undefined);
  }, [set, route, tone]);
}
