import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getTransition as getTransitionRaw, reducedTransition, type TransitionName } from '../motion/transitions';
import { duration, easing, spring } from '../motion/presets';
import { useReduceMotion } from '../motion/reducedMotion';
import { TokenScope } from '../foundations/ThemeProvider';
import { TabBar } from '../components/TabBar/TabBar';
import { preloadScreens } from './lazyScreen';
import { resolveSheet, SheetCtx } from './sheet';
import type { Registry } from './registry';
import type { NavigateOptions, Route, StackEntry, TabId, ToastOptions } from './types';
import styles from './Navigator.module.css';

interface Toast extends ToastOptions {
  id: number;
  message: string;
}

export interface NavApi {
  /** open a screen on top of the stack. `route` = 'flow/screen' | 'screen' (same flow) | 'flow' */
  push: (route: Route, params?: Record<string, unknown>, opts?: NavigateOptions) => void;
  replace: (route: Route, params?: Record<string, unknown>, opts?: NavigateOptions) => void;
  /** open a screen as a bottom sheet */
  sheet: (route: Route, params?: Record<string, unknown>) => void;
  back: () => void;
  popToRoot: () => void;
  /** wipe the stack and start from `route` (used by tab bar + playground) */
  reset: (route: Route, params?: Record<string, unknown>) => void;
  switchTab: (tab: TabId) => void;
  toast: (message: string, opts?: ToastOptions) => void;
  canGoBack: boolean;
  /** route + params of the screen this hook is called from */
  route: Route;
  params: Record<string, unknown>;
  flowId: string;
  /** true when this screen is the bottom of the stack (i.e. a tab root showing the tab bar) */
  isRoot: boolean;
  stack: StackEntry[];
}

const NavCtx = createContext<{ api: Omit<NavApi, 'route' | 'params' | 'flowId' | 'isRoot'>; registry: Registry } | null>(null);
const EntryCtx = createContext<StackEntry | null>(null);

export const TAB_ROUTES: Record<TabId, Route> = {
  home: 'home/home',
  categories: 'categories/categories',
  deals: 'deals/deals',
  account: 'account/account',
  cart: 'cart/cart',
};

let keySeq = 0;
const nextKey = () => `e${++keySeq}`;

export function useNav(): NavApi {
  const nav = useContext(NavCtx);
  const entry = useContext(EntryCtx);
  if (!nav) throw new Error('useNav must be used inside <NoonPrototype>');
  return {
    ...nav.api,
    route: entry?.route ?? '',
    params: entry?.params ?? {},
    flowId: entry?.route.split('/')[0] ?? '',
    isRoot: !!entry && nav.api.stack[0]?.key === entry.key,
  };
}

/** Typed params helper: `const { productId } = useParams<{ productId: string }>()` */
export function useParams<P>() {
  return useNav().params as P;
}

interface NavigatorProps {
  registry: Registry;
  initialRoute: Route;
  initialParams?: Record<string, unknown>;
  onChange?: (stack: StackEntry[]) => void;
  /** change this to force-reset the navigator from outside (playground sidebar) */
  resetSignal?: { route: Route; params?: Record<string, unknown>; nonce: number };
  overlay?: ReactNode;
}

export function Navigator({ registry, initialRoute, initialParams, onChange, resetSignal, overlay }: NavigatorProps) {
  const makeEntry = useCallback(
    (route: Route, params: Record<string, unknown> = {}, opts: NavigateOptions = {}, currentFlow?: string): StackEntry | null => {
      const resolved = registry.resolve(route, currentFlow);
      if (!resolved) {
        console.warn(`[noon-flow-kit] Unknown route "${route}". Registered:`, registry.all().map((r) => r.route));
        return null;
      }
      const presentation = opts.presentation ?? resolved.screen.presentation ?? 'screen';
      const transition: TransitionName =
        opts.transition ?? resolved.screen.transition ?? (presentation === 'sheet' ? 'sheet' : presentation === 'modal' ? 'modal' : 'push');
      return {
        key: nextKey(),
        route: resolved.route,
        params: { ...(resolved.screen.defaultParams ?? {}), ...params },
        presentation,
        transition,
      };
    },
    [registry],
  );

  /** A fresh stack for `route`. Sheets/modals get their flow's backing screen underneath (or `flow.sheetBackdrop`). */
  const rootStack = useCallback(
    (route: Route, params: Record<string, unknown> = {}, transition: TransitionName): StackEntry[] => {
      const e = makeEntry(route, params, { transition });
      if (!e) return [];
      if (e.presentation === 'screen') return [e];
      const flow = registry.resolve(e.route)!.flow;
      const backing = makeEntry(flow.sheetBackdrop ?? `${flow.id}/${flow.initial}`, params, { transition });
      return backing && backing.presentation === 'screen' && backing.route !== e.route ? [backing, e] : [{ ...e, presentation: 'screen' }];
    },
    [makeEntry, registry],
  );

  const [stack, setStack] = useState<StackEntry[]>(() => rootStack(initialRoute, initialParams, 'none'));
  const [instantExit, setInstantExit] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => onChange?.(stack), [stack, onChange]);
  // after the first screen is up, fetch the other lazy screens in idle time so pushes don't wait on a download
  useEffect(() => preloadScreens(), []);

  const currentFlow = () => stackRef.current.at(-1)?.route.split('/')[0];

  const push = useCallback<NavApi['push']>(
    (route, params, opts) => {
      const e = makeEntry(route, params, opts, currentFlow());
      if (e) {
        setInstantExit(false);
        setStack((s) => [...s, e]);
      }
    },
    [makeEntry],
  );
  const replace = useCallback<NavApi['replace']>(
    (route, params, opts) => {
      const e = makeEntry(route, params, { transition: 'fade', ...opts }, currentFlow());
      if (e) {
        setInstantExit(true);
        setStack((s) => [...s.slice(0, -1), e]);
      }
    },
    [makeEntry],
  );
  const sheet = useCallback<NavApi['sheet']>((route, params) => push(route, params, { presentation: 'sheet' }), [push]);
  /** Logical parent for a screen opened with no history (direct URL / sidebar / reload): screen.parent → flow.parent → home; tab roots have none. */
  const parentOf = useCallback(
    (route: Route): Route | undefined => {
      const r = registry.resolve(route);
      if (!r) return undefined;
      const isTabRoot = r.flow.tabBar?.screens.includes(r.screen.id);
      const parent = r.screen.parent ?? r.flow.parent ?? (isTabRoot ? undefined : 'home/home');
      return parent && registry.resolve(parent)?.route !== r.route ? parent : undefined;
    },
    [registry],
  );
  const back = useCallback(() => {
    setInstantExit(false);
    const s = stackRef.current;
    if (s.length > 1) {
      setStack(s.slice(0, -1));
      return;
    }
    // Nothing to pop: slide the logical parent in underneath, then pop so the normal back transition plays.
    const top = s[0];
    const parent = top && parentOf(top.route);
    const below = parent && makeEntry(parent, {}, { transition: 'none' });
    if (!top || !below) return;
    setStack([below, top]);
    requestAnimationFrame(() => setStack([below]));
  }, [makeEntry, parentOf]);
  const popToRoot = useCallback(() => {
    setInstantExit(false);
    setStack((s) => s.slice(0, 1));
  }, []);
  const reset = useCallback<NavApi['reset']>(
    (route, params) => {
      const next = rootStack(route, params, 'fade');
      if (next.length) {
        setInstantExit(true);
        setStack(next);
      }
    },
    [rootStack],
  );
  const switchTab = useCallback((tab: TabId) => {
    const target = TAB_ROUTES[tab];
    if (stackRef.current.length === 1 && stackRef.current[0].route === target) return;
    const e = makeEntry(target, {}, { transition: 'none' });
    if (e) {
      setInstantExit(true);
      setStack([e]);
    }
  }, [makeEntry]);

  const toast = useCallback<NavApi['toast']>((message, opts = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-1), { id, message, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration ?? 2600);
  }, []);

  useEffect(() => {
    if (resetSignal) reset(resetSignal.route, resetSignal.params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal?.nonce]);

  // reduced motion: screens cross-fade instead of sliding / scaling (motion/react would only make the movement instant)
  const reduce = useReduceMotion();
  const getTransition = (name: TransitionName) => (reduce ? reducedTransition(getTransitionRaw(name)) : getTransitionRaw(name));

  const api = useMemo(
    () => ({ push, replace, sheet, back, popToRoot, reset, switchTab, toast, canGoBack: stack.length > 1 || !!(stack[0] && parentOf(stack[0].route)), stack }),
    [push, replace, sheet, back, popToRoot, reset, switchTab, toast, stack, parentOf],
  );

  // for each screen entry, find the next *screen/modal* entry above it — that one's `under` styles apply
  const coveredBy = (i: number) => {
    for (let j = i + 1; j < stack.length; j++) if (stack[j].presentation !== 'sheet') return stack[j];
    return undefined;
  };

  return (
    <NavCtx.Provider value={{ api, registry }}>
      <div className={styles.root}>
        <AnimatePresence initial={false} custom={instantExit}>
          {stack.map((entry, i) => {
            const resolved = registry.resolve(entry.route)!;
            const Screen = resolved.screen.component;
            const t = getTransition(entry.transition);
            const isTop = i === stack.length - 1;
            const content = (
              <EntryCtx.Provider value={entry}>
                <TokenScope overrides={resolved.flow.tokens}>
                  {/* screens load on demand (lazyScreen); the rest are preloaded in idle time after the first paint */}
                  <Suspense fallback={null}>
                    <Screen params={entry.params} />
                  </Suspense>
                </TokenScope>
              </EntryCtx.Provider>
            );

            if (entry.presentation === 'sheet') {
              return <SheetLayer key={entry.key} options={resolveSheet(resolved.screen.sheet)} onDismiss={back} isTop={isTop} zIndex={i} reduce={reduce}>{content}</SheetLayer>;
            }

            const cover = coveredBy(i);
            const under = cover ? getTransition(cover.transition).under : undefined;
            const tab = i === 0 && resolved.flow.tabBar?.screens.includes(resolved.screen.id) ? resolved.flow.tabBar.tab : undefined;

            return (
              <motion.div
                key={entry.key}
                className={styles.screen}
                custom={instantExit}
                variants={{
                  initial: t.initial,
                  shown: { ...t.animate, x: (t.animate as { x?: number }).x ?? 0, scale: 1, filter: 'brightness(1)', borderRadius: 0 },
                  covered: { ...(under ?? {}), transition: cover ? getTransition(cover.transition).transition : t.transition },
                  exit: (instant: boolean) => (instant ? { opacity: 0, transition: { duration: 0.12 } } : { ...t.exit, transition: t.transition }),
                }}
                initial="initial"
                animate={under ? 'covered' : 'shown'}
                exit="exit"
                transition={t.transition}
                style={{ zIndex: i, pointerEvents: isTop ? 'auto' : 'none' }}
                // a covered screen is out of the tab order and the accessibility tree (the sheet / screen on top is modal)
                inert={!isTop}
                data-route={entry.route}
              >
                <div className={styles.screenBody}>{content}</div>
                {tab && <TabBar active={tab} />}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className={styles.toastLayer}>
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                className={styles.toast}
                data-tone={t.tone ?? 'default'}
                initial={{ y: 40, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={spring.sheet}
                layout
              >
                {t.icon}
                <span className={styles.toastText}>{t.message}</span>
                {t.action && (
                  <button className={styles.toastAction} onClick={t.action.onPress}>
                    {t.action.label}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {overlay}
      </div>
    </NavCtx.Provider>
  );
}

function SheetLayer({ children, options, onDismiss, isTop, zIndex, reduce }: { children: ReactNode; options: ReturnType<typeof resolveSheet>; onDismiss: () => void; isTop: boolean; zIndex: number; reduce: boolean }) {
  const drag = useDragControls();
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onDismiss();
  };
  const origin = options.layout === 'origin';
  const ctx = useMemo(() => ({ layout: options.layout, grabber: options.grabber, dismiss: onDismiss }), [options.layout, options.grabber, onDismiss]);
  const grabber = options.grabber && (
    <div className={origin ? styles.originGrabberZone : styles.grabberZone} onPointerDown={(e) => drag.start(e)}>
      <div className={origin ? styles.originGrabber : styles.grabber} />
    </div>
  );
  return (
    <motion.div className={styles.sheetLayer} style={{ pointerEvents: isTop ? 'auto' : 'none', zIndex }} inert={!isTop} role="dialog" aria-modal={isTop} initial="hidden" animate="shown" exit="hidden">
      <motion.div
        className={origin ? styles.originScrim : styles.scrim}
        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
        transition={{ duration: 0.25 }}
        onClick={options.dismissible ? onDismiss : undefined}
      />
      <motion.div
        className={origin ? styles.originColumn : styles.sheet}
        // reduced motion: the sheet fades in place with its scrim instead of rising (dragging still works)
        variants={reduce ? { hidden: { opacity: 0 }, shown: { opacity: 1 } } : { hidden: { y: '100%' }, shown: { y: 0 } }}
        transition={reduce ? { duration: duration.base, ease: easing.standard } : spring.sheet}
        drag={options.grabber ? 'y' : false}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.8 }}
        onDragEnd={onDragEnd}
        data-sheet={options.layout}
      >
        <SheetCtx.Provider value={ctx}>
          {grabber}
          {origin ? (
            // Origin M-BottomSheet: grabber + home-indicator gap sit outside the sheet body; the body holds only the
            // Header / Body / Footer slots (<SheetHeader> <SheetBody> <SheetFooter>)
            <div className={styles.originSheet} style={options.surface ? { background: options.surface } : undefined}>
              {children}
            </div>
          ) : (
            children
          )}
        </SheetCtx.Provider>
      </motion.div>
    </motion.div>
  );
}
