import { lazy, type ComponentType } from 'react';
import type { ScreenProps } from './types';

type Loader = () => Promise<Record<string, unknown>>;
const loaders: Loader[] = [];

/**
 * A screen component loaded on demand: `component: lazyScreen(() => import('./DetailScreen'), 'DetailScreen')`.
 * Only the screens a page shows are in its first download; the Navigator renders screens inside <Suspense>,
 * and `preloadScreens()` fetches the rest in idle time so later navigation is instant.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyScreen<P = any>(load: Loader, name: string): ComponentType<ScreenProps<P>> & { preload: () => Promise<unknown> } {
  // one shared promise: preload() and the first render reuse the same download
  let pending: Promise<Record<string, unknown>> | undefined;
  const once = () => (pending ??= load());
  loaders.push(once);
  const C = lazy(() => once().then((m) => ({ default: m[name] as ComponentType<ScreenProps<P>> })));
  return Object.assign(C, { preload: once });
}

/**
 * Fetch the screens a page is about to open, now, so the hand-off never shows an empty <Suspense> frame
 * (e.g. search → results: SearchScreen preloads plp/listing and pdp/detail on mount).
 */
export function preloadRoutes(...loads: Array<() => Promise<unknown>>) {
  for (const load of loads) load().catch(() => undefined);
}

let started = false;
/** Fetch every lazy screen, one per idle slot, after the first screen has painted. */
export function preloadScreens() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const idle: (cb: () => void) => void = 'requestIdleCallback' in window ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 }) : (cb) => setTimeout(cb, 200);
  const queue = loaders.slice();
  const next = () => {
    const load = queue.shift();
    if (!load) return;
    load().finally(() => idle(next));
  };
  setTimeout(() => idle(next), 1500);
}
