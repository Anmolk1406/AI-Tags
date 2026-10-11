import { registerTransition } from '../transitions';
import { easing, spring } from '../presets';

/**
 * Put your own screen transitions here. They're registered on import (see src/index.ts)
 * and usable from any flow:  nav.push('pdp/detail', params, { transition: 'card-flip' })
 * or as a screen default:    { id: 'detail', transition: 'scale-up', ... }
 */

registerTransition('card-flip', {
  initial: { rotateY: 90, opacity: 0, transformPerspective: 1200 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
  under: { opacity: 0.6 },
  transition: { duration: 0.5, ease: easing.inOut },
});

registerTransition('scale-up', {
  initial: { scale: 0.85, opacity: 0, borderRadius: 40 },
  animate: { scale: 1, opacity: 1, borderRadius: 0 },
  exit: { scale: 0.85, opacity: 0, borderRadius: 40 },
  under: { scale: 0.96, filter: 'brightness(0.9)' },
  transition: spring.gentle,
});

registerTransition('slide-left', {
  // the noon search push: spring 280.6 / 27.14, underlying screen drifts 200/382 of the width
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  under: { x: '-52%' },
  transition: { type: 'spring', stiffness: 280.6, damping: 27.14, mass: 1 },
});
