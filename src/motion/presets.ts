import type { Transition } from 'motion/react';

type Bezier = [number, number, number, number];

/**
 * Central motion tokens. Every animation in the kit reads from here,
 * so tuning a curve or a spring changes the feel of all flows at once.
 * Values mirror what bappzaar uses with reanimated (withTiming / withSpring).
 */
export const easing = {
  /** Easing.out(Easing.cubic) — default for UI entering */
  out: [0.215, 0.61, 0.355, 1] as Bezier,
  /** Easing.inOut(Easing.cubic) */
  inOut: [0.645, 0.045, 0.355, 1] as Bezier,
  /** Easing.in(Easing.cubic) — elements leaving */
  in: [0.55, 0.055, 0.675, 0.19] as Bezier,
  /** Easing.bezier(0.25, 0.1, 0.25, 1) — RN default ease */
  standard: [0.25, 0.1, 0.25, 1] as Bezier,
  /** iOS-like navigation curve */
  ios: [0.32, 0.72, 0, 1] as Bezier,
  /** Easing.out(Easing.back(1.5)) — playful overshoot */
  backOut: [0.34, 1.56, 0.64, 1] as Bezier,
};

export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  medium: 0.3,
  slow: 0.45,
  slower: 0.6,
};

export const spring = {
  /** buttons / press feedback */
  press: { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 },
  /** sheets, drawers — reanimated withSpring({ damping: 20, stiffness: 200 }) */
  sheet: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
  /** badges, counters, hearts */
  bouncy: { type: 'spring', stiffness: 400, damping: 14 },
  /** default layout animations */
  gentle: { type: 'spring', stiffness: 170, damping: 26 },
} satisfies Record<string, Transition>;

export const tween = (d: keyof typeof duration = 'base', e: keyof typeof easing = 'out'): Transition => ({
  duration: duration[d],
  ease: easing[e],
});

/** Press scale used by AnimatedPressable in bappzaar (scale 0.96) */
export const pressScale = 0.96;
