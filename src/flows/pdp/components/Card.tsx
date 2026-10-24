import type { ReactNode } from 'react';
import styles from '../pdp.module.css';

/** NoonSectionCard: white, r16, padding 12, margin 0 12 12; optional 16/700 charcoalNavy header. `gap` = the containerStyles gap. */
export function Card({ title, gap, contentGap, className, children }: { title?: string; gap?: 8 | 12 | 16 | 24; contentGap?: 8 | 12 | 16 | 24; className?: string; children: ReactNode }) {
  const g = (n?: number) => (n ? styles[`gap${n}`] : '');
  return (
    <section className={`${styles.card} ${g(gap)} ${className ?? ''}`}>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      <div className={g(contentGap)} style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </section>
  );
}
