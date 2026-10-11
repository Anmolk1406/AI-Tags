import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { MarketplaceTag, MarketplaceWordmark, Pressable } from '../../../components';
import { tween } from '../../../motion/presets';
import { plpTokens } from '../tokens';
import styles from '../plp.module.css';

export type MarketplaceId = keyof typeof plpTokens.marketplaces;
const tabs: { id: MarketplaceId; label: string; logo: ReactNode }[] = [
  { id: 'noon', label: 'noon', logo: <MarketplaceWordmark kind="noon" height={18} /> },
  { id: 'supermall', label: 'supermall', logo: <MarketplaceTag kind="supermall" height={19} /> },
  { id: 'express', label: 'express', logo: <MarketplaceTag kind="express" height={19} /> },
  { id: 'global', label: 'Global', logo: <MarketplaceTag kind="global" height={19} /> },
  { id: 'minutes', label: 'Minutes', logo: <MarketplaceTag kind="minutes" height={17} /> },
];

/**
 * Marketplace tabs (Legacy→new PLP 82:17411): five 96px tabs, gap 12, a 22px logo slot over a 16px subtitle
 * clip whose three lines (A, B, A) tick upward every 7.2s, 140ms apart per tab — the repeated first line
 * makes the loop seamless. The selected tab has a 96×3 ink bar that slides between tabs.
 */
export function MarketplaceStrip({ active, onSelect }: { active: MarketplaceId; onSelect: (id: MarketplaceId) => void }) {
  const t = plpTokens.ticker;
  return (
    <nav className={`nk-hscroll ${styles.mps}`} aria-label="Marketplaces">
      {tabs.map((tab, i) => {
        const m = plpTokens.marketplaces[tab.id];
        return (
          <Pressable key={tab.id} className={styles.mp} scale={0.96} onClick={() => onSelect(tab.id)} aria-current={tab.id === active || undefined} aria-label={tab.label}>
            <span className={styles.mpLogo}>{tab.logo}</span>
            <span className={styles.mpSub} aria-hidden>
              <motion.span
                className={styles.mpTick}
                animate={{ y: [0, 0, -t.row, -t.row, -2 * t.row, -2 * t.row] }}
                transition={{ duration: t.period, times: [0, 0.4, 0.48, 0.88, 0.96, 1], ease: [0.65, 0, 0.35, 1], repeat: Infinity, delay: t.start + i * t.lag }}
              >
                <i style={{ color: m.colorA }}>{m.a}</i>
                <i style={{ color: m.colorB }}>{m.b}</i>
                <i style={{ color: m.colorA }}>{m.a}</i>
              </motion.span>
            </span>
            {tab.id === active && <motion.i layoutId="plp-mp-tab" className={styles.mpBar} transition={tween('base', 'out')} />}
          </Pressable>
        );
      })}
    </nav>
  );
}
