import type { TargetAndTransition, Transition } from 'motion/react';
import { duration, easing, spring } from './presets';

/**
 * Screen transitions. A transition describes how a screen enters (initial → animate),
 * leaves (exit) and how the screen *underneath* reacts while it is covered (under).
 *
 * Add your own with `registerTransition('my-flip', {...})` from anywhere — e.g. in a
 * flow's index.ts — then use it with `nav.push('pdp/detail', params, { transition: 'my-flip' })`.
 */
export interface ScreenTransition {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  /** applied to the screen below while this one is on top */
  under?: TargetAndTransition;
  transition: Transition;
}

const iosCurve: Transition = { duration: 0.42, ease: easing.ios };

const builtIn = {
  push: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    under: { x: '-28%', filter: 'brightness(0.92)' },
    transition: iosCurve,
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.base, ease: easing.standard },
  },
  'fade-up': {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
    transition: { duration: duration.medium, ease: easing.out },
  },
  modal: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    under: { scale: 0.94, borderRadius: 24, filter: 'brightness(0.85)' },
    transition: iosCurve,
  },
  zoom: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: spring.gentle,
  },
  sheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: spring.sheet,
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 },
  },
} satisfies Record<string, ScreenTransition>;

export type BuiltInTransition = keyof typeof builtIn;
// eslint-disable-next-line @typescript-eslint/ban-types
export type TransitionName = BuiltInTransition | (string & {});

const registry = new Map<string, ScreenTransition>(Object.entries(builtIn));

export function registerTransition(name: string, t: ScreenTransition) {
  registry.set(name, t);
}

export function getTransition(name: TransitionName): ScreenTransition {
  return registry.get(name) ?? builtIn.push;
}

export function listTransitions() {
  return [...registry.keys()];
}
