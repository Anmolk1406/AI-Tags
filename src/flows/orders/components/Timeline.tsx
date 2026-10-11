import { motion } from 'motion/react';
import { trackingSteps } from '../data';
import { ordersTokens } from '../tokens';
import styles from '../orders.module.css';
import { ref } from '../../../foundations/tokens';

/**
 * Horizontal tracking timeline: 2px #F2F3F7 rail, green gradient progress up to the current step,
 * and a looping pulse (1700ms, cubic in-out, opacity 0→1@12%→1@82%→0) on the active segment.
 */
export function Timeline({ step, dates, gray }: { step: number; dates: string[]; gray?: boolean }) {
  const n = trackingSteps.length - 1;
  const done = (step / n) * 100;
  const next = Math.min(100, ((step + 1) / n) * 100);
  return (
    <div className={styles.timeline}>
      <div className={styles.rail}>
        <motion.div className={styles.railFill} style={{ background: gray ? ordersTokens.progressGray : ordersTokens.progressGreen }} initial={{ width: 0 }} animate={{ width: `${done}%` }} transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }} />
        {!gray && step < n && (
          <motion.div
            className={styles.railPulse}
            style={{ left: `${done}%`, width: `${next - done}%`, background: ordersTokens.progressGreen }}
            animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 1] }}
            transition={{ duration: 1.7, times: [0, 0.12, 0.82, 1], ease: [0.645, 0.045, 0.355, 1], repeat: Infinity }}
            initial={{ originX: 0 }}
          />
        )}
      </div>
      {trackingSteps.map((s, i) => {
        const reached = i <= step;
        return (
          <div key={s.id} className={styles.step}>
            <motion.span
              className={styles.stepIcon}
              style={{ borderColor: reached ? (gray ? ref.palette('bluishGrey') : ordersTokens.eyeReached) : ref.color('borderSubtle'), filter: reached ? 'none' : 'grayscale(1)', opacity: reached ? 1 : 0.6 }}
              animate={i === step && !gray ? { scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 1.7, repeat: Infinity }}
            >
              {s.emoji}
            </motion.span>
            <span className={styles.stepLabel} data-reached={reached || undefined}>
              {s.label}
            </span>
            <span className={styles.stepDate}>{dates[i] ?? ''}</span>
          </div>
        );
      })}
    </div>
  );
}
