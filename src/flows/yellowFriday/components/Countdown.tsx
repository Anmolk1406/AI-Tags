import { useState } from 'react';
import { Text } from '../../../components';
import { useInterval } from '../../../motion/useInterval';
import styles from './Countdown.module.css';

/** "Picks refresh in 29 : 53 : 10": three dark tiles, tabular digits, ticking once a second while the screen is on top. */
export function Countdown({ label, seconds = 29 * 3600 + 53 * 60 + 10 }: { label: string; seconds?: number }) {
  const [s, setS] = useState(seconds);
  useInterval(1000, () => setS((x) => (x > 0 ? x - 1 : 0)), s > 0);
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0'));
  return (
    <div className={styles.countdown} role="timer" aria-label={`${label} ${parts.join(':')}`}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      {parts.map((p, i) => (
        <span key={i} className={styles.countdownGroup}>
          {i > 0 && (
            <Text variant="bodyBold" color="textPrimary">
              :
            </Text>
          )}
          <span className={styles.countdownTile}>{p}</span>
        </span>
      ))}
    </div>
  );
}
