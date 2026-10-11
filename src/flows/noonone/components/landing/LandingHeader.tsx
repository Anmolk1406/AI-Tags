import { motion, useTransform, type MotionValue } from 'motion/react';
import chevronLeft from '../../../../assets/vip/chevron-left-rounded.svg';
import { Pressable } from '../../../../components';
import { NOON_ONE } from '../../data.landing';
import { landingTokens } from '../../tokens';
import styles from './landing.module.css';

/** VIPLandingScreen.renderHeader: white shadow2 bg + "noon One" title fade in over the first 20px of scroll. */
export function LandingHeader({ scrollY, onBack }: { scrollY: MotionValue<number>; onBack: () => void }) {
  const opacity = useTransform(scrollY, [0, landingTokens.headerFadeEnd], [0, 1], { clamp: true });
  return (
    <div className={styles.headerWrapper}>
      <motion.div className={styles.headerBg} style={{ opacity }} />
      <div className={styles.header}>
        <Pressable className={styles.backButton} scale={1} whileTap={{ opacity: 0.2 }} onClick={onBack} aria-label="Back">
          <img className={styles.backIcon} src={chevronLeft} alt="" />
        </Pressable>
        <motion.div style={{ opacity }}>
          <span className={styles.headerTitle}>{NOON_ONE}</span>
        </motion.div>
      </div>
    </div>
  );
}
