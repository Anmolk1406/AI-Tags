import type { ComponentType, ReactNode } from 'react';
import type { TokenOverrides } from '../foundations/tokens';
import type { TransitionName } from '../motion/transitions';

/** `flowId/screenId`, e.g. `pdp/detail`. A bare `screenId` resolves inside the current flow. */
export type Route = string;

export type Presentation =
  /** full-screen page pushed on the stack */
  | 'screen'
  /** bottom sheet over the current screen, with scrim + drag-to-dismiss */
  | 'sheet'
  /** full-screen modal sliding up from the bottom */
  | 'modal';

export interface ScreenProps<P = Record<string, unknown>> {
  params: P;
}

export type ScreenTruth = 'bappzaar' | 'figma' | 'mixed' | 'reference';

export interface ScreenDef<P = any> {
  id: string;
  title: string;
  component: ComponentType<ScreenProps<P>>;
  presentation?: Presentation;
  /** default transition when this screen is opened; can be overridden per navigation */
  transition?: TransitionName;
  /** status bar content colour on top of this screen */
  statusBar?: 'dark' | 'light';
  /** default params used when the screen is opened from the playground sidebar */
  defaultParams?: P;
  /** shown in the playground notes panel — what this screen demonstrates */
  notes?: string;
  /** where this was ported from: bappzaar master path(s), `Figma <fileKey> · <node>`, or `reference: <what the user shared>` */
  source?: string;
  /**
   * Which reference wins when they disagree. `bappzaar` = the RN app on master is the spec (layout, values, behaviour);
   * `figma` = the Figma frame in `source` is the spec; `mixed` = Figma for the look, bappzaar for behaviour (spell out
   * per area in the flow's MAPPING.md / FIGMA-MAPPING.md); `reference` = something the user shared. Omitted → inferred
   * from `source` (see `screenTruth` in kit/registry.ts). On a conflict the agent asks; it never silently picks.
   */
  truth?: ScreenTruth;
  /** last date (YYYY-MM-DD) the screen was compared against its reference, side by side */
  verified?: string;
  /** where Back goes when this screen is the only one in the stack (opened directly / by URL); overrides FlowDef.parent */
  parent?: Route;
  /** extra URL names for this screen, e.g. `['homepage']` → open it at `/homepage` (see kit/routes.ts) */
  path?: string | string[];
}

export interface FlowDef {
  id: string;
  title: string;
  description?: string;
  /** playground sidebar grouping, e.g. "Shopping", "Post-order", "Profile" */
  group?: string;
  initial: string;
  screens: ScreenDef[];
  /** flow-scoped token overrides — only affect screens of this flow */
  tokens?: TokenOverrides;
  /** screen rendered behind a sheet/modal route when it is opened directly (default: `initial`) */
  sheetBackdrop?: Route;
  /** where Back goes from this flow's screens when they're opened directly (no history). Default: home, except tab roots (no back). */
  parent?: Route;
  /** show the bottom tab bar on these screens */
  tabBar?: { tab: TabId; screens: string[] };
}

export type TabId = 'home' | 'categories' | 'deals' | 'account' | 'cart';

export interface NavigateOptions {
  transition?: TransitionName;
  presentation?: Presentation;
}

export interface StackEntry {
  key: string;
  route: Route; // always fully qualified flow/screen
  params: Record<string, unknown>;
  presentation: Presentation;
  transition: TransitionName;
}

export interface ToastOptions {
  icon?: ReactNode;
  action?: { label: string; onPress: () => void };
  duration?: number;
  tone?: 'default' | 'success' | 'error';
}
