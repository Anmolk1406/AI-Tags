import { motion } from 'motion/react';
import { Icon, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';
import { ref } from '../../../foundations/tokens';
import { palette } from '../../../foundations/palette';
import { useReduceMotion } from '../../../motion/reducedMotion';

const floaters = [
  { x: '18%', y: '22%', size: 26, delay: 0, dur: 3.2 },
  { x: '76%', y: '16%', size: 20, delay: 0.6, dur: 2.8 },
  { x: '82%', y: '44%', size: 16, delay: 1.1, dur: 3.6 },
  { x: '12%', y: '48%', size: 18, delay: 0.3, dur: 3 },
];

/** Wishlist empty state — floating hearts stand in for the looping noonWishlistV2EmptyLottie. */
export function EmptyState() {
  const nav = useNav();
  const e = wishlistTokens.empty;
  // reduced motion: the hearts hold still (MotionConfig would drop the float but keep the opacity loop)
  const reduce = useReduceMotion();
  return (
    <div className={styles.empty}>
      <div className={styles.emptyArt}>
        <span className={styles.emptyBlob} />
        {floaters.map((f, i) => (
          <motion.span
            key={i}
            style={{ position: 'absolute', left: f.x, top: f.y, display: 'flex' }}
            animate={reduce ? { opacity: 0.75 } : { y: [0, -12, 0], rotate: [0, i % 2 ? 10 : -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon name="heart" size={f.size} color={palette.pink600} fill={palette.pink600} strokeWidth={0} />
          </motion.span>
        ))}
        <motion.span
          className={styles.bigHeart}
          animate={reduce ? undefined : { y: [0, -10, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="heart" size={96} color={palette.white} fill={palette.pink600} strokeWidth={1.2} />
        </motion.span>
      </div>
      <motion.div className={styles.emptyText} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 22 }}>
        <h2 style={{ font: ref.type('titleLarge'), color: e.title }}>Nothing saved yet</h2>
        <p style={{ marginTop: 10, maxWidth: 240, font: 'var(--nk-type-wishlist-text15-regular-lh21)', color: e.body }}>Tap the heart on any item you like to start saving!</p>
        <Pressable
          onClick={() => nav.push('search/search')}
          style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8, background: e.cta, color: ref.color('textInverse'), padding: '16px 24px', borderRadius: 12, font: ref.type('text16SemiboldLh20') }}
        >
          <Icon name="plus" size={16} strokeWidth={2.6} />
          Start adding items
        </Pressable>
      </motion.div>
    </div>
  );
}
