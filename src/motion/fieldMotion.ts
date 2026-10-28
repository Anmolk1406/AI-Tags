/**
 * Field Design System motion tokens (github.com/ayaneshu/field-design-system @ 13229e7,
 * packages/tokens/src/semantic.ts → motion.spring), as motion/react springs. Used where a screen opts in to Field
 * motion (e.g. `sheet: { motion: 'field' }`); everything else keeps presets.ts / noonMotion.ts.
 */
export const fieldSpring = {
  /** springLight (tension 300 / friction 28): M-BottomSheet entry + exit, scrim fade, drag snap-back, M-Switch slot */
  light: { type: 'spring', stiffness: 300, damping: 28, mass: 1, restDelta: 0.01 },
  /** springBouncy (tension 280 / friction 18) */
  bouncy: { type: 'spring', stiffness: 280, damping: 18, mass: 1, restDelta: 0.01 },
} as const;

/** Field M-BottomSheet (packages/components/src/BottomSheet/BottomSheet.tsx) gesture constants. */
export const fieldSheet = {
  /** grabber pull-down past this many px dismisses on release */
  closeDragThreshold: 60,
  /** the scrim fades out fully over this much pull-down */
  scrimFadeDistance: 200,
} as const;
