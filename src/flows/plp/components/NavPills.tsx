import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { plpTokens } from '../tokens';

/**
 * NoonPLPLoadingMotion chip reveal: each chip drops from translateY −20 and fades in,
 * delay 200ms + index×50ms, spring 280.6/27.14.
 */
export function RevealChip({ index, children }: { index: number; children: ReactNode }) {
  const { delay, stagger, spring } = plpTokens.chipReveal;
  return (
    <motion.span
      style={{ display: 'inline-flex', flexShrink: 0 }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ y: { ...spring, delay: delay + index * stagger }, opacity: { duration: 0.189, ease: [0.645, 0.045, 0.355, 1], delay: delay + index * stagger } }}
    >
      {children}
    </motion.span>
  );
}
