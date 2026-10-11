import { MotionConfig } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { NoonThemeProvider } from '../foundations/ThemeProvider';
import type { TokenOverrides } from '../foundations/tokens';
import { DemoStoreProvider } from './DemoStore';
import { Navigator } from './Navigator';
import { PhoneFrame } from './PhoneFrame';
import { StatusBarCtx, type StatusBarTone } from './statusBar';
import { createRegistry } from './registry';
import type { FlowDef, Route, StackEntry } from './types';
import '../foundations/global.css';

export interface NoonPrototypeProps {
  /** flows to register — import only the ones your demo needs */
  flows: FlowDef[];
  /** e.g. 'home/home' or 'pdp/detail' */
  initialRoute?: Route;
  initialParams?: Record<string, unknown>;
  /** wrap in an iPhone frame (default true) */
  frame?: boolean;
  scale?: number;
  rtl?: boolean;
  /** global token overrides (rebrand / A-B a colour across every flow) */
  tokens?: TokenOverrides;
  emptyCart?: boolean;
  reducedMotion?: 'never' | 'always' | 'user';
  onRouteChange?: (route: Route, stack: StackEntry[]) => void;
  /** imperatively reset from outside (playground) */
  resetSignal?: { route: Route; params?: Record<string, unknown>; nonce: number };
}

/**
 * Drop-in prototype player. In any React app:
 *
 *   import { NoonPrototype, homeFlow, plpFlow, pdpFlow, cartFlow } from '@noon/flow-kit';
 *   import '@noon/flow-kit/style.css';
 *   <NoonPrototype flows={[homeFlow, plpFlow, pdpFlow, cartFlow]} initialRoute="home/home" />
 */
export function NoonPrototype({ flows, initialRoute, initialParams, frame = true, scale = 1, rtl, tokens, emptyCart, reducedMotion = 'never', onRouteChange, resetSignal }: NoonPrototypeProps) {
  const registry = useMemo(() => createRegistry(flows), [flows]);
  const start = initialRoute ?? `${flows[0].id}/${flows[0].initial}`;
  const [screenTone, setScreenTone] = useState<StatusBarTone>('dark');
  const [topRoute, setTopRoute] = useState<Route>();
  // runtime overrides per route (useStatusBar); they only apply while that route is the top screen
  const [overrides, setOverrides] = useState<Record<string, StatusBarTone>>({});
  const setOverride = useCallback(
    (route: string, tone: StatusBarTone | undefined) =>
      setOverrides((o) => {
        if (o[route] === tone) return o;
        const next = { ...o };
        if (tone) next[route] = tone;
        else delete next[route];
        return next;
      }),
    [],
  );
  const statusBar = (topRoute && overrides[topRoute]) || screenTone;

  const onChange = useCallback(
    (stack: StackEntry[]) => {
      const top = [...stack].reverse().find((e) => e.presentation !== 'sheet') ?? stack.at(-1);
      if (top) {
        setScreenTone(registry.resolve(top.route)?.screen.statusBar ?? 'dark');
        setTopRoute(top.route);
        onRouteChange?.(stack.at(-1)!.route, stack);
      }
    },
    [registry, onRouteChange],
  );

  return (
    <NoonThemeProvider overrides={tokens} rtl={rtl}>
      <MotionConfig reducedMotion={reducedMotion}>
        <DemoStoreProvider emptyCart={emptyCart}>
          <PhoneFrame frameless={!frame} scale={scale} statusBar={statusBar}>
            <StatusBarCtx.Provider value={setOverride}>
              <Navigator registry={registry} initialRoute={start} initialParams={initialParams} onChange={onChange} resetSignal={resetSignal} />
            </StatusBarCtx.Provider>
          </PhoneFrame>
        </DemoStoreProvider>
      </MotionConfig>
    </NoonThemeProvider>
  );
}
