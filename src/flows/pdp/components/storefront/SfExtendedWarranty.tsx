import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { OriginIcon, Pressable, type OriginIconName } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { tween } from '../../../../motion/presets';
import partnerLogo from '@assets/pdp/storefront/c/protect4less-logo.webp';
import { pdpSfcTokens } from '../../tokens.sfC';
import { Card } from '../Card';
import styles from './SfExtendedWarranty.module.css';
import { useReduceMotion } from '../../../../motion/reducedMotion';
import { useInterval } from '../../../../motion/useInterval';
import { money } from '../../../../data';
import type { PdpContent, WarrantyPlan } from '../../../../data/views/pdp';
import { sfCopy } from '../../../../data/copy/pdp';


/** USP meaning → Origin glyph (New PDP 64:5731: Date / Delivery icons, the accident glyph in the middle). */
const uspIcon: Record<WarrantyPlan['usps'][number]['icon'], OriginIconName> = {
  date: 'calendar-check',
  liquid: 'water-drop',
  accident: 'warning-triangle',
  delivery: 'truck-noon',
};

/** "by PROTECT4LESS" → USP lines, rotating (y 8 → 0 / −8, tween fast) — Figma "USPs animation_final". */
function UspTicker() {
  const lines = sfCopy.warranty.usps.length + 1;
  const [i, setI] = useState(0);
  const reduce = useReduceMotion();
  // reduced motion: the first line stays (no auto-rotation); paused while the PDP is covered (useInterval)
  useInterval(pdpSfcTokens.tickerMs, () => setI((n) => (n + 1) % lines), !reduce);
  return (
    <span className={styles.ticker} aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={i} className={styles.tickerLine} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={tween('fast', 'out')}>
          {i === 0 ? (
            <>
              {sfCopy.warranty.by}
              <img alt={sfCopy.a11y.protect4less} src={partnerLogo} className={styles.partnerLogo} />
            </>
          ) : (
            sfCopy.warranty.usps[i - 1]
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Storefront "Extended warranty" (Figma 3499:75479 "Details"): white r16 card, p12, gap 12; 15/700 title + rotating
 * partner/USP ticker; a scroll row (gap 12) of 270-wide plan cards — alice-blue r12 frame with a 12/700 sapphire
 * validity line over a white r12 card: 40px creative + name 14/500 + 16px chevron, three 12/16 USP rows (16px icons),
 * then a top-bordered footer with the 16/700 price and a "Select" outline button (r8, padding 8·24).
 * Selecting toggles one plan. No previous component: new section (no SD data yet — plans are derived).
 */
export function SfExtendedWarranty({ content }: { content: PdpContent }) {
  const nav = useNav();
  const [selected, setSelected] = useState<string>();
  // electronics-style products only (the view gives plans when the SD shipping items carry a warranty row)
  const plans = content.warrantyPlans;
  if (!plans.length) return null;
  const toggle = (p: WarrantyPlan) => {
    const on = selected !== p.id;
    setSelected(on ? p.id : undefined);
    nav.toast(on ? sfCopy.warranty.added(p.name) : sfCopy.warranty.removed(p.name));
  };
  return (
    <Card contentGap={12}>
      <div className={styles.head}>
        <h3 className={styles.title}>{sfCopy.warranty.title}</h3>
        <UspTicker />
      </div>
      <div className={styles.row}>
        {plans.map((p) => (
          <div key={p.id} className={styles.plan}>
            <span className={styles.validity}>{p.validity}</span>
            <div className={styles.planCard}>
              <button type="button" className={styles.name} onClick={() => nav.toast(p.name)}>
                <img alt="" src={p.creative} className={styles.creative} />
                <span className={styles.nameText} aria-label={p.name}>
                  <span className={styles.nameLine}>{p.lines[0]}</span>
                  <span className={styles.nameLast}>
                    {p.lines[1]}
                    <OriginIcon name="chevron-right" size={16} color="var(--nk-color-text-legacy)" className="pdp-flip" />
                  </span>
                </span>
              </button>
              <div className={styles.usps}>
                {p.usps.map((u) => (
                  <div key={u.text} className={styles.usp}>
                    <OriginIcon name={uspIcon[u.icon]} size={18} color="var(--nk-palette-secondary-text-color)" />
                    <span className={styles.uspText}>{u.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>{money(p.price)}</span>
                <Pressable className={styles.select} data-selected={selected === p.id || undefined} aria-pressed={selected === p.id} onClick={() => toggle(p)}>
                  {selected === p.id ? sfCopy.warranty.selected : sfCopy.warranty.select}
                </Pressable>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
